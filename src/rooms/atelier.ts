import type { Room } from './types'

// Un atelier sous les toits de Paris. Les enregistrements sont à déclarer dans `loops`
// (keys, pencil, kettle, rain) et `playlist` (docs/ASSETS.md) ; sources et licences : public/audio/CREDITS.md.

export const atelier: Room = {
  id: 'atelier',
  name: 'Atelier',
  description:
    'Atelier d’illustratrice sous les toits de Paris, en 3D isométrique : une grande verrière d’acier noir sur les toits de zinc ' +
    'et la tour Eiffel, une table à dessin et sa lampe d’architecte, un bureau avec un clavier, un tourne-disque, ' +
    'un coin cuisine et sa bouilloire, un chevalet, un fauteuil ocre pour lire, et la pluie sur la verrière si on veut.',
  dimmedBy: 'cloud',
  sky: { day: ['#eef0f2', '#d9dee6', '#bcc6d4'], night: ['#222949', '#161b36', '#0c0f24'] },
  light: {
    hemi: { sky: [0xf4f2ee, 0x5a62a8], ground: [0xc0a888, 0x2a2440], intensity: [0.66, 0.38] },
    sun: { color: [0xfff0dc, 0x9fb0ff], intensity: [0.52, 0.22] },
  },
  loops: {},
  playlist: [],
  objects: [
    { id: 'cloud', target: 'rain', label: 'Nuage · pluie', anchor: [1.3, 5.75, -3.85] },
    { id: 'radio', target: 'radio', label: 'Tourne-disque · lofi', anchor: [2.25, 1.05, -2.5] },
    { id: 'pencil', target: 'pencil', label: 'Table à dessin · crayon', anchor: [0.1, 1.55, -2.0] },
    { id: 'keyboard', target: 'keys', label: 'Clavier · on écrit', anchor: [-2.2, 1.2, -1.1] },
    { id: 'kettle', target: 'kettle', label: 'Bouilloire · thé', anchor: [-2.6, 1.45, 0.95] },
    { id: 'lamp', target: 'night', label: 'Lampe · jour / nuit', anchor: [0.65, 2.05, -1.95] },
  ],
  sounds: [
    { id: 'radio', name: 'Vinyle lofi', chip: 'var(--c-radio)', volume: 0.7, sub: (s) => (s.on.radio && s.onAir) || 'lofi · 72 bpm' },
    { id: 'rain', name: 'Pluie', chip: 'var(--c-rain)', volume: 0.7, sub: () => 'sur la verrière' },
    { id: 'pencil', name: 'Crayon', chip: 'var(--c-pencil)', volume: 0.5, sub: () => 'sur le papier' },
    { id: 'keys', name: 'Clavier', chip: 'var(--c-keys)', volume: 0.45, sub: () => 'quelqu’un écrit' },
    { id: 'kettle', name: 'Bouilloire', chip: 'var(--c-kettle)', volume: 0.5, sub: () => 'une tasse de thé' },
  ],
}
