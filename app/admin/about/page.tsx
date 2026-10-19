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

const defaultBio = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }] };

export default function AdminAboutPage() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [openToWork, setOpenToWork] = useState(true);
  const [bio, setBio] = useState<object>(defaultBio);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch("/api/about");
        const data = await res.json();
        if (data.about) {
          setName(data.about.name || "");
          setTitle(data.about.title || "");
          setProfileImage(data.about.profileImage || "");
          setResumeLink(data.about.resumeLink || "");
          setGithubUrl(data.about.githubUrl || "");
          setLinkedinUrl(data.about.linkedinUrl || "");
          setOpenToWork(data.about.openToWork ?? true);
          if (data.about.bio && Object.keys(data.about.bio).length > 0) setBio(data.about.bio);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  const handleUpload = async (file: File, context: string, onSuccess: (url: string) => void, setUploading: (v: boolean) => void) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", context);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) onSuccess(data.url);
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
      await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, title, profileImage, resumeLink, githubUrl, linkedinUrl, openToWork, bio }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="acard"><p className="muted" style={{ margin: 0 }}>Loading profile…</p></div>;

  return (
    <form onSubmit={handleSave} style={{ display: "contents" }}>
      <PageHead title="About" sub="Shown on the About page and across the site" actions={<button type="submit" className="btn p" disabled={saving}><Icon name="check" size={16} /> {saving ? "Saving…" : saved ? "Saved" : "Save changes"}</button>} />
      <div className="agrid">
        <div className="acard">
          <div className="hd"><h3>Profile</h3></div>
          <div className="formgrid">
            <div><label className="label" htmlFor="a-name">Name</label><input id="a-name" className="in" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div><label className="label" htmlFor="a-title">Title</label><input id="a-title" className="in" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><label className="label" htmlFor="a-gh">GitHub</label><input id="a-gh" className="in" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/…" /></div>
            <div><label className="label" htmlFor="a-li">LinkedIn</label><input id="a-li" className="in" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/…" /></div>
            <div className="full">
              <label className="switch" role="switch" aria-checked={openToWork} tabIndex={0} onClick={() => setOpenToWork((v) => !v)} onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setOpenToWork((v) => !v); } }}>
                <span className={"tr" + (openToWork ? "" : " off")} />
                <span><b>Show &quot;Open to new roles&quot; on the site</b><br /><span className="muted" style={{ fontSize: 12.5 }}>Highlighted pill on Home and the Availability card on About</span></span>
              </label>
            </div>
            <div className="full">
              <label className="label">Bio</label>
              <TipTapEditor content={bio} onChange={setBio} />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="acard">
            <div className="hd"><h3>Photo</h3></div>
            <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, "profile-photo", setProfileImage, setUploadingPhoto); e.target.value = ""; }} />
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              {profileImage ? <Image src={profileImage} alt="Profile photo" width={84} height={84} style={{ width: 84, height: 84, borderRadius: 14, objectFit: "cover", border: "1px solid var(--line)" }} /> : <span style={{ width: 84, height: 84, borderRadius: 14, background: "var(--surface-2)", display: "grid", placeItems: "center", font: "800 28px var(--f-display)" }}>{name.charAt(0) || "?"}</span>}
              <button type="button" className="btn s" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}>{uploadingPhoto ? "Uploading…" : profileImage ? "Replace" : "Upload photo"}</button>
            </div>
          </div>
          <div className="acard">
            <div className="hd"><h3>Résumé</h3></div>
            <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, "resume", setResumeLink, setUploadingResume); e.target.value = ""; }} />
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {resumeLink && <span className="pill good nodot"><Icon name="check" size={13} /> File uploaded</span>}
              <button type="button" className="btn s" onClick={() => resumeInputRef.current?.click()} disabled={uploadingResume}><Icon name="download" size={14} /> {uploadingResume ? "Uploading…" : resumeLink ? "Replace file" : "Upload résumé"}</button>
              {resumeLink && <a href={resumeLink} target="_blank" rel="noopener noreferrer" className="btn s t">View current <Icon name="ext" size={13} /></a>}
            </div>
            <p className="muted" style={{ fontSize: 12.5, margin: "10px 0 0" }}>Downloads are counted as events in Visitors.</p>
          </div>
        </div>
      </div>
    </form>
  );
}
