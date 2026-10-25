// scenes/04-scene-04.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-04';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const TAU = Math.PI * 2;
  const W = 1080, H = 1080;
  const { sstep, clamp01, lerp, makeLayer, poly, vgrad, hgrad, fbm, vn, shade } = LOOK;
  const SET = () => FILM.sets.corner;

  const PAN = 270;
  const LW = W + PAN + 40;
  const SUN = [1280, -120];
  const HORIZON = 600;
  const FEET = 872;
  const JH = 320;
  const X0 = 150, SPEED = 122;
  const SHADOW_K = [0.9, -0.14];
  const PAR = { far: 0.25, back: 0.42, mid: 0.7, near: 1, air: 0.7 };
  const HAZE = [240, 228, 204];
  const col = (c, hz, a) => LOOK.col(c, hz, a, HAZE);
  const texture = (c, S, n, o) => LOOK.texture(c, S, Object.assign({ seed: sd('tex', n), offset: n * 11.3 }, o));
  const SUNLIGHT = { x: SUN[0] - 200, y: SUN[1], r: 900, amount: 0.22 };

  function buildFar(S) {
    const { c, g } = makeLayer(S, 1, LW, H);
    g.fillStyle = vgrad(g, 0, HORIZON, [[0, 'rgb(118,160,184)'], [0.35, 'rgb(162,190,198)'], [0.7, 'rgb(220,218,198)'], [1, 'rgb(244,228,194)']]);
    g.fillRect(0, 0, LW, H);
    LOOK.haze(g, { x: SUN[0] - 250, y: SUN[1], r: 1150, w: LW });
    for (const [x, y, rx, ry, a] of [[200, 150, 280, 8, 0.36], [620, 90, 300, 9, 0.3], [900, 220, 220, 6, 0.28], [420, 300, 300, 6, 0.26], [1200, 160, 240, 7, 0.3]]) {
      g.fillStyle = `rgba(255,248,232,${a})`;
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0, 0, TAU);
      g.fill();
    }
    const hill = (base, amp, sc, seed, top, bot) => {
      g.beginPath();
      g.moveTo(-20, H);
      for (let x = -20; x <= LW + 20; x += 4) g.lineTo(x, base - amp * fbm(x * sc + seed, seed * 0.37, 3));
      g.lineTo(LW + 20, H);
      g.closePath();
      g.fillStyle = vgrad(g, base - amp, HORIZON + 20, [[0, top], [1, bot]]);
      g.fill();
    };
    hill(560, 130, 1 / 380, 13, 'rgb(186,198,194)', 'rgb(214,212,196)');
    hill(586, 70, 1 / 240, 29, 'rgb(162,182,170)', 'rgb(198,202,184)');
    const r = LIB.rng(sd('treeline'));
    for (let x = -20; x < LW + 30; x += r.range(18, 34)) {
      const rr = r.range(16, 30);
      g.fillStyle = col([120, 150, 120], 0.45);
      g.beginPath();
      g.arc(x, 600 - rr * 0.6, rr, 0, TAU);
      g.fill();
      g.fillStyle = col([160, 182, 136], 0.45);
      g.beginPath();
      g.arc(x + rr * 0.25, 600 - rr * 0.85, rr * 0.55, 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgb(164,180,140)';
    g.fillRect(0, 598, LW, H - 598);
    texture(c, S, 1, { mottle: 0.05, dark: 0.04, light: 0.03 });
    return c;
  }

  const SCHOOL = { x: 660, base: 660, w: 300 };

  function school(g) {
    const { x, base, w } = SCHOOL;
    const hz = 0.42;
    const L = x - w / 2, h = 96;
    g.fillStyle = hgrad(g, L, L + w, [[0, col([150, 82, 64], hz)], [1, col([184, 104, 76], hz)]]);
    g.fillRect(L, base - h, w, h);
    g.fillStyle = col([172, 96, 72], hz);
    g.fillRect(x - 46, base - h - 30, 92, h + 30);
    g.fillStyle = col([232, 222, 200], hz);
    poly(g, [[x - 52, base - h - 28], [x, base - h - 58], [x + 52, base - h - 28]]);
    g.fill();
    g.fillRect(L - 4, base - h - 4, w + 8, 6);
    g.beginPath();
    g.arc(x, base - h - 4, 10, 0, TAU);
    g.fillStyle = col([246, 240, 226], hz);
    g.fill();
    g.fillStyle = col([232, 222, 200], hz);
    g.fillRect(x - 22, base - 44, 44, 44);
    g.fillStyle = col([100, 70, 56], hz);
    g.fillRect(x - 16, base - 38, 32, 38);
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 10; i++) {
        const wx = L + 12 + i * 29;
        if (wx > x - 56 && wx < x + 46) continue;
        g.fillStyle = col([232, 222, 200], hz);
        g.fillRect(wx - 1.5, base - h + 12 + row * 42 - 1.5, 17, 27);
        g.fillStyle = col([110, 132, 146], hz);
        g.fillRect(wx, base - h + 12 + row * 42, 14, 24);
      }
    }
    g.fillStyle = col([200, 200, 196], hz);
    g.fillRect(L - 30, base - 170, 2.5, 170);
    const fx = L - 27.5, fy = base - 168;
    for (let i = 0; i < 7; i++) {
      g.fillStyle = col(i % 2 ? [244, 240, 232] : [190, 60, 56], hz);
      g.fillRect(fx, fy + i * 3.4, 44, 3.4);
    }
    g.fillStyle = col([60, 70, 120], hz);
    g.fillRect(fx, fy, 18, 13.6);
    g.save();
    g.font = 'bold 9px Georgia, serif';
    g.textAlign = 'center';
    if ('letterSpacing' in g) g.letterSpacing = '1.5px';
    g.fillStyle = col([246, 240, 226], hz);
    g.fillText('HIGH SCHOOL', x, base - h - 12);
    g.restore();
  }

  function buildBack(S) {
    const { c, g } = makeLayer(S, 1, LW, H);
    g.fillStyle = vgrad(g, 600, 760, [[0, 'rgb(176,188,150)'], [1, 'rgb(150,172,118)']]);
    g.fillRect(-20, 600, LW + 40, 200);
    g.fillStyle = col([226, 218, 200], 0.4);
    g.fillRect(-20, 664, LW + 40, 8);
    g.fillStyle = col([186, 180, 170], 0.4);
    g.fillRect(-20, 672, LW + 40, 14);
    const CORNER = SET();
    const r = LIB.rng(sd('back'));
    const BODIES = [[234, 228, 212], [232, 214, 164], [180, 198, 208], [226, 196, 182]];
    for (let x = 20; x < LW; x += r.range(110, 150)) {
      if (x > 440 && x < 880) continue;
      if (r() < 0.35) CORNER.roundTree(g, x, 662, 40, (x | 0) % 97, 'summer', 0.45);
      else CORNER.houseFront(g, { x, base: 662, w: r.range(70, 90), h: 44, type: r() < 0.5 ? 'gable' : 'side', body: BODIES[(r() * 4) | 0], roof: [120, 108, 112], trim: [244, 240, 228], hz: 0.45 });
    }
    school(g);
    CORNER.roundTree(g, 860, 664, 46, 41, 'summer', 0.45);
    CORNER.roundTree(g, 470, 664, 44, 43, 'summer', 0.45);
    texture(c, S, 2, { mottle: 0.05, dark: 0.04, light: 0.03 });
    return c;
  }

  const KIDS = [
    [250, 26, [196, 70, 64], [80, 96, 140], [60, 110, 160], [70, 50, 36], 0.0],
    [282, 24, [236, 200, 90], [96, 90, 110], [170, 60, 60], [40, 30, 26], 0.5],
    [360, 28, [90, 140, 110], [70, 84, 120], [220, 160, 70], [120, 80, 46], 0.25],
    [420, 22, [150, 110, 190], [84, 90, 104], [80, 120, 90], [30, 24, 20], 0.7],
    [448, 23, [230, 230, 220], [70, 96, 150], [190, 70, 60], [96, 66, 40], 0.1],
  ];
  function kids(ctx, t) {
    const hz = 0.42;
    for (const [x0, v, shirt, pants, pack, hair, ph] of KIDS) {
      const x = x0 + v * t, y = 668;
      const p = TAU * (t * 1.6 + ph);
      const bob = Math.abs(Math.sin(p)) * 1.2;
      ctx.fillStyle = col(pants, hz);
      ctx.save();
      ctx.translate(x, y - 14);
      for (const s of [-1, 1]) {
        ctx.save();
        ctx.rotate(0.35 * Math.sin(p) * s);
        ctx.fillRect(-1.6, 0, 3.2, 14);
        ctx.restore();
      }
      ctx.restore();
      ctx.fillStyle = col(shirt, hz);
      ctx.fillRect(x - 4.5, y - 28 - bob, 9, 15);
      ctx.fillStyle = col(pack, hz);
      ctx.fillRect(x - 9, y - 27 - bob, 5, 10);
      ctx.fillStyle = col([232, 190, 160], hz);
      ctx.beginPath();
      ctx.arc(x + 0.5, y - 34 - bob, 6, 0, TAU);
      ctx.fill();
      ctx.fillStyle = col(hair, hz);
      ctx.beginPath();
      ctx.arc(x - 0.5, y - 36 - bob, 6, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();
    }
  }

  const HOUSES = [
    { x: 120, base: 744, w: 260, h: 150, type: 'side', body: [232, 214, 164], roof: [146, 92, 80], trim: [244, 240, 228], shutter: [70, 96, 80], chimney: true, porch: true },
    { x: 520, base: 744, w: 200, h: 140, type: 'gable', body: [180, 198, 208], roof: [92, 88, 96], trim: [244, 240, 228], shutter: [60, 74, 96], porch: true },
    { x: 1010, base: 744, w: 240, h: 150, type: 'side', body: [234, 228, 212], roof: [112, 110, 120], trim: [244, 240, 228], shutter: [130, 60, 52], chimney: true, porch: true },
    { x: 1350, base: 744, w: 200, h: 136, type: 'gable', body: [226, 196, 182], roof: [128, 104, 96], trim: [244, 240, 228], porch: true },
  ];

  function buildMid(S) {
    const { c, g } = makeLayer(S, 1, LW, H);
    const CORNER = SET();
    for (const h of HOUSES) CORNER.houseFront(g, Object.assign({ hz: 0.08 }, h));
    const r = LIB.rng(sd('hedge'));
    for (const [x0, x1] of [[262, 400], [640, 870], [1150, 1240]]) {
      for (let x = x0; x < x1; x += 14) {
        const rr = r.range(14, 22);
        g.fillStyle = col([70, 104, 62], 0.06);
        g.beginPath();
        g.arc(x, 744 - rr * 0.6, rr, 0, TAU);
        g.fill();
        g.fillStyle = col([112, 146, 78], 0.06);
        g.beginPath();
        g.arc(x + rr * 0.3, 744 - rr * 0.9, rr * 0.5, 0, TAU);
        g.fill();
      }
    }
    g.fillStyle = vgrad(g, 744, 790, [[0, 'rgb(130,166,92)'], [1, 'rgb(110,150,76)']]);
    g.fillRect(-20, 744, LW + 40, 50);
    for (const h of HOUSES) {
      g.fillStyle = 'rgb(214,204,184)';
      poly(g, [[h.x - 14, 744], [h.x + 14, 744], [h.x + 22, 794], [h.x - 22, 794]]);
      g.fill();
    }
    for (let x = -10; x < LW + 10; x += 13) {
      g.fillStyle = 'rgb(240,236,224)';
      poly(g, [[x, 788], [x, 762], [x + 3, 758], [x + 6, 762], [x + 6, 788]]);
      g.fill();
      g.fillStyle = 'rgba(150,140,150,0.4)';
      g.fillRect(x, 762, 2, 26);
    }
    g.fillStyle = 'rgb(232,228,214)';
    g.fillRect(-20, 768, LW + 40, 3);
    g.fillRect(-20, 780, LW + 40, 3);
    texture(c, S, 3, { mottle: 0.06, dark: 0.05, light: 0.035, glow: SUNLIGHT });
    return c;
  }

  const TREES = [[300, 1.0, 11], [700, 1.08, 12], [1200, 0.96, 13], [1500, 1.04, 14]];

  function streetMaple(g, x, k, seed) {
    const base = 818;
    const rc = LIB.rng(sd('maple', seed));
    g.beginPath();
    g.moveTo(x - 20 * k, base);
    g.bezierCurveTo(x - 12 * k, base - 120, x - 14 * k, base - 260, x - 8 * k, base - 380 * k);
    g.lineTo(x + 10 * k, base - 380 * k);
    g.bezierCurveTo(x + 12 * k, base - 260, x + 12 * k, base - 120, x + 22 * k, base);
    g.closePath();
    g.fillStyle = hgrad(g, x - 20 * k, x + 22 * k, [[0, 'rgb(62,50,46)'], [0.6, 'rgb(92,74,60)'], [0.85, 'rgb(150,120,90)'], [1, 'rgb(112,90,70)']]);
    g.fill();
    g.strokeStyle = 'rgb(76,62,54)';
    g.lineCap = 'round';
    for (const [dx, dy, w] of [[-90, -150, 8], [80, -170, 7], [-30, -220, 6], [40, -230, 6]]) {
      g.lineWidth = w * k;
      g.beginPath();
      g.moveTo(x, base - 300 * k);
      g.quadraticCurveTo(x + dx * 0.3 * k, base - 330 * k, x + dx * k, base - 300 * k + dy * k);
      g.stroke();
    }
    const cx = x, cy = base - 500 * k;
    const clumps = [];
    for (let tries = 0; clumps.length < 120 && tries < 3000; tries++) {
      const px = rc.range(-230, 230), py = rc.range(-190, 170);
      if ((px * px) / (230 * 230) + (py * py) / (180 * 180) > 1) continue;
      clumps.push([cx + px * k, cy + py * k, rc.range(20, 40) * k]);
    }
    for (const [px, py, r] of clumps) {
      g.fillStyle = 'rgb(38,66,46)';
      g.beginPath();
      g.arc(px, py, r * 0.75, 0, TAU);
      g.fill();
      for (let j = 0; j < 10; j++) {
        const a = rc() * TAU, d = Math.sqrt(rc()) * r;
        g.save();
        g.translate(px + Math.cos(a) * d, py + Math.sin(a) * d);
        g.rotate(rc() * TAU);
        LOOK.leafPath(g, rc.range(8, 12) * k);
        g.fill();
        g.restore();
      }
    }
    const GREENS = [[44, 76, 50], [64, 102, 58], [92, 132, 66], [132, 160, 76], [178, 190, 98]];
    for (const [px, py, r] of clumps) {
      for (let j = 0; j < 26; j++) {
        const a = rc() * TAU, d = Math.sqrt(rc()) * r * 1.1;
        const lx = px + Math.cos(a) * d, ly = py + Math.sin(a) * d;
        const sunny = clamp01((lx - cx) / (460 * k) + (cy - ly) / (360 * k) + 0.45 + 0.3 * Math.sin(a - 0.8) * d / r);
        const idx = Math.min(4, Math.max(0, Math.floor(sunny * 4.2 + rc() * 1.2 - 0.4)));
        g.fillStyle = col(rc() < 0.015 ? [236, 196, 80] : GREENS[idx], 0, 0.92);
        g.save();
        g.translate(lx, ly);
        g.rotate(rc() * TAU);
        g.scale(1, 0.75 + 0.25 * rc());
        LOOK.leafPath(g, rc.range(6, 10) * k);
        g.fill();
        g.restore();
      }
    }
  }

  function buildNear(S) {
    const { c, g } = makeLayer(S, 1, LW, H);
    g.fillStyle = vgrad(g, 790, 826, [[0, 'rgb(112,150,76)'], [1, 'rgb(96,138,66)']]);
    g.fillRect(-20, 790, LW + 40, 36);
    g.fillStyle = vgrad(g, 822, 900, [[0, 'rgb(200,188,168)'], [1, 'rgb(222,210,188)']]);
    g.fillRect(-20, 822, LW + 40, 78);
    g.fillStyle = hgrad(g, 0, LW, [[0, 'rgba(96,88,118,0.1)'], [0.5, 'rgba(255,236,200,0)'], [1, 'rgba(255,236,200,0.2)']]);
    g.fillRect(-20, 822, LW + 40, 78);
    for (let x = -20; x < LW + 20; x += 120) {
      g.fillStyle = 'rgba(100,86,72,0.3)';
      g.fillRect(x, 824, 1.6, 76);
      g.fillStyle = 'rgba(255,246,226,0.3)';
      g.fillRect(x + 2, 824, 1, 76);
    }
    g.fillStyle = 'rgba(244,236,218,0.8)';
    g.fillRect(-20, 822, LW + 40, 2);
    for (const [x, k] of TREES) {
      g.save();
      g.translate(x - 150 * k, 862);
      g.scale(210 * k, 26);
      const dg = g.createRadialGradient(0, 0, 0, 0, 0, 1);
      dg.addColorStop(0, 'rgba(70,58,86,0.18)');
      dg.addColorStop(0.7, 'rgba(70,58,86,0.1)');
      dg.addColorStop(1, 'rgba(70,58,86,0)');
      g.fillStyle = dg;
      g.fillRect(-1, -1, 2, 2);
      g.restore();
      g.fillStyle = hgrad(g, x - 220, x, [[0, 'rgba(70,56,84,0)'], [1, 'rgba(70,56,84,0.22)']]);
      poly(g, [[x + 18, 824], [x - 18, 824], [x - 220, 852], [x - 170, 856]]);
      g.fill();
    }
    g.fillStyle = vgrad(g, 900, 934, [[0, 'rgb(104,142,70)'], [1, 'rgb(90,128,62)']]);
    g.fillRect(-20, 900, LW + 40, 34);
    const rv = LIB.rng(sd('grass'));
    for (let i = 0; i < 260; i++) {
      const x = rv.range(-20, LW + 20), y = rv.range(902, 932);
      g.fillStyle = rv() < 0.5 ? 'rgba(150,176,86,0.7)' : 'rgba(64,100,52,0.6)';
      g.fillRect(x, y, rv.range(6, 16), 1.4);
    }
    g.fillStyle = 'rgb(232,224,206)';
    g.fillRect(-20, 934, LW + 40, 10);
    g.fillStyle = vgrad(g, 944, 958, [[0, 'rgb(170,164,156)'], [1, 'rgb(120,114,110)']]);
    g.fillRect(-20, 944, LW + 40, 14);
    g.fillStyle = vgrad(g, 958, H, [[0, 'rgb(84,82,88)'], [1, 'rgb(100,96,102)']]);
    g.fillRect(-20, 958, LW + 40, H - 958);
    const ra = LIB.rng(sd('asphalt'));
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = ra() < 0.5 ? 'rgba(40,38,44,0.35)' : 'rgba(196,190,180,0.25)';
      const sz = ra.range(0.8, 2);
      g.fillRect(ra.range(-20, LW + 20), ra.range(960, H), sz, sz * 0.7);
    }
    g.fillStyle = 'rgb(96,84,74)';
    g.fillRect(586, 760, 5, 64);
    g.fillStyle = 'rgb(60,78,120)';
    g.fillRect(572, 748, 34, 16);
    g.beginPath();
    g.arc(589, 748, 17, Math.PI, 0);
    g.fill();
    g.fillStyle = 'rgb(200,60,50)';
    g.fillRect(604, 738, 3, 14);
    for (const [x, k, seed] of TREES) {
      g.fillStyle = 'rgba(60,46,40,0.4)';
      g.beginPath();
      g.ellipse(x, 820, 30 * k, 5, 0, 0, TAU);
      g.fill();
      streetMaple(g, x, k, seed);
    }
    texture(c, S, 4, { mottle: 0.07, dark: 0.06, light: 0.04, glow: SUNLIGHT });
    return c;
  }

  function buildAir(S) {
    const beams = LOOK.beamField({
      beams: [[380, 60, 0.55], [560, 90, 0.7], [760, 50, 0.45], [920, 80, 0.55], [1120, 60, 0.45]],
      dir: [0.906, 0.423],
      noise: { base: 0.8, amp: 0.4, scale: 7, offset: 5, row: 9.5 },
      fall: (X, Y) => sstep(-60, 200, Y) * (1 - sstep(700, 880, Y)) * 0.55,
    });
    const glow = LOOK.glowField({ x: SUN[0] - 200, y: SUN[1], r: 560, amount: 0.55 });
    return LOOK.lightLayer(S, { fields: [beams, glow], w: LW, h: H });
  }

  let CACHE = null;
  function statics(S) {
    if (CACHE && CACHE.S === S) return CACHE;
    CACHE = { S, far: buildFar(S), back: buildBack(S), mid: buildMid(S), near: buildNear(S), air: buildAir(S) };
    return CACHE;
  }

  function pose(t, scared) {
    const x = X0 + SPEED * t;
    const k = scared || 0;
    const expr = k > 0.01 ? { disappointed: 1 - 0.7 * k, wide: 0.7 * k } : 'disappointed';
    const o = { x, y: FEET, h: JH, t, facing: 1, age: 14, outfit: 'school', walkAmt: 1, lean: 0.28, look: 0.12 * k, expr, exprAmt: 0.8 + 0.2 * k };
    o.walk = (x - X0) / FILM.cast.sam.stride(o);
    return o;
  }

  const LEAVES = [
    [300, -40, 60, 24, 0.0, 7.5, 'rgb(232,190,70)'], [760, -200, 70, 26, 1.7, 6.5, 'rgb(150,172,92)'],
    [1120, -120, 64, 22, 2.9, 7, 'rgb(226,150,54)'], [520, -400, 58, 20, 4.1, 6.5, 'rgb(178,190,98)'],
  ];

  function card(ctx, t, info, off) {
    const b = wordAt(info, 'tokay', info.shot.beats && info.shot.beats[0] ? info.shot.beats[0].t : 0.67) - 0.15;
    const k = sstep(b, b + 0.4, t) * (t < off ? 1 : 0);
    if (k <= 0.002) return;
    ctx.save();
    ctx.globalAlpha = k;
    ctx.translate(86, 92 - 8 * (1 - k));
    ctx.rotate(-0.025);
    ctx.fillStyle = 'rgba(40,30,24,0.25)';
    ctx.fillRect(4, 6, 236, 74);
    ctx.fillStyle = 'rgb(248,240,222)';
    ctx.fillRect(0, 0, 236, 74);
    ctx.strokeStyle = 'rgb(31,23,18)';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, 233, 71);
    ctx.strokeStyle = 'rgba(184,54,48,0.8)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(8, 8, 220, 58);
    ctx.fillStyle = 'rgb(31,23,18)';
    ctx.font = 'italic 600 38px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Fall Term', 118, 39);
    ctx.restore();
  }

  function wordAt(info, token, fb, from) {
    const st = info.shot.start || 0, lo = from == null ? -0.05 : from;
    const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    const want = norm(token);
    for (const c of info.shot.captions || []) {
      for (const w of c.words || []) if (w[0] - st >= lo && norm(w[1]) === want) return w[0] - st;
    }
    return fb;
  }

  function setupAt(cuts, t) {
    let i = 0;
    while (i + 1 < cuts.length && t >= cuts[i + 1].at) i++;
    return i;
  }

  function frame(ctx, t, cuts) {
    const i = setupAt(cuts, t), c = cuts[i], u = t - c.at;
    const z = c.z * (1 + (c.push == null ? 0.02 : c.push) * u);
    const hw = 540 / Math.max(1, z);
    const cx = (typeof c.x === 'function' ? c.x(t) : c.x) + (c.dx || 0) * u;
    const cy = (typeof c.y === 'function' ? c.y(t) : c.y) + (c.dy || 0) * u;
    const x = Math.min(1080 - hw, Math.max(hw, cx)), y = Math.min(1080 - hw, Math.max(hw, cy));
    ctx.translate(540, 540);
    ctx.scale(z, z);
    ctx.translate(-x, -y);
    return i;
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const C = statics(S);
      const cam = (depth) => LOOK.camera(ctx, { t, dur: info.dur, pan: [PAN, 0], depth, ease: (u) => u });
      const B_SAM = wordAt(info, 'tokbb', 1.63);
      const B_SCARED = wordAt(info, 'tokaq', 4.13, 3.5);
      const scared = sstep(wordAt(info, 'tokbd', 4.82) - 0.25, wordAt(info, 'tokbd', 4.82) + 0.1, t);
      const panX = (x, k) => x - PAN * (t / info.dur) * (k == null ? 1 : k);
      const head = () => FILM.cast.sam.pose(pose(t, scared)).head;
      const CUTS = [
        { at: 0, z: 1, x: 540, y: 540, push: 0.02 },
        { at: B_SAM, z: 1.65, x: () => panX(X0 + SPEED * t) + 90, y: FEET - JH * 0.48, push: 0.03 },
        { at: B_SCARED, z: 2.7, x: () => panX(head()[0]) + 40, y: () => head()[1] - 10, push: 0.04 },
      ];
      ctx.save();
      frame(ctx, t, CUTS);

      ctx.save();
      cam(PAR.far);
      ctx.drawImage(C.far, 0, 0, LW, H);
      ctx.restore();

      ctx.save();
      cam(PAR.back);
      ctx.drawImage(C.back, 0, 0, LW, H);
      kids(ctx, t);
      ctx.restore();

      ctx.save();
      cam(PAR.mid);
      ctx.drawImage(C.mid, 0, 0, LW, H);
      ctx.restore();

      ctx.save();
      cam(PAR.near);
      ctx.drawImage(C.near, 0, 0, LW, H);
      const o = pose(t, scared);
      LOOK.castShadow(ctx, { x: o.x, y: o.y, h: JH, k: SHADOW_K, S, draw: (g) => FILM.cast.sam(g, o) });
      LOOK.contactShadow(ctx, { x: o.x, y: o.y, h: JH });
      FILM.cast.sam(ctx, o);
      ctx.restore();

      ctx.save();
      cam(PAR.air);
      LOOK.drawLight(ctx, C.air, { x: 8 * Math.sin(t * 0.35), alpha: 0.75 + 0.06 * Math.sin(t * 0.9) });
      ctx.restore();

      ctx.save();
      cam(PAR.near);
      LOOK.leaves(ctx, t, LEAVES, { wind: 10 });
      ctx.restore();
      ctx.restore();

      card(ctx, t, info, B_SCARED);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
