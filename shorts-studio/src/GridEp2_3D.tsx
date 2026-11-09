import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, Captions, FONT, gridEp1Schema, Label, LAYOUT, TopBar} from './GridEp1';
import {Box, Cam, City, clamp, COL, Lineman, Stage, Volt} from './three/kit';

const KEYS2 = new Set([
  'six.', 'still', 'down.', 'fridge', 'usda', '40°f', 'two', 'hours...', 'throw', 'freezer', '48', 'hours.', '24.',
  'vanish.', 'four', 'running', 'out.', 'dark.', 'all-way', 'stop.', 'tap', 'gravity,', "day's", 'power.', 'twelve...', 'phone', 'three.',
]);

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

const RedX: React.FC<{p: [number, number, number]; k: number}> = ({p, k}) => (
  <group position={p} scale={k}>
    <Box r={[0, 0, 0.785]} s={[0.9, 0.12, 0.05]} c={COL.red} e={1} />
    <Box r={[0, 0, -0.785]} s={[0.9, 0.12, 0.05]} c={COL.red} e={1} />
  </group>
);

// 1. Hook: dark city, a few candle-lit windows, hero with flashlight.
const S1: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const flick = 0.7 + 0.3 * Math.abs(Math.sin(frame / 3.3) * Math.sin(frame / 1.7));
  const candles: [number, number, number][] = [
    [-4, 3.2, -6],
    [3.5, 2.4, -7],
    [-1.5, 5.1, -11],
    [5.5, 4.2, -10],
  ];
  return (
    <Scene3D>
      <Cam pos={[ease(frame, 0, dur, 3, 1), ease(frame, 0, dur, 6, 3.4), ease(frame, 0, dur, 14, 9)]} target={[0, 2.2, -3]} />
      <Stage power={0} fogFar={50} />
      <City power={0} count={120} spread={28} />
      {candles.map((p, i) => (
        <group key={i} position={p}>
          <Box s={[0.35, 0.35, 0.05]} c={COL.amber} e={1.8 * flick} />
          <pointLight color={COL.amber} intensity={3 * flick} distance={3} />
        </group>
      ))}
      <Lineman frame={frame} pos={[0, 0, 0]} rotY={0.3} pose={{hold: 'flashlight', armRx: -1.2, lookY: -0.2, brows: 'worried', mouth: 'flat'}} />
      <spotLight position={[0.8, 1.8, 0.8]} angle={0.4} penumbra={0.5} intensity={25} distance={14} color="#fff3cf" target-position={[2, 0.5, 8]} />
      <Volt frame={frame} pos={[-1.3, 2.9, 0.2]} glow={0} mood="worried" />
    </Scene3D>
  );
};

