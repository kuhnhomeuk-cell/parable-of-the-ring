// Fixture 'counter': the store staff behind a display counter at the storyboard height, teen Sam
// (h 330) on the near side. Counter top = floor - salesman.COUNTER_K x Sam's h.
FILM.scene({
  id: 'counter',
  draw(ctx, t, info) {
    const L = info.lib;
    const JH = 330;
    const FLOOR = 880; // the staff's floor behind the counter
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, FLOOR, 1080, 200);
    const S = FILM.cast.salesman, K = FILM.cast.nell;
    const cy = S.counterY(FLOOR, JH);
    S(ctx, { x: 640, y: FLOOR, h: JH * S.HK, t, facing: -1, pose: 'leanGlare', expr: 'scowl', counterY: cy });
    K(ctx, { x: 900, y: FLOOR, h: JH * K.HK, t: t + 1.1, facing: -1, pose: 'offerRing', expr: 'smile', counterY: cy });
    // the glass counter: wood base, glass front, a lit top edge
    ctx.fillStyle = L.pal.wood;
    ctx.fillRect(300, cy, 780, FLOOR - cy);
    ctx.fillStyle = L.pal.paperSky;
    ctx.fillRect(320, cy + 12, 740, (FLOOR - cy) * 0.55);
    ctx.fillStyle = L.pal.stripeYellow;
    ctx.fillRect(300, cy - 4, 780, 10);
    // Sam on the near side, looking up at them
    FILM.cast.sam(ctx, { x: 200, y: FLOOR + 40, h: JH, t, look: 0.5 });
    const p = K.pose({ x: 900, y: FLOOR, h: JH * K.HK, t: t + 1.1, facing: -1, pose: 'offerRing', counterY: cy });
    FILM.cast.ring(ctx, { x: p.ring[0], y: p.ring[1] - 6, rx: 11, ry: 5, t, sparkle: 0.6 });
    L.text(ctx, 'behind the counter · top at floor - ' + S.COUNTER_K + ' x Sam h', 60, 90, { size: 30, color: L.pal.ink });
  },
});
