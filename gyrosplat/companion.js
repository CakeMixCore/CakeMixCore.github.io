

try {


(function gsPetEngine() {
  "use strict";
  if (window.GSPet) return;
  const TAU = Math.PI * 2, VER = "1.0";
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const sm = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
  const io = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * u * (u * (6 * u - 15) + 10);
  const fin = v => typeof v === "number" && v === v && v !== Infinity && v !== -Infinity;
  const wrapA = a => { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; };
  const lerpA = (a, b, t) => a + wrapA(b - a) * t;
  let seed0 = (Date.now() ^ 0x9e3779b9) >>> 0;
  const rnd = () => { seed0 = (seed0 + 0x6D2B79F5) >>> 0; let t = seed0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const rr = (a, b) => a + (b - a) * rnd();
  const hash = (i, s) => { let h = Math.imul((i | 0) ^ 0x27d4eb2d, 0x165667b1) ^ Math.imul((s | 0) + 0x3c6ef372, 0x85ebca6b); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; return (h >>> 0) / 4294967296; };
  const noise = (x, s) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i, s || 0), hash(i + 1, s || 0), u) * 2 - 1; };
  const warn = (() => { const seen = new Set(); return (k, ...a) => { if (seen.has(k)) return; seen.add(k); try { console.warn("companion:", ...a); } catch (e) {} }; })();


  const backOut = (t, k) => { const c1 = 1.70158 * (k == null ? 1 : k), c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const backIn = (t, k) => { const c1 = 1.70158 * (k == null ? 1 : k), c3 = c1 + 1; return c3 * t * t * t - c1 * t * t; };
  const backInOut = (t, k) => { const c2 = 1.70158 * (k == null ? 1 : k) * 1.525; return t < 0.5 ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2 : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2; };
  const bounceOut = t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) { t -= 1.5 / d; return n * t * t + 0.75; } if (t < 2.5 / d) { t -= 2.25 / d; return n * t * t + 0.9375; } t -= 2.625 / d; return n * t * t + 0.984375; };
  const ease = {
    linear: t => clamp(t, 0, 1),
    in: t => { t = clamp(t, 0, 1); return t * t * t; },
    out: t => { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); },
    inOut: t => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    sine: t => { t = clamp(t, 0, 1); return -(Math.cos(Math.PI * t) - 1) / 2; },
    smooth: t => sm(t),
    smoother: t => io(t),
    back: (t, k) => backOut(clamp(t, 0, 1), k),
    backIn: (t, k) => backIn(clamp(t, 0, 1), k),
    backInOut: (t, k) => backInOut(clamp(t, 0, 1), k),
    elastic: t => { t = clamp(t, 0, 1); if (t === 0 || t === 1) return t; return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * TAU / 3) + 1; },
    bounce: t => bounceOut(clamp(t, 0, 1)),
    anticipate: (t, k) => { t = clamp(t, 0, 1); k = k == null ? 0.18 : k; return t < 0.28 ? -k * sm(t / 0.28) : lerp(-k, 1, 1 - Math.pow(1 - (t - 0.28) / 0.72, 3)); }
  };
  const util = {
    clamp, lerp, mix: lerp, smooth: sm, smoother: io, noise,
    pulse: (t, a, b) => t <= a || t >= b ? 0 : Math.sin(Math.PI * (t - a) / (b - a)),
    hold: (t, a, b, c, d) => t <= a || t >= d ? 0 : t < b ? sm((t - a) / (b - a)) : t <= c ? 1 : 1 - sm((t - c) / (d - c)),
    env: (t, a, d) => sm(t / Math.max(1e-6, a)) * (1 - sm((t - 1 + d) / Math.max(1e-6, d))),
    wave: (t, n, ph) => Math.sin(TAU * (n * t + (ph || 0))),
    decay: (t, n, k) => t <= 0 || t >= 1 ? 0 : Math.sin(TAU * n * t) * Math.exp(-(k == null ? 4 : k) * t) * (1 - t),
    arc: (t, h) => 4 * h * clamp(t, 0, 1) * (1 - clamp(t, 0, 1)),
    lag: (t, d) => clamp((t - d) / Math.max(1e-6, 1 - d), 0, 1),
    stagger: (t, i, n, spread) => clamp((t - spread * i / Math.max(1, n - 1)) / Math.max(1e-6, 1 - spread), 0, 1),
    keys: (t, list) => { if (!list || !list.length) return 0; if (t <= list[0][0]) return list[0][1]; for (let i = 1; i < list.length; i++) { const a = list[i - 1], b = list[i]; if (t <= b[0]) { const f = b[2] ? (typeof b[2] === "function" ? b[2] : ease[b[2]] || sm) : sm; return lerp(a[1], b[1], f((t - a[0]) / Math.max(1e-6, b[0] - a[0]))); } } return list[list.length - 1][1]; },
    angle: (dx, dy) => Math.atan2(dy, dx),
    wrap: wrapA
  };
  const PRINCIPLES = { "squash-stretch": "squash and stretch", anticipation: "anticipation", staging: "staging", "straight-ahead": "straight ahead action", "pose-to-pose": "pose to pose", "follow-through": "follow through", overlapping: "overlapping action", "slow-in-out": "slow in and slow out", arcs: "arcs", "secondary-action": "secondary action", timing: "timing", exaggeration: "exaggeration", "solid-drawing": "solid drawing", appeal: "appeal" };


  const PARTS = ["disc", "orbit", "lower", "line", "top", "bottom", "core0", "core1", "core2"];
  const AGG = { cores: ["core0", "core1", "core2"], band: ["lower", "line"], poles: ["top", "bottom"] };
  const PK = ["x", "y", "rot", "scale", "sq", "sqa", "melt", "alpha"];
  const POLEK = ["root", "len", "bend", "tip", "aim"];
  const XK = { disc: ["drop"], orbit: ["spin"], lower: ["spin", "open"], band: ["spin", "open"], top: POLEK, bottom: POLEK, poles: POLEK };
  const GK = ["x", "y", "rot", "tilt", "sq", "sqa", "scale", "alpha", "turn", "spread", "morph", "aimX", "aimY"];
  const EK = ["x", "y", "gaze", "narrow", "lid", "lidTilt", "glow", "size", "droop", "fire", "spin"];
  const RK = ["len", "width"];
  const ALLP = PARTS.concat(Object.keys(AGG));
  const RANGE = { tilt: [-1.2, 1.2], scale: [-1.2, 0.8], alpha: [-1, 0], spread: [0, 1.5], morph: [0, 1], aimX: [-2000, 2000], aimY: [-2000, 2000],
    eye: { x: [-1.5, 1.5], y: [-1.5, 1.5], gaze: [-1, 0], narrow: [-1, 1], lid: [0, 1], lidTilt: [-1, 1], glow: [-1, 1.5], size: [-0.6, 0.6], droop: [0, 1], fire: [0, 1] },
    reach: { len: [0, 1], width: [-0.5, 0.8] },
    part: { x: [-160, 160], y: [-160, 160], scale: [-1.5, 1], melt: [0, 1], alpha: [-1, 0], drop: [-1, 1], open: [-2.5, 1.2], len: [-0.8, 2.5], bend: [-1, 1], tip: [0, 1], aim: [0, 1] } };
  const blank = () => { const o = {}; GK.forEach(k => { o[k] = 0; }); o.eye = {}; EK.forEach(k => { o.eye[k] = 0; }); o.reach = {}; RK.forEach(k => { o.reach[k] = 0; });
    ALLP.forEach(p => { const q = {}; PK.forEach(k => { q[k] = 0; }); (XK[p] || []).forEach(k => { q[k] = 0; }); o[p] = q; }); return o; };
  const zero = o => { GK.forEach(k => { o[k] = 0; }); if (!o.eye || typeof o.eye !== "object") o.eye = {}; EK.forEach(k => { o.eye[k] = 0; }); if (!o.reach || typeof o.reach !== "object") o.reach = {}; RK.forEach(k => { o.reach[k] = 0; });
    ALLP.forEach(p => { let q = o[p]; if (!q || typeof q !== "object") { q = o[p] = {}; } PK.forEach(k => { q[k] = 0; }); (XK[p] || []).forEach(k => { q[k] = 0; }); }); };
  const channelList = () => { const L = []; GK.forEach(k => L.push(k)); EK.forEach(k => L.push("eye." + k)); RK.forEach(k => L.push("reach." + k)); ALLP.forEach(p => { PK.forEach(k => L.push(p + "." + k)); (XK[p] || []).forEach(k => L.push(p + "." + k)); }); return L; };


  const clips = new Map(), handlers = {}, forms = new Map(), LAYERS = ["base", "body", "eye", "over"];
  let packName = "";
  const errs = [];
  const fail = (what, e) => { errs.push({ what, error: String(e && e.message || e).slice(0, 200), t: Math.round(performance.now()) }); if (errs.length > 60) errs.shift(); warn("x" + what, what, e); };
  function clip(name, def) {
    if (typeof name !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) { warn("n" + name, "clip name must be lowercase words joined by dashes:", name); return false; }
    if (!def || typeof def.update !== "function") { warn("u" + name, "clip needs an update function:", name); return false; }
    const tags = Array.isArray(def.tags) ? def.tags.filter(t => typeof t === "string" && t) : [];
    if (!tags.length) warn("t" + name, "clip without tags:", name);
    const pr = Array.isArray(def.principles) ? def.principles.filter(p => typeof p === "string") : [];
    const bad = pr.filter(p => !PRINCIPLES[p]); if (bad.length) warn("p" + name, "unknown principles in", name, bad.join(", "));
    const layer = LAYERS.includes(def.layer) ? def.layer : tags.includes("base") ? "base" : tags.includes("blink") || tags.includes("eye") ? "eye" : "body";
    const d = { name, tags, layer, dur: Math.max(60, +def.dur || 1000), loop: !!def.loop, weight: def.weight == null ? 1 : Math.max(0, +def.weight || 0), when: typeof def.when === "function" ? def.when : null,
      principles: pr, update: def.update, start: typeof def.start === "function" ? def.start : null, end: typeof def.end === "function" ? def.end : null,
      fadeIn: def.fadeIn == null ? 160 : Math.max(0, +def.fadeIn || 0), fadeOut: def.fadeOut == null ? 220 : Math.max(0, +def.fadeOut || 0), cooldown: def.cooldown == null ? 5000 : Math.max(0, +def.cooldown || 0),
      form: typeof def.form === "string" ? def.form : null, cues: Array.isArray(def.cues) ? def.cues.filter(c => Array.isArray(c) && typeof c[1] === "function").map(c => [clamp(+c[0] || 0, 0, 1), c[1]]).sort((a, b) => a[0] - b[0]) : [],
      calm: !!def.calm, pack: packName, last: 0, plays: 0, ambient: tags.some(t => t === "idle" || t === "bored" || t === "read") };
    clips.set(name, d); return true;
  }
  function on(evt, fn) { if (typeof evt !== "string" || typeof fn !== "function") return false; (handlers[evt] = handlers[evt] || []).push(fn); return true; }
  function off(evt, fn) { const L = handlers[evt]; if (!L) return; const i = L.indexOf(fn); if (i >= 0) L.splice(i, 1); }
  const evlog = [];
  function emit(evt, data) { evlog.push({ e: evt, t: Math.round(performance.now()) }); if (evlog.length > 120) evlog.shift(); const L = handlers[evt]; if (!L) return; for (const fn of L.slice()) { try { fn(data || {}, api); } catch (e) { fail("handler " + evt, e); } } }
  function form(name, def) { if (typeof name !== "string" || !def || typeof def.place !== "function") { warn("f" + name, "form needs a place function:", name); return false; } forms.set(name, { place: def.place, n: def.n || 0 }); return true; }


  const ICON = {
    disc: 45, rim: 8, pole: 9, band: 10, lineW: 5, orbitW: 7,
    orbit: { r: 47, tau: Math.acos(23 / 47), roll: 38 * Math.PI / 180 },
    lower: { cx: 0.69, cy: -1.17, r: 55.53, sel: 23.28 / 55.53, roll: 2.75 * Math.PI / 180, a0: -3.6 * Math.PI / 180, a1: 200.9 * Math.PI / 180 },
    line: { dx: 2.92, dy: -6.67, r: 54.33, sel: 21.96 / 54.33, roll: 0.61 * Math.PI / 180, a0: 31.1 * Math.PI / 180, a1: 165.7 * Math.PI / 180 },
    cores: [[0, 0, 21, 15, -28 * Math.PI / 180], [3, -3, 14, 11, -28 * Math.PI / 180], [7, -7, 7, 6, 0]],
    eye: [3, -3], par: [4.5, 7, 9.5], depth: [0, 7, 13], ell: [12, 9, 5],
    foot: 61.5
  };

  const HP = ["top", "bottom", "disc", "orbit", "core0", "core1", "core2", "lower"];
  const HV = [[0, -42, 0.2, 2.6, 15, 0.6, 0.14, 2.6, 0.3], [0, 42, 0.2, 2.6, 15, 0.6, 0.14, 2.6, 0.3], [0, 0, 0.24, 0, 45, 1.6, 0, 1.9, 0.32], [0, 0, 1.1, 1.8, 47, 4, 0.06, 2.2, 0.3],
    [0, 0, 1.3, 1.9, 21, 4, 0.09, 2.4, 0.3], [3, -3, 1.6, 2, 14, 4.5, 0.1, 2.6, 0.3], [7, -7, 2, 2, 7, 5, 0.12, 2.8, 0.3], [0, 0, 0.85, 1.6, 55, 4, 0.05, 2, 0.3]];
  const LAGB = [0.34, 0.34, 0.05, 0.2, 0.12, 0.18, 0.24, 0.16];

  const SLV = 8, SLC = 2.5, OM = 23.6, OMC = 30.7, FG = 0.45, ZG = 0.3, ZH = 0.7, CQ = 0.1, ZP = 0.3, SLF = 300;
  const SLG = [[0, 1], [0, 1], [0, 1], [0.3, 1.15], [0.2, 1.5], [0.28, 1.8], [0.35, 2.2], [0.22, 0.95]];
  const SPA = [[1, 1, 0, 0], [1, 1, 0, 0], [1, 1.25, 3, 0], [1.3, 1.05, 6, 0.9], [1.15, 1.45, 8, -0.7], [1.55, 1.25, 8, 1.6], [1.9, 1.6, 8, -2.2], [0.85, 1.1, 5, 0.35]];
  const STI = [[1.5, 0.38, 1], [1.35, 0.38, -1], [1, 0, 0], [0.9, 0.2, 1], [1.3, 0.17, -1], [1.7, 0.24, 1], [2.1, 0.3, -1], [1, 0.12, 1]];
  const SSQ = [[1, 0, 0], [1, 0, 0], [1.7, 0.08, 1.57], [1.5, 0.1, 0.5], [2, 0.14, 0], [2.3, 0.16, 1], [2.6, 0.18, -0.8], [1.3, 0.07, 0.3]];
  const SPREAD = { top: [0, -24], bottom: [0, 24], disc: [0, 0], orbit: [-16, 12], lower: [0, 22], line: [0, 28], core0: [6, -6], core1: [12, -12], core2: [20, -20] };


  const hex = s => { s = String(s || "").trim(); if (s[0] === "#") { if (s.length === 4) s = "#" + s[1] + s[1] + s[2] + s[2] + s[3] + s[3]; return [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); } const m = s.match(/rgba?\(([^)]+)\)/); if (m) { const p = m[1].split(/[ ,/]+/).filter(Boolean).map(parseFloat); if (p.length >= 3) return p.slice(0, 3).map(v => Math.round(v)); } return null; };
  const mixc = (a, b, w) => [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w, a[2] + (b[2] - a[2]) * w];
  const rgba = (c, a) => "rgba(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + "," + (a == null ? 1 : Math.max(0, Math.min(1, a))).toFixed(3) + ")";
  const DEF_ICON = { ink: "#0B2238", disc: "#3A1C71", heat: [[0, "#6B2A7B"], [0.38, "#E0452B"], [0.72, "#F7931E"], [1, "#FFD23F"]], core: ["#E0452B", "#F7931E", "#FFD23F"] };
  let COL = null;
  function readColours() {
    let ic = null; try { ic = typeof cvdIcon === "function" ? cvdIcon() : null; } catch (e) { ic = null; } if (!ic || !ic.ink) ic = DEF_ICON;
    let dark = false; try { dark = typeof isDark === "function" ? isDark() : matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) { dark = false; }
    const cs = getComputedStyle(document.documentElement), v = n => hex(cs.getPropertyValue(n));
    const ink = hex(ic.ink) || [11, 34, 56], txt = v("--ink") || (dark ? [229, 234, 240] : [20, 24, 31]);
    COL = { dark, ink, disc: hex(ic.disc) || [58, 28, 113], heat: ic.heat.map(h => [h[0], hex(h[1]) || [255, 128, 0]]), core: ic.core.map(c => hex(c) || [255, 128, 0]),
      out: v("--out") || [224, 122, 66], in: v("--in") || [53, 179, 165], plate: v("--plate") || (dark ? [21, 28, 37] : [255, 255, 255]), text: txt,
      cvd: document.documentElement.getAttribute("data-cvd") || "" };
    COL.line = dark ? mixc(ink, txt, 0.4) : ink;
    COL.key = COL.cvd + (dark ? "d" : "l");
    grads = null;
  }
  const heatAt = s => { const H = COL.heat; s = clamp(s, 0, 1); let j = 0; while (j < H.length - 2 && s > H[j + 1][0]) j++; const a = H[j], b = H[j + 1]; return mixc(a[1], b[1], (s - a[0]) / Math.max(1e-6, b[0] - a[0])); };
  const colKey = (k, own) => { if (Array.isArray(k)) return k; if (typeof k !== "string") return own || COL.disc; if (k === "own") return own || COL.disc; if (k === "out") return COL.out; if (k === "in") return COL.in; if (k === "plate") return COL.plate; if (k === "disc") return COL.disc; if (k === "ink") return COL.line;
    if (k === "core0" || k === "core1" || k === "core2") return COL.core[+k[4]]; if (k.startsWith("heat:")) return heatAt(+k.slice(5) || 0); const h = hex(k); return h || own || COL.disc; };


  const Mm = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
  const Mt = (x, y) => [1, 0, 0, 1, x, y];
  const Mr = a => { const c = Math.cos(a), s = Math.sin(a); return [c, s, -s, c, 0, 0]; };
  const Ms = (x, y) => [x, 0, 0, y == null ? x : y, 0, 0];
  const Mq = (p, q) => { const s = Math.hypot(p, q); if (s < 1e-7) return [1, 0, 0, 1, 0, 0]; const ch = Math.cosh(s), sh = Math.sinh(s) / s; return [ch - sh * p, sh * q, sh * q, ch + sh * p, 0, 0]; };
  const Mp = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  const Mab = (m, x, y) => Mm(Mt(x, y), Mm(m, Mt(-x, -y)));
  const Minv = m => { const det = m[0] * m[3] - m[1] * m[2] || 1e-9, a = m[3] / det, b = -m[1] / det, c = -m[2] / det, d = m[0] / det; return [a, b, c, d, -(a * m[4] + c * m[5]), -(b * m[4] + d * m[5])]; };
  const sqpq = (sq, sqa) => [sq * Math.cos(2 * sqa), sq * Math.sin(2 * sqa)];


  let S = null, grads = null;
  const TUNE = { visitChance: 0.4, visitCooldown: 22000, clingChance: 0.55, idleMin: 2600, idleMax: 6800, napAfter: 150000, moveTap: 7, moveTapTouch: 12, tapMs: 260, pushMs: 500, freeMs: 2800, throwMin: 280 };
  const ctx = { now: 0, dt: 16, t: 0, mode: "off", state: "off", stateMs: 0, small: false, reduced: false, touch: false, theme: "light", cvd: "",
    view: { w: 0, h: 0 }, safe: { top: 0, right: 0, bottom: 0, left: 0 }, size: { unit: 0.594, r: 29, icon: 76 },
    body: { x: 0, y: 0, vx: 0, vy: 0, speed: 0, rot: 0, ground: false, wall: null, peek: false, home: { x: 0, y: 0 } },
    pointer: { x: -1, y: -1, vx: 0, vy: 0, speed: 0, type: "", down: false, idleMs: 1e9, near: 1e9, over: "none", on: false },
    press: null, focus: { kind: "none", x: 0, y: 0, dx: 0, dy: 0, d: 1e9 }, read: null, slider: null, figure: null,
    scroll: { vy: 0, ms: 1e9, fast: false }, flick: { ms: 1e9, speed: 0, count: 0, dizzy: 0 }, impact: { ms: 1e9, side: null, speed: 0 },
    idleMs: 0, game: null };


  function sizeClass() {
    const w = innerWidth, coarse = matchMedia("(pointer: coarse)").matches && !matchMedia("(any-pointer: fine)").matches, small = w < 600 || coarse;
    const icon = small ? (w < 400 ? 58 : 64) : 76, unit = icon / 128;
    return { small, icon, unit, CS: small ? 120 : 140, dprMax: small ? 2 : 3, thick: small ? 1.16 : 1, blobs: small ? 0.6 : 1, gentle: small ? 0.72 : 1, travel: small ? 0.7 : 1, hitR: Math.max(26, Math.round(icon * 0.42)), coarse };
  }


  function makeBlobs(f) {
    const out = [], n = k => Math.max(1, Math.round(k * f));
    const nr = n(12), ni = n(16);
    for (let i = 0; i < nr; i++) { const a = TAU * (i + 0.5) / nr; out.push({ p: "disc", kind: "rim", s: a, x: 45 * Math.cos(a), y: 45 * Math.sin(a), rx: 0.62 * TAU * 45 / nr, ry: 4.4, a: a + Math.PI / 2, c: "line" }); }
    const rb = 0.62 * Math.sqrt(Math.PI * 41 * 41 / ni), Rd = 41 - rb;
    for (let i = 0; i < ni; i++) { const r = Rd * Math.sqrt((i + 0.5) / ni), w = i * 2.39996; out.push({ p: "disc", kind: "in", x: r * Math.cos(w), y: r * Math.sin(w), rx: rb, ry: rb, a: 0, c: "disc" }); }
    const no = n(12); for (let i = 0; i < no; i++) { const a = TAU * (i + 0.5) / no; out.push({ p: "orbit", s: a, rx: 0.62 * TAU * 47 * 0.75 / no, ry: 3.6, c: "orbitheat" }); }
    const nl = n(9); for (let i = 0; i < nl; i++) out.push({ p: "lower", s: lerp(ICON.lower.a0, ICON.lower.a1, (i + 0.5) / nl), rx: 0.6 * 55 * (ICON.lower.a1 - ICON.lower.a0) / nl * 0.7, ry: 5, c: "line" });
    const nn = n(6); for (let i = 0; i < nn; i++) out.push({ p: "line", s: lerp(ICON.line.a0, ICON.line.a1, (i + 0.5) / nn), rx: 0.6 * 54 * (ICON.line.a1 - ICON.line.a0) / nn * 0.75, ry: 2.6, c: "lineheat" });
    const np = n(2); for (const p of ["top", "bottom"]) for (let i = 0; i < np; i++) out.push({ p, s: (i + 0.5) / np, rx: 15 / np * 0.7 + 3, ry: 4.5, c: "line" });
    for (let i = 0; i < 3; i++) { const c = ICON.cores[i]; out.push({ p: "core" + i, x: c[0], y: c[1], rx: c[2], ry: c[3], a: c[4], c: "core" + i }); }
    out.forEach((b, j) => { b.j = j; b.ph = hash(j, 7) * TAU; b.side = hash(j, 11) < 0.5 ? -1 : 1; });
    return out;
  }


  const api = {
    version: VER, principles: PRINCIPLES, ease, util,
    channels: channelList,
    toss: (vx, vy) => !!(api.debug && api.debug.flick(vx, vy)),
    clip, on, off, form,
    play: (name, opts) => { if (!S || !S.on) return false; const d = clips.get(name); if (!d) return false; const it = startClip(d, Object.assign({ react: true }, opts || {})); if (it) { S.parked = false; kick(); } return !!it; },
    stopClip: name => { if (!S) return; S.active.forEach(it => { if (it.d.name === name) beginOut(it); }); },
    emit: (evt, data) => { if (typeof evt === "string" && /^[a-z][a-z0-9-]*$/.test(evt)) emit("x-" + evt, data); },
    fx: (kind, opts) => fx(kind, opts || {}),
    focus: (x, y, ms) => { if (!S) return; if (x == null) { S.override = null; return; } S.override = { x: +x || 0, y: +y || 0, until: S.now + (+ms || 1200) }; },
    clips: () => [...clips.keys()],
    clipInfo: name => { const d = clips.get(name); return d ? { name: d.name, tags: d.tags.slice(), layer: d.layer, dur: d.dur, loop: d.loop, weight: d.weight, principles: d.principles.slice(), form: d.form, pack: d.pack } : null; },
    mode: () => S && S.on ? S.mode : "off",
    start: mode => start(mode),
    stop: () => stop(),
    sleep: () => { if (S && S.on) goSleep(true); },
    game: null, debug: null
  };


  function startClip(d, opts) {
    if (!S) return null; opts = opts || {}; const now = S.now;
    if (d.layer !== "over") S.active.forEach(it => { if (it.d.layer === d.layer && it.out < 0 && it.d !== d) beginOut(it); });
    else { const ov = S.active.filter(it => it.d.layer === "over" && it.out < 0); if (ov.length >= 4) beginOut(ov[0]); }
    const same = S.active.find(it => it.d === d && it.out < 0); if (same && d.loop) return same;
    if (same) beginOut(same);
    const it = { d, t0: now, out: -1, outW: 1, w: 0, t: 0, r: blank(), seed: rnd(), side: rnd() < 0.5 ? -1 : 1, play: ++d.plays, loops: 0, cue: 0, ms: opts.ms ? Math.max(60, +opts.ms) : 0, amp: opts.amp == null ? 1 : clamp(+opts.amp || 0, 0, 2), opts };
    it.info = { seed: it.seed, side: it.side, play: it.play, ms: 0, dur: d.dur, loops: 0, weight: 0, opts };
    d.last = now; S.lastIn[d.layer] = d.name; S.lastClip = d.name;
    S.active.push(it);
    if (d.start) { try { d.start(ctx, api, it.info); } catch (e) { fail("start " + d.name, e); } }
    emit("clip", { name: d.name, layer: d.layer });
    if (d.form) emit("morph", { form: d.form, phase: "start", clip: d.name });
    return it;
  }
  function beginOut(it) { if (!it || it.out >= 0) return; it.out = S ? S.now : 0; it.outW = it.w; }
  function want(tag, opts) {
    if (!S) return null; opts = opts || {}; const now = S.now, list = []; let tot = 0, last = null;
    for (const d of clips.values()) {
      if (!d.tags.includes(tag)) continue;
      if (opts.layer && d.layer !== opts.layer) continue;
      if (S.reduced && !d.calm && d.layer !== "eye" && d.layer !== "base") continue;
      if (!opts.force && d.last && now - d.last < d.cooldown) continue;
      if (d.when) { let ok = false; try { ok = !!d.when(ctx); } catch (e) { fail("when " + d.name, e); continue; } if (!ok) continue; }
      let wt = d.weight; if (S.bias) for (const t of d.tags) if (S.bias[t]) wt *= 1 + Math.max(0, S.bias[t]);
      if (!(wt > 0)) continue;
      if (S.lastIn[d.layer] === d.name) { last = [d, wt]; if (!opts.react) continue; wt *= 0.15; }
      list.push([d, wt]); tot += wt;
    }
    if (!list.length) return null;
    let x = rnd() * tot; for (const [d, wt] of list) { x -= wt; if (x <= 0) return startClip(d, opts); }
    return startClip(list[list.length - 1][0], opts);
  }
  const anyIn = layer => S.active.some(it => it.d.layer === layer && it.out < 0);
  function stopTag(tag) { S.active.forEach(it => { if (it.d.tags.includes(tag)) beginOut(it); }); }


  const F = blank(), FS = {}; ["group"].concat(PARTS).forEach(p => { FS[p] = [0, 0]; });
  function clearF() { zero(F); for (const k in FS) { FS[k][0] = 0; FS[k][1] = 0; } }
  function addPose(r, w) {
    if (!(w > 0)) return;
    for (const k of GK) { if (k === "sq" || k === "sqa") continue; const v = r[k]; if (v && fin(v)) F[k] += w * v; }
    if (r.sq && fin(r.sq)) { const pq = sqpq(r.sq, fin(r.sqa) ? r.sqa : 0); FS.group[0] += w * pq[0]; FS.group[1] += w * pq[1]; }
    const e = r.eye; if (e) for (const k of EK) { const v = e[k]; if (v && fin(v)) F.eye[k] += w * v; }
    const h = r.reach; if (h) for (const k of RK) { const v = h[k]; if (v && fin(v)) F.reach[k] += w * v; }
    for (const p of ALLP) { const q = r[p]; if (!q) continue; const T = AGG[p] || [p];
      for (const k in q) { if (k === "sq" || k === "sqa") continue; const v = q[k]; if (!v || !fin(v)) continue; for (const t of T) { const o = F[t]; if (k in o) o[k] += w * v; } }
      if (q.sq && fin(q.sq)) { const pq = sqpq(q.sq, fin(q.sqa) ? q.sqa : 0); for (const t of T) { FS[t][0] += w * pq[0]; FS[t][1] += w * pq[1]; } } }
  }
  function clampF() {
    for (const k in RANGE) { if (k === "eye" || k === "reach" || k === "part") continue; F[k] = clamp(F[k], RANGE[k][0], RANGE[k][1]); }
    for (const k in RANGE.eye) F.eye[k] = clamp(F.eye[k], RANGE.eye[k][0], RANGE.eye[k][1]);
    for (const k in RANGE.reach) F.reach[k] = clamp(F.reach[k], RANGE.reach[k][0], RANGE.reach[k][1]);
    for (const p of PARTS) { const o = F[p]; for (const k in RANGE.part) if (k in o) o[k] = clamp(o[k], RANGE.part[k][0], RANGE.part[k][1]); }
    for (const k in FS) { const s = Math.hypot(FS[k][0], FS[k][1]); if (s > 0.8) { FS[k][0] *= 0.8 / s; FS[k][1] *= 0.8 / s; } }
  }
  function runClips(now) {
    const yieldEye = S.fk === "pointer" || S.fk === "touch" || S.fk === "press" || S.fk === "slider" || S.fk === "figure";
    for (let i = S.active.length - 1; i >= 0; i--) {
      const it = S.active[i], d = it.d, el = now - it.t0, u = el / d.dur;
      let t; if (d.loop) { t = u - Math.floor(u); const L = Math.floor(u); if (L > it.loops) { it.loops = L; it.cue = 0; } } else t = Math.min(1, u);
      if (it.out < 0 && ((!d.loop && u >= 1) || (it.ms && el >= it.ms))) beginOut(it);
      let w = d.fadeIn > 0 ? sm(el / d.fadeIn) : 1;
      if (it.out >= 0) { const k = d.fadeOut > 0 ? 1 - sm((now - it.out) / d.fadeOut) : 0; w = Math.min(w, it.outW * k); if (k <= 0 || w <= 0.0005) { S.active.splice(i, 1); if (d.end) { try { d.end(ctx, api, it.info); } catch (e) { fail("end " + d.name, e); } } emit("clipend", { name: d.name }); if (d.form) emit("morph", { form: d.form, phase: "end", clip: d.name }); continue; } }
      it.w = w; it.t = t;
      while (it.cue < d.cues.length && d.cues[it.cue][0] <= t && it.out < 0) { const c = d.cues[it.cue++]; try { c[1](ctx, api, it.info); } catch (e) { fail("cue " + d.name, e); } }
      zero(it.r); const inf = it.info; inf.ms = el; inf.loops = it.loops; inf.weight = w;
      try { d.update(t, it.r, ctx, inf); } catch (e) { fail("update " + d.name, e); S.active.splice(i, 1); continue; }
      if (yieldEye && d.ambient) { const e = it.r.eye; e.gaze *= 0.25; e.x *= 0.25; e.y *= 0.25; }
      addPose(it.r, w * it.amp);
      if (d.form && it.r.morph > 0) { const m = w * it.amp * it.r.morph; if (m > S.formW) { S.formW = m; S.form = d.form; } }
    }
  }


  function measure() {
    const L = S.lay, sx = scrollX, sy = scrollY; L.dirty = false; L.t = S.now;
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left + sx, t: r.top + sy, r: r.right + sx, b: r.bottom + sy, el: e }; };
    const blocks = [], figs = [], rights = [];
    document.querySelectorAll("main p, main li, main h2, main h3, main h4, main figcaption, main blockquote").forEach(e => { if (e.closest("dialog, nav, .gsp-layer")) return; const r = R(e); if (r.r - r.l < 40 || r.b - r.t < 6) return; r.k = e.tagName.toLowerCase(); blocks.push(r); if (!e.closest("figure, .plate")) rights.push(r.r - sx); });
    document.querySelectorAll("main figure, main .fig").forEach(e => { if (e.parentElement && e.parentElement.closest("figure, .fig")) return; const r = R(e); if (r.r - r.l < 60 || r.b - r.t < 40) return; figs.push(r); rights.push(r.r - sx); });
    blocks.sort((a, b) => a.t - b.t); figs.sort((a, b) => a.t - b.t);
    rights.sort((a, b) => a - b);
    L.blocks = blocks; L.figs = figs; L.colR = rights.length ? rights[Math.min(rights.length - 1, Math.floor(rights.length * 0.92))] : innerWidth - 16;
    const toc = document.querySelector("nav.toc"); L.toc = null; if (toc) { const r = toc.getBoundingClientRect(); if (r.width && r.height) L.toc = { l: r.left, t: r.top, r: r.right, b: r.bottom }; }
  }
  function readTarget() {
    const L = S.lay, H = innerHeight, y0 = 0.4 * H + scrollY; let best = null, bd = 1e9;
    const A = L.blocks; let lo = 0, hi = A.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (A[m].t < y0 - 400) lo = m + 1; else hi = m; }
    for (let i = Math.max(0, lo - 2); i < A.length && A[i].t < y0 + 500; i++) { const b = A[i]; const d = y0 < b.t ? b.t - y0 : y0 > b.b ? y0 - b.b : 0; if (d < bd) { bd = d; best = b; } }
    for (const f of L.figs) { if (f.t > y0 + 400 || f.b < y0 - 400) continue; const d = y0 < f.t ? f.t - y0 : y0 > f.b ? y0 - f.b : 0; if (d < bd - 20) { bd = d; best = f; best.k = "figure"; } }
    return best && bd < H * 0.45 ? best : null;
  }


  const isCtl = el => !!(el && el.closest && el.closest("button, a[href], input, select, textarea, summary, label, [role=button], [role=slider], [role=tab], [role=switch], [contenteditable], .g5P-dot"));
  const sliderOf = el => el && el.closest ? el.closest("input[type=range], [role=slider]") : null;
  const figOf = el => { if (!el || !el.closest) return null; const f = el.closest("figure, .fig"); if (f) return f; return el.tagName === "CANVAS" && !el.closest(".gsp-layer") ? el.parentElement : null; };
  const classify = el => { if (!el || !el.closest || el.closest(".gsp-layer")) return "none"; if (sliderOf(el)) return "slider"; if (isCtl(el)) return "control"; if (figOf(el)) return "figure"; if (el.closest("p, li, h1, h2, h3, h4, figcaption, blockquote, td, th")) return "text"; return "none"; };
  function sensors(add) {
    const f = add ? "addEventListener" : "removeEventListener", W = window, o = { passive: true }, oc = { passive: true, capture: true };
    W[f]("pointermove", onMove, o); W[f]("pointerdown", onDown, oc); W[f]("pointerup", onUp, oc); W[f]("pointercancel", onUp, oc);
    W[f]("touchmove", onTouchMove, o); W[f]("scroll", onScroll, o); W[f]("keydown", onKey, o); W[f]("resize", onResize, o);
    document[f]("visibilitychange", onVis); document[f]("input", onInput, oc);
  }
  function activity() { if (!S) return; S.lastAct = S.now || performance.now(); if (S.st === "sleep" && S.nap) wakeUp(); }
  function onMove(e) {
    if (!S || !S.on) return; const now = performance.now(), P = S.ptr, x = e.clientX, y = e.clientY;
    if (!e.isPrimary && e.pointerType === "touch") return;
    const dt = Math.max(1, now - P.t), dx = x - P.x, dy = y - P.y, had = P.t > 0 && now - P.t < 150 && P.type === e.pointerType;
    if (had) { const k = 1 - Math.exp(-dt / 50); P.vx += (dx / dt * 1000 - P.vx) * k; P.vy += (dy / dt * 1000 - P.vy) * k; } else { P.vx = 0; P.vy = 0; }
    const px = P.x, py = P.y; P.x = x; P.y = y; P.t = now; P.type = e.pointerType || "mouse"; P.moved = now;
    if (e.target !== P.el) { P.el = e.target; P.over = classify(e.target); P.fig = P.over === "figure" ? figOf(e.target) : P.over === "slider" ? null : P.over === "none" || P.over === "text" ? null : P.fig; if (P.over !== "figure") P.fig = null; }
    if (P.type !== "touch") { S.touch = false; activity(); }
    if (had && !S.pressId && P.type !== "touch") passOver(px, py, x, y, dt, P.type);
    if (S.sl && S.sl.id === e.pointerId) sliderTrack(x, y);
    if (P.fig && P.type !== "touch") { if (P.fig !== S.figEl) { S.figEl = P.fig; S.figT = now; S.figX = x; S.figY = y; } else if (Math.hypot(x - S.figX, y - S.figY) > 46) { S.figT = now; S.figX = x; S.figY = y; } } else if (P.type !== "touch" && S.figEl && !P.fig) { S.figEl = null; }
  }
  function onTouchMove(e) {
    if (!S || !S.on || S.pressId) return; const t = e.touches && e.touches[0]; if (!t) return; const now = performance.now(), T = S.tch;
    if (T.t && now - T.t < 260) passOver(T.x, T.y, t.clientX, t.clientY, Math.max(1, now - T.t), "touch");
    T.x = t.clientX; T.y = t.clientY; T.t = now; activity();
  }
  function onDown(e) {
    if (!S || !S.on) return; const now = performance.now(), x = e.clientX, y = e.clientY, tgt = e.target; activity();
    S.ptr.down = true; if (e.pointerType === "touch") { S.touch = true; S.tch.t = 0; }
    if (tgt && tgt.closest && tgt.closest(".gsp-layer")) return;
    const sl = sliderOf(tgt); if (sl) { sliderStart(sl, e); return; }
    const fg = figOf(tgt); if (fg) { if (e.pointerType === "touch") S.figPend = { el: fg, x, y, t: now, id: e.pointerId }; else { S.figEl = fg; S.figT = now - 2000; S.figX = x; S.figY = y; S.figTouch = false; S.figWork = now; } }
    S.tap = { x, y, t: now, type: e.pointerType };
    if (isCtl(tgt) && Math.hypot(x - S.B.x, y - S.B.y) < S.Z.icon * 1.6) dodge(x, y);
  }
  function onUp(e) {
    if (!S || !S.on) return; S.ptr.down = false;
    if (S.sl && S.sl.id === e.pointerId) sliderEnd();
    const fp = S.figPend; if (fp && fp.id === e.pointerId) { S.figPend = null; if (e.type === "pointerup" && !(S.scr.t > fp.t)) { const now = performance.now(); S.figEl = fp.el; S.figT = now - 2000; S.figX = fp.x; S.figY = fp.y; S.figTouch = true; S.figWork = now; } }
  }
  function onInput(e) { if (!S || !S.on) return; const el = e.target; if (S.sl && S.sl.el === el) sliderTrack(null, null); }
  function onScroll() {
    if (!S || !S.on) return; const now = performance.now(), y = scrollY, Sc = S.scr, dt = Math.max(8, now - Sc.t);
    if (now - Sc.t < 200) { const v = (y - Sc.y) / dt * 1000, k = 1 - Math.exp(-dt / 70); Sc.vy += (v - Sc.vy) * k; } else Sc.vy = 0;
    Sc.y = y; Sc.t = now; activity(); S.figEl = S.figTouch ? null : S.figEl;
  }
  function onKey(e) { if (!S || !S.on) return; if (e.key === "Escape" || e.key === "Esc") { if (S.st !== "press" && S.st !== "held") goSleep(true); return; } activity(); }
  function onResize() { if (!S || !S.on) return; S.lay.dirty = true; const z = sizeClass(); if (z.small !== S.Z.small || z.icon !== S.Z.icon) { S.Z = z; buildCanvas(); } S.B.x = clamp(S.B.x, -S.Z.icon, innerWidth + S.Z.icon); S.B.y = clamp(S.B.y, 0, innerHeight); readSafe(); }
  function onVis() { if (!S || !S.on) return; if (document.hidden) { if (S.raf) cancelAnimationFrame(S.raf); S.raf = 0; } else kick(); }


  const hv = new Float64Array(6 * 8), sl = new Float64Array(2 + 12 * 8), spend = [0, 0];
  let slMov = false, slNc = 0, slHard = false;
  function stirPush(i, du, dv, w, lx, ly) {
    const P = HV[i], o = 6 * i, om = TAU * P[7], X = S.capx;
    hv[o + 3] += P[2] * w * du; hv[o + 4] += P[2] * w * dv;
    if (P[3]) { const ll = Math.hypot(lx, ly), lm = 1.5 * P[4]; if (ll > lm) { lx *= lm / ll; ly *= lm / ll; } hv[o + 5] += P[3] * w * (lx * dv - ly * du) / (P[4] * P[4]); }
    const vm = 1.2 * P[5] * X * om, vl = Math.hypot(hv[o + 3], hv[o + 4]), am = 1.2 * P[6] * X * om; if (vl > vm) { hv[o + 3] *= vm / vl; hv[o + 4] *= vm / vl; } hv[o + 5] = clamp(hv[o + 5], -am, am);
    S.stirOn = true;
  }
  function stirVel(i, vx, vy, vr) { const o = 6 * i; hv[o + 3] += vx; hv[o + 4] += vy; hv[o + 5] += vr || 0; S.stirOn = true; }
  function stirStep(h) {
    if (!S.stirOn) return; const n = Math.max(1, Math.ceil(h / 0.004)), dt = h / n; let live = false;
    for (let i = 0; i < 8; i++) { const P = HV[i], o = 6 * i, om = TAU * P[7], k = om * om, cz = 2 * P[8] * om;
      for (let s = 0; s < n; s++) for (let d = 0; d < 3; d++) { hv[o + 3 + d] += dt * (-k * hv[o + d] - cz * hv[o + 3 + d]); hv[o + d] += dt * hv[o + 3 + d]; }
      if (Math.abs(hv[o]) > 0.02 || Math.abs(hv[o + 1]) > 0.02 || Math.abs(hv[o + 2]) > 4e-4 || Math.abs(hv[o + 3]) > 0.3 || Math.abs(hv[o + 4]) > 0.3 || Math.abs(hv[o + 5]) > 6e-3) live = true; }
    if (!live) { hv.fill(0); S.stirOn = false; }
  }
  function slKick(jx, jy) { if (!(Math.abs(jx) + Math.abs(jy) > 1e-6) || !S || S.reduced) return; spend[0] += jx; spend[1] += jy; const l = Math.hypot(spend[0], spend[1]); if (l > SLC) { spend[0] *= SLC / l; spend[1] *= SLC / l; } slMov = true; slHard = false; emit("gust", { strength: +Math.hypot(jx, jy).toFixed(3) }); }
  const slOsc = (o, w, z0, b, dt, kick, vm) => { const x = sl[o], v = sl[o + 1], z = z0 + (1 - z0) * (1 - sm(Math.hypot(x, v / w) / b)); sl[o + 1] = clamp(v + dt * (-w * w * x - 2 * z * w * v) + kick, -vm, vm); sl[o] = x + dt * sl[o + 1]; };
  function slStep(h) {
    if (!slMov) return; const n = Math.max(1, Math.ceil(h / 0.004)), dt = h / n;
    for (let s = 0; s < n; s++) { const q = 1 - Math.exp(-dt / 0.035), jx = spend[0] * q, jy = spend[1] * q; spend[0] -= jx; spend[1] -= jy;
      const jl = Math.hypot(jx, jy), ja = Math.atan2(jy, jx), d = sl[0] - TAU * Math.round(sl[0] / TAU), m = 1 - sm(Math.abs(d) / 0.7), w = TAU * FG * (1 + 2 * m), z0 = slHard ? ZH : ZG, z = z0 + (1 - z0) * m, w0 = sl[1];
      sl[1] = clamp(w0 + dt * (-w * w * d - 2 * z * w * w0 - CQ * Math.abs(w0) * w0) + OM * jx, -OMC, OMC); sl[0] += dt * sl[1]; const dw = sl[1] - w0, nn = Math.round(sl[0] / TAU); if (nn !== slNc) { slNc = nn; slHard = true; }
      for (let i = 0; i < 8; i++) { const o = 2 + 12 * i, Pa = SPA[i], Ti = STI[i], Sq = SSQ[i], wu = TAU * Pa[0], wv = TAU * Pa[1], wa = TAU * Ti[0], ws = TAU * Sq[0], cs = Math.cos(Pa[3]), sn = Math.sin(Pa[3]);
        if (SLG[i][0]) { const wt = TAU * SLG[i][1], x = sl[o], v = sl[o + 1], zt = ZP + (1 - ZP) * (1 - sm(Math.hypot(x, v / wt) / 0.05)); sl[o + 1] = v + dt * (-wt * wt * x - 2 * zt * wt * v) - SLG[i][0] * dw; sl[o] = x + dt * sl[o + 1]; }
        const gu = Pa[2] * wu / 0.6, gv = Pa[2] * wv / 0.6, ga = Ti[1] * wa / 0.6, gs = Sq[1] * ws / 0.6;
        slOsc(o + 2, wu, ZP, 1.2, dt, gu * (jx * cs - jy * sn), 2 * gu + 1e-9); slOsc(o + 4, wv, ZP, 1.2, dt, gv * (jx * sn + jy * cs), 2 * gv + 1e-9);
        slOsc(o + 6, wa, ZP, 0.03, dt, ga * Ti[2] * jx, 2 * ga + 1e-9);
        slOsc(o + 8, ws, ZP, 0.02, dt, gs * jl * Math.cos(2 * (ja + Sq[2])), 2 * gs + 1e-9); slOsc(o + 10, ws, ZP, 0.02, dt, gs * jl * Math.sin(2 * (ja + Sq[2])), 2 * gs + 1e-9); } }
    let live = Math.abs(sl[0] - TAU * Math.round(sl[0] / TAU)) > 1.5e-3 || Math.abs(sl[1]) > 0.03 || Math.abs(spend[0]) + Math.abs(spend[1]) > 1e-4;
    if (!live) for (let o = 2; o < sl.length; o += 2) { const e = (o - 2) % 12 === 2 || (o - 2) % 12 === 4 ? 0.06 : 1.5e-3; if (Math.abs(sl[o]) > e || Math.abs(sl[o + 1]) > 20 * e) { live = true; break; } }
    if (!live) { sl.fill(0); spend[0] = spend[1] = 0; slMov = false; slNc = 0; slHard = false; }
  }

  function passOver(x0, y0, x1, y1, dtMs, type) {
    if (!S || S.reduced || !S.G0) return; const Gi = Minv(S.G0), a = Mp(Gi, x0, y0), b = Mp(Gi, x1, y1);
    const du = b[0] - a[0], dv = b[1] - a[1], dl = Math.hypot(du, dv); if (dl < 1e-3) return;
    const ex = du / dl, ey = dv / dl, t = clamp(-(a[0] * ex + a[1] * ey), 0, dl), cx = a[0] + ex * t, cy = a[1] + ey * t, dmin = Math.hypot(cx, cy);
    if (dmin > 70) return;
    const W = S.Z.icon, crossPx = dl * S.Z.unit, v = crossPx / W / (dtMs / 1000);
    let su = du, sv = dv; if (dl > 16) { su *= 16 / dl; sv *= 16 / dl; }
    for (let i = 0; i < 8; i++) { let dm = 1e9; for (const bl of S.blobsRest) { if (bl.part !== HP[i] && !(HP[i] === "lower" && bl.part === "line")) continue; const d = Math.hypot(b[0] - bl.x, b[1] - bl.y) - Math.min(bl.rx, bl.ry); if (d < dm) dm = d; }
      const w = Math.exp(-((Math.max(0, dm) / 12) ** 2)); if (w < 0.01) continue; stirPush(i, su, sv, w, b[0] - HV[i][0], b[1] - HV[i][1]); }
    if (v > SLV && dmin < 52) { const j = Math.min(1.5, (v / SLV - 1) * Math.min(1, crossPx / W)); slKick(j * ex, type === "touch" ? 0 : j * ey); }
    if (!S.stirT || S.now - S.stirT > 900) { S.stirT = S.now; emit("stir", { type, fast: v > SLV }); if (S.st === "follow" || S.st === "sleep") S.wantStir = true; }
  }


  function sliderStart(el, e) {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el), vert = /vertical/.test(cs.writingMode || "") || r.height > r.width * 1.6;
    S.sl = { el, id: e.pointerId, vert, rtl: (cs.direction === "rtl"), r, x: e.clientX, y: e.clientY, dir: 1, t0: performance.now(), last: performance.now(), lastPos: vert ? e.clientY : e.clientX, val: el.value };
    sliderTrack(e.clientX, e.clientY); emit("slider", { phase: "start" });
    if (S.reduced || S.st === "sleep" && !S.nap) return;
    if (["follow", "travel", "visit", "assist"].includes(S.st)) setAssist();
  }
  function thumbOf() {
    const s = S.sl, el = s.el, r = s.r;
    if (el.tagName === "INPUT" && el.type === "range") { const mn = +el.min || 0, mx = el.max === "" ? 100 : +el.max, v = +el.value, f = mx > mn ? (v - mn) / (mx - mn) : 0.5, th = 16;
      if (s.vert) return [r.left + r.width / 2, r.top + th / 2 + (s.rtl ? 1 - f : f) * (r.height - th)];
      return [r.left + th / 2 + (s.rtl ? 1 - f : f) * (r.width - th), r.top + r.height / 2]; }
    return [clamp(s.x, r.left - 20, r.right + 20), clamp(s.y, r.top - 20, r.bottom + 20)];
  }
  function sliderTrack(x, y) {
    const s = S.sl; if (!s) return; if (x != null) { s.x = x; s.y = y; }
    s.r = s.el.getBoundingClientRect(); const th = thumbOf(), pos = s.vert ? th[1] : th[0], d = pos - s.lastPos;
    if (Math.abs(d) > 1.5) { s.dir = d > 0 ? 1 : -1; s.lastPos = pos; s.last = performance.now(); }
    s.tx = th[0]; s.ty = th[1];
  }
  function sliderEnd() { const s = S.sl; if (!s) return; S.sl = null; emit("slider", { phase: "end" }); if (S.st === "assist") { want("slider-done", { react: true, force: true }); S.assistEnd = S.now + 1100; } }
  function sliderSpot() {
    const s = S.sl, Z = S.Z, Rb = 49 * Z.unit; if (!s) return null;
    if (s.vert) { const side = s.r.right + Rb + 16 < innerWidth - 4 ? 1 : -1; return [s.tx + side * (Rb + 14), s.ty - s.dir * Rb * 0.7, side]; }
    return [s.tx - s.dir * Rb * 0.95, s.ty - Rb - 10, -s.dir];
  }
  function setAssist() { const sp = sliderSpot(); if (!sp) return; travelTo(sp[0], sp[1], { ms: clamp(200 + Math.hypot(sp[0] - S.B.x, sp[1] - S.B.y) * 0.3, 220, 480), h: 30, then: "assist", track: () => { const q = sliderSpot(); return q ? [q[0], q[1]] : null; } }); want("slider", { react: true, force: true }); }
  function figSpot() {
    const f = S.figEl; if (!f) return null; const r = f.getBoundingClientRect(), Z = S.Z, Rb = 49 * Z.unit, px = S.figX, py = S.figY;
    if (innerWidth - r.right > 2.4 * Rb + 10) return [r.right + (innerWidth - r.right) / 2, clamp(py, Rb + 20, innerHeight - Rb - 20)];
    const sx = px + (px > innerWidth / 2 ? -1 : 1) * (Rb * 1.9 + 24), sy = py - Rb * 1.4 - 18;
    return [clamp(sx, Rb + 8, innerWidth - Rb - 8), clamp(sy < 40 ? py + Rb * 1.6 + 18 : sy, Rb + 8, innerHeight - Rb - 8)];
  }
  function maybeVisit(now) {
    if (!S.figEl || S.st !== "follow" || S.reduced) return;
    const dwell = now - S.figT, worked = S.figWork && now - S.figWork < 1200;
    if (!(dwell > 950 || worked)) return;
    if (S.figVisitT && now - S.figVisitT < TUNE.visitCooldown) return;
    if (S.figAsk === S.figEl && now - S.figAskT < 8000) return;
    S.figAsk = S.figEl; S.figAskT = now; S.figWork = 0;
    if (rnd() > TUNE.visitChance) { S.glance = { x: S.figX, y: S.figY, until: now + 1300 }; return; }
    const sp = figSpot(); if (!sp) return; S.figVisitT = now; S.visit = { el: S.figEl, x: S.figX, y: S.figY, t0: now, morphAt: now + rr(900, 1600), morphed: false };
    travelTo(sp[0], sp[1], { then: "visit", h: 40 }); emit("figure", { phase: "visit", id: S.figEl.id || "" });
  }


  function readSafe() { const p = S.safeProbe; if (!p) return; const c = getComputedStyle(p); S.safe = { top: parseFloat(c.paddingTop) || 0, right: parseFloat(c.paddingRight) || 0, bottom: parseFloat(c.paddingBottom) || 0, left: parseFloat(c.paddingLeft) || 0 }; ctx.safe = S.safe; }
  function home() {
    const W = innerWidth, H = innerHeight, Z = S.Z, Rb = 49 * Z.unit, Rw = 60 * Z.unit, sf = S.safe, L = S.lay;
    const gap = W - sf.right - L.colR; let x, peek = false;
    if (gap >= 2 * Rw + 12) x = L.colR + Math.min(gap / 2, Rw + 30);
    else { peek = true; const show = S.emerge ? lerp(0.42, 0.78, S.emerge) : 0.42; x = W - sf.right + Rw - show * 2 * Rw; }
    let y = H * (Z.small ? 0.7 : 0.64);
    const rt = S.readY; if (rt != null && Math.abs(y - rt) < Rb * 2.4) y = rt + Rb * 2.6;
    if (L.toc && x + Rw > L.toc.l - 6 && y + Rb > L.toc.t - 10) y = L.toc.t - Rb - 22;
    y += S.dodgeY; y = clamp(y, sf.top + Rb + 12, H - sf.bottom - 61.5 * Z.unit - 10);
    return { x, y, peek };
  }
  function dodge(px, py) { const Z = S.Z, Rb = 49 * Z.unit, H = innerHeight; const dir = py > S.B.y ? -1 : 1; let d = dir * Rb * 3.2; if (S.B.y + d < Rb * 2 || S.B.y + d > H - Rb * 2) d = -d; S.dodgeY = d; S.dodgeUntil = S.now + 1800; if (S.st === "follow") want("dodge", { react: true }); emit("dodge", {}); }
  function checkUnder() {
    if (!S.hit || S.st !== "follow") return; const h = S.hit.style.pointerEvents; S.hit.style.pointerEvents = "none"; let hitCtl = false;
    try { const Rb = 49 * S.Z.unit; for (const [dx, dy] of [[0, 0], [-Rb * 0.7, 0], [0, -Rb * 0.7], [0, Rb * 0.7]]) { const x = S.B.x + dx, y = S.B.y + dy; if (x < 0 || x >= innerWidth || y < 0 || y >= innerHeight) continue; const e = document.elementFromPoint(x, y); if (isCtl(e) || sliderOf(e)) { hitCtl = true; break; } } } catch (e) {}
    S.hit.style.pointerEvents = h; if (hitCtl) { S.dodgeY = (S.dodgeY || 0) + (S.B.y > innerHeight / 2 ? -1 : 1) * 49 * S.Z.unit * 2.2; S.dodgeUntil = S.now + 6000; }
  }


  function sprB(tx, ty, om, z, h) {
    const B = S.B, n = Math.max(1, Math.ceil(h * om / 0.25)), d = h / n;
    for (let k = 0; k < n; k++) { B.vx += d * (om * om * (tx - B.x) - 2 * z * om * B.vx); B.vy += d * (om * om * (ty - B.y) - 2 * z * om * B.vy); B.x += d * B.vx; B.y += d * B.vy; } }
  function spr2(a, tx, ty, om, z, h) {
    const n = Math.max(1, Math.ceil(h * om / 0.25)), d = h / n;
    for (let k = 0; k < n; k++) { a[2] += d * (om * om * (tx - a[0]) - 2 * z * om * a[2]); a[3] += d * (om * om * (ty - a[1]) - 2 * z * om * a[3]); a[0] += d * a[2]; a[1] += d * a[3]; } }
  function setSt(name, data) { const old = S.st; if (old === name) return; S.st = name; S.stT = S.now; S.stD = data || {}; emit("state", { state: name, from: old }); }
  function travelTo(x, y, o) {
    o = o || {}; const B = S.B, dx = x - B.x, dy = y - B.y, d = Math.hypot(dx, dy), k = S.Z.travel;
    const D = o.ms || clamp(300 + d * 0.5 / Math.max(0.6, k), 320, 980);
    S.tr = { x0: B.x, y0: B.y, x1: x, y1: y, h: o.h != null ? o.h : clamp(d * 0.22, 12, 110) * k, t0: S.now, D, pre: o.pre != null ? o.pre : 110, then: o.then || "follow", track: o.track || null, dx: dx / (d || 1), dy: dy / (d || 1) };
    setSt("travel"); emit("travel", { x, y, ms: Math.round(D) });
  }
  function kickStrain(s, axis, vel) { const pq = sqpq(s, axis); S.sp[2] += pq[0] * (vel || 20); S.sp[3] += pq[1] * (vel || 20); }
  function impact(side, speed) {
    const now = S.now, B = S.B; ctx.impact.ms = 0; ctx.impact.side = side; ctx.impact.speed = speed; S.impT = now;
    const axis = side === "left" || side === "right" ? 0 : Math.PI / 2, amt = clamp(speed / 2600, 0.05, 0.55);
    kickStrain(amt, axis, 30); S.flare = Math.max(S.flare, clamp(speed / 1600, 0.2, 1.4));
    const nx = side === "left" ? -1 : side === "right" ? 1 : 0, ny = side === "top" ? -1 : side === "bottom" ? 1 : 0, kk = clamp(speed / 900, 0, 2.4) * S.Z.gentle;
    for (let i = 0; i < 8; i++) { const a = hash(i, Math.round(now)) * TAU, mag = (14 + 22 * hash(i, 3)) * kk; stirVel(i, nx * mag * 0.9 + Math.cos(a) * mag * 0.6, ny * mag * 0.9 + Math.sin(a) * mag * 0.6, (hash(i, 5) - 0.5) * 0.9 * kk); }
    if (side === "left" || side === "right") slKick(-nx * Math.min(1.2, speed / 2400), 0);
    S.dizzy = Math.min(2, S.dizzy + speed / 2200); S.hits.push(now);
    emit("impact", { side, speed: Math.round(speed) });
    if (speed > 520) { want("impact", { layer: "over", react: true, force: true }); fx("ring", { x: nx * 49 * S.Z.unit, y: ny * 49 * S.Z.unit, n: 1 }); fx("spark", { x: nx * 40 * S.Z.unit, y: ny * 40 * S.Z.unit, n: Math.round(clamp(speed / 300, 3, 9)), dir: Math.atan2(-ny, -nx), spread: 1.5 }); }
    else if (speed > 240) { want("bump", { react: true, force: true }); emit("bump", { side }); }
  }
  function goSleep(explicit) {
    if (!S || !S.on) return; S.nap = !explicit; const Z = S.Z, Rb = 49 * Z.unit, sf = S.safe;
    const x = sf.left + Rb + 14, y = innerHeight - sf.bottom - 61.5 * Z.unit - 12;
    S.sleepAt = [x, y]; stopTag("slider"); S.visit = null;
    if (S.reduced) { S.B.x = x; S.B.y = y; setSt("sleep"); S.sleepSettle = S.now; } else travelTo(x, y, { then: "sleep", h: 36 });
    want("sleep", { react: true, force: true }); emit("sleep", { explicit: !!explicit }); kick();
  }
  function wakeUp() { if (!S || S.st !== "sleep") return; S.nap = false; S.lastAct = S.now; setSt("follow"); want("wake", { react: true, force: true }); emit("wake", {}); kick(); }

  function physics(now, dt) {
    const B = S.B, h = dt / 1000, Z = S.Z, W = innerWidth, H = innerHeight, sf = S.safe, Rw = 52 * Z.unit, Rf = 61.5 * Z.unit;
    const px = B.x, py = B.y; let kin = true;
    S.dodgeY = now > S.dodgeUntil ? S.dodgeY * Math.exp(-h * 2) : S.dodgeY;
    const hm = home(); S.home = hm;
    const st = S.st;
    if (S.reduced) { const tx = sf.left + 49 * Z.unit + 14, ty = H - sf.bottom - Rf - 12; B.x = tx; B.y = ty; B.vx = B.vy = 0; B.rot = 0; B.w = 0; if (st !== "sleep" && st !== "calm") setSt("calm"); }
    else if (st === "enter" || st === "follow") {
      if (st === "enter") setSt("follow");
      const sc = S.scrOff; const tx = hm.x, ty = hm.y + sc[0], d = Math.hypot(tx - B.x, ty - B.y);
      if (d > 150 * Z.travel && now - (S.tr ? S.tr.t0 + S.tr.D : 0) > 300) travelTo(hm.x, hm.y, { track: () => { const q = S.home; return [q.x, q.y]; } });
      else { sprB(tx, ty, TAU * (Z.small ? 0.8 : 1.0), 0.9, h); kin = false; }
      B.rot += (0 - B.rot) * (1 - Math.exp(-h * 6)); B.w = 0;
    } else if (st === "travel") {
      const T = S.tr; if (T.track) { const q = T.track(); if (q) { T.x1 = q[0]; T.y1 = q[1]; } }
      const tau = now - T.t0; if (tau < T.pre) { S.crouch = sm(tau / T.pre); }
      else { S.crouch = Math.max(0, 1 - (tau - T.pre) / 90); const u = clamp((tau - T.pre) / Math.max(1, T.D - T.pre), 0, 1), e = backInOut(u, 0.45), cx = (T.x0 + T.x1) / 2, cy = (T.y0 + T.y1) / 2 - T.h;
        const a = 1 - e; B.x = a * a * T.x0 + 2 * a * e * cx + e * e * T.x1; B.y = a * a * T.y0 + 2 * a * e * cy + e * e * T.y1;
        if (u >= 1) { S.crouch = 0; const then = T.then; S.tr.done = now; setSt(then === "follow" ? "follow" : then); kickStrain(0.12, Math.atan2(T.dx, T.dy) + Math.PI / 2, 18); emit("arrive", { state: then }); want("arrive", { layer: "over", react: true }); if (then === "sleep") S.sleepSettle = now; } }
      B.rot += (0 - B.rot) * (1 - Math.exp(-h * 6));
    } else if (st === "assist") {
      const q = sliderSpot(); if (q) { sprB(q[0], q[1], TAU * 3, 0.72, h); kin = false; }
      if (!S.sl && now > (S.assistEnd || 0)) { stopTag("slider"); setSt("follow"); }
    } else if (st === "visit") {
      const V = S.visit, sp = V && S.figEl === V.el ? figSpot() : null;
      if (sp) { sprB(sp[0], sp[1], TAU * 1.4, 0.9, h); kin = false; }
      if (V && !V.arrived) { V.arrived = now; want("figure", { react: true, force: true }); }
      if (V && !V.morphed && now > V.morphAt) { V.morphed = true; if (!want("morph", { react: true, force: true })) V.morphed = true; }
      const gone = !V || !S.figEl || S.figEl !== V.el;
      if (V && (now - V.t0 > 6200 || (gone && now - (V.goneT || (V.goneT = now)) > 1200))) { S.visit = null; setSt("follow"); }
      else if (V && !gone) V.goneT = 0;
    } else if (st === "held") {
      const G = S.grab, tx = S.ptr.x - G.ox, ty = S.ptr.y - G.oy, om = TAU * 7, z = 0.5; G.ox *= Math.exp(-h * 1.2); G.oy *= Math.exp(-h * 1.2);
      sprB(tx, ty, om, z, h); kin = false;
      B.rot += (clamp(-B.vx * 0.0003, -0.5, 0.5) - B.rot) * (1 - Math.exp(-h * 8));
    } else if (st === "press") {
      pressStep(now, h); kin = false;
    } else if (st === "thrown" || st === "floor") {
      kin = false; const n = Math.max(1, Math.ceil(h / 0.008)), d = h / n, g = 2500 * (Z.small ? 0.85 : 1);
      for (let s = 0; s < n; s++) {
        if (!B.ground) B.vy += g * d; B.vx *= Math.exp(-0.3 * d); B.vy *= Math.exp(-0.15 * d); B.x += B.vx * d; B.y += B.vy * d;
        if (B.ground) { B.vx *= Math.exp(-2.4 * d); B.w = B.vx / (49 * Z.unit); } else B.w *= Math.exp(-0.25 * d);
        B.rot += B.w * d;
        const L0 = sf.left + Rw, R0 = W - sf.right - Rw, T0 = sf.top + Rw, F0 = H - sf.bottom - Rf;
        if (B.x < L0) { B.x = L0; if (B.vx < 0) { const sp = -B.vx; B.vx = sp * 0.55; B.vy *= 0.9; B.w += B.vy * 0.004; if (st === "thrown") { impact("left", sp); if (maybeCling("left", sp)) return; } } }
        if (B.x > R0) { B.x = R0; if (B.vx > 0) { const sp = B.vx; B.vx = -sp * 0.55; B.vy *= 0.9; B.w -= B.vy * 0.004; if (st === "thrown") { impact("right", sp); if (maybeCling("right", sp)) return; } } }
        if (B.y < T0) { B.y = T0; if (B.vy < 0) { const sp = -B.vy; B.vy = sp * 0.5; B.vx *= 0.9; if (st === "thrown") impact("top", sp); } }
        if (B.y > F0) { B.y = F0; if (B.vy > 0) { const sp = B.vy; if (sp > 110) { B.vy = -sp * 0.42; B.vx *= 0.86; B.w = lerp(B.w, B.vx / (49 * Z.unit), 0.5); if (st === "thrown") { if (sp > 380) impact("bottom", sp); else kickStrain(clamp(sp / 2600, 0.03, 0.2), Math.PI / 2, 24); if (!S.landed) { S.landed = true; emit("land", { speed: Math.round(sp) }); want("land", { layer: "over", react: true, force: true }); fx("puff", { y: Rf, n: 4 }); } } } else { B.vy = 0; B.ground = true; } } }
      }
      if (B.ground && Math.abs(B.vx) < 30) { if (!S.restT) S.restT = now; } else S.restT = 0;
      if (st === "thrown" && (B.ground && S.restT && now - S.restT > 320 || now - S.stT > 6500)) toFloor(now);
    } else if (st === "cling") {
      kin = false; B.vx = 0; B.vy = 0; const C = S.cling; B.x = C.side === "left" ? sf.left + Rw - 4 : W - sf.right - Rw + 4; B.rot += (C.rot - B.rot) * (1 - Math.exp(-h * 10));
      if (now - S.stT > C.hold) { setSt("slide"); stopTag("cling"); want("slide", { react: true, force: true }); emit("slide", { side: C.side }); }
    } else if (st === "slide") {
      kin = false; const C = S.cling; B.vy = Math.min(190, B.vy + 260 * h); B.y += B.vy * h; B.x = C.side === "left" ? sf.left + Rw - 3 : W - sf.right - Rw + 3; B.x += Math.sin(now / 55) * 0.8;
      if (B.y > H - sf.bottom - Rf || now - S.stT > 1700) { stopTag("slide"); B.vx = C.side === "left" ? 90 : -90; B.ground = false; S.landed = false; setSt("thrown"); }
    } else if (st === "dizzy" || st === "recover") {
      kin = false; B.vx *= Math.exp(-h * 6); B.x += B.vx * h; const up = TAU * Math.round(B.rot / TAU); B.rot += (up - B.rot) * (1 - Math.exp(-h * (st === "recover" ? 7 : 1.5)));
      if (st === "dizzy" && now - S.stT > 1700) { stopTag("dizzy"); setSt("recover"); want("recover", { react: true, force: true }); emit("recover", {}); }
      else if (st === "recover" && now - S.stT > 820) { B.rot = up; S.dizzy = 0; B.ground = false; setSt("follow"); travelTo(S.home.x, S.home.y, { track: () => { const q = S.home; return [q.x, q.y]; }, h: 70 }); }
    } else if (st === "sleep") {
      const q = S.sleepAt || [B.x, B.y]; sprB(q[0], q[1], TAU * 1.2, 1, h); kin = false; B.rot += (0 - B.rot) * (1 - Math.exp(-h * 4));
    } else if (st === "calm") { kin = false; }
    if (kin) { B.vx = (B.x - px) / Math.max(1e-3, h); B.vy = (B.y - py) / Math.max(1e-3, h); }
    const k = 1 - Math.exp(-h / 0.05), ax = (B.vx - B.pvx) / Math.max(1e-3, h), ay = (B.vy - B.pvy) / Math.max(1e-3, h);
    B.ax += (clamp(ax, -30000, 30000) - B.ax) * k; B.ay += (clamp(ay, -30000, 30000) - B.ay) * k; B.pvx = B.vx; B.pvy = B.vy;
    if (!fin(B.x) || !fin(B.y)) { B.x = hm.x; B.y = hm.y; B.vx = B.vy = 0; setSt("follow"); }
  }
  function maybeCling(side, sp) { if (S.clung || sp < 520 || sp > 2800 || rnd() > TUNE.clingChance) return false; S.clung = true; S.cling = { side, hold: rr(480, 760), rot: side === "left" ? 0.25 : -0.25 }; S.B.w = 0; setSt("cling"); want("cling", { react: true, force: true }); emit("cling", { side }); return true; }
  function toFloor(now) {
    const B = S.B; B.ground = true; B.vx = 0; B.vy = 0; B.w = 0; S.restT = 0;
    if (S.dizzy > 1 || S.hits.filter(t => now - t < 1800).length >= 3) { setSt("dizzy"); want("dizzy", { react: true, force: true }); emit("dizzy", {}); fx("star", { n: 3, y: -45 * S.Z.unit }); }
    else { setSt("recover"); want("recover", { react: true, force: true }); emit("recover", {}); }
  }


  function onPress(e) {
    if (!S || !S.on) return; if (S.pressId != null) return; activity();
    try { e.preventDefault(); } catch (er) {}
    try { S.hit.setPointerCapture(e.pointerId); } catch (er) {}
    const now = performance.now(), x = e.clientX, y = e.clientY;
    if (S.st === "sleep") { wakeUp(); }
    if (S.reduced) { S.pressId = e.pointerId; S.press = { x0: x, y0: y, x, y, t0: now, type: e.pointerType, phase: "calm", samples: [] }; S.flare = Math.max(S.flare, 0.5); emit("squish", { x, y }); return; }
    S.pressId = e.pointerId; S.press = { x0: x, y0: y, x, y, t0: now, type: e.pointerType, phase: "squish", bx: S.B.x, by: S.B.y, shove: now + 700, samples: [[now, x, y]] };
    S.ptr.x = x; S.ptr.y = y; S.ptr.type = e.pointerType || "mouse"; S.ptr.t = now; S.ptr.moved = now; if (e.pointerType === "touch") S.touch = true;
    if (S.st === "follow" || S.st === "travel" || S.st === "visit" || S.st === "assist" || S.st === "sleep" || S.st === "recover" || S.st === "dizzy" || S.st === "floor" || S.st === "thrown" || S.st === "cling" || S.st === "slide") { S.prevSt = S.st; }
    S.B.vx = S.B.vy = 0; S.tr = null; S.B.ground = false; setSt("press");
    const Gi = Minv(S.G0), b = Mp(Gi, x, y), d = Math.hypot(b[0], b[1]); S.press.nx = d > 14 ? b[0] / d : 0; S.press.ny = d > 14 ? b[1] / d : -1;
    const perp = Math.atan2(S.press.nx, S.press.ny) + Math.PI / 2;
    S.press.axis = perp;
    for (let i = 0; i < 8; i++) { const sp = SPREAD[HP[i]] || [0, 0], side = (sp[0] * Math.cos(perp) + sp[1] * Math.sin(perp)) >= 0 ? 1 : -1, mag = 10 + 8 * hash(i, 9); stirVel(i, Math.sin(perp) * side * mag, Math.cos(perp) * side * mag, (hash(i, 4) - 0.5) * 0.6); }
    S.flinch = 1; want("squish", { react: true, force: true }); emit("squish", { x, y });
  }
  function onPressMove(e) {
    if (!S || e.pointerId !== S.pressId) return; const P = S.press, now = performance.now(), x = e.clientX, y = e.clientY; P.x = x; P.y = y;
    S.ptr.x = x; S.ptr.y = y; S.ptr.t = now; S.ptr.moved = now; P.samples.push([now, x, y]); while (P.samples.length > 8) P.samples.shift();
    if (P.phase === "free" || P.phase === "calm" || P.phase === "grab") return;
    const lim = P.type === "touch" ? TUNE.moveTapTouch : TUNE.moveTap;
    if (Math.hypot(x - P.x0, y - P.y0) > lim) {
      P.phase = "grab"; S.grab = { ox: x - S.B.x, oy: y - S.B.y }; setSt("held"); stopTag("squish"); stopTag("push-off"); want("grab", { react: true, force: true }); emit("grab", { x, y }); }
  }
  function onPressUp(e, cancel) {
    if (!S || e.pointerId !== S.pressId) return; const P = S.press, now = performance.now(); S.pressId = null; S.press = null; try { S.hit.releasePointerCapture(e.pointerId); } catch (er) {}
    if (!P) return; const held = now - P.t0;
    if (P.phase === "calm") return;
    if (P.phase === "free") return;
    if (P.phase === "grab") {
      let vx = 0, vy = 0; const smp = P.samples.filter(s => now - s[0] < 90); if (smp.length >= 2) { const a = smp[0], b = smp[smp.length - 1], dtt = Math.max(8, b[0] - a[0]) / 1000; vx = (b[1] - a[1]) / dtt; vy = (b[2] - a[2]) / dtt; }
      const sp = Math.hypot(vx, vy), cap = 4200 * (S.Z.small ? 0.8 : 1); if (sp > cap) { vx *= cap / sp; vy *= cap / sp; }
      stopTag("grab"); const B = S.B; B.ground = false; S.landed = false; S.clung = false; S.hits = []; S.dizzy *= 0.5;
      if (cancel || Math.hypot(vx, vy) < TUNE.throwMin) { B.vx = vx * 0.5; B.vy = vy * 0.5; B.w = 0; setSt("thrown"); emit("drop", {}); emit("release", { vx: Math.round(vx), vy: Math.round(vy), speed: Math.round(Math.hypot(vx, vy)) }); return; }
      B.vx = vx; B.vy = vy; B.w = clamp(vx / (49 * S.Z.unit) * 0.35 + (S.grab ? -S.grab.oy * vx + S.grab.ox * vy : 0) * 0.00002, -26, 26);
      ctx.flick.ms = 0; ctx.flick.speed = Math.round(Math.hypot(vx, vy)); S.flicks.push(now);
      const j = Math.min(1.5, (Math.abs(vx) / S.Z.icon / SLV - 1) * 0.9); if (j > 0) slKick(Math.sign(vx) * j, 0);
      setSt("thrown"); want("throw", { react: true, force: true }); emit("flick", { vx: Math.round(vx), vy: Math.round(vy), speed: ctx.flick.speed }); emit("release", { vx: Math.round(vx), vy: Math.round(vy), speed: ctx.flick.speed });
      return;
    }
    stopTag("squish"); stopTag("push-off");
    const back = S.prevSt === "sleep" ? "follow" : "follow"; S.prevSt = null; setSt(back);
    const amt = P.phase === "push" ? 0.42 : 0.3; kickStrain(-amt, P.axis || 0, 36);
    for (let i = 0; i < 8; i++) stirVel(i, (hash(i, 21) - 0.5) * 20, (hash(i, 22) - 0.5) * 20 - 8, (hash(i, 23) - 0.5) * 0.5);
    if (held < TUNE.tapMs) { want("boop", { react: true, force: true }); emit("boop", { x: P.x, y: P.y }); emit("poke", { x: P.x, y: P.y }); }
    else if (P.phase === "push") { want("relief", { react: true, force: true }); emit("relief", { ms: Math.round(held) }); }
    else { want("pop", { react: true, force: true }); emit("pop", { ms: Math.round(held) }); }
  }
  function pressStep(now, h) {
    const P = S.press, B = S.B; if (!P) { setSt("follow"); return; } const held = now - P.t0;
    if (P.phase === "squish" && held > TUNE.pushMs) { P.phase = "push"; stopTag("squish"); want("push-off", { react: true, force: true }); emit("push", { ms: Math.round(held) }); }
    if (P.phase === "push" && held > TUNE.freeMs) {
      P.phase = "free"; S.pressId = null; S.press = null; stopTag("push-off");
      const Rb = 49 * S.Z.unit, ax = -(P.nx || 0), ay = -(P.ny || -1), W = innerWidth, H = innerHeight;
      let dy = (Math.abs(ay) > 0.2 ? Math.sign(ay) : (B.y > H / 2 ? -1 : 1)) * Rb * 3.2; if (B.y + dy < Rb * 2 || B.y + dy > H - Rb * 2) dy = -dy;
      const tx = clamp(B.x + ax * Rb * 1.2, Rb + 8, W - Rb - 8), ty = clamp(B.y + dy, Rb + 8, H - Rb - 30); kickStrain(-0.3, P.axis || 0, 40);
      travelTo(tx, ty, { h: 46, ms: 520, pre: 60, then: "follow" }); S.dodgeY = (S.dodgeY || 0) + ty - S.home.y; S.dodgeUntil = now + 5000; want("wriggle-free", { react: true, force: true }); emit("free", { ms: Math.round(held) }); return;
    }
    const depth = P.phase === "squish" ? 0.3 * sm(held / 150) + 0.04 * sm((held - 150) / 350) : 0.34;
    S.pressDepth = depth; let tx = P.bx, ty = P.by;
    if (P.phase === "push") {
      const u = (held - TUNE.pushMs) / 1000, Rb = 49 * S.Z.unit, away = Rb * (0.18 + 0.1 * Math.sin(u * 3.1)), wig = Math.sin(u * 31) * Rb * 0.06;
      let shove = 0; if (now > P.shove) { P.shove = now + rr(520, 900); P.shoveT = now; } if (P.shoveT && now - P.shoveT < 200) shove = Math.sin(Math.PI * (now - P.shoveT) / 200) * Rb * 0.32;
      tx = P.bx - (P.nx || 0) * (away - shove) + (P.ny || -1) * wig; ty = P.by - (P.ny || -1) * (away - shove) - (P.nx || 0) * wig;
      if (S.rand2 === undefined || now > S.rand2) { S.rand2 = now + 90; for (let i = 0; i < 8; i++) stirVel(i, (hash(i, now | 0) - 0.5) * 9, (hash(i + 9, now | 0) - 0.5) * 9, (hash(i + 3, now | 0) - 0.5) * 0.3); }
    }
    sprB(tx, ty, TAU * 6, 0.6, h);
    B.rot += ((P.phase === "push" ? -(P.nx || 0) * 0.22 + Math.sin(now / 47) * 0.07 : 0) - B.rot) * (1 - Math.exp(-h * 10));
  }


  function brain(now, dt) {
    const st = S.st, Pt = S.ptr, B = S.B;
    ctx.idleMs = now - S.lastAct;
    S.readBlock = (now - (S.readT || 0) > 220) ? (S.readT = now, readTarget()) : S.readBlock;
    const rb = S.readBlock; S.readY = rb ? clamp(0.4 * innerHeight, rb.t - scrollY, rb.b - scrollY) : null;
    if (rb && rb !== S.lastRead) { S.lastRead = rb; S.rs = { x0: rb.l - scrollX + 10, x1: rb.l - scrollX + Math.min(rb.r - rb.l - 20, 420), step: 0, t: now }; emit("read", { kind: rb.k || "p" }); }
    if (S.rs && now - S.rs.t > rr(260, 420)) { S.rs.t = now; S.rs.step = (S.rs.step + 1) % 6; }

    let fk = "none", fx0 = B.x - 120, fy0 = B.y;
    const ptrFresh = Pt.t > 0 && now - Pt.moved < 1500 && !S.touch && Pt.x >= 0;
    if (S.override && now < S.override.until) { fk = "clip"; fx0 = S.override.x; fy0 = S.override.y; }
    else if (st === "press" && S.press) { fk = "press"; fx0 = S.press.x; fy0 = S.press.y; }
    else if (st === "held") { fk = "flight"; fx0 = B.x + B.vx * 0.3; fy0 = B.y + B.vy * 0.3 + 40; }
    else if (st === "thrown" || st === "slide" || st === "cling") { fk = "flight"; fx0 = B.x + B.vx * 0.25; fy0 = B.y + B.vy * 0.25; }
    else if (st === "assist" && S.sl) { fk = "slider"; fx0 = S.sl.tx; fy0 = S.sl.ty; }
    else if (st === "assist") { fk = "slider"; fx0 = B.x + 40 * (S.slDirLast || 1); fy0 = B.y + 30; }
    else if (st === "visit" && S.visit) { fk = "figure"; fx0 = S.figEl === S.visit.el ? S.figX : S.visit.x; fy0 = S.figEl === S.visit.el ? S.figY : S.visit.y; }
    else if (S.glance && now < S.glance.until) { fk = "touch"; fx0 = S.glance.x; fy0 = S.glance.y; }
    else if (ptrFresh && Math.hypot(Pt.x - B.x, Pt.y - B.y) < 520) { fk = "pointer"; fx0 = Pt.x; fy0 = Pt.y; }
    else if (S.tap && now - S.tap.t < 1700) { fk = "touch"; fx0 = S.tap.x; fy0 = S.tap.y; }
    else if (S.sl) { fk = "slider"; fx0 = S.sl.tx; fy0 = S.sl.ty; }
    else if (rb && S.rs) { fk = "read"; const f = S.rs.step / 5; fx0 = lerp(S.rs.x0, S.rs.x1, f); fy0 = S.readY + (S.rs.step === 0 ? 0 : 0); }
    if (fk !== S.fk) { S.fk = fk; S.fkT = now; if (fk === "pointer" && st === "follow") { const near = Math.hypot(Pt.x - B.x, Pt.y - B.y); if (near < 220 && now - (S.noticeT || 0) > 7000) { S.noticeT = now; want("notice", { react: true }); emit("near", { d: Math.round(near) }); } } }
    S.atX = fx0; S.atY = fy0;
    const Fc = ctx.focus; Fc.kind = fk; Fc.x = fx0; Fc.y = fy0; Fc.dx = fx0 - B.x; Fc.dy = fy0 - B.y; Fc.d = Math.hypot(Fc.dx, Fc.dy);

    if (Pt.x >= 0 && !S.touch && Pt.over === "control" && now - Pt.moved < 400 && Math.hypot(Pt.x - B.x, Pt.y - B.y) < S.Z.icon * 1.5 && now > S.dodgeUntil - 1200 && st === "follow") dodge(Pt.x, Pt.y);

    const busy = anyIn("body") || fk === "pointer" && Fc.d < 260 || st !== "follow";
    S.emerge += ((busy ? 1 : 0) - S.emerge) * (1 - Math.exp(-dt / (busy ? 260 : 900)));

    const Sc = S.scr; if (now - Sc.t > 140) Sc.vy *= Math.exp(-dt / 90);
    const fast = Math.abs(Sc.vy) > 2600; ctx.scroll.vy = Math.round(Sc.vy); ctx.scroll.ms = now - Sc.t; ctx.scroll.fast = fast;
    { const tgt = clamp(-Sc.vy * (fast ? 0.06 : 0.025), -0.22 * innerHeight, 0.22 * innerHeight) * S.Z.gentle, om = TAU * 1.3, z = 0.65, so = S.scrOff, n = Math.max(1, Math.ceil(dt / 8)), d = dt / 1000 / n; for (let k = 0; k < n; k++) { so[1] += d * (om * om * (tgt - so[0]) - 2 * z * om * so[1]); so[0] += d * so[1]; } }
    if (fast && now - (S.fastT || 0) > 2500 && st === "follow") { S.fastT = now; want("scroll", { react: true }); emit("scroll", { vy: Math.round(Sc.vy) }); }

    if (st === "follow" && ctx.idleMs > TUNE.napAfter && !S.reduced) goSleep(false);
    if (S.wantStir) { S.wantStir = false; if (S.st === "follow" && now - (S.stirClipT || 0) > 5000) { S.stirClipT = now; want("stirred", { react: true }); } }
    maybeVisit(now);

    if (now - (S.baseT || 0) > 400) { S.baseT = now; for (const it of S.active) { if (it.out >= 0 || !it.d.when || !it.d.loop) continue; let ok = true; try { ok = !!it.d.when(ctx); } catch (e) { ok = false; } if (!ok) beginOut(it); } }
    if (!anyIn("base")) want("base", { react: true, force: true });
    if (now > S.nextBlink) { S.nextBlink = now + rr(2200, 6200) * (st === "sleep" ? 9 : 1); if (st !== "sleep" && !anyIn("eye")) { if (!want("blink", { layer: "eye", react: true, force: true })) S.autoBlink = now; } }
    if (now > S.nextAct && (st === "follow" || st === "calm") && !anyIn("body")) {
      S.nextAct = now + rr(TUNE.idleMin, TUNE.idleMax);
      let tag = "idle"; const r = rnd();
      if (ctx.idleMs > 45000 && r < 0.5) tag = "bored"; else if (fk === "read" && r < 0.35) tag = "read"; else if (S.bias && r < 0.45) { const ks = Object.keys(S.bias).filter(k => S.bias[k] > 0); if (ks.length) tag = ks[Math.floor(rnd() * ks.length)]; }
      if (!want(tag) && tag !== "idle") want("idle");
      if (rnd() < 0.3 && !anyIn("eye")) want("idle", { layer: "eye" });
    }
  }


  function compose(now, dt) {
    clearF(); S.formW = 0; S.form = null;
    const B = S.B, h = dt / 1000, Z = S.Z;
    if (S.still) { F.x = B.x; F.y = B.y; S.eyeX = S.eyeY = 0; hv.fill(0); sl.fill(0); slMov = false; S.stirOn = false; S.sp.fill(0); return; }
    runClips(now); F.x = clamp(F.x, -400, 400); F.y = clamp(F.y, -400, 400);

    const Gm = S.G0 || Mt(B.x, B.y), Gi = Minv(Gm), tb = Mp(Gi, S.atX, S.atY), ec = ICON.eye, gdx = tb[0] - ec[0], gdy = tb[1] - ec[1], gl = Math.hypot(gdx, gdy) || 1;
    const amp = { pointer: 0.95, touch: 0.95, slider: 1, figure: 1, press: 1, flight: 0.8, read: 0.62, clip: 1, none: 0.3 }[S.fk] || 0.5;
    let gx = gdx / gl * amp * clamp(gl / 60, 0.3, 1), gy = gdy / gl * amp * clamp(gl / 60, 0.3, 1);
    if (now > S.msT) { S.msT = now + rr(500, 1500); S.ms = [rr(-0.09, 0.09), rr(-0.07, 0.07)]; }
    gx += S.ms[0]; gy += S.ms[1];
    spr2(S.gz, gx, gy, TAU * 7.5, 0.7, h);
    const gaze = clamp(1 + F.eye.gaze, 0, 1);
    S.eyeX = clamp(S.gz[0] * gaze + F.eye.x, -1.3, 1.3); S.eyeY = clamp(S.gz[1] * gaze + F.eye.y, -1.3, 1.3);

    S.flare *= Math.exp(-h / 0.55); S.flinch *= Math.exp(-h / 0.35);
    const fk = S.fk, st = S.st;
    let gw = S.flare, nw = 0, dr = 0;
    if (fk === "pointer" && ctx.focus.d < 240) gw += 0.25; if (fk === "slider" || fk === "figure") { gw += 0.45; nw += 0.32; }
    if (st === "press") { gw += S.press && S.press.phase === "push" ? 0.75 : 0.1; nw += S.press && S.press.phase === "push" ? 0.75 : 0.45; }
    if (st === "sleep") { gw -= 0.75; dr += 0.6; } else if (ctx.idleMs > 60000) { gw -= 0.35; dr += 0.35; }
    nw += S.flinch * 0.6;
    S.glowA += (gw - S.glowA) * (1 - Math.exp(-h / 0.18)); S.narA += (nw - S.narA) * (1 - Math.exp(-h / 0.12)); S.droopA += (dr - S.droopA) * (1 - Math.exp(-h / 0.6));

    let lidAuto = 0; if (S.autoBlink) { const u = (now - S.autoBlink) / 170; if (u >= 1) S.autoBlink = 0; else lidAuto = Math.sin(Math.PI * u); }
    if (st === "sleep") lidAuto = Math.max(lidAuto, 0.92 * sm((now - S.stT) / 900));

    { const dvx = (B.vx - S.lvx) / Z.unit, dvy = (B.vy - S.lvy) / Z.unit; S.lvx = B.vx; S.lvy = B.vy;
      const c = Math.cos(-B.rot), s = Math.sin(-B.rot), bx = (c * dvx - s * dvy), by = (s * dvx + c * dvy), mag = Math.hypot(bx, by);
      if (mag > 0.5 && mag < 2e4 && !S.reduced) { const g = Z.gentle; for (let i = 0; i < 8; i++) { const P = HV[i], o = 6 * i, om = TAU * P[7], vm = 1.2 * P[5] * S.capx * om; hv[o + 3] = clamp(hv[o + 3] - LAGB[i] * bx * g, -vm, vm); hv[o + 4] = clamp(hv[o + 4] - LAGB[i] * by * g, -vm, vm); if (i < 2) hv[o + 5] = clamp(hv[o + 5] + (i === 0 ? 1 : -1) * LAGB[i] * bx * 0.012 * g, -2, 2); } S.stirOn = true; } }
    stirStep(h); slStep(h);

    { const sp = S.sp; let tp = 0, tq = 0, om = TAU * 5.5, z = 0.28;
      if (st === "press" && S.press) { const pq = sqpq(S.pressDepth || 0, S.press.axis || 0); tp = pq[0]; tq = pq[1]; om = TAU * 6; z = 0.6; }
      if (S.crouch > 0) { const pq = sqpq(0.18 * S.crouch, Math.PI / 2); tp += pq[0]; tq += pq[1]; }
      spr2(sp, tp, tq, om, z, h);
      if (Math.abs(sp[0]) + Math.abs(sp[1]) + Math.abs(sp[2]) + Math.abs(sp[3]) < 1e-5) sp.fill(0); }

    const spd = Math.hypot(B.vx, B.vy), fly = st === "thrown" || st === "travel" || st === "held" || st === "slide";
    const vs = fly ? clamp(spd * 0.00016, 0, 0.3) * Z.gentle : 0, va = Math.atan2(B.vx, B.vy);
    const leanT = st === "follow" || st === "travel" || st === "assist" || st === "visit" ? clamp(B.ax * 0.00011, -0.32, 0.32) * Z.gentle : 0; S.lean += (leanT - S.lean) * (1 - Math.exp(-h / 0.09));

    F.x += B.x; F.y += B.y; F.rot += B.rot; F.tilt += S.lean;
    FS.group[0] += S.sp[0] + vs * Math.cos(2 * va); FS.group[1] += S.sp[1] + vs * Math.sin(2 * va);
    F.eye.glow += S.glowA; F.eye.narrow += S.narA; F.eye.droop += S.droopA; F.eye.lid += lidAuto;
    if (st === "sleep") { F.eye.glow -= 0; }
    F.turn += sl[0] - TAU * Math.round(sl[0] / TAU);
    if (S.reduced) { F.x = B.x; F.y = B.y; F.rot = 0; F.tilt = 0; F.scale = 0; F.turn = 0; F.spread = 0; F.morph = 0; FS.group[0] = FS.group[1] = 0; for (const p of PARTS) { const o = F[p]; o.x = o.y = o.rot = o.scale = 0; o.melt = 0; FS[p][0] = FS[p][1] = 0; if ("len" in o) { o.len = 0; o.bend = 0; } if ("spin" in o) o.spin = 0; if ("open" in o) o.open = 0; if ("drop" in o) o.drop = 0; } F.reach.len = 0; F.eye.spin = 0; F.eye.fire = 0; }
    clampF();
    if (Z.small) { F.x = B.x + (F.x - B.x) * Z.gentle; F.y = B.y + (F.y - B.y) * Z.gentle; }
  }


  function buildGrads(g) {
    const o = g.createLinearGradient(-23, 47, 23, -47); COL.heat.forEach(([s, c]) => o.addColorStop(s, rgba(c)));
    const l = g.createLinearGradient(-49, 14.1, 50, -3); COL.heat.forEach(([s, c]) => l.addColorStop(s, rgba(c)));
    grads = { orbit: o, line: l, key: COL.key };
  }
  const R3 = {
    ry: (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; },
    rz: (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]]; },
    rx: (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]; }
  };
  function partM(p, piv, extraRot) {
    const key = p + ":" + piv[0].toFixed(3) + ":" + piv[1].toFixed(3) + ":" + (extraRot || 0); const hit = S.PMc[key]; if (hit) return hit;
    return (S.PMc[key] = partM0(p, piv, extraRot)); }
  function partM0(p, piv, extraRot) {
    const o = F[p], u = S.Z.unit, spr = SPREAD[p] || [0, 0], sv = F.spread, j = S.partJ[p];
    let m = Mt(piv[0], piv[1]); m = Mm(m, Mr((o.rot || 0) + (j ? j.a : 0) + (extraRot || 0))); m = Mm(m, Mq(FS[p][0] + (j ? j.s1 : 0), FS[p][1] + (j ? j.s2 : 0))); const sc = Math.exp(o.scale || 0); m = Mm(m, Ms(sc, sc)); m = Mm(m, Mt(-piv[0], -piv[1]));
    return Mm(Mt(o.x / u + spr[0] * sv + (j ? j.x : 0), o.y / u + spr[1] * sv + (j ? j.y : 0)), m);
  }
  function partJiggle() {
    const J = S.partJ, X = S.capx;
    for (let i = 0; i < 8; i++) { const P = HV[i], o = 6 * i, x = hv[o], y = hv[o + 1], l = Math.hypot(x, y), cap = P[5] * X, k = l > 1e-9 ? cap * Math.tanh(l / cap) / l : 1, capT = Math.max(1e-6, P[6] * X), a = P[6] ? capT * Math.tanh(hv[o + 2] / capT) : 0;
      const so = 2 + 12 * i, cp = (v, m) => m > 0 ? m * Math.tanh(v / m) : 0, u = cp(sl[so + 2], 1.4 * SPA[i][2]), v = cp(sl[so + 4], 1.4 * SPA[i][2]), ta = cp(sl[so + 6], 1.7 * STI[i][1]), s1 = cp(sl[so + 8], 1.7 * SSQ[i][1]), s2 = cp(sl[so + 10], 1.7 * SSQ[i][1]);
      const q = { x: x * k + u, y: y * k + v, a: a + ta, s1, s2, lag: SLG[i][0] ? sl[so] : 0 }; J[HP[i]] = q; if (HP[i] === "lower") J.line = q; }
  }
  function draw(now) {
    const g = S.g, cv = S.cv, dpr = S.dpr, CS = S.Z.CS, half = CS / 2, Z = S.Z, u = Z.unit, th = Z.thick;
    if (!grads || grads.key !== COL.key) buildGrads(g);
    const bx = F.x, by = F.y, L = Math.round(bx) - half, T = Math.round(by) - half;
    if (L !== S.cvL || T !== S.cvT) { cv.style.transform = "translate3d(" + L + "px," + T + "px,0)"; S.cvL = L; S.cvT = T; }
    const hr = Z.hitR, hl = Math.round(bx) - hr, ht = Math.round(by) - hr; if (hl !== S.hL || ht !== S.hT) { S.hit.style.transform = "translate3d(" + hl + "px," + ht + "px,0)"; S.hL = hl; S.hT = ht; }
    const hitOff = S.st === "assist" || S.st === "visit" || (S.st === "travel" && S.tr && (S.tr.then === "assist" || S.tr.then === "visit"));
    const pe = hitOff ? "none" : "auto"; if (S.hitPE !== pe) { S.hit.style.pointerEvents = pe; S.hitPE = pe; }
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    const ox = bx - L, oy = by - T, sc = u * Math.exp(F.scale), foot = ICON.foot * sc;
    let G = Mt(ox, oy); G = Mm(G, Mab(Mr(F.tilt), 0, foot)); G = Mm(G, Mr(F.rot)); G = Mm(G, Mq(FS.group[0], FS.group[1])); G = Mm(G, Ms(sc, sc));
    if (S.B.ground && (S.st === "thrown" || S.st === "dizzy" || S.st === "recover" || S.st === "floor")) { const lo = Math.max(49 * Math.hypot(G[1], G[3]), Mp(G, 0, ICON.foot)[1] - oy); G[5] += foot - lo; }
    S.G0 = Mm(Mt(L, T), G);
    const set = m => g.setTransform(m[0] * dpr, m[1] * dpr, m[2] * dpr, m[3] * dpr, m[4] * dpr, m[5] * dpr);
    const alpha = clamp(1 + F.alpha, 0, 1) * S.fade; if (alpha <= 0.003) { S.drawn = 0; return; }
    g.globalAlpha = alpha; g.lineCap = "round"; g.lineJoin = "round";
    partJiggle(); S.PMc = {};
    const morph = F.morph, mAll = sm(morph / 0.3), meltOf = p => Math.max(F[p].melt, mAll), shapeA = p => (1 - sm(meltOf(p) / 0.45)) * clamp(1 + F[p].alpha, 0, 1);

    const turnOf = p => F.turn + (S.partJ[p] ? S.partJ[p].lag : 0);
    const behind = th0 => sm((0.25 - Math.cos(th0)) / 0.5);

    { const fl = innerHeight - S.safe.bottom - by; if (fl < half + 4) { const k = clamp(1 - (fl - foot) / (half * 1.2), 0, 1); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = rgba(COL.dark ? [0, 0, 0] : [20, 24, 31], 0.22 * k * alpha); g.beginPath(); g.ellipse(ox, oy + fl - 2, 22 * sc / u * u * (0.6 + 0.4 * k), 3.2, 0, 0, TAU); g.fill(); g.globalAlpha = alpha; } }

    const ring = {};
    { const o = F.orbit, j = S.partJ.orbit, tz = turnOf("orbit"), tau = ICON.orbit.tau + (o.spin || 0), roll = ICON.orbit.roll;
      let e1 = [Math.cos(tau), 0, -Math.sin(tau)], e2 = [0, 1, 0]; e1 = R3.ry(R3.rz(e1, roll), tz); e2 = R3.ry(R3.rz(e2, roll), tz);
      const M = partM("orbit", [0, 0]), A = Mm(M, [e1[0] * 47, e1[1] * 47, e2[0] * 47, e2[1] * 47, 0, 0]);
      ring.orbit = { A, M: Mm(M, Mr(roll)), z1: e1[2], z2: e2[2], turned: Math.abs(wrapA(tz)) + Math.abs(o.spin || 0) > 0.02 }; }
    { const o = F.lower, tz = turnOf("lower"), lid = F.eye.lid, tiltL = -0.38 * F.eye.lidTilt, sel = clamp(ICON.lower.sel * (1 + o.open) - 0.47 * lid, -0.95, 0.95), cel = Math.sqrt(1 - sel * sel), roll = ICON.lower.roll + tiltL;
      let e1 = R3.ry(R3.rz([1, 0, 0], roll), tz), e2 = R3.ry(R3.rz([0, sel, cel], roll), tz);
      const cx = ICON.lower.cx, cy = ICON.lower.cy - 3.5 * lid, M = partM("lower", [cx, cy]), A = Mm(M, [e1[0] * ICON.lower.r, e1[1] * ICON.lower.r, e2[0] * ICON.lower.r, e2[1] * ICON.lower.r, cx, cy]);
      ring.lower = { A, M, z1: e1[2], z2: e2[2], spin: o.spin || 0, sel };
      const k = sel / ICON.lower.sel, lc = [cx + ICON.line.dx, cy + ICON.line.dy * k], M2 = partM("line", lc), lsel = clamp(ICON.line.sel * k, -0.95, 0.95), lcel = Math.sqrt(1 - lsel * lsel);
      let f1 = R3.ry(R3.rz([1, 0, 0], ICON.line.roll + tiltL), tz), f2 = R3.ry(R3.rz([0, lsel, lcel], ICON.line.roll + tiltL), tz);
      ring.line = { A: Mm(M2, [f1[0] * ICON.line.r, f1[1] * ICON.line.r, f2[0] * ICON.line.r, f2[1] * ICON.line.r, lc[0], lc[1]]), M: M2, z1: f1[2], z2: f2[2], lc, roll: ICON.line.roll + tiltL }; }

    const coreG = [];
    { const E = F.eye, ex = S.eyeX, ey = S.eyeY, el = Math.hypot(ex, ey), ea = Math.atan2(ex, ey), shut = clamp(E.lid, 0, 1), droop = E.droop;
      for (let i = 0; i < 3; i++) { const c = ICON.cores[i], p = "core" + i, tz = turnOf(p), cz = Math.cos(tz), szt = Math.sin(tz), z0 = ICON.depth[i];
        const X0 = c[0] * cz + z0 * szt, Zr = -c[0] * szt + z0 * cz, kp = (SLF - z0) / (SLF - Zr);
        const spin = E.spin || 0, ecx = ICON.eye[0], ecy = ICON.eye[1], rx0 = X0 - ecx, ry0 = c[1] - ecy, cs = Math.cos(spin), sn = Math.sin(spin);
        const lidY = -4.67 - c[1], px = ecx + (rx0 * cs - ry0 * sn) + ex * ICON.par[i], py = ecy + (rx0 * sn + ry0 * cs) + ey * ICON.par[i] + droop * 6 + lidY * 0.75 * sm(shut);
        const rxT = Math.sqrt(Math.max(1e-4, (c[2] * cz) ** 2 + (ICON.ell[i] * szt) ** 2)) / c[2], szk = Math.exp(E.size - 0.08 * droop);
        const st2 = sqpq(0.16 * el, ea), nar = 0.5 * E.narrow;
        let m = Mt(px, py); m = Mm(m, Ms(kp * rxT * (1 + 0.1 * shut), kp * (1 - 0.82 * shut))); m = Mm(m, Mq(st2[0] + nar, st2[1])); m = Mm(m, Mr(c[4] * (1 - 0.3 * el) + spin)); m = Mm(m, Ms(szk, szk));
        const M = partM(p, [px, py]); coreG.push({ M: Mm(M, m), c: c, b: behind(tz), da: Zr < 0 ? 1 - 0.5 * sm(-Zr / 24) : 1, i }); } }

    const aimPt = (() => { const ax = F.aimX, ay = F.aimY; const Gi = Minv(S.G0); if (Math.abs(ax) + Math.abs(ay) > 0.5) { const p = Mp(Gi, F.x + ax, F.y + ay); return p; } return Mp(Gi, S.atX, S.atY); })();
    const aimA = Math.atan2(aimPt[1], aimPt[0]);
    const poleG = p => { const o = F[p], j = S.partJ[p], rest = p === "top" ? -Math.PI / 2 : Math.PI / 2, aim = clamp(o.aim, 0, 1);
      const root = lerpA(rest + (o.root || 0), aimA, aim), dir = lerpA(root + (o.rot || 0) + (j ? j.a : 0), aimA, aim);
      const len = 15 * (1 + (o.len || 0) + 0.7 * aim), r0 = 42, sc2 = Math.exp(o.scale || 0), off = [o.x / u + (j ? j.x : 0) + (SPREAD[p][0] * F.spread), o.y / u + (j ? j.y : 0) + (SPREAD[p][1] * F.spread)];
      const ax = off[0] + r0 * Math.cos(root), ay = off[1] + r0 * Math.sin(root), tx = ax + Math.cos(dir) * (len + 3) * sc2, ty = ay + Math.sin(dir) * (len + 3) * sc2;
      const bend = (o.bend || 0) * 0.4 * len, cx = (ax + tx) / 2 - Math.sin(dir) * bend, cy = (ay + ty) / 2 + Math.cos(dir) * bend;
      return { ax, ay, tx, ty, cx, cy, tip: clamp(o.tip, 0, 1), w: ICON.pole * th * sc2, a: shapeA(p) }; };
    const PT = poleG("top"), PB = poleG("bottom");

    const strokeRing = (R, a0, a1, w, style, al) => { if (al <= 0.003) return; set(Mm(G, R.A)); g.beginPath(); g.arc(0, 0, 1, a0, a1); set(Mm(G, R.M || Mt(0, 0))); g.lineWidth = w; g.strokeStyle = style; g.globalAlpha = alpha * al; g.stroke(); g.globalAlpha = alpha; };
    const splitArc = (R, a0, a1, w, style, al, back) => {
      const deep = Math.hypot(R.z1, R.z2); if (deep < 1e-3) { if (!back) strokeRing(R, a0, a1, w, style, al); return; }
      const c = Math.atan2(R.z2, R.z1), off = back ? Math.PI : 0;
      for (let k = -2; k <= 2; k++) { const s0 = Math.max(a0, c + off - Math.PI / 2 + k * TAU), s1 = Math.min(a1, c + off + Math.PI / 2 + k * TAU); if (s1 > s0 + 1e-4) strokeRing(R, s0, s1, w, style, al); } };
    const ink = rgba(COL.line), blobsOf = p => meltOf(p) > 0.001;

    const lowA = shapeA("lower"), lineA = shapeA("line");
    const LA0 = ICON.lower.a0 + ring.lower.spin, LA1 = ICON.lower.a1 + ring.lower.spin, NA0 = ICON.line.a0 + ring.lower.spin, NA1 = ICON.line.a1 + ring.lower.spin;
    splitArc(ring.lower, LA0, LA1, ICON.band * th, ink, lowA * 0.9, true);

    const anyBack = coreG.some(c => c.b > 0) || (ring.orbit.turned && behind(turnOf("orbit")) > 0);
    const drawOrbit = (al, which) => { const R = ring.orbit; if (!R.turned) { if (which !== "back") strokeRing(R, 0, TAU, ICON.orbitW * th, grads.orbit, al); return; }
      if (which === "back" || which === "all") splitArc(R, 0, TAU, ICON.orbitW * th, grads.orbit, al * (which === "all" ? 0.45 : 1), true);
      if (which === "front" || which === "all") splitArc(R, 0, TAU, ICON.orbitW * th, grads.orbit, al, false); };
    const drawCores = (wf, glowOn) => { const E = F.eye, gl = E.glow; for (const c of coreG) { const a = wf(c) * shapeA("core" + c.i) * c.da; if (a <= 0.003) continue; let col = COL.core[c.i]; if (gl > 0) col = mixc(col, [255, 250, 235], clamp(0.2 * gl, 0, 0.35)); else if (gl < 0) col = mixc(col, COL.disc, clamp(-0.55 * gl, 0, 0.7));
        set(Mm(G, c.M)); g.fillStyle = rgba(col, 1); g.globalAlpha = alpha * a; g.beginPath();
        if (E.fire > 0.01) { const n = 22, rx = c.c[2], ry = c.c[3]; for (let k = 0; k <= n; k++) { const ph = TAU * k / n, rr2 = 1 + E.fire * 0.16 * (Math.sin(3 * ph + now / 90 + c.i * 2) * 0.6 + Math.sin(5 * ph - now / 130 + c.i) * 0.4); const X = rx * rr2 * Math.cos(ph), Y = ry * rr2 * Math.sin(ph); if (k) g.lineTo(X, Y); else g.moveTo(X, Y); } }
        else g.ellipse(0, 0, c.c[2], c.c[3], 0, 0, TAU);
        g.fill(); } g.globalAlpha = alpha; };
    if (anyBack) { drawOrbit(shapeA("orbit"), "back"); drawCores(c => c.b > 0 ? Math.min(1, 4 * c.b) : 0); }

    for (const P of [PT, PB]) { if (P.a <= 0.003) continue; set(G); g.globalAlpha = alpha * P.a; g.strokeStyle = ink; g.lineWidth = P.w; g.beginPath(); g.moveTo(P.ax, P.ay); g.quadraticCurveTo(P.cx, P.cy, P.tx, P.ty); g.stroke(); g.globalAlpha = alpha; }

    const dA = shapeA("disc");
    if (dA > 0.003) { const Md = partM("disc", [0, 0]); set(Mm(G, Md)); g.globalAlpha = alpha * dA; g.beginPath(); const dp = F.disc.drop || 0;
      if (Math.abs(dp) > 0.01) { const n = 48, m = 1.3 * Math.abs(dp), sg = dp > 0 ? 1 : -1; for (let k = 0; k <= n; k++) { const t = TAU * k / n, x = 45 * Math.sin(t) * Math.pow(Math.abs(Math.sin(t / 2)), m), y = sg * (-45 * Math.cos(t) - 14 * Math.abs(dp) * Math.max(0, Math.cos(t)) ** 2); if (k) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); }
      else g.arc(0, 0, 45, 0, TAU);
      g.fillStyle = rgba(COL.disc); g.fill(); g.lineWidth = ICON.rim * th; g.strokeStyle = ink; g.stroke(); g.globalAlpha = alpha; }

    const discEarly = mAll <= 0.001 && F.disc.melt > 0.001 && S.blobs.length > 0;
    if (discEarly) drawBlobs(g, dpr, G, ring, coreG, PT, PB, now, alpha, mAll, sc, "disc");

    if (F.eye.glow > 0.02 && coreG.length) { const c0 = coreG[0], p0 = Mp(Mm(G, c0.M), 0, 0), r = 30 * sc * (1 + 0.35 * F.eye.glow); g.setTransform(dpr, 0, 0, dpr, 0, 0); const gr = g.createRadialGradient(p0[0], p0[1], 0, p0[0], p0[1], r), a0 = clamp((COL.dark ? 0.5 : 0.3) * F.eye.glow, 0, 0.75);
      gr.addColorStop(0, rgba(COL.core[1], a0)); gr.addColorStop(0.5, rgba(COL.core[0], a0 * 0.45)); gr.addColorStop(1, rgba(COL.core[0], 0)); g.fillStyle = gr; g.globalCompositeOperation = COL.dark ? "lighter" : "source-over"; g.beginPath(); g.arc(p0[0], p0[1], r, 0, TAU); g.fill(); g.globalCompositeOperation = "source-over"; }

    drawOrbit(shapeA("orbit"), anyBack ? "front" : "all");
    drawCores(c => 1 - (c.b > 0 ? c.b : 0));
    if (anyBack) drawCores(c => c.b > 0 ? 0.45 * c.b : 0);
    splitArc(ring.lower, LA0, LA1, ICON.band * th, ink, lowA, false);
    splitArc(ring.line, NA0, NA1, ICON.lineW * th, grads.line, lineA, false);

    for (const P of [PT, PB]) if (P.tip > 0.01) { const p = Mp(G, P.tx, P.ty); blob(g, dpr, p[0], p[1], 6.5 * sc * (1 + 0.6 * P.tip) * (1 + 0.12 * Math.sin(now / 70)), 6.5 * sc * (1 + 0.6 * P.tip), 0, mixc(COL.core[2], COL.core[1], 0.3), 0.35, alpha * P.tip); }

    if (F.reach.len > 0.01) { const n = Z.small ? 5 : 7, L2 = F.reach.len * clamp(Math.hypot(aimPt[0], aimPt[1]) - 50, 10, 110), wd = Math.exp(F.reach.width);
      for (let k = 0; k < n; k++) { const f = (k + 1) / n, rad = 44 + L2 * f, wob = Math.sin(now / 120 + k) * 2.5 * f, px = Math.cos(aimA) * rad - Math.sin(aimA) * wob, py = Math.sin(aimA) * rad + Math.cos(aimA) * wob, p = Mp(G, px, py), rs = (9 - 4 * f) * sc * wd;
        blob(g, dpr, p[0], p[1], rs, rs, 0, mixc(COL.disc, COL.core[f > 0.7 ? 2 : 1], sm(f)), 0.5, alpha * sm(F.reach.len * 3 - f * 0.5)); } }

    if (S.blobs.length && (mAll > 0.001 || PARTS.some(p => F[p].melt > 0.001))) drawBlobs(g, dpr, G, ring, coreG, PT, PB, now, alpha, mAll, sc, discEarly ? "rest" : null);
    drawFx(g, dpr, ox, oy, now, alpha);
    S.drawn = 1; S.lastBox = [L, T, CS];
  }
  function blob(g, dpr, X, Y, rx, ry, ang, c, h, al) {
    if (al <= 0.004 || !(rx > 0.05) || !(ry > 0.05)) return; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.translate(X, Y); g.rotate(ang); g.scale(rx, ry);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); for (let j = 0; j <= 4; j++) { const r = j / 4 * 0.98; gr.addColorStop(r, rgba(c, al * (h + (1 - h) * Math.exp(-4.5 * r * r)))); } gr.addColorStop(1, rgba(c, 0));
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill();
  }
  function blobHome(b, G, ring, coreG, PT, PB) {
    const sc = Math.hypot(G[0], G[1]);
    if (b.p === "disc") { const M = Mm(G, partM("disc", [0, 0])); const p = Mp(M, b.x, b.y); return [p[0], p[1], b.rx * sc, b.ry * sc, (b.a || 0) + Math.atan2(G[1], G[0])]; }
    if (b.p === "orbit" || b.p === "lower" || b.p === "line") { const R = ring[b.p], s = b.s + (b.p === "orbit" ? 0 : ring.lower.spin), M = Mm(G, R.A), p = Mp(M, Math.cos(s), Math.sin(s)), q = Mp(M, Math.cos(s + 0.01), Math.sin(s + 0.01)); return [p[0], p[1], b.rx * sc, b.ry * sc, Math.atan2(q[1] - p[1], q[0] - p[0])]; }
    if (b.p === "top" || b.p === "bottom") { const P = b.p === "top" ? PT : PB, t = b.s, a = 1 - t, x = a * a * P.ax + 2 * a * t * P.cx + t * t * P.tx, y = a * a * P.ay + 2 * a * t * P.cy + t * t * P.ty, p = Mp(G, x, y); return [p[0], p[1], b.rx * sc, b.ry * sc, Math.atan2(P.ty - P.ay, P.tx - P.ax) + Math.atan2(G[1], G[0])]; }
    const c = coreG[+b.p[4]]; const M = Mm(G, c.M), p = Mp(M, 0, 0), q = Mp(M, 1, 0), r2 = Mp(M, 0, 1); return [p[0], p[1], b.rx * Math.hypot(q[0] - p[0], q[1] - p[1]), b.ry * Math.hypot(r2[0] - p[0], r2[1] - p[1]), Math.atan2(q[1] - p[1], q[0] - p[0])];
  }
  function blobCol(b) { if (b.c === "orbitheat") { const x = 23 * Math.cos(b.s), y = 47 * Math.sin(b.s); return heatAt(((x + 23) / 46 - (y + 47) / 94 + 1) / 2); } if (b.c === "lineheat") { const x = 54.33 * Math.cos(b.s) + 3.6, y = 21.96 * Math.sin(b.s) - 7.8; return heatAt(((x + 49) / 99 - (y + 3) / 17.13 + 1) / 2); } if (b.c === "line") return COL.line; if (b.c === "disc") return COL.disc; return COL.core[+b.c[4]] || COL.disc; }
  function drawBlobs(g, dpr, G, ring, coreG, PT, PB, now, alpha, mAll, sc, only) {
    const fm = S.form && forms.get(S.form) || forms.get("cloud"), N = S.blobs.length, Rb = 45 * sc, t = now / 1000;
    if (mAll > 0.001 && fm && (S.slotsFor !== S.form || S.slotsN !== N)) { const sl2 = []; for (let j = 0; j < N; j++) { let q = null; try { q = fm.place(j, N, 0, ctx); } catch (e) { q = null; } sl2.push([j, q && fin(q[0]) ? q[0] : 0]); }
      const bs = S.blobs.map((b, j) => [j, S.blobsRest[j] ? S.blobsRest[j].x + 0.01 * S.blobsRest[j].y : 0]); bs.sort((a, b) => a[1] - b[1]); sl2.sort((a, b) => a[1] - b[1]); S.slotOf = new Array(N); bs.forEach((b, k) => { S.slotOf[b[0]] = sl2[k][0]; }); S.slotsFor = S.form; S.slotsN = N; }
    const ox = G[4], oy = G[5], fxs = clamp(Math.min(innerWidth - F.x, F.x) / (2.25 * Rb), 0.45, 1);
    for (let j = 0; j < N; j++) { const b = S.blobs[j], m = Math.max(F[b.p].melt, mAll); if (m <= 0.001) continue; if (only && (only === "disc") !== (b.p === "disc")) continue;
      const hm = blobHome(b, G, ring, coreG, PT, PB); let x = hm[0], y = hm[1], rx = hm[2], ry = hm[3], ang = hm[4]; const own = blobCol(b); let col = own;
      const jig = m * 1.6 * sc; x += Math.sin(t * 2.3 + b.ph) * jig; y += Math.cos(t * 1.9 + b.ph * 1.3) * jig;
      const roundness = sm(m / 0.8), r0 = Math.sqrt(rx * ry); rx = lerp(rx, r0 * 1.15, roundness); ry = lerp(ry, r0 * 1.15, roundness);
      if (mAll > 0.001 && fm) { let q = null; try { q = fm.place(S.slotOf ? S.slotOf[j] : j, N, t, ctx); } catch (e) { q = null; fail("form " + S.form, e); }
        if (q && fin(q[0]) && fin(q[1])) { const d = 0.35 * (j % 7) / 6, e = io(clamp((F.morph - d) / 0.65, 0, 1)), tx = ox + q[0] * Rb * fxs, ty = oy + q[1] * Rb, tr = Math.max(0.3, (fin(q[2]) ? q[2] : 0.25) * Rb), bow = Math.sin(Math.PI * e) * 0.22 * Math.hypot(tx - x, ty - y) * b.side;
          const dx = tx - x, dy = ty - y, dl = Math.hypot(dx, dy) || 1; x = lerp(x, tx, e) - dy / dl * bow; y = lerp(y, ty, e) + dx / dl * bow; rx = lerp(rx, tr, e); ry = lerp(ry, tr, e); col = mixc(own, colKey(q[3], own), sm(e / 0.6)); } }
      blob(g, dpr, x, y, rx, ry, ang, col, 1 - sm(m / 0.8), alpha * sm(m / 0.12)); }
  }


  form("cloud", { place: (j, n, t) => { const r = 1.3 * Math.sqrt((j + 0.5) / n), a = j * 2.39996 + t * 0.35; return [r * Math.cos(a), r * Math.sin(a) * 0.9, 0.26, "own"]; } });
  form("bump", { place: (j, n) => { const x = -1.9 + 3.8 * (j + 0.5) / n, hgt = Math.exp(-x * x / (2 * 0.5 * 0.5)); return [x, 0.9 - 1.95 * hgt, 0.14 + 0.14 * hgt, "out"]; } });
  form("gabor", { place: (j, n, t) => { const x = -2.1 + 4.2 * (j + 0.5) / n, env = Math.exp(-x * x / (2 * 0.8 * 0.8)), y = -1.1 * env * Math.cos(TAU * x / 1.05 - t * 3); return [x, y, 0.12 + 0.11 * env, y < 0 ? "out" : "in"]; } });
  form("bar", { place: (j, n, t) => { const c = j % 2, k = Math.floor(j / 2), m = Math.ceil(n / 2), hgt = 0.86 + 0.08 * Math.sin(t * 2.2), f = (k + 0.5) / m; return [c ? 0.24 : -0.24, 1.25 - 2.5 * hgt * f, 0.2, "heat:" + (0.3 + 0.7 * f).toFixed(3)]; } });
  form("ring", { place: (j, n, t) => { const a = TAU * j / n + t * 0.6; return [1.25 * Math.cos(a), 1.25 * Math.sin(a), 0.16, "heat:" + ((j / n) % 1).toFixed(3)]; } });
  form("heart", { place: (j, n) => { const a = TAU * j / n, x = 16 * Math.pow(Math.sin(a), 3), y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); return [x / 13, y / 13 - 0.1, 0.17, "core0"]; } });


  const FXK = { puff: 1, spark: 1, ember: 1, blob: 1, heart: 1, star: 1, ring: 1, drop: 1, question: 1, exclaim: 1, note: 1 };
  function fx(kind, o) {
    if (!S || !S.on || S.reduced || !FXK[kind]) return false; const u = S.Z.unit, n = clamp(Math.round(o.n || (kind === "puff" ? 4 : kind === "spark" ? 6 : 1)), 1, 12);
    for (let i = 0; i < n; i++) { if (S.fx.length >= 40) S.fx.shift(); const dir = o.dir != null ? o.dir + (rnd() - 0.5) * (o.spread == null ? 1.2 : o.spread) : (kind === "puff" ? (i % 2 ? 0 : Math.PI) + (rnd() - 0.5) * 0.6 : kind === "ember" || kind === "heart" || kind === "note" || kind === "question" || kind === "exclaim" ? -Math.PI / 2 + (rnd() - 0.5) * 0.7 : rnd() * TAU);
      const sp = (o.speed || ({ puff: 40, spark: 160, ember: 22, blob: 70, heart: 34, star: 0, ring: 0, drop: 30, question: 26, exclaim: 30, note: 34 })[kind]) * (0.7 + 0.6 * rnd());
      S.fx.push({ k: kind, x: S.B.x + (o.x || 0) + (kind === "puff" ? (i - (n - 1) / 2) * 9 : 0), y: S.B.y + (o.y != null ? o.y : kind === "question" || kind === "exclaim" || kind === "note" || kind === "heart" ? -62 * u : 0), vx: Math.cos(dir) * sp, vy: Math.sin(dir) * sp, life: o.life || ({ puff: 520, spark: 420, ember: 1600, blob: 700, heart: 1300, star: 1700, ring: 380, drop: 900, question: 1100, exclaim: 900, note: 1300 })[kind], age: 0, r: (o.size || 1) * ({ puff: 7, spark: 3, ember: 2, blob: 5, heart: 5, star: 4, ring: 30, drop: 3, question: 7, exclaim: 7, note: 6 })[kind] * u / 0.594, ph: rnd() * TAU, i, n, c: o.color || null }); }
    kick(); return true;
  }
  function drawFx(g, dpr, ox, oy, now, alpha) {
    if (!S.fx.length) return; const dt = S.dt, Lx = S.cvL, Ty = S.cvT;
    for (let i = S.fx.length - 1; i >= 0; i--) { const p = S.fx[i]; p.age += dt; if (p.age >= p.life) { S.fx.splice(i, 1); continue; } const f = p.age / p.life, h = dt / 1000;
      if (p.k === "star") { const a = p.ph + now / 260 + p.i * TAU / p.n; p.x = S.B.x + Math.cos(a) * 30 * S.Z.unit / 0.594; p.y = S.B.y - 40 * S.Z.unit / 0.594 + Math.sin(a) * 7; } else { p.x += p.vx * h; p.y += p.vy * h; if (p.k === "spark" || p.k === "drop") p.vy += 600 * h; p.vx *= Math.exp(-h * 2); p.vy *= p.k === "spark" || p.k === "drop" ? 1 : Math.exp(-h * 1.5); }
      const X = p.x - Lx, Y = p.y - Ty, a = alpha * (1 - sm((f - 0.6) / 0.4)) * sm(f / 0.08); if (a <= 0.003) continue; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.globalAlpha = a;
      const c = p.c ? colKey(p.c) : null;
      if (p.k === "puff") { g.fillStyle = rgba(COL.dark ? [150, 160, 175] : [160, 168, 180], 0.5); g.beginPath(); g.arc(X, Y, p.r * (0.6 + f), 0, TAU); g.fill(); }
      else if (p.k === "spark" || p.k === "star") { const s = p.r * (p.k === "star" ? 1 : 1 - f * 0.5); g.fillStyle = rgba(c || (p.k === "star" ? COL.core[2] : COL.core[p.i % 3]), 1); g.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? s * 0.38 : s, an = k * Math.PI / 4 + p.ph; if (k) g.lineTo(X + Math.cos(an) * r, Y + Math.sin(an) * r); else g.moveTo(X + Math.cos(an) * r, Y + Math.sin(an) * r); } g.closePath(); g.fill(); }
      else if (p.k === "ember" || p.k === "blob") blob(g, dpr, X, Y, p.r * (1 - 0.3 * f), p.r * (1 - 0.3 * f), 0, c || COL.core[p.i % 3], 0.3, a);
      else if (p.k === "ring") { g.strokeStyle = rgba(c || COL.core[1], 0.8); g.lineWidth = 2; g.beginPath(); g.arc(X, Y, p.r * (0.3 + 0.9 * f), 0, TAU); g.stroke(); }
      else if (p.k === "heart") { const s = p.r * (0.8 + 0.4 * sm(f / 0.2)); g.fillStyle = rgba(c || COL.core[0], 1); g.beginPath(); g.moveTo(X, Y + s * 0.9); g.bezierCurveTo(X - s * 1.6, Y - s * 0.2, X - s * 0.6, Y - s * 1.3, X, Y - s * 0.45); g.bezierCurveTo(X + s * 0.6, Y - s * 1.3, X + s * 1.6, Y - s * 0.2, X, Y + s * 0.9); g.fill(); }
      else if (p.k === "drop") { g.fillStyle = rgba(c || [120, 190, 240], 0.9); g.beginPath(); g.moveTo(X, Y - p.r * 1.6); g.quadraticCurveTo(X + p.r, Y, X, Y + p.r); g.quadraticCurveTo(X - p.r, Y, X, Y - p.r * 1.6); g.fill(); }
      else if (p.k === "question" || p.k === "exclaim" || p.k === "note") { const s = p.r, pop = 1 + 0.25 * Math.sin(Math.min(1, f * 4) * Math.PI); g.strokeStyle = rgba(c || COL.text, 0.95); g.fillStyle = g.strokeStyle; g.lineWidth = Math.max(1.6, s * 0.28); g.beginPath();
        if (p.k === "question") { g.arc(X, Y - s * 0.45 * pop, s * 0.42 * pop, Math.PI * 1.05, Math.PI * 2.3); g.lineTo(X, Y + s * 0.15 * pop); g.stroke(); g.beginPath(); g.arc(X, Y + s * 0.62 * pop, g.lineWidth * 0.55, 0, TAU); g.fill(); }
        else if (p.k === "exclaim") { g.moveTo(X, Y - s * 0.9 * pop); g.lineTo(X, Y + s * 0.2 * pop); g.stroke(); g.beginPath(); g.arc(X, Y + s * 0.62 * pop, g.lineWidth * 0.55, 0, TAU); g.fill(); }
        else { g.moveTo(X + s * 0.35, Y + s * 0.5); g.lineTo(X + s * 0.35, Y - s * 0.8); g.lineTo(X + s * 0.85, Y - s * 0.55); g.stroke(); g.beginPath(); g.ellipse(X, Y + s * 0.55, s * 0.4, s * 0.3, -0.4, 0, TAU); g.fill(); } } }
    g.globalAlpha = alpha;
  }


  function buildCanvas() {
    const Z = S.Z, dpr = Math.min(Z.dprMax, Math.max(1, window.devicePixelRatio || 1)); S.dpr = dpr;
    S.cv.style.width = S.cv.style.height = Z.CS + "px"; S.cv.width = S.cv.height = Math.round(Z.CS * dpr); S.cvL = S.cvT = null;
    S.hit.style.width = S.hit.style.height = 2 * Z.hitR + "px"; S.hL = S.hT = null;
    S.blobs = makeBlobs(Z.blobs); S.capx = Z.small ? 1.7 : 2.2;
    S.blobsRest = S.blobs.map(b => { const part = b.p; let x = b.x, y = b.y; if (part === "orbit") { const tau = ICON.orbit.tau, r = ICON.orbit.roll, X = 47 * Math.cos(tau) * Math.cos(b.s), Y = 47 * Math.sin(b.s); x = X * Math.cos(r) - Y * Math.sin(r); y = X * Math.sin(r) + Y * Math.cos(r); } else if (part === "lower" || part === "line") { const I = part === "lower" ? ICON.lower : ICON.line, cx = part === "lower" ? I.cx : ICON.lower.cx + I.dx, cy = part === "lower" ? I.cy : ICON.lower.cy + I.dy, X = I.r * Math.cos(b.s), Y = I.r * I.sel * Math.sin(b.s); x = cx + X * Math.cos(I.roll) - Y * Math.sin(I.roll); y = cy + X * Math.sin(I.roll) + Y * Math.cos(I.roll); } else if (part === "top" || part === "bottom") { x = 0; y = (part === "top" ? -1 : 1) * (45 + 15 * b.s); } return { part, x, y, rx: b.rx, ry: b.ry }; });
    S.slotsFor = null;
    ctx.size.unit = Z.unit; ctx.size.r = 49 * Z.unit; ctx.size.icon = Z.icon; ctx.small = Z.small;
  }
  function mountDom() {
    const lay = document.createElement("div"); lay.className = "gsp-layer"; lay.setAttribute("aria-hidden", "true");
    const cv = document.createElement("canvas"); cv.className = "gsp-cv"; cv.setAttribute("aria-hidden", "true");
    const hit = document.createElement("div"); hit.className = "gsp-hit"; hit.setAttribute("aria-hidden", "true");
    const pr = document.createElement("div"); pr.className = "gsp-safe";
    lay.append(cv, hit, pr); document.body.appendChild(lay);
    S.lay0 = lay; S.cv = cv; S.hit = hit; S.safeProbe = pr; S.g = cv.getContext("2d");
    hit.addEventListener("pointerdown", onPress); hit.addEventListener("pointermove", onPressMove);
    hit.addEventListener("pointerup", e => onPressUp(e, false)); hit.addEventListener("pointercancel", e => onPressUp(e, true)); hit.addEventListener("lostpointercapture", e => { if (S && S.pressId === e.pointerId) onPressUp(e, true); });
    hit.addEventListener("contextmenu", e => { try { e.preventDefault(); } catch (er) {} });
    hit.addEventListener("dragstart", e => { try { e.preventDefault(); } catch (er) {} });
  }


  function kick() { if (!S || !S.on || S.raf || S.inFrame || document.hidden) return; S.last = performance.now() - 16.7; S.raf = requestAnimationFrame(frame); }
  function frame(now) {
    S.raf = 0; if (!S || !S.on) return; const t0 = performance.now(); S.inFrame = true;
    let dt = now - S.last; S.last = now; if (!(dt > 0.5)) dt = 16.7; if (dt > 50) dt = 50; S.now = now; S.dt = dt; S.frames++;
    if (S.intv.length > 600) S.intv.shift(); S.intv.push(dt);
    try {
      if (S.lay.dirty && now - S.lay.t > 350) measure();
      if (now - (S.underT || 0) > 1500) { S.underT = now; checkUnder(); }
      updCtx(now, dt);
      if (!S.still) { physics(now, dt); brain(now, dt); } compose(now, dt); draw(now);
      if (S.game && now - S.gameT > 250) { const d = (now - S.gameT) / 1000; S.gameT = now; gameTick(d); }
    } catch (e) { fail("frame", e); if (++S.bad > 20) { stop(); return; } }
    S.inFrame = false; if (!S || !S.on) return; const w = performance.now() - t0; if (S.work.length > 600) S.work.shift(); S.work.push(w);
    if (S.still && S.drawn) { S.parked = true; return; }
    if (S.st === "sleep" && !S.nap && S.sleepSettle && now - S.sleepSettle > 2600 && !S.stirOn && !slMov && !S.fx.length && !S.active.some(it => it.d.layer !== "base" && it.out < 0)) { S.parked = true; emit("rest", {}); return; }
    if (S.st === "sleep" && S.nap && now - (S.sleepSettle || now) > 2600 && !S.stirOn && !slMov && !S.fx.length && !S.active.some(it => it.d.layer !== "base" && it.out < 0)) { S.parked = true; return; }
    S.parked = false; S.raf = requestAnimationFrame(frame);
  }
  function updCtx(now, dt) {
    const B = S.B, P = S.ptr; ctx.now = now; ctx.dt = dt; ctx.t = (now - S.t0) / 1000; ctx.mode = S.mode; ctx.state = S.st; ctx.stateMs = now - S.stT; ctx.small = S.Z.small; ctx.reduced = S.reduced; ctx.touch = !!S.touch;
    ctx.theme = COL.dark ? "dark" : "light"; ctx.cvd = COL.cvd; ctx.view.w = innerWidth; ctx.view.h = innerHeight;
    const cb = ctx.body; cb.x = B.x; cb.y = B.y; cb.vx = B.vx; cb.vy = B.vy; cb.speed = Math.hypot(B.vx, B.vy); cb.rot = B.rot; cb.ground = !!B.ground; cb.peek = !!(S.home && S.home.peek); if (S.home) { cb.home.x = S.home.x; cb.home.y = S.home.y; }
    cb.wall = S.st === "cling" || S.st === "slide" ? S.cling.side : (S.impT && now - S.impT < 250 ? ctx.impact.side : null);
    const cp = ctx.pointer; cp.x = P.x; cp.y = P.y; cp.vx = P.vx; cp.vy = P.vy; cp.speed = Math.hypot(P.vx, P.vy); cp.type = P.type; cp.down = !!P.down; cp.idleMs = P.t ? now - P.moved : 1e9; cp.near = P.x >= 0 ? Math.hypot(P.x - B.x, P.y - B.y) : 1e9; cp.over = P.over || "none"; cp.on = cp.near < 49 * S.Z.unit;
    ctx.press = S.press && S.press.phase !== "grab" ? { x: S.press.x, y: S.press.y, ms: now - S.press.t0, phase: S.press.phase, dx: S.press.nx || 0, dy: S.press.ny || -1 } : null;
    ctx.slider = S.sl ? { x: S.sl.tx, y: S.sl.ty, dir: S.sl.dir, vertical: S.sl.vert, active: true, ms: now - S.sl.t0 } : null;
    ctx.figure = S.figEl ? (() => { const r = S.figRect && now - S.figRectT < 300 ? S.figRect : (S.figRect = S.figEl.getBoundingClientRect(), S.figRectT = now, S.figRect); return { x: S.figX, y: S.figY, left: r.left, top: r.top, right: r.right, bottom: r.bottom, id: S.figEl.id || "", visit: !!S.visit, ms: now - S.figT }; })() : null;
    ctx.read = S.readBlock ? { x: S.fk === "read" ? S.atX : S.readBlock.l - scrollX, y: S.readY, kind: S.readBlock.k || "p" } : null;
    ctx.flick.ms = S.flicks.length ? now - S.flicks[S.flicks.length - 1] : 1e9; S.flicks = S.flicks.filter(t => now - t < 20000); ctx.flick.count = S.flicks.length; ctx.flick.dizzy = clamp(S.dizzy, 0, 2) / 2;
    ctx.impact.ms = S.impT ? now - S.impT : 1e9;
    ctx.game = S.game ? { state: S.gstate, bias: S.bias } : null;
  }


  function start(mode) {
    mode = mode === "game" ? "game" : "pet";
    if (S && S.on) { if (S.mode !== mode) { S.mode = mode; emit("mode", { mode }); gameSync(); } if (S.st === "sleep") wakeUp(); kick(); return true; }
    if (!document.body) return false;
    const now = performance.now();
    S = { on: true, mode, t0: now, now, last: now, dt: 16, raf: 0, frames: 0, work: [], intv: [], bad: 0, Z: sizeClass(), fade: 1,
      B: { x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0, pvx: 0, pvy: 0, rot: 0, w: 0, ground: false }, sp: [0, 0, 0, 0], lean: 0, crouch: 0,
      st: "enter", stT: now, stD: {}, tr: null, active: [], lastIn: {}, lastClip: "", nextAct: now + 2200, nextBlink: now + 1400, autoBlink: 0,
      ptr: { x: -1, y: -1, vx: 0, vy: 0, t: 0, moved: 0, type: "", el: null, over: "none", fig: null, down: false }, tch: { x: 0, y: 0, t: 0 }, scr: { y: scrollY, vy: 0, t: 0 }, scrOff: [0, 0],
      lay: { dirty: true, t: -1e9, blocks: [], figs: [], colR: innerWidth - 16, toc: null }, safe: { top: 0, right: 0, bottom: 0, left: 0 },
      gz: [0, 0, 0, 0], ms: [0, 0], msT: 0, eyeX: 0, eyeY: 0, glowA: 0, narA: 0, droopA: 0, flare: 0, flinch: 0, emerge: 1,
      fk: "none", fkT: now, atX: 0, atY: 0, readBlock: null, readY: null, rs: null, dodgeY: 0, dodgeUntil: 0, lastAct: now,
      sl: null, figEl: null, figT: 0, figX: 0, figY: 0, visit: null, press: null, pressId: null, grab: null, flicks: [], hits: [], dizzy: 0,
      partJ: {}, PMc: {}, stirOn: false, fx: [], blobs: [], reduced: matchMedia("(prefers-reduced-motion: reduce)").matches, touch: false,
      game: null, gstate: null, bias: null, gameT: now, lvx: 0, lvy: 0 };
    hv.fill(0); sl.fill(0); spend[0] = spend[1] = 0; slMov = false;
    readColours(); mountDom(); buildCanvas(); readSafe();
    try { measure(); } catch (e) { fail("measure", e); }
    S.home = home(); const W = innerWidth, Z = S.Z;
    if (S.reduced) { S.B.x = S.safe.left + 49 * Z.unit + 14; S.B.y = innerHeight - S.safe.bottom - 61.5 * Z.unit - 12; S.st = "calm"; }
    else { S.B.x = W + 70 * Z.unit; S.B.y = S.home.y - 30; travelTo(S.home.x, S.home.y, { h: 60, ms: 900, track: () => { const q = S.home; return [q.x, q.y]; } }); }
    S.ro = new ResizeObserver(() => { if (S) S.lay.dirty = true; }); S.ro.observe(document.body);
    S.mo = new MutationObserver(() => { if (!S) return; const k = COL.key; readColours(); if (COL.key !== k) { want("theme", { react: true }); emit("theme", { theme: COL.dark ? "dark" : "light", cvd: COL.cvd }); kick(); } }); S.mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-cvd"] });
    S.mqD = matchMedia("(prefers-color-scheme: dark)"); S.onD = () => { if (!S) return; readColours(); want("theme", { react: true }); kick(); }; S.mqD.addEventListener("change", S.onD);
    S.mqR = matchMedia("(prefers-reduced-motion: reduce)"); S.onR = e => { if (!S) return; S.reduced = e.matches; if (S.reduced) { S.active.forEach(it => { if (it.d.layer === "body" || it.d.layer === "over") beginOut(it); }); setSt("calm"); S.tr = null; } else { setSt("follow"); } kick(); }; S.mqR.addEventListener("change", S.onR);
    sensors(true); gameSync();
    emit("start", { mode }); emit("appear", {}); setTimeout(() => { if (S && S.on) want("greet", { react: true, force: true }); }, S.reduced ? 100 : 950);
    kick(); return true;
  }
  function stop() {
    if (!S) return; const s = S; s.on = false; if (s.raf) cancelAnimationFrame(s.raf); s.raf = 0; sensors(false);
    try { s.ro && s.ro.disconnect(); s.mo && s.mo.disconnect(); s.mqD && s.mqD.removeEventListener("change", s.onD); s.mqR && s.mqR.removeEventListener("change", s.onR); } catch (e) {}
    gameStop(); if (s.lay0) s.lay0.remove(); if (s.gameEl) s.gameEl.remove(); if (s.gameTimer) clearInterval(s.gameTimer);
    S = null; emit("stop", {});
  }


  const GKEY = "companion-game"; let GMOD = null;
  const clean = s => { s = String(s == null ? "" : s).replace(/[\u0027\u2019;]/g, "").replace(/\s+/g, " ").trim().slice(0, 28); if (/score/i.test(s)) { warn("score", "a game label must not use the word score"); return ""; } return s; };
  function gLoad() { try { const v = JSON.parse(localStorage.getItem(GKEY) || "null"); if (v && typeof v === "object" && v.s && typeof v.s === "object") return v; } catch (e) {} return { v: 1, t: Date.now(), s: {} }; }
  function gSave() { if (!S || !S.gstate) return false; try { const txt = JSON.stringify({ v: 1, t: Date.now(), s: S.gstate }); if (txt.length > 8000) { warn("gsize", "game state above 8000 characters, not saved"); return false; } localStorage.setItem(GKEY, txt); return true; } catch (e) { return false; } }
  function gameSync() { if (!S) return; if (S.mode === "game" && GMOD && !S.game) gameStart(); else if (S.mode !== "game" && S.game) gameStop(); }
  function gameStart() {
    const rec = gLoad(); S.gstate = rec.s; S.game = GMOD; S.bias = null; S.gameT = S.now;
    const el = document.createElement("div"); el.className = "gsp-game"; el.setAttribute("role", "group"); el.setAttribute("aria-label", "Companion game"); el.innerHTML = "<div class=\"gsp-chips\"></div><div class=\"gsp-acts\"></div>"; document.body.appendChild(el); S.gameEl = el; S.glift = -1;
    el.addEventListener("click", e => { const b = e.target.closest && e.target.closest("button[data-act]"); if (!b || !S || !S.game) return; try { S.game.act && S.game.act(b.dataset.act, S.gstate, api); } catch (er) { fail("game act", er); } gSave(); gameRender(); });
    try { const away = Math.min(259200, Math.max(0, (Date.now() - (rec.t || Date.now())) / 1000)); if (GMOD.away && away > 1) GMOD.away(away, S.gstate, api); } catch (e) { fail("game away", e); }
    try { GMOD.start && GMOD.start(api, S.gstate); } catch (e) { fail("game start", e); }
    S.gameTimer = setInterval(() => { if (S && S.game && !document.hidden && (S.parked || !S.raf)) gameTick(0.25); }, 250);
    gameRender(); emit("game", { phase: "start" });
  }
  function gameStop() { if (!S || !S.game) return; try { S.game.stop && S.game.stop(api, S.gstate); } catch (e) { fail("game stop", e); } gSave(); if (S.gameEl) S.gameEl.remove(); S.gameEl = null; if (S.gameTimer) clearInterval(S.gameTimer); S.gameTimer = 0; S.game = null; S.bias = null; emit("game", { phase: "stop" }); }
  function gameTick(d) { if (!S || !S.game) return; try { S.game.tick && S.game.tick(d, S.gstate, api); } catch (e) { fail("game tick", e); } emit("tick", { dt: d }); if ((S.gsv = (S.gsv || 0) + d) > 5) { S.gsv = 0; gSave(); } gameRender(); }
  function gameRender() {
    if (!S || !S.game || !S.gameEl) return; let chips = [], acts = [];
    const lift = S.st === "calm" || S.st === "sleep" ? Math.round(126 * S.Z.unit + 18) : 0; if (lift !== S.glift) { S.glift = lift; S.gameEl.style.setProperty("--gsp-lift", lift + "px"); }
    try { chips = (S.game.chips && S.game.chips(S.gstate, api)) || []; } catch (e) { fail("game chips", e); } try { acts = (S.game.actions && S.game.actions(S.gstate, api)) || []; } catch (e) { fail("game actions", e); }
    const C = S.gameEl.firstChild, A = S.gameEl.lastChild;
    const ck = JSON.stringify(chips.map(c => [c.id, c.label, c.value == null ? null : Math.round(clamp(+c.value, 0, 1) * 100), c.text || ""]));
    if (ck !== S.gck) { S.gck = ck; C.textContent = ""; chips.slice(0, 6).forEach(c => { const l = clean(c.label); if (!l) return; const s = document.createElement("span"); s.className = "gsp-chip"; const b = document.createElement("b"); b.textContent = l; s.appendChild(b);
      if (c.value != null && fin(+c.value)) { const m = document.createElement("i"); m.className = "gsp-meter"; const f = document.createElement("i"); f.style.width = Math.round(clamp(+c.value, 0, 1) * 100) + "%"; m.appendChild(f); s.appendChild(m); s.setAttribute("aria-label", l + " " + Math.round(clamp(+c.value, 0, 1) * 100) + " percent"); }
      else if (c.text) { const t = document.createElement("span"); t.textContent = clean(c.text); s.appendChild(t); } C.appendChild(s); }); }
    const ak = JSON.stringify(acts.map(a => [a.id, a.label, !!a.off])); if (ak !== S.gak) { S.gak = ak; A.textContent = ""; acts.slice(0, 4).forEach(a => { const l = clean(a.label); if (!l || typeof a.id !== "string") return; const b = document.createElement("button"); b.type = "button"; b.dataset.act = a.id; b.textContent = l; if (a.off) b.disabled = true; A.appendChild(b); }); }
  }
  api.game = {
    register: mod => { if (mod === null) { GMOD = null; if (S && S.game) gameStop(); return true; } if (!mod || typeof mod !== "object") return false; GMOD = mod; if (S) gameSync(); return true; },
    state: () => S && S.gstate ? S.gstate : null,
    save: () => gSave(),
    bias: obj => { if (!S) return; S.bias = obj && typeof obj === "object" ? Object.assign({}, obj) : null; },
    active: () => !!(S && S.game),
    reset: () => { try { localStorage.removeItem(GKEY); } catch (e) {} if (S && S.game) { S.gstate = {}; } }
  };


  const stat = a => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); return { n: s.length, median: +s[s.length >> 1].toFixed(3), p95: +s[Math.min(s.length - 1, Math.floor(s.length * 0.95))].toFixed(3), max: +s[s.length - 1].toFixed(3) }; };
  const poseCopy = () => JSON.parse(JSON.stringify({ g: Object.assign({}, ...GK.map(k => ({ [k]: F[k] }))), eye: F.eye, reach: F.reach, parts: Object.fromEntries(PARTS.map(p => [p, F[p]])), strain: FS }));
  api.debug = {
    state: () => S ? { on: S.on, mode: S.mode, state: S.st, x: +S.B.x.toFixed(1), y: +S.B.y.toFixed(1), vx: Math.round(S.B.vx), vy: Math.round(S.B.vy), rot: +S.B.rot.toFixed(3), home: S.home, focus: { kind: S.fk, x: Math.round(S.atX), y: Math.round(S.atY) }, eye: [+S.eyeX.toFixed(3), +S.eyeY.toFixed(3)],
      active: S.active.map(it => ({ name: it.d.name, layer: it.d.layer, w: +it.w.toFixed(3), t: +it.t.toFixed(3), out: it.out >= 0 })), small: S.Z.small, icon: S.Z.icon, canvas: S.Z.CS, dpr: S.dpr, hitR: S.Z.hitR, reduced: S.reduced, parked: !!S.parked, raf: !!S.raf, stir: S.stirOn, slosh: slMov, turn: +(sl[0] - TAU * Math.round(sl[0] / TAU)).toFixed(3), press: S.press ? S.press.phase : null, emerge: +S.emerge.toFixed(3), strain: +Math.hypot(FS.group[0], FS.group[1]).toFixed(4), frames: S.frames, morph: +F.morph.toFixed(3), form: S.form, game: !!S.game } : { on: false },
    pose: () => S ? poseCopy() : null,
    ctx: () => JSON.parse(JSON.stringify(ctx)),
    frames: () => S ? { work: stat(S.work), interval: stat(S.intv) } : null,
    resetFrames: () => { if (S) { S.work = []; S.intv = []; } },
    events: () => evlog.slice(),
    errors: () => errs.slice(),
    tune: o => { if (o && typeof o === "object") for (const k in o) if (k in TUNE && fin(+o[k])) TUNE[k] = +o[k]; return Object.assign({}, TUNE); },
    seed: n => { seed0 = (+n || 1) >>> 0; },
    flick: (vx, vy) => { if (!S || !S.on || S.reduced) return false; const B = S.B; B.vx = +vx || 0; B.vy = +vy || 0; B.w = clamp(B.vx / (49 * S.Z.unit) * 0.35, -26, 26); B.ground = false; S.landed = false; S.clung = false; S.hits = []; S.tr = null; S.flicks.push(S.now); setSt("thrown"); want("throw", { react: true, force: true }); emit("flick", { vx: Math.round(B.vx), vy: Math.round(B.vy), speed: Math.round(Math.hypot(B.vx, B.vy)) }); kick(); return true; },
    gust: v => { if (!S) return false; slKick(+v || 0, 0); kick(); return true; },
    place: (x, y) => { if (!S) return; S.B.x = +x; S.B.y = +y; S.tr = null; setSt("follow"); },
    still: on => { if (!S) return; S.still = !!on; S.parked = false; if (!on) kick(); else { S.drawn = 0; kick(); } },
    box: () => S && S.lastBox ? { left: S.lastBox[0], top: S.lastBox[1], size: S.lastBox[2], x: +F.x.toFixed(1), y: +F.y.toFixed(1), hit: S.hit.getBoundingClientRect().toJSON(), pe: S.hitPE } : null,

    run: name => { const d = clips.get(name); if (!d) return { name, ok: false, error: "no such clip" }; const r = blank(); let worst = 0, nan = 0, err = null, frames = 0; const info = { seed: 0.37, side: 1, play: 1, ms: 0, dur: d.dur, loops: 0, weight: 1, opts: {} };
      const n = Math.max(2, Math.ceil(d.dur / 16.7)); const scan = (o, f) => { for (const k in o) { const v = o[k]; if (v && typeof v === "object") scan(v, f); else f(v); } };
      for (let i = 0; i <= n; i++) { const t = i / n; zero(r); info.ms = t * d.dur; try { d.update(Math.min(t, d.loop ? 0.9999 : 1), r, ctx, info); } catch (e) { err = String(e && e.message || e).slice(0, 160); break; } frames++; scan(r, v => { if (typeof v === "number" && !fin(v)) nan++; }); }
      let end = 0; if (!err) { zero(r); try { d.update(d.loop ? 0 : 1, r, ctx, info); } catch (e) { err = String(e); } scan(r, v => { if (typeof v === "number" && fin(v) && Math.abs(v) > end) end = Math.abs(v); }); }
      let seam = 0; if (!err && d.loop) { const a = blank(), b = blank(); try { d.update(0, a, ctx, info); d.update(0.99999, b, ctx, info); } catch (e) {} const fa = [], fb = []; scan(a, v => fa.push(v)); scan(b, v => fb.push(v)); fa.forEach((v, i) => { if (fin(v) && fin(fb[i])) seam = Math.max(seam, Math.abs(v - fb[i])); }); }
      return { name, ok: !err && !nan, error: err, frames, nan, end: +end.toFixed(4), seam: +seam.toFixed(4), loop: d.loop, layer: d.layer, tags: d.tags, principles: d.principles.length }; },
    runAll: () => [...clips.keys()].map(n => api.debug.run(n)),
    rest: () => { if (!S) return null; let m = 0; const chk = (o, base) => { for (const k in o) { const v = o[k]; if (v && typeof v === "object") chk(v, k); else if (typeof v === "number") { if (base === "" && (k === "x" || k === "y" || k === "rot" || k === "tilt")) continue; m = Math.max(m, Math.abs(v)); } } };
      const live = S.active.filter(it => it.d.layer !== "base"); return { clipsLeft: live.map(it => it.d.name), springs: S.stirOn || slMov, strain: +Math.hypot(S.sp[0], S.sp[1]).toFixed(4) }; },
    lint: () => { const out = []; for (const d of clips.values()) { const r = api.debug.run(d.name), issues = []; if (!d.tags.length) issues.push("no tags"); if (!d.principles.length) issues.push("no principles"); if (d.principles.some(p => !PRINCIPLES[p])) issues.push("unknown principle"); if (!r.ok) issues.push("error or not a number"); if (!d.loop && r.end > 0.02) issues.push("does not end at rest (" + r.end + ")"); if (d.loop && r.seam > 0.05) issues.push("loop seam " + r.seam); if (issues.length) out.push({ name: d.name, pack: d.pack, issues }); } return out; },
    setPack: n => { packName = String(n || ""); }
  };
  window.GSPet = api;
})();
} catch (e) { console.error("companion engine", e); }

try { if (window.GSPet) GSPet.debug.setPack("core");


(function packCore() {
  const P = typeof GSPet === "object" ? GSPet : null; if (!P) return;
  const E = P.ease, U = P.util, TAU = Math.PI * 2;
  const sgn = v => v < 0 ? -1 : 1;
  const toward = c => sgn(c.focus.dx || -1);


  P.clip("breathe", { tags: ["base"], layer: "base", loop: true, dur: 3600, principles: ["slow-in-out", "secondary-action", "overlapping", "timing", "appeal"],
    when: c => c.state !== "sleep",
    update(t, r) { const s = Math.sin(TAU * t); r.sq = 0.035 * s; r.y = -1.2 * s; r.eye.glow = 0.05 * Math.sin(TAU * t + 0.6);
      r.orbit.rot = 0.018 * Math.sin(TAU * t - 0.9); r.lower.open = 0.035 * Math.sin(TAU * t - 1.4); r.top.rot = 0.04 * Math.sin(TAU * t - 1.8); r.bottom.rot = -0.025 * Math.sin(TAU * t - 2.1); } });
  P.clip("doze", { tags: ["base", "sleep"], layer: "base", loop: true, dur: 5200, principles: ["slow-in-out", "timing", "secondary-action", "appeal"],
    when: c => c.state === "sleep",
    cues: [[0.45, (c, api) => api.fx("ember", { n: 1, y: -c.size.r * 1.1, x: c.size.r * 0.3 })]],
    update(t, r) { const s = Math.sin(TAU * t); r.sq = 0.06 * s; r.y = -2 * s; r.tilt = 0.07; r.eye.glow = -0.15 + 0.12 * Math.sin(TAU * t - 0.5); r.eye.droop = 0.25;
      r.top.rot = 0.28 + 0.05 * Math.sin(TAU * t - 1); r.bottom.rot = -0.1; r.lower.open = 0.07 * Math.sin(TAU * t - 1.2); r.orbit.rot = 0.03 * Math.sin(TAU * t - 0.7); } });


  P.clip("blink", { tags: ["blink", "eye"], layer: "eye", dur: 190, weight: 6, cooldown: 0, fadeIn: 0, fadeOut: 60, principles: ["timing", "slow-in-out", "secondary-action"],
    update(t, r) { const b = U.pulse(t, 0, 1); r.eye.lid = Math.pow(b, 0.7); r.sq = -0.02 * b; } });
  P.clip("double-blink", { tags: ["blink", "eye"], layer: "eye", dur: 430, weight: 1.4, cooldown: 3000, fadeIn: 0, fadeOut: 60, principles: ["timing", "slow-in-out", "appeal"],
    update(t, r) { r.eye.lid = Math.pow(U.pulse(t, 0, 0.44) + U.pulse(t, 0.56, 1), 0.7); } });
  P.clip("slow-blink", { tags: ["blink", "eye", "content"], layer: "eye", dur: 950, weight: 0.8, cooldown: 9000, principles: ["slow-in-out", "timing", "appeal"],
    update(t, r) { const h = U.hold(t, 0, 0.34, 0.56, 1); r.eye.lid = 0.95 * h; r.eye.glow = 0.15 * h; r.eye.droop = 0.1 * h; } });
  P.clip("look-around", { tags: ["idle", "eye"], layer: "eye", dur: 2400, weight: 1.2, cooldown: 9000, principles: ["pose-to-pose", "timing", "staging", "slow-in-out"],
    update(t, r, c, i) { const s = i.side, g = U.hold(t, 0, 0.06, 0.9, 1); r.eye.gaze = -g;
      r.eye.x = U.keys(t, [[0, 0], [0.07, -0.95 * s, "out"], [0.38, -0.9 * s], [0.46, 0.95 * s, "out"], [0.8, 0.9 * s], [0.9, 0, "inOut"]]); r.eye.y = 0.15 * U.pulse(t, 0.4, 0.55);
      r.top.rot = 0.12 * U.decay(U.lag(t, 0.06), 2, 4) * s - 0.12 * U.decay(U.lag(t, 0.46), 2, 4) * s; } });
  P.clip("nervous-glance", { tags: ["idle", "eye", "nervous"], layer: "eye", dur: 1300, weight: 1, cooldown: 12000, principles: ["timing", "exaggeration", "secondary-action", "appeal"],
    update(t, r, c, i) { const s = i.side, g = U.hold(t, 0, 0.05, 0.85, 1); r.eye.gaze = -g;
      r.eye.x = U.keys(t, [[0, 0], [0.06, 0.9 * s, "out"], [0.22, 0.9 * s], [0.28, -0.9 * s, "out"], [0.46, -0.9 * s], [0.52, 0.7 * s, "out"], [0.68, 0.7 * s], [0.85, 0]]);
      r.eye.narrow = 0.25 * g; r.top.rot = 0.18 * Math.sin(TAU * 5 * t) * g; r.bottom.rot = -0.1 * Math.sin(TAU * 5 * t + 1) * g; r.sq = -0.04 * U.pulse(t, 0, 0.2); } });
  P.clip("glance-viewer", { tags: ["idle", "eye", "viewer"], layer: "eye", dur: 2200, weight: 1.1, cooldown: 14000, principles: ["staging", "appeal", "timing", "slow-in-out"],
    update(t, r) { const h = U.hold(t, 0, 0.12, 0.8, 1); r.eye.gaze = -h; r.eye.narrow = -0.35 * h; r.eye.glow = 0.25 * h; r.eye.size = 0.08 * h; r.eye.lid = U.pulse(t, 0.55, 0.66); } });
  P.clip("theme-blink", { tags: ["theme", "eye"], layer: "eye", dur: 900, cooldown: 1500, principles: ["timing", "secondary-action", "appeal"],
    update(t, r) { const h = U.hold(t, 0, 0.12, 0.35, 0.55); r.eye.narrow = 0.5 * h; r.eye.lid = 0.4 * h + U.pulse(t, 0.6, 0.72) + U.pulse(t, 0.78, 0.9); r.eye.glow = 0.3 * U.pulse(t, 0.5, 1); } });
  P.clip("read-scan", { tags: ["read", "eye"], layer: "eye", dur: 2400, cooldown: 6000, principles: ["timing", "staging", "secondary-action"],
    update(t, r) { const h = U.hold(t, 0, 0.1, 0.9, 1); r.eye.narrow = 0.18 * h; r.eye.y = 0.12 * Math.sin(TAU * 2 * t) * h; r.eye.glow = 0.1 * h; } });


  P.clip("hop", { tags: ["idle", "happy"], dur: 900, weight: 1, cooldown: 7000, principles: ["squash-stretch", "anticipation", "arcs", "follow-through", "slow-in-out", "timing"],
    update(t, r) { const crouch = U.hold(t, 0, 0.2, 0.22, 0.3), air = U.lag(t, 0.25) < 1 && t > 0.25 ? U.arc((t - 0.25) / 0.5, 1) : 0, land = U.pulse(t, 0.74, 0.92);
      r.sq = -0.2 * crouch + 0.16 * U.pulse(t, 0.24, 0.42) - 0.18 * land + 0.05 * U.decay(U.lag(t, 0.9), 1.5, 3);
      r.y = 3 * crouch - 20 * air + 2 * land; r.bottom.len = 0.35 * U.pulse(t, 0.2, 0.36) - 0.25 * land; r.top.rot = 0.18 * U.decay(U.lag(t, 0.3), 2, 4);
      r.cores.y = 2.5 * U.pulse(t, 0.25, 0.5) - 2 * land; r.lower.open = 0.18 * land - 0.1 * U.pulse(t, 0.3, 0.6); } });
  P.clip("jump-spin", { tags: ["idle", "happy"], dur: 1300, weight: 0.55, cooldown: 16000, principles: ["exaggeration", "squash-stretch", "anticipation", "arcs", "timing"],
    update(t, r, c, i) { const crouch = U.hold(t, 0, 0.16, 0.18, 0.24), a = t > 0.22 && t < 0.78 ? (t - 0.22) / 0.56 : -1, land = U.pulse(t, 0.76, 0.94);
      r.sq = -0.24 * crouch + 0.2 * U.pulse(t, 0.2, 0.34) - 0.2 * land; r.y = 4 * crouch - (a >= 0 ? U.arc(a, 38) : 0) + 3 * land;
      r.rot = t < 1 && a >= 0 ? i.side * TAU * E.inOut(a) : 0; r.eye.glow = 0.4 * U.pulse(t, 0.2, 0.9); r.spread = 0.12 * U.pulse(t, 0.3, 0.7); } });
  P.clip("roll", { tags: ["idle"], dur: 1800, weight: 0.9, cooldown: 9000, principles: ["arcs", "timing", "solid-drawing", "follow-through"],
    update(t, r, c, i) { const x = 18 * i.side * U.pulse(t, 0, 1); r.x = x; r.rot = x / Math.max(10, c.size.r); r.sq = -0.04 * U.pulse(t, 0.4, 0.6); r.eye.x = 0.6 * i.side * U.pulse(t, 0, 0.6); } });
  P.clip("ring-spin", { tags: ["idle"], dur: 1600, weight: 0.8, cooldown: 10000, principles: ["secondary-action", "follow-through", "timing", "appeal"],
    update(t, r, c, i) { r.lower.spin = t < 1 ? i.side * TAU * E.inOut(t) : 0; r.orbit.spin = 0.5 * U.pulse(t, 0.1, 0.9); r.eye.x = 0.5 * Math.sin(TAU * E.inOut(t)) * i.side; r.eye.glow = 0.15 * U.pulse(t, 0, 1); } });
  P.clip("ring-roll", { tags: ["idle", "formation"], dur: 2600, weight: 0.5, cooldown: 25000, principles: ["anticipation", "follow-through", "arcs", "secondary-action", "exaggeration"],
    update(t, r, c, i) { const s = i.side, R = Math.max(10, c.size.r), out = U.keys(t, [[0, 0], [0.15, -0.08], [0.25, 0.1, "out"], [0.55, 1.2, "inOut"], [0.85, 0.05, "inOut"], [0.93, -0.05, "out"], [1, 0, "inOut"]]);
      const off = U.hold(t, 0.12, 0.25, 0.82, 0.95); r.orbit.x = s * out * R; r.orbit.y = -0.12 * R * U.pulse(t, 0.14, 0.3) + 0.08 * R * off; r.orbit.spin = -1.06 * off; r.orbit.rot = -s * out * R / (0.95 * R);
      r.orbit.rot += 0.08 * U.decay(U.lag(t, 0.9), 2, 4); r.eye.x = 0.8 * s * out / 1.2; r.eye.gaze = -0.6 * off; r.eye.glow = 0.2 * off; r.top.rot = 0.2 * U.decay(U.lag(t, 0.88), 2, 4); } });
  P.clip("pole-twitch", { tags: ["idle", "nervous"], dur: 700, weight: 0.9, cooldown: 6000, principles: ["secondary-action", "follow-through", "timing"],
    update(t, r, c, i) { r.top.rot = 0.4 * i.side * U.decay(t, 3, 5); r.bottom.rot = -0.3 * i.side * U.decay(U.lag(t, 0.1), 3, 5); r.top.len = 0.2 * U.pulse(t, 0, 0.3); } });
  P.clip("core-drift", { tags: ["idle", "formation"], dur: 2600, weight: 0.6, cooldown: 18000, principles: ["overlapping", "secondary-action", "arcs", "slow-in-out", "appeal"],
    update(t, r, c, i) { const s = i.side, h = U.hold(t, 0.05, 0.3, 0.65, 0.95), a = TAU * 0.5 * U.lag(t, 0.3) * h; r.core2.melt = 0.9 * h; r.core2.x = s * 16 * h * Math.cos(a * 0.6); r.core2.y = -18 * h + 6 * Math.sin(a) * h;
      const h1 = U.hold(t, 0.15, 0.38, 0.6, 0.9); r.core1.melt = 0.6 * h1; r.core1.x = s * 8 * h1; r.core1.y = -9 * h1; r.eye.glow = 0.3 * h; r.eye.gaze = -0.5 * h; r.eye.x = 0.5 * s * h; } });
  P.clip("melt-wobble", { tags: ["idle", "formation"], dur: 2200, weight: 0.4, cooldown: 20000, principles: ["secondary-action", "timing", "appeal", "solid-drawing"],
    update(t, r) { const h = U.hold(t, 0.05, 0.4, 0.6, 0.95); r.disc.melt = 0.65 * h; r.orbit.melt = 0.4 * U.hold(t, 0.15, 0.45, 0.55, 0.85); r.eye.glow = 0.35 * h; r.sq = 0.06 * Math.sin(TAU * 2 * t) * h; r.lower.open = 0.12 * Math.sin(TAU * 1.5 * t) * h; } });
  P.clip("drop-bounce", { tags: ["idle", "formation"], dur: 1500, weight: 0.5, cooldown: 16000, principles: ["squash-stretch", "exaggeration", "follow-through", "timing"],
    update(t, r) { const d = U.hold(t, 0, 0.25, 0.4, 0.55); r.disc.drop = 0.8 * d; r.top.len = -0.4 * d; const air = t > 0.4 && t < 0.8 ? U.arc((t - 0.4) / 0.4, 1) : 0, land = U.pulse(t, 0.78, 0.95);
      r.y = -16 * air + 2 * land; r.sq = 0.12 * U.pulse(t, 0.38, 0.5) - 0.22 * land + 0.05 * U.decay(U.lag(t, 0.92), 1.5, 3); r.eye.glow = 0.2 * d; } });
  P.clip("stretch", { tags: ["idle", "wake"], dur: 1700, weight: 0.7, cooldown: 20000, principles: ["anticipation", "squash-stretch", "slow-in-out", "follow-through"],
    update(t, r) { const pre = U.hold(t, 0, 0.12, 0.14, 0.22), up = U.hold(t, 0.18, 0.4, 0.6, 0.78); r.sq = -0.12 * pre + 0.28 * up + 0.06 * U.decay(U.lag(t, 0.78), 2, 4);
      r.top.len = 0.5 * up; r.bottom.len = 0.3 * up; r.eye.lid = 0.6 * up; r.eye.glow = 0.2 * up; r.lower.open = -0.15 * up; } });


  P.clip("greet", { tags: ["greet"], dur: 1500, cooldown: 4000, principles: ["appeal", "anticipation", "follow-through", "exaggeration", "staging"],
    update(t, r) { const w = U.hold(t, 0.2, 0.35, 0.8, 1); r.scale = -0.25 * (1 - E.back(Math.min(1, t / 0.3), 1.6)); r.top.root = 0.9 * w; r.top.rot = (0.5 + 0.4 * Math.sin(TAU * 3 * U.lag(t, 0.3))) * w; r.top.len = 0.35 * w; r.top.tip = 0.6 * w;
      r.eye.narrow = -0.35 * w; r.eye.glow = 0.35 * w; r.tilt = -0.06 * w; } });
  P.clip("wave", { tags: ["idle", "greet"], dur: 1600, weight: 0.8, cooldown: 14000, principles: ["anticipation", "follow-through", "arcs", "secondary-action", "appeal"],
    update(t, r) { const w = U.hold(t, 0.08, 0.22, 0.8, 1); r.sq = -0.06 * U.pulse(t, 0, 0.12); r.top.root = 0.9 * w; r.top.rot = (0.5 + 0.45 * Math.sin(TAU * 3 * U.lag(t, 0.2))) * w; r.top.len = 0.4 * w; r.top.tip = 0.6 * w;
      r.eye.narrow = -0.3 * w; r.eye.glow = 0.3 * w; r.tilt = -0.08 * w; } });
  P.clip("notice", { tags: ["notice"], dur: 1300, cooldown: 5000, principles: ["anticipation", "exaggeration", "timing", "staging", "appeal"],
    update(t, r, c) { const s = toward(c), fl = U.pulse(t, 0, 0.22), cu = U.hold(t, 0.28, 0.45, 0.85, 1);
      r.sq = -0.15 * fl; r.x = -4 * s * fl + 3 * s * cu; r.eye.narrow = 0.6 * fl - 0.35 * cu; r.eye.lid = 0.3 * fl; r.top.rot = 0.35 * U.decay(t, 2.5, 5); r.bottom.rot = -0.2 * U.decay(t, 2.5, 5);
      r.tilt = 0.14 * s * cu; r.eye.glow = 0.35 * cu; r.top.aim = 0.3 * cu; } });
  P.clip("dodge", { tags: ["dodge"], dur: 700, cooldown: 1500, principles: ["anticipation", "arcs", "squash-stretch", "timing"],
    update(t, r) { r.sq = -0.12 * U.pulse(t, 0, 0.18) + 0.1 * U.pulse(t, 0.15, 0.4) - 0.12 * U.pulse(t, 0.7, 0.9); r.y = -10 * (t > 0.15 && t < 0.75 ? U.arc((t - 0.15) / 0.6, 1) : 0); r.top.rot = 0.3 * U.decay(t, 2, 4); r.eye.narrow = 0.3 * U.pulse(t, 0, 0.5); } });
  P.clip("eager-lean", { tags: ["notice", "figure", "idle"], dur: 1700, weight: 0.7, cooldown: 12000, principles: ["anticipation", "follow-through", "exaggeration", "appeal", "timing"],
    when: c => c.focus.kind !== "none" && c.focus.d > 20,
    update(t, r, c) { const s = toward(c), k = U.keys(t, [[0, 0], [0.08, -0.06], [0.28, 0.28, "out"], [0.4, 0.13, "inOut"], [0.55, 0.19, "inOut"], [0.85, 0.17], [1, 0, "inOut"]]);
      r.tilt = s * k; r.x = s * 8 * k; r.eye.narrow = -0.3 * U.pulse(t, 0.2, 0.9); r.eye.glow = 0.35 * U.pulse(t, 0.2, 1); r.top.rot = -s * 0.25 * U.decay(U.lag(t, 0.3), 2, 4); } });
  P.clip("nod", { tags: ["read"], dur: 1100, cooldown: 7000, principles: ["timing", "follow-through", "appeal"],
    update(t, r) { r.tilt = 0.06 * Math.sin(TAU * 2 * t) * U.env(t, 0.15, 0.25); r.eye.lid = 0.2 * U.pulse(t, 0.2, 0.4); r.top.rot = -0.08 * Math.sin(TAU * 2 * t - 0.6) * U.env(t, 0.15, 0.25); } });
  P.clip("point", { tags: ["read", "figure", "idle"], dur: 1700, weight: 0.9, cooldown: 9000, principles: ["anticipation", "staging", "follow-through", "slow-in-out", "arcs"],
    when: c => c.focus.kind !== "none" && c.focus.d > 30,
    update(t, r, c) { const s = toward(c), pre = U.pulse(t, 0, 0.16), h = U.hold(t, 0.12, 0.32, 0.75, 0.95);
      r.x = -2 * s * pre + 3 * s * h; r.sq = -0.05 * pre; r.top.aim = h; r.top.len = 0.5 * h; r.top.tip = h; r.top.bend = 0.2 * U.decay(U.lag(t, 0.3), 1.5, 3);
      r.eye.narrow = 0.3 * h; r.eye.glow = 0.3 * h; r.tilt = 0.1 * s * h; } });
  P.clip("reach-out", { tags: ["figure", "read", "slider"], dur: 1500, weight: 0.7, cooldown: 10000, principles: ["anticipation", "follow-through", "secondary-action", "staging"],
    when: c => c.focus.kind !== "none" && c.focus.d > 40,
    update(t, r, c) { const s = toward(c), h = U.hold(t, 0.1, 0.35, 0.7, 0.95); r.reach.len = h; r.reach.width = 0.2 * h; r.disc.melt = 0.12 * h; r.eye.narrow = 0.35 * h; r.eye.glow = 0.4 * h; r.tilt = 0.08 * s * h; r.x = -2 * s * U.pulse(t, 0, 0.15); } });
  P.clip("swept", { tags: ["scroll"], dur: 1200, cooldown: 3000, principles: ["secondary-action", "follow-through", "timing"],
    update(t, r) { const h = U.hold(t, 0, 0.15, 0.6, 1); r.top.len = 0.4 * h; r.top.rot = 0.1 * Math.sin(TAU * 3 * t) * h; r.eye.narrow = 0.3 * h; r.eye.lid = 0.2 * h; r.sq = 0.06 * h; r.cores.y = 2 * h; } });
  P.clip("stirred", { tags: ["stirred"], layer: "over", dur: 900, cooldown: 3000, principles: ["secondary-action", "appeal", "timing"],
    update(t, r) { const h = U.pulse(t, 0, 1); r.eye.narrow = -0.2 * h; r.eye.glow = 0.25 * h; } });
  P.clip("embarrassed-spin", { tags: ["caught", "idle"], dur: 1150, weight: 0.3, cooldown: 30000, fadeIn: 60, principles: ["exaggeration", "anticipation", "follow-through", "timing", "appeal"],
    update(t, r, c, i) { const s = i.side, h = U.hold(t, 0, 0.08, 0.7, 1); r.eye.gaze = -h; r.eye.x = 0.95 * s * h; r.eye.glow = -0.2 * h; r.sq = -0.08 * U.pulse(t, 0, 0.14);
      r.turn = t < 1 ? s * TAU * E.inOut(U.lag(t, 0.12)) : 0; r.y = -6 * U.arc(U.lag(t, 0.12), 1); r.top.rot = 0.25 * U.decay(U.lag(t, 0.7), 2, 4); } });


  P.clip("boop", { tags: ["boop", "poke"], dur: 900, cooldown: 0, principles: ["anticipation", "squash-stretch", "exaggeration", "appeal"],
    cues: [[0.12, (c, api) => api.fx("spark", { n: 3, y: -c.size.r * 0.6, spread: 2.4, dir: -Math.PI / 2 })]],
    update(t, r) { const fl = U.pulse(t, 0, 0.2), ha = U.hold(t, 0.2, 0.35, 0.75, 1); r.eye.narrow = 0.7 * fl - 0.3 * ha; r.eye.lid = 0.4 * fl; r.eye.glow = 0.4 * ha; r.y = -6 * (t > 0.2 && t < 0.45 ? U.arc((t - 0.2) / 0.25, 1) : 0);
      r.top.rot = 0.35 * U.decay(t, 3, 5); r.bottom.rot = -0.2 * U.decay(t, 3, 5); r.eye.spin = 0.4 * U.decay(U.lag(t, 0.2), 1, 3); } });
  P.clip("squish-flinch", { tags: ["squish"], dur: 500, cooldown: 0, fadeIn: 40, principles: ["squash-stretch", "exaggeration", "timing"],
    update(t, r, c) { const h = U.hold(t, 0, 0.15, 0.8, 1), away = c.press ? -sgn(c.press.dx || 1) : 1; r.eye.narrow = 0.6 * h; r.eye.lid = 0.45 * h; r.eye.gaze = -0.7 * h; r.eye.x = 0.7 * away * h;
      r.top.rot = 0.3 * h * away; r.bottom.rot = -0.25 * h * away; r.eye.glow = -0.1 * h; } });
  P.clip("push-off", { tags: ["push-off"], loop: true, dur: 800, cooldown: 0, principles: ["exaggeration", "secondary-action", "overlapping", "timing", "follow-through"],
    cues: [[0.5, (c, api) => api.fx("drop", { n: 1, x: c.size.r * 0.9, y: -c.size.r * 0.8, dir: -0.6 })]],
    update(t, r) { const a = TAU * t; r.eye.narrow = 0.8; r.eye.glow = 0.6 + 0.15 * Math.sin(a * 2); r.eye.fire = 0.5;
      r.top.rot = 0.3 * Math.sin(a * 2); r.bottom.rot = -0.25 * Math.sin(a * 2 + 1); r.disc.rot = 0.06 * Math.sin(a * 3); r.orbit.rot = 0.05 * Math.sin(a * 3 + 1.2); r.lower.open = 0.12 * Math.sin(a * 2 + 0.5); r.cores.x = 1.5 * Math.sin(a * 4); } });
  P.clip("wriggle-free", { tags: ["wriggle-free"], dur: 1500, cooldown: 0, principles: ["anticipation", "exaggeration", "timing", "appeal", "follow-through"],
    update(t, r, c, i) { const back = U.hold(t, 0.25, 0.32, 0.5, 0.58), away = U.hold(t, 0.55, 0.65, 0.9, 1), s = i.side;
      r.sq = -0.2 * U.pulse(t, 0, 0.12) + 0.18 * U.pulse(t, 0.08, 0.25); r.eye.narrow = 0.7 * U.hold(t, 0, 0.1, 0.85, 1); r.eye.gaze = -(back + away); r.eye.x = -0.9 * s * back + 0.9 * s * away;
      r.eye.glow = 0.4 * U.hold(t, 0, 0.1, 0.5, 0.8); r.sq += -0.07 * U.pulse(t, 0.62, 0.72); r.top.rot = 0.3 * U.decay(U.lag(t, 0.1), 2, 4); r.eye.lidTilt = 0.6 * away * s; } });
  P.clip("relieved-pop", { tags: ["relief"], dur: 1000, cooldown: 0, principles: ["squash-stretch", "follow-through", "slow-in-out", "appeal"],
    update(t, r) { r.scale = 0.12 * U.decay(t, 1.2, 3); r.eye.narrow = -0.4 * U.pulse(t, 0, 0.8); r.eye.glow = 0.4 * U.pulse(t, 0, 0.9); r.eye.lid = 0.85 * U.pulse(t, 0.7, 0.95); r.top.rot = 0.15 * U.decay(t, 2, 4); } });
  P.clip("pop", { tags: ["pop"], dur: 700, cooldown: 0, principles: ["squash-stretch", "follow-through", "timing"],
    update(t, r) { r.eye.narrow = -0.3 * U.pulse(t, 0, 0.6); r.eye.lid = U.pulse(t, 0.5, 0.7); r.eye.glow = 0.2 * U.pulse(t, 0, 1); } });


  P.clip("dangle", { tags: ["grab"], loop: true, dur: 900, cooldown: 0, principles: ["secondary-action", "overlapping", "follow-through", "appeal"],
    update(t, r) { const a = TAU * t; r.eye.narrow = -0.4; r.eye.glow = 0.3; r.bottom.rot = 0.35 * Math.sin(a * 2); r.top.rot = 0.2 * Math.sin(a + 1); r.lower.open = 0.1 * Math.sin(a + 0.4); r.bottom.len = 0.15 * Math.sin(a * 2 + 1.5); } });
  P.clip("tumble", { tags: ["throw"], dur: 1200, cooldown: 0, principles: ["exaggeration", "secondary-action", "overlapping", "timing"],
    update(t, r) { const e = U.env(t, 0.05, 0.3); r.eye.narrow = -0.5 * U.pulse(t, 0, 0.4) + 0.4 * U.hold(t, 0.35, 0.5, 0.8, 1); r.eye.lid = 0.3 * U.pulse(t, 0.4, 1); r.eye.fire = 0.4 * e;
      r.top.rot = 0.5 * Math.sin(TAU * 4 * t) * e; r.bottom.rot = -0.45 * Math.sin(TAU * 4 * t + 1.3) * e; r.spread = 0.15 * e; } });
  P.clip("wall-splat", { tags: ["impact"], layer: "over", dur: 650, cooldown: 0, fadeIn: 20, principles: ["squash-stretch", "exaggeration", "timing", "follow-through"],
    update(t, r) { const p = U.pulse(t, 0, 0.5); r.eye.lid = 0.7 * p; r.eye.glow = 0.8 * U.decay(t, 0.5, 3) + 0.4 * p; r.eye.narrow = 0.5 * p; r.spread = 0.2 * p; r.eye.fire = 0.6 * p; } });
  P.clip("guilty-freeze", { tags: ["bump"], dur: 2000, cooldown: 3000, principles: ["timing", "staging", "appeal", "slow-in-out"],
    update(t, r, c, i) { const fr = U.hold(t, 0, 0.05, 0.35, 0.45), re = U.hold(t, 0.35, 0.5, 0.85, 1), s = c.impact.side === "left" ? -1 : c.impact.side === "right" ? 1 : i.side;
      r.eye.gaze = -fr - re; r.eye.x = 0.8 * s * U.pulse(t, 0, 0.2) - 0.7 * s * re; r.eye.glow = -0.3 * fr; r.eye.narrow = 0.2 * fr; r.top.rot = 0.3 * re; r.x = -6 * s * re; r.eye.x += 0.4 * Math.sin(TAU * 3 * t) * re; } });
  P.clip("cling", { tags: ["cling"], dur: 700, cooldown: 0, principles: ["squash-stretch", "staging", "exaggeration"],
    update(t, r, c) { const h = U.hold(t, 0, 0.1, 0.9, 1), w = c.body.wall === "left" ? -1 : 1; r.eye.lid = 0.5 * h; r.eye.narrow = 0.4 * h; r.top.rot = 0.6 * w * h; r.bottom.rot = -0.5 * w * h; r.eye.glow = 0.2 * h; } });
  P.clip("slide-down", { tags: ["slide"], loop: true, dur: 600, cooldown: 0, principles: ["secondary-action", "timing", "appeal"],
    update(t, r) { const a = TAU * t; r.eye.gaze = -0.6; r.eye.y = 0.8; r.eye.lidTilt = 0.4; r.top.rot = 0.25 * Math.sin(a * 3); r.bottom.rot = -0.25 * Math.sin(a * 3 + 1); r.disc.rot = 0.04 * Math.sin(a * 2); } });
  P.clip("land-squash", { tags: ["land"], layer: "over", dur: 600, cooldown: 0, fadeIn: 20, principles: ["squash-stretch", "follow-through", "timing", "overlapping"],
    update(t, r) { r.bottom.len = -0.3 * U.pulse(t, 0, 0.4); r.lower.open = 0.25 * U.decay(U.lag(t, 0.05), 1.5, 3); r.eye.lid = 0.3 * U.pulse(t, 0, 0.3); r.cores.y = 3 * U.decay(U.lag(t, 0.08), 1.5, 3); } });
  P.clip("dizzy", { tags: ["dizzy"], dur: 1700, cooldown: 0, principles: ["exaggeration", "secondary-action", "timing", "appeal"],
    update(t, r) { const h = U.hold(t, 0, 0.1, 0.85, 1); r.eye.spin = t < 1 ? 2 * TAU * E.inOut(t) : 0; r.rot = 0.18 * Math.sin(TAU * 2.5 * t) * h; r.eye.lid = 0.3 * h; r.eye.glow = -0.2 * h; r.eye.fire = 0.2 * h; r.top.rot = 0.35 * h; r.top.len = -0.2 * h; } });
  P.clip("recover", { tags: ["recover"], dur: 820, cooldown: 0, principles: ["anticipation", "squash-stretch", "follow-through", "timing"],
    update(t, r) { r.sq = -0.14 * U.pulse(t, 0, 0.2) + 0.16 * U.pulse(t, 0.15, 0.4); r.rot = 0.22 * U.decay(U.lag(t, 0.35), 3, 4); r.top.len = 0.3 * U.pulse(t, 0.2, 0.6); r.eye.narrow = -0.4 * U.pulse(t, 0.2, 1); r.eye.glow = 0.35 * U.pulse(t, 0.25, 1); } });


  P.clip("push-slider", { tags: ["slider"], loop: true, dur: 700, cooldown: 0, principles: ["staging", "secondary-action", "exaggeration", "timing"],
    update(t, r, c) { const d = c.slider ? c.slider.dir : 1, a = TAU * t; r.tilt = 0.16 * d; r.top.aim = 0.9; r.top.len = 0.45; r.top.tip = 0.5 + 0.2 * Math.sin(a); r.eye.narrow = 0.4; r.eye.fire = 0.25;
      r.bottom.rot = 0.3 * Math.sin(a * 2); r.x = 2 * d * Math.max(0, Math.sin(a)); r.sq = -0.04 * Math.max(0, Math.sin(a)); } });
  P.clip("proud-bounce", { tags: ["slider-done", "happy"], dur: 1300, cooldown: 0, principles: ["squash-stretch", "anticipation", "appeal", "timing", "exaggeration"],
    cues: [[0.18, (c, api) => api.fx("spark", { n: 4, y: -c.size.r, dir: -Math.PI / 2, spread: 2 })]],
    update(t, r) { const b1 = t < 0.42 ? U.arc(t / 0.42, 1) : 0, b2 = t > 0.45 && t < 0.85 ? U.arc((t - 0.45) / 0.4, 1) : 0, l1 = U.pulse(t, 0.38, 0.5), l2 = U.pulse(t, 0.82, 0.95);
      r.y = -9 * b1 - 6 * b2; r.sq = 0.1 * U.pulse(t, 0, 0.12) - 0.14 * (l1 + l2) + 0.06 * U.pulse(t, 0.45, 0.55); r.eye.glow = 0.6 * U.pulse(t, 0, 1); r.eye.narrow = -0.35 * U.pulse(t, 0, 1);
      r.top.len = 0.3 * U.pulse(t, 0, 1); r.top.tip = 0.4 * U.pulse(t, 0, 1); } });
  P.clip("inspect", { tags: ["figure"], dur: 2400, cooldown: 0, principles: ["anticipation", "staging", "follow-through", "exaggeration", "appeal"],
    update(t, r, c) { const s = toward(c), k = U.keys(t, [[0, 0], [0.1, -0.05], [0.3, 0.26, "out"], [0.42, 0.15, "inOut"], [0.55, 0.19, "inOut"], [0.85, 0.17], [1, 0, "inOut"]]), h = U.hold(t, 0.2, 0.35, 0.8, 0.95);
      r.tilt = s * k; r.top.aim = 0.8 * h; r.top.tip = 0.6 * h; r.top.len = 0.3 * h; r.eye.narrow = 0.3 * U.pulse(t, 0.1, 0.4) - 0.3 * U.pulse(t, 0.4, 0.9); r.eye.glow = 0.4 * h; } });
  const morph = (name, form, w) => P.clip(name, { tags: ["morph", "formation"], dur: 2600, weight: w, cooldown: 4000, form, principles: ["staging", "follow-through", "overlapping", "slow-in-out", "appeal"],
    update(t, r) { const h = U.hold(t, 0.04, 0.36, 0.7, 0.98); r.morph = h; r.eye.glow = 0.3 * h; } });
  morph("morph-cloud", "cloud", 0.6); morph("morph-bump", "bump", 1); morph("morph-gabor", "gabor", 1.2); morph("morph-bar", "bar", 0.8);


  P.clip("fall-asleep", { tags: ["sleep"], dur: 1800, cooldown: 0, principles: ["slow-in-out", "timing", "anticipation", "appeal"],
    update(t, r) { const y = U.pulse(t, 0, 0.45), sl = E.inOut(U.lag(t, 0.35)); r.sq = 0.12 * y - 0.06 * sl * (t < 1 ? 1 : 0); r.lower.open = 0.35 * y; r.eye.lid = 0.9 * sl * (t < 1 ? 1 : 0); r.eye.glow = -0.4 * sl * (t < 1 ? 1 : 0); r.top.rot = 0.25 * sl * (t < 1 ? 1 : 0); } });
  P.clip("wake", { tags: ["wake"], dur: 1300, cooldown: 0, principles: ["anticipation", "squash-stretch", "timing", "exaggeration"],
    update(t, r) { r.eye.lid = 0.9 * (1 - E.out(Math.min(1, t / 0.15))) * (t < 0.15 ? 1 : 0); r.eye.narrow = -0.4 * U.pulse(t, 0.1, 0.8); r.eye.glow = 0.5 * U.decay(U.lag(t, 0.1), 0.5, 3) + 0.2 * U.pulse(t, 0.1, 0.9);
      r.y = -8 * (t > 0.15 && t < 0.55 ? U.arc((t - 0.15) / 0.4, 1) : 0); r.sq = -0.1 * U.pulse(t, 0.05, 0.16) + 0.1 * U.pulse(t, 0.14, 0.3) - 0.1 * U.pulse(t, 0.52, 0.64); r.top.rot = 0.3 * U.decay(U.lag(t, 0.12), 2.5, 4); } });
  P.clip("yawn-droop", { tags: ["bored"], dur: 2600, cooldown: 15000, principles: ["slow-in-out", "timing", "appeal", "exaggeration"],
    update(t, r) { const y = U.hold(t, 0.15, 0.35, 0.5, 0.7), d = U.hold(t, 0.1, 0.3, 0.8, 1); r.eye.droop = 0.6 * d; r.eye.glow = -0.3 * d; r.lower.open = 0.5 * y; r.sq = 0.1 * y; r.eye.lid = 0.6 * y + 0.9 * U.pulse(t, 0.78, 0.92); r.top.rot = 0.3 * d; } });
})();
} catch (e) { console.warn("companion pack core", e); } finally { if (window.GSPet) GSPet.debug.setPack(""); }

try { if (window.GSPet) GSPet.debug.setPack("curiosity");


(function packCuriosity() {
  const P = typeof GSPet === "object" ? GSPet : null;
  if (!P) return;
  const U = P.util, TAU = Math.PI * 2;
  const glance = [[0, 0], [0.12, 0.85], [0.3, 0.85], [0.4, -0.35], [0.58, 1], [0.76, 1], [1, 0]];
  const scan = [[0, 0], [0.14, -0.65], [0.53, 0.7, "linear"], [0.62, -0.6], [0.84, 0.3, "linear"], [1, 0]];


  P.clip("cx-double-take", { tags: ["idle", "notice"], dur: 1400, cooldown: 10000,
    principles: ["pose-to-pose", "overlapping", "appeal"],
    update(t, r, c, i) {
      const h = U.env(t, 0.08, 0.18);
      r.eye.gaze = -h; r.eye.x = i.side * U.keys(t, glance);
      r.eye.narrow = -0.25 * U.pulse(t, 0.48, 0.9);
      r.tilt = 0.12 * i.side * U.hold(t, 0.17, 0.32, 0.7, 1);
      r.top.bend = 0.2 * i.side * U.pulse(t, 0.35, 1);
    } });

  P.clip("cx-line-scan", { tags: ["read"], layer: "eye", calm: true, dur: 2400, cooldown: 6000,
    principles: ["pose-to-pose", "staging", "timing"],
    update(t, r, c) {
      const h = U.env(t, 0.1, 0.15);
      r.eye.gaze = -h; r.eye.x = U.keys(t, scan);
      r.eye.y = 0.22 * U.hold(t, 0.5, 0.62, 0.84, 1);
      r.eye.narrow = 0.25 * h;
      r.eye.lid = 0.65 * U.pulse(t, 0.54, 0.62);
    } });

  P.clip("cx-paragraph-nod", { tags: ["read", "arrive"], layer: "over", dur: 1350, cooldown: 9000,
    principles: ["overlapping", "arcs", "secondary-action"],
    update(t, r, c, i) {
      r.eye.y = 0.4 * U.pulse(t, 0, 0.48);
      r.y = 3 * U.pulse(t, 0.13, 0.7); r.tilt = 0.07 * i.side * U.pulse(t, 0.13, 0.7);
      r.top.rot = 0.18 * i.side * U.decay(U.lag(t, 0.35), 2, 4);
      r.eye.glow = 0.2 * U.pulse(t, 0.35, 1);
    } });

  P.clip("cx-skeptical-peek", { tags: ["idle", "figure"], layer: "eye", calm: true, dur: 1850, cooldown: 16000,
    principles: ["staging", "slow-in-out", "appeal"],
    update(t, r, c, i) {
      const h = U.hold(t, 0, 0.18, 0.7, 1);
      r.eye.x = 0.55 * i.side * h; r.eye.gaze = -h;
      r.eye.narrow = 0.55 * h; r.eye.lidTilt = -0.4 * i.side * U.hold(t, 0.12, 0.32, 0.7, 1);
      r.eye.glow = 0.3 * U.pulse(t, 0.63, 1);
    } });

  P.clip("cx-slow-blink", { tags: ["blink"], layer: "eye", calm: true, dur: 950, cooldown: 6000,
    principles: ["timing", "slow-in-out", "appeal"],
    update(t, r) {
      r.eye.lid = U.hold(t, 0, 0.38, 0.56, 1);
      r.eye.glow = 0.18 * U.pulse(t, 0.6, 1);
    } });

  P.clip("cx-sleepy-catch", { tags: ["bored"], layer: "eye", calm: true, dur: 2700, cooldown: 15000,
    principles: ["timing", "exaggeration", "secondary-action"],
    update(t, r) {
      r.eye.droop = 0.65 * U.hold(t, 0, 0.35, 0.6, 0.8);
      r.eye.lid = 0.8 * U.hold(t, 0.15, 0.45, 0.6, 0.78);
      r.eye.narrow = -0.5 * U.pulse(t, 0.72, 0.91);
      r.eye.glow = 0.3 * U.pulse(t, 0.73, 1);
    } });

  P.clip("cx-warm-greet", { tags: ["greet", "wake"], dur: 1800, cooldown: 12000,
    principles: ["appeal", "overlapping", "arcs"],
    update(t, r, c, i) {
      r.eye.narrow = -0.4 * U.pulse(t, 0, 0.85); r.eye.glow = 0.5 * U.pulse(t, 0.02, 1);
      r.tilt = 0.12 * i.side * U.pulse(t, 0.12, 0.9);
      r.top.root = -0.25 * i.side * U.hold(t, 0.22, 0.38, 0.72, 1);
      r.top.rot = 0.3 * i.side * U.env(t, 0.3, 0.25) * U.wave(t, 3, 0);
      r.bottom.bend = 0.12 * i.side * U.pulse(t, 0.4, 1);
    } });

  P.clip("cx-pointer-measure", { tags: ["notice"], dur: 1700, cooldown: 14000,
    when: c => !c.touch && c.pointer.x >= 0,
    principles: ["staging", "overlapping", "secondary-action"],
    update(t, r, c) {
      const h = U.hold(t, 0, 0.16, 0.65, 1), p = U.hold(t, 0.3, 0.46, 0.65, 1);
      const dx = U.clamp(c.pointer.x - c.body.x, -90, 90), dy = U.clamp(c.pointer.y - c.body.y, -70, 70);
      r.eye.gaze = -h; r.eye.x = dx / 110 * h; r.eye.y = dy / 110 * h;
      r.eye.narrow = 0.3 * h; r.aimX = dx * h; r.aimY = dy * h;
      r.top.aim = 0.7 * p; r.top.tip = 0.35 * p;
    } });

  P.clip("cx-scroll-brake", { tags: ["scroll"], dur: 1150, cooldown: 7000,
    principles: ["anticipation", "overlapping", "follow-through", "exaggeration"],
    update(t, r, c, i) {
      const s = c.scroll.vy < 0 ? -1 : 1;
      r.eye.y = -0.7 * s * U.pulse(t, 0, 0.5); r.eye.narrow = -0.45 * U.pulse(t, 0, 0.3);
      r.y = -5 * s * U.pulse(t, 0.12, 0.65); r.sq = -0.13 * U.pulse(t, 0.35, 0.75);
      r.top.rot = 0.25 * i.side * U.decay(U.lag(t, 0.45), 2, 3);
    } });

  P.clip("cx-scroll-follow", { tags: ["scroll", "read"], layer: "eye", calm: true, dur: 1300, cooldown: 8000,
    principles: ["staging", "arcs", "slow-in-out"],
    update(t, r, c, i) {
      const h = U.env(t, 0.12, 0.18), s = c.scroll.vy < 0 ? -1 : 1;
      r.eye.gaze = -h; r.eye.y = 0.7 * s * U.wave(t, 1, 0) * h;
      r.eye.x = 0.25 * i.side * U.pulse(t, 0.1, 0.9); r.eye.narrow = 0.2 * h;
    } });

  P.clip("cx-finger-ripple", { tags: ["stirred"], dur: 1200, cooldown: 8000,
    principles: ["overlapping", "follow-through", "appeal"],
    update(t, r, c, i) {
      r.eye.narrow = -0.35 * U.pulse(t, 0, 0.35);
      r.orbit.spin = 0.25 * U.decay(U.lag(t, 0.12), 2, 3);
      r.band.spin = -0.2 * U.decay(U.lag(t, 0.25), 2, 3);
      r.top.bend = 0.35 * i.side * U.decay(U.lag(t, 0.38), 2, 3);
      r.eye.glow = 0.3 * U.pulse(t, 0.45, 1);
    } });

  P.clip("cx-tap-echo", { tags: ["boop"], layer: "eye", calm: true, dur: 850, cooldown: 5000,
    principles: ["timing", "exaggeration", "appeal"],
    update(t, r) {
      r.eye.lid = 0.9 * U.pulse(t, 0, 0.22) + 0.65 * U.pulse(t, 0.34, 0.55);
      r.eye.narrow = -0.45 * U.pulse(t, 0.57, 1); r.eye.glow = 0.4 * U.pulse(t, 0.55, 1);
    } });

  P.clip("cx-squish-peek", { tags: ["squish"], layer: "eye", calm: true, dur: 950, cooldown: 4000,
    principles: ["staging", "squash-stretch", "appeal"],
    update(t, r, c, i) {
      const h = U.env(t, 0.12, 0.2), dx = c.press ? c.press.dx : i.side;
      r.eye.lid = 0.55 * h; r.eye.x = -0.6 * dx * h; r.eye.gaze = -h;
      r.eye.lidTilt = 0.3 * dx * h; r.eye.glow = 0.2 * U.pulse(t, 0.4, 1);
    } });

  P.clip("cx-patient-push", { tags: ["push-off"], layer: "eye", calm: true, dur: 1500, loop: true, cooldown: 6000,
    when: c => !!c.press && c.press.phase === "push",
    principles: ["timing", "staging", "secondary-action"],
    update(t, r, c, i) {
      const h = U.env(t, 0.15, 0.15);
      r.eye.narrow = 0.55 * h; r.eye.lidTilt = 0.25 * i.side * h;
      r.eye.x = -0.4 * (c.press ? c.press.dx : i.side) * h;
      r.eye.glow = 0.18 * h * (1 + 0.3 * U.wave(t, 2, 0));
    } });

  P.clip("cx-relief-sigh", { tags: ["relief", "pop"], dur: 1600, cooldown: 7000,
    principles: ["squash-stretch", "overlapping", "slow-in-out"],
    update(t, r) {
      r.eye.lid = 0.7 * U.pulse(t, 0, 0.65); r.eye.glow = 0.25 * U.pulse(t, 0.5, 1);
      r.sq = -0.11 * U.pulse(t, 0.16, 0.85); r.top.len = -0.18 * U.pulse(t, 0.3, 1);
      r.bottom.len = -0.1 * U.pulse(t, 0.4, 1);
    } });

  P.clip("cx-pocket-pride", { tags: ["idle", "slider-done"], dur: 1800, cooldown: 17000,
    principles: ["anticipation", "exaggeration", "overlapping", "appeal"],
    update(t, r, c, i) {
      r.eye.glow = 0.5 * U.hold(t, 0, 0.2, 0.65, 1); r.eye.narrow = -0.3 * U.pulse(t, 0, 0.8);
      r.sq = -0.08 * U.pulse(t, 0.06, 0.25) + 0.13 * U.pulse(t, 0.27, 0.85);
      r.tilt = 0.08 * i.side * U.pulse(t, 0.22, 1); r.top.len = 0.3 * U.pulse(t, 0.32, 1);
    } });

  P.clip("cx-shy-hide", { tags: ["idle", "notice"], dur: 2000, cooldown: 18000,
    principles: ["staging", "overlapping", "appeal"],
    update(t, r, c, i) {
      r.eye.x = -0.6 * i.side * U.hold(t, 0, 0.14, 0.62, 1);
      r.eye.lid = 0.45 * U.hold(t, 0.08, 0.24, 0.6, 0.9);
      r.turn = -0.25 * i.side * U.hold(t, 0.18, 0.38, 0.6, 1);
      r.top.bend = -0.25 * i.side * U.pulse(t, 0.35, 1);
      r.eye.glow = 0.3 * U.pulse(t, 0.68, 1);
    } });

  P.clip("cx-almost-sneeze", { tags: ["idle"], dur: 2100, cooldown: 24000,
    principles: ["anticipation", "timing", "squash-stretch", "follow-through"],
    update(t, r, c, i) {
      r.eye.narrow = 0.65 * U.hold(t, 0, 0.3, 0.55, 0.7) - 0.4 * U.pulse(t, 0.68, 0.9);
      r.sq = 0.15 * U.pulse(t, 0.15, 0.65) - 0.16 * U.pulse(t, 0.65, 0.8);
      r.disc.drop = 0.18 * U.pulse(t, 0.2, 0.65);
      r.top.bend = 0.3 * i.side * U.decay(U.lag(t, 0.7), 2, 3);
    } });

  P.clip("cx-orbit-slip", { tags: ["idle", "bored"], dur: 2400, cooldown: 26000,
    principles: ["solid-drawing", "arcs", "overlapping", "follow-through"],
    update(t, r, c, i) {
      const h = U.hold(t, 0.18, 0.38, 0.58, 0.9), roll = U.pulse(t, 0.32, 0.83);
      r.eye.x = 0.65 * i.side * U.pulse(t, 0, 0.72);
      r.orbit.spin = -1.06 * h; r.orbit.x = 15 * i.side * roll;
      r.orbit.y = 5 * roll; r.orbit.rot = 15 / (45 * c.size.unit) * i.side * roll;
      r.top.bend = 0.25 * i.side * U.decay(U.lag(t, 0.65), 2, 4);
    } });

  P.clip("cx-tiny-trip", { tags: ["idle", "bump"], dur: 1400, cooldown: 16000,
    principles: ["anticipation", "arcs", "squash-stretch", "follow-through"],
    update(t, r, c, i) {
      const hop = U.pulse(t, 0.24, 0.63);
      r.eye.x = 0.6 * i.side * U.pulse(t, 0, 0.6);
      r.x = -2 * i.side * U.pulse(t, 0.1, 0.24) + 7 * i.side * hop;
      r.y = -6 * hop; r.rot = 0.18 * i.side * hop;
      r.sq = -0.12 * U.pulse(t, 0.1, 0.25) - 0.15 * U.pulse(t, 0.62, 0.8);
      r.top.rot = 0.3 * i.side * U.decay(U.lag(t, 0.64), 2, 3);
    } });

  P.clip("cx-pole-tangle", { tags: ["bored", "idle"], dur: 2200, cooldown: 22000,
    principles: ["overlapping", "staging", "follow-through", "appeal"],
    update(t, r, c, i) {
      r.eye.y = -0.65 * U.pulse(t, 0, 0.65); r.eye.narrow = 0.3 * U.pulse(t, 0.2, 0.7);
      r.top.root = 0.5 * i.side * U.hold(t, 0.15, 0.4, 0.58, 0.85);
      r.top.bend = -0.6 * i.side * U.pulse(t, 0.3, 0.8);
      r.bottom.rot = -0.22 * i.side * U.pulse(t, 0.4, 0.85);
      r.top.rot = 0.25 * i.side * U.decay(U.lag(t, 0.72), 3, 3);
    } });

  P.clip("cx-drop-thought", { tags: ["idle", "figure"], dur: 2300, cooldown: 21000,
    principles: ["squash-stretch", "overlapping", "slow-in-out"],
    update(t, r) {
      r.eye.y = -0.4 * U.pulse(t, 0, 0.7); r.eye.narrow = 0.35 * U.pulse(t, 0.05, 0.7);
      r.disc.drop = 0.55 * U.hold(t, 0.2, 0.4, 0.62, 1);
      r.orbit.melt = 0.65 * U.pulse(t, 0.3, 1); r.top.tip = 0.5 * U.pulse(t, 0.4, 0.9);
      r.eye.glow = 0.4 * U.pulse(t, 0.62, 1);
    } });

  P.clip("cx-depth-swivel", { tags: ["idle", "stirred"], dur: 1800, cooldown: 18000,
    principles: ["solid-drawing", "overlapping", "follow-through"],
    update(t, r, c, i) {
      r.eye.x = 0.7 * i.side * U.pulse(t, 0, 0.6);
      r.turn = 0.7 * i.side * U.pulse(t, 0.16, 0.88);
      r.orbit.spin = -0.25 * U.pulse(t, 0.3, 1);
      r.top.rot = 0.2 * i.side * U.decay(U.lag(t, 0.62), 2, 4);
    } });


  P.clip("cx-cloud-daydream", { tags: ["morph", "bored"], form: "cloud", dur: 3200, cooldown: 26000,
    principles: ["slow-in-out", "overlapping", "appeal"],
    update(t, r, c, i) {
      r.eye.droop = 0.3 * U.pulse(t, 0, 0.35);
      r.morph = U.hold(t, 0.18, 0.4, 0.65, 0.94);
      r.tilt = 0.08 * i.side * U.pulse(t, 0.1, 1);
      r.eye.glow = 0.25 * U.pulse(t, 0.78, 1);
    } });

  P.clip("cx-bump-mountain", { tags: ["morph"], form: "bump", dur: 2700, cooldown: 22000,
    principles: ["anticipation", "squash-stretch", "overlapping"],
    update(t, r) {
      r.eye.y = -0.5 * U.pulse(t, 0, 0.36);
      r.sq = -0.14 * U.pulse(t, 0.1, 0.3) + 0.12 * U.pulse(t, 0.74, 1);
      r.morph = U.hold(t, 0.24, 0.45, 0.62, 0.9);
      r.top.len = 0.2 * U.pulse(t, 0.8, 1);
    } });

  P.clip("cx-gabor-wiggle", { tags: ["morph"], form: "gabor", dur: 3000, cooldown: 23000,
    principles: ["anticipation", "overlapping", "follow-through"],
    update(t, r, c, i) {
      r.eye.x = -0.5 * i.side * U.pulse(t, 0, 0.3);
      r.morph = U.hold(t, 0.2, 0.42, 0.66, 0.9);
      r.orbit.spin = 0.25 * U.decay(U.lag(t, 0.77), 2, 3);
      r.top.bend = 0.2 * i.side * U.decay(U.lag(t, 0.84), 2, 3);
    } });

  P.clip("cx-bar-balance", { tags: ["morph"], form: "bar", dur: 2800, cooldown: 22000,
    principles: ["staging", "overlapping", "squash-stretch"],
    update(t, r, c, i) {
      r.eye.narrow = 0.4 * U.pulse(t, 0, 0.35);
      r.top.root = 0.4 * i.side * U.pulse(t, 0.1, 0.4);
      r.morph = U.hold(t, 0.25, 0.44, 0.65, 0.92);
      r.sq = -0.1 * U.pulse(t, 0.83, 1);
    } });

  P.clip("cx-ring-rehearsal", { tags: ["morph"], form: "ring", dur: 2900, cooldown: 24000,
    principles: ["solid-drawing", "anticipation", "overlapping"],
    update(t, r) {
      r.eye.narrow = -0.3 * U.pulse(t, 0, 0.28);
      r.orbit.spin = -0.75 * U.pulse(t, 0.08, 0.48);
      r.morph = U.hold(t, 0.27, 0.46, 0.66, 0.93);
      r.eye.glow = 0.35 * U.pulse(t, 0.8, 1);
    } });

  P.clip("cx-heart-offer", { tags: ["morph"], form: "heart", dur: 3100, cooldown: 30000,
    principles: ["appeal", "staging", "overlapping"],
    update(t, r, c, i) {
      r.eye.glow = 0.45 * U.pulse(t, 0, 0.4); r.eye.narrow = -0.35 * U.pulse(t, 0, 0.35);
      r.tilt = 0.1 * i.side * U.pulse(t, 0.12, 0.42);
      r.morph = U.hold(t, 0.28, 0.48, 0.68, 0.94);
      r.eye.lid = 0.65 * U.pulse(t, 0.88, 1);
    } });

  P.clip("cx-slider-watch", { tags: ["slider"], dur: 1800, loop: true, cooldown: 7000,
    when: c => c.state === "assist" && !!c.slider && c.slider.active,
    principles: ["staging", "overlapping", "secondary-action"],
    update(t, r, c, i) {
      const h = U.env(t, 0.15, 0.2), p = U.hold(t, 0.22, 0.4, 0.65, 1);
      const dx = c.slider ? U.clamp(c.slider.x - c.body.x, -60, 60) : 45 * i.side;
      const dy = c.slider ? U.clamp(c.slider.y - c.body.y, -55, 55) : 0;
      r.eye.gaze = -h; r.eye.x = dx / 90 * h; r.eye.y = dy / 90 * h; r.eye.narrow = 0.35 * h;
      r.aimX = dx * h; r.aimY = dy * h; r.top.aim = 0.5 * p; r.reach.len = 0.25 * p;
    } });

  P.clip("cx-slider-bow", { tags: ["slider-done"], dur: 1500, cooldown: 9000,
    principles: ["overlapping", "arcs", "follow-through", "appeal"],
    update(t, r, c, i) {
      r.eye.lid = 0.7 * U.pulse(t, 0, 0.55);
      r.tilt = 0.18 * i.side * U.pulse(t, 0.15, 0.85); r.y = 3 * U.pulse(t, 0.15, 0.85);
      r.top.rot = -0.25 * i.side * U.decay(U.lag(t, 0.4), 2, 4);
      r.eye.glow = 0.35 * U.pulse(t, 0.65, 1);
    } });

  P.clip("cx-landing-check", { tags: ["land", "impact"], layer: "over", dur: 1100, cooldown: 6000,
    principles: ["squash-stretch", "timing", "overlapping", "follow-through"],
    update(t, r, c, i) {
      r.eye.lid = 0.8 * U.pulse(t, 0, 0.24); r.sq = -0.17 * U.pulse(t, 0.05, 0.36);
      r.eye.x = 0.55 * i.side * U.pulse(t, 0.32, 0.9);
      r.top.bend = 0.35 * i.side * U.decay(U.lag(t, 0.18), 2, 3);
      r.eye.glow = 0.2 * U.pulse(t, 0.7, 1);
    } });

  P.clip("cx-theme-inspect", { tags: ["theme"], layer: "eye", calm: true, dur: 1900, cooldown: 8000,
    principles: ["staging", "timing", "slow-in-out"],
    update(t, r, c, i) {
      const h = U.hold(t, 0, 0.2, 0.6, 1);
      r.eye.gaze = -h; r.eye.x = 0.5 * i.side * U.wave(t, 1, 0) * h;
      r.eye.size = (c.theme === "dark" ? 0.16 : -0.12) * h;
      r.eye.narrow = 0.35 * U.pulse(t, 0.15, 0.65); r.eye.glow = 0.35 * U.pulse(t, 0.6, 1);
    } });

  P.clip("cx-phone-beacon", { tags: ["greet", "wake"], layer: "eye", calm: true, dur: 1450, cooldown: 10000,
    when: c => c.small || c.touch,
    principles: ["exaggeration", "timing", "appeal"],
    update(t, r) {
      r.eye.narrow = -0.55 * U.hold(t, 0, 0.18, 0.55, 1);
      r.eye.size = 0.15 * U.pulse(t, 0.05, 0.8); r.eye.glow = 0.6 * U.pulse(t, 0.1, 1);
      r.eye.lid = 0.65 * U.pulse(t, 0.65, 0.88);
    } });

  P.clip("cx-phone-wink", { tags: ["boop", "blink"], layer: "eye", calm: true, dur: 1050, cooldown: 6000,
    when: c => c.small || c.touch,
    principles: ["timing", "staging", "appeal"],
    update(t, r, c, i) {
      r.eye.lid = U.hold(t, 0, 0.2, 0.35, 0.65);
      r.eye.lidTilt = 0.35 * i.side * U.pulse(t, 0.08, 0.7);
      r.eye.glow = 0.45 * U.pulse(t, 0.55, 1); r.eye.narrow = -0.3 * U.pulse(t, 0.6, 1);
    } });

  P.clip("cx-phone-long-look", { tags: ["squish", "read"], layer: "eye", calm: true, dur: 1700, cooldown: 8000,
    when: c => c.small || c.touch,
    principles: ["staging", "overlapping", "slow-in-out"],
    update(t, r, c, i) {
      const h = U.hold(t, 0, 0.17, 0.65, 1);
      const dy = c.press ? c.press.dy : c.read ? U.clamp((c.read.y - c.body.y) / 100, -1, 1) : -0.5;
      r.eye.gaze = -h; r.eye.y = 0.65 * dy * h; r.eye.x = 0.25 * i.side * h;
      r.eye.narrow = 0.3 * h; r.eye.glow = 0.3 * U.hold(t, 0.3, 0.5, 0.65, 1);
    } });
})();
} catch (e) { console.warn("companion pack curiosity", e); } finally { if (window.GSPet) GSPet.debug.setPack(""); }

try { if (window.GSPet) GSPet.debug.setPack("game");


(function packGame() {
  const P = typeof GSPet === "object" ? GSPet : null; if (!P || !P.game || !P.debug) return;
  const E = P.ease, U = P.util, TAU = Math.PI * 2, clamp = U.clamp, lerp = U.lerp;
  const fin = v => typeof v === "number" && v === v && v !== Infinity && v !== -Infinity;
  const num = (v, d, a, b) => fin(v) ? clamp(v, a, b) : d;


  let C = null, gt = 0, simMs = 0;
  const see = c => { if (c && c !== C && c.view && c.body && c.focus) C = c; return c; };
  const ctxNow = () => C || (P.debug.ctx ? P.debug.ctx() : null);
  const wall = () => Date.now() + simMs;
  const dayOf = ms => { const d = new Date(ms); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
  const isNight = ms => { const h = new Date(ms).getHours(); return h >= 22 || h < 6; };
  const game = c => !!c && c.mode === "game";


  const LVMAX = 10, need = l => 20 + 10 * l;
  function init(s) {
    if (!s || typeof s !== "object") return s;
    if (s.v !== 1) { const t = wall(); s.v = 1; s.born = t; s.lvl = 1; s.xp = 0; s.days = 1; s.day = dayOf(t); s.lvlDay = 0; s.en = 0.85; s.fu = 0.55; s.cu = 0.5; s.joy = 0.6; s.best = 0; s.rounds = 0; s.fed = 0; s.reads = 0; s.naps = 0; s.caught = 0; }
    s.lvl = Math.round(num(s.lvl, 1, 1, LVMAX)); s.xp = num(s.xp, 0, 0, 1e5); s.days = Math.round(num(s.days, 1, 1, 1e5)); s.day = Math.round(num(s.day, dayOf(wall()), 0, 1e9)); s.lvlDay = Math.round(num(s.lvlDay, 0, 0, 1e9));
    s.en = num(s.en, 0.8, 0, 1); s.fu = num(s.fu, 0.5, 0, 1); s.cu = num(s.cu, 0.5, 0, 1); s.joy = num(s.joy, 0.6, 0, 1);
    s.best = Math.round(num(s.best, 0, 0, 999)); s.rounds = Math.round(num(s.rounds, 0, 0, 1e6)); s.fed = Math.round(num(s.fed, 0, 0, 1e6)); s.reads = Math.round(num(s.reads, 0, 0, 1e7)); s.naps = Math.round(num(s.naps, 0, 0, 1e6)); s.caught = Math.round(num(s.caught, 0, 0, 1e7));
    return s;
  }
  const gain = (s, n) => { s.xp = Math.min(s.xp + n, 2 * need(s.lvl) + 40); };


  const RATE = { enAwake: 1 / 2700, night: 2, enSleep: 1 / 300, fu: 1 / 1800, cu: 1 / 1500, joy: 1 / 240 };
  function drift(s, d, asleep, night) {
    if (asleep) s.en = Math.min(1, s.en + d * RATE.enSleep); else s.en = Math.max(0, s.en - d * RATE.enAwake * (night ? RATE.night : 1));
    s.fu = Math.max(0, s.fu - d * RATE.fu * (asleep ? 0.5 : 1));
    if (s.cu > 0.2) s.cu = Math.max(0.2, s.cu - d * RATE.cu);
    const jt = clamp(0.2 + 0.9 * Math.min(s.en + 0.15, s.fu + 0.1, s.cu + 0.25), 0, 1); s.joy += (jt - s.joy) * Math.min(1, d * RATE.joy);
  }
  function dayCheck(s) { const t = dayOf(wall()); if (t > s.day) { s.day = t; s.days++; gain(s, 5); return true; } if (t < s.day) { s.day = t; if (s.lvlDay > t) s.lvlDay = t; } return false; }


  const V = { en: 0.8, fu: 0.6, cu: 0.5, joy: 0.6, lvl: 1, prev: 1 };
  let lvlNow = -1e9, lvlWait = 0;
  const snapView = s => { V.en = s.en; V.fu = s.fu; V.cu = s.cu; V.joy = s.joy; V.lvl = V.prev = s.lvl; lvlNow = -1e9; lvlWait = 0; };
  function viewStep(s, d) { const k = 1 - Math.exp(-d / 1.2); V.en += (s.en - V.en) * k; V.fu += (s.fu - V.fu) * k; V.cu += (s.cu - V.cu) * k; V.joy += (s.joy - V.joy) * k; if (V.lvl !== s.lvl && !lvlWait) { V.prev = V.lvl = s.lvl; } }
  const grow = c => { const k = E.smoother(clamp(((c && fin(c.now) ? c.now : 0) - lvlNow) / 1100, 0, 1)); return 0.014 * ((V.prev - 1) + (V.lvl - V.prev) * k); };
  const tiredOf = () => clamp((0.45 - V.en) / 0.45, 0, 1), hungryOf = () => clamp((0.35 - V.fu) / 0.35, 0, 1), boredOf = () => clamp((0.3 - V.cu) / 0.3, 0, 1);
  const happyOf = () => clamp((V.joy - 0.6) / 0.4, 0, 1), curiousOf = () => clamp((V.cu - 0.62) / 0.38, 0, 1);
  const sideTo = c => c && c.focus && c.focus.dx < 0 ? -1 : 1;
  const HATCH_R = [[0.7, 0], [0.76, -0.8, "out"], [0.84, 0.8, "out"], [0.92, 0, "inOut"]], HATCH_L = [[0.7, 0], [0.76, 0.8, "out"], [0.84, -0.8, "out"], [0.92, 0, "inOut"]];
  const CELEB_Y = [[0, 0], [0.1, 4], [0.3, -34, "out"], [0.62, -30], [0.75, 0, "in"], [0.82, 3], [0.9, 0]];


  const SPK = ["heat:0.960", "heat:0.820", "heat:0.640", "heat:0.440", "heat:0.240"], SCA = Math.cos(-0.45), SSA = Math.sin(-0.45);
  P.form("game-splat", { place: (j, n, t) => { const q = Math.sqrt((j + 0.5) / n), a = j * 2.39996 + t * 0.8, ex = 1.45 * q * Math.cos(a), ey = 0.8 * q * Math.sin(a);
    return [ex * SCA - ey * SSA, ex * SSA + ey * SCA, 0.34 - 0.2 * q, SPK[Math.min(4, Math.floor(q * 5))]]; } });


  P.clip("game-breathe", { tags: ["base"], layer: "base", loop: true, dur: 3600, weight: 40, calm: true, principles: ["slow-in-out", "secondary-action", "overlapping", "timing", "appeal"],
    when: c => (see(c), game(c) && c.state !== "sleep"),
    update(t, r, c) { const a = TAU * t, sn = Math.sin(a), ti = tiredOf(), hu = hungryOf(), bo = boredOf(), ha = happyOf(), cu = curiousOf(), amp = 1 + 0.7 * ti + 0.3 * ha;
      r.scale = grow(c); r.sq = 0.035 * amp * sn - 0.03 * hu; r.y = -1.2 * amp * sn + 2.5 * ti + 1.5 * hu;
      r.eye.droop = 0.42 * ti + 0.25 * hu + 0.12 * bo; r.eye.lid = 0.22 * ti + 0.14 * bo; r.eye.lidTilt = 0.22 * bo;
      r.eye.glow = 0.05 * Math.sin(a + 0.6) - 0.35 * hu - 0.25 * ti + 0.3 * ha + 0.15 * cu; r.eye.narrow = 0.22 * bo - 0.18 * cu - 0.12 * ha; r.eye.size = 0.06 * ha + 0.06 * cu - 0.05 * hu;
      r.top.rot = 0.04 * Math.sin(a - 1.8) + 0.32 * ti + 0.12 * hu; r.top.len = -0.25 * ti + 0.15 * ha + 0.2 * cu; r.bottom.rot = -0.025 * Math.sin(a - 2.1);
      r.orbit.rot = 0.018 * Math.sin(a - 0.9); r.lower.open = 0.035 * Math.sin(a - 1.4) + 0.07 * hu * Math.sin(3 * a); r.cores.y = 1.2 * hu; } });
  P.clip("game-doze", { tags: ["base"], layer: "base", loop: true, dur: 5600, weight: 40, calm: true, principles: ["slow-in-out", "timing", "secondary-action", "appeal"],
    when: c => (see(c), game(c) && c.state === "sleep"),
    cues: [[0.5, (c, api) => api.fx("ember", { n: 1, y: -c.size.r * 1.1, x: c.size.r * 0.3, color: "core1" })]],
    update(t, r, c) { const s = Math.sin(TAU * t); r.scale = grow(c); r.sq = 0.07 * s; r.y = -2.2 * s; r.tilt = 0.08; r.eye.glow = -0.2 + 0.12 * Math.sin(TAU * t - 0.5); r.eye.droop = 0.3;
      r.top.rot = 0.3 + 0.05 * Math.sin(TAU * t - 1); r.bottom.rot = -0.1; r.lower.open = 0.08 * Math.sin(TAU * t - 1.2); r.orbit.rot = 0.03 * Math.sin(TAU * t - 0.7); r.cores.y = 1.2 * Math.sin(TAU * t - 0.9); } });


  P.clip("game-heavy-blink", { tags: ["blink", "eye"], layer: "eye", dur: 900, weight: 14, cooldown: 0, fadeIn: 0, fadeOut: 80, calm: true, principles: ["timing", "slow-in-out", "appeal"],
    when: c => (see(c), game(c) && V.en < 0.3),
    update(t, r) { const h = U.hold(t, 0, 0.3, 0.55, 1); r.eye.lid = 0.95 * Math.pow(h, 0.8); r.eye.droop = 0.2 * h; r.eye.y = 0.2 * h; } });
  P.clip("game-rumble", { tags: ["g-hungry", "idle"], dur: 1700, weight: 2, cooldown: 9000, principles: ["secondary-action", "straight-ahead", "timing", "appeal"],
    when: c => (see(c), game(c) && V.fu < 0.3),
    update(t, r, c, i) { const h = U.hold(t, 0.04, 0.12, 0.5, 0.62), n1 = U.noise(t * 26, 3 + i.play), n2 = U.noise(t * 31, 7 + i.play), pl = U.hold(t, 0.6, 0.7, 0.88, 1);
      r.lower.open = 0.22 * n1 * h; r.cores.y = 2 * n2 * h + 2.5 * h; r.sq = 0.04 * n2 * h - 0.04 * h; r.eye.gaze = -h - pl; r.eye.y = 0.7 * h - 0.1 * pl; r.eye.droop = 0.3 * h;
      r.eye.narrow = 0.25 * h - 0.5 * pl; r.eye.size = 0.12 * pl; r.eye.lidTilt = -0.4 * pl; r.eye.glow = 0.3 * pl - 0.2 * h; r.top.rot = 0.15 * n1 * h; } });
  P.clip("game-beg", { tags: ["g-hungry", "notice"], dur: 1900, weight: 3, cooldown: 12000, principles: ["anticipation", "squash-stretch", "exaggeration", "timing", "appeal"],
    when: c => (see(c), game(c) && V.fu < 0.3),
    update(t, r) { const b1 = t > 0.1 && t < 0.3 ? U.arc((t - 0.1) / 0.2, 1) : 0, b2 = t > 0.38 && t < 0.58 ? U.arc((t - 0.38) / 0.2, 1) : 0, l1 = U.pulse(t, 0.28, 0.36), l2 = U.pulse(t, 0.56, 0.64), h = U.hold(t, 0.05, 0.15, 0.8, 1), pt = U.hold(t, 0.6, 0.7, 0.88, 1);
      r.y = -9 * b1 - 9 * b2 + 2 * (l1 + l2); r.sq = -0.12 * U.pulse(t, 0.02, 0.1) + 0.12 * (U.pulse(t, 0.08, 0.16) + U.pulse(t, 0.36, 0.44)) - 0.15 * (l1 + l2);
      r.eye.narrow = -0.5 * h; r.eye.size = 0.14 * h; r.eye.glow = 0.4 * h; r.eye.lidTilt = -0.45 * h; r.top.aim = 0.6 * pt; r.top.tip = 0.4 * pt; r.bottom.rot = 0.2 * U.decay(U.lag(t, 0.3), 2, 4); } });
  P.clip("game-yawn", { tags: ["g-sleepy", "bored"], dur: 3000, weight: 2, cooldown: 14000, principles: ["slow-in-out", "timing", "squash-stretch", "follow-through", "appeal"],
    when: c => (see(c), game(c) && V.en < 0.4),
    update(t, r) { const inh = U.hold(t, 0.05, 0.35, 0.5, 0.65), exh = U.pulse(t, 0.6, 0.85), bl = U.pulse(t, 0.82, 0.97);
      r.sq = 0.16 * inh - 0.1 * exh; r.y = -3 * inh + 2 * exh; r.lower.open = 0.9 * inh; r.eye.lid = 0.55 * inh + 0.95 * bl; r.eye.narrow = 0.3 * inh;
      r.top.len = 0.5 * inh; r.top.rot = -0.2 * inh + 0.3 * exh; r.bottom.len = 0.25 * inh; r.eye.droop = 0.3 * exh; r.tilt = 0.05 * inh; } });
  P.clip("game-nod-off", { tags: ["g-sleepy", "idle"], dur: 3400, weight: 2.5, cooldown: 16000, principles: ["timing", "anticipation", "exaggeration", "slow-in-out", "appeal"],
    when: c => (see(c), game(c) && V.en < 0.3),
    update(t, r, c, i) { const sink = U.hold(t, 0.05, 0.55, 0.62, 0.66), jolt = U.pulse(t, 0.62, 0.74), after = U.hold(t, 0.7, 0.78, 0.9, 1);
      r.eye.lid = 0.9 * sink; r.eye.droop = 0.4 * sink; r.y = 5 * sink - 6 * jolt; r.tilt = 0.12 * i.side * sink; r.top.rot = 0.45 * sink; r.sq = -0.08 * sink + 0.15 * jolt - 0.05 * U.pulse(t, 0.74, 0.85);
      r.eye.narrow = -0.6 * jolt; r.eye.glow = 0.5 * jolt; r.top.len = 0.5 * jolt; r.eye.gaze = -after; r.eye.x = 0.6 * i.side * after; r.eye.lidTilt = 0.3 * after; } });
  P.clip("game-sigh", { tags: ["g-bored", "bored"], dur: 2600, weight: 2, cooldown: 14000, principles: ["timing", "slow-in-out", "squash-stretch", "secondary-action", "appeal"],
    when: c => (see(c), game(c) && V.cu < 0.3),
    update(t, r, c, i) { const s = i.side, inh = U.hold(t, 0.05, 0.3, 0.38, 0.45), exh = U.hold(t, 0.42, 0.55, 0.75, 0.95);
      r.sq = 0.14 * inh - 0.12 * exh; r.y = -3 * inh + 3 * exh; r.eye.lid = 0.35 * exh; r.eye.lidTilt = 0.35 * s * exh; r.eye.gaze = -0.7 * exh; r.eye.x = 0.7 * s * exh; r.eye.droop = 0.25 * exh;
      r.top.rot = 0.4 * exh; r.top.len = 0.3 * inh - 0.2 * exh; r.orbit.spin = 0.2 * exh; r.eye.glow = -0.2 * exh; } });
  P.clip("game-fidget", { tags: ["g-bored", "idle"], dur: 2800, weight: 1.5, cooldown: 12000, principles: ["secondary-action", "timing", "overlapping", "appeal"],
    when: c => (see(c), game(c) && V.cu < 0.25),
    update(t, r, c, i) { const e = U.env(t, 0.1, 0.2), s = i.side, tap = Math.max(0, Math.sin(TAU * 4 * t));
      r.bottom.rot = 0.35 * s * tap * e; r.sq = -0.025 * tap * e; r.lower.spin = 0.5 * s * Math.sin(TAU * t) * e; r.eye.gaze = -0.6 * e; r.eye.y = -0.5 * e; r.eye.x = 0.4 * Math.sin(TAU * t) * e; r.eye.narrow = 0.25 * e; r.top.rot = 0.1 * Math.sin(TAU * 2 * t) * e; } });
  P.clip("game-peer", { tags: ["g-curious", "read"], dur: 2200, weight: 1.5, cooldown: 10000, principles: ["anticipation", "staging", "follow-through", "appeal"],
    when: c => (see(c), game(c) && V.cu > 0.6 && c.focus.kind !== "none" && c.focus.d > 30),
    update(t, r, c) { const s = sideTo(c), h = U.hold(t, 0.08, 0.3, 0.75, 0.95), pre = U.pulse(t, 0, 0.12), pt = U.hold(t, 0.2, 0.35, 0.7, 0.9);
      r.tilt = 0.16 * s * h; r.x = -2 * s * pre + 5 * s * h; r.eye.narrow = -0.35 * h; r.eye.size = 0.12 * h; r.eye.glow = 0.4 * h; r.top.aim = 0.7 * pt; r.top.tip = 0.6 * pt;
      r.top.bend = 0.2 * U.decay(U.lag(t, 0.35), 1.5, 3); r.sq = -0.05 * pre + 0.04 * h; r.eye.lid = 0.6 * U.pulse(t, 0.55, 0.62); } });
  P.clip("game-shimmy", { tags: ["g-happy", "idle"], dur: 1800, weight: 1.5, cooldown: 10000, principles: ["secondary-action", "overlapping", "solid-drawing", "timing", "appeal"],
    when: c => (see(c), game(c) && V.joy > 0.7),
    update(t, r) { const e = U.env(t, 0.12, 0.25), a = TAU * 3 * t;
      r.turn = 0.45 * Math.sin(a) * e; r.y = -4 * Math.abs(Math.sin(a)) * e; r.sq = 0.05 * Math.cos(2 * a) * e; r.eye.lid = 0.35 * e; r.eye.glow = 0.45 * e;
      r.top.rot = 0.3 * Math.sin(a + 1) * e; r.bottom.rot = -0.25 * Math.sin(a + 2) * e; } });
  P.clip("game-twirl", { tags: ["g-happy"], dur: 2000, weight: 1, cooldown: 16000, principles: ["anticipation", "arcs", "solid-drawing", "squash-stretch", "exaggeration", "appeal"],
    when: c => (see(c), game(c) && V.joy > 0.7 && V.lvl >= 2),
    cues: [[0.42, (c, api) => api.fx("heart", { n: 1, color: "core0" })]],
    update(t, r, c, i) { const cr = U.hold(t, 0, 0.1, 0.12, 0.18), air = t > 0.16 && t < 0.66 ? U.arc((t - 0.16) / 0.5, 1) : 0, land = U.pulse(t, 0.64, 0.78);
      r.sq = -0.2 * cr + 0.15 * U.pulse(t, 0.15, 0.26) - 0.18 * land + 0.05 * U.decay(U.lag(t, 0.78), 1.5, 3); r.y = 4 * cr - 30 * air + 2 * land;
      r.turn = t > 0.18 && t < 0.62 ? i.side * TAU * E.inOut((t - 0.18) / 0.44) : 0; r.eye.lid = 0.3 * U.hold(t, 0.62, 0.7, 0.85, 1); r.eye.glow = 0.5 * U.pulse(t, 0.1, 1); r.top.len = 0.3 * air; } });


  P.clip("game-eat", { tags: ["g-eat"], dur: 2100, cooldown: 0, principles: ["anticipation", "squash-stretch", "follow-through", "exaggeration", "timing", "appeal"],
    when: c => (see(c), game(c)),
    cues: [[0.03, (c, api) => api.fx("blob", { n: 1, y: -c.size.r * 2.1, dir: Math.PI / 2, spread: 0.1, speed: 75, life: 760, size: 1.5, color: "core1" })],
      [0.42, (c, api) => api.fx("ember", { n: 2, y: -c.size.r * 0.3, color: "core2" })], [0.6, (c, api) => api.fx("spark", { n: 3, y: -c.size.r * 0.5, dir: -Math.PI / 2, spread: 2.2 })]],
    update(t, r, c, i) { const look = U.hold(t, 0, 0.06, 0.3, 0.38), reach = U.hold(t, 0.12, 0.26, 0.3, 0.4), gulp = U.pulse(t, 0.36, 0.5), chew = U.hold(t, 0.48, 0.52, 0.78, 0.86), bl = U.pulse(t, 0.84, 0.98), R0 = c && c.size ? c.size.r : 29;
      r.eye.gaze = -look; r.eye.y = -0.9 * look; r.eye.narrow = -0.35 * look + 0.4 * chew; r.top.len = 0.35 * look; r.top.rot = 0.2 * i.side * look; r.top.tip = 0.6 * U.pulse(t, 0.12, 0.4);
      r.aimY = -R0 * 2 * reach; r.reach.len = 0.8 * reach; r.reach.width = 0.3 * reach;
      r.sq = 0.12 * U.pulse(t, 0.3, 0.42) - 0.2 * gulp + 0.05 * Math.sin(TAU * 6 * t) * chew; r.y = -3 * U.pulse(t, 0.3, 0.42) + 2 * gulp;
      r.eye.glow = 0.9 * U.hold(t, 0.38, 0.46, 0.7, 0.95); r.eye.fire = 0.45 * chew; r.eye.size = 0.12 * gulp; r.lower.open = 0.3 * Math.sin(TAU * 5 * t) * chew - 0.25 * gulp;
      r.cores.x = 1.2 * Math.sin(TAU * 7 * t) * chew; r.eye.lid = 0.85 * bl; } });
  P.clip("game-eat-figure", { tags: ["g-eat"], dur: 2300, cooldown: 0, principles: ["anticipation", "staging", "follow-through", "arcs", "secondary-action", "appeal"],
    when: c => (see(c), game(c)),
    cues: [[0.4, (c, api) => { const d = c.focus.d > 20 ? c.focus.d : 1, ux = c.focus.d > 20 ? c.focus.dx / d : 0, uy = c.focus.d > 20 ? c.focus.dy / d : -1; api.fx("blob", { n: 1, x: ux * 52, y: uy * 52, dir: Math.atan2(-uy, -ux), spread: 0.1, speed: 95, life: 650, size: 1.5, color: "out" }); }],
      [0.62, (c, api) => api.fx("spark", { n: 3, y: -c.size.r * 0.5, dir: -Math.PI / 2, spread: 2.2 })]],
    update(t, r, c) { const s = sideTo(c), pre = U.pulse(t, 0, 0.1), out = U.hold(t, 0.06, 0.28, 0.36, 0.48), gulp = U.pulse(t, 0.48, 0.6), chew = U.hold(t, 0.58, 0.62, 0.82, 0.9), bl = U.pulse(t, 0.86, 0.98);
      r.x = -2 * s * pre + 4 * s * out; r.tilt = 0.12 * s * out; r.reach.len = out; r.reach.width = 0.25 * out + 0.25 * U.pulse(t, 0.3, 0.42); r.top.aim = 0.8 * out; r.top.tip = 0.6 * out;
      r.eye.narrow = 0.35 * out + 0.35 * chew; r.eye.glow = 0.4 * out + 0.8 * U.hold(t, 0.5, 0.58, 0.75, 0.95); r.eye.fire = 0.4 * chew;
      r.sq = -0.05 * pre + 0.1 * U.pulse(t, 0.42, 0.52) - 0.18 * gulp + 0.05 * Math.sin(TAU * 6 * t) * chew; r.lower.open = 0.3 * Math.sin(TAU * 5 * t) * chew - 0.2 * gulp; r.eye.lid = 0.85 * bl; } });
  P.clip("game-full", { tags: ["g-full"], dur: 1700, cooldown: 0, principles: ["exaggeration", "staging", "timing", "appeal"],
    when: c => (see(c), game(c)),
    cues: [[0.2, (c, api) => api.fx("puff", { n: 2, y: -c.size.r * 0.2 })]],
    update(t, r, c) { const s = -sideTo(c), h = U.hold(t, 0.05, 0.2, 0.75, 0.95), no = U.hold(t, 0.35, 0.4, 0.7, 0.8);
      r.tilt = 0.14 * s * h; r.x = 5 * s * h; r.eye.gaze = -h; r.eye.x = 0.8 * s * h + 0.35 * Math.sin(TAU * 3 * U.lag(t, 0.35)) * no; r.eye.lidTilt = 0.5 * s * h; r.eye.narrow = 0.4 * h;
      r.scale = 0.07 * U.pulse(t, 0.1, 0.45); r.top.rot = -0.3 * s * h; r.sq = -0.06 * U.pulse(t, 0.1, 0.45); } });
  P.clip("game-level-up", { tags: ["g-level"], dur: 3000, cooldown: 0, form: "game-splat", principles: ["anticipation", "squash-stretch", "exaggeration", "staging", "arcs", "follow-through"],
    when: c => (see(c), game(c)),
    cues: [[0.2, (c, api) => api.fx("spark", { n: 5, dir: Math.PI / 2, spread: 2.4, y: c.size.r * 0.6 })], [0.44, (c, api) => api.fx("ring", { n: 1 })],
      [0.66, c => { lvlNow = c.now; lvlWait = 0; }], [0.68, (c, api) => { api.fx("puff", { n: 4, y: c.size.r * 1.1 }); api.fx("spark", { n: 6, dir: -Math.PI / 2, spread: 3, y: -c.size.r * 0.8 }); }]],
    update(t, r, c, i) { const cr = U.hold(t, 0, 0.14, 0.18, 0.22), air = t > 0.2 && t < 0.66 ? U.arc((t - 0.2) / 0.46, 1) : 0, land = U.pulse(t, 0.64, 0.78), up = U.hold(t, 0.68, 0.75, 0.88, 1);
      r.sq = -0.26 * cr + 0.22 * U.pulse(t, 0.19, 0.3) - 0.26 * land + 0.06 * U.decay(U.lag(t, 0.78), 1.5, 3); r.y = 5 * cr - 46 * air + 3 * land; r.morph = U.hold(t, 0.3, 0.4, 0.48, 0.58);
      r.rot = 0.12 * i.side * U.decay(U.lag(t, 0.62), 1.5, 3); r.eye.glow = 1.1 * U.hold(t, 0.15, 0.3, 0.8, 1); r.eye.narrow = 0.4 * cr - 0.5 * up; r.eye.size = 0.15 * up;
      r.top.len = -0.4 * cr + 0.7 * up; r.top.tip = 0.8 * up; r.bottom.len = -0.3 * cr; r.spread = 0.25 * U.pulse(t, 0.22, 0.32) + 0.2 * U.pulse(t, 0.58, 0.66); } });
  P.clip("game-hatch", { tags: ["g-reset"], dur: 2800, cooldown: 0, form: "cloud", principles: ["staging", "timing", "anticipation", "squash-stretch", "appeal"],
    when: c => (see(c), game(c)),
    update(t, r, c, i) { const s = i.side, hop = t > 0.66 && t < 0.8 ? U.arc((t - 0.66) / 0.14, 1) : 0;
      r.morph = U.hold(t, 0.02, 0.22, 0.42, 0.62); r.eye.lid = U.hold(t, 0.05, 0.2, 0.62, 0.8); r.scale = -0.25 * U.hold(t, 0.35, 0.55, 0.7, 0.92);
      r.eye.gaze = -U.hold(t, 0.7, 0.75, 0.92, 1); r.eye.x = U.keys(t, s < 0 ? HATCH_L : HATCH_R);
      r.sq = -0.15 * U.pulse(t, 0.6, 0.68) + 0.12 * U.pulse(t, 0.66, 0.74) - 0.1 * U.pulse(t, 0.78, 0.86); r.y = -6 * hop; r.eye.glow = 0.5 * U.pulse(t, 0.6, 1); } });
  P.clip("game-wake-rested", { tags: ["wake"], dur: 1800, weight: 4, cooldown: 0, principles: ["anticipation", "squash-stretch", "slow-in-out", "follow-through", "appeal"],
    when: c => (see(c), game(c) && V.en >= 0.75),
    update(t, r) { const pre = U.hold(t, 0, 0.1, 0.12, 0.2), up = U.hold(t, 0.15, 0.38, 0.55, 0.7), hop = t > 0.72 && t < 0.9 ? U.arc((t - 0.72) / 0.18, 1) : 0;
      r.sq = -0.12 * pre + 0.3 * up - 0.1 * U.pulse(t, 0.88, 0.96); r.y = -8 * hop; r.top.len = 0.6 * up; r.bottom.len = 0.3 * up; r.eye.lid = 0.6 * (1 - E.out(Math.min(1, t / 0.2))) * (t < 0.2 ? 1 : 0);
      r.eye.narrow = -0.4 * U.pulse(t, 0.2, 0.9); r.eye.glow = 0.7 * U.pulse(t, 0.15, 1); r.lower.open = -0.15 * up; } });
  P.clip("game-wake-grumpy", { tags: ["wake"], dur: 2000, weight: 4, cooldown: 0, principles: ["timing", "slow-in-out", "straight-ahead", "appeal"],
    when: c => (see(c), game(c) && V.en < 0.45),
    update(t, r, c, i) { const h = U.hold(t, 0.05, 0.25, 0.75, 1), n = U.noise(t * 18, 11 + i.play), sh = U.hold(t, 0.3, 0.35, 0.5, 0.55);
      r.eye.lid = 0.5 * h; r.eye.lidTilt = 0.45 * i.side * h; r.eye.droop = 0.35 * h; r.eye.glow = -0.3 * h; r.eye.gaze = -0.6 * h; r.eye.x = 0.5 * i.side * h;
      r.sq = -0.06 * h + 0.03 * n * sh; r.top.rot = 0.35 * h + 0.1 * n * sh; r.y = 2 * h; } });
  P.clip("game-grumble", { tags: ["g-grumble"], dur: 2600, cooldown: 0, principles: ["staging", "solid-drawing", "timing", "exaggeration", "appeal"],
    when: c => (see(c), game(c)),
    update(t, r, c, i) { const s = i.side, away = U.hold(t, 0.05, 0.25, 0.7, 0.9), peek = U.pulse(t, 0.45, 0.6);
      r.turn = s * Math.PI * away - s * 0.9 * peek; r.scale = -0.06 * away; r.eye.glow = -0.4 * away; r.eye.droop = 0.3 * away; r.eye.x = -0.8 * s * peek; r.eye.gaze = -peek;
      r.top.rot = 0.35 * s * away; r.sq = -0.06 * away; } });
  P.clip("game-bring-back", { tags: ["g-bring"], dur: 2400, cooldown: 0, principles: ["staging", "secondary-action", "follow-through", "timing", "appeal"],
    when: c => (see(c), game(c)),
    update(t, r, c, i) { const s = i.side, h = U.hold(t, 0.05, 0.2, 0.75, 0.95), show = U.hold(t, 0.55, 0.65, 0.8, 0.9);
      r.top.tip = h; r.top.len = 0.5 * h; r.top.rot = 0.25 * s * h * (1 - show); r.top.aim = show; r.y = -5 * Math.abs(Math.sin(TAU * 2 * t)) * h; r.sq = 0.06 * Math.sin(TAU * 4 * t) * h;
      r.eye.glow = 0.5 * h; r.eye.narrow = -0.3 * h; r.tilt = -0.08 * s * h; r.bottom.rot = 0.2 * Math.sin(TAU * 4 * t) * h; } });


  P.clip("game-ready", { tags: ["g-play"], dur: 1500, cooldown: 0, principles: ["anticipation", "staging", "timing", "exaggeration"],
    when: c => (see(c), game(c)),
    cues: [[0.94, (c, api) => { toss(api, c); }]],
    update(t, r, c, i) { const k = U.pulse(t, 0.04, 0.24) + U.pulse(t, 0.3, 0.5) + U.pulse(t, 0.56, 0.76), cr = U.hold(t, 0, 0.8, 0.9, 0.97);
      r.sq = -0.24 * cr; r.y = 4 * cr; r.top.rot = 0.35 * k * i.side; r.top.tip = 0.5 * k; r.eye.glow = 0.4 * k + 0.3 * cr; r.eye.narrow = 0.5 * cr; r.eye.fire = 0.3 * cr;
      r.eye.gaze = -0.6 * cr; r.eye.y = -0.6 * cr; r.bottom.len = -0.3 * cr; } });
  P.clip("game-launch", { tags: ["g-play"], dur: 420, cooldown: 0, fadeIn: 60, principles: ["anticipation", "squash-stretch", "timing"],
    when: c => (see(c), game(c)),
    cues: [[0.72, (c, api) => { toss(api, c); }]],
    update(t, r) { const cr = U.hold(t, 0, 0.5, 0.6, 0.8); r.sq = -0.22 * cr; r.y = 3 * cr; r.eye.gaze = -0.5 * cr; r.eye.y = -0.6 * cr; r.eye.narrow = 0.35 * cr; r.eye.glow = 0.3 * cr; } });
  P.clip("game-airborne", { tags: ["throw"], dur: 1300, weight: 60, cooldown: 0, principles: ["secondary-action", "overlapping", "exaggeration", "appeal"],
    when: c => (see(c), game(c) && !!R && R.ph === "air"),
    update(t, r) { const e = U.env(t, 0.06, 0.3), a = TAU * t;
      r.eye.narrow = -0.55 * e; r.eye.size = 0.1 * e; r.eye.glow = 0.35 * e; r.eye.gaze = -0.5 * e; r.eye.y = 0.5 * e;
      r.top.rot = 0.6 * Math.sin(3 * a) * e; r.bottom.rot = -0.5 * Math.sin(3 * a + 1.2) * e; r.top.len = 0.3 * e; r.bottom.len = 0.3 * e; r.spread = 0.08 * e; } });
  P.clip("game-caught", { tags: ["squish"], dur: 800, weight: 60, cooldown: 0, fadeIn: 40, principles: ["squash-stretch", "exaggeration", "timing", "appeal"],
    when: c => (see(c), game(c) && !!R && R.ph === "held"),
    cues: [[0.05, (c, api) => api.fx("spark", { n: 5, spread: 6.2, speed: 150 })]],
    update(t, r) { const h = U.hold(t, 0, 0.08, 0.6, 1); r.eye.narrow = -0.6 * h; r.eye.size = 0.15 * h; r.eye.glow = h; r.top.len = 0.45 * h; r.bottom.len = 0.3 * h; r.top.rot = 0.3 * Math.sin(TAU * 4 * t) * h; r.eye.lid = 0.3 * U.pulse(t, 0.6, 0.9); } });
  P.clip("game-miss", { tags: ["land"], layer: "over", dur: 1000, weight: 60, cooldown: 0, fadeIn: 20, principles: ["squash-stretch", "timing", "exaggeration", "follow-through"],
    when: c => (see(c), game(c) && !!R && R.ph === "down"),
    update(t, r) { const s = U.pulse(t, 0, 0.35); r.sq = -0.35 * s; r.spread = 0.22 * s; r.eye.lid = 0.5 * U.hold(t, 0.05, 0.15, 0.6, 0.9); r.eye.glow = -0.5 * U.hold(t, 0.05, 0.15, 0.7, 1);
      r.eye.droop = 0.4 * U.hold(t, 0.1, 0.25, 0.7, 1); r.top.rot = -0.4 * U.decay(t, 1.5, 3); r.bottom.len = -0.3 * s; } });
  P.clip("game-celebrate", { tags: ["g-play"], dur: 3200, cooldown: 0, form: "heart", principles: ["anticipation", "arcs", "exaggeration", "squash-stretch", "staging", "appeal"],
    when: c => (see(c), game(c)),
    cues: [[0.28, (c, api) => api.fx("spark", { n: 6, spread: 6.2, speed: 170 })], [0.82, (c, api) => { api.fx("puff", { n: 4, y: c.size.r * 1.1 }); api.fx("spark", { n: 5, dir: -Math.PI / 2, spread: 2.6, y: -c.size.r * 0.6 }); }]],
    update(t, r, c, i) { const s = i.side, cr = U.hold(t, 0, 0.08, 0.1, 0.13), land = U.pulse(t, 0.74, 0.86), up = U.hold(t, 0.84, 0.9, 0.95, 1);
      r.y = U.keys(t, CELEB_Y); r.sq = -0.22 * cr + 0.18 * U.pulse(t, 0.1, 0.2) - 0.25 * land + 0.05 * U.decay(U.lag(t, 0.86), 1.5, 3);
      r.rot = t > 0.1 && t < 0.3 ? s * TAU * E.inOut((t - 0.1) / 0.2) : 0; r.morph = U.hold(t, 0.3, 0.4, 0.55, 0.64); r.eye.glow = 1.1 * U.hold(t, 0.08, 0.2, 0.85, 1); r.eye.narrow = -0.5 * U.hold(t, 0.64, 0.7, 0.9, 1);
      r.top.len = 0.6 * up; r.top.tip = up; r.eye.lid = 0.4 * up; } });
  P.clip("game-round-end", { tags: ["g-play"], dur: 1800, cooldown: 0, principles: ["follow-through", "timing", "slow-in-out", "appeal"],
    when: c => (see(c), game(c)),
    update(t, r, c, i) { const bow = U.hold(t, 0.1, 0.3, 0.5, 0.7), hop = t > 0.7 && t < 0.86 ? U.arc((t - 0.7) / 0.16, 1) : 0;
      r.top.rot = 0.65 * i.side * bow; r.top.bend = 0.4 * bow; r.sq = -0.1 * bow - 0.08 * U.pulse(t, 0.84, 0.94); r.y = 2 * bow - 6 * hop; r.eye.lid = 0.5 * bow; r.eye.glow = 0.4 * U.pulse(t, 0.05, 1); r.tilt = 0.05 * i.side * bow; } });
  P.clip("game-sulk", { tags: ["g-play"], dur: 2600, cooldown: 0, principles: ["staging", "timing", "slow-in-out", "exaggeration", "appeal"],
    when: c => (see(c), game(c)),
    update(t, r, c, i) { const s = i.side, h = U.hold(t, 0.05, 0.25, 0.75, 0.95), sigh = U.pulse(t, 0.3, 0.55);
      r.eye.gaze = -h; r.eye.x = 0.7 * s * h; r.eye.y = 0.6 * h; r.eye.droop = 0.55 * h; r.eye.glow = -0.5 * h; r.eye.lidTilt = -0.45 * s * h; r.eye.lid = 0.25 * h; r.y = 5 * h;
      r.turn = 0.55 * s * h; r.top.rot = 0.65 * s * h; r.top.len = -0.25 * h; r.bottom.rot = -0.25 * s * h; r.sq = -0.12 * h + 0.1 * sigh; r.scale = -0.06 * h; } });


  P.clip("game-calm-eat", { tags: ["g-eat"], layer: "eye", dur: 1700, cooldown: 0, calm: true, principles: ["timing", "slow-in-out", "appeal"],
    when: c => (see(c), game(c)),
    update(t, r) { const h = U.hold(t, 0.05, 0.25, 0.6, 0.9); r.eye.glow = 0.9 * h; r.eye.size = 0.1 * U.pulse(t, 0.1, 0.5); r.eye.lid = 0.7 * U.pulse(t, 0.55, 0.85); r.eye.narrow = 0.3 * U.pulse(t, 0.3, 0.6); r.top.tip = 0.5 * h; } });
  P.clip("game-calm-sleepy", { tags: ["g-sleepy"], layer: "eye", dur: 2600, cooldown: 9000, calm: true, principles: ["slow-in-out", "timing", "appeal"],
    when: c => (see(c), game(c) && V.en < 0.3),
    update(t, r) { const h = U.hold(t, 0.1, 0.45, 0.6, 0.9); r.eye.lid = 0.7 * h; r.eye.droop = 0.4 * h; r.eye.glow = -0.3 * h; r.eye.y = 0.3 * h; } });
  P.clip("game-calm-hungry", { tags: ["g-hungry"], layer: "eye", dur: 2400, cooldown: 9000, calm: true, principles: ["staging", "timing", "appeal"],
    when: c => (see(c), game(c) && V.fu < 0.3),
    update(t, r) { const dn = U.hold(t, 0.05, 0.15, 0.45, 0.55), up = U.hold(t, 0.5, 0.6, 0.85, 1); r.eye.gaze = -dn - up; r.eye.y = 0.8 * dn - 0.1 * up; r.eye.glow = -0.3 * dn + 0.3 * up; r.eye.narrow = -0.4 * up; r.eye.lidTilt = -0.4 * up; r.eye.droop = 0.25 * dn; } });
  P.clip("game-calm-happy", { tags: ["g-happy"], layer: "eye", dur: 1500, cooldown: 9000, calm: true, principles: ["timing", "appeal", "slow-in-out"],
    when: c => (see(c), game(c) && V.joy > 0.7),
    update(t, r) { const h = U.hold(t, 0.05, 0.25, 0.65, 0.95); r.eye.lid = 0.4 * h; r.eye.glow = 0.6 * h; r.eye.size = 0.06 * h; r.top.tip = 0.4 * h; } });
  P.clip("game-calm-level", { tags: ["g-level"], layer: "eye", dur: 2200, cooldown: 0, calm: true, principles: ["staging", "timing", "appeal"],
    when: c => (see(c), game(c)),
    update(t, r) { const h = U.hold(t, 0.05, 0.3, 0.7, 0.95); r.eye.glow = 1.3 * h; r.eye.size = 0.15 * h; r.eye.narrow = -0.4 * h; r.top.tip = h; r.bottom.tip = h; r.eye.lid = 0.6 * U.pulse(t, 0.75, 0.92); } });


  let pend = null;
  const freeNow = c => !!c && (c.state === "follow" || c.state === "calm");
  function playNow(name, c) { c = c || ctxNow(); return freeNow(c) ? !!P.play(name) : false; }
  function playSoon(name, secs) { if (playNow(name)) return true; pend = { name, until: gt + (secs || 6) }; return false; }


  let showUntil = 0, confirmUntil = 0, alertK = "";
  const show = sec => { showUntil = Math.max(showUntil, gt + sec); };
  function panelOn() {
    const c = ctxNow(); if (!c) return true;
    if (c.state === "sleep") return false;
    if (R || (last && gt < last.until) || gt < showUntil || gt < confirmUntil) return true;
    const p = c.pointer, w = c.view.w, h = c.view.h; return !!p && p.type === "mouse" && p.x >= 0 && p.x < Math.min(440, w - 190) && p.y > h - 110;
  }


  let lastOffer = -99, eatWait = 0, figT0 = null;
  function feed(s, c, from, x, y) {
    show(8); if (!c || c.state === "sleep") return false;
    if (s.fu >= 0.92) { if (x != null) P.focus(x, y, 900); if (c.reduced) P.play("game-calm-happy"); else playSoon("game-full", 4); P.emit("game-fed", { from, refused: true, fu: +s.fu.toFixed(3) }); return false; }
    const before = s.fu; s.fu = Math.min(1, s.fu + (from === "figure" ? 0.25 : 0.22)); s.fed++; s.joy = Math.min(1, s.joy + 0.06); if (from === "figure") s.cu = Math.min(1, s.cu + 0.04); gain(s, before < 0.75 ? 3 : 1);
    P.emit("game-fed", { from, refused: false, fu: +s.fu.toFixed(3) });
    if (c.reduced) { P.play("game-calm-eat"); return true; }
    if (from === "figure" && c.state === "follow") { P.focus(x, y, 1700); P.play("game-eat-figure"); }
    else if (from === "figure") eatWait = gt + 12;
    else playSoon("game-eat", 5);
    return true;
  }
  function figWatch(s, c) {
    const f = c.figure; if (!f || !fin(f.ms)) return; const ft = c.now - f.ms, fresh = figT0 === null || Math.abs(ft - figT0) > 30; figT0 = ft; if (!fresh) return;
    if (f.ms < 1900 || f.ms > 2900 || gt - lastOffer < 5 || R || c.state === "sleep") return; lastOffer = gt; feed(s, c, "figure", f.x, f.y);
  }


  let sleptAt = 0, lastSleepTry = -99;
  function sleepWatch(s, c, night) {
    if (c.state === "sleep") { if (!sleptAt) sleptAt = gt; if (s.en >= 0.97) { const long = gt - sleptAt > 60; sleptAt = 0; P.start("game"); if (long) { s.naps++; gain(s, 2); } } return; }
    sleptAt = 0; if (R) return;
    if (s.en < (night ? 0.3 : 0.12) && freeNow(c) && gt - lastSleepTry > 30) { lastSleepTry = gt; P.sleep(); }
  }


  function levelCheck(s, c, quiet) {
    if (s.lvl >= LVMAX || s.xp < need(s.lvl)) return false; const today = dayOf(wall()); if (s.lvlDay === today) return false;
    s.xp -= need(s.lvl); V.prev = s.lvl; s.lvl++; V.lvl = s.lvl; s.lvlDay = today;
    if (quiet) { V.prev = s.lvl; lvlNow = -1e9; lvlWait = 0; return true; }
    lvlNow = 1e15; lvlWait = gt + 8; show(8); P.emit("game-level", { lvl: s.lvl }); P.game.save();
    if (c && c.reduced) { P.play("game-calm-level"); lvlNow = c.now; lvlWait = 0; } else playSoon("game-level-up", 7);
    return true;
  }


  const ROUND = 40, LIVES = 3;
  let R = null, last = null, selfFlick = false, flicks = [], bringT = 0;
  function startRound(s, c) {
    if (!c || c.reduced || c.state === "sleep" || R || s.en < 0.15) return false;
    R = { ph: "ready", left: ROUND, caught: 0, missed: 0, tosses: 0, t0: gt, at: gt, next: 0 }; last = null; show(4);
    if (!playNow("game-ready", c)) { R.ph = "wait"; R.next = gt + 0.4; }
    P.emit("game-round", { phase: "start" }); return true;
  }
  function toss(api, c) {
    c = c || ctxNow(); if (!R || !c || c.reduced) return false; if (R.ph !== "ready" && R.ph !== "launch" && R.ph !== "wait") return false;
    if (c.state === "press" || c.state === "held" || c.state === "sleep" || c.state === "calm") return false;
    const W = c.view.w, Hh = c.view.h, x = c.body.x, y = c.body.y, g = 2500 * (c.small ? 0.85 : 1), sf = c.safe || { top: 0, bottom: 0 };
    const top = sf.top + 70, floor = Hh - sf.bottom - 45, rise = clamp(Math.min(y - top, 0.4 * Hh + 16 * Math.min(R.caught, 12)), 60, 900), vy = -Math.sqrt(2 * g * rise);
    const T = (-vy + Math.sqrt(vy * vy + 2 * g * Math.max(0, floor - y))) / g;
    let xt = c.body.peek ? W * (0.62 + 0.25 * Math.random()) : c.body.home.x + (Math.random() - 0.5) * Math.min(240, 90 + 14 * R.caught); xt = clamp(xt, 50, W - 50);
    const vx = clamp((xt - x) / Math.max(0.35, T) / 0.82, -900, 900), ph = R.ph; R.ph = "air"; R.at = gt;
    selfFlick = true; let ok = false; try { ok = !!(P.toss ? P.toss(vx, vy) : P.debug.flick(vx, vy)); } catch (e) { ok = false; } selfFlick = false;
    if (!ok) { R.ph = ph === "ready" ? "wait" : ph; R.next = gt + 0.4; return false; }
    R.tosses++; const st = P.game.state(); if (st) st.en = Math.max(0, st.en - 0.006);
    P.emit("game-round", { phase: "toss", n: R.tosses, vx: Math.round(vx), vy: Math.round(vy) }); return true;
  }
  function endRound(s, why) {
    if (!R) return; const r = R; R = null; s.rounds++; const nb = r.caught > s.best; if (nb) s.best = r.caught;
    gain(s, Math.floor(r.caught / 2) + (nb ? 3 : 0)); s.joy = clamp(s.joy + (r.caught > 0 ? 0.1 : -0.05), 0, 1); last = { caught: r.caught, best: nb, until: gt + 7 }; show(7);
    const clip = r.caught === 0 ? (why === "stop" ? "" : "game-sulk") : nb ? "game-celebrate" : "game-round-end"; if (clip) pend = { name: clip, until: gt + 12 };
    P.emit("game-round", { phase: "end", why, caught: r.caught, missed: r.missed, tosses: r.tosses, best: s.best, newBest: nb, secs: +(gt - r.t0).toFixed(2) }); P.game.save();
  }
  function roundStep(s, c, d) {
    if (c.reduced || c.state === "sleep") { endRound(s, "stop"); return; }
    if (R.over) { endRound(s, "misses"); return; }
    if (R.ph !== "ready") R.left -= d; if (R.left <= 0) { R.left = 0; endRound(s, "time"); return; }
    const free = c.state === "follow" || c.state === "travel";
    if (R.ph === "wait" && gt >= R.next && free) { R.ph = "launch"; R.at = gt; if (!P.play("game-launch")) toss(P, c); }
    else if ((R.ph === "launch" || R.ph === "ready") && gt - R.at > (R.ph === "ready" ? 2.4 : 1.1)) { if (free) { if (!toss(P, c)) { R.ph = "wait"; R.next = gt + 0.3; } } else if (c.state !== "press" && c.state !== "held") { R.ph = "wait"; R.next = gt + 0.3; } }
    else if (R.ph === "down" && free) { R.ph = "wait"; R.next = gt + 0.25; }
    else if (R.ph === "air" && gt - R.at > 9) { R.ph = "wait"; R.next = gt + 0.3; }
  }
  function miss(s) { if (!R || R.ph !== "air") return; R.missed++; R.ph = "down"; s.joy = Math.max(0, s.joy - 0.02); P.emit("game-round", { phase: "miss", missed: R.missed }); if (R.missed >= LIVES) R.over = true; }


  let lastRead = -99;
  const H = {
    state: d => { const s = P.game.state(); if (!s || !R) return;
      if (d.state === "press" && (d.from === "thrown" || d.from === "cling" || d.from === "slide") && R.ph === "air") { R.caught++; R.ph = "held"; s.caught++; s.joy = Math.min(1, s.joy + 0.03); P.emit("game-round", { phase: "catch", caught: R.caught }); }
      else if ((d.state === "recover" || d.state === "dizzy") && R.ph === "air") miss(s); },
    land: () => { const s = P.game.state(); if (s && R && R.ph === "air") miss(s); },
    boop: () => after(0.3), pop: () => after(0.3), relief: () => after(0.3), free: () => after(0.8),
    release: d => { if (R && R.ph === "held" && !(d && d.speed >= 280)) { R.ph = "wait"; R.next = gt + 0.15; } },
    flick: d => { if (selfFlick) return; const s = P.game.state(); if (!s) return; const sp = d && fin(d.speed) ? d.speed : 1500; s.en = Math.max(0, s.en - (R ? 0.5 : 1) * (0.03 + sp / 80000));
      if (R && R.ph === "held") { R.ph = "air"; R.at = gt; } else if (!R) { bringT = gt; flicks.push(gt); } },
    impact: () => { const s = P.game.state(); if (s && !R) s.en = Math.max(0, s.en - 0.006); },
    read: d => { const s = P.game.state(), c = ctxNow(); if (!s || (c && c.scroll && c.scroll.fast) || gt - lastRead < 1.2) return; lastRead = gt;
      const k = d && d.kind ? String(d.kind) : "p"; s.cu = Math.min(1, s.cu + (k === "figure" || k[0] === "h" ? 0.05 : 0.025)); s.reads++; if (s.reads % 4 === 0) gain(s, 1); },
    scroll: () => { const s = P.game.state(); if (s) s.cu = Math.max(0, s.cu - 0.005); },
    squish: () => show(8), stir: () => show(6), grab: () => show(6), near: () => show(6),
    sleep: () => { const s = P.game.state(); if (s && R) endRound(s, "stop"); },
    "x-game-sim": d => sim(d)
  };
  function after(sec) { if (R && R.ph === "held") { R.ph = "wait"; R.next = gt + sec; } else if (!R) { const s = P.game.state(); if (s) { s.joy = Math.min(1, s.joy + 0.03); s.xp = Math.min(s.xp + 0.2, 2 * need(s.lvl) + 40); } } }
  const handlers = Object.keys(H).map(k => [k, H[k]]);


  let biasK = "";
  function setBias(s) {
    const night = isNight(wall()), b = {};
    if (s.en < (night ? 0.55 : 0.3)) b["g-sleepy"] = s.en < 0.18 ? 3 : 1.5;
    if (s.fu < 0.3) b["g-hungry"] = s.fu < 0.12 ? 3 : 1.5;
    if (s.cu < 0.25) b["g-bored"] = 1; else if (s.cu > 0.7) b["g-curious"] = 0.8;
    if (s.joy > 0.7 && s.en > 0.4 && s.fu > 0.4) b["g-happy"] = 1;
    const k = Object.keys(b).sort().map(x => x + b[x]).join(","); if (k === biasK) return; biasK = k; P.game.bias(k ? b : null);
  }
  function lowest(s) { const L = [["Energy", s.en], ["Splats", s.fu], ["Curiosity", s.cu]]; L.sort((a, b) => a[1] - b[1]); return L[0]; }


  function sim(d) {
    const s = P.game.state(); if (!s || !d || typeof d !== "object") return; init(s); const c = ctxNow();
    if (fin(+d.clock)) { simMs = +d.clock; dayCheck(s); }
    if (d.set && typeof d.set === "object") { ["en", "fu", "cu", "joy", "xp", "lvl", "best", "lvlDay"].forEach(k => { if (fin(+d.set[k])) s[k] = +d.set[k]; }); init(s); snapView(s); }
    if (fin(+d.away) && +d.away > 0) { const a = Math.min(+d.away, 259200); simMs += a * 1000; mod.away(a, s, P); dayCheck(s); snapView(s); }
    if (fin(+d.open) && +d.open > 0) { let left = Math.min(+d.open, 604800), slept = false;
      while (left > 0) { const k = Math.min(left, 15); left -= k; simMs += k * 1000; const night = isNight(wall());
        if (!slept && s.en < (night ? 0.3 : 0.12)) slept = true; else if (slept && s.en >= 0.97) { slept = false; s.naps++; gain(s, 2); }
        drift(s, k, slept, night); dayCheck(s); levelCheck(s, c, true); }
      snapView(s); }
    if (fin(+d.feed) && +d.feed > 0) for (let n = 0; n < Math.min(50, +d.feed); n++) { if (s.fu >= 0.92) break; const b = s.fu; s.fu = Math.min(1, s.fu + 0.22); s.fed++; s.joy = Math.min(1, s.joy + 0.06); gain(s, b < 0.75 ? 3 : 1); }
    if (fin(+d.reads) && +d.reads > 0) for (let n = 0; n < Math.min(2000, +d.reads); n++) { s.cu = Math.min(1, s.cu + 0.025); s.reads++; if (s.reads % 4 === 0) gain(s, 1); }
    if (d.feed || d.reads) { levelCheck(s, c, true); snapView(s); }
    if (d.report) P.emit("game-report", { round: R ? { ph: R.ph, left: +R.left.toFixed(2), caught: R.caught, missed: R.missed, tosses: R.tosses } : null, last, panel: panelOn(), gt: +gt.toFixed(2), simMs, grow: +grow(c).toFixed(4), night: isNight(wall()), bias: biasK, view: { en: +V.en.toFixed(3), fu: +V.fu.toFixed(3), cu: +V.cu.toFixed(3), joy: +V.joy.toFixed(3), lvl: V.lvl, prev: V.prev }, pend: pend ? pend.name : null });
    P.game.save();
  }


  const mod = {
    start(api, s) { init(s); snapView(s); R = null; last = null; pend = null; biasK = ""; figT0 = null; eatWait = 0; bringT = 0; flicks = []; sleptAt = 0; confirmUntil = 0; alertK = ""; show(8);
      handlers.forEach(([k, f]) => P.on(k, f)); P.play(C && C.state === "sleep" ? "game-doze" : "game-breathe"); },
    stop(api, s) { handlers.forEach(([k, f]) => P.off(k, f)); if (R && s) endRound(s, "stop"); R = null; pend = null; last = null; P.stopClip("game-breathe"); P.stopClip("game-doze"); },
    away(sec, s) { init(s); sec = clamp(+sec || 0, 0, 259200); s.fu = Math.max(Math.min(s.fu, 0.08), s.fu - sec / 14400); s.en = Math.min(1, s.en + sec / 1800); if (s.cu > 0.3) s.cu = Math.max(0.3, s.cu - sec / 7200); s.joy = Math.max(Math.min(s.joy, 0.35), s.joy - sec / 14400); },
    tick(d, s) {
      init(s); d = clamp(+d || 0, 0, 0.5); gt += d; const c = ctxNow(); if (!c || !game(c)) return;
      const asleep = c.state === "sleep", night = isNight(wall());
      drift(s, d, asleep, night); dayCheck(s); viewStep(s, d);
      if (!R) figWatch(s, c);
      sleepWatch(s, c, night);
      if (R) roundStep(s, c, d);
      if (pend) { if (gt >= pend.until) pend = null; else if (playNow(pend.name, c)) pend = null; }
      if (eatWait && gt < eatWait && c.state === "follow") { eatWait = 0; P.play("game-eat"); } else if (eatWait && gt >= eatWait) eatWait = 0;
      if (lvlWait && gt > lvlWait) { lvlNow = c.now; lvlWait = 0; }
      if (bringT && !R && gt - bringT < 15 && c.state === "follow") { bringT = 0; flicks = flicks.filter(x => gt - x < 20); P.play(flicks.length >= 3 || s.en < 0.3 ? "game-grumble" : "game-bring-back"); }
      else if (bringT && gt - bringT >= 15) bringT = 0;
      if (!R && freeNow(c)) levelCheck(s, c, false);
      setBias(s);
      const k = (s.fu < 0.2 ? "f" : "") + (s.en < 0.2 ? "e" : "") + (s.cu < 0.15 ? "c" : ""); if (k && k !== alertK) show(5); alertK = k;
    },
    chips(s) {
      init(s); if (!panelOn()) return [];
      const c0 = ctxNow();
      if (R) return c0 && c0.small ? [{ id: "caught", label: "Caught", text: String(R.caught) }, { id: "time", label: "Time", value: R.left / ROUND }] : [{ id: "caught", label: "Caught", text: String(R.caught) }, { id: "missed", label: "Missed", text: R.missed + " of " + LIVES }, { id: "time", label: "Time", value: R.left / ROUND }];
      if (last && gt < last.until) return last.best ? [{ id: "caught", label: "New best", text: String(last.caught) }] : [{ id: "caught", label: "Caught", text: String(last.caught) }, { id: "best", label: "Best", text: String(s.best) }];
      const lo = lowest(s), c = ctxNow(), out = [{ id: "level", label: "Level", text: String(s.lvl) }, { id: "need", label: lo[0], value: lo[1] }];
      if (s.best > 0 && c && !c.small) out.push({ id: "best", label: "Best", text: String(s.best) });
      return out;
    },
    actions(s) {
      if (!panelOn()) return []; if (R) return [{ id: "stop", label: "Stop" }];
      const c = ctxNow(), out = [{ id: "feed", label: "Feed" }];
      if (c && !c.reduced) out.push(s.en < 0.15 ? { id: "play", label: "Too sleepy", off: true } : { id: "play", label: "Play" });
      out.push(gt < confirmUntil ? { id: "reset-yes", label: "Confirm reset" } : { id: "reset", label: "Reset" });
      return out;
    },
    act(id, s) {
      init(s); const c = ctxNow(); show(8);
      if (id === "feed") feed(s, c, "button");
      else if (id === "play") startRound(s, c);
      else if (id === "stop") endRound(s, "stop");
      else if (id === "reset") confirmUntil = gt + 4;
      else if (id === "reset-yes") { confirmUntil = 0; R = null; last = null; pend = null; P.game.reset(); const ns = P.game.state(); if (ns) { init(ns); snapView(ns); } biasK = ""; P.game.bias(null); if (c && !c.reduced) playSoon("game-hatch", 6); P.emit("game-reset", {}); }
    }
  };
  P.game.register(mod);
})();
} catch (e) { console.warn("companion pack game", e); } finally { if (window.GSPet) GSPet.debug.setPack(""); }

try { if (window.GSPet) GSPet.debug.setPack("idle");


(function packIdle() {
  const P = typeof GSPet === "object" ? GSPet : null; if (!P) return;
  const E = P.ease, U = P.util, TAU = Math.PI * 2;
  const sgn = v => v < 0 ? -1 : 1;
  const toward = c => sgn(c.focus.dx || -1);
  const air = (t, a, b, h) => t > a && t < b ? U.arc((t - a) / (b - a), h) : 0;




  P.clip("squint-far", { tags: ["idle", "eye", "curious"], layer: "eye", dur: 2600, weight: 0.9, cooldown: 14000, principles: ["staging", "pose-to-pose", "slow-in-out", "timing"],
    update(t, r, c, i) { const s = i.side, h = U.hold(t, 0.05, 0.25, 0.72, 0.95), q = U.hold(t, 0.2, 0.35, 0.68, 0.9); r.eye.gaze = -h; r.eye.x = 0.85 * s * h; r.eye.y = -0.55 * h;
      r.eye.narrow = 0.55 * q; r.eye.lid = 0.22 * q; r.eye.lidTilt = 0.25 * s * U.hold(t, 0.25, 0.4, 0.65, 0.85); r.eye.size = -0.08 * h; } });
  P.clip("eye-roll", { tags: ["idle", "eye", "bored"], layer: "eye", dur: 1500, weight: 0.5, cooldown: 30000, principles: ["arcs", "exaggeration", "timing", "appeal"],
    update(t, r, c, i) { const s = i.side, h = U.hold(t, 0, 0.12, 0.72, 0.92), a = Math.PI * E.inOut(U.lag(t, 0.1)); r.eye.gaze = -h;
      r.eye.x = -s * Math.cos(a) * 0.9 * h; r.eye.y = (-Math.sin(a) * 0.95 - 0.2) * h; r.eye.lid = 0.3 * h; r.eye.narrow = 0.15 * h; r.sq = -0.04 * U.pulse(t, 0.7, 1); r.y = 1.5 * U.pulse(t, 0.7, 1); } });
  P.clip("side-eye", { tags: ["idle", "eye", "nervous"], layer: "eye", dur: 2200, weight: 0.8, cooldown: 16000, principles: ["staging", "timing", "pose-to-pose", "appeal"],
    update(t, r, c, i) { const s = i.side, k = U.keys(t, [[0, 0], [0.18, 1, "inOut"], [0.78, 1], [0.86, 0, "out"]]); r.eye.gaze = -k; r.eye.x = 1.05 * s * k;
      r.eye.narrow = 0.5 * k; r.eye.lid = 0.35 * k; r.eye.lidTilt = -0.45 * s * k; r.tilt = -0.04 * s * k; } });
  P.clip("wide-wonder", { tags: ["idle", "eye", "curious", "happy"], layer: "eye", dur: 2400, weight: 0.7, cooldown: 18000, principles: ["exaggeration", "slow-in-out", "appeal", "timing"],
    update(t, r) { const h = U.hold(t, 0.05, 0.4, 0.7, 0.98); r.eye.narrow = -0.25 * h; r.eye.size = 0.3 * h; r.eye.glow = 0.55 * h; r.eye.y = -0.25 * h; r.tilt = -0.05 * h; r.top.rot = 0.12 * U.decay(U.lag(t, 0.35), 1.5, 3); } });
  P.clip("track-fly", { tags: ["idle", "eye", "curious"], layer: "eye", dur: 3200, weight: 0.6, cooldown: 22000, principles: ["straight-ahead", "secondary-action", "timing", "staging"],
    update(t, r, c, i) { const h = U.hold(t, 0, 0.08, 0.86, 1), k = 7 + 3 * i.seed, s0 = 31 + Math.floor(i.seed * 50);
      r.eye.gaze = -h; r.eye.x = U.noise(t * k, s0) * h; r.eye.y = (0.75 * U.noise(t * k * 1.3, s0 + 5) - 0.25) * h; r.eye.narrow = 0.3 * h;
      r.top.rot = 0.22 * U.noise(t * k, s0) * h; r.tilt = 0.05 * U.noise(t * k * 0.6, s0 + 9) * h; } });
  P.clip("daydream", { tags: ["idle", "eye", "content"], layer: "eye", dur: 4200, weight: 0.6, cooldown: 25000, principles: ["slow-in-out", "timing", "appeal", "arcs"],
    update(t, r, c, i) { const h = U.hold(t, 0.05, 0.3, 0.75, 0.97), s = i.side; r.eye.gaze = -h; r.eye.x = 0.45 * s * Math.sin(Math.PI * t) * h; r.eye.y = -0.6 * h;
      r.eye.lid = 0.45 * h; r.eye.glow = 0.3 * h; r.eye.size = -0.06 * h; r.tilt = 0.06 * s * Math.sin(TAU * t) * h; r.y = -2 * Math.sin(TAU * t) * h; } });
  P.clip("focus-pull", { tags: ["idle", "eye", "curious"], layer: "eye", dur: 1300, weight: 0.7, cooldown: 15000, principles: ["timing", "exaggeration", "squash-stretch", "slow-in-out"],
    update(t, r) { const a = U.pulse(t, 0, 0.35), b = U.hold(t, 0.3, 0.42, 0.7, 0.95); r.eye.narrow = 0.75 * a - 0.2 * b; r.eye.size = -0.18 * a + 0.16 * b; r.eye.glow = 0.4 * b; r.eye.lid = 0.15 * a; } });


  P.clip("flutter-blink", { tags: ["blink", "eye", "nervous"], layer: "eye", dur: 520, weight: 0.5, cooldown: 8000, fadeIn: 0, fadeOut: 60, principles: ["timing", "exaggeration", "secondary-action"],
    update(t, r) { r.eye.lid = 0.9 * Math.pow(U.pulse(t, 0, 0.3) + U.pulse(t, 0.35, 0.65) + U.pulse(t, 0.7, 1), 0.8); r.eye.narrow = 0.15 * U.pulse(t, 0, 1); } });
  P.clip("heavy-blink", { tags: ["blink", "eye", "bored"], layer: "eye", dur: 1400, weight: 1.2, cooldown: 6000, principles: ["timing", "slow-in-out", "appeal"],
    when: c => c.idleMs > 20000,
    update(t, r) { r.eye.lid = U.keys(t, [[0, 0], [0.3, 0.95, "inOut"], [0.45, 0.95], [0.62, 0.4, "out"], [0.85, 0.4], [1, 0, "inOut"]]); const d = U.hold(t, 0.1, 0.4, 0.8, 1); r.eye.droop = 0.3 * d; r.eye.glow = -0.2 * d; } });
  P.clip("half-blink", { tags: ["blink", "eye"], layer: "eye", dur: 800, weight: 0.5, cooldown: 9000, principles: ["timing", "pose-to-pose", "appeal"],
    update(t, r, c, i) { const h = U.hold(t, 0, 0.2, 0.6, 0.85); r.eye.lid = 0.5 * h; r.eye.lidTilt = 0.35 * i.side * h; r.eye.narrow = 0.2 * h; } });


  P.clip("ponder", { tags: ["idle", "curious"], dur: 3000, weight: 0.6, cooldown: 20000, calm: true, principles: ["pose-to-pose", "staging", "secondary-action", "appeal"],
    update(t, r, c, i) { const s = i.side, h = U.hold(t, 0.05, 0.25, 0.8, 0.98); r.eye.gaze = -h; r.eye.x = 0.6 * s * h; r.eye.y = -0.6 * h; r.eye.spin = 0.9 * s * E.inOut(U.lag(t, 0.2)) * h;
      r.bottom.root = -0.9 * s * h; r.bottom.bend = 0.5 * s * h; r.bottom.len = 0.25 * h; r.bottom.rot = 0.12 * Math.sin(TAU * 3 * t) * h; r.tilt = 0.08 * s * h; r.eye.narrow = 0.2 * h; } });
  P.clip("peek-over", { tags: ["idle", "curious", "shy"], dur: 2800, weight: 0.6, cooldown: 22000, principles: ["anticipation", "staging", "timing", "appeal"],
    update(t, r, c, i) { const s = i.side, duck = U.keys(t, [[0, 0], [0.12, 1, "out"], [0.3, 1], [0.48, 0.35, "inOut"], [0.7, 0.35], [0.78, 0.9, "out"], [0.86, 0.9], [1, 0, "inOut"]]), look = U.hold(t, 0.4, 0.48, 0.7, 0.76);
      r.y = 9 * duck; r.sq = -0.14 * duck; r.eye.lid = 0.55 * duck * U.hold(t, 0, 0.1, 0.32, 0.45); r.eye.gaze = -look; r.eye.y = -0.4 * look;
      r.eye.x = 0.8 * s * U.pulse(t, 0.46, 0.6) - 0.8 * s * U.pulse(t, 0.56, 0.72); r.top.len = -0.3 * duck; r.bottom.len = -0.35 * duck; } });
  P.clip("curious-tilt", { tags: ["idle", "curious"], dur: 2000, weight: 1, cooldown: 12000, principles: ["pose-to-pose", "appeal", "slow-in-out", "follow-through"],
    update(t, r, c, i) { const s = i.side, k = U.keys(t, [[0, 0], [0.18, 0.22, "back"], [0.45, 0.22], [0.6, -0.16, "back"], [0.85, -0.16], [1, 0, "inOut"]]), h = U.hold(t, 0.1, 0.2, 0.85, 1);
      r.tilt = s * k; r.eye.narrow = -0.35 * h; r.eye.x = 1.3 * s * k; r.top.rot = -0.5 * s * k + 0.15 * U.decay(U.lag(t, 0.2), 2, 4); r.top.len = 0.2 * h; r.eye.glow = 0.2 * h; } });
  P.clip("sniff-page", { tags: ["idle", "curious", "read"], dur: 2600, weight: 0.7, cooldown: 18000, principles: ["timing", "staging", "anticipation", "secondary-action"],
    when: c => c.focus.kind !== "none",
    update(t, r, c) { const s = toward(c), k = U.keys(t, [[0, 0], [0.1, 0.33, "out"], [0.22, 0.33], [0.3, 0.66, "out"], [0.42, 0.66], [0.5, 1, "out"], [0.75, 1], [1, 0, "inOut"]]), h = U.hold(t, 0.05, 0.15, 0.75, 0.95);
      r.x = 12 * s * k; r.tilt = 0.12 * s * k; r.sq = -0.05 * (U.pulse(t, 0.08, 0.14) + U.pulse(t, 0.28, 0.34) + U.pulse(t, 0.48, 0.54)); r.eye.narrow = 0.4 * h; r.top.aim = 0.7 * U.hold(t, 0.45, 0.55, 0.72, 0.85); r.top.tip = 0.3 * U.hold(t, 0.5, 0.58, 0.7, 0.8); r.eye.glow = 0.2 * h; } });
  P.clip("tiptoe-look", { tags: ["idle", "curious", "read"], dur: 2200, weight: 0.6, cooldown: 20000, principles: ["anticipation", "squash-stretch", "staging", "slow-in-out"],
    update(t, r, c) { const s = toward(c), h = U.hold(t, 0.1, 0.3, 0.7, 0.92), pre = U.pulse(t, 0, 0.14); r.sq = -0.08 * pre + 0.16 * h; r.y = 2 * pre - 9 * h; r.bottom.len = 0.7 * h; r.tilt = s * (0.05 + 0.04 * Math.sin(TAU * 3 * t)) * h;
      r.eye.gaze = -h; r.eye.x = 0.8 * s * h; r.eye.y = -0.35 * h; r.eye.narrow = 0.3 * h; } });
  P.clip("look-up", { tags: ["idle", "curious"], dur: 2400, weight: 0.6, cooldown: 20000, calm: true, principles: ["staging", "slow-in-out", "appeal", "secondary-action"],
    update(t, r) { const h = U.hold(t, 0.06, 0.3, 0.72, 0.95); r.eye.gaze = -h; r.eye.y = -1.05 * h; r.eye.narrow = -0.3 * h; r.eye.glow = 0.25 * h; r.sq = 0.08 * h; r.y = -3 * h; r.top.len = 0.35 * h; r.top.rot = 0.1 * Math.sin(TAU * 2 * t) * h; r.lower.open = -0.12 * h; } });
  P.clip("check-behind", { tags: ["idle", "nervous"], dur: 1900, weight: 0.5, cooldown: 25000, principles: ["solid-drawing", "anticipation", "timing", "staging"],
    update(t, r, c, i) { const s = i.side, k = U.keys(t, [[0, 0], [0.12, -0.12, "inOut"], [0.3, 1.1, "out"], [0.55, 1.1], [0.72, 0, "inOut"]]), h = U.hold(t, 0.1, 0.25, 0.6, 0.75); r.turn = s * k; r.eye.gaze = -h; r.eye.x = 0.9 * s * h;
      r.eye.narrow = 0.3 * U.hold(t, 0.2, 0.3, 0.55, 0.7); r.sq = -0.05 * U.pulse(t, 0.75, 0.95); r.eye.glow = 0.15 * U.pulse(t, 0.75, 1); } });


  P.clip("tap-tap", { tags: ["idle", "bored"], dur: 1600, weight: 0.8, cooldown: 16000, principles: ["timing", "secondary-action", "appeal"],
    update(t, r, c, i) { const s = i.side, h = U.hold(t, 0, 0.08, 0.9, 1), tap = Math.pow(Math.max(0, Math.sin(TAU * 4 * t)), 3); r.bottom.root = -0.5 * s * h; r.bottom.rot = 0.55 * s * tap * h; r.y = -1.6 * tap * h;
      r.eye.lidTilt = 0.3 * s * h; r.eye.lid = 0.15 * h; r.eye.narrow = 0.15 * h; r.eye.gaze = -0.5 * h; r.eye.y = 0.5 * h; } });
  P.clip("pole-twiddle", { tags: ["idle", "nervous"], dur: 2200, weight: 0.7, cooldown: 18000, principles: ["secondary-action", "overlapping", "timing", "appeal"],
    update(t, r, c, i) { const s = i.side, h = U.hold(t, 0, 0.12, 0.85, 1), a = TAU * 3 * t; r.top.root = s * (0.9 + 0.25 * Math.sin(a)) * h; r.bottom.root = -s * (0.9 + 0.25 * Math.sin(a + Math.PI)) * h;
      r.top.rot = 0.2 * Math.cos(a) * h; r.bottom.rot = 0.2 * Math.cos(a + Math.PI) * h; r.eye.gaze = -0.6 * h; r.eye.y = 0.6 * h; r.eye.x = 0.3 * s * h; } });
  P.clip("shuffle", { tags: ["idle"], dur: 2000, weight: 0.8, cooldown: 14000, principles: ["overlapping", "follow-through", "slow-in-out", "timing"],
    update(t, r, c, i) { const s = i.side, e = U.env(t, 0.15, 0.25), w = Math.sin(TAU * 2 * t); r.tilt = 0.07 * s * w * e; r.x = 2.5 * s * w * e; r.bottom.root = -0.25 * s * w * e; r.sq = -0.03 * Math.abs(w) * e;
      r.top.rot = -0.08 * s * Math.sin(TAU * 2 * t - 0.8) * e; r.eye.x = 0.2 * s * Math.sin(TAU * 2 * t - 0.4) * e; } });
  P.clip("orbit-hula", { tags: ["idle", "happy"], dur: 2200, weight: 0.5, cooldown: 24000, principles: ["arcs", "overlapping", "secondary-action", "appeal"],
    update(t, r) { const e = U.env(t, 0.15, 0.25), a = TAU * 3 * t; r.orbit.rot = 0.35 * Math.sin(a) * e; r.orbit.spin = 0.25 * Math.cos(a) * e; r.orbit.y = 3 * Math.cos(a) * e; r.x = -2.5 * Math.sin(a) * e; r.tilt = -0.04 * Math.sin(a) * e; r.eye.glow = 0.25 * e; r.eye.narrow = -0.2 * e; } });
  P.clip("band-twirl", { tags: ["idle", "bored"], dur: 2400, weight: 0.6, cooldown: 20000, principles: ["secondary-action", "timing", "slow-in-out"],
    update(t, r, c, i) { const e = U.env(t, 0.12, 0.2); r.lower.spin = 0.8 * Math.sin(TAU * 2 * t) * e * i.side; r.eye.gaze = -0.7 * e; r.eye.y = 0.55 * e; r.eye.x = 0.45 * Math.sin(TAU * 2 * t - 0.5) * i.side * e; r.eye.lid = 0.2 * e; } });


  P.clip("startle", { tags: ["idle", "nervous"], dur: 1200, weight: 0.35, cooldown: 30000, fadeIn: 40, principles: ["timing", "exaggeration", "squash-stretch", "follow-through", "anticipation"],
    update(t, r) { const up = U.pulse(t, 0.05, 0.4), jolt = U.pulse(t, 0.05, 0.16), shake = U.decay(U.lag(t, 0.4), 6, 5);
      r.y = -14 * up; r.sq = -0.06 * U.pulse(t, 0, 0.06) + 0.24 * jolt - 0.12 * U.pulse(t, 0.38, 0.5) + 0.04 * shake; r.eye.narrow = -0.25 * U.hold(t, 0.04, 0.1, 0.5, 0.8); r.eye.size = 0.32 * U.hold(t, 0.04, 0.1, 0.4, 0.7);
      r.top.len = 0.8 * U.hold(t, 0.04, 0.1, 0.35, 0.6); r.bottom.len = 0.6 * U.hold(t, 0.04, 0.1, 0.35, 0.6); r.spread = 0.25 * jolt; r.x = 2.5 * shake; r.eye.glow = 0.4 * up; } });
  P.clip("sigh-relief", { tags: ["idle", "relief", "content"], dur: 2400, weight: 0.5, cooldown: 25000, principles: ["slow-in-out", "squash-stretch", "timing", "appeal"],
    update(t, r) { const inh = U.hold(t, 0.05, 0.35, 0.45, 0.6), out = U.hold(t, 0.5, 0.65, 0.8, 1); r.scale = 0.08 * inh - 0.04 * out; r.sq = 0.1 * inh - 0.12 * out; r.y = -2 * inh + 3 * out;
      r.eye.lid = 0.3 * inh + 0.55 * out; r.eye.glow = 0.3 * out; r.top.rot = 0.25 * out; r.bottom.len = -0.15 * out; r.lower.open = 0.15 * inh; } });
  P.clip("proud-puff", { tags: ["idle", "proud", "happy"], dur: 2200, weight: 0.5, cooldown: 25000, principles: ["exaggeration", "staging", "appeal", "pose-to-pose", "anticipation"],
    update(t, r, c, i) { const h = U.hold(t, 0.08, 0.3, 0.75, 0.95), pre = U.pulse(t, 0, 0.12); r.scale = 0.14 * h; r.y = 2 * pre - 4 * h; r.sq = -0.06 * pre + 0.05 * h; r.top.root = -1.87 * h; r.bottom.root = -1.27 * h; r.top.bend = 0.6 * h; r.bottom.bend = -0.6 * h;
      r.eye.lid = 0.35 * h; r.eye.glow = 0.5 * h; r.eye.narrow = -0.1 * h; r.tilt = -0.06 * i.side * h; r.eye.gaze = -0.5 * h; r.eye.y = -0.35 * h; } });
  P.clip("bashful-shrink", { tags: ["idle", "shy", "caught"], dur: 2600, weight: 0.5, cooldown: 25000, calm: true, principles: ["staging", "appeal", "slow-in-out", "secondary-action"],
    update(t, r, c, i) { const s = i.side, h = U.hold(t, 0.05, 0.25, 0.7, 0.98); r.scale = -0.12 * h; r.y = 3 * h; r.turn = 0.45 * s * h; r.eye.gaze = -h; r.eye.x = 0.7 * s * h; r.eye.y = 0.6 * h; r.eye.lid = 0.3 * h; r.eye.glow = 0.35 * h;
      r.top.rot = (0.5 * s + 0.15 * Math.sin(TAU * 3 * t)) * h; r.top.len = -0.25 * h; r.bottom.rot = -0.2 * s * h; r.tilt = 0.05 * s * h; } });
  const GB = [0.12, 0.42, 0.7];
  P.clip("giggle", { tags: ["idle", "happy", "shy"], dur: 1800, weight: 0.6, cooldown: 18000, principles: ["timing", "secondary-action", "appeal", "squash-stretch"],
    update(t, r, c, i) { let b = 0; for (const a of GB) b += U.pulse(t, a, a + 0.18); const h = U.hold(t, 0.05, 0.15, 0.85, 1), q = Math.sin(TAU * 12 * t), s = i.side;
      r.x = 1.4 * q * b; r.cores.y = 1.5 * Math.sin(TAU * 12 * t + 1) * b; r.sq = 0.04 * b; r.eye.lid = 0.25 * h + 0.35 * b; r.eye.glow = 0.45 * h; r.eye.gaze = -0.7 * h; r.eye.x = 0.5 * s * h; r.eye.y = 0.3 * h;
      r.turn = 0.3 * s * h; r.top.rot = 0.25 * s * h + 0.12 * q * b; r.bottom.rot = -0.1 * q * b; } });
  P.clip("wiggle-dance", { tags: ["idle", "happy"], dur: 2400, weight: 0.3, cooldown: 40000, principles: ["timing", "arcs", "overlapping", "appeal", "exaggeration"],
    update(t, r) { const e = U.env(t, 0.1, 0.15), b = Math.sin(TAU * 2 * t), bt = Math.abs(b); r.rot = 0.18 * b * e; r.x = 5 * b * e; r.y = -4 * bt * e; r.sq = 0.05 * (bt - 0.5) * e;
      r.top.rot = 0.6 * b * e; r.top.len = 0.3 * e; r.bottom.rot = -0.4 * b * e; r.eye.lid = 0.3 * e; r.eye.glow = 0.5 * e; r.orbit.rot = -0.12 * Math.sin(TAU * 2 * t - 0.6) * e; } });
  const BH = [10, 7, 4];
  P.clip("bounce-bounce", { tags: ["idle", "happy"], dur: 1500, weight: 0.6, cooldown: 18000, principles: ["squash-stretch", "timing", "arcs", "appeal"],
    update(t, r) { let y = 0, sq = 0; for (let k = 0; k < 3; k++) { const u = (t - k / 3) * 3; if (u > 0 && u < 1) { y = -U.arc(U.clamp((u - 0.15) / 0.7, 0, 1), BH[k]); sq = -0.12 * U.pulse(u, 0, 0.18) * (1 - k * 0.25) + 0.1 * U.pulse(u, 0.15, 0.35) - 0.1 * U.pulse(u, 0.82, 1); } }
      r.y = y; r.sq = sq; r.eye.glow = 0.35 * U.pulse(t, 0, 1); r.eye.narrow = -0.25 * U.pulse(t, 0, 1); r.top.rot = 0.15 * U.decay(t, 3, 3); r.cores.y = 1.5 * U.decay(t, 3, 2); } });
  P.clip("content-glow", { tags: ["idle", "content"], dur: 3200, weight: 0.7, cooldown: 20000, calm: true, principles: ["slow-in-out", "appeal", "timing"],
    update(t, r) { const h = U.hold(t, 0.05, 0.25, 0.8, 1); r.eye.lid = 0.5 * h; r.eye.glow = (0.5 - 0.25 * Math.cos(TAU * 2 * t)) * h; r.eye.narrow = -0.1 * h; r.tilt = 0.04 * Math.sin(TAU * t) * h; r.sq = 0.03 * Math.sin(TAU * 2 * t) * h; } });
  P.clip("huff", { tags: ["idle", "grumpy"], dur: 1500, weight: 0.4, cooldown: 30000, principles: ["exaggeration", "timing", "squash-stretch", "anticipation"],
    cues: [[0.38, (c, api) => api.fx("puff", { n: 2, y: c.size.r * 0.3 })]],
    update(t, r, c, i) { const s = i.side, inh = U.hold(t, 0, 0.25, 0.3, 0.4), ex = U.pulse(t, 0.35, 0.55), h = U.hold(t, 0.05, 0.2, 0.8, 1); r.scale = 0.1 * inh - 0.05 * ex; r.sq = 0.08 * inh - 0.15 * ex; r.y = 2 * ex;
      r.eye.lidTilt = -0.5 * s * h; r.eye.narrow = 0.45 * h; r.eye.lid = 0.3 * h; r.top.rot = 0.3 * s * h; r.top.len = -0.3 * h; r.bottom.len = -0.2 * h; r.eye.fire = 0.25 * ex; } });
  P.clip("sparkle-idea", { tags: ["idle", "happy", "curious"], dur: 1800, weight: 0.4, cooldown: 30000, principles: ["anticipation", "exaggeration", "timing", "staging", "follow-through"],
    cues: [[0.22, (c, api) => api.fx("exclaim", { n: 1 })]],
    update(t, r) { const pre = U.hold(t, 0, 0.12, 0.16, 0.22), up = U.hold(t, 0.2, 0.28, 0.7, 0.92); r.eye.narrow = 0.4 * pre - 0.2 * up; r.eye.size = 0.22 * up; r.eye.glow = 0.9 * up; r.top.len = 1.1 * up; r.top.tip = up; r.top.bend = 0.1 * U.decay(U.lag(t, 0.28), 3, 4);
      r.y = -6 * air(t, 0.24, 0.5, 1); r.sq = -0.06 * pre + 0.1 * U.pulse(t, 0.22, 0.35); } });
  P.clip("shy-wave", { tags: ["idle", "shy", "viewer"], dur: 2000, weight: 0.6, cooldown: 24000, principles: ["appeal", "staging", "follow-through", "secondary-action"],
    update(t, r, c, i) { const s = i.side, w = U.hold(t, 0.1, 0.25, 0.7, 0.9); r.bottom.root = -1.1 * s * w; r.bottom.rot = 0.35 * Math.sin(TAU * 4 * U.lag(t, 0.25)) * w; r.bottom.len = 0.2 * w; r.bottom.tip = 0.3 * w;
      r.eye.gaze = -w; r.eye.x = 0.15 * s * w; r.eye.y = 0.5 * U.hold(t, 0.55, 0.65, 0.8, 0.9); r.eye.narrow = -0.2 * w; r.scale = -0.06 * w; r.eye.glow = 0.25 * w; } });
  P.clip("nervous-sweat", { tags: ["idle", "nervous"], dur: 1700, weight: 0.4, cooldown: 26000, principles: ["straight-ahead", "secondary-action", "exaggeration", "timing"],
    cues: [[0.3, (c, api) => api.fx("drop", { n: 1, x: c.size.r * 0.8, y: -c.size.r * 0.7, dir: -0.4 })]],
    update(t, r, c, i) { const e = U.env(t, 0.1, 0.25), k = 22, s0 = 3 + Math.floor(i.seed * 40); r.x = 1.6 * U.noise(t * k, s0) * e; r.rot = 0.04 * U.noise(t * k, s0 + 1) * e;
      r.eye.gaze = -e; r.eye.x = 0.9 * U.noise(t * 6, s0 + 2) * e; r.eye.narrow = 0.2 * e; r.eye.lidTilt = 0.3 * e; r.top.rot = 0.2 * U.noise(t * k * 0.7, s0 + 3) * e; r.scale = -0.05 * e; } });
  P.clip("shiver", { tags: ["idle", "nervous"], dur: 1300, weight: 0.4, cooldown: 26000, principles: ["straight-ahead", "secondary-action", "overlapping", "timing"],
    update(t, r) { const e = U.pulse(t, 0.05, 0.9), a = TAU * 14 * t; r.x = 1.3 * Math.sin(a) * e; r.disc.x = 0.6 * Math.sin(a + 1) * e; r.orbit.x = 1.2 * Math.sin(a + 2) * e; r.top.rot = 0.12 * Math.sin(a + 0.5) * e; r.bottom.rot = 0.12 * Math.sin(a + 2.5) * e;
      r.eye.lid = 0.35 * e; r.eye.narrow = 0.35 * e; r.scale = -0.06 * e; r.sq = -0.05 * e; } });


  P.clip("trip-stumble", { tags: ["idle", "clumsy"], dur: 2200, weight: 0.3, cooldown: 40000, principles: ["exaggeration", "timing", "follow-through", "appeal", "anticipation"],
    update(t, r, c, i) { const s = i.side, lurch = U.keys(t, [[0, 0], [0.08, -0.05], [0.2, 0.45, "out"], [0.32, -0.12, "inOut"], [0.42, 0.05, "inOut"], [0.5, 0, "inOut"]]), fl = U.hold(t, 0.12, 0.18, 0.32, 0.42), look = U.hold(t, 0.48, 0.55, 0.78, 0.9);
      r.tilt = s * lurch; r.x = 10 * s * lurch; r.y = -4 * U.pulse(t, 0.1, 0.3); r.top.rot = 0.8 * Math.sin(TAU * 7 * t) * fl; r.bottom.rot = -0.7 * Math.sin(TAU * 7 * t + 1.3) * fl; r.eye.narrow = -0.25 * fl; r.eye.size = 0.3 * fl;
      r.eye.gaze = -look; r.eye.x = -0.15 * s * look; r.eye.glow = 0.3 * look; r.eye.lid = 0.25 * look; r.sq = -0.05 * U.pulse(t, 0.85, 1); } });
  P.clip("lose-core", { tags: ["idle", "clumsy"], dur: 1800, weight: 0.4, cooldown: 35000, principles: ["secondary-action", "exaggeration", "timing", "arcs", "appeal"],
    update(t, r, c, i) { const s = i.side, f = U.clamp((t - 0.1) / 0.5, 0, 1), up = t > 0.1 && t < 0.6 ? U.arc(f, 1) : 0, land = U.pulse(t, 0.58, 0.72);
      r.core2.y = -26 * up + 2 * land; r.core2.x = t < 0.6 ? 8 * s * Math.sin(Math.PI * f) : 0; r.core2.scale = 0.15 * up;
      r.eye.gaze = -U.hold(t, 0.12, 0.2, 0.62, 0.72); r.eye.y = -0.9 * up; r.eye.narrow = -0.2 * U.hold(t, 0.1, 0.16, 0.6, 0.7); r.eye.size = 0.22 * U.hold(t, 0.1, 0.16, 0.6, 0.7); r.sq = -0.06 * land - 0.05 * U.pulse(t, 0.05, 0.15); r.eye.lid = 0.6 * U.pulse(t, 0.6, 0.75);
      r.top.rot = 0.25 * U.decay(U.lag(t, 0.6), 2, 4); } });
  P.clip("orbit-slip", { tags: ["idle", "clumsy"], dur: 2400, weight: 0.4, cooldown: 35000, principles: ["secondary-action", "follow-through", "timing", "staging"],
    update(t, r, c, i) { const s = i.side, slip = U.keys(t, [[0, 0], [0.1, 0], [0.25, 1, "in"], [0.5, 1], [0.68, -0.1, "out"], [0.78, 0, "inOut"]]), see = U.hold(t, 0.22, 0.3, 0.7, 0.8), push = U.hold(t, 0.42, 0.52, 0.65, 0.78);
      r.orbit.y = 11 * slip; r.orbit.rot = 0.2 * s * slip; r.orbit.spin = 0.25 * slip; r.eye.gaze = -see; r.eye.y = 0.8 * see; r.eye.narrow = -0.4 * U.pulse(t, 0.22, 0.4) + 0.3 * U.hold(t, 0.4, 0.5, 0.65, 0.75);
      r.bottom.rot = 0.6 * s * push; r.bottom.len = 0.3 * push; r.sq = -0.05 * U.pulse(t, 0.24, 0.32) + 0.06 * U.pulse(t, 0.6, 0.75); r.eye.glow = 0.3 * U.pulse(t, 0.7, 1); } });
  P.clip("split-reassemble", { tags: ["idle", "clumsy", "formation"], dur: 2000, weight: 0.3, cooldown: 40000, principles: ["overlapping", "follow-through", "exaggeration", "timing"],
    update(t, r) { const out = U.keys(t, [[0, 0], [0.06, 0.95, "out"], [0.45, 0.85], [0.7, 0, "back"]]), look = U.hold(t, 0.1, 0.18, 0.45, 0.6); r.spread = U.clamp(out, 0, 1.5); r.eye.narrow = -0.2 * U.hold(t, 0.04, 0.1, 0.5, 0.7); r.eye.size = 0.25 * U.hold(t, 0.04, 0.1, 0.5, 0.7); r.eye.gaze = -look;
      r.eye.x = 0.8 * Math.sin(TAU * 1.5 * U.clamp((t - 0.12) / 0.4, 0, 1)) * look; r.orbit.rot = 0.3 * U.decay(U.lag(t, 0.68), 2, 4); r.top.rot = 0.4 * U.decay(U.lag(t, 0.7), 2.5, 4); r.bottom.rot = -0.3 * U.decay(U.lag(t, 0.72), 2.5, 4); r.eye.lid = U.pulse(t, 0.82, 0.95); } });
  P.clip("coin-settle", { tags: ["idle", "clumsy"], dur: 2400, weight: 0.4, cooldown: 30000, principles: ["arcs", "timing", "follow-through", "solid-drawing"],
    update(t, r, c, i) { const A = U.env(t, 0.08, 0.12) * Math.pow(1 - t, 1.2), ph = TAU * (2 * t + 3 * t * t), s = i.side; r.tilt = 0.22 * Math.sin(ph) * A * s; r.y = -2.2 * Math.abs(Math.cos(ph)) * A; r.orbit.spin = 0.2 * Math.cos(ph) * A;
      r.eye.gaze = -A; r.eye.x = 0.55 * Math.sin(ph + 0.6) * A * s; r.eye.y = 0.25 * Math.cos(ph + 0.6) * A; r.eye.narrow = -0.25 * A; r.sq = -0.08 * U.pulse(t, 0.86, 1); r.eye.lid = 0.7 * U.pulse(t, 0.88, 1); } });
  P.clip("sneeze", { tags: ["idle", "clumsy"], dur: 1900, weight: 0.3, cooldown: 45000, principles: ["anticipation", "exaggeration", "timing", "squash-stretch", "follow-through"],
    cues: [[0.6, (c, api, i) => api.fx("puff", { n: 3, x: i.side * c.size.r * 1.15, y: c.size.r * 0.1 })]],
    update(t, r, c, i) { const s = i.side, build = t < 0.6 ? U.keys(t, [[0, 0], [0.2, 0.5, "inOut"], [0.3, 0.35], [0.5, 1, "inOut"]]) : 0, ach = U.pulse(t, 0.58, 0.7), rec = U.decay(U.lag(t, 0.68), 2, 3);
      r.sq = 0.16 * build - 0.3 * ach + 0.05 * rec; r.y = -4 * build + 3 * ach; r.x = 6 * s * ach; r.tilt = 0.2 * s * ach - 0.06 * s * build; r.eye.lid = 0.6 * build + 0.9 * ach; r.eye.narrow = 0.4 * build;
      r.top.len = 0.4 * build; r.top.rot = 0.5 * s * rec; r.bottom.rot = -0.3 * s * rec; r.spread = 0.18 * ach; r.eye.glow = 0.3 * build; } });
  const HIC = [0.12, 0.45, 0.78];
  P.clip("hiccup", { tags: ["idle", "clumsy"], dur: 2200, weight: 0.35, cooldown: 35000, principles: ["timing", "squash-stretch", "exaggeration", "appeal"],
    update(t, r) { let j = 0; for (const a of HIC) j += U.pulse(t, a, a + 0.08); const shy = U.hold(t, 0.2, 0.3, 0.88, 1); r.y = -5 * j; r.sq = 0.12 * j; r.eye.narrow = -0.2 * j; r.eye.size = 0.22 * j; r.top.rot = 0.2 * j; r.bottom.len = 0.2 * j;
      r.eye.gaze = -0.6 * shy; r.eye.y = 0.35 * shy; r.eye.lid = 0.2 * shy; } });


  P.clip("bored-sway", { tags: ["bored"], dur: 4000, weight: 1, cooldown: 15000, calm: true, principles: ["slow-in-out", "timing", "arcs", "follow-through"],
    update(t, r) { const e = U.env(t, 0.15, 0.25), w = Math.sin(TAU * 1.5 * t); r.tilt = 0.12 * w * e; r.eye.droop = 0.5 * e; r.eye.lid = 0.35 * e; r.eye.glow = -0.25 * e; r.top.rot = -0.2 * Math.sin(TAU * 1.5 * t - 0.7) * e; r.top.len = -0.3 * e; r.bottom.len = -0.2 * e; } });
  P.clip("melt-puddle", { tags: ["bored", "formation"], dur: 3600, weight: 0.6, cooldown: 30000, principles: ["squash-stretch", "slow-in-out", "exaggeration", "appeal"],
    update(t, r) { const h = U.keys(t, [[0, 0], [0.3, 1, "inOut"], [0.65, 1], [0.82, -0.15, "out"], [0.92, 0.04, "inOut"], [1, 0, "inOut"]]), m = U.hold(t, 0.12, 0.32, 0.6, 0.78);
      r.sq = -0.38 * h; r.y = 9 * U.clamp(h, 0, 1); r.orbit.melt = 0.65 * m; r.band.melt = 0.6 * m; r.disc.drop = -0.25 * m; r.eye.droop = 0.4 * m; r.eye.gaze = -m; r.eye.y = -0.5 * m; r.eye.lid = 0.3 * m; r.poles.len = -0.6 * m; r.poles.melt = 0.7 * m; } });
  P.clip("doze-nod", { tags: ["bored"], dur: 3000, weight: 0.8, cooldown: 20000, principles: ["timing", "anticipation", "exaggeration", "appeal"],
    update(t, r) { const nod = U.keys(t, [[0, 0], [0.5, 1, "in"], [0.55, 1], [0.6, 0, "out"]]), jerk = U.pulse(t, 0.55, 0.68); r.eye.lid = 0.85 * nod + U.pulse(t, 0.8, 0.92); r.eye.droop = 0.5 * nod; r.y = 4 * nod - 5 * jerk; r.tilt = 0.08 * nod;
      r.sq = -0.08 * nod + 0.15 * jerk; r.eye.narrow = -0.2 * jerk; r.eye.size = 0.25 * jerk; r.top.rot = 0.3 * nod - 0.2 * U.decay(U.lag(t, 0.55), 3, 4); r.eye.glow = -0.3 * nod + 0.3 * jerk; } });
  P.clip("slow-turn", { tags: ["bored"], dur: 3600, weight: 0.6, cooldown: 30000, principles: ["solid-drawing", "slow-in-out", "timing"],
    update(t, r, c, i) { r.turn = t < 1 ? i.side * TAU * E.sine(U.clamp((t - 0.08) / 0.84, 0, 1)) : 0; const h = U.hold(t, 0, 0.1, 0.9, 1); r.eye.lid = 0.35 * h; r.eye.droop = 0.2 * h; r.y = -1.5 * Math.sin(TAU * 2 * t) * h; r.top.rot = 0.1 * Math.sin(TAU * 3 * t) * h; } });
  P.clip("deflate", { tags: ["bored"], dur: 3200, weight: 0.7, cooldown: 25000, principles: ["slow-in-out", "squash-stretch", "timing", "appeal"],
    update(t, r) { const down = U.keys(t, [[0, 0], [0.3, 1, "inOut"], [0.55, 1], [0.65, 0.66, "out"], [0.72, 0.66], [0.8, 0.33, "out"], [0.87, 0.33], [0.95, -0.05, "out"], [1, 0, "inOut"]]), pump = U.pulse(t, 0.55, 0.65) + U.pulse(t, 0.7, 0.8) + U.pulse(t, 0.85, 0.95);
      r.scale = -0.1 * down; r.y = 4 * down; r.sq = -0.08 * down + 0.06 * pump; r.eye.droop = 0.45 * down; r.eye.lid = 0.3 * down; r.eye.glow = -0.3 * down + 0.2 * pump; r.top.len = -0.4 * down; r.top.rot = 0.3 * down; r.bottom.len = -0.3 * down; } });


  P.clip("wake-startle", { tags: ["wake"], dur: 1600, cooldown: 0, principles: ["timing", "exaggeration", "anticipation", "staging"],
    update(t, r) { const jolt = U.pulse(t, 0, 0.18), look = U.hold(t, 0.15, 0.22, 0.75, 0.9); r.eye.lid = 0.9 * (t < 0.08 ? 1 - t / 0.08 : 0); r.eye.narrow = -0.25 * U.hold(t, 0.03, 0.08, 0.3, 0.5); r.eye.size = 0.3 * U.hold(t, 0.03, 0.08, 0.3, 0.5); r.y = -9 * jolt; r.sq = 0.2 * jolt - 0.08 * U.pulse(t, 0.16, 0.28);
      r.eye.gaze = -look; r.eye.x = U.keys(t, [[0, 0], [0.22, 0.9, "out"], [0.4, 0.9], [0.48, -0.9, "out"], [0.66, -0.9], [0.8, 0, "inOut"]]) * look; r.top.len = 0.6 * jolt; r.top.rot = 0.3 * U.decay(U.lag(t, 0.15), 3, 4); r.eye.glow = 0.4 * U.pulse(t, 0.1, 0.9); } });
  P.clip("sleep-curl", { tags: ["sleep"], dur: 1900, cooldown: 0, principles: ["slow-in-out", "squash-stretch", "timing", "appeal"],
    update(t, r, c, i) { const h = U.hold(t, 0.08, 0.4, 0.75, 1), wig = U.decay(U.lag(t, 0.4), 2, 3); r.scale = -0.1 * h; r.sq = -0.1 * h + 0.04 * wig; r.poles.len = -0.6 * h; r.top.rot = 0.4 * i.side * h; r.bottom.rot = 0.3 * i.side * h;
      r.eye.lid = 0.7 * h; r.eye.droop = 0.4 * h; r.eye.glow = -0.3 * h; r.turn = 0.3 * i.side * h; r.x = 1.5 * wig; } });
  P.clip("greet-bow", { tags: ["greet"], dur: 1700, cooldown: 4000, principles: ["appeal", "staging", "follow-through", "slow-in-out", "anticipation"],
    update(t, r, c, i) { const s = i.side, bow = U.keys(t, [[0, 0], [0.12, -0.05, "inOut"], [0.38, 0.3, "inOut"], [0.55, 0.3], [0.8, 0, "back"]]), arms = U.hold(t, 0.1, 0.3, 0.75, 0.95);
      r.tilt = s * bow; r.y = 6 * bow; r.top.root = -1.571 * arms; r.bottom.root = -1.571 * arms; r.poles.len = 0.25 * arms; r.top.rot = 0.2 * U.decay(U.lag(t, 0.55), 2, 4); r.eye.lid = 0.45 * U.hold(t, 0.3, 0.4, 0.55, 0.65); r.eye.glow = 0.45 * arms; r.eye.narrow = -0.3 * U.pulse(t, 0.6, 1); } });
})();
} catch (e) { console.warn("companion pack idle", e); } finally { if (window.GSPet) GSPet.debug.setPack(""); }

try { if (window.GSPet) GSPet.debug.setPack("interact");


(function packInteract() {
  const P = typeof GSPet === "object" ? GSPet : null; if (!P) return;
  const E = P.ease, U = P.util, TAU = Math.PI * 2;
  const sgn = v => v < 0 ? -1 : 1;
  const toward = c => sgn(c.focus.dx || -1);
  const air = (t, a, b, h) => t > a && t < b ? U.arc((t - a) / (b - a), h) : 0;
  const edgeGap = c => c.view.w - c.safe.right - c.body.home.x;
  const k72 = c => c.small ? 1 / 0.72 : 1;




  const SPL = [[-1.05, 0.35, 0.95, 0.42, 0.5, "out"], [0.55, -0.6, 0.8, 0.36, -0.7, "in"], [0.8, 0.75, 0.55, 0.3, 0.25, "heat:0.85"]];
  P.form("splats", { place(j, n, t) { const k = j % 3, m = Math.floor(j / 3), M = Math.ceil(n / 3), S = SPL[k], u = (m + 0.5) / M, rr = Math.sqrt(u), w = m * 2.39996 + k, br = 1 + 0.06 * Math.sin(t * 2.2 + k * 2);
    const ex = S[2] * rr * Math.cos(w) * br, ey = S[3] * rr * Math.sin(w) * br, ca = Math.cos(S[4]), sa = Math.sin(S[4]); return [S[0] + ex * ca - ey * sa, S[1] + ex * sa + ey * ca, (0.3 + 0.12 * Math.exp(-3 * u)) * Math.sqrt(62 / Math.max(20, n)), S[5]]; } });
  P.form("packet", { place(j, n, t) { const x = -2.1 + 4.2 * (j + 0.5) / n, c0 = Math.sin(t * 1.4), env = Math.exp(-((x - c0) * (x - c0)) / 0.405), y = -env * Math.sin(TAU * x / 0.7 - t * 6); return [x, y, 0.09 + 0.12 * env, y < 0 ? "out" : "in"]; } });
  const HK = []; for (let k = 0; k <= 20; k++) HK.push("heat:" + (k / 20).toFixed(2));
  P.form("spectrum", { place(j, n, t) { const B = 7, b = j % B, k = Math.floor(j / B), K = Math.ceil(n / B), q = (b + 0.5) / 2.2, hg = 2.4 * q * Math.exp(1 - q) * (0.93 + 0.07 * Math.sin(t * 2.6 + b * 0.9)), f = (k + 0.5) / K;
    return [-1.9 + 3.8 * (b + 0.5) / B, 1.2 - hg * f, 0.17, HK[Math.round(20 * U.clamp(0.25 + 0.75 * f * hg / 2.4, 0, 1))]]; } });
  P.form("contour", { place(j, n, t) { const a0 = n * 0.2, a1 = n * 0.5, ring = j < a0 ? 0 : j < a1 ? 1 : 2, m = ring === 0 ? j : ring === 1 ? j - a0 : j - a1, M = ring === 0 ? a0 : ring === 1 ? a1 - a0 : n - a1;
    const R = [[0.45, 0.25], [0.95, 0.55], [1.6, 0.92]][ring], a = TAU * (m + 0.5) / M + t * 0.5 * (ring === 1 ? -1 : 1), x = R[0] * Math.cos(a), y = R[1] * Math.sin(a), c = Math.cos(0.5), s = Math.sin(0.5);
    return [x * c - y * s, x * s + y * c, [0.16, 0.13, 0.12][ring], ["core1", "out", "in"][ring]]; } });
  P.form("vortex", { place(j, n, t) { const arm = j % 2, f = (Math.floor(j / 2) + 0.5) / Math.ceil(n / 2), rad = 0.15 + 1.75 * f, a = arm * Math.PI + 4.2 * f - t * 1.8; return [rad * Math.cos(a), 0.85 * rad * Math.sin(a), 0.2 - 0.09 * f, f < 0.5 ? "out" : "in"]; } });


  P.clip("read-line-track", { tags: ["read", "eye"], layer: "eye", dur: 3000, weight: 1, cooldown: 9000, principles: ["pose-to-pose", "timing", "staging", "slow-in-out"],
    update(t, r, c) { const s = toward(c), h = U.hold(t, 0, 0.06, 0.92, 1), u = (t * 2) % 1, k = Math.floor(t * 2), sw = u < 0.8 ? 2 * E.sine(u / 0.8) - 1 : 1 - 2 * E.out((u - 0.8) / 0.2);
      r.eye.gaze = -h; r.eye.x = (0.62 * s + 0.36 * sw) * h; r.eye.y = (0.1 + 0.22 * k + 0.22 * E.out(U.clamp((u - 0.8) / 0.2, 0, 1))) * h; r.eye.narrow = 0.25 * h; r.eye.lid = 0.12 * h; } });
  P.clip("read-hmm", { tags: ["read", "curious"], dur: 2600, weight: 0.8, cooldown: 15000, calm: true, principles: ["staging", "timing", "pose-to-pose", "secondary-action"],
    update(t, r, c) { const s = toward(c), h = U.hold(t, 0.08, 0.25, 0.75, 0.95), sc = U.hold(t, 0.3, 0.38, 0.6, 0.7), nd = U.hold(t, 0.72, 0.78, 0.85, 0.95); r.eye.narrow = 0.5 * h; r.eye.lidTilt = 0.45 * s * h; r.eye.lid = 0.25 * h; r.x = -4 * s * h;
      r.tilt = -0.07 * s * h + 0.05 * Math.sin(TAU * 4 * t) * nd; r.top.root = 0.7 * s * sc; r.top.rot = 0.18 * Math.sin(TAU * 6 * t) * sc; r.top.bend = 0.4 * sc; } });
  P.clip("read-wow", { tags: ["read", "happy"], dur: 1600, weight: 0.5, cooldown: 25000, principles: ["anticipation", "exaggeration", "timing", "follow-through"],
    cues: [[0.12, (c, api) => api.fx("exclaim", { n: 1 })]],
    update(t, r, c) { const s = toward(c), back = U.keys(t, [[0, 0], [0.06, 0.05], [0.16, -1, "out"], [0.4, -0.8], [0.6, 0.7, "inOut"], [0.85, 0.6], [1, 0, "inOut"]]), wide = U.hold(t, 0.08, 0.14, 0.5, 0.7);
      r.x = 6 * s * back; r.tilt = 0.12 * s * back; r.sq = 0.14 * U.pulse(t, 0.08, 0.22); r.eye.narrow = -0.25 * wide + 0.25 * U.hold(t, 0.6, 0.7, 0.85, 1); r.eye.size = 0.32 * wide; r.eye.glow = 0.6 * U.pulse(t, 0.1, 1);
      r.top.len = 0.6 * wide; r.top.rot = 0.3 * U.decay(U.lag(t, 0.1), 3, 4); } });
  P.clip("trace-line", { tags: ["read"], dur: 2600, weight: 0.8, cooldown: 14000, principles: ["staging", "secondary-action", "follow-through", "slow-in-out"],
    when: c => !!c.read,
    update(t, r, c) { const s = toward(c), h = U.hold(t, 0.08, 0.25, 0.8, 0.96); r.top.aim = 0.9 * h; r.top.tip = (0.5 + 0.3 * Math.sin(TAU * 4 * t)) * h; r.top.bend = 0.15 * Math.sin(TAU * 2 * t) * h; r.x = 5 * s * h; r.tilt = 0.08 * s * h;
      r.eye.narrow = 0.35 * h; r.eye.glow = 0.25 * h; r.bottom.rot = -0.15 * s * h; } });
  P.clip("chapter-perk", { tags: ["read", "happy"], dur: 1300, weight: 2, cooldown: 20000, principles: ["anticipation", "staging", "appeal", "squash-stretch"],
    when: c => !!(c.read && c.read.kind && c.read.kind[0] === "h"),
    update(t, r) { const pre = U.pulse(t, 0, 0.15), up = U.hold(t, 0.12, 0.25, 0.6, 0.9); r.sq = -0.08 * pre + 0.12 * up; r.y = 2 * pre - 7 * air(t, 0.14, 0.45, 1); r.poles.len = 0.55 * up; r.top.tip = 0.5 * up; r.bottom.tip = 0.3 * up;
      r.eye.glow = 0.6 * up; r.eye.narrow = -0.25 * up; r.eye.size = 0.15 * up; r.top.rot = 0.2 * U.decay(U.lag(t, 0.3), 2, 4); } });
  P.clip("caption-peer", { tags: ["read", "curious"], dur: 2000, weight: 2, cooldown: 16000, principles: ["staging", "slow-in-out", "exaggeration", "timing"],
    when: c => !!(c.read && (c.read.kind === "figcaption" || c.read.kind === "figure")),
    update(t, r, c) { const s = toward(c), h = U.hold(t, 0.08, 0.3, 0.75, 0.95); r.eye.gaze = -h; r.eye.x = 0.5 * s * h; r.eye.y = 0.75 * h; r.eye.size = 0.16 * h; r.eye.narrow = 0.4 * h; r.tilt = 0.1 * s * h; r.y = 3 * h; r.sq = -0.05 * h; r.top.rot = 0.2 * s * h; } });


  P.clip("scroll-hold-on", { tags: ["scroll"], dur: 1300, cooldown: 4000, principles: ["exaggeration", "squash-stretch", "straight-ahead", "secondary-action"],
    update(t, r, c, i) { const h = U.hold(t, 0, 0.1, 0.65, 1), s0 = 5 + Math.floor(i.seed * 30); r.sq = -0.15 * h; r.eye.lid = 0.75 * h; r.eye.narrow = 0.55 * h; r.top.root = -1.571 * h; r.bottom.root = -1.571 * h; r.poles.bend = 0.7 * h; r.poles.len = -0.2 * h;
      r.x = 1.5 * U.noise(t * 30, s0) * h; r.rot = 0.04 * U.noise(t * 30, s0 + 1) * h; } });
  P.clip("scroll-wheee", { tags: ["scroll", "happy"], dur: 1400, cooldown: 4000, principles: ["exaggeration", "appeal", "secondary-action", "solid-drawing"],
    update(t, r) { const h = U.hold(t, 0.05, 0.2, 0.7, 1); r.orbit.spin = -1.06 * h; r.lower.spin = t < 1 ? TAU * 2 * E.inOut(U.clamp(t / 0.9, 0, 1)) : 0; r.eye.lid = 0.3 * h; r.eye.glow = 0.6 * h; r.eye.narrow = -0.4 * h;
      r.top.rot = 0.25 * Math.sin(TAU * 8 * t) * h; r.bottom.rot = 0.25 * Math.sin(TAU * 8 * t + 1) * h; } });
  const LAGK = [[0, 0], [0.15, 1, "out"], [0.45, 1], [0.62, -0.35, "inOut"], [0.78, 0.12, "inOut"], [0.9, 0, "inOut"]], lagf = t => U.keys(U.clamp(t, 0, 1), LAGK);
  P.clip("scroll-lag", { tags: ["scroll"], dur: 1300, cooldown: 4000, principles: ["follow-through", "overlapping", "timing", "secondary-action"],
    update(t, r, c) { const d = c.scroll.vy < 0 ? -1 : 1; r.cores.y = 5 * d * lagf(t - 0.04); r.orbit.y = 3.5 * d * lagf(t - 0.02); r.lower.y = 2.5 * d * lagf(t); r.poles.len = 0.3 * lagf(t - 0.06); r.top.bend = 0.5 * d * lagf(t - 0.06);
      r.sq = 0.08 * lagf(t); r.eye.narrow = 0.3 * lagf(t); r.eye.lid = 0.15 * lagf(t); } });


  P.clip("notice-peekaboo", { tags: ["notice"], dur: 1400, cooldown: 6000, principles: ["anticipation", "timing", "appeal", "squash-stretch"],
    update(t, r, c) { const s = toward(c), hide = U.hold(t, 0.04, 0.1, 0.4, 0.46), pop = U.hold(t, 0.44, 0.5, 0.75, 0.95); r.eye.lid = 0.95 * hide; r.sq = -0.1 * hide + 0.12 * U.pulse(t, 0.44, 0.58); r.scale = -0.06 * hide;
      r.eye.narrow = -0.25 * pop; r.eye.size = 0.25 * pop; r.eye.glow = 0.6 * pop; r.y = -6 * air(t, 0.45, 0.7, 1); r.top.len = 0.4 * pop; r.top.rot = 0.3 * s * U.decay(U.lag(t, 0.45), 2, 4); r.x = 2 * s * pop; } });
  P.clip("notice-hop", { tags: ["notice", "happy"], dur: 1200, cooldown: 6000, principles: ["anticipation", "arcs", "appeal", "follow-through"],
    update(t, r, c) { const s = toward(c), pre = U.pulse(t, 0, 0.15), w = U.hold(t, 0.35, 0.45, 0.8, 0.95); r.sq = -0.1 * pre + 0.1 * U.pulse(t, 0.12, 0.3) - 0.1 * U.pulse(t, 0.5, 0.62); r.y = 2 * pre - 8 * air(t, 0.14, 0.52, 1); r.x = 7 * s * U.hold(t, 0.14, 0.5, 0.75, 1);
      r.top.root = 0.9 * s * w; r.top.rot = 0.45 * Math.sin(TAU * 3 * U.lag(t, 0.45)) * w; r.top.len = 0.3 * w; r.top.tip = 0.5 * w; r.eye.narrow = -0.35 * w; r.eye.glow = 0.4 * w; } });
  P.clip("notice-shy", { tags: ["notice", "shy"], dur: 1900, cooldown: 6000, calm: true, principles: ["staging", "appeal", "timing", "solid-drawing"],
    update(t, r, c) { const s = toward(c), sh = U.hold(t, 0.05, 0.2, 0.5, 0.62), pk = U.hold(t, 0.55, 0.65, 0.82, 0.95); r.scale = -0.1 * sh - 0.04 * pk; r.eye.gaze = -(sh + pk); r.eye.x = -0.8 * s * sh + 0.6 * s * pk; r.eye.y = 0.4 * sh; r.turn = -0.4 * s * sh;
      r.eye.lid = 0.3 * sh + 0.2 * pk; r.eye.glow = 0.4 * pk; r.top.rot = -0.3 * s * sh; r.tilt = -0.05 * s * sh + 0.04 * s * pk; } });


  P.clip("boop-giggle", { tags: ["boop", "happy"], dur: 1100, cooldown: 0, principles: ["appeal", "squash-stretch", "timing", "secondary-action"],
    cues: [[0.25, (c, api) => api.fx("heart", { n: 1, x: c.size.r * 0.4 })]],
    update(t, r) { const fl = U.pulse(t, 0, 0.16), g = U.hold(t, 0.14, 0.24, 0.8, 1), q = Math.sin(TAU * 8 * t); r.eye.narrow = 0.6 * fl; r.eye.lid = 0.4 * fl + 0.45 * g; r.eye.glow = 0.5 * g; r.cores.y = 1.6 * q * g; r.y = -1.4 * Math.abs(q) * g;
      r.sq = -0.08 * fl + 0.03 * q * g; r.top.rot = 0.15 * Math.sin(TAU * 8 * t + 1) * g; } });
  P.clip("boop-offended", { tags: ["boop", "grumpy"], dur: 1700, weight: 0.7, cooldown: 0, principles: ["timing", "exaggeration", "appeal", "staging", "solid-drawing"],
    update(t, r, c, i) { const s = i.side, fl = U.pulse(t, 0, 0.15), away = U.hold(t, 0.15, 0.3, 0.6, 0.75), back = U.hold(t, 0.6, 0.7, 0.85, 1); r.eye.narrow = 0.6 * fl + 0.45 * away; r.eye.lid = 0.3 * fl + 0.35 * away; r.eye.lidTilt = -0.5 * s * away;
      r.turn = 0.7 * s * away; r.eye.gaze = -(away + back); r.eye.x = 0.8 * s * away - 0.4 * s * back; r.top.rot = 0.4 * s * away; r.top.len = -0.25 * away; r.scale = 0.06 * away; r.eye.glow = 0.4 * back; r.sq = -0.08 * fl; } });
  P.clip("boop-spin", { tags: ["boop", "happy"], dur: 1100, weight: 0.7, cooldown: 0, principles: ["follow-through", "solid-drawing", "exaggeration", "timing"],
    update(t, r, c, i) { const s = i.side, e = t < 1 ? E.out(U.clamp((t - 0.06) / 0.8, 0, 1)) : 0; r.turn = s * TAU * e; r.eye.spin = -0.6 * s * U.decay(U.lag(t, 0.1), 1, 3); r.spread = 0.15 * U.pulse(t, 0.05, 0.5); r.sq = -0.1 * U.pulse(t, 0, 0.1);
      r.eye.narrow = -0.2 * U.pulse(t, 0.05, 0.6); r.eye.size = 0.18 * U.pulse(t, 0.05, 0.6); r.eye.glow = 0.4 * U.pulse(t, 0.1, 1); r.y = -4 * U.pulse(t, 0.06, 0.5); } });
  P.clip("boop-heart", { tags: ["boop", "happy", "formation"], dur: 1800, weight: 0.35, cooldown: 30000, form: "heart", principles: ["appeal", "staging", "overlapping", "slow-in-out"],
    update(t, r) { const h = U.hold(t, 0.03, 0.3, 0.55, 0.95); r.morph = h; r.eye.glow = 0.4 * h; } });
  P.clip("squish-giggle", { tags: ["squish", "happy"], dur: 500, cooldown: 0, fadeIn: 40, principles: ["squash-stretch", "appeal", "secondary-action", "timing"],
    update(t, r) { const h = U.hold(t, 0, 0.15, 0.8, 1), q = Math.sin(TAU * 5 * t); r.eye.lid = 0.6 * h; r.eye.narrow = -0.15 * h; r.eye.glow = 0.4 * h; r.cores.x = 1.4 * q * h; r.top.rot = 0.2 * q * h; r.bottom.rot = -0.15 * q * h; } });
  P.clip("squish-surprise", { tags: ["squish"], dur: 500, cooldown: 0, fadeIn: 40, principles: ["exaggeration", "timing", "squash-stretch"],
    update(t, r) { const h = U.hold(t, 0, 0.12, 0.8, 1); r.eye.narrow = -0.25 * h; r.eye.size = 0.32 * h; r.poles.len = 0.75 * h; r.spread = 0.08 * h; r.eye.glow = 0.3 * h; r.top.rot = 0.15 * U.decay(t, 4, 4); } });
  P.clip("push-strain", { tags: ["push-off"], loop: true, dur: 900, cooldown: 0, principles: ["exaggeration", "staging", "secondary-action", "timing"],
    cues: [[0.5, (c, api) => api.fx("drop", { n: 1, x: -c.size.r * 0.8, y: -c.size.r * 0.7, dir: -2.6 })]],
    update(t, r) { const a = TAU * t; r.eye.fire = 0.7; r.eye.narrow = 0.75; r.eye.lidTilt = 0.35; r.eye.glow = 0.5 + 0.2 * Math.sin(a * 2); r.top.aim = 0.85; r.bottom.aim = 0.6;
      r.top.len = 0.2 * Math.sin(a * 2); r.bottom.len = 0.2 * Math.sin(a * 2 + 1.5); r.x = 0.8 * Math.sin(a * 6); r.sq = 0.04 * Math.sin(a * 2); } });
  P.clip("push-wiggle", { tags: ["push-off"], loop: true, dur: 600, cooldown: 0, principles: ["straight-ahead", "overlapping", "timing", "exaggeration"],
    update(t, r) { const a = TAU * t; r.rot = 0.12 * Math.sin(a * 2); r.x = 3 * Math.sin(a * 2 + 0.5); r.eye.gaze = -1; r.eye.x = 0.9 * Math.sin(a * 2); r.eye.narrow = 0.5; r.eye.fire = 0.3;
      r.top.rot = -0.4 * Math.sin(a * 2 + 1); r.bottom.rot = 0.4 * Math.sin(a * 2 + 2); } });
  P.clip("pop-shake", { tags: ["pop"], dur: 900, cooldown: 0, principles: ["follow-through", "secondary-action", "exaggeration", "overlapping"],
    update(t, r) { r.rot = 0.3 * U.decay(t, 6, 3); r.x = 2.2 * U.decay(t, 6, 3.5); r.spread = 0.14 * U.pulse(t, 0, 0.5); r.top.rot = -0.6 * U.decay(U.lag(t, 0.05), 6, 3); r.bottom.rot = 0.5 * U.decay(U.lag(t, 0.08), 6, 3);
      r.orbit.rot = -0.15 * U.decay(U.lag(t, 0.1), 6, 3); r.eye.lid = 0.5 * U.pulse(t, 0, 0.3) + U.pulse(t, 0.78, 0.94); } });
  P.clip("relief-flop", { tags: ["relief"], dur: 1300, cooldown: 0, principles: ["squash-stretch", "timing", "appeal", "slow-in-out"],
    update(t, r) { const f = U.hold(t, 0.02, 0.2, 0.55, 0.8); r.sq = -0.26 * f + 0.08 * U.pulse(t, 0.75, 0.92); r.y = 4 * f; r.eye.lid = 0.6 * f; r.eye.droop = 0.3 * f; r.eye.glow = 0.35 * f; r.poles.len = -0.4 * f; r.top.rot = 0.4 * f; r.lower.open = 0.2 * f; } });


  P.clip("grab-flail", { tags: ["grab"], loop: true, dur: 700, cooldown: 0, principles: ["exaggeration", "overlapping", "secondary-action", "timing"],
    update(t, r) { const a = TAU * t; r.top.rot = 0.9 * Math.sin(a * 3); r.bottom.rot = 0.8 * Math.sin(a * 3 + 2); r.top.len = 0.3 + 0.2 * Math.sin(a * 2); r.bottom.len = 0.3 + 0.2 * Math.sin(a * 2 + 1);
      r.eye.narrow = -0.25; r.eye.size = 0.25; r.eye.fire = 0.3; r.eye.gaze = -0.5; r.eye.y = 0.6; r.eye.x = 0.3 * Math.sin(a * 2); } });
  P.clip("grab-resigned", { tags: ["grab"], loop: true, dur: 1600, cooldown: 0, principles: ["timing", "appeal", "secondary-action", "slow-in-out"],
    update(t, r) { const a = TAU * t; r.eye.lid = 0.5; r.eye.droop = 0.4; r.eye.gaze = -0.8; r.eye.y = 0.7; r.eye.glow = -0.2; r.eye.lidTilt = 0.3; r.rot = 0.05 * Math.sin(a);
      r.top.rot = 0.12 * Math.sin(a + 1); r.bottom.rot = 0.15 * Math.sin(a + 0.5); r.poles.len = -0.25; } });
  P.clip("throw-wheee", { tags: ["throw", "happy"], dur: 1200, cooldown: 0, principles: ["exaggeration", "appeal", "follow-through", "secondary-action"],
    update(t, r) { const h = U.hold(t, 0.03, 0.15, 0.7, 1); r.top.root = -0.55 * h; r.bottom.root = -2.6 * h; r.poles.len = 0.5 * h; r.poles.tip = 0.5 * h; r.eye.narrow = -0.25 * h; r.eye.size = 0.2 * h; r.eye.glow = 0.6 * h; r.eye.lid = 0.25 * h;
      r.top.rot = 0.2 * Math.sin(TAU * 4 * t) * h; r.bottom.rot = 0.2 * Math.sin(TAU * 4 * t + 1.5) * h; } });
  P.clip("throw-curl", { tags: ["throw"], dur: 1200, cooldown: 0, principles: ["anticipation", "squash-stretch", "solid-drawing", "timing"],
    update(t, r) { const h = U.hold(t, 0.03, 0.15, 0.7, 1); r.scale = -0.14 * h; r.poles.len = -0.75 * h; r.eye.lid = 0.85 * h; r.eye.narrow = 0.6 * h; r.lower.open = -0.3 * h; r.orbit.spin = 0.4 * h; r.eye.fire = 0.2 * h; } });


  P.clip("stir-tickle", { tags: ["stirred"], layer: "over", dur: 900, cooldown: 3000, principles: ["secondary-action", "appeal", "timing"],
    update(t, r) { const h = U.pulse(t, 0, 1), q = Math.sin(TAU * 9 * t); r.eye.lid = 0.4 * h; r.eye.narrow = -0.2 * h; r.eye.glow = 0.35 * h; r.x = 0.9 * q * h; r.cores.x = 1.2 * Math.sin(TAU * 9 * t + 1) * h; } });
  P.clip("dodge-duck", { tags: ["dodge"], dur: 800, cooldown: 1500, principles: ["anticipation", "squash-stretch", "timing", "follow-through"],
    update(t, r) { const d = U.hold(t, 0.02, 0.15, 0.5, 0.8); r.sq = -0.22 * d + 0.08 * U.pulse(t, 0.7, 0.9); r.y = 7 * d; r.eye.lid = 0.85 * d; r.eye.narrow = 0.4 * d; r.top.root = -1.571 * d; r.bottom.root = -1.571 * d; r.poles.bend = -0.6 * d; r.scale = -0.06 * d; } });


  P.clip("slider-shove", { tags: ["slider"], loop: true, dur: 600, cooldown: 0, principles: ["squash-stretch", "timing", "exaggeration", "secondary-action"],
    update(t, r, c) { const d = c.slider ? c.slider.dir : 1, p = Math.pow(Math.max(0, Math.sin(TAU * t)), 2); r.x = 3 * d * p; r.sq = -0.1 * p; r.sqa = Math.PI / 2; r.tilt = 0.12 * d; r.top.aim = 0.6; r.top.len = 0.2;
      r.eye.fire = 0.35; r.eye.narrow = 0.5; r.eye.lidTilt = 0.3 * d; r.bottom.rot = -0.25 * d * p; } });
  P.clip("slider-ride", { tags: ["slider", "happy"], loop: true, dur: 1400, cooldown: 0, principles: ["arcs", "secondary-action", "appeal", "overlapping"],
    update(t, r, c) { const d = c.slider ? c.slider.dir : 1, a = TAU * t; r.tilt = 0.1 * d + 0.08 * Math.sin(a); r.top.root = -1.571; r.bottom.root = -1.571; r.top.rot = -0.2 * Math.sin(a); r.bottom.rot = -0.2 * Math.sin(a); r.poles.len = 0.2;
      r.eye.glow = 0.5; r.eye.narrow = -0.25; r.eye.lid = 0.2; r.y = -1.5 * Math.sin(a * 2); } });
  P.clip("slider-bow", { tags: ["slider-done", "proud"], dur: 1400, cooldown: 0, principles: ["staging", "appeal", "follow-through", "slow-in-out"],
    update(t, r, c, i) { const d = c.slider ? c.slider.dir : i.side, bow = U.keys(t, [[0, 0], [0.15, -0.06, "inOut"], [0.4, 0.32, "inOut"], [0.58, 0.32], [0.82, 0, "back"]]), arm = U.hold(t, 0.12, 0.35, 0.6, 0.85);
      r.tilt = d * bow; r.y = 5 * bow; r.top.root = 1.2 * d * arm; r.top.rot = 0.5 * d * arm; r.top.len = 0.3 * arm; r.eye.lid = 0.5 * U.hold(t, 0.35, 0.42, 0.58, 0.66); r.eye.glow = 0.5 * U.pulse(t, 0.3, 1); } });
  P.clip("slider-dust", { tags: ["slider-done", "proud"], dur: 1600, cooldown: 0, principles: ["secondary-action", "timing", "appeal", "pose-to-pose"],
    cues: [[0.3, (c, api, i) => api.fx("puff", { n: 2, x: c.size.r * 0.9 * i.side, y: 0 })]],
    update(t, r, c, i) { const s = i.side, h = U.hold(t, 0.08, 0.2, 0.7, 0.9), q = Math.sin(TAU * 6 * t); r.top.root = 1.15 * s * h; r.bottom.root = -1.15 * s * h; r.top.rot = 0.3 * q * h; r.bottom.rot = -0.3 * q * h;
      r.eye.gaze = -h; r.eye.x = 0.6 * s * h; r.eye.y = 0.2 * h; r.eye.lid = 0.35 * h; r.eye.glow = 0.4 * U.pulse(t, 0.6, 1); r.tilt = 0.05 * s * h; } });


  P.clip("figure-gasp", { tags: ["figure"], dur: 1900, cooldown: 0, principles: ["anticipation", "exaggeration", "staging", "follow-through"],
    update(t, r, c) { const s = toward(c), g = U.hold(t, 0.04, 0.12, 0.4, 0.6), pt = U.hold(t, 0.45, 0.6, 0.85, 0.98); r.eye.narrow = -0.25 * g + 0.2 * pt; r.eye.size = 0.35 * g; r.scale = 0.08 * g; r.y = -4 * g; r.sq = 0.1 * U.pulse(t, 0.02, 0.2);
      r.eye.glow = 0.7 * U.pulse(t, 0.02, 1); r.top.aim = pt; r.top.tip = 0.8 * pt; r.top.len = 0.3 * pt; r.tilt = 0.08 * s * pt; r.x = -3 * s * g + 3 * s * pt; } });
  const SX = [[0, 0], [0.12, 0.5, "out"], [0.25, 0.5], [0.3, -0.3, "out"], [0.45, -0.3], [0.5, 0.2, "out"], [0.65, 0.2], [0.7, -0.5, "out"], [0.85, -0.5], [0.9, 0, "out"]];
  const SY = [[0, 0], [0.12, -0.2, "out"], [0.25, -0.2], [0.3, 0.3, "out"], [0.45, 0.3], [0.5, -0.3, "out"], [0.65, -0.3], [0.7, 0.2, "out"], [0.85, 0.2], [0.9, 0, "out"]];
  P.clip("figure-study", { tags: ["figure", "curious"], dur: 2800, cooldown: 0, principles: ["staging", "timing", "exaggeration", "pose-to-pose"],
    update(t, r, c) { const s = toward(c), h = U.hold(t, 0.06, 0.22, 0.82, 0.96); r.eye.size = 0.32 * h; r.eye.narrow = 0.4 * h; r.tilt = 0.12 * s * h; r.x = 6 * s * h; r.eye.x = 0.4 * U.keys(t, SX) * h; r.eye.y = 0.4 * U.keys(t, SY) * h; r.eye.glow = 0.35 * h; r.bottom.rot = 0.15 * s * h; } });
  P.clip("figure-touch", { tags: ["figure", "clumsy"], dur: 2200, cooldown: 0, principles: ["anticipation", "follow-through", "timing", "appeal", "exaggeration"],
    cues: [[0.42, (c, api) => api.fx("spark", { n: 4, x: (c.focus.dx < 0 ? -1 : 1) * c.size.r * 1.5, y: 0, spread: 2.4 })]],
    update(t, r, c) { const s = toward(c), reach = U.keys(t, [[0, 0], [0.1, 0], [0.38, 1, "inOut"], [0.42, 1], [0.5, 0.1, "out"], [0.6, 0, "out"]]), zap = U.hold(t, 0.4, 0.44, 0.55, 0.7), proud = U.hold(t, 0.62, 0.72, 0.88, 1);
      r.reach.len = reach; r.reach.width = 0.15 * reach; r.eye.narrow = 0.4 * reach - 0.2 * zap - 0.15 * proud; r.eye.size = 0.25 * zap; r.x = 3 * s * reach - 6 * s * zap; r.sq = 0.14 * U.pulse(t, 0.4, 0.55); r.spread = 0.12 * U.pulse(t, 0.4, 0.6);
      r.eye.glow = 0.3 * reach + 0.9 * zap + 0.5 * proud; r.eye.fire = 0.5 * zap; r.top.rot = 0.4 * U.decay(U.lag(t, 0.42), 3, 4); r.top.tip = 0.6 * proud; r.y = -4 * air(t, 0.62, 0.92, 1); } });
  const morph = (name, form, dur, w, pr, extra) => P.clip(name, { tags: ["morph", "formation"], dur, weight: w, cooldown: 4000, form, principles: pr,
    update(t, r, c, i) { const h = U.hold(t, 0.04, 0.34, 0.7, 0.98); r.morph = h; r.eye.glow = 0.3 * h; if (extra) extra(t, r, h); } });
  morph("morph-splats", "splats", 2800, 1.3, ["staging", "overlapping", "slow-in-out", "appeal", "squash-stretch"], (t, r) => { r.scale = 0.08 * U.pulse(t, 0.3, 0.5); });
  morph("morph-packet", "packet", 3000, 1.1, ["staging", "overlapping", "timing", "arcs"], null);
  morph("morph-spectrum", "spectrum", 2800, 1, ["staging", "overlapping", "pose-to-pose", "slow-in-out"], (t, r, h) => { r.y = -2 * U.pulse(t, 0.3, 0.45); });
  morph("morph-contour", "contour", 2600, 0.9, ["staging", "overlapping", "solid-drawing", "slow-in-out"], null);
  morph("morph-vortex", "vortex", 2600, 0.8, ["staging", "arcs", "overlapping", "follow-through"], (t, r, h) => { r.eye.spin = 0; });
  morph("morph-ring", "ring", 2400, 0.7, ["staging", "arcs", "overlapping", "appeal"], null);


  P.clip("impact-flash", { tags: ["impact"], layer: "over", dur: 600, cooldown: 0, fadeIn: 20, principles: ["exaggeration", "timing", "secondary-action"],
    update(t, r) { const p = U.pulse(t, 0, 0.35); r.eye.glow = 1.2 * Math.pow(1 - t, 3) + 0.3 * p; r.eye.size = -0.25 * p; r.eye.narrow = 0.4 * p; r.eye.spin = 0.9 * U.decay(t, 1, 3); r.eye.lid = 0.5 * U.pulse(t, 0.3, 0.55); } });
  P.clip("bump-ouch", { tags: ["bump"], dur: 1600, cooldown: 3000, principles: ["timing", "exaggeration", "secondary-action", "follow-through"],
    cues: [[0.15, (c, api) => api.fx("drop", { n: 2, y: -c.size.r * 0.6, spread: 1.6 })]],
    update(t, r, c, i) { const side = c.impact.side === "left" ? -1 : c.impact.side === "right" ? 1 : i.side, sq = U.hold(t, 0, 0.08, 0.45, 0.65), rub = U.hold(t, 0.4, 0.5, 0.8, 0.95);
      r.x = 3 * U.decay(t, 4, 3); r.eye.lid = 0.65 * sq; r.eye.narrow = 0.7 * sq; r.eye.lidTilt = 0.5 * side * sq; r.top.root = side * rub; r.top.rot = 0.3 * Math.sin(TAU * 5 * t) * rub; r.top.bend = 0.4 * rub; r.tilt = -0.06 * side * sq; r.eye.glow = -0.2 * sq; } });
  P.clip("bump-shrug", { tags: ["bump", "caught"], dur: 1800, cooldown: 3000, principles: ["staging", "appeal", "timing", "pose-to-pose"],
    update(t, r, c, i) { const s = i.side, look = U.hold(t, 0.03, 0.08, 0.42, 0.48), arms = U.hold(t, 0.45, 0.55, 0.88, 0.98), up = U.pulse(t, 0.55, 0.68) + U.pulse(t, 0.7, 0.83);
      r.eye.gaze = -look; r.eye.x = U.keys(t, [[0, 0], [0.08, 0.9 * s, "out"], [0.2, 0.9 * s], [0.26, -0.9 * s, "out"], [0.38, -0.9 * s], [0.44, 0]]) * look; r.eye.narrow = 0.3 * look;
      r.top.root = (-1.571 + 0.5 * up) * arms; r.bottom.root = (-1.571 - 0.5 * up) * arms; r.y = -2.5 * up; r.eye.lid = 0.4 * arms; r.eye.lidTilt = 0.3 * s * arms; r.eye.glow = 0.2 * arms; } });
  P.clip("land-jelly", { tags: ["land"], layer: "over", dur: 750, cooldown: 0, fadeIn: 20, principles: ["squash-stretch", "follow-through", "overlapping", "timing"],
    update(t, r) { const k = Math.exp(-4 * t) * (1 - t); r.sq = -0.2 * Math.cos(TAU * 3 * t) * k; r.cores.y = 3 * Math.cos(TAU * 3 * t - 1) * k; r.orbit.y = 2 * Math.cos(TAU * 3 * t - 0.6) * k; r.eye.lid = 0.3 * U.pulse(t, 0, 0.25); } });
  P.clip("cling-scramble", { tags: ["cling"], dur: 700, cooldown: 0, principles: ["exaggeration", "secondary-action", "timing", "staging"],
    update(t, r, c) { const w = c.body.wall === "left" ? -1 : 1, h = U.hold(t, 0, 0.1, 0.85, 1), q = Math.sin(TAU * 6 * t); r.top.root = 1.3 * w * h; r.bottom.root = -1.3 * w * h; r.top.rot = 0.5 * q * h; r.bottom.rot = -0.5 * q * h;
      r.eye.narrow = -0.25 * h; r.eye.gaze = -h; r.eye.x = -0.6 * w * h; r.eye.y = 0.5 * h; r.eye.size = 0.28 * h; } });
  P.clip("slide-squeak", { tags: ["slide"], loop: true, dur: 600, cooldown: 0, principles: ["squash-stretch", "timing", "straight-ahead"],
    update(t, r) { const a = TAU * t; r.sq = 0.14; r.eye.lid = 0.7; r.eye.narrow = 0.6; r.eye.fire = 0.25; r.x = 0.9 * Math.sin(a * 5); r.top.rot = 0.2 * Math.sin(a * 3); r.bottom.rot = -0.2 * Math.sin(a * 3 + 1); } });
  P.clip("dizzy-wobble", { tags: ["dizzy"], dur: 1700, cooldown: 0, principles: ["exaggeration", "arcs", "timing", "overlapping"],
    update(t, r) { const h = U.hold(t, 0, 0.1, 0.85, 1), a = TAU * 1.5 * t; r.x = 5 * Math.sin(a) * h; r.rot = 0.25 * Math.sin(a + 0.6) * h; r.eye.spin = t < 1 ? -2 * TAU * E.inOut(t) : 0; r.eye.lid = 0.4 * h; r.eye.droop = 0.3 * h;
      r.eye.lidTilt = 0.4 * Math.sin(a) * h; r.poles.len = -0.25 * h; r.top.rot = 0.4 * Math.sin(a - 0.5) * h; } });
  P.clip("recover-shake", { tags: ["recover"], dur: 820, cooldown: 0, principles: ["follow-through", "timing", "secondary-action"],
    update(t, r) { r.cores.x = 2.2 * U.decay(t, 5, 2.5); r.rot = 0.1 * U.decay(t, 5, 3); r.eye.size = 0.12 * U.pulse(t, 0.4, 0.8); r.eye.lid = U.pulse(t, 0.42, 0.56) + U.pulse(t, 0.62, 0.76); r.poles.len = 0.3 * U.pulse(t, 0.5, 1); r.eye.glow = 0.3 * U.pulse(t, 0.5, 1); } });
  P.clip("recover-tada", { tags: ["recover", "proud"], dur: 820, cooldown: 0, principles: ["anticipation", "staging", "appeal", "squash-stretch"],
    update(t, r) { const pre = U.pulse(t, 0, 0.2), up = U.hold(t, 0.18, 0.32, 0.7, 0.95); r.sq = -0.15 * pre + 0.15 * U.pulse(t, 0.18, 0.4); r.y = 3 * pre - 7 * air(t, 0.18, 0.55, 1); r.top.root = -1.571 * up; r.bottom.root = -1.571 * up;
      r.poles.len = 0.5 * up; r.poles.tip = 0.7 * up; r.eye.glow = 0.6 * up; r.eye.narrow = -0.4 * up; } });


  P.clip("hide-edge", { tags: ["idle", "hide", "playful"], dur: 4600, weight: 0.5, cooldown: 60000, principles: ["anticipation", "staging", "timing", "appeal", "arcs"],
    when: c => { const d = edgeGap(c); return d > -c.size.r && d < 380; },
    update(t, r, c) { const R = c.size.r, d = U.clamp(edgeGap(c), -R, 380), k = k72(c), hid = (d + R * 1.25) * k, pk = (d + R * 0.45) * k, pe = U.hold(t, 0.44, 0.5, 0.64, 0.68);
      r.x = U.keys(t, [[0, 0], [0.08, -5 * k, "inOut"], [0.26, hid, "inOut"], [0.42, hid], [0.5, pk, "out"], [0.64, pk], [0.7, hid, "in"], [0.78, hid], [0.96, 0, "inOut"]]);
      r.y = -10 * air(t, 0.1, 0.26, 1) - 8 * air(t, 0.8, 0.96, 1); r.sq = -0.1 * U.pulse(t, 0, 0.1) + 0.08 * U.pulse(t, 0.12, 0.22) - 0.08 * U.pulse(t, 0.76, 0.84);
      r.eye.gaze = -pe; r.eye.x = -0.85 * pe; r.eye.y = 0.1 * pe; r.eye.narrow = -0.3 * pe; r.eye.glow = 0.3 * pe + 0.4 * U.pulse(t, 0.84, 1); r.eye.lid = U.pulse(t, 0.55, 0.6); r.tilt = -0.12 * pe; r.top.rot = 0.25 * U.decay(U.lag(t, 0.9), 2, 4); } });
  P.clip("peek-blink", { tags: ["idle", "hide", "viewer"], dur: 2200, weight: 0.8, cooldown: 25000, principles: ["staging", "timing", "appeal", "anticipation"],
    when: c => c.body.peek,
    update(t, r, c) { const k = k72(c), R = c.size.r, out = U.hold(t, 0.08, 0.25, 0.7, 0.9); r.x = -0.35 * R * k * out + 3 * k * U.pulse(t, 0, 0.1); r.tilt = -0.14 * out; r.eye.gaze = -out; r.eye.x = -0.75 * out;
      r.eye.lid = U.pulse(t, 0.38, 0.46) + U.pulse(t, 0.5, 0.58); r.eye.glow = 0.4 * out; r.eye.narrow = -0.3 * out; r.top.rot = -0.3 * out; } });
  P.clip("edge-wave", { tags: ["idle", "hide", "greet"], dur: 2000, weight: 0.7, cooldown: 25000, principles: ["staging", "secondary-action", "appeal", "follow-through"],
    when: c => c.body.peek,
    update(t, r, c) { const k = k72(c), R = c.size.r, w = U.hold(t, 0.1, 0.25, 0.75, 0.9); r.x = -0.2 * R * k * w; r.top.root = -w; r.top.len = 0.6 * w; r.top.rot = 0.45 * Math.sin(TAU * 3 * U.lag(t, 0.25)) * w; r.top.tip = 0.5 * w;
      r.eye.gaze = -w; r.eye.x = -0.6 * w; r.eye.glow = 0.3 * w; r.tilt = -0.08 * w; } });
  P.clip("edge-boo", { tags: ["idle", "hide", "playful"], dur: 3000, weight: 0.4, cooldown: 60000, principles: ["anticipation", "exaggeration", "timing", "staging", "squash-stretch"],
    when: c => { const d = edgeGap(c); return d > -c.size.r && d < 380; },
    cues: [[0.64, (c, api) => api.fx("exclaim", { n: 1, x: -c.size.r * 0.3 })]],
    update(t, r, c) { const R = c.size.r, d = U.clamp(edgeGap(c), -R, 380), k = k72(c), hid = (d + R * 1.25) * k, boo = U.hold(t, 0.6, 0.64, 0.8, 0.95);
      r.x = U.keys(t, [[0, 0], [0.06, -4 * k], [0.2, hid, "in"], [0.56, hid], [0.64, -0.3 * R * k, "out"], [0.82, -0.3 * R * k], [1, 0, "inOut"]]);
      r.eye.narrow = -0.25 * boo; r.eye.size = 0.35 * boo; r.eye.glow = 0.8 * boo; r.spread = 0.2 * U.pulse(t, 0.6, 0.75); r.poles.len = 0.8 * boo; r.top.root = -0.6 * boo; r.bottom.root = 0.6 * boo;
      r.sq = 0.15 * U.pulse(t, 0.6, 0.7) - 0.1 * U.pulse(t, 0.68, 0.8); r.y = -6 * U.pulse(t, 0.6, 0.78); } });


  P.clip("arrive-skid", { tags: ["arrive"], layer: "over", dur: 650, cooldown: 6000, fadeIn: 30, principles: ["follow-through", "squash-stretch", "timing", "secondary-action"],
    cues: [[0.05, (c, api) => api.fx("puff", { n: 2, y: c.size.r * 1.05 })]],
    update(t, r, c, i) { const s = i.side; r.tilt = -0.18 * s * U.decay(t, 1.2, 3); r.sq = -0.08 * U.pulse(t, 0, 0.3); r.eye.narrow = 0.3 * U.pulse(t, 0, 0.4); r.top.rot = 0.35 * s * U.decay(U.lag(t, 0.05), 2, 3); } });
  P.clip("arrive-settle", { tags: ["arrive"], layer: "over", dur: 750, cooldown: 6000, principles: ["follow-through", "overlapping", "appeal"],
    update(t, r) { r.sq = 0.06 * U.decay(t, 2, 4); r.cores.y = 2 * U.decay(U.lag(t, 0.05), 2, 4); r.eye.lid = U.pulse(t, 0.55, 0.72); r.eye.glow = 0.25 * U.pulse(t, 0.1, 1); r.bottom.rot = 0.2 * U.decay(t, 2, 4); } });
  P.clip("theme-adjust", { tags: ["theme", "eye"], layer: "eye", dur: 1200, cooldown: 1500, principles: ["timing", "appeal", "secondary-action"],
    update(t, r, c) { const dk = c.theme === "dark" ? 1 : -1, h = U.hold(t, 0.05, 0.2, 0.6, 0.95); r.eye.narrow = -0.2 * dk * h; r.eye.size = 0.2 * dk * h; r.eye.glow = (0.3 + 0.3 * dk) * h; r.eye.lid = (dk < 0 ? 0.3 * h : 0) + U.pulse(t, 0.65, 0.78); } });
})();
} catch (e) { console.warn("companion pack interact", e); } finally { if (window.GSPet) GSPet.debug.setPack(""); }
