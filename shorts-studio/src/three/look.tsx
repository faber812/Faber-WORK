// Shared "look" layer for 3D Shorts (engine upgrade, Nov 2026). Characters stay exactly as in kit.tsx;
// this file only adds lighting, ink outlines on the set, a continuous camera, in-world signs and small FX.
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {Easing, interpolate, useVideoConfig} from 'remotion';
import * as THREE from 'three';

type V3 = [number, number, number];
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- canvas ----------
export const LookCanvas: React.FC<{children: React.ReactNode; blur?: number}> = ({children, blur = 0}) => {
  const {width, height} = useVideoConfig();
  return (
    <div style={{position: 'absolute', inset: 0, filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined}}>
      <ThreeCanvas width={width} height={height} shadows gl={{toneMappingExposure: 1.45}} camera={{fov: 55, position: [0, 2, 6]}}>
        {children}
      </ThreeCanvas>
    </div>
  );
};

// ---------- lighting rig: warm key + cool fill/rim + soft shadows; night scenes get practical pools ----------
export const Rig: React.FC<{keyPos?: V3; keyColor?: string; keyI?: number; fillI?: number; fog?: [string, number, number]}> = ({
  keyPos: k = [4, 7, 5],
  keyColor = '#ffd7a6',
  keyI = 2.6,
  fillI = 1.1,
  fog,
}) => {
  const {scene} = useThree();
  useLayoutEffect(() => {
    scene.fog = fog ? new THREE.Fog(fog[0], fog[1], fog[2]) : null;
  }, [scene, fog?.[0], fog?.[1], fog?.[2]]);
  return (
    <>
      <hemisphereLight args={['#a9b8ff', '#5b3f6e', fillI]} />
      <directionalLight position={k} intensity={keyI} color={keyColor} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-radius={4}>
        <orthographicCamera attach="shadow-camera" args={[-8, 8, 8, -8, 0.5, 30]} />
      </directionalLight>
      <directionalLight position={[-5, 4, -6]} intensity={0.9} color="#8f7dff" />
    </>
  );
};
// a lamp / flashlight pool: warm light that tints what it touches
export const Pool: React.FC<{p: V3; c?: string; i?: number; d?: number}> = ({p, c = '#ffb25c', i = 6, d = 6}) => (
  <pointLight position={p} intensity={i} distance={d} decay={1.6} color={c} castShadow shadow-mapSize={[512, 512]} />
);

// ---------- ink outlines on set geometry (not on characters) ----------
const INK = new THREE.LineBasicMaterial({color: '#0a0a12'});
export const Inked: React.FC<{children: React.ReactNode; threshold?: number}> = ({children, threshold = 30}) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || m.userData.inked) return;
      m.userData.inked = true;
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, threshold), INK);
      e.raycast = () => null;
      m.add(e);
    });
  });
  return <group ref={ref}>{children}</group>;
};

// ---------- continuous camera ----------
// keys: at time t the camera starts an ease-out move (peak speed on the first frame, ~0.45 s) to pos/tgt,
// then holds with a slow push-in toward the target until the next key. No hard cuts.
export type CamKey = {t: number; pos: V3; tgt: V3; fov?: number; move?: number; push?: number};
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const outCubic = Easing.out(Easing.cubic);
export const camAt = (keys: CamKey[], t: number) => {
  let pos = keys[0].pos, tgt = keys[0].tgt, fov = keys[0].fov ?? 55;
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (t < k.t) break;
    const end = i + 1 < keys.length ? keys[i + 1].t : k.t + 60;
    const m = i === 0 ? 0 : k.move ?? 0.45;
    const u = m > 0 ? outCubic(Math.min(1, (t - k.t) / m)) : 1;
    const p0 = pos, t0 = tgt, f0 = fov;
    pos = lerp3(p0, k.pos, u);
    tgt = lerp3(t0, k.tgt, u);
    fov = f0 + ((k.fov ?? 55) - f0) * u;
    // push-in over the hold, measured to the end of this key's span
    const hold = Math.max(0, Math.min(t, end) - (k.t + m));
    const pk = (k.push ?? 0.07) * Math.min(1, hold / Math.max(0.5, end - k.t - m));
    pos = lerp3(pos, tgt, pk);
  }
  return {pos, tgt, fov};
};
export const camSpeed = (keys: CamKey[], t: number, fps: number) => {
  const a = camAt(keys, t), b = camAt(keys, t + 1 / fps);
  const d = Math.hypot(b.pos[0] - a.pos[0], b.pos[1] - a.pos[1], b.pos[2] - a.pos[2]) + 0.5 * Math.hypot(b.tgt[0] - a.tgt[0], b.tgt[1] - a.tgt[1], b.tgt[2] - a.tgt[2]);
  return d * fps; // m/s
};
export const RigCam: React.FC<{pos: V3; tgt: V3; fov: number}> = ({pos, tgt, fov}) => {
  const {camera} = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...pos);
  if (c.fov !== fov) {
    c.fov = fov;
    c.updateProjectionMatrix();
  }
  c.lookAt(...tgt);
  return null;
};
// world → screen (px) for 2D overlays pinned to 3D points
export const project = (cam: {pos: V3; tgt: V3; fov: number}, p: V3, w = 1080, h = 1920) => {
  const v = new THREE.Vector3(...p);
  const c = new THREE.PerspectiveCamera(cam.fov, w / h, 0.1, 100);
  c.position.set(...cam.pos);
  c.lookAt(...cam.tgt);
  c.updateMatrixWorld();
  v.project(c);
  return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, front: v.z < 1};
};

