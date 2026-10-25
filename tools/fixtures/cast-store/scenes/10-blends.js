// Fixture 'blends': pose weights driven by time, to prove every blend is continuous.
FILM.scene({
  id: 'blends',
  draw(ctx, t, info) {
    const L = info.lib;
    const GY = 900;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const S = FILM.cast.salesman, K = FILM.cast.nell;
    const k = L.ease.inOutSine(L.clamp(t / 3.6));
    S(ctx, { x: 140, y: GY, h: 400, t, pose: { stand: 1 - k, leanGlare: k }, expr: { neutral: 1 - k, scowl: k } });
    S(ctx, { x: 400, y: GY, h: 400, t, pose: { holdUp: 1 - k, jerkAway: k }, jerk: k });
    K(ctx, { x: 660, y: GY, h: 400, t, pose: { stand: 1 - k, offerRing: k } });
    S(ctx, { x: 920, y: GY, h: 400, t, warmth: k, pose: { handshake: 1 - k, apologise: k } });
    L.text(ctx, 'stand > leanGlare', 140, GY + 50, { size: 22, align: 'center', color: L.pal.inkSoft });
    L.text(ctx, 'holdUp > jerkAway', 400, GY + 50, { size: 22, align: 'center', color: L.pal.inkSoft });
    L.text(ctx, 'stand > offerRing', 660, GY + 50, { size: 22, align: 'center', color: L.pal.inkSoft });
    L.text(ctx, 'handshake > apologise', 920, GY + 50, { size: 22, align: 'center', color: L.pal.inkSoft });
    L.text(ctx, 'blends · k = ' + k.toFixed(2), 60, 90, { size: 32, color: L.pal.ink });
  },
});
