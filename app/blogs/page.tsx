import { Metadata } from "next";
import BlogsExplorer from "@/components/blog/BlogsExplorer";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Blogs",
  description:
    "Technical articles about system design, software architecture, and modern development.",
};

export const dynamic = "force-dynamic";

async function getBlogs() {
  try {
    const blogs = await prisma.blog.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: { title: true, slug: true, excerpt: true, thumbnail: true, tags: true, readingTime: true, createdAt: true },
    });
    return blogs;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return (
    <>
      <div className="pagehead">
        <h2 className="eyebrow">Blog</h2>
        <p className="display">Notes on <span style={{ color: "var(--primary)" }}>systems &amp; AI</span></p>
        <p className="lead">Technical articles on system design, architecture, and software development</p>
      </div>
      <section className="sec" style={{ paddingTop: 20 }}>
        <div className="wrapw">
          {blogs.length === 0 ? (
            <p className="muted">No posts to display yet. Check back soon!</p>
          ) : (
            <BlogsExplorer blogs={blogs.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() }))} />
          )}
        </div>
      </section>
    </>
  );
}