// ---------- pop-in: 7 frames, overshoot ----------
export const popK = (t: number, at: number, fps = 30) => {
  const f = (t - at) * fps;
  if (f <= 0) return 0;
  if (f >= 7) return 1;
  return interpolate(f, [0, 4, 7], [0, 1.12, 1], cl);
};

// ---------- in-world sign: canvas-textured board hung by two cords, pops in and swings gently ----------
type SignText = {title: string; sub?: string; src?: string; color?: string; bg?: string; w?: number; h?: number; size?: number};
const useSignTexture = ({title, sub, src, color = '#11131c', bg = '#fff6e0', w = 1024, h = 512, size = 120}: SignText) =>
  useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d')!;
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.lineWidth = 18;
    g.strokeStyle = '#11131c';
    g.strokeRect(9, 9, w - 18, h - 18);
    g.fillStyle = color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    // wrap title
    g.font = `900 ${size}px Inter, Arial, sans-serif`;
    const words = title.split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const wd of words) {
      const tryL = cur ? cur + ' ' + wd : wd;
      if (g.measureText(tryL).width > w - 90 && cur) {
        lines.push(cur);
        cur = wd;
      } else cur = tryL;
    }
    if (cur) lines.push(cur);
    const extra = (sub ? 1 : 0) + (src ? 0.6 : 0);
    const total = lines.length + extra;
    let y = h / 2 - ((total - 1) * size * 1.05) / 2;
    lines.forEach((l) => {
      g.fillText(l, w / 2, y);
      y += size * 1.05;
    });
    if (sub) {
      g.font = `800 ${size * 0.5}px Inter, Arial, sans-serif`;
      g.fillStyle = '#5a5f70';
      g.fillText(sub, w / 2, y - size * 0.2);
      y += size * 0.6;
    }
    if (src) {
      g.font = `700 ${Math.round(size * 0.36)}px Inter, Arial, sans-serif`;
      g.fillStyle = '#3b4052';
      g.fillText(`Source: ${src}`, w / 2, h - 50);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [title, sub, src, color, bg, w, h, size]);

export const Sign: React.FC<SignText & {p: V3; width: number; k: number; t: number; rotY?: number; hangTo?: number; glow?: number}> = (o) => {
  const tex = useSignTexture(o);
  const hgt = (o.width * (o.h ?? 512)) / (o.w ?? 1024);
  const swing = Math.sin(o.t * 2.1) * 0.03 * o.k;
  if (o.k <= 0) return null;
  return (
    <group position={o.p} rotation={[0, o.rotY ?? 0, swing]} scale={o.k}>
      <mesh castShadow>
        <boxGeometry args={[o.width, hgt, 0.04]} />
        <meshStandardMaterial attach="material-0" color="#22252f" />
        <meshStandardMaterial attach="material-1" color="#22252f" />
        <meshStandardMaterial attach="material-2" color="#22252f" />
        <meshStandardMaterial attach="material-3" color="#22252f" />
        <meshStandardMaterial attach="material-4" map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.35 + (o.glow ?? 0)} roughness={0.7} />
        <meshStandardMaterial attach="material-5" color="#22252f" />
      </mesh>
      {o.hangTo !== undefined &&
        [-1, 1].map((s) => (
          <mesh key={s} position={[s * o.width * 0.38, hgt / 2 + (o.hangTo! - hgt / 2) / 2, 0]}>
            <boxGeometry args={[0.012, o.hangTo! - hgt / 2, 0.012]} />
            <meshStandardMaterial color="#20222a" />
          </mesh>
        ))}
    </group>
  );
};
// flat decal on the floor (doorway markings etc.)
export const Decal: React.FC<SignText & {p: V3; width: number; k: number}> = (o) => {
  const tex = useSignTexture(o);
  const hgt = (o.width * (o.h ?? 512)) / (o.w ?? 1024);
  if (o.k <= 0) return null;
  return (
    <mesh position={o.p} rotation={[-Math.PI / 2, 0, 0]} scale={o.k} receiveShadow>
      <planeGeometry args={[o.width, hgt]} />
      <meshStandardMaterial map={tex} transparent emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.2} roughness={0.9} />
    </mesh>
  );
};

