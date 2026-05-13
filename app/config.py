from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Dict
import json

class Settings(BaseSettings):
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"

    max_concurrent_scans: int = 3
    supported_languages: str = "python,java,javascript,typescript,go"
    scan_timeout: int = 300
    callback_retry_count: int = 3
    callback_retry_backoff: int = 5

    # JSON Map of SonarQube instances
    sonar_instances: str = "{}"
    sonar_webhook_secret: str = ""
    default_project_key_prefix: str = "vs-verify-"
    report_generator_url: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def parsed_supported_languages(self) -> List[str]:
        return [lang.strip().lower() for lang in self.supported_languages.split(",") if lang.strip()]

    @property
    def parsed_sonar_instances(self) -> Dict[str, str]:
        try:
            instances = json.loads(self.sonar_instances)
            if not isinstance(instances, dict):
                raise ValueError("SONAR_INSTANCES must be a JSON dictionary mapping URLs to Auth Tokens.")
            return instances
        except json.JSONDecodeError:
            raise ValueError(f"Failed to parse SONAR_INSTANCES as JSON: {self.sonar_instances}")

settings = Settings()
