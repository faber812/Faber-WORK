// S011B — A/B demo of the engine upgrade (src/three/look.tsx) on Short 011: script time 0–12 s and 30–42 s,
// same VASKO audio and word timing. One continuous garage set per part: the camera moves instead of cutting,
// labels live in the scene (signs, tags, floor decal), Lineman/Volt look unchanged (kit.tsx).
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Box, Lineman, Pose} from '../three/kit';
import {Car} from '../long/props';
import {CamKey, camAt, camSpeed, Decal, Headline, Inked, LookCanvas, Pool, popK, project, Puff, Rig, RigCam, Shaft, Sign, Sparkle, SpeedLines} from '../three/look';
import {CAR_X, Door, DOOR_Z, handleAt, Opener, PULL_POS, q, reach, Springs, T, Tracks} from './S011';
import {ThumbScene, ThumbText} from './Thumb011';

type V3 = [number, number, number];
const FPS = 30;
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const A_END = 12; // part A: script 0–12 s
const B_START = 30; // part B: script 30–42 s
const XF = 7; // dissolve frames between parts
export const S011B_FPS = FPS;
export const S011B_FRAMES = (A_END + 12) * FPS + XF;

const CORD: V3 = [0, 2.48, DOOR_Z + 1.0];
const TROLLEY: V3 = [0, 3.52, DOOR_Z + 1.0];
const OPENER: V3 = [0, 3.5, DOOR_Z + 5.2];
const OPEN_POS: V3 = [0.95, 0, -0.6];
const OPEN_ROT = -2.75;
const SIDE_POS: V3 = [3.0, 0, -2.55]; // beside the track, outside the 4.8 m door width
const SIDE_ROT = -2.35;

// ---------- the set (bright night: lantern + flashlight pools, warm key, cool fill) ----------
const Set: React.FC<{open?: number; released?: boolean; hi?: boolean; cordHi?: number; pulled?: number; crack?: boolean; zone?: number; shake?: number; plugGrey?: boolean}> = (o) => (
  <>
    <Inked>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 9.2]} />
        <meshStandardMaterial color="#b9b3a8" roughness={0.9} />
      </mesh>
      <Box p={[-3.4, 1.95, 0]} s={[0.2, 3.9, 9]} c="#b7a6cf" />
      <Box p={[3.4, 1.95, 0]} s={[0.2, 3.9, 9]} c="#b7a6cf" />
      <Box p={[0, 1.95, 4.5]} s={[7, 3.9, 0.2]} c="#a998c4" />
      <Box p={[0, 3.6, DOOR_Z - 0.12]} s={[6.8, 0.8, 0.16]} c="#a998c4" />
      <Box p={[-2.9, 1.6, DOOR_Z - 0.12]} s={[1.0, 3.2, 0.16]} c="#a998c4" />
      <Box p={[2.9, 1.6, DOOR_Z - 0.12]} s={[1.0, 3.2, 0.16]} c="#a998c4" />
      <Box p={[0, 4.0, 0]} s={[7, 0.1, 9]} c="#8f86ad" />
      {/* workbench + shelves on the left wall, paint cans for color */}
      <Box p={[-2.95, 0.9, 0.8]} s={[0.8, 0.08, 2.4]} c="#a8723f" />
      {[-0.3, 1.9].map((z) => <Box key={z} p={[-2.95, 0.45, z]} s={[0.7, 0.9, 0.08]} c="#8a5a2f" />)}
      <Box p={[-3.1, 2.1, 0.8]} s={[0.5, 0.06, 2.4]} c="#a8723f" />
      {[['#e85a3c', 0.1], ['#3cb4e8', 0.55], ['#f2c230', 1.0], ['#5fc46a', 1.45]].map(([c, z]) => (
        <Box key={c as string} p={[-3.1, 2.32, z as number]} s={[0.3, 0.38, 0.3]} c={c as string} />
      ))}
      {/* pegboard on the right wall */}
      <Box p={[3.27, 1.9, -1.0]} s={[0.05, 1.5, 2.2]} c="#c79b62" />
      {/* window on the right wall: moonlight */}
      <Box p={[3.29, 2.6, 2.2]} s={[0.04, 1.0, 1.4]} c="#9fc4ff" e={0.9} />
    </Inked>
    <group position={[Math.sin((o.shake ?? 0) * 60) * 0.015 * (o.shake ?? 0), 0, 0]}>
      <Inked>
        <Door open={o.open ?? 0} />
        <Tracks />
        <Springs crack={o.crack} />
      </Inked>
    </group>
    <Inked>
      <Opener hi={o.hi} cordHi={o.cordHi} pulled={o.pulled} released={o.released} open={o.open} />
      {/* grey plug hanging loose = no power */}
      <Box p={[0.5, 3.75, DOOR_Z + 5.4]} s={[0.12, 0.1, 0.1]} c="#8a8d96" />
      {/* battery lantern on the bench */}
      <Box p={[-2.85, 1.12, 0.3]} s={[0.22, 0.36, 0.22]} c="#ffd27a" e={1.6} />
      <group position={[CAR_X, 0, -1.85]} scale={1.8}>
        <Car p={[0, 0, 0]} r={Math.PI} c="#e5483b" lights={0} />
      </group>
    </Inked>
    {(o.zone ?? 0) > 0 && (
      <mesh position={[0, 0.02, DOOR_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.8, 0.8]} />
        <meshStandardMaterial color="#ffb238" emissive="#ffb238" emissiveIntensity={0.4 * (o.zone ?? 0)} transparent opacity={0.85 * (o.zone ?? 0)} />
      </mesh>
    )}
    <Pool p={[-2.6, 1.6, 0.3]} c="#ffb766" i={9} d={7} />
    <Pool p={[2.6, 2.6, 2.0]} c="#9fbcff" i={4} d={6} />
  </>
);

