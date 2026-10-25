// scenes/45-scene-45.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-45';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;

  const LAY = { mood: 'loss', horizon: 360, shore: 600, wet: 320 };
  const JO = { age: 21, outfit: 'swim' };
  const jR = (h) => FILM.cast.sam.height(Object.assign({ h }, JO));
  const MO = { outfit: 'beach', swim: true, breeze: 0.45 };

  const A = { ground: 930, jh: 520, jx: 620, mx0: 300, mx1: 410 };
  const Bs = { mx: 450, mFeet: 1400, mh: 1100, jx: 930, jFeet: 1520, jh: 1034 };
  const Cs = { mx: 270, mFeet: 1530, mh: 1380, jx: 880, jFeet: 1680, jh: 1270 };

  function beatT(info, txt, fb) {
    const b = ((info.shot && info.shot.beats) || []).find((x) => x.text.indexOf(txt) >= 0);
    return b ? b.t : fb;
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
    const held = beatT(info, 'tokiw tokko tokbt', 0.26);
    const mad = beatT(info, 'tokkp tokkb tokkq', 1.92);
    const parents = beatT(info, 'tokkr tokks', 4.09);
    const well = beatT(info, 'tokkx tokky', 6.03);
    const buy = wordT(info, 'tokkx', 6.26);
    const ring = beatT(info, 'tokbx tokac tokap', 9.23);
    return { held, mad, parents, buy, ring, cut1: parents - 0.12, cutP: well - 0.08, cut2: ring - 0.15 };
  }
  const PUNCH = { at: [500, 500], z: 1.38 };

  const TEARS = (() => {
    const r = LIB.rng(sd('tears'));
    const out = [];
    for (let i = 0; i < 18; i++) out.push([r.range(-0.08, 0.08), r.range(-0.01, 0.02), r.range(0.006, 0.012)]);
    return out;
  })();

  function avaExpr(t, B) {
    const soft = sstep(B.mad - 0.3, B.mad + 0.5, t);
    return { tearful: 0.5 * (1 - soft) + 0.08 * soft, wonder: 0.4 * (1 - soft), smileSoft: 0.1 + 0.62 * soft, neutral: 0.3 * soft };
  }

  function setupA(ctx, t, info, B, C) {
    const BEACH = FILM.sets.beach;
    const cam = (g, d) => LOOK.camera(g, { t, dur: B.cut1, focus: [540, 780], push: 0.05, depth: d });
    BEACH.back(ctx, C, t, cam);
    const JR = jR(A.jh);
    const MH = JR * 0.95;
    const jo = Object.assign({ x: A.jx, y: A.ground, h: A.jh, t, facing: 1, pose: 'weepSit', poseAmt: 1 }, JO);
    const JP = FILM.cast.sam.pose(jo);

    const w = LIB.ease.inOutSine(clamp01((t - (B.held - 0.1)) / 0.7));
    const kn = LIB.ease.inOutSine(clamp01((t - (B.held + 0.45)) / 0.85));
    const mx = lerp(A.mx0, A.mx1, w);
    const s = MH / 330;
    const mo = Object.assign({ x: mx, y: A.ground, h: MH, t, facing: 1, light: C.m.light, expr: avaExpr(t, B) }, MO);
    if (kn > 0.001) {
      mo.target = { x: JP.back[0] + 7 * s, y: JP.back[1] - 5 * s };
      mo.pose = kn >= 0.999 ? 'kneelHold' : { walk: 1 - kn, kneelHold: kn };
      mo.walk = (mx - A.mx0) / (2 * FILM.cast.ava.STEP * MH);
      mo.look = 0.05 + 0.1 * sstep(B.mad - 0.3, B.mad + 0.5, t);
    } else if (w > 0.001) {
      mo.pose = 'walk';
      mo.walk = (mx - A.mx0) / (2 * FILM.cast.ava.STEP * MH);
    } else {
      const P = FILM.cast.ava.pose(Object.assign({}, mo, { pose: 'handsToFace', target: { x: mx, y: A.ground - 0.6 * MH } }));
      mo.pose = 'handsToFace';
      mo.target = { x: P.chest[0] + 14 * s, y: P.chest[1] - 7 * s };
      mo.look = -0.1;
    }

    ctx.save();
    cam(ctx, 1);
    LOOK.contactShadow(ctx, { x: A.jx + 0.12 * JR, y: A.ground, h: JR, alpha: C.m.contactA });
    LOOK.contactShadow(ctx, { x: mx + 8, y: A.ground, h: MH, alpha: C.m.contactA * 0.9 });
    const spot = [JP.hands[0][0] + 0.02 * JR, A.ground + 0.012 * JR];
    TEARS.forEach(([dx, dy, r], i) => {
      ctx.fillStyle = `rgba(70,62,54,${0.3 * clamp01((t - 0.6 * i) / 0.25 + 1)})`;
      ctx.beginPath();
      ctx.ellipse(spot[0] + dx * JR, spot[1] + dy * JR, r * JR * 1.6, r * JR * 0.55, 0, 0, TAU);
      ctx.fill();
    });
    FILM.cast.sam(ctx, Object.assign({}, jo, { layer: 'back' }));
    FILM.cast.ava(ctx, mo);
    FILM.cast.sam(ctx, Object.assign({}, jo, { layer: 'front' }));
    ctx.restore();
    BEACH.air(ctx, C, t, cam, 0.8);
  }

  function closeBack(ctx, S, C, cam) {
    const BD = FILM.sets.beach.backdrop(S, C, { blur: 7 });
    ctx.save();
    cam(ctx, 0.3);
    ctx.drawImage(BD, 0, 0, 1080, 1080);
    ctx.restore();
  }

  function setupB(ctx, t, info, B, C, S) {
    const tb = t - B.cut1;
    const cam = (g, d) => LOOK.camera(g, { t: tb, dur: B.cut2 - B.cut1, focus: [460, 480], push: 0.04, depth: d });
    closeBack(ctx, S, C, cam);
    const jo = Object.assign({ x: Bs.jx, y: Bs.jFeet, h: Bs.jh, t, facing: 1, lean: 1, look: -0.4, expr: 'cry', blinkOffset: 1.1 }, JO);
    const JP = FILM.cast.sam.pose(jo);
    const g = sstep(B.buy + 0.15, B.buy + 0.85, t) * (1 - sstep(B.ring - 1.3, B.ring - 0.5, t));
    const s = Bs.mh / 330;
    const target = { x: JP.back[0] + 4 * s, y: JP.back[1] - 8 * s };
    const targetNear = { x: JP.back[0] - 22 * s, y: JP.back[1] + 12 * s };
    const targetFar = { x: JP.back[0] - 4 * s, y: JP.back[1] - 16 * s };
    const mo = Object.assign({ x: Bs.mx, y: Bs.mFeet, h: Bs.mh, t, facing: 1, light: C.m.light, front: 0.35 + 0.15 * g,
      pose: 'hug', target, targetNear, targetFar, palmUp: [g, 0],
      look: 0.08 + 0.1 * g + 0.04 * Math.sin(t * 1.3), expr: { smileSoft: 0.65 + 0.15 * g, neutral: 0.25, tearful: 0.1 - 0.1 * g } }, MO);
    ctx.save();
    cam(ctx, 1);
    FILM.cast.sam(ctx, jo);
    FILM.cast.ava(ctx, mo);
    ctx.restore();
    FILM.sets.beach.air(ctx, C, t, cam, 0.5);
  }

  function setupC(ctx, t, info, B, C, S) {
    const tc = t - B.cut2;
    const cam = (g, d) => LOOK.camera(g, { t: tc, dur: info.dur - B.cut2, focus: [560, 470], push: 0.08, depth: d });
    closeBack(ctx, S, C, cam);
    const mo = Object.assign({ x: Cs.mx, y: Cs.mFeet, h: Cs.mh, t, facing: 1, light: C.m.light, front: 0.45, pose: 'stand',
      look: 0.06, expr: { smileSoft: 0.45, neutral: 0.55 } }, MO);
    const jo = Object.assign({ x: Cs.jx, y: Cs.jFeet, h: Cs.jh, t, facing: -1, lean: 0.6, look: -0.38, expr: 'cry', blinkOffset: 2.1 }, JO);
    ctx.save();
    cam(ctx, 1);
    FILM.cast.sam(ctx, jo);
    FILM.cast.ava(ctx, mo);
    ctx.restore();
    FILM.sets.beach.air(ctx, C, t, cam, 0.5);
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const BEACH = FILM.sets.beach;
      const B = beats(info);
      const C = BEACH.statics(S, LAY);
      BEACH.backdrop(S, C, { blur: 7 });
      if (t < B.cut1) setupA(ctx, t, info, B, C);
      else if (t < B.cutP) {
        ctx.save();
        ctx.translate(PUNCH.at[0], PUNCH.at[1]);
        ctx.scale(PUNCH.z, PUNCH.z);
        ctx.translate(-PUNCH.at[0], -PUNCH.at[1]);
        setupB(ctx, t, info, B, C, S);
        ctx.restore();
      } else if (t < B.cut2) setupB(ctx, t, info, B, C, S);
      else setupC(ctx, t, info, B, C, S);
      BEACH.grade(ctx, C, 1);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
