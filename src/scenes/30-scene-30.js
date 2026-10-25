// scenes/30-scene-30.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-30';
  const LIB = FILM.lib, LOOK = FILM.look;
  const { sstep, clamp01 } = LOOK;
  const W = 1080, H = 1080;

  const normTok = (s) => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
  function wordT(info, tok, n, fb) {
    const sh = info.shot;
    const want = normTok(tok);
    let k = 0;
    for (const c of sh.captions || []) {
      for (const w of c.words || []) {
        const lt = w[0] - sh.start;
        if (lt < -0.02 || lt > info.dur + 0.02 || normTok(w[1]) !== want) continue;
        if (k === (n || 0)) return lt;
        k++;
      }
    }
    return fb;
  }
  function rig(ctx, t, dur, list, hand) {
    let i = 0;
    while (i + 1 < list.length && t >= list[i + 1].at) i++;
    const s = list[i];
    const end = i + 1 < list.length ? list[i + 1].at : dur;
    const u = Math.max(0, Math.min(1, (t - s.at) / Math.max(0.01, end - s.at)));
    const e = u * (1.6 - 0.6 * u);
    const z = s.z * (1 + (s.p == null ? 0.035 : s.p) * e);
    let dx = (s.d ? s.d[0] : 0) * e;
    let dy = (s.d ? s.d[1] : 0) * e;
    if (hand) {
      const w = (f, ph) => Math.sin(t * 6.2832 * f + ph);
      dx += hand * (0.55 * w(0.63, 0.4) + 0.3 * w(1.37, 2.1) + 0.15 * w(3.1, 4.4));
      dy += hand * (0.5 * w(0.71, 1.7) + 0.33 * w(1.53, 0.2) + 0.17 * w(2.9, 3.3));
    }
    const fx = s.f[0], fy = s.f[1];
    const cl = (v, a, b) => (v < a ? a : v > b ? b : v);
    dx = cl(dx, 540 - fx * z, (1080 - fx) * z - 540);
    dy = cl(dy, 540 - fy * z, (1080 - fy) * z - 540);
    ctx.translate(540 - dx, 540 - dy);
    ctx.scale(z, z);
    ctx.translate(-fx, -fy);
    return i;
  }

  const FOCUS = [540, 640];
  const PUSH = 0.035;
  const PAR = { far: 0.4, near: 1, air: 0.7 };

  const BACK_H = 230;
  const BACK = [
    { x: 96, v: 3, f: 1, expr: 'closed', rifle: true },
    { x: 262, v: 1, f: 1, expr: 'stare', rifle: true, look: -0.1 },
    { x: 416, v: 4, f: -1, expr: 'closed', rifle: true },
    { x: 690, v: 5, f: 1, expr: 'stare', rifle: true },
    { x: 846, v: 2, f: -1, expr: 'closed', rifle: true },
    { x: 1004, v: 0, f: 1, expr: 'stare', rifle: true },
  ];
  const FRONT_H = 420;
  const FRONT = [
    { x: 120, v: 2, f: 1, expr: 'stare' },
    { x: 940, v: 4, f: -1, expr: 'closed' },
  ];
  const JX = 548;

  const SHADOW = { alpha: 0.22, color: [30, 28, 44] };

  const lineSeat = (P, h, floor) => ({ seat: (floor - P) / h });

  function rifleFor(o, big) {
    const p = FILM.cast.soldier.pose(o);
    const kx = (p.legs[0].knee[0] + p.legs[1].knee[0]) / 2;
    const ax = (p.legs[0].ankle[0] + p.legs[1].ankle[0]) / 2;
    const rh = FILM.cast.sam.height(o);
    return { x: lerp(ax, kx, big ? 1.05 : 0.75), y: o.y - 0.01 * o.h, size: (big ? 0.52 : 0.44) * rh, rot: big ? 0.1 : 0.16 };
  }
  const lerp = (a, b, k) => a + (b - a) * k;

  function seated(P, x, y, h, f, extra) {
    return Object.assign({ x, y, h, facing: f, age: 19, outfit: 'fatigues-desert', helmet: true, pose: 'sit' }, extra);
  }

  const RIFLE_ROT = 0.12;
  function gripped(o) {
    const S = FILM.cast.soldier;
    const p = S.pose(o);
    const kx = (p.legs[0].knee[0] + p.legs[1].knee[0]) / 2;
    const ky = Math.min(p.legs[0].knee[1], p.legs[1].knee[1]);
    const g = [kx - o.facing * 0.03 * o.h, ky - 0.035 * o.h];
    const a = S.pose(Object.assign({}, o, { grip: [0, 0] })).grip;
    const b = S.pose(Object.assign({}, o, { grip: [100, -100] })).grip;
    const grip = [((g[0] - a[0]) / (b[0] - a[0])) * 100, ((g[1] - a[1]) / (b[1] - a[1])) * -100];
    const butt = [g[0] - o.facing * (o.y - 0.01 * o.h - g[1]) * Math.tan(RIFLE_ROT), o.y - 0.01 * o.h];
    return { o: Object.assign({}, o, { grip }), rifle: { x: butt[0], y: butt[1], size: 0.44 * FILM.cast.sam.height(o), rot: RIFLE_ROT } };
  }

  function drawSeated(ctx, o, isSam, withRifle) {
    const fn = isSam ? FILM.cast.sam : FILM.cast.soldier;
    LOOK.contactShadow(ctx, { x: o.x, y: o.y, h: o.h, alpha: 0.3 });
    if (withRifle) {
      let r;
      if (isSam) {
        r = rifleFor(o, true);
        const hy = Math.max(...FILM.cast.sam.pose(o).hands.map((q) => q[1]));
        r.size = Math.min(r.size, (r.y - hy - 0.03 * o.h) / Math.cos(r.rot));
      }
      else ({ o, rifle: r } = gripped(o));
      fn(ctx, Object.assign({}, o, { layer: 'back' }));
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.scale(o.facing, 1);
      FILM.cast.rifle(ctx, Object.assign(r, { x: 0, y: 0 }));
      ctx.restore();
      fn(ctx, Object.assign({}, o, { layer: 'front' }));
    } else fn(ctx, o);
  }

  let BACK_CACHE = null;
  function backLayer(S, P, C) {
    if (BACK_CACHE && BACK_CACHE.S === S) return BACK_CACHE.c;
    const { c, g } = LOOK.makeLayer(S);
    g.drawImage(C.far, 0, 0, W, H);
    g.drawImage(C.bench, 0, 0, W, H);
    const backFeet = P.FAR_FLOOR + 6;
    for (const b of BACK) {
      const o = seated(P, b.x, backFeet, BACK_H, b.f, {
        t: 0, variant: b.v, seat: (backFeet - P.FAR_SEAT - 4) / BACK_H, expr: b.expr, exprAmt: 1, look: b.look || 0,
      });
      drawSeated(g, o, false, b.rifle);
    }
    g.fillStyle = 'rgba(150,156,170,0.16)';
    g.fillRect(-60, P.FAR_SEAT - 220, W + 120, 320);
    BACK_CACHE = { S, c };
    return c;
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const P = FILM.sets.plane;
      const C = P.statics(S);
      const cam = (depth) => LOOK.camera(ctx, { t, dur: info.dur, focus: FOCUS, push: PUSH, depth });
      const he = wordT(info, 'tokaa', 0, 2.04);
      const prayed = wordT(info, 'tokhf', 0, 2.14);

      ctx.save();
      rig(ctx, t, info.dur, [
        { at: 0, f: [540, 600], z: 1.05, d: [-16, -6], p: 0.04 },
        { at: he - 0.06, f: [552, 790], z: 1.9, d: [6, -8], p: 0.05 },
      ], 2.5);

      ctx.save();
      cam(PAR.far);
      ctx.drawImage(backLayer(S, P, C), 0, 0, W, H);
      ctx.restore();

      ctx.save();
      cam(PAR.near);
      ctx.drawImage(C.near, 0, 0, W, H);
      const frontFeet = P.NEAR_FLOOR;
      const fseat = (frontFeet - P.NEAR_SEAT) / FRONT_H;
      for (const s of FRONT) {
        const o = seated(P, s.x, frontFeet, FRONT_H, s.f, { t, variant: s.v, seat: fseat, expr: s.expr, exprAmt: 1 });
        drawSeated(ctx, o, false, true);
      }
      const close = LIB.ease.inOutSine(clamp01((t - (prayed - 0.12)) / 0.3));
      const jo = seated(P, JX, frontFeet, FRONT_H, 1, {
        t, pose: 'pray', seat: fseat, expr: 'closed', exprAmt: close, blinkOffset: 1.7,
        breath: 1,
      });
      drawSeated(ctx, jo, true, true);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(C.grade, 0, 0, W, H);
      ctx.restore();

      ctx.save();
      cam(PAR.air);
      LOOK.drawLight(ctx, C.light, { alpha: 0.8 + 0.06 * Math.sin(t * 2.1) });
      P.drawLamp(ctx, t);
      ctx.restore();
      ctx.restore();

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
