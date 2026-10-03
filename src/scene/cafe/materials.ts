import { DoubleSide, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { gummy } from '../materials'
import { WIN } from '../parts'
import { paneH, paneW } from '../objects/Window'
import { cafeFloorTex, cafeWallTex, chalkTex, glassTex, paintingTex, tartanChairTex, tartanRugTex, tartanSmallTex, tilesTex, matTex, wallpaperTex } from './textures'

// Le mur du fond est une extrusion : ses UV sont ses coordonnées, en unités. Une tuile couvre 1 de large et 4.4 de haut
// (de y = -0.05 à 4.35).
cafeWallTex.repeat.set(1, 1 / 4.4)
cafeWallTex.offset.set(0, 0.05 / 4.4)

/**
 * Matériaux du café. Dedans, tout est chaud : chêne miel, noyer, vert bouteille, bordeaux, laiton, crème.
 * Dehors (la vue, le réverbère) reste froid et bleuté : c'est ce contraste qui fait le cocon.
 */
export const K = {
  wall: gummy(0xffffff, { map: cafeWallTex, roughness: 0.82, clearcoat: 0.08 }),
  floor: gummy(0xffffff, { map: cafeFloorTex, roughness: 0.58, clearcoat: 0.22, clearcoatRoughness: 0.55 }),
  base: gummy(0x8e94a3, { roughness: 0.6 }),
  stone: gummy(0xd8bf95, { roughness: 0.8, clearcoat: 0.08 }),
  walnut: gummy(0x6e4430, { roughness: 0.5 }),
  oak: gummy(0xb07a52, { roughness: 0.5 }),
  green: gummy(0x2c5a4c),
  velvet: gummy(0x2f6b58, { roughness: 0.85, clearcoat: 0.05 }),
  burgundy: gummy(0x8e2f3a),
  navy: gummy(0x25365e),
  teal: gummy(0x37a3b5),
  cream: gummy(0xf6ead6),
  tweed: gummy(0x8a7458, { roughness: 0.9, clearcoat: 0.03 }),
  paper: new MeshStandardMaterial({ map: wallpaperTex, roughness: 0.8 }),
  coir: gummy(0xffffff, { map: matTex, roughness: 0.95, clearcoat: 0 }),
  marble: gummy(0xf4efe8, { roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1 }),
  mustard: gummy(0xd9a441),
  wool: gummy(0xf3e8d6, { roughness: 0.9, clearcoat: 0.02 }),
  steel: gummy(0xd7dee4, { roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12 }),
  brass: gummy(0xd9a84a, { roughness: 0.3, clearcoat: 0.9 }),
  iron: gummy(0x2a2428, { roughness: 0.45, clearcoat: 0.5 }),
  slate: gummy(0x3b3a44, { roughness: 0.55 }),
  soot: gummy(0x161214, { roughness: 0.9, clearcoat: 0 }),
  tartan: gummy(0xffffff, { map: tartanRugTex, roughness: 0.88, clearcoat: 0.03 }),
  stewart: gummy(0xffffff, { map: tartanChairTex, roughness: 0.85, clearcoat: 0.05 }),
  stewartSmall: gummy(0xffffff, { map: tartanSmallTex, roughness: 0.85, clearcoat: 0.05 }),
  chalk: new MeshStandardMaterial({ map: chalkTex, roughness: 0.9 }),
  tiles: new MeshStandardMaterial({ map: tilesTex, roughness: 0.35 }),
  painting: new MeshStandardMaterial({ map: paintingTex, roughness: 0.75 }),
  skin: gummy(0xf4c6a5, { roughness: 0.6 }),
  skinDark: gummy(0xc68d6a, { roughness: 0.6 }),
  ginger: gummy(0xd9733a, { roughness: 0.6 }),
  darkHair: gummy(0x3a2a24, { roughness: 0.6 }),
  jumper: gummy(0x4f8a6e, { roughness: 0.8, clearcoat: 0.05 }),
  scone: gummy(0xd9a066, { roughness: 0.7 }),
  berry: gummy(0xc23b52),
  wax: gummy(0xfff4e0, { roughness: 0.6, emissive: 0xffd7a0, emissiveIntensity: 0.15 }),
  thistle: gummy(0x9a6cc8, { roughness: 0.6 }),
  leaf: gummy(0x4f9a6a),
  leafDark: gummy(0x3a7a52),
  pot: gummy(0xc9764f),
  dog: gummy(0x8d8794, { roughness: 0.85, clearcoat: 0.05 }),
  dogLight: gummy(0xb9b3bd, { roughness: 0.85, clearcoat: 0.05 }),
  puddle: gummy(0x5a6b80, { roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.02, transparent: true, opacity: 0.55 }),
  // Ce qui brille de soi-même : verre de lampe, ampoules, braises (leur intensité suit le jour / nuit ou le feu).
  bankerGlass: gummy(0x2f8a5c, { roughness: 0.2, clearcoat: 1, emissive: 0x3fbf7a, emissiveIntensity: 0.05, side: DoubleSide }),
  bulb: new MeshStandardMaterial({ color: 0xffe2a8, emissive: 0xffb45e, emissiveIntensity: 1.2, roughness: 0.3 }),
  coal: new MeshStandardMaterial({ color: 0x241a1a, emissive: 0xff5a1e, emissiveIntensity: 0, roughness: 0.8 }),
  led: new MeshStandardMaterial({ color: 0xff7a4d, emissive: 0xff5a2a, emissiveIntensity: 0.1 }),
}

// La vitrine : une seule image (buée, gouttes, enseigne) pour les deux battants. Chaque vitre en montre sa part,
// pour que l'enseigne suive son battant quand on ouvre.
const span = WIN.x1 - WIN.x0, tall = WIN.y1 - WIN.y0
function paneGlass(x0: number) {
  const map = glassTex.clone()
  map.repeat.set((paneW - 0.16) / span, (paneH - 0.16) / tall)
  map.offset.set((x0 - WIN.x0) / span, (WIN.y0 + 0.02 + 0.08 - WIN.y0) / tall)
  return new MeshBasicMaterial({ map, transparent: true, depthWrite: false, side: DoubleSide })
}
export const shopGlass: [MeshBasicMaterial, MeshBasicMaterial] = [paneGlass(WIN.x0 + 0.01 + 0.08), paneGlass(WIN.x1 - 0.01 - paneW + 0.08)]
