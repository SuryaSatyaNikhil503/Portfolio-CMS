"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import PageHead from "@/components/admin/PageHead";
import Icon from "@/components/ui/Icon";

interface Experience {
  id: string; company: string; role: string; companyLogo: string; location: string; startDate: string; endDate: string; description: string;
}

const EMPTY = { company: "", role: "", location: "", startDate: "", endDate: "Present", description: "", logo: "" };

export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [f, setF] = useState(EMPTY);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchExperiences(); }, []);

  const fetchExperiences = async () => {
    try {
      const res = await fetch("/api/experience");
      const data = await res.json();
      setExperiences(data.experiences || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof typeof EMPTY, v: string) => setF((p) => ({ ...p, [k]: v }));
  const close = () => { setOpen(false); setEditingId(null); setF(EMPTY); };
  const startEdit = (e: Experience) => {
    setEditingId(e.id);
    setF({ company: e.company, role: e.role, location: e.location, startDate: e.startDate, endDate: e.endDate, description: e.description, logo: e.companyLogo });
    setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogoUpload = async (file: File) => {
    if (!f.company) { alert("Please enter the company name first so the logo is named correctly."); return; }
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", `logo:${f.company}`);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) set("logo", data.url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { company: f.company, role: f.role, companyLogo: f.logo, location: f.location, startDate: f.startDate, endDate: f.endDate, description: f.description };
      const res = await fetch("/api/experience", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      if (res.ok) { close(); fetchExperiences(); }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const deleteExperience = async (id: string) => {
    if (!confirm("Delete this experience?")) return;
    try {
      await fetch(`/api/experience?id=${id}`, { method: "DELETE" });
      setExperiences(experiences.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <PageHead
        title="Experience"
        sub={`${experiences.length} role${experiences.length !== 1 ? "s" : ""}`}
        actions={!open ? <button type="button" className="btn p" onClick={() => setOpen(true)}><Icon name="plus" size={16} /> Add role</button> : undefined}
      />

      {open && (
        <div className="agrid">
          <form onSubmit={handleSave} className="acard">
            <div className="hd"><h3>{editingId ? "Edit role" : "Add role"}</h3></div>
            <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) handleLogoUpload(file); e.target.value = ""; }} />
            <div className="formgrid">
              <div><label className="label" htmlFor="x-company">Company</label><input id="x-company" className="in" value={f.company} onChange={(e) => set("company", e.target.value)} required /></div>
              <div><label className="label" htmlFor="x-role">Role</label><input id="x-role" className="in" value={f.role} onChange={(e) => set("role", e.target.value)} required /></div>
              <div><label className="label" htmlFor="x-start">Start</label><input id="x-start" className="in" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} placeholder="Jan 2023" required /></div>
              <div><label className="label" htmlFor="x-end">End</label><input id="x-end" className="in" value={f.endDate} onChange={(e) => set("endDate", e.target.value)} placeholder="Present" /></div>
              <div className="full"><label className="label" htmlFor="x-loc">Location</label><input id="x-loc" className="in" value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Hyderabad" /></div>
              <div className="full">
                <label className="label">Company logo</label>
                <button type="button" className="btn" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}>
                  {f.logo ? <Image src={f.logo} alt="Logo preview" width={18} height={18} style={{ objectFit: "contain" }} /> : <Icon name="image" size={16} />} {uploadingLogo ? "Uploading…" : f.logo ? "Change logo" : "Upload logo"}
                </button>
              </div>
              <div className="full"><label className="label" htmlFor="x-desc">What you did</label><textarea id="x-desc" className="in" style={{ minHeight: 130 }} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
            </div>
            <div className="toolbar" style={{ marginTop: 14 }}>
              <button type="submit" className="btn p" disabled={saving}><Icon name="check" size={16} /> {saving ? "Saving…" : editingId ? "Save" : "Add role"}</button>
              <button type="button" className="btn" onClick={close}>Cancel</button>
            </div>
          </form>
          <div className="acard">
            <div className="hd"><h3>Preview</h3><span className="muted" style={{ fontSize: 12.5 }}>As shown on the site</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "48px minmax(0, 1fr)", gap: 12 }}>
              <span style={{ width: 48, height: 48, borderRadius: 10, border: "1px solid var(--line)", display: "grid", placeItems: "center", font: "800 16px var(--f-display)", color: "var(--primary)", background: "var(--surface-2)", overflow: "hidden" }}>
                {f.logo ? <Image src={f.logo} alt="" width={40} height={40} style={{ objectFit: "contain" }} /> : (f.company || "?").slice(0, 2)}
              </span>
              <div>
                <b>{f.role || "Role"}</b>
                <div className="muted" style={{ fontSize: 13 }}>{f.company || "Company"} · {f.startDate || "Start"} – {f.endDate || "End"}{f.location ? ` · ${f.location}` : ""}</div>
                {f.description && <p className="muted" style={{ fontSize: 13.5, margin: "8px 0 0" }}>{f.description}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="acard"><p className="muted" style={{ margin: 0 }}>Loading…</p></div>
      ) : experiences.length === 0 ? (
        <div className="acard"><p className="muted" style={{ margin: 0 }}>No experience yet. Add your professional history above.</p></div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {experiences.map((exp) => (
            <div key={exp.id} className="acard" style={{ display: "grid", gridTemplateColumns: "48px minmax(0, 1fr) auto", gap: 14, alignItems: "start" }}>
              <span style={{ width: 48, height: 48, borderRadius: 10, border: "1px solid var(--line)", display: "grid", placeItems: "center", font: "800 16px var(--f-display)", color: "var(--primary)", background: "var(--surface-2)", overflow: "hidden" }}>
                {exp.companyLogo ? <Image src={exp.companyLogo} alt={exp.company} width={40} height={40} style={{ objectFit: "contain" }} /> : exp.company.slice(0, 2)}
              </span>
              <div style={{ minWidth: 0 }}>
                <b>{exp.role}</b>
                <div className="muted" style={{ fontSize: 13 }}>{exp.company} · {exp.startDate} — {exp.endDate}{exp.location ? ` · ${exp.location}` : ""}</div>
                {exp.description && <p className="muted" style={{ fontSize: 13.5, margin: "8px 0 0" }}>{exp.description}</p>}
              </div>
              <div className="toolbar">
                <button type="button" className="btn s" onClick={() => startEdit(exp)}><Icon name="edit" size={14} /> Edit</button>
                <button type="button" className="btn s" onClick={() => deleteExperience(exp.id)} aria-label={`Delete ${exp.role}`}><Icon name="trash" size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
