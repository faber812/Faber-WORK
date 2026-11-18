#!/usr/bin/env python3
"""Placeholder timing for Long 002 before the voice exists: 165 wpm, words weighted by length,
0.35 s between sentences, 0.6 s between paragraphs, 1.0 s silence after "eighty five" (storyboard).
Writes src/long2/timing.json {duration, sentences[{start,end,text}], words[[w,s,e]], estimated}."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import align_long as A
text = open('../youtube-plan/long-002/lines.txt').read().strip()
paras = [p for p in text.split('\n\n') if p.strip()]
allw = [w for p in paras for s in A.phrases(p) for w in A.tokens(s)]
spoken = len(text.split()) / 165 * 60  # seconds of speech at 165 wpm
per = spoken / sum(len(w) + 2 for w in allw)
t, words, sents = 0.3, [], []
for p in paras:
    for s in A.phrases(p):
        st = t
        toks = A.tokens(s)
        for i, w in enumerate(toks):
            d = (len(w) + 2) * per
            words.append([w, round(t, 2), round(t + d, 2)]); t += d
            if w == 'five' and i > 0 and toks[i - 1] == 'eighty':
                t += 1.0
        sents.append({'start': round(st, 2), 'text': s}); t += 0.35
    t += 0.25
for i, s in enumerate(sents):
    s['end'] = round(sents[i + 1]['start'] if i + 1 < len(sents) else t, 2)
os.makedirs('src/long2', exist_ok=True)
json.dump({'duration': round(t, 2), 'sentences': sents, 'words': words, 'estimated': True}, open('src/long2/timing.json', 'w'), indent=1)
print('estimated', round(t, 2), 's,', len(words), 'words,', len(sents), 'sentences')
