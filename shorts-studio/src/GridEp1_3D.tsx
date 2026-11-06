import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, Captions, FONT, gridEp1Schema, Label, TopBar} from './GridEp1';
import {Box, Cam, City, clamp, COL, House, Lineman, Stage, useTextTexture, Volt} from './three/kit';

// One 3D canvas per scene; 2D overlays (clock, captions, labels) on top.
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

// 1. Hook: wide city, the lights go out in a wave. "If the power grid went down right now..."
const S1Hook: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const power = interpolate(frame, [dur * 0.45, dur * 0.95], [1, 0], clamp);
  const camY = ease(frame, 0, dur, 13, 4.2);
  const camZ = ease(frame, 0, dur, 22, 9.5);
  return (
    <Scene3D>
      <Cam pos={[2, camY, camZ]} target={[0, 2, -4]} />
      <Stage power={power} fogFar={60} />
      <City power={power} count={140} spread={30} />
      <Lineman frame={frame} pos={[0, 0, 0]} pose={{lookX: -0.35, mouth: power < 0.5 ? 'o' : 'flat', brows: power < 0.5 ? 'up' : 'none'}} />
      <Volt frame={frame} pos={[1.3, 2.9, 0.6]} glow={power} mood={power < 0.5 ? 'shock' : 'happy'} />
    </Scene3D>
  );
};

// 2. Lights: the house window goes dark; hero turns to camera, "?". "Your lights go out..."
const S2Lights: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lit = interpolate(frame, [8, 12], [1, 0], clamp);
  const look = ease(frame, 20, 50, 2.6, 0);
  const q = spring({frame: frame - Math.round(dur * 0.55), fps, config: {damping: 10}});
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 3.0, 2.0), 2.8, ease(frame, 0, dur, 8.5, 7)]} target={[0, 2.0, -1]} />
        <Stage power={0.15} />
        <City power={0} count={60} />
        <House pos={[-1.2, 0, -4.2]} lit={lit} />
        <Lineman frame={frame} pos={[0.4, 0, 0]} pose={{lookY: look, armL: frame > dur * 0.5 ? 0.6 : 0, armR: frame > dur * 0.5 ? 0.6 : 0, mouth: 'frown', brows: 'worried'}} />
        <Volt frame={frame} pos={[1.9, 2.8, 0.4]} glow={0} mood="worried" />
      </Scene3D>
      <div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 200, color: C.amber, transform: `scale(${q})`, textShadow: '0 10px 40px rgba(0,0,0,0.7)'}}>
        ?
      </div>
    </AbsoluteFill>
  );
};

// 3. Card: terminal says NO NETWORK; a cash bill drops. "Your card stops working... cash only."
const Terminal: React.FC<{frame: number}> = ({frame}) => {
  const tex = useTextTexture(Math.floor(frame / 10) % 2 === 0 ? 'NO\nNETWORK' : '', {w: 320, h: 256, size: 52});
  return (
    <group position={[-0.9, 1.2, 0.6]} rotation={[-0.25, 0.35, 0]}>
      <Box s={[0.9, 1.3, 0.25]} c="#1e284d" />
      <Box p={[0, 0.32, 0.13]} s={[0.72, 0.5, 0.02]} c="#fff" map={tex} e={1} />
      {new Array(9).fill(0).map((_, i) => (
        <Box key={i} p={[-0.22 + (i % 3) * 0.22, -0.12 - Math.floor(i / 3) * 0.17, 0.13]} s={[0.16, 0.12, 0.03]} c="#3a4680" />
      ))}
    </group>
  );
};
const S3Card: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const billY = interpolate(frame, [Math.round(dur * 0.55), Math.round(dur * 0.8)], [6, 1.17], {...clamp, easing: Easing.out(Easing.bounce)});
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 0.8, 0.2), 2.9, ease(frame, 0, dur, 8.2, 7.2)]} target={[0, 1.6, 0]} />
        <Stage power={0.15} />
        <City power={0} count={50} />
        {/* counter */}
        <Box p={[-0.4, 0.5, 0.6]} s={[2.6, 1.0, 1.2]} c="#3a2c22" />
        <Box p={[-0.4, 1.03, 0.6]} s={[2.7, 0.06, 1.3]} c="#5b4636" />
        <Terminal frame={frame} />
        <group position={[0.25, billY, 0.7]} rotation={[0, frame / 12, 0]}>
          <Box s={[0.9, 0.02, 0.42]} c="#3c8f5a" e={0.25} />
          <Box p={[0, 0.015, 0]} s={[0.2, 0.01, 0.2]} c="#d8ffe6" e={0.3} />
        </group>
        <Lineman frame={frame} pos={[1.0, 0, -0.9]} rotY={-0.5} pose={{hold: 'card', armRx: -0.9, lookY: -0.4, lookX: 0.15, mouth: 'frown', brows: 'worried'}} />
        <Volt frame={frame} pos={[-1.6, 2.9, -0.6]} glow={0} mood="worried" />
      </Scene3D>
      <Label text="CASH ONLY" color={C.green} delay={Math.round(dur * 0.62)} top={1250} />
    </AbsoluteFill>
  );
};

