// Cold-open hooks for episodes 1–3 (first ~1.7 s): strongest image + one bold line from frame 0.
import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from './GridEp1';
import {Box, Cam, City, clamp, COL, Lineman, Stage, Volt} from './three/kit';

export const HOOK_FRAMES = 50;

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

const HookText: React.FC<{lines: [string, string]; color: string}> = ({lines, color}) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [0, 5], [1.08, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{position: 'absolute', top: 400, left: 50, right: 50, textAlign: 'center', scale: String(k), fontFamily: FONT, fontWeight: 900, lineHeight: 1.02}}>
      <div style={{fontSize: 92, color: '#fff', textShadow: '0 8px 30px rgba(0,0,0,0.9)'}}>{lines[0]}</div>
      <div style={{display: 'inline-block', marginTop: 14, fontSize: 92, color: '#0b1020', background: color, padding: '4px 28px', borderRadius: 16}}>{lines[1]}</div>
    </div>
  );
};

// Ep1: a fully lit city blacks out in a second.
const Hook1: React.FC = () => {
  const frame = useCurrentFrame();
  const power = interpolate(frame, [10, 40], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, HOOK_FRAMES, 3, 1.5), ease(frame, 0, HOOK_FRAMES, 9, 7), ease(frame, 0, HOOK_FRAMES, 16, 13)]} target={[0, 3.5, -6]} />
        <Stage power={0.5 + 0.5 * power} fogFar={60} />
        <City power={power} count={150} spread={30} clearRadius={4} />
      </Scene3D>
      <HookText lines={['THE GRID GOES DOWN.', 'WHAT FAILS FIRST?']} color="#ffb238" />
    </AbsoluteFill>
  );
};

// Ep2: open fridge, food on the counter, red warning light.
const Hook2: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.6 + 0.4 * Math.abs(Math.sin(frame / 4));
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, HOOK_FRAMES, 1.4, 0.6), 3.0, ease(frame, 0, HOOK_FRAMES, 8.6, 7.4)]} target={[0, 1.7, 0]} />
        <Stage power={0.9} />
        <City power={0} count={40} />
        <group position={[-1.5, 0, -0.6]}>
          <Box p={[0, 1.6, 0]} s={[1.5, 3.2, 1.2]} c="#dfe5f2" />
          <Box p={[0, 1.6, 0.55]} s={[1.3, 3.0, 0.1]} c="#151b30" />
          <Box p={[0.95, 1.6, 0.9]} r={[0, -1.2, 0]} s={[1.5, 3.1, 0.1]} c="#e9edf6" />
          {[0.9, 1.7, 2.5].map((y) => (
            <Box key={y} p={[0, y, 0.3]} s={[1.25, 0.04, 0.6]} c="#9fb2c8" />
          ))}
          <Box p={[-0.3, 1.95, 0.35]} s={[0.3, 0.5, 0.3]} c="#f2f5fb" />
          <Box p={[0.25, 1.05, 0.35]} s={[0.5, 0.2, 0.35]} c="#c44a4a" />
        </group>
        <pointLight position={[-1.2, 2, 2]} color="#ff5a4e" intensity={7 * pulse} distance={8} />
        <Lineman frame={frame} pos={[1.2, 0, 0.2]} rotY={-0.6} pose={{lookY: -0.5, mouth: 'o', brows: 'worried', armR: 2.3}} />
        <Volt frame={frame} pos={[2.2, 3.1, -0.4]} glow={0} mood="shock" />
      </Scene3D>
      <HookText lines={['YOUR FRIDGE HAS', '4 HOURS']} color="#ff5a4e" />
    </AbsoluteFill>
  );
};

// Ep3: hero close-up with a dying phone.
const Hook3: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = Math.floor(frame / 6) % 2 === 0 ? 1 : 0.25;
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, HOOK_FRAMES, 1.4, 0.8), 3.0, ease(frame, 0, HOOK_FRAMES, 7.4, 6.4)]} target={[0, 2.7, 0]} />
        <Stage power={0.9} />
        <City power={0} count={50} />
        <Lineman frame={frame} pos={[0, 0, 0]} rotY={0.2} pose={{hold: 'phone', armRx: -1.3, armR: 0.25, lookX: 0.35, phoneGlow: glow, mouth: 'o', brows: 'worried'}} />
        <pointLight position={[0.8, 2.4, 3]} color="#fff1dc" intensity={14} distance={8} />
        <Volt frame={frame} pos={[-1.4, 3.0, -0.3]} glow={0} mood="shock" />
      </Scene3D>
      <HookText lines={['WHY YOUR PHONE DIES', 'IN A BLACKOUT']} color="#4ee08a" />
    </AbsoluteFill>
  );
};

const HOOKS = [Hook1, Hook2, Hook3];

export const HookOverlay: React.FC<{ep: 1 | 2 | 3}> = ({ep}) => {
  const H = HOOKS[ep - 1];
  return (
    <Sequence from={0} durationInFrames={HOOK_FRAMES}>
      <AbsoluteFill style={{background: COL.night}}>
        <H />
      </AbsoluteFill>
    </Sequence>
  );
};
