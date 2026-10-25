"""Render the film's score and the voice-plus-score mix.

Usage:
  uv run -q --no-project --with numpy python -I audio/score/build_score.py score   # cues.json -> film-score.wav
  uv run -q --no-project --with numpy python -I audio/score/build_score.py mix     # voice + score (+ sfx) -> film-mix.wav

score: places every cue in cues.json at its film time, trimmed and faded, on one 48 kHz stereo track
of exactly the film's length.
mix: sets the score to SCORE_LUFS, ducks it under the narration with a sidechain compressor, rides it
down under any caption where it comes within MARGIN dB of the voice, adds audio/sfx/film-sfx.wav when
it exists, and masters the sum to -14 LUFS (two-pass loudnorm).
"""
import json
import pathlib
import re
import subprocess
import sys

import numpy as np

HERE = pathlib.Path(__file__).resolve().parent
AUDIO = HERE.parent
VOICE = AUDIO / "narration" / "v3" / "film-voice.wav"
SFX = AUDIO / "sfx" / "film-sfx.wav"
SCORE = HERE / "film-score.wav"
MIX = AUDIO / "film-mix.wav"
TIMELINE = AUDIO.parent / "src" / "timeline.js"
SR = 48000
SCORE_LUFS = -19.0   # the bed before ducking; the voice sits at -16
DUCK = "threshold=0.02:ratio=2:attack=120:release=900:knee=6"
MARGIN = 10.0        # the voice stays at least this many dB over the music on every caption
RAMP = 0.5           # seconds a ride takes to dip and to recover


def run(args):
    return subprocess.run(args, check=True, capture_output=True, text=True)


def build_score():
    spec = json.loads((HERE / "cues.json").read_text())
    dur = spec["duration"]
    args = ["ffmpeg", "-v", "error", "-y"]
    chains = []
    for i, c in enumerate(spec["cues"]):
        args += ["-i", str(HERE / "raw" / c["file"])]
        length = c["out"] - c["at"]
        f = [f"atrim=start={c['in']}:end={c['in'] + length}", "asetpts=PTS-STARTPTS",
             "aresample=48000", "aformat=channel_layouts=stereo"]
        if c["fade_in"] > 0:
            f.append(f"afade=t=in:st=0:d={c['fade_in']}")
        if c["fade_out"] > 0:
            f.append(f"afade=t=out:st={length - c['fade_out']}:d={c['fade_out']}")
        ms = round(c["at"] * 1000)
        f.append(f"adelay={ms}|{ms}")
        chains.append(f"[{i}:a]" + ",".join(f) + f"[c{i}]")
    n = len(spec["cues"])
    mix = "".join(f"[c{i}]" for i in range(n))
    chains.append(f"{mix}amix=inputs={n}:normalize=0:dropout_transition=0,apad,atrim=0:{dur}[out]")
    args += ["-filter_complex", ";".join(chains), "-map", "[out]", "-ar", "48000", "-c:a", "pcm_s16le", str(SCORE)]
    run(args)
    print(f"wrote {SCORE} ({dur} s, {n} cues)")


def read(path, ch):
    """Decode any audio file to float32 at SR with `ch` channels, shape (n, ch)."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", str(ch), "-ar", str(SR),
                          "-f", "f32le", "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, ch).copy()


def write(path, x):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", str(x.shape[1]),
                    "-i", "-", "-c:a", "pcm_f32le", str(path)], input=x.astype(np.float32).tobytes(), check=True)


def captions():
    js = ("global.FILM={};require(process.argv[1]);const seen=new Set(),out=[];"
          "for(const s of FILM.TIMELINE.shots)for(const c of s.captions){const k=c.t0+c.text;"
          "if(!seen.has(k)){seen.add(k);out.push([c.t0,c.t1,c.text])}}console.log(JSON.stringify(out))")
    return json.loads(run(["node", "-e", js, str(TIMELINE)]).stdout)


def db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)


def ride(voice, music):
    """Dip the music under any caption where it comes within MARGIN dB of the voice. Returns the rides."""
    n = len(music)
    env = np.zeros(n, dtype=np.float32)   # dB, <= 0
    rides = []
    for t0, t1, text in captions():
        a, b = int(t0 * SR), min(int(t1 * SR), n)
        v = voice[a:b, 0]
        live = np.abs(v) > 0.01
        if not live.any():
            continue
        margin = db(v[live]) - db(music[a:b])
        if margin >= MARGIN:
            continue
        dip = margin - MARGIN
        rides.append((round(t0, 2), round(dip, 1), text))
        r = int(RAMP * SR)
        lo, hi = max(0, a - r), min(n, b + r)
        shape = np.zeros(hi - lo, dtype=np.float32)
        shape[a - lo:b - lo] = 1
        shape[:a - lo] = np.linspace(0, 1, a - lo)
        shape[b - lo:] = np.linspace(1, 0, hi - b)
        env[lo:hi] = np.minimum(env[lo:hi], dip * shape)
    return music * (10 ** (env / 20))[:, None], rides


def build_mix():
    g = SCORE_LUFS - loudness(SCORE)
    tmp = HERE / ".ducked.wav"
    # The bed at its level, ducked by the narration (the voice is the sidechain key).
    run(["ffmpeg", "-v", "error", "-y", "-i", str(SCORE), "-i", str(VOICE), "-filter_complex",
         f"[0:a]volume={g:.2f}dB[s];[1:a]aresample={SR},aformat=channel_layouts=stereo[key];"
         f"[s][key]sidechaincompress={DUCK}[out]", "-map", "[out]", "-ar", str(SR), "-c:a", "pcm_f32le", str(tmp)])
    voice = read(VOICE, 1)
    music = read(tmp, 2)
    tmp.unlink()
    n = min(len(voice), len(music))
    voice, music = voice[:n], music[:n]
    music, rides = ride(voice, music)
    total = np.repeat(voice, 2, axis=1) + music
    if SFX.exists():
        fx = read(SFX, 2)[:n]
        total[:len(fx)] += fx
    pre = HERE / ".premaster.wav"
    write(pre, total)
    m = json.loads(re.findall(r"\{[^{}]*\}", run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(pre), "-af",
                                                    "loudnorm=I=-14:TP=-1.5:LRA=14:print_format=json",
                                                    "-f", "null", "-"]).stderr)[-1])
    run(["ffmpeg", "-v", "error", "-y", "-i", str(pre), "-af",
         f"loudnorm=I=-14:TP=-1.5:LRA=14:measured_I={m['input_i']}:measured_TP={m['input_tp']}"
         f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
         "-ar", str(SR), "-c:a", "pcm_s16le", str(MIX)])
    pre.unlink()
    for t0, dip, text in rides:
        print(f"ride {t0:7.2f}  {dip:5.1f} dB  {text}")
    print(f"wrote {MIX} (score at {SCORE_LUFS} LUFS before ducking, {len(rides)} rides, sfx: {'yes' if SFX.exists() else 'no'})")
    print("final loudness:", loudness(MIX), "LUFS")


def loudness(path):
    res = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af",
                          "loudnorm=print_format=json", "-f", "null", "-"],
                         check=True, capture_output=True, text=True)
    return float(json.loads(re.findall(r"\{[^{}]*\}", res.stderr)[-1])["input_i"])


if __name__ == "__main__":
    {"score": build_score, "mix": build_mix}[sys.argv[1]]()
