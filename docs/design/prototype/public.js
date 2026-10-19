/* Public-site screens (Option D). Real content comes from DATA (your live site); anything invented is flagged in the notes. */
(function () {
  "use strict";
  var D = window.DATA, RT = [7, 6, 5, 6, 5, 4, 5, 6, 9, 5];
  var LINKS = [["Home", "home"], ["About", "about"], ["Skills", "skills"], ["Experience", "experience"], ["Projects", "projects"], ["Blogs", "blogs"]];

  function nav(on) {
    return '<header class="pnav"><span class="logo" data-go="home" style="cursor:pointer">SN</span><nav class="plinks">' +
      LINKS.map(function (l) { return '<span data-go="' + l[1] + '" class="' + (on === l[1] ? "on" : "") + '">' + l[0] + "</span>"; }).join("") +
      '</nav><div class="right"><span class="tbtn" data-act="theme" title="Switch light and dark" role="button" tabindex="0">' + ico("sun", 18) + '</span><button class="btn s p" type="button">' + ico("download", 15) + ' Résumé</button><span class="tbtn menu-btn">' + ico("menu", 18) + "</span></div></header>";
  }
  function foot() {
    return '<footer class="pfoot"><span>© 2026 Surya Satya Nikhil Gadhavajula</span><nav>' + LINKS.slice(1).map(function (l) { return '<a data-go="' + l[1] + '" style="cursor:pointer">' + l[0] + "</a>"; }).join("") + '</nav><span><a href="' + esc(D.about.github) + '" target="_blank" rel="noopener">GitHub</a> · <a href="' + esc(D.about.linkedin) + '" target="_blank" rel="noopener">LinkedIn</a></span></footer>';
  }
  function bcard(b, i) {
    return '<article class="bcard tilt" data-go="blog-post"><div class="th">' + (b.thumb ? '<img alt="" src="' + b.thumb + '">' : '<div class="ph v' + (i % 4) + '" style="width:100%;height:100%"></div>') + '</div><div class="bd"><div class="chips">' +
      b.tags.slice(0, 2).map(function (t) { return chip(t, "soft"); }).join("") + "</div><h3>" + esc(b.title) + "</h3><p>" + esc(b.excerpt) + '</p><div class="meta"><span>' + fmtDate(b.date) + '</span><i class="dot"></i><span>' + RT[i] + " min read</span></div></div></article>";
  }
  function tile(n, c) { var name = n === "PostgresSQL" ? "PostgreSQL" : n; return '<span class="tile" style="--lc:' + c + '"><i>' + esc(name.charAt(0)) + "</i>" + esc(name) + "</span>"; }
  function head(h2, display, lead, tag) { tag = tag || "h2"; return '<div class="pagehead"><' + tag + ' class="eyebrow">' + esc(h2) + "</" + tag + '><p class="display">' + display + '</p><p class="lead">' + esc(lead) + "</p></div>"; }
  var NEWS = '<div class="formcol"><div class="form"><input class="in" placeholder="you@company.com" aria-label="Email"><button class="btn" type="button">Subscribe</button></div><label class="chk"><i></i><span>Also let me see which pages I read before subscribing (optional)</span></label></div>';
  var proj = D.projects[0], exp = D.experience[0];
  var SUG = "Schedule emails once, and the app sends them on time. A Spring Boot scheduler runs the jobs, JavaMailSender delivers them, and a React dashboard lets you create, edit and cancel scheduled mails.";

  /* ---------- the article body shared by the site, the editor canvas and the preview ---------- */
  var JAVA = '@RestController\n@RequestMapping("/payments")\npublic class PaymentController {\n\n    private final IdempotencyStore store;\n\n    @PostMapping\n    public ResponseEntity<Payment> create(\n            @RequestHeader("Idempotency-Key") String key,\n            @RequestBody PaymentRequest request) {\n\n        // Same key again? Return what we already saved.\n        return store.find(key)\n                .map(ResponseEntity::ok)\n                .orElseGet(() -> {\n                    Payment payment = paymentService.charge(request);\n                    store.save(key, payment);\n                    return ResponseEntity.status(201).body(payment);\n                });\n    }\n}';
  window.JAVA_SAMPLE = JAVA;
  window.articleHTML = function (o) {
    o = o || {};
    return '<h2 id="what">What idempotent means</h2>' +
      "<p>In a distributed system, requests fail halfway all the time. A client times out, retries, and the server has no idea whether the first attempt worked. Idempotency is how you make that retry safe.</p>" +
      "<ul><li>The same request produces the same outcome, no matter how many times it arrives.</li><li><code>GET</code>, <code>PUT</code> and <code>DELETE</code> are safe by design. <code>POST</code> needs your help.</li><li>The key is an identifier the <strong>client</strong> generates, not the server.<ul><li>Use a UUID per user action, not per HTTP attempt.</li></ul></li></ul>" +
      '<div class="callout">' + ico("bulb", 20) + "<div><b>Tip</b>Treat the idempotency key like a primary key: unique, client-generated, and stored together with the response.</div></div>" +
      '<h2 id="spring">A minimal implementation in Spring Boot</h2><p>The controller below checks the store first. If the key exists it returns the saved response, otherwise it runs the charge once and records the result.</p>' +
      codeBlock({ file: "PaymentController.java", lang: "Java", code: JAVA, hl: [13, 14], extra: o.extra }) +
      "<p>Here is how a request moves through it:</p><ol><li>The client sends a <code>POST</code> with an <code>Idempotency-Key</code> header.</li><li>The server looks the key up in the store.</li><li>Found: return the stored response.</li><li>Not found: run the operation, store the result, return it.</li></ol>" +
      '<h3 id="wrong">Things that go wrong</h3><ul><li>Two requests with the same key arrive at the same moment, so lock on the key.</li><li>The key is reused with a different body. Return <code>409 Conflict</code>.</li><li>Keys never expire and the table grows forever.</li></ul>' +
      "<blockquote>A retry should never be a gamble.</blockquote>" +
      '<figure class="img"><div class="ph v2"></div><figcaption class="cap">Request flow with a retry (image block with caption)</figcaption></figure>';
  };

  /* ---------- screens ---------- */
  var S = [];
  S.push({
    id: "home", label: "Home", area: "public", title: "Home", sub: "First screen a recruiter sees",
    notes: [
      ["New", "3D layer stack in the hero: React, API gateway, Spring Boot, AI Integrations, Agents and Database. It slides apart on hover. The same layers repeat in the skills section below, so the 3D explains your stack."],
      ["New", "The \"Open to new roles\" pill is highlighted (green, pulsing). The admin has a switch to turn it on and off."],
      ["New", "Résumé is the loudest button. Name, role and stack are in the first screen. Phones get a smaller scene with no labels."],
      ["Keep", "Your existing sections stay, restyled with your own wording: What I Do, Interested in working together?, Stay in the Loop. The page's headings are unchanged, which protects your SEO."],
      ["New", "Measurement notice. Measurement is anonymous: no IP address, no cookies, no identifiers. Visitors can turn it off with one click."]
    ],
    html: function () {
      var layers = [["Client", "var(--c1)", ["React", "Javascript"]], ["Services", "var(--c2)", ["Java", "Spring Boot", "Microservices", "Rest API"]], ["AI Integrations", "var(--c5)", ["LLM APIs", "RAG", "Embeddings"]], ["Agents", "var(--c3)", ["Agentic AI", "Multi-agent systems"]], ["Database", "var(--c4)", D.skills.Database], ["Delivery", "var(--c1)", D.skills.DevOps]];
      var what = [["Scalable Backend Systems", "Building production-grade backends with Spring Boot and Node.js: microservices, REST APIs, message queues, and distributed systems designed to scale.", "layers", "var(--c1)"], ["Frontend & Full-Stack", "Crafting performant UIs with React JS, integrated end-to-end with robust backend APIs from design system to deployment.", "monitor", "var(--c2)"], ["CI/CD & DevOps", "Automating delivery pipelines with CI/CD and cloud deployments, keeping releases fast, reliable, and repeatable.", "sparkle", "var(--c3)"], ["Technical Writing", "Writing deep-dive articles on system design, architecture, performance, and engineering trade-offs.", "book", "var(--c5)"]];
      return nav("home") +
        '<section class="hero"><div class="copy"><span class="status"><i></i>Open to new roles</span><p class="name">Surya Satya Nikhil <em>Gadhavajula</em></p><div class="roleline"><h1>Software Developer</h1><span>Spring Boot · React · Microservices</span></div><p class="lead">I build backend systems that are designed to be reliable, scalable, and easy to evolve.</p>' +
        '<div class="chips">' + ["Spring Boot", "React", "Microservices", "CI/CD"].map(function (c) { return chip(c); }).join("") + '</div><div class="cta"><button class="btn p" type="button">' + ico("download", 16) + ' Download résumé</button><button class="btn" type="button" data-go="projects">View projects</button><button class="btn t" type="button" data-go="blogs">Read the blog ' + ico("chev", 14) + '</button></div></div><div class="hero3d" id="hero3d"></div></section>' +
        '<div class="consentwrap"><div class="consent"><span class="tagx">Measurement notice (fixed to the bottom of the screen on the real site)</span><p><b>I count visits anonymously.</b> Pages, time spent and city. No IP address, no cookies, no ads, nothing that identifies you.</p><div class="row"><button class="btn s p" type="button">Got it</button><button class="btn s" type="button">Turn off</button></div></div></div>' +
        '<section class="sec"><div class="wrapw"><div class="stats"><div><b>2+</b><span>Years building production systems</span></div><div><b>10</b><span>Articles on system design and AI</span></div><div><b>17</b><span>Technologies across 6 areas</span></div></div></div></section>' +
        '<section class="sec alt"><div class="wrapw"><div class="shead"><div><h2 class="eyebrow">What I Do</h2><p class="display">Crafting digital experiences with modern technologies</p></div></div><div class="grid4">' +
        what.map(function (w) { return '<div class="layer tilt" style="--lc:' + w[3] + '"><span class="ic">' + ico(w[2], 22) + '</span><h3>' + w[0] + '</h3><p class="muted" style="margin:0;font-size:14px;line-height:1.55">' + w[1] + "</p></div>"; }).join("") + '</div><div class="ctacard"><div><h3>Interested in working together?</h3><p>Check out my projects and feel free to reach out.</p></div><button class="btn p" type="button" data-go="about">Learn More About Me ' + ico("chev", 14) + "</button></div></div></section>" +
        '<section class="sec"><div class="wrapw"><div class="shead"><div><h2 class="eyebrow">Skills</h2><p class="display">Where I work in the stack</p></div><button class="btn" type="button" data-go="skills">All skills ' + ico("chev", 14) + '</button></div><div class="layers">' +
        layers.map(function (l) { return '<div class="layer tilt" style="--lc:' + l[1] + '"><small>Layer</small><div class="lt">' + l[0] + '</div><div class="tiles">' + l[2].map(function (n) { return tile(n, l[1]); }).join("") + "</div></div>"; }).join("") + "</div></div></section>" +
        '<section class="sec alt"><div class="wrapw"><div class="shead"><div><h2 class="eyebrow">Experience</h2><p class="display">Where I work now</p></div><button class="btn" type="button" data-go="experience">Full timeline ' + ico("chev", 14) + '</button></div><div class="tl"><div class="item"><span class="logo2">iQ</span><div class="card"><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><div class="rt">' + esc(exp.role) + '</div>' + chip(exp.start + " – " + exp.end, "soft") + '</div><div class="muted" style="font-weight:600">' + esc(exp.company) + " · " + esc(exp.location) + '</div><p class="lead" style="margin:4px 0 0">' + esc(exp.desc.split(". ").slice(0, 2).join(". ") + ".") + "</p></div></div></div></div></section>" +
        '<section class="sec"><div class="wrapw"><div class="shead"><div><h2 class="eyebrow">Writing</h2><p class="display">Latest articles</p></div><button class="btn" type="button" data-go="blogs">All articles ' + ico("chev", 14) + '</button></div><div class="grid3">' + D.blogs.slice(0, 3).map(bcard).join("") + "</div></div></section>" +
        '<section class="sec alt"><div class="wrapw"><div class="shead"><div><h2 class="eyebrow">Project</h2><p class="display">Featured project</p></div><button class="btn" type="button" data-go="projects">All projects ' + ico("chev", 14) + '</button></div>' +
        '<article class="bcard tilt feat" data-go="project-detail"><div class="th"><div class="ph v1" style="width:100%;height:100%"></div></div><div class="bd" style="padding:24px"><h3 style="font-size:26px;-webkit-line-clamp:2">' + esc(proj.title) + "</h3><p style=\"-webkit-line-clamp:3\">" + esc(SUG) + '</p><div class="chips">' + proj.tech.slice(0, 6).map(function (t) { return chip(t, "mono"); }).join("") + chip("+" + (proj.tech.length - 6), "mono") + "</div></div></article></div></section>" +
        '<section class="sec"><div class="wrapw"><div class="news"><div><h2>Stay in the Loop</h2><p>Get notified when I publish new articles on system design, software development, and more.</p></div>' + NEWS + '</div></div></section>' + foot();
    },
    mount: function (frame, ctx) { return mountStack(frame.querySelector("#hero3d"), { dark: ctx.theme === "dark" }).dispose; }
  });

  S.push({
    id: "about", label: "About", area: "public", title: "About", sub: "Who you are, in your own words",
    notes: [["New", "Photo, bio and three quick facts above the fold. \"Availability\" is highlighted and follows the admin switch for Open to new roles."], ["Keep", "Bio text is word for word from your admin About page. \"What Drives Me\" keeps all four of your cards and the \"Let's Build Something Together\" box, restyled."], ["Keep", "Headings are unchanged (About Me, your name, What Drives Me, and the four card titles), so your SEO is untouched."]],
    html: function () {
      var b = D.about.bio, drives = [["Clean Code", "I believe in writing code that's not just functional, but readable, maintainable, and elegant.", "sparkle", "var(--c1)"], ["Continuous Learning", "Technology evolves rapidly, and I'm passionate about staying current with the latest tools and best practices.", "book", "var(--c2)"], ["Problem Solving", "Breaking down complex challenges into simple, scalable solutions is what motivates me every day.", "bulb", "var(--c5)"], ["Open Source", "Contributing to the developer community and sharing knowledge through open-source projects and technical content.", "globe", "var(--c3)"]];
      return nav("about") + '<div class="pagehead"><h1 class="eyebrow">About Me</h1><p class="display">Backend engineer who likes <span style="color:var(--primary)">clean systems</span></p></div><section class="sec"><div class="wrapw"><div class="profile"><div><img class="avatar tilt" alt="Portrait of ' + esc(D.about.name) + '" src="' + D.about.photo + '"></div><div style="display:grid;gap:20px">' +
        '<div><h2 class="nm">' + esc(D.about.name) + '</h2><div class="muted" style="font-weight:600;margin-top:6px">' + esc(D.about.title) + '</div></div>' +
        '<div class="article" style="font-size:17px">' + b.map(function (p) { return "<p>" + esc(p.v) + "</p>"; }).join("") + "</div>" +
        '<div class="facts"><div><small>Specialization</small><b>' + esc(exp.role) + '</b></div><div><small>Experience</small><b>2+ Years</b></div><div class="open"><small>Availability</small><b><span class="status" style="padding:3px 10px 3px 9px;font-size:13px;box-shadow:none"><i></i>Open to Work</span></b></div></div>' +
        '<div class="cta" style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn p" type="button">' + ico("download", 16) + ' Download Resume</button><a class="btn" href="' + esc(D.about.github) + '" target="_blank" rel="noopener">GitHub ' + ico("ext", 14) + '</a><a class="btn" href="' + esc(D.about.linkedin) + '" target="_blank" rel="noopener">LinkedIn ' + ico("ext", 14) + "</a></div></div></div></div></section>" +
        '<section class="sec alt"><div class="wrapw"><div class="shead"><div><h2 class="eyebrow">What Drives Me</h2></div></div><div class="grid2">' + drives.map(function (d) { return '<div class="layer tilt" style="--lc:' + d[3] + '"><span class="ic">' + ico(d[2], 22) + '</span><h3>' + d[0] + '</h3><p class="muted" style="margin:0;line-height:1.6">' + d[1] + "</p></div>"; }).join("") + '</div><div class="ctacard"><div><h3>Let\'s Build Something Together</h3><p>Explore my projects or check out my latest blog posts.</p></div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn p" type="button" data-go="projects">View Projects</button><button class="btn" type="button" data-go="blogs">Read Blog</button></div></div></div></section>' + foot();
    }
  });

  S.push({
    id: "skills", label: "Skills", area: "public", title: "Skills", sub: "Grouped by what they do",
    notes: [["New", "Skills are grouped the way the home page 3D shows them. Tiles keep your uploaded icons (letter tiles stand in here)."], ["Keep", "Categories and items come from your admin Skills page, so you still manage them there."]],
    html: function () {
      var cols = ["var(--c1)", "var(--c5)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c1)"], i = 0;
      return nav("skills") + head("Skills & Technologies", "What I <span style=\"color:var(--primary)\">work with</span>", "Languages, frameworks, architecture, data and delivery tools I use on real projects.") + '<section class="sec"><div class="wrapw"><div class="sk-grid">' +
        Object.keys(D.skills).map(function (k) { var c = cols[i++ % cols.length]; return '<div class="layer tilt" style="--lc:' + c + '"><small>' + D.skills[k].length + ' items</small><h3>' + esc(k) + '</h3><div class="tiles">' + D.skills[k].map(function (n) { return tile(n, c); }).join("") + "</div></div>"; }).join("") + "</div></div></section>" + foot();
    }
  });

  S.push({
    id: "experience", label: "Experience", area: "public", title: "Experience", sub: "Timeline",
    notes: [["New", "Cleaner timeline with the company logo tile, dates as a chip and the role in the heading."], ["Ask", "You have one role listed. Adding a few lines of outcomes (for example latency or uptime numbers) would help recruiters most."]],
    html: function () {
      return nav("experience") + head("Experience", "Where I've <span style=\"color:var(--primary)\">worked</span>", "Roles, teams and what I was responsible for.") + '<section class="sec"><div class="wrapw"><div class="tl"><div class="item"><span class="logo2">iQ</span><div class="card"><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><h3>' + esc(exp.role) + "</h3>" + chip(exp.start + " – " + exp.end, "soft") + '</div><div class="muted" style="font-weight:600">' + esc(exp.company) + " · " + esc(exp.location) + '</div><div class="article" style="font-size:16px"><p>' + esc(exp.desc) + "</p></div></div></div></div></div></section>" + foot();
    }
  });

  S.push({
    id: "projects", label: "Projects", area: "public", title: "Projects", sub: "Grid with tilt cards",
    notes: [["New", "Cards tilt toward the cursor. A dashed card invites the next project, so one project does not look empty."], ["Ask", "Only one project is published today. Recruiters judge you on this page, so two or three more (even small ones) will help a lot."], ["Fix", "The card description is suggested copy. Your project has no description in the admin yet."]],
    html: function () {
      return nav("projects") + head("Projects", "Things I've <span style=\"color:var(--primary)\">built</span>", "Selected work, with the stack and the code.") + '<section class="sec"><div class="wrapw"><div class="grid3">' +
        '<article class="bcard tilt" data-go="project-detail"><div class="th"><div class="ph v1" style="width:100%;height:100%"></div></div><div class="bd"><h3>' + esc(proj.title) + "</h3><p>" + esc(SUG) + '</p><div class="chips">' + proj.tech.slice(0, 4).map(function (t) { return chip(t, "mono"); }).join("") + chip("+" + (proj.tech.length - 4), "mono") + '</div><div class="meta"><span>' + ico("code", 14) + ' Source on GitHub</span></div></div></article>' +
        '<div class="bcard" style="border-style:dashed;box-shadow:none;cursor:default;align-items:center;justify-content:center;min-height:300px;text-align:center;padding:24px;gap:8px;color:var(--muted)"><span style="width:44px;height:44px;border-radius:12px;border:2px dashed var(--bd);display:grid;place-items:center">' + ico("plus", 20) + '</span><b style="color:var(--fg)">Next project</b><span style="font-size:14px">Add it in the admin and it appears here.</span></div></div></div></section>' + foot();
    }
  });

  S.push({
    id: "project-detail", label: "Project detail", area: "public", title: "Project detail", sub: "One project in depth",
    notes: [["New", "Overview, highlights and full stack on one page, with a clear GitHub button."], ["Fix", "Overview and highlights are suggested copy. In the admin this page's description is empty today and would show a blank page to a recruiter."]],
    html: function () {
      return nav("projects") + '<div class="post-head"><button class="btn t s" type="button" data-go="projects">' + ico("back", 15) + ' Projects</button><h1>' + esc(proj.title) + '</h1><div class="chips">' + proj.tech.map(function (t) { return chip(t, "mono"); }).join("") + '</div><div class="cta" style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap"><a class="btn p" href="' + esc(proj.github) + '" target="_blank" rel="noopener">' + ico("code", 16) + ' View source</a></div></div>' +
        '<div class="cover"><div><div class="ph v1" style="width:100%;height:100%"></div></div></div><section class="sec"><div style="max-width:720px;margin-inline:auto"><span class="sample" style="margin-bottom:14px">Suggested copy</span><div class="article"><h2>Overview</h2><p>' + esc(SUG) + "</p><h2>Highlights</h2><ul><li>Cron-style scheduling with Spring's scheduler, so mails go out on time.</li><li>Persistence with Spring Data JPA, Hibernate and MySQL.</li><li>React dashboard to create, edit and cancel scheduled emails.</li></ul></div></div></section>" + foot();
    }
  });

  var tagCount = {}, tagName = {};
  D.blogs.forEach(function (b) { b.tags.forEach(function (t) { var k = t.toLowerCase().replace(/[^a-z0-9]/g, ""); tagCount[k] = (tagCount[k] || 0) + 1; if (!tagName[k] || t.indexOf(" ") > -1) tagName[k] = t; }); });
  var topTags = Object.keys(tagCount).sort(function (a, b) { return tagCount[b] - tagCount[a]; }).slice(0, 7).map(function (k) { return tagName[k]; });
  S.push({
    id: "blogs", label: "Blogs", area: "public", title: "Blogs", sub: "List with search and tags",
    notes: [["New", "Search plus a short tag row. Cards show a real reading time, not the same \"1 min read\" on every post."], ["Fix", "No view counts anywhere on the public site, as you asked. Counts live only in the admin."], ["Ask", "Each post carries about 12 tags (96 different tags across 10 posts), and spellings differ (\"System Design\" and \"SystemDesign\"), which makes filtering useless. I merged the duplicates here. I suggest 3 to 5 per post; the editor will nudge you and suggest existing tags."]],
    html: function () {
      return nav("blogs") + head("Blog", "Notes on <span style=\"color:var(--primary)\">systems & AI</span>", "Deep dives on system design, microservices and what is changing in AI.") +
        '<section class="sec" style="padding-top:20px"><div class="wrapw"><div class="filters" style="margin:0 0 28px"><span class="search">' + ico("search", 16) + ' Search articles</span>' + chip("All", "soft") + topTags.map(function (t) { return chip(t); }).join("") + '</div><div class="grid3">' + D.blogs.map(bcard).join("") + "</div></div></section>" + foot();
    }
  });

  S.push({
    id: "blog-post", label: "Blog post", area: "public", title: "Blog post", sub: "Reading experience",
    notes: [["Fix", "Bullets and numbers now show. Tailwind hides list markers by default and the old stylesheet never switched them back on. The editor now uses this exact stylesheet."], ["Fix", "Code blocks get colour, a file name, line numbers, a highlighted line, a language label and a Copy button. Shiki and lowlight were installed in your project but never used."], ["New", "Table of contents, callout, quote and image-with-caption blocks. No view count in the header."], ["Keep", "Newsletter box and comments stay, restyled."]],
    html: function () {
      var b = D.blogs[7];
      return nav("blogs") + '<div class="post-head"><button class="btn t s" type="button" data-go="blogs">' + ico("back", 15) + ' All articles</button><div class="chips" style="margin-top:10px">' + b.tags.slice(0, 3).map(function (t) { return chip(t, "soft"); }).join("") + '</div><h1>' + esc(b.title) + '</h1><div class="byline"><img alt="" src="' + D.about.photo + '"><b style="color:var(--fg)">' + esc(D.about.name) + '</b><i class="dot"></i><span>' + fmtDate(b.date) + '</span><i class="dot"></i><span>' + RT[7] + ' min read</span></div></div><div class="cover"><div><div class="ph v2" style="width:100%;height:100%"></div></div></div>' +
        '<div class="postgrid"><article class="article" id="art">' + articleHTML() + '<div class="news" style="margin-top:44px;box-shadow:none"><div><h2 style="font-size:24px">Enjoyed this article?</h2><p>Get the next one by email.</p></div>' + NEWS + '</div>' +
        '<h3 style="margin-top:44px">Comments (2)</h3><div class="comment"><span class="av">R</span><div><b style="color:var(--fg)">Rohit M.</b> <span class="muted" style="font-size:12.5px">2 days ago</span><p>Great breakdown of the retry problem. The lock-on-key point is the part most tutorials skip.</p></div></div><div class="comment"><span class="av">P</span><div><b style="color:var(--fg)">Priya S.</b> <span class="muted" style="font-size:12.5px">5 days ago</span><p>How long do you keep keys before expiring them?</p></div></div></article>' +
        '<aside class="toc"><b>On this page</b><a class="on" href="#what" onclick="return false">What idempotent means</a><a href="#spring" onclick="return false">Spring Boot implementation</a><a href="#wrong" onclick="return false">Things that go wrong</a></aside></div>' + foot();
    }
  });

  window.PUBLIC_SCREENS = S;
})();
