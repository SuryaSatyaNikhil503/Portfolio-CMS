import Link from "next/link";
import { notFound } from "next/navigation";
import PageHead from "@/components/admin/PageHead";
import Icon from "@/components/ui/Icon";
import { DeviceCell, SourcePill, place, shortId } from "@/components/admin/AnalyticsParts";
import { getSession } from "@/lib/analytics/queries";
import { fmtDuration } from "@/lib/analytics/series";

export const dynamic = "force-dynamic";

const EVENT_LABEL: Record<string, string> = { resume_download: "Downloaded résumé", newsletter_subscribe: "Subscribed to newsletter", comment: "Left a comment" };

export default async function JourneyPage({ params }: { params: { id: string } }) {
  const s = await getSession(params.id);
  if (!s) notFound();
  const start = s.startedAt.getTime();
  const total = s.views.reduce((a, v) => a + v.activeSeconds, 0);
  type Item = { kind: "page"; at: number; i: number } | { kind: "event"; at: number; name: string };
  const items: Item[] = [
    ...s.views.map((v, i): Item => ({ kind: "page", at: v.enteredAt.getTime(), i })),
    ...s.events.map((e): Item => ({ kind: "event", at: e.createdAt.getTime(), name: e.name })),
  ].sort((a, b) => a.at - b.at);
  const offset = (t: number) => fmtDuration((t - start) / 1000);
  const last = s.views[s.views.length - 1];

  return (
    <>
      <div>
        <div className="crumb"><Link href="/admin/analytics">Visitors</Link><Icon name="chev" size={12} /><b>Visit {shortId(s.id)}</b></div>
        <PageHead
          title={<>Visit {shortId(s.id)} {s.events.some((e) => e.name === "resume_download") && <span className="pill info nodot" style={{ verticalAlign: "middle", marginLeft: 6 }}>Downloaded résumé</span>}</>}
          sub={`${s.startedAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })} · ${fmtDuration(total)} · ${s.views.length} page${s.views.length === 1 ? "" : "s"}`}
          actions={<Link href="/admin/analytics" className="btn"><Icon name="back" size={16} /> Back to visits</Link>}
        />
      </div>
      <div className="agrid">
        <div className="acard">
          <div className="hd"><div><h3>Journey</h3><p>Pages in the order they were opened</p></div></div>
          <div className="timeline">
            {items.map((it, k) => it.kind === "page" ? (
              <div key={k} className="tlrow">
                <div className="t">+{offset(it.at)}</div>
                <div className="rail2"><i /></div>
                <div className="bx">
                  <div className="top"><b>{s.views[it.i]!.title || s.views[it.i]!.path}</b><span className="muted" style={{ fontSize: 12.5 }}>{fmtDuration(s.views[it.i]!.activeSeconds)} on page</span></div>
                  <div className="muted mono" style={{ fontSize: 12 }}>{s.views[it.i]!.path}</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div className="meter" style={{ flex: 1 }}><i style={{ width: `${s.views[it.i]!.scrollDepth}%` }} /></div>
                    <span className="muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>read {s.views[it.i]!.scrollDepth}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div key={k} className="tlrow ev">
                <div className="t">+{offset(it.at)}</div>
                <div className="rail2"><i /></div>
                <div className="bx"><div className="top"><b><Icon name="download" size={15} /> {EVENT_LABEL[it.name] ?? it.name}</b><span className="pill good nodot">Event</span></div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="acard">
            <div className="hd"><h3>Where from</h3></div>
            <dl className="kv">
              <div><dt>Source</dt><dd><SourcePill source={s.source} /></dd></div>
              <div><dt>Referrer</dt><dd>{s.referrer ? s.referrer.replace(/^https?:\/\//, "") : "(no referrer)"}</dd></div>
              <div><dt>Entry page</dt><dd>{s.views[0]?.path ?? "—"}</dd></div>
              <div><dt>Exit page</dt><dd>{last?.path ?? "—"}</dd></div>
            </dl>
          </div>
          <div className="acard">
            <div className="hd"><h3>Visitor</h3></div>
            <dl className="kv">
              <div><dt>Device</dt><dd><DeviceCell device={s.device} os={s.os} browser={s.browser} /></dd></div>
              <div><dt>Location</dt><dd>{place(s.city, s.country)}</dd></div>
              <div><dt>Browser</dt><dd>{s.browser || "—"}</dd></div>
            </dl>
          </div>
          <div className="acard">
            <div className="hd"><h3>Identity</h3>{s.subscriber ? <span className="pill good">Identified</span> : <span className="pill nodot">Anonymous</span>}</div>
            {s.subscriber ? (
              <dl className="kv">
                <div><dt>Name</dt><dd>{s.subscriber.name || "—"}</dd></div>
                <div><dt>Email</dt><dd>{s.subscriber.email}</dd></div>
                {s.subscriber.profession && <div><dt>Profession</dt><dd>{s.subscriber.profession}</dd></div>}
                {s.subscriber.location && <div><dt>Location</dt><dd>{s.subscriber.location}</dd></div>}
              </dl>
            ) : (
              <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>Visitors stay anonymous. Browsers never reveal a name, email or phone number. If a visitor subscribes and ticks &quot;let me see which pages I read&quot;, their details appear here.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
