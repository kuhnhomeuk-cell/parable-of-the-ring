// scenes/39-scene-39.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-39';
  const LIB = FILM.lib, LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;

  const JH = 330;
  const AGE = 19;
  const sets = () => FILM.sets.hospital;
  const JR = () => FILM.cast.sam.height({ h: JH, age: AGE });
  const MH = () => JR() * 0.95;

  const VA = { cx: 560, cy: 600, z: 1.08 };
  const VB = { cx: 600, cy: 640, z: 1.22 };
  const VC = { cx: 560, cy: 690, z: 1.38 };
  const VC2 = { cx: 560, cy: 640, z: 1.95 };
  const VD = { cx: 452, cy: 640, z: 1.5 };
  const VD2 = { cx: 440, cy: 600, z: 2.1 };

  const SHADOW_SUNRISE = LOOK.shadowK(Math.PI - 0.12, 0.85);
  const SHADOW_DAY = LOOK.shadowK(Math.PI - 0.5, 0.45);

  function lines(info) {
    const s = info.shot, out = [];
    for (const c of s.captions || []) {
      if (!c.words || !c.words.length || c.words[0][0] < s.start - 0.05) continue;
      out.push(c.words.map(([t, w]) => [t - s.start, String(w).toLowerCase().replace(/[^a-z']/g, '')]));
    }
    return out;
  }
  const word = (L, i, tok, d) => {
    for (const w of L[i] || []) if (w[1] === tok) return w[0];
    return d;
  };

  function beats(info) {
    const b = info.shot.beats || [];
    const at = (i, d) => (b[i] ? b[i].t : d);
    const L = lines(info);
    return {
      walk: at(0, 0.22), every: word(L, 0, 'tokiy', 1.63),
      yes: at(1, 2.48), she: word(L, 1, 'tokio', 4.13), said: word(L, 1, 'tokjc', 4.88),
      told: at(2, 5.63), ring: word(L, 2, 'tokap', 7.09),
      save: at(3, 7.63), their: word(L, 3, 'tokjf', 8.76),
    };
  }

  const drawLayer = (ctx, c, cam, depth) => {
    ctx.save();
    cam(depth);
    ctx.drawImage(c, 0, 0, 1080, 1080);
    ctx.restore();
  };

  function porchBack(ctx, t, dur, C, focus) {
    const cam = (depth) => LOOK.camera(ctx, { t, dur, focus, push: 0.045, depth });
    drawLayer(ctx, C.far, cam, 0.25);
    ctx.save();
    cam(0.55);
    LOOK.drawMist(ctx, C.mist, { x: -150 + 14 * t, alpha: 0.6 });
    ctx.restore();
    drawLayer(ctx, C.near, cam, 1);
    return cam;
  }

  function figureShadow(ctx, V, S, o, k, draw) {
    const p = V.pt([o.x, o.y]);
    const h = o.h * V.z;
    LOOK.castShadow(ctx, { x: p[0], y: p[1], h, k, S, alpha: 0.22, draw });
    LOOK.contactShadow(ctx, { x: p[0], y: p[1], h, alpha: 0.3 });
  }

  function crutch(ctx, V, tip, hand, back) {
    const a = V.pt(tip), b = V.pt(hand);
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    FILM.cast.crutches(ctx, { x: a[0], y: a[1], size: len / 0.55, rot: Math.atan2(dx, -dy), pair: false, alpha: back ? 0.96 : 1 });
  }

  const HOP = 0.74;
  function hop(t) {
    const L = 0.36 * JR();
    const n = Math.floor(t / HOP), u = (t - n * HOP) / HOP;
    const swing = LIB.ease.inOutSine(clamp01((u - 0.12) / 0.3));
    const body = LIB.ease.inOutSine(clamp01((u - 0.45) / 0.5));
    const x = 250 + L * (n + body);
    const tipX = 250 + L * (n + swing) + 0.1 * JR();
    const lift = Math.sin(Math.PI * body) * 9;
    return { x, tipX, lift, L };
  }

  function partA(ctx, t, info, S, B, dur) {
    const C = sets().porch(S, { view: VA, mode: 'day' });
    const V = sets().view(VA);
    const cam = porchBack(ctx, t, dur, C, [520, 620]);
    const Y = sets().PORCH.walkY;
    const H = hop(t);
    const mx = 390 + (H.L / HOP) * t;
    const mo = { x: mx, y: Y - 14, h: MH(), outfit: 'nurse', facing: 1, pose: 'walk', walk: (mx - 390) / (2 * FILM.cast.ava.STEP * MH()), t, expr: 'smileSoft', front: 0.15 };
    const jo = { x: H.x, y: Y - H.lift, h: JH, age: AGE, outfit: 'gown', facing: 1, t, expr: 'smileSmall', look: -0.06, lean: 0.25 };
    ctx.save();
    cam(1);
    const Ms = V.char(mo), Js = V.char(jo);
    figureShadow(ctx, V, S, mo, SHADOW_DAY, (g) => FILM.cast.ava(g, Ms));
    FILM.cast.ava(ctx, Ms);
    figureShadow(ctx, V, S, { x: H.x, y: Y, h: JR() }, SHADOW_DAY, (g) => FILM.cast.sam(g, Js));
    const P = FILM.cast.sam.pose(jo);
    const ahead = 0.04 * JR() + 0.3 * (H.tipX - H.x - 0.1 * JR());
    crutch(ctx, V, [P.hands[1][0] + ahead + 4, Y - 6], P.hands[1], true);
    FILM.cast.sam(ctx, Js);
    crutch(ctx, V, [P.hands[0][0] + ahead, Y], P.hands[0], false);
    ctx.restore();
    ctx.save();
    cam(0.7);
    LOOK.drawLight(ctx, C.light, { alpha: 0.55 });
    ctx.restore();
  }

  function partB(ctx, t, info, S, B, t0, dur) {
    const tl = t - t0;
    const C = sets().porch(S, { view: VB, mode: 'day' });
    const V = sets().view(VB);
    const cam = porchBack(ctx, tl, dur, C, [600, 640]);
    const Y = sets().PORCH.walkY;
    const speed = 62;
    const jx = 380 + speed * tl, mx = jx + 120;
    const jo = { x: jx, y: Y, h: JH, age: AGE, outfit: 'gown', facing: 1, t, walk: (jx - 380) / FILM.cast.sam.stride({ h: JH, age: AGE }), expr: 'happy', exprAmt: 0.6, look: 0.1 };
    const mo = { x: mx, y: Y - 16, h: MH(), outfit: 'nurse', facing: 1, pose: 'walk', walk: (mx - 500) / (2 * FILM.cast.ava.STEP * MH()), t, expr: 'smileSoft', front: 0.7, look: 0.05 };
    ctx.save();
    cam(1);
    const Ms = V.char(mo), Js = V.char(jo);
    figureShadow(ctx, V, S, mo, SHADOW_DAY, (g) => FILM.cast.ava(g, Ms));
    FILM.cast.ava(ctx, Ms);
    figureShadow(ctx, V, S, { x: jx, y: Y, h: JR() }, SHADOW_DAY, (g) => FILM.cast.sam(g, Js));
    FILM.cast.sam(ctx, Js);
    ctx.restore();
    ctx.save();
    cam(0.7);
    LOOK.drawLight(ctx, C.light, { alpha: 0.55 });
    ctx.restore();
  }

  function partC(ctx, t, info, S, B, t0, VIEW, h0, h1) {
    const tl = t - t0;
    const dur = B.told - t0;
    const C = sets().porch(S, { view: VIEW, mode: 'sunrise' });
    const V = sets().view(VIEW);
    const cam = porchBack(ctx, t - h0, h1 - h0, C, VIEW === VC ? [600, 560] : [560, 470]);
    const PB = sets().PORCH.bench;
    const yesT = B.said - t0 - 0.1;
    const nod = Math.sin(TAU * clamp01((tl - yesT) / 0.9) * 1.5) * (1 - sstep(yesT + 0.6, yesT + 0.9, tl)) * (tl > yesT ? 1 : 0);
    const glow = sstep(yesT - 0.1, yesT + 0.5, tl);
    const jo = {
      x: 468, y: PB.feet, h: JH, age: AGE, outfit: 'gown', facing: 1, t, pose: 'sit', seat: (PB.feet - PB.seat) / JH,
      lean: 0.25 + 0.15 * glow, look: -0.12 + 0.1 * glow, expr: glow > 0.5 ? 'happy' : 'teary', exprAmt: 0.8, blinkOffset: 0.9,
    };
    const hand = FILM.cast.sam.pose(jo).hands[0];
    const reach = LIB.ease.inOutSine(clamp01((tl - 0.1) / 0.8));
    const mo = {
      x: 650, y: PB.feet + 4, h: MH(), outfit: 'nurse', facing: -1, t, pose: 'kneelHold',
      target: { x: lerp(hand[0] + 30, hand[0], reach), y: lerp(hand[1] + 30, hand[1], reach) },
      look: 0.22 + 0.12 * nod, expr: glow > 0.5 ? { loving: 0.7, tearful: 0.3 } : { tearful: 0.8, loving: 0.2 },
    };
    ctx.save();
    cam(1);
    const Ms = V.char(mo), Js = V.char(jo);
    figureShadow(ctx, V, S, { x: jo.x, y: jo.y, h: JR() }, SHADOW_SUNRISE, (g) => FILM.cast.sam(g, Js));
    FILM.cast.sam(ctx, Object.assign({ layer: 'back' }, Js));
    figureShadow(ctx, V, S, mo, SHADOW_SUNRISE, (g) => FILM.cast.ava(g, Ms));
    FILM.cast.ava(ctx, Ms);
    FILM.cast.sam(ctx, Object.assign({ layer: 'front' }, Js));
    ctx.restore();
    ctx.save();
    cam(0.7);
    LOOK.drawLight(ctx, C.light, { x: 4 * Math.sin(t * 0.4), alpha: 0.6 + 0.12 * glow });
    ctx.restore();
    LOOK.exposure(ctx, 0.18 * glow * (1 - 0.5 * sstep(yesT + 0.6, dur, tl)), { color: [255, 214, 186] });
  }

  let RIM = null;
  function rimLayer(S) {
    if (!RIM || RIM.S !== S) {
      const L = LOOK.makeLayer(S);
      RIM = { S, c: L.c, g: L.g };
    }
    RIM.g.save();
    RIM.g.setTransform(1, 0, 0, 1, 0, 0);
    RIM.g.clearRect(0, 0, RIM.c.width, RIM.c.height);
    RIM.g.restore();
    return RIM;
  }

  function partD(ctx, t, info, S, B, t0, VIEW, h0, h1) {
    const tl = t - t0;
    const C = sets().ward(S, { view: VIEW, night: true });
    const V = sets().view(VIEW);
    const cam = (depth) => LOOK.camera(ctx, { t: t - h0, dur: h1 - h0, focus: VIEW === VD ? [540, 600] : [560, 520], push: 0.05, depth });
    drawLayer(ctx, C.wall, cam, 0.55);
    const ringT = B.ring - t0;
    const tuckT = B.their - t0 - 0.2;
    const up = LIB.ease.inOutSine(clamp01((tl - 0.25) / 0.9));
    const down = LIB.ease.inOutSine(clamp01((tl - tuckT) / 0.9));
    const lift = 0.08 + 0.92 * up * (1 - down);
    const hip = sets().WARD.hip;
    const jo = {
      x: hip[0], y: hip[1], h: 360, age: AGE, outfit: 'gown', facing: 1, t, pose: 'liftLiner', bed: true, lift, shadow: false,
      expr: tl > tuckT + 0.6 ? 'smileSmall' : tl > ringT ? 'stare' : 'neutral', exprAmt: 0.75, blinkOffset: 0.3,
    };
    ctx.save();
    cam(1);
    ctx.drawImage(C.room, 0, 0, 1080, 1080);
    ctx.restore();
    ctx.save();
    cam(0.7);
    LOOK.drawLight(ctx, C.light.moon, { alpha: 0.12 });
    LOOK.drawLight(ctx, C.light.lamp, { alpha: 0.55 + 0.03 * Math.sin(t * 1.3) });
    ctx.restore();
    const Js = V.char(jo);
    const hp = FILM.cast.sam.pose(Js).helmet;
    const L = sets().tintLayer(S);
    FILM.cast.sam(L.g, Object.assign({ layer: 'back' }, Js));
    FILM.cast.helmet(L.g, hp);
    FILM.cast.sam(L.g, Object.assign({ layer: 'front' }, Js));
    const lp = V.pt([sets().WARD.nightLamp[0], sets().WARD.nightLamp[1] + 40]);
    const R = rimLayer(S);
    R.g.drawImage(L.c, 0, 0, 1080, 1080);
    R.g.globalCompositeOperation = 'source-in';
    R.g.fillStyle = 'rgb(255,198,128)';
    R.g.fillRect(0, 0, 1080, 1080);
    R.g.globalCompositeOperation = 'destination-out';
    R.g.drawImage(L.c, 5, 4, 1080, 1080);
    R.g.globalCompositeOperation = 'source-over';
    sets().tint(L, { color: 'rgba(16,22,52,0.5)', pool: [lp[0], lp[1], 460, 'rgba(255,184,110,0.16)'] });
    ctx.save();
    cam(1);
    ctx.drawImage(L.c, 0, 0, 1080, 1080);
    ctx.globalAlpha = 0.85;
    ctx.drawImage(R.c, 0, 0, 1080, 1080);
    ctx.restore();
    ctx.save();
    cam(1);
    const s = hp.size / 170;
    const rp = [hp.x, hp.y + (-6 - 20) * s];
    const seen = up * (1 - down);
    const env = LOOK.flashEnv(tl, ringT, { fall: 18 });
    const pulse = 0.5 + 0.5 * Math.sin(tl * 3.6);
    LOOK.glint(ctx, { x: rp[0], y: rp[1], size: (9 + 6 * pulse + 18 * env) * seen, alpha: (0.6 + 0.3 * pulse) * seen + 0.3 * env, rot: 0.1 * Math.sin(tl) });
    LOOK.bloom(ctx, { x: rp[0], y: rp[1], r: 46 + 40 * env, alpha: 0.22 * seen + 0.45 * env });
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const B = beats(info);
      sets().porch(S, { view: VA, mode: 'day' });
      sets().porch(S, { view: VB, mode: 'day' });
      sets().porch(S, { view: VC, mode: 'sunrise' });
      sets().porch(S, { view: VC2, mode: 'sunrise' });
      sets().ward(S, { view: VD, night: true });
      sets().ward(S, { view: VD2, night: true });
      const tB = B.every;
      if (t < tB) partA(ctx, t, info, S, B, tB);
      else if (t < B.yes) partB(ctx, t, info, S, B, tB, B.yes - tB);
      else if (t < B.she) partC(ctx, t, info, S, B, B.yes, VC, B.yes, B.she);
      else if (t < B.told) partC(ctx, t, info, S, B, B.yes, VC2, B.she, B.told);
      else if (t < B.save) partD(ctx, t, info, S, B, B.told, VD, B.told, B.save);
      else partD(ctx, t, info, S, B, B.told, VD2, B.save, info.dur);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
