// Short 013 — "Who Goes First When the Traffic Light Is Dead?" (1080x1920, 30 fps, no music, no SFX). New engine.
// Script: yt-channel content/scripts/short-013-dark-signal.md (factcheck v2 PASS). Real VASKO voice + word timing.
// One daylight intersection, one continuous camera (high 3/4 -> orbit -> street level -> back up to frame 0).
// Cars: red pickup (south), grey minivan (west), cream sedan (north), white utility pickup with Lineman (east).
// The officer is a generic blocky figure: no department name, badge, seal or shield. No vehicle makes, no plates.
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import timing from './s013_timing.json';
import {Box, Lineman, useTextTexture} from '../three/kit';
import {CamKey, camAt, camSpeed, Decal, Inked, LookCanvas, popK, project, Puff, Rig, RigCam, Sign} from '../three/look';
import {Captions, makeChunks, makeCue, Timing} from './common';

type V3 = [number, number, number];
const FPS = 30;
const TM = timing as unknown as Timing;
const END = TM.duration + 0.4;
export const S013_FPS = FPS;
export const S013_FRAMES = Math.round(END * FPS);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const q = makeCue(TM.words);
const T = {
  stopSign: q('is a stop sign'),
  four: q('But when four cars stop'),
  ny: q('is New York law'),
  ca: q('The California DMV agrees'),
  fl: q('So does Florida law'),
  wa: q('Washington calls it'),
  allway: q('an all way stop'),
  watch: q('Watch this corner'),
  pickup: q('The red pickup gets'),
  goes1: q('so it goes first'),
  van: q('Then the van'),
  lastTwo: q('The last two stop'),
  nobody: q('Nobody moves'),
  police: q('Then a police officer'),
  raises: q('raises a hand'),
  now: q('Now the officer beats'),
  beats: q('beats the stop sign'),
  inNY: q('In New York if an officer'),
  waves: q('waves you through'),
  calif: q('California says follow'),
  wash: q('Washington law names'),
  power: q('The power comes back'),
  blinking: q('blinking red'),
  nysDmv: q("New York's DMV says"),
  whenDark: q("When it's dark who goes"),
  whoever: q('Whoever the officer waves on'),
  noOfficer: q('No officer'),
  first: q("California's DMV says the first"),
  tie: q('A tie'),
  yieldR: q('Yield to the car on your right'),
  again: q("It's dark again"),
};
const CHUNKS = makeChunks(TM, ['DEAD', 'STOP', 'FIRST', 'LAW', 'DMV', 'ALL', 'CORNER', 'RED', 'VAN', 'TIME', 'NOBODY', 'OFFICER', 'BEATS', 'GO', 'ORDERS', 'FLAGGERS', 'FIREFIGHTERS', 'BLINKING', 'DARK', 'WAVES', 'TIE', 'RIGHT', 'AGAIN', 'HAND', 'SIGNALS', 'THERE']);

// ---------- approaches: lane + stop line; d = distance of the front bumper before the line ----------
type App = 'S' | 'N' | 'E' | 'W';
const LANE = 2;
const LINE = 5;
const carPos = (a: App, d: number, half: number): {p: V3; r: number} => {
  const k = LINE + d + half;
  if (a === 'S') return {p: [LANE, 0, k], r: Math.PI};
  if (a === 'N') return {p: [-LANE, 0, -k], r: 0};
  if (a === 'E') return {p: [k, 0, -LANE], r: -Math.PI / 2};
  return {p: [-k, 0, LANE], r: Math.PI / 2};
};
const linePt = (a: App, up = 0): V3 => (a === 'S' ? [LANE, 0, LINE + up] : a === 'N' ? [-LANE, 0, -LINE - up] : a === 'E' ? [LINE + up, 0, -LANE] : [-LINE - up, 0, LANE]);
const lineRot = (a: App) => (a === 'S' ? 0 : a === 'N' ? Math.PI : a === 'E' ? Math.PI / 2 : -Math.PI / 2);

