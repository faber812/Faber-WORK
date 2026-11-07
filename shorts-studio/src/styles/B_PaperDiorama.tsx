// STYLE B — "Paper diorama": layered cut paper, real drop shadows, paper grain, parallax.
// Topic: how Americans survived winter before central heating.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {F} from './fonts';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const EZ = Easing.bezier(0.45, 0, 0.2, 1);

// torn-paper horizon: big gentle waves + small ragged jitter
const torn = (y: number, amp: number, seed: string, waves = 2, rag = 6) => {
  let d = `M-40 2000 L-40 ${y}`;
  for (let x = -40; x <= 1120; x += 14) {
    const yy = y + Math.sin((x / 1080) * Math.PI * waves + random(seed) * 6) * amp + (random(`${seed}${x}`) - 0.5) * rag;
    d += ` L${x} ${yy.toFixed(1)}`;
  }
  return d + ' L1120 2000 Z';
};

const shadow = (blur = 14, y = 10, a = 0.35) => `drop-shadow(0 ${y}px ${blur}px rgba(10,8,20,${a}))`;

const Grain: React.FC<{id: string; opacity?: number}> = ({id, opacity = 0.16}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity}}>
    <filter id={id}>
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={7} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={1080} height={1920} filter={`url(#${id})`} />
  </svg>
);

const Pine: React.FC<{x: number; y: number; s: number; c: string}> = ({x, y, s, c}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 -150 L40 -90 L22 -90 L58 -40 L32 -40 L70 10 L-70 10 L-32 -40 L-58 -40 L-22 -90 L-40 -90 Z" fill={c} />
    <path d="M0 -150 L18 -122 L-18 -122 Z M-22 -90 L22 -90 L12 -80 L-12 -80 Z" fill="#f3efe6" opacity={0.9} />
    <rect x={-8} y={10} width={16} height={22} fill="#3b2618" />
  </g>
);

const Flakes: React.FC<{frame: number; n: number; size: number; speed: number; seed: string; op: number}> = ({frame, n, size, speed, seed, op}) => (
  <>
    {new Array(n).fill(0).map((_, i) => {
      const x0 = random(`${seed}x${i}`) * 1080;
      const y = ((random(`${seed}y${i}`) * 2000 + frame * speed * (0.7 + random(`${seed}s${i}`) * 0.6)) % 2000) - 40;
      const x = x0 + Math.sin(frame / 25 + i) * 18;
      return (
        <div
          key={i}
          style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%', background: '#fbf8f1', opacity: op, filter: shadow(4, 3, 0.25)}}
        />
      );
    })}
  </>
);

