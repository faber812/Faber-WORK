// Long 002 "246" — cube engine. Every cube is one person (storyboard rule 1): 246 identical flat squares,
// front-on (exactly orthographic), one pitch for the whole video, they only lift, slide, stack and settle.
import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export const FONT = 'Inter, "Inter Display", system-ui, sans-serif';
export const C = {
  bg: '#0e1426',
  field: '#141b33',
  cube: '#ece8dd',
  cold: '#5aa9ff',
  grey: '#9aa3b5',
  ink: '#f2f4fa',
  dim: '#8f9abb',
  amber: '#ffc35a',
  panel: 'rgba(8,11,22,0.92)',
};
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ez = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing: Easing.inOut(Easing.cubic)});

// ---------- categories ----------
export type Cat = 'falls' | 'fire' | 'co' | 'roads' | 'illness' | 'cold';
export const CATS: {id: Cat; n: number; label: string}[] = [
  {id: 'falls', n: 9, label: 'FALLS'},
  {id: 'fire', n: 10, label: 'FIRE'},
  {id: 'co', n: 19, label: 'CO'},
  {id: 'roads', n: 22, label: 'ROADS'},
  {id: 'illness', n: 25, label: 'ILLNESS'},
  {id: 'cold', n: 161, label: 'COLD'},
];
// cube i → category and index within it. Grid cells are filled column-major (6 rows), so CO (first 19 cells)
// sits in the left corner and COLD (last 161 cells) is one big block on the right, as frame 0 needs.
const ORDER: Cat[] = ['co', 'falls', 'fire', 'roads', 'illness', 'cold'];
export const CUBES: {cat: Cat; k: number}[] = [];
ORDER.forEach((c) => {
  const n = CATS.find((x) => x.id === c)!.n;
  for (let k = 0; k < n; k++) CUBES.push({cat: c, k});
});

// ---------- world layout (px in a 1920x1080 "world"; the camera scales it) ----------
export const P = 24; // pitch
export const S = 21; // cube size
export const GRID = {x0: 468, y0: 250}; // top-left of the 41 x 6 grid
export const BASE = 930; // column baseline (bottom of the bottom row) — above y 970
export const COLX: Record<Cat, number> = {falls: 250, fire: 450, co: 650, roads: 850, illness: 1050, cold: 1450};
export const MERGEX = 1250; // the merged 85 column, right next to COLD
const gridPos = (i: number) => ({x: GRID.x0 + Math.floor(i / 6) * P, y: GRID.y0 + (i % 6) * P});
const colPos = (x: number, k: number) => ({x: x + (k % 5) * P, y: BASE - S - Math.floor(k / 5) * P});

export type Look = {x: number; y: number; color: string; outline?: 'white' | 'dash' | null; bright?: number; op?: number};
// a state = which categories are stacked, where, and how they are tinted
export type State = {
  stacked: Cat[]; // categories in their columns
  tint: Cat[]; // tinted categories (cold = blue, others grey); untinted = off-white
  merged?: boolean; // the five others in one 85 column next to COLD
  coBeside?: boolean; // CO column moved beside COLD (S108)
  roadsOnDate?: number; // 0..1: 14 ROADS cubes down on the FEB 11 strip
  direct?: boolean; // 148 cold cubes white outline, others dashed
  who?: boolean; // 107 of the 158 hypothermia cubes brighter
  gridOp?: number;
};
const tintOf = (c: Cat) => (c === 'cold' ? C.cold : C.grey);
export const ROADS_DATE = {x: 760, y: 700}; // where the 14 cubes gather on FEB 11 (strip under ROADS)

export const layout = (s: State): Look[] => {
  // cubes still in the grid keep their cell
  let mergedK = 0;
  return CUBES.map((c, i) => {
    const tinted = s.tint.includes(c.cat);
    let color = tinted ? tintOf(c.cat) : C.cube;
    let pos = gridPos(i);
    if (s.stacked.includes(c.cat)) {
      if (s.merged && c.cat !== 'cold') {
        pos = colPos(MERGEX, mergedK++);
      } else {
        const x = s.coBeside && c.cat === 'co' ? MERGEX : COLX[c.cat];
        // 3 frostbite cubes = the top three of COLD, kept a little apart
        if (c.cat === 'cold' && c.k >= 158) {
          pos = colPos(x, c.k);
          pos = {x: pos.x, y: pos.y - 8};
        } else pos = colPos(x, c.k);
      }
      color = tintOf(c.cat);
    }
    if (s.roadsOnDate && c.cat === 'roads' && c.k < 14) {
      const d = {x: ROADS_DATE.x + (c.k % 7) * P, y: ROADS_DATE.y - S - Math.floor(c.k / 7) * P};
      pos = {x: pos.x + (d.x - pos.x) * s.roadsOnDate, y: pos.y + (d.y - pos.y) * s.roadsOnDate};
    }
    const look: Look = {...pos, color};
    if (s.direct) look.outline = c.cat === 'cold' && c.k < 148 ? 'white' : c.cat === 'cold' ? null : 'dash';
    if (s.who && c.cat === 'cold' && c.k < 158) look.bright = c.k < 107 ? 1 : 0;
    if (s.gridOp !== undefined && !s.stacked.includes(c.cat)) look.op = s.gridOp;
    return look;
  });
};

