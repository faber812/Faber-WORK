import React from 'react';
import {Composition} from 'remotion';
import {GridEp1, gridEp1Schema} from './GridEp1';
import timing from './timing.json';
import {GridEp2} from './GridEp2';
import {Test3D} from './Test3D';
import {StylesRoot} from './styles/StylesRoot';
import {GridEp4_3D, GridEp5_3D} from './GridEp45_3D';
import timing4v from './timing4_vasko.json';
import timing5v from './timing5_vasko.json';
import {Avatar, Banner} from './Branding';
import {GridEp3, Ep3Props} from './GridEp3';
import {GridEp3_3D} from './GridEp3_3D';
import timing3v from './timing3_vasko.json';
import {GridEp1_3D} from './GridEp1_3D';
import {GridEp2_3D} from './GridEp2_3D';
import timing2v from './timing2_vasko.json';
import timing1v from './timing1_vasko.json';
import timing2 from './timing2.json';

const FPS = 30;

export const Root: React.FC = () => {
  return (
    <>
    <StylesRoot />
    <Composition
      id="GridEp4-3D"
      component={GridEp4_3D}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={Math.ceil((timing4v.duration + 0.6) * FPS)}
      defaultProps={{segments: timing4v.segments, captions: timing4v.captions, audio: timing4v.audio} as gridEp1Schema}
    />
    <Composition
      id="GridEp5-3D"
      component={GridEp5_3D}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={Math.ceil((timing5v.duration + 0.6) * FPS)}
      defaultProps={{segments: timing5v.segments, captions: timing5v.captions, audio: timing5v.audio} as gridEp1Schema}
    />
    <Composition id="Avatar" component={Avatar} width={800} height={800} fps={30} durationInFrames={1} />
    <Composition id="Banner" component={Banner} width={2560} height={1440} fps={30} durationInFrames={1} />
    <Composition
      id="GridEp3-3D"
      component={GridEp3_3D}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={Math.ceil((timing3v.duration + 0.6) * FPS)}
      defaultProps={{segments: timing3v.segments, captions: timing3v.captions, audio: timing3v.audio} as gridEp1Schema}
    />
    <Composition
      id="GridEp3"
      component={GridEp3}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={Math.ceil((timing3v.duration + 0.6) * FPS)}
      defaultProps={{segments: timing3v.segments, captions: timing3v.captions, audio: timing3v.audio} as Ep3Props}
    />
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
