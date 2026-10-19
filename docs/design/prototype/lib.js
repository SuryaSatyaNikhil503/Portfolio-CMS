/* Shared helpers: icons, formatting, tiny charts, and a code highlighter. Everything returns HTML strings. */
(function () {
  "use strict";
  var P = {
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    edit: '<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',
    chev: '<path d="M9 18l6-6-6-6"/>',
    chevd: '<path d="M6 9l6 6 6-6"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    bold: '<path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z"/>',
    italic: '<path d="M19 4h-9M14 20H5M15 4L9 20"/>',
    code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    olist: '<path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
    quote: '<path d="M4 17c2-1 3-3 3-6H4V6h5v5c0 4-2 6-5 7zM14 17c2-1 3-3 3-6h-3V6h5v5c0 4-2 6-5 7z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M22 6l-10 7L2 6"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    trash: '<path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    ext: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>',
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z"/>',
    brief: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    chart: '<path d="M18 20V10M12 20V4M6 20v-6"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    sun: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    heading: '<path d="M6 4v16M18 4v16M6 12h12"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    down: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    layers: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><path d="M7 7h.01"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
    undo: '<path d="M3 7v6h6M3 13a9 9 0 1 0 3-7"/>'
  };
  window.ico = function (n, s) {
    s = s || 18;
    return '<svg class="ico" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || "") + "</svg>";
  };
  window.esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  window.rng = function (a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  window.fmtDur = function (s) { return s < 60 ? s + "s" : Math.floor(s / 60) + "m " + String(s % 60).padStart(2, "0") + "s"; };
  window.fmtDate = function (iso) { return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); };
  window.chip = function (t, c) { return '<span class="chip ' + (c || "") + '">' + esc(t) + "</span>"; };

  /* ---------- charts ---------- */
  window.areaChart = function (vals, o) {
    o = o || {}; var w = 720, h = o.h || 190, id = o.id || "ac", pad = { l: 34, r: 8, t: 10, b: 24 };
    var iw = w - pad.l - pad.r, ih = h - pad.t - pad.b, max = Math.max.apply(null, vals);
    var mag = Math.pow(10, Math.floor(Math.log10(max))), nice = Math.ceil((max / mag) * 2) / 2 * mag;
    var X = function (i) { return pad.l + iw * i / (vals.length - 1); }, Y = function (v) { return pad.t + ih * (1 - v / nice); };
    var line = vals.map(function (v, i) { return (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1); }).join(" ");
    var area = line + " L" + X(vals.length - 1).toFixed(1) + " " + (pad.t + ih) + " L" + X(0).toFixed(1) + " " + (pad.t + ih) + " Z";
    var g = "", k;
    for (k = 0; k <= 4; k++) { var yy = pad.t + ih * k / 4; g += '<line x1="' + pad.l + '" x2="' + (w - pad.r) + '" y1="' + yy + '" y2="' + yy + '" style="stroke:var(--line)" stroke-width="1"/><text x="' + (pad.l - 8) + '" y="' + (yy + 3.5) + '" text-anchor="end">' + Math.round(nice * (1 - k / 4)) + "</text>"; }
    var lb = o.labels || [], lx = [[0, "start"], [Math.floor((vals.length - 1) / 2), "middle"], [vals.length - 1, "end"]], lt = "";
    lx.forEach(function (p, i) { if (lb[i]) lt += '<text x="' + X(p[0]) + '" y="' + (h - 6) + '" text-anchor="' + p[1] + '">' + lb[i] + "</text>"; });
    var lastX = X(vals.length - 1), lastY = Y(vals[vals.length - 1]);
    return '<svg class="chart" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + esc(o.label || "Chart") + '"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--primary);stop-opacity:.32"/><stop offset="1" style="stop-color:var(--primary);stop-opacity:0"/></linearGradient></defs>' + g +
      '<path d="' + area + '" fill="url(#' + id + ')"/><path d="' + line + '" fill="none" style="stroke:var(--primary)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<circle cx="' + lastX + '" cy="' + lastY + '" r="4.5" style="fill:var(--surface);stroke:var(--primary)" stroke-width="2.5"/>' + lt + "</svg>";
  };
  window.hbars = function (rows, o) {
    o = o || {}; var max = Math.max.apply(null, rows.map(function (r) { return r.v; }));
    return rows.map(function (r) {
      return '<div class="hbar"><span>' + esc(r.l) + '</span><span class="tr"><i style="width:' + (r.v / max * 100).toFixed(1) + "%;--hc:" + (r.c || "var(--primary)") + '"></i></span><b>' + (o.fmt ? o.fmt(r.v) : r.v) + "</b></div>";
    }).join("");
  };
  window.donut = function (parts, o) {
    o = o || {}; var C = 2 * Math.PI * 42, tot = parts.reduce(function (a, p) { return a + p.v; }, 0), off = 0;
    var arcs = parts.map(function (p) {
      var len = p.v / tot * C, s = '<circle cx="60" cy="60" r="42" fill="none" stroke-width="16" style="stroke:' + p.c + '" stroke-dasharray="' + (len - 2).toFixed(2) + " " + (C - len + 2).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 60 60)"/>';
      off += len; return s;
    }).join("");
    return '<svg viewBox="0 0 120 120" width="' + (o.size || 130) + '" height="' + (o.size || 130) + '" role="img" aria-label="' + esc(o.label || "Breakdown") + '"><circle cx="60" cy="60" r="42" fill="none" stroke-width="16" style="stroke:var(--surface-2)"/>' + arcs +
      '<text x="60" y="58" text-anchor="middle" style="font:800 20px var(--f-display);fill:var(--fg)">' + (o.center || "") + '</text><text x="60" y="73" text-anchor="middle" style="font:500 9px var(--f-ui);fill:var(--muted)">' + (o.sub || "") + "</text></svg>";
  };
  window.spark = function (vals, color) {
    var w = 90, h = 28, max = Math.max.apply(null, vals), min = Math.min.apply(null, vals);
    var pts = vals.map(function (v, i) { return (i * w / (vals.length - 1)).toFixed(1) + "," + (h - 3 - (v - min) / (max - min || 1) * (h - 6)).toFixed(1); }).join(" ");
    return '<svg viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '" aria-hidden="true"><polyline points="' + pts + '" fill="none" style="stroke:' + (color || "var(--primary)") + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  };

  /* ---------- code highlighter (Java / JS flavoured) ---------- */
  var KW = "public|private|protected|class|return|new|final|static|void|if|else|try|catch|throw|throws|import|package|extends|implements|interface|this|null|true|false|const|let|var|function|async|await";
  var RE = new RegExp("(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|(\"(?:\\\\.|[^\"\\\\])*\")|(@[A-Za-z_]\\w*)|\\b(" + KW + ")\\b|\\b(\\d+(?:\\.\\d+)?)\\b|\\b([A-Z]\\w*)\\b|\\b([a-z_]\\w*)(?=\\()", "g");
  var CL = [null, "tk-c", "tk-s", "tk-a", "tk-k", "tk-n", "tk-t", "tk-f"];
  window.highlight = function (code, hlLines) {
    hlLines = hlLines || [];
    return code.split("\n").map(function (line, idx) {
      var out = "", last = 0, m; RE.lastIndex = 0;
      while ((m = RE.exec(line))) {
        out += esc(line.slice(last, m.index));
        var k = 1; while (!m[k]) k++;
        out += '<span class="' + CL[k] + '">' + esc(m[0]) + "</span>"; last = RE.lastIndex;
        if (m[0].length === 0) RE.lastIndex++;
      }
      out += esc(line.slice(last));
      return '<span class="ln' + (hlLines.indexOf(idx + 1) > -1 ? " hl" : "") + '" data-n="' + (idx + 1) + '">' + (out || " ") + "</span>";
    }).join("");
  };
  window.codeBlock = function (o) {
    return '<figure class="cb"><div class="top"><span class="dots"><i></i><i></i><i></i></span><span class="fn">' + esc(o.file || "") + '</span><span class="lang" data-act="langmenu">' + esc(o.lang || "Java") + " " + ico("chevd", 12) + '</span><button class="copy" type="button" data-act="copy">' + ico("copy", 14) + ' <span>Copy</span></button></div><pre><code>' + highlight(o.code, o.hl) + "</code></pre>" + (o.extra || "") + "</figure>";
  };
})();
