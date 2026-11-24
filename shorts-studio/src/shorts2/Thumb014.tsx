// Cover for Short 014 (separate file, not frame 0): daylight kitchen cutaway — snow window (left), thin-insulation wall
// with a frost line (middle), frosted copper pipe (right, the hero, >25% of frame); Lineman's face 3/4 lit by window daylight.
// Text: "WHY" white / "HERE?" yellow, no box; frost-drawn arrow from the "?" to the pipe.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Box, Cam, Lineman} from '../three/kit';

const frost = (seed: number, n: number, y0: number, y1: number, r: number) =>
  Array.from({length: n}).map((_, i) => {
    const h = (k: number) => {
      const x = Math.sin(i * 12.9898 + seed * 78.233 + k * 37.719) * 43758.5453;
      return x - Math.floor(x);
    };
    const a = h(1) * Math.PI * 2;
    const y = y0 + h(2) * (y1 - y0);
    return {p: [Math.cos(a) * r, y, Math.sin(a) * r] as [number, number, number], s: 0.05 + h(3) * 0.07};
  });

export const Thumb014: React.FC = () => (
  <AbsoluteFill style={{background: '#5d5a56'}}>
    {/* layer 1: the wall cutaway and the pipe */}
    <ThreeCanvas width={1080} height={1920} camera={{fov: 45, position: [0, 2, 6]}}>
      <Cam pos={[0, 1.6, 6.5]} target={[0, 1.6, 0]} fov={45} />
      <color attach="background" args={['#5d5a56']} />
      <hemisphereLight args={['#e6eef8', '#4a4038', 0.9]} />
      <directionalLight position={[-6, 5, 4]} intensity={2.4} color="#fff3e2" />
      {/* window: snow glare, left */}
      <Box p={[-2.0, 3.2, -0.5]} s={[1.6, 2.0, 0.05]} c="#f2f8ff" e={1.6} />
      <Box p={[-2.0, 3.2, -0.45]} s={[1.7, 0.06, 0.08]} c="#ffffff" />
      {/* wall section with thin insulation */}
      <Box p={[0, 1.6, -0.8]} s={[6, 5, 0.1]} c="#7c746a" />
      {[-0.9, 0.2].map((x) => <Box key={x} p={[x, 1.2, -0.65]} s={[0.12, 4.6, 0.25]} c="#b89a72" />)}
      {[[-0.4, 0.6], [-0.3, 2.4], [0.7, 1.5]].map(([x, y]) => <Box key={`${x}${y}`} p={[x, y, -0.7]} s={[0.55, 0.5, 0.12]} c="#9a9ea6" />)}
      {/* frost line pushing through the wall toward the pipe */}
      <mesh position={[-0.55, 2.0, -0.58]} rotation={[0, 0, -0.75]}>
        <planeGeometry args={[0.16, 3.4]} />
        <meshBasicMaterial color="#d8f4ff" toneMapped={false} />
      </mesh>
      {/* copper pipe + elbow, crusted with frost */}
      <group position={[1.15, 0, -0.2]}>
        <mesh position={[0, 1.35, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 2.7, 24]} />
          <meshStandardMaterial color="#d9742c" metalness={0.45} roughness={0.3} />
        </mesh>
        <mesh position={[-0.42, 2.7, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.24, 0.24, 1.1, 24]} />
          <meshStandardMaterial color="#d9742c" metalness={0.45} roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.7, 0]}>
          <sphereGeometry args={[0.27, 20, 16]} />
          <meshStandardMaterial color="#cf6a26" metalness={0.45} roughness={0.3} />
        </mesh>
        {frost(0.7, 140, 0.4, 2.9, 0.24).map((c, i) => (
          <mesh key={i} position={c.p}>
            <sphereGeometry args={[c.s, 8, 6]} />
            <meshStandardMaterial color="#f4fbff" emissive="#bfe8ff" emissiveIntensity={0.6} />
          </mesh>
        ))}
      </group>
    </ThreeCanvas>
    {/* layer 2: Lineman, face 3/4, lit warm by the window daylight */}
    <AbsoluteFill>
      <ThreeCanvas width={1080} height={1920} gl={{alpha: true}} camera={{fov: 30, position: [0, 2, 9]}}>
        <Cam pos={[-1.0, 1.6, 9.5]} target={[0.55, 2.35, 0]} fov={30} />
        <hemisphereLight args={['#dfe8f5', '#3a3330', 0.8]} />
        <directionalLight position={[-5, 4, 6]} intensity={3.4} color="#ffe6c4" />
        <pointLight position={[1.3, 2.5, 1.8]} intensity={7} distance={4} color="#fff1dc" />
        <Lineman frame={0} pos={[0, 0, 0]} rotY={0.5} pose={{brows: 'worried', mouth: 'o', lookY: 0.25, lookX: 0.05, armRx: -0.2}} />
      </ThreeCanvas>
    </AbsoluteFill>
    {/* frost-drawn arrow to the pipe */}
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <path d="M 650 500 Q 790 470 850 620" stroke="#e8f8ff" strokeWidth={18} fill="none" strokeLinecap="round" />
      <path d="M 805 600 L 855 640 L 878 575" stroke="#e8f8ff" strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{position: 'absolute', top: 210, left: 60, right: 170, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 900, fontSize: 200, lineHeight: 0.98, letterSpacing: -3}}>
      {[['WHY', '#ffffff'], ['HERE?', '#ffd21f']].map(([w, c]) => (
        <div key={w} style={{color: c, WebkitTextStroke: '18px #0a0a0e', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.7)'}}>{w}</div>
      ))}
    </div>
  </AbsoluteFill>
);
