// scenes/14-scene-14.js: procedural scene. Shot timing comes from src/timeline.js.
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

  const ID = 'scene-14';
  const LIB = FILM.lib, LOOK = FILM.look;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const W = 1080, H = 1080;

  const beatsOf = (info) => {
    const b = info.shot.beats;
    return {
      nell: wordT(info, 'tokdv', 0, b[0].t + 1.7), let: wordT(info, 'tokdw', 0, b[0].t + 2.05),
      hold: wordT(info, 'tokdx', 0, b[0].t + 2.55), end: info.dur,
    };
  };

  const reachOpts = (r) => (r <= 0.001 ? {} : { pose: 'hug', poseAmt: r, lean: 0.35 * r });

  let WET = null;
  function wetLayer(S) {
    if (!WET || WET.S !== S) WET = { S, c: FILM.makeCanvas(Math.round(W * S), Math.round(H * S)) };
    return WET.c;
  }

  const DRIPS = (() => {
    const r = LIB.rng(sd('drips'));
    const d = [];
    for (let i = 0; i < 9; i++) d.push([r.range(-0.18, 0.16), i < 5 ? r.range(-0.62, -0.55) : r.range(-0.3, -0.22), r.range(0.55, 0.9), r()]);
    return d;
  })();

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const ST = FILM.sets.store;
      const K = FILM.cast.nell, J = FILM.cast.sam;
      const C = ST.statics(S, { angle: 'two', tod: 'winter' });
      const V = C.V;
      const B = beatsOf(info);

      const kx = V.staffX[0] + 80;
      const ko = { x: kx, y: V.floor, h: V.JH * K.HK, t, facing: -1, pose: 'offerRing', expr: 'warm', counterY: V.counterY, light: V.light };
      const kq = K.pose(ko);

      const r = lerp(0.35, 1, LIB.ease.inOutSine((t - 0.2) / (B.hold - 0.3)));
      const shiver = 1.4 * Math.sin(t * 47) * (1 - 0.6 * sstep(B.hold, B.hold + 0.6, t));
      const jo = Object.assign({
        x: kx - 262 + shiver, y: V.floor + 8, h: V.JH * 0.96, t, facing: 1, age: 14, outfit: 'school', hair: 'wet', look: 0.15,
        expr: t < B.hold + 0.25 ? 'wide' : 'smileSmall', exprAmt: t < B.hold + 0.25 ? 0.7 : sstep(B.hold + 0.25, B.hold + 0.6, t),
      }, reachOpts(r));
      const jq = J.pose(jo);

      const place = LIB.ease.inOutSine((t - B.hold) / 0.4);
      const jh = [Math.max(jq.hands[0][0], jq.hands[1][0]) + 4, (jq.hands[0][1] + jq.hands[1][1]) / 2 + 6];
      const kr = [kq.ring[0], kq.ring[1] - 4];
      const rp = [lerp(kr[0], jh[0], place), lerp(kr[1], jh[1], place) - 18 * Math.sin(Math.PI * place)];
      const glow = sstep(B.hold + 0.15, B.hold + 0.6, t);

      const mid = [(kr[0] + jh[0]) / 2, (kr[1] + jh[1]) / 2 - 30];
      const CUT = setupAt([
        { at: 0, z: 1, c: [540, 540], push: 0.06, pan: [-24, 6] },
        { at: B.let, z: 2.3, c: mid, push: 0.06, pan: [10, -12] },
      ], t, info.dur);
      const cam = (g, depth) => frame(g, CUT, depth);

      ctx.save();
      cam(ctx, ST.PAR.back);
      ST.drawBack(ctx, C, { t });
      ctx.restore();

      ctx.save();
      cam(ctx, 0.92);
      K(ctx, ko);
      ST.drawCounter(ctx, C, { t });
      ctx.restore();

      const wc = wetLayer(S);
      const w = wc.getContext('2d');
      w.setTransform(1, 0, 0, 1, 0, 0);
      w.globalCompositeOperation = 'source-over';
      w.clearRect(0, 0, wc.width, wc.height);
      w.setTransform(S, 0, 0, S, 0, 0);
      w.save();
      cam(w, 1);
      J(w, jo);
      w.restore();
      w.globalCompositeOperation = 'source-atop';
      w.fillStyle = 'rgba(34,52,86,0.26)';
      w.fillRect(0, 0, W, H);
      w.globalCompositeOperation = 'source-over';
      ctx.save();
      cam(ctx, 1);
      LOOK.contactShadow(ctx, { x: jo.x, y: jo.y, h: jo.h, alpha: 0.32 });
      ctx.fillStyle = 'rgba(150,176,200,0.22)';
      ctx.beginPath();
      ctx.ellipse(jo.x - 10, jo.y + 4, 78, 9, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.drawImage(wc, 0, 0, W, H);

      ctx.save();
      cam(ctx, 1);
      const hs = jo.h / 330;
      for (const [dx, dy, per, ph] of DRIPS) {
        const u = ((t / per + ph) % 1 + 1) % 1;
        const x = jo.x + dx * jo.h, y0 = jo.y + dy * jo.h;
        const y = y0 + u * u * 120 * hs;
        const a = (1 - u) * 0.9;
        ctx.fillStyle = `rgba(200,226,246,${a})`;
        ctx.beginPath();
        ctx.ellipse(x, y, 2.6 * hs, 4.6 * hs, 0, 0, TAU);
        ctx.fill();
      }
      if (glow > 0.01) {
        LOOK.bloom(ctx, { x: rp[0], y: rp[1] - 14, r: 150, alpha: 0.62 * glow, mid: 0.24 * glow });
      }
      const lw = 2;
      const rg = FILM.cast.diamondRing(ctx, { x: rp[0], y: rp[1], size: 46, rot: 0.55 + 0.25 * Math.sin(t * 0.8), tilt: 0.05, t, light: -1.0, sparkle: 0.3 + 0.5 * glow, shadow: 0, lw });
      if (rg && rg.glint) LOOK.glint(ctx, { x: rg.glint[0], y: rg.glint[1], size: 10 + 16 * glow * (0.8 + 0.2 * Math.sin(t * 4)), alpha: 0.4 + 0.5 * glow });
      ctx.restore();

      ctx.save();
      cam(ctx, ST.PAR.air);
      ST.drawLight(ctx, C, { t });
      ctx.restore();
      LOOK.exposure(ctx, 0.12 * glow, { strength: 0.3 });

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