// interpolate between two layouts; each cube moves on its own small stagger, gently
export const blend = (a: Look[], b: Look[], t: number): Look[] =>
  a.map((p, i) => {
    const q = b[i];
    const moving = p.x !== q.x || p.y !== q.y;
    const st = moving ? (i % 23) / 23 * 0.35 : 0;
    const k = Easing.inOut(Easing.cubic)(Math.max(0, Math.min(1, (t - st) / 0.65)));
    // lift: rise a little above both points while travelling
    const lift = moving ? Math.sin(k * Math.PI) * 40 : 0;
    return {
      x: p.x + (q.x - p.x) * k,
      y: p.y + (q.y - p.y) * k - lift,
      color: k < 0.5 ? p.color : q.color,
      outline: k < 0.5 ? p.outline : q.outline,
      bright: (p.bright ?? 0) + ((q.bright ?? 0) - (p.bright ?? 0)) * k,
      op: (p.op ?? 1) + ((q.op ?? 1) - (p.op ?? 1)) * k,
    };
  });

export const Cubes: React.FC<{looks: Look[]; pulse?: number; pulseCat?: Cat}> = ({looks, pulse = -1}) => (
  <g>
    {looks.map((l, i) => (
      <g key={i} opacity={l.op ?? 1}>
        <rect x={l.x} y={l.y} width={S} height={S} rx={3} fill={l.color} style={{filter: (l.bright ?? 0) > 0.01 || i === pulse ? `brightness(${1 + 0.45 * (i === pulse ? 1 : l.bright ?? 0)})` : undefined}} />
        <rect x={l.x} y={l.y} width={S} height={4} rx={2} fill="#ffffff" opacity={0.22} />
        {l.outline === 'white' && <rect x={l.x - 1.5} y={l.y - 1.5} width={S + 3} height={S + 3} rx={4} fill="none" stroke="#fff" strokeWidth={2.2} />}
      </g>
    ))}
  </g>
);

// ---------- camera: world → screen ----------
export type Cam = {cx: number; cy: number; z: number};
export const WIDE: Cam = {cx: 960, cy: 540, z: 1};
export const World: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    <g transform={`translate(${960 - cam.cx * cam.z},${540 - cam.cy * cam.z}) scale(${cam.z})`}>{children}</g>
  </svg>
);
export const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({cx: a.cx + (b.cx - a.cx) * k, cy: a.cy + (b.cy - a.cy) * k, z: a.z * Math.pow(b.z / a.z, k)});

// ---------- 2D UI (title-safe x 96–1824, y 54–970) ----------
export const Card: React.FC<{lines: string[]; top?: number; size?: number; color?: string; width?: number; left?: number; k?: number; align?: 'left' | 'center'}> = ({lines, top = 120, size = 52, color = C.ink, width = 1400, left, k = 1, align = 'center'}) => (
  <div
    style={{
      position: 'absolute',
      top,
      left: left ?? (1920 - width) / 2,
      width,
      background: C.panel,
      borderRadius: 22,
      padding: '24px 40px',
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.18,
      color,
      textAlign: align,
      opacity: k,
      transform: `translateY(${(1 - k) * 16}px)`,
      boxSizing: 'border-box',
    }}
  >
    {lines.map((l, i) => (
      <div key={i}>{l}</div>
    ))}
  </div>
);
export const Chip: React.FC<{text: string; x: number; y: number; size?: number; k?: number; color?: string; bg?: string; glow?: number}> = ({text, x, y, size = 40, k = 1, color = C.ink, bg = C.panel, glow = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, background: bg, borderRadius: 14, padding: '8px 18px', fontFamily: FONT, fontWeight: 800, fontSize: size, color, opacity: k, transform: `scale(${0.9 + 0.1 * k})`, transformOrigin: 'left center', boxShadow: glow > 0 ? `0 0 ${30 * glow}px rgba(255,195,90,${0.8 * glow})` : undefined, whiteSpace: 'nowrap'}}>
    {text}
  </div>
);
export const Source: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 96, top: 900, maxWidth: 1500, background: 'rgba(5,7,15,0.9)', color: '#dfe5f5', borderRadius: 10, padding: '6px 16px', fontFamily: FONT, fontWeight: 700, fontSize: 30, lineHeight: 1.25}}>
    Source: {text}
  </div>
);
export const Title: React.FC<{text: string; k?: number}> = ({text, k = 1}) => (
  <div style={{position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', opacity: k}}>
    <span style={{background: C.panel, borderRadius: 18, padding: '10px 34px', fontFamily: FONT, fontWeight: 900, fontSize: 64, color: C.amber, letterSpacing: 1}}>{text}</span>
  </div>
);
// appear-on-cue helper: 0 before t0, eases to 1 over 0.35 s
export const useK = (t0: number) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return interpolate(f / fps, [t0, t0 + 0.35], [0, 1], clamp);
};
