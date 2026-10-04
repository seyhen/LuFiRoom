import { DoubleSide, MeshBasicMaterial } from 'three'
import { gummy, M } from '../materials'
import { brickTex, izakayaTex, lanternTex, latticeTex, manholeTex, menuTex, noboriTex, norenTex, pavingTex, posterTex, sakeSignTex, shutterTex, stripeTex, vendingTex, whiteLanternTex, yakisugiTex } from './textures'

/** Matériaux propres au marché de nuit : pavés mouillés, brique fumée, rideau de fer, bois de la carriole, indigo, laque rouge, néon. */
export const K = {
  paving: gummy(0xffffff, { map: pavingTex, roughness: 0.4, clearcoat: 0.55 }),
  brick: gummy(0xffffff, { map: brickTex, roughness: 0.85, clearcoat: 0.08 }),
  shutter: gummy(0xffffff, { map: shutterTex, roughness: 0.5, clearcoat: 0.35 }),
  plaster: gummy(0x4b3a5c, { roughness: 0.9, clearcoat: 0.05 }),
  wood: gummy(0x8a5636, { roughness: 0.55, clearcoat: 0.35 }),
  woodDark: gummy(0x4e3128, { roughness: 0.55, clearcoat: 0.3 }),
  woodPale: gummy(0xd8a878, { roughness: 0.5, clearcoat: 0.3 }),
  steel: gummy(0xa5b0c2, { roughness: 0.3, clearcoat: 0.7 }),
  steelDark: gummy(0x4b5568, { roughness: 0.4, clearcoat: 0.5 }),
  iron: gummy(0x2c2838, { roughness: 0.45, clearcoat: 0.4 }),
  rust: gummy(0x9a5a3a, { roughness: 0.7, clearcoat: 0.1 }),
  brass: M.brass,
  red: gummy(0xd6334f, { roughness: 0.4, clearcoat: 0.8 }),
  redDark: gummy(0x8a2036, { roughness: 0.45, clearcoat: 0.6 }),
  indigo: gummy(0x27358c, { roughness: 0.8, clearcoat: 0.05 }),
  cream: gummy(0xf0e6d0, { roughness: 0.6, clearcoat: 0.3 }),
  bowl: gummy(0xf6f0e4, { roughness: 0.3, clearcoat: 0.9 }),
  vinyl: gummy(0xd6334f, { roughness: 0.35, clearcoat: 0.9 }),
  teal: gummy(0x2f9a98, { roughness: 0.45, clearcoat: 0.5 }),
  yellow: gummy(0xf2c04a, { roughness: 0.5, clearcoat: 0.5 }),
  stripe: gummy(0xffffff, { map: stripeTex, roughness: 0.9, clearcoat: 0.02, side: DoubleSide }),
  /** Les pans du noren : découpés à l'alpha, sans transparence (ils restent dans <Static> et se trient bien). */
  noren: gummy(0xffffff, { map: norenTex, alphaTest: 0.5, roughness: 0.9, clearcoat: 0.02, side: DoubleSide }),
  menu: gummy(0xffffff, { map: menuTex, roughness: 0.8, clearcoat: 0.1 }),
  lantern: gummy(0xffffff, { map: lanternTex, emissive: 0xff4a2c, emissiveMap: lanternTex, emissiveIntensity: 0.15, roughness: 0.6, clearcoat: 0.15 }),
  lanternCap: gummy(0x1a0f12, { roughness: 0.5, clearcoat: 0.5 }),
  glass: gummy(0xd8e8ff, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.18 }),
  /** Le bouillon : brun doré, un peu lumineux. Les nouilles : jaune pâle. */
  broth: gummy(0xc98a3c, { roughness: 0.2, clearcoat: 0.9, emissive: 0x8a4a14, emissiveIntensity: 0.25 }),
  noodle: gummy(0xf2d88a, { roughness: 0.5, clearcoat: 0.5 }),
  egg: gummy(0xfff4dc, { roughness: 0.4, clearcoat: 0.6 }),
  yolk: gummy(0xf6a828, { roughness: 0.4, clearcoat: 0.6 }),
  pork: gummy(0xe9a890, { roughness: 0.5, clearcoat: 0.4 }),
  scallion: gummy(0x6fcf6a, { roughness: 0.6, clearcoat: 0.3 }),
  nori: gummy(0x1d2b24, { roughness: 0.6, clearcoat: 0.3 }),
  /** Le disque d'une flaque : miroir sombre, un peu bleuté. */
  puddle: gummy(0x3a3560, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.5 }),
  posters: [gummy(0xffffff, { map: posterTex('#ff7a9c', '#5a3a8a', 5), roughness: 0.8, clearcoat: 0.1 }), gummy(0xffffff, { map: posterTex('#5ad0d8', '#27358c', 9), roughness: 0.8, clearcoat: 0.1 }), gummy(0xffffff, { map: posterTex('#ffd36a', '#c4323f', 13), roughness: 0.8, clearcoat: 0.1 })],
  yakisugi: gummy(0xffffff, { map: yakisugiTex, roughness: 0.7, clearcoat: 0.2 }),
  nobori: gummy(0xffffff, { map: noboriTex, roughness: 0.8, clearcoat: 0.05, side: DoubleSide }),
  sakeSign: gummy(0xffffff, { map: sakeSignTex, roughness: 0.6, clearcoat: 0.3 }),
  manhole: gummy(0xffffff, { map: manholeTex, roughness: 0.35, clearcoat: 0.7 }),
  lanternWhite: gummy(0xffffff, { map: whiteLanternTex, emissive: 0xffc070, emissiveMap: whiteLanternTex, emissiveIntensity: 0.2, roughness: 0.6, clearcoat: 0.15 }),
  /** La fenêtre à treillis et la porte de l'izakaya brillent d'une lumière chaude (jamais éteinte : le bar est ouvert). */
  lattice: new MeshBasicMaterial({ map: latticeTex, color: 0xd8c8b8 }),
  izakaya: new MeshBasicMaterial({ map: izakayaTex, color: 0xd8c8b8, side: DoubleSide }),
  /** Le distributeur : sa face brille de l'intérieur, teintée par le jour. */
  vending: new MeshBasicMaterial({ map: vendingTex, color: 0xb8b8c8 }),
}
