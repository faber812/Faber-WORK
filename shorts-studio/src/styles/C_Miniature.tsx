// STYLE C — "Tilt-shift miniature": the city as a tabletop model on a wooden plinth,
// shot like macro photography (narrow focus band, saturated dusk light). Blackout ripples across it.
import React, {useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {F} from './fonts';

const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const OUT_START = 120;
let OUT = OUT_START;
const offAt = (x: number, z: number) => OUT + (x + z + 14) * 3.2; // diagonal wave

const winTex = (seed: number, lit: string) => {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, 64, 128);
  for (let y = 6; y < 128; y += 14)
    for (let x = 6; x < 64; x += 14)
      if (random(`mt${seed}${x}${y}`) > 0.3) {
        g.fillStyle = lit;
        g.fillRect(x, y, 8, 9);
      }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  return t;
};

export const Rig: React.FC<{frame: number}> = ({frame}) => {
  const {camera} = useThree();
  const a = interpolate(frame, [0, 240], [-0.55, 0.25]);
  const r = interpolate(frame, [0, 240], [24, 20], {easing: Easing.inOut(Easing.cubic)});
  camera.position.set(Math.sin(a) * r, 15, Math.cos(a) * r);
  camera.lookAt(0, 0.6, 0);
  return null;
};

const B: React.FC<{p: [number, number, number]; s: [number, number, number]; c: string; e?: string; ei?: number; map?: THREE.Texture}> = ({p, s, c, e, ei = 0, map}) => (
  <mesh position={p} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} emissive={e ?? '#000'} emissiveIntensity={ei} emissiveMap={map ?? null} roughness={0.75} />
  </mesh>
);

