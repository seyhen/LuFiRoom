import type { Room } from './types'

// Un bain en plein air au bord d'un ryokan, en automne. Les enregistrements sont à déclarer dans `loops`
// (spring, bamboo, chimes, birds, crickets) et `playlist` (docs/ASSETS.md) ; sources et licences : public/audio/CREDITS.md.

export const onsen: Room = {
  id: 'onsen',
  name: 'Onsen',
  description:
    'Bain japonais en plein air au bord d’une auberge, en automne, en 3D isométrique : un bassin d’eau chaude qui fume entre ' +
    'des rochers moussus, un bec de bambou qui verse l’eau de la source, un shishi-odoshi, un érable rouge dont les feuilles ' +
    'tombent, une lanterne de pierre, une clochette de verre sous l’avant-toit, les shōji de l’auberge, du thé sur l’engawa, ' +
    'et des montagnes dans la brume au-dessus de la palissade.',
  ui: {
    accent: ['#c23a2e', '#ffb35e'],
    ink: ['#2e2622', '#fff2e2'],
    'ink-soft': ['#6e625a', '#d8c2a8'],
    panel: ['rgba(252, 246, 238, .84)', 'rgba(34, 28, 32, .84)'],
    line: ['rgba(120, 70, 50, .16)', 'rgba(255, 179, 94, .18)'],
    bg: ['#f3e6dc', '#17141e'],
  },
  sky: { day: ['#fbe9dc', '#f2d2c6', '#d9bcc6'], night: ['#20264a', '#151a36', '#0b0e22'] },
  light: {
    hemi: { sky: [0xfff0e2, 0x5a62a8], ground: [0x9a8a70, 0x3e3036], intensity: [0.62, 0.36] },
    sun: { color: [0xffdcb8, 0x9fb0ff], intensity: [0.55, 0.22] },
  },
  loops: {},
  stations: ['brume', 'nuit-douce', 'petit-matin'],
  playlist: [],
  objects: [
    { id: 'spring', target: 'spring', label: 'Source · eau chaude', anchor: [1.15, 1.45, -2.4] },
    { id: 'bamboo', target: 'bamboo', label: 'Shishi-odoshi · bambou', anchor: [-1.1, 1.1, -2.35] },
    { id: 'furin', target: 'chimes', label: 'Furin · clochette', anchor: [-2.0, 2.45, 0.95] },
    { id: 'maple', target: 'outside', label: 'Érable · le jardin', anchor: [2.5, 3.0, -2.6] },
    { id: 'radio', target: 'radio', label: 'Shamisen · lofi', anchor: [-2.45, 0.85, 2.0] },
    { id: 'lamp', target: 'night', label: 'Lanterne · jour / nuit', anchor: [2.78, 1.4, -0.55] },
  ],
  sounds: [
    { id: 'radio', name: 'Shamisen lofi', chip: 'var(--c-radio)', volume: 0.7, sub: (s) => (s.on.radio && s.onAir) || 'lofi · 72 bpm' },
    { id: 'spring', name: 'Source', chip: 'var(--c-spring)', volume: 0.65, sub: () => 'eau chaude qui coule' },
    { id: 'bamboo', name: 'Shishi-odoshi', chip: 'var(--c-bamboo)', volume: 0.45, sub: () => 'le bambou bascule' },
    { id: 'chimes', name: 'Furin', chip: 'var(--c-chimes)', volume: 0.45, sub: () => 'clochette de verre' },
    { id: 'outside', name: 'Jardin', chip: 'var(--c-win)', volume: 0.65, sub: (s) => (s.night ? 'grillons' : 'oiseaux') },
  ],
}
