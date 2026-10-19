import Link from "next/link";
import { notFound } from "next/navigation";
import PageHead from "@/components/admin/PageHead";
import Icon from "@/components/ui/Icon";
import { AreaChart, HBars, sourceColor } from "@/components/admin/Charts";
import { DaysTabs, DeviceCell, PrivacyBar, SourcePill, agoText, place, shortId } from "@/components/admin/AnalyticsParts";
import { getBlogViews, parseDays } from "@/lib/analytics/queries";
import { fmtDuration } from "@/lib/analytics/series";

export const dynamic = "force-dynamic";

export default async function BlogViewsPage({ params, searchParams }: { params: { slug: string }; searchParams: { days?: string } }) {
  const days = parseDays(searchParams.days);
  const d = await getBlogViews(params.slug, days);
  if (!d) notFound();
  const since = d.detailsSince ? d.detailsSince.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

  return (
    <>
      <div>
        <div className="crumb">
          <Link href="/admin/blogs">Blogs</Link><Icon name="chev" size={12} />
          <span>{d.blog.title.length > 40 ? d.blog.title.slice(0, 40) + "…" : d.blog.title}</span><Icon name="chev" size={12} /><b>Views</b>
        </div>
        <PageHead
          title={d.blog.title}
          sub={`${d.views.toLocaleString()} views since ${d.blog.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
          actions={<><DaysTabs base={`/admin/blogs/${d.blog.slug}/views`} days={days} /><Link href={`/blogs/${d.blog.slug}`} className="btn" target="_blank">View post <Icon name="ext" size={15} /></Link></>}
        />
      </div>
      <div className="kpis">
        <div className="kpi"><small><Icon name="eye" size={15} />Views</small><b>{d.views.toLocaleString()}</b><span className="muted" style={{ fontSize: 12 }}>{d.detailed} with details</span></div>
        <div className="kpi"><small><Icon name="users" size={15} />Visits with details</small><b>{d.visits.toLocaleString()}</b><span className="muted" style={{ fontSize: 12 }}>separate visits</span></div>
        <div className="kpi"><small><Icon name="clock" size={15} />Avg. time on page</small><b>{fmtDuration(d.avgSeconds)}</b></div>
        <div className="kpi"><small><Icon name="down" size={15} />Avg. read depth</small><b>{Math.round(d.avgDepth)}%</b><span className="muted" style={{ fontSize: 12 }}>of the article</span></div>
      </div>
      {d.legacy > 0 && (
        <div className="privacy" style={{ gridTemplateColumns: "22px minmax(0,1fr)" }}>
          <Icon name="info" size={20} />
          <div><b>{d.legacy.toLocaleString()} earlier views</b> were counted before detailed tracking began{since ? <>; the detailed list starts on {since}</> : null}. They are included in the totals but have no per-visit details.</div>
        </div>
      )}
      <div className="agrid">
        <div className="acard">
          <div className="hd"><div><h3>Views per day</h3><p>Detailed views, last {days} days</p></div></div>
          <AreaChart id="bv-days" values={d.perDay} labels={[`${days} days ago`, "", "Today"]} label="Post views per day" />
        </div>
        <div className="acard">
          <div className="hd"><div><h3>Sources</h3><p>Where readers came from</p></div></div>
          {d.sources.length ? <HBars rows={d.sources.slice(0, 6).map((s) => ({ label: s.source, value: s.n, color: sourceColor(s.source) }))} /> : <p className="muted" style={{ margin: 0 }}>No views yet.</p>}
        </div>
      </div>
      <div className="acard">
        <div className="hd"><div><h3>Every visit</h3><p>Newest first. Click a visit to see everything that visitor did.</p></div></div>
        {d.rows.length === 0 ? <p className="muted" style={{ margin: 0 }}>No detailed visits yet. They appear as readers open this post.</p> : (
          <div className="tblwrap">
            <table className="tbl">
              <thead><tr><th>When</th><th>Source</th><th>Referrer</th><th>Device</th><th>Location</th><th className="num">Time on page</th><th>Read depth</th></tr></thead>
              <tbody>
                {d.rows.map((r) => (
                  <tr key={r.id} className="row">
                    <td><Link href={`/admin/analytics/${r.session.id}`} className="rowlink">{agoText(r.enteredAt)}</Link><div className="muted mono" style={{ fontSize: 11.5 }}>{shortId(r.session.id)}</div></td>
                    <td><SourcePill source={r.session.source} /></td>
                    <td className="muted">{r.session.referrerHost || "(no referrer)"}</td>
                    <td><DeviceCell device={r.session.device} os={r.session.os} browser={r.session.browser} /></td>
                    <td>{place(r.session.city, r.session.country)}</td>
                    <td className="num">{fmtDuration(r.activeSeconds)}</td>
                    <td style={{ minWidth: 110 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div className="meter" style={{ flex: 1 }}><i style={{ width: `${r.scrollDepth}%` }} /></div><b style={{ fontSize: 12 }}>{r.scrollDepth}%</b></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <PrivacyBar />
    </>
  );
}
