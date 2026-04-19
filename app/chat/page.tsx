"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import { ParsedData } from "@/lib/parser";

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
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: { data },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)" }}>

      {/* Message list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 0 16px" }}>
        {isEmpty ? (
          <Empty data={data} onSuggest={(q) => {
            handleInputChange({ target: { value: q } } as React.ChangeEvent<HTMLInputElement>);
          }} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {messages.map((m) => (
              <Message key={m.id} role={m.role as "user" | "assistant"} content={m.content} />
            ))}
            {isLoading && <ThinkingIndicator />}
            {error && (
              <div style={{ padding: "12px 16px" }}>
                <p className="font-mono text-xs" style={{ color: "var(--red)" }}>
                  Something went wrong. Please try again.
                </p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: "16px 0 0", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
        >
          <textarea
            value={input}
            onChange={handleInputChange as unknown as React.ChangeEventHandler<HTMLTextAreaElement>}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
              }
            }}
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
            onBlur={(e) => (e.target.style.borderColor = "var(--border-md)")}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: "1px solid var(--border-md)",
              background: input.trim() && !isLoading ? "var(--gold-dim)" : "transparent",
              cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.15s ease",
              opacity: !input.trim() || isLoading ? 0.4 : 1,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 12V2M7 2L2 7M7 2L12 7" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
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
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        padding: "6px 0",
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: "var(--gold-dim)",
            border: "1px solid rgba(201,169,110,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginRight: 10,
            marginTop: 2,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path d="M2 11L5 7L8 9L12 3" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      <div
        style={{
          maxWidth: "78%",
          padding: isUser ? "9px 14px" : "10px 14px",
          borderRadius: isUser ? "12px 12px 4px 12px" : "4px 12px 12px 12px",
          background: isUser ? "var(--bg-raised)" : "transparent",
          border: isUser ? "1px solid var(--border-md)" : "none",
          fontSize: 13,
          lineHeight: 1.7,
          color: "var(--text-muted)",
          fontFamily: "DM Sans, sans-serif",
          whiteSpace: "pre-wrap",
        }}
      >
        <MarkdownContent content={content} />
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
      <div
        style={{
          width: 24, height: 24, borderRadius: 6,
          background: "var(--gold-dim)",
          border: "1px solid rgba(201,169,110,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
          <path d="M2 11L5 7L8 9L12 3" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "var(--text-dim)",
              animation: "pulse-gold 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Empty({ data, onSuggest }: { data: ParsedData; onSuggest: (q: string) => void }) {
  return (
    <div style={{ paddingTop: 32, paddingBottom: 24 }}>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--gold-dim)",
            border: "1px solid rgba(201,169,110,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 14,
          }}
        >
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
          <button
            key={q}
            onClick={() => onSuggest(q)}
            style={{
              textAlign: "left",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--bg-subtle)",
              color: "var(--text-muted)",
              fontFamily: "DM Sans, sans-serif",
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.15s ease",
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

// Minimal markdown renderer — bold, inline code, bullet lists
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <>
      {lines.map((line, i) => {
        // Bullet points
        if (line.match(/^[\-\*] /)) {
          return (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 2 }}>
              <span style={{ color: "var(--gold)", marginTop: 2, flexShrink: 0 }}>·</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        }
        // Blank line
        if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
        // Normal line
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