// Fixture 'ava-with-sam': scale and style match. Teen Sam is h 330 in a medium shot;
// adult Sam is 1.12 times that and Ava is adult Sam minus 5% (art bible section 4).
FILM.scene({
  id: 'ava-with-sam',
  draw(ctx, t, info) {
    const L = info.lib;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    const GY = 860;
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const J = FILM.cast.sam;
    const M = FILM.cast.ava;
    const hJ = 330 * 1.12, hM = hJ * 0.95;
    // height guides
    ctx.strokeStyle = 'rgba(60,40,20,0.25)';
    ctx.lineWidth = 2;
    for (const yy of [GY - hJ, GY - hM, GY - 330]) {
      ctx.beginPath();
      ctx.moveTo(40, yy);
      ctx.lineTo(1040, yy);
      ctx.stroke();
    }
    J(ctx, { x: 180, y: GY, h: 330, t });
    J(ctx, { x: 470, y: GY, h: hJ, t: t + 0.5, age: 21 });
    M(ctx, { x: 700, y: GY, h: hM, t: t + 0.9, outfit: 'beach', facing: -1, expr: 'smileSoft' });
    M(ctx, { x: 930, y: GY, h: hM, t: t + 1.6, outfit: 'nurse', facing: -1, expr: 'neutral', pose: 'walk', walk: t / 1.2 });
    L.text(ctx, 'teen Sam h 330', 180, GY + 60, { size: 22, align: 'center', color: L.pal.inkSoft });
    L.text(ctx, 'Sam 21 · h ' + hJ.toFixed(0), 470, GY + 60, { size: 22, align: 'center', color: L.pal.inkSoft });
    L.text(ctx, 'Ava h ' + hM.toFixed(0), 815, GY + 60, { size: 22, align: 'center', color: L.pal.inkSoft });
    L.text(ctx, 'ava beside sam', 60, 90, { size: 34, color: L.pal.ink });
  },
});