// ---------- exterior ----------
const Exterior: React.FC<{frame: number}> = ({frame}) => {
  const drift = (k: number) => interpolate(frame, [0, 180], [0, -30 * k]);
  const flick = 0.75 + 0.25 * Math.abs(Math.sin(frame / 4.3) * Math.sin(frame / 2.1));
  return (
    <AbsoluteFill>
      {/* sky paper */}
      <AbsoluteFill style={{background: 'linear-gradient(#1c2744 0%, #2d3c63 55%, #4b5d8a 100%)'}} />
      <div style={{position: 'absolute', left: 700, top: 300, width: 170, height: 170, borderRadius: '50%', background: '#f6efd9', filter: shadow(30, 0, 0.25), translate: `${drift(0.3)}px 0`}}>
        <div style={{position: 'absolute', left: 40, top: 50, width: 34, height: 34, borderRadius: '50%', background: '#e6dcc0'}} />
        <div style={{position: 'absolute', left: 100, top: 96, width: 22, height: 22, borderRadius: '50%', background: '#e6dcc0'}} />
      </div>
      {new Array(30).fill(0).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: random(`st${i}`) * 1080, top: 120 + random(`sy${i}`) * 700, width: 6, height: 6, background: '#f3ead0', rotate: '45deg', opacity: 0.5 + 0.5 * Math.abs(Math.sin(frame / 20 + i))}} />
      ))}
      {/* far mountains */}
      <svg width={1080} height={1920} style={{position: 'absolute', filter: shadow(18, 8, 0.3), translate: `${drift(0.5)}px 0`}}>
        <path d={torn(1020, 120, 'm1', 3, 8)} fill="#41507a" />
        <path d={torn(1100, 40, 'm1s', 6, 6)} fill="#e9e4d8" opacity={0.0} />
      </svg>
      {/* mid hills with pines */}
      <svg width={1080} height={1920} style={{position: 'absolute', filter: shadow(16, 10, 0.35), translate: `${drift(1)}px 0`}}>
        <path d={torn(1200, 60, 'h1', 2, 8)} fill="#dcd6c8" />
        {[80, 180, 260, 860, 960, 1040].map((x, i) => (
          <Pine key={x} x={x} y={1205 + Math.sin(i) * 20} s={0.9 + (i % 3) * 0.2} c="#24443d" />
        ))}
      </svg>
      {/* cabin hill */}
      <svg width={1080} height={1920} style={{position: 'absolute', filter: shadow(20, 12, 0.4), translate: `${drift(1.6)}px 0`}}>
        <path d={torn(1330, 50, 'h2', 1.5, 6)} fill="#eee9dd" />
        <g transform="translate(540 1335)">
          {/* smoke puffs */}
          {[0, 1, 2, 3, 4].map((k) => {
            const t = ((frame + k * 22) % 110) / 110;
            return <circle key={k} cx={95 + t * 60 + Math.sin(t * 6) * 14} cy={-330 - t * 360} r={22 + t * 40} fill="#cfd3de" opacity={(1 - t) * 0.85} />;
          })}
          <rect x={70} y={-330} width={50} height={110} fill="#6d4a39" />
          <rect x={62} y={-340} width={66} height={18} fill="#f4f0e7" />
          {/* body */}
          <rect x={-190} y={-210} width={380} height={210} fill="#7b4a2b" />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <rect key={k} x={-190} y={-200 + k * 34} width={380} height={6} fill="#5b341d" opacity={0.7} />
          ))}
          {/* roof + snow cap */}
          <path d="M-230 -200 L0 -330 L230 -200 Z" fill="#4a2b1a" />
          <path d="M-240 -196 Q -120 -270 0 -340 Q 120 -270 240 -196 Q 200 -186 160 -200 Q 120 -190 80 -206 Q 30 -196 -20 -210 Q -80 -190 -130 -204 Q -190 -184 -240 -196 Z" fill="#f6f2ea" />
          {/* window glow */}
          <rect x={-130} y={-150} width={110} height={90} fill="#ffb347" opacity={flick} style={{filter: `drop-shadow(0 0 ${30 * flick}px #ffb347)`}} />
          <path d="M-75 -150 L-75 -60 M-130 -105 L-20 -105" stroke="#5b341d" strokeWidth={8} />
          <rect x={40} y={-140} width={90} height={140} fill="#3d2414" />
          <circle cx={115} cy={-70} r={6} fill="#c9a24a" />
        </g>
      </svg>
      {/* foreground bank + fence */}
      <svg width={1080} height={1920} style={{position: 'absolute', filter: shadow(24, 14, 0.45), translate: `${drift(2.6)}px 0`}}>
        {[60, 170, 280, 390].map((x) => (
          <g key={x}>
            <rect x={x} y={1440} width={22} height={140} fill="#6b4630" />
            <rect x={x - 6} y={1430} width={34} height={16} fill="#f6f2ea" />
          </g>
        ))}
        <rect x={40} y={1475} width={400} height={14} fill="#6b4630" />
        <rect x={40} y={1525} width={400} height={14} fill="#6b4630" />
        <path d={torn(1540, 40, 'fg', 1.2, 8)} fill="#f8f5ee" />
        <Pine x={980} y={1560} s={1.6} c="#1d3833" />
      </svg>
      <Flakes frame={frame} n={36} size={10} speed={3} seed="fa" op={0.9} />
    </AbsoluteFill>
  );
};

