// scenes/13-scene-13.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9$]/g, '');
  function wordT(info, w, n, fb) {
    const sh = info.shot, key = norm(w);
    let k = 0;
    for (const c of sh.captions || []) {
      for (const [ft, tok] of c.words || []) {
        const lt = ft - sh.start;
        if (lt < -0.05 || norm(tok) !== key) continue;
        if (k++ === (n || 0)) return lt;
      }
    }
    return fb;
  }
  function setupAt(list, t, dur) {
    let i = 0;
    while (i + 1 < list.length && t >= list[i + 1].at) i++;
    const s = list[i];
    const t1 = i + 1 < list.length ? list[i + 1].at : dur;
    return Object.assign({ i, t0: s.at, u: Math.max(0, Math.min(1, (t - s.at) / Math.max(0.4, t1 - s.at))) }, s);
  }
  function frame(g, V, depth) {
    const d = depth == null ? 1 : depth;
    const z = V.z || 1, hz = 540 / z;
    const cx = Math.max(hz, Math.min(1080 - hz, V.c[0])), cy = Math.max(hz, Math.min(1080 - hz, V.c[1]));
    const push = Math.max(0, V.push == null ? 0.04 : V.push);
    const lim = 540 * push;
    const pan = V.pan || [0, 0];
    const k = d * V.u;
    const p = 1 + push * k;
    g.translate(540 + Math.max(-lim, Math.min(lim, pan[0])) * k, 540 + Math.max(-lim, Math.min(lim, pan[1])) * k);
    g.scale(z * p, z * p);
    g.translate(-cx, -cy);
  }

  const ID = 'scene-13';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const TAU = Math.PI * 2;
  const { sstep, clamp01, lerp } = LOOK;
  const SET = () => FILM.sets.corner;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;

  const JH = 330;
  const X = 916;
  const DOORLIGHT = [990, 720];

  function doorOpen(t, tf) {
    const jig = 0.025 * Math.max(0, Math.sin(TAU * 2.6 * t)) * (1 - sstep(tf - 0.1, tf, t));
    return jig + 0.86 * LIB.ease.outBack(clamp01((t - tf) / 0.55));
  }

  function pose(t, tf) {
    const surge = sstep(tf - 0.2, tf + 0.1, t) * (1 - sstep(tf + 0.4, tf + 1.0, t));
    const shiver = 1.6 * Math.sin(t * 57) + 0.8 * Math.sin(t * 31 + 1);
    return {
      x: X + shiver * (1 - 0.6 * sstep(tf + 0.6, tf + 1.4, t)) + 10 * surge, y: SET().FEET + 2, h: JH, t,
      facing: 1, age: 14, outfit: 'school', pose: 'hug', poseAmt: 1,
      lean: 0.45 + 0.35 * surge - 0.25 * sstep(tf + 0.6, tf + 1.4, t),
      expr: t < tf + 0.5 ? 'squint' : 'wide', exprAmt: t < tf + 0.5 ? 1 : sstep(tf + 0.5, tf + 0.9, t),
      look: 0.1,
    };
  }

  const DRIPS = [
    ['head', -46, 34, 0.55, 0.0], ['head', 40, 46, 0.62, 0.3], ['head', -10, 58, 0.5, 0.6], ['head', 58, 8, 0.7, 0.15],
    ['near', 0, 8, 0.45, 0.4], ['far', 0, 8, 0.52, 0.8], ['feet', -30, -150, 0.6, 0.2], ['feet', 26, -146, 0.66, 0.7],
  ];
  function drips(ctx, P, o, t) {
    const hs = o.h / 330;
    ctx.save();
    ctx.lineWidth = 1.4;
    for (const [where, dx, dy, per, ph] of DRIPS) {
      const base = where === 'head' ? P.head : where === 'near' ? P.hands[0] : where === 'far' ? P.hands[1] : [o.x, o.y];
      const u = ((t / per + ph) % 1 + 1) % 1;
      const x = base[0] + dx * hs, y = base[1] + dy * hs + 70 * u * u;
      const a = u < 0.15 ? u / 0.15 : 1 - sstep(0.7, 1, u);
      ctx.fillStyle = `rgba(206,222,246,${0.9 * a})`;
      ctx.strokeStyle = `rgba(31,23,18,${0.5 * a})`;
      ctx.beginPath();
      ctx.moveTo(x, y - 6 * hs);
      ctx.quadraticCurveTo(x + 3.5 * hs, y + 1, x, y + 3.5 * hs);
      ctx.quadraticCurveTo(x - 3.5 * hs, y + 1, x, y - 6 * hs);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function rain(ctx, t, o) {
    ctx.save();
    ctx.beginPath();
    LOOK.particles(ctx, t, {
      seed: sd('rain', o.n), count: o.count, area: o.area, vel: o.vel, spread: 0.25, sway: 24, swayHz: 0.3, size: o.len,
      draw: (g, p) => {
        g.moveTo(p.x, p.y);
        g.lineTo(p.x + (o.vel[0] / o.vel[1]) * p.size, p.y + p.size);
      },
    });
    ctx.strokeStyle = o.color;
    ctx.lineWidth = o.width;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }

  const SPLASH = [];
  {
    const r = LIB.rng(sd('splash'));
    for (let i = 0; i < 46; i++) SPLASH.push([r.range(-20, 1100), r.range(852, 1070), r.range(0.35, 0.6), r()]);
  }
  function splashes(ctx, t) {
    ctx.save();
    ctx.lineWidth = 1.2;
    for (const [x, y, per, ph] of SPLASH) {
      const u = ((t / per + ph) % 1 + 1) % 1;
      const warm = clamp01(1 - Math.abs(x - 980) / 260);
      ctx.strokeStyle = warm > 0.3 ? `rgba(255,214,160,${0.5 * (1 - u)})` : `rgba(200,212,240,${0.45 * (1 - u)})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 2 + 9 * u, (2 + 9 * u) * 0.3, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const CORNER = SET();
      const C = CORNER.statics(S, { time: 'dusk', season: 'winter' });
      const tOne = wordT(info, 'tokas', 0, 0.49 * info.dur);
      const tf = wordT(info, 'tokdq', 0, 0.55 * info.dur) + 0.12;
      const V = setupAt([
        { at: 0, z: 1, c: [540, 540], push: 0.045, pan: [-14, 4] },
        { at: tOne, z: 1.9, c: [880, 690], push: 0.07, pan: [-20, -10] },
      ], t, info.dur);
      const cam = (c, depth) => frame(c, V, depth);
      const open = doorOpen(t, tf);
      const spill = clamp01(open / 0.86);

      if (V.z < 1.5) CORNER.drawBack(ctx, C, t, info.dur, cam);

      const o = pose(t, tf);
      const P = FILM.cast.sam.pose(o);
      ctx.save();
      cam(ctx, CORNER.PAR.near);
      CORNER.drawFront(ctx, C, { door: open, ringGlow: 0.25 });
      if (spill > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const sg = ctx.createLinearGradient(0, 842, 0, 1060);
        sg.addColorStop(0, `rgba(255,196,124,${0.62 * spill})`);
        sg.addColorStop(1, 'rgba(255,196,124,0)');
        ctx.fillStyle = sg;
        const ex = CORNER.DOOR.x0 + (CORNER.DOOR.x1 - CORNER.DOOR.x0) * Math.cos(open * 1.3);
        LOOK.poly(ctx, [[ex, 842], [1012, 842], [1180, 1060], [ex - 170, 1060]]);
        ctx.fill();
        ctx.restore();
      }
      LOOK.castShadow(ctx, { x: o.x, y: o.y, h: JH, k: [1.1, -0.12], S, alpha: 0.4 * spill, color: 'rgb(20,18,34)', draw: (g) => FILM.cast.sam(g, o) });
      LOOK.contactShadow(ctx, { x: o.x, y: o.y, h: JH, alpha: 0.45, color: [20, 18, 34] });
      CORNER.figure(ctx, S * Math.min(V.z, 1.4), o, (g) => FILM.cast.sam(g, o), {
        mul: 'rgb(104,112,150)',
        add: (g) => {
          const L = DOORLIGHT;
          const rg = g.createRadialGradient(L[0] + 30, L[1], 0, L[0] + 30, L[1], 260);
          rg.addColorStop(0, `rgba(150,92,40,${0.12 + 0.45 * spill})`);
          rg.addColorStop(0.5, `rgba(120,70,30,${0.05 + 0.2 * spill})`);
          rg.addColorStop(1, 'rgba(120,70,30,0)');
          g.fillStyle = rg;
          g.fillRect(o.x - 400, o.y - 700, 800, 760);
        },
      });
      drips(ctx, P, o, t);
      ctx.restore();

      ctx.save();
      cam(ctx, CORNER.PAR.air);
      CORNER.drawLight(ctx, C, t);
      ctx.restore();

      ctx.save();
      cam(ctx, CORNER.PAR.near);
      if (spill > 0.01) LOOK.bloom(ctx, { x: DOORLIGHT[0], y: DOORLIGHT[1] - 30, r: 210, alpha: 0.42 * spill, mid: 0.16 * spill });
      const D = CORNER.DIAMOND;
      LOOK.glint(ctx, { x: D[0], y: D[1], size: 8 + 2 * Math.sin(t * 3.7), alpha: 0.55, rot: 0.08 * Math.sin(t * 0.7) });
      splashes(ctx, t);
      rain(ctx, t, { n: 0, count: 230, area: [-120, -80, 1340, 1200], vel: [-300, 1250], len: [22, 38], width: 1.1, color: 'rgba(188,200,232,0.38)' });
      rain(ctx, t, { n: 1, count: 60, area: [-120, -80, 1340, 1200], vel: [-380, 1500], len: [50, 76], width: 1.8, color: 'rgba(206,216,244,0.42)' });
      if (spill > 0.01) rain(ctx, t, { n: 2, count: 60, area: [800, 460, 320, 620], vel: [-300, 1250], len: [24, 40], width: 1.3, color: `rgba(255,214,160,${0.55 * spill})` });
      ctx.restore();

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
