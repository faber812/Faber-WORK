import React from 'react';
import {Composition} from 'remotion';
import {A_Blueprint} from './A_Blueprint';
import {B_PaperDiorama} from './B_PaperDiorama';
import {C_Miniature} from './C_Miniature';
import {D_DataNoir} from './D_DataNoir';
import {E_Isometric} from './E_Isometric';
import {F_Riso} from './F_Riso';

const C = {width: 1080, height: 1920, fps: 30, durationInFrames: 240};

export const StylesRoot: React.FC = () => (
  <>
    <Composition id="StyleA-Blueprint" component={A_Blueprint} {...C} />
    <Composition id="StyleB-Paper" component={B_PaperDiorama} {...C} />
    <Composition id="StyleC-Miniature" component={C_Miniature} {...C} />
    <Composition id="StyleD-DataNoir" component={D_DataNoir} {...C} />
    <Composition id="StyleE-Isometric" component={E_Isometric} {...C} />
    <Composition id="StyleF-Riso" component={F_Riso} {...C} />
  </>
);