// 4. Pump: dead gas pump. "Gas stations can't help you."
const S4Pump: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const tex = useTextTexture('----', {w: 256, h: 128, size: 90, color: '#6b7499'});
  const ang = ease(frame, 0, dur, -0.35, 0.15);
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[Math.sin(ang) * 8.5 - 0.3, 3.0, Math.cos(ang) * 8.5]} target={[-0.3, 1.9, 0]} />
        <Stage power={0.15} />
        <City power={0} count={50} />
        {/* canopy */}
        <Box p={[-0.5, 4.2, 0]} s={[5, 0.3, 3]} c="#2f3c70" />
        <Box p={[-0.5, 4.2, 1.51]} s={[5, 0.3, 0.02]} c={COL.red} e={0.05} />
        <Box p={[-2.6, 2.1, 0]} s={[0.25, 4.2, 0.25]} c="#2f3c70" />
        {/* pump */}
        <group position={[-1, 0, 0]}>
          <Box p={[0, 1.2, 0]} s={[1.1, 2.4, 0.7]} c="#d9dce6" />
          <Box p={[0, 2.5, 0]} s={[1.2, 0.2, 0.8]} c={COL.red} />
          <Box p={[0, 1.8, 0.36]} s={[0.8, 0.4, 0.02]} c="#fff" map={tex} e={0.6} />
          <Box p={[0.62, 1.2, 0.1]} s={[0.15, 0.5, 0.2]} c="#222" />
          <Box p={[0.7, 0.6, 0.1]} s={[0.08, 1.0, 0.08]} c="#222" />
        </group>
        <Lineman frame={frame} pos={[0.6, 0, 0.6]} rotY={-0.6} pose={{lookY: -0.3, armR: 2.6, armRx: 0, mouth: 'flat', brows: 'worried'}} />
        <Volt frame={frame} pos={[1.7, 3.0, -0.2]} glow={0} mood="worried" />
      </Scene3D>
      <Label text="PUMPS NEED POWER" delay={30} top={1250} />
    </AbsoluteFill>
  );
};

