import Link from "next/link";
import prisma from "@/lib/prisma";
import PageHead from "@/components/admin/PageHead";
import Icon, { type IconName } from "@/components/ui/Icon";
import { AreaChart, HBars, sourceColor } from "@/components/admin/Charts";
import { PrivacyBar, SessionsTable } from "@/components/admin/AnalyticsParts";
import { getOverview, getSessions, getBlogViewTotals } from "@/lib/analytics/queries";
import { fmtDuration } from "@/lib/analytics/series";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [o, sessions, totals, blogs] = await Promise.all([
    getOverview(30),
    getSessions(30, 4),
    getBlogViewTotals(),
    prisma.blog.findMany({ select: { id: true, title: true, slug: true } }),
  ]);
  const top = blogs.map((b) => ({ ...b, views: totals.get(b.id) ?? 0 })).sort((a, b) => b.views - a.views).slice(0, 5);
  const kpis: { label: string; value: string; icon: IconName; d?: { text: string; up: boolean } }[] = [
    { label: "Visits", value: o.visits.toLocaleString(), icon: "eye", d: o.deltas.visits },
    { label: "Page views", value: o.pageViews.toLocaleString(), icon: "book", d: o.deltas.pageViews },
    { label: "Avg. time on site", value: fmtDuration(o.avgSeconds), icon: "clock", d: o.deltas.avgSeconds },
    { label: "Résumé downloads", value: String(o.resume), icon: "download", d: o.deltas.resume },
    { label: "Subscribers", value: String(o.subscribers), icon: "mail" },
  ];

  return (
    <>
      <PageHead title="Dashboard" sub="Last 30 days" actions={<Link href="/admin/blogs/new" className="btn p"><Icon name="plus" size={16} /> New blog post</Link>} />
      <div className="kpis">
        {kpis.map((k) => (
          <div key={k.label} className="kpi">
            <small><Icon name={k.icon} size={15} />{k.label}</small>
            <b>{k.value}</b>
            {k.d && <span className={"dl " + (k.d.up ? "up" : "down")}>{k.d.text} vs previous 30 days</span>}
          </div>
        ))}
      </div>
      <div className="agrid">
        <div className="acard">
          <div className="hd"><div><h3>Visits per day</h3><p>Every visit, bots removed</p></div></div>
          <AreaChart id="dash-visits" values={o.perDay} labels={["30 days ago", "15 days ago", "Today"]} label="Visits per day" />
        </div>
        <div className="acard">
          <div className="hd"><div><h3>Where visitors come from</h3><p>Visits by source</p></div><Link className="btn s" href="/admin/analytics">Details</Link></div>
          {o.sources.length ? <HBars rows={o.sources.slice(0, 5).map((s) => ({ label: s.source, value: s.visits, color: sourceColor(s.source) }))} /> : <p className="muted" style={{ margin: 0 }}>No visits yet.</p>}
        </div>
      </div>
      <div className="agrid">
        <div className="acard">
          <div className="hd"><div><h3>Most read posts</h3><p>Click a count to see every visit</p></div><Link className="btn s" href="/admin/blogs">All posts</Link></div>
          <div className="tblwrap">
            <table className="tbl"><tbody>
              {top.map((b) => (
                <tr key={b.id}>
                  <td className="tt">{b.title.length > 58 ? b.title.slice(0, 58) + "…" : b.title}</td>
                  <td className="num"><Link href={`/admin/blogs/${b.slug}/views`} className="viewsbtn"><Icon name="eye" size={14} />{b.views.toLocaleString()}</Link></td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </div>
        <div className="acard">
          <div className="hd"><div><h3>Latest visitors</h3><p>Newest first</p></div><Link className="btn s" href="/admin/analytics">All visits</Link></div>
          <SessionsTable rows={sessions} compact />
        </div>
      </div>
      <PrivacyBar />
    </>
  );
}
