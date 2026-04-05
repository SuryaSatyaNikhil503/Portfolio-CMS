import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import TipTapRenderer, { TipTapNode } from "@/components/TipTapRenderer";
import ViewTracker from "@/components/ViewTracker";
import CommentSection from "@/components/CommentSection";
import NewsletterForm from "@/components/NewsletterForm";

export const dynamic = "force-dynamic";

async function getBlogWithData(slug: string) {
  try {
    const [blog, about, viewCount] = await Promise.all([
      prisma.blog.findUnique({ where: { slug } }),
      prisma.about.findFirst({ select: { name: true, profileImage: true } }),
      prisma.blogView.count({ where: { blog: { slug } } }),
    ]);
    return { blog, about, viewCount };
  } catch {
    return { blog: null, about: null, viewCount: 0 };
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { blog } = await getBlogWithData(slug);
  if (!blog) return { title: "Blog Not Found" };
  return { title: blog.title, description: blog.excerpt || `Read ${blog.title}` };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { blog, about, viewCount } = await getBlogWithData(slug);

  if (!blog) notFound();

  return (
    <div className="section-padding">
      <ViewTracker slug={slug} />
      <div className="container-width">
        <article className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-10">
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.tags.map((tag: string) => (
                  <span key={tag} className="badge text-xs">{tag}</span>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {/* Author */}
              <div className="flex items-center gap-2">
                {about?.profileImage ? (
                  <Image
                    src={about.profileImage}
                    alt={about.name || "Nikhil"}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">N</span>
                  </div>
                )}
                <span className="font-medium text-foreground">{about?.name || "Nikhil"}</span>
              </div>

              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />

              <span>
                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </span>

              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />

              {/* View count */}
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {viewCount.toLocaleString()} {viewCount === 1 ? "view" : "views"}
              </span>
            </div>
          </header>

          {/* Thumbnail */}
          {blog.thumbnail && (
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-10">
              <Image fill src={blog.thumbnail} alt={blog.title} className="object-cover" />
            </div>
          )}

          {/* Content */}
          {blog.content ? (
            <TipTapRenderer content={blog.content as unknown as TipTapNode} />
          ) : (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-muted-foreground text-sm">This blog post has no content yet.</p>
            </div>
          )}

          {/* Newsletter CTA */}
          <div className="mt-16 glass-strong rounded-2xl p-8 glow-border" id="newsletter">
            <h3 className="text-xl font-bold text-foreground mb-1">Enjoyed this article?</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Subscribe to get notified when I publish new articles.
            </p>
            <NewsletterForm />
          </div>

          {/* Comments */}
          <CommentSection slug={slug} />
        </article>
      </div>
    </div>
  );
}