// 2. Fridge: thermometer climbs past 40F, milk/meat/eggs get crossed out.
const S2: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const temp = interpolate(frame, [0, dur * 0.55], [36, 47], clamp);
  const level = interpolate(temp, [30, 55], [0.1, 0.95], clamp);
  const hot = temp >= 40;
  const xs = [0.78, 0.83, 0.88].map((t) => spring({frame: frame - Math.round(dur * t), fps, config: {damping: 12}}));
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 1.2, 0.6), 3.0, ease(frame, 0, dur, 9.2, 8.2)]} target={[0.2, 1.8, 0]} />
        <Stage power={0.15} />
        <City power={0} count={50} />
        {/* open fridge */}
        <group position={[-1.6, 0, -0.8]}>
          <Box p={[0, 1.6, 0]} s={[1.5, 3.2, 1.2]} c="#dfe5f2" />
          <Box p={[0, 1.6, 0.55]} s={[1.3, 3.0, 0.1]} c="#151b30" />
          <Box p={[0.95, 1.6, 0.9]} r={[0, -1.2, 0]} s={[1.5, 3.1, 0.1]} c="#e9edf6" />
          {[0.9, 1.7, 2.5].map((y) => (
            <Box key={y} p={[0, y, 0.3]} s={[1.25, 0.04, 0.6]} c="#9fb2c8" />
          ))}
        </group>
        {/* counter with food */}
        <Box p={[0.8, 0.55, 0.6]} s={[2.6, 1.1, 1.0]} c="#3a2c22" />
        <Box p={[0.8, 1.13, 0.6]} s={[2.7, 0.06, 1.1]} c="#5b4636" />
        <group position={[0, 1.16, 0.7]}>
          <Box p={[0, 0.3, 0]} s={[0.35, 0.6, 0.35]} c={xs[0] > 0.5 ? '#9aa0ad' : '#f2f5fb'} />
          <Box p={[0, 0.65, 0]} s={[0.36, 0.12, 0.2]} c="#4e7fff" />
          <RedX p={[0, 0.4, 0.3]} k={xs[0]} />
        </group>
        <group position={[0.8, 1.16, 0.7]}>
          <Box p={[0, 0.1, 0]} s={[0.6, 0.2, 0.42]} c={xs[1] > 0.5 ? '#7a5a5a' : '#c44a4a'} />
          <Box p={[0.12, 0.21, 0.05]} s={[0.18, 0.02, 0.18]} c="#f2d6c9" />
          <RedX p={[0, 0.35, 0.3]} k={xs[1]} />
        </group>
        <group position={[1.6, 1.16, 0.7]}>
          {[-0.15, 0, 0.15].map((x) => (
            <mesh key={x} position={[x, 0.12, 0]} scale={[1, 1.25, 1]} castShadow>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color={xs[2] > 0.5 ? '#a99f92' : '#f2e2c4'} />
            </mesh>
          ))}
          <RedX p={[0, 0.35, 0.3]} k={xs[2]} />
        </group>
        <Lineman frame={frame} pos={[1.7, 0, -1.4]} rotY={-0.6} pose={{lookY: -0.3, lookX: 0.2, mouth: 'frown', brows: 'worried'}} />
        <Volt frame={frame} pos={[-0.2, 3.5, -0.8]} glow={0} mood="worried" />
      </Scene3D>
      {/* 2D thermometer readout */}
      <div style={{position: 'absolute', top: 360, right: 80, fontFamily: FONT, fontWeight: 900, textAlign: 'right'}}>
        <div style={{fontSize: 120, color: hot ? C.red : '#7cc4ff', lineHeight: 1}}>{Math.round(temp)}°F</div>
        <div style={{width: 260, height: 26, marginTop: 14, marginLeft: 'auto', borderRadius: 13, background: '#1e284d', overflow: 'hidden'}}>
          <div style={{width: `${level * 100}%`, height: '100%', background: hot ? C.red : '#7cc4ff'}} />
        </div>
        <div style={{fontSize: 34, color: C.amber, marginTop: 10}}>SAFE LINE: 40°F</div>
      </div>
    </AbsoluteFill>
  );
};

