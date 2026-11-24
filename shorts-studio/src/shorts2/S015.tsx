// Short 015 — "What Happens When You Plug a Generator Into the Wall" (1080x1920, 30 fps, no music). New engine.
// Script: yt-channel content/scripts/short-015-backfeed.md (factcheck v3 PASS). Real VASKO voice + word timing.
// A living diorama of one block from a fixed bird's-eye; things light up in place; three ease-out whip push-ins
// (Lineman's pole, the transfer-switch box, the yard) and back. No glass walls, no ride along a wire.
// Rules: no plug prongs / double-plug cords; no spark touches Lineman; switch box stays closed; voltage step-up is
// shown by color/brightness only (same wire thickness); nothing plugged into any wall outlet after "Otherwise".
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import timing from './s015_timing.json';
import {Box, Lineman, Volt} from '../three/kit';
import {CamKey, camAt, camSpeed, Decal, Inked, LookCanvas, Pool, popK, Rig, RigCam, Sign} from '../three/look';
import {Captions, makeChunks, makeCue, reachArm, Timing} from './common';

type V3 = [number, number, number];
const FPS = 30;
const TM = timing as unknown as Timing;
const END = TM.duration + 0.4;
export const S015_FPS = FPS;
export const S015_FRAMES = Math.round(END * FPS);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const q = makeCue(TM.words);
const T = {
  plug: q('If you plug it'),
  which: q('which two kinds'),
  backward: q('flows backward'),
  transformer: q('The transformer outside'),
  stepsUp: q('steps the voltage up'),
  niosh: q('says up to seven'),
  down: q('Down the block'),
  live1: q('and it goes live'),
  crews: q('Crews are told'),
  stops: q('He stops in time'),
  notOnly: q("But he's not the only"),
  neighbors: q('says neighbors on the same'),
  same: q('same transformer face'),
  fix: q("Here's the fix"),
  wiring: q('For your house wiring'),
  otherwise: q('Otherwise plug your'),
  straight: q('straight into the generator'),
  heavy: q('use heavy duty cords'),
  outside: q('Keep it outside'),
  feet: q('at least twenty feet'),
  thatWay: q('That way one generator'),
  notLines: q('not the power lines'),
};
const CHUNKS = makeChunks(TM, ['GENERATOR', 'LINES', 'WALL', 'RISK', 'CPSC', 'BACKWARD', 'TRANSFORMER', 'VOLTAGE', 'NIOSH', 'VOLTS', 'LINEMAN', 'LIVE', 'TIME', 'NEIGHBORS', 'FIX', 'ELECTRICIAN', 'SWITCH', 'CORDS', 'OUTSIDE', 'FEET', 'CDC', 'STUFF', 'BLOCK', 'HOUSE', 'APPLIANCES', 'ELECTROCUTION', 'VENTS']);

// ---------- layout ----------
const POLE_X = -2.2;
const CAN: V3 = [POLE_X + 0.55, 7.4, 0];
const HOUSES: {id: string; p: V3; c: string}[] = [
  {id: 'A', p: [-8.5, 0, 5], c: '#f1e6cf'},
  {id: 'B', p: [-8.5, 0, -6], c: '#e6dcc8'},
  {id: 'C', p: [7, 0, 5], c: '#e9e0f0'},
  {id: 'D', p: [7, 0, -6], c: '#dfeadb'},
];
const FAR = [[-8.5, -18], [7, -18], [-8.5, -30], [7, -30], [-8.5, -42], [7, -42]];
const ATTACH: Record<string, V3> = {A: [-5.6, 5.2, 5], B: [-5.6, 5.2, -6], C: [4.1, 5.2, 5], D: [4.1, 5.2, -6]};
const POLES_Z = [12, 0, -12, -24, -36, -48];
const LPOLE_Z = -24;
const GEN: V3 = [-10.2, 0, 11.6];
const OUTLET: V3 = [-6.6, 0.9, 8.03];
const DOOR: V3 = [-9.6, 0, 8.0];
const LINE_POS: V3 = [POLE_X + 0.55, 6.3, LPOLE_Z - 0.35];
const LINE_ROT = Math.PI + 0.35;
// the span he is working on runs from his crossarm end toward the camera
const SPAN_A: V3 = [POLE_X - 1.1, 9.0, LPOLE_Z];
const SPAN_B: V3 = [POLE_X - 1.1, 9.0, -36];

