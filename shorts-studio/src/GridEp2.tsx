import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, Captions, clamp, FONT, gridEp1Schema, Label, pop, Skyline, Stars, TopBar} from './GridEp1';

const KEYS2 = new Set([
  'six.',
  'still',
  'down.',
  'fridge',
  'usda',
  '40°f',
  'two',
  'hours...',
  'throw',
  'freezer',
  '48',
  'hours.',
  '24.',
  'vanish.',
  'four',
  'running',
  'out.',
  'dark.',
  'all-way',
  'stop.',
  'tap',
  'gravity,',
  "day's",
  'power.',
  'twelve...',
  'phone',
  'three.',
]);

// ---------- scenes ----------

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const flicker = 0.6 + 0.4 * Math.abs(Math.sin(frame / 3.7) * Math.sin(frame / 1.9));
  return (
    <AbsoluteFill>
      <Stars />
      <Skyline offStart={-1} offEnd={0} />
      {/* a few candles in dark windows */}
      {[
        [130, 1080],
        [520, 960],
        [860, 1180],
      ].map(([x, y], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: 26,
            height: 26,
            borderRadius: 13,
            background: C.amberSoft,
            opacity: flicker * (0.7 + 0.1 * i),
            boxShadow: `0 0 40px 18px rgba(255,178,56,${0.35 * flicker})`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Icon: React.FC<{emoji: string; x: number; y: number; crossAt: number}> = ({emoji, x, y, crossAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(frame, fps, crossAt - 40);
  const cross = interpolate(frame, [crossAt, crossAt + 8], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 170, height: 170, transform: `scale(${s})`}}>
      <div style={{fontSize: 130, textAlign: 'center', lineHeight: '170px', filter: cross > 0.5 ? 'grayscale(0.8)' : 'none'}}>
        {emoji}
      </div>
      <svg width={170} height={170} style={{position: 'absolute', inset: 0}}>
        <path d="M20 20 L150 150" stroke={C.red} strokeWidth={16} strokeLinecap="round" strokeDasharray={184} strokeDashoffset={184 * (1 - cross)} />
        <path d="M150 20 L20 150" stroke={C.red} strokeWidth={16} strokeLinecap="round" strokeDasharray={184} strokeDashoffset={184 * (1 - cross)} />
      </svg>
    </div>
  );
};

const SceneFridgeTemp: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(frame, fps);
  const temp = interpolate(frame, [0, dur * 0.55], [36, 47], clamp);
  const level = interpolate(temp, [30, 55], [0.1, 0.95], clamp);
  const hot = temp >= 40;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Stars />
      {/* thermometer */}
      <svg width={1080} height={1920} style={{position: 'absolute', transform: `scale(${s})`, transformOrigin: '540px 800px'}}>
        <rect x={470} y={420} width={140} height={620} rx={70} fill="#1e284d" stroke="#2f3c70" strokeWidth={8} />
        <rect x={505} y={460 + 540 * (1 - level)} width={70} height={540 * level} rx={35} fill={hot ? C.red : '#58a6ff'} />
        <circle cx={540} cy={1060} r={95} fill={hot ? C.red : '#58a6ff'} stroke="#2f3c70" strokeWidth={8} />
        {/* 40F line */}
        <line x1={430} x2={650} y1={460 + 540 * (1 - interpolate(40, [30, 55], [0.1, 0.95]))} y2={460 + 540 * (1 - interpolate(40, [30, 55], [0.1, 0.95]))} stroke={C.amber} strokeWidth={6} strokeDasharray="14 10" />
        <text x={670} y={470 + 540 * (1 - interpolate(40, [30, 55], [0.1, 0.95]))} fontFamily="Inter" fontWeight={900} fontSize={48} fill={C.amber}>
          40°F
        </text>
        <text x={540} y={1080} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={54} fill="#fff">
          {Math.round(temp)}°
        </text>
      </svg>
      <Icon emoji="🥛" x={110} y={1230} crossAt={Math.round(dur * 0.82)} />
      <Icon emoji="🥩" x={455} y={1230} crossAt={Math.round(dur * 0.85)} />
      <Icon emoji="🥚" x={800} y={1230} crossAt={Math.round(dur * 0.88)} />
    </AbsoluteFill>
  );
};

const Bar: React.FC<{label: string; hours: number; y: number; delay: number; dur: number}> = ({label, hours, y, delay, dur}) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [delay, delay + 30], [0, hours / 48], clamp);
  const remaining = interpolate(frame, [delay + 30, dur], [1, 0.92], clamp);
  return (
    <div style={{position: 'absolute', left: 120, top: y, width: 840, fontFamily: FONT, opacity: interpolate(frame, [delay - 6, delay], [0, 1], clamp)}}>
      <div style={{display: 'flex', justifyContent: 'space-between', color: C.ink, fontWeight: 900, fontSize: 52, marginBottom: 18}}>
        <span>{label}</span>
        <span style={{color: C.amber}}>~{hours} HRS</span>
      </div>
      <div style={{height: 90, borderRadius: 45, background: '#1e284d', border: '6px solid #2f3c70', overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${100 * fill * remaining}%`, background: `linear-gradient(90deg, #58a6ff, #a8d4ff)`, borderRadius: 45}} />
      </div>
    </div>
  );
};

const SceneFreezer: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(frame, fps);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Stars />
      <div style={{position: 'absolute', top: 420, left: 0, right: 0, textAlign: 'center', fontSize: 220, transform: `scale(${s})`}}>🧊</div>
      <Bar label="FULL FREEZER" hours={48} y={800} delay={45} dur={dur} />
      <Bar label="HALF FULL" hours={24} y={1030} delay={Math.round(dur * 0.72)} dur={dur} />
      <Label text="KEEP THE DOOR SHUT" delay={20} top={1290} />
    </AbsoluteFill>
  );
};

