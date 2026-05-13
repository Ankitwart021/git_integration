import os
from fastapi import HTTPException
from app.domain.schemas import VerificationRequest
from app.config import settings

class RequestValidator:
    @staticmethod
    def validate_verify_request(request: VerificationRequest) -> None:
        if not request.path or not request.path.strip():
            raise HTTPException(status_code=400, detail="Path cannot be empty")
        
        normalized_path = os.path.normpath(request.path)
        if not os.path.exists(normalized_path):
            raise HTTPException(status_code=400, detail=f"Path does not exist: {request.path}")
            
        if not os.path.isdir(normalized_path):
            raise HTTPException(status_code=400, detail=f"Path is not a directory: {request.path}")
            
        if not os.access(normalized_path, os.R_OK):
            raise HTTPException(status_code=403, detail=f"Path is not readable: {request.path}")

        if not request.job_id or not request.job_id.strip():
            raise HTTPException(status_code=400, detail="Job ID cannot be empty")
            
        if request.language.strip().lower() not in settings.parsed_supported_languages:
            raise HTTPException(status_code=400, detail=f"Language '{request.language}' is not supported. Supported: {settings.supported_languages}")
