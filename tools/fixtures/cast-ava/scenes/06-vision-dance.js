// Fixture 'ava-vision-dance': the S08 vision. One slow turn over 4 s in the blue dress, alpha
// 0.88, floating a little over pale fog, hair and hem trailing the turn.
FILM.scene({
  id: 'ava-vision-dance',
  draw(ctx, t, info) {
    const g = ctx.createLinearGradient(0, 0, 0, 1080);
    g.addColorStop(0, '#E9EEF3');
    g.addColorStop(0.6, '#DCE5EE');
    g.addColorStop(1, '#C9D6E4');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1080);
    const glow = ctx.createRadialGradient(540, 520, 20, 540, 520, 520);
    glow.addColorStop(0, 'rgba(255,250,238,0.85)');
    glow.addColorStop(1, 'rgba(255,250,238,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 1080);
    const M = FILM.cast.ava;
    M(ctx, { x: 540, y: 860, h: 560, t, outfit: 'vision', pose: { dance: 0.8, float: 0.2 }, expr: 'smileSoft', alpha: 0.88, breeze: 0.6 });
    info.lib.text(ctx, 'vision dance · t ' + t.toFixed(2), 60, 80, { size: 30, color: '#4A5A6A' });
  },
});
