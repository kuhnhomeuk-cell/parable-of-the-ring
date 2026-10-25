// Fixture 'ava-outfits': the four outfits plus the swimsuit, standing, h = 300.
FILM.scene({
  id: 'ava-outfits',
  draw(ctx, t, info) {
    const L = info.lib;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    const GY = 820;
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const M = FILM.cast.ava;
    const row = [
      ['vision', {}, 'vision'],
      ['nurse', {}, 'nurse'],
      ['bride', {}, 'bride'],
      ['beach', {}, 'beach'],
      ['beach', { swim: true }, 'beach · swim'],
    ];
    row.forEach(([outfit, extra, label], i) => {
      const x = 120 + i * 210;
      M(ctx, Object.assign({ x, y: GY, h: 300, t: t + i * 0.7, outfit, expr: 'smileSoft' }, extra));
      L.text(ctx, label, x, GY + 70, { size: 26, align: 'center', color: L.pal.inkSoft });
    });
    L.text(ctx, 'ava · outfits · h 300', 60, 110, { size: 36, color: L.pal.ink });
  },
});
