"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";

interface Counts { blogs: number; projects: number; skills: number }

const groups: { title: string; items: { name: string; href: string; icon: IconName; count?: keyof Counts }[] }[] = [
  { title: "Overview", items: [
    { name: "Dashboard", href: "/admin", icon: "home" },
    { name: "Visitors", href: "/admin/analytics", icon: "chart" },
  ] },
  { title: "Content", items: [
    { name: "Blogs", href: "/admin/blogs", icon: "book", count: "blogs" },
    { name: "Projects", href: "/admin/projects", icon: "folder", count: "projects" },
    { name: "Skills", href: "/admin/skills", icon: "bulb", count: "skills" },
    { name: "Experience", href: "/admin/experience", icon: "brief" },
    { name: "About", href: "/admin/about", icon: "user" },
  ] },
  { title: "Community", items: [
    { name: "Comments", href: "/admin/comments", icon: "msg" },
    { name: "Subscribers", href: "/admin/subscribers", icon: "mail" },
  ] },
];

export default function AdminSidebar({ counts }: { counts: Counts }) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="side" aria-label="Admin">
      <Link href="/admin" className="sb"><i>SN</i>Portfolio admin</Link>
      {groups.map((g) => (
        <div key={g.title} style={{ display: "contents" }}>
          <h4>{g.title}</h4>
          {g.items.map((l) => {
            const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href} className={"it" + (active ? " on" : "")} aria-current={active ? "page" : undefined}>
                <Icon name={l.icon} size={18} /> {l.name}
                {l.count && <span className="n">{counts[l.count]}</span>}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="me">
        <button type="button" className="it" onClick={() => setTheme(dark ? "light" : "dark")} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} suppressHydrationWarning>
          <Icon name={dark ? "sun" : "moon"} size={18} /> {dark ? "Light mode" : "Dark mode"}
        </button>
        <Link href="/" className="it"><Icon name="ext" size={18} /> View site</Link>
        <button type="button" className="it" onClick={handleLogout}><Icon name="back" size={18} /> Logout</button>
      </div>
    </aside>
  );
}
