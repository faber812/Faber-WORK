// Scene library for Long 001, part 3 (Hour 48 to the close).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Box, City, clamp, House, Lineman, Pose, Volt} from '../three/kit';
import {Bar, Car, Card, Chip, Counter, Cutaway, ease, FONT, Fridge, Garage, Night, pop, RedX, Room, UI} from './props';
import type {Shot} from './scenes';

type V3 = [number, number, number];
type Mood = 'happy' | 'worried' | 'shock';
const Hero: React.FC<{f: number; pos?: V3; rotY?: number; pose?: Pose; volt?: Mood | null; glow?: number; voltPos?: V3}> = ({f, pos = [0, 0, 0], rotY = 0, pose = {}, volt = 'worried', glow = 0, voltPos}) => (
  <>
    <Lineman frame={f} pos={pos} rotY={rotY} pose={pose} />
    {volt && <Volt frame={f} pos={voltPos ?? [pos[0] + 1.5, 3.0, pos[2] - 0.3]} glow={glow} mood={volt} />}
  </>
);

// ---------- shared 3D bits ----------
const Generator: React.FC<{p: V3; f: number; on?: boolean}> = ({p, f, on = true}) => (
  <group position={p}>
    <Box p={[0, 0.5, 0]} s={[1.3, 1.0, 0.9]} c="#d9a21b" />
    <Box p={[0, 1.05, 0]} s={[1.4, 0.1, 1.0]} c="#2b2d33" />
    <Box p={[0.75, 0.6, 0]} s={[0.2, 0.2, 0.2]} c="#555" />
    {on && <pointLight position={[0, 1.6, 0.8]} color="#ffb238" intensity={5 + 2 * Math.sin(f / 3)} distance={5} />}
  </group>
);
const Grill: React.FC<{p: V3; f: number}> = ({p, f}) => (
  <group position={p}>
    {[[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].map(([a, b], i) => (
      <Box key={i} p={[a, 0.4, b]} s={[0.07, 0.8, 0.07]} c="#2b2d33" />
    ))}
    <Box p={[0, 0.9, 0]} s={[1, 0.3, 0.9]} c="#c44a4a" />
    <Box p={[0, 1.07, 0]} s={[0.9, 0.04, 0.8]} c="#ff7a2e" e={1.5 + 0.5 * Math.sin(f / 2)} />
    <pointLight position={[0, 1.6, 0]} color="#ff7a2e" intensity={4} distance={4} />
  </group>
);
// invisible gas made visible: drifting grey puffs
const Gas: React.FC<{f: number; c: V3; spread: V3; n?: number; k?: number}> = ({f, c, spread, n = 26, k = 1}) => (
  <>
    {new Array(n).fill(0).map((_, i) => {
      const r = (x: number) => (Math.sin(i * 12.9898 + x * 78.233) * 43758.5453) % 1;
      const u = (f * 0.004 + Math.abs(r(1))) % 1;
      return (
        <mesh key={i} position={[c[0] + r(2) * spread[0] + Math.sin(f / 30 + i) * 0.3, c[1] + Math.abs(r(3)) * spread[1] + u * 0.6, c[2] + r(4) * spread[2]]}>
          <sphereGeometry args={[0.25 + Math.abs(r(5)) * 0.35, 10, 10]} />
          <meshStandardMaterial color="#c7cbd6" transparent opacity={0.28 * k * Math.sin(u * Math.PI)} depthWrite={false} />
        </mesh>
      );
    })}
  </>
);

// ---------- hour 48 ----------
export const Cooking: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, 7, 5), 3.4, ease(f, 0, d, 11, 9.5)]} tgt={[0, 1.2, 0]} power={0.45}>
        <City power={0} count={60} spread={32} clearRadius={11} />
        <House pos={[-5.5, 0, -3]} lit={0} />
        <Grill p={[-1.8, 0, 0.6]} f={f} />
        <group position={[0.4, 0, 0.8]}>
          <Box p={[0, 0.35, 0]} s={[0.7, 0.7, 0.5]} c="#3a7a4a" />
          <Box p={[0, 0.74, 0]} s={[0.3, 0.06, 0.3]} c="#4e7fff" e={2} />
        </group>
        <Generator p={[2.6, 0, 0.4]} f={f} />
        <Hero f={f} pos={[-0.6, 0, 2.6]} rotY={0.3} pose={{lookY: -0.4, brows: 'worried'}} volt="worried" voltPos={[-2, 3, 2.2]} />
      </Night>
      <Chip text="GRILLS · CAMP STOVES · GENERATORS" color={UI.amber} top={240} center size={60} delay={6} />
    </AbsoluteFill>
  );
};

