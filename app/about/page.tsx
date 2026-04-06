import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import TipTapRenderer, { TipTapNode } from "@/components/TipTapRenderer";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { getPortfolioStats } from "@/lib/getPortfolioStats";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about me, my background, and what drives me.",
};

export const dynamic = "force-dynamic";

async function getAbout() {
  try {
    const about = await prisma.about.findFirst();
    return about;
  } catch (error) {
    console.error("Error fetching about:", error);
    return null;
  }
}

export default async function AboutPage() {
  const [about, stats] = await Promise.all([getAbout(), getPortfolioStats()]);

  return (
    <div className="relative">
      {/* Hero Banner */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container-width relative z-10 text-center py-20">
          <AnimateOnScroll direction="fade-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              About <span className="gradient-text">Me</span>
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll direction="fade-up" delay={150}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A passionate developer who loves building things that matter
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll direction="fade-up" delay={300}>
            <div className="shimmer-line w-20 mx-auto mt-6" />
          </AnimateOnScroll>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding relative">
        <div className="container-width">
          <div className="max-w-5xl mx-auto space-y-16">
            {/* Profile Card */}
            <AnimateOnScroll direction="fade-up" delay={100}>
              <div className="glass rounded-2xl p-8 md:p-12 relative overflow-hidden">
                {/* Decorative gradient corner */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center relative z-10">
                  {/* Avatar with animated ring */}
                  <div className="profile-ring flex-shrink-0">
                    <div className="w-44 h-44 rounded-2xl overflow-hidden bg-card">
                      {about?.profileImage ? (
                        <Image
                          src={about.profileImage}
                          alt={about.name || "Profile"}
                          width={176}
                          height={176}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full gradient-bg flex items-center justify-center">
                          <span className="text-6xl font-bold text-white">
                            {about?.name?.charAt(0) || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-center md:text-left space-y-4 flex-1">
                    <div>
                      <h2 className="text-3xl font-bold text-foreground mb-1">
                        {about?.name || "Your Name"}
                      </h2>
                      <p className="text-lg text-primary font-medium">
                        {about?.title || "Your Title"}
                      </p>
                    </div>

                    {/* Bio */}
                    {about?.bio && (() => {
                      // Check if bio has real content (not just placeholder text)
                      const bioContent = about.bio as unknown as TipTapNode;
                      if (!bioContent?.content) return null;
                      const textContent = JSON.stringify(bioContent);
                      const placeholders = [
                        "Edit your bio",
                        "TipTap editor",
                        "will be rendered",
                      ];
                      const isPlaceholder = placeholders.some((p) =>
                        textContent.toLowerCase().includes(p.toLowerCase())
                      );
                      // Also skip empty content
                      const hasRealText = bioContent.content?.some(
                        (node: TipTapNode) => node.content?.some((child: TipTapNode) => child.text?.trim())
                      );
                      if (isPlaceholder || !hasRealText) return null;
                      return (
                        <div className="text-muted-foreground leading-relaxed prose-blog">
                          <TipTapRenderer content={about.bio as unknown as TipTapNode} />
                        </div>
                      );
                    })()}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                      {about?.resumeLink && (
                        <a
                          href="/api/resume/download"
                          className="btn-primary gap-2 group"
                        >
                          <svg
                            className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Download Resume
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                  ),
                  label: "Specialization",
                  value: stats.currentRole || about?.title || "Developer",
                },
                {
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.64-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  ),
                  label: "Experience",
                  value: `${stats.yearsOfExperience || 0}+ Years`,
                },
                {
                  icon: (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  ),
                  label: "Availability",
                  value: "Open to Work",
                },
              ].map((item, index) => (
                <AnimateOnScroll
                  key={item.label}
                  direction="fade-up"
                  delay={index * 120}
                >
                  <div className="info-card">
                    <div className="info-card-icon">{item.icon}</div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {item.label}
                      </p>
                      <p className="font-semibold text-foreground">
                        {item.value}
                      </p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            {/* What Drives Me Section */}
            <AnimateOnScroll direction="fade-up">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">
                  What Drives Me
                </h2>
                <div className="shimmer-line w-16 mx-auto mb-8" />
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Clean Code",
                  description:
                    "I believe in writing code that's not just functional, but readable, maintainable, and elegant.",
                  icon: "✨",
                },
                {
                  title: "Continuous Learning",
                  description:
                    "Technology evolves rapidly, and I'm passionate about staying current with the latest tools and best practices.",
                  icon: "📚",
                },
                {
                  title: "Problem Solving",
                  description:
                    "Breaking down complex challenges into simple, scalable solutions is what motivates me every day.",
                  icon: "🧩",
                },
                {
                  title: "Open Source",
                  description:
                    "Contributing to the developer community and sharing knowledge through open-source projects and technical content.",
                  icon: "🌐",
                },
              ].map((item, index) => (
                <AnimateOnScroll
                  key={item.title}
                  direction={index % 2 === 0 ? "fade-right" : "fade-left"}
                  delay={index * 100}
                >
                  <div className="glass rounded-2xl p-6 card-hover group h-full">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            {/* CTA */}
            <AnimateOnScroll direction="scale-in" delay={100}>
              <div className="text-center">
                <div className="glass-strong rounded-2xl p-10 glow-border inline-block animate-pulse-glow">
                  <h3 className="text-2xl font-bold mb-3 text-foreground">
                    Let&apos;s Build Something Together
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Explore my projects or check out my latest blog posts.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Link href="/projects" className="btn-primary gap-2 group">
                      <svg
                        className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                      View Projects
                    </Link>
                    <Link href="/blogs" className="btn-outline gap-2 group">
                      <svg
                        className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                      Read Blog
                    </Link>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            {/* No profile fallback */}
            {!about && (
              <AnimateOnScroll direction="fade-up">
                <div className="glass rounded-2xl p-12 text-center">
                  <div className="text-4xl mb-4">👋</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No profile info yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add your information from the admin dashboard under
                    &quot;About&quot;.
                  </p>
                </div>
              </AnimateOnScroll>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
