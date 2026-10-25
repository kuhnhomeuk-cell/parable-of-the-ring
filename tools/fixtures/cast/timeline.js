// Cast fixture: Sam on a plain warm plate. Not the film. 1080 x 1080, 24 fps.
//   node tools/check.cjs --fixtures=tools/fixtures/cast
//   node tools/snap.cjs --fixtures=tools/fixtures/cast --shot <id> --samples 6 --sheet
FILM.TIMELINE = {
  title: 'cast-fixture',
  width: 1080,
  height: 1080,
  fps: 24,
  bpm: 120,
  duration: 38,
  shots: [
    { id: 'walk-strip', file: '01-walk-strip.js', start: 0, end: 2, mode: 'illustrated', brief: 'Eight walk phases side by side, frozen, at h = 230.' },
    { id: 'stride-check', file: '02-stride-check.js', start: 2, end: 5, mode: 'illustrated', brief: 'He walks across at exactly 0.38 h per step; planted soles must sit on their ground marks.' },
    { id: 'poses', file: '03-poses.js', start: 5, end: 7, mode: 'illustrated', brief: 'Stand, shield, squint at h = 330.' },
    { id: 'shield-ramp', file: '04-shield-ramp.js', start: 7, end: 10, mode: 'illustrated', brief: 'The shield move driven 0 to 1: anticipation, rise, overshoot, settle.' },
    { id: 'sizes', file: '05-sizes.js', start: 10, end: 14, mode: 'illustrated', brief: 'Walking in place at h = 330 and h = 160, standing at h = 160.' },
    { id: 'ages', file: '06-ages.js', start: 14, end: 16, mode: 'illustrated', brief: 'Sam at 10, 14, 16, 17, 18 and 21, same h input, school clothes and story clothes.' },
    { id: 'outfits', file: '07-outfits.js', start: 16, end: 18, mode: 'illustrated', brief: 'All eight outfits at age 18.' },
    { id: 'pose-sheet', file: '08-poses.js', start: 18, end: 22, mode: 'illustrated', brief: 'Every named pose, animated where it moves.' },
    { id: 'expressions', file: '09-expressions.js', start: 22, end: 24, mode: 'illustrated', brief: 'Every expression as a head close-up.' },
    { id: 'soldiers', file: '10-soldiers.js', start: 24, end: 26, mode: 'illustrated', brief: 'Six soldier variants standing, then a running row.' },
    { id: 'helmet', file: '11-helmet.js', start: 26, end: 30, mode: 'illustrated', brief: 'The helmet on his head and as a prop: upright, turning over, inside with the liner lifting.' },
    { id: 'run-strip', file: '12-run-strip.js', start: 30, end: 32, mode: 'illustrated', brief: 'Run and sprintCrouch, 8 phases each, plus the run stride check.' },
    { id: 'ages-ladder', file: '13-ages-ladder.js', start: 32, end: 34, mode: 'illustrated', brief: 'Boy to man: 14, 15, 16, 17, 18, 19 and 21 at one h, casual row and story-outfit row.' },
    { id: 'couple', file: '14-couple.js', start: 34, end: 36, mode: 'illustrated', brief: 'Sam at 21 beside Ava (adult Sam height minus 5%): wedding, beach, and 18 for scale.' },
    { id: 'script-beats', file: '15-script-beats.js', start: 36, end: 38, mode: 'illustrated', brief: 'Reserves dress uniform at 18, lieStare, touchHead, callOut and liftLiner with the helmet prop.' },
  ],
  cues: [{ t: 0, kind: 'open' }],
};
