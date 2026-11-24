// Short 012 — "Your Water Heater Is a Hidden Water Tank" (1080x1920, 30 fps, no music). New engine (three/look.tsx).
// Script: yt-channel content/scripts/short-012-water-heater.md (fact-check v2.1). Real VASKO voice + word timing (s012_timing.json).
// One continuous dollhouse set (basement heater + boiler, kitchen, bathroom); the camera moves, never cuts.
// Rules: no brands, no numbers, no hands on taps or drain valves, no boiler/radiator water shown, Volt never touches anything.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import timing from './s012_timing.json';
import {Box, Lineman, Pose, Volt} from '../three/kit';
import {CamKey, camAt, camSpeed, Decal, Inked, LookCanvas, Pool, popK, Rig, RigCam, Sign} from '../three/look';

type V3 = [number, number, number];
const FPS = 30;
const END = timing.duration + 0.4;
export const S012_FPS = FPS;
export const S012_FRAMES = Math.round(END * FPS);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const W = timing.words as [string, number, number][];

// ---------- cues (decoder spells acronyms: c d c, e p a) ----------
const toks = (text: string) => {
  const out: string[] = [];
  for (const raw of text.replace(/-/g, ' ').match(/[A-Za-z][A-Za-z']*/g) ?? []) {
    if (raw.length >= 2 && raw === raw.toUpperCase()) out.push(...raw.toLowerCase().split(''));
    else out.push(raw.toLowerCase().replace(/'/g, raw.toLowerCase() === "heater's" ? '' : "'"));
  }
  return out;
};
const q = (head: string, after = 0) => {
  const h = toks(head);
  for (let i = 0; i + h.length <= W.length; i++) {
    if (W[i][1] < after - 0.001) continue;
    if (h.every((x, j) => W[i + j][0] === x)) return W[i][1];
  }
  throw new Error(`cue not found: ${head}`);
};
const T = {
  cdc1: q('The CDC says so'),
  two: q('But some homes have two tanks'),
  never1: q('you should never drink from one'),
  ifTank: q('If your heater has a tank'),
  feeds: q('it feeds your hot faucet'),
  hot: q('hot faucet and shower'),
  shower: q('and shower'),
  bottled: q('Out of bottled water'),
  epa1: q('The EPA says you may'),
  drain: q('drain your hot water tank'),
  pipes: q('or even your pipes'),
  careful: q('Careful though'),
  older: q('Some older homes'),
  radiators: q('tank for the radiators'),
  cdc2: q('The CDC says never'),
  boilerWater: q('radiator or boiler water'),
  sick: q('This water could make you sick'),
  use: q('So use the tank'),
  feedsF: q('that feeds your faucets'),
  notHeating: q('not the heating tank'),
  getOut: q('To get the water out'),
  manual: q('in your heaters manual'),
  today: q('Read it today'),
  before: q('Before you drink that water'),
  boil: q('boil it or treat it'),
  treat: q('treat it every time'),
  epa2: q('The EPA says that goes'),
  remember: q('And remember this'),
};

// ---------- captions: real words, up to 3 per chunk, key words yellow ----------
const YELLOW = new Set(['HEATER', 'TANK', 'TANKS', 'CDC', 'NEVER', 'EPA', 'RADIATORS', 'BOILER', 'SICK', 'FAUCETS', 'MANUAL', 'TODAY', 'BOIL', 'TREAT', 'SOURCE', 'PIPES']);
type Chunk = {t: number; words: string[]};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let wi = 0;
  for (const c of timing.captions as {start: number; text: string}[]) {
    const disp = c.text.split(/\s+/).filter(Boolean);
    let cur: Chunk | null = null;
    disp.forEach((d, i) => {
      const bare = d.replace(/[^A-Za-z']/g, '');
      const n = bare.length >= 2 && bare === bare.toUpperCase() ? bare.length : 1;
      const t = W[wi] ? W[wi][1] : c.start;
      wi += n;
      if (!cur || cur.words.length >= 3) {
        cur = {t, words: []};
        out.push(cur);
      }
      cur.words.push(d.toUpperCase());
      if (/[.,?]$/.test(d) && i < disp.length - 1) cur = null;
    });
  }
  return out;
})();
const Captions: React.FC<{t: number}> = ({t}) => {
  let i = -1;
  for (let k = 0; k < CHUNKS.length; k++) if (CHUNKS[k].t <= t + 0.02) i = k;
  if (i < 0) return null;
  const c = CHUNKS[i];
  const k = i === 0 ? 1 : popK(t, c.t);
  return (
    <div style={{position: 'absolute', top: 330, left: 60, right: 170, textAlign: 'center', transform: `scale(${0.9 + 0.1 * k})`, transformOrigin: 'center top'}}>
      {c.words.map((w, j) => {
        const bare = w.replace(/[^A-Z']/g, '').replace(/'S$/, '');
        return (
          <span key={j} style={{fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 900, fontSize: 96, lineHeight: 1.05, color: YELLOW.has(bare) ? '#ffd21f' : '#ffffff', WebkitTextStroke: '12px #14110c', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.45)', marginRight: 22, display: 'inline-block'}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

// ---------- set ----------
const HEATER: V3 = [-1.4, 0, -1.0];
const TANK_R = 0.75;
const TANK_H = 2.3;
const BOILER: V3 = [2.8, 0, -1.2];
const HOT_X = -1.65;
const COLD_X = -1.15;
const G1 = 4.4; // ground floor level
const G2 = 8.8; // upstairs level
const KNOCK_POS: V3 = [0.1, 0, -0.85];
const KNOCK_ROT = -Math.PI / 2 + 0.55; // faces the tank, face turned 3/4 toward the camera
const PANTRY_POS: V3 = [3.45, G1, -0.9];
const MANUAL_POS: V3 = [0.25, 0, -0.15];
const MANUAL_ROT = -0.5;

export const reachArm = (frame: number, pos: V3, rotY: number, target: V3) => {
  const c = Math.cos(rotY), sn = Math.sin(rotY);
  const bob = Math.sin(frame / 8) * 0.03;
  const sway = Math.sin(frame / 12) * 0.06;
  const S: V3 = [pos[0] + 0.65 * c, pos[1] + 1.72 + bob, pos[2] - 0.65 * sn];
  const d = [target[0] - S[0], target[1] - S[1], target[2] - S[2]];
  const lx = d[0] * c - d[2] * sn, ly = d[1], lz = d[0] * sn + d[2] * c;
  const n = Math.hypot(lx, ly, lz);
  const zr = Math.asin(Math.max(-1, Math.min(1, lx / n)));
  const xr = Math.atan2(-lz / n, -ly / n);
  return {armRx: xr, armR: -zr - sway};
};

const Pipe: React.FC<{a: V3; b: V3; c: string; e?: number; r?: number}> = ({a, b, c, e = 0, r = 0.06}) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const mid = A.clone().add(B).multiplyScalar(0.5);
  const qn = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return (
    <mesh position={mid} quaternion={qn} castShadow>
      <cylinderGeometry args={[r, r, A.distanceTo(B), 12]} />
      <meshStandardMaterial color={c} emissive={e > 0 ? '#2aa8ff' : c} emissiveIntensity={e} roughness={0.4} />
    </mesh>
  );
};
// path of the hot line: tank top -> back wall -> up to the bathroom faucet -> along to the shower
const HOT_PATH: V3[] = [
  [HOT_X, TANK_H + 0.05, -1.0],
  [HOT_X, 3.2, -1.0],
  [HOT_X, 3.2, -2.1],
  [HOT_X, G2 + 1.85, -2.1],
  [HOT_X, G2 + 1.95, -1.95],
];
const SHOWER_PATH: V3[] = [
  [HOT_X, G2 + 1.85, -2.1],
  [-3.85, G2 + 1.85, -2.1],
  [-3.85, G2 + 3.2, -2.1],
  [-3.85, G2 + 3.2, -1.65],
];
const COLD_PATH: V3[] = [
  [COLD_X, TANK_H + 0.05, -1.0],
  [COLD_X, 3.5, -1.0],
  [COLD_X, 3.5, -2.05],
  [COLD_X, G1 + 1.9, -2.05],
  [-1.6, G1 + 1.9, -2.05],
];
const Pipes: React.FC<{glow: number}> = ({glow}) => (
  <>
    {HOT_PATH.slice(1).map((b, i) => <Pipe key={`h${i}`} a={HOT_PATH[i]} b={b} c="#d6a77a" e={glow} />)}
    {SHOWER_PATH.slice(1).map((b, i) => <Pipe key={`s${i}`} a={SHOWER_PATH[i]} b={b} c="#d6a77a" e={glow} />)}
    {COLD_PATH.slice(1).map((b, i) => <Pipe key={`c${i}`} a={COLD_PATH[i]} b={b} c="#d6a77a" e={glow} />)}
    {/* red tape on the hot pipe, blue tape on the cold pipe, just above the tank */}
    <Pipe a={[HOT_X, TANK_H + 0.2, -1.0]} b={[HOT_X, TANK_H + 0.45, -1.0]} c="#e0352b" r={0.075} />
    <Pipe a={[COLD_X, TANK_H + 0.2, -1.0]} b={[COLD_X, TANK_H + 0.45, -1.0]} c="#2b7be0" r={0.075} />
  </>
);
const along = (path: V3[], u: number): V3 => {
  const seg: number[] = [];
  let tot = 0;
  for (let i = 1; i < path.length; i++) {
    const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1], path[i][2] - path[i - 1][2]);
    seg.push(d);
    tot += d;
  }
  let x = Math.max(0, Math.min(1, u)) * tot;
  for (let i = 0; i < seg.length; i++) {
    if (x <= seg[i] || i === seg.length - 1) {
      const k = Math.min(1, x / seg[i]);
      const a = path[i], b = path[i + 1];
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    }
    x -= seg[i];
  }
  return path[path.length - 1];
};

// the white tank: shell turns X-ray clear, glowing water inside
const Heater: React.FC<{xray: number; ripple: number; glow: number}> = ({xray, ripple, glow}) => (
  <group position={HEATER}>
    <mesh position={[0, TANK_H / 2 + 0.05, 0]} castShadow={xray < 0.5}>
      <cylinderGeometry args={[TANK_R, TANK_R, TANK_H, 40]} />
      <meshStandardMaterial color="#f7f5f0" roughness={0.35} transparent opacity={1 - 0.8 * xray} depthWrite={xray < 0.5} />
    </mesh>
    {xray > 0.01 && (
      <mesh position={[0, (TANK_H - 0.12) / 2 + 0.08, 0]}>
        <cylinderGeometry args={[TANK_R - 0.05, TANK_R - 0.05, TANK_H - 0.12, 40]} />
        <meshStandardMaterial color="#38d6ff" emissive="#22b8ff" emissiveIntensity={(0.9 + glow) * xray} transparent opacity={0.92 * xray} />
      </mesh>
    )}
    {/* waterline highlight */}
    {xray > 0.01 && (
      <mesh position={[0, TANK_H - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[TANK_R - 0.12, TANK_R - 0.04, 40]} />
        <meshBasicMaterial color="#e8fbff" transparent opacity={0.9 * xray} />
      </mesh>
    )}
    {/* knock ripple: a ring of light sweeping over the shell */}
    {ripple > 0 && ripple < 1 && (
      <mesh position={[0, 1.45 + (ripple - 0.5) * 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[TANK_R + 0.01, 0.025 + 0.03 * (1 - ripple), 8, 48]} />
        <meshBasicMaterial color="#bff4ff" transparent opacity={1 - ripple} />
      </mesh>
    )}
    {/* top cap + base ring */}
    <Box p={[0, TANK_H + 0.08, 0]} s={[0.5, 0.06, 0.5]} c="#d9d6cf" />
    <Box p={[0, 0.04, 0]} s={[1.5, 0.08, 1.5]} c="#c7c2b8" />
  </group>
);
// cast-iron boiler, unlit, nothing inside shown; pipes up to a radiator under the window upstairs
const Boiler: React.FC = () => (
  <group position={BOILER}>
    <Box p={[0, 1.0, 0]} s={[1.6, 2.0, 1.2]} c="#8c4a35" />
    <Box p={[0, 2.05, 0]} s={[1.7, 0.1, 1.3]} c="#6e3a2a" />
    <Box p={[0, 0.7, 0.61]} s={[0.6, 0.45, 0.03]} c="#3b2a24" />
    {[-0.3, 0.3].map((x) => <Box key={x} p={[x, 0.1, 0]} s={[0.18, 0.2, 1.0]} c="#3b2a24" />)}
  </group>
);
const Radiator: React.FC<{p: V3}> = ({p}) => (
  <group position={p}>
    {Array.from({length: 9}).map((_, i) => <Box key={i} p={[-0.64 + i * 0.16, 0.45, 0]} s={[0.11, 0.9, 0.22]} c="#c9c2b4" />)}
    <Box p={[0, 0.1, 0]} s={[1.5, 0.08, 0.2]} c="#b5ad9e" />
  </group>
);
const Jug: React.FC<{p: V3}> = ({p}) => (
  <group position={p}>
    <mesh castShadow>
      <cylinderGeometry args={[0.16, 0.16, 0.4, 20]} />
      <meshStandardMaterial color="#cfefff" transparent opacity={0.75} roughness={0.2} />
    </mesh>
    <Box p={[0, 0.25, 0]} s={[0.1, 0.1, 0.1]} c="#5aa9e6" />
  </group>
);

const House: React.FC<{t: number; f: number}> = ({t, f}) => {
  const faucetLit = interpolate(t, [T.hot + 0.1, T.hot + 0.3], [0, 1], cl) * interpolate(t, [T.bottled, T.bottled + 0.3], [1, 0], cl);
  const showerLit = interpolate(t, [T.shower, T.shower + 0.2], [0, 1], cl) * interpolate(t, [T.bottled, T.bottled + 0.3], [1, 0], cl);
  const runs = t >= T.today - 0.2 && t < T.before + 0.6;
  const boil = interpolate(t, [T.boil - 0.4, T.boil], [0, 1], cl);
  const jugUp = interpolate(t, [T.bottled + 0.35, T.bottled + 0.9], [0, 1], cl);
  const jug: V3 = [4.15 - 0.3 * jugUp, G1 + 1.85 + 0.45 * jugUp, -1.8 + 0.5 * jugUp];
  return (
    <>
      <Inked>
        {/* basement */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.5, 0, 4.5]} receiveShadow>
          <planeGeometry args={[9.2, 13.6]} />
          <meshStandardMaterial color="#b9b4aa" roughness={0.95} />
        </mesh>
        <Box p={[0.5, 2.2, -2.35]} s={[9.2, 4.4, 0.15]} c="#d8d1c4" />
        <Box p={[-4.1, 2.2, 0.1]} s={[0.15, 4.4, 4.8]} c="#cfc7b8" />
        <Box p={[-2.6, 3.6, -2.26]} s={[1.0, 0.5, 0.04]} c="#bfe6ff" e={1.2} />
        {/* mop + shelf, soft background */}
        <Box p={[-3.7, 1.1, 1.2]} s={[0.06, 2.2, 0.06]} c="#a87a4c" />
        <Box p={[-3.75, 0.15, 1.2]} s={[0.3, 0.3, 0.3]} c="#e6dfcf" />
        <Box p={[-3.8, 1.6, -0.6]} s={[0.45, 0.06, 1.4]} c="#b98552" />
        <Box p={[-3.8, 1.82, -0.9]} s={[0.3, 0.4, 0.3]} c="#e8c25a" />
        <Box p={[-3.8, 1.8, -0.3]} s={[0.3, 0.36, 0.3]} c="#7fb37a" />
        {/* ground floor: kitchen */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.5, G1 + 0.01, 0.1]}>
          <planeGeometry args={[9.2, 4.8]} />
          <meshStandardMaterial color="#cfe8f5" transparent opacity={0.22} depthWrite={false} />
        </mesh>
        <Box p={[0.5, G1 + 2.2, -2.35]} s={[9.2, 4.4, 0.15]} c="#f1e4cc" />
        <Box p={[-4.1, G1 + 2.2, 0.1]} s={[0.15, 4.4, 4.8]} c="#ead9bd" />
        <Box p={[-0.4, G1 + 0.8, -1.75]} s={[4.4, 1.6, 0.9]} c="#8f6a4a" />
        <Box p={[-0.4, G1 + 1.63, -1.75]} s={[4.5, 0.08, 1.0]} c="#efe9df" />
        <Box p={[-1.8, G1 + 1.62, -1.75]} s={[0.8, 0.06, 0.6]} c="#9aa3ad" />
        <Box p={[-1.8, G1 + 1.95, -2.1]} s={[0.07, 0.6, 0.07]} c="#c9ced6" />
        <Box p={[-1.8, G1 + 2.22, -1.95]} s={[0.07, 0.07, 0.35]} c="#c9ced6" />
        <Box p={[0.4, G1 + 1.69, -1.75]} s={[0.9, 0.04, 0.7]} c="#2c2d33" />
        <Radiator p={[2.8, G1, -2.05]} />
        <Box p={[2.8, G1 + 2.6, -2.26]} s={[1.3, 1.1, 0.04]} c="#bfe6ff" e={1.0} />
        {/* pantry shelf */}
        <Box p={[4.3, G1 + 1.4, -1.85]} s={[1.1, 2.8, 0.06]} c="#c4935d" />
        {[0.9, 1.8, 2.7].map((y) => <Box key={y} p={[4.3, G1 + y - 0.05, -1.65]} s={[1.1, 0.06, 0.45]} c="#b98552" />)}
        {/* upstairs: bathroom */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.5, G2 + 0.01, 0.1]}>
          <planeGeometry args={[9.2, 4.8]} />
          <meshStandardMaterial color="#cfe8f5" transparent opacity={0.22} depthWrite={false} />
        </mesh>
        <Box p={[0.5, G2 + 2.2, -2.35]} s={[9.2, 4.4, 0.15]} c="#e4f0f2" />
        <Box p={[-4.1, G2 + 2.2, 0.1]} s={[0.15, 4.4, 4.8]} c="#dbe9ec" />
        <Box p={[HOT_X, G2 + 0.85, -1.8]} s={[1.2, 1.7, 0.7]} c="#f4f1ea" />
        <Box p={[HOT_X, G2 + 2.6, -2.26]} s={[0.9, 1.0, 0.03]} c="#cfe6f0" />
        <Box p={[-3.6, G2 + 0.1, -1.4]} s={[1.0, 0.2, 1.4]} c="#f4f1ea" />
      </Inked>
      <Pipes glow={interpolate(t, [T.epa1 + 0.3, T.epa1 + 0.7, T.careful, T.careful + 0.4], [0, 1.4, 1.4, 0], cl)} />
      {/* bathroom faucet + showerhead light up blue (no text) */}
      <Box p={[HOT_X, G2 + 1.95, -1.95]} s={[0.08, 0.08, 0.3]} c="#c9ced6" e={0} />
      <mesh position={[HOT_X, G2 + 1.95, -1.82]}>
        <sphereGeometry args={[0.09 + 0.06 * faucetLit, 16, 12]} />
        <meshStandardMaterial color="#5ad8ff" emissive="#22b8ff" emissiveIntensity={2.5 * faucetLit} transparent opacity={faucetLit} />
      </mesh>
      <Box p={[-3.85, G2 + 3.2, -1.65]} s={[0.3, 0.08, 0.3]} c="#c9ced6" e={0} />
      <mesh position={[-3.85, G2 + 3.12, -1.65]}>
        <sphereGeometry args={[0.16 * showerLit + 0.01, 16, 12]} />
        <meshStandardMaterial color="#5ad8ff" emissive="#22b8ff" emissiveIntensity={2.5 * showerLit} transparent opacity={showerLit} />
      </mesh>
      {/* kitchen: running tap, pitcher, pot on the stove, plain dropper bottle */}
      {runs && (
        <mesh position={[-1.8, G1 + 1.95, -1.78]}>
          <cylinderGeometry args={[0.035, 0.03, 0.62, 10]} />
          <meshStandardMaterial color="#bfefff" emissive="#7fd8ff" emissiveIntensity={0.6 + 0.2 * Math.sin(f * 1.3)} transparent opacity={0.85} />
        </mesh>
      )}
      <group position={[-0.6, G1 + 1.67, -1.6]}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.17, 0.55, 24, 1, true]} />
          <meshStandardMaterial color="#e9f7ff" transparent opacity={0.4} side={THREE.DoubleSide} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.18, 0.16, 0.4, 24]} />
          <meshStandardMaterial color="#8fdcff" transparent opacity={0.55} />
        </mesh>
        <mesh position={[0.24, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.12, 0.025, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#e9f7ff" transparent opacity={0.6} />
        </mesh>
      </group>
      <group position={[0.4, G1 + 1.71, -1.75]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.27, 0.4, 28]} />
          <meshStandardMaterial color="#b9c0c9" metalness={0.5} roughness={0.35} />
        </mesh>
        {/* burner glow + steam */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.18, 0.3, 24]} />
          <meshBasicMaterial color="#ff7a2a" transparent opacity={0.8 * boil} />
        </mesh>
        {boil > 0 &&
          Array.from({length: 7}).map((_, i) => {
            const u = ((t * 0.7 + i / 7) % 1);
            return (
              <mesh key={i} position={[Math.sin(i * 2.3 + t) * 0.12, 0.45 + u * 1.0, Math.cos(i * 1.7) * 0.1]}>
                <sphereGeometry args={[0.1 + u * 0.16, 12, 10]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.5 * boil * (1 - u)} depthWrite={false} />
              </mesh>
            );
          })}
      </group>
      <group position={[1.35, G1 + 1.67, -1.6]}>
        <mesh position={[0, 0.16, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.3, 16]} />
          <meshStandardMaterial color="#f2f0ea" />
        </mesh>
        <mesh position={[0, 0.37, 0]}>
          <cylinderGeometry args={[0.03, 0.05, 0.14, 12]} />
          <meshStandardMaterial color="#3a3d46" />
        </mesh>
        {/* water-drop icon on the label */}
        <mesh position={[0, 0.15, 0.092]}>
          <circleGeometry args={[0.045, 16]} />
          <meshBasicMaterial color="#2aa8ff" />
        </mesh>
        <mesh position={[0, 0.2, 0.092]} rotation={[0, 0, Math.PI]}>
          <circleGeometry args={[0.03, 3]} />
          <meshBasicMaterial color="#2aa8ff" />
        </mesh>
      </group>
      {/* pantry jugs: the last one is lifted off; the shelf is empty after */}
      <Jug p={jug} />
      <Pool p={[-2.4, 3.5, -1.4]} c="#ffd9a0" i={7} d={7} />
      <Pool p={[0.5, G1 + 3.4, 0.2]} c="#fff0d8" i={5} d={8} />
      <Pool p={[-1.5, G2 + 3.4, 0.2]} c="#eaf6ff" i={4} d={8} />
    </>
  );
};

// ---------- camera ----------
const K0: CamKey = {t: 0, pos: [0.2, 1.5, 3.3], tgt: [-0.6, 1.75, -1.0], fov: 60, push: 0.08};
const KEYS: CamKey[] = [
  K0,
  {t: 1.0, pos: [2.7, 2.3, 4.6], tgt: [-0.6, 1.8, -1.0], fov: 58, move: 1.5, push: 0.05},
  {t: T.cdc1, pos: [0.9, 2.7, 1.9], tgt: [-1.5, 2.6, -1.0], fov: 54, move: 0.5},
  {t: T.two, pos: [4.6, 2.8, 5.6], tgt: [1.1, 1.5, -1.1], fov: 60, move: 0.8},
  {t: T.never1 - 0.4, pos: [9.5, 13.0, 15.5], tgt: [0.4, 5.6, -0.8], fov: 46, move: 1.6, push: 0.04},
  {t: T.ifTank, pos: [1.7, 2.9, 3.0], tgt: [-1.0, 2.0, -1.4], fov: 56, move: 0.7},
  {t: T.feeds, pos: [1.4, 3.5, 3.4], tgt: [HOT_X, 2.7, -1.0], fov: 56, move: 0.35, push: 0},
  {t: T.feeds + 0.3, pos: [1.4, 7.5, 2.6], tgt: [HOT_X, 6.6, -2.0], fov: 56, move: 0.35, push: 0},
  {t: T.hot, pos: [1.4, G2 + 2.8, 2.7], tgt: [HOT_X, G2 + 1.9, -1.9], fov: 56, move: 0.35, push: 0.04},
  {t: T.shower - 0.25, pos: [-0.4, G2 + 3.6, 2.9], tgt: [-3.5, G2 + 2.6, -1.6], fov: 58, move: 0.4},
  {t: T.bottled, pos: [1.2, G1 + 2.7, 3.2], tgt: [3.9, G1 + 1.7, -1.4], fov: 56, move: 0.45},
  {t: T.epa1 + 0.15, pos: [1.9, 2.8, 3.5], tgt: [-0.9, 1.9, -1.2], fov: 58, move: 0.35},
  {t: T.drain, pos: [8.0, 11.0, 13.5], tgt: [0.0, 5.0, -1.0], fov: 48, move: 1.3},
  {t: T.careful, pos: [0.3, 2.4, 3.6], tgt: [2.8, 1.3, -1.2], fov: 58, move: 0.7},
  {t: T.radiators - 0.6, pos: [0.4, 6.2, 3.4], tgt: [2.8, 4.3, -1.5], fov: 60, move: 0.8},
  {t: T.cdc2, pos: [0.8, 2.2, 3.1], tgt: [2.8, 1.5, -0.8], fov: 58, move: 0.6},
  {t: T.boilerWater - 0.2, pos: [0.7, 2.8, 6.4], tgt: [0.7, 1.3, -1.0], fov: 58, move: 1.0},
  {t: T.use, pos: [0.7, 2.5, 5.6], tgt: [0.7, 1.4, -1.0], fov: 58, move: 0.5},
  {t: T.getOut, pos: [1.7, 2.2, 3.0], tgt: [-0.7, 1.6, -0.8], fov: 58, move: 0.6},
  {t: T.today, pos: [1.4, G1 + 3.3, 3.0], tgt: [-1.5, G1 + 1.4, -1.5], fov: 56, move: 0.9},
  {t: T.before, pos: [0.0, G1 + 2.8, 1.7], tgt: [-0.7, G1 + 1.8, -1.6], fov: 52, move: 0.6},
  {t: T.boil, pos: [0.9, G1 + 2.8, 1.6], tgt: [0.4, G1 + 2.0, -1.7], fov: 52, move: 0.5},
  {t: T.treat, pos: [1.7, G1 + 2.6, 1.5], tgt: [1.3, G1 + 1.85, -1.6], fov: 52, move: 0.45},
  {t: T.epa2, pos: [-0.2, G1 + 2.7, 1.5], tgt: [-0.6, G1 + 1.85, -1.6], fov: 52, move: 0.5},
  // loop: land on frame 0's camera exactly on the last frame
  {t: T.remember, pos: K0.pos, tgt: K0.tgt, fov: K0.fov, move: END - 1 / FPS - T.remember, push: 0},
];

// ---------- Lineman timeline ----------
const hero = (t: number, f: number): {pos: V3; rot: number; pose: Pose} | null => {
  if (t < T.bottled - 0.1 || t >= T.remember - 0.3) {
    // knocking: knuckles on the shell at frame 0, knock lands at 0.3 s; at the end raised to knock again
    const end = t >= T.remember - 0.3;
    const back = end ? interpolate(t, [T.remember, T.remember + 0.6], [0.05, 0.12], cl) : t < 0.6 ? interpolate(t, [0, 0.15, 0.3, 0.45, 0.6], [0, 0.16, 0, 0.12, 0], cl) : 0.18;
    const target: V3 = [HEATER[0] + TANK_R + 0.03 + back, 1.45, -0.8];
    const armUp = !end && t > 1.0;
    const look = t > T.two + 0.3 && t < T.ifTank ? -0.9 : 0;
    return {
      pos: KNOCK_POS,
      rot: KNOCK_ROT,
      pose: armUp ? {armRx: -0.25, brows: 'up', lookY: look, lookX: -0.1, mouth: t > T.never1 && t < T.ifTank ? 'o' : 'flat'} : {...reachArm(f, KNOCK_POS, KNOCK_ROT, target), brows: 'up', lookX: 0.05},
    };
  }
  if (t < T.epa1 + 0.15) {
    const jugUp = interpolate(t, [T.bottled + 0.35, T.bottled + 0.9], [0, 1], cl);
    const target: V3 = [4.15 - 0.3 * jugUp, G1 + 1.95 + 0.45 * jugUp, -1.8 + 0.5 * jugUp];
    return {pos: PANTRY_POS, rot: Math.PI / 2, pose: {...reachArm(f, PANTRY_POS, Math.PI / 2, target), brows: 'worried', lookX: 0.1}};
  }
  if (t >= T.getOut - 0.1 && t < T.today - 0.1) {
    return {pos: MANUAL_POS, rot: MANUAL_ROT, pose: {...reachArm(f, MANUAL_POS, MANUAL_ROT, MANUAL_AT), brows: 'up', lookX: 0.35, lookY: 0.15}};
  }
  return null;
};
const MANUAL_AT: V3 = [0.5, 1.28, 0.58];

export const Short012: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = camAt(KEYS, t);
  const blur = Math.min(5, Math.max(0, (camSpeed(KEYS, t, FPS) - 4) * 1.2));
  const xray = t >= T.remember ? interpolate(t, [T.remember + 0.3, END - 0.2], [1, 0], cl) : interpolate(t, [0.6, 1.0], [0, 1], cl);
  const ripple = interpolate(t, [0.3, 1.0], [0, 1], cl);
  const amber = interpolate(t, [T.careful, T.careful + 0.4, T.use, T.use + 0.5], [0, 1, 1, 0], cl);
  const h = hero(t, f);
  const drop = t >= T.feeds && t < T.bottled ? (t < T.shower - 0.25 ? along(HOT_PATH, (t - T.feeds) / (T.hot + 0.1 - T.feeds)) : along(SHOWER_PATH, (t - (T.shower - 0.25)) / 0.25)) : null;
  const sign = interpolate(t, [T.cdc2 + 0.2, T.cdc2 + 0.45, T.cdc2 + 0.6, T.cdc2 + 0.75], [2.4, -0.12, 0.05, 0], cl);
  const manualOpen = interpolate(t, [T.getOut + 0.4, T.getOut + 0.9], [0.15, 1], cl);
  return (
    <AbsoluteFill style={{background: '#f1e6d2'}}>
      <LookCanvas blur={blur}>
        <RigCam {...cam} />
        <color attach="background" args={['#cfe6f7']} />
        <Rig keyPos={[-6, 10, 6]} keyColor={amber > 0.5 ? '#ffb45a' : '#ffe2b8'} keyI={3.0 - 0.9 * amber} fillI={1.9 - 0.5 * amber} fog={['#e9dfcc', 14, 40]} />
        <House t={t} f={f} />
        <Inked>
          <Boiler />
        </Inked>
        <Pipe a={[BOILER[0] - 0.3, 2.1, BOILER[2]]} b={[BOILER[0] - 0.3, G1 + 0.2, -1.95]} c="#b07a52" />
        <Pipe a={[BOILER[0] + 0.3, 2.1, BOILER[2]]} b={[BOILER[0] + 0.3, G1 + 0.2, -1.95]} c="#b07a52" />
        <Heater xray={xray} ripple={ripple} glow={interpolate(t, [T.epa1 + 0.3, T.epa1 + 0.7], [0, 0.6], cl)} />
        {h && <Lineman frame={f} pos={h.pos} rotY={h.rot} pose={h.pose} />}
        {t >= T.epa1 + 0.15 && t < T.careful + 1.2 && (
          <group position={[-0.25, 2.25 + Math.sin(t * 2) * 0.06, -0.45]} rotation={[0, t > T.careful ? interpolate(t, [T.careful, T.careful + 0.4], [-0.9, 0.7], cl) : -0.9, 0]} scale={popK(t, T.epa1 + 0.4) * 0.6}>
            <Volt frame={f} pos={[0, 0, 0]} glow={0} mood={t > T.careful ? 'worried' : 'happy'} light={false} />
          </group>
        )}
        {drop && (
          <mesh position={drop}>
            <sphereGeometry args={[0.13, 16, 12]} />
            <meshStandardMaterial color="#6fe2ff" emissive="#22b8ff" emissiveIntensity={2.5} />
          </mesh>
        )}
        {/* in-world text */}
        <Sign title="CDC: A WATER SOURCE IN YOUR HOME" bg="#e8d3a2" p={[HOT_X - 0.05, 2.78, -0.86]} rotY={0.35} width={0.95} hangTo={0.32} k={t < T.two + 1.2 ? popK(t, T.cdc1 + 0.15) : 0} t={t} size={96} />
        <Decal title="WATER INSIDE" bg="transparent" color="#ffd21f" p={[0.15, 2.3, -2.26]} rot={[0, 0, 0]} width={1.6} h={256} k={t >= T.ifTank && t < T.use ? popK(t, T.ifTank + 0.3) : 0} size={150} />
        <Sign title="BOTTLED: BEST CHOICE · EPA" p={[4.3, G1 + 1.62, -1.4]} width={1.05} h={200} k={t < T.drain + 0.5 ? popK(t, T.bottled + 0.2) : 0} t={0} size={86} />
        <Decal title="TANK OR PIPES · EPA" bg="transparent" color="#ffd21f" p={[0.15, 1.55, -2.26]} rot={[0, 0, 0]} width={1.9} h={256} k={t >= T.epa1 && t < T.use ? popK(t, T.epa1 + 0.6) : 0} size={130} />
        <Sign title="HEATING SYSTEM" bg="#e8d3a2" p={[BOILER[0] - 0.55, 2.85, -1.05]} rotY={0.4} width={0.8} hangTo={0.3} k={t < T.use ? popK(t, T.older + 0.3) : 0} t={t} size={120} />
        <Decal title="OLDER HOMES" bg="transparent" color="#ffd21f" p={[BOILER[0] - 0.2, 0.03, 0.15]} width={1.7} h={256} k={t < T.use ? popK(t, T.older + 0.5) : 0} size={140} />
        <Sign title="RADIATOR / BOILER WATER" sub="NEVER DRINK · COOK · WASH" corner="CDC" color="#b3261e" bg="#f3f0e8" p={[BOILER[0], 1.35 + sign, BOILER[2] + 0.75]} width={1.5} hangTo={1.25} k={t >= T.cdc2 + 0.2 ? 1 : 0} t={t * 1.6} size={92} />
        <Sign title="✓ FEEDS YOUR FAUCETS" color="#127a3c" bg="#e9fff1" p={[HEATER[0] + 0.1, 2.0, -0.2]} width={0.95} hangTo={0.3} k={t < T.getOut + 0.5 ? popK(t, T.feedsF) : 0} t={t} size={100} />
        <Sign title="✗ NOT THIS ONE" color="#b3261e" p={[BOILER[0] + 0.45, 2.55, BOILER[2] + 0.68]} width={0.85} hangTo={0.25} k={t < T.getOut + 0.5 ? popK(t, T.notHeating) : 0} t={t} size={110} />
        <Sign title="DRAINING + SAFETY: SEE MANUAL" lines={3} color="#11131c" bg="#f4f1ea" p={[HEATER[0] + 0.05, 1.25, -0.2]} width={0.9} h={560} k={t >= T.getOut && t < T.before ? popK(t, T.getOut + 0.2) : 0} t={0} size={78} glow={0.25 * Math.sin(t * 4) + 0.25} />
        {h && t >= T.getOut - 0.1 && t < T.today && (
          <group position={MANUAL_AT} rotation={[-0.25, 0.25, 0]} scale={[manualOpen, 1, 1]}>
            <Sign title="DRAINING + SAFETY" lines={4} bg="#fbfaf6" p={[0, 0.18, 0.05]} width={0.62} h={760} k={1} t={0} size={86} />
          </group>
        )}
        <Decal title="READ IT TODAY" bg="transparent" color="#ffd21f" p={[-0.6, G1 + 0.03, -0.2]} width={2.0} h={256} k={t >= T.today ? popK(t, T.today + 0.15) : 0} size={140} />
        <Decal title="BOIL" bg="transparent" color="#ffffff" p={[0.4, G1 + 2.75 + 0.1 * Math.sin(t * 2), -1.7]} rot={[0, 0, 0]} width={0.8} h={256} k={t >= T.boil && t < T.epa2 + 0.4 ? popK(t, T.boil + 0.2) : 0} size={180} />
        <Sign title="TREAT" color="#11131c" bg="#e8d3a2" p={[1.35, G1 + 2.25, -1.45]} width={0.45} hangTo={0.08} k={t >= T.treat - 0.1 && t < T.epa2 + 0.4 ? popK(t, T.treat) : 0} t={t} size={150} />
        <Sign title="ANY SOURCE · EPA" bg="#e8d3a2" p={[-0.22, G1 + 2.12, -1.4]} rotY={-0.15} width={0.62} hangTo={0.12} k={t < T.remember + 0.4 ? popK(t, T.epa2 + 0.3) : 0} t={t} size={100} />
      </LookCanvas>
      <Captions t={t} />
      <Audio src={staticFile('shorts2/s012.mp3')} />
    </AbsoluteFill>
  );
};
