// Fixture 07 'fling': u = t / 1.5. The hand path over the whole move is traced; the bundle rides
// pose().fling.mid while grip is 1, then falls on a parabola from the release.
FILM.scene({
  id: 'fling',
  draw(ctx, t, info) {
    const L = info.lib;
    const GY = 900;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const D = FILM.cast.drillSergeant;
    const base = { x: 380, y: GY, h: 400, pose: 'fling' };
    // locker
    ctx.fillStyle = '#7F8C8A';
    ctx.fillRect(560, 470, 180, 430);
    ctx.fillStyle = '#56615F';
    ctx.fillRect(575, 490, 150, 390);
    // traced path of the near hand
    ctx.fillStyle = 'rgba(200,66,58,0.55)';
    for (let i = 0; i <= 60; i++) {
      const p = D.pose(Object.assign({}, base, { t: 0, u: i / 60 })).hands[0];
      ctx.beginPath();
      ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
      ctx.fill();
    }
    const o = Object.assign({}, base, { t });
    D(ctx, o);
    const f = D.pose(o).fling;
    let b;
    if (f.u <= f.release) b = f.mid;
    else {
      const r = D.pose(Object.assign({}, base, { t: 0, u: f.release })).fling.mid;
      const k = (f.u - f.release) * 1.5; // seconds since the release
      b = [r[0] + 420 * k, Math.min(GY - 14, r[1] + 300 * k + 2600 * k * k)];
    }
    if (f.u > 0.2) {
      ctx.fillStyle = '#4E6A3E';
      ctx.strokeStyle = '#1F1712';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(b[0], b[1], 30, 18, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    L.text(ctx, 'fling · u ' + f.u.toFixed(2) + ' · grip ' + f.grip, 60, 90, { size: 34, color: L.pal.ink });
  },
});
