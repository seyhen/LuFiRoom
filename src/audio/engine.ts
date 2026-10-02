import { preload, useStore } from '../state/store'
import { roomById } from '../rooms'
import type { Loop, Room, SoundId } from '../rooms/types'
import { brownGen, loopBuffer, pinkGen, whiteGen } from './buffers'
import { crossLoop, decode, missing, prefetch } from './recordings'
import radio from './channels/radio'
import tracks from './channels/tracks'
import rain from './channels/rain'
import fan from './channels/fan'
import purr from './channels/purr'
import outside from './channels/outside'
import fire from './channels/fire'
import wind from './channels/wind'

// canal (bus Gain) ─┬─> master Gain 0.9 ─> compresseur ─> sortie
// canal (bus Gain) ─┘

export type { SoundId }

/** Ce que reçoit un canal pour construire son graphe : contexte, master, raccourcis et bruits partagés. */
export type Kit = ReturnType<typeof makeKit>
/** Canal qui doit agir à l'allumage et à l'extinction (ses ordonnanceurs). */
export interface Channel {
  start(): void
  stop(): void
}
type Build = (kit: Kit, out: GainNode, room: Room) => Channel | void

// Gain final d'un canal = volume utilisateur × gain de base.
const CHANNELS: Record<SoundId, { build: Build; base: number }> = {
  radio: { build: (k, out, room) => (room.playlist.length ? tracks(k, out, room) : radio(k, out)), base: 0.9 }, // pistes enregistrées, sinon musique générative
  rain: { build: rain, base: 1.0 },
  fan: { build: fan, base: 0.75 },
  purr: { build: purr, base: 0.95 },
  outside: { build: outside, base: 1.0 },
  fire: { build: fire, base: 0.9 },
  wind: { build: wind, base: 0.9 },
}
const ids = Object.keys(CHANNELS) as SoundId[]

function makeKit(ctx: AudioContext, master: GainNode) {
  const gain = (v: number) => {
    const g = ctx.createGain()
    g.gain.value = v
    return g
  }
  const biq = (type: BiquadFilterType, f: number, q = 0.7) => {
    const b = ctx.createBiquadFilter()
    b.type = type
    b.frequency.value = f
    b.Q.value = q
    return b
  }
  const osc = (type: OscillatorType, f: number) => {
    const o = ctx.createOscillator()
    o.type = type
    o.frequency.value = f
    return o
  }
  // Chaque couche démarre à un offset différent, pour éviter les effets de phase.
  const loop = (buf: AudioBuffer, offset = 0) => {
    const s = ctx.createBufferSource()
    s.buffer = buf
    s.loop = true
    s.start(0, offset % buf.duration)
    return s
  }
  const noise = { white: loopBuffer(ctx, 5, whiteGen), pink: loopBuffer(ctx, 6, pinkGen), brown: loopBuffer(ctx, 7, brownGen) }
  const sample = (src: string) => decode(ctx, src)
  // Joue la boucle enregistrée vers `dest`, à son niveau. Sans enregistrement, ou s'il ne se charge pas : `synth()`.
  const loopOr = (rec: Loop | undefined, dest: AudioNode, synth: () => void) => {
    if (!rec) return synth()
    sample(rec.src).then(
      (b) => {
        const g = gain(rec.gain)
        g.connect(dest)
        crossLoop(ctx, b, g)
      },
      (e) => {
        missing(rec.src, e)
        synth()
      },
    )
  }
  return { ctx, master, gain, biq, osc, loop, noise, sample, loopOr }
}

// Les boucles de la pièce se téléchargent dès l'ouverture, pendant l'écran de chargement. On les décode à leur premier
// allumage. Celles des autres pièces partent quand on s'en approche (voir plus bas). Les pistes de la radio sont lues en flux.
const preloadRoom = (room: Room, count: boolean) => {
  for (const { src } of Object.values(room.loops)) {
    const p = prefetch(src)
    if (count) preload(p)
  }
}
preloadRoom(roomById(useStore.getState().room), true)

let kit: Kit | null = null
let masterGain: GainNode | null = null
const MASTER = 0.9
// Un bus et un canal par son et par pièce : le ronron de la chambre n'est pas celui d'une autre pièce.
const bus: Record<string, GainNode> = {}
const built: Record<string, Channel | void> = {}
const keyOf = (id: SoundId) => `${useStore.getState().room}/${id}`

/** Crée l'AudioContext (au premier geste), ou le relance s'il a été suspendu. */
function ensure() {
  if (kit) {
    if (kit.ctx.state === 'suspended') kit.ctx.resume()
    return kit
  }
  if (typeof AudioContext === 'undefined') return null
  const ctx = new AudioContext()
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -16
  comp.knee.value = 12
  comp.ratio.value = 3.5
  comp.attack.value = 0.008
  comp.release.value = 0.3
  const master = ctx.createGain()
  master.gain.value = MASTER
  master.connect(comp).connect(ctx.destination)
  masterGain = master
  kit = makeKit(ctx, master)
  return kit
}

