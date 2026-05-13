from fastapi import APIRouter, Depends, HTTPException, status
from app.domain.schemas import VerificationRequest, VerificationAcceptedResponse
from app.domain.models import VerificationJob
from app.services.verification_service import VerificationService
from app.validators.request_validator import RequestValidator
from app.dependencies import get_verification_service

router = APIRouter(prefix="/api/v1", tags=["Verification"])

@router.post("/verify", status_code=status.HTTP_202_ACCEPTED, response_model=VerificationAcceptedResponse)
async def submit_verification(
    request: VerificationRequest,
    service: VerificationService = Depends(get_verification_service)
):
    RequestValidator.validate_verify_request(request)
    job = await service.submit_job(request)
    
    return VerificationAcceptedResponse(
        verification_id=job.verification_id,
        job_id=job.job_id,
        status=job.status
    )

@router.get(
    "/verify/{verification_id}",
    response_model=VerificationJob,
    response_model_exclude={"result": {"report_issues"}}
)
async def get_verification_status(
    verification_id: str,
    service: VerificationService = Depends(get_verification_service)
):
    job = service.get_job(verification_id)
    if not job:
        raise HTTPException(status_code=404, detail="Verification job not found")
        
    return job