// ---------- interior ----------
const Interior: React.FC<{frame: number}> = ({frame}) => {
  const f = frame;
  const flame = (k: number) => 0.85 + 0.15 * Math.sin(f / (2 + k * 0.7) + k);
  const glow = 0.7 + 0.3 * Math.abs(Math.sin(f / 3.1) * Math.sin(f / 1.7));
  return (
    <AbsoluteFill style={{background: '#3a2416'}}>
      {/* plank wall */}
      {new Array(9).fill(0).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: i * 124 - 10, top: 0, width: 120, height: 1920, background: i % 2 ? '#5a3720' : '#61401f', filter: shadow(8, 0, 0.35)}} />
      ))}
      {/* warm light pool */}
      <AbsoluteFill style={{background: `radial-gradient(circle at 540px 1180px, rgba(255,170,70,${0.55 * glow}) 0%, rgba(255,140,40,${0.25 * glow}) 30%, rgba(20,10,5,0.55) 70%)`}} />
      {/* frosted window */}
      <div style={{position: 'absolute', left: 120, top: 330, width: 230, height: 280, background: '#2a3a63', border: '18px solid #3d2414', filter: shadow(16, 10, 0.5)}}>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(240,245,255,0.6) 100%)'}} />
        <Flakes frame={f} n={8} size={7} speed={2} seed="wi" op={0.8} />
      </div>
      {/* hearth: stone arch */}
      <svg width={1080} height={1920} style={{position: 'absolute', filter: shadow(22, 14, 0.5)}}>
        <path d="M250 1500 L250 900 L830 900 L830 1500 Z" fill="#8c8478" />
        {new Array(40).fill(0).map((_, i) => {
          const r = Math.floor(i / 8);
          const c = i % 8;
          return <rect key={i} x={255 + c * 72 + (r % 2) * 36} y={905 + r * 120} width={66} height={112} rx={10} fill={['#9a9184', '#80786d', '#a29a8d'][i % 3]} />;
        })}
        <path d="M370 1500 L370 1220 Q 540 1080 710 1220 L710 1500 Z" fill="#1a0e08" />
        {/* logs */}
        <rect x={420} y={1430} width={240} height={36} rx={18} fill="#5b341d" />
        <rect x={440} y={1400} width={200} height={34} rx={17} fill="#6d4128" transform="rotate(-8 540 1417)" />
        {/* flames: layered paper */}
        {[
          ['#ff6a2b', 1.0, 0],
          ['#ffa63b', 0.78, 1],
          ['#ffe08a', 0.5, 2],
        ].map(([c, k, i]) => (
          <path
            key={i as number}
            d={`M${540 - 110 * (k as number)} 1420 Q ${520 - 60 * (k as number)} ${1300 - 40 * flame(i as number)} ${540} ${1420 - 230 * (k as number) * flame(i as number)} Q ${560 + 60 * (k as number)} ${1300 - 30 * flame((i as number) + 1)} ${540 + 110 * (k as number)} 1420 Z`}
            fill={c as string}
            style={{filter: `drop-shadow(0 0 ${20 * glow}px rgba(255,150,50,0.9))`}}
          />
        ))}
        {/* mantel */}
        <rect x={210} y={860} width={660} height={50} fill="#4a2b1a" />
      </svg>
      {/* family under a patchwork quilt, close to the fire */}
      <svg width={1080} height={1920} style={{position: 'absolute', filter: shadow(20, 12, 0.5)}}>
        {[
          [300, 1560, 70],
          [420, 1540, 78],
          [560, 1550, 60],
          [680, 1545, 74],
          [790, 1565, 56],
        ].map(([x, y, r], i) => (
          <g key={i} transform={`translate(0 ${Math.sin(f / 18 + i) * 3})`}>
            <circle cx={x} cy={y - r * 1.7} r={r * 0.62} fill="#e3b48c" />
            <path d={`M${x - r * 0.3} ${y - r * 1.62} q ${r * 0.1} ${r * 0.1} ${r * 0.2} 0 M${x + r * 0.1} ${y - r * 1.62} q ${r * 0.1} ${r * 0.1} ${r * 0.2} 0`} stroke="#5a3a28" strokeWidth={4} fill="none" strokeLinecap="round" />
            <circle cx={x - r * 0.38} cy={y - r * 1.48} r={r * 0.1} fill="#e98f7a" opacity={0.6} />
            <circle cx={x + r * 0.38} cy={y - r * 1.48} r={r * 0.1} fill="#e98f7a" opacity={0.6} />
            <path d={`M${x - r * 0.7} ${y - r * 2.1} Q ${x} ${y - r * 2.6} ${x + r * 0.7} ${y - r * 2.1} L ${x + r * 0.7} ${y - r * 1.9} L ${x - r * 0.7} ${y - r * 1.9} Z`} fill={['#7a2e2a', '#2f4a6b', '#6b5a2a', '#3c5a3c', '#7a2e2a'][i]} />
          </g>
        ))}
        <path d="M170 1520 Q 540 1440 910 1520 L 960 1920 L 120 1920 Z" fill="#b5443a" />
        {new Array(24).fill(0).map((_, i) => {
          const c = i % 8;
          const r = Math.floor(i / 8);
          return <rect key={i} x={170 + c * 96} y={1560 + r * 110} width={88} height={100} fill={['#d98c3f', '#3e6b8a', '#e9dcc0', '#7d9a5a', '#a63d33'][(i * 3) % 5]} opacity={0.92} />;
        })}
      </svg>
      <Flakes frame={f} n={14} size={6} speed={-1.2} seed="emb" op={0} />
    </AbsoluteFill>
  );
};

