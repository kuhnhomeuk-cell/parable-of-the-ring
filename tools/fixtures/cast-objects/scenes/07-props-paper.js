// Fixture 07 'props-paper': the Army envelope with the letter sliding out (progress 0 to 1
// over 2.5 s), the price card popping in at 0.5 s with an overshoot, the empty wallet opening,
// and $50 receipts stacking one per 0.6 s with a bounce.
FILM.scene({
  id: 'props-paper',
  draw(ctx, tIn, info) {
    const L = info.lib;
    const t = L.clamp(tIn, 0, info.dur);
    ctx.fillStyle = '#EADFC9';
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = '#D9C9AC';
    ctx.fillRect(0, 560, 1080, 520);
    const C = FILM.cast;
    const prog = L.ease.inOutSine(L.clamp(t / 2.5));
    C.envelope(ctx, { x: 290, y: 330, size: 420, rot: -0.04, progress: prog, t });
    C.envelope(ctx, { x: 860, y: 140, size: 180, rot: 0.1, progress: 0.6, t });
    const pop = L.clamp((t - 0.5) / 0.35);
    C.priceCard(ctx, { x: 820, y: 250, size: 210, pop, t });
    const open = L.ease.inOutSine(L.clamp((t - 0.3) / 1.2));
    C.wallet(ctx, { x: 300, y: 780, size: 380, open, rot: 0.03 });
    C.receiptStack(ctx, { x: 820, y: 860, size: 110, count: L.clamp(t / 0.6, 0, 6), t });
    L.text(ctx, 'envelope · progress ' + prog.toFixed(2), 60, 610, { size: 22, color: '#5A4A3A' });
    L.text(ctx, 'priceCard · pop ' + pop.toFixed(2), 740, 520, { size: 22, color: '#5A4A3A' });
    L.text(ctx, 'wallet · open ' + open.toFixed(2), 160, 960, { size: 22, color: '#5A4A3A' });
    L.text(ctx, 'receiptStack · count ' + L.clamp(t / 0.6, 0, 6).toFixed(2), 700, 960, { size: 22, color: '#5A4A3A' });
  },
});
