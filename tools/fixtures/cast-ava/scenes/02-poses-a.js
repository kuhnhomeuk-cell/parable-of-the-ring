// Fixture 'ava-poses-a': stand, walk, run, dance, float, leanOverBed, laughHand, walkAwayLaugh.
// Two rows at h = 230; walk and run cycle in place.
FILM.scene({
  id: 'ava-poses-a',
  draw(ctx, t, info) {
    const L = info.lib;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    const G1 = 470, G2 = 900;
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, G1, 1080, 26);
    ctx.fillRect(0, G2, 1080, 120);
    const M = FILM.cast.ava;
    const h = 230;
    const cells = [
      ['stand', { outfit: 'nurse' }],
      ['walk', { outfit: 'nurse', walk: t / 1.15 }],
      ['run', { outfit: 'beach', walk: t / 0.7, expr: 'laugh' }],
      ['dance', { outfit: 'vision', expr: 'smileSoft', breeze: 0.6 }],
      ['float', { outfit: 'vision', expr: 'loving', breeze: 0.5 }],
      ['leanOverBed', { outfit: 'nurse', expr: 'smileSoft' }],
      ['laughHand', { outfit: 'nurse', expr: 'laugh' }],
      ['walkAwayLaugh', { outfit: 'nurse', expr: 'laugh', walk: t / 1.15 }],
    ];
    cells.forEach(([pose, extra], i) => {
      const col = i % 4, rowI = Math.floor(i / 4);
      const x = 140 + col * 265, y = rowI ? G2 : G1;
      M(ctx, Object.assign({ x, y, h, t: t + i * 0.37, pose }, extra));
      L.text(ctx, pose, x, y + 50, { size: 24, align: 'center', color: L.pal.inkSoft });
    });
    L.text(ctx, 'ava · poses a · h 230', 60, 80, { size: 32, color: L.pal.ink });
  },
});
