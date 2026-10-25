// scenes/33-scene-33.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-33';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { sstep, clamp01, lerp } = LOOK;
  const W = 1080;
  const TAU = Math.PI * 2;

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
  const PAN = 300;
  const FOCUS = [540, 620];
  const PAR = { far: 0.25, smoke: 0.45, mid: 0.55, near: 1, air: 0.7 };
  const JH = 250;
  const AGE = 19;

  let T_KNOCK = 4.26;

  const SOLDIERS = [
    [0, 330, 300, 6, 0.1],
    [3, -60, 320, -4, 0.7],
    [1, -380, 310, 10, 1.3],
    [4, -1180, 330, -6, 2.1],
  ];
  const J_V = 300;
  let J_X0 = 700 - J_V * T_KNOCK;

  function samX(t) {
    if (t <= T_KNOCK) return J_X0 + J_V * t;
    const d = t - T_KNOCK;
    const n = 24;
    let x = 0;
    for (let i = 0; i < n; i++) {
      const u = ((i + 0.5) / n) * d;
      const dip = 0.45 * (u < 0.5 ? sstep(0, 0.12, u) : 1 - sstep(0.5, 0.9, u));
      x += (1 - dip) * (d / n);
    }
    return J_X0 + J_V * T_KNOCK + J_V * x;
  }

  const HV = [-190, -640];
  const G = 2200;
  const HELMET_REST_Y = 846;
  function helmetState(t, head) {
    const d = t - T_KNOCK;
    const x0 = head[0], y0 = head[1] - 8;
    const a = 0.5 * G, b = HV[1], c = y0 - HELMET_REST_Y;
    const t1 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
    const xLand = x0 + HV[0] * t1;
    if (d <= t1) {
      return { x: x0 + HV[0] * d, y: y0 + HV[1] * d + 0.5 * G * d * d, rot: -9.5 * d, open: 0, flying: true };
    }
    const rotLand = -9.5 * t1;
    const e = d - t1;
    const tb = 0.26;
    if (e <= tb) {
      const u = e / tb;
      return { x: xLand - 26 * u, y: HELMET_REST_Y - 46 * 4 * u * (1 - u), rot: lerp(rotLand, -TAU * 2, sstep(0, 1, u)), open: 0, flying: true };
    }
    const f = e - tb;
    const k = sstep(0, 0.32, f);
    const rock = 0.12 * Math.exp(-f * 5) * Math.sin(f * 18);
    return { x: xLand - 26 - 6 * k, y: HELMET_REST_Y, rot: rock, open: 0.9 * k, flying: false };
  }

  function soldierOpts(row, t) {
    const [variant, x0, v, dy, blink] = row;
    const x = x0 + v * t;
    const o = { x, y: SET().GROUND + dy, h: JH, t, facing: 1, pose: 'sprintCrouch', poseAmt: 1, variant, blinkOffset: blink, expr: 'squint', exprAmt: 0.6 };
    o.walk = x / FILM.cast.soldier.stride(o);
    return o;
  }

  function samOpts(t) {
    const x = samX(t);
    const knocked = t >= T_KNOCK;
    const d = t - T_KNOCK;
    const flinch = knocked ? Math.exp(-d / 0.35) * sstep(0, 0.05, d) : 0;
    const o = {
      x, y: SET().GROUND, h: JH, t, facing: 1, age: AGE, outfit: 'fatigues-desert', helmet: !knocked,
      pose: 'sprintCrouch', poseAmt: 1, lean: -0.9 * flinch, expr: knocked ? 'wide' : 'squint', exprAmt: knocked ? clamp01(0.4 + flinch) : 0.6,
    };
    o.walk = x / FILM.cast.sam.stride(o);
    return o;
  }

  const KICKS = [[0.3, 520, 760, 0.8], [0.9, 880, 640, 0.7], [1.5, 200, 790, 0.9], [2.1, 1010, 900, 1], [2.6, 640, 610, 0.7],
    [3.2, 380, 880, 1], [3.7, 1100, 660, 0.8], [4.3, 560, 800, 0.9], [5.2, 960, 770, 0.9], [5.7, 470, 900, 1], [6.3, 820, 650, 0.8], [6.8, 1180, 880, 1]];

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const K = SET();
      const C = K.statics(S);
      const cam = (depth) => LOOK.camera(ctx, { t, dur: info.dur, focus: FOCUS, push: 0.025, pan: [PAN, 0], depth });

      T_KNOCK = wordT(info, 'tokhz', 0, 4.22) + 0.04;
      J_X0 = 700 - J_V * T_KNOCK;
      const wThey = wordT(info, 'tokhn', 0, 1.6);
      const wGunfire = wordT(info, 'tokhx', 0, 3.21);
      const wHelmet = wordT(info, 'tokak', 0, 4.91);
      const inner = (X, Y) => {
        const e = LIB.ease.inOutSine(t / info.dur), z = 1 + 0.025 * e;
        return [FOCUS[0] + (X - PAN * e - FOCUS[0]) * z, FOCUS[1] + (Y - FOCUS[1]) * z];
      };
      const GY = SET().GROUND;
      const lead = soldierOpts(SOLDIERS[1], t);
      const follow = (x, y, ox) => { const p = inner(x + ox, y); return [p[0], p[1]]; };
      ctx.save();
      rig(ctx, t, info.dur, [
        { at: 0, f: [540, 600], z: 1.07, d: [-14, -6], p: 0.04 },
        { at: wThey - 0.05, f: follow(lead.x, GY - 0.45 * JH, 30), z: 1.75, d: [0, -6], p: 0.05 },
        { at: wGunfire - 0.07, f: follow(samX(t), GY - 0.55 * JH, 40), z: 1.9, d: [0, -6], p: 0.05 },
        { at: T_KNOCK - 0.08, f: follow(samX(t), GY - 0.85 * JH, 10), z: 2.6, d: [0, -4], p: 0.06 },
        { at: wHelmet - 0.06, f: [560, 640], z: 1.25, d: [-16, -4], p: 0.04 },
      ], 7);

      ctx.save();
      cam(PAR.far);
      K.drawFar(ctx, C, t);
      K.farFlashes(ctx, t);
      ctx.restore();
      ctx.save();
      cam(PAR.smoke);
      K.drawSmoke(ctx, C, t, 0.55, -60);
      ctx.restore();
      ctx.save();
      cam(PAR.mid);
      K.drawMid(ctx, C, t);
      ctx.restore();

      ctx.save();
      cam(PAR.near);
      K.drawStreet(ctx, C, t);
      for (const [tk, x, y, s] of KICKS) K.puff(ctx, x, y, t - tk, { size: s });

      const runners = SOLDIERS.map((r) => ({ kind: 'soldier', o: soldierOpts(r, t) }));
      const jo = samOpts(t);
      runners.push({ kind: 'sam', o: jo });
      const drawFig = (g, r) => (r.kind === 'sam' ? FILM.cast.sam(g, r.o) : FILM.cast.soldier(g, r.o));
      const view = (x) => x > -300 && x < PAN + W + 300;
      const live = runners.filter((r) => view(r.o.x));
      for (const r of live) {
        LOOK.castShadow(ctx, { x: r.o.x, y: r.o.y, h: JH, k: K.SHADOW_K, S, alpha: 0.22, color: 'rgb(16,8,10)', draw: r.kind === 'sam' ? (g) => drawFig(g, r) : null });
        LOOK.contactShadow(ctx, { x: r.o.x, y: r.o.y, h: JH, alpha: 0.4, color: [14, 8, 10] });
      }
      live.sort((a, b) => a.o.y - b.o.y);
      for (const r of live) drawFig(ctx, r);

      if (t >= T_KNOCK) {
        const head = FILM.cast.sam.pose(Object.assign({}, jo, { t: T_KNOCK, x: samX(T_KNOCK), lean: 0, helmet: true })).head;
        const hs = helmetState(t, head);
        if (!hs.flying) LOOK.contactShadow(ctx, { x: hs.x, y: hs.y + 2, h: 120, alpha: 0.5, color: [14, 8, 10] });
        FILM.cast.helmet(ctx, { x: hs.x, y: hs.y, size: 0.33 * JH, rot: hs.rot, open: hs.open, t });
        K.spark(ctx, head[0] + 0.12 * JH, head[1] - 0.2 * JH, t - T_KNOCK + 0.04, { dir: -0.6, size: 0.9, seed: 1 });
      }
      K.drawFront(ctx, C);
      ctx.restore();

      ctx.save();
      LOOK.camera(ctx, { t, dur: info.dur, focus: FOCUS, push: 0.025, depth: PAR.air });
      K.drawAir(ctx, C, t, 0.55);
      ctx.restore();

      ctx.save();
      cam(PAR.near);
      K.embers(ctx, t, { seed: 32, count: 46, area: [-40, -40, W + PAN + 80, 1160] });
      ctx.restore();

      ctx.restore();
      K.drawGrade(ctx, C);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