// 3. Freezer: chest freezer + 2D bars 48h / 24h.
const Bar: React.FC<{label: string; hours: number; y: number; delay: number}> = ({label, hours, y, delay}) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [delay, delay + 30], [0, hours / 48], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{position: 'absolute', left: 110, top: y, width: 860, fontFamily: FONT, opacity: interpolate(frame, [delay - 6, delay], [0, 1], clamp)}}>
      <div style={{display: 'flex', justifyContent: 'space-between', color: C.ink, fontWeight: 900, fontSize: 50, marginBottom: 14, textShadow: '0 4px 16px #000'}}>
        <span>{label}</span>
        <span style={{color: C.amber}}>~{hours} HRS</span>
      </div>
      <div style={{height: 70, borderRadius: 35, background: 'rgba(30,40,77,0.85)', border: '5px solid #2f3c70', overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${100 * fill}%`, background: 'linear-gradient(90deg, #58a6ff, #a8d4ff)', borderRadius: 35}} />
      </div>
    </div>
  );
};
const S3: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const lid = ease(frame, 0, 20, -0.9, 0);
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 1.8, 1.0), 3.6, ease(frame, 0, dur, 9.0, 8.0)]} target={[0.2, 1.5, 0]} />
        <Stage power={0.15} />
        <City power={0} count={50} />
        <group position={[-0.6, 0, 0]}>
          <Box p={[0, 0.6, 0]} s={[2.4, 1.2, 1.2]} c="#e6ebf5" />
          <group position={[0, 1.2, -0.6]} rotation={[lid, 0, 0]}>
            <Box p={[0, 0.04, 0.6]} s={[2.4, 0.08, 1.2]} c="#f4f7fc" />
          </group>
          {[-0.6, 0, 0.6].map((x) => (
            <Box key={x} p={[x, 1.1, 0]} s={[0.4, 0.25, 0.4]} c="#cfe6ff" e={0.25} />
          ))}
        </group>
        <Lineman frame={frame} pos={[1.3, 0, -0.6]} rotY={-0.5} pose={{lookY: -0.4, armL: 0.3, mouth: 'smile', brows: 'up'}} />
        <Volt frame={frame} pos={[2.2, 3.2, -0.9]} glow={0.25} mood="happy" />
      </Scene3D>
      <Bar label="FULL FREEZER" hours={48} y={330} delay={Math.round(dur * 0.3)} />
      <Bar label="HALF FULL" hours={24} y={530} delay={Math.round(dur * 0.72)} />
      <Label text="KEEP THE LID SHUT" delay={20} top={1250} />
    </AbsoluteFill>
  );
};

// 4. Towers: cell towers across the city, red beacons going out.
const MiniTower: React.FC<{p: [number, number, number]; on: boolean; frame: number; h?: number}> = ({p, on, frame, h = 6}) => {
  const blink = on && Math.floor((frame + p[0] * 7) / 15) % 2 === 0 ? 2.5 : on ? 0.6 : 0;
  return (
    <group position={p}>
      <Box p={[0, h / 2, 0]} s={[0.18, h, 0.18]} c="#6a76a0" />
      <Box p={[0, h * 0.8, 0.12]} s={[0.5, 0.6, 0.06]} c="#cfd5e6" />
      <Box p={[0, h + 0.1, 0]} s={[0.42, 0.42, 0.42]} c={on ? COL.red : '#3a2224'} e={blink} />
      {on && <pointLight position={[0, h + 0.3, 0]} color={COL.red} intensity={blink * 2.5} distance={4} />}
    </group>
  );
};
const S4: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const spots: [number, number, number][] = [
    [-6, 0, -6], [-2.5, 0, -9], [1.5, 0, -7], [5, 0, -10], [-8, 0, -13], [7.5, 0, -6], [-4, 0, -15], [3, 0, -14], [9, 0, -15], [0, 0, -18],
  ];
  const offFrac = interpolate(frame, [dur * 0.25, dur * 0.95], [0, 0.9], clamp);
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 0, 1.5), ease(frame, 0, dur, 4.5, 6), ease(frame, 0, dur, 9, 8)]} target={[0, 3, -8]} />
        <Stage power={0} fogFar={45} />
        <City power={0} count={70} spread={28} clearRadius={7} />
        {spots.map((p, i) => (
          <MiniTower key={i} p={p} frame={frame} on={((i * 37) % 10) / 10 >= offFrac} h={5 + (i % 3)} />
        ))}
      </Scene3D>
      <Label text="MIN. BACKUP: ~4 HRS" delay={Math.round(dur * 0.35)} top={1250} />
    </AbsoluteFill>
  );
};

// 5. Traffic: dark signal, stop sign pops up, cars waiting.
const Car: React.FC<{p: [number, number, number]; r?: number; c: string}> = ({p, r = 0, c}) => (
  <group position={p} rotation={[0, r, 0]}>
    <Box p={[0, 0.35, 0]} s={[1.0, 0.45, 2.0]} c={c} />
    <Box p={[0, 0.75, -0.1]} s={[0.85, 0.4, 1.1]} c={c} />
    <Box p={[0, 0.75, 0.46]} s={[0.8, 0.32, 0.02]} c="#9fc4ff" e={0.1} />
    {[-0.5, 0.5].map((x) => [-0.65, 0.65].map((z) => <Box key={`${x}${z}`} p={[x, 0.15, z]} s={[0.12, 0.3, 0.3]} c="#111" />))}
    <Box p={[-0.3, 0.38, 1.01]} s={[0.2, 0.1, 0.02]} c="#fff6d8" e={2} />
    <Box p={[0.3, 0.38, 1.01]} s={[0.2, 0.1, 0.02]} c="#fff6d8" e={2} />
  </group>
);
const S5: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sign = spring({frame: frame - Math.round(dur * 0.4), fps, config: {damping: 10}});
  const lightOn = frame < 12;
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 6, 5), ease(frame, 0, dur, 5, 4.4), ease(frame, 0, dur, 11, 10)]} target={[0, 1.6, 0]} />
        <Stage power={0} />
        <City power={0} count={60} clearRadius={8} />
        {/* road */}
        <Box p={[0, 0.02, 0]} s={[3.4, 0.02, 30]} c="#1a1f30" />
        <Box p={[0, 0.02, 0]} s={[30, 0.02, 3.4]} c="#1a1f30" />
        {/* signal */}
        <group position={[-2.2, 0, 2.2]}>
          <Box p={[0, 2, 0]} s={[0.18, 4, 0.18]} c="#2f3c70" />
          <Box p={[0.6, 3.9, 0]} s={[1.3, 0.14, 0.14]} c="#2f3c70" />
          <Box p={[1.2, 3.4, 0]} s={[0.5, 1.3, 0.4]} c="#1e284d" />
          {[COL.red, COL.amber, COL.green].map((col, i) => (
            <Box key={i} p={[1.2, 3.8 - i * 0.4, 0.21]} s={[0.28, 0.28, 0.02]} c={lightOn && i === 2 ? col : '#151b30'} e={lightOn && i === 2 ? 2 : 0} />
          ))}
        </group>
        {/* stop sign */}
        <group position={[1.9, 0, 1.9]} scale={sign}>
          <Box p={[0, 1.2, 0]} s={[0.1, 2.4, 0.1]} c="#9aa3bd" />
          <mesh position={[0, 2.6, 0.06]} rotation={[Math.PI / 2, Math.PI / 8, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 0.06, 8]} />
            <meshStandardMaterial color="#d9342b" emissive="#d9342b" emissiveIntensity={0.4} />
          </mesh>
        </group>
        <Car p={[0.8, 0, 4.5]} c="#4e7fff" />
        <Car p={[-4.5, 0, 0.8]} r={Math.PI / 2} c="#d6a23a" />
        <Car p={[-0.8, 0, -4.5]} r={Math.PI} c="#c44a4a" />
        <Lineman frame={frame} pos={[3.3, 0, 0.2]} rotY={-0.4} pose={{armR: 1.4, lookY: 0.3, mouth: 'flat', brows: 'up'}} />
        <Volt frame={frame} pos={[4.3, 2.9, -0.4]} glow={0} mood="worried" />
      </Scene3D>
      <Label text="ALL-WAY STOP" color={C.red} delay={Math.round(dur * 0.55)} top={1250} />
    </AbsoluteFill>
  );
};

// 6. Water: tower drains, pump house dead.
const S6: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const level = interpolate(frame, [0, dur], [0.95, 0.5], clamp);
  const x = spring({frame: frame - Math.round(dur * 0.68), fps, config: {damping: 12}});
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 3, 2), ease(frame, 0, dur, 3, 4), ease(frame, 0, dur, 11, 10)]} target={[-0.5, 3.4, -2]} />
        <Stage power={0} />
        <City power={0} count={60} clearRadius={8} />
        <group position={[-1.5, 0, -3]}>
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => (
            <Box key={i} p={[a * 0.9, 2.5, b * 0.9]} s={[0.2, 5, 0.2]} c="#6a76a0" />
          ))}
          <mesh position={[0, 6, 0]} castShadow>
            <cylinderGeometry args={[1.8, 1.8, 2.2, 24]} />
            <meshStandardMaterial color="#8d97b8" transparent opacity={0.55} />
          </mesh>
          <mesh position={[0, 4.9 + 1.1 * level, 0]}>
            <cylinderGeometry args={[1.7, 1.7, 2.1 * level, 24]} />
            <meshStandardMaterial color="#3a8dde" emissive="#3a8dde" emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[0, 7.4, 0]} castShadow>
            <coneGeometry args={[1.95, 0.7, 24]} />
            <meshStandardMaterial color="#6a76a0" />
          </mesh>
        </group>
        {/* pump house */}
        <group position={[2.6, 0, -1.5]}>
          <Box p={[0, 0.7, 0]} s={[1.8, 1.4, 1.4]} c="#2f3c70" />
          <Box p={[-1.6, 0.25, 0]} s={[1.6, 0.25, 0.25]} c="#5a668f" />
          <RedX p={[0, 1.0, 0.75]} k={x} />
        </group>
        <Lineman frame={frame} pos={[-0.4, 0, 2.2]} rotY={-0.2} pose={{lookY: -0.5, lookX: -0.25, mouth: 'flat', brows: 'worried'}} />
        <Volt frame={frame} pos={[-1.5, 3, 1.8]} glow={0} mood="worried" />
      </Scene3D>
      <Label text="~1 DAY SUPPLY" delay={Math.round(dur * 0.3)} top={1250} />
    </AbsoluteFill>
  );
};

// 7. Outro: hero stares at a dying phone.
const S7: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 25, fps, config: {damping: 12}});
  const glow = Math.floor(frame / 10) % 2 === 0 ? 0.6 : 0.15;
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 1.8, 1.2), 2.9, ease(frame, 0, dur, 6.5, 5.6)]} target={[0, 2.3, 0]} />
        <Stage power={0} />
        <City power={0} count={60} />
        <Lineman frame={frame} pos={[0, 0, 0]} rotY={0.2} pose={{hold: 'phone', armRx: -1.3, armR: 0.25, lookX: 0.35, phoneGlow: glow, mouth: 'o', brows: 'worried'}} />
        <Volt frame={frame} pos={[-1.4, 3, -0.4]} glow={0} mood="shock" />
      </Scene3D>
      <div style={{position: 'absolute', top: 1330 + LAYOUT.labelShift * 2, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 110, color: C.red, transform: `scale(${s})`, textShadow: `0 0 60px ${C.red}88`}}>
        PART 3 →
      </div>
    </AbsoluteFill>
  );
};

export const GridEp2_3D: React.FC<gridEp1Schema> = ({segments, captions, audio}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const f = (sec: number) => Math.round(sec * fps);
  const starts = segments.map((s) => f(s.start));
  const bounds = segments.map((_, i) => [i === 0 ? 0 : starts[i], i + 1 < segments.length ? starts[i + 1] : durationInFrames]);
  const scenes = [S1, S2, S3, S4, S5, S6, S7];
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
      <AbsoluteFill style={{background: 'linear-gradient(rgba(11,16,32,0.85) 0%, rgba(11,16,32,0) 18%, rgba(11,16,32,0) 70%, rgba(11,16,32,0.9) 100%)'}} />
      <Sequence from={0} durationInFrames={outroStart}>
        <TopBar totalFrames={outroStart} finalHour={false} ep={2} fromMin={360} toMin={419} />
      </Sequence>
      <Sequence from={outroStart}>
        <TopBar totalFrames={1} finalHour ep={2} finalLabel="HOUR 12" />
      </Sequence>
      <Captions segments={captions} keys={KEYS2} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
