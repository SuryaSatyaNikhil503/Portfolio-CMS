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
        thumbnail: true,
        createdAt: true,
        _count: { select: { views: true } },
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

  return (
    <div className="section-padding">
      <div className="container-width">
        <SectionHeading
          title="Blog"
          subtitle="Technical articles on system design, architecture, and software development"
        />

        {blogs.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center max-w-md mx-auto">
            <p className="text-sm text-muted-foreground">No posts to display yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard
                key={blog.slug}
                title={blog.title}
                slug={blog.slug}
                excerpt={blog.excerpt}
                thumbnail={blog.thumbnail}
                createdAt={blog.createdAt.toISOString()}
                viewCount={blog._count.views}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
