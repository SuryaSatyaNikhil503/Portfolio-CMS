/* Admin screens. All analytics numbers, visitors and subscribers here are SAMPLE data (clearly labelled), because tracking is not built yet.
   Blog titles, skills, project and experience are your real content. */
(function () {
  "use strict";
  var D = window.DATA, rnd = rng(7), SAMPLE = '<span class="sample">Sample data</span>';

  /* ---------- shell ---------- */
  function side(on) {
    function it(id, ic, label, n) { return '<div class="it ' + (on === id ? "on" : "") + '" data-go="' + id + '">' + ico(ic, 18) + " " + label + (n ? '<span class="n">' + n + "</span>" : "") + "</div>"; }
    return '<aside class="side"><div class="sb"><i>SN</i>Portfolio admin</div><h4>Overview</h4>' + it("admin-dashboard", "home", "Dashboard") + it("admin-analytics", "chart", "Visitors") +
      "<h4>Content</h4>" + it("admin-blogs", "book", "Blogs", "10") + it("admin-projects", "folder", "Projects", "1") + it("admin-skills", "bulb", "Skills", "17") + it("admin-experience", "brief", "Experience") + it("admin-about", "user", "About") +
      "<h4>Community</h4>" + it("admin-comments", "msg", "Comments") + it("admin-subscribers", "mail", "Subscribers") + '<div class="me"><span class="av">N</span><div><b style="color:#fff">Nikhil</b><br><span style="font-size:12px">Admin</span></div></div></aside>';
  }
  function adm(on, inner) { return '<div class="adm">' + side(on) + '<main class="amain">' + inner + "</main></div>"; }
  function ahead(title, sub, actions) { return '<div class="ahead"><div><h2>' + title + "</h2>" + (sub ? "<p>" + sub + "</p>" : "") + "</div>" + (actions ? '<div class="toolbar">' + actions + "</div>" : "") + "</div>"; }
  var btn = function (t, c, ic, go) { return '<button class="btn ' + (c || "") + '" type="button"' + (go ? ' data-go="' + go + '"' : "") + ">" + (ic ? ico(ic, 16) + " " : "") + t + "</button>"; };

  /* ---------- sample data ---------- */
  var visits = []; for (var i = 0; i < 30; i++) { var wd = (i + 3) % 7; visits.push(Math.round(14 + i * 0.85 + (wd === 5 || wd === 6 ? -5 : 3) + rnd() * 9)); }
  (function () { var s = visits.reduce(function (a, b) { return a + b; }, 0), f = 732 / s; visits = visits.map(function (v) { return Math.max(3, Math.round(v * f)); }); var d = 732 - visits.reduce(function (a, b) { return a + b; }, 0); visits[visits.length - 1] += d; })();
  var visitsTotal = visits.reduce(function (a, b) { return a + b; }, 0);
  var SRC = [["LinkedIn", 212, 192, 3.1, 28, "var(--c1)"], ["Google", 178, 164, 1.9, 41, "var(--c2)"], ["Direct", 146, 84, 2.2, 47, "var(--c3)"], ["GitHub", 96, 118, 2.6, 35, "var(--c4)"], ["Twitter/X", 48, 71, 1.3, 62, "var(--c5)"], ["Reddit", 27, 96, 1.4, 55, "var(--muted)"], ["Other", 25, 60, 1.2, 60, "var(--muted)"]];
  var SC = {}; SRC.forEach(function (s) { SC[s[0]] = s[5]; });
  var BV = [128, 96, 214, 301, 176, 88, 142, 842, 1203, 660];
  var blog = D.blogs[7];
  var SESS = [
    { id: "A7F3", when: "2 min ago", src: "LinkedIn", ref: "linkedin.com/feed", dev: "iPhone · Safari", di: "phone", loc: "Hyderabad, IN", ip: "103.211.x.x", pages: [["Home", 18, 100], ["About", 34, 80], ["Experience", 41, 100], ["Projects", 27, 60]], ev: [[3, "Downloaded résumé"]] },
    { id: "C21B", when: "9 min ago", src: "Google", ref: "google.com · \"idempotency in microservices\"", dev: "Windows · Chrome", di: "monitor", loc: "Bengaluru, IN", ip: "49.37.x.x", pages: [["Blog: Idempotency in Microservices", 252, 92], ["Blogs", 22, 100]], ev: [] },
    { id: "F90D", when: "26 min ago", src: "Direct", ref: "(no referrer)", dev: "Mac · Chrome", di: "monitor", loc: "Pune, IN", ip: "117.200.x.x", pages: [["Home", 12, 100], ["Blogs", 40, 100], ["Blog: How Facebook Scaled Memcache", 171, 71], ["Blog: How Netflix Cut Recommendation Latency", 98, 54]], ev: [] },
    { id: "3E8A", when: "1 h ago", src: "GitHub", ref: "github.com/SuryaSatyaNikhil503/Email-Scheduler", dev: "Linux · Firefox", di: "monitor", loc: "Singapore, SG", ip: "175.156.x.x", pages: [["Projects", 21, 80], ["Project: Email Scheduler Application", 72, 90]], ev: [] },
    { id: "9B44", when: "2 h ago", src: "Google", ref: "google.com · \"is rag always needed\"", dev: "Mac · Safari", di: "monitor", loc: "London, GB", ip: "81.2.x.x", pages: [["Blog: RAG is everywhere", 348, 96]], ev: [] },
    { id: "D017", when: "3 h ago", src: "Twitter/X", ref: "t.co/…", dev: "iPhone · Safari", di: "phone", loc: "Austin, US", ip: "73.45.x.x", pages: [["Blog: Claude Mythos", 65, 38]], ev: [] },
    { id: "B3C9", when: "5 h ago", src: "LinkedIn", ref: "linkedin.com/in/gssnikhil", dev: "Android · Chrome", di: "phone", loc: "Mumbai, IN", ip: "106.51.x.x", pages: [["Home", 25, 100], ["About", 52, 100], ["Skills", 31, 90], ["Experience", 64, 100], ["Projects", 36, 70], ["Blogs", 18, 100]], ev: [[5, "Subscribed to newsletter"]], who: { name: "Meera K.", email: "meera.k@example.com", note: "Talent partner (sample)" } },
    { id: "61AF", when: "Yesterday", src: "Direct", ref: "(no referrer)", dev: "Windows · Edge", di: "monitor", loc: "Hyderabad, IN", ip: "103.211.x.x", pages: [["Home", 9, 60], ["About", 20, 80]], ev: [] }
  ];
  SESS.forEach(function (s) { s.total = s.pages.reduce(function (a, p) { return a + p[1]; }, 0); });
  var srcPill = function (s) { return '<span style="display:inline-flex;align-items:center;gap:7px;font-weight:600"><i style="width:9px;height:9px;border-radius:3px;background:' + SC[s] + '"></i>' + s + "</span>"; };
  function sessRow(s) {
    return '<tr class="row" data-go="admin-journey"><td><b>#' + s.id + '</b><div class="muted" style="font-size:12px">' + s.when + "</div></td><td>" + srcPill(s.src) + "</td><td>" + esc(s.pages[0][0]) + '</td><td class="num">' + s.pages.length + '</td><td class="num">' + fmtDur(s.total) + "</td><td>" + ico(s.di, 15) + " " + s.dev + "</td><td>" + s.loc + "</td><td>" + (s.who ? '<span class="pill good">Identified</span>' : s.ev.length ? '<span class="pill info">Résumé</span>' : '<span class="pill nodot">Anonymous</span>') + "</td></tr>";
  }
  var sessTable = function (rows) { return '<div class="tblwrap"><table class="tbl"><thead><tr><th>Visit</th><th>Source</th><th>Entry page</th><th class="num">Pages</th><th class="num">Time</th><th>Device</th><th>Location</th><th>Who</th></tr></thead><tbody>' + rows.map(sessRow).join("") + "</tbody></table></div>"; };
  var privacy = '<div class="privacy">' + ico("shield", 20) + '<div><b>Privacy:</b> no IP address is ever stored. No cookies and nothing that identifies a visitor. City comes from the network at request time. Visits are deleted after 90 days.</div><button class="btn s" type="button">Privacy notice</button></div>';

  var A = [];

  /* ---------- login ---------- */
  A.push({
    id: "admin-login", label: "Login", area: "admin", title: "Admin login", sub: "Sign in",
    notes: [["New", "Calmer split screen with the same 3D stack, so the admin feels part of the same product."], ["Keep", "Same JWT login and cookie behaviour. Only the look changes."]],
    html: function () {
      return '<div class="logincard"><div class="loginl"><div style="display:flex;gap:10px;align-items:center;font:800 16px var(--f-display)"><span style="width:30px;height:30px;border-radius:8px;background:var(--primary);display:grid;place-items:center;font-size:13px">SN</span>Portfolio admin</div><div class="hero3d" id="login3d"></div><div><h2 style="font-size:clamp(26px,4cqi,36px);color:#fff">Write. Publish.<br>See who read it.</h2><p style="color:#aab4cc;margin:10px 0 0;max-width:36ch">Manage your blogs, projects and skills, and watch how visitors find and read them.</p></div></div>' +
        '<div class="loginr"><div><h3 style="font-size:26px">Sign in</h3><p class="muted" style="margin:6px 0 0">Private area. Only you can get in.</p></div><div><label class="label">Email</label><input class="in" value="you@example.com" aria-label="Email"></div><div><label class="label">Password</label><input class="in" type="password" value="••••••••••" aria-label="Password"></div>' + btn("Sign in", "p", "lock") + '<p class="muted" style="font-size:12.5px;margin:0">Protected by a signed login cookie that expires on its own.</p></div></div>';
    },
    mount: function (frame) { return mountStack(frame.querySelector("#login3d"), { dark: true, labels: true }).dispose; }
  });

  /* ---------- dashboard ---------- */
  A.push({
    id: "admin-dashboard", label: "Dashboard", area: "admin", title: "Dashboard", sub: "Overview",
    notes: [["New", "Visits, unique visitors, time on site and résumé downloads are the first thing you see. Résumé downloads are the signal that matters for recruiters."], ["Fix", "Emoji icons are replaced with a consistent icon set, and the glass cards with plain, readable ones."], ["Keep", "Admin dark mode is included, as you asked. Use the Dark switch above to preview it."]],
    html: function () {
      var kp = [["Visits", visitsTotal.toLocaleString(), "+18%", "up", "eye"], ["Unique visitors", "541", "+12%", "up", "users"], ["Avg. time on site", "2m 14s", "+9%", "up", "clock"], ["Résumé downloads", "14", "+4", "up", "download"], ["Subscribers", "31", "+3", "up", "mail"]];
      return adm("admin-dashboard", ahead("Dashboard", "Last 30 days. " + SAMPLE, btn("New blog post", "p", "plus", "admin-editor")) +
        '<div class="kpis">' + kp.map(function (k) { return '<div class="kpi"><small>' + ico(k[4], 15) + k[0] + "</small><b>" + k[1] + '</b><span class="dl ' + k[3] + '">' + k[2] + " vs previous 30 days</span></div>"; }).join("") + "</div>" +
        '<div class="agrid"><div class="acard"><div class="hd"><div><h3>Visits per day</h3><p>Every page view, bots removed</p></div></div>' + areaChart(visits, { id: "dv", labels: ["30 days ago", "15 days ago", "Today"], label: "Visits per day" }) + '</div><div class="acard"><div class="hd"><div><h3>Where visitors come from</h3><p>Visits by source</p></div><button class="btn s" type="button" data-go="admin-analytics">Details</button></div>' + hbars(SRC.slice(0, 5).map(function (s) { return { l: s[0], v: s[1], c: s[5] }; })) + "</div></div>" +
        '<div class="agrid"><div class="acard"><div class="hd"><div><h3>Most read posts</h3><p>Click a count to see every visit</p></div><button class="btn s" type="button" data-go="admin-blogs">All posts</button></div><div class="tblwrap"><table class="tbl"><tbody>' +
        [8, 9, 7, 3, 2].map(function (idx) { return '<tr><td class="tt">' + esc(D.blogs[idx].title.slice(0, 54)) + '</td><td class="num"><button class="viewsbtn" type="button" data-go="admin-blog-views">' + ico("eye", 14) + BV[idx] + "</button></td></tr>"; }).join("") + '</tbody></table></div></div><div class="acard"><div class="hd"><div><h3>Latest visitors</h3><p>Newest first</p></div><button class="btn s" type="button" data-go="admin-analytics">All visits</button></div><div class="tblwrap"><table class="tbl"><tbody>' +
        SESS.slice(0, 4).map(function (s) { return '<tr class="row" data-go="admin-journey"><td><b>#' + s.id + '</b><div class="muted" style="font-size:12px">' + s.when + "</div></td><td>" + srcPill(s.src) + "</td><td>" + s.loc + '</td><td class="num">' + fmtDur(s.total) + "</td></tr>"; }).join("") + "</tbody></table></div></div></div>" + privacy);
    }
  });

  /* ---------- blogs list ---------- */
  A.push({
    id: "admin-blogs", label: "Blogs", area: "admin", title: "Blogs", sub: "Posts with private view counts",
    notes: [["New", "Views column, visible only here. Click any count to open every visit for that post."], ["New", "Draft and Published tabs, search, and the real reading time per post."], ["Fix", "View counts are removed from the public blog page."]],
    html: function () {
      var rows = D.blogs.map(function (b, i) {
        return '<tr><td class="tt">' + esc(b.title) + "<small>/blogs/" + esc(b.slug) + '</small></td><td><span class="pill good">Published</span></td><td>' + fmtDate(b.date) + '</td><td><button class="viewsbtn" type="button" data-go="admin-blog-views" title="See who viewed this">' + ico("eye", 14) + BV[i].toLocaleString() + ico("chev", 12) + '</button></td><td class="num">' + [3, 1, 4, 2, 0, 1, 2, 5, 7, 3][i] + '</td><td class="num"><button class="btn s" type="button" data-go="admin-editor">' + ico("edit", 14) + " Edit</button></td></tr>";
      }).join("");
      return adm("admin-blogs", ahead("Blogs", "10 posts. Views and comments are private to you. " + SAMPLE, btn("New blog post", "p", "plus", "admin-editor")) +
        '<div class="toolbar"><span class="tabs"><button type="button" aria-pressed="true">All 11</button><button type="button" aria-pressed="false">Published 10</button><button type="button" aria-pressed="false">Drafts 1</button></span><input class="in grow" placeholder="Search posts" aria-label="Search posts" style="max-width:320px"></div>' +
        '<div class="acard"><div class="tblwrap"><table class="tbl"><thead><tr><th>Post</th><th>Status</th><th>Date</th><th>Views</th><th class="num">Comments</th><th></th></tr></thead><tbody><tr><td class="tt">Kafka retries and idempotency<small>/blogs/kafka-retries-and-idempotency</small></td><td><span class="pill warn">Draft</span></td><td>Saved 2 h ago</td><td class="muted">—</td><td class="num">—</td><td class="num"><button class="btn s" type="button" data-go="admin-editor">' + ico("edit", 14) + " Edit</button></td></tr>" + rows + "</tbody></table></div></div>");
    }
  });

  /* ---------- blog views drill-down ---------- */
  var VR = []; (function () {
    var r = rng(21), srcs = ["Google", "LinkedIn", "Direct", "GitHub", "Google", "LinkedIn", "Twitter/X", "Direct", "Google", "Reddit"], dv = ["iPhone · Safari", "Windows · Chrome", "Mac · Chrome", "Android · Chrome", "Linux · Firefox", "Mac · Safari"], lc = ["Hyderabad, IN", "Bengaluru, IN", "Pune, IN", "Mumbai, IN", "Singapore, SG", "London, GB", "Austin, US", "Chennai, IN"], ips = ["103.211", "49.37", "117.200", "106.51", "175.156", "81.2", "73.45", "157.48"];
    var refs = { Google: "google.com", LinkedIn: "linkedin.com/feed", Direct: "(no referrer)", GitHub: "github.com", "Twitter/X": "t.co", Reddit: "reddit.com/r/java" };
    var when = ["3 min ago", "22 min ago", "48 min ago", "1 h ago", "2 h ago", "3 h ago", "5 h ago", "7 h ago", "Yesterday", "Yesterday", "2 days ago", "2 days ago"];
    for (var k = 0; k < 12; k++) { var s = srcs[Math.floor(r() * srcs.length)], d = dv[Math.floor(r() * dv.length)], l = Math.floor(r() * lc.length); VR.push({ when: when[k], src: s, ref: refs[s], dev: d, di: /iPhone|Android/.test(d) ? "phone" : "monitor", loc: lc[l], ip: ips[l] + ".x.x", secs: 20 + Math.floor(r() * 300), depth: 15 + Math.floor(r() * 85) }); }
  })();
  A.push({
    id: "admin-blog-views", label: "Blog views", area: "admin", title: "Blog views", sub: "Click a count in Blogs to open this",
    notes: [["New", "The screen you asked for. Every visit to one post: where from, how long they stayed, how far they read, device and city."], ["New", "Read depth tells you who read the whole post and who left after a paragraph."], ["Keep", "No IP address is collected or stored, as you decided. City comes from the visitor's network at request time and the IP itself is never saved."], ["Keep", "Posts written before tracking started keep their old view totals. The detailed list starts on launch day, and the screen says so."]],
    html: function () {
      var bySrc = SRC.slice(0, 5).map(function (s) { return { l: s[0], v: Math.round(s[1] * 842 / 732), c: s[5] }; });
      return adm("admin-blogs", '<div><div class="crumb"><a data-go="admin-blogs" style="cursor:pointer">Blogs</a>' + ico("chev", 12) + "<span>" + esc(blog.title.slice(0, 40)) + "…</span>" + ico("chev", 12) + "<b>Views</b></div>" + ahead(esc(blog.title), "842 views since " + fmtDate(blog.date) + ". " + SAMPLE, btn("Export CSV", "", "download") + btn("View post", "", "ext")) + "</div>" +
        '<div class="kpis"><div class="kpi"><small>' + ico("eye", 15) + 'Views</small><b>842</b><span class="dl up">+64 this week</span></div><div class="kpi"><small>' + ico("users", 15) + 'Unique visitors</small><b>611</b><span class="muted" style="font-size:12px">72% of views</span></div><div class="kpi"><small>' + ico("clock", 15) + 'Avg. time on page</small><b>3m 04s</b><span class="dl up">+18s vs your average</span></div><div class="kpi"><small>' + ico("down", 15) + 'Avg. read depth</small><b>68%</b><span class="muted" style="font-size:12px">of the article</span></div></div>' +
        '<div class="agrid"><div class="acard"><div class="hd"><div><h3>Views per day</h3><p>Since publishing</p></div></div>' + areaChart(visits.map(function (v, i) { return Math.round(v * 0.6 + (i % 7 === 2 ? 6 : 0)); }), { id: "bv", labels: ["Apr 5", "", "Today"], label: "Post views per day" }) + '</div><div class="acard"><div class="hd"><div><h3>Sources</h3><p>Where readers came from</p></div></div>' + hbars(bySrc) + "</div></div>" +
        '<div class="acard"><div class="hd"><div><h3>Every visit</h3><p>Newest first. Click a row to see everything that visitor did.</p></div><div class="toolbar"><select class="in" aria-label="Source filter" style="width:auto"><option>All sources</option></select><select class="in" aria-label="Date filter" style="width:auto"><option>Last 30 days</option></select></div></div><div class="tblwrap"><table class="tbl"><thead><tr><th>When</th><th>Source</th><th>Referrer</th><th>Device</th><th>Location</th><th class="num">Time on page</th><th>Read depth</th></tr></thead><tbody>' +
        VR.map(function (v) { return '<tr class="row" data-go="admin-journey"><td>' + v.when + "</td><td>" + srcPill(v.src) + '</td><td class="muted">' + v.ref + "</td><td>" + ico(v.di, 15) + " " + v.dev + "</td><td>" + v.loc + '</td><td class="num">' + fmtDur(v.secs) + '</td><td style="min-width:110px"><div style="display:flex;align-items:center;gap:8px"><div class="meter" style="flex:1"><i style="width:' + v.depth + '%"></i></div><b style="font-size:12px">' + v.depth + "%</b></div></td></tr>"; }).join("") + "</tbody></table></div></div>" + privacy);
    }
  });

  /* ---------- visitor analytics ---------- */
  A.push({
    id: "admin-analytics", label: "Visitors", area: "admin", title: "Visitors", sub: "Sources, time spent, journeys",
    notes: [["New", "Which sources bring people, and which ones spend the most time. Today you only see counts per source."], ["New", "Every visit is one row. Click it to see the pages in order with time spent on each."], ["New", "Résumé downloads show up as events inside a journey, so you can tell a recruiter-style visit from a casual one."]],
    html: function () {
      var maxT = Math.max.apply(null, SRC.map(function (s) { return s[2]; }));
      return adm("admin-analytics", ahead("Visitors", "How people find and use your site. " + SAMPLE, '<span class="tabs"><button type="button" aria-pressed="false">7 days</button><button type="button" aria-pressed="true">30 days</button><button type="button" aria-pressed="false">90 days</button></span>') + privacy +
        '<div class="kpis"><div class="kpi"><small>Visits</small><b>' + visitsTotal + '</b><span class="dl up">+18%</span></div><div class="kpi"><small>Unique visitors</small><b>541</b><span class="dl up">+12%</span></div><div class="kpi"><small>Pages per visit</small><b>2.3</b><span class="dl up">+0.2</span></div><div class="kpi"><small>Avg. time on site</small><b>2m 14s</b><span class="dl up">+9%</span></div><div class="kpi"><small>Résumé downloads</small><b>14</b><span class="dl up">+4</span></div></div>' +
        '<div class="acard"><div class="hd"><div><h3>Visits per day</h3></div></div>' + areaChart(visits, { id: "av", labels: ["30 days ago", "15 days ago", "Today"], label: "Visits per day" }) + "</div>" +
        '<div class="agrid even"><div class="acard"><div class="hd"><div><h3>Sources by visits</h3><p>Where visitors arrive from</p></div></div>' + hbars(SRC.map(function (s) { return { l: s[0], v: s[1], c: s[5] }; })) + '</div><div class="acard"><div class="hd"><div><h3>Sources by time spent</h3><p>Average time per visit. Longest first.</p></div></div>' + hbars(SRC.slice().sort(function (a, b) { return b[2] - a[2]; }).map(function (s) { return { l: s[0], v: s[2], c: s[5] }; }), { fmt: fmtDur }) + '<p class="muted" style="font-size:12.5px;margin:12px 0 0">LinkedIn is smaller than Google by visits but readers stay ' + Math.round((192 / 164 - 1) * 100) + "% longer. That is the audience to write for.</p></div></div>" +
        '<div class="agrid even"><div class="acard"><div class="hd"><div><h3>Devices</h3></div></div><div style="display:flex;gap:22px;align-items:center;flex-wrap:wrap">' + donut([{ v: 49, c: "var(--c1)" }, { v: 46, c: "var(--c2)" }, { v: 5, c: "var(--c4)" }], { center: "46%", sub: "on phones", label: "Device split" }) + '<div class="legend" style="flex-direction:column;gap:8px"><span><i style="background:var(--c1)"></i>Desktop 49%</span><span><i style="background:var(--c2)"></i>Phone 46%</span><span><i style="background:var(--c4)"></i>Tablet 5%</span></div></div></div><div class="acard"><div class="hd"><div><h3>Top locations</h3><p>City level, never the IP</p></div></div>' + hbars([{ l: "Hyderabad", v: 28 }, { l: "Bengaluru", v: 19 }, { l: "Mumbai", v: 11 }, { l: "Pune", v: 9 }, { l: "Singapore", v: 6 }, { l: "London", v: 4 }], { fmt: function (v) { return v + "%"; } }) + "</div></div>" +
        '<div class="acard"><div class="hd"><div><h3>Every visit</h3><p>Click a row to open the journey</p></div></div>' + sessTable(SESS) + "</div>");
    }
  });

  /* ---------- journey ---------- */
  A.push({
    id: "admin-journey", label: "Visitor journey", area: "admin", title: "Visitor journey", sub: "One visit, page by page",
    notes: [["New", "Pages in order, time on each, how far they scrolled, and events like résumé downloads."], ["New", "The identity card is honest: a visitor stays anonymous unless they subscribe and choose to share their reading history. Browsers do not reveal names, emails or phone numbers."]],
    html: function () {
      var s = SESS[0], t = 0, rows = "";
      s.pages.forEach(function (p, k) {
        rows += '<div class="tlrow"><div class="t">+' + fmtDur(t) + '</div><div class="rail2"><i></i></div><div class="bx"><div class="top"><b>' + esc(p[0]) + '</b><span class="muted" style="font-size:12.5px">' + fmtDur(p[1]) + ' on page</span></div><div style="display:flex;gap:10px;align-items:center"><div class="meter" style="flex:1"><i style="width:' + p[2] + '%"></i></div><span class="muted" style="font-size:12px;white-space:nowrap">read ' + p[2] + "%</span></div></div></div>";
        t += p[1];
        s.ev.forEach(function (e) { if (e[0] === k + 1) rows += '<div class="tlrow ev"><div class="t">+' + fmtDur(t) + '</div><div class="rail2"><i></i></div><div class="bx"><div class="top"><b>' + ico("download", 15) + " " + e[1] + '</b><span class="pill good nodot">Event</span></div></div></div>'; });
      });
      return adm("admin-analytics", '<div><div class="crumb"><a data-go="admin-analytics" style="cursor:pointer">Visitors</a>' + ico("chev", 12) + "<b>Visit #" + s.id + '</b></div>' + ahead("Visit #" + s.id + ' <span class="pill info nodot" style="vertical-align:middle;margin-left:6px">Downloaded résumé</span>', s.when + " · " + fmtDur(s.total) + " · " + s.pages.length + " pages. " + SAMPLE, btn("Back to visits", "", "back", "admin-analytics")) + "</div>" +
        '<div class="agrid"><div class="acard"><div class="hd"><div><h3>Journey</h3><p>Pages in the order they were opened</p></div></div><div class="timeline">' + rows + '</div></div><div style="display:grid;gap:16px;align-content:start"><div class="acard"><div class="hd"><h3>Where from</h3></div><dl class="kv"><div><dt>Source</dt><dd>' + srcPill(s.src) + "</dd></div><div><dt>Referrer</dt><dd>" + s.ref + '</dd></div><div><dt>Entry page</dt><dd>Home</dd></div><div><dt>Exit page</dt><dd>Projects</dd></div></dl></div><div class="acard"><div class="hd"><h3>Visitor</h3></div><dl class="kv"><div><dt>Device</dt><dd>' + ico(s.di, 14) + " " + s.dev + "</dd></div><div><dt>Location</dt><dd>" + s.loc + '</dd></div><div><dt>Browser</dt><dd>' + s.dev.split(" · ")[1] + '</dd></div><div><dt>Visit type</dt><dd>Single visit</dd></div></dl></div><div class="acard"><div class="hd"><h3>Identity</h3><span class="pill nodot">Anonymous</span></div><p class="muted" style="margin:0;font-size:13.5px">Visitors stay anonymous. Browsers never reveal a name, email or phone number. If a visitor subscribes and ticks "let me see which pages I read", their name and email appear here and their visit is linked to them.</p></div></div></div>');
    }
  });

  /* ---------- the editor ---------- */
  var MD = '<div class="langmenu">' + ["Java", "JavaScript", "TypeScript", "Python", "SQL", "YAML", "Bash", "JSON"].map(function (l, k) { return '<div class="' + (k === 0 ? "on" : "") + '"><span>' + l + "</span>" + (k === 0 ? ico("check", 13) : "") + "</div>"; }).join("") + "</div>";
  var SLASH = '<div class="slashwrap"><p>/co<span class="caret"></span></p><div class="slash"><small>Blocks matching “co”</small>' + [["code", "Code block", "Syntax colours, file name, copy", "```"], ["bulb", "Callout", "Highlight a tip or warning", "/callout"], ["table", "Comparison table", "Rows and columns", "/table"]].map(function (o, k) { return '<div class="o ' + (k === 0 ? "on" : "") + '"><span class="ic">' + ico(o[0], 17) + "</span><div><b>" + o[1] + "</b><span>" + o[2] + "</span></div><kbd>" + o[3] + "</kbd></div>"; }).join("") + '</div></div><div style="height:230px"></div>';
  var BUBBLE = '<span class="bubble"><i class="on">' + ico("bold", 16) + "</i><i>" + ico("italic", 16) + "</i><i>" + ico("code", 16) + "</i><i>" + ico("link", 16) + "</i><i>" + ico("heading", 16) + "</i></span>";
  function edArticle() {
    return articleHTML({ extra: MD }).replace("Idempotency is how you make that retry safe.", 'Idempotency is how you make <span class="selmark">that retry safe' + BUBBLE + "</span>.") + SLASH;
  }
  A.push({
    id: "admin-editor", label: "Blog editor", area: "admin", title: "Blog editor", sub: "Rebuilt writing experience", tag: "fix",
    notes: [["Fix", "Bullets and numbered lists show while you write, in colour, exactly as they will on the site. The editor and the site now share one article stylesheet."], ["Fix", "Code: type /code or ``` for a real code block with a language picker, file name, syntax colours, highlighted lines and a Copy button. The same colours show on the site."], ["New", "Slash menu (type /), a floating toolbar on selected text, Markdown paste (ChatGPT and docs paste cleanly), autosave, split preview, SEO checks and a real reading time."], ["Keep", "Same TipTap engine and the same saved format, so your 10 existing posts open without conversion."]],
    html: function () {
      var bar = [["bold"], ["italic"], ["code", "on"], ["link"], "|", ["list"], ["olist"], ["quote"], "|", ["code"], ["bulb"], ["image"], ["table"], "|", ["undo"]];
      var chips = ["Idempotency", "Microservices", "Spring Boot", "System Design", "REST API"];
      return '<div class="ed" id="ed" data-mode="split"><div class="edtop"><button class="btn s" type="button" data-go="admin-blogs">' + ico("back", 15) + ' Blogs</button><span class="st"><span class="pill good">Draft saved</span> 12 s ago</span><span class="st">' + ico("clock", 14) + ' 1,284 words · 6 min read</span><span class="grow"></span><span class="tabs" role="group" aria-label="Editor view"><button type="button" aria-pressed="false" data-act="edmode" data-mode="write">Write</button><button type="button" aria-pressed="true" data-act="edmode" data-mode="split">Split preview</button><button type="button" aria-pressed="false" data-act="edmode" data-mode="preview">Preview</button></span>' + btn("Save draft", "", "save") + btn("Publish", "p", "check") + "</div>" +
        '<div class="edbody"><div class="edmain"><div class="pane w edcanvas"><span class="tag">Writing</span><h1 class="edtitle" contenteditable="false">Idempotency in Microservices: Why It Matters</h1><p class="edsub">Why retries are dangerous, and the small pattern that makes them safe.</p><div class="edbar"><span class="sel2">Paragraph ' + ico("chevd", 13) + '</span><span class="sep"></span>' + bar.map(function (b) { return b === "|" ? '<span class="sep"></span>' : '<button class="b ' + (b[1] || "") + '" type="button" aria-label="' + b[0] + '">' + ico(b[0], 17) + "</button>"; }).join("") + '<span class="grow" style="flex:1"></span><span class="muted" style="font-size:12px;padding:0 8px">Type / for blocks · paste Markdown to format</span></div><div class="article">' + edArticle() + '</div></div><div class="pane pv"><span class="tag">How it looks on your site</span><h1 class="edtitle">Idempotency in Microservices: Why It Matters</h1><p class="edsub">Why retries are dangerous, and the small pattern that makes them safe.</p><div class="article">' + articleHTML() + "</div></div></div>" +
        '<aside class="edside"><section><h4>Publish</h4><div class="kv"><div><dt>Status</dt><dd><span class="pill warn">Draft</span></dd></div><div><dt>Visibility</dt><dd>Public when published</dd></div><div><dt>Publish on</dt><dd>' + ico("calendar", 13) + ' Now</dd></div></div></section><section><h4>Thumbnail</h4><div class="drop">' + ico("image", 22) + '<span>Drop an image or <b style="color:var(--primary)">browse</b><br>Used on cards and when shared</span></div></section><section><h4>Link and summary</h4><div><label class="label">Slug</label><input class="in mono" value="idempotency-in-microservices" aria-label="Slug"></div><div><label class="label">Excerpt <span style="float:right;font-weight:500">142 / 160</span></label><textarea class="in" aria-label="Excerpt">Why retries are dangerous in distributed systems, and the small idempotency-key pattern that makes them safe in Spring Boot.</textarea></div></section><section><h4>Tags</h4><div class="chips">' + chips.map(function (c) { return chip(c, "soft") + ""; }).join("") + '</div><span class="muted" style="font-size:12px">5 tags is a good number. More than 6 dilutes search.</span></section><section><h4>Search preview</h4><div class="serp"><span class="u">suryasatyanikhil.vercel.app › blogs</span><span class="tt">Idempotency in Microservices: Why It Matters | Surya Satya Nikhil</span><span class="d">Why retries are dangerous in distributed systems, and the small idempotency-key pattern that makes them safe in Spring Boot.</span></div></section><section><h4>Checks</h4><div class="checks"><div><span class="ok">' + ico("check", 15) + '</span>Title is 52 characters</div><div><span class="ok">' + ico("check", 15) + '</span>Excerpt is set</div><div><span class="ok">' + ico("check", 15) + '</span>5 tags</div><div><span class="no">' + ico("alert", 15) + '</span>No thumbnail yet</div><div><span class="no">' + ico("alert", 15) + '</span>1 image has no alt text</div></div></section></aside></div>' +
        '<div style="padding:0 clamp(14px,2.4cqi,24px) 24px"><div class="acard"><div class="hd"><div><h3>What was wrong, and what changes</h3><p>Found by reading your current editor and site code</p></div></div><div class="fixes">' + [
          ["Bullets and numbers are invisible on the site", "One article stylesheet shared by the editor and the site. What you see is what readers get."],
          ["Code is one flat colour, with no language and no copy button", "Real code blocks: language picker, file name, syntax colours, line highlight, Copy button."],
          ["Every post says “1 min read”", "Reading time is calculated from the text every time you save."],
          ["Pasting Markdown or AI text leaves stars and hashes", "Paste converts headings, lists and fenced code into real blocks."],
          ["No autosave, no preview, no SEO help", "Autosave, split preview, excerpt counter and a checklist before you publish."]
        ].map(function (r) { return '<div class="r"><div class="bad"><b>' + r[0] + "</b></div>" + ico("chev", 16) + '<div class="good"><b style="color:var(--fg)">' + r[1] + "</b></div></div>"; }).join("") + "</div></div></div></div>";
    }
  });

  /* ---------- other admin pages ---------- */
  A.push({
    id: "admin-projects", label: "Projects", area: "admin", title: "Admin projects", sub: "Manage projects",
    notes: [["New", "Table with thumbnail, stack and a Featured switch. Same fields as today."], ["Ask", "Add a description to your one project. The public page is empty without it."]],
    html: function () {
      var p = D.projects[0];
      return adm("admin-projects", ahead("Projects", "1 project", btn("Add project", "p", "plus")) + '<div class="acard"><div class="tblwrap"><table class="tbl"><thead><tr><th>Project</th><th>Stack</th><th>Featured</th><th>Links</th><th></th></tr></thead><tbody><tr><td class="tt"><div style="display:flex;gap:12px;align-items:center"><span class="ph v1" style="width:54px;height:40px;border-radius:8px;flex:none"></span><div>' + esc(p.title) + "<small>/projects/" + esc(p.slug) + '</small></div></div></td><td><div class="chips">' + p.tech.slice(0, 3).map(function (t) { return chip(t, "mono"); }).join("") + chip("+" + (p.tech.length - 3), "mono") + '</div></td><td><span class="pill nodot">Off</span></td><td>' + ico("code", 15) + ' <span class="muted">GitHub</span></td><td class="num"><button class="btn s" type="button">' + ico("edit", 14) + ' Edit</button> <span class="pill warn">No description</span></td></tr></tbody></table></div></div>');
    }
  });
  A.push({
    id: "admin-skills", label: "Skills", area: "admin", title: "Admin skills", sub: "Manage skills",
    notes: [["Fix", "Replaced the tall, uneven cards with one tidy list: a row per category, skills as chips beside it. Six categories fit on one screen and nothing is left half-empty."], ["New", "Add a skill at the top in one line (name, category, icon). Hover a chip to edit or delete it, and drag the grip to reorder categories."], ["Keep", "Same data and the same icon upload. The home page still groups skills by these categories."]],
    html: function () {
      var cols = ["var(--c1)", "var(--c2)", "var(--c5)", "var(--c3)", "var(--c4)", "var(--c1)"], k = 0;
      return adm("admin-skills", ahead("Skills", "17 skills in 6 categories. Drag a category to reorder.") +
        '<div class="acard"><div class="hd"><div><h3>Add a skill</h3><p>The icon is optional. A letter tile is used until you upload one.</p></div></div><div class="skadd"><div><label class="label">Name</label><input class="in" placeholder="e.g. Kafka" aria-label="Skill name"></div><div><label class="label">Category</label><select class="in" aria-label="Category">' + Object.keys(D.skills).map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("") + '<option>New category…</option></select></div>' + btn("Upload icon", "", "image") + btn("Add skill", "p", "plus") + "</div></div>" +
        '<div class="acard"><div class="skrows">' + Object.keys(D.skills).map(function (cat) {
          var c = cols[k++];
          return '<div class="skrow"><div class="cat"><span class="grip">' + ico("grip", 16) + "</span>" + esc(cat) + "<small>" + D.skills[cat].length + '</small></div><div class="items" style="--lc:' + c + '">' + D.skills[cat].map(function (n) { return '<span class="skchip"><i>' + esc(n.charAt(0)) + "</i>" + esc(n === "PostgresSQL" ? "PostgreSQL" : n) + '<span class="x"><span title="Edit">' + ico("edit", 13) + '</span><span title="Delete">' + ico("trash", 13) + "</span></span></span>"; }).join("") + '<span class="skchip add">' + ico("plus", 14) + " Add</span></div></div>";
        }).join("") + "</div></div>");
    }
  });
  A.push({
    id: "admin-experience", label: "Experience", area: "admin", title: "Admin experience", sub: "Manage experience",
    notes: [["New", "Cards with the logo, dates and a clear Edit button; a live preview of how it looks on the site is next to the form."]],
    html: function () {
      var e = D.experience[0];
      return adm("admin-experience", ahead("Experience", "1 role", btn("Add role", "p", "plus")) + '<div class="agrid"><div class="acard"><div class="hd"><h3>Edit role</h3></div><div class="formgrid"><div><label class="label">Company</label><input class="in" value="' + esc(e.company) + '" aria-label="Company"></div><div><label class="label">Role</label><input class="in" value="' + esc(e.role) + '" aria-label="Role"></div><div><label class="label">Start</label><input class="in" value="' + e.start + '" aria-label="Start"></div><div><label class="label">End</label><input class="in" value="' + e.end + '" aria-label="End"></div><div class="full"><label class="label">Location</label><input class="in" value="' + e.location + '" aria-label="Location"></div><div class="full"><label class="label">What you did</label><textarea class="in" style="min-height:130px" aria-label="Description">' + esc(e.desc) + '</textarea></div></div><div class="toolbar" style="margin-top:14px">' + btn("Save", "p", "check") + btn("Cancel") + '</div></div><div class="acard"><div class="hd"><h3>Preview</h3><span class="muted" style="font-size:12.5px">As shown on the site</span></div><div style="display:grid;grid-template-columns:48px minmax(0,1fr);gap:12px"><span style="width:48px;height:48px;border-radius:10px;border:1px solid var(--line);display:grid;place-items:center;font:800 16px var(--f-display);color:var(--primary);background:var(--surface-2)">iQ</span><div><b>' + esc(e.role) + "</b><div class=\"muted\" style=\"font-size:13px\">" + esc(e.company) + " · " + e.start + " – " + e.end + "</div></div></div></div></div>");
    }
  });
  A.push({
    id: "admin-about", label: "About", area: "admin", title: "Admin about", sub: "Manage your profile",
    notes: [["New", "Profile photo, résumé and links grouped on one screen. The bio box uses the same editor and article style as blog posts."], ["New", "A switch controls the highlighted \"Open to new roles\" pill on the site."]],
    html: function () {
      return adm("admin-about", ahead("About", "Shown on the About page and in the site header", btn("Save changes", "p", "check")) + '<div class="agrid"><div class="acard"><div class="hd"><h3>Profile</h3></div><div class="formgrid"><div><label class="label">Name</label><input class="in" value="' + esc(D.about.name) + '" aria-label="Name"></div><div><label class="label">Title</label><input class="in" value="' + esc(D.about.title) + '" aria-label="Title"></div><div><label class="label">GitHub</label><input class="in" value="' + esc(D.about.github) + '" aria-label="GitHub"></div><div><label class="label">LinkedIn</label><input class="in" value="' + esc(D.about.linkedin) + '" aria-label="LinkedIn"></div><div class="full"><label class="switch" role="switch" aria-checked="true"><span class="tr"></span><span><b>Show "Open to new roles" on the site</b><br><span class="muted" style="font-size:12.5px">Highlighted pill on Home and the Availability card on About</span></span></label></div><div class="full"><label class="label">Bio</label><div class="in article" style="min-height:160px;font-size:15px;line-height:1.6;padding:12px 14px">' + D.about.bio.map(function (p) { return "<p style=\"margin:0 0 .8em\">" + esc(p.v) + "</p>"; }).join("") + '</div></div></div></div><div style="display:grid;gap:16px;align-content:start"><div class="acard"><div class="hd"><h3>Photo</h3></div><div style="display:flex;gap:14px;align-items:center"><img alt="" src="' + D.about.photo + '" style="width:84px;height:84px;border-radius:14px;object-fit:cover;border:1px solid var(--line)">' + btn("Replace", "s") + '</div></div><div class="acard"><div class="hd"><h3>Résumé</h3></div><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="pill good nodot">' + ico("check", 13) + ' PDF uploaded</span>' + btn("Replace PDF", "s", "download") + '</div><p class="muted" style="font-size:12.5px;margin:10px 0 0">Downloads are counted as events in Visitors.</p></div></div></div>');
    }
  });
  A.push({
    id: "admin-comments", label: "Comments", area: "admin", title: "Admin comments", sub: "Moderate comments",
    notes: [["New", "Filter tabs and one-line actions. Reactions are shown beside each comment."], ["Keep", "Approve, reply and delete work as they do now."]],
    html: function () {
      var cm = [["Rohit M.", "Idempotency in Microservices", "Great breakdown of the retry problem. The lock-on-key point is the part most tutorials skip.", "2 days ago", "Approved"], ["Priya S.", "Idempotency in Microservices", "How long do you keep keys before expiring them?", "5 days ago", "Needs reply"], ["Arjun T.", "RAG is everywhere", "Would love a follow-up on evaluation metrics.", "1 week ago", "Approved"]];
      return adm("admin-comments", ahead("Comments", "Sample comments " + SAMPLE) + '<div class="toolbar"><span class="tabs"><button type="button" aria-pressed="true">All</button><button type="button" aria-pressed="false">Needs reply 1</button><button type="button" aria-pressed="false">Approved</button></span></div><div class="acard">' + cm.map(function (c, k) { return '<div class="cmt" style="' + (k === 0 ? "border-top:0;padding-top:0" : "") + '"><span class="av">' + c[0].charAt(0) + '</span><div><b>' + c[0] + '</b> <span class="muted" style="font-size:12.5px">on ' + c[1] + " · " + c[3] + "</span><p>" + c[2] + '</p></div><div class="toolbar">' + (c[4] === "Needs reply" ? '<span class="pill warn">Needs reply</span>' : '<span class="pill good">Approved</span>') + btn("Reply", "s", "msg") + '<button class="btn s" type="button" aria-label="Delete">' + ico("trash", 14) + "</button></div></div>"; }).join("") + "</div>");
    }
  });
  A.push({
    id: "admin-subscribers", label: "Subscribers", area: "admin", title: "Admin subscribers", sub: "Newsletter and identified visitors",
    notes: [["New", "A Visits column links a subscriber to their journey, but only when they ticked \"let me see which pages I read\" on the subscribe form. Everyone else shows Not shared."], ["Keep", "Same fields as today: name, email, profession, location, phone."]],
    html: function () {
      var sb = [["Meera K.", "meera.k@example.com", "Talent partner", "Mumbai, IN", "+91 98•••• 4210", "Today", 6], ["Asha R.", "asha.r@example.com", "Engineering manager", "Bengaluru, IN", "—", "3 days ago", 0], ["Dev P.", "dev.p@example.com", "Backend developer", "Pune, IN", "—", "1 week ago", 0]];
      return adm("admin-subscribers", ahead("Subscribers", "31 people. Sample rows " + SAMPLE, btn("Send update", "p", "mail") + btn("Export CSV", "", "download")) + '<div class="acard"><div class="tblwrap"><table class="tbl"><thead><tr><th>Name</th><th>Email</th><th>Profession</th><th>Location</th><th>Phone</th><th>Joined</th><th class="num">Visits</th></tr></thead><tbody>' + sb.map(function (s) { return '<tr class="row" data-go="admin-journey"><td class="tt">' + s[0] + "</td><td>" + s[1] + "</td><td>" + s[2] + "</td><td>" + s[3] + '</td><td class="mono">' + s[4] + "</td><td>" + s[5] + '</td><td class="num">' + (s[6] ? '<span class="viewsbtn">' + ico("eye", 13) + s[6] + "</span>" : '<span class="muted" title="Did not choose to share reading history">Not shared</span>') + "</td></tr>"; }).join("") + "</tbody></table></div></div>");
    }
  });

  window.ADMIN_SCREENS = A;
})();
