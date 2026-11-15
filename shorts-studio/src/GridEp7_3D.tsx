// Episode 7 — "The fridge mistake after the blackout". Rules from the research:
// consequence-first opening line, hour shown on screen only, bright daytime look.
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, Captions, FONT, gridEp1Schema, LAYOUT, TopBar} from './GridEp1';
import {Box, Cam, clamp, COL, Lineman, Volt} from './three/kit';
import {Big, Cottage, Day, ease, HOOK_FRAMES, Pine, Room, Scene3D, SKY} from './GridEp6_3D';

const RedX: React.FC<{p: [number, number, number]; k: number; size?: number}> = ({p, k, size = 0.9}) => (
  <group position={p} scale={k}>
    <Box r={[0, 0, 0.785]} s={[size, size * 0.16, 0.06]} c="#d81e1e" e={0.15} />
    <Box r={[0, 0, -0.785]} s={[size, size * 0.16, 0.06]} c="#d81e1e" e={0.15} />
  </group>
);

// fridge: closed, or open with shelves of food; `spoiled` greys the food
const Fridge: React.FC<{p: [number, number, number]; open: number; spoiled?: number; hum?: boolean; frame: number}> = ({p, open, spoiled = 0, hum = false, frame}) => {
  const mix = (a: string, b: string) => (spoiled > 0.5 ? b : a);
  const wob = hum ? Math.sin(frame * 1.7) * 0.004 : 0;
  return (
    <group position={[p[0] + wob, p[1], p[2]]}>
      {/* hollow body: back, sides, top, bottom */}
      <Box p={[0, 1.6, -0.55]} s={[1.6, 3.2, 0.1]} c="#8fa4bf" />
      <Box p={[-0.75, 1.6, 0]} s={[0.1, 3.2, 1.2]} c="#8fa4bf" />
      <Box p={[0.75, 1.6, 0]} s={[0.1, 3.2, 1.2]} c="#8fa4bf" />
      <Box p={[0, 3.15, 0]} s={[1.6, 0.1, 1.2]} c="#8fa4bf" />
      <Box p={[0, 0.05, 0]} s={[1.6, 0.1, 1.2]} c="#8fa4bf" />
      <Box p={[0, 1.6, -0.48]} s={[1.4, 3.0, 0.04]} c="#eef3fa" />
      {[0.9, 1.7, 2.5].map((y) => (
        <Box key={y} p={[0, y, 0.3]} s={[1.35, 0.04, 0.6]} c="#c9d6e6" />
      ))}
      {/* food */}
      <Box p={[-0.35, 1.95, 0.35]} s={[0.3, 0.45, 0.3]} c={mix('#ffffff', '#a8a8a0')} />
      <Box p={[0.3, 1.82, 0.35]} s={[0.5, 0.2, 0.35]} c={mix('#d9534f', '#7a5a5a')} />
      {[-0.4, -0.25, -0.1].map((x) => (
        <Box key={x} p={[x, 1.02, 0.35]} s={[0.12, 0.16, 0.12]} c={mix('#f4e3c4', '#a99f92')} />
      ))}
      <Box p={[0.3, 1.02, 0.35]} s={[0.45, 0.2, 0.35]} c={mix('#7d9a5a', '#6b6b5a')} />
      <Box p={[0, 2.7, 0.35]} s={[0.9, 0.25, 0.35]} c={mix('#f1c40f', '#8f8a6a')} />
      {/* door (hinged on the right) */}
      <group position={[0.8, 0, 0.62]} rotation={[0, open * 1.9, 0]}>
        <Box p={[-0.8, 1.6, 0]} s={[1.6, 3.1, 0.1]} c="#a9bbd2" />
        <Box p={[-1.45, 2.2, 0.08]} s={[0.08, 0.7, 0.06]} c="#9aa3b5" />
      </group>
      {hum && <pointLight position={[0, 2, 1]} color="#e8f4ff" intensity={open * 1.5} distance={3} />}
    </group>
  );
};

