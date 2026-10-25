// scenes/10-scene-10.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-10';
  const LIB = FILM.lib, LOOK = FILM.look;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const INK = '#1F1712';

  const beatsOf = (info) => {
    const b = info.shot.beats;
    const grab = wordAt(info, 'tokdb', b[1].t + 0.13, b[1].t);
    return {
      reach: wordAt(info, 'tokcz', b[0].t + 0.2, b[0].t),
      grab,
      jerk: grab + 0.27,
      old: wordAt(info, 'tokcf', b[1].t + 1.76, b[1].t),
      shout: wordAt(info, 'tokdg', b[2].t, b[2].t),
      end: info.dur,
    };
  };

  const reachOpts = (r) => (r <= 0.001 ? {} : { pose: 'hug', poseAmt: r, lean: 0.4 * r });

  function sweatDrop(ctx, x, y, s, a) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.bezierCurveTo(3, -7, 9, -1, 9, 5);
    ctx.bezierCurveTo(9, 11, 4, 14, 0, 14);
    ctx.bezierCurveTo(-4, 14, -9, 11, -9, 5);
    ctx.bezierCurveTo(-9, -1, -3, -7, 0, -14);
    ctx.closePath();
    ctx.fillStyle = '#BFE3F2';
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.ellipse(-3.2, 4, 2, 3.4, -0.3, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function shoutBurst(ctx, x, y, s, k, t) {
    if (k <= 0.01) return;
    const pop = k < 1 ? LIB.ease.outBack(k) : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s * pop, s * pop);
    ctx.rotate(-0.08 + 0.03 * Math.sin(t * 30));
    const n = 14;
    ctx.beginPath();
    for (let i = 0; i < 2 * n; i++) {
      const a = (i / (2 * n)) * TAU;
      const r = i % 2 ? 62 + 6 * Math.sin(i * 2.3) : 92 + 10 * Math.cos(i * 1.7);
      const px = Math.cos(a) * r * 1.35, py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = '#FFF8E8';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.font = 'bold 54px "Arial Black", Helvetica, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#B12E2A';
    ctx.fillText('HEY!', 0, 4);
    ctx.restore();
  }

  function strikeLines(ctx, x, y, s, k) {
    if (k <= 0.01) return;
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    ctx.lineWidth = 5 * s;
    ctx.globalAlpha = k;
    for (const a of [-2.5, -2.85, -3.2]) {
      const r0 = 26 * s, r1 = 58 * s;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
      ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      ctx.stroke();
    }
    ctx.restore();
  }

  const SPARKS = (() => {
    const r = LIB.rng(sd('sparks'));
    const out = [];
    for (let i = 0; i < 9; i++) out.push([r.range(0, TAU), r.range(30, 110), r.range(0.3, 0.8), r.range(2, 4)]);
    return out;
  })();
  function visionGlow(ctx, p, k, t) {
    if (k <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 190);
    g.addColorStop(0, `rgba(210,236,255,${0.7 * k})`);
    g.addColorStop(0.5, `rgba(170,210,250,${0.3 * k})`);
    g.addColorStop(1, 'rgba(170,210,250,0)');
    ctx.fillStyle = g;
    ctx.fillRect(p[0] - 190, p[1] - 190, 380, 380);
    for (const [a0, r, w, sz] of SPARKS) {
      const a = a0 + t * w;
      const x = p[0] + Math.cos(a) * r, y = p[1] + Math.sin(a) * r * 0.8;
      ctx.fillStyle = `rgba(236,248,255,${k * (0.5 + 0.5 * Math.sin(t * 3 + a0 * 5))})`;
      ctx.beginPath();
      ctx.moveTo(x, y - sz * 2);
      ctx.lineTo(x + sz * 0.6, y);
      ctx.lineTo(x, y + sz * 2);
      ctx.lineTo(x - sz * 0.6, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function wordAt(info, token, fb, from) {
    const st = info.shot.start || 0, lo = from == null ? -0.05 : from;
    const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    const want = norm(token);
    for (const c of info.shot.captions || []) {
      for (const w of c.words || []) if (w[0] - st >= lo && norm(w[1]) === want) return w[0] - st;
    }
    return fb;
  }

  function setupAt(cuts, t) {
    let i = 0;
    while (i + 1 < cuts.length && t >= cuts[i + 1].at) i++;
    return i;
  }

  function frame(ctx, t, cuts) {
    const i = setupAt(cuts, t), c = cuts[i], u = t - c.at;
    const z = c.z * (1 + (c.push == null ? 0.02 : c.push) * u);
    const hw = 540 / Math.max(1, z);
    const cx = (typeof c.x === 'function' ? c.x(t) : c.x) + (c.dx || 0) * u;
    const cy = (typeof c.y === 'function' ? c.y(t) : c.y) + (c.dy || 0) * u;
    const x = Math.min(1080 - hw, Math.max(hw, cx)), y = Math.min(1080 - hw, Math.max(hw, cy));
    ctx.translate(540, 540);
    ctx.scale(z, z);
    ctx.translate(-x, -y);
    return i;
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const ST = FILM.sets.store;
      const SM = FILM.cast.salesman, J = FILM.cast.sam;
      const C = ST.statics(S, { angle: 'two', tod: 'day' });
      const V = C.V;
      const B = beatsOf(info);

      const sx = V.staffX[0] + 70;
      const jk = clamp01((t - B.jerk) / 0.75);
      const toJerk = sstep(B.jerk - 0.05, B.jerk + 0.08, t);
      const pose = { jerkAway: 1 };
      const shout = sstep(B.shout - 0.04, B.shout + 0.12, t);
      const so = {
        x: sx, y: V.floor, h: V.JH * SM.HK, t, facing: -1, pose, jerk: t < B.jerk ? 0 : jk,
        expr: shout > 0 ? { scowl: 1, surprised: 0.35 * (1 - shout) } : t >= B.grab ? { surprised: 0.8 * (1 - sstep(B.jerk + 0.4, B.jerk + 1, t)), scowl: sstep(B.jerk + 0.3, B.jerk + 0.9, t) } : 'neutral',
        counterY: V.counterY, light: V.light,
      };
      const sq = SM.pose(so);

      const reachIn = LIB.ease.inOutSine((t - B.reach) / (B.grab - B.reach));
      const retract = sstep(B.jerk + 0.5, B.jerk + 1.3, t);
      const recoil = sstep(B.shout, B.shout + 0.2, t);
      const r = reachIn * (1 - 0.75 * retract);
      const JHh = V.JH * 0.96;
      const handAt = (rr) => J.pose(Object.assign({ x: 0, y: 0, h: JHh, t, facing: 1, age: 14, outfit: 'school' }, reachOpts(rr))).hands[0];
      const hq = SM.pose(Object.assign({}, so, { jerk: 0 }));
      const lunge = 34 * LIB.ease.outCubic((t - B.grab + 0.12) / 0.2) * (1 - 0.6 * sstep(B.jerk + 0.4, B.jerk + 1.2, t));
      const jx = sx - 345 + lunge;
      const jy = V.floor + 8;
      const jo = Object.assign({
        x: jx - 18 * recoil, y: jy, h: JHh, t, facing: 1, age: 14, outfit: 'school', look: 0.4, blinkOffset: 1.1,
        expr: t < B.grab ? 'stare' : 'wide', exprAmt: t < B.grab ? sstep(0, 0.6, t) : 1,
      }, reachOpts(r));
      if (recoil > 0) jo.lean = (jo.lean || 0) - 0.45 * recoil;
      const jq = J.pose(jo);

      const snatch = sstep(B.grab - 0.04, B.grab + 0.1, t);
      const pull = snatch;
      const jh = [Math.max(jq.hands[0][0], jq.hands[1][0]) + 6, (jq.hands[0][1] + jq.hands[1][1]) / 2 + 8];
      const rp = [lerp(sq.ring[0], jh[0], pull), lerp(sq.ring[1] - 8, jh[1], pull)];
      const zipping = snatch > 0.02 && snatch < 0.98;

      const CUTS = [
        { at: 0, z: 1, x: 540, y: 540, push: 0.025, dx: 3 },
        { at: B.grab - 0.08, z: 2, x: hq.ring[0] - 110, y: hq.ring[1] + 110, push: 0.04, dx: -6 },
        { at: B.old, z: 1.9, x: () => sq.head[0] - 40, y: () => sq.head[1] + 70, push: 0.04 },
        { at: B.shout - 0.04, z: 1.12, x: 560, y: 520, push: 0.02 },
      ];
      ctx.save();
      frame(ctx, t, CUTS);

      const jolt = shout > 0 ? Math.exp(-(t - B.shout) * 7) * 9 : 0;
      const cam = (depth) => {
        LOOK.camera(ctx, { t, dur: info.dur, focus: hq.ring, push: 0.03, depth });
        if (jolt > 0.05) ctx.translate(jolt * Math.sin(t * 90) * depth, jolt * 0.6 * Math.cos(t * 77) * depth);
      };

      ctx.save();
      cam(ST.PAR.back);
      ST.drawBack(ctx, C, { t });
      ctx.restore();

      ctx.save();
      cam(0.92);
      SM(ctx, so);
      ST.drawCounter(ctx, C, { t });
      ctx.restore();

      ctx.save();
      cam(1);
      LOOK.contactShadow(ctx, { x: jo.x, y: jo.y, h: jo.h, alpha: 0.32 });
      J(ctx, jo);
      const lw = 2;
      const vision = (1 - sstep(B.grab - 0.15, B.grab + 0.05, t)) * sstep(0, 0.5, t);
      visionGlow(ctx, rp, vision * (0.75 + 0.25 * Math.sin(t * 2.2)), t);
      if (zipping) {
        const from = [sq.ring[0], sq.ring[1] - 8];
        ctx.save();
        ctx.strokeStyle = 'rgba(255,240,200,0.8)';
        ctx.lineCap = 'round';
        for (const [o, w] of [[-10, 3], [0, 5], [10, 3]]) {
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(lerp(from[0], rp[0], 0.25), lerp(from[1], rp[1], 0.25) + o);
          ctx.lineTo(rp[0], rp[1] + o);
          ctx.stroke();
        }
        ctx.restore();
      }
      const rg = FILM.cast.diamondRing(ctx, { x: rp[0], y: rp[1] + 4, size: 46, rot: 0.6 + 0.3 * Math.sin(t * 0.9), tilt: -0.05, t, light: -1.1, sparkle: 0.25 + 0.4 * vision, shadow: 0, lw });
      if (rg && rg.glint) LOOK.bloom(ctx, { x: rg.glint[0], y: rg.glint[1], r: 60, alpha: 0.25, mid: 0.1 });
      const hs = jo.h / 330;
      const ap = sstep(B.shout + 0.1, B.shout + 0.25, t);
      sweatDrop(ctx, jq.head[0] - 54 * hs, jq.head[1] - 48 * hs + 40 * hs * LIB.ease.inQuad((t - B.shout - 0.3) / 1.2), hs * 0.9, ap);
      const mouth = [sq.head[0] - 40 * (so.h / 412.5), sq.head[1] + 30 * (so.h / 412.5)];
      strikeLines(ctx, mouth[0], mouth[1], so.h / 412.5, shout);
      shoutBurst(ctx, sq.head[0] - 60, sq.top[1] - 95, 0.85, clamp01((t - B.shout) / 0.16), t);
      ctx.restore();

      ctx.save();
      cam(ST.PAR.air);
      ST.drawLight(ctx, C, { t });
      ctx.restore();
      ctx.restore();

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
