// scenes/28-scene-28.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-28';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const SETS = FILM.sets.barracks;
  const { sstep, clamp01, lerp } = LOOK;
  const seg = LIB.seg;
  const RM = SETS.GEO.RM;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;
  const TAU = Math.PI * 2;

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

  const FOCUS = [480, 660];
  const PUSH = 0.03;
  let B = null;
  function keysOf(info) {
    const at = wordT(info, 'tokck', 0, 0.2);
    const dumped = wordT(info, 'tokgr', 0, 2.49);
    const sniffed = wordT(info, 'tokgt', 0, 4.59);
    const socks = wordT(info, 'tokgu', 0, 5.35);
    const threw = wordT(info, 'tokgv', 0, 5.97);
    const room = wordT(info, 'tokgy', 0, 7.29);
    const land = threw + 0.72;
    return {
      on: Math.max(0.15, at - 0.05),
      grab: dumped - 0.8,
      dumped: dumped + 0.05,
      point: dumped + 0.39,
      snatch: sniffed - 0.35,
      sniff: sniffed - 0.08,
      socks: socks + 0.05,
      wind: threw - 0.27,
      threw: threw + 0.12,
      land,
      split: land + 0.2,
      glint: room + 0.05,
      cutRoom: room - 0.12,
      cutSniff: sniffed - 0.1,
      cutThrew: threw - 0.08,
      cutDump: dumped - 0.06,
    };
  }

  const SAM = { x: 104, y: 814, h: 214 };
  const SARGE = { x: 430, y: 840, h: 254 };
  const RECRUITS = [[612, 1, -1, 0.6], [800, 3, -1, 1.7], [962, 4, -1, 2.9]];
  const RECRUIT_H = 170;
  const BOX = 50;
  const SOCK = 66;
  const LAND = [880, 850];
  const BOX_AT = [784, 852];
  const RING_SOCK_FLOOR = [362, 852];

  const PILE = [
    ['trousers', 300, 846, -0.2, 0.0], ['tee', 270, 862, 0.15, 0.05], ['boot', 236, 852, -0.4, 0.1], ['boot', 330, 866, 0.6, 0.08],
    ['roll', 400, 860, 0, 0.12], ['roll', 214, 868, 0, 0.04], ['kit', 446, 868, 0.2, 0.09], ['tee2', 380, 840, -0.3, 0.03],
  ];

  const cam = (ctx, t, dur, depth) => LOOK.camera(ctx, { t, dur, focus: FOCUS, push: PUSH, depth });

  function lightsOn(t) {
    const f = Math.round((t - B.on) * 24);
    if (f < 0) return 0;
    const seq = [1, 1, 0.15, 0.1, 1, 0.55, 1];
    return f < seq.length ? seq[f] : 1;
  }

  const keyed = (t, keys) => {
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], LIB.ease.inOutSine((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])));
    }
    return keys[keys.length - 1][1];
  };
  const dumpU = (t) => keyed(t, [[B.grab, 0], [B.grab + 0.45, 0.3], [B.dumped - 0.14, 0.32], [B.dumped, 0.74], [B.point, 1]]);
  const throwU = (t) => keyed(t, [[B.wind, 0.26], [B.threw - 0.14, 0.32], [B.threw, 0.74], [B.wind + 0.8, 1]]);

  function sergeantPose(t) {
    const o = { x: SARGE.x, y: SARGE.y, h: SARGE.h, t, facing: -1, pose: 'shout' };
    if (t >= B.grab && t < B.point) Object.assign(o, { pose: 'fling', u: dumpU(t) });
    else if (t >= B.point && t < B.snatch) Object.assign(o, { pose: 'point', expr: 'shout' });
    else if (t >= B.snatch && t < B.sniff) Object.assign(o, { pose: 'fling', u: lerp(0.16, 0.46, seg(t, B.snatch, B.sniff, 'inOutSine')) });
    else if (t >= B.sniff && t < B.wind) {
      const rec = Math.exp(-Math.pow((t - B.socks - 0.12) / 0.16, 2));
      Object.assign(o, { pose: 'sniff', facing: 1, x: SARGE.x - 6 * rec, expr: rec > 0.3 ? 'shout' : 'stern' });
    } else if (t >= B.wind && t < B.wind + 0.8) Object.assign(o, { pose: 'fling', facing: 1, u: throwU(t) });
    else if (t >= B.wind + 0.8) Object.assign(o, { pose: 'stand', facing: 1 });
    return o;
  }

  const INK = '#1F1712';
  function inked(ctx, path, fill, lw) {
    ctx.beginPath();
    path(ctx);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw || 2.6;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
  const rrP = (x, y, w, h, r) => (c) => c.roundRect(x, y, w, h, r);

  function drawItem(ctx, kind, x, y, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    if (kind === 'trousers') {
      inked(ctx, rrP(-30, -10, 60, 18, 5), 'rgb(92,100,64)');
      ctx.fillStyle = 'rgb(60,70,42)';
      ctx.fillRect(-24, -4, 18, 6);
      ctx.fillRect(4, 0, 14, 5);
    } else if (kind === 'tee' || kind === 'tee2') {
      inked(ctx, rrP(-24, -8, 48, 15, 5), kind === 'tee' ? 'rgb(232,232,222)' : 'rgb(104,110,72)');
      ctx.fillStyle = 'rgba(30,30,20,0.18)';
      ctx.fillRect(-20, 2, 40, 3);
    } else if (kind === 'boot') {
      inked(ctx, (c) => {
        c.moveTo(-8, -26);
        c.lineTo(8, -26);
        c.lineTo(9, -6);
        c.quadraticCurveTo(24, -6, 26, 4);
        c.lineTo(-10, 4);
        c.closePath();
      }, 'rgb(36,32,30)');
    } else if (kind === 'roll') {
      inked(ctx, (c) => c.ellipse(0, -5, 11, 8, 0, 0, TAU), 'rgb(240,236,226)', 2.2);
      ctx.fillStyle = 'rgb(46,64,112)';
      ctx.fillRect(-10, -7, 4, 4);
    } else if (kind === 'kit') {
      inked(ctx, rrP(-14, -12, 28, 14, 4), 'rgb(70,60,52)');
      ctx.fillStyle = 'rgb(200,180,120)';
      ctx.fillRect(-2, -8, 4, 3);
    }
    ctx.restore();
  }

  function drawBundle(ctx, x, y, k) {
    drawItem(ctx, 'trousers', x - 4, y + 6, -0.3);
    drawItem(ctx, 'tee', x + 6, y - 2, 0.25);
    drawItem(ctx, 'roll', x - 12, y - 6, 0);
    if (k > 0.5) drawItem(ctx, 'boot', x + 14, y + 12, 0.5);
  }

  function ringSock(ctx, x, y, rot, size) {
    const k = size / 100;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.ellipse(-8 * k, -24 * k, 19 * k + 1.5, 14 * k + 1.5, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#F4F0E8';
    ctx.beginPath();
    ctx.ellipse(-8 * k, -24 * k, 19 * k - 1.5, 14 * k - 1.5, 0, 0, TAU);
    ctx.fill();
    FILM.cast.sock(ctx, { x: 0, y: 0, size, lw: 2.6 });
    ctx.fillStyle = 'rgba(30,44,110,0.2)';
    ctx.beginPath();
    ctx.roundRect(-20 * k, -33 * k, 24 * k, 18 * k, 4 * k);
    ctx.fill();
    ctx.restore();
  }
  const plainSock = (ctx, x, y, rot, size) => FILM.cast.sock(ctx, { x, y, size, rot, lw: 2.6 });

  function stink(ctx, x, y, t, a) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.strokeStyle = `rgba(150,170,70,${0.8 * a})`;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const ph = (t * 1.4 + i / 3) % 1;
      const x0 = x - 16 + i * 16, y0 = y - 10 - ph * 46;
      ctx.globalAlpha = Math.sin(ph * Math.PI);
      ctx.beginPath();
      for (let j = 0; j <= 8; j++) {
        const yy = y0 - j * 4;
        const xx = x0 + 5 * Math.sin(j * 0.9 + t * 6 + i);
        if (j === 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function impact(ctx, x, y, t, t0, big) {
    const s = (t - t0) / 0.35;
    if (s <= 0 || s >= 1) return;
    ctx.save();
    ctx.strokeStyle = `rgba(31,23,18,${0.8 * (1 - s)})`;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    const n = big ? 6 : 4;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI * (0.12 + 0.76 * (i / (n - 1)));
      const r0 = 14 + 22 * s, r1 = r0 + (big ? 16 : 10) * (1 - s);
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0 * 0.7);
      ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1 * 0.7);
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(200,210,190,${0.35 * (1 - s)})`;
    for (const dx of [-18, 0, 16]) {
      ctx.beginPath();
      ctx.ellipse(x + dx * (1 + s), y - 4 - 6 * s, 10 + 10 * s, 5 + 3 * s, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function hop(a, b, t, t0, t1, h) {
    const k = clamp01((t - t0) / (t1 - t0));
    return [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - h * 4 * k * (1 - k), k];
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const dur = info.dur;
      const t0 = Math.max(0, Math.min(tIn, dur));
      const t = t0;
      B = keysOf(info);
      const S = info.S || FILM.S || 1;
      const C = SETS.statics(S, 'room');
      const on = lightsOn(t);

      ctx.save();
      rig(ctx, t, dur, [
        { at: 0, f: [520, 600], z: 1.06, d: [-12, -4], p: 0.06 },
        { at: B.cutDump, f: [330, 720], z: 2.05, d: [10, -8], p: 0.07 },
        { at: B.cutSniff, f: [450, 640], z: 2.5, d: [-8, -10], p: 0.08 },
        { at: B.cutThrew, f: [620, 690], z: 1.18, d: [18, 0], p: 0.05 },
        { at: B.cutRoom, f: [810, 812], z: 2.6, d: [-6, -6], p: 0.08 },
      ]);

      ctx.save();
      cam(ctx, t0, dur, 0.25);
      ctx.drawImage(C.far, 0, 0, 1080, 1080);
      ctx.restore();

      ctx.save();
      cam(ctx, t0, dur, 0.55);
      ctx.drawImage(C.mid, 0, 0, 1080, 1080);
      for (const [x, v, f, bo] of RECRUITS) {
        LOOK.contactShadow(ctx, { x, y: RM.wallFoot, h: RECRUIT_H, alpha: 0.3, dx: 0 });
        const startle = t > B.land ? 'wide' : 'neutral';
        FILM.cast.soldier(ctx, { variant: v, x, y: RM.wallFoot, h: RECRUIT_H, t, facing: f, age: 18, outfit: 'fatigues-camp', helmet: false, blinkOffset: bo, expr: v === 3 ? startle : 'neutral' });
      }
      ctx.restore();

      ctx.save();
      cam(ctx, t0, dur, 1);
      ctx.drawImage(C.near, 0, 0, 1080, 1080);
      SETS.lockerItems(ctx, t < B.grab + 0.4 ? 1 : 0.12);

      const so = sergeantPose(t);
      const SP = FILM.cast.drillSergeant.pose(so);

      const rel = B.dumped;
      const mid0 = (() => {
        const q = FILM.cast.drillSergeant.pose({ x: SARGE.x, y: SARGE.y, h: SARGE.h, t: rel, facing: -1, pose: 'fling', u: 0.74 });
        return q.fling ? q.fling.mid : [SARGE.x - 60, SARGE.y - 120];
      })();
      if (t >= rel) {
        for (const [kind, x, y, rot, st] of PILE) {
          const [px, py, k] = hop(mid0, [x, y], t, rel + st * 0.5, rel + 0.24 + st, 24);
          drawItem(ctx, kind, px, py, rot * k + (1 - k) * 2.5);
        }
      }
      let ringSockAt = null;
      if (t >= rel && t < B.snatch) {
        const [px, py, k] = hop(mid0, RING_SOCK_FLOOR, t, rel, rel + 0.28, 20);
        ringSockAt = [px, py, lerp(-2.2, -1.45, k), SOCK];
        if (k >= 1) impact(ctx, RING_SOCK_FLOOR[0], RING_SOCK_FLOOR[1], t, rel + 0.28, false);
      }
      impact(ctx, 320, 856, t, rel + 0.2, true);

      LOOK.contactShadow(ctx, { x: SAM.x, y: SAM.y, h: SAM.h, dx: 0, alpha: 0.32 });
      LOOK.contactShadow(ctx, { x: SARGE.x, y: SARGE.y, h: SARGE.h, dx: 0, alpha: 0.34 });
      const jExpr = t > B.land + 0.05 ? 'wide' : t > B.dumped ? 'squint' : 'neutral';
      FILM.cast.sam(ctx, { x: SAM.x, y: SAM.y, h: SAM.h, t, age: 18, outfit: 'fatigues-camp', facing: 1, expr: jExpr, exprAmt: jExpr === 'squint' ? 0.4 : 1, blinkOffset: 1.3 });
      if (ringSockAt) ringSock(ctx, ringSockAt[0], ringSockAt[1], ringSockAt[2], ringSockAt[3]);
      FILM.cast.drillSergeant(ctx, so);

      if (so.pose === 'fling' && SP.fling && SP.fling.grip && t < B.point) drawBundle(ctx, SP.fling.mid[0], SP.fling.mid[1], so.u);
      if (t >= B.snatch && t < B.sniff) {
        const k = seg(t, B.snatch, B.snatch + 0.2, 'outCubic');
        const hand = SP.fling ? SP.fling.mid : SP.hands[0];
        ringSock(ctx, lerp(RING_SOCK_FLOOR[0], hand[0], k), lerp(RING_SOCK_FLOOR[1], hand[1] + 10, k), lerp(-1.45, -0.4, k), SOCK);
        plainSock(ctx, lerp(RING_SOCK_FLOOR[0] - 20, hand[0] - 8, k), lerp(RING_SOCK_FLOOR[1] + 4, hand[1] + 14, k), -0.2, SOCK * 0.95);
      }
      if (so.pose === 'sniff' && SP.sock) {
        const { angle } = SP.sock;
        const nose = SP.mouth || SP.head;
        const x = lerp(SP.sock.x, nose[0], 0.4), y = lerp(SP.sock.y, nose[1], 0.4) - 12;
        plainSock(ctx, x + 6, y + 14, angle + 0.5, SOCK * 0.95);
        ringSock(ctx, x, y + 20, angle + 0.2, SOCK);
        stink(ctx, x, y - 8, t, sstep(B.sniff, B.sniff + 0.3, t));
      }
      if (t >= B.wind && t < B.threw && SP.fling) {
        const m = SP.fling.mid;
        plainSock(ctx, m[0] + 8, m[1] + 22, 0.6, SOCK * 0.95);
        ringSock(ctx, m[0], m[1] + 24, 0.3, SOCK);
      }
      const relPt = (() => {
        const q = FILM.cast.drillSergeant.pose({ x: SARGE.x, y: SARGE.y, h: SARGE.h, t: B.threw, facing: 1, pose: 'fling', u: 0.74 });
        return q.fling ? q.fling.mid : [SARGE.x + 60, SARGE.y - 120];
      })();
      if (t >= B.threw) {
        const [x, y, k] = hop([relPt[0], relPt[1] + 20], LAND, t, B.threw, B.land, 150);
        const spin = k < 1 ? 9 * k : 9;
        const [x2, y2, k2] = hop([relPt[0] - 10, relPt[1] + 20], [LAND[0] + 56, LAND[1] - 2], t, B.threw + 0.03, B.land + 0.08, 120);
        plainSock(ctx, x2, y2, k2 < 1 ? -7 * k2 : -1.7, SOCK * 0.95);
        if (k < 1) {
          ctx.save();
          ctx.strokeStyle = 'rgba(31,23,18,0.5)';
          ctx.lineWidth = 2.4;
          ctx.lineCap = 'round';
          for (let i = 0; i < 3; i++) {
            const kk = Math.max(0, k - 0.06 - i * 0.02);
            const [ax, ay] = hop([relPt[0], relPt[1] + 20], LAND, B.threw + kk * (B.land - B.threw), B.threw, B.land, 150);
            ctx.beginPath();
            ctx.moveTo(ax - 18, ay - 8 + i * 8);
            ctx.lineTo(ax - 44, ay - 4 + i * 8);
            ctx.stroke();
          }
          ctx.restore();
          ringSock(ctx, x, y, 0.3 + spin, SOCK);
        } else {
          ringSock(ctx, LAND[0], LAND[1], -1.62, SOCK);
          impact(ctx, LAND[0], LAND[1], t, B.land, false);
        }
      }
      if (t >= B.land && t < B.split) {
        const [bx, by, k] = hop([LAND[0] - 20, LAND[1] - 10], BOX_AT, t, B.land, B.split, 34);
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(-5 * k);
        FILM.cast.ringBox(ctx, { x: 0, y: 0, size: BOX, t, open: 0, lw: 2.4 });
        ctx.restore();
      }
      if (t >= B.split) {
        FILM.cast.ringBox(ctx, { x: BOX_AT[0], y: BOX_AT[1], size: BOX, t, broken: true, ring: true, lw: 2.4, sparkle: 0.6 * sstep(B.glint - 0.3, B.glint, t) });
        impact(ctx, BOX_AT[0], BOX_AT[1], t, B.split, true);
        const g = Math.exp(-Math.pow((t - B.glint) / 0.35, 2));
        const d = [BOX_AT[0] - BOX * 0.42, BOX_AT[1] - BOX * 0.62];
        if (g > 0.02) {
          LOOK.bloom(ctx, { x: d[0], y: d[1], r: 40, alpha: 0.55 * g, mid: 0.2 * g });
          LOOK.glint(ctx, { x: d[0], y: d[1], size: 8 + 16 * g, alpha: 0.95 * g, rot: 0.1 });
        }
      }

      ctx.drawImage(C.top, 0, 0, 1080, 1080);
      for (const [x0, x1, y] of RM.fixtures) SETS.tube(ctx, x0, x1, y, on);
      ctx.restore();

      if (on > 0.01) {
        ctx.save();
        cam(ctx, t0, dur, 0.7);
        LOOK.drawLight(ctx, C.light, { alpha: 0.7 * on });
        ctx.restore();
      }
      if (on < 0.99) {
        ctx.save();
        ctx.fillStyle = `rgba(8,12,30,${0.86 * (1 - on)})`;
        ctx.fillRect(0, 0, 1080, 1080);
        cam(ctx, t0, dur, 0.25);
        LOOK.drawLight(ctx, C.moon, { alpha: 0.8 * (1 - on) });
        ctx.restore();
      }
      ctx.restore();
      const slam = LOOK.flashEnv(t, B.on, { rise: 1, fall: 8 });
      if (slam > 0.01) LOOK.exposure(ctx, 0.5 * slam, { color: [220, 250, 226] });
      const vg = ctx.createRadialGradient(520, 560, 320, 520, 560, 900);
      vg.addColorStop(0, 'rgba(10,26,20,0)');
      vg.addColorStop(1, 'rgba(8,22,18,0.45)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, 1080, 1080);

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
