#!/usr/bin/env bash
# Generates one sound effect with ElevenLabs Sound Effects and saves it to audio/sfx/<name>.mp3.
#   audio/sfx.sh <name> <seconds> "<description>" [account]
#   audio/sfx.sh --credits [account]          prints the account's tier and credits left
# account 1 (default) reads the ELEVENLABS_API_KEY environment variable, account 2 reads
# ELEVENLABS_API_KEY_2. Export your own key before running. The key is passed to curl as a header
# file, so it never appears on a command line.
set -euo pipefail
cd "$(dirname "$0")"
key_for() {
  local var=ELEVENLABS_API_KEY
  [ "${1:-1}" = 2 ] && var=ELEVENLABS_API_KEY_2
  local k="${!var:-}"
  [ -n "$k" ] || { echo "set $var in the environment first" >&2; exit 1; }
  printf '%s' "$k"
}

if [ "${1:-}" = "--credits" ]; then
  KEY=$(key_for "${2:-1}")
  curl -sS -H @<(printf 'xi-api-key: %s\n' "$KEY") https://api.elevenlabs.io/v1/user/subscription |
    python3 -I -c 'import json,sys; d=json.load(sys.stdin); print("ElevenLabs refused:", json.dumps(d.get("detail"))) if "detail" in d else print(d.get("tier"), "used", d.get("character_count"), "of", d.get("character_limit"), "resets", d.get("next_character_count_reset_unix"))'
  exit 0
fi

NAME="$1"; SECS="$2"; TEXT="$3"; ACCT="${4:-1}"
KEY=$(key_for "$ACCT")
mkdir -p sfx
BODY=$(python3 -I -c 'import json,sys; print(json.dumps({"text": sys.argv[1], "duration_seconds": float(sys.argv[2]), "prompt_influence": 0.5, "model_id": "eleven_text_to_sound_v2"}))' "$TEXT" "$SECS")
HTTP=$(curl -sS -o "sfx/$NAME.mp3" -w '%{http_code}' -X POST https://api.elevenlabs.io/v1/sound-generation \
  -H @<(printf 'xi-api-key: %s\nContent-Type: application/json\n' "$KEY") --data "$BODY")
if [ "$HTTP" != 200 ]; then
  echo "ElevenLabs returned HTTP $HTTP:" >&2; cat "sfx/$NAME.mp3" >&2; echo >&2; rm -f "sfx/$NAME.mp3"; exit 1
fi
printf '%s\t%s\t%s\n' "$NAME" "$SECS" "$TEXT" >> sfx/prompts.tsv
ffprobe -v error -show_entries format=duration -of csv=p=0 "sfx/$NAME.mp3" | xargs echo "wrote sfx/$NAME.mp3, seconds:"
