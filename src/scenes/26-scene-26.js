// scenes/26-scene-26.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-26';
  const LOOK = FILM.look;
  const HOME = () => FILM.sets.home;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const lerp = (a, b, k) => a + (b - a) * k;
  const sstep = (e0, e1, x) => {
    const u = clamp01((x - e0) / (e1 - e0));
    return u * u * (3 - 2 * u);
  };

  const beatsOf = (info) => ({
    a: wordT(info, 'tokac', 0, 1.33),
    letter: wordT(info, 'tokgf', 0, 1.79),
    he: wordT(info, 'tokaa', 0, 2.77),
    going: wordT(info, 'tokgh', 0, 3.19),
    war: wordT(info, 'tokgi', 0, 4.0),
  });

  const JH = 300;
  const FOCUS = [560, 560];
  const PUSH = 0.035;
  const ENV_SIZE = 150;

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

  function cast(t, B) {
    const P = HOME().PORCH;
    const reach = sstep(B.a - 0.35, B.letter + 0.25, t);
    const war = sstep(B.going - 0.1, B.going + 0.25, t);
    const down = sstep(B.war - 0.15, B.war + 0.35, t);
    const father = {
      x: 420, y: P.floor, h: JH * 1.16, t, facing: 1, pose: 'holdOutEnvelope',
      bow: lerp(0.45, 0.95, sstep(0, B.war + 0.3, t)), expr: 'sad', light: [0.6, -0.8],
    };
    const sam = {
      x: 694, y: P.floor + 4, h: JH, t, age: 18, outfit: 'casual', facing: -1,
      pose: 'handshake', poseAmt: 0.92 * reach, look: -0.05 - 0.5 * down, lean: 0.08 * reach,
      expr: war > 0 ? 'wide' : 'neutral', exprAmt: war > 0 ? war * (1 - 0.35 * down) : 1,
    };
    const mother = { x: 880, y: P.floor - 6, h: JH * 1.04, t, facing: -1, pose: 'clutch', expr: 'cry', light: [-0.6, -0.8] };
    return { father, sam, mother, reach };
  }

  function drawEnvelope(ctx, t, father, sam, reach, B) {
    const fp = FILM.cast.father.pose(father).envelope;
    const jh = FILM.cast.sam.pose(sam).hands[0];
    const held = sstep(B.letter + 0.05, B.letter + 0.4, t);
    const fx = fp.x + ENV_SIZE * 0.4, fy = fp.y;
    const jx = jh[0] - ENV_SIZE * 0.42, jy = jh[1] - 6;
    const x = lerp(fx, lerp(fx, jx, 0.5), held), y = lerp(fy, lerp(fy, jy, 0.75), held) + 8 * held;
    const rot = lerp(fp.angle * 0.3, Math.atan2(jy - fy, jx - fx) * 0.15, held) + 0.02 * Math.sin(t * 3.1) * (1 - held);
    FILM.cast.envelope(ctx, { x, y, size: ENV_SIZE, rot, progress: 0.4, t });
    void reach;
  }

  function drain(ctx, t, dur, B) {
    const k = sstep(B.a - 0.4, dur, t);
    if (k <= 0.001) return;
    ctx.save();
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = `rgba(128,128,128,${0.62 * k})`;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(196,206,232,${0.5 * k})`;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const C = HOME().porch(S, 'dusk');
      const cam = (depth) => LOOK.camera(ctx, { t, dur: info.dur, focus: FOCUS, push: PUSH, depth });
      const B = beatsOf(info);
      const { father, sam, mother, reach } = cast(t, B);
      const J = FILM.cast.sam;

      ctx.save();
      rig(ctx, t, info.dur, [
        { at: 0, f: [560, 590], z: 1.08, d: [10, -8], p: 0.05 },
        { at: B.a - 0.05, f: [565, 560], z: 2.1, d: [-12, -6], p: 0.06 },
        { at: B.he - 0.05, f: [790, 530], z: 1.75, d: [-10, -8], p: 0.07 },
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
      for (const o of [mother, father, sam]) LOOK.contactShadow(ctx, { x: o.x, y: o.y, h: o.h * 0.9, alpha: 0.42 });
      FILM.cast.mother(ctx, mother);
      FILM.cast.father(ctx, father);
      J(ctx, Object.assign({}, sam, { layer: 'back' }));
      drawEnvelope(ctx, t, father, sam, reach, B);
      J(ctx, Object.assign({}, sam, { layer: 'front' }));
      ctx.restore();

      ctx.save();
      cam(0.7);
      LOOK.drawLight(ctx, C.light, { alpha: 0.8 + 0.05 * Math.sin(t * 1.7) });
      ctx.restore();
      ctx.restore();

      drain(ctx, t, info.dur, B);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
