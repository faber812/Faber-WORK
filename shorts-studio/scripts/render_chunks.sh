#!/bin/bash
# usage: scripts/render_chunks.sh <Composition> <out.mp4> [chunk_frames]
# Renders in chunks (resumable after a container restart), then joins them losslessly.
set -e
COMP=$1; OUT=$2; CH=${3:-600}
# chunk dir is keyed to the source state, so a new commit never reuses stale chunks
REV=$(git rev-parse --short HEAD 2>/dev/null || echo nogit)$(git diff --quiet -- src public 2>/dev/null || echo -dirty)
DIR=out/chunks_${COMP}_$REV; mkdir -p $DIR
TOTAL=$(npx remotion compositions src/index.ts 2>/dev/null | awk -v c="$COMP" '$1==c {print $4}')
echo "total frames $TOTAL"
for ((s=0; s<TOTAL; s+=CH)); do
  e=$((s+CH-1)); ((e>=TOTAL)) && e=$((TOTAL-1))
  f=$DIR/$(printf %06d $s).mp4
  [ -s $f ] && continue
  npx remotion render src/index.ts $COMP $f.tmp.mp4 --frames=$s-$e --gl=swangle --concurrency=4 --log=error
  mv $f.tmp.mp4 $f; echo "chunk $s-$e done"
done
ls $DIR/*.mp4 | grep -v tmp | sed "s|^|file '$PWD/|;s|$|'|" > $DIR/list.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i $DIR/list.txt -an -c copy $DIR/video.mp4
if [ "$COMP" = "Long001" ]; then
  python3 scripts/long_audio.py $DIR/voice.wav $(python3 -c "print($TOTAL/30)")
  ffmpeg -y -loglevel error -i $DIR/video.mp4 -i $DIR/voice.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest $OUT
else
  ffmpeg -y -loglevel error -f concat -safe 0 -i $DIR/list.txt -c copy $OUT
fi
echo "DONE $OUT"
