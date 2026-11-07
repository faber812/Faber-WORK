// Episode 3 — "Hour 12: why your phone dies". Style: C (tilt-shift miniature) for the city,
// E (isometric systems) for the explanations.
import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {F} from './styles/fonts';
import {City, Rig} from './styles/C_Miniature';
import {Callout, House, IBox, iso, L, P} from './styles/E_Isometric';

export type Seg = {start: number; end: number; text: string};
export type Ep3Props = {segments: Seg[]; captions: Seg[]; audio: string};

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const EZ = Easing.bezier(0.16, 1, 0.3, 1);
const RED = '#e5484d';
const BLUE = '#2f80ed';
const INK = '#1f2937';
const CREAM = 'linear-gradient(#f3efe6, #e7e1d4)';

// ---------- shared overlays ----------

const Header: React.FC<{label: string; total: number; final?: string}> = ({label, total, final}) => {
  const frame = useCurrentFrame();
  const m = Math.floor(interpolate(frame, [0, total * 0.95], [0, 59], cl));
  return (
    <div style={{position: 'absolute', top: 96, width: '100%', display: 'flex', justifyContent: 'center'}}>
      <div style={{background: 'rgba(10,14,28,0.78)', borderRadius: 28, padding: '14px 34px 10px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.35)'}}>
        <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: 7, color: '#ffb238'}}>{label}</div>
        <div style={{fontFamily: F.bebas, fontSize: 92, lineHeight: 1, color: final ? RED : '#f6efe2', letterSpacing: 3, fontVariantNumeric: 'tabular-nums'}}>
          {final ?? `12:${String(m).padStart(2, '0')}`}
        </div>
      </div>
    </div>
  );
};

const KEYS = new Set(['twelve.', 'forty', 'percent...', 'fast.', 'wi-fi', 'router', 'died', 'cell', 'backup', 'power.', 'weaker,', 'harder', 'battery.', 'everyone', 'jams.', "fcc's", 'short,', 'text', "can't.", 'twenty-four...', 'phone.', 'water.', 'four.']);

const Captions: React.FC<{segments: Seg[]}> = ({segments}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const i = segments.findIndex((s, k) => t >= s.start && t < (segments[k + 1]?.start ?? s.end + 0.4));
  if (i < 0) return null;
  const seg = segments[i];
  const words = seg.text.split(/\s+/);
  const prog = interpolate(t, [seg.start, seg.end], [0, 1], cl);
  const idx = Math.min(words.length - 1, Math.floor(prog * words.length));
  const pop = spring({frame: frame - Math.round(seg.start * fps), fps, config: {damping: 14}});
  return (
    <div style={{position: 'absolute', left: 60, right: 60, bottom: 250, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          background: 'rgba(10,14,28,0.82)',
          borderRadius: 26,
          padding: '18px 30px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 16,
          rowGap: 2,
          scale: String(0.94 + 0.06 * pop),
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        }}
      >
        {words.map((w, k) => (
          <span
            key={k}
            style={{
              fontFamily: F.grotesk,
              fontWeight: 700,
              fontSize: 58,
              lineHeight: 1.12,
              color: KEYS.has(w.toLowerCase()) ? '#ffb238' : '#f6efe2',
              opacity: k <= idx ? 1 : 0.3,
            }}
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  );
};

const FadeIn: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{opacity: interpolate(frame, [0, 6], [0, 1], cl)}}>{children}</AbsoluteFill>;
};

// ---------- miniature (style C) ----------

const Mini: React.FC<{frame: number; towers?: number; dimTo?: number}> = ({frame, towers = -1}) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0b1424, #16223a 60%, #1f1f30)'}}>
      <AbsoluteFill style={{filter: 'saturate(1.25) contrast(1.06)'}}>
        <ThreeCanvas width={width} height={height} shadows camera={{fov: 24, position: [0, 15, 24]}}>
          <Rig frame={frame + 60} />
          <hemisphereLight args={['#a9bcff', '#2a2230', 1.1]} />
          <directionalLight position={[8, 12, -6]} intensity={1.4} color="#9db8ff" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
          <directionalLight position={[-8, 6, 8]} intensity={0.35} color="#ffb27a" />
          <City frame={frame} outStart={-999} towers={towers} />
        </ThreeCanvas>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 760, backdropFilter: 'blur(9px)', WebkitMaskImage: 'linear-gradient(black 35%, transparent 100%)', maskImage: 'linear-gradient(black 35%, transparent 100%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 760, backdropFilter: 'blur(9px)', WebkitMaskImage: 'linear-gradient(transparent 0%, black 65%)', maskImage: 'linear-gradient(transparent 0%, black 65%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(5,8,20,0.6) 100%)'}} />
    </AbsoluteFill>
  );
};

