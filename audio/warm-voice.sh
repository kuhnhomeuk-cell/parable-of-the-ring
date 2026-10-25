#!/usr/bin/env bash
# Warms a narration take for the fireside sound: body around 170 Hz, softer highs, de-essing,
# light compression, a hint of small-room reflection and 5% slower, pitch kept.
#   audio/warm-voice.sh in.mp3 out.wav [tempo]
set -euo pipefail
TEMPO="${3:-0.95}"
ffmpeg -v error -y -i "$1" -af "aresample=48000,highpass=f=70,equalizer=f=170:t=q:w=0.9:g=3.5,equalizer=f=3200:t=q:w=1.4:g=-2.5,deesser=i=0.35,treble=g=-3:f=8500,acompressor=threshold=-22dB:ratio=2.2:attack=20:release=250:makeup=2.5,aecho=0.85:0.5:23|41:0.10|0.06,atempo=$TEMPO,loudnorm=I=-16:TP=-1.5:LRA=9" -ar 48000 "$2"
