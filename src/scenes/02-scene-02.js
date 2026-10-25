// scenes/02-scene-02.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-02';
  const LIB = FILM.lib, LOOK = FILM.look;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { sstep, clamp01, lerp, makeLayer } = LOOK;
  const TAU = Math.PI * 2;
  const W = 1080, H = 1080;

  const B_RING = (info) => Math.min(info.dur - 0.3, wordAt(info, 'tokap', info.shot.beats[0].t + 1.92));

  const RING = { x: 540, y: 598, size: 500 };
  const CUSH = { x: 540, y: 800, rx: 250, ry: 42 };
  const ENV = '#4A1626';

  const SLOPE = -0.62;

  function buildBand(S) {
    const res = 0.25;
    const cw = Math.round(2 * W * S * res), ch = Math.round(H * S * res);
    const c = FILM.makeCanvas(cw, ch);
    const g = c.getContext('2d');
    const img = g.createImageData(cw, ch);
    const d = img.data;
    const N = LOOK.noise(sd('band'));
    for (let j = 0; j < ch; j++) {
      const Y = (j + 0.5) / (S * res);
      for (let i = 0; i < cw; i++) {
        const X = (i + 0.5) / (S * res);
        const u = X - W - (Y - 540) * SLOPE;
        const core = Math.exp(-(u * u) / (2 * 100 * 100));
        const halo = 0.22 * Math.exp(-(u * u) / (2 * 230 * 230));
        const sub = 0.82 + 0.3 * N.fbm(u / 60 + 3, 1.7, 2);
        const a = clamp01((core * sub + halo) * (0.9 + 0.1 * Math.sin(Y * 0.004)));
        const k = (j * cw + i) * 4;
        d[k] = 255;
        d[k + 1] = 196;
        d[k + 2] = 112;
        d[k + 3] = Math.round(255 * a);
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  function buildCushionBack(S) {
    const { c, g } = makeLayer(S);
    const { x, y, rx, ry } = CUSH;
    g.save();
    g.filter = 'blur(10px)';
    g.fillStyle = 'rgba(20,4,10,0.55)';
    g.beginPath();
    g.ellipse(x + 26, y + 104, rx * 1.12, ry * 0.75, 0, 0, TAU);
    g.fill();
    g.restore();
    const top = g.createLinearGradient(x - rx, y - ry, x + rx, y + ry);
    top.addColorStop(0, 'rgb(96,24,42)');
    top.addColorStop(0.6, 'rgb(150,48,70)');
    top.addColorStop(1, 'rgb(122,34,54)');
    g.fillStyle = top;
    g.beginPath();
    g.ellipse(x, y, rx, ry, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(255,190,200,0.12)';
    g.beginPath();
    g.ellipse(x + 60, y - 18, rx * 0.5, ry * 0.32, -0.05, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(40,8,18)';
    g.beginPath();
    g.ellipse(x, y + 4, rx * 0.62, 9, 0, 0, TAU);
    g.fill();
    LOOK.texture(c, S, { seed: sd('tex', 2), offset: 27.4, mottle: 0.07, dark: 0.06, light: 0.04 });
    return c;
  }

  function buildCushionFront(S) {
    const { c, g } = makeLayer(S);
    const { x, y, rx, ry } = CUSH;
    g.beginPath();
    g.moveTo(x - rx, y + 4);
    g.bezierCurveTo(x - rx * 1.08, y + ry * 3.6, x + rx * 1.08, y + ry * 3.6, x + rx, y + 4);
    g.bezierCurveTo(x + rx * 0.8, y - ry * 0.2, x + 60, y + 8, x, y + 8);
    g.bezierCurveTo(x - 60, y + 8, x - rx * 0.8, y - ry * 0.2, x - rx, y + 4);
    g.closePath();
    const fr = g.createLinearGradient(0, y, 0, y + ry * 2.8);
    fr.addColorStop(0, 'rgb(156,50,72)');
    fr.addColorStop(0.45, 'rgb(118,32,52)');
    fr.addColorStop(1, 'rgb(64,14,28)');
    g.fillStyle = fr;
    g.fill();
    const sh = g.createLinearGradient(x - rx, 0, x + rx, 0);
    sh.addColorStop(0, 'rgba(30,6,16,0.45)');
    sh.addColorStop(0.55, 'rgba(255,170,180,0)');
    sh.addColorStop(0.8, 'rgba(255,170,180,0.16)');
    sh.addColorStop(1, 'rgba(30,6,16,0.2)');
    g.fillStyle = sh;
    g.fill();
    g.strokeStyle = 'rgba(255,190,200,0.22)';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x - rx * 0.55, y + 22);
    g.bezierCurveTo(x - 20, y + 34, x + 40, y + 34, x + rx * 0.8, y + 14);
    g.stroke();
    LOOK.texture(c, S, { seed: sd('tex', 3), offset: 41.1, mottle: 0.08, dark: 0.07, light: 0.04 });
    return c;
  }

  const ringOpts = (t, dur) => ({ x: RING.x, y: RING.y, size: RING.size, rot: 0.5 + 0.05 * (t / dur), tilt: 0.14, t, shadow: 0, env: ENV });
  let STONE = null;
  function stoneAt(t, dur) {
    if (!STONE) {
      const g = FILM.makeCanvas(2, 2).getContext('2d');
      const out = FILM.cast.diamondRing(g, ringOpts(0, dur));
      STONE = out && out.diamond ? out.diamond.slice() : [RING.x, RING.y - 0.53 * RING.size];
    }
    return STONE;
  }

  function buildVignette(S) {
    const { c, g } = makeLayer(S);
    const v = g.createRadialGradient(540, 470, 260, 540, 520, 860);
    v.addColorStop(0, 'rgb(255,255,255)');
    v.addColorStop(0.6, 'rgb(214,208,222)');
    v.addColorStop(1, 'rgb(120,112,140)');
    g.fillStyle = v;
    g.fillRect(0, 0, W, H);
    return c;
  }

  let CACHE = null;
  function statics(S) {
    if (CACHE && CACHE.S === S) return CACHE;
    const ST = FILM.sets.store;
    CACHE = {
      S,
      set: ST.statics(S, { angle: 'window', tod: 'dawn' }),
      band: buildBand(S),
      cushBack: buildCushionBack(S),
      cushFront: buildCushionFront(S),
      vignette: buildVignette(S),
      night: FILM.makeCanvas(Math.round(W * S), Math.round(H * S)),
    };
    return CACHE;
  }

  const MOTES = (() => {
    const r = LIB.rng(sd('motes'));
    const m = [];
    for (let i = 0; i < 46; i++) m.push([r.range(-420, 420), r.range(40, 1000), r.range(6, 18), r.range(10, 30), r.range(1.2, 3.2), r() * TAU]);
    return m;
  })();

  function wordAt(info, token, fb, from) {
    const st = info.shot.start || 0, lo = from == null ? -0.05 : from;
    const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    const want = norm(token);
    for (const c of info.shot.captions || []) {
      for (const w of c.words || []) if (w[0] - st >= lo && norm(w[1]) === want) return w[0] - st;
    }
    return fb;
  }

  function setupAt(cuts, t) {
    let i = 0;
    while (i + 1 < cuts.length && t >= cuts[i + 1].at) i++;
    return i;
  }

  function frame(ctx, t, cuts) {
    const i = setupAt(cuts, t), c = cuts[i], u = t - c.at;
    const z = c.z * (1 + (c.push == null ? 0.02 : c.push) * u);
    const hw = 540 / Math.max(1, z);
    const cx = (typeof c.x === 'function' ? c.x(t) : c.x) + (c.dx || 0) * u;
    const cy = (typeof c.y === 'function' ? c.y(t) : c.y) + (c.dy || 0) * u;
    const x = Math.min(1080 - hw, Math.max(hw, cx)), y = Math.min(1080 - hw, Math.max(hw, cy));
    ctx.translate(540, 540);
    ctx.scale(z, z);
    ctx.translate(-x, -y);
    return i;
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const C = statics(S);
      const ST = FILM.sets.store;
      const BR = B_RING(info);
      const dur = info.dur;
      const DIAMOND = stoneAt(t, dur);
      const cam = (depth) => LOOK.camera(ctx, { t, dur, focus: DIAMOND, push: 0.045, depth, ease: LIB.ease.outSine });
      const CUTS = [
        { at: 0, z: 1, x: 540, y: 540, push: 0.03, dx: -4 },
        { at: wordAt(info, 'tokan', 1.66), z: 1.5, x: DIAMOND[0] + 10, y: DIAMOND[1] + 120, push: 0.035, dx: -6, dy: -4 },
      ];
      ctx.save();
      frame(ctx, t, CUTS);

      const bx0 = 1500, bxR = DIAMOND[0] - (DIAMOND[1] - 540) * SLOPE;
      const p = t / BR;
      const bx = t <= BR ? lerp(bx0, bxR, 1 - Math.pow(1 - p, 1.6)) : bxR - (t - BR) * 70;
      const lit = sstep(0.2, 1, p);
      const bandAt = (X, Y) => {
        const u = X - bx - (Y - 540) * SLOPE;
        return Math.exp(-(u * u) / (2 * 140 * 140));
      };
      const onStone = bandAt(DIAMOND[0], DIAMOND[1]);
      const env = LOOK.flashEnv(t, BR, { rise: 3, fall: 16 });
      const after = t >= BR ? Math.exp(-(t - BR) / 0.5) : 0;

      ctx.save();
      cam(0.6);
      ST.drawBack(ctx, C.set, { t });
      ctx.restore();

      ctx.save();
      cam(1);
      ctx.drawImage(C.cushBack, 0, 0, W, H);
      const ro = ringOpts(t, dur);
      ro.light = lerp(-0.25, -0.95, sstep(0, 1, onStone + 0.5 * sstep(BR - 1.2, BR, t)));
      ro.sparkle = 0.85 * env + 0.25 * after;
      const RG = FILM.cast.diamondRing(ctx, ro);
      const GL = RG && RG.glint ? RG.glint : DIAMOND;
      ctx.drawImage(C.cushFront, 0, 0, W, H);
      ctx.restore();

      const n = C.night.getContext('2d');
      n.setTransform(1, 0, 0, 1, 0, 0);
      n.globalCompositeOperation = 'source-over';
      n.clearRect(0, 0, C.night.width, C.night.height);
      n.setTransform(S, 0, 0, S, 0, 0);
      const nv = lerp(0.2, 0.42, lit);
      n.fillStyle = `rgb(${(70 + 90 * nv) | 0},${(84 + 80 * nv) | 0},${(150 + 70 * nv) | 0})`;
      n.fillRect(0, 0, W, H);
      n.globalCompositeOperation = 'destination-out';
      n.globalAlpha = 0.95;
      n.drawImage(C.band, bx - W, 0, 2 * W, H);
      n.globalAlpha = 1;
      ctx.save();
      cam(1);
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(C.night, 0, 0, W, H);
      ctx.restore();

      ctx.save();
      cam(0.85);
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.22 + 0.14 * lit;
      ctx.drawImage(C.band, bx - W, 0, 2 * W, H);
      ctx.save();
      ctx.beginPath();
      ctx.rect(-40, 744, W + 80, H);
      ctx.clip();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.75 * lit;
      ctx.drawImage(C.band, bx - W, 0, 2 * W, H);
      ctx.restore();
      ctx.globalAlpha = 1;
      for (const [u0, y0, sp, dr, sz, ph] of MOTES) {
        const y = ((y0 - t * sp) % 1080 + 1080) % 1080;
        const x = bx + (y - 540) * SLOPE + u0 + dr * Math.sin(t * 0.7 + ph);
        const a = bandAt(x, y) * (0.35 + 0.35 * Math.sin(t * 1.3 + ph * 3)) * lit;
        if (a < 0.02) continue;
        ctx.fillStyle = `rgba(255,236,200,${a})`;
        ctx.beginPath();
        ctx.arc(x, y, sz, 0, TAU);
        ctx.fill();
      }
      ctx.restore();

      ctx.save();
      cam(1);
      const warm = 0.5 * onStone * lit;
      if (warm > 0.01) LOOK.bloom(ctx, { x: DIAMOND[0], y: DIAMOND[1], r: 210, alpha: 0.28 * warm, mid: 0.12 * warm });
      if (env > 0.002 || after > 0.01) {
        LOOK.glint(ctx, { x: GL[0], y: GL[1], size: 20 + 30 * env + 8 * after, alpha: 0.95 * env + 0.4 * after, rot: 0.06 });
        LOOK.bloom(ctx, { x: GL[0], y: GL[1], r: 120 + 80 * env, alpha: 0.6 * env + 0.18 * after, mid: 0.25 * env + 0.06 * after });
      }
      ctx.restore();
      LOOK.exposure(ctx, env, { strength: 0.22 });
      ctx.restore();

      ST.drawLight(ctx, C.set, { t });
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(C.vignette, 0, 0, W, H);
      ctx.restore();

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
