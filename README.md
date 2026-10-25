# Parable of the Ring (procedural animation code)

A short square film (1080 x 1080, 24 fps, about 5:40) drawn entirely in code on an HTML canvas.
There are no image or video assets: every frame is painted by JavaScript at render time.

This repository is the code only. All caption, beat and brief text in `src/timeline.js` is a
neutral placeholder (for example "Scene 12 caption 1 placeholder"), and the narration audio,
score audio and sound effects are not included.

## What is here

- `src/scenes/`: 53 procedural scenes, one file per shot (`01-scene-01.js` to `53-scene-53.js`).
  Each one registers with `FILM.scene({ id, draw })`.
- `src/timeline.js`: the film timeline (`FILM.TIMELINE`): shot ids, files, start and end frames,
  transitions, and per-shot beats and captions with word times that the scenes key their action to.
- `src/cast.js`, `src/cast/`: the cast (character and prop builders, `FILM.cast`) and the caption renderer.
- `src/sets/`: shared sets (backgrounds, props and light).
- `src/core.js`, `src/lib.js`, `src/look.js`, `src/props.js`: the engine, drawing helpers and the shared painterly look.
- `src/music.js`, `src/player.js`: the synthesised soundtrack and the browser player.
- `tools/`: Node tools for checking, previewing, building and rendering (headless Chromium via Playwright).
- `tools/fixtures/`: small test films (cast sheets, lib showcase) that exercise the tools.
- `audio/`: optional build-time audio tools (Python and shell). They need your own narration,
  score and effect audio, which is not part of this repository.

## Requirements

- Node.js 20 or newer
- ffmpeg on your PATH (only for `render.cjs`)
- Playwright and its headless Chromium, installed into `tools/`:

```
cd tools
npm ci
npx playwright install chromium
cd ..
```

Run every command below from the repository root.

## Check

```
node tools/smoke.cjs
node tools/check.cjs
node tools/check.cjs --scale 0.25 --sweep 48
node tools/check.cjs --fixtures
```

`smoke.cjs` is a quick Playwright sanity check (prints `ok [ true, 44100 ]`). `check.cjs` runs the
media, determinism, sources, timeline, draw and cost checks and exits non-zero on any failure.
The faster second form renders at quarter scale and sweeps every 48th frame.

## Preview stills

```
node tools/snap.cjs
node tools/snap.cjs --times 16 --scale 0.5 --out .frames/one.png
node tools/snap.cjs --shot scene-12 --samples 6 --sheet --out .frames/scene-12
```

The first form writes the middle frame of every shot plus a contact sheet to `.frames/`.

## Build a self-contained page

```
node tools/build.cjs
```

Writes `dist/<folder name>.html`. Open it in a browser: click or press space to play,
arrow keys to step, `?t=12` for a still at 12 s, `?shot=scene-12` to loop one shot.

## Render to MP4

```
node tools/render.cjs --from 14 --to 17 --scale 0.25 --out exports/test.mp4
node tools/render.cjs
node tools/render.cjs --workers 4
```

The first is a quick three-second test. The second renders the whole film to
`exports/<folder name>.mp4` with the synthesised soundtrack from `src/music.js`.
Add `--silent` for a silent track. Output folders (`dist/`, `exports/`, `.frames/`, `.tmp/`) are git-ignored.

## Audio tools (optional)

The scripts in `audio/` rebuild the timeline from a recorded narration and mix a score and sound
effects. They expect inputs that are not in this repository (`docs/shots-v3.json`,
`docs/captions-v3.txt`, `audio/narration/v3/`, `audio/score/raw/`, effect files in `audio/sfx/`).
`audio/sfx.sh` generates sound effects with ElevenLabs and reads your key from the
`ELEVENLABS_API_KEY` environment variable (or `ELEVENLABS_API_KEY_2` for a second account).
No keys are stored in this repository.

## Credits

Visual style inspired by the work of [@kevin_t_ngo](https://x.com/kevin_t_ngo).

## License

MIT. See `LICENSE`.