// smooth piecewise track [t, d]
const track = (pts: [number, number][]) => (t: number) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const [t0, d0] = pts[i - 1];
      const [t1, d1] = pts[i];
      if (t1 - t0 < 0.02) return d1;
      const u = (t - t0) / (t1 - t0);
      const e = d1 < d0 && d1 > 0.3 ? Easing.out(Easing.cubic)(u) : d1 < d0 ? Easing.in(Easing.quad)(u) : Easing.inOut(Easing.cubic)(u);
      return d0 + (d1 - d0) * e;
    }
  }
  return pts[pts.length - 1][1];
};
const END_ = END;
const D = {
  S: track([[0, 5], [2.4, 0.6], [T.watch, 0.6], [T.watch + 0.35, 4.5], [T.pickup + 0.7, 0.6], [T.goes1, 0.6], [T.goes1 + 1.9, -18], [T.noOfficer, -18], [T.noOfficer + 0.01, 5], [T.noOfficer + 0.7, 0.6], [T.noOfficer + 1.1, 0.6], [T.noOfficer + 2.6, -18], [T.again + 0.3, -18], [T.again + 0.31, 5.8], [END_, 5]]),
  W: track([[0, 7], [2.9, 0.6], [T.watch, 0.6], [T.watch + 0.35, 6.5], [T.van - 1.2, 0.6], [T.van, 0.6], [T.van + 2.0, -18], [T.noOfficer, -18], [T.noOfficer + 0.01, 6], [T.noOfficer + 1.4, 0.6], [T.noOfficer + 1.9, 0.6], [T.noOfficer + 3.4, -18], [T.again + 0.3, -18], [T.again + 0.31, 7.8], [END_, 7]]),
  N: track([[0, 8], [3.3, 0.6], [T.watch, 0.6], [T.watch + 0.35, 8], [T.lastTwo + 0.7, 0.6], [T.nobody + 0.1, 0.6], [T.nobody + 0.25, 0.35], [T.nobody + 0.5, 0.6], [T.noOfficer, 0.6], [T.noOfficer + 0.01, 6], [T.tie, 6], [T.tie + 0.6, 0.6], [T.yieldR, 0.6], [T.yieldR + 1.3, -18], [T.again + 0.3, -18], [T.again + 0.31, 8.8], [END_, 8]]),
  E: track([[0, 8], [3.3, 0.6], [T.watch, 0.6], [T.watch + 0.35, 8], [T.lastTwo + 0.7, 0.6], [T.nobody + 0.1, 0.6], [T.nobody + 0.25, 0.35], [T.nobody + 0.5, 0.6], [T.waves + 0.2, 0.6], [T.waves + 2.4, -18], [T.whenDark, -18], [T.whenDark + 0.01, 0.6], [T.whoever + 0.6, 0.6], [T.whoever + 2.0, -18], [T.noOfficer, -18], [T.noOfficer + 0.01, 6], [T.tie, 6], [T.tie + 0.6, 0.6], [T.yieldR + 0.9, 0.6], [T.again + 0.3, -9], [T.again + 0.31, 8.8], [END_, 8]]),
};
const stopped = (fn: (t: number) => number, t: number) => Math.abs(fn(t) - fn(t - 0.1)) < 0.02 && fn(t) > 0;