const Battery: React.FC<{pct: number; top: number; scale?: number}> = ({pct, top, scale = 1}) => {
  const c = pct > 35 ? '#4ee08a' : pct > 20 ? '#ffb238' : RED;
  return (
    <div style={{position: 'absolute', top, width: '100%', display: 'flex', justifyContent: 'center', scale: String(scale)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, background: 'rgba(10,14,28,0.8)', padding: '20px 34px', borderRadius: 30}}>
        <div style={{position: 'relative', width: 170, height: 80, border: '7px solid #f6efe2', borderRadius: 16}}>
          <div style={{position: 'absolute', right: -20, top: 22, width: 12, height: 26, background: '#f6efe2', borderRadius: 4}} />
          <div style={{position: 'absolute', left: 6, top: 6, bottom: 6, width: `${(pct / 100) * 144}px`, background: c, borderRadius: 8}} />
        </div>
        <div style={{fontFamily: F.bebas, fontSize: 110, color: c, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{Math.round(pct)}%</div>
      </div>
    </div>
  );
};

// 1. Hook — dark miniature city + battery falling
const S1: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const pct = interpolate(frame, [0, dur], [40, 36], cl);
  const shake = frame > dur * 0.6 ? Math.sin(frame * 2.3) * 3 : 0;
  return (
    <AbsoluteFill>
      <Mini frame={frame} />
      <div style={{translate: `${shake}px 0`}}>
        <Battery pct={pct} top={760} scale={interpolate(frame, [0, 12], [0.6, 1], {...cl, easing: Easing.out(Easing.back(1.8))})} />
      </div>
    </AbsoluteFill>
  );
};

// 2. Router — isometric house, router dies, phone flips from Wi-Fi to LTE
const S2: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const CUT = 16;
  const on = frame < CUT;
  const rise = (a: number) => interpolate(frame, [a, a + 14], [0, 1], {...cl, easing: EZ});
  const [rx0, ry0] = iso(1.2, 0.6, 0.3);
  const rx = 540 + (rx0 - 540) * 1.75;
  const ry = 1000 + (ry0 - 1060) * 1.75;
  const lte = frame > dur * 0.62;
  return (
    <FadeIn>
      <AbsoluteFill style={{background: CREAM}}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <g transform="translate(540 1000) scale(1.75) translate(-540 -1060)">
            <IBox x={-3} y={-3} w={6} d={5.5} h={0.3} z={-0.3} c={['#a9cf9b', '#7ea873', '#6a9161']} />
            <House x={-2.2} y={-2.2} lit={on ? 1 : 0} roof="#c75b39" />
            {/* table + router */}
            <IBox x={0.7} y={0.2} w={1.2} d={0.9} h={0.3} c={['#c8a77e', '#a9865d', '#8f6f4a']} />
            <IBox x={0.9} y={0.35} w={0.7} d={0.45} h={0.16} z={0.3} c={['#2b2f3a', '#20232c', '#171a21']} />
            {[0.95, 1.5].map((x) => (
              <path key={x} d={L([[x, 0.4, 0.46], [x, 0.4, 0.95]])} stroke="#20232c" strokeWidth={5} strokeLinecap="round" />
            ))}
            {[0, 1, 2].map((k) => {
              const [lx, ly] = iso(1.05 + k * 0.15, 0.8, 0.38);
              return <circle key={k} cx={lx} cy={ly} r={4} fill={on ? (k === 2 ? '#4ee08a' : '#7cc4ff') : '#3b4252'} style={{filter: on ? 'drop-shadow(0 0 6px #7cc4ff)' : 'none'}} />;
            })}
            {/* wi-fi arcs */}
            {[1, 2, 3].map((k) => (
              <path
                key={k}
                d={`M${rx0 - 30 * k} ${ry0 - 40 - 16 * k} A ${40 * k} ${40 * k} 0 0 1 ${rx0 + 30 * k} ${ry0 - 40 - 16 * k}`}
                stroke={BLUE}
                strokeWidth={9}
                strokeLinecap="round"
                fill="none"
                opacity={on ? 0.4 + 0.6 * Math.abs(Math.sin(frame / 4 + k)) : interpolate(frame, [CUT, CUT + 8], [1, 0], cl)}
              />
            ))}
            {/* outlet with red X */}
            {!on && (
              <g transform={`translate(${iso(0.6, 1.1, 0.6).join(' ')})`}>
                <circle r={interpolate(frame, [CUT, CUT + 8], [0, 34], {...cl, easing: Easing.out(Easing.back(2))})} fill={RED} />
                <path d="M-12 -12 L12 12 M12 -12 L-12 12" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={interpolate(frame, [CUT + 4, CUT + 9], [0, 1], cl)} />
              </g>
            )}
          </g>
          <Callout at={[rx - 30, ry + 30]} to={[80, 1430]} title="ROUTER" sub={on ? 'runs on wall power' : 'no power = no Wi-Fi'} t={rise(20)} color={on ? INK : '#c0392b'} />
        </svg>
        {/* phone status bar */}
        <div style={{position: 'absolute', top: 430, width: '100%', display: 'flex', justifyContent: 'center', opacity: rise(24)}}>
          <div style={{background: '#11151f', color: '#f6efe2', borderRadius: 40, padding: '20px 40px', display: 'flex', gap: 30, alignItems: 'center', fontFamily: F.grotesk, fontWeight: 700, fontSize: 44, boxShadow: '0 16px 40px rgba(0,0,0,0.35)'}}>
            <span>12:{String(Math.floor(frame / 8) % 60).padStart(2, '0')}</span>
            <span style={{color: lte ? '#ffb238' : '#7cc4ff', scale: String(lte ? interpolate(frame, [dur * 0.62, dur * 0.62 + 8], [1.6, 1], {...cl, easing: Easing.out(Easing.back(2))}) : 1)}}>
              {lte ? 'LTE ▂▄▆' : on ? 'Wi-Fi ◠' : 'Wi-Fi ✕'}
            </span>
            <span style={{color: '#4ee08a'}}>38%</span>
          </div>
        </div>
      </AbsoluteFill>
    </FadeIn>
  );
};

