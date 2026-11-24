// Cover for Short 013 (separate file): street level, the officer's raised palm big in the foreground (no insignia,
// nothing written), the dark signal against a bright sky, Lineman's face 3/4 in his truck, eyebrows up.
// Text: "OFFICER" yellow / "OUTRANKS IT" white, no box.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Box, Cam} from '../three/kit';
import {Signal, Utility} from './S013';

export const Thumb013: React.FC = () => (
  <AbsoluteFill style={{background: '#bfe0fa'}}>
    <ThreeCanvas width={1080} height={1920} camera={{fov: 50, position: [0, 2, 6]}}>
      <Cam pos={[0.3, 1.7, 6.8]} target={[0.4, 3.1, -3]} fov={60} />
      <color attach="background" args={['#bfe0fa']} />
      <hemisphereLight args={['#ffffff', '#8a8f99', 1.4]} />
      <directionalLight position={[-6, 10, 8]} intensity={2.8} color="#fff0d8" />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#b4b4b8" />
      </mesh>
      {/* the dark signal on its mast arm */}
      <group position={[-1.0, -0.6, -11.6]}>
        <Signal lamp={0} />
      </group>
      <Box p={[-3.0, 6.4, -5.0]} s={[7.0, 0.22, 0.22]} c="#6c7078" />
      {/* Lineman's truck, facing the camera at 3/4 */}
      <group position={[1.9, 0, -0.8]} rotation={[0, -0.75, 0]}>
        <Utility brake={false} f={0} look={-0.2} />
      </group>
      {/* the officer's raised palm, big in the foreground: plain dark sleeve, bare hand, nothing written */}
      <group position={[-0.7, 2.3, 2.9]} rotation={[0.05, 0.15, 0.12]}>
        <Box p={[0, -1.0, 0]} s={[0.42, 1.6, 0.42]} c="#2b3a5a" />
        <Box p={[0, 0.0, 0.0]} s={[0.5, 0.55, 0.2]} c="#c48a62" />
        {[-0.17, -0.06, 0.05, 0.16].map((x) => <Box key={x} p={[x, 0.42, 0]} s={[0.09, 0.32, 0.16]} c="#c48a62" />)}
        <Box p={[0.3, 0.05, 0]} s={[0.12, 0.3, 0.14]} c="#c48a62" />
      </group>
    </ThreeCanvas>
    <div style={{position: 'absolute', top: 210, left: 60, right: 170, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 900, lineHeight: 0.98, letterSpacing: -3}}>
      {[['OFFICER', '#ffd21f', 190], ['OUTRANKS IT', '#ffffff', 128]].map(([w, c, sz]) => (
        <div key={w as string} style={{fontSize: sz as number, color: c as string, WebkitTextStroke: '18px #0a0a0e', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>{w}</div>
      ))}
    </div>
  </AbsoluteFill>
);
