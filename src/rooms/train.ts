import { radioSub } from '../audio/stations'
import { PLAYLIST } from './playlist'
import type { Room } from './types'
import { WEATHER_LOOPS } from './weather'

// Un compartiment de voiture-lits, la nuit. Les enregistrements sont à déclarer dans `loops`
// (rails, sand, rain, cards) et `playlist` (docs/ASSETS.md) ; sources et licences : public/audio/CREDITS.md.

export const train: Room = {
  id: 'train',
  name: 'Train de nuit',
  description:
    'Compartiment de voiture-lits en 3D isométrique : boiseries d’acajou, couchettes superposées et leur échelle de laiton, ' +
    'lampe de table à abat-jour plissé, verre de thé dans son porte-verre, fauteuil de velours, valise ouverte, ' +
    'et par la fenêtre, le paysage des Alpes qui défile, sous la pluie si on veut.',
  ui: {
    accent: ['#8e2f3a', '#e9c48f'],
    ink: ['#3a1e22', '#fbefe0'],
    'ink-soft': ['#7a5a58', '#cdb49a'],
    panel: ['rgba(250, 243, 234, .84)', 'rgba(40, 22, 26, .84)'],
    line: ['rgba(120, 50, 50, .16)', 'rgba(233, 196, 143, .2)'],
    bg: ['#efe2d8', '#1c1218'],
  },
  // la voie file dans un pré des Alpes, la voiture suivante derrière : on recule pour voir le dehors
  zoom: 0.82,
  sky: { day: ['#f4e6d8', '#e2cfc4', '#c9b3b8'], night: ['#1e2247', '#141836', '#0b0d22'] },
  light: {
    hemi: { sky: [0xf6ead8, 0x565c9c], ground: [0x9a6a5a, 0x4a2a2a], intensity: [0.6, 0.36] },
    sun: { color: [0xffe6c6, 0x9aa8f0], intensity: [0.48, 0.2] },
  },
  loops: {
    ...WEATHER_LOOPS,
    rails: { src: 'audio/train/rails', gain: 0.9 },
    sand: { src: 'audio/train/sand', gain: 0.8 },
    rain: { src: 'audio/train/rain', gain: 0.8 },
    cards: { src: 'audio/train/cards', gain: 0.8 },
  },
  stations: ['minuit', 'pluie-fine', 'nuit-douce'],
  playlist: PLAYLIST,
  presets: {
    work: { sounds: [['radio',.55], ['rails',.4], ['cards',.2]] },
    read: { sounds: [['rails',.45], ['rain',.45], ['sand',.3], ['cards',.25]] },
    sleep: { sounds: [['rails',.55], ['rain',.4]], night: true },
  },
  objects: [
    { id: 'window', target: 'rails', label: 'Fenêtre · le train', anchor: [0.9, 2.4, -3.0] },
    { id: 'radio', target: 'radio', label: 'Gramophone · lofi', anchor: [-2.55, 1.1, 1.5] },
    { id: 'hourglass', target: 'sand', label: 'Sablier · le sable', anchor: [1.78, 1.18, -2.64] },
    { id: 'lamp', target: 'night', label: 'Lampe · jour / nuit', anchor: [-0.05, 1.6, -2.68] },
    { id: 'cards', target: 'cards', label: 'Réussite · les cartes', anchor: [2.6, 0.78, 1.05] },
  ],
  sounds: [
    { id: 'radio', name: 'Gramophone lofi', chip: 'var(--c-radio)', volume: 0.7, sub: radioSub(PLAYLIST.length) },
    { id: 'rails', name: 'Le train', chip: 'var(--c-rails)', volume: 0.7, sub: (s) => (s.on.rails ? 'ta-dam, ta-dam' : 'vitre fermée') },
    { id: 'rain', name: 'Météo', chip: 'var(--c-rain)', volume: 0.7, sub: () => 'sur la vitre' },
    { id: 'sand', name: 'Sablier', chip: 'var(--c-sand)', volume: 0.45, sub: () => 'le sable qui coule' },
    { id: 'cards', name: 'Cartes', chip: 'var(--c-cards)', volume: 0.45, sub: () => 'une réussite, carte après carte' },
  ],
}
