from pydantic import BaseModel
from typing import List, Dict, Optional
from app.domain.schemas import IssueDiff  # reuse the domain IssueDiff directly


class RankedIssue(BaseModel):
    rank: int
    severity: str
    issue_detail: str
    recurrence: int
    locations: Dict[str, List[int]]  # file_path -> list of line_numbers


class ReportSummary(BaseModel):
    bugs: int
    vulnerabilities: int
    code_smells: int
    security_hotspots: int


class ReportData(BaseModel):
    verification_id: str
    project_name: Optional[str] = None
    summary: ReportSummary
    bugs_reliability: List[dict]
    security_vulnerabilities: List[dict]
    top_maintainability_issues: List[RankedIssue]
    security_hotspots: List[dict]
    diff: Optional[IssueDiff] = None   # scan comparison — None means first scan
