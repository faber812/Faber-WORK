// Episode 3 — "Hour 12: why your phone dies", in the series' 3D look (lineman + Volt).
import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, Captions, FONT, gridEp1Schema, Label, LAYOUT, TopBar} from './GridEp1';
import {Box, Cam, City, clamp, COL, House, Lineman, Stage, Volt} from './three/kit';

const KEYS3 = new Set(['twelve.', 'forty', 'percent...', 'fast.', 'wi-fi', 'router', 'died', 'cell', 'backup', 'power.', 'weaker,', 'harder', 'battery.', 'everyone', 'jams.', "fcc's", 'short,', 'text', "can't.", 'twenty-four...', 'phone.', 'water.', 'four.']);

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

// ---------- 2D overlays ----------

const Battery: React.FC<{pct: number; top: number; scale?: number}> = ({pct, top, scale = 1}) => {
  const c = pct > 35 ? C.green : pct > 20 ? C.amber : C.red;
  return (
    <div style={{position: 'absolute', top, width: '100%', display: 'flex', justifyContent: 'center', scale: String(scale)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(11,16,32,0.8)', padding: '18px 32px', borderRadius: 28, border: '3px solid #2f3c70'}}>
        <div style={{position: 'relative', width: 160, height: 76, border: '7px solid #e9ecf5', borderRadius: 16}}>
          <div style={{position: 'absolute', right: -20, top: 20, width: 12, height: 26, background: '#e9ecf5', borderRadius: 4}} />
          <div style={{position: 'absolute', left: 6, top: 6, bottom: 6, width: `${(pct / 100) * 134}px`, background: c, borderRadius: 8}} />
        </div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, color: c, fontVariantNumeric: 'tabular-nums'}}>{Math.round(pct)}%</div>
      </div>
    </div>
  );
};

// ---------- 3D props ----------

const Tower: React.FC<{p: [number, number, number]; frame: number; alive: boolean; h?: number}> = ({p, frame, alive, h = 7}) => {
  const blink = alive && Math.floor((frame + p[0] * 5) / 12) % 2 === 0 ? 3 : alive ? 0.5 : 0;
  return (
    <group position={p}>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
        <Box key={i} p={[x * 0.35, h / 2, z * 0.35]} r={[z * 0.05, 0, -x * 0.05]} s={[0.12, h, 0.12]} c="#a3aed4" />
      ))}
      {[h * 0.3, h * 0.55, h * 0.8].map((y) => (
        <Box key={y} p={[0, y, 0]} s={[0.7 - y * 0.05, 0.08, 0.7 - y * 0.05]} c="#a3aed4" />
      ))}
      {[-0.28, 0.28].map((x) => (
        <Box key={x} p={[x, h * 0.88, 0.22]} s={[0.18, 0.7, 0.06]} c="#cfd5e6" />
      ))}
      <Box p={[0, h + 0.2, 0]} s={[0.32, 0.32, 0.32]} c={alive ? COL.red : '#3a2224'} e={blink} />
      {blink > 1 && <pointLight position={[0, h + 0.4, 0]} color={COL.red} intensity={4} distance={5} />}
    </group>
  );
};

const Ring: React.FC<{p: [number, number, number]; r: number; c: string; o: number; tube?: number}> = ({p, r, c, o, tube = 0.05}) => (
  <mesh position={p} rotation={[Math.PI / 2, 0, 0]}>
    <torusGeometry args={[r, tube, 8, 48]} />
    <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.5} transparent opacity={o} />
  </mesh>
);

// ---------- scenes ----------

