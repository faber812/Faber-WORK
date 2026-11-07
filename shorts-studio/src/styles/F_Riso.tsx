// STYLE F — "Riso civil-defense film": 1950s public-service film look, printed on a risograph.
// Cream paper, two spot inks with mis-registration, halftone, gate weave, dust, flicker.
// Topic: the Ready.gov basic kit for the first 72 hours (water: 1 gallon per person per day).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {F} from './fonts';

const PAPER = '#f2e8cf';
const RED = '#e2492f';
const TEAL = '#1d6b74';
const INK = '#1e1b18';
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const ITEMS = [
  {t: 'WATER', s: '1 gallon per person, per day', a: 70},
  {t: 'FLASHLIGHT', s: '+ extra batteries', a: 100},
  {t: 'RADIO', s: 'battery or hand-crank', a: 130},
  {t: 'FIRST AID KIT', s: '+ any medicines you need', a: 160},
];

// two-ink print: draw the same art in teal + red with a small offset (mis-registration)
const Riso: React.FC<{children: (ink: string) => React.ReactNode; dx?: number; dy?: number}> = ({children, dx = 5, dy = -3}) => (
  <>
    <g style={{mixBlendMode: 'multiply'}} transform={`translate(${dx} ${dy})`} opacity={0.9}>
      {children(RED)}
    </g>
    <g style={{mixBlendMode: 'multiply'}} opacity={0.92}>
      {children(TEAL)}
    </g>
  </>
);

const Jug: React.FC<{ink: string}> = ({ink}) => (
  <g>
    <path d="M-120 -40 Q -130 -180 -60 -200 L -40 -250 L 40 -250 L 60 -200 Q 130 -180 120 -40 L 120 200 Q 120 240 80 240 L -80 240 Q -120 240 -120 200 Z" fill={ink} />
    <path d="M60 -150 Q 170 -150 170 -40 Q 170 40 100 40" stroke={ink} strokeWidth={30} fill="none" />
    <rect x={-50} y={-285} width={100} height={42} rx={8} fill={ink} />
    <rect x={-80} y={20} width={160} height={110} fill={PAPER} />
    <text x={0} y={95} textAnchor="middle" fontFamily={F.bebas} fontSize={70} fill={ink}>
      1 GAL
    </text>
  </g>
);

