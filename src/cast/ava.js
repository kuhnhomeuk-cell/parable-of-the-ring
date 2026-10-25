// cast/ava.js: character and prop builders (FILM.cast).
(function () {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const FILM = (root.FILM = root.FILM || {});
  FILM.cast = FILM.cast || {};
  const TAU = Math.PI * 2;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  const hexRgb = (c) => {
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const hmix = (a, b, k) => {
    const A = hexRgb(a), B = hexRgb(b);
    const v = A.map((x, i) => Math.round(x + (B[i] - x) * k));
    return '#' + v.map((x) => x.toString(16).padStart(2, '0')).join('');
  };
  const SUN = '#ffd49a';
  const INK = '#1F1712';
  const tone = (base, shade, rimK) => ({ base, shade, rim: hmix(base, SUN, rimK == null ? 0.42 : rimK) });
  const farTone = (c) => ({ base: hmix(c.base, c.shade, 0.4), shade: hmix(c.shade, INK, 0.12), rim: hmix(c.base, SUN, 0.18) });

  const lerp = (a, b, k) => a + (b - a) * k;
  const sstep = (a, b, v) => {
    const k = clamp01((v - a) / (b - a));
    return k * k * (3 - 2 * k);
  };
  const rot = (p, a) => {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
  };
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const mixP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const inFrame = (o, a, p) => add(o, rot(p, a));
  const mixPts = (A, B, k) => A.map((p, i) => mixP(p, B[i], k));

  function spline(ctx, pts, closed, k) {
    const n = pts.length;
    const tk = (k == null ? 1 : k) / 6;
    const P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
    ctx.moveTo(pts[0][0], pts[0][1]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      const c1 = p1[2] ? p1 : [p1[0] + (p2[0] - p0[0]) * tk, p1[1] + (p2[1] - p0[1]) * tk];
      const c2 = p2[2] ? p2 : [p2[0] - (p3[0] - p1[0]) * tk, p2[1] - (p3[1] - p1[1]) * tk];
      ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p2[0], p2[1]);
    }
    if (closed) ctx.closePath();
  }
  function oriented(pts) {
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      a += p[0] * q[1] - q[0] * p[1];
    }
    return a < 0 ? pts.slice().reverse() : pts;
  }
  const blob = (pts, k) => (ctx) => spline(ctx, oriented(pts), true, k);

  function capsule(ax, ay, ra, bx, by, rb) {
    return (ctx) => {
      const d = Math.max(1e-3, Math.hypot(bx - ax, by - ay));
      const th = Math.atan2(by - ay, bx - ax);
      const ps = Math.asin(Math.max(-0.99, Math.min(0.99, (ra - rb) / d)));
      const n1 = th - Math.PI / 2 + ps, n2 = th + Math.PI / 2 - ps;
      ctx.moveTo(ax + Math.cos(n2) * ra, ay + Math.sin(n2) * ra);
      ctx.arc(ax, ay, ra, n2, n1 + TAU);
      ctx.arc(bx, by, rb, n1, n2);
      ctx.closePath();
    };
  }
  const oval = (x, y, rx, ry, a) => (ctx) => {
    ctx.moveTo(x + Math.cos(a || 0) * rx, y + Math.sin(a || 0) * rx);
    ctx.ellipse(x, y, Math.max(0.3, rx), Math.max(0.3, ry), a || 0, 0, TAU);
  };

  function ribbon(pts, widths, tipCorner) {
    const L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let nx = -(b[1] - a[1]), ny = b[0] - a[0];
      const m = Math.hypot(nx, ny) || 1;
      nx /= m; ny /= m;
      const w = widths[i] / 2;
      L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
      R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
    }
    const tip = pts[pts.length - 1];
    const out = L.slice(0, -1);
    out.push(tipCorner ? [tip[0], tip[1], 1] : tip);
    for (let i = R.length - 2; i >= 0; i--) out.push(R[i]);
    return out;
  }

  const build = (ctx, parts) => {
    ctx.beginPath();
    for (const f of parts) f(ctx);
  };
  const BIG = (ctx) => ctx.fillRect(-3000, -3000, 6000, 6000);

  function shade(ctx, K, clips, shape, c, d, r) {
    ctx.save();
    for (const cl of clips) {
      build(ctx, cl);
      ctx.clip();
    }
    ctx.fillStyle = c.shade;
    BIG(ctx);
    ctx.translate(K.lx * d, K.ly * d);
    build(ctx, shape);
    ctx.fillStyle = c.base;
    ctx.fill();
    if (r > 0) {
      ctx.clip();
      ctx.fillStyle = c.rim;
      BIG(ctx);
      ctx.translate(-K.lx * (d + r), -K.ly * (d + r));
      build(ctx, shape);
      ctx.fillStyle = c.base;
      ctx.fill();
    }
    ctx.restore();
  }

  function cel(ctx, K, parts, c, d, r) {
    build(ctx, parts);
    ctx.fillStyle = INK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = K.lw * 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.fill();
    build(ctx, parts);
    ctx.fillStyle = c.base;
    ctx.fill();
    shade(ctx, K, [parts], parts, c, d, r == null ? K.rim : r);
  }

  function line(ctx, K, pts, w, alpha, color) {
    ctx.save();
    ctx.globalAlpha *= alpha == null ? 1 : alpha;
    ctx.strokeStyle = color || INK;
    ctx.lineWidth = Math.max(K.minLine, K.lw * (w || 0.55));
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    spline(ctx, pts, false);
    ctx.stroke();
    ctx.restore();
  }

  function frame(ctx, K, o, a, fn) {
    ctx.save();
    ctx.translate(o[0], o[1]);
    ctx.rotate(a);
    const l = rot([K.lx0, K.ly0], -a - K.baseRot);
    const K2 = Object.assign({}, K, { lx: l[0], ly: l[1], baseRot: K.baseRot + a });
    fn(K2);
    ctx.restore();
  }
  function scaled(ctx, K, k, fn) {
    ctx.save();
    ctx.scale(k, k);
    fn(Object.assign({}, K, { lw: K.lw / k, minLine: K.minLine / k, rim: K.rim / k }));
    ctx.restore();
  }

  function blinkAt(t) {
    const tt = t + 1.21;
    const slot = Math.floor(tt / 3);
    let c = 0;
    for (let k = slot - 1; k <= slot; k++) {
      const h = (Math.imul(k | 0, 0x3d4b2a6f) ^ 0x1b873593) >>> 0;
      const r = (((h ^ (h >>> 15)) * 2654435761) >>> 0) / 4294967296;
      const b0 = k * 3 + 0.5 + r;
      const x = (tt - b0) / 0.16;
      if (x >= 0 && x < 1) c = Math.max(c, x < 0.4 ? x / 0.4 : 1 - (x - 0.4) / 0.6);
    }
    return Math.min(1, c * 1.25);
  }

  function ik(rootP, target, a, b, hint) {
    const d0 = dist(rootP, target);
    const d = Math.max(Math.abs(a - b) + 1e-3, Math.min(d0, (a + b) * 0.999));
    const base = Math.atan2(target[1] - rootP[1], target[0] - rootP[0]);
    const k = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
    const m1 = add(rootP, [Math.cos(base - k) * a, Math.sin(base - k) * a]);
    const m2 = add(rootP, [Math.cos(base + k) * a, Math.sin(base + k) * a]);
    const mid = dist(m1, hint) <= dist(m2, hint) ? m1 : m2;
    const end = add(rootP, [((target[0] - rootP[0]) / (d0 || 1)) * d, ((target[1] - rootP[1]) / (d0 || 1)) * d]);
    return { mid, end };
  }

  const MC = {
    skin: tone('#E4AD80', '#C88D62', 0.34),
    lip: '#8E4A3A',
    mouth: '#3E1512',
    tongue: '#C0625A',
    hair: { base: '#121212', shade: '#08080A', rim: '#4A4A66' },
    sheen: '#3B3B55',
    eyeDot: '#15110F',
    iris: '#3FA37A',
    irisDeep: '#1F6A4C',
    irisLight: '#7CCFA6',
    tear: '#BFE6FF',
    shadow: 'rgba(70,40,18,',
  };
  const MF = { skin: farTone(MC.skin) };

  const OUTFITS = {
    vision: {
      cloth: tone('#A9CCEC', '#7EA3D2', 0.32), sash: tone('#DCEBF8', '#A9C4E2', 0.25), chiffon: '#D8EAF9',
      skirt: { hemS: 137, flare: 30, ripple: 1 }, neck: 'scoop', sleeve: 'bell', feet: 'bare', chiffonHem: true,
    },
    nurse: {
      cloth: tone('#F7F5F0', '#CDD1D3', 0.14), feetC: tone('#FBFAF6', '#D2D3D0', 0.14),
      skirt: { hemS: 84, flare: 7, ripple: 0.25 }, neck: 'collar', sleeve: 'short', feet: 'shoe',
    },
    bride: {
      cloth: tone('#FBF7F0', '#DDD0BF', 0.2), feetC: tone('#FBF7F0', '#DDD0BF', 0.2),
      skirt: { hemS: 150, flare: 44, ripple: 0.45 }, neck: 'sweetheart', sleeve: 'none', feet: 'shoe', veil: true,
    },
    beach: {
      cloth: tone('#EF8C6C', '#C9664E', 0.36), sash: tone('#FBE7CF', '#E2C3A2', 0.25),
      skirt: { hemS: 76, flare: 18, ripple: 0.7 }, neck: 'straps', sleeve: 'none', feet: 'bare',
    },
    swim: {
      cloth: tone('#DE5A50', '#B03F3A', 0.36),
      skirt: null, neck: 'suit', sleeve: 'none', feet: 'bare',
    },
  };

  const MH = 330;
  const AVA_STEP = 0.4;
  const RUN_STEP = 0.6;
  const STEP = AVA_STEP * MH;
  const RS = RUN_STEP * MH;
  const ANK = 10;
  const L1 = 72;
  const L2 = 68;
  const LMAX = (L1 + L2) * 0.997;
  const HIP_STAND = -147;
  const TORSO_DY = 6;
  const HEEL = [-11, ANK];
  const BALL = [18, ANK];
  const TOE = [26, 7];
  const HIP_X = [-3, 4];
  const UA = 44, FA = 40;
  const HS = 0.8;
  const KLEG = (L1 + L2) / 112;
  const HIP_KEYS = [[0, -113.5], [0.1, -108.5], [0.25, -125], [0.375, -126], [0.5, -113.5]].map(([q, y]) => [q, -(ANK + (-y - 14) * KLEG)]);

  function shoeAnkle(heelX, phi) {
    const pl = phi < 0 ? HEEL : BALL;
    const pivot = [heelX + (pl[0] - HEEL[0]), 0];
    return add(pivot, rot([-pl[0], -pl[1]], phi));
  }
  function hipY(p) {
    const q = ((p % 0.5) + 0.5) % 0.5;
    for (let i = 0; i < HIP_KEYS.length - 1; i++) {
      const a = HIP_KEYS[i], b = HIP_KEYS[i + 1];
      if (q <= b[0]) return lerp(a[1], b[1], (1 - Math.cos((Math.PI * (q - a[0])) / (b[0] - a[0]))) / 2);
    }
    return HIP_KEYS[0][1];
  }
  function stance(u, hip) {
    const heelX = hip[0] + HEEL[0] + 0.5 * STEP - 2 * STEP * u;
    let phi = 0;
    if (u < 0.13) phi = -0.3 * Math.pow(1 - u / 0.13, 2);
    else if (u > 0.3) phi = 0.25 * Math.pow((u - 0.3) / 0.2, 1.6);
    let ankle = shoeAnkle(heelX, phi);
    if (dist(hip, ankle) > LMAX) {
      const dir = ankle[0] > hip[0] ? -1 : 1;
      let lo = phi * dir > 0 ? Math.abs(phi) : 0;
      let hi = 1.3;
      for (let i = 0; i < 22; i++) {
        const mid = (lo + hi) / 2;
        if (dist(hip, shoeAnkle(heelX, mid * dir)) > LMAX) lo = mid;
        else hi = mid;
      }
      phi = hi * dir;
      ankle = shoeAnkle(heelX, phi);
    }
    return { ankle, phi, planted: true };
  }
  function swing(u, hipAtU) {
    const w = (u - 0.5) / 0.5;
    const e = stance(0.5, [hipAtU.x, hipY(hipAtU.p0)]);
    const s = stance(0, [hipAtU.x, hipY(hipAtU.p1)]);
    const w2 = w * w, w3 = w2 * w;
    const h00 = 2 * w3 - 3 * w2 + 1, h10 = w3 - 2 * w2 + w, h01 = -2 * w3 + 3 * w2, h11 = w3 - w2;
    const x = h00 * e.ankle[0] + h10 * (-0.4 * STEP) + h01 * s.ankle[0] + h11 * -STEP;
    const lift = 17 * Math.pow(Math.sin(Math.PI * Math.pow(w, 0.95)), 1.6);
    let y = lerp(e.ankle[1], s.ankle[1], w) - lift;
    let phi;
    if (w < 0.2) phi = lerp(e.phi, Math.max(e.phi, 0.62), sstep(0, 0.2, w));
    else if (w < 0.62) phi = lerp(Math.max(e.phi, 0.62), 0.08, sstep(0.2, 0.62, w));
    else phi = lerp(0.08, s.phi, sstep(0.62, 1, w));
    const low = Math.max(rot(HEEL, phi)[1], rot(BALL, phi)[1], rot(TOE, phi)[1]);
    if (y + low > 0) y = -low;
    return { ankle: [x, y], phi, planted: false };
  }
  function legWalk(u, p, side) {
    const hipX = HIP_X[side];
    if (u < 0.5) return stance(u, [hipX, hipY(p)]);
    return swing(u, { x: hipX, p0: p - (u - 0.5), p1: p + (1 - u) });
  }

  const RUN_ON = 0.24;
  function runHipY(p) {
    return -139 + 4 * Math.cos(4 * Math.PI * (p - RUN_ON / 2));
  }
  function runLeg(u, side) {
    const hx = HIP_X[side];
    const heel0 = hx + RS * RUN_ON - 6;
    const at = (uu) => {
      const heelX = heel0 - 2 * RS * uu;
      const phi = 0.55 * sstep(0.35, 1, uu / RUN_ON) - 0.05 * (1 - uu / RUN_ON);
      return { ankle: shoeAnkle(heelX, phi), phi };
    };
    if (u < RUN_ON) {
      const a = at(u);
      return { ankle: a.ankle, phi: a.phi, planted: true };
    }
    const w = (u - RUN_ON) / (1 - RUN_ON);
    const e = at(RUN_ON), s = at(0);
    const v = -2 * RS * (1 - RUN_ON);
    const w2 = w * w, w3 = w2 * w;
    const h00 = 2 * w3 - 3 * w2 + 1, h10 = w3 - 2 * w2 + w, h01 = -2 * w3 + 3 * w2, h11 = w3 - w2;
    const x = h00 * e.ankle[0] + h10 * v * 0.35 + h01 * s.ankle[0] + h11 * v;
    const lift = 40 * Math.pow(Math.sin(Math.PI * Math.pow(w, 0.6)), 1.3);
    const y = lerp(e.ankle[1], s.ankle[1], w) - lift;
    let phi;
    if (w < 0.3) phi = lerp(e.phi, 1.15, sstep(0, 0.3, w));
    else phi = lerp(1.15, s.phi, sstep(0.3, 1, w));
    return { ankle: [x, y], phi, planted: false };
  }

  const TORSO_SH = [[-16, -62], [20, -62]];
  const TORSO_SHF = [[-18, -62], [18, -62]];

  function V0() {
    return {
      hy: HIP_STAND, hx: 0, lift: 0, rT: 0, rH: 0, look: 0, front: 0, back: 0,
      trail: 0, flare: 0, flow: 0, float: 0, splash: 0, lock: 1,
      legs: [{ a: [-6, -ANK], k: [0, -80], phi: 0 }, { a: [10, -ANK], k: [14, -80], phi: 0 }],
      arms: [
        { w: [-14, -122], e: [-17, -162], ha: 1.5, open: 0, back: 0, k: 1 },
        { w: [16, -122], e: [14, -162], ha: 1.6, open: 0, back: 0, k: 1 },
      ],
    };
  }
  const pelvisOf = (V) => [V.hx, V.hy + TORSO_DY];
  const torsoPt = (V, q) => inFrame(pelvisOf(V), V.rT, q);
  function shoulderOf(V, side) {
    const f = clamp01(V.front);
    return torsoPt(V, mixP(TORSO_SH[side], TORSO_SHF[side], f));
  }
  function armFK(V, side, a, bend, extra) {
    const sh = shoulderOf(V, side);
    const e = add(sh, [Math.sin(a) * UA, Math.cos(a) * UA]);
    const w = add(e, [Math.sin(a + bend) * FA, Math.cos(a + bend) * FA]);
    V.arms[side] = Object.assign({ w, e, ha: Math.atan2(w[1] - e[1], w[0] - e[0]) + 0.12, open: 0, back: 0, k: 1 }, extra || {});
  }
  function armTo(V, side, w, eOff, ha, extra) {
    const sh = shoulderOf(V, side);
    V.arms[side] = Object.assign({ w, e: add(sh, eOff), ha, open: 0, back: 0, k: 1 }, extra || {});
  }
  function headPt(V, q) {
    const neck = torsoPt(V, [lerp(4, 0, clamp01(V.front)), -62]);
    const rH = V.rT + V.rH;
    return inFrame(neck, rH, mul(q, HS));
  }

  const POSES = {
    stand(V, C) {
      const sway = Math.sin((TAU * C.t) / 5.3);
      V.hx = 1.2 * sway;
      V.rT = -0.02 + 0.012 * sway;
      V.rH = 0.03;
      armFK(V, 0, -0.06, 0.18);
      armFK(V, 1, 0.08, 0.24);
    },
    walk(V, C) {
      const p = C.p;
      V.hy = hipY(p);
      V.rT = 0.035;
      V.rH = 0.0;
      V.legs = [0, 1].map((side) => {
        const u = (p + side * 0.5) % 1;
        const wk = legWalk(u, p, side);
        const hip = [HIP_X[side], V.hy];
        const k = ik(hip, wk.ankle, L1, L2, add(mixP(hip, wk.ankle, 0.5), [40, 0])).mid;
        return { a: wk.ankle, k, phi: wk.phi, planted: wk.planted };
      });
      const ph = TAU * (p - 0.04);
      for (const side of [0, 1]) {
        const sgn = side === 0 ? -1 : 1;
        const a = sgn * 0.36 * Math.cos(ph) - 0.04;
        const fwd = clamp01((a / 0.36 + 1) / 2);
        armFK(V, side, a, 0.12 + 0.3 * fwd);
      }
      V.flow = 0.6;
    },
    run(V, C) {
      const p = C.p;
      V.hy = runHipY(p);
      V.rT = 0.13;
      V.rH = -0.08;
      V.legs = [0, 1].map((side) => {
        const u = (p + side * 0.5) % 1;
        const r = runLeg(u, side);
        const hip = [HIP_X[side], V.hy];
        const k = ik(hip, r.ankle, L1, L2, add(mixP(hip, r.ankle, 0.5), [50, 0])).mid;
        return { a: r.ankle, k, phi: r.phi, planted: r.planted };
      });
      const ph = TAU * p;
      for (const side of [0, 1]) {
        const sgn = side === 0 ? -1 : 1;
        armFK(V, side, sgn * 0.62 * Math.cos(ph) + 0.12, 1.5, { open: 0.1 });
      }
      V.flow = 1.2;
      V.trail = -14;
    },
    dance(V, C) {
      const phi = C.phi;
      const s = Math.sin(phi), c = Math.cos(phi);
      V.front = Math.max(0, c);
      V.back = Math.max(0, -c);
      V.hy = HIP_STAND - 3 + 2.5 * Math.sin(TAU * C.t / 2);
      V.rT = -0.03 + 0.05 * s;
      V.rH = 0.08 * Math.sin(TAU * C.t / 4 + 0.6) - 0.04 * s;
      V.look = 0.12;
      const rise = 0.32 + 0.08 * Math.sin(TAU * C.t / 2);
      V.legs = [[-7 + 5 * s, rise], [7 + 7 * s, rise + 0.1 * Math.abs(s)]].map(([hx, ph]) => {
        const a = shoeAnkle(hx - 4, ph);
        return { a, k: [hx + 10, -82], phi: ph };
      });
      const lift = 34 * s, wave = 5 * Math.sin(TAU * C.t / 1.7);
      const sN = shoulderOf(V, 0), sF = shoulderOf(V, 1);
      armTo(V, 0, add(sN, [-72 + 6 * Math.abs(s), 36 - lift + wave]), [-40, 2], Math.PI - 0.42 + 0.4 * s, { open: 0.75 });
      armTo(V, 1, add(sF, [72 - 6 * Math.abs(s), 36 + lift - wave]), [40, 2], 0.42 + 0.4 * s, { open: 0.75 });
      V.trail = -C.dphi * 9;
      V.flare = Math.min(1, Math.abs(C.dphi) / 2.2);
      V.flow = 1;
      V.lock = 1 - V.front;
    },
    float(V, C) {
      const bob = Math.sin((TAU * C.t) / 3.2);
      V.lift = -(C.liftL != null ? C.liftL : 26) - 6 * bob;
      V.hy = HIP_STAND + 2;
      V.rT = 0.03 + 0.02 * bob;
      V.rH = 0.02;
      V.legs = [{ a: [-1, -ANK + 1], k: [6, -80], phi: 0.75 }, { a: [12, -ANK - 6], k: [20, -82], phi: 0.85 }];
      armFK(V, 0, -0.32 - 0.05 * bob, 0.4, { open: 0.5 });
      armFK(V, 1, 0.3 + 0.05 * bob, 0.42, { open: 0.5 });
      V.float = 1;
      V.flow = 1;
    },
    leanOverBed(V, C) {
      V.hx = -12;
      V.hy = HIP_STAND + 3;
      V.rT = 0.72;
      V.rH = -0.32;
      V.look = -0.1;
      V.legs = [{ a: [-16, -ANK], k: [-8, -80], phi: 0 }, { a: [2, -ANK], k: [10, -80], phi: 0 }];
      const tg = C.target || [120, -160];
      reachIn(V, () => cup(V, tg, C));
    },
    handsToFace(V, C) {
      V.rT = 0.1;
      V.rH = -0.06;
      V.legs = [{ a: [-8, -ANK], k: [0, -80], phi: 0 }, { a: [14, -ANK], k: [20, -80], phi: 0 }];
      const tg = C.target || [96, -246];
      reachIn(V, () => cup(V, tg, C));
    },
    laughHand(V, C) {
      const shake = Math.sin(TAU * C.t * 2.2);
      V.rT = 0.06 + 0.015 * shake;
      V.rH = 0.12 + 0.03 * shake;
      V.hy = HIP_STAND + 1 + 1.2 * shake;
      mouthHand(V);
      armTo(V, 1, torsoPt(V, [27, -6]), [12, 36], 1.3, { open: 0.2 });
    },
    walkAwayLaugh(V, C) {
      POSES.walk(V, C);
      V.front = 1.45;
      V.rH = 0.06;
      mouthHand(V);
      const sw = Math.cos(TAU * (C.p - 0.04));
      armFK(V, 1, 0.42 + 0.22 * sw, 0.3 + 0.12 * sw);
    },
    runAwayWave(V, C) {
      POSES.run(V, C);
      V.front = 1.5;
      V.rH = 0.02;
      V.look = 0.15;
      V.lock = 0;
      const wave = Math.sin(TAU * C.t * 2.1);
      const sh = shoulderOf(V, 0);
      reachIn(V, () => armTo(V, 0, add(shoulderOf(V, 0), [-34 + 6 * wave, -104]), [-30, -30], -1.75 + 0.38 * wave, { back: 1, open: 1 }));
      void sh;
    },
    kneelHold(V, C) {
      V.hy = -86;
      V.hx = -2;
      V.rT = 0.08;
      V.rH = -0.12;
      V.look = 0.2;
      V.legs = [
        { a: [-54, -24], k: [4, -9], phi: 1.0 },
        { a: [64, -ANK], k: [70, -82], phi: 0 },
      ];
      const tg = C.target || [80, -150];
      reachIn(V, () => {
        armTo(V, 0, C.targetN || add(tg, [-12, 4]), [10, 34], -0.15, { open: 0.25 });
        armTo(V, 1, C.targetF || add(tg, [-2, -3]), [18, 32], -0.1, { open: 0.25 });
      });
    },
    sit(V, C) {
      const seat = C.seatL != null ? C.seatL : -74;
      V.hy = seat - 9;
      V.hx = -6;
      V.rT = -0.06;
      V.rH = 0.04;
      V.legs = [{ a: [58, -ANK], k: [62, seat - 10], phi: 0 }, { a: [70, -ANK], k: [74, seat - 12], phi: 0 }];
      armTo(V, 0, [38, seat - 22], [14, 38], 0.1, { open: 0.2 });
      armTo(V, 1, [48, seat - 24], [20, 36], 0.15, { open: 0.2 });
    },
    hug(V, C) {
      V.rT = 0.12;
      V.rH = 0.16;
      V.legs = [{ a: [4, -ANK], k: [12, -80], phi: 0 }, { a: [-10, -ANK], k: [-2, -80], phi: 0.1 }];
      const tg = C.target || [84, -188];
      reachIn(V, () => {
        armTo(V, 0, C.targetN || add(tg, [-4, 8]), [16, 30], -0.2, { open: 0.7 });
        armTo(V, 1, C.targetF || add(tg, [8, -8]), [26, 22], -0.5, { open: 0.7 });
      });
    },
    splash(V, C) {
      const q = TAU * C.t * 1.1;
      V.splash = 1;
      V.rT = 0.06 + 0.05 * Math.sin(q);
      V.rH = 0.1 - 0.06 * Math.sin(q + 0.6);
      V.hy = HIP_STAND + 3 * Math.sin(q * 2);
      armFK(V, 0, 0.95 + 0.5 * Math.sin(q), 0.2 + 0.25 * Math.cos(q), { open: 0.9 });
      armFK(V, 1, 0.8 + 0.5 * Math.sin(q + 2.4), 0.25, { open: 0.9 });
      V.flow = 0.5;
    },
    showHand(V, C) {
      V.rT = -0.02;
      V.rH = -0.08;
      V.look = 0.25;
      reachIn(V, () => armTo(V, 0, [70, -212], [26, 28], -1.36, { back: 1, open: 1 }));
      armFK(V, 1, 0.08, 0.26);
    },
  };
  function reachIn(V, place) {
    for (let i = 0; i < 6; i++) {
      place();
      let worst = 0;
      for (const side of [0, 1]) {
        const need = dist(shoulderOf(V, side), V.arms[side].w) / (0.97 * (UA + FA));
        V.arms[side].k = clamp(need, 1, 1.4);
        worst = Math.max(worst, need);
      }
      if (worst <= 1.4) return;
      V.rT += 0.04;
    }
  }
  function cup(V, tg, C) {
    armTo(V, 0, C.targetN || add(tg, [-15, 10]), [12, 40], -0.95, { open: 1 });
    armTo(V, 1, C.targetF || add(tg, [-5, -6]), [24, 34], -0.75, { open: 1 });
  }
  const PALM_UP = [{ a: 0.3, bend: 1.46, ha: -0.16 }, { a: 0.38, bend: 1.4, ha: -0.1 }];
  function palmUpArm(V, side, p) {
    const g = PALM_UP[side];
    const sh = shoulderOf(V, side);
    const e = add(sh, [Math.sin(g.a) * UA, Math.cos(g.a) * UA]);
    const w = add(e, [Math.sin(g.a + g.bend) * FA * 0.995, Math.cos(g.a + g.bend) * FA * 0.995]);
    const A = V.arms[side];
    A.w = mixP(A.w, w, p);
    A.e = mixP(A.e, e, p);
    A.ha = lerp(A.ha, g.ha, p);
    A.open = lerp(A.open || 0, 1, p);
    A.back = lerp(A.back || 0, 0, p);
    A.k = lerp(A.k || 1, 1, p);
    A.palm = p;
  }
  function mouthHand(V) {
    const m = headPt(V, [6 + 40 - 33 * clamp01(V.front), -66 + 37]);
    armTo(V, 0, add(m, [-4, 14]), [24, 30], -1.55, { open: 0.55 });
  }

  const EXPR = {
    neutral: {},
    smileSoft: { smile: 0.55, lid: 0.12, blush: 0.25, brow: 0.5 },
    smilePolite: { smile: 0.32, mouthW: 1.25, lid: 0.32, brow: 0, blush: 0.1 },
    laugh: { smile: 1, open: 0.85, happy: 1, brow: 2.5, blush: 0.55 },
    tearful: { worry: 1, open: 0, smile: -0.3, gloss: 1, tear: 0.85, brow: 1, eyeOpen: 0.06 },
    cry: { worry: 1.2, squeeze: 1, open: 0.55, smile: -0.9, stream: 1, blush: 0.4, brow: 1.5 },
    wonder: { eyeOpen: 0.25, brow: 4.5, oh: 1, gloss: 0.6 },
    loving: { lid: 0.42, smile: 0.5, blush: 0.6, worry: 0.3, gloss: 0.5 },
  };
  const EKEYS = ['smile', 'open', 'happy', 'brow', 'worry', 'lid', 'gloss', 'tear', 'stream', 'squeeze', 'oh', 'blush', 'eyeOpen', 'mouthW'];

  function weights(spec, fallback) {
    if (!spec) return [[fallback, 1]];
    if (typeof spec === 'string') return [[spec, 1]];
    const out = [];
    let sum = 0;
    for (const k of Object.keys(spec)) {
      const w = Number(spec[k]) || 0;
      if (w > 0) { out.push([k, w]); sum += w; }
    }
    if (!out.length) return [[fallback, 1]];
    return out.map(([k, w]) => [k, w / sum]);
  }

  function blendInto(acc, v, w) {
    if (typeof v === 'number') return (acc || 0) + v * w;
    if (Array.isArray(v)) return v.map((x, i) => blendInto(acc ? acc[i] : undefined, x, w));
    if (v && typeof v === 'object') {
      const o = acc || {};
      for (const k of Object.keys(v)) if (typeof v[k] !== 'boolean') o[k] = blendInto(o[k], v[k], w);
      return o;
    }
    return acc;
  }

  function rig(o) {
    const t = o.t || 0;
    const h = Math.max(20, o.h || MH);
    const s = h / MH;
    const facing0 = o.facing === -1 ? -1 : 1;
    const pw = weights(o.pose, 'stand');
    const wOf = (n) => pw.reduce((a, [k, w]) => a + (k === n ? w : 0), 0);
    const wDance = wOf('dance');
    const DP = 4;
    const phiAt = (tt) => TAU * (tt / DP) - 0.55 * Math.sin((TAU * tt) / DP) + Math.PI * 0.0;
    const phi = o.turn != null ? o.turn : phiAt(t);
    const dphi = o.turn != null ? 0 : (phiAt(t + 0.02) - phiAt(t - 0.02)) / 0.04;
    const toLocal = (P) => (P ? [((P.x - (o.x || 0)) / s) * facing0, (P.y - (o.y || 0)) / s] : null);
    const C = {
      t,
      p: ((((o.walk || 0) % 1) + 1) % 1),
      phi, dphi,
      target: toLocal(o.target),
      targetN: toLocal(o.targetNear),
      targetF: toLocal(o.targetFar),
      seatL: o.seatY != null ? (o.seatY - (o.y || 0)) / s : null,
      liftL: o.lift != null ? o.lift / s : null,
    };
    let V = null;
    const planted = [false, false];
    const vs = [];
    for (const [name, w] of pw) {
      const fn = POSES[name] || POSES.stand;
      const v = V0();
      fn(v, C);
      for (const side of [0, 1]) if (v.legs[side].planted && w >= 0.999) planted[side] = true;
      V = blendInto(V, v, w);
      vs.push([v, w]);
    }
    if (vs.length === 2 && vs[0][1] > 0 && vs[1][1] > 0) {
      const k = vs[1][1] / (vs[0][1] + vs[1][1]);
      const ang = (q) => Math.atan2(q[1], q[0]);
      const wrap = (d) => Math.atan2(Math.sin(d), Math.cos(d));
      for (const side of [0, 1]) {
        if (dist(vs[0][0].arms[side].w, vs[1][0].arms[side].w) < 40) continue;
        const sol = vs.map(([v]) => {
          const A = v.arms[side], sh = shoulderOf(v, side), kk = Math.max(1, A.k || 1);
          const r = ik(sh, A.w, UA * kk, FA * kk, A.e);
          return { u: ang(sub(r.mid, sh)), f: ang(sub(r.end, r.mid)) };
        });
        const sh = shoulderOf(V, side), kk = Math.max(1, V.arms[side].k || 1);
        const ku = 1 - Math.pow(1 - k, 2), kf = k * k;
        const u = sol[0].u + wrap(sol[1].u - sol[0].u) * ku;
        const f = sol[0].f + wrap(sol[1].f - sol[0].f) * kf;
        const e = add(sh, [Math.cos(u) * UA * kk, Math.sin(u) * UA * kk]);
        V.arms[side].e = e;
        V.arms[side].w = add(e, [Math.cos(f) * FA * kk * 0.999, Math.sin(f) * FA * kk * 0.999]);
      }
    }
    if (o.front != null) V.front = o.front;
    if (o.look != null) V.look = clamp(o.look, -1, 1);
    if (o.palmUp != null) {
      const pu = Array.isArray(o.palmUp) ? o.palmUp : [o.palmUp, o.palmUp];
      for (const side of [0, 1]) {
        const p = clamp01(Number(pu[side]) || 0);
        if (p > 0) palmUpArm(V, side, p);
      }
    }
    const breath = Math.sin((TAU * t) / 3.8 + 0.4);

    let facing = facing0;
    let sx = 1;
    if (wDance > 0) {
      if (wDance >= 0.5 && Math.sin(phi) < 0) facing = -facing0;
      sx = 1 - 0.08 * Math.abs(Math.sin(phi)) * wDance;
      if (facing !== facing0) V.trail = -V.trail;
    }

    const legs = [0, 1].map((side) => {
      const L = V.legs[side];
      const hip = [HIP_X[side] + V.hx, V.hy];
      const r = ik(hip, L.a, L1, L2, L.k);
      return { hip, knee: r.mid, ankle: r.end, phi: L.phi, planted: planted[side] };
    });
    const front = V.front;
    const fr = clamp01(front);
    const pelvis = pelvisOf(V);
    const rT = V.rT;
    const T = (q) => inFrame(pelvis, rT, [q[0], q[1] - 0.42 * breath]);
    const neck = T([lerp(4, 0, fr), -62 - 0.6 * breath]);
    const rH = rT + V.rH - 0.2 * Math.max(0, V.look);
    const arms = [0, 1].map((side) => {
      const A = V.arms[side];
      const sh = T(mixP(TORSO_SH[side], TORSO_SHF[side], fr));
      const k = Math.max(1, A.k || 1);
      const r = ik(sh, A.w, UA * k, FA * k, A.e);
      const arm = { shoulder: sh, elbow: r.mid, wrist: r.end, handA: A.ha, open: clamp01(A.open), back: clamp01(A.back) };
      if (A.palm > 0) arm.palm = clamp01(A.palm);
      return arm;
    });
    return {
      t, s, h, facing, sx, V, legs, arms, pelvis, rT, rH, neck, breath, front, fr,
      back: clamp01(V.back), look: V.look, lift: V.lift, blink: blinkAt(t),
      breeze: o.breeze == null ? 0.35 : clamp01(o.breeze),
      wind: (o.wind === 1 ? 1 : -1) * facing,
      wDance, phi,
    };
  }

  function exprOf(o) {
    const E = {};
    for (const k of EKEYS) E[k] = 0;
    E.mouthW = 1;
    for (const [name, w] of weights(o.expr, 'neutral')) {
      const e = EXPR[name] || EXPR.neutral;
      for (const k of EKEYS) {
        const v = e[k] != null ? e[k] : k === 'mouthW' ? 1 : 0;
        E[k] += (v - (k === 'mouthW' ? 1 : 0)) * w;
      }
    }
    return E;
  }

  const H_RELAX = [[-1, -5.5], [6, -6.8], [12, -5.6], [15.5, -2], [15, 2.8], [11.5, 5.8], [7, 6.2], [8, 9.6], [5, 11.2], [1.5, 8.4], [-1, 5.5]];
  const H_OPEN = [[-1, -5.2], [9, -6.6], [21, -6.2], [27, -4], [27.5, 0.6], [21, 3.6], [11, 4.8], [13, 9.2], [10, 11.6], [2.5, 8.2], [-1, 5.2]];
  function handPart(ctx, K, arm, far, outfit) {
    const c = far ? MF.skin : MC.skin;
    frame(ctx, K, arm.wrist, arm.handA, (K1) => scaled(ctx, K1, 1.15, (K) => {
      if (arm.palm > 0.5) {
        palmUpHand(ctx, K, c);
        return;
      }
      if (arm.back > 0.5) {
        const palm = [[-1, -5.5], [10, -7], [13.5, -5], [13.5, 5.5], [10, 7.5], [-1, 6]];
        const fingers = [[5, 5.0, 12.5], [1.6, 2.1, 15], [-1.8, 2.0, 14], [-5, 1.8, 10.5]];
        const parts = [blob(palm, 0.6)];
        for (const [y, r, len] of fingers) {
          const a = y * 0.022;
          parts.push(capsule(12, y * 0.9, r + 0.4, 12 + Math.cos(a) * len, y * 0.9 + Math.sin(a) * len, r));
        }
        parts.push(capsule(5, 6, 3, 13, 12.5, 2.4));
        cel(ctx, K, parts, c, 2.5);
        for (const [y] of fingers.slice(1)) line(ctx, K, [[12.5, y * 0.9 - 2.2 + (y > 0 ? 0 : 0.6)], [16, y * 0.9 - 1.9]], 0.3, 0.5);
        for (const [y] of fingers) line(ctx, K, [[10.5, y * 0.9 - 0.8], [11.5, y * 0.9 + 0.8]], 0.3, 0.35);
        return;
      }
      const pts = H_RELAX.map((p, i) => mixP(p, H_OPEN[i], arm.open));
      cel(ctx, K, [blob(pts, 0.95)], c, 2.6);
      line(ctx, K, [mixP([7, 6], [10.5, 4.6], arm.open), mixP([5, 8.4], [6.5, 8], arm.open)], 0.36, 0.7);
      if (arm.open > 0.3) {
        line(ctx, K, [[14, -3.3], [26, -2.6]], 0.3, 0.7 * arm.open);
        line(ctx, K, [[13.5, -0.4], [26, 0.2]], 0.3, 0.6 * arm.open);
      }
      void outfit;
    }));
  }
  const PALM_FINGERS = [[3.6, 1.55, 12.5, 0.14], [1.2, 1.65, 14, 0.04], [-1.2, 1.6, 13.5, -0.06], [-3.6, 1.4, 11, -0.18]];
  const PALM_FACE = hmix(MC.skin.base, '#FFE6D2', 0.55);
  function palmUpHand(ctx, K, c) {
    const palm = [[-1, -4.6], [5, -5.6], [12, -5.4], [14.8, -3], [14.8, 4.2], [11.5, 6.4], [4, 6.4], [-1, 4.8]];
    const parts = [blob(palm, 0.8)];
    for (const [y, r, len, fan] of PALM_FINGERS) {
      const a = fan * 0.6;
      const m = [12.5 + Math.cos(a) * len * 0.7, y + Math.sin(a) * len * 0.7];
      const b = a - 0.22;
      parts.push(capsule(12.5, y, r + 0.3, m[0], m[1], r));
      parts.push(capsule(m[0], m[1], r, m[0] + Math.cos(b) * len * 0.3, m[1] + Math.sin(b) * len * 0.3, r * 0.92));
    }
    parts.push(capsule(4, 4.4, 2.9, 12, 9.6, 2.2));
    cel(ctx, K, parts, c, 2.4);
    const far = c !== MC.skin;
    ctx.save();
    ctx.fillStyle = far ? hmix(PALM_FACE, c.base, 0.5) : PALM_FACE;
    ctx.beginPath();
    oval(7.6, -0.2, 6.4, 3.9, -0.04)(ctx);
    ctx.fill();
    ctx.restore();
    line(ctx, K, [[2, 2.2], [7, 0.8], [13, -0.8]], 0.32, 0.55);
    line(ctx, K, [[2.5, -2.2], [7, -2], [11, -3]], 0.28, 0.4);
    for (let i = 0; i < PALM_FINGERS.length - 1; i++) {
      const y = (PALM_FINGERS[i][0] + PALM_FINGERS[i + 1][0]) / 2, a = (PALM_FINGERS[i][3] + PALM_FINGERS[i + 1][3]) * 0.3;
      line(ctx, K, [[14.5, y], [14.5 + Math.cos(a) * 7, y + Math.sin(a) * 7]], 0.3, 0.6);
    }
  }

  const RING_AT = (back) => (back > 0.5 ? [21.3, -1.8] : [14.4, -1.4]);
  const ringAt = (A) => (A.palm > 0.5 ? [15.5, -1.3] : RING_AT(A.back));

  function armPart(ctx, K, R, side, out) {
    const far = side === 1;
    const A = R.arms[side];
    const c = far ? MF.skin : MC.skin;
    const { shoulder: s, elbow: e, wrist: w } = A;
    handPart(ctx, K, A, far, out);
    const parts = [capsule(s[0], s[1], 7.6, e[0], e[1], 5.8), capsule(e[0], e[1], 5.8, w[0], w[1], 4.4)];
    cel(ctx, K, parts, c, 4.2);
    const cloth = far ? farTone(out.cloth) : out.cloth;
    const ua = sub(e, s), ul = Math.hypot(ua[0], ua[1]) || 1;
    if (out.sleeve === 'short') {
      const m = add(s, mul(ua, 0.52));
      cel(ctx, K, [capsule(s[0], s[1], 9.4, m[0], m[1], 8.2)], cloth, 4);
      const n = [-ua[1] / ul, ua[0] / ul];
      line(ctx, K, [add(m, mul(n, 7.5)), add(m, mul(n, -7.5))], 0.4, 0.55);
    } else if (out.sleeve === 'bell') {
      const fd = sub(w, e), fl = Math.hypot(fd[0], fd[1]) || 1;
      const u = [fd[0] / fl, fd[1] / fl];
      const cuff = sub(w, mul(u, 3));
      const t = R.t;
      const sway = Math.sin(t * 2.1 + side * 1.7) * 3 * (0.4 + R.breeze);
      const drop = [R.wind * R.breeze * 6 + sway, 12 + 2 * Math.sin(t * 1.6 + side)];
      const n = [-u[1], u[0]];
      const nn = n[1] > 0 ? n : mul(n, -1);
      const bell = [
        add(e, mul(nn, -5.5)), add(e, mul(nn, 6)),
        add(add(mixP(e, cuff, 0.55), mul(nn, 11)), mul(drop, 0.35)),
        add(add(cuff, mul(nn, 16)), drop),
        add(add(cuff, [u[0] * 7, u[1] * 7]), add(mul(nn, 9), mul(drop, 0.7))),
        add(cuff, add(mul(u, 4), mul(nn, -5))),
      ];
      cel(ctx, K, [capsule(s[0], s[1], 8.6, e[0], e[1], 7), blob(bell, 0.9)], cloth, 4.5);
      line(ctx, K, [add(mixP(e, cuff, 0.4), mul(nn, 2)), add(add(cuff, mul(nn, 12)), mul(drop, 0.8))], 0.34, 0.45);
      if (out.chiffonHem) {
        ctx.save();
        ctx.globalAlpha *= 0.42;
        ctx.fillStyle = out.chiffon;
        const tip = add(add(cuff, mul(nn, 21)), mul(drop, 1.3));
        ctx.beginPath();
        spline(ctx, oriented([add(cuff, mul(nn, 6)), add(add(cuff, mul(nn, 16)), drop), tip, add(add(cuff, mul(u, 10)), add(mul(nn, 12), drop))]), true, 0.9);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  function legPart(ctx, K, leg, far, out) {
    const c = far ? MF.skin : MC.skin;
    footPart(ctx, K, leg, far, out);
    const { hip, knee, ankle } = leg;
    const d = sub(ankle, knee), dl = Math.hypot(d[0], d[1]) || 1;
    const calf = add(knee, mul(d, 0.32));
    const back = [-d[1] / dl, d[0] / dl];
    const parts = [
      capsule(hip[0], hip[1], 13, knee[0], knee[1], 7.4),
      capsule(knee[0], knee[1], 7.4, ankle[0], ankle[1], 4.4),
      oval(calf[0] - back[0] * 1.8, calf[1] - back[1] * 1.8, 7.6, 14, Math.atan2(d[1], d[0]) - Math.PI / 2),
    ];
    cel(ctx, K, parts, c, 5.5);
  }

  function footPart(ctx, K, leg, far, out) {
    const shoe = out.feet === 'shoe';
    const c = shoe ? (far ? farTone(out.feetC) : out.feetC) : far ? MF.skin : MC.skin;
    frame(ctx, K, leg.ankle, leg.phi, (K) => {
      if (shoe) {
        const up = [[-8, -5], [0, -3.5], [9, 0], [17, 3], [24, 5], [27, 8], [26, 11], [-11, 11], [-13.5, 7], [-11.5, 0]];
        cel(ctx, K, [blob(up, 0.9)], c, 3);
        line(ctx, K, [[-11, 8.6], [8, 9.2], [25.5, 9]], 0.36, 0.5);
        line(ctx, K, [[6, -1], [9.5, 3.4], [15, 4.4]], 0.36, 0.55);
      } else {
        const foot = [[-7.5, -6], [0, -5], [8, -1.5], [16, 3], [23, 5.2], [26.5, 7.6], [25, 10.4], [-10, 10.4], [-12.8, 7], [-11.2, 0]];
        cel(ctx, K, [blob(foot, 0.9)], c, 3);
        line(ctx, K, [[21, 6.4], [22.5, 9.4]], 0.3, 0.45);
        line(ctx, K, [[17.5, 5], [18.8, 9.2]], 0.3, 0.35);
      }
    });
  }

  const T34 = [[4, -70], [14, -68], [20, -64], [23, -57], [27, -49], [28, -42], [24, -35], [19, -29], [21, -20], [26, -9], [28, 1], [25, 9], [0, 12], [-25, 9], [-28, -1], [-25, -13], [-20, -27], [-21, -40], [-24, -52], [-23, -62], [-12, -69]];
  const TFR = [[6, -70], [14, -69], [21, -65], [24, -57], [24, -48], [23, -41], [21, -35], [19, -29], [21, -20], [25, -9], [27, 1], [24, 9], [0, 12], [-24, 9], [-27, 1], [-25, -9], [-19, -27], [-21, -41], [-24, -53], [-21, -65], [-10, -70]];

  function necklineRegion(kind, fr) {
    const k = (a, b) => mixP(a, b, fr);
    if (kind === 'collar') return [[-40, -76], [40, -76], [40, 30], [-40, 30]];
    if (kind === 'scoop') return [[-40, -60], k([-14, -64], [-14, -63]), k([0, -55], [0, -54]), k([16, -61], [14, -63]), [40, -62], [40, 30], [-40, 30]];
    if (kind === 'sweetheart') return [[-40, -46], k([-20, -50], [-20, -50]), k([2, -51], [-9, -52]), k([9, -45], [0, -46]), k([22, -52], [11, -52]), k([30, -50], [22, -50]), [40, -46], [40, 30], [-40, 30]];
    if (kind === 'straps' || kind === 'suit') return [[-40, -52], k([-18, -54], [-18, -54]), k([2, -50], [0, -48]), k([26, -54], [18, -54]), [40, -54], [40, 30], [-40, 30]];
    return [[-40, 30], [40, 30], [40, 31], [-40, 31]];
  }
  const poly = (pts) => (ctx) => {
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
  };

  function torsoPart(ctx, K, R, out) {
    frame(ctx, K, R.pelvis, R.rT, (K) => {
      const by = 0.42 * R.breath;
      const pts = mixPts(T34, TFR, R.fr).map((p) => [p[0] + (p[0] > 0 && p[1] < -36 && p[1] > -58 ? 0.35 * R.breath : 0), p[1] - (p[1] < -40 ? by : 0)]);
      const body = [blob(pts, 0.9)];
      cel(ctx, K, body, MC.skin, 10);
      const reg = necklineRegion(out.neck, R.fr);
      ctx.save();
      build(ctx, body);
      ctx.clip();
      build(ctx, [poly(reg)]);
      ctx.fillStyle = out.cloth.base;
      ctx.fill();
      ctx.restore();
      shade(ctx, K, [body, [poly(reg)]], body, out.cloth, 10, K.rim);
      const edge = reg.slice(1, reg.length - 3);
      if (out.neck !== 'collar' && edge.length > 1) {
        ctx.save();
        build(ctx, body);
        ctx.clip();
        line(ctx, K, [[-30, edge[0][1]], ...edge, [34, edge[edge.length - 1][1]]], 0.5, 0.9);
        ctx.restore();
      }
      const fx = lerp(12, 2, R.fr);
      if (out.neck === 'collar') nurseFront(ctx, K, R, out, fx);
      if (out.neck === 'straps') {
        const st = out.cloth;
        cel(ctx, K, [blob(ribbon([[-14, -54], [-13, -61], [-10, -68]], [4, 3.6, 3.2]), 0.9)], st, 1.5, 0);
        cel(ctx, K, [blob(ribbon([[lerp(19, 15, R.fr), -54], [lerp(15, 14, R.fr), -61], [lerp(11, 13, R.fr), -67]], [4, 3.6, 3.2]), 0.9)], st, 1.5, 0);
      }
      if (out.neck === 'suit') {
        cel(ctx, K, [blob(ribbon([[-15, -54], [-14, -62], [-11, -69]], [6, 5.5, 5]), 0.9)], out.cloth, 1.5, 0);
        cel(ctx, K, [blob(ribbon([[lerp(20, 15, R.fr), -54], [lerp(16, 15, R.fr), -62], [lerp(11, 14, R.fr), -68]], [6, 5.5, 5]), 0.9)], out.cloth, 1.5, 0);
        ctx.save();
        build(ctx, body);
        ctx.clip();
        line(ctx, K, [[-26, 2], [-10, 9], [4, 11]], 0.45, 0.7);
        line(ctx, K, [[6, 11], [18, 4], [27, -2]], 0.45, 0.7);
        ctx.restore();
      }
      if (out.neck === 'sweetheart') {
        ctx.save();
        build(ctx, body);
        ctx.clip();
        ctx.fillStyle = out.cloth.shade;
        ctx.globalAlpha *= 0.5;
        ctx.fillRect(-40, -33, 80, 5);
        ctx.restore();
        line(ctx, K, [[-26, -33.5], [0, -32], [28, -33.5]], 0.4, 0.6);
        line(ctx, K, [[fx - 2, -44], [fx - 1, -33]], 0.32, 0.4);
      }
      if (out.neck === 'scoop' || out.neck === 'straps') {
        line(ctx, K, [[fx + 6, -40], [fx + 4, -32]], 0.32, 0.4);
        line(ctx, K, [[fx - 8, -42], [fx - 9, -33]], 0.32, 0.35);
      }
    });
  }

  function nurseFront(ctx, K, R, out, fx) {
    line(ctx, K, [[fx, -64], [fx + 0.5, -40], [fx + 1, -10]], 0.4, 0.6);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#E4E2DC';
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(K.minLine, K.lw * 0.36);
      ctx.beginPath();
      ctx.arc(fx + 3.4, -56 + i * 14, 1.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
    const px = lerp(-9, -14, R.fr);
    cel(ctx, K, [blob([[px - 7, -50], [px + 6, -50], [px + 6, -40], [px - 7, -40]], 0.3)], out.cloth, 1.2, 0);
    cel(ctx, K, [blob([[px - 3.5, -55], [px - 1.6, -55], [px - 1.6, -46], [px - 3.5, -46]], 0.3)], { base: '#3E5C9A', shade: '#2C4374', rim: '#7088C0' }, 0.8, 0);
    const nx = lerp(17, 12, R.fr);
    cel(ctx, K, [blob([[nx - 4, -52], [nx + 5, -52], [nx + 5, -48.5], [nx - 4, -48.5]], 0.2)], { base: '#2A2724', shade: '#1A1816', rim: '#56504A' }, 0.6, 0);
    line(ctx, K, [[nx - 2.5, -50.3], [nx + 3.5, -50.3]], 0.22, 0.85, '#E9E4D8');
    ctx.save();
    build(ctx, [blob(mixPts(T34, TFR, R.fr), 0.9)]);
    ctx.clip();
    ctx.fillStyle = 'rgba(40,50,60,0.08)';
    ctx.fillRect(-40, -33, 80, 6);
    ctx.restore();
    line(ctx, K, [[-26, -33], [0, -32], [28, -33]], 0.4, 0.55);
    line(ctx, K, [[-26, -27], [0, -26], [28, -27]], 0.4, 0.55);
    const c = R.fr;
    cel(ctx, K, [blob([[-11, -71], [lerp(2, -1, c), -71], [lerp(1, -3, c), -59, 1], [-12, -64]], 0.6)], out.cloth, 2);
    cel(ctx, K, [blob([[lerp(6, 1, c), -71], [lerp(17, 12, c), -70], [lerp(15, 11, c), -63], [lerp(4, 3, c), -58, 1]], 0.6)], out.cloth, 2);
  }

  function stethoscope(ctx, K, R) {
    frame(ctx, K, R.pelvis, R.rT, (K) => {
      const fx = lerp(12, 2, R.fr);
      const sw = 0.6 * Math.sin(R.t * 1.3);
      const tube = (pts) => {
        line(ctx, K, pts, 2.3, 1, INK);
        line(ctx, K, pts, 1.1, 1, '#3E454E');
      };
      tube([[-11, -66], [-10, -54], [fx - 5, -44 + sw]]);
      tube([[fx + 6, -67], [fx + 9, -55], [fx + 4, -42 + sw]]);
      tube([[fx - 4, -43 + sw], [fx, -40 + sw], [fx + 3, -41 + sw]]);
      ctx.fillStyle = '#C9CED4';
      ctx.strokeStyle = INK;
      ctx.lineWidth = K.lw * 0.9;
      ctx.beginPath();
      ctx.arc(fx - 1, -36 + sw, 3.4, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#EEF1F4';
      ctx.beginPath();
      ctx.arc(fx - 2, -37 + sw, 1.1, 0, TAU);
      ctx.fill();
    });
  }

  function hull(P) {
    const pts = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts) {
      while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
      lo.push(p);
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
      up.push(p);
    }
    up.pop();
    lo.pop();
    return lo.concat(up);
  }
  function alongLeg(leg, sl) {
    const a = dist(leg.hip, leg.knee);
    if (sl <= a) return { p: mixP(leg.hip, leg.knee, sl / a), d: sub(leg.knee, leg.hip) };
    const b = dist(leg.knee, leg.ankle) || 1;
    const k = (sl - a) / b;
    return { p: add(leg.knee, mul(sub(leg.ankle, leg.knee), k)), d: sub(leg.ankle, leg.knee) };
  }

  function skirtShape(R, sk, extra) {
    const V = R.V;
    const T = (q) => inFrame(R.pelvis, R.rT, q);
    const ex = extra || 0;
    const flare = sk.flare * (1 + 0.6 * V.flare) + ex * 0.6;
    const hemS = sk.hemS + ex;
    const P = [];
    const push = (p, hw) => P.push([p[0], p[1], 0, hw]);
    push(T([-19, -30]), 0); push(T([18, -30]), 0);
    push(T([-26, -4]), 0.1); push(T([27, -4]), 0.1);
    for (const leg of R.legs) {
      for (let i = 1; i <= 5; i++) {
        const u = i / 5;
        const { p, d } = alongLeg(leg, hemS * u);
        const dl = Math.hypot(d[0], d[1]) || 1;
        const n = [-d[1] / dl, d[0] / dl];
        const w = lerp(13, 8, u) + flare * Math.pow(u, 1.4);
        push(add(p, mul(n, w)), u);
        push(add(p, mul(n, -w)), u);
        if (i === 5) {
          push(add(p, [-w * 1.15, 0]), 1);
          push(add(p, [w * 1.15, 0]), 1);
        }
      }
    }
    let H = hull(P.map((p) => [p[0], p[1], p[3]]));
    const D = [];
    for (let i = 0; i < H.length; i++) {
      const a = H[i], b = H[(i + 1) % H.length];
      const n = Math.max(1, Math.ceil(dist(a, b) / 9));
      for (let j = 0; j < n; j++) {
        const k = j / n;
        D.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]);
      }
    }
    const t = R.t;
    const amp = (sk.ripple || 0.5) * (1.2 + 2.2 * V.flow + 2.4 * V.flare) + ex * 0.08;
    const wind = R.wind * R.breeze * 10;
    const out = D.map(([x, y, hw], i) => {
      const k = Math.pow(clamp01((hw - 0.35) / 0.65), 1.6);
      const ph = x * 0.09 + i * 0.05;
      let nx = x + k * (V.trail * 1.0 + wind + amp * 1.3 * Math.sin(t * 2.3 - ph + ex * 0.05));
      let ny = y + k * amp * 1.1 * Math.sin(t * 3.1 - x * 0.16 + ex * 0.07) - k * V.flare * 6;
      if (!R.lifted && ny > -0.5) ny = -0.5;
      return [nx, ny, hw];
    });
    return out;
  }

  function skirtPart(ctx, K, R, out) {
    const sk = out.skirt;
    if (!sk) return;
    if (out.chiffonHem) {
      const ch = skirtShape(R, sk, 14);
      ctx.save();
      ctx.globalAlpha *= 0.4;
      ctx.fillStyle = out.chiffon;
      ctx.beginPath();
      spline(ctx, oriented(ch.map((p) => [p[0], p[1]])), true, 0.9);
      ctx.fill();
      ctx.globalAlpha *= 0.6;
      ctx.strokeStyle = INK;
      ctx.lineWidth = K.lw * 0.8;
      ctx.stroke();
      ctx.restore();
    }
    const S = skirtShape(R, sk, 0);
    const pts = S.map((p) => [p[0], p[1]]);
    const part = [blob(pts, 0.9)];
    cel(ctx, K, part, out.cloth, 12);
    const hem = S.filter((p) => p[2] > 0.9).sort((a, b) => a[0] - b[0]);
    if (hem.length > 3) {
      ctx.save();
      build(ctx, part);
      ctx.clip();
      const T = (q) => inFrame(R.pelvis, R.rT, q);
      const wB = T([-16, -24]), wF = T([16, -24]);
      for (const f of [0.22, 0.48, 0.74]) {
        const top = mixP(wB, wF, f);
        const hp = hem[Math.min(hem.length - 1, Math.round(f * (hem.length - 1)))];
        const mid = add(mixP(top, hp, 0.6), [(hp[0] - top[0]) * 0.08, 0]);
        line(ctx, K, [add(top, [0, 16]), mid, [hp[0], hp[1] - 2]], 0.36, 0.42);
      }
      if (out.neck === 'sweetheart') {
        for (let i = 1; i < hem.length - 1; i += 2) line(ctx, K, [[hem[i][0] - 3, hem[i][1] - 5], [hem[i][0], hem[i][1] - 7], [hem[i][0] + 3, hem[i][1] - 5]], 0.28, 0.4);
      }
      ctx.restore();
    }
    if (out.sash) {
      frame(ctx, K, R.pelvis, R.rT, (K) => {
        const b = ribbon([[-21, -31], [0, -29.5], [22, -31]], [6, 6.5, 6]);
        cel(ctx, K, [blob(b, 0.8)], out.sash, 2, 0);
      });
    }
  }
  function sashTails(ctx, K, R, out) {
    if (!out.sash) return;
    const T = (q) => inFrame(R.pelvis, R.rT, q);
    const o0 = T([-20, -30]);
    const t = R.t;
    for (let j = 0; j < 2; j++) {
      const pts = [o0];
      let a = 0.05 + j * 0.16;
      for (let i = 1; i <= 5; i++) {
        a += (-R.wind * R.breeze * 0.08 - R.V.trail * 0.004) * (i / 5) + 0.05 * Math.sin(t * 2.4 - i * 0.9 + j * 1.3);
        const prev = pts[pts.length - 1];
        pts.push(add(prev, [-Math.sin(a) * 8, Math.cos(a) * 8]));
      }
      cel(ctx, K, [blob(ribbon(pts, [5, 5.5, 5.5, 5, 4.5, 2], true), 0.9)], out.sash, 2, 0);
    }
  }

  const LOCKS = [
    [[-34, -60], [-46, -50], 132, 54, 0.5],
    [[-54, -36], [-58, -26], 138, 54, 0.36],
    [[-60, -6], [-62, -2], 134, 48, 0.22],
    [[-48, 20], [-58, 18], 124, 42, 0.1],
    [[52, -40], [52, -38], 108, 34, -0.22],
    [[58, -14], [58, -8], 100, 28, -0.1],
  ];
  function lockPts(R, L, j) {
    const [a34, aF, len, , ang0] = L;
    const fr = R.fr;
    const anc = inFrame(R.neck, R.rH, mul([6 + lerp(a34[0], aF[0], fr), -66 + lerp(a34[1], aF[1], fr)], HS));
    const n = 7;
    const seg = (len * HS) / n;
    const t = R.t;
    const V = R.V;
    const pts = [anc];
    const side = ang0 >= 0 ? -1 : 1;
    const a0 = lerp(ang0, side * Math.abs(ang0) * 0.6 + (side < 0 ? 0.2 : -0.1), fr);
    let p = anc;
    for (let i = 1; i <= n; i++) {
      const u = i / n;
      const grav = lerp(1, 0.45, V.float);
      let a = lerp(a0, 0, sstep(0, 0.55 / grav, u)) * -1;
      a += R.wind * -1 * R.breeze * (0.06 + 0.42 * Math.pow(u, 1.4)) * (0.7 + 0.3 * Math.sin(t * 1.05 + j * 0.9 + u * 1.5));
      a += 0.05 * Math.sin(t * 1.7 + j * 1.3 - u * 2.2) * (0.4 + R.breeze);
      a += -V.trail * 0.012 * u;
      a += V.float * 0.25 * Math.sin(t * 0.9 + j) * u;
      p = add(p, [-Math.sin(a) * seg, Math.cos(a) * seg * lerp(1, 0.8, V.float)]);
      const wv = 2.6 * Math.sin(u * 7.5 + j * 0.4 - t * (0.6 + R.breeze)) * Math.pow(u, 0.7);
      pts.push(add(p, [wv, 0]));
    }
    return pts;
  }
  function hairMass(R, idx) {
    const P = [];
    const centres = [];
    let top = 1e9, bot = -1e9;
    for (const j of idx) {
      const L = LOCKS[j];
      const pts = lockPts(R, L, j);
      const w0 = L[3] * HS;
      const widths = pts.map((_, i) => w0 * lerp(1, 0.45, Math.pow(i / (pts.length - 1), 2)));
      for (const q of ribbon(pts, widths, true)) {
        P.push([q[0], q[1], 0]);
        top = Math.min(top, q[1]);
        bot = Math.max(bot, q[1]);
      }
      centres.push(pts);
    }
    const H = hull(P);
    const D = [];
    for (let i = 0; i < H.length; i++) {
      const a = H[i], b = H[(i + 1) % H.length];
      const n = Math.max(1, Math.ceil(dist(a, b) / 6));
      for (let k = 0; k < n; k++) D.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]);
    }
    let cx = 0, cy = 0;
    for (const p of D) { cx += p[0]; cy += p[1]; }
    cx /= D.length; cy /= D.length;
    let arc = 0;
    const t = R.t;
    const out = D.map((p, i) => {
      const q = D[(i + 1) % D.length], o = D[(i + D.length - 1) % D.length];
      arc += dist(p, o);
      let nx = -(q[1] - o[1]), ny = q[0] - o[0];
      const m = Math.hypot(nx, ny) || 1;
      nx /= m; ny /= m;
      if (nx * (p[0] - cx) + ny * (p[1] - cy) < 0) { nx = -nx; ny = -ny; }
      const k = clamp01((p[1] - top) / (bot - top + 1e-3));
      const d = (1.2 + 2.6 * k) * Math.sin(arc * 0.13 - t * (0.8 + R.breeze));
      return [p[0] + nx * d, p[1] + ny * d];
    });
    return { pts: out, centres };
  }
  function longHair(ctx, K, R) {
    const masses = [hairMass(R, [0, 1, 2, 3]), hairMass(R, [4, 5])];
    const parts = masses.map((m) => blob(m.pts, 0.9));
    const centres = [].concat(...masses.map((m) => m.centres));
    cel(ctx, K, parts, MC.hair, 7);
    ctx.save();
    build(ctx, parts);
    ctx.clip();
    centres.forEach((pts, j) => {
      const off = (j % 2 ? 3 : -3);
      line(ctx, K, pts.slice(1, 6).map((p) => [p[0] + off, p[1]]), 0.42, 0.75, MC.sheen);
    });
    ctx.restore();
  }
  function frontLock(ctx, K, R) {
    const k = clamp01(1 - R.fr * 1.4) * R.V.lock;
    if (k <= 0.05) return;
    const t = R.t;
    const anc = inFrame(R.neck, R.rH, mul([6 - 36, -66 + 30], HS));
    const pts = [anc];
    let p = anc;
    const n = 6;
    const seg = (72 * k * HS) / n;
    for (let i = 1; i <= n; i++) {
      const u = i / n;
      let a = -0.15 + 0.32 * u + R.wind * -R.breeze * 0.25 * u * (0.7 + 0.3 * Math.sin(t * 1.2 + u));
      a += -R.V.trail * 0.01 * u;
      p = add(p, [-Math.sin(a) * seg, Math.cos(a) * seg]);
      pts.push(add(p, [2.4 * Math.sin(u * 7 - t * 0.8) * u, 0]));
    }
    const widths = pts.map((_, i) => 16 * HS * lerp(1, 0.25, i / n));
    const part = [blob(ribbon(pts, widths, true), 0.85)];
    cel(ctx, K, part, MC.hair, 4);
    ctx.save();
    build(ctx, part);
    ctx.clip();
    line(ctx, K, pts.slice(1, 5).map((q) => [q[0] + 1.5, q[1]]), 0.4, 0.7, MC.sheen);
    ctx.restore();
  }

  function veilPart(ctx, K, R, top) {
    const t = R.t;
    const comb = (q) => inFrame(R.neck, R.rH, mul([6 + q[0], -66 + q[1]], HS));
    const a = comb([-36, -68]), b = comb([-64, -26]);
    const w = R.wind * R.breeze;
    const sway = (k) => [w * 14 * k + 3 * Math.sin(t * 1.4 + k * 2) * k, 0];
    const pts = [
      a, b,
      add(add(b, [-8, 40]), sway(0.5)),
      add(add(b, [-14, 86]), sway(1)),
      add(add(b, [6, 92]), sway(1)),
      add(add(b, [24, 86]), sway(0.9)),
      add(add(a, [26, 40]), sway(0.3)),
    ];
    ctx.save();
    if (top) {
      ctx.globalAlpha *= 0.55;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      spline(ctx, oriented([a, comb([-50, -56]), b, comb([-48, -22]), comb([-30, -56])]), true, 0.9);
      ctx.fill();
      ctx.restore();
      for (let i = 0; i < 5; i++) {
        const q = comb([lerp(-34, -60, i / 4), lerp(-66, -30, i / 4)]);
        ctx.fillStyle = '#F6F0E4';
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(K.minLine, K.lw * 0.5);
        ctx.beginPath();
        ctx.arc(q[0], q[1], 2.6, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.arc(q[0] - 0.8, q[1] - 0.8, 0.9, 0, TAU);
        ctx.fill();
      }
      return;
    }
    ctx.globalAlpha *= 0.5;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    spline(ctx, oriented(pts), true, 0.9);
    ctx.fill();
    ctx.globalAlpha *= 0.6;
    ctx.strokeStyle = INK;
    ctx.lineWidth = K.lw * 0.9;
    ctx.stroke();
    ctx.restore();
  }

  const SK34 = [[0, -62], [46, -46], [62, -12], [64, 0], [66.5, 6], [62.5, 13], [56, 25], [39, 44], [19, 54], [-10, 52], [-40, 36], [-62, 4], [-50, -40]];
  const SKF = [[0, -62], [48, -42], [58, -14], [58, -2], [57, 8], [54, 18], [46, 32], [30, 47], [9, 56], [-9, 56], [-30, 47], [-56, 6], [-48, -42]];
  const CR34 = [[-46, 30], [-63, 10], [-69, -14], [-61, -44], [-39, -67], [-8, -77], [24, -73], [48, -58], [63, -36], [69, -12], [62, -2, 1], [56, -20], [42, -32], [24, -38], [6, -41], [-6, -38, 1], [-18, -30], [-28, -18], [-33, -2], [-35, 14], [-40, 26]];
  const CRF = [[-58, 30], [-65, 8], [-67, -18], [-57, -46], [-34, -67], [-6, -75], [24, -70], [48, -52], [61, -28], [64, -4], [60, 8, 1], [54, -14], [42, -30], [22, -40], [-2, -44], [-12, -40, 1], [-26, -36], [-42, -26], [-54, -8], [-60, 10], [-60, 26]];

  function headPart(ctx, K, R, E) {
    frame(ctx, K, R.neck, R.rH, (K0) => {
      cel(ctx, K0, [capsule(lerp(-1, -2, R.fr), 2, 8.6, lerp(3, 0, R.fr), -16, 8)], MC.skin, 4);
      scaled(ctx, K0, HS, (K) => {
        const cx = 6, cy = -66;
        const fr = R.fr;
        const lk = -33 * R.front + R.look * 6;
        const skull = mixPts(SK34, SKF, fr).map((p) => [cx + p[0] + (p[0] > 20 ? lk * 0.12 * (1 - fr) : 0), cy + p[1]]);
        const skin = [blob(skull, 1)];
        cel(ctx, K, skin, MC.skin, 18);
        const fx = cx + 33 + lk;
        const eyeY = cy + 15 - 3 * Math.max(0, R.look);
        const ex = [fx - 15 - 1.5 * fr, fx + 16 + 0 * fr];
        if (fr < 0.45) {
          const ea = 1 - fr / 0.45;
          ctx.save();
          ctx.globalAlpha *= ea;
          const earX = cx - 36 - 16 * fr, earY = cy + 14;
          cel(ctx, K, [oval(earX, earY, 8, 11, -0.15)], MC.skin, 3);
          line(ctx, K, [[earX + 3, earY - 5], [earX - 2.5, earY - 2], [earX - 1, earY + 3], [earX + 2.5, earY + 5]], 0.42, 0.7);
          ctx.fillStyle = '#F2C14E';
          ctx.strokeStyle = INK;
          ctx.lineWidth = Math.max(K.minLine, K.lw * 0.5);
          ctx.beginPath();
          ctx.arc(earX + 1, earY + 10, 2.6, 0, TAU);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
        const faceA = 1 - clamp01(R.back * 2.2);
        if (faceA > 0.01) {
          ctx.save();
          ctx.globalAlpha *= faceA;
          build(ctx, skin);
          ctx.clip();
          face(ctx, K, R, E, fx, ex, eyeY);
          ctx.restore();
        }
        const crown = mixPts(CR34, CRF, fr).map((p, i) => {
          const q = [cx + p[0], cy + p[1]];
          const c = (fr < 0.5 ? CR34 : CRF)[i];
          return c[2] ? [q[0], q[1], 1] : q;
        });
        const sw = Math.sin(R.t * 1.3) * 1.2 * (0.4 + R.breeze);
        crown[10][0] += sw; crown[11][0] += sw * 0.6;
        const hairP = [blob(crown, 0.85)];
        if (R.back > 0.02) {
          ctx.save();
          ctx.globalAlpha *= clamp01(R.back * 2.2);
          cel(ctx, K, [blob(skull.map((p) => [p[0] + (p[0] - cx) * 0.06, p[1] + (p[1] - cy) * 0.06]), 1)], MC.hair, 12);
          ctx.restore();
        }
        cel(ctx, K, hairP, MC.hair, 12);
        ctx.save();
        build(ctx, hairP);
        ctx.clip();
        ctx.lineCap = 'round';
        ctx.strokeStyle = MC.sheen;
        ctx.globalAlpha *= 0.85;
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.ellipse(cx - 2, cy - 4, 58, 56, 0, Math.PI * 1.18, Math.PI * 1.5);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.globalAlpha *= 0.7;
        ctx.beginPath();
        ctx.ellipse(cx + 2, cy - 2, 52, 50, 0, Math.PI * 1.55, Math.PI * 1.75);
        ctx.stroke();
        ctx.restore();
        const sc = MC.sheen;
        line(ctx, K, [[cx - 6, cy - 66], [cx + 14, cy - 54], [cx + 40, cy - 34]], 0.4, 0.8, sc);
        line(ctx, K, [[cx - 50, cy - 40], [cx - 56, cy - 14], [cx - 52, cy + 12]], 0.4, 0.6, sc);
      });
    });
  }

  function face(ctx, K, R, E, fx, ex, eyeY) {
    const fr = R.fr;
    const detail = sstep(380, 520, R.h);
    const bl = 0.22 + 0.45 * E.blush;
    for (let i = 0; i < 2; i++) {
      const bx = ex[i] + (i ? 6 : -6), byy = eyeY + 15;
      const rx = i ? lerp(7, 9, fr) : 9;
      const g = ctx.createRadialGradient(bx, byy, 0, bx, byy, rx);
      g.addColorStop(0, 'rgba(196,84,72,' + bl + ')');
      g.addColorStop(1, 'rgba(196,84,72,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(bx, byy, rx, rx * 0.62, 0, 0, TAU);
      ctx.fill();
    }
    const blink = R.blink;
    const close = Math.max(blink, E.happy, E.squeeze);
    const lid = clamp01(E.lid);
    for (let i = 0; i < 2; i++) {
      const x = ex[i], y = eyeY;
      const rx = lerp(i ? 4.6 - R.look * 0.6 : 5.5, 5.1, fr) * (1 + 0.5 * E.eyeOpen);
      const ry0 = 8.2 * (1 + E.eyeOpen);
      const ry = ry0 * (1 - 0.82 * close);
      const outer = i ? 1 : -1;
      if (close < 0.75) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(x, y + 1.5 * close, rx, Math.max(1.4, ry), 0, 0, TAU);
        ctx.fillStyle = MC.eyeDot;
        ctx.fill();
        ctx.clip();
        if (detail > 0 && close < 0.4) {
          ctx.globalAlpha *= detail;
          const ig = ctx.createRadialGradient(x, y + ry * 0.2, 0, x, y + ry * 0.1, rx * 0.95);
          ig.addColorStop(0, MC.irisLight);
          ig.addColorStop(0.55, MC.iris);
          ig.addColorStop(1, MC.irisDeep);
          ctx.fillStyle = ig;
          ctx.beginPath();
          ctx.ellipse(x, y + ry * 0.12, rx * 0.8, ry * 0.74, 0, 0, TAU);
          ctx.fill();
          ctx.fillStyle = MC.eyeDot;
          ctx.beginPath();
          ctx.ellipse(x, y + ry * 0.14, rx * 0.38, ry * 0.36, 0, 0, TAU);
          ctx.fill();
          ctx.globalAlpha /= detail;
        }
        if (lid > 0) {
          ctx.fillStyle = MC.skin.base;
          ctx.fillRect(x - rx - 2, y - ry - 2, rx * 2 + 4, ry * 2 * lid * 0.55 + 2);
        }
        ctx.restore();
        if (close < 0.4) {
          const a = 0.92 * (1 - close / 0.4);
          const hx = x + 1.8 * (K.lx > 0 ? 1 : -1);
          const hy = y - 3.2 + ry0 * lid * 0.5;
          ctx.fillStyle = 'rgba(255,248,232,' + a + ')';
          ctx.beginPath();
          ctx.arc(hx, hy, 1.7 + 0.9 * detail + 0.7 * E.gloss, 0, TAU);
          ctx.fill();
          if (detail > 0.2 || E.gloss > 0.3) {
            ctx.fillStyle = 'rgba(255,248,232,' + a * Math.max(detail, E.gloss) * 0.8 + ')';
            ctx.beginPath();
            ctx.arc(x - 1.6 * (K.lx > 0 ? 1 : -1), y + ry * 0.45, 0.9 + 0.5 * detail, 0, TAU);
            ctx.fill();
          }
        }
        const ly = y - ry * (1 - lid * 0.55) + 1;
        line(ctx, K, [[x - outer * rx * 0.9, ly + 1.6], [x, ly - 0.6], [x + outer * rx * 0.95, ly + 0.8], [x + outer * (rx + 3.2), ly - 2.4]], 0.62, 0.95 * (1 - close / 0.75));
      }
      if (close >= 0.5) {
        const a = clamp01((close - 0.5) / 0.25);
        let pts;
        if (E.happy >= Math.max(blink, E.squeeze)) pts = [[x - rx - 1.5, y + 2], [x, y - 2.5], [x + rx + 1.5, y + 2]];
        else if (E.squeeze > blink) pts = [[x - rx - 1.5, y - 0.5], [x, y + 3], [x + rx + 1.5, y - 0.5]];
        else pts = [[x - rx - 1.5, y + 1], [x, y + 3.5], [x + rx + 1.5, y + 1]];
        line(ctx, K, pts, 0.62, a, MC.eyeDot);
        line(ctx, K, [[x + outer * (rx + 1), pts[2][1] - (outer > 0 ? 0 : 0)], [x + outer * (rx + 3.5), pts[2][1] - 2.5]], 0.5, a * 0.8, MC.eyeDot);
      }
      if (E.tear > 0.02 || E.stream > 0.02) {
        const tx = x + outer * (rx * 0.4), ty = y + ry0 * 0.75;
        ctx.save();
        if (E.stream > 0.02) {
          const ph = (R.t * 0.8 + i * 0.37) % 1;
          ctx.globalAlpha *= 0.55 * E.stream;
          ctx.strokeStyle = MC.tear;
          ctx.lineCap = 'round';
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.quadraticCurveTo(tx + outer * 3, ty + 12, tx + outer * 1.5, ty + 18 + 6 * ph);
          ctx.stroke();
          ctx.globalAlpha /= 0.55;
          ctx.fillStyle = MC.tear;
          ctx.beginPath();
          ctx.arc(tx + outer * 1.5, ty + 19 + 8 * ph, 2.2, 0, TAU);
          ctx.fill();
        }
        if (E.tear > 0.02) {
          ctx.globalAlpha = Math.min(1, E.tear);
          ctx.fillStyle = MC.tear;
          ctx.strokeStyle = INK;
          ctx.lineWidth = Math.max(K.minLine, K.lw * 0.35);
          ctx.beginPath();
          ctx.moveTo(tx, ty - 1);
          ctx.quadraticCurveTo(tx + 2.8, ty + 3.6, tx, ty + 5.2);
          ctx.quadraticCurveTo(tx - 2.8, ty + 3.6, tx, ty - 1);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.beginPath();
          ctx.arc(tx - 0.7, ty + 2.6, 0.8, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
      }
    }
    const lift = -E.brow + 0.8 * E.squeeze - 0.8 * blink + 1.5 * E.lid;
    for (let i = 0; i < 2; i++) {
      const bx = ex[i] + (i ? 1.5 : -1.5), by = eyeY - 19 + lift;
      const inner = i ? -1 : 1;
      const len = lerp(i ? 10.5 : 12.5, 12, fr);
      const a = -inner * (0.34 * E.worry - 0.06);
      const p0 = add([bx, by], rot([(-len / 2) * inner, 0], a));
      const p1 = add([bx, by], rot([(len / 2) * inner, 0], a));
      const mid = [(p0[0] + p1[0]) / 2 - inner * 1, (p0[1] + p1[1]) / 2 - 2.6 + 1.5 * E.worry];
      const rb = ribbon([p1, mid, p0], [1.2, 3.2, 2.6]);
      ctx.fillStyle = MC.hair.base;
      ctx.beginPath();
      spline(ctx, oriented(rb), true, 0.9);
      ctx.fill();
    }
    const mx = fx + 3 - 2 * fr, my = eyeY + 24;
    const w = 7.5 * E.mouthW;
    const sm = E.smile, op = E.open;
    if (op > 0.05) {
      const top = my - 1.5 * sm;
      const depth = 4 + 9 * op;
      const pts = sm >= 0
        ? [[mx - w - 1.5, top - 1.5], [mx, top + 0.8], [mx + w * 0.85 + 1.5, top - 1.5, 1], [mx + w * 0.4, top + depth * 0.85], [mx - w * 0.3, top + depth * 0.8]]
        : [[mx - w * 1.1, top + 5, 1], [mx - w * 0.5, top + 0.4], [mx + w * 0.2, top - 0.6], [mx + w, top + 4.5, 1], [mx + w * 0.75, top + depth + 2], [mx - w * 0.85, top + depth + 2.4]];
      const mp = [blob(pts, 0.8)];
      build(ctx, mp);
      ctx.fillStyle = MC.mouth;
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(K.minLine, K.lw * 0.7);
      ctx.lineJoin = 'round';
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = MC.tongue;
      ctx.beginPath();
      ctx.ellipse(mx + 0.5, top + depth * (sm >= 0 ? 0.95 : 1.25), w * 0.55, depth * 0.38, 0, 0, TAU);
      ctx.fill();
      if (sm >= 0) {
        ctx.fillStyle = '#F4EEE6';
        ctx.fillRect(mx - w, top - 4, w * 2, 3.4);
      }
      ctx.restore();
      build(ctx, mp);
      ctx.stroke();
    } else if (E.oh > 0.05) {
      ctx.fillStyle = MC.mouth;
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(K.minLine, K.lw * 0.6);
      ctx.beginPath();
      ctx.ellipse(mx, my + 1, 2.6 * E.oh + 0.5, 3.4 * E.oh + 0.5, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
    } else if (Math.abs(sm) > 0.05) {
      const c = 3.4 * sm;
      const wob = sm < 0 ? 0.5 * Math.sin(R.t * 19) : 0;
      line(ctx, K, [[mx - w, my - c * 0.6], [mx - w * 0.2, my + c * 0.5 + wob], [mx + w * 0.8, my - c * 0.7]], 0.55, 0.95, MC.lip);
      if (sm > 0.4) line(ctx, K, [[mx + w * 0.8 - 0.5, my - c * 0.7 - 0.3], [mx + w * 0.8 + 1.8, my - c * 0.7 - 1.5]], 0.4, 0.6, MC.lip);
    }
  }

  let SCRATCH = null;
  function scratchFor(w, h) {
    if (typeof document === 'undefined') return null;
    if (!SCRATCH) SCRATCH = document.createElement('canvas');
    if (SCRATCH.width !== w) SCRATCH.width = w;
    if (SCRATCH.height !== h) SCRATCH.height = h;
    return SCRATCH;
  }

  function outfitOf(o) {
    let name = o.outfit || 'vision';
    if (name === 'beach' && o.swim) name = 'swim';
    return OUTFITS[name] || OUTFITS.vision;
  }

  function drawBody(ctx, o, R) {
    const out = outfitOf(o);
    const E = exprOf(o);
    const s = R.s;
    const L0 = Array.isArray(o.light) ? o.light : [0.78, -0.62];
    const lm = Math.hypot(L0[0], L0[1]) || 1;
    const lwPx = Math.max(2.5, 6 * s);
    const lx0 = (L0[0] / lm) * R.facing, ly0 = L0[1] / lm;
    const K = { lw: lwPx / s / 2, minLine: 1.15 / s, lx0, ly0, lx: lx0, ly: ly0, baseRot: 0, rim: Math.max(2.6, 1.2 / s) };
    R.lifted = R.lift < -2 || R.V.float > 0.5;
    ctx.save();
    ctx.translate(o.x || 0, o.y || 0);
    if (!(R.V.splash > 0.5)) {
      const up = clamp01(-R.lift / 60);
      ctx.save();
      ctx.scale(s * R.facing, s);
      ctx.translate(-10, 0);
      ctx.scale(1, 0.15);
      const rr = 80 * (1 - 0.35 * up);
      const g = ctx.createRadialGradient(0, 0, 8, 0, 0, rr);
      g.addColorStop(0, MC.shadow + 0.32 * (1 - 0.6 * up) + ')');
      g.addColorStop(0.6, MC.shadow + 0.18 * (1 - 0.6 * up) + ')');
      g.addColorStop(1, MC.shadow + '0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, rr, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.scale(s * R.facing * R.sx, s);
    if (R.lift) ctx.translate(0, R.lift);
    if (!(R.V.splash > 0.5) && !R.lifted) {
      for (const leg of R.legs) {
        const lift = -leg.ankle[1] - ANK;
        const a = 0.24 * clamp01(1 - lift / 16);
        if (a <= 0) continue;
        ctx.fillStyle = MC.shadow + a + ')';
        ctx.beginPath();
        ctx.ellipse(leg.ankle[0] + 6, 1, 21, 3.8, 0, 0, TAU);
        ctx.fill();
      }
    }
    if (R.V.splash > 0.5 && o.waterY != null) {
      const wl = (o.waterY - (o.y || 0)) / s - (R.lift || 0);
      ctx.beginPath();
      ctx.rect(-400, -800, 800, 800 + wl);
      ctx.clip();
    }
    const fromBehind = R.back > 0.5;
    if (!fromBehind) longHair(ctx, K, R);
    if (out.veil) veilPart(ctx, K, R, false);
    sashTails(ctx, K, R, out);
    armPart(ctx, K, R, 1, out);
    if (!(R.V.splash > 0.5)) {
      legPart(ctx, K, R.legs[1], true, out);
      legPart(ctx, K, R.legs[0], false, out);
    }
    torsoPart(ctx, K, R, out);
    skirtPart(ctx, K, R, out);
    if (out.neck === 'collar' && !fromBehind) stethoscope(ctx, K, R);
    if (fromBehind) longHair(ctx, K, R);
    frontLock(ctx, K, R);
    headPart(ctx, K, R, E);
    if (out.veil) veilPart(ctx, K, R, true);
    armPart(ctx, K, R, 0, out);
    if (R.V.splash > 0.5 && o.waterY != null) spray(ctx, R, (o.waterY - (o.y || 0)) / s - (R.lift || 0));
    ctx.restore();
  }

  function spray(ctx, R, wl) {
    ctx.save();
    for (const side of [0, 1]) {
      const w = R.arms[side].wrist;
      const near = clamp01(1.3 - Math.abs(w[1] - wl) / 60);
      if (near <= 0) continue;
      for (let k = 0; k < 14; k++) {
        const u = (R.t * 1.3 + k * 0.091 + side * 0.41) % 1;
        const vx = (k - 6) * 8 + 22;
        const vy = -(60 + 16 * (k % 3));
        const x = w[0] + 12 + vx * u, y = wl + vy * u * 2 + 90 * u * u;
        if (y > wl) continue;
        ctx.globalAlpha = 0.85 * near * (1 - u);
        ctx.fillStyle = k % 2 ? '#F2FBFF' : '#CDEFF4';
        ctx.beginPath();
        ctx.arc(x, y, 3.6 - 1.8 * u, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function ava(ctx, o) {
    o = o || {};
    const R = rig(o);
    const alpha = o.alpha == null ? 1 : clamp01(o.alpha);
    if (alpha <= 0) return;
    if (alpha >= 0.999) {
      ctx.save();
      drawBody(ctx, o, R);
      ctx.restore();
      return;
    }
    const cv = ctx.canvas;
    const sc = cv && typeof ctx.getTransform === 'function' ? scratchFor(cv.width, cv.height) : null;
    if (!sc) {
      ctx.save();
      ctx.globalAlpha *= alpha;
      drawBody(ctx, o, R);
      ctx.restore();
      return;
    }
    const c2 = sc.getContext('2d');
    c2.setTransform(1, 0, 0, 1, 0, 0);
    c2.globalAlpha = 1;
    c2.globalCompositeOperation = 'source-over';
    c2.clearRect(0, 0, sc.width, sc.height);
    c2.setTransform(ctx.getTransform());
    c2.save();
    drawBody(c2, o, R);
    c2.restore();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha *= alpha;
    ctx.drawImage(sc, 0, 0);
    ctx.restore();
  }

  ava.pose = function pose(o) {
    o = o || {};
    const R = rig(o);
    const s = R.s, f = R.facing * R.sx;
    const W = (p) => [(o.x || 0) + p[0] * s * f, (o.y || 0) + (p[1] + (R.lift || 0)) * s];
    const hd = (q) => W(inFrame(R.neck, R.rH, mul(q, HS)));
    const fx = 6 + 33 - 33 * R.front + R.look * 6;
    const eyeY = -66 + 15 - 3 * Math.max(0, R.look);
    const inHand = (A, q) => W(inFrame(A.wrist, A.handA, q));
    return {
      hands: R.arms.map((A) => W(A.wrist)),
      palms: R.arms.map((A) => inHand(A, A.back > 0.5 ? [8, 0] : [8, 0])),
      rings: R.arms.map((A) => inHand(A, ringAt(A))),
      handAngles: R.arms.map((A) => (f > 0 ? A.handA : Math.PI - A.handA)),
      head: hd([6, -66]),
      eyes: [hd([fx - 15, eyeY]), hd([fx + 16, eyeY])],
      mouth: hd([fx + 3, eyeY + 24]),
      chest: W(inFrame(R.pelvis, R.rT, [6, -46])),
      legs: R.legs.map((l) => ({ hip: W(l.hip), knee: W(l.knee), ankle: W(l.ankle), phi: l.phi, planted: l.planted, heel: W(add(l.ankle, rot(HEEL, l.phi))), ball: W(add(l.ankle, rot(BALL, l.phi))) })),
      facing: R.facing,
      scale: s,
    };
  };
  ava.STEP = AVA_STEP;
  ava.RUN_STEP = RUN_STEP;
  ava.POSES = Object.keys(POSES);
  ava.EXPRS = Object.keys(EXPR);
  ava.OUTFITS = ['vision', 'nurse', 'bride', 'beach'];

  FILM.cast.ava = ava;
})();