// -------- hook: power back on, fridge hums, a sick-face icon pops --------
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [0, 5], [1.08, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, HOOK_FRAMES, 1.4, 0.8), 2.9, ease(frame, 0, HOOK_FRAMES, 8, 7)]} target={[0, 1.8, 0]} />
        <Room>
          <Fridge p={[-1.2, 0, -1.6]} open={1} hum frame={frame} />
        </Room>
        <Lineman frame={frame} pos={[1.0, 0, 0.3]} rotY={-0.6} pose={{hold: 'card', armRx: -1.2, mouth: 'smile', brows: 'up'}} />
        <Volt frame={frame} pos={[2.0, 3.1, -0.4]} glow={1} mood="shock" />
      </Scene3D>
      <div style={{position: 'absolute', top: 400, left: 50, right: 50, textAlign: 'center', scale: String(k), fontFamily: FONT, fontWeight: 900, lineHeight: 1.05}}>
        <div style={{display: 'inline-block', fontSize: 88, color: '#fff', background: 'rgba(11,16,32,0.9)', padding: '4px 26px', borderRadius: 16}}>POWER'S BACK.</div>
        <br />
        <div style={{display: 'inline-block', marginTop: 14, fontSize: 88, color: '#fff', background: '#d81e1e', padding: '4px 28px', borderRadius: 16}}>NOW YOU GET SICK</div>
      </div>
    </AbsoluteFill>
  );
};

// 1. Street: daylight, houses light up again, hero relieved
const S1: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const lit = frame > dur * 0.25 ? 1 : 0;
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 1.6, 0.6), 3.4, ease(frame, 0, dur, 11, 9.5)]} target={[0, 2, -2]} />
        <Day frame={frame} snow={false} />
        <Cottage p={[-3, 0, -3]} lit={lit} />
        <Cottage p={[2.6, 0, -4.5]} lit={lit} color="#4f86b8" />
        <Pine p={[6, 0, -6]} />
        <Pine p={[-6.5, 0, -6]} s={1.2} />
        <Lineman frame={frame} pos={[0.2, 0, 0.8]} rotY={0.1} pose={{armL: 2.6, armR: 2.6, mouth: 'smile', brows: 'up'}} />
        <Volt frame={frame} pos={[1.4, 3.0, 0.4]} glow={1} mood="happy" />
      </Scene3D>
      <Big text="⚡ POWER'S BACK" color={C.amber} top={420} delay={Math.round(dur * 0.25)} size={84} />
    </AbsoluteFill>
  );
};

// 2. Kitchen: fridge hums, hero reaches for food — "that's the mistake"
const S2: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const open = interpolate(frame, [4, 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const reach = interpolate(frame, [Math.round(dur * 0.35), Math.round(dur * 0.55)], [0, 1], clamp);
  const x = spring({frame: frame - Math.round(dur * 0.72), fps, config: {damping: 11}});
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 1.2, 0.6), 3.0, ease(frame, 0, dur, 8.6, 7.8)]} target={[-0.2, 1.8, 0]} />
        <Room>
          <Fridge p={[-1.3, 0, -1.6]} open={open} hum frame={frame} />
          <RedX p={[-1.3, 2.0, -0.6]} k={x} size={1.8} />
        </Room>
        <Lineman frame={frame} pos={[0.9 - reach * 0.4, 0, 0.1]} rotY={-0.9} pose={{armRx: -1.4 * reach, mouth: 'smile', lookY: -0.3}} />
        <Volt frame={frame} pos={[1.9, 3.1, -0.5]} glow={1} mood={x > 0.5 ? 'shock' : 'happy'} />
      </Scene3D>
      <Big text="THAT'S THE MISTAKE" color={C.red} top={420} delay={Math.round(dur * 0.72)} size={76} />
    </AbsoluteFill>
  );
};

