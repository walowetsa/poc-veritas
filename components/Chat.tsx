"use client";

import { useState, useRef, useEffect } from "react";
import { ParsedData } from "@/lib/parser";

type Message = {
  id:      string;
  role:    "user" | "assistant";
  content: string;
};

type ChatProps = {
  data: ParsedData;
};

const SUGGESTIONS = [
  "Summarise this dataset for me",
  "What are the top 5 entries by value?",
  "Are there any anomalies or outliers?",
  "What trends can you identify?",
];

export default function Chat({ data }: ChatProps) {
  const [messages,   setMessages]   = useState<Message[]>([]);
  const [input,      setInput]      = useState("");
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef  = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setIsLoading(true);
    setError(null);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        signal:  abortRef.current.signal,
        body: JSON.stringify({
          data,
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        );
      }
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
        {isEmpty ? (
          <Empty data={data} onSuggest={(q) => setInput(q)} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {messages.map((m) => (
              <Message key={m.id} role={m.role} content={m.content} />
            ))}
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <ThinkingIndicator />
            )}
            {error && (
              <p className="font-mono text-xs" style={{ color: "var(--red)", padding: "8px 0" }}>
                {error}
              </p>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask anything about ${data.fileName}...`}
            rows={1}
            style={{
              flex: 1,
              background: "var(--bg-raised)",
              border: "1px solid var(--border-md)",
              borderRadius: 10,
              padding: "10px 14px",
              fontFamily: "DM Sans, sans-serif",
              fontSize: 13,
              color: "var(--text)",
              resize: "none",
              outline: "none",
              lineHeight: 1.6,
              maxHeight: 120,
              overflow: "auto",
              transition: "border-color 0.15s ease",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(201,169,110,0.4)")}
            onBlur={(e)  => (e.target.style.borderColor = "var(--border-md)")}
          />
          <button
            onClick={() => submit(input)}
            disabled={isLoading || !input.trim()}
            style={{
              width: 38, height: 38,
              borderRadius: 10,
              border: "1px solid var(--border-md)",
              background: input.trim() && !isLoading ? "var(--gold-dim)" : "transparent",
              cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.15s ease",
              opacity: !input.trim() || isLoading ? 0.4 : 1,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 12V2M7 2L2 7M7 2L12 7" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className="font-mono text-xs mt-2" style={{ color: "var(--text-dim)" }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function Message({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", padding: "5px 0" }}>
      {!isUser && (
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: "var(--gold-dim)", border: "1px solid rgba(201,169,110,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginRight: 10, marginTop: 2,
        }}>
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path d="M2 11L5 7L8 9L12 3" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      <div style={{
        maxWidth: "78%",
        padding: isUser ? "9px 14px" : "10px 0",
        borderRadius: isUser ? "12px 12px 4px 12px" : 0,
        background: isUser ? "var(--bg-raised)" : "transparent",
        border: isUser ? "1px solid var(--border-md)" : "none",
        fontSize: 13, lineHeight: 1.7,
        color: "var(--text-muted)",
        fontFamily: "DM Sans, sans-serif",
      }}>
        {content ? <MarkdownContent content={content} /> : (
          <span style={{ opacity: 0.4 }}>...</span>
        )}
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6,
        background: "var(--gold-dim)", border: "1px solid rgba(201,169,110,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
          <path d="M2 11L5 7L8 9L12 3" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "var(--text-dim)",
            animation: "pulse-gold 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

function Empty({ data, onSuggest }: { data: ParsedData; onSuggest: (q: string) => void }) {
  return (
    <div style={{ paddingTop: 24, paddingBottom: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "var(--gold-dim)", border: "1px solid rgba(201,169,110,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
        }}>
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M2 11L5 7L8 9L12 3" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ fontSize: 14, color: "var(--text)", fontFamily: "DM Sans, sans-serif", marginBottom: 4 }}>
          Ask me anything about <span style={{ color: "var(--gold)" }}>{data.fileName}</span>
        </p>
        <p className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
          {data.rowCount.toLocaleString()} rows · {data.headers.length} columns
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p className="font-mono text-xs" style={{ color: "var(--text-dim)", marginBottom: 4, letterSpacing: "0.06em" }}>
          SUGGESTIONS
        </p>
        {SUGGESTIONS.map((q) => (
          <button key={q} onClick={() => onSuggest(q)}
            style={{
              textAlign: "left", padding: "10px 14px", borderRadius: 10,
              border: "1px solid var(--border)", background: "var(--bg-subtle)",
              color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif",
              fontSize: 13, cursor: "pointer", transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-md)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        if (line.match(/^[\-\*] /)) {
          return (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 2 }}>
              <span style={{ color: "var(--gold)", marginTop: 2, flexShrink: 0 }}>·</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
        return <div key={i}>{renderInline(line)}</div>;
      })}
    </>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ color: "var(--text)", fontWeight: 500 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} style={{
          fontFamily: "DM Mono, monospace", fontSize: 11,
          background: "var(--bg-raised)", border: "1px solid var(--border)",
          borderRadius: 4, padding: "1px 5px", color: "var(--gold)",
        }}>
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}