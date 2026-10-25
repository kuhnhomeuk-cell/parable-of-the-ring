// sets/dream.js: procedural set (background, props and light) shared by the scenes.
(function () {
  'use strict';

  const ID = 'dream';
  const LIB = FILM.lib, LOOK = FILM.look;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { sstep, makeLayer, poly, vgrad } = LOOK;
  const TAU = Math.PI * 2;
  const W = 1080, H = 1080;
  const KEY = [900, -60];
  const N = LOOK.noise(sd('vn'));
  const texture = (c, S, n, o) => LOOK.texture(c, S, Object.assign({ seed: sd('tex', n), offset: n * 13.7, noise: N }, o));

  function buildSky(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = vgrad(g, 0, H, [
      [0, 'rgb(190,206,232)'], [0.35, 'rgb(212,222,242)'], [0.6, 'rgb(226,230,246)'], [0.85, 'rgb(212,214,238)'], [1, 'rgb(196,198,228)'],
    ]);
    g.fillRect(0, 0, W, H);
    LOOK.haze(g, { x: KEY[0], y: KEY[1], r: 1000, stops: [[0, 'rgba(255,252,244,0.95)'], [0.35, 'rgba(250,248,252,0.55)'], [1, 'rgba(250,248,252,0)']] });
    LOOK.haze(g, { x: 520, y: 640, r: 560, stops: [[0, 'rgba(252,252,255,0.75)'], [1, 'rgba(252,252,255,0)']] });
    for (const [x, y, r, a] of [[140, 300, 360, 0.3], [980, 760, 380, 0.26], [300, 860, 300, 0.22], [760, 260, 260, 0.14]]) {
      LOOK.haze(g, { x, y, r, stops: [[0, `rgba(196,200,232,${a})`], [1, 'rgba(196,200,232,0)']] });
    }
    for (let i = 0; i < 70; i++) {
      const x = (LIB.h3(i, 1, sd('cl')) * 1.3 - 0.15) * W;
      const y = (LIB.h3(i, 2, sd('cl')) * 1.1 - 0.05) * H;
      const r = 60 + 150 * LIB.h3(i, 3, sd('cl'));
      const top = LIB.h3(i, 4, sd('cl')) < 0.6;
      LOOK.haze(g, { x, y, r, stops: top ? [[0, 'rgba(255,255,255,0.32)'], [1, 'rgba(255,255,255,0)']] : [[0, 'rgba(206,214,238,0.22)'], [1, 'rgba(206,214,238,0)']] });
    }
    const vg = g.createRadialGradient(540, 520, 260, 540, 520, 820);
    vg.addColorStop(0, 'rgba(176,184,222,0)');
    vg.addColorStop(1, 'rgba(160,168,212,0.55)');
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);
    texture(c, S, 1, { mottle: 0.045, dark: 0.035, light: 0.03, glow: { x: KEY[0], y: KEY[1], r: 900, amount: 0.12, color: [255, 248, 232] } });
    return c;
  }

  function shard(g, base, tip, wid, seed, cool) {
    const r = LIB.rng(seed);
    const dx = tip[0] - base[0], dy = tip[1] - base[1];
    const L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const P = (a, b) => [base[0] + ux * a + nx * b, base[1] + uy * a + ny * b];
    const sh = 0.55 + 0.2 * r();
    const L1 = P(0, -wid), R1 = P(0, wid);
    const L2 = P(L * sh, -wid * (0.8 + 0.3 * r())), R2 = P(L * sh * (0.9 + 0.15 * r()), wid * (0.75 + 0.3 * r()));
    const T = P(L, wid * (r() - 0.5) * 0.3);
    const S0 = P(-10, 0), S1 = P(L * sh * 0.95, wid * (r() - 0.5) * 0.3);
    const lightDir = [0.58, -0.81];
    const face = (pts, nrm, k) => {
      const d = Math.max(0, nrm[0] * lightDir[0] + nrm[1] * lightDir[1]);
      const lv = 0.25 + 0.75 * d;
      const c0 = cool ? [168, 186, 224] : [150, 172, 220];
      const c1 = [252, 253, 255];
      const m = (a, b) => Math.round(a + (b - a) * lv * k);
      poly(g, pts);
      g.fillStyle = `rgba(${m(c0[0], c1[0])},${m(c0[1], c1[1])},${m(c0[2], c1[2])},${(cool ? 0.5 : 0.72) + 0.25 * lv})`;
      g.fill();
    };
    face([L1, L2, S1, S0], [-nx, -ny], 1);
    face([S0, S1, R2, R1], [nx, ny], 1);
    face([L2, T, S1], [-nx * 0.6 + ux * 0.8, -ny * 0.6 + uy * 0.8], 1.05);
    face([S1, T, R2], [nx * 0.6 + ux * 0.8, ny * 0.6 + uy * 0.8], 1.05);
    g.strokeStyle = 'rgba(255,255,255,0.55)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(S0[0], S0[1]);
    g.lineTo(S1[0], S1[1]);
    g.lineTo(T[0], T[1]);
    g.stroke();
    g.strokeStyle = 'rgba(191,230,255,0.5)';
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(L2[0], L2[1]);
    g.lineTo(T[0], T[1]);
    g.lineTo(R2[0], R2[1]);
    g.stroke();
    return T;
  }

  const NEAR = {
    left: [[-60, 120, 150, 230, 70], [-80, 470, 120, 520, 52], [-50, 760, 170, 700, 64], [-40, 980, 110, 890, 48]],
    right: [[1140, 180, 900, 280, 76], [1150, 520, 960, 480, 50], [1130, 820, 930, 740, 66], [1120, 1040, 990, 930, 50]],
    top: [[260, -60, 330, 110, 56], [600, -70, 560, 70, 44], [780, -50, 720, 90, 40]],
    bottom: [[300, 1140, 360, 990, 50], [760, 1140, 700, 1000, 46]],
  };
  const FAR = [
    [-40, 300, 90, 330, 30], [-30, 620, 90, 600, 26], [1120, 380, 990, 400, 30], [1110, 650, 1000, 630, 26],
    [440, -30, 460, 60, 24], [900, -30, 860, 70, 22], [180, -30, 230, 70, 22], [1000, 1110, 960, 1000, 26],
  ];
  const TIPS = {};

  function buildShards(S, list, n, far) {
    const { c, g } = makeLayer(S);
    TIPS[n] = [];
    list.forEach((s, i) => TIPS[n].push(shard(g, [s[0], s[1]], [s[2], s[3]], s[4], sd('shard', n, i), far)));
    texture(c, S, 10 + n, { mottle: far ? 0.035 : 0.05, dark: 0.03, light: 0.03 });
    return c;
  }

  function buildLight(S, warm) {
    const shafts = LOOK.beamField({
      beams: [[180, 60, 0.55], [330, 90, 0.8], [520, 50, 0.5], [660, 110, 0.65], [860, 60, 0.4]],
      dir: [0.82, 0.57],
      noise: { base: 0.75, amp: 0.45, scale: 9, offset: 5, row: 4.5 },
      fall: (X, Y) => (1 - sstep(560, 1060, Y)) * 0.85,
      noiseFn: N,
    });
    const glow = LOOK.glowField({ x: KEY[0], y: KEY[1], r: 520, amount: 0.65 });
    return LOOK.lightLayer(S, { fields: [shafts, glow], color: warm ? [255, 224, 150] : [250, 250, 255] });
  }

  let CACHE = null;
  function statics(S) {
    if (CACHE && CACHE.S === S) return CACHE;
    CACHE = {
      S,
      sky: buildSky(S),
      bandsFar: LOOK.mist(S, { bands: [[230, 40, 0.55], [470, 60, 0.7], [700, 50, 0.6], [930, 70, 0.6]], color: [250, 251, 255], noiseFn: N }),
      bandsNear: LOOK.mist(S, { bands: [[360, 34, 0.5], [820, 46, 0.55]], color: [255, 255, 255], noise: { sx: 160, sy: 50, oy: 9, oct: 3, gain: 1.8, bias: 0.3 } }),
      shardsFar: buildShards(S, FAR, 0, true),
      left: buildShards(S, NEAR.left, 1),
      right: buildShards(S, NEAR.right, 2),
      top: buildShards(S, NEAR.top, 3),
      bottom: buildShards(S, NEAR.bottom, 4),
      skyFormed: null,
      nearAll: null,
      light: buildLight(S, false),
      lightWarm: buildLight(S, true),
    };
    const a = makeLayer(S);
    a.g.drawImage(CACHE.sky, 0, 0, W, H);
    LOOK.drawMist(a.g, CACHE.bandsFar, { x: -120, alpha: 1 });
    a.g.drawImage(CACHE.shardsFar, 0, 0, W, H);
    CACHE.skyFormed = a.c;
    const b = makeLayer(S);
    for (const k of ['left', 'right', 'top', 'bottom']) b.g.drawImage(CACHE[k], 0, 0, W, H);
    CACHE.nearAll = b.c;
    return CACHE;
  }

  const ease = (k) => LIB.ease.outCubic(Math.max(0, Math.min(1, k)));

  function back(ctx, t, o) {
    const C = statics(o.S || 1);
    const A = o.alpha == null ? 1 : o.alpha;
    if (A <= 0) return;
    ctx.save();
    ctx.globalAlpha = A;
    o.cam(ctx, 0.25);
    ctx.drawImage(C.skyFormed, 0, 0, W, H);
    ctx.restore();
  }

  function front(ctx, t, o) {
    const C = statics(o.S || 1);
    const form = o.form == null ? 1 : o.form;
    const A = o.alpha == null ? 1 : o.alpha;
    if (A <= 0) return;
    const f = ease(form);
    const bx = 4 * Math.sin(t * 0.5), by = 3 * Math.sin(t * 0.37 + 1);
    ctx.save();
    o.cam(ctx, 1.15);
    ctx.globalAlpha = A * f;
    const k = 1 + 0.3 * (1 - f);
    ctx.drawImage(C.nearAll, 540 - 540 * k + bx * 0.3, 540 - 540 * k + by * 0.3, W * k, H * k);
    for (let i = 0; i < 2; i++) {
      const list = TIPS[i === 0 ? 1 : 2];
      if (!list) continue;
      const j = Math.floor(t / 1.9 + i * 0.5) % list.length;
      const ph = (t / 1.9 + i * 0.5) % 1;
      const a = Math.pow(Math.sin(Math.PI * ph), 3) * f * A;
      const p = list[(j + list.length) % list.length];
      if (a > 0.02) LOOK.glint(ctx, { x: 540 + (p[0] - 540) * k + bx * 0.3, y: 540 + (p[1] - 540) * k + by * 0.3, size: 16, alpha: 0.7 * a, rot: 0.1 * i });
    }
    ctx.restore();
    ctx.save();
    o.cam(ctx, 0.7);
    ctx.globalAlpha = A;
    LOOK.drawLight(ctx, C.light, { x: 6 * Math.sin(t * 0.3), alpha: (0.8 + 0.08 * Math.sin(t * 0.8)) * (1 - (o.warm || 0) * 0.5) });
    if (o.warm > 0) LOOK.drawLight(ctx, C.lightWarm, { x: 6 * Math.sin(t * 0.3), alpha: 0.5 * o.warm });
    LOOK.drawMist(ctx, C.bandsNear, { x: -200 + 22 * t, alpha: 0.7 * f * A });
    ctx.restore();
  }

  FILM.sets = Object.assign(FILM.sets || {}, { dream: { statics, back, front, KEY } });
})();
