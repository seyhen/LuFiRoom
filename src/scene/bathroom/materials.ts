import { DoubleSide, MeshBasicMaterial } from 'three'
import { M, gummy, skin } from '../materials'
import { foliage, leafy } from '../nature/materials'
import { wickerTex } from '../greenhouse/textures'
import { bottleTex, floorTex, fogTex, matTex, mirrorTex, paperTex, printTex, streamTex, subwayTex, towelTex, zelligeTex } from './textures'

const floor = floorTex.clone()
floor.repeat.set(10.7, 10.7)
// une texture de filet par jet : elles défilent chacune à leur vitesse
const streamA = streamTex.clone(), streamB = streamTex.clone()
streamB.repeat.set(5, 2.4)
const wickBig = wickerTex.clone(), wickSmall = wickerTex.clone()
wickBig.repeat.set(6, 2.4)
wickSmall.repeat.set(4, 1.6)
const paper = paperTex.clone()
paper.repeat.set(1 / 1.1, 1 / 1.1)

/** Un matériau de bouteille à étiquette : le flacon est coloré, l'étiquette est une bande sur un plan (jamais sur une rbox). */
const label = (col: string) => gummy(0xffffff, { map: bottleTex(col), roughness: 0.7, clearcoat: 0.2 })

/**
 * La salle de bain : carrelage pastel (menthe au sol et en soubassement, zellige rose dans la douche), papier peint de feuillages
 * sauge sur fond rose pâle, baignoire sur pieds de lion bleu givré et blanche dedans, laiton clair et chrome, bois de chêne clair,
 * éponge de serviettes rose, sauge, crème et pêche ; les verts des plantes que la lueur des bougies dore le soir.
 */
