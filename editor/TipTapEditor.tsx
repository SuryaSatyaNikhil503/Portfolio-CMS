"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import MenuBar from "./MenuBar";

interface TipTapEditorProps {
  content: object;
  onChange: (content: object) => void;
  blogSlug?: string;
}

export default function TipTapEditor({ content, onChange, blogSlug }: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "rounded-xl max-w-full",
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose-blog focus:outline-none min-h-[400px] p-4",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  if (!editor) return null;

  return (
    <div className="tiptap-editor glass rounded-xl overflow-hidden">
      <MenuBar editor={editor} blogSlug={blogSlug} />
      <EditorContent editor={editor} />
    </div>
  );
}
