import { DoubleSide, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { M, gummy } from '../materials'
import { brickTex, deckTex, facadeGlowTex, facadeTex, rugTex, staveTex } from './textures'

const wallBricks = (rx: number, ry: number) => {
  const t = brickTex.clone()
  t.repeat.set(rx, ry)
  return t
}
const deck = deckTex.clone()
deck.repeat.set(6.4, 6.4)

/**
 * Le toit : brique de Brooklyn, teck, acier noir, et les couleurs chaudes d'un soir d'été (moutarde, rouille, bleu canard).
 * La ville autour reste bleue et lointaine ; ses fenêtres s'allument la nuit.
 */
export const R = {
  base: gummy(0x9a5444, { roughness: 0.8, clearcoat: 0.05 }),
  cornice: gummy(0xd8c8b0, { roughness: 0.6 }),
  tar: gummy(0x4a4448, { roughness: 0.9, clearcoat: 0 }),
  deck: gummy(0xffffff, { map: deck, roughness: 0.75, clearcoat: 0.1 }),
  brick: gummy(0xa85a48, { roughness: 0.85, clearcoat: 0.05 }),
  brickBack: new MeshStandardMaterial({ map: wallBricks(6.5, 1), roughness: 0.9 }),
  brickSide: new MeshStandardMaterial({ map: wallBricks(6.5, 1), roughness: 0.9 }),
  brickShed: new MeshStandardMaterial({ map: wallBricks(1.9, 2.6), roughness: 0.9 }),
  coping: gummy(0xcfc3b2, { roughness: 0.6 }),
  steel: gummy(0x2e2c34, { roughness: 0.45, clearcoat: 0.4 }),
  door: gummy(0x2f5a4c, { roughness: 0.45, clearcoat: 0.5 }),
  stave: gummy(0xffffff, { map: staveTex, roughness: 0.75, clearcoat: 0.1 }),
  teak: gummy(0xa8754a, { roughness: 0.5 }),
  cushion: gummy(0xefe4cf, { roughness: 0.85, clearcoat: 0.05 }),
  mustard: gummy(0xd9a441, { roughness: 0.8, clearcoat: 0.05 }),
  rust: gummy(0xb4573a, { roughness: 0.7 }),
  teal: gummy(0x2f6b6b, { roughness: 0.8, clearcoat: 0.05 }),
  pink: M.pink,
  plaid: gummy(0x8e2f3a, { roughness: 0.9, clearcoat: 0.02 }),
  corten: gummy(0x8a4a2e, { roughness: 0.65, clearcoat: 0.15 }),
  log: gummy(0x6e4a32, { roughness: 0.8 }),
  ember: new MeshStandardMaterial({ color: 0x2a1a16, emissive: 0xff5a1e, emissiveIntensity: 0, roughness: 0.8 }),
  rug: gummy(0xffffff, { map: rugTex, roughness: 0.9, clearcoat: 0 }),
  leaf: gummy(0x5a8f5a),
  leafDark: gummy(0x3f6f48),
  olive: gummy(0x8fa37a),
  lavender: gummy(0x9a86c8),
  tomato: gummy(0xe0503a),
  terracotta: M.terracotta,
  sheet: gummy(0xfbf7ef, { roughness: 0.85, clearcoat: 0.02, side: DoubleSide, emissive: 0x3a3632, emissiveIntensity: 0.6 }),
  sheetBlue: gummy(0xa8c8e8, { roughness: 0.85, clearcoat: 0.02, side: DoubleSide, emissive: 0x2a3440, emissiveIntensity: 0.6 }),
  sheetStripe: gummy(0xf2c8c0, { roughness: 0.85, clearcoat: 0.02, side: DoubleSide, emissive: 0x3a2c2a, emissiveIntensity: 0.6 }),
  rope: gummy(0xe8e0d0, { roughness: 0.9, clearcoat: 0 }),
  pigeon: gummy(0xa8acbb, { roughness: 0.6 }),
  pigeonDark: gummy(0x5f6373, { roughness: 0.6 }),
  pigeonNeck: gummy(0x6fa392, { roughness: 0.35, clearcoat: 0.8 }),
  beak: gummy(0x3a3438),
  feet: gummy(0xd9787a),
  wine: gummy(0x7a1f30, { transparent: true, opacity: 0.85, roughness: 0.1, clearcoat: 1 }),
  glass: M.glass,
  zinc: gummy(0xaab4bf, { roughness: 0.35, clearcoat: 0.7 }),
  ice: gummy(0xeaf6ff, { roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.85 }),
  brass: M.brass,
  bulb: M.bulb,
  ink: M.ink,
  // La ville : façades (bleu de soirée) et leurs fenêtres, qui s'allument la nuit.
  tower: [gummy(0x7d8aa8, { roughness: 0.7 }), gummy(0x8f97b0, { roughness: 0.7 }), gummy(0x6f7c9c, { roughness: 0.7 }), gummy(0xa29aa8, { roughness: 0.7 })],
  far: gummy(0xa9b2c8, { roughness: 0.8 }),
  windows: new MeshStandardMaterial({ map: facadeTex, emissiveMap: facadeGlowTex, emissive: 0xffffff, emissiveIntensity: 0, transparent: true, roughness: 0.6 }),
  beacon: new MeshBasicMaterial({ color: 0xff4a4a }),
  moon: new MeshBasicMaterial({ color: 0xfaf4e0, transparent: true, opacity: 0 }),
}