/** Allume ou éteint un canal de la pièce courante. Son graphe n'est construit qu'à sa première activation. */
function set(k: Kit, id: SoundId) {
  const key = keyOf(id)
  if (!(key in built)) {
    bus[key] = k.gain(0)
    bus[key].connect(k.master)
    built[key] = CHANNELS[id].build(k, bus[key], roomById(useStore.getState().room))
  }
  const { on, vol } = useStore.getState()
  const g = bus[key].gain, now = k.ctx.currentTime
  g.cancelScheduledValues(now)
  g.setTargetAtTime(on[id] ? vol[id] * CHANNELS[id].base : 0, now, on[id] ? 0.45 : 0.28)
  const ch = built[key]
  if (ch) on[id] ? ch.start() : ch.stop()
}

function volume(k: Kit, id: SoundId) {
  const { on, vol } = useStore.getState(), b = bus[keyOf(id)]
  if (!on[id] || !b) return
  const now = k.ctx.currentTime
  b.gain.cancelScheduledValues(now)
  b.gain.setTargetAtTime(vol[id] * CHANNELS[id].base, now, 0.06)
}

/** « Pop » d'interface : montant à l'allumage, descendant à l'extinction. */
function pop({ ctx, master, gain, osc }: Kit, up: boolean) {
  const t = ctx.currentTime, o = osc('sine', up ? 520 : 420), g = gain(0.0001)
  o.frequency.setValueAtTime(up ? 520 : 420, t)
  o.frequency.exponentialRampToValueAtTime(up ? 900 : 230, t + 0.09)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.1, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + 0.16)
}

// Minuteur de sommeil : sur l'horloge audio (qui ne dort pas quand l'onglet est en arrière-plan), le master descend
// en fondu pendant les dernières secondes ; à l'échéance, tout se coupe. Il se rouvre une fois les bus éteints.
const SLEEP_FADE = 30 // s
let sleepTimer = 0
function sleepSchedule(k: Kit, end: number | null, was: number | null) {
  clearTimeout(sleepTimer)
  const g = masterGain!.gain, now = k.ctx.currentTime, cur = g.value
  g.cancelScheduledValues(now)
  g.setValueAtTime(cur, now) // repart du niveau actuel : pas de saut si on annule en plein fondu
  if (end === null) {
    // Annulé en route : on rouvre tout de suite. Arrivé à l'échéance : on attend que les bus soient descendus (fin des fondus).
    const done = was !== null && Date.now() >= was - 200
    if (done) g.setValueAtTime(MASTER, now + 2.5)
    else g.setTargetAtTime(MASTER, now, 0.1)
    return
  }
  const left = Math.max(0, (end - Date.now()) / 1000), fade = Math.min(SLEEP_FADE, left)
  g.setValueAtTime(MASTER, now + left - fade) // le master reste ouvert jusqu'au début du fondu
  g.linearRampToValueAtTime(0, now + left)
  sleepTimer = window.setTimeout(() => {
    useStore.getState().muteAll()
    useStore.setState({ sleepEnd: null })
  }, left * 1000)
}

// L'audio suit le store. Un changement on/off ou jour/nuit vient toujours d'un geste de l'utilisateur
// (l'écouteur est appelé pendant le clic) : c'est là qu'on crée ou relance l'AudioContext (règle d'autoplay).
useStore.subscribe((s, p) => {
  // On s'en va vers une autre pièce : ses boucles commencent à se télécharger pendant l'effacement.
  if (s.leaving && s.leaving !== p.leaving) preloadRoom(roomById(s.leaving), false)
  const changed = ids.filter((id) => s.on[id] !== p.on[id])
  if (changed.length || s.night !== p.night) {
    const k = ensure()
    if (!k) return
    for (const id of changed) set(k, id)
    if (changed.length) pop(k, changed.some((id) => s.on[id]))
    if (s.night !== p.night) pop(k, !s.night)
  }
  if (kit) for (const id of ids) if (s.vol[id] !== p.vol[id]) volume(kit, id)
  if (s.sleepEnd !== p.sleepEnd) {
    const k = ensure()
    if (k) sleepSchedule(k, s.sleepEnd, p.sleepEnd)
  } else if (s.sleepEnd !== null && ids.some((id) => s.on[id] && !p.on[id]) && s.sleepEnd - Date.now() < SLEEP_FADE * 1000) {
    // On rallume un son pendant le fondu final : il serait inaudible, on annule le minuteur.
    useStore.setState({ sleepEnd: null })
  }
})
