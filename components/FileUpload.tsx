"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { ParsedData } from "@/lib/parser";

type UploadState = "idle" | "uploading" | "success" | "error";

type FileUploadProps = {
  onUploadSuccess: (data: ParsedData) => void;
};

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setState("uploading");
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setState("success");
      onUploadSuccess(json.data as ParsedData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleReset() {
    setState("idle");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="animate-fade-up w-full max-w-2xl mx-auto">
      <div
        onClick={() => state === "idle" && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        style={{
          background: isDragging ? "rgba(201,169,110,0.04)" : "var(--bg-subtle)",
          borderColor: isDragging
            ? "var(--gold)"
            : state === "error"
            ? "var(--red)"
            : state === "success"
            ? "var(--green)"
            : "var(--border-md)",
          cursor: state === "idle" ? "pointer" : "default",
          transition: "all 0.2s ease",
        }}
        className="relative border rounded-2xl p-16 text-center group"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        {state === "idle" && (
          <div className="space-y-4">
            <div
              className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-200 group-hover:scale-110"
              style={{ background: "var(--gold-dim)", border: "1px solid rgba(201,169,110,0.25)" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L10 13M10 2L6.5 5.5M10 2L13.5 5.5" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 14V16.5C3 17.5 3.67 18 4.5 18H15.5C16.33 18 17 17.5 17 16.5V14" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-light" style={{ color: "var(--text)" }}>
                Drop your file here or{" "}
                <span style={{ color: "var(--gold)" }} className="underline underline-offset-2">browse</span>
              </p>
              <p className="font-mono text-xs mt-2" style={{ color: "var(--text-dim)" }}>
                CSV · XLS · XLSX
              </p>
            </div>
          </div>
        )}

        {state === "uploading" && (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-6"
              style={{ background: "var(--gold-dim)" }}>
              <div className="w-4 h-4 rounded-full pulse-gold" style={{ background: "var(--gold)" }} />
            </div>
            <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>Reading file...</p>
          </div>
        )}

        {state === "success" && (
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-6"
              style={{ background: "rgba(92,184,138,0.1)" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10L8 14L16 6" stroke="#5cb88a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-mono text-xs" style={{ color: "var(--green)" }}>File loaded</p>
            <button
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="font-mono text-xs underline underline-offset-2 mt-2 transition-opacity hover:opacity-70"
              style={{ color: "var(--text-dim)" }}
            >
              Upload different file
            </button>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-6"
              style={{ background: "rgba(224,92,92,0.1)" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 6V10M10 14H10.01" stroke="#e05c5c" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="10" cy="10" r="7" stroke="#e05c5c" strokeWidth="1.5"/>
              </svg>
            </div>
            <p className="font-mono text-xs" style={{ color: "var(--red)" }}>{error}</p>
            <button
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="font-mono text-xs underline underline-offset-2 mt-2 transition-opacity hover:opacity-70"
              style={{ color: "var(--text-dim)" }}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}