"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Stats {
  blogCount: number;
  projectCount: number;
  skillCount: number;
  subscriberCount: number;
  totalViews: number;
  commentCount: number;
  viewsBySource: { source: string; count: number }[];
}

const quickActions = [
  { title: "Write New Blog", description: "Create a new blog post", href: "/admin/blogs/new", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
  { title: "Add Project", description: "Showcase a new project", href: "/admin/projects", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> },
  { title: "View Subscribers", description: "Manage newsletter subscribers", href: "/admin/subscribers", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { title: "Moderate Comments", description: "Reply and manage blog comments", href: "/admin/comments", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Blog Posts", value: stats?.blogCount ?? 0, icon: "📝", href: "/admin/blogs" },
    { label: "Total Views", value: stats?.totalViews ?? 0, icon: "👁️", href: "/admin/blogs" },
    { label: "Subscribers", value: stats?.subscriberCount ?? 0, icon: "📧", href: "/admin/subscribers" },
    { label: "Comments", value: stats?.commentCount ?? 0, icon: "💬", href: "/admin/comments" },
    { label: "Projects", value: stats?.projectCount ?? 0, icon: "🚀", href: "/admin/projects" },
    { label: "Skills", value: stats?.skillCount ?? 0, icon: "💡", href: "/admin/skills" },
  ];

  const maxSource = Math.max(...(stats?.viewsBySource.map((s) => s.count) ?? [1]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Manage your portfolio content.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href} className="glass rounded-2xl p-4 card-hover">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold gradient-text">
              {loading ? <span className="inline-block w-8 h-6 rounded bg-muted/50 animate-pulse" /> : stat.value.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Traffic Sources</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 w-16 bg-muted/50 rounded animate-pulse" />
                  <div className="h-3 flex-1 bg-muted/50 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : !stats?.viewsBySource.length ? (
            <p className="text-muted-foreground text-sm">No traffic data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.viewsBySource.map((s) => (
                <div key={s.source} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-20 flex-shrink-0">{s.source}</span>
                  <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${(s.count / maxSource) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground w-10 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="glass rounded-xl p-4 card-hover flex items-start gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{action.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