const SceneTowers: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(frame, fps);
  const cols = 6;
  const rows = 7;
  const offFrac = interpolate(frame, [dur * 0.25, dur * 0.95], [0, 0.85], clamp);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Stars />
      <div style={{position: 'absolute', left: 130, top: 420, width: 820, height: 820, transform: `scale(${s})`}}>
        {new Array(cols * rows).fill(0).map((_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          // deterministic pseudo-random order
          const order = ((i * 37) % (cols * rows)) / (cols * rows);
          const on = order >= offFrac;
          const pulse = 0.5 + 0.5 * Math.sin(frame / 6 + i);
          return (
            <div key={i} style={{position: 'absolute', left: c * 140 + 30, top: r * 115 + 20}}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  background: on ? C.amber : '#2a3358',
                  boxShadow: on ? `0 0 ${20 + 20 * pulse}px rgba(255,178,56,0.7)` : 'none',
                }}
              />
            </div>
          );
        })}
      </div>
      <Label text="MIN. BACKUP: ~4 HRS" delay={70} top={1300} />
    </AbsoluteFill>
  );
};

const SceneTraffic: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(frame, fps);
  const lightOn = frame < 12;
  const stop = pop(frame, fps, Math.round(dur * 0.4));
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Stars />
      <div style={{position: 'absolute', left: 200, top: 430, transform: `scale(${s})`}}>
        <div style={{width: 230, height: 620, borderRadius: 40, background: '#1e284d', border: '8px solid #2f3c70', padding: 25, boxSizing: 'border-box'}}>
          {[C.red, C.amber, C.green].map((col, i) => (
            <div
              key={i}
              style={{
                width: 164,
                height: 164,
                borderRadius: 82,
                marginBottom: 22,
                background: lightOn && i === 2 ? col : '#121a33',
                border: '6px solid #2a3358',
                boxSizing: 'border-box',
              }}
            />
          ))}
        </div>
        <div style={{width: 40, height: 180, margin: '0 auto', background: '#2f3c70'}} />
      </div>
      {/* stop sign */}
      <svg width={360} height={360} viewBox="0 0 100 100" style={{position: 'absolute', left: 560, top: 620, transform: `scale(${stop})`}}>
        <polygon points="30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30" fill="#d9342b" stroke="#fff" strokeWidth={4} />
        <text x={50} y={60} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={26} fill="#fff">
          STOP
        </text>
      </svg>
      <Label text="ALL-WAY STOP" color={C.red} delay={Math.round(dur * 0.55)} top={1300} />
    </AbsoluteFill>
  );
};

