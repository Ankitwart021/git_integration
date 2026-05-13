from app.domain.models import VerificationJob, VerificationResult
from app.domain.schemas import QualityMetrics, Issue, ErrorInfo, SecurityHotspot
from app.domain.enums import JobStatus
from typing import List

class ResultBuilder:
    @staticmethod
    def build_success_result(
        job: VerificationJob,
        metrics: QualityMetrics,
        issues: List[Issue],
        hotspots: List[SecurityHotspot],
        report_issues: List[Issue] = None
    ) -> VerificationResult:
        dashboard_url = f"{job.sonar_url}/dashboard?id={job.project_key}" if job.project_key and job.sonar_url else None
        
        return VerificationResult(
            verification_id=job.verification_id,
            job_id=job.job_id,
            path=job.path,
            status=JobStatus.COMPLETED,
            project_name=job.project_name,
            scan_version=job.scan_version,
            dashboard_url=dashboard_url,
            metrics=metrics,
            issues=issues,
            report_issues=report_issues or [],
            hotspots=hotspots
        )

    @staticmethod
    def build_failure_result(job: VerificationJob, error_info: ErrorInfo) -> VerificationResult:
        return VerificationResult(
            verification_id=job.verification_id,
            job_id=job.job_id,
            path=job.path,
            status=job.status,
            dashboard_url=None,
            metrics=None,
            issues=None
        )
