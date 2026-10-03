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
  sky: { day: ['#ffe2c8', '#f4c4b4', '#c9b0c8'], night: ['#1d2350', '#121638', '#0a0c24'] },
  light: {
    hemi: { sky: [0xffe8d6, 0x5a62a8], ground: [0xb08a70, 0x261f3a], intensity: [0.6, 0.36] },
    sun: { color: [0xffcf9e, 0x9fb0ff], intensity: [0.58, 0.22] },
  },
  loops: {},
  playlist: [],
  objects: [
    { id: 'city', target: 'city', label: 'La ville · rumeur', anchor: [0.6, 4.6, -3.9] },
    { id: 'brazier', target: 'fire', label: 'Braséro · feu', anchor: [-0.85, 1.25, 0.35] },
    { id: 'laundry', target: 'wind', label: 'Linge · le vent', anchor: [2.85, 1.55, -0.85] },
    { id: 'pigeons', target: 'pigeons', label: 'Pigeons · roucoulements', anchor: [1.15, 1.5, -3.15] },
    { id: 'radio', target: 'radio', label: 'Radio · lofi', anchor: [-2.5, 1.3, 2.45] },
    { id: 'lamp', target: 'night', label: 'Guirlande · jour / nuit', anchor: [3.0, 3.15, 0.4] },
  ],
  sounds: [
    { id: 'radio', name: 'Radio lofi', chip: 'var(--c-radio)', volume: 0.7, sub: (s) => (s.on.radio && s.onAir) || 'lofi · 72 bpm' },
    { id: 'city', name: 'La ville', chip: 'var(--c-city)', volume: 0.6, sub: (s) => (s.night ? 'sirènes au loin' : 'klaxons, rumeur') },
    { id: 'fire', name: 'Braséro', chip: 'var(--c-fire)', volume: 0.7, sub: (s) => (s.on.fire ? 'ça crépite' : 'éteint') },
    { id: 'wind', name: 'Vent', chip: 'var(--c-wind)', volume: 0.6, sub: () => 'sur les toits' },
    { id: 'pigeons', name: 'Pigeons', chip: 'var(--c-pigeons)', volume: 0.45, sub: (s) => (s.night ? 'ils somnolent' : 'roucoulements') },
  ],
}
