import { radioSub } from '../audio/stations'
import { PLAYLIST } from './playlist'
import type { Room } from './types'
import { WEATHER_LOOPS } from './weather'

// Le bivouac d'un explorateur dans un igloo, sous les aurores. Sons nouveaux (aurore, trou de pêche, couture, cacao) synthétisés
// pour l'instant : leurs enregistrements se déclareront dans `loops` (docs/ASSETS.md), sources et licences dans public/audio/CREDITS.md.

export const igloo: Room = {
  id: 'igloo',
  name: 'Igloo',
  description:
    'Le bivouac d’un explorateur dans un igloo, en 3D isométrique : un dôme de blocs de neige ouvert sur le devant, une fenêtre ' +
    'de glace claire sur l’aurore boréale, une banquette de neige couverte de fourrures et un duvet, une radio de secours à ' +
    'manivelle, une lampe tempête, un réchaud et sa casserole, un thermos de cacao, une moufle en cours de couture, un husky ' +
    'endormi, et un trou de pêche dans la glace.',
  ui: {
    accent: ['#c2552e', '#7fe8c0'],
    ink: ['#1d2a38', '#eaf6ff'],
    'ink-soft': ['#5a6878', '#a9c2d6'],
    panel: ['rgba(246, 250, 253, .84)', 'rgba(14, 24, 38, .84)'],
    line: ['rgba(60, 90, 120, .16)', 'rgba(127, 232, 192, .18)'],
    bg: ['#e4edf5', '#0a1322'],
  },
  sky: { day: ['#eef4fa', '#d3e3f0', '#aec7de'], night: ['#163045', '#0d1d33', '#060c1c'] },
  light: {
    hemi: { sky: [0xeef6ff, 0x4f6fa0], ground: [0xa8a2a0, 0x5e4644], intensity: [0.66, 0.42] },
    sun: { color: [0xfff1e0, 0xa8c4ff], intensity: [0.5, 0.2] },
  },
  loops: {
    ...WEATHER_LOOPS,
  },
  stations: ['minuit', 'brume', 'nuit-douce'],
  playlist: PLAYLIST,
  presets: {
    work: { sounds: [['radio',.55], ['icehole',.3], ['cocoa',.25]] },
    read: { sounds: [['sew',.35], ['icehole',.35], ['cocoa',.25], ['radio',.3]] },
    sleep: { sounds: [['aurora',.5], ['icehole',.3]], night: true },
  },
  // Les ancres sont à l'échelle de la scène (× 1,15, voir IGLOO_SCALE dans scene/igloo/IglooScene.tsx).
  objects: [
    { id: 'radio', target: 'radio', label: 'Radio à manivelle · lofi', anchor: [-2.7, 0.8, -0.99] },
    { id: 'icewindow', target: 'aurora', label: 'Fenêtre de glace · l’aurore', anchor: [-1.44, 1.29, -2.83] },
    { id: 'lamp', target: 'night', label: 'Lampe tempête · jour / nuit', anchor: [1.78, 0.9, -2.01] },
    { id: 'thermos', target: 'cocoa', label: 'Thermos · le cacao', anchor: [0.63, 0.62, 1.67] },
    { id: 'icehole', target: 'icehole', label: 'Trou de pêche · l’eau sous la glace', anchor: [2.3, 0.14, 0.86] },
    { id: 'mitten', target: 'sew', label: 'Moufle · la couture', anchor: [-1.67, 0.57, 1.78] },
  ],
  sounds: [
    { id: 'radio', name: 'Radio à manivelle', chip: 'var(--c-radio)', volume: 0.7, sub: radioSub(PLAYLIST.length) },
    { id: 'aurora', name: 'Aurore', chip: 'var(--c-aurora)', volume: 0.55, sub: () => 'le ciel qui chante' },
    { id: 'icehole', name: 'Trou de pêche', chip: 'var(--c-icehole)', volume: 0.55, sub: () => 'l’eau sous la glace' },
    { id: 'sew', name: 'Couture', chip: 'var(--c-sew)', volume: 0.45, sub: () => 'l’aiguille dans la moufle' },
    { id: 'cocoa', name: 'Cacao', chip: 'var(--c-cocoa)', volume: 0.5, sub: () => 'on se ressert' },
    { id: 'rain', name: 'Météo', chip: 'var(--c-rain)', volume: 0.6, sub: () => 'contre la neige' },
  ],
}
