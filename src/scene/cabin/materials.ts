import { MeshBasicMaterial } from 'three'
import { gummy } from '../materials'
import { floorTex, wallTex } from './textures'

/** Matériaux propres à la cabane (les pastels communs sont dans ../materials). */
export const C = {
  wall: gummy(0xffffff, { map: wallTex, roughness: 0.8, clearcoat: 0.12 }),
  floor: gummy(0xffffff, { map: floorTex, roughness: 0.55, clearcoat: 0.4 }),
  /** Le socle sous la neige. */
  base: gummy(0xdde6f4, { roughness: 0.6 }),
  beam: gummy(0xb9794f),
  log: gummy(0x9a6244, { roughness: 0.7, clearcoat: 0.2 }),
  charred: gummy(0x4a3a3f, { roughness: 0.8, clearcoat: 0.1 }),
  stone: gummy(0xd3cbe3, { roughness: 0.62 }),
  stoneDark: gummy(0xa89dc0, { roughness: 0.62 }),
  wool: gummy(0xfffaf3, { roughness: 0.85, clearcoat: 0.05 }),
  pine: gummy(0x4f9d8c),
  // Les flammes brillent d'elles-mêmes : pas de lumière à calculer.
  flame: new MeshBasicMaterial({ color: 0xff8a3d, transparent: true, opacity: 0.92 }),
  flameCore: new MeshBasicMaterial({ color: 0xffd36b, transparent: true, opacity: 0.95 }),
  snow: new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }),
}
