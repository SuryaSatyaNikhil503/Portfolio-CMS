"use client";

// Compatibility wrapper: the About and Project admin pages import this path.
import RichTextEditor from "./RichTextEditor";

interface TipTapEditorProps {
  content: object;
  onChange: (content: object) => void;
  blogSlug?: string;
}

export default function TipTapEditor({ content, onChange, blogSlug }: TipTapEditorProps) {
  return <RichTextEditor content={content} onChange={onChange} blogSlug={blogSlug} />;
}
