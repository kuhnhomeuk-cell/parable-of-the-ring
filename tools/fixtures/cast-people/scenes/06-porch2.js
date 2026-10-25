(function () {
// Fixture 06 'porch-2': the father, head bowed, with his arm round the crying mother; Sam below.
FILM.scene({
  id: 'porch-2',
  draw(ctx, t, info) {
    const L = info.lib;
    const HT = 300;
    porchPlate(ctx, L);
    const M = FILM.cast.mother, F = FILM.cast.father, J = FILM.cast.sam;
    const STEP = 700, GY = 820;
    const light = [-0.7, -0.7];
    const mo = { x: 342, y: STEP, h: HT * 1.14, t, pose: 'cry', light };
    const mp = M.pose(mo);
    M(ctx, mo);
    F(ctx, { x: 430, y: STEP, h: HT * 1.2, t: t + 0.2, pose: 'armAround', expr: 'sad', light, target: [mp.shoulders[0][0] + 2, mp.shoulders[0][1] - 7] });
    J(ctx, { x: 740, y: GY, h: HT * 1.12, t, facing: -1 });
    L.text(ctx, 'porch-2 · armAround + cry', 60, 90, { size: 30, color: L.pal.ink });
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
