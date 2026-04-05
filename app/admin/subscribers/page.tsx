"use client";

import { useState, useEffect } from "react";

interface Subscriber {
  id: string;
  name: string;
  email: string;
  profession: string;
  location: string;
  phone: string;
  subscribedAt: string;
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

  const filtered = subscribers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.profession.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscribers</h1>
          <p className="text-muted-foreground mt-1">
            {subscribers.length} total subscriber{subscribers.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, email, profession, location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-field text-sm w-full max-w-md"
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse">
              <div className="h-4 w-48 bg-muted/50 rounded mb-2" />
              <div className="h-3 w-32 bg-muted/50 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">
            {search ? "No subscribers match your search." : "No subscribers yet."}
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left">
                  <th className="px-5 py-3 text-muted-foreground font-medium">Name</th>
                  <th className="px-5 py-3 text-muted-foreground font-medium">Email</th>
                  <th className="px-5 py-3 text-muted-foreground font-medium">Profession</th>
                  <th className="px-5 py-3 text-muted-foreground font-medium">Location</th>
                  <th className="px-5 py-3 text-muted-foreground font-medium">Phone</th>
                  <th className="px-5 py-3 text-muted-foreground font-medium">Subscribed</th>
                  <th className="px-5 py-3 text-muted-foreground font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${
                      i === filtered.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-5 py-3 font-medium text-foreground">{s.name || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.email}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.profession || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.location || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.phone || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(s.subscribedAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deleting === s.id}
                        className="text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Remove subscriber"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