// house cutaway with gas rising from a generator in the attached garage
export const COHouse = (stage: 'invisible' | 'reveal' | 'sleep' | 'garage' | 'door'): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = stage === 'invisible' ? 0 : stage === 'reveal' ? interpolate(f, [4, d * 0.6], [0, 1], clamp) : 1;
  return (
    <AbsoluteFill>
      <Room cam={stage === 'garage' || stage === 'door' ? [ease(f, 0, d, 4, 2.6), 3.6, 11] : [ease(f, 0, d, 1.2, 0.2), 3, ease(f, 0, d, 10, 8.8)]} tgt={[stage === 'garage' || stage === 'door' ? 2.4 : 0, 1.4, 0]} lit={0}>
        {/* living room: sofa */}
        <group position={[-1.6, 0, -0.4]}>
          <Box p={[0, 0.35, 0]} s={[2.6, 0.7, 1.1]} c="#5a4a7a" />
          <Box p={[0, 0.9, -0.45]} s={[2.6, 0.8, 0.25]} c="#4a3c68" />
        </group>
        {stage === 'sleep' ? (
          <group position={[-1.7, 0.95, -0.2]} rotation={[0, 0, Math.PI / 2]}>
            <Lineman frame={0} pose={{brows: 'none', mouth: 'flat'}} scale={0.8} />
          </group>
        ) : (
          <Hero f={f} pos={[-0.4, 0, 0.8]} rotY={0.4} pose={stage === 'reveal' ? {armL: 0.4, armR: 0.3, brows: 'worried', mouth: 'frown'} : {lookY: 0.3}} volt={stage === 'invisible' ? 'happy' : 'shock'} voltPos={[0.9, 3, 0.2]} />
        )}
        {/* wall between house and garage */}
        <Box p={[1.8, 1.6, -0.4]} s={[0.15, 3.2, 3]} c="#3a4468" />
        <Generator p={[3.6, 0, -0.2]} f={f} />
        {stage === 'door' && <Car p={[5.6, 0, 0]} r={Math.PI / 2} c="#4e7fff" lights={1.5} />}
        {stage === 'door' && <Box p={[7.4, 2.6, -0.4]} s={[0.1, 1.0, 3]} c="#59648c" />}
        <Gas f={f} c={[2.6, 0.6, 0]} spread={[3.4, 2.2, 1.2]} k={reveal} n={34} />
      </Room>
      {stage === 'invisible' && (
        <div style={{position: 'absolute', top: 230, left: 150, display: 'flex', gap: 26}}>
          {['👃', '🎨', '😮‍💨'].map((ic, i) => (
            <div key={i} style={{position: 'relative', width: 140, height: 140, borderRadius: 30, background: UI.panel, fontSize: 84, lineHeight: '140px', textAlign: 'center', scale: String(pop(f, fps, 4 + i * 8))}}>
              {ic}
              <svg width={140} height={140} style={{position: 'absolute', inset: 0, opacity: pop(f, fps, 10 + i * 8)}}>
                <path d="M24 24 L116 116 M116 24 L24 116" stroke={UI.red} strokeWidth={14} strokeLinecap="round" />
              </svg>
            </div>
          ))}
        </div>
      )}
      {stage === 'invisible' && <Chip text="NO SMELL · NO COLOR · NO COUGH" color={UI.ink} top={400} left={150} size={52} delay={10} />}
      {stage === 'reveal' && <Chip text="CARBON MONOXIDE" color={UI.red} top={240} left={150} size={84} delay={4} />}
      {stage === 'sleep' && <Chip text="SO PEOPLE LIE DOWN" color={UI.red} top={240} left={150} size={72} delay={6} />}
      {stage === 'garage' && <Chip text="THE GARAGE IS NOT SAFE" color={UI.red} top={240} left={150} size={72} delay={6} />}
      {stage === 'door' && <Chip text="EVEN WITH THE DOOR OPEN" color={UI.red} top={240} left={150} size={68} delay={6} />}
    </AbsoluteFill>
  );
};

export const Symptoms = (n: 1 | 3): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items: [string, string][] = [['🤕', 'HEADACHE'], ['😵‍💫', 'DIZZINESS'], ['😴', 'FEELING TIRED']];
  return (
    <AbsoluteFill>
      <Room cam={[ease(f, 0, d, 1.4, 0.6), 2.5, ease(f, 0, d, 6, 5.2)]} tgt={[1.4, 2, 0]} lit={0}>
        <Hero f={f} pos={[2.2, 0, 0]} rotY={-0.3} pose={{armL: 0.2, armR: 2.4, armRx: -0.6, lookX: 0.25, brows: 'worried', mouth: 'frown'}} volt="worried" voltPos={[3.7, 3, -0.4]} />
      </Room>
      <div style={{position: 'absolute', top: 240, left: 150, display: 'flex', flexDirection: 'column', gap: 22}}>
        {items.slice(0, n).map(([ic, t], i) => (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 22, background: UI.panel, borderRadius: 24, padding: '12px 30px', fontFamily: FONT, fontWeight: 900, fontSize: 56, color: UI.ink, scale: String(pop(f, fps, n === 1 ? 4 : 2 + i * Math.round(d / 4))), transformOrigin: 'left center'}}>
            <span style={{fontSize: 70}}>{ic}</span>
            {t}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 2D stat card with a big number
export const BigStat = (num: string, line1: string, src: string, color = UI.red): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, 5, 3), 7, 18]} tgt={[0, 3, -6]} power={0.25}>
        <City power={0} count={120} spread={32} clearRadius={3} />
      </Night>
      <AbsoluteFill style={{background: 'rgba(8,12,24,0.55)'}} />
      <div style={{position: 'absolute', top: 260, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 900}}>
        <div style={{fontSize: 250, lineHeight: 1, color, scale: String(pop(f, fps, 2, 10)), textShadow: `0 0 70px ${color}55`}}>{num}</div>
        <div style={{fontSize: 58, color: UI.ink, marginTop: 14}}>{line1}</div>
        <div style={{fontSize: 32, color: UI.dim, marginTop: 18, letterSpacing: 4}}>{src}</div>
      </div>
    </AbsoluteFill>
  );
};

