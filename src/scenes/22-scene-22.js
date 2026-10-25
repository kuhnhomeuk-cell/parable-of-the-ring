// scenes/22-scene-22.js: procedural scene. Shot timing comes from src/timeline.js.
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

  const ID = 'scene-22';
  const LIB = FILM.lib, LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const INK = '#1F1712';
  const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';

  const beatsOf = (info) => {
    const b = info.shot.beats;
    const n = b[0].t;
    const w = (word, k, fb) => wordT(info, word, k, fb);
    return {
      no: w('tokfj', 0, n), sports: w('tokfk', 0, n + 0.3), no2: w('tokfj', 1, n + 1.4), dances: w('tokfl', 0, n + 1.5),
      no3: w('tokfj', 2, n + 2.4), dates: w('tokfm', 0, n + 2.9), end: info.dur,
    };
  };

  const GLASS = { x0: 282, x1: 462, y0: 296, y1: 604 };
  const CAL = { x: 168, y: 192, w: 104, h: 120 };
  const MONTHS = ['MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST'];

  const tint = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const HAZE = [236, 228, 206];
  const mixc = (c, k) => [Math.round(lerp(c[0], HAZE[0], k)), Math.round(lerp(c[1], HAZE[1], k)), Math.round(lerp(c[2], HAZE[2], k))];
  const fade = 0.32;

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function walker(ctx, x, y, h, ph, sp) {
    const s = h / 160;
    const bob = Math.abs(Math.sin(ph * TAU)) * 3 * s;
    const sw = Math.sin(ph * TAU);
    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(s, s);
    const C = (c) => tint(mixc(c, fade), 1);
    ctx.fillStyle = C(sp.legs);
    for (const k of [-1, 1]) {
      ctx.save();
      ctx.translate(k * 6, -62);
      ctx.rotate(0.35 * sw * k);
      rr(ctx, -7, 0, 14, 62, 6);
      ctx.fill();
      ctx.restore();
    }
    if (sp.skirt) {
      ctx.fillStyle = C(sp.skirt);
      ctx.beginPath();
      const hem = sp.long ? -2 : -40;
      ctx.moveTo(-14, -92);
      ctx.lineTo(14, -92);
      ctx.quadraticCurveTo(26 + 3 * sw, hem - 10, 30 + 3 * sw, hem);
      ctx.lineTo(-30 + 3 * sw, hem);
      ctx.quadraticCurveTo(-26 + 3 * sw, hem - 10, -14, -92);
      ctx.closePath();
      ctx.fill();
    }
    const arm = (k, a) => {
      ctx.save();
      ctx.translate(2 * k, -108);
      ctx.rotate(a);
      ctx.fillStyle = C(sp.sleeve || sp.top);
      rr(ctx, -5.5, 0, 11, 40, 5);
      ctx.fill();
      ctx.fillStyle = C(sp.skin);
      ctx.beginPath();
      ctx.arc(0, 42, 6, 0, TAU);
      ctx.fill();
      ctx.restore();
    };
    if (sp.farArm !== false) arm(-1, sp.farArmA != null ? sp.farArmA : -0.4 * sw);
    ctx.fillStyle = C(sp.top);
    rr(ctx, -15, -116, 30, 58, 11);
    ctx.fill();
    if (sp.tie) {
      ctx.fillStyle = C([250, 248, 240]);
      ctx.beginPath();
      ctx.moveTo(-2, -116);
      ctx.lineTo(14, -116);
      ctx.lineTo(8, -84);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = C(sp.tie);
      ctx.beginPath();
      ctx.moveTo(6, -110);
      ctx.lineTo(-2, -116);
      ctx.lineTo(-2, -104);
      ctx.closePath();
      ctx.moveTo(6, -110);
      ctx.lineTo(14, -116);
      ctx.lineTo(14, -104);
      ctx.closePath();
      ctx.fill();
    }
    if (sp.number) {
      ctx.fillStyle = C([250, 246, 236]);
      ctx.font = `800 20px ${SANS}`;
      ctx.textAlign = 'center';
      ctx.fillText(sp.number, 2, -80);
    }
    ctx.fillStyle = C(sp.skin);
    ctx.beginPath();
    ctx.ellipse(3, -142, 21, 23, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = C([50, 40, 34]);
    for (const ex of [8, 18]) {
      ctx.beginPath();
      ctx.arc(ex, -140, 2.6, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = C(sp.hair);
    ctx.beginPath();
    ctx.ellipse(0, -150, 22, 17, 0, Math.PI * 0.95, Math.PI * 2.08);
    ctx.fill();
    if (sp.ponytail) {
      ctx.beginPath();
      ctx.ellipse(-22, -138 + 2 * sw, 8, 16, 0.4, 0, TAU);
      ctx.fill();
    }
    if (sp.longHair) {
      rr(ctx, -24, -158, 18, 46, 8);
      ctx.fill();
    }
    if (sp.flower) {
      ctx.fillStyle = C([236, 120, 150]);
      ctx.beginPath();
      ctx.arc(-12, -104, 6, 0, TAU);
      ctx.fill();
    }
    if (sp.nearArm !== false) arm(1, sp.nearArmA != null ? sp.nearArmA : 0.4 * sw);
    ctx.restore();
  }

  function ball(ctx, x, y, r) {
    ctx.fillStyle = tint(mixc([214, 110, 44], fade), 1);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = tint(mixc([120, 56, 24], fade), 0.9);
    ctx.lineWidth = r * 0.12;
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.lineTo(x + r, y);
    ctx.moveTo(x, y - r);
    ctx.lineTo(x, y + r);
    ctx.stroke();
  }

  const SKIN = [[236, 196, 160], [196, 140, 100], [150, 98, 66], [240, 204, 172]];
  function passers(ctx, t, B) {
    const cx = (GLASS.x0 + GLASS.x1) / 2;
    const v = 150;
    const feet = 662;
    const K = 1.26;
    {
      const x = cx + (t - B.sports) * v * 1.25;
      if (x > GLASS.x0 - 140 && x < GLASS.x1 + 140) {
        const ph = (x - cx) / (70 * K);
        walker(ctx, x, feet, 172 * K, ph, { skin: SKIN[1], hair: [40, 30, 24], top: [200, 60, 50], sleeve: [200, 60, 50], legs: [70, 80, 110], number: '23', nearArmA: -0.5 });
        const bounce = Math.abs(Math.sin(ph * Math.PI * 2));
        ball(ctx, x + 32 * K, feet - (64 + 36 * bounce) * K, 13 * K);
        walker(ctx, x - 62 * K, feet + 4, 160 * K, ph + 0.4, { skin: SKIN[0], hair: [150, 100, 50], top: [60, 110, 170], legs: [200, 196, 184] });
      }
    }
    {
      const x = cx + (t - B.dances) * v;
      if (x > GLASS.x0 - 140 && x < GLASS.x1 + 140) {
        const ph = (x - cx) / (62 * K);
        walker(ctx, x - 22 * K, feet + 2, 166 * K, ph + 0.5, { skin: SKIN[2], hair: [20, 18, 18], top: [36, 36, 48], sleeve: [36, 36, 48], legs: [30, 30, 40], tie: [20, 20, 24], nearArmA: -0.2 });
        walker(ctx, x + 26 * K, feet, 152 * K, ph, { skin: SKIN[3], hair: [196, 150, 80], top: [236, 140, 176], skirt: [236, 140, 176], long: true, sleeve: SKIN[3], legs: SKIN[3], longHair: true, flower: true, farArmA: 0.25 });
      }
    }
    {
      const x = cx + (t - B.dates) * v * 0.9;
      if (x > GLASS.x0 - 140 && x < GLASS.x1 + 140) {
        const ph = (x - cx) / (62 * K);
        const sw = 0.25 * Math.sin(ph * TAU);
        walker(ctx, x + 30 * K, feet, 154 * K, ph, { skin: SKIN[0], hair: [120, 60, 40], top: [246, 210, 90], skirt: [90, 130, 190], legs: SKIN[0], sleeve: SKIN[0], ponytail: true, farArmA: 0.75 + sw });
        walker(ctx, x - 22 * K, feet + 2, 166 * K, ph + 0.5, { skin: SKIN[1], hair: [60, 40, 26], top: [90, 150, 110], legs: [70, 80, 110], nearArmA: -0.75 - sw });
        ctx.fillStyle = tint(mixc(SKIN[0], fade), 1);
        ctx.beginPath();
        ctx.arc(x + 4 * K, feet - (112 * (166 / 160) - 52) * K, 7 * K, 0, TAU);
        ctx.fill();
        const hu = clamp01((t - B.dates + 0.1) / 1.2);
        if (hu > 0 && hu < 1) {
          const hx = x + 4 * K, hy = feet - 196 * K - 40 * hu * K, hs = 9 * K * (0.6 + 0.4 * Math.sin(Math.PI * Math.min(1, hu * 2)));
          ctx.fillStyle = `rgba(230,110,140,${0.9 * Math.sin(Math.PI * hu)})`;
          ctx.beginPath();
          ctx.moveTo(hx, hy + hs);
          ctx.bezierCurveTo(hx - hs * 1.6, hy - hs * 0.2, hx - hs * 0.7, hy - hs * 1.4, hx, hy - hs * 0.5);
          ctx.bezierCurveTo(hx + hs * 0.7, hy - hs * 1.4, hx + hs * 1.6, hy - hs * 0.2, hx, hy + hs);
          ctx.fill();
        }
      }
    }
  }

  function calendarPage(ctx, w, h, month, year, dim) {
    ctx.fillStyle = `rgb(${250 - dim},${246 - dim},${236 - dim})`;
    ctx.fillRect(-w / 2, 0, w, h);
    ctx.fillStyle = '#B33A2E';
    ctx.fillRect(-w / 2, 0, w, h * 0.3);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF4E4';
    ctx.font = `800 ${h * 0.11}px ${SANS}`;
    ctx.fillText(month, 0, h * 0.13);
    ctx.font = `800 ${h * 0.12}px ${SANS}`;
    ctx.fillText(year, 0, h * 0.26);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
      const x = -w / 2 + w * 0.08 + c * w * 0.122, y = h * 0.37 + r * h * 0.12;
      ctx.fillStyle = 'rgba(80,70,60,0.35)';
      ctx.fillRect(x, y, w * 0.085, h * 0.075);
      if (c === 6) {
        ctx.strokeStyle = '#C0392B';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x - 1, y + h * 0.04);
        ctx.lineTo(x + w * 0.035, y + h * 0.075);
        ctx.lineTo(x + w * 0.1, y - h * 0.01);
        ctx.stroke();
      }
    }
  }

  function calendar(ctx, page, year) {
    const { x, y, w, h } = CAL;
    const i = Math.floor(page), f = page - i;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(40,30,24,0.22)';
    ctx.fillRect(-w / 2 + 5, 6, w, h);
    calendarPage(ctx, w, h, MONTHS[Math.min(MONTHS.length - 1, i + 1)], year, 0);
    if (f < 0.999) {
      const a = LIB.ease.inOutSine(f) * Math.PI;
      const k = Math.cos(a);
      ctx.save();
      ctx.scale(1, k);
      if (k > 0) calendarPage(ctx, w, h, MONTHS[Math.min(MONTHS.length - 1, i)], year, Math.round(30 * (1 - k)));
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

  function bill(ctx, x, y, s, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(s, s);
    ctx.fillStyle = '#B9CFA4';
    ctx.fillRect(-22, -10, 44, 20);
    ctx.fillStyle = '#93AE80';
    ctx.fillRect(-22, -10, 44, 4);
    ctx.lineWidth = 2;
    ctx.strokeStyle = INK;
    ctx.strokeRect(-22, -10, 44, 20);
    ctx.fillStyle = '#3E5A36';
    ctx.font = `800 11px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText('00', 0, 5);
    ctx.restore();
  }

  const SOFT = new Map();

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

      const PAY = [0.12, B.no2 + 0.05, B.no3 + 0.25];
      let reach = 0, paid = 0;
      for (const p0 of PAY) {
        reach = Math.max(reach, LIB.ease.inOutSine((t - p0) / 0.4) * (1 - LIB.ease.inOutSine((t - p0 - 0.75) / 0.45)));
        paid += clamp01((t - p0 - 0.55) / 0.7);
      }
      const page = clamp01((t - PAY[0] - 0.4) / 0.5) + clamp01((t - PAY[1] - 0.4) / 0.5) + clamp01((t - PAY[2] - 0.4) / 0.5);

      const jo = { x: 566, y: V.custFloor, h: V.custH, t, facing: 1, age: 16, outfit: 'casual', blinkOffset: 0.9, look: 0.05, expr: 'neutral' };
      if (reach > 0.001) Object.assign(jo, { pose: 'hug', poseAmt: 0.75 * reach, lean: 0.2 * reach });
      const jq = J.pose(jo);

      const head = J.pose({ x: jo.x, y: jo.y, h: jo.h, t: 0, facing: 1, age: 16, outfit: 'casual' }).head;
      const GC = [(GLASS.x0 + GLASS.x1) / 2, (GLASS.y0 + GLASS.y1) / 2];
      const CUT = setupAt([
        { at: 0, z: 1.3, c: [480, 590], push: 0.05, pan: [-14, 0] },
        { at: B.no, z: 2.7, c: [GC[0] - 24, GC[1] - 6], push: 0.07, pan: [-16, 0] },
        { at: B.no2, z: 1.75, c: [470, 520], push: 0.06, pan: [12, -6] },
        { at: B.no3, z: 2.2, c: [lerp(head[0], GC[0], 0.55), head[1] - 10], push: 0.07, pan: [-10, 8] },
      ], t, info.dur);
      const cam = (g, depth) => frame(g, CUT, depth);

      ctx.save();
      cam(ctx, ST.PAR.back);
      ST.drawBack(ctx, C, { t });
      ctx.save();
      ctx.beginPath();
      ctx.rect(GLASS.x0, GLASS.y0, GLASS.x1 - GLASS.x0, GLASS.y1 - GLASS.y0);
      ctx.clip();
      const GW = GLASS.x1 - GLASS.x0, GH = GLASS.y1 - GLASS.y0, PR = Math.round(0.42 * Math.max(1, CUT.z / 1.3) * 100) / 100;
      const sk = `${S}|${PR}`;
      if (!SOFT.has(sk)) SOFT.set(sk, { c: FILM.makeCanvas(Math.ceil(GW * PR * S), Math.ceil(GH * PR * S)) });
      const SF = SOFT.get(sk);
      const sg = SF.c.getContext('2d');
      sg.setTransform(1, 0, 0, 1, 0, 0);
      sg.clearRect(0, 0, SF.c.width, SF.c.height);
      sg.setTransform(PR * S, 0, 0, PR * S, -GLASS.x0 * PR * S, -GLASS.y0 * PR * S);
      passers(sg, t, B);
      ctx.drawImage(SF.c, GLASS.x0, GLASS.y0, GW, GH);
      ctx.fillStyle = 'rgba(244,236,214,0.16)';
      ctx.fillRect(GLASS.x0, GLASS.y0, GLASS.x1 - GLASS.x0, GLASS.y1 - GLASS.y0);
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(GLASS.x0 + 30, GLASS.y1);
      ctx.lineTo(GLASS.x0 + 110, GLASS.y0);
      ctx.stroke();
      ctx.restore();
      calendar(ctx, page, '1988');
      ctx.restore();

      const so = { x: V.staffX[0] + 10, y: V.floor, h: V.JH * SM.HK, t, facing: -1, pose: 'barelyLook', expr: 'scowl', warmth: 0.1, counterY: V.counterY, light: V.light };
      ctx.save();
      cam(ctx, 0.92);
      SM(ctx, so);
      ST.drawCounter(ctx, C, { t });
      ctx.restore();

      ctx.save();
      cam(ctx, 1);
      if (CUT.i !== 1) FILM.cast.receiptStack(ctx, { x: 668, y: V.counterY - 34, size: 54, count: 4 + paid, t });
      LOOK.contactShadow(ctx, { x: jo.x, y: jo.y, h: jo.h, alpha: 0.3 });
      J(ctx, jo);
      if (reach > 0.05) bill(ctx, jq.hands[0][0] + 10, jq.hands[0][1] - 4, 0.9, -0.15);
      ctx.restore();

      ctx.save();
      cam(ctx, ST.PAR.air);
      ST.drawLight(ctx, C, { t });
      ctx.restore();

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
