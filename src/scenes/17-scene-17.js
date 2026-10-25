// scenes/17-scene-17.js: procedural scene. Shot timing comes from src/timeline.js.
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

  const ID = 'scene-17';
  const LIB = FILM.lib, LOOK = FILM.look;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { sstep, lerp } = LOOK;
  const W = 1080, H = 1080;

  const FRAME = { z: 1, c: [540, 540] };
  const FOCUS = [520, 640];
  const PUSH = 0.04;
  const PAR = { far: 0.25, mid: 0.55, near: 1, air: 0.7 };

  const JX = 528, JY = 912, JH = 330;

  const SET = () => FILM.sets.carwash;

  function pose(t) {
    const scrub = Math.sin(t * 9.5);
    return {
      x: JX, y: JY, h: JH, t, facing: 1, age: 15, outfit: 'carwash',
      pose: 'handshake', poseAmt: 1, lean: 0.8 + 0.7 * scrub, look: 0.15,
      expr: 'happy', exprAmt: 1, blinkOffset: 0.6,
    };
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const CW = SET();
      const C = CW.statics(S, FRAME);
      const dur = info.dur;
      const tJob = wordT(info, 'tokek', 0, 0.39 * dur);
      const tPop = wordT(info, 'tokel', 0, 0.68 * dur);
      const CUT = setupAt([
        { at: 0, z: 1, c: FOCUS, push: PUSH + 0.02, pan: [-12, -6] },
        { at: tJob, z: 1.8, c: [JX + 40, JY - 160], push: 0.06, pan: [-14, 8] },
        { at: tPop, z: 2, c: [CW.SIGN.cx + 100, CW.SIGN.cy + 70], push: 0.07, pan: [8, 10] },
      ], t, dur);
      const cam = (depth) => frame(ctx, CUT, depth);
      const pop = t < tPop ? 0 : Math.exp(-(t - tPop) / 0.35);

      const snap = 0.05 * (1 - LIB.ease.outCubic(t / 0.4));
      ctx.save();
      ctx.translate(FOCUS[0], FOCUS[1]);
      ctx.scale(1 + snap, 1 + snap);
      ctx.translate(-FOCUS[0], -FOCUS[1]);

      ctx.save();
      cam(PAR.far);
      ctx.drawImage(C.far, 0, 0, W, H);
      ctx.restore();

      ctx.save();
      cam(PAR.mid);
      ctx.drawImage(C.mid, 0, 0, W, H);
      CW.apply(ctx, FRAME);
      CW.drawSpray(ctx, t, { bay: CW.BAY1 });
      CW.drawSpray(ctx, t + 0.37, { bay: CW.BAY2 });
      CW.drawSignBulbs(ctx, t, { pop });
      if (pop > 0.01) LOOK.bloom(ctx, { x: CW.SIGN.cx, y: CW.SIGN.cy, r: 230, alpha: 0.45 * pop, mid: 0.2 * pop });
      ctx.restore();

      ctx.save();
      cam(PAR.near);
      ctx.drawImage(C.near, 0, 0, W, H);
      const o = pose(t);
      const P = FILM.cast.sam.pose(o);
      const hand = P.hands[0];
      CW.drawFoam(ctx, t, { x: hand[0] + 44, y: hand[1] + 2, r: 34, grow: 0.6 + 0.4 * sstep(0, 1.2, t), seed: 1 });
      CW.drawDrips(ctx, t);
      LOOK.castShadow(ctx, { x: o.x, y: o.y, h: JH, k: CW.SHADOW_K, S, alpha: 0.22, draw: (g) => FILM.cast.sam(g, o) });
      LOOK.contactShadow(ctx, { x: o.x, y: o.y, h: JH, alpha: 0.42, dx: -4 });
      FILM.cast.sam(ctx, o);
      FILM.cast.sponge(ctx, { x: hand[0] + 24, y: hand[1] - 4, size: 56, rot: -0.25 + 0.12 * Math.sin(t * 9.5), foam: 1 });
      ctx.restore();

      ctx.save();
      cam(PAR.near);
      const burst = 1 - sstep(0, 0.9, t);
      FILM.cast.bubbles(ctx, { x: 470, y: 380, w: 300, h: 380, size: 34, count: 10, t: t + 1.3, seed: sd('b1'), alpha: 0.9 });
      FILM.cast.bubbles(ctx, { x: 700, y: 300, w: 360, h: 460, size: 24, count: 9, t: t + 3.1, seed: sd('b2'), alpha: 0.8 });
      if (t >= tPop && t < tPop + 0.8) {
        const q = (t - tPop) / 0.8;
        const e = LIB.ease.outCubic(q);
        for (let i = 0; i < 9; i++) {
          const a = -Math.PI / 2 + 0.75 + (i - 4) * 0.22 + 0.2 * (LIB.h3(i, 3, 9) - 0.5);
          const d = (60 + 90 * LIB.h3(i, 4, 9)) * e;
          const r = (7 + 9 * LIB.h3(i, 5, 9)) * (0.6 + 0.4 * e);
          const bx = hand[0] + 50 + Math.cos(a) * d * 1.2, by = hand[1] - 20 + Math.sin(a) * d;
          ctx.globalAlpha = 1 - sstep(0.6, 1, q);
          ctx.beginPath();
          ctx.arc(bx, by, r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(225,245,255,0.3)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(70,96,120,0.6)';
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.beginPath();
          ctx.ellipse(bx + r * 0.38, by - r * 0.42, r * 0.22, r * 0.13, -0.7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      if (burst > 0.01) {
        FILM.cast.bubbles(ctx, { x: 360, y: 120, w: 640, h: 620, size: 70, count: 9, t: t * 2.4 + 2.2, seed: sd('b3'), alpha: burst });
      }
      ctx.restore();

      ctx.save();
      cam(PAR.air);
      LOOK.drawLight(ctx, C.light, { x: 6 * Math.sin(t * 0.4), alpha: 0.72 + 0.06 * Math.sin(t * 1.1) });
      ctx.restore();

      ctx.restore();

      if (pop > 0.01) LOOK.exposure(ctx, 0.25 * pop);

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
      void lerp;
    },
  });
})();
