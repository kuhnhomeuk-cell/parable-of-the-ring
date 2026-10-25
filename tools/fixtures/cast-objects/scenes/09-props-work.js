// Fixture 09 'props-work': sponge with foam and rising bubbles (car wash), the striped tube
// sock, duct tape pulled 0 to 1 over 3 s, crutches and the rifle standing upright.
FILM.scene({
  id: 'props-work',
  draw(ctx, tIn, info) {
    const L = info.lib;
    const t = L.clamp(tIn, 0, info.dur);
    ctx.fillStyle = '#E4EEF0';
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = '#C9D6D8';
    ctx.fillRect(0, 900, 1080, 180);
    const C = FILM.cast;
    C.bubbles(ctx, { x: 40, y: 40, w: 360, h: 380, size: 30, count: 16, t });
    C.sponge(ctx, { x: 220, y: 330, size: 200, rot: -0.12, foam: 0.8 });
    C.sock(ctx, { x: 560, y: 230, size: 200, rot: 0.15 + 0.4 * Math.sin(t * 1.5) });
    const pull = L.ease.inOutSine(L.clamp(t / 3));
    C.ductTape(ctx, { x: 820, y: 210, size: 150, pull });
    C.crutches(ctx, { x: 260, y: 900, size: 400 });
    C.rifle(ctx, { x: 640, y: 900, size: 380 });
    C.rifle(ctx, { x: 900, y: 760, size: 260, rot: -0.35 });
    L.text(ctx, 'sponge · bubbles', 120, 440, { size: 22, color: '#3A4A50' });
    L.text(ctx, 'sock', 540, 420, { size: 22, color: '#3A4A50' });
    L.text(ctx, 'ductTape · pull ' + pull.toFixed(2), 760, 400, { size: 22, color: '#3A4A50' });
    L.text(ctx, 'crutches', 200, 960, { size: 22, color: '#3A4A50' });
    L.text(ctx, 'rifle upright · carried tilt', 640, 960, { size: 22, color: '#3A4A50' });
  },
});
