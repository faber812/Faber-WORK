// Scene library for Long 001, part 2 (Hour 24 onward).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Box, City, clamp, House, Lineman, Pose, Volt} from '../three/kit';
import {Bar, Card, Chip, Counter, Cutaway, ease, Faucet, FONT, Night, pop, RedX, Room, UI, WaterTower} from './props';
import type {Shot} from './scenes';

type V3 = [number, number, number];
const Hero: React.FC<{f: number; pos?: V3; rotY?: number; pose?: Pose; volt?: 'happy' | 'worried' | 'shock'; glow?: number; voltPos?: V3}> = ({f, pos = [0, 0, 0], rotY = 0, pose = {}, volt = 'worried', glow = 0, voltPos}) => (
  <>
    <Lineman frame={f} pos={pos} rotY={rotY} pose={pose} />
    <Volt frame={f} pos={voltPos ?? [pos[0] + 1.5, 3.0, pos[2] - 0.3]} glow={glow} mood={volt} />
  </>
);

// water drops moving along a polyline (for pipes); returns small glowing boxes
const Flow: React.FC<{pts: V3[]; f: number; speed?: number; n?: number; color?: string; on?: number}> = ({pts, f, speed = 0.02, n = 14, color = '#7cc4ff', on = 1}) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2]));
  const L = seg.reduce((a, b) => a + b, 0);
  const at = (u: number): V3 => {
    let d = u * L;
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i]) {
        const k = d / seg[i];
        return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k, pts[i][2] + (pts[i + 1][2] - pts[i][2]) * k];
      }
      d -= seg[i];
    }
    return pts[pts.length - 1];
  };
  if (on <= 0) return null;
  return (
    <>
      {new Array(n).fill(0).map((_, i) => (
        <Box key={i} p={at((i / n + f * speed) % 1)} s={[0.22 * on, 0.22 * on, 0.22 * on]} c={color} e={2} />
      ))}
    </>
  );
};
const Pipe: React.FC<{a: V3; b: V3; r?: number; c?: string}> = ({a, b, r = 0.22, c = '#8b94b0'}) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return <Box p={mid} r={[0, 0, ang]} s={[len + r, r * 2, r * 2]} c={c} />;
};

// side cutaway: house tap on the left, pipe under the street, up a hill to the tower on the right
export const PipeCut = (stage: 'pipe' | 'hill' | 'tower' | 'gravity' | 'pressure' | 'pumps' | 'drain'): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const level = stage === 'drain' ? interpolate(f, [0, d], [0.7, 0.15], clamp) : stage === 'pumps' ? 0.75 : 0.9;
  const cams: Record<string, [V3, V3]> = {
    pipe: [[ease(f, 0, d, -9, -6), 1, 14], [ease(f, 0, d, -9, -4), -0.8, 0]],
    hill: [[ease(f, 0, d, -2, 3), 2.4, 17], [ease(f, 0, d, -1, 5), 1.2, 0]],
    tower: [[ease(f, 0, d, 6, 7), ease(f, 0, d, 4, 6), 15], [8, 5, 0]],
    gravity: [[2, 3.5, 25], [2, 3.2, 0]],
    pressure: [[ease(f, 0, d, -8, -9), 1.5, 11], [-9, 0.6, 0]],
    pumps: [[ease(f, 0, d, 10, 9), 2, 12], [10, 1.5, 0]],
    drain: [[ease(f, 0, d, 4, 2), 3.6, 24], [2, 3.2, 0]],
  };
  const [cam, tgt] = cams[stage];
  // ground profile: flat street at y=0 from x=-14..0, hill rising to y=2.5 at x=8
  const route: V3[] = [[8, 6.2, 0.6], [8, 1.6, 0.6], [4, 0.2, 0.6], [0, -1.2, 0.6], [-10, -1.2, 0.6], [-10, 1.4, 0.6]];
  const flowOn = stage === 'pumps' ? 0 : stage === 'drain' ? level * 1.4 : 1;
  const xp = pop(f, fps, 10);
  return (
    <AbsoluteFill>
      <Cutaway cam={cam} tgt={tgt}>
        {/* hill */}
        <mesh position={[8, -1.6, -1.2]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[7, 7, 1.6]} />
          <meshStandardMaterial color="#4f6a3a" />
        </mesh>
        <Box p={[12, 0.9, -1.2]} s={[8, 3, 1.6]} c="#4a3524" />
        <WaterTower p={[8, 2.5, -0.4]} level={level} scale={0.8} />
        <House pos={[-10.5, 0, -1.6]} lit={0} />
        {route.slice(1).map((p, i) => (
          <Pipe key={i} a={route[i]} b={p} />
        ))}
        <Flow pts={route} f={f} on={flowOn} speed={stage === 'drain' ? 0.008 : 0.016} />
        {stage === 'gravity' &&
          [0, 1, 2].map((k) => {
            const y = 6.4 - ((f * 0.06 + k * 0.33) % 1) * 4;
            return <Box key={k} p={[9.6, y, 0.8]} s={[0.25, 0.7, 0.1]} c={UI.amber} e={2} />;
          })}
        {stage === 'pumps' && (
          <group position={[10.5, 2.5, 0.4]}>
            <Box p={[0, 0.6, 0]} s={[1.6, 1.2, 1.2]} c="#59648c" />
            <Box p={[0, 1.3, 0]} s={[1.8, 0.15, 1.4]} c="#3a4268" />
            <RedX p={[0, 0.7, 0.8]} k={xp} size={1.4} />
          </group>
        )}
      </Cutaway>
      {stage === 'pipe' && <Chip text="THE PIPE UNDER YOUR STREET" color={UI.blue} top={230} left={150} size={60} delay={6} />}
      {stage === 'hill' && <Chip text="…UP A HILL" color={UI.blue} top={230} left={150} size={70} delay={6} />}
      {stage === 'tower' && <Chip text="A WATER TOWER" color={UI.blue} top={230} left={150} size={84} delay={6} />}
      {stage === 'gravity' && <Chip text="NO MOTOR. JUST GRAVITY." color={UI.amber} top={230} center size={84} delay={4} />}
      {stage === 'pressure' && <Chip text="= YOUR WATER PRESSURE" color={UI.blue} top={230} left={150} size={66} delay={6} />}
      {stage === 'pumps' && <Chip text="PUMPS: NO POWER" color={UI.red} top={230} left={150} size={76} delay={6} />}
      {stage === 'drain' && <Bar label="BUILT TO HOLD ABOUT" value="~1 DAY" fill={level} color={level < 0.35 ? UI.red : UI.blue} top={230} left={150} />}
    </AbsoluteFill>
  );
};

