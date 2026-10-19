interface DocNode { type?: string; text?: string; content?: DocNode[] }

/** All visible text of a TipTap document, block by block (images and hard breaks contribute no words). */
export function tiptapText(doc: unknown): string {
  const parts: string[] = [];
  const walk = (n: DocNode) => {
    if (n.type === "text" && typeof n.text === "string") parts.push(n.text);
    else if (n.type === "hardBreak") parts.push(" ");
    n.content?.forEach(walk);
    if (n.type && ["paragraph", "heading", "listItem", "codeBlock", "blockquote"].includes(n.type)) parts.push(" ");
  };
  if (doc && typeof doc === "object") walk(doc as DocNode);
  return parts.join("").replace(/\s+/g, " ").trim();
}

export function readingTimeFromDoc(doc: unknown, wpm = 230): { words: number; minutes: number; label: string } {
  const text = tiptapText(doc);
  const words = text ? text.split(" ").length : 0;
  const minutes = Math.max(1, Math.ceil(words / wpm));
  return { words, minutes, label: `${minutes} min read` };
}
