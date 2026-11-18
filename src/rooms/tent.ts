import { radioSub } from '../audio/stations'
import { PLAYLIST } from './playlist'
import type { Room } from './types'
import { WEATHER_LOOPS } from './weather'

// Une tente de camping un soir de pluie, dans la forêt : une grande tente-cloche de toile ecru, un mât au milieu, une lampe à pétrole
// qui ambre la toile, un duvet, un réchaud et son percolateur, un ukulélé sur une caisse, un bocal de lucioles. Sons nouveaux (la pluie
// sur la toile, le percolateur, les grillons) synthétisés pour l'instant : leurs enregistrements se déclareront dans `loops`
// (docs/ASSETS.md), sources et licences dans public/audio/CREDITS.md. La pluie de la carte « Météo » et la carte « Bruit » sont celles
// de toutes les pièces.

export const tent: Room = {
  id: 'tent',
  name: 'Tente',
  description:
    'Une tente de camping un soir de pluie, en 3D isométrique : une grande tente-cloche de toile ecru sur son mât, ouverte vers nous, une lampe à pétrole suspendue qui dore la toile, un sac de couchage matelassé sur son matelas avec un livre et une lampe frontale, un ukulélé posé sur une caisse, un réchaud de camping avec son percolateur d’émail bleu sur une table pliante, un bocal de lucioles sur un rondin, des bottes boueuses, un ciré jaune qui sèche, un sac à dos, une guirlande de fanions, et la forêt de sapins dehors sous la pluie.',
  // Dedans, la toile est chaude (kaki, ocre, ambre de la lampe), dehors la forêt est froide : l'interface suit la toile.
  ui: {
    accent: ['#9a6a24', '#ffc15e'],
    ink: ['#3d3220', '#f7edd8'],
    'ink-soft': ['#7b6c4e', '#cdbf9d'],
    panel: ['rgba(250, 244, 230, .84)', 'rgba(30, 27, 18, .84)'],
    line: ['rgba(120, 96, 46, .18)', 'rgba(255, 224, 160, .17)'],
    bg: ['#e9e1cb', '#14170f'],
  },
  // la tente est au milieu d'une pinède (sapins, fougères, un feu éteint) : on recule pour la voir
  zoom: 0.84,
  sky: { day: ['#e6ece0', '#c5d3c8', '#9db2a6'], night: ['#1f2d30', '#121d21', '#080f12'] },
  // Dedans, une lumière de toile (crème le jour, ambre la nuit : la lampe fait le reste) ; la lune reste froide.
  light: {
    hemi: { sky: [0xeef2e2, 0x4d6272], ground: [0xd2c4a0, 0x3d2f22], intensity: [0.64, 0.4] },
    sun: { color: [0xfff1d8, 0x9fb4d0], intensity: [0.5, 0.2] },
  },
  loops: {
    ...WEATHER_LOOPS,
  },
  stations: ['rosee', 'veillee', 'pluie-fine', 'nuit-douce'],
  playlist: PLAYLIST,
  presets: {
    work: { sounds: [['radio', 0.5], ['canvas', 0.3], ['percolator', 0.2]] },
    read: { sounds: [['canvas', 0.4], ['percolator', 0.2], ['radio', 0.25], ['rain', 0.3]] },
    sleep: { sounds: [['canvas', 0.4], ['crickets', 0.3], ['rain', 0.35]], night: true },
  },
  objects: [
    { id: 'radio', target: 'radio', label: 'Ukulélé · lofi', anchor: [-0.35, 0.68, 2.05] },
    { id: 'canvas', target: 'canvas', label: 'Toile · la pluie dessus', anchor: [-1.8, 2.3, -0.62] },
    { id: 'percolator', target: 'percolator', label: 'Percolateur · le café', anchor: [1.41, 0.92, -1.6] },
    { id: 'fireflies', target: 'crickets', label: 'Bocal de lucioles · les grillons', anchor: [2.0, 0.62, 0.95] },
    { id: 'lamp', target: 'night', label: 'Lampe à pétrole · jour / nuit', anchor: [0.34, 1.9, 0.34] },
  ],
  sounds: [
    { id: 'radio', name: 'Ukulélé', chip: 'var(--c-radio)', volume: 0.7, sub: radioSub(PLAYLIST.length) },
    { id: 'canvas', name: 'Toile', chip: 'var(--c-canvas)', volume: 0.45, sub: () => 'la pluie qui tambourine' },
    { id: 'percolator', name: 'Percolateur', chip: 'var(--c-percolator)', volume: 0.4, sub: () => 'le café qui glougloute' },
    { id: 'crickets', name: 'Grillons', chip: 'var(--c-crickets)', volume: 0.35, sub: () => 'dans les fougères, dehors' },
    { id: 'rain', name: 'Météo', chip: 'var(--c-rain)', volume: 0.6, sub: () => 'dans les sapins' },
    { id: 'noise', name: 'Bruit', chip: 'var(--c-noise)', volume: 0.4, sub: () => 'souffle continu' },
  ],
}
