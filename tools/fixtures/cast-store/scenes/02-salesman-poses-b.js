// Fixture 'salesman-poses-b': five more salesman poses at h = 400. headShake is driven by t.
FILM.scene({
  id: 'salesman-poses-b',
  draw(ctx, t, info) {
    const L = info.lib;
    const GY = 900;
    ctx.fillStyle = L.pal.paper;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = L.pal.paperShade;
    ctx.fillRect(0, GY, 1080, 1080 - GY);
    const S = FILM.cast.salesman;
    const row = [
      ['headShake', { pose: { armsFolded: 1, headShake: 1 } }],
      ['barelyLook', { pose: 'barelyLook' }],
      ['polishOffer', { pose: 'polishOffer', warmth: 0.6 }],
      ['handshake', { pose: 'handshake', warmth: 0.9 }],
      ['apologise', { pose: 'apologise', warmth: 1 }],
    ];
    row.forEach(([label, o], i) => {
      const x = 95 + i * 210;
      S(ctx, Object.assign({ x, y: GY, h: 400, t: t + i * 0.7 }, o));
      L.text(ctx, label, x + 10, GY + 50, { size: 24, align: 'center', color: L.pal.inkSoft });
    });
    L.text(ctx, 'salesman poses b · h 400', 60, 90, { size: 32, color: L.pal.ink });
  },
});
