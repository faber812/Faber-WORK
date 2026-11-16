// Dev-only: renders one scene from the Long 001 libraries by index (input prop `i`), shot length 90 frames.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import * as U from './scenes3';
import type {Shot} from './scenes';

export const GALLERY: Shot[] = [
  U.Cooking, U.COHouse('invisible'), U.COHouse('reveal'), U.COHouse('sleep'), U.COHouse('door'), U.Symptoms(3),
  U.BigStat('400+', 'deaths a year in the US', 'CDC · NON-FIRE CARBON MONOXIDE'), U.NeverInside, U.TwentyFeet, U.COAlarm,
  U.ColdHouse('cold'), U.ColdHouse('oven'), U.ColdHouse('huddle'), U.Candle(false), U.Candle(true), U.SignsList, U.WarmingCenter,
  U.FuelGauge, U.Shelves(false), U.Shelves(true), U.LiftStation(1), U.Hospital(1), U.BlackStart('name'), U.BlackStart('rebuild'),
  U.FridgeBack('eat'), U.FridgeBack('mistake'), U.IceCrystals(false), U.IceCrystals(true), U.NoTaste, U.DoubtOut, U.Checklist(5), U.Finale('lit'),
];
export const Gallery: React.FC<{i: number}> = ({i}) => {
  const C = GALLERY[i];
  return (
    <AbsoluteFill style={{background: '#0b1020'}}>
      <C d={90} />
    </AbsoluteFill>
  );
};