const SceneWater: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(frame, fps);
  const level = interpolate(frame, [0, dur], [0.95, 0.55], clamp);
  const pumpX = interpolate(frame, [dur * 0.68, dur * 0.68 + 8], [0, 1], clamp);
  const flow = (frame * 8) % 80;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Stars />
      <svg width={1080} height={1920} style={{position: 'absolute', transform: `scale(${s})`, transformOrigin: '540px 900px'}}>
        {/* tank */}
        <rect x={300} y={420} width={480} height={300} rx={60} fill="#1e284d" stroke="#5a668f" strokeWidth={10} />
        <clipPath id="tank">
          <rect x={310} y={430} width={460} height={280} rx={52} />
        </clipPath>
        <rect x={300} y={420 + 300 * (1 - level)} width={480} height={300} fill="#3a8dde" clipPath="url(#tank)" />
        {/* legs */}
        <path d="M380 720 L330 1180 M700 720 L750 1180 M360 950 L720 950" stroke="#5a668f" strokeWidth={14} />
        {/* pipe down to houses with flowing dashes */}
        <path d="M540 720 L540 1180 L900 1180" stroke="#2f3c70" strokeWidth={30} fill="none" />
        <path d="M540 720 L540 1180 L900 1180" stroke="#7cc4ff" strokeWidth={10} fill="none" strokeDasharray="30 50" strokeDashoffset={-flow} />
        {/* house */}
        <polygon points="870,1110 960,1040 1050,1110" fill={C.amber} />
        <rect x={885} y={1110} width={150} height={110} fill="#26315a" />
        {/* pump */}
        <rect x={110} y={1100} width={170} height={120} rx={16} fill="#26315a" stroke="#5a668f" strokeWidth={6} />
        <text x={195} y={1175} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={38} fill={C.dim}>
          PUMP
        </text>
        <path d="M280 1160 L330 1160 L330 600 L300 600" stroke="#2f3c70" strokeWidth={22} fill="none" />
        <g opacity={pumpX}>
          <path d="M120 1090 L270 1230" stroke={C.red} strokeWidth={16} strokeLinecap="round" />
          <path d="M270 1090 L120 1230" stroke={C.red} strokeWidth={16} strokeLinecap="round" />
        </g>
      </svg>
      <Label text="~1 DAY SUPPLY" delay={Math.round(dur * 0.3)} top={1330} />
    </AbsoluteFill>
  );
};

const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(frame, fps, 25);
  const ph = pop(frame, fps, 0);
  const blink = Math.floor(frame / 10) % 2 === 0 ? 1 : 0.3;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Stars />
      <div style={{position: 'absolute', left: 390, top: 470, width: 300, height: 560, borderRadius: 48, background: '#1e284d', border: '10px solid #5a668f', transform: `scale(${ph})`}}>
        <div style={{position: 'absolute', left: 95, top: 200, width: 110, height: 170, borderRadius: 14, border: `8px solid ${C.red}`, opacity: blink}}>
          <div style={{position: 'absolute', left: 30, top: -24, width: 34, height: 16, borderRadius: 4, background: C.red}} />
          <div style={{position: 'absolute', left: 8, right: 8, bottom: 8, height: 22, borderRadius: 4, background: C.red}} />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1110,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 110,
          color: C.red,
          transform: `scale(${s})`,
          textShadow: `0 0 60px ${C.red}88`,
        }}
      >
        PART 3 →
      </div>
    </AbsoluteFill>
  );
};

// ---------- main ----------

export const GridEp2: React.FC<gridEp1Schema> = ({segments, captions, audio}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const f = (sec: number) => Math.round(sec * fps);
  const starts = segments.map((s) => f(s.start));
  const bounds = segments.map((_, i) => [i === 0 ? 0 : starts[i], i + 1 < segments.length ? starts[i + 1] : durationInFrames]);
  const scenes = [
    () => <SceneHook />,
    (d: number) => <SceneFridgeTemp dur={d} />,
    (d: number) => <SceneFreezer dur={d} />,
    (d: number) => <SceneTowers dur={d} />,
    (d: number) => <SceneTraffic dur={d} />,
    (d: number) => <SceneWater dur={d} />,
    () => <SceneOutro />,
  ];
  const outroStart = bounds[bounds.length - 1][0];
  return (
    <AbsoluteFill style={{background: `linear-gradient(${C.bg2}, ${C.bg})`}}>
      {bounds.map(([from, to], i) => (
        <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}>
          {scenes[i](to - from)}
        </Sequence>
      ))}
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
