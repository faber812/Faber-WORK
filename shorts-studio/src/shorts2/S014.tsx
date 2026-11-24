// Short 014 — "Pipes Can Freeze Inside Your Kitchen Cabinet" (1080x1920, 30 fps, no music). New engine (three/look.tsx).
// Script: yt-channel content/scripts/short-014-frozen-pipes.md (factcheck v2 PASS). Real VASKO voice + word timing.
// One continuous camera following the frost: kitchen -> cabinet -> snowy yard -> outside wall -> living room -> pipe ->
// cabinet -> faucet -> down the pipe to the main shut-off at the foundation wall. Stays in/at the house, no dollhouse.
// Rules: no numbers, no burst, no flame (the torch only goes back in its box), Volt touches no water, no logos.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, useCurrentFrame, staticFile} from 'remotion';
import * as THREE from 'three';
import timing from './s014_timing.json';
import {Box, Lineman, Pose, Volt} from '../three/kit';
import {CamKey, camAt, camSpeed, Decal, Inked, LookCanvas, Pool, popK, Rig, RigCam, Sign} from '../three/look';
import {reachArm} from './S012';

type V3 = [number, number, number];
const FPS = 30;
const END = timing.duration + 0.4;
export const S014_FPS = FPS;
export const S014_FRAMES = Math.round(END * FPS);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const W = timing.words as [string, number, number][];

