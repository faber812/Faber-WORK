// Cover for Short 012 (separate file, not frame 0): water heater cut open, full of bright cyan water, Lineman's face 3/4
// with eyebrows up, hand on the cut edge. Dark plain background. Text: "LOOK" white / "INSIDE" yellow, no box.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {Box, Cam, Lineman} from '../three/kit';
import {reachArm} from './S012';

type V3 = [number, number, number];
const TANK: V3 = [-0.75, 0, -0.4];
const R = 0.75;
const H = 2.3;
const HERO: V3 = [0.55, 0, -0.05];
const HERO_ROT = -0.4;

export const Thumb012: React.FC = () => (
  <AbsoluteFill style={{background: '#16171c'}}>
    <ThreeCanvas width={1080} height={1920} camera={{fov: 40, position: [0, 2, 6]}}>
      <Cam pos={[0.05, 1.9, 7.4]} target={[-0.1, 2.15, -0.3]} fov={40} />
      <color attach="background" args={['#16171c']} />
      <hemisphereLight args={['#5a6178', '#0d0e12', 0.6]} />
      <directionalLight position={[3, 5, 5]} intensity={2.2} color="#ffd9a8" />
      <pointLight position={[0.9, 2.6, 1.4]} intensity={5} distance={4} color="#ffc98a" />
      <group position={TANK}>
        {/* back half of the white shell, cut open toward the camera */}
        <mesh position={[0, H / 2, 0]}>
          <cylinderGeometry args={[R, R, H, 48, 1, true, Math.PI / 2, Math.PI]} />
          <meshStandardMaterial color="#f4f2ec" side={THREE.DoubleSide} roughness={0.4} />
        </mesh>
        {/* water fills it to the brim */}
        <mesh position={[0, H / 2 - 0.02, 0]}>
          <cylinderGeometry args={[R - 0.04, R - 0.04, H - 0.08, 48]} />
          <meshBasicMaterial color="#12c4ff" toneMapped={false} />
        </mesh>
        <mesh position={[0, H - 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[R - 0.16, R - 0.04, 48]} />
          <meshBasicMaterial color="#f0fdff" />
        </mesh>
        {/* cut edges */}
        {[-1, 1].map((sx) => <Box key={sx} p={[sx * R, H / 2, 0]} s={[0.05, H, 0.05]} c="#d8d4ca" />)}
        <Box p={[0, H + 0.04, -0.1]} s={[1.0, 0.06, 0.8]} c="#d8d4ca" />
        <Box p={[0, 0.03, 0]} s={[1.6, 0.06, 1.6]} c="#3a3b42" />
      </group>
      <Lineman frame={0} pos={HERO} rotY={HERO_ROT} pose={{...reachArm(0, HERO, HERO_ROT, [TANK[0] + R, 1.7, TANK[2] + 0.02]), brows: 'up', mouth: 'o', lookY: -0.2, lookX: 0.1}} />
    </ThreeCanvas>
    <div style={{position: 'absolute', top: 230, left: 60, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 900, lineHeight: 0.98, letterSpacing: -3}}>
      {[['LOOK', '#ffffff'], ['INSIDE', '#ffd21f']].map(([w, c]) => (
        <div key={w} style={{fontSize: 200, color: c, WebkitTextStroke: '22px #0a0a0e', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.8)'}}>{w}</div>
      ))}
    </div>
  </AbsoluteFill>
);
