import { radioSub } from '../audio/stations'
import { PLAYLIST } from './playlist'
import type { Room } from './types'
import { WEATHER_LOOPS } from './weather'

// Une cabane perchée dans un grand chêne, en forêt, un soir d'été. Sons nouveaux (oiseaux de la forêt, ruisseau, feuilles, hamac,
// citronnade) synthétisés pour l'instant : leurs enregistrements se déclareront dans `loops` (docs/ASSETS.md), sources et licences
// dans public/audio/CREDITS.md.

export const treehouse: Room = {
  id: 'treehouse',
  name: 'Cabane perchée',
  description:
    'Une cabane perchée dans un grand chêne, en forêt, un soir d’été, en 3D isométrique : une plateforme de planches blondes que ' +
    'traverse le tronc, un toit de bardeaux sur le fond, un hamac rayé tendu entre le tronc et une branche, une malle de voyage ' +
    'où repose un banjo, des lanternes en bocal, un nichoir où chante un rouge-gorge, un pichet de citronnade, un carnet de naturaliste ' +
    'et des jumelles, des plantes qui sèchent, une échelle de corde, un écureuil roux sur le garde-corps ; tout autour le feuillage ' +
    'du chêne, et en contrebas la forêt et un ruisseau qui scintille.',
  ui: {
    accent: ['#5d8a35', '#e6d46a'],
    ink: ['#2c3420', '#f6f2da'],
    'ink-soft': ['#66704f', '#bfc6a2'],
    panel: ['rgba(252, 248, 232, .84)', 'rgba(16, 32, 28, .84)'],
    line: ['rgba(90, 120, 50, .18)', 'rgba(230, 212, 106, .18)'],
    bg: ['#f1ead0', '#0c1c1a'],
  },
  // un pont de corde mène à la vigie du chêne voisin : on recule un peu pour la voir
  zoom: 0.9,
  sky: { day: ['#fff3cf', '#f1dfa6', '#bcd3a0'], night: ['#1f3b3c', '#14292c', '#0a1618'] },
  light: {
    hemi: { sky: [0xfff2d4, 0x4e6e78], ground: [0x8f9c5a, 0x3e3626], intensity: [0.62, 0.38] },
    sun: { color: [0xffd79a, 0x9cc2d6], intensity: [0.62, 0.2] },
  },
  // un toit sur le fond, mais des côtés ouverts : on entend la pluie dans les feuilles, en plein air
  shelter: 'open',
  loops: {
    ...WEATHER_LOOPS,
  },
  stations: ['rosee', 'petit-matin', 'soleil-bas', 'veillee'],
  playlist: PLAYLIST,
  presets: {
    work: { sounds: [['radio', 0.55], ['leaves', 0.35], ['brook', 0.3]] },
    read: { sounds: [['hammock', 0.35], ['forest', 0.35], ['lemonade', 0.3], ['brook', 0.3]] },
    sleep: { sounds: [['leaves', 0.4], ['brook', 0.35], ['hammock', 0.3]], night: true },
  },
  objects: [
    { id: 'radio', target: 'radio', label: 'Banjo · lofi', anchor: [-1.1, 0.5, -2.1] },
    { id: 'birdhouse', target: 'forest', label: 'Nichoir · les oiseaux', anchor: [-2.34, 2.3, 1.9] },
    { id: 'hammock', target: 'hammock', label: 'Hamac · le balancement', anchor: [-2.36, 0.69, -0.06] },
    { id: 'lamp', target: 'night', label: 'Lanternes en bocal · jour / nuit', anchor: [1.15, 2.3, -1.42] },
    { id: 'oak', target: 'leaves', label: 'Le chêne · le vent dans les feuilles', anchor: [2.0, 4.7, -2.9] },
    { id: 'brook', target: 'brook', label: 'Ruisseau · l’eau en contrebas', anchor: [-2.6, -2.4, -7.9] },
    { id: 'lemonade', target: 'lemonade', label: 'Citronnade · les glaçons', anchor: [1.0, 0.95, 1.5] },
  ],
  sounds: [
    { id: 'radio', name: 'Banjo lofi', chip: 'var(--c-radio)', volume: 0.7, sub: radioSub(PLAYLIST.length) },
    { id: 'forest', name: 'Oiseaux', chip: 'var(--c-forest)', volume: 0.5, sub: (s) => (s.night ? 'la hulotte au loin' : 'le rouge-gorge et le pic') },
    { id: 'leaves', name: 'Feuillage', chip: 'var(--c-leaves)', volume: 0.55, sub: () => 'le chêne qui chuchote' },
    { id: 'brook', name: 'Ruisseau', chip: 'var(--c-brook)', volume: 0.5, sub: () => 'l’eau sur les galets' },
    { id: 'hammock', name: 'Hamac', chip: 'var(--c-hammock)', volume: 0.45, sub: () => 'on se laisse bercer' },
    { id: 'lemonade', name: 'Citronnade', chip: 'var(--c-lemonade)', volume: 0.45, sub: () => 'les glaçons qui tintent' },
    { id: 'rain', name: 'Météo', chip: 'var(--c-rain)', volume: 0.6, sub: () => 'dans les feuilles' },
  ],
}
