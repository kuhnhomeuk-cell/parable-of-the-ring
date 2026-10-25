// Fixture 01 'walk-strip': the eight walk phases frozen side by side at h = 230.
FILM.scene({
  id: 'walk-strip',
  draw(ctx, t, info) {
    const L = info.lib;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    const GY = 640;
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const names = ['contact', 'down', 'passing', 'up', 'contact', 'down', 'passing', 'up'];
    for (let i = 0; i < 8; i++) {
      const x = 74 + i * 133;
      FILM.cast.sam(ctx, { x, y: GY, h: 230, t: t + i * 0.9, walk: i / 8, walkAmt: 1 });
      L.text(ctx, names[i], x, GY + 60, { size: 20, align: 'center', color: L.pal.inkSoft });
      L.text(ctx, (i / 8).toFixed(3), x, GY + 86, { size: 16, align: 'center', color: L.pal.inkFaint });
    }
    L.text(ctx, 'walk cycle · 8 phases · h 230', 60, 110, { size: 36, color: L.pal.ink });
  },
});
