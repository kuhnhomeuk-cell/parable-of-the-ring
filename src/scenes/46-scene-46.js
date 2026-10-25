// scenes/46-scene-46.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-46';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;

  const LAY = { mood: 'loss', horizon: 360, shore: 600, wet: 320 };
  const JO = { age: 21, outfit: 'swim' };
  const jR = (h) => FILM.cast.sam.height(Object.assign({ h }, JO));
  const MO = { outfit: 'beach', swim: true, breeze: 0.45 };

  const GROUND = 900, JH = 440, JX = 740, MX = 350;
  const F = [540, 760], Z = 1.55;

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
    const help = beatT(info, 'tokla toklb toklc', 0.26);
    const why = beatT(info, 'tokld tokle tokga tokcc toklf', 2.63);
    return { help, why, silly: wordT(info, 'toklg', 4.47), cut: why - 0.1 };
  }

  function pair(t, B, C, z) {
    const P = (x, y) => [F[0] + (x - F[0]) * z, F[1] + (y - F[1]) * z];
    const JR = jR(JH);
    const MH = JR * 0.95;
    const [jx, gy] = P(JX, GROUND);
    const [mx] = P(MX, GROUND);
    const lift = LIB.ease.inOutSine(clamp01((t - (B.silly - 0.1)) / 0.9));
    const jo = Object.assign({ x: jx, y: gy, h: JH * z, t, facing: -1, pose: 'sitUp', poseAmt: 1,
      lean: lerp(0.5, 0.22, lift), look: lerp(-0.45, -0.04, lift), expr: lift < 0.5 ? 'cry' : 'teary', blinkOffset: 0.9 }, JO);

    const mh = MH * z, s = mh / 330;
    const mo = Object.assign({ x: mx, y: gy, h: mh, t, facing: 1, light: C.m.light, pose: 'kneelHold' }, MO);
    const knee = FILM.cast.ava.pose(Object.assign({}, mo, { target: { x: mx + 80 * s, y: gy - 150 * s } })).legs[1].knee;
    mo.target = { x: knee[0] + 4 * s, y: knee[1] - 9 * s };
    const o = LIB.ease.inOutSine(clamp01((t - (B.help + 0.15)) / 0.75));
    const tilt = sstep(B.silly - 0.2, B.silly + 0.5, t);
    mo.palmUp = o * (1 - 0.12 * tilt);
    mo.look = 0.12 + 0.5 * tilt;
    const puzzled = sstep(B.help - 0.2, B.help + 0.6, t);
    mo.expr = { tearful: 0.5 - 0.1 * puzzled, wonder: 0.15 * puzzled, neutral: 0.3, smileSoft: 0.1 + 0.15 * tilt };
    return { jo, mo, JR: JR * z, MH: mh, jx, mx, gy };
  }

  function draw2(ctx, p, C) {
    LOOK.contactShadow(ctx, { x: p.jx - 0.12 * p.JR, y: p.gy, h: p.JR, rx: 0.3 * p.JR, alpha: C.m.contactA });
    LOOK.contactShadow(ctx, { x: p.mx + 0.02 * p.MH, y: p.gy, h: p.MH, rx: 0.2 * p.MH, alpha: C.m.contactA * 0.9 });
    FILM.cast.sam(ctx, p.jo);
    FILM.cast.ava(ctx, p.mo);
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const BEACH = FILM.sets.beach;
      const B = beats(info);
      const C = BEACH.statics(S, LAY);
      const BD = BEACH.backdrop(S, C, { blur: 7 });

      if (t < B.cut) {
        const cam = (g, d) => LOOK.camera(g, { t, dur: B.cut, focus: F, push: 0.04, depth: d });
        BEACH.back(ctx, C, t, cam);
        ctx.save();
        cam(ctx, 1);
        draw2(ctx, pair(t, B, C, 1), C);
        ctx.restore();
        BEACH.air(ctx, C, t, cam, 0.8);
      } else {
        const tb = t - B.cut;
        const cam = (g, d) => LOOK.camera(g, { t: tb, dur: info.dur - B.cut, focus: [560, 560], push: 0.07, depth: d });
        ctx.save();
        cam(ctx, 0.3);
        ctx.drawImage(BD, 0, 0, 1080, 1080);
        ctx.restore();
        ctx.save();
        cam(ctx, 1);
        draw2(ctx, pair(t, B, C, Z), C);
        ctx.restore();
        BEACH.air(ctx, C, t, cam, 0.5);
      }
      BEACH.grade(ctx, C, 1);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
