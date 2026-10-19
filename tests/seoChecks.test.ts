import { describe, it, expect } from "vitest";
import { seoChecks } from "@/lib/seoChecks";

const good = { title: "Idempotency in Microservices: Why It Matters", excerpt: "Why retries are dangerous in distributed systems, and the small idempotency-key pattern that makes them safe.", tags: ["a", "b", "c"], thumbnail: "https://x/y.png", doc: { type: "doc", content: [] } };
const byId = (r: ReturnType<typeof seoChecks>, id: string) => r.find((c) => c.id === id)!;

describe("seoChecks", () => {
  it("passes a complete post", () => {
    expect(seoChecks(good).every((c) => c.ok)).toBe(true);
  });
  it("flags a title over 60 characters and states its length", () => {
    const c = byId(seoChecks({ ...good, title: "x".repeat(72) }), "title");
    expect(c.ok).toBe(false);
    expect(c.text).toContain("72");
  });
  it("flags a missing excerpt and one outside 50 to 160 characters", () => {
    expect(byId(seoChecks({ ...good, excerpt: "" }), "excerpt").ok).toBe(false);
    expect(byId(seoChecks({ ...good, excerpt: "short" }), "excerpt").ok).toBe(false);
    expect(byId(seoChecks({ ...good, excerpt: "y".repeat(170) }), "excerpt").ok).toBe(false);
  });
  it("flags no tags and more than 6 tags", () => {
    expect(byId(seoChecks({ ...good, tags: [] }), "tags").ok).toBe(false);
    expect(byId(seoChecks({ ...good, tags: Array.from({ length: 12 }, (_, i) => "t" + i) }), "tags").ok).toBe(false);
  });
  it("flags a missing thumbnail", () => {
    expect(byId(seoChecks({ ...good, thumbnail: "" }), "thumbnail").text).toBe("No thumbnail yet");
  });
  it("counts images without alt text", () => {
    const doc = { type: "doc", content: [{ type: "image", attrs: { src: "a", alt: "" } }, { type: "image", attrs: { src: "b", alt: "ok" } }, { type: "image", attrs: { src: "c" } }] };
    const c = byId(seoChecks({ ...good, doc }), "alt");
    expect(c.ok).toBe(false);
    expect(c.text).toBe("2 images have no alt text");
  });
});