// the rule: three places crossed out
export const NeverInside: Shot = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items: [string, string][] = [['🏠', 'HOME'], ['🚗', 'GARAGE'], ['🪟', 'NEAR A WINDOW']];
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #2a1a2a 0%, #0b1020 70%)'}}>
      <div style={{position: 'absolute', top: 230, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 64, color: UI.ink}}>
        NEVER RUN A <span style={{color: UI.amber}}>GENERATOR · GRILL · CAMP STOVE</span>
      </div>
      <div style={{position: 'absolute', top: 380, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 60}}>
        {items.map(([ic, t], i) => (
          <div key={t} style={{textAlign: 'center', fontFamily: FONT, fontWeight: 900, scale: String(pop(f, fps, 4 + i * Math.round(d / 5)))}}>
            <div style={{position: 'relative', width: 260, height: 260, borderRadius: 50, background: UI.panel, fontSize: 150, lineHeight: '260px'}}>
              {ic}
              <svg width={260} height={260} style={{position: 'absolute', inset: 0, opacity: pop(f, fps, 10 + i * Math.round(d / 5))}}>
                <path d="M40 40 L220 220 M220 40 L40 220" stroke={UI.red} strokeWidth={22} strokeLinecap="round" />
              </svg>
            </div>
            <div style={{fontSize: 44, color: UI.red, marginTop: 18}}>{t}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// generator 20 ft from the house with a measuring line
export const TwentyFeet: Shot = ({d}) => {
  const f = useCurrentFrame();
  const len = interpolate(f, [4, d * 0.6], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, 2, 0), 9, 13]} tgt={[0, 0, -1]} power={0.5}>
        <City power={0} count={50} spread={34} clearRadius={14} />
        <House pos={[-5, 0, -2]} lit={0} />
        <Generator p={[4.6, 0, -1]} f={f} />
        <Box p={[-2.4 + 3.3 * len, 0.1, 0.4]} s={[6.6 * len, 0.08, 0.12]} c={UI.green} e={2} />
        <Box p={[-2.4, 0.4, 0.4]} s={[0.1, 0.8, 0.1]} c={UI.green} e={2} />
        {len > 0.98 && <Box p={[4.2, 0.4, 0.4]} s={[0.1, 0.8, 0.1]} c={UI.green} e={2} />}
      </Night>
      <Chip text="20+ FEET FROM DOORS & WINDOWS" color={UI.green} top={240} center size={66} delay={Math.round(d * 0.5)} />
    </AbsoluteFill>
  );
};

export const COAlarm: Shot = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const beep = Math.floor(f / 8) % 2 === 0;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #1b2550 0%, #0b1020 70%)'}}>
      <div style={{position: 'absolute', top: 250, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 90, scale: String(pop(f, fps, 2))}}>
        <div style={{width: 360, height: 360, borderRadius: 180, background: '#eef1f8', boxShadow: beep ? `0 0 90px ${UI.red}` : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900}}>
          <div style={{fontSize: 96, color: '#1f2937'}}>CO</div>
          <div style={{width: 40, height: 40, borderRadius: 20, background: beep ? UI.red : '#5a2a2a', marginTop: 14}} />
          <div style={{fontSize: 26, color: '#556', marginTop: 14}}>🔋 BATTERY</div>
        </div>
        <div style={{fontFamily: FONT, fontWeight: 900, color: UI.ink, fontSize: 70, lineHeight: 1.15, maxWidth: 760}}>
          BATTERY-POWERED
          <br />
          <span style={{color: UI.amber}}>CO ALARM</span>
          <div style={{fontSize: 40, color: UI.dim, marginTop: 16}}>works when the grid doesn't</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- hour 72 ----------
