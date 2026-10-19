"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Editor, JSONContent } from "@tiptap/react";
import Article, { type TipTapNode } from "@/components/Article";
import Icon from "@/components/ui/Icon";
import RichTextEditor from "./RichTextEditor";
import { useAutosave } from "./useAutosave";
import { readingTimeFromDoc } from "@/lib/readingTime";
import { seoChecks } from "@/lib/seoChecks";
import { slugify } from "@/lib/headings";

export interface BlogDraft {
  slug: string | null;
  title: string;
  excerpt: string;
  tags: string[];
  thumbnail: string;
  content: object;
  published: boolean;
}
interface Subscriber { id: string; name: string; email: string }
type Mode = "write" | "split" | "preview";

const EMPTY_DOC = { type: "doc", content: [] };

/** Comparable form of a document; a doc holding only empty paragraphs equals the empty doc. */
function docKey(doc: unknown): string {
  const d = doc as { content?: { type?: string; content?: unknown[] }[] } | null;
  const blank = !d?.content || d.content.every((n) => n.type === "paragraph" && !n.content?.length);
  return blank ? "blank" : JSON.stringify(doc);
}
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
const BRAND = "Surya Satya Nikhil Gadhavajula";

export default function BlogEditor({ initial }: { initial: BlogDraft }) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial.slug);
  const [slugText, setSlugText] = useState(initial.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [title, setTitle] = useState(initial.title);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [tags, setTags] = useState<string[]>(initial.tags);
  const [tagInput, setTagInput] = useState("");
  const [thumbnail, setThumbnail] = useState(initial.thumbnail);
  const [content, setContent] = useState<object>(initial.content ?? EMPTY_DOC);
  const [published, setPublished] = useState(initial.published);
  const [mode, setMode] = useState<Mode>("split");
  const [rev, setRev] = useState(0);
  const [error, setError] = useState("");
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [knownTags, setKnownTags] = useState<string[]>([]);
  const [backup, setBackup] = useState<BlogDraft | null>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<Editor | null>(null);
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }
  }, [title, mode]);

  // notify + share (kept from the previous editor)
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notifying, setNotifying] = useState(false);
  const [notifySent, setNotifySent] = useState(false);
  const [shortUrl, setShortUrl] = useState("");
  const [shortening, setShortening] = useState(false);
  const [copied, setCopied] = useState<"full" | "short" | null>(null);

  const lastDoc = useRef<object>(initial.content ?? EMPTY_DOC);
  const touch = () => setRev((r) => r + 1);
  const effectiveSlug = slugTouched ? slugText : title.trim() ? slugify(title) : "";
  const rt = useMemo(() => readingTimeFromDoc(content), [content]);
  const checks = useMemo(() => seoChecks({ title, excerpt, tags, thumbnail, doc: content }), [title, excerpt, tags, thumbnail, content]);

  const persist = async (): Promise<boolean> => {
    if (!title.trim()) { setError("Add a title to start saving."); return false; }
    setError("");
    const body = { title: title.trim(), excerpt, tags, thumbnail, content };
    if (!slug) {
      const res = await fetch("/api/blogs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, slug: effectiveSlug, published: false }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Could not create the post."); return false; }
      setSlug(data.blog.slug);
      setSlugText(data.blog.slug);
      window.history.replaceState(null, "", `/admin/blogs/${data.blog.slug}/edit`);
      return true;
    }
    const slugChange = !published && slugTouched && slugText && slugText !== slug ? { slug: slugText } : {};
    const res = await fetch(`/api/blogs/${slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, ...slugChange }) });
    if (!res.ok) { setError("Could not save. Try again."); return false; }
    if (slugChange.slug) { setSlug(slugChange.slug); window.history.replaceState(null, "", `/admin/blogs/${slugChange.slug}/edit`); }
    try { localStorage.removeItem(`blog-backup:${slug}`); } catch { /* ignore */ }
    return true;
  };

  const { status, savedAt, saveNow } = useAutosave({ enabled: !published, rev, save: persist });
  const dirty = rev > 0 && status !== "saved";

  // Published posts never autosave to the server; keep a local backup so nothing is lost.
  useEffect(() => {
    if (!published || !slug || rev === 0) return;
    const t = setTimeout(() => {
      try { localStorage.setItem(`blog-backup:${slug}`, JSON.stringify({ slug, title, excerpt, tags, thumbnail, content, published })); } catch { /* storage unavailable */ }
    }, 800);
    return () => clearTimeout(t);
  }, [published, slug, rev, title, excerpt, tags, thumbnail, content]);

  useEffect(() => {
    if (!initial.slug || !initial.published) return;
    try {
      const raw = localStorage.getItem(`blog-backup:${initial.slug}`);
      if (raw) { const b = JSON.parse(raw) as BlogDraft; if (JSON.stringify(b.content) !== JSON.stringify(initial.content) || b.title !== initial.title) setBackup(b); }
    } catch { /* ignore */ }
  }, [initial]);

  useEffect(() => {
    fetch("/api/admin/blogs").then((r) => r.json()).then((d) => {
      const count = new Map<string, number>();
      for (const b of (d.blogs || []) as { tags: string[] }[]) for (const t of b.tags) count.set(t, (count.get(t) || 0) + 1);
      setKnownTags(Array.from(count.entries()).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([t]) => t));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const addTag = (raw: string) => {
    const t = raw.trim().replace(/,$/, "").trim();
    if (t && !tags.some((x) => x.toLowerCase() === t.toLowerCase())) { setTags([...tags, t]); touch(); }
    setTagInput("");
  };

  const uploadThumb = async (file: File) => {
    setUploadingThumb(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", `blog:${slug || effectiveSlug || "draft"}`);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) { setThumbnail(data.url); touch(); }
    } catch (e) {
      console.error("Upload error:", e);
    } finally {
      setUploadingThumb(false);
    }
  };

  const openNotify = async () => {
    const res = await fetch("/api/subscribers");
    const data = await res.json();
    const list: Subscriber[] = data.subscribers || [];
    setSubs(list);
    setSelected(new Set(list.map((s) => s.id)));
    setNotifyOpen(true);
  };

  const publish = async () => {
    const ok = await saveNow();
    const currentSlug = slug ?? (ok ? effectiveSlug : null);
    if (!ok || !currentSlug) return;
    const res = await fetch(`/api/blogs/${slug ?? effectiveSlug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: true }) });
    if (res.ok) { setPublished(true); openNotify(); }
  };

  const unpublish = async () => {
    if (!slug || !confirm("Unpublish this post? It disappears from the site until you publish it again.")) return;
    const res = await fetch(`/api/blogs/${slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: false }) });
    if (res.ok) setPublished(false);
  };

  const sendNotification = async () => {
    setNotifying(true);
    try {
      await fetch("/api/admin/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, subscriberIds: Array.from(selected) }) });
      setNotifySent(true);
      setTimeout(() => { setNotifyOpen(false); setNotifySent(false); }, 1800);
    } finally {
      setNotifying(false);
    }
  };

  const fullUrl = `${siteUrl}/blogs/${slug ?? effectiveSlug}`;
  const copy = (text: string, which: "full" | "short") => { navigator.clipboard.writeText(text).catch(() => {}); setCopied(which); setTimeout(() => setCopied(null), 1600); };
  const shorten = async () => {
    setShortening(true);
    try {
      const res = await fetch(`/api/shorten?url=${encodeURIComponent(fullUrl)}`);
      const data = await res.json();
      if (data.shortUrl) setShortUrl(data.shortUrl);
    } finally {
      setShortening(false);
    }
  };

  const ago = savedAt ? Math.max(1, Math.round((Date.now() - savedAt.getTime()) / 1000)) : 0;
  const pill = !published
    ? status === "saving" ? { c: "info", t: "Saving…" } : status === "error" || error ? { c: "bad", t: error || "Save failed" } : status === "pending" ? { c: "warn", t: "Unsaved changes" } : status === "saved" ? { c: "good", t: `Draft saved${ago ? ` ${ago < 60 ? `${ago} s` : `${Math.round(ago / 60)} min`} ago` : ""}` } : { c: "nodot", t: title.trim() ? "Draft" : "Add a title to begin" }
    : status === "saving" ? { c: "info", t: "Saving…" } : status === "saved" ? { c: "good", t: "Saved to the live post" } : error ? { c: "bad", t: error } : rev > 0 ? { c: "warn", t: "Unsaved (backed up on this device)" } : { c: "good", t: "Published" };

  return (
    <div className="ed" data-mode={mode}>
      <div className="edtop">
        <button type="button" className="btn s" onClick={() => router.push("/admin/blogs")}><Icon name="back" size={15} /> Blogs</button>
        <span className="st"><span className={`pill ${pill.c}`}>{pill.t}</span></span>
        <span className="st"><Icon name="clock" size={14} /> {rt.words.toLocaleString()} words · {rt.label}</span>
        <span className="grow" />
        <span className="tabs" role="group" aria-label="Editor view">
          {(["write", "split", "preview"] as Mode[]).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>{m === "split" ? "Split preview" : m[0]!.toUpperCase() + m.slice(1)}</button>
          ))}
        </span>
        <button type="button" className="btn" onClick={() => saveNow()} disabled={status === "saving"}><Icon name="save" size={16} /> {published ? "Save changes" : "Save draft"}</button>
        {published ? (
          <button type="button" className="btn" onClick={unpublish}>Unpublish</button>
        ) : (
          <button type="button" className="btn p" onClick={publish} disabled={status === "saving"}><Icon name="check" size={16} /> Publish</button>
        )}
      </div>

      {backup && (
        <div className="privacy" style={{ margin: "12px clamp(14px, 2.4vw, 24px) 0" }}>
          <Icon name="alert" size={20} />
          <div><b>Unsaved changes found on this device.</b> You edited this post earlier without saving.</div>
          <div className="toolbar">
            <button type="button" className="btn s p" onClick={() => { setTitle(backup.title); setExcerpt(backup.excerpt); setTags(backup.tags); setThumbnail(backup.thumbnail); setContent(backup.content); lastDoc.current = backup.content; editorRef.current?.commands.setContent(backup.content as JSONContent); setBackup(null); touch(); }}>Restore</button>
            <button type="button" className="btn s" onClick={() => { try { localStorage.removeItem(`blog-backup:${initial.slug}`); } catch { /* ignore */ } setBackup(null); }}>Discard</button>
          </div>
        </div>
      )}

      <div className="edbody">
        <div className="edmain">
          <div className="pane w edcanvas">
            <span className="tag">Writing</span>
            <textarea ref={titleRef} className="edtitle" rows={1} value={title} placeholder="Post title" aria-label="Post title" onChange={(e) => { setTitle(e.target.value); touch(); }} />
            {excerpt && <p className="edsub">{excerpt}</p>}
            <RichTextEditor content={content} blogSlug={slug ?? undefined} onEditor={(e) => { editorRef.current = e; }} onChange={(doc: JSONContent) => { if (docKey(doc) === docKey(lastDoc.current)) return; lastDoc.current = doc; setContent(doc); touch(); }} />
          </div>
          <div className="pane pv">
            <span className="tag">How it looks on your site</span>
            <h1 className="edtitle">{title || "Post title"}</h1>
            {excerpt && <p className="edsub">{excerpt}</p>}
            <Article content={content as TipTapNode} />
          </div>
        </div>

        <aside className="edside">
          <section>
            <h4>Publish</h4>
            <div className="kv">
              <div><dt>Status</dt><dd><span className={"pill " + (published ? "good" : "warn")}>{published ? "Published" : "Draft"}</span></dd></div>
              <div><dt>Visibility</dt><dd>{published ? "Public" : "Public when published"}</dd></div>
            </div>
          </section>

          {published && (
            <section>
              <h4>Share</h4>
              <div className="shareline"><input className="in mono" readOnly value={fullUrl} aria-label="Post address" /><button type="button" className="btn s" onClick={() => copy(fullUrl, "full")}>{copied === "full" ? "Copied" : "Copy"}</button></div>
              {shortUrl ? (
                <div className="shareline"><input className="in mono" readOnly value={shortUrl} aria-label="Short link" /><button type="button" className="btn s" onClick={() => copy(shortUrl, "short")}>{copied === "short" ? "Copied" : "Copy"}</button></div>
              ) : (
                <button type="button" className="btn s" onClick={shorten} disabled={shortening}>{shortening ? "Generating…" : "Generate short link"}</button>
              )}
              <a className="btn s" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`} target="_blank" rel="noopener noreferrer">Share on LinkedIn <Icon name="ext" size={13} /></a>
              <button type="button" className="btn s" onClick={openNotify}><Icon name="mail" size={14} /> Notify subscribers</button>
            </section>
          )}

          <section>
            <h4>Thumbnail</h4>
            <input ref={thumbRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadThumb(f); e.target.value = ""; }} />
            <button type="button" className="drop" onClick={() => thumbRef.current?.click()} disabled={uploadingThumb}>
              {thumbnail ? <Image src={thumbnail} alt="Thumbnail" width={260} height={146} style={{ width: "100%", height: "auto", borderRadius: 8 }} /> : <Icon name="image" size={22} />}
              <span>{uploadingThumb ? "Uploading…" : thumbnail ? "Replace thumbnail" : <>Click to <b style={{ color: "var(--primary)" }}>upload</b><br />Used on cards and when shared</>}</span>
            </button>
          </section>

          <section>
            <h4>Link and summary</h4>
            <div>
              <label className="label" htmlFor="slug">Slug</label>
              <input id="slug" className="in mono" value={published ? (slug ?? "") : slugTouched ? slugText : effectiveSlug} readOnly={published} onChange={(e) => { setSlugTouched(true); setSlugText(slugify(e.target.value)); touch(); }} />
              {published && <span className="muted" style={{ fontSize: 12 }}>The address of a published post is locked so links and search results keep working.</span>}
            </div>
            <div>
              <label className="label" htmlFor="excerpt">Excerpt <span style={{ float: "right", fontWeight: 500 }}>{excerpt.length} / 160</span></label>
              <textarea id="excerpt" className="in" value={excerpt} maxLength={300} onChange={(e) => { setExcerpt(e.target.value); touch(); }} />
            </div>
          </section>

          <section>
            <h4>Tags</h4>
            <div className="chips">
              {tags.map((t) => (
                <span key={t} className="chip soft">{t}<button type="button" aria-label={`Remove ${t}`} className="chipx" onClick={() => { setTags(tags.filter((x) => x !== t)); touch(); }}><Icon name="x" size={12} /></button></span>
              ))}
            </div>
            <input className="in" list="known-tags" value={tagInput} placeholder="Add a tag and press Enter" aria-label="Add a tag" onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }} onBlur={() => tagInput.trim() && addTag(tagInput)} />
            <datalist id="known-tags">{knownTags.filter((t) => !tags.includes(t)).map((t) => <option key={t} value={t} />)}</datalist>
            <span className="muted" style={{ fontSize: 12 }}>3 to 6 tags works best. More than that dilutes search.</span>
          </section>

          <section>
            <h4>Search preview</h4>
            <div className="serp">
              <span className="u">{siteUrl ? new URL(siteUrl).host : "yoursite.com"} › blogs</span>
              <span className="tt">{(title || "Post title") + " | " + BRAND}</span>
              <span className="d">{excerpt || "Add an excerpt to control what search results show."}</span>
            </div>
          </section>

          <section>
            <h4>Checks</h4>
            <div className="checks">
              {checks.map((c) => (
                <div key={c.id}><span className={c.ok ? "ok" : "no"}><Icon name={c.ok ? "check" : "alert"} size={15} /></span>{c.text}</div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {notifyOpen && (
        <div className="modalback" role="dialog" aria-modal="true" aria-label="Notify subscribers">
          <div className="modal">
            <h3>Notify subscribers</h3>
            <p className="muted" style={{ margin: "4px 0 12px" }}>Send an email about this post to the people you choose.</p>
            {subs.length === 0 ? <p className="muted">You have no subscribers yet.</p> : (
              <div className="sublist">
                <label className="chk"><input type="checkbox" checked={selected.size === subs.length} onChange={(e) => setSelected(e.target.checked ? new Set(subs.map((s) => s.id)) : new Set())} /><span><b>Select all ({subs.length})</b></span></label>
                {subs.map((s) => (
                  <label key={s.id} className="chk"><input type="checkbox" checked={selected.has(s.id)} onChange={(e) => { const n = new Set(selected); if (e.target.checked) n.add(s.id); else n.delete(s.id); setSelected(n); }} /><span>{s.name} <span className="muted">{s.email}</span></span></label>
                ))}
              </div>
            )}
            <div className="toolbar" style={{ marginTop: 14 }}>
              <button type="button" className="btn p" onClick={sendNotification} disabled={notifying || selected.size === 0 || notifySent}>{notifySent ? "Sent" : notifying ? "Sending…" : `Send to ${selected.size}`}</button>
              <button type="button" className="btn" onClick={() => setNotifyOpen(false)}>Skip</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
