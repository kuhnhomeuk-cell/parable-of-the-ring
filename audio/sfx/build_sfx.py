"""Render the film's sound-effects track from sfx-cues.json.

Usage: uv run -q --no-project --with numpy python -I audio/sfx/build_sfx.py
Writes audio/sfx/film-sfx.wav: 48 kHz stereo float, exactly the film's length.
Every source is normalised to -20 dBFS RMS over its active part before the cue's gain, so gains
compare across effects. A `peak_at` cue lands its loudest 50 ms on that film second; with `in` and
`dur` it plays only that slice of the source and lands the slice's loudest 50 ms.
"""
import json
import subprocess
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
SR = 48000
REF_DB = -20.0
XFADE = 0.5  # seconds of crossfade between loop repeats


def decode(path, lowpass=None):
    args = ["ffmpeg", "-v", "error", "-i", str(path)]
    if lowpass:
        args += ["-af", f"lowpass=f={lowpass},lowpass=f={lowpass}"]
    args += ["-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    raw = subprocess.run(args, check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def envelope(x, win=0.05):
    n = int(win * SR)
    m = x.mean(axis=1)
    k = len(m) // n
    return np.sqrt((m[:k * n].reshape(k, n) ** 2).mean(axis=1) + 1e-12), n


def norm_gain(x):
    env, _ = envelope(x)
    db = 20 * np.log10(env)
    live = env[db > db.max() - 30]
    rms = np.sqrt(np.mean(live ** 2))
    return 10 ** ((REF_DB - 20 * np.log10(rms + 1e-12)) / 20)


def tile(x, start, n):
    """n samples of x from `start`, repeating with crossfades when x runs out."""
    xf = int(XFADE * SR)
    out = np.zeros((n, 2), dtype=np.float32)
    pos, src = 0, start
    ramp_in = np.linspace(0, 1, xf, dtype=np.float32)[:, None]
    while pos < n:
        seg = x[src:]
        take = min(len(seg), n - pos)
        if pos == 0:
            out[:take] = seg[:take]
        else:
            k = min(xf, take, pos)
            out[pos - k:pos] = out[pos - k:pos] * (1 - ramp_in[:k]) + seg[:k] * ramp_in[:k]
            out[pos:pos + take - k] = seg[k:take]
            take -= k
        pos += take
        src = 0
        if take <= 0:
            break
    return out


def main():
    spec = json.loads((HERE / "sfx-cues.json").read_text())
    n_film = int(round(spec["duration"] * SR))
    bus = np.zeros((n_film, 2), dtype=np.float32)
    cache = {}
    for c in spec["cues"]:
        key = (c["sfx"], c.get("lowpass"))
        if key not in cache:
            x = decode(HERE / f"{c['sfx']}.mp3", c.get("lowpass"))
            cache[key] = x * norm_gain(decode(HERE / f"{c['sfx']}.mp3"))
        x = cache[key]
        start = int(c.get("in", 0) * SR)
        if "peak_at" in c:
            # the loudest 50 ms of the part that plays (from `in`, for `dur` seconds)
            stop = start + int(c["dur"] * SR) if "dur" in c else len(x)
            env, hop = envelope(x[start:stop])
            peak = int(np.argmax(env)) * hop + hop // 2
            at = c["peak_at"] - peak / SR
        else:
            at = c["at"]
        if "out" in c:
            length = c["out"] - at
        else:
            length = c.get("dur", (len(x) - start) / SR)
        n = int(round(length * SR))
        if c.get("loop"):
            seg = tile(x, start, n)
        else:
            seg = x[start:start + n].copy()
            n = len(seg)
        g = np.ones(n, dtype=np.float32)
        fi, fo = int(c.get("fade_in", 0.01) * SR), int(c.get("fade_out", 0.05) * SR)
        if fi > 0:
            g[:fi] *= np.linspace(0, 1, min(fi, n), dtype=np.float32)[:min(fi, n)]
        if fo > 0:
            k = min(fo, n)
            g[n - k:] *= np.linspace(1, 0, k, dtype=np.float32)
        seg *= (g * 10 ** (c["gain"] / 20))[:, None]
        a = int(round(at * SR))
        if a < 0:
            seg, a = seg[-a:], 0
        b = min(n_film, a + len(seg))
        bus[a:b] += seg[:b - a]
    peak = float(np.abs(bus).max())
    out = HERE / "film-sfx.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    "-c:a", "pcm_f32le", str(out)], input=bus.tobytes(), check=True)
    print(f"wrote {out} ({len(spec['cues'])} cues, peak {20 * np.log10(peak + 1e-12):.1f} dBFS)")


if __name__ == "__main__":
    main()