export const ColdHouse = (stage: 'cold' | 'oven' | 'oneRoom' | 'close' | 'cover' | 'huddle'): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const temp = stage === 'cold' ? interpolate(f, [0, d], [61, 52], clamp) : 50;
  const warm = stage === 'huddle' || stage === 'cover' ? 1 : stage === 'close' ? 0.6 : 0;
  return (
    <AbsoluteFill>
      <Room cam={stage === 'oven' ? [ease(f, 0, d, 1.4, 0.4), 2.4, 5.6] : [ease(f, 0, d, 2, 0.8), 3.4, ease(f, 0, d, 9, 8)]} tgt={[stage === 'oven' ? -0.8 : 0, 1.2, 0]} lit={0}>
        <color attach="background" args={['#24304f']} />
        {stage === 'oven' ? (
          <group position={[-0.8, 0, -0.4]}>
            <Box p={[0, 0.6, 0]} s={[1.3, 1.2, 1]} c="#c9ccd6" />
            <Box p={[0, 0.5, 0.51]} s={[1.0, 0.6, 0.02]} c="#1a1f30" />
            <Box p={[0, 1.22, 0]} s={[1.3, 0.04, 1]} c="#2b2d33" />
            <RedX p={[0, 0.8, 0.9]} k={pop(f, fps, 6)} size={1.6} />
          </group>
        ) : (
          <>
            {/* one room in the middle with door and window */}
            <Box p={[-2.5, 1.5, 0]} s={[0.15, 3, 4]} c="#3a4468" />
            <Box p={[2.5, 1.5, 0]} s={[0.15, 3, 4]} c="#3a4468" />
            {(stage === 'close' || stage === 'cover' || stage === 'huddle') && <Box p={[2.5, 1.1, 1.0]} s={[0.2, 2.2, 1.2]} c="#7a5236" />}
            <Box p={[0, 1.8, -1.95]} s={[1.6, 1.1, 0.05]} c={stage === 'cover' || stage === 'huddle' ? '#8a3c3c' : '#9fc2ff'} e={stage === 'cover' || stage === 'huddle' ? 0 : 0.4} />
            {stage === 'huddle' &&
              [-1, 0, 1].map((x, i) => (
                <group key={i} position={[x * 0.9, 0, 0.3]} scale={0.75}>
                  <Lineman frame={f + i * 9} pose={{mouth: 'smile', brows: 'up'}} />
                </group>
              ))}
            {stage !== 'huddle' && <Hero f={f} pos={[0.4, 0, 0.6]} pose={{armL: 0.9, armR: 0.9, brows: 'worried', mouth: 'frown'}} volt={null} />}
            <pointLight position={[0, 1.6, 1]} color="#ffb070" intensity={8 * warm} distance={4.5} />
          </>
        )}
      </Room>
      {stage === 'cold' && (
        <div style={{position: 'absolute', top: 240, left: 150, fontFamily: FONT, fontWeight: 900, background: UI.panel, borderRadius: 26, padding: '16px 36px'}}>
          <div style={{fontSize: 30, letterSpacing: 4, color: UI.dim}}>INDOORS</div>
          <div style={{fontSize: 130, lineHeight: 1, color: UI.blue, fontVariantNumeric: 'tabular-nums'}}>{Math.round(temp)}°F</div>
        </div>
      )}
      {stage === 'oven' && <Chip text="NEVER HEAT WITH THE OVEN" color="#fff" bg="#d81e1e" top={240} left={150} size={70} delay={4} />}
      {stage === 'oneRoom' && <Chip text="PICK ONE ROOM" color={UI.amber} top={240} left={150} size={84} delay={4} />}
      {stage === 'close' && <Chip text="CLOSE OFF THE REST" color={UI.amber} top={240} left={150} size={72} delay={4} />}
      {stage === 'cover' && <Chip text="COVER THE WINDOWS" color={UI.amber} top={240} left={150} size={72} delay={4} />}
      {stage === 'huddle' && <Chip text="LAYER UP · STAY TOGETHER" color={UI.green} top={240} left={150} size={66} delay={4} />}
    </AbsoluteFill>
  );
};

export const Candle = (safe: boolean): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Room cam={[ease(f, 0, d, 1, 0.3), 2, ease(f, 0, d, 4.6, 4)]} tgt={[0, 1.3, 0]} lit={0}>
        <Counter p={[0, 0, 0]} w={2.4} />
        {safe ? (
          <group position={[0, 1.16, 0.1]}>
            <Box p={[0, 0.3, 0]} s={[0.4, 0.6, 0.4]} c="#3a4680" />
            <Box p={[0, 0.66, 0]} s={[0.3, 0.12, 0.3]} c="#fff6d6" e={3} />
            <pointLight position={[0, 1, 0.4]} color="#fff6d6" intensity={10} distance={6} />
          </group>
        ) : (
          <group position={[0, 1.16, 0.1]}>
            <Box p={[0, 0.25, 0]} s={[0.16, 0.5, 0.16]} c="#f3efe2" />
            <Box p={[0, 0.58, 0]} s={[0.08, 0.14, 0.08]} c="#ffb238" e={3 + Math.sin(f / 2)} />
            <Box p={[0.5, 0.2, 0]} s={[0.6, 0.4, 0.6]} c="#6a5acd" />
            <pointLight position={[0, 0.9, 0.3]} color="#ff9a3a" intensity={6} distance={4} />
            <RedX p={[0, 0.5, 0.5]} k={pop(f, fps, Math.round(d * 0.4))} size={1.1} />
          </group>
        )}
      </Room>
      <Chip text={safe ? 'FLASHLIGHTS & LANTERNS' : 'SKIP THE CANDLES'} color={safe ? UI.green : UI.red} top={240} left={150} size={72} delay={4} />
    </AbsoluteFill>
  );
};

