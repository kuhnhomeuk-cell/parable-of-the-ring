// Fixture 05 'facets': the S07 push into the diamond over 3 s. zoom eases 0 to 1; the last
// frame must be the flat white-blue light a dream scene fades from.
FILM.scene({
  id: 'facets',
  draw(ctx, tIn, info) {
    const L = info.lib;
    const t = L.clamp(tIn, 0, info.dur);
    const g = ctx.createRadialGradient(540, 500, 30, 540, 540, 800);
    g.addColorStop(0, '#5C4A3A');
    g.addColorStop(1, '#16110D');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1080);
    const last = (Math.round(info.dur * 24) - 1) / 24;
    const zoom = L.ease.inOutSine(t / last);
    FILM.cast.diamondFacets(ctx, { x: 540, y: 520, size: 620, t, zoom });
    L.text(ctx, 'diamondFacets · zoom ' + zoom.toFixed(2), 40, 60, { size: 24, color: zoom > 0.7 ? '#4A5A7A' : '#E8DCCB' });
  },
});
