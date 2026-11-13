import { Capacitor } from '@capacitor/core'
import { stationIds } from '../audio/stations'
import { roomById, rooms } from '../rooms'
import type { SoundId } from '../rooms/types'
import { tr } from '../i18n'
import { SKY_NAMES, isWeather, type WeatherKind } from './weather'
import { NOISE_NAMES, clampTilt, cleanNoise, isNoiseColor, type NoiseSetting } from './noise'

/** Une ambiance : la pièce, les sons qui jouent avec leur volume, le jour / nuit, et la station si la radio joue. */
export interface Mix {
  /** Courbe des volumes : 2 = positions de curseur (courbe d'oreille, au carré). Absent : ancienne ambiance, volumes en amplitude. */
  v?: number
  room: string
  on: SoundId[]
  vol: Partial<Record<SoundId, number>>
  night: boolean
  station?: string
  /** La météo, si la carte « Météo » joue (sans elle, un ancien lien : la pluie). */
  weather?: WeatherKind
  /** La couleur et la tonalité du bruit, si la carte « Bruit » joue (un mix sans elle reste valide). */
  noise?: NoiseSetting
}

/** Une ambiance gardée dans le navigateur. */
export interface SavedMix {
  id: string
  name: string
  mix: Mix
}

/** Version courante des volumes d'une ambiance (voir docs/MIXES.md, « Courbe des volumes »). */
export const MIX_VERSION = 2
/** Position de curseur d'un niveau sonore donné en amplitude (l'inverse de la courbe au carré du moteur). */
export const sliderOf = (amplitude: number) => Math.sqrt(Math.min(1, Math.max(0, amplitude)))

/** Ramène une ambiance à la courbe courante : les volumes d'une ambiance d'avant la courbe (sans `v`) gardent leur niveau sonore. */
function withCurve(m: Mix): Mix {
  if (m.v === MIX_VERSION) return m
  const vol: Mix['vol'] = {}
  for (const [id, a] of Object.entries(m.vol ?? {})) if (typeof a === 'number' && Number.isFinite(a)) vol[id as SoundId] = Math.round(sliderOf(a) * 100) / 100
  return { ...m, v: MIX_VERSION, vol }
}

const KEY = 'chambre-lofi.mixes'
const MAX = 12

/** Nom d'une ambiance : ses sons, séparés par des points médians (la carte « Météo » par le nom de sa météo, « Bruit » par sa couleur). */
export function mixName(m: Mix) {
  const label = (s: { id: string; name: string }) => (s.id === 'rain' ? SKY_NAMES[m.weather ?? 'rain'] : s.id === 'noise' && m.noise ? NOISE_NAMES[m.noise.color] : s.name)
  const names = roomById(m.room).sounds.filter((s) => m.on.includes(s.id)).map((s) => tr(label(s)))
  return names.join(' · ') || tr('Silence')
}

/** La même ambiance, avec un réglage de bruit valide (ou sans : un ancien mix, un stockage abîmé). */
function withNoise({ noise, ...m }: Mix): Mix {
  const n = cleanNoise(noise)
  return n ? { ...m, noise: n } : m
}

export function loadMixes(): SavedMix[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]') as SavedMix[]
    // Ce qui ne correspond plus à une pièce ou à un son connus (une pièce retirée, un fichier abîmé) est ignoré.
    return list
      .filter((x) => x?.mix && rooms.some((r) => r.id === x.mix.room) && Array.isArray(x.mix.on))
      .map((x) => ({ ...x, mix: withCurve(withNoise(x.mix)) }))
      .slice(0, MAX)
  } catch {
    return []
  }
}

const LAST = 'chambre-lofi.last'

