// Fixture 15 'script-beats': the Reserves dress uniform and the four poses the script added.
// Top row: dress uniform at 18 (front three-quarter, facing left, and beside fatigues for contrast).
// Bottom rows: lieStare on a bed (14), touchHead (19, Outpost, no helmet), callOut jogging (21,
// swim), liftLiner seated and in bed (19, gown) with the helmet prop drawn between his layers.
FILM.scene({
  id: 'script-beats',
  draw(ctx, t, info) {
    const L = info.lib, P = L.pal;
    const J = FILM.cast.sam, HM = FILM.cast.helmet;
    ctx.fillStyle = P.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = P.paperShade;
    ctx.fillRect(0, 400, 1080, 20);
    ctx.fillRect(0, 900, 1080, 26);
    const h = 190;
    // row 1: dress uniform
    J(ctx, { x: 120, y: 400, h, t, age: 18, outfit: 'dress', look: 0.15 });
    J(ctx, { x: 300, y: 400, h, t: t + 1, age: 18, outfit: 'dress', facing: -1, expr: 'smileSmall' });
    J(ctx, { x: 480, y: 400, h, t: t + 2, age: 18, outfit: 'dress', walk: t / 0.9 });
    J(ctx, { x: 660, y: 400, h, t: t + 3, age: 18, outfit: 'fatigues-camp' });
    L.text(ctx, 'dress · 18', 300, 440, { size: 17, align: 'center', color: P.inkSoft });
    L.text(ctx, 'fatigues-camp', 660, 440, { size: 17, align: 'center', color: P.inkSoft });
    // row 2
    const gy = 900;
    // lieStare on a bed
    ctx.fillStyle = P.paperShade;
    ctx.fillRect(20, gy - 70, 250, 70);
    J(ctx, { x: 170, y: gy - 70, h: 170, t, age: 14, pose: 'lieStare', shadow: false });
    L.text(ctx, 'lieStare · 14', 140, gy + 40, { size: 17, align: 'center', color: P.inkSoft });
    J(ctx, { x: 340, y: gy, h, t, age: 19, outfit: 'fatigues-desert', pose: 'touchHead', poseAmt: L.clamp((t % 2) / 0.5) });
    L.text(ctx, 'touchHead · 19', 350, gy + 40, { size: 17, align: 'center', color: P.inkSoft });
    const jo = { x: 520, y: gy, h, t, age: 21, outfit: 'swim', pose: 'callOut', walk: t / 0.7 };
    J(ctx, jo);
    L.text(ctx, 'callOut · 21', 530, gy + 40, { size: 17, align: 'center', color: P.inkSoft });
    // liftLiner on a bed edge, then sitting up in bed, lift animating
    const lift = 0.5 + 0.5 * Math.sin(t * 2.2);
    ctx.fillStyle = P.paperShade;
    ctx.fillRect(640, gy - 0.22 * h * 1.12, 150, 0.22 * h * 1.12);
    [{ x: 690, bed: false, lift }, { x: 880, bed: true, lift: 1, facing: -1 }].forEach((c) => {
      const o = { x: c.x, y: gy, h, t, age: 19, outfit: 'gown', pose: 'liftLiner', lift: c.lift, bed: c.bed, facing: c.facing || 1 };
      if (c.bed) {
        ctx.fillStyle = P.paperShade;
        ctx.fillRect(c.x - 190, gy - 18, 240, 18);
      }
      J(ctx, Object.assign({ layer: 'back' }, o));
      HM(ctx, J.pose(o).helmet);
      J(ctx, Object.assign({ layer: 'front' }, o));
    });
    L.text(ctx, 'liftLiner · seat, bed', 790, gy + 40, { size: 17, align: 'center', color: P.inkSoft });
    L.text(ctx, 'script beats · dress uniform and new poses', 60, 70, { size: 28, color: P.ink });
  },
});
