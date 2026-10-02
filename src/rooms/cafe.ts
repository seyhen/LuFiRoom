import type { Room } from './types'

// Un café d'Édimbourg sous la pluie, avec son mur de livres. Les enregistrements sont à déclarer dans `loops`
// (street, murmur, espresso, pages, rain) et `playlist` (docs/ASSETS.md) ; sources et licences : public/audio/CREDITS.md.

export const cafe: Room = {
  id: 'cafe',
  name: 'Café',
  description: "Café d'Édimbourg sous la pluie, en 3D isométrique : comptoir avec une machine à café, mur de livres avec son échelle, deux clients autour d'une théière, fenêtre sur le Château et la vieille ville, nuage de pluie, lampe champignon.",
  dimmedBy: 'cloud',
  sky: { day: ['#eceff2', '#d4dce2', '#b6c3cd'], night: ['#252c4a', '#171c33', '#0d1124'] },
  light: {
    hemi: { sky: [0xf3f1ee, 0x5a63a8], ground: [0xb3a89c, 0x2a2540], intensity: [0.68, 0.42] },
    sun: { color: [0xfff1de, 0x9fb2ff], intensity: [0.5, 0.26] },
  },
  loops: {},
  playlist: [],
  objects: [
    { id: 'cloud', target: 'rain', label: 'Nuage · pluie', anchor: [1.3, 5.75, -3.85] },
    { id: 'radio', target: 'radio', label: 'Radio · lofi', anchor: [-0.57, 1.85, -2.45] },
    { id: 'window', target: 'street', label: 'Fenêtre · la rue', anchor: [1.4, 3.35, -3.0] },
    { id: 'espresso', target: 'espresso', label: 'Machine à café', anchor: [-1.85, 1.9, -2.45] },
    { id: 'guests', target: 'murmur', label: 'Clients · conversations', anchor: [0.6, 1.75, 0.1] },
    { id: 'books', target: 'pages', label: 'Bibliothèque · pages', anchor: [-2.7, 2.4, 0.4] },
    { id: 'lamp', target: 'night', label: 'Lampe · jour / nuit', anchor: [2.45, 1.56, -1.55] },
  ],
  sounds: [
    { id: 'radio', name: 'Radio lofi', chip: 'var(--c-radio)', volume: 0.7, sub: (s) => (s.on.radio && s.onAir) || 'lofi · 72 bpm' },
    { id: 'rain', name: 'Pluie', chip: 'var(--c-rain)', volume: 0.7, sub: (s) => (s.on.street ? 'vitre ouverte' : 'vitre fermée') },
    { id: 'street', name: 'La rue', chip: 'var(--c-street)', volume: 0.45, sub: (s) => (s.night ? 'bus dans la nuit' : 'voitures sur le pavé') },
    { id: 'murmur', name: 'Brouhaha', chip: 'var(--c-murmur)', volume: 0.5, sub: () => 'conversations' },
    { id: 'espresso', name: 'Expresso', chip: 'var(--c-espresso)', volume: 0.5, sub: () => 'vapeur et tasses' },
    { id: 'pages', name: 'Pages', chip: 'var(--c-pages)', volume: 0.55, sub: () => 'bibliothèque, tic-tac' },
  ],
}
