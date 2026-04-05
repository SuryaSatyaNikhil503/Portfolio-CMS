"use client";

import { useState, useEffect, useCallback } from "react";

interface Reaction {
  id: string;
  type: string;
}

interface CommentData {
  id: string;
  authorName: string;
  content: string;
  adminReply: string;
  reactions: Reaction[];
  createdAt: string;
  replies: CommentData[];
}

const REACTIONS = ["👍", "❤️", "🔥", "👏"];

function reactionCounts(reactions: Reaction[]) {
  const counts: Record<string, number> = {};
  for (const r of reactions) counts[r.type] = (counts[r.type] || 0) + 1;
  return counts;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function CommentItem({ comment, depth = 0 }: { comment: CommentData; depth?: number }) {
  const counts = reactionCounts(comment.reactions);

  return (
    <div className={`${depth > 0 ? "ml-6 pl-4 border-l border-border/50" : ""}`}>
      <div className="glass rounded-xl p-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {comment.authorName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <span className="font-semibold text-sm text-foreground">{comment.authorName}</span>
            <span className="text-xs text-muted-foreground ml-2">{formatDate(comment.createdAt)}</span>
          </div>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

        {Object.keys(counts).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {REACTIONS.filter((r) => counts[r]).map((r) => (
              <span key={r} className="inline-flex items-center gap-1 text-xs bg-muted/50 rounded-full px-2 py-0.5">
                {r} <span className="text-muted-foreground">{counts[r]}</span>
              </span>
            ))}
          </div>
        )}

        {comment.adminReply && (
          <div className="mt-3 pl-3 border-l-2 border-primary/50">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">N</span>
              </div>
              <span className="text-xs font-semibold text-primary">Nikhil</span>
              <span className="text-xs text-muted-foreground">· Author</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{comment.adminReply}</p>
          </div>
        )}
      </div>

      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function CommentSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ authorName: "", authorEmail: "", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/blogs/${slug}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/blogs/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to post comment"); return; }

      setSubmitted(true);
      setForm({ authorName: "", authorEmail: "", content: "" });
      fetchComments();
      setTimeout(() => setSubmitted(false), 4000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-foreground mb-8">
        Comments {comments.length > 0 && <span className="text-muted-foreground font-normal text-lg">({comments.length})</span>}
      </h2>

      {/* Comment Form */}
      <div className="glass rounded-2xl p-6 mb-10">
        <h3 className="font-semibold text-foreground mb-4">Leave a Comment</h3>
        {submitted ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">💬</div>
            <p className="text-primary font-semibold">Comment posted!</p>
            <p className="text-muted-foreground text-sm">Thank you for your thoughts.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Your name *"
                value={form.authorName}
                onChange={(e) => setForm((p) => ({ ...p, authorName: e.target.value }))}
                className="input-field text-sm !py-2.5"
                required
              />
              <input
                type="email"
                placeholder="your@email.com *"
                value={form.authorEmail}
                onChange={(e) => setForm((p) => ({ ...p, authorEmail: e.target.value }))}
                className="input-field text-sm !py-2.5"
                required
              />
            </div>
            <textarea
              placeholder="Write your comment..."
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              className="input-field text-sm !py-2.5 min-h-[100px] resize-none w-full"
              required
              maxLength={2000}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Email is private and never displayed.</p>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="glass rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-muted/50" />
                <div className="h-3 w-24 bg-muted/50 rounded" />
              </div>
              <div className="h-3 w-full bg-muted/50 rounded mb-1" />
              <div className="h-3 w-3/4 bg-muted/50 rounded" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-4xl mb-3">💬</p>
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => <CommentItem key={c.id} comment={c} />)}
        </div>
      )}
    </section>
  );
}
