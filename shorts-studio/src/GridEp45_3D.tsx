// Episodes 4 (Hour 24: water) and 5 (Hour 48: carbon monoxide) — series 3D look.
import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, Audio, Easing, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, Captions, FONT, gridEp1Schema, Label, TopBar} from './GridEp1';
import {Box, Cam, City, clamp, COL, House, Lineman, Stage, Volt} from './three/kit';

const Scene3D: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {width, height} = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows camera={{fov: 52, position: [0, 3, 10]}}>
      {children}
    </ThreeCanvas>
  );
};
const ease = (frame: number, a: number, b: number, from: number, to: number) =>
  interpolate(frame, [a, b], [from, to], {...clamp, easing: Easing.inOut(Easing.cubic)});

const Big: React.FC<{text: string; color: string; top: number; delay?: number; size?: number}> = ({text, color, top, delay = 0, size = 96}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 12}});
  return (
    <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', scale: String(s), fontFamily: FONT, fontWeight: 900, fontSize: size, color, textShadow: `0 0 50px ${color}88, 0 8px 30px rgba(0,0,0,0.7)`}}>
      {text}
    </div>
  );
};

// ---------- props ----------

const WaterTower: React.FC<{p: [number, number, number]; level: number}> = ({p, level}) => (
  <group position={p}>
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => (
      <Box key={i} p={[a * 0.9, 2.5, b * 0.9]} s={[0.2, 5, 0.2]} c="#a3aed4" />
    ))}
    <mesh position={[0, 6, 0]}>
      <cylinderGeometry args={[1.8, 1.8, 2.2, 24]} />
      <meshStandardMaterial color="#8d97b8" transparent opacity={0.5} />
    </mesh>
    <mesh position={[0, 4.9 + 1.1 * level, 0]}>
      <cylinderGeometry args={[1.7, 1.7, Math.max(0.02, 2.1 * level), 24]} />
      <meshStandardMaterial color="#3a8dde" emissive="#3a8dde" emissiveIntensity={0.5} />
    </mesh>
    <mesh position={[0, 7.4, 0]}>
      <coneGeometry args={[1.95, 0.7, 24]} />
      <meshStandardMaterial color="#6a76a0" />
    </mesh>
  </group>
);

const RedX: React.FC<{p: [number, number, number]; k: number}> = ({p, k}) => (
  <group position={p} scale={k}>
    <Box r={[0, 0, 0.785]} s={[1.0, 0.16, 0.06]} c={COL.red} e={1.2} />
    <Box r={[0, 0, -0.785]} s={[1.0, 0.16, 0.06]} c={COL.red} e={1.2} />
  </group>
);

const Generator: React.FC<{p: [number, number, number]; running: boolean; frame: number}> = ({p, running, frame}) => {
  const shake = running ? Math.sin(frame * 2.1) * 0.02 : 0;
  return (
    <group position={[p[0] + shake, p[1], p[2]]}>
      <Box p={[0, 0.45, 0]} s={[1.2, 0.7, 0.8]} c="#d9a21b" />
      <Box p={[0, 0.85, 0]} s={[1.3, 0.08, 0.9]} c="#2b2d33" />
      <Box p={[-0.62, 0.45, 0]} s={[0.06, 0.9, 0.9]} c="#2b2d33" />
      <Box p={[0.62, 0.45, 0]} s={[0.06, 0.9, 0.9]} c="#2b2d33" />
      <Box p={[0.45, 0.55, 0.42]} s={[0.25, 0.12, 0.12]} c="#555" />
    </group>
  );
};

// exhaust / CO cloud made of translucent spheres drifting from a source
const Cloud: React.FC<{from: [number, number, number]; dir: [number, number, number]; frame: number; color: string; opacity: number; n?: number; spread?: number}> = ({from, dir, frame, color, opacity, n = 14, spread = 1}) => (
  <>
    {new Array(n).fill(0).map((_, i) => {
      const t = ((frame * 0.012 + i / n) % 1);
      const jx = (random(`cx${i}`) - 0.5) * spread;
      const jz = (random(`cz${i}`) - 0.5) * spread;
      return (
        <mesh key={i} position={[from[0] + dir[0] * t + jx * t, from[1] + dir[1] * t, from[2] + dir[2] * t + jz * t]}>
          <sphereGeometry args={[0.25 + t * 0.6, 12, 12]} />
          <meshStandardMaterial color={color} transparent opacity={opacity * (1 - t) * 0.7} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      );
    })}
  </>
);