export const F_Riso: React.FC = () => {
  const frame = useCurrentFrame();
  // gate weave: tiny jitter every 2 frames, occasional flicker
  const j = Math.floor(frame / 2);
  const wx = (random(`wx${j}`) - 0.5) * 6;
  const wy = (random(`wy${j}`) - 0.5) * 8;
  const flicker = 0.92 + random(`fl${j}`) * 0.1;
  const title = interpolate(frame, [0, 22], [0, 1], {...cl, easing: Easing.out(Easing.back(1.4))});
  const jugIn = interpolate(frame, [30, 55], [0, 1], {...cl, easing: Easing.out(Easing.back(1.6))});
  const pour = Math.sin(frame / 12) * 4;
  return (
    <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
      <AbsoluteFill style={{translate: `${wx}px ${wy}px`, filter: `brightness(${flicker})`}}>
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <defs>
            <pattern id="halftone" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
              <circle cx={7} cy={7} r={3.6} fill={TEAL} />
            </pattern>
            <pattern id="halftoneR" width={12} height={12} patternUnits="userSpaceOnUse" patternTransform="rotate(-15)">
              <circle cx={6} cy={6} r={3.2} fill={RED} />
            </pattern>
            <filter id="rough">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} seed={4} result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale={6} />
            </filter>
          </defs>
          {/* sunburst behind the jug */}
          <g transform="translate(540 820)" opacity={jugIn} style={{mixBlendMode: 'multiply'}}>
            {new Array(18).fill(0).map((_, i) => (
              <path key={i} d="M0 0 L-60 -620 L60 -620 Z" fill="url(#halftoneR)" opacity={0.55} transform={`rotate(${i * 20 + frame * 0.3})`} />
            ))}
            <circle r={300} fill="url(#halftone)" opacity={0.45} />
          </g>
          {/* jug, two inks */}
          <g transform={`translate(540 860) scale(${jugIn}) rotate(${pour})`} filter="url(#rough)">
            <Riso>{(ink) => <Jug ink={ink} />}</Riso>
          </g>
          {/* drops */}
          {[0, 1, 2].map((k) => {
            const t = ((frame + k * 12) % 36) / 36;
            return <path key={k} d="M0 -18 Q 14 4 0 14 Q -14 4 0 -18 Z" fill={TEAL} transform={`translate(${700 + k * 10} ${700 + t * 260})`} opacity={jugIn * (1 - t)} />;
          })}
        </svg>

        {/* title banner */}
        <div style={{position: 'absolute', top: 120, left: 60, right: 60, textAlign: 'center', scale: String(title), rotate: '-2deg'}}>
          <div style={{display: 'inline-block', background: RED, color: PAPER, fontFamily: F.oswald, fontWeight: 700, fontSize: 34, letterSpacing: 10, padding: '8px 24px', mixBlendMode: 'multiply'}}>
            A PUBLIC SERVICE REMINDER
          </div>
          <div style={{fontFamily: F.archivo, fontSize: 112, lineHeight: 0.92, color: INK, marginTop: 18, textShadow: `5px -3px 0 ${RED}`}}>
            THE FIRST
            <br />
            72 HOURS
          </div>
        </div>

        {/* checklist */}
        <div style={{position: 'absolute', top: 1250, left: 90, right: 90}}>
          {ITEMS.map((it) => {
            const p = interpolate(frame, [it.a, it.a + 12], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
            const stamp = interpolate(frame, [it.a + 10, it.a + 16], [2.2, 1], {...cl, easing: Easing.out(Easing.back(3))});
            return (
              <div key={it.t} style={{display: 'flex', alignItems: 'center', gap: 28, marginBottom: 26, opacity: p, translate: `${(1 - p) * -80}px 0`}}>
                <div style={{position: 'relative', width: 70, height: 70, border: `6px solid ${INK}`, flexShrink: 0}}>
                  <div style={{position: 'absolute', inset: -14, fontFamily: F.archivo, fontSize: 86, lineHeight: '86px', textAlign: 'center', color: RED, scale: String(stamp), opacity: frame > it.a + 10 ? 0.9 : 0, rotate: '-8deg', mixBlendMode: 'multiply'}}>
                    ✓
                  </div>
                </div>
                <div>
                  <div style={{fontFamily: F.oswald, fontWeight: 700, fontSize: 60, letterSpacing: 2, color: INK, lineHeight: 1}}>{it.t}</div>
                  <div style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 700, fontSize: 34, color: TEAL, marginTop: 4}}>{it.s}</div>
                </div>
              </div>
            );
          })}
          <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: 4, color: INK, opacity: interpolate(frame, [190, 205], [0, 0.7], cl), marginTop: 10}}>SOURCE: READY.GOV — BUILD A KIT</div>
        </div>
      </AbsoluteFill>

      {/* paper grain, dust, scratches */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.35}}>
        <filter id="pg">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={3} seed={j % 6} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={1080} height={1920} filter="url(#pg)" />
      </svg>
      {new Array(10).fill(0).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: random(`dx${j}${i}`) * 1080, top: random(`dy${j}${i}`) * 1920, width: 2 + random(`ds${j}${i}`) * 6, height: 2 + random(`dh${j}${i}`) * 6, borderRadius: '50%', background: INK, opacity: 0.5}} />
      ))}
      {random(`scr${Math.floor(frame / 6)}`) > 0.5 && (
        <div style={{position: 'absolute', left: random(`sx${Math.floor(frame / 6)}`) * 1080, top: 0, width: 2, height: 1920, background: INK, opacity: 0.18}} />
      )}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(60,40,20,0.35) 100%)'}} />
    </AbsoluteFill>
  );
};
