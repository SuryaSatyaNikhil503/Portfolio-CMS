"use client";

import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import AnimatedCounter from "@/components/AnimatedCounter";

interface HomeStat {
    label: string;
    value: number;
    suffix: string;
}

interface HomeContentProps {
    stats: HomeStat[];
    title: string;
}

export default function HomeContent({ stats, title }: HomeContentProps) {
    return (
        <div className="relative">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float-delayed" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl animate-float-slow" />
                    <div className="absolute top-[15%] right-[10%] w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float-delayed" />
                    <div className="absolute bottom-[20%] left-[10%] w-64 h-64 bg-accent/5 rounded-full blur-2xl animate-float-slow" />
                </div>

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />

                <div className="container-width relative z-10 text-center">
                    <div className="space-y-6">
                        <AnimateOnScroll direction="fade-up" delay={0}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground mb-4">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                Open to opportunities
                            </div>
                        </AnimateOnScroll>

                        <AnimateOnScroll direction="fade-up" delay={150}>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                                Hi, I&apos;m a{" "}
                                <span className="gradient-text">{title}</span>
                            </h1>
                        </AnimateOnScroll>

                        <AnimateOnScroll direction="fade-up" delay={300}>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                I build scalable web applications and write about system design,
                                software architecture, and modern development practices.
                            </p>
                        </AnimateOnScroll>

                        <AnimateOnScroll direction="fade-up" delay={400}>
                            <div className="shimmer-line w-32 mx-auto" />
                        </AnimateOnScroll>

                        <AnimateOnScroll direction="fade-up" delay={500}>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Link href="/projects" className="btn-primary gap-2 group">
                                    <svg
                                        className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12"
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
                                        className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5"
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
                        </AnimateOnScroll>
                    </div>

                    {/* Scroll indicator — mouse icon */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                        <AnimateOnScroll direction="fade-up" delay={800}>
                            <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                                <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" />
                                </div>
                            </div>
                        </AnimateOnScroll>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="section-padding border-t border-border/50 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
                </div>

                <div className="container-width relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {stats.map((stat, index) => (
                            <AnimateOnScroll
                                key={stat.label}
                                direction="fade-up"
                                delay={index * 120}
                            >
                                <div className="glass rounded-2xl p-6 text-center card-hover group">
                                    <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                                        <AnimatedCounter
                                            target={stat.value}
                                            suffix={stat.suffix}
                                            duration={1800}
                                        />
                                    </div>
                                    <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                                        {stat.label}
                                    </div>
                                </div>
                            </AnimateOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Section */}
            <section className="section-padding relative">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl animate-float-delayed" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-float-slow" />
                </div>

                <div className="container-width relative z-10">
                    <AnimateOnScroll direction="fade-up">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
                                What I Do
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Crafting digital experiences with modern technologies
                            </p>
                            <div className="shimmer-line w-20 mx-auto mt-6" />
                        </div>
                    </AnimateOnScroll>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Full-Stack Development",
                                description:
                                    "Building robust web applications with React, Next.js, Node.js, and TypeScript. From frontend interfaces to backend APIs.",
                                icon: (
                                    <svg
                                        className="w-8 h-8"
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
                                gradient: "from-blue-500/20 to-indigo-500/20",
                            },
                            {
                                title: "System Design",
                                description:
                                    "Architecting scalable systems with distributed computing, caching strategies, and microservices patterns.",
                                icon: (
                                    <svg
                                        className="w-8 h-8"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                        />
                                    </svg>
                                ),
                                gradient: "from-purple-500/20 to-pink-500/20",
                            },
                            {
                                title: "Technical Writing",
                                description:
                                    "Sharing knowledge through in-depth technical articles on system design, data structures, and software engineering.",
                                icon: (
                                    <svg
                                        className="w-8 h-8"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                ),
                                gradient: "from-cyan-500/20 to-teal-500/20",
                            },
                        ].map((item, index) => (
                            <AnimateOnScroll
                                key={item.title}
                                direction="fade-up"
                                delay={index * 150}
                            >
                                <div className="glass rounded-2xl p-8 card-hover group relative overflow-hidden h-full">
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
                                    />
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3 text-foreground">
                                            {item.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </AnimateOnScroll>
                        ))}
                    </div>

                    {/* CTA */}
                    <AnimateOnScroll direction="scale-in" delay={200}>
                        <div className="mt-16 text-center">
                            <div className="glass-strong rounded-2xl p-10 glow-border inline-block animate-pulse-glow">
                                <h3 className="text-2xl font-bold mb-3 text-foreground">
                                    Interested in working together?
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    Check out my projects and feel free to reach out.
                                </p>
                                <Link href="/about" className="btn-primary group gap-2">
                                    Learn More About Me
                                    <svg
                                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                        />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </AnimateOnScroll>
                </div>
            </section>
        </div>
    );
}
