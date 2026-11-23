// Short 011 — "How to Open Your Garage Door When the Power Is Out" (1080x1920, 30 fps, no music).
// Script: yt-channel content/scripts/short-011-garage-door.md (factcheck PASS v2.1). Real voice timing in s011_timing.json.
// Rules: generic opener (no brand/logo/app); nobody ever under a moving door; the falling door is a ghost diagram only;
// Lineman pulls the cord and lifts the door from beside it, by the door handle, never the cord.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timing from './s011_timing.json';
import {Box, Cam, clamp, Lineman, Pose, Volt} from '../three/kit';
import {Canvas, Car, FONT, pop, UI, useFov} from '../long/props';
import {ThumbScene, ThumbText} from './Thumb011';

export const S011_FPS = 30;
export const S011_FRAMES = Math.ceil((timing.duration + 0.6) * S011_FPS);
type V3 = [number, number, number];
const W = timing.words as [string, number, number][];

// ---------- cues: word sequence, first match at or after `after` ----------
const toks = (text: string) => (text.toLowerCase().replace(/[^a-z' ]/g, ' ').match(/[a-z']+/g) ?? []).map((w) => w.replace(/^'+|'+$/g, ''));
export const q = (head: string, after = 0) => {
  const h = toks(head);
  for (let i = 0; i + h.length <= W.length; i++) {
    if (W[i][1] < after - 0.001) continue;
    if (h.every((x, j) => W[i + j][0] === x)) return W[i][1];
  }
  throw new Error(`cue not found: ${head}`);
};

