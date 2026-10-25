// Cast fixture: Ava on plain plates. Not the film. 1080 x 1080, 24 fps.
//   node tools/check.cjs --fixtures=tools/fixtures/cast-ava
//   node tools/snap.cjs --fixtures=tools/fixtures/cast-ava --shot <id> --samples 6 --sheet --out .frames/ava
FILM.TIMELINE = {
  title: 'cast-ava-fixture',
  width: 1080,
  height: 1080,
  fps: 24,
  bpm: 120,
  duration: 22,
  shots: [
    { id: 'ava-outfits', file: '01-outfits.js', start: 0, end: 2, mode: 'illustrated', brief: 'Vision, nurse, bride, beach sundress and swimsuit side by side at h = 300.' },
    { id: 'ava-poses-a', file: '02-poses-a.js', start: 2, end: 4, mode: 'illustrated', brief: 'Stand, walk, run, dance, float, leanOverBed, laughHand, walkAwayLaugh at h = 230.' },
    { id: 'ava-poses-b', file: '03-poses-b.js', start: 4, end: 6, mode: 'illustrated', brief: 'kneelHold, sit, hug, handsToFace, splash, showHand at h = 260.' },
    { id: 'ava-expr-330', file: '04-expr-330.js', start: 6, end: 8, mode: 'illustrated', brief: 'All eight expressions at h = 330.' },
    { id: 'ava-expr-800', file: '05-expr-800.js', start: 8, end: 10, mode: 'illustrated', brief: 'All eight expressions as h = 800 close-ups cropped at the chest.' },
    { id: 'ava-vision-dance', file: '06-vision-dance.js', start: 10, end: 14, mode: 'illustrated', brief: 'The S08 vision: the slow turning dance in the blue dress over 4 s, alpha 0.88, in fog.' },
    { id: 'ava-with-sam', file: '07-with-sam.js', start: 14, end: 16, mode: 'illustrated', brief: 'Ava beside adult Sam for scale and style.' },
    { id: 'ava-stride', file: '08-stride.js', start: 16, end: 20, mode: 'illustrated', brief: 'Walk and run across at the contract stride; planted soles sit on their marks.' },
    { id: 'ava-beach-beat', file: '09-beach-beat.js', start: 20, end: 22, mode: 'illustrated', brief: 'runAwayWave on the sand (sundress, swimsuit) beside walkAwayLaugh and splash, so the three read apart.' },
  ],
  cues: [{ t: 0, kind: 'open' }],
};
