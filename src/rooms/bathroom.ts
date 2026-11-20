import { radioSub } from '../audio/stations'
import { PLAYLIST } from './playlist'
import type { Room } from './types'
import { WEATHER_LOOPS } from './weather'

// Une salle de bain de rêve un soir de pluie fine : baignoire à pieds de lion pleine de mousse, carrelage pastel, fenêtre embuée sur une
// ville de colline. Sons nouveaux (le robinet de la baignoire, la mousse du bain, la douche à effet pluie) synthétisés pour l'instant :
// leurs enregistrements se déclareront dans `loops` (docs/ASSETS.md), sources et licences dans public/audio/CREDITS.md.

export const bathroom: Room = {
  id: 'bathroom',
  name: 'Salle de bain',
  description:
    'Une salle de bain pastel un soir de pluie fine, en 3D isométrique : une baignoire à pieds de lion bleu givré pleine de mousse rose ' +
    'où flotte un canard jaune, son robinet col de cygne et son plateau de bain (thé, livre, savon, succulente), une douche à effet ' +
    'pluie dans une niche de zellige rose, un lavabo sur colonne et son miroir ovale, un sèche-serviettes aux serviettes douces, un ' +
    'tabouret où repose un kalimba, une étagère de serviettes roulées, des bougies sur la tablette de la fenêtre en arche, des ' +
    'plantes partout, et par la vitre embuée, une ville de colline aux toits de tuiles.',
  ui: {
    accent: ['#c4567a', '#ffb3c8'],
    ink: ['#4a2c3a', '#fdeef0'],
    'ink-soft': ['#7a5a68', '#d9b6c2'],
    panel: ['rgba(255, 246, 246, .86)', 'rgba(32, 20, 32, .84)'],
    line: ['rgba(196, 86, 122, .16)', 'rgba(255, 179, 200, .18)'],
    bg: ['#f4dfe0', '#1b1220'],
  },
  // la fenêtre donne sur une ville de colline (toits, une église, du linge) : on recule pour la voir
  zoom: 0.88,
  sky: { day: ['#fbeee9', '#f1d6d4', '#dcb8c8'], night: ['#3b3150', '#261f38', '#16111f'] },
  light: {
    hemi: { sky: [0xfff4f2, 0x9a96d0], ground: [0xe9cdc8, 0x7a5a68], intensity: [0.74, 0.56] },
    sun: { color: [0xfff1e4, 0x9fb4e8], intensity: [0.52, 0.2] },
  },
  loops: {
    ...WEATHER_LOOPS,
  },
  stations: ['rosee', 'soleil-bas', 'nuit-douce', 'brume'],
  playlist: PLAYLIST,
  presets: {
    work: { sounds: [['radio', 0.55], ['shower', 0.25], ['rain', 0.3]] },
    read: { sounds: [['faucet', 0.3], ['suds', 0.25], ['radio', 0.3], ['rain', 0.35]] },
    sleep: { sounds: [['shower', 0.35], ['suds', 0.2], ['rain', 0.4]], night: true },
  },
  objects: [
    { id: 'radio', target: 'radio', label: 'Kalimba · lofi', anchor: [1.5, 0.84, 0.7] },
    { id: 'faucet', target: 'faucet', label: 'Robinet · le filet du bain', anchor: [-0.8, 1.2, -2.82] },
    { id: 'foam', target: 'suds', label: 'Mousse · le pétillement', anchor: [0.7, 0.6, -2.02] },
    { id: 'shower', target: 'shower', label: 'Douche · la pluie sur le carrelage', anchor: [-2.3, 2.52, 1.15] },
    { id: 'lamp', target: 'night', label: 'Bougies · jour / nuit', anchor: [1.15, 2.1, -2.88] },
  ],
  sounds: [
    { id: 'radio', name: 'Kalimba lofi', chip: 'var(--c-radio)', volume: 0.7, sub: radioSub(PLAYLIST.length) },
    { id: 'faucet', name: 'Robinet', chip: 'var(--c-faucet)', volume: 0.45, sub: () => 'le filet dans le bain' },
    { id: 'suds', name: 'Mousse', chip: 'var(--c-suds)', volume: 0.4, sub: () => 'la mousse qui pétille' },
    { id: 'shower', name: 'Douche', chip: 'var(--c-shower)', volume: 0.45, sub: () => 'la pluie sur le carrelage' },
    { id: 'rain', name: 'Météo', chip: 'var(--c-rain)', volume: 0.6, sub: () => 'sur la vitre embuée' },
    { id: 'noise', name: 'Bruit', chip: 'var(--c-noise)', volume: 0.4, sub: () => 'souffle continu' },
  ],
}
