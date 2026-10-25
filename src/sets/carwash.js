// sets/carwash.js: procedural set (background, props and light) shared by the scenes.
(function () {
  'use strict';

  const ID = 'set-carwash';
  const LIB = FILM.lib, LOOK = FILM.look;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { makeLayer, poly, vgrad, hgrad, sstep, fbm, vn } = LOOK;
  const TAU = Math.PI * 2;
  const W = 1080, H = 1080;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

  const SUN = [900, -260];
  const HORIZON = 590;
  const GROUND = 870;
  const BLD = { x0: 236, x1: 1130, roof: 300, fascia: 384, base: 846 };
  const OFFICE = { x0: 236, x1: 522 };
  const BAY1 = { x0: 540, x1: 790, y0: 448 };
  const BAY2 = { x0: 826, x1: 1076, y0: 448 };
  const SIGN = { x: 150, cx: 170, cy: 196, w: 300, h: 168, poleTop: 300 };
  const CAL = { x0: 250, y0: 436, x1: 380, y1: 576 };
  const CAR = { x0: 520, x1: 1044, wheels: [612, 944], r: 42 };
  const SHADOW_K = [0.22, -0.1];

  const SKY = [214, 236, 238];
  const col = (c, hz, a) => LOOK.col(c, hz, a, SKY);
  const texture = (c, S, n, o) => LOOK.texture(c, S, Object.assign({ seed: sd('tex', n), offset: n * 17.3 }, o));

  const toScreen = (f, p) => [(p[0] - f.c[0]) * f.z + 540, (p[1] - f.c[1]) * f.z + 540];
  function apply(ctx, f) {
    ctx.translate(540, 540);
    ctx.scale(f.z, f.z);
    ctx.translate(-f.c[0], -f.c[1]);
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

  function drawFar(g) {
    g.fillStyle = vgrad(g, -300, HORIZON, [[0, 'rgb(96,170,196)'], [0.35, 'rgb(134,196,210)'], [0.7, 'rgb(196,226,226)'], [1, 'rgb(236,238,222)']]);
    g.fillRect(-400, -400, W + 800, HORIZON + 420);
    LOOK.haze(g, { x: SUN[0], y: SUN[1], r: 1100, stops: [[0, 'rgba(255,252,236,0.95)'], [0.25, 'rgba(255,248,226,0.55)'], [0.6, 'rgba(255,244,220,0.18)'], [1, 'rgba(255,244,220,0)']] });
    const CL = [[60, 70, 120, 38, 0.75], [330, 40, 90, 26, 0.6], [640, 120, 150, 40, 0.7], [960, 190, 110, 30, 0.6], [470, 250, 70, 16, 0.45], [-60, 300, 130, 22, 0.5]];
    for (const [x, y, rx, ry, a] of CL) {
      for (let k = 0; k < 5; k++) {
        const ox = (k - 2) * rx * 0.36, oy = -Math.abs(k - 2) * -ry * 0.18 - (k % 2) * ry * 0.4;
        g.fillStyle = `rgba(255,255,250,${a * 0.7})`;
        g.beginPath();
        g.ellipse(x + ox, y + oy, rx * 0.42, ry * (0.8 + 0.2 * (k % 2)), 0, 0, TAU);
        g.fill();
      }
      g.fillStyle = `rgba(176,206,216,${a * 0.35})`;
      g.beginPath();
      g.ellipse(x, y + ry * 0.55, rx * 0.95, ry * 0.32, 0, 0, TAU);
      g.fill();
    }
    const hill = (base, amp, sc, seed, top, bot) => {
      g.beginPath();
      g.moveTo(-400, H + 300);
      for (let x = -400; x <= W + 400; x += 6) g.lineTo(x, base - amp * fbm(x * sc + seed, seed * 0.37, 3));
      g.lineTo(W + 400, H + 300);
      g.closePath();
      g.fillStyle = vgrad(g, base - amp, HORIZON + 20, [[0, top], [1, bot]]);
      g.fill();
    };
    hill(560, 120, 1 / 420, 7, 'rgb(170,204,206)', 'rgb(210,224,214)');
    hill(578, 70, 1 / 260, 19, 'rgb(140,184,170)', 'rgb(186,208,186)');
    g.beginPath();
    g.moveTo(-400, HORIZON + 30);
    for (let x = -400; x <= W + 400; x += 4) g.lineTo(x, HORIZON - 14 - 26 * Math.pow(vn(x / 22 + 3, 5), 2) - 10 * vn(x / 70, 9));
    g.lineTo(W + 400, HORIZON + 30);
    g.closePath();
    g.fillStyle = vgrad(g, HORIZON - 60, HORIZON + 20, [[0, 'rgb(112,160,124)'], [1, 'rgb(150,182,140)']]);
    g.fill();
    g.fillStyle = 'rgb(170,190,150)';
    g.fillRect(-400, HORIZON + 4, W + 800, 60);
    g.fillStyle = 'rgb(196,198,192)';
    g.fillRect(-400, HORIZON + 20, W + 800, 22);
    g.fillStyle = 'rgba(250,246,226,0.7)';
    for (let x = -380; x < W + 400; x += 70) g.fillRect(x, HORIZON + 30, 30, 2);
    g.strokeStyle = 'rgba(110,130,130,0.35)';
    g.lineWidth = 1.2;
    for (const x of [-120, 420, 960]) {
      g.fillStyle = 'rgba(120,128,124,0.45)';
      g.fillRect(x, HORIZON - 120, 4, 140);
      g.fillRect(x - 16, HORIZON - 116, 36, 3);
    }
    g.beginPath();
    g.moveTo(-400, HORIZON - 108);
    for (let x = -120; x <= 1500; x += 540) g.quadraticCurveTo(x - 270, HORIZON - 96, x + 2, HORIZON - 114);
    g.stroke();
  }

  const TEAL = [38, 150, 160], TEAL_D = [22, 96, 108], CREAM = [242, 234, 214], RED = [214, 66, 58], YEL = [250, 204, 72];
  const rgb = (c, k) => `rgb(${Math.round(c[0] * (k || 1))},${Math.round(c[1] * (k || 1))},${Math.round(c[2] * (k || 1))})`;

  function drawBuilding(g) {
    const { x0, x1, roof, fascia, base } = BLD;
    g.fillStyle = vgrad(g, fascia, base, [[0, 'rgb(236,226,204)'], [1, 'rgb(220,206,182)']]);
    g.fillRect(x0, fascia, x1 - x0, base - fascia);
    g.fillStyle = 'rgb(250,248,236)';
    g.fillRect(x0 - 18, roof - 8, x1 - x0 + 36, 10);
    g.fillStyle = vgrad(g, roof, fascia, [[0, rgb(TEAL, 1.1)], [1, rgb(TEAL, 0.86)]]);
    g.fillRect(x0 - 18, roof + 2, x1 - x0 + 36, fascia - roof - 2);
    g.fillStyle = 'rgb(246,244,232)';
    g.fillRect(x0 - 18, roof + 56, x1 - x0 + 36, 6);
    g.fillStyle = rgb(RED);
    g.fillRect(x0 - 18, roof + 64, x1 - x0 + 36, 4);
    g.save();
    g.font = 'bold 34px Helvetica, Arial, sans-serif';
    g.textAlign = 'center';
    if ('letterSpacing' in g) g.letterSpacing = '8px';
    g.fillStyle = 'rgba(10,50,56,0.5)';
    g.fillText('AUTO WASH  ·  WAX', 602, roof + 45);
    g.fillStyle = 'rgb(250,248,236)';
    g.fillText('AUTO WASH  ·  WAX', 600, roof + 43);
    g.restore();
    g.fillStyle = vgrad(g, fascia, fascia + 46, [[0, 'rgba(40,60,70,0.42)'], [1, 'rgba(40,60,70,0)']]);
    g.fillRect(x0, fascia, x1 - x0, 46);
    g.fillStyle = vgrad(g, 780, base, [[0, rgb(TEAL, 0.95)], [1, rgb(TEAL_D)]]);
    g.fillRect(x0, 780, x1 - x0, base - 780);
    g.fillStyle = 'rgba(250,250,240,0.45)';
    g.fillRect(x0, 780, x1 - x0, 3);
    for (const [i, b] of [BAY1, BAY2].entries()) drawBay(g, b, i);
    g.save();
    g.font = 'bold 18px Helvetica, Arial, sans-serif';
    g.textAlign = 'center';
    for (const [i, b] of [BAY1, BAY2].entries()) {
      const cx = (b.x0 + b.x1) / 2;
      g.fillStyle = rgb(YEL);
      rrect(g, cx - 34, b.y0 - 34, 68, 24, 5);
      g.fill();
      g.fillStyle = rgb(TEAL_D);
      g.fillText('BAY ' + (i + 1), cx, b.y0 - 15);
    }
    g.restore();
    drawOffice(g);
    g.fillStyle = 'rgba(60,70,86,0.18)';
    g.fillRect(x0, fascia, 18, base - fascia);
    g.fillStyle = 'rgb(96,104,108)';
    g.fillRect(x0, base - 6, x1 - x0, 8);
  }

  function drawBay(g, b, i) {
    const { x0, x1, y0 } = b;
    const y1 = BLD.base;
    g.fillStyle = vgrad(g, y0, y1, [[0, 'rgb(26,64,74)'], [0.5, 'rgb(34,86,96)'], [1, 'rgb(50,112,118)']]);
    g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = 'rgba(160,220,224,0.07)';
    for (let x = x0 + 8; x < x1; x += 28) g.fillRect(x, y0 + 10, 24, y1 - y0 - 60);
    const ax0 = x0 + 34, ax1 = x1 - 34, ay = y0 + 58;
    g.fillStyle = 'rgb(70,104,116)';
    g.fillRect(ax0, ay, 12, y1 - ay - 18);
    g.fillRect(ax1 - 12, ay, 12, y1 - ay - 18);
    g.fillRect(ax0, ay, ax1 - ax0, 14);
    g.fillStyle = 'rgba(190,230,236,0.35)';
    g.fillRect(ax0 + 2, ay + 2, ax1 - ax0 - 4, 3);
    g.fillStyle = 'rgb(160,196,204)';
    for (let x = ax0 + 20; x < ax1 - 14; x += 22) g.fillRect(x, ay + 14, 4, 6);
    const bx = i === 0 ? x0 + 70 : x1 - 92;
    for (let y = ay + 26; y < y1 - 30; y += 14) {
      g.fillStyle = ((y - ay) / 14) % 2 < 1 ? 'rgb(64,124,190)' : 'rgb(196,72,80)';
      rrect(g, bx, y, 22, 12, 5);
      g.fill();
    }
    g.fillStyle = 'rgba(10,30,40,0.35)';
    g.fillRect(bx + 15, ay + 26, 7, y1 - ay - 56);
    for (let x = x0 + 4, k = 0; x < x1 - 4; x += 15, k++) {
      const len = 70 + 16 * LIB.h3(k, i, 3);
      g.fillStyle = k % 3 === 0 ? 'rgba(120,200,210,0.75)' : k % 3 === 1 ? 'rgba(80,150,200,0.7)' : 'rgba(150,220,220,0.65)';
      poly(g, [[x, y0], [x + 12, y0], [x + 11, y0 + len], [x + 1, y0 + len + 4]]);
      g.fill();
    }
    g.fillStyle = 'rgb(54,86,96)';
    g.fillRect(x0, y0, x1 - x0, 8);
    g.fillStyle = 'rgba(190,236,236,0.22)';
    for (let k = 0; k < 5; k++) {
      g.beginPath();
      g.ellipse(x0 + 40 + k * 44, y1 - 12 - (k % 2) * 6, 26, 3, 0, 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgba(255,250,236,0.55)';
    g.fillRect(x1 - 5, y0, 5, y1 - y0);
    g.fillStyle = 'rgba(20,40,50,0.4)';
    g.fillRect(x0, y0, 6, y1 - y0);
    g.fillStyle = vgrad(g, y0, y0 + 120, [[0, 'rgba(10,30,40,0.45)'], [1, 'rgba(10,30,40,0)']]);
    g.fillRect(x0, y0, x1 - x0, 120);
  }

  function drawOffice(g) {
    const { x0, x1 } = OFFICE;
    const wx0 = 406, wx1 = 506, wy0 = 470, wy1 = 640;
    g.fillStyle = 'rgb(250,248,236)';
    g.fillRect(wx0 - 7, wy0 - 7, wx1 - wx0 + 14, wy1 - wy0 + 14);
    g.fillStyle = vgrad(g, wy0, wy1, [[0, 'rgb(120,170,184)'], [1, 'rgb(70,110,124)']]);
    g.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
    g.fillStyle = 'rgba(244,240,224,0.85)';
    for (let y = wy0; y < wy0 + 64; y += 7) g.fillRect(wx0, y, wx1 - wx0, 4.5);
    g.fillStyle = 'rgba(230,246,246,0.35)';
    poly(g, [[wx0 + 40, wy0 + 64], [wx0 + 64, wy0 + 64], [wx0 + 20, wy1], [wx0 - 4, wy1]]);
    g.fill();
    g.fillStyle = 'rgb(236,226,200)';
    g.fillRect(wx0 - 10, wy1 + 6, wx1 - wx0 + 20, 8);
    g.fillStyle = 'rgb(246,240,220)';
    g.fillRect(wx0 + 30, wy0 + 96, 40, 18);
    g.fillStyle = 'rgb(200,52,48)';
    g.font = 'bold 12px Helvetica, Arial, sans-serif';
    g.textAlign = 'center';
    g.fillText('OPEN', wx0 + 50, wy0 + 109);
    g.fillStyle = 'rgb(70,96,104)';
    g.beginPath();
    g.arc(300, 720, 34, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(44,150,96)';
    g.beginPath();
    g.arc(300, 720, 28, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(30,110,70)';
    for (let r = 8; r < 28; r += 5) {
      g.strokeStyle = 'rgba(16,70,44,0.5)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.arc(300, 720, r, 0, TAU);
      g.stroke();
    }
    g.fillStyle = 'rgb(80,90,96)';
    g.fillRect(262, 716, 8, 10);
    g.fillRect(266, 700, 6, 40);
    drawCalendarPage(g);
    void x0; void x1;
  }

  function drawCalendarPage(g) {
    const { x0, y0, x1, y1 } = CAL;
    const w = x1 - x0, h = y1 - y0;
    g.strokeStyle = 'rgba(60,50,40,0.7)';
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(x0 + w * 0.3, y0);
    g.lineTo(x0 + w / 2, y0 - 12);
    g.lineTo(x0 + w * 0.7, y0);
    g.stroke();
    g.fillStyle = 'rgb(90,80,70)';
    g.beginPath();
    g.arc(x0 + w / 2, y0 - 12, 2.4, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(70,64,60,0.22)';
    g.fillRect(x0 - 3, y0 + 4, w, h);
    g.fillStyle = 'rgb(252,250,240)';
    g.fillRect(x0, y0, w, h);
    const ph = h * 0.36;
    g.fillStyle = vgrad(g, y0, y0 + ph, [[0, 'rgb(110,190,206)'], [1, 'rgb(220,236,226)']]);
    g.fillRect(x0 + 4, y0 + 4, w - 8, ph - 4);
    g.fillStyle = 'rgb(214,70,60)';
    rrect(g, x0 + 24, y0 + ph - 22, w - 48, 14, 6);
    g.fill();
    g.fillStyle = 'rgb(214,70,60)';
    rrect(g, x0 + 38, y0 + ph - 32, w - 80, 14, 6);
    g.fill();
    g.fillStyle = 'rgb(40,40,48)';
    for (const x of [x0 + 38, x1 - 38]) {
      g.beginPath();
      g.arc(x, y0 + ph - 8, 6, 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgba(255,255,250,0.85)';
    g.beginPath();
    g.arc(x1 - 22, y0 + 18, 9, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(70,70,80)';
    for (let x = x0 + 10; x < x1 - 6; x += 12) g.fillRect(x, y0 + ph, 3, 5);
    g.fillStyle = 'rgb(200,52,48)';
    g.fillRect(x0 + 4, y0 + ph + 6, w - 8, 14);
    g.save();
    g.fillStyle = 'rgb(255,250,240)';
    g.font = 'bold 10px Helvetica, Arial, sans-serif';
    g.textAlign = 'center';
    if ('letterSpacing' in g) g.letterSpacing = '3px';
    g.fillText('JUNE', x0 + w / 2, y0 + ph + 17);
    g.restore();
    const gx0 = x0 + 5, gy0 = y0 + ph + 24, cw = (w - 10) / 7, chh = (y1 - 5 - gy0) / 5;
    g.strokeStyle = 'rgba(120,110,100,0.45)';
    g.lineWidth = 0.8;
    for (let c = 0; c <= 7; c++) {
      g.beginPath();
      g.moveTo(gx0 + c * cw, gy0);
      g.lineTo(gx0 + c * cw, gy0 + 5 * chh);
      g.stroke();
    }
    for (let r = 0; r <= 5; r++) {
      g.beginPath();
      g.moveTo(gx0, gy0 + r * chh);
      g.lineTo(gx0 + 7 * cw, gy0 + r * chh);
      g.stroke();
    }
    g.fillStyle = 'rgba(60,54,50,0.85)';
    g.font = '6px Helvetica, Arial, sans-serif';
    g.textAlign = 'left';
    for (let d = 1; d <= 30; d++) {
      const p = calCell(d);
      g.fillText(String(d), p.x + 1.5, p.y + 6.5);
    }
    g.strokeStyle = 'rgb(206,48,44)';
    g.lineWidth = 1.3;
    for (let d = 1; d <= 30; d++) {
      if (!isFriday(d)) continue;
      const p = calCell(d);
      g.beginPath();
      g.ellipse(p.x + cw / 2, p.y + chh * 0.6, cw * 0.44, chh * 0.36, -0.1, 0, TAU);
      g.stroke();
      g.fillStyle = 'rgb(206,48,44)';
      g.font = 'bold 6px Helvetica, Arial, sans-serif';
      g.textAlign = 'center';
      g.fillText('$00', p.x + cw / 2, p.y + chh * 0.75);
    }
  }

  const CAL_START = 1;
  const isFriday = (d) => (d - 1 + CAL_START) % 7 === 5;
  function calCell(d) {
    const { x0, y0, x1, y1 } = CAL;
    const w = x1 - x0, h = y1 - y0;
    const ph = h * 0.36;
    const gx0 = x0 + 5, gy0 = y0 + ph + 24, cw = (w - 10) / 7, chh = (y1 - 5 - gy0) / 5;
    const i = d - 1 + CAL_START;
    return { x: gx0 + (i % 7) * cw, y: gy0 + Math.floor(i / 7) * chh, w: cw, h: chh };
  }

  function drawCalendarMarks(ctx, days, o) {
    o = o || {};
    const n = Math.min(30, days);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = o.color || 'rgba(196,40,40,0.9)';
    ctx.lineWidth = o.lw || 1.5;
    for (let d = 1; d <= Math.ceil(n); d++) {
      const p = calCell(d);
      const k = clamp01(n - (d - 1));
      const m = 1.4;
      const a = clamp01(k * 2), b = clamp01(k * 2 - 1);
      ctx.beginPath();
      ctx.moveTo(p.x + m, p.y + m);
      ctx.lineTo(p.x + m + (p.w - 2 * m) * a, p.y + m + (p.h - 2 * m) * a);
      if (b > 0) {
        ctx.moveTo(p.x + p.w - m, p.y + m);
        ctx.lineTo(p.x + p.w - m - (p.w - 2 * m) * b, p.y + m + (p.h - 2 * m) * b);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSign(g) {
    const { x, cx, cy, w, h, poleTop } = SIGN;
    for (const px of [x - 40, x + 40]) {
      g.fillStyle = hgrad(g, px - 6, px + 6, [[0, 'rgb(86,104,112)'], [0.6, 'rgb(150,170,176)'], [0.8, 'rgb(220,230,228)'], [1, 'rgb(120,136,140)']]);
      g.fillRect(px - 5, poleTop - 20, 10, BLD.base + 10 - poleTop);
    }
    const L = cx - w / 2, T = cy - h / 2;
    g.fillStyle = 'rgba(30,60,70,0.25)';
    rrect(g, L - 6, T + 8, w, h, 26);
    g.fill();
    g.fillStyle = rgb(TEAL_D);
    rrect(g, L - 4, T - 4, w + 8, h + 8, 28);
    g.fill();
    g.fillStyle = rgb(TEAL);
    rrect(g, L, T, w, h, 24);
    g.fill();
    g.fillStyle = vgrad(g, T, T + h, [[0, 'rgb(255,252,240)'], [1, 'rgb(240,232,212)']]);
    rrect(g, L + 14, T + 14, w - 28, h - 64, 16);
    g.fill();
    g.save();
    g.textAlign = 'center';
    g.font = 'italic bold 37px Georgia, "Times New Roman", serif';
    g.fillStyle = 'rgba(20,90,100,0.55)';
    g.fillText('Clean & Shine', cx + 2, T + 72);
    g.fillStyle = rgb(RED);
    g.fillText('Clean & Shine', cx, T + 70);
    g.font = 'bold 13px Helvetica, Arial, sans-serif';
    if ('letterSpacing' in g) g.letterSpacing = '4px';
    g.fillStyle = 'rgb(30,110,120)';
    g.fillText('SINCE 1979', cx, T + 96);
    g.restore();
    g.fillStyle = rgb(YEL);
    rrect(g, L + 30, T + h - 42, w - 60, 30, 10);
    g.fill();
    g.fillStyle = 'rgba(160,110,20,0.35)';
    g.fillRect(L + 34, T + h - 16, w - 68, 3);
    g.save();
    g.textAlign = 'center';
    g.font = 'bold 22px Helvetica, Arial, sans-serif';
    if ('letterSpacing' in g) g.letterSpacing = '7px';
    g.fillStyle = rgb(TEAL_D);
    g.fillText('CAR WASH', cx + 4, T + h - 19);
    g.restore();
    const sx = L + w - 16, sy = T + 6;
    g.fillStyle = 'rgb(255,236,140)';
    g.beginPath();
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 - Math.PI / 2;
      const r = k % 2 === 0 ? 30 : 8;
      g.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r);
    }
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(255,252,236,0.6)';
    rrect(g, L + 20, T - 3, w - 40, 5, 2);
    g.fill();
  }

  const BULBS = (() => {
    const { cx, cy, w, h } = SIGN;
    const out = [];
    const L = cx - w / 2 + 7, T = cy - h / 2 + 7, R = cx + w / 2 - 7, B = cy + h / 2 - 7;
    for (let x = L + 14; x <= R - 14; x += 19) out.push([x, T], [x, B]);
    for (let y = T + 20; y <= B - 20; y += 19) out.push([L, y], [R, y]);
    return out;
  })();

  function drawSignBulbs(ctx, t, o) {
    o = o || {};
    const step = Math.floor(t * 10);
    const pop = clamp01(o.pop || 0);
    ctx.save();
    for (let i = 0; i < BULBS.length; i++) {
      const [x, y] = BULBS[i];
      const on = (i + step) % 3 === 0 ? 1 : 0.15;
      const a = Math.max(on, pop);
      ctx.fillStyle = `rgba(150,110,60,0.5)`;
      ctx.beginPath();
      ctx.arc(x, y, 3.6, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(255,${Math.round(214 + 30 * a)},${Math.round(120 + 90 * a)},${0.35 + 0.65 * a})`;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, TAU);
      ctx.fill();
      if (a > 0.5) {
        const gr = ctx.createRadialGradient(x, y, 0, x, y, 11);
        gr.addColorStop(0, `rgba(255,236,170,${0.55 * a})`);
        gr.addColorStop(1, 'rgba(255,236,170,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(x - 11, y - 11, 22, 22);
      }
    }
    ctx.restore();
  }

  function drawGround(g) {
    const y0 = BLD.base;
    g.fillStyle = vgrad(g, y0, H + 200, [[0, 'rgb(190,196,194)'], [0.3, 'rgb(208,212,206)'], [1, 'rgb(222,222,212)']]);
    g.fillRect(-400, y0, W + 800, H + 300 - y0);
    g.fillStyle = 'rgba(80,160,176,0.22)';
    g.beginPath();
    g.moveTo(520, y0);
    g.bezierCurveTo(420, 900, 520, 980, 380, H + 200);
    g.lineTo(W + 400, H + 200);
    g.lineTo(W + 400, y0);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(110,116,116,0.35)';
    g.lineWidth = 1.6;
    for (let k = -6; k <= 10; k++) {
      g.beginPath();
      g.moveTo(540 + k * 150, y0 + 2);
      g.lineTo(540 + k * 330, H + 200);
      g.stroke();
    }
    for (const y of [900, 966, 1060]) {
      g.beginPath();
      g.moveTo(-400, y);
      g.lineTo(W + 400, y);
      g.stroke();
    }
    const PUD = [[300, 960, 120, 14], [720, 1000, 180, 18], [1000, 930, 90, 10], [120, 1040, 140, 16], [560, 920, 70, 7]];
    for (const [x, y, rx, ry] of PUD) {
      g.fillStyle = vgrad(g, y - ry, y + ry, [[0, 'rgb(150,206,220)'], [1, 'rgb(206,234,236)']]);
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0, 0, TAU);
      g.fill();
      g.fillStyle = 'rgba(255,255,248,0.55)';
      g.beginPath();
      g.ellipse(x + rx * 0.3, y - ry * 0.3, rx * 0.35, ry * 0.18, 0, 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgb(90,98,100)';
    g.fillRect(330, 900, 120, 16);
    g.fillStyle = 'rgb(56,62,66)';
    for (let x = 334; x < 446; x += 8) g.fillRect(x, 903, 4, 10);
    g.strokeStyle = 'rgb(44,140,90)';
    g.lineWidth = 7;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(300, 752);
    g.bezierCurveTo(250, 790, 300, 830, 300, 846);
    g.bezierCurveTo(260, 920, 120, 900, 80, 980);
    g.bezierCurveTo(50, 1040, 180, 1060, 260, 1100);
    g.stroke();
    g.strokeStyle = 'rgba(190,240,200,0.5)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(302, 846);
    g.bezierCurveTo(262, 918, 122, 897, 82, 977);
    g.stroke();
    g.fillStyle = 'rgba(40,60,70,0.25)';
    g.beginPath();
    g.ellipse(1036, 942, 58, 10, 0, 0, TAU);
    g.fill();
    g.fillStyle = hgrad(g, 990, 1076, [[0, 'rgb(214,160,40)'], [0.7, 'rgb(250,204,72)'], [1, 'rgb(255,228,130)']]);
    poly(g, [[990, 870], [1076, 870], [1068, 940], [998, 940]]);
    g.fill();
    g.fillStyle = 'rgb(186,132,30)';
    g.beginPath();
    g.ellipse(1033, 870, 43, 8, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(250,252,250,0.95)';
    for (const [x, y, r] of [[1012, 864, 12], [1030, 860, 15], [1052, 864, 11], [1040, 868, 10]]) {
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
    }
  }

  const FOAM = [[600, 760, 22], [660, 748, 16], [760, 800, 26], [820, 780, 18], [880, 812, 22], [960, 760, 16], [700, 820, 14]];

  function drawCar(g) {
    const { x0, x1, wheels, r } = CAR;
    const gy = GROUND;
    g.fillStyle = 'rgba(30,44,56,0.45)';
    g.beginPath();
    g.ellipse((x0 + x1) / 2 - 16, gy + 4, (x1 - x0) * 0.52, 16, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(30,44,56,0.3)';
    g.fillRect(x0 + 10, gy - 30, x1 - x0 - 20, 30);
    const body = () => {
      g.beginPath();
      g.moveTo(x0 + 6, 770);
      g.lineTo(x0 + 12, 752);
      g.lineTo(642, 744);
      g.lineTo(718, 664);
      g.lineTo(896, 662);
      g.lineTo(964, 742);
      g.lineTo(x1 - 6, 748);
      g.lineTo(x1, 770);
      g.lineTo(x1 - 4, 836);
      g.lineTo(x0 + 4, 838);
      g.closePath();
    };
    body();
    g.fillStyle = vgrad(g, 660, 840, [[0, 'rgb(232,92,80)'], [0.45, 'rgb(208,62,56)'], [0.62, 'rgb(186,48,46)'], [1, 'rgb(140,32,36)']]);
    g.fill();
    g.save();
    body();
    g.clip();
    g.fillStyle = 'rgba(80,10,20,0.25)';
    g.fillRect(x0, 800, x1 - x0, 50);
    g.fillStyle = 'rgba(255,236,226,0.55)';
    g.fillRect(x0, 752, x1 - x0, 6);
    g.fillStyle = 'rgba(255,220,210,0.22)';
    g.fillRect(x0, 758, x1 - x0, 16);
    g.fillStyle = 'rgba(255,240,230,0.5)';
    poly(g, [[722, 664], [894, 662], [898, 670], [718, 672]]);
    g.fill();
    g.restore();
    const glass = (pts) => {
      poly(g, pts);
      g.fillStyle = vgrad(g, 670, 744, [[0, 'rgb(150,206,220)'], [0.55, 'rgb(84,136,156)'], [1, 'rgb(46,78,96)']]);
      g.fill();
    };
    glass([[654, 742], [724, 674], [800, 674], [800, 742]]);
    glass([[812, 742], [812, 674], [890, 674], [950, 742]]);
    g.fillStyle = 'rgb(60,40,44)';
    g.fillRect(800, 672, 12, 72);
    g.fillStyle = 'rgba(240,250,250,0.4)';
    poly(g, [[700, 742], [744, 674], [764, 674], [720, 742]]);
    g.fill();
    poly(g, [[850, 742], [880, 674], [890, 674], [862, 742]]);
    g.fill();
    g.strokeStyle = 'rgba(100,20,24,0.55)';
    g.lineWidth = 1.6;
    for (const x of [656, 806, 948]) {
      g.beginPath();
      g.moveTo(x, 748);
      g.lineTo(x + (x === 948 ? 6 : 0), 832);
      g.stroke();
    }
    g.fillStyle = 'rgb(214,220,222)';
    g.fillRect(x0 + 8, 794, x1 - x0 - 16, 5);
    g.fillStyle = 'rgba(255,255,255,0.7)';
    g.fillRect(x0 + 8, 794, x1 - x0 - 16, 1.5);
    g.fillStyle = 'rgb(236,236,230)';
    g.fillRect(770, 770, 20, 4);
    g.fillRect(918, 770, 20, 4);
    g.fillStyle = vgrad(g, 800, 836, [[0, 'rgb(236,240,240)'], [1, 'rgb(150,160,166)']]);
    rrect(g, x0 - 6, 806, 36, 28, 6);
    g.fill();
    rrect(g, x1 - 30, 806, 36, 28, 6);
    g.fill();
    g.fillStyle = 'rgb(255,246,214)';
    g.fillRect(x0 + 4, 772, 16, 20);
    g.fillStyle = 'rgb(240,170,60)';
    g.fillRect(x0 + 22, 778, 10, 12);
    g.fillStyle = 'rgb(176,30,30)';
    g.fillRect(x1 - 16, 772, 12, 22);
    for (const wx of wheels) {
      g.fillStyle = 'rgb(46,18,24)';
      g.beginPath();
      g.arc(wx, 832, r + 8, Math.PI, 0);
      g.fill();
      g.fillStyle = 'rgb(36,36,42)';
      g.beginPath();
      g.arc(wx, gy - r, r, 0, TAU);
      g.fill();
      g.fillStyle = 'rgb(176,184,188)';
      g.beginPath();
      g.arc(wx, gy - r, r * 0.55, 0, TAU);
      g.fill();
      g.fillStyle = 'rgb(230,234,236)';
      g.beginPath();
      g.arc(wx - 3, gy - r - 3, r * 0.3, 0, TAU);
      g.fill();
      g.fillStyle = 'rgba(20,20,26,0.5)';
      g.beginPath();
      g.arc(wx, gy - r, r * 0.12, 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgba(255,230,226,0.3)';
    for (let k = 0; k < 14; k++) {
      const x = 580 + k * 32 + 10 * LIB.h3(k, 4, 1);
      const y = 770 + 20 * LIB.h3(k, 5, 1);
      g.fillRect(x, y, 2.4, 22 + 26 * LIB.h3(k, 6, 1));
    }
    for (const [x, y, rr] of FOAM) foamBlob(g, x, y, rr, sd('foam', x, y), 1);
  }

  function foamBlob(g, x, y, r, seed, a) {
    const rg = LIB.rng(seed);
    const n = 9;
    g.fillStyle = `rgba(150,190,204,${0.55 * a})`;
    for (let i = 0; i < n; i++) {
      const ang = rg() * TAU, d = rg() * r * 0.7;
      g.beginPath();
      g.arc(x + Math.cos(ang) * d * 1.3, y + Math.sin(ang) * d * 0.6 + r * 0.18, r * (0.3 + 0.25 * rg()), 0, TAU);
      g.fill();
    }
    const rg2 = LIB.rng(seed);
    g.fillStyle = `rgba(252,254,252,${0.95 * a})`;
    for (let i = 0; i < n; i++) {
      const ang = rg2() * TAU, d = rg2() * r * 0.7;
      g.beginPath();
      g.arc(x + Math.cos(ang) * d * 1.3, y + Math.sin(ang) * d * 0.6, r * (0.28 + 0.25 * rg2()), 0, TAU);
      g.fill();
    }
  }

  function drawFoam(ctx, t, o) {
    const grow = clamp01(o.grow == null ? 1 : o.grow);
    if (grow <= 0) return;
    const r = o.r * (0.4 + 0.6 * grow) * (1 + 0.04 * Math.sin(t * 5 + (o.seed || 0)));
    foamBlob(ctx, o.x, o.y, r, sd('live', o.seed || 0, Math.floor(t * 6)), o.alpha == null ? 1 : o.alpha);
  }

  function drawSpray(ctx, t, o) {
    o = o || {};
    const b = o.bay || BAY2;
    const ay = b.y0 + 72, x0 = b.x0 + 46, x1 = b.x1 - 46, y1 = BLD.base - 6;
    ctx.save();
    ctx.beginPath();
    ctx.rect(b.x0, b.y0, b.x1 - b.x0, y1 - b.y0);
    ctx.clip();
    LOOK.particles(ctx, t, {
      seed: sd('spray'), count: 70, area: [x0, ay, x1 - x0, y1 - ay], vel: [-6, 520], spread: 0.35,
      size: [1, 2], alpha: [0.35, 0.75], color: 'rgba(220,246,250,1)',
      draw: (g, p) => {
        g.fillStyle = 'rgba(222,246,250,0.85)';
        g.fillRect(p.x, p.y, p.size, 10 + 14 * p.u);
      },
    });
    const m = ctx.createRadialGradient((x0 + x1) / 2, y1, 0, (x0 + x1) / 2, y1, 140);
    m.addColorStop(0, `rgba(220,246,248,${0.38 + 0.06 * Math.sin(t * 3)})`);
    m.addColorStop(1, 'rgba(220,246,248,0)');
    ctx.fillStyle = m;
    ctx.fillRect(b.x0, y1 - 160, b.x1 - b.x0, 160);
    ctx.restore();
  }

  function drawDrips(ctx, t, o) {
    o = o || {};
    const n = o.count || 9;
    ctx.save();
    for (let i = 0; i < n; i++) {
      const x = CAR.x0 + 40 + (CAR.x1 - CAR.x0 - 80) * LIB.h3(i, 31, 7);
      const per = 0.7 + 0.5 * LIB.h3(i, 32, 7);
      const ph = ((t + per * LIB.h3(i, 33, 7)) % per) / per;
      const y = 838 + 32 * ph * ph;
      ctx.fillStyle = `rgba(214,240,246,${0.8 * (1 - ph)})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 1.8, 3 + 2 * ph, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function framed(S, f, draw) {
    const { c, g } = makeLayer(S);
    g.save();
    apply(g, f);
    draw(g);
    g.restore();
    return c;
  }

  function buildLight(S, f) {
    const sun = toScreen(f, SUN);
    const beam = LOOK.beamField({
      beams: [[180, 70, 0.45], [380, 110, 0.6], [620, 60, 0.4], [820, 90, 0.5]],
      dir: [0.97, 0.26],
      noise: { base: 0.8, amp: 0.4, scale: 8, offset: 5, row: 3.5 },
      fall: (X, Y) => (1 - sstep(300, 820, Y)) * 0.5,
    });
    const glow = LOOK.glowField({ x: sun[0], y: sun[1], r: 620 * Math.sqrt(f.z), amount: 0.65 });
    return LOOK.lightLayer(S, { fields: [beam, glow], color: [255, 250, 232] });
  }

  const CACHE = {};
  function statics(S, f) {
    const key = S + ':' + f.z + ':' + f.c[0] + ':' + f.c[1];
    if (CACHE[key]) return CACHE[key];
    const sun = toScreen(f, SUN);
    const glow = { x: sun[0], y: sun[1], r: 900, amount: 0.18, color: [255, 248, 228] };
    const far = framed(S, f, drawFar);
    texture(far, S, 1, { mottle: 0.045, dark: 0.035, light: 0.03, glow });
    const mid = framed(S, f, (g) => {
      drawBuilding(g);
      drawSign(g);
    });
    texture(mid, S, 2, { mottle: 0.06, dark: 0.05, light: 0.035, glow });
    const near = framed(S, f, (g) => {
      drawGround(g);
      drawCar(g);
    });
    texture(near, S, 3, { mottle: 0.07, dark: 0.06, light: 0.04, glow });
    return (CACHE[key] = { S, frame: f, far, mid, near, light: buildLight(S, f) });
  }

  FILM.sets = Object.assign(FILM.sets || {}, {
    carwash: {
      SUN, GROUND, CAR, CAL, SIGN, BLD, BAY1, BAY2, SHADOW_K, FOAM,
      statics, apply, toScreen,
      drawSpray, drawFoam, drawDrips, drawSignBulbs, drawCalendarMarks, calCell, isFriday,
    },
  });
})();
