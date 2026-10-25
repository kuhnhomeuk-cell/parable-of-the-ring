// Fixture 'nell-poses-b': Nell at h = 400. clap is driven by t.
FILM.scene({
  id: 'nell-poses-b',
  draw(ctx, t, info) {
    const L = info.lib;
    const GY = 900;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const K = FILM.cast.nell;
    const row = [
      ['wipeTear', { pose: 'wipeTear' }],
      ['clap', { pose: 'clap' }],
      ['handshake', { pose: 'handshake' }],
      ['greet · facing -1', { pose: 'greet', facing: -1 }],
    ];
    row.forEach(([label, o], i) => {
      const x = 130 + i * 260;
      K(ctx, Object.assign({ x, y: GY, h: 400, t: t + i * 0.9 }, o));
      L.text(ctx, label, x + 10, GY + 50, { size: 24, align: 'center', color: L.pal.inkSoft });
    });
    L.text(ctx, 'nell poses b · h 400', 60, 90, { size: 32, color: L.pal.ink });
  },
});
