import hmac
import hashlib
from fastapi import APIRouter, Depends, HTTPException, Request
from app.services.sonar_status_service import SonarStatusService
from app.dependencies import get_status_service
from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/sonarqube", tags=["Sonar Webhook"])


@router.post("/webhook")
async def sonar_webhook(
    request: Request,
    payload: dict,
    status_service: SonarStatusService = Depends(get_status_service)
):
    # ── Optional HMAC signature verification ──────────────────────────────
    if settings.sonar_webhook_secret:
        signature = request.headers.get("X-Sonar-Webhook-HMAC-SHA256")
        if not signature:
            raise HTTPException(status_code=401, detail="Missing webhook signature")

        body = await request.body()
        expected = hmac.new(
            settings.sonar_webhook_secret.encode('utf-8'),
            body,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(signature, expected):
            raise HTTPException(status_code=401, detail="Invalid webhook signature")

    # ── Resolve project_key → verification_id ─────────────────────────────
    project_key = payload.get("project", {}).get("key")
    if not project_key:
        logger.warning("Webhook payload missing project key")
        raise HTTPException(status_code=400, detail="Missing project key in payload")

    # Stable project keys (e.g. "vs-my-app") are resolved via the in-memory
    # project_key → verification_id map registered at scan start.
    verification_id = status_service.resolve_verification_id(project_key)
    if not verification_id:
        logger.warning(
            f"Webhook received for project '{project_key}' "
            f"but no active scan is waiting for it."
        )
        raise HTTPException(status_code=400, detail=f"No active scan found for project key: {project_key}")

    logger.info(f"Webhook for project '{project_key}' → job '{verification_id}'")

    success = status_service.signal_completion(verification_id, payload)
    if not success:
        logger.warning(f"Job {verification_id} was found in map but not waiting (already completed?)")

    return {"status": "received"}
