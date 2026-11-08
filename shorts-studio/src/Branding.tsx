// Channel art for "Lights Out Lab": avatar (800×800) and banner (2560×1440), same 3D look as the series.
import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, random, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {Box, Cam, COL, Lineman, Volt} from './three/kit';
import {F} from './styles/fonts';

const winTex = (seed: number) => {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, 64, 128);
  for (let y = 4; y < 128; y += 12)
    for (let x = 4; x < 64; x += 12)
      if (random(`bw${seed}${x}${y}`) > 0.3) {
        g.fillStyle = '#ffb238';
        g.fillRect(x, y, 7, 7);
      }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  return t;
};

// city whose lights are ON on the left and OFF on the right (the channel idea in one picture)
const SplitCity: React.FC = () => {
  const tex = useMemo(() => new Array(8).fill(0).map((_, i) => winTex(i)), []);
  const blocks = useMemo(() => {
    const out: {x: number; z: number; h: number; w: number; t: number}[] = [];
    for (let i = 0; i < 160; i++) {
      const x = (random(`sx${i}`) - 0.5) * 60;
      const z = -4 - random(`sz${i}`) * 26;
      out.push({x, z, h: 2 + random(`sh${i}`) * 11, w: 1.4 + random(`sw${i}`) * 1.8, t: i % 8});
    }
    return out;
  }, []);
  return (
    <>
      {blocks.map((b, i) => {
        // soft boundary around x = 0 with a little randomness
        const lit = b.x + (random(`j${i}`) - 0.5) * 6 < 0 ? 1 : 0;
        return (
          <mesh key={i} position={[b.x, b.h / 2, b.z]}>
            <boxGeometry args={[b.w, b.h, b.w]} />
            <meshStandardMaterial color={COL.building} emissive="#ffffff" emissiveMap={tex[b.t]} emissiveIntensity={1.5 * lit} roughness={0.8} />
          </mesh>
        );
      })}
    </>
  );
};

const Ground: React.FC = () => (
  <>
    <color attach="background" args={[COL.night]} />
    <fog attach="fog" args={[COL.night, 18, 55]} />
    <hemisphereLight args={['#a9bcff', '#1a2244', 1.0]} />
    <directionalLight position={[6, 12, 8]} intensity={1.0} castShadow shadow-mapSize={[2048, 2048]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color={COL.ground} />
    </mesh>
    <gridHelper args={[200, 200, '#2a3a7a', '#1d2752']} position={[0, 0.01, 0]} />
  </>
);

// ---------- avatar 800×800: Volt close-up, happy, glowing ----------
export const Avatar: React.FC = () => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, #22305e 0%, ${COL.night} 70%)`}}>
      <ThreeCanvas width={width} height={height} camera={{fov: 30, position: [0, 0, 6]}}>
        <Cam pos={[-1.9, 0.55, 5.3]} target={[0, -0.02, 0]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <directionalLight position={[-4, -1, 2]} intensity={0.5} color="#7aa2ff" />
        <group scale={1.55}>
          <Volt frame={18} pos={[0, -0.07, 0]} glow={0.42} mood="happy" light={false} />
        </group>
      </ThreeCanvas>
      {/* soft glow ring */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 52%, rgba(255,178,56,0.12) 60%, transparent 70%)'}} />
    </AbsoluteFill>
  );
};

// ---------- banner 2560×1440 (safe area for all devices: centre 1546×423) ----------
export const Banner: React.FC = () => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: COL.night}}>
      <ThreeCanvas width={width} height={height} shadows camera={{fov: 30, position: [0, 3, 14]}}>
        <Cam pos={[0, 2.2, 24]} target={[0, 1.6, 0]} />
        <Ground />
        <SplitCity />
        {/* street light on the lit side */}
        <group position={[-7.0, 0, 1]}>
          <Box p={[0, 1.6, 0]} s={[0.1, 3.2, 0.1]} c="#2b2d33" />
          <Box p={[0.3, 3.2, 0]} s={[0.6, 0.08, 0.08]} c="#2b2d33" />
          <Box p={[0.55, 3.1, 0]} s={[0.3, 0.12, 0.2]} c="#fff1c1" e={3} />
          <pointLight position={[0.55, 2.9, 0.3]} color="#ffbf5e" intensity={8} distance={7} />
        </group>
        <Lineman frame={20} pos={[-4.6, 0, 1.8]} rotY={0.35} pose={{mouth: 'smile', brows: 'up', armR: 2.4}} />
        <Volt frame={14} pos={[-3.0, 2.75, 1.8]} glow={0.8} mood="happy" />
      </ThreeCanvas>
      {/* readability gradient behind the title (right side = dark half) */}
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(11,16,32,0) 45%, rgba(11,16,32,0.55) 60%, rgba(11,16,32,0.2) 100%)'}} />
      <div style={{position: 'absolute', left: 1200, top: 512, width: 850}}>
        <div style={{fontFamily: F.bebas, fontSize: 148, lineHeight: 0.86, letterSpacing: 6, color: '#f6efe2', textShadow: '0 10px 50px rgba(0,0,0,0.6)'}}>
          LIGHTS OUT<br /><span style={{color: '#ffb238', textShadow: '0 0 40px rgba(255,178,56,0.6)'}}>LAB</span>
        </div>
        <div style={{fontFamily: F.grotesk, fontWeight: 700, fontSize: 34, color: '#c9d2ee', marginTop: 12, letterSpacing: 1}}>
          What happens when everything stops working
        </div>
        <div style={{display: 'inline-block', marginTop: 14, fontFamily: F.mono, fontWeight: 600, fontSize: 24, letterSpacing: 5, color: COL.night, background: '#ffb238', padding: '8px 18px', borderRadius: 8}}>
          NEW EPISODES EVERY WEEK
        </div>
      </div>
    </AbsoluteFill>
  );
};
