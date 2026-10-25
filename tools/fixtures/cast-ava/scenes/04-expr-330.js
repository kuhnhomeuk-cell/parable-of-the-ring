// Fixture 'ava-expr-330': the eight expressions at medium-shot size, h = 330.
FILM.scene({
  id: 'ava-expr-330',
  draw(ctx, t, info) {
    const L = info.lib;
    ctx.fillStyle = L.pal.paperMint;
    ctx.fillRect(0, 0, 1080, 1080);
    const M = FILM.cast.ava;
    const E = ['neutral', 'smileSoft', 'smilePolite', 'laugh', 'tearful', 'cry', 'wonder', 'loving'];
    E.forEach((expr, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const x = 135 + col * 270, y = 480 + row * 520;
      M(ctx, { x, y, h: 330, t: t + 0.6, outfit: 'nurse', expr, facing: col < 2 ? 1 : -1, front: row ? 0.35 : 0 });
      L.text(ctx, expr, x, y - 350, { size: 24, align: 'center', color: L.pal.inkSoft });
    });
  },
});
