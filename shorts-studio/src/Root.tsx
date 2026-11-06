import React from 'react';
import {Composition} from 'remotion';
import {GridEp1, gridEp1Schema} from './GridEp1';
import timing from './timing.json';

const FPS = 30;

export const Root: React.FC = () => {
  return (
    <Composition
      id="GridEp1"
      component={GridEp1}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={Math.ceil((timing.duration + 0.6) * FPS)}
      defaultProps={{segments: timing.segments, captions: timing.captions, audio: timing.audio} as gridEp1Schema}
    />
  );
};
