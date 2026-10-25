"""Print a loudness envelope for each score cue, so cue offsets can be matched to shot beats.

Usage: uv run -q --no-project --with numpy python -I audio/score/envelope.py [--step=2] cue.wav ...
Each row is one step: start second, RMS in dBFS, and a bar. Peaks and quiet valleys show
where a cue swells, drops out or ends, which is what the mix lines up with the picture.
"""
import subprocess
import sys

import numpy as np


def load(path, sr=22050):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0, sr


def main():
    step = 2.0
    paths = []
    for a in sys.argv[1:]:
        if a.startswith("--step="):
            step = float(a.split("=", 1)[1])
        else:
            paths.append(a)
    for path in paths:
        x, sr = load(path)
        n = int(step * sr)
        print(f"## {path}  ({len(x) / sr:.1f} s)")
        for i in range(0, len(x), n):
            seg = x[i:i + n]
            db = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9)
            bar = "#" * max(0, int((db + 50) / 1.5))
            print(f"{i / sr:6.1f}  {db:6.1f}  {bar}")


if __name__ == "__main__":
    main()
