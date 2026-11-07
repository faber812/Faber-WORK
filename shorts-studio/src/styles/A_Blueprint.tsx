// STYLE A — "Blueprint": an engineering drawing that draws itself, then fails.
// Topic: how electricity reaches a house, and what a substation fault does downstream.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {F} from './fonts';

const INK = '#d9eeff';
const BG = '#0b2b4c';
const AMBER = '#ffc04d';
const RED = '#ff5b4f';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const EZ = Easing.bezier(0.16, 1, 0.3, 1);

const draw = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [1, 0], {...cl, easing: EZ});
const fade = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], cl);
const typed = (text: string, frame: number, start: number, cps = 1.4) =>
  text.slice(0, Math.max(0, Math.floor((frame - start) * cps)));

// stroke props for a self-drawing path
const S = (frame: number, a: number, b: number, color = INK, w = 3) => ({
  pathLength: 1,
  strokeDasharray: 1,
  strokeDashoffset: draw(frame, a, b),
  stroke: color,
  strokeWidth: w,
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

// conductor route (sagging spans) — plant → T1 → T2 → substation → pole → house
const SEG = [
  'M450 520 Q 580 640 712 640',
  'M712 640 Q 540 980 372 940',
  'M372 940 Q 500 1150 612 1200',
  'M828 1300 Q 580 1460 362 1410',
  'M362 1410 Q 500 1580 620 1560',
];
const ROUTE = 'M450 520 Q 580 640 712 640 Q 540 980 372 940 Q 500 1150 612 1200 L 828 1300 Q 580 1460 362 1410 Q 500 1580 620 1560';
const ROUTE_LEN = getLength(ROUTE);
const FAULT_AT = 165;
const FAULT_POS = getLength('M450 520 Q 580 640 712 640 Q 540 980 372 940 Q 500 1150 612 1200');

const Tower: React.FC<{x: number; base: number; h: number; frame: number; a: number}> = ({x, base, h, frame, a}) => {
  const top = base - h;
  const lv = [0.25, 0.5, 0.75].map((t) => base - h * t);
  const half = (y: number) => 40 - (30 * (base - y)) / h;
  return (
    <g>
      <path d={`M${x - 40} ${base} L${x - 10} ${top} M${x + 40} ${base} L${x + 10} ${top}`} {...S(frame, a, a + 25)} />
      {lv.map((y, i) => {
        const y2 = i < 2 ? lv[i + 1] : top;
        return (
          <path
            key={i}
            d={`M${x - half(y)} ${y} L${x + half(y2)} ${y2} M${x + half(y)} ${y} L${x - half(y2)} ${y2} M${x - half(y)} ${y} L${x + half(y)} ${y}`}
            {...S(frame, a + 8 + i * 4, a + 30 + i * 4, INK, 2)}
          />
        );
      })}
      <path d={`M${x - 70} ${top + 18} L${x + 70} ${top + 18} M${x - 55} ${top + 48} L${x + 55} ${top + 48}`} {...S(frame, a + 20, a + 38)} />
      <path d={`M${x - 70} ${top + 18} l0 22 M${x + 70} ${top + 18} l0 22 M${x - 55} ${top + 48} l0 18 M${x + 55} ${top + 48} l0 18`} {...S(frame, a + 30, a + 42, INK, 2)} />
    </g>
  );
};

const Callout: React.FC<{x: number; y: number; dx: number; text: string; sub?: string; frame: number; a: number; color?: string}> = ({
  x,
  y,
  dx,
  text,
  sub,
  frame,
  a,
  color = INK,
}) => {
  const ex = x + dx;
  const right = dx > 0;
  return (
    <g>
      <circle cx={x} cy={y} r={6} fill={color} opacity={fade(frame, a, a + 6)} />
      <path d={`M${x} ${y} L${ex} ${y}`} {...S(frame, a, a + 12, color, 2)} />
      <text x={right ? ex + 12 : ex - 12} y={y + 10} textAnchor={right ? 'start' : 'end'} fontFamily={F.mono} fontWeight={600} fontSize={30} fill={color}>
        {typed(text, frame, a + 8)}
      </text>
      {sub && (
        <text x={right ? ex + 12 : ex - 12} y={y + 46} textAnchor={right ? 'start' : 'end'} fontFamily={F.mono} fontSize={24} fill={color} opacity={0.7}>
          {typed(sub, frame, a + 18, 1.8)}
        </text>
      )}
    </g>
  );
};

export const A_Blueprint: React.FC = () => {
  const frame = useCurrentFrame();
  const fault = frame >= FAULT_AT;
  const flash = interpolate(frame, [FAULT_AT, FAULT_AT + 3, FAULT_AT + 14], [0, 1, 0], cl);
  const zoom = interpolate(frame, [0, 240], [1.0, 1.07]);
  const downstream = fault ? RED : INK;
  const houseLit = fault ? interpolate(frame, [FAULT_AT + 8, FAULT_AT + 12], [1, 0], cl) : fade(frame, 150, 158);

  // electricity pulses
  const pulses = new Array(14).fill(0).map((_, i) => {
    const d = ((frame - 60) * 9 + i * (ROUTE_LEN / 14)) % ROUTE_LEN;
    if (frame < 60 + i * 3) return null;
    if (fault && d > FAULT_POS - 4) return null;
    if (d > ROUTE_LEN * interpolate(frame, [50, 160], [0, 1], cl)) return null;
    const p = getPointAtLength(ROUTE, Math.max(0, d));
    return <circle key={i} cx={p.x} cy={p.y} r={7} fill={AMBER} filter="url(#glow)" />;
  });

  return (
    <AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
      {/* drafting grid */}
      <AbsoluteFill
        style={{
          opacity: fade(frame, 0, 15),
          backgroundImage: `linear-gradient(rgba(217,238,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(217,238,255,0.07) 1px, transparent 1px), linear-gradient(rgba(217,238,255,0.16) 2px, transparent 2px), linear-gradient(90deg, rgba(217,238,255,0.16) 2px, transparent 2px)`,
          backgroundSize: '36px 36px, 36px 36px, 180px 180px, 180px 180px',
        }}
      />
      <svg width={1080} height={1920} style={{position: 'absolute', scale: String(zoom), transformOrigin: '540px 960px'}}>
        <defs>
          <filter id="glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="paper">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" />
          </filter>
        </defs>

        {/* frame border + title block */}
        <rect x={40} y={40} width={1000} height={1840} {...S(frame, 0, 30, INK, 2)} />
        <rect x={56} y={56} width={968} height={1808} {...S(frame, 5, 35, INK, 1)} opacity={0.5} />

        {/* POWER PLANT */}
        <path d="M150 560 C 175 480, 168 430, 182 372 L 262 372 C 276 430, 270 480, 294 560 Z" {...S(frame, 10, 45)} />
        {[400, 430, 460, 490, 520].map((y, i) => (
          <path key={y} d={`M${178 - i * 2} ${y} L${266 + i * 2} ${y}`} {...S(frame, 25 + i * 3, 45 + i * 3, INK, 1)} opacity={0.5} />
        ))}
        <path d="M300 560 L300 470 L420 470 L420 560 M376 470 L376 360 L400 360 L400 470" {...S(frame, 20, 50)} />
        {/* step-up transformer */}
        <path d="M428 560 L428 500 L472 500 L472 560 M436 500 L436 488 M450 500 L450 484 M464 500 L464 488" {...S(frame, 40, 58)} />
        {/* steam */}
        {[0, 1, 2].map((i) => {
          const t = ((frame + i * 25) % 75) / 75;
          return (
            <path
              key={i}
              d={`M${200 + i * 22} ${360 - t * 120} q 12 -18 0 -36 q -12 -18 0 -36`}
              stroke={INK}
              strokeWidth={2}
              fill="none"
              opacity={fade(frame, 40, 60) * (1 - t) * 0.6}
            />
          );
        })}
        <path d="M110 562 L500 562" {...S(frame, 5, 30, INK, 2)} />

        {/* conductor spans */}
        {SEG.map((d, i) => (
          <path key={i} d={d} {...S(frame, 50 + i * 22, 85 + i * 22, i >= 3 ? downstream : INK, 3)} strokeDasharray={fault && i >= 3 ? '0.035 0.025' : 1} strokeDashoffset={fault && i >= 3 ? -frame * 0.004 : draw(frame, 50 + i * 22, 85 + i * 22)} />
        ))}

        <Tower x={780} base={900} h={260} frame={frame} a={55} />
        <Tower x={300} base={1180} h={240} frame={frame} a={78} />
        <path d="M680 902 L880 902 M200 1182 L400 1182" {...S(frame, 55, 80, INK, 2)} />

        {/* SUBSTATION */}
        <g>
          <path d="M590 1180 L870 1180 L870 1330 L590 1330 Z" {...S(frame, 100, 130, INK, 2)} strokeDasharray={frame > 130 ? '0.012 0.012' : 1} strokeDashoffset={frame > 130 ? 0 : draw(frame, 100, 130)} />
          {[640, 760].map((x, i) => (
            <g key={x}>
              <path d={`M${x} 1310 L${x} 1230 L${x + 70} 1230 L${x + 70} 1310 Z`} {...S(frame, 108 + i * 6, 130 + i * 6, fault && i === 1 ? RED : INK)} />
              {[0, 1, 2, 3].map((k) => (
                <path key={k} d={`M${x + 10 + k * 16} 1240 L${x + 10 + k * 16} 1300`} {...S(frame, 115 + i * 6, 135 + i * 6, INK, 1)} opacity={0.6} />
              ))}
            </g>
          ))}
          <path d="M612 1200 L640 1230 M710 1230 L760 1230 M830 1230 L828 1300" {...S(frame, 120, 140, INK, 2)} />
        </g>

        {/* POLE + CAN TRANSFORMER */}
        <path d="M360 1410 L360 1640 M300 1420 L420 1420" {...S(frame, 130, 150, downstream)} />
        <rect x={366} y={1440} width={36} height={56} rx={10} {...S(frame, 138, 152, downstream)} />
        <path d="M290 1642 L430 1642" {...S(frame, 130, 150, INK, 2)} />

        {/* HOUSE */}
        <path d="M560 1700 L560 1600 L640 1540 L720 1600 L720 1700 Z" {...S(frame, 140, 165, downstream)} />
        <rect x={585} y={1615} width={50} height={44} fill={AMBER} opacity={houseLit * 0.9} filter="url(#glow)" />
        <rect x={585} y={1615} width={50} height={44} {...S(frame, 150, 160, downstream, 2)} />
        <path d="M660 1700 L660 1640 L700 1640 L700 1700" {...S(frame, 150, 162, downstream, 2)} />
        <path d="M500 1702 L780 1702" {...S(frame, 140, 160, INK, 2)} />

        {pulses}

        {/* callouts */}
        <Callout x={450} y={500} dx={90} text="STEP-UP" sub="up to 345+ kV" frame={frame} a={62} />
        <text x={110} y={760} textAnchor="start" fontFamily={F.mono} fontWeight={600} fontSize={30} fill={INK} opacity={fade(frame, 90, 96)}>
          {typed('TRANSMISSION', frame, 90)}
        </text>
        <text x={110} y={796} textAnchor="start" fontFamily={F.mono} fontSize={24} fill={INK} opacity={0.7}>
          {typed('115–765 kV · LONG DISTANCE', frame, 100, 1.8)}
        </text>
        <text x={880} y={1160} textAnchor="end" fontFamily={F.mono} fontWeight={600} fontSize={30} fill={fault ? RED : INK}>
          {typed('SUBSTATION', frame, 128)}
        </text>
        <text x={880} y={1365} textAnchor="end" fontFamily={F.mono} fontSize={24} fill={INK} opacity={0.7}>
          {typed('STEPS DOWN TO ~4–35 kV', frame, 136, 1.8)}
        </text>
        <text x={110} y={1540} fontFamily={F.mono} fontWeight={600} fontSize={28} fill={fault ? RED : INK}>
          {typed('POLE TRANSFORMER', frame, 148)}
        </text>
        <text x={110} y={1574} fontFamily={F.mono} fontSize={24} fill={INK} opacity={0.7}>
          {typed('→ 120/240 V', frame, 158, 1.8)}
        </text>
        <text x={740} y={1690} fontFamily={F.mono} fontWeight={600} fontSize={28} fill={fault ? RED : INK}>
          {typed('YOUR HOUSE', frame, 158)}
        </text>

        {/* FAULT */}
        {fault && (
          <g transform={`translate(728 1255)`}>
            {[0, 1, 2].map((k) => {
              const t = ((frame - FAULT_AT + k * 10) % 40) / 40;
              return <circle key={k} r={30 + t * 140} fill="none" stroke={RED} strokeWidth={3} opacity={(1 - t) * 0.8} />;
            })}
            <g transform={`rotate(-8) scale(${interpolate(frame, [FAULT_AT, FAULT_AT + 8], [1.8, 1], {...cl, easing: Easing.out(Easing.back(2))})})`}>
              <rect x={-150} y={-52} width={300} height={104} fill="none" stroke={RED} strokeWidth={6} />
              <text textAnchor="middle" y={22} fontFamily={F.bebas} fontSize={86} fill={RED} letterSpacing={6}>
                FAULT
              </text>
            </g>
          </g>
        )}
        {fault && (
          <text x={540} y={1790} textAnchor="middle" fontFamily={F.mono} fontWeight={600} fontSize={32} fill={RED}>
            {typed('▲ EVERYTHING DOWNSTREAM GOES DARK', frame, FAULT_AT + 14, 1.6)}
          </text>
        )}
        <rect width={1080} height={1920} filter="url(#paper)" />
      </svg>

      {/* header */}
      <div style={{position: 'absolute', top: 92, left: 90, right: 90, fontFamily: F.mono, color: INK}}>
        <div style={{fontSize: 26, letterSpacing: 6, opacity: 0.75}}>{typed('FIG. 01 — THE GRID GOES DOWN', frame, 4, 2)}</div>
        <div style={{fontFamily: F.grotesk, fontWeight: 700, fontSize: 62, lineHeight: 1.05, marginTop: 14}}>
          {typed('How power reaches your house', frame, 12, 1.3)}
        </div>
      </div>
      {/* title block */}
      <div
        style={{
          position: 'absolute',
          right: 72,
          bottom: 70,
          border: `2px solid ${INK}`,
          padding: '10px 18px',
          fontFamily: F.mono,
          fontSize: 20,
          color: INK,
          opacity: fade(frame, 20, 40) * 0.8 * (fault ? interpolate(frame, [FAULT_AT, FAULT_AT + 10], [1, 0], cl) : 1),
          lineHeight: 1.5,
        }}
      >
        SHEET 01/06 · SCALE: NTS
        <br />
        DWG: GRID-HOUR-1
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.18}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,10,25,0.6) 100%)'}} />
      {/* subtle film flicker */}
      <AbsoluteFill style={{background: '#000', opacity: 0.03 + 0.03 * random(`fl${frame}`)}} />
    </AbsoluteFill>
  );
};
