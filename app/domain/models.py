from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from app.domain.enums import JobStatus
from app.domain.schemas import Issue, QualityMetrics, ErrorInfo, SecurityHotspot, IssueDiff

class VerificationResult(BaseModel):
    verification_id: str
    job_id: str
    path: str
    status: JobStatus
    project_name: Optional[str] = None
    scan_version: int = 0
    dashboard_url: Optional[str] = None
    metrics: Optional[QualityMetrics] = None
    issues: Optional[List[Issue]] = None          # filtered: callback payload
    report_issues: Optional[List[Issue]] = None   # unfiltered: report generation only (excluded from callback)
    hotspots: Optional[List[SecurityHotspot]] = None
    diff: Optional[IssueDiff] = None              # comparison vs. previous scan

class VerificationJob(BaseModel):
    verification_id: str
    job_id: str
    path: str
    language: str
    project_name: Optional[str] = None
    scan_version: int = 0
    callback_url: str
    status: JobStatus = JobStatus.QUEUED
    project_key: Optional[str] = None
    sonar_url: Optional[str] = None
    sonar_token: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    result: Optional[VerificationResult] = None
    error_info: Optional[ErrorInfo] = None
