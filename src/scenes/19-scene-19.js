// scenes/19-scene-19.js: procedural scene. Shot timing comes from src/timeline.js.
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

  const ID = 'scene-19';
  const LIB = FILM.lib, LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const INK = '#1F1712';

  const beatsOf = (info) => {
    const b = info.shot.beats;
    const h = b[0].t;
    const g = b[1].t;
    const w = (word, fb) => wordT(info, word, 0, fb);
    return {
      boss: h, salesman: w('tokcg', h + 1.45), absurd: w('tokey', h + 2.9), but: g, gave: w('tokez', g + 0.75),
      word: w('tokfa', g + 1.4), pay: w('tokfc', g + 2.2) - 0.25, payCut: w('tokfc', g + 2.2), grad: w('tokfe', g + 3.8), end: info.dur,
    };
  };

  function contractTwo(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = 'rgba(40,20,16,0.22)';
    ctx.beginPath();
    ctx.moveTo(x - 56, y + 3);
    ctx.lineTo(x + 66, y + 3);
    ctx.lineTo(x + 58, y - 12);
    ctx.lineTo(x - 50, y - 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FBF5E6';
    ctx.beginPath();
    ctx.moveTo(x - 58, y);
    ctx.lineTo(x + 62, y);
    ctx.lineTo(x + 54, y - 16);
    ctx.lineTo(x - 50, y - 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(80,70,60,0.45)';
    for (let i = 0; i < 3; i++) ctx.fillRect(x - 40 + i * 3, y - 13 + i * 4, 70 - i * 10, 1.4);
    ctx.fillStyle = '#B12E2A';
    ctx.fillRect(x + 8, y - 5, 26, 2.4);
    ctx.restore();
  }

  function shakeStrokes(ctx, x, y, s, k, t) {
    if (k <= 0.01) return;
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    ctx.globalAlpha = k;
    ctx.lineWidth = 4.2 * s;
    const ph = Math.sin(TAU * 2.2 * t);
    for (const side of [-1, 1]) {
      const a = (side > 0 ? 0 : Math.PI);
      for (let i = -1; i <= 1; i++) {
        const r0 = 92 * s, r1 = 118 * s + 6 * s * side * ph;
        const ang = a + i * 0.32 * side;
        ctx.beginPath();
        ctx.arc(x, y, (r0 + r1) / 2, ang - 0.12, ang + 0.12);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const ST = FILM.sets.store;
      const SM = FILM.cast.salesman, K = FILM.cast.nell, J = FILM.cast.sam;
      const C = ST.statics(S, { angle: 'two', tod: 'day' });
      const V = C.V;
      const B = beatsOf(info);

      const reach = LIB.ease.inOutSine((t - B.pay) / 0.5);
      const pumpEnv = sstep(B.pay + 0.4, B.pay + 0.6, t) * (1 - sstep(B.grad - 0.2, B.grad + 0.2, t));
      const pump = 6 * Math.sin(TAU * 2.1 * (t - B.pay - 0.4)) * pumpEnv;

      const shakeK = sstep(B.absurd - 0.08, B.absurd + 0.1, t) * (1 - sstep(B.absurd + 1.1, B.absurd + 1.5, t));
      const sx = 902;
      const sceptic = sstep(B.word, B.word + 0.6, t);
      const so = {
        x: sx, y: V.floor, h: V.JH * SM.HK, t: t - B.absurd, facing: -1, warmth: 0,
        pose: { armsFolded: 1, headShake: shakeK }, shake: 0.9 * shakeK,
        look: lerp(-0.1, -0.3, sstep(B.pay, B.pay + 0.5, t)),
        expr: { scowl: 1 - 0.7 * sceptic, sneer: 0.85 * sceptic },
        counterY: V.counterY, light: V.light,
      };
      const sq = SM.pose(so);

      const jx = 470, jy = V.floor + 8, jh = V.JH * 0.96;
      const chin = LIB.ease.inOutSine((t - (B.gave - 0.15)) / 0.4) * (1 - LIB.ease.inOutSine((t - (B.pay - 0.3)) / 0.3));
      const fall = sstep(B.absurd + 0.2, B.absurd + 0.6, t) * (1 - sstep(B.gave - 0.15, B.gave + 0.25, t));
      const jo = {
        x: jx, y: jy, h: jh, t, facing: 1, age: 15, outfit: 'casual', blinkOffset: 0.4,
        look: lerp(0.15, -0.12, fall) - 0.1 * reach,
        expr: fall > 0.02 ? 'disappointed' : 'wide', exprAmt: fall > 0.02 ? fall : 0.3 * (1 - sstep(B.gave - 0.2, B.gave, t)),
      };
      if (reach > 0.001) {
        jo.pose = 'hug';
        jo.poseAmt = reach * (1 - 0.06 * (0.5 + pump / 12));
      } else if (chin > 0.001) {
        jo.pose = 'chinUp';
        jo.poseAmt = chin;
      }
      const jq = J.pose(jo);

      const kx = 682;
      const worry = sstep(B.absurd - 0.1, B.absurd + 0.3, t) * (1 - sstep(B.gave, B.gave + 0.5, t));
      const kreach = LIB.ease.inOutSine((t - (B.pay - 0.05)) / 0.5);
      const ko = {
        x: kx, y: V.floor + pump * 0.5, h: V.JH * K.HK, t, facing: -1,
        pose: { handshake: kreach },
        look: lerp(0, 0.05, worry),
        expr: { smile: 0.55 * (1 - worry) * (1 - kreach) + 0.85 * kreach, surprised: 0.6 * worry + 0.3 * kreach, tearful: 0.35 * worry },
        counterY: V.counterY, light: V.light,
      };

      const sh0 = SM.pose(Object.assign({}, so, { t: 0, pose: { armsFolded: 1 }, shake: 0 })).head;
      const jh0 = J.pose({ x: jx, y: jy, h: jh, t: 0, facing: 1, age: 15, outfit: 'casual' }).head;
      const CUT = setupAt([
        { at: 0, z: 1.14, c: [580, 560], push: 0.05, pan: [16, 0] },
        { at: B.salesman, z: 1.7, c: [sh0[0] - 40, sh0[1] + 150], push: 0.06, pan: [-14, -6] },
        { at: B.absurd, z: 2.4, c: [sh0[0] - 20, sh0[1] + 70], push: 0.07, pan: [0, -10] },
        { at: B.but, z: 1.75, c: [jh0[0] + 60, jh0[1] + 170], push: 0.06, pan: [10, -8] },
        { at: B.word, z: 2.35, c: [jh0[0] + 40, jh0[1] + 10], push: 0.06, pan: [-8, 10] },
        { at: B.payCut, z: 1.14, c: [560, 560], push: 0.05, pan: [-16, 0] },
      ], t, info.dur);
      const cam = (g, depth) => frame(g, CUT, depth);

      ctx.save();
      cam(ctx, ST.PAR.back);
      ST.drawBack(ctx, C, { t });
      ctx.restore();

      ctx.save();
      cam(ctx, 0.92);
      SM(ctx, so);
      K(ctx, ko);
      ST.drawCounter(ctx, C, { t });
      ctx.restore();

      ctx.save();
      cam(ctx, 1);
      contractTwo(ctx, 600, V.counterY + 4);
      LOOK.contactShadow(ctx, { x: jo.x, y: jo.y, h: jo.h, alpha: 0.32 });
      J(ctx, jo);
      shakeStrokes(ctx, sq.head[0], sq.head[1], so.h / 520, shakeK, t);
      ctx.restore();

      ctx.save();
      cam(ctx, ST.PAR.air);
      ST.drawLight(ctx, C, { t });
      ctx.restore();

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
