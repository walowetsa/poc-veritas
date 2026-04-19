"use client";

import { useEffect } from "react";

type RecordModalProps = {
  record: Record<string, unknown> | null;
  onClose: () => void;
};

export default function RecordModal({ record, onClose }: RecordModalProps) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!record) return null;

  const entries = Object.entries(record);

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
          zIndex: 100,
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
          zIndex: 101,
          width: "100%",
          maxWidth: "520px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          background: "black",
          border: "1px solid var(--border-md)",
          borderRadius: "16px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          animation: "fadeUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
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
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--gold)",
              }}
            />
            <span
              className="font-mono"
              style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.08em" }}
            >
              RECORD · {entries.length} FIELDS
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

        {/* Field list */}
        <div style={{ overflowY: "auto", padding: "8px 0", flex: 1 }}>
          {entries.map(([key, value], i) => {
            const display =
              value === null || value === undefined
                ? null
                : String(value);

            return (
              <div
                key={key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.6fr",
                  gap: 12,
                  padding: "10px 20px",
                  borderBottom:
                    i < entries.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems: "start",
                }}
              >
                <span
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: "var(--text-dim)",
                    letterSpacing: "0.04em",
                    paddingTop: 1,
                    wordBreak: "break-word",
                  }}
                >
                  {key}
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    color: display ? "var(--text)" : "var(--text-dim)",
                    fontStyle: display ? "normal" : "italic",
                    wordBreak: "break-word",
                    lineHeight: 1.6,
                  }}
                >
                  {display ?? "—"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            className="font-mono"
            style={{
              width: "100%",
              padding: "8px",
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
            Close
          </button>
        </div>
      </div>
    </>
  );
}