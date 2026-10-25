// scenes/24-scene-24.js: procedural scene. Shot timing comes from src/timeline.js.
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

  const ID = 'scene-24';
  const LIB = FILM.lib, LOOK = FILM.look;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const INK = '#1F1712';
  const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';

  const beatsOf = (info) => {
    const b = info.shot.beats;
    const a = b[0].t;
    const m = b[1].t;
    const w = b[2].t;
    const k = (word, fb) => wordT(info, word, 0, fb);
    const balloons = k('tokfu', a + 2.0);
    return {
      lay: Math.max(0.05, k('tokfg', a + 0.75) - 0.55), balloons, cheer: balloons + 0.45, cake: k('tokfv', a + 2.9), oldman: m,
      shook: k('tokfw', m + 1.05), hand: k('tokde', m + 1.7), cut: w - 0.04, wrong: w, end: info.dur,
    };
  };

  const SYL0 = [[0, 0.1], [0.11, 0.24], [0.26, 0.58], [0.6, 0.76], [0.78, 0.92], [0.94, 1.28]];
  function sylFrom(info, w) {
    const sh = info.shot;
    const cap = (sh.captions || []).find((c) => (c.words || []).some(([ft]) => Math.abs(ft - sh.start - w) < 0.02));
    if (!cap) return SYL0;
    const ws = cap.words.map(([ft, tok]) => [ft - sh.start - w, norm(tok)]);
    const out = [];
    for (let i = 0; i < ws.length; i++) {
      const a = ws[i][0];
      const e = Math.min(i + 1 < ws.length ? ws[i + 1][0] - 0.02 : a + 0.4, a + 0.4);
      if (ws[i][1] === 'tokfz') {
        const mid = (a + e) / 2;
        out.push([a, mid - 0.01], [mid + 0.01, e]);
      } else out.push([a, e]);
    }
    return out;
  }
  function talkAt(t, SYL) {
    let v = 0;
    for (const [a, b] of SYL) {
      const u = (t - a) / (b - a);
      if (u > 0 && u < 1) v = Math.max(v, Math.sin(Math.PI * u));
    }
    return v;
  }

  const CONF = (() => {
    const r = LIB.rng(sd('confetti'));
    const out = [];
    const cols = ['#E5484D', '#F2C14E', '#3FA37A', '#4A7BD0', '#F08BB0', '#9B6BD3', '#FFF6DA'];
    for (let i = 0; i < 70; i++) out.push({ x: r.range(120, 1000), vx: r.range(-60, 60), vy: r.range(-520, -220), spin: r.range(4, 11), ph: r(), w: r.range(7, 12), h: r.range(4, 7), c: cols[i % cols.length] });
    return out;
  })();
  function confetti(ctx, u) {
    if (u <= 0 || u > 3.2) return;
    const a = 1 - sstep(2.4, 3.2, u);
    ctx.save();
    for (const p of CONF) {
      const x = p.x + p.vx * u + 18 * Math.sin(u * 3 + p.ph * TAU);
      const y = 200 + p.vy * u + 0.5 * 420 * u * u;
      if (y > 1000) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(p.spin * u + p.ph * TAU);
      ctx.scale(1, Math.cos(p.spin * 1.3 * u + p.ph * 5));
      ctx.globalAlpha = a;
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    ctx.restore();
  }

  function bill(ctx, x, y, s, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.fillStyle = '#B9CFA4';
    ctx.fillRect(-22, -10, 44, 20);
    ctx.fillStyle = '#93AE80';
    ctx.fillRect(-22, -10, 44, 4);
    ctx.lineWidth = 2;
    ctx.strokeStyle = INK;
    ctx.strokeRect(-22, -10, 44, 20);
    ctx.fillStyle = '#3E5A36';
    ctx.font = `800 11px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText('00', 0, 5);
    ctx.restore();
  }

  function popAt(ctx, x, y, k, draw) {
    if (k <= 0.001) return;
    const s = k < 1 ? LIB.ease.outBack(k) : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.translate(-x, -y);
    draw();
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
      const close = t >= B.cut;

      const offer = LIB.ease.inOutSine((t - (B.oldman + 0.3)) / 0.6);
      const reach = LIB.ease.inOutSine((t - (B.shook - 0.5)) / 0.5);
      const pumpEnv = sstep(B.shook, B.shook + 0.15, t) * (1 - sstep(B.cut - 0.3, B.cut, t));
      const pump = 5 * Math.sin(TAU * 2.0 * (t - B.shook)) * pumpEnv;

      const lay = LIB.ease.inOutSine((t - B.lay) / 0.45) * (1 - LIB.ease.inOutSine((t - (B.lay + 0.95)) / 0.45));
      const surprise = sstep(B.balloons, B.balloons + 0.2, t);
      const happy = sstep(B.cheer, B.cheer + 0.4, t);
      const moved = sstep(B.wrong + 0.2, B.wrong + 0.8, t);
      const jo = {
        x: 470, y: V.floor + 8, h: V.JH * 0.96, t, facing: 1, age: 17, outfit: 'casual', blinkOffset: 2.1,
        look: 0.1 + 0.15 * surprise * (1 - happy) - 0.05 * reach,
      };
      if (moved > 0.01) Object.assign(jo, { expr: 'teary', exprAmt: moved });
      else if (happy > 0.01) Object.assign(jo, { expr: 'happy', exprAmt: happy });
      else Object.assign(jo, { expr: 'wide', exprAmt: 0.3 + 0.7 * surprise });
      if (reach > 0.001) Object.assign(jo, { pose: 'hug', poseAmt: reach * (1 - 0.05 * (0.5 + pump / 10)) });
      else if (lay > 0.001) Object.assign(jo, { pose: 'hug', poseAmt: 0.6 * lay, lean: 0.25 * lay });
      const jq = J.pose(jo);

      const sx = lerp(830, 700, offer);
      const warm = sstep(B.cheer - 0.3, B.oldman + 0.5, t);
      const talk = close ? talkAt(t - B.wrong, sylFrom(info, B.wrong)) : 0;
      const ledger = 1 - sstep(B.balloons - 0.1, B.balloons + 0.3, t);
      const so = {
        x: sx, y: V.floor + 14 * offer + pump * 0.5, h: V.JH * SM.HK, t, facing: -1, warmth: lerp(0.3, 1, warm),
        pose: { barelyLook: ledger, handshake: offer },
        flick: t < B.lay + 0.4 ? 0 : sstep(B.lay + 0.4, B.lay + 0.7, t),
        expr: { scowl: 0.6 * (1 - warm), surprised: 0.4 * (1 - warm) * sstep(B.lay + 0.4, B.lay + 0.7, t), smile: 1.1 * warm, laugh: 0.7 * talk },
        counterY: V.counterY, light: V.light,
      };
      const sq = SM.pose(so);

      const kx = 958;
      const clap = sstep(B.cheer - 0.6, B.cheer - 0.4, t) * (1 - sstep(B.oldman + 0.6, B.oldman + 0.8, t));
      const tear = sstep(B.oldman + 0.7, B.oldman + 1.1, t);
      const ko = {
        x: kx, y: V.floor, h: V.JH * K.HK, t, facing: -1,
        pose: { clap, wipeTear: tear }, clapRate: 2.6,
        expr: { smile: 0.6 * (1 - tear), laugh: 0.4 * clap, tearful: 0.6 * tear, warm: 0.3 * tear },
        counterY: V.counterY, light: V.light,
      };

      const pL = clamp01((t - B.balloons) / 0.4), pR = clamp01((t - B.balloons - 0.15) / 0.4);
      const drop = clamp01((t - (B.balloons + 0.3)) / 0.5);
      const cakeK = clamp01((t - (B.cake - 0.05)) / 0.35);

      const jh0 = J.pose({ x: jo.x, y: jo.y, h: jo.h, t: 0, facing: 1, age: 17, outfit: 'casual' }).head;
      const smH = SM.pose(Object.assign({}, so, { t: 0, x: 700, y: V.floor + 14, pose: { handshake: 1 } })).head;
      const CUT = setupAt([
        { at: 0, z: 1.7, c: [lerp(jh0[0], 596, 0.55), lerp(jh0[1], V.counterY, 0.5) + 30], push: 0.06, pan: [16, -6] },
        { at: B.balloons, z: 1.06, c: [574, 540], push: 0.05, pan: [-14, 0] },
        { at: B.cake, z: 2.1, c: [840, V.counterY - 40], push: 0.07, pan: [-10, -8] },
        { at: B.oldman, z: 1.3, c: [640, 548], push: 0.05, pan: [12, 0] },
        { at: B.cut, z: 2.1, c: [lerp(jh0[0], smH[0], 0.62), lerp(jh0[1], smH[1], 0.5) + 20], push: 0.06, pan: [-8, 10] },
      ], t, info.dur);
      const cam = (g, depth) => frame(g, CUT, depth);

      ctx.save();
      cam(ctx, ST.PAR.back);
      ST.drawBack(ctx, C, { t });
      ctx.restore();

      ctx.save();
      cam(ctx, 0.8);
      if (drop > 0) {
        ctx.save();
        ctx.translate(0, 40);
        ctx.scale(1, LIB.ease.outBack(drop));
        ctx.translate(0, -40);
        FILM.cast.banner(ctx, { x: 650, y: 40, w: 640, text: 'You did it! Congratulations!', t });
        ctx.restore();
      }
      popAt(ctx, 1020, 360, pR, () => FILM.cast.balloons(ctx, { x: 1020, y: 360, size: 66, count: 4, t, colors: [['#F2C14E', '#D49A2A'], ['#4A7BD0', '#3459A3'], ['#E5484D', '#B8323A'], ['#3FA37A', '#2C7C5B']] }));
      ctx.restore();

      ctx.save();
      cam(ctx, 0.92);
      SM(ctx, so);
      K(ctx, ko);
      ST.drawCounter(ctx, C, { t });
      ctx.restore();

      ctx.save();
      cam(ctx, 1);
      const billOut = sstep(B.lay + 0.4, B.lay + 0.5, t);
      if (lay > 0.05 && billOut < 1) bill(ctx, jq.hands[0][0] + 10, jq.hands[0][1] - 4, 0.9, -0.15);
      if (billOut > 0) {
        ctx.save();
        ctx.translate(596, V.counterY + 2);
        ctx.scale(1, 0.4);
        bill(ctx, 0, 0, 1.1, 0.05);
        ctx.restore();
      }
      popAt(ctx, 800, V.counterY + 12, cakeK, () => FILM.cast.cake(ctx, { x: 800, y: V.counterY + 12, size: 196, text: 'Congratulations Sam', t }));
      LOOK.contactShadow(ctx, { x: jo.x, y: jo.y, h: J.height(jo), alpha: 0.32 });
      J(ctx, jo);
      popAt(ctx, 330, 610, pL, () => FILM.cast.balloons(ctx, { x: 330, y: 610, size: 72, count: 5, t }));
      confetti(ctx, t - (B.cheer - 0.2));
      ctx.restore();

      ctx.save();
      cam(ctx, ST.PAR.air);
      ST.drawLight(ctx, C, { t });
      ctx.restore();
      LOOK.exposure(ctx, 0.2 * LOOK.flashEnv(t, B.cheer - 0.1, { fall: 12 }), { strength: 0.3 });

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
