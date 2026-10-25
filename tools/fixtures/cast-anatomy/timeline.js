// Cast fixture: limb anatomy. Every pose of every cast figure, facing right (top row) and left
// (bottom row), each figure about 430 px tall standing, labelled with figure and pose. Not the film.
//   node tools/check.cjs --fixtures=tools/fixtures/cast-anatomy
//   node tools/snap.cjs --fixtures=tools/fixtures/cast-anatomy --out .frames/anatomy        middle frame of every shot
//   node tools/snap.cjs --fixtures=tools/fixtures/cast-anatomy --shot <id> --out .frames/anatomy
//
// Sam-rig shots ('rig-<pose>') hold eight columns: Sam 14 school, 14 casual, 19 fatigues-desert
// with the helmet, 19 gown, 21 tux, 21 swim (docs/BUILD-SCENES.md section 4), then soldier variants 2
// and 4. Wide poses (lying, diving, falling) split the eight over two shots ('-a', '-b').
// The other figures ('<figure>-<n>') hold up to eight of their poses per shot.
(function () {
  const RIG = [
    ['stand'], ['walk'], ['run'], ['sprintCrouch'], ['sit'], ['sitDesk'], ['sitGrip'], ['standGrip'], ['pray'],
    ['kneelOffer', 1], ['lie', 1], ['sitUp', 1], ['diveReach', 1], ['fallMid', 1], ['fall', 1], ['weepSit', 1],
    ['handshake'], ['hug'], ['laugh'], ['chinUp'], ['lieStare', 1], ['touchHead'], ['callOut'], ['liftLiner'], ['liftLinerBed', 1],
  ];
  const OTHERS = [
    ['ava', ['stand', 'walk', 'run', 'dance', 'float', 'leanOverBed', 'handsToFace', 'laughHand']],
    ['ava', ['walkAwayLaugh', 'runAwayWave', 'kneelHold', 'sit', 'hug', 'splash', 'showHand']],
    ['salesman', ['stand', 'leanGlare', 'holdUp', 'jerkAway0', 'jerkAway', 'armsFolded']],
    ['salesman', ['headShake', 'barelyLook', 'polishOffer', 'handshake', 'apologise']],
    ['nell', ['stand', 'greet', 'offerRing', 'worried', 'wipeTear', 'clap', 'handshake']],
    ['mother', ['stand', 'cry', 'clutch', 'hug', 'wave']],
    ['father', ['stand', 'headBowed', 'holdOutEnvelope', 'armAround', 'handOnShoulder']],
    ['drillSergeant', ['stand', 'shout', 'fling', 'sniff', 'point']],
    ['sergeant', ['stand', 'crouch', 'waveDown', 'shout', 'pullIn']],
  ];
  const shots = [];
  let t = 0;
  const add = (s) => {
    shots.push(Object.assign({ file: '01-anatomy.js', start: t, end: t + 1, mode: 'illustrated' }, s));
    t += 1;
  };
  for (const [pose, wide] of RIG) {
    if (wide) {
      add({ id: `rig-${pose}-a`, rig: pose, cols: [0, 1, 2, 3], brief: `Sam 14 and 19: ${pose}, both facings.` });
      add({ id: `rig-${pose}-b`, rig: pose, cols: [4, 5, 6, 7], brief: `Sam 21 and two soldiers: ${pose}, both facings.` });
    } else add({ id: `rig-${pose}`, rig: pose, cols: [0, 1, 2, 3, 4, 5, 6, 7], brief: `Sam at 14, 19, 21 and two soldiers: ${pose}, both facings.` });
  }
  // extra review shots: every figure standing in 3/4, the drill fling through its throw, Ava
  // blending stand into laughHand, and Sam's grip option with and without a rifle
  add({ id: 'stand-all', special: 'standAll', brief: 'Every figure standing, 3/4 both facings.' });
  add({ id: 'fling-u', special: 'flingU', brief: 'drillSergeant fling at u 0.2 to 0.85.' });
  add({ id: 'ava-blend', special: 'avaBlend', brief: 'Ava stand -> laughHand at 0, 0.25, 0.5, 0.75, 1 and walkAwayLaugh.' });
  add({ id: 'grip-rifle', special: 'gripRifle', brief: 'Sam and soldiers seated and standing with grip on an upright rifle.' });
  const seen = {};
  for (const [fig, poses] of OTHERS) {
    seen[fig] = (seen[fig] || 0) + 1;
    add({ id: `${fig}-${seen[fig]}`, fig, poses, brief: `${fig}: ${poses.join(', ')}, both facings.` });
  }
  FILM.TIMELINE = {
    title: 'cast-anatomy-fixture',
    width: 2560,
    height: 1200,
    fps: 24,
    bpm: 120,
    duration: t,
    shots,
    cues: [{ t: 0, kind: 'open' }],
  };
})();
