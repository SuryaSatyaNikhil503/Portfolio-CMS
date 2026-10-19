/* Router and review controls: screen list, hash navigation, theme and device switches, notes, tilt and small actions. */
(function () {
  "use strict";
  var SCREENS = [].concat(window.PUBLIC_SCREENS, window.ADMIN_SCREENS, window.SYSTEM_SCREENS);
  var GROUPS = [["Public site", function (s) { return s.area === "public" && s.id !== "design-system"; }], ["Admin", function (s) { return s.area === "admin"; }], ["Design system", function (s) { return s.id === "design-system"; }]];
  var TAGS = { home: ["new", "New"], "blog-post": ["fix", "Fix"], "admin-editor": ["fix", "Fix"], "admin-blog-views": ["new", "New"], "admin-analytics": ["new", "New"], "admin-journey": ["new", "New"] };
  var rail = document.getElementById("rail"), frame = document.getElementById("frame"), notes = document.getElementById("notes"), titleEl = document.getElementById("screenTitle"), subEl = document.getElementById("screenSub");
  var state = { theme: "light", device: "desktop" }, cleanup = null, current = null;
  try { var sv = JSON.parse(localStorage.getItem("screens-state") || "{}"); if (sv.theme) state.theme = sv.theme; if (sv.device) state.device = sv.device; } catch (e) { /* storage unavailable */ }
  function save() { try { localStorage.setItem("screens-state", JSON.stringify(state)); } catch (e) { /* ignore */ } }

  function byId(id) { for (var i = 0; i < SCREENS.length; i++) if (SCREENS[i].id === id) return SCREENS[i]; return SCREENS[0]; }

  function buildRail() {
    var h = '<div class="brand"><b>Portfolio screens</b><span>Option D, every page</span></div>';
    GROUPS.forEach(function (g) {
      h += "<h3>" + g[0] + "</h3>";
      SCREENS.filter(g[1]).forEach(function (s) { var t = TAGS[s.id]; h += '<button type="button" data-id="' + s.id + '" aria-current="false">' + esc(s.label) + (t ? '<span class="tag ' + t[0] + '">' + t[1] + "</span>" : "") + "</button>"; });
    });
    rail.innerHTML = h;
  }
  function syncControls() {
    document.querySelectorAll("[data-theme-btn]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-theme-btn") === state.theme)); });
    document.querySelectorAll("[data-device-btn]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-device-btn") === state.device)); });
    document.body.classList.toggle("device-phone", state.device === "phone");
  }
  function render(scroll) {
    var s = byId((location.hash || "").slice(1) || "home");
    if (cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; }
    current = s;
    frame.setAttribute("data-theme", state.theme); frame.setAttribute("data-area", s.area);
    frame.innerHTML = s.html(state);
    titleEl.textContent = s.title; subEl.textContent = s.sub || "";
    notes.innerHTML = "<h2>Notes on this screen</h2><ul>" + (s.notes || []).map(function (n) { return '<li><span class="k ' + n[0].toLowerCase() + '">' + n[0] + "</span><span>" + esc(n[1]) + "</span></li>"; }).join("") + "</ul>";
    rail.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-current", String(b.getAttribute("data-id") === s.id)); });
    frame.querySelectorAll("[data-go]").forEach(function (el) { if (!/^(BUTTON|A)$/.test(el.tagName)) { el.tabIndex = 0; } });
    document.title = s.title + " · Portfolio Screens";
    if (s.mount) cleanup = s.mount(frame, state) || null;
    syncControls();
    if (scroll) document.querySelector(".bar").scrollIntoView({ block: "start" });
  }
  function go(id, scroll) { if (location.hash.slice(1) === id) render(scroll); else { window.__scroll = scroll; location.hash = id; } }
  window.addEventListener("hashchange", function () { render(window.__scroll !== false); window.__scroll = true; });

  rail.addEventListener("click", function (e) { var b = e.target.closest("button[data-id]"); if (b) go(b.getAttribute("data-id"), true); });
  document.querySelectorAll("[data-theme-btn]").forEach(function (b) { b.addEventListener("click", function () { state.theme = b.getAttribute("data-theme-btn"); save(); render(false); }); });
  document.querySelectorAll("[data-device-btn]").forEach(function (b) { b.addEventListener("click", function () { state.device = b.getAttribute("data-device-btn"); save(); syncControls(); render(false); }); });

  var ACTS = {
    theme: function () { state.theme = state.theme === "light" ? "dark" : "light"; save(); render(false); },
    copy: function (el) {
      var code = el.closest(".cb").querySelector("pre").innerText, lab = el.querySelector("span");
      var done = function () { lab.textContent = "Copied"; setTimeout(function () { lab.textContent = "Copy"; }, 1400); };
      try { navigator.clipboard.writeText(code).then(done, done); } catch (e) { done(); }
    },
    edmode: function (el) { var ed = document.getElementById("ed"); ed.setAttribute("data-mode", el.getAttribute("data-mode")); el.parentNode.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b === el)); }); }
  };
  frame.addEventListener("click", function (e) {
    var act = e.target.closest("[data-act]"); if (act && ACTS[act.getAttribute("data-act")]) { ACTS[act.getAttribute("data-act")](act, e); return; }
    var tab = e.target.closest(".tabs button"); if (tab && !tab.hasAttribute("data-act")) { tab.parentNode.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b === tab)); }); return; }
    var g = e.target.closest("[data-go]"); if (g) { e.preventDefault(); go(g.getAttribute("data-go"), true); }
  });
  frame.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { var g = e.target.closest("[data-go]"); if (g && !/^(BUTTON|A)$/.test(g.tagName)) { e.preventDefault(); go(g.getAttribute("data-go"), true); } var a = e.target.closest('[data-act="theme"]'); if (a) { e.preventDefault(); ACTS.theme(); } } });

  /* 3D tilt on cards */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches, tilted = null;
  frame.addEventListener("pointermove", function (e) {
    if (reduce) return;
    var t = e.target.closest(".tilt");
    if (tilted && tilted !== t) { tilted.style.transform = ""; tilted = null; }
    if (!t) return;
    var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    t.style.transform = "perspective(900px) rotateX(" + (-y * 7).toFixed(2) + "deg) rotateY(" + (x * 9).toFixed(2) + "deg) translateY(-3px)"; tilted = t;
  });
  frame.addEventListener("pointerleave", function () { if (tilted) { tilted.style.transform = ""; tilted = null; } });

  buildRail(); syncControls(); render(false);
})();
