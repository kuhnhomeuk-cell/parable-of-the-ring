// Fixture 12 'run-strip': run (top) and sprintCrouch (middle) frozen at 8 phases, and a live run
// at the contract stride with the planted-foot drift measured from FILM.cast.sam.pose.
FILM.scene({
  id: 'run-strip',
  draw(ctx, t, info) {
    const L = info.lib, P = L.pal;
    const J = FILM.cast.sam;
    ctx.fillStyle = P.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    const rows = [['run', 330, {}], ['sprintCrouch', 640, { outfit: 'fatigues-desert', helmet: true, age: 19 }]];
    for (const [pose, gy, extra] of rows) {
      ctx.fillStyle = P.paperShade;
      ctx.fillRect(0, gy, 1080, 8);
      for (let i = 0; i < 8; i++) {
        J(ctx, Object.assign({ x: 70 + i * 133, y: gy, h: 180, t: 0.3 + i, pose, walk: i / 8 }, extra));
        L.text(ctx, (i / 8).toFixed(3), 70 + i * 133, gy + 30, { size: 15, align: 'center', color: P.inkFaint });
      }
      L.text(ctx, pose, 60, gy - 210, { size: 24, color: P.ink });
    }
    // live: x advances by sam.stride per cycle; measure the near sole while it is planted
    const h = 180, GY = 930;
    ctx.fillStyle = P.paperShade;
    ctx.fillRect(0, GY, 1080, 8);
    const per = J.stride({ h, pose: 'run' });
    const x = 80 + t * 420;
    J(ctx, { x, y: GY, h, t, pose: 'run', walk: (x - 80) / per });
    let drift = 0, ref = null;
    for (let k = 0; k <= 12; k++) {
      const w = (k / 12) * 0.329;
      const leg = J.pose({ x: 80 + w * per, y: GY, h, pose: 'run', walk: w }).legs[0];
      // the flat shoe's placement: the heel when it rolls on the heel, else the ball minus the foot
      const ball = leg.phi < 0 ? leg.heel[0] : leg.ball[0] - (39 * h) / 330;
      if (ref === null) ref = ball;
      drift = Math.max(drift, Math.abs(ball - ref));
    }
    L.text(ctx, 'live run at sam.stride · planted ball drift ' + drift.toFixed(2) + ' px', 60, 990, { size: 22, color: P.inkSoft });
  },
});
