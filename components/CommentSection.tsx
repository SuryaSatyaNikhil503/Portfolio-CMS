"use client";

import { useState, useEffect, useCallback } from "react";

interface Reaction { id: string; type: string }
interface CommentData {
  id: string; authorName: string; content: string; adminReply: string; reactions: Reaction[]; createdAt: string; replies: CommentData[];
}

const REACTIONS = ["👍", "❤️", "🔥", "👏"];

function reactionCounts(reactions: Reaction[]) {
  const counts: Record<string, number> = {};
  for (const r of reactions) counts[r.type] = (counts[r.type] || 0) + 1;
  return counts;
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function CommentItem({ comment, depth = 0 }: { comment: CommentData; depth?: number }) {
  const counts = reactionCounts(comment.reactions);
  return (
    <div style={depth > 0 ? { marginLeft: 24, paddingLeft: 16, borderLeft: "2px solid var(--line)" } : undefined}>
      <div className="comment">
        <span className="av">{comment.authorName.charAt(0).toUpperCase()}</span>
        <div>
          <b style={{ color: "var(--fg)" }}>{comment.authorName}</b> <span className="muted" style={{ fontSize: 12.5 }}>{formatDate(comment.createdAt)}</span>
          <p style={{ whiteSpace: "pre-wrap" }}>{comment.content}</p>
          {Object.keys(counts).length > 0 && (
            <div className="chips" style={{ marginTop: 8 }}>
              {REACTIONS.filter((r) => counts[r]).map((r) => (
                <span key={r} className="chip" style={{ fontSize: 12 }}>{r} {counts[r]}</span>
              ))}
            </div>
          )}
          {comment.adminReply && (
            <div className="authorreply">
              <b>Nikhil</b> <span className="muted">· Author</span>
              <p style={{ whiteSpace: "pre-wrap" }}>{comment.adminReply}</p>
            </div>
          )}
        </div>
      </div>
      {comment.replies?.map((reply) => <CommentItem key={reply.id} comment={reply} depth={depth + 1} />)}
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
      /* ignore */
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
      const res = await fetch(`/api/blogs/${slug}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to post comment"); return; }
      setSubmitted(true);
      window.dispatchEvent(new CustomEvent("track:event", { detail: "comment" }));
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
    <section style={{ marginTop: 56 }}>
      <h2 className="cmt-h">Comments {comments.length > 0 && <span className="muted" style={{ fontWeight: 500, fontSize: 18 }}>({comments.length})</span>}</h2>

      <div className="cmtbox">
        <h3>Leave a Comment</h3>
        {submitted ? (
          <div role="status">
            <b style={{ color: "var(--primary)" }}>Comment posted!</b>
            <p className="muted" style={{ margin: "4px 0 0" }}>Thank you for your thoughts.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
            <div className="formgrid">
              <input className="in" type="text" placeholder="Your name *" aria-label="Your name" value={form.authorName} onChange={(e) => setForm((p) => ({ ...p, authorName: e.target.value }))} required />
              <input className="in" type="email" placeholder="you@email.com *" aria-label="Email" value={form.authorEmail} onChange={(e) => setForm((p) => ({ ...p, authorEmail: e.target.value }))} required />
            </div>
            <textarea className="in" placeholder="Write your comment..." aria-label="Comment" style={{ minHeight: 110 }} value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} required maxLength={2000} />
            {error && <p role="alert" style={{ margin: 0, color: "var(--bad)", fontSize: 13 }}>{error}</p>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span className="muted" style={{ fontSize: 12.5 }}>Email is private and never displayed.</span>
              <button type="submit" disabled={submitting} className="btn p">{submitting ? "Posting..." : "Post Comment"}</button>
            </div>
          </form>
        )}
      </div>

      {loading ? (
        <p className="muted">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="muted">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div>{comments.map((c) => <CommentItem key={c.id} comment={c} />)}</div>
      )}
    </section>
  );
}
