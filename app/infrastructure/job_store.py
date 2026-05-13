from typing import Dict, Optional
import threading
from app.domain.models import VerificationJob
from app.utils.logging import get_logger

logger = get_logger(__name__)


class InMemoryJobStore:
    """
    In-memory store for VerificationJob objects.
    Scan history and versioning are now handled by SonarQube natively
    via stable project keys — no need to track previous scan records here.
    """
    def __init__(self):
        self._store: Dict[str, VerificationJob] = {}
        self._lock = threading.Lock()

    def save(self, job: VerificationJob) -> None:
        with self._lock:
            self._store[job.verification_id] = job
            logger.debug(f"Saved job {job.verification_id} to store.")

    def get(self, verification_id: str) -> Optional[VerificationJob]:
        with self._lock:
            return self._store.get(verification_id)
