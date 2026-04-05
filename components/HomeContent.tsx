"use client";

import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import AnimatedCounter from "@/components/AnimatedCounter";
import NewsletterForm from "@/components/NewsletterForm";

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
                                Available for Opportunities
                            </div>
                        </AnimateOnScroll>

                        <AnimateOnScroll direction="fade-up" delay={150}>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                                <span className="gradient-text">{title}</span>
                            </h1>
                        </AnimateOnScroll>

                        <AnimateOnScroll direction="fade-up" delay={300}>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                I engineer scalable systems, solve complex problems, and share deep insights on
                                architecture, performance, and modern software engineering.
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: "Scalable Backend Systems",
                                description:
                                    "Building production-grade backends with Spring Boot and Node.js: microservices, REST APIs, message queues, and distributed systems designed to scale.",
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
                                            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                                        />
                                    </svg>
                                ),
                                gradient: "from-blue-500/20 to-indigo-500/20",
                            },
                            {
                                title: "Frontend & Full-Stack",
                                description:
                                    "Crafting performant UIs with React JS, integrated end-to-end with robust backend APIs from design system to deployment.",
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
                                gradient: "from-purple-500/20 to-pink-500/20",
                            },
                            {
                                title: "CI/CD & DevOps",
                                description:
                                    "Automating delivery pipelines with CI/CD and cloud deployments, keeping releases fast, reliable, and repeatable.",
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
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        />
                                    </svg>
                                ),
                                gradient: "from-cyan-500/20 to-teal-500/20",
                            },
                            {
                                title: "Technical Writing",
                                description:
                                    "Writing deep-dive articles on system design, architecture, performance, and engineering trade-offs.",
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
                                gradient: "from-orange-500/20 to-yellow-500/20",
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

            {/* Newsletter Section */}
            <section id="newsletter" className="section-padding">
                <div className="container-width">
                    <AnimateOnScroll>
                        <div className="max-w-xl mx-auto glass-strong rounded-2xl p-8 text-center glow-border">
                            <h2 className="text-2xl font-bold text-foreground mb-2">Stay in the Loop</h2>
                            <p className="text-muted-foreground mb-6 text-sm">
                                Get notified when I publish new articles on system design, software development, and more.
                            </p>
                            <NewsletterForm />
                        </div>
                    </AnimateOnScroll>
                </div>
            </section>
        </div>
    );
}
