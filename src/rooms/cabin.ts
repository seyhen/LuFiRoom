import type { Room } from './types'

// La cabane sous la neige : un feu qui crépite, le vent dehors, la radio. Les enregistrements sont à déclarer dans `loops`
// (feu, vent) et `playlist` (docs/ASSETS.md) ; sources et licences : public/audio/CREDITS.md.

export const cabin: Room = {
  id: 'cabin',
  name: 'Cabane',
  description:
    'Chalet de rondins sous la neige, en 3D isométrique : neige sur le toit et glaçons, cheminée de pierres de rivière et sa guirlande de sapin, ' +
    'un husky qui dort devant le feu sur un tapis à carreaux, un fauteuil et son plaid, deux chocolats chauds, une lampe-tempête, ' +
    'des chaussettes qui sèchent, des raquettes et des skis, une luge, un petit sapin, la tempête à la fenêtre.',
  sky: { day: ['#f3f7fc', '#dce7f3', '#bdd0e4'], night: ['#27315f', '#181e44', '#0d1129'] },
  light: {
    hemi: { sky: [0xf4f8ff, 0x5d6fb8], ground: [0xb7c4dc, 0x23284a], intensity: [0.62, 0.42] },
    sun: { color: [0xf3f6ff, 0x9fb2ff], intensity: [0.6, 0.28] },
  },
  loops: {},
  playlist: [],
  objects: [
    { id: 'fireplace', target: 'fire', label: 'Cheminée · feu', anchor: [-1.9, 1.15, -2.25] },
    { id: 'radio', target: 'radio', label: 'Radio · lofi', anchor: [1.95, 1.42, -2.6] },
    { id: 'window', target: 'wind', label: 'Fenêtre · vent', anchor: [1.4, 3.35, -3.0] },
    { id: 'lamp', target: 'night', label: 'Lampe-tempête · jour / nuit', anchor: [1.25, 1.45, -1.85] },
  ],
  sounds: [
    { id: 'fire', name: 'Feu de bois', chip: 'var(--c-fire)', volume: 0.7, sub: (s) => (s.on.fire ? 'ça crépite' : 'cheminée') },
    { id: 'wind', name: 'Vent', chip: 'var(--c-wind)', volume: 0.6, sub: (s) => (s.night ? 'tempête' : 'rafales') },
    { id: 'radio', name: 'Radio lofi', chip: 'var(--c-radio)', volume: 0.75, sub: (s) => (s.on.radio && s.onAir) || 'lofi · 72 bpm' },
  ],
}
