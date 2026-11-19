import { AdditiveBlending, DoubleSide, MeshBasicMaterial } from 'three'
import { M, gummy } from '../materials'
import { leafy, moss, stone } from '../nature/materials'
import {
  adobeTex, awningTex, barkTex, cushionA, cushionB, kilimHang, lanternCast, lanternColor, lanternGlow, potTex, ringTex, rosetteTex, rugBig, rugSmall,
  sandTex, streamTex, strataTex, trayTex, waterTex, wetTex,
} from './textures'

/**
 * L'oasis : le sable doré, le pisé rose des murs, le grès strié du socle, la toile rayée indigo et terre cuite, le bois d'acacia et
 * de palmier, le laiton et le cuivre, les laines des tapis, le cuir orange, l'eau turquoise de la mare, les palmes olive.
 */
export const D = {
  sand: gummy(0xffffff, { map: sandTex, roughness: 0.96, clearcoat: 0 }),
  strata: gummy(0xffffff, { map: strataTex, roughness: 0.9, clearcoat: 0.04 }),
  adobe: gummy(0xffffff, { map: adobeTex, roughness: 0.94, clearcoat: 0, side: DoubleSide }),
  plaster: gummy(0xe6c196, { roughness: 0.92, clearcoat: 0 }),
  mudCap: gummy(0xb97b4e, { roughness: 0.95, clearcoat: 0 }),
  // la toile de l'auvent : double face, les festons du bord libre sont découpés par la transparence
  awning: gummy(0xffffff, { map: awningTex, roughness: 0.92, clearcoat: 0, side: DoubleSide, alphaTest: 0.5 }),
  pole: gummy(0x7c5230, { roughness: 0.7, clearcoat: 0.12 }),
  poleDark: gummy(0x4f3320, { roughness: 0.7, clearcoat: 0.1 }),
  beam: gummy(0x8a6a44, { roughness: 0.85, clearcoat: 0.02 }),
  beamEnd: gummy(0xc89a62, { roughness: 0.8, clearcoat: 0.04 }),
  rope: gummy(0xd8c69a, { roughness: 0.9, clearcoat: 0 }),
  iron: gummy(0x3a3836, { roughness: 0.45, metalness: 0.35, clearcoat: 0.35 }),
  brass: M.brass,
  brassDull: gummy(0xb98a38, { roughness: 0.42, metalness: 0.4, clearcoat: 0.5 }),
  copper: gummy(0xc0663a, { roughness: 0.3, metalness: 0.45, clearcoat: 0.8 }),
  tray: gummy(0xffffff, { map: trayTex, roughness: 0.34, metalness: 0.35, clearcoat: 0.7 }),
  silver: gummy(0xe0ddd2, { roughness: 0.24, metalness: 0.5, clearcoat: 0.8 }),
  silverDark: gummy(0xb4b1a6, { roughness: 0.32, metalness: 0.4, clearcoat: 0.6 }),
  // les tapis, les coussins, les étoffes
  rugBig: gummy(0xffffff, { map: rugBig, roughness: 0.96, clearcoat: 0, transparent: true, alphaTest: 0.4 }),
  rugSmall: gummy(0xffffff, { map: rugSmall, roughness: 0.96, clearcoat: 0, transparent: true, alphaTest: 0.4 }),
  kilim: gummy(0xffffff, { map: kilimHang, roughness: 0.95, clearcoat: 0 }),
  cushionA: gummy(0xffffff, { map: cushionA, roughness: 0.92, clearcoat: 0.03 }),
  cushionB: gummy(0xffffff, { map: cushionB, roughness: 0.92, clearcoat: 0.03 }),
  cushionPlain: gummy(0xb5532c, { roughness: 0.92, clearcoat: 0.03 }),
  tassel: gummy(0xd79a2c, { roughness: 0.8, clearcoat: 0.05 }),
  blanket: gummy(0xefe0bc, { roughness: 0.95, clearcoat: 0 }),
  blanketStripe: gummy(0x2a417d, { roughness: 0.95, clearcoat: 0 }),
  leather: gummy(0xc4682c, { roughness: 0.55, clearcoat: 0.3 }),
  leatherDark: gummy(0x7a3e1c, { roughness: 0.6, clearcoat: 0.25 }),
  leatherCream: gummy(0xe6cf9c, { roughness: 0.6, clearcoat: 0.2 }),
  // le bois : acacia sombre des coffres et du tabouret, bois clair de l'oud
  wood: gummy(0x8a5a30, { roughness: 0.62, clearcoat: 0.2 }),
  woodDark: gummy(0x4f2f1a, { roughness: 0.6, clearcoat: 0.18 }),
  woodLight: gummy(0xd9a866, { roughness: 0.42, clearcoat: 0.6 }),
  soundboard: gummy(0xe9c488, { roughness: 0.42, clearcoat: 0.6 }),
  oudBowl: gummy(0xa8602a, { roughness: 0.4, clearcoat: 0.7 }),
  oudBowlLight: gummy(0xc98644, { roughness: 0.4, clearcoat: 0.7 }),
  ebony: gummy(0x1f130c, { roughness: 0.4, clearcoat: 0.5 }),
  bone: gummy(0xf0e6cc, { roughness: 0.4, clearcoat: 0.5 }),
  string: gummy(0xf4efe0, { roughness: 0.3, clearcoat: 0.3 }),
  rosette: gummy(0xffffff, { map: rosetteTex, roughness: 0.5, clearcoat: 0.3, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
  feather: gummy(0xefe6d0, { roughness: 0.7, clearcoat: 0.05 }),
  featherDark: gummy(0x5c4430, { roughness: 0.7, clearcoat: 0.05 }),
  // le thé
  glass: gummy(0xfff2d6, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.32, depthWrite: false, side: DoubleSide }),
  glassRim: gummy(0xe0b050, { roughness: 0.3, metalness: 0.3, clearcoat: 0.8 }),
  tea: gummy(0xb2561a, { roughness: 0.05, clearcoat: 1 }),
  mint: gummy(0x5a9a46, { roughness: 0.6, clearcoat: 0.1 }),
  sugar: gummy(0xf6f0e2, { roughness: 0.8, clearcoat: 0.05 }),
  clay: gummy(0xffffff, { map: potTex, roughness: 0.78, clearcoat: 0.08 }),
  clayPlain: gummy(0xb86a3c, { roughness: 0.85, clearcoat: 0.04 }),
  clayDark: gummy(0x8a4a28, { roughness: 0.85, clearcoat: 0.04 }),
  coal: gummy(0x2a2420, { roughness: 0.9, clearcoat: 0 }),
  coalGlow: new MeshBasicMaterial({ color: 0xff6a22, transparent: true, opacity: 0.2, depthWrite: false }),
  basket: gummy(0xc8a060, { roughness: 0.85, clearcoat: 0.04 }),
  basketDark: gummy(0x8a6a3a, { roughness: 0.85, clearcoat: 0.04 }),
  grain: gummy(0xd8b868, { roughness: 0.9, clearcoat: 0 }),
  sack: gummy(0xcdb98e, { roughness: 0.94, clearcoat: 0 }),
  dateTint: gummy(0xffffff, { roughness: 0.5, clearcoat: 0.4 }),
  // la lanterne de laiton ajouré : le jour le laiton, la nuit la lumière passe par les trous (émission suivie dans Lantern.tsx)
  lantern: gummy(0xffffff, { map: lanternColor, emissive: 0xffffff, emissiveMap: lanternGlow, emissiveIntensity: 0, roughness: 0.38, metalness: 0.35, clearcoat: 0.5 }),
  lanternCast: new MeshBasicMaterial({ map: lanternCast, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -3 }),
  lampFlame: new MeshBasicMaterial({ color: 0xffd36b }),
  // la mare
  water: gummy(0xffffff, { map: waterTex, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.94, depthWrite: false }),
  wet: new MeshBasicMaterial({ map: wetTex, transparent: true, opacity: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }),
  ring: new MeshBasicMaterial({ map: ringTex, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }),
  stream: new MeshBasicMaterial({ map: streamTex, transparent: true, opacity: 0.8, depthWrite: false, side: DoubleSide }),
  stone: stone(0xc2a37a),
  stoneDark: stone(0x9a7a56),
  algae: moss(0x6a8a46),
  reed: leafy(0x7a9a3c),
  reed2: leafy(0x9ab048),
  reedDry: leafy(0xb8a458),
  cattail: gummy(0x6a3e22, { roughness: 0.8, clearcoat: 0.1 }),
  lily: leafy(0x4f8a3e),
  // le palmier dattier
  bark: gummy(0xffffff, { map: barkTex, roughness: 0.95, clearcoat: 0 }),
  barkBase: gummy(0x6a4e32, { roughness: 0.95, clearcoat: 0 }),
  frond: leafy(0x6a8a38, { clearcoat: 0.25 }),
  frond2: leafy(0x86a246, { clearcoat: 0.25 }),
  frondDry: leafy(0x9a8446, { clearcoat: 0.1 }),
  boot: gummy(0x7a5a38, { roughness: 0.9, clearcoat: 0 }),
}
