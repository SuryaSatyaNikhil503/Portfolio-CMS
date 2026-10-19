import { Metadata } from "next";
import ProjectCard from "@/components/ProjectCard";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import Icon from "@/components/ui/Icon";

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
  const [projects, admin] = await Promise.all([getProjects(), getAuthUser().catch(() => null)]);

  return (
    <>
      <div className="pagehead">
        <h2 className="eyebrow">Projects</h2>
        <p className="display">Things I&apos;ve <span style={{ color: "var(--primary)" }}>built</span></p>
        <p className="lead">A selection of projects that showcase my skills and interests</p>
      </div>
      <section className="sec">
        <div className="wrapw">
          {projects.length === 0 && !admin ? (
            <p className="muted">No projects to display yet. Check back soon!</p>
          ) : (
            <div className="grid3">
              {projects.map((project, i) => (
                <ProjectCard
                  key={project.slug}
                  title={project.title}
                  slug={project.slug}
                  thumbnail={project.thumbnail}
                  techStack={project.techStack}
                  githubLink={project.githubLink}
                  liveDemoLink={project.liveDemoLink}
                  featured={project.featured}
                  index={i + 1}
                />
              ))}
              {admin && (
                <a href="/admin/projects" className="bcard addcard">
                  <span><Icon name="plus" size={20} /></span>
                  <b>Add a project</b>
                  <span>Only you see this card.</span>
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
