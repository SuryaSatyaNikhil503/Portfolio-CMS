"use client";

import { ReactNode } from "react";
import Image from "next/image";

export interface TipTapNode {
  type: string;
  content?: TipTapNode[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

function renderMarks(
  text: string,
  marks?: { type: string; attrs?: Record<string, unknown> }[]
): ReactNode {
  if (!marks || marks.length === 0) return text;

  let element: ReactNode = text;
  marks.forEach((mark) => {
    switch (mark.type) {
      case "bold":
        element = <strong>{element}</strong>;
        break;
      case "italic":
        element = <em>{element}</em>;
        break;
      case "code":
        element = <code>{element}</code>;
        break;
      case "link":
        element = (
          <a
            href={mark.attrs?.href as string}
            target="_blank"
            rel="noopener noreferrer"
          >
            {element}
          </a>
        );
        break;
      case "underline":
        element = <u>{element}</u>;
        break;
      case "strike":
        element = <s>{element}</s>;
        break;
    }
  });
  return element;
}

function renderNode(node: TipTapNode, index: number): ReactNode {
  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case "doc":
      return <div key={index}>{children}</div>;
    case "paragraph":
      return <p key={index}>{children}</p>;
    case "heading": {
      const level = (node.attrs?.level as number) || 1;
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      return <Tag key={index}>{children}</Tag>;
    }
    case "text":
      return (
        <span key={index}>{renderMarks(node.text || "", node.marks)}</span>
      );
    case "bulletList":
      return <ul key={index}>{children}</ul>;
    case "orderedList":
      return <ol key={index}>{children}</ol>;
    case "listItem":
      return <li key={index}>{children}</li>;
    case "blockquote":
      return <blockquote key={index}>{children}</blockquote>;
    case "codeBlock":
      return (
        <pre key={index}>
          <code className={`language-${node.attrs?.language || "text"}`}>
            {node.content?.map((c) => c.text).join("")}
          </code>
        </pre>
      );
    case "image":
      return (
        <Image
          key={index}
          src={node.attrs?.src as string}
          alt={(node.attrs?.alt as string) || ""}
          title={(node.attrs?.title as string) || undefined}
          width={(node.attrs?.width as number) || 800}
          height={(node.attrs?.height as number) || 600}
          className="max-w-full h-auto"
        />
      );
    case "horizontalRule":
      return <hr key={index} className="my-6 border-border" />;
    case "hardBreak":
      return <br key={index} />;
    default:
      return children ? <div key={index}>{children}</div> : null;
  }
}

interface TipTapRendererProps {
  content: TipTapNode | null | undefined;
}

export default function TipTapRenderer({ content }: TipTapRendererProps) {
  if (!content) {
    return null;
  }

  return <div className="prose-blog">{renderNode(content, 0)}</div>;
}
