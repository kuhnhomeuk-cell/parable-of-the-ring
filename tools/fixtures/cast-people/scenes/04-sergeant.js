// Fixture 04 'sergeant-poses': the Front sergeant at h = 400. A low wall stands in for cover in the
// crouch; dots mark the pullIn grips (red) and the partner's hand positions (blue).
FILM.scene({
  id: 'sergeant-poses',
  draw(ctx, t, info) {
    const L = info.lib;
    const GY = 900;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const S = FILM.cast.sergeant;
    const xs = [130, 400, 640, 880];
    const poses = ['crouch', 'waveDown', 'shout', 'pullIn'];
    // the wall in front of the crouch
    ctx.fillStyle = '#B9A07E';
    ctx.fillRect(xs[0] + 80, GY - 150, 70, 150);
    poses.forEach((p, i) => {
      const x = xs[i];
      const o = { x, y: GY, h: 400, t: t + i * 0.37, pose: p };
      S(ctx, o);
      if (p === 'pullIn') {
        const d = S.pose(o).drag;
        for (const [pts, col] of [[d.grip, '#C8423A'], [d.partner, '#3A6FC8']]) {
          ctx.fillStyle = col;
          for (const q of pts) {
            ctx.beginPath();
            ctx.arc(q[0], q[1], 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      L.text(ctx, p, x, GY + 60, { size: 26, align: 'center', color: L.pal.inkSoft });
    });
    L.text(ctx, 'Front sergeant · h 400', 60, 90, { size: 36, color: L.pal.ink });
  },
});
