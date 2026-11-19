// Short 010 — "Who the Cold Took in the 2021 Texas Freeze" (1080x1920, 30 fps, no music).
// Script: yt-channel content/scripts/short-010-cold60.md v2. Long 002's 246 cubes reflowed for vertical:
// columns 7 wide, one cube size throughout; cubes only move and change tint, never break or fade "dying".
// No characters, no human figures, nothing touches a cube. Every cut is keyed to a word sequence in the timing.
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timing from './s010_timing.json';
import {blend, C, CUBES, FONT, Look} from '../long2/engine';

export const S010_FPS = 30;
export const S010_FRAMES = Math.ceil((timing.duration + 0.4) * S010_FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const W = timing.words as [string, number, number][];

// ---------- cues: a word sequence, first match at or after `after` ----------
const toks = (text: string) => {
  const out: string[] = [];
  for (const raw of text.replace(/-/g, ' ').match(/[A-Za-z][A-Za-z']*/g) ?? []) {
    const poss = raw.endsWith("'s");
    const base = poss ? raw.slice(0, -2) : raw;
    if (base.length >= 2 && base === base.toUpperCase()) out.push(...base.toLowerCase().split(''), ...(poss ? ['s'] : []));
    else out.push(raw.toLowerCase());
  }
  return out;
};
const q = (head: string, after = 0) => {
  const h = toks(head);
  for (let i = 0; i + h.length <= W.length; i++) {
    if (W[i][1] < after - 0.001) continue;
    if (h.every((x, j) => W[i + j][0] === x)) return W[i][1];
  }
  throw new Error(`cue not found: ${head}`);
};

// ---------- vertical layout ----------
const PV = 26; // pitch
const SV = 23; // cube size
const BASEV = 1290; // column baseline (above the 480 px bottom UI and the source line)
const X = {co: 110, cold: 380, other: 650, merged: 650};
const DEEP = '#2f63c4'; // deeper blue for the 107 (not brighter)
const col = (x: number, k: number) => ({x: x + (k % 7) * PV, y: BASEV - SV - Math.floor(k / 7) * PV});
// cube order in CUBES: co(19), falls(9), fire(10), roads(22), illness(25), cold(161)
type V = {tint: boolean; coDim?: number; hypo?: number; deep?: number; dimOthers?: number; merged?: boolean};
const vlayout = (v: V): Look[] => {
  let other = 0;
  return CUBES.map((c) => {
    if (c.cat === 'cold') {
      const p = col(X.cold, c.k);
      const frost = c.k >= 158;
      const y = frost ? p.y - 10 : p.y; // 3 frostbite cubes on top, a little apart
      const isDeep = !frost && c.k < 107 && (v.deep ?? 0) > 0 && Math.floor(c.k / 7) < (v.deep ?? 0) * 16;
      return {x: p.x, y, color: !v.tint ? C.cube : isDeep ? DEEP : C.cold, outline: (v.hypo ?? 0) > 0 && !frost && ((v.deep ?? 0) > 0 ? c.k < 107 : true) ? 'white' : null, op: 1};
    }
    if (c.cat === 'co' && !v.merged) {
      const p = col(X.co, c.k);
      return {x: p.x, y: p.y, color: v.tint ? C.grey : C.cube, op: 1 - 0.6 * (v.coDim ?? 0) - 0.5 * (v.dimOthers ?? 0)};
    }
    const p = col(v.merged ? X.merged : X.other, v.merged ? (c.cat === 'co' ? c.k : 19 + other++) : other++);
    return {x: p.x, y: p.y, color: v.merged ? C.grey : C.cube, op: 1 - 0.5 * (v.dimOthers ?? 0)};
  });
};
const Cubes: React.FC<{looks: Look[]; dx?: number; dy?: number; s?: number}> = ({looks, dx = 0, dy = 0, s = 1}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <g transform={`translate(${dx},${dy}) scale(${s})`}>
      {looks.map((l, i) => (
        <g key={i} opacity={l.op ?? 1}>
          <rect x={l.x} y={l.y} width={SV} height={SV} rx={3} fill={l.color} />
          <rect x={l.x} y={l.y} width={SV} height={4} rx={2} fill="#fff" opacity={0.2} />
          {l.outline === 'white' && <rect x={l.x - 1} y={l.y - 1} width={SV + 2} height={SV + 2} rx={4} fill="none" stroke="#fff" strokeWidth={1.6} />}
        </g>
      ))}
    </g>
  </svg>
);

// ---------- 2D (Shorts safe zone: y 160–1440, x 60–910 below y 700) ----------
const k = (t: number, at: number) => interpolate(t, [at, at + 0.3], [0, 1], clamp);
const Big: React.FC<{lines: string[]; top: number; size?: number; color?: string; o?: number}> = ({lines, top, size = 110, color = '#fff', o = 1}) => (
  <div style={{position: 'absolute', top, left: 60, right: 60, opacity: o, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.02, color, textAlign: 'center', letterSpacing: -1, textShadow: '0 6px 24px rgba(0,0,0,0.6)'}}>
    {lines.map((l) => (
      <div key={l}>{l}</div>
    ))}
  </div>
);
const Chip: React.FC<{text: string; x: number; y: number; size?: number; o?: number; color?: string; w?: number}> = ({text, x, y, size = 34, o = 1, color = '#fff', w}) => (
  <div style={{position: 'absolute', left: x, top: y, maxWidth: w ?? 850, opacity: o, background: 'rgba(8,11,22,0.92)', borderRadius: 12, padding: '6px 14px', fontFamily: FONT, fontWeight: 800, fontSize: size, color, lineHeight: 1.2}}>{text}</div>
);
const Src: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 60, top: 1336, maxWidth: 850, background: 'rgba(5,7,15,0.9)', color: '#dfe5f5', borderRadius: 8, padding: '4px 12px', fontFamily: FONT, fontWeight: 700, fontSize: 26}}>Source: {text}</div>
);
const DSHS = 'Texas DSHS, Feb. 2021 Winter Storm-Related Deaths (2021)';
const DSHS_P = 'Texas DSHS (2021), p. 2–3';
const DSHS_T3 = 'Texas DSHS (2021), Table 3';
const CDC = 'CDC — Safety Guidelines: During & After a Winter Storm';

