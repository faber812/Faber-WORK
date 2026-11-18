// Landscape (1920×1080) building blocks for Long 001: canvas, 3D props, on-screen UI.
import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Box, Cam, clamp, COL, Stage} from '../three/kit';

export const FONT = 'Inter, "Inter Display", system-ui, sans-serif';
export const UI = {ink: '#eef1f8', dim: '#8e9bc4', amber: '#ffb238', red: '#ff5a4e', green: '#4ee08a', blue: '#7cc4ff', panel: 'rgba(11,16,32,0.86)'};
type V3 = [number, number, number];

export const ease = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing: Easing.inOut(Easing.cubic)});
export const pop = (f: number, fps: number, delay = 0, damping = 12) => spring({frame: f - delay, fps, config: {damping}});

// ---------- canvas + worlds ----------
export const Canvas: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {width, height} = useVideoConfig();
  return (
    <div style={{position: 'absolute', inset: 0, filter: 'brightness(1.2) saturate(1.06)'}}>
      <ThreeCanvas width={width} height={height} shadows camera={{fov: 35, position: [0, 2.4, 10]}}>
        {children}
      </ThreeCanvas>
    </div>
  );
};

// portrait frames (Shorts) need a wider vertical field of view to keep the same subject in frame
export const useFov = (fov?: number) => {
  const {width, height} = useVideoConfig();
  return fov ?? (height > width ? 60 : 35);
};

// night exterior
export const Night: React.FC<{cam: V3; tgt: V3; power?: number; fov?: number; children?: React.ReactNode}> = ({cam, tgt, power = 0.35, fov, children}) => (
  <Canvas>
    <Cam pos={cam} target={tgt} fov={useFov(fov)} />
    <Stage power={power} fogNear={18} fogFar={70} />
    {/* moonlight: keeps the blackout readable on a phone screen */}
    <hemisphereLight args={['#9fb4ff', '#202a4a', 1.1]} />
    <directionalLight position={[-6, 10, 6]} intensity={0.7} color="#b8c8ff" />
    {children}
  </Canvas>
);

// bright daytime exterior (Shorts: the bright look holds viewers better)
export const DayOut: React.FC<{cam: V3; tgt: V3; power?: number; fov?: number; children?: React.ReactNode}> = ({cam, tgt, fov, children}) => (
  <Canvas>
    <Cam pos={cam} target={tgt} fov={useFov(fov)} />
    <color attach="background" args={['#bfdcf5']} />
    <fog attach="fog" args={['#bfdcf5', 22, 70]} />
    <hemisphereLight args={['#ffffff', '#9fb6a0', 1.6]} />
    <directionalLight position={[6, 12, 8]} intensity={1.7} color="#fff4de" castShadow shadow-mapSize={[1024, 1024]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[160, 160]} />
      <meshStandardMaterial color="#c9d3bd" />
    </mesh>
    {children}
  </Canvas>
);

