// Long 001 — "7 Days Without Power: What Stops Working, Hour by Hour" (1920x1080).
// Shots are keyed to narration phrases: {b: block id, p: phrase index, o: offset inside the phrase 0..1}.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timing from './long001_timing.json';
import {clamp} from './three/kit';
import {FONT, UI} from './long/props';
import * as S from './long/scenes';
import * as T from './long/scenes2';

export const L1_FPS = 30;
export const L1_END_SCREEN = 20; // seconds kept free for the YouTube end screen
type Cap = {start: number; end: number; text: string; block: string};
type Blk = {id: string; start?: number; duration?: number; audio?: string; missing?: boolean};
const CAPS = timing.captions as Cap[];
const BLOCKS = (timing.blocks as Blk[]).filter((b) => !b.missing);
const ALL_RECORDED = BLOCKS.length === timing.blocks.length;
const byBlock: Record<string, Cap[]> = {};
CAPS.forEach((c) => (byBlock[c.block] ??= []).push(c));
const at = (b: string, p: number, o = 0) => {
  const c = byBlock[b]?.[p];
  return c ? c.start + (c.end - c.start) * o : null;
};
export const L1_SECONDS = timing.duration + (ALL_RECORDED ? L1_END_SCREEN : 1);
export const L1_FRAMES = Math.ceil(L1_SECONDS * L1_FPS);

const A = UI.amber, R = UI.red, G = UI.green, B = UI.blue;
const sh = (b: string, p: number, C: S.Shot, o = 0) => ({b, p, o, C});

