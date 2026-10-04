import { MeshStandardMaterial } from 'three'
import { M, gummy } from '../materials'
import { foliage, leafy } from '../nature/materials'
import { berberTex, corkTex, parquetTex, plasterTex, screenTex, sketchTex, watercolorTex } from './textures'

const wallPlaster = plasterTex.clone()
wallPlaster.repeat.set(1, 1 / 4.4)
const leftPlaster = plasterTex.clone()
leftPlaster.repeat.set(4, 3)
const floor = parquetTex.clone()
floor.repeat.set(4.5, 4.5)

/**
 * L'atelier sous les toits : enduit crème, vieux chêne, acier noir de la verrière, et des couleurs d'illustratrice
 * (sauge, ocre, terre cuite, bleu de Prusse, rose poudré).
 */
export const A = {
  stone: gummy(0xe6dbc8, { roughness: 0.75, clearcoat: 0.05 }),
  zinc: gummy(0x8f9aa8, { roughness: 0.4, clearcoat: 0.6 }),
  slab: gummy(0xb08a62, { roughness: 0.7 }),
  floor: gummy(0xffffff, { map: floor, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
  wall: gummy(0xffffff, { map: wallPlaster, roughness: 0.9, clearcoat: 0.02 }),
  plaster: new MeshStandardMaterial({ map: leftPlaster, roughness: 0.92 }),
  steel: gummy(0x26262c, { roughness: 0.4, clearcoat: 0.5 }),
  oak: gummy(0xc89a68, { roughness: 0.5 }),
  oakDark: gummy(0x8a5e3a, { roughness: 0.5 }),
  white: gummy(0xf6f2ea, { roughness: 0.5 }),
  sage: gummy(0x9db59a, { roughness: 0.6 }),
  ochre: gummy(0xd9a441, { roughness: 0.75, clearcoat: 0.1 }),
  terracotta: gummy(0xc7703e, { roughness: 0.6 }),
  prussian: gummy(0x2c4a6e, { roughness: 0.6 }),
  blush: gummy(0xf0c4bc, { roughness: 0.6 }),
  cream: gummy(0xf6ead6, { roughness: 0.55 }),
  leaf: gummy(0x5a9a68),
  leafDark: gummy(0x3a7a52),
  leafV: leafy(0x5fa46c),
  leafVDark: leafy(0x3f8058),
  rubber: leafy(0x3a6e50, { roughness: 0.3, clearcoat: 0.8 }),
  rubberLight: leafy(0x5a9468, { roughness: 0.3, clearcoat: 0.8 }),
  succulent: leafy(0x9ab8a0, { roughness: 0.6, clearcoat: 0.3 }),
  succulentPink: leafy(0xc8a4a8, { roughness: 0.6, clearcoat: 0.3 }),
  herbF: foliage(0x7ab468),
  pot: M.terracotta,
  rug: gummy(0xffffff, { map: berberTex, roughness: 0.95, clearcoat: 0 }),
  sketch: new MeshStandardMaterial({ map: sketchTex, roughness: 0.9 }),
  cork: new MeshStandardMaterial({ map: corkTex, roughness: 0.95 }),
  screen: new MeshStandardMaterial({ map: screenTex, emissiveMap: screenTex, emissive: 0xffffff, emissiveIntensity: 0.55, roughness: 0.2 }),
  painting: new MeshStandardMaterial({ map: watercolorTex, roughness: 0.9 }),
  vinyl: gummy(0x1a181e, { roughness: 0.25, clearcoat: 0.9 }),
  label: gummy(0xe0586e),
  glass: M.glass,
  brass: M.brass,
  bulb: M.bulb,
  ink: M.ink,
  shade: gummy(0x2c4a6e, { roughness: 0.4, clearcoat: 0.6, emissive: 0xffc98a, emissiveIntensity: 0 }),
  baguette: gummy(0xd9a066, { roughness: 0.6 }),
  paper: gummy(0xe9dcc0, { roughness: 0.9, clearcoat: 0 }),
  basket: gummy(0xc9a26a, { roughness: 0.8, clearcoat: 0.05 }),
  lampShade: gummy(0xf3e7d2, { roughness: 0.85, emissive: 0xffc07a, emissiveIntensity: 0 }),
}
