/*
 * look.js : FILM.look, the film's one texture, one grain and one way of handling light.
 * Lifted from the test shot (src/scenes/04-window-flash.js). Loaded after props.js, before cast.js.
 * Every function is a pure function of its arguments. Builders return canvases: call them once
 * from a scene's static cache, never per frame. Sizes are logical pixels, angles radians,
 * colours [r, g, b] arrays unless noted. Read docs/SCENE-GUIDE.md for how a scene uses it.
 *
 * NOISE
 *   noise(seed) -> { vn(x, y), fbm(x, y, oct) }   seeded value noise (256-cell wrap) and fbm.
 *       const N = FILM.look.noise(sd('vn'));  N.fbm(x / 200, y / 80, 3)
 *   vn(x, y), fbm(x, y, oct)   the film's default noise (fixed seed). look.fbm(x / 380 + 11, 4, 3)
 *
 * COLOUR, LAYERS, SHAPES
 *   col(c, hz?, a?, haze?) -> css string. Mixes c toward haze (default the morning cream [240,228,204])
 *       by hz 0..1; a gives rgba.                     g.fillStyle = look.col([98,140,72], 0.4)
 *   shade(c, k) -> c scaled by k.                     look.shade(BRICK, 0.72)
 *   makeLayer(S, scale?, w?, h?) -> { c, g }   offscreen canvas at device scale (S * scale), g pre-scaled
 *       to logical px, default full frame.           const { c, g } = look.makeLayer(S)
 *   poly(g, pts)   begins and closes a path through [[x,y],...] (no fill).   look.poly(g, pts); g.fill()
 *   vgrad(g, y0, y1, stops), hgrad(g, x0, x1, stops) -> CanvasGradient; stops [[k, css], ...].
 *       g.fillStyle = look.vgrad(g, 0, 612, [[0, 'rgb(118,160,184)'], [1, 'rgb(246,228,192)']])
 *   leafPath(g, s)   maple-leaf path of radius s at the origin (no fill).  look.leafPath(g, 7); g.fill()
 *
 * TEXTURE (every static surface)
 *   texture(canvas, S, o)   bakes paint mottle and stipple into every non-transparent pixel, in place.
 *       o.seed     int, stipple hash seed (required; derive it from the shot id)
 *       o.offset   noise offset so layers differ (default 0)
 *       o.mottle   mottle strength, about 0.04 to 0.08 (default 0.06)
 *       o.scale    mottle scale multiplier on the 52 / 11 / 3.2 px octaves (default 1)
 *       o.dark     fraction of pixels darkened as stipple (default 0.05); o.darkK floor 0.86
 *       o.light    fraction of pixels lightened (default 0.035); o.lightK gain 1.08
 *       o.size     stipple cell in device px (default 1)
 *       o.dim      fn(X, Y) -> 0..1 cool darkening, mixed per channel by o.dimMix (default [1, 0.92, 0.7])
 *       o.glow     { x, y, r, amount, color } warm light baked toward a source (default color [255,238,200])
 *       o.tint     [r, g, b, amount] pull toward a colour
 *       o.noise    a noise() object (default the film's)
 *       look.texture(c, S, { seed: sd('tex', 1), offset: 13.7, mottle: 0.05, dark: 0.04, light: 0.03 })
 *
 * GRAIN (one layer, every shot, never boils)
 *   grain(ctx, info, o?)   the static full-frame grain, cached per render scale, the same seed in every
 *       shot. Draw it after the characters and before the caption, screen-fixed (no camera).
 *       o.alpha (default 0.55, overlay).              FILM.look.grain(ctx, info)
 *
 * LIGHT
 *   beamField(o) -> fn(X, Y) 0..1   parallel soft beams.
 *       o.beams [[u, halfWidth, strength], ...] with u measured along o.dir (a unit vector across the beams)
 *       o.noise { base, amp, scale, offset, row }: strength *= base + amp * vn(u / scale + offset, row)
 *       o.fall fn(X, Y) multiplier (fade along the beams), o.mask fn(X, Y) multiplier, o.clamp (default true)
 *       o.noiseFn a noise() object (default the film's; mist() takes it too)
 *       const beam = look.beamField({ beams: [[440, 95, 0.85]], dir: [0.906, 0.423] })
 *   glowField(o) -> fn(X, Y)   o.amount * gaussian round (o.x, o.y) of radius o.r.
 *       look.glowField({ x: 1060, y: -110, r: 520, amount: 0.6 })
 *   lightLayer(S, o) -> canvas   bakes fields into one light canvas: alpha = 1 - product(1 - f(X, Y)).
 *       o.fields [fn, ...], o.color (default [255,238,200]), o.res (default 0.25, soft by upscaling).
 *       C.light = look.lightLayer(S, { fields: [beam, glow] })
 *   drawLight(ctx, canvas, o?)   screen-blends a light canvas full frame; o.x, o.y drift, o.alpha.
 *       look.drawLight(ctx, C.light, { x: 8 * Math.sin(t * 0.35), alpha: 0.78 + 0.08 * Math.sin(t * 0.9) })
 *   mist(S, o) -> canvas   a drifting haze bed, wider than the frame by o.extra (default 240).
 *       o.bands [[y, halfHeight, strength], ...] gaussian rows; o.noise { sx, sy, oy, oct, gain, bias }
 *       (default 220, 70, 4, 3, 1.6, 0.35); o.mask fn(X, Y); o.color (default [248,238,216]); o.res 0.25.
 *       C.mist = look.mist(S, { bands: [[600, 46, 0.8]] })
 *   drawMist(ctx, canvas, o?)   draws the bed at o.x, o.y with o.alpha. Drift o.x a few px per second.
 *       look.drawMist(ctx, C.mist, { x: -160 + 30 * p, alpha: 0.75 })
 *   haze(g, o)   radial sun haze or glow filled over the frame. o.x, o.y, o.r, and either o.stops
 *       [[k, css], ...] or o.color + o.alpha (default stops: the test shot's warm morning sun).
 *       look.haze(g, { x: 1060, y: -110, r: 1150 })
 *
 * GLINT AND FLASH
 *   glint(ctx, o)   4-point star, tapered rays, shorter diagonals, warm core, screen blend.
 *       o.x, o.y, o.size (ray length: tip to tip is 2 * size, keep under 40 outside close-ups), o.alpha
 *       (capped at 0.9), o.rot.                      look.glint(ctx, { x: 700, y: 724, size: 20, alpha: 1 })
 *   bloom(ctx, o)   warm radial bloom, screen. o.x, o.y, o.r, o.alpha (centre), o.mid (at 0.4, default
 *       0.4 * alpha).                                look.bloom(ctx, { x, y, r: 100, alpha: 0.7 * env })
 *   flashEnv(t, at, o?) -> 0..1   flash envelope keyed to the beat at: rises over o.rise frames (3),
 *       gone by o.fall frames (13), visible on the beat frame. o.fps (24).   const env = look.flashEnv(t, B)
 *   exposure(ctx, env, o?)   whole-frame warm bloom, screen-fixed, never pure white. o.strength (0.5),
 *       o.color ([255,232,192]).                     look.exposure(ctx, env)
 *   beam(ctx, o) -> hit 0..1   a reflected beam from o.from to o.to, screen. o.alpha (intensity), o.sweep
 *       (radians off the line), o.reach (length past the target, 1.4), o.layers [[w0, w1, a], ...],
 *       o.hit { r, alpha, width } the glow where it crosses o.to (false to skip). Returns how hard it hits.
 *       look.beam(ctx, { from: [700, 724], to: [345, 640], alpha: I, sweep: (s - 0.222) * 0.22 })
 *
 * CAMERA
 *   camera(ctx, o)   applies the shot camera for one parallax depth (call inside save/restore).
 *       o.t, o.dur, o.focus [x, y], o.push (zoom at the end, 0.02 to 0.04), o.pan [dx, dy] (world px the
 *       camera travels), o.depth (1 near, 0.25 far, 0 fixed), o.ease (default inOutSine).
 *       look.camera(ctx, { t, dur: info.dur, focus: [600, 650], push: 0.03, depth: 0.55 })
 *
 * CHARACTERS ON THE GROUND
 *   shadowK(angle, length) -> [kx, ky]   shear for a cast shadow falling at angle (screen radians, 0 =
 *       right, PI = left) and length (shadow length / height).   look.shadowK(Math.PI - 0.15, 0.9)
 *   castShadow(ctx, o)   long soft shadow: the silhouette drawn by o.draw(g) at low resolution, sheared
 *       onto the ground, plus a soft blob along it. o.x, o.y (feet), o.h (height), o.draw(g) draws the
 *       figure at its real coordinates, o.k [kx, ky] or o.angle + o.length, o.alpha (0.3), o.color
 *       ('rgb(58,44,70)'), o.res (softness: 0.5 = half resolution, lower is softer), o.S (render scale),
 *       o.box [w, h, ox, oy] silhouette box round the feet (default scales 400, 400, 150, 370 by h / 330),
 *       o.blob false or { width (20), len (0.6), color ([58,44,72]), alphas ([0.3, 0.16]) }.
 *       look.castShadow(ctx, { x, y, h, k: [0.9, -0.14], S, draw: (g) => FILM.cast.sam(g, o) })
 *   contactShadow(ctx, o)   soft ellipse under the feet. o.x, o.y, o.h (scales the defaults), o.rx (70),
 *       o.ry (9), o.dx (-10, toward the shadow side), o.dy (2), o.alpha (0.35), o.color ([50,38,60]).
 *       look.contactShadow(ctx, { x, y, h: 330 })
 *
 * PARTICLES
 *   leaves(ctx, t, list, o?)   falling, swaying, flipping leaves. list rows [x0, y0, fall px/s, sway px,
 *       phase, size, css colour]; o.wind (px/s, default 14).   look.leaves(ctx, t, LEAVES)
 *   particles(ctx, t, o)   a seeded, wrapping field for rain, rice, bubbles, dust, snow, sparks.
 *       o.seed, o.count, o.area [x, y, w, h] (wraps inside it), o.vel [vx, vy] px/s, o.spread (speed
 *       variance 0..1, 0.3), o.sway px, o.swayHz (0.5), o.size [min, max], o.spin rad/s, o.alpha [min, max],
 *       o.color css, o.draw(ctx, p) custom shape (default a dot); p = { i, x, y, size, rot, alpha, u, v }
 *       with u, v fixed random 0..1 per particle.
 *       look.particles(ctx, t, { seed: sd('rain'), count: 120, area: [0, -40, 1080, 1120], vel: [-60, 900],
 *         size: [1, 2], draw: (g, p) => g.fillRect(p.x, p.y, p.size, p.size * 14) })
 *
 * Also: sstep(e0, e1, x), clamp01(v), lerp(a, b, k), TAU.
 */