// ---------- cues ----------
const toks = (text: string) => {
  const out: string[] = [];
  for (const raw of text.replace(/-/g, ' ').match(/[A-Za-z][A-Za-z']*/g) ?? []) {
    if (raw.length >= 2 && raw === raw.toUpperCase()) out.push(...raw.toLowerCase().split(''));
    else out.push(raw.toLowerCase());
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
  cabinet: q('inside your kitchen cabinet'),
  lose: q('Lose power and the risk'),
  risk: q('the risk climbs'),
  why: q('But why there'),
  lists: q('The Red Cross lists'),
  kitchenCab: q('lists kitchen cabinets') + 0.36,
  attics: q('along with attics'),
  follow: q('So follow the cold'),
  hits: q('It hits an outside wall'),
  thin: q('with thin insulation'),
  house1: q('In this house the heat'),
  finds: q('Then the cold finds'),
  runs: q('Its pipe runs along'),
  behind: q('behind a closed door'),
  coldWall: q('Cold wall Closed door'),
  closedDoor: q('Closed door No warm'),
  noWarm: q('No warm air'),
  thatsWhy: q("That's why the cabinet"),
  usual: q('The usual tip'),
  openDoors: q('Open the doors so'),
  warmer: q('so warmer air gets in'),
  none: q("But in this house there's none"),
  veryCold: q("So when it's very cold"),
  drip: q('let cold water drip'),
  says2: q('The Red Cross says even'),
  openTap: q('Open the tap and only'),
  trickle: q('only a trickle comes out'),
  suspect: q('Suspect a frozen pipe'),
  expands: q('Water expands as it freezes'),
  breaks: q('and pipes can break'),
  ibhs: q('IBHS says shut off'),
  know: q('Know where your main'),
  never: q('Never thaw a pipe'),
};

// ---------- captions: 2-4 words, one yellow word ----------
const YELLOW = ['FREEZE', 'RISK', 'WHY', 'CABINETS', 'COLD', 'WALL', 'INSULATION', 'HEAT', 'SINK', 'DOOR', 'AIR', 'CABINET', 'TIP', 'DOORS', 'NONE', 'DRIP', 'HELPS', 'TRICKLE', 'FROZEN', 'EXPANDS', 'BREAK', 'IBHS', 'SUPPLY', 'SHUT-OFF', 'FLAME', 'GARAGES', 'PIPE', 'POWER'];
type Chunk = {t: number; words: string[]; y: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let wi = 0;
  for (const c of timing.captions as {start: number; text: string}[]) {
    const disp = c.text.split(/\s+/).filter(Boolean);
    let cur: Chunk | null = null;
    disp.forEach((d, i) => {
      const bare = d.replace(/[^A-Za-z']/g, '');
      const n = (bare.length >= 2 && bare === bare.toUpperCase() ? bare.length : 1) + (d.includes('-') ? d.split('-').length - 1 : 0);
      const t = W[wi] ? W[wi][1] : c.start;
      wi += n;
      if (!cur || cur.words.length >= 3) {
        cur = {t, words: [], y: -1};
        out.push(cur);
      }
      cur.words.push(d.toUpperCase());
      if (/[.,?]$/.test(d) && i < disp.length - 1 && cur.words.length >= 2) cur = null;
    });
  }
  out.forEach((c) => {
    c.y = c.words.findIndex((w) => YELLOW.includes(w.replace(/[^A-Z-]/g, '')));
  });
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
      {c.words.map((w, j) => (
        <span key={j} style={{fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 900, fontSize: 96, lineHeight: 1.05, color: j === c.y ? '#ffd21f' : '#ffffff', WebkitTextStroke: '12px #14110c', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.45)', marginRight: 22, display: 'inline-block'}}>
          {w}
        </span>
      ))}
    </div>
  );
};

// ---------- set ----------
const WALL_IN = -2.0; // drywall face
const WALL_OUT = -2.45; // siding face
const CAV = -2.22; // inside the wall
const BASE = -4.2; // basement floor
const PIPE: V3[] = [
  [1.6, -2.6, -2.35],
  [1.6, -2.6, -1.6],
  [1.6, -0.25, -1.6],
  [1.6, -0.25, CAV],
  [1.6, 0.6, CAV],
  [0.55, 0.6, CAV],
  [0.55, 0.6, -1.8],
  [0.55, 1.45, -1.8],
  [0.1, 1.45, -1.8],
];
const VALVE: V3 = [1.6, -2.6, -1.95];
const ICE: V3 = [1.6, -1.45, -1.6];
const KNOB_CLOSED: V3 = [-0.12, 1.3, -1.06];
const HINGE_L = -1.1;
const doorKnob = (a: number): V3 => [HINGE_L + 0.98 * Math.cos(a), 1.3, -1.06 + 0.98 * Math.sin(a)];
const HANDLE: V3 = [0.25, 1.95, -1.6];
const P_KNOB: V3 = [-0.4, 0, 0.3];
const R_KNOB = Math.PI / 2;
const P_TAP: V3 = [-0.55, 0, -0.45];
const R_TAP = (75 / 180) * Math.PI;
const P_VALVE: V3 = [0.4, BASE, -1.1];
const R_VALVE = (55 / 180) * Math.PI;

const Seg: React.FC<{a: V3; b: V3; r: number; c: string; e?: number; o?: number; em?: string}> = ({a, b, r, c, e = 0, o = 1, em}) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const mid = A.clone().add(B).multiplyScalar(0.5);
  const qn = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return (
    <mesh position={mid} quaternion={qn} castShadow={o >= 1}>
      <cylinderGeometry args={[r, r, A.distanceTo(B) + r, 14]} />
      <meshStandardMaterial color={c} emissive={em ?? c} emissiveIntensity={e} metalness={o >= 1 ? 0.35 : 0} roughness={0.35} transparent={o < 1} opacity={o} depthWrite={o >= 1} />
    </mesh>
  );
};
// a wall panel that ghosts out when the camera passes through it (dissolve through walls/doors, never a cut)
const Ghost: React.FC<{x: [number, number]; y: [number, number]; z: number; d: number; c: string; cam: V3; force?: number}> = ({x, y, z, d, c, cam, force = 1}) => {
  const inside = cam[0] > x[0] - 0.4 && cam[0] < x[1] + 0.4 && cam[1] > y[0] - 0.4 && cam[1] < y[1] + 0.4;
  const o = Math.min(force, inside ? Math.max(0, Math.min(1, (Math.abs(cam[2] - z) - 0.12) / 0.5)) : 1);
  if (o <= 0.02) return null;
  return (
    <mesh position={[(x[0] + x[1]) / 2, (y[0] + y[1]) / 2, z]} castShadow={o >= 1} receiveShadow>
      <boxGeometry args={[x[1] - x[0], y[1] - y[0], d]} />
      <meshStandardMaterial color={c} transparent={o < 1} opacity={o} depthWrite={o >= 1} roughness={0.8} />
    </mesh>
  );
};
const WALL_RECTS: {x: [number, number]; y: [number, number]; cut?: boolean}[] = [
  {x: [-4.2, -0.8], y: [0, 4.4]},
  {x: [-0.8, 0.8], y: [0, 2.4]},
  {x: [-0.8, 0.8], y: [3.6, 4.4]},
  {x: [0.8, 1.05], y: [0, 4.4]},
  {x: [1.05, 2.65], y: [0, 1.7], cut: true},
  {x: [1.05, 2.65], y: [1.7, 4.4]},
  {x: [2.65, 9], y: [0, 4.4]},
];

const World: React.FC<{t: number; f: number; cam: V3}> = ({t, f, cam}) => {
  // frost: wall line from frame 0, pipe frost, yard line during the chase
  const wallFrost = interpolate(t, [0, 2.2], [0.35, 1], cl);
  const yard = interpolate(t, [T.follow + 0.3, T.thin], [0, 1], cl);
  const pipeFrost = 1;
  const cutSiding = interpolate(t, [T.hits + 0.3, T.hits + 0.8, T.finds + 1.4, T.finds + 1.8], [1, 0, 0, 1], cl);
  const cutDry = interpolate(t, [T.finds - 0.4, T.finds, T.behind, T.behind + 0.4], [1, 0, 0, 1], cl);
  const coldGlow = t >= T.coldWall && t < T.usual ? 0.8 + 0.4 * Math.sin(t * 6) : 0.3;
  // doors: open by Lineman at "lists" (shows the note) and again at "Open the doors"
  const open1 = interpolate(t, [T.lists - 0.3, T.lists + 0.2, T.follow - 0.2, T.follow + 0.3], [0, 1.6, 1.6, 0], cl);
  const open2 = interpolate(t, [T.openDoors, T.openDoors + 0.5], [0, 1.75], cl) * (t < T.openTap ? 1 : 1);
  const aL = Math.max(open1, open2);
  const aR = open2;
  const drip = t >= T.drip + 0.2 && t < T.openTap + 0.3;
  const trickle = t >= T.trickle && t < T.expands + 0.6;
  const torchIn = interpolate(t, [T.never + 0.2, T.never + 0.8], [0, 1], cl);
  const lid = interpolate(t, [T.never + 0.8, T.never + 1.1], [0, 1], cl);
  const valveTurn = interpolate(t, [T.ibhs + 0.6, T.know + 0.6], [0, Math.PI * 1.5], cl);
  return (
    <>
      <Inked>
        {/* kitchen + living room floor, interior ceiling */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.4, 0, 1.2]} receiveShadow>
          <planeGeometry args={[13.2, 6.4]} />
          <meshStandardMaterial color="#c9a074" roughness={0.85} />
        </mesh>
        <Box p={[-4.25, 2.2, 0.6]} s={[0.12, 4.4, 5.2]} c="#efe9dd" />
        {/* fridge with blank microwave on top (power is out) */}
        <Box p={[-2.5, 1.5, -1.6]} s={[1.0, 3.0, 0.8]} c="#f3f3ef" />
        <Box p={[-2.5, 3.25, -1.6]} s={[0.9, 0.45, 0.6]} c="#d9d9d4" />
        <Box p={[-2.25, 3.25, -1.29]} s={[0.25, 0.12, 0.02]} c="#2a2c30" />
        {/* sink cabinet (doors are separate) */}
        <Box p={[0, 0.06, -1.55]} s={[2.2, 0.12, 0.9]} c="#b4976a" />
        <Box p={[0, 0.85, -1.965]} s={[2.1, 1.5, 0.02]} c="#a88a5e" />
        <Box p={[-1.08, 0.8, -1.55]} s={[0.05, 1.6, 0.9]} c="#efe2c4" />
        <Box p={[1.08, 0.8, -1.55]} s={[0.05, 1.6, 0.9]} c="#efe2c4" />
        <Box p={[0, 1.64, -1.5]} s={[2.4, 0.08, 1.05]} c="#f2efe8" />
        <Box p={[0, 1.6, -1.75]} s={[0.9, 0.06, 0.5]} c="#9aa3ad" />
        {/* faucet + handles (cold = right, blue dot) */}
        <Box p={[0.1, 1.85, -1.85]} s={[0.07, 0.4, 0.07]} c="#c9ced6" />
        <Box p={[0.1, 2.03, -1.72]} s={[0.07, 0.07, 0.3]} c="#c9ced6" />
        <Box p={[0.25, 1.9, -1.72]} s={[0.12, 0.06, 0.16]} c="#c9ced6" />
        <Box p={[0.25, 1.94, -1.65]} s={[0.04, 0.02, 0.04]} c="#2b7be0" />
        <Box p={[-0.05, 1.9, -1.72]} s={[0.12, 0.06, 0.16]} c="#c9ced6" />
        <Box p={[-0.05, 1.94, -1.65]} s={[0.04, 0.02, 0.04]} c="#e0352b" />
        <Box p={[-0.75, 1.82, -1.45]} s={[0.36, 0.3, 0.3]} c="#d8402c" />
        <Box p={[-0.75, 2.0, -1.45]} s={[0.12, 0.08, 0.12]} c="#2b2d33" />
        <Box p={[0.6, 0.008, 1.0]} s={[2.4, 0.015, 1.4]} c="#c8643c" />
        {/* upper cabinets + dark ceiling light (off) */}
        <Box p={[-2.2, 3.5, -1.8]} s={[1.6, 1.1, 0.5]} c="#efe2c4" />
        <Box p={[2.0, 3.5, -1.8]} s={[1.6, 1.1, 0.5]} c="#efe2c4" />
        <Box p={[0, 4.42, -0.2]} s={[9, 0.06, 4.8]} c="#f2efe8" />
        <Box p={[0, 4.33, 0.2]} s={[0.6, 0.1, 0.6]} c="#9a9a98" />
        {/* floor vents (dark), thermostat (dark), living room couch */}
        <Box p={[-0.3, 0.01, 0.9]} s={[0.6, 0.02, 0.25]} c="#3a3c42" />
        <Box p={[5.0, 0.01, -1.3]} s={[0.6, 0.02, 0.25]} c="#3a3c42" />
        <Box p={[5.6, 2.3, -1.96]} s={[0.35, 0.45, 0.05]} c="#e9e6df" />
        <Box p={[5.6, 2.3, -1.93]} s={[0.25, 0.2, 0.02]} c="#2a2c30" />
        <Box p={[6.8, 0.45, -0.9]} s={[2.2, 0.9, 1.0]} c="#7fa37a" />
        <Box p={[6.8, 1.0, -1.35]} s={[2.2, 0.8, 0.25]} c="#7fa37a" />
        {/* outside: snowy yard, fence, trees */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, 0.005, -16]} receiveShadow>
          <planeGeometry args={[40, 27]} />
          <meshStandardMaterial color="#f5f8fc" roughness={1} />
        </mesh>
        {[[-3, -6], [5, -7], [1.5, -11], [-6, -12]].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, 0, z]} scale={[1.6, 0.5, 1.2]}>
            <sphereGeometry args={[1, 18, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
        {Array.from({length: 14}).map((_, i) => <Box key={i} p={[-5 + i * 1.0, 0.6, -13]} s={[0.12, 1.2, 0.12]} c="#8a6a4a" />)}
        <Box p={[1.5, 1.0, -13]} s={[14, 0.1, 0.08]} c="#8a6a4a" />
        {[[-7, -16], [7, -15], [3, -18]].map(([x, z]) => (
          <group key={`t${x}`} position={[x, 0, z]}>
            <Box p={[0, 0.6, 0]} s={[0.3, 1.2, 0.3]} c="#6b4a30" />
            <mesh position={[0, 2.6, 0]}>
              <coneGeometry args={[1.3, 3.2, 10]} />
              <meshStandardMaterial color="#3d6b4f" />
            </mesh>
            <mesh position={[0, 3.6, 0]}>
              <coneGeometry args={[0.8, 1.4, 10]} />
              <meshStandardMaterial color="#f5f8fc" />
            </mesh>
          </group>
        ))}
        {/* wall cavity: studs + thin insulation with gaps */}
        {[1.1, 1.85, 2.6].map((x) => <Box key={x} p={[x, 2.2, CAV]} s={[0.1, 4.4, 0.36]} c="#d6b58a" />)}
        {[[1.3, 0.3], [1.6, 1.1], [2.2, 0.5], [2.35, 1.35]].map(([x, y]) => <Box key={`i${x}${y}`} p={[x, y, CAV - 0.02]} s={[0.35, 0.3, 0.16]} c="#a9adb5" />)}
        {/* basement: foundation wall, floor, workbench */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, BASE, 0]} receiveShadow>
          <planeGeometry args={[10, 6]} />
          <meshStandardMaterial color="#b5b1aa" />
        </mesh>
        <Box p={[1, BASE / 2 - 0.05, -2.3]} s={[10, -BASE - 0.1, 0.2]} c="#c8c3ba" />
        <Box p={[-1.4, BASE + 1.2, -1.75]} s={[2.2, 0.08, 0.8]} c="#a8723f" />
        <Box p={[-2.3, BASE + 0.6, -1.75]} s={[0.1, 1.2, 0.7]} c="#8a5a2f" />
        <Box p={[-0.5, BASE + 0.6, -1.75]} s={[0.1, 1.2, 0.7]} c="#8a5a2f" />
        <Box p={[2.6, -0.9, -2.19]} s={[1.0, 0.45, 0.03]} c="#dff1ff" e={1.2} />
      </Inked>
      {/* siding (outside) and drywall (inside) as ghosting panels */}
      {WALL_RECTS.map((r, i) => (
        <React.Fragment key={i}>
          <Ghost x={r.x} y={r.y} z={WALL_OUT + 0.05} d={0.1} c="#9db3c6" cam={cam} force={r.cut ? cutSiding : 1} />
          <Ghost x={r.x} y={r.y} z={WALL_IN - 0.03} d={0.06} c="#ece6da" cam={cam} force={r.cut ? cutDry : 1} />
        </React.Fragment>
      ))}
      {/* window over the sink: snow glare */}
      <mesh position={[0, 3.0, -2.22]}>
        <planeGeometry args={[1.6, 1.2]} />
        <meshBasicMaterial color="#eef7ff" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <Box p={[0, 3.0, -2.0]} s={[1.7, 0.06, 0.1]} c="#ffffff" />
      {/* cabinet doors (left hinged at the left edge, right at the right edge), ghost when the camera passes */}
      {[
        {h: HINGE_L, a: aL, s: 1},
        {h: -HINGE_L, a: aR, s: -1},
      ].map((d, i) => {
        const camNear = cam[2] < -0.75 && cam[2] > -1.5 && Math.abs(cam[0]) < 1.4 && cam[1] < 1.8 && !(i === 0 && t >= T.lists && t < T.follow);
        const look = interpolate(t, [0.45, 0.7, T.lose - 0.1, T.lose + 0.15], [1, 0, 0, 1], cl);
        const xray = interpolate(t, [T.runs - 0.3, T.runs, T.closedDoor - 0.2, T.closedDoor, T.thatsWhy, T.thatsWhy + 0.3, T.openDoors - 0.2, T.openDoors], [1, 0.35, 0.35, 1, 1, 0.35, 0.35, 1], cl);
        const o = Math.min(look, xray, camNear ? Math.max(0, Math.min(1, (Math.abs(cam[2] + 1.08) - 0.08) / 0.35)) : 1);
        if (o <= 0.02) return null;
        return (
          <group key={i} position={[d.h, 0.85, -1.08]} rotation={[0, -d.s * d.a, 0]}>
            <mesh position={[d.s * 0.54, 0, 0]} castShadow>
              <boxGeometry args={[1.06, 1.5, 0.05]} />
              <meshStandardMaterial color={t >= T.closedDoor && t < T.noWarm + 0.6 ? '#a89a7c' : '#efe2c4'} transparent={o < 1} opacity={o} depthWrite={o >= 1} />
            </mesh>
            <mesh position={[d.s * 0.98, 0.45, 0.04]}>
              <sphereGeometry args={[0.045, 10, 8]} />
              <meshStandardMaterial color="#8a8f99" transparent={o < 1} opacity={o} />
            </mesh>
            {/* notes taped inside the left door */}
            {i === 0 && d.a > 0.3 && (
              <>
                <Sign title="Red Cross: attics, garages, kitchen cabinets" bg="#fbfaf4" p={[0.55, 0.1, -0.04]} rotY={Math.PI} width={0.8} h={560} k={t < T.follow ? 1 : 0} t={0} size={100} />
                {t >= T.kitchenCab && t < T.follow && (
                  <mesh position={[0.55, -0.12, -0.07]} rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[0.8 * interpolate(t, [T.kitchenCab, T.kitchenCab + 0.5], [0.2, 1], cl), 0.2]} />
                    <meshBasicMaterial color="#e8f7ff" transparent opacity={0.6} />
                  </mesh>
                )}
                <Sign title="Red Cross: lets warmer air circulate" bg="#ffe98a" p={[0.55, 0.25, -0.04]} rotY={Math.PI} width={0.62} h={560} k={t >= T.openDoors ? popK(t, T.warmer) : 0} t={0} size={100} />
              </>
            )}
          </group>
        );
      })}
      {/* copper pipe with frost; the ice plug glows soft white (no crack, no burst) */}
      {PIPE.slice(1).map((b, i) => (
        <React.Fragment key={i}>
          <Seg a={PIPE[i]} b={b} r={0.055} c="#c8743a" />
          {pipeFrost > 0 && <Seg a={PIPE[i]} b={b} r={0.072} c="#cdeeff" e={0.5} o={0.62} em="#7fd0ff" />}
        </React.Fragment>
      ))}
      {t >= T.expands - 0.3 && (
        <mesh position={ICE}>
          <capsuleGeometry args={[0.1, 0.35, 6, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#dff4ff" emissiveIntensity={1.2 + 0.4 * Math.sin(t * 5)} transparent opacity={0.9} />
        </mesh>
      )}
      {/* frost line on the interior wall under the window (moving from frame 0) */}
      <mesh position={[0.95, 2.4 - 0.4 * wallFrost, WALL_IN + 0.01]}>
        <planeGeometry args={[0.2, 0.8 * wallFrost]} />
        <meshStandardMaterial color="#e6f7ff" emissive="#7fd0ff" emissiveIntensity={0.8 + coldGlow} />
      </mesh>
      {/* frost line across the snow, up the siding */}
      {yard > 0 && (
        <>
          <mesh position={[1.85, 0.03, -8 + 2.75 * Math.min(1, yard * 1.4)]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.16, 5.5 * Math.min(1, yard * 1.4)]} />
            <meshStandardMaterial color="#cfeeff" emissive="#7fd0ff" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[1.85, 0.6 * Math.max(0, yard * 1.4 - 0.4) / 1.0, WALL_OUT - 0.02]}>
            <planeGeometry args={[0.16, 1.2 * Math.max(0, Math.min(1, yard * 1.4 - 0.4))]} />
            <meshStandardMaterial color="#cfeeff" emissive="#7fd0ff" emissiveIntensity={1.2} />
          </mesh>
        </>
      )}
      {/* drip / trickle from the faucet */}
      {drip && (
        <mesh position={[0.1, 1.95 - ((t * 2.2) % 1) * 0.3, -1.6]}>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshStandardMaterial color="#bfefff" emissive="#7fd8ff" emissiveIntensity={0.8} />
        </mesh>
      )}
      {trickle && <Seg a={[0.1, 1.98, -1.6]} b={[0.1, 1.66, -1.6]} r={0.012} c="#bfefff" e={0.8} o={0.85} />}
      {/* main shut-off valve wheel */}
      <group position={VALVE} rotation={[0, 0, valveTurn]}>
        <mesh>
          <torusGeometry args={[0.16, 0.025, 8, 24]} />
          <meshStandardMaterial color="#c0392b" />
        </mesh>
        <Box s={[0.32, 0.03, 0.03]} c="#c0392b" />
        <Box s={[0.03, 0.32, 0.03]} c="#c0392b" />
      </group>
      {/* workbench: propane torch goes back into its box (never lit) */}
      <group position={[-1.2, BASE + 1.24, -1.75]}>
        <Box p={[0, 0.15, 0]} s={[0.8, 0.3, 0.4]} c="#b5462f" />
        <group position={[0, 0.3, -0.2]} rotation={[-(1 - lid) * 1.4, 0, 0]}>
          <Box p={[0, 0, 0.2]} s={[0.82, 0.04, 0.42]} c="#9c3a26" />
        </group>
        <group position={[0.9 - 0.9 * torchIn, 0.35 - 0.25 * torchIn, 0]} rotation={[0, 0, Math.PI / 2 - 0.2 * (1 - torchIn)]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.1, 0.4, 14]} />
            <meshStandardMaterial color="#3a6fd8" />
          </mesh>
          <Box p={[0, 0.3, 0]} s={[0.05, 0.25, 0.05]} c="#b9bec7" />
        </group>
      </group>
      {/* in-world notes, magnets, tags */}
      <Sign title="IBHS: outages can lead to frozen pipes" bg="#ffe98a" p={[-2.15, 1.75, -1.18]} width={0.62} h={560} k={t >= T.lose && t < T.follow ? popK(t, T.risk - 0.2) : 0} t={0} size={98} />
      <Decal title="OUTSIDE WALL" bg="transparent" color="#e6f7ff" p={[1.85, 1.0, WALL_OUT - 0.03]} rot={[0, Math.PI, 0]} width={1.3} h={256} k={t >= T.hits && t < T.finds + 1 ? popK(t, T.hits + 0.5) : 0} size={150} glow={0.4} />
      <Sign title="Red Cross: walls with little insulation" bg="#e8d3a2" p={[1.4, 0.45, WALL_OUT - 0.08]} rotY={Math.PI} width={0.7} h={560} k={t >= T.thin && t < T.finds + 1 ? popK(t, T.thin + 0.2) : 0} t={0} size={98} />
      <Sign title="Red Cross: let cold water drip" bg="#ffe98a" p={[-0.65, 2.25, -1.97]} width={0.62} h={560} k={t >= T.drip ? popK(t, T.drip + 0.1) : 0} t={0} size={100} />
      <Sign title="MAIN SHUT-OFF" bg="#e8d3a2" p={[VALVE[0] + 0.28, VALVE[1] - 0.32, VALVE[2] + 0.12]} width={0.55} hangTo={0.18} k={t >= T.ibhs - 0.4 ? popK(t, T.ibhs) : 0} t={t} size={120} />
      <Sign title="IBHS: shut off the water supply" bg="#e8d3a2" p={[VALVE[0] - 0.45, VALVE[1] - 0.35, VALVE[2] + 0.1]} width={0.62} h={420} hangTo={0.2} k={t >= T.ibhs ? popK(t, T.ibhs + 0.4) : 0} t={t} size={92} />
      <Sign title="NO OPEN FLAME" color="#ffffff" bg="#c0392b" p={[-1.2, BASE + 1.4, -1.5]} width={0.6} h={256} k={t >= T.never ? popK(t, T.never + 1.0) : 0} t={0} size={110} />
      {t >= T.house1 - 0.4 && t < T.finds + 0.6 && <Volt frame={f} pos={[5.55, 0.55, -1.25]} glow={0} mood="worried" light={false} />}
      {/* daylight pools */}
      <Pool p={[0, 3.0, -1.4]} c="#eef6ff" i={8} d={7} />
      <Pool p={[5.2, 3.6, 0.6]} c="#fff1dc" i={5} d={8} />
      <Pool p={[1.0, BASE + 3.2, 0.2]} c="#fff1dc" i={7} d={8} />
    </>
  );
};

