// Fixture 'lineup': both standing beside teen Sam at h 330 for scale and style.
FILM.scene({
  id: 'lineup',
  draw(ctx, t, info) {
    const L = info.lib;
    const GY = 860;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const JH = 330;
    const S = FILM.cast.salesman, K = FILM.cast.nell;
    // height guides
    ctx.strokeStyle = L.pal.inkFaint;
    ctx.setLineDash([5, 7]);
    for (const k of [1, K.HK, S.HK]) {
      ctx.beginPath();
      ctx.moveTo(60, GY - JH * k);
      ctx.lineTo(1020, GY - JH * k);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    S(ctx, { x: 250, y: GY, h: JH * S.HK, t, pose: 'stand' });
    FILM.cast.sam(ctx, { x: 540, y: GY, h: JH, t: t + 0.8 });
    K(ctx, { x: 830, y: GY, h: JH * K.HK, t: t + 1.6, facing: -1, pose: 'stand', expr: 'smile' });
    L.text(ctx, 'salesman 1.25x', 250, GY + 60, { size: 24, align: 'center', color: L.pal.inkSoft });
    L.text(ctx, 'Sam h 330', 540, GY + 60, { size: 24, align: 'center', color: L.pal.inkSoft });
    L.text(ctx, 'Nell 1.1x', 830, GY + 60, { size: 24, align: 'center', color: L.pal.inkSoft });
    L.text(ctx, 'lineup · scale and style', 60, 90, { size: 32, color: L.pal.ink });
  },
});
