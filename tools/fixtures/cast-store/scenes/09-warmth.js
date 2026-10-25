// Fixture 'warmth': the salesman's arc. warmth 0 (S06 glare), 0.5 (S14c barely looking), 1 (S15 apology).
FILM.scene({
  id: 'warmth',
  draw(ctx, t, info) {
    const L = info.lib;
    const GY = 880;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const S = FILM.cast.salesman;
    const row = [
      ['warmth 0 · leanGlare · scowl', { warmth: 0, pose: 'leanGlare', expr: 'scowl' }],
      ['warmth 0.5 · barelyLook', { warmth: 0.5, pose: 'barelyLook' }],
      ['warmth 1 · apologise · tearful', { warmth: 1, pose: 'apologise', expr: 'tearful' }],
    ];
    row.forEach(([label, o], i) => {
      const x = 200 + i * 330;
      S(ctx, Object.assign({ x, y: GY, h: 440, t: t + i * 0.5 }, o));
      L.text(ctx, label, x + 20, GY + 50, { size: 22, align: 'center', color: L.pal.inkSoft });
    });
    L.text(ctx, 'salesman warmth · h 440', 60, 90, { size: 32, color: L.pal.ink });
  },
});
