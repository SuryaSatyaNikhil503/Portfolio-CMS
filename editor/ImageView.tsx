"use client";

import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";

/** Image block with alt text (required for SEO and accessibility) and an optional caption. */
export default function ImageView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const alt = (node.attrs.alt as string | null) ?? "";
  return (
    <NodeViewWrapper as="figure" className={"img img-edit" + (selected ? " is-selected" : "")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={node.attrs.src as string} alt={alt} draggable={false} />
      <div className="img-meta" contentEditable={false}>
        <input value={alt} placeholder="Alt text: describe the image for search and screen readers" aria-label="Alt text" onChange={(e) => updateAttributes({ alt: e.target.value })} className={alt.trim() ? "" : "missing"} />
        <input value={(node.attrs.title as string | null) ?? ""} placeholder="Caption (optional)" aria-label="Caption" onChange={(e) => updateAttributes({ title: e.target.value || null })} />
      </div>
    </NodeViewWrapper>
  );
}
