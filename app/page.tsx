"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDatasets } from "@/lib/storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (getDatasets().length > 0) {
      router.replace("/dashboard");
    } else {
      router.replace("/upload");
    }
  }, [router]);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }} className="flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full pulse-gold" style={{ background: "var(--gold)" }} />
        <p className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>Loading...</p>
      </div>
    </main>
  );
}