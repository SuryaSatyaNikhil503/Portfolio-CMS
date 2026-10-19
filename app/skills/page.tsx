import { Metadata } from "next";
import SkillIcon from "@/components/SkillIcon";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Skills",
  description: "Technologies and tools I work with.",
};

export const dynamic = "force-dynamic";

const COLORS = ["var(--c1)", "var(--c2)", "var(--c5)", "var(--c3)", "var(--c4)", "var(--c1)"];

async function getSkills() {
  try {
    return await prisma.skill.findMany({ orderBy: { displayOrder: "asc" } });
  } catch (error) {
    console.error("Error fetching skills:", error);
    return [];
  }
}

export default async function SkillsPage() {
  const skills = await getSkills();
  const grouped = new Map<string, typeof skills>();
  for (const s of skills) grouped.set(s.category, [...(grouped.get(s.category) ?? []), s]);

  return (
    <>
      <div className="pagehead">
        <h2 className="eyebrow">Skills &amp; Technologies</h2>
        <p className="display">What I <span style={{ color: "var(--primary)" }}>work with</span></p>
        <p className="lead">A collection of technologies and tools I use to bring ideas to life</p>
      </div>
      <section className="sec">
        <div className="wrapw">
          {grouped.size === 0 ? (
            <p className="muted">No skills to display yet. Check back soon!</p>
          ) : (
            <div className="sk-grid">
              {Array.from(grouped.entries()).map(([category, items], i) => (
                <div key={category} className="layer tilt" style={{ "--lc": COLORS[i % COLORS.length] } as React.CSSProperties}>
                  <small>{items.length} items</small>
                  <h3>{category}</h3>
                  <div className="tiles">
                    {items.map((s) => (
                      <SkillIcon key={s.id} name={s.name} icon={s.icon} category={s.category} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