export const SignsList: Shot = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items = ['SHIVERING', 'EXHAUSTION', 'CONFUSION', 'FUMBLING HANDS', 'SLURRED SPEECH', 'DROWSINESS'];
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #1b2550 0%, #0b1020 70%)'}}>
      <div style={{position: 'absolute', top: 220, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 52, color: UI.dim, letterSpacing: 4}}>CDC · HYPOTHERMIA WARNING SIGNS</div>
      <div style={{position: 'absolute', top: 330, left: 220, right: 220, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26}}>
        {items.map((t, i) => (
          <div key={t} style={{fontFamily: FONT, fontWeight: 900, fontSize: 44, color: UI.ink, background: UI.panel, border: `4px solid ${UI.blue}`, borderRadius: 24, padding: '30px 0', textAlign: 'center', scale: String(pop(f, fps, 2 + i * Math.round(d / 8)))}}>
            {t}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const WarmingCenter: Shot = ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, 6, 3), 3.6, ease(f, 0, d, 14, 12)]} tgt={[0, 2, 0]} power={0.45}>
        <City power={0} count={60} spread={32} clearRadius={10} />
        <Box p={[0, 1.8, -1]} s={[7, 3.6, 3]} c="#59648c" />
        {[-2.4, -0.8, 0.8, 2.4].map((x) => (
          <Box key={x} p={[x, 2.2, 0.52]} s={[1, 1, 0.04]} c="#ffd27a" e={2} />
        ))}
        <Box p={[0, 0.9, 0.52]} s={[1.2, 1.8, 0.04]} c="#ffd27a" e={1.6} />
        <pointLight position={[0, 2, 3]} color="#ffd27a" intensity={14} distance={10} />
        <Hero f={f} pos={[2.6, 0, 3]} rotY={Math.PI * 0.9} pose={{}} volt="happy" glow={0.6} voltPos={[4, 3, 2.6]} />
      </Night>
      <Chip text="GO TO A WARMING CENTER" color={UI.amber} top={240} left={150} size={70} delay={6} />
    </AbsoluteFill>
  );
};

// ---------- day 5 ----------
export const FuelGauge: Shot = ({d}) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, d], [-0.3, -1.2], clamp);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #1b2550 0%, #0b1020 70%)'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <path d="M660 720 A300 300 0 0 1 1260 720" stroke="#2f3c70" strokeWidth={40} fill="none" />
        <path d="M660 720 A300 300 0 0 1 720 540" stroke={UI.red} strokeWidth={40} fill="none" />
        <line x1={960} y1={720} x2={960 + 270 * Math.cos(Math.PI + Math.PI / 2 + a)} y2={720 + 270 * Math.sin(Math.PI + Math.PI / 2 + a)} stroke={UI.ink} strokeWidth={16} strokeLinecap="round" />
        <circle cx={960} cy={720} r={26} fill={UI.ink} />
        <text x={640} y={800} fill={UI.red} fontFamily="Inter" fontWeight={900} fontSize={60}>E</text>
        <text x={1240} y={800} fill={UI.ink} fontFamily="Inter" fontWeight={900} fontSize={60}>F</text>
        <text x={960} y={880} textAnchor="middle" fill={UI.amber} fontFamily="Inter" fontWeight={900} fontSize={64}>⛽ RUNNING LOW</text>
      </svg>
    </AbsoluteFill>
  );
};

export const Shelves = (empty: boolean): Shot => ({d}) => {
  const f = useCurrentFrame();
  const truckX = interpolate(f, [0, d], [-14, 8], clamp);
  const cols = ['#c44a4a', '#4e7fff', '#3c8f5a', '#d6a23a', '#8a5acd'];
  return (
    <AbsoluteFill>
      {empty ? (
        <Room cam={[ease(f, 0, d, -1, 1), 2.2, 7]} tgt={[0, 1.4, -1]} lit={0}>
          {[-2.2, 0, 2.2].map((x) => (
            <group key={x} position={[x, 0, -1.4]}>
              <Box p={[0, 1.4, 0]} s={[1.9, 2.8, 0.6]} c="#59648c" />
              {[0.5, 1.2, 1.9, 2.6].map((y) => (
                <Box key={y} p={[0, y, 0.2]} s={[1.8, 0.05, 0.5]} c="#c9ccd6" />
              ))}
              {(x === 0 ? [[0.3, 0.7]] : []).map(([px, py], i) => (
                <Box key={i} p={[px, py, 0.3]} s={[0.25, 0.35, 0.25]} c={cols[i]} />
              ))}
            </group>
          ))}
        </Room>
      ) : (
        <Night cam={[0, 3, 15]} tgt={[0, 1.4, 0]} power={0.45}>
          <City power={0} count={60} spread={34} clearRadius={10} />
          <Box p={[0, 0.02, 0]} s={[44, 0.02, 3.6]} c="#1a1f30" />
          <group position={[truckX, 0, 0.6]}>
            <Box p={[0, 1.6, 0]} s={[4.2, 2.4, 1.8]} c="#e8ebf2" />
            <Box p={[2.7, 1.1, 0]} s={[1.2, 1.6, 1.7]} c="#c44a4a" />
            {[-1.4, 0.8, 2.6].map((x) => (
              <Box key={x} p={[x, 0.35, 0.95]} s={[0.7, 0.7, 0.1]} c="#111" />
            ))}
          </group>
        </Night>
      )}
      <Chip text={empty ? 'SHELVES STAY EMPTY' : 'STORES RUN ON DELIVERIES'} color={empty ? UI.red : UI.amber} top={240} left={150} size={70} delay={6} />
    </AbsoluteFill>
  );
};

