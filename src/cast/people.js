// cast/people.js: character and prop builders (FILM.cast).
(function () {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const FILM = (root.FILM = root.FILM || {});
  FILM.cast = FILM.cast || {};
  const TAU = Math.PI * 2;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
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
  const unit = (v) => {
    const m = Math.hypot(v[0], v[1]) || 1;
    return [v[0] / m, v[1] / m];
  };

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
  const SHADOW = 'rgba(70,40,18,';

  const AH = 330;
  const KL = 143 / 124;
  const ANK = 14 * KL;
  const L1 = 57 * KL;
  const L2 = 55 * KL;
  const LMAX = (L1 + L2) * 0.997;
  const HIP_STAND = -124 * KL;
  const TORSO_DY = 6 * KL;
  const STEP_H = 0.38 * KL;
  const STEP = STEP_H * AH;
  const HEEL = [-15 * KL, ANK];
  const BALL = [24 * KL, ANK];
  const HIP_X = [-3 * KL, 4 * KL];
  const STAND_X = [-8 * KL, 11 * KL];
  const UA = 46, FA = 42;
  const HC = [4, -48];

  function ik(rootP, target, a, b, bend) {
    const d0 = dist(rootP, target);
    const d = Math.max(1e-3, Math.min(d0, (a + b) * 0.999, Math.max(d0, Math.abs(a - b) + 1e-3)));
    const base = Math.atan2(target[1] - rootP[1], target[0] - rootP[0]);
    const k = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
    const m1 = add(rootP, [Math.cos(base - k) * a, Math.sin(base - k) * a]);
    const m2 = add(rootP, [Math.cos(base + k) * a, Math.sin(base + k) * a]);
    let mid;
    if (bend === 'low') mid = m1[1] > m2[1] ? m1 : m2;
    else if (bend === 'high') mid = m1[1] < m2[1] ? m1 : m2;
    else mid = (m1[0] - m2[0]) * bend > 0 ? m1 : m2;
    const end = add(rootP, [((target[0] - rootP[0]) / (d0 || 1)) * d, ((target[1] - rootP[1]) / (d0 || 1)) * d]);
    return { mid, end };
  }

  function shoeAnkle(heelX, phi) {
    const pl = phi < 0 ? HEEL : BALL;
    const pivot = [heelX + (pl[0] - HEEL[0]), 0];
    return add(pivot, rot([-pl[0], -pl[1]], phi));
  }

  const HIP_KEYS = [[0, -113.5], [0.1, -108.5], [0.25, -125], [0.375, -126], [0.5, -113.5]].map((k) => [k[0], k[1] * KL]);
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
    return { ankle, phi, heelX, planted: true };
  }

  function swing(u, hipAtU) {
    const w = (u - 0.5) / 0.5;
    const e = stance(0.5, [hipAtU.x, hipY(hipAtU.p0)]);
    const s = stance(0, [hipAtU.x, hipY(hipAtU.p1)]);
    const w2 = w * w, w3 = w2 * w;
    const h00 = 2 * w3 - 3 * w2 + 1, h10 = w3 - 2 * w2 + w, h01 = -2 * w3 + 3 * w2, h11 = w3 - w2;
    const x = h00 * e.ankle[0] + h10 * (-0.4 * STEP) + h01 * s.ankle[0] + h11 * -STEP;
    const lift = 20 * KL * Math.pow(Math.sin(Math.PI * Math.pow(w, 0.95)), 1.6);
    let y = lerp(e.ankle[1], s.ankle[1], w) - lift;
    let phi;
    if (w < 0.2) phi = lerp(e.phi, Math.max(e.phi, 0.62), sstep(0, 0.2, w));
    else if (w < 0.62) phi = lerp(Math.max(e.phi, 0.62), 0.08, sstep(0.2, 0.62, w));
    else phi = lerp(0.08, s.phi, sstep(0.62, 1, w));
    const low = Math.max(rot(HEEL, phi)[1], rot(BALL, phi)[1], rot([36 * KL, 9 * KL], phi)[1]);
    if (y + low > 0) y = -low;
    return { ankle: [x, y], phi, planted: false };
  }

  function legWalk(u, p, side) {
    const hipX = HIP_X[side];
    if (u < 0.5) return stance(u, [hipX, hipY(p)]);
    return swing(u, { x: hipX, p0: p - (u - 0.5), p1: p + (1 - u) });
  }

  function blinkAt(t, off) {
    const tt = t + off;
    const slot = Math.floor(tt / 3);
    let c = 0;
    for (let k = slot - 1; k <= slot; k++) {
      const h = (Math.imul(k | 0, 0x2c1b3c6d) ^ 0x5f356495) >>> 0;
      const r = (((h ^ (h >>> 15)) * 2654435761) >>> 0) / 4294967296;
      const b0 = k * 3 + 0.5 + r;
      const x = (tt - b0) / 0.16;
      if (x >= 0 && x < 1) c = Math.max(c, x < 0.4 ? x / 0.4 : 1 - (x - 0.4) / 0.6);
    }
    return Math.min(1, c * 1.25);
  }

  function track(keys, u) {
    if (u <= keys[0][0]) return keys[0].slice(1);
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (u <= b[0]) {
        const k = sstep(0, 1, (u - a[0]) / (b[0] - a[0]));
        return a.slice(1).map((v, j) => lerp(v, b[j + 1], k));
      }
    }
    return keys[keys.length - 1].slice(1);
  }

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
  const sc = (pts, k) => pts.map((p) => (p[2] ? [p[0] * k, p[1] * k, 1] : [p[0] * k, p[1] * k]));

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
    const Lp = [], Rp = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let nx = -(b[1] - a[1]), ny = b[0] - a[0];
      const m = Math.hypot(nx, ny) || 1;
      nx /= m; ny /= m;
      const w = widths[i] / 2;
      Lp.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
      Rp.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
    }
    const tip = pts[pts.length - 1];
    const out = Lp.slice(0, -1);
    out.push(tipCorner ? [tip[0], tip[1], 1] : tip);
    for (let i = Rp.length - 2; i >= 0; i--) out.push(Rp[i]);
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

  function chip(ctx, K, parts, fill, w) {
    build(ctx, parts);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(K.minLine, K.lw * (w || 0.42));
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  function lcg(seed) {
    let s = seed >>> 0;
    return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  }
  const CAMO = (() => {
    const r = lcg(0x5eed1991);
    const blobs = [], chips = [];
    for (let i = 0; i < 130; i++) blobs.push([r() * 260 - 130, r() * 260 - 130, 7 + r() * 9, 4 + r() * 5, r() * Math.PI, r() < 0.55 ? 0 : 1]);
    for (let i = 0; i < 90; i++) chips.push([r() * 260 - 130, r() * 260 - 130, r() * Math.PI]);
    return { blobs, chips };
  })();

  function pattern(ctx, kind, clipParts, o, a, seed) {
    ctx.save();
    build(ctx, clipParts);
    ctx.clip();
    ctx.translate(o[0], o[1]);
    ctx.rotate(a);
    const off = [((seed * 37) % 90) - 45, ((seed * 53) % 90) - 45];
    if (kind === 'camo') {
      ctx.globalCompositeOperation = 'multiply';
      for (const b of CAMO.blobs) {
        ctx.fillStyle = b[5] ? '#B79C7C' : '#D9C3A0';
        ctx.beginPath();
        ctx.ellipse(b[0] + off[0], b[1] + off[1], b[2], b[3], b[4], 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      for (const c of CAMO.chips) {
        const x = c[0] + off[1], y = c[1] + off[0];
        ctx.fillStyle = 'rgba(38,30,22,0.85)';
        ctx.beginPath();
        ctx.ellipse(x, y, 2.4, 1.6, c[2], 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(246,238,222,0.8)';
        ctx.beginPath();
        ctx.ellipse(x + 2.6, y - 1.6, 1.8, 1.2, c[2], 0, TAU);
        ctx.fill();
      }
    } else if (kind === 'plaid') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#7A7FA6';
      for (let i = -8; i <= 8; i++) {
        ctx.fillRect(-200, i * 19 + off[0] * 0.2, 400, 7);
        ctx.fillRect(i * 19 + off[1] * 0.2, -200, 7, 400);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(244,214,160,0.32)';
      for (let i = -8; i <= 8; i++) {
        ctx.fillRect(-200, i * 19 + 12 + off[0] * 0.2, 400, 1.6);
        ctx.fillRect(i * 19 + 12 + off[1] * 0.2, -200, 1.6, 400);
      }
    } else if (kind === 'knit') {
      ctx.strokeStyle = 'rgba(90,40,40,0.16)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = -14; i <= 14; i++) {
        ctx.moveTo(i * 7, -200);
        ctx.lineTo(i * 7, 200);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  const SHOES = {
    flat: {
      upper: [[-11, 0], [-2, -2], [10, 1], [24, 4], [33, 7.5], [35, 11.5], [-13, 11.5], [-15, 5]],
      sole: [[-15, 10.5], [35, 10.5], [36, 13], [33, 14.5], [-13, 14.5], [-16, 13]],
      hem: 0,
    },
    shoe: {
      upper: [[-12, -8], [-2, -10], [8, -7], [14, -3], [26, 0], [34, 3], [37, 8], [36, 11], [-14, 11], [-17, 3]],
      sole: [[-16, 9], [37, 9], [38, 12], [35, 14.5], [-13, 14.5], [-17, 12.5]],
      hem: 8,
    },
    boot: {
      upper: [[-13, -27], [7, -27], [9, -12], [16, -4], [28, -1], [36, 4], [38, 9], [-15, 9], [-17, 0], [-15, -14]],
      sole: [[-17, 6], [38, 6], [39, 11], [36, 14.5], [-14, 14.5], [-18, 11]],
      hem: 19,
    },
  };

  const EXPR = {
    neutral: { eye: 'dot', brow: 0.08, lift: 0, mouth: null },
    sad: { eye: 'low', brow: 0.42, lift: 0.5, mouth: null },
    cry: { eye: 'squeeze', brow: 0.5, lift: 1, mouth: 'cry', tears: 1 },
    worried: { eye: 'dot', brow: 0.48, lift: -2.5, mouth: null },
    stern: { eye: 'narrow', brow: -0.42, lift: 2.5, mouth: null },
    shout: { eye: 'narrow', brow: -0.6, lift: 3, mouth: 'shout' },
    kind: { eye: 'kind', brow: 0.16, lift: -1, mouth: 'smile' },
    relieved: { eye: 'happy', brow: 0.3, lift: -2, mouth: 'smile' },
  };

  function hang(a, bend) {
    return { a, bend };
  }

  function solveArm(shoulder, spec, side) {
    let elbow, wrist;
    if (spec.target) {
      const r = ik(shoulder, spec.target, UA, FA, spec.bendDir == null ? 'low' : spec.bendDir);
      elbow = r.mid;
      wrist = r.end;
    } else {
      elbow = add(shoulder, [Math.sin(spec.a) * UA, Math.cos(spec.a) * UA]);
      wrist = add(elbow, [Math.sin(spec.a + spec.bend) * FA, Math.cos(spec.a + spec.bend) * FA]);
    }
    const fore = Math.atan2(wrist[1] - elbow[1], wrist[0] - elbow[0]);
    const handA = spec.handA != null ? spec.handA : fore + (spec.handBend == null ? 0.12 : spec.handBend);
    return { shoulder, elbow, wrist, handA, kind: spec.hand || 'relaxed', side };
  }

  const GRIP = { relaxed: [12, 2], pinch: [17, 0], fist: [9, 0], open: [16, -1], point: [9, 0], cup: [14, 0] };

  function rig(C, o) {
    const t = o.t || 0;
    const poseName = C.poses[o.pose] ? o.pose : C.defaultPose;
    const P = C.poses[poseName];
    const B = P.body(o, t, C);
    const wa = poseName === 'stand' || P.walks ? clamp01(o.walkAmt == null ? (o.walk ? 1 : 0) : o.walkAmt) : 0;
    const p = (((o.walk || 0) % 1) + 1) % 1;
    const breath = Math.sin((TAU * t) / 3.8 + C.phase);
    const look = Math.max(-1, Math.min(1, o.look || 0));
    const drop = B.drop || 0;
    const shiftX = B.shiftX || 0;
    const hy = lerp(HIP_STAND, hipY(p), wa) + drop;
    const feet = B.feet || [[STAND_X[0], 0], [STAND_X[1], 0]];
    const legs = [0, 1].map((side) => {
      const hip = [HIP_X[side] + shiftX, hy];
      const ax = feet[side][0], phi0 = feet[side][1];
      const still = phi0 === 0 ? [ax, -ANK] : shoeAnkle(ax + HEEL[0], phi0);
      let ankle = still, phi = phi0;
      if (wa > 0) {
        const u = (p + side * 0.5) % 1;
        const wk = legWalk(u, p, side);
        ankle = mixP(still, wk.ankle, wa);
        phi = lerp(phi0, wk.phi, wa);
      }
      const { mid: knee, end } = ik(hip, ankle, L1, L2, 1);
      return { hip, knee, ankle: end, phi };
    });

    const sob = B.sob ? B.sob * (0.45 + 0.55 * Math.pow(Math.sin(t * 2.3 + 0.4), 2)) : 0;
    const jerk = sob * (Math.sin(t * TAU * 4.1) * 0.7 + Math.sin(t * TAU * 6.3 + 1.1) * 0.3);
    const rT = (B.lean || 0) + 0.06 * wa;
    const pelvis = [shiftX, hy + TORSO_DY];
    const slump = (B.slump || 0) + jerk * 2.2;
    const T = (q) => inFrame(pelvis, rT, [q[0], q[1] - 0.5 * breath * (q[1] < -40 ? 1 : 0.3)]);
    const tw = C.tw;
    const sN = T([-tw * 0.48 + 2 * Math.cos(TAU * p) * wa, -73 + slump - (B.shrug || 0)]);
    const sF = T([tw * 0.92 - 2 * Math.cos(TAU * p) * wa, -74 + slump * 0.8 - (B.shrug || 0)]);
    const neck = T([4 + (B.neckX || 0), -84 + slump * 0.6]);
    const rH = rT + (B.tilt || 0) + 0.06 * wa - 0.2 * Math.max(0, look) + jerk * 0.02;
    const headO = add(neck, rot(B.headOff || [0, 0], rT));
    const H = (x, y) => inFrame(headO, rH, [HC[0] + x, HC[1] + y]);
    const J = { sN, sF, neck, headO, rH, rT, pelvis, T, H, legs, t, C, o, wa, p };

    let arms;
    if (wa > 0 && poseName === 'stand') {
      const swingA = 0.5 * wa;
      const ph = TAU * (p - 0.04);
      const mk = (side) => {
        const sgn = side === 0 ? -1 : 1;
        const a = sgn * swingA * Math.cos(ph) - 0.04;
        const fwd = clamp01((a / (swingA || 1) + 1) / 2);
        return hang(a, 0.1 + 0.34 * fwd * wa + 0.16 * (1 - wa));
      };
      arms = [mk(0), mk(1)];
    } else {
      arms = P.arms(o, t, J, C);
    }
    const toLocal = (q) => [((q[0] - (o.x || 0)) / J.s) * J.f, (q[1] - (o.y || 0)) / J.s];
    J.s = Math.max(20, o.h || AH) / AH;
    J.f = o.facing === -1 ? -1 : 1;
    const over = [o.target, o.target2];
    for (let i = 0; i < 2; i++) {
      if (!over[i]) continue;
      const g = toLocal(over[i]);
      const sh = i ? sF : sN;
      const back = mul(unit(sub(g, sh)), (GRIP[arms[i].hand || 'relaxed'][0] || 10) * C.hand);
      arms[i] = Object.assign({}, arms[i], { target: sub(g, back), a: undefined });
    }
    const nearArm = solveArm(sN, arms[0], 0);
    const farArm = solveArm(sF, arms[1], 1);

    const exprName = EXPR[o.expr] ? o.expr : P.expr || C.expr;
    const E = Object.assign({}, EXPR[exprName], C.exprMod && C.exprMod[exprName]);
    const blink = E.eye === 'squeeze' || E.eye === 'happy' ? 0 : blinkAt(t, C.blinkOff);
    return {
      t, wa, p, breath, look, legs, pelvis, rT, rH, neck, headO, nearArm, farArm, poseName, B, J,
      nearBehind: P.nearBehind ? !!P.nearBehind(o, t) : false,
      E, exprName, blink, sob, jerk, extra: P.extra ? P.extra(o, t, J, nearArm, farArm) : null,
    };
  }

  function shoe(ctx, K, C, leg, far) {
    const S = SHOES[C.shoe];
    const c = far ? C.F.shoe : C.col.shoe;
    const cs = far ? C.F.sole : C.col.sole;
    frame(ctx, K, leg.ankle, leg.phi, (K) => {
      const up = sc(S.upper, KL), so = sc(S.sole, KL);
      cel(ctx, K, [blob(so, 0.8)], cs, 2.5, 0);
      cel(ctx, K, [blob(up, 0.9)], c, 4.5);
      if (C.shoe === 'boot') {
        for (let i = 0; i < 4; i++) line(ctx, K, [[5 * KL + i * 1.6, (-23 + i * 5) * KL], [10 * KL + i * 1.6, (-21 + i * 5) * KL]], 0.42, 0.8);
        line(ctx, K, [[24 * KL, -0.5 * KL], [22 * KL, 4 * KL], [24 * KL, 8 * KL]], 0.4, 0.7);
        line(ctx, K, [[-15 * KL, -14 * KL], [8.5 * KL, -12.5 * KL]], 0.36, 0.5);
      } else if (C.shoe === 'shoe') {
        line(ctx, K, [[6 * KL, -7 * KL], [12 * KL, -3.5 * KL]], 0.42, 0.85);
        line(ctx, K, [[9 * KL, -8 * KL], [14 * KL, -4.5 * KL]], 0.42, 0.85);
        line(ctx, K, [[-14 * KL, 6.5 * KL], [10 * KL, 7 * KL], [35 * KL, 6.5 * KL]], 0.36, 0.5);
      } else {
        line(ctx, K, [[-8 * KL, 3 * KL], [10 * KL, 4 * KL], [26 * KL, 6.5 * KL]], 0.36, 0.45);
      }
    });
  }

  function legPart(ctx, K, C, leg, far) {
    const c = far ? C.F.leg : C.col.leg;
    const [r1, r2, r3] = C.legR;
    const { hip, knee, ankle } = leg;
    const dir = sub(ankle, knee);
    const dl = Math.hypot(dir[0], dir[1]) || 1;
    const u = [dir[0] / dl, dir[1] / dl];
    const hem = sub(ankle, mul(u, SHOES[C.shoe].hem * KL));
    const parts = [capsule(hip[0], hip[1], r1, knee[0], knee[1], r2), capsule(knee[0], knee[1], r2, hem[0], hem[1], r3)];
    cel(ctx, K, parts, c, C.lower === 'skirt' ? 4 : 6.5);
    if (C.legPattern) {
      const th = Math.atan2(knee[1] - hip[1], knee[0] - hip[0]);
      pattern(ctx, C.legPattern, parts, hip, th, far ? 7 : 3);
    }
    if (C.lower !== 'skirt') {
      const kd = rot(u, -Math.PI / 2);
      line(ctx, K, [add(knee, [-kd[0] * 6 - 4, -kd[1] * 6]), add(knee, [-kd[0] * 9 - 1, -kd[1] * 9 + 5])], 0.42, 0.5);
      const n = [-u[1], u[0]];
      line(ctx, K, [add(hem, [n[0] * r3 * 0.85 - u[0] * 3, n[1] * r3 * 0.85 - u[1] * 3]), add(hem, [-n[0] * r3 * 0.85 - u[0] * 3, -n[1] * r3 * 0.85 - u[1] * 3])], 0.38, 0.45);
      if (C.shoe === 'boot') {
        line(ctx, K, [add(hem, [n[0] * r3 * 0.9 - u[0] * 8, n[1] * r3 * 0.9 - u[1] * 8]), add(hem, [-u[0] * 6, -u[1] * 6]), add(hem, [-n[0] * r3 * 0.9 - u[0] * 8, -n[1] * r3 * 0.9 - u[1] * 8])], 0.36, 0.45);
      }
    }
  }

  const HAND_RELAX = [[-1, -7], [7, -8.5], [14, -7], [18.5, -2.5], [18, 3.5], [13.5, 7.5], [8, 8], [9.5, 12.5], [6, 14.5], [2, 11], [-1, 7]];
  const HAND_OPEN = [[-1, -7], [11, -9], [26, -8.5], [34, -5], [34.5, 1.5], [26, 5], [12, 6.5], [15, 12.5], [11.5, 15.5], [3, 11], [-1, 7]];
  const HAND_FIST = [[-1, -8], [7, -10], [14, -9], [18, -4.5], [18.5, 3], [15, 8.5], [8, 10], [2, 9.5], [-1, 7]];
  function hand(ctx, K, C, arm, far) {
    const c = far ? C.F.skin : C.col.skin;
    frame(ctx, K, arm.wrist, arm.handA, (K0) => {
      const s = C.hand;
      ctx.scale(s, s);
      const K = Object.assign({}, K0, { lw: K0.lw / s, minLine: K0.minLine / s, rim: K0.rim / s });
      const kind = arm.kind;
      if (kind === 'fist' || kind === 'point') {
        const parts = [blob(HAND_FIST, 0.9)];
        if (kind === 'point') parts.push(capsule(14, -5.5, 3.6, 31, -5, 3.1));
        cel(ctx, K, parts, c, 3.5);
        line(ctx, K, [[11, -8.5], [12.5, -2], [12, 4]], 0.36, 0.6);
        line(ctx, K, [[6, 4], [11, 6.5]], 0.36, 0.7);
      } else if (kind === 'open' || kind === 'cup') {
        cel(ctx, K, [blob(HAND_OPEN, 0.95)], c, 3.5);
        line(ctx, K, [[10, 5.5], [6.5, 9]], 0.4, 0.75);
        line(ctx, K, [[17, -4.5], [32, -3.5]], 0.34, 0.7);
        line(ctx, K, [[16, -0.8], [32, -0.3]], 0.34, 0.7);
        if (kind === 'open') line(ctx, K, [[15, 2.8], [28, 3]], 0.34, 0.55);
      } else {
        const pts = kind === 'pinch' ? HAND_RELAX.map((p) => [p[0] * 1.05, p[1] * 0.9]) : HAND_RELAX;
        cel(ctx, K, [blob(pts, 0.95)], c, 3.5);
        line(ctx, K, [[8, 7.5], [5.5, 9.5]], 0.4, 0.75);
        if (kind === 'pinch') line(ctx, K, [[18, 0.5], [12.5, 1.2]], 0.36, 0.7);
      }
    });
  }

  function sleeveArm(ctx, K, C, arm, far) {
    const c = far ? C.F : C.col;
    const { shoulder: s, elbow: e, wrist: w } = arm;
    const [r1, r2, r3] = C.armR;
    const fd = sub(w, e);
    const u = unit(fd);
    const cuffA = sub(w, mul(u, 5.5));
    hand(ctx, K, C, arm, far);
    const parts = [capsule(s[0], s[1], r1, e[0], e[1], r2), capsule(e[0], e[1], r2, cuffA[0], cuffA[1], r3)];
    cel(ctx, K, parts, c.top, 6);
    if (C.topPattern) {
      pattern(ctx, C.topPattern, [parts[0]], s, Math.atan2(e[1] - s[1], e[0] - s[0]), far ? 11 : 5);
      pattern(ctx, C.topPattern, [parts[1]], e, Math.atan2(u[1], u[0]), far ? 13 : 9);
    }
    const cuffParts = [capsule(cuffA[0], cuffA[1], r3 + 0.3, w[0] - u[0] * 0.5, w[1] - u[1] * 0.5, r3 - 0.3)];
    cel(ctx, K, cuffParts, c.cuff, 4);
    if (C.topPattern === 'camo') pattern(ctx, 'camo', cuffParts, cuffA, Math.atan2(u[1], u[0]), far ? 17 : 15);
    const n = [-u[1], u[0]];
    line(ctx, K, [add(e, [n[0] * 3 - u[0] * 2, n[1] * 3 - u[1] * 2]), add(e, [n[0] * 8 + u[0] * 3, n[1] * 8 + u[1] * 3])], 0.4, 0.5);
    if (C.chevrons && !far) {
      const ua = unit(sub(e, s));
      frame(ctx, K, add(s, mul(ua, UA * 0.42)), Math.atan2(ua[1], ua[0]), (K) => {
        for (let i = 0; i < 3; i++) {
          const x = -6 + i * 5.2;
          const rb = ribbon([[x + 6, -r1 * 0.72], [x, 0], [x + 6, r1 * 0.72]], [3.4, 3.6, 3.4]);
          chip(ctx, K, [blob(rb, 0.4)], '#D9BE5C', 0.36);
        }
        const rk = ribbon([[13, -r1 * 0.7], [17.5, 0], [13, r1 * 0.7]], [3.2, 3.4, 3.2]);
        chip(ctx, K, [blob(rk, 0.9)], '#D9BE5C', 0.36);
      });
    }
  }

  function torsoPts(C, R) {
    const tw = C.tw, ch = C.chest || 0, be = C.belly || 0, hem = C.hem;
    const b = 0.5 * R.breath;
    return [
      [6, -85], [tw * 0.7, -82], [tw * 0.96 + ch * 0.3, -69], [tw + ch + 0.4 * b, -52], [tw + ch * 0.4 + be * 0.5, -32],
      [tw * 0.97 + be, -12], [tw * 0.93 + be * 0.6, hem - 4], [tw * 0.6, hem], [0, hem + 1], [-tw * 0.7, hem],
      [-tw * 0.96, hem - 4], [-tw * 0.95, -12], [-tw * 0.93, -32], [-tw * 0.98, -54], [-tw * 0.86, -72], [-tw * 0.5, -83],
    ].map((p) => [p[0], p[1] - (p[1] < -40 ? b : 0)]);
  }

  function hips(ctx, K, C, R) {
    frame(ctx, K, R.pelvis, R.rT, (K) => {
      cel(ctx, K, [oval(0, 0, C.tw * 0.94, 15)], C.col.leg, 6);
      if (C.legPattern) pattern(ctx, C.legPattern, [oval(0, 0, C.tw * 0.94, 15)], [0, 0], 0, 21);
    });
  }

  function skirt(ctx, K, C, R) {
    const [n, f] = R.legs;
    const hemY = Math.max(n.knee[1], f.knee[1]) + 15;
    const x0 = Math.min(n.knee[0], f.knee[0]) - 17, x1 = Math.max(n.knee[0], f.knee[0]) + 17;
    const wl = inFrame(R.pelvis, R.rT, [-C.tw * 0.9, -6]), wr = inFrame(R.pelvis, R.rT, [C.tw * 0.9, -6]);
    const pts = [wl, wr, [lerp(wr[0], x1, 0.55) + 2, lerp(wr[1], hemY, 0.55)], [x1 + 3, hemY - 2, 1], [lerp(x0, x1, 0.5), hemY + 2], [x0 - 3, hemY - 1, 1], [lerp(wl[0], x0, 0.55) - 2, lerp(wl[1], hemY, 0.55)]];
    const parts = [blob(pts, 0.85)];
    cel(ctx, K, parts, C.col.skirt, 8);
    const mx = lerp(x0, x1, 0.5);
    line(ctx, K, [[mx + 4, wl[1] + 18], [mx + 6, hemY - 16], [mx + 9, hemY]], 0.38, 0.45);
    line(ctx, K, [[x0 + 12, wl[1] + 26], [x0 + 6, hemY - 4]], 0.36, 0.4);
  }

  function neckPart(ctx, K, C, R) {
    const a = inFrame(R.pelvis, R.rT, [4, -78]);
    const b = inFrame(R.headO, R.rH, [-2, -6]);
    cel(ctx, K, [capsule(a[0], a[1], C.neckR, b[0], b[1], C.neckR * 0.92)], C.col.skin, 6);
  }

  function torso(ctx, K, C, R) {
    frame(ctx, K, R.pelvis, R.rT, (K) => {
      const pts = torsoPts(C, R);
      const body = [blob(pts, 0.9)];
      cel(ctx, K, body, C.col.top, 12);
      if (C.topPattern) pattern(ctx, C.topPattern, body, [0, -36], 0, 1);
      C.torsoDetail(ctx, K, C, R, body);
    });
  }

  const JAWS = {
    soft: [[0, -47], [30, -40], [42, -22], [45, -8], [49.5, -1], [46, 4], [44.5, 12], [39, 27], [25, 38], [6, 41], [-14, 35], [-34, 19], [-46, -5], [-40, -32]],
    plain: [[0, -47], [31, -40], [43, -22], [45, -8], [50, -1], [46.5, 4.5], [45.5, 13], [41, 30], [27, 41], [7, 44], [-15, 37], [-35, 20], [-47, -5], [-41, -32]],
    brick: [[0, -46], [33, -40], [45, -22], [46.5, -8], [52, -1], [48, 5], [47, 13], [49, 30, 1], [45, 46, 1], [8, 48], [-22, 41, 1], [-42, 18], [-48, -6], [-41, -33]],
  };

  function head(ctx, K, C, R) {
    frame(ctx, K, R.headO, R.rH, (K) => {
      const [cx, cy] = HC;
      const E = R.E;
      const lk = R.look * 14;
      const shout = E.mouth === 'shout' ? 1 : 0;
      const jawDrop = shout * 11 + (E.mouth === 'cry' ? 2.5 : 0);
      const P = (x, y, w) => [cx + x + lk * (w == null ? Math.max(0, x / 48) : w), cy + y + (y > 16 ? jawDrop * clamp01((y - 16) / 20) : 0)];
      const skull = JAWS[C.jaw].map((q) => (q[2] ? [...P(q[0], q[1]), 1] : P(q[0], q[1])));
      const skin = [blob(skull, 1)];
      if (C.hairBack) C.hairBack(ctx, K, C, R, P);
      cel(ctx, K, skin, C.col.skin, 15);
      const fx = cx + 24 + lk;
      const eyeY = cy + 2 - 2 * Math.max(0, R.look);
      const ex = [fx - 11, fx + 11];
      if (C.ear) {
        const earX = cx - 24 + lk * 0.3, earY = cy + 5;
        cel(ctx, K, [oval(earX, earY, 6.5, 9.5, -0.15)], C.col.skin, 3);
        line(ctx, K, [[earX + 2, earY - 4.5], [earX - 2, earY - 1.5], [earX - 0.5, earY + 3], [earX + 2, earY + 4.5]], 0.4, 0.7);
      }
      ctx.save();
      build(ctx, skin);
      ctx.clip();
      for (let i = 0; i < 2; i++) {
        const bx = ex[i] + (i ? 5 : -5), byy = eyeY + 12;
        const rx = i ? 5.5 : 7.5;
        const g = ctx.createRadialGradient(bx, byy, 0, bx, byy, rx);
        g.addColorStop(0, 'rgba(232,120,96,' + C.blush * (1 + 0.6 * (E.tears || 0)) + ')');
        g.addColorStop(1, 'rgba(232,120,96,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(bx, byy, rx, rx * 0.62, 0, 0, TAU);
        ctx.fill();
      }
      if (C.faceDetail) C.faceDetail(ctx, K, C, R, { cx, cy, fx, eyeY, ex, lk, P });
      const close = R.blink;
      for (let i = 0; i < 2; i++) {
        const x = ex[i], y = eyeY;
        const rx = (i ? 2.9 - R.look * 0.5 : 3.7 + R.look * 0.2) * C.eyeK;
        const ry = 5.2 * C.eyeK;
        const d = i ? -1 : 1;
        if (E.eye === 'squeeze') {
          line(ctx, K, [[x - rx - 1.5, y - 1], [x + d * 0.5, y + 2.2], [x + rx + 1.5, y - 1]], 0.6, 1, C.col.eye);
          continue;
        }
        if (E.eye === 'happy') {
          line(ctx, K, [[x - rx - 1.5, y + 1.5], [x, y - 2.5], [x + rx + 1.5, y + 1.5]], 0.6, 1, C.col.eye);
          continue;
        }
        const ryE = ry * (1 - 0.82 * close) * (E.eye === 'kind' ? 0.85 : 1);
        const dy = E.eye === 'low' ? 1.2 : 0;
        if (close < 0.75) {
          ctx.fillStyle = C.col.eye;
          ctx.beginPath();
          ctx.ellipse(x, y + dy + 1.5 * close, rx, Math.max(1.2, ryE), 0, 0, TAU);
          ctx.fill();
          if (close < 0.4) {
            ctx.fillStyle = 'rgba(255,248,232,' + 0.9 * (1 - close / 0.4) + ')';
            ctx.beginPath();
            ctx.arc(x + 1.2 * (K.lx > 0 ? 1 : -1), y + dy - 2.2, 1.25, 0, TAU);
            ctx.fill();
          }
          if (E.eye === 'low' || E.eye === 'narrow') {
            const xin = x + d * (rx + 2), xout = x - d * (rx + 2);
            const inner = E.eye === 'low' ? y - ry * 0.75 : y - ry * 0.4;
            const outer = E.eye === 'low' ? y - ry * 0.12 : y - ry * 0.95;
            ctx.fillStyle = C.col.skin.base;
            ctx.beginPath();
            ctx.moveTo(xin, inner); ctx.lineTo(xout, outer); ctx.lineTo(xout, y - ry - 3); ctx.lineTo(xin, y - ry - 3); ctx.closePath();
            ctx.fill();
            line(ctx, K, [[xout, outer], [xin, inner]], 0.5, 0.95, C.col.eye);
          }
          if (E.eye === 'kind') line(ctx, K, [[x - rx - 1, y + ry + 2.5], [x, y + ry + 0.8], [x + rx + 1, y + ry + 2.5]], 0.38, 0.65);
        }
        if (close >= 0.5) {
          const a = clamp01((close - 0.5) / 0.25);
          line(ctx, K, [[x - rx - 1.5, y + 1], [x, y + 3], [x + rx + 1.5, y + 1]], 0.6, a, C.col.eye);
        }
        if (C.lashes && close < 0.5) {
          const ox = x - d * rx;
          line(ctx, K, [[ox, y - ry * 0.55], [ox - d * 2.8, y - ry - 0.8]], 0.42, 0.9, C.col.eye);
        }
      }
      const lift = E.lift - 0.6 * R.blink + (R.sob ? -1.5 * Math.abs(R.jerk) : 0);
      for (let i = 0; i < 2; i++) {
        const bx = ex[i] + (i ? 1 : -1), by = eyeY - 12 + lift;
        const inner = i ? -1 : 1;
        const len = (i ? 8 : 10) * C.browLen;
        const a = -inner * E.brow;
        const p0 = add([bx, by], rot([(-len / 2) * inner, 0], a));
        const p1 = add([bx, by], rot([(len / 2) * inner, 0], a));
        const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 - 1.2];
        const bw = C.browW;
        const rb = ribbon([p0, mid, p1], [bw * 0.7, bw, bw * 0.65]);
        ctx.fillStyle = C.col.brow;
        ctx.beginPath();
        spline(ctx, oriented(rb), true, 0.9);
        ctx.fill();
      }
      const mx = fx + 5 + lk * 0.2, my = cy + 22 + jawDrop * 0.4;
      if (E.mouth === 'smile') {
        line(ctx, K, [[mx - 5, my - 1.5], [mx, my + 1.5], [mx + 4.5, my - 1.8]], 0.5, 0.95);
      } else if (E.mouth === 'cry') {
        const wob = R.jerk * 1.2;
        const m = [[mx - 6, my + 2 + wob], [mx - 1, my - 2], [mx + 5, my + 1.5 - wob], [mx + 4, my + 6], [mx, my + 7.5 + wob], [mx - 4.5, my + 6]];
        chip(ctx, K, [blob(m, 0.9)], '#6B2A26', 0.5);
      }
      ctx.restore();
      if (E.mouth === 'shout') shoutMouth(ctx, K, C, R, mx, my);
      if (E.tears) tears(ctx, K, R, ex, eyeY);
      if (C.moustache) moustache(ctx, K, C, mx + 3, my - (shout ? 9 : 7.5), shout * 3, C.moustache);
      if (C.hair) C.hair(ctx, K, C, R, P);
      if (C.hat) C.hat(ctx, K, C, R, P);
      if (E.mouth === 'shout' && C.shoutLines) shoutLines(ctx, K, R, mx, my, C.shoutLines);
    });
  }

  function moustache(ctx, K, C, mx0, my0, open, k) {
    const z = typeof k === 'number' ? k : 1;
    const mx = mx0, my = my0;
    const m = [[mx - 11, my - 1, 1], [mx - 5, my - 5], [mx + 4, my - 5.5], [mx + 11, my - 2], [mx + 13, my + 3 + open, 1], [mx + 6, my + 1], [mx, my + 1.5], [mx - 6, my + 2.5 + open]];
    const mz = m.map((q) => [mx + (q[0] - mx) * z, my + (q[1] - my) * z, q[2]].slice(0, q[2] ? 3 : 2));
    cel(ctx, K, [blob(mz, 0.8)], C.col.stache, 2, 0);
    line(ctx, K, [[mx - 4 * z, my - 2 * z], [mx - 2 * z, my + 1 * z]], 0.32, 0.5, C.col.stache.shade);
    line(ctx, K, [[mx + 3 * z, my - 2.5 * z], [mx + 5 * z, my + 0.5 * z]], 0.32, 0.5, C.col.stache.shade);
  }

  function shoutMouth(ctx, K, C, R, mx, my) {
    const t = R.t;
    const tw2 = Math.floor(t * 12) % 2;
    const ox = mx + 5, oy = my + 5;
    const rx = 10 * C.shoutK, ry = 9 * C.shoutK;
    const pts = [];
    const N = 14;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * TAU - 0.2;
      const k = i % 2 ? 0.74 + 0.05 * tw2 : 1.04;
      pts.push([ox + Math.cos(a) * rx * k * 1.08, oy + Math.sin(a) * ry * k, 1]);
    }
    const parts = [blob(pts, 0.6)];
    build(ctx, parts);
    ctx.fillStyle = INK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = K.lw * 2;
    ctx.lineJoin = 'miter';
    ctx.stroke();
    ctx.fillStyle = '#4A1814';
    ctx.fill();
    ctx.save();
    build(ctx, parts);
    ctx.clip();
    ctx.fillStyle = '#F4EEE2';
    ctx.fillRect(ox - rx * 1.4, oy - ry * 1.3, rx * 2.8, ry * 0.62);
    ctx.fillStyle = '#C8565A';
    ctx.beginPath();
    ctx.ellipse(ox + 1, oy + ry * 0.75, rx * 0.75, ry * 0.45, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function shoutLines(ctx, K, R, mx, my, k) {
    const tw2 = Math.floor(R.t * 12) % 2;
    const ox = mx + 16 * k, oy = my + 3;
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(K.minLine, K.lw * 1.1);
    const angs = [-0.62, -0.2, 0.22, 0.62];
    angs.forEach((a, i) => {
      const r0 = (8 + 4 * ((i + tw2) % 2)) * k;
      const len = (i % 2 ? 16 : 22) * k;
      ctx.beginPath();
      ctx.moveTo(ox + Math.cos(a) * r0, oy + Math.sin(a) * r0);
      ctx.lineTo(ox + Math.cos(a) * (r0 + len), oy + Math.sin(a) * (r0 + len));
      ctx.stroke();
    });
    ctx.lineWidth = Math.max(K.minLine, K.lw * 0.8);
    ctx.lineJoin = 'miter';
    for (const s of [-1, 1]) {
      const bx = ox + 30 * k, by = oy + s * 22 * k;
      ctx.beginPath();
      ctx.moveTo(bx, by - 5 * k);
      ctx.lineTo(bx + 4 * k, by - 1 * k);
      ctx.lineTo(bx + 1 * k, by + 1 * k);
      ctx.lineTo(bx + 6 * k, by + 5 * k);
      ctx.stroke();
    }
    ctx.restore();
  }

  function tears(ctx, K, R, ex, eyeY) {
    const t = R.t;
    for (let i = 0; i < 2; i++) {
      const x = ex[i] + (i ? 3 : -2);
      const y0 = eyeY + 4;
      ctx.save();
      ctx.strokeStyle = 'rgba(190,232,250,0.75)';
      ctx.lineCap = 'round';
      ctx.lineWidth = i ? 2 : 2.6;
      ctx.beginPath();
      ctx.moveTo(x, y0);
      ctx.quadraticCurveTo(x - 1.5, y0 + 10, x - 0.5, y0 + 22);
      ctx.stroke();
      ctx.restore();
      const ph = ((t + i * 0.43) / 0.9) % 1;
      const yy = y0 + 4 + ph * ph * 34;
      const rr = (i ? 2.2 : 2.8) * (1 - 0.3 * ph);
      ctx.save();
      ctx.globalAlpha *= 1 - sstep(0.8, 1, ph);
      ctx.fillStyle = '#D8F1FB';
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(K.minLine * 0.8, K.lw * 0.36);
      ctx.beginPath();
      ctx.moveTo(x - 0.5, yy - rr * 2.4);
      ctx.quadraticCurveTo(x + rr * 1.2, yy - rr * 0.2, x - 0.5, yy + rr);
      ctx.quadraticCurveTo(x - rr * 2.2, yy - rr * 0.2, x - 0.5, yy - rr * 2.4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawPerson(ctx, C, o) {
    o = o || {};
    const h = Math.max(20, o.h || AH);
    const s = h / AH;
    const facing = o.facing === -1 ? -1 : 1;
    const R = rig(C, o);
    const lwPx = Math.max(2.5, 6 * s);
    let L0 = [0.78, -0.62];
    if (Array.isArray(o.light)) L0 = unit(o.light);
    const K = {
      lw: lwPx / s / 2,
      minLine: 1.15 / s,
      lx0: L0[0] * facing, ly0: L0[1], lx: L0[0] * facing, ly: L0[1], baseRot: 0,
      rim: Math.max(2.6, 1.2 / s),
    };
    ctx.save();
    ctx.translate(o.x || 0, o.y || 0);
    ctx.scale(s * facing, s);
    ctx.save();
    ctx.translate(-14 * L0[0], 0);
    ctx.scale(1, 0.15);
    const gw = 70 + C.tw * 0.9;
    const g = ctx.createRadialGradient(0, 0, 8, 0, 0, gw);
    g.addColorStop(0, SHADOW + '0.34)');
    g.addColorStop(0.6, SHADOW + '0.2)');
    g.addColorStop(1, SHADOW + '0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, gw, 0, TAU);
    ctx.fill();
    ctx.restore();
    for (const leg of R.legs) {
      const lift = -leg.ankle[1] - ANK;
      const a = 0.26 * clamp01(1 - lift / 16);
      if (a <= 0) continue;
      ctx.fillStyle = SHADOW + a + ')';
      ctx.beginPath();
      ctx.ellipse(leg.ankle[0] + 8, 1, 30, 5, 0, 0, TAU);
      ctx.fill();
    }
    sleeveArm(ctx, K, C, R.farArm, true);
    shoe(ctx, K, C, R.legs[1], true);
    legPart(ctx, K, C, R.legs[1], true);
    shoe(ctx, K, C, R.legs[0], false);
    legPart(ctx, K, C, R.legs[0], false);
    if (C.lower === 'skirt') skirt(ctx, K, C, R);
    else hips(ctx, K, C, R);
    neckPart(ctx, K, C, R);
    torso(ctx, K, C, R);
    if (R.nearBehind) sleeveArm(ctx, K, C, R.nearArm, false);
    head(ctx, K, C, R);
    if (!R.nearBehind) sleeveArm(ctx, K, C, R.nearArm, false);
    ctx.restore();
  }

  function poseOf(C, o) {
    o = o || {};
    const h = Math.max(20, o.h || AH);
    const s = h / AH;
    const f = o.facing === -1 ? -1 : 1;
    const R = rig(C, o);
    const W = (p) => [(o.x || 0) + p[0] * s * f, (o.y || 0) + p[1] * s];
    const A = (a) => (f === 1 ? a : Math.PI - a);
    const gripOf = (arm) => add(arm.wrist, rot(mul(GRIP[arm.kind] || GRIP.relaxed, C.hand), arm.handA));
    const arms = [R.nearArm, R.farArm];
    const out = {
      hands: arms.map((a) => W(gripOf(a))),
      wrists: arms.map((a) => W(a.wrist)),
      elbows: arms.map((a) => W(a.elbow)),
      shoulders: arms.map((a) => W(a.shoulder)),
      handAngles: arms.map((a) => A(a.handA)),
      head: W(inFrame(R.headO, R.rH, HC)),
      mouth: W(inFrame(R.headO, R.rH, [HC[0] + 29, HC[1] + 22])),
      legs: R.legs.map((l) => ({
        hip: W(l.hip), knee: W(l.knee), ankle: W(l.ankle), phi: l.phi,
        heel: W(add(l.ankle, rot(HEEL, l.phi))), ball: W(add(l.ankle, rot(BALL, l.phi))),
      })),
      pose: R.poseName,
      expr: R.exprName,
    };
    if (R.extra) Object.assign(out, R.extra(W, A, gripOf, s));
    return out;
  }

  function make(C) {
    C.shoutK = C.shoutK || 1;
    C.shoutLines = C.shoutLines == null ? 0.85 : C.shoutLines;
    C.F = {};
    for (const k of Object.keys(C.col)) if (C.col[k] && C.col[k].base) C.F[k] = farTone(C.col[k]);
    C.F.top = farTone(C.col.top);
    C.F.cuff = farTone(C.col.cuff || C.col.top);
    C.col.cuff = C.col.cuff || C.col.top;
    const fn = (ctx, o) => drawPerson(ctx, C, o);
    fn.pose = (o) => poseOf(C, o);
    fn.STEP = STEP_H;
    fn.POSES = Object.keys(C.poses);
    return fn;
  }

  const BOB = '#7A4A2B';
  const mother = make({
    name: 'mother', tw: 27, chest: 3, belly: 1, hem: 20, neckR: 8.5,
    armR: [11, 9.5, 8.6], legR: [11, 8, 7], hand: 1.0, eyeK: 1, browLen: 1, browW: 2.6,
    lower: 'skirt', shoe: 'flat', jaw: 'soft', ear: false, lashes: true, blush: 0.36,
    phase: 0.4, blinkOff: 1.37, expr: 'kind', defaultPose: 'stand', topPattern: 'knit',
    col: {
      skin: tone('#F5CBA8', '#DDA284', 0.35),
      hair: tone(BOB, '#55301A', 0.32),
      top: tone('#C47F78', '#9C5C58', 0.38),
      cuff: tone('#B8736D', '#94534F', 0.36),
      blouse: tone('#F6EEDF', '#D9CDBA', 0.2),
      skirt: tone('#5E6A88', '#465068', 0.36),
      leg: tone('#E2B796', '#C49577', 0.3),
      shoe: tone('#5A3A28', '#3E2618', 0.3),
      sole: tone('#3A2618', '#2A1A10', 0.2),
      eye: '#21170F', brow: '#55301A',
    },
    torsoDetail(ctx, K, C, R, body) {
      const tw = C.tw;
      const vee = [[0, -86], [tw * 0.92, -82], [tw * 0.62, -46, 1]];
      ctx.save();
      build(ctx, body);
      ctx.clip();
      cel(ctx, K, [blob(vee, 0.5)], C.col.blouse, 3, 0);
      ctx.restore();
      const colN = [[0, -87], [11, -86], [13, -77, 1], [5, -79]];
      const colF = [[17, -85], [tw * 0.92, -83], [tw * 0.78, -76, 1]];
      cel(ctx, K, [blob(colN, 0.7)], C.col.blouse, 2, 0);
      cel(ctx, K, [blob(colF, 0.7)], C.col.blouse, 2, 0);
      line(ctx, K, [[tw * 0.62, -46], [tw * 0.66, -14], [tw * 0.68, C.hem - 1]], 0.45, 0.8);
      for (let i = 0; i < 4; i++) {
        const by = -38 + i * 14;
        chip(ctx, K, [oval(tw * 0.66 + 3, by, 2.4, 2.4)], '#EFE2CC', 0.34);
      }
      line(ctx, K, [[-tw * 0.95, C.hem - 7], [0, C.hem - 5], [tw * 0.93, C.hem - 7]], 0.4, 0.55);
      line(ctx, K, [[-tw * 0.6, -22], [-tw * 0.3, -16]], 0.36, 0.4);
    },
    hairBack(ctx, K, C, R, P) {
      const back = [P(-6, -44, 0), P(-30, -50, 0), P(-50, -32, 0), P(-56, -4, 0), P(-54, 22, 0), P(-46, 36, 0), [P(-32, 41, 0)[0], P(-32, 41, 0)[1], 1], P(-18, 36, 0), P(-8, 20, 0)];
      cel(ctx, K, [blob(back, 0.9)], C.col.hair, 9);
    },
    hair(ctx, K, C, R, P) {
      const hp = [
        [...P(40, -20), 1], P(30, -24), P(18, -21), P(6, -26), P(-4, -18, 0), P(-6, 2, 0), P(-1, 26, 0), [...P(-5, 38, 0), 1],
        P(-18, 37, 0), [...P(-30, 41, 0), 1], P(-46, 30, 0), P(-55, 6, 0), P(-52, -22, 0), P(-38, -46, 0), P(-14, -57, 0),
        P(12, -57), P(32, -46), P(43, -32),
      ];
      const parts = [blob(hp, 0.85)];
      cel(ctx, K, parts, C.col.hair, 12);
      ctx.save();
      build(ctx, parts);
      ctx.clip();
      const sh = C.col.hair.shade;
      line(ctx, K, [P(-30, -44, 0), P(-10, -40, 0), P(14, -34), P(34, -24)], 0.36, 0.75, sh);
      line(ctx, K, [P(-42, -26, 0), P(-30, -8, 0), P(-26, 18, 0), P(-24, 34, 0)], 0.36, 0.7, sh);
      line(ctx, K, [P(-12, -30, 0), P(-14, 0, 0), P(-11, 30, 0)], 0.34, 0.6, sh);
      line(ctx, K, [P(-48, 26, 0), P(-34, 34, 0), P(-14, 32, 0)], 0.34, 0.6, sh);
      ctx.restore();
    },
    poses: {
      stand: {
        body: () => ({ tilt: 0.04 }),
        arms: (o, t, J) => [
          { target: add(J.T([J.C.tw * 1.0, -8]), [4, 0]), bendDir: -1, hand: 'relaxed', handA: 0.15 },
          { target: add(J.T([J.C.tw * 1.3, -26]), [6, 0]), bendDir: 'low', hand: 'relaxed', handA: 0.7 },
        ],
      },
      cry: {
        expr: 'cry',
        body: () => ({ tilt: 0.16, lean: 0.06, sob: 1, shrug: 2 }),
        arms: (o, t, J) => [
          { target: J.H(27, 40), hand: 'open', handA: J.rH - 1.62, bendDir: 'low' },
          { target: J.T([J.C.tw * 0.9, -38]), bendDir: -1, hand: 'relaxed', handA: -0.2 },
        ],
      },
      clutch: {
        expr: 'sad',
        body: () => ({ tilt: 0.08, lean: 0.09, sob: 0.25 }),
        arms: (o, t, J) => {
          const r = o.reach == null ? 50 : o.reach;
          return [
            { target: J.T([r, -46]), hand: 'fist', handA: J.rT + 0.9, bendDir: 'low' },
            { target: J.T([r + 6, -58]), hand: 'fist', handA: J.rT + 1.1, bendDir: 'low' },
          ];
        },
      },
      hug: {
        expr: 'relieved',
        body: () => ({ tilt: 0.14, lean: 0.14, shrug: 2 }),
        arms: (o, t, J) => [
          { target: J.T([54, -52]), hand: 'open', handA: J.rT + 1.9, bendDir: 'low' },
          { target: J.T([46, -66]), hand: 'open', handA: J.rT + 2.1, bendDir: 'low' },
        ],
      },
      wave: {
        expr: 'kind',
        body: () => ({ tilt: -0.04 }),
        arms: (o, t, J) => {
          const w = Math.sin(t * TAU * 1.5);
          const wr = add(J.sF, rot([0, -(UA + FA) * 0.92], 1.12 + w * 0.06));
          return [
            { target: J.T([J.C.tw * 0.9, -40]), bendDir: -1, hand: 'relaxed', handA: -0.4 },
            { target: wr, hand: 'open', handA: -Math.PI / 2 + 0.3 + w * 0.45, bendDir: 'low' },
          ];
        },
      },
    },
  });

  const FHAIR = '#6A5340';
  const father = make({
    name: 'father', tw: 31, chest: 1, belly: 4, hem: 22, neckR: 10,
    armR: [12.5, 11, 10], legR: [15, 11.5, 11], hand: 1.08, eyeK: 0.95, browLen: 1.15, browW: 3.4,
    lower: 'trousers', shoe: 'shoe', jaw: 'plain', ear: true, lashes: false, blush: 0.22, moustache: 0.85,
    phase: 1.9, blinkOff: 0.21, expr: 'neutral', defaultPose: 'stand', topPattern: 'plaid',
    col: {
      skin: tone('#F0C29E', '#D59C7B', 0.35),
      hair: tone(FHAIR, '#4C3A2B', 0.3),
      grey: tone('#9A8C80', '#776A60', 0.3),
      top: tone('#A9473C', '#7F3029', 0.38),
      cuff: tone('#9C4036', '#762B25', 0.36),
      leg: tone('#A8946E', '#857152', 0.38),
      shoe: tone('#5E3E27', '#40291A', 0.3),
      sole: tone('#3B2819', '#2A1C11', 0.2),
      stache: tone('#5B4532', '#3F2F22', 0.25),
      eye: '#21170F', brow: '#4C3A2B',
    },
    torsoDetail(ctx, K, C, R) {
      const tw = C.tw;
      const colN = [[-6, -87], [10, -87], [14, -75, 1], [4, -80]];
      const colF = [[16, -86], [tw * 0.86, -84], [tw * 0.7, -74, 1]];
      cel(ctx, K, [blob(colN, 0.6)], C.col.top, 2, 0);
      cel(ctx, K, [blob(colF, 0.6)], C.col.top, 2, 0);
      line(ctx, K, [[tw * 0.55, -78], [tw * 0.58, -30], [tw * 0.6, C.hem - 1]], 0.45, 0.8);
      for (let i = 0; i < 5; i++) chip(ctx, K, [oval(tw * 0.58 + 2.5, -70 + i * 17, 2.1, 2.1)], '#EDE3D2', 0.32);
      const pk = [[tw * 0.66, -62], [tw * 0.96, -63], [tw * 0.97, -46], [tw * 0.67, -45]];
      line(ctx, K, [...pk, pk[0]], 0.4, 0.7);
      line(ctx, K, [[tw * 0.66, -58], [tw * 0.97, -59]], 0.36, 0.6);
      line(ctx, K, [[-tw * 0.95, C.hem - 3], [0, C.hem - 1], [tw * 0.95, C.hem - 3]], 0.36, 0.4);
      line(ctx, K, [[-tw * 0.55, -30], [-tw * 0.25, -22]], 0.36, 0.4);
    },
    faceDetail(ctx, K, C, R, F) {
      const { cx, cy, fx } = F;
      line(ctx, K, [[fx - 18, cy - 25], [fx - 6, cy - 27], [fx + 6, cy - 25]], 0.32, 0.35);
      line(ctx, K, [[fx - 14, cy - 20], [fx - 4, cy - 21.5], [fx + 4, cy - 20]], 0.3, 0.28);
      line(ctx, K, [[fx + 12, cy + 9], [fx + 10, cy + 15]], 0.32, 0.35);
      void cx;
    },
    hair(ctx, K, C, R, P) {
      const side = [P(-8, -38, 0), P(-6, -22, 0), P(-10, -8, 0), [...P(-12, 6, 0), 1], P(-16, -6, 0), P(-26, -10, 0), P(-34, 8, 0), [...P(-40, 22, 0), 1], P(-48, 8, 0), P(-50, -14, 0), P(-44, -34, 0), P(-28, -46, 0)];
      const parts = [blob(side, 0.85)];
      cel(ctx, K, parts, C.col.hair, 9);
      ctx.save();
      build(ctx, parts);
      ctx.clip();
      ctx.fillStyle = C.col.grey.base;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.ellipse(P(-12, -14, 0)[0], P(-12, -14, 0)[1], 9, 14, 0.2, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      line(ctx, K, [P(-40, -26, 0), P(-34, -6, 0), P(-38, 12, 0)], 0.34, 0.6, C.col.hair.shade);
      ctx.restore();
      for (let i = 0; i < 3; i++) {
        const y0 = -38 + i * 4;
        line(ctx, K, [P(-32 + i * 2, y0 + 2, 0), P(-8, y0 - 5, 0), P(10 + i * 3, y0 - 3)], 0.42, 0.75, C.col.hair.shade);
      }
    },
    poses: {
      stand: {
        body: () => ({ tilt: 0.06 }),
        arms: () => [hang(0.02, 0.24), hang(0.1, 0.26)],
      },
      headBowed: {
        expr: 'sad',
        body: () => ({ tilt: 0.42, lean: 0.08, slump: 3, headOff: [3, 2] }),
        arms: (o, t, J) => [
          { target: J.T([J.C.tw * 0.95, -6]), bendDir: -1, hand: 'relaxed', handA: 0.5 },
          { target: J.T([J.C.tw * 1.0, -9]), bendDir: -1, hand: 'relaxed', handA: 0.9 },
        ],
      },
      holdOutEnvelope: {
        expr: 'sad',
        body: (o) => {
          const bow = o.bow == null ? 0.6 : clamp01(o.bow);
          return { tilt: 0.12 + 0.3 * bow, lean: 0.05 + 0.04 * bow, slump: 1.5 * bow };
        },
        arms: (o, t, J) => [
          { target: add(J.sN, [UA + FA - 16, 26]), hand: 'pinch', handA: 0.02, bendDir: 'low' },
          hang(0.16, 0.3),
        ],
        extra: (o, t, J, near) => (W, A, gripOf) => {
          const g = gripOf(near);
          return { envelope: { x: W(g)[0], y: W(g)[1], angle: A(near.handA) } };
        },
      },
      armAround: {
        expr: 'sad',
        body: () => ({ tilt: 0.12, lean: -0.02 }),
        arms: (o, t, J) => {
          const r = o.reach == null ? 70 : o.reach;
          return [
            { target: J.T([-r, -70]), hand: 'relaxed', handA: Math.PI * 0.6, bendDir: 'low' },
            hang(0.14, 0.3),
          ];
        },
      },
      handOnShoulder: {
        expr: 'kind',
        body: () => ({ tilt: 0.1, lean: 0.04 }),
        arms: (o, t, J) => {
          const r = o.reach == null ? 64 : o.reach;
          return [{ target: J.T([r, -60]), hand: 'relaxed', handA: J.rT + 0.95, bendDir: 'low' }, hang(0.14, 0.3)];
        },
      },
    },
  });

  const drillSergeant = make({
    name: 'drillSergeant', tw: 44, chest: 6, belly: 0, hem: 6, neckR: 14,
    armR: [16.5, 14.5, 12.5], legR: [19, 15, 14], hand: 1.3, eyeK: 0.9, browLen: 1.25, browW: 4.2,
    lower: 'trousers', shoe: 'boot', jaw: 'brick', ear: true, lashes: false, blush: 0.1, chevrons: true,
    shoutK: 1.25, shoutLines: 1.25, phase: 2.7, blinkOff: 2.05, expr: 'stern', defaultPose: 'stand',
    col: {
      skin: tone('#9A6444', '#774A31', 0.34),
      hair: tone('#2A1D16', '#1A120D', 0.2),
      top: tone('#6F7148', '#525433', 0.36),
      cuff: tone('#696B43', '#4D4F30', 0.34),
      leg: tone('#55573A', '#3F4129', 0.34),
      shoe: tone('#2E2724', '#1D1816', 0.25),
      sole: tone('#201B19', '#151110', 0.15),
      hat: tone('#7C6743', '#5B4A2F', 0.38),
      band: tone('#3A2E20', '#271F15', 0.2),
      eye: '#160F0A', brow: '#1A120D',
    },
    torsoDetail(ctx, K, C) {
      const tw = C.tw;
      const colN = [[-6, -88], [12, -88], [16, -74, 1], [5, -80]];
      const colF = [[18, -87], [tw * 0.86, -84], [tw * 0.7, -73, 1]];
      cel(ctx, K, [blob(colN, 0.5)], C.col.top, 2, 0);
      cel(ctx, K, [blob(colF, 0.5)], C.col.top, 2, 0);
      line(ctx, K, [[tw * 0.5, -76], [tw * 0.53, -30], [tw * 0.55, -2]], 0.45, 0.8);
      for (const px of [-tw * 0.15, tw * 0.72]) {
        const w = 17;
        line(ctx, K, [[px - w / 2, -62], [px + w / 2, -62], [px + w / 2, -42], [px - w / 2, -42], [px - w / 2, -62]], 0.42, 0.75);
        chip(ctx, K, [blob([[px - w / 2 - 1, -63], [px + w / 2 + 1, -63], [px + w / 2 + 1, -56], [px, -53, 1], [px - w / 2 - 1, -56]], 0.3)], C.col.top.base, 0.42);
        chip(ctx, K, [oval(px, -56, 1.8, 1.8)], '#8C8A62', 0.3);
      }
      chip(ctx, K, [oval(tw * 0.72, -69, 4, 4)], '#D9BE5C', 0.36);
      chip(ctx, K, [blob([[-tw * 0.98, -5], [tw * 1.0, -6], [tw * 1.0, 4], [-tw * 0.98, 5]], 0.3)], '#221C18', 0.4);
      chip(ctx, K, [blob([[tw * 0.62, -6.5], [tw * 0.92, -7], [tw * 0.92, 5], [tw * 0.62, 5.5]], 0.3)], '#D4B04E', 0.4);
      line(ctx, K, [[-tw * 0.6, -30], [-tw * 0.3, -22]], 0.36, 0.4);
    },
    faceDetail(ctx, K, C, R, F) {
      const { cy, fx } = F;
      line(ctx, K, [[fx + 14, cy + 8], [fx + 12, cy + 16]], 0.36, 0.4);
      if (R.B.wrinkle) {
        line(ctx, K, [[fx + 18, cy - 8], [fx + 22, cy - 5]], 0.42, 0.85);
        line(ctx, K, [[fx + 17, cy - 4], [fx + 21, cy - 1.5]], 0.42, 0.85);
        line(ctx, K, [[fx + 10, cy + 7], [fx + 14, cy + 4]], 0.38, 0.6);
      }
    },
    hair(ctx, K, C, R, P) {
      const hp = [P(-10, -28, 0), P(-8, -12, 0), [...P(-12, 0, 0), 1], P(-20, -12, 0), P(-36, -8, 0), P(-44, 4, 0), P(-48, -14, 0), P(-42, -30, 0)];
      cel(ctx, K, [blob(hp, 0.85)], C.col.hair, 5, 1.5);
    },
    hat(ctx, K, C, R, P) {
      const tip = R.B.hatTip || 0;
      frame(ctx, K, P(2, -28), -0.07 + tip, (K) => {
        const brim = [[-70, 0, 1], [-50, -6], [0, -9], [50, -7], [72, -1, 1], [52, 7], [0, 10], [-50, 6]];
        cel(ctx, K, [blob(brim, 0.9)], C.col.hat, 4);
        line(ctx, K, [[-64, 1], [0, 5], [66, 0]], 0.34, 0.5, C.col.hat.shade);
        const crown = [[-31, 1], [-30, -16], [-22, -32], [-8, -43, 1], [-1, -35], [6, -44, 1], [20, -33], [30, -16], [32, 2]];
        cel(ctx, K, [blob(crown, 0.8)], C.col.hat, 9);
        line(ctx, K, [[-1, -34], [-3, -18], [-6, -4]], 0.4, 0.6);
        line(ctx, K, [[-17, -26], [-12, -15]], 0.34, 0.45);
        line(ctx, K, [[16, -27], [13, -16]], 0.34, 0.45);
        cel(ctx, K, [blob([[-31.5, -6], [32.5, -5], [32.5, 1.5], [-31.5, 1]], 0.4)], C.col.band, 1.5, 0);
        chip(ctx, K, [oval(20, -14, 5.5, 6.5)], '#D9BE5C', 0.4);
        chip(ctx, K, [oval(20, -14, 2.2, 2.6)], '#A88A36', 0.3);
      });
    },
    poses: {
      stand: {
        body: () => ({ tilt: -0.06, lean: -0.04, shrug: -1 }),
        arms: (o, t, J) => [
          Object.assign(hang(-0.06, 0.16), { hand: 'fist' }),
          { target: J.T([J.C.tw * 0.98, -18]), bendDir: -1, hand: 'fist', handA: J.rT + 1.2 },
        ],
      },
      shout: {
        expr: 'shout',
        body: (o, t) => ({ tilt: 0.04 + 0.03 * Math.sin(t * TAU * 3), lean: 0.24, headOff: [10, 2], drop: 3, feet: [[-20 * KL, 0], [18 * KL, 0]] }),
        arms: () => [hang(-0.32, 0.5), hang(-0.22, 0.42)],
        extra: () => () => ({}),
      },
      fling: {
        expr: 'shout',
        body: (o, t) => {
          const u = o.u == null ? clamp01(t / 1.5) : clamp01(o.u);
          const [lean, drop, tilt] = track([[0, 0, 0, 0], [0.18, 0.22, 4, 0.1], [0.32, 0.18, 8, 0.08], [0.5, -0.1, 2, -0.1], [0.62, -0.18, 0, -0.16], [0.76, 0.34, 10, 0.18], [0.86, 0.38, 13, 0.2], [1, 0.16, 5, 0.06]], u);
          return { lean, drop, tilt, feet: [[-22 * KL, 0], [20 * KL, 0]], u, hatTip: -tilt * 0.15 };
        },
        arms: (o, t, J) => {
          const u = J.o.u == null ? clamp01(t / 1.5) : clamp01(J.o.u);
          const k = flingKeys(u);
          const grip = u > 0.24 && u < 0.74;
          return [
            { target: k.n, hand: grip ? 'fist' : 'open', bendDir: 'low', handBend: grip ? 0.3 : 0.1 },
            { target: k.f, hand: grip ? 'fist' : 'open', bendDir: 'low', handBend: grip ? 0.3 : 0.1 },
          ];
        },
        nearBehind: (o, t) => {
          const u = o.u == null ? clamp01(t / 1.5) : clamp01(o.u);
          return u > 0.47 && u < 0.72;
        },
        extra: (o, t, J, near, far) => (W, A, gripOf) => {
          const u = J.o.u == null ? clamp01(t / 1.5) : clamp01(J.o.u);
          const gN = W(gripOf(near)), gF = W(gripOf(far));
          return { fling: { u, grip: u > 0.24 && u < 0.74 ? 1 : 0, release: 0.74, hands: [gN, gF], mid: mixP(gN, gF, 0.5) } };
        },
      },
      sniff: {
        expr: 'stern',
        body: () => ({ tilt: -0.2, lean: -0.1, headOff: [-4, 0], wrinkle: 1 }),
        arms: (o, t, J) => [
          { target: add(J.sN, [UA + FA - 10, -34]), hand: 'pinch', handA: -0.35, bendDir: 'low' },
          { target: J.T([J.C.tw * 0.98, -18]), bendDir: -1, hand: 'fist', handA: J.rT + 1.2 },
        ],
        extra: (o, t, J, near) => (W, A, gripOf) => {
          const g = W(gripOf(near));
          return { sock: { x: g[0], y: g[1], angle: A(near.handA) } };
        },
      },
      point: {
        expr: 'stern',
        body: () => ({ tilt: -0.02, lean: 0.1, headOff: [4, 0] }),
        arms: (o, t, J) => [
          { target: add(J.sN, [UA + FA - 4, -20]), hand: 'point', handA: -0.24, bendDir: 'low' },
          { target: J.T([J.C.tw * 0.98, -18]), bendDir: -1, hand: 'fist', handA: J.rT + 1.2 },
        ],
      },
    },
  });

  function flingKeys(u) {
    const [nx, ny, fx, fy] = track([
      [0, 10, -150, 26, -152],
      [0.18, 98, -166, 106, -174],
      [0.3, 94, -162, 102, -170],
      [0.45, -30, -178, -20, -186],
      [0.62, -100, -282, -88, -292],
      [0.76, 100, -146, 108, -154],
      [0.86, 86, -104, 96, -112],
      [1, 46, -140, 56, -146],
    ], u);
    return { n: [nx, ny], f: [fx, fy] };
  }

  const sergeant = make({
    name: 'sergeant', tw: 34, chest: 3, belly: 1, hem: 22, neckR: 11,
    armR: [13.5, 12, 11], legR: [16.5, 13, 12.5], hand: 1.12, eyeK: 1.05, browLen: 1.1, browW: 3.2,
    lower: 'trousers', shoe: 'boot', jaw: 'plain', ear: true, lashes: false, blush: 0.22, moustache: 0.72,
    shoutK: 1, shoutLines: 0.9, phase: 0.9, blinkOff: 0.88, expr: 'worried', defaultPose: 'crouch',
    topPattern: 'camo', legPattern: 'camo',
    exprMod: { shout: { brow: 0.5, lift: -1.5, eye: 'dot' }, stern: { brow: -0.2 } },
    col: {
      skin: tone('#E4B48C', '#C78F6B', 0.35),
      hair: tone('#3B2A1D', '#271B12', 0.25),
      top: tone('#D8C49C', '#B7A07A', 0.3),
      cuff: tone('#D2BD95', '#B09A74', 0.3),
      leg: tone('#D3BE96', '#B19A74', 0.3),
      shoe: tone('#B89A6C', '#937750', 0.3),
      sole: tone('#4A3C2C', '#33291E', 0.2),
      helmet: tone('#CDB68C', '#A98F66', 0.32),
      band: tone('#6A6444', '#4C482F', 0.25),
      web: tone('#77704C', '#57513A', 0.3),
      stache: tone('#3B2A1D', '#271B12', 0.25),
      eye: '#21170F', brow: '#2E2016',
    },
    torsoDetail(ctx, K, C) {
      const tw = C.tw;
      const colN = [[-6, -87], [10, -87], [14, -75, 1], [4, -80]];
      cel(ctx, K, [blob(colN, 0.6)], C.col.top, 2, 0);
      pattern(ctx, 'camo', [blob(colN, 0.6)], [0, -80], 0, 31);
      line(ctx, K, [[tw * 0.52, -78], [tw * 0.56, -30], [tw * 0.58, C.hem - 1]], 0.42, 0.7);
      const sF = ribbon([[tw * 0.55, -82], [tw * 0.72, -50], [tw * 0.74, -2]], [7, 6.5, 6]);
      cel(ctx, K, [blob(sF, 0.9)], C.col.web, 2.5);
      const sN = ribbon([[-tw * 0.55, -80], [-tw * 0.28, -50], [-tw * 0.18, -2]], [8, 7.5, 7]);
      cel(ctx, K, [blob(sN, 0.9)], C.col.web, 3);
      cel(ctx, K, [blob([[-tw * 0.97, -6], [tw * 1.0, -7], [tw * 1.0, 3], [-tw * 0.97, 4]], 0.3)], C.col.web, 2, 0);
      chip(ctx, K, [blob([[tw * 0.5, -7.5], [tw * 0.74, -7.5], [tw * 0.74, 4.5], [tw * 0.5, 4.5]], 0.3)], '#5E5A3E', 0.4);
      cel(ctx, K, [blob([[-tw * 0.98, -4], [-tw * 0.62, -5], [-tw * 0.6, 16], [-tw * 0.98, 15]], 0.5)], C.col.web, 2.5);
      line(ctx, K, [[-tw * 0.95, 1.5], [-tw * 0.63, 1]], 0.36, 0.6);
    },
    faceDetail(ctx, K, C, R, F) {
      const { cy, fx } = F;
      line(ctx, K, [[fx + 12, cy + 9], [fx + 10, cy + 15]], 0.32, 0.35);
    },
    hair(ctx, K, C, R, P) {
      const hp = [P(-10, -10, 0), P(-8, 2, 0), [...P(-12, 12, 0), 1], P(-18, 2, 0)];
      cel(ctx, K, [blob(hp, 0.85)], C.col.hair, 3, 1);
    },
    hat(ctx, K, C, R, P) {
      const hp = [
        [...P(47, -23), 1], P(41, -36), P(29, -54), P(6, -63, 0), P(-20, -61, 0), P(-42, -47, 0), P(-54, -22, 0), P(-56, -2, 0),
        [...P(-59, 10, 0), 1], P(-47, 8, 0), P(-34, 0, 0), P(-18, -6, 0), P(0, -14, 0), P(16, -19), P(32, -21),
      ];
      const parts = [blob(hp, 0.85)];
      line(ctx, K, [P(-19, -6, 0), P(-21, 14, 0), P(-17, 30, 0), P(-6, 41, 0)], 0.62, 0.95, '#5E5A3E');
      cel(ctx, K, parts, C.col.helmet, 13);
      pattern(ctx, 'camo', parts, P(0, -30, 0), R.rH * 0, 41);
      const band = ribbon([P(-52, -18, 0), P(-24, -31, 0), P(8, -36, 0), P(38, -33)], [7, 7, 7, 6.5]);
      cel(ctx, K, [blob(band, 0.9)], C.col.band, 2, 0);
      line(ctx, K, [P(-47, 6, 0), P(-20, -4, 0), P(16, -16), P(44, -21)], 0.42, 0.6);
    },
    poses: {
      stand: {
        expr: 'kind',
        body: () => ({ tilt: 0.04 }),
        arms: () => [hang(0.02, 0.26), hang(0.1, 0.28)],
      },
      crouch: {
        expr: 'worried',
        body: () => ({ drop: 60, shiftX: -14, lean: 0.36, tilt: -0.3, headOff: [6, 0], feet: [[-28 * KL, 0.32], [22 * KL, 0]] }),
        arms: (o, t, J) => [
          { target: add(J.legs[0].knee, [8, -8]), hand: 'relaxed', handA: 0.9, bendDir: 'low' },
          { target: add(J.T([J.C.tw + 30, -40]), [0, 0]), hand: 'open', handA: J.rT - 1.2, bendDir: 'low' },
        ],
      },
      waveDown: {
        expr: 'shout',
        body: (o) => {
          const c = o.crouch == null ? 0.65 : clamp01(o.crouch);
          return { drop: 60 * c, shiftX: -14 * c, lean: 0.12 + 0.24 * c, tilt: -0.08 - 0.22 * c, headOff: [5, 0], feet: [[-28 * KL, 0.32 * c], [22 * KL, 0]] };
        },
        arms: (o, t, J) => {
          const f = o.rate == null ? 2.2 : o.rate;
          const ph = (t * f) % 1;
          const w = ph < 0.34 ? sstep(0, 1, ph / 0.34) : 1 - sstep(0, 1, (ph - 0.34) / 0.66);
          const hi = add(J.sN, [84, -26]), lo = add(J.sN, [80, 34]);
          return [
            { target: mixP(hi, lo, w), hand: 'open', handA: lerp(-1.1, 0.75, w), bendDir: 'low' },
            { target: J.T([J.C.tw + 22, -30]), hand: 'open', handA: J.rT - 1.1, bendDir: 'low' },
          ];
        },
        extra: (o, t, J, near) => (W) => ({ waveHand: W(near.wrist) }),
      },
      shout: {
        expr: 'shout',
        body: (o) => {
          const c = o.crouch == null ? 0.4 : clamp01(o.crouch);
          return { drop: 60 * c, shiftX: -14 * c, lean: 0.16 + 0.2 * c, tilt: -0.14 - 0.2 * c, headOff: [6, 0], feet: [[-28 * KL, 0.32 * c], [22 * KL, 0]] };
        },
        arms: (o, t, J) => [
          { target: J.H(28, 44), hand: 'cup', handA: J.rH - 1.25, bendDir: 'low' },
          { target: J.T([J.C.tw + 18, -26]), hand: 'fist', handA: J.rT + 0.6, bendDir: 'low' },
        ],
      },
      pullIn: {
        expr: 'worried',
        body: (o, t) => {
          const hv = heaveOf(o, t);
          return { drop: 48 - 8 * hv, shiftX: -6 - 12 * hv, lean: -0.18 - 0.24 * hv, tilt: 0.3 + 0.12 * hv, feet: [[-34 * KL, 0.25], [28 * KL, -0.12]] };
        },
        arms: (o, t, J) => {
          const hv = heaveOf(o, t);
          const g = [lerp(70, 40, hv), lerp(-108, -116, hv)];
          return [
            { target: g, hand: 'fist', handA: 1.2, bendDir: 'low' },
            { target: add(g, [10, -6]), hand: 'fist', handA: 1.0, bendDir: 'low' },
          ];
        },
        extra: (o, t, J, near, far) => (W, A, gripOf, s) => {
          const gN = W(gripOf(near)), gF = W(gripOf(far));
          const f = o.facing === -1 ? -1 : 1;
          const partner = [add(gN, [16 * s * f, 10 * s]), add(gF, [16 * s * f, 6 * s])];
          return { drag: { grip: [gN, gF], partner, heave: heaveOf(o, t), angle: f === 1 ? 0.15 : Math.PI - 0.15 } };
        },
      },
    },
  });

  function heaveOf(o, t) {
    if (o.heave != null) return clamp01(o.heave);
    const ph = (t / 1.3) % 1;
    return ph < 0.4 ? sstep(0, 1, ph / 0.4) : 1 - sstep(0, 1, (ph - 0.4) / 0.6);
  }

  FILM.cast.mother = mother;
  FILM.cast.father = father;
  FILM.cast.drillSergeant = drillSergeant;
  FILM.cast.sergeant = sergeant;
})();
