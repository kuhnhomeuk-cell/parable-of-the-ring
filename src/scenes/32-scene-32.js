// scenes/32-scene-32.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-32';
  const LIB = FILM.lib, LOOK = FILM.look;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const W = 1080, H = 1080;
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

  const PAR = { far: 0.25, mist: 0.4, ground: 0.6, near: 1, air: 0.7 };
  const FOCUS = [640, 470];
  const PUSH = 0.03;

  const PILOT_HEAD = [0, 408];
  function keysOf(info) {
    const landed = wordT(info, 'tokho', 0, 1.0);
    const fire = wordT(info, 'tokhq', 0, 1.57);
    const welcome = wordT(info, 'tokhr', 0, 2.05);
    const front = wordT(info, 'tokhs', 0, 2.78);
    return {
      landed, fire, welcome, front,
      lean: welcome - 0.4,
      shout: welcome,
      hit: front + 0.1,
    };
  }

  const BURSTS = [[118, -0.04, 1.0], [470, 0.12, 0.8], [40, 0.27, 1.2], [560, 'fire', 1.1], [196, 0.57, 0.9], [610, 0.82, 1.0]];

  const MEN = [[-0.62, 3, 10, 1.0], [-0.47, 1, -12, 0.98], [-0.31, 5, 16, 1.02], [-0.17, 0, -6, 0.99], [-0.02, 4, 8, 1.0], [0.13, 2, -14, 1.02], [0.29, 3, 4, 0.98], [0.44, 5, -4, 1.01], [0.6, 1, 12, 1.0], [0.76, 0, -10, 0.99], [0.91, 2, 6, 1.0]];
  const MEN_H = 170;
  const RUN_V = 175;
  const STEP_T = 0.5;

  function puff(ctx, x, y, r, c, a) {
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }

  function burst(ctx, x, y, a, size, seed) {
    if (a < 0) return;
    const r = LIB.rng(seed);
    const flash = Math.exp(-a / 0.12);
    if (flash > 0.02) {
      const g = ctx.createRadialGradient(x, y - 6 * size, 0, x, y - 6 * size, 40 * size);
      g.addColorStop(0, `rgba(255,236,190,${0.95 * flash})`);
      g.addColorStop(0.3, `rgba(255,170,90,${0.6 * flash})`);
      g.addColorStop(1, 'rgba(255,170,90,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 40 * size, y - 46 * size, 80 * size, 80 * size);
    }
    const fade = clamp01(1 - a / 3.2);
    if (fade <= 0) return;
    for (let i = 0; i < 6; i++) {
      const ox = r.range(-10, 10) * size + 6 * a * size, rise = (8 + 26 * a) * size * (0.5 + r());
      const rad = (6 + 13 * Math.sqrt(a)) * size * (0.6 + 0.6 * r());
      const shadeK = r();
      puff(ctx, x + ox, y - rise, rad, [lerp(150, 196, shadeK), lerp(132, 176, shadeK), lerp(110, 150, shadeK)], 0.55 * fade);
    }
    const root = Math.exp(-a / 0.5);
    if (root > 0.03) puff(ctx, x, y - 3 * size, 7 * size, [255, 150, 70], 0.7 * root);
  }

  function farPlane(ctx, x, y, s, tilt, burnt) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.scale(s, s);
    const body = burnt > 0 ? `rgb(${lerp(178, 90, burnt)},${lerp(172, 80, burnt)},${lerp(158, 72, burnt)})` : 'rgb(178,172,158)';
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(-60, -10);
    ctx.quadraticCurveTo(-64, -22, -48, -24);
    ctx.lineTo(40, -24);
    ctx.lineTo(62, -40);
    ctx.lineTo(70, -40);
    ctx.lineTo(64, -16);
    ctx.lineTo(48, -8);
    ctx.lineTo(-52, -6);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(50, -24);
    ctx.lineTo(60, -62);
    ctx.lineTo(70, -62);
    ctx.lineTo(68, -36);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-26, -27, 50, 4);
    ctx.fillStyle = 'rgba(120,112,100,0.8)';
    for (const ex of [-18, 6]) ctx.fillRect(ex, -24, 9, 6);
    ctx.fillStyle = 'rgb(90,86,82)';
    ctx.fillRect(-44, -6, 3, 6);
    ctx.fillRect(4, -6, 8, 6);
    ctx.restore();
  }

  function planeFire(ctx, x, y, a, t) {
    if (a < 0) return;
    const flash = Math.exp(-a / 0.14);
    if (flash > 0.02) LOOK.bloom(ctx, { x, y: y - 14, r: 90, alpha: 0.9 * flash, mid: 0.35 * flash });
    const n = 26;
    for (let i = 0; i < n; i++) {
      const born = i * 0.08;
      const age = a - born;
      if (age <= 0) continue;
      const lift = 70 * age + 10 * age * age;
      const px = x + 4 + 16 * age + 4 * Math.sin(i * 1.7 + t * 1.3);
      const py = y - 18 - lift;
      const rad = 9 + 14 * age;
      const k = clamp01(lift / 200);
      const c = [lerp(54, 120, k), lerp(48, 112, k), lerp(46, 104, k)];
      puff(ctx, px, py, rad, c, 0.75 * clamp01(age * 4) * (1 - 0.35 * k));
    }
    const grow = clamp01(a / 0.35);
    ctx.fillStyle = `rgba(214,84,36,${0.9 * grow})`;
    ctx.beginPath();
    ctx.ellipse(x, y - 14, 34 * grow + 2, 11 * grow + 1, 0, 0, TAU);
    ctx.fill();
    for (let i = 0; i < 7; i++) {
      const fx = x - 30 + i * 10;
      const fl = 0.6 + 0.4 * Math.sin(t * 17 + i * 2.3) * Math.sin(t * 11 + i);
      const fh = grow * (16 + 14 * fl) * (1 - Math.abs(i - 3) / 5);
      ctx.fillStyle = 'rgba(232,96,40,0.9)';
      ctx.beginPath();
      ctx.ellipse(fx, y - 14 - fh * 0.4, 7.5, fh * 0.75 + 2, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,204,96,0.95)';
      ctx.beginPath();
      ctx.ellipse(fx + 0.5, y - 12 - fh * 0.25, 4, fh * 0.42 + 1, 0, 0, TAU);
      ctx.fill();
    }
    const gl = ctx.createRadialGradient(x, y, 0, x, y, 60);
    gl.addColorStop(0, `rgba(255,160,80,${0.35 * grow})`);
    gl.addColorStop(1, 'rgba(255,160,80,0)');
    ctx.fillStyle = gl;
    ctx.fillRect(x - 60, y - 60, 120, 120);
  }

  function pilotOpts(t, K) {
    const lean = LIB.ease.outCubic(clamp01((t - K.lean) / (K.shout - K.lean)));
    const shake = t > K.shout ? 0.6 * Math.sin((t - K.shout) * 26) * Math.exp(-(t - K.shout) / 0.6) : 0;
    const o = {
        x: lerp(800, 680, lean) + shake, y: 0, h: 250, t, facing: -1, variant: 1, helmet: false,
        pose: 'callOut', expr: 'shout', exprAmt: sstep(0.3, 1, lean), walk: 0.31, walkAmt: 0, lean: 0.25 * lean, blinkOffset: 2.2,
        cup: 0,
    };
    const hp = FILM.cast.soldier.pose(o).head;
    o.y = lerp(PILOT_HEAD[1], PILOT_HEAD[1] - 6, lean) - hp[1];
    return { lean, o };
  }

  function flightHelmet(ctx, o) {
    const p = FILM.cast.soldier.pose(o);
    const rh = FILM.cast.sam.height(o);
    const r = 0.19 * rh;
    const [hx, hy] = p.head;
    const f = o.facing;
    const lw = Math.max(2.5, 6 * (rh / 370));
    ctx.save();
    ctx.translate(hx, hy);
    ctx.scale(f, 1);
    ctx.lineJoin = 'round';
    const shell = () => {
      ctx.beginPath();
      ctx.moveTo(-r * 1.04, r * 0.22);
      ctx.bezierCurveTo(-r * 1.12, -r * 0.9, r * 0.9, -r * 1.26, r * 1.06, -r * 0.1);
      ctx.lineTo(r * 1.0, r * 0.06);
      ctx.quadraticCurveTo(r * 0.5, -r * 0.24, -r * 0.2, -r * 0.22);
      ctx.quadraticCurveTo(-r * 0.6, -r * 0.1, -r * 0.7, r * 0.5);
      ctx.lineTo(-r * 1.0, r * 0.5);
      ctx.closePath();
    };
    shell();
    ctx.fillStyle = 'rgb(112,116,86)';
    ctx.fill();
    ctx.save();
    shell();
    ctx.clip();
    ctx.fillStyle = 'rgba(56,58,40,0.45)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.5, r * 0.2, r * 0.9, r * 0.6, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(232,236,200,0.4)';
    ctx.beginPath();
    ctx.ellipse(r * 0.35, -r * 0.7, r * 0.5, r * 0.18, -0.3, 0, TAU);
    ctx.fill();
    ctx.restore();
    shell();
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, -r * 0.62);
    ctx.quadraticCurveTo(r * 0.5, -r * 0.92, r * 1.02, -r * 0.42);
    ctx.lineTo(r * 1.02, -r * 0.2);
    ctx.quadraticCurveTo(r * 0.5, -r * 0.6, -r * 0.16, -r * 0.36);
    ctx.closePath();
    ctx.fillStyle = 'rgb(58,52,46)';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-r * 0.62, r * 0.22, r * 0.26, r * 0.32, 0, 0, TAU);
    ctx.fillStyle = 'rgb(96,100,74)';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, r * 0.46);
    ctx.quadraticCurveTo(-r * 0.1, r * 0.95, r * 0.5, r * 0.8);
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw * 0.9;
    ctx.stroke();
    ctx.restore();
    return { head: p.head, r, hands: p.hands };
  }

  function shoutLines(ctx, head, r, f, k, t) {
    if (k <= 0.01) return;
    const pop = LIB.ease.outBack ? LIB.ease.outBack(clamp01(k)) : k;
    const ox = head[0] + f * r * 1.45, oy = head[1] + r * 0.32;
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(f, 1);
    const wob = 1 + 0.06 * Math.sin(t * 30);
    for (const [ang, len] of [[-0.75, 0.9], [0, 1.1], [0.75, 0.85]]) {
      const L = r * 0.95 * len * pop * wob;
      ctx.save();
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(r * 0.12, -r * 0.05);
      ctx.lineTo(r * 0.12 + L, -r * 0.13);
      ctx.lineTo(r * 0.12 + L, r * 0.13);
      ctx.lineTo(r * 0.12, r * 0.05);
      ctx.closePath();
      ctx.fillStyle = 'rgb(255,250,236)';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  function manAt(t, t0, R, dy, vk) {
    const a = t - t0;
    if (a < 0) return null;
    const top = R.STEPS[0], foot = R.STEPS[R.STEPS.length - 1];
    const x0 = (R.DOOR.x0 + R.DOOR.x1) / 2 - 8;
    let x, y;
    if (a < STEP_T) {
      const k = a / STEP_T;
      x = lerp(x0, foot[0] + 30, k);
      y = lerp(top[1] + 4, R.GROUND + dy, LIB.ease.inOutSine(k));
    } else {
      x = foot[0] + 30 - RUN_V * vk * (a - STEP_T);
      y = R.GROUND + dy;
    }
    if (x < -120) return null;
    return { x, y, dist: a * RUN_V * vk, down: a >= STEP_T };
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const D = info.dur;
      const S = info.S || FILM.S || 1;
      const R = FILM.sets.runway;
      const C = R.statics(S);
      const cam = (depth) => LOOK.camera(ctx, { t, dur: D, focus: FOCUS, push: PUSH, depth });
      const K = keysOf(info);

      ctx.save();
      rig(ctx, t, D, [
        { at: 0, f: [560, 560], z: 1.08, d: [-16, -6], p: 0.04 },
        { at: K.landed - 0.06, f: [500, 735], z: 1.65, d: [-22, -4], p: 0.05 },
        { at: K.welcome - 0.06, f: [700, 430], z: 2.6, d: [-8, -6], p: 0.06 },
        { at: K.front + 0.04, f: [470, 560], z: 1.2, d: [-14, -4], p: 0.04 },
      ], 6);

      ctx.save();
      cam(PAR.far);
      ctx.drawImage(C.far, 0, 0, W, H);
      R.shimmer(ctx, C, t);
      BURSTS.forEach(([x, f, s], i) => burst(ctx, x, R.HORIZON + 2, t - (f === 'fire' ? K.fire - 0.04 : f * D), s, sd('burst', i)));
      ctx.restore();

      ctx.save();
      cam(PAR.mist);
      LOOK.drawMist(ctx, C.mist, { x: -120 + 18 * (t / D), alpha: 0.8 });
      ctx.restore();

      ctx.save();
      cam(PAR.ground);
      ctx.drawImage(C.ground, 0, 0, W, H);
      const tHit = K.hit;
      const roll = t < tHit ? t : tHit + 0.3 * (1 - Math.exp(-(t - tHit) / 0.3));
      const fp = [R.FAR_PLANE[0] - 14 * roll, R.FAR_PLANE[1] - 0.6 * roll];
      const after = Math.max(0, t - tHit);
      const tilt = -0.12 * sstep(0, 0.6, after);
      farPlane(ctx, fp[0], fp[1], 0.62 - 0.012 * roll, tilt, clamp01(after / 1.2));
      planeFire(ctx, fp[0] + 4, fp[1], t - tHit, t);
      ctx.fillStyle = 'rgba(246,240,226,0.14)';
      ctx.fillRect(fp[0] - 140, fp[1] - 340, 320, 350);
      ctx.restore();

      ctx.save();
      cam(PAR.near);
      const P = pilotOpts(t, K);
      ctx.drawImage(C.plane, 0, 0, W, H);
      const Wn = R.WINDOW;
      ctx.save();
      ctx.beginPath();
      ctx.rect(Wn.x0, Wn.y0, Wn.x1 - Wn.x0, Wn.y1 - Wn.y0);
      if (P.lean > 0.01) {
        ctx.rect(Wn.x0 - 200, 160, 200 + 4, Wn.y1 + 2 - 160);
        ctx.rect(Wn.x0 - 200, 160, Wn.x1 - Wn.x0 + 200, Wn.y0 - 160 + 2);
      }
      ctx.clip();
      FILM.cast.soldier(ctx, P.o);
      flightHelmet(ctx, P.o);
      ctx.restore();
      const ph = FILM.cast.soldier.pose(P.o).head;
      const pr = 0.19 * FILM.cast.sam.height(P.o);
      shoutLines(ctx, ph, pr, -1, clamp01((t - K.shout + 0.04) / 0.16) * (1 - sstep(D - 0.9, D, t) * 0.3), t);

      const men = [];
      MEN.forEach(([f, v, dy, vk], i) => {
        const m = manAt(t, f * D, R, dy, vk);
        if (m) men.push(Object.assign(m, { v, i, dy }));
      });
      men.sort((a, b) => a.y - b.y || b.x - a.x);
      for (const m of men) {
        const o = { x: m.x, y: m.y, h: MEN_H * (1 + m.dy / 400), t, facing: -1, variant: m.v, pose: 'sprintCrouch', blinkOffset: m.i * 0.7 };
        o.walk = m.dist / FILM.cast.soldier.stride(o);
        LOOK.contactShadow(ctx, { x: m.x, y: m.down ? m.y : R.GROUND, h: MEN_H, dx: 8, alpha: m.down ? 0.32 : 0.16 });
        FILM.cast.soldier(ctx, o);
      }
      ctx.restore();

      ctx.save();
      cam(PAR.air);
      LOOK.drawLight(ctx, C.light, { alpha: 0.85 + 0.05 * Math.sin(t * 1.3) });
      ctx.restore();
      ctx.restore();

      LOOK.exposure(ctx, 0.35 * LOOK.flashEnv(t, tHit));

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