// ---------- cue times ----------
const T = {
  but: q('But in the'),
  cold: q('the cold took'),
  who: q('So who were they'),
  state: q('The state confirmed'),
  s107: q('One hundred seven'),
  twoThree: q('more than two out of three'),
  storm: q('One storm'),
  only: q('confirmed deaths only'),
  love: q('If someone you love'),
  what: q('So what do you do'),
  cdc: q('The CDC says'),
  often: q('often'),
  sure: q('make sure'),
  call: q('Call them'),
  doctors: q("We're not doctors"),
  per: q('Per the'),
  ninety: q('below ninety five'),
  getHelp: q('Get medical help'),
  other: q('What took the other'),
  full: q('is in the full video'),
  linked: q('linked below'),
  longest: q("What's the longest"),
};
const END = timing.duration + 0.4;

// grid states keyed to cues
const STATES: [number, V][] = [
  [0, {tint: true}],
  [T.cold, {tint: true, coDim: 1}],
  [T.state, {tint: true, coDim: 1, hypo: 1}],
  [T.s107, {tint: true, coDim: 1, hypo: 1, deep: 1}],
  [T.love, {tint: true, coDim: 1, hypo: 1, deep: 1, dimOthers: 1}],
  [T.what, {tint: true, coDim: 1, hypo: 1, deep: 1, dimOthers: 1}],
  [T.other, {tint: true, merged: true}],
  [T.longest, {tint: false}],
];

