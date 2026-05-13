from app.infrastructure.job_store import InMemoryJobStore
from app.infrastructure.job_queue import InMemoryJobQueue
from app.infrastructure.concurrency_manager import ConcurrencyManager
from app.infrastructure.id_generator import VerificationIdGenerator
from app.services.verification_service import VerificationService
from app.services.scan_executor import ScanExecutor
from app.services.result_builder import ResultBuilder
from app.services.sonar_status_service import SonarStatusService
from app.services.callback_client import CallbackClient
from app.services.verification_worker import VerificationWorker
from app.integrations.sonar_scanner_client import SonarScannerClient
from app.integrations.sonar_result_fetcher import SonarResultFetcher

job_store = InMemoryJobStore()
job_queue = InMemoryJobQueue()
concurrency_manager = ConcurrencyManager()
status_service = SonarStatusService()
scanner_client = SonarScannerClient()
result_fetcher = SonarResultFetcher()
result_builder = ResultBuilder()
callback_client = CallbackClient()

scan_executor = ScanExecutor(
    scanner_client=scanner_client,
    result_fetcher=result_fetcher,
    status_service=status_service,
    result_builder=result_builder,
    job_store=job_store   # kept for future use
)

verification_service = VerificationService(
    store=job_store,
    queue=job_queue,
    id_generator=VerificationIdGenerator
)

worker = VerificationWorker(
    queue=job_queue,
    store=job_store,
    concurrency_manager=concurrency_manager,
    scan_executor=scan_executor,
    callback_client=callback_client
)

def get_verification_service() -> VerificationService:
    return verification_service

def get_status_service() -> SonarStatusService:
    return status_service
