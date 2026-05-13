from pydantic import BaseModel
from typing import Optional, List
from pydantic.networks import AnyHttpUrl

class VerificationRequest(BaseModel):
    path: str
    job_id: str
    language: str
    callback_url: str
    project_name: Optional[str] = None  # Human-readable name shown on SonarQube dashboard

class VerificationAcceptedResponse(BaseModel):
    verification_id: str
    job_id: str
    status: str

class QualityMetrics(BaseModel):
    bugs: int = 0
    vulnerabilities: int = 0
    code_smells: int = 0
    security_hotspots: int = 0

class Issue(BaseModel):
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    type: str
    severity: str
    message: str

class ErrorInfo(BaseModel):
    code: str
    message: str
    details: Optional[str] = None

class SecurityHotspot(BaseModel):
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    message: str
    security_category: str
    vulnerability_probability: str
    status: str

class IssueDiff(BaseModel):
    """Comparison result between this scan and the previous scan of the same project."""
    previous_verification_id: str
    new_issues: List["Issue"]
    resolved_issues: List["Issue"]
    persisting_issue_count: int