// 5. Fridge: countdown from 4:00:00. "Your fridge starts a countdown..."
const S5Fridge: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const secs = Math.floor(interpolate(frame, [10, dur], [4 * 3600, 3 * 3600 + 7], clamp));
  const fmt = `${Math.floor(secs / 3600)}:${String(Math.floor((secs % 3600) / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  const tex = useTextTexture(fmt, {w: 512, h: 160, size: 120});
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 2.0, 1.2), 2.8, ease(frame, 0, dur, 8.6, 7.2)]} target={[-0.2, 1.9, 0]} />
        <Stage power={0.15} />
        <City power={0} count={50} />
        <group position={[-0.9, 0, 0]}>
          <Box p={[0, 1.6, 0]} s={[1.5, 3.2, 1.2]} c="#dfe5f2" />
          <Box p={[0, 2.25, 0.61]} s={[1.5, 0.04, 0.02]} c="#a9b2c8" />
          <Box p={[0.6, 2.75, 0.64]} s={[0.08, 0.6, 0.06]} c="#8a93ab" />
          <Box p={[0.6, 1.55, 0.64]} s={[0.08, 1.0, 0.06]} c="#8a93ab" />
          <Box p={[-0.1, 1.75, 0.62]} s={[1.0, 0.32, 0.02]} c="#fff" map={tex} e={1} />
        </group>
        <Lineman frame={frame} pos={[0.7, 0, 0.7]} rotY={-0.5} pose={{lookY: -0.5, armL: 0.2, mouth: 'flat', brows: 'up'}} />
        <Volt frame={frame} pos={[1.6, 3.2, -0.3]} glow={0} mood="worried" />
      </Scene3D>
      <Label text="USDA: ~4 HRS · DOOR SHUT" delay={Math.round(dur * 0.3)} top={1250} />
    </AbsoluteFill>
  );
};

// 6. Tower: cell tower on backup, phone signal fading. "Many cell towers... a few hours."
const S6Tower: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const battery = interpolate(frame, [20, dur], [1, 0.12], clamp);
  const beacon = Math.floor(frame / 15) % 2 === 0 ? 2.5 : 0.2;
  const legs: [number, number][] = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 2.6, 1.8), ease(frame, 0, dur, 2.6, 3.2), ease(frame, 0, dur, 11, 10)]} target={[-0.4, 3.0, -1.5]} />
        <Stage power={0.15} />
        <City power={0} count={50} />
        {/* lattice tower */}
        <group position={[-1.4, 0, -3.5]}>
          {legs.map(([x, z], i) => (
            <Box key={i} p={[x * 0.5, 3.5, z * 0.5]} r={[z * 0.07, 0, -x * 0.07]} s={[0.12, 7, 0.12]} c="#6a76a0" />
          ))}
          {[1.5, 3, 4.5, 6].map((y) => (
            <group key={y}>
              <Box p={[0, y, 0.75 - y * 0.06]} s={[1.6 - y * 0.12, 0.08, 0.08]} c="#6a76a0" />
              <Box p={[0, y, -0.75 + y * 0.06]} s={[1.6 - y * 0.12, 0.08, 0.08]} c="#6a76a0" />
            </group>
          ))}
          {[-0.35, 0.35].map((x) => (
            <Box key={x} p={[x, 6.6, 0.25]} s={[0.22, 0.8, 0.08]} c="#cfd5e6" />
          ))}
          <Box p={[0, 7.2, 0]} s={[0.2, 0.2, 0.2]} c={COL.red} e={beacon} />
          <pointLight position={[0, 7.4, 0]} color={COL.red} intensity={beacon * 3} distance={5} />
          {/* backup battery cabinet */}
          <Box p={[1.4, 0.6, 0.6]} s={[0.9, 1.2, 0.7]} c="#2f3c70" />
          <Box p={[1.4, 0.6 - 0.45 + 0.45 * battery, 0.96]} s={[0.6, 0.9 * battery, 0.02]} c={battery > 0.35 ? COL.green : COL.red} e={1} />
        </group>
        <Lineman frame={frame} pos={[0.9, 0, 0.8]} rotY={-0.3} pose={{hold: 'phone', armRx: -1.1, armR: 0.2, lookX: 0.35, lookY: -0.2, phoneGlow: battery, mouth: 'frown', brows: 'worried'}} />
        <Volt frame={frame} pos={[2.0, 3.1, -0.2]} glow={0} mood="worried" />
      </Scene3D>
      <div style={{position: 'absolute', top: 400, right: 90, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: battery > 0.35 ? C.green : C.red}}>
        🔋 {Math.round(battery * 100)}%
      </div>
      <Label text="BACKUP: A FEW HOURS" delay={Math.round(dur * 0.45)} top={1250} />
    </AbsoluteFill>
  );
};

// 7. Outro: hero with a flashlight in the dark city, camera pulls up. "Hour six... Part two."
const S7Outro: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 30, fps, config: {damping: 12}});
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 2, 0), ease(frame, 0, dur, 2.8, 9), ease(frame, 0, dur, 6, 13)]} target={[0, 1.5, -2]} />
        <Stage power={0} />
        <City power={0} count={120} spread={30} />
        <Lineman frame={frame} pos={[0, 0, 0]} rotY={Math.PI} pose={{hold: 'flashlight', armRx: -1.4}} />
        <spotLight position={[0.6, 1.8, -0.6]} angle={0.35} penumbra={0.5} intensity={30} distance={18} color="#fff3cf" target-position={[0.8, 1, -10]} castShadow />
        <Volt frame={frame} pos={[-1.2, 2.6, -0.3]} glow={0} mood="shock" />
      </Scene3D>
      <div style={{position: 'absolute', top: 1330, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 110, color: C.red, transform: `scale(${s})`, textShadow: `0 0 60px ${C.red}88`}}>
        PART 2 →
      </div>
    </AbsoluteFill>
  );
};

export const GridEp1_3D: React.FC<gridEp1Schema> = ({segments, captions, audio}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const f = (sec: number) => Math.round(sec * fps);
  const starts = segments.map((s) => f(s.start));
  const bounds = segments.map((_, i) => [i === 0 ? 0 : starts[i], i + 1 < segments.length ? starts[i + 1] : durationInFrames]);
  const scenes = [S1Hook, S2Lights, S3Card, S4Pump, S5Fridge, S6Tower, S7Outro];
  const outroStart = bounds[bounds.length - 1][0];
  return (
    <AbsoluteFill style={{background: COL.night}}>
      {bounds.map(([from, to], i) => {
        const S = scenes[i];
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}>
            <S dur={to - from} />
          </Sequence>
        );
      })}
      {/* top gradient so the clock reads over the 3D scene */}
      <AbsoluteFill style={{background: 'linear-gradient(rgba(11,16,32,0.85) 0%, rgba(11,16,32,0) 18%, rgba(11,16,32,0) 70%, rgba(11,16,32,0.9) 100%)'}} />
      <Sequence from={0} durationInFrames={outroStart}>
        <TopBar totalFrames={outroStart} finalHour={false} />
      </Sequence>
      <Sequence from={outroStart}>
        <TopBar totalFrames={1} finalHour />
      </Sequence>
      <Captions segments={captions} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