// interior room (dark when lit=0, warm when lit=1)
export const Room: React.FC<{cam: V3; tgt: V3; lit?: number; fov?: number; children?: React.ReactNode}> = ({cam, tgt, lit = 0, fov: fov0, children}) => {
  const fov = useFov(fov0);
  const wall = lit > 0.5 ? '#e9dcc6' : '#2c3658';
  const floor = lit > 0.5 ? '#b98a5e' : '#1a2036';
  return (
    <Canvas>
      <Cam pos={cam} target={tgt} fov={fov} />
      <color attach="background" args={[wall]} />
      <hemisphereLight args={['#ffffff', lit > 0.5 ? '#c9b79a' : '#2a3460', 1.15 + lit * 0.4]} />
      <directionalLight position={[4, 8, 8]} intensity={0.5 + lit * 1.0} color={lit > 0.5 ? '#fff1d6' : '#9db8ff'} castShadow shadow-mapSize={[1024, 1024]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={floor} />
      </mesh>
      <Box p={[0, 4, -3]} s={[60, 8, 0.2]} c={wall} />
      {children}
    </Canvas>
  );
};

// underground cutaway: sky strip on top, soil cross-section below ground level y=0
export const Cutaway: React.FC<{cam: V3; tgt: V3; fov?: number; children?: React.ReactNode}> = ({cam, tgt, fov, children}) => (
  <Canvas>
    <Cam pos={cam} target={tgt} fov={useFov(fov)} />
    <color attach="background" args={['#0d1426']} />
    <hemisphereLight args={['#c9d6ff', '#3a2a1a', 1.25]} />
    <directionalLight position={[4, 8, 8]} intensity={1.1} />
    {/* soil block behind the cut plane, surface strip on top */}
    <Box p={[0, -3, -1.2]} s={[40, 6, 1.6]} c="#4a3524" />
    <Box p={[0, -5.2, -1.1]} s={[40, 1.6, 1.7]} c="#3a2a1c" />
    <Box p={[0, -0.06, -0.6]} s={[40, 0.12, 3]} c="#2b3350" />
    {children}
  </Canvas>
);

// ---------- 3D props ----------
export const RedX: React.FC<{p: V3; k?: number; size?: number}> = ({p, k = 1, size = 1}) => (
  <group position={p} scale={k}>
    <Box r={[0, 0, 0.785]} s={[size, size * 0.16, 0.06]} c="#e02626" e={0.6} />
    <Box r={[0, 0, -0.785]} s={[size, size * 0.16, 0.06]} c="#e02626" e={0.6} />
  </group>
);

export const Fridge: React.FC<{p: V3; open?: number; spoiled?: boolean; rotY?: number}> = ({p, open = 0, spoiled = false, rotY = 0}) => {
  const m = (a: string, b: string) => (spoiled ? b : a);
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <Box p={[0, 1.6, -0.55]} s={[1.6, 3.2, 0.1]} c="#8fa4bf" />
      <Box p={[-0.75, 1.6, 0]} s={[0.1, 3.2, 1.2]} c="#8fa4bf" />
      <Box p={[0.75, 1.6, 0]} s={[0.1, 3.2, 1.2]} c="#8fa4bf" />
      <Box p={[0, 3.15, 0]} s={[1.6, 0.1, 1.2]} c="#8fa4bf" />
      <Box p={[0, 0.05, 0]} s={[1.6, 0.1, 1.2]} c="#8fa4bf" />
      <Box p={[0, 1.6, -0.48]} s={[1.4, 3.0, 0.04]} c="#eef3fa" />
      {[0.9, 1.7, 2.5].map((y) => (
        <Box key={y} p={[0, y, 0.3]} s={[1.35, 0.04, 0.6]} c="#c9d6e6" />
      ))}
      <Box p={[-0.35, 1.95, 0.35]} s={[0.3, 0.45, 0.3]} c={m('#ffffff', '#a8a8a0')} />
      <Box p={[0.3, 1.82, 0.35]} s={[0.5, 0.2, 0.35]} c={m('#d9534f', '#7a5a5a')} />
      {[-0.4, -0.25, -0.1].map((x) => (
        <Box key={x} p={[x, 1.02, 0.35]} s={[0.12, 0.16, 0.12]} c={m('#f4e3c4', '#a99f92')} />
      ))}
      <Box p={[0.3, 1.02, 0.35]} s={[0.45, 0.2, 0.35]} c={m('#7d9a5a', '#6b6b5a')} />
      <Box p={[0, 2.7, 0.35]} s={[0.9, 0.25, 0.35]} c={m('#f1c40f', '#8f8a6a')} />
      <group position={[0.8, 0, 0.62]} rotation={[0, open * 1.9, 0]}>
        <Box p={[-0.8, 1.6, 0]} s={[1.6, 3.1, 0.1]} c="#a9bbd2" />
        <Box p={[-1.45, 2.2, 0.08]} s={[0.08, 0.7, 0.06]} c="#6f7f99" />
      </group>
    </group>
  );
};

export const Freezer: React.FC<{p: V3; lid?: number}> = ({p, lid = 0}) => (
  <group position={p}>
    <Box p={[0, 0.6, 0]} s={[2.4, 1.2, 1.2]} c="#8fa4bf" />
    <group position={[0, 1.2, -0.6]} rotation={[-lid * 0.9, 0, 0]}>
      <Box p={[0, 0.04, 0.6]} s={[2.4, 0.08, 1.2]} c="#a9bbd2" />
    </group>
    {[-0.6, 0, 0.6].map((x) => (
      <Box key={x} p={[x, 1.1, 0]} s={[0.45, 0.25, 0.45]} c="#cfe6ff" e={0.3} />
    ))}
  </group>
);

export const Counter: React.FC<{p: V3; w?: number}> = ({p, w = 2.6}) => (
  <group position={p}>
    <Box p={[0, 0.55, 0]} s={[w, 1.1, 1.0]} c="#5b4636" />
    <Box p={[0, 1.13, 0]} s={[w + 0.1, 0.06, 1.1]} c="#cfd5e6" />
  </group>
);

