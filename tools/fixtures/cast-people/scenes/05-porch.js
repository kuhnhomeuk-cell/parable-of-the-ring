(function () {
// Fixture 05 'porch': the parents on the porch step at dusk light (from the left), adult Sam
// (1.12 x teen) on the walk below for scale. Teen Sam h = 300; father 1.2x, mother 1.14x.
FILM.scene({
  id: 'porch',
  draw(ctx, t, info) {
    const L = info.lib;
    const HT = 300;
    porchPlate(ctx, L);
    const M = FILM.cast.mother, F = FILM.cast.father, J = FILM.cast.sam;
    const STEP = 700, GY = 820;
    const light = [-0.7, -0.7];
    const fo = { x: 430, y: STEP, h: HT * 1.2, t, pose: 'holdOutEnvelope', light };
    const fp = F.pose(fo);
    const mo = { x: 330, y: STEP, h: HT * 1.14, t: t + 0.4, pose: 'clutch', expr: 'cry', light };
    // she holds his arm above the elbow
    mo.target = [L.lerp(fp.shoulders[0][0], fp.elbows[0][0], 0.6), L.lerp(fp.shoulders[0][1], fp.elbows[0][1], 0.6)];
    mo.target2 = [L.lerp(fp.shoulders[0][0], fp.elbows[0][0], 0.25) + 6, L.lerp(fp.shoulders[0][1], fp.elbows[0][1], 0.25) - 4];
    M(ctx, mo);
    F(ctx, fo);
    const e = fp.envelope;
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle);
    ctx.fillStyle = '#F4EFE4';
    ctx.strokeStyle = '#1F1712';
    ctx.lineWidth = 3;
    ctx.fillRect(-4, -14, 46, 30);
    ctx.strokeRect(-4, -14, 46, 30);
    ctx.restore();
    J(ctx, { x: 720, y: GY, h: HT * 1.12, t, facing: -1 });
    L.text(ctx, 'porch · teen 300 · Sam 1.12x · mother 1.14x · father 1.2x', 60, 90, { size: 30, color: L.pal.ink });
  },
});

function porchPlate(ctx, L) {
  ctx.fillStyle = '#6F7FA0';
  ctx.fillRect(0, 0, 1080, 1080);
  // house wall and door
  ctx.fillStyle = '#C9B8A0';
  ctx.fillRect(0, 160, 640, 540);
  ctx.fillStyle = '#7C5C46';
  ctx.fillRect(150, 300, 130, 400);
  ctx.fillStyle = '#F2D79A';
  ctx.fillRect(400, 330, 140, 150);
  // porch floor and step
  ctx.fillStyle = '#9C7A5C';
  ctx.fillRect(0, 700, 660, 40);
  ctx.fillStyle = '#86664C';
  ctx.fillRect(0, 740, 700, 80);
  ctx.fillStyle = '#5C6E58';
  ctx.fillRect(0, 820, 1080, 260);
  ctx.fillStyle = '#A8A496';
  ctx.fillRect(620, 820, 460, 30);
}
})();
