/* The Layer Stack scene (option D), mounted into any element. Returns { dispose }.
   opts: dark (palette for dark backgrounds), labels (show layer names), names */
(function () {
  "use strict";
  window.mountStack = function (host, opts) {
    opts = opts || {};
    var dark = !!opts.dark, names = opts.names || ["React", "API gateway", "Spring Boot", "AI Integrations", "Agents", "Database"];
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      var note = document.createElement("div"); note.className = "nogl"; note.textContent = "3D preview needs WebGL"; host.appendChild(note);
      return { dispose: function () {} };
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    scene.add(new THREE.AmbientLight(0xffffff, dark ? 0.7 : 0.85));
    var key = new THREE.DirectionalLight(0xffffff, dark ? 1.0 : 1.15); key.position.set(4, 8, 5); scene.add(key);
    var fill = new THREE.DirectionalLight(0xaec0ff, 0.5); fill.position.set(-6, 2, -3); scene.add(fill);

    var stack = new THREE.Group(); scene.add(stack);
    var defs = dark
      ? [[0x5c74ff, 0xa9b6ff, 0x0b0f1c], [0x2a3350, 0x56628a, 0x9fb0e8], [0xff7a5c, 0xffb3a1, 0x0b0f1c], [0xa78bfa, 0xd3c6ff, 0x0b0f1c], [0x2dd4bf, 0x99f0e4, 0x0b0f1c], [0xdde3f5, 0xaab4d4, 0x0b0f1c]]
      : [[0x2f4bff, 0x8fa0ff, 0x0d1220], [0x0d1220, 0x4b5672, 0x8a97c0], [0xff5a36, 0xffa58f, 0x0d1220], [0x8b6cf0, 0xc4b5fa, 0x0d1220], [0x12b5a0, 0x8fe3d6, 0x0d1220], [0xf6f8ff, 0xc9d1e6, 0x0d1220]];
    var slabGeo = new THREE.BoxGeometry(3.5, 0.5, 3.5), edgeGeo = new THREE.EdgesGeometry(slabGeo), stud = new THREE.BoxGeometry(0.55, 0.14, 0.55);
    var slabs = defs.map(function (d) {
      var g = new THREE.Group();
      g.add(new THREE.Mesh(slabGeo, new THREE.MeshStandardMaterial({ color: d[0], roughness: 0.5, metalness: 0.05 })));
      g.add(new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: d[2] })));
      var sm = new THREE.MeshStandardMaterial({ color: d[1], roughness: 0.55 }), x, z;
      for (x = -1; x <= 1; x++) for (z = -1; z <= 1; z++) { var s = new THREE.Mesh(stud, sm); s.position.set(x * 0.95, 0.32, z * 0.95); g.add(s); }
      stack.add(g); return g;
    });
    var shadow = new THREE.Mesh(new THREE.CircleGeometry(2.8, 48), new THREE.MeshBasicMaterial({ color: dark ? 0x000000 : 0x0d1220, transparent: true, opacity: dark ? 0.35 : 0.12 }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -3.6; scene.add(shadow);

    var rnd = window.rng(9), orbit = [], i, cg = new THREE.BoxGeometry(0.28, 0.28, 0.28);
    for (i = 0; i < 12; i++) {
      var cm = new THREE.Mesh(cg, new THREE.MeshStandardMaterial({ color: i % 2 ? (dark ? 0x7088ff : 0x2f4bff) : (dark ? 0xff7a5c : 0xff5a36), roughness: 0.5 }));
      scene.add(cm); orbit.push({ m: cm, r: 3.5 + rnd() * 1.0, a: rnd() * 6.283, s: 0.15 + rnd() * 0.25, y: (rnd() - 0.5) * 5.4, p: rnd() * 6.283 });
    }

    var labels = [];
    if (opts.labels !== false) names.forEach(function (n) { var d = document.createElement("div"); d.className = "lab3d"; d.textContent = n; host.appendChild(d); labels.push(d); });

    var W = 1, H = 1, gap = 0.2, hovering = false, mo = { x: 0, y: 0, sx: 0, sy: 0 }, v = new THREE.Vector3(), raf = 0, alive = true, last = performance.now(), t0 = last;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function layout() {
      var r = host.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false);
      var aspect = W / H, s = (aspect >= 1 ? 1.12 : 1.12 / Math.max(0.55, aspect) * 0.9);
      camera.position.set(9, 8, 11.6).multiplyScalar(s); camera.lookAt(0, 0.2, 0);
      camera.aspect = aspect;
      if (labels.length && aspect > 0.9) camera.setViewOffset(W, H, W * 0.09, 0, W, H); else camera.clearViewOffset();
      camera.updateProjectionMatrix();
      if (reduce) draw(3, 0);
    }
    function draw(t, dt) {
      mo.sx += (mo.x - mo.sx) * 0.07; mo.sy += (mo.y - mo.sy) * 0.07;
      var target = 0.2 + (hovering ? 0.5 : 0.12 + 0.1 * Math.sin(t * 0.7));
      gap += (target - gap) * Math.min(1, dt * 5 || 1);
      stack.rotation.y = t * 0.28 + mo.sx * 0.6; stack.rotation.x = -mo.sy * 0.06;
      slabs.forEach(function (g, k) { g.position.y = ((slabs.length - 1) / 2 - k) * (0.5 + gap); });
      orbit.forEach(function (o) { var a = o.a + t * o.s; o.m.position.set(Math.cos(a) * o.r, o.y + Math.sin(t * 0.8 + o.p) * 0.2, Math.sin(a) * o.r); o.m.rotation.x = t * 0.5 + o.p; o.m.rotation.y = t * 0.4; });
      stack.updateMatrixWorld(true);
      var unit = H / (2 * Math.tan(camera.fov * Math.PI / 360) * camera.position.length());
      labels.forEach(function (el, k) {
        v.set(0, ((slabs.length - 1) / 2 - k) * (0.5 + gap), 0).applyMatrix4(stack.matrixWorld).project(camera);
        el.style.transform = "translate(" + ((v.x * 0.5 + 0.5) * W + unit * 2.6).toFixed(1) + "px," + ((-v.y * 0.5 + 0.5) * H).toFixed(1) + "px) translateY(-50%)";
      });
      renderer.render(scene, camera);
    }
    function loop(now) {
      if (!alive) return; raf = requestAnimationFrame(loop);
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (reduce || document.hidden) return;
      draw((now - t0) / 1000, dt);
    }
    function move(e) { var r = host.getBoundingClientRect(); mo.x = ((e.clientX - r.left) / r.width) * 2 - 1; mo.y = -(((e.clientY - r.top) / r.height) * 2 - 1); hovering = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; }
    window.addEventListener("pointermove", move);
    var ro = "ResizeObserver" in window ? new ResizeObserver(layout) : null; if (ro) ro.observe(host);
    layout(); draw(0.4, 0); raf = requestAnimationFrame(loop);
    return {
      dispose: function () {
        alive = false; cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); if (ro) ro.disconnect();
        scene.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { m.dispose(); }); });
        renderer.dispose(); if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        labels.forEach(function (l) { if (l.parentNode) l.parentNode.removeChild(l); });
      }
    };
  };
})();
