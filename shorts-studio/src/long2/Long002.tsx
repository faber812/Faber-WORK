// Long 002 — "246": six causes of the 2021 Texas freeze deaths, ranked (1920x1080).
// Storyboard: yt-channel content/scripts/long-002-storyboard.md (164 shots + orchestrator answers).
// Every shot starts on a word cue from timing.json; cards appear on the word they repeat, never before.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import timing from './timing.json';
import {Cam, Card, Cat, CATS, Chip, C, clamp, COLX, BASE, blend, Cubes, ez, FONT, layout, lerpCam, MERGEX, P, ROADS_DATE, S, Source, SourceTop, State, Title, useK, WIDE, World} from './engine';
import {Cam as Cam3, Lineman, Volt} from '../three/kit';

export const L2_FPS = 30;
export const L2_HOLD = 5.5;
export const L2_FRAMES = Math.ceil((timing.duration + L2_HOLD) * L2_FPS);
const W = timing.words as [string, number, number][];
const SENT = timing.sentences as {start: number; end: number; text: string}[];
// n-th occurrence of word w at or after time `after`
const w = (word: string, n = 0, after = 0) => {
  const hits = W.filter((x) => x[0] === word && x[1] >= after - 0.001);
  return (hits[Math.min(n, hits.length - 1)] ?? W[W.length - 1])[1];
};
// same spelling as scripts/align_long.py tokens(): acronyms spelled out, Ready.gov -> ready dot gov
const tokens = (text: string): string[] => {
  const out: string[] = [];
  const t = text.replace(/ready\.gov/gi, 'Ready dot gov').replace(/-/g, ' ');
  for (const raw of t.match(/[A-Za-z][A-Za-z'.]*[A-Za-z]|[A-Za-z]/g) ?? []) {
    const r = raw.replace(/\./g, '');
    const poss = r.endsWith("'s");
    const base = poss ? r.slice(0, -2) : r;
    if (base.length >= 2 && base === base.toUpperCase() && base !== 'FEMA') out.push(...base.toLowerCase().split(''), ...(poss ? ['s'] : []));
    else out.push(r.toLowerCase());
  }
  return out;
};
// time of the first word of `head` (a word sequence), first match at or after `after`
const s = (head: string, after = 0) => {
  const h = tokens(head);
  for (let i = 0; i + h.length <= W.length; i++) {
    if (W[i][1] < after - 0.001) continue;
    let ok = true;
    for (let j = 0; j < h.length; j++) if (W[i + j][0] !== h[j]) { ok = false; break; }
    if (ok) return W[i][1];
  }
  throw new Error(`cue not found: ${head}`);
};

// first head that exists in the timing (the decoder spells STEAR as "steer"; the estimate spells it out)
const sAny = (heads: string[], after = 0) => {
  for (const h of heads) {
    try {
      return s(h, after);
    } catch {}
  }
  return s(heads[0], after);
};

// ---------- sources (wording from the script) ----------
const DSHS = 'Texas DSHS, Feb. 2021 Winter Storm-Related Deaths (2021)';
const CDC_WS = 'CDC — Stay Safe During and After a Winter Storm';
const USFA = 'U.S. Fire Administration (FEMA) — Heating Fire Safety';
const MDFS = 'Massachusetts Dept. of Fire Services (2024)';
const ROADS_SRC = 'Texas DSHS (2021), Figure 1; FERC–NERC (2021); Ready.gov — Winter Weather; CDC';
const READY_WW = 'Ready.gov — Winter Weather';
const DEV_SRC = 'FDA — Medical Devices and Natural Disasters; Ready.gov — Power Outages; Texas Division of Emergency Management';
const T3 = 'Texas DSHS (2021), Table 3';
const T2 = 'Texas DSHS (2021), Table 2';
const READY_PO = 'Ready.gov — Power Outages';

// ---------- states ----------
const ST = {
  open: {stacked: [], tint: ['co', 'cold']} as State,
  plain: {stacked: [], tint: []} as State,
  ch: (n: number, extra: Partial<State> = {}): State => ({stacked: CATS.slice(0, n).map((c) => c.id), tint: CATS.slice(0, n).map((c) => c.id), ...extra}),
};
const ALL = ST.ch(6);

// ---------- cameras ----------
const CAM = {
  wide: WIDE,
  grid: {cx: 960, cy: 330, z: 1.55} as Cam,
  gen: {cx: 560, cy: 300, z: 1.9} as Cam,
  co: {cx: 520, cy: 330, z: 2.6} as Cam,
  cold: {cx: 1190, cy: 330, z: 1.8} as Cam,
  slots: {cx: 960, cy: 620, z: 1.15} as Cam,
  col: (c: Cat, z = 2.2): Cam => ({cx: COLX[c] + 60, cy: BASE - 90, z}),
  coldCol: {cx: 1300, cy: 520, z: 1.1} as Cam,
};

type Shot = {t: number; st?: State; cam?: Cam; slots?: boolean; O?: React.FC<{t: number; t0: number; t1: number}>};

// ---------- small flat icons (SVG, plain shapes, no people) ----------
const Ico: React.FC<{kind: string; x: number; y: number; s?: number; k?: number; lit?: boolean; off?: boolean; frost?: number; dim?: boolean}> = ({kind, x, y, s: sz = 120, k = 1, lit = true, off = false, frost = 0, dim = false}) => {
  const stroke = '#dfe5f5';
  const fill = dim ? '#2a3150' : '#2f3b66';
  const g = (children: React.ReactNode) => (
    <g transform={`translate(${x},${y}) scale(${sz / 120})`} opacity={k}>
      {children}
    </g>
  );
  switch (kind) {
    case 'generator':
      return g(<>
        <rect x={-50} y={-30} width={100} height={66} rx={10} fill="#d9a21b" />
        <rect x={-56} y={-40} width={112} height={12} rx={5} fill="#3a3d48" />
        <circle cx={-18} cy={4} r={14} fill="#3a3d48" />
        <rect x={10} y={-8} width={30} height={22} rx={4} fill="#3a3d48" />
      </>);
    case 'grill':
      return g(<>
        <path d="M-50 -20 A50 34 0 0 0 50 -20 Z" fill="#c44a4a" />
        <rect x={-54} y={-26} width={108} height={8} rx={4} fill="#3a3d48" />
        <path d="M-30 14 L-40 50 M30 14 L40 50" stroke="#3a3d48" strokeWidth={8} strokeLinecap="round" />
      </>);
    case 'heater':
      return g(<>
        <rect x={-40} y={-50} width={80} height={96} rx={12} fill={fill} stroke={stroke} strokeWidth={4} />
        {[-24, -8, 8, 24].map((yy) => <rect key={yy} x={-26} y={yy - 4} width={52} height={7} rx={3} fill={off ? '#555a6a' : '#ff8a3d'} />)}
        <circle cx={28} cy={-38} r={6} fill={off ? '#333845' : '#4ee08a'} />
      </>);
    case 'car':
      return g(<>
        <rect x={-58} y={-6} width={116} height={34} rx={10} fill="#4e7fff" />
        <path d="M-36 -6 L-22 -32 L24 -32 L38 -6 Z" fill="#4e7fff" />
        <path d="M-28 -8 L-18 -26 L-2 -26 L-2 -8 Z M4 -8 L4 -26 L20 -26 L30 -8 Z" fill="#cfe2ff" />
        <circle cx={-32} cy={30} r={12} fill="#111" />
        <circle cx={32} cy={30} r={12} fill="#111" />
        <path d="M-70 -50 L-70 46 L70 46 L70 -50" fill="none" stroke={stroke} strokeWidth={4} strokeDasharray="10 8" />
      </>);
    case 'vent':
      return g(<>
        <rect x={-60} y={-55} width={60} height={110} fill="#59648c" />
        <rect x={0} y={-12} width={52} height={24} rx={6} fill="#aab3cc" />
        <path d="M52 -16 Q66 -6 52 4 Q66 12 52 20" fill="#e8f4ff" stroke="#bfe0ff" strokeWidth={3} />
      </>);
    case 'plug':
      return g(<>
        <rect x={-30} y={-30} width={60} height={50} rx={10} fill={lit ? '#ffc35a' : '#3a3f52'} />
        <rect x={-18} y={-58} width={8} height={30} fill={lit ? '#ffc35a' : '#3a3f52'} />
        <rect x={10} y={-58} width={8} height={30} fill={lit ? '#ffc35a' : '#3a3f52'} />
        <path d="M0 20 Q0 54 30 58" fill="none" stroke={lit ? '#ffc35a' : '#3a3f52'} strokeWidth={8} />
      </>);
    case 'thermostat':
      return g(<>
        <circle r={50} fill={lit ? '#2f3b66' : '#1d2340'} stroke={lit ? '#ffc35a' : '#3a3f52'} strokeWidth={6} />
        <text y={14} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={40} fill={lit ? '#ffc35a' : '#3a3f52'}>{lit ? '70°' : '—'}</text>
      </>);
    case 'device':
    case 'oxygen':
      return g(<>
        <rect x={-46} y={-56} width={92} height={112} rx={14} fill={fill} stroke={stroke} strokeWidth={4} />
        {kind === 'oxygen' && <text y={6} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={34} fill="#dfe5f5">O₂</text>}
        {kind === 'device' && <rect x={-28} y={-30} width={56} height={30} rx={6} fill="#1a2038" />}
        <circle cx={0} cy={36} r={9} fill={off ? '#333845' : '#4ee08a'} style={{filter: off ? undefined : 'drop-shadow(0 0 6px #4ee08a)'}} />
      </>);
    case 'dialysis':
      return g(<>
        <rect x={-46} y={-56} width={92} height={112} rx={14} fill={fill} stroke={stroke} strokeWidth={4} />
        <rect x={-30} y={-40} width={60} height={34} rx={6} fill="#1a2038" />
        <text x={0} y={-17} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={20} fill="#ffc35a">PAUSED</text>
        <circle cx={-16} cy={20} r={10} fill="#59648c" />
        <circle cx={16} cy={20} r={10} fill="#59648c" />
      </>);
    case 'medicine':
      return g(<>
        <rect x={-26} y={-44} width={52} height={92} rx={12} fill="#e8ebf2" />
        <rect x={-30} y={-56} width={60} height={18} rx={5} fill="#5aa9ff" />
        <rect x={-20} y={-6} width={40} height={30} rx={4} fill="#c9d3f0" />
        {frost > 0 && <g opacity={frost}>
          {[[-14, -20], [12, 0], [-6, 30], [16, 34]].map(([a, b], i) => (
            <text key={i} x={a} y={b} fontSize={26} textAnchor="middle" fill="#bfe6ff">❄</text>
          ))}
        </g>}
      </>);
    case 'hospice':
      return g(<>
        <path d="M-50 0 L0 -46 L50 0 L50 50 L-50 50 Z" fill={dim ? '#2a3150' : fill} stroke={stroke} strokeWidth={4} />
        <path d="M0 40 C-30 18 -24 -4 -10 -4 C-4 -4 0 2 0 6 C0 2 4 -4 10 -4 C24 -4 30 18 0 40 Z" fill={dim ? '#7a5a6a' : '#ff7a8a'} />
      </>);
    case 'fire':
      return g(<path d="M0 -50 C30 -16 40 10 22 36 C10 52 -10 52 -22 36 C-38 12 -20 -8 -8 -22 C-6 -8 0 0 8 -4 C12 -20 6 -36 0 -50 Z" fill="#ff8a3d" />);
    case 'ice':
      return g(<>
        <rect x={-56} y={8} width={112} height={18} rx={6} fill="#cfe9ff" />
        <path d="M-40 6 L-20 -30 L-6 6 M6 6 L26 -24 L40 6" fill="none" stroke="#bfe0ff" strokeWidth={5} />
      </>);
    case 'road':
      return g(<>
        <path d="M-60 40 L-16 -40 L16 -40 L60 40 Z" fill="#3a3f52" />
        <path d="M0 -34 L0 -20 M0 -8 L0 8 M0 20 L0 36" stroke="#ffc35a" strokeWidth={6} />
      </>);
    case 'phone':
      return g(<>
        <rect x={-30} y={-56} width={60} height={112} rx={12} fill="#1a2038" stroke={stroke} strokeWidth={5} />
        <path d="M40 -30 L70 -30 M58 -42 L70 -30 L58 -18" stroke="#4ee08a" strokeWidth={6} fill="none" strokeLinecap="round" />
      </>);
    case 'pole':
      return g(<>
        <rect x={-6} y={-56} width={12} height={112} fill="#8a6a4a" />
        <rect x={-40} y={-44} width={80} height={8} fill="#8a6a4a" />
        <path d="M-60 -40 Q0 -20 60 -40" stroke="#dfe5f5" strokeWidth={3} fill="none" />
      </>);
    case 'firestation':
      return g(<>
        <rect x={-56} y={-30} width={112} height={80} fill="#c44a4a" />
        <rect x={-30} y={4} width={60} height={46} fill="#3a3f52" />
        <path d="M-64 -30 L0 -60 L64 -30 Z" fill="#a33a3a" />
      </>);
    case 'house':
      return g(<>
        <path d="M-50 0 L0 -46 L50 0 L50 50 L-50 50 Z" fill={fill} stroke={stroke} strokeWidth={4} />
        <rect x={-14} y={14} width={28} height={36} fill={lit ? '#ffd27a' : '#1a2038'} />
      </>);
    case 'sky':
      return g(<>
        <path d="M-40 10 Q-40 -20 -10 -20 Q0 -40 24 -30 Q50 -30 46 0 Q60 10 40 24 L-36 24 Q-56 20 -40 10 Z" fill="#59648c" />
      </>);
    case 'thermo':
      return g(<>
        <rect x={-14} y={-60} width={28} height={96} rx={14} fill="#e8ebf2" />
        <circle cy={44} r={22} fill="#5aa9ff" />
        <rect x={-6} y={-40 + (1 - (lit ? 0.7 : 0.3)) * 60} width={12} height={(lit ? 0.7 : 0.3) * 60 + 40} fill="#5aa9ff" />
      </>);
    case 'building':
      return g(<>
        <rect x={-56} y={-50} width={112} height={100} rx={8} fill="#59648c" />
        {[-30, 0, 30].map((xx) => [-26, 6].map((yy) => <rect key={`${xx}${yy}`} x={xx - 10} y={yy} width={20} height={20} fill={lit ? '#ffd27a' : '#1a2038'} />))}
      </>);
    default:
      return null;
  }
};

// ---------- slots row (S013 on) ----------
const SLOT_LABELS: Record<Cat, string> = {falls: 'FALLS', fire: 'FIRE', co: 'CO', roads: 'ROADS', illness: 'ILLNESS', cold: 'COLD'};
const Slots: React.FC<{t: number; inT: number; glowFrom?: number; revealed: number; coldShown: boolean; lastGlow?: number}> = ({t, inT, glowFrom = -1, revealed, coldShown, lastGlow = -1}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    {CATS.map((c, i) => {
      const k = interpolate(t, [inT + i * 0.25, inT + i * 0.25 + 0.4], [0, 1], clamp);
      const x = COLX[c.id] - 8;
      const glow = glowFrom > 0 ? interpolate(t, [glowFrom + i * 0.7, glowFrom + i * 0.7 + 0.3, glowFrom + i * 0.7 + 0.9], [0, 1, 0], clamp) : 0;
      const g6 = i === 5 && lastGlow > 0 ? interpolate(t, [lastGlow, lastGlow + 0.3, lastGlow + 1.0], [0, 1, 0], clamp) : 0;
      const label = i < 5 ? `${c.label}${i < revealed ? '' : ' ?'}` : coldShown ? 'COLD' : '?';
      return (
        <g key={c.id} opacity={k} transform={`translate(${(1 - k) * -40},0)`}>
          <rect x={x} y={BASE + 2} width={5 * P + 14} height={10} rx={5} fill={glow + g6 > 0.05 ? C.amber : '#59648c'} style={{filter: glow + g6 > 0.05 ? `drop-shadow(0 0 ${14 * (glow + g6)}px ${C.amber})` : undefined}} />
          <text x={x + (5 * P + 14) / 2} y={BASE + 50} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={30} fill={i === 5 && coldShown ? C.cold : C.ink}>
            {label}
          </text>
        </g>
      );
    })}
  </svg>
);

// ---------- reusable overlays ----------
const At: React.FC<{t: number; at: number; children: (k: number) => React.ReactNode}> = ({t, at, children}) => <>{children(interpolate(t, [at, at + 0.35], [0, 1], clamp))}</>;
const Field: React.FC<{children?: React.ReactNode; tint?: string}> = ({children, tint = C.field}) => <AbsoluteFill style={{background: tint}}>{children}</AbsoluteFill>;
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    {children}
  </svg>
);
const RuleCard: React.FC<{text: string; t: number; at: number; top?: number; size?: number; color?: string}> = ({text, t, at, top = 150, size = 54, color = C.amber}) => (
  <At t={t} at={at}>{(k) => <Card lines={text.split(' · ')} top={top} size={size} color={color} k={k} width={1500} />}</At>
);

// --- cold-open labels over the grid (world coords via the same camera) ---
const OpenLabels: React.FC<{t: number; cam: Cam; fade?: number; pulse?: number; chipLit?: number}> = ({cam, fade = 1, pulse = 0, chipLit = 5}) => {
  const sx = (x: number) => 960 + (x - cam.cx) * cam.z;
  const sy = (y: number) => 540 + (y - cam.cy) * cam.z;
  const words = ['generators', 'grills', 'heaters', 'cars', 'blocked vents'];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: fade}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${Math.max(110, sx(330))},${Math.max(200, sy(150))}) scale(${Math.max(0.8, cam.z * 0.6)})`}>
          <Ico kind="generator" x={0} y={0} s={120} />
        </g>
      </svg>
      <Chip text="WHAT EVERYONE WARNS YOU ABOUT" x={Math.max(110, sx(330)) + 70 * Math.max(0.8, cam.z * 0.6)} y={Math.max(200, sy(150)) - 30} size={34} />
      <Chip text="CARBON MONOXIDE · ALL SOURCES · 19" x={Math.max(96, sx(468))} y={Math.min(880, sy(250 + 6 * P + 20))} size={32} />
      <div style={{position: 'absolute', left: Math.max(96, sx(468)), top: Math.min(940, sy(250 + 6 * P + 80)), display: 'flex', gap: 8, transform: `scale(${1 + 0.06 * pulse})`, transformOrigin: 'left center'}}>
        {words.map((wd, i) => (
          <span key={wd} style={{background: C.panel, borderRadius: 10, padding: '4px 12px', fontFamily: FONT, fontWeight: 800, fontSize: 24, color: i < chipLit ? C.amber : C.dim}}>
            {wd}
          </span>
        ))}
      </div>
      <Chip text="COLD · 161" x={Math.min(1824 - 260, sx(1200))} y={Math.max(54, sy(250) - 70)} size={40} color={C.cold} />
    </div>
  );
};

// ---------- the shots ----------
// cue shortcuts for the chapter starts
const N6 = s('Number six');
const N5 = s('Number five');
const N4 = s('Number four');
const N3 = s('Number three');
const N2 = s('Number two');
const N1 = s('Number one. The cold');

const openWordsLit = (t: number) => {
  const cues = [w('generators', 0, 0), w('grills', 0, 0), w('heaters', 0, 0), w('cars', 0, 0), w('blocked', 0, 0)];
  return cues.filter((c) => t >= c).length;
};

const SHOTS_RAW: Shot[] = [
  // COLD OPEN
  {t: 0, st: ST.open, cam: CAM.grid, O: ({t}) => <><OpenLabels t={t} cam={CAM.grid} chipLit={5} /><Source text={DSHS} /></>},
  {t: w('everyone'), st: ST.open, cam: CAM.gen, O: ({t}) => <><OpenLabels t={t} cam={CAM.gen} chipLit={5} /><Source text={DSHS} /></>},
  {t: w('but'), st: ST.open, cam: {cx: 520, cy: 320, z: 2.0}, O: ({t}) => <><OpenLabels t={t} cam={{cx: 520, cy: 320, z: 2.0}} /><Source text={DSHS} /></>},
  {t: w('carbon'), st: ST.open, cam: CAM.co, O: ({t}) => <><OpenLabels t={t} cam={CAM.co} pulse={interpolate(t, [w('every', 0, w('carbon')), w('every', 0, w('carbon')) + 0.2, w('every', 0, w('carbon')) + 0.5], [0, 1, 0], clamp)} /><Source text={DSHS} /></>},
  {t: w('generators'), st: ST.open, cam: {cx: 560, cy: 400, z: 2.6}, O: ({t}) => <><OpenLabels t={t} cam={{cx: 560, cy: 400, z: 2.6}} chipLit={openWordsLit(t)} /><Source text={DSHS} /></>},
  {t: s('The cold cost'), st: ST.open, cam: CAM.cold, O: ({t}) => <><Chip text="COLD · 161" x={1200} y={150} size={56} color={C.cold} /><Source text={DSHS} /></>},
  {t: s('More than eight'), st: ST.open, cam: CAM.grid, O: ({t}) => <><OpenLabels t={t} cam={CAM.grid} /><At t={t} at={w('eight')}>{(k) => <Chip text="161 ÷ 19 = MORE THAN 8×" x={1300} y={80} size={46} k={k} color={C.amber} />}</At><Source text={DSHS} /></>},
  {t: s('Why the cold'), st: ST.open, cam: CAM.grid, O: () => <><AbsoluteFill style={{background: 'rgba(8,11,22,0.6)'}} /><Card lines={['WHY THE COLD?']} top={430} size={90} width={900} /><Source text={DSHS} /></>},
  {t: s('The answer changes'), st: ST.plain, cam: {cx: 960, cy: 330, z: 1.7}, O: () => <Source text={DSHS} />},
  // THE COUNT
  {t: s('The Texas Department'), st: ST.plain, cam: {cx: 900, cy: 330, z: 1.4}, O: ({t, t0}) => <><ReportCover k={interpolate(t, [t0, t0 + 0.8], [0, 1], clamp)} /><Source text={DSHS} /></>},
  {t: w('that', 0, s('The Texas Department')), st: ST.plain, cam: {cx: 900, cy: 320, z: 1.35}, O: () => <><ReportCover k={1} /><Source text={DSHS} /></>},
  {t: s('Two hundred forty six'), st: ST.plain, cam: CAM.wide, O: () => <><Card lines={['TEXAS · FEBRUARY 2021 · 246 CONFIRMED STORM-RELATED DEATHS']} top={80} size={46} width={1600} /><Source text={DSHS} /></>},
  {t: s('Then it sorted'), st: ST.plain, cam: CAM.slots, slots: true, O: () => <Source text={DSHS} />},
  {t: s("We'll go from"), st: ST.plain, cam: CAM.slots, slots: true, O: () => <Source text={DSHS} />},
  {t: w('and', 0, w('each')), st: ST.plain, cam: {cx: 1450, cy: 800, z: 1.8}, slots: true, O: () => <Source text={DSHS} />},
  {t: s('One is hiding'), O: () => <Field><Svg><HouseWall vent /></Svg></Field>},
  {t: s('Most of the others'), st: ST.plain, cam: CAM.slots, slots: true, O: () => <Source text={DSHS} />},
  {t: s('Each cube'), st: ST.plain, cam: {cx: 900, cy: 330, z: 2.4}, O: () => <Source text={DSHS} />},
  {t: s('This is the count'), st: ST.plain, cam: {cx: 960, cy: 330, z: 1.6}, O: ({t}) => <><CountChips t={t} /><Source text={DSHS} /></>},
  {t: s("We don't add"), st: ST.plain, cam: {cx: 960, cy: 330, z: 1.6}, O: ({t}) => <><CountChips t={t} /><Source text={DSHS} /></>},
  {t: s('And the biggest'), st: ST.plain, cam: {cx: 1500, cy: 820, z: 2.2}, slots: true, O: () => <Source text={DSHS} />},
  // #6 FALLS
  {t: N6, st: ST.ch(1), cam: CAM.slots, slots: true, O: () => <><Title text="#6 FALLS · 9" /><Source text={DSHS} /></>},
  {t: s('The report lists slips'), st: ST.ch(1), cam: CAM.col('falls'), slots: true, O: ({t}) => <><FallsChips t={t} /><Source text={DSHS} /></>},
  {t: s("That's part of why"), st: ST.ch(1), cam: CAM.col('falls'), slots: true, O: ({t}) => <><DateStrip t={t} /><Source text={DSHS} /></>},
  {t: s('The dates on it'), st: ST.ch(1), cam: CAM.col('falls'), slots: true, O: ({t}) => <><DateStrip t={t} run /><Source text={DSHS} /></>},
  {t: s('The CDC says many'), O: ({t, t0}) => <Field><Svg><Walk t={t} t0={t0} focus={0} /></Svg><Source text={CDC_WS} /></Field>},
  {t: w('steps', 0, s('The CDC says many')), O: ({t, t0}) => <Field><Svg><Walk t={t} t0={t0} focus={1} /></Svg><Source text={CDC_WS} /></Field>},
  {t: s('So the rule here is the simplest'), O: ({t, t0}) => <Field><Svg><Walk t={t} t0={t0} focus={2} glint /></Svg><Source text={CDC_WS} /></Field>},
  {t: s('Stay off the ice'), O: ({t, t0}) => <Field><Svg><Walk t={t} t0={t0} focus={2} /></Svg><RuleCard t={t} at={t0} text="STAY OFF THE ICE" /><Source text={CDC_WS} /></Field>},
  {t: s('And if you have to go out'), O: ({t, t0}) => <Field><Svg><Walk t={t} t0={t0} focus={2} salt={interpolate(t, [w('salt'), w('salt') + 1.2], [0, 1], clamp)} /></Svg><RuleCard t={t} at={0} text="STAY OFF THE ICE" /><Source text={CDC_WS} /></Field>},
  {t: w('and', 0, w('ice', 1, w('salt'))), O: ({t, t0}) => <Field><Svg><Walk t={t} t0={t0} focus={1} salt={1} sand={interpolate(t, [w('sand'), w('sand') + 1.2], [0, 1], clamp)} /></Svg><RuleCard t={t} at={w('sand')} text="STAY OFF THE ICE · SALT OR SAND ON STEPS" /><Source text={CDC_WS} /></Field>},
  // #5 FIRE
  {t: N5, st: ST.ch(2), cam: CAM.slots, slots: true, O: () => <><Title text="#5 FIRE · 10" /><Source text={DSHS} /></>},
  {t: s('The report describes'), st: ST.ch(2), cam: CAM.col('fire'), slots: true, O: ({t}) => <><At t={t} at={w('house', 0, N5)}>{(k) => <Chip text="house fires" x={640} y={300} size={44} k={k} />}</At><At t={t} at={w('space', 0, N5)}>{(k) => <Chip text="space heaters too close to things that burn" x={640} y={380} size={44} k={k} />}</At><Source text={DSHS} /></>},
  {t: w('and', 0, w('house', 0, N5)), st: ST.ch(2), cam: CAM.col('fire', 2.0), slots: true, O: ({t}) => <><Chip text="house fires" x={640} y={300} size={44} /><At t={t} at={w('space', 0, N5)}>{(k) => <Chip text="space heaters too close to things that burn" x={640} y={380} size={44} k={k} />}</At><Source text={DSHS} /></>},
  {t: s("And here's the thread"), O: () => <Field><Svg><Ico kind="plug" x={960} y={520} s={180} /></Svg></Field>},
  {t: s('When the power went out'), O: ({t}) => <Field><Svg><Ico kind="plug" x={760} y={520} s={160} lit={t < w('out', 0, s('When the power went out'))} /><Ico kind="thermostat" x={1160} y={520} s={160} lit={t < w('regular')} /></Svg></Field>},
  {t: s('So people reached'), O: ({t, t0}) => <Field><Svg><Thread t={t} t0={t0} /></Svg><At t={t} at={w('other', 0, t0)}>{(k) => <Chip text="other heat" x={1260} y={250} size={44} k={k} />}</At><Source text={DSHS} /></Field>},
  {t: s('The rule here is about distance'), O: ({t, t0}) => <Field><Svg><Floor t={t} t0={t0} ring={0} /></Svg><Source text={USFA} /></Field>},
  {t: w('fire', 0, s('The rule here is about distance')), O: ({t, t0}) => <Field><Svg><Floor t={t} t0={t0} ring={interpolate(t, [t0, t0 + 1.5], [0, 1], clamp)} /></Svg><Source text={USFA} /></Field>},
  {t: w('from', 0, w('three', 0, N5)), O: ({t, t0}) => <Field><Svg><Floor t={t} t0={t0} ring={1} slide={interpolate(t, [t0, t0 + 1.4], [0, 1], clamp)} /></Svg><Source text={USFA} /></Field>},
  {t: s('That means space heaters'), O: ({t, t0}) => <Field><Svg><FourSources t={t} t0={t0} /></Svg><Source text={USFA} /></Field>},
  {t: s('And turn a space heater off'), O: ({t}) => <Field><Svg><Ico kind="heater" x={960} y={520} s={260} off={t > w('off', 0, s('And turn a space heater off'))} /></Svg><Source text={USFA} /></Field>},
  {t: w('when', 0, s('And turn a space heater off')), O: ({t}) => <Field><Svg><Ico kind="heater" x={560} y={540} s={220} off /></Svg><At t={t} at={w('leave')}>{(k) => <Card lines={['LEAVING THE ROOM']} top={380} size={56} width={760} left={900} k={k} />}</At><At t={t} at={w('bed')}>{(k) => <Card lines={['GOING TO BED → OFF']} top={510} size={56} width={760} left={900} k={k} />}</At><Source text={USFA} /></Field>},
  {t: s('Neither of those'), O: () => <Field><Card lines={['AT LEAST 3 FEET FROM ANYTHING THAT BURNS', 'OFF WHEN YOU LEAVE OR SLEEP']} top={380} size={58} color={C.amber} width={1500} /><Source text={USFA} /></Field>},
  // #4 CO
  {t: N4, st: ST.ch(3), cam: CAM.slots, slots: true, O: () => <><Title text="#4 CARBON MONOXIDE · 19" /><Source text={DSHS} /></>},
  {t: s('This is the one everyone'), st: ST.ch(3), cam: CAM.col('co', 1.7), slots: true, O: ({t}) => <><FiveSources t={t} lit={0} /><Source text={DSHS} /></>},
  {t: s('Generators. Grills', N4), st: ST.ch(3), cam: CAM.col('co', 1.7), slots: true, O: ({t}) => <><FiveSources t={t} lit={[w('generators', 0, N4), w('grills', 0, N4), w('heaters', 0, N4), w('cars', 0, N4)].filter((c) => t >= c).length} /><Source text={DSHS} /></>},
  {t: s("And one that's"), st: ST.ch(3), cam: CAM.col('co', 1.7), slots: true, O: ({t}) => <><FiveSources t={t} lit={t >= w('ice', 0, s("And one that's")) ? 5 : 4} glow={t >= w('ice', 0, s("And one that's"))} /><Source text={DSHS} /></>},
  {t: s("You've heard the generator"), O: () => <Field><Svg><Ico kind="generator" x={960} y={520} s={260} /></Svg></Field>},
  {t: s('Outside, at least'), O: () => <Field><Card lines={['OUTSIDE · AT LEAST 20 FT FROM WINDOWS, DOORS & VENTS', 'NEVER IN THE GARAGE — CDC']} top={360} size={54} color={C.amber} width={1600} /><Source text="CDC" /></Field>},
  {t: s("So let's talk about the vent"), O: ({t, t0}) => <Field><Svg><g transform={`translate(960,540) scale(${ez(t * 30, t0 * 30, t0 * 30 + 50, 1.4, 3.2)})`}><Ico kind="vent" x={0} y={0} s={120} /></g></Svg></Field>},
  {t: s('Gas heating equipment sends'), O: ({t, t0}) => <Field><Svg><VentCut t={t} ice={0} back={0} /></Svg></Field>},
  {t: s('If ice or snow'), O: ({t, t0}) => <Field><Svg><VentCut t={t} ice={interpolate(t, [t0, t0 + 2], [0, 1], clamp)} back={0} /></Svg></Field>},
  {t: s('The Massachusetts'), O: ({t, t0}) => <Field><Svg><VentCut t={t} ice={1} back={interpolate(t, [t0, t0 + 3], [0, 1], clamp)} /></Svg><Source text={MDFS} /></Field>},
  {t: w('this', 0, s('The Massachusetts')), O: ({t}) => <Field><Svg><g opacity={0.35}><VentCut t={t} ice={1} back={1} /></g></Svg><Card lines={['“If the vent or flue is blocked, this poisonous gas', 'can reach deadly levels inside the home.”']} top={360} size={52} width={1600} /><Source text={MDFS} /></Field>},
  {t: s('What you can do comes'), O: ({t, t0}) => <Field><Svg><HouseOutline t={t} t0={t0} markers={0} path={0} /></Svg><Source text={MDFS} /></Field>},
  {t: s('Know where the vents'), O: ({t, t0}) => <Field><Svg><HouseOutline t={t} t0={t0} markers={interpolate(t, [t0, t0 + 2.4], [0, 3], clamp)} path={0} /></Svg><Source text={MDFS} /></Field>},
  {t: s('Walk around'), O: ({t, t0}) => <Field><Svg><HouseOutline t={t} t0={t0} markers={3} path={interpolate(t, [t0, t0 + 3], [0, 1], clamp)} /></Svg><At t={t} at={w('walk', 0, t0)}>{(k) => <Chip text="walk around once and find them" x={1180} y={180} size={42} k={k} />}</At><Source text={MDFS} /></Field>},
  {t: s('Then, every time'), O: ({t, t0}) => <Field><Svg><HouseOutline t={t} t0={t0} markers={3} path={1} shovel={interpolate(t, [t0, t0 + 2.6], [0, 1], clamp)} /></Svg><Source text={MDFS} /></Field>},
  {t: s('It takes a minute'), O: ({t}) => <Field><Svg><VentCut t={t} ice={0} back={0} /></Svg><Source text={MDFS} /></Field>},
  {t: w('and', 0, w('minute', 0, N4)), O: () => <Field><Card lines={['KNOW WHERE YOUR VENTS ARE', 'CLEAR THEM WHEN YOU SHOVEL']} top={380} size={60} color={C.amber} width={1300} /><Source text={MDFS} /></Field>},
  // #3 ROADS
  {t: N3, st: ST.ch(3), cam: CAM.slots, slots: true, O: () => <><Title text="#3 ROADS · 22" /><Source text={DSHS} /></>},
  {t: w('twenty', 0, N3), st: ST.ch(4), cam: CAM.col('roads', 1.9), slots: true, O: () => <Source text={DSHS} />},
  {t: s('But this one has'), st: ST.ch(4), cam: {cx: 900, cy: 760, z: 2.0}, slots: true, O: () => <Source text={DSHS} />},
  {t: s('Look at the dates'), st: ST.ch(4), cam: {cx: 960, cy: 700, z: 1.6}, slots: true, O: ({t, t0}) => <><RoadStrip t={t} t0={t0} line={-1} /><Source text={ROADS_SRC} /></>},
  {t: s('Fourteen'), st: ST.ch(4, {roadsOnDate: 1}), cam: {cx: 960, cy: 700, z: 1.6}, slots: true, O: ({t, t0}) => <><RoadStrip t={t} t0={t0} line={-1} /><Source text={ROADS_SRC} /></>},
  {t: s("That's days before"), st: ST.ch(4, {roadsOnDate: 1}), cam: {cx: 980, cy: 690, z: 1.5}, slots: true, O: ({t, t0}) => <><RoadStrip t={t} t0={t0} line={w('fifteenth', 0, t0)} /><Source text={ROADS_SRC} /></>},
  {t: s('So these deaths'), st: ST.ch(4, {roadsOnDate: 1}), cam: {cx: 980, cy: 690, z: 1.5}, slots: true, O: ({t, t0}) => <><RoadStrip t={t} t0={t0} line={0} label /><Source text={ROADS_SRC} /></>},
  {t: s('The report calls'), st: ST.ch(4), cam: CAM.col('roads', 1.8), slots: true, O: () => <Source text={ROADS_SRC} />},
  {t: s("The CDC's advice"), O: ({t, t0}) => <Field><Svg><Roads t={t} t0={t0} focus={0} /></Svg><Source text={CDC_WS} /></Field>},
  {t: w('overpasses', 0, s("The CDC's advice")), O: ({t, t0}) => <Field><Svg><Roads t={t} t0={t0} focus={1} /></Svg><Source text={CDC_WS} /></Field>},
  {t: s('Ready.gov puts it'), O: ({t, t0}) => <Field><Svg><Roads t={t} t0={t0} focus={1} empty /></Svg><RuleCard t={t} at={w('stay', 0, t0)} text="STAY OFF THE ROADS IF YOU CAN" /><Source text={READY_WW} /></Field>},
  {t: s('And if you get stuck'), O: ({t, t0}) => <Field><Svg><StuckCar t={t} snow={1} /></Svg><RuleCard t={t} at={0} text="STAY OFF THE ROADS IF YOU CAN · IF STUCK, STAY IN THE CAR" /><Source text={READY_WW} /></Field>},
  {t: s('The CDC adds'), O: ({t}) => <Field><Svg><g transform="translate(-420,-200) scale(1.5)"><StuckCar t={t} snow={1} /></g></Svg><Source text="CDC" /></Field>},
  {t: w('blocking', 0, s('The CDC adds')) - 0.6, O: ({t, t0}) => <Field><Svg><StuckCar t={t} snow={interpolate(t, [t0, t0 + 1.4], [1, 0], clamp)} exhaust={t > t0 + 1.4} /></Svg><RuleCard t={t} at={t0 + 1.5} text="STAY OFF THE ROADS IF YOU CAN · IF STUCK, STAY IN THE CAR · KEEP THE EXHAUST PIPE CLEAR" size={48} /><Source text={ROADS_SRC} /></Field>},
  // #2 ILLNESS
  {t: N2, st: ST.ch(5), cam: CAM.slots, slots: true, O: () => <><Title text="#2 ILLNESS MADE WORSE · 25" /><Source text={DSHS} /></>},
  {t: s('Lung, kidney'), st: ST.ch(5), cam: CAM.col('illness', 1.9), slots: true, O: ({t}) => <><IllChips t={t} /><Source text={DSHS} /></>},
  {t: s('The report lists what'), O: ({t}) => <Field><Svg><DeviceRow t={t} stage={0} /></Svg><Source text={DSHS} /></Field>},
  {t: s('Dialysis or oxygen'), O: ({t}) => <Field><Svg><DeviceRow t={t} stage={2} /></Svg><Source text={DSHS} /></Field>},
  {t: s('Medical devices and medicine froze'), O: ({t}) => <Field><Svg><DeviceRow t={t} stage={3} /></Svg><Source text={DSHS} /></Field>},
  {t: s('Hospice care'), O: ({t}) => <Field><Svg><DeviceRow t={t} stage={4} /></Svg><Source text={DSHS} /></Field>},
  {t: s('And some people lost power'), O: ({t}) => <Field><Svg><DeviceRow t={t} stage={5} offAt={w('lost', 0, s('And some people lost power'))} /></Svg><Source text={DSHS} /></Field>},
  {t: s("Here's why this one"), O: ({t}) => <Field><Svg><DeviceRow t={t} stage={5} offAt={0} /></Svg><Source text={DSHS} /></Field>},
  {t: s('None of it looks'), O: ({t}) => <Field><Svg><Calm t={t} iceOff={9999} fireOff={9999} /></Svg></Field>},
  {t: s('Nobody slips'), O: ({t}) => <Field><Svg><Calm t={t} iceOff={w('slips')} fireOff={w('fire', 0, s('Nobody slips'))} /></Svg></Field>},
  {t: s('But a machine'), O: ({t, t0}) => <Field><Svg><Ico kind="device" x={960} y={520} s={ez(t * 30, t0 * 30, t0 * 30 + 90, 220, 260)} off={t > w('stops', 0, t0)} /></Svg></Field>},
  {t: s('A medicine freezes'), O: ({t, t0}) => <Field><Svg><Ico kind="device" x={820} y={520} s={220} off /><Ico kind="medicine" x={1120} y={520} s={220} frost={interpolate(t, [t0, t0 + 3], [0, 1], clamp)} /></Svg></Field>},
  {t: s("And that's exactly why"), st: ST.ch(5), cam: {cx: 1160, cy: 640, z: 1.2}, slots: true, O: () => <Source text={DSHS} />},
  {t: s("This isn't medical advice"), st: ST.ch(5), cam: {cx: 1160, cy: 640, z: 1.2}, slots: true, O: () => <SidePanel />},
  {t: s("It's what the FDA"), st: ST.ch(5), cam: {cx: 1160, cy: 640, z: 1.2}, slots: true, O: () => <><SidePanel /><Source text={DEV_SRC} /></>},
  {t: s('Talk to your medical'), O: ({t, t0}) => <Field><RuleCard t={t} at={w('talk', 0, t0)} text="MAKE AN OUTAGE PLAN WITH YOUR PROVIDER" /><Source text={DEV_SRC} /></Field>},
  {t: s('Tell your electric'), O: ({t, t0}) => <Field><Card lines={['MAKE AN OUTAGE PLAN WITH YOUR PROVIDER']} top={150} size={54} color={C.amber} width={1500} /><Svg><At t={t} at={w('electric', 0, t0)}>{(k) => <Ico kind="pole" x={760} y={560} s={160} k={k} />}</At><At t={t} at={w('fire', 0, t0)}>{(k) => <Ico kind="firestation" x={1160} y={560} s={160} k={k} />}</At></Svg><At t={t} at={w('fire', 0, t0)}>{(k) => <Card lines={['TELL YOUR ELECTRIC COMPANY AND FIRE DEPARTMENT']} top={720} size={50} color={C.amber} width={1500} k={k} />}</At><Source text={DEV_SRC} /></Field>},
  {t: s('And the FDA says'), O: () => <Field><Svg><Ico kind="device" x={960} y={540} s={260} /></Svg><Source text={DEV_SRC} /></Field>},
  {t: w('seek', 0, s('And the FDA says')), O: ({t, t0}) => <Field><RuleCard t={t} at={t0} text="IF YOU DEPEND ON A DEVICE TO STAY ALIVE: SEEK EMERGENCY SERVICES RIGHT AWAY" size={48} /><Source text={DEV_SRC} /></Field>},
  {t: s('And if you can, ask'), O: ({t, t0}) => <Field><Card lines={['IF YOU DEPEND ON A DEVICE TO STAY ALIVE:', 'SEEK EMERGENCY SERVICES RIGHT AWAY']} top={120} size={48} color={C.amber} width={1600} /><At t={t} at={w('ask', 0, t0)}>{(k) => <Card lines={['ASK YOUR PUBLIC HEALTH OFFICE ABOUT EVACUATING BEFORE THE STORM — FDA']} top={330} size={44} color={C.amber} width={1600} k={k} />}</At><Svg><Route t={t} t0={t0} y={700} /></Svg><Source text={DEV_SRC} /></Field>},
  {t: s('If someone you love'), O: () => <Field><Svg><Ico kind="oxygen" x={640} y={540} s={180} /><Ico kind="dialysis" x={900} y={540} s={180} /><Ico kind="phone" x={1220} y={540} s={200} /></Svg><Source text={DEV_SRC} /></Field>},
  {t: s('In Texas'), O: ({t}) => <Field><Stear t={t} /><Source text={DEV_SRC} /></Field>},
  {t: s('Sign up online'), O: ({t}) => <Field><Stear t={t} /><Source text={DEV_SRC} /></Field>},
  {t: s("It doesn't guarantee"), O: ({t}) => <Field><Stear t={t} /><Source text={DEV_SRC} /></Field>},
  {t: s('Outside Texas'), O: ({t, t0}) => <Field><Stear t={t} /><At t={t} at={t0}>{(k) => <Chip text="OUTSIDE TEXAS: ASK YOUR UTILITY & COUNTY IF THEY HAVE A LIST LIKE THIS" x={180} y={800} size={36} k={k} />}</At><Source text={DEV_SRC} /></Field>},
  // #1 COLD
  {t: N1, st: ST.ch(5), cam: CAM.wide, slots: true, O: () => <><Title text="#1 COLD · 161" top={110} /><Source text={T3} /></>},
  {t: s('One hundred sixty one deaths'), st: ST.ch(6), cam: CAM.wide, slots: true, O: () => <Source text={T3} />},
  {t: s('One hundred fifty eight'), st: ALL, cam: CAM.wide, slots: true, O: () => <Source text={T3} />},
  {t: s("That's more than every"), st: ALL, cam: CAM.wide, slots: true, O: () => <Source text={T3} />},
  {t: s('Falls, fire'), st: ST.ch(6, {merged: true}), cam: CAM.wide, slots: false, O: ({t}) => <><At t={t} at={w('five', 0, w('eighty'))}>{(k) => <><Chip text="COLD 161" x={1440} y={60} size={44} color={C.cold} k={k} /><Chip text="ALL OTHER CAUSES 85" x={1050} y={460} size={40} k={k} /></>}</At><Source text={T3} /></>},
  {t: s("And it's more than eight"), st: ST.ch(6, {coBeside: true}), cam: CAM.wide, slots: true, O: ({t}) => <><At t={t} at={w('eight', 0, s("And it's more than eight"))}>{(k) => <Chip text="161 ÷ 19 = MORE THAN 8×" x={700} y={200} size={48} color={C.amber} k={k} />}</At><Source text={T3} /></>},
  {t: s('Carbon monoxide is a real'), st: ST.ch(6, {coBeside: true}), cam: {cx: 1380, cy: 560, z: 1.25}, slots: true, O: () => <Source text={T3} />},
  {t: s('The state also sorted'), st: ALL, cam: CAM.wide, slots: true, O: ({t, t0}) => <><Bins t={t} t0={t0} /><Source text={T3} /></>},
  {t: s('One hundred forty eight deaths'), st: ST.ch(6, {direct: true}), cam: CAM.wide, slots: true, O: () => <Source text={T3} />},
  {t: s('All one hundred forty eight'), st: ST.ch(6, {direct: true}), cam: {cx: 1510, cy: 560, z: 1.5}, slots: true, O: () => <Source text={T3} />},
  {t: s('Everything else'), st: ST.ch(6, {direct: true}), cam: {cx: 760, cy: 760, z: 1.4}, slots: true, O: ({t, t0}) => <><Flicks t={t} t0={t0} /><Source text={T3} /></>},
  {t: w('was', 0, w('stopped')), st: ST.ch(6, {direct: true}), cam: {cx: 760, cy: 760, z: 1.4}, slots: true, O: () => <><DashedCols /><Chip text="indirect or possible" x={500} y={560} size={40} /><Source text={T3} /></>},
  {t: s("In the state's count"), st: ST.ch(6, {direct: true}), cam: CAM.wide, slots: true, O: () => <><DashedCols wide /><Source text={T3} /></>},
  {t: w('was', 0, s("In the state's count")), st: ST.ch(6, {direct: true}), cam: {cx: 1510, cy: 500, z: 1.4}, slots: true, O: () => <Source text={T3} />},
  {t: s('Now look at who'), st: ALL, cam: {cx: 1510, cy: 540, z: 1.25}, slots: true, O: () => <Source text={T3} />},
  {t: s('Of the one hundred fifty eight'), st: ST.ch(6, {who: true}), cam: {cx: 1510, cy: 540, z: 1.25}, slots: true, O: ({t}) => <><At t={t} at={w('seven', 0, s('Of the one hundred fifty eight'))}>{(k) => <Chip text="60 OR OLDER · 107 of 158" x={1050} y={300} size={44} k={k} />}</At><Source text={T3} /></>},
  {t: s('Across all'), st: ST.ch(6, {who: true}), cam: {cx: 1300, cy: 560, z: 1.1}, slots: true, O: ({t, t0}) => <><Chip text="60 OR OLDER · 107 of 158" x={1050} y={300} size={44} /><At t={t} at={t0 + 0.5}>{(k) => <Chip text="all causes: 147 of 246 were 60+ (from Table 2)" x={300} y={380} size={36} k={k} />}</At><Source text={T2} /></>},
  {t: s('So if your mom'), O: () => <Field><Svg><Ico kind="phone" x={960} y={540} s={260} /></Svg></Field>},
  {t: s("The CDC's rule is short"), O: ({t, t0}) => <Field><Svg><Ico kind="phone" x={ez(t * 30, t0 * 30, t0 * 30 + 30, 960, 400)} y={540} s={220} /><circle cx={960} cy={540} r={interpolate(t, [t0, t0 + 1.5], [80, 300], clamp)} fill="none" stroke="#4ee08a" strokeWidth={4} opacity={interpolate(t, [t0, t0 + 1.5], [0.8, 0], clamp)} /></Svg><Source text={CDC_WS} /></Field>},
  {t: s('Check on older'), O: () => <Field><Card lines={['“Check on older friends and neighbors often', 'to make sure their homes are heated properly.”']} top={380} size={54} width={1500} /><Source text={CDC_WS} /></Field>},
  {t: s('The report lists the county'), O: () => <Field><Chip text="COUNTY: YES" x={820} y={480} size={56} /><Source text={DSHS} /></Field>},
  {t: s('At home, outside'), O: ({t, t0}) => <Field><Svg>{['house', 'sky', 'car'].map((k2, i) => <At key={k2} t={t} at={t0 + i * 0.6}>{(k) => <g><Ico kind={k2} x={640 + i * 320} y={480} s={160} k={k} /><text x={640 + i * 320} y={640} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={70} fill={C.amber} opacity={k}>?</text></g>}</At>)}</Svg><At t={t} at={w('say', 0, t0)}>{(k) => <Chip text="PLACE: NOT IN THE REPORT" x={680} y={760} size={48} k={k} />}</At><Source text={DSHS} /></Field>},
  {t: s('What it does list'), O: ({t}) => <Field><Risk t={t} n={0} /><Source text={DSHS} /></Field>},
  {t: s('Doing repairs'), O: ({t}) => <Field><Risk t={t} n={[w('repairs'), w('clothes'), w('homelessness')].filter((c) => t >= c).length} /><Source text={DSHS} /></Field>},
  {t: s("And one more we'll"), O: ({t}) => <Field><Risk t={t} n={3} /><Source text={DSHS} /></Field>},
  // WHY THE COLD
  {t: s("So here's the answer"), st: ST.plain, cam: CAM.grid, O: ({t}) => <><AbsoluteFill style={{background: 'rgba(8,11,22,0.6)'}} /><At t={t} at={w('why', 0, s("So here's the answer"))}>{(k) => <Card lines={['WHY THE COLD?']} top={430} size={90} width={900} k={k} />}</At></>},
  {t: s("The report doesn't explain"), O: ({t}) => <Field><OurRead t={t} at={w('read')} /><Card lines={['WHY THE COLD?']} top={150} size={60} width={700} /></Field>},
  {t: s('Most of the other chapters'), O: ({t}) => <Field><OurRead t={t} at={0} /><Moments t={t} n={0} /></Field>},
  {t: s('A heater too close'), O: ({t}) => <Field><OurRead t={t} at={0} /><Moments t={t} n={1} /></Field>},
  {t: s('A blocked vent'), O: ({t}) => <Field><OurRead t={t} at={0} /><Moments t={t} n={[w('blocked', 0, s('A blocked vent')), w('icy', 0, s('A blocked vent'))].filter((c) => t >= c).length + 1} /></Field>},
  {t: s('The cold often'), O: ({t, t0}) => <Field><OurRead t={t} at={0} /><Svg><FallingThermo t={t} t0={t0} /></Svg></Field>},
  {t: s('The fourth risk factor'), O: ({t, t0}) => <Field><OurRead t={t} at={0} /><Svg><FallingThermo t={t} t0={t0 - 4} small /></Svg><Risk t={t} n={3} top={640} /><Source text={DSHS} /></Field>},
  {t: w('was', 0, s('The fourth risk factor')), O: ({t, t0}) => <Field><OurRead t={t} at={0} /><Risk t={t} n={3} top={640} /><At t={t} at={w('refusing')}>{(k) => <Card lines={['THE STATE’S WORDING: “REFUSING TO EVACUATE TO HEATED', 'SHELTERING OR WARMING CENTERS” — TEXAS DSHS']} top={300} size={44} width={1600} k={k} />}</At><Source text={DSHS} /></Field>},
  // THE RULE FOR #1
  {t: s('And that changes what you do'), O: ({t, t0}) => <Field><Svg><MapRoute t={t} t0={t0} houseOff={9999} route={0} /></Svg></Field>},
  {t: s('If the cold is extreme'), O: ({t, t0}) => <Field><Svg><MapRoute t={t} t0={t0} houseOff={w('out', 0, t0)} route={0} /></Svg><Source text={READY_PO} /></Field>},
  {t: w('ready', 0, s('If the cold is extreme')), O: ({t, t0}) => <Field><Svg><MapRoute t={t} t0={t0} houseOff={0} route={interpolate(t, [t0, t0 + 2.5], [0, 1], clamp)} /></Svg><RuleCard t={t} at={w('go', 0, t0)} text="EXTREME COLD AND NO POWER? GO TO A COMMUNITY LOCATION WITH POWER" size={46} top={90} /><Source text={READY_PO} /></Field>},
  {t: s('It also says to check'), O: ({t, t0}) => <Field><Svg><MapRoute t={t} t0={t0} houseOff={0} route={1} /></Svg><Card lines={['EXTREME COLD AND NO POWER? GO TO A COMMUNITY LOCATION WITH POWER', 'CHECK WITH LOCAL OFFICIALS ABOUT WARMING CENTERS — READY.GOV']} top={90} size={42} color={C.amber} width={1700} /><Source text={READY_PO} /></Field>},
  {t: s('Find yours before'), O: ({t, t0}) => <Field><Svg><g transform={`translate(${-ez(t * 30, t0 * 30, t0 * 30 + 120, 0, 500)},${-ez(t * 30, t0 * 30, t0 * 30 + 120, 0, 240)}) scale(${ez(t * 30, t0 * 30, t0 * 30 + 120, 1, 1.4)})`}><MapRoute t={t} t0={t0} houseOff={0} route={1} /></g></Svg><Card lines={['EXTREME COLD AND NO POWER? GO TO A COMMUNITY LOCATION WITH POWER', 'CHECK WITH LOCAL OFFICIALS ABOUT WARMING CENTERS — READY.GOV']} top={90} size={42} color={C.amber} width={1700} /><Source text={READY_PO} /></Field>},
  {t: s('But remember the roads'), O: ({t, t0}) => <Field><Svg><MapRoute t={t} t0={t0} houseOff={0} route={1} overpass /></Svg></Field>},
  {t: s('The CDC says to avoid'), O: ({t, t0}) => <Field><TwoCards t={t} rightAt={t0} /><Source text="CDC; Ready.gov" /></Field>},
  {t: w('and', 0, w('possible', 0, s('The CDC says to avoid'))), O: ({t, t0}) => <Field><TwoCards t={t} rightAt={0} inset={interpolate(t, [t0, t0 + 0.4, t0 + 1.2], [0, 1, 0.6], clamp)} /><Source text="CDC; Ready.gov" /></Field>},
  {t: s('Those two rules'), O: ({t, t0}) => <Field><TwoCards t={t} rightAt={0} inset={0.6} apart={interpolate(t, [t0, t0 + 2], [0, 1], clamp)} /><Source text="CDC; Ready.gov" /></Field>},
  {t: s("So here's our take"), O: ({t, t0}) => <Field><TwoCards t={t} rightAt={0} inset={0.6} apart={1} /><At t={t} at={w('take', 0, t0)}>{(k) => <Chip text="OUR TAKE" x={96} y={560} size={36} k={k} color={C.amber} />}</At><At t={t} at={w('make', 0, t0)}>{(k) => <Card lines={['MAKE THE PLAN BEFORE THE STORM: WHERE · HOW YOU’D GET THERE']} top={640} size={46} width={1600} k={k} />}</At></Field>},
  {t: s('Know where you would go'), O: ({t, t0}) => <Field><Svg><MapRoute t={t} t0={t0} houseOff={0} route={interpolate(t, [w('how', 0, t0), w('how', 0, t0) + 1.5], [0, 1], clamp)} glow={t > w('where', 0, t0)} /></Svg><Chip text="OUR TAKE" x={96} y={90} size={36} color={C.amber} /><Card lines={['MAKE THE PLAN BEFORE THE STORM: WHERE · HOW YOU’D GET THERE']} top={160} size={42} width={1500} /></Field>},
  {t: s("And again, we're not doctors"), O: ({t, t0}) => <Field><Svg><BigThermo t={t} mark={0} /></Svg><Chip text="not medical advice" x={1180} y={300} size={36} /><Source text={CDC_WS} /></Field>},
  {t: s('A body temperature'), O: ({t, t0}) => <Field><Svg><BigThermo t={t} mark={interpolate(t, [w('ninety'), w('ninety') + 0.5], [0, 1], clamp)} /></Svg><At t={t} at={w('ninety', 0, t0)}>{(k) => <Card lines={['BODY TEMP BELOW 95°F = EMERGENCY — CDC']} top={380} size={52} width={900} left={900} color={C.amber} k={k} />}</At><Chip text="not medical advice" x={1180} y={540} size={36} /><Source text={CDC_WS} /></Field>},
  {t: s('The report also noted'), O: () => <Field><Svg><g transform="translate(-360,40) scale(0.8)"><BigThermo t={0} mark={1} /></g></Svg><Chip text="22 of 158 hypothermia deaths:" x={620} y={430} size={40} /><Chip text="history of alcohol abuse, or drinking during the storm" x={620} y={510} size={36} /><Source text={DSHS} /></Field>},
  {t: s('One more tip'), O: ({t, t0}) => <Field><Svg><HeatLines t={t} t0={t0} /></Svg><Source text={CDC_WS} /></Field>},
  {t: s('Skip alcohol'), O: ({t, t0}) => <Field><Svg><HeatLines t={t} t0={t0 - 2} /></Svg><RuleCard t={t} at={w('lose', 0, t0)} text="ALCOHOL & CAFFEINE → LOSE HEAT FASTER — CDC" top={140} /><Source text={CDC_WS} /></Field>},
  // THE HONEST VERSION
  {t: s('One more time'), st: ALL, cam: CAM.wide, slots: true, O: () => <Source text={DSHS} />},
  {t: s('This is one state'), st: ALL, cam: CAM.wide, slots: true, O: ({t, t0}) => <><HonestChips t={t} t0={t0} /><Source text={DSHS} /></>},
  {t: s('Another storm'), st: ALL, cam: {cx: 900, cy: 560, z: 1.12}, slots: true, O: ({t}) => <><HonestChips t={t} t0={0} /><Source text={DSHS} /></>},
  {t: s('And national'), st: ALL, cam: CAM.col('co', 1.6), slots: true, O: () => <Source text={DSHS} />},
  {t: w('are', 0, s('And national')), st: ALL, cam: CAM.col('co', 1.6), slots: true, O: () => <><Card lines={['National CO estimates (CPSC) are counted a different way —', 'not comparable to these numbers.']} top={120} size={46} width={1500} /><Source text={DSHS} /></>},
  {t: s('What this report shows'), st: ALL, cam: {cx: 960, cy: 560, z: 0.95}, slots: true, O: () => <Source text={DSHS} />},
  // CLOSE + END SCREEN
  {t: s('So before the next'), st: ST.plain, cam: {cx: 1400, cy: 330, z: 0.9}, O: () => <Checklist n={0} />},
  {t: s('Find the warming center'), st: {stacked: [], tint: [], gridOp: 0}, cam: {cx: 1400, cy: 330, z: 0.9}, O: () => <><Checklist n={1} /><Logo /></>},
  {t: s('And call the older'), O: () => <Field tint={C.bg}><Checklist n={2} /><Logo /></Field>},
  {t: s('If you want to see'), O: ({t, t0}) => <Field tint={C.bg}><Checklist n={2} /><Logo /><VoltPoint t={t} t0={t0} /></Field>},
  {t: w('from', 0, s('If you want to see')), O: ({t, t0}) => <Field tint={C.bg}><Checklist n={2} /><Logo /><VoltPoint t={t} t0={t0 - 2} /></Field>},
  {t: timing.duration, O: ({t, t0}) => <Field tint={C.bg}><Checklist n={2} /><Logo /><VoltPoint t={t} t0={t0 - 4} /></Field>},
];

const SHOTS = [...SHOTS_RAW].sort((a, b) => a.t - b.t);

// ---------- scene pieces ----------
const ReportCover: React.FC<{k: number}> = ({k}) => (
  <div style={{position: 'absolute', left: 120 - (1 - k) * 300, top: 300, width: 300, height: 400, background: '#8f97a8', borderRadius: 10, padding: 28, boxSizing: 'border-box', fontFamily: FONT, fontWeight: 800, fontSize: 24, color: '#1a1f2e', lineHeight: 1.2, opacity: k}}>
    February 2021 Winter Storm-Related Deaths – Texas
  </div>
);
const CountChips: React.FC<{t: number}> = ({t}) => {
  const a = s('This is the count');
  return (
    <>
      <At t={t} at={w('state', 0, a)}>{(k) => <Chip text="ONE STATE" x={300} y={600} size={44} k={k} />}</At>
      <At t={t} at={w('confirmed', 0, a)}>{(k) => <Chip text="ONE STORM" x={600} y={600} size={44} k={k} />}</At>
      <At t={t} at={w('estimate', 0, a)}>{(k) => <Chip text="CONFIRMED DEATHS ONLY · NO ESTIMATES ADDED" x={900} y={600} size={44} k={k} />}</At>
    </>
  );
};
const FallsChips: React.FC<{t: number}> = ({t}) => {
  const a = s('The report lists slips');
  const x = 500;
  return (
    <>
      <At t={t} at={w('slips', 0, a)}>{(k) => <Chip text="slips and falls on ice" x={x} y={300} size={44} k={k} />}</At>
      <At t={t} at={w('fall', 0, a)}>{(k) => <Chip text="a fall through ice" x={x} y={380} size={44} k={k} />}</At>
      <At t={t} at={w('injuries', 0, a)}>{(k) => <Chip text="later complications" x={x} y={460} size={44} k={k} />}</At>
    </>
  );
};
const DateStrip: React.FC<{t: number; run?: boolean}> = ({t, run}) => {
  const a = s('The dates on it');
  const p = run ? interpolate(t, [w('february', 0, a), w('june', 0, a)], [0, 1], clamp) : 0;
  return (
    <>
      <Chip text="dates of deaths in the report" x={480} y={260} size={40} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <line x1={500} y1={420} x2={500 + 900 * p} y2={420} stroke={C.amber} strokeWidth={6} />
      </svg>
      {run && t >= w('february', 0, a) && <Chip text="FEB 11" x={460} y={440} size={40} />}
      {run && t >= w('june', 0, a) && <Chip text="JUN 4" x={1340} y={440} size={40} />}
    </>
  );
};
// front walk diagram: sidewalk, porch steps, driveway with an icy sheen; salt and sand scatter
const Walk: React.FC<{t: number; t0: number; focus: number; glint?: boolean; salt?: number; sand?: number}> = ({t, t0, focus, glint, salt = 0, sand = 0}) => {
  const zoom = [1, 1.35, 1.8][focus];
  const cx = [960, 820, 760][focus];
  const cy = [560, 520, 480][focus];
  const g = glint ? ((t - t0) * 0.5) % 1 : -1;
  return (
    <g transform={`translate(${960 - cx * zoom},${540 - cy * zoom}) scale(${zoom})`}>
      <rect x={200} y={200} width={760} height={260} fill="#3a4468" />
      <text x={580} y={190} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={26} fill={C.dim}>house</text>
      {[0, 1, 2].map((i) => <rect key={i} x={640} y={460 + i * 30} width={220} height={30} fill="#59648c" stroke="#3a4468" />)}
      <rect x={1000} y={300} width={320} height={500} fill="#4a5272" />
      <rect x={100} y={560} width={1700} height={110} fill="#59648c" />
      <rect x={640} y={460} width={220} height={90} fill="#cfe9ff" opacity={0.35 * (1 - salt)} />
      <rect x={1000} y={300} width={320} height={500} fill="#cfe9ff" opacity={0.3} />
      <rect x={100} y={560} width={1700} height={110} fill="#cfe9ff" opacity={0.3 * (1 - sand)} />
      {g >= 0 && <rect x={640 + g * 220} y={460} width={30} height={90} fill="#fff" opacity={0.5} />}
      {salt > 0 && Array.from({length: 40}).map((_, i) => <circle key={i} cx={650 + ((i * 53) % 200)} cy={470 + ((i * 37) % 75)} r={3} fill="#fff" opacity={Math.min(1, salt * 2 - (i % 10) / 10)} />)}
      {sand > 0 && Array.from({length: 60}).map((_, i) => <circle key={i} cx={120 + ((i * 97) % 1660)} cy={570 + ((i * 41) % 90)} r={3} fill="#c9a46a" opacity={Math.min(1, sand * 2 - (i % 10) / 10)} />)}
    </g>
  );
};
const Thread: React.FC<{t: number; t0: number}> = ({t, t0}) => (
  <g>
    <Ico kind="thermostat" x={560} y={540} s={160} lit={false} />
    {[['heater', 300], ['grill', 540], ['generator', 780]].map(([k, y], i) => {
      const a = interpolate(t, [t0 + i * 0.5, t0 + i * 0.5 + 0.6], [0, 1], clamp);
      return (
        <g key={k as string} opacity={a}>
          <path d={`M640 540 L${640 + 380 * a} ${540 + ((y as number) - 540) * a}`} stroke={C.amber} strokeWidth={6} fill="none" />
          <Ico kind={k as string} x={1110} y={y as number} s={130} />
        </g>
      );
    })}
  </g>
);
const Floor: React.FC<{t: number; t0: number; ring: number; slide?: number}> = ({ring, slide = 0}) => (
  <g>
    <rect x={460} y={140} width={1000} height={800} fill="#2a3352" stroke="#59648c" strokeWidth={6} />
    <Ico kind="heater" x={960} y={540} s={110} />
    {ring > 0 && <circle cx={960} cy={540} r={260} fill="none" stroke={C.amber} strokeWidth={5} strokeDasharray={`${1634 * ring} 2000`} />}
    {ring > 0.9 && <text x={960} y={260} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={40} fill={C.amber}>AT LEAST 3 FT</text>}
    <rect x={1060 + slide * 300} y={480} width={120} height={160} rx={10} fill="#8a5acd" />
    <text x={1120 + slide * 300} y={680} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={24} fill={C.dim}>blanket</text>
    <rect x={760 - slide * 250} y={360} width={40} height={220} fill="#c44a4a" />
    <text x={780 - slide * 250} y={350} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={24} fill={C.dim}>curtain</text>
  </g>
);
const FourSources: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const items: [string, string][] = [['heater', 'space heaters'], ['fire', 'fireplaces'], ['fire', 'wood stoves'], ['fire', 'candles']];
  const cues = [w('space', 0, t0), w('fireplaces', 0, t0), w('wood', 0, t0), w('candles', 0, t0)];
  return (
    <g>
      {items.map(([k, l], i) => {
        const a = interpolate(t, [cues[i], cues[i] + 0.3], [0, 1], clamp);
        const x = 420 + i * 360;
        return (
          <g key={l} opacity={a}>
            <circle cx={x} cy={520} r={150} fill="none" stroke={C.amber} strokeWidth={4} strokeDasharray="12 10" />
            <Ico kind={k} x={x} y={520} s={i === 3 ? 70 : 110} />
            <text x={x} y={720} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={30} fill={C.ink}>{l}</text>
          </g>
        );
      })}
    </g>
  );
};
const FiveSources: React.FC<{t: number; lit: number; glow?: boolean}> = ({lit, glow}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    {['generator', 'grill', 'heater', 'car', 'vent'].map((k, i) => (
      <g key={k}>
        <rect x={140 + i * 230} y={150} width={180} height={180} rx={20} fill="none" stroke="#59648c" strokeWidth={4} strokeDasharray="10 8" />
        {i < lit && <Ico kind={k} x={230 + i * 230} y={240} s={110} />}
        {i === 4 && glow && <rect x={140 + i * 230} y={150} width={180} height={180} rx={20} fill="none" stroke={C.amber} strokeWidth={6} style={{filter: `drop-shadow(0 0 16px ${C.amber})`}} />}
      </g>
    ))}
  </svg>
);
// side-on cutaway: wall, furnace, vent pipe; exhaust arrows flow out, stall at ice, turn back into empty rooms
const VentCut: React.FC<{t: number; ice: number; back: number}> = ({t, ice, back}) => (
  <g>
    <rect x={300} y={180} width={900} height={700} fill="#2a3352" stroke="#59648c" strokeWidth={6} />
    <line x1={750} y1={180} x2={750} y2={880} stroke="#59648c" strokeWidth={4} />
    <rect x={1200} y={180} width={40} height={700} fill="#59648c" />
    <rect x={380} y={620} width={160} height={240} rx={10} fill="#4a5272" />
    <text x={460} y={900} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={26} fill={C.dim}>furnace</text>
    <path d="M460 620 L460 470 L1300 470" fill="none" stroke="#aab3cc" strokeWidth={30} />
    <rect x={1290} y={440} width={60 * ice + 1} height={60} rx={10} fill="#e8f6ff" opacity={ice} />
    {Array.from({length: 6}).map((_, i) => {
      const u = ((t * 0.4 + i / 6) % 1);
      const stop = 1 - ice * 0.15;
      const x = 480 + Math.min(u, stop) * 820;
      const bx = back > 0 && u > 0.6 ? 1180 - (u - 0.6) * 1100 * back : x;
      const by = back > 0 && u > 0.6 ? 470 + (u - 0.6) * 500 * back : 470;
      return <path key={i} d={`M${bx - 14} ${by - 10} L${bx + 6} ${by} L${bx - 14} ${by + 10}`} fill="none" stroke={back > 0 && u > 0.6 ? '#c7cbd6' : C.amber} strokeWidth={5} opacity={0.9} transform={back > 0 && u > 0.6 ? `rotate(180 ${bx} ${by})` : undefined} />;
    })}
  </g>
);
const HouseWall: React.FC<{vent?: boolean}> = () => (
  <g>
    <rect x={560} y={300} width={800} height={520} fill="#3a4468" />
    <path d="M520 300 L960 120 L1400 300 Z" fill="#2a3352" />
    <rect x={1360} y={520} width={70} height={30} rx={6} fill="#aab3cc" />
  </g>
);
const HouseOutline: React.FC<{t: number; t0: number; markers: number; path: number; shovel?: number}> = ({t, markers, path, shovel = -1}) => {
  const V = [[620, 560], [1300, 500], [960, 760]];
  return (
    <g>
      <rect x={620} y={300} width={680} height={460} fill="none" stroke="#dfe5f5" strokeWidth={6} />
      <path d="M580 300 L960 150 L1340 300" fill="none" stroke="#dfe5f5" strokeWidth={6} />
      {V.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={18} fill={C.amber} opacity={markers > i ? (Math.floor(t * 3 + i) % 2 ? 1 : 0.6) : 0} />
      ))}
      <rect x={560} y={240} width={800} height={580} rx={60} fill="none" stroke={C.amber} strokeWidth={4} strokeDasharray={`14 12`} strokeDashoffset={0} pathLength={1} style={{strokeDasharray: `${path} 1`}} />
      {shovel >= 0 && (() => {
        const i = Math.min(2, Math.floor(shovel * 3));
        const [x, y] = V[i];
        return <g transform={`translate(${x + 30},${y - 60}) rotate(30)`}><rect x={-6} y={-60} width={12} height={90} fill="#8a6a4a" /><rect x={-24} y={30} width={48} height={36} rx={6} fill="#aab3cc" /></g>;
      })()}
    </g>
  );
};
const RoadStrip: React.FC<{t: number; t0: number; line: number; label?: boolean}> = ({t, line, label}) => {
  // FEB 11 … FEB 20; one tick per day; the 14 cubes sit at FEB 11 (ROADS_DATE)
  const x0 = ROADS_DATE.x + 3 * P / 2;
  const dx = 95;
  const xd = (d: number) => x0 + (d - 11) * dx;
  const lineK = line < 0 ? 0 : line === 0 ? 1 : interpolate(t, [line, line + 0.6], [0, 1], clamp);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <g transform="translate(-140,-80) scale(1.6)" />
      {/* drawn in world-ish screen coords for the strip camera */}
      <g>
        <line x1={xd(11) - 40} y1={720} x2={xd(20) + 40} y2={720} stroke="#dfe5f5" strokeWidth={4} />
        {Array.from({length: 10}).map((_, i) => <line key={i} x1={xd(11 + i)} y1={710} x2={xd(11 + i)} y2={730} stroke="#dfe5f5" strokeWidth={3} />)}
        <text x={xd(11)} y={770} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={30} fill={C.ink}>FEB 11</text>
        <text x={xd(20)} y={770} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={30} fill={C.ink}>FEB 20</text>
        <text x={(xd(11) + xd(20)) / 2} y={770} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={30} fill={C.dim}>…</text>
        {lineK > 0 && (
          <g opacity={lineK}>
            <line x1={xd(15)} y1={720} x2={xd(15)} y2={720 - 360 * lineK} stroke={C.amber} strokeWidth={4} strokeDasharray="12 10" />
            <text x={xd(15) + 12} y={400} fontFamily="Inter" fontWeight={900} fontSize={30} fill={C.amber}>FEB 15 · mass outages begin</text>
          </g>
        )}
        {label && <text x={(xd(11) + xd(15)) / 2 + 40} y={470} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={34} fill={C.ink}>THE STORM, NOT THE BLACKOUT</text>}
      </g>
    </svg>
  );
};
const Roads: React.FC<{t: number; t0: number; focus: number; empty?: boolean}> = ({t, t0, focus}) => {
  const pan = focus === 0 ? interpolate(t, [t0, t0 + 4], [0, 120], clamp) : 120 + interpolate(t, [t0, t0 + 4], [0, 200], clamp);
  return (
    <g transform={`translate(${-pan},0)`}>
      <rect x={0} y={640} width={2400} height={140} fill="#3a3f52" />
      <rect x={0} y={640} width={2400} height={140} fill="#cfe9ff" opacity={0.25} />
      {Array.from({length: 20}).map((_, i) => <rect key={i} x={i * 140} y={705} width={70} height={10} fill={C.amber} />)}
      <path d="M700 640 L900 420 L1400 420 L1600 640" fill="none" stroke="#59648c" strokeWidth={60} />
      <path d="M700 640 L900 420 L1400 420 L1600 640" fill="none" stroke="#cfe9ff" strokeWidth={60} opacity={0.3} />
      <text x={1150} y={390} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={28} fill={C.dim}>overpass</text>
      <rect x={1800} y={600} width={600} height={40} fill="#59648c" />
      {[1850, 2000, 2150, 2300].map((x) => <rect key={x} x={x} y={640} width={20} height={200} fill="#59648c" />)}
      <rect x={1800} y={600} width={600} height={40} fill="#cfe9ff" opacity={0.3} />
      <text x={2100} y={580} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={28} fill={C.dim}>bridge</text>
    </g>
  );
};
const StuckCar: React.FC<{t: number; snow: number; exhaust?: boolean}> = ({t, snow, exhaust}) => (
  <g>
    <rect x={0} y={760} width={1920} height={320} fill="#e8edf5" />
    <g transform="translate(860,640)">
      <rect x={-220} y={0} width={440} height={120} rx={30} fill="#4e7fff" />
      <path d="M-140 0 L-90 -90 L90 -90 L150 0 Z" fill="#4e7fff" />
      <path d="M-120 -6 L-80 -76 L-4 -76 L-4 -6 Z M8 -6 L8 -76 L80 -76 L124 -6 Z" fill="#e3eefc" />
      <circle cx={-130} cy={124} r={40} fill="#111" />
      <circle cx={130} cy={124} r={40} fill="#111" />
      <rect x={-250} y={86} width={40} height={18} rx={6} fill="#555a6a" />
      <path d={`M-300 ${130 - 40 * snow} Q-250 ${80 - 30 * snow} -190 ${130 - 40 * snow} L-190 140 L-300 140 Z`} fill="#f4f8fc" opacity={snow} />
      {exhaust && [0, 1, 2].map((i) => {
        const u = (t * 0.6 + i / 3) % 1;
        return <circle key={i} cx={-270 - u * 120} cy={92 - u * 40} r={14 + u * 20} fill="#c7cbd6" opacity={0.5 * (1 - u)} />;
      })}
    </g>
  </g>
);
const IllChips: React.FC<{t: number}> = ({t}) => {
  const a = s('Lung, kidney');
  const items = ['lung', 'kidney', 'heart', 'other'];
  const cues = [w('lung', 0, a), w('kidney', 0, a), w('heart', 0, a), w('others', 0, a)];
  const n = cues.filter((c) => t >= c).length;
  return <Chip text={items.slice(0, Math.max(1, n)).join(' · ')} x={500} y={300} size={48} k={n > 0 ? 1 : 0} />;
};
const DeviceRow: React.FC<{t: number; stage: number; offAt?: number}> = ({t, stage, offAt = 1e9}) => {
  const a = s('Dialysis or oxygen');
  const kinds = ['dialysis', 'oxygen', 'medicine', 'hospice', 'device'];
  return (
    <g>
      {kinds.map((k, i) => (
        <g key={k}>
          <rect x={250 + i * 300} y={390} width={220} height={260} rx={22} fill="none" stroke="#59648c" strokeWidth={4} strokeDasharray="10 8" />
          {i < stage && <Ico kind={k} x={360 + i * 300} y={520} s={150} off={(i === 1 && t > w('oxygen', 0, a) + 0.6) || (i === 4 && t > offAt + 0.8)} frost={i === 2 ? 1 : 0} dim={i === 3} />}
        </g>
      ))}
    </g>
  );
};
const Calm: React.FC<{t: number; iceOff: number; fireOff: number}> = ({t, iceOff, fireOff}) => (
  <g>
    <Ico kind="ice" x={460} y={520} s={150} k={interpolate(t, [iceOff, iceOff + 0.5], [1, 0], clamp)} />
    <Ico kind="fire" x={760} y={520} s={150} k={interpolate(t, [fireOff, fireOff + 0.5], [1, 0], clamp)} />
    <Ico kind="dialysis" x={1060} y={520} s={150} />
    <Ico kind="device" x={1360} y={520} s={150} />
  </g>
);
const SidePanel: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: 1240, top: 54, width: 6, height: 916, background: '#dfe5f5', opacity: 0.6}} />
    <div style={{position: 'absolute', left: 1270, top: 54, width: 554, height: 916, background: '#10162b'}}>
      <ThreeCanvas width={554} height={916} camera={{fov: 35, position: [0, 2, 8]}}>
        <Cam3 pos={[0.4, 2.2, 8.5]} target={[0.4, 1.7, 0]} fov={35} />
        <hemisphereLight args={['#ffffff', '#3a4468', 1.4]} />
        <directionalLight position={[3, 6, 6]} intensity={1.3} />
        <Lineman frame={0} pos={[0, 0, 0]} rotY={-0.2} pose={{brows: 'none', mouth: 'flat'}} />
      </ThreeCanvas>
    </div>
    <div style={{position: 'absolute', left: 1290, top: 120, width: 514, background: C.panel, border: `4px solid ${C.amber}`, borderRadius: 18, padding: '18px 22px', boxSizing: 'border-box', fontFamily: FONT, fontWeight: 900, fontSize: 38, color: C.amber, lineHeight: 1.15}}>
      NOT MEDICAL ADVICE — FROM FDA & READY.GOV
    </div>
  </>
);
const Route: React.FC<{t: number; t0: number; y: number}> = ({t, t0, y}) => {
  const a = interpolate(t, [w('evacuating', 0, t0), w('evacuating', 0, t0) + 1.5], [0, 1], clamp);
  return (
    <g>
      <Ico kind="house" x={600} y={y} s={130} />
      <path d={`M680 ${y} L${680 + 560 * a} ${y}`} stroke={C.amber} strokeWidth={6} strokeDasharray="14 10" />
      <path d={`M${1220} ${y - 16} L1250 ${y} L1220 ${y + 16}`} fill="none" stroke={C.amber} strokeWidth={6} opacity={a} />
      <Ico kind="building" x={1340} y={y} s={130} />
    </g>
  );
};
const Stear: React.FC<{t: number}> = ({t}) => {
  const a = s('In Texas');
  const parts: [string, number][] = [
    ['STEAR — State of Texas Emergency Assistance Registry · free', sAny(['called steer', 'called STEAR'], a) + 0.4],
    ['online or dial 2-1-1', w('online', 0, a)],
    ['a family member can register someone, with their permission', w('dialing', 0, a)],
    ['re-register every year', w('every', 0, a)],
    ['does not guarantee help (TDEM)', w('guarantee', 0, a)],
  ];
  return (
    <>
      <At t={t} at={w('texas', 0, a)}>{(k) => <Chip text="TEXAS ONLY" x={180} y={120} size={44} k={k} color={C.amber} />}</At>
      <div style={{position: 'absolute', left: 180, top: 210, width: 1560, background: C.panel, borderRadius: 22, padding: '26px 36px', boxSizing: 'border-box', fontFamily: FONT, fontWeight: 800, fontSize: 44, lineHeight: 1.3, color: C.ink}}>
        {parts.map(([l, at], i) => (
          <div key={i} style={{opacity: interpolate(t, [at, at + 0.35], [0, 1], clamp)}}>{i === 0 ? <b style={{color: C.amber}}>{l}</b> : `· ${l}`}</div>
        ))}
      </div>
    </>
  );
};
const Bins: React.FC<{t: number; t0: number}> = ({t, t0}) => (
  <>
    {['DIRECT', 'INDIRECT', 'POSSIBLE'].map((b, i) => (
      <At key={b} t={t} at={w(b.toLowerCase(), 0, t0)}>{(k) => <Chip text={b} x={140 + i * 260} y={120} size={40} k={k} />}</At>
    ))}
  </>
);
const Flicks: React.FC<{t: number; t0: number}> = ({t, t0}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    {[['heater', 'fires'], ['vent', 'vents'], ['road', 'roads'], ['device', 'machines']].map(([k, wd], i) => {
      const at = w(wd, 0, t0);
      const o = interpolate(t, [at, at + 0.2, at + 1.2, at + 1.6], [0, 1, 1, 0], clamp);
      return <Ico key={k} kind={k} x={300 + i * 260} y={300} s={130} k={o} />;
    })}
  </svg>
);
const DashedCols: React.FC<{wide?: boolean}> = () => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}} />
);
const Risk: React.FC<{t: number; n: number; top?: number}> = ({n, top = 420}) => {
  const items = ['outdoor repairs during the storm', 'not enough layers', 'homelessness', '…'];
  return (
    <div style={{position: 'absolute', top, left: 120, right: 120, display: 'flex', gap: 22, justifyContent: 'center'}}>
      {items.map((it, i) => (
        <div key={i} style={{border: '3px dashed #59648c', borderRadius: 16, padding: '12px 22px', fontFamily: FONT, fontWeight: 800, fontSize: 36, color: i < n ? C.ink : 'transparent', background: i < n ? C.panel : 'transparent', minWidth: 160, textAlign: 'center'}}>
          {i < n || i === 3 ? (i === 3 && n < 4 ? '…' : it) : '—'}
        </div>
      ))}
    </div>
  );
};
const OurRead: React.FC<{t: number; at: number}> = ({t, at}) => (
  <At t={t} at={at}>{(k) => <Chip text="OUR READ" x={96} y={60} size={36} k={k} color={C.amber} />}</At>
);
const Moments: React.FC<{t: number; n: number}> = ({n}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    {[0, 1, 2].map((i) => (
      <g key={i} opacity={n === 0 && i > 0 ? 0 : 1}>
        <rect x={330 + i * 460} y={330} width={340} height={340} rx={20} fill="none" stroke="#dfe5f5" strokeWidth={5} />
        <text x={500 + i * 460} y={720} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={36} fill={C.ink}>a moment</text>
        {i < n && <Ico kind={['heater', 'vent', 'ice'][i]} x={500 + i * 460} y={500} s={170} />}
      </g>
    ))}
  </svg>
);
const FallingThermo: React.FC<{t: number; t0: number; small?: boolean}> = ({t, t0, small}) => {
  const lvl = interpolate(t, [t0, t0 + 12], [0.8, 0.25], clamp);
  const sc = small ? 0.7 : 1;
  return (
    <g transform={`translate(960,${small ? 300 : 480}) scale(${sc})`}>
      <rect x={-40} y={-260} width={80} height={420} rx={40} fill="#e8ebf2" />
      <circle cy={200} r={70} fill="#5aa9ff" />
      <rect x={-20} y={160 - 400 * lvl} width={40} height={400 * lvl + 40} fill="#5aa9ff" />
    </g>
  );
};
const MapRoute: React.FC<{t: number; t0: number; houseOff: number; route: number; overpass?: boolean; glow?: boolean}> = ({t, houseOff, route, overpass, glow}) => (
  <g>
    <rect x={200} y={300} width={1520} height={600} fill="#1a2140" rx={20} />
    <Ico kind="house" x={420} y={700} s={150} lit={t < houseOff} />
    <path d="M500 700 C800 700 900 520 1150 520 S1450 480 1520 470" fill="none" stroke={route > 0 ? C.amber : '#59648c'} strokeWidth={8} strokeDasharray="18 14" pathLength={1} style={{strokeDasharray: route > 0 ? `${route} 1` : '0.02 0.02'}} />
    <Ico kind="building" x={1560} y={460} s={150} />
    <text x={1560} y={600} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={34} fill={glow ? C.amber : C.ink}>WARMING CENTER</text>
    {overpass && <g><path d="M1000 600 L1080 520 L1240 520 L1320 600" fill="none" stroke="#cfe9ff" strokeWidth={26} opacity={0.7} /></g>}
  </g>
);
const TwoCards: React.FC<{t: number; rightAt: number; inset?: number; apart?: number}> = ({t, rightAt, inset = 0, apart = 0}) => (
  <>
    <Card lines={['EXTREME COLD? GO WHERE', 'THERE’S POWER — READY.GOV']} top={200} size={44} width={720} left={180 - apart * 60} />
    <At t={t} at={rightAt}>{(k) => <Card lines={['AVOID ICE-COVERED ROADS IF', 'AT ALL POSSIBLE — CDC']} top={200} size={44} width={720} left={1020 + apart * 60} k={k} />}</At>
    {inset > 0 && <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}><path d="M820 470 L880 410 L1040 410 L1100 470" fill="none" stroke="#cfe9ff" strokeWidth={22} opacity={inset} /></svg>}
  </>
);
const BigThermo: React.FC<{t: number; mark: number}> = ({mark}) => (
  <g transform="translate(700,520)">
    <rect x={-50} y={-330} width={100} height={540} rx={50} fill="#e8ebf2" />
    <circle cy={250} r={90} fill="#5aa9ff" />
    <rect x={-24} y={-150} width={48} height={410} fill="#5aa9ff" />
    <line x1={60} y1={-40} x2={160} y2={-40} stroke={mark > 0 ? C.amber : '#59648c'} strokeWidth={8} />
    <text x={176} y={-28} fontFamily="Inter" fontWeight={900} fontSize={44} fill={mark > 0 ? C.amber : C.dim}>95°F</text>
  </g>
);
const HeatLines: React.FC<{t: number; t0: number}> = ({t, t0}) => (
  <g transform="translate(960,520)">
    <rect x={-40} y={-230} width={80} height={360} rx={40} fill="#e8ebf2" />
    <circle cy={170} r={70} fill="#ff8a3d" />
    {[0, 1, 2].map((i) => {
      const u = ((t - t0) * 0.5 + i / 3) % 1;
      return <path key={i} d={`M${80 + u * 60} ${-60 + i * 50} q20 -20 40 0 q20 20 40 0`} fill="none" stroke="#ff8a3d" strokeWidth={6} opacity={1 - u} />;
    })}
  </g>
);
const HonestChips: React.FC<{t: number; t0: number}> = ({t}) => {
  const a = s('This is one state');
  return (
    <>
      <At t={t} at={w('state', 0, a)}>{(k) => <Chip text="ONE STATE" x={300} y={80} size={42} k={k} />}</At>
      <At t={t} at={w('storm', 0, a)}>{(k) => <Chip text="ONE STORM" x={580} y={80} size={42} k={k} />}</At>
      <At t={t} at={w('official', 0, a)}>{(k) => <Chip text="CONFIRMED DEATHS ONLY" x={870} y={80} size={42} k={k} />}</At>
    </>
  );
};
const Checklist: React.FC<{n: number}> = ({n}) => (
  <div style={{position: 'absolute', left: 96, top: 140, width: 664, background: C.panel, borderRadius: 22, padding: '30px 34px', boxSizing: 'border-box', fontFamily: FONT, fontWeight: 900, color: C.ink}}>
    {['FIND YOUR WARMING CENTER', 'CALL THE OLDER PEOPLE IN YOUR LIFE'].map((l, i) => (
      <div key={l} style={{display: 'flex', alignItems: 'center', gap: 20, fontSize: 40, margin: '14px 0', opacity: i < n ? 1 : 0.25}}>
        <span style={{width: 50, height: 50, borderRadius: 12, background: i < n ? '#4ee08a' : '#2f3c70', color: '#0b1020', textAlign: 'center', lineHeight: '50px', fontSize: 36}}>{i < n ? '✓' : ''}</span>
        {l}
      </div>
    ))}
  </div>
);
const Logo: React.FC = () => (
  <div style={{position: 'absolute', left: 96, top: 54, fontFamily: FONT, fontWeight: 900, fontSize: 34, color: C.amber, letterSpacing: 2}}>LIGHTS OUT LAB</div>
);
const VoltPoint: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const f = Math.round((t - t0) * 30);
  return (
    <div style={{position: 'absolute', left: 96, top: 520, width: 664, height: 420}}>
      <ThreeCanvas width={664} height={420} camera={{fov: 35, position: [0, 2, 8]}}>
        <Cam3 pos={[0, 2.6, 7]} target={[0, 2.6, 0]} fov={35} />
        <hemisphereLight args={['#ffffff', '#3a4468', 1.5]} />
        <directionalLight position={[3, 6, 6]} intensity={1.2} />
        <group rotation={[0, interpolate(f, [0, 20], [0, 0.6], clamp), 0]}>
          <Volt frame={f} pos={[0, 2.6, 0]} glow={0.3} mood="happy" />
        </group>
      </ThreeCanvas>
      <div style={{position: 'absolute', right: 40, top: 160, fontSize: 90, color: C.amber, opacity: interpolate(f, [10, 20], [0, 1], clamp)}}>→</div>
    </div>
  );
};

// ---------- composition ----------
export const Long002: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  let i = 0;
  while (i + 1 < SHOTS.length && SHOTS[i + 1].t <= t) i++;
  const cur = SHOTS[i];
  const t0 = cur.t;
  const t1 = i + 1 < SHOTS.length ? SHOTS[i + 1].t : timing.duration + L2_HOLD;
  // grid layer: blend from the last grid state before this shot
  let prevGrid = -1;
  for (let j = i - 1; j >= 0; j--) if (SHOTS[j].st) { prevGrid = j; break; }
  const gridShot = cur.st ? cur : null;
  let looks = null as ReturnType<typeof layout> | null;
  let cam = WIDE;
  if (gridShot) {
    const b = layout(gridShot.st!);
    const a = prevGrid >= 0 ? layout(SHOTS[prevGrid].st!) : b;
    const k = interpolate(t, [t0, t0 + 1.4], [0, 1], clamp);
    looks = prevGrid >= 0 && SHOTS[prevGrid].t > t0 - 999 ? blend(a, b, k) : b;
    const ca = prevGrid >= 0 ? SHOTS[prevGrid].cam ?? WIDE : gridShot.cam ?? WIDE;
    const cb = gridShot.cam ?? WIDE;
    cam = lerpCam(ca, cb, ez(t, t0, t0 + 1.0, 0, 1));
  }
  const slotsIn = s('Then it sorted');
  const revealed = [N6, N5, N4, N3, N2].filter((c) => t >= c).length;
  const pulse = t >= s('Each cube') && t < s('Each cube') + 1.2 ? 120 : -1;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {looks && (
        <World cam={cam}>
          <Cubes looks={looks} pulse={pulse} />
          {cur.slots && <Slots t={t} inT={slotsIn} glowFrom={t < s('One is hiding') ? s("We'll go from") : -1} revealed={revealed} coldShown={t >= N1} lastGlow={t < N6 ? s('And the biggest') : -1} />}
        </World>
      )}
      <SourceTop.Provider value={!!(gridShot && cur.slots)}>{cur.O && <cur.O t={t} t0={t0} t1={t1} />}</SourceTop.Provider>
      {!(timing as any).estimated && <Audio src={staticFile('long2/l002.mp3')} />}
    </AbsoluteFill>
  );
};
