/**
 * Version History Utilities
 * -------------------------
 * Helper functions for the Version History panel.
 * Transforms raw version data into user-friendly display values.
 */

/**
 * Converts an ISO date string into a human-readable relative time.
 *
 * Rules:
 *  - < 1 min   → "Just now"
 *  - < 1 hour  → "X minutes ago"
 *  - < 24 hrs  → "X hours ago"
 *  - Yesterday  → "Yesterday at HH:MM AM/PM"
 *  - < 7 days  → "Weekday at HH:MM AM/PM"
 *  - Otherwise → "MMM DD, YYYY"
 */
export const formatRelativeTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return `Yesterday at ${timeStr}`;
  }

  // < 7 days → weekday name
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 7) {
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    return `${weekday} at ${timeStr}`;
  }

  // Older → absolute date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Converts an ISO date string to a full absolute timestamp.
 * e.g. "Mar 24, 2026 at 10:15 PM"
 */
export const formatAbsoluteTime = (isoString: string): string => {
  const date = new Date(isoString);
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} at ${timePart}`;
};

/**
 * Transforms raw version comments into user-friendly summaries.
 *
 * Rules:
 *  - Contains "force sync" → "Synced changes"
 *  - Contains "synced"     → "Synced changes"
 *  - Contains "rolled back" or "rollback" → "Restored from Version X"
 *  - null / empty → "No description available"
 *  - Otherwise → pass through as-is
 */
export const humanizeComment = (comment: string | null | undefined): string => {
  if (!comment || comment.trim() === "") return "No description available";

  const lower = comment.toLowerCase();

  if (lower.includes("force sync")) return "Synced changes";
  if (lower.includes("synced")) return "Synced changes";

  if (lower.includes("rolled back") || lower.includes("rollback")) {
    const versionMatch = comment.match(/(\d+)/);
    if (versionMatch) return `Restored from Version ${versionMatch[1]}`;
    return "Restored from previous version";
  }

  return comment;
};

/**
 * Determines the badge type for a version card.
 */
export type VersionBadge = "current" | "original" | "synced" | "rollback" | null;

export const getVersionBadge = (
  version: string,
  isCurrent: boolean,
  comment: string | null | undefined
): VersionBadge => {
  if (isCurrent) return "current";
  if (version === "1") return "original";

  if (comment) {
    const lower = comment.toLowerCase();
    if (lower.includes("rollback") || lower.includes("rolled back")) return "rollback";
    if (lower.includes("sync")) return "synced";
  }

  return null;
};

/**
 * Badge display config
 */
export const BADGE_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  current: { label: "Current", className: "vp-badge--current" },
  original: { label: "Original", className: "vp-badge--original" },
  synced: { label: "Synced", className: "vp-badge--synced" },
  rollback: { label: "Rollback Point", className: "vp-badge--rollback" },
};
