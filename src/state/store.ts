import { create } from 'zustand'
import { stationAfter, stationById, stationIds } from '../audio/stations'
import { roomById, rooms } from '../rooms'
import type { ObjectId, RoomSound, SoundId, Target } from '../rooms/types'
import { reduceMotion } from '../motion'
import { MAX_SAVED, loadMixes, mixFromSearch, mixName, storeMixes, type Mix, type SavedMix } from './mixes'

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
  /** Publiés par la radio : ce qu'elle joue (sous-titre du mixeur, pour les pistes enregistrées), nombre de kicks joués. */
  onAir: string
  kicks: number
  /** Station de la radio générative (identifiant, voir src/audio/stations.ts). */
  station: string
  /** Écran de chargement : fichiers préchargés, et scène dessinée une première fois. */
  loading: { done: number; total: number; scene: boolean }
  /** Ambiances enregistrées dans ce navigateur. */
  mixes: SavedMix[]
  /** Ambiance reçue par un lien, en attente d'un geste pour être jouée. */
  shared: Mix | null
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
  /** L'ambiance en cours : pièce, sons qui jouent et leur volume, jour / nuit. */
  currentMix: () => Mix
  /** Enregistre l'ambiance en cours (la plus récente en premier). */
  saveMix: () => void
  deleteMix: (id: string) => void
  /** Joue une ambiance : change de pièce si besoin, règle les volumes et le jour / nuit, allume ses sons. */
  applyMix: (m: Mix) => void
  /** Écarte l'ambiance reçue par un lien. */
  dismissShared: () => void
  /** Change de pièce : les sons se coupent, la scène s'efface, puis la nouvelle pièce apparaît. */
  goto: (id: string) => void
  /** Choisit la station de la radio ; `nextStation` passe à la suivante (ou à la précédente avec -1), en tournant. */
  setStation: (id: string) => void
  nextStation: (dir?: 1 | -1) => void
}

const hour = new Date().getHours()
const ROOM_KEY = 'chambre-lofi.room'
const STATION_KEY = 'chambre-lofi.station'
const stationKey = (room: string) => `${STATION_KEY}.${room}`
const FADE = 350 // ms, la durée de l'effacement (voir app.css)

// La dernière pièce visitée, si le navigateur veut bien s'en souvenir.
function savedRoom() {
  try {
    return roomById(localStorage.getItem(ROOM_KEY) ?? '').id
  } catch {
    return rooms[0].id
  }
}

// La dernière station écoutée dans cette pièce, de la même façon (à défaut, la première de la pièce).
// Avant que chaque pièce ait sa liste, une seule station était retenue : la première pièce la reprend.
function savedStation(room: string) {
  const ids = stationIds(roomById(room).stations)
  try {
    const v = localStorage.getItem(stationKey(room)) ?? (room === rooms[0].id ? localStorage.getItem(STATION_KEY) : null)
    if (v && ids.includes(v)) return v
  } catch {
    // pas de stockage : la première de la pièce
  }
  return ids[0]
}

function rememberStation(room: string, id: string) {
  try {
    localStorage.setItem(stationKey(room), id)
  } catch {
    // pas de stockage : on ne s'en souviendra pas
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

const firstRoom = savedRoom()

export const useStore = create<Store>()((set, get, api) => ({
  night: hour >= 20 || hour < 7,
  room: firstRoom,
  leaving: null,
  on: perSound(() => false),
  vol: perSound((s) => s.volume),
  taps: 0,
  squashAt: {},
  onAir: '',
  kicks: 0,
  station: savedStation(firstRoom),
  loading: { done: 0, total: 0, scene: false },
  insets: { top: 0, bottom: 0 },
  mixes: loadMixes(),
  shared: mixFromSearch(location.search),
  sleepEnd: null,
  currentMix: () => {
    const s = get(), on = roomById(s.room).sounds.filter((x) => s.on[x.id]).map((x) => x.id)
    return {
      room: s.room,
      on,
      vol: Object.fromEntries(on.map((id) => [id, Math.round(s.vol[id] * 100) / 100])),
      night: s.night,
      // La station ne compte que si la radio joue (et si elle joue des stations : sans piste enregistrée).
      ...(on.includes('radio') && !roomById(s.room).playlist.length ? { station: s.station } : {}),
    }
  },
  saveMix: () => {
    const mix = get().currentMix()
    if (!mix.on.length) return
    // La même ambiance enregistrée deux fois ne fait qu'une entrée, remontée en tête.
    const same = JSON.stringify(mix), others = get().mixes.filter((x) => JSON.stringify(x.mix) !== same)
    const list = [{ id: Date.now().toString(36), name: mixName(mix), mix }, ...others].slice(0, MAX_SAVED)
    storeMixes(list)
    set({ mixes: list })
  },
  deleteMix: (id) => {
    const list = get().mixes.filter((x) => x.id !== id)
    storeMixes(list)
    set({ mixes: list })
  },
  applyMix: (m) => {
    const apply = () => {
      const sounds = roomById(m.room).sounds
      // La station du lien compte si cette pièce la joue ; sinon la pièce garde la sienne.
      const station = m.station && stationIds(roomById(m.room).stations).includes(m.station) ? m.station : get().station
      rememberStation(m.room, station)
      set((s) => ({
        station,
        night: m.night,
        vol: { ...s.vol, ...m.vol },
        on: { ...perSound(() => false), ...Object.fromEntries(sounds.filter((x) => m.on.includes(x.id)).map((x) => [x.id, true])) },
        taps: s.taps + 1,
      }))
    }
    if (get().room === m.room) return apply()
    if (get().leaving) return
    get().goto(m.room)
    // On joue une fois la nouvelle pièce affichée (la transition coupe tout, puis change de pièce).
    const stop = api.subscribe((s) => {
      if (s.room !== m.room) return
      stop()
      apply()
    })
    setTimeout(stop, 2000)
  },
  dismissShared: () => {
    set({ shared: null })
    history.replaceState(null, '', location.pathname) // l'adresse ne garde pas le lien reçu
  },
  setSleep: (minutes) => set({ sleepEnd: minutes === null ? null : Date.now() + minutes * 60_000 }),
  // Toucher un objet, son hotspot ou sa carte du mixeur. Sans effet pendant une transition.
  toggle: (target) => set((s) => (s.leaving ? s : { taps: s.taps + 1, ...flip(s, target) })),
  // Bouton jour / nuit : comme toucher la lampe, sans compter comme un geste.
  toggleNight: () => set((s) => flip(s, 'night')),
  muteAll: () => set({ on: perSound(() => false) }),
  setVolume: (id, v) => set((s) => ({ vol: { ...s.vol, [id]: v } })),
  setStation: (id) => {
    const station = stationById(id).id
    if (station === get().station || !stationIds(roomById(get().room).stations).includes(station)) return
    rememberStation(get().room, station)
    // La radio de la scène rebondit, comme quand on la touche.
    set((s) => {
      const radio = roomById(s.room).objects.find((o) => o.target === 'radio')
      return { station, squashAt: radio ? { ...s.squashAt, [radio.id]: performance.now() } : s.squashAt }
    })
  },
  nextStation: (dir = 1) => get().setStation(stationAfter(get().station, dir, roomById(get().room).stations).id),
  goto: (id) => {
    const s = get()
    if (s.leaving || id === s.room || roomById(id).id !== id) return
    // Les sons de la pièce qu'on quitte s'éteignent tout de suite (c'est encore elle qui est « room »).
    set({ leaving: id, on: perSound(() => false) })
    setTimeout(() => {
      set({ room: id, leaving: null, squashAt: {}, onAir: '', station: savedStation(id) })
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
