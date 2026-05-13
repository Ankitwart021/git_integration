from app.domain.models import VerificationJob
from app.domain.enums import JobStatus
from app.domain.schemas import ErrorInfo, IssueDiff
from app.integrations.sonar_scanner_client import SonarScannerClient
from app.integrations.sonar_result_fetcher import SonarResultFetcher
from app.services.sonar_status_service import SonarStatusService
from app.services.result_builder import ResultBuilder
from app.infrastructure.job_store import InMemoryJobStore
from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)


class ScanExecutor:
    def __init__(
        self,
        scanner_client: SonarScannerClient,
        result_fetcher: SonarResultFetcher,
        status_service: SonarStatusService,
        result_builder: ResultBuilder,
        job_store: InMemoryJobStore
    ):
        self.scanner_client = scanner_client
        self.result_fetcher = result_fetcher
        self.status_service = status_service
        self.result_builder = result_builder
        self.job_store = job_store

    async def execute_scan(self, job: VerificationJob) -> None:
        try:
            job.status = JobStatus.RUNNING

            success = await self.scanner_client.run_scan(
                job.path,
                job.project_key,
                job.sonar_url,
                job.sonar_token,
                project_name=job.project_name or ""
            )

            if not success:
                job.status = JobStatus.FAILED
                job.error_info = ErrorInfo(code="SCAN_FAILED", message="Sonar scanner execution failed")
                job.result = self.result_builder.build_failure_result(job, job.error_info)
                return

            job.status = JobStatus.WAITING_FOR_SONAR
            # Register project_key → verification_id BEFORE waiting
            # so the webhook controller can resolve the incoming project_key
            self.status_service.register_waiter(job.verification_id, project_key=job.project_key)
            try:
                webhook_payload = await self.status_service.wait_for_completion(
                    verification_id=job.verification_id,
                    timeout=settings.scan_timeout
                )
            except Exception as e:
                job.status = JobStatus.FAILED
                job.error_info = ErrorInfo(code="WEBHOOK_TIMEOUT", message="Timed out waiting for SonarQube webhook", details=str(e))
                job.result = self.result_builder.build_failure_result(job, job.error_info)
                return

            task_status = webhook_payload.get("status", "")
            if task_status != "SUCCESS":
                job.status = JobStatus.FAILED
                job.error_info = ErrorInfo(code="SONAR_TASK_FAILED", message=f"SonarQube task failed: {task_status}")
                job.result = self.result_builder.build_failure_result(job, job.error_info)
                return

            job.status = JobStatus.FETCHING_RESULTS

            # ── Fetch base results ──────────────────────────────────────────────
            metrics               = await self.result_fetcher.fetch_metrics(job.project_key, job.sonar_url, job.sonar_token)
            vulnerabilities       = await self.result_fetcher.fetch_vulnerabilities(job.project_key, job.sonar_url, job.sonar_token)
            critical_issues       = await self.result_fetcher.fetch_bugs_and_code_smells(job.project_key, job.sonar_url, job.sonar_token)
            all_issues_for_report = await self.result_fetcher.fetch_all_issues(job.project_key, job.sonar_url, job.sonar_token)
            hotspots              = await self.result_fetcher.fetch_hotspots(job.project_key, job.sonar_url, job.sonar_token)

            # Callback payload: all vulns + CRITICAL/BLOCKER bugs and code smells
            all_issues = vulnerabilities + critical_issues

            # ── Scan version + SonarQube-native comparison ─────────────────────
            # project_analyses/search returns analyses newest-first.
            # len(analyses) after THIS scan tells us the 0-indexed version.
            analyses = await self.result_fetcher.fetch_project_analyses(
                job.project_key, job.sonar_url, job.sonar_token
            )
            job.scan_version = max(0, len(analyses) - 1)   # v0 = first, v1 = second, ...

            diff: IssueDiff | None = None

            if len(analyses) >= 2:
                # Previous analysis date (analyses[1] is the one before this scan)
                prev_analysis_date = analyses[1].get("date", "")
                logger.info(
                    f"[{job.verification_id}] v{job.scan_version} — "
                    f"comparing vs analysis at {prev_analysis_date}"
                )
                try:
                    # NEW issues: open issues created AFTER the previous analysis
                    new_issues = await self.result_fetcher.fetch_new_issues_since(
                        job.project_key, job.sonar_url, job.sonar_token,
                        created_after=prev_analysis_date
                    )
                    # RESOLVED issues: FIXED/REMOVED with status change AFTER previous analysis
                    resolved_issues = await self.result_fetcher.fetch_resolved_issues_since(
                        job.project_key, job.sonar_url, job.sonar_token,
                        updated_after=prev_analysis_date
                    )
                    # PERSISTING: total open - new
                    total_open = metrics.bugs + metrics.vulnerabilities + metrics.code_smells
                    persisting_count = max(0, total_open - len(new_issues))

                    diff = IssueDiff(
                        previous_verification_id=analyses[1].get("key", "unknown"),
                        new_issues=new_issues,
                        resolved_issues=resolved_issues,
                        persisting_issue_count=persisting_count
                    )
                    logger.info(
                        f"[{job.verification_id}] Diff: "
                        f"+{len(new_issues)} new | "
                        f"-{len(resolved_issues)} resolved | "
                        f"{persisting_count} persisting"
                    )
                except Exception as diff_err:
                    logger.error(f"[{job.verification_id}] SonarQube comparison failed: {diff_err}")
            else:
                logger.info(
                    f"[{job.verification_id}] v0 — first scan for '{job.project_name}'. "
                    f"No previous analysis to compare against."
                )

            # ── Build result ────────────────────────────────────────────────────
            job.status = JobStatus.COMPLETED
            job.result = self.result_builder.build_success_result(
                job, metrics, all_issues, hotspots,
                report_issues=all_issues_for_report
            )
            job.result.diff = diff

            # ── Generate versioned report: ProjectName_v0.docx, _v1.docx, etc. ─
            from app.reports.report_generator import report_generator
            report_generator.generate(job.result)

        except Exception as e:
            logger.exception(f"Unexpected error executing scan for {job.verification_id}")
            job.status = JobStatus.FAILED
            job.error_info = ErrorInfo(code="INTERNAL_ERROR", message="An unexpected internal error occurred", details=str(e))
            job.result = self.result_builder.build_failure_result(job, job.error_info)
