// Shared helpers for engine-upgrade Shorts: word-cue lookup, live captions, arm reach, vehicles.
import React from 'react';
import {popK} from '../three/look';

type V3 = [number, number, number];
export type Timing = {duration: number; captions: {start: number; text: string}[]; words: [string, number, number][]};

// decoder spells acronyms letter by letter (c d c) and may split words (flag ers)
export const makeCue = (W: [string, number, number][]) => {
  const toks = (text: string) => {
    const out: string[] = [];
    for (const raw of text.replace(/-/g, ' ').match(/[A-Za-z][A-Za-z']*/g) ?? []) {
      if (raw.length >= 2 && raw === raw.toUpperCase()) out.push(...raw.toLowerCase().split(''));
      else out.push(raw.toLowerCase());
    }
    return out;
  };
  return (head: string, after = 0) => {
    const h = toks(head);
    for (let i = 0; i + h.length <= W.length; i++) {
      if (W[i][1] < after - 0.001) continue;
      if (h.every((x, j) => W[i + j][0] === x)) return W[i][1];
    }
    throw new Error(`cue not found: ${head}`);
  };
};

// captions: display words aligned to timing tokens by letters, chunks of up to 3 words, one yellow word
type Chunk = {t: number; words: string[]; y: number};
export const makeChunks = (timing: Timing, yellow: string[]): Chunk[] => {
  const W = timing.words;
  const out: Chunk[] = [];
  let wi = 0;
  for (const c of timing.captions) {
    const disp = c.text.split(/\s+/).filter(Boolean);
    let cur: Chunk | null = null;
    disp.forEach((d, i) => {
      const target = d.toLowerCase().replace(/[^a-z]/g, '');
      const t = W[wi] ? W[wi][1] : c.start;
      let acc = '';
      while (wi < W.length && acc.length < target.length) {
        acc += W[wi][0].replace(/[^a-z]/g, '');
        wi++;
      }
      if (!cur || cur.words.length >= 3) {
        cur = {t, words: [], y: -1};
        out.push(cur);
      }
      cur.words.push(d.toUpperCase());
      if (/[.,?]$/.test(d) && i < disp.length - 1 && cur.words.length >= 2) cur = null;
    });
  }
  out.forEach((c) => {
    c.y = c.words.findIndex((w) => yellow.includes(w.replace(/[^A-Z'-]/g, '').replace(/'S$/, '')));
  });
  return out;
};
export const Captions: React.FC<{t: number; chunks: Chunk[]; top?: number}> = ({t, chunks, top = 330}) => {
  let i = -1;
  for (let k = 0; k < chunks.length; k++) if (chunks[k].t <= t + 0.02) i = k;
  if (i < 0) return null;
  const c = chunks[i];
  const k = i === 0 ? 1 : popK(t, c.t);
  return (
    <div style={{position: 'absolute', top, left: 60, right: 170, textAlign: 'center', transform: `scale(${0.9 + 0.1 * k})`, transformOrigin: 'center top'}}>
      {c.words.map((w, j) => (
        <span key={j} style={{fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 900, fontSize: 96, lineHeight: 1.05, color: j === c.y ? '#ffd21f' : '#ffffff', WebkitTextStroke: '12px #14110c', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.45)', marginRight: 22, display: 'inline-block'}}>
          {w}
        </span>
      ))}
    </div>
  );
};

// aim the kit's right arm (armRx, armR) so the hand lands on a world point
export const reachArm = (frame: number, pos: V3, rotY: number, target: V3, scale = 1) => {
  const c = Math.cos(rotY), sn = Math.sin(rotY);
  const bob = Math.sin(frame / 8) * 0.03 * scale;
  const sway = Math.sin(frame / 12) * 0.06;
  const S: V3 = [pos[0] + 0.65 * scale * c, pos[1] + (1.72 + 0) * scale + bob, pos[2] - 0.65 * scale * sn];
  const d = [target[0] - S[0], target[1] - S[1], target[2] - S[2]];
  const lx = d[0] * c - d[2] * sn, ly = d[1], lz = d[0] * sn + d[2] * c;
  const n = Math.hypot(lx, ly, lz);
  const zr = Math.asin(Math.max(-1, Math.min(1, lx / n)));
  const xr = Math.atan2(-lz / n, -ly / n);
  return {armRx: xr, armR: -zr - sway};
};
