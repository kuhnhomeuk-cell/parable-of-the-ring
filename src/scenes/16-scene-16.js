// scenes/16-scene-16.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9$]/g, '');
  function wordT(info, w, n, fb) {
    const sh = info.shot, key = norm(w);
    let k = 0;
    for (const c of sh.captions || []) {
      for (const [ft, tok] of c.words || []) {
        const lt = ft - sh.start;
        if (lt < -0.05 || norm(tok) !== key) continue;
        if (k++ === (n || 0)) return lt;
      }
    }
    return fb;
  }
  function setupAt(list, t, dur) {
    let i = 0;
    while (i + 1 < list.length && t >= list[i + 1].at) i++;
    const s = list[i];
    const t1 = i + 1 < list.length ? list[i + 1].at : dur;
    return Object.assign({ i, t0: s.at, u: Math.max(0, Math.min(1, (t - s.at) / Math.max(0.4, t1 - s.at))) }, s);
  }
  function frame(g, V, depth) {
    const d = depth == null ? 1 : depth;
    const z = V.z || 1, hz = 540 / z;
    const cx = Math.max(hz, Math.min(1080 - hz, V.c[0])), cy = Math.max(hz, Math.min(1080 - hz, V.c[1]));
    const push = Math.max(0, V.push == null ? 0.04 : V.push);
    const lim = 540 * push;
    const pan = V.pan || [0, 0];
    const k = d * V.u;
    const p = 1 + push * k;
    g.translate(540 + Math.max(-lim, Math.min(lim, pan[0])) * k, 540 + Math.max(-lim, Math.min(lim, pan[1])) * k);
    g.scale(z * p, z * p);
    g.translate(-cx, -cy);
  }

  const ID = 'scene-16';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const HOME = () => FILM.sets.home;
  const TAU = Math.PI * 2;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const lerp = (a, b, k) => a + (b - a) * k;
  const sstep = (e0, e1, x) => {
    const u = clamp01((x - e0) / (e1 - e0));
    return u * u * (3 - 2 * u);
  };
  const INK = '#1F1712';

  const GRAB = 0.32, WIND = 0.5, YANK = 0.64;
  function pulls(info) {
    const snaps = [wordT(info, 'toked', 0, 1.15), wordT(info, 'tokef', 0, 2.58), wordT(info, 'tokeh', 0, 3.35)];
    const out = [];
    let free = 0.05;
    for (const at of snaps) {
      const k = clamp01(Math.max(0.6, (at - free) / YANK));
      out.push({ c0: at - YANK * k, k, at });
      free = at + 0.25;
    }
    return out;
  }

  const JX = 430;
  const JH = 330;
  const SHADOW_K = [0.75, -0.12];

  const M = { x: 500, y: 862 };
  const STARTER = [M.x + 22, M.y - 104];

  function phase(t, PL) {
    let i = -1;
    for (let k = 0; k < 3; k++) if (t >= PL[k].c0) i = k;
    if (i < 0) return { i: -1, u: 0, snaps: 0 };
    const pre = (t - PL[i].c0) / PL[i].k;
    const u = pre < YANK ? pre : YANK + (t - PL[i].at);
    const snaps = i + (u >= YANK ? 1 : 0);
    return { i, u, snaps, snapAt: (k) => PL[k].at };
  }

  function pose(t, PL) {
    const P = phase(t, PL);
    let reach = 0, lean = 0.02, expr = 'neutral', exprAmt = 1, look = 0;
    if (P.i >= 0) {
      const u = P.u;
      const last = P.i === 2;
      if (u < YANK) {
        reach = LIB.ease.inOutSine(clamp01(u / GRAB));
        lean = lerp(0.02, 0.3, sstep(0, GRAB, u)) + 0.08 * sstep(GRAB, WIND, u);
        lean -= 0.75 * sstep(WIND, YANK, u);
        reach *= 1 - LIB.ease.inCubic(clamp01((u - WIND) / (YANK - WIND)));
        expr = u > GRAB ? 'squint' : 'neutral';
        exprAmt = 0.6;
      } else {
        const v = u - YANK;
        lean = lerp(-0.45, 0.02, sstep(0.05, 0.6, v));
        expr = v < 0.55 ? 'wide' : last ? 'smileSmall' : 'neutral';
        exprAmt = v < 0.55 ? 1 - 0.4 * sstep(0.3, 0.55, v) : last ? sstep(0.55, 0.9, v) : 1;
        look = last ? 0.35 * sstep(0.6, 1.1, v) : 0;
      }
    }
    return {
      x: JX, y: M.y, h: JH, t, age: 10, outfit: 'casual', facing: 1,
      pose: 'handshake', poseAmt: reach, lean, expr, exprAmt, look,
    };
  }

  function wheel(ctx, x, y, r, lw) {
    ctx.fillStyle = 'rgb(46,44,46)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgb(196,190,180)';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.42, 0, TAU);
    ctx.fill();
    ctx.lineWidth = lw * 0.7;
    ctx.stroke();
    ctx.lineWidth = lw;
  }

  function drawMower(ctx, t, shake) {
    const lw = 2.8;
    const { x, y } = M;
    ctx.save();
    ctx.translate(shake * Math.sin(t * 90), -Math.abs(shake * Math.sin(t * 70)) * 0.6);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(x + 170, y - 46);
    ctx.lineTo(x + 268, y - 214);
    ctx.stroke();
    ctx.strokeStyle = 'rgb(188,188,192)';
    ctx.lineWidth = 4.5;
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(x + 252, y - 214);
    ctx.lineTo(x + 292, y - 214);
    ctx.stroke();
    ctx.strokeStyle = 'rgb(40,40,40)';
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw;
    ctx.fillStyle = 'rgb(176,52,44)';
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 22);
    ctx.quadraticCurveTo(x - 6, y - 66, x + 40, y - 70);
    ctx.lineTo(x + 160, y - 70);
    ctx.quadraticCurveTo(x + 196, y - 66, x + 198, y - 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgb(130,36,32)';
    ctx.beginPath();
    ctx.moveTo(x - 6, y - 36);
    ctx.lineTo(x + 196, y - 36);
    ctx.lineTo(x + 198, y - 22);
    ctx.lineTo(x - 8, y - 22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,220,200,0.35)';
    ctx.fillRect(x + 40, y - 66, 100, 4);
    wheel(ctx, x + 20, y - 20, 20, lw);
    wheel(ctx, x + 172, y - 20, 20, lw);
    ctx.fillStyle = 'rgb(84,84,90)';
    ctx.fillRect(x + 40, y - 118, 92, 50);
    ctx.strokeRect(x + 40, y - 118, 92, 50);
    ctx.fillStyle = 'rgba(30,30,34,0.5)';
    for (let k = 0; k < 4; k++) ctx.fillRect(x + 50 + k * 20, y - 112, 8, 38);
    ctx.fillStyle = 'rgb(206,170,60)';
    ctx.fillRect(x + 104, y - 130, 20, 12);
    ctx.strokeRect(x + 104, y - 130, 20, 12);
    ctx.fillStyle = 'rgb(150,150,156)';
    ctx.beginPath();
    ctx.ellipse(STARTER[0] + 10, STARTER[1] + 12, 22, 26, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(40,40,44,0.4)';
    ctx.beginPath();
    ctx.ellipse(STARTER[0] + 6, STARTER[1] + 14, 8, 10, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function cordHandle(ctx, x, y, a) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.fillStyle = 'rgb(40,40,40)';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 5.5, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function cordLine(ctx, a, b, sag) {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + sag;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.4;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.quadraticCurveTo(mx, my, b[0], b[1]);
    ctx.stroke();
    ctx.strokeStyle = 'rgb(226,214,170)';
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }

  function drawCord(ctx, t, PL, o) {
    const P = phase(t, PL);
    const hand = FILM.cast.sam.pose(o).hands[0];
    const S0 = [STARTER[0] + 6, STARTER[1] + 14];
    if (P.i < 0 || P.u < GRAB * 0.8) {
      cordHandle(ctx, S0[0] - 12, S0[1] + 2, 0.3);
      return null;
    }
    if (P.u < YANK) {
      cordLine(ctx, S0, hand, 6 * (1 - sstep(WIND, YANK, P.u)));
      const y = sstep(WIND, YANK, P.u);
      if (y > 0.05) {
        ctx.save();
        ctx.strokeStyle = `rgba(255,248,226,${0.8 * y})`;
        ctx.lineCap = 'round';
        ctx.lineWidth = 3;
        for (const [dx, dy, l] of [[-18, -16, 46], [-26, 2, 60], [-16, 18, 40]]) {
          ctx.beginPath();
          ctx.moveTo(hand[0] + dx + 10, hand[1] + dy);
          ctx.lineTo(hand[0] + dx + 10 + l, hand[1] + dy - l * 0.35);
          ctx.stroke();
        }
        ctx.restore();
      }
      cordHandle(ctx, hand[0], hand[1], Math.atan2(hand[1] - S0[1], hand[0] - S0[0]) + Math.PI / 2);
      return null;
    }
    const v = P.u - YANK;
    const back = LIB.ease.outCubic(clamp01(v / 0.22));
    const reach = lerp(Math.hypot(hand[0] - S0[0], hand[1] - S0[1]), 16, back);
    const dir = Math.atan2(hand[1] - S0[1], hand[0] - S0[0]);
    const droop = lerp(dir, Math.PI / 2 + 0.5, back);
    const end = [S0[0] + Math.cos(droop) * reach, S0[1] + Math.sin(droop) * reach];
    cordLine(ctx, S0, end, 8 * back * (1 - back) + 3 * Math.sin(v * 14) * Math.exp(-v * 4));
    fray(ctx, end, droop);
    const sw = Math.exp(-v * 3.2) * Math.sin(v * 13);
    const ang = Math.PI / 2 - 0.3 + 0.6 * sw;
    const stub = [hand[0] + Math.cos(ang) * 18, hand[1] + Math.sin(ang) * 18];
    cordLine(ctx, hand, stub, 2);
    fray(ctx, stub, ang);
    cordHandle(ctx, hand[0], hand[1], 1.2);
    return { at: [lerp(hand[0], S0[0], 0.15), lerp(hand[1], S0[1], 0.15)], v };
  }

  function fray(ctx, p, a) {
    ctx.save();
    ctx.strokeStyle = 'rgb(226,214,170)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    for (const da of [-0.5, 0, 0.5]) {
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(p[0] + Math.cos(a + da) * 6, p[1] + Math.sin(a + da) * 6);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSnap(ctx, snap) {
    if (!snap || snap.v > 0.3) return;
    const k = snap.v / 0.3;
    const a = 1 - k;
    ctx.save();
    ctx.strokeStyle = `rgba(255,248,226,${0.95 * a})`;
    ctx.lineCap = 'round';
    ctx.lineWidth = 4;
    for (let i = 0; i < 7; i++) {
      const ang = (i / 7) * TAU + 0.3;
      const r0 = 10 + 30 * k, r1 = 26 + 46 * k;
      ctx.beginPath();
      ctx.moveTo(snap.at[0] + Math.cos(ang) * r0, snap.at[1] + Math.sin(ang) * r0);
      ctx.lineTo(snap.at[0] + Math.cos(ang) * r1, snap.at[1] + Math.sin(ang) * r1);
      ctx.stroke();
    }
    ctx.restore();
    LOOK.bloom(ctx, { x: snap.at[0], y: snap.at[1], r: 50, alpha: 0.5 * a, mid: 0.2 * a });
  }

  function drawTally(ctx, t, PL) {
    const P = phase(t, PL);
    const [tx, ty] = HOME().YARD.tally;
    ctx.save();
    ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      if (P.i < 0) break;
      const at = P.snapAt(k);
      const d = clamp01((t - at - 0.04) / 0.16);
      if (d <= 0) continue;
      const x0 = tx + 8 + k * 34, y0 = ty - 4, x1 = x0 - 6, y1 = ty + 92;
      ctx.strokeStyle = 'rgba(248,246,236,0.95)';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(lerp(x0, x1, d), lerp(y0, y1, d));
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 3;
      ctx.stroke();
      const puff = Math.sin(Math.PI * clamp01((t - at) / 0.5));
      if (puff > 0) {
        const gr = ctx.createRadialGradient(x1, y1, 0, x1, y1, 30);
        gr.addColorStop(0, `rgba(250,246,236,${0.35 * puff})`);
        gr.addColorStop(1, 'rgba(250,246,236,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(x1 - 30, y1 - 30, 60, 60);
      }
    }
    ctx.restore();
  }

  function sepia(ctx, t) {
    ctx.save();
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = 'rgb(168,124,74)';
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.globalCompositeOperation = 'multiply';
    const v = ctx.createRadialGradient(540, 520, 300, 540, 560, 820);
    v.addColorStop(0, 'rgba(255,250,240,1)');
    v.addColorStop(1, 'rgba(150,118,84,1)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.globalCompositeOperation = 'source-over';
    const f = Math.round(t * 24);
    const fl = 0.025 * (LIB.hash(ID, 'flicker', f) % 1000) / 1000;
    ctx.fillStyle = `rgba(255,240,210,${fl})`;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const C = HOME().yard(S);
      const PL = pulls(info);
      const P = phase(t, PL);
      const Y0 = HOME().YARD;
      const scr = (p) => [(p[0] - Y0.origin[0]) * Y0.zoom, (p[1] - Y0.origin[1]) * Y0.zoom];
      const tJust = wordT(info, 'tokbx', 0, 3.8);
      const head = scr(FILM.cast.sam.pose(pose(tJust, PL)).head);
      const CUT = setupAt([
        { at: 0, z: 1, c: [540, 540], push: 0.05, pan: [14, -6] },
        { at: wordT(info, 'tokee', 0, 1.83) - 0.15, z: 2.3, c: scr([STARTER[0] - 50, STARTER[1] + 10]), push: 0.07, pan: [-16, -8] },
        { at: PL[2].c0, z: 2.1, c: scr([Y0.tally[0] + 50, Y0.tally[1] + 50]), push: 0.08, pan: [-20, 0] },
        { at: tJust, z: 2, c: [head[0] + 60, head[1] + 110], push: 0.06, pan: [10, -14] },
      ], t, info.dur);
      const cam = (depth) => frame(ctx, CUT, depth);
      const shake = P.i >= 0 && P.u > WIND && P.u < YANK + 0.25 ? 2.2 * (1 - sstep(YANK, YANK + 0.25, P.u)) : 0;

      ctx.save();
      cam(0.25);
      ctx.drawImage(C.far, 0, 0, 1080, 1080);
      ctx.restore();

      ctx.save();
      cam(0.55);
      ctx.drawImage(C.mid, 0, 0, 1080, 1080);
      ctx.restore();

      ctx.save();
      cam(1);
      ctx.drawImage(C.near, 0, 0, 1080, 1080);
      const Y = HOME().YARD;
      ctx.scale(Y.zoom, Y.zoom);
      ctx.translate(-Y.origin[0], -Y.origin[1]);
      drawTally(ctx, t, PL);
      LOOK.contactShadow(ctx, { x: M.x + 96, y: M.y, h: 330, rx: 120, ry: 10, alpha: 0.35 });
      drawMower(ctx, t, shake);
      const o = pose(t, PL);
      LOOK.castShadow(ctx, { x: o.x, y: o.y, h: 330 * 0.84, k: SHADOW_K, S, draw: (g) => FILM.cast.sam(g, o), alpha: 0.26 });
      FILM.cast.sam(ctx, o);
      const snap = drawCord(ctx, t, PL, o);
      drawSnap(ctx, snap);
      ctx.restore();

      ctx.save();
      cam(0.7);
      LOOK.drawLight(ctx, C.light, { x: 6 * Math.sin(t * 0.35), alpha: 0.7 + 0.06 * Math.sin(t * 0.9) });
      ctx.restore();

      sepia(ctx, t);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
