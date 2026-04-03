import { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import TimelineItem from "@/components/TimelineItem";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Experience",
  description: "My professional work history and experience.",
};

export const dynamic = "force-dynamic";

async function getExperiences() {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: { displayOrder: "asc" },
    });
    return experiences;
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return [];
  }
}

export default async function ExperiencePage() {
  const experiences = await getExperiences();

  return (
    <div className="section-padding">
      <div className="container-width">
        <SectionHeading
          title="Experience"
          subtitle="My professional journey and the companies I've worked with"
        />

        {experiences.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center max-w-md mx-auto">
            <p className="text-sm text-muted-foreground">
              No experience to display yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {experiences.map(
              (
                exp: {
                  id: string;
                  company: string;
                  role: string;
                  companyLogo: string;
                  location: string;
                  startDate: string;
                  endDate: string;
                  description: string;
                },
                index: number
              ) => (
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
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
