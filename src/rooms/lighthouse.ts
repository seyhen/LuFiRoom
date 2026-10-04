import type { Room } from './types'

// Le quartier du gardien d'un phare, un soir de tempête. Les enregistrements sont à déclarer dans `loops`
// (waves, wind, foghorn, bell, fire) et `playlist` (docs/ASSETS.md) ; sans eux, tout est synthétisé.

export const lighthouse: Room = {
  id: 'lighthouse',
  name: 'Phare',
  description:
    'Quartier du gardien au sommet d’un phare, en 3D isométrique : un hublot de laiton sur une mer de tempête, un escalier en ' +
    'colimaçon de fonte, un poêle à bois et sa bouilloire, une table à cartes éclairée par une lampe à huile, un fauteuil de cuir ' +
    'et une couverture rayée, un baromètre, une corne de brume, la cloche d’une bouée au large, un concertina sur un coffre de marin, ' +
    'et la nuit, le faisceau du phare qui balaie la mer.',
  ui: {
    accent: ['#1d5d86', '#ff9a8a'],
    ink: ['#1c2a3d', '#eef3fb'],
    'ink-soft': ['#5f7084', '#a9bad2'],
    panel: ['rgba(246, 249, 252, .84)', 'rgba(14, 24, 40, .86)'],
    line: ['rgba(30, 70, 110, .16)', 'rgba(255, 154, 138, .18)'],
    bg: ['#dfe8f0', '#0e1624'],
  },
  sky: { day: ['#e6eef4', '#c8d8e4', '#9db4c6'], night: ['#18284c', '#0e1830', '#070d1c'] },
  light: {
    hemi: { sky: [0xfff1de, 0x4a6aa8], ground: [0xa88c6c, 0x2a3040], intensity: [0.7, 0.34] },
    sun: { color: [0xffe6c4, 0x9db8ff], intensity: [0.5, 0.22] },
  },
  loops: {},
  stations: ['veillee', 'brume', 'nuit-douce'],
  playlist: [],
  objects: [
    { id: 'window', target: 'waves', label: 'Hublot · la houle', anchor: [1.35, 2.55, -2.9] },
    { id: 'barometer', target: 'wind', label: 'Baromètre · la tempête', anchor: [-0.55, 3.0, -2.85] },
    { id: 'foghorn', target: 'foghorn', label: 'Corne de brume', anchor: [-2.45, 3.0, -1.95] },
    { id: 'bell', target: 'bell', label: 'Cloche · la bouée', anchor: [2.68, 1.65, -2.55] },
    { id: 'stove', target: 'fire', label: 'Poêle · feu', anchor: [-2.2, 0.75, -2.0] },
    { id: 'lamp', target: 'night', label: 'Lampe à huile · jour / nuit', anchor: [0.12, 1.5, -2.45] },
    { id: 'cat', target: 'purr', label: 'Chat · ronron', anchor: [-0.75, 0.75, 0.7] },
    { id: 'radio', target: 'radio', label: 'Concertina · lofi', anchor: [2.45, 1.05, 0.2] },
  ],
  sounds: [
    { id: 'radio', name: 'Concertina lofi', chip: 'var(--c-radio)', volume: 0.7, sub: (s) => (s.on.radio && s.onAir) || 'lofi · 62 bpm' },
    { id: 'waves', name: 'Houle', chip: 'var(--c-waves)', volume: 0.7, sub: () => 'sur les rochers' },
    { id: 'wind', name: 'Tempête', chip: 'var(--c-wind)', volume: 0.55, sub: () => 'dans l’escalier' },
    { id: 'foghorn', name: 'Corne de brume', chip: 'var(--c-foghorn)', volume: 0.45, sub: () => 'au large, dans la brume' },
    { id: 'bell', name: 'Cloche de bouée', chip: 'var(--c-bell)', volume: 0.45, sub: () => 'balancée par la houle' },
    { id: 'fire', name: 'Poêle', chip: 'var(--c-fire)', volume: 0.5, sub: () => 'la fonte qui chauffe' },
    { id: 'purr', name: 'Ronron', chip: 'var(--c-cat)', volume: 0.5, sub: () => 'le chat du phare' },
  ],
}
