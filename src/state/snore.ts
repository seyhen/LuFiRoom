// Le chien endormi de la cabane : le rythme de sa respiration, partagé par le son (src/audio/channels/snore.ts, qui programme chaque
// souffle) et par le corps (src/scene/cabin/Dog.tsx, dont le flanc monte et descend avec). Pur : testé dans tests/snore.test.mjs.

/** Un souffle dure `PERIOD` secondes en moyenne (le son varie un peu d'un souffle à l'autre, la scène se recale à chacun). */
export const PERIOD = 4.5
/** La part du souffle passée à inspirer (le flanc monte), puis il expire plus longtemps, avec le ronflement. */
export const INHALE = 0.38
/** Un chien qui dort sans ronfler respire plus lentement, plus doucement. */
export const IDLE_PERIOD = 5.8

const ease = (x: number) => x * x * (3 - 2 * x)

/** Le gonflement du flanc (0 à 1) à la phase `phase` du souffle (en tours : seule la partie fractionnaire compte). Vaut 0 au début et à la fin d'un souffle : la phase peut être recalée sans saut. */
export function breath(phase: number): number {
  const p = phase - Math.floor(phase)
  return p < INHALE ? ease(p / INHALE) : 1 - ease((p - INHALE) / (1 - INHALE))
}

/** De combien de tours (-0,5 à 0,5) il faut décaler `phase` pour tomber sur le début d'un souffle : la correction à l'arrivée de chaque souffle du son. */
export function toBreathStart(phase: number): number {
  return Math.round(phase) - phase
}
