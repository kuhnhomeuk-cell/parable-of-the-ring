// Fixture 01 'mother-poses': the mother's five poses at h = 400.
FILM.scene({
  id: 'mother-poses',
  draw(ctx, t, info) {
    const L = info.lib;
    const GY = 900;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const M = FILM.cast.mother;
    const poses = ['stand', 'cry', 'clutch', 'hug', 'wave'];
    poses.forEach((p, i) => {
      const x = 120 + i * 205;
      M(ctx, { x, y: GY, h: 400, t: t + i * 0.7, pose: p });
      L.text(ctx, p, x, GY + 60, { size: 26, align: 'center', color: L.pal.inkSoft });
    });
    L.text(ctx, 'mother · h 400', 60, 90, { size: 36, color: L.pal.ink });
  },
});
