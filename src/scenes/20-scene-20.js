// scenes/20-scene-20.js: procedural scene. Shot timing comes from src/timeline.js.
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

  const ID = 'scene-20';
  const LIB = FILM.lib, LOOK = FILM.look;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { sstep } = LOOK;
  const W = 1080, H = 1080;
  const TAU = Math.PI * 2;
  const INK = '#1F1712';

  const FRAME = { z: 1.55, c: [522, 650] };
  const PUSH = 0.03;
  const PAR = { far: 0.25, mid: 0.55, near: 1, air: 0.7 };

  const JX = 468, JY = 1040, JH = 480;
  const DAY0 = 2;
  const DAY1 = 27;

  const SET = () => FILM.sets.carwash;

  function pose(t) {
    const scrub = Math.sin(t * 6.2);
    return {
      x: JX, y: JY, h: JH, t, facing: 1, age: 16, outfit: 'carwash',
      pose: 'handshake', poseAmt: 1, lean: 0.9 + 0.75 * scrub, look: -0.1,
      expr: 'squint', exprAmt: 0.55, blinkOffset: 1.3,
    };
  }

  function sunburn(ctx, P, rH) {
    const [hx, hy] = P.head;
    ctx.save();
    const fx = hx + rH * 0.22, fy = hy + rH * 0.22;
    const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, rH * 0.62);
    g.addColorStop(0, 'rgba(232,80,60,0.42)');
    g.addColorStop(0.6, 'rgba(232,90,70,0.16)');
    g.addColorStop(1, 'rgba(232,90,70,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(fx, fy, rH * 0.62, rH * 0.42, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(226,70,56,0.28)';
    ctx.beginPath();
    ctx.ellipse(hx + rH * 0.5, hy + rH * 0.12, rH * 0.16, rH * 0.07, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function sweat(ctx, t, P, rH, lw) {
    const per = 1.6;
    const ph = ((t + 0.4) % per) / per;
    if (ph > 0.8) return;
    const [hx, hy] = P.head;
    const x = hx - rH * 0.62, y = hy - rH * 0.3 + rH * 0.4 * sstep(0.1, 0.8, ph);
    const s = rH * 0.09;
    ctx.save();
    ctx.globalAlpha = 1 - sstep(0.65, 0.8, ph);
    ctx.beginPath();
    ctx.moveTo(x, y - s * 1.6);
    ctx.quadraticCurveTo(x + s, y - s * 0.2, x + s * 0.9, y + s * 0.3);
    ctx.arc(x, y + s * 0.3, s * 0.9, 0, Math.PI);
    ctx.quadraticCurveTo(x - s, y - s * 0.2, x, y - s * 1.6);
    ctx.closePath();
    ctx.fillStyle = '#CFEFF4';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(x - s * 0.3, y + s * 0.1, s * 0.25, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const CW = SET();
      const C = CW.statics(S, FRAME);
      const dur = info.dur;
      const tPay = wordT(info, 'tokfg', 0, 0.3 * dur);
      const tDeal = wordT(info, 'tokeo', 0, 0.62 * dur);
      const D_PAY = 12, tP = Math.min(dur - 0.3, tPay + 0.12);
      const days = t < tP ? DAY0 + (D_PAY - DAY0) * (t / tP) : D_PAY + (DAY1 - D_PAY) * ((t - tP) / (dur - tP));
      const crossAt = (d) => (d <= D_PAY ? ((d - DAY0) / (D_PAY - DAY0)) * tP : tP + ((d - D_PAY) / (DAY1 - D_PAY)) * (dur - tP));
      const cal = CW.toScreen(FRAME, [(CW.CAL.x0 + CW.CAL.x1) / 2, (CW.CAL.y0 + CW.CAL.y1) / 2]);
      const head = FILM.cast.sam.pose(pose(tDeal)).head;
      const CUT = setupAt([
        { at: 0, z: 1, c: [540, 540], push: PUSH + 0.04, pan: [-16, 8] },
        { at: tPay, z: 2.4, c: cal, push: 0.08, pan: [10, -10] },
        { at: tDeal, z: 1.7, c: [head[0] + 30, head[1] + 120], push: 0.07, pan: [-10, -8] },
      ], t, dur);
      const cam = (depth) => frame(ctx, CUT, depth);

      ctx.save();
      cam(PAR.far);
      ctx.drawImage(C.far, 0, 0, W, H);
      ctx.restore();

      ctx.save();
      cam(PAR.mid);
      ctx.drawImage(C.mid, 0, 0, W, H);
      CW.apply(ctx, FRAME);
      CW.drawSpray(ctx, t, { bay: CW.BAY1 });
      CW.drawCalendarMarks(ctx, days, { lw: 1.5 });
      for (let d = 1; d <= Math.floor(days); d++) {
        if (!CW.isFriday(d)) continue;
        const since = t - crossAt(d);
        if (since > 0.5) continue;
        const p = CW.calCell(d);
        const k = 1 - since / 0.5;
        const gr = ctx.createRadialGradient(p.x + p.w / 2, p.y + p.h / 2, 0, p.x + p.w / 2, p.y + p.h / 2, p.w * 1.1);
        gr.addColorStop(0, `rgba(255,226,120,${0.75 * k})`);
        gr.addColorStop(1, 'rgba(255,226,120,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(p.x - p.w, p.y - p.h, p.w * 3, p.h * 3);
      }
      ctx.restore();

      ctx.save();
      cam(PAR.near);
      ctx.drawImage(C.near, 0, 0, W, H);
      const o = pose(t);
      const P = FILM.cast.sam.pose(o);
      const hand = P.hands[0];
      const week = (dur / (DAY1 - DAY0)) * 7;
      const wph = (t % week) / week;
      CW.drawFoam(ctx, t, { x: hand[0] + 70, y: hand[1] + 4, r: 56, grow: sstep(0, 0.6, wph) * (1 - sstep(0.9, 1, wph)) + 0.35, seed: 2 });
      ctx.save();
      CW.apply(ctx, FRAME);
      CW.drawDrips(ctx, t, { count: 7 });
      ctx.restore();
      LOOK.castShadow(ctx, { x: o.x, y: o.y, h: JH, k: CW.SHADOW_K, S, alpha: 0.22, draw: (g) => FILM.cast.sam(g, o) });
      LOOK.contactShadow(ctx, { x: o.x, y: o.y, h: JH, alpha: 0.42, dx: -6 });
      FILM.cast.sam(ctx, o);
      const rH = 0.2 * FILM.cast.sam.height(o);
      sunburn(ctx, P, rH);
      sweat(ctx, t, P, rH, Math.max(2.5, (6 * JH) / 330) * 0.6);
      FILM.cast.sponge(ctx, { x: hand[0] + 38, y: hand[1] - 6, size: 84, rot: -0.25 + 0.12 * Math.sin(t * 6.2), foam: 1 });
      ctx.restore();

      ctx.save();
      cam(PAR.near);
      FILM.cast.bubbles(ctx, { x: 640, y: 300, w: 380, h: 520, size: 34, count: 9, t: t + 2.3, seed: sd('b'), alpha: 0.85 });
      ctx.restore();

      ctx.save();
      cam(PAR.air);
      LOOK.drawLight(ctx, C.light, { x: 6 * Math.sin(t * 0.4), alpha: 0.78 + 0.06 * Math.sin(t * 1.1) });
      ctx.restore();

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
