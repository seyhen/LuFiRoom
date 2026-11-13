import { radioSub } from '../audio/stations'
import { PLAYLIST } from './playlist'
import type { Room } from './types'
import { WEATHER_LOOPS } from './weather'

// Une laverie automatique de quartier, à 2 h du matin, sous la pluie. Sons à elle : lave-linge, sèche-linge (enregistrés), rinçage
// (le clapotis de l'eau dans le tambour) et gouttière (l'eau de pluie dans le tuyau), ces deux-là synthétisés pour l'instant : leurs
// enregistrements se déclareront dans `loops` (docs/ASSETS.md), sources et licences dans public/audio/CREDITS.md.

export const laundromat: Room = {
  id: 'laundromat',
  name: 'Laverie de nuit',
  description:
    'Une laverie automatique de quartier à deux heures du matin, en 3D isométrique : une rangée de lave-linge à hublot où tourne ' +
    'du linge de couleur, une colonne de sèche-linge, un radiocassette posé sur une machine, une grande table pour plier le linge, ' +
    'un distributeur de lessive et de monnaie, un banc de plastique où un client s’est assoupi, un chat endormi dans un panier de ' +
    'linge chaud, le comptoir du pressing et sa lampe, et par la vitrine, la rue sous la pluie.',
  ui: {
    accent: ['#2a63b8', '#8fdcff'],
    ink: ['#1b3040', '#e8f6ff'],
    'ink-soft': ['#56707e', '#a6c4d4'],
    panel: ['rgba(242, 250, 247, .85)', 'rgba(10, 24, 32, .84)'],
    line: ['rgba(40, 100, 90, .16)', 'rgba(143, 220, 255, .18)'],
    bg: ['#dcefe8', '#08151d'],
  },
  // la laverie est au coin d'une rue (trottoir, réverbère, immeubles voisins) : on recule pour la voir
  zoom: 0.86,
  sky: { day: ['#eef6f3', '#cfe5df', '#a8c8c4'], night: ['#1c3644', '#10222e', '#060f17'] },
  light: {
    hemi: { sky: [0xf2fbff, 0x6a88b8], ground: [0xc4d8d0, 0x4a4450], intensity: [0.68, 0.4] },
    sun: { color: [0xfff4e6, 0xb8d0ff], intensity: [0.5, 0.16] },
  },
  loops: {
    ...WEATHER_LOOPS,
    // le lave-linge et le sèche-linge : deux enregistrements doux et étouffés, gardés bas (voir public/audio/CREDITS.md)
    wash: { src: 'audio/laundromat/wash', gain: 0.5 },
    tumble: { src: 'audio/laundromat/tumble', gain: 0.5 },
  },
  stations: ['veillee', 'minuit', 'pluie-fine', 'nuit-douce'],
  playlist: PLAYLIST,
  presets: {
    work: { sounds: [['radio', 0.5], ['tumble', 0.35], ['rain', 0.35]] },
    read: { sounds: [['wash', 0.4], ['gutter', 0.25], ['rain', 0.4], ['radio', 0.25]] },
    sleep: { sounds: [['rinse', 0.45], ['gutter', 0.2], ['rain', 0.4]], night: true },
  },
  objects: [
    { id: 'radio', target: 'radio', label: 'Radiocassette · lofi', anchor: [-2.56, 1.13, 1.22] },
    { id: 'washer', target: 'wash', label: 'Lave-linge · le tambour', anchor: [-2.2, 0.55, -0.55] },
    { id: 'dryer', target: 'tumble', label: 'Sèche-linge · le linge chaud', anchor: [-2.2, 1.35, -2.5] },
    { id: 'rinse', target: 'rinse', label: 'Lave-linge · le rinçage', anchor: [-2.2, 0.55, -1.45] },
    { id: 'gutter', target: 'gutter', label: 'Gouttière · l’eau du tuyau', anchor: [-1.0, 1.9, -2.9] },
    { id: 'lamp', target: 'night', label: 'Lampe du comptoir · jour / nuit', anchor: [2.5, 1.25, 1.55] },
  ],
  sounds: [
    { id: 'radio', name: 'Radiocassette', chip: 'var(--c-radio)', volume: 0.7, sub: radioSub(PLAYLIST.length) },
    { id: 'wash', name: 'Lave-linge', chip: 'var(--c-wash)', volume: 0.55, sub: () => 'le tambour qui tourne' },
    { id: 'tumble', name: 'Sèche-linge', chip: 'var(--c-tumble)', volume: 0.5, sub: () => 'le linge chaud qui retombe' },
    { id: 'rinse', name: 'Rinçage', chip: 'var(--c-rinse)', volume: 0.5, sub: () => 'le clapotis dans le tambour' },
    { id: 'gutter', name: 'Gouttière', chip: 'var(--c-gutter)', volume: 0.5, sub: () => 'l’eau de pluie dans le tuyau' },
    { id: 'rain', name: 'Météo', chip: 'var(--c-rain)', volume: 0.6, sub: () => 'contre la vitrine' },
    { id: 'noise', name: 'Bruit', chip: 'var(--c-noise)', volume: 0.4, sub: () => 'souffle continu' },
  ],
}
