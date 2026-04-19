"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Dashboard from "@/components/Dashboard";
import PreviewTable from "@/components/PreviewTable";
import SectionLabel from "@/components/SectionLabel";
import { ParsedData } from "@/lib/parser";
import { DashboardConfig } from "@/app/api/dashboard/route";
import { getActiveDataset, saveDashboardForDataset } from "@/lib/storage";

type DashState = "loading" | "ready" | "error";

export default function DashboardPage() {
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [data,      setData]      = useState<ParsedData | null>(null);
  const [dashboard, setDashboard] = useState<DashboardConfig | null>(null);
  const [dashState, setDashState] = useState<DashState>("loading");
  const [dashError, setDashError] = useState<string | null>(null);
  const initialisedFor = useRef<string | null>(null);

  const generateDashboard = useCallback(async (id: string, parsed: ParsedData) => {
    setDashState("loading");
    setDashError(null);
    try {
      const res  = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: parsed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to generate dashboard");
      const config = json.dashboard as DashboardConfig;
      saveDashboardForDataset(id, config);
      setDashboard(config);
      setDashState("ready");
    } catch (err: unknown) {
      setDashError(err instanceof Error ? err.message : "Something went wrong");
      setDashState("error");
    }
  }, []);

  useEffect(() => {
    const active = getActiveDataset();
    if (!active) return;

    // Re-initialise whenever the active dataset changes
    if (initialisedFor.current === active.id) return;
    initialisedFor.current = active.id;

    setDatasetId(active.id);
    setData(active.data);

    if (active.dashboard) {
      setDashboard(active.dashboard);
      setDashState("ready");
    } else {
      generateDashboard(active.id, active.data);
    }
  });

  return (
    <div className="px-10 py-10 space-y-8">
      <SectionLabel label="Dashboard" />

      {dashState === "loading" && (
        <div className="rounded-xl p-16 text-center space-y-3 animate-fade-in"
          style={{ border: "1px dashed var(--border-md)" }}>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full pulse-gold" style={{ background: "var(--gold)" }} />
            <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>Analysing your data</p>
          </div>
          <p className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>Usually takes 5–10 seconds</p>
        </div>
      )}

      {dashState === "error" && (
        <div className="rounded-xl p-10 text-center space-y-4 animate-fade-in"
          style={{ border: "1px dashed rgba(224,92,92,0.25)" }}>
          <p className="font-mono text-xs" style={{ color: "var(--red)" }}>{dashError}</p>
          {data && datasetId && (
            <button onClick={() => generateDashboard(datasetId, data)}
              className="font-mono text-xs px-4 py-2 rounded-lg transition-all hover:opacity-80"
              style={{ border: "1px solid var(--border-md)", color: "var(--text-muted)" }}>
              Retry
            </button>
          )}
        </div>
      )}

      {dashState === "ready" && dashboard && data && (
        <div className="animate-fade-up space-y-10">
          <Dashboard config={dashboard} />
          <hr className="divider" />
          <div className="space-y-5">
            <SectionLabel label="Preview" />
            <PreviewTable data={data} relevantColumns={dashboard.relevantColumns ?? []} />
          </div>
        </div>
      )}
    </div>
  );
}