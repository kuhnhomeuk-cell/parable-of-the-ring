// Fixture 'nell-poses-a': Nell at h = 400.
FILM.scene({
  id: 'nell-poses-a',
  draw(ctx, t, info) {
    const L = info.lib;
    const GY = 900;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const K = FILM.cast.nell;
    const row = [
      ['stand', { pose: 'stand' }],
      ['greet', { pose: 'greet', expr: 'warm' }],
      ['offerRing', { pose: 'offerRing' }],
      ['worried', { pose: 'worried' }],
    ];
    row.forEach(([label, o], i) => {
      const x = 130 + i * 260;
      K(ctx, Object.assign({ x, y: GY, h: 400, t: t + i * 0.9 }, o));
      L.text(ctx, label, x + 10, GY + 50, { size: 24, align: 'center', color: L.pal.inkSoft });
    });
    L.text(ctx, 'nell poses a · h 400', 60, 90, { size: 32, color: L.pal.ink });
  },
});
