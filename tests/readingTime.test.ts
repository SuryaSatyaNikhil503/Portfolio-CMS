import { describe, it, expect } from "vitest";
import { readingTimeFromDoc } from "@/lib/readingTime";

const text = (t: string) => ({ type: "text", text: t });
const para = (t: string) => ({ type: "paragraph", content: [text(t)] });
const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");
const doc = (...content: unknown[]) => ({ type: "doc", content });

describe("readingTimeFromDoc", () => {
  it("treats an empty or invalid document as 0 words and '1 min read'", () => {
    expect(readingTimeFromDoc(null)).toEqual({ words: 0, minutes: 1, label: "1 min read" });
    expect(readingTimeFromDoc({})).toEqual({ words: 0, minutes: 1, label: "1 min read" });
    expect(readingTimeFromDoc("nonsense")).toEqual({ words: 0, minutes: 1, label: "1 min read" });
  });

  it("counts words in paragraphs, headings, list items and code blocks", () => {
    const d = doc(
      { type: "heading", attrs: { level: 2 }, content: [text(words(10))] },
      para(words(20)),
      { type: "bulletList", content: [{ type: "listItem", content: [para(words(30))] }] },
      { type: "codeBlock", attrs: { language: "java" }, content: [text(words(40))] },
    );
    expect(readingTimeFromDoc(d).words).toBe(100);
  });

  it("uses 230 words per minute and rounds up (460 words = 2 min, 461 = 3 min)", () => {
    expect(readingTimeFromDoc(doc(para(words(460)))).minutes).toBe(2);
    expect(readingTimeFromDoc(doc(para(words(461)))).minutes).toBe(3);
  });

  it("formats the label as '<n> min read'", () => {
    expect(readingTimeFromDoc(doc(para(words(1380)))).label).toBe("6 min read");
  });

  it("does not count words inside images or hard breaks as extra words", () => {
    const d = doc(para("a b"), { type: "image", attrs: { src: "x", alt: "one two three" } }, { type: "paragraph", content: [text("c"), { type: "hardBreak" }, text("d")] });
    expect(readingTimeFromDoc(d).words).toBe(4);
  });
});
