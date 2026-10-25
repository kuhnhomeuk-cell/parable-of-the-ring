// scenes/05-scene-05.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-05';
  const LIB = FILM.lib;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const TAU = Math.PI * 2;
  const W = 1080;
  const H = 1080;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const lerp = (a, b, k) => a + (b - a) * k;
  const sstep = (e0, e1, x) => {
    const u = clamp01((x - e0) / (e1 - e0));
    return u * u * (3 - 2 * u);
  };

  let B_FLASH = 3.26;
  let B_HAND_DOWN = 5.86;
  let B_HAND_GONE = 6.31;
  let DUR = 6.83;

  const X0 = -200;
  const X1 = 330;
  const FEET = 870;
  const JH = 330;
  const STRIDE = 2 * 0.38 * JH;

  const FOCUS = [600, 650];
  const PUSH = 0.03;
  const HORIZON = 612;
  const VP = [235, HORIZON];
  const SUN = [1060, -110];
  const RING = [700, 737];
  const DIAMOND = [700, 724];
  const EYES = [345, 640];
  const SHADOW_K = [0.9, -0.14];

  const PAR = { far: 0.25, mid: 0.55, near: 1, air: 0.7 };

  const LOOK = FILM.look;
  const { vn, fbm, shade, makeLayer, poly, vgrad, hgrad, leafPath } = LOOK;
  const HAZE = [240, 228, 204];
  const col = (c, hz, a) => LOOK.col(c, hz, a, HAZE);

  const beamField = LOOK.beamField({
    beams: [[300, 60, 0.6], [440, 95, 0.85], [585, 50, 0.5]],
    dir: [0.906, 0.423],
    noise: { base: 0.8, amp: 0.4, scale: 7, offset: 3, row: 11.5 },
    fall: (X, Y) => sstep(-60, 200, Y) * (1 - sstep(640, 880, Y)),
    mask: (X, Y) => 1 - 0.8 * sstep(396, 430, X) * (1 - sstep(830, 850, Y)),
  });
  const DIM = (X, Y) => 0.2 * (1 - beamField(X, Y)) * (1 - sstep(330, 460, X)) * sstep(60, 260, Y) * (1 - sstep(780, 860, Y));
  const SUNLIGHT = { x: SUN[0], y: SUN[1], r: 760, amount: 0.22 };
  const texture = (c, S, n, o) => LOOK.texture(c, S, Object.assign({ seed: sd('tex', n), offset: n * 13.7 }, o));

  function buildFar(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = vgrad(g, 0, HORIZON, [
      [0, 'rgb(118,160,184)'], [0.32, 'rgb(160,190,198)'], [0.62, 'rgb(212,214,196)'], [0.85, 'rgb(238,224,194)'], [1, 'rgb(246,228,192)'],
    ]);
    g.fillRect(0, 0, W, H);
    LOOK.haze(g, { x: SUN[0], y: SUN[1], r: 1150 });
    LOOK.haze(g, { x: 240, y: 600, r: 520, stops: [[0, 'rgba(255,238,206,0.7)'], [1, 'rgba(255,238,206,0)']] });
    const CL = [[260, 168, 300, 9, 0.4], [120, 250, 210, 6, 0.3], [380, 318, 260, 7, 0.32], [180, 410, 320, 6, 0.26], [640, 84, 280, 8, 0.32], [560, 230, 200, 5, 0.22]];
    for (const [x, y, rx, ry, a] of CL) {
      g.fillStyle = `rgba(255,248,232,${a})`;
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0, 0, TAU);
      g.fill();
      g.fillStyle = `rgba(255,250,238,${a * 0.6})`;
      g.beginPath();
      g.ellipse(x + rx * 0.2, y - ry * 0.3, rx * 0.55, ry * 0.5, 0, 0, TAU);
      g.fill();
    }
    const hill = (base, amp, sc, seed, top, bot, bump) => {
      g.beginPath();
      g.moveTo(-20, H);
      for (let x = -20; x <= W + 20; x += 4) {
        let y = base - amp * fbm(x * sc + seed, seed * 0.37, 3);
        if (bump) y -= bump * Math.pow(vn(x / 16 + seed, seed), 2);
        g.lineTo(x, y);
      }
      g.lineTo(W + 20, H);
      g.closePath();
      g.fillStyle = vgrad(g, base - amp, HORIZON + 10, [[0, top], [1, bot]]);
      g.fill();
    };
    hill(590, 150, 1 / 380, 11, 'rgb(186,198,194)', 'rgb(214,212,196)', 0);
    hill(604, 90, 1 / 240, 23, 'rgb(162,182,170)', 'rgb(198,202,184)', 0);
    hill(618, 40, 1 / 140, 37, 'rgb(130,158,130)', 'rgb(168,184,152)', 14);
    g.fillStyle = 'rgb(160,176,138)';
    g.fillRect(0, HORIZON + 4, W, H - HORIZON);
    texture(c, S, 1, { mottle: 0.05, dark: 0.04, light: 0.03, dim: DIM });
    return c;
  }

  const buildMist = (S) =>
    LOOK.mist(S, {
      bands: [[600, 46, 0.8], [680, 90, 0.35]],
      mask: (X) => 1 - sstep(380, 520, X - 120) * 0.6,
    });

  const NEAR_Y = 846;
  const depthY = (s) => HORIZON + (NEAR_Y - HORIZON) * s;
  const edgeX = (x845, s) => VP[0] + (x845 - VP[0]) * s;

  function house(g, cx, s, w, side, body, roof, trim) {
    const base = depthY(s);
    const hz = clamp01(0.78 - s * 1.5);
    const bh = w * 0.58;
    const rh = w * 0.4;
    const L = cx - w / 2;
    const R = cx + w / 2;
    const top = base - bh;
    const toVP = (p, f) => [p[0] + (VP[0] - p[0]) * f, p[1] + (VP[1] - p[1]) * f];
    const f = 0.42;
    const sx = side < 0 ? R : L;
    const a = [sx, base], b = [sx, top];
    const a2 = toVP(a, f), b2 = toVP(b, f);
    const apex = [cx, top - rh], apex2 = toVP(apex, f);
    const lit = side < 0;
    poly(g, [a, b, b2, a2]);
    g.fillStyle = col(shade(body, lit ? 1.04 : 0.72), hz);
    g.fill();
    poly(g, [b, apex, apex2, b2]);
    g.fillStyle = col(shade(roof, lit ? 1.12 : 0.8), hz);
    g.fill();
    g.fillStyle = col(shade(body, lit ? 0.9 : 0.95), hz);
    g.fillRect(L, top, w, bh);
    poly(g, [[L - w * 0.05, top + 1], [cx, top - rh], [R + w * 0.05, top + 1]]);
    g.fill();
    g.fillStyle = col([70, 60, 60], hz, 0.25);
    poly(g, [[L, top], [cx, top - rh + 3], [R, top], [R, top + w * 0.05], [L, top + w * 0.05]]);
    g.fill();
    g.strokeStyle = col(roof, hz);
    g.lineWidth = Math.max(1, w * 0.045);
    g.beginPath();
    g.moveTo(L - w * 0.06, top + w * 0.02);
    g.lineTo(cx, top - rh);
    g.lineTo(R + w * 0.06, top + w * 0.02);
    g.stroke();
    const ww = w * 0.17, wh = w * 0.2;
    for (const k of [-0.27, 0.27]) {
      const x = cx + k * w - ww / 2;
      const y = top + bh * 0.22;
      g.fillStyle = col(trim, hz);
      g.fillRect(x - w * 0.02, y - w * 0.02, ww + w * 0.04, wh + w * 0.04);
      g.fillStyle = col([84, 98, 112], hz);
      g.fillRect(x, y, ww, wh);
      g.fillStyle = col([170, 190, 200], hz, 0.5);
      g.fillRect(x, y, ww * 0.45, wh * 0.45);
    }
    g.fillStyle = col(trim, hz);
    g.fillRect(cx - w * 0.08, base - bh * 0.5, w * 0.16, bh * 0.5);
    g.fillStyle = col([110, 70, 56], hz);
    g.fillRect(cx - w * 0.06, base - bh * 0.46, w * 0.12, bh * 0.46);
    g.fillStyle = col([96, 108, 120], hz);
    g.fillRect(cx - w * 0.05, top - rh * 0.45, w * 0.1, w * 0.1);
    g.fillStyle = col([60, 70, 50], hz, 0.35);
    g.fillRect(L, base - w * 0.04, w, w * 0.04);
  }

  function streetTree(g, x, s, size, seed, yellow) {
    const base = depthY(s);
    const hz = clamp01(0.78 - s * 1.5);
    const r = LIB.rng(sd('tree', seed));
    const cy = base - size * 1.55;
    g.fillStyle = col([84, 70, 58], hz);
    g.fillRect(x - size * 0.06, cy, size * 0.12, base - cy);
    const clumps = [];
    for (let i = 0; i < 14; i++) {
      const a = r() * TAU;
      const d = Math.sqrt(r()) * size * 0.55;
      clumps.push([x + Math.cos(a) * d * 1.1, cy + Math.sin(a) * d * 0.9, size * (0.32 + 0.22 * r())]);
    }
    for (const [px, py, pr] of clumps) {
      g.fillStyle = col([58, 92, 60], hz);
      g.beginPath();
      g.arc(px, py, pr, 0, TAU);
      g.fill();
    }
    for (const [px, py, pr] of clumps) {
      g.fillStyle = col([96, 132, 72], hz);
      g.beginPath();
      g.arc(px + pr * 0.18, py - pr * 0.18, pr * 0.72, 0, TAU);
      g.fill();
    }
    for (const [px, py, pr] of clumps) {
      if (px < x - size * 0.1 && py > cy) continue;
      g.fillStyle = col(r() < yellow ? [214, 186, 84] : [150, 172, 92], hz);
      g.beginPath();
      g.arc(px + pr * 0.35, py - pr * 0.35, pr * 0.36, 0, TAU);
      g.fill();
    }
  }

  function buildMid(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = vgrad(g, HORIZON, NEAR_Y, [[0, 'rgb(186,192,160)'], [0.3, 'rgb(150,172,118)'], [1, 'rgb(98,140,72)']]);
    g.fillRect(-20, HORIZON - 2, 520, NEAR_Y - HORIZON + 8);
    g.fillStyle = vgrad(g, HORIZON, NEAR_Y, [[0, 'rgb(230,222,204)'], [1, 'rgb(206,198,180)']]);
    poly(g, [VP, [-260, NEAR_Y + 4], [-110, NEAR_Y + 4]]);
    g.fill();
    poly(g, [VP, [306, NEAR_Y + 4], [470, NEAR_Y + 4]]);
    g.fill();
    g.fillStyle = vgrad(g, HORIZON, NEAR_Y, [[0, 'rgb(196,190,180)'], [0.4, 'rgb(156,150,146)'], [1, 'rgb(118,114,116)']]);
    poly(g, [VP, [-130, NEAR_Y + 4], [318, NEAR_Y + 4]]);
    g.fill();
    const rv = LIB.rng(sd('verge'));
    for (let i = 0; i < 260; i++) {
      const s = 0.08 + rv() * 0.92;
      const y = depthY(s);
      const leftSide = rv() < 0.6;
      const x = leftSide ? edgeX(-260, s) - rv() * 300 * s : edgeX(470, s) + rv() * 200 * s;
      g.fillStyle = rv() < 0.5 ? `rgba(70,110,56,${0.25 * s + 0.05})` : `rgba(190,206,130,${0.3 * s + 0.05})`;
      g.fillRect(x, y, 6 + 18 * s, 1 + 1.6 * s);
    }
    g.fillStyle = 'rgba(70,64,90,0.18)';
    for (const [s0, s1] of [[0.28, 0.4], [0.16, 0.22], [0.5, 0.62], [0.09, 0.12]]) {
      poly(g, [[edgeX(470, s0), depthY(s0)], [edgeX(-180, s0 + 0.05), depthY(s0 + 0.05)], [edgeX(-180, s1 + 0.06), depthY(s1 + 0.06)], [edgeX(470, s1), depthY(s1)]]);
      g.fill();
    }
    const WHITE = [234, 228, 212], YEL = [232, 214, 164], SAGE = [178, 196, 168], BLUE = [180, 198, 208], PINK = [226, 196, 182];
    const ROOF = [112, 110, 120], RED = [146, 92, 80], DARK = [92, 88, 96];
    const TRIM = [244, 240, 228];
    const items = [
      ['h', 196, 0.065, 30, -1, BLUE, ROOF], ['h', 262, 0.06, 24, 1, WHITE, RED],
      ['t', 214, 0.075, 22, 1, 0.1], ['h', 168, 0.105, 50, -1, YEL, DARK], ['t', 280, 0.1, 26, 2, 0.2],
      ['h', 286, 0.12, 54, 1, SAGE, ROOF], ['t', 140, 0.14, 40, 3, 0.15], ['h', 112, 0.17, 84, -1, WHITE, RED],
      ['t', 306, 0.18, 40, 4, 0.3], ['h', 326, 0.22, 100, 1, PINK, DARK], ['t', 70, 0.24, 66, 5, 0.25],
      ['h', 26, 0.28, 140, -1, SAGE, ROOF], ['t', 372, 0.3, 64, 6, 0.35], ['h', 400, 0.36, 170, 1, WHITE, ROOF],
      ['t', -40, 0.42, 110, 7, 0.3],
    ];
    for (const it of items) {
      if (it[0] === 'h') house(g, it[1], it[2], it[3], it[4], it[5], it[6], TRIM);
      else streetTree(g, it[1], it[2], it[3], it[4], it[5]);
    }
    texture(c, S, 2, { mottle: 0.06, dark: 0.05, light: 0.035, dim: DIM });
    return c;
  }

  const WIN = { x0: 520, x1: 900, y0: 560, y1: 800 };
  const SIDEWALK = { y0: 842, y1: 990 };

  const GROUND_LEAVES = [
    [18, 884, 8, 0.4, 0], [96, 896, 7, 2.1, 1], [150, 878, 6.5, 4.0, 2], [44, 940, 8.5, 1.2, 3], [196, 872, 6, 5.1, 0],
    [120, 962, 7.5, 3.3, 1], [8, 976, 7, 0.9, 2], [212, 948, 6.5, 2.6, 4], [262, 866, 5.5, 1.7, 0], [360, 870, 6, 4.4, 3],
    [884, 876, 6, 0.6, 1], [960, 958, 7, 2.9, 0], [1040, 902, 6.5, 5.6, 2], [300, 1003, 5.5, 1.1, 4], [640, 1006, 6, 3.7, 1],
    [930, 1004, 5.5, 0.2, 3],
  ];
  const LEAF_COLS = ['rgb(232,192,72)', 'rgb(222,160,58)', 'rgb(240,210,100)', 'rgb(196,128,52)', 'rgb(170,120,64)'];

  function drawGround(g) {
    const { y0, y1 } = SIDEWALK;
    g.fillStyle = vgrad(g, y0, y1, [[0, 'rgb(194,182,162)'], [0.25, 'rgb(210,198,176)'], [1, 'rgb(222,210,188)']]);
    g.fillRect(-20, y0, W + 40, y1 - y0);
    g.fillStyle = hgrad(g, 0, W, [[0, 'rgba(96,88,118,0.14)'], [0.35, 'rgba(255,236,200,0)'], [1, 'rgba(255,236,200,0.26)']]);
    g.fillRect(-20, y0, W + 40, y1 - y0);
    const pool = g.createRadialGradient(880, 930, 0, 880, 930, 520);
    pool.addColorStop(0, 'rgba(255,234,196,0.22)');
    pool.addColorStop(1, 'rgba(255,234,196,0)');
    g.fillStyle = pool;
    g.fillRect(300, y0, W - 280, y1 - y0);
    const jx = (xb, Y) => 540 + (xb - 540) * (Y - HORIZON) / (y1 - HORIZON);
    const XB = [-620, -330, -40, 250, 540, 830, 1120, 1410, 1700];
    const YS = [y0 + 2, 870, 908, 952, y1];
    const rs = LIB.rng(sd('slab'));
    for (let r = 0; r < YS.length - 1; r++) {
      for (let c = 0; c < XB.length - 1; c++) {
        const ya = YS[r], yb = YS[r + 1];
        const v = rs();
        g.fillStyle = v < 0.5 ? `rgba(120,104,86,${0.03 + 0.05 * v})` : `rgba(255,246,226,${0.05 * (v - 0.5)})`;
        poly(g, [[jx(XB[c], ya), ya], [jx(XB[c + 1], ya), ya], [jx(XB[c + 1], yb), yb], [jx(XB[c], yb), yb]]);
        g.fill();
      }
    }
    for (const xb of XB) {
      const a = [jx(xb, y0 + 2), y0 + 2], b = [jx(xb, y1), y1];
      g.strokeStyle = 'rgba(100,86,72,0.34)';
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(a[0], a[1]);
      g.lineTo(b[0], b[1]);
      g.stroke();
      g.strokeStyle = 'rgba(255,246,226,0.32)';
      g.lineWidth = 1.1;
      g.beginPath();
      g.moveTo(a[0] + 2, a[1]);
      g.lineTo(b[0] + 2.6, b[1]);
      g.stroke();
    }
    for (const y of YS.slice(1, -1)) {
      g.fillStyle = 'rgba(100,86,72,0.3)';
      g.fillRect(-20, y - 0.8, W + 40, 1.6);
      g.fillStyle = 'rgba(255,246,226,0.28)';
      g.fillRect(-20, y + 0.8, W + 40, 1);
    }
    g.strokeStyle = 'rgba(100,86,72,0.22)';
    g.lineWidth = 0.9;
    for (const pts of [[[700, 912], [722, 926], [736, 924], [760, 944]], [[96, 956], [118, 966], [124, 984]], [[980, 874], [996, 890], [1020, 896]]]) {
      g.beginPath();
      g.moveTo(pts[0][0], pts[0][1]);
      for (const q of pts.slice(1)) g.lineTo(q[0], q[1]);
      g.stroke();
    }
    for (let i = 0; i < 40; i++) {
      const x = rs.range(-20, W + 20), y = rs.range(850, 985);
      g.fillStyle = rs() < 0.5 ? 'rgba(120,104,88,0.05)' : 'rgba(255,246,226,0.06)';
      g.beginPath();
      g.ellipse(x, y, rs.range(10, 50), rs.range(2, 6), 0, 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgba(244,236,218,0.8)';
    g.fillRect(-20, y0, 424, 2.5);
    g.fillStyle = 'rgba(80,70,64,0.2)';
    g.fillRect(-20, y0 - 3, 424, 3);
    g.fillStyle = vgrad(g, y0, y0 + 26, [[0, 'rgba(60,44,64,0.32)'], [1, 'rgba(60,44,64,0)']]);
    g.fillRect(403, y0, W - 383, 26);
    g.fillStyle = hgrad(g, 120, 440, [[0, 'rgba(70,56,84,0)'], [1, 'rgba(70,56,84,0.2)']]);
    poly(g, [[440, y0], [120, y0 + 30], [120, y0 + 44], [436, y0 + 18]]);
    g.fill();
    const tb = [66, 864], th = 560;
    const te = [tb[0] - SHADOW_K[0] * th, tb[1] - SHADOW_K[1] * th];
    g.fillStyle = hgrad(g, te[0], tb[0], [[0, 'rgba(70,56,84,0)'], [0.6, 'rgba(70,56,84,0.16)'], [1, 'rgba(70,56,84,0.26)']]);
    poly(g, [[tb[0] + 22, tb[1]], [tb[0] - 22, tb[1] - 2], [te[0] - 30, te[1]], [te[0] + 30, te[1] + 14]]);
    g.fill();
    for (const [x, y, sz, rot, ci] of GROUND_LEAVES) {
      g.save();
      g.translate(x, y);
      g.scale(1, 0.42);
      g.rotate(rot);
      g.fillStyle = 'rgba(70,52,40,0.22)';
      g.translate(-1.2, 1.6);
      leafPath(g, sz);
      g.fill();
      g.translate(1.2, -1.6);
      g.fillStyle = LEAF_COLS[ci];
      leafPath(g, sz);
      g.fill();
      g.restore();
    }
    g.fillStyle = 'rgb(236,228,210)';
    g.fillRect(-20, 990, W + 40, 10);
    g.fillStyle = 'rgba(255,250,236,0.8)';
    g.fillRect(-20, 990, W + 40, 1.5);
    g.fillStyle = vgrad(g, 1000, 1014, [[0, 'rgb(170,164,156)'], [0.7, 'rgb(140,134,128)'], [1, 'rgb(116,110,106)']]);
    g.fillRect(-20, 1000, W + 40, 14);
    g.fillStyle = 'rgba(70,62,60,0.35)';
    for (let x = 60; x < W + 20; x += 180) g.fillRect(x, 1000, 1.4, 14);
    g.fillStyle = 'rgb(58,56,60)';
    g.fillRect(-20, 1014, W + 40, 3);
    g.fillStyle = vgrad(g, 1017, 1028, [[0, 'rgb(150,146,140)'], [1, 'rgb(128,124,120)']]);
    g.fillRect(-20, 1017, W + 40, 11);
    g.fillStyle = vgrad(g, 1028, H, [[0, 'rgb(78,76,82)'], [1, 'rgb(98,94,100)']]);
    g.fillRect(-20, 1028, W + 40, H - 1028 + 20);
    const ra = LIB.rng(sd('asphalt'));
    for (let i = 0; i < 1600; i++) {
      const v = ra();
      g.fillStyle = v < 0.5 ? 'rgba(40,38,44,0.35)' : 'rgba(196,190,180,0.28)';
      const sz = ra.range(0.8, 2);
      g.fillRect(ra.range(-20, W + 20), ra.range(1029, H), sz, sz * 0.7);
    }
    g.strokeStyle = 'rgba(30,28,32,0.45)';
    g.lineWidth = 2.2;
    g.beginPath();
    g.moveTo(-20, 1046);
    for (let x = 0; x <= W + 20; x += 40) g.lineTo(x, 1046 + 3 * Math.sin(x * 0.013) + (LIB.h3(x, 7, 9) - 0.5) * 2);
    g.stroke();
    g.fillStyle = 'rgba(226,202,118,0.5)';
    g.fillRect(-20, 1066, W + 40, 3);
  }

  function drawBuilding(g) {
    const rb = LIB.rng(sd('brick'));
    poly(g, [[440, 100], [403, 192], [403, 799], [440, 842]]);
    g.fillStyle = vgrad(g, 100, 842, [[0, 'rgb(128,72,60)'], [1, 'rgb(98,56,50)']]);
    g.fill();
    g.fillStyle = 'rgba(40,24,30,0.25)';
    poly(g, [[440, 100], [434, 115], [434, 840], [440, 842]]);
    g.fill();
    g.fillStyle = hgrad(g, 440, W, [[0, 'rgb(146,70,54)'], [0.5, 'rgb(166,82,60)'], [1, 'rgb(190,102,72)']]);
    g.fillRect(440, 100, W - 440 + 20, 450);
    for (let row = 0, y = 150; y < 470; row++, y += 9) {
      g.fillStyle = 'rgba(80,36,26,0.13)';
      g.fillRect(440, y, W - 440 + 20, 1.3);
      for (let x = 440 - (row % 2) * 12; x < W + 20; x += 24) {
        const v = rb();
        if (v < 0.22) g.fillStyle = 'rgba(255,196,160,0.07)';
        else if (v < 0.42) g.fillStyle = 'rgba(70,24,16,0.08)';
        else continue;
        g.fillRect(x + 1.2, y + 1.3, 21.6, 7.7);
      }
      g.fillStyle = 'rgba(80,36,26,0.08)';
      for (let x = 440 - (row % 2) * 12; x < W + 20; x += 24) g.fillRect(x, y, 1.2, 9);
    }
    g.fillStyle = 'rgb(242,232,208)';
    g.fillRect(434, 96, W - 434 + 20, 12);
    g.fillStyle = hgrad(g, 440, W, [[0, 'rgb(206,192,166)'], [1, 'rgb(234,222,196)']]);
    g.fillRect(440, 108, W - 440 + 20, 30);
    g.fillStyle = 'rgb(178,162,138)';
    for (let x = 446; x < W + 20; x += 16) g.fillRect(x, 138, 9, 10);
    g.fillStyle = 'rgba(150,134,112,0.9)';
    g.fillRect(440, 138, W - 440 + 20, 2);
    g.fillStyle = vgrad(g, 148, 180, [[0, 'rgba(50,20,16,0.4)'], [1, 'rgba(50,20,16,0)']]);
    g.fillRect(440, 148, W - 440 + 20, 32);
    [505, 685, 865].forEach((x, i) => {
      const w = 100;
      g.fillStyle = 'rgb(226,210,180)';
      g.fillRect(x - 12, 180, w + 24, 18);
      g.fillStyle = 'rgb(240,228,202)';
      g.fillRect(x + w / 2 - 8, 178, 16, 22);
      g.fillStyle = 'rgb(214,198,168)';
      g.fillRect(x - 9, 386, w + 18, 10);
      g.fillStyle = 'rgba(50,20,16,0.3)';
      g.fillRect(x - 9, 396, w + 18, 6);
      g.fillStyle = 'rgb(232,222,198)';
      g.fillRect(x, 198, w, 188);
      g.fillStyle = vgrad(g, 205, 380, [[0, 'rgb(150,176,188)'], [0.5, 'rgb(112,134,148)'], [1, 'rgb(78,94,108)']]);
      g.fillRect(x + 7, 205, w - 14, 81);
      g.fillRect(x + 7, 294, w - 14, 85);
      if (i === 1) {
        g.fillStyle = 'rgb(230,214,172)';
        g.fillRect(x + 7, 205, w - 14, 48);
        g.fillStyle = 'rgba(120,90,50,0.3)';
        g.fillRect(x + 7, 251, w - 14, 2);
      }
      if (i === 2) {
        g.fillStyle = 'rgba(246,240,226,0.55)';
        g.fillRect(x + 7, 205, 18, 174);
        g.fillRect(x + w - 25, 205, 18, 174);
      }
      g.save();
      g.beginPath();
      g.rect(x + 7, 205, w - 14, 174);
      g.clip();
      g.fillStyle = 'rgba(236,240,232,0.22)';
      poly(g, [[x + 40, 205], [x + 70, 205], [x + 10, 380], [x - 20, 380]]);
      g.fill();
      g.fillStyle = vgrad(g, 205, 222, [[0, 'rgba(30,24,30,0.45)'], [1, 'rgba(30,24,30,0)']]);
      g.fillRect(x, 205, w, 18);
      g.restore();
    });
    g.fillStyle = hgrad(g, 440, W, [[0, 'rgb(34,64,52)'], [1, 'rgb(56,96,76)']]);
    g.fillRect(440, 418, W - 440 + 20, 54);
    g.fillStyle = 'rgb(198,160,82)';
    g.fillRect(440, 418, W - 440 + 20, 3);
    g.fillRect(440, 468, W - 440 + 20, 2);
    g.save();
    g.font = 'bold 38px Georgia, "Times New Roman", serif';
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    if ('letterSpacing' in g) g.letterSpacing = '9px';
    g.fillStyle = 'rgba(20,30,24,0.6)';
    g.fillText('JEWELERS', 765, 461);
    const gold = vgrad(g, 430, 460, [[0, 'rgb(252,228,150)'], [0.5, 'rgb(220,176,86)'], [1, 'rgb(170,124,52)']]);
    g.fillStyle = gold;
    g.fillText('JEWELERS', 763, 459);
    g.restore();
    g.fillStyle = 'rgb(214,178,96)';
    for (const x of [520, 1010]) {
      g.beginPath();
      g.arc(x, 445, 4, 0, TAU);
      g.fill();
    }
    g.fillStyle = hgrad(g, 440, W, [[0, 'rgb(42,76,60)'], [1, 'rgb(64,108,84)']]);
    g.fillRect(440, 545, W - 440 + 20, 297);
    for (const [x0, x1] of [[446, 510], [910, 922], [1024, 1074]]) {
      g.fillStyle = 'rgba(120,170,136,0.22)';
      g.fillRect(x0, 556, x1 - x0, 276);
      g.fillStyle = 'rgba(16,36,28,0.3)';
      g.fillRect(x0 + 4, 562, x1 - x0 - 4, 268);
      g.fillStyle = 'rgb(56,98,76)';
      g.fillRect(x0 + 4, 562, x1 - x0 - 8, 264);
    }
    drawInterior(g);
    g.fillStyle = 'rgb(186,146,76)';
    g.fillRect(WIN.x0 - 8, WIN.y0 - 8, WIN.x1 - WIN.x0 + 16, 8);
    g.fillRect(WIN.x0 - 8, WIN.y1, WIN.x1 - WIN.x0 + 16, 7);
    g.fillRect(WIN.x0 - 8, WIN.y0, 8, WIN.y1 - WIN.y0);
    g.fillRect(WIN.x1, WIN.y0, 8, WIN.y1 - WIN.y0);
    g.fillStyle = 'rgba(255,236,170,0.5)';
    g.fillRect(WIN.x1, WIN.y0, 3, WIN.y1 - WIN.y0);
    g.fillRect(WIN.x0 - 8, WIN.y1, WIN.x1 - WIN.x0 + 16, 2);
    for (const [x0, x1] of [[512, 707], [713, 908]]) {
      g.fillStyle = 'rgba(120,170,136,0.3)';
      g.fillRect(x0, 810, x1 - x0, 26);
      g.fillStyle = 'rgb(48,86,68)';
      g.fillRect(x0 + 5, 815, x1 - x0 - 10, 18);
    }
    g.fillStyle = 'rgb(66,44,32)';
    g.fillRect(926, 566, 94, 276);
    g.fillStyle = 'rgb(84,58,40)';
    g.fillRect(934, 574, 78, 262);
    g.fillStyle = vgrad(g, 584, 720, [[0, 'rgb(64,46,38)'], [1, 'rgb(40,28,24)']]);
    g.fillRect(942, 584, 62, 138);
    g.fillStyle = 'rgba(232,226,210,0.16)';
    poly(g, [[960, 584], [978, 584], [946, 722], [942, 722], [942, 650]]);
    g.fill();
    g.fillStyle = 'rgb(236,226,196)';
    g.fillRect(950, 630, 46, 20);
    g.fillStyle = 'rgb(176,48,44)';
    g.font = 'bold 13px Helvetica, Arial, sans-serif';
    g.textAlign = 'center';
    g.fillText('OPEN', 973, 645);
    g.fillStyle = 'rgba(30,20,16,0.5)';
    g.fillRect(944, 742, 58, 82);
    g.fillStyle = 'rgb(76,52,36)';
    g.fillRect(948, 746, 52, 74);
    g.fillStyle = 'rgb(222,186,96)';
    g.beginPath();
    g.arc(1004, 734, 4.5, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(96,90,82)';
    g.fillRect(434, 836, W - 434 + 20, 8);
    g.fillStyle = vgrad(g, 548, 622, [[0, 'rgba(26,14,14,0.5)'], [0.7, 'rgba(26,14,14,0.32)'], [1, 'rgba(26,14,14,0)']]);
    poly(g, [[446, 548], [W + 20, 548], [W + 20, 598], [446, 628]]);
    g.fill();
    drawAwning(g);
  }

  function drawAwning(g) {
    const top = 470, bot = 528, val = 550;
    const xl0 = 462, xr0 = 1062, xl1 = 450, xr1 = 1074;
    const n = 15;
    const xAt = (x0, x1, k) => x0 + (x1 - x0) * k;
    for (let i = 0; i < n; i++) {
      const k0 = i / n, k1 = (i + 1) / n;
      const red = i % 2 === 0;
      poly(g, [[xAt(xl0, xr0, k0), top], [xAt(xl0, xr0, k1), top], [xAt(xl1, xr1, k1), bot], [xAt(xl1, xr1, k0), bot]]);
      g.fillStyle = red ? 'rgb(184,54,48)' : 'rgb(240,228,200)';
      g.fill();
      const a = xAt(xl1, xr1, k0), b = xAt(xl1, xr1, k1);
      g.beginPath();
      g.moveTo(a, bot);
      g.lineTo(b, bot);
      g.lineTo(b, val - 10);
      g.quadraticCurveTo((a + b) / 2, val + 8, a, val - 10);
      g.closePath();
      g.fillStyle = red ? 'rgb(150,40,38)' : 'rgb(214,198,168)';
      g.fill();
    }
    g.save();
    poly(g, [[xl0, top], [xr0, top], [xr1, bot], [xl1, bot]]);
    g.clip();
    g.fillStyle = vgrad(g, top, bot, [[0, 'rgba(255,240,210,0.3)'], [0.5, 'rgba(255,240,210,0.05)'], [1, 'rgba(60,20,20,0.16)']]);
    g.fillRect(xl1, top, xr1 - xl1, bot - top);
    g.fillStyle = hgrad(g, xl1, xr1, [[0, 'rgba(40,20,30,0.18)'], [0.6, 'rgba(255,240,210,0)'], [1, 'rgba(255,240,210,0.2)']]);
    g.fillRect(xl1, top, xr1 - xl1, bot - top);
    g.restore();
    poly(g, [[xl0, top], [xl1, bot], [xl1, val - 10], [446, val - 8], [446, top + 4]]);
    g.fillStyle = 'rgb(108,34,34)';
    g.fill();
    g.fillStyle = 'rgba(20,10,10,0.25)';
    g.fillRect(xl1, bot - 2, xr1 - xl1, 3);
  }

  function drawInterior(g) {
    const { x0, x1, y0, y1 } = WIN;
    g.save();
    g.beginPath();
    g.rect(x0, y0, x1 - x0, y1 - y0);
    g.clip();
    g.fillStyle = vgrad(g, y0, y1, [[0, 'rgb(38,22,20)'], [0.55, 'rgb(62,36,28)'], [1, 'rgb(84,48,34)']]);
    g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = 'rgba(120,76,50,0.16)';
    for (let x = x0 + 30; x < x1; x += 64) g.fillRect(x, y0, 26, 140);
    g.fillStyle = 'rgb(92,58,40)';
    g.fillRect(x0, 668, x1 - x0, 5);
    g.fillStyle = 'rgba(20,10,8,0.4)';
    g.fillRect(x0, 673, x1 - x0, 5);
    const rg = LIB.rng(sd('shelf'));
    for (let i = 0; i < 9; i++) {
      const x = x0 + 24 + i * 40 + rg.range(-6, 6);
      g.fillStyle = 'rgb(70,40,34)';
      g.fillRect(x - 7, 652, 14, 16);
      g.fillStyle = 'rgba(232,192,104,0.85)';
      g.beginPath();
      g.arc(x, 658, 2.4, 0, TAU);
      g.fill();
    }
    for (const x of [592, 700, 826]) {
      g.fillStyle = vgrad(g, y0, y1, [[0, 'rgba(255,214,150,0.24)'], [1, 'rgba(255,200,130,0.05)']]);
      poly(g, [[x - 6, y0 + 6], [x + 6, y0 + 6], [x + 52, y1], [x - 52, y1]]);
      g.fill();
      const gl = g.createRadialGradient(x, y0 + 7, 0, x, y0 + 7, 26);
      gl.addColorStop(0, 'rgba(255,240,200,0.95)');
      gl.addColorStop(0.25, 'rgba(255,220,160,0.4)');
      gl.addColorStop(1, 'rgba(255,220,160,0)');
      g.fillStyle = gl;
      g.fillRect(x - 26, y0, 52, 34);
    }
    g.fillStyle = vgrad(g, 772, y1, [[0, 'rgb(128,40,54)'], [0.15, 'rgb(104,30,44)'], [1, 'rgb(70,18,30)']]);
    g.fillRect(x0, 772, x1 - x0, y1 - 772);
    g.fillStyle = 'rgb(58,22,32)';
    g.beginPath();
    g.moveTo(574, 690);
    g.lineTo(606, 690);
    g.quadraticCurveTo(606, 728, 640, 744);
    g.lineTo(642, 774);
    g.lineTo(538, 774);
    g.lineTo(540, 744);
    g.quadraticCurveTo(574, 728, 574, 690);
    g.fill();
    g.fillStyle = 'rgba(160,60,80,0.35)';
    g.fillRect(598, 692, 8, 50);
    g.strokeStyle = 'rgb(226,186,96)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(572, 724);
    g.quadraticCurveTo(590, 752, 608, 724);
    g.stroke();
    g.fillStyle = 'rgb(240,206,120)';
    g.beginPath();
    g.arc(590, 742, 3, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(96,30,42)';
    g.fillRect(790, 756, 76, 16);
    g.fillStyle = 'rgb(136,48,62)';
    g.fillRect(790, 754, 76, 4);
    for (const x of [804, 828, 852]) {
      g.fillStyle = 'rgb(208,166,84)';
      g.beginPath();
      g.arc(x, 752, 5, 0, TAU);
      g.fill();
      g.fillStyle = 'rgb(240,232,210)';
      g.beginPath();
      g.arc(x, 752, 3, 0, TAU);
      g.fill();
    }
    const pool = g.createRadialGradient(700, 760, 0, 700, 760, 90);
    pool.addColorStop(0, 'rgba(255,214,150,0.35)');
    pool.addColorStop(1, 'rgba(255,214,150,0)');
    g.fillStyle = pool;
    g.fillRect(600, 680, 200, 120);
    g.fillStyle = hgrad(g, 674, 726, [[0, 'rgb(82,22,36)'], [0.6, 'rgb(130,40,56)'], [1, 'rgb(96,28,42)']]);
    g.fillRect(674, 750, 52, 28);
    g.fillStyle = 'rgb(154,54,70)';
    g.beginPath();
    g.ellipse(700, 750, 26, 6, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(118,34,50)';
    g.beginPath();
    g.ellipse(700, 746, 14, 6, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(200,90,110,0.5)';
    g.beginPath();
    g.ellipse(703, 744, 8, 2.5, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(236,226,200)';
    g.fillRect(728, 764, 16, 10);
    g.restore();
  }

  const POLE_X = 220;

  function drawPole(g) {
    const bx = POLE_X, by = 852, topY = 284;
    const hgt = by - topY;
    const ex = bx - SHADOW_K[0] * hgt, ey = by - SHADOW_K[1] * hgt;
    g.fillStyle = 'rgba(70,56,80,0.24)';
    poly(g, [[bx - 4, by], [bx + 5, by + 1], [ex + 4, ey + 2], [ex - 5, ey]]);
    g.fill();
    g.fillStyle = hgrad(g, bx - 5, bx + 6, [[0, 'rgb(58,68,66)'], [0.55, 'rgb(96,106,100)'], [0.75, 'rgb(196,198,184)'], [1, 'rgb(110,118,110)']]);
    g.fillRect(bx - 4.5, topY, 9, hgt);
    g.fillStyle = 'rgb(76,84,80)';
    g.fillRect(bx - 9, 840, 18, 12);
    g.fillStyle = 'rgba(40,30,40,0.3)';
    g.beginPath();
    g.ellipse(bx - 2, 853, 16, 3, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(110,118,112)';
    g.beginPath();
    g.arc(bx, topY - 2, 6, 0, TAU);
    g.fill();
    const sign = (x, y, w, h) => {
      g.fillStyle = 'rgb(236,238,226)';
      g.fillRect(x, y, w, h);
      g.fillStyle = vgrad(g, y, y + h, [[0, 'rgb(36,122,76)'], [1, 'rgb(24,96,60)']]);
      g.fillRect(x + 2.5, y + 2.5, w - 5, h - 5);
    };
    const lw = 172;
    g.fillStyle = 'rgba(20,30,24,0.35)';
    g.fillRect(bx - lw / 2 + 2, 362, lw, 4);
    sign(bx - lw / 2, 328, lw, 34);
    g.save();
    g.fillStyle = 'rgb(240,242,232)';
    g.font = 'bold 21px Helvetica, Arial, sans-serif';
    g.textAlign = 'center';
    if ('letterSpacing' in g) g.letterSpacing = '1.5px';
    g.fillText('MAIN ST', bx + 1, 353);
    g.restore();
    g.save();
    g.translate(bx, 288);
    g.transform(0.6, 0.07, 0, 1, 0, 0);
    g.fillStyle = 'rgba(20,30,24,0.3)';
    g.fillRect(-73, 30, 150, 4);
    sign(-75, 0, 150, 30);
    g.fillStyle = 'rgb(240,242,232)';
    g.font = 'bold 20px Helvetica, Arial, sans-serif';
    g.textAlign = 'center';
    g.fillText('2ND ST', 0, 22.5);
    g.restore();
    g.fillStyle = 'rgb(84,92,88)';
    g.fillRect(bx - 6, 284, 12, 6);
    g.fillRect(bx - 6, 322, 12, 7);
    g.fillRect(bx - 6, 362, 12, 4);
  }

  function drawMaple(g) {
    const rs = LIB.rng(sd('dapple'));
    for (let i = 0; i < 26; i++) {
      g.fillStyle = 'rgba(70,58,86,0.13)';
      g.beginPath();
      g.ellipse(rs.range(-80, 250), rs.range(860, 960), rs.range(20, 70), rs.range(4, 12), 0, 0, TAU);
      g.fill();
    }
    poly(g, [[-6, 850], [138, 850], [146, 878], [-14, 878]]);
    g.fillStyle = 'rgb(176,168,156)';
    g.fill();
    poly(g, [[0, 853], [132, 853], [138, 874], [-6, 874]]);
    g.fillStyle = vgrad(g, 853, 874, [[0, 'rgb(70,56,46)'], [1, 'rgb(96,78,60)']]);
    g.fill();
    g.fillStyle = 'rgba(255,248,230,0.5)';
    g.fillRect(-14, 877, 160, 1.2);
    for (let i = 0; i < 30; i++) {
      const x = rs.range(0, 134), y = rs.range(858, 874);
      g.fillStyle = rs() < 0.5 ? 'rgba(98,132,62,0.9)' : 'rgba(146,170,82,0.9)';
      g.beginPath();
      g.moveTo(x - 1.5, y);
      g.lineTo(x + rs.range(-3, 3), y - rs.range(5, 11));
      g.lineTo(x + 1.5, y);
      g.fill();
    }
    for (let i = 0; i < 6; i++) {
      g.save();
      g.translate(rs.range(10, 128), rs.range(860, 872));
      g.scale(1, 0.45);
      g.rotate(rs() * TAU);
      g.fillStyle = LEAF_COLS[i % LEAF_COLS.length];
      leafPath(g, rs.range(5, 7));
      g.fill();
      g.restore();
    }
    g.beginPath();
    g.moveTo(30, 866);
    g.bezierCurveTo(46, 760, 40, 560, 54, 300);
    g.lineTo(84, 300);
    g.bezierCurveTo(82, 560, 80, 760, 104, 866);
    g.closePath();
    g.fillStyle = hgrad(g, 30, 104, [[0, 'rgb(62,50,46)'], [0.6, 'rgb(92,74,60)'], [0.85, 'rgb(150,120,90)'], [1, 'rgb(112,90,70)']]);
    g.fill();
    g.fillStyle = 'rgba(40,30,30,0.18)';
    for (let i = 0; i < 18; i++) g.fillRect(46 + rs.range(-6, 18), 340 + i * 28, rs.range(2, 4), rs.range(10, 26));
    g.strokeStyle = 'rgb(76,62,54)';
    g.lineCap = 'round';
    for (const [x0, y0, x1, y1, cx, cy, w] of [[66, 420, 210, 210, 140, 340, 12], [62, 380, -10, 200, 20, 300, 10], [70, 330, 120, 120, 90, 230, 9], [72, 360, 300, 260, 200, 330, 7]]) {
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(x0, y0);
      g.quadraticCurveTo(cx, cy, x1, y1);
      g.stroke();
    }
    const rc = LIB.rng(sd('crown'));
    const clumps = [];
    for (let tries = 0; clumps.length < 170 && tries < 4000; tries++) {
      const x = rc.range(-80, 400), y = rc.range(-80, 360);
      const ex = (x - 120) / 290, ey = (y - 110) / 230;
      const lim = 1 - 0.35 * sstep(150, 360, y) * sstep(150, 380, x);
      if (ex * ex + ey * ey > lim) continue;
      if (y > 236 && x > 120) continue;
      clumps.push([x, y, rc.range(20, 46)]);
    }
    clumps.sort((a, b) => a[0] - a[1] - (b[0] - b[1]));
    for (const [x, y, r] of clumps) {
      g.fillStyle = 'rgb(38,66,46)';
      g.beginPath();
      g.arc(x, y, r * 0.55, 0, TAU);
      g.fill();
      for (let j = 0; j < 14; j++) {
        const a = rc() * TAU;
        const d = Math.sqrt(rc()) * r * 0.95;
        g.save();
        g.translate(x + Math.cos(a) * d, y + Math.sin(a) * d);
        g.rotate(rc() * TAU);
        leafPath(g, rc.range(8, 13));
        g.fill();
        g.restore();
      }
    }
    for (const [x, y, r] of clumps) {
      const sunny = clamp01((x - y + 160) / 420);
      g.fillStyle = col([lerp(46, 66, sunny), lerp(78, 100, sunny), lerp(50, 56, sunny)]);
      g.beginPath();
      g.arc(x + r * 0.12, y - r * 0.12, r * 0.42, 0, TAU);
      g.fill();
    }
    const GREENS = [[44, 76, 50], [64, 102, 58], [92, 132, 66], [132, 160, 76], [178, 190, 98]];
    for (const [x, y, r] of clumps) {
      for (let j = 0; j < 20; j++) {
        const a = rc() * TAU;
        const d = Math.sqrt(rc()) * r * 1.1;
        const lx = x + Math.cos(a) * d, ly = y + Math.sin(a) * d;
        const sunny = clamp01((lx - ly + 120) / 400 + 0.35 * (Math.sin(a - 0.8) * d) / r);
        const idx = Math.min(4, Math.max(0, Math.floor(sunny * 4.2 + rc() * 1.2 - 0.3)));
        g.fillStyle = col(GREENS[idx], 0, 0.9);
        g.save();
        g.translate(lx, ly);
        g.rotate(rc() * TAU);
        g.scale(1, 0.75 + 0.25 * rc());
        leafPath(g, rc.range(6, 11));
        g.fill();
        g.restore();
      }
    }
    const YEL = [[230, 192, 70], [238, 204, 84], [244, 214, 104], [226, 170, 60], [212, 136, 50]];
    for (let i = 0; i < 150; i++) {
      const c = clumps[(rc() * clumps.length) | 0];
      const a = rc() * TAU;
      const x = c[0] + Math.cos(a) * c[2] * 0.9;
      const y = c[1] + Math.sin(a) * c[2] * 0.9;
      const sunny = clamp01((x - y + 100) / 380);
      if (rc() > 0.2 + 0.8 * sunny) continue;
      g.fillStyle = col(YEL[Math.min(YEL.length - 1, Math.floor(Math.pow(rc(), 1.8) * YEL.length))], 0, 0.8 + 0.2 * rc());
      g.save();
      g.translate(x, y);
      g.rotate(rc() * TAU);
      leafPath(g, rc.range(4.5, 8));
      g.fill();
      g.restore();
    }
    g.save();
    g.globalCompositeOperation = 'destination-out';
    for (const [x, y, rx, ry] of [[250, 120, 16, 9], [300, 60, 12, 8], [180, 230, 14, 7], [60, 40, 10, 7], [330, 170, 9, 6]]) {
      for (let j = 0; j < 4; j++) {
        g.save();
        g.translate(x + rc.range(-rx, rx), y + rc.range(-ry, ry));
        g.rotate(rc() * TAU);
        leafPath(g, rc.range(rx * 0.5, rx));
        g.fill();
        g.restore();
      }
    }
    g.restore();
  }

  function buildNear(S) {
    const { c, g } = makeLayer(S);
    drawGround(g);
    drawBuilding(g);
    drawMaple(g);
    drawPole(g);
    texture(c, S, 3, { mottle: 0.07, dark: 0.06, light: 0.04, glow: SUNLIGHT });
    return c;
  }

  function buildGlass(S) {
    const { c, g } = makeLayer(S);
    const { x0, x1, y0, y1 } = WIN;
    g.save();
    g.beginPath();
    g.rect(x0, y0, x1 - x0, y1 - y0);
    g.clip();
    g.fillStyle = vgrad(g, y0, y1, [[0, 'rgba(236,232,214,0.16)'], [0.45, 'rgba(236,232,214,0.03)'], [1, 'rgba(236,232,214,0.08)']]);
    g.fillRect(x0, y0, x1 - x0, y1 - y0);
    const streak = (u, w, a) => {
      const dx = 150;
      const gr = g.createLinearGradient(u - w, 0, u + w, 0);
      gr.addColorStop(0, 'rgba(255,250,236,0)');
      gr.addColorStop(0.5, `rgba(255,250,236,${a})`);
      gr.addColorStop(1, 'rgba(255,250,236,0)');
      g.save();
      g.transform(1, 0, -dx / (y1 - y0), 1, dx * y1 / (y1 - y0) - dx / 2, 0);
      g.fillStyle = gr;
      g.fillRect(u - w, y0, 2 * w, y1 - y0);
      g.restore();
    };
    streak(574, 40, 0.2);
    streak(626, 8, 0.2);
    streak(812, 62, 0.13);
    streak(872, 10, 0.18);
    g.fillStyle = 'rgba(30,40,30,0.12)';
    g.beginPath();
    g.ellipse(560, 590, 80, 50, 0, 0, TAU);
    g.fill();
    g.textAlign = 'center';
    g.font = 'italic 22px Georgia, "Times New Roman", serif';
    g.fillStyle = 'rgba(20,10,6,0.5)';
    g.fillText('Fine Diamonds & Gold', 711, 608);
    g.fillStyle = vgrad(g, 590, 610, [[0, 'rgb(250,226,150)'], [1, 'rgb(196,150,70)']]);
    g.fillText('Fine Diamonds & Gold', 710, 607);
    g.font = '12px Georgia, "Times New Roman", serif';
    if ('letterSpacing' in g) g.letterSpacing = '3px';
    g.fillStyle = 'rgb(214,178,98)';
    g.fillText('EST. 1952', 712, 627);
    g.restore();
    texture(c, S, 6, { mottle: 0.04, dark: 0.02, light: 0.02 });
    return c;
  }

  const SHAFTS = [[300, 50, 0.4], [420, 90, 0.75], [560, 40, 0.45], [660, 120, 0.6], [810, 64, 0.5], [920, 36, 0.35], [1010, 80, 0.4]];

  function buildShafts(S) {
    const shafts = LOOK.beamField({
      beams: SHAFTS,
      dir: [0.866, 0.5],
      noise: { base: 0.75, amp: 0.5, scale: 9, offset: 0, row: 7.5 },
      fall: (X, Y) => (1 - sstep(520, 940, Y)) * (0.45 + 0.55 * sstep(-120, 260, Y)) * 0.45,
      clamp: false,
    });
    const glow = LOOK.glowField({ x: SUN[0], y: SUN[1], r: 520, amount: 0.6 });
    const air = (X, Y) => 0.22 * (1 - sstep(260, 460, X)) * sstep(380, 640, Y) * (1 - sstep(700, 860, Y));
    return LOOK.lightLayer(S, { fields: [shafts, (X, Y) => 0.88 * beamField(X, Y), glow, air] });
  }

  let CACHE = null;
  function statics(S) {
    if (CACHE && CACHE.S === S) return CACHE;
    CACHE = {
      S,
      far: buildFar(S),
      mist: buildMist(S),
      mid: buildMid(S),
      near: buildNear(S),
      glass: buildGlass(S),
      shafts: buildShafts(S),
    };
    return CACHE;
  }

  const cam = (ctx, t, depth) => LOOK.camera(ctx, { t, dur: DUR, focus: FOCUS, push: PUSH, depth });

  function walkX(t) {
    const u = clamp01(t / B_FLASH);
    const a = 0.55;
    const k = 1 / (a + (1 - a) / 3);
    let f;
    if (u < a) f = k * u;
    else {
      const s = (u - a) / (1 - a);
      f = k * (a + (1 - a) * (s - s * s + (s * s * s) / 3));
    }
    return X0 + (X1 - X0) * f;
  }

  function pose(t) {
    const x = walkX(t);
    const walk = (x - X0) / STRIDE;
    const walkAmt = 1 - sstep(B_FLASH - 0.3, B_FLASH, t);
    const up = LIB.ease.outCubic((t - B_FLASH) / 0.25 + 1 / 6);
    const down = LIB.ease.inOutSine((t - B_HAND_DOWN) / (B_HAND_GONE - B_HAND_DOWN));
    const shield = t < B_FLASH ? 0 : up * (1 - down);
    const squint = t < B_FLASH ? 0 : clamp01(up * 1.5) * (1 - 0.9 * sstep(B_HAND_DOWN, B_HAND_DOWN + 0.9, t));
    const leanIn = LIB.ease.inOutSine((t - (B_HAND_DOWN + 0.15)) / 0.7);
    let lean = 0.15;
    if (t >= B_FLASH) lean = lerp(lerp(0.15, -0.2, up), 0.2, leanIn);
    const look = 0.3 * leanIn;
    return { x, y: FEET, h: JH, t, facing: 1, walk, walkAmt, shield, squint, lean, look };
  }

  function drawSam(ctx, o) {
    if (FILM.cast && typeof FILM.cast.sam === 'function') {
      FILM.cast.sam(ctx, o);
      return;
    }
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.lean * 0.3);
    ctx.fillStyle = 'rgb(128,128,136)';
    const w = 74;
    ctx.beginPath();
    ctx.moveTo(-w / 2, -w / 2);
    ctx.arc(0, -w / 2, w / 2, Math.PI, 0, true);
    ctx.lineTo(w / 2, -o.h + w / 2);
    ctx.arc(0, -o.h + w / 2, w / 2, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawSamShadow(ctx, S, o) {
    LOOK.castShadow(ctx, { x: o.x, y: o.y, h: o.h, k: SHADOW_K, S, draw: (g) => drawSam(g, o) });
    LOOK.contactShadow(ctx, { x: o.x, y: o.y, h: o.h });
  }

  function drawRing(ctx) {
    const [x, y] = RING;
    ctx.save();
    const gr = ctx.createLinearGradient(x - 8, y - 10, x + 8, y + 10);
    gr.addColorStop(0, 'rgb(255,236,160)');
    gr.addColorStop(0.45, 'rgb(232,180,74)');
    gr.addColorStop(1, 'rgb(150,96,30)');
    ctx.strokeStyle = gr;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(x, y, 6.5, 9.5, 0, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,246,206,0.9)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y, 6.5, 9.5, 0, Math.PI * 1.1, Math.PI * 1.45);
    ctx.stroke();
    ctx.fillStyle = 'rgb(214,170,80)';
    ctx.fillRect(x - 3.5, y - 12, 7, 3);
    const [dx, dy] = DIAMOND;
    const facet = (pts, c) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(pts[0][0] + dx, pts[0][1] + dy);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] + dx, pts[i][1] + dy);
      ctx.closePath();
      ctx.fill();
    };
    facet([[-6.5, -1], [6.5, -1], [0, 5.5]], 'rgb(128,164,204)');
    facet([[0, -1], [6.5, -1], [0, 5.5]], 'rgb(196,222,244)');
    facet([[-6.5, -1], [-3.5, -5], [3.5, -5], [6.5, -1]], 'rgb(220,236,252)');
    facet([[-1.5, -5], [3.5, -5], [6.5, -1], [1, -1]], 'rgb(255,255,255)');
    ctx.restore();
  }

  function drawBeam(ctx, t) {
    const s = (t - (B_FLASH - 0.08)) / 0.36;
    if (s <= 0 || s >= 1) return 0;
    const I = s < 0.222 ? sstep(0, 0.222, s) : 1 - sstep(0.222, 1, s);
    LOOK.beam(ctx, { from: DIAMOND, to: EYES, alpha: I, sweep: (s - 0.222) * 0.22 });
    return I;
  }

  const LEAVES = [
    [70, 170, 66, 30, 0.0, 8, 'rgb(232,190,70)'],
    [230, 110, 82, 26, 1.3, 6.5, 'rgb(226,150,54)'],
    [300, 330, 68, 22, 2.1, 7, 'rgb(240,206,92)'],
    [20, 420, 58, 18, 3.0, 6.5, 'rgb(200,184,80)'],
    [160, 30, 92, 30, 4.2, 7.5, 'rgb(236,180,64)'],
  ];
  const drawLeaves = (ctx, t) => LOOK.leaves(ctx, t, LEAVES);

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
      DUR = info.dur;
      B_FLASH = wordAt(info, 'tokbm', 3.26);
      B_HAND_DOWN = wordAt(info, 'tokbs', B_FLASH + 2.6);
      B_HAND_GONE = B_HAND_DOWN + 0.45;
      const head = () => FILM.cast.sam.pose(pose(t)).head;
      const CUTS = [
        { at: 0, z: 1, x: 540, y: 540, push: 0.02, dx: 3 },
        { at: wordAt(info, 'tokbk', 1.74), z: 1.5, x: () => walkX(t) + 150, y: FEET - JH * 0.52, push: 0.03 },
        { at: B_FLASH, z: 1.75, x: () => (head()[0] + DIAMOND[0]) / 2 - 50, y: () => (head()[1] + DIAMOND[1]) / 2 - 5, push: 0.05 },
        { at: wordAt(info, 'tokbq', B_FLASH + 1.8), z: 3, x: () => head()[0] + 50, y: () => head()[1] + 45, push: 0.04, dx: 4 },
      ];
      ctx.save();
      frame(ctx, t, CUTS);
      const env = LOOK.flashEnv(t, B_FLASH);
      const after = t >= B_FLASH ? Math.exp(-(t - B_FLASH) / 0.6) : 0;

      ctx.save();
      cam(ctx, t, PAR.far);
      ctx.drawImage(C.far, 0, 0, W, H);
      ctx.restore();

      ctx.save();
      cam(ctx, t, PAR.mid);
      LOOK.drawMist(ctx, C.mist, { x: -160 + 30 * (t / DUR), alpha: 0.75 });
      ctx.drawImage(C.mid, 0, 0, W, H);
      LOOK.drawMist(ctx, C.mist, { x: -60 - 24 * (t / DUR), y: 30, alpha: 0.45 });
      ctx.restore();

      ctx.save();
      cam(ctx, t, PAR.near);
      ctx.drawImage(C.near, 0, 0, W, H);
      const warm = 0.12 * sstep(B_FLASH - 1, B_FLASH, t) + 0.5 * env + 0.12 * after;
      if (warm > 0.005) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const wg = ctx.createRadialGradient(RING[0], RING[1], 0, RING[0], RING[1], 220);
        wg.addColorStop(0, `rgba(255,214,150,${0.5 * warm})`);
        wg.addColorStop(1, 'rgba(255,214,150,0)');
        ctx.fillStyle = wg;
        ctx.fillRect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0);
        ctx.restore();
      }
      drawRing(ctx);
      ctx.drawImage(C.glass, 0, 0, W, H);
      const o = pose(t);
      drawSamShadow(ctx, S, o);
      drawSam(ctx, o);
      ctx.restore();

      ctx.save();
      cam(ctx, t, PAR.air);
      LOOK.drawLight(ctx, C.shafts, { x: 8 * Math.sin(t * 0.35), alpha: 0.78 + 0.08 * Math.sin(t * 0.9) });
      ctx.restore();

      ctx.save();
      cam(ctx, t, PAR.near);
      drawBeam(ctx, t);
      const pre = sstep(B_FLASH - 0.9, B_FLASH, t);
      const pulse = 0.5 + 0.5 * Math.sin((t - B_FLASH) * 5.2);
      const settle = t >= B_FLASH ? sstep(B_FLASH + 0.3, B_FLASH + 1.2, t) : 0;
      const R = 9 + 6 * pre + 15 * env + 5 * after + settle * (5 + 8 * pulse);
      const a = 0.45 + 0.4 * pre + env + 0.3 * settle * pulse;
      LOOK.glint(ctx, { x: DIAMOND[0], y: DIAMOND[1], size: R, alpha: a, rot: 0.08 * Math.sin(t * 0.7) });
      if (env > 0.01 || after > 0.01) {
        LOOK.bloom(ctx, { x: DIAMOND[0], y: DIAMOND[1], r: 60 + 40 * env, alpha: 0.7 * env + 0.25 * after, mid: 0.3 * env + 0.08 * after });
      }
      drawLeaves(ctx, t);
      ctx.restore();

      ctx.restore();

      LOOK.exposure(ctx, env);

      LOOK.grain(ctx, info);

      FILM.cast.caption(ctx, info);
    },
  });
})();
