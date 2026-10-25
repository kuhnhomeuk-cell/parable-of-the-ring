// scenes/50-scene-50.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-50';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;

  const JO = { age: 21, outfit: 'swim' };
  const MO = { outfit: 'beach', swim: true };

  function beatT(info, s, d) {
    const b = (info.shot && info.shot.beats) || [];
    const x = b.find((q) => q.text && q.text.indexOf(s) >= 0);
    return x ? x.t : d;
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
    const first = beatT(info, 'tokae tokam tokbg toklr', 0.26);
    const never = beatT(info, 'tokfi toklu', 4.60);
    const can = beatT(info, 'toklv tokga toklw', 7.19);
    const forgive = beatT(info, 'tokfx toklw tokga', 8.64);
    const saw = wordT(info, 'tokcq', 2.0, first);
    const you = wordT(info, 'tokga', 9.19, forgive);
    return { first, saw, never, can, forgive, you, cutB: never - 0.35, cutC: forgive - 0.08 };
  }

  const LA = { horizon: 330, shore: 530, wet: 170 };
  const MHA = 1650;
  const HEAD_A = [440, 500];

  const JHB = 860;
  const JRB = FILM.cast.sam.height(Object.assign({ h: JHB }, JO));
  const MHB = JRB * 0.95;
  const FEET_B = 1230;
  const JXB = 735, MXB = 318;
  const JAW = [-0.185, 0.175];

  const LC = { horizon: 300, shore: 540, wet: 190 };
  const JHC = 860;
  const JRC = FILM.cast.sam.height(Object.assign({ h: JHC }, JO));
  const MHC = JRC * 0.95;
  const FEET_C = 1150;
  const JXC = 660;
  const MXC = JXC - 0.33 * JRC;
  const DROP_C = 0.1 * JRC;
  const TIP_C = 0.06;

  let BAND = null;
  function clipTo(ctx, x0, x1, fn) {
    if (x1 <= x0) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, -10, x1 - x0, 1100);
    ctx.clip();
    fn(ctx);
    ctx.restore();
  }
  function wipe(ctx, k, drawL, drawS) {
    if (k <= 0.001) return drawL(ctx);
    if (k >= 0.999) return drawS(ctx);
    const e = lerp(1080 + 180, -180, k);
    const b0 = e - 180, b1 = e + 180;
    clipTo(ctx, 0, Math.min(1080, b1), drawL);
    const x0 = Math.max(0, Math.floor(b0)), x1 = Math.min(1080, Math.ceil(b1) + 4);
    if (x1 > x0) {
      const dx = ctx.canvas.width / 1080;
      const bw = Math.max(1, Math.round((x1 - x0) * dx)), bh = ctx.canvas.height;
      if (!BAND) BAND = FILM.makeCanvas(bw, bh);
      if (BAND.width !== bw) BAND.width = bw;
      if (BAND.height !== bh) BAND.height = bh;
      const g = BAND.getContext('2d');
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
      g.filter = 'none';
      g.clearRect(0, 0, bw, bh);
      g.setTransform(dx, 0, 0, dx, -x0 * dx, 0);
      drawS(g);
      g.setTransform(dx, 0, 0, dx, -x0 * dx, 0);
      g.globalCompositeOperation = 'destination-in';
      const gr = g.createLinearGradient(b0, 0, b1, 0);
      gr.addColorStop(0, 'rgba(0,0,0,0)');
      gr.addColorStop(1, 'rgba(0,0,0,1)');
      g.fillStyle = gr;
      g.fillRect(x0, 0, x1 - x0, 1080);
      g.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(BAND, x0 * dx, 0);
      ctx.restore();
    }
    clipTo(ctx, Math.max(0, b1 - 4), 1080, drawS);
  }
  function wipeBack(ctx, CL, CS, t, cam, k) {
    const BEACH = FILM.sets.beach;
    wipe(ctx, k, (g) => BEACH.back(g, CL, t, cam), (g) => BEACH.back(g, CS, t, cam));
  }
  function airAndGrade(ctx, CL, CS, t, cam, k, aA) {
    const BEACH = FILM.sets.beach;
    const A = aA == null ? 1 : aA;
    if (k < 0.5) BEACH.air(ctx, CL, t, cam, A * (1 - 2 * k));
    else BEACH.air(ctx, CS, t, cam, A * (2 * k - 1));
    BEACH.grade(ctx, CL, 1 - k);
    BEACH.grade(ctx, CS, k);
  }
  const mixL = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

  function drawA(ctx, t, info, S, k, B) {
    const BEACH = FILM.sets.beach;
    const CL = BEACH.statics(S, Object.assign({ mood: 'loss' }, LA));
    const CS = BEACH.statics(S, Object.assign({ mood: 'sunrise' }, LA));
    const BL = BEACH.backdrop(S, CL, { blur: 8 });
    const BS = BEACH.backdrop(S, CS, { blur: 8 });
    const cam = (g, d) => LOOK.camera(g, { t, dur: B.cutB, focus: HEAD_A, push: 0.05, depth: d });
    const bd = (img) => (g) => {
      g.save();
      cam(g, 0.3);
      g.drawImage(img, 0, 0, 1080, 1080);
      g.restore();
    };
    wipe(ctx, k, bd(BL), bd(BS));

    const fill = LIB.ease.inOutSine(clamp01((t - B.saw + 0.2) / 1.8));
    const light = mixL(CL.m.light, CS.m.light, k);
    const base = { x: 0, y: 0, h: MHA, t, facing: 1, light, breeze: 0.4, look: 0.12, pose: 'stand' };
    const h0 = FILM.cast.ava.pose(Object.assign({}, MO, base, { t: 0 })).head;
    const mo = Object.assign({}, MO, base, {
      x: HEAD_A[0] - h0[0], y: HEAD_A[1] - h0[1],
      look: 0.12 - 0.04 * fill,
      expr: { neutral: 0.5 * (1 - fill), wonder: 0.5 * (1 - fill) + 0.15 * fill, tearful: fill },
    });
    ctx.save();
    cam(ctx, 1);
    FILM.cast.ava(ctx, mo);
    ctx.restore();
    airAndGrade(ctx, CL, CS, t, cam, k, 0.45);
  }

  function drawB(ctx, t, info, S, k, B) {
    const BEACH = FILM.sets.beach;
    const CL = BEACH.statics(S, Object.assign({ mood: 'loss' }, LA));
    const CS = BEACH.statics(S, Object.assign({ mood: 'sunrise' }, LA));
    const tb = t - B.cutB;
    const cam = (g, d) => LOOK.camera(g, { t: tb, dur: B.cutC - B.cutB, focus: [520, 470], push: 0.12, depth: d });
    wipeBack(ctx, CL, CS, t, cam, k);
    const light = mixL(CL.m.light, CS.m.light, k);

    const reach = LIB.ease.inOutSine(clamp01((t - B.can + 0.3) / 0.8));
    const ans = sstep(B.forgive - 0.1, B.forgive + 0.4, t);
    const jo = Object.assign({ x: JXB, y: FEET_B, h: JHB, t, facing: -1, blinkOffset: 1.7, lean: 0.25 * reach, look: -0.05 }, JO);
    jo.expr = ans > 0.01 ? { teary: 0.6, smileSmall: 0.4 + 0.5 * ans } : { teary: 0.7, neutral: 0.3 };
    const JP = FILM.cast.sam.pose(jo);

    const mo = Object.assign({}, MO, { x: MXB, y: FEET_B, h: MHB, t, facing: 1, light, breeze: 0.4, look: 0.14 });
    mo.expr = ans > 0.01 ? { tearful: 0.7 - 0.3 * ans, loving: 0.3 + 0.4 * ans } : { tearful: 1 };
    const goal = [JP.head[0] + JAW[0] * JRB, JP.head[1] + JAW[1] * JRB];
    let T = goal.slice();
    for (let i = 0; i < 3; i++) {
      const P = FILM.cast.ava.pose(Object.assign({}, mo, { pose: 'handsToFace', target: { x: T[0], y: T[1] } })).hands[0];
      T = [T[0] + goal[0] - P[0], T[1] + goal[1] - P[1]];
    }
    mo.target = { x: T[0], y: T[1] };
    mo.pose = reach >= 0.999 ? 'handsToFace' : reach > 0.001 ? { stand: 1 - reach, handsToFace: reach } : 'stand';

    ctx.save();
    cam(ctx, 1);
    FILM.cast.ava(ctx, mo);
    FILM.cast.sam(ctx, jo);
    ctx.restore();
    airAndGrade(ctx, CL, CS, t, cam, k, 0.45);
  }

  function drawC(ctx, t, info, S, k, B) {
    const BEACH = FILM.sets.beach;
    const CL = BEACH.statics(S, Object.assign({ mood: 'loss' }, LC));
    const CS = BEACH.statics(S, Object.assign({ mood: 'sunrise' }, LC));
    const tc = t - B.cutC;
    const cam = (g, d) => LOOK.camera(g, { t: tc, dur: Math.max(0.5, info.dur - B.cutC), focus: [640, 470], push: 0.1, depth: d });
    wipeBack(ctx, CL, CS, t, cam, k);
    const light = mixL(CL.m.light, CS.m.light, k);
    const sway = Math.sin(t * 1.1);

    const shut = sstep(B.you + 0.2, B.you + 0.7, t);
    const jo = Object.assign({ x: JXC, y: FEET_C, h: JHC, t, facing: -1, pose: 'kneelOffer', poseAmt: 1, lean: 0.45 + 0.05 * sway,
      expr: { teary: 0.5 * (1 - shut), smileSmall: 0.5 * (1 - shut) + 0.2 * shut, closed: shut } }, JO);
    const JP = FILM.cast.sam.pose(jo);
    const VT = [-0.06, 0.1];
    const mo = Object.assign({}, MO, { x: MXC, y: FEET_C + DROP_C, h: MHC, t, facing: 1, light, breeze: 0.45, pose: 'kneelHold',
      target: { x: JP.back[0] + VT[0] * JRC, y: JP.back[1] + VT[1] * JRC }, look: 0.05, expr: { loving: 0.75, tearful: 0.25 } });
    const MP = FILM.cast.ava.pose(mo);
    const lean = TIP_C + 0.008 * sway;
    const knee = MP.legs[0].knee;

    ctx.save();
    cam(ctx, 1);
    const both = (g) => {
      FILM.cast.sam(g, jo);
      g.save();
      g.translate(knee[0], knee[1]);
      g.rotate(lean);
      g.translate(-knee[0], -knee[1]);
      FILM.cast.ava(g, mo);
      g.restore();
    };
    both(ctx);
    ctx.restore();
    airAndGrade(ctx, CL, CS, t, cam, k, 0.55);
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const B = beats(info);
      const k = LIB.ease.inOutSine(clamp01((t - B.saw) / (B.forgive - B.saw)));
      const BEACH = FILM.sets.beach;
      for (const L of [LA, LC]) for (const m of ['loss', 'sunrise']) BEACH.statics(S, Object.assign({ mood: m }, L));
      if (t < B.cutB) drawA(ctx, t, info, S, k, B);
      else if (t < B.cutC) drawB(ctx, t, info, S, k, B);
      else drawC(ctx, t, info, S, k, B);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
