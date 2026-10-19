"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import Icon from "@/components/ui/Icon";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Skills", href: "/skills" },
  { name: "Experience", href: "/experience" },
  { name: "Projects", href: "/projects" },
  { name: "Blogs", href: "/blogs" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="pnav fixed inset-x-0 top-0 z-50 !py-0 h-16">
      <Link href="/" className="logo" aria-label="Nikhil, home">
        SN<span className="sr-only"> Nikhil</span>
      </Link>

      <nav className="plinks" aria-label="Main">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className={pathname === link.href ? "on" : undefined} aria-current={pathname === link.href ? "page" : undefined}>
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="right">
        <ThemeToggle />
        <a className="btn s p" href="/api/resume/download" data-resume>
          <Icon name="download" size={15} /> Résumé
        </a>
        <button type="button" className="tbtn menu-btn" aria-label="Toggle menu" aria-expanded={isOpen} onClick={() => setIsOpen((o) => !o)}>
          <Icon name={isOpen ? "x" : "menu"} size={18} />
        </button>
      </div>

      {isOpen && (
        <nav className="pnav-sheet" aria-label="Mobile">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className={pathname === link.href ? "on" : undefined}>
              {link.name}
            </Link>
          ))}
          <a className="btn p" href="/api/resume/download" data-resume>
            <Icon name="download" size={16} /> Résumé
          </a>
        </nav>
      )}
    </header>
  );
}
