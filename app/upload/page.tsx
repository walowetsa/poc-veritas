"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";
import { ParsedData } from "@/lib/parser";
import { addDataset, getDatasets, MAX_DATASETS } from "@/lib/storage";

export default function UploadPage() {
  const router = useRouter();

  // If at limit, send back to dashboard
  useEffect(() => {
    if (getDatasets().length >= MAX_DATASETS) {
      router.replace("/dashboard");
    }
  }, [router]);

  function handleUploadSuccess(parsed: ParsedData) {
    addDataset(parsed);
    router.push("/dashboard");
  }

  const count    = getDatasets().length;
  const remaining = MAX_DATASETS - count;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <nav className="flex items-center px-8 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--gold-dim)", border: "1px solid rgba(201,169,110,0.3)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 11L5 7L8 9L12 3" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-serif text-lg tracking-wide" style={{ color: "var(--text)" }}>PRISM</span>
        </div>

        {count > 0 && (
          <button
            onClick={() => router.push("/dashboard")}
            className="ml-auto font-mono text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ border: "1px solid var(--border-md)", color: "var(--text-muted)" }}
          >
            ← Back to dashboard
          </button>
        )}
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20 space-y-12">
        <div className="space-y-3 text-center animate-fade-up">
          <h1 className="font-serif text-5xl" style={{ color: "var(--text)" }}>
            {count === 0 ? (
              <>Your data, <em style={{ color: "var(--gold)" }}>understood.</em></>
            ) : (
              <>Add a <em style={{ color: "var(--gold)" }}>dataset.</em></>
            )}
          </h1>
          <p className="text-sm font-light max-w-md mx-auto" style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
            {count === 0
              ? "Connect your data to get started."
              : `You have ${count} of ${MAX_DATASETS} datasets. ${remaining} slot${remaining === 1 ? "" : "s"} remaining.`}
          </p>
        </div>

        <div className="animate-fade-up animate-fade-up-1">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
    </main>
  );
}