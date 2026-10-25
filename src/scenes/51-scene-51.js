// scenes/51-scene-51.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-51';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;

  const JO = { age: 21, outfit: 'swim' };
  const MO = { outfit: 'beach', swim: true };
  const CHIME_LEAD = 0.22;

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
    const turn = beatT(info, 'tokip tokaw toklx', 0.50);
    const glist = beatT(info, 'toklz', 2.38);
    const sea = beatT(info, 'tokmb tokay tokid', 5.57);
    const peak = wordT(info, 'toklz', 3.06) - CHIME_LEAD;
    return { turn, glist, sea, peak, cutB: Math.max(peak + 1.0, glist + 1.5), cutC: sea - 0.15 };
  }

  const LA = { mood: 'sunrise', horizon: 330, shore: 530, wet: 170 };
  const JHA = 1000;
  const JRA = FILM.cast.sam.height(Object.assign({ h: JHA }, JO));
  const MHA = JRA * 0.95;
  const FEET_A = 1420;
  const JXA = 900, MXA = JXA - 0.46 * JRA;
  const GL_A = [118, 660];

  const LB = { mood: 'sunrise', horizon: 360, shore: 590, wet: 250, run: 0.7 };
  const JHB = 220;
  const JRB = FILM.cast.sam.height(Object.assign({ h: JHB }, JO));
  const MHB = JRB * 0.95;
  const GROUND_B = 930;
  const JXB = 820, MXB = 742;
  const RING_BX = 330;

  const LC = { mood: 'sunrise', horizon: 140, shore: 452, wet: 430, run: 0.34 };
  const RING_C = [540, 700];
  const RING_SIZE = 120;
  const JHC = 1500;
  const HAND_L = 0.133 * JHC;
  const IN_HAND = [-0.62 * HAND_L, -0.04 * HAND_L];
  const LIFT_TO = [610, 430];

  function glintEnv(t, tp) {
    const rise = sstep(tp - 0.95, tp, t);
    const peak = Math.exp(-Math.pow((t - tp) / 0.26, 2));
    const tw = 0.5 + 0.5 * Math.sin(t * 6.1) * Math.sin(t * 2.3 + 1);
    return { base: rise * (0.55 + 0.25 * tw), peak };
  }
  function drawGlint(ctx, x, y, t, scale, a0, tp) {
    const G = glintEnv(t, tp);
    const a = Math.min(0.95, G.base + 0.55 * G.peak) * (a0 == null ? 1 : a0);
    if (a < 0.01) return;
    const size = scale * (6 + 12 * G.base + 30 * G.peak);
    LOOK.bloom(ctx, { x, y, r: scale * (24 + 74 * G.peak), alpha: (0.25 * G.base + 0.6 * G.peak) * (a0 == null ? 1 : a0) });
    const cg = ctx.createRadialGradient(x, y, 0, x, y, scale * (4 + 6 * G.peak));
    cg.addColorStop(0, `rgba(255,246,213,${a})`);
    cg.addColorStop(1, 'rgba(255,246,213,0)');
    ctx.fillStyle = cg;
    ctx.fillRect(x - 24 * scale, y - 24 * scale, 48 * scale, 48 * scale);
    LOOK.glint(ctx, { x, y, size: Math.min(44 * scale, size), alpha: a, rot: 0.08 * Math.sin(t * 0.7) });
    star(ctx, x, y, 0.7 * Math.min(44 * scale, size), 0.8 * a, 0.08 * Math.sin(t * 0.7));
  }
  function star(ctx, x, y, R, a, rot) {
    if (a <= 0.01 || R <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.42);
    core.addColorStop(0, `rgba(255,252,240,${a})`);
    core.addColorStop(1, 'rgba(255,246,222,0)');
    ctx.fillStyle = core;
    ctx.fillRect(-R * 0.42, -R * 0.42, R * 0.84, R * 0.84);
    ctx.fillStyle = `rgba(255,251,238,${0.9 * a})`;
    for (let i = 0; i < 4; i++) {
      const len = i % 2 ? R * 0.62 : R, wid = R * 0.13;
      ctx.beginPath();
      ctx.moveTo(0, -wid);
      ctx.quadraticCurveTo(len * 0.3, -wid * 0.25, len, 0);
      ctx.quadraticCurveTo(len * 0.3, wid * 0.25, 0, wid);
      ctx.closePath();
      ctx.fill();
      ctx.rotate(Math.PI / 2);
    }
    ctx.restore();
  }
  function dampPatch(ctx, x, y, r, a) {
    if (a <= 0.001) return;
    const pg = ctx.createRadialGradient(x, y + 0.08 * r, 0, x, y + 0.08 * r, r);
    pg.addColorStop(0, `rgba(96,70,44,${0.4 * a})`);
    pg.addColorStop(1, 'rgba(96,70,44,0)');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.ellipse(x, y + 0.08 * r, r, 0.28 * r, 0, 0, TAU);
    ctx.fill();
  }

  function drawA(ctx, t, info, S, B) {
    const BEACH = FILM.sets.beach;
    const C = BEACH.statics(S, LA);
    const cam = (g, d) => LOOK.camera(g, { t, dur: B.cutB, focus: [560, 560], push: 0.06, depth: d });
    BEACH.back(ctx, C, t, cam);

    const lean = LIB.ease.inOutSine(clamp01((t - B.turn) / 1.3));
    const see = sstep(B.peak - 0.35, B.peak + 0.1, t);
    const turnB = LIB.ease.inOutSine(clamp01((t - B.peak - 0.05) / 0.5));

    const jo = Object.assign({ x: JXA - 0.03 * JRA * lean, y: FEET_A, h: JHA, t, facing: -1, lean: 0.85 * lean, look: -0.05 - 0.1 * see, blinkOffset: 1.3 }, JO);
    jo.expr = see > 0.01 ? { smileSmall: 0.5 * (1 - see), closed: 0.3 * (1 - see), wide: see } : { smileSmall: 0.6, closed: 0.4 * lean };
    const mo = Object.assign({}, MO, {
      x: MXA, y: FEET_A, h: MHA, t, facing: 1, light: C.m.light, breeze: 0.4, pose: 'stand',
      look: 0.16 - 0.1 * turnB, front: 1.6 * turnB,
      expr: turnB > 0.3 ? { wonder: 0.8, loving: 0.2 } : { loving: 0.8, smileSoft: 0.2 },
    });

    ctx.save();
    cam(ctx, 1);
    FILM.cast.ava(ctx, mo);
    FILM.cast.sam(ctx, jo);
    dampPatch(ctx, GL_A[0], GL_A[1], 34, sstep(B.peak - 1, B.peak - 0.4, t));
    ctx.restore();
    BEACH.air(ctx, C, t, cam, 0.5);
    ctx.save();
    cam(ctx, 1);
    drawGlint(ctx, GL_A[0], GL_A[1], t, 1.6, null, B.peak);
    ctx.restore();
  }

  function waveOff(C, tPeak) {
    const P = C.m.period;
    return ((((0.58 - 0.15) * P - tPeak) % P) + P) % P;
  }
  function drawB(ctx, t, info, S, B) {
    const BEACH = FILM.sets.beach;
    const C = BEACH.statics(S, LB);
    const tb = t - B.cutB;
    const tw = t + waveOff(C, B.cutB + 0.25);
    const cam = (g, d) => LOOK.camera(g, { t: tb, dur: B.cutC - B.cutB, focus: [RING_BX, 720], push: 0.04, depth: d });
    BEACH.back(ctx, C, tw, cam);

    const edge = BEACH.swashY(C, RING_BX, tw);
    const top = C.L.shore + C.L.wet * C.L.run;
    const ringY = lerp(C.L.shore, top, 0.62);
    const bare = sstep(ringY + 6, ringY - 14, edge);

    const jo = Object.assign({ x: JXB, y: GROUND_B, h: JHB, t, facing: -1, pose: 'kneelOffer', poseAmt: 1, lean: 0.3, expr: 'wide', look: -0.1 }, JO);
    const JP = FILM.cast.sam.pose(jo);
    const mo = Object.assign({}, MO, { x: MXB, y: GROUND_B, h: MHB, t, facing: 1, light: C.m.light, breeze: 0.5, pose: 'kneelHold',
      target: { x: JP.hands[0][0] - 0.02 * JRB, y: JP.hands[0][1] }, front: 1.4, look: -0.05, expr: 'wonder' });

    ctx.save();
    cam(ctx, 1);
    dampPatch(ctx, RING_BX, ringY, 40, 1);
    FILM.cast.diamondRing(ctx, { x: RING_BX, y: ringY, size: 40, tilt: 0.45, rot: 0.55, t, sparkle: 0, shadow: 0.5, alpha: 0.35 + 0.65 * bare });
    const both = (g) => {
      FILM.cast.sam(g, Object.assign({ layer: 'back' }, jo));
      FILM.cast.ava(g, mo);
      FILM.cast.sam(g, Object.assign({ layer: 'front' }, jo));
    };
    LOOK.castShadow(ctx, { x: (JXB + MXB) / 2, y: GROUND_B, h: JRB, k: C.m.shadowK, S, alpha: C.m.shadowA, draw: both });
    LOOK.contactShadow(ctx, { x: (JXB + MXB) / 2, y: GROUND_B, h: JRB, rx: 0.5 * JRB, alpha: C.m.contactA });
    both(ctx);
    ctx.restore();
    BEACH.air(ctx, C, t, cam, 0.8);
    ctx.save();
    cam(ctx, 1);
    const shine = Math.exp(-Math.pow((tb - 0.95) / 0.35, 2));
    LOOK.bloom(ctx, { x: RING_BX + 5, y: ringY - 8, r: 34 + 50 * shine, alpha: (0.2 + 0.5 * shine) * (0.3 + 0.7 * bare) });
    const bs = (24 + 36 * shine + 6 * Math.sin(t * 5.3)) * (0.45 + 0.55 * bare);
    LOOK.glint(ctx, { x: RING_BX + 5, y: ringY - 8, size: bs, alpha: 0.5 + 0.45 * bare, rot: 0.06 * Math.sin(t) });
    star(ctx, RING_BX + 5, ringY - 8, 0.8 * bs, (0.4 + 0.5 * bare) * (0.6 + 0.4 * shine), 0.06 * Math.sin(t));
    ctx.restore();
  }

  const DROPS = (() => {
    const r = LIB.rng(sd('drops'));
    const out = [];
    for (let i = 0; i < 14; i++) out.push([0.15 + i * 0.16 + r.range(-0.05, 0.05), r.range(-0.3, 0.3), r.range(6, 9)]);
    return out;
  })();
  function drawC(ctx, t, info, S, B) {
    const BEACH = FILM.sets.beach;
    const C = BEACH.statics(S, LC);
    const tc = t - B.cutC;
    const dur = Math.max(0.5, info.dur - B.cutC);
    const cam = (g, d) => LOOK.camera(g, { t: tc, dur, focus: RING_C, push: 0.03, depth: d });
    BEACH.back(ctx, C, t + 1.6, cam);

    const tIn = B.sea - B.cutC;
    const come = LIB.ease.outCubic(clamp01((tc - tIn + 0.05) / 0.55));
    const lift = LIB.ease.inOutSine(clamp01((tc - tIn - 0.75) / 1.0));
    const ang = lerp(-0.55, -0.2, lift);
    const off = [IN_HAND[0] * Math.cos(ang) - IN_HAND[1] * Math.sin(ang), IN_HAND[0] * Math.sin(ang) + IN_HAND[1] * Math.cos(ang)];
    const away = [RING_C[0] + 520, RING_C[1] - 560];
    const grip = [RING_C[0] - off[0], RING_C[1] - off[1]];
    const held = [LIFT_TO[0] - off[0], LIFT_TO[1] - off[1]];
    const wrist = come < 1 ? [lerp(away[0], grip[0], come), lerp(away[1], grip[1], come)] : [lerp(grip[0], held[0], lift), lerp(grip[1], held[1], lift)];
    const ringAt = [wrist[0] + off[0], wrist[1] + off[1]];
    const ringP = lift > 0 ? ringAt : RING_C;

    ctx.save();
    cam(ctx, 1);
    const [rx, ry] = RING_C;
    const hg = ctx.createRadialGradient(rx, ry + 8, 0, rx, ry + 8, RING_SIZE * 0.9);
    hg.addColorStop(0, 'rgba(120,84,48,0.32)');
    hg.addColorStop(1, 'rgba(120,84,48,0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.ellipse(rx, ry + 8, RING_SIZE * 0.95, RING_SIZE * 0.3, 0, 0, TAU);
    ctx.fill();
    const sh = ctx.createRadialGradient(rx + 40, ry - 6, 0, rx + 40, ry - 6, RING_SIZE * 1.6);
    sh.addColorStop(0, 'rgba(255,224,170,0.22)');
    sh.addColorStop(1, 'rgba(255,224,170,0)');
    ctx.fillStyle = sh;
    ctx.fillRect(rx - 260, ry - 140, 520, 280);
    const ringO = { x: ringP[0], y: ringP[1], size: RING_SIZE, tilt: lerp(0.42, 0.2, lift), rot: lerp(0.55, 0.35, lift), spin: -0.12 + 0.2 * lift, t, light: -0.75, sparkle: 0, shadow: 0.7 * (1 - lift), env: '#a87a4a', lw: 3.5 };
    let R = FILM.cast.diamondRing(ctx, ringO);
    if (lift <= 0) {
      ctx.fillStyle = 'rgba(196,156,108,0.9)';
      ctx.beginPath();
      ctx.ellipse(rx - 5, ry + RING_SIZE * 0.08 + 5, RING_SIZE * 0.42, RING_SIZE * 0.07, -0.05, 0, Math.PI);
      ctx.fill();
    }
    if (come > 0.001) {
      const base = Object.assign({ x: 0, y: 0, h: JHC, t, facing: -1, pose: 'handshake', poseAmt: 1 }, JO);
      const W0 = FILM.cast.sam.pose(base).hands[0];
      ctx.save();
      ctx.translate(wrist[0], wrist[1]);
      ctx.rotate(ang);
      ctx.translate(-W0[0], -W0[1]);
      FILM.cast.sam(ctx, Object.assign({ layer: 'front' }, base));
      ctx.restore();
      if (come > 0.85) R = FILM.cast.diamondRing(ctx, Object.assign({}, ringO, { shadow: 0 }));
    }
    for (const [t0, dx, r] of DROPS) {
      const q = (tc - tIn - 0.8 - t0) / 0.42;
      if (q < 0) continue;
      const x = rx + dx * RING_SIZE * 0.3;
      if (q <= 1) {
        const from = [ringP[0] + dx * RING_SIZE * 0.3, ringP[1] + 0.3 * RING_SIZE];
        const y = lerp(from[1], ry + 6, q * q);
        ctx.fillStyle = 'rgba(214,236,246,0.9)';
        ctx.beginPath();
        ctx.ellipse(lerp(from[0], x, q), y, r * 0.6, r * 0.9, 0, 0, TAU);
        ctx.fill();
      } else {
        const a = 0.3 * (1 - clamp01((q - 1) / 3));
        ctx.strokeStyle = `rgba(120,84,48,${a})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(x, ry + 6, r * (1 + 0.4 * (q - 1)), r * 0.35 * (1 + 0.4 * (q - 1)), 0, 0, TAU);
        ctx.stroke();
      }
    }
    ctx.restore();

    BEACH.air(ctx, C, t, cam, 0.7);
    ctx.save();
    cam(ctx, 1);
    const beat = Math.exp(-Math.pow((tc - tIn - 0.05) / 0.3, 2));
    const up = Math.exp(-Math.pow((tc - tIn - 1.6) / 0.45, 2));
    const twk = 0.5 + 0.5 * Math.sin(t * 3.1) * Math.sin(t * 1.3 + 0.4);
    const gx = R ? R.glint[0] : ringP[0], gy = R ? R.glint[1] : ringP[1] - 0.3 * RING_SIZE;
    LOOK.bloom(ctx, { x: gx, y: gy, r: 60 + 70 * beat + 110 * up + 30 * lift, alpha: 0.32 + 0.35 * beat + 0.45 * up + 0.1 * lift });
    const gs = 44 + 14 * twk + 30 * beat + 50 * up + 16 * lift;
    LOOK.glint(ctx, { x: gx, y: gy, size: gs, alpha: 0.7 + 0.25 * Math.max(beat, up, twk), rot: 0.06 * Math.sin(t * 0.6) });
    star(ctx, gx, gy, 0.8 * gs, 0.55 + 0.4 * Math.max(beat, up, 0.5 * twk), 0.06 * Math.sin(t * 0.6));
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const B = beats(info);
      const BEACH = FILM.sets.beach;
      for (const L of [LA, LB, LC]) BEACH.statics(S, L);
      let C;
      if (t < B.cutB) { drawA(ctx, t, info, S, B); C = BEACH.statics(S, LA); }
      else if (t < B.cutC) { drawB(ctx, t, info, S, B); C = BEACH.statics(S, LB); }
      else { drawC(ctx, t, info, S, B); C = BEACH.statics(S, LC); }
      BEACH.grade(ctx, C, 1);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
