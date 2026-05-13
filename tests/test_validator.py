import pytest
from fastapi import HTTPException
from app.domain.schemas import VerificationRequest
from app.validators.request_validator import RequestValidator
import os

def test_validator_empty_path():
    req = VerificationRequest(
        path="",
        job_id="123",
        language="python",
        callback_url="http://test.com"
    )
    with pytest.raises(HTTPException) as exc:
        RequestValidator.validate_verify_request(req)
    assert exc.value.status_code == 400

def test_validator_nonexistent_path():
    req = VerificationRequest(
        path="/this/path/does/not/exist/12398j",
        job_id="123",
        language="python",
        callback_url="http://example.com"
    )
    with pytest.raises(HTTPException) as exc:
        RequestValidator.validate_verify_request(req)
    assert exc.value.status_code == 400

def test_validator_unsupported_language():
    os.makedirs("/tmp/test_val_dir", exist_ok=True)
    req = VerificationRequest(
        path="/tmp/test_val_dir",
        job_id="123",
        language="ruby",
        callback_url="http://example.com"
    )
    with pytest.raises(HTTPException) as exc:
        RequestValidator.validate_verify_request(req)
    assert exc.value.status_code == 400
