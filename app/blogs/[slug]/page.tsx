import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import Article, { TipTapNode } from "@/components/Article";
import Icon from "@/components/ui/Icon";
import Toc from "@/components/blog/Toc";
import { extractHeadings } from "@/lib/headings";
import CommentSection from "@/components/CommentSection";
import NewsletterForm from "@/components/NewsletterForm";

export const dynamic = "force-dynamic";

async function getBlogWithData(slug: string) {
  try {
    const [found, about] = await Promise.all([
      prisma.blog.findUnique({ where: { slug } }),
      prisma.about.findFirst({ select: { name: true, profileImage: true } }),
    ]);
    // Unpublished drafts are visible only to the logged-in admin (preview).
    const blog = found && !found.published && !(await getAuthUser().catch(() => null)) ? null : found;
    return { blog, about };
  } catch {
    return { blog: null, about: null };
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { blog } = await getBlogWithData(slug);
  if (!blog) return { title: "Blog Not Found" };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yoursite.com";
  const url = `${siteUrl}/blogs/${slug}`;
  return {
    title: blog.title,
    description: blog.excerpt || `Read ${blog.title} by Surya Satya Nikhil Gadhavajula`,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: blog.title,
      description: blog.excerpt || `Read ${blog.title}`,
      images: blog.thumbnail ? [{ url: blog.thumbnail }] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { blog, about } = await getBlogWithData(slug);

  if (!blog) notFound();

  const doc = blog.content as unknown as TipTapNode | null;
  const toc = extractHeadings(doc);
  const date = new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <>
      <div className="post-head">
        <Link href="/blogs" className="btn t s"><Icon name="back" size={15} /> Back to Blog</Link>
        {blog.tags && blog.tags.length > 0 && (
          <div className="chips" style={{ marginTop: 10 }}>
            {blog.tags.map((tag: string) => (
              <span key={tag} className="chip soft">{tag}</span>
            ))}
          </div>
        )}
        <h1>{blog.title}</h1>
        <div className="byline">
          {about?.profileImage ? (
            <Image src={about.profileImage} alt={about.name || "Nikhil"} width={34} height={34} />
          ) : (
            <span className="av" />
          )}
          <b style={{ color: "var(--fg)" }}>{about?.name || "Nikhil"}</b>
          <i className="dot" />
          <span>{date}</span>
          {blog.readingTime && (
            <>
              <i className="dot" />
              <span>{blog.readingTime}</span>
            </>
          )}
        </div>
      </div>

      {blog.thumbnail && (
        <div className="cover">
          <div className="coverbox">
            <Image fill src={blog.thumbnail} alt={blog.title} sizes="(max-width: 980px) 100vw, 980px" style={{ objectFit: "cover" }} priority />
          </div>
        </div>
      )}

      <div className="postgrid">
        <article style={{ minWidth: 0 }}>
          {doc ? (
            <Article content={doc} />
          ) : (
            <p className="muted">This blog post has no content yet.</p>
          )}

          <div className="news" id="newsletter" style={{ marginTop: 56, boxShadow: "none" }}>
            <div>
              <h3>Enjoyed this article?</h3>
              <p>Subscribe to get notified when I publish new articles.</p>
            </div>
            <NewsletterForm />
          </div>

          <CommentSection slug={slug} />
        </article>
        <Toc items={toc} />
      </div>
    </>
  );
}
