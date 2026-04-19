"use client";

import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { DashboardConfig, ChartConfig } from "@/app/api/dashboard/route";

function fmt(value: unknown): string {
  if (typeof value === "number") {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
    return String(value);
  }
  const s = String(value);
  return s.length > 14 ? s.slice(0, 14) + "…" : s;
}

const tooltipStyle = {
  contentStyle: {
    background: "#1c1c1c",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    fontSize: "11px",
    fontFamily: "DM Mono, monospace",
    color: "#f0ebe0",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  labelStyle: { color: "#8a8070", marginBottom: 4 },
  itemStyle: { color: "#f0ebe0" },
};

const axisStyle = {
  tick: { fontSize: 10, fontFamily: "DM Mono, monospace", fill: "#4a4540" },
};

function ChartCard({ chart }: { chart: ChartConfig }) {
  const { type, title, description, data, dataKey, categoryKey, color } = chart;

  const inner = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 28 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey={categoryKey} {...axisStyle} angle={-30} textAnchor="end" interval={0} tickFormatter={fmt} />
              <YAxis {...axisStyle} tickFormatter={fmt} width={44} />
              <Tooltip {...tooltipStyle} formatter={(v) => [fmt(v), dataKey]} />
              <Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 28 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey={categoryKey} {...axisStyle} angle={-30} textAnchor="end" interval={0} tickFormatter={fmt} />
              <YAxis {...axisStyle} tickFormatter={fmt} width={44} />
              <Tooltip {...tooltipStyle} formatter={(v) => [fmt(v), dataKey]} />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5}
                dot={{ r: 2.5, fill: color, strokeWidth: 0 }} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 28 }}>
              <defs>
                <linearGradient id={`grad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey={categoryKey} {...axisStyle} angle={-30} textAnchor="end" interval={0} tickFormatter={fmt} />
              <YAxis {...axisStyle} tickFormatter={fmt} width={44} />
              <Tooltip {...tooltipStyle} formatter={(v) => [fmt(v), dataKey]} />
              <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5}
                fill={`url(#grad-${chart.id})`} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={data} dataKey={dataKey} nameKey={categoryKey}
                cx="50%" cy="50%" outerRadius={80} innerRadius={36}
                paddingAngle={2}
                label={({ percent = 0 }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((_, i) => (
                  <Cell key={i}
                    fill={`hsl(${(parseInt(color.replace("#",""), 16) / 100 + i * 43) % 360}, 55%, 58%)`}
                    opacity={0.85}
                  />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v) => [fmt(v), dataKey]} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10, fontFamily: "DM Mono, monospace", color: "#8a8070" }} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <p className="text-xs" style={{ color: "var(--text-dim)" }}>Unsupported chart type</p>;
    }
  };

  return (
    <div
      className="rounded-xl p-5 space-y-1 animate-fade-up"
      style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
    >
      <p className="text-sm font-light" style={{ color: "var(--text)" }}>{title}</p>
      <p className="font-mono text-xs mb-4" style={{ color: "var(--text-dim)" }}>{description}</p>
      {inner()}
    </div>
  );
}

export default function Dashboard({ config }: { config: DashboardConfig }) {
  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div
        className="rounded-xl p-5 animate-fade-up"
        style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderLeft: "2px solid var(--gold)" }}
      >
        <p className="font-mono text-xs mb-2" style={{ color: "var(--gold)", opacity: 0.7, letterSpacing: "0.08em" }}>
          AI SUMMARY
        </p>
        <p className="text-sm font-light leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {config.summary}
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config.charts.map((chart, i) => (
          <div key={chart.id} style={{ animationDelay: `${i * 0.08}s` }}>
            <ChartCard chart={chart} />
          </div>
        ))}
      </div>
    </div>
  );
}