export const B_PaperDiorama: React.FC = () => {
  const frame = useCurrentFrame();
  // push into the cabin window, then cut to interior
  const push = interpolate(frame, [95, 140], [1, 3.6], {...cl, easing: EZ});
  const toInside = interpolate(frame, [128, 146], [0, 1], cl);
  const insideZoom = interpolate(frame, [130, 240], [1.18, 1.0], {...cl, easing: EZ});
  return (
    <AbsoluteFill style={{background: '#1c2744', overflow: 'hidden'}}>
      <AbsoluteFill style={{scale: String(push), transformOrigin: '465px 1235px'}}>
        <Exterior frame={frame} />
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: toInside, scale: String(insideZoom)}}>
        <Interior frame={frame} />
      </AbsoluteFill>
      <Grain id="g1" />
      {/* paper tags */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 150,
          padding: '26px 34px',
          background: '#f4eedf',
          rotate: `${interpolate(frame, [0, 20], [-14, -3], {...cl, easing: Easing.out(Easing.back(2))})}deg`,
          translate: `0 ${interpolate(frame, [0, 20], [-300, 0], {...cl, easing: Easing.out(Easing.cubic)})}px`,
          filter: shadow(14, 10, 0.45),
          opacity: 1 - toInside,
        }}
      >
        <div style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: '#8a3b2a'}}>Winter, 1850s</div>
        <div style={{fontFamily: F.serif, fontWeight: 900, fontSize: 84, lineHeight: 0.95, color: '#1d1a17', marginTop: 8}}>
          No furnace.
          <br />
          No thermostat.
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: 170,
          padding: '28px 34px',
          background: '#f4eedf',
          rotate: '2deg',
          filter: shadow(14, 10, 0.5),
          opacity: interpolate(frame, [150, 165], [0, 1], cl),
          translate: `0 ${interpolate(frame, [150, 168], [-260, 0], {...cl, easing: Easing.out(Easing.back(1.6))})}px`,
        }}
      >
        <div style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 700, fontSize: 38, color: '#8a3b2a'}}>So how did they survive?</div>
        <div style={{fontFamily: F.serif, fontWeight: 900, fontSize: 76, lineHeight: 0.98, color: '#1d1a17', marginTop: 8}}>One room. One fire. Everyone close.</div>
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(10,6,4,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};