// 3. Towers — miniature city, tower beacons dying
const S3: React.FC<{dur: number}> = () => {
  const frame = useCurrentFrame();
  return (
    <FadeIn>
      <Mini frame={frame} towers={-30} />
      <div style={{position: 'absolute', top: 760, width: '100%', textAlign: 'center'}}>
        <span style={{fontFamily: F.bebas, fontSize: 96, letterSpacing: 3, color: '#ff6b6b', background: 'rgba(10,14,28,0.75)', padding: '6px 30px', borderRadius: 20}}>BACKUP RUNNING OUT</span>
      </div>
    </FadeIn>
  );
};

// 4. Weak signal — isometric: phone ↔ far tower, radio power climbs, battery drains
const S4: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, dur], [0, 1], cl);
  const bars = Math.max(1, 4 - Math.floor(t * 4));
  const radio = interpolate(t, [0, 1], [0.25, 0.97]);
  const pct = interpolate(frame, [0, dur], [36, 31], cl);
  const [px, py] = iso(-3.2, 1.6, 0.9);
  const [tx, ty] = iso(3.0, -3.0, 5.2);
  const pk = (k: number) => ((frame * (0.018 + radio * 0.02) + k / 4) % 1);
  return (
    <FadeIn>
      <AbsoluteFill style={{background: CREAM}}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <IBox x={-4.6} y={-4.4} w={9.2} d={8.6} h={0.3} z={-0.3} c={['#a9cf9b', '#7ea873', '#6a9161']} />
          <House x={-4} y={0.8} lit={0} roof="#3e6b8a" />
          {/* far tower */}
          {[[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].map(([a, b], i) => (
            <path key={i} d={L([[3.0 + a * 2, -3.0 + b * 2, 0], [3.0, -3.0, 5.2]])} stroke="#5b6476" strokeWidth={9} />
          ))}
          <circle cx={tx} cy={ty} r={16} fill={RED} opacity={Math.floor(frame / 10) % 2 ? 1 : 0.3} />
          {/* signal packets phone → tower, fading with distance */}
          {[0, 1, 2, 3].map((k) => {
            const p = pk(k);
            const x = px + (tx - px) * p;
            const y = py + (ty - py) * p - Math.sin(p * Math.PI) * 120;
            return <circle key={k} cx={x} cy={y} r={14 + radio * 10} fill="none" stroke={BLUE} strokeWidth={6} opacity={(1 - p) * (1.1 - t * 0.6)} />;
          })}
          <circle cx={px} cy={py - 30} r={20} fill="#11151f" />
        </svg>
        {/* gauges */}
        <div style={{position: 'absolute', top: 400, left: 80, right: 80, fontFamily: F.grotesk, color: INK}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 36}}>
            <span>SIGNAL</span>
            <span style={{display: 'flex', gap: 8, alignItems: 'flex-end'}}>
              {[1, 2, 3, 4].map((b) => (
                <span key={b} style={{width: 18, height: 12 + b * 10, borderRadius: 4, background: b <= bars ? INK : '#cdd2db'}} />
              ))}
            </span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 36, marginTop: 34}}>
            <span>PHONE RADIO EFFORT</span>
            <span style={{color: radio > 0.7 ? RED : INK}}>{radio > 0.7 ? 'MAX' : radio > 0.45 ? 'HIGH' : 'LOW'}</span>
          </div>
          <div style={{height: 26, marginTop: 12, borderRadius: 13, background: '#d6dbe3', overflow: 'hidden'}}>
            <div style={{height: '100%', width: `${radio * 100}%`, background: radio > 0.7 ? RED : '#ffb238', borderRadius: 13}} />
          </div>
        </div>
        <Battery pct={pct} top={1250} scale={0.85} />
      </AbsoluteFill>
    </FadeIn>
  );
};

