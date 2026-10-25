// Fixture 08 'pose-sheet': every named pose at h 170, teen, animated where it moves.
// The fall's progress loops over the shot; run and sprint advance by distance.
FILM.scene({
  id: 'pose-sheet',
  draw(ctx, t, info) {
    const L = info.lib, P = L.pal;
    const J = FILM.cast.sam;
    ctx.fillStyle = P.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    const cells = [
      ['run', { walk: t / 0.62 }], ['sprintCrouch', { walk: t / 0.55, outfit: 'fatigues-desert', helmet: true, age: 19 }],
      ['sit', {}], ['sit', { desk: true, label: 'sit · desk' }],
      ['kneelOffer', { outfit: 'tux', age: 21 }], ['lie', { outfit: 'gown', age: 19, look: 0.4 }],
      ['sitUp', { outfit: 'gown', age: 19 }], ['diveReach', { outfit: 'fatigues-desert', helmet: true, age: 19 }],
      ['fall', { poseAmt: L.clamp((t % 2) / 1.6), outfit: 'fatigues-desert', helmet: true, age: 19, label: 'fall (progress)' }],
      ['weepSit', { outfit: 'swim', age: 21 }], ['pray', { outfit: 'fatigues-desert', age: 19 }],
      ['handshake', { age: 17, outfit: 'casual' }], ['hug', { age: 21, outfit: 'tux' }],
      ['laugh', { age: 21, outfit: 'swim' }], ['chinUp', { age: 16, outfit: 'carwash' }],
    ];
    const COLS = 5, CW = 216, CH = 300;
    cells.forEach(([pose, extra], i) => {
      const c = i % COLS, r = Math.floor(i / COLS);
      const x = 90 + c * CW, gy = 330 + r * CH;
      ctx.fillStyle = P.paperShade;
      ctx.fillRect(c * CW + 8, gy, CW - 16, 6);
      const o = Object.assign({ x, y: gy, h: 170, t: t + i * 0.37, pose }, extra);
      J(ctx, o);
      if (pose === 'kneelOffer') {
        const b = J.pose(o).box;
        ctx.fillStyle = P.annBlue;
        ctx.fillRect(b[0] - 9, b[1] - 12, 18, 12);
      }
      L.text(ctx, extra.label || pose, x + 20, gy + 26, { size: 17, align: 'center', color: P.inkSoft });
    });
    L.text(ctx, 'poses · h 170', 60, 60, { size: 30, color: P.ink });
  },
});
