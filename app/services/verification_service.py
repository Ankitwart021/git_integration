import os
import re
from typing import Optional
from app.domain.models import VerificationJob
from app.domain.schemas import VerificationRequest
from app.infrastructure.job_store import InMemoryJobStore
from app.infrastructure.job_queue import InMemoryJobQueue
from app.infrastructure.id_generator import VerificationIdGenerator
from app.domain.enums import JobStatus
from app.config import settings

def _make_stable_project_key(project_name: str) -> str:
    """
    Converts a project_name to a stable SonarQube-compatible project key.
    SonarQube key rules: [a-zA-Z0-9:._-]{1,400}
    Example: 'My App (RFE)' → 'vs-my-app-rfe'
    """
    slug = re.sub(r'[^a-zA-Z0-9._-]', '-', project_name.strip())
    slug = re.sub(r'-+', '-', slug).strip('-').lower()
    return f"vs-{slug[:90]}" if slug else "vs-project"


class VerificationService:
    def __init__(
        self,
        store: InMemoryJobStore,
        queue: InMemoryJobQueue,
        id_generator: type[VerificationIdGenerator]
    ):
        self.store = store
        self.queue = queue
        self.id_generator = id_generator

    async def submit_job(self, request: VerificationRequest) -> VerificationJob:
        ver_id = self.id_generator.generate()

        # 1. Derive human-readable project name first (needed for stable key)
        project_name = (
            request.project_name.strip()
            if request.project_name and request.project_name.strip()
            else os.path.basename(request.path.rstrip("/\\"))
        )

        # 2. Stable project key: same project_name → same SonarQube project
        #    SonarQube tracks all analyses as history under this single project.
        project_key = _make_stable_project_key(project_name)

        job = VerificationJob(
            verification_id=ver_id,
            job_id=request.job_id,
            path=request.path,
            language=request.language,
            project_name=project_name,
            callback_url=str(request.callback_url),
            project_key=project_key,
            status=JobStatus.QUEUED
        )
        
        self.store.save(job)
        await self.queue.push(job)
        return job

    def get_job(self, verification_id: str) -> Optional[VerificationJob]:
        return self.store.get(verification_id)
