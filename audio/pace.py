"""Re-times the pauses in a narration take so the rhythm reads as a person, not a model.

Eleven v4 spaces almost every pause at about half a second. A storyteller does not: he lets the
loss land, rushes a list, and waits before the turn. This lengthens chosen pauses by inserting
silence at the middle of each one, so no word is touched.

    uv run -q --no-project --with numpy python -I audio/pace.py in.wav out.wav 7.65=1.4 10.93=1.3 ...

Each TIME=SECONDS pair names a pause by any time inside it (or within 0.15 s of it) and sets its
new length, longer or shorter. --cap=SECONDS shortens every other pause longer than that to that
length (the take's leading and trailing silence excepted), for a brisker read. Pauses are found as
runs quieter than -42 dBFS lasting 0.2 s or more. Silence is added or taken out at the middle of
a pause, so no word is touched. Input is 16-bit PCM wav. --map=out.json also writes where the silence went
in, which audio/align.py uses to carry word times from the raw take to the final one.
"""

import json
import sys
import wave

import numpy as np


def pauses(x, sr, floor_db=-42.0, min_s=0.2, hop_s=0.01):
    hop = int(sr * hop_s)
    n = len(x) // hop
    rms = np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-12)
    quiet = 20 * np.log10(rms) < floor_db
    out, start = [], None
    for i, q in enumerate(np.append(quiet, False)):
        if q and start is None:
            start = i
        elif not q and start is not None:
            if (i - start) * hop_s >= min_s:
                out.append((start * hop_s, i * hop_s))
            start = None
    return out


def main():
    args = sys.argv[1:]
    map_path = next((a.split("=", 1)[1] for a in args if a.startswith("--map=")), None)
    cap = next((float(a.split("=", 1)[1]) for a in args if a.startswith("--cap=")), None)
    src, dst, *pairs = [a for a in args if not a.startswith("--")]
    with wave.open(src) as w:
        sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth()
        raw = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
    assert sw == 2, "16-bit PCM only"
    frames = raw.reshape(-1, ch)
    mono = frames.mean(axis=1) / 32768.0
    found = pauses(mono, sr)
    dur = len(frames) / sr
    edits, named = [], set()  # (source sample at the pause middle, samples added (+) or taken out (-))

    def edit(a, b, target):
        d = target - (b - a)
        if abs(d) * sr >= 1:
            edits.append((int((a + b) / 2 * sr), int(round(d * sr))))

    for p in pairs:
        t, target = (float(v) for v in p.split("="))
        hit = [g for g in found if g[0] - 0.15 <= t <= g[1] + 0.15]
        if not hit:
            sys.exit(f"no pause at {t:.2f} s; pauses found: " + ", ".join(f"{a:.2f}-{b:.2f}" for a, b in found))
        a, b = hit[0]
        named.add(hit[0])
        print(f"pause {a:6.2f}-{b:6.2f} ({b - a:.2f} s) -> {target:.2f} s")
        edit(a, b, target)
    if cap is not None:
        for a, b in found:
            if (a, b) not in named and a > 0.05 and b < dur - 0.05 and b - a > cap:
                edit(a, b, cap)
    pieces, last, XF = [], 0, int(0.005 * sr)
    for at, n in sorted(edits):
        if n > 0:
            pieces += [frames[last:at], np.zeros((n, ch), dtype=np.int16)]
            last = at
        else:
            cut0, cut1 = at + n // 2, at - n // 2 + (-n) % 2  # take -n samples centred on the middle
            k = min(XF, -n, len(frames) - cut1)  # the head runs k past cut0 so exactly -n samples go
            head, tail = frames[last:cut0 + k].astype(np.float32), frames[cut1:cut1 + k].astype(np.float32)
            if k:  # a 5 ms crossfade over the join so the noise floor never clicks
                r = np.linspace(0, 1, k)[:, None]
                head[-k:] = head[-k:] * (1 - r) + tail[:k] * r
            pieces.append(np.clip(head, -32768, 32767).astype(np.int16))
            last = cut1 + k
    pieces.append(frames[last:])
    out = np.concatenate(pieces)
    with wave.open(dst, "wb") as w:
        w.setnchannels(ch)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(out.tobytes())
    print(f"{dur:.2f} s -> {len(out) / sr:.2f} s ({sum(1 for _, n in edits if n < 0)} pauses shortened)")
    if map_path:
        # silence added (+) or taken out (-) at each pause middle, in source seconds, so later tools
        # can map source times to output times: out = t + sum(n for at, n in inserts if at < t)
        json.dump({"inserts": [[at / sr, n / sr] for at, n in sorted(edits)]}, open(map_path, "w"))

if __name__ == "__main__":
    main()
