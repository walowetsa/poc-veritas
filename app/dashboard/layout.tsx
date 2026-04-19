"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getDatasets } from "@/lib/storage";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router  = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (getDatasets().length === 0) {
      router.replace("/upload");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--bg)" }} className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full pulse-gold" style={{ background: "var(--gold)" }} />
          <p className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <main style={{ marginLeft: "220px", flex: 1, minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}