// ---------- vehicles (generic, no make, no plates) ----------
const Wheels: React.FC<{z: number}> = ({z}) => (
  <>
    {[-1.08, 1.08].map((x) => [-z, z].map((zz) => <Box key={`${x}${zz}`} p={[x, 0.38, zz]} s={[0.28, 0.76, 0.76]} c="#1d1d22" />))}
  </>
);
const BrakeLights: React.FC<{z: number; on: boolean; y?: number}> = ({z, on, y = 1.0}) => (
  <>
    {[-0.85, 0.85].map((x) => <Box key={x} p={[x, y, z]} s={[0.35, 0.2, 0.04]} c="#c4251c" e={on ? 2.2 : 0.2} />)}
  </>
);
const Pickup: React.FC<{c: string; brake: boolean}> = ({c, brake}) => (
  <group>
    <Box p={[0, 0.9, 2.05]} s={[2.3, 0.9, 1.3]} c={c} />
    <Box p={[0, 1.45, 0.85]} s={[2.3, 1.3, 1.6]} c={c} />
    <Box p={[0, 1.7, 1.66]} s={[2.0, 0.65, 0.04]} c="#2f3d4d" />
    <Box p={[0, 0.9, -1.3]} s={[2.3, 0.9, 2.3]} c={c} />
    <Box p={[0, 1.0, -1.3]} s={[2.0, 0.8, 2.1]} c="#5a1d16" />
    <Wheels z={1.6} />
    <BrakeLights z={-2.47} on={brake} />
  </group>
);
const Van: React.FC<{c: string; brake: boolean}> = ({c, brake}) => (
  <group>
    <Box p={[0, 1.35, 0]} s={[2.3, 1.9, 4.8]} c={c} />
    <Box p={[0, 1.85, 2.41]} s={[2.0, 0.7, 0.04]} c="#2f3d4d" />
    {[-1.16, 1.16].map((x) => <Box key={x} p={[x, 1.8, 0.3]} s={[0.04, 0.6, 3.2]} c="#2f3d4d" />)}
    <Wheels z={1.6} />
    <BrakeLights z={-2.42} on={brake} y={1.3} />
  </group>
);
const Sedan: React.FC<{c: string; brake: boolean}> = ({c, brake}) => (
  <group>
    <Box p={[0, 0.85, 0]} s={[2.2, 0.8, 4.6]} c={c} />
    <Box p={[0, 1.6, -0.2]} s={[1.9, 0.75, 2.3]} c={c} />
    <Box p={[0, 1.6, 0.96]} s={[1.7, 0.6, 0.04]} c="#2f3d4d" />
    {[-0.96, 0.96].map((x) => <Box key={x} p={[x, 1.62, -0.2]} s={[0.04, 0.55, 1.9]} c="#2f3d4d" />)}
    {/* blank kit-style driver */}
    <Box p={[0.45, 1.6, 0.25]} s={[0.5, 0.5, 0.5]} c="#c98d63" />
    <Wheels z={1.5} />
    <BrakeLights z={-2.32} on={brake} />
  </group>
);
// white utility pickup: see-through cab so Lineman (kit, unchanged) shows at the wheel; driver window open
export const Utility: React.FC<{brake: boolean; f: number; look: number}> = ({brake, f, look}) => (
  <group>
    <Box p={[0, 0.9, 2.05]} s={[2.4, 0.9, 1.3]} c="#f4f4f0" />
    <Box p={[0, 0.95, 0.75]} s={[2.4, 1.0, 1.8]} c="#f4f4f0" />
    <Box p={[0, 2.62, 0.75]} s={[2.4, 0.1, 1.8]} c="#f4f4f0" />
    {[[-1.15, 1.6], [1.15, 1.6], [-1.15, -0.1], [1.15, -0.1]].map(([x, z]) => <Box key={`${x}${z}`} p={[x, 2.05, z]} s={[0.1, 1.15, 0.1]} c="#e6e6e0" />)}
    <mesh position={[0, 2.05, 1.62]}>
      <boxGeometry args={[2.25, 1.1, 0.03]} />
      <meshStandardMaterial color="#cfe6f5" transparent opacity={0.22} depthWrite={false} />
    </mesh>
    <Box p={[0, 2.72, 0.75]} s={[0.6, 0.12, 0.25]} c="#ffb238" e={0.6} />
    <Box p={[0, 0.9, -1.35]} s={[2.4, 0.9, 2.3]} c="#f4f4f0" />
    {[-1.1, 1.1].map((x) => <Box key={x} p={[x, 1.45, -1.35]} s={[0.2, 0.25, 2.3]} c="#8a8f99" />)}
    <Wheels z={1.6} />
    <BrakeLights z={-2.52} on={brake} />
    <Lineman frame={f} pos={[0.55, -0.62, 0.55]} rotY={0} pose={{armRx: -0.9, armR: 0.15, brows: 'up', lookX: look, lookY: 0.2}} />
  </group>
);
const Car: React.FC<{a: App; d: number; half: number; children: React.ReactNode}> = ({a, d, half, children}) => {
  if (d < -17.5) return null;
  const {p, r} = carPos(a, d, half);
  return (
    <group position={p} rotation={[0, r, 0]}>
      {children}
    </group>
  );
};

