"use client";

import { useEffect, useState } from "react";
import BlogEditor, { type BlogDraft } from "@/editor/BlogEditor";

export default function EditBlogPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [draft, setDraft] = useState<BlogDraft | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    fetch(`/api/blogs/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.blog) { setState("missing"); return; }
        setDraft({ slug: d.blog.slug, title: d.blog.title, excerpt: d.blog.excerpt || "", tags: d.blog.tags || [], thumbnail: d.blog.thumbnail || "", content: d.blog.content || { type: "doc", content: [] }, published: Boolean(d.blog.published) });
        setState("ready");
      })
      .catch(() => setState("missing"));
  }, [slug]);

  if (state === "loading") return <div className="amain"><p className="muted">Loading post…</p></div>;
  if (state === "missing" || !draft) return <div className="amain"><p className="muted">Blog not found.</p></div>;
  return <BlogEditor initial={draft} />;
}
