"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const quickActions = [
  {
    title: "Write New Blog",
    description: "Create a new blog post with the rich text editor",
    href: "/admin/blogs/new",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    title: "Add Project",
    description: "Showcase a new project in your portfolio",
    href: "/admin/projects",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  {
    title: "Manage Skills",
    description: "Add or update your skills and technologies",
    href: "/admin/skills",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: "Update About",
    description: "Edit your profile and bio information",
    href: "/admin/about",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    blogs: 0,
    projects: 0,
    skills: 0,
    subscribers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [blogsRes, projectsRes, skillsRes] = await Promise.all([
          fetch("/api/blogs").then((r) => r.json()).catch(() => ({ blogs: [] })),
          fetch("/api/projects").then((r) => r.json()).catch(() => ({ projects: [] })),
          fetch("/api/skills").then((r) => r.json()).catch(() => ({ skills: [] })),
        ]);

        setCounts({
          blogs: blogsRes.blogs?.length || 0,
          projects: projectsRes.projects?.length || 0,
          skills: skillsRes.skills?.length || 0,
          subscribers: 0,
        });
      } catch {
        // Keep defaults
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const stats = [
    { label: "Blog Posts", value: counts.blogs, icon: "📝", href: "/admin/blogs" },
    { label: "Projects", value: counts.projects, icon: "🚀", href: "/admin/projects" },
    { label: "Skills", value: counts.skills, icon: "💡", href: "/admin/skills" },
    { label: "Subscribers", value: counts.subscribers, icon: "📧", href: "#" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Manage your portfolio content.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="glass rounded-2xl p-5 card-hover"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <div className="text-3xl font-bold gradient-text">
              {loading ? (
                <span className="inline-block w-8 h-8 rounded bg-muted/50 animate-pulse" />
              ) : (
                stat.value
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {stat.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="glass rounded-2xl p-5 card-hover flex items-start gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                {action.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
