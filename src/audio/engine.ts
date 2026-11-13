import { preload, useStore } from '../state/store'
import { roomById } from '../rooms'
import type { Loop, Room, SoundId } from '../rooms/types'
import { brownGen, loopBuffer, pinkGen, whiteGen } from './buffers'
import { crossLoop, decode, grainLoop, later, missing, prefetch, release, shots } from './recordings'
import radio from './channels/radio'
import tracks from './channels/tracks'
import rain from './channels/rain'
import fan from './channels/fan'
import purr from './channels/purr'
import outside from './channels/outside'
import fire from './channels/fire'
import wind from './channels/wind'
import street from './channels/street'
import murmur from './channels/murmur'
import espresso from './channels/espresso'
import pages from './channels/pages'
import waves from './channels/waves'
import gulls from './channels/gulls'
import chimes from './channels/chimes'
import rails from './channels/rails'
import tea from './channels/tea'
import city from './channels/city'
import pigeons from './channels/pigeons'
import keys from './channels/keys'
import pencil from './channels/pencil'
import kettle from './channels/kettle'
import spring from './channels/spring'
import bamboo from './channels/bamboo'
import foghorn from './channels/foghorn'
import bell from './channels/bell'
import sonar from './channels/sonar'
import bubbles from './channels/bubbles'
import hull from './channels/hull'
import engineSound from './channels/engine'
import whale from './channels/whale'
import sizzle from './channels/sizzle'
import simmer from './channels/simmer'
import neon from './channels/neon'
import tram from './channels/tram'
import mist from './channels/mist'
import knit from './channels/knit'
import rainstick from './channels/rainstick'
import cards from './channels/cards'
import watering from './channels/watering'
import brush from './channels/brush'
import whisk from './channels/whisk'
import quill from './channels/quill'
import shell from './channels/shell'
import abacus from './channels/abacus'
import drip from './channels/drip'
import aurora from './channels/aurora'
import icehole from './channels/icehole'
import sew from './channels/sew'
import cocoa from './channels/cocoa'
import brook from './channels/brook'
import cicadas from './channels/cicadas'
import frogs from './channels/frogs'
import musicbox from './channels/musicbox'
import rainbarrel from './channels/rainbarrel'
import wash from './channels/wash'
import tumble from './channels/tumble'
import rinse from './channels/rinse'
import gutter from './channels/gutter'
import noise from './channels/noise'

