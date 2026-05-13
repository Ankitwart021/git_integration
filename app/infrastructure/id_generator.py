import uuid

class VerificationIdGenerator:
    """Generates unique IDs for verification jobs."""
    @staticmethod
    def generate() -> str:
        return str(uuid.uuid4())
