// Fixture 14 'couple': Sam at 21 beside Ava at the film's sizes (Ava h = adult Sam
// height minus 5%), at the wedding and on the beach, plus 18-year-old Sam beside her for scale.
FILM.scene({
  id: 'couple',
  draw(ctx, t, info) {
    const L = info.lib, P = L.pal;
    const J = FILM.cast.sam, M = FILM.cast.ava;
    ctx.fillStyle = P.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = P.paperShade;
    ctx.fillRect(0, 880, 1080, 40);
    const h = 300;
    const adult = J.height({ h, age: 21 });
    const mh = adult * 0.95;
    const pairs = [
      { x: 190, j: { age: 21, outfit: 'tux', expr: 'smileSmall' }, m: { outfit: 'bride', expr: 'smileSoft' }, label: 'wedding · 21' },
      { x: 540, j: { age: 21, outfit: 'swim', expr: 'happy' }, m: { outfit: 'beach', expr: 'smileSoft' }, label: 'beach · 21' },
      { x: 890, j: { age: 18, outfit: 'casual' }, m: { outfit: 'nurse' }, label: 'Sam 18 · Ava' },
    ];
    pairs.forEach((p, i) => {
      if (M) M(ctx, Object.assign({ x: p.x + 78, y: 880, h: mh, t: t + i, facing: -1 }, p.m));
      J(ctx, Object.assign({ x: p.x - 78, y: 880, h, t: t + i * 0.6, look: 0.1 }, p.j));
      L.text(ctx, p.label, p.x, 960, { size: 20, align: 'center', color: P.inkSoft });
    });
    L.text(ctx, 'Sam 21 beside Ava · same age, a couple', 60, 80, { size: 30, color: P.ink });
    L.text(ctx, 'Sam ' + adult.toFixed(0) + ' px · Ava ' + mh.toFixed(0) + ' px', 60, 124, { size: 20, color: P.inkSoft });
  },
});
