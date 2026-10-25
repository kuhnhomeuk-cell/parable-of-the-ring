// Fixture 11 'helmet': the helmet on his head (desert fatigues, two looks), and as a prop:
// upright, turning over, then upturned with the liner lifting out to show the taped ring.
FILM.scene({
  id: 'helmet',
  draw(ctx, t, info) {
    const L = info.lib, P = L.pal;
    const C = FILM.cast;
    ctx.fillStyle = P.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = P.paperShade;
    ctx.fillRect(0, 470, 1080, 30);
    C.sam(ctx, { x: 150, y: 470, h: 330, t, age: 19, outfit: 'fatigues-desert', helmet: true, look: 0.2 });
    C.sam(ctx, { x: 420, y: 470, h: 330, t: t + 1, age: 19, outfit: 'fatigues-camp', facing: -1 });
    L.text(ctx, 'on his head', 150, 520, { size: 18, align: 'center', color: P.inkSoft });
    L.text(ctx, 'fatigues-camp, shaved', 420, 520, { size: 18, align: 'center', color: P.inkSoft });
    // prop states
    C.helmet(ctx, { x: 720, y: 380, size: 200, t });
    L.text(ctx, 'open 0', 720, 430, { size: 18, align: 'center', color: P.inkSoft });
    C.helmet(ctx, { x: 960, y: 380, size: 170, t, open: 0.35 });
    L.text(ctx, 'open 0.35', 960, 430, { size: 18, align: 'center', color: P.inkSoft });
    C.helmet(ctx, { x: 270, y: 800, size: 300, t, open: 1, liner: 0 });
    L.text(ctx, 'open 1 · liner 0', 270, 990, { size: 18, align: 'center', color: P.inkSoft });
    const lin = L.clamp((t - 0.5) / 2.5);
    C.helmet(ctx, { x: 760, y: 790, size: 340, t, open: 1, liner: L.ease.inOutSine(lin) });
    L.text(ctx, 'open 1 · liner ' + lin.toFixed(2), 760, 990, { size: 18, align: 'center', color: P.inkSoft });
    L.text(ctx, 'helmet', 60, 80, { size: 32, color: P.ink });
  },
});