const Jug: React.FC<{p: [number, number, number]; s: number}> = ({p, s}) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.35, 0]}>
      <boxGeometry args={[0.45, 0.7, 0.45]} />
      <meshStandardMaterial color="#9fd0ff" transparent opacity={0.75} emissive="#3a8dde" emissiveIntensity={0.25} />
    </mesh>
    <Box p={[0, 0.78, 0]} s={[0.18, 0.12, 0.18]} c="#2f80ed" />
    <Box p={[0.12, 0.62, 0]} s={[0.08, 0.2, 0.3]} c="#cfe6ff" />
  </group>
);

// ======================= EPISODE 4 · HOUR 24 · WATER =======================

const E4S1: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const flow = interpolate(frame, [0, dur], [1, 0.25], clamp);
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 1.6, 1.0), 3.0, ease(frame, 0, dur, 8.4, 7.4)]} target={[-0.1, 1.7, 0]} />
        <Stage power={0.35} />
        <City power={0} count={50} />
        {/* kitchen counter + faucet */}
        <Box p={[-0.8, 0.55, 0]} s={[2.6, 1.1, 1.0]} c="#5b4636" />
        <Box p={[-0.8, 1.13, 0]} s={[2.7, 0.06, 1.1]} c="#cfd5e6" />
        <Box p={[-0.8, 1.08, 0.05]} s={[0.9, 0.08, 0.6]} c="#8c94a8" />
        <Box p={[-0.8, 1.55, -0.3]} s={[0.1, 0.8, 0.1]} c="#c9ccd6" />
        <Box p={[-0.8, 1.92, -0.12]} s={[0.1, 0.1, 0.45]} c="#c9ccd6" />
        <mesh position={[-0.8, 1.45, 0.08]}>
          <cylinderGeometry args={[0.035 * flow, 0.035 * flow, 0.85, 8]} />
          <meshStandardMaterial color="#7cc4ff" emissive="#3a8dde" emissiveIntensity={0.6} transparent opacity={0.85} />
        </mesh>
        <Lineman frame={frame} pos={[1.0, 0, 0.2]} rotY={-0.6} pose={{lookY: -0.5, lookX: 0.25, mouth: 'flat', brows: 'up', armL: 0.2}} />
        <Volt frame={frame} pos={[1.9, 3.1, -0.4]} glow={0} mood="worried" />
      </Scene3D>
      <Big text="💧 24:00" color="#7cc4ff" top={420} size={110} />
    </AbsoluteFill>
  );
};

const E4S2: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const level = interpolate(frame, [0, dur], [0.6, 0.3], clamp);
  const x = spring({frame: frame - Math.round(dur * 0.35), fps, config: {damping: 12}});
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 2.4, 1.6), ease(frame, 0, dur, 3.6, 4.4), ease(frame, 0, dur, 14, 13)]} target={[0.4, 3.2, -2]} />
        <Stage power={0.35} />
        <City power={0} count={60} clearRadius={8} />
        <WaterTower p={[-1.6, 0, -3]} level={level} />
        <group position={[2.6, 0, -1.2]}>
          <Box p={[0, 0.7, 0]} s={[1.8, 1.4, 1.4]} c="#2f3c70" />
          <Box p={[-1.6, 0.25, 0]} s={[1.6, 0.25, 0.25]} c="#5a668f" />
          <RedX p={[0, 1.0, 0.75]} k={x} />
        </group>
        <Lineman frame={frame} pos={[0.6, 0, 1.2]} rotY={-0.4} pose={{lookX: -0.3, lookY: -0.6, mouth: 'frown', brows: 'worried'}} />
      </Scene3D>
      <Label text="PUMPS: NO POWER" color={C.red} delay={Math.round(dur * 0.4)} top={1250} />
    </AbsoluteFill>
  );
};

