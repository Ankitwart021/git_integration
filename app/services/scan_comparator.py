"""
scan_comparator.py
Pure comparison logic between two scans of the same project.

Matching key: (type, message, file_path)
Line number is intentionally excluded — if code shifts up/down, the issue
is still considered the same underlying problem.
"""
from typing import List, Tuple, Set
from app.domain.schemas import Issue, IssueDiff


def _issue_key(issue: Issue) -> Tuple[str, str, str]:
    """Unique identity key for an issue, ignoring line number shifts."""
    return (
        (issue.type or "").upper(),
        (issue.message or "").strip(),
        (issue.file_path or "").strip(),
    )


def compare_scans(
    previous_issues: List[Issue],
    current_issues: List[Issue],
    previous_verification_id: str,
) -> IssueDiff:
    """
    Compares two scans and returns a structured diff.

    Args:
        previous_issues: All issues from the previous completed scan (report_issues).
        current_issues:  All issues from the current scan (report_issues).
        previous_verification_id: The verification_id of the previous scan.

    Returns:
        IssueDiff with new, resolved, and persisting issue counts.
    """
    prev_keys: Set[Tuple] = {_issue_key(i) for i in previous_issues}
    curr_keys: Set[Tuple] = {_issue_key(i) for i in current_issues}

    # Build lookup maps for fast retrieval
    curr_map = {_issue_key(i): i for i in current_issues}
    prev_map = {_issue_key(i): i for i in previous_issues}

    new_keys       = curr_keys - prev_keys
    resolved_keys  = prev_keys - curr_keys
    persisting_keys = curr_keys & prev_keys

    new_issues      = [curr_map[k] for k in new_keys]
    resolved_issues = [prev_map[k] for k in resolved_keys]

    # Sort for stable ordering: severity weight desc, then file_path, then message
    _WEIGHT = {"BLOCKER": 5, "CRITICAL": 4, "MAJOR": 3, "MINOR": 2, "INFO": 1}
    _sort_key = lambda i: (-_WEIGHT.get((i.severity or "").upper(), 0), i.file_path or "", i.message or "")

    new_issues.sort(key=_sort_key)
    resolved_issues.sort(key=_sort_key)

    return IssueDiff(
        previous_verification_id=previous_verification_id,
        new_issues=new_issues,
        resolved_issues=resolved_issues,
        persisting_issue_count=len(persisting_keys),
    )
