import { radioSub } from '../audio/stations'
import type { Room } from './types'

// La cabane de Noël sous la neige : un feu qui crépite, le vent dehors, le chat qui ronronne, la radio. Les enregistrements sont à déclarer dans `loops`
// (feu, vent) et `playlist` (docs/ASSETS.md) ; sources et licences : public/audio/CREDITS.md.

export const cabin: Room = {
  id: 'cabin',
  name: 'Cabane',
  description:
    'Cabane de Noël sous la neige en 3D isométrique : cheminée avec un feu et des chaussettes, sapin décoré et cadeaux, fauteuil sur un tapis tressé, chat endormi sur une peau de mouton, chocolat chaud, coffre avec une radio, lampe champignon, bougies à la fenêtre sur la neige.',
  // Dedans, tout est chaud : l'interface prend la teinte de la pièce (canneberge le jour, ambre la nuit), le dehors reste froid.
  ui: {
    accent: ['#b8405a', '#ffb066'],
    ink: ['#4a2b2d', '#fff1e4'],
    'ink-soft': ['#85605f', '#dcb9a4'],
    panel: ['rgba(255, 250, 244, .8)', 'rgba(46, 26, 30, .8)'],
    line: ['rgba(120, 70, 60, .16)', 'rgba(255, 210, 170, .17)'],
    bg: ['#f5eae0', '#26181d'],
  },
  sky: { day: ['#f3f7fc', '#dce7f3', '#bdd0e4'], night: ['#27315f', '#181e44', '#0d1129'] },
  // Dedans, une lumière chaude (miel le jour, prune la nuit) ; la lune reste froide, pour que le feu et les bougies réchauffent.
  light: {
    hemi: { sky: [0xfff5ea, 0x75609a], ground: [0xd9c2b2, 0x35233c], intensity: [0.62, 0.42] },
    sun: { color: [0xfff4e8, 0x9fb2ff], intensity: [0.6, 0.26] },
  },
  // Gains calés sur le niveau de sortie de la synthèse (mesuré à ±1 dB) : un point de départ, à régler à l'oreille.
  loops: {
    fire: { src: 'audio/cabin/fire', gain: 0.5 },
    wind: { src: 'audio/cabin/wind', gain: 0.7 },
    purr: { src: 'audio/bedroom/purr', gain: 0.5 },
  },
  // Le tourne-disque joue d'abord le disque de Noël, puis les stations les plus douces.
  stations: ['noel', 'veillee', 'brume', 'nuit-douce'],
  playlist: [],
  objects: [
    { id: 'fireplace', target: 'fire', label: 'Cheminée · feu', anchor: [-1.9, 1.3, -2.25] },
    { id: 'cat', target: 'purr', label: 'Chat · ronron', anchor: [-1.4, 0.58, -1.2] },
    { id: 'turntable', target: 'radio', label: 'Tourne-disque · lofi', anchor: [1.75, 1.3, -2.5] },
    { id: 'window', target: 'wind', label: 'Fenêtre · vent', anchor: [1.4, 3.35, -3.0] },
    { id: 'lamp', target: 'night', label: 'Lampe · jour / nuit', anchor: [1.05, 1.56, -1.7] },
  ],
  sounds: [
    { id: 'fire', name: 'Feu de bois', chip: 'var(--c-fire)', volume: 0.7, sub: (s) => (s.on.fire ? 'ça crépite' : 'cheminée') },
    { id: 'wind', name: 'Vent', chip: 'var(--c-wind)', volume: 0.6, sub: (s) => (s.night ? 'tempête' : 'rafales') },
    { id: 'radio', name: 'Tourne-disque', chip: 'var(--c-radio)', icon: 'vinyl', skip: 'Disque suivant', volume: 0.75, sub: radioSub(0) },
    { id: 'purr', name: 'Ronron', chip: 'var(--c-cat)', volume: 0.7, sub: () => 'près du feu' },
  ],
}
