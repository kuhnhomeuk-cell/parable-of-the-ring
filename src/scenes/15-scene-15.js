// scenes/15-scene-15.js: procedural scene. Shot timing comes from src/timeline.js.
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

  const ID = 'scene-15';
  const LIB = FILM.lib, LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const W = 1080, H = 1080;
  const INK = '#1F1712';

  const beatsOf = (info) => {
    const b = info.shot.beats;
    const ten = wordT(info, 'tokdz', 0, b[1].t);
    const thousand = wordT(info, 'tokea', 0, ten + 1);
    const dollars = wordT(info, 'tokeb', 0, ten + 2);
    return { price: b[0].t, ten, cut: thousand, look: thousand + 0.4, open: dollars - 0.15, dollars };
  };

  let WET = null;
  function wetLayer(S) {
    if (!WET || WET.S !== S) WET = { S, c: FILM.makeCanvas(Math.round(W * S), Math.round(H * S)) };
    return WET.c;
  }

  function moth(ctx, x, y, s, t, a) {
    if (a <= 0.01) return;
    const flap = Math.sin(t * 34);
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = INK;
    for (const sg of [-1, 1]) {
      ctx.save();
      ctx.scale(sg, 0.55 + 0.45 * Math.abs(flap));
      ctx.beginPath();
      ctx.ellipse(8, -2, 9, 6, -0.4, 0, TAU);
      ctx.fillStyle = '#CFC2A6';
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.ellipse(0, 0, 2.4, 6, 0, 0, TAU);
    ctx.fillStyle = '#8A7A62';
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const ST = FILM.sets.store;
      const B = beatsOf(info);

      if (t < B.cut) {
        const C = ST.statics(S, { angle: 'close', tod: 'winter' });
        const V = C.V, p = V.pad;
        const ring = [p.x - 30, p.y - 92];
        const top = [p.x + 175, p.y - 280];
        const CUT = setupAt([
          { at: 0, z: 1, c: [540, 540], push: 0.05, pan: [16, -8] },
          { at: B.ten, z: 1.5, c: [top[0] - 40, top[1] + 30], push: 0.06, pan: [-12, 6] },
        ], t, B.cut);
        const cam = (depth) => frame(ctx, CUT, depth);
        ctx.save();
        cam(0.6);
        ST.drawBack(ctx, C, { t });
        ctx.restore();
        ctx.save();
        cam(1);
        const rg = FILM.cast.diamondRing(ctx, { x: ring[0], y: ring[1], size: 230, rot: 0.55 + 0.03 * t, tilt: 0.3, t, light: -1.05, sparkle: 0.3 + 0.2 * Math.sin(t * 1.7) * Math.sin(t * 1.7), shadow: 0.7 });
        if (rg && rg.glint) LOOK.bloom(ctx, { x: rg.glint[0], y: rg.glint[1], r: 110, alpha: 0.3, mid: 0.12 });
        const pop = clamp01((t - B.ten) / 0.32);
        const tie = [ring[0] + 98, ring[1] - 40];
        if (pop > 0) {
          ctx.strokeStyle = '#B12E2A';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(tie[0], tie[1]);
          ctx.quadraticCurveTo(lerp(tie[0], top[0], 0.5), Math.min(tie[1], top[1]) - 30 * pop, top[0], top[1]);
          ctx.stroke();
        }
        FILM.cast.priceCard(ctx, { x: top[0], y: top[1], size: 230, pop, text: '$0,000', t });
        ctx.restore();
        ctx.save();
        cam(1);
        ST.drawLight(ctx, C, { t });
        ctx.restore();
        LOOK.exposure(ctx, 0.25 * LOOK.flashEnv(t, B.ten + 0.1, { fall: 8 }), { strength: 0.3 });
      } else {
        const C = ST.statics(S, { angle: 'two', tod: 'winter' });
        const V = C.V;
        const J = FILM.cast.sam;
        const lookDown = sstep(B.look - 0.1, B.look + 0.25, t);
        const jo = {
          x: 470, y: 1110, h: 720, t, facing: 1, age: 14, outfit: 'school', hair: 'wet',
          pose: 'hug', poseAmt: 0.55 + 0.25 * lookDown, look: lerp(0.05, -0.55, lookDown), lean: 0.15 * lookDown,
          expr: 'wide', exprAmt: 1, blinkOffset: 1.3,
        };
        const jq = J.pose(jo);
        const hx = (jq.hands[0][0] + jq.hands[1][0]) / 2 + 10, hy = Math.min(jq.hands[0][1], jq.hands[1][1]) - 4;
        const CUT = setupAt([
          { at: B.cut, z: 1, c: [540, 540], push: 0.07, pan: [0, -18] },
          { at: B.dollars, z: 1.4, c: [hx + 30, Math.min(hy, 770) - 40], push: 0.05, pan: [8, -10] },
        ], t, info.dur);
        const cam = (g, depth) => frame(g, CUT, depth);

        ctx.save();
        cam(ctx, ST.PAR.back);
        ST.drawBack(ctx, C, { t });
        ctx.restore();
        ctx.save();
        cam(ctx, 0.92);
        ST.drawCounter(ctx, C, { t });
        ctx.restore();

        const wc = wetLayer(S);
        const w = wc.getContext('2d');
        w.setTransform(1, 0, 0, 1, 0, 0);
        w.globalCompositeOperation = 'source-over';
        w.clearRect(0, 0, wc.width, wc.height);
        w.setTransform(S, 0, 0, S, 0, 0);
        w.save();
        cam(w, 1);
        J(w, jo);
        w.restore();
        w.globalCompositeOperation = 'source-atop';
        w.fillStyle = 'rgba(34,52,86,0.24)';
        w.fillRect(0, 0, W, H);
        w.globalCompositeOperation = 'source-over';
        ctx.drawImage(wc, 0, 0, W, H);

        ctx.save();
        cam(ctx, 1);
        const open = LIB.ease.outBack((t - B.open) / 0.35);
        FILM.cast.wallet(ctx, { x: hx, y: Math.min(hy, 770), size: 200, rot: -0.08, open: clamp01(open) });
        const mt = t - (B.open + 0.2);
        if (mt > 0) moth(ctx, hx + 20 + mt * 90 + 14 * Math.sin(mt * 6), Math.min(hy, 770) - 30 - mt * 150, 1.6, t, 1 - sstep(0.9, 1.3, mt));
        ctx.restore();

        ctx.save();
        cam(ctx, ST.PAR.air);
        ST.drawLight(ctx, C, { t });
        ctx.restore();
      }

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
