// Fixture 06 'ages': the same h input (220) at every age, school clothes on the top row and the
// clothes each age wears in the story on the bottom row.
FILM.scene({
  id: 'ages',
  draw(ctx, t, info) {
    const L = info.lib, P = L.pal;
    const J = FILM.cast.sam;
    ctx.fillStyle = P.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = P.paperShade;
    ctx.fillRect(0, 470, 1080, 26);
    ctx.fillRect(0, 950, 1080, 50);
    const ages = [10, 14, 16, 17, 18, 21];
    const story = ['casual', 'school', 'carwash', 'casual', 'fatigues-camp', 'tux'];
    ages.forEach((age, i) => {
      const x = 95 + i * 178;
      J(ctx, { x, y: 470, h: 220, t: t + i * 0.7, age });
      J(ctx, { x, y: 950, h: 220, t: t + i * 0.9 + 3, age, outfit: story[i], look: 0.2 });
      L.text(ctx, 'age ' + age + ' · ' + J.height({ h: 220, age }).toFixed(0) + ' px', x, 520, { size: 18, align: 'center', color: P.inkSoft });
      L.text(ctx, story[i], x, 990, { size: 18, align: 'center', color: P.inkSoft });
    });
    L.text(ctx, 'ages · h 220 input', 60, 80, { size: 32, color: P.ink });
  },
});
