// Fixture 02 'ring-sizes': the ring at 300, 100 and 20 px, turning slowly, with a sparkle that
// passes from one to the next; the 20 px ring also sits on a pale skin plate as on a finger.
FILM.scene({
  id: 'ring-sizes',
  draw(ctx, t, info) {
    const L = info.lib;
    const g = ctx.createLinearGradient(0, 0, 0, 1080);
    g.addColorStop(0, '#1C2A62');
    g.addColorStop(1, '#0D1438');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1080);
    const rot = 0.3 + t * 0.12;
    const sp = (c) => {
      const k = Math.max(0, 1 - Math.abs(t - c) / 0.5);
      return k * k;
    };
    FILM.cast.diamondRing(ctx, { x: 300, y: 560, size: 300, rot, tilt: 0.22, t, sparkle: sp(0.8) });
    FILM.cast.diamondRing(ctx, { x: 690, y: 600, size: 100, rot, tilt: 0.22, t, sparkle: sp(1.8) });
    FILM.cast.diamondRing(ctx, { x: 880, y: 620, size: 20, rot, tilt: 0.22, t, sparkle: sp(2.8) });
    // a finger-size plate: a pale skin band with the 20 px ring on it
    ctx.fillStyle = '#F6CDA6';
    ctx.strokeStyle = '#1F1712';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(700, 820, 300, 34, 17);
    ctx.fill();
    ctx.stroke();
    FILM.cast.diamondRing(ctx, { x: 850, y: 836, size: 20, rot: 1.25, tilt: 0.15, t, shadow: 0, lw: 1.2, sparkle: sp(3.5) });
    L.text(ctx, '300', 300, 860, { size: 26, align: 'center', color: '#C9D3F0' });
    L.text(ctx, '100', 690, 740, { size: 26, align: 'center', color: '#C9D3F0' });
    L.text(ctx, '20', 880, 700, { size: 26, align: 'center', color: '#C9D3F0' });
    L.text(ctx, '20 on a finger', 850, 900, { size: 22, align: 'center', color: '#C9D3F0' });
    L.text(ctx, 'diamondRing · sizes · rot ' + rot.toFixed(2), 40, 60, { size: 26, color: '#C9D3F0' });
  },
});
