// Short 008 — "Why a Gas Station Full of Gas Can't Sell You Any" (1080x1920), 33 shots per the hand-off
// (yt-channel content/scripts/short-008-gas*, v5). Cuts and text pops are keyed to word timings in s008_timing.json.
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {feature} from 'topojson-client';
import {geoAlbersUsa, geoIdentity, geoPath} from 'd3-geo';
import statesTopo from 'us-atlas/states-albers-10m.json';
import timing from './s008_timing.json';
import {Box, clamp, Lineman, Volt} from '../three/kit';
import {Canopy, Car, Cutaway, ease, FONT, GasPump, Night, pop, RedX, UI} from '../long/props';
import {Generator} from '../long/scenes3';

export const S008_FPS = 30;
const HOLD_END = 2.6; // the last card holds ~3 s after the last word
export const S008_FRAMES = Math.ceil((timing.duration + HOLD_END) * S008_FPS);
type Shot = React.FC<{d: number}>;
type V3 = [number, number, number];
const W = timing.words as [string, number, number][];
const CAPS = timing.captions;
const P = (i: number) => (i === 0 ? 0 : CAPS[i].start);
// start of the n-th occurrence of a word (decoder spelling), optionally only after a given time
const word = (w: string, n = 0, after = 0) => {
  const hits = W.filter((x) => x[0] === w && x[1] >= after);
  return hits[Math.min(n, hits.length - 1)][1];
};
const wordEnd = (w: string, after = 0) => W.filter((x) => x[0] === w && x[1] >= after)[0][2];

