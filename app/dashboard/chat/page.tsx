"use client";

import { useEffect, useState, useRef } from "react";
import SectionLabel from "@/components/SectionLabel";
import Chat from "@/components/Chat";
import { ParsedData } from "@/lib/parser";
import { getActiveDataset } from "@/lib/storage";

export default function ChatPage() {
  const [data, setData] = useState<ParsedData | null>(null);
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    const active = getActiveDataset();
    if (!active || active.id === loadedFor.current) return;
    loadedFor.current = active.id;
    setData(active.data);
  });

  return (
    <div className="px-10 py-10 animate-fade-up" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ marginBottom: 24 }}>
        <SectionLabel label="Chat" />
      </div>

      {!data ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="w-1.5 h-1.5 rounded-full pulse-gold" style={{ background: "var(--gold)" }} />
          <p className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>Loading...</p>
        </div>
      ) : (
        <Chat data={data} />
      )}
    </div>
  );
}