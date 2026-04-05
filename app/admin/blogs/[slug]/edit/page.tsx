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

interface Subscriber {
  id: string;
  name: string;
  email: string;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

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

  // Notify modal
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notifying, setNotifying] = useState(false);
  const [notifySent, setNotifySent] = useState(false);

  // Share panel
  const [shortUrl, setShortUrl] = useState("");
  const [shortenLoading, setShortenLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<"full" | "short" | null>(null);

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
    const isPublishing = !blog.published;
    try {
      const res = await fetch(`/api/blogs/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !blog.published }),
      });
      if (res.ok) {
        setBlog({ ...blog, published: !blog.published });
        if (isPublishing) {
          // Load subscribers and open notification modal
          const subRes = await fetch("/api/subscribers");
          const subData = await subRes.json();
          const subs: Subscriber[] = subData.subscribers || [];
          setSubscribers(subs);
          setSelectedIds(new Set(subs.map((s) => s.id)));
          setShowNotifyModal(true);
        }
      }
    } catch (error) {
      console.error("Error toggling publish:", error);
    }
  };

  const handleSendNotification = async () => {
    setNotifying(true);
    try {
      await fetch("/api/admin/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, subscriberIds: Array.from(selectedIds) }),
      });
      setNotifySent(true);
      setTimeout(() => {
        setShowNotifyModal(false);
        setNotifySent(false);
      }, 2000);
    } catch (error) {
      console.error("Notify error:", error);
    } finally {
      setNotifying(false);
    }
  };

  const handleGetShortLink = async () => {
    const fullUrl = `${siteUrl}/blogs/${slug}`;
    setShortenLoading(true);
    try {
      const res = await fetch(`/api/shorten?url=${encodeURIComponent(fullUrl)}`);
      const data = await res.json();
      if (data.shortUrl) setShortUrl(data.shortUrl);
    } catch (error) {
      console.error("Shorten error:", error);
    } finally {
      setShortenLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: "full" | "short") => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(type);
    setTimeout(() => setCopiedUrl(null), 2000);
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

  const blogFullUrl = `${siteUrl}/blogs/${slug}`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(blogFullUrl)}`;

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
          {/* Publish */}
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

          {/* Share (only when published) */}
          {blog.published && (
            <div className="glass rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Share</h3>

              {/* Full URL */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Blog URL</label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={blogFullUrl}
                    className="input-field text-xs flex-1 min-w-0"
                  />
                  <button
                    onClick={() => copyToClipboard(blogFullUrl, "full")}
                    className="btn-outline text-xs px-3 flex-shrink-0"
                  >
                    {copiedUrl === "full" ? "✓" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Short link */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Short Link</label>
                {shortUrl ? (
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={shortUrl}
                      className="input-field text-xs flex-1 min-w-0"
                    />
                    <button
                      onClick={() => copyToClipboard(shortUrl, "short")}
                      className="btn-outline text-xs px-3 flex-shrink-0"
                    >
                      {copiedUrl === "short" ? "✓" : "Copy"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGetShortLink}
                    disabled={shortenLoading}
                    className="btn-outline text-xs w-full disabled:opacity-50"
                  >
                    {shortenLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </span>
                    ) : (
                      "Generate Short Link"
                    )}
                  </button>
                )}
              </div>

              {/* LinkedIn */}
              <a
                href={linkedInShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-xs w-full flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Share on LinkedIn
              </a>

              {/* Notify subscribers button (for already-published posts) */}
              <button
                onClick={async () => {
                  const subRes = await fetch("/api/subscribers");
                  const subData = await subRes.json();
                  const subs: Subscriber[] = subData.subscribers || [];
                  setSubscribers(subs);
                  setSelectedIds(new Set(subs.map((s) => s.id)));
                  setShowNotifyModal(true);
                }}
                className="btn-outline text-xs w-full flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Notify Subscribers
              </button>
            </div>
          )}

          {/* Settings */}
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

      {/* Notify Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-strong rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Notify Subscribers</h2>
              <button
                onClick={() => setShowNotifyModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {notifySent ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-2">✓</p>
                <p className="text-green-400 font-medium">Notifications sent!</p>
              </div>
            ) : subscribers.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No subscribers yet.</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Select who should receive an email about this post:
                </p>

                {/* Select All */}
                <label className="flex items-center gap-3 pb-3 border-b border-border/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === subscribers.length}
                    onChange={(e) =>
                      setSelectedIds(
                        e.target.checked
                          ? new Set(subscribers.map((s) => s.id))
                          : new Set()
                      )
                    }
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Select All ({subscribers.length})
                  </span>
                </label>

                {/* Subscriber list */}
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {subscribers.map((sub) => (
                    <label
                      key={sub.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(sub.id)}
                        onChange={(e) => {
                          const next = new Set(selectedIds);
                          if (e.target.checked) next.add(sub.id);
                          else next.delete(sub.id);
                          setSelectedIds(next);
                        }}
                        className="w-4 h-4 accent-primary flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground leading-tight">
                          {sub.name || sub.email}
                        </p>
                        {sub.name && (
                          <p className="text-xs text-muted-foreground truncate">{sub.email}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleSendNotification}
                    disabled={notifying || selectedIds.size === 0}
                    className="btn-primary flex-1 text-sm disabled:opacity-50"
                  >
                    {notifying
                      ? "Sending..."
                      : `Send to ${selectedIds.size} subscriber${selectedIds.size !== 1 ? "s" : ""}`}
                  </button>
                  <button
                    onClick={() => setShowNotifyModal(false)}
                    className="btn-outline text-sm"
                  >
                    Skip
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