// ---------- officer: generic blocky figure, faceless, plain uniform, nothing written anywhere ----------
const OBox: React.FC<{p: V3; s: V3; c: string; o: number}> = ({p, s, c, o}) => (
  <mesh position={p} castShadow={o > 0.9}>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} transparent={o < 1} opacity={o} depthWrite={o >= 1} />
  </mesh>
);
const Officer: React.FC<{p: V3; r: number; palm: number; wave: number; t: number; o: number}> = ({p, r, palm, wave, t, o}) => {
  if (o <= 0.01) return null;
  const sw = Math.sin(t * 9) * 0.35 * wave;
  return (
    <group position={p} rotation={[0, r, 0]}>
      {[-0.22, 0.22].map((x) => <OBox key={x} p={[x, 0.45, 0]} s={[0.36, 0.9, 0.4]} c="#1f2a44" o={o} />)}
      <OBox p={[0, 1.35, 0]} s={[1.0, 0.95, 0.55]} c="#2b3a5a" o={o} />
      <OBox p={[0, 1.35, 0.02]} s={[1.04, 0.7, 0.58]} c="#3a3f47" o={o} />
      <OBox p={[0, 2.22, 0]} s={[0.8, 0.75, 0.75]} c="#c48a62" o={o} />
      <OBox p={[0, 2.66, 0.05]} s={[0.86, 0.18, 0.86]} c="#1b2233" o={o} />
      <OBox p={[0, 2.58, 0.45]} s={[0.86, 0.06, 0.3]} c="#1b2233" o={o} />
      {/* right arm: raised palm forward */}
      <group position={[-0.65, 1.72, 0]} rotation={[-2.9 * palm, 0, 0]}>
        <OBox p={[0, -0.38, 0]} s={[0.3, 0.85, 0.36]} c="#2b3a5a" o={o} />
        <OBox p={[0, -0.9, 0.02]} s={[0.34, 0.26, 0.16]} c="#c48a62" o={o} />
      </group>
      {/* left arm: waves the truck through */}
      <group position={[0.65, 1.72, 0]} rotation={[-1.4 * wave, 0, -(1.0 * wave + sw)]}>
        <OBox p={[0, -0.38, 0]} s={[0.3, 0.85, 0.36]} c="#2b3a5a" o={o} />
        <OBox p={[0, -0.88, 0]} s={[0.26, 0.2, 0.3]} c="#c48a62" o={o} />
      </group>
    </group>
  );
};

// ---------- glowing stop lines + holographic octagons ----------
const Octagon: React.FC<{a: App; k: number; label: string; blink?: number}> = ({a, k, label, blink = 1}) => {
  const tex = useTextTexture(label || ' ', {w: 256, h: 256, color: '#ffffff', bg: 'rgba(0,0,0,0)', size: 170});
  if (k <= 0.01) return null;
  const [x, , z] = linePt(a, 0.4);
  return (
    <group position={[x, 2.3, z]} rotation={[0, lineRot(a), 0]} scale={k}>
      <mesh rotation={[0, 0, Math.PI / 8]}>
        <circleGeometry args={[0.85, 8]} />
        <meshBasicMaterial color="#ff3326" transparent opacity={0.7 * blink} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 8]}>
        <ringGeometry args={[0.78, 0.85, 8]} />
        <meshBasicMaterial color="#ff8a80" transparent opacity={0.9 * blink} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {label && (
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.0, 1.0]} />
          <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} depthWrite={false} opacity={blink} />
        </mesh>
      )}
    </group>
  );
};
const StopLine: React.FC<{a: App; k: number}> = ({a, k}) => {
  if (k <= 0.01) return null;
  const [x, , z] = linePt(a, 0.15);
  return (
    <mesh position={[x, 0.03, z]} rotation={[-Math.PI / 2, 0, a === 'E' || a === 'W' ? Math.PI / 2 : 0]}>
      <planeGeometry args={[3.6 * Math.min(1, k * 1.2), 0.35]} />
      <meshBasicMaterial color="#ff3326" transparent opacity={0.95 * k} toneMapped={false} />
    </mesh>
  );
};
// painted arrow on the road (flat), from a to b
const RoadArrow: React.FC<{a: V3; b: V3; c: string; k: number}> = ({a, b, c, k}) => {
  if (k <= 0.01) return null;
  const dx = b[0] - a[0], dz = b[2] - a[2];
  const len = Math.hypot(dx, dz) * k;
  const ang = Math.atan2(dx, dz);
  return (
    <group position={[a[0], 0.05, a[2]]} rotation={[0, ang, 0]}>
      <mesh position={[0, 0, len / 2 - 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.35, Math.max(0.01, len - 0.6)]} />
        <meshBasicMaterial color={c} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, len - 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 3, Math.PI / 2 - Math.PI / 3]} />
        <meshBasicMaterial color={c} toneMapped={false} />
      </mesh>
    </group>
  );
};

