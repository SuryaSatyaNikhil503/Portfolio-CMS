import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/ui/Icon";

interface ProjectCardProps {
  title: string;
  slug: string;
  thumbnail?: string;
  techStack: string[];
  summary?: string;
  githubLink?: string;
  liveDemoLink?: string;
  featured?: boolean;
  index?: number;
}

export default function ProjectCard({ title, slug, thumbnail, techStack, summary, githubLink, liveDemoLink, featured, index = 1 }: ProjectCardProps) {
  return (
    <article className="bcard tilt pcard">
      <div className="th">
        {thumbnail ? (
          <Image fill src={thumbnail} alt={title} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 360px" style={{ objectFit: "cover" }} />
        ) : (
          <div className={`ph v${index % 4}`} style={{ width: "100%", height: "100%" }} />
        )}
        {featured && <span className="chip soft pcard-flag">Featured</span>}
      </div>
      <div className="bd">
        <h3>
          <Link href={`/projects/${slug}`} className="stretch">{title}</Link>
        </h3>
        {summary && <p>{summary}</p>}
        <div className="chips">
          {techStack.slice(0, 4).map((t) => (
            <span key={t} className="chip mono">{t}</span>
          ))}
          {techStack.length > 4 && <span className="chip mono">+{techStack.length - 4}</span>}
        </div>
        {(githubLink || liveDemoLink) && (
          <div className="meta pcard-links">
            {githubLink && (
              <a href={githubLink} target="_blank" rel="noopener noreferrer" aria-label={`${title} source on GitHub`}>
                <Icon name="code" size={14} /> Source on GitHub
              </a>
            )}
            {liveDemoLink && (
              <a href={liveDemoLink} target="_blank" rel="noopener noreferrer" aria-label={`${title} live demo`}>
                <Icon name="ext" size={14} /> Live demo
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
