import { radioSub } from '../audio/stations'
import { PLAYLIST } from './playlist'
import type { Room } from './types'
import { WEATHER_LOOPS } from './weather'

// Une serre victorienne un soir de pluie. Sons nouveaux (le chœur de grenouilles du bassin, la boîte à musique, le tonneau d'eau de
// pluie) synthétisés pour l'instant : leurs enregistrements se déclareront dans `loops` (docs/ASSETS.md), sources et licences dans
// public/audio/CREDITS.md.

export const greenhouse: Room = {
  id: 'greenhouse',
  name: 'Serre',
  description:
    'Une serre victorienne un soir de pluie, en 3D isométrique : une charpente de fonte verte et des vitres embuées, un carrelage ' +
    'ancien, un phonographe à pavillon de laiton sur une table de rotin, un bassin de nénuphars où chante une grenouille, une boîte ' +
    'à musique sur la table de lecture près d’un fauteuil d’osier, un tonneau d’eau de pluie sous la gouttière, une paillasse de ' +
    'rempotage, des palmiers, des fougères, un citronnier en pot, des suspensions fleuries, et le jardin dans la brume derrière le verre.',
  ui: {
    accent: ['#2f7a5c', '#9fe0b8'],
    ink: ['#1f3a30', '#e8f6ec'],
    'ink-soft': ['#587468', '#a8c8b6'],
    panel: ['rgba(244, 250, 242, .85)', 'rgba(10, 26, 20, .84)'],
    line: ['rgba(47, 122, 92, .16)', 'rgba(159, 224, 184, .18)'],
    bg: ['#dfeadb', '#08170f'],
  },
  // la serre est au milieu d'un jardin (haies, arbres, une maison au fond) : on recule pour le voir
  zoom: 0.86,
  sky: { day: ['#eef4e8', '#d3e3cf', '#a9c5b0'], night: ['#1d3330', '#112420', '#07130f'] },
  light: {
    hemi: { sky: [0xf4fbe8, 0x6a9a88], ground: [0xc6d8b4, 0x3e4a38], intensity: [0.7, 0.4] },
    sun: { color: [0xfff4d6, 0xb4d2dc], intensity: [0.5, 0.16] },
  },
  loops: {
    ...WEATHER_LOOPS,
  },
  stations: ['rosee', 'pluie-fine', 'brume', 'petit-matin'],
  playlist: PLAYLIST,
  presets: {
    work: { sounds: [['radio', 0.5], ['rainbarrel', 0.3], ['rain', 0.35]] },
    read: { sounds: [['musicbox', 0.3], ['frogs', 0.25], ['rain', 0.4]] },
    sleep: { sounds: [['frogs', 0.4], ['rainbarrel', 0.3], ['musicbox', 0.2], ['rain', 0.4]], night: true },
  },
  objects: [
    { id: 'radio', target: 'radio', label: 'Phonographe · lofi', anchor: [-2.0, 1.25, 1.9] },
    { id: 'pond', target: 'frogs', label: 'Bassin · les grenouilles', anchor: [1.3, 0.4, -1.3] },
    { id: 'musicbox', target: 'musicbox', label: 'Boîte à musique · la berceuse', anchor: [1.9, 0.95, 1.5] },
    { id: 'barrel', target: 'rainbarrel', label: 'Tonneau · l’eau de la gouttière', anchor: [-2.35, 1.0, -2.35] },
    { id: 'lamp', target: 'night', label: 'Lanterne · jour / nuit', anchor: [0.2, 1.3, -0.2] },
  ],
  sounds: [
    { id: 'radio', name: 'Phonographe', chip: 'var(--c-radio)', icon: 'vinyl', skip: 'Rouleau suivant', volume: 0.7, sub: radioSub(PLAYLIST.length) },
    { id: 'frogs', name: 'Grenouilles', chip: 'var(--c-frogs)', volume: 0.45, sub: () => 'le chœur du bassin' },
    { id: 'musicbox', name: 'Boîte à musique', chip: 'var(--c-musicbox)', volume: 0.4, sub: () => 'une berceuse douce' },
    { id: 'rainbarrel', name: 'Tonneau', chip: 'var(--c-rainbarrel)', volume: 0.45, sub: () => 'l’eau de la gouttière' },
    { id: 'rain', name: 'Météo', chip: 'var(--c-rain)', volume: 0.6, sub: () => 'sur le verre' },
  ],
}
