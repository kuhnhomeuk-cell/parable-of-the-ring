// Fixture 'ava-expr-800': the eight expressions as close-ups, h = 800, each cropped at the chest
// in its own 270 x 540 cell. Top row 3/4, bottom row straight to camera.
FILM.scene({
  id: 'ava-expr-800',
  draw(ctx, t, info) {
    const L = info.lib;
    ctx.fillStyle = L.pal.paperMint;
    ctx.fillRect(0, 0, 1080, 1080);
    const M = FILM.cast.ava;
    const E = ['neutral', 'smileSoft', 'smilePolite', 'laugh', 'tearful', 'cry', 'wonder', 'loving'];
    E.forEach((expr, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const cx = col * 270, cy = row * 540;
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx + 2, cy + 2, 266, 536);
      ctx.clip();
      ctx.fillStyle = row ? '#E4EEE6' : '#DCE7DC';
      ctx.fillRect(cx, cy, 270, 540);
      // feet far below the cell so the head and chest fill it
      const y = cy + 870;
      M(ctx, { x: cx + 110, y, h: 800, t: t + 0.6, outfit: row ? 'vision' : 'nurse', expr, front: row ? 1 : 0, light: [0.6, -0.8] });
      ctx.restore();
      L.text(ctx, expr, cx + 135, cy + 40, { size: 22, align: 'center', color: L.pal.ink });
    });
  },
});