// canal (bus Gain) ─┬─> master Gain 0.9 ─> volume général ─> liant doux ─> passe-haut 25 Hz ─> recalage ─> limiteur ─> plafond doux ─> sortie
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
  radio: { build: (k, out, room) => (room.playlist.length ? tracks(k, out, room) : radio(k, out)), base: 1.05 }, // pistes enregistrées, sinon musique générative
  rain: { build: rain, base: 1.0 },
  fan: { build: fan, base: 0.75 },
  purr: { build: purr, base: 0.95 },
  outside: { build: outside, base: 1.0 },
  fire: { build: fire, base: 0.9 },
  wind: { build: wind, base: 0.75 },
  street: { build: street, base: 0.9 },
  murmur: { build: murmur, base: 0.9 },
  espresso: { build: espresso, base: 0.9 },
  pages: { build: pages, base: 1.3 },
  waves: { build: waves, base: 0.78 },
  gulls: { build: gulls, base: 0.65 },
  chimes: { build: chimes, base: 1.2 },
  rails: { build: rails, base: 0.45 },
  tea: { build: tea, base: 0.9 },
  city: { build: city, base: 0.63 },
  pigeons: { build: pigeons, base: 0.9 },
  keys: { build: keys, base: 0.9 },
  pencil: { build: pencil, base: 0.9 },
  kettle: { build: kettle, base: 0.9 },
  spring: { build: spring, base: 0.3 },
  bamboo: { build: bamboo, base: 0.9 },
  foghorn: { build: foghorn, base: 1.75 },
  bell: { build: bell, base: 2.2 },
  sonar: { build: sonar, base: 1.5 },
  bubbles: { build: bubbles, base: 0.9 },
  hull: { build: hull, base: 0.8 },
  engine: { build: engineSound, base: 0.7 },
  whale: { build: whale, base: 0.7 },
  sizzle: { build: sizzle, base: 1.05 },
  simmer: { build: simmer, base: 0.65 },
  neon: { build: neon, base: 1.3 },
  tram: { build: tram, base: 0.6 },
  mist: { build: mist, base: 1.0 },
  knit: { build: knit, base: 1.0 },
  rainstick: { build: rainstick, base: 1.0 },
  cards: { build: cards, base: 1.0 },
  watering: { build: watering, base: 1.0 },
  brush: { build: brush, base: 0.8 },
  whisk: { build: whisk, base: 1.0 },
  quill: { build: quill, base: 1.0 },
  shell: { build: shell, base: 1.0 },
  abacus: { build: abacus, base: 1.0 },
  drip: { build: drip, base: 1.0 },
  aurora: { build: aurora, base: 1.9 },
  icehole: { build: icehole, base: 1.0 },
  sew: { build: sew, base: 1.4 },
  cocoa: { build: cocoa, base: 1.25 },
  brook: { build: brook, base: 4.2 },
  cicadas: { build: cicadas, base: 3.0 },
  frogs: { build: frogs, base: 3.5 },
  musicbox: { build: musicbox, base: 2.5 },
  rainbarrel: { build: rainbarrel, base: 3.0 },
  wash: { build: wash, base: 1.0 },
  tumble: { build: tumble, base: 1.0 },
  rinse: { build: rinse, base: 1.4 },
  gutter: { build: gutter, base: 1.4 },
  noise: { build: noise, base: 0.5 }, // sonie (pondérée A) du rose à 0,4 : celle du ventilateur et de la pluie par défaut ; couleurs égalisées dans public/noise-worklet.js
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
  // Joue la boucle enregistrée vers `dest`, à son niveau (en route à `start`, vraiment arrêtée à `stop`). Sans enregistrement,
  // ou s'il ne se charge pas : `synth()`. La synthèse d'un évènement planifié renvoie son canal ; sinon elle tourne sans fin.
  const loopOrChannel = (rec: Loop | undefined, dest: AudioNode, synth: () => Channel | void): Channel => {
    const ch = later()
    if (!rec) ch.use(synth())
    else {
      sample(rec.src).then(
        (b) => {
          const g = gain(rec.gain)
          g.connect(dest)
          ch.use(crossLoop(ctx, b, g))
        },
        (e) => {
          missing(rec.src, e)
          ch.use(synth())
        },
      )
    }
    return ch
  }
  // Comme loopOrChannel, mais l'enregistrement est joué en grains (segments tirés au hasard, jamais deux fois la même suite) :
  // pour les sons qu'on entendrait « boucler » (la pluie de 30 s, le ronron de 7 s). `start` et `stop` pilotent la programmation.
  const grainsOr = (rec: Loop | undefined, dest: AudioNode, opts: Parameters<typeof grainLoop>[3], synth: () => Channel | void): Channel => {
    const ch = later()
    if (!rec) ch.use(synth())
    else {
      sample(rec.src).then(
        (b) => {
          const g = gain(rec.gain)
          g.connect(dest)
          ch.use(grainLoop(ctx, b, g, opts))
        },
        (e) => {
          missing(rec.src, e)
          ch.use(synth())
        },
      )
    }
    return ch
  }
  // Pour un son ponctuel enregistré (corne de brume, pigeon) : un tir de temps en temps, jamais en boucle.
  const shotsOr = (rec: Loop | undefined, dest: AudioNode, opts: Parameters<typeof shots>[3], synth: () => Channel | void): Channel => {
    const ch = later()
    if (!rec) ch.use(synth())
    else {
      sample(rec.src).then(
        (b) => {
          const g = gain(rec.gain)
          g.connect(dest)
          ch.use(shots(ctx, b, g, opts))
        },
        (e) => {
          missing(rec.src, e)
          ch.use(synth())
        },
      )
    }
    return ch
  }
  // S'abonner au store : à travers `watch`, l'abonnement se défait quand la pièce est déchargée (voir `evict`).
  const watch = (fn: Parameters<typeof useStore.subscribe>[0]) => useStore.subscribe(fn)
  return { ctx, master, gain, biq, osc, loop, noise, sample, loopOrChannel, grainsOr, shotsOr, watch }
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
// Fin de chaîne : liant très doux, passe-haut, limiteur de sécurité, puis la sortie (voir `ensure`).
let glue: DynamicsCompressorNode | null = null
let limiter: DynamicsCompressorNode | null = null
let tail: AudioNode | null = null
// Volume général, à part du master (que le minuteur de sommeil fait descendre) : les deux se multiplient.
let userGain: GainNode | null = null
// Le curseur suit l'oreille plutôt que l'amplitude : au carré, la moitié du curseur sonne à peu près à moitié aussi fort.
// Même courbe pour le volume général et pour le curseur de chaque carte (`vol` du store est une position de curseur).
const userLevel = (v: number) => v * v
// Sortie : un flux (MediaStream) lu par un élément <audio>, plutôt que les haut-parleurs directs. Pour le système, c'est alors
// un lecteur de média : la lecture continue écran verrouillé ou app en arrière-plan, et la Media Session (src/audio/session.ts)
// peut afficher des contrôles. Si le navigateur ne sait pas, ou refuse de lire, la sortie directe reste le repli.
let sink: HTMLAudioElement | null = null
let sinkOff = 0
const MASTER = 0.9
// Un bus et un canal par son et par pièce : le ronron de la chambre n'est pas celui d'une autre pièce.
const bus: Record<string, GainNode> = {}
const built: Record<string, Channel | void> = {}
// Ce que chaque canal a ouvert : ses abonnements au store et ses sources qui ne s'arrêtent pas seules (oscillateurs, bruits en boucle).
const owned: Record<string, { subs: (() => void)[]; nodes: Set<AudioScheduledSourceNode>; dead: boolean }> = {}
let evictTimer = 0
const keyOf = (id: SoundId) => `${useStore.getState().room}/${id}`