export const Faucet: React.FC<{p: V3; flow: number}> = ({p, flow}) => {
  const f = useCurrentFrame();
  return (
    <group position={p}>
      <Box p={[0, 0.05, 0.05]} s={[0.9, 0.08, 0.6]} c="#8c94a8" />
      <Box p={[0, 0.42, -0.3]} s={[0.1, 0.8, 0.1]} c="#6f778c" />
      <Box p={[0, 0.8, 0.0]} s={[0.1, 0.1, 0.7]} c="#6f778c" />
      {flow > 0.02 && (
        <>
          <mesh position={[0, 0.4, 0.3]}>
            <cylinderGeometry args={[0.1 * flow, 0.08 * flow, 0.8, 12]} />
            <meshStandardMaterial color="#2f8cff" emissive="#1565d8" emissiveIntensity={0.9} transparent opacity={0.9} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const v = (f * 0.07 + i / 5) % 1;
            return <Box key={`r${i}`} p={[0, 0.78 - v * 0.7, 0.3]} s={[0.17 * flow, 0.05, 0.17 * flow]} c="#bfe3ff" e={1.5} />;
          })}
          {[0, 1, 2, 3].map((i) => {
            const u = ((f * 0.09 + i / 4) % 1);
            return <Box key={i} p={[Math.sin(i * 2.3) * 0.22 * u, 0.12 + u * 0.12, 0.3 + Math.cos(i * 2.3) * 0.22 * u]} s={[0.05, 0.05, 0.05]} c="#cfeaff" e={2} />;
          })}
          <pointLight position={[0, 0.5, 0.7]} color="#7cc4ff" intensity={3 * flow} distance={2.5} />
        </>
      )}
    </group>
  );
};

export const WaterTower: React.FC<{p: V3; level: number; scale?: number}> = ({p, level, scale = 1}) => (
  <group position={p} scale={scale}>
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => (
      <Box key={i} p={[a * 0.9, 2.5, b * 0.9]} s={[0.2, 5, 0.2]} c="#a3aed4" />
    ))}
    <mesh position={[0, 6, 0]}>
      <cylinderGeometry args={[1.8, 1.8, 2.2, 24]} />
      <meshStandardMaterial color="#8d97b8" transparent opacity={0.5} />
    </mesh>
    <mesh position={[0, 4.9 + 1.1 * level, 0]}>
      <cylinderGeometry args={[1.7, 1.7, Math.max(0.02, 2.1 * level), 24]} />
      <meshStandardMaterial color="#3a8dde" emissive="#3a8dde" emissiveIntensity={0.6} />
    </mesh>
    <mesh position={[0, 7.4, 0]}>
      <coneGeometry args={[1.95, 0.7, 24]} />
      <meshStandardMaterial color="#6a76a0" />
    </mesh>
  </group>
);

export const CellTower: React.FC<{p: V3; frame: number; alive?: boolean; h?: number; shelter?: boolean}> = ({p, frame, alive = true, h = 7, shelter = false}) => {
  const blink = alive && Math.floor((frame + p[0] * 5) / 12) % 2 === 0 ? 3 : alive ? 0.5 : 0;
  return (
    <group position={p}>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
        <Box key={i} p={[x * 0.35, h / 2, z * 0.35]} r={[z * 0.05, 0, -x * 0.05]} s={[0.12, h, 0.12]} c="#a3aed4" />
      ))}
      {[h * 0.3, h * 0.55, h * 0.8].map((y) => (
        <Box key={y} p={[0, y, 0]} s={[0.7 - y * 0.05, 0.08, 0.7 - y * 0.05]} c="#a3aed4" />
      ))}
      {[-0.28, 0.28].map((x) => (
        <Box key={x} p={[x, h * 0.88, 0.22]} s={[0.18, 0.7, 0.06]} c="#e6e8ee" />
      ))}
      <Box p={[0, h + 0.2, 0]} s={[0.32, 0.32, 0.32]} c={alive ? COL.red : '#3a2224'} e={blink} />
      {blink > 1 && <pointLight position={[0, h + 0.4, 0]} color={COL.red} intensity={4} distance={5} />}
      {shelter && (
        <group position={[1.6, 0, 0.3]}>
          <Box p={[0, 0.7, 0]} s={[1.6, 1.4, 1.2]} c="#59648c" />
          <Box p={[0, 1.45, 0]} s={[1.7, 0.1, 1.3]} c="#3d4770" />
          <Box p={[0.3, 0.55, 0.61]} s={[0.45, 1.0, 0.02]} c="#2b3350" />
        </group>
      )}
    </group>
  );
};

export const Car: React.FC<{p: V3; r?: number; c: string; lights?: number}> = ({p, r = 0, c, lights = 2}) => (
  <group position={p} rotation={[0, r, 0]}>
    <Box p={[0, 0.35, 0]} s={[1.0, 0.45, 2.0]} c={c} />
    <Box p={[0, 0.75, -0.1]} s={[0.85, 0.4, 1.1]} c={c} />
    <Box p={[0, 0.75, 0.46]} s={[0.8, 0.32, 0.02]} c="#9fc4ff" e={0.1} />
    {[-0.5, 0.5].map((x) => [-0.65, 0.65].map((z) => <Box key={`${x}${z}`} p={[x, 0.15, z]} s={[0.12, 0.3, 0.3]} c="#111" />))}
    <Box p={[-0.3, 0.38, 1.01]} s={[0.2, 0.1, 0.02]} c="#fff6d8" e={lights} />
    <Box p={[0.3, 0.38, 1.01]} s={[0.2, 0.1, 0.02]} c="#fff6d8" e={lights} />
  </group>
);

