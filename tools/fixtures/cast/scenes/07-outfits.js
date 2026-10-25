// Fixture 07 'outfits': all eight outfits at age 18 (h 220 input, 1.12x tall).
FILM.scene({
  id: 'outfits',
  draw(ctx, t, info) {
    const L = info.lib, P = L.pal;
    const J = FILM.cast.sam;
    ctx.fillStyle = P.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = P.paperShade;
    ctx.fillRect(0, 480, 1080, 26);
    ctx.fillRect(0, 950, 1080, 50);
    const names = J.OUTFITS;
    names.forEach((n, i) => {
      const r = Math.floor(i / 4), c = i % 4;
      const x = 150 + c * 260, y = r ? 950 : 480;
      J(ctx, { x, y, h: 220, t: t + i * 0.6, age: 18, outfit: n, look: 0.15 });
      L.text(ctx, n, x, y + 32, { size: 20, align: 'center', color: P.inkSoft });
    });
    L.text(ctx, 'outfits · age 18', 60, 80, { size: 32, color: P.ink });
  },
});
