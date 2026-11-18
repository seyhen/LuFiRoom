// Le ventilateur de la chambre à trois vitesses (faible, moyenne, forte). La vitesse règle le son (niveau, souffle, ronflement du
// moteur : src/audio/channels/fan.ts) et la rotation des pales (src/scene/bedroom/Fan.tsx). Elle se retient d'une visite à l'autre
// et voyage avec l'ambiance (state/mixes.ts, facultative : un lien sans elle reste valide, vitesse moyenne).
// Règle de l'objet 3D : éteint, un toucher l'allume à sa vitesse ; allumé, chaque toucher passe à la suivante ; après « Fort »
// il s'éteint et repart de « Faible » (`fanTap`). La carte du mixeur, elle, allume et éteint sans changer de vitesse.

export const FAN_SPEEDS = ['low', 'mid', 'high'] as const
export type FanSpeed = (typeof FAN_SPEEDS)[number]

export const DEFAULT_FAN: FanSpeed = 'mid'

export const isFanSpeed = (v: unknown): v is FanSpeed => FAN_SPEEDS.includes(v as FanSpeed)
/** Une vitesse lue dans du stockage ou une adresse : ce qui n'est pas valide devient `undefined`. */
export const cleanFan = (v: unknown): FanSpeed | undefined => (isFanSpeed(v) ? v : undefined)

/** Le nom de chaque vitesse (pastille, lecteur d'écran). */
export const FAN_NAMES: Record<FanSpeed, string> = { low: 'Vitesse faible', mid: 'Vitesse moyenne', high: 'Vitesse forte' }
/** Le mot court de la pastille. */
export const FAN_CHIPS: Record<FanSpeed, string> = { low: 'Faible', mid: 'Moyen', high: 'Fort' }
/** Sous-titre de la carte, par vitesse. */
export const FAN_SUBS: Record<FanSpeed, string> = { low: 'brise douce', mid: 'souffle régulier', high: 'plein vent' }

/** Ce que fait un toucher sur l'objet : `on` / `speed` donnent l'état d'après (`on` faux : il s'éteint, et repart de « Faible »). */
export function fanTap(on: boolean, speed: FanSpeed): { on: boolean; speed: FanSpeed } {
  if (!on) return { on: true, speed }
  const i = FAN_SPEEDS.indexOf(speed)
  return i < FAN_SPEEDS.length - 1 ? { on: true, speed: FAN_SPEEDS[i + 1] } : { on: false, speed: FAN_SPEEDS[0] }
}

/** Vitesse des pales (rad/s) : lente, normale, vive. Avec `prefers-reduced-motion`, elles tournent doucement et la tête ne balaie plus. */
export const FAN_SPIN: Record<FanSpeed, number> = { low: 9, mid: 22, high: 38 }
export const FAN_SPIN_CALM: Record<FanSpeed, number> = { low: 3, mid: 5, high: 8 }

/** Le vent du ventilateur sur ce qui pend dans la chambre (les rideaux, la guirlande de lunes) : faible, normal, fort. */
export const FAN_WIND: Record<FanSpeed, number> = { low: 0.5, mid: 1, high: 1.5 }

const KEY = 'chambre-lofi.fan'

export function loadFan(): FanSpeed {
  try {
    return cleanFan(JSON.parse(localStorage.getItem(KEY) ?? 'null')) ?? DEFAULT_FAN
  } catch {
    return DEFAULT_FAN
  }
}

export function storeFan(f: FanSpeed) {
  try {
    localStorage.setItem(KEY, JSON.stringify(f))
  } catch {
    // pas de stockage : on ne s'en souviendra pas
  }
}
