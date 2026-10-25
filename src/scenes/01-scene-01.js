// scenes/01-scene-01.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-01';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const W = 1080;
  const H = 1080;
  const TAU = Math.PI * 2;

  const SET = () => FILM.sets.outpost;
  const AGE = 19;
  const OUT = 'fatigues-desert';
  const QMAX = 0.85;

  const DEF = { b0: 1.21, b1: 2.04, b2: 3.18, b3: 3.75, b4: 4.08, b5: 4.48, b6: 4.74 };
  const KEY = { tokaa: 'b0', tokad: 'b1', tokae: 'b2', tokah: 'b3', tokai: 'b4', tokaj: 'b5', tokak: 'b6' };
  function beats(info) {
    const B = Object.assign({}, DEF);
    const cap = info.shot && info.shot.captions && info.shot.captions[0];
    const t0 = (info.shot && info.shot.start) || 0;
    if (cap && cap.words) {
      const seen = {};
      for (const [wt, tok] of cap.words) {
        const k = KEY[String(tok).toLowerCase().replace(/[^a-z]/g, '')];
        if (k && k in DEF && !seen[k]) {
          seen[k] = true;
          B[k] = wt - t0;
        }
      }
    }
    return B;
  }

  const stride = (o) => FILM.cast.sam.stride(o);

  function shake(t, at, amp) {
    const d = t - at;
    if (d < 0) return [0, 0];
    const e = amp * Math.exp(-d * 5.5);
    return [e * (Math.sin(d * 71) * 0.7 + Math.sin(d * 113 + 1) * 0.3), e * (Math.sin(d * 89 + 2) * 0.7 + Math.sin(d * 131) * 0.3)];
  }

  function tracers(ctx, t, list) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const [t0, x0, y0, x1, y1] of list) {
      const u = (t - t0) / 0.32;
      if (u < 0 || u > 1) continue;
      const hx = lerp(x0, x1, u), hy = lerp(y0, y1, u);
      const tx = lerp(x0, x1, Math.max(0, u - 0.22)), ty = lerp(y0, y1, Math.max(0, u - 0.22));
      const g = ctx.createLinearGradient(tx, ty, hx, hy);
      g.addColorStop(0, 'rgba(255,150,60,0)');
      g.addColorStop(1, 'rgba(255,230,170,0.95)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(hx, hy);
      ctx.stroke();
    }
    ctx.restore();
  }

  function lowSmoke(ctx, t, y, alpha, seed) {
    ctx.save();
    for (let i = 0; i < 7; i++) {
      const h = LIB.hash(ID, 'ls', seed, i) >>> 0;
      const r = 140 + (h % 120);
      const x = (((h >>> 8) % 1400) - 160 - 40 * t * (0.6 + (i % 3) * 0.3)) % 1400;
      const xx = x < -260 ? x + 1400 : x;
      const yy = y + ((h >>> 4) % 90) - 45 + 8 * Math.sin(t * 0.7 + i);
      const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, r);
      g.addColorStop(0, `rgba(40,20,20,${alpha})`);
      g.addColorStop(1, 'rgba(40,20,20,0)');
      ctx.fillStyle = g;
      ctx.fillRect(xx - r, yy - r, 2 * r, 2 * r);
    }
    ctx.restore();
  }

  function figure(ctx, S, K, o, alpha) {
    LOOK.castShadow(ctx, { x: o.x, y: o.ground, h: o.h, k: K.SHADOW_K, S, alpha: 0.22 * alpha, color: 'rgb(16,8,10)', draw: (g) => FILM.cast.sam(g, Object.assign({}, o, { y: o.ground })) });
    LOOK.contactShadow(ctx, { x: o.x, y: o.ground, h: o.h, alpha: 0.42 * alpha, color: [14, 8, 10] });
  }

  const A = {
    OFF: 280,
    BAR_DX: -220,
    JH: 300,
    HELMET: [420, 902],
    X0: 1120,
    XL: 830,
    T_LAND: 0.42,
    V: 380,
  };

  function samA(t) {
    const K = SET();
    const o = { h: A.JH, t, age: AGE, outfit: OUT, helmet: false, facing: -1, pose: 'sprintCrouch', poseAmt: 1, expr: 'squint', exprAmt: 0.7 };
    const tt = t + 0.12;
    const TL = A.T_LAND + 0.12;
    if (tt < TL) {
      const u = tt / TL;
      o.x = lerp(A.X0, A.XL, u);
      const ground = lerp(K.GROUND - 10, 902, sstep(0.3, 0.9, u));
      o.ground = ground;
      o.y = ground - 230 * Math.sin(Math.PI * u) * (1 - 0.25 * u);
      o.lean = 0.5;
      o.walk = 0;
      o.airborne = true;
      o.front = u > 0.55;
      return o;
    }
    const d = t - A.T_LAND;
    const dist = A.V * d - 60 * Math.exp(-d * 8) + 60;
    o.x = A.XL - dist;
    o.ground = o.y = 902;
    o.lean = 0.5 * (1 - sstep(0, 0.15, d)) + 0.2;
    o.walk = 0.25 + dist / stride(o);
    o.front = true;
    return o;
  }

  const A_KICKS = [[-0.06, 640, 700, 1.4], [0.06, 470, 880, 1.2], [0.15, 720, 870, 1], [0.35, 560, 930, 1.1], [0.55, 980, 640, 0.8], [0.72, 470, 880, 1.2], [0.95, 640, 960, 1], [1.08, 380, 860, 1]];
  const A_TRACERS = [[-0.14, 1500, 170, 300, 300], [-0.02, 1450, 240, 250, 330], [0.18, 1550, 140, 350, 250], [0.46, 1480, 200, 280, 310], [0.7, 1520, 160, 320, 280], [0.92, 1460, 230, 260, 320]];
  const A_BURSTS = [[-0.08, 330, 600, 360], [0.62, 980, 520, 200]];
  function bursts(ctx, t, list) {
    for (const [t0, x, y, r] of list) {
      const d = t - t0;
      if (d < 0 || d > 0.6) continue;
      const e = Math.exp(-d * 4);
      const rr = r * (0.7 + 0.6 * Math.sqrt(d / 0.6));
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, `rgba(255,220,150,${0.8 * e})`);
      g.addColorStop(0.3, `rgba(255,140,60,${0.45 * e})`);
      g.addColorStop(1, 'rgba(200,70,30,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - rr, y - rr, 2 * rr, 2 * rr);
      ctx.restore();
    }
  }

  function drawA(ctx, t, info, K, C, S, Bt) {
    const dur = Bt.b0;
    const cam = (depth) => {
      ctx.translate(-A.OFF * depth, 0);
      LOOK.camera(ctx, { t, dur, focus: [A.OFF + 600, 700], push: 0.06, pan: [-70, 0], depth, ease: (x) => x });
    };
    ctx.save();
    ctx.translate(540, 700);
    ctx.scale(1.12, 1.12);
    ctx.translate(-540, -700);

    ctx.save();
    cam(0.25);
    K.drawFar(ctx, C, t + 2);
    K.farFlashes(ctx, t + 2, { rate: 10 });
    ctx.restore();
    ctx.save();
    cam(0.45);
    K.drawSmoke(ctx, C, t + 4, 0.6, -60);
    ctx.restore();
    ctx.save();
    cam(0.55);
    K.drawMid(ctx, C, t);
    ctx.restore();

    ctx.save();
    cam(1);
    K.drawStreet(ctx, C, t);
    tracers(ctx, t, A_TRACERS);
    ctx.save();
    ctx.translate(A.OFF, 0);
    bursts(ctx, t, A_BURSTS);
    ctx.restore();
    const jo = samA(t);
    const drawJ = () => {
      if (jo.airborne) {
        const lift = clamp01((jo.ground - jo.y) / 240);
        LOOK.contactShadow(ctx, { x: jo.x, y: jo.ground, h: jo.h * (1 - 0.4 * lift), alpha: 0.4 * (1 - 0.7 * lift), color: [14, 8, 10] });
      } else figure(ctx, S, K, jo, 1);
      FILM.cast.sam(ctx, jo);
    };
    LOOK.contactShadow(ctx, { x: A.HELMET[0], y: A.HELMET[1] + 2, h: 120, alpha: 0.5, color: [14, 8, 10] });
    FILM.cast.helmet(ctx, { x: A.HELMET[0], y: A.HELMET[1], size: 0.36 * A.JH, open: 0.9, rot: 0.08, t });
    if (!jo.front) drawJ();
    ctx.save();
    ctx.translate(A.BAR_DX, 0);
    K.drawFront(ctx, C);
    ctx.restore();
    for (const [tk, x, y, s] of A_KICKS) K.puff(ctx, x + A.OFF, y, t - tk, { size: s });
    if (jo.front) drawJ();
    ctx.restore();

    ctx.save();
    LOOK.camera(ctx, { t, dur, focus: [600, 700], push: 0.06, depth: 0.7 });
    K.drawAir(ctx, C, t, 0.6);
    ctx.restore();
    ctx.save();
    cam(1);
    K.embers(ctx, t, { seed: 1, count: 50, area: [A.OFF - 120, -40, W + 200, 1160] });
    ctx.restore();
    ctx.restore();
    lowSmoke(ctx, t, 980, 0.35, 1);
  }

  const Bc = {
    JH: 500,
    GROUND: 810,
    SCREEN_X: 600,
    V: 820,
    DIVE: 0.36,
    LAND: 0.6,
    GRAB: 0.68,
    RISE: 0.74,
  };

  function lieOpts(t, q) {
    return { x: 0, y: Bc.GROUND, h: Bc.JH, t, age: AGE, outfit: OUT, helmet: false, facing: -1, pose: 'fall', poseAmt: q, expr: 'squint', exprAmt: 0.8 };
  }

  function stateB(t, Bt) {
    const d = t - Bt.b0;
    const o = { h: Bc.JH, t, age: AGE, outfit: OUT, helmet: false, facing: -1, expr: 'squint', exprAmt: 0.8 };
    const xDive = -Bc.V * Bc.DIVE;
    const handLie = FILM.cast.sam.pose(lieOpts(t, QMAX)).hands[1];
    const xLie = xDive - 0.55 * Bc.V * (Bc.LAND - Bc.DIVE);
    const helmetX = xLie + handLie[0] - 6;
    const helmetY = Bc.GROUND + 4;
    let helm = { x: helmetX, y: helmetY, open: 0.9, rot: 0.08 };
    if (d < Bc.DIVE) {
      o.x = -Bc.V * d;
      o.y = o.ground = Bc.GROUND;
      Object.assign(o, { pose: 'sprintCrouch', poseAmt: 1, lean: 0.25 });
      o.walk = Bc.V * d / stride(o) + 0.1;
    } else if (d < Bc.LAND) {
      const u = (d - Bc.DIVE) / (Bc.LAND - Bc.DIVE);
      o.x = lerp(xDive, xLie, u);
      o.ground = Bc.GROUND;
      o.y = Bc.GROUND - 150 * Math.sin(Math.PI * u);
      Object.assign(o, { pose: 'diveReach', poseAmt: 1, airborne: true });
    } else {
      const q = QMAX * (1 - 0.45 * sstep(Bc.RISE, Bc.RISE + 0.3, d));
      Object.assign(o, lieOpts(t, q), { x: xLie });
      o.ground = Bc.GROUND;
      const hand = FILM.cast.sam.pose(o).hands[1];
      const g = sstep(Bc.GRAB - 0.06, Bc.GRAB + 0.04, d);
      helm = { x: lerp(helmetX, hand[0] - 6, g), y: lerp(helmetY, hand[1] + 10, g), open: lerp(0.9, 0, g), rot: lerp(0.08, -0.3, g) };
    }
    const run = Math.min(d, Bc.DIVE);
    const camX = d < Bc.DIVE ? -Bc.V * run : lerp(-Bc.V * Bc.DIVE, xLie - 160, LIB.ease.outCubic(clamp01((d - Bc.DIVE) / 0.4)));
    return { o, helm, camX, d };
  }

  function drawB(ctx, t, info, K, C, S, Bt) {
    const st = stateB(t, Bt);
    const dur = Bt.b1 - Bt.b0;
    const camX = st.camX;
    const shiftX = Bc.SCREEN_X - camX;
    ctx.save();
    ctx.translate(540, 600);
    ctx.scale(1.35, 1.35);
    ctx.translate(-540 + clamp01(-camX / 700) * 180 - 90, -600 - 30);
    K.drawClose(ctx, C, t);
    K.farFlashes(ctx, t, { spots: [[140, 560], [260, 548], [420, 566], [880, 552]], rate: 9 });
    ctx.restore();
    ctx.save();
    K.drawSmoke(ctx, C, t + 3, 0.4, -200);
    ctx.restore();

    ctx.save();
    LOOK.camera(ctx, { t: st.d, dur, focus: [Bc.SCREEN_X, 800], push: 0.05 });
    ctx.translate(shiftX, 0);
    ctx.save();
    const x0 = camX - 900, x1 = camX + 900;
    for (let i = Math.floor(x0 / 60); i < x1 / 60; i++) {
      const h = LIB.hash(ID, 'grit', i) >>> 0;
      const x = i * 60 + (h % 50), y = Bc.GROUND - 30 + ((h >>> 6) % 90);
      const s = 3 + ((h >>> 12) % 10);
      ctx.fillStyle = (h & 1) ? 'rgba(104,56,42,0.95)' : 'rgba(36,20,20,0.95)';
      ctx.beginPath();
      ctx.ellipse(x, y, s * 1.4, s * 0.6, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(240,140,70,0.35)';
      ctx.fillRect(x - s * 0.8, y - s * 0.6, s * 1.4, 1.5);
    }
    ctx.restore();
    for (const [tk, dx, dy, s] of [[0.05, -420, -10, 1.6], [0.22, 240, 20, 1.4], [0.4, -650, 0, 1.8], [0.55, 60, 40, 1.6], [0.7, -900, 10, 1.6]]) K.puff(ctx, Bc.SCREEN_X - shiftX + dx, Bc.GROUND + dy, st.d - tk, { size: s });
    const o = st.o;
    if (o.airborne) {
      const lift = clamp01((o.ground - o.y) / 150);
      LOOK.contactShadow(ctx, { x: o.x, y: o.ground, h: o.h * (1 - 0.4 * lift), alpha: 0.45 * (1 - 0.6 * lift), color: [14, 8, 10] });
    } else LOOK.contactShadow(ctx, { x: o.x, y: o.ground, h: o.h, alpha: 0.45, color: [14, 8, 10] });
    if (st.helm.open > 0.5) LOOK.contactShadow(ctx, { x: st.helm.x, y: Bc.GROUND + 6, h: 240, alpha: 0.5, color: [14, 8, 10] });
    FILM.cast.helmet(ctx, Object.assign({ size: 0.34 * Bc.JH, t }, st.helm));
    FILM.cast.sam(ctx, o);
    ctx.restore();

    ctx.save();
    K.drawAir(ctx, C, t, 0.5);
    ctx.restore();
    ctx.save();
    ctx.translate(shiftX * 0.3, 0);
    K.embers(ctx, t, { seed: 2, count: 34, area: [-600, -40, W + 1200, 1160] });
    ctx.restore();
    lowSmoke(ctx, t, 1040, 0.3, 2);
  }

  const Cc = { JH: 350, X: 760, GROUND: 715 };

  const C_DOWN = 0.31;
  const C_BELLY = 0.07;
  const C_Q = 0.9;

  function samC(t, Bt) {
    const d = t - Bt.b1;
    const qStart = QMAX * (1 - 0.45 * sstep(Bc.RISE, Bc.RISE + 0.3, Bt.b1 - Bt.b0));
    const up = qStart - 0.12 * sstep(0, 0.08, d);
    const k = sstep(0.05, C_DOWN, d);
    const q = lerp(up, C_Q, k);
    const slide = 40 * LIB.ease.outCubic(clamp01((d - 0.05) / 0.5));
    const o = { x: Cc.X - slide, y: Cc.GROUND, ground: Cc.GROUND, h: Cc.JH, t, age: AGE, outfit: OUT, helmet: false, facing: -1, pose: 'fall', poseAmt: q, expr: d < 0.3 ? 'wide' : 'closed', exprAmt: 0.9 };
    const P = FILM.cast.sam.pose(Object.assign({}, o, { poseAmt: C_Q }));
    const belly = Math.max(P.legs[0].hip[1], P.legs[1].hip[1]) + C_BELLY * Cc.JH;
    o.y = Cc.GROUND + Math.max(0, Cc.GROUND - belly) * k;
    return o;
  }

  function drawC(ctx, t, info, K, C, S, Bt) {
    const d = t - Bt.b1;
    const dur = Bt.b2 - Bt.b1;
    const OFF = 260;
    const sh = shake(t, Bt.b1, 26);
    ctx.save();
    ctx.translate(sh[0], sh[1]);
    ctx.translate(540, 820);
    ctx.scale(1.3 + 0.04 * sstep(0, dur, d), 1.3 + 0.04 * sstep(0, dur, d));
    ctx.translate(-540, -820);
    const cam = (depth) => ctx.translate(-OFF * depth + 20 * depth * sstep(0, dur, d), 0);

    ctx.save();
    cam(0.25);
    K.drawFar(ctx, C, t);
    K.farFlashes(ctx, t, { rate: 8 });
    ctx.restore();
    ctx.save();
    cam(0.45);
    K.drawSmoke(ctx, C, t + 7, 0.6, -40);
    ctx.restore();
    ctx.save();
    cam(0.55);
    K.drawMid(ctx, C, t);
    ctx.restore();
    ctx.save();
    cam(1);
    K.drawStreet(ctx, C, t);
    ctx.restore();

    ctx.save();
    const jo = samC(t, Bt);
    const P = FILM.cast.sam.pose(jo);
    const hipX = (P.legs[0].hip[0] + P.legs[1].hip[0]) / 2;
    const hipY = Math.max(P.legs[0].hip[1], P.legs[1].hip[1]) + C_BELLY * Cc.JH;
    const down = sstep(C_DOWN - 0.12, C_DOWN, d);
    LOOK.contactShadow(ctx, { x: hipX - 40, y: Cc.GROUND + 4, h: jo.h, rx: 0.75 * jo.h, ry: 18, alpha: 0.15 + 0.4 * down, color: [14, 8, 10] });
    LOOK.contactShadow(ctx, { x: hipX + 0.3 * jo.h, y: Cc.GROUND + 6, h: jo.h, rx: 0.3 * jo.h, ry: 12, alpha: 0.4 * down, color: [14, 8, 10] });
    K.puff(ctx, hipX - 60, Cc.GROUND + 8, d - C_DOWN + 0.14, { size: 1.9 });
    K.puff(ctx, hipX - 230, Cc.GROUND + 14, d - C_DOWN + 0.1, { size: 1.5 });
    K.puff(ctx, jo.x + 40, jo.y + 10, d - C_DOWN + 0.12, { size: 1.3 });
    const hand = P.hands[1];
    FILM.cast.helmet(ctx, { x: hand[0] - 6, y: hand[1] + 10, size: 0.34 * Cc.JH, open: 0, rot: -0.3, t });
    FILM.cast.sam(ctx, jo);
    ctx.restore();

    ctx.save();
    K.drawAir(ctx, C, t, 0.55);
    ctx.restore();
    K.embers(ctx, t, { seed: 3, count: 40 });
    ctx.restore();
    lowSmoke(ctx, t, 1000, 0.3, 3);
  }

  const Dc = { HX: 500, HY: 660, SIZE: 560, HAND: [830, 790] };

  function helmetD(t, Bt) {
    const k = sstep(Bt.b3 - 0.05, Bt.b4 + 0.15, t);
    const wob = 0.05 * Math.exp(-Math.max(0, t - Bt.b4) * 4) * Math.sin(Math.max(0, t - Bt.b4) * 16) * k;
    return { x: Dc.HX, y: Dc.HY, size: Dc.SIZE, open: lerp(0.72, 0.95, k), rot: lerp(0.42, 0.16, k) + wob, liner: 0.75 * sstep(Bt.b3, Bt.b4 + 0.1, t), t };
  }

  function helmetPt(h, p) {
    const s = h.size / 170, c = Math.cos(h.rot), sn = Math.sin(h.rot);
    return [h.x + (p[0] * c - p[1] * sn) * s, h.y + (p[0] * sn + p[1] * c) * s];
  }

  function star(ctx, x, y, R, a, rot) {
    if (R <= 0 || a <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const cr = Math.min(22, R * 0.14);
    const core = ctx.createRadialGradient(x, y, 0, x, y, cr);
    core.addColorStop(0, `rgba(255,250,232,${0.95 * a})`);
    core.addColorStop(1, 'rgba(255,226,170,0)');
    ctx.fillStyle = core;
    ctx.fillRect(x - cr, y - cr, 2 * cr, 2 * cr);
    ctx.translate(x, y);
    ctx.rotate(rot);
    const ray = (len, wid, al) => {
      const g = ctx.createLinearGradient(0, 0, len, 0);
      g.addColorStop(0, `rgba(255,250,230,${al})`);
      g.addColorStop(0.45, `rgba(255,232,186,${al * 0.75})`);
      g.addColorStop(1, 'rgba(255,220,160,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -wid);
      ctx.quadraticCurveTo(len * 0.25, -wid * 0.2, len, 0);
      ctx.quadraticCurveTo(len * 0.25, wid * 0.2, 0, wid);
      ctx.closePath();
      ctx.fill();
    };
    for (let k = 0; k < 4; k++) {
      ray(R, Math.max(2, R * 0.06), a);
      ctx.rotate(Math.PI / 2);
    }
    ctx.rotate(Math.PI / 4);
    for (let k = 0; k < 4; k++) {
      ray(R * 0.45, Math.max(1, R * 0.035), a * 0.7);
      ctx.rotate(Math.PI / 2);
    }
    ctx.restore();
  }

  function glintD(ctx, t, p, at) {
    const burst = LOOK.flashEnv(t, at, { rise: 2, fall: 11 });
    const settle = sstep(at + 0.12, at + 0.45, t);
    if (burst <= 0.01 && settle <= 0) return;
    const tw = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 4.3 + 1);
    const R = Math.max(210 * burst, 170 * settle * tw);
    const a = Math.max(burst, 0.95 * settle);
    LOOK.bloom(ctx, { x: p[0], y: p[1], r: 90 + 90 * burst, alpha: 0.28 * a, mid: 0.14 * a });
    const u = (t - at) / 0.34;
    if (u > 0 && u < 1) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = `rgba(255,236,190,${0.6 * (1 - u) * (1 - u)})`;
      ctx.lineWidth = 6 * (1 - u) + 1.5;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 40 + 190 * Math.sqrt(u), 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    star(ctx, p[0], p[1], R, a, 0.1 + 0.15 * settle * Math.sin(t * 1.7));
    star(ctx, p[0], p[1], 0.45 * R * settle, 0.5 * settle * tw, 0.1 + Math.PI / 8);
  }

  function drawD(ctx, t, info, K, C, S, Bt) {
    const d = t - Bt.b2;
    const dur = info.dur - Bt.b2;
    const hs = helmetD(t, Bt);
    const rimRy = 10 + 30 * Math.sin(hs.open * Math.PI * 0.5);
    const rimY = -rimRy * 0.2;
    const ring = helmetPt(hs, [0, rimY + 4 - 2 - 12]);
    const push = 0.08 * sstep(0, dur, d) + 0.1 * sstep(Bt.b6, info.dur, t);
    const cam = (depth) => {
      const z = 1 + push * depth;
      ctx.translate(ring[0], ring[1]);
      ctx.scale(z, z);
      ctx.translate(-ring[0], -ring[1]);
    };

    ctx.save();
    cam(0.5);
    ctx.translate(540, 540);
    ctx.scale(1.1, 1.1);
    ctx.translate(-540, -560);
    K.drawClose(ctx, C, t);
    K.farFlashes(ctx, t, { spots: [[140, 560], [260, 548], [420, 566], [880, 552]], rate: 5 });
    ctx.restore();
    ctx.save();
    cam(0.4);
    K.drawSmoke(ctx, C, t, 0.45, -240);
    ctx.restore();

    ctx.save();
    cam(1);
    const jo = { x: 0, y: 0, h: 1500, t, age: AGE, outfit: OUT, helmet: false, facing: -1, pose: 'fall', poseAmt: QMAX, expr: 'closed', exprAmt: 1, layer: 'front' };
    const hand = FILM.cast.sam.pose(jo).hands[0];
    jo.x = Dc.HAND[0] - hand[0];
    jo.y = Dc.HAND[1] - hand[1];
    LOOK.contactShadow(ctx, { x: hs.x + 10, y: hs.y + 50, h: 600, rx: 300, ry: 34, alpha: 0.55, color: [14, 8, 10] });
    LOOK.contactShadow(ctx, { x: Dc.HAND[0] + 120, y: Dc.HAND[1] + 40, h: 600, rx: 260, ry: 26, alpha: 0.45, color: [14, 8, 10] });
    FILM.cast.helmet(ctx, hs);
    FILM.cast.sam(ctx, jo);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const fl = 0.85 + 0.15 * Math.sin(t * 9.1) * Math.sin(t * 3.7);
    const rg = ctx.createRadialGradient(hs.x + 260, hs.y - 160, 0, hs.x + 260, hs.y - 160, 320);
    rg.addColorStop(0, `rgba(255,140,60,${0.2 * fl})`);
    rg.addColorStop(1, 'rgba(255,140,60,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(hs.x - 60, hs.y - 480, 640, 640);
    ctx.restore();
    glintD(ctx, t, ring, Bt.b6);
    K.puff(ctx, 940, 700, d - 0.5, { size: 1.4 });
    ctx.restore();

    ctx.save();
    K.drawAir(ctx, C, t, 0.45);
    ctx.restore();
    K.embers(ctx, t, { seed: 4, count: 30 });
    lowSmoke(ctx, t, 900, 0.32, 4);
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const K = SET();
      const C = K.statics(S);
      const Bt = beats(info);
      if (t < Bt.b0) drawA(ctx, t, info, K, C, S, Bt);
      else if (t < Bt.b1) drawB(ctx, t, info, K, C, S, Bt);
      else if (t < Bt.b2) drawC(ctx, t, info, K, C, S, Bt);
      else drawD(ctx, t, info, K, C, S, Bt);
      K.drawGrade(ctx, C);
      const fl = LOOK.flashEnv(t, Bt.b1, { rise: 1, fall: 9 });
      if (fl > 0.01) {
        ctx.save();
        ctx.fillStyle = `rgba(255,255,255,${0.95 * fl})`;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
