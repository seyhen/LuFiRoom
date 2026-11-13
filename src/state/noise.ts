// La carte « Bruit » : la couleur du bruit et sa tonalité. Elles se retiennent d'une pièce à l'autre et d'une visite à l'autre,
// et voyagent avec l'ambiance (state/mixes.ts). Le son : src/audio/channels/noise.ts (voir docs/NOISE.md).

export const NOISE_COLORS = ['white', 'pink', 'brown', 'green'] as const
export type NoiseColor = (typeof NOISE_COLORS)[number]

export interface NoiseSetting {
  color: NoiseColor
  /** Tonalité de -1 (plus de graves) à 1 (plus d'aigus) : 0 neutre ; à fond, ±6 dB à chaque bout du spectre. */
  tilt: number
}

export const isNoiseColor = (v: unknown): v is NoiseColor => NOISE_COLORS.includes(v as NoiseColor)
export const clampTilt = (v: number) => (Number.isFinite(v) ? Math.min(1, Math.max(-1, Math.round(v * 100) / 100)) : 0)

/** Le nom de chaque couleur (pastille, ambiance enregistrée, titre de l'écran verrouillé). */
export const NOISE_NAMES: Record<NoiseColor, string> = { white: 'Bruit blanc', pink: 'Bruit rose', brown: 'Bruit brun', green: 'Bruit vert' }
/** Le mot court de la pastille. */
export const NOISE_CHIPS: Record<NoiseColor, string> = { white: 'Blanc', pink: 'Rose', brown: 'Brun', green: 'Vert' }
/** Sous-titre de la carte, par couleur. */
export const NOISE_SUBS: Record<NoiseColor, string> = {
  white: 'blanc · clair et net',
  pink: 'rose · doux, équilibré',
  brown: 'brun · grave, profond',
  green: 'vert · médiums, nature',
}

export const DEFAULT_NOISE: NoiseSetting = { color: 'pink', tilt: 0 }

/** Une couleur et une tonalité lues dans du stockage ou une adresse : ce qui n'est pas valide devient `undefined`. */
export function cleanNoise(x: unknown): NoiseSetting | undefined {
  const n = x as Partial<NoiseSetting> | null
  if (!n || !isNoiseColor(n.color)) return undefined
  return { color: n.color, tilt: clampTilt(Number(n.tilt ?? 0)) }
}

const KEY = 'chambre-lofi.noise'

export function loadNoise(): NoiseSetting {
  try {
    return cleanNoise(JSON.parse(localStorage.getItem(KEY) ?? 'null')) ?? DEFAULT_NOISE
  } catch {
    return DEFAULT_NOISE
  }
}

export function storeNoise(n: NoiseSetting) {
  try {
    localStorage.setItem(KEY, JSON.stringify(n))
  } catch {
    // pas de stockage : on ne s'en souviendra pas
  }
}
