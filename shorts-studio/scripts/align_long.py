#!/usr/bin/env python3
"""Align narration blocks to their script text with forced alignment (pocketsphinx, offline).

For each recorded block (public/long001/bNN.mp3) the known script is aligned word by word to the
audio. Word times are cached in public/long001/bNN.align.json. Caption phrases then start at
their first word and end where the next phrase starts. Output: src/long001_timing.json.

usage: pip install pocketsphinx; python3 scripts/align_long.py   (run from shorts-studio/)
"""
import json, os, re, subprocess, tempfile

BLOCKS = json.load(open('../youtube-plan/long-001/blocks.json'))
GAP = 0.35  # silence between blocks, seconds
KEEP_CAPS = {'FEMA'}  # acronyms read as words


def tokens(text):
    """Words as the narrator says them, in decoder spelling."""
    text = re.sub(r'\[[^\]]*\]\s*', '', text)
    text = re.sub(r'(?i)ready\.gov', 'Ready dot gov', text)
    text = re.sub(r'(?i)wi-fi', 'why fi', text)
    out = []
    for raw in re.findall(r"[A-Za-z][A-Za-z']*", text.replace('-', ' ')):
        base = raw[:-2] if raw.endswith("'s") else raw
        poss = raw.endswith("'s")
        if base.isupper() and len(base) >= 2 and base not in KEEP_CAPS:
            out += list(base.lower()) + (['s'] if poss else [])
        elif base.endswith('s') and base[:-1].isupper() and len(base) > 2:  # ATMs
            out += list(base[:-1].lower()) + ['s']
        elif raw.lower() == "gov's":
            out.append('gov')
        elif raw.lower() == 'refreeze':
            out += ['re', 'freeze']
        else:
            out.append(raw.lower())
    return out


def align(path):
    cache = path.replace('.mp3', '.align.json')
    if os.path.exists(cache) and os.path.getmtime(cache) > os.path.getmtime(path):
        return json.load(open(cache))
    from pocketsphinx import Decoder
    bid = os.path.basename(path)[:-4]
    text = [b for b in BLOCKS if b['id'] == bid][0]['text']
    with tempfile.NamedTemporaryFile(suffix='.raw') as tmp:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path, '-ar', '16000', '-ac', '1', '-f', 's16le', tmp.name], check=True)
        data = open(tmp.name, 'rb').read()
    d = Decoder(loglevel='FATAL', samprate=16000, bestpath=False)
    d.set_align_text(' '.join(tokens(text)))
    d.start_utt(); d.process_raw(data, full_utt=True); d.end_utt()
    d.set_alignment()
    d.start_utt(); d.process_raw(data, full_utt=True); d.end_utt()
    words = [[re.sub(r'\(\d+\)$', '', w.name), w.start / 100, (w.start + w.duration) / 100] for w in d.get_alignment()]
    words = [w for w in words if not w[0].startswith(('<', '['))]
    json.dump(words, open(cache, 'w'))
    return words


def duration(path):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                                capture_output=True, text=True).stdout)


def phrases(text):
    text = re.sub(r'\[[^\]]*\]\s*', '', text)
    parts = []
    for para in text.split('\n\n'):
        for p in re.split(r'(?<=[.?!])\s+|(?<=\.\.\.)\s+', para.strip()):
            p = p.strip()
            if p:
                parts.append(p)
    merged = []
    for p in parts:  # merge very short fragments so captions don't flicker
        if merged and len(merged[-1]) < 14:
            merged[-1] = merged[-1] + ' ' + p
        else:
            merged.append(p)
    return merged


result = {'blocks': [], 'captions': []}
t0 = 0.0
for b in BLOCKS:
    path = f"public/long001/{b['id']}.mp3"
    if not os.path.exists(path):
        result['blocks'].append({'id': b['id'], 'title': b['title'], 'missing': True})
        continue
    dur = duration(path)
    words = align(path)
    ph = phrases(b['text'])
    counts = [len(tokens(p)) for p in ph]
    assert sum(counts) == len(words), (b['id'], sum(counts), len(words))
    starts, k = [], 0
    for c in counts:
        starts.append(words[k][1])
        k += c
    starts[0] = 0.0
    lasts, k = [], 0
    for c in counts:
        k += c
        lasts.append(words[k - 1][2])
    caps = []
    for i, p in enumerate(ph):
        end = starts[i + 1] if i + 1 < len(ph) else min(dur, lasts[i] + 0.4)
        caps.append({'start': round(t0 + max(0, starts[i] - 0.05), 2), 'end': round(t0 + end, 2), 'text': p, 'block': b['id']})
    result['blocks'].append({'id': b['id'], 'title': b['title'], 'audio': f"long001/{b['id']}.mp3", 'start': round(t0, 2), 'duration': round(dur, 2), 'phrases': len(ph)})
    result['captions'] += caps
    t0 += dur + GAP
result['duration'] = round(t0, 2)
json.dump(result, open('src/long001_timing.json', 'w'), indent=1)
print('blocks recorded:', sum(1 for b in result['blocks'] if not b.get('missing')), '/', len(BLOCKS), ' total', result['duration'], 's')
