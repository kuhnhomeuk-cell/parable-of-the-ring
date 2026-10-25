// Fixture 08 'wave': the Front sergeant's frantic get-down wave; the wrist path of one cycle is traced.
FILM.scene({
  id: 'wave',
  draw(ctx, t, info) {
    const L = info.lib;
    const GY = 900;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const S = FILM.cast.sergeant;
    const base = { x: 420, y: GY, h: 400, pose: 'waveDown' };
    ctx.fillStyle = '#B9A07E';
    ctx.fillRect(560, GY - 170, 90, 170);
    ctx.fillStyle = 'rgba(58,111,200,0.5)';
    for (let i = 0; i < 40; i++) {
      const p = S.pose(Object.assign({}, base, { t: i / 40 / 2.2 })).waveHand;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
      ctx.fill();
    }
    S(ctx, Object.assign({}, base, { t }));
    L.text(ctx, 'waveDown · 2.2 Hz', 60, 90, { size: 34, color: L.pal.ink });
  },
});
