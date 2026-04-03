"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          content: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Start writing your blog post here..." }],
              },
            ],
          },
          published: false,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/admin/blogs/${data.blog.slug}/edit`);
      } else {
        setError(data.error || "Failed to create blog");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-1">New Blog Post</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Create a new blog post. You can edit the content after creation.
      </p>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="System Design: Building an LRU Cache"
            className="input-field"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A brief description of your blog post..."
            className="input-field min-h-[80px] resize-none"
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground">{excerpt.length}/300</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="System Design, Data Structures, Java"
            className="input-field"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Blog Post"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-outline text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
