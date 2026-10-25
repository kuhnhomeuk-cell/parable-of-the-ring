// Fixture 'ava-poses-b': kneelHold, sit, hug, handsToFace, splash (waterline), showHand.
// Red dots mark the target each pose reaches for; gold dots mark the pose() ring point.
FILM.scene({
  id: 'ava-poses-b',
  draw(ctx, t, info) {
    const L = info.lib;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    const G1 = 470, G2 = 900;
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, G1, 1080, 26);
    ctx.fillRect(0, G2, 1080, 120);
    const M = FILM.cast.ava;
    const h = 260;
    const dot = (p, c) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
      ctx.fill();
    };
    const cells = [
      ['kneelHold', { outfit: 'nurse', expr: 'loving' }, { dx: 66, dy: -118 }],
      ['sit', { outfit: 'beach', expr: 'smileSoft', seatY: G1 - 64 }, null],
      ['hug', { outfit: 'bride', expr: 'smilePolite' }, { dx: 66, dy: -148 }],
      ['handsToFace', { outfit: 'nurse', expr: 'tearful' }, { dx: 84, dy: -196 }],
      ['splash', { outfit: 'beach', swim: true, expr: 'laugh', waterY: G2 - 120 }, null],
      ['showHand', { outfit: 'beach', expr: 'smileSoft' }, null],
    ];
    cells.forEach(([pose, extra, tg], i) => {
      const col = i % 3, rowI = Math.floor(i / 3);
      const x = 170 + col * 360, y = rowI ? G2 : G1;
      const o = Object.assign({ x, y, h, t: t + i * 0.41, pose }, extra);
      if (tg) o.target = { x: x + tg.dx, y: y + tg.dy };
      if (pose === 'sit') {
        ctx.fillStyle = '#B08E62';
        ctx.fillRect(x - 70, extra.seatY, 110, 12);
        ctx.fillRect(x - 64, extra.seatY + 12, 8, y - extra.seatY - 12);
        ctx.fillRect(x + 26, extra.seatY + 12, 8, y - extra.seatY - 12);
      }
      if (pose === 'splash') {
        ctx.fillStyle = '#7FC2C6';
        ctx.fillRect(x - 150, extra.waterY - 4, 300, y - extra.waterY + 4);
      }
      if (pose === 'handsToFace') {
        // a stand-in face behind her hands, its near cheek on the target
        ctx.fillStyle = 'rgba(246,205,166,0.9)';
        ctx.beginPath();
        ctx.arc(o.target.x + 34, o.target.y - 6, 40, 0, Math.PI * 2);
        ctx.fill();
      }
      M(ctx, o);
      if (pose === 'splash') {
        ctx.fillStyle = 'rgba(127,194,198,0.85)';
        ctx.fillRect(x - 150, extra.waterY, 300, y - extra.waterY);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(x - 150, extra.waterY - 2, 300, 4);
      }
      if (o.target) dot([o.target.x, o.target.y], 'rgba(200,40,40,0.75)');
      dot(M.pose(o).rings[0], 'rgba(242,193,78,0.95)');
      L.text(ctx, pose, x, y + 50, { size: 24, align: 'center', color: L.pal.inkSoft });
    });
    L.text(ctx, 'ava · poses b · h 260', 60, 80, { size: 32, color: L.pal.ink });
  },
});