// ---------- 2D text (safe zone: y 160–1440, x 60–910 below y 700) ----------
const Bar: React.FC<{lines: [string, string?][]; top: number; size?: number; at0?: boolean; delay?: number; left?: number; right?: number}> = ({lines, top, size = 120, at0 = false, delay = 0, left = 60, right = 60}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = at0 ? 1 : pop(f, fps, delay);
  return (
    <div style={{position: 'absolute', top, left, right, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, opacity: k, scale: String(0.7 + 0.3 * k), transformOrigin: 'left top'}}>
      {lines.map(([t, c]) => (
        <div key={t} style={{background: 'rgba(8,10,18,0.92)', borderRadius: 16, padding: '6px 26px 12px', fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.0, color: c ?? '#fff', letterSpacing: -1}}>
          {t}
        </div>
      ))}
    </div>
  );
};
const Src: React.FC<{text: string; top?: number}> = ({text, top = 1360}) => (
  <div style={{position: 'absolute', top, left: 60, background: 'rgba(8,10,18,0.9)', color: '#fff', borderRadius: 10, padding: '6px 16px', fontFamily: FONT, fontWeight: 800, fontSize: 36, letterSpacing: 1}}>Source: {text}</div>
);
const Chips: React.FC<{red: boolean}> = ({red}) => (
  <div style={{position: 'absolute', top: 640, left: 60, display: 'flex', gap: 18}}>
    {['FUEL', 'CARD'].map((t) => (
      <div key={t} style={{display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(8,10,18,0.92)', borderRadius: 14, padding: '10px 22px', fontFamily: FONT, fontWeight: 900, fontSize: 56, color: '#fff'}}>
        <span style={{width: 34, height: 34, borderRadius: 17, background: red ? UI.red : UI.green, boxShadow: `0 0 18px ${red ? UI.red : UI.green}`}} />
        {t}
      </div>
    ))}
  </div>
);

// ---------- 3D sets ----------
// one dark pump front and centre, canopy and a car queue behind, side-lit by headlights
const DeadPump: React.FC<{p: V3; lit?: boolean}> = ({p, lit}) => (
  <group position={p}>
    <Box p={[0, 1.2, 0]} s={[1.1, 2.4, 0.7]} c="#3e4666" />
    <Box p={[0, 2.5, 0]} s={[1.2, 0.2, 0.8]} c="#2a3150" />
    <Box p={[0, 1.8, 0.36]} s={[0.8, 0.4, 0.02]} c={lit ? '#7cf0a0' : '#07090f'} e={lit ? 2 : 0} />
    <Box p={[0.62, 1.2, 0.1]} s={[0.15, 0.5, 0.2]} c="#15171d" />
    <Box p={[0.66, 0.75, 0.28]} s={[0.06, 0.6, 0.06]} c="#15171d" />
  </group>
);
const Forecourt: React.FC<{f: number; cam: V3; tgt: V3; screen?: string; lit?: boolean; gen?: boolean; hero?: 'squeeze' | 'look' | 'turn' | null; volt?: boolean}> = ({f, cam, tgt, lit, gen, hero, volt}) => (
  <Night cam={cam} tgt={tgt} power={0.4}>
    <Canopy p={[0, 0, -0.6]} />
    <DeadPump p={[0, 0, 0]} lit={lit} />
    <DeadPump p={[2.6, 0, -0.2]} />
    {[0, 1, 2, 3, 4].map((i) => (
      <Car key={i} p={[1.3, 0, -3.0 - i * 2.6]} c={['#4e7fff', '#c44a4a', '#d6a23a', '#3c8f5a', '#8a5acd'][i]} lights={3} />
    ))}
    {[0, 1, 2].map((i) => (
      <Car key={`l${i}`} p={[-1.4, 0, -3.6 - i * 2.6]} c={['#d6a23a', '#4e7fff', '#c44a4a'][i]} lights={3} />
    ))}
    <spotLight position={[1.3, 0.5, -3.0]} target-position={[0, 1.4, 0]} angle={0.5} penumbra={0.7} intensity={10} distance={8} color="#fff3d6" />
    {gen && <Generator p={[-1.6, 0, -0.4]} f={f} />}
    {hero === 'squeeze' && <Lineman frame={f} pos={[0.9, 0, 1.0]} rotY={-0.9} pose={{armRx: -1.2, armR: 0.2, brows: 'worried', mouth: 'frown', lookY: -0.3}} />}
    {hero === 'turn' && <Lineman frame={f} pos={[1.0, 0, 1.2]} rotY={ease(f, 0, 20, -0.4, -1.6)} pose={{brows: 'up', mouth: 'flat'}} />}
    {volt && <Volt frame={f} pos={[ease(f, 0, 25, 3.0, 1.2), 2.9, 0.6]} glow={0} mood="worried" />}
  </Night>
);
// station cut in half: the slab on top, soil below, big tank with an electric pump motor inside
const TankCut: React.FC<{f: number; cam: V3; tgt: V3; level?: number; motor?: number; x?: number; flow?: number}> = ({f, cam, tgt, level = 0.92, motor = 0, x = 0, flow = 0}) => (
  <Cutaway cam={cam} tgt={tgt}>
    <GasPump p={[0, 0, 0.4]} />
    <mesh position={[0, -3.4, 0.2]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[1.25, 1.25, 6, 28]} />
      <meshStandardMaterial color="#6a76a0" transparent opacity={0.45} />
    </mesh>
    {level > 0.02 && (
      <Box p={[0, -4.6 + 1.2 * level, 0.25]} s={[5.6, 2.3 * level, 1.6]} c="#ffb238" e={0.6} />
    )}
    <Box p={[0, -1.4, 0.35]} s={[0.2, 2.8, 0.2]} c="#aab3cc" />
    {flow > 0 && <Box p={[0, -2.6 + ((f * 0.06) % 1) * 2.4 * flow, 0.47]} s={[0.12, 0.35, 0.12]} c="#ffb238" e={1.6} />}
    <Box p={[0, -3.0, 0.75]} s={[0.55, 0.7, 0.45]} c={motor > 0 ? '#4ee08a' : '#3d4770'} e={motor * 1.6} />
    {motor > 0 && <pointLight position={[0, -3.0, 1.6]} color="#4ee08a" intensity={6 * motor} distance={3} />}
    {x > 0 && <RedX p={[0, -3.0, 1.2]} k={x} size={1.4} />}
  </Cutaway>
);

// ---------- maps (us-atlas albers 975x610, already projected) ----------
const geo = feature(statesTopo as any, (statesTopo as any).objects.states) as any;
const STATES = geo.features as any[];
const albers = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const FL = STATES.find((s) => s.id === '12');
const LA = STATES.find((s) => s.id === '22');
const NY = STATES.find((s) => s.id === '36');
const usPath = geoPath(geoIdentity());

// whole US map, fitted into a box; lights the given ids (with optional clipping for LA south / NY downstate)
const USMap: React.FC<{lit: ('FL' | 'LA' | 'NY')[]; box?: [number, number, number, number]; storms?: number; labels?: boolean}> = ({lit, box = [40, 600, 870, 640], storms = 0, labels = false}) => {
  const f = useCurrentFrame();
  const [x, y, w, h] = box;
  const sx = w / 975;
  const laB = usPath.bounds(LA);
  const nyB = usPath.bounds(NY);
  const id = (k: string) => `clip-${k}`;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <defs>
        <clipPath id={id('la')}>
          <rect x={laB[0][0]} y={laB[0][1] + (laB[1][1] - laB[0][1]) * 0.5} width={laB[1][0] - laB[0][0]} height={laB[1][1] - laB[0][1]} />
        </clipPath>
        <clipPath id={id('ny')}>
          <rect x={nyB[0][0] + (nyB[1][0] - nyB[0][0]) * 0.72} y={nyB[0][1] + (nyB[1][1] - nyB[0][1]) * 0.62} width={200} height={200} />
        </clipPath>
      </defs>
      <g transform={`translate(${x},${y}) scale(${sx})`}>
        {STATES.map((s) => (
          <path key={s.id} d={usPath(s) ?? ''} fill="#1d2546" stroke="#3a4570" strokeWidth={1.2} />
        ))}
        {lit.includes('FL') && <path d={usPath(FL) ?? ''} fill={UI.amber} stroke="#fff" strokeWidth={1.5} />}
        {lit.includes('LA') && <path d={usPath(LA) ?? ''} fill={UI.amber} stroke="#fff" strokeWidth={1.5} clipPath={`url(#${id('la')})`} />}
        {lit.includes('NY') && <path d={usPath(NY) ?? ''} fill={UI.amber} stroke="#fff" strokeWidth={1.5} clipPath={`url(#${id('ny')})`} />}
        {Array.from({length: storms}).map((_, i) => {
          const p = albers([-84 + i * 4.5 + f * 0.04, 23.5 + i * 1.5 + f * 0.02]) ?? [0, 0];
          return (
            <g key={i} transform={`translate(${p[0]},${p[1]}) rotate(${-f * 6})`}>
              <path d="M0 0 m-26 0 a26 26 0 1 1 52 0 a18 18 0 1 1 -36 0 a10 10 0 1 1 20 0" fill="none" stroke="#9fd6ff" strokeWidth={7} strokeLinecap="round" />
            </g>
          );
        })}
      </g>
      {labels &&
        ([
          ['FL', [-81.6, 27.8], 'FL'],
          ['LA', [-91.8, 30.0], 'LA (south)'],
          ['NY', [-74.6, 41.2], 'NY (downstate)'],
        ] as [string, [number, number], string][])
          .filter(([k]) => lit.includes(k as any))
          .map(([k, ll, t]) => {
            const p = albers(ll) ?? [0, 0];
            const lx = Math.min(x + p[0] * sx, 910 - t.length * 24);
            return (
              <text key={k} x={lx} y={y + p[1] * sx - 26} fill="#fff" fontFamily="Inter" fontWeight={900} fontSize={40} stroke="#0b1020" strokeWidth={8} paintOrder="stroke">
                {t}
              </text>
            );
          })}
    </svg>
  );
};

// Florida close-up: interstates, a half-mile band, stations, city pins, storm
const ROUTES: [number, number][][] = [
  [[-81.66, 30.33], [-81.02, 29.21], [-80.64, 28.08], [-80.05, 26.71], [-80.14, 26.12], [-80.19, 25.77]],
  [[-83.2, 30.7], [-82.64, 30.19], [-82.32, 29.65], [-82.14, 29.19], [-82.46, 27.95], [-82.53, 27.34], [-81.87, 26.64], [-81.79, 26.14], [-80.3, 26.12]],
  [[-87.22, 30.42], [-84.28, 30.44], [-82.64, 30.19], [-81.66, 30.33]],
  [[-82.46, 27.95], [-81.38, 28.54], [-81.02, 29.21]],
];
const CITIES: [string, [number, number]][] = [
  ['Miami / Ft. Lauderdale', [-80.17, 25.95]],
  ['West Palm Beach', [-80.05, 26.71]],
  ['Gainesville', [-82.32, 29.65]],
];
const lerpRoute = (r: [number, number][], u: number): [number, number] => {
  const n = r.length - 1;
  const i = Math.min(n - 1, Math.floor(u * n));
  const k = u * n - i;
  return [r[i][0] + (r[i + 1][0] - r[i][0]) * k, r[i][1] + (r[i + 1][1] - r[i][1]) * k];
};
const BIG = ROUTES.flatMap((r, ri) => [0.15, 0.4, 0.65, 0.9].map((u) => lerpRoute(r, (u + ri * 0.07) % 1)));
const SMALL: [number, number][] = [
  [-81.4, 28.4], [-81.2, 28.6], [-82.5, 27.8], [-80.3, 25.8], [-80.4, 26.3], [-82.0, 26.6], [-81.7, 30.2], [-84.3, 30.5], [-82.4, 29.6], [-81.9, 28.0],
  [-80.9, 27.4], [-82.7, 28.6], [-81.5, 27.1], [-87.0, 30.5], [-85.7, 30.2], [-81.0, 29.0], [-80.6, 28.3], [-82.2, 27.0], [-81.3, 26.0], [-80.2, 26.9],
];
const FLMap: React.FC<{band?: number; big?: number; small?: number; storm?: number; pins?: number; empty?: number; box?: [number, number, number, number]}> = ({band = 0, big = 0, small = 0, storm = 0, pins = 0, empty = 0, box = [60, 560, 850, 760]}) => {
  const f = useCurrentFrame();
  const proj = useMemo(() => geoIdentity().fitExtent([[box[0], box[1]], [box[0] + box[2], box[1] + box[3]]], FL), [box]);
  const path = geoPath(proj);
  const P2 = (ll: [number, number]) => proj((albers(ll) ?? [0, 0]) as [number, number]) ?? [0, 0];
  const routeD = (r: [number, number][]) => r.map((ll, i) => `${i ? 'L' : 'M'}${P2(ll)[0]},${P2(ll)[1]}`).join(' ');
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <path d={path(FL) ?? ''} fill="#1d2546" stroke="#8fa0d8" strokeWidth={3} />
      {band > 0 && ROUTES.map((r, i) => <path key={`b${i}`} d={routeD(r)} fill="none" stroke={UI.amber} strokeOpacity={0.25 * band} strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" />)}
      {ROUTES.map((r, i) => <path key={i} d={routeD(r)} fill="none" stroke="#c9d3f0" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />)}
      {BIG.map((ll, i) => {
        const p = P2(ll);
        const k = interpolate(big * BIG.length - i, [0, 1], [0, 1], clamp);
        return <circle key={`g${i}`} cx={p[0]} cy={p[1]} r={13} fill={UI.green} opacity={k} style={{filter: `drop-shadow(0 0 8px ${UI.green})`}} />;
      })}
      {SMALL.map((ll, i) => {
        const p = P2(ll);
        const k = interpolate(small * SMALL.length - i, [0, 1], [0, 1], clamp);
        return <circle key={`s${i}`} cx={p[0]} cy={p[1]} r={9} fill={UI.green} opacity={k} />;
      })}
      {storm > 0 &&
        (() => {
          const ll: [number, number] = [-80.8 - storm * 0.6, 24.2 + storm * 2.6];
          const p = P2(ll);
          return (
            <g transform={`translate(${p[0]},${p[1]}) rotate(${-f * 6})`}>
              <path d="M0 0 m-70 0 a70 70 0 1 1 140 0 a48 48 0 1 1 -96 0 a26 26 0 1 1 52 0" fill="none" stroke="#9fd6ff" strokeWidth={14} strokeLinecap="round" opacity={0.9} />
            </g>
          );
        })()}
      {CITIES.map(([name, ll], i) => {
        const p = P2(ll);
        const k = interpolate(pins * 3 - i, [0, 1], [0, 1], clamp);
        const e = interpolate(empty * 3 - i, [0, 1], [0, 1], clamp);
        const lx = Math.max(70, Math.min(p[0] - 20, 910 - (e > 0.5 ? 9 : name.length) * 26 - 30));
        return (
          <g key={name} opacity={k}>
            <circle cx={p[0]} cy={p[1]} r={20} fill={e > 0.5 ? UI.red : '#fff'} stroke="#0b1020" strokeWidth={5} />
            <text x={i === 2 ? p[0] + 30 : lx} y={i === 2 ? p[1] + 12 : p[1] - 34} fill={e > 0.5 ? UI.red : '#fff'} fontFamily="Inter" fontWeight={900} fontSize={38} stroke="#0b1020" strokeWidth={8} paintOrder="stroke">
              {e > 0.5 ? `${name}: EMPTY` : name}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// top-down row of six station roofs; a generator outline hovers; some roofs get a lit socket
const Roofs: React.FC<{hover?: number; land?: number; sockets?: number}> = ({hover = 0, land = 0, sockets = 0}) => {
  const f = useCurrentFrame();
  const lit = [0, 2, 3, 5];
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <rect x={0} y={0} width={1080} height={1920} fill="#141a2e" />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 90 + (i % 3) * 300;
        const y = 760 + Math.floor(i / 3) * 330;
        const s = lit.includes(i) ? interpolate(sockets * 4 - lit.indexOf(i), [0, 1], [0, 1], clamp) : 0;
        return (
          <g key={i}>
            <rect x={x} y={y} width={240} height={200} rx={14} fill="#2f3c70" stroke="#59648c" strokeWidth={4} />
            <rect x={x + 30} y={y + 40} width={60} height={120} rx={8} fill="#1d2546" />
            <rect x={x + 150} y={y + 40} width={60} height={120} rx={8} fill="#1d2546" />
            <rect x={x + 60} y={y + 214} width={120} height={50} rx={8} fill="none" stroke="#59648c" strokeDasharray="10 8" strokeWidth={3} />
            {s > 0 && (
              <g opacity={s}>
                <circle cx={x + 120} cy={y + 100} r={36} fill={UI.green} style={{filter: `drop-shadow(0 0 12px ${UI.green})`}} />
                <rect x={x + 108} y={y + 86} width={8} height={18} fill="#0b1020" />
                <rect x={x + 124} y={y + 86} width={8} height={18} fill="#0b1020" />
              </g>
            )}
          </g>
        );
      })}
      {hover > 0 && (
        <g opacity={hover * (1 - land)} transform={`translate(${470 + Math.sin(f / 8) * 30},${560 + land * 220})`}>
          <rect x={-90} y={-60} width={180} height={120} rx={14} fill="none" stroke={UI.amber} strokeWidth={6} strokeDasharray="16 10" />
          <text x={0} y={18} textAnchor="middle" fill={UI.amber} fontFamily="Inter" fontWeight={900} fontSize={54}>⚡</text>
        </g>
      )}
    </svg>
  );
};

const FloridaCard: React.FC<{gavel?: number; small?: boolean}> = ({gavel = 0, small = false}) => {
  const f = useCurrentFrame();
  const proj = useMemo(() => geoIdentity().fitExtent([[0, 0], [300, 300]], FL), []);
  const d = geoPath(proj)(FL) ?? '';
  const g = interpolate(gavel, [0, 1], [-50, 0], clamp);
  return (
    <div style={{position: 'absolute', ...(small ? {top: 200, right: 60, width: 180, height: 180} : {top: 680, left: 240, width: 600, height: 600}), transition: 'none'}}>
      <svg viewBox="-20 -20 340 340" width="100%" height="100%">
        <rect x={-20} y={-20} width={340} height={340} rx={30} fill="rgba(8,10,18,0.92)" stroke={UI.amber} strokeWidth={6} />
        <path d={d} fill={UI.amber} stroke="#fff" strokeWidth={3} />
        {!small && (
          <g transform={`translate(215,70) rotate(${g})`}>
            <rect x={-12} y={0} width={24} height={110} rx={6} fill="#8a5a33" />
            <rect x={-48} y={-26} width={96} height={46} rx={10} fill="#a86d3c" />
          </g>
        )}
      </svg>
    </div>
  );
};

const Gauge: React.FC<{needle: number; glowF?: number}> = ({needle, glowF = 0}) => {
  const a = Math.PI + needle * Math.PI; // 0 = E (left), 1 = F (right)
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <path d="M190 1150 A350 350 0 0 1 890 1150" stroke="#2f3c70" strokeWidth={48} fill="none" />
      <line x1={540} y1={1150} x2={540 + 310 * Math.cos(a)} y2={1150 + 310 * Math.sin(a)} stroke="#fff" strokeWidth={18} strokeLinecap="round" />
      <circle cx={540} cy={1150} r={30} fill="#fff" />
      <text x={170} y={1250} fill={UI.red} fontFamily="Inter" fontWeight={900} fontSize={80}>E</text>
      <text x={850} y={1250} fill={glowF > 0 ? UI.green : '#fff'} fontFamily="Inter" fontWeight={900} fontSize={80} style={{filter: glowF > 0 ? `drop-shadow(0 0 ${20 * glowF}px ${UI.green})` : undefined}}>F</text>
    </svg>
  );
};

// ---------- shots ----------
const S01: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Forecourt f={f} cam={[ease(f, 0, d, 0.4, 0.2), 1.9, ease(f, 0, d, 5.6, 4.8)]} tgt={[0, 1.6, 0]} screen="" />
      <Bar lines={[['PUMPS DEAD.'], ['WHY?', UI.amber]]} top={240} size={128} at0 />
    </AbsoluteFill>
  );
};
const S02: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Forecourt f={f} cam={[ease(f, 0, d, 2.8, 2.4), 2.3, ease(f, 0, d, 5.4, 5.0)]} tgt={[0.4, 1.4, 0.3]} screen="" hero="squeeze" />
      <Bar lines={[['PUMPS DEAD.'], ['WHY?', UI.amber]]} top={240} size={128} at0 />
    </AbsoluteFill>
  );
};
const S03: Shot = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Forecourt f={f} cam={[0.3, 1.9, ease(f, 0, d, 2.6, 2.2)]} tgt={[0, 1.8, 0]} screen="" volt />
      <Bar lines={[['PUMPS DEAD.'], ['WHY?', UI.amber]]} top={240} size={128} at0 />
      <div style={{position: 'absolute', top: 820, left: 0, right: 170, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 260, color: UI.amber, scale: String(pop(f, fps, 0)), textShadow: '0 0 40px #000'}}>?</div>
    </AbsoluteFill>
  );
};
const S04: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Forecourt f={f} cam={[ease(f, 0, d, 1, -1), ease(f, 0, d, 5, 11), ease(f, 0, d, 9, 11)]} tgt={[0, 0.5, -4]} screen="" />
      <Bar lines={[['PUMPS DEAD.'], ['WHY?', UI.amber]]} top={240} size={128} at0 />
    </AbsoluteFill>
  );
};
const S05: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #1b2550 0%, #0b1020 72%)'}}>
      <FloridaCard gavel={interpolate(f, [4, 12], [0, 1], clamp)} />
      <Bar lines={[['ONE STATE'], ['WROTE A LAW', UI.amber]]} top={260} size={130} />
    </AbsoluteFill>
  );
};
const S06: Shot = ({d}) => {
  const f = useCurrentFrame();
  const y = interpolate(f, [0, d], [1.6, -1.6], clamp);
  return (
    <AbsoluteFill>
      <TankCut f={f} cam={[0.6, y, ease(f, 0, d, 9, 13)]} tgt={[0, y - 1.2, 0]} />
      <FloridaCard small />
    </AbsoluteFill>
  );
};
const S07: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <TankCut f={f} cam={[ease(f, 0, d, 0.8, 0.2), -1.6, 13]} tgt={[0, -2.6, 0]} />
      <Bar lines={[['TANK: FULL', UI.amber]]} top={300} size={120} />
    </AbsoluteFill>
  );
};
const S08: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <TankCut f={f} cam={[0.3, -2.0, ease(f, 0, d, 9.5, 8.5)]} tgt={[0, -2.2, 0]} motor={interpolate(f, [2, 10], [0, 1], clamp)} flow={1} />
      <Bar lines={[['ELECTRIC PUMP', UI.green]]} top={300} size={110} />
    </AbsoluteFill>
  );
};
const S09: Shot = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <TankCut f={f} cam={[0.3, -2.0, 8.5]} tgt={[0, -2.2, 0]} motor={0} x={pop(f, fps, 3)} />
    </AbsoluteFill>
  );
};
const S10: Shot = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #1b2550 0%, #0b1020 72%)'}}>
      <div style={{position: 'absolute', top: 820, left: 190, width: 540, height: 760, borderRadius: 40, background: '#2b3350', border: '8px solid #3a4680', scale: String(pop(f, fps, 0))}}>
        <div style={{margin: 40, height: 260, borderRadius: 18, background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 70, color: Math.floor(f / 10) % 2 ? UI.red : '#5a2a2a'}}>NO POWER</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, margin: '0 60px'}}>
          {Array.from({length: 9}).map((_, i) => <div key={i} style={{height: 80, borderRadius: 12, background: '#3a4680'}} />)}
        </div>
      </div>
      <Chips red={f > 6} />
    </AbsoluteFill>
  );
};
const S11: Shot = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = pop(f, fps, 2);
  return (
    <AbsoluteFill>
      <Forecourt f={f} cam={[ease(f, 0, d, 3.5, 2.8), 2.6, 9]} tgt={[-0.4, 1.4, 0]} screen="" hero="turn" />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: k}}>
        <rect x={150} y={1010} width={300} height={200} rx={20} fill="none" stroke={UI.amber} strokeWidth={8} strokeDasharray="22 14" />
        <text x={300} y={1140} textAnchor="middle" fill={UI.amber} fontFamily="Inter" fontWeight={900} fontSize={110}>?</text>
      </svg>
      <Bar lines={[['A GENERATOR?', UI.amber]]} top={300} size={110} />
    </AbsoluteFill>
  );
};
const S12: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#0b1020'}}>
      <USMap lit={['FL']} storms={2} />
      <Bar lines={[['TWO HURRICANE'], ['SEASONS', UI.blue]]} top={260} size={120} />
    </AbsoluteFill>
  );
};
const S13: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #1b2550 0%, #0b1020 72%)'}}>
      <FloridaCard gavel={interpolate(f, [2, 10], [0, 1], clamp)} />
      <Bar lines={[['FLORIDA, 2006', UI.amber]]} top={300} size={130} />
    </AbsoluteFill>
  );
};
const S14: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Roofs hover={interpolate(f, [0, 8], [0, 1], clamp)} />
      <Bar lines={[["DOESN'T MAKE"], ['EVERY STATION'], ['BUY ONE', UI.amber]]} top={250} size={96} />
    </AbsoluteFill>
  );
};
const S15: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Roofs hover={1} land={interpolate(f, [0, d], [0, 1], clamp)} />
      <Bar lines={[["DOESN'T MAKE"], ['EVERY STATION'], ['BUY ONE', UI.amber]]} top={250} size={96} at0 />
    </AbsoluteFill>
  );
};
const S16: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Roofs sockets={interpolate(f, [0, 18], [0, 1], clamp)} />
      <Bar lines={[['FLORIDA: MANY STATIONS', UI.green], ['MUST BE WIRED'], ['FOR A GENERATOR']]} top={230} size={74} />
      <div style={{position: 'absolute', top: 1470 - 120, left: 60, right: 170, background: 'rgba(8,10,18,0.92)', borderRadius: 14, padding: '12px 22px', fontFamily: FONT, fontWeight: 800, fontSize: 46, color: '#fff', lineHeight: 1.15}}>
        big stations near interstates + all built since 2006
      </div>
    </AbsoluteFill>
  );
};
const S17: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#0b1020'}}>
      <FLMap band={interpolate(f, [0, 10], [0, 1], clamp)} big={interpolate(f, [6, d], [0, 1], clamp)} />
      <Bar lines={[['NEAR INTERSTATES', UI.green]]} top={260} size={96} />
      <Src text="Fla. Stat. §526.143" />
    </AbsoluteFill>
  );
};
const S18: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#0b1020'}}>
      <FLMap band={1} big={1} small={interpolate(f, [0, d * 0.8], [0, 1], clamp)} />
      <Bar lines={[['+ EVERY STATION', UI.green], ['BUILT SINCE JULY 2006']]} top={250} size={84} />
      <Src text="Fla. Stat. §526.143" />
    </AbsoluteFill>
  );
};
const SocketSet: React.FC<{f: number; plug: number; cam: V3; tgt: V3; glow?: number}> = ({f, plug, cam, tgt, glow = 0}) => (
  <Night cam={cam} tgt={tgt} power={0.5}>
    <Box p={[0, 1.6, -0.6]} s={[6, 3.2, 0.3]} c="#59648c" />
    <Box p={[0.2, 1.1, -0.43]} s={[0.6, 0.6, 0.06]} c="#2b3350" />
    <Box p={[0.1, 1.15, -0.39]} s={[0.08, 0.16, 0.02]} c={glow > 0 ? UI.green : '#0b0f1d'} e={glow * 3} />
    <Box p={[0.3, 1.15, -0.39]} s={[0.08, 0.16, 0.02]} c={glow > 0 ? UI.green : '#0b0f1d'} e={glow * 3} />
    {glow > 0 && <pointLight position={[0.2, 1.2, 0.2]} color={UI.green} intensity={6 * glow} distance={3} />}
    <Generator p={[-2.2, 0, 0.4]} f={f} on={plug >= 1} />
    <Box p={[-1.0 + 0.6 * plug, 0.6 + 0.4 * plug, 0.2 - 0.3 * plug]} s={[2.2 * (0.5 + 0.5 * plug), 0.06, 0.06]} c="#111" />
    <Box p={[0.2 - 0.4 * (1 - plug), 1.15, -0.32 + 0.4 * (1 - plug)]} s={[0.2, 0.2, 0.16]} c="#222" />
    <Lineman frame={f} pos={[1.4, 0, 0.8]} rotY={-0.8} pose={{armRx: -1.0, armR: 0.3, brows: 'up', mouth: plug >= 1 ? 'smile' : 'flat'}} />
  </Night>
);
const S19: Shot = ({d}) => {
  const f = useCurrentFrame();
  const plug = interpolate(f, [d * 0.35, d * 0.65], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <SocketSet f={f} plug={plug} cam={[ease(f, 0, d, 1.4, 0.8), 1.8, ease(f, 0, d, 5.4, 4.6)]} tgt={[-0.2, 1.1, 0]} />
      <Bar lines={[['PLUG-IN READY', UI.green]]} top={300} size={110} delay={Math.round(d * 0.6)} />
      <Src text="Fla. Stat. §526.143" />
    </AbsoluteFill>
  );
};
const S20: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <SocketSet f={f} plug={1} glow={1} cam={[0.4, ease(f, 0, d, 1.6, 6), ease(f, 0, d, 4.4, 14)]} tgt={[0, 1.1, 0]} />
      <Src text="Fla. Stat. §526.143" />
    </AbsoluteFill>
  );
};
const S21: Shot = () => (
  <AbsoluteFill style={{background: '#0b1020'}}>
    <USMap lit={[]} />
    <Bar lines={[['ONLY A FEW STATES', UI.amber]]} top={300} size={96} />
  </AbsoluteFill>
);
const S22: Shot = ({d}) => {
  const f = useCurrentFrame();
  const la = f > d * 0.45;
  return (
    <AbsoluteFill style={{background: '#0b1020'}}>
      <USMap lit={la ? ['FL', 'LA'] : ['FL']} labels />
      <Bar lines={[['ONLY A FEW STATES', UI.amber]]} top={300} size={96} at0 />
    </AbsoluteFill>
  );
};
const S23: Shot = () => (
  <AbsoluteFill style={{background: '#0b1020'}}>
    <USMap lit={['FL', 'LA', 'NY']} labels />
    <Bar lines={[['ONLY A FEW STATES', UI.amber]]} top={300} size={96} at0 />
  </AbsoluteFill>
);
const S24: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Forecourt f={f} cam={[ease(f, 0, d, 1.2, 0.6), 2.0, ease(f, 0, d, 6.4, 5.6)]} tgt={[-0.4, 1.5, 0]} screen="" lit gen />
      <Bar lines={[['IN A BIG STORM,'], ['TANKS RUN DRY', UI.red]]} top={250} size={110} />
    </AbsoluteFill>
  );
};
const S25: Shot = ({d}) => {
  const f = useCurrentFrame();
  const level = interpolate(f, [0, d], [0.6, 0], clamp);
  return (
    <AbsoluteFill>
      <TankCut f={f} cam={[0.3, -1.8, 11]} tgt={[0, -2.6, 0]} level={level} />
      <Bar lines={[['IN A BIG STORM,'], ['TANKS RUN DRY', UI.red]]} top={250} size={110} at0 />
      <div style={{position: 'absolute', top: 1180, left: 60, background: 'rgba(8,10,18,0.92)', borderRadius: 14, padding: '8px 24px', fontFamily: FONT, fontWeight: 900, fontSize: 64, color: level < 0.1 ? UI.red : UI.amber}}>
        TANK: {level < 0.05 ? 'EMPTY' : `${Math.round(level * 100)}%`}
      </div>
    </AbsoluteFill>
  );
};
const S26: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#0b1020'}}>
      <FLMap storm={interpolate(f, [0, d], [0, 1], clamp)} />
      <Bar lines={[['HURRICANE IRMA, 2017', UI.blue]]} top={280} size={92} />
      <Src text="GasBuddy" />
    </AbsoluteFill>
  );
};
const S27: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#0b1020'}}>
      <FLMap storm={1} pins={interpolate(f, [0, d * 0.8], [0, 1], clamp)} />
      <Bar lines={[['50–70% OF STATIONS', UI.red], ['EMPTY']]} top={250} size={92} />
      <Src text="GasBuddy" />
    </AbsoluteFill>
  );
};
const S28: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#0b1020'}}>
      <FLMap storm={1} pins={1} empty={interpolate(f, [0, d * 0.8], [0, 1], clamp)} />
      <Bar lines={[['50–70% OF STATIONS', UI.red], ['EMPTY']]} top={250} size={92} at0 />
      <Src text="GasBuddy" />
    </AbsoluteFill>
  );
};
const CarCut: React.FC<{f: number; cam: V3; tgt: V3; line?: number}> = ({f, cam, tgt, line = 0}) => (
  <Cutaway cam={cam} tgt={tgt}>
    <Car p={[0, 0, 0.6]} r={Math.PI / 2} c="#4e7fff" lights={1} />
    <Box p={[0.1, 0.12, 0.6]} s={[0.7, 0.2, 0.9]} c="#ffb238" e={1.4} />
    <pointLight position={[0.1, 0.3, 1.4]} color="#ffb238" intensity={4} distance={2.5} />
    {line > 0 && (
      <group>
        <Box p={[-3, 3.6, -0.6]} s={[0.18, 3.6, 0.18]} c="#59648c" />
        <Box p={[0, 5.2, -0.6]} s={[7, 0.05, 0.05]} c="#111" />
        <Box p={[0, 5.0, -0.6]} s={[7, 0.05, 0.05]} c="#111" />
      </group>
    )}
  </Cutaway>
);
const S29: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <TankCut f={f} cam={[ease(f, 0, d, 0.3, -5), ease(f, 0, d, -1.8, 0.4), ease(f, 0, d, 11, 9)]} tgt={[ease(f, 0, d, 0, -5.5), ease(f, 0, d, -2.6, 0.2), 0]} level={0} />
    </AbsoluteFill>
  );
};
const S30: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <CarCut f={f} cam={[ease(f, 0, d, 1.8, 1.2), 1.0, ease(f, 0, d, 4.2, 3.6)]} tgt={[-0.3, 0.4, 0.9]} />
      <Bar lines={[['THE GAS IN YOUR CAR', UI.amber]]} top={300} size={88} />
    </AbsoluteFill>
  );
};
const S31: Shot = ({d}) => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [0, d * 0.7], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <CarCut f={f} cam={[1.4, 1.6, 5.6]} tgt={[-0.3, 1.4, 0.6]} line={1} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: fade}}>
        <g transform="translate(540,560)">
          <path d="M-90 -60 L90 -60 M-90 0 L90 0 M-60 -60 L-60 120 M60 -60 L60 120" stroke="#fff" strokeWidth={12} strokeLinecap="round" />
        </g>
      </svg>
      <Bar lines={[['NO GRID NEEDED', UI.green]]} top={300} size={110} delay={4} />
    </AbsoluteFill>
  );
};
const S32: Shot = ({d}) => {
  const f = useCurrentFrame();
  const n = interpolate(f, [0, 18], [0.05, 0.5], {...clamp});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #1b2550 0%, #0b1020 72%)'}}>
      <Gauge needle={n} />
      <Bar lines={[['HALF A TANK.', UI.amber], ['ALWAYS.']]} top={240} size={130} />
      <Src text="Ready.gov" />
    </AbsoluteFill>
  );
};
const S33: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #1b2550 0%, #0b1020 72%)'}}>
      <Gauge needle={0.5} glowF={interpolate(f, [6, 14, 30], [0, 1, 0], clamp)} />
      <Bar lines={[['HALF A TANK.', UI.amber], ['ALWAYS.']]} top={240} size={130} at0 />
      <div style={{position: 'absolute', top: 1330 - 160, left: 60, right: 170, background: 'rgba(8,10,18,0.92)', borderRadius: 14, padding: '10px 22px', fontFamily: FONT, fontWeight: 900, fontSize: 58, color: UI.green, lineHeight: 1.1, opacity: pop(f, 30, 0)}}>
        FULL IF EVACUATION LOOKS LIKELY.
      </div>
      <Src text="Ready.gov" />
    </AbsoluteFill>
  );
};

