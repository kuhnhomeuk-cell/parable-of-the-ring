// Fixture 10 'props-scale': every prop at the size its storyboard shot needs, next to a teen
// Sam at h = 330 (the medium-shot scale), so a scene builder can read off the numbers.
FILM.scene({
  id: 'props-scale',
  draw(ctx, tIn, info) {
    const L = info.lib;
    const t = L.clamp(tIn, 0, info.dur);
    ctx.fillStyle = '#EFE6D6';
    ctx.fillRect(0, 0, 1080, 1080);
    const GY = 520, GY2 = 940;
    ctx.fillStyle = '#DCCFB8';
    ctx.fillRect(0, GY, 1080, 26);
    ctx.fillRect(0, GY2, 1080, 140);
    const C = FILM.cast;
    const lab = (s, x, y) => L.text(ctx, s, x, y, { size: 15, align: 'center', color: '#6A5A48' });
    // row 1: medium-shot scale
    C.sam(ctx, { x: 110, y: GY, h: 330, t });
    C.crutches(ctx, { x: 250, y: GY, size: 250 });
    lab('crutches 250 (S26)', 250, GY + 50);
    C.rifle(ctx, { x: 360, y: GY, size: 190 });
    lab('rifle 190 (S19a)', 360, GY + 72);
    C.envelope(ctx, { x: 480, y: 330, size: 100, rot: -0.1, progress: 0.3, t });
    lab('envelope 100 (S16)', 480, 390);
    C.ringBox(ctx, { x: 600, y: 360, size: 44, open: 1, ring: true, t });
    lab('box 44 (S28)', 600, 412);
    C.diamondRing(ctx, { x: 690, y: 345, size: 16, rot: 0.6, t, shadow: 0, sparkle: 0.6 });
    lab('ring 16 (S33)', 690, 390);
    C.sponge(ctx, { x: 790, y: 345, size: 56, rot: -0.2, foam: 0.6 });
    lab('sponge 56 (S12b)', 790, 412);
    C.sock(ctx, { x: 900, y: 335, size: 56, rot: 0.6 + t * 1.5 });
    lab('sock 56 (S17)', 900, 390);
    C.balloons(ctx, { x: 1010, y: GY, size: 46, count: 4, t });
    lab('balloons 46', 1010, GY + 72);
    C.receiptStack(ctx, { x: 520, y: 490, size: 34, count: 4, t });
    lab('receipts 34 (S14c)', 520, GY + 50);
    C.wallet(ctx, { x: 680, y: 480, size: 90, open: 1 });
    lab('wallet 90', 680, GY + 72);
    C.ringBox(ctx, { x: 830, y: 500, size: 60, broken: true, t });
    lab('broken box 60 (S17)', 830, GY + 50);
    // row 2: insert and close-up sizes
    C.priceCard(ctx, { x: 140, y: 600, size: 200, pop: 1, t });
    lab('priceCard 200 (S11 insert)', 140, GY2 + 40);
    C.ductTape(ctx, { x: 360, y: 800, size: 130, pull: 0.6 });
    lab('ductTape 130 (S18 hands)', 400, GY2 + 40);
    C.cake(ctx, { x: 650, y: GY2, size: 230, t });
    lab('cake 230 (S15)', 650, GY2 + 40);
    C.ringBox(ctx, { x: 930, y: GY2, size: 150, open: 1, ring: true, t, yaw: -0.3 });
    lab('box 150 (S28 close)', 930, GY2 + 40);
    L.text(ctx, 'props at storyboard sizes · Sam h 330', 40, 50, { size: 24, color: '#5A4A3A' });
  },
});
