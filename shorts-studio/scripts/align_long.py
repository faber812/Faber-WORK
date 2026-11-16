#!/usr/bin/env python3
"""Align narration blocks to their script text without a speech recogniser.

For each recorded block (public/long001/bNN.mp3) the script text is split into caption
phrases. Phrase boundaries are estimated by character share of the block duration and then
snapped to the nearest pause found by ffmpeg silencedetect. Output: src/long001_timing.json
with absolute times for the whole video (blocks laid end to end with a small gap).

usage: python3 scripts/align_long.py   (run from shorts-studio/)
"""
import json, os, re, subprocess

BLOCKS = json.load(open('../youtube-plan/long-001/blocks.json'))
GAP = 0.35  # silence between blocks, seconds


def silences(path):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'silencedetect=noise=-32dB:d=0.14', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
    en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
    return list(zip(st, en))


def duration(path):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                                capture_output=True, text=True).stdout)


def phrases(text):
    text = re.sub(r'\[[^\]]*\]\s*', '', text)
    parts = []
    for para in text.split('\n\n'):
        # split after sentence enders and ellipses, keep the punctuation
        for p in re.split(r'(?<=[.?!])\s+|(?<=\.\.\.)\s+', para.strip()):
            p = p.strip()
            if p:
                parts.append(p)
    # merge very short fragments into the next one so captions don't flicker
    merged = []
    for p in parts:
        if merged and len(merged[-1]) < 14:
            merged[-1] = merged[-1] + ' ' + p
        else:
            merged.append(p)
    return merged


def weight(p):
    # spoken length: characters plus a pause allowance for punctuation
    return len(p) + 6 * p.count('...') + 3 * (p.count(',') + p.count(':'))


result = {'blocks': [], 'captions': []}
t0 = 0.0
for b in BLOCKS:
    path = f"public/long001/{b['id']}.mp3"
    if not os.path.exists(path):
        result['blocks'].append({'id': b['id'], 'title': b['title'], 'missing': True})
        continue
    dur = duration(path)
    sil = [(s, e) for s, e in silences(path) if s > 0.2 and e < dur - 0.05]
    ph = phrases(b['text'])
    total = sum(weight(p) for p in ph)
    # speech occupies dur minus trailing silence; estimate boundaries
    bounds = []
    acc = 0
    used = set()
    for p in ph[:-1]:
        acc += weight(p)
        est = dur * acc / total
        best = None
        for i, (s, e) in enumerate(sil):
            if i in used:
                continue
            mid = (s + e) / 2
            if best is None or abs(mid - est) < abs(best[1] - est):
                best = (i, mid, s, e)
        if best and abs(best[1] - est) < 1.6:
            used.add(best[0])
            bounds.append((best[2], best[3]))
        else:
            bounds.append((est, est))
    bounds.sort()
    starts = [0.0] + [e for _, e in bounds]
    ends = [s for s, _ in bounds] + [dur]
    caps = []
    for p, s, e in zip(ph, starts, ends):
        if e <= s:
            e = s + 0.3
        caps.append({'start': round(t0 + s, 2), 'end': round(t0 + e, 2), 'text': p, 'block': b['id']})
    result['blocks'].append({'id': b['id'], 'title': b['title'], 'audio': f"long001/{b['id']}.mp3", 'start': round(t0, 2), 'duration': round(dur, 2), 'phrases': len(ph)})
    result['captions'] += caps
    t0 += dur + GAP
result['duration'] = round(t0, 2)
json.dump(result, open('src/long001_timing.json', 'w'), indent=1)
print('blocks recorded:', sum(1 for b in result['blocks'] if not b.get('missing')), '/', len(BLOCKS), ' total', result['duration'], 's')
