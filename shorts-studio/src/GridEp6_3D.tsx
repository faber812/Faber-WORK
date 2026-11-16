// Episode 6 — "Hour 72: the cold". Experiment: bright daytime winter look instead of the dark night look.
import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, Audio, Easing, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, Captions, FONT, gridEp1Schema, Label, LAYOUT, TopBar} from './GridEp1';
import {Box, Cam, clamp, COL, Lineman, useTextTexture, Volt, Scene3D} from './three/kit';

export const SKY = '#bfdcf5';
export const HOOK_FRAMES = 50;

export const ease = (frame: number, a: number, b: number, from: number, to: number) =>
  interpolate(frame, [a, b], [from, to], {...clamp, easing: Easing.inOut(Easing.cubic)});

// bright winter day: pale sky, snow ground, sun
export const Day: React.FC<{frame: number; snow?: boolean}> = ({frame, snow = true}) => (
  <>
    <color attach="background" args={[SKY]} />
    <fog attach="fog" args={[SKY, 16, 50]} />
    <hemisphereLight args={['#ffffff', '#9fb6d6', 1.7]} />
    <directionalLight position={[6, 12, 8]} intensity={1.8} color="#fff4de" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#f4f8fc" />
    </mesh>
    {snow &&
      new Array(70).fill(0).map((_, i) => {
        const y = 9 - ((frame * 0.05 + random(`fy${i}`) * 9) % 9);
        return <Box key={i} p={[(random(`fx${i}`) - 0.5) * 18 + Math.sin(frame / 20 + i) * 0.2, y, (random(`fz${i}`) - 0.5) * 12]} s={[0.09, 0.09, 0.09]} c="#ffffff" e={0.4} />;
      })}
  </>
);

// warm interior: wooden floor, cream walls, daylight
export const Room: React.FC<{children?: React.ReactNode; w?: number}> = ({children, w = 9}) => (
  <>
    <color attach="background" args={['#e9dcc6']} />
    <hemisphereLight args={['#ffffff', '#c9b79a', 1.5]} />
    <directionalLight position={[4, 8, 8]} intensity={1.5} color="#fff1d6" castShadow shadow-mapSize={[1024, 1024]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#b98a5e" />
    </mesh>
    <Box p={[0, 3, -2.6]} s={[w * 3, 6, 0.2]} c="#efe4cf" />
    {children}
  </>
);

export const Pine: React.FC<{p: [number, number, number]; s?: number}> = ({p, s = 1}) => (
  <group position={p} scale={s}>
    <Box p={[0, 0.4, 0]} s={[0.25, 0.8, 0.25]} c="#6b4630" />
    {[0, 1, 2].map((k) => (
      <mesh key={k} position={[0, 1.2 + k * 0.7, 0]} castShadow>
        <coneGeometry args={[1.1 - k * 0.28, 1.1, 8]} />
        <meshStandardMaterial color="#2f6b4f" />
      </mesh>
    ))}
    <mesh position={[0, 3.25, 0]}>
      <coneGeometry args={[0.3, 0.35, 8]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  </group>
);

export const Cottage: React.FC<{p: [number, number, number]; lit?: number; color?: string}> = ({p, lit = 0, color = '#d86a4a'}) => (
  <group position={p}>
    <Box p={[0, 1.4, 0]} s={[3.4, 2.8, 2.8]} c={color} />
    <mesh position={[0, 3.45, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[2.8, 1.5, 4]} />
      <meshStandardMaterial color="#f7fbff" />
    </mesh>
    <Box p={[-0.8, 1.6, 1.41]} s={[0.9, 0.9, 0.04]} c={lit ? '#ffcf4d' : '#5b7ea6'} e={lit ? 1.5 : 0} />
    <Box p={[0.85, 1.0, 1.41]} s={[0.75, 1.7, 0.04]} c="#5b3a22" />
    <Box p={[1.1, 3.6, -0.4]} s={[0.45, 1.2, 0.45]} c="#8c5a44" />
  </group>
);

export const Big: React.FC<{text: string; color: string; top: number; delay?: number; size?: number}> = ({text, color, top, delay = 0, size = 92}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 12}});
  return (
    <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', scale: String(s)}}>
      <span style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color, background: 'rgba(11,16,32,0.88)', padding: '6px 30px', borderRadius: 20}}>{text}</span>
    </div>
  );
};

