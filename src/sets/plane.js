// sets/plane.js: procedural set (background, props and light) shared by the scenes.
(function () {
  'use strict';

  const FILM = window.FILM;
  const LIB = FILM.lib, LOOK = FILM.look;
  const ID = 'set-plane';
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { makeLayer, poly, vgrad, hgrad, sstep } = LOOK;
  const TAU = Math.PI * 2;
  const W = 1080, H = 1080;

  const LAMP = [720, 64];
  const FAR_SEAT = 676;
  const FAR_FLOOR = 760;
  const NEAR_SEAT = 922;
  const NEAR_FLOOR = 1012;
  const RIBS = [-40, 150, 340, 530, 720, 910, 1100];
  const PORT = [620, 300, 30];

  const texture = (c, S, n, o) => LOOK.texture(c, S, Object.assign({ seed: sd('tex', n), offset: 40 + n * 13.7 }, o));
  const LAMPLIGHT = { x: LAMP[0], y: LAMP[1], r: 640, amount: 0.18, color: [255, 214, 200] };

  const ribAt = (x0, k) => {
    const y = lerpN(FAR_SEAT + 10, -60, k);
    const x = x0 + (x0 - 540) * 0.32 * k * k;
    return [x, y];
  };
  function lerpN(a, b, k) { return a + (b - a) * k; }

  function buildFar(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = vgrad(g, 0, FAR_FLOOR, [[0, 'rgb(150,156,158)'], [0.5, 'rgb(170,174,170)'], [1, 'rgb(150,152,148)']]);
    g.fillRect(0, 0, W, H);
    const rp = LIB.rng(sd('panel'));
    for (let i = 0; i < RIBS.length - 1; i++) {
      for (let r = 0; r < 4; r++) {
        const k0 = 0.06 + r * 0.24, k1 = k0 + 0.22;
        const a0 = ribAt(RIBS[i], k0), a1 = ribAt(RIBS[i + 1], k0), b1 = ribAt(RIBS[i + 1], k1), b0 = ribAt(RIBS[i], k1);
        const pad = 16;
        const pts = [[a0[0] + pad, a0[1] - 6], [a1[0] - pad, a1[1] - 6], [b1[0] - pad, b1[1] + 6], [b0[0] + pad, b0[1] + 6]];
        const v = rp();
        poly(g, pts);
        g.fillStyle = `rgb(${172 + 10 * v},${178 + 8 * v},${170 + 6 * v})`;
        g.fill();
        g.save();
        poly(g, pts);
        g.clip();
        const y0 = Math.min(pts[2][1], pts[3][1]), y1 = Math.max(pts[0][1], pts[1][1]);
        g.fillStyle = vgrad(g, y0, y1, [[0, 'rgba(255,255,250,0.18)'], [0.4, 'rgba(255,255,250,0)'], [0.8, 'rgba(40,44,52,0.08)'], [1, 'rgba(40,44,52,0.28)']]);
        g.fillRect(-100, y0 - 10, W + 200, y1 - y0 + 20);
        g.strokeStyle = 'rgba(70,74,80,0.14)';
        g.lineWidth = 1.4;
        const cx = (pts[0][0] + pts[1][0] + pts[2][0] + pts[3][0]) / 4, cy = (y0 + y1) / 2;
        for (let d = -2; d <= 2; d++) {
          g.beginPath();
          g.moveTo(cx - 120 + d * 50, cy - 70);
          g.lineTo(cx + d * 50 + 120, cy + 70);
          g.moveTo(cx + 120 + d * 50, cy - 70);
          g.lineTo(cx + d * 50 - 120, cy + 70);
          g.stroke();
        }
        g.restore();
      }
    }
    for (const x0 of RIBS) {
      const pts = [];
      for (let k = 0; k <= 1.0001; k += 0.05) pts.push(ribAt(x0, k));
      const wAt = (k) => 22 + 26 * k * k;
      const L = pts.map((p, i) => [p[0] - wAt(i / 20) / 2, p[1]]);
      const R = pts.map((p, i) => [p[0] + wAt(i / 20) / 2, p[1]]).reverse();
      poly(g, L.concat(R));
      g.fillStyle = 'rgb(112,118,124)';
      g.fill();
      poly(g, pts.map((p, i) => [p[0] + wAt(i / 20) * 0.2, p[1]]).concat(R));
      g.fillStyle = 'rgb(176,180,180)';
      g.fill();
      poly(g, L.concat(L.map((p, i) => [p[0] - 14 - 10 * (i / 20), p[1]]).reverse()));
      g.fillStyle = 'rgba(50,56,66,0.22)';
      g.fill();
      g.fillStyle = 'rgba(70,74,80,0.5)';
      for (let k = 0.08; k < 0.8; k += 0.09) {
        const p = ribAt(x0, k);
        g.beginPath();
        g.arc(p[0] + 5, p[1], 2, 0, TAU);
        g.fill();
      }
    }
    g.fillStyle = vgrad(g, -10, 120, [[0, 'rgb(96,100,108)'], [1, 'rgba(120,124,130,0)']]);
    g.fillRect(0, -10, W, 130);
    g.fillStyle = 'rgb(84,88,96)';
    g.fillRect(0, 118, W, 10);
    g.fillStyle = 'rgba(200,204,206,0.5)';
    g.fillRect(0, 118, W, 2);
    g.fillStyle = 'rgb(128,120,104)';
    g.fillRect(0, 146, W, 6);
    for (let x = 30; x < W; x += 96) {
      g.fillStyle = 'rgb(70,74,80)';
      g.fillRect(x, 124, 6, 26);
    }
    const [px, py, pr] = PORT;
    g.fillStyle = 'rgb(96,100,106)';
    g.beginPath();
    g.arc(px, py, pr + 12, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(186,190,190)';
    g.beginPath();
    g.arc(px + 2, py - 2, pr + 7, 0, TAU);
    g.fill();
    g.save();
    g.beginPath();
    g.arc(px, py, pr, 0, TAU);
    g.clip();
    g.fillStyle = vgrad(g, py - pr, py + pr, [[0, 'rgb(40,56,96)'], [1, 'rgb(78,94,132)']]);
    g.fillRect(px - pr, py - pr, 2 * pr, 2 * pr);
    g.fillStyle = 'rgba(200,214,236,0.35)';
    g.beginPath();
    g.ellipse(px - 6, py + 14, 34, 5, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.9)';
    for (const [sx, sy, r] of [[px - 12, py - 12, 1.6], [px + 10, py - 4, 1.1], [px + 2, py - 18, 0.9]]) {
      g.beginPath();
      g.arc(sx, sy, r, 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgba(255,255,255,0.12)';
    poly(g, [[px - pr, py - 6], [px - 6, py - pr], [px + 4, py - pr], [px - pr, py + 6]]);
    g.fill();
    g.restore();
    const netTop = 340, netBot = 470;
    const rb = LIB.rng(sd('bags'));
    for (let x = -30; x < W + 40; ) {
      const w = rb.range(90, 150), h = rb.range(70, 110);
      const y = netBot - h + rb.range(-6, 10);
      const v = rb();
      const base = v < 0.5 ? [150, 140, 100] : v < 0.8 ? [118, 126, 96] : [172, 150, 110];
      if (Math.abs(x + w / 2 - PORT[0]) > 110) {
        g.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
        g.beginPath();
        g.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, rb.range(-0.15, 0.15), 0, TAU);
        g.fill();
        g.fillStyle = 'rgba(40,44,52,0.4)';
        g.beginPath();
        g.ellipse(x + w / 2 - w * 0.12, y + h * 0.62, w * 0.42, h * 0.34, 0, 0, TAU);
        g.fill();
        g.fillStyle = 'rgba(255,255,240,0.14)';
        g.beginPath();
        g.ellipse(x + w * 0.62, y + h * 0.3, w * 0.22, h * 0.16, 0, 0, TAU);
        g.fill();
        g.fillStyle = 'rgba(70,70,60,0.45)';
        g.fillRect(x + w * 0.45, y + 6, 5, h - 12);
      }
      x += w * 0.82;
    }
    g.strokeStyle = 'rgba(70,72,64,0.4)';
    g.lineWidth = 1.6;
    for (let x = -20; x < W + 40; x += 30) {
      g.beginPath();
      g.moveTo(x, netTop + 30);
      g.lineTo(x + 40, netBot + 6);
      g.moveTo(x + 40, netTop + 30);
      g.lineTo(x, netBot + 6);
      g.stroke();
    }
    g.fillStyle = 'rgb(116,118,112)';
    g.fillRect(0, netTop + 24, W, 6);
    g.fillRect(0, netBot + 4, W, 6);
    g.fillStyle = vgrad(g, FAR_FLOOR, H, [[0, 'rgb(118,120,124)'], [1, 'rgb(148,150,152)']]);
    g.fillRect(0, FAR_FLOOR, W, H - FAR_FLOOR);
    g.fillStyle = 'rgba(40,44,52,0.35)';
    g.fillRect(0, FAR_FLOOR, W, 6);
    for (const [y, a] of [[800, 0.2], [850, 0.22], [916, 0.25]]) {
      g.fillStyle = `rgba(60,64,72,${a})`;
      g.fillRect(0, y, W, 5 + (y - 760) / 40);
      g.fillStyle = 'rgba(210,212,214,0.25)';
      for (let x = (y * 7) % 40; x < W; x += 40 + (y - 760) / 6) g.fillRect(x, y, 10 + (y - 760) / 14, 2);
    }
    texture(c, S, 1, { mottle: 0.05, dark: 0.045, light: 0.03, glow: LAMPLIGHT });
    return c;
  }

  function buildBench(S) {
    const { c, g } = makeLayer(S);
    const top = FAR_SEAT - 150;
    g.fillStyle = 'rgb(150,152,154)';
    g.fillRect(0, top - 6, W, 6);
    for (let x = 8; x < W + 20; x += 72) {
      g.fillStyle = 'rgb(160,118,112)';
      g.fillRect(x, top, 10, FAR_SEAT - top);
      g.fillStyle = 'rgba(60,30,30,0.22)';
      g.fillRect(x + 7, top, 3, FAR_SEAT - top);
    }
    for (const y of [top + 40, top + 96]) {
      g.fillStyle = 'rgb(156,104,98)';
      g.fillRect(0, y, W, 9);
      g.fillStyle = 'rgba(60,30,30,0.2)';
      g.fillRect(0, y + 7, W, 2);
    }
    g.fillStyle = 'rgb(186,108,98)';
    g.fillRect(0, FAR_SEAT, W, 14);
    g.fillStyle = 'rgba(255,220,210,0.3)';
    g.fillRect(0, FAR_SEAT, W, 2);
    g.fillStyle = 'rgb(160,162,164)';
    g.fillRect(0, FAR_SEAT + 14, W, 6);
    g.fillStyle = vgrad(g, FAR_SEAT + 20, FAR_FLOOR, [[0, 'rgba(40,44,56,0.45)'], [1, 'rgba(40,44,56,0.15)']]);
    g.fillRect(0, FAR_SEAT + 20, W, FAR_FLOOR - FAR_SEAT - 20);
    for (let x = 60; x < W; x += 210) {
      g.fillStyle = 'rgb(138,140,144)';
      poly(g, [[x, FAR_SEAT + 18], [x + 6, FAR_SEAT + 18], [x - 10, FAR_FLOOR + 2], [x - 16, FAR_FLOOR + 2]]);
      g.fill();
    }
    texture(c, S, 2, { mottle: 0.06, dark: 0.05, light: 0.035, glow: LAMPLIGHT });
    return c;
  }

  function buildNear(S) {
    const { c, g } = makeLayer(S);
    const top = NEAR_SEAT - 190;
    g.fillStyle = 'rgba(30,32,44,0.25)';
    g.fillRect(0, top - 8, W, 16);
    g.fillStyle = 'rgb(150,152,156)';
    g.fillRect(0, top - 6, W, 9);
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.fillRect(0, top - 6, W, 2);
    for (let x = 10; x < W + 20; x += 84) {
      g.fillStyle = 'rgb(140,100,96)';
      g.fillRect(x, top + 3, 14, NEAR_SEAT - top);
      g.fillStyle = 'rgba(50,24,24,0.25)';
      g.fillRect(x + 10, top + 3, 4, NEAR_SEAT - top);
    }
    for (const y of [top + 50, top + 120]) {
      g.fillStyle = 'rgb(140,84,80)';
      g.fillRect(0, y, W, 12);
      g.fillStyle = 'rgba(255,220,210,0.18)';
      g.fillRect(0, y, W, 2);
    }
    g.fillStyle = vgrad(g, NEAR_SEAT, NEAR_SEAT + 30, [[0, 'rgb(176,104,96)'], [1, 'rgb(130,76,72)']]);
    g.fillRect(0, NEAR_SEAT, W, 22);
    g.fillStyle = 'rgb(150,152,156)';
    g.fillRect(0, NEAR_SEAT + 22, W, 9);
    texture(c, S, 3, { mottle: 0.07, dark: 0.06, light: 0.04, glow: LAMPLIGHT });
    return c;
  }

  function buildGrade(S) {
    const { c, g } = makeLayer(S, 0.25);
    g.fillStyle = vgrad(g, 0, H, [[0, 'rgb(96,104,150)'], [0.6, 'rgb(112,118,160)'], [1, 'rgb(88,92,132)']]);
    g.fillRect(0, 0, W, H);
    const rg = g.createRadialGradient(LAMP[0], LAMP[1], 0, LAMP[0], LAMP[1], 900);
    rg.addColorStop(0, 'rgba(255,170,160,1)');
    rg.addColorStop(0.3, 'rgba(236,132,132,0.85)');
    rg.addColorStop(0.65, 'rgba(190,112,130,0.4)');
    rg.addColorStop(1, 'rgba(150,110,150,0)');
    g.fillStyle = rg;
    g.fillRect(0, 0, W, H);
    g.fillStyle = hgrad(g, 0, 420, [[0, 'rgba(40,44,80,0.45)'], [1, 'rgba(40,44,80,0)']]);
    g.fillRect(0, 0, 420, H);
    return c;
  }

  function buildLight(S) {
    const cone = LOOK.beamField({
      beams: [[0, 150, 0.35]],
      dir: [0.97, 0.24],
      noise: { base: 0.85, amp: 0.3, scale: 9, offset: 2, row: 4.5 },
      fall: (X, Y) => sstep(40, 140, Y) * (1 - sstep(560, 980, Y)),
      mask: (X, Y) => 1,
    });
    const shifted = (X, Y) => cone(X - LAMP[0] + 60 * (Y - LAMP[1]) / 400, Y);
    const glow = LOOK.glowField({ x: LAMP[0], y: LAMP[1], r: 220, amount: 0.75 });
    return LOOK.lightLayer(S, { fields: [shifted, glow], color: [255, 120, 104] });
  }

  function drawLamp(ctx, t) {
    const [x, y] = LAMP;
    ctx.save();
    ctx.fillStyle = 'rgb(46,42,50)';
    ctx.fillRect(x - 4, y - 70, 8, 44);
    ctx.fillRect(x - 34, y - 30, 68, 14);
    ctx.beginPath();
    ctx.ellipse(x, y - 16, 30, 24, 0, 0, Math.PI);
    ctx.fillStyle = `rgb(255,${118 + 6 * Math.sin(t * 2.3)},96)`;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x - 6, y - 10, 13, 9, 0, 0, Math.PI);
    ctx.fillStyle = 'rgba(255,222,200,0.95)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(46,42,50,0.85)';
    ctx.lineWidth = 2.5;
    for (const k of [-0.6, 0, 0.6]) {
      ctx.beginPath();
      ctx.moveTo(x + 30 * k, y - 16);
      ctx.quadraticCurveTo(x + 34 * k, y + 8 - 14 * Math.abs(k), x, y + 9);
      ctx.stroke();
    }
    ctx.restore();
  }

  let CACHE = null;
  function statics(S) {
    if (CACHE && CACHE.S === S) return CACHE;
    CACHE = { S, far: buildFar(S), bench: buildBench(S), near: buildNear(S), grade: buildGrade(S), light: buildLight(S) };
    return CACHE;
  }

  FILM.sets = Object.assign(FILM.sets || {}, {
    plane: { statics, drawLamp, LAMP, FAR_SEAT, FAR_FLOOR, NEAR_SEAT, NEAR_FLOOR, PORT },
  });
})();
