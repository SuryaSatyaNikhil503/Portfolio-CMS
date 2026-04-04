"use client";

import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const TipTapEditor = lazy(() => import("@/editor/TipTapEditor"));

interface BlogData {
  title: string;
  excerpt: string;
  tags: string[];
  content: object;
  published: boolean;
  thumbnail: string;
}

export default function EditBlogPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const router = useRouter();
  const [blog, setBlog] = useState<BlogData | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [content, setContent] = useState<object | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blogs/${slug}`);
        const data = await res.json();
        if (data.blog) {
          setBlog(data.blog);
          setTitle(data.blog.title);
          setExcerpt(data.blog.excerpt || "");
          setTags(data.blog.tags?.join(", ") || "");
          setThumbnail(data.blog.thumbnail || "");
          setContent(data.blog.content || null);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  const handleThumbnailUpload = async (file: File) => {
    setUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", `blog:${slug}`);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setThumbnail(data.url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/blogs/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          thumbnail,
          content,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving blog:", error);
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!blog) return;
    try {
      const res = await fetch(`/api/blogs/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !blog.published }),
      });
      if (res.ok) {
        setBlog({ ...blog, published: !blog.published });
      }
    } catch (error) {
      console.error("Error toggling publish:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Blog not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Blog</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Editing: {blog.title}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin/blogs")}
            className="btn-outline text-sm"
          >
            Back
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass rounded-2xl p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field text-lg font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="input-field min-h-[80px] resize-none"
                maxLength={300}
              />
            </div>
          </div>

          {/* TipTap Editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Content</label>
            <Suspense
              fallback={
                <div className="glass rounded-xl p-8 text-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Loading editor...</p>
                </div>
              }
            >
              <TipTapEditor
                content={content || { type: "doc", content: [] }}
                onChange={setContent}
                blogSlug={slug}
              />
            </Suspense>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Publish</h3>
            <div className="flex items-center justify-between">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                  blog.published
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    blog.published ? "bg-green-400" : "bg-yellow-400"
                  }`}
                />
                {blog.published ? "Published" : "Draft"}
              </div>
              <button
                onClick={togglePublish}
                className="text-sm text-primary hover:underline"
              >
                {blog.published ? "Unpublish" : "Publish"}
              </button>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Settings</h3>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Thumbnail
              </label>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleThumbnailUpload(file);
                }}
              />
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={uploadingThumbnail}
                className="btn-outline text-sm w-full disabled:opacity-50"
              >
                {uploadingThumbnail ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {thumbnail ? "Replace Thumbnail" : "Upload Thumbnail"}
                  </span>
                )}
              </button>
              {thumbnail && (
                <div className="relative aspect-video rounded-xl overflow-hidden mt-2">
                  <Image fill src={thumbnail} alt="Thumbnail" className="object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="input-field text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
