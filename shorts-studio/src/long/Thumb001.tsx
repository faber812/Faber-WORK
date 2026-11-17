// Thumbnail A for Long 001: "DON'T EAT THIS" — open fridge lit by a phone flashlight, hero with a milk carton.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Box, Lineman, Volt} from '../three/kit';
import {FONT, Fridge, Room, UI} from './props';

export const Thumb001: React.FC = () => (
  <AbsoluteFill style={{background: '#0b1020'}}>
    <Room cam={[0.2, 2.1, 7.6]} tgt={[0.35, 1.55, -0.4]} lit={0}>
      <Fridge p={[-0.9, 0, -1.4]} open={1} rotY={0.25} />
      {/* phone flashlight beam on the shelves */}
      <spotLight position={[1.2, 2.3, 1.2]} target-position={[-1.0, 1.6, -1.4]} angle={0.5} penumbra={0.5} intensity={60} distance={8} color="#fff6e0" />
      <pointLight position={[-0.9, 1.7, -0.6]} color="#fff6e0" intensity={4} distance={3} />
      <Lineman frame={12} pos={[1.75, 0, 0.2]} rotY={-0.3} pose={{armRx: -1.2, armR: 0.25, armL: 0.5, lookX: 0.05, lookY: 0.15, mouth: 'o', brows: 'worried', hold: 'flashlight'}} />
      {/* milk carton in the left hand */}
      <group position={[0.95, 2.05, 0.75]} rotation={[0.1, -0.3, 0.2]}>
        <Box s={[0.34, 0.55, 0.34]} c="#f4f4f0" />
        <Box p={[0, 0.34, 0]} r={[0, 0, Math.PI / 4]} s={[0.24, 0.24, 0.34]} c="#f4f4f0" />
        <Box p={[0, 0.02, 0.175]} s={[0.26, 0.2, 0.01]} c="#3a7bd5" />
      </group>
      <Volt frame={12} pos={[3.2, 3.2, -0.3]} glow={0} mood="shock" />
    </Room>
    <div style={{position: 'absolute', top: 50, left: 50, background: '#d81e1e', padding: '10px 34px', borderRadius: 14, fontFamily: FONT, fontWeight: 900, fontSize: 118, lineHeight: 1.02, color: '#fff', textShadow: '0 4px 0 rgba(0,0,0,0.25)'}}>
      DON'T
      <br />
      EAT THIS
    </div>
    <div style={{position: 'absolute', left: 60, top: 560, background: UI.panel, border: `6px solid ${UI.red}`, borderRadius: 22, padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: 92, color: UI.red, fontVariantNumeric: 'tabular-nums'}}>
      4:00
    </div>
  </AbsoluteFill>
);
