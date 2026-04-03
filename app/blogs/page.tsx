import { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import BlogCard from "@/components/BlogCard";
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
      select: {
        title: true,
        slug: true,
        excerpt: true,
        tags: true,
        readingTime: true,
        thumbnail: true,
        createdAt: true,
      },
    });
    return blogs;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

export default async function BlogsPage() {
  const blogs = await getBlogs();

  // Extract unique tags from all blogs
  const allTags = Array.from(
    new Set(blogs.flatMap((b: { tags: string[] }) => b.tags || []))
  );

  return (
    <div className="section-padding">
      <div className="container-width">
        <SectionHeading
          title="Blog"
          subtitle="Technical articles on system design, architecture, and software development"
        />

        {/* Tags Filter (visual only for SSR) */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {allTags.map((tag) => (
              <span
                key={tag as string}
                className="px-4 py-2 rounded-full text-sm font-medium glass text-muted-foreground"
              >
                {tag as string}
              </span>
            ))}
          </div>
        )}

        {blogs.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center max-w-md mx-auto">
            <p className="text-sm text-muted-foreground">
              No posts to display yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map(
              (blog: {
                slug: string;
                title: string;
                excerpt: string;
                tags: string[];
                readingTime: string;
                thumbnail: string;
                createdAt: Date;
              }) => (
                <BlogCard key={blog.slug} {...blog} createdAt={blog.createdAt.toISOString()} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
