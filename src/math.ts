export const TAU = Math.PI * 2
export const rand = (a: number, b: number) => a + Math.random() * (b - a)
/** Générateur pseudo-aléatoire à graine : les décors dessinés au hasard (bois, étoiles, photos) sont les mêmes à chaque visite. */
export const seeded = (seed: number) => {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (x: number) => x * x * (3 - 2 * x)
/** Avance `v` vers `t`, d'au plus `s`. */
export const approach = (v: number, t: number, s: number) => (v < t ? Math.min(t, v + s) : Math.max(t, v - s))
