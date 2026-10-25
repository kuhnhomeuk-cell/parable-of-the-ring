// Fixture 'ava-stride': the walk and run contracts. x advances 2 * STEP * h per cycle (walk) and
// 2 * RUN_STEP * h (run), with walk derived from distance, so a planted sole must hold still.
// The header prints the worst planted-sole drift measured from pose() across the whole shot.
FILM.scene({
  id: 'ava-stride',
  draw(ctx, t, info) {
    const L = info.lib;
    const M = FILM.cast.ava;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    const G1 = 470, G2 = 940;
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, G1, 1080, 30);
    ctx.fillRect(0, G2, 1080, 140);
    // measure: for each leg, while planted, the ground pivot must not move in screen x
    const drift = (kind, h, step) => {
      let worst = 0;
      for (const side of [0, 1]) {
        let ref = null;
        for (let f = 0; f <= 72; f++) {
          const d = (f / 24) * 200;
          const o = { x: 100 + d, y: 0, h, walk: d / (2 * step * h), pose: kind };
          const P = M.pose(o).legs[side];
          if (!P.planted) { ref = null; continue; }
          const piv = P.phi < 0 ? P.heel[0] : P.ball[0];
          if (ref === null) ref = { piv, phi: P.phi };
          // the pivot switches from heel to ball once per stance; compare like with like
          if ((ref.phi < 0) !== (P.phi < 0)) ref = { piv, phi: P.phi };
          worst = Math.max(worst, Math.abs(piv - ref.piv));
        }
      }
      return worst;
    };
    const hw = 260;
    const dw = drift('walk', hw, M.STEP);
    const dr = drift('run', hw, M.RUN_STEP);
    const sp = 200;
    const xs = 100 + ((sp * t) % 900);
    M(ctx, { x: xs, y: G1, h: hw, t, outfit: 'nurse', pose: 'walk', walk: (xs - 100) / (2 * M.STEP * hw) });
    const xr = 100 + ((sp * 1.6 * t) % 900);
    M(ctx, { x: xr, y: G2, h: hw, t, outfit: 'beach', pose: 'run', expr: 'laugh', walk: (xr - 100) / (2 * M.RUN_STEP * hw) });
    // sole marks under every planted contact of the run
    for (let c = 0; c < 6; c++) {
      for (const side of [0, 1]) {
        const wc = c + side * 0.5 + 0.1;
        const P = M.pose({ x: 100 + wc * 2 * M.STEP * hw, y: G1, h: hw, walk: wc, pose: 'walk' }).legs[side];
        ctx.fillStyle = side ? L.pal.annBlue : L.pal.red;
        ctx.fillRect(P.heel[0], G1 + 4, P.ball[0] - P.heel[0] + 8, 5);
      }
    }
    L.text(ctx, 'walk · planted drift ' + dw.toFixed(2) + ' px', 60, 80, { size: 28, color: L.pal.ink });
    L.text(ctx, 'run · planted drift ' + dr.toFixed(2) + ' px', 60, 560, { size: 28, color: L.pal.ink });
  },
});
