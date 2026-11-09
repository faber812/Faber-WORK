// Shorts cover (1080×1920) for "The Grid Goes Down": big hour on top, strongest frame in the middle, hook at the bottom.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {F} from './styles/fonts';

export type CoverProps = {bg: string; ep: number; hour: string; hook: string; accent: string; hot: string};

export const Cover: React.FC<CoverProps> = ({bg, ep, hour, hook, accent, hot}) => {
  const words = hook.split(' ');
  return (
    <AbsoluteFill style={{background: '#0b1020'}}>
      {/* scene, slightly zoomed so the burned-in clock/captions sit under the solid bands */}
      <Img src={staticFile(bg)} style={{position: 'absolute', width: 1080, height: 1920, objectFit: 'cover', scale: '1.12', filter: 'saturate(1.2) contrast(1.08) brightness(1.08)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(#0b1020 0%, #0b1020 28%, rgba(11,16,32,0) 37%, rgba(11,16,32,0) 64%, #0b1020 76%, #0b1020 100%)'}} />
      {/* top: episode tag + hour */}
      <div style={{position: 'absolute', top: 110, width: '100%', textAlign: 'center'}}>
        <div style={{fontFamily: F.mono, fontWeight: 600, fontSize: 32, letterSpacing: 8, color: accent}}>THE GRID GOES DOWN · EP. {ep}</div>
        <div style={{fontFamily: F.bebas, fontSize: 250, lineHeight: 0.9, letterSpacing: 6, color: '#f6efe2', marginTop: 10, textShadow: `0 0 60px ${accent}55`}}>
          HOUR <span style={{color: accent}}>{hour}</span>
        </div>
      </div>
      {/* bottom: hook */}
      <div style={{position: 'absolute', top: 1440, left: 60, right: 60, textAlign: 'center', fontFamily: F.archivo, fontSize: 104, lineHeight: 1.0, color: '#f6efe2', textShadow: '0 8px 30px rgba(0,0,0,0.7)'}}>
        {words.map((w, i) => (
          <span key={i} style={{color: w.replace(/[^A-Z]/g, '') === hot ? accent : '#f6efe2'}}>
            {w}{' '}
          </span>
        ))}
      </div>
      <div style={{position: 'absolute', top: 1720, width: '100%', textAlign: 'center', fontFamily: F.grotesk, fontWeight: 700, fontSize: 34, letterSpacing: 6, color: '#8e9bc4'}}>
        LIGHTS OUT <span style={{color: '#ffb238'}}>LAB</span>
      </div>
    </AbsoluteFill>
  );
};

export const COVERS: CoverProps[] = [
  {bg: 'covers/bg1.png', ep: 1, hour: '1', hook: 'WHAT STOPS FIRST?', hot: 'FIRST', accent: '#ffb238'},
  {bg: 'covers/bg2.png', ep: 2, hour: '6', hook: 'YOUR FRIDGE JUST FAILED', hot: 'FAILED', accent: '#ff5a4e'},
  {bg: 'covers/bg3.png', ep: 3, hour: '12', hook: 'WHY YOUR PHONE DIES', hot: 'DIES', accent: '#4ee08a'},
  {bg: 'covers/bg4.png', ep: 4, hour: '24', hook: 'NO PRESSURE. NO WATER.', hot: 'WATER', accent: '#7cc4ff'},
  {bg: 'covers/bg5.png', ep: 5, hour: '48', hook: 'THE MISTAKE THAT KILLS', hot: 'KILLS', accent: '#ff5a4e'},
];
