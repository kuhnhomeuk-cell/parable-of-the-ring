// scenes/11-scene-11.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-11';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const TAU = Math.PI * 2;
  const { sstep, clamp01, lerp } = LOOK;
  const SET = () => FILM.sets.corner;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;

  const JH = 330;
  const X_DOOR = 975;
  const T_OUT = 0.32;
  const V = 480;

  function dist(t) {
    const a = 0.3;
    if (t < a) return (V * t * t) / (2 * a) + 70 * t;
    return (V * a) / 2 + 70 * a + (V + 70) * (t - a);
  }

  function pose(t) {
    const d = dist(t);
    const out = sstep(0, T_OUT, t);
    const o = {
      x: X_DOOR - d, y: lerp(848, SET().FEET + 6, out), h: lerp(300, JH, out), t,
      facing: -1, age: 14, outfit: 'school', pose: 'run', poseAmt: 1, walkAmt: 1, lean: -0.6,
      expr: 'teary', exprAmt: 1,
    };
    o.walk = d / FILM.cast.sam.stride(o) + 0.25;
    return o;
  }

  const LINES = [[0.72, 70, 0.0], [0.6, 110, 0.4], [0.5, 80, 0.75], [0.4, 120, 0.2], [0.3, 90, 0.55], [0.2, 70, 0.9]];
  function speedLines(ctx, o, t) {
    const hs = o.h / 330;
    const k = sstep(0.1, 0.3, t);
    ctx.save();
    ctx.lineCap = 'round';
    for (const [fy, len, ph] of LINES) {
      const w = 0.5 + 0.5 * Math.sin(TAU * (t * 3.2 + ph));
      const y = o.y - fy * o.h;
      const x0 = o.x + (fy > 0.35 ? 92 : 64) * hs + 16 * w, x1 = x0 + (len + 70 * w) * hs;
      ctx.strokeStyle = `rgba(31,23,18,${0.75 * k * (0.5 + 0.5 * w)})`;
      ctx.lineWidth = 6.5 * hs;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,250,236,${0.95 * k})`;
      ctx.lineWidth = 3.4 * hs;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function dust(ctx, t) {
    ctx.save();
    for (let i = 0; i < 9; i++) {
      const tk = 0.18 + i * 0.19;
      const age = t - tk;
      if (age < 0 || age > 0.6) continue;
      const P = pose(tk);
      const k = age / 0.6;
      const r = LIB.rng(sd('dust', i));
      for (let j = 0; j < 3; j++) {
        const x = P.x + 30 + r.range(0, 40) + 50 * k, y = P.y - 6 - r.range(0, 14) - 18 * k;
        ctx.fillStyle = `rgba(176,160,138,${0.45 * (1 - k)})`;
        ctx.beginPath();
        ctx.arc(x, y, (8 + 14 * k) * r.range(0.7, 1.2), 0, TAU);
        ctx.fill();
      }
    }
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
      const C = CORNER.statics(S, { time: 'morning', season: 'bare' });
      const cam = (c, depth) => LOOK.camera(c, { t, dur: info.dur, focus: CORNER.FOCUS, push: 0.02, depth });
      const o = pose(t);
      const CUTS = [{ at: 0, z: 1.25, x: () => 540 + 0.45 * (o.x - 540), y: 560, push: 0.03 }];
      ctx.save();
      frame(ctx, t, CUTS);

      CORNER.drawBack(ctx, C, t, info.dur, cam);

      const shut = LIB.ease.outBack(clamp01((t - 0.3) / 0.75));
      const door = clamp01(1 - shut) + 0.04 * Math.sin(clamp01((t - 1.05) / 0.3) * Math.PI);

      ctx.save();
      cam(ctx, CORNER.PAR.near);
      CORNER.drawFront(ctx, C, { door, ringGlow: 0.1 });
      speedLines(ctx, o, t);
      dust(ctx, t);
      LOOK.castShadow(ctx, { x: o.x, y: o.y, h: o.h, k: CORNER.SHADOW_K, S, draw: (g) => FILM.cast.sam(g, o) });
      LOOK.contactShadow(ctx, { x: o.x, y: o.y, h: o.h, dx: 0 });
      const P = FILM.cast.sam.pose(o);
      const hs = o.h / 330;
      CORNER.figure(ctx, S, o, (g) => FILM.cast.sam(g, o), (g) => {
        const fx = P.head[0] - 18 * hs, fy = P.head[1] + 22 * hs;
        const rg = g.createRadialGradient(fx, fy, 0, fx, fy, 58 * hs);
        rg.addColorStop(0, 'rgba(226,64,48,0.5)');
        rg.addColorStop(0.6, 'rgba(226,64,48,0.22)');
        rg.addColorStop(1, 'rgba(226,64,48,0)');
        g.fillStyle = rg;
        g.fillRect(fx - 60 * hs, fy - 60 * hs, 120 * hs, 120 * hs);
      });
      const sw = (t * 2.4) % 1;
      ctx.fillStyle = `rgba(200,232,250,${0.9 * (1 - sw)})`;
      ctx.strokeStyle = `rgba(31,23,18,${0.8 * (1 - sw)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const dx = P.head[0] + (54 + 40 * sw) * hs, dy = P.head[1] - (40 - 30 * sw) * hs;
      ctx.moveTo(dx, dy - 9 * hs);
      ctx.quadraticCurveTo(dx + 6 * hs, dy, dx, dy + 5 * hs);
      ctx.quadraticCurveTo(dx - 6 * hs, dy, dx, dy - 9 * hs);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.save();
      cam(ctx, CORNER.PAR.air);
      CORNER.drawLight(ctx, C, t);
      ctx.restore();

      ctx.save();
      cam(ctx, CORNER.PAR.near);
      const D = CORNER.DIAMOND;
      LOOK.glint(ctx, { x: D[0], y: D[1], size: 9 + 2 * Math.sin(t * 4.2), alpha: 0.5, rot: 0.08 * Math.sin(t * 0.7) });
      LOOK.leaves(ctx, t, CORNER.fallingLeaves('bare'), { wind: 30 });
      ctx.restore();
      ctx.restore();

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