// ---------- camera ----------
const K0: CamKey = {t: 0, pos: [2.4, 2.1, 3.1], tgt: [-0.45, 1.4, -0.9], fov: 60, push: 0};
const KEYS: CamKey[] = [
  K0,
  {t: 0.25, pos: [0.9, 1.15, 0.1], tgt: [0.45, 0.85, -1.9], fov: 58, move: 0.9, push: 0.12}, // the doors dissolve: the frosted pipe inside
  {t: T.lose, pos: [1.6, 2.3, 1.8], tgt: [-2.3, 1.75, -1.2], fov: 58, move: 0.35}, // out around Lineman, not through him
  {t: T.lose + 0.35, pos: [-0.9, 2.2, 2.4], tgt: [-2.3, 1.75, -1.2], fov: 56, move: 0.5}, // fridge magnet
  {t: T.why, pos: [2.2, 2.2, 3.0], tgt: [-0.5, 1.35, -0.6], fov: 58, move: 0.5},
  {t: T.lists, pos: [1.3, 2.7, 0.3], tgt: [-1.12, 0.95, -0.53], fov: 62, move: 0.3},
  {t: T.lists + 0.3, pos: [0.9, 1.3, -1.25], tgt: [-1.12, 0.95, -0.53], fov: 62, move: 0.4}, // note inside the open door
  {t: T.follow, pos: [0.0, 3.0, -1.0], tgt: [0.0, 2.7, -4.0], fov: 60, move: 0.45, push: 0}, // to the window
  {t: T.follow + 0.45, pos: [-1.2, 3.0, -4.0], tgt: [1.6, 1.3, -9.0], fov: 60, move: 0.6, push: 0.08}, // through it, into the yard
  {t: T.hits, pos: [4.0, 1.7, -6.6], tgt: [1.85, 0.6, -2.6], fov: 58, move: 0.35},
  {t: T.thin, pos: [2.8, 1.9, -5.4], tgt: [1.75, 1.0, -2.3], fov: 58, move: 0.6},
  {t: T.house1, pos: [3.5, 2.1, 2.0], tgt: [5.4, 1.2, -1.5], fov: 58, move: 0.5}, // whip into the living room
  {t: T.finds, pos: [3.0, 1.6, 0.4], tgt: [1.0, 0.7, -2.1], fov: 60, move: 0.5}, // the pipe in the cut wall
  {t: T.runs, pos: [1.9, 1.7, 1.6], tgt: [0.1, 0.95, -1.5], fov: 60, move: 0.8, push: 0.06}, // inside the cabinet: pipe in front, closed door behind
  {t: T.thatsWhy, pos: [1.3, 1.3, 0.6], tgt: [0.45, 0.9, -1.9], fov: 58, move: 0.5, push: 0.12}, // push on the frosted pipe
  {t: T.openDoors - 0.3, pos: [2.0, 2.0, 2.4], tgt: [-0.4, 1.3, -0.8], fov: 60, move: 0.5}, // look out as the doors open
  {t: T.veryCold, pos: [2.4, 2.35, -0.3], tgt: [-0.15, 1.9, -1.4], fov: 56, move: 0.7}, // up to the faucet
  {t: T.says2, pos: [2.0, 2.3, -0.6], tgt: [-0.1, 1.9, -1.5], fov: 54, move: 0.6},
  {t: T.openTap, pos: [1.7, 2.2, 0.9], tgt: [-0.4, 1.8, -1.0], fov: 58, move: 0.5},
  {t: T.expands, pos: [2.7, -0.4, -0.2], tgt: [1.6, -0.9, -1.6], fov: 60, move: 0.8}, // down the pipe through the floor
  {t: T.breaks, pos: [2.7, -1.2, -0.3], tgt: [1.6, -1.5, -1.6], fov: 58, move: 0.5},
  {t: T.ibhs, pos: [2.6, -1.9, 1.2], tgt: [1.1, -2.6, -1.6], fov: 60, move: 0.6},
  {t: T.know, pos: [2.2, -2.2, 0.3], tgt: [1.5, -2.65, -1.8], fov: 56, move: 0.5},
  {t: T.never, pos: [1.4, -0.9, 1.6], tgt: [-1.2, -2.95, -1.7], fov: 56, move: 0.35},
  {t: T.never + 0.35, pos: [-2.6, -2.2, 0.4], tgt: [-1.2, -2.95, -1.7], fov: 56, move: 0.5},
  // loop experiment: back up the pipe to frame 0's camera on the last frame
  {t: T.never + 1.3, pos: K0.pos, tgt: K0.tgt, fov: K0.fov, move: END - 1 / FPS - (T.never + 1.3), push: 0},
];

