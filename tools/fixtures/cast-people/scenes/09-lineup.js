// Fixture 09 'lineup': everyone standing on one ground line. Teen Sam h = 280.
FILM.scene({
  id: 'lineup',
  draw(ctx, t, info) {
    const L = info.lib;
    const GY = 880;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const HT = 280;
    const C = FILM.cast;
    const row = [
      ['teen', 90, () => C.sam(ctx, { x: 90, y: GY, h: HT, t })],
      ['adult 1.12', 255, () => C.sam(ctx, { x: 255, y: GY, h: HT * 1.12, t: t + 0.4 })],
      ['mother 1.14', 430, () => C.mother(ctx, { x: 430, y: GY, h: HT * 1.14, t })],
      ['father 1.2', 600, () => C.father(ctx, { x: 600, y: GY, h: HT * 1.2, t })],
      ['drill 1.2', 790, () => C.drillSergeant(ctx, { x: 790, y: GY, h: HT * 1.2, t })],
      ['sergeant 1.16', 975, () => C.sergeant(ctx, { x: 975, y: GY, h: HT * 1.16, t, pose: 'stand' })],
    ];
    ctx.strokeStyle = 'rgba(31,23,18,0.25)';
    ctx.lineWidth = 1.5;
    for (const k of [1, 1.12, 1.2]) {
      ctx.beginPath();
      ctx.moveTo(20, GY - HT * k);
      ctx.lineTo(1060, GY - HT * k);
      ctx.stroke();
    }
    for (const [label, x, fn] of row) {
      fn();
      L.text(ctx, label, x, GY + 60, { size: 22, align: 'center', color: L.pal.inkSoft });
    }
    L.text(ctx, 'lineup · teen h 280 · lines at 1, 1.12, 1.2', 60, 90, { size: 32, color: L.pal.ink });
  },
});
