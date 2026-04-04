import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import TipTapRenderer, { TipTapNode } from "@/components/TipTapRenderer";

export const dynamic = "force-dynamic";

async function getBlog(slug: string) {
  try {
    const blog = await prisma.blog.findUnique({ where: { slug } });
    return blog;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) return { title: "Blog Not Found" };
  return {
    title: blog.title,
    description: blog.excerpt || `Read ${blog.title}`,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="section-padding">
      <div className="container-width">
        <article className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-10">
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.tags.map((tag: string) => (
                  <span key={tag} className="badge text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
              {blog.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {blog.title?.charAt(0) || "A"}
                  </span>
                </div>
                <span>Author</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span>
                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {blog.readingTime && (
                <>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <span>{blog.readingTime}</span>
                </>
              )}
            </div>
          </header>

          {/* Thumbnail */}
          {blog.thumbnail && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-10">
              <Image
                fill
                src={blog.thumbnail}
                alt={blog.title}
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          {blog.content ? (
            <TipTapRenderer content={blog.content as unknown as TipTapNode} />
          ) : (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-muted-foreground text-sm">
                This blog post has no content yet.
              </p>
            </div>
          )}

          {/* Newsletter CTA */}
          <div className="mt-16 glass-strong rounded-2xl p-8 text-center glow-border">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Enjoyed this article?
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Subscribe to get notified when I publish new articles.
            </p>
            <Link href="/#newsletter" className="btn-primary text-sm">
              Subscribe to Newsletter
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
