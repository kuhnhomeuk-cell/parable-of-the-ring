"""Times the whole film to the recorded narration and writes src/timeline.js.

Reads docs/shots-v3.json (the shot list and its anchors) and docs/captions-v3.txt (the burned-in
captions, exact spoken words). For each act it takes whisper.cpp word times from the RAW take,
snaps them to the pauses measured in that raw audio, and carries them to the final file through
the silence audio/pace.py inserted (its --map file) and the voice chain's tempo. Acts are placed
on the film timeline with the spec's pre-roll and gaps.

    uv run -q --no-project --with numpy python -I audio/timeline.py [--write] [--stubs]

Without --write it prints the shot table and changes nothing.
--write   writes src/timeline.js, docs/timing-v3.md and audio/narration/v3/placement.json
          (where each act sits in the film, for the mix).
--stubs   also writes a placeholder scene for every shot whose file does not exist yet. It never
          touches an existing scene file.
"""

import difflib
import json
import re
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
NARR = ROOT / "audio" / "narration" / "v3"
SPEC = ROOT / "docs" / "shots-v3.json"
CAPS = ROOT / "docs" / "captions-v3.txt"
FPS = 24

NUMS = {"14": ["fourteen"]}  # numerals in the captions mapped to the words whisper hears; extend for your script


def pauses(path, floor_db=-42.0, min_s=0.2, hop_s=0.01):
    with wave.open(str(path)) as w:
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
    return out


def wav_seconds(path):
    with wave.open(str(path)) as w:
        return w.getnframes() / w.getframerate()


def norm(word):
    return re.sub(r"[^a-z0-9']", "", word.lower().replace("’", "'"))


def whisper_words(path):
    """Joins whisper's -ml 1 tokens into words: a token that starts with a space starts a word."""
    toks = json.load(open(path))["transcription"]
    words = []
    for t in toks:
        txt = t["text"]
        if not txt.strip():
            continue
        a, b = t["offsets"]["from"] / 1000, t["offsets"]["to"] / 1000
        if txt.startswith(" ") or not words:
            words.append([a, b, txt.strip()])
        else:
            words[-1][1] = b
            words[-1][2] += txt.strip()
    out = []
    for a, b, w in words:
        key = w.strip("\"'.,?!:;")
        if key in NUMS:
            parts = NUMS[key]
            step = (b - a) / len(parts)
            out += [(a + i * step, a + (i + 1) * step, p) for i, p in enumerate(parts)]
        elif norm(w):
            out.append((a, b, norm(w)))
    return out


def load_captions():
    acts, cur = {}, None
    for line in CAPS.read_text().splitlines():
        if line.startswith("## act"):
            cur = int(line.split()[-1])
            acts[cur] = []
        elif line.strip() and not line.startswith("#") and cur:
            acts[cur].append(line.strip())
    return acts


