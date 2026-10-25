// Fixture 04 'shield-ramp': shield driven 0 -> 1 over 1.4 s then held, squint following it;
// the strip above shows fixed shield values so the anticipation and overshoot are visible.
FILM.scene({
  id: 'shield-ramp',
  draw(ctx, t, info) {
    const L = info.lib;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    const GY1 = 430, GY2 = 990;
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY1, 1080, 26);
    ctx.fillRect(0, GY2, 1080, 90);
    const J = FILM.cast.sam;
    const vals = [0, 0.1, 0.2, 0.4, 0.6, 0.8, 1];
    vals.forEach((v, i) => {
      const x = 90 + i * 150;
      J(ctx, { x, y: GY1, h: 200, t: 0.3, shield: v, squint: L.smoothstep(0.15, 0.6, v) });
      L.text(ctx, 'shield ' + v.toFixed(1), x, GY1 + 52, { size: 18, align: 'center', color: L.pal.inkSoft });
    });
    const s = L.clamp(t / 1.4);
    J(ctx, { x: 540, y: GY2, h: 330, t, shield: s, squint: L.smoothstep(0.15, 0.6, s) });
    L.text(ctx, 'live shield ' + s.toFixed(2), 760, 700, { size: 26, color: L.pal.inkSoft });
    L.text(ctx, 'shield ramp', 60, 90, { size: 36, color: L.pal.ink });
  },
});
