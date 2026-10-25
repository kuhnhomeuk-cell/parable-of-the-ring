// scenes/27-scene-27.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-27';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const SETS = FILM.sets.barracks;
  const { sstep, clamp01, lerp } = LOOK;
  const seg = LIB.seg;
  const LK = SETS.GEO.LK;

  const FOCUS = [660, 600];
  const PUSH = 0.035;
  const JX = 600;
  const JY = 1066;
  const JH = 640;
  const BOX = 62;
  const SOCK = 190;
  const SK = SOCK / 100;
  const INK = 8;

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

  function keysOf(info) {
    const ring = wordT(info, 'tokap', 0, 1.81);
    const home = wordT(info, 'tokdj', 0, 2.21);
    const so = wordT(info, 'tokcc', 0, 2.61);
    const hid = wordT(info, 'tokgl', 0, 3.08);
    const sock = wordT(info, 'tokgm', 0, 3.78);
    const locker = wordT(info, 'tokgn', 0, 4.66);
    const hid1 = Math.max(hid + 0.45, sock + 0.05);
    const reach1 = Math.min(locker, hid1 + 0.55);
    return {
      so, ring,
      close0: home - 0.05, close1: home + 0.3,
      glance0: so - 0.05, glance1: hid - 0.12,
      hid0: hid - 0.05, hid1,
      reach0: hid1 - 0.12, reach1,
      drop: reach1 + 0.03,
      push1: locker + 0.25,
      out0: locker + 0.05, out1: locker + 0.6,
    };
  }
  const REST_X = [752, 838];

  const cam = (ctx, t, dur, depth) => LOOK.camera(ctx, { t, dur, focus: FOCUS, push: PUSH, depth });

  function samPose(t, F) {
    const u = t;
    let amt = 0.62;
    amt = lerp(amt, 0.4, seg(u, F.glance0 - 0.02, F.glance0 + 0.03, 'inOutSine'));
    amt = lerp(amt, 0.62, seg(u, F.glance1 - 0.03, F.glance1 + 0.01, 'inOutSine'));
    amt = lerp(amt, 1, seg(u, F.reach0, F.reach1, 'inOutSine'));
    amt = lerp(amt, 0, seg(u, F.out0, F.out1, 'inOutSine'));
    const turned = u > F.glance0 + 0.015 && u < F.glance1 - 0.015;
    const gaze = sstep(F.ring - 0.45, F.ring - 0.05, t) * (1 - sstep(F.close1, F.so - 0.05, t));
    const expr = turned ? 'wide' : u > F.out1 - 0.02 ? 'smileSmall' : 'neutral';
    return {
      x: JX, y: JY, h: JH, t, age: 18, outfit: 'fatigues-camp', facing: turned ? -1 : 1,
      pose: 'hug', poseAmt: amt, expr, exprAmt: turned ? 0.7 : 1, look: turned ? -0.7 : -0.32 * gaze, blinkOffset: 0.6,
    };
  }

  function drawSock(ctx, x, y, lump, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    if (lump > 0.01) {
      const w = 19 * SK * lump, hh = 14 * SK * lump;
      const cx = -8 * SK, cy = -24 * SK;
      ctx.fillStyle = '#1F1712';
      ctx.beginPath();
      ctx.ellipse(cx, cy, w + INK * 0.5, hh + INK * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F4F0E8';
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(0, w - INK * 0.5), Math.max(0, hh - INK * 0.5), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    FILM.cast.sock(ctx, { x: 0, y: 0, size: SOCK, lw: INK });
    if (lump > 0.01) {
      ctx.fillStyle = `rgba(30,44,110,${0.22 * lump})`;
      ctx.beginPath();
      ctx.roundRect(-8 * SK - 12 * SK, -24 * SK - 9 * SK, 24 * SK, 18 * SK, 4 * SK);
      ctx.fill();
    }
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const dur = info.dur;
      const t = Math.max(0, Math.min(tIn, dur));
      const u = t;
      const F = keysOf(info);
      const S = info.S || FILM.S || 1;
      const C = SETS.statics(S, 'locker');

      ctx.save();
      rig(ctx, t, dur, [
        { at: 0, f: [640, 600], z: 1.22, d: [-12, -8], p: 0.05 },
        { at: F.ring - 0.1, f: [676, 610], z: 2.0, d: [6, -10], p: 0.06 },
        { at: F.so - 0.05, f: [690, 640], z: 1.1, d: [14, -6], p: 0.05 },
      ]);

      ctx.save();
      cam(ctx, t, dur, 0.25);
      ctx.drawImage(C.far, 0, 0, 1080, 1080);
      ctx.restore();
      ctx.save();
      cam(ctx, t, dur, 0.55);
      ctx.drawImage(C.mid, 0, 0, 1080, 1080);
      ctx.restore();

      ctx.save();
      cam(ctx, t, dur, 1);
      ctx.drawImage(C.near, 0, 0, 1080, 1080);

      const o = samPose(t, F);
      const P = FILM.cast.sam.pose(o);
      const [nearH, farH] = P.hands;
      const held = u < F.drop;
      const grip = [farH[0] + 8 * SK * o.facing, farH[1] + 48 * SK - 16];
      const restY = SETS.GEO.LK.shelf - 32 * SK + 2;
      const slide = seg(u, F.drop + 0.01, F.push1, 'inOutSine');
      const settle = seg(u, F.drop, F.drop + 0.03, 'outQuad');
      const dropFrom = (() => {
        const q = samPose(F.drop, F);
        const pp = FILM.cast.sam.pose(q).hands[1];
        return [pp[0] + 8 * SK, pp[1] + 48 * SK - 16];
      })();
      const sockAt = held ? grip : [lerp(dropFrom[0], REST_X[0], settle) + (REST_X[1] - REST_X[0]) * slide, lerp(dropFrom[1], restY, settle)];
      const sway = held ? 0.06 * Math.sin(t * 2.3) * (1 - seg(u, F.reach0, F.reach1)) : 0;
      const inK = seg(u, F.hid0, F.hid1, 'inOutCubic');
      const lump = sstep(F.hid0 + 0.06, F.hid1, u);
      const palm = [nearH[0] + 4 * o.facing, nearH[1] - 6];
      const mouth = [sockAt[0] - 8 * SK * o.facing, sockAt[1] - 48 * SK - 6];
      const heel = [sockAt[0] - 8 * SK * o.facing, sockAt[1] - 6 * SK];
      const open = 1 - seg(u, F.close0, F.close1, 'inOutCubic');
      const sparkle = Math.exp(-Math.pow((t - F.ring - 0.08) / 0.4, 2)) * (open > 0.5 ? 1 : 0);
      let boxAt = palm;
      if (inK > 0) {
        const a = Math.min(1, inK / 0.45), b = Math.max(0, (inK - 0.45) / 0.55);
        const over = [mouth[0], mouth[1] - 10];
        boxAt = inK < 0.45 ? [lerp(palm[0], over[0], a), lerp(palm[1], over[1], a) - 16 * Math.sin(a * Math.PI)] : [lerp(over[0], heel[0], b), lerp(over[1], heel[1], b)];
      }
      const boxSize = BOX * (1 - 0.22 * inK);
      const inside = inK >= 0.45;

      ctx.drawImage(C.front, 0, 0, 1080, 1080);
      if (!held) {
        drawSock(ctx, sockAt[0], sockAt[1], lump, 0);
        ctx.save();
        ctx.beginPath();
        ctx.rect(SETS.GEO.LK.stack.x0, 0, 200, SETS.GEO.LK.shelf + 1);
        ctx.clip();
        ctx.drawImage(C.front, 0, 0, 1080, 1080);
        ctx.restore();
      }
      FILM.cast.sam(ctx, Object.assign({ layer: 'back' }, o));
      if (inside && u < F.hid1) FILM.cast.ringBox(ctx, { x: boxAt[0], y: boxAt[1], size: boxSize, open: 0, t, yaw: 0.5 * o.facing, tilt: 0.45, lw: 6 });
      if (held) drawSock(ctx, sockAt[0], sockAt[1], lump, sway);
      FILM.cast.sam(ctx, Object.assign({ layer: 'front' }, o));
      if (inK < 0.45) {
        FILM.cast.ringBox(ctx, { x: boxAt[0], y: boxAt[1], size: boxSize, open, ring: true, t, yaw: 0.5 * o.facing, tilt: 0.45, sparkle: 0.9 * sparkle, lw: 6 });
        if (sparkle > 0.02) {
          const d = [boxAt[0] + 3, boxAt[1] - 0.9 * boxSize];
          LOOK.bloom(ctx, { x: d[0], y: d[1], r: 64, alpha: 0.6 * sparkle, mid: 0.22 * sparkle });
          LOOK.glint(ctx, { x: d[0], y: d[1], size: 8 + 22 * sparkle, alpha: sparkle, rot: 0.1 * Math.sin(t * 2) });
        }
      }
      ctx.restore();

      ctx.save();
      cam(ctx, t, dur, 0.7);
      LOOK.drawLight(ctx, C.light, { x: 4 * Math.sin(t * 0.4), alpha: 0.6 + 0.02 * Math.sin(t * 13) });
      ctx.restore();
      ctx.restore();

      ctx.save();
      const vg = ctx.createRadialGradient(700, 480, 300, 700, 480, 980);
      vg.addColorStop(0, 'rgba(10,26,20,0)');
      vg.addColorStop(1, 'rgba(8,22,18,0.5)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, 1080, 1080);
      ctx.restore();

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