const SHOTS = [
  // ---- cold open
  sh('b00', 0, S.TapDark),
  sh('b00', 1, S.TowerShot(0.9, 0.3, {text: 'STOPS AFTER ~24 HOURS', color: R})),
  sh('b00', 2, S.BoardBig),
  sh('b00', 3, S.CityShot(1, 1, 'high', {text: 'THIS IS A WHAT-IF'})),
  sh('b00', 4, S.CityShot(0, 1, 'low', {text: 'MOST BLACKOUTS: HOURS', color: G})),
  sh('b00', 5, S.CityShot(1, 0, 'side', {text: "THIS ONE DOESN'T END", color: R})),
  sh('b00', 6, S.Timeline),
  sh('b00', 8, S.Sources),
  sh('b00', 9, S.HeroShot({armR: 2.6, brows: 'up'}, 'worried', {text: 'STAY TO THE END', size: 90})),
  sh('b00', 10, S.CityShot(1, 0, 'low', {text: 'NOT WHEN THE LIGHTS GO OUT'})),
  sh('b00', 11, S.CityShot(0, 1, 'high', {text: 'WHEN THEY COME BACK ON', color: G})),
  sh('b00', 12, S.FridgeShot({open: [0, 1], lit: 1, q: true})),
  // ---- hour 1
  sh('b01', 0, S.WindowOff),
  sh('b01', 1, S.HeroShot({armL: 0.5, armR: 0.5, brows: 'worried'}, 'worried', {text: 'LIGHTS OUT', size: 96}, true)),
  sh('b01', 2, S.CityShot(0, 0, 'side', {text: 'WHAT COMES NEXT…', color: A})),
  sh('b01', 4, S.CardReader('reader')),
  sh('b01', 5, S.CardReader('atm')),
  sh('b01', 6, S.CardReader('cash')),
  sh('b01', 7, S.GasSurface('wide', {text: 'THE GAS STATION'})),
  sh('b01', 8, S.GasSurface('pump', {text: 'PUMP DISPLAY: DEAD', color: R})),
  sh('b01', 9, S.GasSurface('wide', {text: 'NOT OUT OF GAS', color: A})),
  sh('b01', 10, S.TankCut(0)),
  sh('b01', 11, S.TankCut(1)),
  sh('b01', 11, S.GasSurface('pump', {text: 'ELECTRIC PUMP', color: R}), 0.6),
  sh('b01', 12, S.TankCut(2)),
  sh('b01', 14, S.GasSurface('gen', {text: 'A FEW STATES PLAN FOR THIS', color: G}), -0.14),
  sh('b01', 14, S.CardShot('FLORIDA · STATUTE 526.143', ['Many stations near highways', 'and evacuation routes must be', 'wired for a backup generator.'], G), 0.22),
  sh('b01', 14, S.GasSurface('gen', {text: 'GENERATOR-READY', color: G}), 0.7),
  sh('b01', 15, S.GasSurface('row', {text: 'MOST STATES: NO SUCH RULE', color: R})),
  sh('b01', 16, S.FridgeShot({chip: {text: 'AND YOUR FRIDGE?', color: A}})),
  sh('b01', 17, S.FridgeShot({timer: [0, 1500], hero: null})),
  // ---- hour 6
  sh('b02', 0, S.FridgeShot({timer: [4 * 3600 - 45, 4 * 3600 + 60]})),
  sh('b02', 1, S.FridgeShot({ring: true, hero: null})),
  sh('b02', 1, S.FridgeShot({chip: {text: 'KEEP THE DOOR CLOSED', color: B}}), 0.6),
  sh('b02', 2, S.FridgeShot({open: [0, 1], spoiled: true, chips: ['MEAT', 'MILK', 'EGGS', 'LEFTOVERS'], hero: {mouth: 'frown', brows: 'worried', lookY: -0.3}})),
  sh('b02', 3, S.FreezerShot(0)),
  sh('b02', 4, S.FreezerShot(1)),
  sh('b02', 4, S.FreezerShot(2), 0.85),
  sh('b02', 6, S.Intersection(0), 0.5),
  sh('b02', 7, S.Intersection(1), 0.25),
  sh('b02', 8, S.PhoneShot({pct: [62, 61], bars: [3, 3], chip: {text: 'STILL HAS SIGNAL', color: G}})),
  sh('b02', 9, S.TowerShotCell('wide')),
  sh('b02', 10, S.TowerShotCell('pole')),
  sh('b02', 11, S.TowerShotCell('base')),
  sh('b02', 12, S.BatteryRoom(false)),
  sh('b02', 13, S.BatteryRoom(true)),
  sh('b02', 14, S.CardShot('FCC · AFTER HURRICANE KATRINA', ['Proposed rule:', '8 hours of backup power', 'at cell sites, nationwide.'], B)),
  sh('b02', 15, S.CardShot('FCC · AFTER HURRICANE KATRINA', ['Proposed rule:', '8 hours of backup power', 'at cell sites, nationwide.'], B, 'NEVER TOOK EFFECT')),
  sh('b02', 16, S.TowerShotCell('dying')),
  sh('b02', 17, S.TowerShot(0.62, 0.5, {text: 'ALSO DRAINING', color: R})),
  // ---- hour 12
  sh('b03', 0, S.PhoneShot({pct: [41, 40], big: true})),
  sh('b03', 1, S.PhoneShot({pct: [40, 36], chip: {text: 'DROPPING FAST', color: R}})),
  sh('b03', 2, S.RouterShot),
  sh('b03', 3, S.PhoneShot({pct: [36, 35], net: 'LTE', chip: {text: 'CELL NETWORK ONLY', color: A}})),
  sh('b03', 4, S.TowerShotCell('dying')),
  sh('b03', 5, S.PhoneShot({pct: [35, 31], bars: [3, 1], effort: [0.2, 1]})),
  sh('b03', 6, S.PhoneShot({pct: [31, 28], bars: [1, 1], big: true, chip: {text: 'THAT BURNS BATTERY', color: R}})),
  sh('b03', 7, S.Jam(false)),
  sh('b03', 8, S.Jam(true)),
  sh('b03', 9, S.TextUI(0)),
  sh('b03', 10, S.TextUI(1)),
  sh('b03', 11, S.CarCharge('charge')),
  sh('b03', 12, S.CarCharge('outside')),
  sh('b03', 13, S.CarCharge('garage')),
  sh('b03', 14, S.CarCharge('day2')),
  sh('b03', 16, S.CityShot(0, 0, 'high', {text: 'BY HOUR 24…', color: A})),
  sh('b03', 17, S.PhoneShot({pct: [21, 20], bars: [1, 1], chip: {text: 'NOT THE PROBLEM'}})),
  sh('b03', 18, S.TowerShot(0.22, 0.08, {text: "IT'S YOUR WATER", color: R})),
  // ---- hour 24
  sh('b04', 0, S.Title('HOUR 24', 'WATER', B)),
  sh('b04', 1, T.TapFlow('strong')),
  sh('b04', 2, T.PipeCut('pipe')),
  sh('b04', 3, T.PipeCut('hill')),
  sh('b04', 4, T.PipeCut('tower')),
  sh('b04', 6, T.Heavy),
  sh('b04', 7, T.PipeCut('gravity')),
  sh('b04', 8, T.PipeCut('pressure')),
  sh('b04', 9, T.PipeCut('gravity')),
  sh('b04', 10, T.HighRise(0)),
  sh('b04', 11, T.HighRise(0), 0.5),
  sh('b04', 12, T.HighRise(1)),
  sh('b04', 13, S.TowerShot(0.8, 0.75, {text: 'WHO FILLED THE TOWER?', color: A})),
  sh('b04', 14, T.PipeCut('pumps')),
  sh('b04', 16, T.PipeCut('drain')),
  sh('b04', 16, S.TowerShot(0.5, 0.3, {text: '~1 DAY OF NORMAL USE', color: A}), 0.55),
  sh('b04', 17, T.TapFlow('listen')),
  sh('b04', 18, T.TapFlow('sputter'), 0.35),
  sh('b04', 19, T.Cracks(false)),
  sh('b04', 20, T.Cracks(true)),
  sh('b04', 21, T.BoilNotice(0)),
  sh('b04', 22, T.BoilNotice(1)),
  sh('b04', 23, S.CityShot(0, 0, 'low', {text: 'FIRST THING TO DO', color: B})),
  sh('b04', 24, T.FillAll(0)),
  sh('b04', 25, T.FillAll(1)),
  sh('b04', 26, T.FillAll(2), 0.3),
  sh('b04', 27, S.Title('HOUR 48', 'COMING UP', R)),
  sh('b04', 28, T.Tease48),
];

