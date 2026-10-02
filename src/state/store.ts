import { create } from 'zustand'
import { roomById, rooms } from '../rooms'
import type { ObjectId, RoomSound, SoundId, Target } from '../rooms/types'
import { reduceMotion } from '../motion'

type PerSound<T> = Record<SoundId, T>
// Les sons de toutes les pièces : un son qui revient d'une pièce à l'autre garde son volume.
const allSounds = rooms.flatMap((r) => r.sounds)
const perSound = <T>(f: (s: RoomSound) => T) => Object.fromEntries(allSounds.map((s) => [s.id, f(s)])) as PerSound<T>

export interface Store {
  night: boolean
  /** Pièce affichée (identifiant). */
  room: string
  /** Pièce vers laquelle on s'en va, pendant la transition. */
  leaving: string | null
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
  /** Minuteur de sommeil : instant (ms) où tout s'est éteint en fondu, ou null. */
  sleepEnd: number | null
  /** Place prise par le titre (en haut) et le mixeur (en bas), en px : la pièce se cadre entre les deux. */
  insets: { top: number; bottom: number }
  toggle: (target: Target) => void
  toggleNight: () => void
  muteAll: () => void
  setVolume: (id: SoundId, v: number) => void
  /** Lance le minuteur de sommeil (durée en minutes), ou l'annule (null). */
  setSleep: (minutes: number | null) => void
  /** Change de pièce : les sons se coupent, la scène s'efface, puis la nouvelle pièce apparaît. */
  goto: (id: string) => void
}

const hour = new Date().getHours()
const ROOM_KEY = 'chambre-lofi.room'
const FADE = 350 // ms, la durée de l'effacement (voir app.css)

// La dernière pièce visitée, si le navigateur veut bien s'en souvenir.
function savedRoom() {
  try {
    return roomById(localStorage.getItem(ROOM_KEY) ?? '').id
  } catch {
    return rooms[0].id
  }
}

// Bascule une cible et fait rebondir l'objet qui la pilote.
function flip(s: Store, target: Target): Partial<Store> {
  const obj = roomById(s.room).objects.find((o) => o.target === target)
  return {
    squashAt: obj ? { ...s.squashAt, [obj.id]: performance.now() } : s.squashAt,
    ...(target === 'night' ? { night: !s.night } : { on: { ...s.on, [target]: !s.on[target] } }),
  }
}

export const useStore = create<Store>()((set, get) => ({
  night: hour >= 20 || hour < 7,
  room: savedRoom(),
  leaving: null,
  on: perSound(() => false),
  vol: perSound((s) => s.volume),
  taps: 0,
  squashAt: {},
  onAir: '',
  kicks: 0,
  loading: { done: 0, total: 0, scene: false },
  insets: { top: 0, bottom: 0 },
  sleepEnd: null,
  setSleep: (minutes) => set({ sleepEnd: minutes === null ? null : Date.now() + minutes * 60_000 }),
  // Toucher un objet, son hotspot ou sa carte du mixeur. Sans effet pendant une transition.
  toggle: (target) => set((s) => (s.leaving ? s : { taps: s.taps + 1, ...flip(s, target) })),
  // Bouton jour / nuit : comme toucher la lampe, sans compter comme un geste.
  toggleNight: () => set((s) => flip(s, 'night')),
  muteAll: () => set({ on: perSound(() => false) }),
  setVolume: (id, v) => set((s) => ({ vol: { ...s.vol, [id]: v } })),
  goto: (id) => {
    const s = get()
    if (s.leaving || id === s.room || roomById(id).id !== id) return
    // Les sons de la pièce qu'on quitte s'éteignent tout de suite (c'est encore elle qui est « room »).
    set({ leaving: id, on: perSound(() => false) })
    setTimeout(() => {
      set({ room: id, leaving: null, squashAt: {}, onAir: '' })
      try {
        localStorage.setItem(ROOM_KEY, id)
      } catch {
        // pas de stockage : on ne s'en souviendra pas
      }
    }, reduceMotion ? 0 : FADE)
  },
}))

/** Compte un fichier dans la progression de l'écran de chargement, qu'il arrive ou échoue. */
export function preload(p: Promise<unknown>) {
  useStore.setState((s) => ({ loading: { ...s.loading, total: s.loading.total + 1 } }))
  const done = () => useStore.setState((s) => ({ loading: { ...s.loading, done: s.loading.done + 1 } }))
  p.then(done, done)
}

/** L'objet de la pièce est-il actif : son allumé, ou nuit pour la lampe ? Faux s'il n'est pas dans la pièce. */
export function isActive(s: Store, id: ObjectId) {
  const target = roomById(s.room).objects.find((o) => o.id === id)?.target
  return target === 'night' ? s.night : target !== undefined && s.on[target]
}