// weight of water: a big tank with a heavy weight icon
export const Heavy: Shot = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, 3, 1.5), ease(f, 0, d, 6, 7), 13]} tgt={[0, 5.4, 0]} power={0.45}>
        <City power={0} count={60} spread={30} clearRadius={9} />
        <WaterTower p={[0, 0, 0]} level={0.9} />
        <pointLight position={[0, 7, 3]} color="#7cc4ff" intensity={14} distance={9} />
      </Night>
      <div style={{position: 'absolute', top: 240, right: 190, textAlign: 'center', fontFamily: FONT, fontWeight: 900, scale: String(pop(f, fps, 6))}}>
        <div style={{fontSize: 160, lineHeight: 1}}>🏋️</div>
        <div style={{fontSize: 64, color: UI.amber, marginTop: 10}}>HEAVY</div>
      </div>
    </AbsoluteFill>
  );
};

// high-rise: water reaches the low floors, upper floors need a pump
export const HighRise = (stage: 0 | 1): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const floors = 12;
  const reach = stage === 0 ? 12 : interpolate(f, [0, d * 0.5], [12, 5], clamp);
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, 9, 7), ease(f, 0, d, 5, 7), 18]} tgt={[0, 5.5, 0]} power={0.45}>
        <City power={0} count={60} spread={34} clearRadius={10} />
        <Box p={[0, 6, 0]} s={[4, 12, 4]} c="#323c62" />
        {new Array(floors).fill(0).map((_, i) => (
          <Box key={i} p={[0, 0.6 + i * 0.95, 2.02]} s={[3.2, 0.5, 0.02]} c={i < reach ? '#3a8dde' : '#141a2e'} e={i < reach ? 1 : 0} />
        ))}
        <Box p={[2.8, 1.5, 1]} s={[1.2, 1.2, 1.2]} c="#59648c" />
        {stage === 1 && <RedX p={[2.8, 1.6, 1.8]} k={pop(f, fps, 6)} size={1.1} />}
      </Night>
      <Chip text={stage === 0 ? 'UPPER FLOORS NEED A PUMP' : 'UP HIGH: DRY IN HOUR 1'} color={stage === 0 ? UI.amber : UI.red} top={240} left={150} size={62} delay={6} />
    </AbsoluteFill>
  );
};

