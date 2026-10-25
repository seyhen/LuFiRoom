import { stationIds } from '../audio/stations'
import { roomById, rooms } from '../rooms'
import type { SoundId } from '../rooms/types'
import { tr } from '../i18n'
import { SKY_NAMES, isWeather, type WeatherKind } from './weather'

/** Une ambiance : la pièce, les sons qui jouent avec leur volume, le jour / nuit, et la station si la radio joue. */
export interface Mix {
  room: string
  on: SoundId[]
  vol: Partial<Record<SoundId, number>>
  night: boolean
  station?: string
  /** La météo, si la carte « Météo » joue (sans elle, un ancien lien : la pluie). */
  weather?: WeatherKind
}

/** Une ambiance gardée dans le navigateur. */
export interface SavedMix {
  id: string
  name: string
  mix: Mix
}

const KEY = 'chambre-lofi.mixes'
const MAX = 12

/** Nom d'une ambiance : ses sons, séparés par des points médians (la carte « Météo » par le nom de sa météo). */
export function mixName(m: Mix) {
  const names = roomById(m.room).sounds.filter((s) => m.on.includes(s.id)).map((s) => tr(s.id === 'rain' ? SKY_NAMES[m.weather ?? 'rain'] : s.name))
  return names.join(' · ') || tr('Silence')
}

export function loadMixes(): SavedMix[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]') as SavedMix[]
    // Ce qui ne correspond plus à une pièce ou à un son connus (une pièce retirée, un fichier abîmé) est ignoré.
    return list.filter((x) => x?.mix && rooms.some((r) => r.id === x.mix.room) && Array.isArray(x.mix.on)).slice(0, MAX)
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
    return on.length ? { ...m, on } : null
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

// Lien de partage : ?room=cabin&mix=fire.70,rain.60&night=1&station=veillee&weather=snow   (son.volume en %, jour = 0, nuit = 1)

export function mixToUrl(m: Mix) {
  const q = new URLSearchParams({
    room: m.room,
    mix: m.on.map((id) => `${id}.${Math.round((m.vol[id] ?? 0.7) * 100)}`).join(','),
    night: m.night ? '1' : '0',
  })
  if (m.station) q.set('station', m.station)
  if (m.weather) q.set('weather', m.weather)
  return `${location.origin}${import.meta.env.BASE_URL}?${q}`
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
  const station = q.get('station'), weather = q.get('weather')
  if (!on.length) return null
  return {
    room: id,
    on,
    vol,
    night: q.get('night') === '1',
    ...(station && stationIds(roomById(id).stations).includes(station) ? { station } : {}),
    // Un lien d'avant la météo qui allume `rain` : c'était la pluie.
    ...(on.includes('rain') ? { weather: isWeather(weather) ? weather : 'rain' } : {}),
  }
}