// ---------- the intersection ----------
const SIG_POLE: V3 = [-6.6, 0, 6.6];
const PLATE_POLE: V3 = [-6.6, 0, -6.6];
const HEAD: V3 = [1.7, 6.1, 6.6];
const Street: React.FC = () => (
  <Inked>
    {/* asphalt + lawns + sidewalks */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#8fc27a" roughness={1} />
    </mesh>
    <Box p={[0, 0.005, 0]} s={[9.2, 0.01, 80]} c="#a9a9ad" />
    <Box p={[0, 0.006, 0]} s={[80, 0.01, 9.2]} c="#a9a9ad" />
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
      <group key={`${sx}${sz}`}>
        <Box p={[sx * 5.6, 0.06, sz * 22]} s={[2.0, 0.12, 35]} c="#e9e2cf" />
        <Box p={[sx * 22, 0.06, sz * 5.6]} s={[35, 0.12, 2.0]} c="#e9e2cf" />
        <Box p={[sx * 8, 0.8, sz * 8]} s={[1.4, 1.6, 1.4]} c="#6faa5e" />
      </group>
    ))}
    {/* center lines (yellow), lane edges (white dashes) */}
    {[-1, 1].map((s) => (
      <group key={s}>
        <Box p={[0, 0.012, s * 22]} s={[0.12, 0.01, 34]} c="#f2c230" />
        <Box p={[s * 22, 0.012, 0]} s={[34, 0.01, 0.12]} c="#f2c230" />
      </group>
    ))}
    {Array.from({length: 8}).map((_, i) => (
      <group key={i}>
        {[-1, 1].map((s) => (
          <React.Fragment key={s}>
            <Box p={[s * 4.2, 0.012, 7 + i * 3]} s={[0.12, 0.01, 1.4]} c="#ffffff" />
            <Box p={[s * 4.2, 0.012, -7 - i * 3]} s={[0.12, 0.01, 1.4]} c="#ffffff" />
            <Box p={[7 + i * 3, 0.012, s * 4.2]} s={[1.4, 0.01, 0.12]} c="#ffffff" />
            <Box p={[-7 - i * 3, 0.012, s * 4.2]} s={[1.4, 0.01, 0.12]} c="#ffffff" />
          </React.Fragment>
        ))}
      </group>
    ))}
    {/* houses in soft background */}
    {[[-16, -14, '#e6d3b3'], [15, -15, '#d9c7e0'], [16, 15, '#cfe0d0'], [-16, 15, '#e9dcc2']].map(([x, z, c]) => (
      <group key={`${x}${z}`} position={[x as number, 0, z as number]}>
        <Box p={[0, 2, 0]} s={[8, 4, 7]} c={c as string} />
        <mesh position={[0, 5.2, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[6.2, 2.4, 4]} />
          <meshStandardMaterial color="#8a5a4a" />
        </mesh>
      </group>
    ))}
    {/* signal pole + mast arm + plate pole */}
    <Box p={[SIG_POLE[0], 3.6, SIG_POLE[2]]} s={[0.35, 7.2, 0.35]} c="#6c7078" />
    <Box p={[(SIG_POLE[0] + HEAD[0] + 0.8) / 2, 7.0, SIG_POLE[2]]} s={[HEAD[0] + 0.8 - SIG_POLE[0], 0.22, 0.22]} c="#6c7078" />
    <Box p={[PLATE_POLE[0], 2.4, PLATE_POLE[2]]} s={[0.25, 4.8, 0.25]} c="#6c7078" />
  </Inked>
);
export const Signal: React.FC<{lamp: number}> = ({lamp}) => (
  <group position={HEAD}>
    <Box p={[0, 0.65, 0]} s={[0.1, 0.5, 0.1]} c="#2b2b30" />
    <Box p={[0, 0, -0.05]} s={[1.6, 3.4, 0.08]} c="#f2c230" />
    <Box p={[0, 0, 0.2]} s={[1.0, 2.9, 0.5]} c="#16161a" />
    {[0.9, 0, -0.9].map((y, i) => (
      <group key={y} position={[0, y, 0.46]}>
        <mesh>
          <circleGeometry args={[0.33, 24]} />
          <meshBasicMaterial color={i === 0 ? (lamp > 0.02 ? new THREE.Color('#2a0806').lerp(new THREE.Color('#ff2a1a'), lamp) : '#2a0806') : i === 1 ? '#2a2006' : '#062a12'} toneMapped={false} />
        </mesh>
        <Box p={[0, 0.3, 0.12]} s={[0.75, 0.06, 0.28]} c="#16161a" />
      </group>
    ))}
    {lamp > 0.05 && <pointLight position={[0, 0.9, 1.0]} intensity={4 * lamp} distance={5} color="#ff3a26" />}
  </group>
);

