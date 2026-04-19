"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";
import { ParsedData } from "@/lib/parser";
import { addDataset } from "@/lib/storage";

type UploadModalProps = {
  onClose: () => void;
};

export default function UploadModal({ onClose }: UploadModalProps) {
  const router = useRouter();

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

  function handleUploadSuccess(parsed: ParsedData) {
    addDataset(parsed);
    onClose();
    router.push("/dashboard");
  }

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
          maxWidth: "560px",
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
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)" }} />
            <span className="font-mono" style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.08em" }}>
              ADD DATASET
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
        <div style={{ padding: "24px 20px" }}>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
          <p
            className="font-mono text-xs text-center"
            style={{ color: "var(--text-dim)", marginTop: 16 }}
          >
            CSV · XLS · XLSX — stored locally, never sent to a server
          </p>
        </div>
      </div>
    </>
  );
}