export const LiftStation = (stage: 0 | 1 | 2): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lvl = stage === 0 ? 0.3 : interpolate(f, [0, d], stage === 1 ? [0.35, 0.75] : [0.75, 1], clamp);
  return (
    <AbsoluteFill>
      <Cutaway cam={[ease(f, 0, d, 1, -0.5), -1, 12]} tgt={[0, -2, 0]}>
        {/* wet well */}
        <Box p={[0, -2.6, 0.2]} s={[3, 4.4, 0.3]} c="#59648c" />
        <Box p={[0, -4.6 + 2 * lvl, 0.5]} s={[2.7, 4 * lvl, 0.1]} c="#6b5a2a" e={0.3} />
        <Box p={[0, -4.2, 0.65]} s={[0.8, 0.6, 0.3]} c="#3d4770" />
        {stage > 0 && <RedX p={[0, -4.2, 1]} k={pop(f, fps, 6)} size={1.1} />}
        {/* incoming pipe from houses */}
        <Box p={[-5, -1.6, 0.5]} s={[7, 0.4, 0.3]} c="#8b94b0" />
        <House pos={[-7.6, 0, -1.4]} lit={0} />
        <Box p={[0.6, 0.6, 0]} s={[1.4, 1.2, 1.2]} c="#59648c" />
      </Cutaway>
      {stage === 0 && <Chip text="LIFT STATION: ELECTRIC PUMPS" color={UI.amber} top={240} left={150} size={62} delay={6} />}
      {stage === 1 && <Chip text="NO POWER: SEWAGE RISES" color={UI.red} top={240} left={150} size={68} delay={6} />}
      {stage === 2 && <Chip text="…AND CAN BACK UP" color={UI.red} top={240} left={150} size={76} delay={4} />}
    </AbsoluteFill>
  );
};

// ---------- day 7 ----------
export const Hospital = (stage: 0 | 1 | 2): Shot => ({d}) => {
  const f = useCurrentFrame();
  const truckX = stage === 2 ? interpolate(f, [0, d], [-12, 1], clamp) : -30;
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, 8, 5), 5, 18]} tgt={[0, 2.6, 0]} power={0.45}>
        <City power={0} count={60} spread={34} clearRadius={12} />
        <Box p={[0, 3, -2]} s={[9, 6, 4]} c="#c9ccd6" />
        {[-3, -1, 1, 3].flatMap((x) => [1.6, 3.2, 4.6].map((y) => <Box key={`${x}${y}`} p={[x, y, 0.02]} s={[1.2, 0.8, 0.04]} c="#ffd27a" e={1.4} />))}
        <Box p={[0, 5.6, 0.04]} s={[1.6, 0.4, 0.04]} c="#d81e1e" e={1.5} />
        <Box p={[0, 5.6, 0.06]} s={[0.4, 1.4, 0.04]} c="#d81e1e" e={1.5} />
        <Generator p={[5.6, 0, 0.6]} f={f} />
        <group position={[truckX, 0, 2.6]}>
          <Box p={[0, 1.2, 0]} s={[3.4, 1.6, 1.6]} c="#d6a23a" />
          <Box p={[2.2, 1.0, 0]} s={[1, 1.4, 1.5]} c="#c44a4a" />
        </group>
      </Night>
      {stage === 0 && <Chip text="HOSPITALS: ON GENERATORS" color={UI.amber} top={240} left={150} size={66} delay={6} />}
      {stage === 1 && <Bar label="TYPICAL PLAN (JOINT COMMISSION)" value="~96 HRS" fill={interpolate(f, [0, d], [0.2, 1], clamp)} color={UI.amber} top={240} left={150} width={760} />}
      {stage === 2 && <Chip text="THEN: FUEL DELIVERIES" color={UI.red} top={240} left={150} size={70} delay={6} />}
    </AbsoluteFill>
  );
};

