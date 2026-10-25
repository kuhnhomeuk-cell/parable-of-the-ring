// scenes/31-scene-31.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-31';
  const LIB = FILM.lib, LOOK = FILM.look;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { sstep, clamp01, lerp, makeLayer, vgrad, hgrad, poly } = LOOK;
  const TAU = Math.PI * 2;
  const W = 1080, H = 1080;

  const normTok = (s) => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
  function wordT(info, tok, n, fb) {
    const sh = info.shot;
    const want = normTok(tok);
    let k = 0;
    for (const c of sh.captions || []) {
      for (const w of c.words || []) {
        const lt = w[0] - sh.start;
        if (lt < -0.02 || lt > info.dur + 0.02 || normTok(w[1]) !== want) continue;
        if (k === (n || 0)) return lt;
        k++;
      }
    }
    return fb;
  }
  function rig(ctx, t, dur, list, hand) {
    let i = 0;
    while (i + 1 < list.length && t >= list[i + 1].at) i++;
    const s = list[i];
    const end = i + 1 < list.length ? list[i + 1].at : dur;
    const u = Math.max(0, Math.min(1, (t - s.at) / Math.max(0.01, end - s.at)));
    const e = u * (1.6 - 0.6 * u);
    const z = s.z * (1 + (s.p == null ? 0.035 : s.p) * e);
    let dx = (s.d ? s.d[0] : 0) * e;
    let dy = (s.d ? s.d[1] : 0) * e;
    if (hand) {
      const w = (f, ph) => Math.sin(t * 6.2832 * f + ph);
      dx += hand * (0.55 * w(0.63, 0.4) + 0.3 * w(1.37, 2.1) + 0.15 * w(3.1, 4.4));
      dy += hand * (0.5 * w(0.71, 1.7) + 0.33 * w(1.53, 0.2) + 0.17 * w(2.9, 3.3));
    }
    const fx = s.f[0], fy = s.f[1];
    const cl = (v, a, b) => (v < a ? a : v > b ? b : v);
    dx = cl(dx, 540 - fx * z, (1080 - fx) * z - 540);
    dy = cl(dy, 540 - fy * z, (1080 - fy) * z - 540);
    ctx.translate(540 - dx, 540 - dy);
    ctx.scale(z, z);
    ctx.translate(-fx, -fy);
    return i;
  }
  const texture = (c, S, n, o) => LOOK.texture(c, S, Object.assign({ seed: sd('tex', n), offset: n * 13.7 }, o));

  const LAMP = [130, 70];
  const J_MED = { x: 400, y: 1010, h: 580, age: 19, outfit: 'fatigues-desert', helmet: true, pose: 'sit', facing: 1 };
  const AVA_ALPHA = 0.88;

  function rib(g, x, w, top, bot, lit) {
    g.fillStyle = hgrad(g, x - w, x + w, [[0, lit ? 'rgb(70,58,84)' : 'rgb(30,36,60)'], [0.3, 'rgb(36,42,68)'], [1, 'rgb(22,26,46)']]);
    g.beginPath();
    g.moveTo(x - w, bot);
    g.lineTo(x - w, top + 120);
    g.quadraticCurveTo(x - w, top, x - w + 90 * Math.sign(540 - x), top - 40);
    g.lineTo(x + w + 90 * Math.sign(540 - x), top - 40);
    g.quadraticCurveTo(x + w, top, x + w, top + 120);
    g.lineTo(x + w, bot);
    g.closePath();
    g.fill();
  }

  function buildPlane(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = vgrad(g, 0, H, [[0, 'rgb(22,28,52)'], [0.45, 'rgb(40,50,84)'], [0.8, 'rgb(34,40,70)'], [1, 'rgb(18,20,36)']]);
    g.fillRect(0, 0, W, H);
    const rr = LIB.rng(sd('quilt'));
    for (let x = -60; x < W + 60; x += 92) {
      for (let y = 110; y < 760; y += 86) {
        g.fillStyle = `rgba(80,96,140,${0.08 + 0.06 * rr()})`;
        g.beginPath();
        g.ellipse(x + 46, y + 40, 40, 36, 0, 0, TAU);
        g.fill();
        g.fillStyle = 'rgba(10,12,26,0.18)';
        g.fillRect(x, y, 92, 2);
      }
    }
    for (const [x, lit] of [[90, true], [330, true], [690, false], [960, false]]) rib(g, x, 22, 40, 900, lit);
    g.fillStyle = 'rgb(14,16,30)';
    g.beginPath();
    g.ellipse(820, 300, 44, 52, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(120,140,190,0.35)';
    g.beginPath();
    g.ellipse(820, 300, 34, 42, 0, 0, TAU);
    g.fill();
    g.fillStyle = vgrad(g, 260, 340, [[0, 'rgb(20,26,56)'], [1, 'rgb(40,50,96)']]);
    g.beginPath();
    g.ellipse(820, 300, 30, 38, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(230,236,255,0.9)';
    g.fillRect(810, 284, 2.5, 2.5);
    g.fillStyle = 'rgb(40,30,40)';
    g.fillRect(-20, 852, W + 40, 14);
    g.fillStyle = 'rgb(112,40,40)';
    g.fillRect(-20, 640, W + 40, 6);
    for (let x = -20; x < W + 20; x += 18) {
      g.fillStyle = 'rgba(132,46,44,0.85)';
      g.fillRect(x, 646, 7, 206);
    }
    for (let y = 680; y < 852; y += 34) {
      g.fillStyle = 'rgba(120,40,40,0.8)';
      g.fillRect(-20, y, W + 40, 6);
    }
    g.fillStyle = vgrad(g, 640, 866, [[0, 'rgba(10,8,20,0)'], [1, 'rgba(10,8,20,0.45)']]);
    g.fillRect(-20, 640, W + 40, 226);
    g.fillStyle = vgrad(g, 866, H, [[0, 'rgb(42,46,64)'], [1, 'rgb(20,22,34)']]);
    g.fillRect(-20, 866, W + 40, H - 866);
    for (let y = 880; y < H; y += 26) {
      g.fillStyle = 'rgba(110,120,160,0.12)';
      g.fillRect(-20, y, W + 40, 2);
    }
    LOOK.haze(g, { x: LAMP[0], y: LAMP[1], r: 620, stops: [[0, 'rgba(255,90,70,0.55)'], [0.3, 'rgba(200,50,50,0.22)'], [1, 'rgba(120,30,40,0)']] });
    g.fillStyle = 'rgb(255,150,130)';
    g.beginPath();
    g.ellipse(LAMP[0], LAMP[1], 18, 11, 0, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(40,30,34)';
    g.fillRect(LAMP[0] - 22, LAMP[1] - 16, 44, 5);
    texture(c, S, 1, { mottle: 0.06, dark: 0.05, light: 0.03, glow: { x: LAMP[0], y: LAMP[1], r: 600, amount: 0.12, color: [255, 120, 100] } });
    return c;
  }

  function buildPlaneClose(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = vgrad(g, 0, H, [[0, 'rgb(26,32,60)'], [0.6, 'rgb(40,50,86)'], [1, 'rgb(22,26,46)']]);
    g.fillRect(0, 0, W, H);
    for (let x = -100; x < W + 100; x += 230) {
      for (let y = -60; y < H; y += 210) {
        LOOK.haze(g, { x: x + 115, y: y + 105, r: 120, stops: [[0, 'rgba(84,100,148,0.22)'], [1, 'rgba(84,100,148,0)']] });
      }
    }
    g.fillStyle = hgrad(g, 770, 860, [[0, 'rgb(86,62,92)'], [0.18, 'rgb(40,44,72)'], [1, 'rgb(20,24,44)']]);
    g.beginPath();
    g.moveTo(770, H + 20);
    g.lineTo(770, 160);
    g.quadraticCurveTo(772, 40, 700, -20);
    g.lineTo(800, -20);
    g.quadraticCurveTo(860, 50, 860, 160);
    g.lineTo(860, H + 20);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(20,20,36,0.5)';
    for (let y = 220; y < H; y += 160) {
      g.beginPath();
      g.arc(815, y, 5, 0, TAU);
      g.fill();
    }
    g.fillStyle = vgrad(g, 760, H, [[0, 'rgba(120,40,44,0)'], [0.3, 'rgba(120,40,44,0.5)'], [1, 'rgba(70,24,30,0.6)']]);
    g.fillRect(-20, 760, W + 40, H - 740);
    LOOK.haze(g, { x: 60, y: -40, r: 760, stops: [[0, 'rgba(255,90,70,0.6)'], [0.35, 'rgba(200,50,50,0.25)'], [1, 'rgba(120,30,40,0)']] });
    texture(c, S, 2, { mottle: 0.06, dark: 0.04, light: 0.03 });
    return c;
  }

  let CACHE = null;
  function statics(S) {
    if (CACHE && CACHE.S === S) return CACHE;
    return (CACHE = { S, plane: buildPlane(S), close: buildPlaneClose(S) });
  }

  function nightGrade(ctx, lamp, r, k) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(118,130,190,${0.85 * k})`;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(lamp[0], lamp[1], 0, lamp[0], lamp[1], r);
    g.addColorStop(0, `rgba(210,60,50,${0.55 * k})`);
    g.addColorStop(0.45, `rgba(150,36,40,${0.28 * k})`);
    g.addColorStop(1, 'rgba(120,30,40,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function chestGlow(ctx, p, r, a) {
    if (a <= 0.01) return;
    ctx.save();
    const h = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r * 1.5);
    h.addColorStop(0, `rgba(242,193,78,${0.45 * a})`);
    h.addColorStop(0.35, `rgba(242,180,70,${0.2 * a})`);
    h.addColorStop(1, 'rgba(242,180,70,0)');
    ctx.fillStyle = h;
    ctx.fillRect(p[0] - r * 1.5, p[1] - r * 1.5, 3 * r, 3 * r);
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
    g.addColorStop(0, `rgba(255,236,170,${0.95 * a})`);
    g.addColorStop(0.18, `rgba(242,193,78,${0.7 * a})`);
    g.addColorStop(0.5, `rgba(242,170,60,${0.25 * a})`);
    g.addColorStop(1, 'rgba(242,160,60,0)');
    ctx.fillStyle = g;
    ctx.fillRect(p[0] - r, p[1] - r, 2 * r, 2 * r);
    ctx.restore();
  }

  function placeMouth(o, at) {
    for (let i = 0; i < 3; i++) {
      const m = FILM.cast.ava.pose(o).mouth;
      o.x += at[0] - m[0];
      o.y += at[1] - m[1];
    }
    return o;
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const C = statics(S);
      const D = FILM.sets.dream;
      D.statics(S);
      const dur = info.dur;
      const bt = (i, d) => (info.shot.beats && info.shot.beats[i] ? info.shot.beats[i].t : d);
      const B1 = bt(1, 4.32), B2 = bt(2, 5.89);
      const T_DREAM = wordT(info, 'tokhg', 0, 0.9) - 0.1;
      const T_CAME = wordT(info, 'tokgg', 0, 3.08) + 0.05;
      const T_KISS = B1 + 0.55;
      const T_CUT = B2 - 0.12;
      const T_WOKE = wordT(info, 'tokhk', 0, 6.22), T_BRAVE = wordT(info, 'tokhm', 0, 7.24);

      ctx.save();
      rig(ctx, t, dur, [
        { at: 0, f: [560, 560], z: 1.04, d: [-12, -8], p: 0.04 },
        { at: T_CAME - 0.1, f: [565, 590], z: 1.3, d: [-10, -6], p: 0.05 },
        { at: B1 - 0.05, f: [488, 610], z: 1.8, d: [8, -8], p: 0.06 },
        { at: T_CUT, f: [530, 520], z: 1.05, d: [-6, -12], p: 0.06 },
      ]);

      if (t < T_CUT) {
        const dream = sstep(T_DREAM, T_DREAM + 1.2, t);
        const cam = (c, depth) => LOOK.camera(c, { t, dur: T_CUT, focus: [560, 560], push: 0.035, depth });
        if (dream < 1) {
          ctx.save();
          cam(ctx, 0.6);
          ctx.drawImage(C.plane, 0, 0, W, H);
          ctx.restore();
        }
        if (dream > 0) D.back(ctx, t, { S, cam, form: dream, alpha: dream });

        const J = Object.assign({}, J_MED, { t, expr: 'closed', look: -0.35 + 0.15 * sstep(T_KISS, T_KISS + 0.8, t) });
        const JP = FILM.cast.sam.pose(J);
        const jh = FILM.cast.sam.height(J);
        const chest = [lerp(JP.head[0], JP.legs[0].hip[0], 0.5) + 0.02 * jh, lerp(JP.head[1], JP.legs[0].hip[1], 0.5)];

        ctx.save();
        cam(ctx, 1);
        if (dream < 1) {
          ctx.save();
          ctx.globalAlpha = 1 - sstep(0, 0.6, dream);
          FILM.cast.soldier(ctx, Object.assign({}, J_MED, { variant: 3, x: -40, t: t + 1.3, expr: 'closed', look: 0.25 }));
          FILM.cast.soldier(ctx, Object.assign({}, J_MED, { variant: 1, x: 1110, facing: -1, t: t + 2.1, expr: 'closed', look: -0.55 }));
          ctx.restore();
          ctx.save();
          ctx.globalAlpha = 0.3 * (1 - sstep(0, 0.6, dream));
          ctx.fillStyle = LOOK.hgrad(ctx, -60, 1140, [[0, 'rgba(30,36,70,1)'], [0.22, 'rgba(30,36,70,0.8)'], [0.3, 'rgba(30,36,70,0)'], [0.7, 'rgba(30,36,70,0)'], [0.78, 'rgba(30,36,70,0.8)'], [1, 'rgba(30,36,70,1)']]);
          ctx.fillRect(-60, -60, 1200, 1200);
          ctx.restore();
        }
        if (dream > 0) LOOK.contactShadow(ctx, { x: J.x + 20, y: J.y, h: 330, alpha: 0.18 * dream, color: [120, 120, 170] });
        FILM.cast.sam(ctx, J);
        if (dream < 1) {
          ctx.save();
          ctx.globalAlpha = 1 - sstep(0, 0.6, dream);
          FILM.cast.rifle(ctx, { x: JP.legs[0].ankle[0] - 0.02 * jh, y: J.y - 6, size: jh * 0.4, rot: -0.1 });
          ctx.restore();
        }

        const mh = jh * 0.95;
        const come = LIB.ease.outCubic(clamp01((t - (T_CAME - 1.8)) / 2.0));
        const lean = LIB.ease.inOutSine(clamp01((t - (T_KISS - 0.55)) / 0.55));
        const back = LIB.ease.inOutSine(clamp01((t - (T_KISS + 0.75)) / 0.5));
        const leanK = lean * (1 - back * 0.6);
        const brow = [JP.head[0] + 0.13 * jh, JP.head[1] - 0.024 * jh];
        const M = {
          x: lerp(1020, J.x + 0.62 * jh, come),
          y: J.y - 10,
          h: mh,
          t,
          facing: -1,
          outfit: 'nurse',
          pose: 'float',
          look: -0.25 * leanK,
          expr: t < B1 ? { wonder: 1 - sstep(T_CAME, T_CAME + 0.6, t), loving: sstep(T_CAME, T_CAME + 0.6, t) } : { loving: 1 - sstep(B1, B1 + 0.4, t), smileSoft: sstep(B1, B1 + 0.4, t) },
          breeze: 0.6,
          wind: -1,
          alpha: AVA_ALPHA * sstep(T_CAME - 1.8, T_CAME - 0.8, t),
          lift: 18 * (1 - leanK),
        };
        if (leanK > 0) {
          const kissAt = placeMouth(Object.assign({}, M, { look: -0.25, lift: 0 }), [brow[0] + 4, brow[1]]);
          M.x = lerp(M.x, kissAt.x, leanK);
          M.y = lerp(M.y, kissAt.y, leanK);
        }
        if (M.alpha > 0) FILM.cast.ava(ctx, M);
        ctx.restore();

        if (dream > 0) D.front(ctx, t, { S, cam, form: dream, alpha: dream, warm: 0.6 * sstep(T_KISS + 0.2, T_KISS + 1.2, t) });

        ctx.save();
        cam(ctx, 1);
        const spark = Math.max(0, 1 - Math.abs(t - (T_KISS + 0.05)) / 0.35);
        if (spark > 0) LOOK.bloom(ctx, { x: brow[0], y: brow[1], r: 50, alpha: 0.6 * spark, mid: 0.2 * spark });
        const bloomK = sstep(T_KISS + 0.15, T_KISS + 1.1, t);
        chestGlow(ctx, chest, 90 + 200 * bloomK, bloomK * (0.85 + 0.1 * Math.sin(t * 5)));
        ctx.restore();

        if (dream < 1) nightGrade(ctx, LAMP, 700, 1 - dream);
      } else {
        const tc = t - T_CUT;
        const cam = (c, depth) => LOOK.camera(c, { t: tc, dur: dur - T_CUT, focus: [520, 420], push: 0.03, depth });
        ctx.save();
        cam(ctx, 0.5);
        ctx.drawImage(C.close, 0, 0, W, H);
        ctx.restore();
        const open = sstep(T_WOKE, T_WOKE + 0.22, t);
        const set = sstep(T_BRAVE - 0.1, T_BRAVE + 0.35, t);
        const J = Object.assign({}, J_MED, {
          h: 1250, t: t + 0.4, facing: 1, pose: 'stand',
          expr: open < 0.5 ? 'closed' : { neutral: 1 - 0.4 * set, squint: 0.4 * set },
          look: -0.18 + 0.2 * open + 0.1 * set,
        });
        const P0 = FILM.cast.sam.pose(Object.assign({}, J, { x: 0, y: 0 }));
        J.x = 480 - P0.head[0];
        J.y = 440 - P0.head[1];
        const JP = FILM.cast.sam.pose(J);
        const jh = FILM.cast.sam.height(J);
        ctx.save();
        cam(ctx, 1);
        FILM.cast.sam(ctx, J);
        ctx.restore();
        nightGrade(ctx, [60, -40], 900, 1);
        const chest = [lerp(JP.head[0], JP.legs[0].hip[0], 0.6) + 0.02 * jh, lerp(JP.head[1], JP.legs[0].hip[1], 0.6)];
        ctx.save();
        cam(ctx, 1);
        chestGlow(ctx, chest, jh * 0.34, 0.85 - 0.15 * sstep(T_CUT, dur, t) + 0.1 * set);
        ctx.restore();
      }
      ctx.restore();

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