// ---------- hook (first 1.7 s) ----------
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [0, 5], [1.08, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, HOOK_FRAMES, 2.4, 1.4), 3.2, ease(frame, 0, HOOK_FRAMES, 9.5, 8)]} target={[0, 2, 0]} />
        <Day frame={frame + 100} />
        <Cottage p={[-2.2, 0, -2.5]} />
        <Pine p={[2.8, 0, -3.5]} s={1.2} />
        <Pine p={[-5.2, 0, -5]} />
        <Lineman frame={frame} pos={[0.8, 0, 0.6]} rotY={0.1} pose={{armL: -0.5, armR: -0.5, mouth: 'frown', brows: 'worried'}} />
        <Volt frame={frame} pos={[2.1, 3.0, 0.2]} glow={0} mood="worried" />
      </Scene3D>
      <div style={{position: 'absolute', top: 400, left: 50, right: 50, textAlign: 'center', scale: String(k), fontFamily: FONT, fontWeight: 900, lineHeight: 1.05}}>
        <div style={{display: 'inline-block', fontSize: 92, color: '#fff', background: 'rgba(11,16,32,0.9)', padding: '4px 26px', borderRadius: 16}}>DAY 3. NO HEAT.</div>
        <br />
        <div style={{display: 'inline-block', marginTop: 14, fontSize: 92, color: '#0b1020', background: '#7cc4ff', padding: '4px 28px', borderRadius: 16}}>NOW WHAT?</div>
      </div>
    </AbsoluteFill>
  );
};

// 1. Exterior: house in snow, indoor temperature dropping
const S1: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const temp = interpolate(frame, [0, dur], [61, 44], clamp);
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 1.4, 0.4), 3.4, ease(frame, 0, dur, 10.5, 9)]} target={[-0.4, 2, -1]} />
        <Day frame={frame} />
        <Cottage p={[-1.8, 0, -2.5]} />
        <Pine p={[3.2, 0, -3.5]} s={1.2} />
        <Pine p={[-5.5, 0, -5]} />
        <Pine p={[5.5, 0, -7]} s={0.9} />
        <Lineman frame={frame} pos={[1.4, 0, 0.8]} rotY={-0.3} pose={{armL: -0.5, armR: -0.5, lookY: -0.3, mouth: 'frown', brows: 'worried'}} />
        <Volt frame={frame} pos={[2.6, 3.0, 0.2]} glow={0} mood="worried" />
      </Scene3D>
      <Big text={`🏠 ${Math.round(temp)}°F`} color={temp < 50 ? '#7cc4ff' : '#fff'} top={420} size={110} />
    </AbsoluteFill>
  );
};

// 2. Kitchen: open oven used as a heater → NEVER
const S2: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const x = spring({frame: frame - Math.round(dur * 0.35), fps, config: {damping: 11}});
  const glow = 0.8 + 0.2 * Math.sin(frame / 3);
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 1.0, 0.4), 3.2, ease(frame, 0, dur, 10, 9)]} target={[0.2, 1.7, 0]} />
        <Room>
          {/* counters */}
          <Box p={[-3.2, 0.6, -1.9]} s={[2.2, 1.2, 1.2]} c="#f4f1ea" />
          <Box p={[1.4, 0.6, -1.9]} s={[2.2, 1.2, 1.2]} c="#f4f1ea" />
          {/* stove with open oven door */}
          <group position={[-0.9, 0, -1.9]}>
            <Box p={[0, 0.65, 0]} s={[1.5, 1.3, 1.2]} c="#dfe3ea" />
            <Box p={[0, 0.55, 0.61]} s={[1.2, 0.8, 0.02]} c="#ff6a2b" e={2.2 * glow} />
            <Box p={[0, 0.12, 1.0]} r={[Math.PI / 2 - 0.1, 0, 0]} s={[1.3, 0.8, 0.06]} c="#c9ced8" />
            {[-0.4, 0.4].map((bx) => (
              <mesh key={bx} position={[bx, 1.32, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
                <meshStandardMaterial color="#2b2d33" />
              </mesh>
            ))}
            <pointLight position={[0, 0.6, 1.4]} color="#ff7a3b" intensity={10 * glow} distance={5} />
          </group>
          <group position={[-0.9, 1.9, -1.2]} scale={x}>
            <Box r={[0, 0, 0.785]} s={[2.0, 0.26, 0.08]} c="#d81e1e" e={0.15} />
            <Box r={[0, 0, -0.785]} s={[2.0, 0.26, 0.08]} c="#d81e1e" e={0.15} />
          </group>
        </Room>
        <Lineman frame={frame} pos={[1.5, 0, 0.2]} rotY={-0.7} pose={{armR: 2.3, lookY: -0.3, mouth: 'o', brows: 'worried'}} />
        <Volt frame={frame} pos={[2.4, 3.2, -0.8]} glow={0} mood="shock" />
      </Scene3D>
      <Big text="NEVER" color={C.red} top={420} delay={Math.round(dur * 0.3)} size={130} />
      <Label text="FEMA: NOT FOR HEATING" color={C.red} delay={Math.round(dur * 0.62)} top={1250} />
    </AbsoluteFill>
  );
};

