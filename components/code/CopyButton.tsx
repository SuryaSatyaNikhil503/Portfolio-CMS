"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const done = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button
      type="button"
      className="copy"
      aria-label="Copy code"
      onClick={() => {
        try {
          navigator.clipboard.writeText(text).then(done, done);
        } catch {
          done();
        }
      }}
    >
      <Icon name={copied ? "check" : "copy"} size={14} /> <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