// 1. Hook: dark city, hero staring at his phone, battery falling.
const S1: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const pct = interpolate(frame, [0, dur], [40, 36], clamp);
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 3, 1.6), ease(frame, 0, dur, 4.5, 3), ease(frame, 0, dur, 10, 7)]} target={[0, 2, -1]} />
        <Stage power={0.35} />
        <City power={0} count={110} spread={28} />
        <Lineman frame={frame} pos={[0, 0, 0]} rotY={0.25} pose={{hold: 'phone', armRx: -1.3, armR: 0.25, lookX: 0.35, phoneGlow: 1, mouth: 'frown', brows: 'worried'}} />
        <Volt frame={frame} pos={[-1.4, 2.9, -0.2]} glow={0} mood="worried" />
      </Scene3D>
      <Battery pct={pct} top={420} scale={interpolate(frame, [0, 12], [0.6, 1], {...clamp, easing: Easing.out(Easing.back(1.8))})} />
    </AbsoluteFill>
  );
};

// 2. Router: Wi-Fi rings die with the power, phone falls back to LTE.
const S2: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const CUT = 16;
  const on = frame < CUT;
  const lte = frame > dur * 0.62;
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 1.6, 0.8), 3.2, ease(frame, 0, dur, 9, 8)]} target={[-0.2, 1.7, 0]} />
        <Stage power={on ? 0.7 : 0.35} />
        <City power={0} count={50} />
        {/* table + router */}
        <Box p={[-1.2, 0.5, 0.4]} s={[1.8, 1.0, 1.0]} c="#5b4636" />
        <group position={[-1.2, 1.08, 0.4]}>
          <Box s={[0.8, 0.16, 0.5]} c="#20232c" />
          {[-0.3, 0.3].map((x) => (
            <Box key={x} p={[x, 0.4, -0.2]} r={[0, 0, x * 0.4]} s={[0.06, 0.7, 0.06]} c="#20232c" />
          ))}
          {[-0.2, 0, 0.2].map((x, i) => (
            <Box key={x} p={[x, 0.02, 0.26]} s={[0.06, 0.04, 0.02]} c={i === 2 ? COL.green : '#7cc4ff'} e={on ? 3 : 0} />
          ))}
          {[0.5, 0.85, 1.2].map((r, k) => (
            <Ring key={k} p={[0, 0.9 + k * 0.05, 0]} r={r} c="#7cc4ff" o={on ? 0.4 + 0.5 * Math.abs(Math.sin(frame / 4 + k)) : interpolate(frame, [CUT, CUT + 8], [0.8, 0], clamp)} />
          ))}
        </group>
        <Lineman frame={frame} pos={[0.7, 0, 0.2]} rotY={-0.5} pose={{hold: 'phone', armRx: -1.2, lookY: -0.4, lookX: 0.2, phoneGlow: 1, mouth: on ? 'flat' : 'frown', brows: on ? 'none' : 'worried'}} />
        <Volt frame={frame} pos={[1.6, 3.2, -0.6]} glow={on ? 1 : 0} mood={on ? 'happy' : 'shock'} />
      </Scene3D>
      <div style={{position: 'absolute', top: 400, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div style={{background: '#0d111c', color: '#e9ecf5', borderRadius: 40, padding: '18px 38px', display: 'flex', gap: 28, alignItems: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 44, border: '3px solid #2f3c70'}}>
          <span>12:{String(Math.floor(frame / 8) % 60).padStart(2, '0')}</span>
          <span style={{color: lte ? C.amber : '#7cc4ff', scale: String(lte ? interpolate(frame, [dur * 0.62, dur * 0.62 + 8], [1.6, 1], {...clamp, easing: Easing.out(Easing.back(2))}) : 1)}}>
            {lte ? 'LTE ▂▄▆' : on ? 'Wi-Fi ◠' : 'Wi-Fi ✕'}
          </span>
          <span style={{color: C.green}}>38%</span>
        </div>
      </div>
      <Label text="NO POWER = NO WI-FI" color={C.red} delay={CUT + 6} top={1250} />
    </AbsoluteFill>
  );
};

