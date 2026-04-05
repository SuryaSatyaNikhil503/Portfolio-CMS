import Link from "next/link";
import Image from "next/image";

interface BlogCardProps {
  title: string;
  slug: string;
  thumbnail?: string;
  excerpt: string;
  tags: string[];
  viewCount?: number;
  createdAt: string;
}

export default function BlogCard({ title, slug, thumbnail, excerpt, tags, viewCount, createdAt }: BlogCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link href={`/blogs/${slug}`} className="group">
      <article className="glass rounded-2xl overflow-hidden card-hover h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative aspect-[16/9] bg-muted/50 overflow-hidden">
          {thumbnail ? (
            <Image
              fill
              src={thumbnail}
              alt={title}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 rounded-xl gradient-bg opacity-40 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
            <span>{formattedDate}</span>
            {viewCount !== undefined && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {viewCount.toLocaleString()} {viewCount === 1 ? "view" : "views"}
                </span>
              </>
            )}
          </div>

          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {title}
          </h3>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{excerpt}</p>

          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="badge text-[11px]">{tag}</span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
