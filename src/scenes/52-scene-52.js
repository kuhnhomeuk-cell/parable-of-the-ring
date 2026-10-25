// scenes/52-scene-52.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-52';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;

  const JO = { age: 21, outfit: 'swim' };
  const MO = { outfit: 'beach', swim: true };
  const LAY = { mood: 'sunrise', horizon: 330, shore: 530, wet: 170 };

  function beatT(info, s, d) {
    const b = (info.shot && info.shot.beats) || [];
    const x = b.find((q) => q.text && q.text.indexOf(s) >= 0);
    return x ? x.t : d;
  }
  function wordT(info, tok, fb, from) {
    const sh = info.shot || {};
    const want = tok.toLowerCase();
    for (const c of sh.captions || []) {
      for (const [ft, w] of c.words || []) {
        const lt = ft - (sh.start || 0);
        if (lt >= (from == null ? 0 : from) && String(w).toLowerCase().replace(/[^a-z0-9']/g, '') === want) return lt;
      }
    }
    return fb;
  }
  function beats(info) {
    const ring = beatT(info, 'tokct tokaj tokap', 0.39);
    const thee = beatT(info, 'tokmf tokfx tokmg tokmh', 3.98);
    const took = beatT(info, 'tokab tokbf tokmi', 5.92);
    const thank = beatT(info, 'tokmm tokmn', 8.26);
    return {
      ring, thee, took, thank,
      slide0: wordT(info, 'tokmc', 2.39) + 0.1, slide1: wordT(info, 'tokme', 3.28) + 0.35,
      wed: wordT(info, 'tokmh', 5.30, thee),
      chances: wordT(info, 'tokmn', 11.08, thank),
      cutA2: thee - 0.15, cutB: took - 0.2, cutB2: thank - 0.08,
    };
  }

  const MHA = 1320;
  const JHA = MHA / 0.95 / 1.12;
  const FEET_A = 1300;
  const MXA = 300;
  const L_M = 27.5 * 1.15 * (MHA / 330);
  const RING_A = 0.04 * MHA;
  const HAND_A = [0.2, 0.06];

  const JHB = 860;
  const JRB = FILM.cast.sam.height(Object.assign({ h: JHB }, JO));
  const MHB = JRB * 0.95;
  const FEET_B = 1230;
  const JXB = 735, MXB = 205;
  const JAW = [-0.205, 0.195];
  const JAW_FAR = [0.025, 0.198];
  const B2 = { at: [430, 470], z: 1.35 };

  const rot = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];

  function drawA(ctx, t, info, S, B, C) {
    const BEACH = FILM.sets.beach;
    const BD = BEACH.backdrop(S, C, { blur: 9 });
    const punch = t >= B.cutA2;
    const mo = Object.assign({}, MO, { x: MXA, y: FEET_A, h: MHA, t, facing: 1, light: C.m.light, breeze: 0.4, look: -0.1 });
    const ch = FILM.cast.ava.pose(Object.assign({}, mo, { pose: 'stand', t: 0 })).chest;
    const goal = [ch[0] + HAND_A[0] * MHA, ch[1] + HAND_A[1] * MHA];
    let T = goal.slice();
    for (let i = 0; i < 3; i++) {
      const P = FILM.cast.ava.pose(Object.assign({}, mo, { pose: 'hug', target: { x: T[0], y: T[1] } })).hands[0];
      T = [T[0] + goal[0] - P[0], T[1] + goal[1] - P[1]];
    }
    mo.pose = 'hug';
    mo.target = { x: T[0], y: T[1] };
    const seat = sstep(B.slide1 - 0.1, B.slide1 + 0.3, t);
    mo.expr = t < B.wed - 0.4 ? { tearful: 0.6, wonder: 0.4 * (1 - seat), loving: 0.4 * seat } : { tearful: 0.4, loving: 0.5, smileSoft: 0.4 };
    const MP = FILM.cast.ava.pose(mo);
    const base = MP.rings[0];
    const ha = MP.handAngles[0];
    const dir = [Math.cos(ha), Math.sin(ha)];
    const tip = [base[0] + dir[0] * 0.58 * L_M, base[1] + dir[1] * 0.58 * L_M];

    const F = [base[0] + 30, base[1] - 170];
    const cam = (g, d) => {
      if (punch) {
        g.translate(F[0], F[1]);
        g.scale(1 + 0.3 * d, 1 + 0.3 * d);
        g.translate(-F[0], -F[1]);
      }
      LOOK.camera(g, { t, dur: info.dur, focus: F, push: 0.03, depth: d });
    };
    ctx.save();
    cam(ctx, 0.3);
    ctx.drawImage(BD, 0, 0, 1080, 1080);
    ctx.restore();

    const slide = LIB.ease.inOutSine(clamp01((t - B.slide0) / (B.slide1 - B.slide0)));
    const ringP = [lerp(tip[0], base[0], slide), lerp(tip[1], base[1], slide)];
    const bring = LIB.ease.inOutSine(clamp01((t - B.ring + 0.3) / 1.6));
    const letGo = LIB.ease.inOutSine(clamp01((t - B.slide1 - 0.55) / 0.7));
    const pa = bring * (1 - 0.65 * letGo);
    const j0 = Object.assign({ x: 0, y: FEET_A, h: JHA, t, facing: -1, pose: 'handshake', poseAmt: 1, blinkOffset: 0.9, expr: 'smileSmall', look: -0.2 }, JO);
    const W1 = FILM.cast.sam.pose(j0).hands[0];
    const L_J = 0.133 * JHA;
    const inHand = [-0.6 * L_J, -0.05 * L_J];
    const jx0 = tip[0] - inHand[0] - W1[0];
    const jo = Object.assign({}, j0, { x: jx0 + (ringP[0] - tip[0]) + 40 * letGo, y: FEET_A + (ringP[1] - tip[1]), poseAmt: pa });
    const JP = FILM.cast.sam.pose(jo);
    const held = t < B.slide1 + 0.6;
    const fing = rot(inHand, -Math.PI / 2 * (1 - pa));
    const inFingers = [JP.hands[0][0] + fing[0], JP.hands[0][1] + fing[1]];
    const rp = held && t < B.slide0 ? inFingers : ringP;

    ctx.save();
    cam(ctx, 1);
    FILM.cast.sam(ctx, jo);
    FILM.cast.ava(ctx, mo);
    const R = FILM.cast.diamondRing(ctx, { x: rp[0], y: rp[1], size: RING_A, rot: 0.5, tilt: 0.12, spin: ha + Math.PI / 2, t, sparkle: 0, shadow: 0, lw: 3.4 });
    ctx.restore();
    BEACH.air(ctx, C, t, cam, 0.45);
    ctx.save();
    cam(ctx, 1);
    const seatG = Math.exp(-Math.pow((t - B.slide1 - 0.05) / 0.22, 2));
    const wedG = Math.exp(-Math.pow((t - B.wed) / 0.3, 2));
    const tw = 0.5 + 0.5 * Math.sin(t * 5.3);
    if (R) {
      LOOK.bloom(ctx, { x: R.glint[0], y: R.glint[1], r: 50 + 50 * seatG + 110 * wedG, alpha: 0.2 + 0.3 * seatG + 0.55 * wedG });
      LOOK.glint(ctx, { x: R.glint[0], y: R.glint[1], size: 16 + 6 * tw + 18 * seatG + 40 * wedG, alpha: 0.55 + 0.2 * tw + 0.25 * Math.max(seatG, wedG), rot: 0.1 * Math.sin(t) });
    }
    ctx.restore();
  }

  function drawB(ctx, t, info, S, B, C) {
    const BEACH = FILM.sets.beach;
    const tb = t - B.cutB;
    const cam = (g, d) => LOOK.camera(g, { t: tb, dur: info.dur - B.cutB, focus: [520, 460], push: 0.04, depth: d });
    BEACH.back(ctx, C, t, cam);

    const reach = LIB.ease.inOutSine(clamp01((t - B.took + 0.05) / 0.9));
    const laugh = sstep(B.chances - 0.5, B.chances + 0.3, t);
    const smile = sstep(B.thank + 0.6, B.thank + 1.6, t);
    const jo = Object.assign({ x: JXB, y: FEET_B, h: JHB, t, facing: -1, blinkOffset: 0.6, lean: 0.3 * reach, look: -0.05 }, JO);
    jo.expr = laugh > 0.01 ? { laughOpen: laugh, teary: 0.4 * (1 - laugh), smileSmall: 0.6 * (1 - laugh) } : { teary: 0.5, smileSmall: 0.5 + 0.3 * smile };
    const JP = FILM.cast.sam.pose(jo);

    const mo = Object.assign({}, MO, { x: MXB, y: FEET_B, h: MHB, t, facing: 1, light: C.m.light, breeze: 0.4, look: 0.14 + 0.04 * reach });
    mo.expr = laugh > 0.01 ? { laugh: laugh, tearful: 0.4 * (1 - laugh), smileSoft: 0.6 * (1 - laugh) } : { tearful: 0.6 - 0.2 * smile, loving: 0.4, smileSoft: 0.2 + 0.4 * smile };
    const goals = [JAW, JAW_FAR].map((q) => [JP.head[0] + q[0] * JRB, JP.head[1] + q[1] * JRB]);
    const T = goals.map((g) => g.slice());
    for (let i = 0; i < 3; i++) {
      const P = FILM.cast.ava.pose(Object.assign({}, mo, { pose: 'handsToFace', target: { x: T[0][0], y: T[0][1] },
        targetNear: { x: T[0][0], y: T[0][1] }, targetFar: { x: T[1][0], y: T[1][1] } })).hands;
      for (const k of [0, 1]) T[k] = [T[k][0] + goals[k][0] - P[k][0], T[k][1] + goals[k][1] - P[k][1]];
    }
    mo.target = { x: T[0][0], y: T[0][1] };
    mo.targetNear = { x: T[0][0], y: T[0][1] };
    mo.targetFar = { x: T[1][0], y: T[1][1] };
    mo.pose = reach >= 0.999 ? 'handsToFace' : reach > 0.001 ? { stand: 1 - reach, handsToFace: reach } : 'stand';
    const MP = FILM.cast.ava.pose(mo);
    const fin = MP.rings[0];
    const ha = MP.handAngles[0];

    ctx.save();
    cam(ctx, 1);
    FILM.cast.ava(ctx, mo);
    const R = FILM.cast.diamondRing(ctx, { x: fin[0], y: fin[1], size: 0.04 * MHB, rot: 0.5, tilt: 0.1, spin: ha + Math.PI / 2, t, sparkle: 0, shadow: 0, lw: 3.2 });
    FILM.cast.sam(ctx, jo);
    const front = sstep(0.72, 0.98, reach);
    if (front > 0.001) {
      const w = MP.hands[0], L = 27.5 * 1.15 * MP.scale;
      const tip = [w[0] + Math.cos(ha) * (L + 0.02 * MHB), w[1] + Math.sin(ha) * (L + 0.02 * MHB)];
      const back = [w[0] - Math.cos(ha) * 0.03 * MHB, w[1] - Math.sin(ha) * 0.03 * MHB];
      const r = 0.032 * MHB, a = Math.atan2(tip[1] - back[1], tip[0] - back[0]);
      ctx.save();
      ctx.beginPath();
      ctx.rect(-2000, -2000, 5080, 5080);
      ctx.moveTo(tip[0] + Math.cos(a - Math.PI / 2) * r, tip[1] + Math.sin(a - Math.PI / 2) * r);
      ctx.arc(tip[0], tip[1], r, a - Math.PI / 2, a + Math.PI / 2);
      ctx.arc(back[0], back[1], r, a + Math.PI / 2, a + Math.PI * 1.5);
      ctx.closePath();
      ctx.clip('evenodd');
      FILM.cast.ava(ctx, front >= 0.999 ? mo : Object.assign({}, mo, { alpha: front }));
      ctx.restore();
    }
    ctx.restore();
    BEACH.air(ctx, C, t, cam, 0.45);
    ctx.save();
    cam(ctx, 1);
    const tw = 0.5 + 0.5 * Math.sin(t * 4.1);
    if (R) {
      LOOK.bloom(ctx, { x: R.glint[0], y: R.glint[1], r: 36, alpha: 0.18 + 0.1 * tw });
      LOOK.glint(ctx, { x: R.glint[0], y: R.glint[1], size: 12 + 6 * tw, alpha: 0.5 + 0.2 * tw, rot: 0.1 * Math.sin(t) });
    }
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const B = beats(info);
      const C = FILM.sets.beach.statics(S, LAY);
      if (t < B.cutB) drawA(ctx, t, info, S, B, C);
      else if (t < B.cutB2) drawB(ctx, t, info, S, B, C);
      else {
        const k = LIB.ease.inOutSine(clamp01((t - B.cutB2) / (info.dur - B.cutB2)));
        const z = B2.z + 0.08 * k;
        ctx.save();
        ctx.translate(B2.at[0], B2.at[1]);
        ctx.scale(z, z);
        ctx.translate(-B2.at[0], -B2.at[1]);
        drawB(ctx, t, info, S, B, C);
        ctx.restore();
      }
      FILM.sets.beach.grade(ctx, C, 1);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