// ---------- part A: 0–12 s ----------
const KEYS_A: CamKey[] = [
  {t: 0, pos: [-2.2, 2.5, 3.6], tgt: [0.3, 1.7, -3.2], fov: 58, push: 0.1},
  {t: T.stuck, pos: [2.0, 2.3, -3.4], tgt: [0.8, 1.9, -0.6], fov: 56},
  {t: T.budge, pos: [2.1, 1.8, -1.5], tgt: [0.2, 1.3, -4], fov: 56, move: 0.4},
  {t: T.how, pos: [2.3, 2.7, -3.4], tgt: [0.9, 2.3, -0.6], fov: 56},
  {t: T.locked, pos: [2.7, 1.7, -1.8], tgt: [2.0, 1.15, -4], fov: 52},
  {t: T.hooked, pos: [2.3, 2.4, -1.6], tgt: [0, 3.3, -2.6], fov: 60, move: 0.6},
  {t: T.noPower, pos: [2.6, 3.4, -2.8], tgt: [0, 3.35, 1.0], fov: 58, move: 0.5},
  {t: T.unhook, pos: [2.0, 2.25, -1.7], tgt: [0, 2.8, -3.0], fov: 54, move: 0.55},
];
const PartA: React.FC<{ts: number}> = ({ts}) => {
  const f = Math.round(ts * FPS);
  const cam = camAt(KEYS_A, ts);
  const blur = Math.min(5, Math.max(0, (camSpeed(KEYS_A, ts, FPS) - 3) * 1.4));
  // remote press: anticipation (arm back) then press with overshoot
  const press = interpolate(ts, [T.stuck + 0.15, T.stuck + 0.3, T.stuck + 0.45, T.stuck + 0.6], [0, -0.25, 0.15, 0], cl);
  const remote = ts >= T.stuck && ts < T.how;
  const look: Record<string, number> = {};
  const lookY = ts < T.locked ? 0 : ts < T.hooked ? 0.5 : 0.1;
  const lookX = ts < T.hooked ? -0.15 : -0.55;
  const hero: Pose = remote
    ? {hold: 'card', armRx: -1.25 + press, armR: 0.05, brows: ts > T.budge ? 'worried' : 'up', lookX: -0.1, lookY: 0.15, mouth: ts > T.budge ? 'frown' : 'flat'}
    : {hold: 'phone', armRx: ts >= T.hooked ? -2.0 : -1.35, phoneGlow: 1, brows: 'worried', lookX, lookY, mouth: ts >= T.how && ts < T.locked ? 'o' : 'flat'};
  void look;
  const phone: V3 = [0.62, ts >= T.hooked ? 2.05 : 1.45, -1.25];
  const beamTo: V3 = ts < T.locked ? [0.2, 1.6, -4] : ts < T.hooked ? [2.0, 1.2, -4] : ts < T.unhook ? [0, 3.4, -2.0] : CORD;
  const shake = interpolate(ts, [T.budge + 0.1, T.budge + 0.25, T.budge + 0.6], [0, 1, 0], cl);
  const handle = handleAt(0);
  const pHandle = project(cam, CORD);
  const pDoor = project(cam, [0.4, 0.15, -3.9]);
  const pHead = project(cam, [OPEN_POS[0], 3.05, OPEN_POS[2]]);
  const pOpener = project(cam, [0.15, 3.5, -2.6]);
  return (
    <AbsoluteFill style={{background: '#20183a'}}>
      <LookCanvas blur={blur}>
        <RigCam {...cam} />
        <color attach="background" args={['#2a2147']} />
        <Rig keyPos={[3.5, 6, 3]} keyI={3.2} fillI={2.1} fog={['#4a3f70', 10, 24]} />
        <Set hi={ts >= T.hooked && ts < T.unhook} cordHi={ts >= T.unhook ? 1.4 + Math.sin(ts * 9) * 0.5 : 0.3} shake={shake} />
        <Lineman frame={f} pos={OPEN_POS} rotY={OPEN_ROT} pose={hero} />
        <spotLight position={phone} target-position={beamTo} angle={0.42} penumbra={0.5} intensity={45} distance={9} color="#ffcf8a" castShadow />
        {!remote && <Shaft from={beamTo} to={phone} r={0.5} o={0.12} />}
        {/* in-world labels */}
        <Sign title="PROBABLY NOT LOCKED" p={[handle[0], handle[1] - 0.36, handle[2] + 0.12]} width={0.8} hangTo={0.27} k={ts < T.hooked ? popK(ts, T.locked + 0.25) : 0} t={ts} size={130} />
        <Sign title="HOOKED TO THE OPENER" color="#b56a00" p={[0.05, 2.95, -2.1]} rotY={0.5} width={1.25} hangTo={0.62} k={ts < T.unhook ? popK(ts, T.hooked + 0.2) : 0} t={ts} size={120} />
        <Sign title="NO POWER · NO BATTERY BACKUP" p={[0, 2.9, OPENER[2] - 0.2]} rotY={0.6} width={1.35} hangTo={0.55} k={ts < T.unhook ? popK(ts, T.noPower) : 0} t={ts} size={100} />
        <Sign title="UNHOOK IT" color="#c62a1c" p={[0.6, 3.05, CORD[2] + 0.1]} rotY={0.7} width={0.6} k={popK(ts, T.unhook + 0.15)} t={ts} size={150} glow={0.2} />
      </LookCanvas>
      {/* FX + overlays pinned to the scene */}
      <Puff x={pDoor.x} y={pDoor.y} t={ts} at={T.budge + 0.12} s={1.2} />
      {ts >= T.stuck && ts < T.budge && (
        <div style={{position: 'absolute', left: pOpener.x - 40, top: pOpener.y - 120, transform: `scale(${popK(ts, T.stuck + 0.45)})`, fontFamily: 'Inter', fontWeight: 900, fontSize: 70, color: '#fff', WebkitTextStroke: '8px #0a0a12', paintOrder: 'stroke fill'}}>CLICK…</div>
      )}
      {ts >= T.how && ts < T.locked && (
        <div style={{position: 'absolute', left: pHead.x - 60, top: pHead.y - 230, transform: `scale(${popK(ts, T.how + 0.1)}) rotate(${Math.sin(ts * 4) * 6}deg)`, fontFamily: 'Inter', fontWeight: 900, fontSize: 240, color: '#ffc23a', WebkitTextStroke: '18px #0a0a12', paintOrder: 'stroke fill'}}>?</div>
      )}
      <Sparkle x={pHandle.x} y={pHandle.y} t={ts} at={T.unhook + 0.1} s={1.4} />
      <Sparkle x={pHandle.x} y={pHandle.y} t={ts} at={T.unhook + 0.75} s={1.0} />
      <Headline lines={[["CAR'S STUCK."], ['LOOK UP.', '#ffc23a']]} top={250} size={140} t={ts} at={0.3} out={T.stuck + 0.6} />
    </AbsoluteFill>
  );
};

