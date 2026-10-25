// Fixture 09 'expressions': every expression on a head close-up (h 470, cropped to the head).
FILM.scene({
  id: 'expressions',
  draw(ctx, t, info) {
    const L = info.lib, P = L.pal;
    const J = FILM.cast.sam;
    ctx.fillStyle = P.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    const names = J.EXPRS;
    names.forEach((n, i) => {
      const c = i % 5, r = Math.floor(i / 5);
      const cx = 108 + c * 216, top = 116 + r * 292;
      ctx.save();
      ctx.beginPath();
      ctx.rect(c * 216 + 4, top, 208, 244);
      ctx.clip();
      J(ctx, { x: cx - 18, y: top + 470 + 14, h: 470, t: t + i * 0.31 + 0.6, expr: n, blinkOffset: 1.3 });
      ctx.restore();
      L.text(ctx, n, cx, top + 270, { size: 22, align: 'center', color: P.inkSoft });
    });
    L.text(ctx, 'expressions', 60, 80, { size: 32, color: P.ink });
  },
});
