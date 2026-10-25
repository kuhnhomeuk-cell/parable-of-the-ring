// Fixture 06 'ring-box': the velvet box closed, opening live (open 0 to 1 over 2 s, then held),
// open with the ring seated, and broken in two on the barracks floor.
FILM.scene({
  id: 'ring-box',
  draw(ctx, tIn, info) {
    const L = info.lib;
    const t = L.clamp(tIn, 0, info.dur);
    ctx.fillStyle = '#E9DCC6';
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = '#D8C7AC';
    ctx.fillRect(0, 430, 1080, 70);
    ctx.fillRect(0, 900, 1080, 180);
    const B = FILM.cast.ringBox;
    B(ctx, { x: 200, y: 450, size: 240, t });
    const open = L.ease.inOutSine(L.clamp((t - 0.3) / 2));
    B(ctx, { x: 560, y: 450, size: 240, t, open, ring: true });
    B(ctx, { x: 900, y: 450, size: 240, t, open: 1, ring: true, sparkle: Math.max(0, 1 - Math.abs(t - 3) / 0.5) });
    B(ctx, { x: 360, y: 920, size: 260, t, broken: true, yaw: 0.3 });
    B(ctx, { x: 860, y: 920, size: 150, t, open: 1, ring: true, yaw: 0.0, tilt: 0.3 });
    L.text(ctx, 'closed', 200, 540, { size: 22, align: 'center', color: '#5A4A3A' });
    L.text(ctx, 'open ' + open.toFixed(2) + ' · ring', 560, 540, { size: 22, align: 'center', color: '#5A4A3A' });
    L.text(ctx, 'open 1 · ring · sparkle', 900, 540, { size: 22, align: 'center', color: '#5A4A3A' });
    L.text(ctx, 'broken', 420, 990, { size: 22, align: 'center', color: '#5A4A3A' });
    L.text(ctx, '150 · yaw 0 (S28 kneel)', 860, 990, { size: 22, align: 'center', color: '#5A4A3A' });
    L.text(ctx, 'ringBox', 40, 60, { size: 26, color: '#5A4A3A' });
  },
});
