// Fixture 'ava-beach-beat': the three "leaving, laughing" beats side by side so they read apart.
// Top: runAwayWave across the sand in the sundress and the swimsuit, at the run contract stride.
// Bottom: walkAwayLaugh (hospital, hand at the mouth) and splash (waist-deep, both hands at the water).
// Gold dots mark pose().rings[0], the ring finger of the waving hand.
FILM.scene({
  id: 'ava-beach-beat',
  draw(ctx, t, info) {
    const L = info.lib;
    const M = FILM.cast.ava;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    const G1 = 470, G2 = 900;
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, G1, 1080, 30);
    ctx.fillRect(0, G2, 1080, 180);
    const h = 260;
    const dot = (p) => {
      ctx.fillStyle = L.pal.ochre || L.pal.inkSoft;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
      ctx.fill();
    };
    const per = 2 * M.RUN_STEP * h;
    const runs = [
      { x: 120 + 230 * t, outfit: 'beach', label: 'runAwayWave · sundress' },
      { x: 560 + 230 * t, outfit: 'beach', swim: true, label: 'runAwayWave · swim' },
    ];
    for (const r of runs) {
      const o = { x: r.x, y: G1, h, t, outfit: r.outfit, swim: r.swim, pose: 'runAwayWave', walk: (r.x - 120) / per, expr: 'laugh', breeze: 0.5 };
      M(ctx, o);
      dot(M.pose(o).rings[0]);
      L.text(ctx, r.label, r.x, G1 + 60, { size: 22, align: 'center', color: L.pal.inkSoft });
    }
    const wa = { x: 200 + 90 * t, y: G2, h, t, outfit: 'nurse', pose: 'walkAwayLaugh', walk: (90 * t) / (2 * M.STEP * h), expr: 'laugh' };
    M(ctx, wa);
    L.text(ctx, 'walkAwayLaugh · nurse', 260, G2 + 50, { size: 22, align: 'center', color: L.pal.inkSoft });
    const wy = G2 - 120;
    ctx.fillStyle = L.pal.annBlue;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(600, wy, 440, G2 - wy);
    ctx.globalAlpha = 1;
    M(ctx, { x: 800, y: G2, h, t, outfit: 'beach', swim: true, pose: 'splash', waterY: wy, expr: 'laugh' });
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = L.pal.annBlue;
    ctx.fillRect(600, wy, 440, G2 - wy);
    ctx.globalAlpha = 1;
    L.text(ctx, 'splash · swim · waterY', 800, G2 + 50, { size: 22, align: 'center', color: L.pal.inkSoft });
    L.text(ctx, 'ava · beach beat vs walk-away vs splash', 60, 80, { size: 30, color: L.pal.ink });
  },
});