const hero = (t: number, f: number): {pos: V3; rot: number; pose: Pose} | null => {
  const knobPose = (target: V3, extra: Pose): Pose => ({...reachArm(f, P_KNOB, R_KNOB, target), ...extra});
  if (t < T.follow + 0.3 || t >= T.never + 1.3) {
    const a = interpolate(t, [T.lists - 0.3, T.lists + 0.2, T.follow - 0.2, T.follow + 0.3], [0, 1.6, 1.6, 0], cl);
    const target = t < T.lists - 0.3 || t >= T.never + 1.3 ? KNOB_CLOSED : doorKnob(Math.min(a, 0.9));
    const hand = t < T.lose || t >= T.never + 1.3 || (t >= T.lists - 0.3 && t < T.lists + 0.3);
    return {pos: P_KNOB, rot: R_KNOB, pose: hand ? knobPose(target, {brows: 'worried', lookX: 0.15, lookY: -0.2}) : {armRx: -0.3, brows: 'worried', lookY: t < T.why ? 0.6 : -0.3, lookX: 0.1}};
  }
  if (t >= T.finds && t < T.veryCold) {
    const a = interpolate(t, [T.openDoors, T.openDoors + 0.5], [0, 1.75], cl);
    const reaching = t >= T.openDoors - 0.25 && t < T.openDoors + 0.35;
    return {pos: P_KNOB, rot: R_KNOB, pose: reaching ? knobPose(doorKnob(Math.min(a, 0.7)), {brows: 'up'}) : {armRx: -0.2, brows: t >= T.none ? 'worried' : 'up', lookY: -0.4, lookX: 0.2, mouth: t >= T.noWarm && t < T.thatsWhy ? 'o' : 'flat'}};
  }
  if (t >= T.veryCold && t < T.expands + 0.2) {
    const full = t >= T.openTap;
    const turn = full ? interpolate(t, [T.openTap + 0.2, T.openTap + 0.6], [0, 0.08], cl) : 0;
    const tgt: V3 = [HANDLE[0] + turn, HANDLE[1] + 0.02, HANDLE[2]];
    return {pos: P_TAP, rot: R_TAP, pose: {...reachArm(f, P_TAP, R_TAP, tgt), brows: t >= T.suspect - 0.6 ? 'worried' : 'up', mouth: t >= T.suspect - 0.6 ? 'frown' : 'flat', lookX: 0.25, lookY: 0.2}};
  }
  if (t >= T.ibhs - 0.4) {
    const ang = interpolate(t, [T.ibhs + 0.6, T.know + 0.6], [0, Math.PI * 1.5], cl);
    const rim: V3 = [VALVE[0] + 0.16 * Math.cos(ang + 2.4), VALVE[1] + 0.16 * Math.sin(ang + 2.4), VALVE[2] + 0.04];
    return {pos: P_VALVE, rot: R_VALVE, pose: {...reachArm(f, P_VALVE, R_VALVE, rim), brows: 'up', lookX: 0.1}};
  }
  return null;
};

