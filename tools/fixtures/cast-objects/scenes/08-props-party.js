// Fixture 08 'props-party': the S15 party props. Banner across the top, two balloon bunches,
// the cake on the counter.
FILM.scene({
  id: 'props-party',
  draw(ctx, tIn, info) {
    const L = info.lib;
    const t = L.clamp(tIn, 0, info.dur);
    ctx.fillStyle = '#F1E2C8';
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = '#7A4A2B';
    ctx.fillRect(0, 820, 1080, 260);
    ctx.fillStyle = '#93603A';
    ctx.fillRect(0, 800, 1080, 24);
    const C = FILM.cast;
    C.banner(ctx, { x: 540, y: 110, w: 860, text: 'You did it! Congratulations!', t });
    C.balloons(ctx, { x: 150, y: 780, size: 95, count: 5, t });
    C.balloons(ctx, { x: 940, y: 780, size: 80, count: 3, t: t + 1.3 });
    C.cake(ctx, { x: 540, y: 800, size: 420, text: 'Congratulations Sam', t });
    L.text(ctx, 'banner · balloons · cake', 40, 960, { size: 22, color: '#F1E2C8' });
  },
});
