import { MeshStandardMaterial } from 'three'
import { gummy } from '../materials'
import { cafeFloorTex, cafeWallTex, chalkTex, tartanTex } from './textures'

// Le mur du fond est une extrusion : ses UV sont ses coordonnées, en unités. Une tuile couvre 1 de large et 4.4 de haut
// (de y = -0.05 à 4.35).
cafeWallTex.repeat.set(1, 1 / 4.4)
cafeWallTex.offset.set(0, 0.05 / 4.4)

/** Matériaux propres au café (les pastels communs sont dans ../materials). */
export const K = {
  wall: gummy(0xffffff, { map: cafeWallTex, roughness: 0.8, clearcoat: 0.1 }),
  floor: gummy(0xffffff, { map: cafeFloorTex, roughness: 0.45, clearcoat: 0.5 }),
  base: gummy(0xb9bcc8, { roughness: 0.6 }),
  stone: gummy(0xcdbfa8, { roughness: 0.75, clearcoat: 0.1 }),
  walnut: gummy(0x7a4a35, { roughness: 0.55 }),
  oak: gummy(0xb07a52, { roughness: 0.55 }),
  green: gummy(0x2f5d50),
  burgundy: gummy(0x8e2f3a),
  navy: gummy(0x25365e),
  mustard: gummy(0xe0b84a),
  steel: gummy(0xd7dee4, { roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12 }),
  brass: gummy(0xd9a84a, { roughness: 0.32 }),
  tartan: gummy(0xffffff, { map: tartanTex, roughness: 0.85, clearcoat: 0.05 }),
  chalk: new MeshStandardMaterial({ map: chalkTex, roughness: 0.9 }),
  skin: gummy(0xf4c6a5, { roughness: 0.6 }),
  skinDark: gummy(0xc68d6a, { roughness: 0.6 }),
  ginger: gummy(0xd9733a, { roughness: 0.6 }),
  darkHair: gummy(0x3a2a24, { roughness: 0.6 }),
  jumper: gummy(0x4f8a6e, { roughness: 0.75, clearcoat: 0.1 }),
  scone: gummy(0xd9a066, { roughness: 0.7 }),
  led: new MeshStandardMaterial({ color: 0xff7a4d, emissive: 0xff5a2a, emissiveIntensity: 0.1 }),
}
