import { describe, it, expect } from "vitest";
import { isBot } from "@/lib/analytics/bots";
import { parseUA } from "@/lib/analytics/device";
import { classifySource } from "@/lib/analytics/source";
import { trackPayload } from "@/lib/analytics/schema";
import { deleteExpired, RETENTION_DAYS } from "@/lib/analytics/retention";

const SID = "3f2b8a10-5c1e-4d7a-9b6f-1a2b3c4d5e6f";

describe("isBot", () => {
  it("flags crawlers, link previews, headless browsers, scripts and empty agents", () => {
    for (const ua of ["Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", "facebookexternalhit/1.1", "Mozilla/5.0 HeadlessChrome/120.0", "curl/8.4.0", "python-requests/2.31", "Mozilla/5.0 (compatible; bingbot/2.0)", "Slackbot-LinkExpanding 1.0", "", null, undefined]) expect(isBot(ua as string)).toBe(true);
  });
  it("flags AI and search crawlers by their real names", () => {
    for (const ua of ["Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)", "Mozilla/5.0 AppleWebKit/537.36 (compatible; GPTBot/1.1)", "Mozilla/5.0 (compatible; PerplexityBot/1.0)"]) expect(isBot(ua)).toBe(true);
  });
  it("does not mistake an Electron app browser that names itself in the user agent for a bot", () => {
    expect(isBot("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Claude/2.42304.2 Chrome/152.0.7977.149 Safari/537.36")).toBe(false);
    expect(isBot("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Slack/4.36 Chrome/120.0.0.0 Safari/537.36")).toBe(false);
  });
  it("lets real browsers through", () => {
    expect(isBot("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")).toBe(false);
    expect(isBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")).toBe(false);
  });
});

describe("parseUA", () => {
  it("reads device, OS and browser", () => {
    expect(parseUA("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1")).toEqual({ device: "mobile", os: "iOS", browser: "Safari" });
    expect(parseUA("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0")).toEqual({ device: "desktop", os: "Windows", browser: "Edge" });
    expect(parseUA("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36")).toEqual({ device: "desktop", os: "macOS", browser: "Chrome" });
    expect(parseUA("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36")).toEqual({ device: "mobile", os: "Android", browser: "Chrome" });
    expect(parseUA("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1").device).toBe("tablet");
    expect(parseUA("Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0")).toEqual({ device: "desktop", os: "Linux", browser: "Firefox" });
  });
});

describe("classifySource", () => {
  const self = "suryasatyanikhil.vercel.app";
  it("names well-known sources from the referrer host", () => {
    expect(classifySource("https://www.google.com/", null, self).source).toBe("Google");
    expect(classifySource("https://www.linkedin.com/feed/", null, self).source).toBe("LinkedIn");
    expect(classifySource("https://lnkd.in/abc", null, self).source).toBe("LinkedIn");
    expect(classifySource("https://t.co/xyz", null, self).source).toBe("Twitter/X");
    expect(classifySource("https://github.com/SuryaSatyaNikhil503/Email-Scheduler", null, self).source).toBe("GitHub");
    expect(classifySource("https://old.reddit.com/r/java", null, self).source).toBe("Reddit");
    expect(classifySource("https://some-blog.example/post", null, self).source).toBe("Other");
  });
  it("is Direct with no referrer or when it is the site itself", () => {
    expect(classifySource("", null, self)).toEqual({ source: "Direct", host: "" });
    expect(classifySource("https://suryasatyanikhil.vercel.app/blogs", null, self).source).toBe("Direct");
  });
  it("lets utm_source override the referrer", () => {
    expect(classifySource("https://t.co/xyz", "linkedin", self).source).toBe("LinkedIn");
    expect(classifySource("", "newsletter", self).source).toBe("Newsletter");
  });
  it("returns the host without www", () => {
    expect(classifySource("https://www.linkedin.com/feed/", null, self).host).toBe("linkedin.com");
  });
  it("survives a malformed referrer", () => {
    expect(classifySource("not a url", null, self).source).toBe("Other");
  });
});

describe("trackPayload", () => {
  const view = { type: "view", sid: SID, path: "/blogs/idempotency", seq: 0 };
  it("accepts a valid view, leave and event", () => {
    expect(trackPayload.safeParse(view).success).toBe(true);
    expect(trackPayload.safeParse({ type: "leave", sid: SID, path: "/blogs/x", seq: 0, activeSeconds: 120, scrollDepth: 80 }).success).toBe(true);
    expect(trackPayload.safeParse({ type: "event", sid: SID, name: "resume_download", path: "/about" }).success).toBe(true);
  });
  it("rejects admin and api paths, a path that does not start with /, and oversize paths", () => {
    expect(trackPayload.safeParse({ ...view, path: "/admin/blogs" }).success).toBe(false);
    expect(trackPayload.safeParse({ ...view, path: "/api/track" }).success).toBe(false);
    expect(trackPayload.safeParse({ ...view, path: "blogs/x" }).success).toBe(false);
    expect(trackPayload.safeParse({ ...view, path: "/" + "a".repeat(400) }).success).toBe(false);
  });
  it("rejects out-of-range time or depth, a bad session id and unknown event names", () => {
    expect(trackPayload.safeParse({ type: "leave", sid: SID, path: "/", seq: 0, activeSeconds: 99999, scrollDepth: 50 }).success).toBe(false);
    expect(trackPayload.safeParse({ type: "leave", sid: SID, path: "/", seq: 0, activeSeconds: 10, scrollDepth: 140 }).success).toBe(false);
    expect(trackPayload.safeParse({ ...view, sid: "not-a-uuid" }).success).toBe(false);
    expect(trackPayload.safeParse({ type: "event", sid: SID, name: "drop_table", path: "/" }).success).toBe(false);
  });
  it("strips the query string and fragment from the path", () => {
    const r = trackPayload.parse({ ...view, path: "/blogs/x?utm_source=a&email=me@x.com#top" });
    expect(r.type === "view" && r.path).toBe("/blogs/x");
  });
});

describe("deleteExpired", () => {
  it("deletes only sessions last seen more than 90 days before now", async () => {
    let cutoff: Date | null = null;
    const db = { visitSession: { deleteMany: async ({ where }: { where: { lastSeenAt: { lt: Date } } }) => { cutoff = where.lastSeenAt.lt; return { count: 3 }; } } };
    const now = new Date("2026-10-19T00:00:00Z");
    const res = await deleteExpired(db, now);
    expect(RETENTION_DAYS).toBe(90);
    expect(cutoff!.toISOString()).toBe("2026-07-21T00:00:00.000Z");
    expect(res).toEqual({ sessions: 3 });
  });
});
