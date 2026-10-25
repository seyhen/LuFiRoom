import { radioSub } from '../audio/stations'
import { PLAYLIST } from './playlist'
import type { Room } from './types'

// La cabine d'un sous-marin de légende, au fond de l'abîme. Les enregistrements sont à déclarer dans `loops`
// (sonar, bubbles, hull, engine, whale) et `playlist` (docs/ASSETS.md) ; sans eux, tout est synthétisé.

export const submarine: Room = {
  id: 'submarine',
  name: 'Sous-marin',
  description:
    'Carré d’un sous-marin de légende, en 3D isométrique : des parois de cuivre vert-de-gris rivetées sur un lambris d’acajou, un ' +
    'grand hublot de laiton sur l’abîme (poissons, méduses lumineuses, une épave, et parfois une baleine), une console de sonar ' +
    'qui balaie, un manomètre, un tube de ballast à bulles, un télégraphe de machines, un orgue de capitaine, une table ronde sous ' +
    'une lampe de banquier avec un bocal de poissons rouges, une banquette de cuir et un scaphandre de cuivre.',
  ui: {
    accent: ['#0f7a78', '#7ff0d4'],
    ink: ['#10302f', '#e3fbf4'],
    'ink-soft': ['#4d6e6b', '#8fc9c0'],
    panel: ['rgba(240, 250, 248, .84)', 'rgba(6, 22, 28, .86)'],
    line: ['rgba(20, 100, 100, .16)', 'rgba(127, 240, 212, .2)'],
    bg: ['#d6ece8', '#06161c'],
  },
  skyLife: false,
  sky: { day: ['#cfece8', '#a6d6d4', '#6fb0b6'], night: ['#0b2a38', '#07202c', '#031219'] },
  light: {
    hemi: { sky: [0xdff8f2, 0x2a6a88], ground: [0x7a6a50, 0x1a2a30], intensity: [0.58, 0.3] },
    sun: { color: [0xfff0c8, 0x6fe0d0], intensity: [0.5, 0.22] },
  },
  loops: {
    sonar: { src: 'audio/submarine/sonar', gain: 0.8 },
    bubbles: { src: 'audio/submarine/bubbles', gain: 0.8 },
    hull: { src: 'audio/submarine/hull', gain: 0.8 },
    engine: { src: 'audio/submarine/engine', gain: 0.8 },
    whale: { src: 'audio/submarine/whale', gain: 0.9 },
    shell: { src: 'audio/submarine/shell', gain: 0.8 },
  },
  stations: ['minuit', 'brume', 'veillee'],
  playlist: PLAYLIST,
  presets: {
    work: { sounds: [['radio',.55], ['engine',.3], ['bubbles',.25]] },
    read: { sounds: [['bubbles',.35], ['shell',.3], ['whale',.3]] },
    sleep: { sounds: [['whale',.4], ['shell',.35], ['engine',.25]], night: true },
  },
  objects: [
    { id: 'window', target: 'whale', label: 'Hublot · chant de baleine', anchor: [0.45, 2.45, -2.9] },
    { id: 'sonar', target: 'sonar', label: 'Sonar · ping', anchor: [-1.75, 1.2, -2.1] },
    { id: 'gauge', target: 'hull', label: 'Manomètre · la coque gémit', anchor: [-1.75, 3.1, -2.85] },
    { id: 'valve', target: 'bubbles', label: 'Vanne · bulles', anchor: [2.45, 0.85, -1.75] },
    { id: 'telegraph', target: 'engine', label: 'Télégraphe · machines', anchor: [2.5, 1.4, 1.8] },
    { id: 'lamp', target: 'night', label: 'Lampe de banquier · jour / nuit', anchor: [0.6, 1.25, -0.55] },
    { id: 'radio', target: 'radio', label: 'Orgue · lofi', anchor: [-2.4, 1.5, 0.5] },
    { id: 'shell', target: 'shell', label: 'Conque · la mer dedans', anchor: [-1.2, 1.0, 2.1] },
  ],
  sounds: [
    { id: 'radio', name: 'Orgue lofi', chip: 'var(--c-radio)', volume: 0.7, sub: radioSub(PLAYLIST.length) },
    { id: 'sonar', name: 'Sonar', chip: 'var(--c-sonar)', volume: 0.45, sub: () => 'un ping dans le noir' },
    { id: 'bubbles', name: 'Bulles', chip: 'var(--c-bubbles)', volume: 0.5, sub: () => 'le ballast qui respire' },
    { id: 'hull', name: 'Coque', chip: 'var(--c-hull)', volume: 0.5, sub: () => 'la pression qui gémit' },
    { id: 'engine', name: 'Machines', chip: 'var(--c-engine)', volume: 0.5, sub: () => 'avant, lentement' },
    { id: 'shell', name: 'Conque', chip: 'var(--c-shell)', volume: 0.45, sub: () => 'la mer, dans le coquillage' },
    { id: 'whale', name: 'Baleine', chip: 'var(--c-whale)', volume: 0.5, sub: () => 'un chant au loin' },
  ],
}
