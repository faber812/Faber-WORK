import React from 'react';
import {Composition} from 'remotion';
import {GridEp1, gridEp1Schema} from './GridEp1';
import timing from './timing.json';
import {GridEp2} from './GridEp2';
import {Test3D} from './Test3D';
import {GridEp1_3D} from './GridEp1_3D';
import {GridEp2_3D} from './GridEp2_3D';
import timing2v from './timing2_vasko.json';
import timing1v from './timing1_vasko.json';
import timing2 from './timing2.json';

const FPS = 30;

export const Root: React.FC = () => {
  return (
    <>
    <Composition
      id="GridEp2-3D"
      component={GridEp2_3D}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={Math.ceil((timing2v.duration + 0.6) * FPS)}
      defaultProps={{segments: timing2v.segments, captions: timing2v.captions, audio: timing2v.audio} as gridEp1Schema}
    />
    <Composition
      id="GridEp1-3D"
      component={GridEp1_3D}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={Math.ceil((timing1v.duration + 0.6) * FPS)}
      defaultProps={{segments: timing1v.segments, captions: timing1v.captions, audio: timing1v.audio} as gridEp1Schema}
    />
    <Composition id="Test3D" component={Test3D} width={1080} height={1920} fps={FPS} durationInFrames={150} />
    <Composition
      id="GridEp2"
      component={GridEp2}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={Math.ceil((timing2.duration + 0.6) * FPS)}
      defaultProps={{segments: timing2.segments, captions: timing2.captions, audio: timing2.audio} as gridEp1Schema}
    />
    <Composition
      id="GridEp1"
      component={GridEp1}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={Math.ceil((timing.duration + 0.6) * FPS)}
      defaultProps={{segments: timing.segments, captions: timing.captions, audio: timing.audio} as gridEp1Schema}
    />
    </>
  );
};
