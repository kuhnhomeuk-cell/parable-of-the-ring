// scenes/25-scene-25.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-25';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const HOME = () => FILM.sets.home;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const sstep = (e0, e1, x) => {
    const u = clamp01((x - e0) / (e1 - e0));
    return u * u * (3 - 2 * u);
  };
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

  const beatsOf = (info) => ({
    college: wordT(info, 'tokgb', 0, 1.37),
    sam: wordT(info, 'tokbb', 0, 2.38),
    army: wordT(info, 'tokgd', 0, 3.64),
  });

  const JH = 300;
  const FOCUS = [540, 560];
  const PUSH = 0.03;
  const SHADOW_K = [0.62, -0.1];

  function cast(t, B) {
    const P = HOME().PORCH;
    const up = sstep(B.sam - 0.05, B.sam + 0.5, t);
    const proud = sstep(B.army - 0.25, B.army + 0.4, t);
    const sam = {
      x: 548, y: P.floor + 8, h: JH, t, age: 18, outfit: 'dress', facing: 1,
      pose: 'chinUp', poseAmt: proud, look: -0.28 * (1 - up) + 0.08 * proud,
      expr: 'smileSmall', exprAmt: 0.2 + 0.6 * up,
    };
    const mother = { x: 352, y: P.floor, h: JH * 1.06, t, facing: 1, pose: 'stand', expr: 'kind', look: 0.2 };
    const father = { x: 688, y: P.floor - 4, h: JH * 1.16, t, facing: -1, pose: 'handOnShoulder', reach: 70, expr: 'kind', look: 0.15 };
    return { sam, mother, father };
  }

  function brochure(ctx, hand, t, k) {
    const w = 56 * k, h = 76 * k;
    ctx.save();
    ctx.translate(hand[0] + 4 * k, hand[1] - 8 * k);
    ctx.rotate(-0.12 + 0.02 * Math.sin(t * 1.3));
    ctx.lineJoin = 'round';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6 * k;
    ctx.fillStyle = '#F6F0E2';
    ctx.beginPath();
    ctx.rect(-w * 0.5, -h * 0.62, w, h);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#2E4C7A';
    ctx.fillRect(-w * 0.5 + 4 * k, -h * 0.62 + 4 * k, w - 8 * k, 14 * k);
    ctx.fillStyle = '#F6F0E2';
    ctx.font = `bold ${7.5 * k}px Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('STATE U', 0, -h * 0.62 + 14 * k);
    ctx.fillStyle = '#9CC0D8';
    ctx.fillRect(-w * 0.5 + 4 * k, -h * 0.62 + 20 * k, w - 8 * k, 30 * k);
    ctx.fillStyle = '#6E9A58';
    ctx.fillRect(-w * 0.5 + 4 * k, -h * 0.62 + 42 * k, w - 8 * k, 8 * k);
    ctx.fillStyle = '#A85A44';
    ctx.fillRect(-14 * k, -h * 0.62 + 30 * k, 28 * k, 13 * k);
    ctx.fillStyle = '#F2EEE4';
    ctx.fillRect(-4 * k, -h * 0.62 + 23 * k, 8 * k, 8 * k);
    ctx.fillStyle = 'rgba(60,60,80,0.5)';
    for (let i = 0; i < 3; i++) ctx.fillRect(-w * 0.5 + 6 * k, -h * 0.62 + (56 + i * 5) * k, w - (14 + i * 6) * k, 1.6 * k);
    ctx.fillStyle = 'rgba(31,23,18,0.18)';
    ctx.fillRect(w * 0.18, -h * 0.62 + 1, 1.5 * k, h - 2);
    ctx.restore();
  }

  function shadowed(ctx, S, o, draw) {
    LOOK.castShadow(ctx, { x: o.x, y: o.y, h: o.h, k: SHADOW_K, S, draw: (g) => draw(g, o), alpha: 0.24 });
    LOOK.contactShadow(ctx, { x: o.x, y: o.y, h: o.h * 0.9 });
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const C = HOME().porch(S, 'day');
      const cam = (depth) => LOOK.camera(ctx, { t, dur: info.dur, focus: FOCUS, push: PUSH, depth });
      const B = beatsOf(info);
      const { sam, mother, father } = cast(t, B);
      const J = FILM.cast.sam;

      ctx.save();
      rig(ctx, t, info.dur, [
        { at: 0, f: [540, 600], z: 1.06, d: [-14, -6], p: 0.05 },
        { at: B.sam - 0.08, f: [556, 590], z: 2.0, d: [6, -10], p: 0.06 },
      ]);
      ctx.save();
      cam(0.25);
      ctx.drawImage(C.far, 0, 0, 1080, 1080);
      ctx.restore();
      ctx.save();
      cam(0.55);
      ctx.drawImage(C.mid, 0, 0, 1080, 1080);
      ctx.restore();

      ctx.save();
      cam(1);
      ctx.drawImage(C.near, 0, 0, 1080, 1080);
      shadowed(ctx, S, mother, FILM.cast.mother);
      shadowed(ctx, S, father, FILM.cast.father);
      FILM.cast.mother(ctx, mother);
      FILM.cast.father(ctx, father);
      shadowed(ctx, S, sam, J);
      J(ctx, Object.assign({}, sam, { layer: 'back' }));
      const hand = J.pose(sam).hands[0];
      brochure(ctx, hand, t, J.height(sam) / 330);
      J(ctx, Object.assign({}, sam, { layer: 'front' }));
      ctx.restore();

      ctx.save();
      cam(0.7);
      LOOK.drawLight(ctx, C.light, { x: 8 * Math.sin(t * 0.35), alpha: 0.72 + 0.06 * Math.sin(t * 0.9) });
      ctx.restore();
      ctx.restore();

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
