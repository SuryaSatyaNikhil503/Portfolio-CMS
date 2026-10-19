import Link from "next/link";
import HeroStack from "@/components/hero/HeroStack";
import Icon, { type IconName } from "@/components/ui/Icon";
import BlogCard from "@/components/BlogCard";
import NewsletterForm from "@/components/NewsletterForm";
import { LAYERS, layerTiles, displaySkill, type SkillLike } from "@/lib/stack";

export interface HomeData {
  name: string;
  title: string;
  openToWork: boolean;
  hasResume: boolean;
  years: number;
  blogCount: number;
  skills: SkillLike[];
  blogs: { title: string; slug: string; thumbnail: string; excerpt: string; tags: string[]; readingTime: string; createdAt: string }[];
  project: { title: string; slug: string; techStack: string[] } | null;
  experience: { role: string; company: string; location: string; startDate: string; endDate: string; description: string } | null;
}

const WHAT_I_DO: { title: string; description: string; icon: IconName; color: string }[] = [
  { title: "Scalable Backend Systems", description: "Building production-grade backends with Spring Boot and Node.js: microservices, REST APIs, message queues, and distributed systems designed to scale.", icon: "layers", color: "var(--c1)" },
  { title: "Frontend & Full-Stack", description: "Crafting performant UIs with React JS, integrated end-to-end with robust backend APIs from design system to deployment.", icon: "monitor", color: "var(--c2)" },
  { title: "CI/CD & DevOps", description: "Automating delivery pipelines with CI/CD and cloud deployments, keeping releases fast, reliable, and repeatable.", icon: "sparkle", color: "var(--c3)" },
  { title: "Technical Writing", description: "Writing deep-dive articles on system design, architecture, performance, and engineering trade-offs.", icon: "book", color: "var(--c5)" },
];

export default function HomeContent({ d }: { d: HomeData }) {
  const words = d.name.trim().split(/\s+/);
  const last = words.length > 1 ? words[words.length - 1] : "";
  const first = words.length > 1 ? words.slice(0, -1).join(" ") : d.name;
  const categories = new Set(d.skills.map((s) => s.category)).size;

  return (
    <>
      <section className="hero">
        <div className="copy">
          {d.openToWork && (
            <span className="status">
              <i />
              Open to new roles
            </span>
          )}
          <p className="name">
            {first} {last && <em>{last}</em>}
          </p>
          <div className="roleline">
            <h1>{d.title}</h1>
            <span>Spring Boot · React · Microservices</span>
          </div>
          <p className="lead">
            I engineer scalable systems, solve complex problems, and share deep insights on architecture, performance, and modern software engineering.
          </p>
          <div className="chips">
            {["Spring Boot", "React", "Microservices", "CI/CD"].map((c) => (
              <span key={c} className="chip">{c}</span>
            ))}
          </div>
          <div className="cta">
            {d.hasResume && (
              <a className="btn p" href="/api/resume/download" data-resume>
                <Icon name="download" size={16} /> Download résumé
              </a>
            )}
            <Link className="btn" href="/projects">View Projects</Link>
            <Link className="btn t" href="/blogs">Read Blog <Icon name="chev" size={14} /></Link>
          </div>
        </div>
        <HeroStack />
      </section>

      <section className="sec">
        <div className="wrapw">
          <div className="stats">
            <div><b>{d.years}+</b><span>Years building production systems</span></div>
            <div><b>{d.blogCount}</b><span>Articles on system design and AI</span></div>
            <div><b>{d.skills.length}</b><span>Technologies across {categories} areas</span></div>
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrapw">
          <div className="shead">
            <div>
              <h2 className="eyebrow">What I Do</h2>
              <p className="display">Crafting digital experiences with modern technologies</p>
            </div>
          </div>
          <div className="grid4">
            {WHAT_I_DO.map((w) => (
              <div key={w.title} className="layer tilt" style={{ "--lc": w.color } as React.CSSProperties}>
                <span className="ic"><Icon name={w.icon} size={22} /></span>
                <h3>{w.title}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{w.description}</p>
              </div>
            ))}
          </div>
          <div className="ctacard">
            <div>
              <h3>Interested in working together?</h3>
              <p>Check out my projects and feel free to reach out.</p>
            </div>
            <Link className="btn p" href="/about">Learn More About Me <Icon name="chev" size={14} /></Link>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrapw">
          <div className="shead">
            <div>
              <h2 className="eyebrow">Skills</h2>
              <p className="display">Where I work in the stack</p>
            </div>
            <Link className="btn" href="/skills">All skills <Icon name="chev" size={14} /></Link>
          </div>
          <div className="layers">
            {LAYERS.map((l) => (
              <div key={l.title} className="layer tilt" style={{ "--lc": l.color } as React.CSSProperties}>
                <small>Layer</small>
                <div className="lt">{l.title}</div>
                <div className="tiles">
                  {layerTiles(l, d.skills).map((n) => (
                    <span key={n} className="tile">
                      <i>{displaySkill(n).charAt(0)}</i>
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {d.experience && (
        <section className="sec alt">
          <div className="wrapw">
            <div className="shead">
              <div>
                <h2 className="eyebrow">Experience</h2>
                <p className="display">Where I work now</p>
              </div>
              <Link className="btn" href="/experience">Full timeline <Icon name="chev" size={14} /></Link>
            </div>
            <div className="tl">
              <div className="item">
                <span className="logo2">{d.experience.company.slice(0, 2)}</span>
                <div className="card">
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <div className="rt">{d.experience.role}</div>
                    <span className="chip soft">{d.experience.startDate} – {d.experience.endDate}</span>
                  </div>
                  <div className="muted" style={{ fontWeight: 600 }}>{d.experience.company}{d.experience.location ? ` · ${d.experience.location}` : ""}</div>
                  <p className="lead" style={{ margin: "4px 0 0" }}>{d.experience.description.split(". ").slice(0, 2).join(". ").replace(/\.?$/, ".")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {d.blogs.length > 0 && (
        <section className="sec">
          <div className="wrapw">
            <div className="shead">
              <div>
                <h2 className="eyebrow">Writing</h2>
                <p className="display">Latest articles</p>
              </div>
              <Link className="btn" href="/blogs">All articles <Icon name="chev" size={14} /></Link>
            </div>
            <div className="grid3">
              {d.blogs.map((b, i) => (
                <BlogCard key={b.slug} {...b} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {d.project && (
        <section className="sec alt">
          <div className="wrapw">
            <div className="shead">
              <div>
                <h2 className="eyebrow">Project</h2>
                <p className="display">Featured project</p>
              </div>
              <Link className="btn" href="/projects">All projects <Icon name="chev" size={14} /></Link>
            </div>
            <Link href={`/projects/${d.project.slug}`} className="bcard tilt feat">
              <div className="th"><div className="ph v1" style={{ width: "100%", height: "100%" }} /></div>
              <div className="bd" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 26 }}>{d.project.title}</h3>
                <div className="chips">
                  {d.project.techStack.slice(0, 6).map((t) => (
                    <span key={t} className="chip mono">{t}</span>
                  ))}
                  {d.project.techStack.length > 6 && <span className="chip mono">+{d.project.techStack.length - 6}</span>}
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section id="newsletter" className="sec">
        <div className="wrapw">
          <div className="news">
            <div>
              <h2>Stay in the Loop</h2>
              <p>Get notified when I publish new articles on system design, software development, and more.</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