// ---------- light shaft (flashlight cone you can see) ----------
export const Shaft: React.FC<{from: V3; to: V3; r?: number; color?: string; o?: number}> = ({from, to, r = 0.45, color = '#ffd08a', o = 0.16}) => {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const len = a.distanceTo(b);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return (
    <mesh position={mid} quaternion={q}>
      <coneGeometry args={[r, len, 24, 1, true]} />
      <meshBasicMaterial color={color} transparent opacity={o} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
};
// note: coneGeometry's tip points +y; we orient +y from `from` to `to`, so flip with rotation if the wide end must be at `to`.

// ---------- 2D FX sprites pinned to screen points ----------
export const Puff: React.FC<{x: number; y: number; t: number; at: number; s?: number; color?: string}> = ({x, y, t, at, s = 1, color = '#d9d2c4'}) => {
  const u = (t - at) / 0.7;
  if (u <= 0 || u >= 1) return null;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {[-1.3, -0.6, 0, 0.7, 1.4].map((d, i) => (
        <circle key={i} cx={x + d * 60 * s * (0.4 + u)} cy={y - 30 * s * u - Math.abs(d) * 8} r={(26 + i * 4) * s * (0.5 + u)} fill={color} opacity={0.55 * (1 - u)} />
      ))}
    </svg>
  );
};
export const Sparkle: React.FC<{x: number; y: number; t: number; at: number; color?: string; s?: number}> = ({x, y, t, at, color = '#fff1b0', s = 1}) => {
  const u = (t - at) / 0.5;
  if (u <= 0 || u >= 1) return null;
  const r = 70 * s * Easing.out(Easing.cubic)(u);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {Array.from({length: 8}).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.3;
        return <line key={i} x1={x + Math.cos(a) * r * 0.45} y1={y + Math.sin(a) * r * 0.45} x2={x + Math.cos(a) * r} y2={y + Math.sin(a) * r} stroke={color} strokeWidth={8 * s * (1 - u)} strokeLinecap="round" />;
      })}
    </svg>
  );
};
export const SpeedLines: React.FC<{x: number; y: number; t: number; at: number; dir?: 'down' | 'up'; color?: string}> = ({x, y, t, at, dir = 'down', color = '#ffffff'}) => {
  const u = (t - at) / 0.45;
  if (u <= 0 || u >= 1) return null;
  const sg = dir === 'down' ? -1 : 1;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {[-40, 0, 40].map((dx, i) => (
        <line key={i} x1={x + dx} y1={y + sg * (60 + i * 10)} x2={x + dx} y2={y + sg * (60 + i * 10 + 90 * (1 - u))} stroke={color} strokeWidth={7} strokeLinecap="round" opacity={0.85 * (1 - u)} />
      ))}
    </svg>
  );
};

// ---------- headline text (no box, ink stroke), pops in and keeps breathing ----------
export const Headline: React.FC<{lines: [string, string?][]; top: number; size: number; t: number; at: number; out?: number}> = ({lines, top, size, t, at, out}) => {
  const k = popK(t, at);
  const o = out !== undefined ? interpolate(t, [out - 0.2, out], [1, 0], cl) : 1;
  if (k <= 0 || o <= 0) return null;
  const breathe = 1 + Math.sin(t * 3) * 0.012;
  return (
    <div style={{position: 'absolute', top, left: 60, right: 170, opacity: o, transform: `scale(${k * breathe})`, transformOrigin: 'left top'}}>
      {lines.map(([l, c], i) => (
        <div key={i} style={{fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 900, fontSize: size, lineHeight: 1.02, color: c ?? '#fff', letterSpacing: -1, WebkitTextStroke: `${Math.round(size / 9)}px #0a0a12`, paintOrder: 'stroke fill', textShadow: '0 8px 24px rgba(0,0,0,0.55)'}}>
          {l}
        </div>
      ))}
    </div>
  );
};