export const GasPump: React.FC<{p: V3}> = ({p}) => (
  <group position={p}>
    <Box p={[0, 1.2, 0]} s={[1.1, 2.4, 0.7]} c="#d9dce6" />
    <Box p={[0, 2.5, 0]} s={[1.2, 0.2, 0.8]} c={COL.red} />
    <Box p={[0, 1.8, 0.36]} s={[0.8, 0.4, 0.02]} c="#10141f" />
    <Box p={[0.62, 1.2, 0.1]} s={[0.15, 0.5, 0.2]} c="#222" />
  </group>
);

export const Canopy: React.FC<{p: V3}> = ({p}) => (
  <group position={p}>
    <Box p={[0, 4.2, 0]} s={[7, 0.3, 3.4]} c="#2f3c70" />
    <Box p={[0, 4.2, 1.71]} s={[7, 0.3, 0.02]} c="#7a2a2a" />
    <Box p={[-3.2, 2.1, 0]} s={[0.25, 4.2, 0.25]} c="#2f3c70" />
    <Box p={[3.2, 2.1, 0]} s={[0.25, 4.2, 0.25]} c="#2f3c70" />
  </group>
);

export const Garage: React.FC<{p: V3; open?: boolean}> = ({p, open = true}) => (
  <group position={p}>
    <Box p={[0, 1.2, 0]} s={[3.0, 2.4, 3.0]} c="#2a3563" />
    <Box p={[0, 2.5, 0]} s={[3.2, 0.2, 3.2]} c="#3d4770" />
    <Box p={[0, 1.05, 1.51]} s={[2.3, 2.0, 0.02]} c={open ? '#0a0e1a' : '#59648c'} />
  </group>
);

// ---------- 2D UI ----------
export const Chip: React.FC<{text: string; color?: string; top: number; left?: number; right?: number; size?: number; delay?: number; center?: boolean; bg?: string}> = ({text, color = UI.ink, top, left, right, size = 54, delay = 0, center = false, bg = UI.panel}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(f, fps, delay);
  size = Math.max(size, 66); // readable on a phone
  return (
    <div style={{position: 'absolute', top, left: center ? 0 : left, right: center ? 0 : right, textAlign: center ? 'center' : undefined, scale: String(s), transformOrigin: center ? 'center' : left !== undefined ? 'left center' : 'right center'}}>
      <span style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color, background: bg, padding: `${size * 0.14}px ${size * 0.5}px`, borderRadius: size * 0.32, whiteSpace: 'pre', display: 'inline-block', lineHeight: 1.15}}>{text}</span>
    </div>
  );
};

export const Bar: React.FC<{label: string; value: string; fill: number; color: string; top: number; left: number; width?: number}> = ({label, value, fill, color, top, left, width = 620}) => (
  <div style={{position: 'absolute', top, left, width, fontFamily: FONT, fontWeight: 900, color: UI.ink, background: UI.panel, borderRadius: 22, padding: '18px 24px'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 34}}>
      <span>{label}</span>
      <span style={{color}}>{value}</span>
    </div>
    <div style={{height: 22, marginTop: 10, borderRadius: 11, background: '#2f3c70', overflow: 'hidden'}}>
      <div style={{height: '100%', width: `${Math.max(0, Math.min(1, fill)) * 100}%`, background: color}} />
    </div>
  </div>
);

export const Card: React.FC<{title: string; lines: string[]; accent?: string; delay?: number; top?: number; width?: number; left?: number}> = ({title, lines, accent = UI.amber, delay = 0, top = 300, width = 900, left}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(f, fps, delay, 14);
  return (
    <div style={{position: 'absolute', top, left: left ?? (1920 - width) / 2, width, scale: String(0.9 + 0.1 * s), opacity: Math.min(1, s * 1.4), fontFamily: FONT, background: UI.panel, border: `4px solid ${accent}`, borderRadius: 28, padding: '30px 40px', boxSizing: 'border-box'}}>
      <div style={{fontWeight: 900, fontSize: 30, letterSpacing: 5, color: accent}}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{fontWeight: 900, fontSize: i === 0 ? 64 : 40, color: i === 0 ? UI.ink : UI.dim, marginTop: i === 0 ? 10 : 8, lineHeight: 1.1}}>{l}</div>
      ))}
    </div>
  );
};
