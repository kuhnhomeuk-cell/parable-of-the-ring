// scenes/42-scene-42.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-42';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;

  const LAYOUT = { mood: 'morning', horizon: 400, shore: 760, wet: 110, dune: true };
  const HZ = LAYOUT.horizon;
  const Y0 = 880;
  const FX = 540;
  const Z0 = 5000;
  const ZSHORE = Z0 * (Y0 - HZ) / (LAYOUT.shore - HZ);
  const FOCUS = [640, 620];
  const PUSH = 0.04;

  const JH = 300;
  const JO = { age: 21, outfit: 'swim' };
  const MH = FILM.cast.sam.height(Object.assign({ h: JH }, JO)) * 0.95;

  const proj = (X, Z) => {
    const p = Z0 / Z;
    return { x: FX + (X - FX) * p, y: HZ + (Y0 - HZ) * p, p };
  };

  function dist(t, v0, t1, v1, t2) {
    if (t <= t1) return v0 * t;
    if (t <= t2) {
      const u = t - t1, d = t2 - t1;
      return v0 * t1 + v0 * u + ((v1 - v0) * u * u) / (2 * d);
    }
    return v0 * t1 + ((v0 + v1) / 2) * (t2 - t1) + v1 * (t - t2);
  }

  const M_START = [273, Z0 / 1.05];
  const M_DIR = (() => { const d = [719, 3303]; const n = Math.hypot(d[0], d[1]); return [d[0] / n, d[1] / n]; })();
  const J_START = [71, Z0 / 1.28];
  const J_DIR = (() => { const d = [389, 1776]; const n = Math.hypot(d[0], d[1]); return [d[0] / n, d[1] / n]; })();

  function lines(info) {
    const s = info.shot, out = [];
    for (const c of s.captions || []) {
      if (!c.words || !c.words.length || c.words[0][0] < s.start - 0.05) continue;
      out.push(c.words.map(([t, w]) => [t - s.start, String(w).toLowerCase().replace(/[^a-z']/g, '')]));
    }
    return out;
  }
  const word = (L, i, tok, d) => {
    for (const w of L[i] || []) if (w[1] === tok) return w[0];
    return d;
  };

  function beats(info) {
    const b = (info.shot && info.shot.beats) || [];
    const L = lines(info);
    return {
      raced: b[0] ? b[0].t : 0.28,
      shout: b[1] ? b[1].t : 3.32,
      ring: word(L, 1, 'tokap', 3.9),
      fine: b[2] ? b[2].t : 6.26,
      fineW: word(L, 2, 'tokkc', 7.11),
    };
  }

  function avaAt(t) {
    const s = dist(t, 400, 5.6, 140, 7.2);
    const X = M_START[0] + M_DIR[0] * s, Z = M_START[1] + M_DIR[1] * s;
    const P = proj(X, Z);
    const h = MH * P.p;
    const deep = clamp01((Z - ZSHORE) / 1400) * 0.3;
    return { s, X, Z, x: P.x, y: P.y, h, p: P.p, deep };
  }
  function samAt(t, B) {
    const s = dist(t, 250, B.shout - 0.3, 150, B.shout + 0.7);
    const X = J_START[0] + J_DIR[0] * s, Z = J_START[1] + J_DIR[1] * s;
    const P = proj(X, Z);
    return { s, X, Z, x: P.x, y: P.y, h: JH * P.p, p: P.p };
  }

  function footprints(ctx, start, dir, s, stepW, side, hRef) {
    const n = Math.floor(s / stepW);
    ctx.save();
    for (let i = Math.max(0, n - 18); i < n; i++) {
      const si = (i + 0.5) * stepW;
      const off = (i % 2 ? 1 : -1) * side;
      const X = start[0] + dir[0] * si + dir[1] * off, Z = start[1] + dir[1] * si - dir[0] * off;
      if (Z > ZSHORE - 60) continue;
      const P = proj(X, Z);
      if (P.y > 1100) continue;
      const w = 0.05 * hRef * P.p, hh = 0.016 * hRef * P.p;
      const age = clamp01((n - i) / 18);
      ctx.fillStyle = `rgba(150,112,72,${0.3 * (1 - 0.5 * age)})`;
      ctx.beginPath();
      ctx.ellipse(P.x, P.y, w, hh, -0.15, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(255,246,226,${0.25 * (1 - 0.5 * age)})`;
      ctx.beginPath();
      ctx.ellipse(P.x + w * 0.2, P.y + hh * 0.5, w * 0.8, hh * 0.45, -0.15, 0, Math.PI);
      ctx.fill();
    }
    ctx.restore();
  }

  function kick(ctx, m, t) {
    if (m.deep <= 0.005) return;
    const a = sstep(0, 0.06, m.deep);
    ctx.save();
    for (let k = 0; k < 12; k++) {
      const u = (t * 2.2 + k * 0.083) % 1;
      const sx = (k % 2 ? 1 : -1) * (6 + 4 * (k % 3));
      const x = m.x + sx * m.p * (1 + 2 * u);
      const wl = m.y - m.deep * m.h;
      const y = wl - (60 * u - 70 * u * u) * m.p * 1.4;
      ctx.globalAlpha = 0.8 * a * (1 - u);
      ctx.fillStyle = k % 2 ? 'rgb(244,252,252)' : 'rgb(206,240,236)';
      ctx.beginPath();
      ctx.arc(x, y, (2.6 - 1.2 * u) * Math.max(0.6, m.p), 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const BEACH = FILM.sets.beach;
      const C = BEACH.statics(S, LAYOUT);
      const B = beats(info);
      const m = avaAt(t);
      const j = samAt(t, B);
      const setup = t < B.shout ? 0 : t < B.fine ? 1 : 2;
      const h0 = [0, B.shout, B.fine][setup], h1 = [B.shout, B.fine, info.dur][setup];
      const pz = [1, 1.6, 2][setup];
      const pf = setup === 1 ? [j.x, j.y - 0.6 * j.h * 1.12] : setup === 2 ? [m.x, m.y - 0.55 * m.h] : null;
      const pa = setup === 1 ? [430, 520] : [470, 500];
      const cam = (g, d) => {
        if (pf) {
          g.translate(pa[0], pa[1]);
          g.scale(pz, pz);
          g.translate(-pf[0], -pf[1]);
        }
        LOOK.camera(g, { t: t - h0, dur: h1 - h0, focus: pf ? pf : FOCUS, push: pf ? 0.04 : PUSH, depth: d });
      };

      BEACH.back(ctx, C, t, cam);
      const K = C.m.shadowK;

      const wave = sstep(B.fine - 0.2, B.fine + 0.2, t) * (1 - sstep(B.fine + 1.8, B.fine + 2.6, t));
      const mo = {
        x: m.x, y: m.y, h: m.h, t, facing: 1, outfit: 'beach', pose: 'runAwayWave',
        walk: m.s / (2 * FILM.cast.ava.RUN_STEP * MH),
        expr: { laugh: 0.75 + 0.25 * wave, smileSoft: 0.25 - 0.25 * wave }, breeze: 0.6, light: C.m.light,
      };
      const cup = sstep(B.shout - 0.4, B.shout - 0.05, t) * (1 - sstep(B.fine - 0.5, B.fine - 0.1, t));
      const jo = Object.assign({ x: j.x, y: j.y, h: j.h, t, facing: 1, pose: 'callOut', cup: 0 }, JO);
      jo.walk = j.s / FILM.cast.sam.stride(Object.assign({}, jo, { h: JH }));
      if (cup < 0.05) Object.assign(jo, t < B.shout ? { expr: 'happy' } : { expr: 'smileSmall', exprAmt: 0.7 });

      ctx.save();
      cam(ctx, 1);
      footprints(ctx, M_START, M_DIR, m.s, FILM.cast.ava.RUN_STEP * MH, 9, MH);
      footprints(ctx, J_START, J_DIR, j.s, FILM.cast.sam.stride(Object.assign({}, jo, { h: JH })) / 2, 11, JH * 1.12);

      const mDry = m.deep <= 0.001;
      if (mDry) LOOK.castShadow(ctx, { x: m.x, y: m.y, h: m.h, k: K, S, alpha: C.m.shadowA, draw: (g) => FILM.cast.ava(g, mo) });
      const wl = m.y - m.deep * m.h;
      BEACH.clipAbove(ctx, mDry ? 2000 : wl + 1, () => FILM.cast.ava(ctx, mo));
      if (!mDry) BEACH.wade(ctx, C, { x: m.x, y: wl, w: 0.2 * m.h, t, alpha: sstep(0, 0.05, m.deep) });
      kick(ctx, m, t);

      const MP = FILM.cast.ava.pose(mo);
      const rp = MP.rings[0];
      const ha = MP.handAngles[0];
      const rs = Math.max(6, 0.042 * m.h);
      const R = FILM.cast.diamondRing(ctx, { x: rp[0], y: rp[1], size: rs, rot: 0.5, spin: ha + Math.PI / 2, t, sparkle: 0, shadow: 0, lw: Math.max(1.2, rs * 0.12) });
      const gRing = Math.exp(-Math.pow((t - B.ring) / 0.35, 2));
      const gFine = Math.exp(-Math.pow((t - B.fineW) / 0.45, 2));
      const tw = 0.5 + 0.5 * Math.sin(t * 7.3);
      const gs = 9 + 6 * tw + 18 * Math.max(gRing, gFine);
      LOOK.glint(ctx, { x: R.glint[0], y: R.glint[1], size: Math.min(36, gs), alpha: 0.55 + 0.35 * Math.max(gRing, gFine), rot: 0.1 * Math.sin(t * 0.8) });
      if (gRing > 0.05 || gFine > 0.05) LOOK.bloom(ctx, { x: R.glint[0], y: R.glint[1], r: 40 + 30 * Math.max(gRing, gFine), alpha: 0.45 * Math.max(gRing, gFine) });

      if (setup < 2) {
        LOOK.castShadow(ctx, { x: j.x, y: j.y, h: j.h * 1.12, k: K, S, alpha: C.m.shadowA, draw: (g) => FILM.cast.sam(g, jo) });
        FILM.cast.sam(ctx, jo);
      }
      ctx.restore();

      BEACH.air(ctx, C, t, cam);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
