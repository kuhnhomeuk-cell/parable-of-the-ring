// cast/store.js: character and prop builders (FILM.cast).
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
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const mixP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const inFrame = (o, a, p) => add(o, rot(p, a));

  function ik(rootP, target, a, b, pole) {
    const d0 = dist(rootP, target);
    const d = Math.max(Math.abs(a - b) + 1e-3, Math.min(d0, (a + b) * 0.999));
    const base = Math.atan2(target[1] - rootP[1], target[0] - rootP[0]);
    const k = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
    const m1 = add(rootP, [Math.cos(base - k) * a, Math.sin(base - k) * a]);
    const m2 = add(rootP, [Math.cos(base + k) * a, Math.sin(base + k) * a]);
    const mid = dist(m1, pole) < dist(m2, pole) ? m1 : m2;
    const end = add(rootP, [Math.cos(base) * d, Math.sin(base) * d]);
    return { mid, end };
  }

  function blinkAt(t) {
    const tt = t + 0.37;
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
  function celThin(ctx, K, parts, c, d, r, wk) {
    const K2 = Object.assign({}, K, { lw: Math.max(K.minLine * 0.5, K.lw * wk) });
    cel(ctx, K2, parts, c, d, r);
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
  function dot(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }

  const HAND = {
    relaxed: [[-1, -7], [7, -8.5], [14, -7], [18.5, -2.5], [18, 3.5], [13.5, 7.5], [8, 8], [9.5, 12.5], [6, 14.5], [2, 11], [-1, 7]],
    open: [[-1, -7], [11, -9], [26, -8.5], [34, -5], [34.5, 1.5], [26, 5], [12, 6.5], [15, 12.5], [11.5, 15.5], [3, 11], [-1, 7]],
    shake: [[-1, 7], [11, 9], [26, 8.5], [33, 5], [33.5, -1], [26, -4], [12, -6.5], [15, -12.5], [11.5, -15.5], [3, -11], [-1, -7]],
    pinch: [[-1, -7], [8, -9], [16, -8.5], [23, -5.5], [25.5, -2], [22, 0.5], [15, -0.5], [17, 5], [12, 10], [4, 10], [-1, 7]],
    cup: [[-1, -6], [10, -6.5], [24, -7], [30, -11], [34, -9], [31, -2], [20, 4], [12, 6], [6, 7], [2, 7.5], [-1, 6]],
    fist: [[-1, -7], [7, -9.5], [14, -9], [18.5, -5], [19, 2], [15.5, 7], [9, 8.5], [10, 12], [6, 13.5], [2, 11], [-1, 7]],
  };
  const SHAPES = Object.keys(HAND);
  const GRIP = { relaxed: [10, 2], open: [18, -1], shake: [18, 0], pinch: [24, -2.5], cup: [18, -8.5], fist: [10, 0] };

  function handPts(w) {
    const out = HAND.relaxed.map(() => [0, 0]);
    for (const k of SHAPES) {
      const wk = w[k] || 0;
      if (!wk) continue;
      HAND[k].forEach((p, i) => { out[i][0] += p[0] * wk; out[i][1] += p[1] * wk; });
    }
    return out;
  }
  function gripPt(w) {
    let x = 0, y = 0;
    for (const k of SHAPES) { x += GRIP[k][0] * (w[k] || 0); y += GRIP[k][1] * (w[k] || 0); }
    return [x, y];
  }
  function domShape(w) {
    let best = 'relaxed', bw = -1;
    for (const k of SHAPES) if ((w[k] || 0) > bw) { bw = w[k] || 0; best = k; }
    return best;
  }

  function drawHand(ctx, K, arm, c, scale) {
    frame(ctx, K, arm.wrist, arm.handA, (K0) => {
      ctx.scale(scale, scale);
      const K = Object.assign({}, K0, { lw: K0.lw / scale, minLine: K0.minLine / scale, rim: K0.rim / scale });
      const w = arm.shape;
      cel(ctx, K, [blob(handPts(w), 0.95)], c, 3.5);
      const d = domShape(w);
      const wd = w[d];
      if (d === 'open' || d === 'shake') {
        const sg = d === 'shake' ? -1 : 1;
        line(ctx, K, [[17, -4.5 * sg], [31, -3.5 * sg]], 0.34, 0.7 * wd);
        line(ctx, K, [[16, -0.8 * sg], [31, -0.3 * sg]], 0.34, 0.7 * wd);
        line(ctx, K, [[15, 2.8 * sg], [27, 3 * sg]], 0.34, 0.55 * wd);
        line(ctx, K, [[9, 5.5 * sg], [6.5, 9 * sg]], 0.4, 0.7);
      } else if (d === 'pinch') {
        line(ctx, K, [[15, -0.5], [10, 3], [12, 9]], 0.38, 0.75 * wd);
        line(ctx, K, [[10, -4], [17, -4.5]], 0.32, 0.5 * wd);
      } else if (d === 'cup') {
        line(ctx, K, [[22, -5], [29, -8.5]], 0.32, 0.6 * wd);
        line(ctx, K, [[8, 2], [17, 1]], 0.32, 0.5 * wd);
      } else if (d === 'fist') {
        line(ctx, K, [[12, -5], [16, -1], [14, 4]], 0.36, 0.7 * wd);
        line(ctx, K, [[8, 7.5], [5.5, 10]], 0.4, 0.7);
      } else {
        line(ctx, K, [[8, 7.5], [5.5, 9.5]], 0.4, 0.75);
      }
    });
  }

  const FACE_KEYS = ['browLift', 'browTilt', 'browAsym', 'eyeOpen', 'happy', 'lid', 'smile', 'smirk', 'open', 'frown', 'tear', 'moist', 'blush'];
  const EXPR = {
    neutral: {},
    scowl: { browLift: -5, browTilt: 0.5, eyeOpen: -0.2, lid: 0.3 },
    sneer: { browLift: -2, browAsym: 8, browTilt: 0.3, lid: 0.6, smirk: 1 },
    surprised: { browLift: 9, browTilt: -0.15, eyeOpen: 0.35 },
    smile: { browLift: 2, browTilt: -0.05, smile: 0.75, blush: 0.35 },
    warm: { browLift: 2.5, browTilt: -0.25, happy: 1, smile: 0.85, blush: 0.6 },
    tearful: { browLift: 3.5, browTilt: -0.5, moist: 1, tear: 1, frown: 0.75, blush: 0.55 },
    laugh: { browLift: 5, browTilt: -0.1, happy: 1, open: 1, blush: 0.6 },
  };

  function weightsOf(v, table, dflt) {
    if (v == null) return { [dflt]: 1 };
    if (typeof v === 'string') return table[v] ? { [v]: 1 } : { [dflt]: 1 };
    const out = {};
    for (const k in v) if (table[k] && Number(v[k])) out[k] = Number(v[k]);
    return out;
  }

  const BODY_KEYS = ['lean', 'hipDx', 'hipDy', 'nod', 'headDx', 'headDy', 'turn', 'eyeUp', 'eyeDx', 'bodyRise'];

  function solve(D, o) {
    const t = o.t || 0;
    const PW = weightsOf(o.pose, D.poses, 'stand');
    const counterL = o.counterY != null && isFinite(o.counterY) ? (o.counterY - (o.y || 0)) / ((o.h || D.H) / D.H) : D.counterL;
    const S0 = { t, o, D, counterL };
    const stand = D.poses.stand.body ? D.poses.stand.body(S0) : {};
    const body = {};
    for (const k of BODY_KEYS) body[k] = stand[k] || 0;
    const face = {};
    for (const k of FACE_KEYS) face[k] = (D.faceBase[k] || 0) + (stand[k] || 0);
    for (const name in PW) {
      if (name === 'stand' || !D.poses[name].body) continue;
      const b = D.poses[name].body(S0);
      const w = PW[name];
      for (const k of BODY_KEYS) if (b[k] != null) body[k] += w * (b[k] - (stand[k] || 0));
      for (const k of FACE_KEYS) if (b[k] != null) face[k] += w * (b[k] - (stand[k] || 0));
    }
    const EW = weightsOf(o.expr, EXPR, 'neutral');
    for (const name in EW) for (const k in EXPR[name]) face[k] += EW[name] * EXPR[name][k];
    face.browTilt = clamp(face.browTilt, -0.65, 0.62);
    face.browLift = clamp(face.browLift, -7, 11);
    face.lid = clamp(face.lid, 0, 0.6);
    const look = clamp(o.look || 0, -1, 1);
    const breath = Math.sin((TAU * t) / 3.9 + D.seed);

    const hy = D.HIP + body.hipDy - body.bodyRise;
    const pelvis = [body.hipDx, hy + D.TORSO_DY];
    const rT = body.lean;
    const T = (q) => inFrame(pelvis, rT, [q[0], q[1] - 0.5 * breath * (q[1] < -40 ? 1 : 0)]);
    const shoulderN = T(D.shoulder[0]);
    const shoulderF = T(D.shoulder[1]);
    const neck = T(D.neck);
    const rH = rT * D.headFollow + body.nod - 0.22 * look;
    const headO = add(neck, [body.headDx, body.headDy]);
    const headPt = (p) => inFrame(headO, rH, p);
    const legs = [0, 1].map((side) => {
      const hip = [D.hipX[side] + body.hipDx, hy];
      const ankle = D.ankle[side];
      const { mid: knee, end } = ik(hip, ankle, D.L1, D.L2, add(hip, [60, 30]));
      return { hip, knee, ankle: end, phi: 0 };
    });
    const S = Object.assign({}, S0, { body, pelvis, rT, rH, shoulders: [shoulderN, shoulderF], neck, headO, headPt, face, breath });

    const hang = (side) => {
      const sh = S.shoulders[side];
      return { w: add(sh, [side ? 16 : 2, D.UA + D.FA - (side ? 12 : 8)]), pole: add(sh, [-30, 40]), ha: null, shape: { relaxed: 1 } };
    };
    const standArms = D.poses.stand.arms ? D.poses.stand.arms(S, hang) : { n: hang(0), f: hang(1) };
    let farFront = standArms.farFront || 0;
    const armIn = [standArms.n, standArms.f].map((a) => ({ w: a.w.slice(), pole: a.pole.slice(), shape: Object.assign({}, a.shape) }));
    const contrib = [];
    for (const name in PW) {
      if (name === 'stand' || !D.poses[name].arms) continue;
      const A = D.poses[name].arms(S, hang);
      const w = PW[name];
      contrib.push({ A, w });
      farFront += w * ((A.farFront || 0) - (standArms.farFront || 0));
      [A.n, A.f].forEach((a, i) => {
        if (!a) return;
        const s0 = i ? standArms.f : standArms.n;
        armIn[i].w = add(armIn[i].w, [(a.w[0] - s0.w[0]) * w, (a.w[1] - s0.w[1]) * w]);
        armIn[i].pole = add(armIn[i].pole, [(a.pole[0] - s0.pole[0]) * w, (a.pole[1] - s0.pole[1]) * w]);
        for (const k of SHAPES) armIn[i].shape[k] = (armIn[i].shape[k] || 0) + w * (((a.shape && a.shape[k]) || 0) - ((s0.shape && s0.shape[k]) || 0));
      });
    }
    const arms = armIn.map((a, i) => {
      const sh = S.shoulders[i];
      const { mid: elbow, end: wrist } = ik(sh, a.w, D.UA, D.FA, a.pole);
      const follow = Math.atan2(wrist[1] - elbow[1], wrist[0] - elbow[0]) + 0.12;
      const s0 = i ? standArms.f : standArms.n;
      const resolve = (x) => (x == null ? follow : x);
      let ha = resolve(s0.ha);
      for (const c of contrib) {
        const ai = i ? c.A.f : c.A.n;
        if (!ai) continue;
        let d = resolve(ai.ha) - resolve(s0.ha);
        d = Math.atan2(Math.sin(d), Math.cos(d));
        ha += c.w * d;
      }
      let sum = 0;
      for (const k of SHAPES) { a.shape[k] = Math.max(0, a.shape[k] || 0); sum += a.shape[k]; }
      if (sum <= 1e-6) a.shape = { relaxed: 1 };
      else for (const k of SHAPES) a.shape[k] /= sum;
      return { shoulder: sh, elbow, wrist, handA: ha, shape: a.shape };
    });
    const blink = blinkAt(t + D.seed);
    let ringHand = 0, bestW = -1;
    for (const name in PW) if (PW[name] > bestW) { bestW = PW[name]; ringHand = D.poses[name].ringHand || 0; }
    return Object.assign(S, { legs, arms, farFront, look, blink, PW, ringHand, counterL });
  }

  function armGrip(D, arm) {
    const g = gripPt(arm.shape);
    return inFrame(arm.wrist, arm.handA, [g[0] * D.handScale, g[1] * D.handScale]);
  }

  function eyes(ctx, K, R, F, sp) {
    const close = R.blink;
    const happy = clamp01(F.happy);
    const open = Math.max(0.35, 1 + F.eyeOpen);
    const lid = clamp01(F.lid);
    const up = R.body.eyeUp, dx = R.body.eyeDx;
    for (let i = 0; i < 2; i++) {
      const fk = i ? sp.farK : 1;
      const rx = sp.eyeR[0] * fk * (0.85 + 0.15 * open);
      const ry0 = sp.eyeR[1] * fk * open;
      const x = sp.ex[i] + dx * 2.5, y = sp.eyeY - up * 3.2;
      const cl = Math.max(close, happy * 0.9);
      const ry = ry0 * (1 - 0.82 * close);
      if (cl < 0.75) {
        ctx.save();
        if (lid > 0.02) {
          ctx.beginPath();
          ctx.rect(x - 20, y - ry0 + ry0 * 1.1 * lid, 40, 60);
          ctx.clip();
        }
        ctx.fillStyle = sp.eye;
        ctx.beginPath();
        ctx.ellipse(x, y + 1.5 * close, rx, Math.max(1.3, ry), 0, 0, TAU);
        ctx.fill();
        ctx.restore();
        if (close < 0.4) {
          const m = clamp01(F.moist);
          ctx.fillStyle = 'rgba(255,248,232,' + 0.9 * (1 - close / 0.4) + ')';
          ctx.beginPath();
          ctx.arc(x + 1.6 * (K.lx > 0 ? 1 : -1), y - ry * 0.38 + lid * ry0 * 0.5, 1.5 + 0.9 * m, 0, TAU);
          ctx.fill();
          if (m > 0.05) {
            ctx.fillStyle = 'rgba(255,252,244,' + 0.8 * m + ')';
            ctx.beginPath();
            ctx.arc(x - 1.6 * (K.lx > 0 ? 1 : -1), y + ry * 0.35, 0.9 + 0.5 * m, 0, TAU);
            ctx.fill();
          }
        }
        if (lid > 0.15) line(ctx, K, [[x - rx - 2, y - ry0 + ry0 * 1.1 * lid + 0.5], [x + rx + 2, y - ry0 + ry0 * 1.1 * lid - 0.5]], 0.5, clamp01(lid * 2), sp.eye);
      }
      if (cl >= 0.5) {
        const a = clamp01((cl - 0.5) / 0.25);
        const pts = happy > close
          ? [[x - rx - 1.5, y + 2.5], [x, y - 2.5], [x + rx + 1.5, y + 2.5]]
          : [[x - rx - 1.5, y + 1], [x, y + 3.5], [x + rx + 1.5, y + 1]];
        line(ctx, K, pts, 0.6, a, sp.eye);
      }
      if (F.moist > 0.05 && cl < 0.75) {
        line(ctx, K, [[x - rx - 1, y + ry0 + 1.8], [x, y + ry0 + 3], [x + rx + 1, y + ry0 + 1.8]], 0.5, 0.75 * clamp01(F.moist), '#BFE0F2');
      }
    }
    if (F.tear > 0.05) {
      const x0 = sp.ex[sp.tearSide] + (sp.tearSide ? 3 : -3), y0 = sp.eyeY + sp.eyeR[1] + 2;
      const k = clamp01(F.tear);
      const ph = (((R.t + R.D.seed) / 1.7) % 1 + 1) % 1;
      const ty = y0 + 4 + ph * 26;
      const ta = k * Math.min(1, ph / 0.12) * (1 - sstep(0.7, 1, ph));
      line(ctx, K, [[x0, y0 + 1], [x0 - 0.6, y0 + 10], [x0 - 1, Math.max(y0 + 11, ty - 3)]], 0.7, 0.45 * k, '#CFE9F7');
      ctx.save();
      ctx.globalAlpha *= ta;
      ctx.fillStyle = '#D9F0FB';
      ctx.strokeStyle = 'rgba(70,120,150,0.8)';
      ctx.lineWidth = Math.max(K.minLine, K.lw * 0.35);
      ctx.beginPath();
      ctx.moveTo(x0 - 1, ty - 6);
      ctx.quadraticCurveTo(x0 + 2.6, ty - 0.5, x0 - 1, ty + 2.6);
      ctx.quadraticCurveTo(x0 - 4.6, ty - 0.5, x0 - 1, ty - 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  function blush(ctx, sp, F) {
    const k = 0.42 * sp.blushK + 0.4 * clamp01(F.blush);
    for (let i = 0; i < 2; i++) {
      const bx = sp.ex[i] + (i ? 6 : -6), by = sp.blushY;
      const rx = (i ? 7 : 9.5) * sp.blushR;
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, rx);
      g.addColorStop(0, 'rgba(239,138,110,' + k + ')');
      g.addColorStop(1, 'rgba(239,138,110,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(bx, by, rx, rx * 0.62, 0, 0, TAU);
      ctx.fill();
    }
  }

  function mouth(ctx, K, R, F, sp) {
    const [mx, my] = sp.mouth;
    const w = sp.mouthW;
    const sm = clamp01(F.smile), op = clamp01(F.open), fr = clamp01(F.frown), sk = clamp01(F.smirk);
    if (op > 0.1) {
      const ow = w * (0.9 + 0.3 * op), oh = 9 * op;
      const pts = [[mx - ow, my - 1, 1], [mx, my + 0.5], [mx + ow * 0.9, my - 1.5, 1], [mx + ow * 0.6, my + oh * 0.7], [mx, my + oh], [mx - ow * 0.6, my + oh * 0.6]];
      const P = [blob(pts, 0.9)];
      build(ctx, P);
      ctx.fillStyle = '#6A2A24';
      ctx.fill();
      ctx.save();
      build(ctx, P);
      ctx.clip();
      ctx.fillStyle = '#E27A6E';
      ctx.beginPath();
      ctx.ellipse(mx + 1, my + oh * 1.05, ow * 0.6, oh * 0.48, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      build(ctx, P);
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(K.minLine, K.lw * 0.6);
      ctx.lineJoin = 'round';
      ctx.stroke();
      return;
    }
    if (fr > 0.12) {
      const a = fr;
      const ww = w * 0.75;
      line(ctx, K, [[mx - ww, my + 3 * a], [mx - ww * 0.4, my + 0.4 * a], [mx + ww * 0.15, my + 1.6 * a], [mx + ww * 0.6, my + 0.3 * a], [mx + ww, my + 2.8 * a]], 0.55, 0.85);
      return;
    }
    if (sk > 0.12 && sk >= sm) {
      line(ctx, K, [[mx - w * 0.45, my + 1], [mx + w * 0.3, my + 1.6 * sk], [mx + w * 0.85, my - 3.5 * sk]], 0.55, 0.9);
      return;
    }
    if (sm > 0.12) {
      const ww = w * (0.55 + 0.45 * sm);
      line(ctx, K, [[mx - ww, my - 1.5 * sm], [mx, my + 3.8 * sm], [mx + ww * 0.9, my - 1.8 * sm]], 0.58, Math.min(1, sm * 1.6));
    }
  }

  function drawFigure(D, ctx, o) {
    o = o || {};
    const h = Math.max(20, o.h || D.H);
    const s = h / D.H;
    const facing = o.facing === -1 ? -1 : 1;
    const R = solve(D, o);
    const C = D.palette(o);
    const lwPx = Math.max(2.5, (6 * h) / D.H);
    const L0 = Array.isArray(o.light) ? o.light : [0.78, -0.62];
    const lm = Math.hypot(L0[0], L0[1]) || 1;
    const K = {
      lw: lwPx / s / 2,
      minLine: 1.15 / s,
      lx0: (L0[0] / lm) * facing, ly0: L0[1] / lm, lx: (L0[0] / lm) * facing, ly: L0[1] / lm, baseRot: 0,
      rim: Math.max(2.6, 1.2 / s),
    };
    ctx.save();
    ctx.translate(o.x || 0, o.y || 0);
    ctx.scale(s * facing, s);
    const behind = o.counterY != null && isFinite(o.counterY);
    if (behind) {
      ctx.beginPath();
      ctx.rect(-4000, -4000, 8000, 4000 + R.counterL);
      ctx.clip();
    } else {
      ctx.save();
      ctx.translate(-12 * Math.sign(K.lx0 || 1) * facing, 0);
      ctx.scale(1, 0.15);
      const g = ctx.createRadialGradient(0, 0, 8, 0, 0, D.shadowR);
      g.addColorStop(0, 'rgba(70,40,18,0.34)');
      g.addColorStop(0.6, 'rgba(70,40,18,0.2)');
      g.addColorStop(1, 'rgba(70,40,18,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, D.shadowR, 0, TAU);
      ctx.fill();
      ctx.restore();
      for (const leg of R.legs) {
        ctx.fillStyle = 'rgba(70,40,18,0.26)';
        ctx.beginPath();
        ctx.ellipse(leg.ankle[0] + 8, 1, 26, 4.5, 0, 0, TAU);
        ctx.fill();
      }
    }
    const legsOn = !behind || R.counterL > D.HIP - 30;
    if (R.farFront < 0.5) D.arm(ctx, K, R, C, 1, true);
    if (legsOn) {
      D.leg(ctx, K, R, C, 1, true);
      D.leg(ctx, K, R, C, 0, false);
    }
    D.torso(ctx, K, R, C);
    if (R.farFront >= 0.5) D.arm(ctx, K, R, C, 1, false);
    D.head(ctx, K, R, C);
    if (D.extra) D.extra(ctx, K, R, C);
    D.arm(ctx, K, R, C, 0, false);
    ctx.restore();
  }

  function poseOf(D, o) {
    o = o || {};
    const h = Math.max(20, o.h || D.H);
    const s = h / D.H;
    const f = o.facing === -1 ? -1 : 1;
    const R = solve(D, o);
    const W = (p) => [(o.x || 0) + p[0] * s * f, (o.y || 0) + p[1] * s];
    const grips = R.arms.map((a) => W(armGrip(D, a)));
    const eye = D.eyePts(R);
    return {
      hands: grips,
      wrists: R.arms.map((a) => W(a.wrist)),
      handAngles: R.arms.map((a) => (f > 0 ? a.handA : Math.PI - a.handA)),
      ring: grips[R.ringHand],
      head: W(R.headPt(D.headC)),
      top: W(R.headPt(D.headTop)),
      eyes: eye.map(W),
      counterY: (o.y || 0) + R.counterL * s,
      scale: s,
    };
  }

  function sleeve(ctx, K, R, D, arm, c, cuffC, skin, r) {
    const { shoulder: sh, elbow: e, wrist: w } = arm;
    const fd = sub(w, e);
    const fl = Math.hypot(fd[0], fd[1]) || 1;
    const u = [fd[0] / fl, fd[1] / fl];
    const cuffA = sub(w, [u[0] * r.cuffLen, u[1] * r.cuffLen]);
    drawHand(ctx, K, { wrist: add(w, [u[0], u[1]]), handA: arm.handA, shape: arm.shape }, skin, D.handScale);
    if (cuffC) cel(ctx, K, [capsule(cuffA[0], cuffA[1], r.cuff, w[0] - u[0] * 0.5, w[1] - u[1] * 0.5, r.cuff * 0.95)], cuffC, 3, 0);
    const end = sub(w, [u[0] * (cuffC ? r.cuffLen * 0.85 : 2), u[1] * (cuffC ? r.cuffLen * 0.85 : 2)]);
    cel(ctx, K, [capsule(sh[0], sh[1], r.top, e[0], e[1], r.elbow), capsule(e[0], e[1], r.elbow, end[0], end[1], r.wrist)], c, 6);
    const n = [-u[1], u[0]];
    line(ctx, K, [add(e, [n[0] * 3 - u[0] * 2, n[1] * 3 - u[1] * 2]), add(e, [n[0] * 8 + u[0] * 3, n[1] * 8 + u[1] * 3])], 0.4, 0.5);
    return { u, end };
  }

  const SH = 412.5;
  const COUNTER_K = 0.52;
  const S_COUNTER = -COUNTER_K * 330;

  function salesmanPalette(o) {
    const w = clamp01(o.warmth || 0);
    const m = (cool, warm, rimK) => {
      const b = hmix(cool[0], warm[0], w), s = hmix(cool[1], warm[1], w);
      return { base: b, shade: s, rim: hmix(b, SUN, (rimK || 0.3) * (0.55 + 0.45 * w)) };
    };
    const C = {
      skin: m(['#EACFC0', '#C2A39E'], ['#F4CBA8', '#DCA083'], 0.36),
      hair: m(['#B6BBC2', '#858B95'], ['#C9C2B9', '#998F86'], 0.35),
      brow: m(['#F7F6F2', '#C6C6C4'], ['#FBF6EC', '#D6CCBC'], 0.15),
      suit: m(['#383E4A', '#232833'], ['#4A3E3A', '#2E2524'], 0.3),
      vest: m(['#555C69', '#3A3F4B'], ['#6A5B52', '#4A3D36'], 0.3),
      shirt: m(['#EEF1F2', '#BEC4CC'], ['#FAF4E8', '#D8CBB6'], 0.15),
      tie: m(['#5A2A37', '#3B1A25'], ['#8E3D35', '#632722'], 0.35),
      shoe: m(['#2A2726', '#161313'], ['#33261F', '#1C1411'], 0.25),
      metal: hmix('#8F969E', '#A99474', w),
      eye: '#21170F',
    };
    C.far = { suit: farTone(C.suit), skin: farTone(C.skin), shirt: farTone(C.shirt), shoe: farTone(C.shoe) };
    return C;
  }

  const SD = {
    H: SH,
    seed: 1.13,
    HIP: -165,
    TORSO_DY: 6,
    L1: 78,
    L2: 76,
    hipX: [-6, 8],
    ankle: [[-9, -12], [11, -12]],
    shoulder: [[-17, -110], [23, -110]],
    neck: [5, -119],
    headFollow: 0.55,
    UA: 58,
    FA: 52,
    handScale: 1.12,
    shadowR: 80,
    counterL: S_COUNTER,
    headC: [5, -64],
    headTop: [5, -134],
    faceBase: { browTilt: 0.12, lid: 0.12 },
  };

  const flickAt = (t) => {
    const q = ((t % 2.6) + 2.6) % 2.6;
    return sstep(1.1, 1.25, q) * (1 - sstep(1.75, 1.95, q));
  };
  function jerkCurve(s) {
    s = clamp01(s);
    if (s < 0.25) return -0.2 * Math.sin((Math.PI * s) / 0.25);
    const q = (s - 0.25) / 0.75;
    const B = 2.2;
    return 1 + (B + 1) * Math.pow(q - 1, 3) + B * Math.pow(q - 1, 2);
  }

  SD.poses = {
    stand: {
      body: () => ({ lean: 0.02 }),
    },
    leanGlare: {
      body: () => ({ lean: 0.36, hipDx: -10, nod: 0.08, eyeUp: -0.45, browLift: -6, browTilt: 0.6, lid: 0.4, eyeOpen: -0.1 }),
      arms: (S) => {
        const c = S.counterL;
        const [sn, sf] = S.shoulders;
        return {
          n: { w: [50, c - 13], pole: add(sn, [-40, 20]), ha: 0.1, shape: { open: 1 } },
          f: { w: [36, c - 15], pole: add(sf, [-30, 30]), ha: 0.02, shape: { open: 1 } },
        };
      },
    },
    holdUp: {
      body: () => ({ lean: -0.05, hipDx: 3, nod: -0.2, eyeUp: 0.9, eyeDx: 0.5, browLift: 3, lid: 0.15 }),
      arms: (S, hang) => ({
        n: { w: [78, -304], pole: [30, -230], ha: -1.15, shape: { pinch: 1 } },
        f: { w: [44, S.counterL - 12], pole: add(S.shoulders[1], [-30, 40]), ha: 0.15, shape: { relaxed: 1 } },
      }),
    },
    jerkAway: {
      body: (S) => {
        const g = jerkCurve(S.o.jerk == null ? 1 : S.o.jerk);
        return {
          lean: lerp(0.14, -0.2, g), hipDx: lerp(-4, 8, g), nod: lerp(0.08, -0.16, g), headDx: lerp(2, -3, g),
          browLift: -5, browTilt: 0.5, eyeOpen: 0.15, eyeUp: lerp(-0.2, 0, g),
        };
      },
      arms: (S, hang) => {
        const g = jerkCurve(S.o.jerk == null ? 1 : S.o.jerk);
        const fh = { w: add(S.shoulders[1], [40, 44]), pole: add(S.shoulders[1], [-20, 50]), ha: 0.9 };
        return {
          n: { w: mixP([76, -262], [-2, -252], g), pole: mixP([10, -200], [-40, -205], g), ha: lerp(-0.3, -1.45, g), shape: { pinch: 1 } },
          f: { w: mixP(fh.w, add(S.shoulders[1], [46, 24]), clamp01(g)), pole: mixP(fh.pole, add(S.shoulders[1], [10, 60]), clamp01(g)), ha: lerp(1.4, -1.35, clamp01(g)), shape: { open: clamp01(g), relaxed: clamp01(1 - g) } },
        };
      },
    },
    armsFolded: {
      body: () => ({ lean: -0.06, hipDx: 4, nod: -0.06, browLift: -3, browTilt: 0.32, lid: 0.3 }),
      arms: (S) => {
        const [sn, sf] = S.shoulders;
        return {
          n: { w: add(sn, [52, 42]), pole: add(sn, [-14, 60]), ha: -2.75, shape: { fist: 1 } },
          f: { w: add(sf, [-34, 30]), pole: add(sf, [26, 56]), ha: -2.9, shape: { fist: 1 } },
          farFront: 1,
        };
      },
    },
    headShake: {
      body: (S) => {
        const a = S.o.shake == null ? 1 : S.o.shake;
        const ph = TAU * 2.2 * S.t;
        return { turn: Math.sin(ph) * 0.75 * a, nod: 0.04 * a + Math.sin(ph * 2) * 0.012 * a, headDx: Math.sin(ph) * 2.5 * a, browLift: -2, browTilt: 0.25, lid: 0.25 };
      },
    },
    barelyLook: {
      body: (S) => {
        const fl = S.o.flick == null ? flickAt(S.t) : clamp01(S.o.flick);
        return { lean: 0.22, hipDx: -6, nod: lerp(0.36, 0.28, fl), eyeUp: lerp(-0.7, 1.1, fl), browLift: lerp(-3, 2.5, fl), browTilt: 0.18, lid: lerp(0.55, 0.1, fl) };
      },
      arms: (S) => {
        const c = S.counterL;
        return {
          n: { w: [60, c - 12], pole: [10, c + 5], ha: 0.55, shape: { pinch: 1 } },
          f: { w: [34, c - 13], pole: [20, c + 10], ha: 0.1, shape: { open: 1 } },
        };
      },
    },
    polishOffer: {
      body: () => ({ lean: 0.1, hipDx: -3, nod: 0.06, smile: 0.5, browLift: 2.5, browTilt: -0.12, eyeUp: -0.1 }),
      arms: (S, hang) => ({
        n: { w: [74, -252], pole: [10, -190], ha: -0.95, shape: { pinch: 1 } },
        f: hang(1),
      }),
    },
    handshake: {
      body: () => ({ lean: 0.08, hipDx: -2, nod: 0.03, smile: 0.35, browLift: 1.5, browTilt: -0.05 }),
      arms: (S, hang) => ({
        n: { w: [74, -212], pole: [-10, -170], ha: 0.05, shape: { shake: 1 } },
        f: hang(1),
      }),
    },
    apologise: {
      body: () => ({ lean: 0.26, hipDx: -9, nod: 0.18, eyeUp: 0.35, smile: 0.2, frown: 0.25, browLift: 3, browTilt: -0.5, moist: 1, tear: 0.4, lid: -0.05 }),
      arms: () => ({
        n: { w: [78, -206], pole: [0, -165], ha: 0.08, shape: { shake: 1 } },
        f: { w: [72, -220], pole: [30, -175], ha: 0.25, shape: { open: 1 } },
        farFront: 1,
      }),
    },
  };

  SD.palette = salesmanPalette;

  SD.leg = function (ctx, K, R, C, side, far) {
    const leg = R.legs[side];
    const c = far ? C.far : C;
    frame(ctx, K, leg.ankle, 0, (K) => {
      const shoe = [[-14, -6], [-4, -10], [10, -8], [24, -2], [35, 3], [37, 9], [34, 12.5], [-14, 12.5], [-17, 6]];
      cel(ctx, K, [blob(shoe, 0.85)], c.shoe, 4);
      line(ctx, K, [[-15, 9.5], [10, 10.2], [35, 9.6]], 0.36, 0.5, '#5B524C');
      line(ctx, K, [[8, -7], [13, -2], [11, 3]], 0.4, 0.6, '#5B524C');
      ctx.save();
      ctx.globalAlpha *= 0.6;
      dot(ctx, 22, 0, 2.2, 'rgba(255,240,220,0.45)');
      ctx.restore();
    });
    const { hip, knee, ankle } = leg;
    const dir = sub(ankle, knee);
    const dl = Math.hypot(dir[0], dir[1]) || 1;
    const hem = sub(ankle, [(dir[0] / dl) * 6, (dir[1] / dl) * 6]);
    cel(ctx, K, [capsule(hip[0], hip[1], 15.5, knee[0], knee[1], 12.5), capsule(knee[0], knee[1], 12.5, hem[0], hem[1], 12.5)], c.suit, 6.5);
    line(ctx, K, [add(knee, [7, -30]), add(knee, [7, 0]), add(hem, [6, -2])], 0.36, 0.35);
  };

  SD.arm = function (ctx, K, R, C, side, far) {
    const arm = R.arms[side];
    const c = far ? C.far : C;
    sleeve(ctx, K, R, SD, arm, c.suit, c.shirt, c.skin, { top: 12, elbow: 10, wrist: 9.5, cuff: 8.6, cuffLen: 6 });
  };

  const S_TORSO = [[6, -120], [19, -115], [25, -103], [26, -80], [24, -52], [25, -24], [28, 2], [30, 22], [8, 26], [-18, 24], [-28, 20], [-28, -4], [-25, -38], [-25, -72], [-24, -100], [-17, -114]];

  SD.torso = function (ctx, K, R, C) {
    frame(ctx, K, R.pelvis, R.rT, (K) => {
      const by = 0.5 * R.breath;
      const pts = S_TORSO.map((p) => [p[0], p[1] - (p[1] < -40 ? by : 0)]);
      const body = [blob(pts, 0.9)];
      cel(ctx, K, body, C.suit, 11);
      ctx.save();
      build(ctx, body);
      ctx.clip();
      const vest = [[-5, -122], [20, -122], [11, -58, 1]];
      build(ctx, [blob(vest, 0.4)]);
      ctx.fillStyle = C.vest.base;
      ctx.fill();
      shade(ctx, K, [body, [blob(vest, 0.4)]], body, C.vest, 9, K.rim * 0.6);
      const shirt = [[-1, -122], [17, -122], [10, -88, 1]];
      build(ctx, [blob(shirt, 0.4)]);
      ctx.fillStyle = C.shirt.base;
      ctx.fill();
      shade(ctx, K, [body, [blob(shirt, 0.4)]], body, C.shirt, 9, 0);
      ctx.restore();
      cel(ctx, K, [blob([[4.5, -116], [12.5, -116], [11.5, -109], [6, -109]], 0.5)], C.tie, 2, 0);
      cel(ctx, K, [blob([[6, -109.5], [11.5, -109.5], [12.5, -92], [9, -87, 1], [5.5, -92]], 0.6)], C.tie, 2.5, 0);
      line(ctx, K, [[-1, -112], [10, -88]], 0.4, 0.8);
      line(ctx, K, [[17, -112], [10.5, -88]], 0.4, 0.8);
      dot(ctx, 10.3, -80, 1.6, INK);
      dot(ctx, 10.6, -71, 1.6, INK);
      celThin(ctx, K, [blob([[-1, -123], [5, -114, 1], [0, -110]], 0.5)], C.shirt, 1.5, 0, 0.6);
      celThin(ctx, K, [blob([[18, -123], [12, -114, 1], [17, -110]], 0.5)], C.shirt, 1.5, 0, 0.6);
      const lapN = [[-6, -121], [-1, -119], [10, -60, 1], [-3, -86], [-9, -104], [-6, -108, 1], [-11, -110]];
      const lapF = [[19, -120], [25, -112], [22, -106, 1], [24, -100], [10.5, -60, 1], [15, -100]];
      cel(ctx, K, [blob(lapN, 0.6)], C.suit, 4, K.rim * 0.8);
      cel(ctx, K, [blob(lapF, 0.6)], C.suit, 4, K.rim * 0.8);
      dot(ctx, 10.5, -54, 2.2, INK);
      dot(ctx, 11, -36, 2.2, INK);
      line(ctx, K, [[10.5, -58], [11, -30], [13, 0], [17, 24]], 0.42, 0.75);
      line(ctx, K, [[-22, -6], [-14, -5], [-6, -6]], 0.38, 0.65);
      line(ctx, K, [[15, -6], [21, -6.5], [26, -7]], 0.38, 0.65);
      celThin(ctx, K, [blob([[-21, -86], [-17, -92, 1], [-14.5, -88], [-12, -91, 1], [-10, -86]], 0.5)], C.shirt, 1.5, 0, 0.55);
      line(ctx, K, [[-23, -85.5], [-9, -85.5]], 0.38, 0.7);
      line(ctx, K, [[-22, -40], [-15, -30]], 0.34, 0.4);
    });
  };

  const SHEAD = { cx: 4, cy: -64 };
  const sFace = (R) => {
    const lk = R.body.turn * 16 + R.look * 5;
    const fx = SHEAD.cx + 18 + lk;
    const eyeY = SHEAD.cy - 3 - 3 * Math.max(0, R.look);
    return { lk, fx, eyeY, ex: [fx - 13, fx + 12] };
  };
  SD.eyePts = (R) => {
    const f = sFace(R);
    return [R.headPt([f.ex[0], f.eyeY]), R.headPt([f.ex[1], f.eyeY])];
  };

  function bushyBrow(ctx, K, x, y, len, ht, out, ang, C, droop) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    const P = (u, v, c) => [out * (u - 0.45) * len, v + droop * u * u * ht, c];
    const pts = [
      P(-0.04, ht * 0.35), P(-0.02, -ht * 0.55), P(0.08, -ht * 1.05, 1), P(0.16, -ht * 0.75), P(0.3, -ht * 1.35, 1), P(0.4, -ht * 0.95),
      P(0.56, -ht * 1.45, 1), P(0.66, -ht * 1.0), P(0.82, -ht * 1.3, 1), P(0.88, -ht * 0.6), P(1.12, -ht * 0.35, 1), P(0.96, ht * 0.15),
      P(1.06, ht * 0.75, 1), P(0.8, ht * 0.5), P(0.56, ht * 0.75, 1), P(0.4, ht * 0.5), P(0.18, ht * 0.75, 1),
    ];
    const Kb = Object.assign({}, K, { lw: K.lw * 0.6 });
    cel(ctx, Kb, [blob(pts, 0.75)], C.brow, ht * 0.45, 0);
    line(ctx, K, [P(0.12, ht * 0.05), P(0.42, -ht * 0.35), P(0.72, -ht * 0.25)], 0.3, 0.6, C.brow.shade);
    line(ctx, K, [P(0.3, ht * 0.35), P(0.62, ht * 0.05), P(0.9, ht * 0.0)], 0.28, 0.5, C.brow.shade);
    ctx.restore();
  }

  SD.head = function (ctx, K, R, C) {
    frame(ctx, K, R.headO, R.rH, (K) => {
      const F = R.face;
      const { cx, cy } = SHEAD;
      const { lk, fx, eyeY, ex } = sFace(R);
      const P = (x, y, w) => [cx + x + lk * (w == null ? Math.max(0, x / 48) : w), cy + y];
      const back = [P(-26, -56, 0), P(-44, -36, 0), P(-50, -8, 0), P(-46, 20, 0), [cx - 36, cy + 30, 1], P(-24, 18, 0), P(-12, -20, 0)];
      cel(ctx, K, [blob(back, 0.9)], C.hair, 6);
      const skull = [P(2, -64), P(28, -60), P(42, -44), P(47, -18), P(47, 8), P(45, 30), P(38, 50), P(26, 66), P(10, 73), P(-8, 68, 0), P(-26, 54, 0), P(-40, 30, 0), P(-46, -4, 0), P(-42, -38, 0), P(-22, -60, 0)];
      const skin = [blob(skull, 1)];
      cel(ctx, K, skin, C.skin, 16);
      const earX = cx - 31 + lk * 0.3, earY = cy + 8;
      cel(ctx, K, [oval(earX, earY, 9.5, 15.5, -0.12)], C.skin, 3.5);
      line(ctx, K, [[earX + 3, earY - 9], [earX - 3.5, earY - 4], [earX - 1.5, earY + 5], [earX + 3, earY + 9]], 0.42, 0.7);
      ctx.save();
      build(ctx, skin);
      ctx.clip();
      blush(ctx, { ex, blushY: eyeY + 28, blushK: 0.3, blushR: 1 }, F);
      const wa = 0.4;
      line(ctx, K, [[fx - 22, cy - 32], [fx - 4, cy - 35], [fx + 14, cy - 32]], 0.36, wa);
      line(ctx, K, [[fx - 16, cy - 25], [fx - 2, cy - 27.5], [fx + 10, cy - 25]], 0.34, wa * 0.8);
      line(ctx, K, [[ex[0] - 14, eyeY - 2], [ex[0] - 18, eyeY + 1]], 0.32, wa);
      line(ctx, K, [[ex[0] - 14, eyeY + 4], [ex[0] - 18, eyeY + 8]], 0.32, wa);
      line(ctx, K, [[fx + 18, eyeY + 44], [fx + 12, eyeY + 52], [fx + 12, eyeY + 60]], 0.36, wa);
      line(ctx, K, [[fx - 12, eyeY + 36], [fx - 9, eyeY + 48], [fx - 4, eyeY + 56]], 0.36, wa * 0.9);
      line(ctx, K, [[fx - 2, eyeY + 68], [fx + 6, eyeY + 69.5], [fx + 13, eyeY + 68]], 0.32, wa * 0.8);
      eyes(ctx, K, R, F, { ex, eyeY, eyeR: [4.8, 7.4], farK: 0.88, eye: C.eye, tearSide: 0 });
      for (let i = 0; i < 2; i++) line(ctx, K, [[ex[i] - 6, eyeY + 9.5], [ex[i], eyeY + 11.5], [ex[i] + 6, eyeY + 9.5]], 0.32, wa);
      mouth(ctx, K, R, F, { mouth: [fx + 6, eyeY + 56], mouthW: 10 });
      ctx.restore();
      const nose = [[fx + 1, eyeY + 4], [fx + 8, eyeY + 15], [fx + 18, eyeY + 29], [fx + 25, eyeY + 38], [fx + 23, eyeY + 44], [fx + 15, eyeY + 45.5], [fx + 9, eyeY + 41], [fx + 5, eyeY + 26]];
      celThin(ctx, K, [blob(nose, 0.95)], C.skin, 4.5, K.rim * 0.8, 0.8);
      line(ctx, K, [[fx + 9.5, eyeY + 39], [fx + 13.5, eyeY + 42]], 0.34, 0.6);
      const lt = eyeY + 9;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = 0; i < 2; i++) {
        const lx = ex[i] + (i ? 1 : -1), rx = i ? 10 : 11.5, ry = i ? 9 : 10;
        const lens = new Path2D();
        lens.moveTo(lx - rx, lt);
        lens.quadraticCurveTo(lx, lt - 1.8, lx + rx, lt);
        lens.ellipse(lx, lt, rx, ry, 0, 0, Math.PI);
        lens.closePath();
        ctx.fillStyle = 'rgba(222,236,244,0.34)';
        ctx.fill(lens);
        ctx.save();
        ctx.clip(lens);
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = Math.max(K.minLine, K.lw * 0.6);
        ctx.beginPath();
        ctx.ellipse(lx, lt, rx * 0.68, ry * 0.68, 0, Math.PI * 0.18, Math.PI * 0.45);
        ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(K.minLine, K.lw * 1.1);
        ctx.stroke(lens);
        ctx.strokeStyle = C.metal;
        ctx.lineWidth = Math.max(K.minLine * 0.6, K.lw * 0.45);
        ctx.stroke(lens);
      }
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(K.minLine, K.lw * 0.75);
      ctx.beginPath();
      ctx.moveTo(ex[0] + 10, lt + 0.5);
      ctx.quadraticCurveTo(fx + 1, lt - 3, ex[1] - 8.5, lt + 0.5);
      ctx.moveTo(ex[0] - 12.5, lt);
      ctx.quadraticCurveTo(cx - 10, lt - 5, earX + 6, earY - 6);
      ctx.stroke();
      ctx.restore();
      const hair = [
        P(46, -26), P(49, -42), P(36, -60), P(14, -70), P(-10, -70, 0), P(-32, -62, 0), P(-46, -40, 0), P(-50, -12, 0), [cx - 44, cy + 10, 1],
        P(-36, 2, 0), P(-32, -14, 0), P(-22, -30, 0), P(-4, -38, 0), P(14, -40), P(30, -38), [cx + 40 + lk * 0.85, cy - 30, 1],
      ];
      const hairP = [blob(hair, 0.85)];
      cel(ctx, K, hairP, C.hair, 8);
      ctx.save();
      build(ctx, hairP);
      ctx.clip();
      const hs = C.hair.shade;
      line(ctx, K, [P(26, -58), P(4, -63), P(-22, -58, 0)], 1.6, 0.5, C.hair.rim);
      line(ctx, K, [P(32, -60), P(12, -55), P(-12, -52, 0), P(-30, -48, 0)], 0.42, 0.9, INK);
      for (let i = 0; i < 4; i++) {
        const yy = -47 + i * 5.5;
        line(ctx, K, [P(34 - i * 3, yy - 5), P(10, yy - 3), P(-18, yy - 1, 0), P(-42, yy + 7, 0)], 0.32, 0.8, hs);
      }
      line(ctx, K, [P(18, -66), P(-6, -66, 0), P(-28, -60, 0)], 0.32, 0.7, hs);
      ctx.restore();
      const lift = F.browLift - 0.8 * R.blink;
      const tilt = F.browTilt;
      for (let i = 0; i < 2; i++) {
        const bx = ex[i] + (i ? 2 : -3);
        const by = eyeY - 13.5 + (-lift - (i ? F.browAsym : 0));
        const out = i ? 1 : -1;
        bushyBrow(ctx, K, bx, by, i ? 24 : 29, i ? 5 : 6, out, -out * tilt, C, 0.5 - Math.max(0, -tilt) * 0.6);
      }
    });
  };

  SD.extra = function (ctx, K, R, C) {
    const on = R.o.pen != null ? !!R.o.pen : (R.PW.barelyLook || 0) >= 0.5;
    if (!on) return;
    const a = R.arms[0];
    const g = armGrip(SD, a);
    frame(ctx, K, g, a.handA + 0.9, (K) => {
      cel(ctx, K, [capsule(-26, 0, 2.6, 6, 0, 2)], tone('#2B2A30', '#17161B', 0.3), 1, 0);
      cel(ctx, K, [blob([[6, -2], [12, 0, 1], [6, 2]], 0.5)], tone('#C9B37A', '#8D7A4A', 0.3), 1, 0);
    });
  };

  function salesman(ctx, o) {
    drawFigure(SD, ctx, o);
  }
  salesman.pose = (o) => poseOf(SD, o);
  salesman.HK = 1.25;
  salesman.COUNTER_K = COUNTER_K;
  salesman.counterY = (floorY, samH) => floorY - COUNTER_K * (samH || 330);
  salesman.POSES = Object.keys(SD.poses);
  salesman.EXPRS = Object.keys(EXPR);

  const KH = 363;
  const KC = (() => {
    const C = {
      skin: tone('#F4C7A1', '#DB9C7C', 0.35),
      hair: tone('#A54B2A', '#74301B', 0.36),
      cardi: tone('#D9808D', '#B1606F', 0.38),
      rib: tone('#CF7483', '#A55565', 0.3),
      blouse: tone('#F8EEDC', '#D9C7AC', 0.2),
      skirt: tone('#70503F', '#4F352A', 0.32),
      tights: tone('#B98C77', '#957060', 0.3),
      shoe: tone('#6A4130', '#46291D', 0.3),
      pearl: tone('#F8F3EA', '#D3CABC', 0.1),
      frame: '#7A4535',
      chain: '#B99A62',
      eye: '#21170F',
      brow: '#7E3A22',
    };
    C.far = { cardi: farTone(C.cardi), rib: farTone(C.rib), skin: farTone(C.skin), tights: farTone(C.tights), shoe: farTone(C.shoe) };
    return C;
  })();

  const KD = {
    H: KH,
    seed: 2.71,
    HIP: -138,
    TORSO_DY: 6,
    L1: 64,
    L2: 62,
    hipX: [-9, 10],
    ankle: [[-10, -12], [12, -12]],
    shoulder: [[-24, -92], [31, -92]],
    neck: [4, -101],
    headFollow: 0.6,
    UA: 46,
    FA: 42,
    handScale: 1.04,
    shadowR: 88,
    counterL: S_COUNTER,
    headC: [5, -60],
    headTop: [5, -130],
    faceBase: { browTilt: -0.08 },
  };

  KD.poses = {
    stand: {
      body: () => ({ lean: 0.01 }),
      arms: (S, hang) => {
        const n = hang(0), f = hang(1);
        n.w = add(n.w, [14, -6]);
        f.w = add(f.w, [-2, -6]);
        return { n, f };
      },
    },
    greet: {
      body: () => ({ nod: -0.06, lean: 0.03, smile: 0.75, browLift: 2.5, browTilt: -0.18, happy: 0.55, blush: 0.4 }),
      arms: () => ({
        n: { w: [30, -192], pole: [-10, -150], ha: -1.15, shape: { open: 1 } },
        f: { w: [27, -195], pole: [40, -150], ha: -1.2, shape: { open: 1 } },
        farFront: 1,
      }),
    },
    offerRing: {
      body: () => ({ lean: 0.13, hipDx: -4, nod: 0.12, eyeUp: -0.45, smile: 0.55, browLift: 2, browTilt: -0.15 }),
      arms: (S) => {
        const c = S.counterL;
        const y = Math.min(-176, c - 14);
        return {
          n: { w: [52, y + 2], pole: [0, y + 40], ha: 0.02, shape: { cup: 1 } },
          f: { w: [74, y - 4], pole: [40, y + 40], ha: -0.02, shape: { cup: 1 } },
          farFront: 1,
        };
      },
    },
    worried: {
      body: () => ({ nod: 0.1, headDx: -2, turn: -0.15, browLift: 4, browTilt: -0.55, frown: 0.45, eyeOpen: 0.05 }),
      arms: (S) => ({
        n: { w: S.headPt([-14, -8]), pole: add(S.shoulders[0], [-10, 50]), ha: -1.45 + S.rH, shape: { open: 0.7, relaxed: 0.3 } },
        f: { w: [22, -150], pole: [40, -170], ha: Math.PI - 0.2, shape: { relaxed: 1 } },
        farFront: 1,
      }),
    },
    wipeTear: {
      body: () => ({ nod: 0.15, lean: 0.04, browLift: 3, browTilt: -0.45, moist: 1, tear: 0.8, frown: 0.55, smile: 0.1, blush: 0.5 }),
      arms: (S) => ({
        n: { w: S.headPt([-6, -26]), pole: add(S.shoulders[0], [-20, 45]), ha: -0.75 + S.rH, shape: { fist: 1 } },
        f: { w: [26, -152], pole: [40, -170], ha: Math.PI - 0.3, shape: { relaxed: 1 } },
        farFront: 1,
      }),
    },
    clap: {
      body: (S) => ({ smile: 0.4, open: 0.6, happy: 0.8, browLift: 3.5, blush: 0.5, bodyRise: 1.2 * Math.max(0, Math.cos(TAU * (S.o.clapRate || 2.4) * S.t)) }),
      arms: (S) => {
        const f = S.o.clapRate || 2.4;
        const c = 0.5 + 0.5 * Math.cos(TAU * f * S.t);
        const d = 4 + 26 * Math.pow(c, 1.4);
        return {
          n: { w: [40 - d * 0.75, -196], pole: [-20, -160], ha: -1.25 + 0.2 * c, shape: { open: 1 } },
          f: { w: [38 + d * 0.35, -200], pole: [40, -160], ha: -1.9 - 0.2 * c, shape: { open: 1 } },
          farFront: 1,
        };
      },
    },
    handshake: {
      body: () => ({ lean: 0.08, hipDx: -2, smile: 0.6, browLift: 2, browTilt: -0.1, blush: 0.3 }),
      arms: (S, hang) => ({
        n: { w: [70, -170], pole: [0, -130], ha: 0.05, shape: { shake: 1 } },
        f: { w: [54, -146], pole: [20, -110], ha: 0.6, shape: { relaxed: 1 } },
      }),
    },
  };
  KD.palette = () => KC;

  KD.leg = function (ctx, K, R, C, side, far) {
    const leg = R.legs[side];
    const c = far ? C.far : C;
    frame(ctx, K, leg.ankle, 0, (K) => {
      const shoe = [[-12, -5], [-2, -8], [12, -6], [26, -1], [31, 4], [30, 9.5], [-12, 9.5], [-15, 3]];
      cel(ctx, K, [blob(shoe, 0.85)], c.shoe, 4);
      line(ctx, K, [[-4, -7], [3, -2], [10, -6.5]], 0.45, 0.85);
      line(ctx, K, [[-13, 7], [8, 7.6], [30, 7]], 0.34, 0.45, '#2D1B13');
    });
    const { hip, knee, ankle } = leg;
    cel(ctx, K, [capsule(hip[0], hip[1], 14, knee[0], knee[1], 10.5), capsule(knee[0], knee[1], 10.5, ankle[0], ankle[1] - 4, 8.5)], c.tights, 5);
  };

  KD.arm = function (ctx, K, R, C, side, far) {
    const arm = R.arms[side];
    const c = far ? C.far : C;
    const r = sleeve(ctx, K, R, KD, arm, c.cardi, c.rib, c.skin, { top: 13.5, elbow: 11.5, wrist: 10.5, cuff: 9.8, cuffLen: 7 });
    const e = r.end, u = r.u, n = [-u[1], u[0]];
    for (let i = 0; i < 3; i++) {
      const p = add(e, [u[0] * (2 + i * 2.2), u[1] * (2 + i * 2.2)]);
      line(ctx, K, [add(p, [n[0] * 7, n[1] * 7]), add(p, [-n[0] * 7, -n[1] * 7])], 0.26, 0.35);
    }
  };

  const K_TORSO = [[6, -101], [22, -97], [31, -86], [35, -62], [38, -36], [39, -12], [37, 6], [35, 15], [0, 18], [-33, 15], [-37, 4], [-38, -18], [-36, -46], [-32, -76], [-25, -94], [-10, -101]];

  KD.torso = function (ctx, K, R, C) {
    frame(ctx, K, R.pelvis, R.rT, (K) => {
      const skirt = [[-34, -6], [34, -6], [38, 30], [41, 66], [20, 71], [0, 72], [-22, 70], [-40, 65], [-37, 30]];
      cel(ctx, K, [blob(skirt, 0.8)], C.skirt, 8);
      line(ctx, K, [[6, 20], [9, 45], [11, 68]], 0.36, 0.4);
      line(ctx, K, [[-18, 24], [-22, 46], [-25, 66]], 0.34, 0.35);
      const by = 0.5 * R.breath;
      const pts = K_TORSO.map((p) => [p[0], p[1] - (p[1] < -30 ? by : 0)]);
      const body = [blob(pts, 0.9)];
      cel(ctx, K, body, C.cardi, 12);
      ctx.save();
      build(ctx, body);
      ctx.clip();
      const bl = [[-8, -104], [20, -104], [12, -54, 1]];
      build(ctx, [blob(bl, 0.4)]);
      ctx.fillStyle = C.blouse.base;
      ctx.fill();
      shade(ctx, K, [body, [blob(bl, 0.4)]], body, C.blouse, 10, 0);
      const band = (c2) => { c2.moveTo(-50, 5); c2.quadraticCurveTo(0, 9, 50, 4); c2.lineTo(50, 40); c2.lineTo(-50, 40); c2.closePath(); };
      build(ctx, [band]);
      ctx.fillStyle = 'rgba(120,30,50,0.13)';
      ctx.fill();
      ctx.restore();
      line(ctx, K, [[-35, 4.5], [0, 8.6], [36, 4]], 0.4, 0.8);
      for (let i = 0; i < 9; i++) {
        const x = -30 + i * 7.5;
        line(ctx, K, [[x, 8 + Math.abs(x) * -0.02], [x, 15]], 0.24, 0.3);
      }
      celThin(ctx, K, [blob([[-9, -104], [3, -101], [5, -94], [-3, -92], [-9, -97]], 0.8)], C.blouse, 2, 0, 0.6);
      celThin(ctx, K, [blob([[20, -104], [10, -101], [9, -94], [16, -92], [21, -97]], 0.8)], C.blouse, 2, 0, 0.6);
      line(ctx, K, [[-7, -100], [11, -54], [11, 16]], 0.44, 0.85);
      line(ctx, K, [[20, -100], [13, -54]], 0.44, 0.85);
      for (let i = 0; i < 4; i++) {
        const y = -46 + i * 15;
        cel(ctx, K, [oval(11.5, y, 2.6, 2.6)], tone('#F2E3D0', '#C9B49A', 0.1), 1, 0);
      }
      line(ctx, K, [[-30, -40], [-22, -30]], 0.34, 0.4);
      line(ctx, K, [[24, -20], [30, -12]], 0.34, 0.4);
    });
  };

  function curls(cx, cy, rx, ry, a0, a1, n, depth) {
    const pts = [];
    for (let i = 0; i <= n * 2; i++) {
      const a = lerp(a0, a1, i / (n * 2));
      const peak = i % 2 === 1;
      const k = peak ? 1 + depth : 1;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k, peak ? 0 : 1]);
    }
    return pts;
  }

  const KHEAD = { cx: 5, cy: -60 };
  KD.eyePts = (R) => {
    const lk = R.body.turn * 18 + R.look * 6;
    const fx = KHEAD.cx + 22 + lk;
    const eyeY = KHEAD.cy + 6 - 3 * Math.max(0, R.look);
    return [R.headPt([fx - 15, eyeY]), R.headPt([fx + 14, eyeY])];
  };

  KD.head = function (ctx, K, R, C) {
    frame(ctx, K, R.headO, R.rH, (K) => {
      const F = R.face;
      const { cx, cy } = KHEAD;
      const lk = R.body.turn * 18 + R.look * 6;
      const P = (x, y, w) => [cx + x + lk * (w == null ? Math.max(0, x / 58) : w), cy + y];
      const fx = cx + 22 + lk;
      const eyeY = cy + 6 - 3 * Math.max(0, R.look);
      const ex = [fx - 15, fx + 14];
      const back = curls(cx - 6 + lk * 0.1, cy - 6, 66, 62, Math.PI * 0.42, Math.PI * 1.98, 9, 0.09);
      back.push([cx + 44 + lk * 0.6, cy + 40, 1], [cx + 10, cy + 50, 1]);
      cel(ctx, K, [blob(back.map((p) => p.slice()), 0.85)], C.hair, 10);
      const skull = [P(4, -58), P(34, -50), P(52, -28), P(58, 2), P(55, 26), P(44, 44), P(24, 56), P(4, 60), P(-18, 56, 0), P(-38, 42, 0), P(-52, 16, 0), P(-54, -16, 0), P(-40, -46, 0), P(-18, -58, 0)];
      const skin = [blob(skull, 1)];
      cel(ctx, K, skin, C.skin, 18);
      const earX = cx - 34 + lk * 0.3, earY = cy + 10;
      cel(ctx, K, [oval(earX, earY, 8.5, 11.5, -0.15)], C.skin, 3);
      line(ctx, K, [[earX + 3, earY - 5.5], [earX - 2.5, earY - 2], [earX - 0.5, earY + 4], [earX + 3, earY + 5.5]], 0.4, 0.7);
      ctx.save();
      build(ctx, skin);
      ctx.clip();
      blush(ctx, { ex, blushY: eyeY + 16, blushK: 1, blushR: 1.15 }, F);
      line(ctx, K, [[ex[0] - 12, eyeY + 18], [ex[0] - 10, eyeY + 26]], 0.32, 0.3);
      line(ctx, K, [[ex[0] - 14, eyeY - 1], [ex[0] - 17.5, eyeY + 1]], 0.3, 0.32);
      line(ctx, K, [[ex[0] - 14, eyeY + 3.5], [ex[0] - 17.5, eyeY + 6.5]], 0.3, 0.32);
      eyes(ctx, K, R, F, { ex, eyeY, eyeR: [5, 7.6], farK: 0.84, eye: C.eye, tearSide: 0 });
      mouth(ctx, K, R, F, { mouth: [fx + 2, eyeY + 30], mouthW: 9 });
      line(ctx, K, [[fx + 3, eyeY + 14], [fx + 7, eyeY + 18.5], [fx + 3.5, eyeY + 21]], 0.42, 0.7);
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = C.chain;
      ctx.lineWidth = Math.max(K.minLine * 0.8, K.lw * 0.5);
      ctx.setLineDash([1.6, 2.2]);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(earX + 4, earY - 4);
      ctx.bezierCurveTo(earX - 6, earY + 30, earX + 8, cy + 76, cx + 6, cy + 70);
      ctx.stroke();
      ctx.restore();
      for (let i = 0; i < 2; i++) {
        const gx = ex[i] + (i ? 0.5 : -0.5), gy = eyeY + 1;
        const rw = i ? 10 : 11.5, rh = 9;
        ctx.beginPath();
        ctx.ellipse(gx, gy, rw, rh, 0, 0, TAU);
        ctx.fillStyle = 'rgba(232,242,248,0.12)';
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(K.minLine, K.lw * 1.05);
        ctx.stroke();
        ctx.strokeStyle = C.frame;
        ctx.lineWidth = Math.max(K.minLine * 0.6, K.lw * 0.5);
        ctx.stroke();
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = Math.max(K.minLine, K.lw * 0.55);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.ellipse(gx, gy, rw * 0.72, rh * 0.72, 0, Math.PI * 1.15, Math.PI * 1.45);
        ctx.stroke();
        ctx.restore();
      }
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(K.minLine, K.lw * 0.75);
      ctx.beginPath();
      ctx.moveTo(ex[0] + 11, eyeY);
      ctx.quadraticCurveTo(fx, eyeY - 3, ex[1] - 10, eyeY);
      ctx.moveTo(ex[0] - 11.5, eyeY - 1);
      ctx.lineTo(earX + 5, earY - 5);
      ctx.stroke();
      cel(ctx, K, [oval(earX + 1, earY + 14, 3.6, 3.6)], C.pearl, 1.2, 0);
      dot(ctx, earX + 2, earY + 12.8, 1.1, 'rgba(255,255,255,0.95)');
      const fringe = [];
      const FX = [52, 36, 20, 4, -12, -28, -44];
      const FY = [-16, -20, -22, -22, -20, -15];
      const sx = (x) => cx + x + lk * Math.max(0, x / 58);
      for (let i = 0; i < FX.length; i++) {
        const xv = FX[i];
        const yv = cy - 34 + Math.abs(xv) * 0.14;
        fringe.push([sx(xv), yv, 1]);
        if (i < FY.length) {
          const xa = FX[i], xb = FX[i + 1], w = xb - xa;
          const yb = cy + FY[i];
          const yn = cy - 34 + Math.abs(xb) * 0.14;
          fringe.push([sx(xa + w * 0.12), lerp(yv, yb, 0.7)]);
          fringe.push([sx(xa + w * 0.5), yb + 1.5]);
          fringe.push([sx(xa + w * 0.88), lerp(yn, yb, 0.7)]);
        }
      }
      const front = [
        ...curls(cx, cy - 4, 62, 62, Math.PI * 0.98, Math.PI * 1.9, 6, 0.08).map((p) => [p[0] + lk * Math.max(0, (p[0] - cx) / 58), p[1], p[2]]),
        [cx + 52 + lk * 0.85, cy - 18, 1], ...fringe, [cx - 50, cy - 8, 1],
      ];
      const frontP = [blob(front, 0.85)];
      cel(ctx, K, frontP, C.hair, 12);
      ctx.save();
      build(ctx, [blob(back, 0.85)]);
      build(ctx, frontP);
      ctx.clip();
      const cs = C.hair.shade;
      const curl = (x, y, r, a) => line(ctx, K, [[x + Math.cos(a) * r, y + Math.sin(a) * r], [x + Math.cos(a + 1.6) * r, y + Math.sin(a + 1.6) * r], [x + Math.cos(a + 3.2) * r * 0.8, y + Math.sin(a + 3.2) * r * 0.8], [x + Math.cos(a + 4.6) * r * 0.4, y + Math.sin(a + 4.6) * r * 0.4]], 0.34, 0.75, cs);
      const CURLS = [[-30, -48, 7, 0.3], [-6, -56, 7, 1.2], [20, -52, 6.5, 2.1], [38, -42, 6, 0.8], [-46, -26, 6.5, 2.6], [-54, 8, 6, 1.7], [-50, 32, 6, 0.4], [-28, 46, 5.5, 2.2], [52, 24, 5, 1], [8, -42, 5, 3]];
      for (const [x, y, r, a] of CURLS) curl(cx + x + lk * Math.max(0, x / 58), cy + y, r, a);
      ctx.restore();
      ctx.save();
      build(ctx, skin);
      ctx.clip();
      const lift = F.browLift - 0.8 * R.blink;
      const worry = -F.browTilt;
      for (let i = 0; i < 2; i++) {
        const bx = ex[i] + (i ? 1 : -1), by = eyeY - 17 - lift - (i ? F.browAsym : 0);
        const inner = i ? -1 : 1;
        const len = i ? 11 : 13;
        const a = -inner * worry;
        const p0 = add([bx, by], rot([(-len / 2) * inner, 0], a));
        const p1 = add([bx, by], rot([(len / 2) * inner, 0], a));
        const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 - 1.8];
        const rb = ribbon([p0, mid, p1], [2.6, 3.8, 2.4]);
        ctx.fillStyle = C.brow;
        ctx.beginPath();
        spline(ctx, oriented(rb), true, 0.9);
        ctx.fill();
      }
      ctx.restore();
    });
  };

  function nell(ctx, o) {
    drawFigure(KD, ctx, o);
  }
  nell.pose = (o) => poseOf(KD, o);
  nell.HK = 1.1;
  nell.COUNTER_K = COUNTER_K;
  nell.counterY = salesman.counterY;
  nell.POSES = Object.keys(KD.poses);
  nell.EXPRS = Object.keys(EXPR);

  FILM.cast.salesman = salesman;
  FILM.cast.nell = nell;
})();
