// Long-form 16:9 video: "What Actually Happens in the First 72 Hours of a US Blackout (Hour by Hour)".
// Draft assembly of the existing hour blocks. New explainer blocks are added between the hours.
import React from 'react';
import {AbsoluteFill, Series} from 'remotion';
import {gridEp1Schema} from './GridEp1';
import {GridEp1_3D} from './GridEp1_3D';
import {GridEp2_3D} from './GridEp2_3D';
import {GridEp3_3D} from './GridEp3_3D';
import {GridEp4_3D, GridEp5_3D} from './GridEp45_3D';
import {GridEp6_3D} from './GridEp6_3D';
import t1 from './timing1_vasko.json';
import t2 from './timing2_vasko.json';
import t3 from './timing3_vasko.json';
import t4 from './timing4_vasko.json';
import t5 from './timing5_vasko.json';
import t6 from './timing6_vasko.json';

export const LONG_FPS = 30;
type T = {duration: number; audio: string; segments: {start: number; end: number; text: string}[]; captions: {start: number; end: number; text: string}[]};

// each hour block plays until its Shorts outro ("Follow for part N") would start
const HOURS: {C: React.FC<gridEp1Schema>; t: T}[] = [
  {C: GridEp1_3D, t: t1},
  {C: GridEp2_3D, t: t2},
  {C: GridEp3_3D, t: t3},
  {C: GridEp4_3D, t: t4},
  {C: GridEp5_3D, t: t5},
  {C: GridEp6_3D, t: t6},
];
const cut = (t: T) => Math.round(t.segments[t.segments.length - 1].start * LONG_FPS);
export const LONG_FRAMES = HOURS.reduce((a, h) => a + cut(h.t), 0);

// 1080×1920 episode box scaled to the landscape frame height and centred
const Portrait: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', left: (1920 - 1080) / 2, top: (1080 - 1920) / 2, width: 1080, height: 1920, transform: `scale(${1080 / 1920})`, transformOrigin: 'center'}}>
    {children}
  </div>
);

export const LongDraft: React.FC = () => (
  <AbsoluteFill style={{background: '#0b1020', overflow: 'hidden'}}>
    <Series>
      {HOURS.map(({C, t}, i) => (
        <Series.Sequence key={i} durationInFrames={cut(t)}>
          <Portrait>
            <C segments={t.segments} captions={t.captions} audio={t.audio} />
          </Portrait>
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
