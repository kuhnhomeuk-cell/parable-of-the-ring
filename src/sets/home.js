// sets/home.js: procedural set (background, props and light) shared by the scenes.
(function () {
  'use strict';

  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const sd = (...k) => LIB.hash('set-home', ...k) & 0x7fffffff;
  const { makeLayer, poly, vgrad, hgrad, shade, fbm, vn, leafPath } = LOOK;
  const TAU = Math.PI * 2;
  const W = 1080;
  const H = 1080;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const lerp = (a, b, k) => a + (b - a) * k;
  const sstep = (e0, e1, x) => {
    const u = clamp01((x - e0) / (e1 - e0));
    return u * u * (3 - 2 * u);
  };
  const rgb = (c, a) => (a == null ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`);
  const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  const texture = (c, S, n, o) => LOOK.texture(c, S, Object.assign({ seed: sd('tex', n), offset: n * 17.3 }, o));

  function rect(g, x, y, w, h, c) {
    g.fillStyle = c;
    g.fillRect(x, y, w, h);
  }
  function ell(g, x, y, rx, ry, c, r) {
    g.fillStyle = c;
    g.beginPath();
    g.ellipse(x, y, rx, ry, r || 0, 0, TAU);
    g.fill();
  }
  function rrect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function crown(g, o) {
    const r = LIB.rng(sd('crown', o.seed));
    const G = o.greens;
    const clumps = [];
    for (let tries = 0; clumps.length < o.n && tries < 4000; tries++) {
      const x = r.range(o.x - o.rx, o.x + o.rx), y = r.range(o.y - o.ry, o.y + o.ry);
      const ex = (x - o.x) / o.rx, ey = (y - o.y) / o.ry;
      if (ex * ex + ey * ey > 1) continue;
      clumps.push([x, y, r.range(o.cr * 0.6, o.cr)]);
    }
    for (const [x, y, cr] of clumps) {
      g.fillStyle = rgb(G[0]);
      g.beginPath();
      g.arc(x, y, cr * 0.6, 0, TAU);
      g.fill();
      for (let j = 0; j < 8; j++) {
        const a = r() * TAU, d = Math.sqrt(r()) * cr;
        g.save();
        g.translate(x + Math.cos(a) * d, y + Math.sin(a) * d);
        g.rotate(r() * TAU);
        leafPath(g, r.range(o.leaf * 0.8, o.leaf * 1.2));
        g.fill();
        g.restore();
      }
    }
    for (const [x, y, cr] of clumps) {
      const lit = clamp01(((x - o.x) * o.lx + (y - o.y) * o.ly) / o.rx * 0.6 + 0.5);
      for (let j = 0; j < 10; j++) {
        const a = r() * TAU, d = Math.sqrt(r()) * cr * 0.9;
        const k = clamp01(lit + 0.3 * (Math.cos(a) * o.lx + Math.sin(a) * o.ly) * d / cr + r.range(-0.15, 0.15));
        const idx = Math.min(G.length - 1, 1 + Math.floor(k * (G.length - 1)));
        g.fillStyle = rgb(G[idx], 0.92);
        g.save();
        g.translate(x + Math.cos(a) * d, y + Math.sin(a) * d);
        g.rotate(r() * TAU);
        leafPath(g, r.range(o.leaf * 0.6, o.leaf));
        g.fill();
        g.restore();
      }
    }
  }

  const PORCH = {
    floor: 752,
    edge: 762,
    tread1: 808,
    tread2: 848,
    ground: 884,
    steps: [396, 684],
    door: [496, 626, 470, 742],
    lamp: [560, 318],
    winL: [298, 444, 356, 622],
    winR: [786, 952, 356, 622],
    sun: [1060, -90],
    horizon: 610,
  };

  const PORCH_PAL = {
    day: {
      skyTop: [122, 168, 202], skyMid: [176, 204, 212], skyLow: [238, 228, 202],
      far: [170, 190, 186], farLo: [204, 210, 196],
      lawnFar: [150, 172, 120], lawn: [104, 146, 78], lawnNear: [84, 128, 64],
      siding: [238, 232, 216], sidingShade: [178, 176, 172], trim: [248, 246, 238],
      shutter: [104, 138, 118], door: [158, 58, 48], roof: [104, 86, 84],
      floor: [150, 160, 166], glass: [92, 112, 128], glassHi: [190, 210, 220],
      greens: [[40, 70, 46], [62, 98, 58], [92, 132, 68], [136, 166, 84], [182, 196, 108]],
    },
    dusk: {
      skyTop: [34, 44, 88], skyMid: [82, 84, 132], skyLow: [214, 146, 128],
      far: [72, 78, 110], farLo: [110, 100, 128],
      lawnFar: [76, 92, 92], lawn: [62, 84, 72], lawnNear: [50, 70, 62],
      siding: [196, 196, 210], sidingShade: [120, 124, 150], trim: [214, 214, 226],
      shutter: [70, 96, 100], door: [124, 48, 50], roof: [70, 62, 74],
      floor: [116, 124, 142], glass: [255, 206, 132], glassHi: [255, 236, 190],
      greens: [[26, 40, 44], [40, 60, 58], [58, 82, 70], [84, 106, 84], [112, 128, 98]],
    },
  };

  function porchFar(S, mode) {
    const P = PORCH_PAL[mode];
    const { c, g } = makeLayer(S);
    const HZ = PORCH.horizon;
    g.fillStyle = vgrad(g, 0, HZ, [[0, rgb(P.skyTop)], [0.55, rgb(P.skyMid)], [1, rgb(P.skyLow)]]);
    g.fillRect(0, 0, W, H);
    if (mode === 'day') {
      LOOK.haze(g, { x: PORCH.sun[0], y: PORCH.sun[1], r: 1100 });
    } else {
      LOOK.haze(g, { x: 980, y: HZ + 20, r: 700, stops: [[0, 'rgba(255,170,130,0.55)'], [0.5, 'rgba(220,130,130,0.18)'], [1, 'rgba(200,120,140,0)']] });
      const rs = LIB.rng(sd('stars'));
      for (let i = 0; i < 60; i++) {
        const x = rs.range(0, W), y = rs.range(0, HZ * 0.55);
        ell(g, x, y, rs.range(0.6, 1.5), rs.range(0.6, 1.5), `rgba(240,236,255,${rs.range(0.25, 0.7) * (1 - y / (HZ * 0.6))})`);
      }
    }
    const CL = [[160, 120, 220, 8, 0.32], [60, 220, 160, 6, 0.24], [220, 330, 200, 6, 0.22], [120, 430, 240, 5, 0.18]];
    for (const [x, y, rx, ry, a] of CL) {
      ell(g, x, y, rx, ry, mode === 'day' ? `rgba(255,250,236,${a})` : `rgba(230,170,170,${a * 0.8})`);
    }
    const band = (base, amp, sc, seed, top, bot) => {
      g.beginPath();
      g.moveTo(-20, H);
      for (let x = -20; x <= W + 20; x += 4) g.lineTo(x, base - amp * fbm(x * sc + seed, seed * 0.37, 3) - 10 * Math.pow(vn(x / 14 + seed, seed), 2));
      g.lineTo(W + 20, H);
      g.closePath();
      g.fillStyle = vgrad(g, base - amp, HZ + 20, [[0, rgb(top)], [1, rgb(bot)]]);
      g.fill();
    };
    band(HZ - 10, 90, 1 / 260, 13, P.far, P.farLo);
    band(HZ + 6, 60, 1 / 120, 29, mix(P.far, P.lawnFar, 0.5), mix(P.farLo, P.lawnFar, 0.4));
    rect(g, 0, HZ + 10, W, H - HZ, rgb(P.lawnFar));
    texture(c, S, mode === 'day' ? 1 : 11, { mottle: 0.045, dark: 0.04, light: 0.03 });
    return c;
  }

  function porchMid(S, mode) {
    const P = PORCH_PAL[mode];
    const dusk = mode === 'dusk';
    const { c, g } = makeLayer(S);
    const HZ = PORCH.horizon;
    g.fillStyle = vgrad(g, HZ, 900, [[0, rgb(P.lawnFar)], [0.4, rgb(P.lawn)], [1, rgb(P.lawnNear)]]);
    g.fillRect(-20, HZ + 6, 300, H);
    rect(g, -20, HZ + 14, 300, 10, dusk ? 'rgb(90,92,112)' : 'rgb(196,192,182)');
    const hx = 40, hb = HZ + 14, hw = 150, hh = 70;
    rect(g, hx, hb - hh, hw, hh, dusk ? 'rgb(132,128,150)' : 'rgb(220,208,184)');
    poly(g, [[hx - 10, hb - hh + 2], [hx + hw / 2, hb - hh - 46], [hx + hw + 10, hb - hh + 2]]);
    g.fillStyle = dusk ? 'rgb(70,64,84)' : 'rgb(140,96,86)';
    g.fill();
    for (const wx of [hx + 18, hx + 104]) rect(g, wx, hb - hh + 18, 26, 26, dusk ? 'rgb(250,196,120)' : 'rgb(120,138,150)');
    rect(g, hx + 64, hb - 40, 22, 40, dusk ? 'rgb(84,60,60)' : 'rgb(130,82,66)');
    const fy = HZ + 70;
    rect(g, -20, fy, 300, 4, rgb(P.trim, 0.8));
    rect(g, -20, fy + 18, 300, 4, rgb(P.trim, 0.8));
    for (let x = -10; x < 280; x += 16) {
      poly(g, [[x, fy + 34], [x, fy - 4], [x + 4, fy - 10], [x + 8, fy - 4], [x + 8, fy + 34]]);
      g.fillStyle = rgb(P.trim, 0.92);
      g.fill();
      rect(g, x + 5, fy - 4, 3, 38, rgb(P.sidingShade, 0.6));
    }
    rect(g, 196, HZ - 130, 14, 220, dusk ? 'rgb(52,46,56)' : 'rgb(96,78,62)');
    crown(g, { x: 200, y: HZ - 190, rx: 110, ry: 90, n: 40, cr: 30, leaf: 9, seed: mode + 'mid', greens: P.greens, lx: 0.7, ly: -0.7 });
    texture(c, S, dusk ? 12 : 2, { mottle: 0.06, dark: 0.05, light: 0.035, tint: dusk ? [60, 70, 120, 0.2] : null });
    return c;
  }

  function siding(g, x0, x1, y0, y1, P, dusk) {
    g.fillStyle = vgrad(g, y0, y1, [[0, rgb(P.sidingShade)], [0.22, rgb(mix(P.sidingShade, P.siding, 0.6))], [1, rgb(P.siding)]]);
    g.fillRect(x0, y0, x1 - x0, y1 - y0);
    if (!dusk) {
      g.fillStyle = hgrad(g, x0, x1, [[0, 'rgba(90,86,110,0.16)'], [0.6, 'rgba(255,240,210,0)'], [1, 'rgba(255,240,210,0.16)']]);
      g.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
    for (let y = y0 + 22; y < y1; y += 22) {
      rect(g, x0, y - 2.2, x1 - x0, 2.2, 'rgba(60,56,70,0.16)');
      rect(g, x0, y, x1 - x0, 1.2, 'rgba(255,252,240,0.3)');
    }
  }

  function window2(g, x0, x1, y0, y1, P, dusk, curtain) {
    const w = x1 - x0, h = y1 - y0;
    rect(g, x0 - 34, y0, 30, h, rgb(P.shutter));
    rect(g, x1 + 4, y0, 30, h, rgb(shade(P.shutter, 0.86)));
    for (const sx of [x0 - 34, x1 + 4]) {
      for (let y = y0 + 10; y < y1 - 6; y += 12) rect(g, sx + 4, y, 22, 3, rgb(shade(P.shutter, 0.75), 0.6));
    }
    rect(g, x0 - 6, y0 - 8, w + 12, h + 16, rgb(P.trim));
    rect(g, x0 - 12, y1 + 4, w + 24, 10, rgb(P.trim));
    rect(g, x0 - 12, y1 + 14, w + 24, 4, 'rgba(50,40,50,0.25)');
    const glass = (gx, gy, gw, gh) => {
      if (dusk) {
        g.fillStyle = vgrad(g, gy, gy + gh, [[0, rgb(P.glassHi)], [1, rgb(P.glass)]]);
        g.fillRect(gx, gy, gw, gh);
        if (curtain) {
          g.fillStyle = 'rgba(160,70,50,0.45)';
          poly(g, [[gx, gy], [gx + gw * 0.3, gy], [gx + gw * 0.16, gy + gh], [gx, gy + gh]]);
          g.fill();
          poly(g, [[gx + gw, gy], [gx + gw * 0.7, gy], [gx + gw * 0.84, gy + gh], [gx + gw, gy + gh]]);
          g.fill();
        }
      } else {
        g.fillStyle = vgrad(g, gy, gy + gh, [[0, rgb(P.glassHi)], [0.45, rgb(P.glass)], [1, rgb(shade(P.glass, 0.7))]]);
        g.fillRect(gx, gy, gw, gh);
        g.save();
        g.beginPath();
        g.rect(gx, gy, gw, gh);
        g.clip();
        g.fillStyle = 'rgba(240,244,236,0.24)';
        poly(g, [[gx + gw * 0.35, gy], [gx + gw * 0.62, gy], [gx + gw * 0.1, gy + gh], [gx - gw * 0.17, gy + gh]]);
        g.fill();
        g.restore();
      }
    };
    const mid = y0 + h / 2;
    glass(x0, y0, w, h / 2 - 4);
    glass(x0, mid + 4, w, h / 2 - 4);
    rect(g, x0, mid - 4, w, 8, rgb(P.trim));
    rect(g, x0 + w / 2 - 2.5, y0, 5, h, rgb(P.trim));
    rect(g, x0, y0, w, 10, 'rgba(40,30,40,0.25)');
  }

  function porchNear(S, mode) {
    const P = PORCH_PAL[mode];
    const dusk = mode === 'dusk';
    const { c, g } = makeLayer(S);
    const X0 = 228;
    siding(g, X0, W + 20, -10, 190, P, dusk);
    window2(g, 640, 760, 26, 160, P, dusk, false);
    poly(g, [[X0 - 14, 186], [W + 20, 186], [W + 20, 232], [X0 - 30, 232]]);
    g.fillStyle = vgrad(g, 186, 232, [[0, rgb(shade(P.roof, 0.8))], [1, rgb(P.roof)]]);
    g.fill();
    const rr = LIB.rng(sd('shingle', mode));
    for (let row = 0, y = 192; y < 230; row++, y += 10) {
      rect(g, X0 - 30, y, W, 1.5, 'rgba(30,20,24,0.3)');
      for (let x = X0 - 30 + (row % 2) * 14; x < W + 20; x += 28) {
        rect(g, x, y, 1.4, 10, 'rgba(30,20,24,0.25)');
        if (rr() < 0.3) rect(g, x + 2, y + 2, 24, 7, `rgba(${dusk ? '150,140,170' : '200,170,150'},0.12)`);
      }
    }
    rect(g, X0 - 34, 230, W, 30, rgb(P.trim));
    rect(g, X0 - 34, 230, W, 5, rgb(shade(P.trim, 0.9)));
    rect(g, X0 - 34, 258, W, 3, 'rgba(40,34,44,0.3)');
    siding(g, X0 + 4, W + 20, 261, PORCH.edge - 18, P, dusk);
    g.fillStyle = vgrad(g, 261, 330, [[0, 'rgba(30,24,40,0.36)'], [1, 'rgba(30,24,40,0)']]);
    g.fillRect(X0, 261, W, 70);
    window2(g, PORCH.winL[0], PORCH.winL[1], PORCH.winL[2], PORCH.winL[3], P, dusk, true);
    window2(g, PORCH.winR[0], PORCH.winR[1], PORCH.winR[2], PORCH.winR[3], P, dusk, true);
    const [d0, d1, dt, db] = PORCH.door;
    rect(g, d0 - 14, dt - 16, d1 - d0 + 28, db - dt + 16, rgb(P.trim));
    rect(g, d0 - 20, dt - 24, d1 - d0 + 40, 10, rgb(P.trim));
    g.fillStyle = hgrad(g, d0, d1, [[0, rgb(shade(P.door, 0.8))], [1, rgb(P.door)]]);
    g.fillRect(d0, dt, d1 - d0, db - dt);
    for (const [px, py, pw, ph] of [[d0 + 16, dt + 16, 40, 100], [d1 - 56, dt + 16, 40, 100], [d0 + 16, dt + 140, 40, 110], [d1 - 56, dt + 140, 40, 110]]) {
      rect(g, px, py, pw, ph, rgb(shade(P.door, 0.82)));
      rect(g, px + 3, py + 3, pw - 6, ph - 6, rgb(shade(P.door, 0.95)));
    }
    rect(g, d0 + 20, dt + 20, d1 - d0 - 40, 34, dusk ? 'rgb(255,214,150)' : 'rgb(110,128,140)');
    ell(g, d1 - 18, dt + 140, 5, 5, 'rgb(222,186,96)');
    g.strokeStyle = rgb(P.trim);
    g.lineWidth = 8;
    g.strokeRect(d0 + 4, dt + 4, d1 - d0 - 8, db - dt - 8);
    rect(g, d0 + 4, dt + 150, d1 - d0 - 8, 8, rgb(P.trim));
    rect(g, d0 + 4, db - 70, d1 - d0 - 8, 62, rgb(shade(P.trim, 0.94)));
    rect(g, d0 + 8, dt + 8, d1 - d0 - 16, 142, 'rgba(40,44,60,0.18)');
    rect(g, d0 + 8, dt + 158, d1 - d0 - 16, db - dt - 236, 'rgba(40,44,60,0.18)');
    g.save();
    g.font = 'bold 22px Georgia, "Times New Roman", serif';
    g.textAlign = 'center';
    g.fillStyle = dusk ? 'rgb(70,64,80)' : 'rgb(80,70,60)';
    g.fillText('112', (d0 + d1) / 2, dt - 30);
    g.restore();
    const [lx, ly] = PORCH.lamp;
    rect(g, lx - 1.5, 261, 3, ly - 290, 'rgb(110,90,60)');
    rect(g, lx - 10, 261, 20, 5, 'rgb(120,92,50)');
    poly(g, [[lx - 14, ly - 22], [lx + 14, ly - 22], [lx + 18, ly + 14], [lx - 18, ly + 14]]);
    g.fillStyle = dusk ? 'rgb(255,236,186)' : 'rgb(226,224,210)';
    g.fill();
    rect(g, lx - 1.5, ly - 22, 3, 36, 'rgba(120,92,50,0.8)');
    poly(g, [[lx - 18, ly - 22], [lx, ly - 34], [lx + 18, ly - 22]]);
    g.fillStyle = 'rgb(120,92,50)';
    g.fill();
    rect(g, lx - 20, ly + 14, 40, 6, 'rgb(120,92,50)');
    rect(g, 690, 580, 46, 30, dusk ? 'rgb(80,80,90)' : 'rgb(70,70,72)');
    rect(g, 690, 580, 46, 5, 'rgba(255,255,255,0.18)');
    const fy0 = PORCH.edge - 18, fy1 = PORCH.edge;
    g.fillStyle = vgrad(g, fy0, fy1, [[0, rgb(shade(P.floor, 0.78))], [1, rgb(P.floor)]]);
    g.fillRect(X0, fy0, W, fy1 - fy0);
    for (let x = X0 - 400; x < W + 400; x += 34) {
      const xb = 540 + (x - 540) * 1.0, xt = 540 + (x - 540) * 0.94;
      g.strokeStyle = 'rgba(50,50,64,0.25)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(xt, fy0);
      g.lineTo(xb, fy1);
      g.stroke();
    }
    rect(g, X0, fy0, W, 3, 'rgba(40,34,44,0.3)');
    rect(g, X0 - 6, fy1, W, 26, rgb(P.trim));
    rect(g, X0 - 6, fy1, W, 2, 'rgba(255,255,255,0.6)');
    rect(g, X0 - 6, fy1 + 24, W, 3, 'rgba(40,34,44,0.3)');
    const [s0, s1] = PORCH.steps;
    const lattice = (x0, x1) => {
      rect(g, x0, fy1 + 26, x1 - x0, PORCH.ground - fy1 - 22, 'rgb(46,40,44)');
      g.save();
      g.beginPath();
      g.rect(x0, fy1 + 26, x1 - x0, PORCH.ground - fy1 - 22);
      g.clip();
      g.strokeStyle = rgb(shade(P.trim, 0.88));
      g.lineWidth = 5;
      for (let k = -200; k < x1 - x0 + 200; k += 24) {
        g.beginPath();
        g.moveTo(x0 + k, fy1 + 26);
        g.lineTo(x0 + k + 100, PORCH.ground + 4);
        g.stroke();
        g.beginPath();
        g.moveTo(x0 + k + 100, fy1 + 26);
        g.lineTo(x0 + k, PORCH.ground + 4);
        g.stroke();
      }
      g.restore();
    };
    lattice(X0, s0);
    lattice(s1, W + 20);
    const treads = [[fy1, PORCH.tread1 + 4], [PORCH.tread1 + 4, PORCH.tread2 + 4], [PORCH.tread2 + 4, PORCH.ground]];
    treads.forEach(([ya, yb], i) => {
      if (i > 0) {
        g.fillStyle = vgrad(g, ya, ya + 10, [[0, rgb(shade(P.floor, 0.86))], [1, rgb(P.floor)]]);
        g.fillRect(s0, ya, s1 - s0, 10);
        rect(g, s0, ya + 10, s1 - s0, 2, 'rgba(255,255,255,0.35)');
      }
      const top = i > 0 ? ya + 12 : ya + 26;
      g.fillStyle = vgrad(g, top, yb, [[0, rgb(shade(P.trim, 0.82))], [1, rgb(shade(P.trim, 0.95))]]);
      g.fillRect(s0, top, s1 - s0, yb - top);
      rect(g, s0, top, s1 - s0, 4, 'rgba(40,34,44,0.22)');
    });
    rect(g, s0 - 12, fy1, 12, PORCH.ground - fy1, rgb(shade(P.trim, 0.86)));
    rect(g, s1, fy1, 12, PORCH.ground - fy1, rgb(P.trim));
    for (const [px, lit] of [[X0 - 2, 0], [W - 34, 1]]) {
      g.fillStyle = hgrad(g, px, px + 30, lit ? [[0, rgb(shade(P.trim, 0.86))], [1, rgb(P.trim)]] : [[0, rgb(shade(P.trim, 0.75))], [1, rgb(shade(P.trim, 0.92))]]);
      g.fillRect(px, 258, 30, fy1 - 258);
      rect(g, px - 4, 258, 38, 14, rgb(P.trim));
      rect(g, px - 4, fy1 - 22, 38, 22, rgb(P.trim));
    }
    g.fillStyle = vgrad(g, PORCH.ground - 20, H, [[0, rgb(P.lawn)], [1, rgb(P.lawnNear)]]);
    g.fillRect(-20, PORCH.ground - 6, W + 40, H);
    poly(g, [[s0 + 6, PORCH.ground - 2], [s1 - 6, PORCH.ground - 2], [s1 + 110, H + 10], [s0 - 110, H + 10]]);
    g.fillStyle = vgrad(g, PORCH.ground, H, dusk ? [[0, 'rgb(120,124,140)'], [1, 'rgb(98,102,120)']] : [[0, 'rgb(214,206,190)'], [1, 'rgb(196,188,172)']]);
    g.fill();
    for (const y of [930, 990, 1050]) {
      const k = (y - PORCH.ground) / (H - PORCH.ground);
      rect(g, s0 + 6 - 110 * k, y, s1 - s0 - 12 + 220 * k, 2, 'rgba(60,54,60,0.25)');
    }
    const rg = LIB.rng(sd('grass', mode));
    for (let i = 0; i < 360; i++) {
      const x = rg.range(-20, W + 20), y = rg.range(PORCH.ground, H);
      const k = (y - PORCH.ground) / (H - PORCH.ground);
      if (x > s0 - 110 * k - 6 && x < s1 + 110 * k + 6) continue;
      g.fillStyle = rg() < 0.5 ? rgb(shade(P.lawnNear, 0.75), 0.5) : rgb(mix(P.lawn, [220, 230, 150], dusk ? 0.1 : 0.35), 0.5);
      g.fillRect(x, y, 6 + 14 * k, 1.5 + 1.5 * k);
    }
    for (const [cx, cy, rx, ry, seed] of [[300, 862, 86, 46, 1], [150, 880, 70, 40, 2], [770, 866, 80, 44, 3], [930, 860, 100, 50, 4], [1060, 870, 70, 44, 5]]) {
      ell(g, cx - 6, cy + ry * 0.7, rx, ry * 0.35, 'rgba(30,26,34,0.3)');
      crown(g, { x: cx, y: cy, rx, ry, n: 18, cr: 24, leaf: 8, seed: mode + 'shrub' + seed, greens: P.greens, lx: 0.7, ly: -0.7 });
    }
    const rf = LIB.rng(sd('flowers', mode));
    for (let i = 0; i < 36; i++) {
      const sh = [[300, 862, 70, 36], [770, 866, 66, 34], [930, 860, 84, 40]][i % 3];
      const a = rf() * TAU, d = Math.sqrt(rf());
      ell(g, sh[0] + Math.cos(a) * sh[2] * d, sh[1] + Math.sin(a) * sh[3] * d, 3.4, 3.4, dusk ? 'rgb(170,110,130)' : ['rgb(226,92,96)', 'rgb(246,190,200)', 'rgb(250,236,220)'][i % 3]);
    }
    g.beginPath();
    g.moveTo(-10, PORCH.ground + 10);
    g.bezierCurveTo(8, 600, 4, 300, 14, -20);
    g.lineTo(70, -20);
    g.bezierCurveTo(60, 300, 62, 600, 92, PORCH.ground + 10);
    g.closePath();
    g.fillStyle = hgrad(g, -10, 92, dusk ? [[0, 'rgb(36,32,40)'], [0.8, 'rgb(64,58,70)'], [1, 'rgb(52,46,58)']] : [[0, 'rgb(62,50,46)'], [0.7, 'rgb(98,80,64)'], [0.9, 'rgb(150,120,92)'], [1, 'rgb(110,90,72)']]);
    g.fill();
    crown(g, { x: 60, y: 30, rx: 190, ry: 110, n: 60, cr: 34, leaf: 11, seed: mode + 'front', greens: P.greens, lx: 0.7, ly: -0.7 });
    const tex = { mottle: 0.07, dark: 0.06, light: 0.04 };
    if (dusk) {
      Object.assign(tex, { tint: [40, 48, 96, 0.3], glow: { x: PORCH.lamp[0], y: PORCH.lamp[1] + 120, r: 380, amount: 0.4, color: [255, 196, 120] } });
    } else {
      tex.glow = { x: PORCH.sun[0], y: PORCH.sun[1], r: 900, amount: 0.2 };
    }
    texture(c, S, dusk ? 13 : 3, tex);
    return c;
  }

  function porchLight(S, mode) {
    if (mode === 'day') {
      const beams = LOOK.beamField({
        beams: [[380, 70, 0.5], [560, 110, 0.7], [760, 60, 0.45], [900, 90, 0.5]],
        dir: [0.906, 0.423],
        noise: { base: 0.8, amp: 0.4, scale: 7, offset: 5, row: 3.5 },
        fall: (X, Y) => sstep(-80, 200, Y) * (1 - sstep(700, 900, Y)) * 0.55,
      });
      const glow = LOOK.glowField({ x: PORCH.sun[0], y: PORCH.sun[1], r: 560, amount: 0.6 });
      return LOOK.lightLayer(S, { fields: [beams, glow] });
    }
    const lamp = LOOK.glowField({ x: PORCH.lamp[0], y: PORCH.lamp[1], r: 120, amount: 0.85 });
    const spill = LOOK.glowField({ x: PORCH.lamp[0], y: 620, r: 340, amount: 0.24 });
    const wl = LOOK.glowField({ x: 371, y: 490, r: 120, amount: 0.3 });
    const wr = LOOK.glowField({ x: 869, y: 490, r: 120, amount: 0.3 });
    const wins = (X, Y) => wl(X, Y) + wr(X, Y);
    return LOOK.lightLayer(S, { fields: [lamp, spill, wins], color: [255, 206, 140] });
  }

  const BED = {
    mattress: 676,
    head: [300, 0],
    lamp: [1018, 540],
    window: [64, 304, 168, 446],
    moon: [214, 236],
    floor: 724,
  };
  const DZ = 1.4;
  const DO = [100, 300];
  const dz = (p) => [(p[0] - DO[0]) * DZ, (p[1] - DO[1]) * DZ];
  const D0 = {
    feet: [330, 906],
    h: 320,
    top: 800,
    edge: 388,
    lamp: [792, 664],
    clock: [520, 420, 50],
    cal: [650, 336, 112, 142],
    window: [30, 226, 210, 470],
    floor: 790,
  };
  const DESK = {
    feet: dz(D0.feet), h: D0.h * DZ, top: dz([0, D0.top])[1], edge: dz([D0.edge, 0])[0],
    lamp: dz(D0.lamp), clock: [...dz(D0.clock), D0.clock[2] * DZ],
    cal: [...dz(D0.cal), D0.cal[2] * DZ, D0.cal[3] * DZ], window: D0.window.map((v, i) => (i < 2 ? (v - DO[0]) * DZ : (v - DO[1]) * DZ)),
    floor: dz([0, D0.floor])[1], zoom: DZ, mug: dz([706, D0.top - 56]),
  };

  const NIGHT = {
    wall: [70, 82, 122], wallLo: [58, 66, 102], ceil: [44, 50, 80], trim: [120, 128, 160],
    floor: [86, 66, 64], floorLo: [64, 50, 54], sky: [22, 30, 66], skyLo: [44, 56, 104],
    curtain: [92, 106, 150], quilt: [[168, 74, 72], [70, 96, 140], [220, 196, 150], [96, 128, 104]],
    wood: [120, 84, 62], woodLo: [84, 58, 46], sheet: [196, 204, 226],
  };
  const LAMP_COL = [255, 206, 130];

  function nightWindow(g, x0, x1, y0, y1, moon) {
    const w = x1 - x0, h = y1 - y0;
    rect(g, x0 - 12, y0 - 12, w + 24, h + 24, rgb(NIGHT.trim));
    g.fillStyle = vgrad(g, y0, y1, [[0, rgb(NIGHT.sky)], [1, rgb(NIGHT.skyLo)]]);
    g.fillRect(x0, y0, w, h);
    g.save();
    g.beginPath();
    g.rect(x0, y0, w, h);
    g.clip();
    const rs = LIB.rng(sd('nightstars', x0));
    for (let i = 0; i < 40; i++) ell(g, rs.range(x0, x1), rs.range(y0, y1 - 40), rs.range(0.7, 1.6), rs.range(0.7, 1.6), `rgba(240,240,255,${rs.range(0.3, 0.9)})`);
    const mg = g.createRadialGradient(moon[0], moon[1], 0, moon[0], moon[1], 120);
    mg.addColorStop(0, 'rgba(210,224,255,0.45)');
    mg.addColorStop(1, 'rgba(210,224,255,0)');
    g.fillStyle = mg;
    g.fillRect(x0, y0, w, h);
    ell(g, moon[0], moon[1], 30, 30, 'rgb(240,240,224)');
    ell(g, moon[0] + 13, moon[1] - 8, 27, 27, rgb(mix(NIGHT.sky, NIGHT.skyLo, 0.3)));
    g.fillStyle = 'rgb(26,30,52)';
    poly(g, [[x0, y1], [x0, y1 - 50], [x0 + w * 0.3, y1 - 86], [x0 + w * 0.6, y1 - 50], [x0 + w * 0.6, y1 - 30], [x1, y1 - 40], [x1, y1]]);
    g.fill();
    ell(g, x0 + w * 0.82, y1 - 60, 44, 40, 'rgb(28,34,56)');
    rect(g, x0 + w * 0.2, y1 - 60, 14, 12, 'rgb(250,206,130)');
    g.restore();
    rect(g, x0, y0 + h / 2 - 4, w, 8, rgb(NIGHT.trim));
    rect(g, x0 + w / 2 - 3, y0, 6, h, rgb(NIGHT.trim));
    rect(g, x0 - 22, y1 + 10, w + 44, 12, rgb(shade(NIGHT.trim, 1.08)));
    for (const [cx, dir] of [[x0 - 18, -1], [x1 + 18, 1]]) {
      const cw = 46;
      poly(g, [[cx - cw / 2, y0 - 30], [cx + cw / 2, y0 - 30], [cx + cw / 2 + dir * 8, y1 + 60], [cx - cw / 2 + dir * 8, y1 + 60]]);
      g.fillStyle = hgrad(g, cx - cw / 2, cx + cw / 2, [[0, rgb(shade(NIGHT.curtain, 0.8))], [0.5, rgb(NIGHT.curtain)], [1, rgb(shade(NIGHT.curtain, 0.85))]]);
      g.fill();
      for (const k of [-0.25, 0.1, 0.32]) rect(g, cx + k * cw, y0 - 30, 2.2, h + 90, 'rgba(30,30,60,0.25)');
    }
    rect(g, x0 - 50, y0 - 36, w + 100, 8, 'rgb(150,126,90)');
  }

  function bedroomWall(g, y0, y1) {
    g.fillStyle = vgrad(g, y0, y1, [[0, rgb(NIGHT.wall)], [1, rgb(NIGHT.wallLo)]]);
    g.fillRect(0, y0, W, y1 - y0);
    for (let x = 0; x < W; x += 36) rect(g, x, y0, 12, y1 - y0, 'rgba(255,255,255,0.03)');
    for (let x = 18; x < W; x += 36) rect(g, x, y0, 1.5, y1 - y0, 'rgba(20,24,50,0.08)');
  }

  function bedroomFloor(g, y0) {
    g.fillStyle = vgrad(g, y0, H, [[0, rgb(NIGHT.floorLo)], [1, rgb(NIGHT.floor)]]);
    g.fillRect(0, y0, W, H - y0);
    const vp = [540, y0 - 420];
    for (let x = -1200; x < W + 1200; x += 70) {
      g.strokeStyle = 'rgba(30,20,24,0.3)';
      g.lineWidth = 1.4;
      g.beginPath();
      const k = (y0 - vp[1]) / (H - vp[1]);
      g.moveTo(vp[0] + (x - vp[0]) * k, y0);
      g.lineTo(x, H);
      g.stroke();
    }
    for (const y of [y0 + 60, y0 + 150, y0 + 270]) rect(g, 0, y, W, 1.2, 'rgba(30,20,24,0.18)');
  }

  function skirting(g, y) {
    rect(g, 0, y - 22, W, 22, rgb(NIGHT.trim));
    rect(g, 0, y - 22, W, 3, 'rgba(255,255,255,0.16)');
    rect(g, 0, y, W, 4, 'rgba(10,10,20,0.35)');
  }

  function poster(g, x, y, w, h, kind) {
    rect(g, x + 4, y + 5, w, h, 'rgba(10,10,30,0.3)');
    rect(g, x, y, w, h, 'rgb(220,214,196)');
    if (kind === 'shuttle') {
      g.fillStyle = vgrad(g, y + 8, y + h - 8, [[0, 'rgb(30,36,70)'], [1, 'rgb(70,76,120)']]);
      g.fillRect(x + 8, y + 8, w - 16, h - 40);
      const cx = x + w / 2, by = y + h - 50;
      ell(g, cx, by, w * 0.32, 14, 'rgb(236,224,200)');
      ell(g, cx - 10, by - 6, w * 0.2, 10, 'rgb(250,240,220)');
      rect(g, cx - 7, y + 40, 14, by - y - 50, 'rgb(220,124,60)');
      rect(g, cx - 14, y + 56, 6, by - y - 66, 'rgb(240,240,236)');
      rect(g, cx + 8, y + 56, 6, by - y - 66, 'rgb(240,240,236)');
      poly(g, [[cx - 7, y + 40], [cx, y + 26], [cx + 7, y + 40]]);
      g.fillStyle = 'rgb(220,124,60)';
      g.fill();
      g.font = 'bold 14px Helvetica, Arial, sans-serif';
      g.textAlign = 'center';
      g.fillStyle = 'rgb(40,46,80)';
      g.fillText('NASA', cx, y + h - 14);
    } else if (kind === 'band') {
      g.fillStyle = vgrad(g, y + 8, y + h - 8, [[0, 'rgb(170,60,70)'], [1, 'rgb(110,40,60)']]);
      g.fillRect(x + 8, y + 8, w - 16, h - 16);
      ell(g, x + w / 2, y + h * 0.42, w * 0.26, w * 0.26, 'rgb(240,200,110)');
      g.font = 'bold 15px Helvetica, Arial, sans-serif';
      g.textAlign = 'center';
      g.fillStyle = 'rgb(250,236,210)';
      g.fillText('ROCK ON', x + w / 2, y + h - 22);
    }
  }

  function pennant(g, x, y, w, h, text) {
    poly(g, [[x, y], [x + w, y + h / 2], [x, y + h]]);
    g.fillStyle = 'rgb(176,58,52)';
    g.fill();
    rect(g, x - 4, y - 2, 8, h + 4, 'rgb(230,220,200)');
    g.save();
    g.translate(x + 10, y + h / 2 + 5);
    g.rotate(0.02);
    g.font = 'bold 15px Helvetica, Arial, sans-serif';
    g.fillStyle = 'rgb(246,232,206)';
    g.fillText(text, 0, 0);
    g.restore();
  }

  function quiltFace(g, x0, x1, y0, y1, seed) {
    const rq = LIB.rng(sd('quilt', seed));
    const s = 46;
    g.save();
    g.beginPath();
    g.rect(x0, y0, x1 - x0, y1 - y0);
    g.clip();
    for (let y = y0; y < y1; y += s) {
      for (let x = x0; x < x1; x += s) {
        rect(g, x, y, s, s, rgb(NIGHT.quilt[(rq() * 4) | 0]));
        rect(g, x, y, s, 1.6, 'rgba(250,240,220,0.35)');
        rect(g, x, y, 1.6, s, 'rgba(250,240,220,0.35)');
      }
    }
    g.restore();
  }

  function bedroomBedNear(S) {
    const { c, g } = makeLayer(S);
    rect(g, 0, 0, W, 86, rgb(NIGHT.ceil));
    bedroomWall(g, 86, BED.floor);
    rect(g, 0, 80, W, 10, rgb(NIGHT.trim));
    rect(g, 0, 90, W, 4, 'rgba(10,10,30,0.3)');
    nightWindow(g, BED.window[0], BED.window[1], BED.window[2], BED.window[3], BED.moon);
    pennant(g, 376, 120, 150, 50, 'TIGERS');
    poster(g, 800, 196, 130, 190, 'shuttle');
    bedroomFloor(g, BED.floor);
    skirting(g, BED.floor);
    ell(g, 560, 960, 330, 70, 'rgba(10,8,20,0.3)');
    ell(g, 560, 952, 320, 64, 'rgb(120,76,72)');
    ell(g, 560, 952, 286, 52, 'rgb(150,100,82)');
    ell(g, 560, 952, 250, 42, 'rgb(128,84,74)');
    const dx = 968;
    rect(g, dx, 640, W - dx + 20, 20, rgb(NIGHT.wood));
    rect(g, dx, 660, W - dx + 20, 160, rgb(NIGHT.woodLo));
    rect(g, dx + 20, 680, W - dx, 4, 'rgba(0,0,0,0.25)');
    rect(g, dx + 20, 740, W - dx, 4, 'rgba(0,0,0,0.25)');
    ell(g, dx + 60, 712, 4, 4, 'rgb(200,170,100)');
    ell(g, dx + 60, 772, 4, 4, 'rgb(200,170,100)');
    rect(g, 1030, 628, 46, 12, 'rgb(46,58,70)');
    g.strokeStyle = 'rgb(56,70,84)';
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(1052, 630);
    g.lineTo(1064, 560);
    g.lineTo(1030, 520);
    g.stroke();
    poly(g, [[1000, 500], [1046, 512], [1040, 566], [994, 552]]);
    g.fillStyle = 'rgb(44,80,70)';
    g.fill();
    poly(g, [[994, 552], [1040, 566], [1036, 574], [990, 560]]);
    g.fillStyle = 'rgb(255,236,180)';
    g.fill();
    for (const [bx, bw, bh, col] of [[976, 18, 64, [150, 60, 54]], [996, 14, 56, [70, 100, 140]], [1012, 16, 60, [200, 170, 90]]]) rect(g, bx, 640 - bh, bw, bh, rgb(col));
    const bx0 = 150, bx1 = 940, top = 662;
    ell(g, 540, 812, 420, 22, 'rgba(10,8,20,0.45)');
    g.fillStyle = hgrad(g, bx0 - 10, bx0 + 50, [[0, rgb(NIGHT.woodLo)], [1, rgb(NIGHT.wood)]]);
    rrect(g, bx0 - 10, 470, 56, 350, 18);
    g.fill();
    rect(g, bx0 - 18, 456, 72, 22, rgb(shade(NIGHT.wood, 1.1)));
    rect(g, bx0 + 40, top + 22, bx1 - bx0 - 40, 26, rgb(NIGHT.sheet));
    quiltFace(g, bx0 + 40, bx1, top + 20, 800, 'side');
    g.fillStyle = vgrad(g, top + 20, 800, [[0, 'rgba(20,16,40,0)'], [1, 'rgba(20,16,40,0.4)']]);
    g.fillRect(bx0 + 40, top + 20, bx1 - bx0 - 40, 800 - top - 20);
    poly(g, [[bx0 + 40, top + 22], [bx0 + 52, top - 8], [bx1 - 6, top - 8], [bx1, top + 22]]);
    g.fillStyle = vgrad(g, top - 8, top + 22, [[0, 'rgb(150,140,170)'], [1, 'rgb(176,160,180)']]);
    g.fill();
    rect(g, bx0 + 40, top + 18, bx1 - bx0 - 40, 6, 'rgba(250,240,220,0.6)');
    for (let x = bx0 + 60; x < bx1; x += 46) rect(g, x, 796, 30, 6, 'rgba(250,240,220,0.18)');
    rrect(g, 780, top - 30, 150, 34, 10);
    g.fillStyle = 'rgb(92,112,150)';
    g.fill();
    rect(g, 784, top - 14, 142, 3, 'rgba(20,20,50,0.3)');
    g.fillStyle = hgrad(g, bx1 - 4, bx1 + 34, [[0, rgb(NIGHT.wood)], [1, rgb(NIGHT.woodLo)]]);
    rrect(g, bx1 - 4, 590, 38, 232, 12);
    g.fill();
    rect(g, bx1 - 10, 582, 50, 16, rgb(shade(NIGHT.wood, 1.12)));
    ell(g, 806, 876, 54, 10, 'rgba(10,8,20,0.4)');
    rrect(g, 760, 790, 92, 86, 26);
    g.fillStyle = 'rgb(176,58,48)';
    g.fill();
    rrect(g, 776, 826, 60, 40, 12);
    g.fillStyle = 'rgb(150,46,40)';
    g.fill();
    texture(c, S, 21, {
      mottle: 0.07, dark: 0.06, light: 0.04,
      glow: { x: BED.lamp[0] - 60, y: BED.lamp[1] + 80, r: 520, amount: 0.34, color: LAMP_COL },
    });
    return c;
  }

  function pillow(S) {
    const { c, g } = makeLayer(S);
    ell(g, 304, 660, 104, 30, rgb(NIGHT.sheet));
    ell(g, 304, 668, 98, 20, 'rgb(170,178,206)');
    ell(g, 286, 650, 70, 14, 'rgba(255,255,255,0.35)');
    texture(c, S, 23, { mottle: 0.05, dark: 0.04, light: 0.03 });
    return c;
  }

  function bedLight(S) {
    const lamp = LOOK.glowField({ x: BED.lamp[0], y: BED.lamp[1] + 40, r: 220, amount: 0.55 });
    const pool = LOOK.glowField({ x: 760, y: 700, r: 420, amount: 0.24 });
    const cone = LOOK.beamField({
      beams: [[0, 130, 0.5]], dir: [0.5, 0.866],
      noise: { base: 0.85, amp: 0.3, scale: 9, offset: 2, row: 4 },
      fall: (X, Y) => sstep(500, 560, Y) * (1 - sstep(560, 1000, Y)) * sstep(300, 1000, X),
    });
    const moonBeam = LOOK.beamField({
      beams: [[180, 70, 0.6]], dir: [0.87, -0.5],
      noise: { base: 0.8, amp: 0.4, scale: 8, offset: 7, row: 2 },
      fall: (X, Y) => sstep(BED.window[2], BED.window[2] + 120, Y) * (1 - sstep(560, 900, Y)),
    });
    return {
      warm: LOOK.lightLayer(S, { fields: [lamp, pool, (X, Y) => cone(X - 700, Y)], color: LAMP_COL }),
      cool: LOOK.lightLayer(S, { fields: [moonBeam], color: [170, 196, 255] }),
    };
  }

  function bedroomDeskNear(S) {
    const { c, g } = makeLayer(S);
    g.scale(DZ, DZ);
    g.translate(-DO[0], -DO[1]);
    const DESK = D0;
    bedroomWall(g, 0, DESK.floor);
    nightWindow(g, DESK.window[0], DESK.window[1], DESK.window[2], DESK.window[3], [176, 286]);
    poster(g, 262, 236, 120, 170, 'band');
    rect(g, 338, 474, 150, 104, 'rgba(10,10,30,0.3)');
    rect(g, 334, 470, 150, 104, 'rgb(150,112,76)');
    rect(g, 340, 476, 138, 92, 'rgb(186,146,96)');
    for (const [px, py, pw, ph, rot, col] of [[350, 484, 40, 52, -0.06, [240, 236, 222]], [398, 482, 34, 44, 0.05, [236, 226, 170]], [440, 490, 30, 40, -0.04, [210, 226, 236]], [404, 530, 46, 30, 0.03, [240, 236, 222]]]) {
      g.save();
      g.translate(px + pw / 2, py + ph / 2);
      g.rotate(rot);
      rect(g, -pw / 2, -ph / 2, pw, ph, rgb(col));
      for (let i = 0; i < 4; i++) rect(g, -pw / 2 + 4, -ph / 2 + 8 + i * 8, pw - 10, 1.2, 'rgba(60,60,80,0.4)');
      ell(g, 0, -ph / 2 + 3, 2.6, 2.6, 'rgb(200,60,50)');
      g.restore();
    }
    pennant(g, 980, 150, 120, 44, 'TIGERS');
    rect(g, 940, 520, 140, 10, rgb(NIGHT.wood));
    for (const [bx, bw, bh, col] of [[950, 16, 60, [150, 60, 54]], [968, 14, 52, [70, 100, 140]], [984, 18, 64, [200, 170, 90]], [1004, 14, 48, [96, 128, 104]]]) rect(g, bx, 520 - bh, bw, bh, rgb(col));
    rect(g, 1040, 480, 8, 40, 'rgb(200,170,90)');
    ell(g, 1044, 474, 14, 10, 'rgb(220,190,100)');
    bedroomFloor(g, DESK.floor);
    skirting(g, DESK.floor);
    ell(g, 70, 900, 120, 14, 'rgba(10,8,20,0.45)');
    quiltFace(g, -10, 150, 700, 892, 'corner');
    poly(g, [[-10, 702], [-10, 676], [140, 676], [150, 702]]);
    g.fillStyle = 'rgb(150,140,170)';
    g.fill();
    g.fillStyle = vgrad(g, 700, 892, [[0, 'rgba(20,16,40,0.15)'], [1, 'rgba(20,16,40,0.5)']]);
    g.fillRect(-10, 700, 160, 192);
    rect(g, 150, 640, 30, 264, rgb(NIGHT.woodLo));
    rect(g, 144, 630, 42, 16, rgb(NIGHT.wood));
    const [fx, fy] = DESK.feet;
    const seat = fy - 0.22 * DESK.h;
    rect(g, fx - 92, seat - 196, 16, 210, rgb(NIGHT.woodLo));
    rect(g, fx - 98, seat - 200, 28, 14, rgb(NIGHT.wood));
    rect(g, fx - 92, seat - 150, 14, 80, rgb(NIGHT.wood));
    rect(g, fx - 96, seat - 4, 130, 14, rgb(NIGHT.wood));
    rect(g, fx - 90, seat + 10, 10, fy - seat - 6, rgb(NIGHT.woodLo));
    rect(g, fx + 18, seat + 10, 10, fy - seat - 6, rgb(NIGHT.woodLo));
    ell(g, fx - 30, fy + 4, 90, 10, 'rgba(10,8,20,0.4)');
    const top = DESK.top, e = DESK.edge;
    ell(g, 700, fy + 2, 300, 16, 'rgba(10,8,20,0.45)');
    rect(g, 540, top + 12, 16, fy - top - 10, rgb(shade(NIGHT.woodLo, 0.8)));
    g.fillStyle = hgrad(g, 760, 960, [[0, rgb(NIGHT.woodLo)], [1, rgb(shade(NIGHT.wood, 0.95))]]);
    g.fillRect(760, top + 12, 200, fy - top - 10);
    for (const y of [top + 30, top + 66]) {
      rect(g, 772, y, 176, 30, rgb(shade(NIGHT.wood, 0.9)));
      rect(g, 772, y + 28, 176, 3, 'rgba(0,0,0,0.25)');
      ell(g, 860, y + 14, 12, 3.5, 'rgb(200,170,100)');
    }
    poly(g, [[e, top + 2], [e + 18, top - 18], [970, top - 18], [960, top + 2]]);
    g.fillStyle = vgrad(g, top - 18, top + 2, [[0, rgb(shade(NIGHT.wood, 0.85))], [1, rgb(shade(NIGHT.wood, 1.08))]]);
    g.fill();
    for (const [bx, by, bw, bh, col] of [[880, top - 16, 80, 14, [150, 60, 54]], [884, top - 28, 72, 12, [70, 100, 140]], [878, top - 40, 78, 12, [200, 170, 90]], [888, top - 52, 64, 12, [96, 128, 104]]]) {
      rect(g, bx, by, bw, bh, rgb(col));
      rect(g, bx, by, bw, 2, 'rgba(255,255,255,0.2)');
      rect(g, bx + bw - 6, by + 2, 4, bh - 4, 'rgba(250,240,220,0.5)');
    }
    rrect(g, 690, top - 50, 32, 40, 5);
    g.fillStyle = 'rgb(200,196,214)';
    g.fill();
    g.strokeStyle = 'rgb(200,196,214)';
    g.lineWidth = 5;
    g.beginPath();
    g.arc(726, top - 30, 9, -1.2, 1.2);
    g.stroke();
    rect(g, 630, top - 44, 24, 34, 'rgb(70,110,96)');
    for (const [px, py, ang, col] of [[634, top - 64, -0.2, [230, 190, 80]], [642, top - 62, 0.1, [200, 80, 70]], [648, top - 60, 0.25, [230, 190, 80]]]) {
      g.save();
      g.translate(px, py);
      g.rotate(ang);
      rect(g, -2, 0, 4, 26, rgb(col));
      g.restore();
    }
    poly(g, [[470, top - 6], [600, top - 10], [612, top - 2], [478, top + 1]]);
    g.fillStyle = 'rgb(232,228,214)';
    g.fill();
    rect(g, 820, top - 24, 70, 14, 'rgb(46,58,70)');
    g.strokeStyle = 'rgb(56,70,84)';
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(855, top - 22);
    g.lineTo(880, 560);
    g.lineTo(820, 620);
    g.stroke();
    poly(g, [[770, 610], [834, 602], [850, 660], [760, 676]]);
    g.fillStyle = 'rgb(54,96,82)';
    g.fill();
    poly(g, [[760, 676], [850, 660], [846, 668], [764, 682]]);
    g.fillStyle = 'rgb(255,236,180)';
    g.fill();
    texture(c, S, 31, {
      mottle: 0.07, dark: 0.06, light: 0.04,
      glow: { x: dz(D0.lamp)[0], y: dz(D0.lamp)[1] + 40, r: 640, amount: 0.38, color: LAMP_COL },
    });
    return c;
  }

  function bedroomDeskFront(S) {
    const { c, g } = makeLayer(S);
    g.scale(DZ, DZ);
    g.translate(-DO[0], -DO[1]);
    const top = D0.top, e = D0.edge;
    g.fillStyle = vgrad(g, top, top + 14, [[0, rgb(shade(NIGHT.wood, 1.15))], [1, rgb(NIGHT.woodLo)]]);
    g.fillRect(e, top + 2, 572, 12);
    rect(g, e, top + 2, 572, 2, 'rgba(255,230,190,0.35)');
    texture(c, S, 32, { mottle: 0.05, dark: 0.04, light: 0.03, glow: { x: dz(D0.lamp)[0], y: dz(D0.lamp)[1], r: 500, amount: 0.3, color: LAMP_COL } });
    return c;
  }

  function deskLight(S) {
    const [lx, ly] = DESK.lamp;
    const bulb = LOOK.glowField({ x: lx + 14, y: ly + 20, r: 160, amount: 0.8 });
    const pool = LOOK.glowField({ x: 560, y: DESK.top - 90, r: 400, amount: 0.36 });
    const cone = LOOK.beamField({
      beams: [[0, 240, 0.55]], dir: [0.966, 0.259],
      noise: { base: 0.85, amp: 0.3, scale: 9, offset: 4, row: 6 },
      fall: (X, Y) => sstep(ly - 10, ly + 40, Y) * (1 - sstep(DESK.top, DESK.top + 160, Y)) * (1 - sstep(lx + 30, lx + 110, X)),
    });
    const moon = LOOK.glowField({ x: dz([130, 0])[0], y: dz([0, 330])[1], r: 300, amount: 0.25 });
    return {
      warm: LOOK.lightLayer(S, { fields: [bulb, pool, (X, Y) => cone(X - lx, Y - ly)], color: LAMP_COL }),
      cool: LOOK.lightLayer(S, { fields: [moon], color: [170, 196, 255] }),
    };
  }

  const YARD = {
    ground: 862,
    sun: [1000, -70],
    horizon: 470,
    tally: [818, 470],
    zoom: 1.3,
    origin: [160, 193],
  };
  const yardFrame = (g) => {
    g.scale(YARD.zoom, YARD.zoom);
    g.translate(-YARD.origin[0], -YARD.origin[1]);
  };

  function yardFar(S) {
    const { c, g } = makeLayer(S);
    yardFrame(g);
    g.fillStyle = vgrad(g, 0, YARD.horizon + 40, [[0, 'rgb(130,172,200)'], [0.6, 'rgb(196,212,208)'], [1, 'rgb(240,228,198)']]);
    g.fillRect(0, 0, W, H);
    LOOK.haze(g, { x: YARD.sun[0], y: YARD.sun[1], r: 1000 });
    for (const [x, y, rx, ry, a] of [[220, 110, 200, 9, 0.35], [120, 190, 150, 6, 0.28], [520, 80, 220, 8, 0.3], [420, 240, 180, 6, 0.22]]) ell(g, x, y, rx, ry, `rgba(255,250,236,${a})`);
    const G = [[120, 150, 140], [146, 170, 150], [170, 190, 164], [196, 206, 180]];
    for (const [x, w, h, col] of [[120, 160, 70, [176, 150, 140]], [560, 200, 84, [160, 150, 156]]]) {
      poly(g, [[x, YARD.horizon], [x + w * 0.15, YARD.horizon - h], [x + w * 0.85, YARD.horizon - h], [x + w, YARD.horizon]]);
      g.fillStyle = rgb(mix(col, [220, 222, 210], 0.4));
      g.fill();
    }
    crown(g, { x: 340, y: YARD.horizon - 50, rx: 160, ry: 80, n: 40, cr: 30, leaf: 9, seed: 'yfar1', greens: G, lx: 0.7, ly: -0.7 });
    crown(g, { x: 900, y: YARD.horizon - 70, rx: 200, ry: 100, n: 50, cr: 32, leaf: 9, seed: 'yfar2', greens: G, lx: 0.7, ly: -0.7 });
    rect(g, 0, YARD.horizon, W, 200, 'rgb(170,190,150)');
    texture(c, S, 41, { mottle: 0.045, dark: 0.04, light: 0.03 });
    return c;
  }

  function yardMid(S) {
    const { c, g } = makeLayer(S);
    yardFrame(g);
    const y0 = 440, y1 = 650;
    const rb = LIB.rng(sd('fence'));
    for (let x = -20; x < W + 20; x += 30) {
      const top = y0 + rb.range(-4, 4);
      const tone = rb.range(0.9, 1.06);
      g.fillStyle = hgrad(g, x, x + 28, [[0, rgb(shade([176, 140, 104], tone * 0.9))], [1, rgb(shade([196, 160, 118], tone))]]);
      poly(g, [[x, y1], [x, top + 8], [x + 14, top], [x + 28, top + 8], [x + 28, y1]]);
      g.fill();
      rect(g, x + 27, top + 8, 3, y1 - top, 'rgba(70,50,40,0.35)');
      ell(g, x + 14, y0 + 40, 1.6, 1.6, 'rgba(60,40,30,0.5)');
      ell(g, x + 14, y1 - 50, 1.6, 1.6, 'rgba(60,40,30,0.5)');
    }
    rect(g, -20, y0 + 50, W + 40, 10, 'rgba(70,50,40,0.18)');
    rect(g, -20, y1 - 60, W + 40, 10, 'rgba(70,50,40,0.18)');
    g.fillStyle = vgrad(g, y1 - 70, y1, [[0, 'rgba(60,70,40,0)'], [1, 'rgba(60,70,40,0.35)']]);
    g.fillRect(-20, y1 - 70, W + 40, 70);
    g.fillStyle = vgrad(g, y1 - 10, 760, [[0, 'rgb(132,164,92)'], [1, 'rgb(112,150,74)']]);
    g.fillRect(-20, y1 - 10, W + 40, 200);
    texture(c, S, 42, { mottle: 0.06, dark: 0.05, light: 0.035, glow: { x: YARD.sun[0], y: YARD.sun[1], r: 900, amount: 0.2 } });
    return c;
  }

  function yardNear(S) {
    const { c, g } = makeLayer(S);
    yardFrame(g);
    g.fillStyle = vgrad(g, 700, H, [[0, 'rgb(112,150,74)'], [1, 'rgb(84,128,58)']]);
    g.fillRect(-20, 700, W + 40, H);
    for (const [y, h] of [[760, 46], [820, 40]]) {
      poly(g, [[-20, y], [380, y - 2], [380, y + h], [-20, y + h + 2]]);
      g.fillStyle = 'rgba(190,210,130,0.32)';
      g.fill();
    }
    const rg = LIB.rng(sd('yardgrass'));
    for (let i = 0; i < 900; i++) {
      const x = rg.range(-20, W + 20), y = rg.range(690, H);
      const k = (y - 690) / (H - 690);
      const tall = x > 380 || y > 870 || y < 760 ? 1 : 0.35;
      const hh = (6 + 16 * k) * tall;
      g.fillStyle = rg() < 0.5 ? `rgba(60,96,44,${0.5 + 0.3 * k})` : `rgba(170,196,104,${0.45 + 0.3 * k})`;
      g.beginPath();
      g.moveTo(x - 1.6 - k, y);
      g.lineTo(x + rg.range(-3, 3), y - hh);
      g.lineTo(x + 1.6 + k, y);
      g.fill();
    }
    const sx0 = 744, sx1 = W + 20, sy0 = 380, sy1 = 770;
    ell(g, 860, sy1 + 4, 260, 16, 'rgba(40,40,30,0.3)');
    g.fillStyle = hgrad(g, sx0, sx1, [[0, 'rgb(150,96,70)'], [1, 'rgb(186,122,84)']]);
    g.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
    for (let x = sx0 + 26; x < sx1; x += 36) rect(g, x, sy0, 6, sy1 - sy0, 'rgba(90,50,34,0.28)');
    poly(g, [[sx0 - 30, sy0 + 6], [sx0 + 20, sy0 - 60], [sx1 + 20, sy0 - 60], [sx1 + 20, sy0 + 6]]);
    g.fillStyle = 'rgb(96,90,92)';
    g.fill();
    rect(g, sx0 - 30, sy0 + 4, sx1 - sx0 + 60, 12, 'rgb(120,110,110)');
    g.fillStyle = vgrad(g, sy0 + 16, sy0 + 70, [[0, 'rgba(40,20,20,0.4)'], [1, 'rgba(40,20,20,0)']]);
    g.fillRect(sx0, sy0 + 16, sx1 - sx0, 54);
    const dx0 = 960, dx1 = 1070;
    rect(g, dx0, 470, dx1 - dx0, sy1 - 470, 'rgb(130,80,60)');
    g.strokeStyle = 'rgb(110,66,50)';
    g.lineWidth = 12;
    g.beginPath();
    g.moveTo(dx0 + 6, 500);
    g.lineTo(dx1 - 6, 500);
    g.lineTo(dx0 + 6, sy1 - 30);
    g.lineTo(dx1 - 6, sy1 - 30);
    g.stroke();
    ell(g, dx0 + 14, 620, 5, 5, 'rgb(70,60,60)');
    const [tx, ty] = YARD.tally;
    g.strokeStyle = 'rgba(236,232,222,0.5)';
    g.lineWidth = 3;
    g.beginPath();
    g.arc(tx + 150, ty + 6, 16, 0, TAU);
    g.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      g.beginPath();
      g.moveTo(tx + 150 + Math.cos(a) * 22, ty + 6 + Math.sin(a) * 22);
      g.lineTo(tx + 150 + Math.cos(a) * 32, ty + 6 + Math.sin(a) * 32);
      g.stroke();
    }
    rrect(g, 700, 760, 50, 54, 6);
    g.fillStyle = 'rgb(186,56,46)';
    g.fill();
    rect(g, 716, 752, 18, 10, 'rgb(150,40,36)');
    ell(g, 724, 818, 34, 6, 'rgba(30,30,20,0.35)');
    rect(g, -20, 560, 130, 300, 'rgb(226,220,204)');
    for (let y = 600; y < 860; y += 22) rect(g, -20, y, 130, 2, 'rgba(60,56,70,0.18)');
    rect(g, -20, 760, 170, 22, 'rgb(170,160,150)');
    rect(g, -20, 782, 170, 30, 'rgb(150,140,132)');
    rect(g, -20, 812, 200, 22, 'rgb(170,160,150)');
    rect(g, -20, 834, 200, 32, 'rgb(150,140,132)');
    ell(g, 80, 872, 130, 10, 'rgba(40,40,30,0.3)');
    texture(c, S, 43, { mottle: 0.07, dark: 0.06, light: 0.04, glow: { x: YARD.sun[0], y: YARD.sun[1], r: 900, amount: 0.22 } });
    return c;
  }

  function yardLight(S) {
    const beams = LOOK.beamField({
      beams: [[300, 70, 0.55], [480, 110, 0.75], [700, 60, 0.45]],
      dir: [0.906, 0.423],
      noise: { base: 0.8, amp: 0.4, scale: 7, offset: 9, row: 1.5 },
      fall: (X, Y) => sstep(-60, 200, Y) * (1 - sstep(620, 860, Y)) * 0.6,
    });
    const glow = LOOK.glowField({ x: YARD.sun[0], y: YARD.sun[1], r: 520, amount: 0.6 });
    return LOOK.lightLayer(S, { fields: [beams, glow] });
  }

  function clock(ctx, o) {
    const { x, y, r } = o;
    const min = o.min || 0;
    ctx.save();
    ell(ctx, x + 4, y + 5, r + 6, r + 6, 'rgba(10,10,30,0.3)');
    ell(ctx, x, y, r + 6, r + 6, 'rgb(150,120,80)');
    ell(ctx, x, y, r, r, 'rgb(236,230,214)');
    ctx.fillStyle = 'rgb(60,54,60)';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      const k = i % 3 === 0 ? 0.78 : 0.84;
      ctx.save();
      ctx.translate(x + Math.sin(a) * r * k, y - Math.cos(a) * r * k);
      ctx.rotate(a);
      ctx.fillRect(-1.5, -r * (i % 3 === 0 ? 0.12 : 0.06), 3, r * (i % 3 === 0 ? 0.12 : 0.06));
      ctx.restore();
    }
    const hand = (a, len, w, col) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a);
      ctx.fillStyle = col;
      ctx.fillRect(-w / 2, -len, w, len + 6);
      ctx.restore();
    };
    hand(((min / 60) % 12) / 12 * TAU, r * 0.5, 5, 'rgb(40,34,40)');
    hand(((min % 60) / 60) * TAU, r * 0.78, 3, 'rgb(40,34,40)');
    ell(ctx, x, y, 4, 4, 'rgb(170,60,50)');
    ctx.restore();
  }

  function calendar(ctx, o) {
    const { x, y, w, h } = o;
    const weeks = Math.max(0, o.weeks || 0);
    ctx.save();
    rect(ctx, x + 4, y + 5, w, h, 'rgba(10,10,30,0.3)');
    rect(ctx, x, y, w, h, 'rgb(236,232,220)');
    rect(ctx, x + 6, y + 6, w - 12, h * 0.36, 'rgb(96,134,156)');
    poly(ctx, [[x + 6, y + 6 + h * 0.36], [x + w * 0.4, y + h * 0.18], [x + w * 0.7, y + h * 0.3], [x + w - 6, y + h * 0.2], [x + w - 6, y + 6 + h * 0.36]]);
    ctx.fillStyle = 'rgb(90,120,84)';
    ctx.fill();
    ctx.font = 'bold 13px Helvetica, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgb(170,50,46)';
    ctx.fillText(`${o.month || 'MARCH'} ${o.year || ''}`.trim(), x + w / 2, y + h * 0.36 + 22);
    const gx = x + 10, gy = y + h * 0.36 + 30, cw = (w - 20) / 7, ch = (h - (gy - y) - 8) / 5;
    ctx.fillStyle = 'rgba(60,54,60,0.35)';
    for (let r = 0; r <= 5; r++) ctx.fillRect(gx, gy + r * ch, w - 20, 1);
    for (let k = 0; k <= 7; k++) ctx.fillRect(gx + k * cw, gy, 1, ch * 5);
    ctx.strokeStyle = 'rgb(186,46,42)';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    for (let r = 0; r < 5; r++) {
      for (let k = 0; k < 7; k++) {
        const u = clamp01((weeks - r) * 7 - k);
        if (u <= 0) continue;
        const cx = gx + k * cw + cw / 2, cy = gy + r * ch + ch / 2, s = Math.min(cw, ch) * 0.32;
        ctx.beginPath();
        ctx.moveTo(cx - s, cy - s);
        ctx.lineTo(cx - s + 2 * s * Math.min(1, u * 2), cy - s + 2 * s * Math.min(1, u * 2));
        if (u > 0.5) {
          const v = (u - 0.5) * 2;
          ctx.moveTo(cx + s, cy - s);
          ctx.lineTo(cx + s - 2 * s * v, cy - s + 2 * s * v);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  const CACHE = {};
  function cached(key, S, build) {
    const c = CACHE[key];
    if (c && c.S === S) return c;
    return (CACHE[key] = Object.assign({ S }, build()));
  }

  FILM.sets = Object.assign(FILM.sets || {}, {
    home: {
      PORCH, BED, DESK, YARD, NIGHT,
      porch: (S, mode) => cached('porch-' + mode, S, () => ({ far: porchFar(S, mode), mid: porchMid(S, mode), near: porchNear(S, mode), light: porchLight(S, mode) })),
      bedroom: (S, view) => cached('bed-' + view, S, () => (view === 'desk'
        ? Object.assign({ near: bedroomDeskNear(S), front: bedroomDeskFront(S) }, deskLight(S))
        : Object.assign({ near: bedroomBedNear(S), pillow: pillow(S) }, bedLight(S)))),
      yard: (S) => cached('yard', S, () => ({ far: yardFar(S), mid: yardMid(S), near: yardNear(S), light: yardLight(S) })),
      clock,
      calendar,
    },
  });
})();
