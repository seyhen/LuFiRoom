import { radioSub } from '../audio/stations'
import { PLAYLIST } from './playlist'
import type { Room } from './types'
import { WEATHER_LOOPS } from './weather'

// Une oasis du désert, au bord d'une petite mare : un campement de pierre et de toile adossé à deux murs de pisé, un auvent de
// toile rayée tendu sur deux perches, des tapis posés les uns sur les autres, des coussins, un plateau de cuivre et sa théière, un oud
// sur un coussin, une lanterne de laiton ajouré qui jette des étoiles sur la toile ; la mare entre les rochers et les roseaux, un
// grand palmier dattier, et autour les dunes dorées, un petit bosquet, un ksar de terre au loin et un dromadaire accroupi. Sons
// nouveaux (le vent des dunes, les palmes, la source de la mare, les clochettes de la caravane du dromadaire) enregistrés
// (`loops`, docs/ASSETS.md) ; sources et licences dans public/audio/CREDITS.md. La météo (carte « Météo », rare au désert) et la
// carte « Bruit » sont celles de toutes les pièces.

export const oasis: Room = {
  id: 'oasis',
  name: 'Oasis',
  description:
    'Une oasis du désert, en 3D isométrique : un campement de pierre et de toile au bord d’une petite mare, deux murs de pisé dont un percé d’une arche sur les dunes, un auvent de toile rayée tendu sur des perches, des tapis posés les uns sur les autres avec des coussins, un plateau de cuivre avec sa théière et ses verres, un oud sur un coussin, une lanterne de laiton ajouré, la mare entre les rochers et les roseaux, un grand palmier dattier, et dehors les dunes dorées, un bosquet de palmiers, un village de terre au loin et un dromadaire accroupi, sous un ciel de désert plein d’étoiles la nuit.',
  // Le jour est un ciel bleu de désert sur des dunes d’or ; la nuit, un indigo plein d’étoiles et l’ambre de la lanterne : l'interface suit la terre cuite et l'indigo.
  ui: {
    accent: ['#b0502a', '#f0b25a'],
    ink: ['#4a2c20', '#f6ead2'],
    'ink-soft': ['#85604a', '#d2bf9a'],
    panel: ['rgba(252, 242, 222, .84)', 'rgba(17, 21, 46, .84)'],
    line: ['rgba(140, 84, 46, .18)', 'rgba(255, 214, 150, .17)'],
    bg: ['#efdcb8', '#0d1230'],
  },
  // le campement est au milieu des dunes : on recule pour les voir
  zoom: 0.85,
  sky: { day: ['#e2f1ef', '#b4dbe6', '#86bfd8'], night: ['#212d63', '#121b45', '#070b24'] },
  // Un soleil sec et chaud ; la lune est bleue, elle fait ressortir la lanterne.
  light: {
    hemi: { sky: [0xfff1d6, 0x5a6ca8], ground: [0xe3bd82, 0x3a3354], intensity: [0.66, 0.42] },
    sun: { color: [0xffefcf, 0x9fb6ee], intensity: [0.62, 0.22] },
  },
  shelter: 'open',
  loops: {
    ...WEATHER_LOOPS,
    // un vent léger et régulier sur le désert, quelques grillons au loin (Freesound 454361, CC0)
    dunes: { src: 'audio/oasis/dunes', gain: 0.8 },
    // le vent dans les palmes (Pixabay 143053, dennish18)
    palms: { src: 'audio/oasis/palms', gain: 0.75 },
    // un petit filet d'eau (Pixabay 252505, kuzu420)
    oasis: { src: 'audio/oasis/oasis', gain: 0.9 },
    // de petites clochettes au vent (Pixabay 22872)
    caravan: { src: 'audio/oasis/caravan', gain: 0.5 },
  },
  stations: ['soleil-bas', 'minuit', 'veillee', 'brume'],
  playlist: PLAYLIST,
  presets: {
    work: { sounds: [['radio', 0.5], ['dunes', 0.3], ['oasis', 0.2]] },
    read: { sounds: [['oasis', 0.35], ['palms', 0.3], ['radio', 0.25], ['caravan', 0.2]] },
    sleep: { sounds: [['dunes', 0.4], ['palms', 0.25], ['oasis', 0.3]], night: true },
  },
  objects: [
    { id: 'radio', target: 'radio', label: 'Oud · lofi', anchor: [-1.4, 0.45, 1.35] },
    { id: 'awning', target: 'dunes', label: 'Auvent · le vent des dunes', anchor: [-2.2, 2.2, -1.7] },
    { id: 'datepalm', target: 'palms', label: 'Palmier · les palmes', anchor: [2.7, 1.9, -2.5] },
    { id: 'waterhole', target: 'oasis', label: 'Mare · la source', anchor: [1.6, 0.2, -0.7] },
    { id: 'lamp', target: 'night', label: 'Lanterne · jour / nuit', anchor: [-0.35, 1.3, -1.7] },
    { id: 'camel', target: 'caravan', label: 'Dromadaire · les clochettes', anchor: [5.4, 0.7, -0.4] },
  ],
  sounds: [
    { id: 'radio', name: 'Oud', chip: 'var(--c-radio)', volume: 0.7, sub: radioSub(PLAYLIST.length) },
    { id: 'dunes', name: 'Dunes', chip: 'var(--c-dunes)', volume: 0.45, sub: () => 'le vent sur le sable' },
    { id: 'palms', name: 'Palmier', chip: 'var(--c-palms)', volume: 0.4, sub: () => 'les palmes dans la brise' },
    { id: 'oasis', name: 'Mare', chip: 'var(--c-oasis)', volume: 0.45, sub: () => 'la source qui clapote' },
    { id: 'caravan', name: 'Caravane', chip: 'var(--c-caravan)', volume: 0.4, sub: () => 'les clochettes au pas lent' },
    { id: 'rain', name: 'Météo', chip: 'var(--c-rain)', volume: 0.6, sub: () => 'sur les dunes' },
    { id: 'noise', name: 'Bruit', chip: 'var(--c-noise)', volume: 0.4, sub: () => 'souffle continu' },
  ],
}