export const B = {
  floor: gummy(0xffffff, { map: floor, roughness: 0.5, clearcoat: 0.28 }),
  base: gummy(0xd9c9bd, { roughness: 0.8, clearcoat: 0.05 }),
  baseTrim: gummy(0xf0e4d8, { roughness: 0.55, clearcoat: 0.25 }),
  wall: gummy(0xffffff, { map: paper, roughness: 0.88, clearcoat: 0.04 }),
  /** Les carreaux métro du soubassement : `worldUV(…, 0,6)`. */
  subway: gummy(0xffffff, { map: subwayTex, roughness: 0.3, clearcoat: 0.75 }),
  zellige: gummy(0xffffff, { map: zelligeTex, roughness: 0.32, clearcoat: 0.7 }),
  trim: gummy(0xfbf4ea, { roughness: 0.4, clearcoat: 0.6 }),
  rail: gummy(0xeeb0bd, { roughness: 0.38, clearcoat: 0.7 }),
  chrome: gummy(0xdfe7ec, { roughness: 0.18, metalness: 0.55, clearcoat: 1 }),
  brass: M.brass,
  brassDark: gummy(0xb98c3c, { roughness: 0.35, metalness: 0.3, clearcoat: 0.8 }),
  woodLight: gummy(0xdcb98c, { roughness: 0.62, clearcoat: 0.2 }),
  wood: gummy(0xc29866, { roughness: 0.62, clearcoat: 0.2 }),
  woodDark: gummy(0x8f6644, { roughness: 0.6, clearcoat: 0.2 }),
  wicker: gummy(0xffffff, { map: wickerTex, roughness: 0.8, clearcoat: 0.05 }),
  wickerBig: gummy(0xffffff, { map: wickBig, roughness: 0.8, clearcoat: 0.05 }),
  wickerSmall: gummy(0xffffff, { map: wickSmall, roughness: 0.8, clearcoat: 0.05 }),
  basin: gummy(0xe3eeef, { roughness: 0.2, clearcoat: 0.9 }),
  ceramic: gummy(0xfdf8f2, { roughness: 0.2, clearcoat: 0.9 }),
  ceramicRose: gummy(0xf2bcc6, { roughness: 0.25, clearcoat: 0.85 }),
  ceramicBlue: gummy(0x9ccbe0, { roughness: 0.25, clearcoat: 0.85 }),
  // la baignoire
  tubOuter: gummy(0xa6cfe0, { roughness: 0.28, clearcoat: 0.85, side: DoubleSide, emissive: 0x7aa8c8, emissiveIntensity: 0.1 }),
  tubInner: gummy(0xfef9f3, { roughness: 0.18, clearcoat: 0.95, side: DoubleSide }),
  water: gummy(0xbfe6ea, { roughness: 0.05, clearcoat: 1, emissive: 0x9fd4dc, emissiveIntensity: 0.05 }),
  foam: gummy(0xfff5f6, { roughness: 0.55, clearcoat: 0.25, vertexColors: true }),
  foamBubble: gummy(0xffffff, { roughness: 0.28, clearcoat: 0.9 }),
  // le verre : la douche, le miroir, la fenêtre
  screen: gummy(0xe2f3f2, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.2, depthWrite: false, side: DoubleSide }),
  mirror: gummy(0xffffff, { map: mirrorTex, roughness: 0.04, clearcoat: 1, emissive: 0xcfe6e4, emissiveIntensity: 0.07 }),
  // la vitre embuée : sa buée s'épaissit quand l'eau chaude coule (voir Window.tsx)
  fog: new MeshBasicMaterial({ map: fogTex, color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false, side: DoubleSide }),
  // l'eau qui coule : le filet du robinet, la pluie de la douche
  stream: new MeshBasicMaterial({ map: streamA, color: 0xeaf8ff, transparent: true, opacity: 0.85, depthWrite: false, side: DoubleSide }),
  rain: new MeshBasicMaterial({ map: streamB, color: 0xe8f8ff, transparent: true, opacity: 0.5, depthWrite: false, side: DoubleSide }),
  ripple: new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, side: DoubleSide }),
  // les serviettes, le tapis
  towelRose: gummy(0xffffff, { map: towelTex('#eeb0bc', '#fbe6e6'), roughness: 0.95, clearcoat: 0 }),
  towelSage: gummy(0xffffff, { map: towelTex('#a9c9ac', '#eef4e6'), roughness: 0.95, clearcoat: 0 }),
  towelCream: gummy(0xffffff, { map: towelTex('#f4ead8', '#e6a9b6'), roughness: 0.95, clearcoat: 0 }),
  towelPeach: gummy(0xffffff, { map: towelTex('#f2b99a', '#fdf1e2'), roughness: 0.95, clearcoat: 0 }),
  mat: gummy(0xffffff, { map: matTex, roughness: 0.98, clearcoat: 0 }),
  robe: gummy(0xfaf1ee, { roughness: 0.95, clearcoat: 0 }),
  // les flacons
  bottleRose: label('#ee9fb0'),
  bottleSage: label('#8dbd9d'),
  bottleBlue: label('#8fc1de'),
  bottleCap: gummy(0xf4e5c8, { roughness: 0.4, clearcoat: 0.6 }),
  soap: gummy(0xf6c6cf, { roughness: 0.35, clearcoat: 0.8 }),
  soapGreen: gummy(0xcfe6c4, { roughness: 0.35, clearcoat: 0.8 }),
  sponge: gummy(0xe8c36a, { roughness: 0.95, clearcoat: 0 }),
  // les gravures
  printA: gummy(0xffffff, { map: printTex(0), roughness: 0.8, clearcoat: 0.1 }),
  printB: gummy(0xffffff, { map: printTex(1), roughness: 0.8, clearcoat: 0.1 }),
  paper: gummy(0xf4ecdc, { roughness: 0.9, clearcoat: 0 }),
  ink: gummy(0x4a3c44, { roughness: 0.5, clearcoat: 0.2 }),
  // le canard
  duckSkin: skin({ roughness: 0.3, clearcoat: 0.85 }),
  eye: gummy(0x2a2428, { roughness: 0.1, clearcoat: 1 }),
  // le kalimba
  kalimba: gummy(0xd4a56a, { roughness: 0.55, clearcoat: 0.3, emissive: 0xd4a56a, emissiveIntensity: 0.1 }),
  tine: gummy(0xf2f4f6, { roughness: 0.25, metalness: 0.4, clearcoat: 0.9, emissive: 0xdde6ee, emissiveIntensity: 0.12 }),
  cloth: gummy(0xe9a9b4, { roughness: 0.92, clearcoat: 0 }),
  // les plantes
  terracotta: M.terracotta,
  soil: gummy(0x4e3a2c, { roughness: 0.95, clearcoat: 0 }),
  leaf: leafy(0x58a56a),
  leafDark: leafy(0x2f7a50),
  leafLight: leafy(0x93c978),
  monstera: leafy(0x2f8050, { roughness: 0.35, clearcoat: 0.6 }),
  fernM: leafy(0x5faa5c),
  succulent: leafy(0x9cbba0, { roughness: 0.6, clearcoat: 0.3 }),
  bush: foliage(0x6aa458),
  // les bougies : voir M.wax et M.candleFlame
  jar: gummy(0xffe9cf, { roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.42, depthWrite: false }),
  lamp: gummy(0xfff0d0, { roughness: 0.2, clearcoat: 0.8, emissive: 0xffc36a, emissiveIntensity: 0.1 }),
}
