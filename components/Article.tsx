import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import CodeBlock from "@/components/code/CodeBlock";
import { extractHeadings } from "@/lib/headings";

export interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

function renderMarks(text: string, marks?: TipTapNode["marks"]): ReactNode {
  let el: ReactNode = text;
  for (const mark of marks ?? []) {
    switch (mark.type) {
      case "bold": el = <strong>{el}</strong>; break;
      case "italic": el = <em>{el}</em>; break;
      case "code": el = <code>{el}</code>; break;
      case "underline": el = <u>{el}</u>; break;
      case "strike": el = <s>{el}</s>; break;
      case "link": {
        const href = String(mark.attrs?.href ?? "");
        el = /^(https?:|mailto:|\/)/i.test(href) ? <a href={href} target="_blank" rel="noopener noreferrer">{el}</a> : <>{el}</>;
        break;
      }
    }
  }
  return el;
}

const textOf = (node: TipTapNode): string => (node.content ?? []).map((c) => (c.type === "text" ? c.text ?? "" : c.type === "hardBreak" ? "\n" : textOf(c))).join("");

function renderNode(node: TipTapNode, key: number, ids: string[], cursor: { i: number }): ReactNode {
  const kids = node.content?.map((c, i) => renderNode(c, i, ids, cursor));
  switch (node.type) {
    case "doc": return <Fragment key={key}>{kids}</Fragment>;
    case "paragraph": return <p key={key}>{kids}</p>;
    case "heading": {
      const level = Math.min(4, Math.max(1, Number(node.attrs?.level) || 2));
      const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
      const id = level === 2 || level === 3 ? ids[cursor.i++] : undefined; // same order as extractHeadings
      return <Tag key={key} id={id}>{kids}</Tag>;
    }
    case "text": return <Fragment key={key}>{renderMarks(node.text ?? "", node.marks)}</Fragment>;
    case "bulletList": return <ul key={key}>{kids}</ul>;
    case "orderedList": return <ol key={key}>{kids}</ol>;
    case "listItem": return <li key={key}>{kids}</li>;
    case "blockquote": return <blockquote key={key}>{kids}</blockquote>;
    case "codeBlock":
      return (
        <CodeBlock
          key={key}
          code={textOf(node)}
          language={(node.attrs?.language as string | null) ?? null}
          filename={(node.attrs?.filename as string | null) ?? null}
          highlight={(node.attrs?.highlight as string | null) ?? null}
        />
      );
    case "callout":
      return (
        <div key={key} className="callout">
          <Icon name="bulb" size={20} />
          <div>{kids}</div>
        </div>
      );
    case "image": {
      const src = String(node.attrs?.src ?? "");
      if (!src) return null;
      const caption = (node.attrs?.title as string | null) || "";
      return (
        <figure key={key} className="img">
          <Image
            src={src}
            alt={String(node.attrs?.alt ?? "")}
            width={Number(node.attrs?.width) || 1200}
            height={Number(node.attrs?.height) || 675}
            sizes="(max-width: 760px) 100vw, 720px"
            style={{ width: "100%", height: "auto" }}
          />
          {caption && <figcaption className="cap">{caption}</figcaption>}
        </figure>
      );
    }
    case "table": return <div key={key} className="tblscroll"><table><tbody>{kids}</tbody></table></div>;
    case "tableRow": return <tr key={key}>{kids}</tr>;
    case "tableHeader": return <th key={key}>{kids}</th>;
    case "tableCell": return <td key={key}>{kids}</td>;
    case "horizontalRule": return <hr key={key} />;
    case "hardBreak": return <br key={key} />;
    default: return kids ? <Fragment key={key}>{kids}</Fragment> : null;
  }
}

/** The one renderer for rich text: public pages, the editor preview and admin previews all use it. */
export default function Article({ content, className }: { content: TipTapNode | null | undefined; className?: string }) {
  if (!content) return null;
  const ids = extractHeadings(content).map((h) => h.id);
  return <div className={"article" + (className ? " " + className : "")}>{renderNode(content, 0, ids, { i: 0 })}</div>;
}
