"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import PageHead from "@/components/admin/PageHead";
import Icon from "@/components/ui/Icon";

interface Subscriber {
  id: string; name: string; email: string; profession: string; location: string; phone: string; subscribedAt: string; visitCount: number; latestVisitId: string | null;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/subscribers")
      .then((r) => r.json())
      .then((d) => setSubscribers(d.subscribers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/subscribers?id=${id}`, { method: "DELETE" });
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const s = search.toLowerCase();
  const filtered = subscribers.filter((x) => x.name.toLowerCase().includes(s) || x.email.toLowerCase().includes(s) || x.profession.toLowerCase().includes(s) || x.location.toLowerCase().includes(s));

  return (
    <>
      <PageHead title="Subscribers" sub={`${subscribers.length} total subscriber${subscribers.length !== 1 ? "s" : ""}`} />
      <div className="toolbar">
        <input className="in grow" style={{ maxWidth: 420 }} placeholder="Search by name, email, profession, location…" aria-label="Search subscribers" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="acard"><p className="muted" style={{ margin: 0 }}>Loading subscribers…</p></div>
      ) : filtered.length === 0 ? (
        <div className="acard"><p className="muted" style={{ margin: 0 }}>{search ? "No subscribers match your search." : "No subscribers yet."}</p></div>
      ) : (
        <div className="acard">
          <div className="tblwrap">
            <table className="tbl">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Profession</th><th>Location</th><th>Phone</th><th>Joined</th><th className="num">Visits</th><th /></tr>
              </thead>
              <tbody>
                {filtered.map((x) => (
                  <tr key={x.id}>
                    <td className="tt">{x.name || "—"}</td>
                    <td>{x.email}</td>
                    <td>{x.profession || "—"}</td>
                    <td>{x.location || "—"}</td>
                    <td className="mono">{x.phone || "—"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{new Date(x.subscribedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td className="num">
                      {x.latestVisitId ? (
                        <Link href={`/admin/analytics/${x.latestVisitId}`} className="viewsbtn"><Icon name="eye" size={13} />{x.visitCount}</Link>
                      ) : (
                        <span className="muted" title="Did not choose to share reading history">Not shared</span>
                      )}
                    </td>
                    <td className="num">
                      <button type="button" className="btn s" onClick={() => handleDelete(x.id)} disabled={deleting === x.id} aria-label={`Remove ${x.name || x.email}`}><Icon name="trash" size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
