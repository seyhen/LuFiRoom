import { roomById, rooms } from '../rooms'
import type { SoundId } from '../rooms/types'

/** Une ambiance : la pièce, les sons qui jouent avec leur volume, et le jour / nuit. */
export interface Mix {
  room: string
  on: SoundId[]
  vol: Partial<Record<SoundId, number>>
  night: boolean
}

/** Une ambiance gardée dans le navigateur. */
export interface SavedMix {
  id: string
  name: string
  mix: Mix
}

const KEY = 'chambre-lofi.mixes'
const MAX = 12

/** Nom d'une ambiance : ses sons, séparés par des points médians. */
export function mixName(m: Mix) {
  const names = roomById(m.room).sounds.filter((s) => m.on.includes(s.id)).map((s) => s.name)
  return names.join(' · ') || 'Silence'
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

export function storeMixes(list: SavedMix[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  } catch {
    // pas de stockage : elles ne survivront pas au rechargement
  }
}

export const MAX_SAVED = MAX

// Lien de partage : ?room=cabin&mix=fire.70,wind.60&night=1   (son.volume en %, jour = 0, nuit = 1)

export function mixToUrl(m: Mix) {
  const q = new URLSearchParams({
    room: m.room,
    mix: m.on.map((id) => `${id}.${Math.round((m.vol[id] ?? 0.7) * 100)}`).join(','),
    night: m.night ? '1' : '0',
  })
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
  return on.length ? { room: id, on, vol, night: q.get('night') === '1' } : null
}
