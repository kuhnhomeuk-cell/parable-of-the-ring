// scenes/12-scene-12.js: procedural scene. Shot timing comes from src/timeline.js.
(function () {
  'use strict';

  const ID = 'scene-12';
  const LIB = FILM.lib;
  const LOOK = FILM.look;
  const HOME = () => FILM.sets.home;
  const TAU = Math.PI * 2;
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const sstep = (e0, e1, x) => {
    const u = clamp01((x - e0) / (e1 - e0));
    return u * u * (3 - 2 * u);
  };

  let B_HER = 0.26;
  let B_KNEW = 2.64;

  const JX = 440;
  const JH = 330;
  const FOCUS = [440, 520];
  const PUSH = 0.035;
  const THOUGHT = [560, 330];

  let SIL = null;
  function silhouette(S) {
    if (SIL && SIL.S === S) return SIL;
    const w = 300, h = 360;
    const k = S;
    const c = FILM.makeCanvas(Math.round(w * k), Math.round(h * k));
    const g = c.getContext('2d');
    g.scale(k, k);
    FILM.cast.ava(g, { x: w / 2, y: h - 30, h: 280, t: 0.4, facing: -1, outfit: 'vision', pose: 'stand', expr: 'smileSoft', breeze: 0.6, wind: -1 });
    g.globalCompositeOperation = 'source-atop';
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, 'rgba(255,240,214,0.62)');
    gr.addColorStop(1, 'rgba(206,214,255,0.7)');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    const soft = FILM.makeCanvas(c.width, c.height);
    const sg = soft.getContext('2d');
    sg.filter = `blur(${1.2 * k}px)`;
    sg.drawImage(c, 0, 0);
    sg.filter = 'none';
    SIL = { S, c: soft, w, h };
    return SIL;
  }

  function samPose(t) {
    const set = sstep(B_KNEW + 0.6, B_KNEW + 1.3, t);
    return {
      x: JX, y: HOME().BED.mattress, h: JH, t, age: 14, outfit: 'casual', facing: 1,
      pose: 'lieStare', poseAmt: 1, knee: 0.85,
      look: 0.06 + 0.05 * Math.sin(t * 0.6) * (1 - set) + 0.1 * set,
      expr: set > 0.02 ? 'squint' : 'stare', exprAmt: set > 0.02 ? 0.25 + 0.4 * set : 1,
    };
  }

  function drawThought(ctx, S, t, dur) {
    const fade = sstep(B_HER + 0.1, B_HER + 1.4, t);
    if (fade <= 0) return;
    const head = FILM.cast.sam.pose(samPose(t)).head;
    const B = [[head[0] + 60, head[1] - 70, 9], [head[0] + 112, head[1] - 128, 14], [head[0] + 170, head[1] - 196, 20]];
    B.forEach(([x, y, r], i) => {
      const a = sstep(B_HER + 0.1 + i * 0.25, B_HER + 0.5 + i * 0.25, t);
      if (a <= 0) return;
      const dy = 4 * Math.sin(t * 1.3 + i);
      const gr = ctx.createRadialGradient(x, y + dy, 0, x, y + dy, r * 1.8);
      gr.addColorStop(0, `rgba(255,240,214,${0.55 * a})`);
      gr.addColorStop(0.5, `rgba(255,240,214,${0.28 * a})`);
      gr.addColorStop(1, 'rgba(255,240,214,0)');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(x, y + dy, r * 1.8, 0, TAU);
      ctx.fill();
    });
    const cx = THOUGHT[0] + 10 * Math.sin(t * 0.5), cy = THOUGHT[1] + 6 * Math.sin(t * 0.7 + 1);
    const cl = ctx.createRadialGradient(cx, cy, 0, cx, cy, 250);
    cl.addColorStop(0, `rgba(255,236,206,${0.32 * fade})`);
    cl.addColorStop(0.6, `rgba(220,214,255,${0.12 * fade})`);
    cl.addColorStop(1, 'rgba(220,214,255,0)');
    ctx.fillStyle = cl;
    ctx.fillRect(cx - 260, cy - 260, 520, 520);
    const s = silhouette(S);
    const sx = cx - 70 - s.w / 2, sy = cy + 150 - s.h + 12 * (1 - fade) - 8 * (t / dur);
    ctx.save();
    ctx.globalAlpha = 0.72 * fade;
    ctx.drawImage(s.c, sx, sy, s.w, s.h);
    ctx.restore();
    return { cx, cy, fade };
  }

  function drawRing(ctx, t, th) {
    if (!th) return;
    const env = LOOK.flashEnv(t, RING_BEAT(t));
    const rx = th.cx + 110, ry = th.cy + 10 + 5 * Math.sin(t * 1.1);
    const ringA = th.fade * (0.75 + 0.25 * sstep(B_KNEW, B_KNEW + 1, t));
    const halo = ctx.createRadialGradient(rx, ry - 14, 0, rx, ry - 14, 70);
    halo.addColorStop(0, `rgba(255,226,150,${0.35 * ringA + 0.3 * env})`);
    halo.addColorStop(1, 'rgba(255,226,150,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(rx - 80, ry - 90, 160, 160);
    const r = FILM.cast.diamondRing(ctx, { x: rx, y: ry, size: 40, rot: 0.5 + 0.25 * Math.sin(t * 0.8), tilt: 0.25, t, sparkle: 0, shadow: 0, env: '#3C406E', alpha: ringA });
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.6);
    LOOK.glint(ctx, { x: r.glint[0], y: r.glint[1], size: 9 + 5 * pulse * th.fade + 22 * env, alpha: (0.35 + 0.3 * pulse) * th.fade + env, rot: 0.1 * Math.sin(t) });
    if (env > 0.01) LOOK.bloom(ctx, { x: r.glint[0], y: r.glint[1], r: 70, alpha: 0.5 * env, mid: 0.2 * env });
  }
  let RING_AT = 4.6;
  const RING_BEAT = () => RING_AT;

  function wordAt(info, token, fb, from) {
    const st = info.shot.start || 0, lo = from == null ? -0.05 : from;
    const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
    const want = norm(token);
    for (const c of info.shot.captions || []) {
      for (const w of c.words || []) if (w[0] - st >= lo && norm(w[1]) === want) return w[0] - st;
    }
    return fb;
  }

  function setupAt(cuts, t) {
    let i = 0;
    while (i + 1 < cuts.length && t >= cuts[i + 1].at) i++;
    return i;
  }

  function frame(ctx, t, cuts) {
    const i = setupAt(cuts, t), c = cuts[i], u = t - c.at;
    const z = c.z * (1 + (c.push == null ? 0.02 : c.push) * u);
    const hw = 540 / Math.max(1, z);
    const cx = (typeof c.x === 'function' ? c.x(t) : c.x) + (c.dx || 0) * u;
    const cy = (typeof c.y === 'function' ? c.y(t) : c.y) + (c.dy || 0) * u;
    const x = Math.min(1080 - hw, Math.max(hw, cx)), y = Math.min(1080 - hw, Math.max(hw, cy));
    ctx.translate(540, 540);
    ctx.scale(z, z);
    ctx.translate(-x, -y);
    return i;
  }

  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const S = info.S || FILM.S || 1;
      const C = HOME().bedroom(S, 'bed');
      const bt = info.shot.beats;
      B_HER = bt[0] ? bt[0].t : 0.26;
      B_KNEW = wordAt(info, 'tokaa', 2.64, bt[1] ? bt[1].t + 0.1 : 2);
      RING_AT = Math.min(info.dur - 0.3, wordAt(info, 'tokap', B_KNEW + 1.96, B_KNEW));
      const cam = (depth) => LOOK.camera(ctx, { t, dur: info.dur, focus: FOCUS, push: PUSH, depth });
      const head = FILM.cast.sam.pose(samPose(t)).head;
      const CUTS = [
        { at: 0, z: 1, x: 540, y: 540, push: 0.025, dx: 3 },
        { at: wordAt(info, 'tokdl', bt[1] ? bt[1].t : 1.8), z: 2, x: head[0] + 110, y: head[1] - 70, push: 0.035 },
        { at: wordAt(info, 'tokdo', RING_AT - 0.65, B_KNEW), z: 1.8, x: THOUGHT[0] + 40, y: THOUGHT[1] + 10, push: 0.04, dy: -4 },
      ];
      ctx.save();
      frame(ctx, t, CUTS);

      ctx.save();
      cam(1);
      ctx.drawImage(C.near, 0, 0, 1080, 1080);
      LOOK.drawLight(ctx, C.cool, { alpha: 0.5 + 0.05 * Math.sin(t * 0.7) });
      ctx.drawImage(C.pillow, 0, 0, 1080, 1080);
      const o = samPose(t);
      FILM.cast.sam(ctx, o);
      ctx.restore();

      ctx.save();
      cam(0.85);
      const th = drawThought(ctx, S, t, info.dur);
      drawRing(ctx, t, th);
      ctx.restore();

      ctx.save();
      cam(1);
      LOOK.drawLight(ctx, C.warm, { alpha: 0.8 + 0.04 * Math.sin(t * 1.3) });
      ctx.restore();
      ctx.restore();

      LOOK.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
