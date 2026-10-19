"use client";

import Link from "next/link";
import Tilt from "@/components/ui/Tilt";
import Tracker from "@/components/analytics/Tracker";
import MeasurementNotice from "@/components/analytics/MeasurementNotice";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Footer() {
  const pathname = usePathname();
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch("/api/about");
        const data = await res.json();
        if (data.about) {
          setGithubUrl(data.about.githubUrl || "");
          setLinkedinUrl(data.about.linkedinUrl || "");
        }
      } catch {
        // Keep defaults
      }
    };
    fetchAbout();
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
    <Tilt />
    <Tracker />
    <MeasurementNotice />
    <footer className="pfoot">
      <p>
        © {new Date().getFullYear()} Built by <span className="text-foreground font-medium">Nikhil</span>. All rights reserved.
      </p>
      <nav aria-label="Footer">
        <Link href="/about">About</Link>
        <Link href="/skills">Skills</Link>
        <Link href="/experience">Experience</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/blogs">Blogs</Link>
        <Link href="/privacy">Privacy</Link>
      </nav>
      <div className="flex items-center gap-4">
        {githubUrl && (
          <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z" />
            </svg>
          </a>
        )}
        {linkedinUrl && (
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.1 20.5H3.6V9h3.5v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z" />
            </svg>
          </a>
        )}
      </div>
    </footer>
    </>
  );
}
