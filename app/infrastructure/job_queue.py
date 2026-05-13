import asyncio
from app.domain.models import VerificationJob
from app.utils.logging import get_logger

logger = get_logger(__name__)

class InMemoryJobQueue:
    def __init__(self):
        self._queue: asyncio.Queue = asyncio.Queue()

    async def push(self, job: VerificationJob) -> None:
        await self._queue.put(job)
        logger.debug(f"Pushed job {job.verification_id} to queue.")

    async def pop(self) -> VerificationJob:
        return await self._queue.get()

    def task_done(self) -> None:
        self._queue.task_done()
