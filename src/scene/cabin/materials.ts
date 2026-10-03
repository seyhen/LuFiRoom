import { MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { gummy } from '../materials'
import { buffaloTex, floorTex, logWallTex, riverStoneTex, wallTex } from './textures'

const backLogs = logWallTex.clone()
backLogs.repeat.set(1, 1 / 4.4)
backLogs.offset.set(0, 0.05 / 4.4)
const leftLogs = logWallTex.clone()
leftLogs.repeat.set(6.5, 4.25 / 4.4)
const stones = (rx: number, ry: number) => {
  const s = riverStoneTex.clone()
  s.repeat.set(rx, ry)
  return new MeshStandardMaterial({ map: s, roughness: 0.75 })
}
const rug = buffaloTex.clone()
rug.repeat.set(2.5, 2)
const plaid = buffaloTex.clone()
plaid.repeat.set(1.5, 1.5)

/** Matériaux propres à la cabane (les pastels communs sont dans ../materials). */
export const C = {
  wall: gummy(0xffffff, { map: wallTex, roughness: 0.8, clearcoat: 0.12 }),
  floor: gummy(0xffffff, { map: floorTex, roughness: 0.6, clearcoat: 0.15, clearcoatRoughness: 0.5 }),
  /** Le socle sous la neige. */
  base: gummy(0xdde6f4, { roughness: 0.6 }),
  beam: gummy(0xb9794f),
  log: gummy(0x9a6244, { roughness: 0.7, clearcoat: 0.2 }),
  charred: gummy(0x4a3a3f, { roughness: 0.8, clearcoat: 0.1 }),
  stone: gummy(0xd3cbe3, { roughness: 0.62 }),
  stoneDark: gummy(0xa89dc0, { roughness: 0.62 }),
  wool: gummy(0xfffaf3, { roughness: 0.85, clearcoat: 0.05 }),
  pine: gummy(0x4f9d8c),
  snow: new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }),
  // 2e version : rondins, pierres de rivière, neige, carreaux rouges et noirs.
  logWall: gummy(0xffffff, { map: backLogs, roughness: 0.7, clearcoat: 0.15 }),
  logWallLeft: new MeshStandardMaterial({ map: leftLogs, roughness: 0.75 }),
  logEnd: gummy(0xc89a6a, { roughness: 0.6 }),
  logBark: gummy(0x8a5a3c, { roughness: 0.7 }),
  stoneFront: stones(1.6, 1.2),
  stoneFlue: stones(1.3, 1.8),
  stonePier: stones(0.45, 1.3),
  stoneGrey: gummy(0x9a948c, { roughness: 0.7 }),
  hearth: gummy(0x6f6a66, { roughness: 0.7 }),
  beamDark: gummy(0x6a4430, { roughness: 0.6 }),
  snowCap: gummy(0xffffff, { roughness: 0.5, clearcoat: 0.3, emissive: 0xdde6ff, emissiveIntensity: 0.12 }),
  ice: gummy(0xdff2ff, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.75 }),
  rug: gummy(0xffffff, { map: rug, roughness: 0.92, clearcoat: 0 }),
  plaid: gummy(0xffffff, { map: plaid, roughness: 0.9, clearcoat: 0.02 }),
  red: gummy(0xc23a36),
  green: gummy(0x2f6b4a),
  pineDark: gummy(0x2f5a46),
  berry: gummy(0xd8302e),
  cream: gummy(0xf4ebdc, { roughness: 0.85 }),
  knitBlue: gummy(0x4a6a9a, { roughness: 0.9 }),
  knitMustard: gummy(0xd9a441, { roughness: 0.9 }),
  cocoa: gummy(0x6a3a22, { roughness: 0.3, clearcoat: 0.8 }),
  husky: gummy(0x8a8f9c, { roughness: 0.85, clearcoat: 0.05 }),
  huskyLight: gummy(0xf2efe9, { roughness: 0.85, clearcoat: 0.05 }),
  iron: gummy(0x2e2a2c, { roughness: 0.45, clearcoat: 0.4 }),
  lanternGlass: gummy(0xfff2d6, { roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.55, emissive: 0xffb45e, emissiveIntensity: 0 }),
}
