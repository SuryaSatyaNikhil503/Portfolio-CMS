import { common, createLowlight } from "lowlight";

// One highlighter for the whole app: the site (server) and the editor use the same grammar and the same colours.
export const lowlight = createLowlight(common);

export const CODE_LANGUAGES = [
  { id: "java", label: "Java" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "sql", label: "SQL" },
  { id: "yaml", label: "YAML" },
  { id: "bash", label: "Bash" },
  { id: "json", label: "JSON" },
  { id: "xml", label: "HTML / XML" },
  { id: "css", label: "CSS" },
  { id: "plaintext", label: "Plain text" },
] as const;

export function languageLabel(id: string | null | undefined): string {
  return CODE_LANGUAGES.find((l) => l.id === id)?.label ?? (id ? id : "Plain text");
}

export type HNode =
  | { type: "text"; value: string }
  | { type: "element"; tagName: string; properties?: { className?: string[] | string }; children: HNode[] };

/** Split a highlighted tree into lines, re-opening any token that spans a newline (block comments, text blocks). */
function linesOf(node: HNode): HNode[][] {
  if (node.type === "text") return node.value.split("\n").map((v) => (v ? [{ type: "text" as const, value: v }] : []));
  const lines: HNode[][] = [[]];
  for (const child of node.children) {
    const cl = linesOf(child);
    lines[lines.length - 1]!.push(...cl[0]!);
    for (let i = 1; i < cl.length; i++) lines.push(cl[i]!);
  }
  return lines.map((nodes) => (nodes.length ? [{ ...node, children: nodes }] : []));
}

export function highlightToLines(code: string, language?: string | null): HNode[][] {
  let children: HNode[];
  if (language && language !== "plaintext" && lowlight.registered(language)) {
    children = lowlight.highlight(language, code).children as HNode[];
  } else {
    children = [{ type: "text", value: code }];
  }
  const root: HNode = { type: "element", tagName: "span", children };
  // root itself is not rendered: unwrap the single wrapper element per line
  return linesOf(root).map((line) => (line[0] && line[0].type === "element" ? line[0].children : []));
}

/** "3,5-7" -> Set{3,5,6,7}. Ignores anything that is not a positive integer or range. */
export function parseHighlight(spec: string | null | undefined): Set<number> {
  const out = new Set<number>();
  for (const part of (spec ?? "").split(",")) {
    const m = part.trim().match(/^(\d{1,4})(?:\s*-\s*(\d{1,4}))?$/);
    if (!m) continue;
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    for (let n = a; n <= Math.min(b, a + 500); n++) if (n > 0) out.add(n);
  }
  return out;
}
