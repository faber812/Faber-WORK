#!/usr/bin/env python3
"""Word-level alignment for a single-file Short.

usage: python3 scripts/align_short.py <id>     (run from shorts-studio/)
reads public/shorts2/<id>.mp3 and ../youtube-plan/shorts-from-long/<id>.txt (narration text, paragraphs = blank lines)
writes src/shorts2/<id>_timing.json: {duration, captions[{start,end,text}], words[[w,s,e]]}
"""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import align_long as A

sid = sys.argv[1]
path = f'public/shorts2/{sid}.mp3'
text = open(f'../youtube-plan/shorts-from-long/{sid}.txt').read()
dur = A.duration(path)
words = A.align(path, text)
ph = A.phrases(text)
counts = [len(A.tokens(p)) for p in ph]
assert sum(counts) == len(words), (sum(counts), len(words))
caps, k = [], 0
for i, (p, c) in enumerate(zip(ph, counts)):
    st = 0.0 if i == 0 else words[k][1] - 0.05
    k += c
    caps.append({'start': round(st, 2), 'text': p, 'last': words[k - 1][2]})
for i, c in enumerate(caps):
    c['end'] = round(caps[i + 1]['start'] if i + 1 < len(caps) else min(dur, c.pop('last') + 0.4), 2)
    c.pop('last', None)
os.makedirs('src/shorts2', exist_ok=True)
json.dump({'duration': round(dur, 2), 'captions': caps, 'words': words}, open(f'src/shorts2/{sid}_timing.json', 'w'), indent=1)
print(sid, 'duration', round(dur, 2), 'phrases', len(caps))
for i, c in enumerate(caps):
    print(i, c['start'], c['text'][:70])
