"use client";

import { useState, useEffect, useRef } from "react";

interface Project {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  techStack: string[];
  githubLink: string;
  liveDemoLink: string;
  featured: boolean;
  createdAt: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [techStack, setTechStack] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [liveDemoLink, setLiveDemoLink] = useState("");
  const [featured, setFeatured] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [saving, setSaving] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailUpload = async (file: File) => {
    setUploadingThumbnail(true);
    try {
      // Generate slug from title for folder naming
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "untitled";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", `project:${slug}`);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setThumbnailUrl(data.url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          thumbnail: thumbnailUrl,
          techStack: techStack.split(",").map((t) => t.trim()).filter(Boolean),
          githubLink,
          liveDemoLink,
          featured,
          description: { type: "doc", content: [] },
        }),
      });
      if (res.ok) {
        setTitle("");
        setTechStack("");
        setGithubLink("");
        setLiveDemoLink("");
        setFeatured(false);
        setThumbnailUrl("");
        setShowForm(false);
        fetchProjects();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your portfolio projects</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Project
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" className="input-field" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tech Stack (comma separated)</label>
              <input type="text" value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, Node.js, PostgreSQL" className="input-field" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">GitHub Link</label>
              <input type="text" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} placeholder="https://github.com/..." className="input-field" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Live Demo Link</label>
              <input type="text" value={liveDemoLink} onChange={(e) => setLiveDemoLink(e.target.value)} placeholder="https://..." className="input-field" />
            </div>
          </div>

          {/* Thumbnail upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Thumbnail</label>
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={uploadingThumbnail}
                className="btn-outline text-sm disabled:opacity-50"
              >
                {uploadingThumbnail ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Thumbnail
                  </span>
                )}
              </button>
              {thumbnailUrl && (
                <img src={thumbnailUrl} alt="Thumbnail preview" className="w-12 h-12 rounded-lg object-cover" />
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm text-foreground">Featured Project</span>
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">
              {saving ? "Creating..." : "Create Project"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : projects.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
          <p className="text-sm text-muted-foreground">Add your first project above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="glass rounded-2xl p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {project.thumbnail && (
                    <img src={project.thumbnail} alt={project.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground">{project.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => deleteProject(project.slug)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <span key={tech} className="badge text-[10px]">{tech}</span>
                ))}
              </div>
              {project.featured && (
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  ★ Featured
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
