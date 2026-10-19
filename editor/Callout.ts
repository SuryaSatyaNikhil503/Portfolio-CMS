import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: { toggleCallout: () => ReturnType };
  }
}

/** Highlighted tip/warning box. Renders as the same .callout block the site uses. */
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML() {
    return [{ tag: "div[data-callout]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-callout": "", class: "callout" }), ["span", { class: "callout-ic", contenteditable: "false" }], ["div", { class: "callout-body" }, 0]];
  },
  addCommands() {
    return { toggleCallout: () => ({ commands }) => commands.toggleWrap(this.name) };
  },
});
