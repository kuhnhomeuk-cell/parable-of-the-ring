// Fixture 05 'sizes': walking in place at h = 330 and h = 160 (one cycle per 1.1 s), and a
// standing h = 160 for scale.
FILM.scene({
  id: 'sizes',
  draw(ctx, t, info) {
    const L = info.lib;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    const GY = 820;
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const J = FILM.cast.sam;
    const walk = t / 1.1;
    J(ctx, { x: 300, y: GY, h: 330, t, walk, walkAmt: 1 });
    J(ctx, { x: 680, y: GY, h: 160, t: t + 0.8, walk: walk + 0.3, walkAmt: 1 });
    J(ctx, { x: 900, y: GY, h: 160, t: t + 1.7, facing: -1 });
    L.text(ctx, 'h 330', 300, GY + 70, { size: 26, align: 'center', color: L.pal.inkSoft });
    L.text(ctx, 'h 160', 790, GY + 70, { size: 26, align: 'center', color: L.pal.inkSoft });
    L.text(ctx, 'sizes · walking in place', 60, 110, { size: 36, color: L.pal.ink });
  },
});
