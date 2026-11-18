// Short 009 — "The Blackout Mistake That Kills People on Day Two" (1080x1920).
// Shots are keyed to narration phrases from s009_timing.json.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timing from './s009_timing.json';
import {Box, City, clamp, House, Lineman, Pose, Volt} from '../three/kit';
import {Car, DayOut, ease, FONT, Freezer, Night, pop, RedX, Room, UI} from '../long/props';
import {Gas, Generator, Grill} from '../long/scenes3';

export const S009_FPS = 30;
export const S009_FRAMES = Math.ceil((timing.duration + 0.3) * S009_FPS);
type Shot = React.FC<{d: number}>;
type V3 = [number, number, number];
const CAPS = timing.captions;
const at = (p: number, o = 0) => CAPS[p].start + (CAPS[p].end - CAPS[p].start) * o;

// ---------- vertical 2D ----------
const Big: React.FC<{lines: string[]; top?: number; color?: string; size?: number; delay?: number; bg?: string}> = ({lines, top = 300, color = '#fff', size = 96, delay = 0, bg = 'rgba(11,16,32,0.82)'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = delay < 0 ? 1 : pop(f, fps, delay);
  return (
    <div style={{position: 'absolute', top, left: 60, right: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, scale: String(0.6 + 0.4 * k), opacity: k}}>
      {lines.map((l) => (
        <div key={l} style={{background: bg, borderRadius: 22, padding: '8px 30px 14px', fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.02, color, textAlign: 'center', letterSpacing: -1}}>
          {l}
        </div>
      ))}
    </div>
  );
};
const Hero: React.FC<{f: number; pos?: V3; rotY?: number; pose?: Pose; volt?: 'happy' | 'worried' | 'shock' | null; voltPos?: V3; glow?: number}> = ({f, pos = [0, 0, 0], rotY = 0, pose = {}, volt = 'worried', voltPos, glow = 0}) => (
  <>
    <Lineman frame={f} pos={pos} rotY={rotY} pose={pose} />
    {volt && <Volt frame={f} pos={voltPos ?? [pos[0] + 1.3, 3.2, pos[2] - 0.4]} glow={glow} mood={volt} />}
  </>
);

// attached garage seen from the street: house on the left, garage with the door half up on the right
const GarageSet: React.FC<{f: number; door?: number; gen?: boolean; gas?: number; car?: boolean}> = ({f, door = 0.5, gen = true, gas = 0, car = false}) => (
  <>
    <House pos={[-3.2, 0, -1.2]} lit={1} />
    <group position={[0.6, 0, -1]}>
      <Box p={[0, 1.4, -0.6]} s={[3.4, 2.8, 0.2]} c="#2a3563" />
      <Box p={[-1.7, 1.4, 0.6]} s={[0.2, 2.8, 2.6]} c="#2a3563" />
      <Box p={[1.7, 1.4, 0.6]} s={[0.2, 2.8, 2.6]} c="#2a3563" />
      <Box p={[0, 2.9, 0.6]} s={[3.6, 0.2, 2.8]} c="#3d4770" />
      {/* door panel, raised by `door` (0 shut, 1 fully open) */}
      <Box p={[0, 1.4 + 1.3 * door, 1.9]} s={[3.2, 2.6 * (1 - door * 0.85), 0.06]} c="#59648c" />
      <pointLight position={[0, 2.2, 0.8]} color="#ffb238" intensity={gen ? 5 : 0} distance={4} />
    </group>
    {gen && <Generator p={[0.6, 0, -0.6]} f={f} />}
    {car && <Car p={[0.6, 0, -0.4]} c="#4e7fff" lights={1} />}
    {gas > 0 && <Gas f={f} c={[0.1, 0.4, -0.6]} spread={[2.8, 2.2, 1.2]} k={gas} n={30} />}
  </>
);

// ---------- shots ----------
const S0: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <DayOut cam={[ease(f, 0, d, 2.2, 1.4), 2.6, ease(f, 0, d, 9.5, 8.5)]} tgt={[0.2, 1.4, -0.6]} power={0.5}>
        <City power={0} count={50} spread={30} clearRadius={9} />
        <GarageSet f={f} door={0.55} gas={0.6} />
        <RedX p={[0.6, 1.0, 1.4]} k={1} size={2.6} />
      </DayOut>
      <Big lines={['NOT IN', 'THE GARAGE.']} top={230} size={110} color={UI.red} delay={-1} />
      <Big lines={['NOT EVEN WITH', 'THE DOOR OPEN.']} top={540} size={78} delay={-1} />
    </AbsoluteFill>
  );
};
const S2: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <DayOut cam={[ease(f, 0, d, -2, 2), 8, 20]} tgt={[0, 3, -6]} power={0.3}>
        <City power={0} count={170} spread={34} clearRadius={3} />
      </DayOut>
      <Big lines={['DAY 2']} top={300} size={180} color={UI.amber} delay={2} />
      <Big lines={['THE MISTAKE', 'THAT KILLS']} top={560} size={92} color={UI.red} delay={10} />
    </AbsoluteFill>
  );
};
const S3: Shot = ({d}) => {
  const f = useCurrentFrame();
  const fill = interpolate(f, [0, d], [0.45, 0.12], clamp);
  const temp = Math.round(interpolate(f, [0, d], [58, 51], clamp));
  return (
    <AbsoluteFill>
      <Room cam={[ease(f, 0, d, 1.4, 0.6), 3.6, ease(f, 0, d, 6.6, 5.8)]} tgt={[0, 1.2, 0]} lit={1}>
        <Freezer p={[-0.4, 0, -0.4]} lid={0.4} />
        <pointLight position={[-0.4, 2, 0.8]} color="#cfe6ff" intensity={4} distance={5} />
        <Hero f={f} pos={[1.6, 0, -0.2]} rotY={-0.5} pose={{armL: 0.9, armR: 0.9, brows: 'worried', mouth: 'frown'}} volt={null} />
      </Room>
      <div style={{position: 'absolute', top: 260, left: 90, right: 90, display: 'flex', gap: 24}}>
        <div style={{flex: 1, background: UI.panel, borderRadius: 26, padding: '18px 26px', fontFamily: FONT, fontWeight: 900}}>
          <div style={{fontSize: 34, color: UI.dim, letterSpacing: 3}}>FREEZER</div>
          <div style={{height: 34, background: '#2f3c70', borderRadius: 17, marginTop: 12}}>
            <div style={{width: `${fill * 100}%`, height: '100%', background: UI.red, borderRadius: 17}} />
          </div>
        </div>
        <div style={{background: UI.panel, borderRadius: 26, padding: '14px 26px', fontFamily: FONT, fontWeight: 900, fontSize: 84, color: UI.blue}}>{temp}°F</div>
      </div>
    </AbsoluteFill>
  );
};
const S4: Shot = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Room cam={[ease(f, 0, d, 1.0, 0.3), 2.6, ease(f, 0, d, 6.4, 5.6)]} tgt={[0, 1.3, 0]} lit={1}>
        <Box p={[-1.2, 0.35, -0.6]} s={[2.4, 0.7, 1.1]} c="#5a4a7a" />
        <Generator p={[0.9, 0, 0.2]} f={f} on={false} />
        <RedX p={[0.9, 0.7, 0.9]} k={pop(f, fps, 6)} size={1.5} />
      </Room>
      <Big lines={['NOT INSIDE', 'THE HOUSE ✓']} top={300} size={92} color={UI.green} delay={4} />
    </AbsoluteFill>
  );
};
const S5: Shot = ({d}) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, d], [3.6, 1.6], clamp);
  return (
    <AbsoluteFill>
      <DayOut cam={[ease(f, 0, d, 3, 2), 2.6, 9.5]} tgt={[1.2, 1.3, -0.4]} power={0.5}>
        <City power={0} count={50} spread={30} clearRadius={10} />
        <GarageSet f={f} door={0.9} gen={false} />
        <Generator p={[x - 0.7, 0, 0.7]} f={f} on={false} />
        <Hero f={f} pos={[x + 0.4, 0, 0.9]} rotY={-1.3} pose={{armL: 1.3, armR: 1.3, armRx: -0.6, brows: 'up'}} volt="happy" voltPos={[x + 1.4, 3.2, 0.5]} />
      </DayOut>
      <Big lines={['SO: THE GARAGE']} top={300} size={92} delay={4} />
    </AbsoluteFill>
  );
};
const S6: Shot = ({d}) => {
  const f = useCurrentFrame();
  const door = interpolate(f, [0, d * 0.6], [0.0, 0.45], clamp);
  return (
    <AbsoluteFill>
      <DayOut cam={[ease(f, 0, d, 1.6, 1.0), 2.0, ease(f, 0, d, 7.5, 6.8)]} tgt={[0.6, 1.2, -0.6]} power={0.5}>
        <City power={0} count={40} spread={30} clearRadius={10} />
        <GarageSet f={f} door={door} />
      </DayOut>
      <Big lines={['DOOR CRACKED', '= SAFE?']} top={300} size={92} color={UI.amber} delay={6} />
    </AbsoluteFill>
  );
};
// cutaway of the house: garage on the right, inner door, hallway, couch on the left; gas spreads left over time
const Inside: React.FC<{f: number; spread: number; sleep?: boolean; pose?: Pose; hero?: boolean; cam?: V3; tgt?: V3}> = ({f, spread, sleep, pose, hero = true, cam, tgt}) => (
  <Room cam={cam ?? [ease(f, 0, 60, 0.6, 0.2), 3.4, 11]} tgt={tgt ?? [0, 1.4, 0]} lit={1}>
    <Box p={[-2.6, 0.35, -0.4]} s={[2.4, 0.7, 1.1]} c="#5a4a7a" />
    <Box p={[-2.6, 0.9, -0.85]} s={[2.4, 0.8, 0.25]} c="#4a3c68" />
    <Box p={[1.6, 1.6, -0.4]} s={[0.15, 3.2, 3]} c="#3a4468" />
    <Box p={[1.6, 0.06, 0.4]} s={[0.17, 0.12, 0.9]} c="#0b0f1d" />
    <Generator p={[3.0, 0, -0.2]} f={f} />
    <Gas f={f} c={[3.0 - spread * 2.6, 0.5, 0]} spread={[1.2 + spread * 2.6, 1.6, 1.0]} k={0.9} n={40} />
    {hero &&
      (sleep ? (
        <group position={[-2.7, 0.95, -0.2]} rotation={[0, 0, Math.PI / 2]}>
          <Lineman frame={0} pose={{}} scale={0.8} />
        </group>
      ) : (
        <Hero f={f} pos={[-1.0, 0, 0.6]} rotY={0.3} pose={pose ?? {}} volt={null} />
      ))}
  </Room>
);
const S7: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Inside f={f} spread={interpolate(f, [0, d], [0, 0.2], clamp)} hero={false} cam={[2.6, 2.6, 6.5]} tgt={[2.8, 1.2, 0]} />
      <Big lines={['THIS STILL KILLS']} top={300} size={92} color={UI.red} delay={4} />
    </AbsoluteFill>
  );
};
const Icons: React.FC<{items: [string, string][]; d: number}> = ({items, d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'absolute', top: 280, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40}}>
      {items.map(([ic, t], i) => (
        <div key={t} style={{textAlign: 'center', fontFamily: FONT, fontWeight: 900, scale: String(pop(f, fps, 2 + i * Math.round(d / 3)))}}>
          <div style={{position: 'relative', width: 250, height: 250, borderRadius: 50, background: UI.panel, fontSize: 150, lineHeight: '250px'}}>
            {ic}
            <svg width={250} height={250} style={{position: 'absolute', inset: 0, opacity: pop(f, fps, 8 + i * Math.round(d / 3))}}>
              <path d="M40 40 L210 210 M210 40 L40 210" stroke={UI.red} strokeWidth={22} strokeLinecap="round" />
            </svg>
          </div>
          <div style={{fontSize: 52, color: '#fff', marginTop: 14}}>{t}</div>
        </div>
      ))}
    </div>
  );
};
const S8: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Inside f={f} spread={0.25} hero={false} cam={[2.6, 2.6, 6.5]} tgt={[2.8, 1.2, 0]} />
      <Icons items={[['👃', 'NO SMELL']]} d={d} />
    </AbsoluteFill>
  );
};
const S9: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Inside f={f} spread={0.3} hero={false} cam={[2.0, 2.6, 7.5]} tgt={[2.2, 1.2, 0]} />
      <Icons items={[['🎨', 'NO COLOR'], ['😮‍💨', 'NO COUGH']]} d={d} />
    </AbsoluteFill>
  );
};
const S10: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Inside f={f} spread={interpolate(f, [0, d], [0.3, 0.75], clamp)} pose={{lookY: 0.4}} cam={[ease(f, 0, d, 1.2, 0), 3.4, 12]} />
      <Big lines={['GARAGE → HOUSE']} top={300} size={92} color={UI.amber} delay={4} />
    </AbsoluteFill>
  );
};
const Sym: React.FC<{n: number; d: number}> = ({n, d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items: [string, string][] = [['🤕', 'HEADACHE'], ['😵‍💫', 'DIZZY'], ['😴', 'TIRED']];
  return (
    <div style={{position: 'absolute', top: 260, left: 90, display: 'flex', flexDirection: 'column', gap: 20}}>
      {items.slice(0, n).map(([ic, t], i) => (
        <div key={t} style={{display: 'flex', alignItems: 'center', gap: 22, background: UI.panel, borderRadius: 26, padding: '12px 34px', fontFamily: FONT, fontWeight: 900, fontSize: 80, color: '#fff', scale: String(pop(f, fps, n === 1 ? 3 : 2 + Math.max(0, i - 0) * Math.round(d / 3))), transformOrigin: 'left center'}}>
          <span style={{fontSize: 96}}>{ic}</span>
          {t}
        </div>
      ))}
    </div>
  );
};
const S11: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Room cam={[ease(f, 0, d, 0.8, 0.3), 2.6, ease(f, 0, d, 5.6, 5.0)]} tgt={[0.3, 1.9, 0]} lit={1}>
        <Hero f={f} pos={[0.3, 0, 0]} rotY={-0.1} pose={{armR: 2.4, armRx: -0.6, lookX: 0.25, brows: 'worried', mouth: 'frown'}} volt="worried" voltPos={[1.5, 3.1, -0.4]} />
        <Gas f={f} c={[0.3, 0.5, 0]} spread={[2.5, 2.2, 1]} k={0.7} n={24} />
      </Room>
      <Sym n={1} d={d} />
    </AbsoluteFill>
  );
};
const S12: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Room cam={[ease(f, 0, d, 0.6, 0.0), 2.4, ease(f, 0, d, 5.4, 4.8)]} tgt={[0.3, 1.8, 0]} lit={1}>
        <Hero f={f} pos={[0.3, 0, 0]} rotY={0.2} pose={{armL: 0.5, armR: 0.5, lookX: 0.35, lookY: 0.3, brows: 'worried', mouth: 'flat'}} volt="worried" voltPos={[1.5, 3.1, -0.4]} />
        <Gas f={f} c={[0.3, 0.5, 0]} spread={[2.5, 2.2, 1]} k={0.8} n={24} />
      </Room>
      <Sym n={3} d={d} />
    </AbsoluteFill>
  );
};
const S13: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, 4, 1), 5, 14]} tgt={[0, 2, -4]} power={0.35}>
        <City power={0} count={90} spread={30} clearRadius={6} />
        <House pos={[0, 0, -3]} lit={1} />
      </Night>
      <Big lines={['IN THE DARK', 'IT FEELS NORMAL']} top={300} size={88} delay={4} />
    </AbsoluteFill>
  );
};
const S14: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Inside f={f} spread={interpolate(f, [0, d], [0.8, 1], clamp)} sleep cam={[ease(f, 0, d, -1.6, -2.2), 2.6, ease(f, 0, d, 6.5, 5.8)]} tgt={[-2.4, 1.0, 0]} />
      <Big lines={['SO PEOPLE', 'LIE DOWN']} top={300} size={100} color={UI.red} delay={4} />
    </AbsoluteFill>
  );
};
const Stat: React.FC<{num: string; l1: string; l2: string}> = ({num, l1, l2}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #2a1a2a 0%, #0b1020 70%)'}}>
      <div style={{position: 'absolute', top: 360, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 900}}>
        <div style={{fontSize: num.length > 5 ? 170 : 300, lineHeight: 1, color: UI.red, scale: String(pop(f, fps, 2, 10)), textShadow: `0 0 80px ${UI.red}55`}}>{num}</div>
        <div style={{fontSize: 72, color: '#fff', marginTop: 20, lineHeight: 1.1, whiteSpace: 'pre-line'}}>{l1}</div>
        <div style={{fontSize: 44, color: UI.dim, marginTop: 24, letterSpacing: 3}}>{l2}</div>
      </div>
    </AbsoluteFill>
  );
};
const S15a: Shot = () => <Stat num="400+" l1={'deaths a year\nin the US'} l2="CDC · CARBON MONOXIDE" />;
const S15b: Shot = () => <Stat num="NOT FIRES" l1={'just the gas\nyou can\'t see'} l2="NON-FIRE CO POISONING · CDC" />;
const S16a: Shot = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1b2550 0%, #0b1020 70%)'}}>
      <div style={{position: 'absolute', top: 330, left: 80, right: 80, background: UI.panel, border: `6px solid ${UI.red}`, borderRadius: 34, padding: '40px 46px', fontFamily: FONT, fontWeight: 900, scale: String(pop(f, fps, 2))}}>
        <div style={{fontSize: 46, color: UI.red, letterSpacing: 4}}>CDC</div>
        <div style={{fontSize: 74, color: '#fff', lineHeight: 1.12, marginTop: 18}}>Don't run a car in an attached garage —</div>
        <div style={{fontSize: 74, color: UI.amber, lineHeight: 1.12, marginTop: 10}}>even with the door open.</div>
      </div>
    </AbsoluteFill>
  );
};
const S16b: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <DayOut cam={[ease(f, 0, d, 1.6, 0.8), 2.2, ease(f, 0, d, 8, 7)]} tgt={[0.4, 1.2, -0.6]} power={0.5}>
        <City power={0} count={40} spread={30} clearRadius={10} />
        <GarageSet f={f} door={0.9} gen={false} car gas={0.8} />
        <RedX p={[0.6, 1.2, 1.6]} k={1} size={2.4} />
      </DayOut>
      <Big lines={['DOOR OPEN', 'STILL DEADLY']} top={300} size={92} color={UI.red} delay={2} />
    </AbsoluteFill>
  );
};
const S17: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <DayOut cam={[ease(f, 0, d, 5, 3.5), 4, ease(f, 0, d, 12, 10.5)]} tgt={[0, 1.2, 0]} power={0.55}>
        <City power={0} count={50} spread={32} clearRadius={11} />
        <House pos={[-5.5, 0, -3]} lit={1} />
        <Grill p={[-1.2, 0, 0.8]} f={f} />
        <group position={[0.8, 0, 1.0]}>
          <Box p={[0, 0.35, 0]} s={[0.7, 0.7, 0.5]} c="#3a7a4a" />
          <Box p={[0, 0.74, 0]} s={[0.3, 0.06, 0.3]} c="#4e7fff" e={2} />
        </group>
        <Generator p={[2.6, 0, 0.6]} f={f} />
      </DayOut>
      <Big lines={['THE RULE:', 'OUTSIDE ONLY']} top={300} size={100} color={UI.green} delay={2} />
    </AbsoluteFill>
  );
};
const S18: Shot = ({d}) => {
  const f = useCurrentFrame();
  const len = interpolate(f, [4, d * 0.6], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <DayOut cam={[ease(f, 0, d, 1, 0), 12, 9]} tgt={[0, 0, -1]} power={0.55}>
        <City power={0} count={40} spread={34} clearRadius={14} />
        <House pos={[-4.2, 0, -2]} lit={1} />
        <Generator p={[3.2, 0, -1]} f={f} />
        <Box p={[-1.7 + 2.3 * len, 0.1, 0.4]} s={[4.6 * len, 0.08, 0.14]} c={UI.green} e={2} />
      </DayOut>
      <Big lines={['20+ FEET', 'FROM DOORS & WINDOWS']} top={300} size={84} color={UI.green} delay={Math.round(d * 0.3)} />
    </AbsoluteFill>
  );
};
const Alarm: React.FC<{last?: boolean}> = ({last}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const beep = Math.floor(f / 8) % 2 === 0;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #1b2550 0%, #0b1020 72%)'}}>
      <div style={{position: 'absolute', top: 330, left: 0, right: 0, display: 'flex', justifyContent: 'center', scale: String(pop(f, fps, 2))}}>
        <div style={{width: 520, height: 520, borderRadius: 260, background: '#eef1f8', boxShadow: beep ? `0 0 140px ${UI.red}` : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900}}>
          <div style={{fontSize: 150, color: '#1f2937'}}>CO</div>
          <div style={{width: 60, height: 60, borderRadius: 30, background: beep ? UI.red : '#5a2a2a', marginTop: 18}} />
          <div style={{fontSize: 40, color: '#556', marginTop: 18}}>🔋 BATTERY</div>
        </div>
      </div>
      <Big lines={last ? ['THE ONLY THING', 'THAT WARNS YOU'] : ['BATTERY-POWERED', 'CO ALARM']} top={940} size={80} color={last ? UI.red : UI.amber} delay={4} bg="transparent" />
    </AbsoluteFill>
  );
};
const S19: Shot = () => <Alarm />;
const S20: Shot = () => <Alarm last />;