// ---------- status board ----------
const SYSTEMS = ['POWER', 'CARD', 'FUEL', 'PHONE', 'WATER', 'FOOD', 'HEAT', 'SEWER'] as const;
type Lamp = 'g' | 'a' | 'r';
const CHANGES: {b: string; p: number; sys: (typeof SYSTEMS)[number]; to: Lamp}[] = [
  {b: 'b01', p: 0, sys: 'POWER', to: 'r'},
  {b: 'b01', p: 4, sys: 'CARD', to: 'r'},
  {b: 'b01', p: 12, sys: 'FUEL', to: 'r'},
  {b: 'b02', p: 2, sys: 'FOOD', to: 'a'},
  {b: 'b03', p: 0, sys: 'PHONE', to: 'a'},
  {b: 'b04', p: 18, sys: 'WATER', to: 'a'},
  {b: 'b04', p: 21, sys: 'WATER', to: 'r'},
];
const LAMP = {g: UI.green, a: UI.amber, r: UI.red};
// clock: hours since the blackout at the start of each block
const CLOCK: Record<string, [string, number, number]> = {
  b01: ['HOUR 1', 0, 1.4], b02: ['HOUR 6', 6, 6.8], b03: ['HOUR 12', 12, 12.8], b04: ['HOUR 24', 24, 25], b05: ['HOUR 48', 48, 49],
  b06: ['HOUR 72', 72, 73], b07: ['DAY 5', 120, 122], b08: ['DAY 7', 168, 170], b09: ['POWER BACK', 170, 171], b10: ['POWER BACK', 171, 171.2],
};

