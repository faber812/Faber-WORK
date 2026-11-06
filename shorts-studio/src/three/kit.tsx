// Shared 3D kit for "The Grid Goes Down": characters, set pieces, camera, stage.
import React, {useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import {interpolate, random} from 'remotion';
import * as THREE from 'three';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const COL = {
  night: '#0b1020',
  ground: '#141c3a',
  building: '#1b2550',
  amber: '#ffb238',
  red: '#ff5a4e',
  green: '#4ee08a',
  jacket: '#2c5aa0',
  skin: '#c98d63',
  pants: '#20294a',
};
type V3 = [number, number, number];

// ---------- primitives ----------

export const Box: React.FC<{p?: V3; s: V3; c: string; e?: number; r?: V3; map?: THREE.Texture | null}> = ({
  p = [0, 0, 0],
  s,
  c,
  e = 0,
  r = [0, 0, 0],
  map,
}) => (
  <mesh position={p} rotation={r} castShadow receiveShadow>
    <boxGeometry args={s} />
    {map ? (
      <meshStandardMaterial color="#ffffff" map={map} emissive="#ffffff" emissiveMap={map} emissiveIntensity={e} roughness={0.5} />
    ) : (
      <meshStandardMaterial color={c} emissive={c} emissiveIntensity={e} roughness={0.6} />
    )}
  </mesh>
);

// Canvas texture with text, regenerated only when text/color changes.
export const useTextTexture = (text: string, opts: {w?: number; h?: number; color?: string; bg?: string; size?: number} = {}) => {
  const {w = 512, h = 256, color = '#ff5a4e', bg = '#05070f', size = 110} = opts;
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d')!;
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = color;
    g.font = `900 ${size}px Inter, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const lines = text.split('\n');
    lines.forEach((ln, i) => g.fillText(ln, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.05));
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, w, h, color, bg, size]);
};

// ---------- camera & stage ----------

export const Cam: React.FC<{pos: V3; target: V3; fov?: number}> = ({pos, target, fov}) => {
  const {camera} = useThree();
  camera.position.set(...pos);
  if (fov && (camera as THREE.PerspectiveCamera).fov !== fov) {
    (camera as THREE.PerspectiveCamera).fov = fov;
    camera.updateProjectionMatrix();
  }
  camera.lookAt(...target);
  return null;
};

export const Stage: React.FC<{power: number; fogNear?: number; fogFar?: number}> = ({power, fogNear = 12, fogFar = 40}) => (
  <>
    <color attach="background" args={[COL.night]} />
    <fog attach="fog" args={[COL.night, fogNear, fogFar]} />
    <hemisphereLight args={['#a9bcff', '#1a2244', 0.85 + 0.4 * power]} />
    <directionalLight position={[6, 12, 8]} intensity={0.6 + 0.6 * power} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color={COL.ground} />
    </mesh>
    <gridHelper args={[120, 120, '#2a3a7a', '#1d2752']} position={[0, 0.01, 0]} />
  </>
);

// ---------- city ----------

const windowTexture = (seed: number) => {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, 64, 128);
  for (let y = 4; y < 128; y += 12) {
    for (let x = 4; x < 64; x += 12) {
      if (random(`w${seed}-${x}-${y}`) > 0.35) {
        g.fillStyle = '#ffb238';
        g.fillRect(x, y, 7, 7);
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  return t;
};

// power 1 = lit, 0 = dark; buildings switch off at staggered moments.
// clearRadius keeps an open plaza around the origin.
export const City: React.FC<{power: number; count?: number; clearRadius?: number; spread?: number}> = ({
  power,
  count = 90,
  clearRadius = 6,
  spread = 26,
}) => {
  const texes = useMemo(() => new Array(8).fill(0).map((_, i) => windowTexture(i)), []);
  const buildings = useMemo(() => {
    const out: {x: number; z: number; h: number; w: number; t: number; off: number}[] = [];
    let i = 0;
    while (out.length < count && i < count * 6) {
      const x = (random(`cx${i}`) - 0.5) * spread * 2;
      const z = -random(`cz${i}`) * spread * 1.4 + 4;
      i++;
      if (Math.hypot(x, z) < clearRadius || z > 2) continue;
      out.push({x, z, h: 2 + random(`ch${i}`) * 9, w: 1.2 + random(`cw${i}`) * 1.6, t: i % 8, off: random(`co${i}`)});
    }
    return out;
  }, [count, clearRadius, spread]);
  return (
    <>
      {buildings.map((b, k) => {
        const p = interpolate(power, [b.off * 0.7, b.off * 0.7 + 0.3], [0, 1], clamp);
        return (
          <mesh key={k} position={[b.x, b.h / 2, b.z]} castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, b.w]} />
            <meshStandardMaterial color={COL.building} emissive="#ffffff" emissiveMap={texes[b.t]} emissiveIntensity={1.4 * p} roughness={0.8} />
          </mesh>
        );
      })}
    </>
  );
};

// ---------- characters ----------

export type Pose = {
  lookY?: number; // head turn
  lookX?: number; // head tilt (up negative)
  armL?: number; // z rotation
  armR?: number;
  armRx?: number; // x rotation (raise forward)
  mouth?: 'flat' | 'smile' | 'o' | 'frown';
  brows?: 'none' | 'worried' | 'up';
  hold?: 'phone' | 'flashlight' | 'card' | null;
  phoneGlow?: number;
};

export const Lineman: React.FC<{frame: number; pos?: V3; rotY?: number; pose?: Pose; scale?: number}> = ({
  frame,
  pos = [0, 0, 0],
  rotY = 0,
  pose = {},
  scale = 1,
}) => {
  const {lookY = 0, lookX = 0, armL = 0, armR = 0, armRx = 0, mouth = 'flat', brows = 'none', hold = null, phoneGlow = 1} = pose;
  const bob = Math.sin(frame / 8) * 0.03;
  const blink = frame % 75 > 71 ? 0.12 : 1;
  const sway = Math.sin(frame / 12) * 0.06;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={scale}>
      <group position={[0, bob, 0]}>
        {/* legs + boots */}
        <Box p={[-0.22, 0.45, 0]} s={[0.36, 0.9, 0.4]} c={COL.pants} />
        <Box p={[0.22, 0.45, 0]} s={[0.36, 0.9, 0.4]} c={COL.pants} />
        <Box p={[-0.22, 0.06, 0.08]} s={[0.4, 0.14, 0.56]} c="#3b2a1c" />
        <Box p={[0.22, 0.06, 0.08]} s={[0.4, 0.14, 0.56]} c="#3b2a1c" />
        {/* jacket + reflective stripes + tool belt */}
        <Box p={[0, 1.35, 0]} s={[1.0, 0.95, 0.55]} c={COL.jacket} />
        <Box p={[0, 1.22, 0.28]} s={[1.02, 0.08, 0.02]} c="#ffe2a0" e={0.6} />
        <Box p={[0, 1.44, 0.28]} s={[1.02, 0.08, 0.02]} c="#ffe2a0" e={0.6} />
        <Box p={[0, 0.92, 0]} s={[1.04, 0.12, 0.6]} c="#4a3524" />
        {/* left arm */}
        <group position={[-0.65, 1.72, 0]} rotation={[0, 0, armL + sway]}>
          <Box p={[0, -0.38, 0]} s={[0.3, 0.85, 0.36]} c={COL.jacket} />
          <Box p={[0, -0.88, 0]} s={[0.26, 0.2, 0.3]} c={COL.skin} />
        </group>
        {/* right arm (can hold props) */}
        <group position={[0.65, 1.72, 0]} rotation={[armRx, 0, -armR - sway]}>
          <Box p={[0, -0.38, 0]} s={[0.3, 0.85, 0.36]} c={COL.jacket} />
          <Box p={[0, -0.88, 0]} s={[0.26, 0.2, 0.3]} c={COL.skin} />
          {hold === 'phone' && (
            <group position={[0, -1.02, 0.12]} rotation={[-0.3, 0, 0]}>
              <Box s={[0.26, 0.44, 0.05]} c="#0d0f16" />
              <Box p={[0, 0, 0.03]} s={[0.22, 0.38, 0.01]} c="#7cc4ff" e={1.2 * phoneGlow} />
            </group>
          )}
          {hold === 'card' && <Box p={[0, -1.05, 0.12]} s={[0.36, 0.04, 0.24]} c="#4e7fff" e={0.2} />}
          {hold === 'flashlight' && (
            <group position={[0, -1.0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
              <Box s={[0.14, 0.42, 0.14]} c="#2b2b2b" />
              <Box p={[0, 0.24, 0]} s={[0.2, 0.08, 0.2]} c="#fff6d8" e={2} />
            </group>
          )}
        </group>
        {/* head */}
        <group position={[0, 2.25, 0]} rotation={[lookX, lookY, 0]}>
          <Box s={[0.85, 0.8, 0.8]} c={COL.skin} />
          <group scale={[1, blink, 1]}>
            <Box p={[-0.2, 0.05, 0.41]} s={[0.18, 0.22, 0.02]} c="#111" />
            <Box p={[0.2, 0.05, 0.41]} s={[0.18, 0.22, 0.02]} c="#111" />
            <Box p={[-0.16, 0.11, 0.425]} s={[0.06, 0.06, 0.01]} c="#fff" e={0.6} />
            <Box p={[0.24, 0.11, 0.425]} s={[0.06, 0.06, 0.01]} c="#fff" e={0.6} />
          </group>
          {brows === 'worried' && (
            <>
              <Box p={[-0.2, 0.25, 0.415]} s={[0.22, 0.05, 0.02]} r={[0, 0, 0.35]} c="#2a1a10" />
              <Box p={[0.2, 0.25, 0.415]} s={[0.22, 0.05, 0.02]} r={[0, 0, -0.35]} c="#2a1a10" />
            </>
          )}
          {brows === 'up' && (
            <>
              <Box p={[-0.2, 0.28, 0.415]} s={[0.22, 0.05, 0.02]} c="#2a1a10" />
              <Box p={[0.2, 0.28, 0.415]} s={[0.22, 0.05, 0.02]} c="#2a1a10" />
            </>
          )}
          {mouth === 'flat' && <Box p={[0, -0.22, 0.41]} s={[0.26, 0.05, 0.02]} c="#5a3a28" />}
          {mouth === 'smile' && (
            <>
              <Box p={[0, -0.24, 0.41]} s={[0.2, 0.05, 0.02]} c="#5a3a28" />
              <Box p={[-0.12, -0.2, 0.41]} s={[0.06, 0.06, 0.02]} c="#5a3a28" />
              <Box p={[0.12, -0.2, 0.41]} s={[0.06, 0.06, 0.02]} c="#5a3a28" />
            </>
          )}
          {mouth === 'frown' && (
            <>
              <Box p={[0, -0.2, 0.41]} s={[0.2, 0.05, 0.02]} c="#5a3a28" />
              <Box p={[-0.12, -0.24, 0.41]} s={[0.06, 0.06, 0.02]} c="#5a3a28" />
              <Box p={[0.12, -0.24, 0.41]} s={[0.06, 0.06, 0.02]} c="#5a3a28" />
            </>
          )}
          {mouth === 'o' && <Box p={[0, -0.22, 0.41]} s={[0.12, 0.14, 0.02]} c="#3a2418" />}
          {/* hard hat */}
          <Box p={[0, 0.5, 0]} s={[0.92, 0.28, 0.88]} c={COL.amber} e={0.12} />
          <Box p={[0, 0.38, 0.12]} s={[1.08, 0.06, 1.1]} c={COL.amber} e={0.12} />
          <Box p={[0, 0.66, 0]} s={[0.16, 0.06, 0.9]} c="#e89a1f" />
        </group>
      </group>
    </group>
  );
};

// Volt: glowing cube buddy. glow 1 = full power, 0 = dead. mood changes eyes.
export const Volt: React.FC<{frame: number; pos: V3; glow: number; mood?: 'happy' | 'worried' | 'shock'; light?: boolean}> = ({
  frame,
  pos,
  glow,
  mood = 'happy',
  light = true,
}) => {
  const y = pos[1] + Math.sin(frame / 10) * 0.12;
  const g = glow > 0.05 ? glow : 0.12 + 0.08 * Math.abs(Math.sin(frame * 1.7));
  const eye = (x: number) => {
    if (mood === 'happy')
      return (
        <group key={x} position={[x, 0.08, 0.41]}>
          <Box p={[-0.045, -0.02, 0]} r={[0, 0, 0.6]} s={[0.12, 0.04, 0.02]} c="#1a1208" />
          <Box p={[0.045, -0.02, 0]} r={[0, 0, -0.6]} s={[0.12, 0.04, 0.02]} c="#1a1208" />
        </group>
      );
    if (mood === 'shock') return <Box key={x} p={[x, 0.08, 0.41]} s={[0.12, 0.16, 0.02]} c="#1a1208" />;
    return (
      <group key={x} position={[x, 0.06, 0.41]}>
        <Box s={[0.1, 0.1, 0.02]} c="#1a1208" />
        <Box p={[0, 0.12, 0]} r={[0, 0, x < 0 ? 0.4 : -0.4]} s={[0.16, 0.035, 0.02]} c="#1a1208" />
      </group>
    );
  };
  return (
    <group position={[pos[0], y, pos[2]]} rotation={[0.1, -0.35 + Math.sin(frame / 25) * 0.15, Math.sin(frame / 18) * 0.05]}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color={COL.amber} emissive={COL.amber} emissiveIntensity={1.5 * g} roughness={0.4} />
      </mesh>
      {eye(-0.17)}
      {eye(0.17)}
      {mood === 'shock' && <Box p={[0, -0.16, 0.41]} s={[0.1, 0.1, 0.02]} c="#1a1208" />}
      {light && <pointLight color={COL.amber} intensity={5 * g} distance={6} />}
    </group>
  );
};

// ---------- set pieces ----------

export const House: React.FC<{pos: V3; lit: number; rotY?: number}> = ({pos, lit, rotY = 0}) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Box p={[0, 1.4, 0]} s={[3.2, 2.8, 2.6]} c="#2a3563" />
    <mesh position={[0, 3.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[2.6, 1.4, 4]} />
      <meshStandardMaterial color="#4a2f2a" />
    </mesh>
    <Box p={[-0.7, 1.6, 1.31]} s={[0.9, 0.9, 0.02]} c={COL.amber} e={1.6 * lit} />
    <Box p={[0.8, 1.0, 1.31]} s={[0.7, 1.6, 0.02]} c="#3b2a1c" />
    {lit > 0.05 && <pointLight position={[-0.7, 1.6, 2]} color={COL.amber} intensity={4 * lit} distance={5} />}
  </group>
);
