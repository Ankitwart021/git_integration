import asyncio
from typing import Dict, Optional
from app.utils.logging import get_logger

logger = get_logger(__name__)


class SonarStatusService:
    def __init__(self):
        self._events: Dict[str, asyncio.Event] = {}
        self._result_payloads: Dict[str, dict] = {}
        # Maps stable project_key → verification_id for the currently running scan.
        # With the old UUID-based keys, verification_id could be extracted from the key;
        # with stable keys (e.g. "vs-my-app") this table is the only link.
        self._project_key_map: Dict[str, str] = {}

    def register_waiter(self, verification_id: str, project_key: str = "") -> None:
        if verification_id not in self._events:
            self._events[verification_id] = asyncio.Event()
        if project_key:
            self._project_key_map[project_key] = verification_id
            logger.debug(f"Registered project_key '{project_key}' → verification_id '{verification_id}'")

    async def wait_for_completion(self, verification_id: str, timeout: int) -> dict:
        event = self._events.get(verification_id)
        if not event:
            raise RuntimeError(f"No waiter registered for {verification_id}")

        try:
            logger.info(f"Waiting for SonarQube webhook for job {verification_id} (timeout={timeout}s)")
            await asyncio.wait_for(event.wait(), timeout=timeout)
            payload = self._result_payloads.pop(verification_id, {})
            return payload
        except asyncio.TimeoutError:
            logger.error(f"Timeout waiting for SonarQube webhook for job {verification_id}")
            raise
        finally:
            self._events.pop(verification_id, None)
            # Clean up project_key → verification_id entry
            self._project_key_map = {
                k: v for k, v in self._project_key_map.items()
                if v != verification_id
            }

    def resolve_verification_id(self, project_key: str) -> Optional[str]:
        """Resolve a project_key to its currently-waiting verification_id."""
        return self._project_key_map.get(project_key)

    def signal_completion(self, verification_id: str, payload: dict) -> bool:
        if verification_id in self._events:
            self._result_payloads[verification_id] = payload
            self._events[verification_id].set()
            logger.info(f"Signaled completion for job {verification_id}")
            return True
        logger.warning(f"Webhook received but no waiter found for job {verification_id}")
        return False
