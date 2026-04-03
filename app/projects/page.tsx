import { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import ProjectCard from "@/components/ProjectCard";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Projects",
  description: "A showcase of my projects and work.",
};

export const dynamic = "force-dynamic";

async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
      select: {
        title: true,
        slug: true,
        techStack: true,
        githubLink: true,
        liveDemoLink: true,
        featured: true,
        thumbnail: true,
        createdAt: true,
      },
    });
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="section-padding">
      <div className="container-width">
        <SectionHeading
          title="Projects"
          subtitle="A selection of projects that showcase my skills and interests"
        />

        {projects.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center max-w-md mx-auto">
            <p className="text-sm text-muted-foreground">
              No projects to display yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(
              (project: {
                slug: string;
                title: string;
                techStack: string[];
                githubLink: string;
                liveDemoLink: string;
                featured: boolean;
                thumbnail: string;
              }) => (
                <ProjectCard key={project.slug} {...project} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
