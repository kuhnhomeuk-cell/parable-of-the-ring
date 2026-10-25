// Fixture 03 'ring-light': rows are light angles, columns are turns, all at 200 px. The
// brightest facet (and the band highlight) should follow the light across a row.
FILM.scene({
  id: 'ring-light',
  draw(ctx, t, info) {
    const L = info.lib;
    ctx.fillStyle = '#18234F';
    ctx.fillRect(0, 0, 1080, 1080);
    const lights = [-2.3, -1.57, -0.9];
    const rots = [0, 0.6, 1.2, 1.5];
    lights.forEach((light, r) => {
      rots.forEach((rot, c) => {
        const x = 150 + c * 260, y = 250 + r * 290;
        FILM.cast.diamondRing(ctx, { x, y, size: 180, rot, tilt: 0.25, t: 0, light, sparkle: c === 3 ? 0.8 : 0 });
        L.text(ctx, 'light ' + light.toFixed(2) + ' rot ' + rot.toFixed(1), x, y + 120, { size: 18, align: 'center', color: '#C9D3F0' });
      });
    });
    L.text(ctx, 'diamondRing · light x rot', 40, 50, { size: 26, color: '#C9D3F0' });
  },
});