const StatusBoard: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const blk = [...BLOCKS].reverse().find((b) => t >= (b.start ?? 0)) ?? BLOCKS[0];
  const ck = CLOCK[blk.id];
  const hrs = ck ? interpolate(t, [blk.start ?? 0, (blk.start ?? 0) + (blk.duration ?? 1)], [ck[1], ck[2]], clamp) : 0;
  const hh = Math.floor(hrs), mm = Math.floor((hrs % 1) * 60);
  const inn = spring({frame: f - Math.round((at('b00', 2) ?? 0) * fps), fps, config: {damping: 16}});
  return (
    <div style={{position: 'absolute', top: 28 - 190 * (1 - inn), left: 40, right: 40, height: 132, borderRadius: 26, background: UI.panel, border: '3px solid #2f3c70', display: 'flex', alignItems: 'center', fontFamily: FONT, padding: '0 26px', boxSizing: 'border-box'}}>
      <div style={{width: 330, borderRight: '3px solid #2f3c70', marginRight: 22}}>
        <div style={{fontWeight: 900, fontSize: 50, color: UI.amber, lineHeight: 1}}>{ck ? ck[0] : 'WHAT IF…'}</div>
        <div style={{fontWeight: 800, fontSize: 30, color: UI.dim, marginTop: 6, fontVariantNumeric: 'tabular-nums', letterSpacing: 2}}>
          {ck ? `T+ ${String(hh).padStart(3, '0')}:${String(mm).padStart(2, '0')}` : 'T+ 000:00'}
        </div>
      </div>
      <div style={{flex: 1, display: 'flex', justifyContent: 'space-between'}}>
        {SYSTEMS.map((s) => {
          let st: Lamp = 'g';
          let since = 9999;
          CHANGES.filter((c) => c.sys === s).forEach((c) => {
            const ct = at(c.b, c.p);
            if (ct !== null && t >= ct) {
              st = c.to;
              since = f - ct * fps;
            }
          });
          const flash = since < 45 ? 1 + 0.5 * Math.abs(Math.sin(since / 4)) * (1 - since / 45) : 1;
          const col = LAMP[st];
          return (
            <div key={s} style={{textAlign: 'center', width: 150, scale: String(flash)}}>
              <div style={{width: 44, height: 44, borderRadius: 22, margin: '0 auto', background: col, boxShadow: `0 0 26px ${col}`}} />
              <div style={{fontWeight: 900, fontSize: 28, letterSpacing: 2, marginTop: 10, color: st === 'g' ? UI.ink : col}}>{s}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const i = CAPS.findIndex((c, k) => t >= c.start && t < (CAPS[k + 1]?.start ?? c.end + 0.4));
  const c = CAPS[i];
  if (!c || t > c.end + 0.5) return null;
  return (
    <div style={{position: 'absolute', bottom: 56, left: 210, right: 210, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 50, lineHeight: 1.22, color: '#fff', textAlign: 'center', background: 'rgba(6,9,20,0.78)', borderRadius: 20, padding: '14px 34px', opacity: interpolate(t - c.start, [0, 0.12], [0.4, 1], clamp)}}>
        {c.text}
      </div>
    </div>
  );
};

export const Long001: React.FC = () => {
  const {fps} = useVideoConfig();
  const shots = SHOTS.map((s) => ({...s, t: at(s.b, s.p, s.o)}))
    .filter((s) => s.t !== null)
    .sort((a, b) => (a.t as number) - (b.t as number));
  return (
    <AbsoluteFill style={{background: '#0b1020'}}>
      {shots.map((s, i) => {
        const from = i === 0 ? 0 : Math.round((s.t as number) * fps);
        const to = i + 1 < shots.length ? Math.round((shots[i + 1].t as number) * fps) : L1_FRAMES;
        const d = Math.max(1, to - from);
        return (
          <Sequence key={i} from={from} durationInFrames={d}>
            <s.C d={d} />
          </Sequence>
        );
      })}
      <StatusBoard />
      <Captions />
      {BLOCKS.map((b) => (
        <Sequence key={b.id} from={Math.round((b.start ?? 0) * fps)}>
          <Audio src={staticFile(b.audio as string)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