const E4S3: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  // underground cutaway: pipe with pressure gauge dropping, specks entering through a crack
  const p = interpolate(frame, [0, dur * 0.6], [1, 0.15], clamp);
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 2.5, 1.5), 1.6, ease(frame, 0, dur, 7, 6)]} target={[0, 0.2, 0]} />
        <color attach="background" args={['#120d0a']} />
        <hemisphereLight args={['#a9bcff', '#3a2a1a', 1.0]} />
        <directionalLight position={[4, 6, 6]} intensity={1} />
        {/* soil block */}
        <Box p={[0, -1.2, -0.8]} s={[12, 3.2, 1.2]} c="#4a3524" />
        <Box p={[0, 0.45, -0.8]} s={[12, 0.15, 1.2]} c="#6a8f5a" />
        {/* pipe */}
        <mesh position={[0, -0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 12, 24]} />
          <meshStandardMaterial color="#8d97b8" transparent opacity={0.55} />
        </mesh>
        {/* water flow dashes */}
        {new Array(10).fill(0).map((_, i) => {
          const x = (((frame * 0.08 * p + i * 1.2) % 12) + 12) % 12 - 6;
          return <Box key={i} p={[x, -0.6, 0]} s={[0.5, 0.18, 0.18]} c="#3a8dde" e={0.6} />;
        })}
        {/* crack + contaminants drifting in as pressure falls */}
        <Box p={[0.6, -0.15, 0.3]} r={[0, 0, 0.6]} s={[0.4, 0.05, 0.1]} c="#1a120c" />
        {new Array(12).fill(0).map((_, i) => {
          const t = ((frame * 0.015 + i / 12) % 1) * (1 - p);
          return (
            <mesh key={i} position={[0.6 + (random(`k${i}`) - 0.5) * 0.6, 0.4 - t * 1.0, 0.3]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color="#7a8a3a" emissive="#5a6a1a" emissiveIntensity={0.6} transparent opacity={(1 - p) * 0.9} />
            </mesh>
          );
        })}
      </Scene3D>
      <div style={{position: 'absolute', top: 400, left: 90, right: 90, fontFamily: FONT, fontWeight: 900, color: C.ink, background: 'rgba(11,16,32,0.8)', borderRadius: 26, padding: '22px 30px', border: '3px solid #2f3c70'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 36}}>
          <span>WATER PRESSURE</span>
          <span style={{color: p < 0.4 ? C.red : '#7cc4ff'}}>{p < 0.4 ? 'LOW' : 'NORMAL'}</span>
        </div>
        <div style={{height: 24, marginTop: 12, borderRadius: 12, background: '#2f3c70', overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${p * 100}%`, background: p < 0.4 ? C.red : '#3a8dde'}} />
        </div>
      </div>
      <Big text="⚠ BOIL-WATER NOTICE" color={C.red} top={1180} delay={Math.round(dur * 0.4)} size={70} />
    </AbsoluteFill>
  );
};

const E4S4: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const jugs: [number, number][] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) jugs.push([c, r]);
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 1.0, 0.4), 3.8, ease(frame, 0, dur, 9.5, 8.8)]} target={[0.3, 1.2, 0]} />
        <Stage power={0.4} />
        <City power={0} count={40} />
        <Box p={[0, 0.35, 0.2]} s={[3.6, 0.7, 2.2]} c="#5b4636" />
        {jugs.map(([c, r], i) => {
          const s = spring({frame: frame - 4 - i * 3, fps: 30, config: {damping: 12}});
          return <Jug key={i} p={[-1.2 + c * 0.8, 0.7, -0.4 + r * 0.6]} s={s} />;
        })}
        <Lineman frame={frame} pos={[2.4, 0, -0.3]} rotY={-0.7} pose={{mouth: 'smile', brows: 'up', armR: 1.4}} />
        <Volt frame={frame} pos={[-1.8, 2.8, -0.8]} glow={0.4} mood="happy" />
      </Scene3D>
      <Big text="1 GALLON" color="#7cc4ff" top={400} size={120} />
      <Big text="per person · per day" color={C.ink} top={540} size={52} delay={8} />
      <div style={{position: 'absolute', top: 640, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 30, letterSpacing: 4, color: C.amber}}>SOURCE: READY.GOV</div>
    </AbsoluteFill>
  );
};

const E4S5: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 2, 1.2), 2.6, ease(frame, 0, dur, 6, 5)]} target={[0, 1.6, 0]} />
        <Stage power={0.3} />
        <City power={0} count={60} />
        {/* empty fridge, door open */}
        <group position={[-1.3, 0, -0.6]}>
          <Box p={[0, 1.6, 0]} s={[1.5, 3.2, 1.2]} c="#dfe5f2" />
          <Box p={[0, 1.6, 0.55]} s={[1.3, 3.0, 0.1]} c="#151b30" />
          <Box p={[0.95, 1.6, 0.9]} r={[0, -1.2, 0]} s={[1.5, 3.1, 0.1]} c="#e9edf6" />
        </group>
        <Lineman frame={frame} pos={[0.9, 0, 0.3]} rotY={-0.5} pose={{lookY: -0.6, mouth: 'o', brows: 'worried'}} />
        <Volt frame={frame} pos={[1.8, 3.1, -0.4]} glow={0} mood="shock" />
      </Scene3D>
      <Big text="PART 5 →" color={C.red} top={1180} delay={20} size={110} />
    </AbsoluteFill>
  );
};

// ======================= EPISODE 5 · HOUR 48 · CARBON MONOXIDE =======================

const E5S1: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const temp = interpolate(frame, [0, dur], [28, 41], clamp);
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 1.4, 0.8), 3.6, ease(frame, 0, dur, 8.6, 7.8)]} target={[0.4, 1.3, 0]} />
        <Stage power={0.35} />
        <City power={0} count={50} />
        <group position={[-0.6, 0, 0]}>
          <Box p={[0, 0.6, 0]} s={[2.4, 1.2, 1.2]} c="#e6ebf5" />
          <group position={[0, 1.2, -0.6]} rotation={[-0.8, 0, 0]}>
            <Box p={[0, 0.04, 0.6]} s={[2.4, 0.08, 1.2]} c="#f4f7fc" />
          </group>
          {/* melting ice → water puddle grows */}
          {[-0.6, 0, 0.6].map((x, i) => (
            <Box key={x} p={[x, 1.1 - (temp - 28) * 0.012, 0]} s={[0.4, Math.max(0.05, 0.25 - (temp - 28) * 0.015), 0.4]} c="#cfe6ff" e={0.2} />
          ))}
          <mesh position={[0.4, 0.01, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.2 + (temp - 28) * 0.05, 24]} />
            <meshStandardMaterial color="#3a8dde" transparent opacity={0.6} />
          </mesh>
        </group>
        <Lineman frame={frame} pos={[1.7, 0, -0.4]} rotY={-0.5} pose={{lookY: -0.5, lookX: 0.3, mouth: 'frown', brows: 'worried'}} />
      </Scene3D>
      <Big text={`🌡 ${Math.round(temp)}°F`} color={temp >= 40 ? C.red : '#7cc4ff'} top={420} size={110} />
    </AbsoluteFill>
  );
};

const E5S2: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pops = [0.15, 0.35, 0.55].map((t) => spring({frame: frame - Math.round(dur * t), fps, config: {damping: 11}}));
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 0.6, 0), 3.6, ease(frame, 0, dur, 11, 10)]} target={[0, 1.0, 0]} />
        <Stage power={0.4} />
        <City power={0} count={50} />
        {/* grill */}
        <group position={[-1.9, 0, 0]} scale={pops[0]}>
          <mesh position={[0, 1.0, 0]}>
            <sphereGeometry args={[0.55, 20, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshStandardMaterial color="#1f2229" side={2} />
          </mesh>
          <Box p={[0, 1.02, 0]} s={[1.0, 0.04, 1.0]} c="#555" />
          {[-0.3, 0.3].map((x) => (
            <Box key={x} p={[x, 0.45, 0]} s={[0.06, 0.9, 0.06]} c="#2b2d33" />
          ))}
          <Box p={[0, 1.1, 0]} s={[0.6, 0.06, 0.6]} c="#ff6a2b" e={1.5} />
        </group>
        {/* camp stove */}
        <group position={[0, 0, 0.3]} scale={pops[1]}>
          <Box p={[0, 0.25, 0]} s={[0.9, 0.5, 0.6]} c="#3c8f5a" />
          <mesh position={[0, 0.55, 0]}>
            <coneGeometry args={[0.15, 0.3, 12]} />
            <meshStandardMaterial color="#4e7fff" emissive="#4e7fff" emissiveIntensity={2} />
          </mesh>
        </group>
        <group scale={pops[2]} position={[1.9, 0, 0]}>
          <Generator p={[0, 0, 0]} running frame={frame} />
        </group>
        <Lineman frame={frame} pos={[0.2, 0, -1.8]} rotY={0} pose={{mouth: 'flat', brows: 'up'}} />
      </Scene3D>
      <Big text="GRILLS · STOVES · GENERATORS" color={C.amber} top={420} size={58} />
    </AbsoluteFill>
  );
};

const E5S3: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [0, dur], [0.2, 1], clamp);
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 3.4, 2.6), 4.2, ease(frame, 0, dur, 13, 12)]} target={[0.6, 1.4, 0]} />
        <Stage power={0.3} />
        <City power={0} count={40} clearRadius={9} />
        <House pos={[-1.2, 0, -1]} lit={0} />
        {/* attached garage, door open, generator running INSIDE */}
        <group position={[1.6, 0, -0.8]}>
          <Box p={[0, 1.1, 0]} s={[2.2, 2.2, 2.4]} c="#2a3563" />
          <Box p={[0, 1.0, 1.21]} s={[1.8, 1.9, 0.02]} c="#0d111c" />
          <Generator p={[0, 0, 0.4]} running frame={frame} />
        </group>
        <Cloud from={[1.6, 1, 0.6]} dir={[-3.5, 1.6, -1]} frame={frame} color="#ff5a4e" opacity={fill} n={18} spread={1.5} />
        <Lineman frame={frame} pos={[3.2, 0, 2.4]} rotY={-0.6} pose={{mouth: 'o', brows: 'worried', armR: 2.4}} />
      </Scene3D>
      <Big text="NEVER INDOORS" color={C.red} top={420} delay={Math.round(dur * 0.25)} size={100} />
      <Label text="NOT IN THE GARAGE" color={C.red} delay={Math.round(dur * 0.5)} top={1250} />
    </AbsoluteFill>
  );
};

const E5S4: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const alarm = Math.floor(frame / 8) % 2 === 0;
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 0.8, 0.2), 2.9, ease(frame, 0, dur, 7.4, 6.8)]} target={[-0.2, 2.1, 0]} />
        <Stage power={0.25} />
        <City power={0} count={40} />
        {/* near-invisible CO */}
        <Cloud from={[-2, 0.8, -1]} dir={[4, 2, 1]} frame={frame} color="#ffffff" opacity={0.08} n={20} spread={2} />
        {/* CO alarm on a wall */}
        <Box p={[-1.6, 3.2, -1.4]} s={[2.2, 2.4, 0.1]} c="#2a3563" />
        <Box p={[-1.6, 3.4, -1.3]} s={[0.6, 0.6, 0.12]} c="#e9ecf5" />
        <Box p={[-1.6, 3.4, -1.22]} s={[0.14, 0.14, 0.04]} c={COL.red} e={alarm ? 4 : 0.3} />
        {alarm && <pointLight position={[-1.6, 3.4, -0.9]} color={COL.red} intensity={4} distance={4} />}
        <Lineman frame={frame} pos={[0.9, 0, 0]} rotY={-0.4} pose={{lookY: -0.6, lookX: -0.2, mouth: 'o', brows: 'up'}} />
        <Volt frame={frame} pos={[1.8, 3.1, -0.4]} glow={0} mood="shock" />
      </Scene3D>
      <Big text="NO SMELL" color={C.ink} top={400} size={100} />
      <Big text="NO COLOR" color={C.ink} top={510} size={100} delay={Math.round(dur * 0.45)} />
    </AbsoluteFill>
  );
};

const E5S5: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const tape = interpolate(frame, [6, 30], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 1.2, 0.6), 9, ease(frame, 0, dur, 14, 13)]} target={[0.6, 0.6, -1]} />
        <Stage power={0.4} />
        <City power={0} count={30} clearRadius={11} />
        <House pos={[-3.6, 0, -1.5]} lit={0} />
        <Generator p={[4.2, 0, -0.6]} running frame={frame} />
        <Cloud from={[4.6, 0.9, -0.6]} dir={[2.5, 1.5, -2]} frame={frame} color="#9aa1ad" opacity={0.6} n={10} />
        {/* measuring tape from the wall to the generator */}
        <Box p={[-1.9 + 2.9 * tape, 0.06, 0.4]} s={[5.8 * tape, 0.05, 0.25]} c={COL.amber} e={0.6} />
        {new Array(7).fill(0).map((_, i) => (
          <Box key={i} p={[-1.9 + i * 0.95, 0.1, 0.4]} s={[0.04, 0.06, 0.3]} c="#1a1208" />
        ))}
        <Lineman frame={frame} pos={[1.2, 0, 1.6]} rotY={0} pose={{mouth: 'smile', brows: 'up', armR: 1.3}} />
      </Scene3D>
      <Big text="20 FT+" color={C.amber} top={420} size={140} delay={10} />
      <Label text="KEEP IT OUTSIDE" color={C.amber} delay={18} top={1250} />
    </AbsoluteFill>
  );
};

const E5S6: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 3, 2), 3, ease(frame, 0, dur, 9, 8)]} target={[0, 2, -1]} />
        <Stage power={0.3} />
        <City power={0} count={70} />
        {/* snow */}
        {new Array(60).fill(0).map((_, i) => {
          const y = 8 - (((frame * 0.05 + random(`sy${i}`) * 8) % 8));
          return <Box key={i} p={[(random(`sx${i}`) - 0.5) * 14, y, (random(`sz${i}`) - 0.5) * 8]} s={[0.08, 0.08, 0.08]} c="#ffffff" e={0.6} />;
        })}
        <Lineman frame={frame} pos={[0, 0, 0.6]} rotY={0.2} pose={{armL: -0.5, armR: -0.5, mouth: 'frown', brows: 'worried', lookX: -0.2}} />
        <Volt frame={frame} pos={[-1.3, 2.9, 0.2]} glow={0} mood="worried" />
      </Scene3D>
      <Big text="❄ PART 6 →" color="#cfe6ff" top={1180} delay={20} size={110} />
    </AbsoluteFill>
  );
};

// ---------- episode shell ----------

const makeEpisode = (scenes: React.FC<{dur: number}>[], ep: number, fromMin: number, finalLabel: string, keys: Set<string>) => {
  const Ep: React.FC<gridEp1Schema> = ({segments, captions, audio}) => {
    const {fps, durationInFrames} = useVideoConfig();
    const f = (sec: number) => Math.round(sec * fps);
    const starts = segments.map((s) => f(s.start));
    const bounds = segments.map((_, i) => [i === 0 ? 0 : starts[i], i + 1 < segments.length ? starts[i + 1] : durationInFrames]);
    const outro = bounds[bounds.length - 1][0];
    return (
      <AbsoluteFill style={{background: COL.night}}>
        {bounds.map(([from, to], i) => {
          const S = scenes[i];
          return (
            <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}>
              <S dur={to - from} />
            </Sequence>
          );
        })}
        <AbsoluteFill style={{background: 'linear-gradient(rgba(11,16,32,0.85) 0%, rgba(11,16,32,0) 18%, rgba(11,16,32,0) 70%, rgba(11,16,32,0.9) 100%)'}} />
        <Sequence from={0} durationInFrames={outro}>
          <TopBar totalFrames={outro} finalHour={false} ep={ep} fromMin={fromMin} toMin={fromMin + 59} />
        </Sequence>
        <Sequence from={outro}>
          <TopBar totalFrames={1} finalHour ep={ep} finalLabel={finalLabel} />
        </Sequence>
        <Captions segments={captions} keys={keys} />
        <Audio src={staticFile(audio)} />
      </AbsoluteFill>
    );
  };
  return Ep;
};

export const GridEp4_3D = makeEpisode([E4S1, E4S2, E4S3, E4S4, E4S5], 4, 24 * 60, 'HOUR 48', new Set(['twenty-four.', 'tap...', 'draining,', 'power.', 'drop.', 'boil-water', 'contamination', 'gallon', 'day.', 'forty-eight...', "isn't", 'hunger.', 'five.']));
export const GridEp5_3D = makeEpisode([E5S1, E5S2, E5S3, E5S4, E5S5, E5S6], 5, 48 * 60, 'HOUR 72', new Set(['forty-eight.', 'freezer', 'grills.', 'generators.', 'deadly.', 'never', 'inside', 'garage,', 'window.', 'carbon', 'monoxide', 'smell...', 'color.', 'twenty', 'feet', 'seventy-two...', 'cold', 'six.']));
