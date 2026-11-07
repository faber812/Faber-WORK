// STYLE E — "Isometric systems map": a clean 2.5D model town where you can SEE the systems:
// power lines pulse yellow, water flows blue from pump → tower → houses. Then the power cuts.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {F} from './fonts';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CUT = 120;
const S = 62; // tile size
const CX = 540;
const CY = 990;
export const iso = (x: number, y: number, z = 0): [number, number] => [CX + (x - y) * S * 0.866, CY + (x + y) * S * 0.5 - z * S];
export const P = (pts: [number, number, number?][]) => pts.map(([x, y, z], i) => `${i ? 'L' : 'M'}${iso(x, y, z ?? 0).join(' ')}`).join(' ') + ' Z';
export const L = (pts: [number, number, number?][]) => pts.map(([x, y, z], i) => `${i ? 'L' : 'M'}${iso(x, y, z ?? 0).join(' ')}`).join(' ');

// shaded box: top / left / right faces
export const IBox: React.FC<{x: number; y: number; w: number; d: number; h: number; c: [string, string, string]; z?: number}> = ({x, y, w, d, h, c, z = 0}) => (
  <g>
    <path d={P([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={c[1]} />
    <path d={P([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]])} fill={c[2]} />
    <path d={P([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])} fill={c[0]} />
  </g>
);

export const House: React.FC<{x: number; y: number; lit: number; roof: string}> = ({x, y, lit, roof}) => (
  <g>
    <IBox x={x} y={y} w={1.6} d={1.4} h={1.1} c={['#f7e3c4', '#efd2a8', '#d9b88c']} />
    {/* gable roof */}
    <path d={P([[x, y + 1.4, 1.1], [x + 1.6, y + 1.4, 1.1], [x + 1.6, y + 0.7, 1.8], [x, y + 0.7, 1.8]])} fill={roof} />
    <path d={P([[x + 1.6, y, 1.1], [x + 1.6, y + 1.4, 1.1], [x + 1.6, y + 0.7, 1.8]])} fill="#c9a37a" />
    <path d={P([[x, y, 1.1], [x + 1.6, y, 1.1], [x + 1.6, y + 0.7, 1.8], [x, y + 0.7, 1.8]])} fill={roof} opacity={0.75} />
    {/* windows on the front-left face */}
    {[0.3, 1.0].map((wx) => (
      <path key={wx} d={P([[x + wx, y + 1.4, 0.45], [x + wx + 0.35, y + 1.4, 0.45], [x + wx + 0.35, y + 1.4, 0.8], [x + wx, y + 1.4, 0.8]])} fill={lit ? '#ffcf4d' : '#3b4252'} style={{filter: lit ? 'drop-shadow(0 0 10px #ffcf4d)' : 'none'}} />
    ))}
  </g>
);

export const Callout: React.FC<{at: [number, number]; to: [number, number]; title: string; sub: string; t: number; color?: string}> = ({at, to, title, sub, t, color = '#1f2937'}) => (
  <g opacity={t}>
    <circle cx={at[0]} cy={at[1]} r={7} fill={color} />
    <path d={`M${at[0]} ${at[1]} L${to[0] < 540 ? to[0] + 330 : to[0] - 300} ${to[1]} L${to[0]} ${to[1]}`} stroke={color} strokeWidth={2.5} fill="none" />
    <text x={to[0]} y={to[1] - 14} textAnchor={to[0] < 540 ? 'start' : 'end'} fontFamily={F.grotesk} fontWeight={700} fontSize={32} fill={color}>
      {title}
    </text>
    <text x={to[0]} y={to[1] + 26} textAnchor={to[0] < 540 ? 'start' : 'end'} fontFamily={F.grotesk} fontWeight={500} fontSize={25} fill={color} opacity={0.75}>
      {sub}
    </text>
  </g>
);

export const E_Isometric: React.FC = () => {
  const frame = useCurrentFrame();
  const powered = frame < CUT;
  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const rise = (a: number) => interpolate(frame, [a, a + 18], [0, 1], {...cl, easing: ease});
  const flowSpeed = powered ? 1 : interpolate(frame, [CUT, CUT + 90], [1, 0.25], cl);
  // integrate flow so the dashes slow down smoothly
  const flowPhase = frame < CUT ? frame * 3 : CUT * 3 + (frame - CUT) * 3 * ((1 + flowSpeed) / 2);
  const level = interpolate(frame, [CUT, 240], [0.92, 0.45], cl);
  const fan = powered ? frame * 0.5 : CUT * 0.5 + 20 * (1 - Math.exp(-(frame - CUT) / 15));
  const wire = powered ? '#f2b705' : '#9aa1ad';
  const zoom = interpolate(frame, [0, 240], [1, 1.06]);

  // routes
  const water = L([[-4.2, 2.2, 0.05], [-1.5, 2.2, 0.05], [-1.5, -1.5, 0.05], [1.2, -1.5, 0.05], [1.2, 2.6, 0.05], [3.6, 2.6, 0.05]]);
  const power = L([[-4.5, -3.6, 1.6], [-1.6, -3.6, 1.6], [1.4, -3.6, 1.6], [4.2, -3.6, 1.6], [4.2, 0, 1.6]]);

  return (
    <AbsoluteFill style={{background: 'linear-gradient(#f3efe6, #e7e1d4)'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', scale: String(zoom), transformOrigin: '540px 1000px'}}>
        {/* ground slab */}
        <g transform={`translate(0 ${interpolate(rise(0), [0, 1], [80, 0])})`} opacity={rise(0)}>
          <IBox x={-5.2} y={-4.6} w={10.4} d={9.2} h={0.35} z={-0.35} c={['#a9cf9b', '#7ea873', '#6a9161']} />
          <path d={P([[-5.2, 1.6], [5.2, 1.6], [5.2, 2.8], [-5.2, 2.8]])} fill="#8a8f99" />
          <path d={P([[0.2, -4.6], [1.4, -4.6], [1.4, 4.6], [0.2, 4.6]])} fill="#8a8f99" />
          {new Array(9).fill(0).map((_, i) => (
            <path key={i} d={P([[-4.8 + i * 1.15, 2.15], [-4.3 + i * 1.15, 2.15], [-4.3 + i * 1.15, 2.25], [-4.8 + i * 1.15, 2.25]])} fill="#f5f1e8" />
          ))}
        </g>
        {/* water pipes (under) */}
        <path d={water} stroke="#bcd7f2" strokeWidth={16} fill="none" strokeLinejoin="round" opacity={rise(20)} />
        <path d={water} stroke="#2f80ed" strokeWidth={7} fill="none" strokeDasharray="18 16" strokeDashoffset={-flowPhase} strokeLinejoin="round" opacity={rise(20)} />

        {/* pump station */}
        <g opacity={rise(14)} transform={`translate(0 ${interpolate(rise(14), [0, 1], [-60, 0])})`}>
          <IBox x={-4.9} y={1.6} w={1.4} d={1.2} h={1.0} c={['#dfe5ee', '#b9c4d4', '#9eabbd']} />
          <g transform={`translate(${iso(-4.2, 2.2, 1.02).join(' ')}) scale(1 0.55)`}>
            <circle r={26} fill="#6b7a90" />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={-4} y={-24} width={8} height={24} rx={4} fill="#eef2f7" transform={`rotate(${fan * 360 / 10 + k * 120})`} />
            ))}
          </g>
        </g>
        {/* water tower */}
        <g opacity={rise(26)} transform={`translate(0 ${interpolate(rise(26), [0, 1], [-80, 0])})`}>
          {[
            [-1.9, -1.9],
            [-1.1, -1.9],
            [-1.9, -1.1],
            [-1.1, -1.1],
          ].map(([x, y], i) => (
            <path key={i} d={L([[x, y, 0], [x, y, 3.0]])} stroke="#7b8494" strokeWidth={6} />
          ))}
          {(() => {
            const [cx, cy] = iso(-1.5, -1.5, 3.0);
            const [, ty] = iso(-1.5, -1.5, 4.6);
            const rx = 80;
            const ry = 40;
            const h = cy - ty;
            const lv = cy - h * level;
            return (
              <g>
                <path d={`M${cx - rx} ${cy} L${cx - rx} ${ty} A ${rx} ${ry} 0 0 0 ${cx + rx} ${ty} L ${cx + rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx - rx} ${cy} Z`} fill="#dbe8f5" />
                <clipPath id="tank">
                  <path d={`M${cx - rx} ${cy} L${cx - rx} ${ty} A ${rx} ${ry} 0 0 0 ${cx + rx} ${ty} L ${cx + rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx - rx} ${cy} Z`} />
                </clipPath>
                <rect x={cx - rx} y={lv} width={rx * 2} height={cy + ry - lv} fill="#2f80ed" opacity={0.85} clipPath="url(#tank)" />
                <ellipse cx={cx} cy={lv} rx={rx} ry={ry} fill="#5a9cf2" opacity={0.9} />
                <path d={`M${cx - rx} ${cy} L${cx - rx} ${ty} M${cx + rx} ${cy} L${cx + rx} ${ty}`} stroke="#5d6b80" strokeWidth={4} />
                <ellipse cx={cx} cy={ty} rx={rx} ry={ry} fill="none" stroke="#5d6b80" strokeWidth={4} />
                <path d={`M${cx - rx - 10} ${ty} L${cx} ${ty - 60} L${cx + rx + 10} ${ty} Z`} fill="#c75b39" />
              </g>
            );
          })()}
        </g>
        {/* power poles + line */}
        {[-4.5, -1.6, 1.4, 4.2].map((x, i) => (
          <path key={i} d={L([[x, -3.6, 0], [x, -3.6, 1.7]])} stroke="#6b4a32" strokeWidth={6} opacity={rise(34 + i * 4)} />
        ))}
        <path d={L([[4.2, 0, 0], [4.2, 0, 1.7]])} stroke="#6b4a32" strokeWidth={6} opacity={rise(48)} />
        <path d={power} stroke={wire} strokeWidth={4} fill="none" opacity={rise(40)} />
        {powered &&
          new Array(8).fill(0).map((_, i) => {
            const t = ((frame * 0.012 + i / 8) % 1);
            const seg = [[-4.5, -3.6], [4.2, -3.6], [4.2, 0]] as const;
            const total = 8.7 + 3.6;
            const d = t * total;
            const [x, y] = d < 8.7 ? [seg[0][0] + d, -3.6] : [4.2, -3.6 + (d - 8.7)];
            const [sx, sy] = iso(x, y, 1.6);
            return <circle key={i} cx={sx} cy={sy} r={8} fill="#ffd84d" style={{filter: 'drop-shadow(0 0 8px #ffd84d)'}} opacity={rise(50)} />;
          })}
        {/* houses */}
        {[
          [2.0, -2.4, '#c75b39'],
          [2.2, 3.1, '#3e6b8a'],
          [-3.8, 3.2, '#7d9a5a'],
          [-3.6, -1.6, '#a63d33'],
        ].map(([x, y, r], i) => (
          <g key={i} opacity={rise(44 + i * 5)} transform={`translate(0 ${interpolate(rise(44 + i * 5), [0, 1], [-50, 0])})`}>
            <House x={x as number} y={y as number} lit={frame < CUT + 6 + i * 6 ? 1 : 0} roof={r as string} />
          </g>
        ))}
        {/* power cut marker */}
        {!powered && (
          <g transform={`translate(${iso(-1.6, -3.6, 2.2).join(' ')})`}>
            <circle r={interpolate(frame, [CUT, CUT + 10], [0, 46], {...cl, easing: Easing.out(Easing.back(2))})} fill="#e5484d" />
            <path d="M-16 -16 L16 16 M16 -16 L-16 16" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={interpolate(frame, [CUT + 4, CUT + 10], [0, 1], cl)} />
          </g>
        )}
        {/* callouts */}
        <Callout at={iso(-4.2, 2.2, 1.0)} to={[80, 1450]} title="PUMP STATION" sub={powered ? 'runs on grid power' : 'stopped — no power'} t={rise(70)} color={powered ? '#1f2937' : '#c0392b'} />
        <Callout at={iso(-1.5, -1.5, 4.0)} to={[80, 520]} title="WATER TOWER" sub="gravity keeps taps running" t={rise(80)} />
        <Callout at={iso(4.2, -1.8, 1.6)} to={[1000, 640]} title={powered ? 'POWER IN' : 'POWER CUT'} sub={powered ? 'feeds the pumps' : 'pumps can’t refill'} t={rise(90)} color={powered ? '#b07d00' : '#c0392b'} />
      </svg>
      {/* header */}
      <div style={{position: 'absolute', top: 120, left: 80, right: 80}}>
        <div style={{fontFamily: F.grotesk, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: '#2f80ed'}}>HOW YOUR WATER WORKS</div>
        <div style={{fontFamily: F.archivo, fontSize: 74, lineHeight: 1.0, color: '#1f2937', marginTop: 12}}>
          {powered ? 'Why your tap still runs in a blackout' : 'Until the tower runs dry.'}
        </div>
      </div>
      {/* tank gauge */}
      <div style={{position: 'absolute', bottom: 150, left: 80, right: 80, fontFamily: F.grotesk, color: '#1f2937', opacity: rise(60)}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 32}}>
          <span>TOWER LEVEL</span>
          <span style={{color: level < 0.6 ? '#c0392b' : '#2f80ed', fontVariantNumeric: 'tabular-nums'}}>{Math.round(level * 100)}%</span>
        </div>
        <div style={{height: 26, marginTop: 12, borderRadius: 13, background: '#d6dbe3', overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${level * 100}%`, background: level < 0.6 ? '#e5484d' : '#2f80ed', borderRadius: 13}} />
        </div>
        <div style={{fontSize: 24, marginTop: 10, opacity: 0.7}}>Many towers hold about a day of water.</div>
      </div>
    </AbsoluteFill>
  );
};
