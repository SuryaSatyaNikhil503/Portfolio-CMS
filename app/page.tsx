import { getPortfolioStats } from "@/lib/getPortfolioStats";
import HomeContent from "@/components/HomeContent";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [stats, about, skills, blogs, project, experience] = await Promise.all([
    getPortfolioStats(),
    prisma.about.findFirst({ select: { name: true, title: true, openToWork: true, resumeLink: true } }).catch(() => null),
    prisma.skill.findMany({ select: { name: true, category: true }, orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] }).catch(() => []),
    prisma.blog.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { title: true, slug: true, thumbnail: true, excerpt: true, tags: true, readingTime: true, createdAt: true },
    }).catch(() => []),
    prisma.project.findFirst({ orderBy: [{ featured: "desc" }, { createdAt: "desc" }], select: { title: true, slug: true, techStack: true } }).catch(() => null),
    prisma.experience.findFirst({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      select: { role: true, company: true, location: true, startDate: true, endDate: true, description: true },
    }).catch(() => null),
  ]);

  return (
    <HomeContent
      d={{
        name: about?.name || "Nikhil",
        title: about?.title || "Full-Stack Developer",
        openToWork: about?.openToWork ?? true,
        hasResume: Boolean(about?.resumeLink),
        years: stats.yearsOfExperience || 0,
        blogCount: stats.blogCount || 0,
        skills,
        blogs: blogs.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() })),
        project,
        experience,
      }}
    />
  );
}
