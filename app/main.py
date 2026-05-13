import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.utils.logging import setup_logging, get_logger
from app.api import verification_controller, webhook_controller
from app.dependencies import worker

setup_logging()
logger = get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Verification Service")
    await worker.start()
    yield
    logger.info("Shutting down Verification Service")
    await worker.stop()

app = FastAPI(
    title="Verification Service",
    description="Service to manage source code verifications utilizing SonarQube",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(verification_controller.router)
app.include_router(webhook_controller.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
