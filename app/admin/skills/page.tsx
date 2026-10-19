"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import PageHead from "@/components/admin/PageHead";
import Icon from "@/components/ui/Icon";
import { displaySkill } from "@/lib/stack";

interface Skill { id: string; name: string; icon: string; category: string; displayOrder: number }

const COLORS = ["var(--c1)", "var(--c2)", "var(--c5)", "var(--c3)", "var(--c4)", "var(--c1)"];
const NEW_CATEGORY = "__new__";

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragCat, setDragCat] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchSkills(); }, []);

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

  // Categories in the order they appear on the site (first appearance by displayOrder).
  const categories = useMemo(() => {
    const order: string[] = [];
    for (const s of skills) if (!order.includes(s.category)) order.push(s.category);
    return order;
  }, [skills]);
  const effectiveCategory = category === NEW_CATEGORY ? newCategory.trim() : category || categories[0] || "";

  const resetForm = () => { setEditingId(null); setName(""); setCategory(""); setNewCategory(""); setIconUrl(""); };

  const handleIconUpload = async (file: File) => {
    if (!name) { alert("Please enter the skill name first so the icon is named correctly."); return; }
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !effectiveCategory) return;
    setSaving(true);
    try {
      const res = await fetch("/api/skills", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, name: name.trim(), category: effectiveCategory, icon: iconUrl } : { name: name.trim(), category: effectiveCategory, icon: iconUrl }),
      });
      if (res.ok) { resetForm(); fetchSkills(); }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (s: Skill) => {
    setEditingId(s.id); setName(s.name); setCategory(s.category); setIconUrl(s.icon);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  // Reorder categories: rewrite displayOrder so category N occupies N*100 + position.
  const dropOn = async (target: string) => {
    if (!dragCat || dragCat === target) { setDragCat(null); return; }
    const next = categories.filter((c) => c !== dragCat);
    next.splice(next.indexOf(target) + (categories.indexOf(dragCat) < categories.indexOf(target) ? 1 : 0), 0, dragCat);
    setDragCat(null);
    const updated = skills.map((s) => ({ ...s, displayOrder: next.indexOf(s.category) * 100 + skills.filter((x) => x.category === s.category).indexOf(s) }));
    setSkills([...updated].sort((a, b) => a.displayOrder - b.displayOrder));
    await Promise.all(updated.map((s) => fetch("/api/skills", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: s.id, displayOrder: s.displayOrder }) })));
  };

  return (
    <>
      <PageHead title="Skills" sub={`${skills.length} skills in ${categories.length} categories. Drag a category to reorder.`} />

      <form onSubmit={handleSave} className="acard">
        <div className="hd">
          <div>
            <h3>{editingId ? "Edit skill" : "Add a skill"}</h3>
            <p>The icon is optional. A letter tile is used until you upload one.</p>
          </div>
          {editingId && <button type="button" className="btn s" onClick={resetForm}>Cancel</button>}
        </div>
        <input ref={iconInputRef} type="file" accept="image/*,.svg" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleIconUpload(f); e.target.value = ""; }} />
        <div className="skadd">
          <div>
            <label className="label" htmlFor="sk-name">Name</label>
            <input id="sk-name" className="in" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kafka" required />
          </div>
          <div>
            <label className="label" htmlFor="sk-cat">Category</label>
            <select id="sk-cat" className="in" value={category || categories[0] || NEW_CATEGORY} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value={NEW_CATEGORY}>New category…</option>
            </select>
            {(category === NEW_CATEGORY || categories.length === 0) && (
              <input className="in" style={{ marginTop: 8 }} value={newCategory} onChange={(e) => { setCategory(NEW_CATEGORY); setNewCategory(e.target.value); }} placeholder="Category name" aria-label="New category name" required />
            )}
          </div>
          <button type="button" className="btn" onClick={() => iconInputRef.current?.click()} disabled={uploadingIcon}>
            {iconUrl ? <Image src={iconUrl} alt="Icon preview" width={18} height={18} style={{ objectFit: "contain" }} /> : <Icon name="image" size={16} />} {uploadingIcon ? "Uploading…" : iconUrl ? "Change icon" : "Upload icon"}
          </button>
          <button type="submit" className="btn p" disabled={saving}>
            <Icon name={editingId ? "check" : "plus"} size={16} /> {saving ? "Saving…" : editingId ? "Save skill" : "Add skill"}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="acard"><p className="muted" style={{ margin: 0 }}>Loading skills…</p></div>
      ) : skills.length === 0 ? (
        <div className="acard"><p className="muted" style={{ margin: 0 }}>No skills yet. Add your first skill above.</p></div>
      ) : (
        <div className="acard">
          <div className="skrows">
            {categories.map((cat, ci) => (
              <div
                key={cat}
                className={"skrow" + (dragCat === cat ? " dragging" : "")}
                draggable
                onDragStart={() => setDragCat(cat)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dropOn(cat)}
                onDragEnd={() => setDragCat(null)}
              >
                <div className="cat">
                  <span className="grip" aria-hidden="true"><Icon name="grip" size={16} /></span>
                  {cat}
                  <small>{skills.filter((s) => s.category === cat).length}</small>
                </div>
                <div className="items" style={{ "--lc": COLORS[ci % COLORS.length] } as React.CSSProperties}>
                  {skills.filter((s) => s.category === cat).map((s) => (
                    <span key={s.id} className="skchip">
                      {s.icon ? <i className="img"><Image src={s.icon} alt="" width={18} height={18} style={{ objectFit: "contain" }} /></i> : <i>{displaySkill(s.name).charAt(0)}</i>}
                      {displaySkill(s.name)}
                      <span className="x">
                        <button type="button" title={`Edit ${s.name}`} aria-label={`Edit ${s.name}`} onClick={() => startEdit(s)}><Icon name="edit" size={13} /></button>
                        <button type="button" title={`Delete ${s.name}`} aria-label={`Delete ${s.name}`} onClick={() => deleteSkill(s.id)}><Icon name="trash" size={13} /></button>
                      </span>
                    </span>
                  ))}
                  <button type="button" className="skchip add" onClick={() => { resetForm(); setCategory(cat); window.scrollTo({ top: 0, behavior: "smooth" }); document.getElementById("sk-name")?.focus(); }}>
                    <Icon name="plus" size={14} /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
