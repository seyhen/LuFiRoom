import type { Room } from './types'

// Un bungalow au bord de la mer, au coucher du soleil. Les enregistrements sont à déclarer dans `loops`
// (waves, gulls, chimes, purr) et `playlist` (docs/ASSETS.md) ; sources et licences : public/audio/CREDITS.md.

export const beach: Room = {
  id: 'beach',
  name: 'Plage',
  description:
    'Bungalow au bord de la mer, au coucher du soleil, en 3D isométrique : grande porte ouverte sur la terrasse et la plage, ' +
    'voilages de lin, carillon de bois flotté, une mouette sur un poteau, lit de jour en rotin où dort un chat roux, ' +
    'fauteuil en éventail, lampe de rotin, table basse en bois flotté, planche de surf, et au loin un voilier et un phare.',
  ui: {
    accent: ['#e0705c', '#ffb38a'],
    ink: ['#4a2e34', '#fff1ea'],
    'ink-soft': ['#8a6a68', '#d9bfc6'],
    panel: ['rgba(255, 248, 242, .82)', 'rgba(36, 30, 62, .8)'],
    line: ['rgba(160, 90, 80, .16)', 'rgba(255, 190, 160, .18)'],
    bg: ['#fbe9dc', '#1b1d42'],
  },
  sky: { day: ['#ffe7d2', '#fbd2c3', '#eab8c3'], night: ['#232857', '#171b40', '#0d1028'] },
  light: {
    hemi: { sky: [0xffe9d8, 0x6a70b8], ground: [0xd9b48c, 0x4a3448], intensity: [0.58, 0.38] },
    sun: { color: [0xffd2a8, 0xa0b2ff], intensity: [0.5, 0.22] },
  },
  loops: {},
  stations: ['petit-matin', 'nuit-douce', 'brume'],
  playlist: [],
  objects: [
    { id: 'window', target: 'waves', label: 'La mer · vagues', anchor: [1.25, 2.1, -3.0] },
    { id: 'gull', target: 'gulls', label: 'Mouette · cris au loin', anchor: [-0.2, 1.5, -3.45] },
    { id: 'chimes', target: 'chimes', label: 'Carillon · brise', anchor: [1.85, 2.95, -2.9] },
    { id: 'radio', target: 'radio', label: 'Radio · lofi', anchor: [-2.4, 1.3, 1.65] },
    { id: 'cat', target: 'purr', label: 'Chat · ronron', anchor: [-2.35, 1.05, -0.4] },
    { id: 'lamp', target: 'night', label: 'Lampe · jour / nuit', anchor: [-1.25, 1.55, -2.5] },
  ],
  sounds: [
    { id: 'radio', name: 'Radio lofi', chip: 'var(--c-radio)', volume: 0.7, sub: (s) => (s.on.radio && s.onAir) || 'lofi · 72 bpm' },
    { id: 'waves', name: 'Vagues', chip: 'var(--c-waves)', volume: 0.7, sub: (s) => (s.night ? 'marée de nuit' : 'le ressac') },
    { id: 'gulls', name: 'Mouettes', chip: 'var(--c-gulls)', volume: 0.4, sub: () => 'au-dessus de la plage' },
    { id: 'chimes', name: 'Carillon', chip: 'var(--c-chimes)', volume: 0.45, sub: () => 'dans la brise' },
    { id: 'purr', name: 'Chat', chip: 'var(--c-cat)', volume: 0.7, sub: () => 'sieste au soleil' },
  ],
}
