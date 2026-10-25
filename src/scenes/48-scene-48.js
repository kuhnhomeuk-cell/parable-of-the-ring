// scenes/48-scene-48.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-48';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const W = 1080, H = 1080;
  const sd = (...k) => LIB.hash(ID, ...k) & 0x7fffffff;

  const RING = [540, 590];
  const RING_SIZE = 260;

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
  function beats(info) {
    const b1 = beatT(info, 'toklk', 3.59);
    const b2 = beatT(info, 'tokln', 8.40);
    return {
      ten: wordT(info, 'tokdz', 1.73),
      drift: wordT(info, 'tokeb', 2.85) + 0.16,
      blood: wordT(info, 'toklk', 4.25, b1),
      tears: wordT(info, 'toklh', 5.22, b1) + 0.15,
      battle: wordT(info, 'tokli', 7.34, b1),
      bed: b2,
      bedroom: wordT(info, 'tokln', 9.09, b2),
    };
  }

  const CW_F = { z: 2.1, c: [800, 740] };
  const HELM = { x: 540, size: 760, open: 1, liner: 1, rot: 0 };
  HELM.y = RING[1] + 6 * HELM.size / 170;
  const KH_HELM = { x: 850, y: 800, size: 250, open: 0, rot: 0.12 };

  let BAKE = null;
  function bakes(S) {
    if (BAKE && BAKE.S === S) return BAKE;
    const cw = LOOK.makeLayer(S);
    {
      const CW = FILM.sets.carwash;
      const C = CW.statics(S, CW_F);
      const tmp = LOOK.makeLayer(S);
      tmp.g.drawImage(C.far, 0, 0, W, H);
      tmp.g.drawImage(C.mid, 0, 0, W, H);
      tmp.g.drawImage(C.near, 0, 0, W, H);
      cw.g.filter = `blur(${4 * S}px)`;
      cw.g.drawImage(tmp.c, -8, -8, W + 16, H + 16);
      cw.g.filter = 'none';
      LOOK.texture(cw.c, S, { seed: sd('cw'), offset: 3.1, mottle: 0.04, dark: 0.03, light: 0.02 });
    }
    const hl = LOOK.makeLayer(S);
    {
      const BR = FILM.sets.barracks;
      const C = BR.statics(S, 'laundryClose');
      hl.g.drawImage(C.back, 0, 0, W, H);
      LOOK.contactShadow(hl.g, { x: HELM.x, y: HELM.y + 40, h: 900, rx: 380, ry: 40, alpha: 0.45, color: [30, 26, 20] });
      FILM.cast.helmet(hl.g, Object.assign({ t: 0 }, HELM));
      if (C.light) LOOK.drawLight(hl.g, C.light, { alpha: 0.7 });
    }
    const kh = LOOK.makeLayer(S);
    {
      const K = FILM.sets.outpost;
      const C = K.statics(S);
      K.drawClose(kh.g, C, 0);
      LOOK.contactShadow(kh.g, { x: KH_HELM.x + 4, y: KH_HELM.y + 6, h: 300, rx: 140, ry: 18, alpha: 0.55, color: [14, 8, 10] });
      FILM.cast.helmet(kh.g, Object.assign({ t: 0 }, KH_HELM));
      const rg = kh.g.createRadialGradient(KH_HELM.x + 140, KH_HELM.y - 70, 0, KH_HELM.x + 140, KH_HELM.y - 70, 150);
      rg.addColorStop(0, 'rgba(255,140,60,0.2)');
      rg.addColorStop(1, 'rgba(255,140,60,0)');
      kh.g.globalCompositeOperation = 'lighter';
      kh.g.fillStyle = rg;
      kh.g.fillRect(0, 0, W, H);
      kh.g.globalCompositeOperation = 'source-over';
    }
    return (BAKE = { S, cw: cw.c, hl: hl.c, kh: kh.c });
  }

  function drawStore(ctx, t, S) {
    const bk = FILM.sets.store.bokeh(S, { tod: 'day', seed: 47, warm: 0.9 });
    ctx.save();
    const z = 1.04 + 0.01 * t;
    ctx.translate(540, 540);
    ctx.scale(z, z);
    ctx.translate(-540, -540);
    ctx.drawImage(bk, 0, 0, W, H);
    ctx.restore();
  }
  function drawCarwash(ctx, t, S, B) {
    const P = bakes(S);
    const tl = t - B.blood;
    ctx.save();
    const z = 1.02 + 0.006 * tl;
    ctx.translate(540, 540);
    ctx.scale(z, z);
    ctx.translate(-540 + 6 * tl, -540);
    ctx.drawImage(P.cw, 0, 0, W, H);
    ctx.restore();
    const sw = Math.sin(tl * 2.6);
    FILM.sets.carwash.drawFoam(ctx, t, { x: 230 + 30 * sw, y: 820, r: 120, grow: 0.9, seed: 4 });
    FILM.cast.sponge(ctx, { x: 210 + 46 * sw, y: 800 + 10 * Math.cos(tl * 2.6), size: 230, rot: -0.3 + 0.08 * sw, foam: 1 });
    FILM.cast.bubbles(ctx, { x: 60, y: 120, w: 960, h: 820, size: 40, count: 14, t: t + 1.7, seed: sd('bub'), alpha: 0.8 });
  }
  function drawLiner(ctx, t, S, B) {
    const P = bakes(S);
    const tl = t - B.tears;
    ctx.save();
    const z = 1.0 + 0.008 * tl;
    ctx.translate(540, 560);
    ctx.scale(z, z);
    ctx.translate(-540, -560);
    ctx.drawImage(P.hl, 0, 0, W, H);
    ctx.restore();
  }
  function drawOutpost(ctx, t, S, B) {
    const P = bakes(S);
    const K = FILM.sets.outpost;
    const C = K.statics(S);
    const tl = t - B.battle;
    ctx.save();
    const z = 1.02 + 0.008 * tl;
    ctx.translate(540, 600);
    ctx.scale(z, z);
    ctx.translate(-540, -600);
    ctx.drawImage(P.kh, 0, 0, W, H);
    K.farFlashes(ctx, t, { spots: [[140, 560], [260, 548], [420, 566], [880, 552]], rate: 5 });
    K.drawSmoke(ctx, C, t, 0.35, -260);
    K.puff(ctx, 300, 700, t - (B.battle + 0.5), { size: 0.5 });
    ctx.restore();
    K.drawAir(ctx, C, t, 0.45);
    K.embers(ctx, t, { seed: 47, count: 30 });
  }
  const HOTEL_Z = 1.34;
  const WIN = (() => {
    const WD = FILM.sets.wedding.NIGHT.WINDOW;
    return [(WD.x0 + WD.x1) / 2, (WD.y0 + WD.y1) / 2];
  })();
  let NIGHT_BAKE = null;
  function nightPlate(S) {
    if (NIGHT_BAKE && NIGHT_BAKE.S === S) return NIGHT_BAKE.c;
    const { c, g } = LOOK.makeLayer(S);
    g.save();
    g.translate(540, RING[1]);
    g.scale(HOTEL_Z, HOTEL_Z);
    g.translate(-WIN[0], -WIN[1]);
    FILM.sets.wedding.drawHotel(g, 0, 1, S);
    g.restore();
    NIGHT_BAKE = { S, c };
    return c;
  }
  function drawNight(ctx, t, S, B, dur) {
    const tl = Math.max(0, t - B.bed);
    const z = 1 + 0.03 * LIB.ease.inOutSine(clamp01(tl / (dur - B.bed)));
    ctx.save();
    ctx.translate(540, RING[1]);
    ctx.scale(z, z);
    ctx.translate(-540, -RING[1]);
    ctx.drawImage(nightPlate(S), 0, 0, W, H);
    ctx.restore();
    const fl = 0.85 + 0.06 * Math.sin(t * 1.7) + 0.03 * Math.sin(t * 5.3);
    LOOK.bloom(ctx, { x: 540, y: RING[1], r: 70 * HOTEL_Z, alpha: 0.22 * fl, mid: 0.08 * fl });
  }

  function phases(t, B) {
    return [
      { k: 1, draw: drawStore },
      { k: sstep(B.blood - 0.3, B.blood + 0.35, t), draw: drawCarwash },
      { k: sstep(B.tears - 0.35, B.tears + 0.35, t), draw: drawLiner },
      { k: sstep(B.battle - 0.45, B.battle + 0.15, t), draw: drawOutpost },
      { k: sstep(B.bed - 0.1, B.bed + 1.1, t), draw: drawNight },
    ];
  }

  const ENV = ['#3A2A3A', '#2E6A78', '#4A4A2E', '#4A1C14', '#1E2A52'];
  function envAt(L) {
    let e = ENV[0];
    for (let i = 1; i < L.length; i++) if (L[i].k > 0.5) e = ENV[i];
    return e;
  }

  function drawCard(ctx, t, B) {
    const pop = clamp01((t - B.ten) / 0.32);
    if (pop <= 0) return;
    const d = LIB.ease.inOutSine(clamp01((t - B.drift) / 1.5));
    const a = 1 - sstep(B.drift + 0.3, B.drift + 1.4, t);
    if (a <= 0.001) return;
    const top = [RING[0] + 200 + 130 * d, RING[1] - 300 - 170 * d];
    ctx.save();
    ctx.globalAlpha *= a;
    const tie = [RING[0] + 92, RING[1] - 30];
    const th = 1 - sstep(B.drift - 0.05, B.drift + 0.4, t);
    if (th > 0.01) {
      ctx.save();
      ctx.globalAlpha *= th;
      ctx.strokeStyle = '#B12E2A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tie[0], tie[1]);
      ctx.quadraticCurveTo(lerp(tie[0], top[0], 0.5), Math.min(tie[1], top[1]) - 30 * pop, top[0], top[1]);
      ctx.stroke();
      ctx.restore();
    }
    FILM.cast.priceCard(ctx, { x: top[0], y: top[1], size: 250, pop, rot: 0.12 * d, text: '$0,000', t });
    ctx.restore();
  }

  function drawRing(ctx, t, B, L, dur) {
    const st = LIB.ease.inOutSine(clamp01((t - B.bedroom) / (dur - B.bedroom)));
    const bob = 6 * Math.sin(t * 1.1) * (1 - st);
    const y = lerp(RING[1], RING[1] + 6, st) + bob;
    const size = lerp(RING_SIZE, 40, st);
    const alpha = (1 - sstep(0.55, 0.95, st)) * (1 - L[2].k * (1 - L[3].k));
    const night = L[4].k;
    LOOK.bloom(ctx, { x: RING[0], y: y - 0.35 * size, r: 2.0 * size, alpha: (0.2 + 0.08 * night) * (1 - 0.6 * st), mid: 0.08 });
    const sparkle = 0.55 + 0.35 * Math.pow(Math.sin(t * 1.3) * Math.sin(t * 0.7 + 0.4), 2);
    const rg = FILM.cast.diamondRing(ctx, {
      x: RING[0], y, size, rot: 0.5 + 0.18 * Math.sin(t * 0.32), tilt: 0.26, t, light: -1.0,
      sparkle: sparkle * alpha, shadow: 0, env: envAt(L), alpha,
    });
    const g = rg && rg.glint ? rg.glint : [RING[0] + 0.1 * size, y - 0.62 * size];
    const pk = Math.max(
      Math.exp(-Math.pow((t - B.ten - 0.1) / 0.3, 2)),
      Math.exp(-Math.pow((t - B.blood) / 0.35, 2)),
      Math.exp(-Math.pow((t - B.battle) / 0.35, 2)),
      Math.exp(-Math.pow((t - B.bedroom - 0.2) / 0.5, 2))
    );
    const gx = lerp(g[0], RING[0], st), gy = lerp(g[1], RING[1], st);
    const ga = lerp(0.5 + 0.25 * sparkle + 0.25 * pk, 0.85, st);
    LOOK.bloom(ctx, { x: gx, y: gy, r: 60 + 50 * pk, alpha: 0.3 * ga, mid: 0.12 * ga });
    LOOK.glint(ctx, { x: gx, y: gy, size: lerp(18 + 14 * pk, 22 + 6 * pk, st), alpha: ga, rot: 0.08 + 0.05 * Math.sin(t * 0.5) });
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const B = beats(info);
      bakes(S);
      nightPlate(S);
      const L = phases(t, B);
      let i0 = 0;
      for (let i = L.length - 1; i > 0; i--) if (L[i].k >= 1) { i0 = i; break; }
      for (let i = i0; i < L.length; i++) {
        const k = i === i0 ? 1 : L[i].k;
        if (k <= 0.001) continue;
        ctx.save();
        ctx.globalAlpha *= k;
        L[i].draw(ctx, t, S, B, info.dur);
        ctx.restore();
      }
      drawCard(ctx, t, B);
      drawRing(ctx, t, B, L, info.dur);
      const vg = ctx.createRadialGradient(540, 540, 300, 540, 540, 900);
      vg.addColorStop(0, 'rgba(14,12,20,0)');
      vg.addColorStop(1, 'rgba(14,12,20,0.5)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
