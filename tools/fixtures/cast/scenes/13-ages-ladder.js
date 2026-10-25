// Fixture 13 'ages-ladder': the boy-to-man ladder at one h input (210). Top row: every age in the
// same casual shirt so only the body and face change. Bottom row: what each age wears in the story.
FILM.scene({
  id: 'ages-ladder',
  draw(ctx, t, info) {
    const L = info.lib, P = L.pal;
    const J = FILM.cast.sam;
    ctx.fillStyle = P.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = P.paperShade;
    ctx.fillRect(0, 470, 1080, 22);
    ctx.fillRect(0, 930, 1080, 40);
    const ages = [14, 15, 16, 17, 18, 19, 21];
    const story = ['school', 'carwash', 'carwash', 'casual', 'fatigues-camp', 'gown', 'tux'];
    ages.forEach((age, i) => {
      const x = 84 + i * 152;
      J(ctx, { x, y: 470, h: 210, t: t + i * 0.7, age, outfit: 'casual' });
      J(ctx, { x, y: 930, h: 210, t: t + i * 0.9 + 3, age, outfit: story[i], look: 0.15 });
      L.text(ctx, 'age ' + age, x, 515, { size: 19, align: 'center', color: P.ink });
      L.text(ctx, J.height({ h: 210, age }).toFixed(0) + ' px', x, 540, { size: 15, align: 'center', color: P.inkSoft });
      L.text(ctx, story[i], x, 968, { size: 16, align: 'center', color: P.inkSoft });
    });
    L.text(ctx, 'ages ladder · boy to man · h 210 input', 60, 80, { size: 30, color: P.ink });
  },
});
