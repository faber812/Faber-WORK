#!/usr/bin/env bash
# Mix a background music bed under a finished episode without re-rendering video.
# The music loops to the video length, sits ~20 dB under the voice, and ducks further
# while the narrator speaks (sidechain compression). Fades in/out at the edges.
#
# usage: scripts/mix_music.sh <input.mp4> <music file> <output.mp4> [music_gain_db]
set -euo pipefail
IN="$1"; MUSIC="$2"; OUT="$3"; GAIN="${4:--17}"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
FADE_OUT_START=$(python3 -c "print(max(0, $DUR - 1.2))")
ffmpeg -v error -y -i "$IN" -stream_loop -1 -i "$MUSIC" -filter_complex "
  [0:a]aformat=channel_layouts=stereo,asplit=2[voice][sc];
  [1:a]aformat=channel_layouts=stereo,volume=${GAIN}dB,atrim=0:${DUR},afade=t=in:d=0.8,afade=t=out:st=${FADE_OUT_START}:d=1.2[bed];
  [bed][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[ducked];
  [voice][ducked]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]
" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest "$OUT"
echo "mixed -> $OUT"
