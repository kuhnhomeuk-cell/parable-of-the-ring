// scenes/53-scene-53.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-53';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const { sstep, clamp01 } = LOOK;

  const LAY = { mood: 'sunrise', horizon: 520, shore: 760 };
  const JO = { age: 21, outfit: 'swim' };
  const JH = 128;
  const JR = FILM.cast.sam.height(Object.assign({ h: JH }, JO));
  const MH = JR * 0.95;
  const GROUND = 806;
  const JX = 600, MX = 566;
  const FOCUS = [584, 700];
  const PULL = 0.08;
  const CARD0 = 0.6, CARD1 = 2.1;

  function card(ctx, a) {
    if (a <= 0.001) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.save();
    ctx.translate(540, 272);
    ctx.scale(1, 0.32);
    const sc = ctx.createRadialGradient(0, 0, 0, 0, 0, 470);
    sc.addColorStop(0, 'rgba(92,58,34,0.34)');
    sc.addColorStop(0.6, 'rgba(92,58,34,0.16)');
    sc.addColorStop(1, 'rgba(92,58,34,0)');
    ctx.fillStyle = sc;
    ctx.fillRect(-470, -470, 940, 940);
    ctx.restore();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f7f1e3';
    ctx.shadowColor = 'rgba(52,28,10,0.8)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 3;
    ctx.font = "64px Georgia, 'Times New Roman', serif";
    ctx.fillText('The Parable of the Ring', 540, 250);
    ctx.font = "italic 32px Georgia, 'Times New Roman', serif";
    ctx.fillText('End card credit placeholder', 540, 312);
    ctx.shadowBlur = 6;
    ctx.fillRect(470, 274, 140, 1.5);
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const BEACH = FILM.sets.beach;
      const C = BEACH.statics(S, LAY);
      const e = LIB.ease.inOutSine(t / info.dur);
      const cam = (g, d) => {
        const z = 1 + PULL * d * (1 - e);
        g.translate(FOCUS[0], FOCUS[1]);
        g.scale(z, z);
        g.translate(-FOCUS[0], -FOCUS[1]);
      };
      BEACH.back(ctx, C, t, cam);

      const sway = 0.5 + 0.5 * Math.sin(t * 0.9);
      const jo = Object.assign({ x: JX, y: GROUND, h: JH, t, facing: -1, pose: 'hug', poseAmt: 0.8, lean: 0.2 + 0.1 * sway }, JO);
      const JP = FILM.cast.sam.pose(jo);
      const mo = { x: MX, y: GROUND, h: MH, t, facing: 1, outfit: 'beach', swim: true, light: C.m.light, breeze: 0.5,
        pose: 'hug', target: { x: JP.head[0] + 0.04 * JR, y: JP.head[1] + 0.3 * JR }, expr: 'loving', look: 0.15 };
      ctx.save();
      cam(ctx, 1);
      LOOK.castShadow(ctx, { x: (JX + MX) / 2, y: GROUND, h: JR, k: C.m.shadowK, S, alpha: C.m.shadowA,
        draw: (g) => { FILM.cast.sam(g, Object.assign({ layer: 'back' }, jo)); FILM.cast.ava(g, mo); FILM.cast.sam(g, Object.assign({ layer: 'front' }, jo)); } });
      LOOK.contactShadow(ctx, { x: (JX + MX) / 2, y: GROUND, h: JR, rx: 60, alpha: C.m.contactA });
      FILM.cast.sam(ctx, Object.assign({ layer: 'back' }, jo));
      FILM.cast.ava(ctx, mo);
      FILM.cast.sam(ctx, Object.assign({ layer: 'front' }, jo));
      ctx.restore();

      BEACH.air(ctx, C, t, cam);
      BEACH.grade(ctx, C, 1);
      LOOK.grain(ctx, info);
      card(ctx, LIB.ease.inOutSine(clamp01((t - CARD0) / (CARD1 - CARD0))));
      FILM.cast.caption(ctx, info);
    },
  });
})();