const Wire: React.FC<{a: V3; b: V3; glow?: number; color?: string; sag?: number}> = ({a, b, glow = 0, color = '#ff8a1c', sag = 0.35}) => {
  // a sagging wire built from short segments (same thickness whether dead or energized)
  const pts: V3[] = Array.from({length: 9}).map((_, i) => {
    const u = i / 8;
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - Math.sin(u * Math.PI) * sag, a[2] + (b[2] - a[2]) * u];
  });
  return (
    <>
      {pts.slice(1).map((p, i) => {
        const A = new THREE.Vector3(...pts[i]), B = new THREE.Vector3(...p);
        const qn = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
        return (
          <mesh key={i} position={A.clone().add(B).multiplyScalar(0.5)} quaternion={qn}>
            <cylinderGeometry args={[0.07, 0.07, A.distanceTo(B), 6]} />
            <meshStandardMaterial color={glow > 0.02 ? color : '#3a3c42'} emissive={color} emissiveIntensity={glow * 2.4} toneMapped={glow < 0.02} />
          </mesh>
        );
      })}
    </>
  );
};
// chevrons travelling along a wire, pointing from a to b
const Chevrons: React.FC<{a: V3; b: V3; t: number; k: number; color: string}> = ({a, b, t, k, color}) => {
  if (k <= 0.01) return null;
  const dir = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
  const qn = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  return (
    <>
      {[0, 1, 2].map((i) => {
        const u = ((t * 0.6 + i / 3) % 1) * k;
        return (
          <mesh key={i} position={[a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + 0.25, a[2] + (b[2] - a[2]) * u]} quaternion={qn}>
            <coneGeometry args={[0.18, 0.35, 4]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        );
      })}
    </>
  );
};
const House: React.FC<{p: V3; c: string; window?: number; facing?: 1 | -1}> = ({p, c, window = 0, facing = 1}) => (
  <group position={p}>
    <Box p={[0, 2.2, 0]} s={[6, 4.4, 6]} c={c} />
    <mesh position={[0, 5.5, 0]} rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[4.6, 2.2, 4]} />
      <meshStandardMaterial color="#9a5a46" />
    </mesh>
    {[-1.4, 1.4].map((z) => <Box key={z} p={[facing * 3.02, 2.6, z]} s={[0.04, 1.0, 1.0]} c="#ffd56a" e={window * 1.5} />)}
  </group>
);
const Generator: React.FC<{t: number}> = ({t}) => (
  <group position={GEN} rotation={[0, 0.5, 0]}>
    <group position={[Math.sin(t * 47) * 0.012, Math.abs(Math.sin(t * 61)) * 0.012, 0]}>
      <Box p={[0, 0.75, 0]} s={[1.6, 1.1, 1.1]} c="#e8501f" />
      {/* black tube frame */}
      {[[-0.85, -0.6], [0.85, -0.6], [-0.85, 0.6], [0.85, 0.6]].map(([x, z]) => <Box key={`${x}${z}`} p={[x, 0.75, z]} s={[0.1, 1.5, 0.1]} c="#1d1d22" />)}
      {[-0.6, 0.6].map((z) => <Box key={z} p={[0, 1.5, z]} s={[1.8, 0.1, 0.1]} c="#1d1d22" />)}
      <Box p={[0, 0.75, 0.56]} s={[0.9, 0.6, 0.03]} c="#2b2d33" />
      <Box p={[0.62, 1.12, -0.35]} s={[0.25, 0.2, 0.3]} c="#6c7078" />
      <Box p={[0, 0.1, 0]} s={[1.8, 0.2, 1.3]} c="#1d1d22" />
    </group>
    {/* heat shimmer above the muffler */}
    <mesh position={[0.62, 1.6 + 0.1 * Math.sin(t * 3), -0.35]}>
      <sphereGeometry args={[0.22, 10, 8]} />
      <meshBasicMaterial color="#fff3d6" transparent opacity={0.18 + 0.08 * Math.sin(t * 7)} depthWrite={false} />
    </mesh>
  </group>
);
const Marker: React.FC<{p: V3; label: string; k: number; t: number}> = ({p, label, k, t}) => {
  if (k <= 0.01) return null;
  return (
    <group position={p} scale={k * 2.4}>
      <Box p={[0, 0.6, 0]} s={[0.12, 1.2, 0.12]} c="#e9e6df" />
      <Sign title={label} color={label === '✓' ? '#127a3c' : '#11131c'} bg="#ffd21f" p={[0, 1.6 + Math.sin(t * 3) * 0.05, 0]} width={1.1} h={512} w={512} k={1} t={t} size={300} />
    </group>
  );
};

