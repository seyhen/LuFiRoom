import { AdditiveBlending, DoubleSide, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { gummy } from '../materials'
import { knitTex } from '../textures'
import {
  floorTex, keysTex, leafPrintTex, moonPrintTex, moonsTex, muralTex, notebookTex, polaroidsTex, quiltTex, rainGlassTex, rugTex, screenTex,
  starGlowTex, sunsetPrintTex, wallBackTex, windowLightTex,
} from './textures'

const knitBlush = knitTex.clone()
knitBlush.repeat.set(5, 2)
const knitLilac = knitTex.clone()
knitLilac.repeat.set(2, 2)

/** Matériaux propres à la chambre (les pastels communs sont dans ../materials). */
export const B = {
  floor: gummy(0xffffff, { map: floorTex, roughness: 0.5, clearcoat: 0.45 }),
  wallBack: gummy(0xffffff, { map: wallBackTex, roughness: 0.78, clearcoat: 0.1 }),
  /** Chants du mur du fond (dont l'embrasure de la fenêtre). */
  wallEdge: gummy(0xeee6f6, { roughness: 0.78, clearcoat: 0.12 }),
  /** Mur de gauche : fresque, et les étoiles collées sur le mur qui brillent la nuit (voir BedroomShell). */
  mural: new MeshStandardMaterial({ map: muralTex, roughness: 0.85, emissive: 0xffffff, emissiveMap: starGlowTex, emissiveIntensity: 0 }),
  trim: gummy(0xfff8f0, { roughness: 0.55, clearcoat: 0.35 }),
  // bois clair, rose, lilas
  birch: gummy(0xf2d5b0),
  blush: gummy(0xf6c3d3),
  blushDeep: gummy(0xee9db6),
  lilac: gummy(0xcdbcf0),
  lilacDeep: gummy(0xa592e0),
  mintSoft: gummy(0xa9e1d1),
  cloud: gummy(0xfffaf6, { roughness: 0.55, clearcoat: 0.25 }),
  // lit
  quilt: gummy(0xffffff, { map: quiltTex, roughness: 0.8, clearcoat: 0.08 }),
  knitBlush: gummy(0xf6bfd0, { map: knitBlush, roughness: 0.88, clearcoat: 0.04 }),
  knitLilac: gummy(0xd8c8f4, { map: knitLilac, roughness: 0.88, clearcoat: 0.04 }),
  // sol
  rug: gummy(0xffffff, { map: rugTex, roughness: 0.92, clearcoat: 0.02 }),
  rugEdge: gummy(0xcdbcf0, { roughness: 0.9, clearcoat: 0.02 }),
  // bureau
  laptop: gummy(0xcfc3ee, { roughness: 0.4 }),
  keys: gummy(0xffffff, { map: keysTex, roughness: 0.7, clearcoat: 0.1 }),
  screen: new MeshStandardMaterial({ map: screenTex, emissive: 0xffffff, emissiveMap: screenTex, emissiveIntensity: 0.5, roughness: 0.4 }),
  notebook: gummy(0xffffff, { map: notebookTex, roughness: 0.8, clearcoat: 0.05 }),
  // fenêtre
  curtain: gummy(0xf8c9d8, { roughness: 0.85, clearcoat: 0.05, side: DoubleSide }),
  curtainLight: gummy(0xfbdce6, { roughness: 0.85, clearcoat: 0.05, side: DoubleSide }),
  lightPatch: new MeshBasicMaterial({ map: windowLightTex, color: 0xffe9b8, transparent: true, blending: AdditiveBlending, depthWrite: false, opacity: 0 }),
  rainGlass: new MeshBasicMaterial({ map: rainGlassTex, transparent: true, depthWrite: false, opacity: 0 }),
  // cadres et décors à plat
  sunset: new MeshStandardMaterial({ map: sunsetPrintTex, roughness: 0.8 }),
  moonPrint: new MeshStandardMaterial({ map: moonPrintTex, roughness: 0.8 }),
  leafPrint: new MeshStandardMaterial({ map: leafPrintTex, roughness: 0.8 }),
  polaroids: new MeshStandardMaterial({ map: polaroidsTex, roughness: 0.9, transparent: true, alphaTest: 0.04, side: DoubleSide }),
  moons: new MeshStandardMaterial({ map: moonsTex, roughness: 0.9, transparent: true, alphaTest: 0.04, side: DoubleSide, emissive: 0xffffff, emissiveMap: moonsTex, emissiveIntensity: 0 }),
  // plantes
  leafDeep: gummy(0x3f9f78),
  leafPale: gummy(0x9fdcb0),
  soil: gummy(0x5a4046, { roughness: 0.9, clearcoat: 0 }),
}