// 3. Towers: wide shot, beacons going dark one after another.
const S3: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const spots: [number, number, number][] = [[-5, 0, -6], [-1.5, 0, -10], [2.5, 0, -7], [6, 0, -11], [-7, 0, -13], [0.5, 0, -15]];
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, -0.5, 0.8), 6, ease(frame, 0, dur, 11, 10)]} target={[0, 4, -10]} />
        <Stage power={0.35} fogFar={50} />
        <City power={0} count={70} spread={28} clearRadius={7} />
        {spots.map((p, i) => (
          <Tower key={i} p={p} frame={frame} alive={frame < 8 + i * (dur / 7)} h={6 + (i % 3)} />
        ))}
      </Scene3D>
      <Label text="BACKUP RUNNING OUT" color={C.red} delay={4} top={1250} />
    </AbsoluteFill>
  );
};

// 4. Weak signal: hero holds the phone up, rings struggle toward a distant tower.
const S4: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, dur], [0, 1], clamp);
  const bars = Math.max(1, 4 - Math.floor(t * 4));
  const effort = interpolate(t, [0, 1], [0.3, 0.97]);
  const pct = interpolate(frame, [0, dur], [36, 31], clamp);
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 3.2, 2.6), 3.2, ease(frame, 0, dur, 9.5, 8.5)]} target={[-0.6, 2.8, -3]} />
        <Stage power={0.35} fogFar={45} />
        <City power={0} count={50} clearRadius={9} />
        <Tower p={[-4, 0, -14]} frame={frame} alive h={8} />
        <Lineman frame={frame} pos={[0.6, 0, 0.6]} rotY={-0.2} pose={{hold: 'phone', armRx: -2.7, armR: 0.1, lookX: -0.45, phoneGlow: 1, mouth: 'frown', brows: 'worried'}} />
        {[0, 1, 2].map((k) => {
          const p = ((frame * (0.02 + effort * 0.025) + k / 3) % 1);
          return <Ring key={k} p={[1.3 - p * 5, 3.9 + p * 2, 0.6 - p * 13]} r={0.3 + p * 1.2} c="#7cc4ff" o={(1 - p) * 0.9} tube={0.06} />;
        })}
        <Volt frame={frame} pos={[-0.8, 2.8, 0.4]} glow={0} mood="worried" />
      </Scene3D>
      <div style={{position: 'absolute', top: 390, left: 90, right: 90, fontFamily: FONT, fontWeight: 900, color: C.ink, background: 'rgba(11,16,32,0.8)', borderRadius: 26, padding: '24px 30px', border: '3px solid #2f3c70'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 36}}>
          <span>SIGNAL</span>
          <span style={{display: 'flex', gap: 8, alignItems: 'flex-end'}}>
            {[1, 2, 3, 4].map((b) => (
              <span key={b} style={{width: 18, height: 12 + b * 10, borderRadius: 4, background: b <= bars ? C.ink : '#2f3c70'}} />
            ))}
          </span>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 34, marginTop: 24}}>
          <span>PHONE WORKING</span>
          <span style={{color: effort > 0.7 ? C.red : C.amber}}>{effort > 0.7 ? 'MAX' : 'HARDER'}</span>
        </div>
        <div style={{height: 22, marginTop: 10, borderRadius: 11, background: '#2f3c70', overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${effort * 100}%`, background: effort > 0.7 ? C.red : C.amber}} />
        </div>
      </div>
      <Battery pct={pct} top={1150} scale={0.85} />
    </AbsoluteFill>
  );
};

// 5. Jam: every house calls the same tower; it overloads.
const S5: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const busy = interpolate(frame, [dur * 0.35, dur * 0.5], [0, 1], clamp);
  const homes: [number, number, number][] = [[-6, 0, -2], [-5, 0, -8], [5.5, 0, -2.5], [5, 0, -9], [-1, 0, -12]];
  const T: [number, number, number] = [0, 0, -5];
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 2, 1), 9, ease(frame, 0, dur, 11, 10)]} target={[0, 2, -5]} />
        <Stage power={0.45} fogFar={50} />
        <City power={0} count={40} clearRadius={13} />
        {homes.map((p, i) => (
          <group key={i} scale={0.55}>
            <House pos={[p[0] / 0.55, 0, p[2] / 0.55]} lit={0} rotY={Math.atan2(T[0] - p[0], T[2] - p[2])} />
          </group>
        ))}
        <Tower p={T} frame={frame} alive h={6} />
        {homes.flatMap((h, i) =>
          [0, 1].map((k) => {
            const p = ((frame * 0.03 + i * 0.17 + k * 0.5) % 1);
            const rejected = busy > 0.5 && (i + k) % 2 === 0 && p > 0.7;
            return (
              <Box key={`${i}${k}`} p={[h[0] + (T[0] - h[0]) * p, 2 + p * 3.5 + Math.sin(p * Math.PI) * 1.2, h[2] + (T[2] - h[2]) * p]} s={[0.35, 0.35, 0.35]} c={rejected ? COL.red : '#7cc4ff'} e={2} />
            );
          }),
        )}
        {[0, 1, 2].map((k) => {
          const p = ((frame + k * 12) % 36) / 36;
          return <Ring key={k} p={[T[0], 6.2, T[2]]} r={0.4 + p * 3} c={COL.red} o={busy * (1 - p)} tube={0.08} />;
        })}
      </Scene3D>
      <div style={{position: 'absolute', top: 420, width: '100%', textAlign: 'center', opacity: busy, scale: String(interpolate(busy, [0, 1], [1.4, 1]))}}>
        <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 84, color: '#fff', background: C.red, padding: '10px 34px', borderRadius: 18}}>NETWORK BUSY</span>
      </div>
    </AbsoluteFill>
  );
};

// 6. FCC tip: call fails, the text goes through. Hero relaxes.
const S6: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fail = spring({frame: frame - 6, fps, config: {damping: 12}});
  const m1 = spring({frame: frame - Math.round(dur * 0.35), fps, config: {damping: 14}});
  const m2 = spring({frame: frame - Math.round(dur * 0.55), fps, config: {damping: 14}});
  const delivered = frame > dur * 0.72;
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 0.6, 0.2), 2.8, ease(frame, 0, dur, 7, 6.4)]} target={[-0.6, 2, 0]} />
        <Stage power={0.35} />
        <City power={0} count={50} />
        <Lineman frame={frame} pos={[0.9, 0, 0]} rotY={-0.4} pose={{hold: 'phone', armRx: -1.3, lookX: 0.3, lookY: -0.2, phoneGlow: 1, mouth: delivered ? 'smile' : 'flat', brows: delivered ? 'up' : 'worried'}} />
        <Volt frame={frame} pos={[1.7, 3.3, -0.8]} glow={delivered ? 0.4 : 0} mood={delivered ? 'happy' : 'worried'} />
      </Scene3D>
      <div style={{position: 'absolute', left: 70, top: 380, width: 520, height: 820, borderRadius: 60, background: '#0d111c', padding: 22, border: '3px solid #2f3c70', boxShadow: '0 30px 80px rgba(0,0,0,0.5)'}}>
        <div style={{width: '100%', height: '100%', borderRadius: 42, background: '#f3f2ee', position: 'relative', overflow: 'hidden', fontFamily: FONT}}>
          <div style={{position: 'absolute', top: 30, width: '100%', textAlign: 'center', fontWeight: 900, fontSize: 28, color: '#1f2937'}}>Mom</div>
          <div style={{position: 'absolute', top: 90, left: 30, right: 30, padding: '16px 20px', borderRadius: 22, background: C.red, color: '#fff', fontWeight: 900, fontSize: 30, textAlign: 'center', scale: String(fail), opacity: interpolate(frame, [dur * 0.3, dur * 0.4], [1, 0.35], clamp)}}>📞 Call failed</div>
          <div style={{position: 'absolute', top: 250, left: 26, maxWidth: 360, padding: '18px 22px', borderRadius: '26px 26px 26px 8px', background: '#e1e4ea', color: '#1f2937', fontWeight: 600, fontSize: 32, scale: String(m1), transformOrigin: 'left bottom'}}>Are you OK??</div>
          <div style={{position: 'absolute', top: 380, right: 26, maxWidth: 380, padding: '18px 22px', borderRadius: '26px 26px 8px 26px', background: '#2f80ed', color: '#fff', fontWeight: 600, fontSize: 32, scale: String(m2), transformOrigin: 'right bottom'}}>Power's out. Phone at 30%. We're fine.</div>
          <div style={{position: 'absolute', top: 560, right: 30, fontWeight: 900, fontSize: 24, color: '#2f9a55', opacity: delivered ? 1 : 0}}>Delivered ✓</div>
        </div>
      </div>
      <Label text="TEXT, DON'T CALL" color={C.amber} delay={Math.round(dur * 0.45)} top={1250} />
    </AbsoluteFill>
  );
};

// 7. Outro: the camera finds the water tower. "Part 4".
const S7: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 25, fps, config: {damping: 12}});
  const level = interpolate(frame, [0, dur], [0.7, 0.55], clamp);
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 4, 2.5), ease(frame, 0, dur, 3.5, 5.5), ease(frame, 0, dur, 11, 9.5)]} target={[-1.5, 4.2, -4]} />
        <Stage power={0.3} />
        <City power={0} count={60} clearRadius={8} />
        <group position={[-1.5, 0, -4]}>
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => (
            <Box key={i} p={[a * 0.9, 2.5, b * 0.9]} s={[0.2, 5, 0.2]} c="#6a76a0" />
          ))}
          <mesh position={[0, 6, 0]}>
            <cylinderGeometry args={[1.8, 1.8, 2.2, 24]} />
            <meshStandardMaterial color="#8d97b8" transparent opacity={0.55} />
          </mesh>
          <mesh position={[0, 4.9 + 1.1 * level, 0]}>
            <cylinderGeometry args={[1.7, 1.7, 2.1 * level, 24]} />
            <meshStandardMaterial color="#3a8dde" emissive="#3a8dde" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 7.4, 0]}>
            <coneGeometry args={[1.95, 0.7, 24]} />
            <meshStandardMaterial color="#6a76a0" />
          </mesh>
        </group>
        <Lineman frame={frame} pos={[1.8, 0, 0.6]} rotY={Math.PI + 0.5} pose={{hold: 'flashlight', armRx: -1.6, lookX: -0.4}} />
        <spotLight position={[1.6, 2, 1]} angle={0.35} penumbra={0.5} intensity={30} distance={14} color="#fff3cf" target-position={[-1.5, 5, -4]} />
        <Volt frame={frame} pos={[3.0, 2.9, 0.2]} glow={0} mood="shock" />
      </Scene3D>
      <div style={{position: "absolute", top: 960, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 110, color: "#7cc4ff", scale: String(s), textShadow: '0 0 50px rgba(124,196,255,0.6)'}}>
        💧 PART 4 →
      </div>
    </AbsoluteFill>
  );
};

export const GridEp3_3D: React.FC<gridEp1Schema> = ({segments, captions, audio}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const f = (sec: number) => Math.round(sec * fps);
  const starts = segments.map((s) => f(s.start));
  const bounds = segments.map((_, i) => [i === 0 ? 0 : starts[i], i + 1 < segments.length ? starts[i + 1] : durationInFrames]);
  const scenes = [S1, S2, S3, S4, S5, S6, S7];
  const outro = bounds[bounds.length - 1][0];
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
      <Sequence from={0} durationInFrames={outro}>
        <TopBar totalFrames={outro} finalHour={false} ep={3} fromMin={720} toMin={779} />
      </Sequence>
      <Sequence from={outro}>
        <TopBar totalFrames={1} finalHour ep={3} finalLabel="HOUR 24" />
      </Sequence>
      <Captions segments={captions} keys={KEYS3} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
