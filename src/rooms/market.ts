import { radioSub } from '../audio/stations'
import { PLAYLIST } from './playlist'
import type { Room } from './types'
import { WEATHER_LOOPS } from './weather'

// Une ruelle de marché de nuit sous la pluie. Les enregistrements sont à déclarer dans `loops`
// (rain, sizzle, simmer, tram) et `playlist` (docs/ASSETS.md) ; sans eux, tout est synthétisé.

export const market: Room = {
  id: 'market',
  name: 'Marché de nuit',
  description:
    'Ruelle d’un marché de nuit sous la pluie, en 3D isométrique : une carriole de ramen sous ses lanternes rouges, un wok qui saute ' +
    'sur sa flamme, une marmite de bouillon qui frémit, une enseigne au néon rose qui bourdonne, une télé de comptoir, un distributeur ' +
    'qui éclaire le pavé, des flaques pleines de reflets, des guirlandes d’ampoules, et par la baie, un boulevard où passe un tram.',
  ui: {
    accent: ['#d6336c', '#ff6fb1'],
    ink: ['#2c1530', '#fff0f8'],
    'ink-soft': ['#74587a', '#d9a8cc'],
    panel: ['rgba(252, 244, 250, .84)', 'rgba(24, 12, 34, .86)'],
    line: ['rgba(160, 50, 120, .16)', 'rgba(255, 111, 177, .22)'],
    bg: ['#ecd8e8', '#12081e'],
  },
  // la rue du marché continue (tram, immeubles, néons, lanternes) : on recule pour la voir
  zoom: 0.84,
  sky: { day: ['#e6ccd0', '#cfa2b6', '#9c739e'], night: ['#1a1038', '#110a2a', '#080518'] },
  light: {
    hemi: { sky: [0xffd8e0, 0x7a58c8], ground: [0x7a5a58, 0x2a1a3a], intensity: [0.55, 0.34] },
    sun: { color: [0xffc6a0, 0xb48cff], intensity: [0.45, 0.22] },
  },
  shelter: 'open',
  loops: {
    ...WEATHER_LOOPS,
    sizzle: { src: 'audio/market/sizzle', gain: 0.8 },
    simmer: { src: 'audio/market/simmer', gain: 0.8 },
    tram: { src: 'audio/market/tram', gain: 0.8 },
    bonodori: { src: 'audio/market/bonodori', gain: 0.8 },
  },
  stations: ['pluie-fine', 'bureau', 'soleil-bas'],
  playlist: PLAYLIST,
  presets: {
    work: { sounds: [['radio',.55], ['rain',.4], ['simmer',.25]] },
    read: { sounds: [['rain',.5], ['simmer',.3], ['sizzle',.2], ['radio',.3]] },
    sleep: { sounds: [['rain',.6], ['simmer',.2]], night: true },
  },
  objects: [
    { id: 'tram', target: 'tram', label: 'Baie · le tram', anchor: [1.4, 2.95, -2.9] },
    { id: 'wok', target: 'sizzle', label: 'Wok · ça saute', anchor: [0.24, 1.28, -0.87] },
    { id: 'pot', target: 'simmer', label: 'Marmite · bouillon', anchor: [1.42, 1.28, -0.85] },
    // hors du marché : la tour de la fête bon-odori, au loin
    { id: 'yagura', target: 'bonodori', label: 'Yagura · la danse bon-odori', anchor: [7.77, 1.15, 2.57] },
    { id: 'lamp', target: 'night', label: 'Lanterne · jour / nuit', anchor: [1.4, 2.36, -0.73] },
    { id: 'radio', target: 'radio', label: 'Télé · lofi', anchor: [-2.3, 0.95, 2.75] },
  ],
  sounds: [
    { id: 'radio', name: 'Télé lofi', chip: 'var(--c-radio)', volume: 0.7, sub: radioSub(PLAYLIST.length) },
    { id: 'rain', name: 'Météo', chip: 'var(--c-rain)', volume: 0.7, sub: () => 'sur la bâche' },
    { id: 'sizzle', name: 'Wok', chip: 'var(--c-sizzle)', volume: 0.5, sub: () => 'ça saute à feu vif' },
    { id: 'simmer', name: 'Marmite', chip: 'var(--c-simmer)', volume: 0.5, sub: () => 'le bouillon qui frémit' },
    { id: 'bonodori', name: 'Bon-odori', chip: 'var(--c-bonodori)', volume: 0.35, sub: () => 'tambour et flûte, au loin' },
    { id: 'tram', name: 'Tram', chip: 'var(--c-tram)', volume: 0.5, sub: () => 'au bout du boulevard' },
  ],
}
