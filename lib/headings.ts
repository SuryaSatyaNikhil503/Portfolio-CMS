export interface TocItem { level: 2 | 3; text: string; id: string }
interface N { type: string; content?: N[]; text?: string; attrs?: Record<string, unknown> }

const plain = (n: N): string => (n.content ?? []).map((c) => (c.type === "text" ? c.text ?? "" : plain(c))).join("");

export function slugify(text: string): string {
  return text.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "section";
}

/** h2 and h3 of a TipTap document in order, with ids that are unique within the document. */
export function extractHeadings(doc: unknown): TocItem[] {
  const out: TocItem[] = [];
  const seen = new Map<string, number>();
  const walk = (n: N) => {
    if (n.type === "heading") {
      const level = Number(n.attrs?.level);
      const text = plain(n).trim();
      if ((level === 2 || level === 3) && text) {
        const base = slugify(text);
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        out.push({ level, text, id: count ? `${base}-${count + 1}` : base });
      }
    }
    n.content?.forEach(walk);
  };
  if (doc && typeof doc === "object") walk(doc as N);
  return out;
}
