/** True when pasted plain text is clearly Markdown (so it should become formatted blocks, not literal stars and hashes). */
export function looksLikeMarkdown(text: string): boolean {
  if (!text.trim()) return false;
  if (/^#{1,6}\s+\S/m.test(text)) return true;
  if (/^```/m.test(text)) return true;
  if (/\*\*[^*\n]+\*\*/.test(text)) return true;
  if (/\[[^\]\n]+\]\(https?:\/\/[^)\s]+\)/.test(text)) return true;
  const listLines = text.split("\n").filter((l) => /^\s*([-*+]|\d+\.)\s+\S/.test(l));
  return listLines.length >= 2;
}
