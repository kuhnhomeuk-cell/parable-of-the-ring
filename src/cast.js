// src/cast.js: character and prop builders (FILM.cast).
(function () {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const FILM = (root.FILM = root.FILM || {});
  const TAU = Math.PI * 2;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

  function geom(o, wallK, sizeK, widthK) {
    const k = sizeK || 1;
    const rx = Math.max(1, o.rx * k);
    const ry = Math.max(1, Math.min(o.ry * k, rx));
    const tilt = Math.sqrt(Math.max(0, 1 - (ry / rx) * (ry / rx)));
    const w = rx * (widthK || 0.14);
    const h = rx * (wallK || 0.3) * tilt;
    return { x: o.x, y: o.y, rx, ry, w, h, irx: rx - w, iry: ry - (w * ry) / rx };
  }

  function ell(ctx, x, y, rx, ry, a0, a1, ccw) {
    ctx.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, a0, a1, !!ccw);
  }

  function band(ctx, g, c) {
    const { x, y, rx, ry, w, h, irx, iry } = g;
    ctx.beginPath();
    ell(ctx, x, y, rx, ry, 0, Math.PI);
    ell(ctx, x, y + h, rx, ry, Math.PI, 0, true);
    ctx.closePath();
    const side = ctx.createLinearGradient(x - rx, 0, x + rx, 0);
    side.addColorStop(0, c.sideL);
    side.addColorStop(0.45, c.sideM);
    side.addColorStop(1, c.sideR);
    ctx.fillStyle = side;
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ell(ctx, x, y, irx, iry, 0, TAU);
    ctx.clip();
    ctx.beginPath();
    ell(ctx, x, y, irx, iry, 0, TAU);
    ell(ctx, x, y + h, irx, iry, 0, TAU);
    const inner = ctx.createLinearGradient(0, y - iry, 0, y + h);
    inner.addColorStop(0, c.innerTop);
    inner.addColorStop(1, c.innerBot);
    ctx.fillStyle = inner;
    ctx.fill('evenodd');
    ctx.restore();
    ctx.beginPath();
    ell(ctx, x, y, rx, ry, 0, TAU);
    ell(ctx, x, y, irx, iry, 0, TAU);
    const top = ctx.createLinearGradient(x - rx, y - ry, x + rx * 0.8, y + ry);
    top.addColorStop(0, c.topA);
    top.addColorStop(0.5, c.topB);
    top.addColorStop(1, c.topC);
    ctx.fillStyle = top;
    ctx.fill('evenodd');
  }

  function rimArc(ctx, g, a0, a1, color, width, alpha) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ell(ctx, g.x, g.y, g.rx - g.w * 0.5, g.ry - (g.w * 0.5 * g.ry) / g.rx, a0, a1);
    ctx.stroke();
    ctx.restore();
  }

  function ring(ctx, o) {
    const g = geom(o, 0.35, 1, 0.19);
    const t = o.t || 0;
    const sparkle = clamp01(o.sparkle || 0);
    const { x, y, rx, ry, h, irx, iry } = g;
    const ink = '#5a2c10';
    const lw = Math.max(1, rx * 0.018);
    ctx.save();
    ctx.fillStyle = 'rgba(30,58,18,0.26)';
    ctx.beginPath();
    ell(ctx, x + rx * 0.07, y + h + ry * 0.02, rx * 1.06, ry * 1.22, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ell(ctx, x, y, rx, ry, 0, Math.PI);
    ell(ctx, x, y + h, rx, ry, Math.PI, 0, true);
    ctx.closePath();
    const side = ctx.createLinearGradient(x - rx, 0, x + rx, 0);
    side.addColorStop(0, '#d48a2d');
    side.addColorStop(0.12, '#dc912f');
    side.addColorStop(0.664, '#de9431');
    side.addColorStop(0.668, '#b86727');
    side.addColorStop(1, '#ae5f24');
    ctx.fillStyle = side;
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ell(ctx, x, y, irx, iry, 0, TAU);
    ctx.clip();
    ctx.fillStyle = 'rgba(46,62,10,0.2)';
    ctx.fill();
    ctx.beginPath();
    ell(ctx, x, y, irx, iry, 0, TAU);
    ell(ctx, x, y + h, irx, iry, 0, TAU);
    ctx.fillStyle = '#8a4920';
    ctx.fill('evenodd');
    ctx.strokeStyle = 'rgba(184,122,58,0.9)';
    ctx.lineWidth = Math.max(1, iry * 0.18);
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ell(ctx, x, y + iry * 0.55, irx * 0.78, iry * 0.95, Math.PI * 1.2, Math.PI * 1.62);
    ctx.stroke();
    ctx.strokeStyle = ink;
    ctx.lineWidth = lw * 0.8;
    ctx.beginPath();
    ell(ctx, x, y + h, irx, iry, Math.PI, TAU);
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ell(ctx, x, y, rx, ry, 0, TAU);
    ell(ctx, x, y, irx, iry, 0, TAU);
    const top = ctx.createLinearGradient(x - rx, y - ry, x + rx * 0.8, y + ry);
    top.addColorStop(0, '#f8d468');
    top.addColorStop(0.45, '#f4c850');
    top.addColorStop(1, '#dcaa44');
    ctx.fillStyle = top;
    ctx.fill('evenodd');
    rimArc(ctx, g, Math.PI * 1.0, Math.PI * 1.45, '#fbe39a', g.w * 0.32, 0.9);
    ctx.strokeStyle = ink;
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ell(ctx, x, y, rx, ry, Math.PI, TAU);
    ctx.lineTo(x + rx, y + h);
    ell(ctx, x, y + h, rx, ry, 0, Math.PI);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ell(ctx, x, y, rx, ry, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ell(ctx, x, y, irx, iry, 0, TAU);
    ctx.stroke();
    if (sparkle > 0) star(ctx, g, t, sparkle);
    ctx.restore();
  }

  function star(ctx, g, t, k) {
    const a = Math.PI * 1.25 + Math.sin(t * 0.7) * 0.5 + t * 0.15;
    const px = g.x + Math.cos(a) * (g.rx - g.w * 0.5);
    const py = g.y + Math.sin(a) * (g.ry - (g.w * 0.5 * g.ry) / g.rx);
    const s = g.rx * 0.12 * k;
    const n = s * 0.18;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(px, py, 0, px, py, s * 0.7);
    glow.addColorStop(0, 'rgba(255,240,190,' + 0.45 * k + ')');
    glow.addColorStop(1, 'rgba(255,217,118,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, s * 0.7, 0, TAU);
    ctx.fill();
    ctx.translate(px, py);
    ctx.rotate(Math.sin(t * 1.3) * 0.15);
    ctx.fillStyle = 'rgba(255,252,236,' + Math.min(0.7, 0.2 + 0.5 * k) + ')';
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(n, -n, s, 0);
    ctx.quadraticCurveTo(n, n, 0, s);
    ctx.quadraticCurveTo(-n, n, -s, 0);
    ctx.quadraticCurveTo(-n, -n, 0, -s);
    ctx.fill();
    ctx.restore();
  }

  function ladybug(ctx, o) {
    const s = Math.max(2, o.size || 30);
    const t = o.t || 0;
    const ink = '#141010';
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate((o.heading || 0) + Math.sin(t * 7) * 0.04);
    ctx.lineCap = 'round';
    ctx.fillStyle = 'rgba(10,30,5,0.25)';
    ctx.beginPath();
    ctx.ellipse(s * 0.02, s * 0.1, s * 0.46, s * 0.32, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = Math.max(1, s * 0.04);
    for (let i = 0; i < 2; i++) {
      const lx = s * (0.12 - i * 0.26);
      for (const side of [-1, 1]) {
        const w = Math.sin(t * 16 + i * 2.1 + (side > 0 ? Math.PI : 0)) * s * 0.05;
        const out = s * (i === 0 ? 0.1 : -0.1);
        ctx.beginPath();
        ctx.moveTo(lx, side * s * 0.24);
        ctx.lineTo(lx + out + w, side * s * 0.52);
        ctx.stroke();
      }
    }
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.ellipse(s * 0.36, 0, s * 0.13, s * 0.15, 0, 0, TAU);
    ctx.fill();
    const shell = ctx.createRadialGradient(-s * 0.05, -s * 0.1, s * 0.05, 0, 0, s * 0.45);
    shell.addColorStop(0, '#E2404A');
    shell.addColorStop(1, '#C92A33');
    ctx.fillStyle = shell;
    ctx.strokeStyle = ink;
    ctx.lineWidth = Math.max(0.8, s * 0.03);
    ctx.beginPath();
    ctx.ellipse(-s * 0.04, 0, s * 0.4, s * 0.34, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = ink;
    const spots = [[0.1, 0.14, 0.065], [-0.18, 0.15, 0.065]];
    for (const [sx, sy, r] of spots) {
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(s * sx, side * s * sy, s * r, 0, TAU);
        ctx.fill();
      }
    }
    ctx.lineWidth = Math.max(1, s * 0.035);
    ctx.beginPath();
    ctx.moveTo(s * 0.3, 0);
    ctx.lineTo(-s * 0.4, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-s * 0.4, 0, s * 0.045, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,250,240,0.9)';
    ctx.beginPath();
    ctx.ellipse(s * 0.1, -s * 0.2, s * 0.07, s * 0.045, -0.3, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function darkRing(ctx, o) {
    const g = geom(o, 0.2, 0.6);
    const t = o.t || 0;
    const a = clamp01(o.alpha == null ? 1 : o.alpha);
    if (a <= 0) return;
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
    ctx.save();
    ctx.globalAlpha *= a;
    const aura = ctx.createRadialGradient(g.x, g.y + g.h * 0.5, g.rx * 0.6, g.x, g.y + g.h * 0.5, g.rx * 1.3);
    aura.addColorStop(0, 'rgba(91,58,122,' + (0.08 + 0.07 * pulse) + ')');
    aura.addColorStop(1, 'rgba(91,58,122,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ell(ctx, g.x, g.y + g.h * 0.5, g.rx * 1.3, g.ry * 1.3 + g.h, 0, TAU);
    ctx.fill();
    band(ctx, g, {
      sideL: '#2a2036', sideM: '#1b1426', sideR: '#0d0a14',
      innerTop: '#07050b', innerBot: '#151020',
      topA: '#2c2238', topB: '#1b1426', topC: '#110c19',
    });
    ctx.save();
    ctx.shadowColor = 'rgba(140,90,190,' + (0.3 + 0.25 * pulse) + ')';
    ctx.shadowBlur = g.rx * (0.05 + 0.05 * pulse);
    ctx.strokeStyle = '#5b3a7a';
    ctx.globalAlpha *= 0.45 + 0.45 * pulse;
    ctx.lineWidth = Math.max(1, g.w * 0.16);
    ctx.beginPath();
    ell(ctx, g.x, g.y, g.rx, g.ry, Math.PI, TAU);
    ell(ctx, g.x, g.y + g.h, g.rx, g.ry, 0, Math.PI);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ell(ctx, g.x, g.y, g.irx, g.iry, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    ctx.restore();
    rimArc(ctx, g, Math.PI * 1.05, Math.PI * 1.5, '#5b3a7a', g.w * 0.3, 0.5 + 0.3 * pulse);
    ctx.restore();
  }

  const CAPTION_KEY_PHRASES = [
    'tokad', 'tokif', 'tokdz tokea tokeb', 'tokep tokeb tokac tokeq', 'tokhv', 'tokkf tokkj', 'tokkf', 'toklg tokap', 'tokli', 'tokln', 'tokfx toklw tokga', 'tokmm tokmn', 'tokcv tokcw',
  ];
  const CAPTION_STYLE = {
    size: 64,
    font: "700 {px}px Georgia, 'Times New Roman', serif",
    maxWords: 5,
    maxChars: 26,
    lead: 0.05,
    plateAlpha: 0.64,
    padX: 30,
    padY: 18,
    radius: 20,
    lift: 82,
  };
  const CAPTION_CREAM = '#FBF6EA';
  const CAPTION_GOLD = '#F1BF4A';

  const CAP_BREAK_BEFORE = new Set(('and but or so for to of in on at with from that when because if as into ' +
    'than then who which while after before until like inside about through toward down').split(' '));
  const CAP_GLUE_AFTER = new Set(('a an the his her my their our your its this that these those no to of in ' +
    'on at for with from and but or so he she they we i was is be been had has into than very just about ' +
    'through toward inside by like before after until over under onto named little he\'d she\'d i\'d it\'s ' +
    'couldn\'t wasn\'t didn\'t would could will have did all').split(' '));
  const CAP_GLUE_BEFORE = new Set('it him her them me us up off back out forever'.split(' '));
  const capNorm = (s) => String(s).toLowerCase().replace(/[^a-z0-9']+/g, '').replace(/^'+|'+$/g, '');
  const CAP_KEYS = CAPTION_KEY_PHRASES.map((p) => p.split(/\s+/).map(capNorm).filter(Boolean))
    .sort((a, b) => b.length - a.length);
  const capStrongEnd = (tok) => /(\.|\?|!|…)["'”’)]*$/.test(tok) || /["”]$/.test(tok);
  const capSoftEnd = (tok) => /[,;:]["'”’]*$/.test(tok);

  const capChunkCache = new Map();
  function captionChunks(c) {
    const text = String(c.text);
    const ck = text + '\u0001' + c.t0 + '\u0001' + c.t1;
    const hit = capChunkCache.get(ck);
    if (hit) return hit;
    let toks;
    if (Array.isArray(c.words) && c.words.length) {
      toks = c.words.map((w) => ({ s: String(w[1]), t: Number(w[0]) }));
    } else {
      const parts = text.split(/\s+/).filter(Boolean);
      const total = parts.reduce((n, p) => n + p.length + 1, 0) || 1;
      let acc = 0;
      toks = parts.map((p) => {
        const t = c.t0 + ((c.t1 - c.t0) * 0.9 * acc) / total;
        acc += p.length + 1;
        return { s: p, t };
      });
    }
    const norm = toks.map((k) => capNorm(k.s));
    const units = [];
    for (let i = 0; i < toks.length; ) {
      let len = 0;
      for (const kp of CAP_KEYS) {
        if (i + kp.length > toks.length) continue;
        let ok = true;
        for (let j = 0; j < kp.length && ok; j++) ok = norm[i + j] === kp[j];
        if (ok) { len = kp.length; break; }
      }
      const n = len || 1;
      const ws = toks.slice(i, i + n).map((k) => ({ s: k.s, t: k.t, key: len > 0 }));
      units.push({ ws, key: len > 0, chars: ws.reduce((m, w) => m + w.s.length, 0) + n - 1 });
      i += n;
    }
    const N = units.length;
    const best = new Array(N + 1).fill(Infinity);
    const from = new Array(N + 1).fill(0);
    best[0] = 0;
    for (let e = 1; e <= N; e++) {
      let words = 0, chars = -1;
      for (let s = e - 1; s >= 0; s--) {
        words += units[s].ws.length;
        chars += units[s].chars + 1;
        if (s < e - 1 && (words > CAPTION_STYLE.maxWords || chars > CAPTION_STYLE.maxChars + 4)) break;
        let cost = best[s] + 1 + Math.max(0, chars - CAPTION_STYLE.maxChars) * 0.5;
        const last = units[e - 1].ws[units[e - 1].ws.length - 1].s;
        if (e < N) {
          const next = units[e];
          if (capStrongEnd(last)) cost += 0;
          else if (capSoftEnd(last)) cost += 0.3;
          else if (units[e - 1].key || next.key || CAP_BREAK_BEFORE.has(capNorm(next.ws[0].s))) cost += 1.2;
          else cost += 2.6;
          if (!capStrongEnd(last) && !capSoftEnd(last)) {
            if (CAP_GLUE_AFTER.has(capNorm(last))) cost += 5;
            if (CAP_GLUE_BEFORE.has(capNorm(next.ws[0].s))) cost += 4;
          }
        }
        for (let u = s; u < e; u++) {
          for (let j = 0; j < units[u].ws.length; j++) {
            if (u === e - 1 && j === units[u].ws.length - 1) continue;
            const w = units[u].ws[j].s;
            if (units[u].key) continue;
            if (capStrongEnd(w)) cost += 2.2;
            else if (capSoftEnd(w)) cost += 1.4;
          }
        }
        if (e - s === 1 && units[s].ws.length === 1 && !units[s].key) cost += units[s].chars <= 5 ? 4 : 1.5;
        if (cost < best[e]) { best[e] = cost; from[e] = s; }
      }
    }
    const cuts = [];
    for (let e = N; e > 0; e = from[e]) cuts.push([from[e], e]);
    cuts.reverse();
    const chunks = cuts.map(([s, e]) => {
      const ws = [];
      for (let u = s; u < e; u++) ws.push(...units[u].ws);
      return { words: ws, text: ws.map((w) => w.s).join(' '), t: ws[0].t - CAPTION_STYLE.lead };
    });
    capChunkCache.set(ck, chunks);
    return chunks;
  }

  const capWidthCache = new Map();
  function capWidth(ctx, font, s) {
    const k = font + '\u0001' + s;
    let w = capWidthCache.get(k);
    if (w === undefined) {
      w = ctx.measureText(s).width;
      capWidthCache.set(k, w);
    }
    return w;
  }

  const capEaseOut = (u) => 1 - (1 - u) * (1 - u) * (1 - u);
  function capChunkPop(dt) {
    if (dt <= 0) return 0.92;
    const u = dt / 0.15;
    if (u >= 1) return 1;
    if (u < 0.55) return 0.92 + 0.12 * capEaseOut(u / 0.55);
    return 1.04 - 0.04 * capEaseOut((u - 0.55) / 0.45);
  }
  function capKeyPop(dt) {
    if (dt < 0 || dt >= 0.2) return 1;
    return 1.18 - 0.18 * capEaseOut(dt / 0.2);
  }

  function capPlate(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    ctx.fill();
  }

  function caption(ctx, info) {
    if (!info || !info.shot || !Array.isArray(info.shot.captions)) return;
    const T = Number(info.T) || 0;
    const W = info.W || 1080;
    const H = info.H || 1080;
    const pal = (FILM.lib && FILM.lib.pal) || {};
    const cream = pal.white || CAPTION_CREAM;
    const gold = pal.sun || CAPTION_GOLD;
    const k = W / 1080;
    const S = CAPTION_STYLE;
    const px = Math.round(S.size * k);
    const font = S.font.replace('{px}', px);
    const safeBottom = H >= W * 1.5 ? H - 380 : H - 80;
    const cy = safeBottom - S.lift * k;
    const base = cy + px * 0.33;
    for (const c of info.shot.captions) {
      if (!c || !(T >= c.t0 && T < c.t1) || !c.text) continue;
      const chunks = captionChunks(c);
      if (!chunks.length) continue;
      let ci = 0;
      while (ci + 1 < chunks.length && chunks[ci + 1].t <= T) ci++;
      const ch = chunks[ci];
      const start = ci === 0 ? Math.min(ch.t, c.t0) : ch.t;
      const a = clamp01(Math.min((T - start) / 0.06, (c.t1 - T) / 0.12));
      if (a <= 0) continue;
      ctx.save();
      ctx.font = font;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      const space = capWidth(ctx, font, ' ');
      const ws = ch.words.map((w) => capWidth(ctx, font, w.s));
      const kp = ch.words.map((w) => (w.key ? capKeyPop(T - w.t) : 1));
      let tw = space * (ws.length - 1);
      for (let i = 0; i < ws.length; i++) tw += ws[i] * kp[i];
      const sc = capChunkPop(T - start);
      ctx.globalAlpha = a;
      ctx.translate(W / 2, cy);
      ctx.scale(sc, sc);
      ctx.translate(-W / 2, -cy);
      const pw = tw + 2 * S.padX * k;
      const ph = px * 1.0 + 2 * S.padY * k;
      ctx.fillStyle = 'rgba(0,0,0,' + S.plateAlpha + ')';
      capPlate(ctx, W / 2 - pw / 2, cy - ph / 2, pw, ph, S.radius * k);
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 6 * k;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2 * k;
      let x = W / 2 - tw / 2;
      for (let i = 0; i < ch.words.length; i++) {
        const w = ch.words[i];
        const ks = kp[i];
        if (w.key) {
          ctx.fillStyle = gold;
          if (ks !== 1) {
            const mx = x + (ws[i] * ks) / 2;
            ctx.save();
            ctx.translate(mx, cy);
            ctx.scale(ks, ks);
            ctx.fillText(w.s, -ws[i] / 2, base - cy);
            ctx.restore();
          } else {
            ctx.fillText(w.s, x, base);
          }
        } else {
          ctx.fillStyle = cream;
          ctx.fillText(w.s, x, base);
        }
        x += ws[i] * ks + space;
      }
      ctx.restore();
    }
  }

  const SAM_STEP = 0.38;
  const JH = 330;
  const STEP = SAM_STEP * JH;
  const ANK = 14;
  const L1 = 57;
  const L2 = 55;
  const LMAX = (L1 + L2) * 0.997;
  const HIP_STAND = -124;
    const TORSO_DY = 6;
  const HEEL = [-15, ANK];
  const BALL = [24, ANK];
  const HIP_X = [-3, 4];
  const STAND_ANKLE = [[-10, -ANK], [16, -ANK]];

  const hexRgb = (c) => {
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const hmix = (a, b, k) => {
    const A = hexRgb(a), B = hexRgb(b);
    const v = A.map((x, i) => Math.round(x + (B[i] - x) * k));
    return '#' + v.map((x) => x.toString(16).padStart(2, '0')).join('');
  };
  const SUN = '#ffd49a';
  const INK = '#1F1712';
  const tone = (base, shade, rimK) => ({ base, shade, rim: hmix(base, SUN, rimK == null ? 0.42 : rimK) });
  const farTone = (c) => ({ base: hmix(c.base, c.shade, 0.4), shade: hmix(c.shade, INK, 0.12), rim: hmix(c.base, SUN, 0.18) });
  const JC = {
    skin: tone('#F6CDA6', '#DFA27F', 0.35),
    hair: tone('#5A3B22', '#3F2716', 0.3),
    jacket: tone('#2E4170', '#1D2A4C', 0.38),
    cuff: tone('#34497A', '#1D2A4C', 0.38),
    stripe: tone('#F3EEE3', '#C3BEC0', 0.2),
    tee: tone('#FBF7EF', '#D8D0C3', 0.2),
    jeans: tone('#8EB2D8', '#6C8FBE', 0.4),
    shoe: tone('#F7F3EA', '#CDC6BA', 0.2),
    sole: tone('#E4D8C2', '#BFB29C', 0.2),
    pack: tone('#C9382C', '#952420', 0.4),
    strap: tone('#B8322A', '#86201B', 0.35),
    tab: tone('#C9382C', '#952420', 0.3),
    eye: '#21170F',
    blush: '#EF8A6E',
    shadow: 'rgba(70,40,18,',
  };
  const JF = { jacket: farTone(JC.jacket), cuff: farTone(JC.cuff), skin: farTone(JC.skin), jeans: farTone(JC.jeans), shoe: farTone(JC.shoe), sole: farTone(JC.sole), tab: farTone(JC.tab) };

  const lerp = (a, b, k) => a + (b - a) * k;
  const sstep = (a, b, v) => {
    const k = clamp01((v - a) / (b - a));
    return k * k * (3 - 2 * k);
  };
  const rot = (p, a) => {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
  };
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const mixP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const inFrame = (o, a, p) => add(o, rot(p, a));

  const TH = 68;
  const curlOf = (rT) => 0.62 * sstep(0.05, 0.45, rT);
  function bendAng(rT, c, s) {
    return rT * (1 - c + 2 * c * Math.max(0, Math.min(1, s)));
  }
  function bendPt(pelvis, rT, c, q) {
    const y = -q[1];
    const s = Math.max(0, Math.min(1, y / TH));
    const th0 = rT * (1 - c), k = 2 * rT * c;
    const ths = th0 + k * s;
    let cx, cy;
    if (Math.abs(k) < 1e-5) {
      cx = TH * s * Math.sin(th0);
      cy = -TH * s * Math.cos(th0);
    } else {
      cx = (TH * (Math.cos(th0) - Math.cos(ths))) / k;
      cy = (-TH * (Math.sin(ths) - Math.sin(th0))) / k;
    }
    const ex = y - TH * s;
    const sn = Math.sin(ths), cs = Math.cos(ths);
    return [pelvis[0] + cx + ex * sn + q[0] * cs, pelvis[1] + cy - ex * cs + q[0] * sn];
  }

  function ik(root, target, a, b, bend) {
    const d0 = dist(root, target);
    const d = Math.max(1e-3, Math.min(d0, (a + b) * 0.999, Math.max(d0, Math.abs(a - b) + 1e-3)));
    const base = Math.atan2(target[1] - root[1], target[0] - root[0]);
    const k = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
    const m1 = add(root, [Math.cos(base - k) * a, Math.sin(base - k) * a]);
    const m2 = add(root, [Math.cos(base + k) * a, Math.sin(base + k) * a]);
    let mid;
    if (bend === 'low') mid = m1[1] > m2[1] ? m1 : m2;
    else if (bend === 'high') mid = m1[1] < m2[1] ? m1 : m2;
    else mid = (m1[0] - m2[0]) * bend > 0 ? m1 : m2;
    const end = add(root, [((target[0] - root[0]) / (d0 || 1)) * d, ((target[1] - root[1]) / (d0 || 1)) * d]);
    return { mid, end };
  }

  function shoeAnkle(heelX, phi) {
    const pl = phi < 0 ? HEEL : BALL;
    const pivot = [heelX + (pl[0] - HEEL[0]), 0];
    return add(pivot, rot([-pl[0], -pl[1]], phi));
  }

  const HIP_KEYS = [[0, -113.5], [0.1, -108.5], [0.25, -125], [0.375, -126], [0.5, -113.5]];
  function hipY(p) {
    const q = (((p % 0.5) + 0.5) % 0.5);
    for (let i = 0; i < HIP_KEYS.length - 1; i++) {
      const a = HIP_KEYS[i], b = HIP_KEYS[i + 1];
      if (q <= b[0]) return lerp(a[1], b[1], (1 - Math.cos((Math.PI * (q - a[0])) / (b[0] - a[0]))) / 2);
    }
    return HIP_KEYS[0][1];
  }

  function stance(u, hip) {
    const heelX = hip[0] + HEEL[0] + 0.5 * STEP - 2 * STEP * u;
    let phi = 0;
    if (u < 0.13) phi = -0.3 * Math.pow(1 - u / 0.13, 2);
    else if (u > 0.3) phi = 0.25 * Math.pow((u - 0.3) / 0.2, 1.6);
    let ankle = shoeAnkle(heelX, phi);
    if (dist(hip, ankle) > LMAX) {
      const dir = ankle[0] > hip[0] ? -1 : 1;
      let lo = phi * dir > 0 ? Math.abs(phi) : 0;
      let hi = 1.3;
      for (let i = 0; i < 22; i++) {
        const mid = (lo + hi) / 2;
        if (dist(hip, shoeAnkle(heelX, mid * dir)) > LMAX) lo = mid;
        else hi = mid;
      }
      phi = hi * dir;
      ankle = shoeAnkle(heelX, phi);
    }
    return { ankle, phi, heelX, planted: true };
  }

  function swing(u, hipAtU) {
    const w = (u - 0.5) / 0.5;
    const e = stance(0.5, [hipAtU.x, hipY(hipAtU.p0)]);
    const s = stance(0, [hipAtU.x, hipY(hipAtU.p1)]);
    const w2 = w * w, w3 = w2 * w;
    const h00 = 2 * w3 - 3 * w2 + 1, h10 = w3 - 2 * w2 + w, h01 = -2 * w3 + 3 * w2, h11 = w3 - w2;
    const x = h00 * e.ankle[0] + h10 * (-0.4 * STEP) + h01 * s.ankle[0] + h11 * -STEP;
    const lift = 20 * Math.pow(Math.sin(Math.PI * Math.pow(w, 0.95)), 1.6);
    let y = lerp(e.ankle[1], s.ankle[1], w) - lift;
    let phi;
    if (w < 0.2) phi = lerp(e.phi, Math.max(e.phi, 0.62), sstep(0, 0.2, w));
    else if (w < 0.62) phi = lerp(Math.max(e.phi, 0.62), 0.08, sstep(0.2, 0.62, w));
    else phi = lerp(0.08, s.phi, sstep(0.62, 1, w));
    const low = Math.max(rot(HEEL, phi)[1], rot(BALL, phi)[1], rot([36, 9], phi)[1]);
    if (y + low > 0) y = -low;
    return { ankle: [x, y], phi, planted: false };
  }

  function legWalk(u, p, side) {
    const hipX = HIP_X[side];
    if (u < 0.5) return stance(u, [hipX, hipY(p)]);
    return swing(u, { x: hipX, p0: p - (u - 0.5), p1: p + (1 - u) });
  }

  function shieldCurve(s) {
    s = clamp01(s);
    const ant = s < 0.2 ? Math.sin((Math.PI * s) / 0.2) : 0;
    let g;
    if (s < 0.2) g = -0.12 * ant;
    else {
      const q = (s - 0.2) / 0.8;
      const B = 1.9;
      g = q >= 1 ? 1 : 1 + (B + 1) * Math.pow(q - 1, 3) + B * Math.pow(q - 1, 2);
    }
    return { g, ant, tuck: sstep(0.18, 0.7, s) };
  }

  function blinkAt(t) {
    const tt = t + 0.37;
    const slot = Math.floor(tt / 3);
    let c = 0;
    for (let k = slot - 1; k <= slot; k++) {
      const h = (Math.imul(k | 0, 0x2c1b3c6d) ^ 0x5f356495) >>> 0;
      const r = (((h ^ (h >>> 15)) * 2654435761) >>> 0) / 4294967296;
      const b0 = k * 3 + 0.5 + r;
      const x = (tt - b0) / 0.16;
      if (x >= 0 && x < 1) c = Math.max(c, x < 0.4 ? x / 0.4 : 1 - (x - 0.4) / 0.6);
    }
    return Math.min(1, c * 1.25);
  }

  const SAM_RUN_STEP = 0.5;
  const RSTEP = SAM_RUN_STEP * JH;
  const RSE = 0.33;
  function runHipY(p, crouch) {
    return lerp(-115, -107, crouch) + lerp(8, 5, crouch) * Math.cos(4 * Math.PI * (p - RSE / 2));
  }
  function runStance(u, hip) {
    const ax = hip[0] + 2 * RSTEP * (RSE / 2 - u);
    const heelX = ax + HEEL[0];
    let phi = 0.04 + 0.5 * Math.pow(clamp01(u / RSE), 2);
    let ankle = shoeAnkle(heelX, phi);
    if (dist(hip, ankle) > LMAX) {
      const dir = ankle[0] > hip[0] ? -1 : 1;
      let lo = phi * dir > 0 ? Math.abs(phi) : 0;
      let hi = 1.4;
      for (let i = 0; i < 22; i++) {
        const mid = (lo + hi) / 2;
        if (dist(hip, shoeAnkle(heelX, mid * dir)) > LMAX) lo = mid;
        else hi = mid;
      }
      phi = hi * dir;
      ankle = shoeAnkle(heelX, phi);
    }
    return { ankle, phi, planted: true };
  }
  function runSwing(u, hipX, p, crouch) {
    const w = (u - RSE) / (1 - RSE);
    const e = runStance(RSE, [hipX, runHipY(p - (u - RSE), crouch)]);
    const s = runStance(0, [hipX, runHipY(p + (1 - u), crouch)]);
    const w2 = w * w, w3 = w2 * w;
    const h00 = 2 * w3 - 3 * w2 + 1, h10 = w3 - 2 * w2 + w, h01 = -2 * w3 + 3 * w2, h11 = w3 - w2;
    const g = 2 * RSTEP * (1 - RSE);
    const x = h00 * e.ankle[0] + h10 * (lerp(-0.1, 0.85, crouch) * g) + h01 * s.ankle[0] + h11 * -g;
    const lift = lerp(24, 34, crouch) * Math.pow(Math.sin(Math.PI * Math.pow(w, 0.65)), 1.1);
    let y = lerp(e.ankle[1], s.ankle[1], w) - lift;
    let phi;
    if (w < 0.3) phi = lerp(e.phi, 1.25, sstep(0, 0.3, w));
    else if (w < 0.75) phi = lerp(1.25, 0.1, sstep(0.3, 0.75, w));
    else phi = lerp(0.1, s.phi, sstep(0.75, 1, w));
    const low = Math.max(rot(HEEL, phi)[1], rot(BALL, phi)[1], rot([36, 9], phi)[1]);
    if (y + low > 0) y = -low;
    return { ankle: [x, y], phi, planted: false };
  }

  const TEEN_HEAD = 0.42 * JH;
  const TEEN_BODY = JH - TEEN_HEAD;
  const AGES = [
    [10, 0.84, 0.46, 1.1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [14, 1, 0.42, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [16, 1.06, 0.395, 0.98, 0.4, 0, 0.7, 0.1, 0.3, 0.06, 0.15, 0.25, 0.1, 0],
    [17, 1.1, 0.38, 0.98, 0.65, 0, 0.58, 0.2, 0.55, 0.12, 0.3, 0.45, 0.25, 0],
    [18, 1.12, 0.345, 1, 0.85, 0, 0.6, 0.34, 0.8, 0.2, 0.5, 0.7, 0.45, 1],
    [19, 1.12, 0.34, 1, 0.9, 0, 0.6, 0.36, 0.85, 0.21, 0.55, 0.75, 0.55, 1],
    [21, 1.12, 0.33, 1.03, 1, 0, 0.6, 0.55, 1.1, 0.26, 0.7, 0.9, 1, 1],
  ];
  function buildFor(age) {
    const a = age == null ? 14 : Math.max(10, Math.min(21, Number(age) || 14));
    let i = 0;
    while (i < AGES.length - 2 && a > AGES[i + 1][0]) i++;
    const A = AGES[i], Bk = AGES[i + 1];
    const k = clamp01((a - A[0]) / (Bk[0] - A[0]));
    const v = (j) => (k >= 1 ? Bk[j] : k <= 0 ? A[j] : lerp(A[j], Bk[j], k));
    const tot = v(1) * JH, ratio = v(2);
    const headPx = tot * ratio;
    const BSy = (tot - headPx) / TEEN_BODY;
    const neck = 10 * clamp01((a - 15) / 3) + 4 * clamp01((a - 17) / 2);
    return {
      age: a, tot: v(1), HS: headPx / TEEN_HEAD, BSy, BSx: BSy * v(3), jaw: v(4), round: v(5), hairLen: v(6), neck, teen: a === 14,
      shK: v(7), chin: v(8), eyeK: v(9), browK: v(10), nose: v(11), calm: v(12), cut: a >= 18 ? 1 : a >= 17 ? 0.5 : 0,
    };
  }

  function rig(o, B) {
    B = B || buildFor(14);
    const t = o.t || 0;
    const wa = clamp01(o.walkAmt == null ? (o.walk ? 1 : 0) : o.walkAmt);
    const p = (((o.walk || 0) % 1) + 1) % 1;
    const sh = shieldCurve(o.shield || 0);
    const lean = Math.max(-1, Math.min(1, o.lean || 0));
    const look = Math.max(-1, Math.min(1, o.look || 0));
    const breath = Math.sin((TAU * t) / 3.6 + 0.7);

    const hy = lerp(HIP_STAND, hipY(p), wa) + 2 * sh.tuck;
    const legs = [0, 1].map((side) => {
      const u = (p + side * 0.5) % 1;
      const wk = legWalk(u, p, side);
      const ankle = mixP(STAND_ANKLE[side], wk.ankle, wa);
      const phi = lerp(0, wk.phi, wa);
      const hip = [HIP_X[side], hy];
      const { mid: knee, end } = ik(hip, ankle, L1, L2, 1);
      return { hip, knee, ankle: end, phi, u, planted: wk.planted && wa >= 0.999 };
    });

    const bodyY = (q) => lerp(HIP_STAND, hipY(q), wa);
    const lagHair = bodyY(p - 0.07) - bodyY(p);
    const lagPack = bodyY(p - 0.06) - bodyY(p);

    const rT = 0.06 * wa + 0.16 * lean - 0.05 * sh.ant + 0.02 * sh.tuck;
    const pelvis = [0, hy + TORSO_DY];
    const curl = curlOf(rT);
    const T = (q) => bendPt(pelvis, rT, curl, [q[0], q[1] - 0.7 * breath * 0.6]);
    const sw = (x) => (B.shK ? x * (1 + B.shK) : x);
    const shoulderN = T([sw(-20 + 2 * Math.cos(TAU * p) * wa), -56 - 1.5 * sh.ant]);
    const shoulderF = T([sw(FAR_SH - 2 * Math.cos(TAU * p) * wa), -56]);
    const neck = T([3, -63 - 0.6 * breath]);

    const rH = rT + 0.05 + 0.1 * wa + 0.08 * sh.tuck - 0.1 * sh.ant - 0.24 * Math.max(0, look);
    const headOff = [-4 * sh.tuck - 3 * sh.ant, 4 * sh.tuck];
    let headO = add(neck, headOff);
    if (B.neck) headO = add(headO, rot([0, -B.neck], bendAng(rT, curl, 1)));

    const swingA = 0.55 * wa;
    const ph = TAU * (p - 0.04);
    const arm = (side) => {
      const sgn = side === 0 ? -1 : 1;
      const a = sgn * swingA * Math.cos(ph) - 0.04 + (side ? FAR_REST * (1 - wa) : 0);
      const fwd = clamp01((a / (swingA || 1) + 1) / 2);
      const bend = 0.1 + 0.34 * fwd * wa + 0.34 * (1 - wa);
      return { a, bend };
    };
    const n0 = arm(0), f0 = arm(1);
    let nearArm = armPose(shoulderN, n0.a - 0.35 * Math.max(0, -sh.g) / 0.12 * 0.5, n0.bend + 0.3 * Math.max(0, -sh.g) / 0.12, UA, FA);
    let farArm = armPose(shoulderF, f0.a, f0.bend, UA, FA);
    const gk = Math.max(0, sh.g);
    if (gk > 0) {
      const k1 = Math.min(1, gk);
      const shN = add(shoulderN, [3 * k1, -10 * k1]);
      const restA = Math.atan2(nearArm.elbow[1] - shoulderN[1], nearArm.elbow[0] - shoulderN[0]);
      const upA = -2.12 - 0.1 * (gk - 1);
      const ea = lerp(restA, upA < restA - Math.PI ? upA + TAU : upA, sstep(0, 1, Math.min(1, gk * 1.25)));
      const elbow = add(shN, [Math.cos(ea) * UA, Math.sin(ea) * UA]);
      const tgt = headPt(B, headO, rH, [6 - 13, -66 - 21 - 10 * (gk - 1)]);
      const wrist = mixP(nearArm.wrist, tgt, sstep(0, 1, k1));
      const hA = Math.atan2(wrist[1] - elbow[1], wrist[0] - elbow[0]);
      nearArm = { shoulder: shN, elbow, wrist, handA: lerp(hA, rH - 0.16 - 0.3 * (gk - 1), sstep(0.2, 1, k1)) };
      const fp = armPose(shoulderF, -0.14, 0.6, UA, FA);
      const kf = Math.min(1, gk) * 0.8;
      farArm = { shoulder: shoulderF, elbow: mixP(farArm.elbow, fp.elbow, kf), wrist: mixP(farArm.wrist, fp.wrist, kf), handA: lerp(farArm.handA, fp.handA, kf) };
    }

    const squint = clamp01(o.squint || 0);
    const blink = blinkAt(t + (o.blinkOffset || 0));
    const flick = Math.sin(Math.PI * sstep(0.25, 1, o.shield || 0)) * 5;
    const R = {
      t, wa, p, sh, lean, look, breath, legs, pelvis, rT, curl, rH, neck, headO,
      nearArm, farArm, lagHair, lagPack, squint, blink, flick,
      openHand: clamp01((gk - 0.25) / 0.5), openFar: 0, thumbUp: 0,
      rB: 0, orig: [0, 0], farFront: false, farMid: false, backpackOff: false, shake: 0,
    };
    const name = o.pose && POSES[o.pose] ? o.pose : null;
    if (!name) return withGrip(o, R, 1);
    const k = SELF_BLEND[name] ? 1 : clamp01(o.poseAmt == null ? 1 : o.poseAmt);
    const J = POSES[name](o, R, B);
    return withGrip(o, blendRig(R, J, k, B), GRIP_POSES[name] ? 1 : 0);
  }

  const GRIP_POSES = { sit: true, chinUp: true };
  function withGrip(o, R, ok) {
    if (!o.grip || !ok || (o.pose === 'sit' && o.desk)) return R;
    const g = o.grip;
    const near = armTo(R.nearArm.shoulder, [g[0] - 10, g[1] + 11], 'low', -0.08);
    const far = armTo(R.farArm.shoulder, [g[0] - 9, g[1] - 11], 'low', -0.12);
    return Object.assign({}, R, { nearArm: near, farArm: far, openHand: 0, openFar: 0, thumbUp: 0, farMid: true, gripAt: [g[0], g[1]] });
  }

  const UA = 42, FA = 37;
  const FAR_SH = 26;
  const FAR_REST = 0.12;
  function armPose(shoulder, a, bend, la, lb) {
    const elbow = add(shoulder, [Math.sin(a) * la, Math.cos(a) * la]);
    const wrist = add(elbow, [Math.sin(a + bend) * lb, Math.cos(a + bend) * lb]);
    return { shoulder, elbow, wrist, handA: Math.atan2(wrist[1] - elbow[1], wrist[0] - elbow[0]) + 0.12 };
  }
  function armTo(shoulder, wrist, bend, handA) {
    const { mid, end } = ik(shoulder, wrist, UA, FA, bend);
    return { shoulder, elbow: mid, wrist: end, handA: handA == null ? Math.atan2(end[1] - mid[1], end[0] - mid[0]) + 0.12 : handA };
  }
  function headPt(B, headO, rH, q) {
    const r = rot([q[0] * B.HS, q[1] * B.HS], rH);
    return [headO[0] + r[0] / B.BSx, headO[1] + r[1] / B.BSy];
  }
  function bodyPt(R, B, q) {
    return add(R.orig, rot([q[0] * B.BSx, q[1] * B.BSy], R.rB));
  }

  function blendRig(A, J, k, B) {
    if (k >= 1) return J;
    const P = (a, b) => mixP(a, b, k);
    const arm = (a, b) => ({ shoulder: P(a.shoulder, b.shoulder), elbow: P(a.elbow, b.elbow), wrist: P(a.wrist, b.wrist), handA: lerp(a.handA, b.handA, k) });
    const out = Object.assign({}, J, {
      legs: A.legs.map((l, i) => ({ hip: P(l.hip, J.legs[i].hip), knee: P(l.knee, J.legs[i].knee), ankle: P(l.ankle, J.legs[i].ankle), phi: lerp(l.phi, J.legs[i].phi, k), planted: false, u: l.u })),
      pelvis: P(A.pelvis, J.pelvis), neck: P(A.neck, J.neck), headO: P(A.headO, J.headO),
      rT: lerp(A.rT, J.rT, k), curl: lerp(A.curl || 0, J.curl || 0, k), rH: lerp(A.rH, J.rH, k), rB: lerp(A.rB, J.rB, k), orig: P(A.orig, J.orig),
      nearArm: arm(A.nearArm, J.nearArm), farArm: arm(A.farArm, J.farArm),
      openHand: lerp(A.openHand, J.openHand, k), openFar: lerp(A.openFar, J.openFar, k), thumbUp: lerp(A.thumbUp, J.thumbUp, k),
      shake: J.shake * k, lagHair: lerp(A.lagHair, J.lagHair, k), lagPack: lerp(A.lagPack, J.lagPack, k),
      farFront: k > 0.5 ? J.farFront : A.farFront, farMid: k > 0.5 ? J.farMid : A.farMid, legFront: k > 0.5 ? J.legFront : A.legFront, backpackOff: k > 0.5 ? J.backpackOff : A.backpackOff,
      poseExpr: k > 0.5 ? J.poseExpr : null, exprK: k,
    });
    return out;
  }

  function legsAt(R, hipY, ankles, phis, bends) {
    return [0, 1].map((side) => {
      const hip = [HIP_X[side], hipY];
      const { mid, end } = ik(hip, ankles[side], L1, L2, bends ? bends[side] : 1);
      return { hip, knee: mid, ankle: end, phi: phis ? phis[side] : 0, planted: false, u: R.legs[side].u };
    });
  }
  function upper(R, B, pelvis, rT, rHrel, opts) {
    opts = opts || {};
    const curl = opts.curl == null ? curlOf(rT) : opts.curl;
    const T = (q) => bendPt(pelvis, rT, curl, [q[0], q[1] - 0.7 * R.breath * 0.6]);
    const sy = opts.shoulderY || 0;
    const sw = 1 + (B.shK || 0);
    const shoulderN = T([(-20 + (opts.shN || 0)) * sw, -56 + sy + (opts.shakeN || 0)]);
    const shoulderF = T([(FAR_SH + (opts.shF || 0)) * sw, -56 + sy + (opts.shakeF || 0)]);
    const neck = T([3, -63 - 0.6 * R.breath + sy * 0.5]);
    const rH = rT + rHrel;
    let headO = add(neck, opts.headOff || [0, 0]);
    if (B.neck) headO = add(headO, rot([0, -B.neck], bendAng(rT, curl, 1)));
    return { pelvis, rT, curl, shoulderN, shoulderF, neck, rH, headO, T };
  }
  function poseSet(R, legs, U, arms, extra) {
    return Object.assign({}, R, {
      legs, pelvis: U.pelvis, rT: U.rT, curl: U.curl, rH: U.rH, neck: U.neck, headO: U.headO,
      nearArm: arms[0], farArm: arms[1], openHand: 0, openFar: 0, thumbUp: 0,
      rB: 0, orig: [0, 0], farFront: false, farMid: false, legFront: false, backpackOff: false, shake: 0, poseExpr: null,
      lagHair: 0, lagPack: 0,
    }, extra || {});
  }

  function jogArm(sh, c0, rT, far, T) {
    const c = Math.sign(c0) * Math.pow(Math.abs(c0), 0.55);
    if (far && c < 0) {
      const w0 = armPose(sh, 0.4 * rT, 2.2, UA, FA).wrist;
      const w = mixP(w0, T([4, -22]), sstep(0, 0.6, -c));
      const A = ik(sh, w, UA, FA, 1), Bm = ik(sh, w, UA, FA, -1);
      const d = sub(w, sh), perp = [-d[1], d[0]];
      const side = (m) => (m.mid[0] - sh[0]) * perp[0] + (m.mid[1] - sh[1]) * perp[1];
      const m = side(A) >= side(Bm) ? A : Bm;
      return { shoulder: sh, elbow: m.mid, wrist: m.end, handA: Math.atan2(m.end[1] - m.mid[1], m.end[0] - m.mid[0]) + 0.12 };
    }
    const a = 0.4 * rT + (c > 0 ? 0.95 * c : -1.0 * sstep(0, 0.55, -c));
    const b = c > 0 ? lerp(2.4, 0.5, sstep(0, 1, c)) : lerp(2.4, 0.5, sstep(0.35, 0.85, -c));
    return armPose(sh, a, b, UA, FA);
  }

  function poseRun(o, R, B, crouch, opt) {
    const t = o.t || 0;
    const p = (((o.walk || 0) % 1) + 1) % 1;
    const hy = runHipY(p, crouch);
    const legs = [0, 1].map((side) => {
      const u = (p + side * 0.5) % 1;
      const hipX = HIP_X[side];
      const wk = u < RSE ? runStance(u, [hipX, hy]) : runSwing(u, hipX, p, crouch);
      const hip = [hipX, hy];
      const { mid, end } = ik(hip, wk.ankle, L1, L2, 1);
      return { hip, knee: mid, ankle: end, phi: wk.phi, planted: wk.planted, u };
    });
    const rT = (opt ? opt.rT : 0.3 + 0.18 * crouch) + 0.1 * (o.lean || 0);
    const U = upper(R, B, [0, hy + TORSO_DY], rT, opt ? opt.rHrel : lerp(-0.14, -0.36, crouch), { curl: 0.16 });
    const ph = TAU * (p - 0.03);
    const mk = (sh, sgn) => {
      const c = sgn * Math.cos(ph);
      const sprint = (() => {
        const a = 0.55 * rT + (c > 0 ? 0.42 : 0.9) * c;
        const top = sgn < 0 ? 1.15 : 1.45;
        return [a, c > 0 ? lerp(0.6, top, sstep(0, 1, c)) : lerp(0.6, 0.5, -c)];
      })();
      const sp = armPose(sh, sprint[0], sprint[1], UA, FA);
      if (crouch >= 1) return sp;
      const jg = jogArm(sh, c, rT, sgn > 0, U.T);
      return crouch <= 0 ? jg : mixArm(jg, sp, crouch);
    };
    const lagY = runHipY(p - 0.07, crouch) - hy;
    return poseSet(R, legs, U, [mk(U.shoulderN, -1), mk(U.shoulderF, 1)], { lagHair: lagY * 1.4, lagPack: lagY * 1.2, runPhase: p, t });
  }

  const SEAT = 0.22;
  function poseSit(o, R, B, mode) {
    const t = o.t || 0;
    const seatY = -(o.seat == null ? SEAT : o.seat) * JH / B.BSy;
    const hy = seatY - 10;
    const legs = legsAt(R, hy, [[54, -ANK], [62, -ANK]], [0, 0]);
    const desk = mode === 'desk';
    const rT = desk ? 0.26 : mode === 'pray' ? 0.1 : -0.02 + 0.16 * (o.lean || 0);
    const rHrel = desk ? 0.3 : mode === 'pray' ? 0.2 : 0.04;
    const U = upper(R, B, [0, hy + TORSO_DY], rT, rHrel);
    let arms, extra = {};
    if (desk) {
      const deskY = -(o.desk == null || o.desk === true ? 0.32 : o.desk) * JH / B.BSy;
      const w = [64 + 5 * Math.sin(t * 7.3) + 3 * Math.sin(t * 2.1), deskY - 7 + 2 * Math.sin(t * 9.1 + 1)];
      arms = [armTo(U.shoulderN, w, -1, -0.25), armTo(U.shoulderF, [84, deskY - 6], -1, 0.05)];
      extra = { openHand: 0.1, backpackOff: true, deskY };
    } else if (mode === 'pray') {
      const c = U.T([44, -33]);
      arms = [armTo(U.shoulderN, add(c, [-3, 2]), 'low', -1.42), armTo(U.shoulderF, add(c, [2, -1]), 'low', -1.5)];
      extra = { farFront: true, backpackOff: true, poseExpr: 'closed', openHand: 0.5, openFar: 0.5 };
    } else {
      arms = [armTo(U.shoulderN, [38, hy - 8], -1, 0.3), armTo(U.shoulderF, [60, hy - 14], -1, 0.25)];
      extra = { backpackOff: true, farMid: true };
    }
    return poseSet(R, legs, U, arms, extra);
  }

  function poseKneel(o, R, B) {
    const hy = -11 - L1 + 2;
    const legs = [
      (() => { const hip = [HIP_X[0], hy]; const knee = [-10, -11]; const ankle = [-10 - L2 + 1, -12]; return { hip, knee, ankle, phi: 1.25, planted: false, u: 0 }; })(),
      (() => { const hip = [HIP_X[1], hy]; const { mid, end } = ik(hip, [44, -ANK], L1, L2, 1); return { hip, knee: mid, ankle: end, phi: 0, planted: false, u: 0 }; })(),
    ];
    const rT = 0.04 + 0.12 * (o.lean || 0);
    const U = upper(R, B, [0, hy + TORSO_DY], rT, -0.1 - 0.15 * Math.max(0, o.look || 0));
    const c = U.T([58, -36]);
    const arms = [armTo(U.shoulderN, add(c, [-6, 3]), -1, -0.05), armTo(U.shoulderF, add(c, [5, 1]), -1, -0.05)];
    return poseSet(R, legs, U, arms, { openHand: 0.7, openFar: 0.7, backpackOff: true, farFront: true, boxAt: add(c, [0, -2]) });
  }

  function poseLie(o, R, B) {
    const hy = HIP_STAND;
    const legs = legsAt(R, hy, [[HIP_X[0] + 3, -ANK], [HIP_X[1] + 1, -ANK]], [0, 0]);
    const look = o.look || 0;
    const U = upper(R, B, [0, hy + TORSO_DY], 0, -0.05 + 0.5 * look);
    const arms = [armPose(U.shoulderN, 0.1, 0.15, UA, FA), armPose(U.shoulderF, 0.12, 0.2, UA, FA)];
    const rB = -Math.PI / 2;
    const pv = [0 * B.BSx, (hy + TORSO_DY) * B.BSy];
    const target = [0, -30 * B.BSx];
    const orig = sub(target, rot(pv, rB));
    return poseSet(R, legs, U, arms, { rB, orig, backpackOff: true, lieLook: look });
  }

  function poseSitUp(o, R, B) {
    const hy = -14;
    const legs = legsAt(R, hy, [[HIP_X[0] + 104, -14], [HIP_X[1] + 106, -16]], [-1.35, -1.35], [-1, -1]);
    const rT = 0.04 + 0.15 * (o.lean || 0);
    const U = upper(R, B, [0, hy + TORSO_DY], rT, 0.02);
    const arms = [armTo(U.shoulderN, [14, -12], -1, 0.6), armTo(U.shoulderF, [50, -28], -1, 0.3)];
    return poseSet(R, legs, U, arms, { backpackOff: true, farMid: true });
  }

  function poseDive(o, R, B) {
    const hy = HIP_STAND;
    const legs = legsAt(R, hy, [[HIP_X[0] - 16, -ANK + 4], [HIP_X[1] - 34, -ANK - 22]], [0.9, 1.1]);
    const U = upper(R, B, [0, hy + TORSO_DY], 0, -0.95);
    const arms = [armTo(U.shoulderN, add(U.shoulderN, [56, -46]), 1, -0.75), armTo(U.shoulderF, add(U.shoulderF, [50, -52]), 1, -0.85)];
    const rB = 1.22;
    const pv = [0, (hy + TORSO_DY) * B.BSy];
    const target = [-20, -62 * B.BSy];
    return poseSet(R, legs, U, arms, { rB, orig: sub(target, rot(pv, rB)), openHand: 0.8, openFar: 0.8, backpackOff: false });
  }

  function poseFall(o, R, B) {
    const q = clamp01(o.poseAmt == null ? 1 : o.poseAmt);
    const buck = Math.sin(Math.PI * sstep(0.05, 0.8, q));
    const hy = HIP_STAND + 28 * buck;
    const legs = legsAt(R, hy, [[HIP_X[0] + 20 - 10 * buck, -ANK], [HIP_X[1] - 26, -ANK - 8 * q]], [0.2 * q, 0.6 * q]);
    const U = upper(R, B, [0, hy + TORSO_DY], 0.1 * q, -0.15 - 0.75 * sstep(0.4, 1, q));
    const up = sstep(0, 0.35, q) * (1 - sstep(0.55, 0.95, q));
    const arms = [
      armPose(U.shoulderN, lerp(-0.6, 2.66, sstep(0.45, 1, q)) - 0.9 * up, lerp(0.4, 0.08, q), UA, FA),
      armPose(U.shoulderF, lerp(-0.3, 2.56, sstep(0.5, 1, q)) - 0.7 * up, lerp(0.5, 0.12, q), UA, FA),
    ];
    const rB = 1.32 * Math.pow(sstep(0.2, 1, q), 1.3);
    const pv = [40 * B.BSx, 0];
    const target = [40 * B.BSx, 26 * B.BSy * sstep(0.5, 1, q)];
    return poseSet(R, legs, U, arms, { rB, orig: sub(target, rot(pv, rB)), openHand: up * 0.8 + 0.6 * sstep(0.7, 1, q), openFar: up * 0.8 + 0.6 * sstep(0.7, 1, q), fallQ: q, nearUnder: q > 0.7 });
  }

  function poseWeep(o, R, B) {
    const t = o.t || 0;
    const env = 0.55 + 0.45 * Math.sin(t * 1.7) * Math.sin(t * 0.63 + 1);
    const sob = Math.pow(Math.abs(Math.sin(t * 6.5)), 3) * env;
    const hy = -16;
    const legs = legsAt(R, hy, [[HIP_X[0] + 46, -ANK], [HIP_X[1] + 58, -ANK]], [0, 0], ['high', 'high']);
    const rT = 0.42 + 0.03 * sob;
    const U = upper(R, B, [0, hy + TORSO_DY], rT, 0.34 + 0.04 * sob, { curl: 0.66, shoulderY: -3 * sob, shakeN: -1.5 * sob, shakeF: -1 * sob });
    const fN = headPt(B, U.headO, U.rH, [6 + 22, -66 + 25]);
    const fF = headPt(B, U.headO, U.rH, [6 + 30, -66 + 4]);
    const arms = [armTo(U.shoulderN, fN, 'low', U.rH - 1.1), armTo(U.shoulderF, fF, 'low', U.rH - 1.75)];
    return poseSet(R, legs, U, arms, { farFront: true, legFront: true, backpackOff: true, poseExpr: 'cry', openHand: 0.6, openFar: 0.6, shake: sob });
  }

  function poseStandArms(o, R, B, which) {
    const t = o.t || 0;
    const legs = legsAt(R, HIP_STAND, STAND_ANKLE, [0, 0]);
    let rT = 0.16 * (o.lean || 0), rHrel = 0.05, opts = {}, arms, extra = {};
    if (which === 'laugh') {
      const b = Math.abs(Math.sin(t * 7.5));
      rT = -0.07 + 0.03 * b;
      rHrel = -0.2 - 0.04 * b;
      opts = { shoulderY: -2 * b };
      extra = { poseExpr: 'laughOpen', shake: 0.3 * b };
    } else if (which === 'chinUp') {
      rT = -0.05;
      rHrel = -0.2;
      opts = { shoulderY: 1, shN: -2, shF: 1 };
      extra = { determined: 1 };
    } else if (which === 'hug') {
      rT = 0.1;
      rHrel = 0.08;
      extra = { poseExpr: 'happy' };
    }
    const U = upper(R, B, [0, HIP_STAND + TORSO_DY], rT, rHrel, opts);
    if (which === 'handshake') {
      arms = [armTo(U.shoulderN, U.T([66, -6]), -1, -0.1), armPose(U.shoulderF, 0.02 + FAR_REST, 0.18, UA, FA)];
      extra = { openHand: 0.75, thumbUp: 1 };
    } else if (which === 'hug') {
      arms = [armTo(U.shoulderN, U.T([60, -38]), -1, -0.35), armTo(U.shoulderF, U.T([46, -66]), -1, -0.2)];
      extra.openHand = 0.6;
      extra.openFar = 0.6;
    } else if (which === 'laugh') {
      arms = [armTo(U.shoulderN, U.T([30, -14]), -1, 0.1), armTo(U.shoulderF, U.T([36, -16]), -1, 0.1)];
    } else {
      arms = [armPose(U.shoulderN, -0.1, 0.38, UA, FA), armPose(U.shoulderF, -0.06 + FAR_REST, 0.4, UA, FA)];
    }
    return poseSet(R, legs, U, arms, extra);
  }

  const mixArm = (a, b, k) => ({ shoulder: mixP(a.shoulder, b.shoulder, k), elbow: mixP(a.elbow, b.elbow, k), wrist: mixP(a.wrist, b.wrist, k), handA: lerp(a.handA, b.handA, k) });

  function poseLieStare(o, R, B) {
    const kn = clamp01(o.knee == null ? 1 : o.knee);
    const hy = HIP_STAND;
    const legs = legsAt(R, hy, [[HIP_X[0] + 3, -ANK], mixP([HIP_X[1] + 1, -ANK], [-16, -62], kn)], [0, 1.45 * kn]);
    const look = o.look || 0;
    const U = upper(R, B, [0, hy + TORSO_DY], 0, -0.08 + 0.5 * look);
    const arms = [armTo(U.shoulderN, U.T([36, -8]), -1, -1.5), armTo(U.shoulderF, U.T([38, -16]), -1, -1.6)];
    const rB = -Math.PI / 2;
    const pv = [0, (hy + TORSO_DY) * B.BSy];
    const orig = sub([0, -30 * B.BSx], rot(pv, rB));
    return poseSet(R, legs, U, arms, { rB, orig, backpackOff: true, poseExpr: 'stare', openHand: 0.5, openFar: 0.5 });
  }

  function poseTouchHead(o, R, B) {
    const legs = legsAt(R, HIP_STAND, STAND_ANKLE, [0, 0]);
    const look = o.look || 0;
    const U = upper(R, B, [0, HIP_STAND + TORSO_DY], -0.05 + 0.16 * (o.lean || 0), 0.04 - 0.2 * look);
    const shN = add(U.shoulderN, [2, -9]);
    const w = headPt(B, U.headO, U.rH, [6 - 30, -66 - 54]);
    const near = armTo(shN, w, 1, U.rH - 0.1);
    const far = armPose(U.shoulderF, 0.24, 0.6, UA, FA);
    return poseSet(R, legs, U, [near, far], { openHand: 0.9, openFar: 0.3, poseExpr: 'wide' });
  }

  function poseCallOut(o, R, B) {
    const J = poseRun(o, R, B, 0, { rT: 0.16, rHrel: -0.28 });
    const cup = clamp01(o.cup == null ? 1 : o.cup);
    const w = headPt(B, J.headO, J.rH, [6 + 2, -66 + 60 + 7 * (B.chin || 0)]);
    const at = armTo(J.nearArm.shoulder, w, 1, J.rH - 1.6);
    return Object.assign(J, { nearArm: mixArm(J.nearArm, at, sstep(0, 1, cup)), openHand: 0.4 * cup, poseExpr: 'shout' });
  }

  const LINER_SIZE = 112;
  function linerGrips(lift) {
    const rimY = -8, up = lift * 22, tilt = -lift * 0.62;
    const H = [-62, rimY - up];
    return [add(H, rot([94, 16], tilt)), add(H, rot([130, -6], tilt))];
  }
  function poseLiftLiner(o, R, B) {
    const lift = clamp01(o.lift == null ? 1 : o.lift);
    let legs, hy;
    if (o.bed) {
      hy = -14;
      legs = legsAt(R, hy, [[HIP_X[0] + 104, -14], [HIP_X[1] + 106, -16]], [-1.35, -1.35], [-1, -1]);
    } else {
      hy = -(o.seat == null ? SEAT : o.seat) * JH / B.BSy - 10;
      legs = legsAt(R, hy, [[54, -ANK], [62, -ANK]], [0, 0]);
    }
    const U = upper(R, B, [0, hy + TORSO_DY], 0.08, 0.22 - 0.04 * lift);
    const sz = LINER_SIZE * B.HS;
    const sp = sz / 170;
    const rim = [58, hy + 10];
    const L = (u) => [rim[0] + (u[0] * sp) / B.BSx, rim[1] + (u[1] * sp) / B.BSy];
    const g = linerGrips(lift);
    const arms = [armTo(U.shoulderN, add(L(g[0]), [-8, -4]), 'low', 0.75), armTo(U.shoulderF, add(L(g[1]), [-10, -8]), 'low', 0.5)];
    return poseSet(R, legs, U, arms, { backpackOff: true, farFront: true, openHand: 0.2, openFar: 0.2, helmetAt: rim, helmetSize: sz, helmetLift: lift });
  }

  const POSES = {
    run: (o, R, B) => poseRun(o, R, B, 0),
    sprintCrouch: (o, R, B) => poseRun(o, R, B, 1),
    sit: (o, R, B) => poseSit(o, R, B, o.desk ? 'desk' : 'chair'),
    pray: (o, R, B) => poseSit(o, R, B, 'pray'),
    kneelOffer: poseKneel,
    lie: poseLie,
    sitUp: poseSitUp,
    diveReach: poseDive,
    fall: poseFall,
    weepSit: poseWeep,
    handshake: (o, R, B) => poseStandArms(o, R, B, 'handshake'),
    hug: (o, R, B) => poseStandArms(o, R, B, 'hug'),
    laugh: (o, R, B) => poseStandArms(o, R, B, 'laugh'),
    chinUp: (o, R, B) => poseStandArms(o, R, B, 'chinUp'),
    lieStare: poseLieStare,
    touchHead: poseTouchHead,
    callOut: poseCallOut,
    liftLiner: poseLiftLiner,
  };
  const SELF_BLEND = { fall: true };

  function spline(ctx, pts, closed, k) {
    const n = pts.length;
    const tk = (k == null ? 1 : k) / 6;
    const P = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
    ctx.moveTo(pts[0][0], pts[0][1]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      const c1 = p1[2] ? p1 : [p1[0] + (p2[0] - p0[0]) * tk, p1[1] + (p2[1] - p0[1]) * tk];
      const c2 = p2[2] ? p2 : [p2[0] - (p3[0] - p1[0]) * tk, p2[1] - (p3[1] - p1[1]) * tk];
      ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p2[0], p2[1]);
    }
    if (closed) ctx.closePath();
  }
  function oriented(pts) {
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      a += p[0] * q[1] - q[0] * p[1];
    }
    return a < 0 ? pts.slice().reverse() : pts;
  }
  const blob = (pts, k) => (ctx) => spline(ctx, oriented(pts), true, k);
  const xf = (pts, o, a) => pts.map((p) => { const q = inFrame(o, a, p); return p[2] ? [q[0], q[1], 1] : q; });

  function capsule(ax, ay, ra, bx, by, rb) {
    return (ctx) => {
      const d = Math.max(1e-3, Math.hypot(bx - ax, by - ay));
      const th = Math.atan2(by - ay, bx - ax);
      const ps = Math.asin(Math.max(-0.99, Math.min(0.99, (ra - rb) / d)));
      const n1 = th - Math.PI / 2 + ps, n2 = th + Math.PI / 2 - ps;
      ctx.moveTo(ax + Math.cos(n2) * ra, ay + Math.sin(n2) * ra);
      ctx.arc(ax, ay, ra, n2, n1 + TAU);
      ctx.arc(bx, by, rb, n1, n2);
      ctx.closePath();
    };
  }
  const oval = (x, y, rx, ry, a) => (ctx) => {
    ctx.moveTo(x + Math.cos(a || 0) * rx, y + Math.sin(a || 0) * rx);
    ctx.ellipse(x, y, Math.max(0.3, rx), Math.max(0.3, ry), a || 0, 0, TAU);
  };

  function ribbon(pts, widths, tipCorner) {
    const L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let nx = -(b[1] - a[1]), ny = b[0] - a[0];
      const m = Math.hypot(nx, ny) || 1;
      nx /= m; ny /= m;
      const w = widths[i] / 2;
      L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
      R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
    }
    const tip = pts[pts.length - 1];
    const out = L.slice(0, -1);
    out.push(tipCorner ? [tip[0], tip[1], 1] : tip);
    for (let i = R.length - 2; i >= 0; i--) out.push(R[i]);
    return out;
  }

  const build = (ctx, parts) => {
    ctx.beginPath();
    for (const f of parts) f(ctx);
  };
  const BIG = (ctx) => ctx.fillRect(-3000, -3000, 6000, 6000);

  function shade(ctx, K, clips, shape, c, d, r) {
    ctx.save();
    for (const cl of clips) {
      build(ctx, cl);
      ctx.clip();
    }
    ctx.fillStyle = c.shade;
    BIG(ctx);
    ctx.translate(K.lx * d, K.ly * d);
    build(ctx, shape);
    ctx.fillStyle = c.base;
    ctx.fill();
    if (r > 0) {
      ctx.clip();
      ctx.fillStyle = c.rim;
      BIG(ctx);
      ctx.translate(-K.lx * (d + r), -K.ly * (d + r));
      build(ctx, shape);
      ctx.fillStyle = c.base;
      ctx.fill();
    }
    ctx.restore();
  }

  function cel(ctx, K, parts, c, d, r) {
    build(ctx, parts);
    ctx.fillStyle = INK;
    ctx.strokeStyle = INK;
    ctx.lineWidth = K.lw * 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.fill();
    build(ctx, parts);
    ctx.fillStyle = c.base;
    ctx.fill();
    shade(ctx, K, [parts], parts, c, d, r == null ? K.rim : r);
  }

  function line(ctx, K, pts, w, alpha, color) {
    ctx.save();
    ctx.globalAlpha *= alpha == null ? 1 : alpha;
    ctx.strokeStyle = color || INK;
    ctx.lineWidth = Math.max(K.minLine, K.lw * (w || 0.55));
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    spline(ctx, pts, false);
    ctx.stroke();
    ctx.restore();
  }

  function frame(ctx, K, o, a, fn) {
    ctx.save();
    ctx.translate(o[0], o[1]);
    ctx.rotate(a);
    const l = rot([K.lx0, K.ly0], -a - K.baseRot);
    const K2 = Object.assign({}, K, { lx: l[0], ly: l[1], baseRot: K.baseRot + a });
    fn(K2);
    ctx.restore();
  }

  function ih(a, b, c) {
    let h = Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul(b | 0, 0x165667b1) ^ Math.imul(c | 0, 0x9e3779b1);
    h ^= h >>> 15;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    return (h >>> 0) / 4294967296;
  }

  const OC = {
    tee: tone('#F4F1EA', '#CFC8BC', 0.2),
    carTee: tone('#E8D9B0', '#C2AF84', 0.3),
    apron: tone('#2F7581', '#1F525B', 0.35),
    apronWet: '#1C4C55',
    shirt: tone('#93B4D2', '#7092B4', 0.35),
    chinos: tone('#CBB68C', '#A6906A', 0.35),
    belt: tone('#6B4A2E', '#4A321E', 0.25),
    olive: tone('#6F6C3E', '#52502C', 0.32),
    wood: tone('#77804E', '#59613A', 0.3),
    desert: tone('#D6C49C', '#B7A47C', 0.3),
    bootBlack: tone('#2A2622', '#171411', 0.25),
    bootTan: tone('#C6A574', '#9E814F', 0.3),
    gown: tone('#CFE4E0', '#A9C8C4', 0.25),
    bandage: tone('#FAF7F0', '#D9D3C7', 0.2),
    tux: tone('#24252D', '#15161B', 0.32),
    satin: tone('#3A3C47', '#24252D', 0.3),
    shirtW: tone('#FBF8F1', '#D9D2C6', 0.2),
    trousers: tone('#22232A', '#15161B', 0.28),
    dress: tone('#1E1C1E', '#0F0E10', 0.3),
    swim: tone('#2E8E95', '#1F6A70', 0.35),
    helmet: tone('#D3BE93', '#AF9B70', 0.3),
    band: tone('#5E5B3A', '#44422A', 0.25),
    shell: tone('#5E6340', '#3F4329', 0.25),
    liner: tone('#A79A72', '#7F7350', 0.25),
    tape: tone('#B4B8BA', '#8D9194', 0.3),
    agreen: tone('#56603F', '#3D452C', 0.3),
    shirtK: tone('#D2CBA3', '#ABA47C', 0.22),
    tie: tone('#1C1C20', '#0E0E11', 0.3),
    brass: tone('#D9B45A', '#A9852F', 0.2),
  };
  const CAMO = {
    wood: ['#4D3A26', '#3C4A28', '#1F1E19'],
    desert: ['#B4936A', '#8A6B49', '#2B2520', '#F2EDE2'],
  };

  const OUTFITS = {
    school: { top: 'jacket', sleeve: 'jacket', legs: 'jeans', feet: 'sneaker', pack: true },
    carwash: { top: 'tee', topC: 'carTee', sleeve: 'rolled', legs: 'jeans', feet: 'sneaker', apron: true },
    casual: { top: 'shirt', topC: 'shirt', sleeve: 'shirtRolled', legs: 'chinos', feet: 'sneaker' },
    'fatigues-camp': { top: 'tee', topC: 'olive', sleeve: 'short', legs: 'bdu', legC: 'wood', camo: 'wood', feet: 'boot', footC: 'bootBlack', hair: 'buzz' },
    'fatigues-desert': { top: 'blouse', topC: 'desert', topCamo: 'desert', sleeve: 'long', legs: 'bdu', legC: 'desert', camo: 'desert', feet: 'boot', footC: 'bootTan', hair: 'buzz' },
    gown: { top: 'gown', topC: 'gown', sleeve: 'gown', legs: 'bare', bandage: true, feet: 'bare' },
    tux: { top: 'tux', topC: 'tux', sleeve: 'tux', legs: 'trousers', legC: 'trousers', feet: 'dress', footC: 'dress' },
    swim: { top: 'bare', sleeve: 'none', legs: 'shorts', legC: 'swim', feet: 'bare', hair: 'wet' },
    dress: { top: 'dress', topC: 'agreen', sleeve: 'long', legs: 'trousers', legC: 'agreen', feet: 'dress', footC: 'dress', hair: 'buzz', cap: 'garrison' },
  };

  const LOOKS = {
    sam: { skin: JC.skin, hair: JC.hair, blush: 0.42, eyeGap: 0, eyeS: 1, brow: 1, nose: 0, jaw: 0, ear: 1, moustache: false, freckles: false },
  };
  const skinT = (b, s) => tone(b, s, 0.35);
  const SOLDIER_LOOKS = [
    { skin: skinT('#F6D3B4', '#E0AD8B'), hair: tone('#C9A464', '#A07F45', 0.3), blush: 0.4, eyeGap: -2, eyeS: 0.92, brow: 0.8, nose: 1, jaw: 0.4, ear: 1.05, freckles: true },
    { skin: skinT('#EDC09B', '#D19B76'), hair: tone('#3B2A1C', '#271B11', 0.3), blush: 0.3, eyeGap: 2, eyeS: 1, brow: 1.3, nose: 0.5, jaw: 0.9, ear: 1 },
    { skin: skinT('#D9A57A', '#BB8458'), hair: tone('#1E1712', '#120D0A', 0.25), blush: 0.18, eyeGap: 0, eyeS: 0.95, brow: 1.2, nose: 1.2, jaw: 0.7, ear: 0.95, moustache: true },
    { skin: skinT('#B88053', '#976339'), hair: tone('#17110D', '#0D0907', 0.25), blush: 0.1, eyeGap: 3, eyeS: 1.05, brow: 1, nose: 0.8, jaw: 0.5, ear: 1.1 },
    { skin: skinT('#8E5C3A', '#714528'), hair: tone('#120D0A', '#080605', 0.2), blush: 0.06, eyeGap: -1, eyeS: 1.1, brow: 1.1, nose: 0.6, jaw: 1, ear: 1 },
    { skin: skinT('#6B4229', '#52301B'), hair: tone('#0E0A08', '#060504', 0.2), blush: 0.04, eyeGap: 1, eyeS: 1, brow: 1.25, nose: 1, jaw: 0.8, ear: 1.05 },
  ];

  const PAL_CACHE = {};
  function palFor(outfitName, look, lookKey) {
    const key = outfitName + '|' + lookKey;
    if (PAL_CACHE[key]) return PAL_CACHE[key];
    let C, CF;
    if (lookKey === 'sam') {
      C = JC;
      CF = JF;
    } else {
      C = Object.assign({}, JC, { skin: look.skin, hair: look.hair });
      CF = Object.assign({}, JF, { skin: farTone(look.skin) });
    }
    return (PAL_CACHE[key] = { C, CF, O: OUTFITS[outfitName] || OUTFITS.school });
  }
  const pick = (name) => OC[name];
  const farOf = (c) => farTone(c);

  const EXPR = {
    neutral: {},
    wide: { eyeS: 1.32, browLift: -6, worry: -0.12, hi2: 1, mouth: 'o', mouthK: 0.55 },
    closed: { closed: 1, browLift: 1, worry: -0.1 },
    squint: { squint: 1 },
    teary: { eyeS: 1.12, hi2: 1, tear: 1, worry: 0.22, browLift: -1, mouth: 'frown', mouthK: 0.45 },
    happy: { arc: 1, browLift: -2, worry: -0.2, mouth: 'smile', mouthK: 0.6 },
    smileSmall: { mouth: 'smile', mouthK: 0.45, worry: -0.12 },
    laughOpen: { arc: 1, browLift: -4, worry: -0.18, mouth: 'laugh', mouthK: 1 },
    cry: { closed: 0.85, tear: 1, stream: 1, worry: 0.42, browLift: -2, mouth: 'wobble', mouthK: 1 },
    disappointed: { lid: 0.55, worry: 0.3, browLift: 2, mouth: 'frown', mouthK: 0.6 },
    stare: { eyeS: 1.06, worry: 0.06, browLift: 1 },
    shout: { eyeS: 1.08, browLift: -5, worry: -0.2, mouth: 'o', mouthK: 1.35 },
  };
  function exprFor(name, k) {
    if (name && typeof name === 'object') {
      let tot = 0;
      for (const nm in name) if (EXPR[nm]) tot += Math.max(0, name[nm] || 0);
      if (tot <= 0) return exprFor('neutral', k);
      const parts = Object.keys(name).filter((nm) => EXPR[nm] && name[nm] > 0).sort();
      const one = parts.map((nm) => ({ w: name[nm] / tot, e: exprFor(nm, 1) }));
      const mix = (f) => one.reduce((a, q) => a + q.w * q.e[f], 0);
      let best = null;
      for (const q of one) if (q.e.mouth && (!best || q.w > best.w)) best = q;
      const out = { name: parts.reduce((a, nm) => (name[nm] > (name[a] || 0) ? nm : a), parts[0]), k };
      for (const f of ['eyeS', 'closed', 'squint', 'arc', 'lid', 'tear', 'stream', 'hi2', 'browLift', 'worry']) out[f] = f === 'eyeS' ? 1 + (mix('eyeS') - 1) * k : mix(f) * k;
      out.mouth = best ? best.e.mouth : null;
      out.mouthK = best ? best.e.mouthK * Math.max(0.75, best.w) * k : 0;
      return out;
    }
    const e = EXPR[name] || EXPR.neutral;
    const n = (f) => (e[f] || 0) * k;
    return {
      name: EXPR[name] ? name : 'neutral', k,
      eyeS: 1 + ((e.eyeS || 1) - 1) * k, closed: n('closed'), squint: n('squint'), arc: n('arc'), lid: n('lid'),
      tear: n('tear'), stream: n('stream'), hi2: n('hi2'), browLift: n('browLift'), worry: n('worry'),
      mouth: e.mouth || null, mouthK: n('mouthK'),
    };
  }

  const CAMO_CACHE = {};
  function camoBlobs(kind) {
    if (CAMO_CACHE[kind]) return CAMO_CACHE[kind];
    const out = [];
    const cols = CAMO[kind];
    const n = kind === 'desert' ? 34 : 40;
    for (let i = 0; i < n; i++) {
      const ci = kind === 'desert' ? (i % 2) : i % 3;
      const cx = -90 + ih(i, 1, 7) * 180, cy = -130 + ih(i, 2, 7) * 200;
      const r = (kind === 'desert' ? 11 : 9) + ih(i, 3, 7) * 9;
      const pts = [];
      for (let j = 0; j < 7; j++) {
        const a = (j / 7) * TAU + ih(i, j, 9) * 0.6;
        const rr = r * (0.55 + 0.6 * ih(i, j, 11));
        pts.push([cx + Math.cos(a) * rr * 1.25, cy + Math.sin(a) * rr * 0.8]);
      }
      out.push({ c: cols[ci], pts });
    }
    if (kind === 'desert') {
      for (let i = 0; i < 46; i++) {
        const cx = -90 + ih(i, 4, 13) * 180, cy = -130 + ih(i, 5, 13) * 200;
        const r = 1.6 + ih(i, 6, 13) * 2;
        out.push({ c: cols[2], dot: [cx, cy, r] });
        out.push({ c: cols[3], dot: [cx + r * 1.6, cy - r * 0.5, r * 0.75] });
      }
    }
    return (CAMO_CACHE[kind] = out);
  }
  function camoCel(ctx, K, parts, segs, kind, c, d, far) {
    const blobs = camoBlobs(kind);
    build(ctx, parts);
    ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineWidth = K.lw * 2; ctx.lineJoin = 'round';
    ctx.stroke(); ctx.fill();
    const pattern = () => {
      for (const sg of segs) {
        ctx.save();
        build(ctx, [sg.part]);
        ctx.clip();
        ctx.translate(sg.o[0], sg.o[1]);
        ctx.rotate(sg.a);
        const bb = sg.b;
        for (const bl of blobs) {
          if (bl.dot) {
            if (bl.dot[0] < bb[0] || bl.dot[0] > bb[2] || bl.dot[1] < bb[1] || bl.dot[1] > bb[3]) continue;
          } else {
            const q = bl.pts[0];
            if (q[0] < bb[0] - 20 || q[0] > bb[2] + 20 || q[1] < bb[1] - 20 || q[1] > bb[3] + 20) continue;
          }
          ctx.fillStyle = bl.c;
          ctx.beginPath();
          if (bl.dot) ctx.arc(bl.dot[0], bl.dot[1], bl.dot[2], 0, TAU);
          else spline(ctx, bl.pts, true, 0.9);
          ctx.fill();
        }
        ctx.restore();
      }
    };
    ctx.save();
    build(ctx, parts);
    ctx.clip();
    ctx.fillStyle = far ? hmix(c.base, c.shade, 0.4) : c.base;
    BIG(ctx);
    pattern();
    ctx.fillStyle = far ? 'rgba(30,22,14,0.42)' : 'rgba(30,22,14,0.34)';
    BIG(ctx);
    ctx.translate(K.lx * d, K.ly * d);
    build(ctx, parts);
    ctx.translate(-K.lx * d, -K.ly * d);
    ctx.clip();
    ctx.fillStyle = far ? hmix(c.base, c.shade, 0.4) : c.base;
    BIG(ctx);
    pattern();
    if (far) {
      ctx.fillStyle = 'rgba(30,22,14,0.12)';
      BIG(ctx);
    }
    ctx.restore();
  }
  const segOf = (part, a0, a1, r) => ({ part, o: a0, a: Math.atan2(a1[1] - a0[1], a1[0] - a0[0]), b: [-r, -r, dist(a0, a1) + r, r] });

  function sneaker(ctx, K, leg, far, P) {
    const c = far ? P.CF : P.C;
    frame(ctx, K, leg.ankle, leg.phi, (K) => {
      const upper = [[-11, -12], [-2, -15], [8, -12], [12, -6], [24, -3], [33, 0], [37, 5], [36, 10], [-14, 10], [-17, 2], [-15, -6]];
      const sole = [[-16, 7], [37, 7], [38, 11], [35, 14.5], [-13, 14.5], [-17, 11.5]];
      cel(ctx, K, [blob(sole, 0.8)], c.sole, 2.5, 0);
      cel(ctx, K, [blob(upper, 0.9)], c.shoe, 4.5);
      line(ctx, K, [[-15, 10.6], [8, 11.2], [36, 10.8]], 0.4, 0.55);
      line(ctx, K, [[27, -1.5], [24, 3], [25.5, 8.5]], 0.45, 0.8);
      for (let i = 0; i < 3; i++) {
        const lx = 9 + i * 5.2;
        line(ctx, K, [[lx - 1.5, -10.5 + i * 2.6], [lx + 2.5, -7.5 + i * 2.6]], 0.5, 0.9);
      }
      ctx.save();
      build(ctx, [blob(upper, 0.9)]);
      ctx.clip();
      ctx.fillStyle = c.tab.base;
      ctx.beginPath();
      ctx.moveTo(-20, -14); ctx.lineTo(-11, -14); ctx.lineTo(-12, 2); ctx.lineTo(-20, 2); ctx.closePath();
      ctx.fill();
      ctx.restore();
      line(ctx, K, [[-11.5, -13], [-12.5, 1.5]], 0.45, 0.8);
      ctx.fillStyle = c.tab.base;
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(K.minLine, K.lw * 0.42);
      ctx.beginPath();
      ctx.arc(-3, -4, 3.6, 0, TAU);
      ctx.fill();
      ctx.stroke();
    });
  }

  function footwear(ctx, K, leg, far, P) {
    const O = P.O;
    if (O.feet === 'sneaker') return sneaker(ctx, K, leg, far, P);
    frame(ctx, K, leg.ankle, leg.phi, (K) => {
      if (O.feet === 'boot') {
        const c = pick(O.footC);
        const cc = far ? farOf(c) : c;
        const shaft = [[-12, -30], [8, -30], [10, -10], [24, -4], [34, 0], [38, 6], [37, 11], [-15, 11], [-16, -4]];
        const sole = [[-17, 8], [39, 8], [40, 12], [37, 15], [-15, 15], [-18, 12]];
        cel(ctx, K, [blob(sole, 0.7)], { base: '#2B2420', shade: '#171310', rim: '#5C4D40' }, 2, 0);
        cel(ctx, K, [blob(shaft, 0.8)], cc, 4.5);
        for (let i = 0; i < 4; i++) line(ctx, K, [[-1 + i * 1.5, -26 + i * 5], [8 + i * 1.5, -24 + i * 5]], 0.42, 0.75);
        line(ctx, K, [[-15, 7.5], [38, 7.5]], 0.4, 0.6);
        line(ctx, K, [[24, -2], [22, 3], [24, 8]], 0.4, 0.6);
      } else if (O.feet === 'dress') {
        const c = far ? farOf(OC.dress) : OC.dress;
        const shoe = [[-12, -8], [6, -9], [20, -3], [33, 1], [38, 7], [36, 12], [-14, 12], [-16, 2]];
        cel(ctx, K, [blob(shoe, 0.85)], c, 4);
        line(ctx, K, [[-14, 9.5], [36, 9.5]], 0.38, 0.5, '#5A5458');
        ctx.fillStyle = 'rgba(255,240,220,0.55)';
        ctx.beginPath();
        ctx.ellipse(26, 1.5, 5, 1.6, 0.2, 0, TAU);
        ctx.fill();
      } else {
        const c = far ? P.CF.skin : P.C.skin;
        const foot = [[-11, -9], [4, -9], [16, -4], [28, 0], [36, 4], [37, 10], [30, 12.5], [-10, 12.5], [-14, 6], [-14, -3]];
        cel(ctx, K, [blob(foot, 0.95)], c, 3.5);
        for (let i = 0; i < 3; i++) line(ctx, K, [[28 + i * 2.6, 6 - i * 0.6], [31 + i * 2.4, 11]], 0.32, 0.45);
      }
    });
  }

  function jeansLeg(ctx, K, leg, far, P) {
    const c = far ? P.CF.jeans : P.C.jeans;
    const { hip, knee, ankle } = leg;
    const dir = sub(ankle, knee);
    const dl = Math.hypot(dir[0], dir[1]) || 1;
    const hem = sub(ankle, [(dir[0] / dl) * 9, (dir[1] / dl) * 9]);
    const parts = [capsule(hip[0], hip[1], 17, knee[0], knee[1], 12.5), capsule(knee[0], knee[1], 12.5, hem[0], hem[1], 12)];
    cel(ctx, K, parts, c, 6.5);
    const kd = rot([dir[0] / dl, dir[1] / dl], -Math.PI / 2);
    line(ctx, K, [add(knee, [-kd[0] * 6 - 4, -kd[1] * 6]), add(knee, [-kd[0] * 9 - 1, -kd[1] * 9 + 5])], 0.42, 0.55);
    const n = [-dir[1] / dl, dir[0] / dl];
    line(ctx, K, [add(hem, [n[0] * 10 + (dir[0] / dl) * -3, n[1] * 10 + (dir[1] / dl) * -3]), add(hem, [-n[0] * 10 + (dir[0] / dl) * -3, -n[1] * 10 + (dir[1] / dl) * -3])], 0.38, 0.45);
  }

  const segA = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
  function legwear(ctx, K, leg, far, P, near) {
    const O = P.O;
    if (O.legs === 'jeans') return jeansLeg(ctx, K, leg, far, P);
    const { hip, knee, ankle } = leg;
    const dir = sub(ankle, knee);
    const dl = Math.hypot(dir[0], dir[1]) || 1;
    const u = [dir[0] / dl, dir[1] / dl];
    const skin = far ? P.CF.skin : P.C.skin;
    if (O.legs === 'shorts' || O.legs === 'bare') {
      const ank = sub(ankle, [u[0] * 3, u[1] * 3]);
      const calf = mixP(knee, ank, 0.3);
      const parts = [capsule(hip[0], hip[1], 14.5, knee[0], knee[1], 9.6), capsule(knee[0], knee[1], 9.6, calf[0], calf[1], 10.6), capsule(calf[0], calf[1], 10.6, ank[0], ank[1], 7)];
      cel(ctx, K, parts, skin, 5.5);
      line(ctx, K, [add(knee, rot([2, -5], segA(hip, knee))), add(knee, rot([5, -2], segA(hip, knee)))], 0.35, 0.45);
      if (O.legs === 'shorts') {
        const c = far ? farOf(pick(O.legC)) : pick(O.legC);
        const end = mixP(hip, knee, 0.5);
        const mid = mixP(hip, end, 0.4);
        const ta = segA(hip, end), nx = -Math.sin(ta), ny = Math.cos(ta);
        const ux = Math.cos(ta), uy = Math.sin(ta);
        const hemP = [end[0] + ux * 2, end[1] + uy * 2];
        const sp = [capsule(hip[0], hip[1], 17, mid[0], mid[1], 16.2), polyPath(oriented([
          [mid[0] + nx * 16.2, mid[1] + ny * 16.2], [hemP[0] + nx * 15.5, hemP[1] + ny * 15.5],
          [hemP[0] - nx * 15.5, hemP[1] - ny * 15.5], [mid[0] - nx * 16.2, mid[1] - ny * 16.2]]))];
        cel(ctx, K, sp, c, 6);
        ctx.save();
        build(ctx, sp);
        ctx.clip();
        frame(ctx, K, hip, segA(hip, end), () => {
          ctx.fillStyle = far ? 'rgba(240,236,226,0.6)' : '#F2EEE4';
          ctx.fillRect(-20, -19, 60, 4.5);
        });
        ctx.restore();
      }
      if (O.bandage && near) {
        const a0 = mixP(hip, knee, 0.42), a1 = add(knee, [u[0] * 9, u[1] * 9]);
        const bp = [capsule(a0[0], a0[1], 14.5, a1[0], a1[1], 11.5)];
        cel(ctx, K, bp, OC.bandage, 3.5);
        const A = segA(a0, a1), L = dist(a0, a1);
        frame(ctx, K, a0, A, (K) => {
          for (let i = 0; i < 6; i++) {
            const x = 4 + (i * (L - 6)) / 5;
            line(ctx, K, [[x - 3, -12.5], [x + 1, 0], [x + 4, 12]], 0.3, 0.45, '#9C9488');
          }
        });
      }
      return;
    }
    const c0 = pick(O.legC || 'chinos');
    const c = far ? farOf(c0) : c0;
    const hemBack = O.legs === 'bdu' ? 20 : O.legs === 'trousers' ? 4 : 7;
    const hem = sub(ankle, [u[0] * hemBack, u[1] * hemBack]);
    const rk = O.legs === 'trousers' ? 11.5 : 12.5;
    const parts = [capsule(hip[0], hip[1], 17, knee[0], knee[1], rk), capsule(knee[0], knee[1], rk, hem[0], hem[1], O.legs === 'bdu' ? 13 : 11.5)];
    if (O.camo) {
      camoCel(ctx, K, parts, [segOf(parts[0], hip, knee, 18), segOf(parts[1], knee, hem, 14)], O.camo, c0, 6.5, far);
      const n = [-u[1], u[0]];
      line(ctx, K, [add(hem, [n[0] * 12, n[1] * 12]), add(hem, [u[0] * 3, u[1] * 3]), add(hem, [-n[0] * 12, -n[1] * 12])], 0.4, 0.6);
      const mid = mixP(hip, knee, 0.55);
      frame(ctx, K, mid, segA(hip, knee), (K) => line(ctx, K, [[-8, -12], [-8, 3], [9, 3], [9, -12]], 0.38, 0.55));
    } else {
      cel(ctx, K, parts, c, 6.5);
      if (O.legs === 'trousers' && O.legC === 'agreen') {
        line(ctx, K, [mixP(hip, knee, 0.3), knee, mixP(knee, hem, 0.9)], 0.34, far ? 0.25 : 0.45, OC.agreen.shade);
      } else if (O.legs === 'trousers') {
        line(ctx, K, [mixP(hip, knee, 0.15), knee, hem], 0.5, far ? 0.25 : 0.4, '#5A5D6A');
      }
      const kd = rot(u, -Math.PI / 2);
      line(ctx, K, [add(knee, [-kd[0] * 6 - 4, -kd[1] * 6]), add(knee, [-kd[0] * 9 - 1, -kd[1] * 9 + 5])], 0.42, 0.5);
    }
  }

  function hand(ctx, K, wrist, a, open, far, P, thumbUp) {
    const c = far ? P.CF.skin : P.C.skin;
    frame(ctx, K, wrist, a, (K0) => {
      const sc = 1 + 0.24 * open;
      ctx.scale(sc, thumbUp > 0.5 ? -sc : sc);
      const K = Object.assign({}, K0, { lw: K0.lw / sc, minLine: K0.minLine / sc, rim: K0.rim / sc });
      const relaxed = [[-1, -7], [7, -8.5], [14, -7], [18.5, -2.5], [18, 3.5], [13.5, 7.5], [8, 8], [9.5, 12.5], [6, 14.5], [2, 11], [-1, 7]];
      const opened = [[-1, -7], [11, -9], [26, -8.5], [34, -5], [34.5, 1.5], [26, 5], [12, 6.5], [15, 12.5], [11.5, 15.5], [3, 11], [-1, 7]];
      const pts = relaxed.map((p, i) => mixP(p, opened[i], open));
      cel(ctx, K, [blob(pts, 0.95)], c, 3.5);
      line(ctx, K, [mixP([8, 7.5], [10, 5.5], open), mixP([5.5, 9.5], [6.5, 9], open)], 0.4, 0.75);
      if (open > 0.3) {
        line(ctx, K, [[17, -4.5], [32, -3.5]], 0.34, 0.75 * open);
        line(ctx, K, [[16, -0.8], [32, -0.3]], 0.34, 0.75 * open);
        line(ctx, K, [[15, 2.8], [28, 3]], 0.34, 0.6 * open);
      }
    });
  }

  function sleeveArm(ctx, K, armP, far, openHand, P, thumbUp) {
    const c = far ? P.CF : P.C;
    const O = P.O;
    const { shoulder: s, elbow: e, wrist: w } = armP;
    const fd = sub(w, e);
    const fl = Math.hypot(fd[0], fd[1]) || 1;
    const u = [fd[0] / fl, fd[1] / fl];
    const cuffA = sub(w, [u[0] * 5, u[1] * 5]);
    const ud = sub(e, s);
    const ul0 = Math.hypot(ud[0], ud[1]) || 1;
    const up = [ud[0] / ul0, ud[1] / ul0];
    const cap = (r0, r1, back) => {
      const a0 = sub(s, [up[0] * back, up[1] * back]), a1 = add(s, [up[0] * ul0 * 0.34, up[1] * ul0 * 0.34]);
      return capsule(a0[0], a0[1], r0, a1[0], a1[1], r1);
    };
    hand(ctx, K, add(w, [u[0] * 1, u[1] * 1]), armP.handA, openHand, far, P, thumbUp || 0);
    if (O.sleeve === 'jacket') {
      cel(ctx, K, [cap(13.5, 12, 2.5), capsule(s[0], s[1], 12.5, e[0], e[1], 10), capsule(e[0], e[1], 10, cuffA[0], cuffA[1], 9.5)], c.jacket, 6);
      cel(ctx, K, [capsule(cuffA[0], cuffA[1], 9.8, w[0] - u[0] * 0.5, w[1] - u[1] * 0.5, 9.2)], c.cuff, 4);
      const n = [-u[1], u[0]];
      line(ctx, K, [add(e, [n[0] * 3 - u[0] * 2, n[1] * 3 - u[1] * 2]), add(e, [n[0] * 8 + u[0] * 3, n[1] * 8 + u[1] * 3])], 0.4, 0.5);
      return;
    }
    const top0 = pick(O.topC || 'tee');
    const top = far ? farOf(top0) : top0;
    const n = [-u[1], u[0]];
    if (O.sleeve === 'long' || O.sleeve === 'tux' || O.sleeve === 'shirtRolled') {
      const rolled = O.sleeve === 'shirtRolled';
      const endA = rolled ? mixP(e, w, 0.45) : O.sleeve === 'tux' ? sub(w, [u[0] * 9, u[1] * 9]) : cuffA;
      if (rolled) cel(ctx, K, [capsule(e[0], e[1], 8.5, w[0], w[1], 7.5)], c.skin, 3.5);
      const parts = [cap(13.5, 11.6, 2.5), capsule(s[0], s[1], 12.5, e[0], e[1], 9.6), capsule(e[0], e[1], 9.6, endA[0], endA[1], 8.9)];
      if (O.topCamo) {
        camoCel(ctx, K, parts, [segOf(parts[0], s, e, 13), segOf(parts[1], e, endA, 11)], O.topCamo, top0, 6, far);
      } else {
        cel(ctx, K, parts, top, 6);
      }
      if (rolled) {
        const r0 = sub(endA, [u[0] * 4, u[1] * 4]);
        cel(ctx, K, [capsule(r0[0], r0[1], 10.2, endA[0] + u[0] * 2, endA[1] + u[1] * 2, 9.8)], top, 3);
      }
      if (O.sleeve === 'tux') {
        const c0 = sub(w, [u[0] * 9, u[1] * 9]), c1 = sub(w, [u[0] * 3, u[1] * 3]);
        cel(ctx, K, [capsule(c0[0], c0[1], 7.8, c1[0], c1[1], 7.4)], far ? farOf(OC.shirtW) : OC.shirtW, 2.5, 0);
      }
      line(ctx, K, [add(e, [n[0] * 3 - u[0] * 2, n[1] * 3 - u[1] * 2]), add(e, [n[0] * 8 + u[0] * 3, n[1] * 8 + u[1] * 3])], 0.4, 0.5);
      return;
    }
    const fa = mixP(e, w, 0.32);
    const sb = add(s, [up[0] * 3, up[1] * 3]);
    const s0 = sub(s, [up[0] * 1, up[1] * 1]);
    const um = mixP(sb, e, 0.42);
    cel(ctx, K, [capsule(s0[0], s0[1], 8.2, um[0], um[1], 6.1), capsule(um[0], um[1], 6.1, e[0], e[1], 4.9), capsule(e[0], e[1], 4.9, fa[0], fa[1], 5.4), capsule(fa[0], fa[1], 5.4, w[0], w[1], 4.1)], c.skin, 4);
    line(ctx, K, [add(e, [n[0] * 1.5 - u[0] * 1, n[1] * 1.5 - u[1] * 1]), add(e, [n[0] * 4.5, n[1] * 4.5])], 0.3, 0.35);
    if (O.sleeve === 'none') return;
    const ua = sub(e, s);
    const ul = Math.hypot(ua[0], ua[1]) || 1;
    const frac = O.sleeve === 'rolled' ? 0.32 : O.sleeve === 'gown' ? 0.5 : 0.45;
    const end = add(s, [(ua[0] / ul) * ul * frac, (ua[1] / ul) * ul * frac]);
    const wide = O.sleeve === 'gown' ? 15 : 13.5;
    const parts = [cap(14.5, 13.5, 2.5), capsule(s[0], s[1], 13.5, end[0], end[1], wide)];
    cel(ctx, K, parts, top, 5);
    if (O.sleeve === 'rolled') {
      const r0 = add(end, [(-ua[0] / ul) * 4, (-ua[1] / ul) * 4]);
      cel(ctx, K, [capsule(r0[0], r0[1], 14, end[0] + (ua[0] / ul) * 2, end[1] + (ua[1] / ul) * 2, 14)], top, 3);
    }
  }

  const TORSO = [[10, -68], [22, -63], [29, -50], [31, -30], [33, -12], [34.5, 0], [32, 9], [0, 11], [-30, 9], [-33.5, -1], [-32, -16], [-30, -40], [-25, -57], [-13, -67]];
  const BARE = [[8, -70], [17, -68], [26, -63.5], [32, -55], [33, -45], [28.5, -32], [22, -19], [20, -8], [21.5, 2], [21, 8], [0, 10], [-20, 7.5], [-21, 1], [-19.5, -8], [-22, -19], [-28, -32], [-32.5, -45], [-32, -54], [-27, -61], [-19, -66.5], [-10, -69.5]];
  const TEE = [[10, -68], [21, -64], [27, -52], [28, -32], [29, -12], [30, 2], [28, 8], [0, 9], [-27, 7], [-29.5, -2], [-29, -18], [-27, -40], [-23, -58], [-12, -67]];
  const COAT = [[10, -68], [22, -64], [28, -52], [29, -32], [30, -12], [32, 8], [34, 22], [0, 25], [-31, 22], [-31.5, 4], [-29, -18], [-27, -40], [-23, -58], [-12, -67]];
  const GOWN = [[10, -68], [23, -64], [30, -50], [33, -26], [36, 0], [39, 26], [36, 33], [0, 36], [-33, 33], [-37, 24], [-34, -2], [-30, -36], [-25, -58], [-12, -67]];
  const TAPER = {
    bare: [0.02, 0.02, 1, 1, 0],
    body: [0.05, 0.08, 0.93, 1.04, 0.2],
    jacket: [0.03, 0.06, 0.97, 1.02, 0.12],
    coat: [0.03, 0.06, 0.95, 1.03, 0.16],
    gown: [0.015, 0.04, 1, 1, 0.14],
  };
  function torsoMap(R, wx, kind) {
    const c = R.curl == null ? curlOf(R.rT) : R.curl;
    const tp = TAPER[kind] || TAPER.body;
    const shape = (p) => {
      const y = p[1];
      const ya = (y + 46) / 14, yb = (y + 16) / 12;
      const v = lerp(tp[2], tp[3], sstep(-4, -50, y)) * (1 - tp[4] * sstep(-55, -70, y));
      let x = p[0] * v * (1 + tp[0] * Math.exp(-ya * ya) - tp[1] * Math.exp(-yb * yb));
      if (c > 0) {
        const u = Math.sin(Math.PI * clamp01((-y + 2) / 72));
        x += x < 0 ? -9 * c * u : -4 * c * u * clamp01(x / 20);
      }
      return [x * wx, y];
    };
    const M = (p) => {
      const q = bendPt(R.pelvis, R.rT, c, shape(p));
      return p[2] ? [q[0], q[1], 1] : q;
    };
    const A = (y) => bendAng(R.rT, c, -y / TH);
    const at = (ctx, K, y, fn) => frame(ctx, K, M([0, y]), A(y), (K2) => {
      ctx.scale(wx, 1);
      ctx.translate(0, -y);
      const r = Math.sqrt(wx);
      fn(wx === 1 ? K2 : Object.assign({}, K2, { lw: K2.lw / r, minLine: K2.minLine / r, rim: K2.rim / r }));
    });
    return { M, A, at, c, ms: (pts) => pts.map(M) };
  }
  const quadPts = (p0, cp, p1, n) => {
    const o = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), d = t * t;
      o.push([a * p0[0] + b * cp[0] + d * p1[0], a * p0[1] + b * cp[1] + d * p1[1]]);
    }
    return o;
  };
  const polyPath = (pts) => (ctx) => {
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
  };
  const STRIPE_PTS = quadPts([-40, -43], [4, -38], [40, -42], 8).concat(quadPts([40, -32], [4, -28], [-40, -33], 8));
  const HEMBAND_PTS = quadPts([-40, -2], [0, 3], [40, -1], 8).concat([[40, 30], [-40, 30]]);
  const outline = (src, R, B, T, fl) => {
    const by = 0.7 * R.breath * 0.6;
    if (fl != null) {
      const f = 1 + fl * ((B && B.shK) || 0);
      return T.ms(src.map((p) => [(p[0] + (p[0] > 0 && p[1] < -20 ? 0.4 * R.breath : 0)) * lerp(1, f, sstep(-12, -56, p[1])), p[1] - (p[1] < -40 ? by : 0)]));
    }
    const sk = R.legFront || R.pelvis[1] > -40 ? 0.35 : 1;
    return T.ms(widen(src.map((p) => [p[0] + (p[0] > 0 && p[1] < -20 ? 0.4 * R.breath : 0), p[1] > 0 ? p[1] * sk : p[1] - (p[1] < -40 ? by : 0)]), B));
  };

  function backpack(ctx, K, R) {
    const T = torsoMap(R, 1, 'jacket');
    frame(ctx, K, T.M([-30, -58 + R.lagPack * 1.3]), T.A(-58) + R.lagPack * 0.012, (K) => {
      const body = [[8, -6], [-6, -8], [-18, -2], [-24, 14], [-25, 40], [-21, 58], [-10, 64], [8, 62]];
      const pocket = [[-14, 30], [-24, 31], [-27, 46], [-24, 60], [-12, 62], [-8, 48]];
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = K.lw * 2 + 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-10, -6); ctx.quadraticCurveTo(-12, -17, -2, -14);
      ctx.stroke();
      ctx.strokeStyle = JC.pack.shade;
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.restore();
      cel(ctx, K, [blob(body, 0.9)], JC.pack, 7);
      cel(ctx, K, [blob(pocket, 0.9)], JC.pack, 4);
      line(ctx, K, [[-15, 37], [-25, 38]], 0.42, 0.75);
      line(ctx, K, [[-5, -4], [-17, 4], [-22, 22]], 0.38, 0.4);
    });
  }

  function widen(pts, B) {
    if (!B || !B.shK) return pts;
    return pts.map((q) => [q[0] * (1 + 0.38 * B.shK * sstep(-12, -56, q[1])), q[1]]);
  }
  function jacketTorso(ctx, K, R, P, pack, B, wx) {
    const T = torsoMap(R, wx, 'jacket');
    const L = (pts, w, a, col) => line(ctx, K, T.ms(pts), w, a, col);
    const body = [blob(outline(TORSO, R, B, T), 0.9)];
    cel(ctx, K, body, JC.jacket, 12);
    const stripe = [polyPath(T.ms(STRIPE_PTS))];
    ctx.save();
    build(ctx, body);
    ctx.clip();
    build(ctx, stripe);
    ctx.fillStyle = JC.stripe.base;
    ctx.fill();
    ctx.restore();
    shade(ctx, K, [body, stripe], body, JC.stripe, 12, K.rim);
    L([[-34, -43], [4, -38.5], [36, -42]], 0.42, 0.85);
    L([[-34, -33], [4, -28.5], [36, -32]], 0.42, 0.85);
    ctx.save();
    build(ctx, body);
    ctx.clip();
    ctx.fillStyle = 'rgba(10,14,30,0.18)';
    build(ctx, [polyPath(T.ms(HEMBAND_PTS))]);
    ctx.fill();
    ctx.restore();
    L([[-33, -1.5], [0, 2.6], [34, -1]], 0.45, 0.85);
    L([[14, -60], [15, -30], [16, 8]], 0.42, 0.7);
    L([[-24, -18], [-14, -12]], 0.38, 0.45);
    L([[20, 3], [21, 9]], 0.35, 0.5);
    L([[-10, 4], [-9, 9.5]], 0.35, 0.5);
    cel(ctx, K, [blob(T.ms([[2, -70], [24, -69], [15, -52]]), 0.5)], JC.tee, 3, 0);
    L([[5, -67], [13, -63.5], [22, -67]], 0.38, 0.6);
    cel(ctx, K, [blob(T.ms([[-12, -70], [4, -71], [14.5, -51, 1], [3, -58]]), 0.7)], JC.jacket, 3);
    cel(ctx, K, [blob(T.ms([[18, -70], [29, -66], [16, -52, 1]]), 0.7)], JC.jacket, 3);
    if (!pack) return;
    cel(ctx, K, [blob(T.ms(ribbon([[25, -61], [28, -50], [29, -40]], [7, 6.5, 6])), 0.9)], JC.strap, 2.5);
    cel(ctx, K, [blob(T.ms(ribbon([[-26, -60], [-17, -52], [-12, -34], [-14, -12]], [9, 8, 7.2, 6.8])), 0.9)], JC.strap, 3);
    cel(ctx, K, [blob(T.ms([[-17.5, -30], [-7.5, -29], [-7.5, -24], [-17.5, -25]]), 0.4)], { base: '#9C948A', shade: '#6E675F', rim: '#D8CCBA' }, 1.5, 0);
  }

  function torso(ctx, K, R, P, pack, B) {
    const O = P.O;
    if (O.top === 'jacket') return jacketTorso(ctx, K, R, P, pack, B, B && B.shK ? 1 + 0.42 * B.shK : 1);
    const src = O.top === 'gown' ? GOWN : O.top === 'dress' ? COAT : O.top === 'bare' ? BARE : TEE;
    const T = torsoMap(R, 1, O.top === 'gown' ? 'gown' : O.top === 'dress' ? 'coat' : O.top === 'bare' ? 'bare' : 'body');
    const L = (pts, w, a, col) => line(ctx, K, T.ms(pts), w, a, col);
    const Bl = (pts, k) => blob(T.ms(pts), k);
    const dot = (x, y, r) => { const q = T.M([x, y]); return oval(q[0], q[1], r, r, 0); };
    const body = [blob(outline(src, R, B, T, O.top === 'bare' ? 0.18 : 0.3), 0.9)];
    const skin = P.C.skin;
    if (O.top === 'bare') {
      cel(ctx, K, body, skin, 11);
      if (O.legs === 'shorts') {
        const c = pick(O.legC);
        const wb = [Bl([[-22.5, -5], [-6, -2], [16, -2], [23.5, -4], [24.5, 6], [23, 19], [0, 22], [-21.5, 19], [-23.5, 5]], 0.85)];
        ctx.save();
        build(ctx, body);
        ctx.clip();
        cel(ctx, K, wb, c, 6, 0);
        ctx.restore();
        L([[-22, -4], [0, -1], [23, -3]], 0.4, 0.8);
      }
      L([[-6, -60], [6, -58], [18, -61]], 0.32, 0.4);
      L([[2, -40], [12, -36], [24, -40]], 0.32, 0.35);
      L([[-20, -22], [-17, -16], [-19, -10]], 0.3, 0.25);
      L([[15, -10], [15.5, -7]], 0.4, 0.5);
      if (T.c > 0.2) {
        L([[12, -24], [20, -22], [26, -25]], 0.32, 0.5 * clamp01((T.c - 0.2) / 0.3));
        L([[10, -14], [18, -12], [24, -14]], 0.3, 0.4 * clamp01((T.c - 0.2) / 0.3));
      }
      return;
    }
    const top = pick(O.topC || 'tee');
    if (O.topCamo) {
      camoCel(ctx, K, body, [{ part: body[0], o: T.M([0, -30]), a: T.A(-30), b: [-60, -60, 60, 60] }], O.topCamo, top, 12, false);
    } else {
      cel(ctx, K, body, top, 12);
    }
    if (O.top === 'tee') {
      cel(ctx, K, [Bl([[0, -70], [12, -66], [24, -69], [22, -64], [12, -61], [2, -64]], 0.8)], skin, 2, 0);
      L([[1, -65], [12, -60.5], [23, -64]], 0.42, 0.75);
      L([[-26, -2], [0, 3], [28, 0]], 0.36, 0.45);
    } else if (O.top === 'blouse') {
      cel(ctx, K, [Bl([[-4, -71], [14, -70], [10, -58, 1]], 0.6)], top, 3, 0);
      cel(ctx, K, [Bl([[14, -70], [27, -67], [17, -56, 1]], 0.6)], top, 3, 0);
      L([[14, -58], [15, -30], [16, 6]], 0.42, 0.65);
      L([[-14, -50], [-14, -36], [2, -36], [2, -50]], 0.38, 0.55);
      L([[-16, -50], [4, -50]], 0.4, 0.65);
      L([[20, -50], [20, -38], [28, -38]], 0.38, 0.5);
      L([[-28, -6], [0, -3], [28, -5]], 0.36, 0.4);
    } else if (O.top === 'shirt') {
      cel(ctx, K, [Bl([[-4, -72], [13, -70], [8, -57, 1]], 0.6)], top, 3, 0);
      cel(ctx, K, [Bl([[13, -70], [27, -68], [16, -57, 1]], 0.6)], top, 3, 0);
      L([[13, -58], [14, -30], [15, 6]], 0.42, 0.6);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#EDEAE2';
        build(ctx, [dot(16 + i * 0.3, -50 + i * 15, 1.6)]);
        ctx.fill();
      }
      L([[-14, -48], [-14, -38], [0, -38], [0, -48]], 0.36, 0.5);
      cel(ctx, K, [Bl([[-30, -2], [30, -1], [30, 6], [-30, 5]], 0.3)], OC.belt, 2, 0);
      cel(ctx, K, [Bl([[12, -2], [21, -1.5], [21, 6], [12, 5.5]], 0.3)], { base: '#C9B27A', shade: '#9C8754', rim: '#F2E3B8' }, 1, 0);
    } else if (O.top === 'gown') {
      ctx.save();
      build(ctx, body);
      ctx.clip();
      ctx.fillStyle = 'rgba(70,120,130,0.35)';
      for (let i = 0; i < 70; i++) {
        build(ctx, [dot(-36 + ih(i, 1, 3) * 76, -70 + ih(i, 2, 3) * 106, 1.1)]);
        ctx.fill();
      }
      ctx.restore();
      L([[2, -69], [13, -64], [24, -68]], 0.42, 0.7);
      L([[-29, -56], [-38, -50], [-34, -44]], 0.4, 0.6);
      L([[-29, -56], [-36, -58]], 0.4, 0.6);
    } else if (O.top === 'dress') {
      cel(ctx, K, [Bl([[2, -71], [25, -70], [16, -38, 1]], 0.4)], OC.shirtK, 2.5, 0);
      cel(ctx, K, [Bl([[11.5, -66], [17.5, -66], [19, -46], [15, -40, 1], [11, -46]], 0.5)], OC.tie, 1.5, 0);
      cel(ctx, K, [Bl([[10.5, -70], [18.5, -70], [17, -64], [12, -64]], 0.5)], OC.tie, 1, 0);
      const lap = top.shade;
      cel(ctx, K, [Bl([[-8, -71], [3, -71], [16, -38, 1], [7, -48], [-1, -58, 1], [-6, -60]], 0.6)], top, 3);
      cel(ctx, K, [Bl([[25, -70], [31, -64], [27, -60, 1], [29, -56], [16, -38, 1]], 0.6)], top, 2.5);
      L([[-1, -58], [3, -62]], 0.36, 0.6, lap);
      for (let i = 0; i < 4; i++) cel(ctx, K, [dot(17.5, -32 + i * 14, 2.3)], OC.brass, 1, 0);
      L([[16, -38], [17.5, 22]], 0.34, 0.5, lap);
      L([[-18, -46], [-2, -45]], 0.4, 0.6);
      L([[-26, 2], [-6, 3]], 0.4, 0.6);
      L([[23, 3], [30, 2.5]], 0.36, 0.45);
      ctx.fillStyle = '#121214';
      build(ctx, [polyPath(T.ms([[21, -47], [28, -47], [28, -44.4], [21, -44.4]]))]);
      ctx.fill();
      cel(ctx, K, [dot(-2, -64, 2.6)], OC.brass, 1, 0);
      cel(ctx, K, [dot(27.5, -65, 2.2)], OC.brass, 1, 0);
    } else if (O.top === 'tux') {
      cel(ctx, K, [Bl([[2, -71], [25, -70], [17, -24, 1]], 0.4)], OC.shirtW, 2.5, 0);
      L([[13, -60], [15, -30]], 0.32, 0.4);
      cel(ctx, K, [Bl([[-8, -71], [3, -71], [17, -24, 1], [8, -40], [-2, -56]], 0.6)], OC.satin, 3);
      cel(ctx, K, [Bl([[25, -70], [31, -64], [17, -24, 1]], 0.6)], OC.satin, 2.5);
      const bt = [[6, -69], [13, -65.5], [20, -69.5], [20.5, -61], [13, -64], [5.5, -61.5]];
      cel(ctx, K, [Bl(bt, 0.5)], { base: '#16161B', shade: '#0B0B0E', rim: '#4A4A55' }, 1.5, 0);
      ctx.fillStyle = '#0B0B0E';
      build(ctx, [dot(18, -16, 2)]);
      ctx.fill();
    }
    if (O.apron) {
      const apP = [Bl([[-6, -46], [26, -48], [29, -20], [33, 26], [-10, 28], [-14, -4], [-10, -30]], 0.8)];
      cel(ctx, K, apP, OC.apron, 7);
      ctx.save();
      build(ctx, apP);
      ctx.clip();
      ctx.fillStyle = 'rgba(14,52,60,0.55)';
      ctx.beginPath();
      spline(ctx, T.ms([[2, -10], [14, -14], [22, -4], [20, 10], [8, 14], [0, 4]]), true, 1);
      ctx.fill();
      T.at(ctx, K, -8, () => {
        ctx.fillStyle = 'rgba(200,240,245,0.5)';
        ctx.beginPath();
        ctx.ellipse(16, -8, 3, 1.5, -0.4, 0, TAU);
        ctx.fill();
      });
      ctx.restore();
      ctx.fillStyle = 'rgba(14,52,60,0.6)';
      T.at(ctx, K, 20, () => {
        for (let i = 0; i < 2; i++) {
          ctx.beginPath();
          ctx.ellipse(8 + i * 8, 18 + i * 3, 1.6, 2.6, 0, 0, TAU);
          ctx.fill();
        }
      });
      L([[-6, -46], [-8, -60], [-2, -68]], 0.6, 0.9, OC.apron.shade);
      L([[26, -48], [24, -62], [20, -68]], 0.6, 0.9, OC.apron.shade);
      L([[-14, -4], [-24, -2], [-30, 4]], 0.55, 0.85, OC.apron.shade);
      L([[2, -40], [22, -42]], 0.34, 0.45);
    }
  }

  function head(ctx, K, R, X) {
    const B = X.B, LK = X.look, E = X.E;
    const C = X.C;
    frame(ctx, K, R.headO, R.rH, (K0) => {
      let K = K0;
      if (B.HS !== 1) {
        ctx.scale(B.HS, B.HS);
        K = Object.assign({}, K0, { lw: K0.lw / B.HS, minLine: K0.minLine / B.HS, rim: K0.rim / B.HS });
      }
      const cx = 6, cy = -66;
      const lk = (R.look - 0.3 * R.sh.tuck) * 24;
      const P = (x, y, w) => [cx + x + lk * (w == null ? Math.max(0, x / 66) : w), cy + y];
      const jw = Math.max(B.jaw, LK.jaw ? LK.jaw * 0.6 : 0), rd = B.round;
      const nz = Math.max(LK.nose || 0, B.nose || 0);
      const ch = 9 * (B.chin || 0);
      const skull = [P(0, -62 - 2 * rd), P(46 + 2 * rd, -46), P(63 + rd, -10), P(65 + 0.6 * nz, 1), P(69.5 + 1.5 * nz, 7), P(64.5 + 0.6 * nz, 14), P(60 + 2 * rd - jw, 24 + 3 * jw + 0.3 * ch), P(44 + 10 * jw + 3 * rd, 50 + 6 * jw + ch), P(18 + 9 * jw, 61 + 6 * jw + ch), P(-14 - 2 * jw, 57 + 4 * jw + 0.8 * ch, 0), P(-44, 40 + 0.4 * ch, 0), P(-65 - rd, 4, 0), P(-52, -40, 0)];
      const skin = [blob(skull, 1)];
      X.skull = skin;
      cel(ctx, K, skin, C.skin, 20);
      const gap = LK.eyeGap || 0;
      const fx = cx + 33 + lk;
      const eyeY = cy + 15 - 3 * Math.max(0, R.look) - 0.3 * ch;
      const ex = [fx - 15 - gap / 2, fx + 16 + gap / 2];
      const es = (LK.ear || 1) * (1 + 0.1 * (B.nose || 0));
      const earX = cx - 38 + lk * 0.3, earY = cy + 14;
      cel(ctx, K, [oval(earX, earY, 9 * es, 12.5 * es, -0.15)], C.skin, 3.5);
      line(ctx, K, [[earX + 3, earY - 6], [earX - 3, earY - 2], [earX - 1, earY + 4], [earX + 3, earY + 6]], 0.42, 0.7);
      ctx.save();
      build(ctx, skin);
      ctx.clip();
      const bl = LK.blush == null ? 0.42 : LK.blush;
      for (let i = 0; i < 2; i++) {
        const bx = ex[i] + (i ? 7 : -7), byy = eyeY + 15;
        const rx = i ? 7.5 : 10;
        const g = ctx.createRadialGradient(bx, byy, 0, bx, byy, rx);
        g.addColorStop(0, 'rgba(239,138,110,' + bl + ')');
        g.addColorStop(1, 'rgba(239,138,110,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(bx, byy, rx, rx * 0.62, 0, 0, TAU);
        ctx.fill();
      }
      if (LK.freckles) {
        ctx.fillStyle = 'rgba(150,90,50,0.45)';
        for (let i = 0; i < 7; i++) {
          ctx.beginPath();
          ctx.arc(fx - 20 + ih(i, 1, 5) * 44, eyeY + 9 + ih(i, 2, 5) * 8, 0.9, 0, TAU);
          ctx.fill();
        }
      }
      const squint = Math.max(R.squint, E.squint);
      const shut = Math.max(R.blink, E.closed);
      const close = Math.max(squint, shut, E.arc);
      const eS = E.eyeS * (LK.eyeS || 1) * (1 - 0.1 * B.jaw) * (1 - (B.eyeK || 0));
      for (let i = 0; i < 2; i++) {
        const x = ex[i], y = eyeY;
        const d = i ? -1 : 1;
        const rx = (i ? 4.4 - R.look * 0.8 : 5.5 + R.look * 0.3) * eS;
        const ry = 8.2 * eS * (1 - 0.82 * close) * (1 - 0.3 * E.lid);
        if (close < 0.75) {
          ctx.fillStyle = JC.eye;
          ctx.beginPath();
          ctx.ellipse(x, y + 1.5 * close + 2.2 * E.lid, rx, Math.max(1.4, ry), 0, 0, TAU);
          ctx.fill();
          if (E.lid > 0.05) {
            ctx.fillStyle = C.skin.base;
            ctx.beginPath();
            ctx.rect(x - rx - 2, y - 12, rx * 2 + 4, 12 - 6 * (1 - E.lid) + 3.5);
            ctx.fill();
            line(ctx, K, [[x - rx - 1.5, y - 2.5 + 6 * (1 - E.lid) + 0.5], [x + rx + 1.5, y - 2.5 + 6 * (1 - E.lid) - 0.5 * (i ? -1 : 1)]], 0.5, E.lid, JC.eye);
          }
          if (close < 0.4 && E.lid < 0.2) {
            ctx.fillStyle = 'rgba(255,248,232,' + (0.9 * (1 - close / 0.4)) + ')';
            ctx.beginPath();
            ctx.arc(x + 1.8 * (K.lx > 0 ? 1 : -1), y - 3.2, 1.7, 0, TAU);
            ctx.fill();
            if (E.hi2 > 0) {
              ctx.fillStyle = 'rgba(255,248,232,' + 0.75 * E.hi2 + ')';
              ctx.beginPath();
              ctx.arc(x - 1.6 * (K.lx > 0 ? 1 : -1), y + 3, 1, 0, TAU);
              ctx.fill();
            }
          }
        }
        if (close >= 0.5) {
          const a = clamp01((close - 0.5) / 0.25);
          const w = rx + 2;
          let pts;
          if (squint >= shut && squint >= E.arc) {
            pts = [[x - d * w, y - 3.5], [x + d * (w - 1), y + 0.8, 1], [x - d * w, y + 4.2]];
          } else if (E.arc > shut) {
            pts = [[x - rx - 2, y + 2.5], [x, y - 3.5], [x + rx + 2, y + 2.5]];
          } else {
            pts = [[x - rx - 1.5, y + 1], [x, y + 3.5], [x + rx + 1.5, y + 1]];
          }
          line(ctx, K, pts, 0.62, a, JC.eye);
        }
        if (E.tear > 0) {
          line(ctx, K, [[x - rx, y + 6], [x, y + 7.5], [x + rx, y + 6]], 0.45, 0.8 * E.tear, '#8FC8E8');
          const q = ((R.t * 0.55 + i * 0.47) % 1 + 1) % 1;
          const ty = y + 9 + q * 26 * (1 + E.stream);
          ctx.fillStyle = 'rgba(160,214,240,' + (0.9 * E.tear * (1 - q * 0.6)) + ')';
          ctx.strokeStyle = 'rgba(60,110,150,' + 0.6 * E.tear + ')';
          ctx.lineWidth = Math.max(K.minLine, K.lw * 0.3);
          ctx.beginPath();
          ctx.moveTo(x + d * 2, ty - 5);
          ctx.quadraticCurveTo(x + d * 2 + 3.4, ty + 1.2, x + d * 2, ty + 2.6);
          ctx.quadraticCurveTo(x + d * 2 - 3.4, ty + 1.2, x + d * 2, ty - 5);
          ctx.fill();
          ctx.stroke();
          if (E.stream > 0) line(ctx, K, [[x + d * 1.5, y + 7], [x + d * 2.5, y + 16], [x + d * 2, y + 24]], 0.4, 0.55 * E.stream, '#9CD0EC');
        }
      }
      const det = X.determined || 0;
      const lift = -4.5 * R.sh.ant + 3.5 * squint + 2 * R.sh.tuck - 0.8 * R.blink + E.browLift + 2 * det;
      const worry = 0.28 * (1 - squint) * (1 - 0.7 * (B.calm || 0)) - 0.22 * squint + E.worry - 0.42 * det;
      const bw = (LK.brow || 1) * (1 + (B.browK || 0));
      for (let i = 0; i < 2; i++) {
        const bx = ex[i] + (i ? 1 : -1), by = eyeY - 19 + 4 * (B.browK || 0) + lift;
        const inner = i ? -1 : 1;
        const len = (i ? 10 : 12) * (1 + 0.45 * (B.browK || 0));
        const a = -inner * worry;
        const p0 = add([bx, by], rot([-len / 2 * inner, 0], a));
        const p1 = add([bx, by], rot([len / 2 * inner, 0], a));
        const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 - 1.5];
        const rb = ribbon([p0, mid, p1], [2.6 * bw, 3.8 * bw, 2.4 * bw]);
        ctx.fillStyle = C.hair.shade;
        ctx.beginPath();
        spline(ctx, oriented(rb), true, 0.9);
        ctx.fill();
      }
      if (E.mouth && E.mouthK > 0.01) mouth(ctx, K, E, fx + 1, eyeY + 27 + 0.75 * ch, R.t);
      if (LK.moustache) {
        ctx.fillStyle = C.hair.base;
        ctx.strokeStyle = INK;
        ctx.lineWidth = Math.max(K.minLine, K.lw * 0.4);
        ctx.beginPath();
        spline(ctx, [[fx - 15, eyeY + 21.5], [fx - 6, eyeY + 15.5], [fx + 4, eyeY + 16.5], [fx + 16, eyeY + 15], [fx + 19, eyeY + 20.5, 1], [fx + 8, eyeY + 20], [fx + 1, eyeY + 21.5], [fx - 8, eyeY + 20.5]], true, 1);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
      hair(ctx, K, R, X, cx, cy, lk, P);
      if (X.helmet) helmetShell(ctx, K, cx, cy, lk, R.t);
      else if (X.cap === 'garrison') garrisonCap(ctx, K, cx, cy, lk, P);
    });
  }

  function mouth(ctx, K, E, x, y, t) {
    const k = E.mouthK;
    ctx.save();
    ctx.globalAlpha *= Math.min(1, k * 1.4);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(K.minLine, K.lw * 0.62);
    ctx.beginPath();
    if (E.mouth === 'smile') {
      const w = 6 + 3 * k;
      ctx.moveTo(x - w, y - 1.5);
      ctx.quadraticCurveTo(x, y + 4.5 * k + 1, x + w, y - 1.5);
      ctx.stroke();
    } else if (E.mouth === 'frown') {
      const w = 5.5;
      ctx.moveTo(x - w, y + 2.5);
      ctx.quadraticCurveTo(x, y - 2.5 * k - 0.5, x + w, y + 2.5);
      ctx.stroke();
    } else if (E.mouth === 'o') {
      ctx.ellipse(x, y + 1, 3.6 * k + 2, 4.6 * k + 2.4, 0, 0, TAU);
      ctx.fillStyle = '#5A2A22';
      ctx.fill();
      ctx.stroke();
    } else if (E.mouth === 'laugh') {
      const w = 10, d = 11 * k;
      ctx.moveTo(x - w, y - 3);
      ctx.lineTo(x + w, y - 3);
      ctx.quadraticCurveTo(x + w * 0.9, y - 3 + d * 1.2, x, y - 3 + d);
      ctx.quadraticCurveTo(x - w * 0.9, y - 3 + d * 1.2, x - w, y - 3);
      ctx.closePath();
      ctx.fillStyle = '#6B2B24';
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = '#E2756A';
      ctx.beginPath();
      ctx.ellipse(x + 1, y - 3 + d, 7, 4.5, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.stroke();
    } else if (E.mouth === 'wobble') {
      const w = 8;
      ctx.moveTo(x - w, y + 3);
      for (let i = 1; i <= 8; i++) {
        const u = i / 8;
        const xx = x - w + 2 * w * u;
        const yy = y + 3 - 4 * Math.sin(Math.PI * u) + 1.2 * Math.sin(u * 20 + t * 22);
        ctx.lineTo(xx, yy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function hair(ctx, K, R, X, cx, cy, lk, P) {
    const B = X.B, C = X.C;
    const style = X.hair;
    if (style === 'buzz') {
      const cap = [P(-46, 30, 0), P(-66, 8, 0), P(-66, -30, 0), P(-48, -56, 0), P(-14, -68, 0), P(18, -66), P(44, -52), P(58, -36), P(52, -30), P(36, -34), P(18, -37), P(-2, -34, 0), P(-18, -24, 0), P(-26, -8, 0), P(-28, 8, 0), P(-34, 14, 0), P(-42, 6, 0), P(-48, 18, 0)];
      const cp = [blob(cap, 0.9)];
      ctx.save();
      build(ctx, X.skull);
      ctx.clip();
      const capC = { base: hmix(C.hair.base, C.skin.base, 0.28), shade: hmix(C.hair.shade, C.skin.shade, 0.25), rim: hmix(C.hair.base, C.skin.rim, 0.5) };
      build(ctx, cp);
      ctx.fillStyle = capC.base;
      ctx.fill();
      shade(ctx, K, [cp], cp, capC, 14, K.rim);
      build(ctx, cp);
      ctx.clip();
      ctx.fillStyle = hmix(C.hair.shade, INK, 0.3);
      for (let i = 0; i < 220; i++) {
        const x = cx - 70 + ih(i, 3, 17) * 130, y = cy - 70 + ih(i, 4, 17) * 100;
        ctx.globalAlpha = 0.35 + 0.3 * ih(i, 5, 17);
        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      line(ctx, K, [P(-28, -10, 0), P(-30, 6, 0), P(-38, 12, 0)], 0.32, 0.4);
      return;
    }
    if (style === 'sam' && B.cut) return manCut(ctx, K, R, X, cx, cy, lk, P);
    const wet = style === 'wet';
    const L = wet ? 0.55 : B.hairLen;
    const hc = wet ? { base: hmix(C.hair.base, INK, 0.3), shade: hmix(C.hair.shade, INK, 0.3), rim: hmix(C.hair.base, '#BFE6F0', 0.45) } : C.hair;
    const hx = -R.flick * 0.3, hy = R.lagHair * 1.7 + R.flick;
    const cl = sstep(-6, 6, R.lagHair * 1.7 + R.flick);
    if (!wet) {
      const ck = L === 1 ? 1 : 0.55 + 0.45 * L;
      const cowP = [[-18, -60], [-22, -76], [-14, -88], [-2 + cl * 2, -90 + cl * 4], [3 + cl * 3, -83 + cl * 5]].map((q) => (ck === 1 ? [cx + q[0], cy + q[1] + 0] : [cx + q[0], cy + (q[1] + 60) * ck - 60]));
      const cow = ribbon(cowP, [13, 10, 7.5, 5, 1.5], true);
      cel(ctx, K, [blob(cow, 0.9)], hc, 4);
    }
    const T = (x, y, ax, ay) => (L === 1 ? [x, y] : [ax + (x - ax) * L, ay + (y - ay) * L]);
    const at = (x, y, w, c) => { const q = T(x, y, x * 0.92, y * 0.92 + 1); return P(q[0], q[1], w); };
    const pt = (x, y, c) => { const q = T(x, y, x * 0.9, y * 0.9); return [cx + q[0] + (c ? lk * c : 0), cy + q[1], 1]; };
    const tip = (x, y, k) => { const q = L === 1 ? [x, y] : [x, -26 + (y + 26) * L]; return [cx + q[0] + lk * Math.max(0, q[0] / 66) + hx * k, cy + q[1] + hy * k, 1]; };
    let hairPts;
    if (wet) {
      hairPts = [
        P(-46, 30, 0), [cx - 56, cy + 34, 1], P(-62, 14, 0), P(-68, -10, 0), P(-64, -40, 0), P(-48, -60, 0), P(-22, -70, 0), P(4, -71), P(30, -64),
        P(50, -50), P(60, -34), tip(64, -14, 0.6), P(52, -26), tip(40, -12, 0.8), P(28, -26), tip(14, -16, 0.6), P(2, -26), P(-12, -24, 0),
        P(-22, -14, 0), P(-29, 2, 0), [cx - 31, cy + 12, 1], P(-38, 4, 0), P(-44, 18, 0),
      ];
    } else {
      hairPts = [
        at(-46, 34, 0), pt(-57, 38), at(-62, 18, 0), pt(-75, 12), at(-70, -10, 0), pt(-81, -26),
        at(-71, -44, 0), at(-58, -64, 0), pt(-45, -71), at(-26, -78, 0), at(-3, -81), at(20, -77),
        pt(37, -74, 0.6), at(50, -61), pt(68, -52, 0.8), at(62, -36),
        tip(67, -15, 0.7), P(53, -26), tip(46, -7, 1.1), P(36, -22), tip(24, -9, 1), P(14, -23), tip(2, -15, 0.8), P(-9, -24, 0),
        P(-22, -14, 0), P(-29, 2, 0), [cx - 31, cy + 14, 1], P(-38, 4, 0), P(-44, 18, 0),
      ];
    }
    const hairP = [blob(hairPts, 0.85)];
    cel(ctx, K, hairP, hc, 15);
    ctx.save();
    build(ctx, hairP);
    ctx.clip();
    const sc = hc.shade;
    line(ctx, K, [[cx - 44, cy - 44], [cx - 34, cy - 28], [cx - 30, cy - 16]], 0.38, 0.8, sc);
    line(ctx, K, [[cx - 14, cy - 58], [cx - 4, cy - 42], [cx - 2, cy - 30]], 0.38, 0.8, sc);
    line(ctx, K, [[cx + 22 + lk * 0.4, cy - 58], [cx + 30 + lk * 0.5, cy - 42], [cx + 32 + lk * 0.6, cy - 30]], 0.38, 0.7, sc);
    line(ctx, K, [[cx - 60, cy - 10], [cx - 50, cy + 6], [cx - 48, cy + 18]], 0.38, 0.6, sc);
    if (wet) {
      line(ctx, K, [[cx - 40, cy - 56], [cx - 10, cy - 66], [cx + 20, cy - 62]], 0.7, 0.55, 'rgba(220,240,250,0.9)');
    }
    ctx.restore();
    const dripK = 1 - clamp01(3 * ((X.E && X.E.tear) || 0));
    if (wet && dripK > 0.02) {
      ctx.fillStyle = 'rgba(150,205,230,' + (0.85 * dripK) + ')';
      for (let i = 0; i < 2; i++) {
        const q = ((R.t * 0.8 + i * 0.5) % 1 + 1) % 1;
        ctx.beginPath();
        ctx.ellipse(cx + 40 - i * 26 + lk * 0.5, cy - 10 + q * 22, 1.6, 2.4, 0, 0, TAU);
        ctx.fill();
      }
    }
  }

  function manCut(ctx, K, R, X, cx, cy, lk, P) {
    const hc = X.C.hair;
    const man = X.B.cut >= 1;
    const hy = R.lagHair * 1.2 + R.flick * 0.6;
    const tip = (x, y, k) => [cx + x + lk * Math.max(0, x / 66), cy + y + hy * k, 1];
    const back = [P(-44, 26, 0), [cx - 52, cy + 22, 1], P(-58, 12, 0), P(-67, -10, 0), [cx - 72, cy - 26, 1], P(-64, -42, 0), P(-50, -63, 0), [cx - 44, cy - 74, 1], P(-26, -76, 0)];
    const side = [P(8, -38), P(-8, -33, 0), P(-20, -20, 0), P(-26, -2, 0), [cx - 28, cy + 12, 1], P(-35, 1, 0), P(-42, 14, 0)];
    const top = man
      ? [P(-4, -83), P(22, -84), [cx + 36 + lk * 0.55, cy - 88, 1], P(48, -77), P(58, -62), tip(64, -46, 1), P(52, -46), tip(56, -34, 0.8), P(42, -40), tip(36, -30, 0.6), P(24, -40)]
      : [P(-4, -82), P(22, -80), P(44, -70), P(56, -54), tip(62, -30, 1), P(50, -40), tip(46, -24, 1), P(36, -36), tip(28, -22, 0.8), P(18, -36), tip(10, -24, 0.6)];
    const hairP = [blob(back.concat(top, side), 0.85)];
    cel(ctx, K, hairP, hc, 15);
    ctx.save();
    build(ctx, hairP);
    ctx.clip();
    const sc = hc.shade;
    if (man) {
      line(ctx, K, [P(-44, -62, 0), P(-14, -76, 0), P(16, -78), P(40, -72)], 0.38, 0.75, sc);
      line(ctx, K, [P(-50, -40, 0), P(-20, -58, 0), P(16, -62), P(46, -56)], 0.38, 0.7, sc);
      line(ctx, K, [P(-26, -32, 0), P(4, -48, 0), P(36, -48)], 0.36, 0.55, sc);
    } else {
      line(ctx, K, [P(-40, -58, 0), P(-6, -66, 0), P(26, -56), P(40, -40)], 0.38, 0.7, sc);
      line(ctx, K, [P(-10, -70, 0), P(14, -58), P(22, -38)], 0.36, 0.6, sc);
    }
    line(ctx, K, [P(-58, -14, 0), P(-50, 4, 0), P(-46, 18, 0)], 0.36, 0.5, sc);
    ctx.restore();
  }

  function garrisonCap(ctx, K, cx, cy, lk, P) {
    const pts = [[cx + 60 + lk * 0.85, cy - 36, 1], P(48, -38), P(20, -48), P(-14, -50, 0), P(-48, -42, 0), [cx - 66, cy - 36, 1],
      P(-60, -56, 0), P(-30, -72, 0), P(6, -78), P(38, -72), [cx + 60 + lk * 0.85, cy - 54, 1]];
    const part = [blob(pts, 0.9)];
    cel(ctx, K, part, OC.agreen, 8);
    line(ctx, K, [P(54, -44), P(18, -56), P(-20, -58, 0), P(-58, -48, 0)], 0.4, 0.75);
    line(ctx, K, [P(-52, -60, 0), P(-14, -74, 0), P(32, -74)], 0.32, 0.45, OC.agreen.shade);
    cel(ctx, K, [oval(cx + 26 + lk * 0.4, cy - 52, 3, 3.6, 0)], OC.brass, 1.2, 0);
  }

  const HELM = (cx, cy, lk) => [
    [cx + 72 + lk * 0.9, cy - 20, 1], [cx + 64 + lk * 0.8, cy - 48], [cx + 40 + lk * 0.5, cy - 76], [cx + 4, cy - 88], [cx - 34, cy - 84], [cx - 64, cy - 62],
    [cx - 78, cy - 30], [cx - 82, cy + 6], [cx - 90, cy + 26, 1], [cx - 70, cy + 22], [cx - 50, cy + 6], [cx - 28, cy - 6], [cx + 10, cy - 16], [cx + 48 + lk * 0.6, cy - 18],
  ];
  function helmetShell(ctx, K, cx, cy, lk, t) {
    line(ctx, K, [[cx - 46, cy + 8], [cx - 22, cy + 40], [cx + 24 + lk * 0.6, cy + 60]], 0.7, 0.9, OC.band.shade);
    const parts = [blob(HELM(cx, cy, lk), 0.85)];
    camoCel(ctx, K, parts, [{ part: parts[0], o: [cx, cy - 40], a: 0.3, b: [-95, -60, 95, 75] }], 'desert', OC.helmet, 16, false);
    ctx.save();
    build(ctx, parts);
    ctx.clip();
    ctx.strokeStyle = OC.band.base;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(cx - 84, cy - 22);
    ctx.quadraticCurveTo(cx - 10, cy - 50, cx + 74 + lk, cy - 36);
    ctx.stroke();
    ctx.fillStyle = '#C9C08A';
    for (const ux of [-40, 30]) {
      ctx.beginPath();
      ctx.ellipse(cx + ux, cy - 37 + Math.abs(ux) * 0.06, 3.2, 1.3, -0.1, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    line(ctx, K, [[cx - 84, cy - 26], [cx - 10, cy - 54], [cx + 74 + lk, cy - 40]], 0.36, 0.5);
    line(ctx, K, [[cx - 86, cy + 22], [cx - 60, cy + 16], [cx - 30, cy - 2], [cx + 12, cy - 12], [cx + 66 + lk * 0.8, cy - 16]], 0.42, 0.6);
  }

  function helmet(ctx, o) {
    o = o || {};
    const size = Math.max(10, o.size || 160);
    const s = size / 170;
    const t = o.t || 0;
    const open = clamp01(o.open || 0);
    const liner = clamp01(o.liner || 0);
    const lwPx = Math.max(2.5, 6 * Math.min(1, size / 170) * 1.0);
    const mx = o.mirror ? -1 : 1;
    const K = { lw: lwPx / s / 2, minLine: 1.15 / s, lx0: 0.78 * mx, ly0: -0.62, lx: 0.78 * mx, ly: -0.62, baseRot: 0, rim: Math.max(2.6, 1.2 / s) };
    ctx.save();
    ctx.translate(o.x || 0, o.y || 0);
    if (o.mirror) ctx.scale(-1, 1);
    ctx.rotate(o.rot || 0);
    ctx.scale(s, s);
    const l = rot([K.lx0, K.ly0], -(o.rot || 0));
    K.lx = l[0]; K.ly = l[1]; K.baseRot = o.rot || 0;
    ctx.fillStyle = 'rgba(40,26,14,0.22)';
    ctx.beginPath();
    ctx.ellipse(-6, 4, 84, 9, 0, 0, TAU);
    ctx.fill();
    const hdome = Math.cos(open * Math.PI) * 74;
    const rimRy = 10 + 30 * Math.sin(open * Math.PI * 0.5);
    const rimY = open < 0.5 ? 0 : -rimRy * 0.2;
    const domeY = rimY;
    const shell = (ctx) => {
      ctx.moveTo(-82, domeY);
      ctx.bezierCurveTo(-80, domeY - hdome * 0.9, -40, domeY - hdome * 1.25, 0, domeY - hdome * 1.25);
      ctx.bezierCurveTo(46, domeY - hdome * 1.25, 78, domeY - hdome * 0.85, 82, domeY - hdome * 0.05);
      ctx.ellipse(0, domeY, 82, rimRy, 0, 0, Math.PI, false);
      ctx.closePath();
    };
    if (open < 0.5) {
      const sq = Math.max(0.06, Math.cos(open * Math.PI));
      ctx.save();
      ctx.scale(1, sq);
      const Kp = Object.assign({}, K, { lw: K.lw, ly: K.ly });
      frame(ctx, Kp, [4, -0.5], 0.277, (K) => {
        const prof = [blob(HELM(0, 0, 0), 0.85)];
        camoCel(ctx, K, prof, [{ part: prof[0], o: [0, -40], a: 0.3, b: [-95, -60, 95, 75] }], 'desert', OC.helmet, 16, false);
        ctx.save();
        build(ctx, prof);
        ctx.clip();
        ctx.strokeStyle = OC.band.base;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(-84, -22);
        ctx.quadraticCurveTo(-10, -50, 74, -36);
        ctx.stroke();
        ctx.fillStyle = '#C9C08A';
        for (const ux of [-40, 30]) {
          ctx.beginPath();
          ctx.ellipse(ux, -37 + Math.abs(ux) * 0.06, 3.2, 1.3, -0.1, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
        line(ctx, K, [[-84, -26], [-10, -54], [74, -40]], 0.36, 0.5);
        line(ctx, K, [[-86, 22], [-60, 16], [-30, -2], [12, -12], [66, -16]], 0.42, 0.6);
        line(ctx, K, [[-46, 8], [-10, 14], [30, 2]], 0.6, 0.85, OC.band.shade);
      });
      ctx.restore();
    } else {
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(0, rimY, 82 + K.lw, rimRy + K.lw, 0, 0, TAU);
      ctx.fill();
      const sp = [shell];
      camoCel(ctx, K, sp, [{ part: shell, o: [0, -30], a: 0.3, b: [-95, -90, 95, 90] }], 'desert', OC.helmet, 18, false);
      const io = (ctx) => ctx.ellipse(0, rimY, 76, rimRy - 5, 0, 0, TAU);
      ctx.save();
      build(ctx, [io]);
      ctx.fillStyle = OC.shell.base;
      ctx.fill();
      ctx.clip();
      const g = ctx.createRadialGradient(-10, rimY + 8, 6, 0, rimY, 80);
      g.addColorStop(0, 'rgba(20,22,12,0.75)');
      g.addColorStop(1, 'rgba(20,22,12,0)');
      ctx.fillStyle = g;
      BIG(ctx);
      const cy = rimY + 4;
      ctx.fillStyle = '#8C7F5C';
      ctx.beginPath();
      ctx.ellipse(0, cy, 34, 13, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#2C2618';
      ctx.beginPath();
      ctx.ellipse(0, cy, 17, 5.5, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      drawRing(ctx, 0, cy - 2, 26, t);
      ctx.save();
      ctx.globalAlpha *= 0.9;
      for (const sx of [-1, 1]) {
        const x0 = sx * 7, x1 = sx * 30;
        const tp = [[x0, cy - 9], [x1, cy - 6], [x1 + sx * 1.5, cy + 4], [x0 - sx * 1, cy + 7]];
        cel(ctx, K, [blob(tp, 0.2)], OC.tape, 1.5, 0);
        line(ctx, K, [[x0 + sx * 3, cy - 3], [x1 - sx * 2, cy - 1]], 0.25, 0.35, '#7D8184');
        line(ctx, K, [[x0 + sx * 3, cy + 2], [x1 - sx * 2, cy + 3]], 0.25, 0.3, '#7D8184');
      }
      ctx.restore();
      const up = liner * 22, tilt = -liner * 0.62;
      frame(ctx, K, [-62, rimY - up], tilt, (K) => {
        ctx.translate(62, 0);
        const band = (ctx) => {
          ctx.ellipse(0, 0, 66, rimRy - 12, 0, 0, TAU);
          ctx.ellipse(0, 0, 58, Math.max(2, rimRy - 19), 0, 0, TAU);
        };
        ctx.save();
        build(ctx, [band]);
        ctx.fillStyle = INK;
        ctx.strokeStyle = INK;
        ctx.lineWidth = K.lw * 2;
        ctx.stroke();
        ctx.fillStyle = OC.liner.base;
        ctx.fill('evenodd');
        ctx.restore();
        for (const a of [0.5, -0.5]) {
          const p0 = [Math.cos(a) * 60, Math.sin(a) * (rimRy - 15)], p1 = [-p0[0], -p0[1]];
          ctx.save();
          ctx.strokeStyle = INK;
          ctx.lineWidth = 9 + K.lw * 2;
          ctx.lineCap = 'butt';
          ctx.beginPath();
          ctx.moveTo(p0[0], p0[1]);
          ctx.quadraticCurveTo(0, -liner * 26, p1[0], p1[1]);
          ctx.stroke();
          ctx.strokeStyle = OC.liner.shade;
          ctx.lineWidth = 9;
          ctx.stroke();
          ctx.restore();
        }
      });
      line(ctx, K, [[-82, rimY], [0, rimY + rimRy], [82, rimY]], 0.6, 0.85);
    }
    ctx.restore();
  }

  function drawRing(ctx, x, y, size, t) {
    const R = FILM.cast && FILM.cast.diamondRing;
    if (typeof R === 'function') {
      R(ctx, { x, y, size, t, tilt: 1.05, rot: 0.25, shadow: 0, sparkle: 0.5 });
      return;
    }
    ctx.save();
    ctx.strokeStyle = '#5a2c10';
    ctx.lineWidth = size * 0.2 + 2;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.5, size * 0.22, 0, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = '#F2C14E';
    ctx.lineWidth = size * 0.2;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#5a6a80';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.5);
    ctx.lineTo(x + size * 0.18, y - size * 0.28);
    ctx.lineTo(x, y - size * 0.14);
    ctx.lineTo(x - size * 0.18, y - size * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(191,230,255,0.9)';
    ctx.beginPath();
    ctx.arc(x + size * 0.05, y - size * 0.33, size * 0.05, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function figure(ctx, o, lookKey, look) {
    o = o || {};
    const h = Math.max(20, o.h || 330);
    const s = h / JH;
    const facing = o.facing === -1 ? -1 : 1;
    const B = buildFor(o.age);
    const R = rig(o, B);
    const outfit = OUTFITS[o.outfit] ? o.outfit : 'school';
    const P = palFor(outfit, look, lookKey);
    const O = P.O;
    const pack = o.backpack == null ? !!O.pack && !R.backpackOff : !!o.backpack;
    const exprName = o.expr || R.poseExpr || 'neutral';
    const E = exprFor(exprName, o.exprAmt == null ? (o.expr ? 1 : R.poseExpr ? R.exprK == null ? 1 : R.exprK : 1) : clamp01(o.exprAmt));
    const hairStyle = o.hair || O.hair || look.hairStyle || 'sam';
    const X = { B, look, C: P.C, E, hair: hairStyle, helmet: !!o.helmet, cap: o.cap === false ? null : o.cap || O.cap || null, determined: R.determined || 0 };
    const lwPx = Math.max(2.5, 6 * s);
    const L0 = [0.78, -0.62];
    const K = {
      lw: lwPx / s / 2,
      minLine: 1.15 / s,
      lx0: L0[0] * facing, ly0: L0[1], lx: L0[0] * facing, ly: L0[1], baseRot: 0,
      rim: Math.max(2.6, 1.2 / s),
    };
    const layer = o.layer || 'all';
    ctx.save();
    ctx.translate(o.x || 0, o.y || 0);
    ctx.scale(s * facing, s);
    if (layer !== 'front' && o.shadow !== false) {
      ctx.save();
      ctx.translate(-12, 0);
      ctx.scale(1, 0.15);
      const wk = R.rB ? 1 + 0.6 * Math.abs(Math.sin(R.rB)) : 1;
      ctx.scale(wk * B.BSx, 1);
      const g = ctx.createRadialGradient(0, 0, 8, 0, 0, 84);
      g.addColorStop(0, JC.shadow + '0.34)');
      g.addColorStop(0.6, JC.shadow + '0.2)');
      g.addColorStop(1, JC.shadow + '0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, 84, 0, TAU);
      ctx.fill();
      ctx.restore();
      if (!R.rB) {
        for (const leg of R.legs) {
          const lift = -leg.ankle[1] - ANK;
          const a = 0.26 * clamp01(1 - lift / 16);
          if (a <= 0) continue;
          ctx.fillStyle = JC.shadow + a + ')';
          ctx.beginPath();
          ctx.ellipse(leg.ankle[0] * B.BSx + 7, 1, 27 * B.BSx, 4.5, 0, 0, TAU);
          ctx.fill();
        }
      }
    }
    frame(ctx, K, R.orig, R.rB, (K) => {
      const bodyScale = B.BSx !== 1 || B.BSy !== 1;
      const Kb = bodyScale ? Object.assign({}, K, { lw: K.lw / Math.sqrt(B.BSx * B.BSy), minLine: K.minLine / Math.sqrt(B.BSx * B.BSy), rim: K.rim / Math.sqrt(B.BSx * B.BSy) }) : K;
      const body = (fn) => {
        if (!bodyScale) return fn(K);
        ctx.save();
        ctx.scale(B.BSx, B.BSy);
        fn(Kb);
        ctx.restore();
      };
      const nearArm = (K) => sleeveArm(ctx, K, R.nearArm, false, R.openHand, P, R.thumbUp);
      const farArm = (K) => sleeveArm(ctx, K, R.farArm, true, R.openFar, P, 0);
      if (layer !== 'front') {
        body((K) => {
          if (!R.farFront && !R.farMid) farArm(K);
          footwear(ctx, K, R.legs[1], true, P);
          legwear(ctx, K, R.legs[1], true, P, false);
          if (pack) backpack(ctx, K, R);
          if (!R.legFront) {
            footwear(ctx, K, R.legs[0], false, P);
            legwear(ctx, K, R.legs[0], false, P, true);
          }
          if (R.farMid && !R.farFront) farArm(K);
          if (B.neck) {
            const n0 = R.neck, n1 = R.headO;
            const nw = 1 + 0.2 * B.shK;
            cel(ctx, K, [capsule(n0[0], n0[1] + 4, 10.5 * nw, n1[0], n1[1] + 2, 10 * nw)], P.C.skin, 5);
          }
          torso(ctx, K, R, P, pack, B);
          if (R.legFront) {
            footwear(ctx, K, R.legs[0], false, P);
            legwear(ctx, K, R.legs[0], false, P, true);
          }
        });
        const Rh = bodyScale ? Object.assign({}, R, { headO: [R.headO[0] * B.BSx, R.headO[1] * B.BSy] }) : R;
        if (R.nearUnder && layer !== 'back') body(nearArm);
        head(ctx, K, Rh, X);
        if (R.farFront) body(farArm);
      }
      if (layer !== 'back' && !(R.nearUnder && layer !== 'front')) body(nearArm);
    });
    ctx.restore();
  }

  function sam(ctx, o) {
    figure(ctx, o, 'sam', LOOKS.sam);
  }

  function soldier(ctx, o) {
    o = o || {};
    const v = ((Math.floor(o.variant || 0) % 6) + 6) % 6;
    const look = SOLDIER_LOOKS[v];
    const q = Object.assign({ outfit: 'fatigues-desert', helmet: true, age: 19, blinkOffset: 0.83 * v + 0.4 }, o);
    figure(ctx, q, 'soldier' + v, look);
  }
  soldier.VARIANTS = 6;

  function poseOf(o) {
    o = o || {};
    const h = Math.max(20, o.h || 330);
    const s = h / JH;
    const f = o.facing === -1 ? -1 : 1;
    const B = buildFor(o.age);
    const R = rig(o, B);
    const W = (p) => { const q = bodyPt(R, B, p); return [(o.x || 0) + q[0] * s * f, (o.y || 0) + q[1] * s]; };
    const headC = add(add(R.orig, rot([R.headO[0] * B.BSx, R.headO[1] * B.BSy], R.rB)), rot([6 * B.HS, -66 * B.HS], R.rB + R.rH));
    return {
      legs: R.legs.map((l) => ({
        hip: W(l.hip), knee: W(l.knee), ankle: W(l.ankle), phi: l.phi, planted: l.planted,
        ball: W(add(l.ankle, rot([BALL[0], BALL[1]], l.phi))), heel: W(add(l.ankle, rot(HEEL, l.phi))),
      })),
      hands: [W(R.nearArm.wrist), W(R.farArm.wrist)],
      head: [(o.x || 0) + headC[0] * s * f, (o.y || 0) + headC[1] * s],
      box: R.boxAt ? W(R.boxAt) : null,
      grip: R.gripAt ? W(R.gripAt) : null,
      back: W(torsoMap(R, 1, 'body').M([-27, -48])),
      helmet: R.helmetAt ? Object.assign({ x: W(R.helmetAt)[0], y: W(R.helmetAt)[1], size: R.helmetSize * s, open: 1, liner: R.helmetLift, t: o.t || 0, mirror: f === -1 }) : null,
      stride: stride(o),
    };
  }
  function stride(o) {
    o = o || {};
    const h = Math.max(20, o.h || 330);
    const B = buildFor(o.age);
    const run = o.pose === 'run' || o.pose === 'sprintCrouch' || o.pose === 'callOut';
    return 2 * (run ? SAM_RUN_STEP : SAM_STEP) * h * B.BSx;
  }
  sam.pose = poseOf;
  sam.stride = stride;
  sam.STEP = SAM_STEP;
  sam.RUN_STEP = SAM_RUN_STEP;
  sam.height = (o) => Math.max(20, (o && o.h) || 330) * buildFor(o && o.age).tot;
  sam.POSES = Object.keys(POSES);
  sam.OUTFITS = Object.keys(OUTFITS);
  sam.EXPRS = Object.keys(EXPR);
  sam.AGES = AGES.map((a) => a[0]);
  soldier.pose = (o) => poseOf(Object.assign({ outfit: 'fatigues-desert', helmet: true, age: 19 }, o));
  soldier.stride = (o) => stride(Object.assign({ age: 19 }, o));

  FILM.cast = Object.assign(FILM.cast || {}, { ring, ladybug, darkRing, caption, sam, soldier, helmet });
})();
