"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";

export interface SlashItem {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  hint?: string;
  keywords: string[];
}

export interface SlashListHandle { onKeyDown: (e: { event: KeyboardEvent }) => boolean }
interface Props { items: SlashItem[]; query: string; command: (item: SlashItem) => void }

const SlashList = forwardRef<SlashListHandle, Props>(function SlashList({ items, query, command }, ref) {
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (!items.length) return false;
      if (event.key === "ArrowDown") { setIndex((i) => (i + 1) % items.length); return true; }
      if (event.key === "ArrowUp") { setIndex((i) => (i - 1 + items.length) % items.length); return true; }
      if (event.key === "Enter" || event.key === "Tab") { const it = items[index]; if (it) command(it); return true; }
      return false;
    },
  }));

  return (
    <div className="slash" role="listbox" aria-label="Insert block">
      <small>{query ? `Blocks matching “${query}”` : "Insert a block"}</small>
      {items.length === 0 && <div className="o"><span /><div><b>No matching block</b></div></div>}
      {items.map((it, i) => (
        <button key={it.id} type="button" role="option" aria-selected={i === index} className={"o" + (i === index ? " on" : "")} onMouseEnter={() => setIndex(i)} onMouseDown={(e) => { e.preventDefault(); command(it); }}>
          <span className="ic"><Icon name={it.icon} size={17} /></span>
          <div><b>{it.title}</b><span>{it.description}</span></div>
          <kbd>{it.hint ?? ""}</kbd>
        </button>
      ))}
    </div>
  );
});

export default SlashList;
