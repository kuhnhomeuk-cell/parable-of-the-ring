// scenes/06-scene-06.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-06';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const TAU = Math.PI * 2;
  const { sstep, clamp01, lerp } = LOOK;
  const SET = () => FILM.sets.corner;

  const JH = 330;
  const INK = 'rgb(31,23,18)';

  const BEATS = [
    ['summer', 1],
    ['gold', 1.3],
    ['bare', 1.55],
  ];
  const beatStarts = (info) => [0, wordAt(info, 'tokaq', info.dur / 3, 1), wordAt(info, 'tokby', (2 * info.dur) / 3, 2.5)];

  function walkX(b, u) {
    if (b === 0) return 150 + 165 * u;
    if (b === 1) {
      const a = 52;
      return 120 + 172 * u - 0.5 * a * u * u;
    }
    const T = 1.5;
    const k = clamp01(u / T);
    return 120 + 240 * (1 - Math.pow(1 - k, 2));
  }

  function pose(b, u, len) {
    const x = walkX(b, u);
    const o = { x, y: SET().FEET, h: JH, t: u + 2.1 * b, facing: 1, age: 14, outfit: 'school', walkAmt: 1, lean: 0.12, look: 0 };
    o.walk = (x - 120) / FILM.cast.sam.stride(o);
    if (b === 0) {
      o.look = 0.3 * sstep(0.7, 1.0, u) * (1 - sstep(1.7, 2.0, u));
    } else if (b === 1) {
      o.look = 0.32 * sstep(0.4, 0.9, u);
      o.lean = 0.12 + 0.06 * sstep(0.6, 1.6, u);
      o.expr = 'stare';
      o.exprAmt = sstep(0.8, 1.4, u);
    } else {
      o.walkAmt = 1 - sstep(1.2, 1.5, u);
      const lean = LIB.ease.inOutSine(clamp01((u - 1.4) / 0.7));
      o.lean = lerp(0.12, 0.22, lean);
      o.look = 0.32 * lean;
      o.expr = 'stare';
      o.exprAmt = sstep(1.3, 1.8, u);
    }
    return o;
  }

  const PUFFS = [[0, 0, 1], [-0.62, 0.18, 0.62], [0.6, 0.2, 0.66], [-0.3, -0.42, 0.66], [0.32, -0.44, 0.64], [0, 0.42, 0.6], [-0.78, -0.16, 0.5], [0.8, -0.16, 0.5]];
  function bubble(ctx, o, t) {
    const { x, y, r, pop, head } = o;
    if (pop <= 0.001) return;
    const s = LIB.ease.outBack(clamp01(pop));
    const lw = Math.max(2.5, r * 0.06);
    ctx.save();
    const trail = [[0.32, 0.12], [0.62, 0.2]];
    for (const [k, rr] of trail) {
      const px = lerp(head[0], x - r * 0.5, k), py = lerp(head[1], y + r * 0.55, k);
      const pr = r * rr * s;
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(px, py, pr + lw, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgb(252,246,232)';
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, TAU);
      ctx.fill();
    }
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = INK;
    for (const [dx, dy, k] of PUFFS) {
      ctx.beginPath();
      ctx.ellipse(dx * r, dy * r * 0.85, r * 0.62 * k + lw, r * 0.52 * k + lw, 0, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = 'rgb(252,246,232)';
    for (const [dx, dy, k] of PUFFS) {
      ctx.beginPath();
      ctx.ellipse(dx * r, dy * r * 0.85, r * 0.62 * k, r * 0.52 * k, 0, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(214,196,170,0.6)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.15, r * 0.42, r * 0.7, r * 0.2, 0, 0, TAU);
    ctx.fill();
    const gl = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.7);
    gl.addColorStop(0, 'rgba(255,226,160,0.7)');
    gl.addColorStop(1, 'rgba(255,226,160,0)');
    ctx.fillStyle = gl;
    ctx.fillRect(-r, -r, 2 * r, 2 * r);
    FILM.cast.diamondRing(ctx, { x: 0, y: r * 0.18, size: r * 0.66, rot: 0.5 + 0.12 * Math.sin(t * 1.4), tilt: 0.25, t, sparkle: 0.55 + 0.35 * Math.sin(t * 3.1), shadow: 0, lw: 2.5 });
    ctx.restore();
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
      const CORNER = SET();
      const BS = beatStarts(info);
      let b = 0;
      while (b < 2 && t >= BS[b + 1]) b++;
      const t0 = BS[b], len = (b < 2 ? BS[b + 1] : info.dur) - t0;
      const u = Math.min(t - t0, len);
      const Cs = BEATS.map((B) => CORNER.statics(S, { time: 'morning', season: B[0] }));
      const C = Cs[b];
      const cam = (c, depth) => LOOK.camera(c, { t: u, dur: len, focus: CORNER.FOCUS, push: 0.025, depth });
      const o = pose(b, u, len);
      const P = FILM.cast.sam.pose(o);

      const CUTS = BS.map((at, i) => (i === 0
        ? { at, z: 1, x: 540, y: 540, push: 0.02, dx: 3 }
        : { at, z: BEATS[i][1], x: () => P.head[0] + 90, y: () => P.head[1] + (i === 2 ? -15 : 60), push: 0.03 }));
      ctx.save();
      frame(ctx, t, CUTS);

      CORNER.drawBack(ctx, C, u, len, cam);

      ctx.save();
      cam(ctx, CORNER.PAR.near);
      CORNER.drawFront(ctx, C, { ringGlow: 0.12 + 0.1 * sstep(0.4, 0.9, o.look / 0.32) });
      LOOK.castShadow(ctx, { x: o.x, y: o.y, h: JH, k: CORNER.SHADOW_K, S, draw: (g) => FILM.cast.sam(g, o) });
      LOOK.contactShadow(ctx, { x: o.x, y: o.y, h: JH });
      FILM.cast.sam(ctx, o);
      ctx.restore();

      ctx.save();
      cam(ctx, CORNER.PAR.air);
      CORNER.drawLight(ctx, C, t);
      ctx.restore();

      ctx.save();
      cam(ctx, CORNER.PAR.near);
      const lookK = o.look / 0.32;
      const D = CORNER.DIAMOND;
      LOOK.glint(ctx, { x: D[0], y: D[1], size: 9 + 7 * lookK + 2 * Math.sin(t * 4.2), alpha: 0.5 + 0.3 * lookK, rot: 0.08 * Math.sin(t * 0.7) });
      LOOK.leaves(ctx, u, CORNER.fallingLeaves(BEATS[b][0]), { wind: b === 2 ? 24 : 14 });
      const popAt = [wordAt(info, 'tokap', 1.05) - 0.12, wordAt(info, 'tokbw', BS[1] + 0.77) - 0.12, wordAt(info, 'tokca', BS[2] + 0.95, BS[2]) - 0.12][b] - t0;
      const pop = clamp01((u - popAt) / 0.25);
      const r = [56, 64, 78][b];
      bubble(ctx, { x: P.head[0] + 70 + r, y: P.head[1] - 120 - r * 0.6, r, pop, head: [P.head[0] + 34, P.head[1] - 56] }, t);
      ctx.restore();
      ctx.restore();

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
