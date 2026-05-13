import os
from datetime import datetime, timezone
import json
from app.domain.models import VerificationResult
from app.reports.issue_classifier import classify_issues
from app.reports.issue_ranker import rank_code_smells
from app.reports.report_formatter import format_report_data
from app.reports.docx_exporter import export_to_docx
from app.utils.logging import get_logger

logger = get_logger(__name__)

# Absolute export directory: d:/verificationService/exports/
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EXPORT_DIR = os.path.join(_BASE_DIR, "exports")


class ReportGenerator:
    def __init__(self):
        os.makedirs(EXPORT_DIR, exist_ok=True)
        logger.info(f"Report export directory ready: {EXPORT_DIR}")

    def generate(self, result: VerificationResult) -> str:
        """
        Classify, rank, format, and export both JSON and DOCX reports
        to d:/verificationService/exports/{job_id}.[json|docx].

        Returns the path to the generated DOCX file, or '' on failure.
        """
        try:
            # Use report_issues — ALL issues (all types, all severities)
            # This is separate from result.issues which is the filtered callback payload.
            bugs, vulnerabilities, code_smells = classify_issues(result.report_issues or [])
            hotspots = result.hotspots or []
            ranked_smells = rank_code_smells(code_smells)
            report_data = format_report_data(result, vulnerabilities, bugs, ranked_smells, hotspots)

            # Build versioned file stem: "ProjectName_v0", "ProjectName_v1", etc.
            safe_name = (
                (result.project_name or "").strip()
                .replace(" ", "-").replace("/", "-").replace("\\", "-")
            )
            version_tag = f"v{result.scan_version}"
            if safe_name:
                file_stem = f"{safe_name}_{version_tag}"
            else:
                file_stem = f"{result.job_id}_{version_tag}" if result.job_id else version_tag

            # --- Save JSON ---
            json_path = os.path.join(EXPORT_DIR, f"{file_stem}.json")
            try:
                with open(json_path, "w", encoding="utf-8") as f:
                    json.dump(report_data.model_dump(), f, indent=2, ensure_ascii=False)
                logger.info(f"[{result.verification_id}] JSON report saved → {json_path}")
            except Exception as json_err:
                logger.error(f"[{result.verification_id}] Failed to save JSON report: {json_err}")

            # --- Save DOCX ---
            docx_path = os.path.join(EXPORT_DIR, f"{file_stem}.docx")
            try:
                export_to_docx(report_data, docx_path)
            except Exception as docx_err:
                logger.error(f"[{result.verification_id}] Failed to save DOCX report: {docx_err}")
                return ""

            generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
            logger.info(
                f"[REPORT GENERATED] Job: {result.job_id} | "
                f"JSON: {json_path} | "
                f"DOCX: {docx_path} | "
                f"Time: {generated_at}"
            )

            return docx_path

        except Exception as e:
            logger.error(f"[{result.verification_id}] Report generation failed: {e}", exc_info=True)
            return ""


# Singleton — imported and called by scan_executor.py
report_generator = ReportGenerator()
