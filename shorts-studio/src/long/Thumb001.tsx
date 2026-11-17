// Thumbnails for Long 001. Variant via input prop `v`: 'A' (DON'T EAT THIS, close-up), 'B' (DAY 2: NO WATER), 'C' (7 DAYS board).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Box, Lineman, Volt} from '../three/kit';
import {Faucet, FONT, Fridge, Room, UI, WaterTower} from './props';

const Carton: React.FC<{p: [number, number, number]; r?: [number, number, number]; s?: number}> = ({p, r = [0, 0, 0], s = 1}) => (
  <group position={p} rotation={r} scale={s}>
    <Box s={[0.34, 0.55, 0.34]} c="#f7f7f2" />
    <Box p={[0, 0.34, 0]} r={[0, 0, Math.PI / 4]} s={[0.24, 0.24, 0.34]} c="#f7f7f2" />
    <Box p={[0, 0.0, 0.175]} s={[0.3, 0.24, 0.01]} c="#2f80ed" />
  </group>
);

const Bar: React.FC<{lines: string[]; top?: number; left?: number; size?: number; bg?: string; color?: string}> = ({lines, top = 40, left = 40, size = 128, bg = '#e01b1b', color = '#fff'}) => (
  <div style={{position: 'absolute', top, left, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10}}>
    {lines.map((l) => (
      <div key={l} style={{background: bg, padding: '2px 26px 8px', borderRadius: 12, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1, color, letterSpacing: -2, boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
        {l}
      </div>
    ))}
  </div>
);

const A: React.FC = () => (
  <AbsoluteFill style={{background: '#0b1020'}}>
    <Room cam={[0.75, 2.45, 4.0]} tgt={[0.35, 2.1, -0.3]} lit={0}>
      <color attach="background" args={['#101a3a']} />
      <Fridge p={[-2.3, 0, -1.8]} open={1} rotY={0.5} />
      {/* fridge glow behind the hero */}
      <pointLight position={[-1.6, 1.9, -0.9]} color="#d8ecff" intensity={16} distance={5} />
      <pointLight position={[1.6, 2.6, 2.2]} color="#ffe9c0" intensity={9} distance={6} />
      <Lineman frame={12} pos={[1.05, 0, -0.1]} rotY={-0.2} pose={{armRx: -1.5, armR: 0.35, lookX: 0.05, lookY: -0.25, mouth: 'o', brows: 'worried'}} />
      <Carton p={[0.2, 2.2, 0.55]} r={[0.05, -0.2, 0.25]} s={1.35} />
      {/* stink lines */}
      {[0, 1, 2].map((i) => (
        <Box key={i} p={[0.03 + i * 0.15, 2.92 + (i % 2) * 0.07, 0.55]} r={[0, 0, 0.3 - i * 0.3]} s={[0.04, 0.28, 0.04]} c="#7bd34a" e={1.5} />
      ))}
      <Volt frame={12} pos={[2.35, 2.75, -0.8]} glow={0} mood="shock" />
    </Room>
    <Bar lines={["DON'T", 'EAT THIS']} size={132} />
    <div style={{position: 'absolute', left: 48, bottom: 44, background: '#ffd21f', color: '#111', borderRadius: 16, padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: 70, boxShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>
      AFTER 4 HOURS
    </div>
  </AbsoluteFill>
);

const B: React.FC = () => (
  <AbsoluteFill style={{background: '#0b1020'}}>
    <Room cam={[1.2, 2.0, 3.0]} tgt={[0.1, 1.55, 0]} lit={0}>
      <color attach="background" args={['#ff8a3d']} />
      <Box p={[0, 0.55, 0]} s={[4.2, 1.1, 1.0]} c="#4a3a30" />
      <Box p={[0, 1.13, 0]} s={[4.3, 0.06, 1.1]} c="#d9dde8" />
      <Faucet p={[0, 1.16, 0]} flow={0} />
      <Box p={[0, 1.88, 0.3]} s={[0.12, 0.16, 0.12]} c="#4aa3ff" e={1.5} />
      <pointLight position={[0.5, 2.5, 2]} color="#fff2dc" intensity={8} distance={6} />
      <WaterTower p={[-3.4, -2.4, -6]} level={0.06} scale={0.9} />
      <Lineman frame={12} pos={[1.7, 0, -0.6]} rotY={-0.6} pose={{lookY: -0.5, lookX: 0.2, mouth: 'frown', brows: 'worried', armL: 0.4, armR: 0.4}} />
    </Room>
    <Bar lines={['DAY 2:', 'NO WATER']} size={128} />
  </AbsoluteFill>
);

const SYS = ['POWER', 'CARD', 'FUEL', 'PHONE', 'WATER', 'FOOD', 'HEAT', 'SEWER'];
const C: React.FC = () => (
  <AbsoluteFill style={{background: '#0d1530'}}>
    <AbsoluteFill>
      <Room cam={[-1.6, 2.2, 5.2]} tgt={[-1.6, 1.9, 0]} lit={0}>
        <color attach="background" args={['#0d1530']} />
        <pointLight position={[0, 3, 2]} color="#ffe2b0" intensity={10} distance={6} />
        <Lineman frame={12} pos={[0, 0, 0]} rotY={-0.25} pose={{mouth: 'o', brows: 'worried', hold: 'flashlight', armRx: -1.2}} />
        <Volt frame={12} pos={[1.3, 3.1, -0.6]} glow={0} mood="shock" />
      </Room>
    </AbsoluteFill>
    <div style={{position: 'absolute', top: 40, left: 48, fontFamily: FONT, fontWeight: 900, fontSize: 128, lineHeight: 0.95, color: '#fff', letterSpacing: -3}}>
      7 DAYS
      <br />
      <span style={{color: '#ffd21f'}}>NO POWER</span>
    </div>
    <div style={{position: 'absolute', left: 48, bottom: 48, display: 'grid', gridTemplateColumns: 'repeat(4, 140px)', gap: 14}}>
      {SYS.map((s, i) => {
        const red = i < 7;
        return (
          <div key={s} style={{background: 'rgba(11,16,32,0.9)', border: `5px solid ${red ? UI.red : UI.green}`, borderRadius: 18, padding: '10px 0', textAlign: 'center', fontFamily: FONT, fontWeight: 900}}>
            <div style={{width: 40, height: 40, borderRadius: 20, margin: '0 auto', background: red ? UI.red : UI.green, boxShadow: `0 0 24px ${red ? UI.red : UI.green}`}} />
            <div style={{fontSize: 26, color: '#fff', marginTop: 6}}>{s}</div>
          </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

// bright versions after the competitor review: daylight, exaggerated emotion, outlined text
const Outline: React.FC<{children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties}> = ({children, size, color = '#fff', style}) => (
  <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 0.95, color, letterSpacing: -2, WebkitTextStroke: `${Math.round(size / 9)}px #111`, paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(0,0,0,0.35)', ...style}}>{children}</div>
);
const Sweat: React.FC<{p: [number, number, number]}> = ({p}) => (
  <group position={p}>
    <Box s={[0.09, 0.14, 0.05]} c="#7cc4ff" e={0.8} />
    <Box p={[0, 0.09, 0]} s={[0.05, 0.06, 0.05]} c="#7cc4ff" e={0.8} />
  </group>
);
const A2: React.FC = () => (
  <AbsoluteFill style={{background: '#f3e7d2'}}>
    <Room cam={[0.2, 2.35, 4.1]} tgt={[0.0, 2.0, -0.3]} lit={1}>
      <color attach="background" args={['#f6e9d2']} />
      <Fridge p={[-1.9, 0, -1.6]} open={1} rotY={0.45} />
      <directionalLight position={[3, 6, 5]} intensity={1.4} color="#fff4e0" />
      <Lineman frame={12} pos={[1.45, 0, -0.1]} rotY={-0.25} pose={{armRx: -1.5, armR: 0.35, lookX: 0.0, lookY: -0.25, mouth: 'o', brows: 'worried'}} />
      <Sweat p={[1.95, 3.0, 0.35]} />
      <Sweat p={[0.95, 2.85, 0.4]} />
      <Carton p={[0.6, 1.75, 0.6]} r={[0.05, -0.2, 0.25]} s={1.4} />
      <Volt frame={12} pos={[2.55, 2.6, -0.8]} glow={0} mood="shock" />
      {[0, 1, 2].map((i) => (
        <Box key={i} p={[0.43 + i * 0.16, 2.5 + (i % 2) * 0.08, 0.6]} r={[0, 0, 0.3 - i * 0.3]} s={[0.05, 0.32, 0.05]} c="#3fae2a" e={0.6} />
      ))}
    </Room>
    <div style={{position: 'absolute', top: 36, left: 44}}>
      <Outline size={136}>DON'T</Outline>
      <Outline size={136} color="#ffd21f">EAT THIS</Outline>
    </div>
    <div style={{position: 'absolute', left: 44, bottom: 40, background: '#e01b1b', color: '#fff', borderRadius: 14, padding: '6px 24px', fontFamily: FONT, fontWeight: 900, fontSize: 64, boxShadow: '0 8px 0 rgba(0,0,0,0.3)'}}>
      AFTER A BLACKOUT
    </div>
  </AbsoluteFill>
);
const C2: React.FC = () => (
  <AbsoluteFill style={{background: '#f3e7d2'}}>
    <Room cam={[-1.75, 2.2, 5.4]} tgt={[-1.75, 1.9, 0]} lit={1}>
      <color attach="background" args={['#f6e9d2']} />
      <directionalLight position={[3, 6, 5]} intensity={1.3} color="#fff4e0" />
      <Fridge p={[1.9, 0, -1.6]} open={1} rotY={-0.4} />
      <Lineman frame={12} pos={[0, 0, 0]} rotY={-0.25} pose={{mouth: 'o', brows: 'worried', hold: 'flashlight', armRx: -1.2}} />
      <Sweat p={[0.5, 3.0, 0.4]} />
      <Volt frame={12} pos={[0.95, 3.2, -0.8]} glow={0} mood="shock" />
    </Room>
    <div style={{position: 'absolute', top: 40, left: 44}}>
      <Outline size={170}>7 DAYS</Outline>
      <Outline size={150} color="#ffd21f">NO POWER</Outline>
    </div>
    <div style={{position: 'absolute', left: 44, bottom: 44, display: 'flex', gap: 12}}>
      {['CARD', 'GAS', 'WATER', 'FOOD', 'HEAT'].map((t) => (
        <div key={t} style={{background: '#111', color: '#fff', borderRadius: 12, padding: '8px 16px', fontFamily: FONT, fontWeight: 900, fontSize: 36, display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{width: 22, height: 22, borderRadius: 11, background: UI.red, boxShadow: `0 0 12px ${UI.red}`}} />
          {t}
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

export const Thumb001: React.FC<{v?: 'A' | 'B' | 'C' | 'A2' | 'C2'}> = ({v = 'A'}) =>
  v === 'B' ? <B /> : v === 'C' ? <C /> : v === 'A2' ? <A2 /> : v === 'C2' ? <C2 /> : <A />;
