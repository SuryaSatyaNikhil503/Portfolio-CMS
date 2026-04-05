"use client";

import { useState, useEffect } from "react";

interface Reaction { id: string; type: string; }
interface Comment {
  id: string;
  blogId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  adminReply: string;
  isApproved: boolean;
  reactions: Reaction[];
  createdAt: string;
  parentId: string | null;
  blog?: { title: string; slug: string };
}

const REACTIONS = ["👍", "❤️", "🔥", "👏"];

function reactionCounts(reactions: Reaction[]) {
  const counts: Record<string, number> = {};
  for (const r of reactions) counts[r.type] = (counts[r.type] || 0) + 1;
  return counts;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    try {
      // Fetch all published blogs and their comments
      const blogsRes = await fetch("/api/blogs?published=false");
      const blogsData = await blogsRes.json();
      const blogs: { slug: string; title: string }[] = blogsData.blogs || [];

      const all: Comment[] = [];
      await Promise.all(
        blogs.map(async (blog) => {
          const res = await fetch(`/api/blogs/${blog.slug}/comments`);
          const data = await res.json();
          if (data.comments) {
            for (const c of data.comments) {
              all.push({ ...c, blog: { title: blog.title, slug: blog.slug } });
              for (const r of c.replies || []) {
                all.push({ ...r, blog: { title: blog.title, slug: blog.slug } });
              }
            }
          }
        })
      );

      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setComments(all);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleReply(commentId: string) {
    if (!replyText.trim()) return;
    setSaving(commentId);
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: replyText }),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, adminReply: replyText } : c))
        );
        setReplyingTo(null);
        setReplyText("");
      }
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Delete this comment?")) return;
    setSaving(commentId);
    try {
      await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } finally {
      setSaving(null);
    }
  }

  async function handleReaction(commentId: string, type: string) {
    try {
      const res = await fetch(`/api/comments/${commentId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, reactions: data.reactions } : c))
        );
      }
    } catch {
      // ignore
    }
  }

  async function handleApproval(commentId: string, isApproved: boolean) {
    try {
      await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, isApproved } : c))
      );
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Comments</h1>
        <p className="text-muted-foreground mt-1">
          {comments.length} total comment{comments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse">
              <div className="h-4 w-40 bg-muted/50 rounded mb-3" />
              <div className="h-3 w-full bg-muted/50 rounded mb-2" />
              <div className="h-3 w-3/4 bg-muted/50 rounded" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-muted-foreground">No comments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const counts = reactionCounts(comment.reactions);
            const isReplying = replyingTo === comment.id;

            return (
              <div key={comment.id} className="glass rounded-2xl p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{comment.authorName}</span>
                        {comment.parentId && (
                          <span className="text-xs badge">Reply</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${comment.isApproved ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                          {comment.isApproved ? "Approved" : "Hidden"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{comment.authorEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Blog reference */}
                {comment.blog && (
                  <p className="text-xs text-muted-foreground">
                    On: <span className="text-primary">{comment.blog.title}</span>
                  </p>
                )}

                {/* Content */}
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

                {/* Admin Reply */}
                {comment.adminReply && (
                  <div className="pl-3 border-l-2 border-primary/50">
                    <p className="text-xs font-semibold text-primary mb-1">Your reply:</p>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{comment.adminReply}</p>
                  </div>
                )}

                {/* Reactions */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">React:</span>
                  {REACTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleReaction(comment.id, r)}
                      className={`inline-flex items-center gap-1 text-sm rounded-full px-2.5 py-0.5 transition-all ${
                        counts[r] ? "bg-primary/20 text-primary" : "bg-muted/50 hover:bg-primary/10"
                      }`}
                    >
                      {r} {counts[r] ? <span className="text-xs">{counts[r]}</span> : null}
                    </button>
                  ))}
                </div>

                {/* Reply form */}
                {isReplying && (
                  <div className="space-y-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply..."
                      className="input-field text-sm !py-2.5 min-h-[80px] resize-none w-full"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReply(comment.id)}
                        disabled={saving === comment.id || !replyText.trim()}
                        className="btn-primary text-sm disabled:opacity-50"
                      >
                        {saving === comment.id ? "Saving..." : "Send Reply"}
                      </button>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                        className="btn-outline text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1 border-t border-border/30">
                  <button
                    onClick={() => {
                      setReplyingTo(isReplying ? null : comment.id);
                      setReplyText(comment.adminReply || "");
                    }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    {comment.adminReply ? "Edit Reply" : "Reply"}
                  </button>
                  <button
                    onClick={() => handleApproval(comment.id, !comment.isApproved)}
                    className="text-xs text-muted-foreground hover:text-yellow-400 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {comment.isApproved ? "Hide" : "Approve"}
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={saving === comment.id}
                    className="text-xs text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