// ---------- camera: fixed board + three ease-out whip push-ins that return to the exact same board ----------
const BOARD: CamKey = {t: 0.9, pos: [3, 32, 30], tgt: [-0.5, 0, -10], fov: 52, move: 0.35, push: 0.12};
const K0: CamKey = {t: 0, pos: [-7.0, 6.2, 20.8], tgt: [-8.3, 0.7, 9.8], fov: 60, push: 0.16};
const KEYS: CamKey[] = [
  K0,
  BOARD,
  {t: T.which, pos: [2, 26, 22], tgt: [0, 2, -6], fov: 52, move: 0.8, push: 0.08},
  {t: T.backward, pos: [-1.5, 15, 22], tgt: [-6.5, 1.5, 7], fov: 52, move: 0.7, push: 0.1},
  {t: T.transformer, pos: [5, 13, 15], tgt: [-1.2, 4.6, 0.5], fov: 54, move: 0.6, push: 0.1},
  {t: T.stepsUp + 0.6, pos: [5, 17, 0], tgt: [-1.5, 6, -26], fov: 52, move: 0.6, push: 0.08},
  {t: T.niosh + 0.1, pos: [5, 13, 15], tgt: [-1.2, 4.6, 0.5], fov: 54, move: 0.6, push: 0.1},
  {t: T.down, pos: [1.9, 8.7, -30.0], tgt: [-1.7, 8.2, -24.2], fov: 54, move: 0.35, push: 0.06},
  {t: T.notOnly, pos: [3, 26, 24], tgt: [-0.5, 0, -4], fov: 52, move: 0.35, push: 0.06},
  {t: T.neighbors, pos: [3, 19, 19], tgt: [-0.5, 0, -0.5], fov: 54, move: 0.7, push: 0.1},
  {...BOARD, t: T.fix, push: 0.1},
  {t: T.wiring, pos: [-16.5, 3.6, 8.5], tgt: [-11.1, 1.7, 4.6], fov: 54, move: 0.3, push: 0.05},
  {t: T.otherwise, pos: [-5.0, 9.0, 17.5], tgt: [-9.0, 0.4, 10.0], fov: 56, move: 0.45, push: 0.04},
  {...BOARD, t: T.thatWay, move: 0.3, push: 0.1},
  {t: T.notLines, pos: K0.pos, tgt: K0.tgt, fov: K0.fov, move: END - 1 / FPS - T.notLines, push: 0},
];