// black start: plants in a row; one lights itself, energizes a line, wakes the next
export const BlackStart = (stage: 'need' | 'special' | 'name' | 'line' | 'next' | 'rebuild'): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const plants: V3[] = [[-9, 0, -2], [-3, 0, -2], [3, 0, -2], [9, 0, -2]];
  const k = interpolate(f, [4, d * 0.85], [0, 1], clamp);
  const on = (i: number) => {
    if (stage === 'need') return 0;
    if (stage === 'special' || stage === 'name') return i === 1 ? 1 : 0;
    if (stage === 'line') return i === 1 ? 1 : 0;
    if (stage === 'next') return i === 1 ? 1 : i === 2 ? k : 0;
    return i <= 2 ? 1 : k;
  };
  const lineK = stage === 'line' ? k : stage === 'next' || stage === 'rebuild' ? 1 : 0;
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, -2, 2), 7, 22]} tgt={[0, 2, -2]} power={0.35}>
        {stage === 'rebuild' && <City power={k} count={140} spread={34} clearRadius={9} />}
        {plants.map((p, i) => (
          <group key={i} position={p}>
            <Box p={[0, 1.4, 0]} s={[3, 2.8, 2.4]} c="#59648c" />
            <mesh position={[0.8, 3.6, 0]}>
              <cylinderGeometry args={[0.35, 0.5, 2.6, 12]} />
              <meshStandardMaterial color="#8d97b8" />
            </mesh>
            <Box p={[0, 1.6, 1.22]} s={[2, 0.6, 0.04]} c={on(i) > 0.5 ? '#ffd27a' : '#141a2e'} e={on(i) > 0.5 ? 2 : 0} />
            {on(i) > 0.5 && <pointLight position={[0, 3, 2]} color="#ffd27a" intensity={8} distance={7} />}
            {i === 1 && stage !== 'need' && <Box p={[-1.9, 0.5, 0]} s={[0.8, 1, 0.8]} c={UI.green} e={1.2} />}
          </group>
        ))}
        {/* line from plant 1 to plant 2 */}
        <Box p={[-1.5 + 3 * lineK, 3.2, -2]} s={[6 * lineK, 0.08, 0.08]} c="#ffd27a" e={3} />
        {(stage === 'rebuild' || stage === 'next') && <Box p={[3 + 3 * (stage === 'rebuild' ? 1 : 0), 3.2, -2]} s={[stage === 'rebuild' ? 6 : 0.01, 0.08, 0.08]} c="#ffd27a" e={3} />}
      </Night>
      {stage === 'need' && <Chip text="BIG PLANTS NEED POWER TO START" color={UI.red} top={240} center size={60} delay={6} />}
      {stage === 'special' && <Chip text="A FEW CAN START ON THEIR OWN" color={UI.green} top={240} center size={60} delay={6} />}
      {stage === 'name' && <Chip text="BLACK START" color={UI.amber} top={240} center size={130} delay={2} />}
      {stage === 'line' && <Chip text="ENERGIZE ONE LINE" color={UI.amber} top={240} center size={76} delay={4} />}
      {stage === 'next' && <Chip text="WAKE THE NEXT PLANT" color={UI.amber} top={240} center size={76} delay={4} />}
      {stage === 'rebuild' && <Chip text="PIECE BY PIECE" color={UI.green} top={240} center size={90} delay={4} />}
      {stage === 'name' && <div style={{position: 'absolute', top: 420, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 36, color: UI.dim, scale: String(pop(f, fps, 10))}}>NERC · FERC</div>}
    </AbsoluteFill>
  );
};

// ---------- power back ----------
export const FridgeBack = (stage: 'hum' | 'cold' | 'eat' | 'mistake' | 'notcold'): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const st = pop(f, fps, 4, 9);
  return (
    <AbsoluteFill>
      <Room cam={[ease(f, 0, d, 1.8, 0.9), 2.5, ease(f, 0, d, 7.4, 6.6)]} tgt={[0.4, 1.7, 0]} lit={1}>
        <Fridge p={[-0.9, 0, -1.4]} open={stage === 'hum' ? 0 : 1} />
        <pointLight position={[-0.9, 2, 0.4]} color="#e8f4ff" intensity={stage === 'hum' ? 0 : 3} distance={4} />
        <Hero
          f={f}
          pos={[1.8, 0, -0.2]}
          rotY={-0.6}
          pose={stage === 'eat' ? {armRx: -1.6, armR: 0.3, mouth: 'o', brows: 'up'} : stage === 'mistake' ? {armL: 0.6, armR: 0.6, mouth: 'frown', brows: 'worried'} : {mouth: 'smile', brows: 'up'}}
          volt={stage === 'mistake' || stage === 'notcold' ? 'shock' : 'happy'}
          glow={stage === 'mistake' ? 0 : 1}
          voltPos={[3.2, 3, -0.6]}
        />
      </Room>
      {stage === 'hum' && <Chip text="♪ HUMMING AGAIN" color={UI.green} top={240} left={150} size={70} delay={6} />}
      {stage === 'cold' && <Chip text="FEELS COLD…" color={UI.blue} top={240} left={150} size={80} delay={6} />}
      {stage === 'eat' && <Chip text="SO PEOPLE EAT IT" color={UI.amber} top={240} left={150} size={76} delay={6} />}
      {stage === 'mistake' && (
        <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', scale: String(interpolate(st, [0, 1], [2.2, 1])), opacity: st, rotate: '-7deg'}}>
          <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 130, color: UI.red, border: `14px solid ${UI.red}`, padding: '6px 44px', borderRadius: 22, background: 'rgba(11,16,32,0.75)'}}>THE MISTAKE</span>
        </div>
      )}
      {stage === 'notcold' && <Chip text={'COLD NOW ≠ STAYED COLD'} color={UI.red} top={240} left={150} size={72} delay={4} />}
    </AbsoluteFill>
  );
};

