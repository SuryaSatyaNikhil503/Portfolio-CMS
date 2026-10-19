import PageHead from "@/components/admin/PageHead";
import { AreaChart, HBars, Donut, sourceColor } from "@/components/admin/Charts";
import { DaysTabs, PrivacyBar, SessionsTable } from "@/components/admin/AnalyticsParts";
import { getOverview, getSessions, parseDays } from "@/lib/analytics/queries";
import { fmtDuration } from "@/lib/analytics/series";

export const dynamic = "force-dynamic";

export default async function VisitorsPage({ searchParams }: { searchParams: { days?: string } }) {
  const days = parseDays(searchParams.days);
  const [o, sessions] = await Promise.all([getOverview(days), getSessions(days, 40)]);
  const byTime = [...o.sources].sort((a, b) => b.avgSeconds - a.avgSeconds);
  const total = Math.max(1, o.devices.reduce((a, d) => a + d.n, 0));
  const dev = (name: string) => o.devices.find((d) => d.device === name)?.n ?? 0;
  const phonePct = Math.round((dev("mobile") / total) * 100);
  const top = byTime[0], second = [...o.sources].sort((a, b) => b.visits - a.visits)[0];
  const insight = top && second && top.source !== second.source && second.avgSeconds > 0 && top.avgSeconds / second.avgSeconds >= 1.05
    ? `${top.source} sends fewer visits than ${second.source}, but its readers stay ${Math.round((top.avgSeconds / second.avgSeconds - 1) * 100)}% longer.` : null;

  return (
    <>
      <PageHead title="Visitors" sub="How people find and use your site" actions={<DaysTabs base="/admin/analytics" days={days} />} />
      <PrivacyBar />
      <div className="kpis">
        <div className="kpi"><small>Visits</small><b>{o.visits.toLocaleString()}</b><span className={"dl " + (o.deltas.visits.up ? "up" : "down")}>{o.deltas.visits.text}</span></div>
        <div className="kpi"><small>Page views</small><b>{o.pageViews.toLocaleString()}</b><span className={"dl " + (o.deltas.pageViews.up ? "up" : "down")}>{o.deltas.pageViews.text}</span></div>
        <div className="kpi"><small>Pages per visit</small><b>{o.pagesPerVisit.toFixed(1)}</b></div>
        <div className="kpi"><small>Avg. time on site</small><b>{fmtDuration(o.avgSeconds)}</b><span className={"dl " + (o.deltas.avgSeconds.up ? "up" : "down")}>{o.deltas.avgSeconds.text}</span></div>
        <div className="kpi"><small>Résumé downloads</small><b>{o.resume}</b><span className={"dl " + (o.deltas.resume.up ? "up" : "down")}>{o.deltas.resume.text}</span></div>
      </div>
      <div className="acard">
        <div className="hd"><h3>Visits per day</h3></div>
        <AreaChart id="an-visits" values={o.perDay} labels={[`${days} days ago`, `${Math.round(days / 2)} days ago`, "Today"]} label="Visits per day" />
      </div>
      <div className="agrid even">
        <div className="acard">
          <div className="hd"><div><h3>Sources by visits</h3><p>Where visitors arrive from</p></div></div>
          {o.sources.length ? <HBars rows={o.sources.map((s) => ({ label: s.source, value: s.visits, color: sourceColor(s.source) }))} /> : <p className="muted" style={{ margin: 0 }}>No visits yet.</p>}
        </div>
        <div className="acard">
          <div className="hd"><div><h3>Sources by time spent</h3><p>Average time per visit. Longest first.</p></div></div>
          {byTime.length ? <HBars rows={byTime.map((s) => ({ label: s.source, value: Math.round(s.avgSeconds), color: sourceColor(s.source) }))} fmt={(v) => fmtDuration(Number(v))} /> : <p className="muted" style={{ margin: 0 }}>No visits yet.</p>}
          {insight && <p className="muted" style={{ fontSize: 12.5, margin: "12px 0 0" }}>{insight} That is the audience to write for.</p>}
        </div>
      </div>
      <div className="agrid even">
        <div className="acard">
          <div className="hd"><h3>Devices</h3></div>
          <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
            <Donut label="Device split" center={`${phonePct}%`} sub="on phones" parts={[{ label: "Desktop", value: dev("desktop"), color: "var(--c1)" }, { label: "Phone", value: dev("mobile"), color: "var(--c2)" }, { label: "Tablet", value: dev("tablet"), color: "var(--c4)" }]} />
            <div className="legend" style={{ flexDirection: "column", gap: 8 }}>
              <span><i style={{ background: "var(--c1)" }} />Desktop {Math.round((dev("desktop") / total) * 100)}%</span>
              <span><i style={{ background: "var(--c2)" }} />Phone {phonePct}%</span>
              <span><i style={{ background: "var(--c4)" }} />Tablet {Math.round((dev("tablet") / total) * 100)}%</span>
            </div>
          </div>
        </div>
        <div className="acard">
          <div className="hd"><div><h3>Top locations</h3><p>City level, never the IP</p></div></div>
          {o.cities.length ? <HBars rows={o.cities.map((c) => ({ label: c.city, value: c.n }))} /> : <p className="muted" style={{ margin: 0 }}>City appears once the site is live and visitors arrive.</p>}
        </div>
      </div>
      <div className="acard">
        <div className="hd"><div><h3>Top pages</h3><p>Page views and average time</p></div></div>
        {o.topPages.length ? (
          <div className="tblwrap"><table className="tbl"><thead><tr><th>Page</th><th className="num">Views</th><th className="num">Avg. time</th></tr></thead><tbody>
            {o.topPages.map((p) => <tr key={p.path}><td className="tt">{p.path}</td><td className="num">{p.views}</td><td className="num">{fmtDuration(p.secs)}</td></tr>)}
          </tbody></table></div>
        ) : <p className="muted" style={{ margin: 0 }}>No page views yet.</p>}
      </div>
      <div className="acard">
        <div className="hd"><div><h3>Every visit</h3><p>Click a visit to open the journey</p></div></div>
        <SessionsTable rows={sessions} />
      </div>
    </>
  );
}
