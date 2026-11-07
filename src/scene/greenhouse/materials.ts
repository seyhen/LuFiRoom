import { BackSide, DoubleSide, MeshBasicMaterial } from 'three'
import { M, gummy } from '../materials'
import { foliage, leafy, moss, stone } from '../nature/materials'
import { boardTex, brickTex, fogTex, labelTex, rugTex, tileTex, wickerTex } from './textures'

const floorTile = tileTex.clone()
floorTile.repeat.set(5.4, 5.4)
const knee = brickTex.clone()
knee.repeat.set(6.4, 0.9)

/**
 * La serre un soir de pluie : fonte vert bouteille et laiton, carreaux de ciment terre cuite et crème, brique blanchie, osier miel,
 * verre embué ; et partout des verts (palme, fougère, citronnier) que la lueur de la lanterne dore le soir.
 */
export const G = {
  floor: gummy(0xffffff, { map: floorTile, roughness: 0.5, clearcoat: 0.45 }),
  base: gummy(0x6f6a5c, { roughness: 0.8, clearcoat: 0.05 }),
  baseTrim: gummy(0xc8bfa4, { roughness: 0.6, clearcoat: 0.2 }),
  knee: gummy(0xffffff, { map: knee, roughness: 0.85, clearcoat: 0.05 }),
  iron: gummy(0x2f5d4a, { roughness: 0.4, clearcoat: 0.6 }),
  ironDark: gummy(0x1f3d32, { roughness: 0.45, clearcoat: 0.5 }),
  brass: M.brass,
  /** Le verre embué : un plan par paroi, qui laisse voir le jardin. */
  fog: new MeshBasicMaterial({ map: fogTex, transparent: true, opacity: 0.85, depthWrite: false, side: DoubleSide }),
  wicker: gummy(0xffffff, { map: wickerTex, roughness: 0.8, clearcoat: 0.05 }),
  wood: gummy(0xffffff, { map: boardTex, roughness: 0.65, clearcoat: 0.15 }),
  woodDark: gummy(0x8a6240, { roughness: 0.6, clearcoat: 0.15 }),
  stone: stone(0xb9b4a6),
  stoneDark: stone(0x8c897c),
  moss: moss(0x6f9a5e),
  terracotta: M.terracotta,
  soil: gummy(0x4e3a2c, { roughness: 0.95, clearcoat: 0 }),
  rug: gummy(0xffffff, { map: rugTex, roughness: 0.95, clearcoat: 0 }),
  cushion: gummy(0xe9dfc6, { roughness: 0.85, clearcoat: 0.04 }),
  cushion2: gummy(0xc8553d, { roughness: 0.85, clearcoat: 0.04 }),
  plaid: gummy(0x3f7a5e, { roughness: 0.9, clearcoat: 0.02 }),
  cream: gummy(0xf4ecd8, { roughness: 0.55, clearcoat: 0.3 }),
  paper: gummy(0xf2ead4, { roughness: 0.9, clearcoat: 0 }),
  label: gummy(0xffffff, { map: labelTex, roughness: 0.9 }),
  glassIn: gummy(0xdff2ec, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.3, depthWrite: false, side: DoubleSide }),
  // l'eau du bassin et du tonneau
  pond: gummy(0x5f9c9a, { roughness: 0.05, clearcoat: 1 }),
  pondDeep: gummy(0x2f5a58, { roughness: 0.1, clearcoat: 0.8, side: BackSide }),
  barrelWater: gummy(0x6aa6a8, { roughness: 0.05, clearcoat: 1 }),
  stream: new MeshBasicMaterial({ color: 0xcfeaf2, transparent: true, opacity: 0.7, depthWrite: false }),
  ripple: new MeshBasicMaterial({ color: 0xeafaff, transparent: true, opacity: 0, depthWrite: false, side: DoubleSide }),
  // le phonographe, la boîte à musique
  horn: gummy(0xd8aa4a, { roughness: 0.22, metalness: 0.35, clearcoat: 1 }),
  record: gummy(0x1a181c, { roughness: 0.25, clearcoat: 0.9 }),
  lacquer: gummy(0x6e3a26, { roughness: 0.3, clearcoat: 0.85 }),
  inlay: gummy(0xe2bf8a, { roughness: 0.4, clearcoat: 0.5 }),
  steel: gummy(0xb8bec8, { roughness: 0.25, metalness: 0.3, clearcoat: 0.8 }),
  tutu: gummy(0xf2cfe0, { roughness: 0.7, clearcoat: 0.1 }),
  skinTone: gummy(0xf2d2b6, { roughness: 0.6, clearcoat: 0.2 }),
  // les plantes
  leaf: leafy(0x4f9a5e),
  leafDark: leafy(0x2f6e48),
  leafLight: leafy(0x8dc26e),
  leafVar: leafy(0x9ccf8a, { roughness: 0.5 }),
  palm: leafy(0x3f8f55, { roughness: 0.45, clearcoat: 0.3 }),
  monstera: leafy(0x2f7a4e, { roughness: 0.35, clearcoat: 0.6 }),
  fernM: leafy(0x5faa5c),
  succulent: leafy(0x9cb89a, { roughness: 0.6, clearcoat: 0.3 }),
  bush: foliage(0x6aa458),
  bushDark: foliage(0x3f7a4e),
  lemonLeaf: foliage(0x5a9e50),
  lemon: gummy(0xf2d24a, { roughness: 0.3, clearcoat: 0.8 }),
  orchid: gummy(0xf2cfe0, { roughness: 0.4, clearcoat: 0.5 }),
  orchid2: gummy(0xc785b8, { roughness: 0.4, clearcoat: 0.5 }),
  lily: gummy(0xf4a8c0, { roughness: 0.4, clearcoat: 0.5 }),
  padLeaf: leafy(0x3f8f55, { roughness: 0.4, clearcoat: 0.5, side: DoubleSide }),
  frog: gummy(0x6fae4e, { roughness: 0.3, clearcoat: 0.7 }),
  frogBelly: gummy(0xe8f0b8, { roughness: 0.4, clearcoat: 0.4 }),
  eye: gummy(0x1a1a1a, { roughness: 0.1, clearcoat: 1 }),
  // la lanterne
  lanternGlass: gummy(0xfff2cf, { roughness: 0.2, clearcoat: 0.8, emissive: 0xffc36a, emissiveIntensity: 0.1 }),
}
