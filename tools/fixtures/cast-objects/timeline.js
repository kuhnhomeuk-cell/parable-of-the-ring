// Cast-objects fixture: the props of src/cast/objects.js on plain plates. Not the film. 1080 x 1080, 24 fps.
//   node tools/check.cjs --fixtures=tools/fixtures/cast-objects
//   node tools/snap.cjs --fixtures=tools/fixtures/cast-objects --shot <id> --samples 6 --sheet --out .frames/objects
FILM.TIMELINE = {
  title: 'cast-objects-fixture',
  width: 1080,
  height: 1080,
  fps: 24,
  bpm: 120,
  duration: 34,
  shots: [
    { id: 'ring-ecu', file: '01-ring-ecu.js', start: 0, end: 4, mode: 'illustrated', brief: 'The diamond ring at 700 px on dark velvet: slow turn, a band of light sweeping, one sparkle.' },
    { id: 'ring-sizes', file: '02-ring-sizes.js', start: 4, end: 8, mode: 'illustrated', brief: 'The ring at 300, 100 and 20 px with a slow turn and a sparkle; a 20 px ring on a finger-size plate.' },
    { id: 'ring-light', file: '03-ring-light.js', start: 8, end: 10, mode: 'illustrated', brief: 'A grid of light angles and turns at 220 px: the brightest facets follow the light.' },
    { id: 'ring-head', file: '04-ring-head.js', start: 10, end: 12, mode: 'illustrated', brief: 'S07 framing: the head at size 1500 so the stone fills the frame, light turning.' },
    { id: 'facets', file: '05-facets.js', start: 12, end: 15, mode: 'illustrated', brief: 'S07 push-in: zoom 0 to 1 over 3 s, ending in white-blue light.' },
    { id: 'ring-box', file: '06-ring-box.js', start: 15, end: 19, mode: 'illustrated', brief: 'The velvet box closed, opening live, open with the ring, and broken.' },
    { id: 'props-paper', file: '07-props-paper.js', start: 19, end: 23, mode: 'illustrated', brief: 'Envelope with the letter sliding out, the price card popping in, the empty wallet, receipts stacking.' },
    { id: 'props-party', file: '08-props-party.js', start: 23, end: 26, mode: 'illustrated', brief: 'Balloons, the banner and the cake.' },
    { id: 'props-work', file: '09-props-work.js', start: 26, end: 30, mode: 'illustrated', brief: 'Sponge and bubbles, sock, duct tape pulled, crutches, rifle upright.' },
    { id: 'props-scale', file: '10-props-scale.js', start: 30, end: 34, mode: 'illustrated', brief: 'Every prop at its storyboard size next to a teen Sam at h = 330.' },
  ],
  cues: [{ t: 0, kind: 'open' }],
};
