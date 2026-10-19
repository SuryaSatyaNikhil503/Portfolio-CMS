import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import TipTapRenderer, { TipTapNode } from "@/components/TipTapRenderer";
import Icon from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

async function getProject(slug: string) {
  try {
    const project = await prisma.project.findUnique({ where: { slug } });
    return project;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project Not Found" };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yoursite.com";
  const url = `${siteUrl}/projects/${slug}`;
  return {
    title: project.title,
    description: `${project.title} — Built with ${project.techStack?.join(", ")}`,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: project.title,
      description: `${project.title} — Built with ${project.techStack?.join(", ")}`,
      images: project.thumbnail ? [{ url: project.thumbnail }] : [],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  const hasDescription = ((project.description as unknown as TipTapNode).content?.length ?? 0) > 0;

  return (
    <>
      <div className="post-head">
        <Link href="/projects" className="btn t s"><Icon name="back" size={15} /> Back to Projects</Link>
        <h1>{project.title}</h1>
        {project.techStack && project.techStack.length > 0 && (
          <div className="chips">
            {project.techStack.map((tech: string) => (
              <span key={tech} className="chip mono">{tech}</span>
            ))}
          </div>
        )}
        <div className="cta" style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          {project.githubLink && (
            <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="btn p">
              <Icon name="code" size={16} /> Source Code
            </a>
          )}
          {project.liveDemoLink && (
            <a href={project.liveDemoLink} target="_blank" rel="noopener noreferrer" className="btn">
              <Icon name="ext" size={16} /> Live Demo
            </a>
          )}
        </div>
      </div>

      <div className="cover">
        <div className="coverbox">
          {project.thumbnail ? (
            <Image fill src={project.thumbnail} alt={project.title} sizes="(max-width: 980px) 100vw, 980px" style={{ objectFit: "cover" }} priority />
          ) : (
            <div className="ph v1" style={{ width: "100%", height: "100%" }} />
          )}
        </div>
      </div>

      {hasDescription && (
        <section className="sec">
          <div style={{ maxWidth: 720, marginInline: "auto" }}>
            <TipTapRenderer content={project.description as unknown as TipTapNode} />
          </div>
        </section>
      )}
    </>
  );
}