/** Crée l'AudioContext (au premier geste), ou le relance s'il a été suspendu. */
function ensure() {
  if (kit) {
    // Appelé pendant un geste (voir `unlockAudio`) : le bon moment pour relancer, même si rien ne joue encore.
    if ((kit.ctx.state as string) !== 'running' && kit.ctx.state !== 'closed') kit.ctx.resume().then(resumeSink, () => {})
    return kit
  }
  if (typeof AudioContext === 'undefined') return null
  const ctx = new AudioContext()
  // Fin de chaîne, pensée pour des bruits continus qu'on écoute longtemps : rien ne doit « pomper » quand un son ponctuel
  // (cloche, corne, tonnerre) passe par-dessus. Un liant très doux (ratio 1,8 sous un seuil haut, attaque lente pour laisser
  // passer les transitoires, relâchement long), un passe-haut qui retire l'inaudible, puis un limiteur de sécurité vers -3 dB.
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = GLUE.threshold
  comp.knee.value = GLUE.knee
  comp.ratio.value = GLUE.ratio
  comp.attack.value = GLUE.attack
  comp.release.value = GLUE.release
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 25
  hp.Q.value = 0.6
  const lim = ctx.createDynamicsCompressor()
  lim.threshold.value = -3
  lim.knee.value = 0
  lim.ratio.value = 20
  lim.attack.value = 0.002
  lim.release.value = 0.15
  // La compression de Web Audio ajoute son propre gain de rattrapage ; ce gain-ci recale le niveau sur celui de l'ancienne chaîne
  // (+4 dB sur un bruit de niveau courant), avant le limiteur pour que son plafond soit bien celui de la sortie.
  const trim = ctx.createGain()
  trim.gain.value = GLUE.trim
  // Dernier filet : un limiteur Web Audio ne tient pas un plafond à l'échantillon près ; ce profil laisse tout passer sous -3 dB
  // et arrondit doucement ce qui dépasse, vers -1 dBFS, sans jamais écrêter net.
  const ceiling = ctx.createWaveShaper()
  ceiling.curve = ceilingCurve()
  ceiling.oversample = '2x'
  const master = ctx.createGain()
  master.gain.value = MASTER
  const user = ctx.createGain()
  user.gain.value = userLevel(useStore.getState().master)
  master.connect(user).connect(comp).connect(hp).connect(trim).connect(lim).connect(ceiling)
  userGain = user
  glue = comp
  limiter = lim
  tail = ceiling
  masterGain = master
  // `?direct` dans l'adresse : sortie directe vers les haut-parleurs, sans le flux <audio> (pour savoir si un grésillement vient de lui).
  if (!new URLSearchParams(location.search).has('direct') && typeof ctx.createMediaStreamDestination === 'function' && 'srcObject' in HTMLMediaElement.prototype) {
    const dest = ctx.createMediaStreamDestination()
    ceiling.connect(dest)
    sink = new Audio()
    sink.srcObject = dest.stream
  } else ceiling.connect(ctx.destination)
  kit = makeKit(ctx, master)
  // Une interruption (appel, alarme, veille de l'onglet) suspend le contexte : on le relance dès qu'on peut.
  ctx.addEventListener('statechange', revive)
  return kit
}

