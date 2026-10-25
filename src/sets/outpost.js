// sets/outpost.js: procedural set (background, props and light) shared by the scenes.
(function () {
  'use strict';

  const FILM = window.FILM;
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const ID = 'outpost';
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const TAU = Math.PI * 2;
  const W = 1080;
  const H = 1080;
  const { sstep, clamp01, lerp, vgrad, hgrad, poly, makeLayer } = LOOK;

  const KEY = [980, 560];
  const GROUND = 820;
  const LEE_GROUND = 860;
  const HORIZON = 640;
  const SHADOW_K = LOOK.shadowK(Math.PI - 0.12, 0.55);
  const STREET_X0 = -60;
  const STREET_W = 1600;
  const BARRICADE = { x0: 1150, x1: 1420, top: 700, base: 884 };
  const LEE_WALL = { x0: -40, x1: 370, top: 540 };
  const SMOKE = [28, 12, 14];

  const texture = (c, S, n, o) => LOOK.texture(c, S, Object.assign({ seed: sd('tex', n), offset: n * 17.3 }, o));
  const rgb = (c, a) => (a == null ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`);
  const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

  function ruin(g, o) {
    const r = LIB.rng(sd('ruin', o.seed));
    const { x0, x1, base, top } = o;
    const w = x1 - x0;
    const jag = o.jag == null ? 0.35 : o.jag;
    const pts = [[x0, base]];
    pts.push([x0 + r.range(-4, 6), top + (base - top) * r.range(0.05, 0.3)]);
    const n = Math.max(3, Math.round(w / 26));
    for (let i = 0; i <= n; i++) {
      const x = x0 + (w * i) / n;
      const drop = Math.pow(r(), 1.6) * (base - top) * jag;
      pts.push([x + r.range(-6, 6), top + drop]);
      if (r() < 0.3) pts.push([x + r.range(4, 12), top + drop + r.range(8, 30)]);
    }
    pts.push([x1, top + (base - top) * r.range(0.05, 0.4)]);
    pts.push([x1, base]);
    poly(g, pts);
    g.fillStyle = o.grad ? o.grad : rgb(o.body);
    g.fill();
    g.save();
    poly(g, pts);
    g.clip();
    if (o.floors) {
      for (let y = base - o.floors; y > top; y -= o.floors) {
        g.fillStyle = rgb(mix(o.body, [0, 0, 0], 0.35), 0.8);
        g.fillRect(x0, y, w, Math.max(2, o.floors * 0.08));
        g.fillStyle = rgb(o.lit, 0.25);
        g.fillRect(x0, y - 1.5, w, 1.5);
      }
    }
    if (o.holes) {
      const [rows, cols] = o.holes;
      const ch = (base - top) / (rows + 0.5), cw = w / cols;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (r() < 0.25) continue;
          const hx = x0 + cw * (j + 0.22) + r.range(-3, 3), hy = base - ch * (i + 0.85);
          const hw = cw * r.range(0.4, 0.6), hh = ch * r.range(0.45, 0.62);
          const lit = r() < (o.glow || 0);
          const hp = [[hx, hy], [hx + hw, hy + r.range(-2, 2)], [hx + hw + r.range(-3, 2), hy + hh], [hx + r.range(-2, 3), hy + hh]];
          if (r() < 0.4) hp.splice(1, 0, [hx + hw * 0.5, hy - r.range(3, ch * 0.2)]);
          poly(g, hp);
          if (lit) {
            g.fillStyle = vgrad(g, hy, hy + hh, [[0, 'rgb(150,52,26)'], [1, 'rgb(236,124,46)']]);
          } else {
            g.fillStyle = rgb(mix(o.body, [8, 4, 6], 0.6));
          }
          g.fill();
        }
      }
    }
    g.fillStyle = hgrad(g, x0, x1, [[0, rgb(o.lit, 0)], [0.75, rgb(o.lit, 0)], [1, rgb(o.lit, 0.32)]]);
    g.fillRect(x0, top, w, base - top);
    g.restore();
    g.strokeStyle = rgb(o.lit, 0.55);
    g.lineWidth = o.rimW || 2;
    g.beginPath();
    for (let i = 2; i < pts.length - 1; i++) {
      if (i === 2) g.moveTo(pts[i][0], pts[i][1]);
      else g.lineTo(pts[i][0], pts[i][1]);
    }
    g.stroke();
    const nb = o.rebar || 0;
    g.strokeStyle = rgb(mix(o.body, [0, 0, 0], 0.5));
    g.lineWidth = Math.max(1, (o.rimW || 2) * 0.8);
    for (let i = 0; i < nb; i++) {
      const p = pts[2 + ((r() * (pts.length - 4)) | 0)];
      g.beginPath();
      g.moveTo(p[0], p[1] + 2);
      g.quadraticCurveTo(p[0] + r.range(-6, 6), p[1] - r.range(8, 18), p[0] + r.range(-14, 14), p[1] - r.range(14, 30));
      g.stroke();
    }
  }

  function rubble(g, cx, base, w, hgt, seed, body, lit, n) {
    const r = LIB.rng(sd('rubble', seed));
    const count = n || Math.round(w / 9);
    for (let i = 0; i < count; i++) {
      const u = r();
      const x = cx + (u - 0.5) * w;
      const peak = 1 - Math.pow(Math.abs(u - 0.5) * 2, 1.6);
      const y = base - peak * hgt * r.range(0.3, 1);
      const s = r.range(0.45, 1) * Math.max(4, hgt * 0.35);
      const pts = [];
      const k = 5 + ((r() * 3) | 0);
      for (let j = 0; j < k; j++) {
        const a = (j / k) * TAU + r.range(-0.3, 0.3);
        pts.push([x + Math.cos(a) * s * r.range(0.6, 1.2), y + Math.sin(a) * s * r.range(0.4, 0.8)]);
      }
      poly(g, pts);
      g.fillStyle = rgb(mix(body, [0, 0, 0], r.range(0, 0.35)));
      g.fill();
      poly(g, [[x, y - s * 0.5], [x + s * 0.9, y - s * 0.2], [x + s * 0.7, y + s * 0.3], [x + s * 0.1, y]]);
      g.fillStyle = rgb(lit, r.range(0.15, 0.4));
      g.fill();
    }
  }

  function sandbag(g, x, y, w, h, tone, lit, r) {
    const rr = h * 0.48;
    g.beginPath();
    g.moveTo(x + rr, y);
    g.quadraticCurveTo(x + w * 0.5, y - h * 0.12, x + w - rr, y);
    g.quadraticCurveTo(x + w + h * 0.06, y + h * 0.5, x + w - rr, y + h);
    g.quadraticCurveTo(x + w * 0.5, y + h * 1.08, x + rr, y + h);
    g.quadraticCurveTo(x - h * 0.06, y + h * 0.5, x + rr, y);
    g.closePath();
    g.fillStyle = vgrad(g, y, y + h, [[0, rgb(mix(tone, lit, 0.32))], [0.4, rgb(tone)], [1, rgb(mix(tone, [10, 6, 8], 0.45))]]);
    g.fill();
    g.fillStyle = hgrad(g, x, x + w, [[0, 'rgba(10,6,8,0.25)'], [0.6, 'rgba(10,6,8,0)'], [1, rgb(lit, 0.28)]]);
    g.fill();
    g.strokeStyle = rgb(mix(tone, [0, 0, 0], 0.4), 0.6);
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(x + w * 0.18, y + h * 0.2);
    g.lineTo(x + w * 0.15 + r.range(-2, 2), y + h * 0.8);
    g.moveTo(x + w * 0.84, y + h * 0.18);
    g.lineTo(x + w * 0.86 + r.range(-2, 2), y + h * 0.82);
    g.stroke();
  }

  function sandbagWall(g, x0, x1, base, top, seed, tone, lit, scale) {
    const r = LIB.rng(sd('bags', seed));
    const sc = scale || 1;
    const bh = 34 * sc;
    let row = 0;
    for (let y = base - bh; y > top - 4; y -= bh * 0.8, row++) {
      const bw = 92 * sc;
      const off = (row % 2) * bw * 0.5 - r.range(0, 20);
      const shrink = row * 6 * sc;
      for (let x = x0 + off + shrink; x < x1 - shrink - bw * 0.4; x += bw * 0.94) {
        sandbag(g, x, y + r.range(-2, 2), bw * r.range(0.95, 1.05), bh, mix(tone, [0, 0, 0], r.range(0, 0.15)), lit, r);
      }
    }
  }

  const FAR_X = -110;
  const FAR_W = 1300;

  function buildFar(S) {
    const { c, g } = makeLayer(S, 1, FAR_W, H);
    g.translate(-FAR_X, 0);
    g.fillStyle = vgrad(g, 0, HORIZON + 40, [
      [0, 'rgb(14,9,11)'], [0.3, 'rgb(34,14,16)'], [0.55, 'rgb(74,22,20)'], [0.78, 'rgb(142,46,24)'], [0.93, 'rgb(206,92,36)'], [1, 'rgb(228,128,52)'],
    ]);
    g.fillRect(FAR_X, 0, FAR_W, H);
    LOOK.haze(g, { x: KEY[0], y: KEY[1], r: 900, stops: [[0, 'rgba(255,150,60,0.75)'], [0.3, 'rgba(230,96,40,0.38)'], [0.7, 'rgba(150,40,24,0.12)'], [1, 'rgba(120,30,20,0)']] });
    LOOK.haze(g, { x: 180, y: 640, r: 420, stops: [[0, 'rgba(220,100,40,0.35)'], [1, 'rgba(200,80,30,0)']] });
    const N = LOOK.noise(sd('smoke-far'));
    for (let i = 0; i < 70; i++) {
      const r = LIB.rng(sd('billow', i));
      const x = FAR_X + r() * FAR_W;
      const y = 60 + Math.pow(r(), 0.8) * 470;
      const rad = r.range(40, 120) * (0.7 + 0.6 * (y / 520));
      const dark = 0.25 + 0.5 * N.fbm(x / 300, y / 200, 2);
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, `rgba(22,12,14,${0.38 * dark})`);
      gr.addColorStop(0.6, `rgba(30,14,16,${0.22 * dark})`);
      gr.addColorStop(1, 'rgba(30,14,16,0)');
      g.fillStyle = gr;
      g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      const ug = g.createRadialGradient(x + rad * 0.2, y + rad * 0.45, 0, x + rad * 0.2, y + rad * 0.45, rad * 0.7);
      const warm = clamp01(1 - Math.hypot(x - KEY[0], y - KEY[1]) / 900);
      ug.addColorStop(0, `rgba(210,90,40,${0.12 * warm})`);
      ug.addColorStop(1, 'rgba(210,90,40,0)');
      g.fillStyle = ug;
      g.fillRect(x - rad, y - rad * 0.3, rad * 2, rad * 1.5);
    }
    for (const [bx, w0, lean, a] of [[820, 40, -260, 0.55], [300, 30, -200, 0.45], [1080, 54, -320, 0.5]]) {
      for (let k = 0; k < 26; k++) {
        const u = k / 25;
        const x = bx + lean * u * u + 20 * Math.sin(u * 7 + bx);
        const y = 600 - u * 560;
        const rad = w0 * (1 + 3.2 * u);
        const gr = g.createRadialGradient(x, y, 0, x, y, rad);
        gr.addColorStop(0, `rgba(26,14,16,${a * (1 - 0.6 * u)})`);
        gr.addColorStop(1, 'rgba(26,14,16,0)');
        g.fillStyle = gr;
        g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
    }
    const FARB = [90, 34, 30], FARL = [236, 140, 70];
    const r = LIB.rng(sd('skyline'));
    let x = FAR_X - 20;
    let i = 0;
    while (x < FAR_X + FAR_W) {
      const w = r.range(50, 130);
      const top = HORIZON - r.range(30, 120);
      ruin(g, { x0: x, x1: x + w, base: HORIZON + 30, top, body: mix(FARB, [150, 60, 40], 0.25 * r()), lit: FARL, seed: 'far' + i, jag: 0.3, holes: r() < 0.6 ? [2, 3] : null, glow: 0.15, rimW: 1.2 });
      x += w + r.range(-14, 20);
      i++;
    }
    g.fillStyle = 'rgb(84,32,28)';
    poly(g, [[452, HORIZON], [452, 420], [446, 412], [446, 404], [478, 404], [478, 412], [472, 420], [472, 386], [466, 372], [460, 380], [458, 392], [472, 420], [472, HORIZON]]);
    g.fill();
    g.fillRect(452, 386, 20, HORIZON - 386);
    g.fillStyle = 'rgba(236,140,70,0.3)';
    g.fillRect(468, 386, 4, HORIZON - 386);
    g.fillStyle = vgrad(g, HORIZON - 30, HORIZON + 40, [[0, 'rgba(200,90,44,0)'], [0.6, 'rgba(200,90,44,0.35)'], [1, 'rgba(120,40,26,0.5)']]);
    g.fillRect(FAR_X, HORIZON - 30, FAR_W, 80);
    g.fillStyle = vgrad(g, 0, 460, [[0, 'rgba(8,5,7,0.85)'], [0.5, 'rgba(10,6,8,0.4)'], [1, 'rgba(10,6,8,0)']]);
    g.fillRect(FAR_X, 0, FAR_W, 460);
    texture(c, S, 1, { mottle: 0.05, dark: 0.04, light: 0.03, glow: { x: KEY[0] - FAR_X, y: KEY[1], r: 700, amount: 0.12, color: [255, 160, 90] } });
    return c;
  }

  const MID_X = -170;
  const MID_W = 1420;
  const MID_FIRES = [[248, 548, 46], [742, 512, 40], [1116, 560, 54]];

  function buildMid(S) {
    const { c, g } = makeLayer(S, 1, MID_W, H);
    g.translate(-MID_X, 0);
    const BODY = [58, 22, 22], LIT = [226, 110, 52];
    const blocks = [
      [-170, -20, 470, 0.4], [-30, 150, 520, 0.3], [140, 340, 430, 0.45], [330, 470, 560, 0.3], [470, 640, 380, 0.5],
      [640, 820, 470, 0.35], [810, 960, 540, 0.4], [950, 1140, 420, 0.3], [1130, 1260, 500, 0.45],
    ];
    blocks.forEach(([x0, x1, top, jag], i) => {
      ruin(g, { x0, x1, base: 700, top, body: mix(BODY, [30, 12, 14], (i % 3) * 0.2), lit: LIT, seed: 'mid' + i, jag, floors: 64, holes: [3, Math.max(2, Math.round((x1 - x0) / 60))], glow: 0.12, rebar: 5, rimW: 2 });
    });
    for (const [x, y, rad] of MID_FIRES) {
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, 'rgba(250,150,60,0.7)');
      gr.addColorStop(0.5, 'rgba(220,90,36,0.3)');
      gr.addColorStop(1, 'rgba(200,70,30,0)');
      g.fillStyle = gr;
      g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 9; i++) rubble(g, MID_X + 80 + i * 160, 702, 150, 26, 'mid' + i, [50, 22, 22], LIT, 14);
    g.fillStyle = vgrad(g, 600, 710, [[0, 'rgba(160,60,34,0)'], [1, 'rgba(160,60,34,0.35)']]);
    g.fillRect(MID_X, 600, MID_W, 110);
    texture(c, S, 2, { mottle: 0.06, dark: 0.05, light: 0.035, glow: { x: KEY[0] - MID_X, y: KEY[1], r: 640, amount: 0.14, color: [255, 160, 90] } });
    return c;
  }

  const STREET_FIRES = [[1360, 380, 44], [262, 628, 30]];

  function drawCar(g, x, base) {
    const body = [34, 18, 18];
    poly(g, [[x, base - 18], [x + 8, base - 52], [x + 70, base - 58], [x + 104, base - 96], [x + 200, base - 98], [x + 240, base - 60], [x + 300, base - 54], [x + 306, base - 20], [x + 296, base - 8], [x + 10, base - 8]]);
    g.fillStyle = rgb(body);
    g.fill();
    g.fillStyle = 'rgb(18,10,12)';
    poly(g, [[x + 112, base - 88], [x + 150, base - 90], [x + 150, base - 62], [x + 92, base - 60]]);
    g.fill();
    poly(g, [[x + 158, base - 90], [x + 196, base - 90], [x + 228, base - 62], [x + 158, base - 62]]);
    g.fill();
    for (const wx of [x + 62, x + 244]) {
      g.fillStyle = 'rgb(14,8,10)';
      g.beginPath();
      g.arc(wx, base - 10, 26, Math.PI, 0);
      g.fill();
      g.fillStyle = 'rgb(46,30,28)';
      g.beginPath();
      g.ellipse(wx, base - 4, 18, 8, 0, 0, TAU);
      g.fill();
    }
    g.strokeStyle = 'rgba(232,120,56,0.6)';
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(x + 104, base - 96);
    g.lineTo(x + 200, base - 98);
    g.lineTo(x + 240, base - 60);
    g.lineTo(x + 300, base - 54);
    g.lineTo(x + 306, base - 22);
    g.stroke();
    g.fillStyle = 'rgba(40,20,20,0.5)';
    g.beginPath();
    g.ellipse(x + 150, base - 4, 170, 9, 0, 0, TAU);
    g.fill();
  }

  function drawBuilding(g) {
    const x0 = 1180, x1 = 1560, top = 150, base = 704;
    ruin(g, {
      x0, x1, base, top,
      grad: hgrad(g, x0, x1, [[0, 'rgb(52,26,24)'], [0.6, 'rgb(70,34,28)'], [1, 'rgb(96,46,32)']]),
      body: [64, 32, 28], lit: [236, 124, 58], seed: 'bldg', jag: 0.18, floors: 138, rebar: 8, rimW: 2.5,
    });
    const rw = LIB.rng(sd('bldg-win'));
    for (let row = 0; row < 3; row++) {
      for (let k = 0; k < 3; k++) {
        const wx = x0 + 40 + k * 112 + rw.range(-4, 4), wy = 210 + row * 136;
        if (row === 0 && k === 2) continue;
        const burning = row === 1 && k === 1;
        g.fillStyle = burning ? vgrad(g, wy, wy + 80, [[0, 'rgb(170,60,28)'], [1, 'rgb(244,140,54)']]) : 'rgb(20,10,12)';
        poly(g, [[wx, wy + rw.range(0, 6)], [wx + 64, wy], [wx + 66, wy + 84], [wx + rw.range(-2, 4), wy + 86]]);
        g.fill();
        g.fillStyle = 'rgba(14,8,10,0.35)';
        g.beginPath();
        g.ellipse(wx + 32, wy + 20, 50, 30, 0, Math.PI, 0);
        g.fill();
      }
    }
    g.fillStyle = 'rgb(12,7,9)';
    poly(g, [[1300, base], [1300, 560], [1316, 548], [1374, 548], [1388, 562], [1388, base]]);
    g.fill();
    g.fillStyle = 'rgba(236,124,58,0.35)';
    g.fillRect(1386, 562, 3, base - 562);
    const rp = LIB.rng(sd('pocks'));
    for (let i = 0; i < 60; i++) {
      const px = rp.range(x0 + 10, x1 - 20), py = rp.range(top + 80, base - 10);
      g.fillStyle = 'rgba(16,8,10,0.6)';
      g.beginPath();
      g.arc(px, py, rp.range(1.5, 3.5), 0, TAU);
      g.fill();
      g.fillStyle = 'rgba(236,140,80,0.25)';
      g.beginPath();
      g.arc(px + 1.5, py - 1, 1.2, 0, TAU);
      g.fill();
    }
  }

  function drawRoad(g) {
    const x0 = STREET_X0, x1 = STREET_X0 + STREET_W;
    const BW = [48, 24, 24];
    const backs = [[-60, 160, 560], [150, 420, 600], [430, 600, 540], [610, 840, 590], [850, 1080, 560], [1090, 1190, 600]];
    backs.forEach(([a, b, top], i) => ruin(g, { x0: a, x1: b, base: 706, top, body: mix(BW, [70, 34, 30], (i % 2) * 0.35), lit: [236, 124, 58], seed: 'back' + i, jag: 0.5, holes: i % 2 ? [1, 2] : null, glow: 0.2, rebar: 3, rimW: 2 }));
    drawBuilding(g);
    drawCar(g, 120, 712);
    g.fillStyle = vgrad(g, 700, H, [[0, 'rgb(92,38,30)'], [0.15, 'rgb(70,28,26)'], [0.5, 'rgb(46,18,20)'], [1, 'rgb(22,10,12)']]);
    g.fillRect(x0, 700, STREET_W, H - 700);
    g.fillStyle = hgrad(g, x0, x1, [[0, 'rgba(20,10,12,0.3)'], [0.5, 'rgba(20,10,12,0)'], [1, 'rgba(236,124,58,0.16)']]);
    g.fillRect(x0, 700, STREET_W, H - 700);
    g.fillStyle = 'rgb(70,38,32)';
    g.fillRect(x0, 702, STREET_W, 10);
    g.fillStyle = 'rgba(236,130,64,0.4)';
    g.fillRect(x0, 702, STREET_W, 1.5);
    g.fillStyle = 'rgba(14,8,10,0.45)';
    g.fillRect(x0, 712, STREET_W, 5);
    const rl = LIB.rng(sd('line'));
    for (let x = x0; x < x1; x += 120) {
      if (rl() < 0.3) continue;
      g.fillStyle = `rgba(210,180,120,${rl.range(0.12, 0.25)})`;
      g.fillRect(x, 846, rl.range(40, 70), 4);
    }
    g.strokeStyle = 'rgba(14,8,10,0.45)';
    g.lineWidth = 1.4;
    const rc = LIB.rng(sd('cracks'));
    for (let i = 0; i < 26; i++) {
      let x = rc.range(x0, x1), y = rc.range(730, 1060);
      g.beginPath();
      g.moveTo(x, y);
      for (let k = 0; k < 5; k++) {
        x += rc.range(-30, 30);
        y += rc.range(-6, 6);
        g.lineTo(x, y);
      }
      g.stroke();
    }
    for (const [cx, cy, rx] of [[520, 930, 90], [980, 760, 60], [60, 1010, 110]]) {
      const gr = g.createRadialGradient(cx, cy, 0, cx, cy, rx);
      gr.addColorStop(0, 'rgba(12,6,8,0.55)');
      gr.addColorStop(0.7, 'rgba(12,6,8,0.2)');
      gr.addColorStop(1, 'rgba(12,6,8,0)');
      g.fillStyle = gr;
      g.save();
      g.translate(cx, cy);
      g.scale(1, 0.25);
      g.translate(-cx, -cy);
      g.fillRect(cx - rx, cy - rx, rx * 2, rx * 2);
      g.restore();
    }
    g.save();
    g.translate(760, 980);
    g.scale(1, 0.18);
    const pg = g.createRadialGradient(0, 0, 0, 0, 0, 120);
    pg.addColorStop(0, 'rgba(232,120,60,0.35)');
    pg.addColorStop(1, 'rgba(232,120,60,0)');
    g.fillStyle = pg;
    g.beginPath();
    g.arc(0, 0, 120, 0, TAU);
    g.fill();
    g.restore();
    const RB = [70, 36, 30], RL = [236, 130, 64];
    for (const [cx, w, h, s] of [[-10, 160, 40, 1], [460, 130, 30, 2], [700, 90, 22, 3], [990, 150, 36, 4], [1120, 100, 26, 5]]) rubble(g, cx, 720, w, h, 'st' + s, RB, RL);
    const rd = LIB.rng(sd('debris'));
    for (let i = 0; i < 90; i++) {
      const x = rd.range(x0, x1), y = rd.range(730, 1070);
      const s = rd.range(2, 6) * (0.6 + 0.6 * (y - 720) / 350);
      g.fillStyle = rd() < 0.5 ? 'rgba(90,48,38,0.9)' : 'rgba(40,22,22,0.9)';
      poly(g, [[x - s, y], [x - s * 0.3, y - s * 0.7], [x + s, y - s * 0.3], [x + s * 0.6, y + s * 0.4]]);
      g.fill();
      g.fillStyle = 'rgba(236,130,64,0.3)';
      g.fillRect(x, y - s * 0.6, s * 0.7, 1.2);
    }
    g.strokeStyle = 'rgb(40,26,24)';
    g.lineWidth = 7;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(560, 742);
    g.quadraticCurveTo(700, 730, 820, 748);
    g.stroke();
    g.strokeStyle = 'rgba(236,130,64,0.45)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(560, 739);
    g.quadraticCurveTo(700, 727, 820, 745);
    g.stroke();
    g.fillStyle = 'rgb(22,14,14)';
    g.beginPath();
    g.ellipse(1040, 1000, 46, 14, -0.05, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(48,30,28)';
    g.beginPath();
    g.ellipse(1040, 998, 22, 6, -0.05, 0, TAU);
    g.fill();
  }

  function buildStreet(S) {
    const { c, g } = makeLayer(S, 1, STREET_W, H);
    g.translate(-STREET_X0, 0);
    drawRoad(g);
    texture(c, S, 3, { mottle: 0.07, dark: 0.06, light: 0.04, glow: { x: KEY[0] + 300 - STREET_X0, y: KEY[1], r: 900, amount: 0.12, color: [255, 160, 90] } });
    return c;
  }

  function buildFront(S) {
    const { c, g } = makeLayer(S, 1, STREET_W, H);
    g.translate(-STREET_X0, 0);
    const { x0, x1, top, base } = BARRICADE;
    poly(g, [[x0 - 30, base], [x0 + 14, top - 30], [x0 + 70, top - 20], [x0 + 60, base]]);
    g.fillStyle = hgrad(g, x0 - 30, x0 + 70, [[0, 'rgb(46,26,24)'], [1, 'rgb(84,44,34)']]);
    g.fill();
    g.strokeStyle = 'rgba(236,130,64,0.5)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x0 + 14, top - 30);
    g.lineTo(x0 + 70, top - 20);
    g.lineTo(x0 + 60, base);
    g.stroke();
    sandbagWall(g, x0 + 30, x1, base, top, 'front', [118, 92, 62], [240, 150, 80]);
    rubble(g, x0 + 20, base + 4, 140, 22, 'barr', [62, 34, 30], [236, 130, 64]);
    rubble(g, x1 - 20, base + 4, 120, 18, 'barr2', [62, 34, 30], [236, 130, 64]);
    g.fillStyle = 'rgba(14,8,10,0.4)';
    g.beginPath();
    g.ellipse((x0 + x1) / 2 - 20, base + 4, (x1 - x0) * 0.6, 10, 0, 0, TAU);
    g.fill();
    rubble(g, 40, 1090, 240, 50, 'fg1', [30, 16, 18], [200, 100, 50]);
    texture(c, S, 4, { mottle: 0.07, dark: 0.06, light: 0.04 });
    return c;
  }

  function buildLee(S) {
    const { c, g } = makeLayer(S);
    const back = LEE_GROUND - 120;
    ruin(g, {
      x0: 430, x1: 1120, base: back, top: 230,
      grad: vgrad(g, 230, back, [[0, 'rgb(36,16,18)'], [0.5, 'rgb(54,24,24)'], [1, 'rgb(66,30,28)']]),
      body: [52, 22, 22], lit: [236, 124, 58], seed: 'lee-wall', jag: 0.14, floors: 170, holes: [2, 4], glow: 0.3, rebar: 7, rimW: 2.5,
    });
    g.fillStyle = hgrad(g, 430, 1120, [[0, 'rgba(10,6,8,0.3)'], [0.6, 'rgba(10,6,8,0)'], [1, 'rgba(236,124,58,0.18)']]);
    g.fillRect(430, 230, 690, back - 230);
    g.fillStyle = 'rgb(12,7,9)';
    poly(g, [[880, back], [880, 520], [896, 506], [966, 506], [980, 522], [980, back]]);
    g.fill();
    g.fillStyle = 'rgba(236,124,58,0.32)';
    g.fillRect(978, 522, 3, back - 522);
    for (const [x, y] of [[520, 470], [700, 330], [1000, 360]]) {
      const gr = g.createRadialGradient(x, y, 0, x, y, 90);
      gr.addColorStop(0, 'rgba(10,6,8,0.45)');
      gr.addColorStop(1, 'rgba(10,6,8,0)');
      g.fillStyle = gr;
      g.fillRect(x - 90, y - 90, 180, 180);
    }
    const rp = LIB.rng(sd('lee-pocks'));
    for (let i = 0; i < 50; i++) {
      const px = rp.range(450, 1080), py = rp.range(300, back - 10);
      g.fillStyle = 'rgba(14,6,8,0.6)';
      g.beginPath();
      g.arc(px, py, rp.range(1.5, 3.2), 0, TAU);
      g.fill();
      g.fillStyle = 'rgba(236,140,80,0.22)';
      g.beginPath();
      g.arc(px + 1.4, py - 1, 1.1, 0, TAU);
      g.fill();
    }
    g.fillStyle = vgrad(g, back - 4, H, [[0, 'rgb(84,36,30)'], [0.3, 'rgb(62,28,26)'], [1, 'rgb(26,12,14)']]);
    g.fillRect(0, back - 4, W, H - back + 4);
    g.fillStyle = 'rgba(12,6,8,0.5)';
    g.fillRect(430, back - 4, 690, 8);
    g.fillStyle = hgrad(g, 0, W, [[0, 'rgba(14,6,8,0.3)'], [0.6, 'rgba(14,6,8,0)'], [1, 'rgba(236,124,58,0.14)']]);
    g.fillRect(0, back - 4, W, H - back + 4);
    const rd = LIB.rng(sd('lee-debris'));
    for (let i = 0; i < 14; i++) {
      const x = rd.range(380, W), y = rd.range(back + 30, 1040);
      const w = rd.range(40, 90) * (0.6 + 0.6 * (y - back) / 300), h = w * 0.18;
      g.fillStyle = 'rgba(96,44,36,0.55)';
      poly(g, [[x, y], [x + w, y - h * 0.3], [x + w * 0.9, y + h], [x + w * 0.05, y + h * 1.1]]);
      g.fill();
      g.fillStyle = 'rgba(236,130,64,0.18)';
      g.fillRect(x + 2, y - 1, w * 0.85, 1.4);
    }
    for (let i = 0; i < 80; i++) {
      const x = rd.range(0, W), y = rd.range(back + 10, 1070);
      const s = rd.range(2, 6) * (0.6 + 0.6 * (y - 740) / 330);
      g.fillStyle = rd() < 0.5 ? 'rgba(92,42,34,0.9)' : 'rgba(34,16,16,0.9)';
      poly(g, [[x - s, y], [x - s * 0.3, y - s * 0.7], [x + s, y - s * 0.3], [x + s * 0.6, y + s * 0.4]]);
      g.fill();
    }
    for (const [x, y, w, h] of [[700, back, 110, 58], [720, back - 58, 80, 52]]) {
      g.fillStyle = 'rgb(58,46,30)';
      g.fillRect(x, y - h, w, h);
      g.fillStyle = 'rgba(236,140,70,0.32)';
      g.fillRect(x + w - 6, y - h, 6, h);
      g.fillStyle = 'rgba(14,8,10,0.45)';
      g.fillRect(x, y - h * 0.55, w, 2);
      g.fillStyle = 'rgba(14,8,10,0.35)';
      g.fillRect(x - 6, y - 2, w + 10, 5);
    }
    rubble(g, 470, back + 8, 120, 24, 'lee-r1', [70, 32, 28], [236, 130, 64]);
    texture(c, S, 5, { mottle: 0.07, dark: 0.06, light: 0.04, glow: { x: KEY[0], y: KEY[1], r: 700, amount: 0.12, color: [255, 160, 90] } });
    return c;
  }

  function buildLeeFront(S) {
    const { c, g } = makeLayer(S);
    const { x0, x1, top } = LEE_WALL;
    const base = LEE_GROUND + 14;
    const conc = top + 92;
    poly(g, [[x0, base], [x0, conc - 6], [x0 + 120, conc - 14], [x0 + 260, conc - 4], [x1 - 10, conc + 6], [x1 + 14, conc + 40], [x1 + 8, base]]);
    g.fillStyle = hgrad(g, x0, x1 + 14, [[0, 'rgb(30,14,16)'], [0.75, 'rgb(48,22,22)'], [1, 'rgb(92,42,32)']]);
    g.fill();
    g.fillStyle = vgrad(g, conc, base, [[0, 'rgba(10,6,8,0)'], [1, 'rgba(10,6,8,0.5)']]);
    g.fill();
    g.strokeStyle = 'rgba(10,6,8,0.6)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(140, conc + 10);
    g.lineTo(170, conc + 70);
    g.lineTo(150, conc + 120);
    g.lineTo(190, base - 10);
    g.moveTo(300, conc + 20);
    g.lineTo(280, conc + 90);
    g.stroke();
    g.strokeStyle = 'rgba(236,130,64,0.55)';
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(x1 - 10, conc + 6);
    g.lineTo(x1 + 14, conc + 40);
    g.lineTo(x1 + 8, base);
    g.stroke();
    sandbagWall(g, x0 - 20, x1 + 10, conc + 8, top, 'lee', [112, 86, 58], [244, 150, 80], 1.35);
    rubble(g, x1 + 40, base + 4, 120, 28, 'lee-r2', [44, 20, 20], [236, 130, 64]);
    rubble(g, 1000, H + 30, 260, 70, 'lee-fg', [24, 12, 14], [190, 96, 48]);
    texture(c, S, 6, { mottle: 0.07, dark: 0.06, light: 0.04 });
    return c;
  }

  function buildClose(S, far, mid) {
    const { c, g } = makeLayer(S);
    g.save();
    if ('filter' in g) g.filter = 'blur(7px)';
    g.drawImage(far, FAR_X, -40, FAR_W, H);
    g.drawImage(mid, MID_X, -10, MID_W, H);
    g.restore();
    g.filter = 'none';
    const top = 640;
    g.fillStyle = vgrad(g, top, H, [[0, 'rgb(120,58,38)'], [0.12, 'rgb(92,46,34)'], [0.5, 'rgb(62,32,28)'], [1, 'rgb(30,16,18)']]);
    g.fillRect(0, top, W, H - top);
    g.fillStyle = hgrad(g, 0, W, [[0, 'rgba(20,10,12,0.35)'], [0.55, 'rgba(20,10,12,0)'], [1, 'rgba(240,130,64,0.2)']]);
    g.fillRect(0, top, W, H - top);
    const r = LIB.rng(sd('close-grit'));
    for (let i = 0; i < 260; i++) {
      const v = Math.pow(r(), 1.6);
      const y = top + 6 + v * (H - top);
      const x = r.range(-20, W + 20);
      const s = 1.2 + v * 14 * r.range(0.4, 1);
      g.fillStyle = r() < 0.5 ? 'rgba(104,56,42,0.95)' : 'rgba(40,22,22,0.95)';
      poly(g, [[x - s, y], [x - s * 0.4, y - s * 0.6], [x + s * 0.8, y - s * 0.4], [x + s, y + s * 0.2], [x, y + s * 0.35]]);
      g.fill();
      g.fillStyle = 'rgba(240,140,70,0.35)';
      poly(g, [[x - s * 0.4, y - s * 0.6], [x + s * 0.8, y - s * 0.4], [x + s * 0.4, y - s * 0.1]]);
      g.fill();
    }
    g.strokeStyle = 'rgba(14,8,10,0.6)';
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(300, 700);
    g.lineTo(260, 760);
    g.lineTo(290, 830);
    g.lineTo(200, 960);
    g.lineTo(230, 1080);
    g.stroke();
    g.save();
    if ('filter' in g) g.filter = 'blur(5px)';
    rubble(g, 80, 1110, 300, 120, 'close-fg', [26, 14, 16], [180, 90, 46]);
    rubble(g, 1040, 1100, 240, 90, 'close-fg2', [26, 14, 16], [180, 90, 46]);
    g.restore();
    g.filter = 'none';
    texture(c, S, 7, { mottle: 0.06, dark: 0.05, light: 0.035, glow: { x: KEY[0], y: KEY[1], r: 700, amount: 0.12, color: [255, 160, 90] } });
    return c;
  }

  const buildSmoke = (S) =>
    LOOK.mist(S, {
      bands: [[360, 140, 0.55], [640, 80, 0.5]],
      color: SMOKE,
      extra: 900,
      noise: { sx: 260, sy: 90, oy: 7, oct: 3, gain: 1.8, bias: 0.25 },
    });

  function buildAir(S) {
    const shafts = LOOK.beamField({
      beams: [[180, 70, 0.5], [380, 110, 0.7], [620, 60, 0.45], [820, 90, 0.5]],
      dir: [0.42, 0.91],
      noise: { base: 0.7, amp: 0.5, scale: 8, offset: 5, row: 3.5 },
      fall: (X, Y) => sstep(120, 420, Y) * (1 - sstep(760, 1000, Y)) * sstep(100, 700, X) * 0.4,
      clamp: false,
    });
    const glow = LOOK.glowField({ x: KEY[0], y: KEY[1], r: 520, amount: 0.5 });
    return LOOK.lightLayer(S, { fields: [shafts, glow], color: [255, 140, 70] });
  }

  function buildGrade(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = 'rgb(255,255,255)';
    g.fillRect(0, 0, W, H);
    const vg = g.createRadialGradient(W * 0.68, H * 0.6, 160, W * 0.6, H * 0.58, 900);
    vg.addColorStop(0, 'rgba(255,255,255,0)');
    vg.addColorStop(0.55, 'rgba(160,96,96,0.4)');
    vg.addColorStop(1, 'rgba(60,24,30,0.9)');
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);
    return c;
  }

  let CACHE = null;
  function statics(S) {
    if (CACHE && CACHE.S === S) return CACHE;
    const far = buildFar(S);
    const mid = buildMid(S);
    CACHE = {
      S,
      far,
      mid,
      street: buildStreet(S),
      front: buildFront(S),
      lee: buildLee(S),
      leeFront: buildLeeFront(S),
      close: buildClose(S, far, mid),
      smoke: buildSmoke(S),
      air: buildAir(S),
      grade: buildGrade(S),
    };
    return CACHE;
  }

  function fires(ctx, t, list) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    list.forEach(([x, y, rad], i) => {
      const f = 0.55 + 0.25 * Math.sin(t * 9.1 + i * 2.3) + 0.2 * Math.sin(t * 23.7 + i * 5.1);
      const gr = ctx.createRadialGradient(x, y, 0, x, y, rad * (1 + 0.15 * f));
      gr.addColorStop(0, `rgba(255,170,80,${0.5 * f})`);
      gr.addColorStop(0.45, `rgba(230,96,40,${0.22 * f})`);
      gr.addColorStop(1, 'rgba(200,70,30,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(x - rad * 1.2, y - rad * 1.2, rad * 2.4, rad * 2.4);
    });
    ctx.restore();
  }

  function drawFar(ctx, C, t) {
    ctx.drawImage(C.far, FAR_X, 0, FAR_W, H);
  }
  function drawMid(ctx, C, t) {
    ctx.drawImage(C.mid, MID_X, 0, MID_W, H);
    fires(ctx, t, MID_FIRES.map(([x, y, r]) => [x + MID_X, y, r]));
  }
  function drawStreet(ctx, C, t) {
    ctx.drawImage(C.street, STREET_X0, 0, STREET_W, H);
    fires(ctx, t || 0, STREET_FIRES);
  }
  function drawFront(ctx, C) {
    ctx.drawImage(C.front, STREET_X0, 0, STREET_W, H);
  }
  function drawLee(ctx, C, t) {
    ctx.drawImage(C.lee, 0, 0, W, H);
  }
  function drawLeeFront(ctx, C) {
    ctx.drawImage(C.leeFront, 0, 0, W, H);
  }
  function drawClose(ctx, C, t) {
    ctx.drawImage(C.close, 0, 0, W, H);
  }
  function drawSmoke(ctx, C, t, alpha, y) {
    LOOK.drawMist(ctx, C.smoke, { x: -500 - 14 * t, y: y || 0, alpha: alpha == null ? 0.6 : alpha });
  }
  function drawAir(ctx, C, t, alpha) {
    LOOK.drawLight(ctx, C.air, { x: 6 * Math.sin(t * 0.4), alpha: (alpha == null ? 0.7 : alpha) * (0.92 + 0.08 * Math.sin(t * 7.3) * Math.sin(t * 2.1)) });
  }
  function drawGrade(ctx, C) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(C.grade, 0, 0, W, H);
    ctx.restore();
  }

  const FAR_SPOTS = [[60, 600], [140, 586], [230, 610], [340, 596], [520, 604], [610, 590], [700, 612]];
  function farFlashes(ctx, t, o) {
    o = o || {};
    const spots = o.spots || FAR_SPOTS;
    const rate = o.rate || 7;
    const k = Math.floor(t * rate);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let j = 0; j < 3; j++) {
      const h = LIB.hash(ID, 'ff', k, j) >>> 0;
      if ((h & 3) === 0) continue;
      const [x, y] = spots[h % spots.length];
      const a = 1 - (t * rate - k);
      const gr = ctx.createRadialGradient(x, y, 0, x, y, 9);
      gr.addColorStop(0, `rgba(255,236,190,${0.9 * a})`);
      gr.addColorStop(0.4, `rgba(255,170,90,${0.5 * a})`);
      gr.addColorStop(1, 'rgba(255,140,60,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(x - 9, y - 9, 18, 18);
    }
    ctx.restore();
  }

  function embers(ctx, t, o) {
    o = o || {};
    LOOK.particles(ctx, t, {
      seed: sd('embers', o.seed || 0), count: o.count || 40, area: o.area || [-40, -40, W + 80, H + 80], vel: [-22, -46], spread: 0.5, sway: 14, swayHz: 0.4,
      size: [1.2, 3], alpha: [0.35, 0.9],
      draw: (g, p) => {
        const fl = 0.6 + 0.4 * Math.sin(t * 11 + p.u * 40);
        g.fillStyle = p.v < 0.7 ? `rgba(255,${150 + 60 * p.u | 0},70,${p.alpha * fl})` : `rgba(60,40,40,${p.alpha * 0.8})`;
        g.fillRect(p.x, p.y, p.size, p.size);
      },
    });
  }

  function puff(ctx, x, y, age, o) {
    if (age < 0 || age > 0.8) return;
    const s = (o && o.size) || 1;
    const u = age / 0.8;
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.45;
      const d = (10 + 26 * Math.sqrt(u)) * s;
      const px = x + Math.cos(a) * d * 0.8, py = y + Math.sin(a) * d - 10 * u * s;
      const r = (6 + 16 * u) * s;
      ctx.fillStyle = `rgba(150,104,80,${0.55 * (1 - u)})`;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, TAU);
      ctx.fill();
    }
    if (age < 0.08) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,200,120,0.8)';
      ctx.beginPath();
      ctx.arc(x, y, 4 * s, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function spark(ctx, x, y, age, o) {
    if (age < 0 || age > 0.3) return;
    o = o || {};
    const s = o.size || 1;
    const u = age / 0.3;
    const r = LIB.rng(sd('spark', o.seed || 0));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const a = (o.dir == null ? Math.PI : o.dir) + r.range(-1.3, 1.3);
      const v = r.range(60, 140) * s;
      const d0 = v * u, d1 = v * u + r.range(10, 26) * s * (1 - u);
      ctx.strokeStyle = `rgba(255,${200 + r.range(0, 50) | 0},120,${1 - u})`;
      ctx.lineWidth = 2 * s * (1 - 0.5 * u);
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * d0, y + Math.sin(a) * d0 + 30 * u * u);
      ctx.lineTo(x + Math.cos(a) * d1, y + Math.sin(a) * d1 + 30 * u * u);
      ctx.stroke();
    }
    const gr = ctx.createRadialGradient(x, y, 0, x, y, 30 * s);
    gr.addColorStop(0, `rgba(255,220,150,${0.8 * (1 - u)})`);
    gr.addColorStop(1, 'rgba(255,160,80,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(x - 30 * s, y - 30 * s, 60 * s, 60 * s);
    ctx.restore();
  }

  FILM.sets = Object.assign(FILM.sets || {}, {
    outpost: {
      statics, drawFar, drawMid, drawStreet, drawFront, drawLee, drawLeeFront, drawClose, drawSmoke, drawAir, drawGrade,
      fires, farFlashes, embers, puff, spark,
      GROUND, LEE_GROUND, KEY, SHADOW_K, STREET_X0, STREET_W, BARRICADE, LEE_WALL, HORIZON,
    },
  });
})();
