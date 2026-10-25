// Fixture 01 'ring-ecu': the S01 extreme close-up. The ring at 700 px on dark velvet, turning
// slowly, a band of dawn light sweeping across, one sparkle at 2.4 s.
FILM.scene({
  id: 'ring-ecu',
  draw(ctx, t, info) {
    const L = info.lib;
    // dark velvet plate with a soft pool of light
    const g = ctx.createRadialGradient(560, 520, 40, 540, 560, 760);
    g.addColorStop(0, '#2B3B7C');
    g.addColorStop(0.55, '#16224F');
    g.addColorStop(1, '#0A1030');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1080);
    const sweep = L.lerp(-1.25, -0.55, L.smoothstep(0, 4, t));
    const sp = Math.max(0, 1 - Math.abs(t - 2.4) / 0.45);
    FILM.cast.diamondRing(ctx, { x: 540, y: 660, size: 640, rot: 0.42 + t * 0.05, tilt: 0.26, t, light: sweep, sparkle: sp * sp });
    L.text(ctx, 'diamondRing · size 640 · rot ' + (0.42 + t * 0.05).toFixed(2) + ' · light ' + sweep.toFixed(2), 40, 60, { size: 24, color: '#C9D3F0' });
  },
});
