#!/usr/bin/env python3
"""Build the narration track for Long001 from block mp3s at their timeline offsets."""
import json, subprocess, sys
t = json.load(open('src/long001_timing.json'))
bl = [b for b in t['blocks'] if not b.get('missing')]
total = float(sys.argv[2]) if len(sys.argv) > 2 else t['duration']
args, flt = [], []
for i, b in enumerate(bl):
    args += ['-i', 'public/' + b['audio']]
    ms = int(round(b['start'] * 1000))
    flt.append(f'[{i}:a]aresample=48000,adelay={ms}|{ms}[a{i}]')
flt.append(''.join(f'[a{i}]' for i in range(len(bl))) + f'amix=inputs={len(bl)}:normalize=0,apad,atrim=0:{total}[out]')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *args, '-filter_complex', ';'.join(flt), '-map', '[out]', '-c:a', 'pcm_s16le', sys.argv[1]], check=True)
print('audio ok', sys.argv[1])
