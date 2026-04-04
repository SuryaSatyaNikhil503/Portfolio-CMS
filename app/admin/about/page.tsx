"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

const TipTapEditor = dynamic(() => import("@/editor/TipTapEditor"), {
  ssr: false,
  loading: () => (
    <div className="glass rounded-xl p-4 min-h-[200px] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

const defaultBio = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "" }],
    },
  ],
};

export default function AdminAboutPage() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
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
          if (data.about.bio && Object.keys(data.about.bio).length > 0) {
            setBio(data.about.bio);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  const handleUpload = async (
    file: File,
    context: string,
    onSuccess: (url: string) => void,
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", context);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        onSuccess(data.url);
      }
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
        body: JSON.stringify({
          name,
          title,
          profileImage,
          resumeLink,
          githubUrl,
          linkedinUrl,
          bio,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">About Section</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Update your profile information
        </p>
      </div>

      <form onSubmit={handleSave} className="glass rounded-2xl p-6 space-y-5">
        {/* Profile Preview */}
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center overflow-hidden flex-shrink-0">
            {profileImage ? (
              <Image
                src={profileImage}
                alt="Profile"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {name ? name.charAt(0).toUpperCase() : "?"}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">{name || "Your Name"}</p>
            <p className="text-sm text-muted-foreground">{title || "Your Title"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="input-field"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Full-Stack Software Engineer"
            className="input-field"
          />
        </div>

        {/* Profile Photo Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Profile Photo
          </label>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleUpload(file, "profile-photo", setProfileImage, setUploadingPhoto);
              }
            }}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="btn-outline text-sm disabled:opacity-50"
            >
              {uploadingPhoto ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {profileImage ? "Replace Photo" : "Upload Photo"}
                </span>
              )}
            </button>
            {profileImage && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Photo uploaded
              </span>
            )}
          </div>
        </div>

        {/* Resume Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Resume
          </label>
          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleUpload(file, "resume", setResumeLink, setUploadingResume);
              }
            }}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => resumeInputRef.current?.click()}
              disabled={uploadingResume}
              className="btn-outline text-sm disabled:opacity-50"
            >
              {uploadingResume ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {resumeLink ? "Replace Resume" : "Upload Resume"}
                </span>
              )}
            </button>
            {resumeLink && (
              <a
                href={resumeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                View Current Resume ↗
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              GitHub URL
            </label>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
              className="input-field"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              LinkedIn URL
            </label>
            <input
              type="text"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="input-field"
            />
          </div>
        </div>

        {/* TipTap Bio Editor */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Bio</label>
          <TipTapEditor
            content={bio}
            onChange={(content: object) => setBio(content)}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