// 3. The 4-hour rule: clock ring + food crossed out
const S3: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const hours = interpolate(frame, [0, dur * 0.45], [0, 4], clamp);
  const spoiled = frame > dur * 0.55 ? 1 : 0;
  const xs = [0.6, 0.66, 0.72, 0.78].map((t) => spring({frame: frame - Math.round(dur * t), fps, config: {damping: 12}}));
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 0.4, -0.2), 2.6, ease(frame, 0, dur, 7.2, 6.4)]} target={[-1.2, 1.7, -1.6]} />
        <Room>
          <Fridge p={[-1.2, 0, -1.6]} open={1} spoiled={spoiled} frame={frame} />
          <RedX p={[-1.55, 1.95, -1.0]} k={xs[0]} size={0.5} />
          <RedX p={[-0.9, 1.82, -1.0]} k={xs[1]} size={0.6} />
          <RedX p={[-1.45, 1.02, -1.0]} k={xs[2]} size={0.5} />
          <RedX p={[-0.9, 1.02, -1.0]} k={xs[3]} size={0.5} />
        </Room>
        <Volt frame={frame} pos={[0.6, 3.0, -0.6]} glow={1} mood="worried" />
      </Scene3D>
      <div style={{position: 'absolute', top: 400, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div style={{background: 'rgba(11,16,32,0.88)', borderRadius: 26, padding: '18px 36px', display: 'flex', alignItems: 'center', gap: 26}}>
          <svg width={110} height={110} viewBox="0 0 110 110">
            <circle cx={55} cy={55} r={46} stroke="#2f3c70" strokeWidth={12} fill="none" />
            <circle cx={55} cy={55} r={46} stroke={hours >= 4 ? C.red : C.amber} strokeWidth={12} fill="none" strokeDasharray={289} strokeDashoffset={289 * (1 - hours / 4)} transform="rotate(-90 55 55)" strokeLinecap="round" />
          </svg>
          <div style={{fontFamily: FONT, fontWeight: 900, color: '#fff', lineHeight: 1}}>
            <div style={{fontSize: 96, color: hours >= 4 ? C.red : '#fff', fontVariantNumeric: 'tabular-nums'}}>{hours.toFixed(1)} HRS</div>
            <div style={{fontSize: 30, color: C.amber, marginTop: 8, letterSpacing: 2}}>USDA LIMIT: ~4 HOURS</div>
          </div>
        </div>
      </div>
      <Big text="MEAT · MILK · EGGS · LEFTOVERS" color={C.red} top={590} delay={Math.round(dur * 0.58)} size={66} />
    </AbsoluteFill>
  );
};

// 4. Freezer: ice crystals = OK to refreeze
const S4: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ok = spring({frame: frame - Math.round(dur * 0.45), fps, config: {damping: 11}});
  const lid = interpolate(frame, [0, 14], [0, -0.9], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 1.2, 0.6), 4.0, ease(frame, 0, dur, 7.4, 6.6)]} target={[0, 1.0, -0.4]} />
        <Room>
          <group position={[-0.4, 0, -0.6]}>
            <Box p={[0, 0.6, 0]} s={[2.4, 1.2, 1.2]} c="#8fa4bf" />
            <group position={[0, 1.2, -0.6]} rotation={[lid, 0, 0]}>
              <Box p={[0, 0.04, 0.6]} s={[2.4, 0.08, 1.2]} c="#a9bbd2" />
            </group>
            {[-0.6, 0, 0.6].map((x) => (
              <group key={x}>
                <Box p={[x, 1.1, 0]} s={[0.45, 0.25, 0.45]} c="#cfe6ff" e={0.25} />
                {[0, 1, 2, 3].map((k) => (
                  <Box key={k} p={[x - 0.15 + k * 0.1, 1.25, -0.1 + (k % 2) * 0.2]} r={[0.6, 0.6, 0]} s={[0.06, 0.06, 0.06]} c="#ffffff" e={1.2} />
                ))}
              </group>
            ))}
          </group>
          <group position={[-0.4, 2.3, -0.6]} scale={ok}>
            <Box p={[-0.18, -0.1, 0]} r={[0, 0, 0.785]} s={[0.4, 0.13, 0.06]} c="#2e9e5b" e={0.2} />
            <Box p={[0.15, 0.05, 0]} r={[0, 0, -0.9]} s={[0.75, 0.13, 0.06]} c="#2e9e5b" e={0.2} />
          </group>
        </Room>
        <Lineman frame={frame} pos={[1.8, 0, 0.2]} rotY={-0.6} pose={{lookY: -0.4, lookX: 0.3, mouth: 'smile', brows: 'up'}} />
      </Scene3D>
      <Big text="ICE CRYSTALS = OK TO REFREEZE" color={COL.green} top={420} delay={Math.round(dur * 0.45)} size={58} />
    </AbsoluteFill>
  );
};

