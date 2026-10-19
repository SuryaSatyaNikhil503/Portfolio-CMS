"use client";

// Layer Stack (Option D). Port of docs/design/prototype/hero3d.js.
// Client-only; loaded through HeroStack. Draws no text into the canvas (labels are plain DOM).
import { useEffect, useRef } from "react";
import * as THREE from "three";

export const STACK_LAYERS = ["React", "API gateway", "Spring Boot", "AI Integrations", "Agents", "Database"] as const;

// [slab colour, stud colour, edge colour] top to bottom, matching STACK_LAYERS
const LIGHT: ReadonlyArray<readonly [number, number, number]> = [
  [0x2f4bff, 0x8fa0ff, 0x0d1220], [0x0d1220, 0x4b5672, 0x8a97c0], [0xff5a36, 0xffa58f, 0x0d1220],
  [0x8b6cf0, 0xc4b5fa, 0x0d1220], [0x12b5a0, 0x8fe3d6, 0x0d1220], [0xf6f8ff, 0xc9d1e6, 0x0d1220],
];
const DARK: ReadonlyArray<readonly [number, number, number]> = [
  [0x5c74ff, 0xa9b6ff, 0x0b0f1c], [0x2a3350, 0x56628a, 0x9fb0e8], [0xff7a5c, 0xffb3a1, 0x0b0f1c],
  [0xa78bfa, 0xd3c6ff, 0x0b0f1c], [0x2dd4bf, 0x99f0e4, 0x0b0f1c], [0xdde3f5, 0xaab4d4, 0x0b0f1c],
];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Props {
  dark: boolean;
  labels: boolean;
  names?: readonly string[];
}

export default function StackScene({ dark, labels, names = STACK_LAYERS }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      // Match the approved prototype (three r128, linear colour pipeline).
      THREE.ColorManagement.enabled = false;
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // no WebGL: the page text beside the scene is server-rendered and complete
    }
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    host.insertBefore(renderer.domElement, host.firstChild);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    // Physically based lights are ~1/pi of the legacy ones the prototype was tuned with.
    scene.add(new THREE.AmbientLight(0xffffff, (dark ? 0.7 : 0.85) * Math.PI));
    const key = new THREE.DirectionalLight(0xffffff, (dark ? 1.0 : 1.15) * Math.PI);
    key.position.set(4, 8, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xaec0ff, 0.5 * Math.PI);
    fill.position.set(-6, 2, -3);
    scene.add(fill);

    const stack = new THREE.Group();
    scene.add(stack);
    const defs = dark ? DARK : LIGHT;
    const slabGeo = new THREE.BoxGeometry(3.5, 0.5, 3.5);
    const edgeGeo = new THREE.EdgesGeometry(slabGeo);
    const studGeo = new THREE.BoxGeometry(0.55, 0.14, 0.55);
    const slabs = defs.map(([slab, stud, edge]) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(slabGeo, new THREE.MeshStandardMaterial({ color: slab, roughness: 0.5, metalness: 0.05 })));
      g.add(new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: edge })));
      const studMat = new THREE.MeshStandardMaterial({ color: stud, roughness: 0.55 });
      for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
          const s = new THREE.Mesh(studGeo, studMat);
          s.position.set(x * 0.95, 0.32, z * 0.95);
          g.add(s);
        }
      }
      stack.add(g);
      return g;
    });
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(2.8, 48),
      new THREE.MeshBasicMaterial({ color: dark ? 0x000000 : 0x0d1220, transparent: true, opacity: dark ? 0.35 : 0.12 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -3.6;
    scene.add(shadow);

    const rnd = mulberry32(9);
    const cubeGeo = new THREE.BoxGeometry(0.28, 0.28, 0.28);
    const orbit = Array.from({ length: 12 }, (_, i) => {
      const color = i % 2 ? (dark ? 0x7088ff : 0x2f4bff) : dark ? 0xff7a5c : 0xff5a36;
      const m = new THREE.Mesh(cubeGeo, new THREE.MeshStandardMaterial({ color, roughness: 0.5 }));
      scene.add(m);
      return { m, r: 3.5 + rnd() * 1.0, a: rnd() * 6.283, s: 0.15 + rnd() * 0.25, y: (rnd() - 0.5) * 5.4, p: rnd() * 6.283 };
    });

    const mo = { x: 0, y: 0, sx: 0, sy: 0 };
    const v = new THREE.Vector3();
    let W = 1, H = 1, gap = 0.2, hovering = false, raf = 0, visible = true;
    const t0 = performance.now();
    let last = t0;

    const layout = () => {
      const r = host.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      renderer.setSize(W, H, false);
      const aspect = W / H;
      const s = aspect >= 1 ? 1.12 : (1.12 / Math.max(0.55, aspect)) * 0.9;
      camera.position.set(9, 8, 11.6).multiplyScalar(s);
      camera.lookAt(0, 0.2, 0);
      camera.aspect = aspect;
      if (labels && aspect > 0.9) camera.setViewOffset(W, H, W * 0.09, 0, W, H);
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
      draw(3, 0);
    };

    function draw(t: number, dt: number) {
      mo.sx += (mo.x - mo.sx) * 0.07;
      mo.sy += (mo.y - mo.sy) * 0.07;
      const target = 0.2 + (hovering ? 0.5 : 0.12 + 0.1 * Math.sin(t * 0.7));
      gap += (target - gap) * Math.min(1, dt * 5 || 1);
      stack.rotation.y = t * 0.28 + mo.sx * 0.6;
      stack.rotation.x = -mo.sy * 0.06;
      const mid = (slabs.length - 1) / 2;
      slabs.forEach((g, k) => { g.position.y = (mid - k) * (0.5 + gap); });
      for (const o of orbit) {
        const a = o.a + t * o.s;
        o.m.position.set(Math.cos(a) * o.r, o.y + Math.sin(t * 0.8 + o.p) * 0.2, Math.sin(a) * o.r);
        o.m.rotation.x = t * 0.5 + o.p;
        o.m.rotation.y = t * 0.4;
      }
      stack.updateMatrixWorld(true);
      const unit = H / (2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.length());
      labelRefs.current.forEach((el, k) => {
        if (!el) return;
        v.set(0, (mid - k) * (0.5 + gap), 0).applyMatrix4(stack.matrixWorld).project(camera);
        el.style.transform = `translate(${((v.x * 0.5 + 0.5) * W + unit * 2.6).toFixed(1)}px,${((-v.y * 0.5 + 0.5) * H).toFixed(1)}px) translateY(-50%)`;
      });
      renderer.render(scene, camera);
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (reduce || document.hidden || !visible) return;
      draw((now - t0) / 1000, dt);
    };
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      mo.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mo.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      hovering = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    };
    window.addEventListener("pointermove", move);
    const ro = new ResizeObserver(layout);
    ro.observe(host);
    const io = new IntersectionObserver((en) => { visible = en[0]?.isIntersecting ?? true; }, { threshold: 0.02 });
    io.observe(host);
    layout();
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      ro.disconnect();
      io.disconnect();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [dark, labels]);

  return (
    <div ref={hostRef} className="hero3d" aria-hidden="true">
      {labels &&
        names.map((n, i) => (
          <div key={n} className="lab3d" ref={(el) => { labelRefs.current[i] = el; }}>
            {n}
          </div>
        ))}
    </div>
  );
}
