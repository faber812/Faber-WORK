import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Palette: night navy + amber. Series look for "The Grid Goes Down".
const C = {
  bg: '#0b1020',
  bg2: '#121a33',
  amber: '#ffb238',
  amberSoft: '#ffd27a',
  red: '#ff5a4e',
  green: '#4ee08a',
  ink: '#e9ecf5',
  dim: '#7c86a6',
};
const FONT = 'Inter, "Inter Display", system-ui, sans-serif';

export type Segment = {start: number; end: number; text: string};
export type gridEp1Schema = {segments: Segment[]; captions: Segment[]; audio: string};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- shared pieces ----------

const Stars: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {new Array(60).fill(0).map((_, i) => {
        const x = random(`sx${i}`) * 1080;
        const y = random(`sy${i}`) * 900;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame / 30 + i));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 3,
              height: 3,
              borderRadius: 2,
              background: '#fff',
              opacity: 0.15 + 0.35 * tw * random(`so${i}`),
            }}
          />
        );
      })}
    </>
  );
};

// City skyline whose windows switch off over [offStart, offEnd] frames.
const Skyline: React.FC<{offStart: number; offEnd: number}> = ({offStart, offEnd}) => {
  const frame = useCurrentFrame();
  const buildings = new Array(11).fill(0).map((_, i) => ({
    x: i * 100 - 10,
    w: 80 + random(`bw${i}`) * 30,
    h: 380 + random(`bh${i}`) * 520,
  }));
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {buildings.map((b, i) => {
        const top = 1500 - b.h;
        const cols = 3;
        const rows = Math.floor(b.h / 70);
        return (
          <g key={i}>
            <rect x={b.x} y={top} width={b.w} height={b.h + 420} fill="#161f3d" />
            {new Array(rows * cols).fill(0).map((__, k) => {
              const r = Math.floor(k / cols);
              const c = k % cols;
              const lit = random(`lit${i}-${k}`) > 0.35;
              if (!lit) return null;
              const offAt = offStart + random(`off${i}-${k}`) * (offEnd - offStart);
              const on = frame < offAt ? 1 : interpolate(frame, [offAt, offAt + 4], [1, 0], clamp);
              return (
                <rect
                  key={k}
                  x={b.x + 12 + c * ((b.w - 24) / cols)}
                  y={top + 24 + r * 70}
                  width={(b.w - 24) / cols - 10}
                  height={34}
                  rx={3}
                  fill={C.amber}
                  opacity={0.85 * on}
                />
              );
            })}
          </g>
        );
      })}
      <rect x={0} y={1500} width={1080} height={420} fill="#0e1530" />
    </svg>
  );
};

// Top bar: series tag + clock running through the first hour.
const TopBar: React.FC<{totalFrames: number; finalHour: boolean}> = ({totalFrames, finalHour}) => {
  const frame = useCurrentFrame();
  const minutes = Math.floor(interpolate(frame, [0, totalFrames * 0.9], [0, 59], clamp));
  const label = finalHour ? 'HOUR 6' : `00:${String(minutes).padStart(2, '0')}`;
  return (
    <div
      style={{
        position: 'absolute',
        top: 110,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          fontSize: 30,
          letterSpacing: 8,
          fontWeight: 700,
          color: C.amber,
          textTransform: 'uppercase',
        }}
      >
        The Grid Goes Down · Ep. 1
      </div>
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          color: finalHour ? C.red : C.ink,
          fontVariantNumeric: 'tabular-nums',
          textShadow: `0 0 40px ${finalHour ? C.red : C.amber}55`,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// Captions: words appear progressively across the segment; key words highlighted.
const KEY = new Set([
  'hour',
  'one.',
  'lights',
  'nobody',
  'card',
  'cash',
  'only.',
  'gas',
  'electricity',
  'fridge',
  'countdown.',
  'four',
  'hours...',
  'phone?',
  'few',
  'hours.',
  'six...',
  'strange.',
  'two.',
]);
const Captions: React.FC<{segments: Segment[]}> = ({segments}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const seg = segments.find((s, i) => t >= s.start && t < (segments[i + 1]?.start ?? s.end + 0.4));
  if (!seg) return null;
  const words = seg.text.replace(/\[[^\]]*\]\s*/g, '').split(/\s+/).filter(Boolean);
  const progress = interpolate(t, [seg.start, seg.end], [0, 1], clamp);
  // show a rolling window of ~6 words around the spoken position
  const idx = Math.min(words.length - 1, Math.floor(progress * words.length));
  const chunkStart = words.length <= 7 ? 0 : Math.floor(idx / 6) * 6;
  const chunk = words.slice(chunkStart, words.length <= 7 ? 7 : chunkStart + 6);
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        bottom: 260,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: 20,
        rowGap: 4,
        fontFamily: FONT,
        fontSize: 68,
        fontWeight: 900,
        lineHeight: 1.15,
        textTransform: 'uppercase',
        color: C.ink,
        textShadow: '0 6px 24px rgba(0,0,0,0.9), 0 0 4px #000',
      }}
    >
      {chunk.map((w, i) => {
        const spoken = chunkStart + i <= idx;
        const isKey = KEY.has(w.toLowerCase());
        return (
          <span
            key={i}
            style={{
              color: isKey ? C.amber : C.ink,
              opacity: spoken ? 1 : 0.25,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

const Label: React.FC<{text: string; color?: string; delay?: number; top?: number}> = ({
  text,
  color = C.amber,
  delay = 6,
  top = 1180,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 12}});
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 64,
        letterSpacing: 4,
        color,
        transform: `scale(${s})`,
      }}
    >
      <span
        style={{
          border: `5px solid ${color}`,
          borderRadius: 18,
          padding: '12px 30px',
          background: 'rgba(11,16,32,0.75)',
        }}
      >
        {text}
      </span>
    </div>
  );
};

const pop = (frame: number, fps: number, delay = 0) =>
  spring({frame: frame - delay, fps, config: {damping: 14, mass: 0.8}});

// ---------- scenes ----------

const SceneHook: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill>
    <Stars />
    <Skyline offStart={dur * 0.35} offEnd={dur * 0.95} />
  </AbsoluteFill>
);

