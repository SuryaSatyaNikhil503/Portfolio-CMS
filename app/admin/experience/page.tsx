"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Experience {
  id: string;
  company: string;
  role: string;
  companyLogo: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchExperiences();
  }, []);

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

  const handleLogoUpload = async (file: File) => {
    if (!company) {
      alert("Please enter the company name first so the logo is named correctly.");
      return;
    }
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", `logo:${company}`);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setLogoUrl(data.url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role,
          companyLogo: logoUrl,
          location,
          startDate,
          endDate,
          description,
        }),
      });
      if (res.ok) {
        setCompany("");
        setRole("");
        setLocation("");
        setStartDate("");
        setEndDate("");
        setDescription("");
        setLogoUrl("");
        setShowForm(false);
        fetchExperiences();
      }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Experience</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your work experience</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Experience
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Company</label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" className="input-field" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Role</label>
              <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Software Engineer" className="input-field" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="San Francisco, CA" className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Start</label>
                <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Jan 2023" className="input-field" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">End</label>
                <input type="text" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="Present" className="input-field" />
              </div>
            </div>
          </div>

          {/* Company Logo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Company Logo</label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoUpload(file);
              }}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="btn-outline text-sm disabled:opacity-50"
              >
                {uploadingLogo ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Logo
                  </span>
                )}
              </button>
              {logoUrl && (
                <Image src={logoUrl} alt="Logo preview" width={40} height={40} className="w-10 h-10 rounded-lg object-contain bg-muted/30 p-1" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of your role..." className="input-field min-h-[80px] resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">
              {saving ? "Adding..." : "Add Experience"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : experiences.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">No experience yet</h3>
          <p className="text-sm text-muted-foreground">Add your professional history above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="glass rounded-2xl p-5 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {exp.companyLogo && (
                    <Image src={exp.companyLogo} alt={exp.company} width={40} height={40} className="w-10 h-10 rounded-lg object-contain bg-muted/30 p-1 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground">{exp.role}</h3>
                    <p className="text-primary text-sm">{exp.company}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {exp.startDate} — {exp.endDate} {exp.location && `· ${exp.location}`}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-muted-foreground mt-3">{exp.description}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => deleteExperience(exp.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
