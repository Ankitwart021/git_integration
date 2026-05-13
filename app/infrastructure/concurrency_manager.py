import asyncio
from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

class SonarInstance:
    def __init__(self, url: str, token: str):
        self.url = url
        self.token = token

class ConcurrencyManager:
    """
    Acts as a semaphore while also serving as an instance provider.
    Instead of atomic slots, it maintains a queue of ready SonarQube server profiles.
    """
    def __init__(self):
        instances = settings.parsed_sonar_instances
            
        self._pool = asyncio.Queue()
        for url, token in instances.items():
            self._pool.put_nowait(SonarInstance(url, token))
            logger.info(f"Added SonarQube instance to load-balancer pool: {url}")

    async def acquire(self) -> SonarInstance:
        instance = await self._pool.get()
        logger.debug(f"Acquired SonarQube instance slot: {instance.url}")
        return instance

    def release(self, instance: SonarInstance) -> None:
        self._pool.put_nowait(instance)
        logger.debug(f"Released SonarQube instance slot: {instance.url}")
