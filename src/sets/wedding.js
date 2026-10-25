// sets/wedding.js: procedural set (background, props and light) shared by the scenes.
(function () {
  'use strict';

  const ID = 'set-wedding';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { sstep, vgrad, hgrad, poly, makeLayer, TAU } = LOOK;
  const W = 1080;
  const H = 1080;
  const texture = (c, S, n, o) => LOOK.texture(c, S, Object.assign({ seed: sd('tex', n), offset: n * 17.3 }, o));

  const LIMO = { len: 600, wheelR: 28, wheels: [-206, 206], rear: [-296, -60] };

  function rrect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.lineTo(x + w - r, y);
    g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r);
    g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h);
    g.quadraticCurveTo(x, y + h, x, y + h - r);
    g.lineTo(x, y + r);
    g.quadraticCurveTo(x, y, x + r, y);
    g.closePath();
  }

  function drawLimo(g, x, y, s, night) {
    const P = night
      ? { top: 'rgb(150,160,196)', mid: 'rgb(118,128,168)', low: 'rgb(78,86,124)', glass: ['rgb(28,32,56)', 'rgb(44,50,84)'], chrome: 'rgb(170,180,210)', rim: 'rgba(210,222,255,0.55)', sign: 'rgb(196,200,222)', ink: 'rgb(150,96,130)', light: 'rgba(255,226,160,0.9)' }
      : { top: 'rgb(255,246,234)', mid: 'rgb(242,228,218)', low: 'rgb(196,176,190)', glass: ['rgb(52,44,62)', 'rgb(96,78,92)'], chrome: 'rgb(236,220,200)', rim: 'rgba(255,214,150,0.75)', sign: 'rgb(255,250,242)', ink: 'rgb(196,92,112)', light: 'rgba(255,244,214,0.95)' };
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    g.fillStyle = vgrad(g, -110, -26, [[0, P.top], [0.45, P.mid], [1, P.low]]);
    g.beginPath();
    g.moveTo(-284, -30);
    g.lineTo(-294, -50);
    g.quadraticCurveTo(-296, -94, -270, -100);
    g.lineTo(-206, -104);
    g.lineTo(150, -106);
    g.quadraticCurveTo(206, -100, 266, -92);
    g.quadraticCurveTo(294, -86, 294, -62);
    g.lineTo(290, -30);
    g.closePath();
    g.fill();
    g.fillStyle = vgrad(g, -152, -104, [[0, P.top], [1, P.mid]]);
    g.beginPath();
    g.moveTo(-218, -104);
    g.quadraticCurveTo(-206, -146, -178, -150);
    g.lineTo(104, -150);
    g.quadraticCurveTo(128, -148, 166, -105);
    g.closePath();
    g.fill();
    const yt = -143, yb = -108;
    const panes = [[-202, -158], [-150, -46], [-38, 58], [66, 154]];
    panes.forEach(([x0, x1], i) => {
      g.fillStyle = vgrad(g, yt, yb, [[0, P.glass[1]], [1, P.glass[0]]]);
      g.beginPath();
      if (i === 0) {
        g.moveTo(x0, yb);
        g.quadraticCurveTo(x0 + 8, yt + 3, x0 + 26, yt);
        g.lineTo(x1, yt);
        g.lineTo(x1, yb);
      } else if (i === 3) {
        g.moveTo(x0, yb);
        g.lineTo(x0, yt);
        g.lineTo(x0 + 30, yt);
        g.quadraticCurveTo(x0 + 56, yt + 4, x1, yb);
      } else {
        g.rect(x0, yt, x1 - x0, yb - yt);
      }
      g.closePath();
      g.fill();
    });
    g.fillStyle = night ? 'rgba(170,190,240,0.18)' : 'rgba(255,214,170,0.3)';
    for (const [a, b] of [[-110, -88], [10, 26], [104, 116]]) {
      poly(g, [[a, yt], [b, yt], [b - 20, yb], [a - 20, yb]]);
      g.fill();
    }
    g.strokeStyle = P.rim;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(-176, -149);
    g.lineTo(104, -149);
    g.quadraticCurveTo(128, -147, 166, -105);
    g.quadraticCurveTo(210, -99, 268, -91);
    g.quadraticCurveTo(292, -85, 292, -62);
    g.stroke();
    g.fillStyle = P.chrome;
    g.fillRect(-290, -74, 582, 4);
    rrect(g, -300, -50, 22, 14, 5);
    g.fill();
    rrect(g, 280, -52, 22, 14, 5);
    g.fill();
    g.strokeStyle = night ? 'rgba(40,44,70,0.35)' : 'rgba(150,120,130,0.35)';
    g.lineWidth = 1.5;
    for (const sx of [-154, -42, 62, 158]) {
      g.beginPath();
      g.moveTo(sx, -104);
      g.lineTo(sx + 2, -40);
      g.stroke();
    }
    g.fillStyle = night ? 'rgb(30,32,48)' : 'rgb(70,56,66)';
    for (const wx of LIMO.wheels) {
      g.beginPath();
      g.arc(wx, -30, 36, Math.PI, TAU);
      g.closePath();
      g.fill();
    }
    g.fillStyle = P.light;
    rrect(g, 280, -86, 12, 11, 4);
    g.fill();
    g.fillStyle = night ? 'rgb(150,50,60)' : 'rgb(214,70,70)';
    rrect(g, -296, -92, 8, 16, 3);
    g.fill();
    g.save();
    g.translate(-244, -82);
    g.rotate(-0.05);
    g.fillStyle = 'rgba(60,40,50,0.18)';
    rrect(g, -38, -12, 80, 28, 4);
    g.fill();
    g.fillStyle = P.sign;
    rrect(g, -40, -15, 80, 28, 4);
    g.fill();
    g.fillStyle = P.ink;
    g.font = 'italic bold 13px Georgia, "Times New Roman", serif';
    g.textAlign = 'center';
    g.fillText('Just Married', 0, 4);
    g.restore();
    g.restore();
  }

  function drawWheel(ctx, x, y, r, ang, night) {
    ctx.save();
    ctx.translate(x, y - r);
    ctx.fillStyle = night ? 'rgb(22,22,34)' : 'rgb(46,38,44)';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.fillStyle = night ? 'rgb(140,150,180)' : 'rgb(226,214,204)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = night ? 'rgb(90,98,130)' : 'rgb(160,140,140)';
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.rotate(ang);
    for (let i = 0; i < 5; i++) {
      ctx.rotate(TAU / 5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r * 0.5, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  const NIGHT = { HORIZON: 586, MOON: [806, 168], MOON_R: 34, WINDOW: { x0: 400, x1: 442, y0: 562, y1: 614 } };
  const SHORE_Y = 770;

  function buildNightFar(S) {
    const { c, g } = makeLayer(S);
    const HZ = NIGHT.HORIZON;
    g.fillStyle = vgrad(g, 0, HZ, [[0, 'rgb(16,22,52)'], [0.45, 'rgb(34,44,90)'], [0.82, 'rgb(70,72,124)'], [1, 'rgb(122,98,136)']]);
    g.fillRect(0, 0, W, HZ + 2);
    LOOK.haze(g, { x: 80, y: HZ, r: 520, stops: [[0, 'rgba(214,140,140,0.45)'], [0.5, 'rgba(160,110,150,0.18)'], [1, 'rgba(160,110,150,0)']] });
    LOOK.haze(g, { x: NIGHT.MOON[0], y: NIGHT.MOON[1], r: 460, stops: [[0, 'rgba(206,220,255,0.5)'], [0.25, 'rgba(160,180,236,0.2)'], [1, 'rgba(120,140,210,0)']] });
    const rs = LIB.rng(sd('stars'));
    for (let i = 0; i < 170; i++) {
      const x = rs() * W, y = Math.pow(rs(), 1.4) * (HZ - 60);
      const dm = Math.hypot(x - NIGHT.MOON[0], y - NIGHT.MOON[1]);
      if (dm < 90) continue;
      const a = (0.25 + 0.6 * rs()) * (1 - sstep(HZ - 220, HZ - 40, y));
      g.fillStyle = `rgba(236,240,255,${a})`;
      const r = rs() < 0.1 ? 1.7 : 0.6 + 0.6 * rs();
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
    }
    for (const [x, y, rx, ry, a] of [[640, 236, 220, 7, 0.22], [930, 120, 160, 5, 0.18], [300, 300, 260, 6, 0.14], [880, 330, 200, 6, 0.16]]) {
      g.fillStyle = `rgba(170,182,230,${a})`;
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0, 0, TAU);
      g.fill();
    }
    const [mx, my] = NIGHT.MOON;
    const R = NIGHT.MOON_R;
    g.fillStyle = 'rgb(248,246,232)';
    g.beginPath();
    g.arc(mx, my, R, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(190,196,214,0.45)';
    for (const [dx, dy, r] of [[-10, -6, 9], [8, 10, 7], [12, -12, 5]]) {
      g.beginPath();
      g.arc(mx + dx, my + dy, r, 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgb(54,58,98)';
    g.beginPath();
    g.moveTo(-20, HZ + 2);
    g.bezierCurveTo(60, HZ - 52, 150, HZ - 70, 250, HZ - 26);
    g.bezierCurveTo(300, HZ - 12, 330, HZ - 4, 380, HZ + 2);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(255,214,150,0.85)';
    g.fillRect(118, HZ - 42, 2.5, 2.5);
    g.fillRect(176, HZ - 46, 2, 2);
    g.fillStyle = vgrad(g, HZ, H, [[0, 'rgb(64,74,124)'], [0.25, 'rgb(40,56,100)'], [1, 'rgb(22,36,70)']]);
    g.fillRect(0, HZ, W, H - HZ);
    const rm = LIB.rng(sd('moonpath'));
    for (let i = 0; i < 260; i++) {
      const k = Math.pow(rm(), 1.5);
      const y = HZ + 3 + k * 300;
      const spread = 16 + 120 * k;
      const x = mx + (rm() - 0.5) * 2 * spread * (0.4 + 0.6 * rm());
      const a = (0.25 + 0.5 * rm()) * (1 - 0.6 * k);
      g.fillStyle = `rgba(226,232,255,${a})`;
      g.fillRect(x, y, 6 + 26 * rm() * (0.4 + k), 1 + 1.6 * k);
    }
    for (let i = 0; i < 26; i++) {
      const y = HZ + 8 + Math.pow(i / 26, 1.6) * 300;
      g.fillStyle = `rgba(120,140,200,${0.06 + 0.06 * (i % 2)})`;
      g.fillRect(0, y, W, 1 + i * 0.06);
    }
    texture(c, S, 1, { mottle: 0.045, dark: 0.04, light: 0.03 });
    return c;
  }

  function buildNightMid(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = vgrad(g, SHORE_Y - 20, H, [[0, 'rgb(96,96,132)'], [0.4, 'rgb(84,82,116)'], [1, 'rgb(62,60,92)']]);
    poly(g, [[-20, SHORE_Y - 40], [W + 20, SHORE_Y - 2], [W + 20, H + 20], [-20, H + 20]]);
    g.fill();
    g.strokeStyle = 'rgba(214,226,255,0.55)';
    g.lineWidth = 2.2;
    g.beginPath();
    for (let x = -20; x <= W + 20; x += 10) {
      const y = SHORE_Y - 40 + (x + 20) * (38 / (W + 40)) + 3 * Math.sin(x * 0.03) + 2 * Math.sin(x * 0.011 + 1);
      if (x === -20) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    g.fillStyle = 'rgba(150,170,220,0.18)';
    poly(g, [[-20, SHORE_Y - 36], [W + 20, SHORE_Y + 2], [W + 20, SHORE_Y + 22], [-20, SHORE_Y - 16]]);
    g.fill();
    g.fillStyle = 'rgba(206,214,250,0.16)';
    g.beginPath();
    g.ellipse(NIGHT.MOON[0] - 20, SHORE_Y + 40, 110, 10, 0, 0, TAU);
    g.fill();
    g.fillStyle = vgrad(g, 640, H, [[0, 'rgb(104,100,132)'], [1, 'rgb(70,64,94)']]);
    g.beginPath();
    g.moveTo(-20, 660);
    g.bezierCurveTo(200, 654, 520, 668, 680, 742);
    g.bezierCurveTo(760, 780, 860, 830, 1100, 860);
    g.lineTo(1100, H + 20);
    g.lineTo(-20, H + 20);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(190,200,240,0.35)';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(-20, 661);
    g.bezierCurveTo(200, 655, 520, 669, 680, 743);
    g.bezierCurveTo(760, 781, 860, 831, 1100, 861);
    g.stroke();
    for (const [x, y, rx, ry] of [[860, 900, 260, 26], [620, 980, 300, 30], [960, 1010, 220, 20]]) {
      g.fillStyle = 'rgba(40,40,70,0.18)';
      g.beginPath();
      g.ellipse(x - 20, y + 8, rx, ry, 0, 0, TAU);
      g.fill();
      g.fillStyle = 'rgba(170,176,220,0.12)';
      g.beginPath();
      g.ellipse(x + 30, y - 6, rx * 0.7, ry * 0.5, 0, 0, TAU);
      g.fill();
    }
    texture(c, S, 2, { mottle: 0.06, dark: 0.05, light: 0.035 });
    return c;
  }

  const HOTEL = { x0: 150, x1: 560, base: 760, floor: 650, eave: 540, ridge: 420 };

  function buildNightNear(S) {
    const { c, g } = makeLayer(S);
    const { x0, x1, base, floor, eave, ridge } = HOTEL;
    const mid = (x0 + x1) / 2;
    g.fillStyle = vgrad(g, eave, base, [[0, 'rgb(150,158,196)'], [1, 'rgb(118,124,166)']]);
    poly(g, [[x1, eave], [x1 + 70, eave + 18], [x1 + 70, base - 8], [x1, base]]);
    g.fill();
    g.fillStyle = 'rgb(84,86,120)';
    poly(g, [[x1, eave], [mid + 6, ridge], [mid + 76, ridge + 16], [x1 + 76, eave + 18]]);
    g.fill();
    g.fillStyle = hgrad(g, x0, x1, [[0, 'rgb(104,112,152)'], [0.6, 'rgb(130,138,178)'], [1, 'rgb(150,158,196)']]);
    g.fillRect(x0, eave, x1 - x0, base - eave);
    g.fillStyle = 'rgba(40,44,76,0.16)';
    for (let y = eave + 8; y < base; y += 11) g.fillRect(x0, y, x1 - x0, 1.4);
    g.fillStyle = vgrad(g, ridge, eave + 8, [[0, 'rgb(70,70,104)'], [1, 'rgb(50,50,80)']]);
    poly(g, [[x0 - 22, eave + 8], [mid, ridge], [x1 + 22, eave + 8]]);
    g.fill();
    g.fillStyle = 'rgba(160,170,220,0.22)';
    poly(g, [[mid, ridge], [x1 + 22, eave + 8], [x1 + 8, eave + 8], [mid, ridge + 12]]);
    g.fill();
    g.strokeStyle = 'rgba(30,30,56,0.25)';
    g.lineWidth = 1.2;
    for (let y = ridge + 22; y < eave + 6; y += 12) {
      const k = (y - ridge) / (eave + 8 - ridge);
      g.beginPath();
      g.moveTo(mid - k * (mid - x0 + 22), y);
      g.lineTo(mid + k * (x1 + 22 - mid), y);
      g.stroke();
    }
    g.fillStyle = 'rgb(86,70,96)';
    g.fillRect(x1 - 96, ridge + 6, 26, 60);
    g.fillStyle = 'rgb(110,96,124)';
    g.fillRect(x1 - 100, ridge + 2, 34, 8);
    g.fillStyle = 'rgb(36,40,70)';
    g.beginPath();
    g.arc(mid, ridge + 66, 15, 0, TAU);
    g.fill();
    g.strokeStyle = 'rgb(176,182,214)';
    g.lineWidth = 3;
    g.stroke();
    const WY = eave + 22, WH = 52, WW = 42;
    const wxs = [x0 + 30, x0 + 110, x0 + 250, x0 + 330];
    wxs.forEach((wx) => {
      const lit = wx === NIGHT.WINDOW.x0;
      g.fillStyle = 'rgb(186,192,222)';
      g.fillRect(wx - 5, WY - 5, WW + 10, WH + 10);
      if (lit) {
        g.fillStyle = vgrad(g, WY, WY + WH, [[0, 'rgb(255,226,160)'], [1, 'rgb(246,180,108)']]);
        g.fillRect(wx, WY, WW, WH);
        g.fillStyle = 'rgba(214,120,96,0.75)';
        g.fillRect(wx, WY, 9, WH);
        g.fillRect(wx + WW - 9, WY, 9, WH);
        g.fillStyle = 'rgba(255,246,214,0.9)';
        g.beginPath();
        g.arc(wx + WW * 0.68, WY + WH * 0.62, 6, 0, TAU);
        g.fill();
      } else {
        g.fillStyle = vgrad(g, WY, WY + WH, [[0, 'rgb(46,52,90)'], [1, 'rgb(30,34,64)']]);
        g.fillRect(wx, WY, WW, WH);
        g.fillStyle = 'rgba(190,200,250,0.18)';
        poly(g, [[wx + 8, WY], [wx + 18, WY], [wx + 4, WY + WH], [wx - 6 + 6, WY + WH]]);
        g.fill();
      }
      g.fillStyle = lit ? 'rgba(120,70,40,0.6)' : 'rgb(186,192,222)';
      g.fillRect(wx + WW / 2 - 1.5, WY, 3, WH);
      g.fillRect(wx, WY + WH / 2 - 1.5, WW, 3);
      g.fillStyle = 'rgb(70,96,120)';
      g.fillRect(wx - 16, WY - 3, 10, WH + 6);
      g.fillRect(wx + WW + 6, WY - 3, 10, WH + 6);
    });
    g.fillStyle = 'rgb(60,62,96)';
    poly(g, [[x0 - 30, floor + 8], [x0 - 10, floor - 18], [x1 + 10, floor - 18], [x1 + 30, floor + 8]]);
    g.fill();
    g.fillStyle = 'rgb(170,176,212)';
    g.fillRect(x0 - 30, floor + 6, x1 - x0 + 60, 8);
    g.save();
    g.font = 'bold 13px Georgia, "Times New Roman", serif';
    g.textAlign = 'center';
    if ('letterSpacing' in g) g.letterSpacing = '4px';
    g.fillStyle = 'rgb(60,62,96)';
    g.fillText('SHORE INN', mid, floor + 2);
    g.restore();
    for (const wx of [x0 + 34, x0 + 114, x0 + 254, x0 + 334]) {
      g.fillStyle = 'rgb(40,46,80)';
      g.fillRect(wx, floor + 34, 40, 56);
      g.fillStyle = 'rgba(190,200,250,0.14)';
      g.fillRect(wx + 4, floor + 34, 8, 56);
    }
    g.fillStyle = 'rgb(70,60,90)';
    g.fillRect(mid - 26, floor + 30, 52, base - floor - 30);
    g.fillStyle = 'rgba(255,214,150,0.45)';
    g.fillRect(mid - 18, floor + 40, 36, 22);
    g.fillStyle = 'rgb(176,182,216)';
    for (const px of [x0 - 20, x0 + 90, mid - 40, mid + 40, x1 - 90, x1 + 20]) g.fillRect(px - 4, floor + 14, 8, base - floor - 14);
    g.fillRect(x0 - 24, base - 40, mid - 64 - x0 + 24, 5);
    g.fillRect(mid + 44, base - 40, x1 + 24 - mid - 44, 5);
    for (let x = x0 - 18; x < x1 + 20; x += 14) {
      if (x > mid - 44 && x < mid + 44) continue;
      g.fillRect(x, base - 36, 3, 34);
    }
    g.fillStyle = 'rgb(50,44,60)';
    g.fillRect(mid + 32, floor + 44, 12, 18);
    g.fillStyle = 'rgb(255,214,140)';
    g.fillRect(mid + 34, floor + 47, 8, 12);
    g.fillStyle = 'rgb(120,120,156)';
    g.fillRect(x0 - 34, base - 4, x1 - x0 + 68, 8);
    g.fillStyle = 'rgb(140,140,176)';
    g.fillRect(mid - 40, base + 4, 80, 8);
    g.fillRect(mid - 48, base + 12, 96, 8);
    drawLimo(g, 756, 806, 0.34, true);
    for (const wx of LIMO.wheels) drawWheel(g, 756 + wx * 0.34, 806, LIMO.wheelR * 0.34, 0.4, true);
    g.fillStyle = 'rgba(20,20,40,0.35)';
    g.beginPath();
    g.ellipse(746, 808, 100, 6, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(150,144,176,0.5)';
    poly(g, [[mid - 50, base + 20], [mid + 50, base + 20], [mid + 150, H + 20], [mid - 10, H + 20]]);
    g.fill();
    g.fillStyle = 'rgb(120,124,160)';
    for (let x = -10; x < x0 - 40; x += 16) g.fillRect(x, 742 - (x % 3), 5, 40);
    g.fillRect(-10, 756, x0 - 50, 4);
    const rg = LIB.rng(sd('grass'));
    const tuft = (cx, cy, n, hgt, col) => {
      g.strokeStyle = col;
      g.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (rg() - 0.5) * 1.2;
        const len = hgt * (0.5 + 0.5 * rg());
        g.lineWidth = 1.6 + 1.6 * rg();
        g.beginPath();
        g.moveTo(cx + (rg() - 0.5) * 24, cy);
        g.quadraticCurveTo(cx + Math.cos(a) * len * 0.5, cy + Math.sin(a) * len * 0.6, cx + Math.cos(a) * len + (rg() - 0.3) * 12, cy + Math.sin(a) * len);
        g.stroke();
      }
    };
    for (const [x, y, n, hgt] of [[60, 790, 14, 50], [620, 776, 10, 36], [880, 860, 12, 40], [40, 1060, 24, 130], [190, 1080, 20, 110], [980, 1070, 26, 140], [1060, 1000, 16, 90], [760, 1076, 14, 80]]) {
      tuft(x, y, n, hgt, y > 900 ? 'rgb(36,40,64)' : 'rgb(80,84,118)');
    }
    texture(c, S, 3, { mottle: 0.07, dark: 0.06, light: 0.04, glow: { x: NIGHT.WINDOW.x0 + 20, y: NIGHT.WINDOW.y0 + 20, r: 260, amount: 0.12, color: [255, 214, 160] } });
    return c;
  }

  function buildNightLight(S) {
    const wx = NIGHT.WINDOW.x0 + 21, wy = HOTEL.eave + 48;
    return LOOK.lightLayer(S, {
      fields: [
        LOOK.glowField({ x: wx, y: wy, r: 130, amount: 0.55 }),
        LOOK.glowField({ x: wx, y: wy + 90, r: 260, amount: 0.12 }),
        LOOK.glowField({ x: (HOTEL.x0 + HOTEL.x1) / 2 + 38, y: HOTEL.floor + 52, r: 60, amount: 0.45 }),
      ],
      color: [255, 206, 140],
    });
  }
  function buildMoonLight(S) {
    return LOOK.lightLayer(S, {
      fields: [
        LOOK.glowField({ x: NIGHT.MOON[0], y: NIGHT.MOON[1], r: 200, amount: 0.4 }),
        LOOK.beamField({ beams: [[690, 50, 0.16], [770, 80, 0.22], [880, 46, 0.14]], dir: [0.8, 0.6], noise: { base: 0.8, amp: 0.4, scale: 8, offset: 5, row: 3.5 }, fall: (X, Y) => sstep(140, 300, Y) * (1 - sstep(400, 860, Y)) }),
      ],
      color: [190, 206, 255],
    });
  }

  let CACHE = null;
  function statics(S) {
    if (CACHE && CACHE.S === S) return CACHE;
    CACHE = {
      S,
      nightFar: buildNightFar(S),
      nightMid: buildNightMid(S),
      nightNear: buildNightNear(S),
      nightLight: buildNightLight(S),
      moonLight: buildMoonLight(S),
      mist: LOOK.mist(S, { bands: [[NIGHT.HORIZON + 4, 26, 0.5], [SHORE_Y - 30, 40, 0.25]], color: [150, 160, 210] }),
    };
    return CACHE;
  }

  const TWINKLE = (() => {
    const r = LIB.rng(sd('twinkle'));
    const out = [];
    while (out.length < 9) {
      const x = 40 + r() * 1000, y = 30 + r() * 360;
      if (Math.hypot(x - NIGHT.MOON[0], y - NIGHT.MOON[1]) < 120) continue;
      if (x > HOTEL.x0 - 40 && x < HOTEL.x1 + 80 && y > HOTEL.ridge - 20) continue;
      out.push([x, y, r() * TAU, 0.6 + r() * 0.9]);
    }
    return out;
  })();

  function drawHotel(ctx, t, dur, S) {
    const C = statics(S);
    const focus = [NIGHT.WINDOW.x0 + 21, NIGHT.WINDOW.y0 + 30];
    const cam = (d) => LOOK.camera(ctx, { t, dur, focus, push: 0.035, depth: d });
    ctx.save();
    cam(0.25);
    ctx.drawImage(C.nightFar, 0, 0, W, H);
    ctx.fillStyle = 'rgba(236,240,255,0.5)';
    for (let i = 0; i < 22; i++) {
      const k = LIB.h3(i, 3, 7);
      const y = NIGHT.HORIZON + 6 + k * k * 200;
      const ph = Math.sin(t * (1.4 + LIB.h3(i, 5, 7)) + i * 2.1);
      if (ph < 0.2) continue;
      const x = NIGHT.MOON[0] + (LIB.h3(i, 9, 7) - 0.5) * (30 + 180 * k);
      ctx.globalAlpha = (ph - 0.2) * 0.9;
      ctx.fillRect(x, y, 10 + 20 * k, 1.4 + k);
    }
    ctx.globalAlpha = 1;
    for (const [x, y, ph, sp] of TWINKLE) {
      const a = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * sp * 2.2 + ph));
      LOOK.glint(ctx, { x, y, size: 5, alpha: a, rot: 0 });
    }
    ctx.restore();
    ctx.save();
    cam(0.55);
    LOOK.drawMist(ctx, C.mist, { x: -120 + 10 * t, alpha: 0.5 });
    ctx.drawImage(C.nightMid, 0, 0, W, H);
    ctx.restore();
    ctx.save();
    cam(1);
    ctx.drawImage(C.nightNear, 0, 0, W, H);
    ctx.restore();
    ctx.save();
    cam(0.7);
    LOOK.drawLight(ctx, C.moonLight, { x: 4 * Math.sin(t * 0.3), alpha: 0.55 });
    ctx.restore();
    ctx.save();
    cam(1);
    LOOK.drawLight(ctx, C.nightLight, { alpha: 0.85 + 0.06 * Math.sin(t * 1.7) + 0.03 * Math.sin(t * 5.3) });
    ctx.restore();
  }

  FILM.sets = Object.assign(FILM.sets || {}, {
    wedding: { statics, drawHotel, drawLimo, drawWheel, LIMO, NIGHT, HOTEL, rrect },
  });
})();
