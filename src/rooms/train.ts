import type { Room } from './types'

// Un compartiment de voiture-lits, la nuit. Les enregistrements sont à déclarer dans `loops`
// (rails, tea, rain, pages) et `playlist` (docs/ASSETS.md) ; sources et licences : public/audio/CREDITS.md.

export const train: Room = {
  id: 'train',
  name: 'Train de nuit',
  description:
    'Compartiment de voiture-lits en 3D isométrique : boiseries d’acajou, couchettes superposées et leur échelle de laiton, ' +
    'lampe de table à abat-jour plissé, verre de thé dans son porte-verre, fauteuil de velours, valise ouverte, ' +
    'et par la fenêtre, le paysage des Alpes qui défile, sous la pluie si on veut.',
  dimmedBy: 'cloud',
  sky: { day: ['#f4e6d8', '#e2cfc4', '#c9b3b8'], night: ['#1e2247', '#141836', '#0b0d22'] },
  light: {
    hemi: { sky: [0xf6ead8, 0x565c9c], ground: [0x9a6a5a, 0x2a1f38], intensity: [0.6, 0.36] },
    sun: { color: [0xffe6c6, 0x9aa8f0], intensity: [0.48, 0.2] },
  },
  loops: {},
  playlist: [],
  objects: [
    { id: 'cloud', target: 'rain', label: 'Nuage · pluie', anchor: [1.3, 5.75, -3.85] },
    { id: 'window', target: 'rails', label: 'Fenêtre · le train', anchor: [0.9, 2.4, -3.0] },
    { id: 'radio', target: 'radio', label: 'Radio · lofi', anchor: [-2.55, 1.6, 1.7] },
    { id: 'tea', target: 'tea', label: 'Verre de thé', anchor: [0.75, 1.45, -2.55] },
    { id: 'book', target: 'pages', label: 'Livre · pages', anchor: [-2.35, 1.05, -1.1] },
    { id: 'lamp', target: 'night', label: 'Lampe · jour / nuit', anchor: [-0.05, 1.85, -2.6] },
  ],
  sounds: [
    { id: 'radio', name: 'Radio lofi', chip: 'var(--c-radio)', volume: 0.7, sub: (s) => (s.on.radio && s.onAir) || 'lofi · 72 bpm' },
    { id: 'rails', name: 'Le train', chip: 'var(--c-rails)', volume: 0.7, sub: (s) => (s.on.rails ? 'ta-dam, ta-dam' : 'vitre fermée') },
    { id: 'rain', name: 'Pluie', chip: 'var(--c-rain)', volume: 0.7, sub: () => 'sur la vitre' },
    { id: 'tea', name: 'Thé', chip: 'var(--c-tea)', volume: 0.5, sub: () => 'la cuillère qui tinte' },
    { id: 'pages', name: 'Livre', chip: 'var(--c-pages)', volume: 0.55, sub: () => 'pages tournées' },
  ],
}
