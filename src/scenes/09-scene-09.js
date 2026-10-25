// scenes/09-scene-09.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-09';
  const LIB = FILM.lib, LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;

  const FOCUS = [540, 420];
  const PUSH = 0.04;
  const AVA_ALPHA = 0.88;

  function wordAt(info, token, fb, from) {
    const st = info.shot.start || 0, lo = from == null ? -0.05 : from;
    const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    const want = norm(token);
    for (const c of info.shot.captions || []) {
      for (const w of c.words || []) if (w[0] - st >= lo && norm(w[1]) === want) return w[0] - st;
    }
    return fb;
  }

  function setupAt(cuts, t) {
    let i = 0;
    while (i + 1 < cuts.length && t >= cuts[i + 1].at) i++;
    return i;
  }

  function frame(ctx, t, cuts) {
    const i = setupAt(cuts, t), c = cuts[i], u = t - c.at;
    const z = c.z * (1 + (c.push == null ? 0.02 : c.push) * u);
    const hw = 540 / Math.max(1, z);
    const cx = (typeof c.x === 'function' ? c.x(t) : c.x) + (c.dx || 0) * u;
    const cy = (typeof c.y === 'function' ? c.y(t) : c.y) + (c.dy || 0) * u;
    const x = Math.min(1080 - hw, Math.max(hw, cx)), y = Math.min(1080 - hw, Math.max(hw, cy));
    ctx.translate(540, 540);
    ctx.scale(z, z);
    ctx.translate(-x, -y);
    return i;
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const D = FILM.sets.dream;
      const dur = info.dur;
      const beat = (info.shot.beats && info.shot.beats[0] && info.shot.beats[0].t) || 0.35;
      const B_GREEN = Math.min(dur - 1.2, wordAt(info, 'tokcv', beat + 1.82));
      const cam = (c, depth) => LOOK.camera(c, { t, dur, focus: FOCUS, push: PUSH, depth });

      const form = sstep(0.15, 1.5, t);

      const near = LIB.ease.inOutSine(clamp01((t - B_GREEN + 0.5) / (dur - B_GREEN + 0.3)));
      const h = lerp(600, 940, near);
      const settle = sstep(B_GREEN - 0.1, B_GREEN + 0.7, t);
      const tm = t < B_GREEN ? 4 + 2.5 * (t - B_GREEN) : 4 + (t - B_GREEN);
      const o = {
        x: lerp(560, 540, near),
        y: lerp(900, 1190, near),
        h,
        t: tm,
        facing: 1,
        outfit: 'vision',
        pose: settle <= 0 ? 'dance' : settle >= 1 ? 'float' : { dance: 1 - settle, float: settle },
        expr: { smileSoft: 1 - settle, loving: settle },
        breeze: 0.85,
        wind: 1,
        alpha: AVA_ALPHA * sstep(0.25, 1.2, t),
        lift: 26 + 12 * settle,
      };
      if (t >= B_GREEN) o.front = 1;
      if (settle > 0) o.look = 0.05 * settle;
      const P = FILM.cast.ava.pose(o);

      const CUTS = [
        { at: 0, z: 1, x: 540, y: 540, push: 0.025 },
        { at: B_GREEN, z: 2.1, x: () => P.head[0], y: () => P.head[1] + 30, push: 0.04 },
        { at: wordAt(info, 'tokam', B_GREEN + 1.55, B_GREEN), z: 1.3, x: () => P.head[0] + 20, y: () => P.head[1] + 175, push: 0.03, dy: -4 },
      ];
      ctx.save();
      frame(ctx, t, CUTS);
      D.back(ctx, t, { S, cam, form });

      ctx.save();
      cam(ctx, 1);
      const glow = 0.25 + 0.35 * sstep(B_GREEN - 0.4, B_GREEN + 0.3, t);
      LOOK.bloom(ctx, { x: P.head[0], y: P.head[1] + 40, r: h * 0.75, alpha: glow * o.alpha, mid: 0.18 * o.alpha });
      FILM.cast.ava(ctx, o);
      const catchK = Math.max(0, 1 - Math.abs(t - (B_GREEN + 0.15)) / 0.45);
      if (catchK > 0) {
        for (const e of P.eyes) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const g = ctx.createRadialGradient(e[0], e[1], 0, e[0], e[1], h * 0.05);
          g.addColorStop(0, `rgba(190,255,220,${0.45 * catchK})`);
          g.addColorStop(1, 'rgba(190,255,220,0)');
          ctx.fillStyle = g;
          ctx.fillRect(e[0] - h * 0.05, e[1] - h * 0.05, h * 0.1, h * 0.1);
          ctx.restore();
        }
      }
      ctx.restore();

      D.front(ctx, t, { S, cam, form });
      ctx.restore();

      const field = 1 - sstep(0, 1.1, t);
      if (field > 0) FILM.cast.diamondFacets(ctx, { x: 540, y: 540, size: 600, t, zoom: 1, alpha: field });

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
