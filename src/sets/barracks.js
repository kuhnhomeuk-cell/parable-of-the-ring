// sets/barracks.js: procedural set (background, props and light) shared by the scenes.
(function () {
  'use strict';

  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const SET = 'barracks';
  const sd = (...k) => LIB.hash(SET, ...k) & 0x7fffffff;
  const { makeLayer, poly, vgrad, hgrad, sstep, clamp01 } = LOOK;
  const TAU = Math.PI * 2;
  const W = 1080;
  const H = 1080;
  const texture = (c, S, n, o) => LOOK.texture(c, S, Object.assign({ seed: sd('tex', n), offset: n * 13.7 }, o));
  const HAZE = [200, 214, 198];
  const NIGHT = [52, 62, 84];
  const col = (c, hz, a, hc) => LOOK.col(c, hz || 0, a, hc || HAZE);

  const PAL = {
    wall: [158, 176, 156], wallLow: [128, 148, 130], wains: [96, 116, 100], ceil: [176, 190, 172],
    floor: [112, 124, 108], floorFar: [138, 150, 132],
    steel: [98, 110, 90], steelShade: [66, 76, 62], steelLight: [138, 150, 124],
    bunk: [66, 78, 70], blanket: [96, 102, 76], blanketShade: [74, 80, 58], sheet: [222, 230, 214],
    win: [34, 48, 78], winGlow: [96, 122, 168],
    tube: [238, 252, 236], housing: [150, 160, 150],
    block: [150, 158, 148], towel: [236, 234, 224], towelShade: [196, 198, 190], enamel: [222, 226, 216],
  };

  const rr = (g, x, y, w, h, r) => {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  };
  const fillRR = (g, x, y, w, h, r, fs) => {
    rr(g, x, y, w, h, r);
    g.fillStyle = fs;
    g.fill();
  };
  const ell = (g, x, y, rx, ry, rot, fs) => {
    g.beginPath();
    g.ellipse(x, y, rx, ry, rot || 0, 0, TAU);
    g.fillStyle = fs;
    g.fill();
  };

  function fixture(g, x0, x1, y, k, hz) {
    const h = 16 * k;
    g.fillStyle = col([120, 130, 122], hz);
    g.fillRect(x0 - 6 * k, y - h * 0.5, x1 - x0 + 12 * k, h);
    g.fillStyle = col([96, 104, 98], hz);
    g.fillRect(x0 - 6 * k, y + h * 0.5 - 3 * k, x1 - x0 + 12 * k, 3 * k);
    for (const dy of [-0.18, 0.18]) {
      g.fillStyle = col(PAL.tube, hz * 0.4);
      g.fillRect(x0, y + dy * h - 2.4 * k, x1 - x0, 4.8 * k);
    }
    g.fillStyle = col([110, 120, 112], hz);
    for (const x of [x0 + (x1 - x0) * 0.15, x1 - (x1 - x0) * 0.15]) g.fillRect(x - 1.2 * k, y - h * 0.5 - 40 * k, 2.4 * k, 40 * k);
  }

  function lockerClosed(g, x, y, w, h, hz, seed) {
    const r = LIB.rng(sd('lk', seed));
    g.fillStyle = hgrad(g, x, x + w, [[0, col(PAL.steelShade, hz)], [0.08, col(PAL.steel, hz)], [0.85, col(PAL.steelLight, hz)], [1, col(PAL.steel, hz)]]);
    g.fillRect(x, y, w, h);
    g.fillStyle = col([60, 68, 56], hz, 0.5);
    g.fillRect(x + w * 0.06, y + h * 0.02, w * 0.88, 2);
    g.fillRect(x + w * 0.06, y + h * 0.02, 2, h * 0.95);
    g.fillStyle = col([200, 210, 186], hz, 0.35);
    g.fillRect(x + w * 0.94 - 2, y + h * 0.02, 2, h * 0.95);
    for (const ly of [0.06, 0.86]) {
      for (let i = 0; i < 6; i++) {
        const yy = y + h * ly + i * h * 0.014;
        g.fillStyle = col([52, 60, 50], hz, 0.55);
        fillRR(g, x + w * 0.28, yy, w * 0.44, h * 0.006, 2, col([52, 60, 50], hz, 0.6));
        g.fillStyle = col([190, 200, 176], hz, 0.25);
        g.fillRect(x + w * 0.28, yy + h * 0.006, w * 0.44, 1);
      }
    }
    fillRR(g, x + w * 0.76, y + h * 0.44, w * 0.08, h * 0.1, 3, col([70, 76, 70], hz));
    g.fillStyle = col([170, 176, 160], hz);
    g.fillRect(x + w * 0.78, y + h * 0.455, w * 0.03, h * 0.07);
    g.fillStyle = col([226, 222, 200], hz);
    g.fillRect(x + w * 0.3, y + h * 0.24, w * 0.4, h * 0.04);
    g.fillStyle = col([80, 76, 70], hz, 0.6);
    for (let i = 0; i < 4; i++) g.fillRect(x + w * (0.34 + i * 0.08 + r() * 0.02), y + h * 0.255, w * 0.05, h * 0.01);
    g.fillStyle = col([255, 255, 240], hz, 0.06);
    g.fillRect(x + w * 0.1, y + h * 0.1, w * 0.12, h * 0.8);
  }

  function bunk(g, x, yf, w, k, hz, seed) {
    const r = LIB.rng(sd('bunk', seed));
    const ht = 250 * k;
    const post = 7 * k;
    const tiers = [yf - ht * 0.28, yf - ht * 0.8];
    for (const ty of tiers) {
      const mh = 24 * k;
      g.fillStyle = col(PAL.blanket, hz);
      fillRR(g, x + post, ty - mh, w - post * 2, mh + 8 * k, 4 * k, col(PAL.blanket, hz));
      g.fillStyle = col(PAL.blanketShade, hz);
      g.fillRect(x + post, ty - 2 * k, w - post * 2, 10 * k);
      g.fillStyle = col(PAL.sheet, hz);
      g.fillRect(x + post, ty - mh, w * 0.24, 7 * k);
      fillRR(g, x + post + 4 * k, ty - mh - 12 * k, w * 0.2, 14 * k, 6 * k, col([234, 238, 226], hz));
      g.fillStyle = col([60, 64, 46], hz, 0.35);
      for (let i = 0; i < 3; i++) g.fillRect(x + w * (0.35 + 0.18 * i + r() * 0.04), ty - mh + 4 * k, 1.5 * k, mh - 6 * k);
      g.fillStyle = col([40, 46, 40], hz, 0.35);
      g.fillRect(x + post, ty + 8 * k, w - post * 2, 5 * k);
      g.fillStyle = col(PAL.bunk, hz);
      g.fillRect(x, ty + 4 * k, w, 5 * k);
    }
    for (const px of [x, x + w - post]) {
      g.fillStyle = hgrad(g, px, px + post, [[0, col(PAL.bunk, hz)], [0.6, col([110, 124, 112], hz)], [1, col(PAL.bunk, hz)]]);
      g.fillRect(px, yf - ht, post, ht);
    }
    g.fillStyle = col(PAL.bunk, hz);
    g.fillRect(x, yf - ht, w, 4 * k);
    g.fillStyle = col([40, 50, 40], 0, 0.22);
    g.beginPath();
    g.ellipse(x + w / 2, yf + 2 * k, w * 0.56, 7 * k, 0, 0, TAU);
    g.fill();
  }

  function nightWindow(g, x, y, w, h, hz) {
    g.fillStyle = col([120, 136, 122], hz);
    g.fillRect(x - 10, y - 10, w + 20, h + 26);
    g.fillStyle = vgrad(g, y, y + h, [[0, col(PAL.winGlow, hz * 0.5)], [0.55, col(PAL.win, hz * 0.5)], [1, col([24, 34, 58], hz * 0.5)]]);
    g.fillRect(x, y, w, h);
    LOOK.haze(g, { x: x + w * 0.7, y: y + h * 0.7, r: w * 0.6, stops: [[0, 'rgba(180,200,230,0.35)'], [1, 'rgba(180,200,230,0)']] });
    g.fillStyle = col([120, 136, 122], hz);
    g.fillRect(x + w / 2 - 4, y, 8, h);
    g.fillRect(x, y + h * 0.48, w, 7);
    g.fillStyle = col([186, 198, 182], hz);
    g.fillRect(x - 14, y + h + 8, w + 28, 8);
  }

  function rolledSock(g, x, y, s, hz) {
    ell(g, x, y, 13 * s, 9 * s, 0, col([236, 232, 222], hz));
    ell(g, x + 3 * s, y + 3 * s, 10 * s, 5 * s, 0, col([206, 202, 190], hz));
    g.fillStyle = col([46, 64, 112], hz);
    g.fillRect(x - 13 * s, y - 2 * s, 5 * s, 4 * s);
  }

  const LK = {
    TUBE: [840, -30],
    open: { x0: 600, x1: 900, y0: 120, y1: 1010 },
    shelf: 852,
    stack: { x0: 818, x1: 894 },
    floorY: 1010,
  };

  function lockerFar(S) {
    const { c, g } = makeLayer(S);
    const hz = 0.32;
    g.fillStyle = vgrad(g, 0, H, [[0, col(PAL.ceil, hz)], [0.14, col(PAL.ceil, hz)], [0.15, col(PAL.wall, hz)], [0.62, col(PAL.wallLow, hz)], [0.63, col(PAL.wains, hz)], [0.72, col(PAL.wains, hz)], [0.73, col(PAL.floorFar, hz)], [1, col(PAL.floor, hz)]]);
    g.fillRect(0, 0, W, H);
    fixture(g, 120, 520, 84, 0.8, hz);
    nightWindow(g, 70, 290, 150, 230, hz + 0.1);
    nightWindow(g, 330, 290, 150, 230, hz + 0.1);
    for (const x of [70, 330]) {
      g.fillStyle = vgrad(g, 430, 520, [[0, 'rgba(150,120,170,0)'], [1, 'rgba(150,120,170,0.35)']]);
      g.fillRect(x, 430, 150, 90);
    }
    bunk(g, 20, 790, 220, 0.85, hz + 0.1, 1);
    bunk(g, 290, 790, 220, 0.85, hz + 0.1, 2);
    LOOK.haze(g, { x: 320, y: 84, r: 520, stops: [[0, 'rgba(232,250,230,0.55)'], [1, 'rgba(232,250,230,0)']] });
    g.fillStyle = hgrad(g, 0, W, [[0, 'rgba(18,34,32,0.42)'], [0.5, 'rgba(18,34,32,0.3)'], [1, 'rgba(18,34,32,0.1)']]);
    g.fillRect(0, 0, W, H);
    texture(c, S, 11, { mottle: 0.045, dark: 0.04, light: 0.03 });
    return c;
  }

  function lockerMid(S) {
    const { c, g } = makeLayer(S);
    const hz = 0.25;
    bunk(g, -60, 930, 330, 1.25, hz, 3);
    g.fillStyle = vgrad(g, 850, 940, [[0, col([96, 104, 78], hz)], [1, col([70, 78, 58], hz)]]);
    g.fillRect(150, 850, 210, 86);
    g.fillStyle = col([120, 128, 98], hz);
    g.fillRect(150, 846, 210, 8);
    g.fillStyle = col([190, 170, 110], hz);
    g.fillRect(246, 872, 18, 12);
    g.save();
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = 'rgba(18,34,30,0.3)';
    g.fillRect(0, 0, W, H);
    g.restore();
    texture(c, S, 12, { mottle: 0.06, dark: 0.05, light: 0.035 });
    return c;
  }

  function lockerNear(S) {
    const { c, g } = makeLayer(S);
    const { x0, x1, y0, y1 } = LK.open;
    g.fillStyle = vgrad(g, LK.floorY, H, [[0, col([96, 108, 94])], [1, col([120, 132, 116])]]);
    g.fillRect(540, LK.floorY - 4, W - 520, H - LK.floorY + 8);
    g.fillStyle = col([70, 78, 64]);
    g.fillRect(560, y1 - 4, W, 18);
    g.fillStyle = col([132, 142, 118]);
    g.fillRect(560, y0 - 30, W, 30);
    g.fillStyle = col([94, 104, 86]);
    g.fillRect(560, y0 - 4, W, 8);
    lockerClosed(g, x1 + 8, y0, 178, y1 - y0, 0, 1);
    g.fillStyle = hgrad(g, x0, x1, [[0, 'rgb(34,42,34)'], [0.5, 'rgb(52,62,48)'], [1, 'rgb(44,52,40)']]);
    g.fillRect(x0, y0, x1 - x0, y1 - y0);
    poly(g, [[x0, y0], [x0 + 26, y0 + 22], [x0 + 26, y1 - 18], [x0, y1]]);
    g.fillStyle = 'rgb(88,98,80)';
    g.fill();
    poly(g, [[x1, y0], [x1 - 26, y0 + 22], [x1 - 26, y1 - 18], [x1, y1]]);
    g.fillStyle = 'rgb(46,52,42)';
    g.fill();
    g.fillStyle = vgrad(g, y0, y0 + 160, [[0, 'rgba(20,24,18,0.5)'], [1, 'rgba(20,24,18,0)']]);
    g.fillRect(x0, y0, x1 - x0, 160);
    const sp = g.createRadialGradient(x1 - 40, y0 + 40, 0, x1 - 40, y0 + 40, 420);
    sp.addColorStop(0, 'rgba(220,244,214,0.22)');
    sp.addColorStop(1, 'rgba(220,244,214,0)');
    g.fillStyle = sp;
    g.fillRect(x0, y0, x1 - x0, y1 - y0);
    const tsy = 280;
    g.fillStyle = 'rgb(118,128,104)';
    g.fillRect(x0 + 8, tsy, x1 - x0 - 16, 10);
    g.fillStyle = 'rgba(20,24,18,0.45)';
    g.fillRect(x0 + 8, tsy + 10, x1 - x0 - 16, 14);
    fillRR(g, x0 + 40, tsy - 44, 110, 44, 6, 'rgb(214,216,204)');
    g.fillStyle = 'rgb(190,192,180)';
    g.fillRect(x0 + 40, tsy - 24, 110, 4);
    fillRR(g, x0 + 168, tsy - 30, 70, 30, 8, 'rgb(84,90,64)');
    fillRR(g, x0 + 166, tsy - 62, 62, 34, 8, 'rgb(96,104,70)');
    g.fillStyle = 'rgb(76,84,56)';
    g.beginPath();
    g.ellipse(x0 + 232, tsy - 30, 30, 6, -0.1, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(150,156,138)';
    g.fillRect(x0 + 20, tsy + 46, x1 - x0 - 40, 6);
    const jx = 770;
    g.strokeStyle = 'rgb(160,160,150)';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(jx, tsy + 40);
    g.quadraticCurveTo(jx + 8, tsy + 56, jx, tsy + 66);
    g.stroke();
    poly(g, [[jx - 70, tsy + 80], [jx + 70, tsy + 80], [jx + 92, tsy + 190], [jx + 86, tsy + 420], [jx - 86, tsy + 420], [jx - 92, tsy + 190]]);
    g.fillStyle = 'rgb(86,96,64)';
    g.fill();
    const rc = LIB.rng(sd('camo'));
    g.save();
    poly(g, [[jx - 70, tsy + 80], [jx + 70, tsy + 80], [jx + 92, tsy + 190], [jx + 86, tsy + 420], [jx - 86, tsy + 420], [jx - 92, tsy + 190]]);
    g.clip();
    const CAM = ['rgb(60,72,44)', 'rgb(104,88,58)', 'rgb(40,40,32)', 'rgb(118,128,86)'];
    for (let i = 0; i < 46; i++) {
      g.fillStyle = CAM[i % 4];
      g.beginPath();
      g.ellipse(rc.range(jx - 100, jx + 100), rc.range(tsy + 70, tsy + 430), rc.range(14, 30), rc.range(6, 14), rc.range(-0.6, 0.6), 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgba(20,24,16,0.28)';
    g.fillRect(jx - 100, tsy + 70, 30, 360);
    g.restore();
    g.fillStyle = 'rgba(30,34,24,0.5)';
    g.fillRect(jx - 2, tsy + 90, 4, 330);
    for (let i = 0; i < 5; i++) ell(g, jx + 9, tsy + 120 + i * 60, 3.5, 3.5, 0, 'rgb(46,50,36)');
    g.fillStyle = 'rgba(20,24,18,0.5)';
    g.fillRect(x0 + 26, LK.shelf - 70, x1 - x0 - 52, 70);
    g.fillStyle = 'rgb(108,118,96)';
    g.fillRect(x0 + 8, LK.shelf, x1 - x0 - 16, 12);
    g.fillStyle = 'rgb(140,150,124)';
    g.fillRect(x0 + 8, LK.shelf, x1 - x0 - 16, 2.5);
    g.fillStyle = 'rgba(20,24,18,0.5)';
    g.fillRect(x0 + 8, LK.shelf + 12, x1 - x0 - 16, 16);
    for (const bx of [628, 676]) {
      fillRR(g, bx, LK.shelf - 92, 40, 70, 8, 'rgb(34,32,30)');
      fillRR(g, bx - 4, LK.shelf - 26, 54, 26, 8, 'rgb(28,26,24)');
      g.fillStyle = 'rgba(200,210,190,0.16)';
      g.fillRect(bx + 28, LK.shelf - 86, 6, 56);
    }
    texture(c, S, 13, { mottle: 0.07, dark: 0.06, light: 0.04, glow: { x: LK.TUBE[0], y: LK.TUBE[1], r: 820, amount: 0.18, color: [226, 250, 220] } });
    return c;
  }

  function lockerFront(S) {
    const { c, g } = makeLayer(S);
    const { x0, x1 } = LK.stack;
    const cols = ['rgb(102,108,72)', 'rgb(222,222,212)', 'rgb(94,100,66)', 'rgb(110,116,78)', 'rgb(214,216,204)'];
    for (let i = 0; i < 5; i++) {
      const yy = LK.shelf - (i + 1) * 17;
      fillRR(g, x0 + (i % 2) * 3, yy, x1 - x0 - 4, 17, 5, cols[i]);
      g.fillStyle = 'rgba(20,24,16,0.25)';
      g.fillRect(x0 + (i % 2) * 3, yy + 13, x1 - x0 - 4, 4);
      g.fillStyle = 'rgba(255,255,240,0.12)';
      g.fillRect(x0 + (i % 2) * 3 + 6, yy + 2, x1 - x0 - 30, 2);
    }
    texture(c, S, 14, { mottle: 0.06, dark: 0.05, light: 0.03 });
    return c;
  }

  function lockerLight(S) {
    const tube = LOOK.beamField({
      beams: [[620, 160, 0.7], [860, 70, 0.4]],
      dir: [0.89, 0.45],
      noise: { base: 0.8, amp: 0.3, scale: 9, offset: 5, row: 4.5 },
      fall: (X, Y) => 0.55 * (1 - sstep(80, 760, Y)),
    });
    const glow = LOOK.glowField({ x: LK.TUBE[0], y: LK.TUBE[1], r: 360, amount: 0.75 });
    const farGlow = LOOK.glowField({ x: 320, y: 84, r: 220, amount: 0.35 });
    return LOOK.lightLayer(S, { fields: [tube, glow, farGlow], color: [222, 250, 220] });
  }

  const RM = {
    wallFoot: 690,
    fixtures: [[150, 500, 70], [590, 940, 70]],
    windows: [[150, 210, 120, 160], [520, 210, 120, 160], [880, 210, 120, 160]],
    bunks: [[-40, 160], [300, 190], [660, 190], [930, 190]],
    locker: { x0: 196, x1: 330, y0: 420, y1: 806 },
    floorY: 806,
  };

  function roomFar(S) {
    const { c, g } = makeLayer(S);
    const hz = 0.4;
    g.fillStyle = vgrad(g, 0, RM.wallFoot, [[0, col(PAL.ceil, hz)], [0.13, col(PAL.ceil, hz)], [0.135, col([136, 150, 134], hz)], [0.16, col(PAL.wall, hz)], [0.8, col(PAL.wallLow, hz)], [0.81, col(PAL.wains, hz)], [1, col(PAL.wains, hz)]]);
    g.fillRect(0, 0, W, RM.wallFoot + 10);
    for (const [x, y, w, h] of RM.windows) nightWindow(g, x, y, w, h, hz);
    fillRR(g, 340, 250, 120, 80, 3, col([150, 120, 82], hz));
    g.fillStyle = col([232, 228, 210], hz);
    for (const [px, py] of [[352, 262], [400, 268], [372, 296], [420, 300]]) g.fillRect(px, py, 30, 22);
    g.fillStyle = col([170, 60, 56], hz);
    g.fillRect(730, 250, 90, 58);
    g.fillStyle = col([234, 226, 214], hz);
    for (let i = 1; i < 7; i += 2) g.fillRect(730, 250 + i * 8.3, 90, 8.3);
    g.fillStyle = col([46, 60, 110], hz);
    g.fillRect(730, 250, 38, 33);
    texture(c, S, 21, { mottle: 0.045, dark: 0.04, light: 0.03 });
    return c;
  }

  function roomMid(S) {
    const { c, g } = makeLayer(S);
    const hz = 0.2;
    g.fillStyle = vgrad(g, RM.wallFoot - 6, RM.wallFoot + 40, [[0, col(PAL.floorFar, hz)], [1, col(PAL.floor, hz)]]);
    g.fillRect(-60, RM.wallFoot - 6, W + 120, 60);
    for (let i = 0; i < RM.bunks.length; i++) bunk(g, RM.bunks[i][0], RM.wallFoot, RM.bunks[i][1], 1, hz, 10 + i);
    lockerClosed(g, 172, RM.wallFoot - 240, 100, 240, hz + 0.1, 7);
    lockerClosed(g, 506, RM.wallFoot - 240, 120, 240, hz + 0.1, 8);
    lockerClosed(g, 864, RM.wallFoot - 240, 52, 240, hz + 0.1, 9);
    texture(c, S, 22, { mottle: 0.055, dark: 0.05, light: 0.035 });
    return c;
  }

  function roomNear(S) {
    const { c, g } = makeLayer(S);
    const y0 = RM.wallFoot + 10;
    g.fillStyle = vgrad(g, y0, H, [[0, col([128, 140, 122])], [0.4, col([112, 124, 108])], [1, col([98, 110, 96])]]);
    g.fillRect(-60, y0, W + 120, H - y0 + 20);
    const VPX = 540, VPY = 300;
    g.strokeStyle = 'rgba(60,70,58,0.22)';
    g.lineWidth = 1.4;
    for (let xb = -1800; xb <= 2900; xb += 150) {
      const kx = (y) => VPX + (xb - VPX) * (y - VPY) / (H - VPY);
      g.beginPath();
      g.moveTo(kx(y0), y0);
      g.lineTo(kx(H + 40), H + 40);
      g.stroke();
    }
    for (const yy of [716, 738, 766, 802, 848, 906, 980, 1074]) {
      g.fillStyle = 'rgba(60,70,58,0.2)';
      g.fillRect(-60, yy, W + 120, 1.4);
    }
    const rs = LIB.rng(sd('tile'));
    for (let i = 0; i < 70; i++) {
      g.fillStyle = rs() < 0.5 ? 'rgba(70,80,66,0.06)' : 'rgba(240,255,236,0.05)';
      g.beginPath();
      g.ellipse(rs.range(-40, W + 40), rs.range(y0 + 10, H), rs.range(30, 110), rs.range(4, 12), 0, 0, TAU);
      g.fill();
    }
    for (const [x0, x1] of RM.fixtures) {
      const cx = (x0 + x1) / 2;
      g.fillStyle = vgrad(g, y0, H, [[0, 'rgba(232,250,230,0.28)'], [0.5, 'rgba(232,250,230,0.12)'], [1, 'rgba(232,250,230,0)']]);
      poly(g, [[cx - 120, y0], [cx + 120, y0], [cx + 70, H], [cx - 70, H]]);
      g.fill();
    }
    const L = RM.locker;
    g.fillStyle = 'rgba(30,38,30,0.3)';
    g.beginPath();
    g.ellipse((L.x0 + L.x1) / 2, L.y1 + 2, 90, 10, 0, 0, TAU);
    g.fill();
    g.fillStyle = hgrad(g, L.x0, L.x1, [[0, col(PAL.steelShade)], [0.5, col(PAL.steel)], [1, col(PAL.steelLight)]]);
    g.fillRect(L.x0, L.y0, L.x1 - L.x0, L.y1 - L.y0);
    g.fillStyle = 'rgb(48,56,44)';
    g.fillRect(L.x0 + 10, L.y0 + 12, L.x1 - L.x0 - 20, L.y1 - L.y0 - 24);
    g.fillStyle = vgrad(g, L.y0, L.y0 + 120, [[0, 'rgba(14,18,12,0.5)'], [1, 'rgba(14,18,12,0)']]);
    g.fillRect(L.x0 + 10, L.y0 + 12, L.x1 - L.x0 - 20, 120);
    g.fillStyle = 'rgb(100,110,90)';
    g.fillRect(L.x0 + 10, L.y0 + 96, L.x1 - L.x0 - 20, 6);
    g.fillRect(L.x0 + 10, L.y0 + 250, L.x1 - L.x0 - 20, 6);
    g.fillStyle = 'rgb(140,146,130)';
    g.fillRect(L.x0 + 18, L.y0 + 118, L.x1 - L.x0 - 36, 3);
    poly(g, [[L.x0, L.y0], [L.x0 - 56, L.y0 + 22], [L.x0 - 56, L.y1 - 14], [L.x0, L.y1]]);
    g.fillStyle = hgrad(g, L.x0 - 56, L.x0, [[0, col([128, 138, 114])], [1, col([96, 106, 86])]]);
    g.fill();
    g.fillStyle = 'rgba(40,48,38,0.5)';
    for (let i = 0; i < 5; i++) {
      poly(g, [[L.x0 - 40, L.y0 + 50 + i * 9], [L.x0 - 14, L.y0 + 44 + i * 9], [L.x0 - 14, L.y0 + 47 + i * 9], [L.x0 - 40, L.y0 + 53 + i * 9]]);
      g.fill();
    }
    g.fillStyle = hgrad(g, 1012, 1040, [[0, 'rgb(46,56,48)'], [0.6, 'rgb(84,98,86)'], [1, 'rgb(52,62,54)']]);
    g.fillRect(1012, 300, 26, 640);
    g.fillStyle = 'rgb(58,68,58)';
    g.fillRect(1012, 560, 90, 10);
    g.fillRect(1012, 830, 90, 10);
    fillRR(g, 1026, 500, 120, 64, 8, 'rgb(90,96,70)');
    fillRR(g, 1026, 770, 120, 64, 8, 'rgb(90,96,70)');
    g.fillStyle = 'rgba(30,40,30,0.3)';
    g.beginPath();
    g.ellipse(1030, 942, 60, 8, 0, 0, TAU);
    g.fill();
    texture(c, S, 23, { mottle: 0.07, dark: 0.06, light: 0.04, glow: { x: 540, y: 60, r: 700, amount: 0.14, color: [226, 250, 220] } });
    return c;
  }

  function roomTop(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = vgrad(g, 0, 40, [[0, col([150, 162, 146])], [1, col([150, 162, 146], 0, 0)]]);
    g.fillRect(0, 0, W, 40);
    for (const [x0, x1, y] of RM.fixtures) fixture(g, x0, x1, y, 1.2, 0);
    texture(c, S, 24, { mottle: 0.05, dark: 0.04, light: 0.03 });
    return c;
  }

  function roomLight(S) {
    const fields = [];
    for (const [x0, x1, y] of RM.fixtures) {
      const cx = (x0 + x1) / 2;
      fields.push((X, Y) => {
        const dy = Y - y;
        if (dy < -30) return 0;
        const half = (x1 - x0) * 0.55 + dy * 0.35;
        const dx = Math.abs(X - cx) / half;
        return 0.3 * (1 - sstep(0.55, 1.05, dx)) * (1 - sstep(120, 760, dy));
      });
      fields.push(LOOK.glowField({ x: cx, y, r: (x1 - x0) * 0.45, amount: 0.55 }));
    }
    return LOOK.lightLayer(S, { fields, color: [222, 250, 220] });
  }

  function roomMoon(S) {
    const fields = [];
    for (const [x, y, w, h] of RM.windows) {
      fields.push((X, Y) => {
        const inWin = X > x && X < x + w && Y > y && Y < y + h ? 0.55 : 0;
        const fy = Y - (RM.wallFoot + 20);
        const fx = Math.abs(X - (x + w / 2 + fy * 0.25)) / (w * 0.6 + fy * 0.2);
        const slab = fy > 0 ? 0.32 * (1 - sstep(0.6, 1, fx)) * (1 - sstep(60, 300, fy)) : 0;
        return Math.max(inWin, slab);
      });
    }
    return LOOK.lightLayer(S, { fields, color: [150, 176, 230] });
  }

  const LD = {
    BULB: [650, 168],
    floorY: 760,
    washers: [[690, 180], [880, 180]],
  };

  function cinder(g, x0, y0, x1, y1, base, hz, seed) {
    g.fillStyle = vgrad(g, y0, y1, [[0, col(base, hz)], [1, col(LOOK.shade(base, 0.86), hz)]]);
    g.fillRect(x0, y0, x1 - x0, y1 - y0);
    const r = LIB.rng(sd('cinder', seed));
    const bh = 34, bw = 76;
    for (let row = 0, y = y0; y < y1; row++, y += bh) {
      g.fillStyle = col([84, 92, 84], hz, 0.22);
      g.fillRect(x0, y, x1 - x0, 2);
      for (let x = x0 - (row % 2) * bw / 2; x < x1; x += bw) {
        g.fillStyle = col([84, 92, 84], hz, 0.18);
        g.fillRect(x, y, 2, bh);
        const v = r();
        if (v < 0.3) {
          g.fillStyle = col([255, 255, 244], hz, 0.05);
          g.fillRect(x + 3, y + 3, bw - 5, bh - 5);
        }
      }
    }
  }

  function heap(g, cx, base, w, hgt, n, seed, hz, lightX) {
    const r = LIB.rng(sd('heap', seed));
    const sideLit = lightX > cx ? 1 : -1;
    const mound = (c) => {
      c.moveTo(cx - w * 0.55, base);
      c.bezierCurveTo(cx - w * 0.5, base - hgt * 0.5, cx - w * 0.28, base - hgt * 1.02, cx - w * 0.02, base - hgt);
      c.bezierCurveTo(cx + w * 0.26, base - hgt * 0.98, cx + w * 0.5, base - hgt * 0.45, cx + w * 0.56, base);
      c.closePath();
    };
    g.beginPath();
    mound(g);
    g.fillStyle = hgrad(g, cx - w * 0.55, cx + w * 0.55, sideLit > 0
      ? [[0, col([170, 176, 172], hz)], [0.6, col([214, 216, 208], hz)], [1, col([236, 232, 220], hz)]]
      : [[0, col([236, 232, 220], hz)], [0.4, col([214, 216, 208], hz)], [1, col([170, 176, 172], hz)]]);
    g.fill();
    g.save();
    g.beginPath();
    mound(g);
    g.clip();
    for (let i = 0; i < 9; i++) {
      const x = cx - w * 0.5 + w * (i + r()) / 9;
      g.strokeStyle = col([150, 156, 150], hz, 0.55);
      g.lineWidth = 2 + 2 * r();
      g.beginPath();
      g.moveTo(x, base - hgt * (0.35 + 0.4 * r()));
      g.bezierCurveTo(x - 10, base - hgt * 0.3, x + 12, base - hgt * 0.15, x - 4, base + 4);
      g.stroke();
    }
    g.restore();
    const TOW = [[240, 238, 228], [228, 232, 226], [206, 218, 230], [236, 226, 204], [214, 222, 210], [190, 206, 222]];
    const items = [];
    for (let i = 0; i < n; i++) {
      const yk = Math.pow(r(), 0.8);
      const half = w * 0.46 * (1 - 0.7 * yk);
      items.push({ x: cx + (r() * 2 - 1) * half, y: base - yk * hgt * 0.92, s: (0.7 + 0.6 * r()) * w * 0.15 * (1 - 0.35 * yk), rot: (r() - 0.5) * 0.7, v: r(), kind: r() < 0.65 ? 'fold' : 'crumple' });
    }
    items.sort((a, b2) => a.y - b2.y);
    for (const it of items) {
      const c0 = TOW[(it.v * TOW.length) | 0];
      const lw = it.s * 2.6, lh = it.s * (it.kind === 'fold' ? 0.75 : 1.15);
      g.save();
      g.translate(it.x, it.y);
      g.rotate(it.rot);
      g.fillStyle = col([60, 66, 64], hz, 0.22);
      fillRR(g, -lw / 2 + 3, -lh / 2 + 5, lw, lh, lh * 0.45, col([60, 66, 64], hz, 0.22));
      if (it.kind === 'fold') {
        fillRR(g, -lw / 2, -lh / 2, lw, lh, lh * 0.4, col(LOOK.shade(c0, 0.9), hz));
        fillRR(g, -lw / 2, -lh / 2, lw, lh * 0.55, lh * 0.3, col(LOOK.shade(c0, 1.02), hz));
        g.fillStyle = col(LOOK.shade(c0, 0.74), hz, 0.8);
        g.fillRect(-lw / 2 + lh * 0.3, lh * 0.18, lw - lh * 0.6, 1.8);
        if (it.v > 0.7) {
          g.fillStyle = col([86, 112, 158], hz, 0.75);
          g.fillRect(-lw / 2 + lh * 0.2, -lh * 0.12, lw - lh * 0.4, Math.max(2, lh * 0.08));
        }
      } else {
        g.beginPath();
        g.moveTo(-lw / 2, lh * 0.3);
        g.quadraticCurveTo(-lw * 0.5, -lh * 0.6, -lw * 0.1, -lh * 0.45);
        g.quadraticCurveTo(lw * 0.1, -lh * 0.75, lw * 0.35, -lh * 0.35);
        g.quadraticCurveTo(lw * 0.6, 0, lw * 0.45, lh * 0.4);
        g.closePath();
        g.fillStyle = col(LOOK.shade(c0, 0.95), hz);
        g.fill();
        g.strokeStyle = col(LOOK.shade(c0, 0.72), hz, 0.7);
        g.lineWidth = 1.8;
        g.beginPath();
        g.moveTo(0, -lh * 0.2);
        g.quadraticCurveTo(-lw * 0.15, lh * 0.05, -lw * 0.3, lh * 0.3);
        g.moveTo(0, -lh * 0.2);
        g.quadraticCurveTo(lw * 0.12, lh * 0.1, lw * 0.2, lh * 0.35);
        g.stroke();
      }
      g.fillStyle = `rgba(255,240,206,${0.25 * clamp01(1 - Math.abs(lightX - it.x) / 900)})`;
      g.fillRect(sideLit > 0 ? lw * 0.1 : -lw / 2 + 4, -lh / 2 + 1, lw * 0.36, 2);
      g.restore();
    }
  }

  function washer(g, x, yf, w, hz, k) {
    const h = w * 1.18;
    const y = yf - h;
    fillRR(g, x, y, w, h, 8 * k, hgrad(g, x, x + w, [[0, col([176, 182, 172], hz)], [0.35, col(PAL.enamel, hz)], [1, col([200, 206, 196], hz)]]));
    g.fillStyle = col([150, 156, 148], hz);
    g.fillRect(x + 6 * k, y + 6 * k, w - 12 * k, h * 0.16);
    g.fillStyle = col([60, 64, 62], hz);
    for (let i = 0; i < 3; i++) ell(g, x + w * (0.3 + i * 0.2), y + 6 * k + h * 0.08, 5 * k, 5 * k, 0, col([70, 74, 70], hz));
    g.fillStyle = col([200, 60, 50], hz);
    g.fillRect(x + w * 0.12, y + h * 0.07, 10 * k, 5 * k);
    const px = x + w / 2, py = y + h * 0.58, pr = w * 0.33;
    ell(g, px, py, pr + 9 * k, pr + 9 * k, 0, col([150, 156, 152], hz));
    ell(g, px, py, pr + 4 * k, pr + 4 * k, 0, col([206, 212, 208], hz));
    ell(g, px, py, pr, pr, 0, col([40, 50, 54], hz));
    g.save();
    g.beginPath();
    g.arc(px, py, pr, 0, TAU);
    g.clip();
    ell(g, px - pr * 0.1, py + pr * 0.6, pr * 0.9, pr * 0.5, 0, col([150, 170, 180], hz, 0.6));
    g.fillStyle = col([220, 236, 240], hz, 0.25);
    poly(g, [[px - pr * 0.6, py - pr], [px - pr * 0.25, py - pr], [px - pr * 0.9, py + pr], [px - pr * 1.2, py + pr]]);
    g.fill();
    g.restore();
    g.fillStyle = col([120, 126, 118], hz);
    g.fillRect(x + 4 * k, yf - 14 * k, w - 8 * k, 12 * k);
  }

  function laundryBack(S) {
    const { c, g } = makeLayer(S);
    const hz = 0.15;
    g.fillStyle = 'rgb(58,64,62)';
    g.fillRect(0, 0, W, 70);
    cinder(g, 0, 70, W, LD.floorY, [150, 160, 150], hz, 1);
    g.fillStyle = col([110, 122, 112], hz);
    g.fillRect(0, LD.floorY - 40, W, 40);
    g.fillStyle = vgrad(g, LD.floorY, H, [[0, 'rgb(118,124,116)'], [1, 'rgb(92,98,92)']]);
    g.fillRect(0, LD.floorY, W, H - LD.floorY);
    ell(g, 560, 930, 34, 9, 0, 'rgb(70,74,70)');
    g.fillStyle = 'rgb(46,50,48)';
    for (let i = -2; i <= 2; i++) g.fillRect(556 + i * 9, 924, 3, 12);
    ell(g, 600, 940, 150, 26, 0, 'rgba(60,70,70,0.18)');
    for (const [y, w] of [[120, 12], [150, 8]]) {
      g.fillStyle = vgrad(g, y, y + w, [[0, 'rgb(150,150,140)'], [0.5, 'rgb(190,190,180)'], [1, 'rgb(110,110,100)']]);
      g.fillRect(0, y, W, w);
    }
    for (const [x, w] of LD.washers) washer(g, x, LD.floorY, w, 0.08, 1);
    g.fillStyle = 'rgb(150,140,116)';
    g.fillRect(-20, 560, 460, 14);
    g.fillStyle = 'rgb(84,86,80)';
    for (const x of [20, 400]) g.fillRect(x, 574, 8, LD.floorY - 574);
    heap(g, 190, 560, 480, 330, 34, 1, 0.04, LD.BULB[0]);
    heap(g, 330, LD.floorY + 8, 300, 150, 14, 2, 0.02, LD.BULB[0]);
    heap(g, 60, LD.floorY + 10, 240, 120, 10, 3, 0.02, LD.BULB[0]);
    LOOK.haze(g, { x: LD.BULB[0], y: LD.BULB[1] + 40, r: 620, stops: [[0, 'rgba(255,240,200,0.42)'], [0.4, 'rgba(255,236,196,0.16)'], [1, 'rgba(255,236,196,0)']] });
    LOOK.haze(g, { x: LD.BULB[0], y: 520, r: 900, stops: [[0, 'rgba(20,30,34,0)'], [0.6, 'rgba(20,30,34,0.18)'], [1, 'rgba(20,30,34,0.55)']] });
    texture(c, S, 31, { mottle: 0.07, dark: 0.06, light: 0.04, glow: { x: LD.BULB[0], y: LD.BULB[1], r: 560, amount: 0.2, color: [255, 236, 196] } });
    return c;
  }

  function laundryBulb(S) {
    const { c, g } = makeLayer(S);
    const [bx, by] = LD.BULB;
    g.strokeStyle = 'rgb(40,38,36)';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(bx, 0);
    g.lineTo(bx, by - 22);
    g.stroke();
    g.fillStyle = 'rgb(70,66,60)';
    g.fillRect(bx - 9, by - 30, 18, 14);
    ell(g, bx, by, 15, 18, 0, 'rgb(255,250,224)');
    ell(g, bx - 4, by - 4, 6, 8, 0, 'rgb(255,255,246)');
    return c;
  }

  function laundryLight(S) {
    const [bx, by] = LD.BULB;
    const glow = LOOK.glowField({ x: bx, y: by, r: 120, amount: 0.95 });
    const wide = LOOK.glowField({ x: bx, y: by + 80, r: 460, amount: 0.3 });
    const cone = (X, Y) => {
      const dy = Y - by;
      if (dy < 0) return 0;
      const dx = Math.abs(X - bx) / (60 + dy * 0.55);
      return 0.22 * (1 - sstep(0.5, 1, dx)) * (1 - sstep(300, 900, dy));
    };
    return LOOK.lightLayer(S, { fields: [glow, wide, cone], color: [255, 238, 198] });
  }

  const LC = { BULB: [1020, -120] };

  function closeBack(S) {
    const { c, g } = makeLayer(S);
    const hz = 0.25;
    cinder(g, 0, 0, W, H, [140, 150, 140], 0.3, 2);
    washer(g, 760, 980, 340, hz + 0.1, 1.8);
    heap(g, 130, 1000, 640, 760, 30, 5, hz, LC.BULB[0]);
    g.fillStyle = 'rgba(40,50,50,0.35)';
    g.fillRect(0, 980, W, 100);
    LOOK.haze(g, { x: LC.BULB[0], y: LC.BULB[1], r: 1300, stops: [[0, 'rgba(255,240,204,0.55)'], [0.35, 'rgba(255,236,196,0.2)'], [1, 'rgba(255,236,196,0)']] });
    LOOK.haze(g, { x: 900, y: 0, r: 1500, stops: [[0, 'rgba(18,26,30,0)'], [0.55, 'rgba(18,26,30,0.25)'], [1, 'rgba(18,26,30,0.6)']] });
    texture(c, S, 41, { mottle: 0.05, dark: 0.04, light: 0.03 });
    return c;
  }

  function closeLight(S) {
    const beam = LOOK.beamField({
      beams: [[500, 220, 0.6]],
      dir: [0.8, 0.6],
      noise: { base: 0.8, amp: 0.3, scale: 9, offset: 2, row: 2.5 },
      fall: (X, Y) => 0.5 * (1 - sstep(200, 1000, Y)),
    });
    const glow = LOOK.glowField({ x: LC.BULB[0], y: LC.BULB[1], r: 520, amount: 0.8 });
    return LOOK.lightLayer(S, { fields: [beam, glow], color: [255, 238, 198] });
  }

  function lockerItems(ctx, k) {
    const L = RM.locker;
    if (k <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= clamp01(k * 1.5);
    const x0 = L.x0 + 14, w = L.x1 - L.x0 - 28;
    fillRR(ctx, x0 + 4, L.y0 + 70, w * 0.45, 26, 4, 'rgb(98,106,72)');
    fillRR(ctx, x0 + w * 0.52, L.y0 + 76, w * 0.44, 20, 4, 'rgb(216,218,206)');
    if (k > 0.5) {
      poly(ctx, [[x0 + 14, L.y0 + 124], [x0 + w - 14, L.y0 + 124], [x0 + w - 6, L.y0 + 238], [x0 + 6, L.y0 + 238]]);
      ctx.fillStyle = 'rgb(80,90,60)';
      ctx.fill();
    }
    for (let i = 0; i < 3; i++) rolledSock(ctx, x0 + 18 + i * 30, L.y0 + 238, 0.85, 0);
    fillRR(ctx, x0 + 4, L.y0 + 272, w - 8, 24, 4, 'rgb(104,110,76)');
    fillRR(ctx, x0 + 10, L.y0 + 296, w - 20, 22, 4, 'rgb(226,226,216)');
    fillRR(ctx, x0 + 6, L.y1 - 60, 40, 44, 8, 'rgb(34,32,30)');
    fillRR(ctx, x0 + 52, L.y1 - 60, 40, 44, 8, 'rgb(34,32,30)');
    ctx.restore();
  }

  function tube(ctx, x0, x1, y, on) {
    if (on <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const k = 1.2;
    const g = ctx.createLinearGradient(0, y - 30, 0, y + 30);
    g.addColorStop(0, 'rgba(230,255,230,0)');
    g.addColorStop(0.5, `rgba(230,255,230,${0.55 * on})`);
    g.addColorStop(1, 'rgba(230,255,230,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x0 - 30, y - 30, x1 - x0 + 60, 60);
    ctx.fillStyle = `rgba(250,255,248,${on})`;
    for (const dy of [-0.18, 0.18]) ctx.fillRect(x0, y + dy * 16 * k - 2.4 * k, x1 - x0, 4.8 * k);
    ctx.restore();
  }

  const VIEWS = {
    locker: (S) => ({ far: lockerFar(S), mid: lockerMid(S), near: lockerNear(S), front: lockerFront(S), light: lockerLight(S) }),
    room: (S) => ({ far: roomFar(S), mid: roomMid(S), near: roomNear(S), top: roomTop(S), light: roomLight(S), moon: roomMoon(S) }),
    laundry: (S) => ({ back: laundryBack(S), bulb: laundryBulb(S), light: laundryLight(S) }),
    laundryClose: (S) => ({ back: closeBack(S), light: closeLight(S) }),
  };
  const CACHE = {};
  function statics(S, view) {
    const hit = CACHE[view];
    if (hit && hit.S === S) return hit;
    return (CACHE[view] = Object.assign({ S }, VIEWS[view](S)));
  }

  FILM.sets = Object.assign(FILM.sets || {}, {
    barracks: { statics, PAL, GEO: { LK, RM, LD, LC }, lockerItems, tube, rolledSock, NIGHT },
  });
})();
