import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import prisma from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yoursite.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Surya Satya Nikhil Gadhavajula | Software Developer",
    template: "%s | Surya Satya Nikhil Gadhavajula",
  },
  description:
    "Surya Satya Nikhil Gadhavajula — Software Developer specializing in Spring Boot, React, microservices, scalable backend systems, and CI/CD. Explore projects, technical articles, and professional experience.",
  keywords: [
    "Surya Satya Nikhil Gadhavajula",
    "Surya Satya Nikhil",
    "Nikhil Gadhavajula",
    "Nikhil",
    "software developer",
    "Spring Boot developer",
    "React developer",
    "microservices",
    "backend developer",
    "full stack developer",
    "portfolio",
    "software engineer",
    "CI/CD",
    "scalable systems",
  ],
  authors: [{ name: "Surya Satya Nikhil Gadhavajula" }],
  creator: "Surya Satya Nikhil Gadhavajula",
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Surya Satya Nikhil Gadhavajula | Software Developer",
    description:
      "Software Developer specializing in Spring Boot, React, microservices, and scalable backend systems.",
    siteName: "Surya Satya Nikhil Gadhavajula",
  },
  twitter: {
    card: "summary_large_image",
    title: "Surya Satya Nikhil Gadhavajula | Software Developer",
    description:
      "Software Developer specializing in Spring Boot, React, microservices, and scalable backend systems.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const about = await prisma.about.findFirst({
    select: { githubUrl: true, linkedinUrl: true },
  }).catch(() => null);

  const sameAs = [
    about?.githubUrl,
    about?.linkedinUrl,
  ].filter(Boolean) as string[];

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Surya Satya Nikhil Gadhavajula",
    alternateName: ["Surya Satya Nikhil", "Nikhil Gadhavajula", "Nikhil"],
    url: siteUrl,
    jobTitle: "Software Developer",
    description:
      "Software Developer specializing in Spring Boot, React, microservices, scalable backend systems, and CI/CD.",
    sameAs,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body className="noise min-h-screen flex flex-col">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
