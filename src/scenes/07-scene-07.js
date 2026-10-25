// scenes/07-scene-07.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-07';
  const LIB = FILM.lib, LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const INK = '#1F1712';

  const beatsOf = (info) => {
    const b = info.shot.beats;
    return {
      in: wordAt(info, 'tokcd', b[0].t + 1.82, b[0].t),
      cut: b[1].t,
      nose: wordAt(info, 'tokcj', b[1].t + 2.25, b[1].t),
      ring: b[2].t,
      boy: wordAt(info, 'tokae', b[2].t + 1.52, b[2].t),
    };
  };

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
      const B = beatsOf(info);
      const SM = FILM.cast.salesman, J = FILM.cast.sam;
      const AIM = { sm: [600, 380], jo: [180, 860] };
      const CUTS = [
        { at: 0, z: 1, x: 540, y: 540, push: 0.02, dx: -4 },
        { at: B.cut, z: 1, x: 540, y: 540, push: 0.02 },
        { at: B.ring, z: 1.7, x: () => AIM.sm[0] - 20, y: () => AIM.sm[1] - 10, push: 0.04 },
        { at: B.boy, z: 2.1, x: () => AIM.jo[0] + 90, y: () => AIM.jo[1] - 60, push: 0.04, dx: 6 },
      ];

      if (t < B.cut) {
        ctx.save();
        frame(ctx, t, CUTS);
        const C = ST.statics(S, { angle: 'wide', tod: 'day' });
        const V = C.V;
        const dur = B.cut;
        const cam = (depth) => LOOK.camera(ctx, { t, dur, focus: [300, 600], push: 0.03, depth });
        const nudge = 0.06 * Math.sin(Math.PI * sstep(B.in - 0.3, B.in - 0.05, t)) * (t < B.in ? 1 : 0);
        const door = nudge + 0.8 * LIB.ease.outBack((t - B.in) / 0.45) * (t >= B.in ? 1 : 0) - 0.25 * sstep(B.in + 1.0, B.cut + 0.6, t);
        const bell = t >= B.in + 0.08 ? t - (B.in + 0.08) : null;

        ctx.save();
        cam(ST.PAR.back);
        ST.drawBack(ctx, C, { t, door: clamp01(door), bell });
        ctx.restore();

        const look = sstep(B.in + 0.15, B.in + 0.35, t) * (1 - sstep(B.in + 0.9, B.in + 1.1, t));
        const so = { x: V.staffX[0], y: V.floor, h: V.JH * SM.HK, t, facing: -1, pose: 'barelyLook', flick: look, expr: 'scowl', counterY: V.counterY, light: V.light };
        ctx.save();
        cam(0.92);
        SM(ctx, so);
        ST.drawCounter(ctx, C, { t });
        ctx.restore();

        if (t >= B.in + 0.12) {
          const k = clamp01((t - (B.in + 0.12)) / 0.95);
          const e = LIB.ease.inOutSine(k);
          const x0 = 168, x1 = 268;
          const x = lerp(x0, x1, e);
          const h = lerp(250, 268, e);
          const y = lerp(V.floor + 2, V.floor + 22, e);
          const stride = J.stride ? J.stride({ h, age: 14 }) : 2 * 0.38 * h;
          const jo = { x, y, h, t, facing: 1, age: 14, outfit: 'school', walk: (x - x0) / stride, walkAmt: 1 - sstep(0.8, 1, k), lean: 0.1, look: 0.15 * sstep(0.6, 1, k) };
          ctx.save();
          cam(1);
          LOOK.contactShadow(ctx, { x, y, h, alpha: 0.3 });
          J(ctx, jo);
          ctx.restore();
        }

        ctx.save();
        cam(ST.PAR.air);
        ST.drawLight(ctx, C, { t });
        ctx.restore();
        ctx.restore();
      } else {
        const C = ST.statics(S, { angle: 'low', tod: 'day' });
        const V = C.V;
        const tl = t - B.cut, dur = info.dur - B.cut;
        const cam = (depth) => LOOK.camera(ctx, { t: tl, dur, focus: [600, 380], push: 0.035, depth });
        const lean = sstep(B.nose - 0.9, B.nose + 0.2, t);
        const sneer = sstep(B.ring - 0.1, B.ring + 0.3, t) * (1 - 0.5 * sstep(B.boy + 0.9, B.boy + 1.3, t));
        const shake = sstep(B.boy - 0.05, B.boy + 0.2, t) * (1 - sstep(B.boy + 0.8, B.boy + 1.2, t));
        const pose = { stand: 1 - lean, leanGlare: lean };
        if (shake > 0.01) pose.headShake = shake;
        const so = {
          x: V.staffX[0], y: V.floor, h: V.JH * SM.HK, t, facing: -1, pose, shake: 0.7,
          expr: { scowl: 1 - 0.6 * sneer, sneer }, counterY: V.counterY, light: V.light,
        };
        const wide = sstep(B.ring + 0.1, B.ring + 0.35, t);
        const jo = { x: V.custX, y: V.custFloor, h: V.custH, t, facing: 1, age: 14, outfit: 'school', look: 0.75, lean: -0.1, expr: wide > 0.01 ? 'wide' : 'neutral', exprAmt: wide };
        AIM.sm = SM.pose(so).head;
        AIM.jo = J.pose(jo).head;

        ctx.save();
        frame(ctx, t, CUTS);

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
        LOOK.contactShadow(ctx, { x: jo.x, y: jo.y, h: jo.h, alpha: 0.3 });
        J(ctx, jo);
        const q = J.pose(jo);
        const sd0 = B.boy + 0.05;
        const ap = sstep(sd0, sd0 + 0.18, t);
        const slide = LIB.ease.inQuad((t - sd0 - 0.3) / 2.2);
        const hs = jo.h / 330;
        sweatDrop(ctx, q.head[0] - 52 * hs, q.head[1] - 46 * hs + 60 * hs * slide, hs * (0.8 + 0.2 * ap), ap);
        ctx.restore();

        ctx.save();
        cam(ST.PAR.air);
        ST.drawLight(ctx, C, { t });
        ctx.restore();
        ctx.restore();
      }

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
