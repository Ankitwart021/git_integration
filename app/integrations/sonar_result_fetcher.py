import httpx
from typing import List
from app.domain.schemas import QualityMetrics, Issue, SecurityHotspot
from app.utils.logging import get_logger

logger = get_logger(__name__)

class SonarResultFetcher:
    async def fetch_metrics(self, project_key: str, sonar_url: str, sonar_token: str) -> QualityMetrics:
        url = f"{sonar_url}/api/measures/component"
        auth = (sonar_token, "") if sonar_token else None
        metric_keys = "bugs,vulnerabilities,code_smells,security_hotspots"
        params = {
            "component": project_key,
            "metricKeys": metric_keys
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params, auth=auth)
                response.raise_for_status()
                data = response.json()
                
                measures = data.get("component", {}).get("measures", [])
                metrics_map = {m["metric"]: int(m["value"]) for m in measures}
                
                return QualityMetrics(
                    bugs=metrics_map.get("bugs", 0),
                    vulnerabilities=metrics_map.get("vulnerabilities", 0),
                    code_smells=metrics_map.get("code_smells", 0),
                    security_hotspots=metrics_map.get("security_hotspots", 0)
                )
            except Exception as e:
                logger.error(f"Error fetching metrics for {project_key} from {sonar_url}: {str(e)}")
                return QualityMetrics()

    async def fetch_vulnerabilities(self, project_key: str, sonar_url: str, sonar_token: str) -> List[Issue]:
        """Fetch only VULNERABILITY type issues from SonarQube issues/search API."""
        url = f"{sonar_url}/api/issues/search"
        auth = (sonar_token, "") if sonar_token else None
        params = {
            "componentKeys": project_key,
            "types": "VULNERABILITY",
            "ps": 100,
            "p": 1
        }
        
        issues = []
        async with httpx.AsyncClient() as client:
            try:
                while True:
                    response = await client.get(url, params=params, auth=auth)
                    response.raise_for_status()
                    data = response.json()
                    
                    for raw_issue in data.get("issues", []):
                        issues.append(Issue(
                            file_path=raw_issue.get("component"),
                            line_number=raw_issue.get("line"),
                            type=raw_issue.get("type", "UNKNOWN"),
                            severity=raw_issue.get("severity", "UNKNOWN"),
                            message=raw_issue.get("message", "")
                        ))
                    
                    if params["p"] * params["ps"] >= data.get("paging", {}).get("total", 0):
                        break
                    params["p"] += 1
            except Exception as e:
                logger.error(f"Error fetching vulnerabilities for {project_key} from {sonar_url}: {str(e)}")
                
        return issues

    async def fetch_bugs_and_code_smells(self, project_key: str, sonar_url: str, sonar_token: str) -> List[Issue]:
        """Fetch CRITICAL and BLOCKER level BUGs and CODE_SMELLs from SonarQube issues/search API."""
        url = f"{sonar_url}/api/issues/search"
        auth = (sonar_token, "") if sonar_token else None
        params = {
            "componentKeys": project_key,
            "types": "BUG,CODE_SMELL",
            "severities": "CRITICAL,BLOCKER",
            "ps": 100,
            "p": 1
        }

        issues = []
        async with httpx.AsyncClient() as client:
            try:
                while True:
                    response = await client.get(url, params=params, auth=auth)
                    response.raise_for_status()
                    data = response.json()

                    for raw_issue in data.get("issues", []):
                        issues.append(Issue(
                            file_path=raw_issue.get("component"),
                            line_number=raw_issue.get("line"),
                            type=raw_issue.get("type", "UNKNOWN"),
                            severity=raw_issue.get("severity", "UNKNOWN"),
                            message=raw_issue.get("message", "")
                        ))

                    if params["p"] * params["ps"] >= data.get("paging", {}).get("total", 0):
                        break
                    params["p"] += 1
            except Exception as e:
                logger.error(f"Error fetching bugs/code_smells for {project_key} from {sonar_url}: {str(e)}")

        return issues

    async def fetch_all_issues(self, project_key: str, sonar_url: str, sonar_token: str) -> List[Issue]:
        """Fetch ALL issues (all types, all severities) — used exclusively for report generation."""
        url = f"{sonar_url}/api/issues/search"
        auth = (sonar_token, "") if sonar_token else None
        params = {
            "componentKeys": project_key,
            "ps": 100,
            "p": 1
        }

        issues = []
        async with httpx.AsyncClient() as client:
            try:
                while True:
                    response = await client.get(url, params=params, auth=auth)
                    response.raise_for_status()
                    data = response.json()

                    for raw_issue in data.get("issues", []):
                        issues.append(Issue(
                            file_path=raw_issue.get("component"),
                            line_number=raw_issue.get("line"),
                            type=raw_issue.get("type", "UNKNOWN"),
                            severity=raw_issue.get("severity", "UNKNOWN"),
                            message=raw_issue.get("message", "")
                        ))

                    if params["p"] * params["ps"] >= data.get("paging", {}).get("total", 0):
                        break
                    params["p"] += 1
            except Exception as e:
                logger.error(f"Error fetching all issues for {project_key} from {sonar_url}: {str(e)}")

        return issues

    async def fetch_project_analyses(self, project_key: str, sonar_url: str, sonar_token: str, limit: int = 10) -> list:
        """
        Returns the most recent analyses of a project, newest first.
        Each entry has: { 'key': str, 'date': ISO-8601 str, 'events': list }
        Used to determine the previous analysis date for comparison.
        """
        url = f"{sonar_url}/api/project_analyses/search"
        auth = (sonar_token, "") if sonar_token else None
        params = {"project": project_key, "ps": limit}
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params, auth=auth)
                response.raise_for_status()
                return response.json().get("analyses", [])
            except Exception as e:
                logger.error(f"Error fetching project analyses for {project_key}: {e}")
                return []

    async def fetch_new_issues_since(self, project_key: str, sonar_url: str, sonar_token: str, created_after: str) -> List[Issue]:
        """
        Fetch all currently open issues created AFTER a given ISO-8601 date.
        These are issues that did not exist in the previous analysis — i.e. NEW issues.
        API: GET /api/issues/search?componentKeys=KEY&createdAfter=DATE&resolved=false
        """
        url = f"{sonar_url}/api/issues/search"
        auth = (sonar_token, "") if sonar_token else None
        params = {
            "componentKeys": project_key,
            "createdAfter": created_after,
            "resolved": "false",
            "ps": 100,
            "p": 1
        }
        issues = []
        async with httpx.AsyncClient() as client:
            try:
                while True:
                    response = await client.get(url, params=params, auth=auth)
                    response.raise_for_status()
                    data = response.json()
                    for raw in data.get("issues", []):
                        issues.append(Issue(
                            file_path=raw.get("component"),
                            line_number=raw.get("line"),
                            type=raw.get("type", "UNKNOWN"),
                            severity=raw.get("severity", "UNKNOWN"),
                            message=raw.get("message", "")
                        ))
                    if params["p"] * params["ps"] >= data.get("paging", {}).get("total", 0):
                        break
                    params["p"] += 1
            except Exception as e:
                logger.error(f"Error fetching new issues since {created_after} for {project_key}: {e}")
        return issues

    async def fetch_resolved_issues_since(self, project_key: str, sonar_url: str, sonar_token: str, updated_after: str) -> List[Issue]:
        """
        Fetch issues that were FIXED or REMOVED after a given date.
        Uses updatedAfter which SonarQube sets when an issue status changes (e.g., OPEN → RESOLVED).
        API: GET /api/issues/search?componentKeys=KEY&resolved=true&resolutions=FIXED,REMOVED&updatedAfter=DATE
        """
        url = f"{sonar_url}/api/issues/search"
        auth = (sonar_token, "") if sonar_token else None
        params = {
            "componentKeys": project_key,
            "resolved": "true",
            "resolutions": "FIXED,REMOVED",
            "updatedAfter": updated_after,
            "ps": 100,
            "p": 1
        }
        issues = []
        async with httpx.AsyncClient() as client:
            try:
                while True:
                    response = await client.get(url, params=params, auth=auth)
                    response.raise_for_status()
                    data = response.json()
                    for raw in data.get("issues", []):
                        issues.append(Issue(
                            file_path=raw.get("component"),
                            line_number=raw.get("line"),
                            type=raw.get("type", "UNKNOWN"),
                            severity=raw.get("severity", "UNKNOWN"),
                            message=raw.get("message", "")
                        ))
                    if params["p"] * params["ps"] >= data.get("paging", {}).get("total", 0):
                        break
                    params["p"] += 1
            except Exception as e:
                logger.error(f"Error fetching resolved issues since {updated_after} for {project_key}: {e}")
        return issues

    async def fetch_hotspots(self, project_key: str, sonar_url: str, sonar_token: str) -> List[SecurityHotspot]:
        """Crawl the independent hotspots endpoint to fetch manual review vulnerabilities."""
        url = f"{sonar_url}/api/hotspots/search"
        auth = (sonar_token, "") if sonar_token else None
        params = {
            "projectKey": project_key,
            "ps": 100,
            "p": 1
        }
        
        hotspots = []
        async with httpx.AsyncClient() as client:
            try:
                while True:
                    response = await client.get(url, params=params, auth=auth)
                    response.raise_for_status()
                    data = response.json()
                    
                    for raw_hotspot in data.get("hotspots", []):
                        hotspots.append(SecurityHotspot(
                            file_path=raw_hotspot.get("component"),
                            line_number=raw_hotspot.get("line"),
                            message=raw_hotspot.get("message", ""),
                            security_category=raw_hotspot.get("securityCategory", "UNKNOWN"),
                            vulnerability_probability=raw_hotspot.get("vulnerabilityProbability", "UNKNOWN"),
                            status=raw_hotspot.get("status", "UNKNOWN")
                        ))
                    
                    if params["p"] * params["ps"] >= data.get("paging", {}).get("total", 0):
                        break
                    params["p"] += 1
            except Exception as e:
                logger.error(f"Error fetching hotspots for {project_key} from {sonar_url}: {str(e)}")
                
        return hotspots
