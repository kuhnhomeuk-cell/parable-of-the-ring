// sets/hospital.js: procedural set (background, props and light) shared by the scenes.
(function () {
  'use strict';

  const FILM = window.FILM;
  const LIB = FILM.lib, LOOK = FILM.look;
  const SID = 'set-hospital';
  const sd = (...k) => LIB.hash(SID, ...k) & 0x7fffffff;
  const { makeLayer, poly, vgrad, hgrad, sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const W = 1080, H = 1080;

  function view(v) {
    v = v || {};
    const cx = v.cx == null ? 540 : v.cx, cy = v.cy == null ? 540 : v.cy, z = v.z || 1;
    return {
      cx, cy, z,
      apply(ctx) {
        ctx.translate(W / 2, H / 2);
        ctx.scale(z, z);
        ctx.translate(-cx, -cy);
      },
      pt(p) { return [(p[0] - cx) * z + W / 2, (p[1] - cy) * z + H / 2]; },
      world(X, Y) { return [(X - W / 2) / z + cx, (Y - H / 2) / z + cy]; },
      key: `${cx},${cy},${z}`,
      char(o) {
        const q = Object.assign({}, o);
        const p = this.pt([o.x || 0, o.y || 0]);
        q.x = p[0];
        q.y = p[1];
        if (o.h != null) q.h = o.h * z;
        if (o.size != null) q.size = o.size * z;
        if (o.target) {
          const tp = this.pt([o.target.x, o.target.y]);
          q.target = { x: tp[0], y: tp[1] };
        }
        if (o.seatY != null) q.seatY = this.pt([0, o.seatY])[1];
        if (o.lift != null && o.pose && typeof o.pose === 'string' && o.pose === 'float') q.lift = o.lift * z;
        return q;
      },
    };
  }
  const inView = (V, f) => (X, Y) => {
    const p = V.world(X, Y);
    return f(p[0], p[1]);
  };
  const texture = (c, S, n, o) => LOOK.texture(c, S, Object.assign({ seed: sd('tex', n), offset: n * 9.3 + 2 }, o));

  const rgb = (c, a) => (a == null ? `rgb(${c[0]},${c[1]},${c[2]})` : `rgba(${c[0]},${c[1]},${c[2]},${a})`);
  function rrect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  const WARD = {
    floorY: 640,
    win: { x0: 590, x1: 880, y0: 140, y1: 480 },
    lamps: [[430, 300], [660, 288]],
    bed: { x0: 236, x1: 790, top: 780, base: 892 },
    hip: [392, 780],
    helmetRest: [646, 774],
    nightLamp: [300, 520],
    sun: [1080, 40],
  };

  function wardWall(g, night) {
    const { win, floorY } = WARD;
    g.fillStyle = vgrad(g, -200, floorY, [[0, 'rgb(226,236,230)'], [0.25, 'rgb(230,240,234)'], [0.3, 'rgb(204,226,214)'], [1, 'rgb(182,210,195)']]);
    g.fillRect(-400, -400, W + 800, floorY + 400);
    g.fillStyle = 'rgb(240,246,242)';
    g.fillRect(-400, -400, W + 800, 452);
    g.fillStyle = vgrad(g, 52, 80, [[0, 'rgba(120,150,138,0.28)'], [1, 'rgba(120,150,138,0)']]);
    g.fillRect(-400, 52, W + 800, 28);
    g.fillStyle = hgrad(g, 0, W, [[0, 'rgba(150,180,170,0.14)'], [0.55, 'rgba(255,255,255,0)'], [1, 'rgba(255,250,236,0.25)']]);
    g.fillRect(-400, 52, W + 800, floorY - 52);
    g.fillStyle = vgrad(g, 548, floorY, [[0, 'rgb(150,190,170)'], [1, 'rgb(132,176,154)']]);
    g.fillRect(-400, 548, W + 800, floorY - 548);
    g.fillStyle = 'rgb(232,242,236)';
    g.fillRect(-400, 538, W + 800, 11);
    g.fillStyle = 'rgba(90,120,108,0.25)';
    g.fillRect(-400, 549, W + 800, 4);
    for (let x = -380; x < W + 400; x += 120) {
      g.fillStyle = 'rgba(120,160,140,0.18)';
      g.fillRect(x, 553, 2, floorY - 553);
    }
    g.fillStyle = 'rgb(112,150,132)';
    g.fillRect(-400, floorY - 10, W + 800, 10);
    rrect(g, 228, 470, 420, 52, 8);
    g.fillStyle = 'rgb(226,238,232)';
    g.fill();
    g.fillStyle = 'rgba(100,130,120,0.22)';
    g.fillRect(232, 516, 412, 4);
    const outlets = [[288, '#5E9C7E'], [328, '#E5E7E3'], [368, '#C9CDD0'], [560, '#D45E52']];
    for (const [x, c] of outlets) {
      g.fillStyle = 'rgb(198,212,206)';
      g.beginPath();
      g.arc(x, 496, 12, 0, TAU);
      g.fill();
      g.fillStyle = c;
      g.beginPath();
      g.arc(x, 496, 6.5, 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgb(214,226,222)';
    rrect(g, 280, 508, 16, 40, 4);
    g.fill();
    g.fillStyle = 'rgba(150,200,220,0.8)';
    g.fillRect(284, 514, 8, 24);
    const { x0, x1, y0, y1 } = win;
    g.fillStyle = 'rgb(206,222,214)';
    g.fillRect(x0 - 22, y0 - 22, x1 - x0 + 44, y1 - y0 + 44);
    g.fillStyle = 'rgb(190,210,202)';
    poly(g, [[x0 - 22, y0 - 22], [x0, y0], [x0, y1], [x0 - 22, y1 + 22]]);
    g.fill();
    if (!night) {
      g.fillStyle = vgrad(g, y0, y1, [[0, 'rgb(214,236,240)'], [0.55, 'rgb(240,248,244)'], [0.8, 'rgb(250,246,230)'], [1, 'rgb(240,226,196)']]);
      g.fillRect(x0, y0, x1 - x0, y1 - y0);
      g.fillStyle = 'rgba(226,210,180,0.85)';
      poly(g, [[x0, 420], [680, 408], [780, 416], [x1, 402], [x1, y1], [x0, y1]]);
      g.fill();
      g.fillStyle = 'rgba(196,196,170,0.7)';
      for (const [tx, tw] of [[640, 46], [706, 60], [800, 40]]) {
        poly(g, [[tx, 426], [tx + tw * 0.5, 404], [tx + tw, 426]]);
        g.fill();
      }
      LOOK.haze(g, { x: 880, y: 160, r: 360, stops: [[0, 'rgba(255,255,248,0.95)'], [0.4, 'rgba(255,252,240,0.4)'], [1, 'rgba(255,252,240,0)']] });
    } else {
      g.fillStyle = vgrad(g, y0, y1, [[0, 'rgb(26,36,70)'], [0.7, 'rgb(44,58,98)'], [1, 'rgb(60,70,108)']]);
      g.fillRect(x0, y0, x1 - x0, y1 - y0);
      const rs = LIB.rng(sd('stars'));
      for (let i = 0; i < 40; i++) {
        g.fillStyle = `rgba(230,236,255,${rs.range(0.3, 0.9)})`;
        const s = rs.range(0.8, 2);
        g.fillRect(rs.range(x0, x1), rs.range(y0, y0 + 220), s, s);
      }
      g.fillStyle = 'rgba(20,26,48,0.9)';
      poly(g, [[x0, 422], [680, 410], [780, 418], [x1, 404], [x1, y1], [x0, y1]]);
      g.fill();
      const mg = g.createRadialGradient(810, 214, 0, 810, 214, 110);
      mg.addColorStop(0, 'rgba(220,230,255,0.55)');
      mg.addColorStop(1, 'rgba(220,230,255,0)');
      g.fillStyle = mg;
      g.fillRect(x0, y0, x1 - x0, y1 - y0);
      g.fillStyle = 'rgb(240,244,252)';
      g.beginPath();
      g.arc(810, 214, 22, 0, TAU);
      g.fill();
      g.fillStyle = 'rgba(190,200,226,0.6)';
      g.beginPath();
      g.arc(804, 208, 5, 0, TAU);
      g.arc(818, 222, 4, 0, TAU);
      g.fill();
    }
    g.fillStyle = night ? 'rgb(120,138,170)' : 'rgb(246,250,248)';
    g.fillRect((x0 + x1) / 2 - 5, y0, 10, y1 - y0);
    g.fillRect(x0, 308, x1 - x0, 9);
    g.fillStyle = night ? 'rgb(150,164,190)' : 'rgb(238,242,236)';
    g.fillRect(x0 - 6, y0 - 6, x1 - x0 + 12, 46);
    for (let y = y0 + 4; y < y0 + 40; y += 6) {
      g.fillStyle = night ? 'rgba(60,70,100,0.4)' : 'rgba(150,170,160,0.35)';
      g.fillRect(x0 - 6, y, x1 - x0 + 12, 1.2);
    }
    g.fillStyle = night ? 'rgb(140,154,184)' : 'rgb(242,246,242)';
    g.fillRect(x0 - 30, y1 + 4, x1 - x0 + 60, 14);
    g.fillStyle = 'rgba(80,110,100,0.25)';
    g.fillRect(x0 - 30, y1 + 18, x1 - x0 + 60, 6);
    g.fillStyle = 'rgb(246,248,246)';
    g.beginPath();
    g.arc(990, 220, 30, 0, TAU);
    g.fill();
    g.strokeStyle = 'rgb(150,170,160)';
    g.lineWidth = 3;
    g.stroke();
    g.strokeStyle = 'rgb(70,80,78)';
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(990, 220);
    g.lineTo(990, 202);
    g.moveTo(990, 220);
    g.lineTo(1003, 226);
    g.stroke();
    g.fillStyle = 'rgba(214,228,222,0.9)';
    rrect(g, -120, 580, 210, 50, 10);
    g.fill();
    g.fillStyle = 'rgba(176,200,190,0.8)';
    g.fillRect(-120, 626, 210, 12);
    g.fillStyle = vgrad(g, WARD.floorY, H + 200, [[0, 'rgb(176,198,186)'], [0.4, 'rgb(164,190,176)'], [1, 'rgb(140,168,156)']]);
    g.fillRect(-400, WARD.floorY, W + 800, H + 400 - WARD.floorY);
    for (const y of [668, 706, 760, 836, 940, 1080]) {
      g.fillStyle = 'rgba(110,140,128,0.2)';
      g.fillRect(-400, y, W + 800, 1.6);
    }
    for (let i = -14; i <= 14; i++) {
      const xb = 540 + i * 70;
      g.strokeStyle = 'rgba(110,140,128,0.18)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(xb, WARD.floorY);
      g.lineTo(540 + (xb - 540) * 2.6, H + 200);
      g.stroke();
    }
    const rf = LIB.rng(sd('floorchk'));
    for (let i = -14; i <= 14; i++) {
      for (let r = 0; r < 5; r++) {
        if (rf() > 0.35) continue;
        const ys = [WARD.floorY, 668, 706, 760, 836, 940];
        const ya = ys[r], yb = ys[r + 1];
        const xa = (y) => 540 + (540 + i * 70 - 540) * (1 + 1.6 * (y - WARD.floorY) / (H + 200 - WARD.floorY));
        const xb2 = (y) => 540 + (540 + (i + 1) * 70 - 540) * (1 + 1.6 * (y - WARD.floorY) / (H + 200 - WARD.floorY));
        g.fillStyle = 'rgba(236,246,240,0.18)';
        poly(g, [[xa(ya), ya], [xb2(ya), ya], [xb2(yb), yb], [xa(yb), yb]]);
        g.fill();
      }
    }
    g.fillStyle = night ? 'rgba(150,170,230,0.12)' : 'rgba(255,252,236,0.4)';
    poly(g, [[600, WARD.floorY + 4], [880, WARD.floorY + 4], [660, 1000], [260, 1000]]);
    g.fill();
  }

  function curtain(g, x0, x1, top, bot, seed, gathered) {
    const r = LIB.rng(sd('curtain', seed));
    const n = Math.max(3, Math.round((x1 - x0) / (gathered ? 26 : 44)));
    const w = (x1 - x0) / n;
    g.fillStyle = 'rgb(140,190,166)';
    g.fillRect(x0, top, x1 - x0, bot - top);
    for (let i = 0; i < n; i++) {
      const x = x0 + i * w;
      const gr = g.createLinearGradient(x, 0, x + w, 0);
      gr.addColorStop(0, 'rgb(112,164,140)');
      gr.addColorStop(0.35, 'rgb(172,212,192)');
      gr.addColorStop(0.6, 'rgb(156,202,180)');
      gr.addColorStop(1, 'rgb(106,158,134)');
      g.fillStyle = gr;
      const sway = r.range(-4, 4);
      poly(g, [[x, top], [x + w, top], [x + w + sway, bot], [x + sway, bot]]);
      g.fill();
    }
    g.fillStyle = 'rgba(236,246,240,0.85)';
    g.fillRect(x0, top, x1 - x0, 46);
    for (let x = x0 + 4; x < x1; x += 8) {
      g.fillStyle = 'rgba(150,180,168,0.35)';
      g.fillRect(x, top, 1, 46);
    }
    g.fillStyle = 'rgba(110,150,132,0.35)';
    g.fillRect(x0, bot - 8, x1 - x0, 8);
    g.fillStyle = 'rgba(80,110,100,0.16)';
    g.beginPath();
    g.ellipse((x0 + x1) / 2 - 20, bot + 4, (x1 - x0) * 0.6, 10, 0, 0, TAU);
    g.fill();
  }

  function rail(g) {
    g.fillStyle = 'rgb(206,216,214)';
    g.fillRect(-400, 64, W + 800, 7);
    g.fillStyle = 'rgba(255,255,255,0.7)';
    g.fillRect(-400, 64, W + 800, 2);
    for (let x = -380; x < W + 400; x += 26) {
      g.fillStyle = 'rgb(176,190,188)';
      g.fillRect(x, 70, 2, 8);
    }
  }

  function examLamp(g, x, y, on) {
    g.fillStyle = 'rgb(206,216,214)';
    g.fillRect(x - 3, 0, 6, y - 54);
    g.fillStyle = 'rgb(188,198,198)';
    g.fillRect(x - 8, y - 60, 16, 12);
    g.fillStyle = vgrad(g, y - 50, y, [[0, 'rgb(236,240,238)'], [1, 'rgb(196,206,206)']]);
    g.beginPath();
    g.moveTo(x - 58, y);
    g.quadraticCurveTo(x - 50, y - 50, x, y - 52);
    g.quadraticCurveTo(x + 50, y - 50, x + 58, y);
    g.closePath();
    g.fill();
    g.fillStyle = on ? 'rgb(255,254,246)' : 'rgb(170,180,186)';
    g.beginPath();
    g.ellipse(x, y, 58, 12, 0, 0, TAU);
    g.fill();
    if (on) {
      g.fillStyle = 'rgba(255,255,255,0.95)';
      g.beginPath();
      g.ellipse(x, y + 1, 40, 7, 0, 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgb(176,188,190)';
    g.fillRect(x - 3, y + 8, 6, 14);
  }

  function ivPole(g, x) {
    g.fillStyle = hgrad(g, x - 3, x + 3, [[0, 'rgb(170,180,184)'], [0.6, 'rgb(236,240,240)'], [1, 'rgb(170,180,184)']]);
    g.fillRect(x - 3, 300, 6, 560);
    g.fillRect(x - 26, 300, 52, 4);
    g.fillStyle = 'rgb(150,160,166)';
    for (const dx of [-30, 0, 30]) {
      g.beginPath();
      g.ellipse(x + dx, 862, 8, 4, 0, 0, TAU);
      g.fill();
    }
    g.fillRect(x - 32, 852, 64, 5);
    g.fillStyle = 'rgba(232,244,248,0.92)';
    rrect(g, x + 8, 306, 34, 56, 9);
    g.fill();
    g.fillStyle = 'rgba(200,226,236,0.8)';
    g.fillRect(x + 12, 332, 26, 26);
    g.strokeStyle = 'rgba(210,226,232,0.9)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x + 25, 362);
    g.bezierCurveTo(x + 30, 470, x + 90, 560, x + 120, 620);
    g.stroke();
  }

  function bedFront(g, cover) {
    const [x0, x1] = cover;
    const { x0: bx0, x1: bx1, top, base } = WARD.bed;
    g.save();
    g.beginPath();
    g.rect(bx0 - 60, top - 2, bx1 - bx0 + 120, base - top + 40);
    g.clip();
    bed(g, false, true);
    g.restore();
    g.beginPath();
    g.moveTo(x0 - 30, top + 30);
    g.bezierCurveTo(x0 - 26, top - 6, x0 - 6, top - 34, x0 + 30, top - 38);
    g.bezierCurveTo(x0 + 120, top - 44, x1 - 90, top - 40, x1 - 54, top - 46);
    g.bezierCurveTo(x1 - 40, top - 86, x1 - 4, top - 90, x1 + 6, top - 50);
    g.bezierCurveTo(x1 + 18, top - 24, x1 + 30, top - 6, x1 + 34, top + 30);
    g.lineTo(x1 + 30, top + 54);
    g.bezierCurveTo(x1 - 80, top + 62, x0 + 40, top + 60, x0 - 26, top + 54);
    g.closePath();
    g.fillStyle = vgrad(g, top - 90, top + 60, [[0, 'rgb(196,228,212)'], [0.45, 'rgb(170,212,192)'], [1, 'rgb(128,178,156)']]);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.beginPath();
    g.moveTo(x0 + 30, top - 34);
    g.bezierCurveTo(x0 + 120, top - 40, x1 - 90, top - 36, x1 - 56, top - 42);
    g.lineTo(x1 - 58, top - 36);
    g.bezierCurveTo(x1 - 90, top - 30, x0 + 120, top - 34, x0 + 30, top - 28);
    g.fill();
    g.strokeStyle = 'rgba(96,146,124,0.45)';
    g.lineWidth = 3;
    for (const [a, b] of [[x0 + 60, x0 + 90], [x0 + 170, x0 + 200], [x1 - 30, x1 - 10]]) {
      g.beginPath();
      g.moveTo(a, top - 30);
      g.quadraticCurveTo(a + 14, top + 10, b, top + 50);
      g.stroke();
    }
    g.fillStyle = 'rgb(248,250,246)';
    g.beginPath();
    g.moveTo(x0 - 28, top + 10);
    g.bezierCurveTo(x0 - 22, top - 14, x0 - 4, top - 30, x0 + 24, top - 34);
    g.lineTo(x0 + 36, top - 22);
    g.bezierCurveTo(x0 + 10, top - 16, x0 - 8, top, x0 - 12, top + 30);
    g.closePath();
    g.fill();
  }

  function bed(g, night, frontOnly) {
    const { x0, x1, top, base } = WARD.bed;
    g.fillStyle = 'rgba(70,96,88,0.22)';
    poly(g, [[x0 - 120, base + 10], [x1 - 40, base + 10], [x1 + 30, base - 6], [x0 - 40, base - 8]]);
    g.fill();
    g.fillStyle = 'rgba(70,96,88,0.12)';
    g.beginPath();
    g.ellipse((x0 + x1) / 2 - 50, base + 2, (x1 - x0) * 0.62, 18, 0, 0, TAU);
    g.fill();
    const metal = (xa, xb) => hgrad(g, xa, xb, [[0, 'rgb(196,206,210)'], [0.5, 'rgb(236,240,240)'], [1, 'rgb(210,218,220)']]);
    for (const x of [x0 + 26, x1 - 30]) {
      g.fillStyle = metal(x - 7, x + 7);
      g.fillRect(x - 7, top + 50, 14, Math.max(4, base - top - 62));
      g.fillStyle = 'rgb(84,94,96)';
      g.beginPath();
      g.arc(x, base - 8, 10, 0, TAU);
      g.fill();
      g.fillStyle = 'rgb(150,160,164)';
      g.beginPath();
      g.arc(x, base - 8, 4, 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgb(214,222,224)';
    g.fillRect(x0 + 10, top + 72, x1 - x0 - 20, 8);
    g.fillStyle = vgrad(g, top + 36, top + 64, [[0, 'rgb(234,238,238)'], [1, 'rgb(196,206,208)']]);
    g.fillRect(x0 - 6, top + 36, x1 - x0 + 18, 28);
    g.fillStyle = 'rgba(80,100,100,0.25)';
    g.fillRect(x0 - 6, top + 60, x1 - x0 + 18, 4);
    rrect(g, x0 - 34, top - 190, 40, base - top + 150, 14);
    g.fillStyle = hgrad(g, x0 - 34, x0 + 6, [[0, 'rgb(206,216,218)'], [0.55, 'rgb(244,246,244)'], [1, 'rgb(222,228,228)']]);
    g.fill();
    rrect(g, x0 - 28, top - 176, 28, 120, 10);
    g.fillStyle = 'rgba(168,206,188,0.55)';
    g.fill();
    rrect(g, x1 - 6, top - 60, 34, base - top + 20, 12);
    g.fillStyle = hgrad(g, x1 - 6, x1 + 28, [[0, 'rgb(214,222,224)'], [0.6, 'rgb(248,250,248)'], [1, 'rgb(226,232,232)']]);
    g.fill();
    g.save();
    g.translate(x1 + 12, top - 34);
    g.rotate(0.04);
    g.fillStyle = 'rgb(176,140,96)';
    rrect(g, -20, 0, 40, 54, 3);
    g.fill();
    g.fillStyle = 'rgb(250,248,240)';
    g.fillRect(-16, 8, 32, 42);
    g.fillStyle = 'rgba(80,90,110,0.45)';
    for (let i = 0; i < 6; i++) g.fillRect(-12, 14 + i * 6, 22 - (i % 3) * 5, 1.4);
    g.fillStyle = 'rgb(150,150,150)';
    g.fillRect(-8, -3, 16, 7);
    g.restore();
    rrect(g, x0 + 2, top - 6, x1 - x0 - 4, 48, 14);
    g.fillStyle = vgrad(g, top - 6, top + 42, [[0, 'rgb(252,252,248)'], [0.55, 'rgb(240,244,240)'], [1, 'rgb(208,220,216)']]);
    g.fill();
    g.fillStyle = 'rgba(150,176,168,0.3)';
    for (const x of [x0 + 120, x0 + 330]) {
      g.beginPath();
      g.moveTo(x, top + 4);
      g.quadraticCurveTo(x + 18, top + 22, x + 6, top + 40);
      g.lineTo(x + 2, top + 40);
      g.quadraticCurveTo(x + 12, top + 22, x - 4, top + 4);
      g.fill();
    }
    if (frontOnly) return;
    rrect(g, x1 - 168, top - 20, 158, 30, 12);
    g.fillStyle = vgrad(g, top - 20, top + 10, [[0, 'rgb(186,222,204)'], [1, 'rgb(150,196,174)']]);
    g.fill();
    rrect(g, x1 - 172, top + 6, 170, 46, 12);
    g.fillStyle = vgrad(g, top + 6, top + 52, [[0, 'rgb(170,212,192)'], [1, 'rgb(128,178,156)']]);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.fillRect(x1 - 160, top - 16, 140, 3);
    g.save();
    g.translate(x0 + 52, top - 66);
    g.rotate(-0.32);
    rrect(g, -42, -64, 86, 132, 34);
    g.fillStyle = hgrad(g, -42, 44, [[0, 'rgb(220,230,228)'], [0.6, 'rgb(252,252,250)'], [1, 'rgb(236,240,238)']]);
    g.fill();
    g.restore();
    g.save();
    g.translate(x0 + 70, top - 28);
    g.rotate(-0.5);
    rrect(g, -40, -46, 80, 92, 30);
    g.fillStyle = hgrad(g, -40, 40, [[0, 'rgb(226,234,232)'], [0.6, 'rgb(255,255,252)'], [1, 'rgb(238,242,240)']]);
    g.fill();
    g.restore();
    void night;
  }

  function wardRoom(g, night, front) {
    rail(g);
    curtain(g, -260, 130, 72, 866, 1, true);
    if (front == null) curtain(g, 1000, 1360, 72, 866, 2, true);
    ivPole(g, 176);
    for (const [x, y] of WARD.lamps) examLamp(g, x, y, !night);
    bed(g, night);
    const [lx, ly] = WARD.nightLamp;
    g.fillStyle = 'rgb(206,216,214)';
    g.fillRect(lx - 3, ly - 70, 6, 50);
    g.fillStyle = night ? 'rgb(255,226,170)' : 'rgb(232,238,234)';
    poly(g, [[lx - 22, ly - 22], [lx + 22, ly - 22], [lx + 30, ly], [lx - 30, ly]]);
    g.fill();
  }

  const WARD_CACHE = {};
  function ward(S, o) {
    o = o || {};
    const V = view(o.view);
    const night = !!o.night;
    const front = o.curtainFront == null ? null : o.curtainFront;
    const cover = o.coverLegs || null;
    const key = `${S}|${V.key}|${night}|${front}|${cover}`;
    if (WARD_CACHE[key]) return WARD_CACHE[key];
    const win = WARD.win;
    const beams = LOOK.beamField({
      beams: [[-180, 70, 0.42], [-60, 90, 0.55], [70, 60, 0.36]],
      dir: [0.8, 0.6],
      noise: { base: 0.8, amp: 0.4, scale: 6, offset: 7, row: 3.5 },
      fall: (X, Y) => sstep(win.y0 - 60, win.y0 + 120, Y) * (1 - sstep(760, 1000, Y)) * (1 - sstep(1010, 1060, X)),
    });
    const beamW = (X, Y) => beams(X - 740, Y - 300);
    const lampGlow = (X, Y) => {
      let v = 0;
      for (const [lx, ly] of WARD.lamps) {
        const dx = (X - lx) / 150, dy = (Y - ly - 40) / 90;
        v = Math.max(v, 0.3 * Math.exp(-(dx * dx + dy * dy)));
        const cone = Math.max(0, 1 - Math.abs(X - lx) / (60 + 0.45 * Math.max(0, Y - ly))) * sstep(ly, ly + 40, Y) * (1 - sstep(ly + 180, ly + 480, Y));
        v = Math.max(v, 0.14 * cone);
      }
      return v;
    };
    const winGlow = LOOK.glowField({ x: 760, y: 260, r: 260, amount: night ? 0.2 : 0.4 });
    const dim = (X, Y) => 0.16 * (1 - beamW(X, Y)) * sstep(100, 300, Y) * (1 - sstep(700, 900, Y)) * (1 - sstep(600, 900, X));

    const A = makeLayer(S);
    A.g.save();
    V.apply(A.g);
    wardWall(A.g, night);
    A.g.restore();
    if (night) nightGrade(A.g, V, true);
    texture(A.c, S, 1, { mottle: 0.05, dark: 0.04, light: 0.03, dim: night ? null : inView(V, dim), glow: night ? null : { x: V.pt([760, 260])[0], y: V.pt([760, 260])[1], r: 700 * V.z, amount: 0.18 } });

    const B = makeLayer(S);
    B.g.save();
    V.apply(B.g);
    wardRoom(B.g, night, front);
    B.g.restore();
    if (night) nightGrade(B.g, V, false);
    texture(B.c, S, 2, { mottle: 0.065, dark: 0.055, light: 0.04, dim: night ? null : inView(V, dim) });
    let frontC = null;
    if (front != null) {
      const Fr = makeLayer(S);
      Fr.g.save();
      V.apply(Fr.g);
      curtain(Fr.g, front, front + 230, 72, 956, 3, false);
      Fr.g.fillStyle = 'rgb(206,232,218)';
      Fr.g.fillRect(front, 72, 8, 794);
      Fr.g.restore();
      texture(Fr.c, S, 3, { mottle: 0.065, dark: 0.05, light: 0.04 });
      frontC = Fr.c;
    }

    let light;
    if (!night) {
      light = LOOK.lightLayer(S, { fields: [inView(V, beamW), inView(V, lampGlow), inView(V, winGlow)], color: [255, 252, 238] });
    } else {
      const moon = LOOK.beamField({
        beams: [[-60, 110, 0.5]],
        dir: [0.8, 0.6],
        noise: { base: 0.85, amp: 0.3, scale: 6, offset: 2, row: 5 },
        fall: (X, Y) => sstep(win.y0, win.y0 + 120, Y) * (1 - sstep(760, 980, Y)),
      });
      void 0;
      const lamp = LOOK.glowField({ x: WARD.nightLamp[0], y: WARD.nightLamp[1] + 40, r: 230, amount: 0.5 });
      light = {
        moon: LOOK.lightLayer(S, { fields: [inView(V, (X, Y) => moon(X - 740, Y - 300)), inView(V, winGlow)], color: [176, 196, 255] }),
        lamp: LOOK.lightLayer(S, { fields: [inView(V, lamp)], color: [255, 214, 150] }),
      };
    }
    let bedFrontC = null;
    if (cover) {
      const Bf = makeLayer(S);
      Bf.g.save();
      V.apply(Bf.g);
      bedFront(Bf.g, cover);
      Bf.g.restore();
      if (night) nightGrade(Bf.g, V, false);
      texture(Bf.c, S, 5, { mottle: 0.065, dark: 0.05, light: 0.04 });
      bedFrontC = Bf.c;
    }
    return (WARD_CACHE[key] = { wall: A.c, room: B.c, front: frontC, bedFront: bedFrontC, light, view: V });
  }

  function nightGrade(g, V, wall) {
    g.save();
    V.apply(g);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = 'rgba(28,38,78,0.62)';
    g.beginPath();
    g.rect(-400, -400, W + 800, H + 800);
    if (wall) {
      const { x0, x1, y0, y1 } = WARD.win;
      g.rect(x1, y0, x0 - x1, y1 - y0);
    }
    g.fill('evenodd');
    const [lx, ly] = WARD.nightLamp;
    const rg = g.createRadialGradient(lx, ly + 70, 0, lx, ly + 70, 360);
    rg.addColorStop(0, 'rgba(255,196,120,0.42)');
    rg.addColorStop(0.45, 'rgba(240,170,110,0.16)');
    rg.addColorStop(1, 'rgba(240,170,110,0)');
    g.fillStyle = rg;
    g.fillRect(-400, -400, W + 800, H + 800);
    g.restore();
  }

  const PORCH = {
    horizon: 604,
    deckY: 742,
    sunSunrise: [872, 596],
    sunDay: [1140, 60],
    bench: { x0: 300, x1: 590, seat: 818, feet: 892 },
    walkY: 920,
  };

  const PAL = {
    sunrise: {
      sky: [[0, 'rgb(170,150,186)'], [0.3, 'rgb(226,168,182)'], [0.62, 'rgb(246,196,170)'], [0.86, 'rgb(252,222,166)'], [1, 'rgb(255,236,186)']],
      hills: [[[214, 170, 176], [232, 196, 180]], [[204, 150, 150], [226, 178, 160]], [[188, 132, 128], [214, 160, 140]]],
      sand: [[226, 176, 140], [200, 146, 120]],
      haze: [255, 226, 196],
      sunCore: 'rgba(255,248,222,1)',
      wood: { base: [188, 124, 92], lit: [232, 168, 118], shade: [130, 84, 74], dark: [96, 62, 60] },
      wall: [[222, 196, 186], [190, 162, 160]],
      mist: [255, 220, 200],
      glow: [255, 220, 180],
      tent: [198, 162, 150],
      palm: [150, 104, 104],
    },
    day: {
      sky: [[0, 'rgb(150,190,212)'], [0.4, 'rgb(188,214,222)'], [0.75, 'rgb(230,232,214)'], [1, 'rgb(244,234,206)']],
      hills: [[[214, 216, 206], [230, 226, 206]], [[214, 202, 178], [228, 214, 186]], [[204, 186, 152], [222, 202, 164]]],
      sand: [[226, 206, 168], [204, 182, 146]],
      haze: [248, 240, 220],
      sunCore: 'rgba(255,252,236,1)',
      wood: { base: [190, 150, 110], lit: [226, 192, 146], shade: [140, 106, 84], dark: [102, 78, 66] },
      wall: [[232, 226, 210], [200, 192, 176]],
      mist: [250, 244, 228],
      glow: [255, 246, 220],
      tent: [176, 176, 150],
      palm: [104, 120, 92],
    },
  };

  function porchFar(g, P, mode) {
    const hz = PORCH.horizon;
    g.fillStyle = vgrad(g, -100, hz + 10, P.sky);
    g.fillRect(-400, -400, W + 800, hz + 420);
    const sun = mode === 'sunrise' ? PORCH.sunSunrise : PORCH.sunDay;
    LOOK.haze(g, { x: sun[0], y: sun[1], r: mode === 'sunrise' ? 900 : 1100, stops: mode === 'sunrise'
      ? [[0, 'rgba(255,244,214,1)'], [0.12, 'rgba(255,226,180,0.85)'], [0.4, 'rgba(250,200,170,0.35)'], [1, 'rgba(250,190,170,0)']]
      : [[0, 'rgba(255,250,236,1)'], [0.2, 'rgba(255,246,226,0.7)'], [0.5, 'rgba(250,240,220,0.25)'], [1, 'rgba(250,240,220,0)']] });
    const CL = mode === 'sunrise'
      ? [[300, 200, 260, 8, 'rgba(255,214,200,0.6)'], [160, 290, 200, 6, 'rgba(255,224,206,0.5)'], [640, 150, 300, 9, 'rgba(255,206,196,0.5)'], [520, 380, 240, 6, 'rgba(255,232,206,0.55)'], [880, 300, 220, 7, 'rgba(255,236,206,0.5)']]
      : [[300, 200, 260, 8, 'rgba(255,255,250,0.5)'], [640, 150, 300, 9, 'rgba(255,255,250,0.4)'], [520, 380, 240, 6, 'rgba(255,255,250,0.4)']];
    for (const [x, y, rx, ry, c] of CL) {
      g.fillStyle = c;
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0, 0, TAU);
      g.fill();
      g.beginPath();
      g.ellipse(x + rx * 0.25, y - ry * 0.4, rx * 0.5, ry * 0.5, 0, 0, TAU);
      g.fill();
    }
    if (mode === 'sunrise') {
      g.fillStyle = 'rgba(255,240,200,0.9)';
      g.beginPath();
      g.arc(sun[0], sun[1], 40, 0, TAU);
      g.fill();
      g.fillStyle = P.sunCore;
      g.beginPath();
      g.arc(sun[0], sun[1], 30, 0, TAU);
      g.fill();
    }
    const band = (base, amp, sc, seed, c) => {
      g.beginPath();
      g.moveTo(-400, H + 400);
      for (let x = -400; x <= W + 400; x += 6) g.lineTo(x, base - amp * LOOK.fbm(x * sc + seed, seed * 0.31, 3));
      g.lineTo(W + 400, H + 400);
      g.closePath();
      g.fillStyle = vgrad(g, base - amp, base + 40, [[0, rgb(c[0])], [1, rgb(c[1])]]);
      g.fill();
    };
    band(hz + 2, 34, 1 / 300, 5, P.hills[0]);
    band(hz + 18, 26, 1 / 210, 13, P.hills[1]);
    g.fillStyle = rgb(P.tent);
    for (const [tx, tw, th] of [[60, 70, 26], [140, 96, 34], [250, 60, 22], [330, 110, 36], [460, 70, 24]]) {
      g.beginPath();
      g.moveTo(tx, hz + 26);
      g.quadraticCurveTo(tx + tw * 0.5, hz + 26 - th * 1.6, tx + tw, hz + 26);
      g.closePath();
      g.fill();
    }
    g.fillRect(560, hz - 34, 4, 60);
    g.fillRect(586, hz - 34, 4, 60);
    g.fillRect(552, hz - 56, 46, 24);
    band(hz + 44, 18, 1 / 160, 29, P.hills[2]);
    const palm = (x, y, s) => {
      g.strokeStyle = rgb(P.palm);
      g.lineWidth = 5 * s;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + 10 * s, y - 60 * s, x + 4 * s, y - 118 * s);
      g.stroke();
      g.fillStyle = rgb(P.palm);
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI / 2 + (i - 3) * 0.48;
        g.save();
        g.translate(x + 4 * s, y - 118 * s);
        g.rotate(a);
        g.beginPath();
        g.moveTo(0, 0);
        g.quadraticCurveTo(28 * s, -10 * s, 54 * s, 14 * s);
        g.quadraticCurveTo(26 * s, 2 * s, 0, 4 * s);
        g.fill();
        g.restore();
      }
    };
    palm(700, hz + 46, 0.8);
    palm(1000, hz + 52, 1.05);
    palm(-10, hz + 50, 0.9);
    g.fillStyle = vgrad(g, hz + 40, H, [[0, rgb(P.sand[0])], [1, rgb(P.sand[1])]]);
    g.fillRect(-400, hz + 50, W + 800, H + 400);
  }

  function porchNear(g, P, mode) {
    const wd = P.wood;
    const { deckY } = PORCH;
    const sunX = mode === 'sunrise' ? PORCH.sunSunrise[0] : PORCH.sunDay[0];
    g.fillStyle = vgrad(g, deckY, H + 100, [[0, rgb(wd.shade)], [0.2, rgb(wd.base)], [1, rgb(lerpC(wd.base, wd.shade, 0.3))]]);
    g.fillRect(-400, deckY, W + 800, H + 400);
    g.fillStyle = hgrad(g, 0, W, [[0, 'rgba(70,40,50,0.18)'], [0.5, 'rgba(255,220,180,0)'], [1, rgb(P.glow, 0.22)]]);
    g.fillRect(-400, deckY, W + 800, H + 400);
    let y = deckY;
    for (let i = 0; y < H + 200; i++) {
      const hgt = 14 + i * 4.2;
      g.fillStyle = 'rgba(60,34,30,0.32)';
      g.fillRect(-400, y, W + 800, 1.6);
      g.fillStyle = rgb(wd.lit, 0.22);
      g.fillRect(-400, y + 1.6, W + 800, 1.4);
      const rj = LIB.rng(sd('joint', i));
      for (let x = -400 + rj.range(0, 300); x < W + 400; x += rj.range(260, 420)) {
        g.fillStyle = 'rgba(60,34,30,0.28)';
        g.fillRect(x, y, 1.6, hgt);
      }
      y += hgt;
    }
    const balX = [];
    for (let x = 80; x < 1010; x += 34) balX.push(x);
    g.fillStyle = 'rgba(70,40,56,0.13)';
    for (const x of balX) {
      poly(g, [[x - 3, deckY], [x + 4, deckY], [x - 120, deckY + 140], [x - 132, deckY + 140]]);
      g.fill();
    }
    const [wc0, wc1] = P.wall;
    poly(g, [[-400, -400], [40, -400], [40, deckY + 6], [-400, deckY + 380]]);
    g.fillStyle = hgrad(g, -200, 40, [[0, rgb(wc1)], [1, rgb(wc0)]]);
    g.fill();
    const post = (x, y0, y1, w) => {
      g.fillStyle = hgrad(g, x - w / 2, x + w / 2, [[0, rgb(wd.shade)], [0.55, rgb(wd.base)], [0.85, rgb(wd.lit)], [1, rgb(wd.base)]]);
      g.fillRect(x - w / 2, y0, w, y1 - y0);
    };
    for (const x of balX) post(x, 652, deckY, 8);
    g.fillStyle = vgrad(g, 636, 654, [[0, rgb(wd.lit)], [1, rgb(wd.base)]]);
    g.fillRect(40, 636, 990, 18);
    g.fillStyle = rgb(wd.shade);
    g.fillRect(40, 654, 990, 4);
    g.fillStyle = rgb(wd.base);
    g.fillRect(40, deckY - 22, 990, 14);
    post(56, -200, deckY + 4, 30);
    post(1036, -200, deckY + 4, 34);
    g.fillStyle = vgrad(g, -100, 64, [[0, rgb(wd.dark)], [1, rgb(wd.shade)]]);
    g.fillRect(-400, -400, W + 800, 464);
    g.fillStyle = rgb(wd.base);
    g.fillRect(-400, 50, W + 800, 18);
    g.fillStyle = rgb(wd.lit, 0.6);
    g.fillRect(-400, 50, W + 800, 3);
    for (let x = -380; x < W + 400; x += 90) {
      g.fillStyle = rgb(wd.dark);
      g.fillRect(x, -400, 14, 452);
    }
    g.fillStyle = vgrad(g, 68, 130, [[0, 'rgba(60,30,40,0.3)'], [1, 'rgba(60,30,40,0)']]);
    g.fillRect(-400, 68, W + 800, 62);
    g.fillStyle = rgb(lerpC(wd.shade, [120, 90, 70], 0.4));
    poly(g, [[930, 868], [1010, 868], [1000, 940], [940, 940]]);
    g.fill();
    g.fillStyle = mode === 'sunrise' ? 'rgb(112,120,84)' : 'rgb(100,130,80)';
    for (const [x, y, r] of [[950, 858, 20], [972, 846, 24], [994, 860, 18], [962, 836, 14]]) {
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
    }
    void sunX;
  }

  function bench(g, P) {
    const wd = P.wood;
    const { x0, x1, seat, feet } = PORCH.bench;
    g.fillStyle = 'rgba(70,40,56,0.24)';
    poly(g, [[x0 - 10, feet + 2], [x1, feet + 2], [x1 - 150, feet + 34], [x0 - 170, feet + 34]]);
    g.fill();
    for (const y of [700, 730, 760]) {
      g.fillStyle = vgrad(g, y, y + 20, [[0, rgb(wd.lit)], [1, rgb(wd.base)]]);
      g.fillRect(x0, y, x1 - x0, 20);
      g.fillStyle = 'rgba(60,34,30,0.3)';
      g.fillRect(x0, y + 20, x1 - x0, 3);
    }
    for (const x of [x0 + 10, x1 - 22]) {
      g.fillStyle = hgrad(g, x, x + 12, [[0, rgb(wd.shade)], [1, rgb(wd.base)]]);
      g.fillRect(x, 690, 12, feet - 690);
    }
    g.fillStyle = vgrad(g, seat - 4, seat + 22, [[0, rgb(wd.lit)], [0.4, rgb(wd.base)], [1, rgb(wd.shade)]]);
    g.fillRect(x0 - 16, seat - 4, x1 - x0 + 32, 24);
    g.fillStyle = rgb(wd.lit, 0.7);
    g.fillRect(x0 - 16, seat - 4, x1 - x0 + 32, 3);
  }

  function lerpC(a, b, k) {
    return [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * k));
  }

  const PORCH_CACHE = {};
  function porch(S, o) {
    o = o || {};
    const V = view(o.view);
    const mode = o.mode === 'day' ? 'day' : 'sunrise';
    const key = `${S}|${V.key}|${mode}|${o.bench !== false}`;
    if (PORCH_CACHE[key]) return PORCH_CACHE[key];
    const P = PAL[mode];
    const sun = mode === 'sunrise' ? PORCH.sunSunrise : PORCH.sunDay;
    const sp = V.pt(sun);

    const F = makeLayer(S);
    F.g.save();
    V.apply(F.g);
    porchFar(F.g, P, mode);
    F.g.restore();
    texture(F.c, S, 11, { mottle: 0.045, dark: 0.035, light: 0.03, glow: { x: sp[0], y: sp[1], r: 700 * V.z, amount: 0.2, color: P.glow } });

    const N = makeLayer(S);
    N.g.save();
    V.apply(N.g);
    porchNear(N.g, P, mode);
    if (o.bench !== false) bench(N.g, P);
    N.g.restore();
    texture(N.c, S, 12, { mottle: 0.07, dark: 0.06, light: 0.04, glow: { x: sp[0], y: sp[1], r: 900 * V.z, amount: 0.14, color: P.glow } });

    const mist = LOOK.mist(S, { bands: [[V.pt([0, PORCH.horizon + 20])[1], 40 * V.z, 0.75], [V.pt([0, PORCH.horizon + 70])[1], 60 * V.z, 0.3]], color: P.mist });
    const shafts = LOOK.beamField({
      beams: [[-120, 70, 0.6], [40, 110, 0.8], [220, 60, 0.5]],
      dir: mode === 'sunrise' ? [0.25, 0.97] : [0.7, 0.71],
      noise: { base: 0.75, amp: 0.5, scale: 8, offset: 4, row: 9 },
      fall: (X, Y) => sstep(60, 300, Y) * (1 - sstep(700, 960, Y)) * 0.6,
    });
    const glow = LOOK.glowField({ x: sun[0], y: sun[1], r: mode === 'sunrise' ? 420 : 520, amount: 0.65 });
    const light = LOOK.lightLayer(S, { fields: [inView(V, (X, Y) => shafts(X - sun[0], Y - sun[1])), inView(V, glow)], color: P.glow });
    return (PORCH_CACHE[key] = { far: F.c, near: N.c, mist, light, view: V });
  }

  let TINT = null;
  function tintLayer(S) {
    if (!TINT || TINT.S !== S) {
      const L = makeLayer(S);
      TINT = { S, c: L.c, g: L.g };
    }
    TINT.g.save();
    TINT.g.setTransform(1, 0, 0, 1, 0, 0);
    TINT.g.clearRect(0, 0, TINT.c.width, TINT.c.height);
    TINT.g.restore();
    return TINT;
  }
  function tint(L, o) {
    const g = L.g;
    g.save();
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = o.color;
    g.fillRect(0, 0, W, H);
    if (o.pool) {
      const [x, y, r, c] = o.pool;
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, c);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg;
      g.fillRect(0, 0, W, H);
    }
    g.restore();
  }

  FILM.sets = Object.assign(FILM.sets || {}, { hospital: { view, ward, porch, WARD, PORCH, inView, tintLayer, tint } });
})();
