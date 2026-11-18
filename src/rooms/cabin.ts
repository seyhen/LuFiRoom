import { radioSub } from '../audio/stations'
import { PLAYLIST } from './playlist'
import type { Room } from './types'
import { WEATHER_LOOPS } from './weather'

// La cabane de Noël sous la neige : un feu qui crépite, le vent dehors, le chat qui ronronne, le chien qui ronfle sur le tapis, la radio. Les enregistrements sont à déclarer dans `loops`
// (feu, vent) et `playlist` (docs/ASSETS.md) ; sources et licences : public/audio/CREDITS.md.

export const cabin: Room = {
  id: 'cabin',
  name: 'Cabane',
  description:
    'Cabane de Noël sous la neige en 3D isométrique : cheminée avec un feu et des chaussettes, sapin décoré et cadeaux, fauteuil sur un tapis tressé, chat endormi sur une peau de mouton, chien endormi sur le tapis, chocolat chaud, coffre avec une radio, lampe champignon, bougies à la fenêtre sur la neige.',
  // Dedans, tout est chaud : l'interface prend la teinte de la pièce (canneberge le jour, ambre la nuit), le dehors reste froid.
  ui: {
    accent: ['#b8405a', '#ffb066'],
    ink: ['#4a2b2d', '#fff1e4'],
    'ink-soft': ['#85605f', '#dcb9a4'],
    panel: ['rgba(255, 250, 244, .8)', 'rgba(46, 26, 30, .8)'],
    line: ['rgba(120, 70, 60, .16)', 'rgba(255, 210, 170, .17)'],
    bg: ['#f5eae0', '#26181d'],
  },
  // la cabane est dans une clairière enneigée (sapins, abri à bois, bonhomme de neige) : on recule pour la voir
  zoom: 0.82,
  sky: { day: ['#f3f7fc', '#dce7f3', '#bdd0e4'], night: ['#27315f', '#181e44', '#0d1129'] },
  // Dedans, une lumière chaude (miel le jour, prune la nuit) ; la lune reste froide, pour que le feu et les bougies réchauffent.
  light: {
    hemi: { sky: [0xfff5ea, 0x75609a], ground: [0xd9c2b2, 0x35233c], intensity: [0.62, 0.42] },
    sun: { color: [0xfff4e8, 0x9fb2ff], intensity: [0.6, 0.26] },
  },
  // Gains calés sur le niveau de sortie de la synthèse (mesuré à ±1 dB) : un point de départ, à régler à l'oreille.
  loops: {
    ...WEATHER_LOOPS,
    rain: { src: 'audio/cafe/rain', gain: 0.8 }, // la pluie du café, un peu plus bas qu'ailleurs : la cabane est petite et close
    fire: { src: 'audio/cabin/fire', gain: 0.5 },
    wind: { src: 'audio/cabin/wind', gain: 0.7 },
    purr: { src: 'audio/cabin/purr', gain: 0.36 },
    knit: { src: 'audio/cabin/knit', gain: 0.8 },
    owl: { src: 'audio/cabin/owl', gain: 0.7 },
  },
  // Le tourne-disque joue d'abord le disque de Noël, puis les stations les plus douces.
  stations: ['noel', 'veillee', 'minuit', 'nuit-douce'],
  playlist: PLAYLIST,
  presets: {
    work: { sounds: [['radio',.6], ['fire',.35], ['knit',.25]] },
    read: { sounds: [['fire',.55], ['knit',.3], ['radio',.3], ['purr',.3]] },
    sleep: { sounds: [['fire',.4], ['wind',.4], ['owl',.2], ['purr',.3], ['snore',.25]], night: true },
  },
  objects: [
    { id: 'fireplace', target: 'fire', label: 'Cheminée · feu', anchor: [-1.9, 1.05, -2.25] },
    { id: 'cat', target: 'purr', label: 'Chat · ronron', anchor: [-1.5, 0.3, -1.15] },
    { id: 'dog', target: 'snore', label: 'Chien · il ronfle', anchor: [-0.45, 0.32, 0.55] },
    { id: 'turntable', target: 'radio', label: 'Tourne-disque · lofi', anchor: [1.9, 1.05, -2.6] },
    { id: 'window', target: 'wind', label: 'Fenêtre · le vent', anchor: [1.4, 3.35, -3.0] },
    { id: 'lamp', target: 'night', label: 'Lampe · jour / nuit', anchor: [1.55, 0.92, -0.73] },
    { id: 'knit', target: 'knit', label: 'Panier de tricot · les aiguilles', anchor: [-0.2, 0.5, 1.6] },
    // hors de la cabane : le hibou sur son chicot, au bord du sentier
    { id: 'owl', target: 'owl', label: 'Hibou · la forêt de nuit', anchor: [7.4, 1.75, 2.6] },
  ],
  sounds: [
    { id: 'fire', name: 'Feu de bois', chip: 'var(--c-fire)', volume: 0.7, sub: (s) => (s.on.fire ? 'ça crépite' : 'cheminée') },
    { id: 'wind', name: 'Vent', chip: 'var(--c-wind)', volume: 0.6, sub: (s) => (s.night ? 'tempête' : 'rafales') },
    { id: 'radio', name: 'Tourne-disque', chip: 'var(--c-radio)', icon: 'vinyl', skip: 'Disque suivant', volume: 0.75, sub: radioSub(PLAYLIST.length) },
    { id: 'knit', name: 'Tricot', chip: 'var(--c-knit)', volume: 0.45, sub: () => 'les aiguilles de bois' },
    { id: 'owl', name: 'Hibou', chip: 'var(--c-owl)', volume: 0.4, sub: () => 'sur son chicot, dans la clairière' },
    { id: 'purr', name: 'Ronron', chip: 'var(--c-cat)', volume: 0.7, sub: () => 'près du feu' },
    { id: 'snore', name: 'Chien endormi', chip: 'var(--c-snore)', volume: 0.4, sub: () => 'il ronfle doucement' },
    { id: 'rain', name: 'Météo', chip: 'var(--c-rain)', volume: 0.6, sub: () => 'contre les rondins' },
    { id: 'noise', name: 'Bruit', chip: 'var(--c-noise)', volume: 0.4, sub: () => 'souffle continu' },
  ],
}
