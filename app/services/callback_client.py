import httpx
import asyncio
from app.config import settings
from app.domain.models import VerificationResult
from app.utils.logging import get_logger

logger = get_logger(__name__)

class CallbackClient:
    async def send_result(self, callback_url: str, result: VerificationResult) -> bool:
        retries = settings.callback_retry_count
        backoff = settings.callback_retry_backoff
        
        payload = result.model_dump(mode='json')
        # Exclude report_issues from callback — it is a large internal-only list
        # used for report generation. All other fields (including diff) are sent.
        payload.pop('report_issues', None)
        
        # 1. Fire-and-Forget Secondary Broadcast to Report Generator Service
        if settings.report_generator_url:
            asyncio.create_task(self._broadcast_to_report_generator(payload))
        
        # 2. Synchronous Primary Delivery to LangGraph
        async with httpx.AsyncClient() as client:
            for attempt in range(retries):
                try:
                    response = await client.post(callback_url, json=payload, timeout=10.0)
                    response.raise_for_status()
                    logger.info(f"Successfully sent result to {callback_url}")
                    return True
                except Exception as e:
                    logger.warning(f"Failed to send callback to {callback_url} (Attempt {attempt+1}/{retries}): {str(e)}")
                    if attempt < retries - 1:
                        await asyncio.sleep(backoff)
                        
        logger.error(f"All {retries} attempts failed to send result to {callback_url}")
        return False

    async def _broadcast_to_report_generator(self, payload: dict):
        """Asynchronously drops the JSON payload to the Report Generator Service"""
        try:
            async with httpx.AsyncClient() as client:
                await client.post(settings.report_generator_url, json=payload, timeout=5.0)
                logger.info(f"Successfully broadcasted copied payload to Report Generator: {settings.report_generator_url}")
        except Exception as e:
            logger.error(f"Failed to broadcast payload to Report Generator {settings.report_generator_url}: {str(e)}")
