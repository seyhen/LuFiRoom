import type { SoundId } from '../audio/engine'

// Une chambre est une donnée : ses objets interactifs, ce qu'ils pilotent, l'ancre de leur hotspot
// et les sons du mixeur. Le moteur (scène, audio, interface) lit ce fichier.

export type ObjectId = 'cloud' | 'radio' | 'window' | 'fan' | 'cat' | 'lamp'
/** Ce qu'un objet pilote : un son, ou le passage jour / nuit. */
export type Target = SoundId | 'night'

export interface RoomObject {
  id: ObjectId
  target: Target
  /** Bulle du hotspot, et son nom accessible. */
  label: string
  /** Position du hotspot, dans le repère de la pièce. */
  anchor: [number, number, number]
}

export interface RoomSound {
  id: SoundId
  name: string
  /** Couleur de la pastille dans le mixeur. */
  chip: string
  /** Volume par défaut (0 → 1). */
  volume: number
  /** Sous-titre vivant de la carte du mixeur. */
  sub: (s: { night: boolean; on: Record<SoundId, boolean>; chord: string }) => string
}

// Dans l'ordre des hotspots : ordre de tabulation et décalage de leur pulsation.
export const objects: RoomObject[] = [
  { id: 'cloud', target: 'rain', label: 'Nuage · pluie', anchor: [1.3, 5.75, -3.85] },
  { id: 'radio', target: 'radio', label: 'Radio · lofi', anchor: [1.95, 2.05, -2.45] },
  { id: 'window', target: 'outside', label: 'Fenêtre · dehors', anchor: [1.4, 3.35, -3.0] },
  { id: 'fan', target: 'fan', label: 'Ventilo · bruit blanc', anchor: [0.98, 2.35, -2.45] },
  { id: 'cat', target: 'purr', label: 'Chat · ronron', anchor: [-1.0, 1.42, -0.45] },
  { id: 'lamp', target: 'night', label: 'Lampe · jour / nuit', anchor: [-2.55, 1.62, -2.55] },
]

// Dans l'ordre du mixeur.
export const sounds: RoomSound[] = [
  { id: 'radio', name: 'Radio lofi', chip: 'var(--c-radio)', volume: 0.75, sub: (s) => (s.on.radio && s.chord ? `${s.chord} · 72 bpm` : 'lofi · 72 bpm') },
  { id: 'rain', name: 'Pluie', chip: 'var(--c-rain)', volume: 0.7, sub: (s) => (s.on.outside ? 'vitre ouverte' : 'vitre fermée') },
  { id: 'fan', name: 'Bruit blanc', chip: 'var(--c-fan)', volume: 0.55, sub: () => 'ventilateur' },
  { id: 'purr', name: 'Ronron', chip: 'var(--c-cat)', volume: 0.7, sub: () => 'chat endormi' },
  { id: 'outside', name: 'Dehors', chip: 'var(--c-win)', volume: 0.65, sub: (s) => (s.night ? 'grillons' : 'oiseaux') },
]