// ---------- part B: 30–42 s ----------
const SWAP_OPEN = T.stuckOpen + 0.14; // door state swaps inside the whip (motion-blurred)
const SWAP_CLOSED = T.closedTag + 0.14;
const KEYS_B: CamKey[] = [
  {t: B_START, pos: [1.7, 2.6, -0.9], tgt: [1.1, 3.4, -3.75], fov: 54, push: 0.1},
  {t: T.callPro1, pos: [0.95, 2.0, 0.9], tgt: [3.2, 1.9, -1.0], fov: 50},
  {t: T.clear, pos: [1.9, 3.1, -1.0], tgt: [1.55, 0, -3.25], fov: 52, move: 0.55},
  {t: T.stuckOpen, pos: [2.5, 2.3, 0.4], tgt: [0.5, 1.3, -4], fov: 56, move: 0.3},
  {t: T.keepOut, pos: [0.6, 2.2, 1.2], tgt: [2.1, 1.1, -3.0], fov: 60, move: 0.6},
  {t: T.closedTag, pos: [-2.0, 3.5, 0.4], tgt: [0.6, 2.0, -2.8], fov: 60, move: 0.3},
  {t: T.down, pos: [0.9, 3.35, -0.5], tgt: [0, 3.45, -2.95], fov: 54, move: 0.4},
  {t: T.liftNever, pos: [1.0, 2.2, 0.2], tgt: [2.0, 0.9, -4], fov: 55, move: 0.45},
];
const PartB: React.FC<{ts: number}> = ({ts}) => {
  const f = Math.round(ts * FPS);
  const cam = camAt(KEYS_B, ts);
  const blur = Math.min(6, Math.max(0, (camSpeed(KEYS_B, ts, FPS) - 3) * 1.4));
  const openState = ts >= SWAP_OPEN && ts < SWAP_CLOSED;
  const open = openState ? 0.5 : 0;
  const zone = openState ? 0.75 + 0.25 * Math.sin(ts * 5) : 0;
  // pull: anticipation (hand up a little) → pull with overshoot → settle
  const pull = interpolate(ts, [T.pullDown - 0.25, T.pullDown, T.pullDown + 0.3, T.pullDown + 0.5], [-0.15, -0.15, 0.62, 0.5], cl);
  const atPull = ts >= SWAP_CLOSED;
  const grip: V3 = [0, 2.48 - Math.max(-0.15, pull) * 0.5, CORD[2]];
  const hero: Pose = atPull
    ? {...reach(f, PULL_POS, Math.PI, grip), brows: 'up', lookX: -0.45, mouth: ts > T.down ? 'smile' : 'flat'}
    : openState
      ? {armL: interpolate(ts, [SWAP_OPEN + 0.2, SWAP_OPEN + 0.5], [0, 1.35], cl), armRx: -0.2, brows: 'worried', lookY: -0.6, lookX: 0.1}
      : {hold: 'phone', armRx: -1.4, phoneGlow: 1, brows: 'worried', lookY: ts > T.callPro1 ? 0.3 : 0.6, lookX: -0.4};
  const heroPos: V3 = atPull ? PULL_POS : openState ? SIDE_POS : [2.25, 0, 0.9];
  const heroRot = atPull ? Math.PI : openState ? SIDE_ROT : -2.2;
  const released = ts >= T.down;
  const pHandle = project(cam, [0, 2.48 - Math.max(0, pull) * 0.5, CORD[2]]);
  const pTrolley = project(cam, TROLLEY);
  const pWrench = project(cam, [3.1, 1.45, -1.0]);
  return (
    <AbsoluteFill style={{background: '#20183a'}}>
      <LookCanvas blur={blur}>
        <RigCam {...cam} />
        <color attach="background" args={['#2a2147']} />
        <Rig keyPos={[3.5, 6, 3]} keyI={3.2} fillI={2.1} fog={['#4a3f70', 10, 24]} />
        <Set open={open} crack={ts < T.callPro1 + 0.3} zone={zone} released={released} pulled={atPull ? Math.max(0, pull) : 0} hi={released && ts < T.down + 0.6} cordHi={atPull && !released ? 1.0 : 0.3} />
        <Lineman frame={f} pos={heroPos} rotY={heroRot} pose={hero} />
        {!atPull && !openState && <spotLight position={[2.0, 1.5, 0.3]} target-position={[1.4, 3.3, -3.6]} angle={0.4} penumbra={0.5} intensity={45} distance={9} color="#ffcf8a" />}
        {/* wrench pops out of the pegboard */}
        <group position={[3.12, 1.45, -1.0]} rotation={[0.6, 0, 0]} scale={popK(ts, T.callPro1 + 0.35) * (ts < T.clear ? 1 : 0)}>
          <Box s={[0.08, 0.7, 0.1]} c="#c9ced9" />
          <Box p={[0, 0.42, 0]} s={[0.1, 0.22, 0.28]} c="#c9ced9" />
        </group>
        {/* signs */}
        <Sign title="BROKEN SPRING, CABLE OR ROLLER? DON'T PULL." src="Chamberlain · Genie" color="#c62a1c" p={[1.25, 2.95, -3.45]} rotY={0.35} width={1.1} hangTo={0.5} k={ts < T.callPro1 ? 1 : 0} t={ts} size={92} />
        <Sign title="CALL A GARAGE DOOR PRO" p={[3.22, 2.25, -1.0]} rotY={-Math.PI / 2} width={1.5} k={ts < T.clear + 0.4 ? popK(ts, T.callPro1 + 0.1) : 0} t={0} size={118} />
        <Decal title="DOORWAY CLEAR" sub="no people · no pets" src="Chamberlain" color="#127a3c" bg="#e9fff1" p={[1.55, 0.03, -3.3]} width={1.45} k={ts < T.stuckOpen + 0.2 ? popK(ts, T.clear + 0.2) : 0} size={130} />
        <Sign title="DOOR OPEN? USE CAUTION. STAY OUT FROM UNDER IT." src="16 CFR 1211 · Chamberlain" color="#a65b00" p={[1.3, 2.55, -2.45]} rotY={0.45} width={1.45} hangTo={1.35} k={openState ? popK(ts, SWAP_OPEN + 0.15) : 0} t={ts} size={88} />
        <Sign title="DOOR CLOSED ✓" color="#127a3c" bg="#e9fff1" p={[-1.2, 1.7, DOOR_Z + 0.1]} width={1.3} k={ts >= SWAP_CLOSED ? popK(ts, SWAP_CLOSED + 0.15) : 0} t={0} size={130} />
        <Sign title="UNHOOKED" color="#b56a00" p={[0.5, 3.1, -2.7]} rotY={0.6} width={0.7} hangTo={0.4} k={popK(ts, T.down + 0.1)} t={ts} size={150} />
      </LookCanvas>
      <SpeedLines x={pHandle.x + 70} y={pHandle.y - 40} t={ts} at={T.pullDown + 0.02} dir="down" />
      <Sparkle x={pTrolley.x} y={pTrolley.y} t={ts} at={T.down + 0.05} s={1.5} color="#ffd25a" />
      <Sparkle x={pWrench.x} y={pWrench.y} t={ts} at={T.callPro1 + 0.4} s={1.1} />
    </AbsoluteFill>
  );
};

