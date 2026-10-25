#!/usr/bin/env bash
# Close, dry fireside voice: the warmth of warm-voice.sh without its room echo, with lighter
# compression and a wider loudness range so the quiet and the emotional lines keep their dynamics.
# 5% slower by default, pitch kept.
#   audio/intimate-voice.sh in.mp3 out.wav [tempo]
set -euo pipefail
TEMPO="${3:-0.95}"
ffmpeg -v error -y -i "$1" -af "aresample=48000,highpass=f=65,equalizer=f=160:t=q:w=0.9:g=3,equalizer=f=3200:t=q:w=1.4:g=-2,deesser=i=0.3,treble=g=-2.5:f=9000,acompressor=threshold=-24dB:ratio=1.6:attack=30:release=300:makeup=1.5,atempo=$TEMPO,loudnorm=I=-16:TP=-1.5:LRA=14" -ar 48000 "$2"
