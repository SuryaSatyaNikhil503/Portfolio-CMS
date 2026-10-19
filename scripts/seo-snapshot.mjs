#!/usr/bin/env node
// SEO guard for the revamp.
//   node scripts/seo-snapshot.mjs snap <baseUrl> <out.json>   crawl public pages and record everything search engines read
//   node scripts/seo-snapshot.mjs diff <a.json> <b.json>      compare two snapshots (exit 1 on any difference)
import fs from "node:fs";

const [, , cmd, a, b] = process.argv;
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const strip = (s) => decode(s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name}=("([^"]*)"|'([^']*)')`, "i")); return m ? decode(m[2] ?? m[3]) : null; };

function extract(html, status) {
  const head = (html.match(/<head[\s\S]*?<\/head>/i) || [""])[0];
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const og = {}, tw = {}; let description = null, robots = null;
  for (const m of metas) {
    const name = attr(m, "name"), prop = attr(m, "property"), content = attr(m, "content");
    if (name === "description") description = content;
    if (name === "robots") robots = content;
    if (prop && prop.startsWith("og:")) (og[prop] = og[prop] || []).push(content);
    if (name && name.startsWith("twitter:")) tw[name] = content;
  }
  const canonical = (head.match(/<link\b[^>]*rel=("canonical"|'canonical')[^>]*>/i) || [null])[0];
  const jsonld = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => { try { return JSON.stringify(JSON.parse(m[1])); } catch { return m[1]; } });
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const hrefs = [...new Set([...html.matchAll(/<a\b[^>]*href="([^"#][^"]*)"/gi)].map((m) => m[1]).filter((h) => h.startsWith("/") || h.includes("suryasatyanikhil")))].sort();
  return {
    status,
    title: strip((head.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || ["", ""])[1]),
    description, robots,
    canonical: canonical ? attr(canonical, "href") : null,
    lang: (html.match(/<html[^>]*\slang="([^"]*)"/i) || [null, null])[1],
    og, twitter: tw, jsonld,
    h1: [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => strip(m[1])),
    headings: [...html.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => [Number(m[1]), strip(m[2])]),
    imagesWithoutAlt: imgs.filter((i) => attr(i, "alt") === null).length,
    internalLinks: hrefs,
  };
}

async function get(base, path) {
  const res = await fetch(base + path, { redirect: "manual", headers: { "user-agent": "Mozilla/5.0 (compatible; seo-snapshot)" } });
  const body = await res.text();
  if (path.endsWith(".xml") || path.endsWith(".txt") || path.endsWith(".html") && res.headers.get("content-type")?.includes("text/html") && body.length < 500) return { status: res.status, raw: body.replace(/<lastmod>[^<]*<\/lastmod>/g, "<lastmod/>") };
  return extract(body, res.status);
}

if (cmd === "snap") {
  const base = a.replace(/\/$/, "");
  const sm = await (await fetch(base + "/sitemap.xml")).text();
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  // The sitemap can be stale, so also follow every /blogs/* and /projects/* link found on the listing pages.
  const fromListing = async (list) => [...(await (await fetch(base + list)).text()).matchAll(/href="(\/(?:blogs|projects)\/[^"#?]+)"/g)].map((m) => m[1]);
  const listed = [...(await fromListing("/blogs")), ...(await fromListing("/projects"))];
  const paths = [...new Set(["/", "/about", "/skills", "/experience", "/projects", "/blogs", ...urls, ...listed, "/robots.txt", "/sitemap.xml"])];
  const out = {};
  for (const p of paths) { out[p] = await get(base, p); process.stdout.write(`${out[p].status} ${p}\n`); }
  fs.writeFileSync(b, JSON.stringify(out, null, 1));
  console.log(`saved ${paths.length} pages -> ${b}`);
} else if (cmd === "diff") {
  // Strict: head metadata, JSON-LD, status, robots/sitemap text, h1 text, alt text. Additive: headings and internal links may only be ADDED.
  const A = JSON.parse(fs.readFileSync(a, "utf8")), B = JSON.parse(fs.readFileSync(b, "utf8")); let n = 0;
  const bad = (path, x, y) => { n++; console.log(`DIFF ${path}\n   before: ${JSON.stringify(x)?.slice(0, 240)}\n   after : ${JSON.stringify(y)?.slice(0, 240)}`); };
  const subseq = (small, big) => { let i = 0; for (const x of big) if (i < small.length && JSON.stringify(x) === JSON.stringify(small[i])) i++; return i === small.length; };
  const locs = (raw) => new Set([...(raw || "").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  for (const p of Object.keys(A)) {
    const x = A[p], y = B[p];
    if (!y) { bad(p + " (page missing after)", true, false); continue; }
    if (p === "/sitemap.xml") { const miss = [...locs(x.raw)].filter((u) => !locs(y.raw).has(u)); if (miss.length) bad(p + " (URLs dropped)", miss, []); continue; }
    for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
      if (k === "headings") { if (!subseq(x[k] || [], y[k] || [])) bad(`${p}.headings (a baseline heading was removed, changed or reordered)`, x[k], y[k]); }
      else if (k === "internalLinks") { const miss = (x[k] || []).filter((h) => !(y[k] || []).includes(h)); if (miss.length) bad(`${p}.internalLinks (links removed)`, miss, []); }
      else if (JSON.stringify(x[k]) !== JSON.stringify(y[k])) bad(`${p}.${k}`, x[k], y[k]);
    }
  }
  const extra = Object.keys(B).filter((p) => !A[p]);
  if (extra.length) console.log(`(info) ${extra.length} extra page(s) only in the new snapshot, not compared: ${extra.join(", ").slice(0, 200)}`);
  console.log(n ? `\n${n} SEO difference(s)` : "SEO check passed: metadata, JSON-LD, status codes, robots, sitemap, h1 and alt text are identical; every baseline heading and link is still present.");
  process.exit(n ? 1 : 0);
} else { console.log("usage: snap <baseUrl> <out.json> | diff <a.json> <b.json>"); }
