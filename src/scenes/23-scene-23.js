// scenes/23-scene-23.js: procedural scene. Shot timing comes from src/timeline.js.
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

  const ID = 'scene-23';
  const LIB = FILM.lib, LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';

  const beatsOf = (info) => {
    const b = info.shot.beats;
    const a = b[0].t;
    const w = (word, k, fb) => wordT(info, word, k, fb);
    return {
      week2: w('tokeq', 1, a + 0.9), the: w('tokam', 0, a + 1.5), grew: w('tokfo', 0, a + 2.1), young: w('tokfp', 0, a + 3.0),
      man: w('tokfq', 0, a + 3.45), end: info.dur,
    };
  };

  const CAL = { x: 168, y: 192, w: 104, h: 120 };
  const SHEETS = [{ m: 'JUNE', y: '1988' }, { m: 'JAN', y: '1989' }, { m: 'JUNE', y: '1989' }];
  const X_END = 566;

  function calendarPage(ctx, w, h, sheet, dim) {
    ctx.fillStyle = `rgb(${250 - dim},${246 - dim},${236 - dim})`;
    ctx.fillRect(-w / 2, 0, w, h);
    ctx.fillStyle = '#B33A2E';
    ctx.fillRect(-w / 2, 0, w, h * 0.44);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF4E4';
    ctx.font = `800 ${h * 0.1}px ${SANS}`;
    ctx.fillText(sheet.m, 0, h * 0.13);
    ctx.font = `900 ${h * 0.25}px ${SANS}`;
    ctx.fillText(sheet.y, 0, h * 0.38);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
      const x = -w / 2 + w * 0.08 + c * w * 0.122, y = h * 0.5 + r * h * 0.12;
      ctx.fillStyle = 'rgba(80,70,60,0.35)';
      ctx.fillRect(x, y, w * 0.085, h * 0.075);
    }
  }

  function calendar(ctx, page) {
    const { x, y, w, h } = CAL;
    const i = Math.floor(page), f = page - i;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(40,30,24,0.22)';
    ctx.fillRect(-w / 2 + 5, 6, w, h);
    calendarPage(ctx, w, h, SHEETS[Math.min(SHEETS.length - 1, i + 1)], 0);
    if (f < 0.999) {
      const k = Math.cos(LIB.ease.inOutSine(f) * Math.PI);
      ctx.save();
      ctx.scale(1, k);
      if (k > 0) calendarPage(ctx, w, h, SHEETS[Math.min(SHEETS.length - 1, i)], Math.round(30 * (1 - k)));
      else {
        ctx.fillStyle = 'rgb(226,220,206)';
        ctx.fillRect(-w / 2, 0, w, h);
      }
      ctx.restore();
    }
    ctx.fillStyle = '#5A4A3A';
    ctx.beginPath();
    ctx.arc(0, -4, 3, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const ST = FILM.sets.store;
      const SM = FILM.cast.salesman, J = FILM.cast.sam;
      const C = ST.statics(S, { angle: 'wide', tod: 'day' });
      const V = C.V;
      const B = beatsOf(info);

      const STEPS = [[0.22, B.week2 - 0.02], [B.week2 + 0.3, B.grew - 0.02], [B.grew + 0.3, B.young + 0.02]];
      const AGE_AT = [B.week2, B.grew];
      const h = V.custH;
      const strideAt = (a) => J.stride({ h, age: a });
      const total = 0.5 * (strideAt(15) + strideAt(16) + strideAt(17));
      const walkAt = (tq) => {
        const prog = STEPS.map(([a, b], k) => {
          const u = clamp01((tq - a) / (b - a));
          if (k === 0) return 0.5 * (u < 0.3 ? (u * u) / 0.6 : u - 0.15) / 0.85;
          if (k === 2) return 0.5 * (u > 0.7 ? 1 - ((1 - u) * (1 - u)) / 0.6 - 0.15 : u) / 0.85;
          return 0.5 * u;
        });
        const run = strideAt(15) * prog[0] + strideAt(16) * prog[1] + strideAt(17) * prog[2];
        return { x: X_END - total + run, walk: prog[0] + prog[1] + prog[2] };
      };
      const grow = AGE_AT.map((a) => LIB.ease.inOutSine((t - a) / 0.22));
      const age = 15 + grow[0] + grow[1];
      const WK = walkAt(t);
      const walk = WK.walk;
      const walkAmt = sstep(0.12, 0.4, t) * (1 - sstep(B.young - 0.05, B.young + 0.3, t));
      const stand = sstep(B.man - 0.1, B.man + 0.35, t);
      const jo = {
        x: WK.x, y: V.custFloor, h, t, facing: 1, age, outfit: 'casual', walk, walkAmt, blinkOffset: 1.7,
        look: 0.05 + 0.1 * stand, expr: stand > 0.01 ? 'smileSmall' : 'neutral', exprAmt: stand,
      };
      if (stand > 0.001) Object.assign(jo, { pose: 'chinUp', poseAmt: stand });

      const page = clamp01((t - AGE_AT[0] + 0.05) / 0.3) + clamp01((t - AGE_AT[1] + 0.05) / 0.3);
      const flash = Math.max(LOOK.flashEnv(t, AGE_AT[0], { fall: 9 }), LOOK.flashEnv(t, AGE_AT[1], { fall: 9 }));

      const lookUp = sstep(B.man, B.man + 0.3, t);
      const so = { x: V.staffX[0] + 10, y: V.floor, h: V.JH * SM.HK, t, facing: -1, pose: 'barelyLook', expr: { scowl: 1 - 0.6 * lookUp, surprised: 0.5 * lookUp }, warmth: 0.25, counterY: V.counterY, light: V.light };
      if (t > B.man - 0.6) so.flick = lookUp;

      const headAt = (tq, a) => J.pose({ x: walkAt(tq).x, y: V.custFloor, h, t: 0, facing: 1, age: a, outfit: 'casual' }).head;
      const hC = headAt(B.the + 0.3, 16), hE = headAt(B.young, 17);
      const calC = [CAL.x, CAL.y + CAL.h / 2];
      const sh = SM.pose(Object.assign({}, so, { t: 0, flick: 0 })).head;
      const CUT = setupAt([
        { at: 0, z: 1.3, c: [480, 590], push: 0.05, pan: [18, 0] },
        { at: B.week2, z: 3, c: [calC[0] + 20, calC[1]], push: 0.08, pan: [-12, 6] },
        { at: B.the, z: 1.8, c: [hC[0] + 40, hC[1] + 150], push: 0.06, pan: [16, -6] },
        { at: B.grew, z: 2.7, c: [calC[0] - 10, calC[1] + 10], push: 0.08, pan: [12, -6] },
        { at: B.young, z: 2.1, c: [lerp(hE[0], sh[0], 0.5), lerp(hE[1], sh[1], 0.5) + 60], push: 0.06, pan: [-10, -8] },
      ], t, info.dur);
      const cam = (g, depth) => frame(g, CUT, depth);

      ctx.save();
      cam(ctx, ST.PAR.back);
      ST.drawBack(ctx, C, { t });
      calendar(ctx, page);
      ctx.restore();

      ctx.save();
      cam(ctx, 0.92);
      SM(ctx, so);
      ST.drawCounter(ctx, C, { t });
      ctx.restore();

      ctx.save();
      cam(ctx, 1);
      LOOK.contactShadow(ctx, { x: jo.x, y: jo.y, h: J.height(jo), alpha: 0.3 });
      J(ctx, jo);
      ctx.restore();

      ctx.save();
      cam(ctx, ST.PAR.air);
      ST.drawLight(ctx, C, { t });
      ctx.restore();
      LOOK.exposure(ctx, 0.35 * flash, { strength: 0.4 });

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
