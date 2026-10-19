"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor, type JSONContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import Icon, { type IconName } from "@/components/ui/Icon";
import { buildExtensions } from "./extensions";
import { looksLikeMarkdown } from "./markdownPaste";

export interface RichTextEditorProps {
  content: object;
  onChange: (doc: JSONContent) => void;
  blogSlug?: string;
  onEditor?: (editor: Editor) => void;
  placeholder?: string;
}

const safeHref = (v: string) => (/^(https?:\/\/|mailto:|\/)/i.test(v.trim()) ? v.trim() : /^[\w-]+\.[\w.-]+/.test(v.trim()) ? `https://${v.trim()}` : "");

function Btn({ icon, label, on, onClick, disabled }: { icon: IconName; label: string; on?: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" className={"b" + (on ? " on" : "")} aria-label={label} title={label} aria-pressed={on} disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={onClick}>
      <Icon name={icon} size={17} />
    </button>
  );
}

export default function RichTextEditor({ content, onChange, blogSlug, onEditor, placeholder }: RichTextEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const [uploading, setUploading] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const extensions = useMemo(() => buildExtensions({ onPickImage: () => fileRef.current?.click(), placeholder }), [placeholder]);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", blogSlug ? `blog:${blogSlug}` : "profile-photo");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) editorRef.current?.chain().focus().setImage({ src: data.url, alt: "" }).run();
    } catch (error) {
      console.error("Image upload error:", error);
    } finally {
      setUploading(false);
    }
  };
  const uploadRef = useRef(upload);
  uploadRef.current = upload;

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content,
    editorProps: {
      attributes: { class: "article tiptap", spellcheck: "true" },
      handlePaste: (_view, event) => {
        const dt = event.clipboardData;
        const ed = editorRef.current;
        if (!dt || !ed || ed.isActive("codeBlock")) return false;
        const file = Array.from(dt.files).find((f) => f.type.startsWith("image/"));
        if (file) { uploadRef.current(file); return true; }
        const text = dt.getData("text/plain");
        const html = dt.getData("text/html");
        const structured = /<(h[1-6]|ul|ol|pre|table|blockquote)\b/i.test(html);
        if (text && looksLikeMarkdown(text) && !structured) {
          ed.commands.insertContent(text, { contentType: "markdown" });
          return true;
        }
        return false;
      },
    },
    onCreate: ({ editor: e }) => { editorRef.current = e; onEditor?.(e); },
    onUpdate: ({ editor: e }) => onChange(e.getJSON()),
  });

  useEffect(() => {
    if (!editor) return;
    editorRef.current = editor;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __editor?: Editor }).__editor = editor; // dev-only handle for debugging
  }, [editor]);
  if (!editor) return <div className="acard"><p className="muted" style={{ margin: 0 }}>Loading editor…</p></div>;

  const heading = editor.isActive("heading", { level: 1 }) ? "1" : editor.isActive("heading", { level: 2 }) ? "2" : editor.isActive("heading", { level: 3 }) ? "3" : editor.isActive("heading", { level: 4 }) ? "4" : "p";
  const setHeading = (v: string) => {
    const c = editor.chain().focus();
    if (v === "p") c.setParagraph().run();
    else c.setNode("heading", { level: Number(v) as 1 | 2 | 3 | 4 }).run();
  };
  const applyLink = () => {
    const href = safeHref(linkUrl);
    if (href) editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setLinkOpen(false);
    setLinkUrl("");
  };
  const toggleLink = () => {
    if (editor.isActive("link")) { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    setLinkUrl((editor.getAttributes("link").href as string | undefined) ?? "");
    setLinkOpen((o) => !o);
  };

  return (
    <div className="rte">
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      <div className="edbar" role="toolbar" aria-label="Formatting">
        <select className="sel2" aria-label="Text style" value={heading} onChange={(e) => setHeading(e.target.value)}>
          <option value="p">Paragraph</option>
          {heading === "1" && <option value="1">Heading 1</option>}
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
        </select>
        <span className="sep" />
        <Btn icon="bold" label="Bold" on={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
        <Btn icon="italic" label="Italic" on={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <Btn icon="code" label="Inline code" on={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} />
        <Btn icon="link" label="Link" on={editor.isActive("link")} onClick={toggleLink} />
        <span className="sep" />
        <Btn icon="list" label="Bulleted list" on={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <Btn icon="olist" label="Numbered list" on={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <Btn icon="quote" label="Quote" on={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <span className="sep" />
        <Btn icon="code" label="Code block" on={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
        <Btn icon="bulb" label="Callout" on={editor.isActive("callout")} onClick={() => editor.chain().focus().toggleCallout().run()} />
        <Btn icon="image" label={uploading ? "Uploading image…" : "Image"} disabled={uploading} onClick={() => fileRef.current?.click()} />
        <Btn icon="table" label="Table" on={editor.isActive("table")} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
        <span className="sep" />
        <Btn icon="undo" label="Undo" onClick={() => editor.chain().focus().undo().run()} />
        <span style={{ flex: 1 }} />
        <span className="muted hintx">Type / for blocks · paste Markdown to format</span>
      </div>
      {linkOpen && (
        <form className="linkbar" onSubmit={(e) => { e.preventDefault(); applyLink(); }}>
          <input className="in" autoFocus value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" aria-label="Link address" onKeyDown={(e) => { if (e.key === "Escape") setLinkOpen(false); }} />
          <button type="submit" className="btn s p">Apply link</button>
          <button type="button" className="btn s" onClick={() => setLinkOpen(false)}>Cancel</button>
        </form>
      )}

      <BubbleMenu editor={editor} options={{ placement: "top", offset: 10 }} shouldShow={({ editor: e, state }) => !state.selection.empty && !e.isActive("codeBlock") && !e.isActive("image") && !linkOpen}>
        <div className="bubble live" role="toolbar" aria-label="Selected text">
          <Btn icon="bold" label="Bold" on={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
          <Btn icon="italic" label="Italic" on={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
          <Btn icon="code" label="Inline code" on={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} />
          <Btn icon="link" label="Link" on={editor.isActive("link")} onClick={toggleLink} />
          <Btn icon="heading" label="Heading 2" on={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} />
    </div>
  );
}
