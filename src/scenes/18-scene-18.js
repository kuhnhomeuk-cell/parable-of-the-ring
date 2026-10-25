// scenes/18-scene-18.js: procedural scene. Shot timing comes from src/timeline.js.
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

  const ID = 'scene-18';
  const LIB = FILM.lib, LOOK = FILM.look;
  const { sstep, clamp01, lerp } = LOOK;
  const TAU = Math.PI * 2;
  const INK = '#1F1712';
  const SERIF = 'Georgia, "Times New Roman", serif';
  const HAND = '"Bradley Hand", "Segoe Script", "Comic Sans MS", cursive';

  const beatsOf = (info) => {
    const b = info.shot.beats;
    const d = b[0].t;
    const w = (word, fb) => wordT(info, word, 0, fb);
    return {
      deal: w('tokeo', d + 1.2), fifty: w('tokep', b[1].t) - 0.04, would: w('tokcx', d + 3.5), keep: w('tokes', d + 3.8),
      ring: w('tokap', d + 4.3), until: w('toket', d + 4.6), paid: w('tokeu', d + 5.4), end: info.dur,
    };
  };

  function padTwo(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = 'rgba(40,20,16,0.28)';
    ctx.beginPath();
    ctx.ellipse(x + 4, y + 2, 46, 8, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#6E1C30';
    ctx.beginPath();
    ctx.ellipse(x, y - 3, 42, 9, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#9A3450';
    ctx.beginPath();
    ctx.ellipse(x, y - 7, 38, 6.5, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function contractTwo(ctx, x, y, a) {
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(40,20,16,0.22)';
    ctx.beginPath();
    ctx.moveTo(x - 56, y + 3);
    ctx.lineTo(x + 66, y + 3);
    ctx.lineTo(x + 58, y - 12);
    ctx.lineTo(x - 50, y - 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FBF5E6';
    ctx.beginPath();
    ctx.moveTo(x - 58, y);
    ctx.lineTo(x + 62, y);
    ctx.lineTo(x + 54, y - 16);
    ctx.lineTo(x - 50, y - 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(80,70,60,0.45)';
    for (let i = 0; i < 3; i++) ctx.fillRect(x - 40 + i * 3, y - 13 + i * 4, 70 - i * 10, 1.4);
    ctx.fillStyle = '#B12E2A';
    ctx.fillRect(x + 8, y - 5, 26, 2.4);
    ctx.restore();
  }

  function contractClose(ctx, x, y, w, rot, circle, t) {
    const h = w * 1.12;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.transform(1, 0, -0.12, 0.62, 0, 0);
    ctx.fillStyle = 'rgba(30,14,12,0.3)';
    ctx.fillRect(-w / 2 + 10, -h / 2 + 14, w, h);
    ctx.fillStyle = '#FBF6EA';
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = '#EFE6D3';
    ctx.fillRect(w / 2 - w * 0.12, -h / 2, w * 0.12, h);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(31,23,18,0.55)';
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3A3028';
    ctx.font = `700 ${w * 0.075}px ${SERIF}`;
    ctx.fillText('PAYMENT AGREEMENT', 0, -h / 2 + w * 0.12);
    ctx.fillStyle = '#7A6E62';
    ctx.font = `600 ${w * 0.042}px ${SERIF}`;
    ctx.fillText('Main Street Jewelers', 0, -h / 2 + w * 0.18);
    ctx.fillStyle = 'rgba(90,80,70,0.42)';
    for (let i = 0; i < 4; i++) ctx.fillRect(-w * 0.38, -h / 2 + w * (0.26 + i * 0.055), w * (0.76 - (i % 2) * 0.12), w * 0.014);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#3A3028';
    ctx.font = `600 ${w * 0.05}px ${SERIF}`;
    ctx.fillText('Diamond ring   $0,000', -w * 0.38, -h / 2 + w * 0.56);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#B12E2A';
    ctx.font = `800 ${w * 0.15}px ${SERIF}`;
    ctx.fillText('$00 / week', 0, -h / 2 + w * 0.8);
    if (circle > 0.001) {
      ctx.strokeStyle = '#B12E2A';
      ctx.lineWidth = w * 0.014;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const a0 = -2.6, a1 = a0 + TAU * 1.08 * clamp01(circle);
      for (let a = a0, i = 0; a <= a1; a += 0.08, i++) {
        const rx = w * 0.47 + w * 0.01 * Math.sin(a * 3), ry = w * 0.135;
        const px = Math.cos(a) * rx, py = -h / 2 + w * 0.75 + Math.sin(a) * ry;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(60,50,44,0.6)';
    ctx.fillRect(-w * 0.4, h / 2 - w * 0.12, w * 0.34, w * 0.008);
    ctx.fillRect(w * 0.06, h / 2 - w * 0.12, w * 0.34, w * 0.008);
    ctx.font = `600 ${w * 0.032}px ${SERIF}`;
    ctx.fillStyle = '#7A6E62';
    ctx.fillText('Customer', -w * 0.23, h / 2 - w * 0.07);
    ctx.fillText('Manager', w * 0.23, h / 2 - w * 0.07);
    ctx.restore();
  }

  function pen(ctx, x, y, len, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = 'rgba(30,14,12,0.25)';
    ctx.fillRect(-len / 2 + 6, 6, len, 10);
    ctx.fillStyle = '#20263A';
    ctx.beginPath();
    ctx.moveTo(-len / 2, -5);
    ctx.lineTo(len / 2 - 14, -5);
    ctx.lineTo(len / 2, 0);
    ctx.lineTo(len / 2 - 14, 5);
    ctx.lineTo(-len / 2, 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#D4AC5C';
    ctx.fillRect(-len / 2 + 8, -5, 10, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(-len / 2, -4, len - 16, 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.moveTo(-len / 2, -5);
    ctx.lineTo(len / 2 - 14, -5);
    ctx.lineTo(len / 2, 0);
    ctx.lineTo(len / 2 - 14, 5);
    ctx.lineTo(-len / 2, 5);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function glassOver(ctx, x, y, r) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(236,240,236,0.16)');
    g.addColorStop(1, 'rgba(236,240,236,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.6, y + r * 0.7);
    ctx.lineTo(x - r * 0.1, y - r * 0.6);
    ctx.stroke();
    ctx.restore();
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const ST = FILM.sets.store;
      const K = FILM.cast.nell, J = FILM.cast.sam;
      const B = beatsOf(info);

      if (t >= B.fifty && t < B.would) {
        const C = ST.statics(S, { angle: 'close', tod: 'day' });
        const V = C.V, p = V.pad;
        const tl = t - B.fifty;
        const CUT = setupAt([{ at: B.fifty, z: 1, c: [540, 540], push: 0.09, pan: [36, -14] }], t, B.would);
        const cam = (depth) => frame(ctx, CUT, depth);
        ctx.save();
        cam(0.6);
        ST.drawBack(ctx, C, { t });
        ctx.restore();
        ctx.save();
        cam(1);
        const ring = [p.x + 200, p.y - 60];
        const rg = FILM.cast.diamondRing(ctx, { x: ring[0], y: ring[1], size: 150, rot: 0.6 + 0.02 * t, tilt: 0.3, t, light: -1.05, sparkle: 0.35, shadow: 0.7 });
        if (rg && rg.glint) LOOK.glint(ctx, { x: rg.glint[0], y: rg.glint[1], size: 22, alpha: 0.55 + 0.2 * Math.sin(t * 2.4) });
        const slide = LIB.ease.outCubic(tl / 0.35);
        contractClose(ctx, lerp(300, 340, slide), 690, 540, -0.06, sstep(0.25, 1.0, tl), t);
        pen(ctx, 650, 846, 190, -0.5);
        ctx.restore();
        ctx.save();
        cam(1);
        ST.drawLight(ctx, C, { t });
        ctx.restore();
      } else {
        const C = ST.statics(S, { angle: 'two', tod: 'day' });
        const V = C.V;
        const partC = t >= B.would;

        const PAD = [606, V.counterY + 2];
        const kx = partC ? 722 : 836;
        let kpose, kexpr = 'warm';
        let lift = 0, lower = 0;
        if (!partC) {
          const push = LIB.ease.inOutSine((t - (B.deal - 0.55)) / 0.7) * (1 - sstep(B.deal + 0.35, B.deal + 0.8, t));
          kpose = { greet: 1 - LIB.ease.inOutSine((t - 0.6) / 0.5), handshake: push };
          kexpr = { warm: 1 };
        } else {
          lift = 1;
          lower = LIB.ease.inOutSine((t - B.keep) / (B.ring - B.keep));
          kpose = { offerRing: lift * (1 - lower) + 0.25 * lower };
          kexpr = { warm: 0.7, smile: 0.3 };
        }
        const ko = { x: kx, y: V.floor, h: V.JH * K.HK, t, facing: -1, pose: kpose, expr: kexpr, counterY: V.counterY, light: V.light };
        const kq = K.pose(ko);

        const watch = partC ? sstep(B.keep, B.ring, t) : 0;
        const smile = partC ? sstep(B.ring + 0.3, B.ring + 0.8, t) : sstep(B.deal + 0.2, B.deal + 0.7, t) * 0.5;
        const jo = {
          x: 500, y: V.floor + 8, h: V.JH * 0.96, t, facing: 1, age: 15, outfit: 'casual',
          look: lerp(0.12, -0.25, watch), blinkOffset: 0.7,
          expr: smile > 0.01 ? 'smileSmall' : 'wide', exprAmt: smile > 0.01 ? smile : 0.35,
        };

        const head = J.pose(jo).head;
        const CUT = setupAt([
          { at: 0, z: 1.1, c: [590, 583], push: 0.06, pan: [-20, 0] },
          { at: B.would, z: 1.45, c: [630, 654], push: 0.05, pan: [12, -6] },
          { at: B.until, z: 1.9, c: [lerp(head[0], 720, 0.5), lerp(head[1], 730, 0.72)], push: 0.06, pan: [-12, -8] },
        ], t, info.dur);
        const cam = (g, depth) => frame(g, CUT, depth);

        ctx.save();
        cam(ctx, ST.PAR.back);
        ST.drawBack(ctx, C, { t });
        ctx.restore();

        const inCase = [668, 772];
        let rp = [PAD[0], PAD[1] - 24];
        if (partC) {
          const up = [kq.ring[0], kq.ring[1] - 6];
          const held = [lerp(rp[0], up[0], lift), lerp(rp[1], up[1], lift)];
          rp = [lerp(held[0], inCase[0], lower), lerp(held[1], inCase[1], lower) - 26 * Math.sin(Math.PI * lower)];
        }
        const behindGlass = partC && rp[1] > V.counterY + 6;

        ctx.save();
        cam(ctx, 0.92);
        K(ctx, ko);
        ST.drawCounter(ctx, C, { t });
        ctx.restore();

        ctx.save();
        cam(ctx, 1);
        if (behindGlass) {
          LOOK.bloom(ctx, { x: rp[0], y: rp[1] - 6, r: 70, alpha: 0.3, mid: 0.12 });
          const rg = FILM.cast.diamondRing(ctx, { x: rp[0], y: rp[1], size: 34, rot: 0.6, tilt: 0.15, t, light: -1.0, sparkle: 0.4 * sstep(B.ring - 0.05, B.ring + 0.2, t), shadow: 0.4, lw: 1.6 });
          const land = LOOK.flashEnv(t, B.ring, { fall: 14 });
          if (rg && rg.glint && land > 0.02) LOOK.glint(ctx, { x: rg.glint[0], y: rg.glint[1], size: 26 * land, alpha: 0.85 * land });
          glassOver(ctx, rp[0], rp[1], 46);
          const pop = clamp01((t - (B.ring + 0.45)) / 0.32);
          if (pop > 0) FILM.cast.priceCard(ctx, { x: rp[0] + 52, y: rp[1] - 40, size: 104, pop, text: 'HOLD', t });
        }
        padTwo(ctx, PAD[0], PAD[1]);
        const slide = partC ? 1 : LIB.ease.inOutSine((t - (B.deal - 0.35)) / 0.8);
        const cx = lerp(806, 704, slide);
        contractTwo(ctx, cx, V.counterY + 4, partC ? 1 : sstep(0.2, 0.6, t));
        if (!behindGlass) {
          const rg = FILM.cast.diamondRing(ctx, { x: rp[0], y: rp[1], size: 40, rot: 0.6 + 0.2 * Math.sin(t * 0.7), tilt: 0.08, t, light: -1.0, sparkle: 0.35, shadow: 0, lw: 2 });
          if (rg && rg.glint) LOOK.bloom(ctx, { x: rg.glint[0], y: rg.glint[1], r: 50, alpha: 0.22, mid: 0.08 });
        }
        LOOK.contactShadow(ctx, { x: jo.x, y: jo.y, h: jo.h, alpha: 0.32 });
        J(ctx, jo);
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
