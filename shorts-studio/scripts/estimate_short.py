#!/usr/bin/env python3
"""Placeholder timing for a Short before its voice exists: words spread over a target length by length.
usage: python3 scripts/estimate_short.py <id> <seconds>   -> src/shorts2/<id>_timing.json (same format as align_short.py)"""
import json, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import align_long as A
sid, total = sys.argv[1], float(sys.argv[2])
text = open(f'../youtube-plan/shorts-from-long/{sid}.txt').read()
ph = A.phrases(text)
words, caps, t = [], [], 0.2
per = (total - 0.2 - 0.35 * len(ph)) / sum(len(w) + 1 for p in ph for w in A.tokens(p))
for p in ph:
    st = t
    for w in A.tokens(p):
        d = (len(w) + 1) * per
        words.append([w, round(t, 2), round(t + d, 2)]); t += d
    caps.append({'start': round(st, 2), 'text': p}); t += 0.35
for i, c in enumerate(caps):
    c['end'] = round(caps[i + 1]['start'] if i + 1 < len(caps) else t, 2)
os.makedirs('src/shorts2', exist_ok=True)
json.dump({'duration': round(t, 2), 'captions': caps, 'words': words, 'estimated': True}, open(f'src/shorts2/{sid}_timing.json', 'w'), indent=1)
print(sid, 'estimated', round(t, 2), 's', len(words), 'words')
