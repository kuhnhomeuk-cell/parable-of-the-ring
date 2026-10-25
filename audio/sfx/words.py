"""Print the film time of named words, so spot effects can land on them.

Usage: uv run -q --no-project --with numpy python -I audio/sfx/words.py 1:1:tokaa 3:23:tokab ...
Each argument is act:caption:word (caption numbers count from 1 within the act, as in
docs/captions-v3.txt). Uses the same word timing as audio/timeline.py.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import timeline as tl  # noqa: E402


def main():
    spec = json.load(open(tl.SPEC))
    caps = tl.load_captions()
    acts, t = {}, spec["preroll"]
    for k in range(1, 6):
        acts[k] = tl.Act(k, caps[k], spec["tempo"], t)
        t += acts[k].duration + (spec["gaps"][k - 1] if k < 5 else 0)
    for arg in sys.argv[1:]:
        k, n, w = arg.split(":")
        a = acts[int(k)]
        ws, _ = a.word_start(int(n), w)
        print(f"{arg:28s} {a.g(ws):8.2f}")


if __name__ == "__main__":
    main()
