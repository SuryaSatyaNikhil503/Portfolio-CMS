import Link from "next/link";
import Image from "next/image";

interface BlogCardProps {
  title: string;
  slug: string;
  thumbnail?: string;
  excerpt: string;
  tags?: string[];
  readingTime?: string;
  createdAt: string;
  index?: number;
}

export default function BlogCard({ title, slug, thumbnail, excerpt, tags = [], readingTime, createdAt, index = 0 }: BlogCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <Link href={`/blogs/${slug}`} className="bcard tilt">
      <div className="th">
        {thumbnail ? (
          <Image fill src={thumbnail} alt={title} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 360px" style={{ objectFit: "cover" }} />
        ) : (
          <div className={`ph v${index % 4}`} style={{ width: "100%", height: "100%" }} />
        )}
      </div>
      <div className="bd">
        {tags.length > 0 && (
          <div className="chips">
            {tags.slice(0, 2).map((t) => (
              <span key={t} className="chip soft">{t}</span>
            ))}
          </div>
        )}
        <h3>{title}</h3>
        <p>{excerpt}</p>
        <div className="meta">
          <span>{formattedDate}</span>
          {readingTime && (
            <>
              <i className="dot" />
              <span>{readingTime}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
