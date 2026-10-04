import type { Room } from './types'

// Une ruelle de marché de nuit sous la pluie. Les enregistrements sont à déclarer dans `loops`
// (rain, sizzle, simmer, neon, tram) et `playlist` (docs/ASSETS.md) ; sans eux, tout est synthétisé.

export const market: Room = {
  id: 'market',
  name: 'Marché de nuit',
  description:
    'Ruelle d’un marché de nuit sous la pluie, en 3D isométrique : une carriole de ramen sous ses lanternes rouges, un wok qui saute ' +
    'sur sa flamme, une marmite de bouillon qui frémit, une enseigne au néon rose qui bourdonne, une télé de comptoir, un distributeur ' +
    'qui éclaire le pavé, des flaques pleines de reflets, des guirlandes d’ampoules, et par la baie, un boulevard où passe un tram.',
  dimmedBy: 'cloud',
  ui: {
    accent: ['#d6336c', '#ff6fb1'],
    ink: ['#2c1530', '#fff0f8'],
    'ink-soft': ['#74587a', '#d9a8cc'],
    panel: ['rgba(252, 244, 250, .84)', 'rgba(24, 12, 34, .86)'],
    line: ['rgba(160, 50, 120, .16)', 'rgba(255, 111, 177, .22)'],
    bg: ['#ecd8e8', '#12081e'],
  },
  sky: { day: ['#f6d4d0', '#e6aeb8', '#b980a8'], night: ['#1a1038', '#110a2a', '#080518'] },
  light: {
    hemi: { sky: [0xffd8e0, 0x7a58c8], ground: [0x7a5a58, 0x2a1a3a], intensity: [0.55, 0.34] },
    sun: { color: [0xffc6a0, 0xb48cff], intensity: [0.45, 0.22] },
  },
  loops: {},
  stations: ['nuit-douce', 'bureau', 'petit-matin'],
  playlist: [],
  objects: [
    { id: 'cloud', target: 'rain', label: 'Nuage · pluie', anchor: [1.35, 5.2, -3.85] },
    { id: 'tram', target: 'tram', label: 'Baie · le tram', anchor: [1.4, 2.95, -2.9] },
    { id: 'neon', target: 'neon', label: 'Enseigne · néon', anchor: [-1.45, 2.5, -2.55] },
    { id: 'wok', target: 'sizzle', label: 'Wok · ça saute', anchor: [0.28, 1.45, -0.87] },
    { id: 'pot', target: 'simmer', label: 'Marmite · bouillon', anchor: [1.4, 1.6, -0.87] },
    { id: 'lamp', target: 'night', label: 'Lanterne · jour / nuit', anchor: [1.25, 2.2, -0.73] },
    { id: 'radio', target: 'radio', label: 'Télé · lofi', anchor: [-2.35, 1.0, 2.45] },
  ],
  sounds: [
    { id: 'radio', name: 'Télé lofi', chip: 'var(--c-radio)', volume: 0.7, sub: (s) => (s.on.radio && s.onAir) || 'lofi · 70 bpm' },
    { id: 'rain', name: 'Pluie', chip: 'var(--c-rain)', volume: 0.7, sub: () => 'sur la bâche' },
    { id: 'sizzle', name: 'Wok', chip: 'var(--c-sizzle)', volume: 0.5, sub: () => 'ça saute à feu vif' },
    { id: 'simmer', name: 'Marmite', chip: 'var(--c-simmer)', volume: 0.5, sub: () => 'le bouillon qui frémit' },
    { id: 'neon', name: 'Néon', chip: 'var(--c-neon)', volume: 0.4, sub: () => 'un bourdonnement rose' },
    { id: 'tram', name: 'Tram', chip: 'var(--c-tram)', volume: 0.5, sub: () => 'au bout du boulevard' },
  ],
}