class Act:
    def __init__(self, k, captions, tempo, offset, fixes=()):
        self.k, self.tempo, self.offset = k, tempo, offset
        self.gaps = pauses(NARR / f"act{k}.raw16k.wav")
        self.raw_len = wav_seconds(NARR / f"act{k}.raw16k.wav")
        self.inserts = json.load(open(NARR / f"act{k}.map.json"))["inserts"]
        self.duration = wav_seconds(NARR / f"act{k}.wav")
        ww = whisper_words(NARR / f"act{k}.rawwords.json")
        script = []  # (caption index, word)
        for ci, cap in enumerate(captions):
            script += [(ci, norm(w)) for w in cap.split() if norm(w)]
        sm = difflib.SequenceMatcher(None, [w for _, w in script], [w[2] for w in ww], autojunk=False)
        times = [None] * len(script)
        for blk in sm.get_matching_blocks():
            for j in range(blk.size):
                times[blk.a + j] = (ww[blk.b + j][0], ww[blk.b + j][1])
        self.matched = sum(t is not None for t in times) / max(1, len(times))
        # unmatched words take their neighbours' edges
        for i, t in enumerate(times):
            if t is None:
                prev = next((times[j][1] for j in range(i - 1, -1, -1) if times[j]), 0.0)
                nxt = next((times[j][0] for j in range(i + 1, len(times)) if times[j]), prev)
                times[i] = (prev, max(prev, nxt))
        self.script, self.times = script, times
        idxs = [[i for i, (c, _) in enumerate(script) if c == ci] for ci in range(len(captions))]
        # Every boundary between two captions should sit in a measured pause. whisper's word times
        # drift by up to 1.5 s, so the boundaries are matched to the pauses in order, each to the
        # pause nearest its whisper estimate. A boundary with no pause near it (a clause run on
        # without a breath) keeps the estimate, at a cost, so the match never skips a real pause
        # for a far one.
        est = [(times[idxs[n - 1][-1]][1] + times[idxs[n][0]][0]) / 2 for n in range(1, len(captions))]
        inner = [g for g in self.gaps if g[0] > 0.05 and g[1] < self.raw_len - 0.05]
        cuts = self.match(est, inner)
        # Where whisper's drift put a boundary in the wrong pause (checked by transcribing the
        # burst on its own), the spec's cap_fixes names the film second of the right pause.
        # A fix keyed by "raw" (act raw seconds) survives a re-pace; "film" is the older form.
        for f in fixes:
            if f["act"] == k:
                if "raw" in f:
                    cuts[f["cap"] - 2] = min(inner, key=lambda g: abs((g[0] + g[1]) / 2 - f["raw"]))
                else:
                    cuts[f["cap"] - 2] = min(inner, key=lambda g: abs(self.g((g[0] + g[1]) / 2) - f["film"]))
        lead = next((b for a, b in self.gaps if a <= 0.05), times[idxs[0][0]][0])
        tail = next((a for a, b in self.gaps if b >= self.raw_len - 0.05), self.raw_len)
        bounds = [(None, lead)] + cuts + [(tail, None)]
        self.caps = []
        for ci, cap in enumerate(captions):
            t0, t1 = bounds[ci][1], bounds[ci + 1][0]
            self.caps.append({"text": cap, "s0": self.g(t0), "s1": self.g(t1), "idx": idxs[ci],
                              "words": self.word_times(cap, idxs[ci], t0, t1)})

    def word_times(self, cap, idx, t0, t1):
        """[film second, token] for every token of a caption, for word-by-word captions.

        whisper's word times carry an offset drift, so they are rescaled into the caption's own
        measured span [t0, t1]; when they are too far off to trust, the span is shared out by
        character count instead. A token with no letters rides with the word before it.
        """
        toks = cap.split()
        spoken = [i for i, w in enumerate(toks) if norm(w)]
        ws = [self.times[j][0] for j in idx]
        ok = len(ws) == len(spoken) and ws and abs(ws[0] - t0) < 0.6 and ws[-1] < t1 + 0.6 and ws[-1] > ws[0]
        if ok:
            lo, hi = ws[0], max(ws[-1], ws[0] + 1e-3)
            last = t0 + (t1 - t0) * 0.92  # the last word starts before the span ends
            st = [t0 + (w - lo) / (hi - lo) * (last - t0) for w in ws]
        else:
            n = [len(norm(toks[i])) + 1 for i in spoken]
            tot, acc, st = sum(n), 0, []
            for c in n:
                st.append(t0 + (t1 - t0) * acc / tot)
                acc += c
        out, si = [], 0
        for i, w in enumerate(toks):
            if norm(w):
                out.append([round(self.g(st[si]), 3), w])
                si += 1
            elif out:
                out[-1][1] += " " + w
            else:
                out.append([round(self.g(t0), 3), w])
        return out

    def match(self, est, gaps, miss=0.6):
        """Ordered match of boundary estimates to pauses. Returns (speech end, next speech start) per boundary."""
        B, J = len(est), len(gaps)
        INF = float("inf")
        # cost[i][j]: best cost for boundaries 0..i-1 using pauses 0..j-1
        cost = [[INF] * (J + 1) for _ in range(B + 1)]
        back = [[None] * (J + 1) for _ in range(B + 1)]
        for j in range(J + 1):
            cost[0][j] = 0.0
        for i in range(1, B + 1):
            for j in range(J + 1):
                # boundary i-1 has no pause
                c = cost[i - 1][j] + miss
                if c < cost[i][j]:
                    cost[i][j], back[i][j] = c, ("miss", j)
                # boundary i-1 takes pause j-1
                if j >= 1:
                    a, b = gaps[j - 1]
                    d = abs((a + b) / 2 - est[i - 1])
                    best_prev = min(range(j), key=lambda k: cost[i - 1][k])
                    c = cost[i - 1][best_prev] + d
                    if c < cost[i][j]:
                        cost[i][j], back[i][j] = c, ("take", best_prev)
                # or pause j-1 is an inner pause of a caption
                if j >= 1 and cost[i][j - 1] < cost[i][j]:
                    cost[i][j], back[i][j] = cost[i][j - 1], ("skip", j - 1)
        out, i, j = [None] * B, B, min(range(J + 1), key=lambda k: cost[B][k])
        while i > 0:
            kind, k = back[i][j]
            if kind == "skip":
                j = k
                continue
            if kind == "take":
                a, b = gaps[j - 1]
                out[i - 1] = (a, b)
            else:
                out[i - 1] = (est[i - 1], est[i - 1])
            i, j = i - 1, k
        return out

    def snap_start(self, ws):
        hit = [b for a, b in self.gaps if a - 0.1 <= ws <= b + 0.35]
        return hit[-1] if hit else ws

    def snap_end(self, we):
        hit = [a for a, b in self.gaps if a - 0.1 <= we <= b + 0.35]
        return hit[0] if hit else we

    def g(self, t):
        """raw act seconds to global film seconds"""
        return (t + sum(n for at, n in self.inserts if at < t)) / self.tempo + self.offset

    def word_start(self, n, w):
        cap = self.caps[n - 1]
        for i in cap["idx"]:
            if self.script[i][1] == norm(w):
                ws = self.times[i][0]
                hit = [(a, b) for a, b in self.gaps if ws - 0.35 <= b <= ws + 0.15]
                return ws, hit[-1] if hit else None
        sys.exit(f"act {self.k} caption {n} has no word '{w}': {cap['text']}")