// Valeurs de la fin de chaîne (mesurées avec window.__lofi.audio en dev : bruit rose + cloche, voir le bilan de la revue du moteur).
const GLUE = { threshold: -8, knee: 12, ratio: 1.7, attack: 0.03, release: 0.7, trim: 1.38 }

function ceilingCurve() {
  const n = 2048, T = 0.708, C = 0.891, curve = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1, a = Math.abs(x)
    curve[i] = a <= T ? x : Math.sign(x) * (T + (C - T) * Math.tanh((a - T) / (C - T)))
  }
  return curve
}

/** Le son est-il censé jouer ? Au moins un canal allumé. */
const playing = () => ids.some((id) => useStore.getState().on[id])

// Reprise après interruption. Sans geste de l'utilisateur, le navigateur refuse parfois (surtout iOS, état « interrupted ») :
// on réessaie alors au prochain toucher ou clic sur la page, avec un seul jeu d'écouteurs, retiré dès qu'il a servi.
let tapArmed = false, reviveTimer = 0
const TAP_EVENTS = ['pointerup', 'click', 'touchend', 'keydown'] as const
function armTap() {
  if (tapArmed) return
  tapArmed = true
  const go = () => {
    tapArmed = false
    for (const e of TAP_EVENTS) removeEventListener(e, go, true)
    revive()
  }
  for (const e of TAP_EVENTS) addEventListener(e, go, true)
}
function resumeSink() {
  if (sink?.paused && playing()) sink.play().catch(armTap) // le flux est lu par l'élément <audio> : un appel l'a peut-être mis en pause
}
function revive() {
  if (!kit || !playing()) return
  const { ctx } = kit
  if ((ctx.state as string) === 'running') return resumeSink()
  if (ctx.state === 'closed') return
  ctx.resume().then(resumeSink, () => {})
  // Un resume() sans geste peut rester sans réponse, ou être refusé sans erreur : on vérifie ensuite, et on attend un geste.
  clearTimeout(reviveTimer)
  reviveTimer = window.setTimeout(() => {
    if (!playing() || (ctx.state as string) === 'running') return
    if (!tapArmed) console.warn(`Le son est suspendu (${ctx.state}) : il reprendra au prochain toucher.`)
    armTap()
  }, 1200)
}
document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && revive())
addEventListener('pageshow', revive)

