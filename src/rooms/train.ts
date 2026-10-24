import { radioSub } from '../audio/stations'
import { PLAYLIST } from './playlist'
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
  ui: {
    accent: ['#8e2f3a', '#e9c48f'],
    ink: ['#3a1e22', '#fbefe0'],
    'ink-soft': ['#7a5a58', '#cdb49a'],
    panel: ['rgba(250, 243, 234, .84)', 'rgba(40, 22, 26, .84)'],
    line: ['rgba(120, 50, 50, .16)', 'rgba(233, 196, 143, .2)'],
    bg: ['#efe2d8', '#1c1218'],
  },
  sky: { day: ['#f4e6d8', '#e2cfc4', '#c9b3b8'], night: ['#1e2247', '#141836', '#0b0d22'] },
  light: {
    hemi: { sky: [0xf6ead8, 0x565c9c], ground: [0x9a6a5a, 0x4a2a2a], intensity: [0.6, 0.36] },
    sun: { color: [0xffe6c6, 0x9aa8f0], intensity: [0.48, 0.2] },
  },
  loops: {
    rails: { src: 'audio/train/rails', gain: 0.9 },
    tea: { src: 'audio/train/tea', gain: 0.9 },
    rain: { src: 'audio/train/rain', gain: 1 },
    pages: { src: 'audio/cafe/pages', gain: 0.8 },
    cards: { src: 'audio/train/cards', gain: 0.8 },
  },
  stations: ['minuit', 'pluie-fine', 'nuit-douce'],
  playlist: PLAYLIST,
  presets: {
    work: { sounds: [['radio',.55], ['rails',.4], ['cards',.2]] },
    read: { sounds: [['rails',.45], ['rain',.45], ['tea',.3], ['cards',.25], ['pages',.3]] },
    sleep: { sounds: [['rails',.55], ['rain',.4]], night: true },
  },
  objects: [
    { id: 'cloud', target: 'rain', label: 'Nuage · pluie', anchor: [1.35, 5.2, -3.85] },
    { id: 'window', target: 'rails', label: 'Fenêtre · le train', anchor: [0.9, 2.4, -3.0] },
    { id: 'radio', target: 'radio', label: 'Gramophone · lofi', anchor: [-2.55, 1.1, 1.5] },
    { id: 'tea', target: 'tea', label: 'Verre de thé · cuillère', anchor: [0.75, 1.45, -2.55] },
    { id: 'book', target: 'pages', label: 'Livre · pages', anchor: [-2.35, 1.05, -1.1] },
    { id: 'lamp', target: 'night', label: 'Lampe · jour / nuit', anchor: [-0.05, 1.6, -2.68] },
    { id: 'cards', target: 'cards', label: 'Réussite · les cartes', anchor: [2.6, 0.78, 1.05] },
  ],
  sounds: [
    { id: 'radio', name: 'Gramophone lofi', chip: 'var(--c-radio)', volume: 0.7, sub: radioSub(PLAYLIST.length) },
    { id: 'rails', name: 'Le train', chip: 'var(--c-rails)', volume: 0.7, sub: (s) => (s.on.rails ? 'ta-dam, ta-dam' : 'vitre fermée') },
    { id: 'rain', name: 'Pluie', chip: 'var(--c-rain)', volume: 0.7, sub: () => 'sur la vitre' },
    { id: 'tea', name: 'Thé', chip: 'var(--c-tea)', volume: 0.5, sub: () => 'la cuillère qui tinte' },
    { id: 'cards', name: 'Cartes', chip: 'var(--c-cards)', volume: 0.45, sub: () => 'une réussite, carte après carte' },
    { id: 'pages', name: 'Livre', chip: 'var(--c-pages)', volume: 0.55, sub: () => 'pages tournées' },
  ],
}
