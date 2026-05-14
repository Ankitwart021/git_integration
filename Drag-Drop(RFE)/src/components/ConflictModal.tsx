/**
 * ConflictModal Component
 * -----------------------
 * A guided decision interface for resolving sync conflicts.
 * Users see affected items and choose between keeping local changes
 * or adopting the server version, with a confirm step to prevent accidents.
 *
 * Replaces the old Bootstrap conflict modal in Navbar2.tsx.
 */
import React, { useState, useEffect, useCallback } from "react";
import "../versionHistory.css";

interface ConflictItem {
  unit_type?: string;
  unitType?: string;
  unit_name?: string;
  unitName?: string;
  unit_id?: string;
  unitId?: string;
}

interface ConflictModalProps {
  conflicts: ConflictItem[];
  isResolving: boolean;
  resolveError: string | null;
  onKeepLocal: () => void;
  onUseServer: () => void;
  onClose: () => void;
}

type ConflictOption = "local" | "server" | null;

/**
 * Maps raw unit_type to a readable label and icon class.
 */
const UNIT_TYPE_MAP: Record<string, { label: string; icon: string }> = {
  page: { label: "Page", icon: "fa-file-text-o" },
  resource: { label: "API", icon: "fa-plug" },
  api: { label: "API", icon: "fa-plug" },
  workflow: { label: "Workflow", icon: "fa-project-diagram" },
  enum: { label: "Enum", icon: "fa-list" },
};

const getUnitDisplay = (type: string | undefined) => {
  if (!type) return { label: "Component", icon: "fa-cube" };
  const key = type.toLowerCase();
  return UNIT_TYPE_MAP[key] || { label: type, icon: "fa-cube" };
};

const ConflictModal: React.FC<ConflictModalProps> = ({
  conflicts,
  isResolving,
  resolveError,
  onKeepLocal,
  onUseServer,
  onClose,
}) => {
  const [selectedOption, setSelectedOption] = useState<ConflictOption>(null);

  // Reset selection when modal opens
  useEffect(() => {
    setSelectedOption(null);
  }, [conflicts]);

  // ESC to close (when not resolving)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isResolving) {
        onClose();
      }
    },
    [isResolving, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleConfirm = () => {
    if (!selectedOption || isResolving) return;
    if (selectedOption === "local") onKeepLocal();
    else onUseServer();
  };

  const confirmLabel =
    selectedOption === "local"
      ? "Keep My Changes"
      : selectedOption === "server"
        ? "Use Server Version"
        : "Confirm";

  return (
    <div className="vh-overlay" style={{ zIndex: 1120 }} onClick={!isResolving ? onClose : undefined}>
      <div
        className="vh-modal cm-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Resolve sync conflict"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Resolving overlay */}
        {isResolving && (
          <div className="vh-restoring-overlay">
            <div className="vh-spinner" />
            <span className="vh-restoring-text">Resolving conflict…</span>
          </div>
        )}

        {/* Header */}
        <div className="cm-header">
          <div className="cm-header-content">
            <div className="cm-header-icon">
              <i className="fa fa-exclamation-triangle" />
            </div>
            <div>
              <h5 className="vh-title" style={{ gap: "0" }}>
                We found conflicting changes
              </h5>
              <p className="vh-subtitle">
                This content was updated elsewhere while you were editing.
                Choose how to proceed.
              </p>
            </div>
          </div>
          <button
            className="vh-close-btn"
            onClick={onClose}
            disabled={isResolving}
            aria-label="Close conflict dialog"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="cm-body">
          {/* Affected items section */}
          <div className="cm-section">
            <div className="cm-section-header">
              <span className="cm-section-label">Affected Items</span>
              {conflicts.length > 0 && (
                <span className="cm-section-count">
                  {conflicts.length} item{conflicts.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="cm-conflict-list">
              {conflicts.length > 0 ? (
                conflicts.map((c, idx) => {
                  const unitType = c.unit_type || c.unitType;
                  const unitName = c.unit_name || c.unitName;
                  const display = getUnitDisplay(unitType);

                  return (
                    <div key={idx} className="cm-conflict-item">
                      <div className="cm-conflict-left">
                        <i className={`fa ${display.icon} cm-conflict-icon`} />
                        <span className="cm-conflict-type-badge">
                          {display.label}
                        </span>
                        <span className="cm-conflict-name">
                          {unitName || "Unnamed item"}
                        </span>
                      </div>
                      <span className="cm-conflict-status">Modified</span>
                    </div>
                  );
                })
              ) : (
                <div className="cm-conflict-empty">
                  <p>
                    No specific items could be identified, but a conflict
                    exists.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Decision section */}
          <div className="cm-section">
            <span className="cm-section-label">Choose an option</span>

            {/* Card A: Keep Local */}
            <div
              className={`cm-decision-card ${selectedOption === "local" ? "cm-decision-card--selected" : ""}`}
              onClick={() => !isResolving && setSelectedOption("local")}
              role="radio"
              aria-checked={selectedOption === "local"}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedOption("local");
                }
              }}
            >
              <div className="cm-decision-radio">
                <div className={`cm-radio-dot ${selectedOption === "local" ? "cm-radio-dot--active" : ""}`} />
              </div>
              <div className="cm-decision-content">
                <div className="cm-decision-title">
                  <i className="fa fa-laptop cm-decision-icon" />
                  Keep My Changes
                </div>
                <p className="cm-decision-desc">
                  Overwrite the server with your local version
                </p>
                {selectedOption === "local" && (
                  <span className="cm-decision-consequence cm-consequence--warn">
                    <i className="fa fa-info-circle" /> Server changes will be
                    lost
                  </span>
                )}
              </div>
            </div>

            {/* Card B: Use Server */}
            <div
              className={`cm-decision-card ${selectedOption === "server" ? "cm-decision-card--selected" : ""}`}
              onClick={() => !isResolving && setSelectedOption("server")}
              role="radio"
              aria-checked={selectedOption === "server"}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedOption("server");
                }
              }}
            >
              <div className="cm-decision-radio">
                <div className={`cm-radio-dot ${selectedOption === "server" ? "cm-radio-dot--active" : ""}`} />
              </div>
              <div className="cm-decision-content">
                <div className="cm-decision-title">
                  <i className="fa fa-cloud cm-decision-icon" />
                  Use Server Version
                </div>
                <p className="cm-decision-desc">
                  Discard your edits and use the latest version from the server
                </p>
                {selectedOption === "server" && (
                  <span className="cm-decision-consequence cm-consequence--warn">
                    <i className="fa fa-info-circle" /> Your local changes will
                    be lost
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Inline error */}
          {resolveError && (
            <div className="sm-error">
              <i className="fa fa-exclamation-circle" />
              {resolveError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="vh-footer">
          <div className="vh-footer-actions">
            <button
              className="vh-btn-cancel"
              onClick={onClose}
              disabled={isResolving}
            >
              Cancel
            </button>
            <button
              className="vh-btn-restore"
              onClick={handleConfirm}
              disabled={!selectedOption || isResolving}
              aria-label={selectedOption ? confirmLabel : "Select an option first"}
            >
              {isResolving ? (
                <>
                  <div
                    className="vh-spinner"
                    style={{ width: 16, height: 16, borderWidth: 2 }}
                  />
                  Resolving…
                </>
              ) : (
                <>
                  <i className="fa fa-check" />
                  {confirmLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;
