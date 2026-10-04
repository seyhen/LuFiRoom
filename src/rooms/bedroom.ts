import { radioSub } from '../audio/stations'
import type { Room, Track } from './types'

// La chambre. Les enregistrements sont à déclarer dans `loops` et `playlist` (docs/ASSETS.md) ; sources et licences :
// public/audio/CREDITS.md.

const playlist: Track[] = []

export const bedroom: Room = {
  id: 'bedroom',
  name: 'Chambre',
  description: 'Chambre lofi en 3D isométrique : lit avec un chat, bureau avec radio et ventilateur, fenêtre, nuage, lampe champignon.',
  dimmedBy: 'cloud',
  sky: { day: ['#f7f1fa', '#e7dcf0', '#d2c1e3'], night: ['#342d66', '#211c44', '#13102a'] },
  light: {
    hemi: { sky: [0xfff4fb, 0x6c6db8], ground: [0xbca8d0, 0x2c2448], intensity: [0.62, 0.42] },
    sun: { color: [0xfff0e2, 0x9fb2ff], intensity: [0.6, 0.28] },
  },
  // Gains calés sur le niveau de sortie de la synthèse (mesuré à ±1 dB) : un point de départ, à régler à l'oreille.
  loops: {
    rain: { src: 'audio/bedroom/rain', gain: 0.85 },
    fan: { src: 'audio/bedroom/fan', gain: 0.75 },
    purr: { src: 'audio/bedroom/purr', gain: 0.5 },
    birds: { src: 'audio/bedroom/birds', gain: 0.16 },
    crickets: { src: 'audio/bedroom/crickets', gain: 0.25 },
  },
  playlist,
  stations: ['nuit-douce', 'petit-matin', 'brume', 'veillee', 'bureau'],
  objects: [
    { id: 'cloud', target: 'rain', label: 'Nuage · pluie', anchor: [1.35, 5.2, -3.85] },
    { id: 'radio', target: 'radio', label: 'Radio · lofi', anchor: [2.2, 1.8, -2.55] },
    { id: 'window', target: 'outside', label: 'Fenêtre · dehors', anchor: [1.4, 3.35, -3.0] },
    { id: 'fan', target: 'fan', label: 'Ventilo · bruit blanc', anchor: [0.6, 1.85, -2.6] },
    { id: 'cat', target: 'purr', label: 'Chat · ronron', anchor: [-1.15, 1.45, -0.5] },
    { id: 'lamp', target: 'night', label: 'Lampe · jour / nuit', anchor: [-2.68, 1.2, -2.72] },
  ],
  sounds: [
    {
      id: 'radio',
      name: 'Radio lofi',
      chip: 'var(--c-radio)',
      volume: 0.75,
      sub: radioSub(playlist.length),
    },
    { id: 'rain', name: 'Pluie', chip: 'var(--c-rain)', volume: 0.7, sub: (s) => (s.on.outside ? 'vitre ouverte' : 'vitre fermée') },
    { id: 'fan', name: 'Bruit blanc', chip: 'var(--c-fan)', volume: 0.55, sub: () => 'ventilateur' },
    { id: 'purr', name: 'Ronron', chip: 'var(--c-cat)', volume: 0.7, sub: () => 'chat endormi' },
    { id: 'outside', name: 'Dehors', chip: 'var(--c-win)', volume: 0.65, sub: (s) => (s.night ? 'grillons' : 'oiseaux') },
  ],
}
