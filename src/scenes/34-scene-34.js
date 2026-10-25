// scenes/34-scene-34.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-34';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const W = 1080;

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

  const SET = () => FILM.sets.outpost;
  const PAR = { far: 0.25, smoke: 0.45, mid: 0.55, near: 1, air: 0.7 };
  const JH = 330;
  const AGE = 19;
  const SGT_H = 330 * 1.16;

  let CUT_B = 1.42;
  let CUT_C = 3.37;
  let CUT_C2 = 4.96;
  let CUT_C3 = 6.0;
  let T_SAFETY = 1.14;
  let T_RING = 2.0;
  let T_ECHO = 3.09;
  let T_CHIN = 5.01;
  let T_SHAKE = 5.78;
  let T_WENT = 6.17;
  function setKeys(info) {
    const but = wordT(info, 'tokcm', 0, 1.47);
    const his = wordT(info, 'tokbf', 0, 3.43);
    const keep = wordT(info, 'tokes', 0, 5.01);
    const down = wordT(info, 'tokci', 0, 5.53);
    const he = wordT(info, 'tokaa', 1, 6.06);
    const went = wordT(info, 'tokau', 0, 6.27);
    CUT_B = but - 0.05;
    CUT_C = his - 0.06;
    CUT_C2 = keep - 0.05;
    CUT_C3 = he - 0.06;
    T_SAFETY = wordT(info, 'tokib', 0, 1.14);
    T_RING = wordT(info, 'tokap', 0, 1.98) + 0.02;
    T_ECHO = wordT(info, 'tokak', 0, 3.04) + 0.05;
    T_CHIN = keep;
    T_SHAKE = down + 0.25;
    T_WENT = went - 0.1;
  }

  const J_X = 660;
  const SGT_X = 905;

  function samA(t, ground) {
    const breath = Math.sin(t * 5.2);
    const up = sstep(T_SAFETY - 0.3, T_SAFETY + 0.08, t);
    return {
      x: J_X, y: ground, h: JH, t, facing: -1, age: AGE, outfit: 'fatigues-desert', helmet: false,
      pose: 'touchHead', poseAmt: up, lean: 0.25 + 0.05 * breath, look: 0.3 + 0.15 * up,
    };
  }

  function samC(t, ground) {
    const base = { y: ground, h: JH, t, age: AGE, outfit: 'fatigues-desert', helmet: false, facing: t < T_WENT ? 1 : -1 };
    if (t < T_WENT) {
      const chin = sstep(T_CHIN, T_CHIN + 0.45, t);
      const sh = t - T_SHAKE;
      const env = sh > 0 ? sstep(0, 0.12, sh) * (1 - sstep(0.75, 1.05, sh)) : 0;
      const look = 0.15 + 0.42 * env * Math.sin(sh * TAU * 2.4);
      return Object.assign(base, { x: J_X, pose: 'chinUp', poseAmt: chin, look, lean: 0.05 });
    }
    const d = t - T_WENT;
    if (d < 0.2) {
      const o = Object.assign(base, { x: J_X + 6 * sstep(0, 0.2, d), pose: 'sprintCrouch', poseAmt: sstep(0, 0.2, d), walk: 0.25, lean: 0.4 * sstep(0, 0.2, d) });
      return o;
    }
    const TAKE = 600;
    if (d < 0.56) {
      const u = (d - 0.2) / 0.36;
      const x = lerp(J_X + 6, TAKE, u * u * 0.6 + u * 0.4);
      const o = Object.assign(base, { x, pose: 'sprintCrouch', poseAmt: 1, lean: 0.4 });
      o.walk = 0.25 + (J_X + 6 - x) / FILM.cast.sam.stride(o);
      return o;
    }
    const u = clamp01((d - 0.56) / 0.62);
    const x = lerp(TAKE, -220, Math.pow(u, 1.3));
    const y = ground - 330 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.95 + 0.02)), 0.6);
    return Object.assign(base, { x, y, pose: 'diveReach', poseAmt: 1, airborne: true });
  }

  function sergeantOpts(t, ground, phase) {
    if (phase === 'A') return { x: SGT_X, y: ground - 4, h: SGT_H, t, facing: -1, pose: 'crouch', look: 0.2 };
    const rate = t < T_SHAKE ? 2.2 : 2.9;
    const o = { x: SGT_X, y: ground - 4, h: SGT_H, t, facing: -1, pose: 'waveDown', crouch: 0.7, rate, look: 0.15 };
    if (t > T_WENT + 0.5) o.pose = 'shout';
    return o;
  }

  function drawFigure(ctx, S, K, kind, o) {
    const fn = kind === 'sgt' ? FILM.cast.sergeant : FILM.cast.sam;
    if (!o.airborne) {
      LOOK.castShadow(ctx, { x: o.x, y: o.y, h: o.h, k: K.SHADOW_K, S, alpha: 0.24, color: 'rgb(16,8,10)', draw: (g) => fn(g, o) });
      LOOK.contactShadow(ctx, { x: o.x, y: o.y, h: o.h, alpha: 0.45, color: [14, 8, 10] });
    } else {
      const lift = clamp01((SET().LEE_GROUND - o.y) / 360);
      LOOK.contactShadow(ctx, { x: o.x, y: SET().LEE_GROUND, h: o.h * (1 - 0.4 * lift), alpha: 0.4 * (1 - 0.7 * lift), color: [14, 8, 10] });
    }
    fn(ctx, o);
  }

  function drawLeeScene(ctx, t, info, K, C, S, phase) {
    const ground = K.LEE_GROUND;
    const t0 = phase === 'A' ? 0 : CUT_C;
    const dur = phase === 'A' ? CUT_B : info.dur - CUT_C;
    const focus = phase === 'A' ? [J_X - 40, 520] : [600, 600];
    const push = phase === 'A' ? 0.035 : 0.025;
    const cam = (depth) => LOOK.camera(ctx, { t: t - t0, dur, focus, push, depth });

    ctx.save();
    cam(PAR.far);
    K.drawFar(ctx, C, t);
    K.farFlashes(ctx, t, { spots: [[80, 600], [200, 592], [330, 606], [610, 598]] });
    ctx.restore();
    ctx.save();
    cam(PAR.smoke);
    K.drawSmoke(ctx, C, t, 0.5, -80);
    ctx.restore();
    ctx.save();
    cam(PAR.mid);
    K.drawMid(ctx, C, t);
    ctx.restore();

    ctx.save();
    cam(PAR.near);
    K.drawLee(ctx, C, t);
    const so = sergeantOpts(t, ground, phase);
    const jo = phase === 'A' ? samA(t, ground) : samC(t, ground);
    drawFigure(ctx, S, K, 'sgt', so);
    drawFigure(ctx, S, K, 'sam', jo);
    K.drawLeeFront(ctx, C);
    for (const tk of [0.5, 5.0, 6.6, 8.3]) K.puff(ctx, 120 + 70 * Math.sin(tk * 3), K.LEE_WALL.top + 4, t - tk, { size: 0.8 });
    ctx.restore();

    ctx.save();
    cam(PAR.air);
    K.drawAir(ctx, C, t, 0.55);
    ctx.restore();
    ctx.save();
    cam(PAR.near);
    K.embers(ctx, t, { seed: 33, count: 40 });
    ctx.restore();
  }

  const HELMET = { x: 560, y: 700, size: 330, open: 0.9, rot: -0.04 };
  const GLINT = [HELMET.x + 0.13 * HELMET.size, HELMET.y - 0.035 * HELMET.size];

  function drawHelmetScene(ctx, t, info, K, C) {
    const tl = t - CUT_B;
    const dur = CUT_C - CUT_B;
    const cam = (depth) => LOOK.camera(ctx, { t: tl, dur, focus: [HELMET.x, HELMET.y - 40], push: 0.04, depth });
    ctx.save();
    cam(0.6);
    K.drawClose(ctx, C, t);
    ctx.restore();
    ctx.save();
    cam(0.4);
    K.farFlashes(ctx, t, { spots: [[140, 560], [260, 548], [420, 566], [880, 552]], rate: 5 });
    K.drawSmoke(ctx, C, t, 0.35, -260);
    ctx.restore();

    ctx.save();
    cam(1);
    LOOK.contactShadow(ctx, { x: HELMET.x + 10, y: HELMET.y + 26, h: 330, rx: 170, ry: 22, alpha: 0.55, color: [14, 8, 10] });
    FILM.cast.helmet(ctx, Object.assign({ t }, HELMET));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const rg = ctx.createRadialGradient(HELMET.x + 150, HELMET.y - 80, 0, HELMET.x + 150, HELMET.y - 80, 160);
    rg.addColorStop(0, 'rgba(255,140,60,0.18)');
    rg.addColorStop(1, 'rgba(255,140,60,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(HELMET.x - 20, HELMET.y - 240, 340, 320);
    ctx.restore();
    const g1 = LOOK.flashEnv(t, T_RING, { rise: 3, fall: 20 });
    const g2 = 0.5 * LOOK.flashEnv(t, T_ECHO, { rise: 3, fall: 16 });
    const ge = Math.max(g1, g2);
    if (ge > 0.01) {
      LOOK.bloom(ctx, { x: GLINT[0], y: GLINT[1], r: 30, alpha: 0.5 * ge, mid: 0.2 * ge });
      LOOK.glint(ctx, { x: GLINT[0], y: GLINT[1], size: 6 + 8 * ge, alpha: 0.4 + 0.5 * ge, rot: 0.1 });
    }
    K.puff(ctx, 930, 640, t - 3.0, { size: 0.5 });
    ctx.restore();

    ctx.save();
    cam(PAR.air);
    K.drawAir(ctx, C, t, 0.5);
    ctx.restore();
    ctx.save();
    cam(1);
    K.embers(ctx, t, { seed: 34, count: 30 });
    ctx.restore();
  }

  const TAU = Math.PI * 2;

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const K = SET();
      const C = K.statics(S);
      setKeys(info);
      ctx.save();
      rig(ctx, t, info.dur, [
        { at: 0, f: [700, 640], z: 1.12, d: [-12, -6], p: 0.05 },
        { at: CUT_B, f: [560, 640], z: 1.06, d: [-8, -8], p: 0.06 },
        { at: CUT_C, f: [880, 640], z: 1.9, d: [-10, -6], p: 0.05 },
        { at: CUT_C2, f: [770, 650], z: 1.2, d: [-12, -4], p: 0.04 },
        { at: CUT_C3, f: [450, 600], z: 1.65, d: [-18, -4], p: 0.05 },
      ], 6);
      if (t < CUT_B) drawLeeScene(ctx, t, info, K, C, S, 'A');
      else if (t < CUT_C) drawHelmetScene(ctx, t, info, K, C);
      else drawLeeScene(ctx, t, info, K, C, S, 'C');
      ctx.restore();
      K.drawGrade(ctx, C);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
