from typing import List, Dict
from collections import defaultdict
from app.domain.schemas import Issue
from app.reports.schemas import RankedIssue

SEVERITY_WEIGHTS = {
    "BLOCKER": 5,
    "CRITICAL": 4,
    "MAJOR": 3,
    "MINOR": 2,
    "INFO": 1
}

def rank_code_smells(code_smells: List[Issue]) -> List[RankedIssue]:
    # Group by message: { message: { "severity": str, "locations": { file_path: set(lines) }, "count": int } }
    groups = defaultdict(lambda: {
        "severity": "INFO", 
        "max_weight": 0, 
        "count": 0, 
        "locations": defaultdict(set)
    })

    for issue in code_smells:
        msg = issue.message or "Unknown Issue"
        weight = SEVERITY_WEIGHTS.get(issue.severity.upper(), 0)
        
        group = groups[msg]
        group["count"] += 1
        
        if weight > group["max_weight"]:
            group["max_weight"] = weight
            group["severity"] = issue.severity.upper()
            
        file_path = issue.file_path or "Unknown File"
        if issue.line_number:
            group["locations"][file_path].add(issue.line_number)
        else:
            group["locations"][file_path].add(0)  # 0 indicates file-level issue

    # Convert to schema and sort
    results = []
    for msg, data in groups.items():
        # Convert set to sorted list
        dict_locations = { fp: sorted(list(lines)) for fp, lines in data["locations"].items() }
        
        results.append({
            "message": msg,
            "weight": data["max_weight"],
            "count": data["count"],
            "severity": data["severity"],
            "locations": dict_locations
        })

    # Sort strongly by Weight Descending, Count Descending, Message Ascending
    results.sort(key=lambda x: (-x["weight"], -x["count"], x["message"]))

    ranked_issues = []
    for idx, item in enumerate(results):
        ranked_issues.append(RankedIssue(
            rank=idx + 1,
            severity=item["severity"],
            issue_detail=item["message"],
            recurrence=item["count"],
            locations=item["locations"]
        ))
        
    return ranked_issues
