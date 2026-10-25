// scenes/29-scene-29.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-29';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const SETS = FILM.sets.barracks;
  const { sstep, clamp01, lerp } = LOOK;
  const seg = LIB.seg;
  const TAU = Math.PI * 2;
  const INK = '#1F1712';

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

  let B = null;
  function keysOf(info) {
    const inside = wordT(info, 'tokai', 0, 2.16);
    const helmet = wordT(info, 'tokak', 0, 3.09);
    const taped = wordT(info, 'tokah', 0, 3.46);
    const ring = wordT(info, 'tokap', 0, 4.02);
    const inW = wordT(info, 'tokcd', 0, 4.31);
    const from = wordT(info, 'tokbo', 0, 5.23);
    const everywhere = wordT(info, 'tokhd', 0, 6.61);
    return {
      cutA2: inside - 0.06,
      drop0: helmet - 0.6, drop1: helmet - 0.15,
      press: helmet,
      cutA3: taped - 0.08,
      zip0: taped - 0.02, zip1: taped + 0.42,
      ringIn: ring + 0.05,
      lower0: inW, lower1: inW + 0.55,
      cut: from - 0.05,
      land: from + 0.27,
      cutB2: everywhere - 0.08,
      walk: everywhere,
    };
  }

  const JA = { x: 330, y: 930, h: 1000 };
  const FOCUS_A = [560, 640];
  const JB = { x: 452, y: 900, h: 380 };
  const FOCUS_B = [520, 600];
  const SPEED = 300;

  const RIM_Y = -8;
  const CY = RIM_Y + 4;
  const SHELL = '#5E6340';
  const TAPE = '#B4B8BA';

  function poseA(t) {
    const lower = seg(t, B.lower0, B.lower1, 'inOutSine');
    return {
      x: JA.x, y: JA.y, h: JA.h, t, age: 18, outfit: 'fatigues-camp', facing: 1, pose: 'liftLiner', poseAmt: 1,
      lift: 1 - 0.62 * lower, expr: t > B.ringIn ? 'smileSmall' : 'neutral', blinkOffset: 0.4,
    };
  }

  const toScreen = (H, p) => [H.x + p[0] * H.size / 170, H.y + p[1] * H.size / 170];

  function emptyCrevice(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, RIM_Y, 76, 35, 0, 0, TAU);
    ctx.clip();
    ctx.beginPath();
    ctx.ellipse(0, -6, 40, 21, 0, 0, TAU);
    ctx.clip();
    ctx.fillStyle = SHELL;
    ctx.fillRect(-60, -40, 120, 70);
    const g = ctx.createRadialGradient(-10, RIM_Y + 8, 6, 0, RIM_Y, 80);
    g.addColorStop(0, 'rgba(20,22,12,0.75)');
    g.addColorStop(1, 'rgba(20,22,12,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-60, -40, 120, 70);
    ctx.fillStyle = '#8C7F5C';
    ctx.beginPath();
    ctx.ellipse(0, CY, 34, 13, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#2C2618';
    ctx.beginPath();
    ctx.ellipse(0, CY, 17, 5.5, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#A89A72';
    for (const [x, y, r] of [[-24, 6, 1.6], [22, 7, 1.3], [-30, -2, 1.1], [28, -6, 1.4], [8, 9, 1.2]]) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function strip(ctx, sx, reach, ink) {
    const x0 = sx * 7, x1 = sx * 30;
    const tp = [[x0, CY - 9], [x1, CY - 6], [x1 + sx * 1.5, CY + 4], [x0 - sx * 1, CY + 7]];
    ctx.save();
    ctx.beginPath();
    ctx.rect(-200, -100, reach + 200, 200);
    ctx.clip();
    ctx.globalAlpha *= 0.9;
    ctx.beginPath();
    tp.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    ctx.fillStyle = TAPE;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = ink;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.strokeStyle = '#7D8184';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x0 + sx * 3, CY - 3);
    ctx.lineTo(x1 - sx * 2, CY - 1);
    ctx.moveTo(x0 + sx * 3, CY + 2);
    ctx.lineTo(x1 - sx * 2, CY + 3);
    ctx.stroke();
    ctx.restore();
  }

  function drawClose(ctx, t, info, S) {
    const C = SETS.statics(S, 'laundryClose');
    const camT = Math.min(t, B.cut);
    const cam = (depth) => LOOK.camera(ctx, { t: camT, dur: B.cut, focus: FOCUS_A, push: 0.04, depth });

    ctx.save();
    cam(0.3);
    ctx.drawImage(C.back, 0, 0, 1080, 1080);
    ctx.restore();

    ctx.save();
    cam(1);
    const o = poseA(t);
    const P = FILM.cast.sam.pose(o);
    const Hm = P.helmet;
    const s = Hm.size / 170;
    FILM.cast.sam(ctx, Object.assign({ layer: 'back' }, o));
    FILM.cast.helmet(ctx, Hm);

    const zipK = seg(t, B.zip0, B.zip1, 'inOutSine');
    const rollX = lerp(-130, 130, zipK);
    const own = t < B.lower0;
    let ringPt = null;
    if (own) {
      ctx.save();
      ctx.translate(Hm.x, Hm.y);
      ctx.scale(s, s);
      emptyCrevice(ctx);
      if (t >= B.drop1) {
        const sq = Math.exp(-Math.pow((t - B.press) / 0.08, 2));
        ctx.save();
        ctx.translate(0, CY - 2);
        ctx.scale(1 + 0.06 * sq, 1 - 0.1 * sq);
        FILM.cast.diamondRing(ctx, { x: 0, y: 0, size: 26, t, tilt: 1.05, rot: 0.25, shadow: 0, sparkle: 0.5 });
        ctx.restore();
      }
      if (t >= B.zip0) {
        const ink = 6 / s;
        strip(ctx, -1, rollX, ink);
        strip(ctx, 1, rollX, ink);
      }
      ctx.restore();
    }
    FILM.cast.sam(ctx, Object.assign({ layer: 'front' }, o));

    const crev = toScreen(Hm, [0, CY - 2]);
    if (t < B.drop1) {
      const hand = P.hands[0];
      const hold = [hand[0] + 2, hand[1] - 8];
      const k = seg(t, B.drop0, B.drop1, 'inQuad');
      const x = lerp(hold[0], crev[0], k), y = lerp(hold[1], crev[1], k) - 40 * Math.sin(k * Math.PI) * (1 - k);
      FILM.cast.diamondRing(ctx, { x, y, size: lerp(40, 26 * s, k), t, tilt: lerp(0.3, 1.05, k), rot: lerp(0.6, 0.25, k), spin: (1 - k) * 0.5, shadow: 0, sparkle: 0.4, lw: 4 });
      ringPt = [x, y - 30];
    }
    const ps = (t - B.press) / 0.3;
    if (ps > 0 && ps < 1) {
      ctx.save();
      ctx.strokeStyle = `rgba(31,23,18,${0.75 * (1 - ps)})`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + 0.3;
        const r0 = 50 + 30 * ps, r1 = r0 + 18 * (1 - ps);
        ctx.beginPath();
        ctx.moveTo(crev[0] + Math.cos(a) * r0, crev[1] + Math.sin(a) * r0 * 0.5);
        ctx.lineTo(crev[0] + Math.cos(a) * r1, crev[1] + Math.sin(a) * r1 * 0.5);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (zipK > 0 && zipK < 1) {
      const rp = toScreen(Hm, [rollX, CY - 40]);
      ctx.save();
      ctx.translate(rp[0], rp[1]);
      ctx.scale(-1, 1);
      FILM.cast.ductTape(ctx, { x: 0, y: 0, size: 130, rot: -0.15, pull: 0.55, lw: 6 });
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = 'rgba(31,23,18,0.55)';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const y = rp[1] - 40 + i * 30;
        ctx.beginPath();
        ctx.moveTo(rp[0] - 90 - i * 10, y);
        ctx.lineTo(rp[0] - 170 - i * 14, y);
        ctx.stroke();
      }
      ctx.restore();
    }
    const gl = Math.max(Math.exp(-Math.pow((t - B.press - 0.12) / 0.25, 2)), Math.exp(-Math.pow((t - B.ringIn) / 0.25, 2)) * (1 - 0.6 * seg(t, B.lower0, B.lower1)));
    if (gl > 0.02) {
      const d = toScreen(Hm, [0, CY - 2 - 18]);
      LOOK.bloom(ctx, { x: d[0], y: d[1], r: 70, alpha: 0.5 * gl, mid: 0.2 * gl });
      LOOK.glint(ctx, { x: d[0], y: d[1], size: 10 + 22 * gl, alpha: gl, rot: 0.1 });
    }
    void ringPt;
    ctx.restore();

    ctx.save();
    cam(0.7);
    LOOK.drawLight(ctx, C.light, { alpha: 0.7 + 0.04 * Math.sin(t * 1.3) });
    ctx.restore();
  }

  function poseB(t) {
    const up = seg(t, B.cut, B.land - 0.04, 'outCubic');
    const down = seg(t, B.land + 0.18, B.land + 0.55, 'inOutSine');
    const amt = (0.45 + 0.55 * up) * (1 - down);
    const tw = Math.max(0, t - B.walk);
    const acc = 0.5;
    const dist = tw < acc ? (SPEED * tw * tw) / (2 * acc) : SPEED * (tw - acc / 2);
    const o = { x: JB.x + dist, y: JB.y, h: JB.h, t, age: 18, outfit: 'fatigues-camp', facing: 1, helmet: t >= B.land, blinkOffset: 1.1 };
    if (amt > 0.01) Object.assign(o, { pose: 'touchHead', poseAmt: amt });
    o.expr = t > B.land + 0.2 ? 'smileSmall' : 'neutral';
    if (dist > 0) {
      o.walk = dist / FILM.cast.sam.stride(o);
      o.walkAmt = sstep(0, 0.3, tw);
    }
    return o;
  }

  function drawMedium(ctx, t, info, S) {
    const C = SETS.statics(S, 'laundry');
    const tt = t - B.cut, dd = info.dur - B.cut;
    const cam = (depth) => LOOK.camera(ctx, { t: tt, dur: dd, focus: FOCUS_B, push: 0.03, pan: [40, 0], depth });

    ctx.save();
    cam(0.3);
    ctx.drawImage(C.back, -40, 0, 1160, 1080);
    ctx.save();
    const [bx] = SETS.GEO.LD.BULB;
    ctx.translate(bx, 0);
    ctx.rotate(0.012 * Math.sin(t * 1.7));
    ctx.translate(-bx, 0);
    ctx.drawImage(C.bulb, 0, 0, 1080, 1080);
    ctx.restore();
    ctx.restore();

    ctx.save();
    cam(1);
    const o = poseB(t);
    LOOK.castShadow(ctx, { x: o.x, y: o.y, h: o.h, k: [0.4, -0.08], S, alpha: 0.26, blob: false, draw: (g) => FILM.cast.sam(g, o) });
    LOOK.contactShadow(ctx, { x: o.x, y: o.y, h: o.h });
    FILM.cast.sam(ctx, o);
    if (t < B.land) {
      const P = FILM.cast.sam.pose(Object.assign({}, o, { helmet: true }));
      const k = seg(t, B.cut, B.land, 'inQuad');
      const hx = P.head[0] - 4, hy = P.head[1] - 6;
      FILM.cast.helmet(ctx, { x: hx, y: lerp(hy - 150, hy, k), size: 172, open: 0, rot: lerp(-0.3, -0.06, k) });
    }
    const ls = (t - B.land) / 0.3;
    if (ls > 0 && ls < 1) {
      const P = FILM.cast.sam.pose(o);
      ctx.save();
      ctx.strokeStyle = `rgba(31,23,18,${0.7 * (1 - ls)})`;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      for (const a of [-2.4, -1.57, -0.75]) {
        const r0 = 100 + 14 * ls, r1 = r0 + 14 * (1 - ls);
        ctx.beginPath();
        ctx.moveTo(P.head[0] + Math.cos(a) * r0, P.head[1] - 20 + Math.sin(a) * r0 * 0.8);
        ctx.lineTo(P.head[0] + Math.cos(a) * r1, P.head[1] - 20 + Math.sin(a) * r1 * 0.8);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();

    ctx.save();
    cam(0.7);
    LOOK.drawLight(ctx, C.light, { alpha: 0.75 + 0.05 * Math.sin(t * 1.7) });
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const dur = info.dur;
      const t = Math.max(0, Math.min(tIn, dur));
      B = keysOf(info);
      const S = info.S || FILM.S || 1;
      ctx.save();
      rig(ctx, t, dur, [
        { at: 0, f: [540, 540], z: 1.04, d: [-10, -8], p: 0.04 },
        { at: B.cutA2, f: [550, 585], z: 1.4, d: [8, -10], p: 0.05 },
        { at: B.cutA3, f: [560, 680], z: 2.25, d: [-8, -6], p: 0.06 },
        { at: B.cut, f: [462, 600], z: 1.7, d: [10, -8], p: 0.05 },
        { at: B.cutB2, f: [600, 560], z: 1.06, d: [24, 0], p: 0.03 },
      ]);
      if (t < B.cut) drawClose(ctx, t, info, S);
      else drawMedium(ctx, t, info, S);
      ctx.restore();
      const vg = ctx.createRadialGradient(560, 480, 300, 560, 480, 940);
      vg.addColorStop(0, 'rgba(12,18,22,0)');
      vg.addColorStop(1, 'rgba(10,16,20,0.55)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, 1080, 1080);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
