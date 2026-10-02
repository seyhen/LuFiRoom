import { create } from 'zustand'
import type { SoundId } from '../audio/engine'
import { objects, sounds, type ObjectId, type RoomSound, type Target } from '../rooms/bedroom'

type PerSound<T> = Record<SoundId, T>
const perSound = <T>(f: (s: RoomSound) => T) => Object.fromEntries(sounds.map((s) => [s.id, f(s)])) as PerSound<T>

export interface Store {
  night: boolean
  on: PerSound<boolean>
  vol: PerSound<number>
  /** Gestes sur les objets et le mixeur : les hotspots arrêtent de pulser après 3. */
  taps: number
  /** Dernier rebond demandé pour chaque objet (performance.now()). */
  squashAt: Partial<Record<ObjectId, number>>
  /** Publiés par la radio : ce qu'elle joue (sous-titre du mixeur), nombre de kicks joués. */
  onAir: string
  kicks: number
  /** Écran de chargement : fichiers préchargés, et scène dessinée une première fois. */
  loading: { done: number; total: number; scene: boolean }
  /** Place prise par le titre (en haut) et le mixeur (en bas), en px : la pièce se cadre entre les deux. */
  insets: { top: number; bottom: number }
  toggle: (target: Target) => void
  toggleNight: () => void
  muteAll: () => void
  setVolume: (id: SoundId, v: number) => void
}

const hour = new Date().getHours()

// Bascule une cible et fait rebondir l'objet qui la pilote.
function flip(s: Store, target: Target): Partial<Store> {
  const obj = objects.find((o) => o.target === target)
  return {
    squashAt: obj ? { ...s.squashAt, [obj.id]: performance.now() } : s.squashAt,
    ...(target === 'night' ? { night: !s.night } : { on: { ...s.on, [target]: !s.on[target] } }),
  }
}

export const useStore = create<Store>()((set) => ({
  night: hour >= 20 || hour < 7,
  on: perSound(() => false),
  vol: perSound((s) => s.volume),
  taps: 0,
  squashAt: {},
  onAir: '',
  kicks: 0,
  loading: { done: 0, total: 0, scene: false },
  insets: { top: 0, bottom: 0 },
  // Toucher un objet, son hotspot ou sa carte du mixeur.
  toggle: (target) => set((s) => ({ taps: s.taps + 1, ...flip(s, target) })),
  // Bouton jour / nuit : comme toucher la lampe, sans compter comme un geste.
  toggleNight: () => set((s) => flip(s, 'night')),
  muteAll: () => set({ on: perSound(() => false) }),
  setVolume: (id, v) => set((s) => ({ vol: { ...s.vol, [id]: v } })),
}))

/** Compte un fichier dans la progression de l'écran de chargement, qu'il arrive ou échoue. */
export function preload(p: Promise<unknown>) {
  useStore.setState((s) => ({ loading: { ...s.loading, total: s.loading.total + 1 } }))
  const done = () => useStore.setState((s) => ({ loading: { ...s.loading, done: s.loading.done + 1 } }))
  p.then(done, done)
}

/** L'objet est-il actif : son allumé, ou nuit pour la lampe ? */
export function isActive(s: Store, id: ObjectId) {
  const { target } = objects.find((o) => o.id === id)!
  return target === 'night' ? s.night : s.on[target]
}
