// Small server-rendered SVG charts, ported from the approved prototype. Colours come from the theme tokens.
import type { CSSProperties, ReactNode } from "react";

export const SOURCE_COLORS: Record<string, string> = { LinkedIn: "var(--c1)", Google: "var(--c2)", Direct: "var(--c3)", GitHub: "var(--c4)", "Twitter/X": "var(--c5)", Reddit: "var(--muted)", Other: "var(--muted)" };
export const sourceColor = (s: string) => SOURCE_COLORS[s] ?? "var(--muted)";

export function AreaChart({ values, labels, id, label }: { values: number[]; labels?: [string, string, string]; id: string; label: string }) {
  const w = 720, h = 190, pad = { l: 34, r: 8, t: 10, b: 24 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const max = Math.max(1, ...values);
  const mag = Math.pow(10, Math.floor(Math.log10(max)));
  const nice = Math.max(4, (Math.ceil((max / mag) * 2) / 2) * mag);
  const X = (i: number) => pad.l + (iw * i) / Math.max(1, values.length - 1);
  const Y = (v: number) => pad.t + ih * (1 - v / nice);
  const line = values.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${X(values.length - 1).toFixed(1)} ${pad.t + ih} L${X(0).toFixed(1)} ${pad.t + ih} Z`;
  const mid = Math.floor((values.length - 1) / 2);
  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--primary)", stopOpacity: 0.32 }} />
          <stop offset="1" style={{ stopColor: "var(--primary)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((k) => {
        const y = pad.t + (ih * k) / 4;
        return (
          <g key={k}>
            <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} style={{ stroke: "var(--line)" }} strokeWidth={1} />
            <text x={pad.l - 8} y={y + 3.5} textAnchor="end">{Math.round(nice * (1 - k / 4))}</text>
          </g>
        );
      })}
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" style={{ stroke: "var(--primary)" }} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={X(values.length - 1)} cy={Y(values[values.length - 1] ?? 0)} r={4.5} style={{ fill: "var(--surface)", stroke: "var(--primary)" }} strokeWidth={2.5} />
      {labels && (
        <>
          <text x={X(0)} y={h - 6} textAnchor="start">{labels[0]}</text>
          <text x={X(mid)} y={h - 6} textAnchor="middle">{labels[1]}</text>
          <text x={X(values.length - 1)} y={h - 6} textAnchor="end">{labels[2]}</text>
        </>
      )}
    </svg>
  );
}

export function HBars({ rows, fmt }: { rows: { label: string; value: number; color?: string }[]; fmt?: (v: number) => ReactNode }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div>
      {rows.map((r) => (
        <div key={r.label} className="hbar">
          <span>{r.label}</span>
          <span className="tr"><i style={{ width: `${(r.value / max) * 100}%`, "--hc": r.color ?? "var(--primary)" } as CSSProperties} /></span>
          <b>{fmt ? fmt(r.value) : r.value}</b>
        </div>
      ))}
    </div>
  );
}

export function Donut({ parts, center, sub, label }: { parts: { label: string; value: number; color: string }[]; center: string; sub: string; label: string }) {
  const C = 2 * Math.PI * 42;
  const total = Math.max(1, parts.reduce((a, p) => a + p.value, 0));
  let off = 0;
  return (
    <svg viewBox="0 0 120 120" width={130} height={130} role="img" aria-label={label}>
      <circle cx={60} cy={60} r={42} fill="none" strokeWidth={16} style={{ stroke: "var(--surface-2)" }} />
      {parts.map((p) => {
        const len = (p.value / total) * C;
        const el = <circle key={p.label} cx={60} cy={60} r={42} fill="none" strokeWidth={16} style={{ stroke: p.color }} strokeDasharray={`${Math.max(0, len - 2).toFixed(2)} ${(C - len + 2).toFixed(2)}`} strokeDashoffset={(-off).toFixed(2)} transform="rotate(-90 60 60)" />;
        off += len;
        return el;
      })}
      <text x={60} y={58} textAnchor="middle" style={{ font: "800 20px var(--f-display)", fill: "var(--fg)" }}>{center}</text>
      <text x={60} y={73} textAnchor="middle" style={{ font: "500 9px var(--f-ui)", fill: "var(--muted)" }}>{sub}</text>
    </svg>
  );
}