// 5. Jam — everyone calls one tower
const S5: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const homes: [number, number, string][] = [
    [-4, -3, '#c75b39'],
    [-4, 1.5, '#3e6b8a'],
    [-0.8, 3, '#7d9a5a'],
    [2.6, 2.4, '#a63d33'],
    [2.8, -3.6, '#3e6b8a'],
    [-1, -4.2, '#c75b39'],
  ];
  const [tx, ty] = iso(0.2, -0.4, 3.6);
  const busy = interpolate(frame, [dur * 0.35, dur * 0.5], [0, 1], cl);
  return (
    <FadeIn>
      <AbsoluteFill style={{background: CREAM}}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <IBox x={-4.8} y={-4.8} w={9.6} d={9.6} h={0.3} z={-0.3} c={['#a9cf9b', '#7ea873', '#6a9161']} />
          {homes.map(([x, y, r], i) => (
            <House key={i} x={x} y={y} lit={0} roof={r} />
          ))}
          {[[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].map(([a, b], i) => (
            <path key={i} d={L([[0.2 + a, -0.4 + b, 0], [0.2, -0.4, 3.6]])} stroke="#6b7486" strokeWidth={5} />
          ))}
          {/* calls flying in */}
          {homes.flatMap(([x, y], i) =>
            [0, 1].map((k) => {
              const p = ((frame * 0.03 + i * 0.17 + k * 0.5) % 1);
              const [hx, hy] = iso(x + 0.8, y + 0.7, 1.8);
              const cx = hx + (tx - hx) * p;
              const cy = hy + (ty - hy) * p;
              const rejected = busy > 0.5 && (i + k) % 2 === 0 && p > 0.75;
              return (
                <g key={`${i}${k}`} transform={`translate(${cx} ${cy})`} opacity={p < 0.95 ? 1 : 0}>
                  <circle r={24} fill={rejected ? RED : '#ffffff'} stroke={rejected ? RED : INK} strokeWidth={3} />
                  <text textAnchor="middle" y={10} fontSize={28}>
                    {rejected ? '✕' : '📞'}
                  </text>
                </g>
              );
            }),
          )}
          {/* overload rings */}
          {[0, 1, 2].map((k) => {
            const p = ((frame + k * 12) % 36) / 36;
            return <circle key={k} cx={tx} cy={ty} r={30 + p * 160} fill="none" stroke={RED} strokeWidth={5} opacity={busy * (1 - p)} />;
          })}
        </svg>
        <div style={{position: 'absolute', top: 430, width: '100%', textAlign: 'center', opacity: busy, scale: String(interpolate(busy, [0, 1], [1.4, 1]))}}>
          <span style={{fontFamily: F.archivo, fontSize: 84, color: '#fff', background: RED, padding: '10px 34px', borderRadius: 18}}>NETWORK BUSY</span>
        </div>
      </AbsoluteFill>
    </FadeIn>
  );
};

