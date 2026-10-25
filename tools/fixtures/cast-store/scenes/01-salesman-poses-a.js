// Fixture 'salesman-poses-a': five salesman poses at h = 400. jerkAway runs its jerk 0 -> 1 over the shot.
FILM.scene({
  id: 'salesman-poses-a',
  draw(ctx, t, info) {
    const L = info.lib;
    const GY = 900;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const S = FILM.cast.salesman;
    const jerk = L.clamp((t - 0.3) / 2.2);
    const row = [
      ['stand', { pose: 'stand' }],
      ['leanGlare', { pose: 'leanGlare' }],
      ['holdUp', { pose: 'holdUp' }],
      ['jerkAway ' + jerk.toFixed(2), { pose: 'jerkAway', jerk }],
      ['armsFolded', { pose: 'armsFolded' }],
    ];
    row.forEach(([label, o], i) => {
      const x = 105 + i * 210;
      S(ctx, Object.assign({ x, y: GY, h: 400, t: t + i * 0.7 }, o));
      L.text(ctx, label, x + 10, GY + 50, { size: 24, align: 'center', color: L.pal.inkSoft });
    });
    // the default counter top for the counter poses
    ctx.strokeStyle = L.pal.inkFaint;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    const cy = S.counterY(GY, 400 / 1.25);
    ctx.moveTo(0, cy);
    ctx.lineTo(1080, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    L.text(ctx, 'salesman poses a · h 400 · dashed: default counter top', 60, 90, { size: 32, color: L.pal.ink });
  },
});
