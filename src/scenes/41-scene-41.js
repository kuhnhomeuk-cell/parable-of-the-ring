// scenes/41-scene-41.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-41';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const SET = () => FILM.sets.wedding;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { sstep, vgrad, hgrad, poly, makeLayer, TAU, lerp } = LOOK;
  const W = 1080;
  const H = 1080;
  const texture = (c, S, n, o) => LOOK.texture(c, S, Object.assign({ seed: sd('tex', n), offset: n * 13.7 }, o));
  const ease = LIB.ease.inOutSine;

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
  let F = null;
  function fractions(info) {
    const b = info.shot.beats || [];
    const L = lines(info);
    const dur = info.dur;
    const knelt = word(L, 0, 'tokjm', 0.46), fin = word(L, 0, 'tokjn', 1.12), ring = word(L, 0, 'tokap', 2.52);
    const its = b[1] ? b[1].t : 3.41, but = word(L, 1, 'tokcm', 5.24), love = word(L, 1, 'tokjq', 5.76), more = word(L, 1, 'tokjr', 6.55);
    const it = b[2] ? b[2].t : 7.54, wasnt = word(L, 2, 'tokjs', 7.69), had = b[3] ? b[3].t : 9.97;
    const T = {
      kneel0: knelt - 0.3, kneel1: knelt + 0.5,
      open0: fin, open1: fin + 0.5,
      glint: ring,
      reach0: ring, reach1: ring + 0.45,
      slip0: ring + 0.48, slip1: its,
      step0: but, step1: but + 1.1,
      rise0: but + 0.1, rise1: but + 1.0,
      hug0: love, hug1: more,
      cut: it,
      sad: wasnt,
      had,
    };
    const f = {};
    for (const k in T) f[k] = T[k] / dur;
    return f;
  }

  const FLOOR_Y = 700;
  const FEET = 862;
  const JX = 420;
  const JO = { h: 330, age: 21, outfit: 'tux' };
  const MX0 = 652;
  const HUG_D = [104, 121];
  const HUG_K = 1.12;
  const LAMP = [902, 520];
  const WIN = { x0: 372, x1: 596, y0: 108, y1: 420 };
  const SHADOW_K = LOOK.shadowK(Math.PI - 0.22, 0.55);
  const ZOOM = 2.3;

  function buildWall(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = hgrad(g, 0, W, [[0, 'rgb(96,64,70)'], [0.45, 'rgb(150,100,92)'], [0.8, 'rgb(214,160,128)'], [1, 'rgb(226,176,138)']]);
    g.fillRect(0, 0, W, FLOOR_Y + 4);
    for (let x = 8; x < W; x += 34) {
      g.fillStyle = 'rgba(255,226,190,0.06)';
      g.fillRect(x, 0, 12, 520);
      g.fillStyle = 'rgba(70,36,40,0.06)';
      g.fillRect(x + 14, 0, 2, 520);
    }
    const rp = LIB.rng(sd('sprig'));
    for (let y = 30; y < 500; y += 46) {
      for (let x = 25 + ((y / 46) % 2) * 17; x < W; x += 34) {
        g.fillStyle = `rgba(250,214,180,${0.08 + 0.04 * rp()})`;
        g.beginPath();
        g.arc(x, y, 2.4, 0, TAU);
        g.fill();
      }
    }
    g.fillStyle = vgrad(g, 0, 160, [[0, 'rgba(40,20,30,0.45)'], [1, 'rgba(40,20,30,0)']]);
    g.fillRect(0, 0, W, 160);
    g.fillStyle = 'rgb(236,206,170)';
    g.fillRect(0, 516, W, 9);
    g.fillStyle = 'rgba(70,40,40,0.35)';
    g.fillRect(0, 525, W, 3);
    g.fillStyle = hgrad(g, 0, W, [[0, 'rgb(110,74,72)'], [0.5, 'rgb(170,124,104)'], [1, 'rgb(222,174,136)']]);
    g.fillRect(0, 528, W, FLOOR_Y - 528);
    for (let x = 20; x < W; x += 132) {
      g.fillStyle = 'rgba(60,30,30,0.18)';
      g.fillRect(x, 548, 104, 124);
      g.fillStyle = 'rgba(255,226,190,0.08)';
      g.fillRect(x + 2, 550, 100, 2);
    }
    g.fillStyle = 'rgb(84,54,48)';
    g.fillRect(0, FLOOR_Y - 14, W, 14);
    const C = SET().statics(S);
    const { x0, x1, y0, y1 } = WIN;
    g.fillStyle = 'rgb(232,210,186)';
    g.fillRect(x0 - 14, y0 - 14, x1 - x0 + 28, y1 - y0 + 28);
    g.drawImage(C.nightFar, 640 * S, 60 * S, 330 * S, 460 * S, x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = 'rgba(30,40,80,0.12)';
    g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = 'rgb(226,204,180)';
    g.fillRect((x0 + x1) / 2 - 4, y0, 8, y1 - y0);
    g.fillRect(x0, y0 + (y1 - y0) * 0.42 - 4, x1 - x0, 8);
    g.fillStyle = 'rgba(255,255,255,0.08)';
    poly(g, [[x0 + 30, y0], [x0 + 60, y0], [x0 + 10, y1], [x0, y1]]);
    g.fill();
    g.fillStyle = 'rgb(240,218,190)';
    g.fillRect(x0 - 26, y1 + 12, x1 - x0 + 52, 12);
    g.fillStyle = 'rgba(60,30,30,0.3)';
    g.fillRect(x0 - 26, y1 + 24, x1 - x0 + 52, 5);
    const drape = (xa, xb, side) => {
      g.fillStyle = hgrad(g, xa, xb, side < 0 ? [[0, 'rgb(110,48,58)'], [1, 'rgb(150,68,74)']] : [[0, 'rgb(170,82,84)'], [1, 'rgb(200,104,96)']]);
      g.beginPath();
      g.moveTo(xa, y0 - 30);
      g.lineTo(xb, y0 - 30);
      if (side < 0) {
        g.quadraticCurveTo(xb + 10, y0 + 150, xb - 30, y0 + 226);
        g.quadraticCurveTo(xb - 4, y0 + 330, xb + 8, 512);
        g.lineTo(xa, 512);
      } else {
        g.lineTo(xb, 512);
        g.lineTo(xa - 8, 512);
        g.quadraticCurveTo(xa + 4, y0 + 330, xa + 30, y0 + 226);
        g.quadraticCurveTo(xa - 10, y0 + 150, xa, y0 - 30);
      }
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(60,20,30,0.25)';
      g.lineWidth = 2;
      for (let k = 1; k < 4; k++) {
        const x = lerp(xa, xb, k / 4);
        g.beginPath();
        g.moveTo(x, y0 - 28);
        g.quadraticCurveTo(x - side * 8, y0 + 226, x + side * 4, 510);
        g.stroke();
      }
      g.fillStyle = 'rgb(226,180,96)';
      g.fillRect(side < 0 ? xb - 52 : xa + 18, y0 + 222, 34, 8);
    };
    drape(x0 - 70, x0 + 26, -1);
    drape(x1 - 26, x1 + 70, 1);
    g.fillStyle = 'rgb(130,56,64)';
    g.fillRect(x0 - 84, y0 - 46, x1 - x0 + 168, 30);
    g.fillStyle = 'rgba(255,214,170,0.25)';
    g.fillRect(x0 - 84, y0 - 46, x1 - x0 + 168, 3);
    g.fillStyle = 'rgb(176,130,70)';
    g.fillRect(70, 196, 170, 120);
    g.fillStyle = vgrad(g, 206, 306, [[0, 'rgb(150,140,150)'], [0.55, 'rgb(170,150,140)'], [0.56, 'rgb(90,110,120)'], [1, 'rgb(80,96,104)']]);
    g.fillRect(80, 206, 150, 100);
    texture(c, S, 1, { mottle: 0.05, dark: 0.04, light: 0.03, glow: { x: LAMP[0], y: LAMP[1], r: 640, amount: 0.22, color: [255, 214, 160] } });
    return c;
  }

  function buildRoom(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = vgrad(g, FLOOR_Y, H, [[0, 'rgb(92,58,46)'], [1, 'rgb(118,74,54)']]);
    g.fillRect(-20, FLOOR_Y, W + 40, H - FLOOR_Y + 20);
    g.fillStyle = hgrad(g, 0, W, [[0, 'rgba(30,16,24,0.35)'], [0.6, 'rgba(30,16,24,0)'], [1, 'rgba(255,200,140,0.12)']]);
    g.fillRect(-20, FLOOR_Y, W + 40, H - FLOOR_Y + 20);
    const rb = LIB.rng(sd('boards'));
    for (let i = 0; i < 9; i++) {
      const y = FLOOR_Y + 6 + i * i * 5 + i * 12;
      g.fillStyle = 'rgba(40,20,20,0.3)';
      g.fillRect(-20, y, W + 40, 1.4 + i * 0.2);
      for (let k = 0; k < 4; k++) g.fillRect(rb() * W, y, 1.4, 12 + i * 6);
    }
    g.fillStyle = 'rgba(20,10,20,0.3)';
    g.beginPath();
    g.ellipse(560, 912, 420, 104, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(196,150,86)';
    g.beginPath();
    g.ellipse(560, 904, 410, 98, 0, 0, TAU);
    g.fill();
    g.fillStyle = vgrad(g, 810, 1000, [[0, 'rgb(46,78,90)'], [1, 'rgb(36,62,74)']]);
    g.beginPath();
    g.ellipse(560, 904, 392, 88, 0, 0, TAU);
    g.fill();
    g.strokeStyle = 'rgba(214,170,100,0.45)';
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(560, 904, 330, 66, 0, 0, TAU);
    g.stroke();
    g.fillStyle = vgrad(g, 380, 640, [[0, 'rgb(160,110,104)'], [1, 'rgb(120,80,80)']]);
    g.beginPath();
    g.moveTo(-40, 640);
    g.lineTo(-40, 420);
    g.quadraticCurveTo(130, 360, 300, 420);
    g.lineTo(300, 640);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(60,30,30,0.3)';
    for (let r = 0; r < 3; r++) {
      for (let k = 0; k < 6; k++) {
        g.beginPath();
        g.arc(-10 + k * 56 + (r % 2) * 28, 460 + r * 50, 3, 0, TAU);
        g.fill();
      }
    }
    g.fillStyle = vgrad(g, 600, 790, [[0, 'rgb(236,226,220)'], [0.4, 'rgb(220,206,204)'], [1, 'rgb(170,150,156)']]);
    g.beginPath();
    g.moveTo(-40, 610);
    g.lineTo(316, 610);
    g.quadraticCurveTo(334, 612, 336, 640);
    g.lineTo(340, 780);
    g.lineTo(-40, 790);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(110,80,100,0.25)';
    g.fillRect(-40, 690, 380, 4);
    for (const [x, w] of [[10, 130], [150, 130]]) {
      g.fillStyle = 'rgb(246,238,232)';
      g.beginPath();
      g.ellipse(x + w / 2, 596, w / 2, 26, 0, 0, TAU);
      g.fill();
      g.fillStyle = 'rgba(150,120,130,0.25)';
      g.beginPath();
      g.ellipse(x + w / 2, 606, w / 2 - 8, 12, 0, 0, Math.PI);
      g.fill();
    }
    const rr = LIB.rng(sd('petals'));
    for (let i = 0; i < 34; i++) {
      const a = rr() * TAU, d = Math.sqrt(rr());
      g.fillStyle = rr() < 0.5 ? 'rgb(192,40,60)' : 'rgb(220,70,86)';
      g.beginPath();
      g.ellipse(160 + Math.cos(a) * d * 120, 650 + Math.sin(a) * d * 26, 5, 3, rr() * TAU, 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgba(20,10,16,0.35)';
    poly(g, [[-40, 790], [340, 780], [300, 820], [-40, 830]]);
    g.fill();
    g.fillStyle = 'rgb(110,66,48)';
    g.fillRect(820, 640, 170, 22);
    g.fillStyle = hgrad(g, 826, 984, [[0, 'rgb(96,58,44)'], [1, 'rgb(140,90,62)']]);
    g.fillRect(826, 662, 158, 104);
    g.fillStyle = 'rgba(40,20,16,0.35)';
    g.fillRect(836, 700, 138, 2);
    g.fillStyle = 'rgb(226,180,96)';
    g.beginPath();
    g.arc(905, 682, 4, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(80,48,36)';
    g.fillRect(834, 766, 10, 30);
    g.fillRect(966, 766, 10, 30);
    g.fillStyle = 'rgba(20,10,16,0.35)';
    g.beginPath();
    g.ellipse(880, 800, 120, 10, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(200,150,80)';
    g.fillRect(896, 570, 10, 70);
    g.beginPath();
    g.ellipse(901, 640, 28, 6, 0, 0, TAU);
    g.fill();
    g.fillStyle = vgrad(g, 470, 572, [[0, 'rgb(255,236,196)'], [1, 'rgb(250,206,150)']]);
    poly(g, [[858, 472], [944, 472], [970, 572], [832, 572]]);
    g.fill();
    g.strokeStyle = 'rgba(200,140,90,0.35)';
    g.lineWidth = 1.4;
    for (let k = 1; k < 8; k++) {
      g.beginPath();
      g.moveTo(858 + k * (86 / 8), 472);
      g.lineTo(832 + k * (138 / 8), 572);
      g.stroke();
    }
    for (const x of [846, 958]) {
      g.fillStyle = 'rgba(255,240,210,0.55)';
      poly(g, [[x - 7, 604], [x + 7, 604], [x + 2, 624], [x - 2, 624]]);
      g.fill();
      g.fillStyle = 'rgba(255,240,210,0.6)';
      g.fillRect(x - 1, 624, 2, 12);
      g.fillRect(x - 6, 636, 12, 2);
    }
    texture(c, S, 2, { mottle: 0.07, dark: 0.06, light: 0.04, glow: { x: LAMP[0], y: LAMP[1], r: 620, amount: 0.25, color: [255, 214, 160] } });
    return c;
  }

  function buildLight(S) {
    return LOOK.lightLayer(S, {
      fields: [
        LOOK.glowField({ x: LAMP[0], y: LAMP[1], r: 520, amount: 0.5 }),
        LOOK.glowField({ x: LAMP[0], y: LAMP[1] + 10, r: 120, amount: 0.7 }),
      ],
      color: [255, 206, 146],
    });
  }
  function buildMoon(S) {
    const cx = (WIN.x0 + WIN.x1) / 2, cy = (WIN.y0 + WIN.y1) / 2;
    const beam = LOOK.beamField({ beams: [[0.94 * cx + 0.34 * cy, 100, 0.5]], dir: [0.94, 0.34], noise: { base: 0.85, amp: 0.3, scale: 6, offset: 1, row: 2.5 } });
    return LOOK.lightLayer(S, {
      fields: [
        (X, Y) => beam(X, Y) * sstep(WIN.y0, WIN.y1, Y) * (1 - sstep(880, 1060, Y)) * 0.5,
        LOOK.glowField({ x: cx, y: cy, r: 200, amount: 0.25 }),
      ],
      color: [170, 190, 255],
    });
  }

  let CACHE = null;
  function statics(S) {
    if (CACHE && CACHE.S === S) return CACHE;
    CACHE = { S, wall: buildWall(S), room: buildRoom(S), light: buildLight(S), moon: buildMoon(S) };
    return CACHE;
  }

  function action(t, dur) {
    const at = (f) => f * dur;
    const seg = (a, b) => ease((t - at(a)) / (at(b) - at(a)));
    const JH = FILM.cast.sam.height(JO);
    const kneel = seg(F.kneel0, F.kneel1) * (1 - seg(F.rise0, F.rise1));
    const hug = seg(F.hug0, F.hug1);
    const open = seg(F.open0, F.open1);
    const reach = seg(F.reach0, F.reach1);
    const slip = seg(F.slip0, F.slip1);
    const step = seg(F.step0, F.step1);
    const took = t >= at(F.slip0);
    const sad = seg(F.sad, F.sad + 0.035);
    const had = seg(F.had, F.had + 0.02);

    const jo = Object.assign({ x: JX, y: FEET, t, facing: 1 }, JO);
    if (hug > 0) Object.assign(jo, { pose: 'hug', poseAmt: hug });
    else Object.assign(jo, { pose: 'kneelOffer', poseAmt: kneel, look: 0.25 * open });
    if (t < at(F.sad)) Object.assign(jo, hug > 0 ? { expr: 'happy', exprAmt: 1 } : { expr: 'smileSmall', exprAmt: 0.4 + 0.6 * open });
    else if (t < at(F.had)) Object.assign(jo, sad < 0.3 ? { expr: 'happy', exprAmt: 1 - sad / 0.3 } : { expr: 'disappointed', exprAmt: (sad - 0.3) / 0.7 });
    else Object.assign(jo, had < 0.25 ? { expr: 'disappointed', exprAmt: 1 - had / 0.25 } : { expr: 'closed', exprAmt: (had - 0.25) / 0.75 });
    jo.lean = 0.35 * had;

    const k = 1 + (HUG_K - 1) * step;
    const mh = JH * 0.95 * k;
    const sx = lerp(MX0, JX + HUG_D[0], step) - 6 * had;
    const sy = FEET + HUG_D[1] * step;
    const box0 = FILM.cast.sam.pose(Object.assign({}, jo, { pose: 'kneelOffer', poseAmt: Math.max(kneel, 0.001) })).box;
    const mo = { x: sx, y: sy, h: mh, t, facing: -1, outfit: 'bride', breeze: 0.15 };
    const s = mh / 330;
    if (step > 0) {
      const w = 0.7 * Math.sin(Math.PI * step);
      mo.pose = { showHand: (1 - step) * (1 - w), walk: w, hug: step * (1 - w) };
      mo.walk = Math.hypot(sx - MX0, sy - FEET) / (2 * FILM.cast.ava.STEP * mh);
      mo.target = { x: sx - 84 * s, y: sy - 188 * s };
      mo.expr = { smilePolite: 1 - step, loving: step };
    } else if (slip > 0) {
      mo.pose = { hug: 1 - slip, showHand: slip };
      mo.target = { x: box0[0], y: box0[1] - 10 };
      mo.expr = 'smilePolite';
    } else {
      mo.pose = { stand: 1 - reach, hug: reach };
      mo.target = { x: box0[0] + 6, y: box0[1] - 12 };
      mo.expr = { neutral: 1 - open, smileSoft: open * (1 - reach), smilePolite: open * reach };
      mo.look = -0.25 * reach;
    }
    return { jo, mo, open, took, slip, step, hug, kneel, sad, had, JH, mh };
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const dur = info.dur;
      const t = Math.max(0, Math.min(tIn, dur));
      const S = info.S || FILM.S || 1;
      const C = statics(S);
      F = fractions(info);
      const A = action(t, dur);

      const SET4 = [
        [0, 1, null, null],
        [F.glint * dur, 1.3, [640, 650], [540, 560]],
        [F.step0 * dur, 1.75, [490, 600], [540, 520]],
        [F.cut * dur, ZOOM, [JX + 30, FEET - 0.8 * A.JH], [470, 500]],
      ];
      let si = 0;
      while (si < SET4.length - 1 && t >= SET4[si + 1][0]) si++;
      const [h0, z0, fp, ap] = SET4[si];
      const h1 = si < SET4.length - 1 ? SET4[si + 1][0] : dur;
      const cam = (d) => {
        if (!fp) return LOOK.camera(ctx, { t, dur: h1, focus: [560, 640], push: 0.045, depth: d });
        const z = z0 * (1 + 0.035 * sstep(h0, h1, t));
        const zd = 1 + (z - 1) * d;
        ctx.translate(ap[0], ap[1]);
        ctx.scale(zd, zd);
        ctx.translate(-fp[0], -fp[1]);
      };

      ctx.save();
      cam(0.6);
      ctx.drawImage(C.wall, 0, 0, W, H);
      ctx.restore();

      ctx.save();
      cam(1);
      ctx.drawImage(C.room, 0, 0, W, H);
      const { jo, mo } = A;
      LOOK.castShadow(ctx, { x: jo.x, y: jo.y, h: A.JH, k: SHADOW_K, S, alpha: 0.24, draw: (g) => FILM.cast.sam(g, jo) });
      LOOK.contactShadow(ctx, { x: jo.x, y: jo.y, h: A.JH, alpha: 0.4 });
      LOOK.castShadow(ctx, { x: mo.x, y: mo.y, h: A.mh, k: SHADOW_K, S, alpha: 0.22, draw: (g) => FILM.cast.ava(g, mo) });
      LOOK.contactShadow(ctx, { x: mo.x, y: mo.y, h: A.mh, rx: 90, alpha: 0.38 });

      const lw = Math.max(2.5, 6 * (A.JH / 370));
      FILM.cast.sam(ctx, Object.assign({ layer: 'back' }, jo));
      let boxGlint = 0, boxAt = null;
      {
        const pb = FILM.cast.sam.pose(Object.assign({}, jo, { pose: 'kneelOffer', poseAmt: Math.max(A.kneel, 0.001) })).box;
        const down = sstep(F.rise0 * dur - 0.1, F.rise0 * dur + 0.3, t);
        const bx = lerp(pb[0], JX - 20, down), by = lerp(pb[1], FEET + 4, down);
        const glintEnv = Math.exp(-Math.pow((t - F.glint * dur) / 0.35, 2));
        if (A.kneel > 0.2 || down > 0.5) {
          FILM.cast.ringBox(ctx, { x: bx, y: by, size: 50, alpha: Math.max(sstep(0.2, 0.55, A.kneel), down), open: A.open * (1 - 0.6 * down), ring: !A.took, t, light: -0.6, sparkle: A.took ? 0 : 0.35 + 0.65 * glintEnv, lw: lw * 0.8 });
          boxGlint = A.took ? 0 : glintEnv * A.open;
          boxAt = [bx + 1, by - 27];
        }
      }
      FILM.cast.ava(ctx, mo);
      let ringAt = null;
      if (A.took) {
        const p = FILM.cast.ava.pose(mo);
        const k = A.step > 0 ? 1 : sstep(0.25, 0.9, A.slip);
        const from = p.palms[1], to = p.rings[0];
        ringAt = [lerp(from[0], to[0], k), lerp(from[1], to[1], k)];
        FILM.cast.diamondRing(ctx, { x: ringAt[0], y: ringAt[1], size: 0.034 * mo.h, rot: 1.25, tilt: 0.1, spin: p.handAngles[0] + Math.PI / 2, t, shadow: 0, lw: lw * 0.6 });
      }
      FILM.cast.sam(ctx, Object.assign({ layer: 'front' }, jo));
      ctx.restore();

      ctx.save();
      cam(0.8);
      LOOK.drawLight(ctx, C.moon, { alpha: 0.6 });
      LOOK.drawLight(ctx, C.light, { alpha: 0.8 + 0.04 * Math.sin(t * 1.3) });
      ctx.restore();

      if (boxGlint > 0.02) {
        ctx.save();
        cam(1);
        LOOK.glint(ctx, { x: boxAt[0], y: boxAt[1], size: 10 + 18 * boxGlint, alpha: 0.9 * boxGlint, rot: 0.08 * Math.sin(t * 0.8) });
        LOOK.bloom(ctx, { x: boxAt[0], y: boxAt[1], r: 40, alpha: 0.35 * boxGlint });
        ctx.restore();
      }
      if (ringAt && A.step < 0.6) {
        const show = sstep(F.slip1 * dur - 0.1, F.slip1 * dur + 0.2, t) * (1 - sstep(F.step0 * dur, F.step0 * dur + 0.3, t));
        if (show > 0.01) {
          ctx.save();
          cam(1);
          LOOK.glint(ctx, { x: ringAt[0], y: ringAt[1] - 0.034 * mo.h * 0.7, size: 14 + 8 * show, alpha: 0.85 * show, rot: 0.1 * Math.sin(t) });
          ctx.restore();
        }
      }

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
