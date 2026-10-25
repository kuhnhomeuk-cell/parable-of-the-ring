// Fixture 'salesman-exprs': every expression at h = 400, waist up behind a counter line.
FILM.scene({
  id: 'salesman-exprs',
  draw(ctx, t, info) {
    const L = info.lib;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    const S = FILM.cast.salesman;
    const names = ['neutral', 'scowl', 'sneer', 'surprised', 'smile', 'warm', 'tearful', 'laugh'];
    names.forEach((expr, i) => {
      const col = i % 4, rowI = Math.floor(i / 4);
      const x = 120 + col * 265;
      const cy = 470 + rowI * 450;
      const floor = cy + 0.55 * 320;
      S(ctx, { x, y: floor, h: 400, t: t + i * 0.37, expr, counterY: cy, warmth: i >= 4 ? 0.8 : 0 });
      ctx.fillStyle = L.pal.paperShade;
      ctx.fillRect(x - 125, cy, 250, 40);
      L.text(ctx, expr, x + 10, cy + 30, { size: 24, align: 'center', color: L.pal.inkSoft });
    });
    L.text(ctx, 'salesman expressions · h 400', 60, 70, { size: 32, color: L.pal.ink });
  },
});