export const Short010: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  let si = 0;
  while (si + 1 < STATES.length && STATES[si + 1][0] <= t) si++;
  const [t0, cur] = STATES[si];
  const prev = si > 0 ? STATES[si - 1][1] : cur;
  // the 107 go deep blue row by row, bottom up, over ~2 s
  const curV = si === 3 ? {...cur, deep: interpolate(t, [t0, t0 + 2.2], [0, 1], clamp)} : cur;
  const prevV = si === 4 ? {...prev, deep: 1} : prev;
  const looks = blend(vlayout(prevV), vlayout(curV), interpolate(t, [t0, t0 + 1.2], [si === 3 ? 1 : 0, 1], clamp));

  // camera: push in on COLD in beat 2, grid to the bottom third in beat 4, back to full for the bridge
  const push = interpolate(t, [T.state, T.state + 1.2, T.love, T.love + 1], [0, 1, 1, 0], clamp);
  const low = interpolate(t, [T.what, T.what + 1, T.other - 0.6, T.other + 0.4], [0, 1, 1, 0], clamp);
  // three camera states: full (1, 0, 0), push on COLD (1.3), bottom third (0.55) — all keep cubes above y 1440
  const sc = 1 + 0.3 * push - 0.45 * low;
  const dx = -40 * push + 281 * low;
  const dy = -410 * push + 580 * low;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Cubes looks={looks} s={sc} dx={dx} dy={dy} />

      {/* beat 1 — the turned-around warning; frame 0 complete */}
      {t < T.state && (
        <>
          <Big lines={["THE GENERATOR", "WASN'T #1"]} top={220} o={1 - k(t, T.who)} />
          <Big lines={['WHO?']} top={260} size={220} o={k(t, T.who)} color={C.amber} />
          <Chip text="TEXAS · FEB 2021" x={60} y={170} size={32} />
          <Chip text="CARBON MONOXIDE · ALL SOURCES · 19" x={60} y={880} size={28} w={300} />
          <Chip text="generators · grills · heaters · cars · blocked vents" x={60} y={990} size={22} w={300} />
          <Chip text="COLD · 161" x={380} y={630} size={40} color={C.cold} />
          {t >= T.cold && <Chip text="CARBON MONOXIDE IS STILL A REAL DANGER" x={60} y={760} size={26} o={k(t, T.cold)} w={300} />}
          <Src text={DSHS} />
        </>
      )}

      {/* beat 2 — the answer and the limits */}
      {t >= T.state && t < T.love && (
        <>
          <Chip text="HYPOTHERMIA · 158" x={60} y={200} size={44} color={C.cold} o={k(t, T.state)} />
          {t >= T.s107 && <Chip text="60 OR OLDER · 107 of 158" x={60} y={280} size={44} o={k(t, T.s107)} />}
          {t >= T.twoThree && (
            <div style={{position: 'absolute', left: 60, top: 370, width: 820, opacity: k(t, T.twoThree), background: 'rgba(8,11,22,0.92)', borderRadius: 18, padding: '16px 22px', boxSizing: 'border-box'}}>
              <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 60, color: '#fff'}}>MORE THAN 2 OUT OF 3</div>
              <div style={{height: 26, background: '#2f3c70', borderRadius: 13, marginTop: 12}}>
                <div style={{width: `${(107 / 158) * 100}%`, height: '100%', background: DEEP, borderRadius: 13}} />
              </div>
            </div>
          )}
          {t >= T.storm && <Chip text="ONE STORM" x={60} y={540} size={40} o={k(t, T.storm) * (1 - k(t, T.love - 0.4))} />}
          {t >= T.only && <Chip text="CONFIRMED DEATHS ONLY" x={320} y={540} size={40} o={k(t, T.only) * (1 - k(t, T.love - 0.4))} />}
          <Src text={DSHS_P} />
        </>
      )}

      {/* beat 3 — who this is about */}
      {t >= T.love && t < T.what && <Big lines={['SOMEONE YOU LOVE', 'OVER 60?']} top={260} size={96} o={k(t, T.love)} />}

      {/* beat 4 — the turn, the CDC rule, then our own advice (no agency name) */}
      {t >= T.what && t < T.doctors && (
        <>
          {t < T.cdc + 0.3 && <Big lines={['SO WHAT', 'DO YOU DO?']} top={300} size={120} o={k(t, T.what) * (1 - k(t, T.cdc))} />}
          {t >= T.cdc && t < T.call - 0.15 && (
            <>
              <div style={{position: 'absolute', left: 60, right: 60, top: 220, opacity: k(t, T.cdc), background: 'rgba(8,11,22,0.92)', borderRadius: 22, padding: '24px 30px', fontFamily: FONT, fontWeight: 800, fontSize: 48, color: '#fff', lineHeight: 1.25}}>
                “Check on older friends and neighbors often to make sure their homes are heated properly.” <span style={{color: C.amber}}>— CDC</span>
              </div>
              {t >= T.often && (
                <div style={{position: 'absolute', left: 60, top: 560, display: 'flex', gap: 14, opacity: k(t, T.often)}}>
                  {['CHECK', 'CHECK', 'CHECK'].map((c, i) => (
                    <div key={i} style={{opacity: k(t, T.often + i * 0.35), background: '#1d2546', border: '3px solid #59648c', borderRadius: 14, padding: '10px 22px', fontFamily: FONT, fontWeight: 900, fontSize: 40, color: '#4ee08a'}}>✓ {c}</div>
                  ))}
                </div>
              )}
              {t >= T.sure && <Thermostat t={t} at={T.sure} />}
              <Src text={CDC} />
            </>
          )}
          {t >= T.call - 0.15 && <CallPanel t={t} at={T.call - 0.15} />}
        </>
      )}

      {/* beat 5 — the CDC's line */}
      {t >= T.doctors && t < T.other && (
        <>
          <Chip text="NOT MEDICAL ADVICE" x={60} y={200} size={36} />
          {t >= T.per && <Thermometer t={t} at={T.per} />}
          {t >= T.ninety && (
            <div style={{position: 'absolute', left: 60, right: 170, top: 300, opacity: k(t, T.ninety), background: 'rgba(8,11,22,0.92)', borderRadius: 20, padding: '20px 26px', fontFamily: FONT, fontWeight: 900, fontSize: 54, color: C.amber, lineHeight: 1.15}}>
              BODY TEMP BELOW 95°F = EMERGENCY — CDC
              {t >= T.getHelp && <div style={{color: '#fff', marginTop: 10, opacity: k(t, T.getHelp)}}>GET MEDICAL HELP RIGHT AWAY</div>}
            </div>
          )}
          <Src text={CDC} />
        </>
      )}

      {/* beat 6 — the bridge to Long 002, then the question */}
      {t >= T.other && t < T.longest && (
        <>
          <Chip text="COLD 161 · OTHER 85" x={60} y={200} size={44} o={k(t, T.other + 0.6)} />
          {t < T.full && (
            <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
              {[0, 1, 2, 3, 4].map((i) => (
                <text key={i} x={690 + (i % 3) * 60} y={720 - Math.floor(i / 3) * 60} fontFamily="Inter" fontWeight={900} fontSize={40} fill={C.dim} opacity={1 - k(t, T.other + 0.4)}>?</text>
              ))}
            </svg>
          )}
          {t >= T.full && (
            <div style={{position: 'absolute', left: 60, right: 170, top: 280, opacity: k(t, T.full)}}>
              <Big lines={['WHAT TOOK', 'THE OTHER 85?', 'FULL VIDEO ↓']} top={0} size={88} />
              <MiniThumb />
            </div>
          )}
          {t >= T.linked && <Chevron t={t} at={T.linked} />}
          <Src text={DSHS_T3} />
        </>
      )}
      {t >= T.longest && (
        <>
          <Big lines={["LONGEST YOU'VE GONE", 'WITHOUT HEAT?']} top={300} size={84} o={k(t, T.longest)} />
          <div style={{position: 'absolute', left: 820, top: 170, fontSize: 90, opacity: k(t, T.longest + 2.9)}}>💬</div>
        </>
      )}
      {!(timing as any).estimated && <Audio src={staticFile('shorts2/s010.mp3')} />}
    </AbsoluteFill>
  );
};

