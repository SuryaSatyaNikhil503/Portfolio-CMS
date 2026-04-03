import { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import SkillIcon from "@/components/SkillIcon";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Skills",
  description: "Technologies and tools I work with.",
};

export const dynamic = "force-dynamic";

async function getSkills() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { displayOrder: "asc" },
    });
    return skills;
  } catch (error) {
    console.error("Error fetching skills:", error);
    return [];
  }
}

export default async function SkillsPage() {
  const skills = await getSkills();

  // Group by category
  const grouped = skills.reduce(
    (
      acc: Record<string, { name: string; icon: string; category: string }[]>,
      skill: { name: string; icon: string; category: string }
    ) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    },
    {}
  );

  return (
    <div className="section-padding">
      <div className="container-width">
        <SectionHeading
          title="Skills & Technologies"
          subtitle="A collection of technologies and tools I use to bring ideas to life"
        />

        {Object.keys(grouped).length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center max-w-md mx-auto">
            <p className="text-sm text-muted-foreground">
              No skills to display yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-12 max-w-5xl mx-auto">
            {Object.entries(grouped).map(([category, categorySkills]) => (
              <div key={category} className="animate-fade-up">
                <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full gradient-bg" />
                  {category}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {(
                    categorySkills as {
                      name: string;
                      icon: string;
                      category: string;
                    }[]
                  ).map((skill) => (
                    <SkillIcon
                      key={skill.name}
                      name={skill.name}
                      icon={skill.icon}
                      category={skill.category}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