// ---------- composition ----------
const Thumb0: React.FC = () => (
  <AbsoluteFill>
    <ThumbScene frame={0} />
    <ThumbText />
  </AbsoluteFill>
);
export const Short011B: React.FC = () => {
  const f = useCurrentFrame();
  const aFrames = A_END * FPS;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* part A (with the thumbnail frame dissolving in at 0.3 s) */}
      <Sequence from={0} durationInFrames={aFrames + XF}>
        <AbsoluteFill style={{opacity: 1}}>
          {f >= 9 - XF && <PartA ts={f / FPS} />}
          {f < 9 && <AbsoluteFill style={{opacity: interpolate(f, [9 - XF, 9], [1, 0], cl)}}><Thumb0 /></AbsoluteFill>}
        </AbsoluteFill>
        <Audio src={staticFile('shorts2/s011.mp3')} endAt={aFrames + XF} volume={(x) => interpolate(x, [aFrames, aFrames + XF], [1, 0], cl)} />
      </Sequence>
      {/* part B dissolves over A */}
      <Sequence from={aFrames} durationInFrames={12 * FPS + XF}>
        <AbsoluteFill style={{opacity: interpolate(f, [aFrames, aFrames + XF], [0, 1], cl)}}>
          <PartB ts={B_START + (f - aFrames) / FPS} />
        </AbsoluteFill>
        <Audio src={staticFile('shorts2/s011.mp3')} startFrom={B_START * FPS} volume={(x) => interpolate(x, [0, XF], [0, 1], cl)} />
      </Sequence>
    </AbsoluteFill>
  );
};
void q;