// tap: strong flow, sputtering, or dry
export const TapFlow = (mode: 'strong' | 'sputter' | 'listen'): Shot => ({d}) => {
  const f = useCurrentFrame();
  const flow = mode === 'strong' ? 1 : mode === 'listen' ? interpolate(f, [0, d], [0.7, 0.25], clamp) : Math.max(0, Math.sin(f / 3)) * 0.6;
  return (
    <AbsoluteFill>
      <Room cam={[ease(f, 0, d, 1.8, 0.9), 2.4, ease(f, 0, d, 5.4, 4.4)]} tgt={[0, 1.5, 0]} lit={0}>
        <Counter p={[0, 0, 0]} w={4.2} />
        <Faucet p={[0, 1.16, 0]} flow={flow} />
        <pointLight position={[0.6, 2.2, 1.4]} color="#7cc4ff" intensity={6} distance={5} />
        <Hero f={f} pos={[2.9, 0, -1.0]} rotY={-0.7} pose={mode === 'listen' ? {lookY: -0.4, lookX: -0.4, brows: 'worried', armL: 0.4} : {lookY: -0.4, brows: 'up', mouth: 'smile'}} volt={mode === 'strong' ? 'happy' : 'worried'} voltPos={[4.2, 3, -1.4]} />
      </Room>
      {mode === 'strong' && <Chip text="WHY IS IT STILL RUNNING?" color={UI.blue} top={240} left={150} size={64} delay={6} />}
      {mode === 'listen' && <Chip text="PRESSURE: DROPPING" color={UI.red} top={240} left={150} size={70} delay={6} />}
    </AbsoluteFill>
  );
};

// buried pipe with cracks: clean water flows out while pressure holds; when it drops, dirt seeps in
export const Cracks = (low: boolean): Shot => ({d}) => {
  const f = useCurrentFrame();
  const seep = low ? interpolate(f, [6, d * 0.8], [0, 1], clamp) : 0;
  return (
    <AbsoluteFill>
      <Cutaway cam={[ease(f, 0, d, -1, 1), -1.2, 7]} tgt={[0, -1.4, 0]}>
        <Box p={[0, -1.4, 0.6]} s={[12, 0.9, 0.9]} c="#8b94b0" />
        <Flow pts={[[-6, -1.4, 1.1], [6, -1.4, 1.1]]} f={f} n={16} speed={low ? 0.006 : 0.02} color={low ? '#8a7a4a' : '#7cc4ff'} />
        {[-2.5, 0.5, 3].map((x, i) => (
          <group key={i}>
            <Box p={[x, -0.94, 1.06]} r={[0, 0, 0.5]} s={[0.5, 0.06, 0.02]} c="#111" />
            {low &&
              [0, 1, 2].map((k) => {
                const u = ((f * 0.03 + k / 3 + i * 0.2) % 1) * seep;
                return <Box key={k} p={[x + (k - 1) * 0.2, -0.2 - u * 0.7, 1.1]} s={[0.16, 0.16, 0.16]} c="#6b4f2a" e={0.3} />;
              })}
            {!low && <Box p={[x, -0.75 + ((f * 0.05 + i * 0.3) % 1) * 0.5, 1.1]} s={[0.14, 0.14, 0.14]} c="#7cc4ff" e={2} />}
          </group>
        ))}
      </Cutaway>
      <Chip text={low ? 'LOW PRESSURE: DIRT GETS IN' : 'PRESSURE KEEPS DIRT OUT'} color={low ? UI.red : UI.green} top={240} left={150} size={64} delay={6} />
    </AbsoluteFill>
  );
};

