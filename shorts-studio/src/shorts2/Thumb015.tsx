// Cover for Short 015 (separate file): Lineman on his pole, face 3/4, eyebrows up, hands pulled back about a foot from
// the wire, leaning back on his safety belt; one span of wire glows orange on a diagonal; dark plain background.
// No transformer, no generator, no numbers. Text: "POWER RUNS" white / "BACKWARD" yellow, no box.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {Box, Cam, Lineman} from '../three/kit';
import {reachArm} from './common';

type V3 = [number, number, number];
const POS: V3 = [0.55, 0, 0.35];
const ROT = -0.35;
const A = new THREE.Vector3(-3.9, 5.0, 0.5);
const B = new THREE.Vector3(-0.2, -0.6, 1.8);

export const Thumb015: React.FC = () => {
  const mid = A.clone().add(B).multiplyScalar(0.5);
  const qn = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return (
    <AbsoluteFill style={{background: '#141a26'}}>
      <ThreeCanvas width={1080} height={1920} camera={{fov: 40, position: [0, 2, 8]}}>
        <Cam pos={[1.0, 1.4, 9.5]} target={[-0.6, 2.25, 0]} fov={42} />
        <color attach="background" args={['#141a26']} />
        <hemisphereLight args={['#3a4560', '#0c0f16', 0.7]} />
        <directionalLight position={[4, 5, 6]} intensity={2.6} color="#ffd9a8" />
        <pointLight position={[-0.6, 2.6, 1.6]} intensity={6} distance={4} color="#ff9a40" />
        {/* the pole and crossarm, his belt around it */}
        <Box p={[0, -0.5, 0]} s={[0.4, 7, 0.4]} c="#6e5236" />
        <Box p={[-1.3, 2.95, 0]} s={[3.0, 0.22, 0.22]} c="#5e4428" />
        <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.62, 0.06, 8, 24]} />
          <meshStandardMaterial color="#3b2a1c" />
        </mesh>
        {/* one span of wire glowing orange, diagonal */}
        <mesh position={mid} quaternion={qn}>
          <cylinderGeometry args={[0.07, 0.07, A.distanceTo(B), 10]} />
          <meshBasicMaterial color="#ff8a1c" toneMapped={false} />
        </mesh>
        <mesh position={mid} quaternion={qn}>
          <cylinderGeometry args={[0.22, 0.22, A.distanceTo(B), 16]} />
          <meshBasicMaterial color="#ff8a1c" transparent opacity={0.22} toneMapped={false} depthWrite={false} />
        </mesh>
        <Lineman frame={0} pos={POS} rotY={ROT} pose={{...reachArm(0, POS, ROT, [-0.75, 2.05, 0.55]), brows: 'up', mouth: 'frown', lookX: -0.05, lookY: -0.45}} />
      </ThreeCanvas>
      <div style={{position: 'absolute', top: 220, left: 60, right: 170, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 900, lineHeight: 0.98, letterSpacing: -3}}>
        {[['POWER RUNS', '#ffffff', 140], ['BACKWARD', '#ffd21f', 168]].map(([w, c, sz]) => (
          <div key={w as string} style={{fontSize: sz as number, color: c as string, WebkitTextStroke: '18px #0a0a0e', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.8)', whiteSpace: 'nowrap'}}>{w}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
