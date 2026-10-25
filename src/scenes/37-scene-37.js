// scenes/37-scene-37.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-37';
  const LIB = FILM.lib, LOOK = FILM.look;
  const { sstep, clamp01, lerp, makeLayer } = LOOK;

  const JH = 360;
  const AGE = 19;
  const VIEW = { cx: 512, cy: 640, z: 2.0 };
  const BLUR_VIEW = { cx: 640, cy: 420, z: 2.4 };
  const FOCUS = [520, 470];
  const sets = () => FILM.sets.hospital;
  const MH = () => FILM.cast.sam.height({ h: JH, age: AGE }) * 0.95;
  const HIP = () => sets().WARD.hip;
  const COVER = () => [HIP()[0] + 22, HIP()[0] + 188];

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
    const L = lines(info);
    const her = b[1] ? b[1].t : 4.71;
    return { turn: word(L, 0, 'tokip', 0.83), pov: word(L, 0, 'tokcq', 2.91), eyes: word(L, 0, 'tokcw', 3.93), her, back: info.dur + 1 };
  }

  let FOG = null;
  function fog(S) {
    if (FOG && FOG.S === S) return FOG;
    const c = LOOK.mist(S, {
      bands: [[300, 260, 0.9], [640, 300, 0.85], [920, 200, 0.7]],
      noise: { sx: 180, sy: 90, oy: 9, oct: 3, gain: 1.7, bias: 0.4 },
      color: [222, 236, 250],
    });
    return (FOG = { S, c });
  }

  let SOFT = null;
  function softBack(S) {
    if (SOFT && SOFT.S === S) return SOFT;
    const C = sets().ward(S, { view: BLUR_VIEW });
    const { c, g } = makeLayer(S);
    g.filter = 'blur(10px)';
    g.drawImage(C.wall, -40, -40, 1160, 1160);
    g.drawImage(C.room, -40, -40, 1160, 1160);
    g.filter = 'none';
    LOOK.haze(g, { x: 560, y: -60, r: 760, stops: [[0, 'rgba(255,255,250,0.85)'], [0.4, 'rgba(250,252,246,0.35)'], [1, 'rgba(250,252,246,0)']] });
    return (SOFT = { S, c });
  }

  const SPARKS = [[250, 260, 14], [820, 210, 18], [700, 640, 11], [180, 600, 9], [930, 520, 12], [430, 150, 10]];

  function twoShotPose(t, B) {
    const reach = LIB.ease.inOutSine(clamp01((t - 0.05) / 0.75));
    const lift = LIB.ease.inOutSine(clamp01((t - B.turn - 0.1) / 1.1));
    const know = sstep(B.her - 0.25, B.her + 0.2, t);
    const jo = {
      x: HIP()[0], y: HIP()[1], h: JH, age: AGE, outfit: 'gown', pose: 'sitUp', facing: 1, t, shadow: false,
      look: lerp(-0.42, 0.24, lift), lean: 0.1 + 0.08 * lift,
      expr: know > 0.5 ? 'wide' : lift > 0.6 ? 'stare' : 'neutral', exprAmt: know > 0.5 ? 0.85 : 0.7, blinkOffset: 1.3,
    };
    const head = FILM.cast.sam.pose(jo).head;
    const tgt = { x: head[0] - 10, y: head[1] + lerp(160, 150, lift) };
    const mo = {
      x: COVER()[1] + lerp(110, 64, reach), y: 846, h: MH(), outfit: 'nurse', facing: -1, t,
      pose: { stand: 1 - reach, leanOverBed: 0.6 * reach, handsToFace: 0.4 * reach }, target: tgt, look: 0.12,
      expr: know > 0.5 ? { loving: 0.8, smileSoft: 0.2 } : { smileSoft: 0.6 },
    };
    return { jo, mo };
  }

  function drawTwoShot(ctx, t, info, S, B) {
    const C = sets().ward(S, { view: VIEW, coverLegs: COVER() });
    const V = sets().view(VIEW);
    const cam = (depth) => LOOK.camera(ctx, { t, dur: B.pov, focus: FOCUS, push: 0.05, depth });
    ctx.save();
    cam(0.55);
    ctx.drawImage(C.wall, 0, 0, 1080, 1080);
    ctx.restore();

    ctx.save();
    cam(1);
    ctx.drawImage(C.room, 0, 0, 1080, 1080);
    const P = twoShotPose(t, B);
    const J = V.char(P.jo);
    FILM.cast.sam(ctx, Object.assign({ layer: 'back' }, J));
    FILM.cast.ava(ctx, V.char(P.mo));
    ctx.drawImage(C.bedFront, 0, 0, 1080, 1080);
    FILM.cast.sam(ctx, Object.assign({ layer: 'front' }, J));
    ctx.restore();

    ctx.save();
    cam(0.7);
    LOOK.drawLight(ctx, C.light, { x: 5 * Math.sin(t * 0.3), alpha: 0.45 + 0.04 * Math.sin(t * 0.9) });
    ctx.restore();
  }

  const CU_H = 2500;
  const CU_T = 3.2;
  function drawCloseUp(ctx, t, info, S, B) {
    ctx.drawImage(softBack(S).c, 0, 0, 1080, 1080);
    const tc = t - B.pov;
    const punch = t >= B.her;
    const z = punch
      ? 1.35 * (1 + 0.04 * LIB.ease.inOutSine(clamp01((t - B.her) / (info.dur - B.her))))
      : 1 + 0.045 * LIB.ease.inOutSine(clamp01(tc / (B.her - B.pov)));
    const base = { x: 540, y: 0, h: CU_H, outfit: 'nurse', facing: -1, front: 1, pose: 'stand', t: t + CU_T, look: 0.02, expr: { smileSoft: 0.7, loving: 0.3 }, breeze: 0.15 };
    const e = FILM.cast.ava.pose(base).eyes;
    const ey = (e[0][1] + e[1][1]) / 2;
    const mo = Object.assign({}, base, { y: 372 - ey });
    ctx.save();
    ctx.translate(540, punch ? 380 : 400);
    ctx.scale(z, z);
    ctx.translate(-540, punch ? -372 : -400);
    FILM.cast.ava(ctx, mo);
    ctx.restore();
    LOOK.bloom(ctx, { x: 600, y: 60, r: 620, alpha: 0.22, mid: 0.07 });
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const B = beats(info);
      sets().ward(S, { view: VIEW, coverLegs: COVER() });
      softBack(S);
      fog(S);

      if (t >= B.pov && t < B.back) drawCloseUp(ctx, t, info, S, B);
      else drawTwoShot(ctx, t, info, S, B);

      const fin = sstep(B.her - 0.05, B.her + 0.2, t);
      const fout = 1 - sstep(B.her + 0.7, B.her + 1.8, t);
      const f = fin * fout;
      if (f > 0.003) {
        LOOK.drawMist(ctx, fog(S).c, { x: -120 + 40 * (t - B.her), alpha: 0.8 * f });
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(190,214,246,${0.28 * f})`;
        ctx.fillRect(0, 0, 1080, 1080);
        ctx.restore();
        for (let i = 0; i < SPARKS.length; i++) {
          const [x, y, s] = SPARKS[i];
          const tw = 0.6 + 0.4 * Math.sin(t * 5 + i * 1.7);
          LOOK.glint(ctx, { x: x + 10 * (t - B.her), y, size: s * tw, alpha: 0.75 * f, rot: 0.3 * i });
        }
        LOOK.exposure(ctx, 0.3 * f * (1 - sstep(B.her, B.her + 0.5, t)) + 0.12 * f, { color: [214, 230, 255] });
      }

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