// boil-water notice + pot with a one-minute timer
export const BoilNotice = (stage: 0 | 1): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const secs = interpolate(f, [4, d - 4], [0, 60], clamp);
  return (
    <AbsoluteFill>
      <Room cam={[ease(f, 0, d, 1.2, 0.4), 2.6, ease(f, 0, d, 5.6, 4.8)]} tgt={[-0.6, 1.4, 0]} lit={0}>
        <Counter p={[-0.6, 0, 0]} w={3.2} />
        <group position={[-0.6, 1.16, 0.1]}>
          <Box p={[0, 0.06, 0]} s={[0.9, 0.12, 0.9]} c="#2b2d33" />
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.42, 0.38, 0.62, 20]} />
            <meshStandardMaterial color="#b8c0d4" metalness={0.4} roughness={0.4} />
          </mesh>
          {stage === 1 &&
            new Array(6).fill(0).map((_, i) => {
              const u = (f * 0.04 + i / 6) % 1;
              return <Box key={i} p={[Math.sin(i * 2.1) * 0.2, 0.8 + u * 1.2, Math.cos(i * 2.1) * 0.2]} s={[0.14, 0.14, 0.14]} c="#e8f0ff" e={0.6} />;
            })}
          <pointLight position={[0, 0.1, 0.5]} color="#4e7fff" intensity={4} distance={3} />
        </group>
        <Hero f={f} pos={[1.8, 0, -0.4]} rotY={-0.6} pose={{lookY: -0.3, brows: 'up'}} volt="happy" glow={0.3} voltPos={[3.1, 3, -0.8]} />
      </Room>
      {stage === 0 ? (
        <div style={{position: 'absolute', top: 230, left: 150, width: 640, background: '#fff6d6', borderRadius: 18, border: '10px solid #d81e1e', padding: '22px 30px', fontFamily: FONT, scale: String(pop(f, fps, 4))}}>
          <div style={{fontWeight: 900, fontSize: 54, color: '#d81e1e', lineHeight: 1}}>⚠ BOIL WATER NOTICE</div>
          <div style={{fontWeight: 700, fontSize: 30, color: '#3a2a10', marginTop: 12}}>Do not drink tap water without boiling it first.</div>
        </div>
      ) : (
        <div style={{position: 'absolute', top: 230, left: 150, fontFamily: FONT, background: UI.panel, borderRadius: 26, padding: '16px 36px'}}>
          <div style={{fontWeight: 900, fontSize: 30, letterSpacing: 4, color: UI.dim}}>ROLLING BOIL · CDC</div>
          <div style={{fontWeight: 900, fontSize: 130, color: secs >= 60 ? UI.green : UI.ink, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>
            0:{String(Math.floor(secs)).padStart(2, '0')}
          </div>
          <div style={{fontWeight: 900, fontSize: 34, color: UI.amber}}>ONE FULL MINUTE</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// fill everything: pots, bottles, bathtub filling up
export const FillAll = (stage: 0 | 1 | 2): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lvl = interpolate(f, [0, d], stage === 2 ? [0.5, 0.9] : [0.1, 0.6], clamp);
  return (
    <AbsoluteFill>
      <Room cam={[ease(f, 0, d, 2.4, 1.4), 3.2, ease(f, 0, d, 8, 7)]} tgt={[0, 1, 0]} lit={0}>
        {/* bathtub */}
        <group position={[-1.6, 0, -0.6]}>
          <Box p={[0, 0.45, 0]} s={[3, 0.9, 1.4]} c="#dfe5f2" />
          <Box p={[0, 0.2 + 0.6 * lvl, 0]} s={[2.7, 0.04, 1.15]} c="#3a8dde" e={0.7} />
          <Box p={[-1.3, 1.2, 0]} s={[0.1, 0.6, 0.1]} c="#c9ccd6" />
          <mesh position={[-1.18, 0.9, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
            <meshStandardMaterial color="#7cc4ff" emissive="#3a8dde" emissiveIntensity={1.2} />
          </mesh>
        </group>
        {/* pots and bottles */}
        {[0, 1, 2].map((i) => (
          <group key={i} position={[0.9 + i * 0.75, 0, 0.8]} scale={pop(f, fps, 4 + i * 5)}>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.3, 0.28, 0.6, 16]} />
              <meshStandardMaterial color="#b8c0d4" metalness={0.4} />
            </mesh>
          </group>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <group key={i} position={[0.9 + i * 0.5, 0, 1.7]} scale={pop(f, fps, 12 + i * 4)}>
            <Box p={[0, 0.4, 0]} s={[0.26, 0.8, 0.26]} c="#7cc4ff" e={0.4} />
            <Box p={[0, 0.88, 0]} s={[0.12, 0.14, 0.12]} c="#2f80ed" />
          </group>
        ))}
        <pointLight position={[0, 3, 2]} color="#cfe6ff" intensity={6} distance={8} />
      </Room>
      {stage === 0 && <Chip text="FILL EVERYTHING" color={UI.blue} top={240} left={150} size={92} delay={4} />}
      {stage === 1 && <Chip text="POTS · BOTTLES · BATHTUB" color={UI.blue} top={240} left={150} size={66} delay={4} />}
      {stage === 2 && <Card title="READY.GOV" lines={['1 gallon of water', 'per person, per day']} accent={UI.blue} top={230} width={760} left={150} />}
    </AbsoluteFill>
  );
};

// tease for hour 48: the garage with a generator and a faint grey haze
export const Tease48: Shot = ({d}) => {
  const f = useCurrentFrame();
  const haze = interpolate(f, [0, d], [0.1, 0.5], clamp);
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, 4, 2.6), 2.6, ease(f, 0, d, 9, 7.6)]} tgt={[-1.4, 1.2, 0]} power={0.4}>
        <City power={0} count={60} spread={30} clearRadius={10} />
        <House pos={[-5, 0, -2]} lit={0} />
        <group position={[-1.4, 0, 0]}>
          <Box p={[0, 0.5, 0]} s={[1.3, 1.0, 0.9]} c="#d9a21b" />
          <Box p={[0, 1.05, 0]} s={[1.4, 0.1, 1.0]} c="#2b2d33" />
          <pointLight position={[0, 1.6, 0.8]} color="#ffb238" intensity={5 + 2 * Math.sin(f / 3)} distance={5} />
        </group>
      </Night>
      <AbsoluteFill style={{background: `radial-gradient(circle at 40% 60%, rgba(200,205,220,${haze}) 0%, rgba(200,205,220,0) 60%)`}} />
      <Chip text="HOUR 48: NOT HUNGER" color={UI.red} top={240} left={150} size={72} delay={8} />
    </AbsoluteFill>
  );
};
