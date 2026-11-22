// Thumbnail for Short 011 (also frame 0 of the Short). Same garage set and kit Lineman, lit only by his phone:
// low angle looking up at the red emergency-release cord; only three colors read: red cord, warm light/skin, yellow text.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Box, Cam, Lineman} from '../three/kit';
import {FONT} from '../long/props';
import {ThreeCanvas} from '@remotion/three';
import {Door, Springs, Tracks} from './S011';

const DOOR_Z = -4; // same as S011 (local copy: S011 imports this file for its frame 0)

type V3 = [number, number, number];
const CORD_Z = DOOR_Z + 1.0;
const HANDLE: V3 = [0, 2.48, CORD_Z];

// two layers of the same set: (1) the cord close-up from below, (2) Lineman's face looking up, warm phone light
const Layer: React.FC<{w: number; h: number; children: React.ReactNode}> = ({w, h, children}) => (
  <ThreeCanvas width={w} height={h} gl={{alpha: true}} camera={{fov: 35, position: [0, 2, 6]}}>
    {children}
  </ThreeCanvas>
);
export const ThumbScene: React.FC<{frame?: number}> = ({frame = 0}) => (
  <AbsoluteFill style={{filter: 'brightness(1.15) saturate(1.1)'}}>
    <Layer w={1080} h={1920}>
      <Cam pos={[-0.08, 1.8, CORD_Z + 1.9]} target={[-0.2, 2.2, CORD_Z - 0.1]} fov={50} />
      <color attach="background" args={['#04060d']} />
      <hemisphereLight args={['#2a3350', '#05070d', 0.25]} />
      <spotLight position={[-0.3, 1.5, CORD_Z + 0.7]} target-position={HANDLE} angle={0.45} penumbra={0.6} intensity={30} distance={5} color="#ffb45c" />
      <Box p={[0, 4.0, 0]} s={[7, 0.1, 9]} c="#090b14" />
      <Door open={0} />
      <Tracks />
      <Springs />
      <Box p={[0, 3.62, DOOR_Z + 2.5]} s={[0.14, 0.08, 5.0]} c="#23262e" />
      <Box p={[0, 3.52, CORD_Z]} s={[0.22, 0.14, 0.3]} c="#3a3e48" />
      <Box p={[0, 3.0, CORD_Z]} s={[0.035, 1.0, 0.035]} c="#ff2a1a" e={0.9} />
      <Box p={HANDLE} s={[0.24, 0.07, 0.07]} c="#ff2a1a" e={1.1} />
    </Layer>
    <AbsoluteFill>
      <Layer w={1080} h={1920}>
        <Cam pos={[2.2, 0.9, 10.5]} target={[0.55, 1.7, 0]} fov={30} />
        <hemisphereLight args={['#2a3350', '#05070d', 0.3]} />
        <pointLight position={[0.45, 1.5, 1.3]} intensity={8} distance={3.5} color="#ffb060" />
        <Lineman frame={frame} pos={[0, 0, 0]} rotY={0.35} pose={{hold: 'phone', armRx: -2.3, armR: 0.15, phoneGlow: 0.6, lookX: -0.45, lookY: -0.1, brows: 'worried', mouth: 'o'}} />
      </Layer>
    </AbsoluteFill>
  </AbsoluteFill>
);

const stroke = (w: number) =>
  ({WebkitTextStroke: `${w}px #000`, paintOrder: 'stroke fill', textShadow: `0 ${w / 2}px ${w * 1.5}px rgba(0,0,0,0.9)`}) as React.CSSProperties;

export const ThumbText: React.FC = () => (
  <>
    <div style={{position: 'absolute', top: 225, left: 60, right: 170, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 112, lineHeight: 1.1, color: '#fff', letterSpacing: -1, ...stroke(14)}}>CAR STUCK?</div>
    <div style={{position: 'absolute', top: 1150, left: 20, right: 140, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 190, lineHeight: 1.0, color: '#ffd21f', letterSpacing: -4, whiteSpace: 'nowrap', ...stroke(20)}}>LOOK UP.</div>
  </>
);

export const Thumb011: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#04060d'}}>
      <ThumbScene frame={f} />
      <ThumbText />
    </AbsoluteFill>
  );
};
