// Fixture 03 'poses': stand, shield, squint at h = 330, one facing left.
FILM.scene({
  id: 'poses',
  draw(ctx, t, info) {
    const L = info.lib;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    const GY = 800;
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const J = FILM.cast.sam;
    J(ctx, { x: 190, y: GY, h: 330, t });
    J(ctx, { x: 540, y: GY, h: 330, t: t + 1.3, shield: 1, squint: 1 });
    J(ctx, { x: 890, y: GY, h: 330, t: t + 2.1, squint: 1, facing: -1, look: 0.4 });
    L.text(ctx, 'stand', 190, GY + 70, { size: 26, align: 'center', color: L.pal.inkSoft });
    L.text(ctx, 'shield 1 · squint 1', 540, GY + 70, { size: 26, align: 'center', color: L.pal.inkSoft });
    L.text(ctx, 'squint · facing -1 · look 0.4', 890, GY + 70, { size: 26, align: 'center', color: L.pal.inkSoft });
    L.text(ctx, 'poses · h 330', 60, 110, { size: 36, color: L.pal.ink });
  },
});