/** Lance la lecture du flux de sortie (pendant un geste de l'utilisateur), puis le met en pause quand plus rien ne joue. */
function keepOutput(anyOn: boolean) {
  if (!sink) return
  clearTimeout(sinkOff)
  const el = sink
  if (el.paused) {
    el.play().catch((e) => {
      // Lecture refusée : on revient à la sortie directe, sans contrôles système mais sans silence.
      console.warn('Sortie en flux indisponible, sortie directe.', e)
      sink = null
      tail!.disconnect()
      tail!.connect(kit!.ctx.destination)
    })
  }
  // Rien ne joue (les fondus durent moins de 2 s) : on libère l'audio du système, sinon ses contrôles restent affichés.
  if (!anyOn) sinkOff = window.setTimeout(() => !ids.some((id) => useStore.getState().on[id]) && el.pause(), 2500)
}

/**
 * À appeler au moment d'un geste, avant un changement d'état qui n'allumera les sons que plus tard (une ambiance qui change
 * de pièce) : crée ou relance l'AudioContext et ouvre la sortie tant que le navigateur l'autorise.
 */
export function unlockAudio() {
  if (ensure()) keepOutput(false)
}

/** Allume ou éteint un canal de la pièce courante. Son graphe n'est construit qu'à sa première activation. */
function set(k: Kit, id: SoundId) {
  const key = keyOf(id)
  if (!(key in built)) {
    bus[key] = k.gain(0)
    bus[key].connect(k.master)
    const own = (owned[key] = { subs: [], nodes: new Set(), dead: false } as (typeof owned)[string])
    // Une source qui finit seule (la note d'une radio) quitte la liste : seules celles qui tournent sans fin restent à arrêter.
    const track = <T extends AudioScheduledSourceNode>(n: T) => {
      own.nodes.add(n)
      n.addEventListener('ended', () => own.nodes.delete(n))
      return n
    }
    const mine: Kit = {
      ...k,
      watch: (fn) => {
        if (own.dead) return () => {} // le canal est déjà déchargé (le son arrivait après coup)
        const u = k.watch(fn)
        own.subs.push(u)
        return u
      },
      osc: (type, f) => {
        return track(k.osc(type, f))
      },
      loop: (buf, offset) => {
        return track(k.loop(buf, offset))
      },
    }
    built[key] = CHANNELS[id].build(mine, bus[key], roomById(useStore.getState().room))
  }
  const { on, vol } = useStore.getState()
  const g = bus[key].gain, now = k.ctx.currentTime
  g.cancelScheduledValues(now)
  g.setTargetAtTime(on[id] ? userLevel(vol[id]) * CHANNELS[id].base : 0, now, on[id] ? 0.45 : 0.28)
  const ch = built[key]
  if (ch) on[id] ? ch.start() : ch.stop()
}

