import { Color, ColorManagement, DoubleSide, MeshPhysicalMaterial, MeshStandardMaterial, ShaderChunk, type MeshPhysicalMaterialParameters } from 'three'
import { woodTex } from './textures'

// Même rendu que le prototype, qui tourne sur three r128 :
// - pas de gestion des couleurs, les hex sont utilisés tels quels (avec <Canvas legacy linear flat>).
//   À régler avant de créer la moindre couleur, d'où sa place ici.
ColorManagement.enabled = false
// - three r155+ a retiré l'éclairage « legacy » de r128. Les intensités sont multipliées par π là où on les règle,
//   et on remet ici l'atténuation linéaire des lumières ponctuelles (la lampe de nuit).
ShaderChunk.lights_pars_begin = ShaderChunk.lights_pars_begin.replace(
  /(float getDistanceAttenuation\([^)]*\) \{)[\s\S]*?\n\}/,
  '$1\n\tif ( cutoffDistance > 0.0 && decayExponent > 0.0 ) return pow( saturate( 1.0 - lightDistance / cutoffDistance ), decayExponent );\n\treturn 1.0;\n}',
)

// Gummy : un peu brillant, vernis doux.
export const gummy = (color: number, o: MeshPhysicalMaterialParameters = {}) =>
  new MeshPhysicalMaterial({ color, roughness: 0.46, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.3, ...o })

/** Palette partagée. */
export const M = {
  wallBack: gummy(0xeae1f1, { roughness: 0.78, clearcoat: 0.12 }),
  wallLeft: gummy(0xf3e8e1, { roughness: 0.78, clearcoat: 0.12 }),
  base: gummy(0xc5b3dc, { roughness: 0.6 }),
  floor: gummy(0xffffff, { map: woodTex, roughness: 0.5, clearcoat: 0.45 }),
  toffee: gummy(0xc77f5e),
  toffeeLight: gummy(0xe2b08b),
  cream: gummy(0xfff7ef, { roughness: 0.62, clearcoat: 0.25 }),
  pillow: gummy(0xfffaf4, { roughness: 0.66, clearcoat: 0.2 }),
  teal: gummy(0x37a3b5),
  tealLight: gummy(0x9edbe0),
  pink: gummy(0xf3afc6),
  mint: gummy(0x8fd8c6),
  mintDark: gummy(0x58b3a3),
  butter: gummy(0xf6d071),
  plum: gummy(0x4a3a5a, { roughness: 0.38 }),
  peri: gummy(0xabb6ef, { roughness: 0.7, clearcoat: 0.2 }),
  woodLight: gummy(0xecc9a0),
  woodLeg: gummy(0xd8ad85),
  terracotta: gummy(0xee9d86),
  leaf: gummy(0x67bb7c),
  leaf2: gummy(0x8ed59b),
  fur: gummy(0xb7b4ca, { roughness: 0.62, clearcoat: 0.2 }),
  furDark: gummy(0x8a879f, { roughness: 0.6 }),
  furLight: gummy(0xe6e3ee, { roughness: 0.62 }),
  nose: gummy(0xf4a3b5),
  ink: gummy(0x2e2438, { roughness: 0.3 }),
  cloud: gummy(0xfdfbff, { roughness: 0.55, clearcoat: 0.35 }),
  lampCap: gummy(0xffd9a6, { emissive: 0xffa94d, emissiveIntensity: 0.05 }),
  dial: gummy(0xfff3d6, { emissive: 0xffcf7a, emissiveIntensity: 0.1 }),
  red: gummy(0xe0586e),
  mug: gummy(0xfdf6ff),
  glass: new MeshPhysicalMaterial({ color: 0xe2f4ff, transparent: true, opacity: 0.16, roughness: 0.05, clearcoat: 1, depthWrite: false, side: DoubleSide }),
}

/** Ampoules de la guirlande (jaune, rose, menthe). */
export const fairyMats = [0xffd36b, 0xff9fc0, 0x8ff0dc].map(
  (c) => new MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.2, roughness: 0.4 }),
)

/** Couleurs du nuage, sec et sous la pluie. (Celles des lumières sont dans les données de la pièce.) */
export const COL = {
  cloudDay: new Color(0xfdfbff), cloudRain: new Color(0xb9b6cf),
}