/** La dernière ambiance jouée (pour « Reprendre »), si elle est encore valide : pièce et sons connus. */
export function loadLast(): Mix | null {
  try {
    const m = JSON.parse(localStorage.getItem(LAST) ?? 'null') as Mix | null
    if (!m || !rooms.some((r) => r.id === m.room) || !Array.isArray(m.on)) return null
    const known = new Set(roomById(m.room).sounds.map((s) => s.id as string))
    const on = m.on.filter((id) => known.has(id))
    return on.length ? withCurve(withNoise({ ...m, on })) : null
  } catch {
    return null
  }
}

export function storeLast(m: Mix) {
  try {
    localStorage.setItem(LAST, JSON.stringify(m))
  } catch {
    // pas de stockage : « Reprendre » n'apparaîtra pas
  }
}

export function storeMixes(list: SavedMix[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  } catch {
    // pas de stockage : elles ne survivront pas au rechargement
  }
}

export const MAX_SAVED = MAX

/** Adresse publique du site (sans « / » final), utilisée pour les liens de partage depuis l'app mobile. */
export const PUBLIC_SITE_URL = 'https://lufiroom.an-alexcore.workers.dev'

// Lien de partage : ?room=cabin&mix=fire.70,rain.60&night=1&station=veillee&weather=snow&v=2   (son.volume en % de curseur, jour = 0, nuit = 1 ; sans v=2 : ancien lien, volumes en amplitude)

export function mixToUrl(m: Mix) {
  const q = new URLSearchParams({
    room: m.room,
    mix: m.on.map((id) => `${id}.${Math.round((m.vol[id] ?? 0.7) * 100)}`).join(','),
    night: m.night ? '1' : '0',
    v: String(MIX_VERSION),
  })
  if (m.station) q.set('station', m.station)
  if (m.weather) q.set('weather', m.weather)
  if (m.noise) {
    q.set('noise', m.noise.color)
    q.set('tilt', String(Math.round(m.noise.tilt * 100)))
  }
  // Dans l'app native, location.origin vaut https://localhost ou capacitor://localhost : on partage l'adresse publique du site.
  const origin = Capacitor.isNativePlatform() ? PUBLIC_SITE_URL : location.origin
  return `${origin}${import.meta.env.BASE_URL}?${q}`
}

/** Lit une ambiance dans l'adresse. Rien de valide (pièce inconnue, aucun son connu) : null. */
export function mixFromSearch(search: string): Mix | null {
  const q = new URLSearchParams(search), id = q.get('room'), raw = q.get('mix')
  if (!id || !raw || !rooms.some((r) => r.id === id)) return null
  const known = new Set(roomById(id).sounds.map((s) => s.id as string))
  const on: SoundId[] = [], vol: Mix['vol'] = {}
  for (const part of raw.split(',').slice(0, 12)) {
    const [sid, v] = part.split('.')
    const n = Number(v)
    if (!known.has(sid) || on.includes(sid as SoundId)) continue
    on.push(sid as SoundId)
    if (Number.isFinite(n)) vol[sid as SoundId] = Math.min(1, Math.max(0, n / 100))
  }
  // Un lien d'avant la courbe d'oreille (sans `v=2`) donne des amplitudes : `withCurve` les ramène à des positions de curseur.
  const station = q.get('station'), weather = q.get('weather'), color = q.get('noise')
  if (!on.length) return null
  return withCurve({
    v: q.get('v') === String(MIX_VERSION) ? MIX_VERSION : undefined,
    room: id,
    on,
    vol,
    night: q.get('night') === '1',
    ...(station && stationIds(roomById(id).stations).includes(station) ? { station } : {}),
    // Un lien d'avant la météo qui allume `rain` : c'était la pluie.
    ...(on.includes('rain') ? { weather: isWeather(weather) ? weather : 'rain' } : {}),
    // La couleur et la tonalité du bruit (`tilt` en %, de -100 à 100) ; sans elles, la carte garde son réglage.
    ...(on.includes('noise') && isNoiseColor(color) ? { noise: { color, tilt: clampTilt(Number(q.get('tilt') ?? 0) / 100) } } : {}),
  })
}