export const Short015: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = camAt(KEYS, t);
  const blur = Math.min(6, Math.max(0, (camSpeed(KEYS, t, FPS) - 8) * 0.5));
  const wallCord = t < T.otherwise + 0.2;
  const ring = wallCord ? (t < 0.3 ? 0.6 : 0.6 + 0.4 * Math.abs(Math.sin(t * 3))) * (t >= 0.3 && t < 0.5 ? 1.6 : 1) : 0;
  // backfeed: yellow from house A to the can, then orange primary in both directions, then neighbors; drains at the fix
  const drain = interpolate(t, [T.fix, T.fix + 0.8], [1, 0], cl);
  const serviceA = interpolate(t, [T.backward, T.backward + 0.8], [0, 1], cl) * drain;
  const can = interpolate(t, [T.transformer, T.transformer + 0.6], [0, 1], cl) * drain;
  const primary = interpolate(t, [T.stepsUp, T.stepsUp + 1.2], [0, 1], cl) * drain;
  const span = interpolate(t, [T.live1 + 0.1, T.live1 + 0.5], [0, 1], cl) * drain;
  const nb = (i: number) => interpolate(t, [T.neighbors + 0.4 + i * 0.5, T.neighbors + 0.8 + i * 0.5], [0, 1], cl) * drain;
  const lampOn = t >= T.straight;
  // Lineman: hands reach toward the span, stop a foot short, then pull back and lean on his belt
  const reachK = interpolate(t, [T.down + 0.2, T.live1], [0.6, 1], cl) * interpolate(t, [T.stops, T.stops + 0.4], [1, 0.25], cl);
  const handTarget: V3 = [SPAN_A[0] + 0.35 + (1 - reachK) * 0.6, 8.55, LPOLE_Z - 0.9];
  const lean = interpolate(t, [T.stops, T.stops + 0.4], [0, 0.18], cl);
  const atWork = t >= T.thatWay;
  const linePose = atWork
    ? {...reachArm(f, LINE_POS, LINE_ROT, [SPAN_A[0] + 0.6, 8.4, LPOLE_Z - 0.7]), brows: 'up' as const}
    : {...reachArm(f, LINE_POS, LINE_ROT, handTarget), brows: (t >= T.live1 ? 'worried' : 'up') as 'worried' | 'up', mouth: t >= T.live1 && t < T.notOnly ? ('frown' as const) : ('flat' as const), lookX: -0.15, lookY: -0.35};
  return (
    <AbsoluteFill style={{background: '#dbeaf6'}}>
      <LookCanvas blur={blur}>
        <RigCam {...cam} />
        <color attach="background" args={['#cfe6f7']} />
        <Rig keyPos={[-20, 30, 18]} keyColor="#fff0d8" keyI={3.0} fillI={1.9} fog={['#dfeaf3', 45, 110]} />
        <Inked>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -12]} receiveShadow>
            <planeGeometry args={[80, 90]} />
            <meshStandardMaterial color="#a8d48f" roughness={1} />
          </mesh>
          <Box p={[0, 0.01, -12]} s={[5, 0.02, 90]} c="#c9c9cc" />
          <Box p={[-8.9, 0.012, 10.2]} s={[2.6, 0.02, 4.6]} c="#d9d6cf" />
          {HOUSES.map((h) => <House key={h.id} p={h.p} c={h.c} window={h.id === 'C' && t >= T.same ? 1 : 0} facing={h.p[0] < 0 ? 1 : -1} />)}
          {FAR.map(([x, z]) => <House key={`${x}${z}`} p={[x, 0, z]} c="#e8e2d6" facing={x < 0 ? 1 : -1} />)}
          {POLES_Z.map((z) => (
            <group key={z}>
              <Box p={[POLE_X, 4.7, z]} s={[0.3, 9.4, 0.3]} c="#8a6a4a" />
              <Box p={[POLE_X, 9.0, z]} s={[2.6, 0.18, 0.18]} c="#7a5a3a" />
            </group>
          ))}
          {/* house A: south wall outlet (red-tagged), porch steps and front door */}
          <Box p={[OUTLET[0], OUTLET[1], OUTLET[2]]} s={[0.25, 0.32, 0.05]} c="#e9e6df" />
          <Box p={[DOOR[0], 0.15, DOOR[2] + 0.6]} s={[1.6, 0.3, 1.0]} c="#c9c4ba" />
          <Box p={[DOOR[0], 0.35, DOOR[2] + 0.25]} s={[1.4, 0.2, 0.5]} c="#c9c4ba" />
          {/* garage side wall: transfer-switch box, door shut */}
          <Box p={[-11.53, 1.7, 4.6]} s={[0.12, 1.0, 0.75]} c="#8f949c" />
          <Box p={[-11.6, 1.7, 4.6]} s={[0.02, 0.9, 0.65]} c="#7d828a" />
        </Inked>
        {/* door: shut until the long cord goes in, then rests slightly open on a doorstop, lamp inside */}
        <group position={[DOOR[0] - 0.6, 1.2, DOOR[2] + 0.04]} rotation={[0, t >= T.otherwise ? -0.45 : 0, 0]}>
          <Box p={[0.6, 0, 0]} s={[1.2, 2.3, 0.08]} c="#7c4a32" />
        </group>
        <Box p={[DOOR[0], 1.2, DOOR[2] - 0.02]} s={[1.2, 2.3, 0.02]} c="#2a2a30" />
        {lampOn && (
          <>
            <mesh position={[DOOR[0] + 0.1, 1.1, DOOR[2] - 0.1]}>
              <sphereGeometry args={[0.22, 14, 10]} />
              <meshBasicMaterial color="#ffe08a" toneMapped={false} />
            </mesh>
            <pointLight position={[DOOR[0], 1.2, DOOR[2] + 0.5]} intensity={5} distance={4} color="#ffd56a" />
          </>
        )}
        <Generator t={t} />
        {/* the wrong way: cord from behind the generator to the wall outlet (generator end hidden) */}
        {wallCord && (
          <>
            <Wire a={[GEN[0] + 0.3, 0.08, GEN[2] - 0.5]} b={[OUTLET[0] - 0.2, 0.08, OUTLET[2] + 0.4]} sag={-0.02} />
            <Wire a={[OUTLET[0] - 0.2, 0.08, OUTLET[2] + 0.4]} b={[OUTLET[0], OUTLET[1] - 0.1, OUTLET[2] + 0.06]} sag={0} />
            <mesh position={[OUTLET[0], OUTLET[1], OUTLET[2] + 0.06]}>
              <ringGeometry args={[0.32, 0.42 + 0.1 * ring, 32]} />
              <meshBasicMaterial color="#ff2a1a" transparent opacity={0.85} toneMapped={false} />
            </mesh>
          </>
        )}
        <Sign title="WALL OUTLET · NO" color="#ffffff" bg="#c62a1c" p={[OUTLET[0] - 1.0, OUTLET[1] + 0.55, OUTLET[2] + 0.08]} width={1.2} h={300} k={wallCord ? 1 : interpolate(t, [T.otherwise + 0.2, T.otherwise + 0.5], [1, 0], cl)} t={t} size={120} />
        {/* the right way: long heavy cord from the generator's own panel, across the driveway, up the steps, through the door */}
        {!wallCord &&
          ([
            [[GEN[0] + 0.3, 0.75, GEN[2] + 0.4], [GEN[0] + 0.6, 0.06, GEN[2] + 0.2]],
            [[GEN[0] + 0.6, 0.06, GEN[2] + 0.2], [DOOR[0] + 0.3, 0.06, DOOR[2] + 1.3]],
            [[DOOR[0] + 0.3, 0.06, DOOR[2] + 1.3], [DOOR[0] + 0.3, 0.46, DOOR[2] + 0.3]],
            [[DOOR[0] + 0.3, 0.46, DOOR[2] + 0.3], [DOOR[0] + 0.15, 0.5, DOOR[2] - 0.15]],
          ] as [V3, V3][]).map(([a, b], i) => <Wire key={i} a={a} b={b} sag={0} glow={lampOn ? 0.35 : 0} color="#ffd21f" />)}
        {/* service wires (can -> houses) and the street primary line */}
        {HOUSES.map((h, i) => (
          <Wire key={h.id} a={[CAN[0], CAN[1] - 0.2, CAN[2]]} b={ATTACH[h.id]} glow={h.id === 'A' ? serviceA : nb(i - 1)} color={h.id === 'A' ? '#ffd21f' : '#ff8a1c'} sag={0.5} />
        ))}
        <Chevrons a={ATTACH.A} b={[CAN[0], CAN[1] - 0.2, CAN[2]]} t={t} k={serviceA} color="#ffd21f" />
        {POLES_Z.slice(1).map((z, i) => {
          const z0 = POLES_Z[i];
          const isSpan = z0 === LPOLE_Z && z === -36;
          return <Wire key={z} a={[POLE_X - 1.1, 9.0, z0]} b={[POLE_X - 1.1, 9.0, z]} glow={isSpan ? Math.max(span, primary * 0.0) : primary * (z0 === 0 || z === 0 || z0 > 0 ? 1 : interpolate(t, [T.stepsUp + 0.4, T.stepsUp + 1.2], [0, 1], cl))} />;
        })}
        {/* transformer can: swells and its seams glow (no ratio, no household number) */}
        <group position={CAN} scale={1 + 0.08 * can}>
          <mesh>
            <cylinderGeometry args={[0.45, 0.45, 1.2, 20]} />
            <meshStandardMaterial color="#8f949c" />
          </mesh>
          {[-0.35, 0.35].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.46, 0.03, 6, 24]} />
              <meshBasicMaterial color={can > 0.05 ? '#ff8a1c' : '#6c7078'} toneMapped={false} />
            </mesh>
          ))}
        </group>
        {/* orange ring under the four houses on the same can */}
        {nb(2) > 0.01 && (
          <mesh position={[-0.7, 0.05, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[11.5, 12.1, 64]} />
            <meshBasicMaterial color="#ff8a1c" transparent opacity={0.9 * nb(2)} toneMapped={false} />
          </mesh>
        )}
        {/* Lineman on his pole, belt around the pole; Volt pops up beside him */}
        <Lineman frame={f} pos={[LINE_POS[0] + lean * Math.sin(LINE_ROT), LINE_POS[1], LINE_POS[2] + lean * Math.cos(LINE_ROT)]} rotY={LINE_ROT} pose={linePose} />
        <mesh position={[POLE_X, 7.3, LPOLE_Z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.05, 6, 20]} />
          <meshStandardMaterial color="#3b2a1c" />
        </mesh>
        {t >= T.live1 + 0.5 && t < T.notOnly + 0.3 && (
          <group position={[POLE_X + 2.3, 7.4, LPOLE_Z - 1.6]} scale={popK(t, T.live1 + 0.6) * 0.7}>
            <Volt frame={f} pos={[0, 0, 0]} glow={1} mood="worried" />
          </group>
        )}
        {/* game markers + in-world tags, stake signs, stencils */}
        <Marker p={[POLE_X, 9.6, LPOLE_Z]} label={t >= T.stops + 0.3 ? '✓' : '?'} k={t >= T.which && t < T.fix ? popK(t, T.which + 0.1) : 0} t={t} />
        <Marker p={[8.5, 0, 9.5]} label={t >= T.same ? ' ' : '?'} k={t >= T.which && t < T.fix ? popK(t, T.which + 0.35) : 0} t={t} />
        <Sign title="BACKFEED · NIOSH" bg="#fff6e0" p={[-4.8, 3.2, 11.5]} rotY={0.25} width={5.2} h={512} k={t >= T.backward && t < T.fix ? popK(t, T.backward + 0.3) : 0} t={0} size={190} />
        {t >= T.backward && t < T.fix && <Box p={[-4.8, 0.8, 11.5]} s={[0.2, 1.6, 0.2]} c="#8a6a4a" />}
        <Sign title="UP TO 7,200 VOLTS · NIOSH" bg="#fff6e0" p={[POLE_X + 3.0, 4.4, 5.4]} rotY={0.3} width={5.4} h={512} k={t >= T.niosh && t < T.down ? popK(t, T.niosh + 0.3) : 0} t={0} size={140} />
        <Sign title="MILES OF LINE · NIOSH" bg="#fff6e0" p={[POLE_X + 5.0, 6.8, -30]} rotY={0.15} width={6.4} h={512} k={t >= T.stepsUp + 0.8 && t < T.niosh + 0.4 ? popK(t, T.stepsUp + 0.9) : 0} t={0} size={150} />
        <Sign title="LINE DEAD · STORM REPAIR" bg="#e8d3a2" p={[POLE_X - 0.1, 5.9, LPOLE_Z - 0.2]} rotY={Math.PI + 0.3} width={1.5} h={300} k={1} t={0} size={110} />
        <Sign title="TREAT EVERY LINE AS LIVE · OSHA" bg="#e8d3a2" p={[POLE_X + 1.75, 8.25, LPOLE_Z - 0.3]} rotY={Math.PI + 0.35} width={1.2} h={400} hangTo={0.55} k={1} t={t} size={96} />
        <Decal title="SAME TRANSFORMER · CPSC" bg="transparent" color="#ffffff" p={[0.2, 0.04, 5.5]} rot={[-Math.PI / 2, 0, 0]} width={8.5} h={256} k={t >= T.same && t < T.fix + 0.5 ? popK(t, T.same) : 0} size={110} />
        <Sign title="TRANSFER SWITCH OR INTERLOCK · INSTALLED BY A QUALIFIED ELECTRICIAN · NIOSH" bg="#fff6e0" p={[-11.62, 0.65, 4.6]} rotY={-Math.PI / 2} width={1.5} h={560} k={t >= T.wiring && t < T.thatWay ? popK(t, T.wiring + 0.35) : 0} t={0} size={70} />
        <Sign title="HEAVY-DUTY · OUTDOOR-RATED · RATED FOR THE LOAD · CPSC" bg="#fff6e0" p={[GEN[0] + 0.2, 2.5, GEN[2] + 0.7]} rotY={0.56} width={2.0} h={440} hangTo={0.3} k={t >= T.heavy - 0.3 ? popK(t, T.heavy) : 0} t={t} size={78} />
        <Decal title="AT LEAST 20 FT FROM DOORS, WINDOWS, VENTS · CDC" bg="transparent" color="#ffffff" p={[-7.0, 0.04, 10.9]} rot={[-Math.PI / 2, 0, 0.35]} width={4.2} h={420} k={t >= T.outside ? popK(t, T.outside + 0.3) : 0} size={92} />
        <Pool p={[-6, 4, 12]} c="#fff1dc" i={6} d={12} />
      </LookCanvas>
      <Captions t={t} chunks={CHUNKS} />
      <Audio src={staticFile('shorts2/s015.mp3')} />
    </AbsoluteFill>
  );
};
