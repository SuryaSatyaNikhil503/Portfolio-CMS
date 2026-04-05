"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    profession: "",
    location: "",
    phone: "",
  });
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
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("success");
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
      <div className="text-center py-4">
        <div className="text-3xl mb-2">🎉</div>
        <p className="text-primary font-semibold">You&apos;re subscribed!</p>
        <p className="text-muted-foreground text-sm mt-1">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your name *"
          className="input-field text-sm !py-2.5"
          required
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="your@email.com *"
          className="input-field text-sm !py-2.5"
          required
        />
        <input
          type="text"
          name="profession"
          value={form.profession}
          onChange={handleChange}
          placeholder="Profession (optional)"
          className="input-field text-sm !py-2.5"
        />
        <input
          type="text"
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location (optional)"
          className="input-field text-sm !py-2.5"
        />
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone number (optional)"
          className="input-field text-sm !py-2.5 sm:col-span-2"
        />
      </div>

      {message && status === "error" && (
        <p className="text-xs text-red-400">{message}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full text-sm disabled:opacity-50"
      >
        {status === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Subscribing...
          </span>
        ) : (
          "Subscribe to Newsletter"
        )}
      </button>
      <p className="text-xs text-muted-foreground text-center">
        No spam. Unsubscribe anytime. I&apos;ll notify you when I publish new articles.
      </p>
    </form>
  );
}
