// scenes/35-scene-35.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-35';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const W = 1080;
  const H = 1080;

  const normTok = (s) => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
  function wordT(info, tok, n, fb) {
    const sh = info.shot;
    const want = normTok(tok);
    let k = 0;
    for (const c of sh.captions || []) {
      for (const w of c.words || []) {
        const lt = w[0] - sh.start;
        if (lt < -0.02 || lt > info.dur + 0.02 || normTok(w[1]) !== want) continue;
        if (k === (n || 0)) return lt;
        k++;
      }
    }
    return fb;
  }
  function rig(ctx, t, dur, list, hand) {
    let i = 0;
    while (i + 1 < list.length && t >= list[i + 1].at) i++;
    const s = list[i];
    const end = i + 1 < list.length ? list[i + 1].at : dur;
    const u = Math.max(0, Math.min(1, (t - s.at) / Math.max(0.01, end - s.at)));
    const e = u * (1.6 - 0.6 * u);
    const z = s.z * (1 + (s.p == null ? 0.035 : s.p) * e);
    let dx = (s.d ? s.d[0] : 0) * e;
    let dy = (s.d ? s.d[1] : 0) * e;
    if (hand) {
      const w = (f, ph) => Math.sin(t * 6.2832 * f + ph);
      dx += hand * (0.55 * w(0.63, 0.4) + 0.3 * w(1.37, 2.1) + 0.15 * w(3.1, 4.4));
      dy += hand * (0.5 * w(0.71, 1.7) + 0.33 * w(1.53, 0.2) + 0.17 * w(2.9, 3.3));
    }
    const fx = s.f[0], fy = s.f[1];
    const cl = (v, a, b) => (v < a ? a : v > b ? b : v);
    dx = cl(dx, 540 - fx * z, (1080 - fx) * z - 540);
    dy = cl(dy, 540 - fy * z, (1080 - fy) * z - 540);
    ctx.translate(540 - dx, 540 - dy);
    ctx.scale(z, z);
    ctx.translate(-fx, -fy);
    return i;
  }

  const SET = () => FILM.sets.outpost;
  const PAR = { far: 0.25, smoke: 0.45, mid: 0.55, near: 1, air: 0.7 };
  const JH = 240;
  const AGE = 19;
  const SGT_H = JH * 1.16;

  const OFF = 220;
  const PAN = 40;
  const BAR_DX = 120;

  let T_DIVE = 0.52;
  let T_LAND = 1.0;
  let T_GRAB = 1.19;
  let T_RISE = 1.39;
  let T_UP = 1.84;
  let T_TURN = 3.0;
  let T_RUN = 3.3;
  let T_HIT = 4.18;
  let T_DOWN = 4.85;
  let T_BLACK = 5.26;
  let PK = 0.69;
  let J_START = 916;
  function setKeys(info) {
    const helmet = wordT(info, 'tokak', 0, 1.19);
    const got2 = wordT(info, 'tokdf', 1, 4.16);
    T_GRAB = helmet;
    T_LAND = T_GRAB - 0.19;
    T_DIVE = T_LAND - 0.48;
    T_RISE = T_GRAB + 0.2;
    T_UP = T_GRAB + 0.65;
    T_HIT = got2 + 0.02;
    T_RUN = T_HIT - 0.88;
    T_TURN = T_RUN - 0.3;
    T_BLACK = Math.min(info.dur - 0.05, Math.max(T_HIT + 0.9, info.dur - 0.45));
    PK = (T_BLACK - T_HIT) / 1.56;
    T_DOWN = T_HIT + 0.67 * PK;
    J_START = 760 - 300 * 0.18 + 300 * T_DIVE;
  }
  const post = (k) => T_HIT + k * PK;

  const QMAX = 0.85;
  const HELMET_X = 330;
  const HELMET_Y = 846;
  const J_LIE_X = 640;
  const RUN_V = 260;

  function runDist(d) {
    const A = 0.45;
    if (d <= A) return (RUN_V * d * d) / (2 * A);
    return (RUN_V * A) / 2 + RUN_V * (d - A);
  }
  const X_HIT = J_LIE_X + runDist(0.88);

  const base = (t) => ({ y: SET().GROUND, h: JH, t, age: AGE, outfit: 'fatigues-desert' });

  function sam(t) {
    const o = base(t);
    if (t < T_DIVE) {
      const x = J_START - 300 * t;
      Object.assign(o, { x, facing: -1, helmet: false, pose: 'sprintCrouch', poseAmt: 1, expr: 'squint', exprAmt: 0.5 });
      o.walk = -x / FILM.cast.sam.stride(o);
      return { o, helmet: { x: HELMET_X, y: HELMET_Y, open: 0.9, rot: 0 } };
    }
    if (t < T_LAND) {
      const u = (t - T_DIVE) / (T_LAND - T_DIVE);
      const x = lerp(J_START - 300 * T_DIVE, J_LIE_X, u);
      const y = SET().GROUND - 70 * Math.sin(Math.PI * u);
      Object.assign(o, { x, y, facing: -1, helmet: false, pose: 'diveReach', poseAmt: 1, airborne: true, lift: 70 * Math.sin(Math.PI * u) });
      return { o, helmet: { x: HELMET_X, y: HELMET_Y, open: 0.9, rot: 0 } };
    }
    if (t < T_UP) {
      const q = QMAX * (1 - sstep(T_RISE, T_UP, t));
      Object.assign(o, { x: J_LIE_X, facing: -1, helmet: false, pose: 'fall', poseAmt: q, expr: 'squint', exprAmt: 0.7 });
      const hand = FILM.cast.sam.pose(o).hands[0];
      const g = sstep(T_GRAB - 0.1, T_GRAB + 0.1, t);
      const hx = lerp(HELMET_X, hand[0] - 4, g), hy = lerp(HELMET_Y, hand[1] + 6, g);
      return { o, helmet: { x: hx, y: hy, open: lerp(0.9, 0, g), rot: lerp(0, -0.3, g) } };
    }
    if (t < T_TURN) {
      const k = sstep(T_UP, T_UP + 0.1, t) * (1 - sstep(T_TURN - 0.12, T_TURN, t));
      Object.assign(o, { x: J_LIE_X, facing: -1, helmet: true, pose: 'touchHead', poseAmt: k, look: 0.25, expr: 'squint', exprAmt: 0.6 });
      return { o, helmet: null };
    }
    if (t < T_RUN) {
      const k = sstep(T_TURN + 0.1, T_RUN, t);
      Object.assign(o, { x: J_LIE_X, facing: 1, helmet: true, pose: 'sprintCrouch', poseAmt: 0.6 * k, walk: 0, lean: 0.3 * k, expr: 'squint', exprAmt: 0.6 });
      return { o, helmet: null };
    }
    if (t < T_HIT) {
      const x = J_LIE_X + runDist(t - T_RUN);
      Object.assign(o, { x, facing: 1, helmet: true, pose: 'sprintCrouch', poseAmt: lerp(0.6, 1, sstep(T_RUN, T_RUN + 0.15, t)), expr: 'squint', exprAmt: 0.6 });
      o.walk = (x - J_LIE_X) / FILM.cast.sam.stride(o);
      return { o, helmet: null };
    }
    const q = QMAX * sstep(T_HIT, T_DOWN, t);
    const slide = 50 * LIB.ease.outCubic(clamp01((t - T_HIT) / (0.6 * PK)));
    const drag = dragX(t);
    Object.assign(o, { x: X_HIT + slide + drag, facing: 1, helmet: true, pose: 'fall', poseAmt: q, expr: 'closed', exprAmt: q });
    return { o, helmet: null };
  }

  function dragX(t) {
    return 46 * sstep(post(0.72), post(1.07), t) + 40 * sstep(post(1.22), post(1.52), t);
  }
  const heave = (t) => {
    const a = sstep(post(0.72), post(1.07), t) * (1 - sstep(post(1.07), post(1.22), t)), b = sstep(post(1.22), post(1.52), t);
    return Math.max(a, b);
  };

  function sergeant(t, jo) {
    const y = SET().GROUND - 2;
    if (t < post(0.35)) {
      return { x: 1180 + BAR_DX, y, h: SGT_H, t, facing: -1, pose: t < T_HIT ? 'shout' : 'waveDown', crouch: 0.85, rate: 3, look: 0.1 };
    }
    const head = FILM.cast.sam.pose(jo).head;
    const reach = sstep(post(0.35), T_DOWN, t);
    const x = lerp(1180 + BAR_DX, head[0] + 0.42 * JH, reach);
    return { x, y, h: SGT_H, t, facing: -1, pose: 'pullIn', heave: heave(t), look: 0.1 };
  }

  function partner(t, jo) {
    if (t < post(0.52)) return null;
    const head = FILM.cast.sam.pose(jo).head;
    const k = sstep(post(0.52), post(0.77), t);
    return { x: head[0] - 0.3 * JH - 30 * (1 - k), y: SET().GROUND - 20, h: JH * 0.96, t, facing: -1, variant: 2, pose: 'kneelOffer', poseAmt: 1, lean: 0.4 + 0.3 * heave(t), expr: 'wide', exprAmt: 0.6 };
  }

  const KICKS = [[0.4, 520, 780, 0.8], [1.2, 900, 640, 0.7], [1.9, 420, 900, 0.9], [2.6, 760, 760, 0.9], [3.1, 1040, 650, 0.7], [3.5, 600, 905, 1], [4.6, 760, 640, 0.7]];

  function figShadow(ctx, S, K, fn, o) {
    if (o.airborne) {
      LOOK.contactShadow(ctx, { x: o.x, y: K.GROUND, h: o.h, alpha: 0.4 - 0.002 * o.lift, color: [14, 8, 10] });
      return;
    }
    LOOK.castShadow(ctx, { x: o.x, y: o.y, h: o.h, k: K.SHADOW_K, S, alpha: 0.22, color: 'rgb(16,8,10)', draw: (g) => fn(g, o) });
    LOOK.contactShadow(ctx, { x: o.x, y: o.y, h: o.h, alpha: 0.4, color: [14, 8, 10] });
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const K = SET();
      const C = K.statics(S);
      setKeys(info);

      if (t >= T_BLACK) {
        ctx.fillStyle = 'rgb(10,6,7)';
        ctx.fillRect(0, 0, W, H);
        LOOK.grain(ctx, info);
        FILM.cast.caption(ctx, info);
        return;
      }

      ctx.save();
      rig(ctx, t, T_BLACK, [
        { at: 0, f: [560, 620], z: 1.08, d: [-16, -6], p: 0.04 },
        { at: T_GRAB - 0.25, f: [300, 740], z: 1.9, d: [-8, -6], p: 0.06 },
        { at: T_UP + 0.12, f: [430, 700], z: 1.7, d: [-10, -6], p: 0.05 },
        { at: T_TURN - 0.14, f: [560, 620], z: 1.08, d: [16, -4], p: 0.04 },
        { at: T_HIT - 0.08, f: [690, 760], z: 1.75, d: [-10, -8], p: 0.06 },
      ], 7);

      const cam = (depth) => {
        ctx.translate(-OFF * depth, 0);
        LOOK.camera(ctx, { t, dur: T_BLACK, focus: [OFF + 560, 640], push: 0.02, pan: [PAN, 0], depth });
      };

      ctx.save();
      cam(PAR.far);
      K.drawFar(ctx, C, t);
      K.farFlashes(ctx, t, { rate: 8 });
      ctx.restore();
      ctx.save();
      cam(PAR.smoke);
      K.drawSmoke(ctx, C, t + 9, 0.55, -60);
      ctx.restore();
      ctx.save();
      cam(PAR.mid);
      K.drawMid(ctx, C, t);
      ctx.restore();

      ctx.save();
      cam(PAR.near);
      K.drawStreet(ctx, C, t);
      for (const [tk, x, y, s] of KICKS) K.puff(ctx, x + OFF, y, t - tk, { size: s });

      const J = sam(t);
      const so = sergeant(t, J.o);
      const po = partner(t, J.o);
      figShadow(ctx, S, K, FILM.cast.sergeant, so);
      if (po) figShadow(ctx, S, K, FILM.cast.soldier, po);
      figShadow(ctx, S, K, FILM.cast.sam, J.o);
      if (J.helmet && J.helmet.y >= HELMET_Y - 1) LOOK.contactShadow(ctx, { x: J.helmet.x, y: HELMET_Y + 2, h: 120, alpha: 0.5, color: [14, 8, 10] });
      if (po) FILM.cast.soldier(ctx, po);
      FILM.cast.sergeant(ctx, so);
      if (J.helmet) FILM.cast.helmet(ctx, Object.assign({ size: 0.33 * JH, t }, J.helmet));
      FILM.cast.sam(ctx, J.o);
      ctx.save();
      ctx.translate(BAR_DX, 0);
      K.drawFront(ctx, C);
      ctx.restore();
      ctx.restore();

      ctx.save();
      LOOK.camera(ctx, { t, dur: T_BLACK, focus: [560, 640], push: 0.02, depth: PAR.air });
      K.drawAir(ctx, C, t, 0.55);
      ctx.restore();
      ctx.save();
      cam(PAR.near);
      K.embers(ctx, t, { seed: 35, count: 44, area: [OFF - 40, -40, W + PAN + 80, 1160] });
      ctx.restore();

      ctx.restore();
      K.drawGrade(ctx, C);

      const fl = LOOK.flashEnv(t, T_HIT, { rise: 1, fall: 9 });
      if (fl > 0.01) {
        ctx.save();
        ctx.fillStyle = `rgba(255,255,255,${0.92 * fl})`;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
