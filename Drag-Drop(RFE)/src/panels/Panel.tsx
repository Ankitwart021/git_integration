import { type ReactNode } from "react";
import { X } from "lucide-react";

interface PanelProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Panel({
  title,
  onClose,
  children,
  footer,
  className = "",
}: PanelProps) {
  return (
    <div
      className={`d-flex flex-column bg-white border-start ${className}`}
      style={{
        width: "320px",
        height: "100vh",
        animation: "slideInRight 0.2s ease",
        position: "relative",
      }}
    >
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light">
        <h5 className="m-0">{title}</h5>

        <button
          className="btn btn-light btn-sm"
          onClick={onClose}
          data-testid="button-close-panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* SCROLLABLE BODY */}
      <div
        className="flex-grow-1 overflow-auto"
        style={{ maxHeight: "calc(100vh - 120px)" }}
      >
        <div className="p-3">{children}</div>
      </div>

      {/* FOOTER */}
      {footer && (
        <div className="p-3 border-top bg-light">{footer}</div>
      )}
    </div>
  );
}

/* -------------------------
   ANIMATION (CSS)
-------------------------- */

<style>
{`
@keyframes slideInRight {
  from {
    transform: translateX(40px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
`}
</style>
