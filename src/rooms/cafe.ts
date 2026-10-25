import { radioSub } from '../audio/stations'
import { PLAYLIST } from './playlist'
import type { Room } from './types'

// Un café-librairie d'Édimbourg sous la pluie : coin du feu, murs de livres. Les enregistrements sont à déclarer dans `loops`
// (street, murmur, espresso, pages, fire, rain) et `playlist` (docs/ASSETS.md) ; sources et licences : public/audio/CREDITS.md.

export const cafe: Room = {
  id: 'cafe',
  name: 'Café',
  description:
    "Café-librairie de la vieille ville d'Édimbourg, un jour de pluie, en 3D isométrique : cheminée victorienne et son feu, " +
    'fauteuil à oreilles en tartan, skye terrier endormi sur son coussin, murs de livres avec leur échelle, lampe de banquier, ' +
    "comptoir avec une machine à café, deux clients autour d'une théière à la fenêtre, et dehors, sous la pluie, " +
    'le Château, les toits de la vieille ville et un réverbère.',
  dimmedBy: 'cloud',
  storm: 'rain',
  // Dehors gris et froid ; la lumière chaude vient du dedans (feu, guirlande, lampe), pas du ciel.
  ui: {
    accent: ['#2f6b58', '#f2c46b'],
    ink: ['#24302b', '#fff4e0'],
    'ink-soft': ['#5f6f66', '#d8c8a8'],
    panel: ['rgba(250, 247, 238, .82)', 'rgba(28, 34, 30, .82)'],
    line: ['rgba(40, 70, 55, .16)', 'rgba(242, 196, 107, .18)'],
    bg: ['#e6e9e4', '#151c1a'],
  },
  sky: { day: ['#e3e7ec', '#c6ced8', '#a3afbd'], night: ['#232a47', '#151a31', '#0b0f21'] },
  light: {
    hemi: { sky: [0xe8ebf0, 0x4d548f], ground: [0xa89a8e, 0x2a2340], intensity: [0.6, 0.36] },
    sun: { color: [0xe9eefa, 0x8ea2e8], intensity: [0.42, 0.2] },
  },
  loops: {
    murmur: { src: 'audio/cafe/murmur', gain: 0.8 },
    espresso: { src: 'audio/cafe/espresso', gain: 0.8 },
    pages: { src: 'audio/cafe/pages', gain: 0.8 },
    street: { src: 'audio/cafe/street', gain: 0.7 },
    rain: { src: 'audio/cafe/rain', gain: 1 },
    fire: { src: 'audio/cafe/fire', gain: 0.8 },
    drip: { src: 'audio/cafe/drip', gain: 0.8 },
  },
  stations: ['pluie-fine', 'soleil-bas', 'brume', 'veillee'],
  playlist: PLAYLIST,
  presets: {
    work: { sounds: [['radio',.5], ['murmur',.4], ['rain',.35], ['espresso',.2]] },
    read: { sounds: [['pages',.4], ['rain',.5], ['drip',.2], ['fire',.35], ['radio',.3]] },
    sleep: { sounds: [['rain',.6], ['drip',.2], ['fire',.35]], night: true },
  },
  objects: [
    { id: 'cloud', target: 'rain', label: 'Nuage · pluie', anchor: [1.35, 5.2, -3.85] },
    { id: 'window', target: 'street', label: 'Fenêtre · la rue', anchor: [1.4, 3.35, -3.0] },
    { id: 'radio', target: 'radio', label: 'Jukebox · lofi', anchor: [-0.45, 1.3, -2.53] },
    { id: 'espresso', target: 'espresso', label: 'Machine à café · expresso', anchor: [-1.85, 1.6, -2.5] },
    { id: 'guests', target: 'murmur', label: 'Clients · conversations', anchor: [1.4, 1.55, -2.2] },
    { id: 'fireplace', target: 'fire', label: 'Cheminée · feu', anchor: [-2.45, 1.0, 0] },
    { id: 'books', target: 'pages', label: 'Bibliothèque · pages', anchor: [-2.55, 2.6, 1.85] },
    { id: 'lamp', target: 'night', label: 'Lampe · jour / nuit', anchor: [-0.42, 1.0, -0.81] },
    { id: 'drip', target: 'drip', label: 'Manteau mouillé · gouttes', anchor: [3.0, 1.15, 1.14] },
  ],
  sounds: [
    { id: 'radio', name: 'Jukebox lofi', chip: 'var(--c-radio)', volume: 0.7, sub: radioSub(PLAYLIST.length) },
    { id: 'rain', name: 'Pluie', chip: 'var(--c-rain)', volume: 0.7, sub: (s) => (s.on.street ? 'vitre ouverte' : 'vitre fermée') },
    { id: 'fire', name: 'Feu de bois', chip: 'var(--c-fire)', volume: 0.7, sub: (s) => (s.on.fire ? 'ça crépite' : 'cheminée') },
    { id: 'street', name: 'La rue', chip: 'var(--c-street)', volume: 0.45, sub: (s) => (s.night ? 'bus dans la nuit' : 'voitures sur le pavé') },
    { id: 'murmur', name: 'Brouhaha', chip: 'var(--c-murmur)', volume: 0.5, sub: () => 'conversations' },
    { id: 'espresso', name: 'Expresso', chip: 'var(--c-espresso)', volume: 0.5, sub: () => 'vapeur et tasses' },
    { id: 'drip', name: 'Gouttes', chip: 'var(--c-drip)', volume: 0.45, sub: () => 'le manteau qui s’égoutte' },
    { id: 'pages', name: 'Pages', chip: 'var(--c-pages)', volume: 0.55, sub: () => 'bibliothèque, tic-tac' },
  ],
}
