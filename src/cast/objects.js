// cast/objects.js: character and prop builders (FILM.cast).
(function () {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const FILM = (root.FILM = root.FILM || {});
  const CAST = (FILM.cast = FILM.cast || {});
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, k) => a + (b - a) * k;
  const sstep = (a, b, v) => {
    const k = clamp((v - a) / (b - a));
    return k * k * (3 - 2 * k);
  };
  const INK = '#1F1712';

  const hexCache = {};
  function hexRgb(c) {
    if (hexCache[c]) return hexCache[c];
    let r = 0, g = 0, b = 0;
    if (c[0] === '#') {
      const n = parseInt(c.slice(1, 7), 16);
      r = (n >> 16) & 255;
      g = (n >> 8) & 255;
      b = n & 255;
    } else {
      const m = c.match(/[\d.]+/g) || [0, 0, 0];
      r = +m[0];
      g = +m[1];
      b = +m[2];
    }
    return (hexCache[c] = [r, g, b]);
  }
  const mixCache = {};
  function mix(a, b, k) {
    k = Math.round(clamp(k) * 64) / 64;
    const key = a + b + k;
    const hit = mixCache[key];
    if (hit) return hit;
    const A = hexRgb(a), B = hexRgb(b);
    const v = A.map((x, i) => Math.round(x + (B[i] - x) * k));
    return (mixCache[key] = '#' + v.map((x) => x.toString(16).padStart(2, '0')).join(''));
  }
  const rgba = (c, a) => {
    const v = hexRgb(c);
    return `rgba(${v[0]},${v[1]},${v[2]},${a})`;
  };
  function h3(a, b, c) {
    let h = Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul(b | 0, 0x165667b1) ^ Math.imul(c | 0, 0x9e3779b1);
    h ^= h >>> 15;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  function view(o) {
    const cy = Math.cos(o.yaw || 0), sy = Math.sin(o.yaw || 0);
    const cp = Math.cos(o.pitch || 0), sp = Math.sin(o.pitch || 0);
    const cs = Math.cos(o.spin || 0), ss = Math.sin(o.spin || 0);
    const s = o.scale, x0 = o.x, y0 = o.y;
    const rot = (p, out) => {
      const x = p[0] * cy + p[2] * sy;
      const z = -p[0] * sy + p[2] * cy;
      const y2 = p[1] * cp - z * sp;
      const z2 = p[1] * sp + z * cp;
      const Y = -y2;
      out[0] = x * cs - Y * ss;
      out[1] = x * ss + Y * cs;
      out[2] = z2;
      return out;
    };
    return {
      s,
      pt(p) {
        const r = rot(p, [0, 0, 0]);
        r[0] = x0 + r[0] * s;
        r[1] = y0 + r[1] * s;
        r[2] *= s;
        return r;
      },
      dir(n) {
        return rot(n, [0, 0, 0]);
      },
    };
  }

  const norm3 = (v) => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  const lightVec = (a, up) => norm3([Math.cos(a) * 0.72, Math.sin(a) * 0.72, up == null ? 0.7 : up]);

  function polyPath(ctx, P) {
    ctx.moveTo(P[0][0], P[0][1]);
    for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]);
    ctx.closePath();
  }

  function star4(ctx, x, y, R, a, rot) {
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

  const GOLD = {
    deep: '#8A4A17',
    shade: '#B8732A',
    mid: '#DC9E3C',
    base: '#F2C14E',
    light: '#F9DC88',
    hi: '#FFF6D5',
    crease: '#6E3A12',
  };
  const VELVET_ENV = '#2A3A78';
  const TONE_UP = [GOLD.deep, GOLD.shade, GOLD.mid, GOLD.base, GOLD.light, GOLD.hi];
  const TONE_IX = {};
  TONE_UP.forEach((c, i) => (TONE_IX[c] = i));

  const RO = 0.5;
  const BW = 0.082;
  const TH = 0.046;

  const bandCache = {};
  function bandGeo(N, CS_OUT) {
    const key = N + ':' + CS_OUT;
    if (bandCache[key]) return bandCache[key];
    const M = CS_OUT + 2;
    const cs = (th) => {
      const out = [];
      const bulge = 0.006;
      for (let k = 0; k < CS_OUT; k++) {
        const s = (2 * k) / (CS_OUT - 1) - 1;
        const a = (s * BW) / 2;
        const r = RO - bulge * 0.6 + bulge * (1 - s * s) - (Math.abs(s) > 0.99 ? 0.003 : 0);
        out.push([r, a]);
      }
      out.push([RO - th, BW / 2]);
      out.push([RO - th, -BW / 2]);
      return out;
    };
    const fn = [];
    for (let k = 0; k < CS_OUT - 1; k++) {
      const s = ((2 * (k + 0.5)) / (CS_OUT - 1) - 1);
      fn.push(norm3([1, s * 1.5, 0]).slice(0, 2));
    }
    fn.push([0, 1]);
    fn.push([-1, 0]);
    fn.push([0, -1]);
    const group = [];
    for (let k = 0; k < CS_OUT - 1; k++) group.push(0);
    group.push(1, 2, 3);
    const P = [];
    const TH_ = [];
    for (let i = 0; i < N; i++) {
      const th = (i / N) * TAU - Math.PI / 2;
      const up = Math.max(0, Math.sin(th));
      const thick = TH * (1 + 0.3 * Math.pow(up, 6));
      TH_.push(th);
      const c = Math.cos(th), s = Math.sin(th);
      const row = cs(thick).map(([r, a]) => [c * r, s * r, a]);
      P.push(row);
    }
    return (bandCache[key] = { N, M, P, fn, group, TH: TH_ });
  }

  const D_TABLE = 0.56, D_CROWN = 0.33, D_STAR_R = 0.8, D_STAR_Y = 0.2, D_GIRD = 0.03, D_PAV = 0.86, D_Q_R = 0.47;
  let DIAMOND = null;
  function diamondGeo() {
    if (DIAMOND) return DIAMOND;
    const V = [];
    const add = (r, ang, y) => (V.push([Math.cos(ang) * r, y, Math.sin(ang) * r]), V.length - 1);
    const d45 = Math.PI / 4, d22 = Math.PI / 8;
    const T = [], S = [], Gt = [], Gb = [], Q = [];
    for (let k = 0; k < 8; k++) T.push(add(D_TABLE, k * d45, D_CROWN));
    for (let k = 0; k < 8; k++) S.push(add(D_STAR_R, (k + 0.5) * d45, D_STAR_Y));
    for (let j = 0; j < 16; j++) Gt.push(add(1, j * d22, D_GIRD));
    for (let j = 0; j < 16; j++) Gb.push(add(1, j * d22, -D_GIRD));
    for (let k = 0; k < 8; k++) Q.push(add(D_Q_R, (k + 0.5) * d45, -D_GIRD - D_PAV * (1 - D_Q_R) - 0.02));
    const C = add(0, 0, -D_GIRD - D_PAV);
    const F = [];
    const face = (idx, kind, k) => F.push({ idx, kind, id: F.length, k: k || 0 });
    face(T.slice(), 'table');
    for (let k = 0; k < 8; k++) {
      const k1 = (k + 1) % 8, km = (k + 7) % 8;
      face([T[k], T[k1], S[k]], 'star', k);
      face([T[k], S[km], Gt[2 * k], S[k]], 'kite', k);
      face([S[k], Gt[2 * k], Gt[2 * k + 1]], 'ug', 2 * k);
      face([S[k], Gt[2 * k + 1], Gt[(2 * k + 2) % 16]], 'ug', 2 * k + 1);
      face([C, Q[km], Gb[2 * k], Q[k]], 'main', k);
      face([Q[k], Gb[2 * k], Gb[2 * k + 1]], 'lg', 2 * k);
      face([Q[k], Gb[2 * k + 1], Gb[(2 * k + 2) % 16]], 'lg', 2 * k + 1);
    }
    for (let j = 0; j < 16; j++) face([Gt[j], Gt[(j + 1) % 16], Gb[(j + 1) % 16], Gb[j]], 'girdle');
    for (const f of F) {
      let nx = 0, ny = 0, nz = 0, cx = 0, cy = 0, cz = 0;
      const n = f.idx.length;
      for (let i = 0; i < n; i++) {
        const a = V[f.idx[i]], b = V[f.idx[(i + 1) % n]];
        nx += (a[1] - b[1]) * (a[2] + b[2]);
        ny += (a[2] - b[2]) * (a[0] + b[0]);
        nz += (a[0] - b[0]) * (a[1] + b[1]);
        cx += a[0] / n;
        cy += a[1] / n;
        cz += a[2] / n;
      }
      let N = norm3([nx, ny, nz]);
      if (N[0] * cx + N[1] * (cy + 0.2) + N[2] * cz < 0) N = [-N[0], -N[1], -N[2]];
      f.n = N;
      f.c = [cx, cy, cz];
    }
    DIAMOND = { V, F, T, S, Gt, Gb, Q, C };
    return DIAMOND;
  }

  const DR = 0.215;
  const D_Y = RO + 0.012 + (D_GIRD + D_PAV) * DR;
  const D_TWIST = 0.19;

  function goldTone(n, Lv, envMix) {
    const d = n[0] * Lv[0] + n[1] * Lv[1] + n[2] * Lv[2];
    const rx = 2 * n[2] * n[0], ry = 2 * n[2] * n[1], rz = 2 * n[2] * n[2] - 1;
    const spec = rx * Lv[0] + ry * Lv[1] + rz * Lv[2];
    if (spec > 0.95) return GOLD.hi;
    const b = 0.6 * d - 0.4 * ry;
    let c;
    if (b > 0.8 || spec > 0.88) c = GOLD.light;
    else if (b > 0.3) c = GOLD.base;
    else if (b > -0.04) c = GOLD.mid;
    else if (b > -0.4) c = GOLD.shade;
    else c = GOLD.deep;
    if (ry > 0.5 && c !== GOLD.light && c !== GOLD.base) c = envMix[c];
    return c;
  }

  function drawBand(ctx, V, o, Lv, envMix, lw, big) {
    const G = bandGeo(o.N, o.cs);
    const { N, M, P, fn, group } = G;
    const S = new Array(N);
    for (let i = 0; i < N; i++) {
      const row = P[i];
      const sr = new Array(M);
      for (let k = 0; k < M; k++) sr[k] = V.pt(row[k]);
      S[i] = sr;
    }
    const c0 = V.pt([0, 0, 0]);
    const lightA = Math.atan2(Lv[1], Lv[0]);
    const faces = [];
    const vis = new Uint8Array(N * M);
    for (let i = 0; i < N; i++) {
      const th = ((i + 0.5) / N) * TAU - Math.PI / 2;
      const c = Math.cos(th), s = Math.sin(th);
      for (let k = 0; k < M; k++) {
        const [nr, na] = fn[k];
        const n = V.dir([c * nr, s * nr, na]);
        if (n[2] <= 0.0) continue;
        const i1 = (i + 1) % N, k1 = (k + 1) % M;
        const q = [S[i][k], S[i1][k], S[i1][k1], S[i][k1]];
        const z = (q[0][2] + q[1][2] + q[2][2] + q[3][2]) / 4;
        vis[i * M + k] = 1;
        let col = goldTone(n, Lv, envMix);
        const cx = (q[0][0] + q[2][0]) / 2 - c0[0], cy = (q[0][1] + q[2][1]) / 2 - c0[1];
        const dA = Math.abs(((Math.atan2(cy, cx) - lightA + Math.PI * 3) % TAU) - Math.PI);
        const side = group[k] === 1 || group[k] === 3;
        const g = group[k];
        let bump = 0;
        if (g !== 2) {
          if (dA < (side ? 0.2 : 0.13)) bump = 2;
          else if (dA < (side ? 0.55 : 0.4)) bump = 1;
          else if (side && dA > Math.PI - 0.3) bump = 1;
        }
        if (bump) col = TONE_UP[Math.min(5, (TONE_IX[col] == null ? 3 : TONE_IX[col]) + bump)];
        faces.push({ i, k, q, z, col });
      }
    }
    faces.sort((a, b) => a.z - b.z);
    ctx.beginPath();
    for (const f of faces) polyPath(ctx, f.q);
    ctx.fillStyle = INK;
    ctx.strokeStyle = INK;
    ctx.lineJoin = 'round';
    ctx.lineWidth = lw * 2;
    ctx.fill();
    ctx.stroke();
    const isVis = (i, k) => vis[((i + N) % N) * M + ((k + M) % M)] === 1;
    let run = null;
    let lines = [];
    let creases = [];
    const flush = () => {
      if (!run) return;
      ctx.fillStyle = run.col;
      ctx.fill(run.path);
      if (big) {
        ctx.strokeStyle = run.col;
        ctx.lineWidth = 0.9;
        ctx.stroke(run.path);
      }
      if (creases.length) {
        ctx.beginPath();
        for (const [a, b] of creases) {
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
        }
        ctx.strokeStyle = GOLD.crease;
        ctx.lineCap = 'round';
        ctx.lineWidth = lw * 0.55;
        ctx.stroke();
      }
      if (lines.length) {
        ctx.beginPath();
        for (const [a, b] of lines) {
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
        }
        ctx.strokeStyle = INK;
        ctx.lineCap = 'round';
        ctx.lineWidth = lw;
        ctx.stroke();
      }
      run = null;
      lines = [];
      creases = [];
    };
    for (const f of faces) {
      if (!run || run.col !== f.col) {
        flush();
        run = { col: f.col, path: new Path2D() };
      }
      const p = run.path;
      p.moveTo(f.q[0][0], f.q[0][1]);
      p.lineTo(f.q[1][0], f.q[1][1]);
      p.lineTo(f.q[2][0], f.q[2][1]);
      p.lineTo(f.q[3][0], f.q[3][1]);
      p.closePath();
      const { i, k } = f;
      const g = group[k];
      const gPrev = group[(k + M - 1) % M], gNext = group[(k + 1) % M];
      const e0 = [f.q[0], f.q[1]], e1 = [f.q[3], f.q[2]];
      if (!isVis(i, k - 1)) lines.push(e0);
      else if (gPrev !== g) creases.push(e0);
      if (!isVis(i, k + 1)) lines.push(e1);
      else if (gNext !== g) creases.push(e1);
      if (!isVis(i - 1, k)) lines.push([f.q[0], f.q[3]]);
      if (!isVis(i + 1, k)) lines.push([f.q[1], f.q[2]]);
    }
    flush();
  }

  function bandStreaks(ctx, V, Lv, size) {
    const nz = V.dir([0, 0, 1])[2];
    if (Math.abs(nz) < 0.22) return;
    const a = nz > 0 ? BW / 2 : -BW / 2;
    const c0 = V.pt([0, 0, 0]);
    const lightA = Math.atan2(Lv[1], Lv[0]);
    const rc = RO - TH * 0.5;
    let best = 0, bd = 9;
    for (let i = 0; i < 90; i++) {
      const th = (i / 90) * TAU;
      const p = V.pt([Math.cos(th) * rc, Math.sin(th) * rc, a]);
      const d = Math.abs(((Math.atan2(p[1] - c0[1], p[0] - c0[0]) - lightA + Math.PI * 3) % TAU) - Math.PI);
      if (d < bd) (bd = d), (best = th);
    }
    const streak = (th0, span, wK, col, alpha) => {
      const n = 18;
      const L = [], R = [];
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        const th = th0 + (u - 0.5) * span;
        const w = TH * wK * Math.pow(Math.sin(Math.PI * u), 0.7);
        const r0 = rc + TH * 0.08;
        L.push(V.pt([Math.cos(th) * (r0 + w), Math.sin(th) * (r0 + w), a]));
        R.push(V.pt([Math.cos(th) * (r0 - w), Math.sin(th) * (r0 - w), a]));
      }
      ctx.beginPath();
      polyPath(ctx, L.concat(R.reverse()));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = col;
      ctx.fill();
      ctx.globalAlpha = 1;
    };
    const k = Math.abs(nz);
    streak(best, 0.9, 0.34, GOLD.hi, 0.95 * k);
    streak(best + Math.PI, 0.5, 0.18, GOLD.light, 0.75 * k);
    void size;
  }

  function drawDiamond(ctx, V, o, Lv, lw, big, t) {
    const G = diamondGeo();
    const cT = Math.cos(D_TWIST), sT = Math.sin(D_TWIST);
    const toWorld = (p) => {
      const x = p[0] * cT - p[2] * sT, z = p[0] * sT + p[2] * cT;
      return [x * DR, D_Y + p[1] * DR, z * DR];
    };
    const SP = G.V.map((p) => V.pt(toWorld(p)));
    const centre = V.pt([0, D_Y, 0]);
    const pts = SP.map((p) => [p[0], p[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (O, A, B) => (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
    const lo = [], hi = [];
    for (const p of pts) {
      while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
      lo.push(p);
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop();
      hi.push(p);
    }
    const hull = lo.slice(0, -1).concat(hi.slice(0, -1));
    const shimmer = 0.04 * Math.sin(t * 1.7) + 0.025 * Math.sin(t * 2.9 + 1.3);
    const Ls = lightVec(o.light + shimmer, 0.62);
    const facets = G.F.map((f) => {
      const wn = toWorld([f.n[0], f.n[1] / 1, f.n[2]]);
      const n = norm3(V.dir([wn[0], wn[1] - D_Y, wn[2]]));
      const P = f.idx.map((i) => SP[i]);
      let z = 0, cx = 0, cy = 0;
      for (const p of P) {
        z += p[2] / P.length;
        cx += p[0] / P.length;
        cy += p[1] / P.length;
      }
      return { f, n, P, z, c: [cx, cy] };
    });
    ctx.beginPath();
    polyPath(ctx, hull);
    ctx.fillStyle = INK;
    ctx.strokeStyle = INK;
    ctx.lineJoin = 'round';
    ctx.lineWidth = lw * 2;
    ctx.fill();
    ctx.stroke();
    const bodyG = ctx.createLinearGradient(
      centre[0] + Ls[0] * V.s * DR, centre[1] + Ls[1] * V.s * DR,
      centre[0] - Ls[0] * V.s * DR, centre[1] - Ls[1] * V.s * DR
    );
    bodyG.addColorStop(0, '#F7FBFF');
    bodyG.addColorStop(0.55, '#CFE6F8');
    bodyG.addColorStop(1, '#93A9CC');
    ctx.fillStyle = bodyG;
    ctx.fill();
    const back = facets.filter((F) => F.n[2] <= 0).sort((a, b) => a.z - b.z);
    const BACK = ['#203466', '#4E74B0', '#9CC6EE', '#F2FAFF'];
    for (const F of back) {
      const k = F.f.id;
      const d = -(F.n[0] * Ls[0] + F.n[1] * Ls[1]);
      const v = clamp(0.5 + d * 0.9 + (h3(k, 7, 3) - 0.5) * 0.8, 0, 0.999);
      F.col = BACK[Math.floor(v * 4)];
      ctx.beginPath();
      polyPath(ctx, F.P);
      ctx.fillStyle = F.col;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (big) {
      ctx.beginPath();
      for (const F of back) polyPath(ctx, F.P);
      ctx.strokeStyle = 'rgba(230,242,255,0.4)';
      ctx.lineWidth = Math.max(0.6, lw * 0.3);
      ctx.stroke();
    }
    const front = facets.filter((F) => F.n[2] > 0).sort((a, b) => a.z - b.z);
    let best = null;
    for (const F of front) {
      const n = F.n;
      const rx = 2 * n[2] * n[0], ry = 2 * n[2] * n[1], rz = 2 * n[2] * n[2] - 1;
      F.spec = rx * Ls[0] + ry * Ls[1] + rz * Ls[2];
      F.ry = ry;
      F.rx = rx;
      if (F.f.kind !== 'girdle' && (!best || F.spec > best.spec)) best = F;
    }
    const TONES = ['#2A3966', '#7E98C2', '#C6DEF3', '#EEF7FF', '#FFFFFF'];
    for (const F of front) {
      const k = F.f.id;
      const kind = F.f.kind;
      const crown = kind === 'table' || kind === 'star' || kind === 'kite' || kind === 'ug';
      const jitter = (h3(k, 11, 5) - 0.5) * 0.9;
      const alt = F.f.k % 2 ? 1 : -1;
      const rhythm = kind === 'main' ? 0.3 * alt : kind === 'kite' ? 0.16 * alt : kind === 'lg' || kind === 'ug' ? -0.12 * alt : 0;
      let v = (crown ? 0.56 : 0.46) + 0.4 * F.spec + jitter * (crown ? 1 : 0.6) + rhythm;
      if (F.ry > 0.45) v -= 0.18;
      if (F !== best && v > 0.8 && F.spec < 0.82) v = 0.79;
      let col = TONES[Math.floor(clamp(v, 0, 0.999) * 5)];
      let a = crown ? 0.92 : 0.9;
      if (F === best) (col = '#FFFFFF'), (a = 1);
      if (kind === 'girdle') (col = '#C3D3E8'), (a = 0.95);
      if (kind === 'table') (col = mix(col, '#BFE6FF', 0.5)), (a = 0.42);
      if (col === TONES[0] && o.env) col = mix(col, o.env, 0.3);
      F.col = col;
      ctx.beginPath();
      polyPath(ctx, F.P);
      ctx.globalAlpha = a;
      ctx.fillStyle = col;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (big) {
      const FIRE = ['#FF3B5C', '#FF8A1F', '#FFD21F', '#2FD67A', '#2E9BFF', '#8A4DFF'];
      for (const F of front) {
        if (F.f.kind === 'girdle' || F === best) continue;
        const k = F.f.id;
        const w = Math.exp(-Math.pow((F.spec - 0.55) / 0.16, 2)) * (0.4 + 0.6 * h3(k, 3, 9));
        if (w < 0.32) continue;
        const hue = Math.floor(((Math.atan2(F.ry, F.rx) / TAU + 1 + h3(k, 5, 1)) * 6) % 6);
        const n = F.P.length;
        const vtx = Math.floor(h3(k, 2, 8) * n);
        const A = F.P[vtx], B = F.P[(vtx + 1) % n], Cc = F.P[(vtx + n - 1) % n];
        const lb = 0.55 + 0.35 * h3(k, 9, 2), lc = 0.18 + 0.12 * h3(k, 4, 4);
        ctx.beginPath();
        ctx.moveTo(lerp(A[0], F.c[0], 0.15), lerp(A[1], F.c[1], 0.15));
        ctx.lineTo(lerp(A[0], B[0], lb), lerp(A[1], B[1], lb));
        ctx.lineTo(lerp(lerp(A[0], Cc[0], lc), F.c[0], 0.2), lerp(lerp(A[1], Cc[1], lc), F.c[1], 0.2));
        ctx.closePath();
        ctx.globalAlpha = Math.min(0.9, w + 0.2);
        ctx.fillStyle = FIRE[hue];
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    if (big) {
      ctx.beginPath();
      for (const F of front) if (F.f.kind !== 'girdle') polyPath(ctx, F.P);
      ctx.strokeStyle = 'rgba(240,248,255,0.62)';
      ctx.lineWidth = Math.max(0.6, lw * 0.32);
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    ctx.beginPath();
    for (const ring of [G.Gt, G.Gb]) {
      for (let j = 0; j < 16; j++) {
        const a = SP[ring[j]], b = SP[ring[(j + 1) % 16]];
        if (a[2] + b[2] < 2 * centre[2]) continue;
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
      }
    }
    ctx.strokeStyle = 'rgba(31,23,18,0.55)';
    ctx.lineWidth = Math.max(0.6, lw * 0.45);
    ctx.lineCap = 'round';
    ctx.stroke();
    if (best) {
      const R = V.s * DR * 0.5;
      const g = ctx.createRadialGradient(best.c[0], best.c[1], 0, best.c[0], best.c[1], R);
      g.addColorStop(0, 'rgba(255,255,255,0.55)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.save();
      ctx.beginPath();
      polyPath(ctx, hull);
      ctx.clip();
      ctx.fillStyle = g;
      ctx.fillRect(best.c[0] - R, best.c[1] - R, 2 * R, 2 * R);
      ctx.restore();
    }
    return { hull, best: best ? best.c : [centre[0], centre[1]], centre };
  }

  const PRONG_PATH = [
    [0.26, -1.0],
    [0.5, -0.66],
    [0.8, -0.34],
    [1.02, -0.06],
    [1.06, 0.05],
    [1.0, 0.12],
    [0.9, 0.13],
  ];
  const PRONGS = 6;
  function prongPoints(V, k) {
    const ang = (k / PRONGS) * TAU + Math.PI / PRONGS + D_TWIST;
    const c = Math.cos(ang), s = Math.sin(ang);
    const pts = PRONG_PATH.map(([r, y]) => V.pt([c * r * DR, D_Y + y * DR, s * r * DR]));
    const n = V.dir([c, 0.25, s]);
    return { pts, n, z: V.pt([c * DR, D_Y, s * DR])[2] };
  }
  function strokePts(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    const e = pts[pts.length - 1];
    ctx.lineTo(e[0], e[1]);
    ctx.stroke();
  }
  function drawProng(ctx, P, Lv, envMix, lw, pw) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = INK;
    ctx.lineWidth = pw + lw * 2;
    strokePts(ctx, P.pts);
    ctx.strokeStyle = goldTone(norm3(P.n), Lv, envMix);
    ctx.lineWidth = pw;
    strokePts(ctx, P.pts);
    if (pw > 3) {
      const ox = Lv[0] * pw * 0.22, oy = Lv[1] * pw * 0.22;
      ctx.strokeStyle = rgba(GOLD.hi, 0.8);
      ctx.lineWidth = pw * 0.28;
      strokePts(ctx, P.pts.slice(1).map((p) => [p[0] + ox, p[1] + oy]));
    }
  }
  function galleryPts(V, y, r, n) {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * TAU;
      out.push(V.pt([Math.cos(a) * r * DR, D_Y + y * DR, Math.sin(a) * r * DR]));
    }
    return out;
  }
  function drawGallery(ctx, pts, front, cz, lw, pw, col) {
    const segs = [];
    let cur = null;
    for (const p of pts) {
      const isF = p[2] >= cz;
      if (isF === front) {
        if (!cur) segs.push((cur = []));
        cur.push(p);
      } else cur = null;
    }
    ctx.lineCap = 'round';
    for (const s of segs) {
      if (s.length < 2) continue;
      ctx.strokeStyle = INK;
      ctx.lineWidth = pw + lw * 2;
      strokePts(ctx, s);
      ctx.strokeStyle = col;
      ctx.lineWidth = pw;
      strokePts(ctx, s);
    }
  }

  function smallRing(ctx, V, o, size, Lv, lw, sparkle, t, shadow) {
    const rr = RO - TH * 0.5;
    const pts = [];
    for (let i = 0; i <= 28; i++) {
      const a = (i / 28) * TAU - Math.PI / 2;
      pts.push(V.pt([Math.cos(a) * rr, Math.sin(a) * rr, 0]));
    }
    const bw = Math.max(1.3, size * 0.085);
    if (shadow > 0) {
      const b = V.pt([0, -RO, 0]);
      ctx.fillStyle = `rgba(12,10,24,${0.4 * shadow})`;
      ctx.beginPath();
      ctx.ellipse(b[0], b[1] + bw * 0.4, size * 0.4, size * 0.09 + 0.6, 0, 0, TAU);
      ctx.fill();
    }
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
    };
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    path();
    ctx.strokeStyle = INK;
    ctx.lineWidth = bw + lw * 2;
    ctx.stroke();
    path();
    ctx.strokeStyle = GOLD.mid;
    ctx.lineWidth = bw;
    ctx.stroke();
    const lit = Math.atan2(Lv[1], Lv[0]);
    ctx.beginPath();
    let started = false;
    for (const p of pts) {
      const c = V.pt([0, 0, 0]);
      const a = Math.atan2(p[1] - c[1], p[0] - c[0]);
      let d = Math.abs(((a - lit + Math.PI * 3) % TAU) - Math.PI);
      if (d < 1.4) {
        if (!started) ctx.moveTo(p[0], p[1]), (started = true);
        else ctx.lineTo(p[0], p[1]);
      } else started = false;
    }
    ctx.strokeStyle = GOLD.base;
    ctx.lineWidth = bw * 0.75;
    ctx.stroke();
    const k = 1.45;
    const c = V.pt([0, D_Y, 0]);
    const r = DR * size * k;
    const spin = o.spin || 0;
    const cs = Math.cos(spin), sn = Math.sin(spin);
    const Q = (x, y) => [c[0] + (x * cs - y * sn) * r, c[1] + (x * sn + y * cs) * r];
    const halo = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], r * 2.4);
    halo.addColorStop(0, 'rgba(225,242,255,0.55)');
    halo.addColorStop(1, 'rgba(191,230,255,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(c[0] - r * 2.4, c[1] - r * 2.4, r * 4.8, r * 4.8);
    const outline = [Q(-1, 0), Q(-0.6, -0.42), Q(0.6, -0.42), Q(1, 0), Q(0, 0.95)];
    ctx.beginPath();
    polyPath(ctx, outline);
    ctx.fillStyle = '#E8F4FF';
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw;
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    polyPath(ctx, [Q(0, 0), Q(1, 0), Q(0, 0.95)]);
    ctx.fillStyle = '#9DB9DE';
    ctx.fill();
    ctx.beginPath();
    polyPath(ctx, [Q(-0.6, -0.42), Q(0.1, -0.42), Q(-0.3, 0), Q(-1, 0)]);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    const hot = Q(-0.35 + 0.25 * Lv[0], -0.2);
    if (sparkle > 0) {
      const R = sparkle * clamp(size * 0.75, 8, GLINT_MAX / 2);
      star4(ctx, hot[0], hot[1], R, sparkle, 0.08 * Math.sin(t * 0.7) + spin);
    }
    return { diamond: [c[0], c[1]], glint: hot, top: Q(0, -0.42)[1], r };
  }

  function diamondRing(ctx, o) {
    o = o || {};
    const size = Math.max(2, o.size || 100);
    const alpha = o.alpha == null ? 1 : clamp(o.alpha);
    if (alpha <= 0) return null;
    const t = o.t || 0;
    const light = o.light == null ? -0.9 : o.light;
    const env = o.env || VELVET_ENV;
    const sparkle = clamp(o.sparkle || 0);
    const shadow = o.shadow == null ? 0.6 : clamp(o.shadow);
    const big = size >= 60;
    const lw = o.lw != null ? o.lw : clamp(size * 0.0075, size < 30 ? 0.6 : 1, 6);
    const V = view({ x: o.x || 0, y: o.y || 0, scale: size, yaw: o.rot == null ? 0.55 : o.rot, pitch: o.tilt == null ? 0.22 : o.tilt, spin: o.spin || 0 });
    const Lv = lightVec(light);
    const envMix = {};
    for (const k of Object.keys(GOLD)) envMix[GOLD[k]] = mix(GOLD[k], env, 0.3);
    ctx.save();
    if (alpha < 1) ctx.globalAlpha *= alpha;
    if (size < 44) {
      const out = smallRing(ctx, V, o, size, Lv, lw, sparkle, t, shadow);
      ctx.restore();
      return out;
    }
    if (shadow > 0) {
      const b = V.pt([0, -RO, 0]);
      const rx = size * 0.42, ry = size * (0.05 + 0.2 * Math.abs(Math.sin(o.tilt == null ? 0.22 : o.tilt)));
      ctx.save();
      ctx.translate(b[0], b[1] + lw);
      ctx.scale(1, ry / rx);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, `rgba(12,10,24,${0.55 * shadow})`);
      g.addColorStop(0.45, `rgba(12,10,24,${0.25 * shadow})`);
      g.addColorStop(1, 'rgba(12,10,24,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    const N = size >= 80 ? Math.round(clamp(size * 0.28, 72, 360) / 4) * 4 : 40;
    drawBand(ctx, V, { N, cs: size >= 400 ? 11 : size >= 150 ? 7 : 5 }, Lv, envMix, lw, big);
    bandStreaks(ctx, V, Lv, size);
    const pw = Math.max(0.8, size * DR * 0.1);
    const centre = V.pt([0, D_Y, 0]);
    const prongs = [];
    for (let k = 0; k < PRONGS; k++) prongs.push(prongPoints(V, k));
    const gal = galleryPts(V, -0.52, 0.62, 32);
    const galCol = goldTone(V.dir([0, 0.3, 1]), Lv, envMix);
    {
      const a = galleryPts(V, -1.02, 0.27, 20), b = galleryPts(V, -0.84, 0.4, 20);
      const all = a.concat(b).map((p) => [p[0], p[1]]).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
      const cr = (O, A, B) => (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
      const lo = [], hi = [];
      for (const p of all) {
        while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
        lo.push(p);
      }
      for (let i = all.length - 1; i >= 0; i--) {
        const p = all[i];
        while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop();
        hi.push(p);
      }
      const hull = lo.slice(0, -1).concat(hi.slice(0, -1));
      const c0 = V.pt([0, D_Y - 0.93 * DR, 0]);
      const wr = 0.4 * DR * V.s;
      const cg = ctx.createLinearGradient(c0[0] + Lv[0] * wr, c0[1] + Lv[1] * wr, c0[0] - Lv[0] * wr, c0[1] - Lv[1] * wr);
      cg.addColorStop(0, GOLD.light);
      cg.addColorStop(0.45, GOLD.base);
      cg.addColorStop(0.5, GOLD.mid);
      cg.addColorStop(1, GOLD.shade);
      ctx.beginPath();
      polyPath(ctx, hull);
      ctx.fillStyle = cg;
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw;
      ctx.lineJoin = 'round';
      ctx.fill();
      ctx.stroke();
    }
    for (const P of prongs) if (P.z < centre[2]) drawProng(ctx, P, Lv, envMix, lw, pw);
    drawGallery(ctx, gal, false, centre[2], lw, pw * 0.8, galCol);
    const D = drawDiamond(ctx, V, { light, env }, Lv, lw, big, t);
    drawGallery(ctx, gal, true, centre[2], lw, pw * 0.8, galCol);
    for (const P of prongs) if (P.z >= centre[2]) drawProng(ctx, P, Lv, envMix, lw, pw);
    if (sparkle > 0) {
      const R = sparkle * (size >= 300 ? Math.min(size * 0.3, 230) : clamp(size * 0.34, 7, GLINT_MAX / 2));
      const warm = ctx.createRadialGradient(D.best[0], D.best[1], 0, D.best[0], D.best[1], R * 0.9);
      warm.addColorStop(0, `rgba(255,214,140,${0.35 * sparkle})`);
      warm.addColorStop(1, 'rgba(255,214,140,0)');
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = warm;
      ctx.fillRect(D.best[0] - R, D.best[1] - R, 2 * R, 2 * R);
      ctx.restore();
      star4(ctx, D.best[0], D.best[1], R, sparkle, 0.08 * Math.sin(t * 0.7) + (o.spin || 0));
    }
    ctx.restore();
    let top = Infinity;
    for (const p of D.hull) top = Math.min(top, p[1]);
    return { diamond: [D.centre[0], D.centre[1]], glint: D.best, top, r: size * DR };
  }
  const GLINT_MAX = 80;
  diamondRing.GLINT_MAX = GLINT_MAX;

  const TOP = ['#1F2F5E', '#3F5F9C', '#86AEDD', '#CFE6FA', '#F4FAFF', '#FFFFFF'];
  const FIRE_TOP = ['#FF4D6A', '#FF9A2E', '#FFE04A', '#3FDB8A', '#3AA6FF', '#9A5CFF'];

  function facetLevel(ctx, cx, cy, R, rot, level, t, bright, lw, maxD, fire) {
    if (R < 2.5 || level > 14) return;
    const P = (r, a) => [cx + Math.cos(a + rot) * r * R, cy + Math.sin(a + rot) * r * R];
    const d45 = Math.PI / 4, d22 = Math.PI / 8;
    const tone = (id, base) => {
      const h = h3(level, id, 17);
      const v = base + 0.32 * Math.sin(t * 1.25 + h * TAU) + (h - 0.5) * 0.45 + bright;
      return TOP[Math.floor(clamp(v, 0, 0.999) * TOP.length)];
    };
    if (0.5 * R * 0.98 > maxD) {
      facetLevel(ctx, cx, cy, R * 0.5, rot + d22, level + 1, t, bright, lw, maxD, fire);
      return;
    }
    const fill = (pts, col, a) => {
      ctx.beginPath();
      polyPath(ctx, pts);
      ctx.globalAlpha = a;
      ctx.fillStyle = col;
      ctx.fill();
    };
    const G = (j) => P(1, j * d22);
    const Q = (k) => P(0.47, (k + 0.5) * d45);
    const T = (k) => P(0.56, k * d45);
    const S = (k) => P(0.8, (k + 0.5) * d45);
    const C = [cx, cy];
    const lines = new Path2D();
    const addL = (pts) => {
      lines.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) lines.lineTo(pts[i][0], pts[i][1]);
      lines.closePath();
    };
    const disc = [];
    for (let j = 0; j < 16; j++) disc.push(G(j));
    fill(disc, '#CFE6FA', 1);
    for (let k = 0; k < 8; k++) {
      const pts = [C, Q(k - 1), G(2 * k), Q(k)];
      fill(pts, tone(k, k % 2 ? 0.62 : 0.12), 1);
      const a = [Q(k), G(2 * k), G(2 * k + 1)], b = [Q(k), G(2 * k + 1), G(2 * k + 2)];
      fill(a, tone(20 + 2 * k, 0.42), 1);
      fill(b, tone(21 + 2 * k, 0.5), 1);
    }
    for (let k = 0; k < 8; k++) {
      const kite = [T(k), S(k - 1), G(2 * k), S(k)];
      const star = [T(k), T(k + 1), S(k)];
      const u1 = [S(k), G(2 * k), G(2 * k + 1)], u2 = [S(k), G(2 * k + 1), G(2 * k + 2)];
      fill(kite, tone(40 + k, k % 2 ? 0.78 : 0.4), 0.55);
      fill(star, tone(50 + k, 0.66), 0.6);
      fill(u1, tone(60 + 2 * k, 0.55), 0.5);
      fill(u2, tone(61 + 2 * k, 0.6), 0.5);
      addL(kite);
      addL(star);
      addL(u1);
      addL(u2);
      if (fire > 0) {
        const h = h3(level, k, 23);
        const w = Math.max(0, Math.sin(t * 1.6 + h * TAU)) * fire;
        if (h > 0.45 && w > 0.05) fill(h > 0.72 ? u1 : kite, FIRE_TOP[Math.floor(h * 97) % 6], 0.45 * w);
      }
    }
    const table = [];
    for (let k = 0; k < 8; k++) table.push(T(k));
    fill(table, tone(70, 0.7), 1);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(245,250,255,0.7)';
    ctx.lineWidth = clamp(R * 0.004, 0.8, 5);
    ctx.lineJoin = 'round';
    ctx.stroke(lines);
    facetLevel(ctx, cx, cy, R * 0.5, rot + d22, level + 1, t, bright, lw, maxD, fire);
    ctx.beginPath();
    polyPath(ctx, table);
    ctx.strokeStyle = 'rgba(245,250,255,0.85)';
    ctx.lineWidth = clamp(R * 0.005, 0.8, 6);
    ctx.stroke();
    if (level === 0 && R < 4000) {
      ctx.beginPath();
      polyPath(ctx, disc);
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw;
      ctx.stroke();
    }
  }

  function diamondFacets(ctx, o) {
    o = o || {};
    const alpha = o.alpha == null ? 1 : clamp(o.alpha);
    if (alpha <= 0) return;
    const size = Math.max(4, o.size || 600);
    const zoom = clamp(o.zoom || 0);
    const t = o.t || 0;
    const x = o.x == null ? 540 : o.x, y = o.y == null ? 540 : o.y;
    const W = FILM.W || 1080, H = FILM.H || 1080;
    const R = (size / 2) * Math.pow(64, zoom);
    const fx = 0.16 * sstep(0, 1, zoom), fy = -0.1 * sstep(0, 1, zoom);
    const cx = x - fx * (R - size / 2), cy = y - fy * (R - size / 2);
    const rot = 0.2 + zoom * 0.7 + t * 0.03;
    const maxD = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy));
    const lw = o.lw != null ? o.lw : clamp(size * 0.006, 1.5, 5);
    ctx.save();
    if (alpha < 1) ctx.globalAlpha *= alpha;
    const ga = ctx.globalAlpha;
    const white = sstep(0.74, 1, zoom);
    if (white < 1) {
      ctx.save();
      facetLevel(ctx, cx, cy, R, rot, 0, t, zoom * 0.45, lw, maxD, 1 - zoom * 0.6);
      ctx.restore();
      ctx.globalAlpha = ga;
      const bloom = sstep(0.3, 0.9, zoom) * 0.55;
      if (bloom > 0) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, 620);
        g.addColorStop(0, `rgba(255,255,255,${bloom})`);
        g.addColorStop(1, 'rgba(225,242,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      for (let i = 0; i < 5; i++) {
        const c = i / 5 + 0.08;
        const k = Math.max(0, 1 - Math.abs(zoom - c) / 0.07);
        if (k <= 0) continue;
        const a = h3(i, 3, 31) * TAU, r = 120 + 300 * h3(i, 5, 31);
        star4(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, 34 + 50 * h3(i, 7, 31), k * k, 0.1 * i);
      }
    }
    ctx.globalAlpha = ga;
    if (white > 0) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(W, H) * 0.8);
      g.addColorStop(0, `rgba(250,253,255,${white})`);
      g.addColorStop(0.6, `rgba(232,245,255,${white})`);
      g.addColorStop(1, `rgba(206,230,250,${white})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  function hull2(points) {
    const pts = points.map((p) => [p[0], p[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (pts.length < 3) return pts;
    const cr = (O, A, B) => (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
    const lo = [], hi = [];
    for (const p of pts) {
      while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
      lo.push(p);
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop();
      hi.push(p);
    }
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  }

  function drawMesh(ctx, V, faces, lw, ink) {
    const vis = [];
    for (const f of faces) {
      const n = V.dir(f.n);
      if (n[2] <= 0.0005) continue;
      const P = f.pts.map((p) => V.pt(p));
      let z = 0;
      for (const p of P) z += p[2];
      vis.push({ f, n, P, z: z / P.length + (f.bias || 0) });
    }
    vis.sort((a, b) => a.z - b.z);
    if (ink !== false) {
      ctx.beginPath();
      for (const v of vis) polyPath(ctx, v.P);
      ctx.fillStyle = INK;
      ctx.strokeStyle = INK;
      ctx.lineJoin = 'round';
      ctx.lineWidth = lw * 2;
      ctx.fill();
      ctx.stroke();
    }
    let col = null, path = null;
    const flush = () => {
      if (!path) return;
      ctx.fillStyle = col;
      ctx.fill(path);
      ctx.strokeStyle = col;
      ctx.lineWidth = 0.8;
      ctx.stroke(path);
      path = null;
    };
    for (const v of vis) {
      const c = v.f.tone(v.n);
      if (v.f.after) {
        flush();
        ctx.beginPath();
        polyPath(ctx, v.P);
        ctx.fillStyle = c;
        ctx.fill();
        v.f.after(ctx, v.P, v.n);
        continue;
      }
      if (c !== col) flush();
      if (!path) path = new Path2D();
      col = c;
      path.moveTo(v.P[0][0], v.P[0][1]);
      for (let i = 1; i < v.P.length; i++) path.lineTo(v.P[i][0], v.P[i][1]);
      path.closePath();
    }
    flush();
    return vis;
  }

  const VEL = ['#070B26', '#0D153E', '#142053', '#1D2D6C', '#2D4489', '#5069B0'];
  const SATIN = { base: '#F3EEE4', shade: '#D6CCBC', hi: '#FFFDF8' };
  function velvetTone(n, Lv) {
    const d = n[0] * Lv[0] + n[1] * Lv[1] + n[2] * Lv[2];
    const graze = 1 - Math.abs(n[2]);
    const v = 0.2 + 0.3 * d + 0.5 * graze * graze * (0.55 + 0.45 * Math.max(0, d));
    return VEL[Math.floor(clamp(v, 0, 0.999) * VEL.length)];
  }

  const sgnPow = (c, m) => (c < 0 ? -Math.pow(-c, m) : Math.pow(c, m));
  function sePt(A, B, D, e1, e2, u, v) {
    const cv = Math.cos(v), sv = Math.sin(v), cu = Math.cos(u), su = Math.sin(u);
    const p = [A * sgnPow(cv, e1) * sgnPow(cu, e2), B * sgnPow(sv, e1), D * sgnPow(cv, e1) * sgnPow(su, e2)];
    const n = norm3([sgnPow(cv, 2 - e1) * sgnPow(cu, 2 - e2) / A, sgnPow(sv, 2 - e1) / B, sgnPow(cv, 2 - e1) * sgnPow(su, 2 - e2) / D]);
    return { p, n };
  }

  const BOX = { A: 0.5, D: 0.43, HB: 0.4, HL: 0.3, E1: 0.32, E2: 0.26, NU: 48, NV: 9 };
  function boxHalf(top) {
    const { A, D, HB, HL, E1, E2, NU, NV } = BOX;
    const B = top ? HL : HB;
    const v0 = top ? 0 : -Math.PI / 2, v1 = top ? Math.PI / 2 : 0;
    const grid = [];
    for (let j = 0; j <= NV; j++) {
      const v = v0 + ((v1 - v0) * j) / NV;
      const row = [];
      for (let i = 0; i < NU; i++) {
        const u = (i / NU) * TAU + Math.PI / NU;
        const q = sePt(A, B, D, E1, E2, u, v);
        q.p[1] += HB;
        row.push(q);
      }
      grid.push(row);
    }
    const quads = [];
    for (let j = 0; j < NV; j++) {
      for (let i = 0; i < NU; i++) {
        const i1 = (i + 1) % NU;
        const a = grid[j][i], b = grid[j][i1], c = grid[j + 1][i1], d = grid[j + 1][i];
        const n = norm3([a.n[0] + b.n[0] + c.n[0] + d.n[0], a.n[1] + b.n[1] + c.n[1] + d.n[1], a.n[2] + b.n[2] + c.n[2] + d.n[2]]);
        quads.push({ pts: [a.p, b.p, c.p, d.p], n });
      }
    }
    const rim = grid[top ? 0 : NV].map((q) => q.p.slice());
    return { quads, rim };
  }
  let BOXGEO = null;
  const boxGeo = () => BOXGEO || (BOXGEO = { base: boxHalf(false), lid: boxHalf(true) });

  function hinge(p, phi) {
    const hy = BOX.HB, hz = -BOX.D;
    const dy = p[1] - hy, dz = p[2] - hz;
    const c = Math.cos(phi), s = Math.sin(phi);
    return [p[0], hy + dy * c + dz * s, hz - dy * s + dz * c];
  }
  const hingeN = (n, phi) => {
    const c = Math.cos(phi), s = Math.sin(phi);
    return [n[0], n[1] * c + n[2] * s, -n[1] * s + n[2] * c];
  };
  const shrink = (pts, k, cy) => {
    let cx = 0, cz = 0;
    for (const p of pts) (cx += p[0] / pts.length), (cz += p[2] / pts.length);
    return pts.map((p) => [cx + (p[0] - cx) * k, cy == null ? p[1] : cy, cz + (p[2] - cz) * k]);
  };

  function softShadow(ctx, x, y, rx, ry, a) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(14,10,20,${a})`);
    g.addColorStop(0.5, `rgba(14,10,20,${a * 0.5})`);
    g.addColorStop(1, 'rgba(14,10,20,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function velvetRim(ctx, hull, w, light) {
    ctx.save();
    ctx.beginPath();
    polyPath(ctx, hull);
    ctx.clip();
    ctx.strokeStyle = rgba(VEL[5], 0.42 * light);
    ctx.lineWidth = w * 2.4;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.strokeStyle = rgba('#8FA3DA', 0.3 * light);
    ctx.lineWidth = w * 0.8;
    ctx.stroke();
    ctx.restore();
  }

  function boxBase(ctx, V, Lv, lw, contents) {
    const G = boxGeo();
    const tone = (n) => velvetTone(n, Lv);
    const faces = G.base.quads.map((q) => ({ pts: q.pts, n: q.n, tone }));
    const rim = G.base.rim;
    faces.push({
      pts: rim,
      n: [0, 1, 0],
      bias: 1e6,
      tone: (n) => velvetTone(n, Lv),
      after: (c) => contents(c),
    });
    const vis = drawMesh(ctx, V, faces, lw);
    const all = [];
    for (const v of vis) for (const p of v.P) all.push(p);
    return hull2(all);
  }

  function boxLid(ctx, V, Lv, lw, phi) {
    const G = boxGeo();
    const tone = (n) => velvetTone(n, Lv);
    const faces = G.lid.quads.map((q) => ({ pts: q.pts.map((p) => hinge(p, phi)), n: hingeN(q.n, phi), tone }));
    const rim = G.lid.rim.map((p) => hinge(p, phi));
    const lining = shrink(G.lid.rim, 0.84, BOX.HB + 0.004).map((p) => hinge(p, phi));
    faces.push({
      pts: rim,
      n: hingeN([0, -1, 0], phi),
      bias: 1e6,
      tone: (n) => velvetTone(n, Lv),
      after: (c, P, n) => {
        const L = lining.map((p) => V.pt(p));
        c.beginPath();
        polyPath(c, L);
        const a = L[0], b = L[Math.floor(L.length / 2)];
        const g = c.createLinearGradient(a[0], a[1], b[0], b[1]);
        g.addColorStop(0, SATIN.shade);
        g.addColorStop(0.45, SATIN.hi);
        g.addColorStop(0.6, SATIN.base);
        g.addColorStop(1, SATIN.shade);
        c.fillStyle = g;
        c.fill();
        c.strokeStyle = rgba(VEL[0], 0.6);
        c.lineWidth = lw * 0.8;
        c.stroke();
        void P;
        void n;
      },
    });
    const vis = drawMesh(ctx, V, faces, lw);
    const all = [];
    for (const v of vis) for (const p of v.P) all.push(p);
    return hull2(all);
  }

  function ringBox(ctx, o) {
    o = o || {};
    const alpha = o.alpha == null ? 1 : clamp(o.alpha);
    if (alpha <= 0) return null;
    const size = Math.max(4, o.size || 200);
    const open = clamp(o.open || 0);
    const t = o.t || 0;
    const light = o.light == null ? -0.9 : o.light;
    const Lv = lightVec(light);
    const lw = o.lw != null ? o.lw : clamp(size * 0.014, 1.6, 4.5);
    const yaw = o.yaw == null ? 0.42 : o.yaw;
    const tilt = o.tilt == null ? 0.42 : o.tilt;
    const x = o.x || 0, y = o.y || 0, spin = o.rot || 0;
    ctx.save();
    if (alpha < 1) ctx.globalAlpha *= alpha;
    const tornThreads = (V, y, seed) => {
      ctx.strokeStyle = VEL[4];
      ctx.lineWidth = Math.max(0.8, size * 0.008);
      ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        const a = V.pt([-0.42 + 0.84 * h3(i, 40, seed), y, -BOX.D]);
        const r = h3(i, 41, seed), q = h3(i, 42, seed);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.quadraticCurveTo(a[0] + (r - 0.5) * size * 0.04, a[1] - size * 0.02 * q, a[0] + (q - 0.5) * size * 0.07, a[1] - size * (0.012 + 0.04 * r));
        ctx.stroke();
      }
    };
    const piece = (px, py, pyaw, pspin, phi, ringOn, isLid, flipLid) => {
      const V = view({ x: px, y: py, scale: size, yaw: pyaw, pitch: tilt, spin: pspin });
      softShadow(ctx, px, py + size * 0.02, size * 0.62, size * 0.13, 0.42);
      const contents = (c) => {
        const G = boxGeo();
        const cush = shrink(G.base.rim, 0.84, BOX.HB + 0.002);
        const half = (sign) => cush.map((p) => [p[0], p[1], sign > 0 ? Math.max(0, p[2]) : Math.min(0, p[2])]);
        const drawPillow = (sign) => {
          const P = half(sign).map((p) => V.pt(p));
          c.beginPath();
          polyPath(c, P);
          const a = V.pt([0, BOX.HB, sign * BOX.D * 0.84]), b = V.pt([0, BOX.HB, 0]);
          const g = c.createLinearGradient(a[0], a[1], b[0], b[1]);
          g.addColorStop(0, VEL[2]);
          g.addColorStop(0.7, VEL[3]);
          g.addColorStop(1, sign > 0 ? VEL[4] : VEL[1]);
          c.fillStyle = g;
          c.fill();
        };
        drawPillow(-1);
        const s0 = V.pt([-BOX.A * 0.8, BOX.HB, 0]), s1 = V.pt([BOX.A * 0.8, BOX.HB, 0]);
        if (ringOn) {
          const rs = size * 0.4;
          const base = V.pt([0, BOX.HB + 0.06 * 0.4, 0]);
          diamondRing(c, { x: base[0], y: base[1], size: rs, rot: pyaw, tilt, spin: pspin, t, light, sparkle: o.sparkle || 0, shadow: 0, lw: lw * 0.8 });
        }
        drawPillow(1);
        c.strokeStyle = VEL[0];
        c.lineCap = 'round';
        c.lineWidth = Math.max(1, size * 0.018);
        c.beginPath();
        c.moveTo(s0[0], s0[1]);
        c.lineTo(s1[0], s1[1]);
        c.stroke();
        c.strokeStyle = rgba(VEL[5], 0.7);
        c.lineWidth = Math.max(0.6, size * 0.006);
        c.beginPath();
        c.moveTo(s0[0], s0[1] + size * 0.012);
        c.lineTo(s1[0], s1[1] + size * 0.012);
        c.stroke();
        const CP = cush.map((p) => V.pt(p));
        c.beginPath();
        polyPath(c, CP);
        c.strokeStyle = rgba(VEL[0], 0.75);
        c.lineWidth = lw * 0.9;
        c.stroke();
      };
      if (isLid) {
        const h = boxLid(ctx, V, Lv, lw, flipLid ? Math.PI : phi);
        velvetRim(ctx, h, size * 0.02, 1);
        return h;
      }
      let hb;
      const lidAfter = phi != null && phi < Math.PI / 2;
      if (phi != null && !lidAfter) velvetRim(ctx, boxLid(ctx, V, Lv, lw, phi), size * 0.02, 1);
      hb = boxBase(ctx, V, Lv, lw, contents);
      velvetRim(ctx, hb, size * 0.02, 1);
      if (lidAfter) velvetRim(ctx, boxLid(ctx, V, Lv, lw, phi), size * 0.02, 1);
      if (phi == null) tornThreads(V, BOX.HB - 0.01, 7);
      return hb;
    };
    if (o.broken) {
      piece(x - size * 0.42, y, yaw - 0.25, spin - 0.06, null, !!o.ring, false, false);
      const lx = x + size * 0.62, ly = y + size * 0.08;
      const vo = { scale: size, yaw: yaw + 0.7, pitch: tilt, spin: spin + 0.12 };
      const foot = view(Object.assign({ x: 0, y: 0 }, vo)).pt([0, BOX.HB - BOX.HL, -2 * BOX.D]);
      const V = view(Object.assign({ x: lx - foot[0], y: ly - foot[1] }, vo));
      softShadow(ctx, lx, ly + size * 0.02, size * 0.55, size * 0.12, 0.38);
      const h = boxLid(ctx, V, Lv, lw, Math.PI);
      velvetRim(ctx, h, size * 0.02, 1);
      tornThreads(V, BOX.HB + 0.02, 3);
    } else {
      const ease = open < 1 ? 1 - Math.pow(1 - open, 2.2) : 1;
      piece(x, y, yaw, spin, ease * 1.92, !!o.ring && open > 0.05, false, false);
    }
    ctx.restore();
    return null;
  }

  function local(ctx, o, size, unit) {
    const k = size / (unit || 100);
    ctx.translate(o.x || 0, o.y || 0);
    if (o.rot) ctx.rotate(o.rot);
    ctx.scale(k, k);
    if (o.alpha != null && o.alpha < 1) ctx.globalAlpha *= clamp(o.alpha);
    return k;
  }
  const propInk = (o, size, k) => (o.lw != null ? o.lw : clamp(size * 0.028, 2, 4.5)) / k;

  function shape(ctx, build, fill, lw, shade, shadeCol, rim, rimCol) {
    ctx.beginPath();
    build(ctx);
    ctx.fillStyle = fill;
    ctx.fill();
    if (shade) {
      ctx.save();
      ctx.beginPath();
      build(ctx);
      ctx.clip();
      ctx.beginPath();
      shade(ctx);
      ctx.fillStyle = shadeCol;
      ctx.fill();
      if (rim) {
        ctx.beginPath();
        rim(ctx);
        ctx.fillStyle = rimCol;
        ctx.fill();
      }
      ctx.restore();
    }
    if (lw > 0) {
      ctx.beginPath();
      build(ctx);
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }
  const rr = (c, x, y, w, h, r) => {
    r = Math.min(r, w / 2, h / 2);
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  };
  const line = (ctx, pts, col, w, cap) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.lineCap = cap || 'round';
    ctx.stroke();
  };
  const SERIF = 'Georgia, "Times New Roman", serif';
  const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';
  function txt(ctx, str, x, y, size, col, o) {
    o = o || {};
    ctx.font = `${o.italic ? 'italic ' : ''}${o.weight || 700} ${size}px ${o.family || SANS}`;
    ctx.fillStyle = col;
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.baseline || 'alphabetic';
    ctx.fillText(str, x, y);
  }

  function eagleSeal(ctx, x, y, r, lw) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fillStyle = '#F6F0E2';
    ctx.fill();
    ctx.strokeStyle = '#2B3B5E';
    ctx.lineWidth = r * 0.12;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.78, 0, TAU);
    ctx.lineWidth = r * 0.05;
    ctx.stroke();
    ctx.fillStyle = '#2B3B5E';
    for (let i = 0; i < 13; i++) {
      const a = -Math.PI / 2 + (i / 13) * TAU;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.89, Math.sin(a) * r * 0.89, r * 0.045, 0, TAU);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.12);
    ctx.quadraticCurveTo(-r * 0.35, -r * 0.55, -r * 0.62, -r * 0.3);
    ctx.lineTo(-r * 0.46, -r * 0.24);
    ctx.lineTo(-r * 0.58, -r * 0.12);
    ctx.lineTo(-r * 0.4, -r * 0.08);
    ctx.lineTo(-r * 0.48, r * 0.04);
    ctx.quadraticCurveTo(-r * 0.2, r * 0.02, -r * 0.14, r * 0.12);
    ctx.lineTo(-r * 0.16, r * 0.42);
    ctx.lineTo(0, r * 0.56);
    ctx.lineTo(r * 0.16, r * 0.42);
    ctx.lineTo(r * 0.14, r * 0.12);
    ctx.quadraticCurveTo(r * 0.2, r * 0.02, r * 0.48, r * 0.04);
    ctx.lineTo(r * 0.4, -r * 0.08);
    ctx.lineTo(r * 0.58, -r * 0.12);
    ctx.lineTo(r * 0.46, -r * 0.24);
    ctx.lineTo(r * 0.62, -r * 0.3);
    ctx.quadraticCurveTo(r * 0.35, -r * 0.55, 0, -r * 0.12);
    ctx.closePath();
    ctx.fillStyle = '#2B3B5E';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.04, -r * 0.24, r * 0.1, r * 0.12, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r * 0.1, -r * 0.27);
    ctx.lineTo(r * 0.24, -r * 0.22);
    ctx.lineTo(r * 0.1, -r * 0.18);
    ctx.fillStyle = '#E3B04B';
    ctx.fill();
    ctx.fillStyle = '#F6F0E2';
    for (let i = -1; i <= 1; i++) ctx.fillRect(i * r * 0.07 - r * 0.02, r * 0.14, r * 0.035, r * 0.26);
    ctx.restore();
    void lw;
  }

  function envelope(ctx, o) {
    o = o || {};
    const size = Math.max(10, o.size || 240);
    const prog = clamp(o.progress || 0);
    ctx.save();
    const k = local(ctx, o, size);
    const lw = propInk(o, size, k);
    const W = 50, H = 22;
    shape(ctx, (c) => {
      c.moveTo(-W, -H);
      c.lineTo(W, -H);
      c.lineTo(W * 0.1, -H - 25);
      c.quadraticCurveTo(0, -H - 27, -W * 0.1, -H - 25);
      c.closePath();
    }, '#E4D9C3', lw, (c) => {
      c.moveTo(0, -H - 30);
      c.lineTo(W + 2, -H);
      c.lineTo(W * 0.1, -H);
      c.closePath();
    }, '#D3C6AC');
    ctx.fillStyle = '#CFC1A6';
    ctx.fillRect(-W, -H, 2 * W, 2 * H);
    const ly = -H + 3 - prog * 34;
    shape(ctx, (c) => rr(c, -W + 4, ly, 2 * W - 8, 38, 1), '#FFFDF8', lw * 0.85, (c) => {
      c.rect(-W, ly + 25, 2 * W, 2);
      c.rect(W - 18, ly, 20, 40);
    }, '#ECE6DA');
    eagleSeal(ctx, -W + 12, ly + 7, 3.6, lw);
    txt(ctx, 'DEPARTMENT OF THE ARMY', -W + 18, ly + 6, 3.2, '#2B3B5E');
    txt(ctx, 'ORDERS TO REPORT', -W + 18, ly + 10, 2.4, '#5A5A66', { weight: 600 });
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = 'rgba(70,72,86,0.45)';
      ctx.fillRect(-W + 10, ly + 15 + i * 3.2, 2 * W - 22 - (i === 3 ? 40 : (i * 7) % 15), 0.9);
    }
    shape(ctx, (c) => {
      c.moveTo(-W, -H);
      c.lineTo(W, -H);
      c.lineTo(W, H);
      c.lineTo(-W, H);
      c.closePath();
    }, '#F4EEDF', lw, (c) => {
      c.moveTo(-W, H - 5);
      c.lineTo(W, H - 1);
      c.lineTo(W, H + 2);
      c.lineTo(-W - 2, H + 2);
      c.closePath();
      c.rect(-W, -H, 3, 2 * H);
    }, '#DED3BD', (c) => c.rect(-W, -H, 2 * W, 1.6), '#FFFBF2');
    eagleSeal(ctx, -W + 9, -H + 9, 6.2, lw);
    txt(ctx, 'UNITED STATES ARMY', -W + 17, -H + 8.2, 4.6, '#2B3B5E', { weight: 800 });
    txt(ctx, 'OFFICIAL BUSINESS', -W + 17, -H + 12.6, 2.8, '#4A5470', { weight: 600 });
    ctx.strokeStyle = '#2B3B5E';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(W - 17, -H + 3.5, 13, 9);
    txt(ctx, 'POSTAGE AND', W - 10.5, -H + 7, 1.7, '#2B3B5E', { align: 'center', weight: 700 });
    txt(ctx, 'FEES PAID', W - 10.5, -H + 9.4, 1.7, '#2B3B5E', { align: 'center', weight: 700 });
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = 'rgba(60,62,76,0.55)';
      ctx.fillRect(-6, 1 + i * 4.4, i === 0 ? 30 : i === 1 ? 36 : 24, 1.4);
    }
    ctx.restore();
  }

  function priceCard(ctx, o) {
    o = o || {};
    const size = Math.max(8, o.size || 160);
    const pop = o.pop == null ? 1 : clamp(o.pop);
    if (pop <= 0) return;
    const t = o.t || 0;
    const q = pop - 1;
    const sc = pop >= 1 ? 1 : 1 + 2.9 * q * q * q + 1.9 * q * q;
    ctx.save();
    const k = local(ctx, o, size);
    const lw = propInk(o, size, k);
    ctx.rotate(Math.sin(t * 2.3) * 0.035 + (1 - pop) * 0.25 * Math.sin(pop * 9));
    ctx.scale(sc, sc);
    const th = 40;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-7, th * 0.55, 0, th + 6);
    ctx.strokeStyle = '#B12E2A';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const W = 50, H = 56, top = th;
    const tag = (c) => {
      c.moveTo(-W * 0.55, top);
      c.lineTo(W * 0.55, top);
      c.lineTo(W, top + 14);
      c.lineTo(W, top + H - 4);
      c.quadraticCurveTo(W, top + H, W - 4, top + H);
      c.lineTo(-W + 4, top + H);
      c.quadraticCurveTo(-W, top + H, -W, top + H - 4);
      c.lineTo(-W, top + 14);
      c.closePath();
    };
    shape(ctx, tag, '#F8EFD8', lw, (c) => {
      c.rect(-W - 2, top + H - 7, 2 * W + 4, 10);
      c.moveTo(W - 7, top);
      c.lineTo(W + 3, top);
      c.lineTo(W + 3, top + H);
      c.lineTo(W - 7, top + H);
      c.closePath();
    }, '#E6D6B4', (c) => c.rect(-W, top, 2 * W, 2), '#FFFBEF');
    ctx.beginPath();
    ctx.arc(0, top + 8, 3.6, 0, TAU);
    ctx.fillStyle = '#C9A44A';
    ctx.fill();
    ctx.lineWidth = lw * 0.8;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, top + 8, 1.6, 0, TAU);
    ctx.fillStyle = '#2B2018';
    ctx.fill();
    ctx.strokeStyle = 'rgba(177,46,42,0.65)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(-W + 5, top + 16);
    ctx.lineTo(-W * 0.48, top + 4.5);
    ctx.moveTo(W * 0.48, top + 4.5);
    ctx.lineTo(W - 5, top + 16);
    ctx.stroke();
    ctx.strokeRect(-W + 5, top + 17, 2 * W - 10, H - 22);
    const text = o.text == null ? '$0,000' : String(o.text);
    const fs = Math.min(22, 150 / Math.max(4, text.length));
    txt(ctx, text, 0, top + 17 + (H - 22) / 2 + fs * 0.36, fs, '#2A1B14', { family: SERIF, weight: 700, align: 'center' });
    ctx.restore();
  }

  const LEATHER = { base: '#7B4A2B', shade: '#5C341D', light: '#93603A', in: '#8A5634', inShade: '#6A3F24', stitch: '#E0C08E' };
  function wallet(ctx, o) {
    o = o || {};
    const size = Math.max(10, o.size || 220);
    const open = o.open == null ? 1 : clamp(o.open);
    ctx.save();
    const k = local(ctx, o, size);
    const lw = propInk(o, size, k);
    const W = 50, H = 42;
    const stitch = (c, x, y, w, h) => {
      ctx.save();
      ctx.setLineDash([2.2, 1.6]);
      ctx.strokeStyle = LEATHER.stitch;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      rr(c, x, y, w, h, 3);
      ctx.stroke();
      ctx.restore();
    };
    shape(ctx, (c) => rr(c, -W, -H / 2, W, H, 4), LEATHER.in, lw, (c) => c.rect(-W, H / 2 - 5, W, 6), LEATHER.inShade);
    stitch(ctx, -W + 2.5, -H / 2 + 2.5, W - 5, H - 5);
    for (let i = 0; i < 3; i++) {
      const y = -H / 2 + 9 + i * 8;
      ctx.beginPath();
      ctx.moveTo(-W + 5, y);
      ctx.quadraticCurveTo(-W / 2, y + 2.2, -5, y);
      ctx.lineTo(-5, H / 2 - 5);
      ctx.lineTo(-W + 5, H / 2 - 5);
      ctx.closePath();
      ctx.fillStyle = i % 2 ? LEATHER.base : LEATHER.light;
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw * 0.6;
      ctx.beginPath();
      ctx.moveTo(-W + 5, y);
      ctx.quadraticCurveTo(-W / 2, y + 2.2, -5, y);
      ctx.stroke();
    }
    const c = Math.cos((1 - open) * Math.PI);
    const w = W * c;
    if (Math.abs(w) > 0.5) {
      const inside = c > 0;
      shape(ctx, (cc) => {
        if (inside) rr(cc, 0, -H / 2, w, H, 4);
        else rr(cc, w, -H / 2, -w, H, 4);
      }, inside ? LEATHER.in : LEATHER.base, lw, (cc) => cc.rect(inside ? 0 : w, H / 2 - 5, Math.abs(w), 6), inside ? LEATHER.inShade : LEATHER.shade,
      (cc) => cc.rect(inside ? 0 : w, -H / 2, Math.abs(w), 2.2), LEATHER.light);
      if (inside && w > 10) {
        stitch(ctx, 2.5, -H / 2 + 2.5, w - 5, H - 5);
        ctx.save();
        ctx.scale(w / W, 1);
        ctx.beginPath();
        rr(ctx, 7, -H / 2 + 8, W - 14, H - 18, 2);
        ctx.fillStyle = 'rgba(205,225,235,0.35)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(31,23,18,0.7)';
        ctx.lineWidth = lw * 0.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(12, -H / 2 + 10);
        ctx.lineTo(20, -H / 2 + 10);
        ctx.lineTo(13, H / 2 - 12);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fill();
        ctx.restore();
      } else if (!inside) {
        stitch(ctx, w + 2.5, -H / 2 + 2.5, -w - 5, H - 5);
      }
    }
    if (open > 0.5) line(ctx, [[-W + 4, -H / 2 + 1.5], [w - 4, -H / 2 + 1.5]], 'rgba(40,22,12,0.85)', 1.6);
    line(ctx, [[0, -H / 2 + 1], [0, H / 2 - 1]], LEATHER.inShade, lw * 0.9);
    ctx.restore();
  }

  function receiptShape(c) {
    c.moveTo(-30, -50);
    c.lineTo(30, -50);
    c.lineTo(30, 46);
    for (let i = 0; i < 10; i++) c.lineTo(30 - (i + 0.5) * 6, 46 + (i % 2 ? -3 : 3)), c.lineTo(30 - (i + 1) * 6, 46);
    c.closePath();
  }
  function receipt(ctx, o) {
    o = o || {};
    const size = Math.max(6, o.size || 60);
    ctx.save();
    const k = local(ctx, o, size, 60);
    const lw = propInk(o, size, k) * 0.8;
    shape(ctx, receiptShape, '#FBF8F1', lw, (c) => c.rect(18, -52, 14, 104), '#E9E3D6', (c) => c.rect(-30, -50, 60, 2), '#FFFFFF');
    if (size >= 24) {
      txt(ctx, 'JEWELERS', 0, -38, 8, '#3A3530', { align: 'center', family: SERIF });
      txt(ctx, 'MAIN ST', 0, -29, 5, '#77706A', { align: 'center', weight: 600 });
      ctx.fillStyle = 'rgba(80,74,68,0.4)';
      for (let i = 0; i < 3; i++) ctx.fillRect(-22, -20 + i * 6, 30 - i * 6, 1.6);
      ctx.setLineDash([2, 2]);
      line(ctx, [[-24, 2], [24, 2]], 'rgba(80,74,68,0.6)', 0.8, 'butt');
      ctx.setLineDash([]);
      txt(ctx, 'PAYMENT', -24, 14, 5.4, '#4A4540', { weight: 700 });
      txt(ctx, o.text == null ? '$50.00' : String(o.text), 24, 28, 13, '#1F1712', { align: 'right', weight: 800 });
      txt(ctx, 'THANK YOU', 0, 40, 4.6, '#77706A', { align: 'center', weight: 600 });
    } else {
      ctx.fillStyle = 'rgba(80,74,68,0.5)';
      for (let i = 0; i < 4; i++) ctx.fillRect(-22, -36 + i * 14, 40 - i * 7, 4);
    }
    ctx.restore();
  }
  function receiptStack(ctx, o) {
    o = o || {};
    const size = Math.max(6, o.size || 60);
    const count = Math.max(0, o.count || 0);
    const n = Math.floor(count + 1e-9), f = count - n;
    const t = o.t || 0;
    const bounce = (p) => {
      const n1 = 7.5625, d1 = 2.75;
      if (p < 1 / d1) return n1 * p * p;
      if (p < 2 / d1) return n1 * (p -= 1.5 / d1) * p + 0.75;
      if (p < 2.5 / d1) return n1 * (p -= 2.25 / d1) * p + 0.9375;
      return n1 * (p -= 2.625 / d1) * p + 0.984375;
    };
    ctx.save();
    if (o.alpha != null && o.alpha < 1) ctx.globalAlpha *= clamp(o.alpha);
    const slot = (i) => [(o.x || 0) + (h3(i, 61, 2) - 0.5) * size * 0.22, (o.y || 0) - i * size * 0.06, (h3(i, 62, 2) - 0.5) * 0.3];
    for (let i = 0; i < n; i++) {
      const [x, y, r] = slot(i);
      receipt(ctx, { x, y, size, rot: r, text: o.text, lw: o.lw });
    }
    if (f > 0.001) {
      const [x, y, r] = slot(n);
      const b = bounce(f);
      const fall = (1 - b) * size * 1.6;
      receipt(ctx, { x: x + (1 - f) * size * 0.2, y: y - fall, size, rot: r + (1 - f) * 0.4 * Math.sin(t * 9 + n), text: o.text, lw: o.lw, alpha: Math.min(1, f * 6) });
    }
    ctx.restore();
  }

  const BALLOON_COLS = [
    ['#E5484D', '#B8323A'],
    ['#F2C14E', '#D49A2A'],
    ['#3FA37A', '#2C7C5B'],
    ['#4A7BD0', '#3459A3'],
    ['#F08BB0', '#C9668C'],
    ['#9B6BD3', '#7449A8'],
  ];
  function balloons(ctx, o) {
    o = o || {};
    const size = Math.max(6, o.size || 90);
    const count = Math.max(1, Math.round(o.count || 5));
    const t = o.t || 0;
    const x0 = o.x || 0, y0 = o.y || 0;
    const lw = o.lw != null ? o.lw : clamp(size * 0.035, 2, 4.5);
    ctx.save();
    if (o.alpha != null && o.alpha < 1) ctx.globalAlpha *= clamp(o.alpha);
    const items = [];
    for (let i = 0; i < count; i++) {
      const u = count === 1 ? 0 : i / (count - 1) - 0.5;
      const len = size * (2.0 + 0.7 * h3(i, 71, 1) - Math.abs(u) * 0.6);
      const a = -Math.PI / 2 + u * 1.1 + Math.sin(t * 0.9 + i * 1.7) * 0.05;
      const bx = x0 + Math.cos(a) * len, by = y0 + Math.sin(a) * len + Math.sin(t * 1.3 + i * 2.1) * size * 0.04;
      items.push({ i, bx, by, tilt: u * 0.35 + Math.sin(t * 1.1 + i) * 0.05, col: (o.colors && o.colors[i % o.colors.length]) || BALLOON_COLS[[0, 1, 3, 4, 2, 5][i % 6]] });
    }
    for (const b of items) {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      const mx = (x0 + b.bx) / 2 + Math.sin(t * 1.7 + b.i) * size * 0.06, my = (y0 + b.by) / 2;
      ctx.quadraticCurveTo(mx, my, b.bx, b.by + size * 0.56);
      ctx.strokeStyle = 'rgba(60,50,44,0.8)';
      ctx.lineWidth = Math.max(0.8, lw * 0.4);
      ctx.stroke();
    }
    items.sort((p, q) => q.by - p.by);
    for (const b of items) {
      const col = Array.isArray(b.col) ? b.col : [b.col, mix(b.col, INK, 0.25)];
      ctx.save();
      ctx.translate(b.bx, b.by);
      ctx.rotate(b.tilt);
      const r = size / 2;
      const body = (c) => {
        c.moveTo(0, r * 1.1);
        c.bezierCurveTo(r * 1.15, r * 0.7, r * 1.15, -r * 1.05, 0, -r * 1.05);
        c.bezierCurveTo(-r * 1.15, -r * 1.05, -r * 1.15, r * 0.7, 0, r * 1.1);
        c.closePath();
      };
      ctx.beginPath();
      ctx.moveTo(0, r * 1.06);
      ctx.lineTo(r * 0.12, r * 1.24);
      ctx.lineTo(-r * 0.12, r * 1.24);
      ctx.closePath();
      ctx.fillStyle = col[1];
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw * 0.8;
      ctx.stroke();
      shape(ctx, body, col[0], lw, (c) => {
        c.ellipse(-r * 0.55, r * 0.35, r * 0.75, r * 1.0, 0.35, 0, TAU);
      }, col[1]);
      ctx.beginPath();
      ctx.ellipse(r * 0.34, -r * 0.48, r * 0.14, r * 0.26, 0.45, 0, TAU);
      ctx.fillStyle = 'rgba(255,250,240,0.85)';
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  function banner(ctx, o) {
    o = o || {};
    const w = Math.max(40, o.w || o.size || 700);
    const h = o.h || w * 0.13;
    const t = o.t || 0;
    const text = o.text == null ? 'You did it! Congratulations!' : String(o.text);
    const x0 = (o.x || 0) - w / 2, y0 = o.y || 0;
    const lw = o.lw != null ? o.lw : clamp(w * 0.004, 1.5, 3.5);
    const sag = w * 0.035 + Math.sin(t * 1.2) * w * 0.002;
    const N = 40;
    const top = (u) => y0 + Math.sin(Math.PI * u) * sag + Math.sin(u * 9 + t * 2) * h * 0.02;
    ctx.save();
    if (o.alpha != null && o.alpha < 1) ctx.globalAlpha *= clamp(o.alpha);
    line(ctx, [[x0 - w * 0.02, y0 - h * 0.7], [x0 + w * 0.01, top(0.01)]], '#6B5440', Math.max(1, lw * 0.6));
    line(ctx, [[x0 + w * 1.02, y0 - h * 0.7], [x0 + w * 0.99, top(0.99)]], '#6B5440', Math.max(1, lw * 0.6));
    const notch = h * 0.32;
    const body = (c) => {
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const x = x0 + u * w, y = top(u);
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.lineTo(x0 + w - notch, top(1) + h / 2);
      c.lineTo(x0 + w, top(1) + h);
      for (let i = N; i >= 0; i--) {
        const u = i / N;
        c.lineTo(x0 + u * w, top(u) + h);
      }
      c.lineTo(x0 + notch, top(0) + h / 2);
      c.closePath();
    };
    shape(ctx, body, '#F4DE9A', lw, (c) => {
      for (let i = 0; i <= N; i++) c.lineTo(x0 + (i / N) * w, top(i / N) + h * 0.8);
      for (let i = N; i >= 0; i--) c.lineTo(x0 + (i / N) * w, top(i / N) + h * 1.2);
      c.closePath();
    }, '#DDBF6E', (c) => {
      for (let i = 0; i <= N; i++) c.lineTo(x0 + (i / N) * w, top(i / N) - 1);
      for (let i = N; i >= 0; i--) c.lineTo(x0 + (i / N) * w, top(i / N) + h * 0.1);
      c.closePath();
    }, '#FFF3C8');
    ctx.save();
    ctx.setLineDash([h * 0.12, h * 0.1]);
    for (const k of [0.16, 0.84]) {
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const u = 0.03 + (i / N) * 0.94;
        const x = x0 + u * w, y = top(u) + h * k;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#C9382C';
      ctx.lineWidth = Math.max(0.8, h * 0.035);
      ctx.stroke();
    }
    ctx.restore();
    const fs = h * 0.5;
    ctx.font = `800 ${fs}px ${SANS}`;
    const widths = [];
    let total = 0;
    for (const ch of text) {
      const cw = ctx.measureText(ch).width + fs * 0.04;
      widths.push(cw);
      total += cw;
    }
    const scale = Math.min(1, (w * 0.82) / total);
    let cx = x0 + w / 2 - (total * scale) / 2;
    let i = 0;
    for (const ch of text) {
      const cw = widths[i++] * scale;
      const u = (cx + cw / 2 - x0) / w;
      const y = top(u) + h * 0.5 + fs * 0.36;
      const slope = (top(u + 0.01) - top(u - 0.01)) / (w * 0.02);
      ctx.save();
      ctx.translate(cx + cw / 2, y);
      ctx.rotate(Math.atan(slope));
      ctx.scale(scale, 1);
      ctx.font = `800 ${fs}px ${SANS}`;
      ctx.textAlign = 'center';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#FFF6DA';
      ctx.lineWidth = fs * 0.12;
      ctx.strokeText(ch, 0, 0);
      ctx.fillStyle = '#B42F27';
      ctx.fillText(ch, 0, 0);
      ctx.restore();
      cx += cw;
    }
    ctx.restore();
  }

  function cake(ctx, o) {
    o = o || {};
    const size = Math.max(20, o.size || 300);
    const t = o.t || 0;
    const text = o.text == null ? 'Congratulations Sam' : String(o.text);
    ctx.save();
    const k = local(ctx, o, size);
    const lw = propInk(o, size, k);
    const W = 50, Hs = 24, D = 30;
    shape(ctx, (c) => c.ellipse(0, -1, W + 8, 7, 0, 0, TAU), '#D9D2C6', lw, (c) => c.ellipse(-4, 2, W + 8, 6, 0, 0, TAU), '#B8AE9F');
    shape(ctx, (c) => {
      c.moveTo(-W, -Hs - 2);
      c.lineTo(W, -Hs - 2);
      c.lineTo(W, -2);
      c.quadraticCurveTo(W, 0, W - 2, 0);
      c.lineTo(-W + 2, 0);
      c.quadraticCurveTo(-W, 0, -W, -2);
      c.closePath();
    }, '#F7D7DD', lw, (c) => c.rect(-W - 1, -Hs - 3, 14, Hs + 4), '#E6B7C1');
    const topF = (c) => {
      c.moveTo(-W, -Hs - 2);
      c.lineTo(-W + 9, -Hs - 2 - D);
      c.lineTo(W - 9, -Hs - 2 - D);
      c.lineTo(W, -Hs - 2);
      c.closePath();
    };
    shape(ctx, topF, '#FFF8EF', lw, (c) => {
      c.moveTo(-W, -Hs - 2);
      c.lineTo(-W + 9, -Hs - 2 - D);
      c.lineTo(-W + 15, -Hs - 2 - D);
      c.lineTo(-W + 6, -Hs - 2);
      c.closePath();
    }, '#EDE1D3');
    const pipe = (y, col, r) => {
      for (let i = 0; i <= 16; i++) {
        const x = -W + 2 + i * ((2 * W - 4) / 16);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.strokeStyle = 'rgba(31,23,18,0.55)';
        ctx.lineWidth = lw * 0.45;
        ctx.stroke();
      }
    };
    pipe(-Hs - 2, '#FFFFFF', 2.6);
    pipe(-1.5, '#FFFFFF', 2.2);
    ctx.strokeStyle = '#E5627A';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 5; i++) {
      const xa = -W + 4 + i * 18.4, xb = xa + 18.4;
      ctx.beginPath();
      ctx.moveTo(xa, -Hs + 4);
      ctx.quadraticCurveTo((xa + xb) / 2, -Hs + 13, xb, -Hs + 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(xa, -Hs + 4, 1.6, 0, TAU);
      ctx.fillStyle = '#E5627A';
      ctx.fill();
    }
    for (const [rx, ry] of [[-W + 8, -Hs - 6], [W - 8, -Hs - 6]]) {
      ctx.beginPath();
      ctx.arc(rx, ry, 4, 0, TAU);
      ctx.fillStyle = '#E5627A';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw * 0.6;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(rx + 0.6, ry - 0.4, 1.8, 0.4, 5.2);
      ctx.strokeStyle = '#B8405A';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(rx - 5, ry + 1.5, 3, 1.4, -0.4, 0, TAU);
      ctx.fillStyle = '#5FA36A';
      ctx.fill();
    }
    for (let i = -1; i <= 1; i++) {
      const cx = i * 14, cy = -Hs - 2 - D + 4;
      shape(ctx, (c) => c.rect(cx - 1.6, cy - 13, 3.2, 13), i ? '#8FB8E8' : '#F2C14E', lw * 0.6);
      const fl = 1 + 0.12 * Math.sin(t * 13 + i * 2) + 0.06 * Math.sin(t * 29 + i);
      ctx.beginPath();
      ctx.moveTo(cx, cy - 13 - 6 * fl);
      ctx.quadraticCurveTo(cx + 2.6, cy - 15, cx, cy - 13);
      ctx.quadraticCurveTo(cx - 2.6, cy - 15, cx, cy - 13 - 6 * fl);
      ctx.fillStyle = '#FFB13B';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, cy - 15.2, 0.9, 1.6 * fl, 0, 0, TAU);
      ctx.fillStyle = '#FFF4C2';
      ctx.fill();
    }
    const words = text.split(' ');
    const l1 = words.length > 1 ? words.slice(0, -1).join(' ') : text;
    const l2 = words.length > 1 ? words[words.length - 1] : '';
    ctx.save();
    ctx.translate(0, -Hs - 2 - D * 0.42);
    ctx.scale(1, 0.62);
    ctx.font = `italic 700 10px ${SERIF}`;
    const fs1 = Math.min(11, (10 * 66) / Math.max(1, ctx.measureText(l1).width));
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    for (const [str, yy, fs] of [[l1, l2 ? -2 : 4, fs1], [l2, 14, fs1 * 1.1]]) {
      if (!str) continue;
      ctx.font = `italic 700 ${fs}px ${SERIF}`;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.6;
      ctx.strokeText(str, 0, yy);
      ctx.fillStyle = '#3B6FC4';
      ctx.fillText(str, 0, yy);
    }
    ctx.restore();
    ctx.restore();
  }

  function sponge(ctx, o) {
    o = o || {};
    const size = Math.max(6, o.size || 110);
    const foam = o.foam == null ? 0.7 : clamp(o.foam);
    ctx.save();
    const k = local(ctx, o, size);
    const lw = propInk(o, size, k);
    const body = (c) => {
      c.moveTo(-48, -22);
      c.quadraticCurveTo(-50, -30, -40, -30);
      c.quadraticCurveTo(0, -26, 40, -30);
      c.quadraticCurveTo(50, -30, 48, -20);
      c.quadraticCurveTo(52, 0, 47, 22);
      c.quadraticCurveTo(46, 30, 36, 29);
      c.quadraticCurveTo(0, 33, -38, 29);
      c.quadraticCurveTo(-48, 29, -47, 20);
      c.quadraticCurveTo(-52, 0, -48, -22);
      c.closePath();
    };
    shape(ctx, body, '#F4C542', lw, (c) => {
      c.moveTo(-60, 14);
      c.quadraticCurveTo(0, 22, 60, 12);
      c.lineTo(60, 40);
      c.lineTo(-60, 40);
      c.closePath();
    }, '#D9A12B', (c) => c.rect(-50, -32, 100, 4), '#FFE07E');
    ctx.save();
    ctx.beginPath();
    body(ctx);
    ctx.clip();
    for (let i = 0; i < 46; i++) {
      const px = -42 + 84 * h3(i, 81, 1), py = -24 + 50 * h3(i, 82, 1), r = 0.9 + 2.2 * h3(i, 83, 1);
      ctx.beginPath();
      ctx.ellipse(px, py, r, r * 0.75, 0, 0, TAU);
      ctx.fillStyle = py > 14 ? '#B67E1E' : '#D29A2C';
      ctx.fill();
    }
    ctx.restore();
    if (foam > 0) {
      const n = Math.round(4 + foam * 8);
      for (let i = 0; i < n; i++) {
        const fx = -38 + 76 * (i / Math.max(1, n - 1)) + (h3(i, 84, 1) - 0.5) * 8;
        const fy = -30 - foam * 6 * h3(i, 85, 1);
        const r = (5 + 8 * h3(i, 86, 1)) * (0.6 + 0.4 * foam);
        shape(ctx, (c) => c.arc(fx, fy, r, 0, TAU), '#FFFFFF', lw * 0.7, (c) => c.arc(fx - r * 0.35, fy + r * 0.4, r * 0.85, 0, TAU), '#DCEBF3');
      }
    }
    ctx.restore();
  }

  function bubbles(ctx, o) {
    o = o || {};
    const w = o.w || 300, h = o.h || 300, size = Math.max(3, o.size || 26);
    const count = Math.max(1, Math.round(o.count || 14));
    const t = o.t || 0;
    const seed = o.seed || 1;
    ctx.save();
    if (o.alpha != null && o.alpha < 1) ctx.globalAlpha *= clamp(o.alpha);
    const lw = o.lw != null ? o.lw : clamp(size * 0.06, 1, 2.5);
    for (let i = 0; i < count; i++) {
      const r = (size / 2) * (0.45 + 0.9 * h3(i, seed, 91));
      const speed = (30 + 50 * h3(i, seed, 92)) * (size / 26) * (1.3 - r / size);
      const off = h3(i, seed, 93) * (h + 4 * r);
      const span = h + 4 * r;
      const yy = (o.y || 0) + h + 2 * r - ((t * speed + off) % span);
      const xx = (o.x || 0) + w * h3(i, seed, 94) + Math.sin(t * (1.4 + h3(i, seed, 95)) + i) * r * 0.9;
      const u = (yy - (o.y || 0)) / h;
      const a = clamp(Math.min(u * 4, (1 - u) * 6, 1));
      if (a <= 0) continue;
      ctx.globalAlpha = a * (o.alpha == null ? 1 : clamp(o.alpha));
      ctx.beginPath();
      ctx.arc(xx, yy, r, 0, TAU);
      ctx.fillStyle = 'rgba(225,245,255,0.18)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(70,96,120,0.55)';
      ctx.lineWidth = lw;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(xx, yy, r * 0.82, 1.9, 3.6);
      ctx.strokeStyle = 'rgba(255,150,200,0.55)';
      ctx.lineWidth = Math.max(1, r * 0.16);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(xx, yy, r * 0.82, 0.3, 1.5);
      ctx.strokeStyle = 'rgba(110,220,210,0.5)';
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(xx + r * 0.38, yy - r * 0.42, r * 0.2, r * 0.12, -0.7, 0, TAU);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();
    }
    ctx.restore();
  }

  function sock(ctx, o) {
    o = o || {};
    const size = Math.max(6, o.size || 120);
    ctx.save();
    const k = local(ctx, o, size);
    const lw = propInk(o, size, k);
    ctx.translate(-8, 14);
    const body = (c) => {
      c.moveTo(-13, -62);
      c.lineTo(13, -62);
      c.lineTo(13, -12);
      c.quadraticCurveTo(14, -6, 22, -6);
      c.lineTo(40, -6);
      c.quadraticCurveTo(54, -6, 54, 6);
      c.quadraticCurveTo(54, 18, 40, 18);
      c.lineTo(4, 18);
      c.quadraticCurveTo(-14, 18, -14, 0);
      c.closePath();
    };
    shape(ctx, body, '#FBF8F2', lw, (c) => {
      c.rect(-16, -64, 8, 70);
      c.moveTo(-16, 8);
      c.quadraticCurveTo(10, 14, 56, 10);
      c.lineTo(56, 22);
      c.lineTo(-16, 22);
      c.closePath();
    }, '#DCD6CB', (c) => c.rect(9, -62, 4, 50), '#FFFFFF');
    ctx.save();
    ctx.beginPath();
    body(ctx);
    ctx.clip();
    ctx.strokeStyle = 'rgba(160,150,140,0.35)';
    ctx.lineWidth = 0.7;
    for (let i = -10; i <= 10; i += 4) line(ctx, [[i, -60], [i, -14]], 'rgba(160,150,140,0.35)', 0.7);
    ctx.fillStyle = '#C9382C';
    ctx.fillRect(-14, -56, 28, 5);
    ctx.fillStyle = '#2E4170';
    ctx.fillRect(-14, -47, 28, 5);
    ctx.fillStyle = '#E6E1D8';
    ctx.beginPath();
    ctx.arc(-4, 6, 12, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(50, 6, 10, 0, TAU);
    ctx.fill();
    ctx.restore();
    line(ctx, [[-13, -58], [13, -58]], 'rgba(31,23,18,0.5)', lw * 0.5);
    ctx.beginPath();
    body(ctx);
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }

  function ductTape(ctx, o) {
    o = o || {};
    const size = Math.max(6, o.size || 120);
    const pull = clamp(o.pull || 0);
    ctx.save();
    const k = local(ctx, o, size);
    const lw = propInk(o, size, k);
    const R = 50, Ri = 30, T = 14;
    const SILVER = { base: '#BCC2C9', shade: '#8D949D', light: '#E3E7EB', dark: '#6E747C' };
    const len = pull * 150;
    if (len > 1) {
      const sag = Math.min(14, len * 0.08);
      const strip = (c) => {
        c.moveTo(0, R - 1);
        c.quadraticCurveTo(len * 0.5, R + sag, len, R + sag * 0.6);
        for (let i = 0; i <= 6; i++) c.lineTo(len + (i % 2 ? 3 : 0), R + sag * 0.6 + T * (i / 6) * 1.2);
        c.quadraticCurveTo(len * 0.5, R + sag + T * 1.2, 0, R + T * 1.1);
        c.closePath();
      };
      shape(ctx, strip, SILVER.base, lw, (c) => {
        c.moveTo(0, R + T * 0.7);
        c.quadraticCurveTo(len * 0.5, R + sag + T * 0.8, len + 4, R + sag * 0.6 + T * 0.8);
        c.lineTo(len + 4, R + sag + T * 2);
        c.lineTo(0, R + T * 2);
        c.closePath();
      }, SILVER.shade);
      ctx.save();
      ctx.beginPath();
      strip(ctx);
      ctx.clip();
      ctx.strokeStyle = 'rgba(90,96,104,0.25)';
      ctx.lineWidth = 0.6;
      for (let x = 4; x < len; x += 4) line(ctx, [[x, R - 4], [x - 3, R + sag + T * 1.3]], 'rgba(90,96,104,0.22)', 0.6);
      ctx.restore();
    }
    shape(ctx, (c) => {
      c.ellipse(T * 0.5, T * 0.35, R, R * 0.96, 0, 0, TAU);
    }, SILVER.shade, lw);
    shape(ctx, (c) => {
      c.arc(0, 0, R, 0, TAU);
      c.moveTo(Ri, 0);
      c.arc(0, 0, Ri, 0, TAU, true);
    }, SILVER.base, lw, (c) => {
      c.arc(-R * 0.25, R * 0.3, R * 0.95, 0, TAU);
    }, SILVER.shade, (c) => c.arc(R * 0.18, -R * 0.2, R * 0.82, 0, TAU), SILVER.light);
    const spin = pull * 4.2;
    for (let i = 0; i < 4; i++) {
      const r = Ri + 4 + i * 4.2;
      ctx.beginPath();
      ctx.arc(0, 0, r, spin + i * 0.9, spin + i * 0.9 + 1.4);
      ctx.strokeStyle = 'rgba(80,86,94,0.45)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    shape(ctx, (c) => {
      c.arc(0, 0, Ri, 0, TAU);
      c.moveTo(Ri - 5, 0);
      c.arc(0, 0, Ri - 5, 0, TAU, true);
    }, '#C89A62', lw * 0.8, (c) => c.arc(4, 4, Ri, 0, TAU), '#A57A47');
    ctx.beginPath();
    ctx.arc(0, 0, Ri - 5, 0, TAU);
    ctx.fillStyle = 'rgba(40,30,22,0.25)';
    ctx.fill();
    ctx.restore();
  }

  function oneCrutch(ctx, lw, back) {
    const AL = back ? { base: '#AEB4BD', shade: '#8A919B', light: '#D3D8DE' } : { base: '#C9CED6', shade: '#99A0AB', light: '#EEF1F4' };
    const rail = (side) => {
      const pts = [[0, -34], [side * 7, -60], [side * 8.5, -90], [side * 8, -96]];
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      ctx.bezierCurveTo(side * 4, -44, side * 8.5, -56, side * 8.5, -70);
      ctx.lineTo(side * 8.5, -96);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3.2 + lw * 2;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.strokeStyle = side < 0 ? AL.light : AL.base;
      ctx.lineWidth = 3.2;
      ctx.stroke();
    };
    rail(-1);
    rail(1);
    shape(ctx, (c) => rr(c, -2.2, -40, 4.4, 37, 2), AL.base, lw, (c) => c.rect(0.6, -40, 2, 37), AL.shade);
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(0, -12 - i * 5, 0.8, 0, TAU);
      ctx.fillStyle = '#4A4E55';
      ctx.fill();
    }
    shape(ctx, (c) => {
      c.moveTo(-3, -6);
      c.lineTo(3, -6);
      c.lineTo(3.8, 0);
      c.lineTo(-3.8, 0);
      c.closePath();
    }, '#3A3C40', lw);
    shape(ctx, (c) => rr(c, -10, -55, 20, 4.4, 2.2), '#4B4F57', lw, (c) => c.rect(-10, -53, 20, 3), '#35383E');
    shape(ctx, (c) => rr(c, -12, -101, 24, 7, 3.5), '#5B5F66', lw, (c) => c.rect(-12, -97, 24, 4), '#43464C', (c) => c.rect(-10, -101, 20, 1.6), '#7B8088');
  }
  function crutches(ctx, o) {
    o = o || {};
    const size = Math.max(10, o.size || 300);
    ctx.save();
    const k = local(ctx, o, size);
    const lw = propInk(o, size, k);
    if (o.pair !== false) {
      ctx.save();
      ctx.translate(-16, -1);
      ctx.rotate(-0.06);
      oneCrutch(ctx, lw, true);
      ctx.restore();
    }
    oneCrutch(ctx, lw, false);
    ctx.restore();
  }

  function rifle(ctx, o) {
    o = o || {};
    const size = Math.max(10, o.size || 260);
    ctx.save();
    const k = local(ctx, o, size);
    const lw = propInk(o, size, k);
    ctx.rotate(-Math.PI / 2);
    const GUN = { base: '#3C4044', shade: '#26292C', light: '#5C6268' };
    const OLIVE = { base: '#5E6B3A', shade: '#47512B' };
    ctx.beginPath();
    ctx.moveTo(6, -6);
    ctx.quadraticCurveTo(36, -16, 62, -5);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6 + lw * 2;
    ctx.stroke();
    ctx.strokeStyle = OLIVE.base;
    ctx.lineWidth = 2.6;
    ctx.stroke();
    shape(ctx, (c) => {
      c.moveTo(0, -6);
      c.lineTo(24, -4);
      c.lineTo(24, 3);
      c.lineTo(0, 7);
      c.closePath();
    }, GUN.base, lw, (c) => c.rect(0, 2, 26, 6), GUN.shade, (c) => c.rect(0, -6, 24, 1.5), GUN.light);
    shape(ctx, (c) => {
      c.moveTo(38, 3);
      c.lineTo(45, 3);
      c.quadraticCurveTo(46, 12, 43, 19);
      c.lineTo(37, 18);
      c.quadraticCurveTo(39.5, 11, 38, 3);
      c.closePath();
    }, GUN.base, lw, (c) => c.rect(41.5, 2, 6, 20), GUN.shade);
    shape(ctx, (c) => {
      c.moveTo(28, 3);
      c.lineTo(33, 3);
      c.lineTo(31, 12);
      c.lineTo(26.5, 11);
      c.closePath();
    }, GUN.base, lw, (c) => c.rect(30, 2, 4, 12), GUN.shade);
    shape(ctx, (c) => rr(c, 23, -4.5, 26, 8, 1.5), GUN.base, lw, (c) => c.rect(23, 1, 26, 4), GUN.shade, (c) => c.rect(23, -4.5, 26, 1.4), GUN.light);
    shape(ctx, (c) => {
      c.moveTo(27, -4.5);
      c.lineTo(28, -9);
      c.lineTo(44, -9);
      c.lineTo(45, -4.5);
      c.lineTo(42, -4.5);
      c.lineTo(41.5, -7);
      c.lineTo(30.5, -7);
      c.lineTo(30, -4.5);
      c.closePath();
    }, GUN.base, lw);
    shape(ctx, (c) => rr(c, 49, -3.6, 22, 7.2, 3), GUN.base, lw, (c) => c.rect(49, 1, 22, 3), GUN.shade);
    for (let i = 0; i < 5; i++) line(ctx, [[52 + i * 4, -2.4], [52 + i * 4, 2.4]], 'rgba(20,22,24,0.6)', 0.7);
    shape(ctx, (c) => c.rect(71, -1.2, 27, 2.4), GUN.base, lw);
    shape(ctx, (c) => {
      c.moveTo(73, -1.2);
      c.lineTo(75, -8);
      c.lineTo(77, -8);
      c.lineTo(78, -1.2);
      c.closePath();
    }, GUN.base, lw);
    shape(ctx, (c) => rr(c, 96, -1.8, 5, 3.6, 0.8), GUN.shade, lw);
    ctx.restore();
  }

  CAST.diamondRing = diamondRing;
  CAST.envelope = envelope;
  CAST.priceCard = priceCard;
  CAST.wallet = wallet;
  CAST.receipt = receipt;
  CAST.receiptStack = receiptStack;
  CAST.balloons = balloons;
  CAST.banner = banner;
  CAST.cake = cake;
  CAST.sponge = sponge;
  CAST.bubbles = bubbles;
  CAST.sock = sock;
  CAST.ductTape = ductTape;
  CAST.crutches = crutches;
  CAST.rifle = rifle;
  CAST.ringBox = ringBox;
  CAST.diamondFacets = diamondFacets;
})();
