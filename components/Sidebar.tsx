"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  getDatasets,
  getActiveId,
  setActiveId,
  removeDataset,
  MAX_DATASETS,
  Dataset,
} from "@/lib/storage";
import UploadModal from "@/components/UploadModal";
import ConfirmModal from "@/components/ConfirmModal";
import Link from "next/link";

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    exact: true,
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    href: "/dashboard/data",
    label: "Data",
    exact: false,
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M1 3.5H14M1 7.5H14M1 11.5H14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/dashboard/chat",
    label: "Chat",
    exact: false,
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M2 3C2 2.45 2.45 2 3 2H12C12.55 2 13 2.45 13 3V9C13 9.55 12.55 10 12 10H5L2 13V3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [datasets,     setDatasets]    = useState<Dataset[]>([]);
  const [activeId,     setActive]      = useState<string | null>(null);
  const [uploadOpen,   setUploadOpen]  = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<Dataset | null>(null);

  const refresh = useCallback(() => {
    setDatasets(getDatasets());
    setActive(getActiveId());
  }, []);

  useEffect(() => {
    refresh();
    // Re-sync whenever localStorage changes (other tabs, post-upload)
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [refresh]);

  function handleSwitch(id: string) {
    if (id === activeId) return;
    setActiveId(id);
    setActive(id);
    // Navigate to dashboard root so the new dataset loads fresh
    router.push("/dashboard");
  }

  function handleRemove(e: React.MouseEvent, ds: Dataset) {
    e.stopPropagation();
    setConfirmRemove(ds);
  }

  function confirmRemoveDataset(id: string) {
    removeDataset(id);
    refresh();
    if (id === activeId) router.push("/dashboard");
  }

  const atLimit    = datasets.length >= MAX_DATASETS;
  const activeData = datasets.find((d) => d.id === activeId);

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col"
      style={{ width: "220px", background: "var(--bg-subtle)", borderRight: "1px solid var(--border)", zIndex: 40 }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--gold-dim)", border: "1px solid rgba(201,169,110,0.3)" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 11L5 7L8 9L12 3" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-serif text-lg tracking-wide" style={{ color: "var(--text)" }}>Veritas</span>
      </div>

      {/* Nav links */}
      <nav className="px-3 py-4 space-y-0.5" style={{ borderBottom: "1px solid var(--border)" }}>
        {NAV.map(({ href, label, icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group"
              style={{
                background: isActive ? "var(--bg-raised)" : "transparent",
                border: isActive ? "1px solid var(--border-md)" : "1px solid transparent",
                color: isActive ? "var(--text)" : "var(--text-dim)",
                textDecoration: "none",
              }}
            >
              <span style={{ color: isActive ? "var(--gold)" : "var(--text-dim)" }}>{icon}</span>
              <span className="font-mono text-xs">{label}</span>
              {isActive && <div className="ml-auto w-1 h-1 rounded-full" style={{ background: "var(--gold)" }} />}
            </Link>
          );
        })}
      </nav>

      {/* Dataset list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <p className="font-mono text-xs px-2 pb-2" style={{ color: "var(--text-dim)", letterSpacing: "0.08em" }}>
          DATASETS {datasets.length}/{MAX_DATASETS}
        </p>

        {datasets.map((ds) => {
          const isActive = ds.id === activeId;
          return (
            <div
              key={ds.id}
              onClick={() => handleSwitch(ds.id)}
              className="group flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
              style={{
                background: isActive ? "var(--bg-raised)" : "transparent",
                border: isActive ? "1px solid var(--border-md)" : "1px solid transparent",
              }}
            >
              {/* Active dot */}
              <div
                className="mt-1 w-1.5 h-1.5 rounded-full shrink-0 transition-all"
                style={{ background: isActive ? "var(--gold)" : "var(--text-dim)", opacity: isActive ? 1 : 0.4 }}
              />

              <div className="flex-1 min-w-0">
                <p
                  className="font-mono text-xs truncate"
                  style={{ color: isActive ? "var(--text)" : "var(--text-muted)" }}
                  title={ds.name}
                >
                  {ds.name}
                </p>
                <p className="font-mono text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                  {ds.data.rowCount.toLocaleString()} rows · {timeAgo(ds.uploadedAt)}
                </p>
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => handleRemove(e, ds)}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 hover:text-red-400"
                style={{ color: "var(--text-dim)" }}
                title="Remove dataset"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          );
        })}

        {datasets.length === 0 && (
          <p className="font-mono text-xs px-2 py-2" style={{ color: "var(--text-dim)" }}>
            No datasets yet
          </p>
        )}
      </div>

      {/* Bottom — active file info + add dataset */}
      <div className="px-4 py-4 space-y-2.5" style={{ borderTop: "1px solid var(--border)" }}>
        {activeData && (
          <div
            className="px-3 py-2.5 rounded-lg"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
          >
            <p className="font-mono text-xs truncate" style={{ color: "var(--text-muted)" }} title={activeData.name}>
              {activeData.name}
            </p>
            <p className="font-mono text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
              {activeData.data.rowCount.toLocaleString()} rows · {getStorageDisplay()}
            </p>
          </div>
        )}

        <button
          onClick={() => !atLimit && setUploadOpen(true)}
          disabled={atLimit}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all hover:opacity-80"
          style={{
            border: `1px solid ${atLimit ? "var(--border)" : "var(--border-md)"}`,
            color: atLimit ? "var(--text-dim)" : "var(--text-muted)",
            background: "transparent",
            cursor: atLimit ? "not-allowed" : "pointer",
            opacity: atLimit ? 0.5 : 1,
          }}
          title={atLimit ? `Limit of ${MAX_DATASETS} datasets reached` : "Upload a new dataset"}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1V12M1 6.5H12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span className="font-mono text-xs">
            {atLimit ? `Limit reached (${MAX_DATASETS})` : "Add dataset"}
          </span>
        </button>
      </div>

      {uploadOpen && (
        <UploadModal onClose={() => { setUploadOpen(false); refresh(); }} />
      )}

      {confirmRemove && (
        <ConfirmModal
          title="Remove dataset"
          description={`Remove "${confirmRemove.name}"? This cannot be undone.`}
          confirmLabel="Remove"
          danger
          onConfirm={() => confirmRemoveDataset(confirmRemove.id)}
          onClose={() => setConfirmRemove(null)}
        />
      )}
    </aside>
  );
}

function getStorageDisplay(): string {
  try {
    const raw = localStorage.getItem("veritas:datasets") ?? "";
    const bytes = new Blob([raw]).size;
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
    return `${(bytes / 1_000).toFixed(0)} KB`;
  } catch { return ""; }
}