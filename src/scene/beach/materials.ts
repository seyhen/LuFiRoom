import { DoubleSide, MeshStandardMaterial } from 'three'
import { M, gummy } from '../materials'
import { boardTex, juteTex, plankTex, stripes, weaveTex } from './textures'

// Le mur du fond est une extrusion : ses UV sont ses coordonnées (1 unité de large, 4.4 de haut par tuile).
const wallBoards = boardTex.clone()
wallBoards.repeat.set(1, 1 / 4.4)
wallBoards.offset.set(0, 0.05 / 4.4)
const leftBoards = boardTex.clone()
leftBoards.repeat.set(6.5, 1)
const floorPlanks = plankTex.clone()
floorPlanks.repeat.set(3.2, 3.2)

/**
 * Le bungalow : bois blanchi par le sel, rotin miel, lin, et les couleurs de la plage au soleil couchant (corail, turquoise,
 * verre de mer, beurre). Tout est clair et chaud ; le soir, la lampe de rotin et la lune font le reste.
 */
export const B = {
  base: gummy(0xe9d3a8, { roughness: 0.75, clearcoat: 0.1 }),
  floor: gummy(0xffffff, { map: floorPlanks, roughness: 0.55, clearcoat: 0.3 }),
  slab: gummy(0xd9c2a0, { roughness: 0.7 }),
  wall: gummy(0xffffff, { map: wallBoards, roughness: 0.8, clearcoat: 0.08 }),
  boards: new MeshStandardMaterial({ map: leftBoards, roughness: 0.82 }),
  trim: gummy(0xfaf6ef, { roughness: 0.5 }),
  driftwood: gummy(0xc9b49a, { roughness: 0.7, clearcoat: 0.15 }),
  wood: gummy(0xb98a5e, { roughness: 0.55 }),
  rattan: gummy(0xffffff, { map: weaveTex, roughness: 0.65, clearcoat: 0.2 }),
  cane: gummy(0xd9b27c, { roughness: 0.6, clearcoat: 0.25 }),
  linen: gummy(0xf7f1e6, { roughness: 0.85, clearcoat: 0.05 }),
  sand: gummy(0xead2a6, { roughness: 0.8, clearcoat: 0.05 }),
  coral: gummy(0xf08a76),
  turquoise: gummy(0x3fb8b0),
  seaglass: gummy(0xa8dccb),
  navy: gummy(0x2f4a6b),
  butter: M.butter,
  pink: M.pink,
  shell: gummy(0xfde7da, { roughness: 0.35, clearcoat: 0.8 }),
  shellPink: gummy(0xf7c3b4, { roughness: 0.35, clearcoat: 0.8 }),
  leaf: gummy(0x4fa877),
  leafLight: gummy(0x7fc98f),
  leafDark: gummy(0x2f7d58),
  jute: gummy(0xffffff, { map: juteTex, roughness: 0.9, clearcoat: 0 }),
  stripeCoral: gummy(0xffffff, { map: stripes('#f6efe4', '#f08a76', 8), roughness: 0.8, clearcoat: 0.05 }),
  stripeNavy: gummy(0xffffff, { map: stripes('#f6efe4', '#2f4a6b', 10), roughness: 0.8, clearcoat: 0.05 }),
  stripeTowel: gummy(0xffffff, { map: stripes('#3fb8b0', '#f6d071', 6), roughness: 0.85, clearcoat: 0.03 }),
  lemonade: gummy(0xf9e27a, { transparent: true, opacity: 0.85, roughness: 0.1, clearcoat: 1 }),
  glass: M.glass,
  sheer: gummy(0xfffcf6, { transparent: true, opacity: 0.72, roughness: 0.9, clearcoat: 0, side: DoubleSide, depthWrite: false }),
  lampShade: gummy(0xffffff, { map: weaveTex, roughness: 0.7, emissive: 0xffa95e, emissiveIntensity: 0.0 }),
  gull: gummy(0xffffff, { roughness: 0.6, clearcoat: 0.3 }),
  gullGrey: gummy(0xb9c3cf, { roughness: 0.6 }),
  beak: gummy(0xf6c544),
  ink: M.ink,
  rope: gummy(0xd8c49c, { roughness: 0.9, clearcoat: 0 }),
}