// ---------- camera ----------
const K0: CamKey = {t: 0, pos: [0.6, 8.2, 15.6], tgt: [1.7, 3.4, 5.0], fov: 60, push: 0.14};
const KEYS: CamKey[] = [
  K0,
  {t: T.four, pos: [-6.5, 10, 13], tgt: [0, 1.0, 0], fov: 60, move: 1.6, push: 0.04},
  {t: T.ny, pos: [-2.5, 10, -20], tgt: [-2, 0, -8], fov: 56, move: 0.9},
  {t: T.ca, pos: [20, 10, -2.5], tgt: [8, 0, -2], fov: 56, move: 0.9},
  {t: T.fl, pos: [2.5, 10, 20], tgt: [2, 0, 8], fov: 56, move: 0.9},
  {t: T.wa, pos: [-20, 10, 2.5], tgt: [-9.5, 0, 2], fov: 56, move: 0.9},
  {t: T.allway, pos: [-9, 14, 11], tgt: [0, 0, 0], fov: 60, move: 0.7},
  {t: T.watch, pos: [-8, 12.5, 10], tgt: [0, 0, 0.5], fov: 60, move: 0.6},
  {t: T.pickup, pos: [7, 6.5, 15], tgt: [2, 0.6, 5], fov: 58, move: 0.6},
  {t: T.van, pos: [-13, 6.5, 9], tgt: [-5, 0.6, 2], fov: 58, move: 0.6},
  {t: T.lastTwo, pos: [12, 10, 6], tgt: [2, 1.0, -4], fov: 60, move: 0.7},
  {t: T.nobody, pos: [3.0, 2.9, -5.0], tgt: [7.0, 2.0, -2.0], fov: 60, move: 0.6},
  {t: T.police, pos: [6.0, 2.6, 2.4], tgt: [0.4, 1.8, -1.0], fov: 60, move: 0.7},
  {t: T.now, pos: [4.4, 2.1, 0.6], tgt: [-0.6, 2.2, -2.6], fov: 60, move: 0.6},
  {t: T.inNY, pos: [3.6, 2.6, 1.3], tgt: [7.3, 1.7, -1.45], fov: 50, move: 0.6, push: 0.08}, // Lineman's face through the cab
  {t: T.waves + 0.2, pos: [7.5, 5.5, 5.5], tgt: [-2, 0.8, -2.5], fov: 60, move: 0.7},
  {t: T.calif, pos: [5.5, 4.2, 5.0], tgt: [-2.0, 1.4, -5.5], fov: 58, move: 0.6},
  {t: T.wash, pos: [-2.6, 3.4, -2.8], tgt: [-6.4, 4.0, -6.4], fov: 52, move: 0.6},
  {t: T.power, pos: [3.0, 2.0, 14.5], tgt: [1.7, 5.2, 6.6], fov: 58, move: 0.7},
  {t: T.nysDmv, pos: [2.4, 4.2, 16.5], tgt: [2.0, 0.6, 9.0], fov: 56, move: 0.6},
  {t: T.whenDark, pos: [6, 9, 12], tgt: [0.5, 0.5, 0], fov: 60, move: 0.7},
  {t: T.whoever, pos: [3, 13.5, 6.5], tgt: [2.5, 0, -1.2], fov: 60, move: 0.6},
  {t: T.noOfficer, pos: [-1, 15.5, 10], tgt: [0, 0, 0.5], fov: 60, move: 0.6},
  {t: T.tie, pos: [6.5, 12.5, 4.5], tgt: [2.0, 0, -2.5], fov: 60, move: 0.6},
  {t: T.again - 0.2, pos: K0.pos, tgt: K0.tgt, fov: K0.fov, move: END - 1 / FPS - (T.again - 0.2), push: 0},
];

const lampAt = (t: number) => {
  if (t < 0.2) return 0.5 * (1 - t / 0.2);
  if (t >= T.blinking && t < T.whenDark) return Math.floor((t - T.blinking) * 1.4) % 2 === 0 ? 1 : 0;
  if (t >= END - 0.35) return interpolate(t, [END - 0.35, END - 0.22, END], [0, 1, 0.55], cl);
  return 0;
};

