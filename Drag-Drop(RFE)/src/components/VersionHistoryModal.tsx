/**
 * VersionHistoryModal Component
 * -----------------------------
 * A polished version history panel that allows users to browse saved versions
 * and restore the application to a previous state.
 *
 * Replaces the old technical rollback modal in Navbar2.tsx with a clean,
 * user-friendly design inspired by Figma/GitHub/Google Docs.
 */
import React, { useState, useMemo } from "react";
import "../versionHistory.css";
import {
  formatRelativeTime,
  formatAbsoluteTime,
  humanizeComment,
  getVersionBadge,
  BADGE_CONFIG,
} from "../utils/versionHelpers";

interface VersionData {
  version: string;
  modified_by?: string;
  modified_from?: string;
  modified_at: string;
  comment?: string;
}

interface VersionHistoryModalProps {
  versions: VersionData[];
  currentBaseVersion?: string;
  isRestoring: boolean;
  onClose: () => void;
  onRestore: (version: string) => void;
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  versions,
  currentBaseVersion,
  isRestoring,
  onClose,
  onRestore,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [confirmationStep, setConfirmationStep] = useState<"select" | "confirm">("select");

  // Sort versions descending (newest first)
  const sortedVersions = useMemo(
    () =>
      [...versions].sort(
        (a, b) => parseInt(b.version) - parseInt(a.version)
      ),
    [versions]
  );