// 6. FCC tip — call fails, text goes through
const S6: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fail = spring({frame: frame - 6, fps, config: {damping: 12}});
  const msg1 = spring({frame: frame - Math.round(dur * 0.35), fps, config: {damping: 14}});
  const msg2 = spring({frame: frame - Math.round(dur * 0.55), fps, config: {damping: 14}});
  const delivered = frame > dur * 0.72;
  return (
    <FadeIn>
      <AbsoluteFill style={{background: CREAM}}>
        {/* faint iso grid */}
        <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.25}}>
          {new Array(14).fill(0).map((_, i) => (
            <g key={i}>
              <path d={L([[-7 + i, -7, 0], [-7 + i, 7, 0]])} stroke="#9aa1ad" strokeWidth={1.5} />
              <path d={L([[-7, -7 + i, 0], [7, -7 + i, 0]])} stroke="#9aa1ad" strokeWidth={1.5} />
            </g>
          ))}
        </svg>
        <div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center', fontFamily: F.mono, fontSize: 26, letterSpacing: 6, color: BLUE}}>FCC / FEMA EMERGENCY TIPS</div>
        {/* phone */}
        <div style={{position: 'absolute', left: 250, top: 440, width: 580, height: 900, borderRadius: 70, background: '#11151f', padding: 26, boxShadow: '0 30px 80px rgba(0,0,0,0.35)'}}>
          <div style={{width: '100%', height: '100%', borderRadius: 50, background: '#f6f4ef', overflow: 'hidden', position: 'relative', fontFamily: F.grotesk}}>
            <div style={{position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', fontWeight: 700, fontSize: 30, color: INK}}>Mom</div>
            <div style={{position: 'absolute', top: 110, left: 40, right: 40, padding: '18px 24px', borderRadius: 24, background: RED, color: '#fff', fontWeight: 700, fontSize: 34, textAlign: 'center', scale: String(fail), opacity: interpolate(frame, [dur * 0.3, dur * 0.4], [1, 0.35], cl)}}>
              📞 Call failed
            </div>
            <div style={{position: 'absolute', top: 290, left: 34, maxWidth: 420, padding: '20px 26px', borderRadius: '28px 28px 28px 8px', background: '#e3e6ec', color: INK, fontWeight: 500, fontSize: 36, scale: String(msg1), transformOrigin: 'left bottom'}}>Are you OK??</div>
            <div style={{position: 'absolute', top: 440, right: 34, maxWidth: 440, padding: '20px 26px', borderRadius: '28px 28px 8px 28px', background: BLUE, color: '#fff', fontWeight: 500, fontSize: 36, scale: String(msg2), transformOrigin: 'right bottom'}}>
              Power's out. Phone at 30%. We're fine.
            </div>
            <div style={{position: 'absolute', top: 640, right: 40, fontWeight: 700, fontSize: 26, color: '#4c9a5f', opacity: delivered ? 1 : 0}}>Delivered ✓</div>
          </div>
        </div>
        <div style={{position: 'absolute', top: 1375, left: 0, right: 0, textAlign: 'center', fontFamily: F.archivo, fontSize: 62, color: INK}}>
          Calls short. <span style={{color: BLUE}}>Text instead.</span>
        </div>
      </AbsoluteFill>
    </FadeIn>
  );
};

// 7. Outro — miniature, push toward the water tower
const S7: React.FC<{dur: number}> = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 20, fps, config: {damping: 12}});
  return (
    <FadeIn>
      <Mini frame={frame + 30} />
      <div style={{position: 'absolute', top: 820, width: '100%', textAlign: 'center', scale: String(s)}}>
        <div style={{fontFamily: F.bebas, fontSize: 150, color: '#7cc4ff', letterSpacing: 4, textShadow: '0 0 50px rgba(124,196,255,0.6)'}}>💧 PART 4 →</div>
      </div>
    </FadeIn>
  );
};

export const GridEp3: React.FC<Ep3Props> = ({segments, captions, audio}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const f = (sec: number) => Math.round(sec * fps);
  const starts = segments.map((s) => f(s.start));
  const bounds = segments.map((_, i) => [i === 0 ? 0 : starts[i], i + 1 < segments.length ? starts[i + 1] : durationInFrames]);
  const scenes = [S1, S2, S3, S4, S5, S6, S7];
  const outro = bounds[bounds.length - 1][0];
  return (
    <AbsoluteFill style={{background: '#0b1020'}}>
      {bounds.map(([from, to], i) => {
        const S = scenes[i];
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}>
            <S dur={to - from} />
          </Sequence>
        );
      })}
      <Sequence from={0} durationInFrames={outro}>
        <Header label="THE GRID GOES DOWN · EP. 3" total={outro} />
      </Sequence>
      <Sequence from={outro}>
        <Header label="THE GRID GOES DOWN · EP. 3" total={1} final="HOUR 24" />
      </Sequence>
      <Captions segments={captions} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
