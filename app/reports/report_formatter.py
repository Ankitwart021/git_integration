from typing import List
from app.domain.models import VerificationResult
from app.domain.schemas import Issue, SecurityHotspot
from app.reports.schemas import ReportData, ReportSummary, RankedIssue

def format_report_data(
    result: VerificationResult, 
    vulnerabilities: List[Issue], 
    bugs: List[Issue], 
    ranked_smells: List[RankedIssue], 
    hotspots: List[SecurityHotspot]
) -> ReportData:
    
    metrics = result.metrics
    summary = ReportSummary(
        bugs=metrics.bugs if metrics else len(bugs),
        vulnerabilities=metrics.vulnerabilities if metrics else len(vulnerabilities),
        code_smells=metrics.code_smells if metrics else 0, # total, not top 20
        security_hotspots=metrics.security_hotspots if metrics else len(hotspots)
    )

    bugs_list = []
    for b in bugs:
        bugs_list.append({
            "severity": b.severity,
            "issue_detail": b.message,
            "file_path": b.file_path,
            "line_number": b.line_number
        })
        
    vuln_list = []
    for v in vulnerabilities:
        vuln_list.append({
            "severity": v.severity,
            "issue_detail": v.message,
            "file_path": v.file_path,
            "line_number": v.line_number
        })

    hotspots_list = []
    for h in hotspots:
        hotspots_list.append({
            "severity": h.vulnerability_probability,
            "issue_detail": h.message,
            "file_path": h.file_path,
            "line_number": h.line_number
        })

    return ReportData(
        verification_id=result.verification_id,
        project_name=result.project_name,
        summary=summary,
        bugs_reliability=bugs_list,
        security_vulnerabilities=vuln_list,
        top_maintainability_issues=ranked_smells,
        security_hotspots=hotspots_list,
        diff=result.diff
    )
