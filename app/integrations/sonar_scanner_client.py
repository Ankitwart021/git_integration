import asyncio
import shutil
import subprocess
import sys
import traceback
from app.utils.logging import get_logger

logger = get_logger(__name__)

class SonarScannerClient:
    async def run_scan(self, path: str, project_key: str, sonar_url: str, sonar_token: str, project_name: str = "") -> bool:
        """
        Runs sonar-scanner in the background against a dynamically assigned SonarQube container.
        """
        executable = shutil.which("sonar-scanner")
        if not executable:
            logger.error("Could not find 'sonar-scanner' executable in system PATH.")
            return False

        cmd = [
            executable,
            f"-Dsonar.projectKey={project_key}",
            f"-Dsonar.projectName={project_name or project_key}",
            f"-Dsonar.host.url={sonar_url}",
            f"-Dsonar.working.directory={path}/.scannerwork_{project_key}"
        ]
        
        import os
        if not os.path.exists(os.path.join(path, "sonar-project.properties")):
            cmd.extend([
                f"-Dsonar.sources={path}",
                "-Dsonar.java.binaries=."
            ])
        
        if sonar_token:
            cmd.append(f"-Dsonar.token={sonar_token}")
        
        logger.info(f"Launching sonar-scanner for project {project_key} at {path} against {sonar_url}")
        
        try:
            is_windows = sys.platform == "win32"
            
            if is_windows:
                # On Windows, Uvicorn forcefully overrides the event loop to SelectorEventLoop
                # which explicitly throws NotImplementedError for asyncio subprocesses.
                # To bypass this entirely, we run synchronous subprocess.run inside an async thread pool!
                cmd_str = " ".join([f'"{arg}"' if any(c in arg for c in [' ', '=', '"']) else arg for arg in cmd])
                process = await asyncio.to_thread(
                    subprocess.run,
                    cmd_str,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    cwd=path
                )
            else:
                process = await asyncio.to_thread(
                    subprocess.run,
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    cwd=path
                )
            
            if process.returncode == 0:
                logger.info(f"Sonar scan successful for {project_key} on {sonar_url}")
                return True
            else:
                logger.error(f"Sonar scan failed with exit code {process.returncode} for {project_key}")
                stdout_text = process.stdout.decode('utf-8', errors='replace')
                stderr_text = process.stderr.decode('utf-8', errors='replace')
                logger.error(f"Scanner Output/Error:\n{stdout_text}\n{stderr_text}")
                return False
        except Exception as e:
            logger.error(f"Failed to execute sonar-scanner for {project_key}: {traceback.format_exc()}")
            return False
