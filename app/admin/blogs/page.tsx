"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import PageHead from "@/components/admin/PageHead";
import Icon from "@/components/ui/Icon";

interface Blog {
  id: string; title: string; slug: string; published: boolean; tags: string[]; readingTime: string;
  createdAt: string; updatedAt: string; viewCount: number; commentCount: number;
}

type Tab = "all" | "published" | "draft";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/admin/blogs");
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await fetch(`/api/blogs/${slug}`, { method: "DELETE" });
      setBlogs(blogs.filter((b) => b.slug !== slug));
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const togglePublish = async (slug: string, published: boolean) => {
    try {
      await fetch(`/api/blogs/${slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !published }) });
      setBlogs(blogs.map((b) => (b.slug === slug ? { ...b, published: !published } : b)));
    } catch (error) {
      console.error("Error toggling publish:", error);
    }
  };

  const published = blogs.filter((b) => b.published).length;
  const shown = blogs.filter((b) => (tab === "all" || (tab === "published") === b.published) && (!q.trim() || b.title.toLowerCase().includes(q.trim().toLowerCase())));

  return (
    <>
      <PageHead
        title="Blogs"
        sub={`${blogs.length} posts. Views and comments are private to you.`}
        actions={<Link href="/admin/blogs/new" className="btn p"><Icon name="plus" size={16} /> New blog post</Link>}
      />

      <div className="toolbar">
        <span className="tabs" role="group" aria-label="Filter posts">
          <button type="button" aria-pressed={tab === "all"} onClick={() => setTab("all")}>All {blogs.length}</button>
          <button type="button" aria-pressed={tab === "published"} onClick={() => setTab("published")}>Published {published}</button>
          <button type="button" aria-pressed={tab === "draft"} onClick={() => setTab("draft")}>Drafts {blogs.length - published}</button>
        </span>
        <input className="in grow" style={{ maxWidth: 320 }} placeholder="Search posts" aria-label="Search posts" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? (
        <div className="acard"><p className="muted" style={{ margin: 0 }}>Loading posts…</p></div>
      ) : blogs.length === 0 ? (
        <div className="acard" style={{ textAlign: "center", padding: 40 }}>
          <h3>No blogs yet</h3>
          <p className="muted">Create your first blog post to get started.</p>
          <Link href="/admin/blogs/new" className="btn p">Create first blog</Link>
        </div>
      ) : (
        <div className="acard">
          <div className="tblwrap">
            <table className="tbl">
              <thead>
                <tr><th>Post</th><th>Status</th><th>Date</th><th>Views</th><th className="num">Comments</th><th /></tr>
              </thead>
              <tbody>
                {shown.map((blog) => (
                  <tr key={blog.id}>
                    <td className="tt">{blog.title}<small>/blogs/{blog.slug}</small></td>
                    <td>
                      <button type="button" className={"pill " + (blog.published ? "good" : "warn")} style={{ border: 0, cursor: "pointer" }} onClick={() => togglePublish(blog.slug, blog.published)} title={blog.published ? "Click to unpublish" : "Click to publish"}>
                        {blog.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td>{new Date(blog.published ? blog.createdAt : blog.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td>
                      <Link href={`/admin/blogs/${blog.slug}/views`} className="viewsbtn" title="See who viewed this">
                        <Icon name="eye" size={14} />{blog.viewCount.toLocaleString()}<Icon name="chev" size={12} />
                      </Link>
                    </td>
                    <td className="num">{blog.commentCount}</td>
                    <td className="num" style={{ whiteSpace: "nowrap" }}>
                      <Link href={`/admin/blogs/${blog.slug}/edit`} className="btn s"><Icon name="edit" size={14} /> Edit</Link>{" "}
                      <button type="button" className="btn s" onClick={() => deleteBlog(blog.slug)} aria-label={`Delete ${blog.title}`}><Icon name="trash" size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {shown.length === 0 && <p className="muted" style={{ margin: "12px 0 0" }}>No posts match.</p>}
        </div>
      )}
    </>
  );
}
