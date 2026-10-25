// Fixture 10 'faces': the four heads at h = 1000, one per quadrant, stepping through the eight
// expressions (0.5 s each, held across the shot).
FILM.scene({
  id: 'faces',
  draw(ctx, t, info) {
    const L = info.lib;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    const EX = ['neutral', 'sad', 'cry', 'worried', 'stern', 'shout', 'kind', 'relieved'];
    const ex = EX[Math.min(EX.length - 1, Math.floor(t / 0.55))];
    const C = FILM.cast;
    const who = [['mother', 270, 300], ['father', 810, 300], ['drillSergeant', 270, 820], ['sergeant', 810, 820]];
    for (const [name, cx, cy] of who) {
      const fn = C[name];
      const o0 = { x: 0, y: 0, h: 1000, t, expr: ex, pose: 'stand' };
      const hp = fn.pose(o0).head;
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx - 270, cy - 270 + (cy > 540 ? 10 : 0), 540, 520);
      ctx.clip();
      fn(ctx, Object.assign({}, o0, { x: cx - hp[0], y: cy + 40 - hp[1] }));
      ctx.restore();
    }
    L.text(ctx, 'faces · ' + ex, 40, 60, { size: 34, color: L.pal.ink });
  },
});
