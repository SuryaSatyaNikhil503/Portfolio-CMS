import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { sourceColor } from "./Charts";
import { fmtDuration } from "@/lib/analytics/series";

export const shortId = (id: string) => "#" + id.slice(0, 4).toUpperCase();
export const place = (city: string, country: string) => [city, country].filter(Boolean).join(", ") || "Unknown";

export function agoText(d: Date | string): string {
  const s = Math.max(0, Math.round((Date.now() - new Date(d).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  const days = Math.round(s / 86400);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

export function SourcePill({ source }: { source: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 600 }}>
      <i style={{ width: 9, height: 9, borderRadius: 3, background: sourceColor(source) }} />
      {source}
    </span>
  );
}

export function DeviceCell({ device, os, browser }: { device: string; os: string; browser: string }) {
  return <span style={{ whiteSpace: "nowrap" }}><Icon name={device === "desktop" ? "monitor" : "phone"} size={15} /> {[os, browser].filter(Boolean).join(" · ") || device}</span>;
}

export function DaysTabs({ base, days }: { base: string; days: number }) {
  return (
    <span className="tabs" role="group" aria-label="Date range">
      {[7, 30, 90].map((d) => (
        <Link key={d} href={`${base}?days=${d}`} aria-current={d === days ? "true" : undefined}>{d} days</Link>
      ))}
    </span>
  );
}

export function PrivacyBar() {
  return (
    <div className="privacy">
      <Icon name="shield" size={20} />
      <div><b>Privacy:</b> no IP address is ever stored. No cookies and nothing that identifies a visitor. City comes from the network at request time. Visits are deleted after 90 days.</div>
      <Link className="btn s" href="/privacy" target="_blank">Privacy notice</Link>
    </div>
  );
}

export interface SessionRow { id: string; startedAt: Date; source: string; device: string; os: string; browser: string; country: string; city: string; entry: string; pages: number; seconds: number; resume: boolean; identified: boolean }

export function SessionsTable({ rows, compact }: { rows: SessionRow[]; compact?: boolean }) {
  if (rows.length === 0) return <p className="muted" style={{ margin: 0 }}>No visits recorded in this period yet. They appear here as people browse the site.</p>;
  return (
    <div className="tblwrap">
      <table className="tbl">
        <thead>
          <tr><th>Visit</th><th>Source</th>{!compact && <th>Entry page</th>}{!compact && <th className="num">Pages</th>}<th className="num">Time</th>{!compact && <th>Device</th>}<th>Location</th>{!compact && <th>Who</th>}</tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id} className="row">
              <td><Link href={`/admin/analytics/${s.id}`} className="rowlink"><b>{shortId(s.id)}</b></Link><div className="muted" style={{ fontSize: 12 }}>{agoText(s.startedAt)}</div></td>
              <td><SourcePill source={s.source} /></td>
              {!compact && <td className="tt" style={{ maxWidth: 240 }}>{s.entry}</td>}
              {!compact && <td className="num">{s.pages}</td>}
              <td className="num">{fmtDuration(s.seconds)}</td>
              {!compact && <td><DeviceCell device={s.device} os={s.os} browser={s.browser} /></td>}
              <td>{place(s.city, s.country)}</td>
              {!compact && <td>{s.identified ? <span className="pill good">Identified</span> : s.resume ? <span className="pill info">Résumé</span> : <span className="pill nodot">Anonymous</span>}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
