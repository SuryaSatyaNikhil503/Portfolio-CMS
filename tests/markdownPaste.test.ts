import { describe, it, expect } from "vitest";
import { looksLikeMarkdown } from "@/editor/markdownPaste";

describe("looksLikeMarkdown", () => {
  it("recognises headings, lists, fenced code, bold and links", () => {
    expect(looksLikeMarkdown("## Heading\nsome text")).toBe(true);
    expect(looksLikeMarkdown("- one\n- two")).toBe(true);
    expect(looksLikeMarkdown("1. one\n2. two")).toBe(true);
    expect(looksLikeMarkdown("```java\nint x = 1;\n```")).toBe(true);
    expect(looksLikeMarkdown("this is **important** text")).toBe(true);
    expect(looksLikeMarkdown("see [docs](https://example.com/a)")).toBe(true);
  });
  it("leaves plain prose, a lone dash or a stray asterisk alone", () => {
    expect(looksLikeMarkdown("just a normal sentence, with a comma.")).toBe(false);
    expect(looksLikeMarkdown("5 - 3 = 2")).toBe(false);
    expect(looksLikeMarkdown("a * b")).toBe(false);
    expect(looksLikeMarkdown("")).toBe(false);
  });
  it("ignores a single list-looking line (could be ordinary text)", () => {
    expect(looksLikeMarkdown("- just one line")).toBe(false);
  });
});
