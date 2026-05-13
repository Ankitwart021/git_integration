import pytest
from app.infrastructure.job_store import InMemoryJobStore
from app.domain.models import VerificationJob

def test_job_store_save_and_get():
    store = InMemoryJobStore()
    job = VerificationJob(
        verification_id="123",
        job_id="job",
        path="/tmp",
        language="python",
        callback_url="http://test.com"
    )
    store.save(job)
    retrieved = store.get("123")
    assert retrieved is not None
    assert retrieved.job_id == "job"

def test_job_store_get_not_found():
    store = InMemoryJobStore()
    retrieved = store.get("404")
    assert retrieved is None
