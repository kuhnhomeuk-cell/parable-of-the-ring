// scenes/49-scene-49.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-49';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;

  const LAY = { mood: 'loss', horizon: 330, shore: 530, wet: 170 };
  const JO = { age: 21, outfit: 'swim' };
  const JH = 800;
  const JR = FILM.cast.sam.height(Object.assign({ h: JH }, JO));
  const MH = JR * 0.95;
  const GROUND = 1060;
  const JX = 720;
  const MX = 310;

  const B_Z = 1.45;
  const B_AT = [650, 400];

  function beatT(info, frag, dflt) {
    const b = ((info.shot && info.shot.beats) || []).find((x) => String(x.text).indexOf(frag) >= 0);
    return b ? b.t : dflt;
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
    const b0 = beatT(info, 'toklp tokae', 0.60);
    const b1 = beatT(info, 'toklq', 3.91);
    return { take: b0 - 0.4, line: b0, cut: b1 - 0.15, symbol: b1, love: wordT(info, 'tokjq', 5.71, b1) };
  }

  function figures(t, B, C) {
    const take = LIB.ease.inOutSine(clamp01((t - B.take) / 0.8));
    const settle = sstep(B.line, B.line + 1.2, t);
    const jo = Object.assign({
      x: JX, y: GROUND, h: JH, t, facing: -1, pose: 'kneelOffer', poseAmt: 1,
      lean: 0.32 * take, look: 0.04 - 0.02 * settle,
      expr: { teary: lerp(0.75, 0.45, settle) + 0.05 * sstep(B.symbol, B.love, t), smileSmall: lerp(0.25, 0.55, settle) - 0.05 * sstep(B.symbol, B.love, t) },
      blinkOffset: 0.9,
    }, JO);
    const JP = FILM.cast.sam.pose(jo);
    const mid = [(JP.hands[0][0] + JP.hands[1][0]) / 2, (JP.hands[0][1] + JP.hands[1][1]) / 2];
    const rest = [MX + 0.1 * MH, GROUND - 0.24 * MH];
    const target = { x: lerp(rest[0], mid[0] + 2, take), y: lerp(rest[1], mid[1] + 6, take) };
    const love = sstep(B.symbol + 0.3, B.love + 0.8, t);
    const mo = {
      x: MX, y: GROUND, h: MH, t, facing: 1, outfit: 'beach', swim: true, light: C.m.light, breeze: 0.4,
      pose: 'kneelHold', target, look: 0.1 + 0.04 * settle,
      expr: { tearful: lerp(0.6, 0.45, love), wonder: lerp(0.3, 0.15, love), loving: lerp(0.1, 0.4, love) },
    };
    return { jo, mo, JP };
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const BEACH = FILM.sets.beach;
      const C = BEACH.statics(S, LAY);
      const BD = BEACH.backdrop(S, C, { blur: 7 });
      const B = beats(info);
      const inB = t >= B.cut;
      const t0 = inB ? B.cut : 0, dur = inB ? info.dur - B.cut : B.cut;
      const cam = (g, d) => LOOK.camera(g, { t: t - t0, dur, focus: inB ? B_AT : [700, 470], push: inB ? 0.07 : 0.14, depth: d });

      ctx.save();
      cam(ctx, 0.3);
      if (inB) {
        ctx.translate(540, 400);
        ctx.scale(1.2, 1.2);
        ctx.translate(-540, -400);
      }
      ctx.drawImage(BD, 0, 0, 1080, 1080);
      ctx.restore();

      const { jo, mo, JP } = figures(t, B, C);
      ctx.save();
      cam(ctx, 1);
      if (inB) {
        ctx.translate(B_AT[0], B_AT[1]);
        ctx.scale(B_Z, B_Z);
        ctx.translate(-JP.head[0], -JP.head[1]);
      }
      FILM.cast.ava(ctx, mo);
      FILM.cast.sam(ctx, jo);
      ctx.restore();

      BEACH.air(ctx, C, t, cam, 0.6);
      BEACH.grade(ctx, C, 1);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
