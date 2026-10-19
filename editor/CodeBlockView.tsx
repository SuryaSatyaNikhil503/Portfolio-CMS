"use client";

import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from "@tiptap/react";
import { CODE_LANGUAGES } from "@/lib/highlight";
import CopyButton from "@/components/code/CopyButton";

/** Editor view of a code block: same frame as the site, with a language picker, file name and highlight-lines field. */
export default function CodeBlockView({ node, updateAttributes }: ReactNodeViewProps) {
  const lines = node.textContent.split("\n").length;
  return (
    <NodeViewWrapper as="figure" className="cb cb-edit">
      <div className="top" contentEditable={false}>
        <span className="dots"><i /><i /><i /></span>
        <input className="fn-in" value={(node.attrs.filename as string | null) ?? ""} placeholder="File name (optional)" aria-label="File name" onChange={(e) => updateAttributes({ filename: e.target.value || null })} />
        <input className="hl-in" value={(node.attrs.highlight as string | null) ?? ""} placeholder="Highlight lines: 3,5-7" aria-label="Highlight lines" onChange={(e) => updateAttributes({ highlight: e.target.value || null })} />
        <select className="lang-sel" value={(node.attrs.language as string | null) || "plaintext"} aria-label="Language" onChange={(e) => updateAttributes({ language: e.target.value })}>
          {CODE_LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
        <CopyButton text={node.textContent} />
      </div>
      <pre>
        <span className="gut" contentEditable={false} aria-hidden="true">{Array.from({ length: lines }, (_, i) => i + 1).join("\n")}</span>
        <NodeViewContent<"code"> as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
