// scenes/47-scene-47.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-47';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;

  const LAY = { mood: 'loss', horizon: 380, shore: 610, wet: 130 };
  const GROUND = 868;
  const JH = 380;
  const JO = { age: 21, outfit: 'swim' };
  const JR = FILM.cast.sam.height(Object.assign({ h: JH }, JO));
  const MH = JR * 0.95;
  const JX = 680;
  const MX = 460;

  const PUNCH_Z = 3.0;
  const PUNCH_AT = [620, 450];

  function beatT(info, frag, dflt) {
    const b = ((info.shot && info.shot.beats) || []).find((x) => String(x.text).indexOf(frag) >= 0);
    return b ? b.t : dflt;
  }
  function wordT(info, tok, fb, from) {
    const sh = info.shot || {};
    const want = tok.toLowerCase();
    for (const c of sh.captions || []) {
      for (const [ft, w] of c.words || []) {
        const lt = ft - (sh.start || 0);
        if (lt >= (from == null ? 0 : from) && String(w).toLowerCase().replace(/[^a-z0-9']/g, '') === want) return lt;
      }
    }
    return fb;
  }
  const LAND_LEAD = 0.25;
  function beats(info) {
    const b0 = beatT(info, 'tokav tokbf toklh', 0.28);
    const b1 = beatT(info, 'tokel tokem', 4.56);
    const helmet = wordT(info, 'tokak', 6.82, b1) - LAND_LEAD;
    return {
      b0, b1,
      punch: wordT(info, 'toklh', 1.74),
      wide: b1 - 0.25,
      carwash: wordT(info, 'tokel', 5.78, b1) - LAND_LEAD,
      helmet,
      battle: wordT(info, 'tokli', 9.01, b1) - LAND_LEAD,
      close: helmet,
    };
  }
  const C2 = { at: [540, 280], z: 1.35 };

  const PW = 276, PH = 186;
  const GAP = 44;
  const PITCH = PW + GAP;
  const STRIP_Y = 214;
  const STRIP_H = PH + 64;

  const PANELS = [
    { key: 'carwash', c: [560, 610], w: 820, paint: paintCarwash },
    { key: 'receipts', c: [540, 640], w: 700, paint: paintReceipts },
    { key: 'locker', c: [690, 560], w: 900, paint: paintLocker },
    { key: 'helmet', c: [540, 600], w: 720, paint: paintLiner },
    { key: 'battle', c: [600, 610], w: 760, paint: paintBattle },
  ];

  function paintCarwash(g, S) {
    const CW = FILM.sets.carwash;
    const F = { z: 1, c: [540, 540] };
    const C = CW.statics(S, F);
    g.drawImage(C.far, 0, 0, 1080, 1080);
    g.drawImage(C.mid, 0, 0, 1080, 1080);
    g.save();
    CW.apply(g, F);
    CW.drawSpray(g, 0.4, { bay: CW.BAY1 });
    g.restore();
    g.drawImage(C.near, 0, 0, 1080, 1080);
    const o = { x: 528, y: 912, h: 330, t: 0.3, facing: 1, age: 15, outfit: 'carwash', pose: 'handshake', poseAmt: 1, lean: 0.8, look: 0.15, expr: 'happy' };
    const P = FILM.cast.sam.pose(o);
    FILM.cast.sam(g, o);
    FILM.cast.sponge(g, { x: P.hands[0][0] + 24, y: P.hands[0][1] - 4, size: 56, rot: -0.25, foam: 1 });
  }
  function paintReceipts(g, S) {
    const ST = FILM.sets.store;
    const V = ST.view('close');
    const C = ST.statics(S, { angle: 'close' });
    ST.drawBack(g, C, { t: 0 });
    ST.drawCounter(g, C, { t: 0 });
    FILM.cast.receiptStack(g, { x: V.pad.x - 40, y: V.pad.y + 10, size: 170, count: 9, t: 0 });
    FILM.cast.receipt(g, { x: V.pad.x + 150, y: V.pad.y - 20, size: 130, rot: 0.18, text: '$00' });
    ST.drawLight(g, C, { t: 0 });
  }
  function paintLocker(g, S) {
    const BR = FILM.sets.barracks;
    const C = BR.statics(S, 'locker');
    g.drawImage(C.far, 0, 0, 1080, 1080);
    g.drawImage(C.mid, 0, 0, 1080, 1080);
    g.drawImage(C.near, 0, 0, 1080, 1080);
    if (C.front) g.drawImage(C.front, 0, 0, 1080, 1080);
    const LK = BR.GEO.LK;
    FILM.cast.sock(g, { x: lerp(LK.open.x0, LK.open.x1, 0.42), y: LK.shelf - 40, size: 150, rot: -0.2 });
  }
  function paintLiner(g, S) {
    const BR = FILM.sets.barracks;
    const C = BR.statics(S, 'laundryClose');
    g.drawImage(C.back, 0, 0, 1080, 1080);
    const HM = { x: 540, y: 640, size: 520, open: 1, liner: 1, rot: 0, t: 0 };
    LOOK.contactShadow(g, { x: HM.x, y: HM.y + 30, h: 600, rx: 260, ry: 28, alpha: 0.45, color: [30, 26, 20] });
    FILM.cast.helmet(g, HM);
    const s = HM.size / 170;
    LOOK.glint(g, { x: HM.x + 2 * s, y: HM.y - 18 * s, size: 30, alpha: 0.85 });
    if (C.light) LOOK.drawLight(g, C.light, { alpha: 0.7 });
  }
  function paintBattle(g, S) {
    const K = FILM.sets.outpost;
    const C = K.statics(S);
    K.drawClose(g, C, 0.5);
    K.farFlashes(g, 0.31, { spots: [[300, 560], [420, 548], [640, 566], [880, 552]], rate: 5 });
    K.drawSmoke(g, C, 0.5, 0.35, -260);
    const HM = { x: 560, y: 700, size: 330, open: 0.9, rot: -0.04, t: 0 };
    LOOK.contactShadow(g, { x: HM.x + 10, y: HM.y + 26, h: 330, rx: 170, ry: 22, alpha: 0.55, color: [14, 8, 10] });
    FILM.cast.helmet(g, HM);
    LOOK.glint(g, { x: HM.x + 0.13 * HM.size, y: HM.y - 0.035 * HM.size, size: 22, alpha: 0.8 });
    K.puff(g, 820, 690, 0.12, { size: 0.8 });
    K.spark(g, 330, 720, 0.05, { dir: -0.4, size: 1, seed: 2 });
    K.drawAir(g, C, 0.5, 0.55);
    K.drawGrade(g, C);
  }

  let PCACHE = null;
  function panels(S) {
    if (PCACHE && PCACHE.S === S) return PCACHE;
    const out = [];
    for (const p of PANELS) {
      if (p.key === 'receipts' && !(FILM.sets.store && FILM.sets.store.view)) continue;
      const { c, g } = LOOK.makeLayer(S, 1, PW, PH);
      const z = PW / p.w;
      g.save();
      g.beginPath();
      g.rect(0, 0, PW, PH);
      g.clip();
      g.fillStyle = 'rgb(40,34,30)';
      g.fillRect(0, 0, PW, PH);
      g.translate(PW / 2, PH / 2);
      g.scale(z, z);
      g.translate(-p.c[0], -p.c[1]);
      p.paint(g, S);
      g.restore();
      g.fillStyle = 'rgba(250,226,186,0.12)';
      g.fillRect(0, 0, PW, PH);
      const v = g.createRadialGradient(PW / 2, PH / 2, PH * 0.35, PW / 2, PH / 2, PW * 0.68);
      v.addColorStop(0, 'rgba(30,20,12,0)');
      v.addColorStop(1, 'rgba(30,20,12,0.45)');
      g.fillStyle = v;
      g.fillRect(0, 0, PW, PH);
      LOOK.texture(c, S, { seed: sd('panel', p.key), offset: 7.1 * out.length, mottle: 0.05, dark: 0.04, light: 0.03 });
      out.push({ key: p.key, c });
    }
    return (PCACHE = { S, list: out });
  }

  function stops(list, B) {
    const at = {};
    list.forEach((p, i) => (at[p.key] = i));
    return [
      { i: at.carwash, t: B.carwash, hold: 0.22 },
      { i: at.helmet, t: B.helmet, hold: 0.85 },
      { i: at.battle, t: B.battle, hold: 9 },
    ];
  }
  function stripPos(t, ST, enter0) {
    if (t <= ST[0].t) {
      const k = LIB.ease.outCubic(clamp01((t - enter0) / (ST[0].t - enter0)));
      return { s: lerp(ST[0].i - 3.4, ST[0].i, k), land: null };
    }
    for (let j = 0; j < ST.length; j++) {
      const a = ST[j], b = ST[j + 1];
      if (!b || t < b.t) {
        if (t < a.t + a.hold || !b) return { s: a.i, land: a };
        const k = LIB.ease.inOutSine(clamp01((t - a.t - a.hold) / (b.t - a.t - a.hold)));
        return { s: lerp(a.i, b.i, k), land: null };
      }
    }
    return { s: ST[ST.length - 1].i, land: null };
  }

  function drawStrip(ctx, t, S, alpha, B) {
    const P = panels(S);
    const ST = stops(P.list, B);
    const { s } = stripPos(t, ST, B.wide);
    const x0 = 540 - s * PITCH;
    const named = { carwash: B.carwash, helmet: B.helmet, battle: B.battle };
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(540, STRIP_Y);
    ctx.rotate(-0.025);
    ctx.translate(-540, -STRIP_Y);
    const top = STRIP_Y - STRIP_H / 2;
    const L = x0 - PITCH / 2 - 70, R = x0 + (P.list.length - 0.5) * PITCH + 180;
    const lead = ctx.createLinearGradient(L, 0, L + 110, 0);
    lead.addColorStop(0, 'rgba(34,28,26,0)');
    lead.addColorStop(1, 'rgba(34,28,26,0.86)');
    ctx.fillStyle = lead;
    ctx.fillRect(L, top, 110, STRIP_H);
    ctx.fillStyle = 'rgba(34,28,26,0.86)';
    ctx.fillRect(L + 110, top, R - L - 220, STRIP_H);
    const tail = ctx.createLinearGradient(R - 110, 0, R, 0);
    tail.addColorStop(0, 'rgba(34,28,26,0.86)');
    tail.addColorStop(1, 'rgba(34,28,26,0)');
    ctx.fillStyle = tail;
    ctx.fillRect(R - 110, top, 110, STRIP_H);
    ctx.fillStyle = 'rgba(176,184,190,0.55)';
    const hp = PITCH / 8;
    const k0 = Math.ceil((L + 60 - x0) / hp), k1 = Math.floor((R - 60 - x0) / hp);
    for (let k = k0; k <= k1; k++) {
      const hx = x0 + k * hp;
      if (hx < -30 || hx > 1110) continue;
      for (const hy of [top + 8, top + STRIP_H - 22]) {
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(hx - 8, hy, 16, 14, 3) : ctx.rect(hx - 8, hy, 16, 14);
        ctx.fill();
      }
    }
    P.list.forEach((p, i) => {
      const cx = x0 + i * PITCH;
      if (cx < -PW || cx > 1080 + PW) return;
      const tl = named[p.key];
      const hit = tl == null ? 0 : Math.exp(-Math.pow((t - tl - 0.12) / 0.32, 2)) * (t > tl - 0.25 ? 1 : 0);
      const near = 1 - clamp01(Math.abs(cx - 540) / 520);
      const z = 1 + 0.07 * hit;
      ctx.save();
      ctx.translate(cx, STRIP_Y);
      ctx.scale(z, z);
      ctx.globalAlpha *= 0.55 + 0.45 * near;
      ctx.drawImage(p.c, -PW / 2, -PH / 2, PW, PH);
      if (hit > 0.01) {
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255,236,200,${0.22 * hit})`;
        ctx.fillRect(-PW / 2, -PH / 2, PW, PH);
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.strokeStyle = 'rgba(16,12,10,0.9)';
      ctx.lineWidth = 3;
      ctx.strokeRect(-PW / 2, -PH / 2, PW, PH);
      ctx.restore();
    });
    ctx.restore();
  }

  function figures(t, B, C) {
    const tell = LIB.ease.inOutSine(clamp01((t - 0.1) / 1.1));
    const jo = Object.assign({ x: JX, y: GROUND, h: JH, t, facing: -1, pose: 'sitUp', poseAmt: 1, lean: 0.5 - 0.35 * tell,
      look: lerp(-0.45, -0.05, tell) + 0.06 * sstep(B.carwash, B.carwash + 0.6, t) - 0.04 * sstep(B.battle, B.battle + 0.5, t),
      expr: 'teary', blinkOffset: 0.3 }, JO);
    const JP = FILM.cast.sam.pose(jo);
    const mo = {
      x: MX, y: GROUND, h: MH, t, facing: 1, outfit: 'beach', swim: true, light: C.m.light, breeze: 0.45,
      pose: 'kneelHold', target: { x: JP.hands[1][0] + 4, y: JP.hands[1][1] - 6 },
      expr: t < B.helmet ? { tearful: 0.6, neutral: 0.4 } : { tearful: 0.5, wonder: 0.3, neutral: 0.2 },
      look: 0.12 + 0.04 * sstep(B.helmet, B.helmet + 0.6, t),
    };
    return { jo, mo, JP };
  }

  function drawFigures(ctx, jo, mo, contactA) {
    LOOK.contactShadow(ctx, { x: MX + 6, y: GROUND, h: MH, rx: 90, alpha: contactA });
    LOOK.contactShadow(ctx, { x: JX - 0.12 * JR, y: GROUND, h: JR, rx: 120, alpha: contactA });
    FILM.cast.sam(ctx, jo);
    FILM.cast.ava(ctx, mo);
  }

  function drawPunch(ctx, t, B, info, S, C) {
    const tl = t - B.punch;
    const dur = B.wide - B.punch;
    const BEACH = FILM.sets.beach;
    const BD = BEACH.backdrop(S, C, { blur: 7 });
    const cam = (g, d) => LOOK.camera(g, { t: tl, dur, focus: PUNCH_AT, push: 0.03, depth: d });
    ctx.save();
    cam(ctx, 0.3);
    ctx.translate(540, 300);
    ctx.scale(1.6, 1.6);
    ctx.translate(-540, -300);
    ctx.drawImage(BD, 0, 0, 1080, 1080);
    ctx.restore();
    const { jo, mo, JP } = figures(t, B, C);
    ctx.save();
    cam(ctx, 1);
    ctx.translate(PUNCH_AT[0], PUNCH_AT[1]);
    ctx.scale(PUNCH_Z, PUNCH_Z);
    ctx.translate(-JP.head[0], -JP.head[1]);
    drawFigures(ctx, jo, mo, C.m.contactA);
    ctx.restore();
    BEACH.air(ctx, C, t, cam, 0.6);
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const BEACH = FILM.sets.beach;
      const C = BEACH.statics(S, LAY);
      const B = beats(info);
      BEACH.backdrop(S, C, { blur: 7 });
      panels(S);

      if (t >= B.punch && t < B.wide) {
        drawPunch(ctx, t, B, info, S, C);
      } else {
        const A = t < B.punch;
        const c2 = !A && t >= B.close;
        if (c2) {
          ctx.save();
          ctx.translate(C2.at[0], C2.at[1]);
          ctx.scale(C2.z, C2.z);
          ctx.translate(-C2.at[0], -C2.at[1]);
        }
        const t0 = A ? 0 : B.wide, d = A ? B.punch : info.dur - B.wide;
        const cam = (g, dd) => LOOK.camera(g, { t: t - t0, dur: d, focus: [540, 600], push: A ? 0.02 : 0.03, pan: A ? [16, 0] : [-24, 0], depth: dd });
        BEACH.back(ctx, C, t, cam);

        if (!A) drawStrip(ctx, t, S, sstep(B.wide - 0.05, B.wide + 0.35, t), B);

        const { jo, mo } = figures(t, B, C);
        ctx.save();
        cam(ctx, 1);
        drawFigures(ctx, jo, mo, C.m.contactA);
        ctx.restore();
        BEACH.air(ctx, C, t, cam);
        if (c2) ctx.restore();
      }
      BEACH.grade(ctx, C, 1);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
