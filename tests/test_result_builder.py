import pytest
from app.services.result_builder import ResultBuilder
from app.domain.models import VerificationJob
from app.domain.schemas import QualityMetrics, Issue, ErrorInfo
from app.domain.enums import JobStatus

def test_build_success_result():
    job = VerificationJob(
        verification_id="v1",
        job_id="j1",
        path="/path",
        language="python",
        callback_url="http://test",
        project_key="prefix-v1"
    )
    metrics = QualityMetrics(bugs=2)
    issues = [Issue(type="BUG", severity="MAJOR", message="test")]
    
    result = ResultBuilder.build_success_result(job, metrics, issues)
    assert result.status == JobStatus.COMPLETED
    assert result.metrics.bugs == 2
    assert len(result.issues) == 1

def test_build_failure_result():
    job = VerificationJob(
        verification_id="v1",
        job_id="j1",
        path="/path",
        language="python",
        callback_url="http://test",
        status=JobStatus.FAILED
    )
    error = ErrorInfo(code="ERR", message="msg")
    
    result = ResultBuilder.build_failure_result(job, error)
    assert result.status == JobStatus.FAILED
    assert result.dashboard_url is None
