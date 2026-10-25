"""Gives every sentence of a narration act its exact start and end time in the final audio.

Word times come from whisper.cpp run on the RAW take, where they are reliable. Each sentence is
snapped to the pauses measured in that raw audio (a sentence starts where the pause before it
ends, and stops where the pause after it begins). The times are then carried to the final file
through the silences audio/pace.py inserted (its --map file) and the voice chain's tempo change.

    uv run -q --no-project --with numpy python -I audio/align.py raw16k.wav raw.words.json pace.map.json tempo out.json [offset]

offset (seconds) is added to every time, to place the act on the film's timeline. Prints one line
per sentence. A sentence ends on . ? or ! (a closing quote mark may follow).
"""

import json
import re
import sys
import wave

import numpy as np


def pauses(path, floor_db=-42.0, min_s=0.2, hop_s=0.01):
    with wave.open(path) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
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
    return out, len(x) / sr


def main():
    wav, words_path, map_path, tempo, out_path, *rest = sys.argv[1:]
    tempo = float(tempo)
    offset = float(rest[0]) if rest else 0.0
    gaps, dur = pauses(wav)
    inserts = json.load(open(map_path))["inserts"]
    toks = json.load(open(words_path))["transcription"]
    words = [(t["offsets"]["from"] / 1000, t["offsets"]["to"] / 1000, t["text"]) for t in toks if t["text"].strip()]

    sents, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r"[.?!][\"'”]?\s*$", w[2].strip()):
            sents.append(cur)
            cur = []
    if cur:
        sents.append(cur)

    def snap_start(ws):
        hit = [b for a, b in gaps if a - 0.1 <= ws <= b + 0.35]
        return hit[-1] if hit else ws

    def snap_end(we):
        hit = [a for a, b in gaps if a - 0.1 <= we <= b + 0.35]
        return hit[0] if hit else we

    def final(t):
        return (t + sum(n for at, n in inserts if at < t)) / tempo + offset

    out, prev_end = [], 0.0
    for s in sents:
        text = "".join(w[2] for w in s).strip()
        t0 = max(prev_end, snap_start(s[0][0]))
        t1 = max(t0 + 0.2, snap_end(s[-1][1]))
        prev_end = t1
        out.append({"t0": round(final(t0), 2), "t1": round(final(t1), 2), "text": text})
    json.dump({"duration": round(final(dur) - offset, 3), "offset": offset, "sentences": out}, open(out_path, "w"), indent=1)
    for s in out:
        print(f"{s['t0']:7.2f} {s['t1']:7.2f}  {s['text']}")


if __name__ == "__main__":
    main()
