// Fixture 'cast-anatomy': every pose of every cast figure, both facings, for limb checks.
// Top row faces right, bottom row faces left. Each figure renders about 430 px tall standing.
// Grey blocks are seats and desks; a dashed line is the store counter height; red dots mark
// sam.pose(o).grip where a pose holds one object in both hands.
(function () {
  'use strict';
  const W = 2560, H = 1200;
  const GY = [560, 1110];
  const HT = 430; // rendered standing height

  const RIGCOLS = [
    { tag: 'J14 school', age: 14, outfit: 'school' },
    { tag: 'J14 casual', age: 14, outfit: 'casual' },
    { tag: 'J19 desert', age: 19, outfit: 'fatigues-desert', helmet: true },
    { tag: 'J19 gown', age: 19, outfit: 'gown' },
    { tag: 'J21 tux', age: 21, outfit: 'tux' },
    { tag: 'J21 swim', age: 21, outfit: 'swim' },
    { tag: 'soldier v2', soldier: true, variant: 2 },
    { tag: 'soldier v4', soldier: true, variant: 4 },
  ];
  const RIGPOSE = {
    stand: {},
    walk: { walk: 0.3 },
    run: { pose: 'run', walk: 0.3 },
    sprintCrouch: { pose: 'sprintCrouch', walk: 0.3 },
    sit: { pose: 'sit' },
    sitDesk: { pose: 'sit', desk: true },
    sitGrip: { pose: 'sit', grip: [60, -108] },
    standGrip: { grip: [44, -122] },
    pray: { pose: 'pray' },
    kneelOffer: { pose: 'kneelOffer' },
    lie: { pose: 'lie' },
    sitUp: { pose: 'sitUp' },
    diveReach: { pose: 'diveReach' },
    fallMid: { pose: 'fall', poseAmt: 0.5 },
    fall: { pose: 'fall', poseAmt: 1 },
    weepSit: { pose: 'weepSit' },
    handshake: { pose: 'handshake' },
    hug: { pose: 'hug' },
    laugh: { pose: 'laugh' },
    chinUp: { pose: 'chinUp' },
    lieStare: { pose: 'lieStare' },
    touchHead: { pose: 'touchHead' },
    callOut: { pose: 'callOut', walk: 0.3 },
    liftLiner: { pose: 'liftLiner' },
    liftLinerBed: { pose: 'liftLiner', bed: true },
  };

  function dot(ctx, p, c) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(p[0], p[1], 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRig(ctx, t, L, shot) {
    const J = FILM.cast.sam, S = FILM.cast.soldier;
    const spec = RIGPOSE[shot.rig];
    const cols = shot.cols;
    const pitch = (W - 200) / cols.length;
    for (let row = 0; row < 2; row++) {
      const facing = row ? -1 : 1, gy = GY[row];
      cols.forEach((ci, i) => {
        const V = RIGCOLS[ci];
        const x = 100 + pitch * (i + 0.5);
        const age = V.soldier ? 19 : V.age;
        const h = (HT * 330) / J.height({ h: 330, age });
        const o = Object.assign({ x, y: gy, h, t: t + i * 0.37, facing }, spec);
        if (V.soldier) o.variant = V.variant;
        else Object.assign(o, { age: V.age, outfit: V.outfit, helmet: !!V.helmet });
        const seatK = shot.rig.startsWith('sit') && shot.rig !== 'sitUp' ? 0.22 : shot.rig === 'liftLiner' || shot.rig === 'pray' ? 0.22 : 0;
        if (seatK) {
          ctx.fillStyle = 'rgba(120,110,96,0.45)';
          ctx.fillRect(x - 0.24 * h * facing - (facing < 0 ? 0 : 0), gy - seatK * h, 0.3 * h * facing, seatK * h);
        }
        if (spec.desk) {
          ctx.fillStyle = 'rgba(120,110,96,0.45)';
          ctx.fillRect(x + 0.16 * h * facing, gy - 0.32 * h, 0.36 * h * facing, 10);
        }
        const fn = V.soldier ? S : J;
        const P = fn.pose(o);
        if (spec.pose === 'liftLiner') {
          fn(ctx, Object.assign({}, o, { layer: 'back' }));
          FILM.cast.helmet(ctx, P.helmet);
          fn(ctx, Object.assign({}, o, { layer: 'front' }));
        } else fn(ctx, o);
        if (P.box) {
          ctx.fillStyle = L.pal.annBlue;
          ctx.fillRect(P.box[0] - 12, P.box[1] - 16, 24, 16);
        }
        if (P.grip) dot(ctx, P.grip, 'rgba(200,40,40,0.8)');
        L.text(ctx, `${V.tag} · ${shot.rig}`, x, gy - 460, { size: 20, align: 'center', color: L.pal.ink });
      });
    }
  }

  function drawOther(ctx, t, L, shot) {
    const F = FILM.cast[shot.fig];
    const poses = shot.poses;
    const pitch = (W - 200) / poses.length;
    for (let row = 0; row < 2; row++) {
      const facing = row ? -1 : 1, gy = GY[row];
      poses.forEach((pose, i) => {
        const x = 100 + pitch * (i + 0.5);
        const o = { x, y: gy, h: HT, t: t + i * 0.41, facing, pose };
        if (pose === 'jerkAway0') Object.assign(o, { pose: 'jerkAway', jerk: 0 }); // the grab, before the snap
        if (pose === 'walk' || pose === 'run' || pose === 'walkAwayLaugh' || pose === 'runAwayWave') o.walk = 0.3;
        if (shot.fig === 'ava' && pose === 'splash') {
          o.waterY = gy - 0.3 * HT;
          o.swim = true;
          o.outfit = 'beach';
          ctx.fillStyle = 'rgba(127,194,198,0.6)';
          ctx.fillRect(x - pitch * 0.45, o.waterY, pitch * 0.9, gy - o.waterY);
        }
        if (shot.fig === 'salesman' || shot.fig === 'nell') {
          const cy = F.counterY ? F.counterY(gy, HT / (shot.fig === 'salesman' ? 1.25 : 1.1)) : null;
          if (cy != null) {
            ctx.strokeStyle = 'rgba(120,110,96,0.7)';
            ctx.lineWidth = 3;
            ctx.setLineDash([12, 10]);
            ctx.beginPath();
            ctx.moveTo(x - pitch * 0.45, cy);
            ctx.lineTo(x + pitch * 0.45, cy);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        F(ctx, o);
        L.text(ctx, `${shot.fig} · ${pose}`, x, gy - 460, { size: 20, align: 'center', color: L.pal.ink });
      });
    }
  }

  function cellsRow(ctx, L, items) {
    const pitch = (W - 200) / items.length;
    for (let row = 0; row < 2; row++) {
      const facing = row ? -1 : 1, gy = GY[row];
      items.forEach((it, i) => {
        const x = 100 + pitch * (i + 0.5);
        it.draw(ctx, x, gy, facing);
        L.text(ctx, it.label, x, gy - 460, { size: 20, align: 'center', color: L.pal.ink });
      });
    }
  }
  const J330 = (age) => (HT * 330) / FILM.cast.sam.height({ h: 330, age });
  const fig = (name, extra) => (ctx, x, y, facing) => FILM.cast[name](ctx, Object.assign({ x, y, h: HT, t: 0.5, facing }, extra));
  function rifleWith(ctx, fn, o) {
    // the rifle butt on the floor, its barrel through pose(o).grip, tipped forward a little
    const P = fn.pose(o);
    if (!P.grip) return fn(ctx, o); // a cast without the grip option
    const rot = 0.1;
    fn(ctx, Object.assign({}, o, { layer: 'back' }));
    const bx = P.grip[0] - o.facing * (o.y - P.grip[1]) * Math.tan(rot);
    ctx.save();
    ctx.translate(bx, o.y - 4);
    ctx.scale(o.facing, 1);
    FILM.cast.rifle(ctx, { x: 0, y: 0, size: 0.5 * FILM.cast.sam.height(o), rot });
    ctx.restore();
    fn(ctx, Object.assign({}, o, { layer: 'front' }));
    dot(ctx, P.grip, 'rgba(200,40,40,0.8)');
  }
  const SPECIAL = {
    standAll: () => [
      { label: 'J14 school', draw: (c, x, y, f) => FILM.cast.sam(c, { x, y, h: J330(14), t: 0.5, facing: f, age: 14 }) },
      { label: 'J18 dress', draw: (c, x, y, f) => FILM.cast.sam(c, { x, y, h: J330(18), t: 0.5, facing: f, age: 18, outfit: 'dress' }) },
      { label: 'soldier v1', draw: (c, x, y, f) => FILM.cast.soldier(c, { x, y, h: J330(19), t: 0.5, facing: f, variant: 1 }) },
      { label: 'ava', draw: fig('ava', { pose: 'stand', outfit: 'nurse' }) },
      { label: 'salesman', draw: fig('salesman', { pose: 'stand' }) },
      { label: 'nell', draw: fig('nell', { pose: 'stand' }) },
      { label: 'mother', draw: fig('mother', { pose: 'stand' }) },
      { label: 'father', draw: fig('father', { pose: 'stand' }) },
      { label: 'drill', draw: fig('drillSergeant', { pose: 'stand' }) },
      { label: 'sergeant', draw: fig('sergeant', { pose: 'stand' }) },
    ],
    flingU: () => [0.2, 0.36, 0.45, 0.55, 0.62, 0.7, 0.74, 0.85].map((u) => ({ label: `drill fling u ${u}`, draw: fig('drillSergeant', { pose: 'fling', u }) })),
    avaBlend: () => [0, 0.25, 0.4, 0.5, 0.6, 0.75, 1].map((k) => ({ label: `ava stand>laughHand ${k}`, draw: fig('ava', { pose: { stand: 1 - k, laughHand: k }, outfit: 'nurse', expr: 'laugh' }) }))
      .concat([0.1, 0.35].map((w) => ({ label: `ava walkAwayLaugh ${w}`, draw: fig('ava', { pose: 'walkAwayLaugh', walk: w, outfit: 'nurse', expr: 'laugh' }) }))),
    gripRifle: () => [
      { label: 'J19 sit grip', draw: (c, x, y, f) => { const h = J330(19); rifleWith(c, FILM.cast.sam, { x, y, h, t: 0.5, facing: f, age: 19, outfit: 'fatigues-desert', helmet: true, pose: 'sit', grip: [60, -108] }); } },
      { label: 'soldier v2 sit grip', draw: (c, x, y, f) => { const h = J330(19); rifleWith(c, FILM.cast.soldier, { x, y, h, t: 0.5, facing: f, variant: 2, pose: 'sit', grip: [60, -108] }); } },
      { label: 'soldier v4 sit grip', draw: (c, x, y, f) => { const h = J330(19); rifleWith(c, FILM.cast.soldier, { x, y, h, t: 0.5, facing: f, variant: 4, pose: 'sit', grip: [60, -108] }); } },
      { label: 'J19 stand grip', draw: (c, x, y, f) => { const h = J330(19); rifleWith(c, FILM.cast.sam, { x, y, h, t: 0.5, facing: f, age: 19, outfit: 'fatigues-desert', helmet: true, grip: [44, -122] }); } },
      { label: 'soldier v4 stand grip', draw: (c, x, y, f) => { const h = J330(19); rifleWith(c, FILM.cast.soldier, { x, y, h, t: 0.5, facing: f, variant: 4, grip: [44, -122] }); } },
    ],
  };

  const TL = FILM.TIMELINE;
  for (const shot of TL.shots) {
    FILM.scene({
      id: shot.id,
      draw(ctx, t, info) {
        const L = info.lib;
        ctx.fillStyle = L.pal.paper;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = L.pal.paperShade;
        ctx.fillRect(0, GY[0], W, 24);
        ctx.fillRect(0, GY[1], W, H - GY[1]);
        if (shot.special) cellsRow(ctx, L, SPECIAL[shot.special]());
        else if (shot.rig) drawRig(ctx, 0.5, L, shot);
        else drawOther(ctx, 0.5, L, shot);
      },
    });
  }
})();
