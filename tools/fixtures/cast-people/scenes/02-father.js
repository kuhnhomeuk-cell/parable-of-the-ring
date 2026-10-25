// Fixture 02 'father-poses': the father's five poses at h = 400. armAround is shown with the mother
// behind him so the reach reads; the envelope is a fixture stand-in at pose().envelope.
FILM.scene({
  id: 'father-poses',
  draw(ctx, t, info) {
    const L = info.lib;
    const GY = 900;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const F = FILM.cast.father, M = FILM.cast.mother;
    const xs = [100, 290, 470, 720, 930];
    const poses = ['stand', 'headBowed', 'holdOutEnvelope', 'armAround', 'handOnShoulder'];
    poses.forEach((p, i) => {
      const x = xs[i];
      const o = { x, y: GY, h: 400, t: t + i * 0.6, pose: p };
      if (p === 'armAround') {
        const mo = { x: x - 84, y: GY, h: 380, t: t + 0.3, pose: 'cry' };
        M(ctx, mo);
        const mp = M.pose(mo);
        o.target = [mp.shoulders[0][0] + 2, mp.shoulders[0][1] - 8];
      }
      F(ctx, o);
      if (p === 'holdOutEnvelope') {
        const e = F.pose(o).envelope;
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.angle);
        ctx.fillStyle = '#F4EFE4';
        ctx.strokeStyle = '#1F1712';
        ctx.lineWidth = 3;
        ctx.fillRect(-6, -18, 56, 36);
        ctx.strokeRect(-6, -18, 56, 36);
        ctx.restore();
      }
      L.text(ctx, p, x, GY + 60 + (i % 2) * 34, { size: 24, align: 'center', color: L.pal.inkSoft });
    });
    L.text(ctx, 'father · h 400', 60, 90, { size: 36, color: L.pal.ink });
  },
});
