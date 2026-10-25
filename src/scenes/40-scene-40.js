// scenes/40-scene-40.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-40';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const SET = () => FILM.sets.wedding;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const { sstep, vgrad, hgrad, poly, makeLayer, TAU, lerp, clamp01 } = LOOK;
  const W = 1080;
  const H = 1080;
  const texture = (c, S, n, o) => LOOK.texture(c, S, Object.assign({ seed: sd('tex', n), offset: n * 13.7 }, o));
  const col = (c, hz, a) => LOOK.col(c, hz, a, [252, 214, 176]);

  function lines(info) {
    const s = info.shot, out = [];
    for (const c of s.captions || []) {
      if (!c.words || !c.words.length || c.words[0][0] < s.start - 0.05) continue;
      out.push(c.words.map(([t, w]) => [t - s.start, String(w).toLowerCase().replace(/[^a-z']/g, '')]));
    }
    return out;
  }
  const word = (L, i, tok, d) => {
    for (const w of L[i] || []) if (w[1] === tok) return w[0];
    return d;
  };
  function beats(info) {
    const b = info.shot.beats || [];
    const L = lines(info);
    return {
      door: word(L, 0, 'tokjh', 1.11),
      go: word(L, 0, 'tokfn', 1.68),
      night: b[1] ? b[1].t : 2.57,
    };
  }

  const HORIZON = 470;
  const SUN = [846, 446];
  const FEET = 838;
  const LIMO_Y = 870;
  const LIMO_X = 790;
  const BACK_Y = 792;
  const JO = { h: 200, age: 21, outfit: 'tux' };
  const SHADOW_K = LOOK.shadowK(Math.PI - 0.1, 1.25);
  const FOCUS = [560, 640];

  function buildFar(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = vgrad(g, 0, HORIZON, [[0, 'rgb(170,150,182)'], [0.3, 'rgb(222,170,170)'], [0.62, 'rgb(246,190,150)'], [0.86, 'rgb(252,212,152)'], [1, 'rgb(255,226,170)']]);
    g.fillRect(0, 0, W, HORIZON + 4);
    LOOK.haze(g, { x: SUN[0], y: SUN[1], r: 900, stops: [[0, 'rgba(255,240,196,0.9)'], [0.18, 'rgba(255,222,160,0.55)'], [0.5, 'rgba(250,190,150,0.2)'], [1, 'rgba(250,190,150,0)']] });
    for (const [x, y, rx, ry, a] of [[300, 120, 330, 12, 0.5], [180, 210, 260, 9, 0.42], [700, 90, 300, 10, 0.4], [560, 260, 240, 7, 0.4], [960, 200, 220, 8, 0.45], [420, 340, 300, 6, 0.36], [900, 330, 160, 5, 0.42]]) {
      g.fillStyle = `rgba(232,150,150,${a * 0.7})`;
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0, 0, TAU);
      g.fill();
      g.fillStyle = `rgba(255,226,180,${a})`;
      g.beginPath();
      g.ellipse(x + rx * 0.1, y + ry * 0.45, rx * 0.8, ry * 0.45, 0, 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgba(255,246,214,0.95)';
    g.beginPath();
    g.arc(SUN[0], SUN[1], 34, 0, TAU);
    g.fill();
    g.fillStyle = 'rgb(206,160,170)';
    g.beginPath();
    g.moveTo(-20, HORIZON + 2);
    g.bezierCurveTo(80, HORIZON - 40, 180, HORIZON - 46, 300, HORIZON - 10);
    g.lineTo(360, HORIZON + 2);
    g.closePath();
    g.fill();
    g.fillStyle = vgrad(g, HORIZON, 600, [[0, 'rgb(242,196,160)'], [0.3, 'rgb(170,170,170)'], [1, 'rgb(96,150,156)']]);
    g.fillRect(0, HORIZON, W, 600 - HORIZON);
    const rp = LIB.rng(sd('sunpath'));
    for (let i = 0; i < 220; i++) {
      const k = Math.pow(rp(), 1.3);
      const y = HORIZON + 2 + k * 120;
      const x = SUN[0] + (rp() - 0.5) * 2 * (14 + 150 * k) * (0.4 + 0.6 * rp());
      g.fillStyle = `rgba(255,236,190,${(0.35 + 0.5 * rp()) * (1 - 0.4 * k)})`;
      g.fillRect(x, y, 6 + 24 * rp(), 1 + 1.2 * k);
    }
    texture(c, S, 1, { mottle: 0.045, dark: 0.035, light: 0.03 });
    return c;
  }

  function cypress(g, x, base, hgt, w) {
    g.fillStyle = 'rgb(92,104,72)';
    g.beginPath();
    g.moveTo(x, base - hgt);
    g.bezierCurveTo(x + w * 0.7, base - hgt * 0.7, x + w * 0.6, base - hgt * 0.15, x + w * 0.2, base);
    g.lineTo(x - w * 0.2, base);
    g.bezierCurveTo(x - w * 0.6, base - hgt * 0.15, x - w * 0.7, base - hgt * 0.7, x, base - hgt);
    g.fill();
    g.fillStyle = 'rgba(232,190,120,0.45)';
    g.beginPath();
    g.moveTo(x + 2, base - hgt + 10);
    g.bezierCurveTo(x + w * 0.62, base - hgt * 0.68, x + w * 0.52, base - hgt * 0.2, x + w * 0.2, base - 4);
    g.lineTo(x + w * 0.3, base - hgt * 0.25);
    g.bezierCurveTo(x + w * 0.4, base - hgt * 0.6, x + w * 0.2, base - hgt * 0.8, x + 2, base - hgt + 10);
    g.fill();
  }

  function buildMid(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = vgrad(g, 572, 640, [[0, 'rgb(196,182,118)'], [1, 'rgb(176,170,98)']]);
    g.fillRect(-20, 574, W + 40, 80);
    g.fillStyle = 'rgb(246,226,206)';
    g.fillRect(360, 556, W - 340, 7);
    g.fillRect(360, 586, W - 340, 6);
    for (let x = 368; x < W + 10; x += 13) {
      g.fillStyle = x > SUN[0] - 120 && x < SUN[0] + 120 ? 'rgb(250,232,210)' : 'rgb(232,206,190)';
      g.beginPath();
      g.ellipse(x, 574, 3.4, 11, 0, 0, TAU);
      g.fill();
    }
    for (const x of [372, 560, 760, 960]) {
      g.fillStyle = 'rgb(236,214,196)';
      g.fillRect(x - 6, 548, 12, 44);
    }
    const L = -30, R = 340, top = 380, base = 612;
    g.fillStyle = vgrad(g, top, base, [[0, 'rgb(248,228,212)'], [1, 'rgb(240,214,196)']]);
    poly(g, [[R, top], [R + 46, top + 18], [R + 46, base - 6], [R, base]]);
    g.fill();
    g.fillStyle = hgrad(g, L, R, [[0, 'rgb(222,186,178)'], [0.7, 'rgb(238,206,190)'], [1, 'rgb(246,218,198)']]);
    g.fillRect(L, top, R - L, base - top);
    g.fillStyle = 'rgb(176,104,92)';
    poly(g, [[L - 16, top + 4], [L + 40, top - 56], [R - 10, top - 56], [R + 50, top + 18], [R + 50, top + 22], [L - 16, top + 10]]);
    g.fill();
    g.fillStyle = 'rgba(255,190,150,0.45)';
    poly(g, [[R - 10, top - 56], [R + 50, top + 18], [R + 36, top + 18], [R - 20, top - 50]]);
    g.fill();
    g.fillStyle = 'rgba(120,60,60,0.3)';
    g.fillRect(L - 16, top + 8, R - L + 66, 5);
    const rw = LIB.rng(sd('win'));
    for (const y of [top + 30, top + 132]) {
      for (const x of [L + 34, L + 96, L + 260, L + 322]) {
        g.fillStyle = 'rgb(250,236,222)';
        g.fillRect(x - 5, y - 6, 38, 74);
        g.fillStyle = vgrad(g, y, y + 62, [[0, 'rgb(250,206,150)'], [1, 'rgb(196,140,128)']]);
        g.fillRect(x, y, 28, 62);
        g.fillStyle = `rgba(255,240,200,${0.3 + 0.3 * rw()})`;
        poly(g, [[x + 6, y], [x + 14, y], [x + 4, y + 62], [x - 4 + 4, y + 62]]);
        g.fill();
        g.fillStyle = 'rgba(160,110,110,0.35)';
        g.fillRect(x + 13, y, 2, 62);
      }
    }
    const px0 = L + 150, px1 = L + 236;
    g.fillStyle = 'rgb(246,230,214)';
    poly(g, [[px0 - 14, top + 22], [(px0 + px1) / 2, top - 8], [px1 + 14, top + 22]]);
    g.fill();
    g.fillStyle = 'rgb(236,214,200)';
    g.fillRect(px0 - 14, top + 22, px1 - px0 + 28, 12);
    g.fillStyle = 'rgb(150,110,110)';
    g.fillRect(px0, top + 34, px1 - px0, base - top - 34);
    for (let i = 0; i < 4; i++) {
      const x = px0 + 4 + i * ((px1 - px0 - 8) / 3);
      g.fillStyle = hgrad(g, x - 6, x + 6, [[0, 'rgb(220,196,190)'], [1, 'rgb(252,238,224)']]);
      g.fillRect(x - 6, top + 34, 12, base - top - 40);
    }
    g.fillStyle = 'rgba(255,214,160,0.55)';
    g.fillRect(px0 + 22, base - 76, px1 - px0 - 44, 60);
    g.fillStyle = 'rgb(240,222,206)';
    g.fillRect(px0 - 10, base - 6, px1 - px0 + 20, 8);
    g.fillRect(px0 - 20, base + 2, px1 - px0 + 40, 8);
    for (const [x, w] of [[L + 10, 150], [L + 250, 130]]) {
      g.fillStyle = 'rgb(108,120,74)';
      g.beginPath();
      g.ellipse(x + w / 2, base, w / 2, 20, 0, Math.PI, TAU);
      g.fill();
      g.fillStyle = 'rgba(236,196,120,0.4)';
      g.beginPath();
      g.ellipse(x + w * 0.62, base - 8, w * 0.32, 9, 0, Math.PI, TAU);
      g.fill();
    }
    cypress(g, 392, 610, 230, 44);
    cypress(g, 436, 606, 180, 38);
    const ax = 640, ab = 612;
    g.strokeStyle = 'rgb(246,234,220)';
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(ax - 52, ab);
    g.lineTo(ax - 52, ab - 96);
    g.arc(ax, ab - 96, 52, Math.PI, TAU);
    g.lineTo(ax + 52, ab);
    g.stroke();
    const rr = LIB.rng(sd('roses'));
    for (let i = 0; i < 46; i++) {
      const a = Math.PI + rr() * Math.PI;
      const side = rr() < 0.4;
      const x = side ? ax + (rr() < 0.5 ? -52 : 52) + (rr() - 0.5) * 10 : ax + Math.cos(a) * 52 + (rr() - 0.5) * 10;
      const y = side ? ab - 96 + rr() * 70 : ab - 96 + Math.sin(a) * 52 + (rr() - 0.5) * 10;
      g.fillStyle = rr() < 0.4 ? 'rgb(120,140,86)' : rr() < 0.6 ? 'rgb(250,236,236)' : 'rgb(236,160,168)';
      g.beginPath();
      g.arc(x, y, 3.5 + rr() * 3, 0, TAU);
      g.fill();
    }
    const pts = [[R + 20, top + 50], [ax - 50, ab - 150], [ax + 50, ab - 150], [W + 20, top + 70]];
    g.strokeStyle = 'rgba(90,70,70,0.5)';
    g.lineWidth = 1.2;
    const sag = (a, b, s, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f) + s * 4 * f * (1 - f)];
    for (let k = 0; k < 3; k += 2) {
      const a = pts[k], b = pts[k + 1];
      g.beginPath();
      for (let i = 0; i <= 20; i++) {
        const p = sag(a, b, 26, i / 20);
        if (i === 0) g.moveTo(p[0], p[1]);
        else g.lineTo(p[0], p[1]);
      }
      g.stroke();
      for (let i = 1; i < 12; i++) {
        const p = sag(a, b, 26, i / 12);
        const gl = g.createRadialGradient(p[0], p[1] + 3, 0, p[0], p[1] + 3, 9);
        gl.addColorStop(0, 'rgba(255,240,190,0.9)');
        gl.addColorStop(0.35, 'rgba(255,214,150,0.4)');
        gl.addColorStop(1, 'rgba(255,214,150,0)');
        g.fillStyle = gl;
        g.fillRect(p[0] - 9, p[1] - 6, 18, 18);
      }
    }
    texture(c, S, 2, { mottle: 0.06, dark: 0.05, light: 0.035, glow: { x: SUN[0], y: SUN[1], r: 600, amount: 0.12 } });
    return c;
  }

  function buildNear(S) {
    const { c, g } = makeLayer(S);
    g.fillStyle = vgrad(g, 610, H, [[0, 'rgb(186,176,98)'], [0.3, 'rgb(150,156,80)'], [1, 'rgb(104,122,62)']]);
    g.fillRect(-20, 612, W + 40, H - 600);
    g.fillStyle = hgrad(g, 0, W, [[0, 'rgba(120,80,110,0.12)'], [0.5, 'rgba(255,214,150,0)'], [1, 'rgba(255,214,150,0.24)']]);
    g.fillRect(-20, 612, W + 40, H - 600);
    for (let i = 0; i < 9; i++) {
      const y = 630 + i * i * 6;
      g.fillStyle = i % 2 ? 'rgba(255,236,170,0.06)' : 'rgba(60,70,30,0.05)';
      g.fillRect(-20, y, W + 40, 6 + i * 6);
    }
    const rv = LIB.rng(sd('grass'));
    for (let i = 0; i < 420; i++) {
      const y = 620 + Math.pow(rv(), 0.8) * 460;
      const s = (y - 600) / 480;
      g.fillStyle = rv() < 0.5 ? `rgba(70,96,40,${0.2 + 0.2 * s})` : `rgba(240,220,140,${0.18 + 0.2 * s})`;
      g.fillRect(rv() * W, y, 4 + 14 * s, 1 + 1.5 * s);
    }
    g.fillStyle = vgrad(g, 796, 906, [[0, 'rgb(226,206,182)'], [0.5, 'rgb(236,214,186)'], [1, 'rgb(214,190,166)']]);
    g.beginPath();
    g.moveTo(-20, 800);
    g.bezierCurveTo(300, 792, 700, 796, W + 20, 790);
    g.lineTo(W + 20, 902);
    g.bezierCurveTo(700, 910, 300, 904, -20, 908);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(120,100,90,0.2)';
    g.fillRect(-20, 800, W + 40, 3);
    const rg = LIB.rng(sd('gravel'));
    for (let i = 0; i < 900; i++) {
      const x = rg() * W, y = 802 + rg() * 102;
      g.fillStyle = rg() < 0.5 ? 'rgba(150,120,110,0.3)' : 'rgba(255,246,230,0.5)';
      g.fillRect(x, y, 1 + rg() * 1.6, 1 + rg());
    }
    for (let i = 0; i < 260; i++) {
      const x = 20 + rg() * 760, y = 806 + rg() * 90;
      g.save();
      g.translate(x, y);
      g.rotate(rg() * TAU);
      g.fillStyle = 'rgba(255,252,240,0.9)';
      g.beginPath();
      g.ellipse(0, 0, 1.8, 0.8, 0, 0, TAU);
      g.fill();
      g.restore();
    }
    for (let i = 0; i < 22; i++) {
      g.fillStyle = rg() < 0.5 ? 'rgba(230,120,140,0.85)' : 'rgba(246,190,196,0.85)';
      g.beginPath();
      g.ellipse(40 + rg() * 700, 810 + rg() * 86, 3.2, 1.8, rg() * TAU, 0, TAU);
      g.fill();
    }
    texture(c, S, 3, { mottle: 0.07, dark: 0.06, light: 0.04, glow: { x: SUN[0], y: SUN[1], r: 700, amount: 0.18 } });
    return c;
  }

  function buildAir(S) {
    const shafts = LOOK.beamField({
      beams: [[420, 40, 0.5], [520, 70, 0.7], [640, 50, 0.5], [760, 90, 0.4]],
      dir: [0.26, 0.966],
      noise: { base: 0.75, amp: 0.5, scale: 9, offset: 2, row: 4.5 },
      fall: (X, Y) => sstep(-80, 760, X) * (1 - sstep(760, 980, Y)) * 0.5,
      clamp: false,
    });
    const glow = LOOK.glowField({ x: SUN[0], y: SUN[1], r: 420, amount: 0.6 });
    return LOOK.lightLayer(S, { fields: [shafts, glow], color: [255, 224, 176] });
  }

  let CACHE = null;
  function statics(S) {
    if (CACHE && CACHE.S === S) return CACHE;
    const sil = (res) => {
      const cv = FILM.makeCanvas(Math.round(W * S * res), Math.round(H * S * res));
      return { c: cv, g: cv.getContext('2d'), k: S * res };
    };
    CACHE = {
      S,
      far: buildFar(S),
      mist: LOOK.mist(S, { bands: [[HORIZON + 6, 30, 0.7], [600, 40, 0.3]], color: [255, 226, 196] }),
      mid: buildMid(S),
      near: buildNear(S),
      air: buildAir(S),
      limo: (() => {
        const { c, g } = makeLayer(S, 1, 640, 220);
        SET().drawLimo(g, 320, 200, 1, false);
        LOOK.texture(c, S, { seed: sd('tex', 7), offset: 7 * 13.7, mottle: 0.05, dark: 0.03, light: 0.03 });
        return c;
      })(),
      back: sil(0.6),
      front: sil(0.35),
    };
    return CACHE;
  }

  const BACK = [
    ['mother', 30, BACK_Y, 150, 1, { pose: 'wave' }],
    ['father', 92, BACK_Y - 2, 158, 1, { pose: 'stand' }],
    ['ava', 160, BACK_Y, 140, 1, { outfit: 'vision', pose: 'showHand' }],
    ['sam', 232, BACK_Y - 2, 136, 1, { age: 21, outfit: 'casual', pose: 'laugh', poseAmt: 1 }],
    ['soldier', 384, BACK_Y - 3, 136, -1, { variant: 2, age: 21, outfit: 'dress', cap: false, helmet: false, pose: 'laugh', poseAmt: 1 }],
    ['ava', 452, BACK_Y, 138, -1, { outfit: 'nurse', pose: 'showHand' }],
    ['mother', 520, BACK_Y - 1, 146, -1, { pose: 'wave' }],
  ];
  const FRONT = [
    ['father', 34, 1170, 360, 1, { pose: 'stand' }],
    ['mother', 140, 1196, 330, 1, { pose: 'wave' }],
  ];

  const onTwos = (t) => Math.floor(t * 12) / 12;
  function drawGuests(L, list, t, color, R) {
    if (L.at === t) return;
    L.at = t;
    const g = L.g;
    const k = L.k;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.clearRect(R[0] * k, R[1] * k, R[2] * k, R[3] * k);
    g.setTransform(L.k, 0, 0, L.k, 0, 0);
    list.forEach(([who, x, y, h, facing, o], i) => {
      const fn = FILM.cast[who];
      if (typeof fn !== 'function') return;
      fn(g, Object.assign({ x, y, h, t: t + i * 0.37, facing, blinkOffset: i }, o));
    });
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color;
    g.fillRect(R[0] * k, R[1] * k, R[2] * k, R[3] * k);
    g.globalCompositeOperation = 'source-over';
  }
  const blitRegion = (ctx, L, R) => ctx.drawImage(L.c, R[0] * L.k, R[1] * L.k, R[2] * L.k, R[3] * L.k, R[0], R[1], R[2], R[3]);
  const BACK_R = [0, 560, 660, 250];
  const FRONT_R = [0, 640, 380, 440];

  function couple(t, B) {
    const tDoor = B.door;
    const u = clamp01(t / tDoor);
    const ease = (v) => v * (1.7 - 0.7 * v);
    const mx = lerp(372, 692, ease(u)) + 26 * sstep(tDoor, tDoor + 0.4, t);
    const jx = lerp(292, 618, ease(clamp01((t - 0.0) / (tDoor + 0.12)))) + 30 * sstep(tDoor + 0.12, tDoor + 0.55, t);
    const mDuck = LIB.ease.inOutSine((t - tDoor + 0.05) / 0.4);
    const jDuck = LIB.ease.inOutSine((t - tDoor - 0.14) / 0.42);
    return { mx, jx, mDuck, jDuck };
  }

  function limoX(t, B) {
    const t0 = B.go;
    if (t <= t0) return LIMO_X;
    const tau = t - t0;
    return LIMO_X + 0.5 * 1500 * tau * tau + 20 * tau;
  }

  function drawLimo(ctx, C, t, B) {
    const x = limoX(t, B);
    const y = LIMO_Y;
    const L = SET().LIMO;
    const moved = x - LIMO_X;
    ctx.save();
    const sg = ctx.createLinearGradient(x - 520, 0, x + 270, 0);
    sg.addColorStop(0, 'rgba(70,50,80,0)');
    sg.addColorStop(0.5, 'rgba(70,50,80,0.18)');
    sg.addColorStop(1, 'rgba(70,50,80,0.34)');
    ctx.fillStyle = sg;
    poly(ctx, [[x + 270, y + 2], [x - 272, y + 6], [x - 520, y + 30], [x + 40, y + 30]]);
    ctx.fill();
    ctx.restore();
    LOOK.contactShadow(ctx, { x: x, y: y + 2, h: 330, rx: 290, ry: 10, dx: -12, alpha: 0.42 });
    const speed = clamp01(moved / 160);
    const rear = [x + L.rear[0], y + L.rear[1] + 8];
    for (let i = 0; i < 3; i++) {
      const lag = 64 + i * 34 + 22 * speed;
      const bounce = speed * Math.abs(Math.sin(moved * 0.05 + i * 1.9)) * 9;
      const cx = rear[0] - lag, cy = y - 6 - bounce;
      ctx.strokeStyle = 'rgba(80,60,60,0.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(rear[0], rear[1]);
      ctx.quadraticCurveTo((rear[0] + cx) / 2, y - 4, cx + 8, cy - 2);
      ctx.stroke();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.3 + 0.5 * Math.sin(moved * 0.07 + i * 2.3) * speed + i * 0.4);
      ctx.fillStyle = hgrad(ctx, -9, 9, [[0, 'rgb(150,136,136)'], [0.6, 'rgb(236,226,216)'], [1, 'rgb(190,176,170)']]);
      ctx.fillRect(-9, -7, 18, 14);
      ctx.fillStyle = 'rgb(206,196,190)';
      ctx.fillRect(-10, -7, 2, 14);
      ctx.fillRect(8, -7, 2, 14);
      ctx.restore();
    }
    ctx.drawImage(C.limo, x - 320, y - 200, 640, 220);
    const ang = moved / L.wheelR;
    for (const wx of L.wheels) SET().drawWheel(ctx, x + wx, y, L.wheelR, ang, false);
    if (moved > 2) {
      for (let i = 0; i < 4; i++) {
        const age = ((t * 3 + i * 0.25) % 1);
        const px = x + L.rear[0] - 10 - age * 80, py = y - 26 - age * 26;
        ctx.fillStyle = `rgba(250,236,226,${0.3 * (1 - age) * speed})`;
        ctx.beginPath();
        ctx.arc(px, py, 6 + age * 16, 0, TAU);
        ctx.fill();
      }
    }
  }

  const grain = (g, p) => {
    g.globalAlpha = p.alpha;
    g.fillStyle = p.u < 0.18 ? 'rgb(255,226,160)' : 'rgb(255,251,240)';
    g.beginPath();
    g.ellipse(p.x, p.y, p.size, p.size * 0.42, p.rot, 0, TAU);
    g.fill();
  };

  const TOSSES = [[170, 670, -0.3, 20], [240, 680, -0.05, 18], [450, 670, 0.2, 20], [530, 676, 0.5, 20], [40, 676, 0.35, 16], [60, 840, 0.1, 18], [180, 830, 0.55, 18]];

  function drawTosses(ctx, t, fade) {
    TOSSES.forEach(([x0, y0, tb, n], j) => {
      const tau = t - tb;
      if (tau <= 0 || tau > 1.6) return;
      for (let i = 0; i < n; i++) {
        const a = LIB.h3(i, j, 31), b = LIB.h3(i, j, 32), c = LIB.h3(i, j, 33);
        const vx = 30 + 150 * a, vy = -240 - 200 * b;
        const x = x0 + vx * tau, y = y0 + vy * tau + 0.5 * 520 * tau * tau;
        const alpha = fade * (1 - sstep(1.1, 1.6, tau)) * (0.7 + 0.3 * c);
        grain(ctx, { x, y, rot: c * TAU + tau * 9, size: 1.8 + 1.3 * c, alpha, u: a });
      }
    });
  }

  function drawSunset(ctx, t, B, C, S) {
    const tDay = B.night;
    const cam = (d) => LOOK.camera(ctx, { t: Math.min(t, tDay), dur: tDay, focus: FOCUS, push: 0.04, pan: [14, 0], depth: d });

    ctx.save();
    cam(0.25);
    ctx.drawImage(C.far, 0, 0, W, H);
    ctx.restore();

    ctx.save();
    cam(0.55);
    LOOK.drawMist(ctx, C.mist, { x: -140 + 14 * t, alpha: 0.6 });
    ctx.drawImage(C.mid, 0, 0, W, H);
    ctx.restore();

    ctx.save();
    cam(1);
    ctx.drawImage(C.near, 0, 0, W, H);
    for (const [, x, y, h] of BACK) LOOK.castShadow(ctx, { x, y, h: h * 1.1, k: SHADOW_K, blob: { width: 14, alphas: [0.22, 0.1] } });
    drawGuests(C.back, BACK, onTwos(t), 'rgb(150,104,120)', BACK_R);
    blitRegion(ctx, C.back, BACK_R);

    const cp = couple(t, B);
    const jRun = { x: cp.jx, y: FEET + 132 * cp.jDuck, facing: 1, pose: 'run', poseAmt: 1, t, expr: 'happy', exprAmt: 1, lean: 0.6 * cp.jDuck };
    Object.assign(jRun, JO);
    jRun.walk = (cp.jx - 292) / FILM.cast.sam.stride(jRun);
    const JHr = FILM.cast.sam.height(JO);
    const mh = JHr * 0.95;
    const mRun = { x: cp.mx, y: FEET + 6 + 128 * cp.mDuck, h: mh, t, facing: 1, outfit: 'bride', pose: 'run', walk: (cp.mx - 372) / (2 * FILM.cast.ava.RUN_STEP * mh), expr: 'laugh', breeze: 0.8, wind: -1 };
    const showJ = cp.jDuck < 0.999, showM = cp.mDuck < 0.999;
    if (showJ) {
      LOOK.castShadow(ctx, { x: cp.jx, y: FEET, h: JHr * (1 - 0.6 * cp.jDuck), k: SHADOW_K, S, alpha: 0.26 * (1 - cp.jDuck), draw: (g) => FILM.cast.sam(g, Object.assign({}, jRun, { y: FEET })) });
    }
    if (showM) {
      LOOK.castShadow(ctx, { x: cp.mx, y: FEET + 6, h: mh * (1 - 0.6 * cp.mDuck), k: SHADOW_K, S, alpha: 0.26 * (1 - cp.mDuck), draw: (g) => FILM.cast.ava(g, Object.assign({}, mRun, { y: FEET + 6 })) });
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(-200, -200, W + 400, FEET + 8 - 14 * Math.max(cp.mDuck, cp.jDuck) + 200);
    ctx.clip();
    if (showJ) FILM.cast.sam(ctx, jRun);
    if (showM) FILM.cast.ava(ctx, mRun);
    ctx.restore();
    drawLimo(ctx, C, t, B);
    ctx.restore();

    ctx.save();
    cam(0.7);
    LOOK.drawLight(ctx, C.air, { x: 6 * Math.sin(t * 0.4), alpha: 0.8 + 0.06 * Math.sin(t * 0.9) });
    ctx.restore();

    ctx.save();
    cam(1);
    const fade = 1 - sstep(B.go, B.go + 0.8, t);
    if (fade > 0.01) {
      LOOK.particles(ctx, t, {
        seed: sd('rice'), count: 170, area: [60, 360, 720, 540], vel: [26, 170], spread: 0.45, sway: 9, swayHz: 0.8,
        size: [2, 3.4], spin: 7, alpha: [0.55 * fade, 0.95 * fade], draw: grain,
      });
      drawTosses(ctx, t, fade);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    ctx.save();
    LOOK.camera(ctx, { t: Math.min(t, tDay), dur: tDay, focus: FOCUS, push: 0.045, pan: [16, 0], depth: 1.15 });
    drawGuests(C.front, FRONT, onTwos(t), 'rgb(82,54,70)', FRONT_R);
    blitRegion(ctx, C.front, FRONT_R);
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const dur = info.dur;
      const t = Math.max(0, Math.min(tIn, dur));
      const S = info.S || FILM.S || 1;
      const C = statics(S);
      SET().statics(S);
      const B = beats(info);
      if (t < B.night) drawSunset(ctx, t, B, C, S);
      else SET().drawHotel(ctx, t - B.night, dur - B.night, S);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
