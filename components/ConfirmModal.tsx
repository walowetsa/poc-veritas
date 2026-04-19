"use client";

import { useEffect } from "react";

type ConfirmModalProps = {
  title:       string;
  description: string;
  confirmLabel?: string;
  onConfirm:   () => void;
  onClose:     () => void;
  danger?:     boolean;
};

export default function ConfirmModal({
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
  danger = false,
}: ConfirmModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 200,
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 201,
          width: "100%",
          maxWidth: "400px",
          background: "var(--bg-raised)",
          border: "1px solid var(--border-md)",
          borderRadius: 16,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          animation: "fadeUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: danger ? "var(--red)" : "var(--gold)",
              }}
            />
            <span
              className="font-mono"
              style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.08em" }}
            >
              {title.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 8,
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-dim)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-md)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-dim)";
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 20px 24px" }}>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              fontFamily: "DM Sans, sans-serif",
              lineHeight: 1.7,
            }}
          >
            {description}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "0 20px 20px",
          }}
        >
          <button
            onClick={onClose}
            className="font-mono"
            style={{
              flex: 1,
              padding: "9px",
              borderRadius: 8,
              border: "1px solid var(--border-md)",
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: 11,
              cursor: "pointer",
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.7")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="font-mono"
            style={{
              flex: 1,
              padding: "9px",
              borderRadius: 8,
              border: `1px solid ${danger ? "rgba(224,92,92,0.4)" : "var(--border-md)"}`,
              background: danger ? "rgba(224,92,92,0.1)" : "var(--gold-dim)",
              color: danger ? "var(--red)" : "var(--gold)",
              fontSize: 11,
              cursor: "pointer",
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.7")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}