const SceneLights: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const off = interpolate(frame, [10, 16], [1, 0], clamp);
  const q = pop(frame, fps, 70);
  return (
    <AbsoluteFill>
      <Stars />
      <Skyline offStart={-1} offEnd={0} />
      {/* big window of a house */}
      <div
        style={{
          position: 'absolute',
          left: 290,
          top: 560,
          width: 500,
          height: 560,
          borderRadius: 16,
          border: '18px solid #26315a',
          background: `rgba(255,178,56,${0.9 * off})`,
          boxShadow: `0 0 ${160 * off}px rgba(255,178,56,${0.6 * off})`,
          overflow: 'hidden',
        }}
      >
        <div style={{position: 'absolute', left: 223, top: 0, bottom: 0, width: 18, background: '#26315a'}} />
        <div style={{position: 'absolute', top: 252, left: 0, right: 0, height: 18, background: '#26315a'}} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 260,
            fontWeight: 900,
            color: C.amber,
            fontFamily: FONT,
            transform: `scale(${q})`,
          }}
        >
          ?
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SceneCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(frame, fps);
  const billY = interpolate(frame, [40, 90], [-300, 860], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const sway = Math.sin(frame / 6) * 12;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Stars />
      {/* terminal */}
      <div
        style={{
          position: 'absolute',
          left: 300,
          top: 520,
          width: 480,
          height: 640,
          borderRadius: 50,
          background: '#1e284d',
          border: '6px solid #2f3c70',
          transform: `scale(${s})`,
        }}
      >
        <div
          style={{
            margin: 50,
            height: 200,
            borderRadius: 20,
            background: '#0a0f1f',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT,
            color: C.red,
            fontWeight: 900,
            fontSize: 48,
            opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0.4,
          }}
        >
          NO NETWORK
          <div style={{fontSize: 30, color: C.dim, marginTop: 8}}>NO POWER</div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 22,
            margin: '0 70px',
          }}
        >
          {new Array(9).fill(0).map((_, i) => (
            <div key={i} style={{height: 64, borderRadius: 14, background: '#2f3c70'}} />
          ))}
        </div>
      </div>
      {/* bill */}
      <div
        style={{
          position: 'absolute',
          left: 340,
          top: billY,
          width: 400,
          height: 180,
          borderRadius: 14,
          background: '#3c8f5a',
          border: '6px solid #6fd39a',
          transform: `rotate(${sway}deg)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 90,
          color: '#d8ffe6',
        }}
      >
        $
      </div>
      <Label text="CASH ONLY" color={C.green} delay={70} top={1230} />
    </AbsoluteFill>
  );
};

const ScenePump: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(frame, fps);
  const x = pop(frame, fps, 30);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Stars />
      <svg width={1080} height={1920} style={{position: 'absolute', transform: `scale(${s})`, transformOrigin: '540px 900px'}}>
        {/* pump body */}
        <rect x={330} y={520} width={340} height={700} rx={30} fill="#1e284d" stroke="#2f3c70" strokeWidth={6} />
        <rect x={380} y={580} width={240} height={150} rx={14} fill="#0a0f1f" />
        <text x={500} y={680} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={80} fill={C.dim}>
          ----
        </text>
        {/* hose */}
        <path d="M670 800 C 780 800, 800 900, 790 1050 L 790 1150" stroke="#2f3c70" strokeWidth={22} fill="none" />
        <rect x={760} y={1140} width={70} height={110} rx={12} fill="#2f3c70" />
        <rect x={290} y={1220} width={420} height={40} rx={10} fill="#26315a" />
      </svg>
      {/* bolt with X */}
      <div
        style={{
          position: 'absolute',
          left: 420,
          top: 800,
          width: 160,
          height: 160,
          transform: `scale(${x})`,
        }}
      >
        <svg width={160} height={160} viewBox="0 0 160 160">
          <circle cx={80} cy={80} r={74} fill="#0b1020" stroke={C.amber} strokeWidth={8} />
          <path d="M92 20 L50 90 L78 90 L66 140 L112 66 L84 66 Z" fill={C.amber} />
          <path d="M28 28 L132 132" stroke={C.red} strokeWidth={14} strokeLinecap="round" />
        </svg>
      </div>
      <Label text="PUMPS NEED POWER" delay={40} top={1330} />
    </AbsoluteFill>
  );
};

const SceneFridge: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(frame, fps);
  // countdown accelerates: 4:00:00 -> 3:00:00 over the scene
  const secsLeft = Math.floor(interpolate(frame, [10, dur], [4 * 3600, 3 * 3600 + 7], clamp));
  const hh = Math.floor(secsLeft / 3600);
  const mm = Math.floor((secsLeft % 3600) / 60);
  const ss = secsLeft % 60;
  const fmt = `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Stars />
      <div
        style={{
          position: 'absolute',
          left: 320,
          top: 470,
          width: 440,
          height: 760,
          borderRadius: 40,
          background: '#dfe5f2',
          transform: `scale(${s})`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{position: 'absolute', top: 250, left: 0, right: 0, height: 8, background: '#b9c2d8'}} />
        <div style={{position: 'absolute', top: 70, right: 40, width: 18, height: 120, borderRadius: 9, background: '#9aa4bd'}} />
        <div style={{position: 'absolute', top: 310, right: 40, width: 18, height: 200, borderRadius: 9, background: '#9aa4bd'}} />
        <div
          style={{
            position: 'absolute',
            top: 330,
            left: 50,
            width: 280,
            padding: '18px 0',
            borderRadius: 16,
            background: '#0a0f1f',
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 64,
            color: C.red,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {fmt}
        </div>
      </div>
      <Label text="USDA: ~4 HRS · DOOR SHUT" delay={50} top={1300} />
    </AbsoluteFill>
  );
};

const ScenePhone: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(frame, fps);
  const battery = interpolate(frame, [20, dur], [1, 0.12], clamp);
  const bars = Math.max(1, Math.ceil(battery * 4));
  const pulse = 0.5 + 0.5 * Math.sin(frame / 5);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Stars />
      <svg width={1080} height={1920} style={{position: 'absolute', transform: `scale(${s})`, transformOrigin: '400px 1100px'}}>
        {/* tower */}
        <path d="M400 520 L300 1250 M400 520 L500 1250 M330 1000 L470 1000 M350 800 L450 800" stroke="#5a668f" strokeWidth={14} fill="none" />
        <circle cx={400} cy={510} r={22} fill={C.amber} />
        {[1, 2, 3].map((k) => (
          <path
            key={k}
            d={`M${400 - 60 * k} ${510 - 50 * k} Q 400 ${510 - 95 * k} ${400 + 60 * k} ${510 - 50 * k}`}
            stroke={C.amber}
            strokeWidth={10}
            fill="none"
            opacity={k <= bars - 1 ? 0.3 + 0.7 * pulse : 0.08}
          />
        ))}
        {/* battery */}
        <rect x={640} y={640} width={200} height={420} rx={26} fill="none" stroke={C.ink} strokeWidth={12} />
        <rect x={700} y={610} width={80} height={34} rx={8} fill={C.ink} />
        <rect
          x={660}
          y={660 + 380 * (1 - battery)}
          width={160}
          height={380 * battery}
          rx={14}
          fill={battery > 0.35 ? C.green : C.red}
        />
        <text x={740} y={1130} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={56} fill={C.ink}>
          {Math.round(battery * 100)}%
        </text>
      </svg>
      <Label text="BACKUP: A FEW HOURS" delay={60} top={1300} />
    </AbsoluteFill>
  );
};

const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = pop(frame, fps, 20);
  const dark = interpolate(frame, [0, 40], [0, 0.6], clamp);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Stars />
      <Skyline offStart={-1} offEnd={0} />
      <AbsoluteFill style={{background: `rgba(0,0,0,${dark})`}} />
      <div
        style={{
          position: 'absolute',
          top: 760,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 120,
          color: C.red,
          transform: `scale(${s})`,
          textShadow: `0 0 60px ${C.red}88`,
        }}
      >
        PART 2 →
      </div>
    </AbsoluteFill>
  );
};

// ---------- main ----------

export const GridEp1: React.FC<gridEp1Schema> = ({segments, captions, audio}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const f = (sec: number) => Math.round(sec * fps);
  // scene boundaries = segment starts (scene i covers segment i until next segment)
  const starts = segments.map((s) => f(s.start));
  const bounds = segments.map((_, i) => [i === 0 ? 0 : starts[i], i + 1 < segments.length ? starts[i + 1] : durationInFrames]);
  const scenes = [
    (d: number) => <SceneHook dur={d} />,
    () => <SceneLights />,
    () => <SceneCard />,
    () => <ScenePump />,
    (d: number) => <SceneFridge dur={d} />,
    (d: number) => <ScenePhone dur={d} />,
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
        <TopBar totalFrames={outroStart} finalHour={false} />
      </Sequence>
      <Sequence from={outroStart}>
        <TopBar totalFrames={1} finalHour />
      </Sequence>
      <Captions segments={captions} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
