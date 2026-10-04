import type { Room } from './types'

// Un toit-terrasse de Brooklyn, un soir d'été. Les enregistrements sont à déclarer dans `loops`
// (city, fire, wind, pigeons) et `playlist` (docs/ASSETS.md) ; sources et licences : public/audio/CREDITS.md.

export const roof: Room = {
  id: 'roof',
  name: 'Toit-terrasse',
  description:
    'Toit-terrasse à New York, un soir d’été, en 3D isométrique : terrasse de teck entre deux parapets de brique, ' +
    'les tours de Manhattan tout autour dont les fenêtres s’allument, un château d’eau sur la cage d’escalier, ' +
    'un braséro entre un canapé et deux fauteuils Adirondack, une guirlande, du linge qui sèche, des pigeons, une lunette.',
  ui: {
    accent: ['#c0563a', '#ff7ab8'],
    ink: ['#3a2420', '#fff0f4'],
    'ink-soft': ['#7d5f58', '#d6b8c8'],
    panel: ['rgba(255, 246, 238, .82)', 'rgba(30, 24, 52, .82)'],
    line: ['rgba(150, 80, 60, .16)', 'rgba(255, 122, 184, .2)'],
    bg: ['#f7e1d2', '#141634'],
  },
  sky: { day: ['#ffe2c8', '#f4c4b4', '#c9b0c8'], night: ['#1d2350', '#121638', '#0a0c24'] },
  light: {
    hemi: { sky: [0xffe8d6, 0x5a62a8], ground: [0xb08a70, 0x42303a], intensity: [0.6, 0.36] },
    sun: { color: [0xffcf9e, 0x9fb0ff], intensity: [0.58, 0.22] },
  },
  loops: {},
  stations: ['veillee', 'nuit-douce', 'bureau'],
  playlist: [],
  objects: [
    { id: 'city', target: 'city', label: 'La ville · rumeur', anchor: [0.6, 4.6, -3.9] },
    { id: 'brazier', target: 'fire', label: 'Braséro · feu', anchor: [-0.85, 0.85, 0.35] },
    { id: 'laundry', target: 'wind', label: 'Linge · le vent', anchor: [2.85, 1.5, 0.15] },
    { id: 'pigeons', target: 'pigeons', label: 'Pigeons · roucoulements', anchor: [1.15, 1.5, -3.15] },
    { id: 'radio', target: 'radio', label: 'Boombox · lofi', anchor: [-2.55, 0.75, 2.35] },
    { id: 'lamp', target: 'night', label: 'Guirlande · jour / nuit', anchor: [3.0, 2.8, 0.4] },
  ],
  sounds: [
    { id: 'radio', name: 'Boombox lofi', chip: 'var(--c-radio)', volume: 0.7, sub: (s) => (s.on.radio && s.onAir) || 'lofi · 72 bpm' },
    { id: 'city', name: 'La ville', chip: 'var(--c-city)', volume: 0.6, sub: (s) => (s.night ? 'sirènes au loin' : 'klaxons, rumeur') },
    { id: 'fire', name: 'Braséro', chip: 'var(--c-fire)', volume: 0.7, sub: (s) => (s.on.fire ? 'ça crépite' : 'éteint') },
    { id: 'wind', name: 'Vent', chip: 'var(--c-wind)', volume: 0.6, sub: () => 'sur les toits' },
    { id: 'pigeons', name: 'Pigeons', chip: 'var(--c-pigeons)', volume: 0.45, sub: (s) => (s.night ? 'ils somnolent' : 'roucoulements') },
  ],
}
