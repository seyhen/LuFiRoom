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
  sky: { day: ['#fbe9dc', '#f2d2c6', '#d9bcc6'], night: ['#20264a', '#151a36', '#0b0e22'] },
  light: {
    hemi: { sky: [0xfff0e2, 0x5a62a8], ground: [0x9a8a70, 0x262038], intensity: [0.62, 0.36] },
    sun: { color: [0xffdcb8, 0x9fb0ff], intensity: [0.55, 0.22] },
  },
  loops: {},
  playlist: [],
  objects: [
    { id: 'spring', target: 'spring', label: 'Source · eau chaude', anchor: [1.15, 1.45, -2.4] },
    { id: 'bamboo', target: 'bamboo', label: 'Shishi-odoshi · bambou', anchor: [-1.1, 1.1, -2.35] },
    { id: 'furin', target: 'chimes', label: 'Furin · clochette', anchor: [-2.0, 2.45, 0.95] },
    { id: 'maple', target: 'outside', label: 'Érable · le jardin', anchor: [2.2, 3.75, -2.4] },
    { id: 'radio', target: 'radio', label: 'Radio · lofi', anchor: [-2.4, 1.25, 2.1] },
    { id: 'lamp', target: 'night', label: 'Lanterne · jour / nuit', anchor: [2.78, 2.0, -0.55] },
  ],
  sounds: [
    { id: 'radio', name: 'Radio lofi', chip: 'var(--c-radio)', volume: 0.7, sub: (s) => (s.on.radio && s.onAir) || 'lofi · 72 bpm' },
    { id: 'spring', name: 'Source', chip: 'var(--c-spring)', volume: 0.65, sub: () => 'eau chaude qui coule' },
    { id: 'bamboo', name: 'Shishi-odoshi', chip: 'var(--c-bamboo)', volume: 0.45, sub: () => 'le bambou bascule' },
    { id: 'chimes', name: 'Furin', chip: 'var(--c-chimes)', volume: 0.45, sub: () => 'clochette de verre' },
    { id: 'outside', name: 'Jardin', chip: 'var(--c-win)', volume: 0.65, sub: (s) => (s.night ? 'grillons' : 'oiseaux') },
  ],
}