// 3. One room: door closes, blanket over the window, family together
const S3: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = (sec: number) => Math.round(sec * fps);
  // cue points relative to scene start (11.23 s): room 0.8, door 1.9, windows 3.2, layer 4.2
  const door = interpolate(frame, [f(1.9), f(2.6)], [-1.3, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const blanket = interpolate(frame, [f(3.2), f(3.9)], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const family = spring({frame: frame - f(4.3), fps, config: {damping: 13}});
  const steps: [string, number][] = [
    ['1 · ONE ROOM', 0.8],
    ['2 · CLOSE THE DOORS', 1.9],
    ['3 · COVER WINDOWS', 3.2],
    ['4 · LAYER UP, TOGETHER', 4.3],
  ];
  const cur = steps.filter(([, t]) => frame >= f(t)).pop();
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 1.6, 0.4), 3.4, ease(frame, 0, dur, 9.4, 8.2)]} target={[0, 1.8, -0.5]} />
        <Room w={11}>
          {/* window with snow outside */}
          <Box p={[-2.2, 2.6, -2.48]} s={[1.9, 1.7, 0.06]} c="#cfe6ff" e={0.4} />
          <Box p={[-2.2, 2.6, -2.44]} s={[0.08, 1.7, 0.06]} c="#ffffff" />
          {/* blanket slides down over it */}
          <Box p={[-2.2, 3.5 - 0.9 * blanket, -2.38]} s={[2.1, 0.1 + 1.8 * blanket, 0.08]} c="#b5443a" />
          {/* door on the right, swings shut */}
          <Box p={[3.4, 1.9, -2.48]} s={[1.5, 3.8, 0.06]} c="#3a2c22" />
          <group position={[2.65, 0, -2.4]} rotation={[0, door, 0]}>
            <Box p={[0.75, 1.9, 0]} s={[1.5, 3.8, 0.12]} c="#8c5a3a" />
            <Box p={[1.3, 1.9, 0.1]} s={[0.12, 0.12, 0.12]} c="#d9a21b" />
          </group>
          {/* rug */}
          <Box p={[0, 0.03, 0.2]} s={[4.6, 0.04, 2.6]} c="#3e6b8a" />
        </Room>
        <Lineman frame={frame} pos={[-0.3, 0, 0.3]} rotY={0.15} pose={{mouth: family > 0.5 ? 'smile' : 'flat', brows: 'up', armL: -0.4, armR: -0.4}} />
        <group scale={family}>
          <Lineman frame={frame + 9} pos={[1.1, 0, 0.6]} rotY={-0.2} scale={0.62} pose={{mouth: 'smile', armL: -0.4, armR: -0.4}} />
          <Lineman frame={frame + 21} pos={[-1.5, 0, 0.7]} rotY={0.4} scale={0.5} pose={{mouth: 'smile', armL: -0.4, armR: -0.4}} />
          {/* shared blanket */}
          <Box p={[-0.2, 0.55, 0.95]} s={[3.6, 1.1, 0.25]} c="#d98c3f" />
        </group>
        <Volt frame={frame} pos={[2.2, 3.1, -0.4]} glow={0.5} mood="happy" />
      </Scene3D>
      {cur && <Big key={cur[0]} text={cur[0]} color={C.amber} top={420} delay={f(cur[1])} size={70} />}
    </AbsoluteFill>
  );
};