def main():
    write, stubs = "--write" in sys.argv, "--stubs" in sys.argv
    spec = json.load(open(SPEC))
    caps = load_captions()
    acts, t = {}, spec["preroll"]
    for k in range(1, 6):
        acts[k] = Act(k, caps[k], spec["tempo"], t, spec.get("cap_fixes", ()))
        t += acts[k].duration + (spec["gaps"][k - 1] if k < 5 else 0)
    speech_end = acts[5].offset + acts[5].duration
    duration = round(np.ceil((speech_end + spec["tail"]) * FPS) / FPS, 4)

    def anchor(a):
        if "t" in a:
            return a["t"]
        if "cap" in a:
            k, n = a["cap"]
            c = acts[k].caps[n - 1]
            if n > 1:
                prev_end = acts[k].caps[n - 2]["s1"]
            else:
                prev_end = acts[k - 1].caps[-1]["s1"]
            return (prev_end + c["s0"]) / 2
        if "word" in a:
            k, n, w = a["word"]
            act = acts[k]
            ws, gap = act.word_start(n, w)
            if "minus" in a:
                onset = gap[1] if gap else ws
                return act.g(onset) - a["minus"]
            return act.g((gap[0] + gap[1]) / 2) if gap else act.g(ws) - a.get("lead", 0.15)
        if "after" in a:
            k, n, s = a["after"]
            return acts[k].caps[n - 1]["s1"] + s
        if "capstart" in a:
            k, n = a["capstart"]
            return acts[k].caps[n - 1]["s0"] - a["minus"]
        if "rawpause" in a:
            # the middle of the raw-take pause nearest act-raw second `near`, which survives a re-pace
            k, near = a["rawpause"]
            pa, pb = min(acts[k].gaps, key=lambda g: abs((g[0] + g[1]) / 2 - near))
            return acts[k].g((pa + pb) / 2)
        if "pause" in a:
            k, near = a["pause"]
            gaps = pauses(NARR / f"act{k}.16k.wav")
            pa, pb = min(gaps, key=lambda g: 0 if g[0] <= near <= g[1] else min(abs(g[0] - near), abs(g[1] - near)))
            return acts[k].offset + (pa + pb) / 2
        sys.exit(f"unknown anchor {a}")

    shots = spec["shots"]
    starts = [round(round(anchor(s["start"]) * FPS) / FPS, 4) for s in shots]
    for i in range(1, len(starts)):
        if starts[i] <= starts[i - 1]:
            sys.exit(f"shot {shots[i]['id']} starts at {starts[i]:.2f}, not after {shots[i - 1]['id']} at {starts[i - 1]:.2f}")
    ends = starts[1:] + [duration]

    # captions on screen: a beat before the words, held a little after, never overlapping
    allcaps = [c for k in range(1, 6) for c in acts[k].caps]
    for i, c in enumerate(allcaps):
        c["t0"] = round(c["s0"] - 0.08, 3)
        nxt = allcaps[i + 1]["s0"] - 0.08 - 0.05 if i + 1 < len(allcaps) else duration
        c["t1"] = round(max(c["t0"] + 0.9, min(c["s1"] + 0.35, nxt)), 3)

    rows, tl_shots = [], []
    for i, (s, a, b) in enumerate(zip(shots, starts, ends)):
        nn = f"{i + 1:02d}"
        file = f"{nn}-{s['id']}.js"
        mine = [c for c in allcaps if c["t0"] < b and c["t1"] > a]
        beats = [{"t": round(max(0.0, c["s0"] - a), 2), "text": c["text"]} for c in mine if a <= c["s0"] < b]
        tl_shots.append({
            "id": s["id"], "post": False, "file": file, "start": a, "end": b, "mode": "illustrated", "loc": s["loc"],
            "brief": s["brief"],
            "beats": beats,
            "captions": [{"t0": c["t0"], "t1": c["t1"], "text": c["text"], "words": c["words"]} for c in mine],
        })
        rows.append((nn, s["id"], s["loc"], a, b, b - a, beats[0]["text"] if beats else "(music)"))

    print(f"word match per act: " + ", ".join(f"{k}: {acts[k].matched:.0%}" for k in acts))
    print(f"acts start at: " + ", ".join(f"{k}: {acts[k].offset:.2f}" for k in acts) + f"; speech ends {speech_end:.2f}; film {duration:.2f} s")
    for r in rows:
        flag = "  SHORT" if r[5] < 2.0 else ""
        print(f"{r[0]} {r[1]:18s} {r[2]} {r[3]:7.2f} {r[4]:7.2f} {r[5]:5.2f}{flag}  {r[6][:60]}")

    if not write:
        return
    flash = next(sh["start"] for sh in tl_shots if sh["id"] == "scene-05") + 3.4  # the test shot's beat
    tl = {
        "title": "parable-of-the-ring", "width": 1080, "height": 1080, "fps": FPS, "bpm": 120, "duration": duration,
        "shots": tl_shots,
        "cues": [{"t": 0, "kind": "open"}, {"t": round(flash, 3), "kind": "burst"}],
    }
    # shot edges are written as exact frame fractions (136 / 24), so the engine's f / fps lands on
    # the same number and a cut frame always belongs to the shot that starts on it
    for sh in tl["shots"]:
        sh["start"], sh["end"] = f"@F{round(sh['start'] * FPS)}", f"@F{round(sh['end'] * FPS)}"
    tl["duration"] = f"@F{round(duration * FPS)}"
    body = re.sub(r'"@F(\d+)"', lambda m: f"{m.group(1)} / {FPS}", json.dumps(tl, indent=1, ensure_ascii=False))
    (ROOT / "src" / "timeline.js").write_text(
        "// Film timeline. Generated by audio/timeline.py from docs/shots-v3.json and\n"
        "// docs/captions-v3.txt, timed to the recorded narration (audio/narration/v3). Do not edit by\n"
        "// hand: change the spec or the captions and re-run the tool.\n"
        "// Each shot carries `beats`: when each spoken line starts, in shot-local seconds, so a scene\n"
        "// can key its action to the words. Captions are in global seconds.\n"
        f"FILM.TIMELINE = {body};\n"
    )
    md = ["# Timing v3", "", f"Generated by audio/timeline.py. Film {duration:.2f} s ({int(duration // 60)}:{duration % 60:05.2f}), {len(rows)} shots.", "",
          "| # | Shot | Loc | Start | End | Dur | First line |", "|---|---|---|---|---|---|---|"]
    md += [f"| {r[0]} | {r[1]} | {r[2]} | {r[3]:.2f} | {r[4]:.2f} | {r[5]:.2f} | {r[6]} |" for r in rows]
    (ROOT / "docs" / "timing-v3.md").write_text("\n".join(md) + "\n")
    json.dump({"acts": [{"act": k, "file": f"act{k}.wav", "start": round(acts[k].offset, 3), "duration": round(acts[k].duration, 3)} for k in acts],
               "duration": duration}, open(NARR / "placement.json", "w"), indent=1)
    print("wrote src/timeline.js, docs/timing-v3.md, audio/narration/v3/placement.json")

    if stubs:
        made = 0
        for sh in tl_shots:
            f = ROOT / "src" / "scenes" / sh["file"]
            if f.exists():
                continue
            f.write_text(STUB.replace("__ID__", sh["id"]))
            made += 1
        print(f"wrote {made} stub scene(s)")


