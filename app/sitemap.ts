import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://suryasatyanikhil.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/blogs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  let blogPages: MetadataRoute.Sitemap = [];
  let projectPages: MetadataRoute.Sitemap = [];

  try {
    const blogs = await prisma.blog.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    blogPages = blogs.map((blog) => ({
      url: `${siteUrl}/blogs/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    const projects = await prisma.project.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    projectPages = projects.map((project) => ({
      url: `${siteUrl}/projects/${project.slug}`,
      lastModified: project.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch {
    // If DB is unreachable, still return static pages
  }

  return [...staticPages, ...blogPages, ...projectPages];
}
