"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Skill {
  id: string;
  name: string;
  icon: string;
  category: string;
  displayOrder: number;
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [saving, setSaving] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch("/api/skills");
      const data = await res.json();
      setSkills(data.skills || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIconUpload = async (file: File) => {
    if (!name) {
      alert("Please enter the skill name first so the icon is named correctly.");
      return;
    }
    setUploadingIcon(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", `skill:${name}`);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setIconUrl(data.url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, icon: iconUrl }),
      });
      if (res.ok) {
        setName("");
        setCategory("");
        setIconUrl("");
        setShowForm(false);
        fetchSkills();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const deleteSkill = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
    try {
      await fetch(`/api/skills?id=${id}`, { method: "DELETE" });
      setSkills(skills.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skills</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your skills and technologies</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Skill
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="React" className="input-field" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Frontend" className="input-field" required />
            </div>
          </div>

          {/* Icon Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Icon</label>
            <input
              ref={iconInputRef}
              type="file"
              accept="image/*,.svg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleIconUpload(file);
              }}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => iconInputRef.current?.click()}
                disabled={uploadingIcon}
                className="btn-outline text-sm disabled:opacity-50"
              >
                {uploadingIcon ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Icon
                  </span>
                )}
              </button>
              {iconUrl && (
                <Image src={iconUrl} alt="Icon preview" width={40} height={40} className="w-10 h-10 object-contain" />
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">
              {saving ? "Adding..." : "Add Skill"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : skills.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">No skills yet</h3>
          <p className="text-sm text-muted-foreground">Add your first skill above.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, categorySkills]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full gradient-bg" />
                {category}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {categorySkills.map((skill) => (
                  <div key={skill.id} className="glass rounded-xl p-4 text-center relative group card-hover">
                    <button
                      onClick={() => deleteSkill(skill.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {skill.icon ? (
                      <Image src={skill.icon} alt={skill.name} width={40} height={40} className="w-10 h-10 mx-auto mb-2 object-contain" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg gradient-bg opacity-50 flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-sm">{skill.name.charAt(0)}</span>
                      </div>
                    )}
                    <span className="text-xs font-medium text-muted-foreground">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
