// Fixture 10 'soldiers': the six variants standing in desert fatigues, then a running row in
// the Outpost crouch at a smaller size, phases offset.
FILM.scene({
  id: 'soldiers',
  draw(ctx, t, info) {
    const L = info.lib, P = L.pal;
    const S = FILM.cast.soldier;
    ctx.fillStyle = P.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = P.paperShade;
    ctx.fillRect(0, 500, 1080, 26);
    ctx.fillRect(0, 930, 1080, 70);
    for (let v = 0; v < 6; v++) {
      const x = 100 + v * 176;
      S(ctx, { variant: v, x, y: 500, h: 210, t: t + v * 0.5, look: 0.2 });
      L.text(ctx, 'variant ' + v, x, 550, { size: 18, align: 'center', color: P.inkSoft });
    }
    const h = 150;
    const per = S.stride({ h, pose: 'sprintCrouch' });
    for (let v = 0; v < 6; v++) {
      const x0 = 60 + v * 165;
      const dx = (t * 260) % 165;
      const x = x0 + dx;
      S(ctx, { variant: (v + 2) % 6, x, y: 930, h, t, pose: 'sprintCrouch', walk: (x - x0 + v * 37) / per });
    }
    L.text(ctx, 'soldiers · 6 variants · sprintCrouch row', 60, 80, { size: 30, color: P.ink });
  },
});