(function () {
  'use strict';

  const FILM = window.FILM;
  const LIB = FILM.lib;
  const TAU = Math.PI * 2;
  const Wf = () => FILM.W || 1080;
  const Hf = () => FILM.H || 1080;

  // The film's fixed look seed: the test shot's id, so the grain and the default noise match the
  // approved test frame exactly. Never change it: every shot shares this grain.
  const LOOK_SEED = 'window-flash';
  const lsd = (...k) => LIB.hash(LOOK_SEED, ...k) & 0x7fffffff;

  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const lerp = (a, b, k) => a + (b - a) * k;
  const sstep = (e0, e1, x) => {
    const u = clamp01((x - e0) / (e1 - e0));
    return u * u * (3 - 2 * u);
  };

  // ---------------------------------------------------------------------------
  // Noise
  // ---------------------------------------------------------------------------

  const NOISES = new Map();
  function noise(seed) {
    const key = seed >>> 0;
    const hit = NOISES.get(key);
    if (hit) return hit;
    let NT = null;
    function vn(x, y) {
      if (!NT) {
        const r = LIB.rng(seed);
        NT = new Float32Array(65536);
        for (let i = 0; i < 65536; i++) NT[i] = r();
      }
      const xf = Math.floor(x);
      const yf = Math.floor(y);
      let fx = x - xf;
      let fy = y - yf;
      fx = fx * fx * (3 - 2 * fx);
      fy = fy * fy * (3 - 2 * fy);
      const xi = xf & 255;
      const yi = yf & 255;
      const x1 = (xi + 1) & 255;
      const y1 = (yi + 1) & 255;
      const a = NT[(yi << 8) | xi];
      const b = NT[(yi << 8) | x1];
      const c = NT[(y1 << 8) | xi];
      const d = NT[(y1 << 8) | x1];
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    }
    function fbm(x, y, oct) {
      let s = 0, a = 0.5, n = 0;
      for (let o = 0; o < oct; o++) {
        s += a * vn(x, y);
        n += a;
        x = x * 2.03 + 17.1;
        y = y * 2.03 + 9.7;
        a *= 0.5;
      }
      return s / n;
    }
    const N = Object.freeze({ vn, fbm });
    NOISES.set(key, N);
    return N;
  }
  const DEF = noise(lsd('vn'));

  // ---------------------------------------------------------------------------
  // Colour, layers, shapes
  // ---------------------------------------------------------------------------

  const HAZE = [240, 228, 204];
  function col(c, hz, a, haze) {
    const H = haze || HAZE;
    const h = hz || 0;
    const r = Math.round(lerp(c[0], H[0], h));
    const g = Math.round(lerp(c[1], H[1], h));
    const b = Math.round(lerp(c[2], H[2], h));
    return a == null ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
  }
  const shade = (c, k) => [c[0] * k, c[1] * k, c[2] * k];

  function makeLayer(S, scale, w, h) {
    const k = scale || 1;
    const lw = w || Wf();
    const lh = h || Hf();
    const c = FILM.makeCanvas(Math.max(1, Math.round(lw * S * k)), Math.max(1, Math.round(lh * S * k)));
    const g = c.getContext('2d');
    g.scale(S * k, S * k);
    return { c, g };
  }

  function poly(g, pts) {
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.closePath();
  }
  function vgrad(g, y0, y1, stops) {
    const gr = g.createLinearGradient(0, y0, 0, y1);
    for (const [k, c] of stops) gr.addColorStop(k, c);
    return gr;
  }
  function hgrad(g, x0, x1, stops) {
    const gr = g.createLinearGradient(x0, 0, x1, 0);
    for (const [k, c] of stops) gr.addColorStop(k, c);
    return gr;
  }

  // Maple leaf outline: five lobes, pointed tips.
  function leafPath(g, s) {
    g.beginPath();
    const n = 40;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * TAU - Math.PI / 2;
      const lobe = Math.pow(Math.abs(Math.cos(2.5 * (a + Math.PI / 2))), 0.6);
      const down = a > 0.9 && a < 2.25 ? 0.55 : 1; // the stem notch at the bottom
      const r = s * (0.45 + 0.55 * lobe) * down;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
  }

  // ---------------------------------------------------------------------------
  // Texture: paint mottle and stipple, baked per pixel
  // ---------------------------------------------------------------------------

  const DIM_MIX = [1, 0.92, 0.7];
  const GLOW_COL = [255, 238, 200];

  function texture(c, S, o) {
    const vn = (o.noise || DEF).vn;
    const g = c.getContext('2d');
    const Wd = c.width;
    const Hd = c.height;
    const img = g.getImageData(0, 0, Wd, Hd);
    const d = img.data;
    const seed = o.seed | 0;
    const ox = o.offset || 0;
    const mottle = o.mottle != null ? o.mottle : 0.06;
    const sc = o.scale || 1;
    const s0 = 52 * sc, s1 = 11 * sc, s2 = 3.2 * sc;
    const dark = o.dark != null ? o.dark : 0.05;
    const light = o.light != null ? o.light : 0.035;
    const darkK = o.darkK != null ? o.darkK : 0.86;
    const lightK = o.lightK != null ? o.lightK : 1.08;
    const size = o.size && o.size > 1 ? o.size : 1;
    const dim = typeof o.dim === 'function' ? o.dim : null;
    const dm = o.dimMix || DIM_MIX;
    const gl = o.glow && o.glow.amount > 0 ? o.glow : null;
    const sun = gl ? gl.amount : 0;
    const sunX = gl ? gl.x : 0, sunY = gl ? gl.y : 0;
    const sunR = gl ? gl.r || 700 : 700;
    const sunR2 = sunR * sunR;
    const gc = gl && gl.color ? gl.color : GLOW_COL;
    const tint = o.tint && o.tint[3] > 0 ? o.tint : null;
    for (let py = 0; py < Hd; py++) {
      const Y = (py + 0.5) / S;
      for (let px = 0; px < Wd; px++) {
        const i = (py * Wd + px) * 4;
        if (d[i + 3] === 0) continue;
        const X = (px + 0.5) / S;
        let k = 1 + mottle * ((vn(X / s0 + ox, Y / s0) - 0.5) + 0.7 * (vn(X / s1, Y / s1 + ox) - 0.5) + 0.5 * (vn(X / s2 + ox, Y / s2) - 0.5));
        const h = size === 1 ? LIB.h3(px, py, seed) : LIB.h3((px / size) | 0, (py / size) | 0, seed);
        if (h < dark) k *= darkK + 0.08 * (h / dark);
        else if (h > 1 - light) k *= lightK;
        let r = d[i] * k;
        let gg = d[i + 1] * k;
        let b = d[i + 2] * k;
        if (dim) {
          const m = dim(X, Y);
          r *= 1 - m * dm[0];
          gg *= 1 - m * dm[1];
          b *= 1 - m * dm[2];
        }
        if (sun > 0) {
          const dx = X - sunX;
          const dy = Y - sunY;
          const q = Math.exp(-(dx * dx + dy * dy) / sunR2) * sun;
          r += (gc[0] - r) * q;
          gg += (gc[1] - gg) * q;
          b += (gc[2] - b) * q;
        }
        if (tint) {
          r += (tint[0] - r) * tint[3];
          gg += (tint[1] - gg) * tint[3];
          b += (tint[2] - b) * tint[3];
        }
        d[i] = r;
        d[i + 1] = gg;
        d[i + 2] = b;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  // ---------------------------------------------------------------------------
  // Grain: one static paper-and-stipple overlay at device resolution
  // ---------------------------------------------------------------------------

  const GRAIN = new Map();
  function buildGrain(S, W, H) {
    const vn = DEF.vn;
    const Wd = Math.round(W * S), Hd = Math.round(H * S);
    const c = FILM.makeCanvas(Wd, Hd);
    const g = c.getContext('2d');
    const img = g.createImageData(Wd, Hd);
    const d = img.data;
    const s1 = lsd('grain', 1), s2 = lsd('grain', 2), s3 = lsd('grain', 3);
    const cx = W / 2, cy = H / 2 + 20, R = 760 * (Math.max(W, H) / 1080);
    for (let py = 0; py < Hd; py++) {
      const Y = (py + 0.5) / S;
      for (let px = 0; px < Wd; px++) {
        const X = (px + 0.5) / S;
        let v = 128;
        v += 46 * (LIB.h3(px, py, s1) - 0.5);
        v += 26 * (LIB.h3(px >> 1, py >> 1, s2) - 0.5);
        v += 18 * (vn(X / 4 + 50, Y / 4) - 0.5);
        v += 16 * (vn(X / 80 + 90, Y / 80) - 0.5) + 8 * (vn(X / 22, Y / 22 + 70) - 0.5);
        const st = LIB.h3(px, py, s3);
        if (st < 0.03) v -= 44;
        else if (st > 0.978) v += 30;
        const dx = (X - cx) / R, dy = (Y - cy) / R;
        v -= 30 * sstep(0.45, 1.05, Math.sqrt(dx * dx + dy * dy));
        const i = (py * Wd + px) * 4;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v * 0.98;
        d[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }
  function grain(ctx, info, o) {
    const S = (info && info.S) || FILM.S || 1;
    const W = Wf(), H = Hf();
    const key = `${S}|${W}|${H}`;
    let c = GRAIN.get(key);
    if (!c) {
      c = buildGrain(S, W, H);
      GRAIN.set(key, c);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = o && o.alpha != null ? o.alpha : 0.55;
    ctx.drawImage(c, 0, 0, W, H);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Light: beams, glows, the baked light layer, mist and haze
  // ---------------------------------------------------------------------------

  function beamField(o) {
    const vn = (o.noiseFn || DEF).vn;
    const beams = o.beams;
    const dx = o.dir ? o.dir[0] : 0.906;
    const dy = o.dir ? o.dir[1] : 0.423;
    const nz = o.noise || null;
    const nb = nz ? (nz.base != null ? nz.base : 0.8) : 1;
    const na = nz ? (nz.amp != null ? nz.amp : 0.4) : 0;
    const ns = nz ? nz.scale || 7 : 1;
    const no = nz ? nz.offset || 0 : 0;
    const nr = nz ? (nz.row != null ? nz.row : 11.5) : 0;
    const fall = o.fall || null;
    const mask = o.mask || null;
    const clamp = o.clamp !== false;
    return function (X, Y) {
      const u = X * dx + Y * dy;
      let a = 0;
      for (const [u0, w, s] of beams) {
        const q = Math.abs(u - u0) / w;
        if (q < 1) a += s * (1 - q * q) * (1 - q * q);
      }
      if (nz) a *= nb + na * vn(u / ns + no, nr);
      if (fall) a = a * fall(X, Y);
      if (mask) a = a * mask(X, Y);
      return clamp ? clamp01(a) : a;
    };
  }

  function glowField(o) {
    const x = o.x, y = o.y, r2 = o.r * o.r, amt = o.amount != null ? o.amount : 1;
    return (X, Y) => {
      const sx = X - x, sy = Y - y;
      return amt * Math.exp(-(sx * sx + sy * sy) / r2);
    };
  }

  function lightLayer(S, o) {
    const k = o.res || 0.25;
    const W = o.w || Wf(), H = o.h || Hf();
    const c = FILM.makeCanvas(Math.max(1, Math.round(W * S * k)), Math.max(1, Math.round(H * S * k)));
    const g = c.getContext('2d');
    const img = g.createImageData(c.width, c.height);
    const d = img.data;
    const fields = o.fields || [];
    const nf = fields.length;
    const cc = o.color || GLOW_COL;
    for (let py = 0; py < c.height; py++) {
      const Y = (py + 0.5) / (S * k);
      for (let px = 0; px < c.width; px++) {
        const X = (px + 0.5) / (S * k);
        let p = 1 - fields[0](X, Y);
        for (let j = 1; j < nf; j++) p = p * (1 - fields[j](X, Y));
        const a = 1 - p;
        const i = (py * c.width + px) * 4;
        d[i] = cc[0];
        d[i + 1] = cc[1];
        d[i + 2] = cc[2];
        d[i + 3] = Math.round(clamp01(a) * 255);
      }
    }
    g.putImageData(img, 0, 0);
    c.lw = W;
    c.lh = H;
    return c;
  }

  function drawLight(ctx, c, o) {
    o = o || {};
    ctx.save();
    ctx.globalCompositeOperation = o.op || 'screen';
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    ctx.drawImage(c, o.x || 0, o.y || 0, c.lw || Wf(), c.lh || Hf());
    ctx.restore();
  }

  const MIST_NOISE = { sx: 220, sy: 70, oy: 4, oct: 3, gain: 1.6, bias: 0.35 };
  const MIST_COL = [248, 238, 216];
  function mist(S, o) {
    const fbm = (o.noiseFn || DEF).fbm;
    const k = o.res || 0.25;
    const extra = o.extra != null ? o.extra : 240;
    const W = (o.w || Wf()) + extra, H = o.h || Hf();
    const nz = Object.assign({}, MIST_NOISE, o.noise || {});
    const bands = o.bands || [[600, 46, 0.8]];
    const mask = o.mask || null;
    const cc = o.color || MIST_COL;
    const c = FILM.makeCanvas(Math.round(W * S * k), Math.round(H * S * k));
    const g = c.getContext('2d');
    const img = g.createImageData(c.width, c.height);
    const d = img.data;
    for (let py = 0; py < c.height; py++) {
      const Y = (py + 0.5) / (S * k);
      let band = 0;
      for (const [y, w, s] of bands) band += Math.exp(-Math.pow((Y - y) / w, 2)) * s;
      for (let px = 0; px < c.width; px++) {
        const X = (px + 0.5) / (S * k);
        const n = clamp01(fbm(X / nz.sx, Y / nz.sy + nz.oy, nz.oct) * nz.gain - nz.bias);
        let a = band * n;
        if (mask) a = a * mask(X, Y);
        const i = (py * c.width + px) * 4;
        d[i] = cc[0];
        d[i + 1] = cc[1];
        d[i + 2] = cc[2];
        d[i + 3] = Math.round(clamp01(a) * 255);
      }
    }
    g.putImageData(img, 0, 0);
    c.lw = W;
    c.lh = H;
    return c;
  }

  function drawMist(ctx, c, o) {
    o = o || {};
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    ctx.drawImage(c, o.x || 0, o.y || 0, c.lw, c.lh);
    ctx.restore();
  }

  const SUN_STOPS = [
    [0, 'rgba(255,246,214,1)'],
    [0.18, 'rgba(255,240,200,0.85)'],
    [0.45, 'rgba(252,230,190,0.35)'],
    [1, 'rgba(250,226,190,0)'],
  ];
  function haze(g, o) {
    let stops = o.stops;
    if (!stops && o.color) {
      const a = o.alpha != null ? o.alpha : 1;
      const [r, gg, b] = o.color;
      stops = [[0, a], [0.18, 0.85 * a], [0.45, 0.35 * a], [1, 0]].map(([k, al]) => [k, `rgba(${r},${gg},${b},${al})`]);
    }
    stops = stops || SUN_STOPS;
    const rg = g.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
    for (const [k, c] of stops) rg.addColorStop(k, c);
    g.fillStyle = rg;
    g.fillRect(0, 0, o.w || Wf(), o.h || Hf());
  }

  // ---------------------------------------------------------------------------
  // Glint and flash
  // ---------------------------------------------------------------------------

  // Four-point star: soft tapered rays fading along their length, a shorter diagonal pair, a warm core.
  function glint(ctx, o) {
    const x = o.x, y = o.y, R = o.size, rot = o.rot || 0;
    let a = o.alpha != null ? o.alpha : 1;
    if (R <= 0 || a <= 0) return;
    a = Math.min(0.9, a);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const core = ctx.createRadialGradient(x, y, 0, x, y, R * 0.45);
    core.addColorStop(0, `rgba(255,246,222,${0.85 * a})`);
    core.addColorStop(0.35, `rgba(255,226,166,${0.35 * a})`);
    core.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = core;
    ctx.fillRect(x - R * 0.45, y - R * 0.45, R * 0.9, R * 0.9);
    ctx.translate(x, y);
    ctx.rotate(rot);
    const ray = (len, wid, al) => {
      const gr = ctx.createLinearGradient(0, 0, len, 0);
      gr.addColorStop(0, `rgba(255,246,220,${al})`);
      gr.addColorStop(0.5, `rgba(255,236,196,${al * 0.45})`);
      gr.addColorStop(1, 'rgba(255,230,190,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.moveTo(0, -wid);
      ctx.quadraticCurveTo(len * 0.3, -wid * 0.25, len, 0);
      ctx.quadraticCurveTo(len * 0.3, wid * 0.25, 0, wid);
      ctx.closePath();
      ctx.fill();
    };
    for (let k = 0; k < 4; k++) {
      ray(R, Math.max(0.8, R * 0.075), a);
      ctx.rotate(Math.PI / 2);
    }
    ctx.rotate(Math.PI / 4);
    for (let k = 0; k < 4; k++) {
      ray(R * 0.4, Math.max(0.6, R * 0.05), a * 0.6);
      ctx.rotate(Math.PI / 2);
    }
    ctx.restore();
  }

  function bloom(ctx, o) {
    const x = o.x, y = o.y, rad = o.r;
    const a = o.alpha != null ? o.alpha : 1;
    const mid = o.mid != null ? o.mid : 0.4 * a;
    if (rad <= 0 || (a <= 0 && mid <= 0)) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const bg = ctx.createRadialGradient(x, y, 0, x, y, rad);
    bg.addColorStop(0, `rgba(255,236,190,${a})`);
    bg.addColorStop(0.4, `rgba(255,220,160,${mid})`);
    bg.addColorStop(1, 'rgba(255,220,160,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    ctx.restore();
  }

  // Envelope of a flash: rises over `rise` frames and is gone by `fall` frames, visible on the beat frame.
  function flashEnv(t, at, o) {
    const FR = 1 / ((o && o.fps) || 24);
    const rise = (o && o.rise) || 3;
    const fall = (o && o.fall) || 13;
    const f = (t - at) / FR + 1;
    if (f <= 0) return 0;
    if (f < rise) return sstep(0, rise, f);
    return 1 - sstep(rise, fall, f);
  }

  function exposure(ctx, env, o) {
    if (!(env > 0.002)) return;
    const k = o && o.strength != null ? o.strength : 0.5;
    const c = (o && o.color) || [255, 232, 192];
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${k * env})`;
    ctx.fillRect(0, 0, Wf(), Hf());
    ctx.restore();
  }

  const BEAM_LAYERS = [[5, 60, 0.16], [2.5, 26, 0.3], [1, 7, 0.6]];
  const BEAM_HIT = { r: 80, alpha: 0.6, width: 30 };
  function beam(ctx, o) {
    const I = o.alpha != null ? o.alpha : 1;
    if (!(I > 0)) return 0;
    const [ax, ay] = o.from;
    const [bx, by] = o.to;
    const ex = bx - ax, ey = by - ay;
    const dist = Math.hypot(ex, ey);
    const angTo = Math.atan2(ey, ex);
    const ang = angTo + (o.sweep || 0);
    const len = dist * (o.reach || 1.4);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.translate(ax, ay);
    ctx.rotate(ang);
    for (const [w0, w1, a] of o.layers || BEAM_LAYERS) {
      const gr = ctx.createLinearGradient(0, 0, len, 0);
      gr.addColorStop(0, `rgba(255,246,220,${a * I})`);
      gr.addColorStop(0.7, `rgba(255,238,200,${a * I * 0.8})`);
      gr.addColorStop(1, 'rgba(255,230,190,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.moveTo(0, -w0);
      ctx.lineTo(len, -w1 * 1.4);
      ctx.lineTo(len, w1 * 1.4);
      ctx.lineTo(0, w0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    if (o.hit === false) return 0;
    const hc = Object.assign({}, BEAM_HIT, o.hit || {});
    // the light catching whatever it crosses at the target
    const hit = Math.exp(-Math.pow(((ang - angTo) * dist) / hc.width, 2)) * I;
    if (hit > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const gr = ctx.createRadialGradient(bx, by, 0, bx, by, hc.r);
      gr.addColorStop(0, `rgba(255,240,200,${hc.alpha * hit})`);
      gr.addColorStop(1, 'rgba(255,230,180,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(bx - hc.r, by - hc.r, hc.r * 2, hc.r * 2);
      ctx.restore();
    }
    return hit;
  }

  // ---------------------------------------------------------------------------
  // Camera
  // ---------------------------------------------------------------------------

  function camera(ctx, o) {
    const e = (o.ease || LIB.ease.inOutSine)(o.t / o.dur);
    const d = o.depth == null ? 1 : o.depth;
    if (o.pan) ctx.translate(-o.pan[0] * d * e, -o.pan[1] * d * e);
    if (o.push) {
      const f = o.focus || [Wf() / 2, Hf() / 2];
      const z = 1 + o.push * d * e;
      ctx.translate(f[0], f[1]);
      ctx.scale(z, z);
      ctx.translate(-f[0], -f[1]);
    }
  }

  // ---------------------------------------------------------------------------
  // Characters on the ground
  // ---------------------------------------------------------------------------

  const shadowK = (angle, length) => [-Math.cos(angle) * length, -Math.sin(angle) * length];

  const SIL = new Map();
  const BLOB = { width: 20, len: 0.6, color: [58, 44, 72], alphas: [0.3, 0.16] };
  function castShadow(ctx, o) {
    const x = o.x, y = o.y, h = o.h;
    const K = o.k || shadowK(o.angle != null ? o.angle : Math.PI - 0.15, o.length != null ? o.length : 0.9);
    const S = o.S || FILM.S || 1;
    const res = o.res || 0.5;
    const sc = h / 330;
    const [bw, bh, bx, by] = o.box || [400 * sc, 400 * sc, 150 * sc, 370 * sc];
    // a long blurred ellipse from the feet along the shadow
    if (o.blob !== false) {
      const bl = Object.assign({}, BLOB, o.blob || {});
      const vx = -K[0] * h, vy = -K[1] * h;
      const bc = bl.color;
      ctx.save();
      ctx.translate(x + vx * 0.5, y + vy * 0.5);
      ctx.rotate(Math.atan2(vy, vx));
      ctx.scale(Math.hypot(vx, vy) * bl.len, bl.width);
      const eg = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      eg.addColorStop(0, `rgba(${bc[0]},${bc[1]},${bc[2]},${bl.alphas[0]})`);
      eg.addColorStop(0.6, `rgba(${bc[0]},${bc[1]},${bc[2]},${bl.alphas[1]})`);
      eg.addColorStop(1, `rgba(${bc[0]},${bc[1]},${bc[2]},0)`);
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    if (typeof o.draw !== 'function') return;
    const sw = Math.max(1, Math.round(bw * S * res)), shh = Math.max(1, Math.round(bh * S * res));
    const key = `${sw}x${shh}`;
    let sil = SIL.get(key);
    if (!sil) {
      sil = FILM.makeCanvas(sw, shh);
      SIL.set(key, sil);
    }
    const k = sil.width / bw;
    const g = sil.getContext('2d');
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, sil.width, sil.height);
    g.setTransform(k, 0, 0, k, 0, 0);
    g.translate(bx - x, by - y);
    o.draw(g);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = o.color || 'rgb(58,44,70)';
    g.fillRect(0, 0, sil.width, sil.height);
    g.restore();
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = o.alpha != null ? o.alpha : 0.3;
    ctx.transform(1, 0, K[0], K[1], 0, 0);
    ctx.drawImage(sil, -bx, -by, bw, bh);
    ctx.restore();
  }

  function contactShadow(ctx, o) {
    const sc = (o.h || 330) / 330;
    const rx = o.rx != null ? o.rx : 70 * sc;
    const ry = o.ry != null ? o.ry : 9 * sc;
    const cx = o.x + (o.dx != null ? o.dx : -10 * sc);
    const cy = o.y + (o.dy != null ? o.dy : 2 * sc);
    const c = o.color || [50, 38, 60];
    const a = o.alpha != null ? o.alpha : 0.35;
    ctx.save();
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    cg.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${a})`);
    cg.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Particles
  // ---------------------------------------------------------------------------

  function leaves(ctx, t, list, o) {
    const wind = o && o.wind != null ? o.wind : 14;
    for (const [x0, y0, vy, amp, ph, s, c] of list) {
      const y = y0 + vy * t;
      const x = x0 + wind * t + amp * Math.sin(t * 1.3 + ph);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ph + t * 0.9 + 0.5 * Math.sin(t * 2 + ph));
      ctx.scale(Math.cos(t * 2.4 + ph) * 0.8 + 0.2 * Math.sign(Math.cos(t * 2.4 + ph) || 1), 1);
      ctx.fillStyle = c;
      leafPath(ctx, s);
      ctx.fill();
      ctx.restore();
    }
  }

  const PCACHE = new Map();
  const wrap = (v, a, w) => a + ((((v - a) % w) + w) % w);
  function particles(ctx, t, o) {
    const n = o.count | 0;
    if (n <= 0) return;
    const [ax, ay, aw, ah] = o.area || [0, 0, Wf(), Hf()];
    const key = `${o.seed}|${n}`;
    let P = PCACHE.get(key);
    if (!P) {
      const r = LIB.rng(o.seed >>> 0);
      P = [];
      for (let i = 0; i < n; i++) P.push([r(), r(), r(), r(), r(), r(), r()]);
      PCACHE.set(key, P);
    }
    const vel = o.vel || [0, 60];
    const spread = o.spread != null ? o.spread : 0.3;
    const sway = o.sway || 0;
    const hz = o.swayHz != null ? o.swayHz : 0.5;
    const sz = o.size || [2, 4];
    const al = o.alpha || [1, 1];
    const spin = o.spin || 0;
    ctx.save();
    if (!o.draw) ctx.fillStyle = o.color || 'rgba(255,248,232,0.8)';
    for (let i = 0; i < n; i++) {
      const [rx, ry, rs, rp, rz, ra, rr] = P[i];
      const sp = 1 + spread * (rs - 0.5) * 2;
      const ph = rp * TAU;
      let x = ax + rx * aw + vel[0] * sp * t + sway * Math.sin(TAU * hz * t + ph);
      let y = ay + ry * ah + vel[1] * sp * t;
      x = wrap(x, ax, aw);
      y = wrap(y, ay, ah);
      const p = { i, x, y, size: lerp(sz[0], sz[1], rz), rot: rr * TAU + spin * t, alpha: lerp(al[0], al[1], ra), u: rx, v: ry };
      if (o.draw) o.draw(ctx, p);
      else {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  FILM.look = Object.freeze({
    TAU, sstep, clamp01, lerp,
    noise, vn: DEF.vn, fbm: DEF.fbm,
    col, shade, makeLayer, poly, vgrad, hgrad, leafPath,
    texture, grain,
    beamField, glowField, lightLayer, drawLight, mist, drawMist, haze,
    glint, bloom, flashEnv, exposure, beam,
    camera,
    shadowK, castShadow, contactShadow,
    leaves, particles,
  });
})();
