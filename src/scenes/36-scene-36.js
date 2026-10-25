// scenes/36-scene-36.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-36';
  const LIB = FILM.lib, LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;

  const JH = 360;
  const AGE = 19;
  const HIP = FILM.sets.hospital.WARD.hip;
  const REST = FILM.sets.hospital.WARD.helmetRest;
  const MH = () => FILM.cast.sam.height({ h: JH, age: AGE }) * 0.95;

  const WIDE = { cx: 540, cy: 580, z: 1 };
  const MED = { cx: 440, cy: 600, z: 1.5 };
  const CLOSE = { cx: 452, cy: 630, z: 1.75 };
  const CURTAIN_X = 712;

  const sets = () => FILM.sets.hospital;

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
      woke: word(L, 0, 'tokhk', 2.61), asked: word(L, 0, 'tokij', 4.29), helmet: word(L, 0, 'tokak', 5.08),
      nurse: at(1, 5.96), lay: word(L, 1, 'tokik', 6.42),
      ring: at(2, 7.81), hand: word(L, 2, 'tokde', 8.24), found: word(L, 2, 'tokim', 8.54), gem: word(L, 2, 'tokap', 9.18),
    };
  }

  function nurse(t, B) {
    const tIn = B.lay - 1.3, tDown = B.lay + 0.35, tOut = B.lay + 1.25;
    const inK = LIB.ease.inOutSine(clamp01((t - tIn) / 1.0));
    const downK = LIB.ease.inOutSine(clamp01((t - (B.lay - 0.25)) / 0.6));
    const outK = LIB.ease.inOutSine(clamp01((t - tOut) / 0.8));
    const carry = [REST[0] + 6, REST[1] - 92];
    let hx = lerp(carry[0] + 150, carry[0], inK);
    let hy = lerp(carry[1], REST[1] - 34, downK);
    hx = lerp(hx, REST[0] + 8, downK);
    const released = t >= tDown;
    const hand = released ? [lerp(REST[0] + 8, REST[0] + 200, outK), lerp(REST[1] - 34, REST[1] - 100, outK)] : [hx, hy];
    return { hand, helmet: released ? null : [hx, hy + 30], visible: t > tIn - 0.05 && outK < 1 };
  }

  function drawWide(ctx, t, info, S, B, VIEW, t0, t1, focus) {
    const C = sets().ward(S, { view: VIEW, curtainFront: CURTAIN_X });
    const cam = (depth) => LOOK.camera(ctx, { t: t - t0, dur: t1 - t0, focus, push: VIEW.z > 1 ? 0.05 : 0.04, depth });
    ctx.save();
    cam(0.55);
    ctx.drawImage(C.wall, 0, 0, 1080, 1080);
    ctx.restore();

    ctx.save();
    cam(1);
    ctx.drawImage(C.room, 0, 0, 1080, 1080);
    sets().view(VIEW).apply(ctx);
    const open = sstep(B.woke - 0.05, B.woke + 0.3, t);
    const ask = sstep(B.asked - 0.1, B.helmet, t) * (1 - sstep(B.lay - 0.6, B.lay + 0.2, t));
    const watch = sstep(B.lay - 1.2, B.lay - 0.6, t);
    const o = {
      x: HIP[0], y: HIP[1], h: JH, age: AGE, outfit: 'gown', pose: 'sitUp', facing: 1, t,
      lean: 0.35 * ask + 0.1 * watch, look: -0.05 + 0.12 * ask - 0.18 * watch, shadow: false,
      expr: open < 0.5 ? 'closed' : ask > 0.3 ? 'wide' : 'neutral', exprAmt: open < 0.5 ? 1 : 0.6 + 0.3 * ask,
      blinkOffset: 0.6,
    };
    const N = nurse(t, B);
    if (!N.helmet && t >= B.lay) {
      FILM.cast.helmet(ctx, { x: REST[0], y: REST[1], size: 112, open: 0, rot: -0.04, t });
    }
    FILM.cast.sam(ctx, o);
    if (N.visible) {
      const m = {
        x: Math.max(N.hand[0] + 175, CURTAIN_X + 150), y: 930, h: MH(), outfit: 'nurse', pose: 'leanOverBed', facing: -1, t,
        target: { x: N.hand[0], y: N.hand[1] },
      };
      if (N.helmet) FILM.cast.helmet(ctx, { x: N.helmet[0], y: N.helmet[1], size: 112, open: 0, rot: -0.04, t });
      FILM.cast.ava(ctx, m);
    }
    ctx.restore();

    ctx.save();
    cam(1);
    ctx.drawImage(C.front, 0, 0, 1080, 1080);
    ctx.restore();

    ctx.save();
    cam(0.7);
    LOOK.drawLight(ctx, C.light, { x: 6 * Math.sin(t * 0.3), alpha: 0.55 + 0.05 * Math.sin(t * 0.8) });
    ctx.restore();
  }

  function drawClose(ctx, t, info, S, B) {
    const C = sets().ward(S, { view: CLOSE });
    const tc = t - B.ring;
    const span = info.dur - B.ring;
    const cam = (depth) => LOOK.camera(ctx, { t: tc, dur: span, focus: [540, 640], push: 0.06, depth });
    const tHand = B.hand - B.ring, tGem = B.gem - B.ring;
    ctx.save();
    cam(0.55);
    ctx.drawImage(C.wall, 0, 0, 1080, 1080);
    ctx.restore();

    ctx.save();
    cam(1);
    ctx.drawImage(C.room, 0, 0, 1080, 1080);
    const V = sets().view(CLOSE);
    V.apply(ctx);
    const lift = 0.1 + 0.7 * LIB.ease.inOutSine(clamp01((tc - (tHand - 0.15)) / (tGem - tHand + 0.1)));
    const found = sstep(tGem - 0.2, tGem + 0.2, tc);
    const o = {
      x: HIP[0], y: HIP[1], h: JH, age: AGE, outfit: 'gown', pose: 'liftLiner', bed: true, lift, facing: 1, t,
      shadow: false, expr: found > 0.5 ? 'smileSmall' : 'neutral', exprAmt: 0.4 + 0.6 * found, blinkOffset: 0.6,
    };
    FILM.cast.sam(ctx, Object.assign({ layer: 'back' }, o));
    const hp = FILM.cast.sam.pose(o).helmet;
    FILM.cast.helmet(ctx, hp);
    FILM.cast.sam(ctx, Object.assign({ layer: 'front' }, o));
    ctx.restore();

    ctx.save();
    cam(0.7);
    LOOK.drawLight(ctx, C.light, { x: 6 * Math.sin(t * 0.3), alpha: 0.5 + 0.05 * Math.sin(t * 0.8) });
    ctx.restore();

    ctx.save();
    cam(1);
    const s = hp.size / 170;
    const rp = V.pt([hp.x, hp.y + (-6 - 20) * s]);
    const pulse = 0.5 + 0.5 * Math.sin(tc * 4.2);
    const env = LOOK.flashEnv(tc, tGem, { fall: 16 });
    const size = (6 + 5 * found + 4 * pulse * found + 10 * env);
    LOOK.glint(ctx, { x: rp[0], y: rp[1], size, alpha: 0.25 + 0.55 * found + 0.2 * env, rot: 0.1 * Math.sin(tc * 0.7) });
    if (env > 0.01) LOOK.bloom(ctx, { x: rp[0], y: rp[1], r: 70, alpha: 0.4 * env });
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const B = beats(info);
      sets().ward(S, { view: WIDE, curtainFront: CURTAIN_X });
      sets().ward(S, { view: MED, curtainFront: CURTAIN_X });
      sets().ward(S, { view: CLOSE });
      if (t < B.woke) drawWide(ctx, t, info, S, B, WIDE, 0, B.woke, [470, 560]);
      else if (t < B.nurse) drawWide(ctx, t, info, S, B, MED, B.woke, B.nurse, [500, 470]);
      else if (t < B.ring) drawWide(ctx, t, info, S, B, WIDE, B.nurse, B.ring, [600, 620]);
      else drawClose(ctx, t, info, S, B);
      const white = 0.9 * (1 - LIB.ease.inOutSine(clamp01(t / 2.2)));
      if (white > 0.002) {
        ctx.save();
        ctx.fillStyle = `rgba(252,253,250,${white})`;
        ctx.fillRect(0, 0, 1080, 1080);
        ctx.restore();
      }
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
