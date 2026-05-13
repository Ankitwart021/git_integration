import asyncio
from datetime import datetime, timezone
from app.infrastructure.job_queue import InMemoryJobQueue
from app.infrastructure.job_store import InMemoryJobStore
from app.infrastructure.concurrency_manager import ConcurrencyManager
from app.services.scan_executor import ScanExecutor
from app.services.callback_client import CallbackClient
from app.domain.enums import JobStatus
from app.utils.logging import get_logger

logger = get_logger(__name__)

class VerificationWorker:
    def __init__(
        self,
        queue: InMemoryJobQueue,
        store: InMemoryJobStore,
        concurrency_manager: ConcurrencyManager,
        scan_executor: ScanExecutor,
        callback_client: CallbackClient
    ):
        self.queue = queue
        self.store = store
        self.concurrency_manager = concurrency_manager
        self.scan_executor = scan_executor
        self.callback_client = callback_client
        self._running = False
        self._worker_task = None

    async def start(self):
        self._running = True
        self._worker_task = asyncio.create_task(self._process_queue())
        logger.info("Verification worker started")

    async def stop(self):
        self._running = False
        if self._worker_task:
            self._worker_task.cancel()
            try:
                await self._worker_task
            except asyncio.CancelledError:
                pass
        logger.info("Verification worker stopped")

    async def _process_queue(self):
        while self._running:
            try:
                job = await self.queue.pop()
                if not job:
                    continue
                
                asyncio.create_task(self._run_job_with_semaphore(job))
                self.queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error popping from queue: {str(e)}")
                await asyncio.sleep(1)

    async def _run_job_with_semaphore(self, job):
        instance = None
        try:
            # The acquire acts as both the semaphore AND returns the designated container proxy
            instance = await self.concurrency_manager.acquire()
            job.sonar_url = instance.url
            job.sonar_token = instance.token
            
            job.started_at = datetime.now(timezone.utc)
            self.store.save(job)
            
            await self.scan_executor.execute_scan(job)
            
            job.finished_at = datetime.now(timezone.utc)
            
            job.status = JobStatus.CALLBACK_IN_PROGRESS
            self.store.save(job)
            
            success = await self.callback_client.send_result(job.callback_url, job.result)
            if not success:
                job.status = JobStatus.FAILED
            else:
                job.status = JobStatus.COMPLETED if not job.error_info else JobStatus.FAILED
                
            self.store.save(job)

        except Exception as e:
            logger.exception(f"Worker failed processing job {job.verification_id}")
            job.status = JobStatus.FAILED
            job.finished_at = datetime.now(timezone.utc)
            self.store.save(job)
        finally:
            if instance:
                self.concurrency_manager.release(instance)
