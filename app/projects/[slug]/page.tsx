import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import TipTapRenderer, { TipTapNode } from "@/components/TipTapRenderer";

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

  return (
    <div className="section-padding">
      <div className="container-width">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </Link>

          {/* Header */}
          <div className="glass rounded-2xl p-8 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              {project.title}
            </h1>

            {project.techStack && project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {project.techStack.map((tech: string) => (
                  <span key={tech} className="badge">
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              {project.githubLink && (
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline !py-2 !px-4 text-sm gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Source Code
                </a>
              )}
              {project.liveDemoLink && (
                <a
                  href={project.liveDemoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary !py-2 !px-4 text-sm gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Live Demo
                </a>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          {project.thumbnail && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-8">
              <Image
                fill
                src={project.thumbnail}
                alt={project.title}
                className="object-cover"
              />
            </div>
          )}

          {/* Description Content */}
          {project.description &&
          ((project.description as unknown as TipTapNode).content?.length ?? 0) > 0 ? (
            <div className="glass rounded-2xl p-8">
              <TipTapRenderer content={project.description as unknown as TipTapNode} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