  const toggleExpand = (version: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(version)) next.delete(version);
      else next.add(version);
      return next;
    });
  };

  const handleCardClick = (version: string, isCurrent: boolean) => {
    if (isCurrent) return;
    setSelectedVersion(version);
    setConfirmationStep("select");
  };

  const handleRestoreClick = () => {
    setConfirmationStep("confirm");
  };

  const handleConfirmRestore = () => {
    onRestore(selectedVersion);
  };

  const selectedVersionData = sortedVersions.find(
    (v) => v.version === selectedVersion
  );

  const isCurrentSelected =
    currentBaseVersion?.toString() === selectedVersion;

  return (
    <div className="vh-overlay" onClick={onClose}>
      <div className="vh-modal" onClick={(e) => e.stopPropagation()}>
        {/* Restoring overlay */}
        {isRestoring && (
          <div className="vh-restoring-overlay">
            <div className="vh-spinner" />
            <span className="vh-restoring-text">
              Restoring Version {selectedVersion}…
            </span>
          </div>
        )}

        {/* Header */}
        <div className="vh-header">
          <div className="vh-header-content">
            <h5 className="vh-title">
              <i className="fa fa-history vh-title-icon" />
              Version History
              {versions.length > 0 && (
                <span className="vh-version-count">
                  ({versions.length} version{versions.length !== 1 ? "s" : ""})
                </span>
              )}
            </h5>
            <p className="vh-subtitle">
              Restore your app to a previous saved state
            </p>
          </div>
          <button
            className="vh-close-btn"
            onClick={onClose}
            aria-label="Close version history"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="vh-body">
          {versions.length === 0 ? (
            <div className="vh-empty">
              <div className="vh-empty-icon">
                <i className="fa fa-inbox" />
              </div>
              <p className="vh-empty-text">No saved versions yet</p>
            </div>
          ) : (
            <>
              {sortedVersions.map((v) => {
                const isCurrent =
                  currentBaseVersion?.toString() === v.version?.toString();
                const isSelected = selectedVersion === v.version;
                const isExpanded = expandedVersions.has(v.version);
                const badge = getVersionBadge(v.version, isCurrent, v.comment);
                const badgeConfig = badge ? BADGE_CONFIG[badge] : null;
                const comment = humanizeComment(v.comment);
                const isEmptyComment = comment === "No description available";

                return (
                  <div
                    key={v.version}
                    className={[
                      "vh-card",
                      isCurrent ? "vh-card--current" : "",
                      isSelected && !isCurrent ? "vh-card--selected" : "",
                      isCurrent ? "vh-card--disabled" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleCardClick(v.version, isCurrent)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Saved Version ${v.version}${isCurrent ? ", current version" : ""}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCardClick(v.version, isCurrent);
                      }
                    }}
                  >
                    {/* Top row: version label + badge */}
                    <div className="vh-card-top">
                      <div className="vh-card-left">
                        <h6 className="vh-version-label">
                          Saved Version {v.version}
                        </h6>
                        {isSelected && !isCurrent && (
                          <i className="fa fa-check-circle vh-selected-check" />
                        )}
                      </div>
                      {badgeConfig && (
                        <span className={`vp-badge ${badgeConfig.className}`}>
                          {badgeConfig.label}
                        </span>
                      )}
                    </div>

                    {/* Meta: author + time */}
                    <div className="vh-card-meta">
                      <i className="fa fa-user-circle vh-card-meta-icon" />
                      <span className="vh-meta-author">
                        Updated by {v.modified_by || "System"}
                      </span>
                      <span className="vh-card-meta-sep">·</span>
                      <span className="vh-meta-time">
                        {formatRelativeTime(v.modified_at)}
                      </span>
                    </div>

                    {/* Comment */}
                    <p
                      className={`vh-card-comment ${isEmptyComment ? "vh-card-comment--empty" : ""}`}
                    >
                      "{comment}"
                    </p>

                    {/* Expand toggle */}
                    <button
                      className="vh-expand-btn"
                      onClick={(e) => toggleExpand(v.version, e)}
                      aria-label={
                        isExpanded
                          ? "Hide version details"
                          : "Show version details"
                      }
                    >
                      <i
                        className={`fa fa-chevron-right vh-expand-chevron ${isExpanded ? "vh-expand-chevron--open" : ""}`}
                      />
                      {isExpanded ? "Hide details" : "View details"}
                    </button>

                    {/* Expanded details */}
                    <div
                      className={`vh-details ${isExpanded ? "vh-details--open" : ""}`}
                    >
                      <div className="vh-details-inner">
                        <div className="vh-detail-row">
                          <i className="fa fa-calendar" />
                          <span>{formatAbsoluteTime(v.modified_at)}</span>
                        </div>
                        {v.modified_from && (
                          <div className="vh-detail-row">
                            <i className="fa fa-code-fork" />
                            <span>
                              Updated from v{v.modified_from} → v{v.version}
                            </span>
                          </div>
                        )}
                        {v.comment && v.comment !== humanizeComment(v.comment) && (
                          <div className="vh-detail-row">
                            <i className="fa fa-comment-o" />
                            <span>Original: "{v.comment}"</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Single version hint */}
              {versions.length === 1 && (
                <p className="vh-single-version-hint">
                  This is the only available version
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="vh-footer">
          {confirmationStep === "select" ? (
            <>
              {selectedVersion && !isCurrentSelected && (
                <div className="vh-footer-warning">
                  <i className="fa fa-exclamation-triangle" />
                  This will replace your current unsaved changes
                </div>
              )}
              <div className="vh-footer-actions">
                <button className="vh-btn-cancel" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="vh-btn-restore"
                  disabled={
                    !selectedVersion || isCurrentSelected || versions.length <= 1
                  }
                  onClick={handleRestoreClick}
                  aria-label={
                    selectedVersion
                      ? `Restore application to Saved Version ${selectedVersion}`
                      : "Select a version to restore"
                  }
                >
                  <i className="fa fa-undo" />
                  Restore Version
                </button>
              </div>
            </>
          ) : (
            <div className="vh-confirm-panel">
              <p className="vh-confirm-msg">
                You're about to restore{" "}
                <strong>Saved Version {selectedVersion}</strong>
                {selectedVersionData && (
                  <>
                    {" "}from{" "}
                    <strong>
                      
                     Version {currentBaseVersion}
                    </strong>{" "}
                    {/* by{" "}
                    <strong>
                      {selectedVersionData.modified_by || "System"}
                    </strong> */}
                  </>
                )}.
              </p>
              {/* <div className="vh-confirm-warn">
                <i className="fa fa-exclamation-circle" />
                This action cannot be undone.
              </div> */}
              <div className="vh-confirm-actions">
                <button
                  className="vh-btn-back"
                  onClick={() => setConfirmationStep("select")}
                >
                  Go Back
                </button>
                <button
                  className="vh-btn-confirm-restore"
                  onClick={handleConfirmRestore}
                  disabled={isRestoring}
                >
                  {isRestoring ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />
                      Restoring…
                    </>
                  ) : (
                    <>
                      <i className="fa fa-undo" />
                      Yes, Restore v{selectedVersion}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryModal;
