export default function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="font-mono text-xs tracking-widest"
        style={{ color: "var(--text-dim)", letterSpacing: "0.1em" }}
      >
        {label.toUpperCase()}
      </span>
      <div className="flex-1" style={{ height: "1px", background: "var(--border)" }} />
    </div>
  );
}