import type { Loops } from './types'

/**
 * Les enregistrements de la météo, pour les pièces qui n'ont pas les leurs : une pluie (celle du café, « CALMING RAIN ») et un vent
 * froid (celui de la cabane) pour la neige et la tempête de neige. Une pièce qui a sa pluie la garde (`...WEATHER_LOOPS, rain: …`).
 */
export const WEATHER_LOOPS: Loops = {
  rain: { src: 'audio/cafe/rain', gain: 1 },
  blizzard: { src: 'audio/cabin/wind', gain: 0.9 },
}
