// scenes/44-scene-44.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-44';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;

  const LAY = { horizon: 360, shore: 600, wet: 320 };
  const JO = { age: 21, outfit: 'swim' };
  const jR = (h) => FILM.cast.sam.height(Object.assign({ h }, JO));
  const MO = { outfit: 'beach', swim: true, breeze: 0.45 };

  const A = { ground: 890, jh: 440, jx0: 560, jx1: 630, mx: 330 };
  const Bs = { ground: 1030, jh: 900, jx: 480, mGround: 840, mh: 560, mx: 220 };
  const Cs = { feet: 1640, jh: 1180, jx: 470 };

  function beatT(info, txt, fb) {
    const b = ((info.shot && info.shot.beats) || []).find((x) => x.text.indexOf(txt) >= 0);
    return b ? b.t : fb;
  }
  function wordT(info, tok, fb, from) {
    const sh = info.shot || {};
    const want = tok.toLowerCase();
    for (const c of sh.captions || []) {
      for (const [ft, w] of c.words || []) {
        const lt = ft - (sh.start || 0);
        if (lt >= (from == null ? 0 : from) && String(w).toLowerCase().replace(/[^a-z0-9']/g, '') === want) return lt;
      }
    }
    return fb;
  }
  function beats(info) {
    const fell = wordT(info, 'tokkg', 1.14);
    const wept = wordT(info, 'tokki', 2.72);
    const gone = beatT(info, 'tokkf tokkj', 3.65);
    const thing = beatT(info, 'tokkl tokae', 5.38);
    const shot = wordT(info, 'tokkn', 7.72);
    return { fell, gone, shot, drop: fell, cut1: wept, cut2: thing - 0.08 };
  }

  const TEARS = (() => {
    const r = LIB.rng(sd('tears'));
    const out = [];
    for (let i = 0; i < 22; i++) out.push([2.0 + i * 0.4 + r.range(-0.12, 0.12), r.range(-0.07, 0.07), r.range(-0.01, 0.02), r.range(0.006, 0.012)]);
    return out;
  })();

  function stunned(o, a) {
    const base = Object.assign({}, o, { pose: 'handsToFace', target: { x: o.x, y: o.y - 0.6 * o.h } });
    const P = FILM.cast.ava.pose(base);
    const s = P.scale, f = o.facing || 1;
    const target = { x: P.chest[0] + 14 * s * f, y: P.chest[1] - 7 * s };
    return Object.assign({}, o, { pose: a >= 0.999 ? 'handsToFace' : { stand: 1 - a, handsToFace: a }, target });
  }

  function drawTears(ctx, t, from, spot, jr, k0) {
    for (const [tl, dx, dy, r] of TEARS) {
      if (t < tl) continue;
      const a = clamp01((t - tl) / 0.25);
      ctx.fillStyle = `rgba(70,62,54,${0.3 * a * k0})`;
      ctx.beginPath();
      ctx.ellipse(spot[0] + dx * jr, spot[1] + dy * jr, r * jr * 1.6, r * jr * 0.55, 0, 0, TAU);
      ctx.fill();
    }
    for (const [tl, dx, dy, r] of TEARS) {
      const q = (t - (tl - 0.38)) / 0.38;
      if (q < 0 || q > 1) continue;
      const x = lerp(from[0] + 0.01 * jr, spot[0] + dx * jr, q);
      const y = lerp(from[1] + 0.015 * jr, spot[1] + dy * jr, q * q);
      ctx.fillStyle = 'rgba(214,236,246,0.9)';
      ctx.beginPath();
      ctx.ellipse(x, y, r * jr * 0.5, r * jr * 0.75, 0, 0, TAU);
      ctx.fill();
    }
  }

  function setupA(ctx, t, info, B, CM, CL, S) {
    const BEACH = FILM.sets.beach;
    const cam = (g, d) => LOOK.camera(g, { t, dur: B.cut1, focus: [540, 760], push: 0.04, depth: d });
    const k = LIB.ease.inOutSine(clamp01((t - 0.15) / 2.1));
    BEACH.back(ctx, CM, t, cam, { C: CL, k, wipe: true });

    const JR = jR(A.jh);
    const step = LIB.ease.inOutSine(clamp01(t / B.drop));
    const down = LIB.ease.inOutSine(clamp01((t - B.drop) / 0.8));
    const jx = lerp(A.jx0, A.jx1, step);
    const jo = Object.assign({ x: jx, y: A.ground, h: A.jh, t, facing: 1, expr: 'cry' }, JO);
    if (down <= 0.001) Object.assign(jo, { walk: ((jx - A.jx0) / FILM.cast.sam.stride(jo)) * 0.6, walkAmt: 1 - sstep(0.7, 1, step), lean: 0.6 });
    else Object.assign(jo, { pose: 'weepSit', poseAmt: down, lean: 0.6 * (1 - down) });

    const MH = JR * 0.95;
    const light = [lerp(CM.m.light[0], CL.m.light[0], k), lerp(CM.m.light[1], CL.m.light[1], k)];
    const mo = stunned(Object.assign({ x: A.mx, y: A.ground, h: MH, t, facing: 1, light, look: -0.05 - 0.1 * down,
      expr: { wonder: 0.55 - 0.25 * down, tearful: 0.45 + 0.25 * down } }, MO), LIB.ease.inOutSine(clamp01((t - 0.05) / 0.7)));

    const sK = [lerp(CM.m.shadowK[0], CL.m.shadowK[0], k), lerp(CM.m.shadowK[1], CL.m.shadowK[1], k)];
    const sA = lerp(CM.m.shadowA, CL.m.shadowA, k);
    ctx.save();
    cam(ctx, 1);
    if (k < 0.8) {
      const a = sA * (1 - sstep(0.5, 0.8, k));
      LOOK.castShadow(ctx, { x: A.mx, y: A.ground, h: MH, k: sK, S, alpha: a, draw: (g) => FILM.cast.ava(g, mo) });
      LOOK.castShadow(ctx, { x: jx, y: A.ground, h: JR, k: sK, S, alpha: a, draw: (g) => FILM.cast.sam(g, jo) });
    }
    LOOK.contactShadow(ctx, { x: A.mx + 8, y: A.ground, h: MH, alpha: 0.22 + 0.14 * k });
    LOOK.contactShadow(ctx, { x: jx + 0.12 * JR * down, y: A.ground, h: JR, alpha: 0.3 + 0.12 * k });
    FILM.cast.ava(ctx, mo);
    FILM.cast.sam(ctx, jo);
    ctx.restore();

    if (k < 0.5) BEACH.air(ctx, CM, t, cam, 1 - 2 * k);
    else BEACH.air(ctx, CL, t, cam, 2 * k - 1);
    return k;
  }

  function setupB(ctx, t, info, B, CL) {
    const BEACH = FILM.sets.beach;
    const tb = t - B.cut1;
    const cam = (g, d) => LOOK.camera(g, { t: tb, dur: B.cut2 - B.cut1, focus: [600, 760], push: 0.07, depth: d });
    BEACH.back(ctx, CL, t, cam);
    const JR = jR(Bs.jh);
    const jo = Object.assign({ x: Bs.jx, y: Bs.ground, h: Bs.jh, t, facing: 1, pose: 'weepSit', poseAmt: 1 }, JO);
    const JP = FILM.cast.sam.pose(jo);
    const gone = sstep(B.gone, B.gone + 1.2, t);
    const mo = stunned(Object.assign({ x: Bs.mx, y: Bs.mGround, h: Bs.mh, t, facing: 1, light: CL.m.light, look: -0.15 - 0.08 * gone,
      expr: { tearful: 0.6 + 0.2 * gone, wonder: 0.4 - 0.2 * gone } }, MO), 1);
    ctx.save();
    cam(ctx, 1);
    LOOK.contactShadow(ctx, { x: Bs.mx + 8, y: Bs.mGround, h: Bs.mh, alpha: CL.m.contactA * 0.9 });
    FILM.cast.ava(ctx, mo);
    LOOK.contactShadow(ctx, { x: Bs.jx + 0.12 * JR, y: Bs.ground, h: JR, alpha: CL.m.contactA });
    const spot = [JP.hands[0][0] + 0.02 * JR, Bs.ground + 0.012 * JR];
    drawTears(ctx, t, JP.hands[0], spot, JR, 1);
    FILM.cast.sam(ctx, jo);
    ctx.restore();
    BEACH.air(ctx, CL, t, cam, 0.8);
  }

  function setupC(ctx, t, info, B, CL, S) {
    const BEACH = FILM.sets.beach;
    const tc = t - B.cut2;
    const dur = info.dur - B.cut2;
    const BD = BEACH.backdrop(S, CL, { blur: 7 });
    const cam = (g, d) => LOOK.camera(g, { t: tc, dur, focus: [700, 480], push: 0.09, depth: d });
    ctx.save();
    cam(ctx, 0.3);
    ctx.drawImage(BD, 0, 0, 1080, 1080);
    ctx.restore();
    const lift = sstep(B.shot - 0.3, B.shot + 0.7, t);
    const jo = Object.assign({ x: Cs.jx, y: Cs.feet, h: Cs.jh, t, facing: 1, lean: 0.5, look: -0.42 + 0.12 * lift, expr: 'cry', blinkOffset: 0.7 }, JO);
    ctx.save();
    cam(ctx, 1);
    FILM.cast.sam(ctx, jo);
    ctx.restore();
    BEACH.air(ctx, CL, t, cam, 0.5);
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const BEACH = FILM.sets.beach;
      const B = beats(info);
      const CM = BEACH.statics(S, Object.assign({ mood: 'morning' }, LAY));
      const CL = BEACH.statics(S, Object.assign({ mood: 'loss' }, LAY));
      BEACH.backdrop(S, CL, { blur: 7 });

      let k = 1;
      if (t < B.cut1) k = setupA(ctx, t, info, B, CM, CL, S);
      else if (t < B.cut2) setupB(ctx, t, info, B, CL);
      else setupC(ctx, t, info, B, CL, S);
      BEACH.grade(ctx, CL, k);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