// 4. Warming center: lit building, sign, hero walking to it
const S4: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const sign = useTextTexture('WARMING\nCENTER', {w: 512, h: 256, size: 78, color: '#0b1020', bg: '#ffcf4d'});
  const walk = interpolate(frame, [0, dur], [2.6, 0.6], clamp);
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 3.4, 2.2), 3.6, ease(frame, 0, dur, 11.5, 10)]} target={[-0.6, 2.4, -2]} />
        <Day frame={frame} />
        <group position={[-1.6, 0, -4]}>
          <Box p={[0, 2, 0]} s={[6.5, 4, 3.4]} c="#e7dccb" />
          <Box p={[0, 4.15, 0]} s={[6.9, 0.3, 3.8]} c="#f7fbff" />
          {[-2.2, -0.8, 0.8, 2.2].map((wx) => (
            <Box key={wx} p={[wx, 2.6, 1.71]} s={[0.9, 1.0, 0.04]} c="#ffcf4d" e={1.6} />
          ))}
          <Box p={[0, 0.9, 1.72]} s={[1.2, 1.8, 0.04]} c="#5b3a22" />
          <Box p={[0, 4.9, 1.6]} s={[3.4, 1.2, 0.1]} c="#fff" map={sign} e={0.9} />
          <pointLight position={[0, 2.5, 3]} color="#ffcf4d" intensity={8} distance={7} />
        </group>
        <Pine p={[4.4, 0, -4]} s={1.1} />
        <Lineman frame={frame} pos={[walk, Math.abs(Math.sin(frame / 4)) * 0.08, 1.4]} rotY={-1.0} pose={{armL: Math.sin(frame / 4) * 0.5, armRx: Math.sin(frame / 4) * 0.6, mouth: 'smile', brows: 'up'}} />
        <Volt frame={frame} pos={[walk - 1.3, 3.0, 1.2]} glow={0.6} mood="happy" />
      </Scene3D>
      <Label text="GO WHERE THERE'S POWER" color={C.amber} delay={Math.round(dur * 0.4)} top={1250} />
    </AbsoluteFill>
  );
};

// 5. Outro
const S5: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 22, fps, config: {damping: 12}});
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 2, 0.5), ease(frame, 0, dur, 4, 8), ease(frame, 0, dur, 10, 14)]} target={[0, 1.5, -3]} />
        <Day frame={frame} />
        <Cottage p={[-3, 0, -3]} />
        <Cottage p={[2.4, 0, -5]} color="#4f86b8" />
        <Cottage p={[-6.5, 0, -8]} color="#7d9a5a" />
        <Pine p={[5.8, 0, -3]} />
        <Pine p={[-0.4, 0, -8]} s={1.3} />
        <Lineman frame={frame} pos={[0.4, 0, 0.8]} rotY={Math.PI - 0.2} pose={{}} />
        <Volt frame={frame} pos={[1.6, 2.9, 0.4]} glow={0} mood="worried" />
      </Scene3D>
      <div style={{position: 'absolute', top: 1180 + LAYOUT.labelShift, width: '100%', textAlign: 'center', scale: String(s)}}>
        <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 110, color: C.red, background: 'rgba(11,16,32,0.88)', padding: '6px 34px', borderRadius: 22}}>PART 7 →</span>
      </div>
    </AbsoluteFill>
  );
};

const KEYS = new Set(['seventy-two.', 'three.', 'winter,', 'colder', 'never', 'oven', 'gas', 'stove', 'fema', 'one', 'room.', 'close', 'cover', 'windows.', 'layer', 'together.', 'dangerously', 'cold,', 'warming', 'center,', 'power.', 'week', 'seven.']);

export const GridEp6_3D: React.FC<gridEp1Schema> = ({segments, captions, audio}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const starts = segments.map((s) => Math.round(s.start * fps));
  const bounds = segments.map((_, i) => [i === 0 ? 0 : starts[i], i + 1 < segments.length ? starts[i + 1] : durationInFrames]);
  const scenes = [S1, S2, S3, S4, S5];
  const outro = bounds[bounds.length - 1][0];
  return (
    <AbsoluteFill style={{background: SKY}}>
      {bounds.map(([from, to], i) => {
        const S = scenes[i];
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}>
            <S dur={to - from} />
          </Sequence>
        );
      })}
      <Sequence from={0} durationInFrames={HOOK_FRAMES}>
        <AbsoluteFill style={{background: SKY}}>
          <Hook />
        </AbsoluteFill>
      </Sequence>
      {/* lighter bands than the night episodes: just enough for the clock and captions */}
      <AbsoluteFill style={{left: -1500, right: -1500, width: 'auto', background: 'linear-gradient(rgba(11,16,32,0.8) 0%, rgba(11,16,32,0) 17%, rgba(11,16,32,0) 68%, rgba(11,16,32,0.8) 82%, rgba(11,16,32,0.85) 100%)'}} />
      <Sequence from={0} durationInFrames={outro}>
        <TopBar totalFrames={outro} finalHour={false} ep={6} fromMin={72 * 60} toMin={72 * 60 + 59} />
      </Sequence>
      <Sequence from={outro}>
        <TopBar totalFrames={1} finalHour ep={6} finalLabel="DAY 7" />
      </Sequence>
      <Captions segments={captions} keys={KEYS} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};

export {Scene3D};
