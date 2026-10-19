// Pulls real public content from the live site and writes screens/data.js (text + a few downsized images as data URIs).
const fs = require("fs"), path = require("path"), cp = require("child_process");
const BASE = "https://suryasatyanikhil.vercel.app";
const OUT = process.argv[2], IMG = process.argv[3];
const get = async (p) => (await fetch(BASE + p)).json();

function blocks(node, out = []) {
  if (!node) return out;
  const text = (n) => (n.content || []).map((c) => c.type === "text" ? c.text : c.type === "hardBreak" ? " " : text(c)).join("");
  (node.content || []).forEach((n) => {
    if (n.type === "paragraph") { const t = text(n).trim(); if (t) out.push({ t: "p", v: t }); }
    else if (n.type === "heading") out.push({ t: "h", v: text(n).trim() });
    else if (n.type === "bulletList" || n.type === "orderedList") (n.content || []).forEach((li) => out.push({ t: "li", v: text(li).trim() }));
  });
  return out;
}
async function thumb(url, name, px, q) {
  if (!url) return "";
  const raw = path.join(IMG, name + ".src"), small = path.join(IMG, name + ".jpg");
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  fs.writeFileSync(raw, buf);
  cp.spawnSync("sips", ["-Z", String(px), "--setProperty", "format", "jpeg", "--setProperty", "formatOptions", String(q), raw, "--out", small]);
  const out = "data:image/jpeg;base64," + fs.readFileSync(small).toString("base64");
  return out;
}
(async () => {
  const [about, skills, projects, exp, blogs] = await Promise.all(["/api/about", "/api/skills", "/api/projects", "/api/experience", "/api/blogs"].map(get));
  const a = about.about;
  const sk = {}; skills.skills.forEach((s) => (sk[s.category] = sk[s.category] || []).push(s.name));
  const data = {
    about: { name: a.name, title: a.title, bio: blocks(a.bio), github: a.githubUrl, linkedin: a.linkedinUrl, photo: await thumb(a.profileImage, "photo", 360, 70) },
    skills: sk,
    projects: projects.projects.map((p) => ({ title: p.title, slug: p.slug, tech: p.techStack, github: p.githubLink, desc: [] })),
    experience: exp.experiences.map((e) => ({ company: e.company, role: e.role, location: e.location, start: e.startDate, end: e.endDate, desc: e.description })),
    blogs: [],
  };
  for (let i = 0; i < blogs.blogs.length; i++) {
    const b = blogs.blogs[i];
    data.blogs.push({ title: b.title, slug: b.slug, excerpt: b.excerpt, tags: b.tags, date: b.createdAt.slice(0, 10), thumb: i < 4 ? await thumb(b.thumbnail, "blog" + i, 560, 55) : "" });
  }
  try { const pj = await get("/api/projects/" + data.projects[0].slug); const p = pj.project || pj; data.projects[0].desc = blocks(p.description); } catch (e) {}
  fs.writeFileSync(OUT, "window.DATA = " + JSON.stringify(data) + ";\n");
  console.log("data.js bytes:", fs.statSync(OUT).size, "| bio blocks:", data.about.bio.length, "| project desc blocks:", data.projects[0].desc.length, "| blogs:", data.blogs.length);
})();
