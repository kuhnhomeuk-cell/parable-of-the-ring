// Fixture 03 'drill-poses': the camp sergeant at h = 400. fling is frozen at u = 0.62 (the wind-up);
// the sock in the sniff is a fixture stand-in hung at pose().sock.
FILM.scene({
  id: 'drill-poses',
  draw(ctx, t, info) {
    const L = info.lib;
    const GY = 900;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const D = FILM.cast.drillSergeant;
    const xs = [110, 310, 500, 700, 900];
    const poses = ['stand', 'shout', 'fling', 'sniff', 'point'];
    poses.forEach((p, i) => {
      const x = xs[i];
      const o = { x, y: GY, h: 400, t: t + i * 0.5, pose: p, u: 0.62 };
      D(ctx, o);
      if (p === 'sniff') {
        const s = D.pose(o).sock;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.fillStyle = '#EDE6D6';
        ctx.strokeStyle = '#1F1712';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(-7, -2); ctx.lineTo(7, -2); ctx.lineTo(8, 44); ctx.quadraticCurveTo(26, 46, 26, 58);
        ctx.quadraticCurveTo(20, 68, 2, 62); ctx.lineTo(-6, 52); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgba(120,140,60,0.8)';
        ctx.lineWidth = 2;
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          ctx.moveTo(-14 + k * 14, -16 - k * 3);
          ctx.quadraticCurveTo(-18 + k * 14, -30, -12 + k * 14, -40);
          ctx.stroke();
        }
        ctx.restore();
      }
      L.text(ctx, p, x, GY + 60, { size: 26, align: 'center', color: L.pal.inkSoft });
    });
    L.text(ctx, 'camp sergeant · h 400', 60, 90, { size: 36, color: L.pal.ink });
  },
});
