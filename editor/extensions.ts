import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import { Markdown } from "@tiptap/markdown";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { lowlight } from "@/lib/highlight";
import { Callout } from "./Callout";
import CodeBlockView from "./CodeBlockView";
import ImageView from "./ImageView";
import { SlashCommand } from "./slashCommand";

const attr = (name: string, data: string) => ({
  default: null as string | null,
  parseHTML: (el: HTMLElement) => el.getAttribute(data),
  renderHTML: (a: Record<string, unknown>) => (a[name] ? { [data]: a[name] as string } : {}),
});

const CodeBlockEx = CodeBlockLowlight.extend({
  addAttributes() {
    return { ...this.parent?.(), filename: attr("filename", "data-filename"), highlight: attr("highlight", "data-highlight") };
  },
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
}).configure({ lowlight, defaultLanguage: "plaintext" });

const ImageEx = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
}).configure({ allowBase64: false });

export function buildExtensions(opts: { onPickImage: () => void; placeholder?: string }) {
  return [
    // levels 1-4 stay supported so older posts that contain an h1 open unchanged
    StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3, 4] } }),
    CodeBlockEx,
    Callout,
    ImageEx,
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    Placeholder.configure({ placeholder: opts.placeholder ?? "Write something, or type / to insert a block…" }),
    Markdown,
    SlashCommand.configure({ onPickImage: opts.onPickImage }),
  ];
}
