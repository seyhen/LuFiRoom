import { radioSub } from '../audio/stations'
import { PLAYLIST } from './playlist'
import type { Room } from './types'
import { WEATHER_LOOPS } from './weather'

// Un vol long-courrier de nuit : une cabine aux sièges bleu nuit tissés de constellations, des hublots sur une mer de nuages que la lune éclaire,
// des lumières tamisées, un violoncelle sanglé à sa place, un casque et un plateau repas sur les tablettes.
// Sons nouveaux (le souffle grave des moteurs, la berceuse du violoncelle) synthétisés pour l'instant : leurs enregistrements se déclareront dans
// `loops` (docs/ASSETS.md), sources et licences dans public/audio/CREDITS.md. La météo de la carte « Météo » s'entend à travers le fuselage
// (`shelter: 'deep'`) ; la carte « Bruit » est celle de toutes les pièces.

export const airplane: Room = {
  id: 'airplane',
  name: 'Avion de nuit',
  description:
    'Une cabine d’avion de nuit en vol long-courrier, en 3D isométrique : deux rangées de sièges bleu nuit tissés de constellations contre le flanc, ' +
    'des hublots ovales sur une mer de nuages éclairée par la lune, une aurore lointaine et deux ailes avec leurs réacteurs et leurs feux de bout d’aile, des coffres à bagages ' +
    'et leurs bandeaux de lumière indigo, une lampe de lecture, un violoncelle ' +
    'sanglé sur son siège, un casque et une tablette de vol sur une tablette rabattue, un plateau repas avec son thé qui fume, ' +
    'un chariot de service, un rideau d’office, une porte de secours et des pastilles lumineuses le long du couloir.',
  // Bleu nuit des sièges, lueur ambre de la lampe de lecture : l'interface suit la cabine.
  ui: {
    accent: ['#4a62c2', '#a9bcff'],
    ink: ['#262f52', '#eaf0ff'],
    'ink-soft': ['#5f6a95', '#b3bfe6'],
    panel: ['rgba(244, 246, 253, .86)', 'rgba(16, 22, 46, .84)'],
    line: ['rgba(74, 98, 194, .16)', 'rgba(169, 188, 255, .17)'],
    bg: ['#dfe6f5', '#0d1226'],
  },
  // le flanc et l'aile s'étendent derrière la cabine : on recule pour voir la mer de nuages
  zoom: 0.86,
  sky: { day: ['#e0f0ff', '#a9d0f5', '#6ea4e0'], night: ['#222c5e', '#151d46', '#090d24'] },
  // Dedans, la lumière d'une cabine (blanche le jour, bleue et basse la nuit : les lampes font le reste).
  light: {
    hemi: { sky: [0xeaf2ff, 0x4a5aa0], ground: [0xd0cadc, 0x2c2c50], intensity: [0.72, 0.42] },
    sun: { color: [0xfff4e0, 0x8fa6ff], intensity: [0.55, 0.22] },
  },
  loops: {
    ...WEATHER_LOOPS,
    // le chaton reprend l'enregistrement du ronron de la chambre (une reprise voulue par le propriétaire)
    purr: { src: 'audio/bedroom/purr', gain: 1.25 }, // 0,45 le laissait 8,8 dB sous la médiane (audio:levels)
    // l'intérieur d'un avion en croisière (Freesound 680662, CC0)
    jet: { src: 'audio/airplane/jet', gain: 1.8 }, // mesuré par audio:levels (0,8 : 6,9 dB sous la médiane)
  },
  stations: ['minuit', 'nuit-douce', 'brume', 'rosee'],
  playlist: PLAYLIST,
  shelter: 'deep',
  skyLife: { bird: false },
  presets: {
    work: { sounds: [['radio', 0.5], ['jet', 0.3], ['lullaby', 0.15]] },
    read: { sounds: [['jet', 0.3], ['lullaby', 0.25], ['radio', 0.25], ['purr', 0.3]] },
    sleep: { sounds: [['jet', 0.4], ['lullaby', 0.3], ['rain', 0.2], ['purr', 0.25]], night: true },
  },
  objects: [
    { id: 'radio', target: 'radio', label: 'Casque · lofi', anchor: [1.52, 0.98, -0.74] },
    { id: 'porthole', target: 'jet', label: 'Hublot · les moteurs', anchor: [-1.7, 1.75, -2.9] },
    { id: 'cello', target: 'lullaby', label: 'Violoncelle · la berceuse', anchor: [0.8, 1.6, -2.3] },
    { id: 'lamp', target: 'night', label: 'Lampe de lecture · jour / nuit', anchor: [0.9, 3.04, -2.7] },
    { id: 'cat', target: 'purr', label: 'Chaton · ronron', anchor: [-1.28, 0.64, 2.5] },
    { id: 'ocarina', target: 'ocarina', label: 'Ocarina · une valse', anchor: [1.15, 0.6, 2.5] },
  ],
  sounds: [
    { id: 'radio', name: 'Casque lofi', chip: 'var(--c-radio)', volume: 0.7, sub: radioSub(PLAYLIST.length) },
    { id: 'jet', name: 'Moteurs', chip: 'var(--c-jet)', volume: 0.45, sub: () => 'le souffle grave des réacteurs' },
    { id: 'lullaby', name: 'Berceuse', chip: 'var(--c-lullaby)', volume: 0.4, sub: () => 'un violoncelle qui berce' },
    { id: 'ocarina', name: 'Ocarina', chip: 'var(--c-ocarina)', volume: 0.4, sub: () => 'une valse lente' },
    { id: 'purr', name: 'Ronron', chip: 'var(--c-cat)', volume: 0.5, sub: () => 'le chaton dans son sac' },
    { id: 'rain', name: 'Météo', chip: 'var(--c-rain)', volume: 0.6, sub: () => 'à travers le fuselage' },
    { id: 'noise', name: 'Bruit', chip: 'var(--c-noise)', volume: 0.4, sub: () => 'souffle continu' },
  ],
}