// ---------- garage set ----------
// door plane z = -4, x -2.4..2.4, 4 panels of 0.8 m; tracks go up, then along the ceiling (y 3.45) into the garage
export const DOOR_Z = -4;
const PANEL = 0.8;
const HANDLE_X = 2.0;
export const CAR_X = -0.5;
// lift handle on the second section: world position for a given door opening
export const handleAt = (open: number): V3 => [HANDLE_X, open * 3.2 + PANEL * 1.5 + 0.05, DOOR_Z + 0.1];
// aim Lineman's right arm (kit pose: armRx, armR) so the hand lands on a world point
export const reach = (frame: number, pos: V3, rotY: number, target: V3) => {
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
const panelPose = (s: number): {p: V3; flat: boolean} => (s < 3.2 ? {p: [0, s, DOOR_Z], flat: false} : {p: [0, 3.45, DOOR_Z + (s - 3.2)], flat: true});
export const Door: React.FC<{open: number; ghost?: boolean}> = ({open, ghost}) => (
  <group>
    {[0, 1, 2, 3].map((i) => {
      const {p, flat} = panelPose(open * 3.2 + i * PANEL + PANEL / 2);
      return (
        <group key={i} position={p} rotation={[flat ? -Math.PI / 2 : 0, 0, 0]}>
          <Box s={[4.8, PANEL - 0.03, 0.08]} c={ghost ? '#9fb4ff' : '#c9ced9'} />
          {[-1.6, 0, 1.6].map((x) => <Box key={x} p={[x, 0, 0.05]} s={[1.3, PANEL * 0.62, 0.02]} c="#b3b9c6" />)}
          {i === 1 && <Box p={[HANDLE_X, 0.05, 0.1]} s={[0.4, 0.1, 0.1]} c="#2b2e38" />}
          {/* hinges between sections */}
          {i > 0 && [-2.0, 0, 2.0].map((x) => <Box key={`h${x}`} p={[x, -PANEL / 2, 0.06]} s={[0.14, 0.12, 0.03]} c="#6b7080" />)}
        </group>
      );
    })}
  </group>
);
export const Tracks: React.FC = () => (
  <>
    {[-2.5, 2.5].map((x) => (
      <group key={x}>
        <Box p={[x, 1.7, DOOR_Z + 0.05]} s={[0.06, 3.4, 0.12]} c="#8a90a0" />
        <Box p={[x, 3.45, DOOR_Z + 1.8]} s={[0.06, 0.12, 3.6]} c="#8a90a0" />
      </group>
    ))}
  </>
);
// generic opener: dark housing, rail, trolley, arm to the door top, red cord with a T handle
export const Opener: React.FC<{hi?: boolean; cordHi?: number; pulled?: number; released?: boolean; open?: number}> = ({hi, cordHi = 0, pulled = 0, released, open = 0}) => {
  const trolleyZ = DOOR_Z + 1.0 + (released ? 0 : open * 3.0);
  return (
    <group>
      <Box p={[0, 3.62, DOOR_Z + 2.5]} s={[0.14, 0.08, 5.0]} c={hi ? '#ffc35a' : '#7a8090'} e={hi ? 0.8 : 0} />
      <Box p={[0, 3.5, DOOR_Z + 5.2]} s={[0.7, 0.36, 0.9]} c="#2b2e38" />
      <Box p={[0.37, 3.45, DOOR_Z + 5.2]} s={[0.02, 0.08, 0.2]} c="#55585f" />
      {/* plug, grey: no power */}
      <Box p={[0.5, 3.75, DOOR_Z + 5.4]} s={[0.12, 0.1, 0.1]} c="#5a5d66" />
      <Box p={[0, 3.52, trolleyZ]} s={[0.22, 0.14, 0.3]} c={hi ? '#ffc35a' : '#a8adb8'} e={hi ? 1 : 0} />
      {/* arm from trolley to door top (only while hooked and the door is closed) */}
      {!released && open < 0.01 && (
        <group position={[0, 3.3, (trolleyZ + DOOR_Z) / 2]} rotation={[Math.atan2(0.35, trolleyZ - DOOR_Z), 0, 0]}>
          <Box s={[0.08, 0.08, Math.hypot(trolleyZ - DOOR_Z, 0.35)]} c={hi ? '#ffc35a' : '#a8adb8'} e={hi ? 1 : 0} />
        </group>
      )}
      {released && <Box p={[0, 3.3, DOOR_Z + 0.45]} s={[0.08, 0.08, 0.5]} c="#a8adb8" />}
      {/* red cord + T handle; pulled = handle drawn down */}
      <Box p={[0, 3.0 - pulled * 0.25, trolleyZ]} s={[0.035, 1.0 + pulled * 0.5, 0.035]} c="#e03030" e={0.4 + cordHi} />
      <Box p={[0, 2.48 - pulled * 0.5, trolleyZ]} s={[0.24, 0.07, 0.07]} c="#e03030" e={0.4 + cordHi} />
    </group>
  );
};
export const Springs: React.FC<{glow?: number; crack?: boolean; stretch?: number}> = ({glow = 0, crack, stretch = 0}) => (
  <group position={[0, 3.55, DOOR_Z + 0.25]}>
    {[-1, 1].map((side) => (
      <group key={side} position={[side * 1.1, 0, 0]}>
        {Array.from({length: 10}).map((_, i) => (
          <mesh key={i} position={[(i - 4.5) * (0.13 + stretch * 0.02), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.1, 0.025, 6, 16]} />
            <meshStandardMaterial color={glow > 0 ? '#ffd23a' : '#9aa0ad'} emissive={glow > 0 ? '#ffb000' : '#000'} emissiveIntensity={glow} />
          </mesh>
        ))}
        {crack && side === 1 && <Box p={[0.05, 0, 0.12]} r={[0, 0, 0.6]} s={[0.05, 0.36, 0.02]} c="#e03030" e={1} />}
      </group>
    ))}
    <Box p={[0, 0, -0.05]} s={[3.8, 0.04, 0.04]} c="#55585f" />
  </group>
);
// the whole garage: walls, ceiling, door, opener, springs, car, Lineman with a phone flashlight
const Garage: React.FC<{
  f: number; cam: V3; tgt: V3; open?: number; hi?: boolean; cordHi?: number; pulled?: number; released?: boolean;
  springGlow?: number; crack?: boolean; dark?: boolean; zone?: boolean; hero?: Pose | null; heroPos?: V3; heroRot?: number; beam?: V3; volt?: boolean; headlights?: boolean; fov?: number;
}> = (o) => {
  const fov = useFov(o.fov);
  const heroPos = o.heroPos ?? [1.6, 0, -1.2];
  return (
    <Canvas>
      <Cam pos={o.cam} target={o.tgt} fov={fov} />
      <color attach="background" args={['#1a2140']} />
      <hemisphereLight args={['#b9c8f0', '#3a4260', 1.25]} />
      <directionalLight position={[3, 6, 6]} intensity={0.7} color="#c8d6ff" />
      {!o.dark && <pointLight position={[0, 3.7, -1]} intensity={6} distance={9} color="#9fb4ff" />}
      {o.zone && <Box p={[0, 0.03, DOOR_Z]} s={[4.8, 0.02, 0.7]} c={UI.amber} e={0.5} />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#6a7080" />
      </mesh>
      {/* side walls, back wall, header above the door, ceiling */}
      <Box p={[-3.4, 1.95, 0]} s={[0.2, 3.9, 9]} c="#46507a" />
      <Box p={[3.4, 1.95, 0]} s={[0.2, 3.9, 9]} c="#46507a" />
      <Box p={[0, 3.6, DOOR_Z - 0.12]} s={[6.8, 0.8, 0.16]} c="#46507a" />
      <Box p={[-2.9, 1.6, DOOR_Z - 0.12]} s={[1.0, 3.2, 0.16]} c="#46507a" />
      <Box p={[2.9, 1.6, DOOR_Z - 0.12]} s={[1.0, 3.2, 0.16]} c="#46507a" />
      <Box p={[0, 4.0, 0]} s={[7, 0.1, 9]} c="#3a4366" />
      {/* outside through the door: night driveway */}
      <Box p={[0, 1.6, DOOR_Z - 3]} s={[8, 3.2, 0.1]} c="#26315c" />
      <Box p={[0, 0.01, DOOR_Z - 1.5]} s={[5, 0.02, 3]} c="#5d6473" />
      <Door open={o.open ?? 0} />
      <Tracks />
      <Opener hi={o.hi} cordHi={o.cordHi} pulled={o.pulled} released={o.released} open={o.open} />
      <Springs glow={o.springGlow} crack={o.crack} />
      <group position={[CAR_X, 0, -1.85]} scale={1.8}><Car p={[0, 0, 0]} r={Math.PI} c="#4e7fff" lights={o.headlights ? 3 : 0} /></group>
      {o.headlights && <spotLight position={[CAR_X, 0.7, -3.8]} target-position={[CAR_X, 0, -9]} angle={0.55} penumbra={0.5} intensity={140} distance={20} color="#fff3d6" />}
      {o.hero !== null && <Lineman frame={o.f} pos={heroPos} rotY={o.heroRot ?? -2.6} pose={o.hero ?? {hold: 'phone', armRx: -1.3, phoneGlow: 1, lookX: -0.2}} />}
      {o.beam && <spotLight position={[heroPos[0] - 0.4, 1.8, heroPos[2] - 0.3]} target-position={o.beam} angle={0.38} penumbra={0.5} intensity={o.dark ? 70 : 40} distance={10} color={o.dark ? '#ffc070' : '#ffe3a8'} />}
      {o.volt && <Volt frame={o.f} pos={[-1.9, 3.0, DOOR_Z + 0.9]} glow={0} mood="worried" />}
    </Canvas>
  );
};

// ---------- 2D ----------
const kk = (t: number, at: number) => interpolate(t, [at, at + 0.25], [0, 1], clamp);
const Txt: React.FC<{lines: [string, string?][]; top: number; size?: number; o?: number}> = ({lines, top, size = 110, o = 1}) => (
  <div style={{position: 'absolute', top, left: 60, right: 180, opacity: o, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8}}>
    {lines.map(([l, c]) => (
      <div key={l} style={{background: 'rgba(8,10,18,0.9)', borderRadius: 14, padding: '4px 22px 10px', fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.02, color: c ?? '#fff', letterSpacing: -1}}>{l}</div>
    ))}
  </div>
);
const Card: React.FC<{text: string; small?: string; src?: string; top?: number; size?: number; o?: number; color?: string; icon?: string}> = ({text, small, src, top = 260, size = 64, o = 1, color = '#fff', icon}) => (
  <div style={{position: 'absolute', top, left: 60, right: 180, opacity: o, background: 'rgba(8,10,18,0.93)', borderRadius: 22, padding: '20px 26px', fontFamily: FONT}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      {icon && <span style={{fontSize: size * 1.1}}>{icon}</span>}
      <div style={{fontWeight: 900, fontSize: size, color, lineHeight: 1.05}}>{text}</div>
    </div>
    {small && <div style={{fontWeight: 800, fontSize: 40, color: UI.dim, marginTop: 8}}>{small}</div>}
    {src && <div style={{fontWeight: 700, fontSize: 32, color: '#cfd6ea', marginTop: 12}}>Source: {src}</div>}
  </div>
);
const Chip: React.FC<{text: string; x: number; y: number; size?: number; o?: number; color?: string; bg?: string}> = ({text, x, y, size = 40, o = 1, color = '#fff', bg = 'rgba(8,10,18,0.92)'}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: o, background: bg, borderRadius: 12, padding: '6px 16px', fontFamily: FONT, fontWeight: 900, fontSize: size, color, whiteSpace: 'nowrap'}}>{text}</div>
);
const Dia: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #1b2550 0%, #0b1020 75%)'}}>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>{children}</svg>
  </AbsoluteFill>
);
// flat door outline (diagrams)
const FlatDoor: React.FC<{x: number; y: number; w?: number; h?: number; open?: number; ghost?: boolean; color?: string}> = ({x, y, w = 520, h = 440, open = 0, ghost, color = '#c9ced9'}) => (
  <g>
    <rect x={x - 20} y={y - 20} width={w + 40} height={h + 20} fill="none" stroke="#59648c" strokeWidth={8} />
    <g opacity={ghost ? 0.55 : 1}>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={x} y={y + i * (h / 4) - open * h} width={w} height={h / 4 - 6} rx={4} fill={ghost ? 'none' : color} stroke={ghost ? '#9fb4ff' : '#9aa0ad'} strokeWidth={ghost ? 5 : 2} strokeDasharray={ghost ? '14 10' : undefined} />
      ))}
    </g>
    <line x1={x - 60} y1={y + h} x2={x + w + 60} y2={y + h} stroke="#8a90a0" strokeWidth={6} />
  </g>
);
const Stop: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-40 -96 L40 -96 L96 -40 L96 40 L40 96 L-40 96 L-96 40 L-96 -40 Z" fill="#d81e1e" stroke="#fff" strokeWidth={8} />
    <text y={20} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={56} fill="#fff">STOP</text>
  </g>
);
const Wrench: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(-35)`}>
    <rect x={-14} y={-10} width={28} height={150} rx={12} fill="#c9ced9" />
    <path d="M-48 -40 A50 50 0 1 0 48 -40 L22 -40 L22 -10 L-22 -10 L-22 -40 Z" fill="#c9ced9" />
  </g>
);

// ---------- cue times ----------
export const T = {
  stuck: q("Your car's stuck"),
  budge: q("The garage door won't budge"),
  how: q('How do you get it out'),
  locked: q("It probably isn't locked"),
  hooked: q("It's hooked to an opener"),
  noPower: q('no power', q("It's hooked")),
  unhook: q('So you unhook it'),
  lookUp: q('Look up at the'),
  red: q('A red cord hangs'),
  called: q("It's called the emergency"),
  makers: q('Opener makers say'),
  pullOnly: q('pull it only with'),
  fullyClosed: q('fully closed'),
  springsLift: q('The springs do the heavy'),
  but: q('But if one is weak'),
  weak: q('weak or broken'),
  drop: q('the door can drop fast'),
  first: q('So look at the springs first'),
  looksBroken: q("If one looks broken, don't pull"),
  callPro1: q('Call a garage door pro'),
  clear: q('Clear people and pets'),
  stuckOpen: q('If the door is stuck open'),
  keepOut: q('and keep everyone out'),
  closedTag: q("If it's closed"),
  pullDown: q('pull the cord down'),
  down: q('down', q('pull the cord down') + 0.1),
  liftNever: q('Lift by the door, never the cord'),
  hinges: q('hands off the hinges'),
  balanced: q('A balanced door lifts'),
  heavy: q('If it feels really heavy'),
  stay: q("won't stay up"),
  stopCall: q('stop and call a pro'),
  drive: q('Now you can drive out'),
  end: q('Door closed, springs okay'),
};

type Shot = React.FC<{t: number; t0: number; t1: number}>;
const DOOR_CENTER: V3 = [0, 1.6, DOOR_Z];
const CORD: V3 = [0, 2.6, DOOR_Z + 1.0];
const ez = (t: number, a: number, b: number, x: number, y: number) => interpolate(t, [a, b], [x, y], clamp);

// lifting: Lineman at the jamb, outside the door width, right hand on the handle
const LIFT_POS: V3 = [3.0, 0, -3.0];
const LIFT_ROT = (160 / 180) * Math.PI;
export const PULL_POS: V3 = [1.0, 0, -2.51];
const OPEN_HERO: V3 = [0.95, 0, -0.6];
const SHOTS: [number, Shot][] = [
  // frame 0 = the thumbnail (held 0.3 s)
  [0, ({t}) => (
    <>
      <ThumbScene frame={Math.round(t * 30)} />
      <ThumbText />
    </>
  )],
  // beat 1
  [0.3, ({t}) => {
    const f = Math.round(t * 30);
    return (
      <>
        <Garage f={f} dark cam={[ez(t, 0, 1.6, -1.3, -1.1), 2.9, ez(t, 0, 1.6, 4.6, 4.2)]} tgt={[0.95, 1.5, DOOR_Z + 0.8]} beam={[0, 2.4, DOOR_Z + 0.6]} cordHi={0.6} heroPos={OPEN_HERO} heroRot={-2.75} hero={{hold: 'phone', armRx: -1.5, phoneGlow: 1.4, lookX: -0.35, brows: 'worried'}} />
        <Txt lines={[["CAR'S STUCK."], ['LOOK UP.', UI.amber]]} top={250} size={140} />
      </>
    );
  }],
  [T.stuck, ({t, t0}) => {
    const f = Math.round(t * 30);
    return (
      <>
        <Garage f={f} cam={[-2.6, 1.9, 1.4]} tgt={[1.0, 1.5, -2.6]} beam={DOOR_CENTER} hero={{hold: 'phone', armRx: -1.0, armL: 0.6, phoneGlow: 1, lookY: 0.3, brows: 'worried'}} heroRot={-2.4} />
        <Chip text="CLICK…" x={120} y={600} size={72} o={kk(t, t0 + 0.3)} color={UI.dim} />
        <Txt lines={[["CAR'S STUCK."], ['LOOK UP.', UI.amber]]} top={250} size={140} o={1 - kk(t, t0 + 0.8)} />
      </>
    );
  }],
  [T.budge, ({t}) => <Garage f={Math.round(t * 30)} cam={[-1.8, 2.4, ez(t, T.budge, T.how, 1.0, 0.2)]} tgt={[0, 1.2, DOOR_Z]} beam={DOOR_CENTER} hero={null} />],
  [T.how, ({t, t0}) => (
    <>
      <Garage f={Math.round(t * 30)} cam={[2.4, 3.0, 3.6]} tgt={[0, 0.8, -1.6]} beam={DOOR_CENTER} />
      <div style={{position: 'absolute', top: 560, left: 360, fontFamily: FONT, fontWeight: 900, fontSize: 280, color: UI.amber, scale: String(pop(Math.round((t - t0) * 30), 30, 0)), textShadow: '0 0 40px #000'}}>?</div>
    </>
  )],
  [T.locked, ({t, t0}) => (
    <>
      <Garage f={Math.round(t * 30)} cam={[2.3, 1.7, ez(t, t0, t0 + 2, -1.4, -2.0)]} tgt={[1.9, 0.4, DOOR_Z]} beam={[1.9, 0.4, DOOR_Z]} hero={null} />
      <Card text="PROBABLY NOT LOCKED" top={260} size={70} o={kk(t, t0 + 0.3)} />
    </>
  )],
  [T.hooked, ({t, t0}) => (
    <>
      <Garage f={Math.round(t * 30)} cam={[1.8, 2.6, ez(t, t0, t0 + 2.2, -1.2, 0.2)]} tgt={[0, 3.4, DOOR_Z + 1.6]} beam={[0, 3.4, DOOR_Z + 1.2]} hi hero={null} />
      <Txt lines={[['HOOKED TO', UI.amber], ['THE OPENER', UI.amber]]} top={260} size={100} o={kk(t, t0)} />
      <Chip text="NO POWER · NO BATTERY BACKUP" x={60} y={520} size={40} o={kk(t, T.noPower)} />
    </>
  )],
  [T.unhook, ({t, t0}) => (
    <>
      <Garage f={Math.round(t * 30)} cam={[1.4, 2.4, ez(t, t0, t0 + 1.4, -1.2, -1.6)]} tgt={CORD} beam={CORD} cordHi={2} hero={null} />
      <Txt lines={[['UNHOOK IT', UI.amber]]} top={260} size={120} o={kk(t, t0)} />
    </>
  )],
  // beat 2
  [T.lookUp, ({t, t0}) => (
    <>
      <Garage f={Math.round(t * 30)} cam={[2.7, 1.3, 0.4]} tgt={[0.2, 3.5, DOOR_Z + 1.8]} beam={[0, 3.6, DOOR_Z + 2.4]} hero={{hold: 'phone', armRx: -2.4, phoneGlow: 1, lookX: -0.5}} heroPos={[1.7, 0, -1.6]} />
      <Chip text="MOST OPENERS: ON THE CEILING" x={60} y={260} size={52} o={kk(t, t0 + 0.4)} />
    </>
  )],
  [T.red, ({t, t0}) => {
    const r = ((t - t0) * 1.2) % 1;
    return (
      <>
        <Garage f={Math.round(t * 30)} cam={[0.9, 2.6, ez(t, t0, t0 + 2, 0.6, -1.2)]} tgt={CORD} beam={CORD} cordHi={1.2} hero={null} />
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <circle cx={540} cy={960} r={90 + r * 70} fill="none" stroke="#e03030" strokeWidth={8} opacity={1 - r} />
        </svg>
        <Chip text="RED CORD" x={60} y={260} size={64} color="#ff5a4e" o={kk(t, t0 + 0.3)} />
      </>
    );
  }],
  [T.called, ({t, t0}) => (
    <>
      <Garage f={Math.round(t * 30)} cam={[0.7, 2.5, -1.4]} tgt={CORD} beam={CORD} cordHi={1.2} hero={null} />
      <Card text="EMERGENCY RELEASE" top={260} size={72} color="#ff5a4e" o={kk(t, t0 + 0.2)} />
    </>
  )],
  [T.makers, ({t, t0}) => (
    <Dia>
      <FlatDoor x={70} y={700} w={420} h={360} />
      <FlatDoor x={590} y={700} w={420} h={360} open={0.55} />
      <circle cx={280} cy={1200} r={50} fill="#4ee08a" />
      <path d="M255 1200 L275 1220 L310 1182" stroke="#0b1020" strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d="M800 1150 L855 1245 L745 1245 Z" fill={UI.amber} />
      <text x={800} y={1235} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={60} fill="#0b1020">!</text>
      <text x={280} y={660} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={46} fill="#fff">CLOSED</text>
      <text x={800} y={660} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={46} fill="#fff">OPEN</text>
    </Dia>
  )],
  [T.pullOnly, ({t, t0}) => (
    <>
      <Dia>
        <FlatDoor x={280} y={800} w={520} h={440} />
        <circle cx={540} cy={1340} r={56} fill="#4ee08a" />
        <path d="M512 1340 L534 1362 L574 1318" stroke="#0b1020" strokeWidth={13} fill="none" strokeLinecap="round" />
      </Dia>
      <Card text="PULL ONLY WITH THE DOOR FULLY CLOSED" small="if possible" src="Chamberlain · Genie" top={260} size={62} o={kk(t, t0)} />
    </>
  )],
  [T.fullyClosed, ({t, t0}) => (
    <>
      <Garage f={Math.round(t * 30)} cam={[2.6, 2.2, ez(t, t0, t0 + 2, 0.2, -0.4)]} tgt={[0.2, 2.0, DOOR_Z]} beam={[0, 2.5, DOOR_Z + 1.0]} cordHi={0.8} hero={null} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <g opacity={kk(t, t0 + 0.2)}>
          <circle cx={760} cy={1180} r={64} fill="#4ee08a" />
          <path d="M728 1180 L752 1204 L798 1154" stroke="#0b1020" strokeWidth={14} fill="none" strokeLinecap="round" />
        </g>
      </svg>
      <Card text="PULL ONLY WITH THE DOOR FULLY CLOSED" small="if possible" src="Chamberlain · Genie" top={260} size={62} />
    </>
  )],
  [T.springsLift, ({t, t0}) => (
    <>
      <Garage f={Math.round(t * 30)} cam={[0.4, 3.0, ez(t, t0, t0 + 1.6, -1.4, -2.2)]} tgt={[0, 3.5, DOOR_Z + 0.25]} springGlow={1.2} hero={null} volt />
      <Txt lines={[['SPRINGS DO', UI.amber], ['THE LIFTING', UI.amber]]} top={260} size={100} o={kk(t, t0 + 0.2)} />
    </>
  )],
  // beat 3
  [T.but, ({t, t0}) => (
    <>
      <Garage f={Math.round(t * 30)} cam={[0.4, 3.0, -2.2]} tgt={[0, 3.5, DOOR_Z + 0.25]} springGlow={0.5} hero={null} />
      <AbsoluteFill style={{background: 'rgba(255,176,40,0.28)'}} />
      <Txt lines={[['BUT…', UI.amber]]} top={300} size={200} o={kk(t, t0)} />
    </>
  )],
  [T.weak, ({t, t0}) => (
    <>
      <Garage f={Math.round(t * 30)} cam={[1.4, 3.2, ez(t, t0, t0 + 1.2, -2.6, -3.0)]} tgt={[1.1, 3.55, DOOR_Z + 0.25]} crack hero={null} />
      <Txt lines={[['WEAK OR BROKEN', '#ff5a4e']]} top={260} size={96} o={kk(t, t0)} />
    </>
  )],
  [T.drop, ({t, t0}) => {
    const u = ((t - t0) * 0.9) % 1;
    return (
      <>
        <Dia>
          <FlatDoor x={280} y={760} w={520} h={460} open={0.5 * (1 - Math.min(1, u * 2.2))} ghost />
          {u < 0.45 && [0, 1, 2].map((i) => <line key={i} x1={330 + i * 210} y1={700} x2={330 + i * 210} y2={620} stroke="#9fb4ff" strokeWidth={6} strokeDasharray="10 8" />)}
        </Dia>
        <Txt lines={[['CAN DROP FAST', '#ff5a4e']]} top={260} size={100} o={kk(t, t0)} />
      </>
    );
  }],
  [T.first, ({t, t0}) => (
    <>
      <Garage f={Math.round(t * 30)} cam={[2.0, 2.4, 0.4]} tgt={[0, 3.3, DOOR_Z + 0.3]} beam={[ez(t, t0, t0 + 1.8, -1.6, 1.6), 3.55, DOOR_Z + 0.25]} hero={{hold: 'phone', armRx: -2.2, phoneGlow: 1, lookX: -0.4}} heroPos={[2.0, 0, -1.6]} />
      <Txt lines={[['CHECK THE', UI.amber], ['SPRINGS FIRST', UI.amber]]} top={260} size={96} o={kk(t, t0)} />
    </>
  )],
  [T.looksBroken, ({t, t0}) => (
    <>
      <Dia><Stop x={540} y={1050} s={1.6} /></Dia>
      <Card text="BROKEN SPRING, CABLE OR ROLLER? DON'T PULL." src="Chamberlain · Genie" top={260} size={60} o={kk(t, t0)} />
    </>
  )],
  [T.callPro1, ({t, t0}) => (
    <>
      <Dia><Wrench x={520} y={1000} s={2} /></Dia>
      <Txt lines={[['CALL A', UI.amber], ['GARAGE', UI.amber], ['DOOR PRO', UI.amber]]} top={260} size={100} o={kk(t, t0)} />
    </>
  )],
  [T.clear, ({t, t0}) => (
    <>
      <Dia>
        <FlatDoor x={280} y={760} w={520} h={460} />
        <rect x={260} y={1220} width={560} height={140} fill="#4ee08a" opacity={0.18} />
        {[['🧍', 380], ['🐾', 640]].map(([ic, x]) => (
          <g key={ic as string}>
            <text x={x as number} y={1330} textAnchor="middle" fontSize={100}>{ic}</text>
            <path d={`M${(x as number) - 60} 1220 L${(x as number) + 60} 1340 M${(x as number) + 60} 1220 L${(x as number) - 60} 1340`} stroke="#ff5a4e" strokeWidth={12} strokeLinecap="round" />
          </g>
        ))}
      </Dia>
      <Card text="DOORWAY CLEAR" src="Chamberlain" top={260} size={72} color="#4ee08a" o={kk(t, t0)} />
    </>
  )],
  // beat 4
  [T.stuckOpen, ({t, t0}) => (
    <>
      <Dia>
        <FlatDoor x={280} y={800} w={520} h={460} open={0.5} />
        <rect x={280} y={1030} width={520} height={230} fill={UI.amber} opacity={0.35} />
        <text x={540} y={1160} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={40} fill="#0b1020">STAY OUT</text>
      </Dia>
      <Card text="DOOR OPEN? USE CAUTION. STAY OUT FROM UNDER IT." src="16 CFR 1211 · Chamberlain" top={260} size={58} color={UI.amber} o={kk(t, t0)} />
    </>
  )],
  [T.keepOut, ({t, t0}) => (
    <>
      <Garage f={Math.round(t * 30)} cam={[1.2, 2.9, ez(t, t0, t0 + 2, 1.8, 1.2)]} tgt={[1.6, 1.0, DOOR_Z]} open={0.5} zone beam={[0.6, 0.3, DOOR_Z + 0.3]} hero={{armL: 0.1, brows: 'up', lookX: 0.2}} heroPos={[3.0, 0, -2.6]} heroRot={-2.3} />
      <Card text="DOOR OPEN? USE CAUTION. STAY OUT FROM UNDER IT." src="16 CFR 1211 · Chamberlain" top={260} size={58} color={UI.amber} />
    </>
  )],
  [T.closedTag, ({t, t0}) => {
    const pull = interpolate(t, [T.pullDown, T.pullDown + 0.6], [0, 0.5], clamp);
    const f = Math.round(t * 30);
    const grip: V3 = [0, 2.48 - pull * 0.5, DOOR_Z + 1.0];
    return (
      <>
        <Garage f={f} cam={[-1.5, 3.6, 0.6]} tgt={[0.6, 1.8, DOOR_Z + 1.1]} beam={DOOR_CENTER} pulled={pull} hero={{...reach(f, PULL_POS, Math.PI, grip), brows: 'up', lookX: -0.4}} heroPos={PULL_POS} heroRot={Math.PI} />
        <Chip text="DOOR CLOSED ✓" x={60} y={260} size={50} color="#4ee08a" o={kk(t, t0)} />
        {t >= T.pullDown && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            <path d="M200 520 L200 680 M160 640 L200 690 L240 640" stroke={UI.amber} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </>
    );
  }],
  [T.down, ({t, t0}) => (
    <>
      <Garage f={Math.round(t * 30)} cam={[1.2, 3.1, DOOR_Z + 2.4]} tgt={[0, 3.35, DOOR_Z + 0.8]} released pulled={1} hi hero={null} />
      <Chip text="UNHOOKED" x={60} y={260} size={70} color={UI.amber} o={kk(t, t0)} />
    </>
  )],
  [T.liftNever, ({t, t0}) => {
    const open = interpolate(t, [t0 + 0.4, t0 + 1.8], [0, 0.25], clamp);
    const f = Math.round(t * 30);
    return (
      <>
        <Garage f={f} cam={[1.0, 2.2, 0.2]} tgt={[2.2, 1.3, DOOR_Z]} released open={open} beam={[2.0, 1.2, DOOR_Z]} hero={{...reach(f, LIFT_POS, LIFT_ROT, handleAt(open)), armL: 0.3, brows: 'up'}} heroPos={LIFT_POS} heroRot={LIFT_ROT} />
        <Card text="LIFT BY THE DOOR, NOT THE CORD" top={260} size={66} o={kk(t, t0 + 0.2)} />
      </>
    );
  }],
  [T.hinges, ({t, t0}) => (
    <>
      <Dia>
        <rect x={140} y={700} width={800} height={200} rx={8} fill="#c9ced9" />
        <rect x={140} y={910} width={800} height={200} rx={8} fill="#c9ced9" />
        <rect x={500} y={870} width={80} height={80} rx={10} fill="#6b7080" />
        <text x={540} y={1260} textAnchor="middle" fontSize={140}>✋</text>
        <path d="M440 1160 L640 1320 M640 1160 L440 1320" stroke="#ff5a4e" strokeWidth={18} strokeLinecap="round" />
      </Dia>
      <Card text="HANDS OFF HINGES AND SECTIONS" src="Chamberlain" top={260} size={62} o={kk(t, t0)} />
    </>
  )],
  // beat 5
  [T.balanced, ({t, t0}) => {
    const open = interpolate(t, [t0, t0 + 1.8], [0.25, 1], clamp);
    const f = Math.round(t * 30);
    return (
      <>
        <Garage f={f} cam={[1.3, 2.1, -0.4]} tgt={[1.6, 1.6, DOOR_Z]} released open={open} beam={[0, 0.2, DOOR_Z - 2]} hero={open < 0.36 ? {...reach(f, LIFT_POS, LIFT_ROT, handleAt(open)), armL: 0.3, brows: 'up'} : {armRx: -0.2, brows: 'up', mouth: 'smile'}} heroPos={LIFT_POS} heroRot={LIFT_ROT} />
        <Card text="BALANCED DOOR LIFTS SMOOTHLY" top={260} size={66} color="#4ee08a" o={kk(t, t0 + 0.2)} />
      </>
    );
  }],
  [T.heavy, ({t, t0}) => (
    <>
      <Dia>
        <FlatDoor x={280} y={800} w={520} h={460} open={0.25} />
        <g transform="translate(540,1180)">
          <path d="M-110 120 L-80 -20 L80 -20 L110 120 Z" fill="#3a3d48" />
          <circle cy={-46} r={34} fill="none" stroke="#3a3d48" strokeWidth={16} />
          <text y={80} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={60} fill="#fff">HEAVY</text>
        </g>
      </Dia>
      <Txt lines={[['TOO HEAVY?', UI.amber]]} top={280} size={120} o={kk(t, t0)} />
    </>
  )],
  [T.stay, ({t, t0}) => (
    <>
      <Dia>
        <FlatDoor x={280} y={800} w={520} h={460} open={0.6 * (1 - interpolate(t, [t0, t0 + 1.5], [0, 1], clamp))} ghost />
      </Dia>
      <Txt lines={[["WON'T STAY UP?", UI.amber], ['DROPS?', '#ff5a4e']]} top={280} size={100} o={kk(t, t0)} />
    </>
  )],
  [T.stopCall, ({t, t0}) => (
    <>
      <Dia>
        <Stop x={380} y={1050} s={1.2} />
        <g opacity={kk(t, t0 + 0.4)}><Wrench x={720} y={1000} s={1.4} /></g>
      </Dia>
      <Card text="STOP. CALL A PRO." src="Chamberlain · Genie" top={260} size={80} color="#ff5a4e" o={kk(t, t0)} />
    </>
  )],
  [T.drive, ({t, t0}) => (
    <>
      <Garage f={Math.round(t * 30)} cam={[1.8, 2.6, 2.6]} tgt={[0, 0.8, DOOR_Z - 2]} released open={1} headlights hero={null} />
      <Txt lines={[['NOW YOU CAN', '#4ee08a'], ['DRIVE OUT', '#4ee08a']]} top={260} size={96} o={kk(t, t0)} />
    </>
  )],
  [T.end, ({t, t0}) => (
    <Dia>
      <EndCard t={t} t0={t0} />
    </Dia>
  )],
];

// four icons: door closed, spring with a check, cord pulled down, hands on the door
const EndCard: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const items = [
    {at: t0, label: 'DOOR CLOSED.'},
    {at: q('springs okay', t0), label: 'SPRINGS OK.'},
    {at: q('pull the cord', t0), label: 'PULL THE CORD.'},
    {at: q('lift by the door', q('pull the cord', t0)), label: 'LIFT BY THE DOOR.'},
  ];
  return (
    <g>
      {items.map((it, i) => {
        const o = kk(t, it.at);
        const y = 300 + i * 270;
        return (
          <g key={i} opacity={o}>
            <rect x={70} y={y} width={220} height={220} rx={28} fill="#1d2546" stroke="#59648c" strokeWidth={5} />
            <g transform={`translate(180,${y + 110})`}>
              {i === 0 && <g>{[0, 1, 2, 3].map((r) => <rect key={r} x={-70} y={-70 + r * 36} width={140} height={30} rx={4} fill="#c9ced9" />)}</g>}
              {i === 1 && <g>{Array.from({length: 6}).map((_, j) => <ellipse key={j} cx={-60 + j * 24} cy={-10} rx={12} ry={36} fill="none" stroke="#9aa0ad" strokeWidth={7} />)}<circle cx={50} cy={50} r={30} fill="#4ee08a" /><path d="M36 50 L47 61 L66 40" stroke="#0b1020" strokeWidth={8} fill="none" strokeLinecap="round" /></g>}
              {i === 2 && <g><line x1={0} y1={-80} x2={0} y2={30} stroke="#e03030" strokeWidth={8} /><rect x={-36} y={30} width={72} height={16} rx={6} fill="#e03030" /><path d="M-60 -10 L-60 50 M-80 30 L-60 56 L-40 30" stroke={UI.amber} strokeWidth={8} fill="none" strokeLinecap="round" /></g>}
              {i === 3 && <g>{[0, 1].map((r) => <rect key={r} x={-70} y={-40 + r * 40} width={140} height={34} rx={4} fill="#c9ced9" />)}<rect x={20} y={36} width={40} height={10} fill="#3a3d48" /><text x={40} y={-46} textAnchor="middle" fontSize={56}>✋</text></g>}
            </g>
            <text x={320} y={y + 128} fontFamily="Inter" fontWeight={900} fontSize={58} fill="#fff">{it.label}</text>
          </g>
        );
      })}
      <g opacity={kk(t, t0)}>
        <rect x={60} y={1340} width={760} height={50} rx={10} fill="rgba(5,7,15,0.9)" />
        <text x={80} y={1375} fontFamily="Inter" fontWeight={700} fontSize={28} fill="#cfd6ea">Source: Chamberlain · Genie: manual release guides</text>
      </g>
    </g>
  );
};

export const Short011: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  let i = 0;
  while (i + 1 < SHOTS.length && SHOTS[i + 1][0] <= t) i++;
  const [t0, S] = SHOTS[i];
  const t1 = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : timing.duration + 0.6;
  return (
    <AbsoluteFill style={{background: '#0b1020'}}>
      <S t={t} t0={t0} t1={t1} />
      {!(timing as any).estimated && <Audio src={staticFile('shorts2/s011.mp3')} />}
    </AbsoluteFill>
  );
};
