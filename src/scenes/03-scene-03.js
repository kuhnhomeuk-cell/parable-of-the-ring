// scenes/03-scene-03.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-03';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const TAU = Math.PI * 2;
  const W = 1080, H = 1080;
  const { sstep, clamp01, lerp, makeLayer, poly, vgrad, hgrad, fbm, vn, shade } = LOOK;
  const SET = () => FILM.sets.corner;

  const HORIZON = 500;
  const SUN = [840, 388];
  const FOCUS = [520, 700];
  const PUSH = 0.035;
  const DAWN = [246, 214, 186];
  const col = (c, hz, a) => LOOK.col(c, hz, a, DAWN);
  const PAR = { far: 0.2, mist: 0.45, mid: 0.45, mist2: 0.7, near: 0.75, fore: 1, air: 0.6 };
  const texture = (c, S, n, o) => LOOK.texture(c, S, Object.assign({ seed: sd('tex', n), offset: n * 9.1 }, o));

  const BANDS = { mid: [390, 790], near: [580, 852], fore: [790, H] };
  function band(S, name) {
    const [y0, y1] = BANDS[name];
    const L = makeLayer(S, 1, W, y1 - y0);
    L.g.translate(0, -y0);
    return L;
  }
  const drawBand = (ctx, c, name) => ctx.drawImage(c, 0, BANDS[name][0], W, BANDS[name][1] - BANDS[name][0]);

  const STORE = { x: 520, base: 772, w: 150 };
  const SPARK = [STORE.x - 16, STORE.base - 17];

  function buildFar(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = vgrad(g, 0, HORIZON + 20, [
      [0, 'rgb(96,124,170)'], [0.35, 'rgb(150,156,190)'], [0.62, 'rgb(214,182,184)'], [0.84, 'rgb(246,204,170)'], [1, 'rgb(252,226,180)'],
    ]);
    g.fillRect(0, 0, W, H);
    LOOK.haze(g, { x: SUN[0], y: SUN[1], r: 900, stops: [[0, 'rgba(255,236,196,0.9)'], [0.2, 'rgba(255,214,170,0.55)'], [0.55, 'rgba(250,196,170,0.18)'], [1, 'rgba(250,196,170,0)']] });
    for (const [r, a] of [[210, 0.08], [150, 0.1], [104, 0.14]]) {
      g.fillStyle = `rgba(255,240,206,${a})`;
      g.beginPath();
      g.arc(SUN[0], SUN[1], r, 0, TAU);
      g.fill();
    }
    const disc = g.createRadialGradient(SUN[0], SUN[1], 0, SUN[0], SUN[1], 56);
    disc.addColorStop(0, 'rgba(255,252,236,1)');
    disc.addColorStop(0.7, 'rgba(255,240,200,0.95)');
    disc.addColorStop(1, 'rgba(255,230,190,0)');
    g.fillStyle = disc;
    g.beginPath();
    g.arc(SUN[0], SUN[1], 56, 0, TAU);
    g.fill();
    const CL = [[220, 120, 260, 8, 0.32], [520, 190, 300, 7, 0.28], [140, 286, 220, 6, 0.3], [700, 300, 260, 6, 0.34], [930, 220, 200, 5, 0.3], [420, 372, 280, 5, 0.3], [980, 380, 160, 4, 0.36]];
    for (const [x, y, rx, ry, a] of CL) {
      g.fillStyle = `rgba(255,226,206,${a})`;
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0, 0, TAU);
      g.fill();
      g.fillStyle = `rgba(255,214,170,${a * 0.9})`;
      g.beginPath();
      g.ellipse(x + rx * 0.1, y + ry * 0.5, rx * 0.7, ry * 0.45, 0, 0, TAU);
      g.fill();
    }
    const hill = (base, amp, sc, seed, top, bot) => {
      g.beginPath();
      g.moveTo(-20, H);
      for (let x = -20; x <= W + 20; x += 4) g.lineTo(x, base - amp * fbm(x * sc + seed, seed * 0.37, 3));
      g.lineTo(W + 20, H);
      g.closePath();
      g.fillStyle = vgrad(g, base - amp, base + 60, [[0, top], [1, bot]]);
      g.fill();
    };
    hill(500, 110, 1 / 360, 41, 'rgb(176,164,190)', 'rgb(214,190,190)');
    hill(520, 70, 1 / 230, 53, 'rgb(150,146,172)', 'rgb(196,180,180)');
    const tx = 168, ty = 452;
    g.strokeStyle = col([120, 116, 140], 0.35);
    g.lineWidth = 2;
    for (const [a, b] of [[-14, -20], [14, 20], [-5, -7], [5, 7]]) {
      g.beginPath();
      g.moveTo(tx + a, ty);
      g.lineTo(tx + b, ty + 46);
      g.stroke();
    }
    g.fillStyle = col([132, 128, 150], 0.3);
    g.beginPath();
    g.ellipse(tx, ty - 6, 22, 16, 0, 0, TAU);
    g.fill();
    g.fillRect(tx - 22, ty - 8, 44, 12);
    g.fillStyle = col([120, 116, 140], 0.3);
    poly(g, [[tx - 24, ty - 18], [tx, ty - 34], [tx + 24, ty - 18]]);
    g.fill();
    hill(546, 46, 1 / 150, 67, 'rgb(132,140,150)', 'rgb(176,172,166)');
    texture(c, S, 1, { mottle: 0.045, dark: 0.035, light: 0.03 });
    return c;
  }

  const BODIES = [[234, 228, 212], [232, 214, 164], [178, 196, 168], [180, 198, 208], [226, 196, 182], [214, 206, 190]];
  const ROOFS = [[112, 110, 120], [146, 92, 80], [92, 88, 96], [128, 104, 96]];
  function midHouses() {
    const r = LIB.rng(sd('mid'));
    const rows = [];
    for (const [base, wMin, wMax, hz, n] of [[586, 26, 40, 0.62, 26], [624, 36, 56, 0.48, 20], [668, 50, 74, 0.34, 16]]) {
      let x = -30 + r.range(0, 30);
      for (let i = 0; i < n && x < W + 40; i++) {
        const w = r.range(wMin, wMax);
        if (r() < 0.3) {
          rows.push({ tree: true, x: x + w / 2, base, size: w * 0.6, seed: rows.length, hz });
        } else {
          rows.push({
            x: x + w / 2, base: base + r.range(-4, 4), w, h: w * r.range(0.5, 0.7), type: r() < 0.5 ? 'gable' : 'side',
            body: BODIES[(r() * BODIES.length) | 0], roof: ROOFS[(r() * ROOFS.length) | 0], trim: [244, 240, 228], hz, chimney: r() < 0.4,
          });
        }
        x += w + r.range(4, 22);
      }
    }
    return rows;
  }
  const MID = midHouses();

  function steeple(g, x, base, hz) {
    g.fillStyle = col([226, 220, 206], hz);
    g.fillRect(x - 16, base - 120, 32, 120);
    g.fillStyle = col([196, 188, 178], hz);
    g.fillRect(x - 16, base - 120, 10, 120);
    g.fillStyle = col([110, 104, 112], hz);
    poly(g, [[x - 19, base - 118], [x, base - 196], [x + 19, base - 118]]);
    g.fill();
    g.fillStyle = col([84, 90, 100], hz);
    g.fillRect(x - 6, base - 100, 12, 18);
    g.strokeStyle = col([90, 90, 100], hz);
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x, base - 196);
    g.lineTo(x, base - 214);
    g.moveTo(x - 6, base - 207);
    g.lineTo(x + 6, base - 207);
    g.stroke();
    g.fillStyle = col([220, 212, 198], hz);
    g.fillRect(x + 14, base - 56, 70, 56);
    g.fillStyle = col([120, 112, 118], hz);
    poly(g, [[x + 10, base - 54], [x + 49, base - 82], [x + 88, base - 54]]);
    g.fill();
  }

  function buildMid(S) {
    const { c, g } = band(S, 'mid');
    const CORNER = SET();
    g.fillStyle = vgrad(g, 540, 760, [[0, 'rgb(170,176,150)'], [0.5, 'rgb(140,160,112)'], [1, 'rgb(118,148,90)']]);
    g.fillRect(-20, 560, W + 40, 220);
    for (const y of [596, 636, 682]) {
      g.fillStyle = col([186, 178, 170], clamp01((700 - y) / 200));
      g.fillRect(-20, y, W + 40, 3 + (y - 580) / 40);
    }
    steeple(g, 640, 616, 0.5);
    for (const h of MID) {
      if (h.tree) CORNER.roundTree(g, h.x, h.base, h.size, h.seed, 'summer', h.hz);
      else CORNER.houseFront(g, h);
    }
    texture(c, S, 2, { mottle: 0.05, dark: 0.04, light: 0.03 });
    return c;
  }

  function buildMidLight(S) {
    const { c, g } = band(S, 'mid');
    const CORNER = SET();
    for (const h of MID) if (!h.tree) CORNER.houseLight(g, Object.assign({ alpha: 0.75 }, h));
    g.fillStyle = 'rgba(255,214,150,0.6)';
    g.fillRect(646, 496, 10, 120);
    poly(g, [[640, 420], [659, 498], [646, 498]]);
    g.fill();
    return c;
  }

  const NEAR = [
    { x: 92, base: 770, w: 132, h: 80, type: 'side', body: [232, 214, 164], roof: [146, 92, 80], trim: [244, 240, 228], shutter: [70, 96, 80], chimney: true, porch: true },
    { x: 262, base: 772, w: 110, h: 70, type: 'gable', body: [180, 198, 208], roof: [92, 88, 96], trim: [244, 240, 228], porch: true },
    { tree: true, x: 352, base: 776, size: 64, seed: 7 },
    { x: 736, base: 772, w: 120, h: 74, type: 'gable', body: [234, 228, 212], roof: [112, 110, 120], trim: [244, 240, 228], shutter: [130, 60, 52], porch: true },
    { tree: true, x: 836, base: 776, size: 70, seed: 9 },
    { x: 956, base: 770, w: 150, h: 84, type: 'side', body: [178, 196, 168], roof: [128, 104, 96], trim: [244, 240, 228], chimney: true, porch: true },
  ];

  function store(g) {
    const { x, base, w } = STORE;
    const L = x - w / 2, R = x + w / 2;
    const top = base - w * 1.02;
    poly(g, [[L, top], [L - w * 0.08, top + w * 0.1], [L - w * 0.08, base - 4], [L, base]]);
    g.fillStyle = 'rgb(110,62,54)';
    g.fill();
    g.fillStyle = hgrad(g, L, R, [[0, 'rgb(150,72,56)'], [1, 'rgb(192,104,74)']]);
    g.fillRect(L, top, w, w * 0.6);
    g.fillStyle = 'rgba(80,36,26,0.12)';
    for (let y = top + 10; y < top + w * 0.56; y += 3.2) g.fillRect(L, y, w, 0.7);
    g.fillStyle = 'rgb(240,230,206)';
    g.fillRect(L - 2, top - 3, w + 4, 5);
    g.fillStyle = 'rgb(214,200,174)';
    g.fillRect(L, top + 2, w, 7);
    g.fillStyle = 'rgba(50,20,16,0.3)';
    g.fillRect(L, top + 9, w, 4);
    for (const k of [0.18, 0.5, 0.82]) {
      const wx = L + k * w - w * 0.075;
      g.fillStyle = 'rgb(232,220,196)';
      g.fillRect(wx - 2, top + 18, w * 0.15 + 4, w * 0.3);
      g.fillStyle = vgrad(g, top + 20, top + 18 + w * 0.29, [[0, 'rgb(150,176,188)'], [1, 'rgb(84,100,114)']]);
      g.fillRect(wx, top + 20, w * 0.15, w * 0.27);
      g.fillStyle = 'rgb(232,220,196)';
      g.fillRect(wx, top + 20 + w * 0.13, w * 0.15, 1.5);
    }
    const fy = top + w * 0.6;
    g.fillStyle = hgrad(g, L, R, [[0, 'rgb(34,64,52)'], [1, 'rgb(56,96,76)']]);
    g.fillRect(L, fy, w, w * 0.085);
    g.fillStyle = 'rgb(198,160,82)';
    g.fillRect(L, fy, w, 1.2);
    g.save();
    g.font = 'bold 10px Georgia, "Times New Roman", serif';
    g.textAlign = 'center';
    if ('letterSpacing' in g) g.letterSpacing = '2.5px';
    g.fillStyle = 'rgb(230,196,110)';
    g.fillText('JEWELERS', x + 1, fy + w * 0.07);
    g.restore();
    const at = fy + w * 0.085, ab = at + w * 0.09;
    const n = 11;
    for (let i = 0; i < n; i++) {
      const x0 = L - 2 + ((w + 4) * i) / n, x1 = L - 2 + ((w + 4) * (i + 1)) / n;
      g.fillStyle = i % 2 === 0 ? 'rgb(184,54,48)' : 'rgb(240,228,200)';
      poly(g, [[x0 + 1, at], [x1 + 1, at], [x1, ab], [x0, ab]]);
      g.fill();
      g.beginPath();
      g.moveTo(x0, ab);
      g.quadraticCurveTo((x0 + x1) / 2, ab + 5, x1, ab);
      g.fillStyle = i % 2 === 0 ? 'rgb(150,40,38)' : 'rgb(214,198,168)';
      g.fill();
    }
    const gy = ab + 2;
    g.fillStyle = hgrad(g, L, R, [[0, 'rgb(42,76,60)'], [1, 'rgb(64,108,84)']]);
    g.fillRect(L, gy, w, base - gy);
    const wx0 = L + w * 0.1, wx1 = L + w * 0.68, wy0 = gy + 6, wy1 = base - 8;
    g.fillStyle = 'rgb(186,146,76)';
    g.fillRect(wx0 - 2, wy0 - 2, wx1 - wx0 + 4, wy1 - wy0 + 4);
    g.fillStyle = vgrad(g, wy0, wy1, [[0, 'rgb(90,56,40)'], [0.6, 'rgb(140,88,56)'], [1, 'rgb(118,40,52)']]);
    g.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
    g.fillStyle = 'rgba(255,214,150,0.5)';
    for (const k of [0.25, 0.5, 0.75]) g.fillRect(wx0 + (wx1 - wx0) * k - 1, wy0, 2, 3);
    const pool = g.createRadialGradient(SPARK[0], SPARK[1] + 2, 0, SPARK[0], SPARK[1] + 2, 16);
    pool.addColorStop(0, 'rgba(255,224,170,0.8)');
    pool.addColorStop(1, 'rgba(255,224,170,0)');
    g.fillStyle = pool;
    g.fillRect(SPARK[0] - 16, wy0, 32, wy1 - wy0);
    g.fillStyle = 'rgb(130,40,56)';
    g.fillRect(SPARK[0] - 4, SPARK[1] + 2, 8, 5);
    g.fillStyle = 'rgb(66,44,32)';
    g.fillRect(L + w * 0.76, gy + 3, w * 0.14, base - gy - 3);
    g.fillStyle = 'rgb(100,70,48)';
    g.fillRect(L + w * 0.78, gy + 7, w * 0.1, (base - gy) * 0.42);
    g.fillStyle = 'rgb(96,90,82)';
    g.fillRect(L - 2, base - 2, w + 4, 3);
  }

  function polePlusMaple(g) {
    const x = STORE.x - STORE.w / 2 - 30, base = 778;
    SET().roundTree(g, x - 34, base, 46, 21, 'summer', 0);
    g.fillStyle = 'rgb(110,118,112)';
    g.fillRect(x - 1.3, base - 80, 2.6, 80);
    g.fillStyle = 'rgb(36,122,76)';
    g.fillRect(x - 13, base - 76, 26, 6);
    g.save();
    g.translate(x, base - 84);
    g.transform(0.6, 0.07, 0, 1, 0, 0);
    g.fillRect(-11, 0, 22, 5);
    g.restore();
  }

  function buildNear(S) {
    const { c, g } = band(S, 'near');
    const CORNER = SET();
    g.fillStyle = vgrad(g, 700, 790, [[0, 'rgb(130,156,96)'], [1, 'rgb(104,138,74)']]);
    g.fillRect(-20, 716, W + 40, 70);
    g.fillStyle = vgrad(g, 690, 790, [[0, 'rgb(176,170,164)'], [1, 'rgb(140,134,132)']]);
    poly(g, [[392, 790], [452, 790], [430, 700], [410, 700]]);
    g.fill();
    for (const h of NEAR) {
      if (h.tree) CORNER.roundTree(g, h.x, h.base, h.size, h.seed, 'summer', 0);
      else CORNER.houseFront(g, h);
    }
    store(g);
    polePlusMaple(g);
    g.fillStyle = 'rgb(214,204,186)';
    g.fillRect(-20, 776, W + 40, 14);
    g.fillStyle = 'rgba(255,246,226,0.6)';
    g.fillRect(-20, 790, W + 40, 1.5);
    g.fillStyle = vgrad(g, 792, 830, [[0, 'rgb(120,116,120)'], [1, 'rgb(102,98,104)']]);
    g.fillRect(-20, 792, W + 40, 38);
    g.fillStyle = 'rgba(226,202,118,0.5)';
    for (let x = -10; x < W + 20; x += 46) g.fillRect(x, 810, 24, 2);
    g.fillStyle = 'rgb(206,198,180)';
    g.fillRect(-20, 830, W + 40, 10);
    g.fillStyle = 'rgba(70,60,96,0.18)';
    for (const h of NEAR) {
      const hx = h.x - (h.w || h.size) * 0.5;
      poly(g, [[hx, 778], [h.x + (h.w || h.size) * 0.5, 778], [h.x - (h.w || h.size) * 0.2 - 60, 834], [hx - 80, 834]]);
      g.fill();
    }
    texture(c, S, 3, { mottle: 0.06, dark: 0.05, light: 0.035, glow: { x: SUN[0], y: SUN[1] - BANDS.near[0], r: 700, amount: 0.2 } });
    return c;
  }

  function buildNearLight(S) {
    const { c, g } = band(S, 'near');
    const CORNER = SET();
    for (const h of NEAR) if (!h.tree) CORNER.houseLight(g, h);
    const { x, base, w } = STORE;
    const top = base - w * 1.02;
    g.fillStyle = 'rgba(255,220,160,0.7)';
    g.fillRect(x - w / 2 - 2, top - 3, w + 4, 3);
    g.fillStyle = hgrad(g, x + w * 0.2, x + w / 2, [[0, 'rgba(255,206,140,0)'], [1, 'rgba(255,206,140,0.45)']]);
    g.fillRect(x + w * 0.2, top, w * 0.3, w * 0.6);
    return c;
  }

  function buildFore(S) {
    const { c, g } = band(S, 'fore');
    g.beginPath();
    g.moveTo(-20, H);
    for (let x = -20; x <= W + 20; x += 6) g.lineTo(x, 900 - 34 * fbm(x / 220 + 3, 1.7, 3) - 30 * Math.exp(-Math.pow((x - 900) / 260, 2)));
    g.lineTo(W + 20, H);
    g.closePath();
    g.fillStyle = vgrad(g, 850, H, [[0, 'rgb(96,124,70)'], [0.4, 'rgb(70,98,58)'], [1, 'rgb(48,70,48)']]);
    g.fill();
    const r = LIB.rng(sd('tuft'));
    for (let i = 0; i < 220; i++) {
      const x = r.range(-10, W + 10);
      const y = 902 - 34 * fbm(x / 220 + 3, 1.7, 3) - 30 * Math.exp(-Math.pow((x - 900) / 260, 2)) + r.range(-4, 40);
      const lit = x > 500 && r() < 0.6;
      g.fillStyle = lit ? 'rgba(196,196,110,0.8)' : 'rgba(58,86,52,0.85)';
      g.beginPath();
      g.moveTo(x - 2, y + 4);
      g.lineTo(x + r.range(-4, 4), y - r.range(8, 18));
      g.lineTo(x + 2, y + 4);
      g.fill();
    }
    const crown = (cx, cy, rx, ry, seed) => {
      const rc = LIB.rng(sd('crown', seed));
      for (let i = 0; i < 40; i++) {
        const a = rc() * TAU, d = Math.sqrt(rc());
        const x = cx + Math.cos(a) * d * rx * 0.9, y = cy + Math.sin(a) * d * ry * 0.9;
        const rr = rc.range(30, 56);
        g.fillStyle = 'rgb(40,62,44)';
        g.beginPath();
        g.arc(x, y, rr, 0, TAU);
        g.fill();
      }
      for (let i = 0; i < 520; i++) {
        const a = rc() * TAU, d = Math.sqrt(rc());
        const x = cx + Math.cos(a) * d * rx * 1.02, y = cy + Math.sin(a) * d * ry * 1.02;
        const sunny = clamp01((x - cx) / rx * 0.6 + (cy - y) / ry * 0.6);
        g.fillStyle = sunny > 0.5 ? 'rgba(112,140,74,0.9)' : sunny > 0.2 ? 'rgba(70,100,58,0.9)' : 'rgba(50,76,50,0.9)';
        g.save();
        g.translate(x, y);
        g.rotate(rc() * TAU);
        LOOK.leafPath(g, rc.range(6, 10));
        g.fill();
        g.restore();
      }
    };
    crown(30, 980, 170, 120, 1);
    crown(1070, 1000, 200, 130, 2);
    texture(c, S, 4, { mottle: 0.07, dark: 0.06, light: 0.04 });
    return c;
  }

  function buildAir(S) {
    const beams = LOOK.beamField({
      beams: [[620, 40, 0.5], [700, 70, 0.7], [800, 46, 0.5], [880, 80, 0.55], [960, 40, 0.4]],
      dir: [0.32, 0.947],
      noise: { base: 0.7, amp: 0.5, scale: 8, offset: 2, row: 5.5 },
      fall: (X, Y) => sstep(-200, 700, X) * (1 - sstep(760, 900, Y)) * 0.5,
    });
    const glow = LOOK.glowField({ x: SUN[0], y: SUN[1], r: 380, amount: 0.55 });
    return LOOK.lightLayer(S, { fields: [beams, glow], color: [255, 228, 186] });
  }

  const buildMist = (S) => LOOK.mist(S, { bands: [[560, 26, 1.3], [606, 30, 0.9], [650, 24, 0.6]], color: [252, 234, 220], noise: { sx: 180, sy: 40, bias: 0.25 } });
  const buildMist2 = (S) => LOOK.mist(S, { bands: [[700, 22, 1.0]], color: [250, 234, 220], noise: { sx: 160, sy: 36, oy: 9, bias: 0.25 } });

  let CACHE = null;
  function statics(S) {
    if (CACHE && CACHE.S === S) return CACHE;
    CACHE = {
      S, far: buildFar(S), mist: buildMist(S), mid: buildMid(S), midLight: buildMidLight(S), mist2: buildMist2(S),
      near: buildNear(S), nearLight: buildNearLight(S), fore: buildFore(S), air: buildAir(S),
    };
    return CACHE;
  }

  function birds(ctx, t) {
    ctx.save();
    ctx.strokeStyle = 'rgba(70,60,80,0.7)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    for (const [x0, y0, v, ph, s] of [[180, 230, 34, 0, 7], [230, 250, 32, 1.7, 6], [150, 262, 36, 3.1, 5.5]]) {
      const x = x0 + v * t, y = y0 + 4 * Math.sin(t * 1.3 + ph);
      const f = Math.sin(t * 9 + ph) * 0.8;
      ctx.beginPath();
      ctx.moveTo(x - s, y - s * f * 0.6);
      ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.3, x, y);
      ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.3, x + s, y - s * f * 0.6);
      ctx.stroke();
    }
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
      const cam = (depth) => LOOK.camera(ctx, { t, dur: info.dur, focus: FOCUS, push: PUSH, depth });
      const first = sstep(0, 0.75 * info.dur, t);
      const B_ONE = wordAt(info, 'tokas', 0.42 * info.dur);
      const CUTS = [
        { at: 0, z: 1, x: 540, y: 540, push: 0.02, dx: 4 },
        { at: B_ONE, z: 2.1, x: STORE.x + 10, y: STORE.base - 70, push: 0.035, dx: -5, dy: -2 },
      ];
      ctx.save();
      frame(ctx, t, CUTS);

      ctx.save();
      cam(PAR.far);
      ctx.drawImage(C.far, 0, 0, W, H);
      birds(ctx, t);
      ctx.restore();

      ctx.save();
      cam(PAR.mid);
      LOOK.drawMist(ctx, C.mist, { x: -140 + 22 * (t / info.dur), alpha: 0.85 });
      drawBand(ctx, C.mid, 'mid');
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.2 + 0.6 * first;
      drawBand(ctx, C.midLight, 'mid');
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      LOOK.drawMist(ctx, C.mist, { x: -60 - 18 * (t / info.dur), y: 40, alpha: 0.55 });
      ctx.restore();

      ctx.save();
      cam(PAR.mist2);
      LOOK.drawMist(ctx, C.mist2, { x: -120 + 26 * (t / info.dur), alpha: 0.6 });
      ctx.restore();

      ctx.save();
      cam(PAR.near);
      drawBand(ctx, C.near, 'near');
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.12 + 0.6 * sstep(0.2 * info.dur, 0.9 * info.dur, t);
      drawBand(ctx, C.nearLight, 'near');
      ctx.restore();

      ctx.save();
      cam(PAR.fore);
      drawBand(ctx, C.fore, 'fore');
      ctx.restore();

      ctx.save();
      cam(PAR.air);
      LOOK.drawLight(ctx, C.air, { x: 6 * Math.sin(t * 0.4), alpha: 0.72 + 0.06 * Math.sin(t * 0.9) });
      ctx.restore();

      ctx.save();
      cam(PAR.near);
      const B = B_ONE + 0.08;
      const env = LOOK.flashEnv(t, B, { rise: 4, fall: 18 });
      const tw = 0.5 + 0.5 * Math.sin(t * 5.3);
      LOOK.glint(ctx, { x: SPARK[0], y: SPARK[1], size: 8 + 2 * tw + 10 * env, alpha: 0.75 + 0.2 * tw + 0.3 * env, rot: 0.1 * Math.sin(t * 0.8) });
      LOOK.bloom(ctx, { x: SPARK[0], y: SPARK[1], r: 26 + 14 * env, alpha: 0.25 + 0.2 * tw + 0.4 * env });
      ctx.restore();
      ctx.restore();

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
