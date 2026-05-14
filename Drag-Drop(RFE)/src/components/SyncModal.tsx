/**
 * SyncModal Component
 * -------------------
 * A polished modal that replaces the browser's window.prompt for sync comments.
 * Users enter a description of their changes before syncing with the central server.
 *
 * Features:
 *  - Auto-focused textarea with character counter
 *  - Disabled submit until valid input
 *  - Loading spinner during sync
 *  - Inline error display (no alert())
 *  - Keyboard shortcuts (ESC to close, Ctrl+Enter to submit)
 *  - Focus trap for accessibility
 */
import React, { useState, useRef, useEffect, useCallback } from "react";
import "../versionHistory.css";

interface SyncModalProps {
  isOpen: boolean;
  isSyncing: boolean;
  syncError: string | null;
  onClose: () => void;
  onSync: (comment: string) => void;
}

const MAX_CHARS = 200;

const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  isSyncing,
  syncError,
  onClose,
  onSync,
}) => {
  const [comment, setComment] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const isValid = comment.trim().length > 0;
  const charCount = comment.length;

  // Auto-focus textarea on open
  useEffect(() => {
    if (isOpen) {
      setComment("");
      // Small delay so the modal renders first
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ESC to close, Ctrl+Enter to submit
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSyncing) {
        onClose();
      }
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && isValid && !isSyncing) {
        onSync(comment.trim());
      }
    },
    [isSyncing, isValid, comment, onClose, onSync]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'textarea, button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (isValid && !isSyncing) {
      onSync(comment.trim());
    }
  };

  return (
    <div className="vh-overlay" onClick={!isSyncing ? onClose : undefined}>
      <div
        ref={modalRef}
        className="vh-modal sm-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Sync Changes"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="vh-header">
          <div className="vh-header-content">
            <h5 className="vh-title">
              <i className="fa fa-cloud-upload vh-title-icon" />
              Sync Changes
            </h5>
            <p className="vh-subtitle">
              Add a note so your team knows what changed
            </p>
          </div>
          <button
            className="vh-close-btn"
            onClick={onClose}
            disabled={isSyncing}
            aria-label="Close sync dialog"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="sm-body">
          <div className="sm-textarea-wrapper">
            <textarea
              ref={textareaRef}
              className="sm-textarea"
              placeholder="Describe what changes you made…"
              value={comment}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) {
                  setComment(e.target.value);
                }
              }}
              disabled={isSyncing}
              rows={3}
              aria-label="Sync comment"
            />
            <div className="sm-char-counter">
              <span className={charCount > MAX_CHARS * 0.9 ? "sm-char-warn" : ""}>
                {charCount}
              </span>
              <span className="sm-char-sep"> / </span>
              <span>{MAX_CHARS}</span>
            </div>
          </div>

          {/* Inline error */}
          {syncError && (
            <div className="sm-error">
              <i className="fa fa-exclamation-circle" />
              {syncError}
            </div>
          )}

          {/* Keyboard hint */}
          <div className="sm-hint">
            <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to sync
          </div>
        </div>

        {/* Footer */}
        <div className="vh-footer">
          <div className="vh-footer-actions">
            <button
              className="vh-btn-cancel"
              onClick={onClose}
              disabled={isSyncing}
            >
              Cancel
            </button>
            <button
              className="vh-btn-restore sm-btn-sync"
              onClick={handleSubmit}
              disabled={!isValid || isSyncing}
              aria-label={isValid ? "Sync changes to server" : "Enter a comment to sync"}
            >
              {isSyncing ? (
                <>
                  <div className="vh-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Syncing…
                </>
              ) : (
                <>
                  <i className="fa fa-cloud-upload" />
                  Sync Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncModal;
