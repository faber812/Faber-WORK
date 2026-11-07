// STYLE D — "Data noir": cinematic finance documentary. Black, film grain, gold/red, serif type,
// a chart that draws itself with bloom. Topic: the dot-com bubble as the frame for "is AI next?".
// Data: NASDAQ Composite approx. year-end closes 1994–2001, peak 5,048.62 (Mar 10 2000), trough 1,114.11 (Oct 9 2002).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {F} from './fonts';

const GOLD = '#e2b866';
const RED = '#ff4d4d';
const INK = '#efe7da';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const EZ = Easing.bezier(0.16, 1, 0.3, 1);

// [year fraction, value]
const PTS: [number, number][] = [
  [1995.0, 752],
  [1996.0, 1052],
  [1997.0, 1291],
  [1998.0, 1570],
  [1999.0, 2193],
  [1999.8, 2966],
  [2000.0, 4069],
  [2000.19, 5048],
  [2000.45, 3800],
  [2001.0, 2470],
  [2001.7, 1500],
  [2002.0, 1950],
  [2002.77, 1114],
];
const X0 = 110;
const X1 = 970;
const Y0 = 1420; // value 0
const Y1 = 760; // value 5200
const px = (yr: number) => X0 + ((yr - 1995) / (2002.9 - 1995)) * (X1 - X0);
const py = (v: number) => Y0 - (v / 5200) * (Y0 - Y1);
const PEAK_I = 7;
const up = PTS.slice(0, PEAK_I + 1).map(([x, v], i) => `${i ? 'L' : 'M'}${px(x).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');
const down = PTS.slice(PEAK_I).map(([x, v], i) => `${i ? 'L' : 'M'}${px(x).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');
const UPL = getLength(up);
const DNL = getLength(down);

const UP_A = 40;
const UP_B = 120;
const DN_A = 130;
const DN_B = 175;

export const D_DataNoir: React.FC = () => {
  const frame = useCurrentFrame();
  const upP = interpolate(frame, [UP_A, UP_B], [0, 1], {...cl, easing: Easing.in(Easing.quad)});
  const dnP = interpolate(frame, [DN_A, DN_B], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  const head = frame < DN_A ? getPointAtLength(up, UPL * upP) : getPointAtLength(down, DNL * dnP);
  const crashing = frame >= DN_A;
  const value = crashing ? Math.round(interpolate(dnP, [0, 1], [5048, 1114])) : Math.round(interpolate(upP, [0, 1], [752, 5048], {easing: Easing.in(Easing.quad)}));
  const shake = crashing && frame < DN_B ? (random(`sh${frame}`) - 0.5) * 10 : 0;
  const pct = interpolate(frame, [DN_B, DN_B + 20], [0, 1], {...cl, easing: EZ});
  const color = crashing ? RED : GOLD;
  return (
    <AbsoluteFill style={{background: '#060608', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${head.x}px ${head.y}px, ${crashing ? 'rgba(255,60,60,0.18)' : 'rgba(226,184,102,0.16)'} 0%, transparent 45%)`}} />
      {/* headline */}
      <div style={{position: 'absolute', top: 150, left: 90, right: 90, color: INK}}>
        <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: 4, color: GOLD, opacity: interpolate(frame, [0, 12], [0, 1], cl)}}>NASDAQ COMPOSITE · 1995–2002 · SIMPLIFIED</div>
        <div
          style={{
            fontFamily: F.serif,
            fontWeight: 900,
            fontSize: 92,
            lineHeight: 1.0,
            marginTop: 18,
            clipPath: `inset(0 ${interpolate(frame, [4, 34], [100, 0], {...cl, easing: EZ})}% 0 0)`,
          }}
        >
          The last time tech was <span style={{fontStyle: 'italic', color: GOLD}}>this</span> hot…
        </div>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', translate: `${shake}px ${shake * 0.6}px`}}>
        <defs>
          <filter id="bloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <linearGradient id="fillUp" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={GOLD} stopOpacity={0.28} />
            <stop offset="1" stopColor={GOLD} stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* axis */}
        {[1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002].map((y) => (
          <g key={y} opacity={interpolate(frame, [10, 30], [0, 1], cl)}>
            <line x1={px(y)} x2={px(y)} y1={Y1 - 40} y2={Y0} stroke="#ffffff" strokeOpacity={0.06} />
            <text x={px(y)} y={Y0 + 50} textAnchor="middle" fontFamily={F.mono} fontSize={24} fill="#8e877b">
              {`'${String(y).slice(2)}`}
            </text>
          </g>
        ))}
        {[1000, 2000, 3000, 4000, 5000].map((v) => (
          <g key={v} opacity={interpolate(frame, [10, 30], [0, 1], cl)}>
            <line x1={X0} x2={X1} y1={py(v)} y2={py(v)} stroke="#ffffff" strokeOpacity={0.07} strokeDasharray="4 10" />
            <text x={X0 - 14} y={py(v) + 8} textAnchor="end" fontFamily={F.mono} fontSize={20} fill="#6f695f">
              {v / 1000}k
            </text>
          </g>
        ))}
        {/* area under the rise */}
        <path d={`${up} L${px(2000.19)} ${Y0} L${X0} ${Y0} Z`} fill="url(#fillUp)" opacity={interpolate(frame, [UP_B - 6, UP_B + 14], [0, 1], cl)} />
        {/* line: bloom + core */}
        {[
          [up, UPL, upP, GOLD],
          [down, DNL, dnP, RED],
        ].map(([d, L, p, c], i) => (
          <g key={i}>
            <path d={d as string} stroke={c as string} strokeWidth={14} fill="none" filter="url(#bloom)" opacity={0.7} strokeDasharray={L as number} strokeDashoffset={(L as number) * (1 - (p as number))} />
            <path d={d as string} stroke={c as string} strokeWidth={5} fill="none" strokeLinejoin="round" strokeDasharray={L as number} strokeDashoffset={(L as number) * (1 - (p as number))} />
          </g>
        ))}
        {/* head dot */}
        {frame >= UP_A && (
          <g>
            <circle cx={head.x} cy={head.y} r={26} fill={color} opacity={0.25} filter="url(#bloom)" />
            <circle cx={head.x} cy={head.y} r={10} fill="#fff" />
          </g>
        )}
        {/* peak annotation */}
        <g opacity={interpolate(frame, [UP_B - 2, UP_B + 10], [0, 1], cl)}>
          <line x1={px(2000.19)} x2={px(2000.19)} y1={py(5048) - 20} y2={py(5048) - 120} stroke={GOLD} strokeWidth={2} />
          <text x={px(2000.19)} y={py(5048) - 140} textAnchor="middle" fontFamily={F.mono} fontWeight={600} fontSize={26} fill={GOLD}>
            PEAK · MAR 10, 2000
          </text>
        </g>
        <g opacity={interpolate(frame, [DN_B - 2, DN_B + 10], [0, 1], cl)}>
          <text x={px(2002.77)} y={py(1114) + 70} textAnchor="end" fontFamily={F.mono} fontWeight={600} fontSize={26} fill={RED}>
            OCT 9, 2002 · 1,114
          </text>
        </g>
      </svg>
      {/* live counter */}
      <div style={{position: 'absolute', top: 560, left: 90, fontFamily: F.bebas, fontSize: 150, letterSpacing: 2, color, textShadow: `0 0 40px ${color}66`, fontVariantNumeric: 'tabular-nums'}}>
        {value.toLocaleString('en-US')}
      </div>
      {/* verdict */}
      <div style={{position: 'absolute', top: 1520, width: '100%', textAlign: 'center'}}>
        <div style={{fontFamily: F.bebas, fontSize: 230, lineHeight: 0.9, color: RED, scale: String(interpolate(pct, [0, 1], [1.6, 1])), opacity: pct, textShadow: `0 0 60px ${RED}66`}}>−78%</div>
        <div style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 700, fontSize: 64, color: GOLD, opacity: interpolate(frame, [DN_B + 25, DN_B + 40], [0, 1], cl), marginTop: 6}}>
          Is AI next?
        </div>
      </div>
      {/* film grain + letterbox vignette */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: 0.09}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 12} />
        </filter>
        <rect width={1080} height={1920} filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)'}} />
    </AbsoluteFill>
  );
};
