from typing import List, Tuple
from app.domain.schemas import Issue

def classify_issues(issues: List[Issue]) -> Tuple[List[Issue], List[Issue], List[Issue]]:
    bugs = []
    vulnerabilities = []
    code_smells = []

    for issue in issues:
        type_upper = issue.type.upper()
        if type_upper == "BUG":
            bugs.append(issue)
        elif type_upper == "VULNERABILITY":
            vulnerabilities.append(issue)
        elif type_upper == "CODE_SMELL":
            code_smells.append(issue)
            
    return bugs, vulnerabilities, code_smells
