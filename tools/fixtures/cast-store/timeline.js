// Store-cast fixture: the old salesman and Nell (src/cast/store.js) on a plain warm plate. Not the film.
// 1080 x 1080, 24 fps.
//   node tools/check.cjs --fixtures=tools/fixtures/cast-store
//   node tools/snap.cjs --fixtures=tools/fixtures/cast-store --shot <id> --samples 6 --sheet --out .frames/store
FILM.TIMELINE = {
  title: 'cast-store-fixture',
  width: 1080,
  height: 1080,
  fps: 24,
  bpm: 120,
  duration: 28,
  shots: [
    { id: 'salesman-poses-a', file: '01-salesman-poses-a.js', start: 0, end: 3, mode: 'illustrated', brief: 'Salesman at h 400: stand, leanGlare, holdUp, jerkAway (jerk driven 0 to 1 over the shot), armsFolded.' },
    { id: 'salesman-poses-b', file: '02-salesman-poses-b.js', start: 3, end: 6, mode: 'illustrated', brief: 'Salesman at h 400: headShake, barelyLook, polishOffer, handshake, apologise.' },
    { id: 'nell-poses-a', file: '03-nell-poses-a.js', start: 6, end: 9, mode: 'illustrated', brief: 'Nell at h 400: stand, greet, offerRing, worried.' },
    { id: 'nell-poses-b', file: '04-nell-poses-b.js', start: 9, end: 12, mode: 'illustrated', brief: 'Nell at h 400: wipeTear, clap, handshake, and greet facing left.' },
    { id: 'salesman-exprs', file: '05-salesman-exprs.js', start: 12, end: 14, mode: 'illustrated', brief: 'Salesman expressions at h 400, waist up behind a counter line.' },
    { id: 'nell-exprs', file: '06-nell-exprs.js', start: 14, end: 16, mode: 'illustrated', brief: 'Nell expressions at h 400, waist up behind a counter line.' },
    { id: 'counter', file: '07-counter.js', start: 16, end: 19, mode: 'illustrated', brief: 'Both behind the counter at the storyboard height (0.55 x teen Sam), teen Sam on the near side.' },
    { id: 'lineup', file: '08-lineup.js', start: 19, end: 21, mode: 'illustrated', brief: 'Standing beside teen Sam at h 330: salesman 1.25x, Nell 1.1x.' },
    { id: 'warmth', file: '09-warmth.js', start: 21, end: 23, mode: 'illustrated', brief: 'The salesman across the film: warmth 0, 0.5 and 1 with the matching pose and face.' },
    { id: 'blends', file: '10-blends.js', start: 23, end: 28, mode: 'illustrated', brief: 'Pose blends driven over time: stand to leanGlare, holdUp into jerkAway, Nell stand to offerRing, handshake to apologise.' },
  ],
  cues: [{ t: 0, kind: 'open' }],
};
