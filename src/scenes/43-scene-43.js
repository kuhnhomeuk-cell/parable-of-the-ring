// scenes/43-scene-43.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-43';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const W = 1080;

  const JO = { age: 21, outfit: 'swim' };
  const jH = (h) => FILM.cast.sam.height(Object.assign({ h }, JO));

  const LAY_A = { mood: 'morning', horizon: 330, shore: 1400 };
  const WL_A = 790;
  const JH_A = 420;
  const MH_A = jH(JH_A) * 0.95;
  const LAY_B = { mood: 'morning', horizon: 400, shore: 760, wet: 110, dune: true };
  const Y0 = 880, FX = 540, Z0 = 5000, HZ_B = 400;
  const ZSHORE = Z0 * (Y0 - HZ_B) / (LAY_B.shore - HZ_B);
  const JH_B = 300;
  const MH_B = jH(JH_B) * 0.95;
  const LAY_C = { mood: 'morning', horizon: 250, shore: 900, wet: 160 };

  function lines(info) {
    const s = info.shot, out = [];
    for (const c of s.captions || []) {
      if (!c.words || !c.words.length || c.words[0][0] < s.start - 0.05) continue;
      out.push(c.words.map(([t, w]) => [t - s.start, String(w).toLowerCase().replace(/[^a-z']/g, '')]));
    }
    return out;
  }
  const word = (L, i, tok, d) => {
    for (const w of L[i] || []) if (w[1] === tok) return w[0];
    return d;
  };

  function beats(info) {
    const b = (info.shot && info.shot.beats) || [];
    const L = lines(info);
    const t0 = b[0] ? b[0].t : 0.27;
    const t1 = b[1] ? b[1].t : 3.88;
    return {
      splash: t0, back: t1,
      cutB: word(L, 0, 'tokke', 2.49) + 0.3,
      came: word(L, 1, 'tokgg', 4.72), shore: word(L, 1, 'tokjl', 5.51),
      cutC: word(L, 1, 'tokam', 5.83),
      gone: word(L, 1, 'tokkf', 6.61),
    };
  }

  function drawA(ctx, t, info, S, B) {
    const BEACH = FILM.sets.beach;
    const C = BEACH.statics(S, LAY_A);
    const ta = t;
    const cam = (g, d) => LOOK.camera(g, { t: ta, dur: B.cutB, focus: [560, 600], push: 0.04, depth: d });
    BEACH.back(ctx, C, t, cam);
    const bob = (ph) => 4 * Math.sin(t * 1.9 + ph);
    const wlJ = WL_A + bob(0), wlM = WL_A + bob(0.9);
    const jh = jH(JH_A);
    const jo = Object.assign({ x: 360, y: wlJ + 0.47 * jh, h: JH_A, t, facing: 1, pose: 'laugh' }, JO);
    const mo = { x: 720, y: wlM + 0.43 * MH_A, h: MH_A, t, facing: -1, outfit: 'beach', swim: true, pose: 'splash', waterY: wlM, expr: 'laugh', light: C.m.light, breeze: 0.5 };
    ctx.save();
    cam(ctx, 1);
    BEACH.clipAbove(ctx, wlJ + 1, () => FILM.cast.sam(ctx, jo));
    BEACH.wade(ctx, C, { x: jo.x, y: wlJ, w: 0.24 * jh, t });
    FILM.cast.ava(ctx, mo);
    BEACH.wade(ctx, C, { x: mo.x, y: wlM, w: 0.22 * MH_A, t: t + 0.4 });
    for (let k = 0; k < 16; k++) {
      const u = (t * 0.9 + k / 16) % 1;
      const x = lerp(610, 420, u) + 12 * Math.sin(k * 2.3);
      const y = wlM - 50 - 190 * Math.sin(Math.PI * u) * (0.6 + 0.4 * ((k * 7) % 5) / 5) + 30 * u;
      ctx.globalAlpha = 0.75 * sstep(0, 0.15, u) * (1 - sstep(0.8, 1, u));
      ctx.fillStyle = k % 2 ? 'rgb(240,252,252)' : 'rgb(196,236,234)';
      ctx.beginPath();
      ctx.arc(x, y, 3.4 + (k % 3), 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    BEACH.air(ctx, C, t, cam);
  }

  const proj = (X, Z) => {
    const p = Z0 / Z;
    return { x: FX + (X - FX) * p, y: HZ_B + (Y0 - HZ_B) * p, p };
  };
  const PATH_M = [880, 7500, 760, 6900];
  const PATH_J = [700, 7250, 560, 6640];

  function wader(path, u, href) {
    const X = lerp(path[0], path[2], u), Z = lerp(path[1], path[3], u);
    const P = proj(X, Z);
    const s = Math.hypot(path[2] - path[0], path[3] - path[1]) * u;
    const deep = clamp01((Z - ZSHORE) / 1400) * 0.32;
    return { x: P.x, y: P.y, p: P.p, h: href * P.p, s, deep };
  }

  function drawB(ctx, t, info, S, B) {
    const BEACH = FILM.sets.beach;
    const C = BEACH.statics(S, LAY_B);
    const tb = t - B.cutB, db = B.cutC - B.cutB;
    const cam = (g, d) => LOOK.camera(g, { t: tb, dur: db, focus: [700, 560], push: 0.07, ease: (x) => x, depth: d });
    BEACH.back(ctx, C, t, cam);
    const u = LIB.ease.inOutSine(clamp01(tb / db) * 0.92 + 0.04);
    const look = sstep(B.came, B.shore, t);
    const m = wader(PATH_M, u, MH_B);
    const j = wader(PATH_J, u, jH(JH_B));
    const mo = {
      x: m.x, y: m.y, h: m.h, t, facing: -1, outfit: 'beach', swim: true,
      pose: look > 0.01 ? { walk: 1 - look, showHand: look } : 'walk',
      walk: m.s / (2 * FILM.cast.ava.STEP * MH_B), expr: look > 0.4 ? { smileSoft: 1 - look, wonder: look } : 'smileSoft', light: C.m.light,
    };
    const jo = Object.assign({ x: j.x, y: j.y, h: JH_B * j.p, t, facing: -1, expr: 'smileSmall' }, JO);
    jo.walk = j.s / FILM.cast.sam.stride(Object.assign({}, jo, { h: JH_B }));
    jo.walkAmt = 1 - 0.6 * look;
    ctx.save();
    cam(ctx, 1);
    const wlM = m.y - m.deep * m.h, wlJ = j.y - j.deep * j.h;
    BEACH.clipAbove(ctx, wlM + 1, () => FILM.cast.ava(ctx, mo));
    BEACH.wade(ctx, C, { x: m.x, y: wlM, w: 0.2 * m.h, t, alpha: sstep(0, 0.05, m.deep) });
    BEACH.clipAbove(ctx, wlJ + 1, () => FILM.cast.sam(ctx, jo));
    BEACH.wade(ctx, C, { x: j.x, y: wlJ, w: 0.22 * j.h, t: t + 0.3, alpha: sstep(0, 0.05, j.deep) });
    ctx.restore();
    BEACH.air(ctx, C, t, cam);
  }

  const INK = '#1F1712';
  const SKIN = { base: '#E4AD80', shade: '#C88D62', rim: '#EDBA89' };
  const LIGHT = [0.78, -0.62];

  function capsule(p, x0, y0, r0, x1, y1, r1) {
    const a = Math.atan2(y1 - y0, x1 - x0);
    p.moveTo(x0 + Math.cos(a + Math.PI / 2) * r0, y0 + Math.sin(a + Math.PI / 2) * r0);
    p.arc(x0, y0, r0, a + Math.PI / 2, a + Math.PI * 1.5);
    p.arc(x1, y1, r1, a - Math.PI / 2, a + Math.PI / 2);
    p.closePath();
  }
  const FINGERS = [
    [-66, -150, -96, -232, 21, 18],
    [-24, -168, -34, -276, 23, 20],
    [20, -170, 24, -284, 23, 20],
    [62, -160, 82, -262, 22, 19],
  ];
  const THUMB = [92, -70, 156, -150, 25, 21];
  function handPath() {
    const p = new Path2D();
    p.moveTo(-60, 0);
    p.bezierCurveTo(-92, -40, -100, -120, -84, -158);
    p.bezierCurveTo(-60, -190, 60, -196, 86, -164);
    p.bezierCurveTo(108, -120, 96, -40, 62, 0);
    p.closePath();
    for (const f of FINGERS) capsule(p, f[0], f[1], f[4], f[2], f[3], f[5]);
    capsule(p, THUMB[0], THUMB[1], THUMB[4], THUMB[2], THUMB[3], THUMB[5]);
    capsule(p, 0, -30, 54, 330, 230, 60);
    return p;
  }
  let HAND = null;

  function drawHand(ctx, o) {
    if (!HAND) HAND = handPath();
    const lw = o.lw;
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.rot);
    ctx.scale(o.s, o.s);
    const k = 1 / o.s;
    const c = Math.cos(-o.rot), s = Math.sin(-o.rot);
    const lx = LIGHT[0] * c - LIGHT[1] * s, ly = LIGHT[0] * s + LIGHT[1] * c;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineWidth = lw * 2 * k;
    ctx.stroke(HAND);
    ctx.fill(HAND);
    ctx.fillStyle = SKIN.base;
    ctx.fill(HAND);
    const d = 16, r = 5;
    ctx.save();
    ctx.clip(HAND);
    ctx.fillStyle = SKIN.rim;
    ctx.fill(HAND);
    ctx.save();
    ctx.translate(-lx * r, -ly * r);
    ctx.fillStyle = SKIN.shade;
    ctx.fill(HAND);
    ctx.clip(HAND);
    ctx.translate(lx * (r + d), ly * (r + d));
    ctx.fillStyle = SKIN.base;
    ctx.fill(HAND);
    ctx.restore();
    const og = ctx.createLinearGradient(0, -200, 0, -150);
    og.addColorStop(0, 'rgba(160,100,70,0)');
    og.addColorStop(1, 'rgba(160,100,70,0.12)');
    ctx.fillStyle = og;
    ctx.fillRect(-120, -200, 240, 50);
    ctx.restore();
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    const line = (pts, w, a) => {
      ctx.globalAlpha = a;
      ctx.lineWidth = lw * w * k;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      if (pts.length === 3) ctx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
      else ctx.lineTo(pts[1][0], pts[1][1]);
      ctx.stroke();
    };
    for (let i = 0; i < 3; i++) {
      const a = FINGERS[i], b = FINGERS[i + 1];
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - 12;
      line([[mx, my + 4], [mx + 2, my - 22]], 0.7, 0.9);
    }
    for (const f of FINGERS) {
      const [bx, by, tx, ty] = f;
      line([[bx - 8, by + 12], [bx, by + 16], [bx + 8, by + 12]], 0.45, 0.45);
      const jx = lerp(bx, tx, 0.5), jy = lerp(by, ty, 0.5);
      line([[jx - 9, jy + 2], [jx, jy + 5], [jx + 9, jy + 2]], 0.4, 0.4);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#F3C7A4';
      ctx.beginPath();
      ctx.ellipse(lerp(bx, tx, 0.9), lerp(by, ty, 0.9) + 2, f[5] * 0.55, f[5] * 0.62, Math.atan2(ty - by, tx - bx) + Math.PI / 2, 0, TAU);
      ctx.fill();
    }
    line([[THUMB[0] + 10, THUMB[1] + 22], [THUMB[0] - 6, THUMB[1] - 8], [THUMB[0] - 8, THUMB[1] - 40]], 0.6, 0.7);
    const rf = FINGERS[1];
    const bx = lerp(rf[0], rf[2], 0.2), by = lerp(rf[1], rf[3], 0.2);
    const fa = Math.atan2(rf[3] - rf[1], rf[2] - rf[0]) + Math.PI / 2;
    ctx.save();
    ctx.clip(HAND);
    ctx.translate(bx, by);
    ctx.rotate(fa);
    ctx.globalAlpha = 0.4 * o.mark;
    ctx.fillStyle = '#F0C7A2';
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 4.5, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 0.25 * o.mark;
    ctx.strokeStyle = SKIN.shade;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 1.5, 18, 4.5, 0, 0.15, Math.PI - 0.15);
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
    const beads = [[-40, -120, 7], [30, -90, 5], [-70, -60, 5], [60, -130, 6], [10, -230, 5], [-30, -250, 4], [70, -230, 4], [140, -120, 5], [200, 120, 7], [120, 40, 5], [-10, -40, 6]];
    for (const [x, y, rr] of beads) {
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.ellipse(x, y, rr, rr * 1.2, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(160,96,64,0.22)';
      ctx.beginPath();
      ctx.ellipse(x - rr * 0.3, y + rr * 0.5, rr * 0.8, rr * 0.5, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(x + rr * 0.3, y - rr * 0.4, rr * 0.35, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function drips(ctx, o, t) {
    const c = Math.cos(o.rot), s = Math.sin(o.rot);
    const W2S = (x, y) => [o.x + (x * c - y * s) * o.s, o.y + (x * s + y * c) * o.s];
    ctx.save();
    FINGERS.forEach((f, i) => {
      const per = 1.1 + 0.37 * i;
      const q = ((t + i * 0.41) % per) / per;
      const tip = W2S(f[2], f[3] + f[5]);
      const fall = Math.max(0, q - 0.55) / 0.45;
      const y = tip[1] + 6 + 520 * fall * fall;
      if (y > 870) return;
      const r = (3 + 4 * Math.min(1, q / 0.55)) * o.s;
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = 'rgba(214,240,244,0.8)';
      ctx.beginPath();
      ctx.ellipse(tip[0], y, r, r * (1 + fall * 0.6), 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath();
      ctx.arc(tip[0] + r * 0.3, y - r * 0.3, r * 0.35, 0, TAU);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawC(ctx, t, info, S, B) {
    const BEACH = FILM.sets.beach;
    const C = BEACH.statics(S, LAY_C);
    const tc = t - B.cutC, dc = info.dur - B.cutC;
    const bd = BEACH.backdrop(S, C, { blur: 9 });
    const cam = (g, d) => LOOK.camera(g, { t: tc, dur: dc, focus: [560, 420], push: 0.035, depth: d });
    ctx.save();
    cam(ctx, 0.4);
    ctx.drawImage(bd, -20, -20, W + 40, W + 40);
    ctx.restore();
    const up = LIB.ease.outCubic(clamp01(tc / 0.55));
    const shake = sstep(B.gone - 0.15, B.gone + 0.2, t) * (1 - 0.6 * sstep(B.gone + 0.8, info.dur, t));
    const tr = shake * (0.012 * Math.sin(t * 31) + 0.008 * Math.sin(t * 19 + 1));
    const o = { x: 640 + 6 * Math.sin(t * 0.7), y: lerp(1060, 640, up) + 4 * Math.sin(t * 1.1), s: 1.08, rot: -0.32 + tr + 0.03 * (1 - up), lw: 7, mark: 1 };
    ctx.save();
    cam(ctx, 1);
    drawHand(ctx, o);
    drips(ctx, o, tc);
    ctx.restore();
    BEACH.air(ctx, C, t, cam, 0.8);
    BEACH.grade(ctx, 'loss', 0.45 * sstep(B.gone - 0.2, info.dur, t));
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const B = beats(info);
      const BEACH = FILM.sets.beach;
      BEACH.statics(S, LAY_A);
      BEACH.statics(S, LAY_B);
      BEACH.backdrop(S, BEACH.statics(S, LAY_C), { blur: 9 });
      if (t < B.cutB) drawA(ctx, t, info, S, B);
      else if (t < B.cutC) drawB(ctx, t, info, S, B);
      else drawC(ctx, t, info, S, B);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