export const IceCrystals = (thermo: boolean): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const temp = interpolate(f, [0, d * 0.6], [55, 38], clamp);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #1e3a5c 0%, #0b1020 75%)'}}>
      {!thermo ? (
        <>
          {new Array(40).fill(0).map((_, i) => {
            const x = (Math.sin(i * 91.7) * 0.5 + 0.5) * 1920;
            const y = 200 + (Math.cos(i * 47.3) * 0.5 + 0.5) * 760;
            return <div key={i} style={{position: 'absolute', left: x, top: y, fontSize: 30 + (i % 4) * 16, opacity: pop(f, fps, i % 20), color: '#cfe6ff'}}>❄</div>;
          })}
          <Chip text="ICE CRYSTALS? SAFE TO REFREEZE" color={UI.green} top={420} center size={76} delay={6} />
        </>
      ) : (
        <div style={{position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 80}}>
          <div style={{position: 'relative', width: 120, height: 560, borderRadius: 60, background: '#eef1f8'}}>
            <div style={{position: 'absolute', bottom: 20, left: 30, width: 60, height: (temp / 70) * 520, borderRadius: 30, background: temp <= 40 ? UI.green : UI.red}} />
          </div>
          <div style={{fontFamily: FONT, fontWeight: 900}}>
            <div style={{fontSize: 200, lineHeight: 1, color: temp <= 40 ? UI.green : UI.red, fontVariantNumeric: 'tabular-nums'}}>{Math.round(temp)}°F</div>
            <div style={{fontSize: 54, color: UI.ink, marginTop: 10}}>40°F OR BELOW = SAFE TO REFREEZE</div>
            <div style={{fontSize: 34, color: UI.dim, marginTop: 10, letterSpacing: 4}}>USDA</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const DoubtOut: Shot = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #2a1a2a 0%, #0b1020 70%)'}}>
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 900, scale: String(pop(f, fps, 2, 10))}}>
        <div style={{fontSize: 140, color: UI.ink, lineHeight: 1.05}}>WHEN IN DOUBT,</div>
        <div style={{fontSize: 170, color: UI.red, lineHeight: 1.05}}>THROW IT OUT.</div>
        <div style={{fontSize: 36, color: UI.dim, marginTop: 20, letterSpacing: 4}}>USDA</div>
      </div>
    </AbsoluteFill>
  );
};

export const NoTaste: Shot = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #1b2550 0%, #0b1020 70%)'}}>
      <div style={{position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{position: 'relative', width: 380, height: 380, borderRadius: 70, background: UI.panel, fontSize: 230, lineHeight: '380px', textAlign: 'center', scale: String(pop(f, fps, 2))}}>
          👅
          <svg width={380} height={380} style={{position: 'absolute', inset: 0, opacity: pop(f, fps, 10)}}>
            <path d="M60 60 L320 320 M320 60 L60 320" stroke={UI.red} strokeWidth={30} strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <Chip text="NEVER TASTE-TEST" color={UI.red} top={700} center size={76} delay={8} />
    </AbsoluteFill>
  );
};

// ---------- close ----------
const CHECK = ['FILL THE TUB AND EVERY POT', 'KEEP FRIDGE & FREEZER SHUT', 'GET CASH WHILE ATMs WORK', 'CHARGE PHONE · SWITCH TO TEXTS', 'CO ALARM ON BATTERIES'];
export const Checklist = (n: number): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 40%, #1b2550 0%, #0b1020 75%)'}}>
      <div style={{position: 'absolute', top: 210, left: 200, fontFamily: FONT, fontWeight: 900, fontSize: 60, color: UI.amber}}>THE FIRST 10 MINUTES</div>
      <div style={{position: 'absolute', top: 320, left: 200, display: 'flex', flexDirection: 'column', gap: 20}}>
        {CHECK.slice(0, n).map((t, i) => {
          const fresh = i === n - 1;
          const k = fresh ? pop(f, fps, 2) : 1;
          return (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 28, fontFamily: FONT, fontWeight: 900, fontSize: 56, color: fresh ? UI.ink : UI.dim, opacity: k, translate: `${(1 - k) * -60}px 0`}}>
              <span style={{width: 70, height: 70, borderRadius: 18, background: UI.green, color: '#0b1020', textAlign: 'center', lineHeight: '70px', fontSize: 50}}>✓</span>
              {t}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// final: the city lit; on "until it doesn't" everything goes dark and the board flips red
export const Finale = (stage: 'lit' | 'dark' | 'end'): Shot => ({d}) => {
  const f = useCurrentFrame();
  const p = stage === 'lit' ? 1 : stage === 'dark' ? interpolate(f, [d * 0.3, d * 0.5], [1, 0], clamp) : 0.15;
  return (
    <AbsoluteFill>
      <Night cam={stage === 'end' ? [ease(f, 0, Math.min(d, 600), 0, 6), 13, 30] : [ease(f, 0, d, 4, 1), 9, 22]} tgt={[0, 3, -6]} power={0.3 + 0.6 * p}>
        <City power={p} count={190} spread={36} clearRadius={3} />
      </Night>
      {stage === 'lit' && <Chip text="7 DAYS · 8 SYSTEMS" color={UI.amber} top={300} center size={110} delay={4} />}
      {stage === 'end' && (
        <div style={{position: 'absolute', top: 240, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 64, color: UI.ink, opacity: interpolate(f, [10, 30], [0, 1], clamp)}}>
          LIGHTS OUT LAB
        </div>
      )}
    </AbsoluteFill>
  );
};
