import prisma from "@/lib/prisma";

export interface PortfolioStats {
    yearsOfExperience: number;
    currentRole: string;
    projectCount: number;
    blogCount: number;
}

/**
 * Parse a date string like "Jan 2022", "March 2020", "Present", etc.
 * Returns a Date object, or null if unparseable.
 */
function parseExperienceDate(dateStr: string): Date | null {
    if (!dateStr || dateStr.toLowerCase() === "present") {
        return new Date();
    }

    // Try direct Date parse first (handles "2022-01-15", "January 2022", "Jan 2022", etc.)
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
        return parsed;
    }

    // Try extracting just a year
    const yearMatch = dateStr.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
        return new Date(parseInt(yearMatch[0]), 0, 1);
    }

    return null;
}

/**
 * Calculate total years of experience from the earliest start date to now.
 */
function calculateYearsOfExperience(
    experiences: { startDate: string; endDate: string }[]
): number {
    if (experiences.length === 0) return 0;

    let earliestDate: Date | null = null;

    for (const exp of experiences) {
        const start = parseExperienceDate(exp.startDate);
        if (start && (!earliestDate || start < earliestDate)) {
            earliestDate = start;
        }
    }

    if (!earliestDate) return 0;

    const now = new Date();
    const diffMs = now.getTime() - earliestDate.getTime();
    const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);

    return Math.floor(years);
}

/**
 * Get the current/most recent role from experiences.
 * Prioritizes entries with endDate "Present", then falls back to latest startDate.
 */
function getCurrentRole(
    experiences: { role: string; startDate: string; endDate: string }[]
): string {
    if (experiences.length === 0) return "Developer";

    // First check for a "Present" role
    const currentExp = experiences.find(
        (exp) => exp.endDate.toLowerCase() === "present"
    );
    if (currentExp) return currentExp.role;

    // Otherwise, find the one with the latest start date
    let latest = experiences[0];
    for (const exp of experiences) {
        const latestDate = parseExperienceDate(latest.startDate);
        const expDate = parseExperienceDate(exp.startDate);
        if (expDate && latestDate && expDate > latestDate) {
            latest = exp;
        }
    }

    return latest.role;
}

/**
 * Fetch all portfolio stats from database in one call.
 */
export async function getPortfolioStats(): Promise<PortfolioStats> {
    try {
        const [experiences, projectCount, blogCount] = await Promise.all([
            prisma.experience.findMany({
                select: { role: true, startDate: true, endDate: true },
            }),
            prisma.project.count(),
            prisma.blog.count({ where: { published: true } }),
        ]);

        const yearsOfExperience = calculateYearsOfExperience(experiences);
        const currentRole = getCurrentRole(experiences);

        return {
            yearsOfExperience,
            currentRole,
            projectCount,
            blogCount,
        };
    } catch (error) {
        console.error("Error fetching portfolio stats:", error);
        return {
            yearsOfExperience: 0,
            currentRole: "Developer",
            projectCount: 0,
            blogCount: 0,
        };
    }
}
