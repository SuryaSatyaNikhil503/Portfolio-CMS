"use client";

import { useMemo, useState } from "react";
import BlogCard from "@/components/BlogCard";
import Icon from "@/components/ui/Icon";

export interface ExplorerBlog {
  title: string; slug: string; excerpt: string; thumbnail: string; tags: string[]; readingTime: string; createdAt: string;
}

const key = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, "");

export default function BlogsExplorer({ blogs }: { blogs: ExplorerBlog[] }) {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  // Top tags, with spelling variants (e.g. "System Design" and "SystemDesign") merged.
  const topTags = useMemo(() => {
    const count = new Map<string, number>();
    const name = new Map<string, string>();
    for (const b of blogs) {
      for (const t of Array.from(new Set(b.tags.map(key)))) count.set(t, (count.get(t) ?? 0) + 1);
      for (const t of b.tags) if (!name.get(key(t)) || t.includes(" ")) name.set(key(t), t);
    }
    return Array.from(count.entries()).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([k]) => ({ k, label: name.get(k) ?? k }));
  }, [blogs]);

  const shown = blogs.filter((b) => {
    const text = (b.title + " " + b.excerpt).toLowerCase();
    return (!q.trim() || text.includes(q.trim().toLowerCase())) && (!tag || b.tags.some((t) => key(t) === tag));
  });

  return (
    <>
      <div className="filters">
        <label className="search">
          <Icon name="search" size={16} />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles" aria-label="Search articles" />
        </label>
        <button type="button" className={"chip" + (tag === null ? " soft" : "")} aria-pressed={tag === null} onClick={() => setTag(null)}>All</button>
        {topTags.map((t) => (
          <button key={t.k} type="button" className={"chip" + (tag === t.k ? " soft" : "")} aria-pressed={tag === t.k} onClick={() => setTag(tag === t.k ? null : t.k)}>
            {t.label}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="muted" style={{ marginTop: 28 }}>No articles match your search.</p>
      ) : (
        <div className="grid3" style={{ marginTop: 28 }}>
          {shown.map((b, i) => (
            <BlogCard key={b.slug} {...b} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