STUB = """// STUB: placeholder for shot '__ID__'. The scene builder replaces this whole file.
// It shows the shot id, its brief and its lines, so the full film can be timed as an animatic.
(function () {
  'use strict';
  const ID = '__ID__';
  const P = FILM.lib.pal;
  function wrap(ctx, text, x, y, w, lh) {
    const words = String(text).split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > w && line) {
        ctx.fillText(line, x, y);
        y += lh;
        line = word;
      } else line = test;
    }
    if (line) ctx.fillText(line, x, y);
    return y + lh;
  }
  FILM.scene({
    id: ID,
    draw(ctx, tIn, info) {
      const t = Math.max(0, Math.min(tIn, info.dur));
      const W = info.W || 1080, H = info.H || 1080;
      ctx.fillStyle = P.paper || 'white';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = P.ink || 'black';
      ctx.textAlign = 'left';
      ctx.font = "600 54px Georgia, serif";
      ctx.fillText('STUB ' + ID, 80, 140);
      ctx.font = "30px Georgia, serif";
      let y = wrap(ctx, (info.shot.loc || '') + '  ' + (info.shot.brief || ''), 80, 210, W - 160, 40);
      ctx.fillRect(80, y, (W - 160) * (t / info.dur), 6);
      FILM.look.grain(ctx, info);
      FILM.cast.caption(ctx, info);
    },
  });
})();
"""

if __name__ == "__main__":
    main()
