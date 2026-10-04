import { DoubleSide, MeshBasicMaterial } from 'three'
import { M, gummy } from '../materials'
import { leafy } from '../nature/materials'
import { boardTex, carpetTex, panelTex, persianTex, streakTex } from './textures'

// Le mur du fond est une extrusion : ses UV sont ses coordonnées (1 unité de large, 4.4 de haut par tuile).
const wallPanels = panelTex.clone()
wallPanels.repeat.set(1, 1 / 4.4)
wallPanels.offset.set(0, 0.05 / 4.4)
const leftPanels = panelTex.clone()
leftPanels.repeat.set(6.5, 1)

/**
 * La voiture-lits : acajou verni, laiton, velours bordeaux et bleu canard, draps blancs, moquette rouge.
 * Dehors, la livrée bleu nuit et son filet doré.
 */
export const T = {
  wall: gummy(0xffffff, { map: wallPanels, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.5 }),
  panels: gummy(0xffffff, { map: leftPanels, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.5 }),
  carpet: gummy(0xffffff, { map: carpetTex, roughness: 0.95, clearcoat: 0 }),
  mahogany: gummy(0x7a3528, { roughness: 0.32, clearcoat: 0.85, clearcoatRoughness: 0.2 }),
  mahoganyDark: gummy(0x5a2418, { roughness: 0.35, clearcoat: 0.8 }),
  brass: M.brass,
  livery: gummy(0x1f2f5a, { roughness: 0.35, clearcoat: 0.8 }),
  gold: gummy(0xe2b25a, { roughness: 0.3, clearcoat: 0.9 }),
  iron: gummy(0x2a2730, { roughness: 0.5, clearcoat: 0.3 }),
  velvet: gummy(0x8e2f3a, { roughness: 0.85, clearcoat: 0.05 }),
  velvetDark: gummy(0x6a1f2a, { roughness: 0.85, clearcoat: 0.05 }),
  teal: gummy(0x2f6b6b, { roughness: 0.85, clearcoat: 0.05 }),
  sheet: gummy(0xfbf8f2, { roughness: 0.8, clearcoat: 0.1 }),
  blanket: gummy(0x2c3f6b, { roughness: 0.85, clearcoat: 0.05 }),
  cream: gummy(0xf3e6cf, { roughness: 0.6 }),
  leather: gummy(0x8a5a3a, { roughness: 0.4, clearcoat: 0.6 }),
  leatherDark: gummy(0x5e3a26, { roughness: 0.4, clearcoat: 0.6 }),
  canvas: gummy(0xd9c9a8, { roughness: 0.8 }),
  wool: gummy(0xe8dcc6, { roughness: 0.9, clearcoat: 0.02 }),
  mustard: gummy(0xd9a441),
  rose: gummy(0xd9536a),
  leaf: gummy(0x4f8a5a),
  leafV: leafy(0x5a9a68),
  croissant: gummy(0xd99a52, { roughness: 0.55 }),
  tea: gummy(0xb5552a, { transparent: true, opacity: 0.85, roughness: 0.1, clearcoat: 1 }),
  glass: M.glass,
  mirror: gummy(0xdfe6ee, { roughness: 0.05, clearcoat: 1, metalness: 0.4, emissive: 0x404858, emissiveIntensity: 0.4 }),
  persian: gummy(0xffffff, { map: persianTex, roughness: 0.95, clearcoat: 0 }),
  stickerA: gummy(0xe2b25a), stickerB: gummy(0x4f8a5a), stickerC: gummy(0xd9536a), stickerD: gummy(0x6a8ab8),
  chessW: gummy(0xf3e6cf, { roughness: 0.3, clearcoat: 0.8 }),
  chessB: gummy(0x2a1a16, { roughness: 0.3, clearcoat: 0.8 }),
  board: gummy(0xffffff, { map: boardTex, roughness: 0.4, clearcoat: 0.6 }),
  wicker: gummy(0xc89a62, { roughness: 0.7 }),
  ginger: gummy(0xe08a4a, { roughness: 0.62, clearcoat: 0.2 }),
  gingerLight: gummy(0xf6dcc0, { roughness: 0.62 }),
  gingerDark: gummy(0xb8632e, { roughness: 0.6 }),
  lilac: gummy(0xb9a2d8),
  plaidLight: gummy(0xd9c9a8, { roughness: 0.9 }),
  daisy: gummy(0xfbf6ea),
  shade: gummy(0x9a3442, { roughness: 0.8, emissive: 0xff8a5a, emissiveIntensity: 0, side: DoubleSide }),
  bulb: M.bulb,
  ink: M.ink,
  rain: new MeshBasicMaterial({ map: streakTex, transparent: true, opacity: 0, depthWrite: false }),
}
