// sets/store.js: procedural set (background, props and light) shared by the scenes.
(function () {
  'use strict';

  const ID = 'set-store';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { makeLayer, poly, vgrad, hgrad, sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const W = 1080, H = 1080;

  const PAL = {
    wall: [126, 150, 124], wallDark: [92, 114, 96], stripe: [146, 168, 138],
    wood: [104, 66, 44], woodLight: [146, 98, 62], woodDark: [62, 38, 28],
    brass: [212, 172, 92], brassLight: [255, 232, 160], brassDark: [140, 102, 46],
    velvet: [118, 30, 48], velvetDark: [64, 14, 28], velvetLight: [168, 62, 82],
    glass: [214, 230, 236], floor: [176, 124, 78], floorDark: [128, 86, 54],
    green: [44, 82, 64], greenLight: [70, 116, 90], cream: [240, 228, 204],
  };
  const rgb = (c, a) => (a == null ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`);
  const mixc = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  const shade = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
  const texture = (c, S, n, o) => LOOK.texture(c, S, Object.assign({ seed: sd('tex', n), offset: n * 13.7 }, o));

  const TOD = {
    day: { lamps: 1, sky: [[0, [236, 230, 206]], [0.6, [244, 226, 186]], [1, [222, 204, 170]]], street: [196, 182, 156], tree: [190, 150, 70], dim: 0, outGlow: 0.55, shop: [[0, [70, 50, 40]], [0.6, [96, 66, 50]], [1, [110, 58, 56]]], warmBokeh: 0.8 },
    dawn: { lamps: 0.12, sky: [[0, [120, 136, 170]], [0.55, [214, 170, 158]], [1, [246, 196, 150]]], street: [120, 116, 128], tree: [96, 92, 108], dim: 0.42, outGlow: 0.45, shop: [[0, [14, 18, 40]], [0.6, [30, 30, 60]], [1, [58, 30, 52]]], warmBokeh: 0.3 },
    winter: { lamps: 1.25, sky: [[0, [38, 48, 78]], [0.6, [62, 74, 104]], [1, [90, 96, 120]]], street: [70, 74, 92], tree: [44, 48, 64], dim: 0.08, outGlow: 0.15, shop: [[0, [52, 34, 30]], [0.6, [80, 52, 42]], [1, [100, 50, 50]]], warmBokeh: 0.9 },
  };
  const todOf = (s) => TOD[s] || TOD.day;

  const R = {
    floor: 850, JH: 260, custFloor: 884,
    counter: { x0: 500, x1: 1140 },
    door: { x0: 64, x1: 232, y0: 318, y1: 850 },
    win: { x0: 272, x1: 470, y0: 286, y1: 668 },
    shelf: { x0: 520, x1: 1100, y0: 210, y1: 700 },
    lamps: [[640, 214], [880, 200], [1080, 214]],
    staffX: [770, 930], custX: 430,
  };
  R.counterY = R.floor - 0.52 * R.JH;

  const counterYOf = (floor, jh) => (FILM.cast && FILM.cast.salesman && FILM.cast.salesman.counterY ? FILM.cast.salesman.counterY(floor, jh) : floor - 0.52 * jh);

  function makeView(angle) {
    if (angle === 'wide' || angle === 'two') {
      const z = angle === 'two' ? 1.6 : 1;
      const cx = angle === 'two' ? 600 : 540, cy = angle === 'two' ? 650 : 540;
      const sx = angle === 'two' ? 540 : 540, sy = angle === 'two' ? 560 : 540;
      const ox = sx - cx * z, oy = sy - cy * z;
      const map = (p) => [ox + p[0] * z, oy + p[1] * z];
      const floor = map([0, R.floor])[1];
      const JH = R.JH * z;
      const d = R.door;
      return {
        angle, z, ox, oy, map, JH, floor, counterY: counterYOf(floor, JH),
        counter: { x0: map([R.counter.x0, 0])[0], x1: map([R.counter.x1, 0])[0], top: counterYOf(floor, JH), base: floor },
        custFloor: map([0, R.custFloor])[1], custH: JH * 1.06,
        staffX: R.staffX.map((x) => map([x, 0])[0]), custX: map([R.custX, 0])[0],
        door: { x0: map([d.x0, 0])[0], x1: map([d.x1, 0])[0], y0: map([0, d.y0])[1], y1: map([0, d.y1])[1], hinge: map([d.x0, 0])[0] },
        lamps: R.lamps.map(map), light: [0.62, -0.78],
        focus: angle === 'two' ? [560, 560] : [520, 600],
      };
    }
    if (angle === 'low') {
      const JH = 600, counterY = 612, floor = counterY + 0.52 * JH;
      return {
        angle, z: 1, JH, floor, counterY: counterYOf(floor, JH) || counterY,
        counter: { x0: -40, x1: 1120, top: counterY, base: 1120 },
        custFloor: 985, custH: 275, staffX: [640, 860], custX: 150,
        lamps: [[318, 96], [842, 70]], light: [0.25, -0.97], focus: [620, 420],
      };
    }
    if (angle === 'close') {
      return {
        angle, z: 1, JH: 900, floor: 1500, counterY: 548, counter: { x0: -40, x1: 1120, top: 548, base: 1120 },
        custFloor: 1400, custH: 900, staffX: [700, 900], custX: 200,
        lamps: [[300, 40], [820, 20]], light: [0.6, -0.8], focus: [540, 640], pad: { x: 540, y: 700, size: 360 },
      };
    }
    return {
      angle: 'window', z: 1, JH: 1400, floor: 2000, counterY: 760, counter: { x0: -40, x1: 1120, top: 760, base: 1120 },
      custFloor: 2000, custH: 1400, staffX: [], custX: 0,
      lamps: [], light: [0.8, -0.6], focus: [540, 560], pad: { x: 540, y: 690, size: 520 },
    };
  }
  const VIEWS = {};
  const view = (angle) => VIEWS[angle] || (VIEWS[angle] = makeView(angle || 'wide'));

  function ringBox(g, x, y, w, c, open) {
    g.fillStyle = rgb(shade(c, 0.7));
    g.fillRect(x, y - w * 0.62, w, w * 0.62);
    g.fillStyle = rgb(c);
    g.fillRect(x, y - w * 0.62, w * 0.72, w * 0.62);
    g.fillStyle = rgb(shade(c, 1.25), 0.6);
    g.fillRect(x, y - w * 0.62, w, w * 0.08);
    g.fillStyle = 'rgba(20,10,10,0.35)';
    g.fillRect(x, y - w * 0.33, w, w * 0.04);
    if (open) {
      g.fillStyle = rgb(shade(c, 0.55));
      g.fillRect(x - w * 0.04, y - w * 1.12, w * 1.08, w * 0.5);
      g.fillStyle = rgb(PAL.cream, 0.8);
      g.fillRect(x + w * 0.08, y - w * 1.04, w * 0.84, w * 0.36);
      g.fillStyle = rgb(PAL.brassLight);
      g.beginPath();
      g.arc(x + w * 0.5, y - w * 0.66, w * 0.08, 0, TAU);
      g.fill();
    }
  }

  function trinkets(g, x0, y0, x1, y1, seed, scale, gap) {
    const r = LIB.rng(sd('trink', seed));
    const n = Math.round((x1 - x0) / (gap || 34));
    for (let i = 0; i < n; i++) {
      const x = lerp(x0 + 10, x1 - 10, (i + 0.5) / n) + r.range(-6, 6);
      const y = lerp(y0, y1, r.range(0.3, 0.75));
      const s = (scale || 1) * r.range(3, 5.5);
      const k = r();
      if (k < 0.45) {
        g.strokeStyle = rgb(mixc(PAL.brass, PAL.brassLight, r() * 0.5));
        g.lineWidth = Math.max(1, s * 0.4);
        g.beginPath();
        g.ellipse(x, y, s, s * 1.2, 0, 0, TAU);
        g.stroke();
        g.fillStyle = 'rgba(236,246,255,0.95)';
        g.beginPath();
        g.arc(x, y - s * 1.3, s * 0.45, 0, TAU);
        g.fill();
      } else if (k < 0.7) {
        g.strokeStyle = rgb(PAL.brassLight, 0.8);
        g.lineWidth = Math.max(0.8, s * 0.22);
        g.beginPath();
        g.moveTo(x - s * 3, y - s);
        g.quadraticCurveTo(x, y + s * 2.4, x + s * 3, y - s);
        g.stroke();
        g.fillStyle = 'rgba(200,232,255,0.9)';
        g.beginPath();
        g.arc(x, y + s * 0.75, s * 0.5, 0, TAU);
        g.fill();
      } else {
        g.fillStyle = rgb(PAL.brass);
        g.beginPath();
        g.arc(x, y, s * 1.1, 0, TAU);
        g.fill();
        g.fillStyle = 'rgb(242,236,220)';
        g.beginPath();
        g.arc(x, y, s * 0.72, 0, TAU);
        g.fill();
      }
    }
  }

  function pendant(g, x, y, s, lit) {
    g.fillStyle = 'rgba(40,30,24,0.8)';
    g.fillRect(x - 1.2 * s, -40, 2.4 * s, y - 24 * s + 40);
    g.fillStyle = rgb(PAL.brassDark);
    g.fillRect(x - 6 * s, y - 28 * s, 12 * s, 8 * s);
    g.beginPath();
    g.moveTo(x - 10 * s, y - 22 * s);
    g.bezierCurveTo(x - 16 * s, y - 8 * s, x - 34 * s, y + 2 * s, x - 38 * s, y + 14 * s);
    g.lineTo(x + 38 * s, y + 14 * s);
    g.bezierCurveTo(x + 34 * s, y + 2 * s, x + 16 * s, y - 8 * s, x + 10 * s, y - 22 * s);
    g.closePath();
    g.fillStyle = hgrad(g, x - 38 * s, x + 38 * s, [[0, rgb(PAL.brassDark)], [0.55, rgb(PAL.brass)], [0.8, rgb(PAL.brassLight)], [1, rgb(PAL.brass)]]);
    g.fill();
    g.beginPath();
    g.ellipse(x, y + 14 * s, 38 * s, 6 * s, 0, 0, TAU);
    g.fillStyle = lit > 0.3 ? 'rgb(255,240,200)' : 'rgb(150,130,100)';
    g.fill();
  }

  function outside(g, T, x0, y0, x1, y1) {
    g.save();
    g.beginPath();
    g.rect(x0, y0, x1 - x0, y1 - y0);
    g.clip();
    g.fillStyle = vgrad(g, y0, y1, T.sky.map(([k, c]) => [k, rgb(c)]));
    g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.filter = 'blur(6px)';
    const mid = lerp(y0, y1, 0.74);
    g.fillStyle = rgb(mixc(T.street, T.sky[0][1], 0.35));
    g.fillRect(x0 - 20, lerp(y0, y1, 0.36), (x1 - x0) * 0.55, mid - lerp(y0, y1, 0.36));
    g.fillStyle = rgb(mixc(T.tree, T.sky[1][1], 0.3), 0.85);
    for (const [u, v, r] of [[0.72, 0.3, 0.26], [0.88, 0.42, 0.22], [0.6, 0.46, 0.18], [0.95, 0.2, 0.2]]) {
      g.beginPath();
      g.arc(lerp(x0, x1, u), lerp(y0, y1, v), (x1 - x0) * r, 0, TAU);
      g.fill();
    }
    g.fillStyle = rgb(shade(T.tree, 0.6), 0.7);
    g.fillRect(lerp(x0, x1, 0.74), lerp(y0, y1, 0.44), 7, mid - lerp(y0, y1, 0.44));
    g.fillStyle = rgb(T.street);
    g.fillRect(x0 - 20, mid, x1 - x0 + 40, y1 - mid + 20);
    g.fillStyle = rgb(mixc(T.street, [255, 250, 236], 0.3));
    g.fillRect(x0 - 20, mid, x1 - x0 + 40, 8);
    g.restore();
  }

  function drawWall(g, T) {
    g.fillStyle = vgrad(g, 0, R.floor, [[0, rgb(shade(PAL.wall, 0.86))], [0.4, rgb(PAL.wall)], [1, rgb(shade(PAL.wall, 0.8))]]);
    g.fillRect(-40, -40, 1260, R.floor + 40);
    for (let x = -30; x < 1200; x += 44) {
      g.fillStyle = rgb(PAL.stripe, 0.32);
      g.fillRect(x, 40, 14, R.floor);
      g.fillStyle = rgb(PAL.wallDark, 0.18);
      g.fillRect(x + 22, 40, 3, R.floor);
    }
    const rd = LIB.rng(sd('damask'));
    for (let x = -8; x < 1200; x += 44) {
      for (let y = 70; y < 640; y += 58) {
        g.fillStyle = rgb(PAL.stripe, 0.22 + rd() * 0.08);
        g.beginPath();
        g.ellipse(x + 3, y + ((x / 44) % 2 ? 29 : 0), 5, 8, 0, 0, TAU);
        g.fill();
      }
    }
    g.fillStyle = rgb(PAL.cream);
    g.fillRect(-40, -40, 1260, 72);
    g.fillStyle = rgb(shade(PAL.cream, 0.82));
    g.fillRect(-40, 32, 1260, 10);
    g.fillStyle = 'rgba(40,30,20,0.25)';
    g.fillRect(-40, 42, 1260, 10);
    const wy = 600;
    g.fillStyle = vgrad(g, wy, R.floor, [[0, rgb(PAL.woodLight)], [1, rgb(PAL.wood)]]);
    g.fillRect(-40, wy, 1260, R.floor - wy);
    g.fillStyle = rgb(PAL.woodDark, 0.6);
    g.fillRect(-40, wy - 6, 1260, 8);
    g.fillStyle = rgb(PAL.brassLight, 0.25);
    g.fillRect(-40, wy - 6, 1260, 2);
    for (let x = -20; x < 1200; x += 120) {
      g.fillStyle = rgb(PAL.woodDark, 0.25);
      g.fillRect(x + 12, wy + 24, 96, R.floor - wy - 60);
      g.fillStyle = rgb(PAL.woodLight, 0.3);
      g.fillRect(x + 14, wy + 26, 92, 3);
    }
    g.fillStyle = rgb(PAL.woodDark);
    g.fillRect(-40, R.floor - 18, 1260, 18);
  }

  function drawShelves(g) {
    const { x0, x1, y0, y1 } = R.shelf;
    g.fillStyle = vgrad(g, y0, y1, [[0, rgb(PAL.wood)], [1, rgb(PAL.woodDark)]]);
    g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = rgb(PAL.woodDark, 0.7);
    g.fillRect(x0 + 10, y0 + 30, x1 - x0 - 20, y1 - y0 - 40);
    g.fillStyle = rgb(PAL.woodLight);
    g.fillRect(x0 - 8, y0 - 12, x1 - x0 + 16, 16);
    const rows = [300, 400, 500, 600];
    const r = LIB.rng(sd('shelf'));
    const boxC = [PAL.velvet, [38, 52, 92], [40, 76, 60], [120, 30, 48], [30, 40, 70]];
    rows.forEach((y, ri) => {
      g.fillStyle = rgb(PAL.woodLight);
      g.fillRect(x0 + 10, y, x1 - x0 - 20, 9);
      g.fillStyle = rgb(PAL.brassLight, 0.35);
      g.fillRect(x0 + 10, y, x1 - x0 - 20, 2);
      g.fillStyle = 'rgba(20,10,6,0.45)';
      g.fillRect(x0 + 10, y + 9, x1 - x0 - 20, 7);
      if (ri === 0) return;
      for (let x = x0 + 26; x < x1 - 40; ) {
        const k = r();
        if (k < 0.55) {
          const w = r.range(22, 34);
          ringBox(g, x, y, w, boxC[(r() * boxC.length) | 0], r() < 0.3);
          x += w + r.range(8, 22);
        } else if (k < 0.7) {
          g.fillStyle = 'rgba(220,236,240,0.25)';
          g.beginPath();
          g.ellipse(x + 18, y - 26, 18, 26, 0, Math.PI, 0);
          g.lineTo(x + 36, y);
          g.lineTo(x, y);
          g.fill();
          g.fillStyle = rgb(PAL.brass);
          g.beginPath();
          g.arc(x + 18, y - 18, 8, 0, TAU);
          g.fill();
          g.fillStyle = 'rgb(240,234,218)';
          g.beginPath();
          g.arc(x + 18, y - 18, 5.5, 0, TAU);
          g.fill();
          g.fillStyle = rgb(PAL.woodDark);
          g.fillRect(x - 2, y - 4, 40, 4);
          x += 50;
        } else if (k < 0.82) {
          g.fillStyle = rgb([196, 186, 160]);
          g.beginPath();
          g.moveTo(x + 6, y);
          g.quadraticCurveTo(x - 4, y - 30, x + 8, y - 44);
          g.lineTo(x + 18, y - 44);
          g.quadraticCurveTo(x + 30, y - 30, x + 20, y);
          g.fill();
          g.fillStyle = 'rgba(255,250,230,0.35)';
          g.fillRect(x + 8, y - 36, 3, 28);
          x += 40;
        } else {
          x += r.range(20, 50);
        }
      }
    });
    const mx = 700;
    g.fillStyle = rgb(PAL.woodDark);
    g.beginPath();
    g.moveTo(mx - 40, 300);
    g.lineTo(mx - 40, 262);
    g.quadraticCurveTo(mx, 226, mx + 40, 262);
    g.lineTo(mx + 40, 300);
    g.fill();
    g.fillStyle = 'rgb(240,232,210)';
    g.beginPath();
    g.arc(mx, 270, 18, 0, TAU);
    g.fill();
    g.strokeStyle = 'rgba(40,30,24,0.8)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(mx, 270);
    g.lineTo(mx, 257);
    g.moveTo(mx, 270);
    g.lineTo(mx + 9, 274);
    g.stroke();
    const bx = 930;
    g.strokeStyle = rgb(PAL.brass);
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(bx, 300);
    g.lineTo(bx, 246);
    g.moveTo(bx - 34, 250);
    g.lineTo(bx + 34, 250);
    g.stroke();
    for (const s of [-1, 1]) {
      g.beginPath();
      g.ellipse(bx + 30 * s, 268, 14, 4, 0, 0, TAU);
      g.fillStyle = rgb(PAL.brass);
      g.fill();
      g.strokeStyle = rgb(PAL.brass, 0.7);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(bx + 30 * s - 12, 268);
      g.lineTo(bx + 30 * s, 250);
      g.lineTo(bx + 30 * s + 12, 268);
      g.stroke();
    }
    const cx = 1000, cy = 118;
    g.fillStyle = rgb(PAL.woodDark);
    g.beginPath();
    g.arc(cx, cy, 52, 0, TAU);
    g.fill();
    g.fillStyle = rgb(PAL.brass);
    g.beginPath();
    g.arc(cx, cy, 46, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(244,238,222)';
    g.beginPath();
    g.arc(cx, cy, 40, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(40,30,24,0.7)';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      g.fillRect(cx + Math.cos(a) * 33 - 1.5, cy + Math.sin(a) * 33 - 1.5, 3, 3);
    }
    g.strokeStyle = 'rgba(30,22,18,0.9)';
    g.lineWidth = 3;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(cx + 15, cy + 12);
    g.moveTo(cx, cy);
    g.lineTo(cx - 4, cy - 28);
    g.stroke();
    g.fillStyle = rgb(PAL.brassDark);
    g.fillRect(800, 80, 96, 76);
    g.fillStyle = 'rgb(238,228,200)';
    g.fillRect(808, 88, 80, 60);
    g.fillStyle = 'rgba(120,90,60,0.35)';
    for (let i = 0; i < 4; i++) g.fillRect(818, 100 + i * 11, 60 - (i % 2) * 18, 3);
  }

  function drawWindowBack(g, T) {
    const { x0, x1, y0, y1 } = R.win;
    g.fillStyle = rgb(PAL.green);
    g.fillRect(x0 - 16, y0 - 16, x1 - x0 + 32, 380 + 200);
    outside(g, T, x0, y0, x1, y1);
    g.save();
    g.translate((x0 + x1) / 2, y0 + 60);
    g.scale(-1, 1);
    g.font = 'italic 17px Georgia, "Times New Roman", serif';
    g.textAlign = 'center';
    g.fillStyle = 'rgba(214,176,96,0.75)';
    g.fillText('Fine Diamonds & Gold', 0, 0);
    g.restore();
    g.fillStyle = rgb(PAL.greenLight);
    g.fillRect((x0 + x1) / 2 - 4, y0, 8, y1 - y0);
    const by = y1 - 30;
    g.fillStyle = vgrad(g, by - 12, y1, [[0, rgb(PAL.velvetLight)], [1, rgb(PAL.velvet)]]);
    g.fillRect(x0, by - 12, x1 - x0, y1 - by + 12);
    g.fillStyle = rgb(PAL.velvetDark);
    g.beginPath();
    g.moveTo(x0 + 30, by - 12);
    g.quadraticCurveTo(x0 + 34, by - 64, x0 + 52, by - 70);
    g.quadraticCurveTo(x0 + 70, by - 64, x0 + 74, by - 12);
    g.fill();
    g.fillRect(x0 + 120, by - 34, 34, 22);
    g.fillRect(x1 - 52, by - 22, 40, 10);
    g.fillStyle = vgrad(g, y1, R.floor, [[0, rgb(PAL.greenLight)], [1, rgb(PAL.green)]]);
    g.fillRect(x0 - 16, y1, x1 - x0 + 32, R.floor - y1);
    g.fillStyle = rgb(PAL.brass, 0.8);
    g.fillRect(x0 - 16, y1, x1 - x0 + 32, 5);
    g.fillStyle = 'rgba(10,24,18,0.3)';
    g.fillRect(x0 + 6, y1 + 30, x1 - x0 - 12, R.floor - y1 - 70);
  }

  function drawDoorway(g, T) {
    const d = R.door;
    g.fillStyle = rgb(PAL.woodDark);
    g.fillRect(d.x0 - 20, d.y0 - 22, d.x1 - d.x0 + 40, d.y1 - d.y0 + 22);
    g.fillStyle = rgb(PAL.woodLight);
    g.fillRect(d.x0 - 14, d.y0 - 16, d.x1 - d.x0 + 28, 6);
    outside(g, T, d.x0, d.y0, d.x1, d.y1);
    g.fillStyle = rgb(mixc(T.street, [255, 250, 236], 0.25));
    g.fillRect(d.x0, d.y1 - 40, d.x1 - d.x0, 40);
    g.fillStyle = rgb(PAL.brass);
    g.fillRect(d.x0 - 6, d.y1 - 6, d.x1 - d.x0 + 12, 6);
  }

  function drawFloor(g) {
    g.fillStyle = vgrad(g, R.floor, 1080 + 300, [[0, rgb(PAL.floorDark)], [0.25, rgb(PAL.floor)], [1, rgb(shade(PAL.floor, 1.06))]]);
    g.fillRect(-300, R.floor, 1800, 600);
    const vp = [560, 360];
    const r = LIB.rng(sd('plank'));
    for (let xb = -1400; xb < 2600; xb += 120) {
      const k = (R.floor - vp[1]) / (1500 - vp[1]);
      const xa = vp[0] + (xb - vp[0]) * k;
      g.strokeStyle = 'rgba(80,50,30,0.32)';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(xa, R.floor);
      g.lineTo(xb, 1500);
      g.stroke();
      g.fillStyle = r() < 0.5 ? 'rgba(90,56,30,0.07)' : 'rgba(255,230,190,0.06)';
      poly(g, [[xa, R.floor], [xa + 120 * k, R.floor], [xb + 120, 1500], [xb, 1500]]);
      g.fill();
    }
    g.fillStyle = rgb([120, 40, 44]);
    poly(g, [[320, 902], [1200, 902], [1300, 1080], [220, 1080]]);
    g.fill();
    g.fillStyle = rgb([176, 120, 70], 0.8);
    poly(g, [[336, 912], [1190, 912], [1280, 1070], [238, 1070]]);
    g.fill();
    g.fillStyle = rgb([128, 44, 48]);
    poly(g, [[352, 922], [1180, 922], [1262, 1060], [256, 1060]]);
    g.fill();
    g.fillStyle = vgrad(g, R.floor, R.floor + 40, [[0, 'rgba(40,20,12,0.45)'], [1, 'rgba(40,20,12,0)']]);
    g.fillRect(R.counter.x0 - 20, R.floor, 900, 40);
  }

  function drawCounterRoom(g) {
    const { x0, x1 } = R.counter;
    const top = R.counterY, base = R.floor;
    const gl0 = top + 12, gl1 = top + (base - top) * 0.62;
    g.fillStyle = vgrad(g, gl0, gl1, [[0, 'rgb(250,236,206)'], [0.5, 'rgb(214,186,150)'], [1, 'rgb(160,120,90)']]);
    g.fillRect(x0, gl0, x1 - x0, gl1 - gl0);
    g.fillStyle = vgrad(g, gl1 - 30, gl1, [[0, rgb(PAL.velvetLight)], [1, rgb(PAL.velvet)]]);
    g.fillRect(x0, gl1 - 30, x1 - x0, 30);
    trinkets(g, x0 + 10, gl1 - 32, x1 - 10, gl1 - 8, 1, 1);
    g.fillStyle = 'rgba(255,255,255,0.16)';
    for (const u of [x0 + 60, x0 + 300, x0 + 520]) {
      poly(g, [[u, gl0], [u + 40, gl0], [u + 10, gl1], [u - 30, gl1]]);
      g.fill();
    }
    g.fillStyle = rgb(PAL.wood);
    for (let x = x0; x < x1; x += 200) g.fillRect(x, gl0, 8, gl1 - gl0);
    g.fillStyle = hgrad(g, x0, x1, [[0, rgb(PAL.woodLight)], [1, rgb(PAL.wood)]]);
    g.fillRect(x0 - 8, top - 3, x1 - x0 + 16, 15);
    g.fillStyle = rgb(PAL.brassLight, 0.7);
    g.fillRect(x0 - 8, top - 3, x1 - x0 + 16, 2);
    g.fillStyle = rgb(PAL.brass);
    g.fillRect(x0, gl0 - 2, x1 - x0, 3);
    g.fillRect(x0, gl1, x1 - x0, 4);
    g.fillStyle = vgrad(g, gl1 + 4, base, [[0, rgb(PAL.wood)], [1, rgb(PAL.woodDark)]]);
    g.fillRect(x0, gl1 + 4, x1 - x0, base - gl1 - 4);
    for (let x = x0 + 14; x < x1; x += 200) {
      g.fillStyle = rgb(PAL.woodDark, 0.5);
      g.fillRect(x, gl1 + 14, 172, base - gl1 - 30);
      g.fillStyle = rgb(PAL.woodLight, 0.35);
      g.fillRect(x, gl1 + 14, 172, 2);
    }
    g.fillStyle = rgb(shade(PAL.wood, 0.72));
    poly(g, [[x0 - 8, top - 3], [x0, top - 3], [x0, base], [x0 - 8, base]]);
    g.fill();
    g.fillStyle = 'rgba(30,16,10,0.35)';
    g.fillRect(x0 - 8, top + 12, 8, base - top - 12);
  }

  function roomLayer(S, V, draw) {
    const { c, g } = makeLayer(S);
    g.save();
    g.translate(V.ox, V.oy);
    g.scale(V.z, V.z);
    draw(g);
    g.restore();
    return { c, g };
  }

  function buildRoomBack(S, V, T, tod) {
    const { c } = roomLayer(S, V, (g) => {
      drawWall(g, T);
      drawShelves(g);
      drawWindowBack(g, T);
      drawDoorway(g, T);
      drawFloor(g);
      for (const [x, y] of R.lamps) pendant(g, x, y, 1, T.lamps);
    });
    const lp = V.lamps[1];
    texture(c, S, 1, { mottle: 0.06, dark: 0.05, light: 0.035, glow: { x: lp[0], y: lp[1], r: 700 * V.z, amount: 0.12 * T.lamps } });
    return c;
  }

  function buildRoomCounter(S, V) {
    const { c } = roomLayer(S, V, drawCounterRoom);
    texture(c, S, 2, { mottle: 0.06, dark: 0.05, light: 0.035 });
    return c;
  }

  function buildRoomLight(S, V, T) {
    const fields = [];
    for (const [x, y] of V.lamps) {
      fields.push(LOOK.glowField({ x, y: y + 10 * V.z, r: 90 * V.z, amount: 0.75 * Math.min(1, T.lamps) }));
      const len = 560 * V.z;
      fields.push((X, Y) => {
        const dy = Y - y;
        if (dy < 0 || dy > len) return 0;
        const w = 40 * V.z + dy * 0.42;
        const u = Math.abs(X - x) / w;
        return 0.22 * Math.min(1, T.lamps) * Math.max(0, 1 - u * u) * (1 - dy / len);
      });
    }
    const w0 = V.map([R.win.x0, R.win.y0]), w1 = V.map([R.win.x1, R.win.y1]);
    fields.push(LOOK.glowField({ x: (w0[0] + w1[0]) / 2, y: (w0[1] + w1[1]) / 2, r: 260 * V.z, amount: T.outGlow * 0.6 }));
    const d0 = V.map([R.door.x0, R.door.y0]), d1 = V.map([R.door.x1, R.door.y1]);
    fields.push(LOOK.glowField({ x: (d0[0] + d1[0]) / 2, y: (d0[1] + d1[1]) / 2, r: 240 * V.z, amount: T.outGlow * 0.35 }));
    return LOOK.lightLayer(S, { fields, color: [255, 228, 180] });
  }

  function buildLowBack(S, V, T) {
    const { c, g } = makeLayer(S);
    const top = V.counterY;
    g.fillStyle = vgrad(g, 0, 190, [[0, 'rgb(150,128,100)'], [1, 'rgb(212,192,160)']]);
    g.fillRect(0, 0, W, 200);
    const vp = [560, -900];
    for (let x = -600; x < 1800; x += 210) {
      g.fillStyle = 'rgba(70,46,30,0.5)';
      const k = (190 - vp[1]) / (0 - vp[1]);
      poly(g, [[vp[0] + (x - vp[0]) / k, 0], [vp[0] + (x + 26 - vp[0]) / k, 0], [x + 26, 190], [x, 190]]);
      g.fill();
    }
    g.fillStyle = rgb(PAL.cream);
    g.fillRect(0, 178, W, 22);
    g.fillStyle = 'rgba(60,40,24,0.35)';
    g.fillRect(0, 200, W, 12);
    g.fillStyle = vgrad(g, 200, top, [[0, rgb(shade(PAL.wall, 0.8))], [1, rgb(PAL.wall)]]);
    g.fillRect(0, 200, W, top - 200);
    const lean = (x, y) => x + (x - 540) * (top - y) * 0.00016;
    for (let x = -60; x < 1140; x += 54) {
      g.fillStyle = rgb(PAL.stripe, 0.3);
      poly(g, [[lean(x, 200), 200], [lean(x + 16, 200), 200], [lean(x + 16, top), top], [lean(x, top), top]]);
      g.fill();
    }
    const sx0 = -60, sx1 = 1140;
    const up = (x, y) => lean(x, y);
    g.fillStyle = vgrad(g, 220, top, [[0, rgb(PAL.woodDark)], [1, rgb(PAL.wood)]]);
    poly(g, [[up(sx0, 230), 230], [up(sx1, 230), 230], [up(sx1, top), top], [up(sx0, top), top]]);
    g.fill();
    g.fillStyle = rgb(PAL.woodDark, 0.65);
    poly(g, [[up(sx0 + 16, 250), 250], [up(sx1 - 16, 250), 250], [up(sx1 - 16, top), top], [up(sx0 + 16, top), top]]);
    g.fill();
    const r = LIB.rng(sd('lowshelf'));
    const boxC = [PAL.velvet, [38, 52, 92], [40, 76, 60], [30, 40, 70]];
    for (const y of [340, 470, 590]) {
      g.fillStyle = rgb(PAL.woodLight);
      poly(g, [[up(sx0 + 16, y), y], [up(sx1 - 16, y), y], [up(sx1 - 16, y + 10), y + 10], [up(sx0 + 16, y + 10), y + 10]]);
      g.fill();
      g.fillStyle = 'rgba(30,16,10,0.6)';
      poly(g, [[up(sx0 + 16, y + 10), y + 10], [up(sx1 - 16, y + 10), y + 10], [up(sx1 - 16, y + 22), y + 22], [up(sx0 + 16, y + 22), y + 22]]);
      g.fill();
      for (let x = sx0 + 40; x < sx1 - 60; ) {
        const w = r.range(30, 46);
        if (r() < 0.75) ringBox(g, up(x, y), y, w, boxC[(r() * boxC.length) | 0], r() < 0.25);
        x += w + r.range(14, 40);
      }
    }
    for (const [x, y] of V.lamps) {
      g.fillStyle = 'rgba(40,30,24,0.8)';
      g.fillRect(x - 2, 0, 4, y - 30);
      g.beginPath();
      g.moveTo(x - 16, y - 34);
      g.bezierCurveTo(x - 30, y - 10, x - 70, y + 4, x - 76, y + 26);
      g.lineTo(x + 76, y + 26);
      g.bezierCurveTo(x + 70, y + 4, x + 30, y - 10, x + 16, y - 34);
      g.closePath();
      g.fillStyle = hgrad(g, x - 76, x + 76, [[0, rgb(PAL.brassDark)], [0.6, rgb(PAL.brass)], [0.85, rgb(PAL.brassLight)], [1, rgb(PAL.brass)]]);
      g.fill();
      g.beginPath();
      g.ellipse(x, y + 26, 76, 22, 0, 0, TAU);
      g.fillStyle = T.lamps > 0.3 ? 'rgb(255,236,190)' : 'rgb(150,128,100)';
      g.fill();
      g.beginPath();
      g.ellipse(x, y + 30, 22, 14, 0, 0, TAU);
      g.fillStyle = T.lamps > 0.3 ? 'rgb(255,252,236)' : 'rgb(170,150,120)';
      g.fill();
    }
    texture(c, S, 3, { mottle: 0.06, dark: 0.05, light: 0.035, glow: { x: V.lamps[1][0], y: V.lamps[1][1], r: 700, amount: 0.14 * T.lamps } });
    return c;
  }

  function buildLowCounter(S, V) {
    const { c, g } = makeLayer(S);
    const top = V.counterY;
    const gl0 = top + 26, gl1 = 900;
    g.fillStyle = hgrad(g, 0, W, [[0, rgb(PAL.wood)], [0.6, rgb(PAL.woodLight)], [1, rgb(PAL.wood)]]);
    g.fillRect(-20, top - 4, W + 40, 22);
    g.fillStyle = rgb(PAL.brassLight, 0.75);
    g.fillRect(-20, top - 4, W + 40, 3);
    g.fillStyle = rgb(PAL.woodDark);
    g.fillRect(-20, top + 18, W + 40, 8);
    g.fillStyle = vgrad(g, gl0, gl1, [[0, 'rgb(120,84,62)'], [0.35, 'rgb(220,190,150)'], [1, 'rgb(250,232,200)']]);
    g.fillRect(-20, gl0, W + 40, gl1 - gl0);
    for (const [y, h] of [[700, 46], [820, 52]]) {
      g.fillStyle = vgrad(g, y, y + h, [[0, rgb(PAL.velvet)], [1, rgb(PAL.velvetLight)]]);
      g.fillRect(-20, y, W + 40, h);
      trinkets(g, 0, y - 4, W, y + h * 0.6, y, 2, 110);
    }
    g.fillStyle = 'rgba(255,255,255,0.14)';
    for (const u of [120, 470, 840]) {
      poly(g, [[u, gl0], [u + 70, gl0], [u + 20, gl1], [u - 50, gl1]]);
      g.fill();
    }
    g.fillStyle = rgb(PAL.wood);
    for (const x of [-10, 356, 722, 1088]) g.fillRect(x, gl0, 12, gl1 - gl0);
    g.fillStyle = rgb(PAL.brass);
    g.fillRect(-20, gl1, W + 40, 6);
    g.fillStyle = vgrad(g, gl1 + 6, H, [[0, rgb(PAL.wood)], [1, rgb(PAL.woodDark)]]);
    g.fillRect(-20, gl1 + 6, W + 40, H - gl1);
    texture(c, S, 4, { mottle: 0.06, dark: 0.05, light: 0.035 });
    return c;
  }

  function buildLowLight(S, V, T) {
    const fields = [];
    for (const [x, y] of V.lamps) {
      fields.push(LOOK.glowField({ x, y: y + 30, r: 170, amount: 0.9 * Math.min(1, T.lamps) }));
      fields.push((X, Y) => {
        const dy = Y - (y + 30);
        if (dy < 0 || dy > 700) return 0;
        const w = 70 + dy * 0.5;
        const u = Math.abs(X - x) / w;
        return 0.2 * Math.min(1, T.lamps) * Math.max(0, 1 - u * u) * (1 - dy / 700);
      });
    }
    return LOOK.lightLayer(S, { fields, color: [255, 226, 176] });
  }

  function buildCloseBack(S, V, T) {
    const { c, g } = makeLayer(S);
    const top = V.counterY;
    g.fillStyle = vgrad(g, 0, top, [[0, rgb(shade(PAL.wood, 0.7))], [1, rgb(shade(PAL.wood, 1.05))]]);
    g.fillRect(0, 0, W, top + 10);
    g.save();
    g.filter = 'blur(14px)';
    const r = LIB.rng(sd('closeshelf'));
    for (const y of [150, 330, 500]) {
      g.fillStyle = rgb(PAL.woodLight);
      g.fillRect(-40, y, W + 80, 18);
      for (let x = 0; x < W; ) {
        const w = r.range(50, 80);
        g.fillStyle = rgb([PAL.velvet, [38, 52, 92], [40, 76, 60]][(r() * 3) | 0]);
        g.fillRect(x, y - w * 0.62, w, w * 0.62);
        x += w + r.range(30, 90);
      }
    }
    g.fillStyle = rgb(PAL.wall, 0.6);
    g.fillRect(0, 0, W, 40);
    g.restore();
    for (let i = 0; i < 14; i++) {
      const x = r.range(-40, W + 40), y = r.range(20, top - 40), rr = r.range(18, 54);
      const gl = g.createRadialGradient(x, y, 0, x, y, rr);
      gl.addColorStop(0, `rgba(255,226,170,${0.35 * T.lamps})`);
      gl.addColorStop(0.75, `rgba(255,210,150,${0.22 * T.lamps})`);
      gl.addColorStop(1, 'rgba(255,210,150,0)');
      g.fillStyle = gl;
      g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr);
    }
    g.fillStyle = vgrad(g, top, H, [[0, 'rgb(96,64,50)'], [0.3, 'rgb(150,104,80)'], [1, 'rgb(118,74,56)']]);
    g.fillRect(0, top, W, H - top);
    g.save();
    g.filter = 'blur(9px)';
    for (const [y0, y1] of [[top + 40, top + 170], [top + 240, top + 420]]) {
      g.fillStyle = rgb(PAL.velvet);
      g.fillRect(-20, y0, W + 40, y1 - y0);
      trinkets(g, -20, y0 + 20, W + 20, y1 - 20, y0, 3, 130);
    }
    g.restore();
    g.fillStyle = 'rgba(60,30,26,0.45)';
    g.fillRect(0, top, W, H - top);
    g.fillStyle = vgrad(g, top, H, [[0, 'rgba(230,240,246,0.24)'], [0.5, 'rgba(230,240,246,0.06)'], [1, 'rgba(230,240,246,0.14)']]);
    g.fillRect(0, top, W, H - top);
    g.save();
    g.filter = 'blur(16px)';
    g.fillStyle = 'rgba(255,246,226,0.12)';
    poly(g, [[700, top], [820, top], [560, H], [400, H]]);
    g.fill();
    g.restore();
    g.fillStyle = rgb(PAL.brass);
    g.fillRect(0, top - 4, W, 6);
    g.fillStyle = rgb(PAL.brassLight, 0.7);
    g.fillRect(0, top - 4, W, 2);
    const p = V.pad;
    g.fillStyle = 'rgba(30,10,10,0.35)';
    g.beginPath();
    g.ellipse(p.x + 10, p.y + 22, p.size * 0.62, p.size * 0.2, 0, 0, TAU);
    g.fill();
    g.fillStyle = rgb(PAL.velvetDark);
    g.beginPath();
    g.ellipse(p.x, p.y + 10, p.size * 0.56, p.size * 0.17, 0, 0, TAU);
    g.fill();
    g.fillStyle = vgrad(g, p.y - p.size * 0.16, p.y + p.size * 0.16, [[0, rgb(PAL.velvetLight)], [1, rgb(PAL.velvet)]]);
    g.beginPath();
    g.ellipse(p.x, p.y, p.size * 0.55, p.size * 0.16, 0, 0, TAU);
    g.fill();
    texture(c, S, 5, { mottle: 0.06, dark: 0.05, light: 0.035, glow: { x: 700, y: 0, r: 900, amount: 0.12 * T.lamps } });
    return c;
  }

  function buildCloseLight(S, V, T) {
    const fields = [LOOK.glowField({ x: 760, y: -40, r: 520, amount: 0.45 * Math.min(1, T.lamps) }), LOOK.glowField({ x: V.pad.x, y: V.pad.y, r: 300, amount: 0.22 * Math.min(1, T.lamps) })];
    return LOOK.lightLayer(S, { fields, color: [255, 226, 176] });
  }

  function buildWindowBack(S, V, T) {
    const { c, g } = makeLayer(S);
    const bed = V.counterY;
    g.fillStyle = vgrad(g, 0, bed, T.shop.map(([k, c]) => [k, rgb(c)]));
    g.fillRect(0, 0, W, bed + 20);
    g.save();
    g.filter = 'blur(26px)';
    g.fillStyle = 'rgba(96,66,48,0.6)';
    g.fillRect(-40, 250, W + 80, 26);
    g.fillRect(-40, 470, W + 80, 26);
    g.fillStyle = 'rgba(120,40,56,0.7)';
    g.beginPath();
    g.moveTo(110, bed + 10);
    g.quadraticCurveTo(120, 470, 190, 440);
    g.quadraticCurveTo(260, 470, 270, bed + 10);
    g.fill();
    g.fillStyle = 'rgba(110,34,48,0.8)';
    g.fillRect(800, bed - 80, 200, 90);
    g.restore();
    const r = LIB.rng(sd('winbokeh'));
    for (let i = 0; i < 16; i++) {
      const x = r.range(-20, W + 20), y = r.range(60, bed - 60), rr = r.range(16, 50);
      const warm = r() < T.warmBokeh;
      const gl = g.createRadialGradient(x, y, 0, x, y, rr);
      const cc = warm ? '255,206,140' : '150,176,236';
      const a = (warm ? 0.16 : 0.14) * (0.6 + r());
      gl.addColorStop(0, `rgba(${cc},${a})`);
      gl.addColorStop(0.8, `rgba(${cc},${a * 0.7})`);
      gl.addColorStop(1, `rgba(${cc},0)`);
      g.fillStyle = gl;
      g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr);
    }
    g.fillStyle = vgrad(g, bed - 30, H, [[0, 'rgb(60,16,28)'], [0.18, rgb(PAL.velvetDark)], [0.55, rgb(PAL.velvet)], [1, rgb(shade(PAL.velvet, 0.8))]]);
    g.beginPath();
    g.moveTo(-20, bed);
    for (let x = -20; x <= W + 20; x += 20) g.lineTo(x, bed - 18 * Math.sin(x * 0.004 + 1.3) - 8 * Math.sin(x * 0.011));
    g.lineTo(W + 20, H + 10);
    g.lineTo(-20, H + 10);
    g.closePath();
    g.fill();
    g.save();
    g.filter = 'blur(10px)';
    for (const [x, a] of [[220, 0.2], [430, 0.14], [810, 0.18], [960, 0.12]]) {
      g.fillStyle = `rgba(190,80,100,${a})`;
      g.beginPath();
      g.ellipse(x, bed + 160, 34, 220, 0.25, 0, TAU);
      g.fill();
      g.fillStyle = `rgba(30,6,14,${a * 1.4})`;
      g.beginPath();
      g.ellipse(x + 50, bed + 180, 20, 220, 0.25, 0, TAU);
      g.fill();
    }
    g.restore();
    texture(c, S, 6, { mottle: 0.07, dark: 0.06, light: 0.04 });
    return c;
  }

  function buildWindowGlass(S, V, T) {
    const { c, g } = makeLayer(S);
    g.fillStyle = vgrad(g, 0, 420, [[0, `rgba(${T.sky[1][1].join(',')},0.14)`], [1, 'rgba(255,255,255,0)']]);
    g.fillRect(0, 0, W, 420);
    g.filter = 'blur(18px)';
    g.fillStyle = 'rgba(255,248,236,0.05)';
    poly(g, [[120, 0], [260, 0], [60, H], [-80, H]]);
    g.fill();
    g.fillStyle = 'rgba(255,248,236,0.035)';
    poly(g, [[760, 0], [810, 0], [650, H], [600, H]]);
    g.fill();
    return c;
  }

  const CACHE = new Map();
  function statics(S, o) {
    o = o || {};
    const angle = o.angle || 'wide', tod = TOD[o.tod] ? o.tod : 'day';
    const key = `${S}|${angle}|${tod}`;
    let C = CACHE.get(key);
    if (C) return C;
    const V = view(angle), T = todOf(tod);
    C = { S, V, T, angle, tod };
    if (angle === 'wide' || angle === 'two') {
      C.back = buildRoomBack(S, V, T, tod);
      C.counter = buildRoomCounter(S, V);
      C.light = buildRoomLight(S, V, T);
    } else if (angle === 'low') {
      C.back = buildLowBack(S, V, T);
      C.counter = buildLowCounter(S, V);
      C.light = buildLowLight(S, V, T);
    } else if (angle === 'close') {
      C.back = buildCloseBack(S, V, T);
      C.light = buildCloseLight(S, V, T);
    } else {
      C.back = buildWindowBack(S, V, T);
      C.glass = buildWindowGlass(S, V, T);
    }
    CACHE.set(key, C);
    return C;
  }

  function doorLeaf(ctx, C, open, t) {
    const V = C.V;
    if (!V.map) return;
    const d = R.door;
    ctx.save();
    ctx.translate(V.ox, V.oy);
    ctx.scale(V.z, V.z);
    const w = d.x1 - d.x0, hgt = d.y1 - d.y0;
    const a = clamp01(open) * 1.3;
    const fw = w * Math.cos(a);
    const grow = Math.sin(a) * 34;
    const x0 = d.x0, x1 = d.x0 + fw;
    const P = [[x0, d.y0], [x1, d.y0 - grow * 0.5], [x1, d.y1 + grow * 0.5], [x0, d.y1]];
    const lit = 1 - 0.35 * sstep(0, 1, open);
    poly(ctx, P);
    ctx.fillStyle = rgb(shade(PAL.green, lit));
    ctx.fill();
    const L = (u, v) => [lerp(x0, x1, u), lerp(d.y0, d.y1, v) + (u * grow) * (v - 0.5)];
    const quad = (u0, v0, u1, v1) => poly(ctx, [L(u0, v0), L(u1, v0), L(u1, v1), L(u0, v1)]);
    quad(0.12, 0.06, 0.88, 0.5);
    ctx.fillStyle = rgb(shade(PAL.greenLight, lit));
    ctx.fill();
    quad(0.18, 0.09, 0.82, 0.47);
    ctx.fillStyle = `rgba(${C.T.sky[1][1].join(',')},${0.85 * lit})`;
    ctx.fill();
    const s0 = L(0.3, 0.3), s1 = L(0.7, 0.38);
    if (fw > 30) {
      ctx.fillStyle = 'rgb(236,226,196)';
      poly(ctx, [s0, [s1[0], s0[1] - (grow * 0.08)], [s1[0], s1[1] - grow * 0.08], [s0[0], s1[1]]]);
      ctx.fill();
      ctx.save();
      ctx.translate((s0[0] + s1[0]) / 2, (s0[1] + s1[1]) / 2 + 4);
      ctx.scale(Math.max(0.05, fw / w), 1);
      ctx.fillStyle = 'rgb(176,48,44)';
      ctx.font = 'bold 13px Helvetica, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(C.tod === 'dawn' ? 'OPEN' : 'CLOSED', 0, 0);
      ctx.restore();
    }
    quad(0.12, 0.58, 0.88, 0.94);
    ctx.fillStyle = rgb(shade(PAL.wallDark, 0.6 * lit), 0.5);
    ctx.fill();
    const k = L(0.9, 0.56);
    ctx.fillStyle = rgb(PAL.brass);
    ctx.beginPath();
    ctx.arc(k[0], k[1], 5 + grow * 0.06, 0, TAU);
    ctx.fill();
    if (a > 0.05) {
      ctx.fillStyle = rgb(shade(PAL.green, 0.5));
      poly(ctx, [[x1, d.y0 - grow * 0.5], [x1 + 8 * Math.sin(a), d.y0 - grow * 0.5], [x1 + 8 * Math.sin(a), d.y1 + grow * 0.5], [x1, d.y1 + grow * 0.5]]);
      ctx.fill();
    }
    ctx.restore();
  }

  function bell(ctx, C, since) {
    const V = C.V;
    if (!V.map) return;
    const d = R.door;
    ctx.save();
    ctx.translate(V.ox, V.oy);
    ctx.scale(V.z, V.z);
    const bx = d.x1 - 26, by = d.y0 - 8;
    ctx.strokeStyle = rgb(PAL.brassDark);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx + 20, by - 18);
    ctx.quadraticCurveTo(bx + 4, by - 26, bx, by - 10);
    ctx.stroke();
    const sw = since == null || since < 0 ? 0 : Math.exp(-since * 2.2) * Math.sin(since * 22) * 0.6;
    ctx.translate(bx, by - 8);
    ctx.rotate(sw);
    ctx.beginPath();
    ctx.moveTo(-3, 2);
    ctx.quadraticCurveTo(-5, 12, -11, 20);
    ctx.lineTo(11, 20);
    ctx.quadraticCurveTo(5, 12, 3, 2);
    ctx.closePath();
    ctx.fillStyle = hgrad(ctx, -11, 11, [[0, rgb(PAL.brassDark)], [0.6, rgb(PAL.brass)], [0.85, rgb(PAL.brassLight)], [1, rgb(PAL.brass)]]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(31,23,18,0.8)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = rgb(PAL.brassDark);
    ctx.beginPath();
    ctx.arc(Math.sin(sw * 2) * 4, 21, 2.6, 0, TAU);
    ctx.fill();
    ctx.restore();
    if (since != null && since >= 0 && since < 0.9) {
      const p = V.map([bx, by + 4]);
      const a = 1 - since / 0.9;
      ctx.save();
      ctx.strokeStyle = `rgba(255,236,170,${0.9 * a})`;
      ctx.lineWidth = 3 * V.z;
      ctx.lineCap = 'round';
      for (const s of [-1, 1]) {
        for (let i = 0; i < 2; i++) {
          const r0 = (18 + i * 12 + since * 30) * V.z;
          ctx.beginPath();
          ctx.arc(p[0], p[1], r0, s < 0 ? Math.PI * 0.9 : -Math.PI * 0.35, s < 0 ? Math.PI * 1.35 : Math.PI * 0.1);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  function drawBack(ctx, C, o) {
    o = o || {};
    ctx.drawImage(C.back, 0, 0, W, H);
    if (C.V.map) {
      const open = clamp01(o.door || 0);
      if (open > 0.01 && C.T.outGlow > 0.2) {
        const V = C.V, d = R.door;
        const a = V.map([d.x0, d.y1]), b = V.map([d.x1, d.y1]);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const sp = ctx.createLinearGradient(a[0], a[1], a[0] + 140 * V.z, a[1] + 230 * V.z);
        sp.addColorStop(0, `rgba(255,236,196,${0.34 * open})`);
        sp.addColorStop(1, 'rgba(255,236,196,0)');
        ctx.fillStyle = sp;
        ctx.filter = `blur(${(6 * V.z) | 0}px)`;
        poly(ctx, [a, b, [b[0] + 260 * V.z, b[1] + 230 * V.z], [a[0] + 80 * V.z, a[1] + 230 * V.z]]);
        ctx.fill();
        ctx.filter = 'none';
        ctx.restore();
      }
      drawWeather(ctx, C, o);
      doorLeaf(ctx, C, open, o.t || 0);
      bell(ctx, C, o.bell);
    }
  }

  function drawDoorLeaf(ctx, C, o) {
    o = o || {};
    doorLeaf(ctx, C, clamp01(o.door || 0), o.t || 0);
    bell(ctx, C, o.bell);
  }

  function drawCounter(ctx, C) {
    if (C.counter) ctx.drawImage(C.counter, 0, 0, W, H);
  }

  function drawLight(ctx, C, o) {
    const t = (o && o.t) || 0;
    if (C.light) LOOK.drawLight(ctx, C.light, { alpha: 0.8 + 0.04 * Math.sin(t * 1.3) });
    if (C.glass) ctx.drawImage(C.glass, 0, 0, W, H);
    if (C.T.dim > 0 && C.angle !== 'window') {
      ctx.save();
      ctx.fillStyle = `rgba(30,36,64,${0.5 * C.T.dim})`;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }

  function drawWeather(ctx, C, o) {
    if (C.tod !== 'winter' || !C.V.map) return;
    const t = (o && o.t) || 0;
    const V = C.V;
    const rects = [[R.win.x0, R.win.y0, R.win.x1, R.win.y1], [R.door.x0 + 30, R.door.y0 + 30, R.door.x1 - 30, R.door.y0 + 250]];
    for (const [x0, y0, x1, y1] of rects) {
      const a = V.map([x0, y0]), b = V.map([x1, y1]);
      ctx.save();
      ctx.beginPath();
      ctx.rect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
      ctx.clip();
      LOOK.particles(ctx, t, {
        seed: sd('rain', x0), count: 40, area: [a[0], a[1] - 40, b[0] - a[0], b[1] - a[1] + 80], vel: [-90 * V.z, 760 * V.z],
        size: [1, 1.8], alpha: [0.25, 0.55],
        draw: (g, p) => {
          g.fillStyle = `rgba(214,228,244,${p.alpha})`;
          g.fillRect(p.x, p.y, p.size * V.z, p.size * 16 * V.z);
        },
      });
      ctx.restore();
    }
  }

  const BOKEH = new Map();
  function bokeh(S, o) {
    o = o || {};
    const T = todOf(o.tod);
    const key = `${S}|${o.tod}|${o.seed || 0}|${o.warm == null ? 1 : o.warm}`;
    let c = BOKEH.get(key);
    if (c) return c;
    const L = makeLayer(S);
    c = L.c;
    const g = L.g;
    const warm = o.warm == null ? 1 : o.warm;
    g.fillStyle = vgrad(g, 0, H, [[0, 'rgb(48,30,26)'], [0.5, 'rgb(84,54,40)'], [1, 'rgb(40,24,22)']]);
    g.fillRect(0, 0, W, H);
    const r = LIB.rng(sd('bokeh', o.seed || 0));
    for (const [x, y, rr, a] of [[280, 120, 420, 0.5], [860, 80, 380, 0.45]]) {
      const gl = g.createRadialGradient(x, y, 0, x, y, rr);
      gl.addColorStop(0, `rgba(255,214,150,${a * warm * Math.min(1, T.lamps)})`);
      gl.addColorStop(1, 'rgba(255,214,150,0)');
      g.fillStyle = gl;
      g.fillRect(0, 0, W, H);
    }
    for (let i = 0; i < 26; i++) {
      const x = r.range(-40, W + 40), y = r.range(-40, H * 0.8), rr = r.range(24, 80);
      const a = r.range(0.08, 0.26) * warm;
      const gl = g.createRadialGradient(x, y, rr * 0.6, x, y, rr);
      gl.addColorStop(0, `rgba(255,${(200 + r() * 40) | 0},150,${a})`);
      gl.addColorStop(0.85, `rgba(255,220,160,${a * 1.2})`);
      gl.addColorStop(1, 'rgba(255,220,160,0)');
      g.fillStyle = gl;
      g.beginPath();
      g.arc(x, y, rr, 0, TAU);
      g.fill();
    }
    texture(c, S, 9 + (o.seed || 0), { mottle: 0.05, dark: 0.04, light: 0.03 });
    BOKEH.set(key, c);
    return c;
  }

  function lampCone(ctx, o) {
    const { x, y } = o;
    const len = o.len || 600, sp = o.spread || 0.45, a = o.alpha == null ? 0.25 : o.alpha;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const gr = ctx.createLinearGradient(x, y, x, y + len);
    gr.addColorStop(0, `rgba(255,226,170,${a})`);
    gr.addColorStop(1, 'rgba(255,226,170,0)');
    ctx.fillStyle = gr;
    poly(ctx, [[x - 30, y], [x + 30, y], [x + len * sp, y + len], [x - len * sp, y + len]]);
    ctx.fill();
    ctx.restore();
  }

  FILM.sets = Object.assign(FILM.sets || {}, {
    store: Object.freeze({
      ANGLES: ['wide', 'two', 'low', 'close', 'window'],
      TODS: Object.keys(TOD),
      PAR: Object.freeze({ back: 0.7, mid: 0.85, near: 1, air: 0.85 }),
      palette: PAL,
      view, statics, drawBack, drawDoorLeaf, drawCounter, drawLight, bokeh, lampCone,
    }),
  });
})();
