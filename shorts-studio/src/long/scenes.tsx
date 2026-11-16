// Scene library for Long 001 (landscape). Every scene is a short shot: FC<{d}> where d = shot length in frames.
import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {Box, City, clamp, COL, House, Lineman, Pose, useTextTexture, Volt} from '../three/kit';
import {Bar, Canopy, Car, Card, CellTower, Chip, Counter, Cutaway, ease, Faucet, FONT, Freezer, Fridge, Garage, GasPump, Night, pop, RedX, Room, UI, WaterTower} from './props';

export type Shot = React.FC<{d: number}>;
type V3 = [number, number, number];
const Hero: React.FC<{f: number; pos?: V3; rotY?: number; pose?: Pose; volt?: 'happy' | 'worried' | 'shock' | null; glow?: number; voltPos?: V3}> = ({f, pos = [0, 0, 0], rotY = 0, pose = {}, volt = 'worried', glow = 0, voltPos}) => (
  <>
    <Lineman frame={f} pos={pos} rotY={rotY} pose={pose} />
    {volt && <Volt frame={f} pos={voltPos ?? [pos[0] + 1.5, 3.0, pos[2] - 0.3]} glow={glow} mood={volt} />}
  </>
);
const fmtClock = (secs: number) => `${Math.floor(secs / 3600)}:${String(Math.floor((secs % 3600) / 60)).padStart(2, '0')}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;

// ============ generic ============

// city wide shot; power goes from p0 to p1 over the shot
export const CityShot = (p0: number, p1: number, cam: 'high' | 'low' | 'side' = 'high', chip?: {text: string; color?: string}): Shot => ({d}) => {
  const f = useCurrentFrame();
  const power = interpolate(f, [d * 0.2, d * 0.8], [p0, p1], clamp);
  const c: Record<string, [V3, V3, V3]> = {
    high: [[4, 12, 22], [2, 9, 17], [0, 3, -6]],
    low: [[-3, 3, 13], [-1, 3.4, 10], [0, 3, -6]],
    side: [[10, 6, 14], [7, 5, 12], [0, 3, -8]],
  };
  const [a, b, t] = c[cam];
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, a[0], b[0]), ease(f, 0, d, a[1], b[1]), ease(f, 0, d, a[2], b[2])]} tgt={t} power={0.3 + 0.6 * power}>
        <City power={power} count={170} spread={34} clearRadius={3} />
      </Night>
      {chip && <Chip text={chip.text} color={chip.color} top={330} center size={84} delay={6} />}
    </AbsoluteFill>
  );
};

// hero in the dark street; pose + optional chip
export const HeroShot = (pose: Pose, volt: 'happy' | 'worried' | 'shock', chip?: {text: string; color?: string; size?: number}, close = false): Shot => ({d}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Night cam={close ? [ease(f, 0, d, 1.6, 0.8), 2.5, ease(f, 0, d, 5.6, 4.8)] : [ease(f, 0, d, 3.4, 2.2), 2.8, ease(f, 0, d, 9.5, 8.2)]} tgt={[0.4, close ? 2.1 : 1.8, 0]} power={0.4}>
        <City power={0} count={90} spread={30} clearRadius={6} />
        <Hero f={f} pose={pose} volt={volt} />
      </Night>
      {chip && <Chip text={chip.text} color={chip.color} top={300} center size={chip.size ?? 110} delay={8} />}
    </AbsoluteFill>
  );
};

// full-screen info card over a dimmed city
export const CardShot = (title: string, lines: string[], accent = UI.amber, stamp?: string): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const st = pop(f, fps, Math.round(d * 0.35), 9);
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, 6, 4), 7, 18]} tgt={[0, 3, -6]} power={0.25}>
        <City power={0} count={120} spread={32} clearRadius={3} />
      </Night>
      <AbsoluteFill style={{background: 'rgba(8,12,24,0.45)'}} />
      <Card title={title} lines={lines} accent={accent} top={330} width={1100} />
      {stamp && (
        <div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', scale: String(interpolate(st, [0, 1], [2.2, 1])), opacity: st, rotate: '-9deg'}}>
          <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 88, color: UI.red, border: `10px solid ${UI.red}`, padding: '6px 34px', borderRadius: 18, background: 'rgba(11,16,32,0.7)'}}>{stamp}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ============ cold open ============

export const TapDark: Shot = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const icons = ['💡', '📶', '🧊'];
  return (
    <AbsoluteFill>
      <Room cam={[ease(f, 0, d, 2.4, 1.2), 2.6, ease(f, 0, d, 6.4, 5.2)]} tgt={[0, 1.5, 0]} lit={0}>
        <Counter p={[0, 0, 0]} w={4.2} />
        <Faucet p={[0, 1.16, 0]} flow={1} />
        <pointLight position={[0.6, 2.2, 1.4]} color="#7cc4ff" intensity={6} distance={5} />
      </Room>
      <div style={{position: 'absolute', top: 250, right: 170, display: 'flex', gap: 34}}>
        {icons.map((ic, i) => {
          const s = pop(f, fps, 4 + i * 9);
          const x = pop(f, fps, 12 + i * 9, 10);
          return (
            <div key={i} style={{position: 'relative', width: 150, height: 150, borderRadius: 34, background: UI.panel, fontSize: 92, lineHeight: '150px', textAlign: 'center', scale: String(s)}}>
              {ic}
              <svg width={150} height={150} style={{position: 'absolute', inset: 0, opacity: x}}>
                <path d="M26 26 L124 124 M124 26 L26 124" stroke={UI.red} strokeWidth={15} strokeLinecap="round" />
              </svg>
            </div>
          );
        })}
      </div>
      <Chip text="TAP: STILL RUNNING" color={UI.blue} top={640} left={150} size={62} delay={10} />
    </AbsoluteFill>
  );
};

export const TowerShot = (l0: number, l1: number, chip?: {text: string; color?: string}, withHero = false): Shot => ({d}) => {
  const f = useCurrentFrame();
  const level = interpolate(f, [0, d], [l0, l1], clamp);
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, 6, 4.4), ease(f, 0, d, 4.2, 5), ease(f, 0, d, 15, 13)]} tgt={[0, 4.4, -2]} power={0.45}>
        <City power={0} count={70} spread={30} clearRadius={9} />
        <WaterTower p={[0, 0, -2]} level={level} />
        <pointLight position={[0, 6, 2]} color="#7cc4ff" intensity={12} distance={9} />
        {withHero && <Hero f={f} pos={[3.4, 0, 2]} rotY={-0.6} pose={{lookX: -0.35, lookY: -0.5, brows: 'worried'}} />}
      </Night>
      <Bar label="TOWER LEVEL" value={`${Math.round(level * 100)}%`} fill={level} color={level < 0.4 ? UI.red : UI.blue} top={300} left={150} />
      {chip && <Chip text={chip.text} color={chip.color} top={470} left={150} size={66} delay={10} />}
    </AbsoluteFill>
  );
};

const SYS = [['⚡', 'POWER'], ['💳', 'CARD'], ['⛽', 'FUEL'], ['📱', 'PHONE'], ['💧', 'WATER'], ['🥩', 'FOOD'], ['🔥', 'HEAT'], ['🚽', 'SEWER']];
export const BoardBig: Shot = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #1b2550 0%, #0b1020 70%)'}}>
      <div style={{position: 'absolute', top: 250, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 76, color: UI.ink}}>
        WHAT DO YOU LOSE <span style={{color: UI.amber}}>FIRST?</span>
      </div>
      <div style={{position: 'absolute', top: 420, left: 200, right: 200, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 30}}>
        {SYS.map(([ic, n], i) => {
          const s = pop(f, fps, 3 + i * 3);
          const hot = Math.floor(f / 5) % 8 === i;
          return (
            <div key={n} style={{scale: String(s), background: hot ? '#3b2030' : UI.panel, border: `4px solid ${hot ? UI.red : '#2f3c70'}`, borderRadius: 26, padding: '18px 0', textAlign: 'center', fontFamily: FONT}}>
              <div style={{fontSize: 84, lineHeight: 1.1}}>{ic}</div>
              <div style={{fontWeight: 900, fontSize: 34, letterSpacing: 3, color: hot ? UI.red : UI.ink}}>{n}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const STEPS = ['HOUR 1', 'HOUR 6', 'HOUR 12', 'HOUR 24', 'HOUR 48', 'HOUR 72', 'DAY 5', 'DAY 7'];
export const Timeline: Shot = ({d}) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [4, d * 0.9], [0, STEPS.length], clamp);
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, -6, 6), 9, 20]} tgt={[0, 3, -6]} power={0.3}>
        <City power={0} count={150} spread={34} clearRadius={3} />
      </Night>
      <AbsoluteFill style={{background: 'rgba(8,12,24,0.4)'}} />
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 120, color: UI.ink}}>
        7 DAYS. <span style={{color: UI.amber}}>HOUR BY HOUR.</span>
      </div>
      <div style={{position: 'absolute', top: 520, left: 110, right: 110, display: 'flex', gap: 12}}>
        {STEPS.map((s, i) => (
          <div key={s} style={{flex: 1, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 34, padding: '20px 0', borderRadius: 16, color: i < k ? '#0b1020' : UI.dim, background: i < k ? UI.amber : UI.panel}}>
            {s}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Sources: Shot = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, 5, 3), 6, 17]} tgt={[0, 3, -6]} power={0.3}>
        <City power={0} count={120} spread={32} clearRadius={3} />
      </Night>
      <AbsoluteFill style={{background: 'rgba(8,12,24,0.5)'}} />
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 44, letterSpacing: 6, color: UI.dim}}>EVERY RULE COMES FROM</div>
      <div style={{position: 'absolute', top: 400, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 50}}>
        {['CDC', 'FEMA', 'USDA'].map((n, i) => (
          <div key={n} style={{scale: String(pop(f, fps, 8 + i * 14)), fontFamily: FONT, fontWeight: 900, fontSize: 130, color: UI.ink, background: UI.panel, border: `6px solid ${UI.amber}`, borderRadius: 30, padding: '20px 60px'}}>
            {n}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const FridgeShot = (o: {open?: number | [number, number]; lit?: number; spoiled?: boolean; timer?: [number, number]; chip?: {text: string; color?: string; size?: number}; chips?: string[]; hero?: Pose | null; ring?: boolean; q?: boolean}): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const open = Array.isArray(o.open) ? ease(f, 4, 22, o.open[0], o.open[1]) : o.open ?? 0;
  const secs = o.timer ? interpolate(f, [0, d], o.timer, clamp) : 0;
  const hrs = secs / 3600;
  const xs = [0.2, 0.3, 0.4, 0.5].map((t) => pop(f, fps, Math.round(d * t)));
  return (
    <AbsoluteFill>
      <Room cam={[ease(f, 0, d, 1.8, 0.9), 2.5, ease(f, 0, d, 7.6, 6.6)]} tgt={[0.6, 1.7, 0]} lit={o.lit ?? 0}>
        <Fridge p={[-0.9, 0, -1.4]} open={open} spoiled={o.spoiled} />
        {o.spoiled && [[-1.25, 1.95], [-0.6, 1.82], [-1.15, 1.02], [-0.6, 1.02]].map(([x, y], i) => <RedX key={i} p={[x, y, -0.8]} k={xs[i]} size={0.5} />)}
        {open > 0.3 && <pointLight position={[-0.9, 2, 0.4]} color="#e8f4ff" intensity={3} distance={4} />}
        {o.hero !== null && <Hero f={f} pos={[2.2, 0, -0.2]} rotY={-0.7} pose={o.hero ?? {lookY: -0.5, brows: 'worried'}} voltPos={[3.6, 3.0, -0.6]} />}
      </Room>
      {o.timer && (
        <div style={{position: 'absolute', top: 270, left: 150, fontFamily: FONT, background: UI.panel, borderRadius: 26, padding: '16px 36px', border: `4px solid ${hrs >= 4 ? UI.red : '#2f3c70'}`}}>
          <div style={{fontWeight: 900, fontSize: 30, letterSpacing: 4, color: UI.dim}}>FRIDGE WITHOUT POWER</div>
          <div style={{fontWeight: 900, fontSize: 120, color: hrs >= 4 ? UI.red : UI.ink, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{fmtClock(secs)}</div>
        </div>
      )}
      {o.ring && (
        <div style={{position: 'absolute', top: 270, left: 150, display: 'flex', alignItems: 'center', gap: 26, background: UI.panel, borderRadius: 26, padding: '20px 36px'}}>
          <svg width={130} height={130} viewBox="0 0 110 110">
            <circle cx={55} cy={55} r={46} stroke="#2f3c70" strokeWidth={12} fill="none" />
            <circle cx={55} cy={55} r={46} stroke={UI.amber} strokeWidth={12} fill="none" strokeDasharray={289} strokeDashoffset={289 * (1 - interpolate(f, [4, d * 0.8], [0, 1], clamp))} transform="rotate(-90 55 55)" strokeLinecap="round" />
          </svg>
          <div style={{fontFamily: FONT, fontWeight: 900, color: UI.ink, lineHeight: 1}}>
            <div style={{fontSize: 100}}>~4 HOURS</div>
            <div style={{fontSize: 32, color: UI.amber, marginTop: 8, letterSpacing: 2}}>DOOR CLOSED · USDA</div>
          </div>
        </div>
      )}
      {o.chip && <Chip text={o.chip.text} color={o.chip.color} top={o.timer || o.ring ? 520 : 290} left={150} size={o.chip.size ?? 70} delay={8} />}
      {o.chips && o.chips.map((c, i) => <Chip key={c} text={c} color={UI.red} top={280 + i * 96} left={150} size={56} delay={Math.round(d * (0.2 + i * 0.1))} />)}
      {o.q && <Chip text="?" color={UI.red} top={260} left={420} size={220} delay={Math.round(d * 0.45)} />}
    </AbsoluteFill>
  );
};

// ============ hour 1 ============

export const WindowOff: Shot = ({d}) => {
  const f = useCurrentFrame();
  const lit = interpolate(f, [8, 12], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, 4, 2.6), 3, ease(f, 0, d, 10, 8.6)]} tgt={[-0.4, 2, -1]} power={0.4}>
        <City power={0} count={70} spread={30} clearRadius={8} />
        <House pos={[-2.4, 0, -3]} lit={lit} />
        <Hero f={f} pos={[1.2, 0, 0.4]} rotY={-0.2} pose={f > 16 ? {armL: 0.6, armR: 0.6, mouth: 'frown', brows: 'worried'} : {lookY: 0.8}} volt={f > 12 ? 'shock' : 'happy'} glow={lit} />
      </Night>
    </AbsoluteFill>
  );
};

const TerminalBox: React.FC<{p: V3; f: number}> = ({p, f}) => {
  const tex = useTextTexture(Math.floor(f / 10) % 2 === 0 ? 'NO\nNETWORK' : '', {w: 320, h: 256, size: 52});
  return (
    <group position={p} rotation={[-0.25, 0.3, 0]}>
      <Box s={[0.9, 1.3, 0.25]} c="#1e284d" />
      <Box p={[0, 0.32, 0.13]} s={[0.72, 0.5, 0.02]} c="#fff" map={tex} e={1} />
      {new Array(9).fill(0).map((_, i) => (
        <Box key={i} p={[-0.22 + (i % 3) * 0.22, -0.12 - Math.floor(i / 3) * 0.17, 0.13]} s={[0.16, 0.12, 0.03]} c="#3a4680" />
      ))}
    </group>
  );
};
export const CardReader = (mode: 'reader' | 'atm' | 'cash'): Shot => ({d}) => {
  const f = useCurrentFrame();
  const bill = interpolate(f, [8, 30], [5, 1.2], {...clamp});
  return (
    <AbsoluteFill>
      <Room cam={mode === 'atm' ? [ease(f, 0, d, -2.6, -1.6), 2.5, 7] : [ease(f, 0, d, 2.2, 1.2), 2.6, ease(f, 0, d, 7, 6)]} tgt={[0, 1.6, 0]} lit={0}>
        <Counter p={[-0.6, 0, 0.3]} w={3.4} />
        <TerminalBox p={[-1.1, 1.75, 0.5]} f={f} />
        {mode === 'atm' && (
          <group position={[2.6, 0, -1.6]}>
            <Box p={[0, 1.4, 0]} s={[1.4, 2.8, 0.9]} c="#59648c" />
            <Box p={[0, 2.0, 0.46]} s={[1.0, 0.7, 0.02]} c="#070a14" />
            <Box p={[0, 1.2, 0.46]} s={[0.7, 0.08, 0.02]} c="#11141f" />
            <RedX p={[0, 2.0, 0.6]} k={pop(f, 30, 12)} size={0.9} />
          </group>
        )}
        {mode === 'cash' && (
          <group position={[0.2, bill, 0.6]} rotation={[0, f / 14, 0]}>
            <Box s={[0.9, 0.03, 0.42]} c="#3c8f5a" e={0.5} />
          </group>
        )}
        <Hero f={f} pos={[1.2, 0, -0.6]} rotY={-0.5} pose={{hold: 'card', armRx: -0.9, lookY: -0.4, mouth: 'frown', brows: 'worried'}} voltPos={[-2.6, 2.9, -0.5]} />
        <pointLight position={[-1, 2.4, 1.6]} color="#ff5a4e" intensity={3} distance={4} />
      </Room>
      {mode === 'reader' && <Chip text="CARD DECLINED" color={UI.red} top={290} left={150} size={76} delay={8} />}
      {mode === 'atm' && <Chip text="READERS + ATMs NEED POWER" color={UI.amber} top={290} left={150} size={58} delay={8} />}
      {mode === 'cash' && <Chip text="CASH ONLY" color={UI.green} top={290} left={150} size={110} delay={10} />}
    </AbsoluteFill>
  );
};

const StationSet: React.FC<{f: number; gen?: boolean}> = ({f, gen}) => (
  <>
    <Canopy p={[0, 0, 0]} />
    <GasPump p={[-1.2, 0, 0]} />
    <GasPump p={[1.4, 0, 0]} />
    <Car p={[-1.2, 0, 2.0]} r={Math.PI / 2} c="#4e7fff" lights={1.5} />
    {gen && (
      <group position={[4.4, 0, 0.6]}>
        <Box p={[0, 0.5, 0]} s={[1.3, 1.0, 0.9]} c="#d9a21b" />
        <Box p={[0, 1.05, 0]} s={[1.4, 0.1, 1.0]} c="#2b2d33" />
        <Box p={[-1.0, 0.2, 0]} s={[1.2, 0.08, 0.08]} c="#111" />
        <pointLight position={[0, 1.6, 0.8]} color="#ffb238" intensity={5 + 2 * Math.sin(f / 3)} distance={5} />
      </group>
    )}
  </>
);
export const GasSurface = (v: 'wide' | 'pump' | 'gen' | 'row', chip?: {text: string; color?: string}): Shot => ({d}) => {
  const f = useCurrentFrame();
  const cam: V3 = v === 'pump' ? [ease(f, 0, d, 0.6, 0), 2.2, ease(f, 0, d, 5, 4.2)] : v === 'row' ? [ease(f, 0, d, -6, 4), 5, 20] : [ease(f, 0, d, 6, 4.4), 3.4, ease(f, 0, d, 12, 10.5)];
  const tgt: V3 = v === 'pump' ? [-1.2, 1.7, 0] : v === 'row' ? [0, 2, 0] : [0.4, 2, 0];
  return (
    <AbsoluteFill>
      <Night cam={cam} tgt={tgt} power={v === 'gen' ? 0.6 : 0.4}>
        <City power={0} count={60} spread={34} clearRadius={14} />
        <StationSet f={f} gen={v === 'gen'} />
        {v === 'row' && (
          <>
            <group position={[-11, 0, -2]}>
              <StationSet f={f} />
            </group>
            <group position={[11, 0, -2]}>
              <StationSet f={f} />
            </group>
          </>
        )}
        {(v === 'wide' || v === 'gen') && <Hero f={f} pos={[-3.2, 0, 2.2]} rotY={0.5} pose={v === 'gen' ? {mouth: 'smile', brows: 'up', armR: 1.2} : {armR: 2.6, brows: 'worried'}} volt={v === 'gen' ? 'happy' : 'worried'} glow={v === 'gen' ? 0.6 : 0} voltPos={[-4.6, 3, 1.6]} />}
      </Night>
      {chip && <Chip text={chip.text} color={chip.color} top={300} left={150} size={68} delay={8} />}
    </AbsoluteFill>
  );
};

// underground cutaway of a gas station: full tank, electric pump, fuel can't rise
export const TankCut = (stage: 0 | 1 | 2): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const x = pop(f, fps, Math.round(d * 0.3));
  const rise = stage === 0 ? 0 : (f * 0.04) % 1;
  return (
    <AbsoluteFill>
      <Cutaway cam={[ease(f, 0, d, 1.5, 0.3), stage === 2 ? -0.6 : 0.2, stage === 2 ? 9 : 13]} tgt={[0, stage === 2 ? -1.6 : -1.2, 0]}>
        <GasPump p={[0, 0, 0.4]} />
        <Car p={[2.6, 0, 0.6]} r={-Math.PI / 2} c="#4e7fff" lights={1} />
        {/* tank */}
        <mesh position={[0, -3.4, 0.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.2, 1.2, 6, 28]} />
          <meshStandardMaterial color="#6a76a0" transparent opacity={0.45} />
        </mesh>
        <mesh position={[0, -3.5, 0.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.05, 1.05, 5.7, 28]} />
          <meshStandardMaterial color="#ffb238" emissive="#c9861a" emissiveIntensity={0.7} />
        </mesh>
        {/* riser pipe + submersible pump */}
        <Box p={[0, -1.2, 0.3]} s={[0.22, 2.4, 0.22]} c="#aab3cc" />
        <Box p={[0, -2.3, 0.75]} s={[0.5, 0.7, 0.4]} c="#3d4770" />
        {stage > 0 && <Box p={[0, -2.3 + rise * 0.5, 0.45]} s={[0.14, 0.3, 0.14]} c="#ffb238" e={1.2} />}
        {stage > 0 && <RedX p={[0, -2.3, 1.1]} k={x} size={1.1} />}
      </Cutaway>
      {stage === 0 && <Chip text="TANK: FULL" color={UI.amber} top={690} left={220} size={70} delay={8} />}
      {stage === 1 && <Chip text="ELECTRIC PUMP" color={UI.red} top={560} right={380} size={60} delay={Math.round(d * 0.3)} />}
      {stage === 2 && <Chip text="NO POWER = NO PUMP" color={UI.red} top={290} center size={96} delay={4} />}
    </AbsoluteFill>
  );
};

// ============ hour 6 ============

export const FreezerShot = (mode: 0 | 1 | 2): Shot => ({d}) => {
  const f = useCurrentFrame();
  const fill = interpolate(f, [4, d * 0.7], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Room cam={[ease(f, 0, d, 2, 1), 3.2, ease(f, 0, d, 7.6, 6.8)]} tgt={[0.2, 1.3, 0]} lit={0}>
        <Freezer p={[-0.8, 0, -0.6]} lid={ease(f, 0, 16, 0, 1)} />
        <pointLight position={[-0.8, 2, 0.8]} color="#cfe6ff" intensity={5} distance={5} />
        <Hero f={f} pos={[1.9, 0, -0.4]} rotY={-0.6} pose={{lookY: -0.4, armL: 0.3, mouth: 'smile', brows: 'up'}} volt="happy" glow={0.3} voltPos={[3.2, 3, -0.8]} />
      </Room>
      {mode === 0 && <Chip text="KEEP THE LID SHUT" color={UI.blue} top={290} left={150} size={70} delay={8} />}
      {mode >= 1 && <Bar label="FULL FREEZER" value="~48 HRS" fill={mode === 1 ? fill : 1} color={UI.blue} top={280} left={150} />}
      {mode === 2 && <Bar label="HALF FULL" value="~24 HRS" fill={fill * 0.5} color={UI.amber} top={420} left={150} />}
    </AbsoluteFill>
  );
};

export const Intersection = (stage: 0 | 1): Shot => ({d}) => {
  const f = useCurrentFrame();
  const turn = stage === 1 ? Math.floor(f / 26) % 3 : -1;
  const go = (i: number) => (turn === i ? ((f % 26) / 26) * 7 : 0);
  return (
    <AbsoluteFill>
      <Night cam={stage === 0 ? [ease(f, 0, d, 3, 2), 3.4, ease(f, 0, d, 9, 8)] : [ease(f, 0, d, 8, 6), ease(f, 0, d, 9, 8), 13]} tgt={stage === 0 ? [-1.2, 3, 1] : [0, 0.6, 0]} power={0.4}>
        <City power={0} count={70} spread={32} clearRadius={10} />
        <Box p={[0, 0.02, 0]} s={[3.6, 0.02, 44]} c="#1a1f30" />
        <Box p={[0, 0.02, 0]} s={[44, 0.02, 3.6]} c="#1a1f30" />
        <group position={[-2.3, 0, 2.3]}>
          <Box p={[0, 2, 0]} s={[0.18, 4, 0.18]} c="#59648c" />
          <Box p={[0.6, 3.9, 0]} s={[1.3, 0.14, 0.14]} c="#59648c" />
          <Box p={[1.2, 3.4, 0]} s={[0.5, 1.3, 0.4]} c="#2b3350" />
          {[0, 1, 2].map((i) => (
            <Box key={i} p={[1.2, 3.8 - i * 0.4, 0.21]} s={[0.28, 0.28, 0.02]} c="#0a0e1a" />
          ))}
        </group>
        <Car p={[0.85, 0, 4.6 - go(0)]} r={Math.PI} c="#4e7fff" />
        <Car p={[-4.6 + go(1), 0, 0.85]} r={Math.PI / 2} c="#d6a23a" />
        <Car p={[-0.85, 0, -4.6 + go(2)]} c="#c44a4a" />
      </Night>
      {stage === 0 ? <Chip text="SIGNAL: DARK" color={UI.red} top={300} right={170} size={70} delay={8} /> : <Chip text="ALL-WAY STOP" color={UI.red} top={290} left={150} size={92} delay={6} />}
    </AbsoluteFill>
  );
};

// hero with phone + status overlays
export const PhoneShot = (o: {pct: [number, number]; bars?: [number, number]; net?: string; effort?: [number, number]; chip?: {text: string; color?: string; size?: number}; big?: boolean}): Shot => ({d}) => {
  const f = useCurrentFrame();
  const pct = interpolate(f, [0, d], o.pct, clamp);
  const bars = o.bars ? Math.round(interpolate(f, [0, d], o.bars, clamp)) : 3;
  const eff = o.effort ? interpolate(f, [0, d], o.effort, clamp) : 0;
  const col = pct > 35 ? UI.green : pct > 20 ? UI.amber : UI.red;
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, 2.2, 1.2), 2.6, ease(f, 0, d, 6.4, 5.4)]} tgt={[0.8, 2.1, 0]} power={0.4}>
        <City power={0} count={80} spread={30} clearRadius={7} />
        <Hero f={f} pos={[1.6, 0, 0]} rotY={-0.25} pose={{hold: 'phone', armRx: -1.3, armR: 0.25, lookX: 0.35, phoneGlow: 1, mouth: 'frown', brows: 'worried'}} voltPos={[3.1, 3, -0.4]} />
      </Night>
      <div style={{position: 'absolute', top: 270, left: 150, fontFamily: FONT, fontWeight: 900, background: UI.panel, borderRadius: 26, padding: '20px 34px', display: 'flex', alignItems: 'center', gap: 30}}>
        <div style={{position: 'relative', width: o.big ? 240 : 170, height: o.big ? 110 : 80, border: `8px solid ${UI.ink}`, borderRadius: 18}}>
          <div style={{position: 'absolute', left: 6, top: 6, bottom: 6, width: `${pct * 0.92}%`, background: col, borderRadius: 8}} />
        </div>
        <div style={{fontSize: o.big ? 150 : 104, color: col, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{Math.round(pct)}%</div>
        <div style={{display: 'flex', gap: 8, alignItems: 'flex-end', marginLeft: 16}}>
          {[1, 2, 3, 4].map((b) => (
            <span key={b} style={{width: 20, height: 14 + b * 14, borderRadius: 5, background: b <= bars ? UI.ink : '#2f3c70'}} />
          ))}
        </div>
        {o.net && <div style={{fontSize: 52, color: o.net.includes('✕') ? UI.red : UI.amber}}>{o.net}</div>}
      </div>
      {o.effort && <Bar label="PHONE RADIO: WORKING" value={eff > 0.7 ? 'MAX' : 'HARDER'} fill={eff} color={eff > 0.7 ? UI.red : UI.amber} top={470} left={150} />}
      {o.chip && <Chip text={o.chip.text} color={o.chip.color} top={o.effort ? 620 : 480} left={150} size={o.chip.size ?? 64} delay={8} />}
    </AbsoluteFill>
  );
};

export const TowerShotCell = (v: 'wide' | 'pole' | 'base' | 'dying'): Shot => ({d}) => {
  const f = useCurrentFrame();
  const spots: V3[] = [[-7, 0, -6], [-2, 0, -10], [3, 0, -7], [8, 0, -11], [-11, 0, -13], [0, 0, -16], [12, 0, -6]];
  const cams: Record<string, [V3, V3]> = {
    wide: [[ease(f, 0, d, 3, 1), 5, 12], [0, 4, -8]],
    pole: [[ease(f, 0, d, 2.6, 2), ease(f, 0, d, 2, 5.5), 8], [0, ease(f, 0, d, 2.5, 5), 0]],
    base: [[ease(f, 0, d, 5, 3.4), 2.2, ease(f, 0, d, 8, 5)], [1.4, 1, 0]],
    dying: [[ease(f, 0, d, -2, 2), 7, 13], [0, 4, -9]],
  };
  const [cam, tgt] = cams[v];
  return (
    <AbsoluteFill>
      <Night cam={cam} tgt={tgt} power={0.45}>
        <City power={0} count={80} spread={32} clearRadius={v === 'pole' || v === 'base' ? 9 : 5} />
        {v === 'pole' || v === 'base' ? <CellTower p={[0, 0, 0]} frame={f} h={8} shelter /> : spots.map((p, i) => <CellTower key={i} p={p} frame={f} h={6 + (i % 3)} alive={v === 'wide' ? true : f < 6 + i * (d / 8)} />)}
        {v === 'base' && <pointLight position={[2.2, 1.6, 2]} color="#ffb238" intensity={8} distance={6} />}
      </Night>
      {v === 'wide' && <Chip text="SIGNAL: STILL UP… FOR NOW" color={UI.amber} top={300} left={150} size={62} delay={8} />}
      {v === 'pole' && <Chip text="LOOKS LIKE A POLE" color={UI.ink} top={300} left={150} size={66} delay={6} />}
      {v === 'base' && <Chip text="THE REAL TOWER IS THIS ROOM" color={UI.amber} top={300} left={150} size={60} delay={8} />}
      {v === 'dying' && <Chip text="TOWERS: DRAINING" color={UI.red} top={300} left={150} size={70} delay={8} />}
    </AbsoluteFill>
  );
};

// cutaway of the equipment shelter: battery racks draining
export const BatteryRoom = (withBar: boolean): Shot => ({d}) => {
  const f = useCurrentFrame();
  const charge = interpolate(f, [0, d], withBar ? [0.75, 0.3] : [1, 0.75], clamp);
  return (
    <AbsoluteFill>
      <Room cam={[ease(f, 0, d, 1.4, 0.4), 2.2, ease(f, 0, d, 8, 7)]} tgt={[0, 1.7, -1]} lit={0}>
        {[-2.4, -0.8, 0.8, 2.4].map((x, i) => (
          <group key={x} position={[x, 0, -1.8]}>
            <Box p={[0, 1.7, 0]} s={[1.3, 3.4, 0.7]} c="#2b3350" />
            {[0, 1, 2, 3].map((r) => {
              const on = (r + 0.5) / 4 < charge + (i % 2) * 0.05;
              return <Box key={r} p={[0, 0.5 + r * 0.8, 0.36]} s={[1.05, 0.55, 0.04]} c={on ? '#4ee08a' : '#5a2a2a'} e={on ? 1.2 : 0.2} />;
            })}
          </group>
        ))}
        <pointLight position={[0, 2.6, 1.2]} color="#4ee08a" intensity={6 * charge} distance={8} />
      </Room>
      <Chip text="ROOM FULL OF BATTERIES" color={UI.green} top={280} left={150} size={60} delay={6} />
      {withBar && (
        <>
          <Bar label="BACKUP: MINIMUM" value="4 HRS" fill={0.5} color={UI.red} top={410} left={150} />
          <Bar label="BACKUP: GOAL" value="8 HRS" fill={1} color={UI.amber} top={550} left={150} />
        </>
      )}
    </AbsoluteFill>
  );
};

// ============ hour 12 ============

export const RouterShot: Shot = ({d}) => {
  const f = useCurrentFrame();
  const on = f < 14;
  return (
    <AbsoluteFill>
      <Room cam={[ease(f, 0, d, 1.6, 0.6), 2.4, ease(f, 0, d, 6.6, 5.6)]} tgt={[-0.4, 1.5, 0]} lit={on ? 1 : 0}>
        <Counter p={[-1.2, 0, 0.2]} w={2.2} />
        <group position={[-1.2, 1.24, 0.2]}>
          <Box s={[0.9, 0.18, 0.55]} c="#20232c" />
          {[-0.32, 0.32].map((x) => (
            <Box key={x} p={[x, 0.42, -0.2]} r={[0, 0, x * 0.4]} s={[0.06, 0.75, 0.06]} c="#20232c" />
          ))}
          {[-0.2, 0, 0.2].map((x, i) => (
            <Box key={x} p={[x, 0.02, 0.29]} s={[0.07, 0.05, 0.02]} c={i === 2 ? COL.green : '#7cc4ff'} e={on ? 3 : 0} />
          ))}
          {[0.5, 0.9, 1.3].map((r, k) => (
            <mesh key={k} position={[0, 0.9 + k * 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[r, 0.05, 8, 48]} />
              <meshStandardMaterial color="#7cc4ff" emissive="#7cc4ff" emissiveIntensity={1.5} transparent opacity={on ? 0.5 + 0.4 * Math.abs(Math.sin(f / 4 + k)) : interpolate(f, [14, 22], [0.8, 0], clamp)} />
            </mesh>
          ))}
        </group>
        <Hero f={f} pos={[1.4, 0, 0]} rotY={-0.6} pose={{hold: 'phone', armRx: -1.2, lookY: -0.4, phoneGlow: 1, mouth: on ? 'flat' : 'frown', brows: on ? 'none' : 'worried'}} volt={on ? 'happy' : 'shock'} glow={on ? 1 : 0} voltPos={[2.9, 3, -0.6]} />
      </Room>
      <Chip text={on ? 'Wi-Fi: ON' : 'NO POWER = NO Wi-Fi'} color={on ? UI.blue : UI.red} top={290} left={150} size={72} delay={on ? 0 : 14} />
    </AbsoluteFill>
  );
};

export const Jam = (busy: boolean): Shot => ({d}) => {
  const f = useCurrentFrame();
  const homes: V3[] = [[-9, 0, -2], [-7, 0, -9], [8, 0, -2.5], [7, 0, -10], [-1, 0, -13], [0, 0, 3]];
  const T: V3 = [0, 0, -5];
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, 3, 1), 11, 13]} tgt={[0, 2, -5]} power={0.5}>
        <City power={0} count={40} spread={34} clearRadius={15} />
        {homes.map((p, i) => (
          <group key={i} scale={0.6}>
            <House pos={[p[0] / 0.6, 0, p[2] / 0.6]} lit={0} rotY={Math.atan2(T[0] - p[0], T[2] - p[2])} />
          </group>
        ))}
        <CellTower p={T} frame={f} h={6} />
        {homes.flatMap((h, i) =>
          [0, 1, 2].map((k) => {
            const p = (f * 0.03 + i * 0.17 + k * 0.33) % 1;
            const rej = busy && (i + k) % 2 === 0 && p > 0.7;
            return <Box key={`${i}${k}`} p={[h[0] + (T[0] - h[0]) * p, 2 + p * 3.5 + Math.sin(p * Math.PI) * 1.4, h[2] + (T[2] - h[2]) * p]} s={[0.36, 0.36, 0.36]} c={rej ? COL.red : '#7cc4ff'} e={2} />;
          }),
        )}
        {busy && [0, 1, 2].map((k) => {
          const p = ((f + k * 12) % 36) / 36;
          return (
            <mesh key={k} position={[T[0], 6.2, T[2]]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.4 + p * 3.2, 0.09, 8, 48]} />
              <meshStandardMaterial color={COL.red} emissive={COL.red} emissiveIntensity={1.5} transparent opacity={1 - p} />
            </mesh>
          );
        })}
      </Night>
      <Chip text={busy ? 'NETWORK BUSY' : 'EVERYONE IS CALLING'} color={busy ? '#fff' : UI.amber} bg={busy ? '#d81e1e' : UI.panel} top={290} center size={busy ? 100 : 76} delay={4} />
    </AbsoluteFill>
  );
};

export const TextUI = (stage: 0 | 1): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = pop(f, fps, 4);
  const m1 = pop(f, fps, stage === 0 ? Math.round(d * 0.5) : 2, 14);
  const m2 = pop(f, fps, stage === 0 ? 999 : Math.round(d * 0.25), 14);
  const ok = stage === 1 && f > d * 0.55;
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, 1.4, 0.6), 2.6, 6.2]} tgt={[-1.2, 2, 0]} power={0.45}>
        <City power={0} count={70} spread={30} clearRadius={7} />
        <Hero f={f} pos={[-2.2, 0, 0]} rotY={0.5} pose={{hold: 'phone', armRx: -1.3, lookX: 0.3, lookY: 0.2, phoneGlow: 1, mouth: ok ? 'smile' : 'flat', brows: ok ? 'up' : 'worried'}} volt={ok ? 'happy' : 'worried'} glow={ok ? 0.5 : 0} voltPos={[-3.8, 3.1, -0.4]} />
      </Night>
      <div style={{position: 'absolute', right: 190, top: 200, width: 520, height: 760, borderRadius: 60, background: '#0d111c', padding: 20, border: '4px solid #2f3c70', boxSizing: 'border-box'}}>
        <div style={{width: '100%', height: '100%', borderRadius: 42, background: '#f3f2ee', position: 'relative', overflow: 'hidden', fontFamily: FONT}}>
          <div style={{position: 'absolute', top: 26, width: '100%', textAlign: 'center', fontWeight: 900, fontSize: 30, color: '#1f2937'}}>Mom</div>
          <div style={{position: 'absolute', top: 86, left: 28, right: 28, padding: '16px 0', borderRadius: 22, background: '#d81e1e', color: '#fff', fontWeight: 900, fontSize: 32, textAlign: 'center', scale: String(a), opacity: stage === 1 ? 0.4 : 1}}>📞 Call failed</div>
          <div style={{position: 'absolute', top: 230, left: 24, maxWidth: 340, padding: '18px 22px', borderRadius: '26px 26px 26px 8px', background: '#e1e4ea', color: '#1f2937', fontWeight: 600, fontSize: 34, scale: String(m1), transformOrigin: 'left bottom'}}>Are you OK??</div>
          <div style={{position: 'absolute', top: 360, right: 24, maxWidth: 360, padding: '18px 22px', borderRadius: '26px 26px 8px 26px', background: '#2f80ed', color: '#fff', fontWeight: 600, fontSize: 34, scale: String(m2), transformOrigin: 'right bottom'}}>Power's out. We're fine.</div>
          <div style={{position: 'absolute', top: 520, right: 30, fontWeight: 900, fontSize: 28, color: '#2f9a55', opacity: ok ? 1 : 0}}>Delivered ✓</div>
        </div>
      </div>
      <Chip text={stage === 0 ? 'KEEP CALLS SHORT' : 'TEXT INSTEAD'} color={UI.amber} top={290} left={150} size={70} delay={8} />
    </AbsoluteFill>
  );
};

export const CarCharge = (v: 'charge' | 'outside' | 'garage' | 'day2'): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inGarage = v === 'garage' || v === 'day2';
  const x = pop(f, fps, 8);
  return (
    <AbsoluteFill>
      <Night cam={v === 'outside' ? [ease(f, 0, d, 9, 7), 6, 14] : v === 'day2' ? [ease(f, 0, d, 1, 0), 2.4, ease(f, 0, d, 11, 8)] : [ease(f, 0, d, 5, 3.6), 3, ease(f, 0, d, 10, 8.6)]} tgt={[inGarage ? -3 : 0.6, 1.4, 0]} power={0.45}>
        <City power={0} count={60} spread={32} clearRadius={12} />
        <House pos={[-7.4, 0, -1.6]} lit={0} />
        <Garage p={[-3, 0, -1]} />
        <Box p={[-3, 0.02, 3.5]} s={[3, 0.02, 7]} c="#252b40" />
        <Car p={[-3, 0, inGarage ? -0.8 : 4.4]} c="#4e7fff" lights={2.5} />
        {!inGarage && <Hero f={f} pos={[-0.8, 0, 4.6]} rotY={-0.9} pose={{hold: 'phone', armRx: -1.0, phoneGlow: 1, mouth: 'smile', brows: 'up'}} volt="happy" glow={0.5} voltPos={[0.6, 3, 4.2]} />}
        {inGarage && <RedX p={[-3, 1.4, 1.7]} k={x} size={2.4} />}
        {v === 'day2' && <pointLight position={[-3, 1.2, 0.5]} color="#ff5a4e" intensity={10 + 6 * Math.sin(f / 4)} distance={7} />}
      </Night>
      {v === 'charge' && <Chip text="🔌 CHARGE IN THE CAR" color={UI.green} top={290} left={150} size={66} delay={8} />}
      {v === 'outside' && <Chip text="CAR OUTSIDE · IN THE OPEN" color={UI.green} top={290} left={150} size={66} delay={8} />}
      {v === 'garage' && <Chip text="NEVER IN THE GARAGE" color="#fff" bg="#d81e1e" top={290} right={170} size={76} delay={6} />}
      {v === 'day2' && <Chip text="REMEMBER THIS ON DAY 2" color={UI.red} top={290} right={170} size={62} delay={8} />}
    </AbsoluteFill>
  );
};

// section title: "HOUR 6" over the dark city
export const Title = (big: string, sub: string, color = UI.amber): Shot => ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(f, fps, 0, 14);
  return (
    <AbsoluteFill>
      <Night cam={[ease(f, 0, d, -4, 2), 10, 20]} tgt={[0, 3, -6]} power={0.3}>
        <City power={0} count={170} spread={34} clearRadius={3} />
      </Night>
      <AbsoluteFill style={{background: 'rgba(8,12,24,0.35)'}} />
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 900, scale: String(0.85 + 0.15 * s)}}>
        <div style={{fontSize: 230, color, lineHeight: 1, textShadow: `0 0 80px ${color}66`}}>{big}</div>
        <div style={{fontSize: 60, color: UI.ink, marginTop: 10, letterSpacing: 3}}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};
