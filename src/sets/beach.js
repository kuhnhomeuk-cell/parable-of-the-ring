// sets/beach.js: procedural set (background, props and light) shared by the scenes.
(function () {
  'use strict';

  const FILM = window.FILM;
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const SET = 'beach';
  const sd = (...k) => LIB.hash(SET, ...k) & 0x7fffffff;
  const { makeLayer, vgrad, hgrad, poly, vn, fbm, sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const W = 1080;
  const H = 1080;
  const XM = 200;
  const LW = W + 2 * XM;
  const N = LOOK.noise(sd('vn'));

  const rgb = (c, a) => (a == null ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`);
  const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

  const MOODS = {
    morning: {
      sky: [[0, [92, 156, 200]], [0.38, [138, 188, 214]], [0.75, [202, 222, 220]], [1, [240, 236, 216]]],
      sun: [980, -90], sunR: 1100, sunCol: [255, 244, 214], sunA: 0.9, disc: 0,
      haze: [240, 236, 220],
      clouds: 'fair',
      head: [168, 192, 200],
      seaFar: [168, 204, 206], seaMid: [66, 156, 166], seaNear: [86, 184, 180], shallow: [136, 206, 188],
      streakL: [214, 238, 234], streakD: [44, 120, 132],
      foam: [252, 252, 246], swash: [150, 214, 200],
      wet: [178, 136, 86], wetSky: [184, 208, 210], dry: [238, 214, 172], dryNear: [228, 198, 152], ripple: [196, 162, 116],
      glitter: [255, 250, 230], glitterN: 90, glitterX: 860, glitterW: 260,
      shadowK: [0.62, -0.16], shadowA: 0.26, contactA: 0.34, light: [0.78, -0.62],
      rim: 'rgba(255,236,196,0.9)',
      lightCol: [255, 242, 214], beams: 0.5, glowA: 0.55, lightA: 0.7,
      mistCol: [244, 244, 236], mistA: 0.45,
      period: 4.4, birds: 1,
      grade: null,
    },
    loss: {
      sky: [[0, [96, 112, 132]], [0.45, [132, 146, 160]], [0.85, [172, 180, 186]], [1, [186, 190, 190]]],
      sun: [820, 60], sunR: 700, sunCol: [222, 228, 232], sunA: 0.4, disc: 0,
      haze: [176, 184, 190],
      clouds: 'overcast',
      head: [124, 136, 146],
      seaFar: [150, 164, 170], seaMid: [70, 100, 110], seaNear: [84, 116, 122], shallow: [126, 148, 146],
      streakL: [176, 192, 196], streakD: [48, 72, 84],
      foam: [216, 224, 226], swash: [132, 154, 156],
      wet: [126, 114, 98], wetSky: [150, 160, 166], dry: [186, 174, 152], dryNear: [172, 160, 138], ripple: [146, 134, 114],
      glitter: [220, 228, 232], glitterN: 0, glitterX: 760, glitterW: 200,
      shadowK: [0.18, -0.05], shadowA: 0.1, contactA: 0.4, light: [0.3, -0.95],
      rim: 'rgba(214,224,236,0.7)',
      lightCol: [214, 224, 232], beams: 0, glowA: 0.22, lightA: 0.5,
      mistCol: [196, 204, 210], mistA: 0.85,
      period: 5.2, birds: 0,
      grade: { mul: [196, 208, 226], a: 0.24, desat: 0.3 },
    },
    sunrise: {
      sky: [[0, [178, 214, 204]], [0.35, [214, 226, 200]], [0.7, [250, 222, 168]], [0.9, [252, 202, 150]], [1, [250, 190, 150]]],
      sun: null, sunR: 900, sunCol: [255, 236, 190], sunA: 1, disc: 44,
      haze: [252, 226, 186],
      clouds: 'sunrise',
      head: [200, 186, 178],
      seaFar: [238, 204, 170], seaMid: [120, 178, 172], seaNear: [136, 196, 184], shallow: [178, 214, 186],
      streakL: [255, 230, 186], streakD: [86, 140, 146],
      foam: [255, 248, 232], swash: [190, 220, 196],
      wet: [206, 166, 118], wetSky: [250, 214, 170], dry: [242, 216, 174], dryNear: [236, 204, 160], ripple: [212, 172, 126],
      glitter: [255, 238, 190], glitterN: 120, glitterX: null, glitterW: 90,
      shadowK: [0.42, -0.7], shadowA: 0.28, contactA: 0.34, light: [0.35, -0.3],
      rim: 'rgba(255,214,160,0.95)',
      lightCol: [255, 228, 180], beams: 0.35, glowA: 0.75, lightA: 0.75,
      mistCol: [255, 236, 210], mistA: 0.7,
      period: 6, birds: 1,
      grade: { warm: [255, 214, 170], a: 0.12 },
    },
  };

  function resolve(o) {
    o = o || {};
    const mood = MOODS[o.mood] ? o.mood : 'morning';
    const m = MOODS[mood];
    const horizon = o.horizon != null ? o.horizon : 452;
    const shore = o.shore != null ? o.shore : 660;
    const wet = o.wet != null ? o.wet : 0.5 * (shore - horizon);
    const run = o.run != null ? o.run : 0.62;
    const sun = o.sun || m.sun || [760, horizon - 30];
    return { mood, horizon, shore, wet, run, sun, dune: !!o.dune };
  }

  function layer(S) {
    const { c, g } = makeLayer(S, 1, LW, H);
    g.translate(XM, 0);
    return { c, g };
  }
  const tex = (c, S, n, o) => {
    const q = Object.assign({ seed: sd('tex', n), offset: n * 11.3, noise: N }, o);
    if (q.glow) q.glow = Object.assign({}, q.glow, { x: q.glow.x + XM });
    if (q.dim) {
      const f = q.dim;
      q.dim = (X, Y) => f(X - XM, Y);
    }
    LOOK.texture(c, S, q);
  };
  const skyStops = (m) => m.sky.map(([k, c]) => [k, rgb(c)]);
  function radial(g, x, y, r, stops) {
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    for (const [k, c] of stops) rg.addColorStop(k, c);
    g.fillStyle = rg;
    g.fillRect(-XM, 0, LW, H);
  }

  function cloud(g, x, y, w, h, top, bot, a, r) {
    const puffs = [];
    const n = 7 + ((w / 40) | 0);
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const px = x - w / 2 + w * u + r.range(-w * 0.05, w * 0.05);
      const bump = Math.sin(Math.PI * u);
      const pr = h * (0.35 + 0.55 * bump) * r.range(0.8, 1.15);
      puffs.push([px, y - pr * 0.55, pr]);
    }
    g.fillStyle = rgb(bot, a);
    for (const [px, py, pr] of puffs) {
      g.beginPath();
      g.ellipse(px, py + pr * 0.18, pr * 1.15, pr * 0.8, 0, 0, TAU);
      g.fill();
    }
    g.fillStyle = rgb(top, a);
    for (const [px, py, pr] of puffs) {
      g.beginPath();
      g.ellipse(px + pr * 0.12, py - pr * 0.08, pr * 0.95, pr * 0.66, 0, 0, TAU);
      g.fill();
    }
    g.fillStyle = rgb(bot, a * 0.8);
    g.beginPath();
    g.ellipse(x, y + h * 0.05, w * 0.55, h * 0.16, 0, 0, TAU);
    g.fill();
  }
  function streak(g, x, y, rx, ry, c, a) {
    g.fillStyle = rgb(c, a);
    g.beginPath();
    g.ellipse(x, y, rx, ry, 0, 0, TAU);
    g.fill();
    g.fillStyle = rgb(c, a * 0.6);
    g.beginPath();
    g.ellipse(x + rx * 0.2, y - ry * 0.3, rx * 0.55, ry * 0.5, 0, 0, TAU);
    g.fill();
  }

  function buildFar(S, L, m) {
    const { c, g } = layer(S);
    const HZ = L.horizon;
    g.fillStyle = vgrad(g, 0, HZ, skyStops(m));
    g.fillRect(-XM, 0, LW, H);
    const [sx, sy] = L.sun;
    const sc = m.sunCol;
    radial(g, sx, sy, m.sunR, [[0, rgb(sc, m.sunA)], [0.16, rgb(sc, 0.78 * m.sunA)], [0.45, rgb(sc, 0.3 * m.sunA)], [1, rgb(sc, 0)]]);
    const r = LIB.rng(sd('cloud', L.mood));
    if (m.clouds === 'fair') {
      for (const [x, y, rx, ry, a] of [[180, 120, 300, 8, 0.36], [620, 70, 260, 7, 0.3], [-80, 230, 220, 6, 0.3], [420, 260, 320, 6, 0.24], [860, 210, 200, 5, 0.22]]) streak(g, x, y, rx, ry, [255, 252, 242], a);
      for (const [x, w, hh, a] of [[-120, 260, 46, 0.7], [140, 200, 34, 0.6], [360, 300, 52, 0.55], [700, 220, 38, 0.6], [960, 280, 48, 0.62], [1180, 200, 34, 0.5]]) {
        cloud(g, x, HZ - 6, w, hh, [252, 250, 242], [214, 226, 230], a, r);
      }
    } else if (m.clouds === 'overcast') {
      const res = 0.5;
      const cw = Math.round(LW * S * res), ch = Math.max(1, Math.round((HZ + 4) * S * res));
      const cc = FILM.makeCanvas(cw, ch);
      const cg = cc.getContext('2d');
      const img = cg.createImageData(cw, ch);
      const d = img.data;
      for (let py = 0; py < ch; py++) {
        const Y = (py + 0.5) / (S * res);
        const ky = Y / HZ;
        for (let px = 0; px < cw; px++) {
          const X = (px + 0.5) / (S * res) - XM;
          const n = N.fbm(X / 340 + 3.1, Y / 64 + 1.7, 4);
          const n2 = N.fbm(X / 150 + 9, Y / 30 + 4, 3);
          const dens = clamp01((n - 0.38) * 2.6) * (1 - 0.55 * sstep(0.7, 1, ky));
          const top = clamp01((n2 - 0.35) * 2);
          const col = mix(mix([84, 98, 118], [120, 134, 150], ky), mix([170, 180, 190], [196, 202, 204], ky), top);
          const i = (py * cw + px) * 4;
          d[i] = col[0];
          d[i + 1] = col[1];
          d[i + 2] = col[2];
          d[i + 3] = Math.round(255 * clamp01(dens * 0.85));
        }
      }
      cg.putImageData(img, 0, 0);
      g.drawImage(cc, -XM, 0, LW, HZ + 4);
      radial(g, sx, sy + 40, 320, [[0, 'rgba(222,228,232,0.45)'], [1, 'rgba(222,228,232,0)']]);
    } else {
      for (const [x, y, rx, ry, a] of [[120, 110, 320, 9, 0.5], [640, 160, 280, 8, 0.45], [-40, 250, 240, 7, 0.45], [420, 300, 330, 7, 0.5], [900, 280, 220, 6, 0.42], [260, 370, 260, 5, 0.4], [1100, 360, 200, 5, 0.35]]) {
        streak(g, x, y, rx, ry, [255, 214, 196], a);
        g.fillStyle = 'rgba(255,240,200,' + a * 0.7 + ')';
        g.beginPath();
        g.ellipse(x + rx * 0.1, y + ry * 0.4, rx * 0.7, ry * 0.35, 0, 0, TAU);
        g.fill();
      }
    }
    if (m.disc) {
      radial(g, sx, sy, m.disc * 3.2, [[0, 'rgba(255,250,228,1)'], [0.3, 'rgba(255,240,200,0.9)'], [0.34, 'rgba(255,230,180,0.5)'], [1, 'rgba(255,220,170,0)']]);
      g.fillStyle = 'rgb(255,248,226)';
      g.beginPath();
      g.arc(sx, sy, m.disc, 0, TAU);
      g.fill();
    }
    const hc = m.head;
    g.beginPath();
    g.moveTo(-XM, HZ + 1);
    for (let x = -XM; x <= 420; x += 6) {
      const k = sstep(-XM, 40, x) * (1 - sstep(220, 420, x));
      g.lineTo(x, HZ + 1 - k * (10 + 14 * fbm(x / 90 + 3, 7, 3)) - 3 * vn(x / 14, 2) * k);
    }
    g.lineTo(420, HZ + 1);
    g.closePath();
    g.fillStyle = rgb(hc);
    g.fill();
    g.fillStyle = rgb(mix(hc, m.haze, 0.25));
    g.fillRect(900, HZ - 7, 220, 3);
    for (let x = 904; x < 1120; x += 11) g.fillRect(x, HZ - 6, 1.6, 7);
    g.fillStyle = vgrad(g, HZ, H, [[0, rgb(m.seaFar)], [0.3, rgb(m.seaMid)], [1, rgb(m.seaNear)]]);
    g.fillRect(-XM, HZ, LW, H - HZ);
    tex(c, S, 1, { mottle: 0.045, dark: 0.035, light: 0.03 });
    return c;
  }

  function buildSea(S, L, m) {
    const { c, g } = layer(S);
    const HZ = L.horizon, SH = L.shore;
    const yEnd = H;
    const span = Math.max(40, Math.min(SH, H + 200) - HZ);
    const k = (y) => clamp01((y - HZ) / span);
    g.fillStyle = vgrad(g, HZ, HZ + span, [[0, rgb(m.seaFar)], [0.12, rgb(mix(m.seaFar, m.seaMid, 0.6))], [0.35, rgb(m.seaMid)], [0.75, rgb(m.seaNear)], [1, rgb(m.shallow)]]);
    g.fillRect(-XM, HZ, LW, yEnd - HZ);
    if (SH < H) {
      g.fillStyle = vgrad(g, SH - 0.3 * span, SH + 6, [[0, rgb(m.shallow, 0)], [1, rgb(m.shallow, 0.85)]]);
      g.fillRect(-XM, SH - 0.3 * span, LW, 0.3 * span + 80);
    }
    const gx = m.glitterX != null ? m.glitterX : L.sun[0];
    const pg = hgrad(g, gx - 320, gx + 320, [[0, rgb(m.glitter, 0)], [0.5, rgb(m.glitter, m.disc ? 0.4 : 0.18)], [1, rgb(m.glitter, 0)]]);
    g.fillStyle = pg;
    g.fillRect(gx - 320, HZ, 640, yEnd - HZ);
    const r = LIB.rng(sd('streak', L.mood, L.horizon, L.shore));
    for (let i = 0; i < 520; i++) {
      const u = Math.pow(r(), 1.7);
      const y = HZ + 2 + u * (Math.min(SH, H) - HZ);
      const kk = k(y);
      const len = 14 + 160 * kk * r.range(0.5, 1.2);
      const th = 0.6 + 3.2 * kk;
      const light = r() < 0.55;
      g.fillStyle = light ? rgb(m.streakL, 0.06 + 0.12 * r()) : rgb(m.streakD, 0.04 + 0.08 * r());
      g.beginPath();
      g.ellipse(r.range(-XM, W + XM), y, len, th, 0, 0, TAU);
      g.fill();
    }
    for (let i = 0; i < 26; i++) {
      const y = HZ + 10 + Math.pow(r(), 1.2) * (Math.min(SH, H) - HZ - 10);
      const kk = k(y);
      g.fillStyle = r() < 0.5 ? rgb(m.streakD, 0.07) : rgb(m.streakL, 0.08);
      g.beginPath();
      g.ellipse(r.range(-XM, W + XM), y, 120 + 380 * kk, 6 + 34 * kk, 0, 0, TAU);
      g.fill();
    }
    g.fillStyle = rgb(m.glitter, 0.5);
    g.fillRect(-XM, HZ - 0.5, LW, 1.4);
    g.fillStyle = vgrad(g, HZ, HZ + 18, [[0, rgb(m.haze, 0.55)], [1, rgb(m.haze, 0)]]);
    g.fillRect(-XM, HZ, LW, 18);
    tex(c, S, 2, { mottle: 0.05, dark: 0.04, light: 0.035, glow: { x: L.sun[0], y: L.sun[1], r: 900, amount: 0.14 } });
    return c;
  }

  function buildStrip(S, kind, m) {
    const sw = LW + 400, sh = 32;
    const res = 0.5;
    const c = FILM.makeCanvas(Math.max(1, Math.round(sw * S * res)), Math.max(1, Math.round(sh * S * res)));
    const g = c.getContext('2d');
    const img = g.createImageData(c.width, c.height);
    const d = img.data;
    const fc = kind === 'foam' ? m.foam : m.streakL;
    const dc = m.streakD;
    for (let py = 0; py < c.height; py++) {
      const Y = (py + 0.5) / (S * res);
      const v = (Y - sh / 2) / (sh / 2);
      for (let px = 0; px < c.width; px++) {
        const X = (px + 0.5) / (S * res);
        const n = N.fbm(X / 70 + 5, Y / 9 + (kind === 'foam' ? 3 : 9), 3);
        const wob = 0.35 * (N.vn(X / 130, 4) - 0.5);
        const i = (py * c.width + px) * 4;
        let a, col;
        if (kind === 'foam') {
          const band = Math.exp(-Math.pow((v - wob) / 0.42, 2));
          a = band * (0.35 + clamp01(n * 2.2 - 0.5)) + 0.5 * Math.exp(-Math.pow((v - wob + 0.22) / 0.14, 2));
          col = fc;
        } else {
          const crest = Math.exp(-Math.pow((v - wob + 0.15) / 0.22, 2));
          const trough = Math.exp(-Math.pow((v - wob - 0.4) / 0.35, 2));
          const brk = clamp01(N.vn(X / 210 + 11, 6) * 2.2 - 0.55);
          if (crest >= trough) {
            a = crest * (0.55 + 0.45 * n) * brk;
            col = fc;
          } else {
            a = trough * 0.5 * brk;
            col = dc;
          }
        }
        d[i] = col[0];
        d[i + 1] = col[1];
        d[i + 2] = col[2];
        d[i + 3] = Math.round(clamp01(a) * 255);
      }
    }
    g.putImageData(img, 0, 0);
    c.lw = sw;
    c.lh = sh;
    return c;
  }

  function edgeY(L, x) {
    return L.shore + 3 * (N.fbm(x / 140 + 2, 3, 3) - 0.5) * 2;
  }

  function buildSand(S, L, m) {
    const { c, g } = layer(S);
    const SH = L.shore, WB = L.wet, HZ = L.horizon;
    if (SH >= H) return c;
    const depth = (y) => clamp01((y - HZ) / (H - HZ));
    g.beginPath();
    g.moveTo(-XM, H + 10);
    for (let x = -XM; x <= W + XM; x += 8) g.lineTo(x, edgeY(L, x));
    g.lineTo(W + XM, H + 10);
    g.closePath();
    const fr = (px) => Math.min(0.98, px / (H - SH));
    g.fillStyle = vgrad(g, SH, H, [
      [0, rgb(mix(m.wet, m.wetSky, 0.45))], [fr(WB * 0.18), rgb(mix(m.wet, m.wetSky, 0.18))], [fr(WB * 0.6), rgb(m.wet)],
      [fr(WB * 0.95), rgb(mix(m.wet, m.dry, 0.35))], [fr(WB * 1.15), rgb(mix(m.wet, m.dry, 0.8))], [fr(WB * 1.5), rgb(m.dry)], [1, rgb(m.dryNear)],
    ]);
    g.fill();
    g.save();
    g.clip();
    const r = LIB.rng(sd('sand', L.mood, L.shore));
    for (let i = 0; i < 90; i++) {
      const y = SH + 4 + Math.pow(r(), 1.3) * WB * 0.9;
      const kk = depth(y);
      g.fillStyle = rgb(m.wetSky, 0.1 + 0.16 * r());
      g.beginPath();
      g.ellipse(r.range(-XM, W + XM), y, 30 + 140 * kk * r(), 1 + 3 * kk, 0, 0, TAU);
      g.fill();
    }
    const gx = m.glitterX != null ? m.glitterX : L.sun[0];
    g.fillStyle = hgrad(g, gx - 260, gx + 260, [[0, rgb(m.glitter, 0)], [0.5, rgb(m.glitter, m.disc ? 0.3 : 0.16)], [1, rgb(m.glitter, 0)]]);
    g.fillRect(gx - 260, SH, 520, WB * 0.9);
    g.strokeStyle = rgb(mix(m.wet, [60, 44, 30], 0.2), 0.25);
    g.lineWidth = 2;
    g.beginPath();
    for (let x = -XM; x <= W + XM; x += 10) {
      const y = SH + WB * (0.92 + 0.08 * Math.sin(x / 90) + 0.1 * (N.vn(x / 60, 9) - 0.5));
      if (x === -XM) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    const wy = SH + WB * 1.18;
    for (let i = 0; i < 160; i++) {
      const x = r.range(-XM, W + XM);
      const y = wy + r.range(-8, 8) * (0.4 + depth(wy)) + 10 * Math.sin(x / 170);
      const kk = depth(y);
      g.fillStyle = r() < 0.6 ? rgb(mix(m.ripple, [70, 64, 40], 0.5), 0.4) : rgb([250, 244, 230], 0.5);
      g.beginPath();
      g.ellipse(x, y, (1.5 + 5 * r()) * (0.4 + kk), (0.6 + 1.2 * r()) * (0.4 + kk), r() * 0.6, 0, TAU);
      g.fill();
    }
    for (let i = 0; i < 260; i++) {
      const y = wy + 14 + Math.pow(r(), 0.8) * (H - wy);
      const kk = depth(y);
      const x = r.range(-XM, W + XM);
      const len = (20 + 50 * r()) * (0.4 + kk);
      const bow = (2 + 4 * r()) * (0.4 + kk);
      g.lineWidth = 1 + 1.6 * kk;
      g.strokeStyle = rgb(m.ripple, 0.18 + 0.12 * r());
      g.beginPath();
      g.moveTo(x - len, y);
      g.quadraticCurveTo(x, y - bow, x + len, y);
      g.stroke();
      g.strokeStyle = rgb([255, 248, 232], 0.18);
      g.beginPath();
      g.moveTo(x - len, y - 1.6 * (0.5 + kk));
      g.quadraticCurveTo(x, y - bow - 1.6 * (0.5 + kk), x + len, y - 1.6 * (0.5 + kk));
      g.stroke();
    }
    const k = m.shadowK;
    for (let i = 0; i < 46; i++) {
      const y = SH + WB * 0.5 + r() * (H - SH - WB * 0.5);
      const kk = depth(y);
      const x = r.range(-XM, W + XM);
      const s = (2 + 4 * r()) * (0.5 + kk);
      const shell = r() < 0.55;
      g.fillStyle = 'rgba(80,60,50,0.18)';
      g.beginPath();
      g.ellipse(x + k[0] * s * 0.9, y + 1, s * 1.1, s * 0.4, 0, 0, TAU);
      g.fill();
      g.fillStyle = shell ? rgb(r() < 0.5 ? [250, 236, 222] : [240, 206, 186]) : rgb(mix(m.ripple, [120, 110, 100], 0.4));
      g.beginPath();
      g.ellipse(x, y - s * 0.2, s, s * 0.55, r.range(-0.4, 0.4), 0, TAU);
      g.fill();
      g.fillStyle = 'rgba(255,255,250,0.5)';
      g.beginPath();
      g.ellipse(x + s * 0.25, y - s * 0.4, s * 0.35, s * 0.18, 0, 0, TAU);
      g.fill();
    }
    g.restore();
    if (L.dune) {
      for (const [x0, x1, top] of [[-XM, 230, 950], [880, W + XM, 960]]) {
        g.beginPath();
        g.moveTo(x0, H + 10);
        for (let x = x0; x <= x1; x += 6) {
          const u = (x - x0) / (x1 - x0);
          const e = x0 < 0 ? 1 - sstep(0.55, 1, u) : sstep(0, 0.45, u);
          g.lineTo(x, H + 10 - (H + 10 - top) * e - 8 * N.vn(x / 30, 5) * e);
        }
        g.lineTo(x1, H + 10);
        g.closePath();
        g.fillStyle = vgrad(g, top - 10, H, [[0, rgb(mix(m.dryNear, m.ripple, 0.6))], [1, rgb(mix(m.dryNear, [120, 96, 70], 0.4))]]);
        g.fill();
        const rr = LIB.rng(sd('oats', x0));
        for (let i = 0; i < 40; i++) {
          const bx = lerp(x0 < 0 ? -40 : 940, x0 < 0 ? 150 : 1120, rr());
          const by = H + 4 - rr() * 20;
          const len = rr.range(60, 130);
          const lean = rr.range(-0.5, 0.2) * (x0 < 0 ? 1 : -1);
          g.strokeStyle = rgb(mix([150, 150, 90], [214, 196, 120], rr()), 0.95);
          g.lineWidth = rr.range(1.4, 2.6);
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(bx, by);
          g.quadraticCurveTo(bx + lean * len * 0.3, by - len * 0.6, bx + lean * len, by - len);
          g.stroke();
          if (rr() < 0.35) {
            g.fillStyle = rgb([226, 204, 132]);
            g.beginPath();
            g.ellipse(bx + lean * len, by - len, 2.5, 7, lean, 0, TAU);
            g.fill();
          }
        }
      }
    }
    tex(c, S, 3, { mottle: 0.07, dark: 0.06, light: 0.045, glow: { x: L.sun[0], y: L.sun[1], r: 1000, amount: 0.18 } });
    return c;
  }

  function buildAir(S, L, m) {
    const [sx, sy] = L.sun;
    const HZ = L.horizon;
    const fields = [];
    if (m.beams > 0) {
      const dx = m.disc ? 0.2 : 0.62, dy = m.disc ? 0.98 : 0.78;
      const n = Math.hypot(dx, dy);
      const beam = LOOK.beamField({
        beams: [[180, 60, 0.5], [340, 90, 0.8], [520, 50, 0.45], [700, 110, 0.6], [900, 60, 0.4], [1080, 90, 0.5]].map(([u, w, s]) => [u, w, s * m.beams]),
        dir: [dy / n, -dx / n],
        noise: { base: 0.75, amp: 0.5, scale: 9, offset: 2, row: 5.5 },
        fall: (X, Y) => (1 - sstep(HZ + 60, HZ + 360, Y)) * 0.5,
        clamp: false,
      });
      fields.push((X, Y) => beam(X - XM, Y));
    }
    const glow = LOOK.glowField({ x: sx + XM, y: sy, r: m.disc ? 420 : 560, amount: m.glowA });
    fields.push(glow);
    if (m.disc) {
      fields.push((X, Y) => 0.35 * Math.exp(-Math.pow((Y - HZ) / 40, 2)) * Math.exp(-Math.pow((X - XM - sx) / 520, 2)));
    }
    return LOOK.lightLayer(S, { fields, w: LW, color: m.lightCol });
  }

  const buildMist = (S, L, m) => LOOK.mist(S, { w: LW, bands: [[L.horizon + 6, 26, 0.85], [L.horizon - 14, 40, 0.35]], color: m.mistCol, noiseFn: N });
  const buildLowMist = (S, L, m) => LOOK.mist(S, { w: LW, bands: [[Math.min(H - 60, L.shore + 40), 60, 0.25]], color: m.mistCol, noiseFn: N, noise: { sx: 260, sy: 50, oy: 9 } });

  function buildGlitter(L, m) {
    const out = [];
    const n = m.glitterN;
    if (!n) return out;
    const r = LIB.rng(sd('glitter', L.mood, L.horizon));
    const gx = m.glitterX != null ? m.glitterX : L.sun[0];
    const yEnd = Math.min(L.shore, H) - 10;
    for (let i = 0; i < n; i++) {
      const u = Math.pow(r(), 1.4);
      const y = L.horizon + 3 + u * (yEnd - L.horizon - 3);
      const kk = clamp01((y - L.horizon) / Math.max(1, yEnd - L.horizon));
      const spread = m.glitterW * (0.25 + 0.9 * kk);
      const x = gx + (r() + r() + r() - 1.5) * spread;
      out.push([x, y, 2 + 9 * kk * r.range(0.5, 1.2), 0.6 + 1.4 * kk, r.range(1.2, 3.4), r() * TAU]);
    }
    return out;
  }

  const CACHE = new Map();
  function statics(S, o) {
    const L = resolve(o);
    const key = `${S}|${L.mood}|${L.horizon}|${L.shore}|${L.wet}|${L.run}|${L.sun[0]},${L.sun[1]}|${L.dune}`;
    const hit = CACHE.get(key);
    if (hit) return hit;
    const m = MOODS[L.mood];
    const C = {
      S, L, m, key,
      far: buildFar(S, L, m),
      sea: buildSea(S, L, m),
      sand: buildSand(S, L, m),
      air: buildAir(S, L, m),
      mist: buildMist(S, L, m),
      low: buildLowMist(S, L, m),
      foam: buildStrip(S, 'foam', m),
      swell: buildStrip(S, 'swell', m),
      glitter: buildGlitter(L, m),
      backdrops: new Map(),
    };
    CACHE.set(key, C);
    return C;
  }

  function breaker(C, t) {
    const P = C.m.period;
    const q = t / P + 0.15;
    const k = Math.floor(q);
    const u = q - k;
    let run;
    if (u < 0.32) run = 0;
    else if (u < 0.58) run = LIB.ease.outCubic((u - 0.32) / 0.26);
    else run = 1 - LIB.ease.inOutSine((u - 0.58) / 0.42);
    return { u, k, run };
  }

  function swashY(C, x, t) {
    const L = C.L;
    const b = breaker(C, t);
    const R = L.wet * L.run;
    return edgeY(L, x) + R * b.run * (0.72 + 0.28 * N.vn(x / 170 + b.k * 3.7, b.k + 1));
  }
  const wetY = (C) => [C.L.shore, C.L.shore + C.L.wet];

  function drawSwells(ctx, C, t) {
    const L = C.L, HZ = L.horizon;
    const yB = Math.min(L.shore, H + 120) - 0.16 * (Math.min(L.shore, H + 120) - HZ);
    const n = 8, P = 18;
    for (let i = 0; i < n; i++) {
      const q = (t / P + i / n) % 1;
      const qq = Math.pow(q, 1.7);
      const y = HZ + 4 + (yB - HZ - 4) * qq;
      const h = 2 + 26 * qq;
      const a = 0.4 * sstep(0, 0.2, q) * (1 - sstep(0.88, 1, q));
      if (a <= 0.01) continue;
      const id = Math.floor(t / P + i / n);
      const shift = ((id * 137 + i * 61) % 400 + 400) % 400;
      ctx.globalAlpha = a;
      ctx.drawImage(C.swell, -XM - shift, y - h / 2, C.swell.lw, h);
    }
    ctx.globalAlpha = 1;
  }

  function drawBreaker(ctx, C, t) {
    const L = C.L;
    if (L.shore >= H + 100) {
      for (let i = 0; i < 3; i++) {
        const q = (t / (C.m.period * 1.4) + i / 3) % 1;
        const y = L.horizon + 30 + (H + 60 - L.horizon - 30) * Math.pow(q, 1.6);
        const h = 4 + 40 * Math.pow(q, 1.6);
        const id = Math.floor(t / (C.m.period * 1.4) + i / 3);
        ctx.globalAlpha = 0.55 * sstep(0, 0.25, q) * (1 - sstep(0.85, 1, q));
        ctx.drawImage(C.foam, -XM - (((id * 173 + i * 89) % 400) + 400) % 400, y - h / 2, C.foam.lw, h);
      }
      ctx.globalAlpha = 1;
      return;
    }
    const b = breaker(C, t);
    const SH = L.shore;
    const span = SH - L.horizon;
    const shift = (((b.k * 173) % 400) + 400) % 400;
    if (b.u < 0.4) {
      const p = b.u / 0.4;
      const y = SH - span * 0.16 * (1 - LIB.ease.inOutSine(p)) - 2;
      const h = 6 + 18 * p;
      ctx.globalAlpha = sstep(0, 0.35, p) * (1 - 0.4 * sstep(0.8, 1, p));
      ctx.drawImage(C.swell, -XM - shift, y - h * 0.9, C.swell.lw, h * 1.2);
      ctx.globalAlpha *= sstep(0.3, 0.7, p);
      ctx.drawImage(C.foam, -XM - shift, y - h / 2, C.foam.lw, h);
    }
    const p2 = clamp01((b.u - 0.45) / 0.55);
    if (p2 > 0) {
      const y = SH - span * (0.34 - 0.16 * p2);
      ctx.globalAlpha = 0.6 * sstep(0, 0.5, p2);
      const sh2 = ((((b.k + 1) * 173) % 400) + 400) % 400;
      ctx.drawImage(C.swell, -XM - sh2, y - 8, C.swell.lw, 12 + 6 * p2);
    }
    ctx.globalAlpha = 0.5;
    ctx.drawImage(C.foam, -XM - ((shift + 200) % 400), SH - 7, C.foam.lw, 9);
    ctx.globalAlpha = 1;
  }

  function drawGlitter(ctx, C, t) {
    const G = C.glitter;
    if (!G.length) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = rgb(C.m.glitter);
    for (const [x, y, len, th, w, ph] of G) {
      const a = Math.pow(Math.max(0, Math.sin(t * w + ph)), 4);
      if (a < 0.03) continue;
      ctx.globalAlpha = 0.85 * a;
      ctx.fillRect(x - len / 2, y - th / 2, len, th);
    }
    ctx.restore();
  }

  function drawSwash(ctx, C, t) {
    const L = C.L, m = C.m;
    if (L.shore >= H) return;
    const b = breaker(C, t);
    const SH = L.shore;
    const R = L.wet * L.run;
    const back = b.u > 0.58 ? 1 - (b.u - 0.58) / 0.42 : b.u < 0.32 ? 0.35 * (1 - b.u / 0.32) : 1;
    const reach = b.u < 0.32 ? 0 : b.u < 0.58 ? b.run : 1;
    const pts = [];
    for (let x = -XM; x <= W + XM; x += 24) pts.push([x, swashY(C, x, t)]);
    if (reach > 0 || back > 0) {
      ctx.save();
      const top = (x) => edgeY(L, x) - 2;
      ctx.beginPath();
      ctx.moveTo(-XM, top(-XM));
      for (let x = -XM; x <= W + XM; x += 48) ctx.lineTo(x, top(x));
      for (let x = W + XM; x >= -XM; x -= 24) {
        const y = edgeY(L, x) + R * reach * (0.72 + 0.28 * N.vn(x / 170 + b.k * 3.7, b.k + 1)) + 6;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = rgb(m.wetSky, 0.22 * back);
      ctx.fill();
      ctx.restore();
    }
    if (b.run <= 0.005) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-XM, SH - 8);
    for (const [x, y] of pts) ctx.lineTo(x, y);
    ctx.lineTo(W + XM, SH - 8);
    ctx.closePath();
    const sheet = 0.3 + 0.5 * (b.u < 0.58 ? 1 : b.run);
    ctx.fillStyle = vgrad(ctx, SH - 8, SH + R, [[0, rgb(m.swash, 0.85 * sheet)], [1, rgb(m.swash, 0.45 * sheet)]]);
    ctx.fill();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const lip = b.u < 0.58 ? 1 : b.run;
    ctx.strokeStyle = rgb(m.foam, 0.85 * lip);
    ctx.lineWidth = 2 + 3 * lip;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.strokeStyle = rgb(m.foam, 0.35 * lip);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    pts.forEach(([x, y], i) => {
      const yy = y - 7 - 4 * N.vn(x / 40, b.k + 2);
      return i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
    });
    ctx.stroke();
    ctx.restore();
  }

  function drawBirds(ctx, C, t) {
    if (!C.m.birds) return;
    ctx.save();
    ctx.strokeStyle = C.L.mood === 'sunrise' ? 'rgba(120,96,90,0.55)' : 'rgba(96,112,124,0.5)';
    ctx.lineCap = 'round';
    for (const [x0, y0, v, s, ph] of [[180, 190, 9, 7, 0], [250, 214, 8, 5.5, 1.7], [760, 150, -6, 6, 3.1]]) {
      const x = x0 + v * t, y = y0 + 4 * Math.sin(t * 0.6 + ph);
      const f = Math.sin(t * 3.2 + ph) * 0.5;
      ctx.lineWidth = Math.max(1.2, s * 0.28);
      ctx.beginPath();
      ctx.moveTo(x - s, y - s * (0.2 + f * 0.6));
      ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.55, x, y);
      ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.55, x + s, y - s * (0.2 + f * 0.6));
      ctx.stroke();
    }
    ctx.restore();
  }

  function world(ctx, C, t, cam) {
    ctx.save();
    cam(ctx, 0.25);
    ctx.drawImage(C.far, -XM, 0, LW, H);
    drawBirds(ctx, C, t);
    ctx.restore();
    ctx.save();
    cam(ctx, 0.55);
    const sy = Math.max(0, Math.floor(C.L.horizon - 4));
    ctx.drawImage(C.sea, 0, sy * C.S, LW * C.S, (H - sy) * C.S, -XM, sy, LW, H - sy);
    LOOK.drawMist(ctx, C.mist, { x: -XM - 160 + 4 * t, alpha: C.m.mistA });
    drawSwells(ctx, C, t);
    drawGlitter(ctx, C, t);
    drawBreaker(ctx, C, t);
    ctx.restore();
    ctx.save();
    cam(ctx, 1);
    const ty = Math.floor(C.L.shore - 12);
    if (ty < H) ctx.drawImage(C.sand, 0, ty * C.S, LW * C.S, (H - ty) * C.S, -XM, ty, LW, H - ty);
    drawSwash(ctx, C, t);
    ctx.restore();
  }

  const SCRATCH = new Map();
  function scratch(ctx, q) {
    const cv = ctx.canvas;
    const w = Math.max(1, Math.round(cv.width * q)), h = Math.max(1, Math.round(cv.height * q));
    let c = SCRATCH.get(q);
    if (!c) SCRATCH.set(q, (c = FILM.makeCanvas(w, h)));
    if (c.width !== w) c.width = w;
    if (c.height !== h) c.height = h;
    return c;
  }

  function overlay(ctx, k, draw, band) {
    if (k <= 0.001) return;
    const q = band ? 0.5 : 1;
    const sc = scratch(ctx, q);
    const g = sc.getContext('2d');
    const sx = sc.width / W, sy = sc.height / H;
    const x0 = band ? Math.max(0, Math.floor(band[0])) : 0;
    const x1 = band ? Math.min(W, Math.ceil(band[1])) : W;
    if (x1 <= x0) return;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, sc.width, sc.height);
    g.save();
    g.setTransform(sx, 0, 0, sy, 0, 0);
    g.beginPath();
    g.rect(x0, 0, x1 - x0, H);
    g.clip();
    const m = ctx.getTransform();
    g.setTransform(m.a * q, m.b * q, m.c * q, m.d * q, m.e * q, m.f * q);
    draw(g);
    if (band) {
      g.setTransform(sx, 0, 0, sy, 0, 0);
      g.globalCompositeOperation = 'destination-in';
      g.fillStyle = hgrad(g, band[0], band[1], [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]);
      g.fillRect(x0, 0, x1 - x0, H);
    }
    g.restore();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = band ? 1 : k;
    const dx = ctx.canvas.width / W;
    ctx.drawImage(sc, x0 * sx, 0, (x1 - x0) * sx, sc.height, x0 * dx, 0, (x1 - x0) * dx, ctx.canvas.height);
    ctx.restore();
  }

  function clipX(ctx, x0, x1, fn) {
    if (x1 <= x0) return;
    ctx.save();
    const tr = ctx.getTransform();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const sx = ctx.canvas.width / W;
    ctx.beginPath();
    ctx.rect(x0 * sx, 0, (x1 - x0) * sx, ctx.canvas.height);
    ctx.clip();
    ctx.setTransform(tr);
    fn();
    ctx.restore();
  }

  function back(ctx, C, t, cam, mx) {
    const k = mx && mx.C ? clamp01(mx.k) : 0;
    if (k <= 0.001) return world(ctx, C, t, cam);
    if (k >= 0.999) return world(ctx, mx.C, t, cam);
    if (!mx.wipe) {
      world(ctx, C, t, cam);
      overlay(ctx, k, (g) => world(g, mx.C, t, cam));
      return;
    }
    const e = lerp(W + 180, -180, k);
    const b0 = e - 180, b1 = e + 180;
    clipX(ctx, 0, Math.min(W, b1), () => world(ctx, C, t, cam));
    overlay(ctx, k, (g) => world(g, mx.C, t, cam), [b0, b1]);
    clipX(ctx, Math.max(0, b1 - 4), W, () => world(ctx, mx.C, t, cam));
  }

  function air(ctx, C, t, cam, alpha) {
    const a = alpha == null ? 1 : alpha;
    if (a <= 0) return;
    ctx.save();
    cam(ctx, 0.7);
    LOOK.drawLight(ctx, C.air, { x: -XM + 6 * Math.sin(t * 0.3), alpha: a * (C.m.lightA + 0.06 * Math.sin(t * 0.8)) });
    LOOK.drawMist(ctx, C.low, { x: -XM - 120 - 5 * t, alpha: 0.5 * a });
    ctx.restore();
  }

  function grade(ctx, C, k) {
    const gr = typeof C === 'string' ? (MOODS[C] || {}).grade : C.m.grade;
    if (!gr || k <= 0.001) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const w = ctx.canvas.width, h = ctx.canvas.height;
    if (gr.mul) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = gr.a * k;
      ctx.fillStyle = rgb(gr.mul);
      ctx.fillRect(0, 0, w, h);
    }
    if (gr.desat) {
      ctx.globalCompositeOperation = 'saturation';
      ctx.globalAlpha = gr.desat * k;
      ctx.fillStyle = 'rgb(128,128,128)';
      ctx.fillRect(0, 0, w, h);
    }
    if (gr.warm) {
      ctx.globalCompositeOperation = 'soft-light';
      ctx.globalAlpha = gr.a * k;
      ctx.fillStyle = rgb(gr.warm);
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  function wade(ctx, C, o) {
    const m = C.m;
    const t = o.t || 0;
    const w = o.w || 80;
    const a = o.alpha == null ? 1 : o.alpha;
    ctx.save();
    ctx.globalAlpha = a;
    for (let i = 0; i < 2; i++) {
      const q = (t * 0.6 + i * 0.5) % 1;
      ctx.strokeStyle = rgb(m.foam, 0.45 * (1 - q));
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(o.x, o.y + 2, w * (0.6 + 0.9 * q), w * (0.1 + 0.12 * q), 0, 0, TAU);
      ctx.stroke();
    }
    ctx.fillStyle = rgb(m.foam, 0.8);
    for (let i = 0; i < 9; i++) {
      const u = i / 8 - 0.5;
      const bob = 1.5 * Math.sin(t * 3 + i * 1.3);
      ctx.beginPath();
      ctx.ellipse(o.x + u * w * 1.1, o.y + bob + Math.abs(u) * 4, w * 0.14, 3.2, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function clipAbove(ctx, y, fn) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(-XM - 400, -400, LW + 800, y + 400);
    ctx.clip();
    fn();
    ctx.restore();
  }

  function backdrop(S, C, o) {
    o = o || {};
    const blur = o.blur || 0;
    const hit = C.backdrops.get(blur);
    if (hit) return hit;
    const { c, g } = makeLayer(S);
    const id = () => {};
    if (blur > 0) {
      const tmp = makeLayer(S);
      world(tmp.g, C, 0, id);
      g.filter = `blur(${blur * S}px)`;
      g.drawImage(tmp.c, -blur * 2, -blur * 2, W + blur * 4, H + blur * 4);
      g.filter = 'none';
      LOOK.texture(c, S, { seed: sd('bd', blur), offset: 7.1, noise: N, mottle: 0.04, dark: 0.03, light: 0.02 });
    } else world(g, C, 0, id);
    C.backdrops.set(blur, c);
    return c;
  }

  FILM.sets = Object.assign(FILM.sets || {}, {
    beach: Object.freeze({
      MOODS: Object.keys(MOODS), MARGIN: XM, W, H,
      statics, back, air, grade, swashY, wetY, wade, clipAbove, backdrop, breaker,
    }),
  });
})();
