import { createElement, type ReactNode } from "react";
import { highlightToLines, languageLabel, parseHighlight, type HNode } from "@/lib/highlight";
import Icon from "@/components/ui/Icon";
import CopyButton from "./CopyButton";

function toReact(nodes: HNode[]): ReactNode[] {
  return nodes.map((n, i) => {
    if (n.type === "text") return n.value;
    const cls = Array.isArray(n.properties?.className) ? n.properties.className.join(" ") : n.properties?.className;
    return createElement(n.tagName, { key: i, className: cls }, ...toReact(n.children));
  });
}

interface Props {
  code: string;
  language?: string | null;
  filename?: string | null;
  highlight?: string | null;
}

export default function CodeBlock({ code, language, filename, highlight }: Props) {
  const lines = highlightToLines(code, language);
  const hl = parseHighlight(highlight);
  return (
    <figure className="cb">
      <div className="top">
        <span className="dots"><i /><i /><i /></span>
        <span className="fn">{filename || ""}</span>
        <span className="lang">{languageLabel(language)} <Icon name="chevd" size={12} /></span>
        <CopyButton text={code} />
      </div>
      <pre>
        <code>
          {lines.map((line, i) => (
            <span key={i} className={"ln" + (hl.has(i + 1) ? " hl" : "")} data-n={i + 1}>
              {line.length ? toReact(line) : " "}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
