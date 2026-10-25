// scenes/21-scene-21.js: procedural scene. Shot timing comes from src/timeline.js.
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

  const ID = 'scene-21';
  const LOOK = FILM.look;
  const HOME = () => FILM.sets.home;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const sstep = (e0, e1, x) => {
    const u = clamp01((x - e0) / (e1 - e0));
    return u * u * (3 - 2 * u);
  };

  const PUSH = 0.03;

  function pose(t, jolt, dur) {
    const D = HOME().DESK;
    const droop = sstep(0.2, jolt - 0.05, t) * (1 - sstep(jolt, jolt + 0.12, t)) + 0.25 * sstep(jolt + 0.4, dur, t);
    return {
      x: D.feet[0], y: D.feet[1], h: D.h, t, age: 16, outfit: 'casual', facing: 1,
      pose: 'sit', poseAmt: 1, desk: true, lean: 0.1 * droop,
      expr: 'closed', exprAmt: 0.2 + 0.5 * droop,
    };
  }

  function drawPencil(ctx, o) {
    const p = FILM.cast.sam.pose(o).hands[0];
    const k = o.h / 330;
    const lw = Math.max(2.5, 6 * k) * 0.5 / k;
    ctx.save();
    ctx.translate(p[0], p[1]);
    ctx.scale(k, k);
    ctx.rotate(-0.45);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1F1712';
    ctx.lineWidth = lw;
    ctx.fillStyle = 'rgb(236,190,70)';
    ctx.beginPath();
    ctx.rect(-4, -34, 8, 40);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgb(240,200,170)';
    ctx.beginPath();
    ctx.moveTo(-4, 6);
    ctx.lineTo(4, 6);
    ctx.lineTo(0, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgb(220,120,130)';
    ctx.fillRect(-4, -40, 8, 6);
    ctx.restore();
  }

  function drawSteam(ctx, t) {
    const D = HOME().DESK;
    for (let i = 0; i < 3; i++) {
      const u = ((t * 0.45 + i / 3) % 1);
      const x = D.mug[0] + 11 * Math.sin(u * 6 + i * 2), y = D.mug[1] - u * 100;
      const a = 0.22 * Math.sin(Math.PI * u);
      const r = 20 + 14 * u;
      const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(240,236,230,${a})`);
      gr.addColorStop(1, 'rgba(240,236,230,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const H = HOME();
      const C = H.bedroom(S, 'desk');
      const D = H.DESK;
      const u = t / info.dur;
      const line = info.shot.beats[0].t;
      const tYears = wordT(info, 'tokfh', 0, line + 0.4);
      const tNever = wordT(info, 'tokfi', 0, line + 1.5);
      const jolt = Math.min(info.dur - 0.3, wordT(info, 'tokff', 0, 0.8 * info.dur));
      const head = FILM.cast.sam.pose(pose(tNever, jolt, info.dur)).head;
      const CUT = setupAt([
        { at: 0, z: 1, c: [540, 540], push: PUSH + 0.04, pan: [14, -8] },
        { at: tYears, z: 2.2, c: [(D.clock[0] + D.cal[0] + D.cal[2] / 2) / 2, D.clock[1]], push: 0.08, pan: [-12, 8] },
        { at: tNever, z: 1.5, c: [head[0] + 200, head[1] + 60], push: 0.08, pan: [-14, -10] },
      ], t, info.dur);
      const cam = (depth) => frame(ctx, CUT, depth);

      ctx.save();
      cam(1);
      ctx.drawImage(C.near, 0, 0, 1080, 1080);
      LOOK.drawLight(ctx, C.cool, { alpha: 0.6 });
      H.clock(ctx, { x: D.clock[0], y: D.clock[1], r: D.clock[2], min: 10 + 150 * LOOK.lerp(0, 1, sstep(0, 1, u * 1.05)) });
      const weeks = 0.3 + 4.4 * sstep(line * 0.5, info.dur - 0.2, t);
      H.calendar(ctx, { x: D.cal[0], y: D.cal[1], w: D.cal[2], h: D.cal[3], weeks, month: 'MARCH', year: '1988' });
      const o = pose(t, jolt, info.dur);
      LOOK.contactShadow(ctx, { x: o.x + 10, y: o.y, h: o.h, dx: -16 });
      FILM.cast.sam(ctx, Object.assign({}, o, { layer: 'back' }));
      drawPencil(ctx, o);
      FILM.cast.sam(ctx, Object.assign({}, o, { layer: 'front' }));
      ctx.drawImage(C.front, 0, 0, 1080, 1080);
      drawSteam(ctx, t);
      LOOK.drawLight(ctx, C.warm, { alpha: 0.85 + 0.03 * Math.sin(t * 2.1) });
      ctx.restore();

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
