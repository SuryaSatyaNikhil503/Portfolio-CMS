import { Metadata } from "next";
import TimelineItem from "@/components/TimelineItem";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Experience",
  description: "My professional work history and experience.",
};

export const dynamic = "force-dynamic";

async function getExperiences() {
  try {
    return await prisma.experience.findMany({ orderBy: { displayOrder: "asc" } });
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return [];
  }
}

export default async function ExperiencePage() {
  const experiences = await getExperiences();

  return (
    <>
      <div className="pagehead">
        <h2 className="eyebrow">Experience</h2>
        <p className="display">Where I&apos;ve <span style={{ color: "var(--primary)" }}>worked</span></p>
        <p className="lead">My professional journey and the companies I&apos;ve worked with</p>
      </div>
      <section className="sec">
        <div className="wrapw">
          {experiences.length === 0 ? (
            <p className="muted">No experience to display yet. Check back soon!</p>
          ) : (
            <div className="tl">
              {experiences.map((exp, index) => (
                <TimelineItem
                  key={exp.id}
                  company={exp.company}
                  role={exp.role}
                  companyLogo={exp.companyLogo}
                  location={exp.location}
                  startDate={exp.startDate}
                  endDate={exp.endDate}
                  description={exp.description}
                  isLast={index === experiences.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
