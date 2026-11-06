import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';

// 3D test for "The Grid Goes Down": a blocky lineman, his cube buddy "Volt",
// and a voxel city that goes dark.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

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

const City: React.FC<{power: number}> = ({power}) => {
  const buildings = useMemo(() => {
    const out: {x: number; z: number; h: number; w: number; tex: THREE.Texture; off: number}[] = [];
    for (let i = 0; i < 70; i++) {
      // keep a clear plaza around the hero and the camera path: city sits behind and to the sides
      const side = i % 3; // 0 = back, 1 = left, 2 = right
      const x = side === 0 ? -16 + random(`x${i}`) * 32 : (side === 1 ? -1 : 1) * (6 + random(`x${i}`) * 10);
      const z = side === 0 ? -6 - random(`z${i}`) * 16 : -14 + random(`z${i}`) * 14;
      out.push({
        x,
        z,
        h: 2 + random(`h${i}`) * 7,
        w: 1 + random(`bw${i}`) * 1.4,
        tex: windowTexture(i % 8),
        off: random(`o${i}`),
      });
    }
    return out;
  }, []);
  return (
    <>
      {buildings.map((b, i) => {
        // each building loses power at a slightly different moment
        const p = interpolate(power, [b.off * 0.6, b.off * 0.6 + 0.4], [0, 1], clamp);
        return (
          <mesh key={i} position={[b.x, b.h / 2, b.z]} castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, b.w]} />
            <meshStandardMaterial color="#1b2550" emissive="#ffffff" emissiveMap={b.tex} emissiveIntensity={1.4 * p} roughness={0.8} />
          </mesh>
        );
      })}
    </>
  );
};

const Box: React.FC<{p: [number, number, number]; s: [number, number, number]; c: string; e?: number}> = ({p, s, c, e = 0}) => (
  <mesh position={p} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} emissive={c} emissiveIntensity={e} roughness={0.6} />
  </mesh>
);

const Lineman: React.FC<{frame: number; look: number}> = ({frame, look}) => {
  const bob = Math.sin(frame / 8) * 0.03;
  const blink = frame % 70 > 66 ? 0.15 : 1;
  return (
    <group position={[0, bob, 0]}>
      {/* legs */}
      <Box p={[-0.22, 0.45, 0]} s={[0.36, 0.9, 0.4]} c="#20294a" />
      <Box p={[0.22, 0.45, 0]} s={[0.36, 0.9, 0.4]} c="#20294a" />
      <Box p={[-0.22, 0.05, 0.08]} s={[0.4, 0.14, 0.56]} c="#3b2a1c" />
      <Box p={[0.22, 0.05, 0.08]} s={[0.4, 0.14, 0.56]} c="#3b2a1c" />
      {/* jacket */}
      <Box p={[0, 1.35, 0]} s={[1.0, 0.95, 0.55]} c="#2c5aa0" />
      <Box p={[0, 1.2, 0.28]} s={[1.02, 0.08, 0.02]} c="#ffd27a" e={0.5} />
      <Box p={[0, 1.42, 0.28]} s={[1.02, 0.08, 0.02]} c="#ffd27a" e={0.5} />
      {/* arms */}
      <group position={[-0.65, 1.7, 0]} rotation={[0, 0, Math.sin(frame / 12) * 0.08]}>
        <Box p={[0, -0.38, 0]} s={[0.3, 0.85, 0.36]} c="#2c5aa0" />
        <Box p={[0, -0.88, 0]} s={[0.26, 0.2, 0.3]} c="#c98d63" />
      </group>
      <group position={[0.65, 1.7, 0]} rotation={[0, 0, -0.5 - Math.sin(frame / 10) * 0.1]}>
        <Box p={[0, -0.38, 0]} s={[0.3, 0.85, 0.36]} c="#2c5aa0" />
        <Box p={[0, -0.88, 0]} s={[0.26, 0.2, 0.3]} c="#c98d63" />
      </group>
      {/* head */}
      <group position={[0, 2.25, 0]} rotation={[0, look, 0]}>
        <Box p={[0, 0, 0]} s={[0.85, 0.8, 0.8]} c="#c98d63" />
        {/* eyes */}
        <group scale={[1, blink, 1]}>
          <Box p={[-0.2, 0.05, 0.41]} s={[0.18, 0.22, 0.02]} c="#111" />
          <Box p={[0.2, 0.05, 0.41]} s={[0.18, 0.22, 0.02]} c="#111" />
          <Box p={[-0.16, 0.11, 0.425]} s={[0.06, 0.06, 0.01]} c="#fff" e={0.6} />
          <Box p={[0.24, 0.11, 0.425]} s={[0.06, 0.06, 0.01]} c="#fff" e={0.6} />
        </group>
        <Box p={[0, -0.22, 0.41]} s={[0.26, 0.05, 0.02]} c="#5a3a28" />
        {/* hard hat */}
        <Box p={[0, 0.5, 0]} s={[0.92, 0.28, 0.88]} c="#ffb238" e={0.15} />
        <Box p={[0, 0.38, 0.12]} s={[1.08, 0.06, 1.1]} c="#ffb238" e={0.15} />
        <Box p={[0, 0.66, 0]} s={[0.16, 0.06, 0.9]} c="#e89a1f" />
      </group>
    </group>
  );
};

