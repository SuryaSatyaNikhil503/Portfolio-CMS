"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import PageHead from "@/components/admin/PageHead";
import Icon from "@/components/ui/Icon";

const TipTapEditor = dynamic(() => import("@/editor/TipTapEditor"), {
  ssr: false,
  loading: () => <div className="acard"><p className="muted" style={{ margin: 0 }}>Loading editor…</p></div>,
});

interface Project {
  id: string; title: string; slug: string; thumbnail: string; techStack: string[]; githubLink: string; liveDemoLink: string; featured: boolean; hasDescription: boolean;
}
const EMPTY_DOC = { type: "doc", content: [] };

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [techStack, setTechStack] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [liveDemoLink, setLiveDemoLink] = useState("");
  const [featured, setFeatured] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [description, setDescription] = useState<object>(EMPTY_DOC);
  const [editorKey, setEditorKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const thumbRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/admin/projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setOpen(false); setEditingSlug(null); setTitle(""); setTechStack(""); setGithubLink(""); setLiveDemoLink(""); setFeatured(false); setThumbnailUrl(""); setDescription(EMPTY_DOC); setEditorKey((k) => k + 1); };

  const startEdit = async (p: Project) => {
    const res = await fetch(`/api/projects/${p.slug}`);
    const data = await res.json();
    setEditingSlug(p.slug); setTitle(p.title); setTechStack(p.techStack.join(", ")); setGithubLink(p.githubLink); setLiveDemoLink(p.liveDemoLink); setFeatured(p.featured); setThumbnailUrl(p.thumbnail);
    setDescription(data.project?.description ?? EMPTY_DOC); setEditorKey((k) => k + 1); setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleThumbnailUpload = async (file: File) => {
    setUploading(true);
    try {
      const slug = editingSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "untitled";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", `project:${slug}`);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setThumbnailUrl(data.url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { title, thumbnail: thumbnailUrl, techStack: techStack.split(",").map((t) => t.trim()).filter(Boolean), githubLink, liveDemoLink, featured, description };
      const res = await fetch(editingSlug ? `/api/projects/${editingSlug}` : "/api/projects", { method: editingSlug ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { reset(); fetchProjects(); }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (p: Project) => {
    await fetch(`/api/projects/${p.slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featured: !p.featured }) });
    setProjects(projects.map((x) => (x.id === p.id ? { ...x, featured: !p.featured } : x)));
  };

  const deleteProject = async (slug: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      await fetch(`/api/projects/${slug}`, { method: "DELETE" });
      setProjects(projects.filter((p) => p.slug !== slug));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <PageHead title="Projects" sub={`${projects.length} project${projects.length !== 1 ? "s" : ""}`} actions={!open ? <button type="button" className="btn p" onClick={() => setOpen(true)}><Icon name="plus" size={16} /> Add project</button> : undefined} />

      {open && (
        <form onSubmit={handleSave} className="acard">
          <div className="hd"><h3>{editingSlug ? "Edit project" : "Add project"}</h3></div>
          <input ref={thumbRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleThumbnailUpload(f); e.target.value = ""; }} />
          <div className="formgrid">
            <div className="full"><label className="label" htmlFor="p-title">Title</label><input id="p-title" className="in" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
            <div className="full"><label className="label" htmlFor="p-tech">Tech stack <span className="muted">(comma separated)</span></label><input id="p-tech" className="in" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="Java 17, Spring Boot, MySQL" /></div>
            <div><label className="label" htmlFor="p-gh">GitHub link</label><input id="p-gh" className="in" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} /></div>
            <div><label className="label" htmlFor="p-live">Live demo link</label><input id="p-live" className="in" value={liveDemoLink} onChange={(e) => setLiveDemoLink(e.target.value)} /></div>
            <div className="full" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" className="btn" onClick={() => thumbRef.current?.click()} disabled={uploading}>
                {thumbnailUrl ? <Image src={thumbnailUrl} alt="Thumbnail preview" width={18} height={18} style={{ objectFit: "cover", borderRadius: 3 }} /> : <Icon name="image" size={16} />} {uploading ? "Uploading…" : thumbnailUrl ? "Change thumbnail" : "Upload thumbnail"}
              </button>
              <label className="switch" role="switch" aria-checked={featured} tabIndex={0} onClick={() => setFeatured((v) => !v)} onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFeatured((v) => !v); } }}>
                <span className={"tr" + (featured ? "" : " off")} /><span><b>Featured</b></span>
              </label>
            </div>
            <div className="full">
              <label className="label">Description <span className="muted">(shown on the project page)</span></label>
              <TipTapEditor key={editorKey} content={description} onChange={setDescription} blogSlug={editingSlug ?? undefined} />
            </div>
          </div>
          <div className="toolbar" style={{ marginTop: 14 }}>
            <button type="submit" className="btn p" disabled={saving}><Icon name="check" size={16} /> {saving ? "Saving…" : editingSlug ? "Save project" : "Add project"}</button>
            <button type="button" className="btn" onClick={reset}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="acard"><p className="muted" style={{ margin: 0 }}>Loading projects…</p></div>
      ) : projects.length === 0 ? (
        <div className="acard"><p className="muted" style={{ margin: 0 }}>No projects yet. Add your first project above.</p></div>
      ) : (
        <div className="acard">
          <div className="tblwrap">
            <table className="tbl">
              <thead><tr><th>Project</th><th>Stack</th><th>Featured</th><th>Links</th><th /></tr></thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td className="tt">
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        {p.thumbnail ? <Image src={p.thumbnail} alt="" width={54} height={40} style={{ width: 54, height: 40, objectFit: "cover", borderRadius: 8, flex: "none" }} /> : <span className="ph v1" style={{ width: 54, height: 40, borderRadius: 8, flex: "none" }} />}
                        <div>{p.title}<small>/projects/{p.slug}</small></div>
                      </div>
                    </td>
                    <td><div className="chips">{p.techStack.slice(0, 3).map((t) => <span key={t} className="chip mono">{t}</span>)}{p.techStack.length > 3 && <span className="chip mono">+{p.techStack.length - 3}</span>}</div></td>
                    <td><button type="button" className={"pill " + (p.featured ? "good" : "nodot")} style={{ border: 0, cursor: "pointer" }} onClick={() => toggleFeatured(p)}>{p.featured ? "Featured" : "Off"}</button></td>
                    <td>{p.githubLink ? <><Icon name="code" size={15} /> <span className="muted">GitHub</span></> : <span className="muted">—</span>}{p.liveDemoLink ? <> · <Icon name="ext" size={14} /> <span className="muted">Live</span></> : null}</td>
                    <td className="num" style={{ whiteSpace: "nowrap" }}>
                      {!p.hasDescription && <span className="pill warn" style={{ marginRight: 8 }}>No description</span>}
                      <button type="button" className="btn s" onClick={() => startEdit(p)}><Icon name="edit" size={14} /> Edit</button>{" "}
                      <button type="button" className="btn s" onClick={() => deleteProject(p.slug)} aria-label={`Delete ${p.title}`}><Icon name="trash" size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
