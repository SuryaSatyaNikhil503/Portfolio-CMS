"use client";

import { useState, useEffect } from "react";
import PageHead from "@/components/admin/PageHead";
import Icon from "@/components/ui/Icon";

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
      const res = await fetch("/api/admin/comments");
      const data = await res.json();
      setComments(data.comments || []);
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
    <>
      <PageHead title="Comments" sub={`${comments.length} total comment${comments.length !== 1 ? "s" : ""}`} />

      {loading ? (
        <div className="acard"><p className="muted" style={{ margin: 0 }}>Loading comments…</p></div>
      ) : comments.length === 0 ? (
        <div className="acard"><p className="muted" style={{ margin: 0 }}>No comments yet.</p></div>
      ) : (
        <div className="acard">
          {comments.map((comment, idx) => {
            const counts = reactionCounts(comment.reactions);
            const isReplying = replyingTo === comment.id;
            return (
              <div key={comment.id} className="cmt" style={idx === 0 ? { borderTop: 0, paddingTop: 0 } : undefined}>
                <span className="av">{comment.authorName.charAt(0).toUpperCase()}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <b>{comment.authorName}</b>
                    {comment.parentId && <span className="pill info nodot">Reply</span>}
                    <span className={"pill " + (comment.isApproved ? "good" : "warn")}>{comment.isApproved ? "Approved" : "Hidden"}</span>
                    <span className="muted" style={{ fontSize: 12.5 }}>
                      {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: 12.5 }}>{comment.authorEmail}{comment.blog ? <> · on <span style={{ color: "var(--primary)" }}>{comment.blog.title}</span></> : null}</div>
                  <p style={{ whiteSpace: "pre-wrap" }}>{comment.content}</p>
                  {comment.adminReply && (
                    <div className="authorreply">
                      <b style={{ fontSize: 12.5 }}>Your reply</b>
                      <p style={{ whiteSpace: "pre-wrap" }}>{comment.adminReply}</p>
                    </div>
                  )}
                  <div className="chips" style={{ marginTop: 10 }}>
                    {REACTIONS.map((r) => (
                      <button key={r} type="button" className={"chip" + (counts[r] ? " soft" : "")} onClick={() => handleReaction(comment.id, r)} aria-label={`React ${r}`}>
                        {r} {counts[r] ? counts[r] : null}
                      </button>
                    ))}
                  </div>
                  {isReplying && (
                    <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                      <textarea className="in" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write your reply..." aria-label="Reply" autoFocus />
                      <div className="toolbar">
                        <button type="button" className="btn p s" onClick={() => handleReply(comment.id)} disabled={saving === comment.id || !replyText.trim()}>{saving === comment.id ? "Saving..." : "Send reply"}</button>
                        <button type="button" className="btn s" onClick={() => { setReplyingTo(null); setReplyText(""); }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="toolbar">
                  <button type="button" className="btn s" onClick={() => { setReplyingTo(isReplying ? null : comment.id); setReplyText(comment.adminReply || ""); }}>
                    <Icon name="msg" size={14} /> {comment.adminReply ? "Edit reply" : "Reply"}
                  </button>
                  <button type="button" className="btn s" onClick={() => handleApproval(comment.id, !comment.isApproved)}>{comment.isApproved ? "Hide" : "Approve"}</button>
                  <button type="button" className="btn s" onClick={() => handleDelete(comment.id)} disabled={saving === comment.id} aria-label="Delete comment"><Icon name="trash" size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
