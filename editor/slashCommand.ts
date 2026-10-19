import { Extension, type Editor, type Range } from "@tiptap/core";
import Suggestion, { type SuggestionProps, type SuggestionKeyDownProps } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import { computePosition, flip, shift, offset } from "@floating-ui/dom";
import SlashList, { type SlashItem, type SlashListHandle } from "./SlashList";

export const SLASH_ITEMS: SlashItem[] = [
  { id: "h2", title: "Heading 2", description: "Section heading", icon: "heading", hint: "##", keywords: ["heading", "h2", "title", "section"] },
  { id: "h3", title: "Heading 3", description: "Sub-heading", icon: "heading", hint: "###", keywords: ["heading", "h3", "subheading"] },
  { id: "bullet", title: "Bulleted list", description: "A simple list with bullets", icon: "list", hint: "-", keywords: ["bullet", "list", "ul", "unordered"] },
  { id: "number", title: "Numbered list", description: "Steps in order", icon: "olist", hint: "1.", keywords: ["number", "ordered", "list", "ol", "steps"] },
  { id: "quote", title: "Quote", description: "Pull quote or citation", icon: "quote", hint: ">", keywords: ["quote", "blockquote", "citation"] },
  { id: "code", title: "Code block", description: "Syntax colours, file name, copy", icon: "code", hint: "```", keywords: ["code", "snippet", "java", "program"] },
  { id: "callout", title: "Callout", description: "Highlight a tip or warning", icon: "bulb", hint: "/callout", keywords: ["callout", "tip", "note", "warning", "info"] },
  { id: "image", title: "Image", description: "Upload a picture with alt text", icon: "image", hint: "", keywords: ["image", "picture", "photo", "upload"] },
  { id: "table", title: "Table", description: "Rows and columns", icon: "table", hint: "/table", keywords: ["table", "comparison", "grid"] },
  { id: "divider", title: "Divider", description: "A horizontal line", icon: "more", hint: "---", keywords: ["divider", "line", "rule", "separator"] },
];

function run(item: SlashItem, editor: Editor, range: Range, pickImage?: () => void) {
  const chain = editor.chain().focus().deleteRange(range);
  switch (item.id) {
    case "h2": chain.setNode("heading", { level: 2 }).run(); break;
    case "h3": chain.setNode("heading", { level: 3 }).run(); break;
    case "bullet": chain.toggleBulletList().run(); break;
    case "number": chain.toggleOrderedList().run(); break;
    case "quote": chain.toggleBlockquote().run(); break;
    case "code": chain.setCodeBlock().run(); break;
    case "callout": chain.toggleCallout().run(); break;
    case "table": chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); break;
    case "divider": chain.setHorizontalRule().run(); break;
    case "image": chain.run(); pickImage?.(); break;
  }
}

export const SlashCommand = Extension.create<{ onPickImage?: () => void }>({
  name: "slashCommand",
  addOptions() {
    return { onPickImage: undefined };
  },
  addProseMirrorPlugins() {
    const pickImage = () => this.options.onPickImage?.();
    return [
      Suggestion<SlashItem, SlashItem>({
        editor: this.editor,
        char: "/",
        startOfLine: false,
        items: ({ query }) => {
          const q = query.trim().toLowerCase();
          return q ? SLASH_ITEMS.filter((i) => i.title.toLowerCase().includes(q) || i.keywords.some((k) => k.includes(q))) : SLASH_ITEMS;
        },
        command: ({ editor, range, props }) => run(props, editor, range, pickImage),
        render: () => {
          let comp: ReactRenderer<SlashListHandle, { items: SlashItem[]; query: string; command: (i: SlashItem) => void }> | null = null;
          const place = (props: SuggestionProps<SlashItem, SlashItem>) => {
            const rect = props.clientRect?.();
            const el = comp?.element as HTMLElement | undefined;
            if (!rect || !el) return;
            computePosition({ getBoundingClientRect: () => rect }, el, { strategy: "fixed", placement: "bottom-start", middleware: [offset(6), flip(), shift({ padding: 8 })] }).then(({ x, y }) => {
              el.style.left = `${x}px`;
              el.style.top = `${y}px`;
            });
          };
          const toProps = (p: SuggestionProps<SlashItem, SlashItem>) => ({ items: p.items, query: p.query, command: (i: SlashItem) => p.command(i) });
          return {
            onStart: (props) => {
              comp = new ReactRenderer(SlashList, { props: toProps(props), editor: props.editor });
              const el = comp.element as HTMLElement;
              el.style.position = "fixed";
              el.style.zIndex = "60";
              (props.editor.view.dom.closest('[data-area="admin"]') ?? document.body).appendChild(el);
              place(props);
            },
            onUpdate: (props) => { comp?.updateProps(toProps(props)); place(props); },
            onKeyDown: (props: SuggestionKeyDownProps) => {
              if (props.event.key === "Escape") { (comp?.element as HTMLElement | undefined)?.remove(); return true; }
              return comp?.ref?.onKeyDown(props) ?? false;
            },
            onExit: () => { (comp?.element as HTMLElement | undefined)?.remove(); comp?.destroy(); comp = null; },
          };
        },
      }),
    ];
  },
});