// 5. Never taste — throw it out
const S5: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const toss = interpolate(frame, [Math.round(dur * 0.6), Math.round(dur * 0.85)], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const no = spring({frame: frame - 6, fps, config: {damping: 11}});
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 1.4, 0.6), 3.0, ease(frame, 0, dur, 8, 7.2)]} target={[0, 1.6, 0]} />
        <Room>
          {/* trash can */}
          <group position={[-1.6, 0, -0.6]}>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.55, 0.45, 1.2, 20]} />
              <meshStandardMaterial color="#5a6b7d" />
            </mesh>
            <mesh position={[0, 1.22, 0]}>
              <cylinderGeometry args={[0.58, 0.58, 0.06, 20]} />
              <meshStandardMaterial color="#3e4a57" />
            </mesh>
          </group>
          {/* food box flying into the can */}
          <Box p={[0.6 - 2.2 * toss, 1.6 + Math.sin(toss * Math.PI) * 1.2 - toss * 0.4, -0.2 - 0.4 * toss]} r={[toss * 4, toss * 3, 0]} s={[0.45, 0.25, 0.35]} c="#7a5a5a" />
        </Room>
        <Lineman frame={frame} pos={[1.2, 0, 0.2]} rotY={-0.7} pose={{armRx: -1.2 + toss * 1.6, mouth: toss > 0.9 ? 'smile' : 'frown', brows: 'up'}} />
        <Volt frame={frame} pos={[2.2, 3.1, -0.4]} glow={1} mood={toss > 0.9 ? 'happy' : 'worried'} />
      </Scene3D>
      <div style={{position: 'absolute', top: 400, width: '100%', textAlign: 'center', scale: String(no)}}>
        <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 80, color: '#fff', background: '#d81e1e', padding: '6px 30px', borderRadius: 18}}>🚫 NEVER TASTE IT</span>
      </div>
      <Big text="WHEN IN DOUBT, THROW IT OUT" color={C.amber} top={540} delay={Math.round(dur * 0.55)} size={56} />
    </AbsoluteFill>
  );
};

// 6. Outro → grid restart teaser
const S6: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 20, fps, config: {damping: 12}});
  return (
    <AbsoluteFill>
      <Scene3D>
        <Cam pos={[ease(frame, 0, dur, 2, 0.5), ease(frame, 0, dur, 4, 8), ease(frame, 0, dur, 10, 14)]} target={[0, 1.5, -3]} />
        <Day frame={frame} snow={false} />
        <Cottage p={[-3, 0, -3]} lit={1} />
        <Cottage p={[2.4, 0, -5]} lit={1} color="#4f86b8" />
        <Pine p={[5.8, 0, -3]} />
        {/* power lines */}
        {[-6, -2, 2, 6].map((x) => (
          <Box key={x} p={[x, 2.2, -8]} s={[0.15, 4.4, 0.15]} c="#6b4630" />
        ))}
        <Box p={[0, 4.2, -8]} s={[12.5, 0.05, 0.05]} c="#2b2d33" />
        <Lineman frame={frame} pos={[0.4, 0, 0.8]} rotY={Math.PI - 0.2} pose={{lookX: -0.4}} />
        <Volt frame={frame} pos={[1.6, 2.9, 0.4]} glow={1} mood="happy" />
      </Scene3D>
      <div style={{position: 'absolute', top: 1180 + LAYOUT.labelShift, width: '100%', textAlign: 'center', scale: String(s)}}>
        <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 100, color: C.amber, background: 'rgba(11,16,32,0.88)', padding: '6px 34px', borderRadius: 22}}>⚡ PART 8 →</span>
      </div>
    </AbsoluteFill>
  );
};

const KEYS = new Set(['over.', 'back.', 'sick.', 'fridge', 'eat', 'mistake.', 'usda', 'four', 'hours', 'meat,', 'milk,', 'eggs', 'leftovers', 'freezer', 'ice', 'crystals,', 'refreeze', 'never', 'taste', 'doubt...', 'throw', 'out.', 'grid', 'eight.']);

export const GridEp7_3D: React.FC<gridEp1Schema> = ({segments, captions, audio}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const starts = segments.map((s) => Math.round(s.start * fps));
  const bounds = segments.map((_, i) => [i === 0 ? 0 : starts[i], i + 1 < segments.length ? starts[i + 1] : durationInFrames]);
  const scenes = [S1, S2, S3, S4, S5, S6];
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
      <AbsoluteFill style={{background: 'linear-gradient(rgba(11,16,32,0.8) 0%, rgba(11,16,32,0) 17%, rgba(11,16,32,0) 68%, rgba(11,16,32,0.8) 82%, rgba(11,16,32,0.85) 100%)'}} />
      <Sequence from={0} durationInFrames={outro}>
        <TopBar totalFrames={outro} finalHour ep={7} finalLabel="POWER BACK" />
      </Sequence>
      <Sequence from={outro}>
        <TopBar totalFrames={1} finalHour ep={7} finalLabel="RESTART" />
      </Sequence>
      <Captions segments={captions} keys={KEYS} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