function volume(k: Kit, id: SoundId) {
  const { on, vol } = useStore.getState(), b = bus[keyOf(id)]
  if (!on[id] || !b) return
  const now = k.ctx.currentTime
  b.gain.cancelScheduledValues(now)
  b.gain.setTargetAtTime(userLevel(vol[id]) * CHANNELS[id].base, now, 0.06)
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

/** Carillon du minuteur de concentration : deux notes de cloche qui descendent (fin du travail : la pause) ou montent (retour au travail). */
export function chime(toBreak: boolean) {
  const k = ensure()
  if (!k) return
  const { ctx, master, gain, osc } = k, t0 = ctx.currentTime
  ;(toBreak ? [880, 660] : [660, 880]).forEach((f, i) => {
    const t = t0 + i * 0.3
    for (const [mul, amp, len] of [[1, 1, 1.8], [2.76, 0.22, 0.7]] as const) {
      const o = osc('sine', f * mul), g = gain(0.0001)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.14 * amp, t + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      o.connect(g).connect(master)
      o.start(t)
      o.stop(t + len + 0.05)
    }
  })
}

/**
 * Décharge les canaux des pièces qu'on a quittées : sources arrêtées, abonnements défaits, bus débranchés, puis les enregistrements
 * décodés (jusqu'à 40 Mo par pièce) qu'aucune pièce courante n'utilise. Revenir dans une pièce la reconstruit au premier son allumé.
 */
function evict() {
  // La pièce courante, et celle où l'on va si une transition est en cours, restent chargées.
  const { room, leaving } = useStore.getState(), mine = [`${room}/`, ...(leaving ? [`${leaving}/`] : [])]
  const keep = new Set([room, ...(leaving ? [leaving] : [])].flatMap((r) => Object.values(roomById(r).loops).map((l) => l.src)))
  const gone = new Set<string>()
  for (const key of Object.keys(built)) {
    if (mine.some((m) => key.startsWith(m))) continue
    built[key]?.stop()
    const own = owned[key]
    if (own) own.dead = true
    own?.subs.forEach((u) => u())
    own?.nodes.forEach((n) => {
      try {
        n.stop()
      } catch {
        // déjà arrêtée
      }
    })
    bus[key]?.disconnect()
    delete built[key]
    delete owned[key]
    delete bus[key]
    for (const l of Object.values(roomById(key.split('/')[0]).loops)) gone.add(l.src)
  }
  for (const src of gone) if (!keep.has(src)) release(src)
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

// L'audio suit le store. Un changement on/off ou jour/nuit à la main vient toujours d'un geste de l'utilisateur
// (l'écouteur est appelé pendant le clic) : c'est là qu'on crée ou relance l'AudioContext (règle d'autoplay).
useStore.subscribe((s, p) => {
  // On s'en va vers une autre pièce : ses boucles commencent à se télécharger pendant l'effacement.
  if (s.leaving && s.leaving !== p.leaving) preloadRoom(roomById(s.leaving), false)
  // Arrivé : on décharge l'ancienne, une fois ses sons fondus.
  if (s.room !== p.room) {
    clearTimeout(evictTimer)
    evictTimer = window.setTimeout(evict, 2500)
  }
  const changed = ids.filter((id) => s.on[id] !== p.on[id])
  // Le jour et la nuit qui suivent l'heure (`dusk`) ne viennent pas d'un geste : ni AudioContext, ni « pop ». Les canaux qui
  // dépendent de la nuit (oiseaux / grillons, ville) l'écoutent eux-mêmes.
  const nightByHand = s.night !== p.night && !s.dusk
  if (changed.length || nightByHand) {
    const k = ensure()
    if (!k) return
    for (const id of changed) set(k, id)
    // « Sons d'interface » coupés : ni pop d'allumage ni carillon jour / nuit (le carillon du minuteur de concentration reste).
    if (s.uiSounds) {
      if (changed.length) pop(k, changed.some((id) => s.on[id]))
      if (nightByHand) pop(k, !s.night)
    }
    keepOutput(ids.some((id) => s.on[id]))
  }
  if (kit) for (const id of ids) if (s.vol[id] !== p.vol[id]) volume(kit, id)
  if (kit && userGain && s.master !== p.master) userGain.gain.setTargetAtTime(userLevel(s.master), kit.ctx.currentTime, 0.04)
  if (s.sleepEnd !== p.sleepEnd) {
    const k = ensure()
    if (k) sleepSchedule(k, s.sleepEnd, p.sleepEnd)
  } else if (s.sleepEnd !== null && ids.some((id) => s.on[id] && !p.on[id]) && s.sleepEnd - Date.now() < SLEEP_FADE * 1000) {
    // On rallume un son pendant le fondu final : il serait inaudible, on annule le minuteur.
    useStore.setState({ sleepEnd: null })
  }
})

/**
 * Mesure des niveaux (dev seulement, voir scripts/measure-levels.mjs) : rend le canal `id` de la pièce `roomId` hors ligne, en
 * synthèse (sans enregistrement), pendant `seconds` s, et renvoie sa sonie à gain de bus 1 (LUFS approchées : filtres de pondération K
 * de BS.1770, blocs de 400 ms, double porte) avec la crête et son gain par défaut (volume de la fiche × gain de base × master).
 * Les ordonnanceurs de canaux (`setInterval`) sont avancés à la main, au rythme du temps rendu, pas de l'horloge réelle.
 */
async function renderOffline(id: SoundId, roomId: string, seconds = 20) {
  const SR = 44100, def = CHANNELS[id], room = roomById(roomId)
  const sound = room.sounds.find((x) => x.id === id)
  const octx = new OfflineAudioContext(2, SR * seconds, SR)
  const mst = octx.createGain()
  mst.gain.value = 1
  const subs: (() => void)[] = []
  const k0 = makeKit(octx as unknown as AudioContext, mst)
  const k: Kit = { ...k0, watch: (fn) => { const u = useStore.subscribe(fn); subs.push(u); return u } }
  const bus = octx.createGain()
  bus.gain.value = 1
  // Pondération K : étage 1 = étagère aiguë +4 dB à 1,68 kHz, étage 2 = passe-haut 38 Hz.
  const shelf = octx.createBiquadFilter(), hp = octx.createBiquadFilter()
  shelf.type = 'highshelf'; shelf.frequency.value = 1681.97; shelf.gain.value = 4
  hp.type = 'highpass'; hp.frequency.value = 38.135; hp.Q.value = 0.5
  bus.connect(mst).connect(shelf).connect(hp).connect(octx.destination)
  const ticks = new Map<number, () => void>()
  let nid = 9e8
  const realSet = window.setInterval, realClear = window.clearInterval
  window.setInterval = ((fn: () => void) => { ticks.set(++nid, fn); return nid }) as unknown as typeof window.setInterval
  window.clearInterval = ((i: number) => { ticks.delete(i); realClear(i) }) as typeof window.clearInterval
  try {
    const ch = def.build(k, bus, { ...room, loops: {}, playlist: [] })
    ch?.start()
    for (let t = 0.1; t < seconds; t += 0.1) void octx.suspend(t).then(() => { for (const f of [...ticks.values()]) f(); void octx.resume() })
    const buf = await octx.startRendering()
    const L = buf.getChannelData(0), R = buf.getChannelData(1)
    // sonie par blocs de 400 ms, pas de 100 ms ; porte absolue -70 LUFS puis relative -10 LU (BS.1770-4)
    const blk = Math.round(0.4 * SR), hop = Math.round(0.1 * SR), ms: number[] = []
    let peak = 0
    for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]))
    for (let o = Math.round(2 * SR); o + blk <= L.length; o += hop) { // les 2 premières secondes (mise en route des fondus) ne comptent pas
      let a = 0, b = 0
      for (let i = o; i < o + blk; i++) { a += L[i] * L[i]; b += R[i] * R[i] }
      ms.push((a + b) / blk)
    }
    const lk = (z: number) => -0.691 + 10 * Math.log10(z || 1e-12)
    const abs = ms.filter((z) => lk(z) > -70)
    const mean = (xs: number[]) => xs.reduce((u, v) => u + v, 0) / (xs.length || 1)
    const rel = abs.filter((z) => lk(z) > lk(mean(abs)) - 10)
    const gainDef = (sound?.volume ?? 0) * def.base * MASTER
    return { id, room: roomId, base: def.base, volume: sound?.volume ?? 0, lufs: lk(mean(rel)), lufsMean: lk(mean(ms)), peak, gainDef, lufsDef: lk(mean(rel)) + 20 * Math.log10(Math.max(gainDef, 1e-9)) }
  } finally {
    window.setInterval = realSet
    window.clearInterval = realClear
    subs.forEach((u) => u())
  }
}

// Pont de développement (retiré du build) : les bus de chaque son et le kit, pour mesurer les niveaux (skill audit-room).
if (import.meta.env.DEV) ((window as unknown as { __lofi?: Record<string, unknown> }).__lofi ??= {}).audio = { bus, getKit: () => kit, getComp: () => glue, getLimiter: () => limiter, getOut: () => tail, getUserGain: () => userGain, renderOffline }
