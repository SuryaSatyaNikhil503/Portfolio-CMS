export interface SeoCheck { id: "title" | "excerpt" | "tags" | "thumbnail" | "alt"; ok: boolean; text: string }
interface Input { title: string; excerpt: string; tags: string[]; thumbnail: string; doc: unknown }
interface N { type?: string; attrs?: { alt?: string }; content?: N[] }

function imagesWithoutAlt(doc: unknown): number {
  let n = 0;
  const walk = (x: N) => {
    if (x.type === "image" && !x.attrs?.alt?.trim()) n++;
    x.content?.forEach(walk);
  };
  if (doc && typeof doc === "object") walk(doc as N);
  return n;
}

export function seoChecks({ title, excerpt, tags, thumbnail, doc }: Input): SeoCheck[] {
  const t = title.trim().length;
  const e = excerpt.trim().length;
  const missing = imagesWithoutAlt(doc);
  return [
    { id: "title", ok: t >= 20 && t <= 60, text: t >= 20 && t <= 60 ? `Title is ${t} characters` : `Title is ${t} characters (aim for 20 to 60)` },
    { id: "excerpt", ok: e >= 50 && e <= 160, text: e === 0 ? "Excerpt is missing" : e >= 50 && e <= 160 ? "Excerpt is set" : `Excerpt is ${e} characters (aim for 50 to 160)` },
    { id: "tags", ok: tags.length >= 1 && tags.length <= 6, text: tags.length === 0 ? "No tags" : tags.length <= 6 ? `${tags.length} tags` : `${tags.length} tags is a lot (aim for 3 to 6)` },
    { id: "thumbnail", ok: Boolean(thumbnail.trim()), text: thumbnail.trim() ? "Thumbnail is set" : "No thumbnail yet" },
    { id: "alt", ok: missing === 0, text: missing === 0 ? "All images have alt text" : `${missing} image${missing === 1 ? " has" : "s have"} no alt text` },
  ];
}
