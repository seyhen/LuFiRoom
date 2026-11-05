import { rbox } from '../parts'

/**
 * Une boîte arrondie dont la finesse suit la taille : une latte ou un petit objet n'a pas besoin des 432 triangles d'une grande
 * caisse (le chant arrondi à 1 ou 2 segments se lit pareil). Garde le budget de triangles de la pièce.
 */
export const rb = (w: number, h: number, d: number, r = 0.06) => {
  const m = Math.min(w, h, d), M = Math.max(w, h, d)
  return rbox(w, h, d, r, m < 0.06 || M < 0.1 ? 1 : M < 0.3 ? 2 : 3)
}
