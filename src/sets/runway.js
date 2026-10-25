// sets/runway.js: procedural set (background, props and light) shared by the scenes.
(function () {
  'use strict';

  const FILM = window.FILM;
  const LIB = FILM.lib, LOOK = FILM.look;
  const ID = 'set-runway';
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { makeLayer, poly, vgrad, hgrad, sstep, clamp01 } = LOOK;
  const TAU = Math.PI * 2;
  const W = 1080, H = 1080;

  const HORIZON = 470;
  const VP = [250, HORIZON];
  const SUN = [960, -120];
  const GROUND = 846;
  const FUS = { top: 300, bot: 736, nose: 520 };
  const WINDOW = { x0: 690, x1: 796, y0: 370, y1: 458 };
  const DOOR = { x0: 806, x1: 900, y0: 520, y1: 736 };
  const STEPS = [[DOOR.x0 + 6, 736], [DOOR.x0 - 6, 772], [DOOR.x0 - 18, 808], [DOOR.x0 - 30, GROUND]];
  const FAR_PLANE = [338, HORIZON + 6];
  const HAZE = [246, 240, 228];
  const col = (c, hz, a) => LOOK.col(c, hz, a, HAZE);
  const texture = (c, S, n, o) => LOOK.texture(c, S, Object.assign({ seed: sd('tex', n), offset: 70 + n * 13.7 }, o));
  const SUNLIGHT = { x: SUN[0], y: SUN[1], r: 900, amount: 0.25, color: [255, 246, 226] };

  function buildFar(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = vgrad(g, 0, HORIZON, [[0, 'rgb(226,224,214)'], [0.5, 'rgb(240,236,224)'], [1, 'rgb(250,246,236)']]);
    g.fillRect(0, 0, W, H);
    LOOK.haze(g, { x: SUN[0], y: SUN[1], r: 1100, stops: [[0, 'rgba(255,252,240,1)'], [0.35, 'rgba(255,250,236,0.7)'], [1, 'rgba(255,250,236,0)']] });
    g.fillStyle = vgrad(g, HORIZON - 120, HORIZON, [[0, 'rgba(236,222,196,0)'], [1, 'rgba(236,222,196,0.55)']]);
    g.fillRect(0, HORIZON - 120, W, 120);
    const dune = (base, amp, sc, seed, top, bot) => {
      g.beginPath();
      g.moveTo(-20, H);
      for (let x = -20; x <= W + 20; x += 4) {
        const n = LOOK.fbm(x * sc + seed, seed * 0.31, 3);
        g.lineTo(x, base - amp * Math.pow(n, 1.5));
      }
      g.lineTo(W + 20, H);
      g.closePath();
      g.fillStyle = vgrad(g, base - amp, HORIZON + 6, [[0, top], [1, bot]]);
      g.fill();
    };
    dune(HORIZON - 2, 46, 1 / 260, 7, 'rgb(232,222,204)', 'rgb(238,228,208)');
    dune(HORIZON + 2, 26, 1 / 150, 19, 'rgb(222,206,178)', 'rgb(232,218,192)');
    g.fillStyle = 'rgb(230,214,186)';
    g.fillRect(0, HORIZON + 4, W, H - HORIZON);
    texture(c, S, 1, { mottle: 0.035, dark: 0.03, light: 0.02 });
    return c;
  }

  const depthY = (s) => HORIZON + (GROUND + 120 - HORIZON) * s;
  const rx = (xNear, s) => VP[0] + (xNear - VP[0]) * s;

  function buildGround(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = vgrad(g, HORIZON, H, [[0, 'rgb(232,216,188)'], [0.25, 'rgb(220,196,156)'], [1, 'rgb(204,170,124)']]);
    g.fillRect(0, HORIZON + 2, W, H - HORIZON);
    const L = -620, R = 640;
    g.fillStyle = vgrad(g, HORIZON, H, [[0, 'rgb(236,220,194)'], [0.3, 'rgb(226,200,160)'], [1, 'rgb(214,178,134)']]);
    poly(g, [VP, [L, depthY(1)], [R, depthY(1)]]);
    g.fill();
    g.fillStyle = 'rgba(250,236,210,0.35)';
    poly(g, [VP, [L - 90, depthY(1)], [L, depthY(1)]]);
    g.fill();
    poly(g, [VP, [R, depthY(1)], [R + 70, depthY(1)]]);
    g.fill();
    const N = LOOK.noise(sd('rut'));
    for (const [xn, w, a] of [[-330, 12, 0.22], [-220, 10, 0.18], [120, 12, 0.2], [240, 9, 0.16], [430, 11, 0.14]]) {
      for (let s = 0.03; s < 1; s += 0.01) {
        const s1 = s + 0.011;
        const k = N.fbm(xn * 0.01 + s * 9, 3.1, 2);
        if (k < 0.38) continue;
        g.fillStyle = `rgba(150,112,76,${a * (0.4 + 0.6 * s) * k})`;
        poly(g, [[rx(xn - w, s), depthY(s)], [rx(xn + w, s), depthY(s)], [rx(xn + w, s1), depthY(s1)], [rx(xn - w, s1), depthY(s1)]]);
        g.fill();
        g.fillStyle = `rgba(255,244,222,${0.3 * a * s})`;
        poly(g, [[rx(xn + w, s), depthY(s)], [rx(xn + w * 1.6, s), depthY(s)], [rx(xn + w * 1.6, s1), depthY(s1)], [rx(xn + w, s1), depthY(s1)]]);
        g.fill();
      }
    }
    const rr = LIB.rng(sd('scrub'));
    for (let i = 0; i < 260; i++) {
      const s = 0.05 + Math.pow(rr(), 0.7) * 0.95;
      const y = depthY(s);
      const x = rr.range(-40, W + 40);
      const onRunway = x > rx(L, s) && x < rx(R, s);
      if (rr() < 0.6) {
        g.fillStyle = rr() < 0.5 ? `rgba(150,118,84,${0.25 + 0.3 * s})` : `rgba(255,244,224,${0.25 * s})`;
        g.beginPath();
        g.ellipse(x, y, 1 + 4 * s, 0.6 + 2 * s, 0, 0, TAU);
        g.fill();
      } else if (!onRunway) {
        const sz = 3 + 16 * s;
        g.fillStyle = col([150, 140, 96], clamp01(0.7 - s));
        g.beginPath();
        g.ellipse(x, y - sz * 0.3, sz, sz * 0.45, 0, Math.PI, 0);
        g.fill();
        g.fillStyle = col([186, 170, 116], clamp01(0.7 - s));
        g.beginPath();
        g.ellipse(x + sz * 0.2, y - sz * 0.42, sz * 0.5, sz * 0.24, 0, Math.PI, 0);
        g.fill();
      }
    }
    for (const s of [0.08, 0.13, 0.2, 0.3, 0.45, 0.66, 0.95]) {
      const x = rx(L - 40, s), y = depthY(s), w = 4 + 16 * s, h = 6 + 22 * s;
      const hz = clamp01(0.75 - s);
      g.fillStyle = col([196, 92, 60], hz);
      g.fillRect(x - w / 2, y - h, w, h);
      g.fillStyle = col([236, 226, 210], hz);
      g.fillRect(x - w / 2, y - h * 0.62, w, h * 0.22);
      g.fillStyle = 'rgba(120,90,60,0.25)';
      g.fillRect(x - w / 2, y - 1, w * 1.8, 2 + s * 3);
    }
    texture(c, S, 2, { mottle: 0.055, dark: 0.05, light: 0.035, glow: SUNLIGHT });
    return c;
  }

  const SKIN = [186, 168, 132];
  function buildPlane(S) {
    const { c, g } = makeLayer(S);
    const { top, bot, nose } = FUS;
    g.fillStyle = 'rgba(110,80,60,0.32)';
    g.beginPath();
    g.ellipse(860, GROUND + 4, 330, 26, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(110,80,60,0.2)';
    g.beginPath();
    g.ellipse(840, GROUND + 2, 420, 40, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(150,140,120)';
    poly(g, [[930, bot - 70], [W + 20, bot - 80], [W + 20, 790], [960, 790], [930, 760]]);
    g.fill();
    g.fillStyle = 'rgba(60,50,46,0.25)';
    g.fillRect(930, 770, W - 910, 20);
    for (const x of [990, 1070]) {
      g.fillStyle = 'rgb(46,44,46)';
      g.beginPath();
      g.arc(x, GROUND - 34, 36, 0, TAU);
      g.fill();
      g.fillStyle = 'rgb(120,118,112)';
      g.beginPath();
      g.arc(x + 4, GROUND - 38, 14, 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgb(120,118,112)';
    g.fillRect(612, bot - 20, 14, GROUND - 30 - bot + 20);
    g.fillStyle = 'rgb(160,158,150)';
    g.fillRect(612, bot - 20, 5, GROUND - 30 - bot + 20);
    g.fillStyle = 'rgb(46,44,46)';
    g.beginPath();
    g.arc(620, GROUND - 26, 27, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(126,124,118)';
    g.beginPath();
    g.arc(623, GROUND - 29, 10, 0, TAU);
    g.fill();
    g.beginPath();
    g.moveTo(W + 40, top);
    g.lineTo(760, top);
    g.bezierCurveTo(690, top, 640, 330, 610, 380);
    g.bezierCurveTo(580, 420, nose + 10, 470, nose, 560);
    g.bezierCurveTo(nose - 6, 640, 560, 700, 640, bot);
    g.lineTo(W + 40, bot);
    g.closePath();
    g.fillStyle = vgrad(g, top, bot, [[0, 'rgb(208,192,158)'], [0.3, `rgb(${SKIN})`], [0.75, 'rgb(150,132,104)'], [1, 'rgb(112,96,76)']]);
    g.fill();
    g.save();
    g.clip();
    g.fillStyle = 'rgba(110,104,96,0.35)';
    g.beginPath();
    g.ellipse(nose + 30, 560, 70, 190, 0, 0, TAU);
    g.fill();
    g.fillStyle = vgrad(g, top, top + 60, [[0, 'rgba(255,248,226,0.3)'], [1, 'rgba(255,248,226,0)']]);
    g.fillRect(0, top, W + 40, 60);
    g.fillStyle = vgrad(g, bot - 60, bot, [[0, 'rgba(240,210,170,0)'], [1, 'rgba(240,210,170,0.3)']]);
    g.fillRect(0, bot - 60, W + 40, 60);
    g.strokeStyle = 'rgba(90,80,66,0.3)';
    g.lineWidth = 1.5;
    for (const x of [700, 930, 1040]) {
      g.beginPath();
      g.moveTo(x, top);
      g.lineTo(x - 10, bot);
      g.stroke();
    }
    g.beginPath();
    g.moveTo(560, 600);
    g.lineTo(W + 40, 600);
    g.stroke();
    g.fillStyle = 'rgba(90,96,90,0.4)';
    g.fillRect(950, 548, 110, 22);
    g.beginPath();
    g.arc(1005, 559, 30, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(214,206,186,0.5)';
    const star = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 ? 9 : 22;
      star.push([1005 + r * Math.cos(a), 561 + r * Math.sin(a)]);
    }
    poly(g, star);
    g.fill();
    g.restore();
    const glass = (pts) => {
      poly(g, pts);
      g.fillStyle = 'rgb(60,66,74)';
      g.fill();
      g.save();
      poly(g, pts);
      g.clip();
      g.fillStyle = 'rgba(220,226,226,0.35)';
      g.fillRect(560, 330, 400, 30);
      g.restore();
    };
    glass([[612, 384], [640, 350], [676, 344], [676, 400], [626, 410]]);
    glass([[684, 344], [690, 344], [690, 382], [684, 382]]);
    const { x0, x1, y0, y1 } = WINDOW;
    g.fillStyle = 'rgb(84,82,78)';
    g.fillRect(x0 - 6, y0 - 6, x1 - x0 + 12, y1 - y0 + 12);
    g.fillStyle = vgrad(g, y0, y1, [[0, 'rgb(40,40,44)'], [1, 'rgb(60,58,58)']]);
    g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = 'rgb(232,226,208)';
    g.fillRect(x0 - 8, y1 + 2, x1 - x0 + 16, 5);
    g.fillStyle = 'rgba(120,130,140,0.6)';
    g.fillRect(x1 + 6, y0 - 2, 36, y1 - y0 + 4);
    g.fillStyle = 'rgba(230,236,236,0.4)';
    g.fillRect(x1 + 10, y0, 8, y1 - y0);
    const d = DOOR;
    g.fillStyle = 'rgb(96,90,80)';
    g.fillRect(d.x0 - 7, d.y0 - 7, d.x1 - d.x0 + 14, d.y1 - d.y0 + 7);
    g.fillStyle = vgrad(g, d.y0, d.y1, [[0, 'rgb(34,32,34)'], [1, 'rgb(58,52,48)']]);
    g.fillRect(d.x0, d.y0, d.x1 - d.x0, d.y1 - d.y0);
    g.fillStyle = 'rgba(255,220,170,0.12)';
    g.fillRect(d.x0, d.y1 - 30, d.x1 - d.x0, 30);
    for (let i = 0; i < STEPS.length - 1; i++) {
      const [sx, sy] = STEPS[i], [nx, ny] = STEPS[i + 1];
      g.fillStyle = 'rgb(118,112,100)';
      poly(g, [[sx + d.x1 - d.x0 - 8, sy], [sx + d.x1 - d.x0, sy], [nx + d.x1 - d.x0, ny], [nx + d.x1 - d.x0 - 8, ny]]);
      g.fill();
      g.fillStyle = 'rgb(206,198,178)';
      g.fillRect(nx, ny - 8, d.x1 - d.x0 + 4, 8);
      g.fillStyle = 'rgba(60,50,40,0.35)';
      g.fillRect(nx, ny, d.x1 - d.x0 + 4, 3);
    }
    texture(c, S, 3, { mottle: 0.06, dark: 0.05, light: 0.035, glow: SUNLIGHT });
    return c;
  }

  function buildLight(S) {
    const glow = LOOK.glowField({ x: SUN[0], y: SUN[1], r: 460, amount: 0.55 });
    const off = (X, Y) => 1 - 0.9 * sstep(480, 560, X) * sstep(230, 300, Y);
    const glare = (X, Y) => off(X, Y) * (0.26 * (1 - sstep(HORIZON - 260, HORIZON + 40, Y)) * (1 - sstep(400, 900, X)) + 0.22 * Math.exp(-Math.pow((Y - HORIZON) / 26, 2)));
    return LOOK.lightLayer(S, { fields: [glow, glare], color: [255, 252, 240] });
  }

  const buildMist = (S) => LOOK.mist(S, { bands: [[HORIZON + 4, 16, 0.9], [HORIZON + 30, 40, 0.35]], color: [252, 246, 234] });

  function shimmer(ctx, C, t) {
    const S = C.S;
    const y0 = HORIZON - 60, y1 = HORIZON + 34, step = 5;
    for (let y = y0; y < y1; y += step) {
      const k = 1 - Math.abs((y - HORIZON) / 60);
      const dx = 2.6 * k * Math.sin(y * 0.55 + t * 9.0) + 1.4 * k * Math.sin(y * 0.21 - t * 5.3);
      ctx.drawImage(C.far, 0, y * S, W * S, step * S, dx, y, W, step);
    }
  }

  let CACHE = null;
  function statics(S) {
    if (CACHE && CACHE.S === S) return CACHE;
    CACHE = { S, far: buildFar(S), ground: buildGround(S), plane: buildPlane(S), light: buildLight(S), mist: buildMist(S) };
    return CACHE;
  }

  FILM.sets = Object.assign(FILM.sets || {}, {
    runway: { statics, shimmer, HORIZON, VP, SUN, GROUND, WINDOW, DOOR, STEPS, FAR_PLANE, FUS },
  });
})();
