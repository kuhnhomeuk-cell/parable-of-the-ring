// Cast fixture: the supporting people (src/cast/people.js) on a plain warm plate. Not the film.
//   node tools/check.cjs --fixtures=tools/fixtures/cast-people
//   node tools/snap.cjs --fixtures=tools/fixtures/cast-people --shot <id> --samples 6 --sheet --out .frames/people
FILM.TIMELINE = {
  title: 'cast-people-fixture',
  width: 1080,
  height: 1080,
  fps: 24,
  bpm: 120,
  duration: 22,
  shots: [
    { id: 'mother-poses', file: '01-mother.js', start: 0, end: 2, mode: 'illustrated', brief: 'Mother: stand, cry, clutch, hug, wave at h = 400.' },
    { id: 'father-poses', file: '02-father.js', start: 2, end: 4, mode: 'illustrated', brief: 'Father: stand, headBowed, holdOutEnvelope, armAround (with the mother), handOnShoulder at h = 400.' },
    { id: 'drill-poses', file: '03-drill.js', start: 4, end: 6, mode: 'illustrated', brief: 'Camp sergeant: stand, shout, fling (wind-up), sniff, point at h = 400.' },
    { id: 'sergeant-poses', file: '04-sergeant.js', start: 6, end: 8, mode: 'illustrated', brief: 'Front sergeant: crouch, waveDown, shout, pullIn at h = 400.' },
    { id: 'porch', file: '05-porch.js', start: 8, end: 10, mode: 'illustrated', brief: 'The parents on the porch step: father holds out the envelope, mother clutches his arm; adult Sam below for scale.' },
    { id: 'porch-2', file: '06-porch2.js', start: 10, end: 12, mode: 'illustrated', brief: 'The parents on the step: father, head bowed, arm round the mother who cries; Sam below.' },
    { id: 'fling', file: '07-fling.js', start: 12, end: 13.5, mode: 'illustrated', brief: 'The camp sergeant flings the locker contents over 1.5 s; the hand path is traced.' },
    { id: 'wave', file: '08-wave.js', start: 13.5, end: 15.5, mode: 'illustrated', brief: 'The Front sergeant waves frantically to get down; the hand path is traced.' },
    { id: 'lineup', file: '09-lineup.js', start: 15.5, end: 17.5, mode: 'illustrated', brief: 'Heights and widths: teen Sam, adult Sam, mother, father, camp sergeant, Front sergeant.' },
    { id: 'faces', file: '10-faces.js', start: 17.5, end: 22, mode: 'illustrated', brief: 'Close-ups of all four heads, cycling through the eight expressions.' },
  ],
  cues: [{ t: 0, kind: 'open' }],
};
