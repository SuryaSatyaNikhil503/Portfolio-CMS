import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import TipTapRenderer, { TipTapNode } from "@/components/TipTapRenderer";
import Icon, { type IconName } from "@/components/ui/Icon";
import { getPortfolioStats } from "@/lib/getPortfolioStats";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about me, my background, and what drives me.",
};

export const dynamic = "force-dynamic";

async function getAbout() {
  try {
    return await prisma.about.findFirst();
  } catch (error) {
    console.error("Error fetching about:", error);
    return null;
  }
}

const DRIVES: { title: string; description: string; icon: IconName; color: string }[] = [
  { title: "Ownership", description: "I treat what I build as mine. If it breaks, I fix it, and I raise problems early instead of hiding them.", icon: "shield", color: "var(--c1)" },
  { title: "Adaptability", description: "New domain, new tool or changing requirement, I get involved, ask good questions and become useful quickly.", icon: "bulb", color: "var(--c2)" },
  { title: "Teamwork", description: "I share what I know, listen before deciding, and care more about the team's result than my own credit.", icon: "users", color: "var(--c5)" },
  { title: "Leadership", description: "When a team needs direction, I step up. I help people get unstuck, coordinate the work and keep everyone clear on the goal.", icon: "flag", color: "var(--c3)" },
];

function bioHasText(bio: TipTapNode | undefined): boolean {
  if (!bio?.content) return false;
  const flat = JSON.stringify(bio).toLowerCase();
  if (["edit your bio", "tiptap editor", "will be rendered"].some((p) => flat.includes(p))) return false;
  return bio.content.some((n) => n.content?.some((c) => c.text?.trim()));
}

export default async function AboutPage() {
  const [about, stats] = await Promise.all([getAbout(), getPortfolioStats()]);
  const bio = about?.bio as unknown as TipTapNode | undefined;

  return (
    <>
      <div className="pagehead">
        <h1 className="eyebrow">About Me</h1>
        <p className="display">Takes ownership, adapts fast, <span style={{ color: "var(--primary)" }}>works well with people</span></p>
      </div>

      <section className="sec">
        <div className="wrapw">
          <div className="profile">
            <div>
              {about?.profileImage ? (
                <Image className="avatar tilt" src={about.profileImage} alt={about.name || "Profile"} width={440} height={440} priority />
              ) : (
                <div className="avatar" style={{ display: "grid", placeItems: "center", fontSize: 72, fontWeight: 800 }}>{about?.name?.charAt(0) || "?"}</div>
              )}
            </div>
            <div style={{ display: "grid", gap: 20 }}>
              <div>
                <h2 className="nm">{about?.name || "Your Name"}</h2>
                <div className="muted" style={{ fontWeight: 600, marginTop: 6 }}>{about?.title || "Your Title"}</div>
              </div>
              {bioHasText(bio) && <TipTapRenderer content={bio} />}
              <div className="facts">
                <div><small>Specialization</small><b>{stats.currentRole || about?.title || "Developer"}</b></div>
                <div><small>Experience</small><b>{stats.yearsOfExperience || 0}+ Years</b></div>
                <div className="open">
                  <small>Availability</small>
                  <b>
                    {(about?.openToWork ?? true) ? (
                      <span className="status" style={{ padding: "3px 10px 3px 9px", fontSize: 13, boxShadow: "none" }}><i />Open to Work</span>
                    ) : (
                      "Not looking right now"
                    )}
                  </b>
                </div>
              </div>
              <div className="cta" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {about?.resumeLink && (
                  <a href="/api/resume/download" className="btn p" data-resume><Icon name="download" size={16} /> Download Resume</a>
                )}
                {about?.githubUrl && <a className="btn" href={about.githubUrl} target="_blank" rel="noopener noreferrer">GitHub <Icon name="ext" size={14} /></a>}
                {about?.linkedinUrl && <a className="btn" href={about.linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn <Icon name="ext" size={14} /></a>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrapw">
          <div className="shead"><div><h2 className="eyebrow">What Drives Me</h2></div></div>
          <div className="grid2">
            {DRIVES.map((d) => (
              <div key={d.title} className="layer tilt" style={{ "--lc": d.color } as React.CSSProperties}>
                <span className="ic"><Icon name={d.icon} size={22} /></span>
                <h3>{d.title}</h3>
                <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>{d.description}</p>
              </div>
            ))}
          </div>
          <div className="ctacard">
            <div>
              <h3>Let&apos;s Build Something Together</h3>
              <p>Have a role or a project in mind? See my work, or read what I&apos;ve been writing.</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn p" href="/projects">View Projects</Link>
              <Link className="btn" href="/blogs">Read Blog</Link>
            </div>
          </div>
          {!about && <p className="muted" style={{ marginTop: 24 }}>No profile info yet. Add your information from the admin dashboard under &quot;About&quot;.</p>}
        </div>
      </section>
    </>
  );
}