// breath puff on "No warm air"
const Breath: React.FC<{t: number}> = ({t}) => {
  const u = (t - T.noWarm) / 0.9;
  if (u <= 0 || u >= 1) return null;
  return (
    <mesh position={[P_KNOB[0] + 0.55 + u * 0.3, 2.25 + u * 0.15, P_KNOB[2] - 0.1]}>
      <sphereGeometry args={[0.1 + u * 0.18, 12, 10]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.55 * (1 - u)} depthWrite={false} />
    </mesh>
  );
};

export const Short014: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cam = camAt(KEYS, t);
  const blur = Math.min(5, Math.max(0, (camSpeed(KEYS, t, FPS) - 4.5) * 1.1));
  const h = hero(t, f);
  return (
    <AbsoluteFill style={{background: '#eef3f8'}}>
      <LookCanvas blur={blur}>
        <RigCam {...cam} />
        <color attach="background" args={['#dcebf7']} />
        <Rig keyPos={[2, 8, -9]} keyColor="#fff6e8" keyI={3.0} fillI={1.9} fog={['#e9f0f6', 18, 45]} />
        <World t={t} f={f} cam={cam.pos} />
        {h && <Lineman frame={f} pos={h.pos} rotY={h.rot} pose={h.pose} />}
        <Breath t={t} />
      </LookCanvas>
      <Captions t={t} />
      <Audio src={staticFile('shorts2/s014.mp3')} />
    </AbsoluteFill>
  );
};