// cut times keyed to the voice
const after12 = CAPS[12].start;
const CUTS: [number, Shot][] = [
  [0, S01],
  [P(1), S02],
  [P(2), S03],
  [word('buy'), S04],
  [P(3), S05],
  [word('about'), S06],
  [P(4), S07],
  [P(5), S08],
  [P(6), S09],
  [P(7), S10],
  [P(8), S11],
  [P(9), S12],
  [word('florida'), S13],
  [P(10), S14],
  [word('buy', 0, P(10)), S15],
  [P(11), S16],
  [word('and', 0, after12), S17],
  [word('since', 0, after12), S18],
  [word('must', 0, after12), S19],
  [wordEnd('in', word('plugs')) + 0.05, S20],
  [P(13), S21],
  [word('like'), S22],
  [word('new'), S23],
  [P(14), S24],
  [word('tanks', 0, P(14)), S25],
  [P(15), S26],
  [word('fifty'), S27],
  [word('in', 0, word('empty')), S28],
  [P(16), S29],
  [word('is', 0, P(16)), S30],
  [P(17), S31],
  [P(18), S32],
  [P(19), S33],
];

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const c = CAPS.find((c) => t >= c.start && t < c.end);
  if (!c) return null;
  return (
    <div style={{position: 'absolute', top: 1450 - 10, left: 60, right: 170, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 44, lineHeight: 1.18, color: '#fff', textAlign: 'center', background: 'rgba(6,9,20,0.8)', borderRadius: 18, padding: '10px 24px'}}>{c.text}</div>
    </div>
  );
};

export const Short008: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#0b1020'}}>
      {CUTS.map(([t, C], i) => {
        const from = Math.round(t * fps);
        const to = i + 1 < CUTS.length ? Math.round(CUTS[i + 1][0] * fps) : S008_FRAMES;
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}>
            <C d={Math.max(1, to - from)} />
          </Sequence>
        );
      })}
      {!(timing as any).estimated && <Audio src={staticFile('shorts2/s008.mp3')} />}
    </AbsoluteFill>
  );
};
