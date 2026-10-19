"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HeroStack from "@/components/hero/HeroStack";
import Icon from "@/components/ui/Icon";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="logincard">
      <div className="loginl">
        <div style={{ display: "flex", gap: 10, alignItems: "center", font: "800 16px var(--f-display)" }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--primary)", color: "#fff", display: "grid", placeItems: "center", fontSize: 13 }}>SN</span>
          Portfolio admin
        </div>
        <HeroStack forceDark />
        <div>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 36px)", color: "#fff" }}>Write. Publish.<br />See who read it.</h2>
          <p style={{ color: "#aab4cc", margin: "10px 0 0", maxWidth: "36ch" }}>Manage your blogs, projects and skills, and watch how visitors find and read them.</p>
        </div>
      </div>
      <form className="loginr" onSubmit={handleSubmit}>
        <div>
          <h1 style={{ fontSize: 26 }}>Sign in</h1>
          <p className="muted" style={{ margin: "6px 0 0" }}>Private area. Only you can get in.</p>
        </div>
        {error && <div role="alert" className="loginerr">{error}</div>}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" className="in" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="username" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" className="in" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
        </div>
        <button type="submit" disabled={loading} className="btn p">
          <Icon name="lock" size={16} /> {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="muted" style={{ fontSize: 12.5, margin: 0 }}>Protected by a signed login cookie that expires on its own.</p>
      </form>
    </div>
  );
}