const SHOTS: [number, Shot, number?][] = [
  [0, S0], [2, S2], [3, S3], [4, S4], [5, S5], [6, S6], [7, S7], [8, S8], [9, S9], [10, S10],
  [11, S11], [12, S12], [13, S13], [14, S14], [15, S15a], [15, S15b, 0.55], [16, S16a], [16, S16b, 0.5],
  [17, S17], [18, S18], [19, S19], [20, S20],
];

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const c = CAPS.find((c) => t >= c.start && t < c.end);
  if (!c) return null;
  return (
    <div style={{position: 'absolute', top: 1180, left: 80, right: 170, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 58, lineHeight: 1.2, color: '#fff', textAlign: 'center', background: 'rgba(6,9,20,0.78)', borderRadius: 22, padding: '14px 30px'}}>{c.text}</div>
    </div>
  );
};

export const Short009: React.FC = () => {
  const {fps} = useVideoConfig();
  const list = SHOTS.map(([p, C, o]) => ({t: p === 0 ? 0 : at(p, o ?? 0), C}));
  return (
    <AbsoluteFill style={{background: '#0b1020'}}>
      {list.map((s, i) => {
        const from = Math.round(s.t * fps);
        const to = i + 1 < list.length ? Math.round(list[i + 1].t * fps) : S009_FRAMES;
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}>
            <s.C d={Math.max(1, to - from)} />
          </Sequence>
        );
      })}
      <Captions />
      <Audio src={staticFile('shorts2/s009.mp3')} />
    </AbsoluteFill>
  );
};