const Volt: React.FC<{frame: number; power: number}> = ({frame, power}) => {
  const y = 2.6 + Math.sin(frame / 10) * 0.12;
  const flick = power > 0.05 ? power : 0.15 + 0.1 * Math.abs(Math.sin(frame * 1.7));
  return (
    <group position={[1.25, y + 0.3, 0.9]} rotation={[0.1, -0.4 + Math.sin(frame / 25) * 0.15, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#ffb238" emissive="#ffb238" emissiveIntensity={1.6 * flick} roughness={0.4} />
      </mesh>
      {/* ^ ^ eyes */}
      {[-0.17, 0.17].map((x, i) => (
        <group key={i} position={[x, 0.08, 0.41]}>
          <Box p={[-0.05, 0, 0]} s={[0.12, 0.04, 0.02]} c="#1a1208" />
          <Box p={[0.05, 0, 0]} s={[0.12, 0.04, 0.02]} c="#1a1208" />
        </group>
      ))}
      <pointLight color="#ffb238" intensity={6 * flick} distance={6} />
    </group>
  );
};

export const Test3D: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  // power: 1 = grid on, 0 = blackout (drops in the middle of the clip)
  const power = interpolate(frame, [durationInFrames * 0.35, durationInFrames * 0.75], [1, 0], clamp);
  const t = frame / durationInFrames;
  const camAng = interpolate(t, [0, 1], [-0.5, 0.35]);
  const camR = interpolate(t, [0, 1], [10, 7.5]);
  const look = interpolate(frame, [durationInFrames * 0.4, durationInFrames * 0.55], [0, -0.6], clamp);
  return (
    <AbsoluteFill style={{background: '#0b1020'}}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        camera={{fov: 40, position: [Math.sin(camAng) * camR, 3.2, Math.cos(camAng) * camR]}}
        onCreated={({camera}) => camera.lookAt(0, 1.8, 0)}
      >
        <CameraRig ang={camAng} r={camR} />
        <color attach="background" args={['#0b1020']} />
        <fog attach="fog" args={['#0b1020', 10, 30]} />
        <ambientLight intensity={0.55 + 0.45 * power} color="#9fb2ff" />
        <directionalLight position={[5, 10, 6]} intensity={0.9 * (0.3 + 0.7 * power)} castShadow shadow-mapSize={[1024, 1024]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial color="#141c3a" />
        </mesh>
        <gridHelper args={[80, 80, '#2a3a7a', '#1d2752']} position={[0, 0.01, 0]} />
        <City power={power} />
        <Lineman frame={frame} look={look} />
        <Volt frame={frame} power={power} />
      </ThreeCanvas>
      <div
        style={{
          position: 'absolute',
          top: 120,
          width: '100%',
          textAlign: 'center',
          fontFamily: 'Inter',
          fontWeight: 900,
          fontSize: 92,
          color: power > 0.5 ? '#e9ecf5' : '#ff5a4e',
          textShadow: '0 6px 30px rgba(0,0,0,0.8)',
        }}
      >
        {power > 0.5 ? '00:00' : 'BLACKOUT'}
      </div>
    </AbsoluteFill>
  );
};

import {useThree} from '@react-three/fiber';
const CameraRig: React.FC<{ang: number; r: number}> = ({ang, r}) => {
  const {camera} = useThree();
  camera.position.set(Math.sin(ang) * r, 3.2, Math.cos(ang) * r);
  camera.lookAt(0, 1.8, 0);
  return null;
};
