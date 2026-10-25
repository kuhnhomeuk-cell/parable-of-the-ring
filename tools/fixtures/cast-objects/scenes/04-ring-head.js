// Fixture 04 'ring-head': the S07 framing before the push-in. The ring at size 1500 with the
// band running off the bottom of the frame, so the stone fills the middle; the light turns.
FILM.scene({
  id: 'ring-head',
  draw(ctx, t, info) {
    const L = info.lib;
    const g = ctx.createRadialGradient(540, 420, 30, 540, 520, 820);
    g.addColorStop(0, '#5C4A3A');
    g.addColorStop(0.6, '#2E241C');
    g.addColorStop(1, '#16110D');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1080);
    const light = L.lerp(-1.6, -0.6, t / 2);
    const sp = Math.max(0, 1 - Math.abs(t - 1.2) / 0.5);
    FILM.cast.diamondRing(ctx, { x: 540, y: 1440, size: 1500, rot: 0.5, tilt: 0.3, t, light, env: '#5C4A3A', shadow: 0, sparkle: sp * sp });
    L.text(ctx, 'diamondRing · size 1500 · light ' + light.toFixed(2), 40, 60, { size: 24, color: '#E8DCCB' });
  },
});
