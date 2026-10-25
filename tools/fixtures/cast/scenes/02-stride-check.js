// Fixture 02 'stride-check': the scene contract. x advances 2 * 0.38 * h per cycle and walk is
// derived from distance, so each planted sole must sit still on its ground mark. Faint ghosts
// show the five stance frames of one step overlaid: their planted shoe should be a single shoe.
FILM.scene({
  id: 'stride-check',
  draw(ctx, t, info) {
    const L = info.lib;
    const J = FILM.cast.sam;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    const h = 250, GY = 470, GY2 = 930;
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 40);
    ctx.fillRect(0, GY2, 1080, 150);
    // top: ghosts of one near-foot stance (walk 0 .. 0.5) at the contract stride
    const per = 2 * J.STEP * h;
    const x0 = 360;
    let drift = 0, ref = null;
    for (let k = 0; k <= 5; k++) {
      const walk = (k / 5) * 0.4999;
      const x = x0 + walk * per;
      ctx.save();
      ctx.globalAlpha = k === 5 ? 1 : 0.28;
      J(ctx, { x, y: GY, h, t: 0.2, walk, walkAmt: 1 });
      ctx.restore();
      const leg = J.pose({ x, y: GY, h, walk, walkAmt: 1 }).legs[0];
      const flat = leg.phi < 0 ? leg.heel[0] : leg.ball[0] - (39 * h) / 330;
      if (ref === null) ref = flat;
      drift = Math.max(drift, Math.abs(flat - ref));
    }
    ctx.strokeStyle = L.pal.red;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ref, GY - 40);
    ctx.lineTo(ref, GY + 30);
    ctx.stroke();
    L.text(ctx, 'stance ghosts · walk 0 to 0.5 · near heel drift ' + drift.toFixed(2) + ' px', 60, 90, { size: 28, color: L.pal.ink });
    // bottom: live walk across the frame, walk = distance / per; marks where each sole lands
    const speed = 210; // px per second
    const xs = 120 + speed * t;
    const walk = (xs - 120) / per;
    const hb = 220;
    const per2 = 2 * J.STEP * hb;
    const w2 = (xs - 120) / per2;
    for (let c = 0; c < 6; c++) {
      for (const side of [0, 1]) {
        const wc = c + side * 0.5 + 0.25; // mid-stance: the sole is flat
        const P = J.pose({ x: 120 + wc * per2, y: GY2, h: hb, walk: wc, walkAmt: 1 }).legs[side];
        const hx = P.phi < 0 ? P.heel[0] : P.ball[0] - (39 * hb) / 330;
        ctx.fillStyle = side ? L.pal.annBlue : L.pal.red;
        ctx.fillRect(hx - 1, GY2 + 4, (51 * hb) / 330 + 2, 5);
      }
    }
    J(ctx, { x: xs, y: GY2, h: hb, t, walk: w2, walkAmt: 1 });
    L.text(ctx, 'live: x += 2 · 0.38 · h per cycle (red near sole, blue far sole)', 60, 600, { size: 24, color: L.pal.inkSoft });
    void walk;
  },
});
