import { getPortfolioStats } from "@/lib/getPortfolioStats";
import HomeContent from "@/components/HomeContent";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [stats, about] = await Promise.all([
    getPortfolioStats(),
    prisma.about.findFirst({ select: { title: true } }),
  ]);

  const displayStats = [
    {
      label: "Projects Built",
      value: stats.projectCount || 0,
      suffix: "+",
    },
    {
      label: "Blog Articles",
      value: stats.blogCount || 0,
      suffix: "+",
    },
    {
      label: "Years Exp.",
      value: stats.yearsOfExperience || 0,
      suffix: "+",
    },
  ];

  return (
    <HomeContent
      stats={displayStats}
      title={about?.title || "Full-Stack Developer"}
    />
  );
}