export const Short013: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = camAt(KEYS, t);
  const blur = Math.min(5, Math.max(0, (camSpeed(KEYS, t, FPS) - 6) * 0.8));
  const lamp = lampAt(t);
  const dS = D.S(t), dW = D.W(t), dN = D.N(t), dE = D.E(t);
  // octagons + lines: pop at 0.7 s, blown off at "beats"; replays show the lines again; only the hero approach blinks
  const lines1 = t >= 0.7 && t < T.beats + 0.5 ? popK(t, 0.7) * interpolate(t, [T.beats, T.beats + 0.45], [1, 0], cl) : 0;
  const blinkHero = t >= T.blinking && t < T.whenDark ? lamp : 0;
  const lines2 = t >= T.whenDark && t < T.again ? popK(t, T.whenDark + 0.1) : 0;
  const lab = (a: App) => {
    if (a === 'S') return t >= T.pickup + 0.6 && t < T.goes1 + 0.3 ? '1' : '';
    if (a === 'W') return t >= T.van - 1.1 && t < T.van + 0.3 ? '2' : '';
    return t >= T.lastTwo + 0.7 ? '?' : '';
  };
  const octK = (a: App) => (a === 'S' && blinkHero > 0 ? 1 : lines1) * ((a === 'S' && t > T.goes1 + 0.2 && t < T.beats) || (a === 'W' && t > T.van + 0.2 && t < T.beats) ? 0 : 1);
  const officerO = t < T.police ? 0 : t < T.noOfficer ? 1 : interpolate(t, [T.noOfficer, T.noOfficer + 0.5], [1, 0], cl);
  const walk = interpolate(t, [T.police + 0.2, T.police + 1.4], [0, 1], cl);
  const offP: V3 = [6.4 + (0.4 - 6.4) * walk, 0, 4.6 + (0.6 - 4.6) * walk];
  const offR = walk < 1 ? Math.atan2(0.4 - 6.4, 0.6 - 4.6) : -2.84;
  const palm = t >= T.raises - 0.2 ? interpolate(t, [T.raises - 0.2, T.raises + 0.2], [0, 1], cl) : 0;
  const wave = t >= T.waves - 0.2 && t < T.waves + 1.6 ? 1 : t >= T.whoever && t < T.whoever + 1.4 ? 1 : 0;
  const pOct = (a: App) => project(cam, [...linePt(a, 0.4).slice(0, 1), 2.3, linePt(a, 0.4)[2]] as V3);
  const replay = [T.watch, T.whenDark, T.noOfficer].some((r) => t >= r && t < r + 0.35);
  return (
    <AbsoluteFill style={{background: '#cfe3f5'}}>
      <LookCanvas blur={blur}>
        <RigCam {...cam} />
        <color attach="background" args={['#bcdcf5']} />
        <Rig keyPos={[-12, 18, 8]} keyColor="#fff0d8" keyI={3.2} fillI={1.8} fog={['#dbe9f4', 30, 75]} />
        <Street />
        <Signal lamp={lamp} />
        {/* cars */}
        <Car a="S" d={dS} half={2.5}><Pickup c="#d8402c" brake={stopped(D.S, t)} /></Car>
        <Car a="W" d={dW} half={2.4}><Van c="#8c9096" brake={stopped(D.W, t)} /></Car>
        <Car a="N" d={dN} half={2.3}><Sedan c="#e9dcb8" brake={stopped(D.N, t)} /></Car>
        <Car a="E" d={dE} half={2.5}><Utility brake={stopped(D.E, t)} f={f} look={t < T.four ? -0.45 : -0.1} /></Car>
        <Officer p={offP} r={offR} palm={palm} wave={wave} t={t} o={officerO} />
        {(['S', 'W', 'N', 'E'] as App[]).map((a) => (
          <React.Fragment key={a}>
            <StopLine a={a} k={a === 'S' && blinkHero > 0 ? blinkHero : Math.max(lines1, lines2)} />
            <Octagon a={a} k={octK(a)} label={lab(a)} blink={a === 'S' && blinkHero > 0 ? blinkHero : 1} />
          </React.Fragment>
        ))}
        {/* road stencils (state credits), plates on the poles */}
        <Decal title="NY LAW" bg="transparent" color="#ffffff" p={[-2, 0.03, -12.5]} rot={[-Math.PI / 2, 0, Math.PI]} width={3.0} h={256} k={t >= T.ny && t < T.power ? popK(t, T.ny + 0.15) : 0} size={170} />
        <Decal title="CA DMV" bg="transparent" color="#ffffff" p={[12.5, 0.03, -2]} rot={[-Math.PI / 2, 0, Math.PI / 2]} width={3.0} h={256} k={t >= T.ca && t < T.power ? popK(t, T.ca + 0.15) : 0} size={170} />
        <Decal title="FL LAW" bg="transparent" color="#ffffff" p={[2, 0.03, 12.5]} rot={[-Math.PI / 2, 0, 0]} width={3.0} h={256} k={t >= T.fl && t < T.power ? popK(t, T.fl + 0.15) : 0} size={170} />
        <Decal title="WA: ALL-WAY STOP" bg="transparent" color="#ffffff" p={[-12.8, 0.03, 2]} rot={[-Math.PI / 2, 0, -Math.PI / 2]} width={3.6} h={256} k={t >= T.wa && t < T.power ? popK(t, T.wa + 0.15) : 0} size={120} />
        <Decal title="FIRST THERE, FIRST GO · CA DMV" bg="transparent" color="#ffffff" p={[2, 0.035, 13.5]} rot={[-Math.PI / 2, 0, 0]} width={3.6} h={300} k={(t >= T.pickup && t < T.now) || (t >= T.noOfficer && t < T.tie) ? popK(t, t >= T.noOfficer ? T.first : T.pickup + 0.5) : 0} size={90} />
        <Decal title="FLASHING RED = STOP · NY DMV" bg="transparent" color="#ffffff" p={[2, 0.035, 11.0]} rot={[-Math.PI / 2, 0, 0]} width={4.0} h={300} k={t >= T.nysDmv && t < T.whenDark ? popK(t, T.nysDmv + 0.2) : 0} size={90} />
        <Decal title="TIE: YIELD RIGHT · CA DMV" bg="transparent" color="#ffd21f" p={[2.6, 0.035, -3.2]} rot={[-Math.PI / 2, 0, Math.PI / 2]} width={3.4} h={300} k={t >= T.tie && t < T.again ? popK(t, T.yieldR) : 0} size={92} />
        <Decal title="1" bg="transparent" color="#ffffff" p={[2, 0.035, 7.0]} rot={[-Math.PI / 2, 0, 0]} width={1.2} h={512} k={t >= T.noOfficer && t < T.tie ? popK(t, T.noOfficer + 0.6) : 0} size={360} />
        <Decal title="2" bg="transparent" color="#ffffff" p={[-7.0, 0.035, 2]} rot={[-Math.PI / 2, 0, -Math.PI / 2]} width={1.2} h={512} k={t >= T.noOfficer && t < T.tie ? popK(t, T.noOfficer + 1.3) : 0} size={360} />
        <Sign title="NY LAW · CA DMV" bg="#e9ecef" p={[SIG_POLE[0] + 0.25, 3.0, SIG_POLE[2] + 0.25]} rotY={Math.PI / 4} width={1.4} h={300} k={t < T.ny - 0.6 ? 1 : 0} t={0} size={110} />
        <Sign title="NY DMV: OFFICER FIRST" bg="#e9ecef" p={[PLATE_POLE[0] + 0.25, 4.0, PLATE_POLE[2] + 0.25]} rotY={Math.PI / 4} width={1.6} h={300} k={t >= T.inNY && t < T.power ? popK(t, T.inNY + 0.1) : 0} t={0} size={96} />
        <Sign title="CA DMV: FOLLOW THEIR ORDERS" bg="#e9ecef" p={[PLATE_POLE[0] + 0.25, 3.1, PLATE_POLE[2] + 0.25]} rotY={Math.PI / 4} width={1.6} h={300} k={t >= T.calif && t < T.power ? popK(t, T.calif + 0.1) : 0} t={0} size={90} />
        <Sign title="WA LAW: OFFICER · FLAGGER · FIREFIGHTER" sub="🧢  🚩  ⛑" bg="#e9ecef" p={[PLATE_POLE[0] + 0.25, 2.1, PLATE_POLE[2] + 0.25]} rotY={Math.PI / 4} width={1.6} h={400} k={t >= T.wash && t < T.power ? popK(t, T.wash + 0.2) : 0} t={0} size={80} />
        {/* continuity: the officer's arrow points at Lineman's truck */}
        <RoadArrow a={[0.6, 0, -0.4]} b={[6.2, 0, -2]} c="#ffffff" k={t >= T.whoever && t < T.noOfficer ? interpolate(t, [T.whoever, T.whoever + 0.4], [0, 1], cl) : 0} />
        {/* tie: Lineman yields to the car on his right (the sedan) */}
        <RoadArrow a={[6.2, 0, -2.6]} b={[-1.2, 0, -5.4]} c="#ffd21f" k={t >= T.yieldR - 0.2 && t < T.again ? interpolate(t, [T.yieldR - 0.2, T.yieldR + 0.3], [0, 1], cl) : 0} />
      </LookCanvas>
      {(['S', 'W', 'N', 'E'] as App[]).map((a) => {
        const p = pOct(a);
        return <Puff key={a} x={p.x} y={p.y} t={t} at={T.beats} s={1.3} color="#ffb3ab" />;
      })}
      {replay && <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.10) 0 6px, rgba(0,0,0,0) 6px 18px)', mixBlendMode: 'screen'}} />}
      <Captions t={t} chunks={CHUNKS} />
      <Audio src={staticFile('shorts2/s013.mp3')} />
    </AbsoluteFill>
  );
};
