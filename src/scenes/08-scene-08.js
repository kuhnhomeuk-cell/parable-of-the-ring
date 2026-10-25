// scenes/08-scene-08.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-08';
  const LIB = FILM.lib, LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const W = 1080, H = 1080;

  const beatsOf = (info) => {
    const b = info.shot.beats;
    const diamond = wordAt(info, 'tokcp', b[0].t + 1.76, b[0].t);
    return {
      cut: wordAt(info, 'tokco', b[0].t + 1.23, b[0].t),
      diamond,
      her: b[1].t,
      C0: Math.min(diamond + 0.45, b[1].t - 0.3),
      C1: info.dur - 0.04,
    };
  };

  const ECU = { x: 560, y: 1150, size: 1000, rot: 0.48, tilt: 0.1 };
  let STONE = null;
  function stone() {
    if (!STONE) {
      const g = FILM.makeCanvas(2, 2).getContext('2d');
      const out = FILM.cast.diamondRing(g, Object.assign({ t: 0, shadow: 0 }, ECU));
      STONE = out ? { p: out.diamond.slice(), r: out.r || ECU.size * 0.2 } : { p: [ECU.x, ECU.y - 0.62 * ECU.size], r: ECU.size * 0.2 };
    }
    return STONE;
  }

  function wordAt(info, token, fb, from) {
    const st = info.shot.start || 0, lo = from == null ? -0.05 : from;
    const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    const want = norm(token);
    for (const c of info.shot.captions || []) {
      for (const w of c.words || []) if (w[0] - st >= lo && norm(w[1]) === want) return w[0] - st;
    }
    return fb;
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const ST = FILM.sets.store;
      const B = beatsOf(info);
      const SM = FILM.cast.salesman, J = FILM.cast.sam;
      const fadeB = t >= B.cut ? 1 : 0;
      const fadeC = sstep(B.C0, B.C0 + 0.3, t);

      if (fadeB < 1) {
        const C = ST.statics(S, { angle: 'low', tod: 'day' });
        const V = C.V;
        const so = { x: V.staffX[0], y: V.floor, h: V.JH * SM.HK, t, facing: -1, pose: 'holdUp', expr: 'scowl', counterY: V.counterY, light: V.light };
        const q = SM.pose(so);
        const ring = q.ring;
        const zA = 1 + 0.22 * LIB.ease.inSine(t / B.cut);
        const cam = (depth) => {
          const z = 1 + (zA - 1) * depth;
          ctx.translate(ring[0], ring[1]);
          ctx.scale(z, z);
          ctx.translate(-ring[0], -ring[1]);
        };
        ctx.save();
        cam(ST.PAR.back);
        ST.drawBack(ctx, C, { t });
        ctx.restore();
        ctx.save();
        cam(0.92);
        SM(ctx, so);
        ST.drawCounter(ctx, C, { t });
        const lw = 2.2;
        const rg = FILM.cast.diamondRing(ctx, { x: ring[0], y: ring[1] + 6, size: 58, rot: 0.6 + 0.2 * Math.sin(t * 0.8), tilt: -0.1, t, light: -1.3, sparkle: 0.35 + 0.15 * Math.sin(t * 3), shadow: 0, lw });
        if (rg && rg.glint) LOOK.bloom(ctx, { x: rg.glint[0], y: rg.glint[1], r: 70, alpha: 0.35, mid: 0.14 });
        ctx.restore();
        ctx.save();
        cam(1);
        const jo = { x: V.custX, y: V.custFloor, h: V.custH, t, facing: 1, age: 14, outfit: 'school', look: 0.95, expr: 'stare', exprAmt: sstep(0.3, 1, t) };
        LOOK.contactShadow(ctx, { x: jo.x, y: jo.y, h: jo.h, alpha: 0.3 });
        J(ctx, jo);
        ctx.restore();
        ctx.save();
        cam(ST.PAR.air);
        ST.drawLight(ctx, C, { t });
        ctx.restore();
      }

      const st = stone();
      const zoom = LIB.ease.inOutSine((t - B.C0) / (B.C1 - B.C0));
      const punch = t >= B.diamond ? 1.35 : 1;
      const zB = (1 + 0.34 * LIB.ease.inQuad((t - B.cut) / (B.C0 - B.cut))) * punch * Math.pow(64, zoom);
      if (fadeB > 0 && zoom < 0.55) {
        ctx.save();
        ctx.globalAlpha = fadeB;
        ctx.save();
        const zb = Math.min(3, 1 + (zB - 1) * 0.4);
        ctx.translate(540, 520);
        ctx.scale(zb, zb);
        ctx.translate(-540 - 10 * t, -520);
        ctx.drawImage(ST.bokeh(S, { tod: 'day', seed: 7 }), -20, 0, W + 40, H);
        ctx.restore();
        ST.lampCone(ctx, { x: 360, y: -60, len: 900, spread: 0.42, alpha: 0.18 });
        ctx.save();
        ctx.translate(st.p[0], st.p[1]);
        ctx.scale(zB, zB);
        ctx.translate(-st.p[0], -st.p[1]);
        const env = LOOK.flashEnv(t, B.diamond, { rise: 3, fall: 18 });
        const after = t >= B.diamond ? Math.exp(-(t - B.diamond) / 0.6) : 0;
        const rg = FILM.cast.diamondRing(ctx, Object.assign({ t, shadow: 0, light: lerp(-1.6, -1.15, sstep(0, 3, t)), sparkle: 0.3 + 0.6 * env + 0.2 * after, env: '#5A3424' }, ECU));
        const gp = rg && rg.glint ? rg.glint : st.p;
        LOOK.bloom(ctx, { x: gp[0], y: gp[1], r: 220, alpha: 0.18 + 0.4 * env + 0.15 * after, mid: 0.1 + 0.2 * env });
        LOOK.glint(ctx, { x: gp[0], y: gp[1], size: 26 + 34 * env + 8 * after, alpha: 0.3 + 0.7 * env + 0.3 * after, rot: 0.05 + 0.1 * t });
        ctx.restore();
        ctx.restore();
      }

      if (fadeC > 0) {
        const size = st.r * 2.1 * (zB / Math.pow(64, zoom));
        ctx.save();
        ctx.globalAlpha = fadeC;
        FILM.cast.diamondFacets(ctx, { x: st.p[0], y: st.p[1], size, t, zoom });
        ctx.restore();
        const fl = Math.sin(Math.PI * fadeC);
        if (fl > 0.01) LOOK.bloom(ctx, { x: st.p[0], y: st.p[1], r: size * 0.9, alpha: 0.55 * fl, mid: 0.3 * fl });
        LOOK.exposure(ctx, 0.5 * sstep(B.her - 0.6, B.C1, t), { strength: 0.35, color: [236, 244, 255] });
      }

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
