"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

function currentSessionId(): string | undefined {
  try { return sessionStorage.getItem("sid") ?? undefined; } catch { return undefined; }
}

export default function NewsletterForm() {
  const [form, setForm] = useState({ name: "", email: "", profession: "", location: "", phone: "" });
  const [linkSession, setLinkSession] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, linkSession, sessionId: linkSession ? currentSessionId() : undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        window.dispatchEvent(new CustomEvent("track:event", { detail: "newsletter_subscribe" }));
        setMessage(data.message || "Subscribed!");
        setForm({ name: "", email: "", profession: "", location: "", phone: "" });
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong");
    }
    setTimeout(() => { setStatus("idle"); setMessage(""); }, 4000);
  };

  if (status === "success") {
    return (
      <div className="newsdone" role="status">
        <Icon name="check" size={22} />
        <div>
          <b>You&apos;re subscribed!</b>
          <span>{message}</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="formcol">
      <div className="fields">
        <input className="in" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your name *" aria-label="Your name" required />
        <input className="in" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com *" aria-label="Email" required />
        <input className="in" type="text" name="profession" value={form.profession} onChange={handleChange} placeholder="Profession" aria-label="Profession" />
        <input className="in" type="text" name="location" value={form.location} onChange={handleChange} placeholder="Location" aria-label="Location" />
        <input className="in full" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (optional)" aria-label="Phone" />
      </div>
      <label className="chk">
        <input type="checkbox" checked={linkSession} onChange={(e) => setLinkSession(e.target.checked)} />
        <span>Also let me see which pages I read before subscribing (optional)</span>
      </label>
      <div className="form">
        <button type="submit" className="btn" disabled={status === "loading"}>
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
        {status === "error" && <span className="newserr" role="alert">{message}</span>}
      </div>
    </form>
  );
}