// ---------- small flat pieces ----------
const Thermostat: React.FC<{t: number; at: number}> = ({t, at}) => {
  const a = interpolate(t, [at, at + 1.6], [-110, 40], clamp);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <g transform="translate(760,800)">
        <circle r={80} fill="#1d2546" stroke="#dfe5f5" strokeWidth={5} />
        <path d="M-60 40 A70 70 0 0 1 60 40" fill="none" stroke="#2f3c70" strokeWidth={14} />
        <path d="M20 -66 A70 70 0 0 1 60 40" fill="none" stroke="#ff8a3d" strokeWidth={14} />
        <line x1={0} y1={0} x2={60 * Math.cos(((a - 90) * Math.PI) / 180)} y2={60 * Math.sin(((a - 90) * Math.PI) / 180)} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
      </g>
      <text x={760} y={930} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={32} fill="#ffc35a">HEATED PROPERLY</text>
    </svg>
  );
};
const CallPanel: React.FC<{t: number; at: number}> = ({t, at}) => {
  const o = interpolate(t, [at, at + 0.3], [0, 1], clamp);
  const ring = ((t - at) * 0.8) % 1;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 220, opacity: o, background: '#1a2140', border: '4px solid #59648c', borderRadius: 26, padding: '30px 30px 34px', boxSizing: 'border-box'}}>
      <svg width={900} height={220}>
        <g transform="translate(450,110)">
          <rect x={-46} y={-90} width={92} height={180} rx={18} fill="#0e1426" stroke="#dfe5f5" strokeWidth={6} />
          {[0, 1].map((i) => {
            const u = (ring + i * 0.5) % 1;
            return <circle key={i} cx={0} cy={0} r={70 + u * 80} fill="none" stroke="#4ee08a" strokeWidth={5} opacity={1 - u} />;
          })}
        </g>
      </svg>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#fff', textAlign: 'center', lineHeight: 1.05}}>CALL BEFORE THE STORM HITS</div>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 36, color: '#ffc35a', textAlign: 'center', marginTop: 12}}>WHILE PHONES STILL WORK</div>
    </div>
  );
};
const Thermometer: React.FC<{t: number; at: number}> = ({t, at}) => {
  const lvl = interpolate(t, [at, at + 2.2], [0.75, 0.32], clamp);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <g transform="translate(300,760)">
        <rect x={-36} y={-260} width={72} height={420} rx={36} fill="#e8ebf2" />
        <circle cy={190} r={64} fill="#5aa9ff" />
        <rect x={-18} y={160 - 400 * lvl} width={36} height={400 * lvl + 30} fill="#5aa9ff" />
        <line x1={50} y1={-10} x2={150} y2={-10} stroke="#ffc35a" strokeWidth={7} />
        <text x={162} y={4} fontFamily="Inter" fontWeight={900} fontSize={40} fill="#ffc35a">95°F</text>
      </g>
    </svg>
  );
};
const MiniThumb: React.FC = () => (
  <svg width={300} height={170} style={{position: 'absolute', left: 260, top: 330}}>
    <rect width={300} height={170} rx={14} fill="#0e1426" stroke="#59648c" strokeWidth={4} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <g key={i}>
        <rect x={22 + i * 46} y={120 - [10, 12, 20, 24, 26, 90][i]} width={30} height={[10, 12, 20, 24, 26, 90][i]} fill={i === 5 ? '#5aa9ff' : '#9aa3b5'} />
        <text x={37 + i * 46} y={150} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={18} fill="#dfe5f5">?</text>
      </g>
    ))}
  </svg>
);
const Chevron: React.FC<{t: number; at: number}> = ({t, at}) => {
  const b = Math.sin((t - at) * 5) * 10;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: interpolate(t, [at, at + 0.3], [0, 1], clamp)}}>
      <path d={`M450 ${1380 + b} L540 ${1430 + b} L630 ${1380 + b}`} fill="none" stroke="#ffc35a" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