export const City: React.FC<{frame: number; outStart?: number; towers?: number}> = ({frame, outStart = OUT_START, towers = -1}) => {
  OUT = outStart;
  const texes = useMemo(() => new Array(6).fill(0).map((_, i) => winTex(i, '#ffd38a')), []);
  const blocks = useMemo(() => {
    const out: {x: number; z: number; w: number; d: number; h: number; c: string; t: number}[] = [];
    const pal = ['#e9b8a2', '#a9c8dc', '#f1dba2', '#b9d3b2', '#d8c3e6', '#f3efe6', '#e7a07a'];
    for (let gx = -2; gx <= 2; gx++)
      for (let gz = -2; gz <= 2; gz++) {
        if (gx === 0 || gz === 0) continue; // roads
        for (let k = 0; k < 2; k++) {
          const i = `${gx}${gz}${k}`;
          out.push({
            x: gx * 2.4 + (k ? 0.55 : -0.55),
            z: gz * 2.4 + (random(`oz${i}`) - 0.5) * 0.6,
            w: 0.9,
            d: 1.6,
            h: 0.6 + random(`h${i}`) * (Math.abs(gx) + Math.abs(gz) < 4 ? 3.2 : 1.4),
            c: pal[Math.floor(random(`c${i}`) * pal.length)],
            t: Math.floor(random(`t${i}`) * 6),
          });
        }
      }
    return out;
  }, []);
  const cars = [
    {lane: 0.35, axis: 'x', speed: 0.09, off: 0, c: '#e63946'},
    {lane: -0.35, axis: 'x', speed: -0.07, off: 3, c: '#f1c40f'},
    {lane: 0.35, axis: 'z', speed: 0.08, off: 5, c: '#2a9d8f'},
    {lane: -0.35, axis: 'z', speed: -0.1, off: 1, c: '#f4f1de'},
    {lane: 0.35, axis: 'x', speed: 0.09, off: 6, c: '#3a86ff'},
  ];
  return (
    <group>
      {/* plinth */}
      <mesh position={[0, -0.45, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[8.2, 8.4, 0.9, 64]} />
        <meshStandardMaterial color="#7a4e31" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <cylinderGeometry args={[8, 8, 0.02, 64]} />
        <meshStandardMaterial color="#7fa36b" />
      </mesh>
      {/* roads */}
      <B p={[0, 0.03, 0]} s={[16, 0.02, 1.4]} c="#3b3f4a" />
      <B p={[0, 0.031, 0]} s={[1.4, 0.02, 16]} c="#3b3f4a" />
      {new Array(14).fill(0).map((_, i) => (
        <group key={i}>
          <B p={[-7 + i, 0.045, 0]} s={[0.4, 0.01, 0.06]} c="#f4f1de" />
          <B p={[0, 0.046, -7 + i]} s={[0.06, 0.01, 0.4]} c="#f4f1de" />
        </group>
      ))}
      {blocks.map((b, i) => {
        const lit = frame < offAt(b.x, b.z) ? 1 : 0;
        return (
          <group key={i}>
            <B p={[b.x, b.h / 2, b.z]} s={[b.w, b.h, b.d]} c={b.c} e="#ffffff" ei={1.3 * lit} map={texes[b.t]} />
            <B p={[b.x, b.h + 0.04, b.z]} s={[b.w + 0.06, 0.08, b.d + 0.06]} c="#5b5f6a" />
          </group>
        );
      })}
      {/* trees */}
      {new Array(18).fill(0).map((_, i) => {
        const ang = random(`ta${i}`) * Math.PI * 2;
        const rad = 6.4 + random(`tr${i}`) * 1.2;
        return (
          <group key={i} position={[Math.cos(ang) * rad, 0, Math.sin(ang) * rad]}>
            <B p={[0, 0.2, 0]} s={[0.1, 0.4, 0.1]} c="#5b3a22" />
            <mesh position={[0, 0.65, 0]} castShadow>
              <coneGeometry args={[0.35, 0.8, 8]} />
              <meshStandardMaterial color={['#2f6b4f', '#3f7d4e', '#285c46'][i % 3]} />
            </mesh>
          </group>
        );
      })}
      {/* street lights along roads */}
      {[-5.5, -2.8, 2.8, 5.5].flatMap((t, i) =>
        [
          [t, 0.9],
          [0.9, t],
        ].map(([x, z], k) => {
          const on = frame < offAt(x, z) ? 1 : 0;
          return (
            <group key={`${i}${k}`} position={[x, 0, z]}>
              <B p={[0, 0.35, 0]} s={[0.05, 0.7, 0.05]} c="#2b2d33" />
              <mesh position={[0, 0.74, 0]}>
                <sphereGeometry args={[0.09, 12, 12]} />
                <meshStandardMaterial color="#fff1c1" emissive="#ffcf6b" emissiveIntensity={3 * on} />
              </mesh>
              {on > 0 && i % 2 === 0 && <pointLight position={[0, 0.7, 0]} color="#ffbf5e" intensity={2.2} distance={2.6} />}
            </group>
          );
        }),
      )}
      {towers >= 0 &&
        [[-6, -3], [5.5, -5], [3.2, 5.6], [-3, 6.2], [6.6, 2]].map(([x, z], i) => {
          const alive = frame < towers + i * 18;
          const blink = alive && Math.floor((frame + i * 7) / 12) % 2 === 0;
          return (
            <group key={`ct${i}`} position={[x, 0, z]}>
              <B p={[0, 1.6, 0]} s={[0.12, 3.2, 0.12]} c="#c9ccd6" />
              <B p={[0, 2.9, 0.1]} s={[0.36, 0.5, 0.06]} c="#e6e8ee" />
              <mesh position={[0, 3.3, 0]}>
                <sphereGeometry args={[0.13, 12, 12]} />
                <meshStandardMaterial color={alive ? '#ff4d4d' : '#3a2224'} emissive="#ff3030" emissiveIntensity={blink ? 4 : alive ? 0.6 : 0} />
              </mesh>
              {blink && <pointLight position={[0, 3.4, 0]} color="#ff3b3b" intensity={3} distance={3} />}
            </group>
          );
        })}
      {/* water tower */}
      <group position={[-5.6, 0, 4.8]}>
        {[[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].map(([a, b], i) => (
          <B key={i} p={[a, 0.9, b]} s={[0.07, 1.8, 0.07]} c="#c9ccd6" />
        ))}
        <mesh position={[0, 2.2, 0]} castShadow>
          <cylinderGeometry args={[0.75, 0.75, 0.9, 24]} />
          <meshStandardMaterial color="#9cc3dc" />
        </mesh>
        <mesh position={[0, 2.85, 0]} castShadow>
          <coneGeometry args={[0.82, 0.45, 24]} />
          <meshStandardMaterial color="#7b8a9a" />
        </mesh>
      </group>
      {/* cars: stop when the wave reaches them */}
      {cars.map((c, i) => {
        const stopF = OUT_START + 40;
        const tf = Math.min(frame, stopF + (frame - stopF) * 0);
        const pos = (((tf * c.speed + c.off) % 16) + 16) % 16 - 8;
        const x = c.axis === 'x' ? pos : c.lane;
        const z = c.axis === 'x' ? c.lane : pos;
        const head = frame < offAt(x, z) ? 2.5 : 1.6;
        return (
          <group key={i} position={[x, 0.12, z]} rotation={[0, c.axis === 'x' ? 0 : Math.PI / 2, 0]}>
            <B p={[0, 0.06, 0]} s={[0.55, 0.16, 0.28]} c={c.c} />
            <B p={[-0.03, 0.18, 0]} s={[0.3, 0.12, 0.24]} c={c.c} />
            <B p={[0.28 * Math.sign(c.speed), 0.07, 0]} s={[0.02, 0.05, 0.22]} c="#fff6d8" e="#fff6d8" ei={head} />
          </group>
        );
      })}
    </group>
  );
};

export const C_Miniature: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const dusk = interpolate(frame, [OUT_START - 10, OUT_START + 80], [1, 0.35], cl);
  const clock = Math.floor(interpolate(frame, [0, 240], [42, 51]));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0f1d33, #1f2d4a 60%, #2b2a3f)'}}>
      <AbsoluteFill style={{filter: 'saturate(1.3) contrast(1.06)'}}>
        <ThreeCanvas width={width} height={height} shadows camera={{fov: 24, position: [0, 15, 24]}} gl={{antialias: true}}>
          <Rig frame={frame} />
          <hemisphereLight args={['#b9c9ff', '#2a1d14', 0.55 * dusk + 0.2]} />
          <directionalLight position={[-10, 8, 6]} intensity={1.8 * dusk} color="#ff9a5a" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
          <directionalLight position={[8, 10, -6]} intensity={0.35} color="#7aa2ff" />
          <City frame={frame} />
        </ThreeCanvas>
      </AbsoluteFill>
      {/* tilt-shift: blur bands above and below the focus strip */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 760, backdropFilter: 'blur(9px)', WebkitMaskImage: 'linear-gradient(black 35%, transparent 100%)', maskImage: 'linear-gradient(black 35%, transparent 100%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 760, backdropFilter: 'blur(9px)', WebkitMaskImage: 'linear-gradient(transparent 0%, black 65%)', maskImage: 'linear-gradient(transparent 0%, black 65%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(5,8,20,0.55) 100%)'}} />
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', color: '#f6efe2'}}>
        <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: 8, opacity: 0.8}}>A CITY · {`6:${clock} PM`}</div>
        <div style={{fontFamily: F.bebas, fontSize: 150, lineHeight: 0.9, letterSpacing: 4, marginTop: 10, textShadow: '0 8px 40px rgba(0,0,0,0.6)'}}>
          {frame < OUT_START + 10 ? 'Normal evening' : 'Then: nothing'}
        </div>
      </div>
      <div style={{position: 'absolute', bottom: 150, width: '100%', textAlign: 'center', fontFamily: F.grotesk, fontWeight: 500, fontSize: 40, color: '#f6efe2', opacity: interpolate(frame, [OUT_START + 30, OUT_START + 45], [0, 1], cl)}}>
        The blackout moves block by block.
      </div>
    </AbsoluteFill>
  );
};
