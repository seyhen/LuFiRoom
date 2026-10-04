import { MeshBasicMaterial } from 'three'
import { gummy, M } from '../materials'
import { moss, stone } from '../nature/materials'
import { blanketTex, boardsTex, buoyTex, chartTex, floorTex, plasterTex, planTex, rugTex, streakTex, baroTex } from './textures'

/** Matériaux propres au phare : enduit à la chaux, lambris marine, laiton, fonte, cuir, oilskin jaune, cordage. */
export const L = {
  plaster: gummy(0xffffff, { map: plasterTex, roughness: 0.88, clearcoat: 0.05 }),
  wainscot: gummy(0xffffff, { map: boardsTex, roughness: 0.55, clearcoat: 0.45 }),
  floor: gummy(0xffffff, { map: floorTex, roughness: 0.6, clearcoat: 0.3 }),
  rock: gummy(0x6f7a8a, { roughness: 0.8, clearcoat: 0.08 }),
  rockDark: gummy(0x4f5868, { roughness: 0.85, clearcoat: 0.05 }),
  /** Les rochers autour de l'îlot, et le varech qui les couvre. */
  boulder: [stone(0x6f7a8a), stone(0x5c6676), stone(0x7b8494)],
  weed: moss(0x4f7a5c),
  cream: gummy(0xf4efe3, { roughness: 0.6, clearcoat: 0.3 }),
  navy: gummy(0x2b4a6f, { roughness: 0.5, clearcoat: 0.5 }),
  navyDark: gummy(0x1f3552, { roughness: 0.5, clearcoat: 0.45 }),
  brass: M.brass,
  brassDull: gummy(0xb98c3e, { roughness: 0.4, clearcoat: 0.5 }),
  iron: gummy(0x3b3b48, { roughness: 0.45, clearcoat: 0.4 }),
  ironLight: gummy(0x5c5c6c, { roughness: 0.4, clearcoat: 0.5 }),
  oak: gummy(0xb27c52, { roughness: 0.5, clearcoat: 0.4 }),
  oakDark: gummy(0x6e4a32, { roughness: 0.5, clearcoat: 0.35 }),
  oakPale: gummy(0xd2a678, { roughness: 0.5, clearcoat: 0.35 }),
  leather: gummy(0xa65a38, { roughness: 0.55, clearcoat: 0.4 }),
  leatherDark: gummy(0x7a3e26, { roughness: 0.55, clearcoat: 0.35 }),
  rug: gummy(0xffffff, { map: rugTex, roughness: 0.85, clearcoat: 0.05 }),
  rugEdge: gummy(0x2b4a6f, { roughness: 0.85, clearcoat: 0.05 }),
  blanket: gummy(0xffffff, { map: blanketTex, roughness: 0.9, clearcoat: 0.03 }),
  chart: gummy(0xffffff, { map: chartTex, roughness: 0.8, clearcoat: 0.05 }),
  baro: gummy(0xffffff, { map: baroTex, roughness: 0.4, clearcoat: 0.6 }),
  plan: gummy(0xffffff, { map: planTex, roughness: 0.7, clearcoat: 0.2 }),
  paper: gummy(0xf4ecd6, { roughness: 0.8, clearcoat: 0.05 }),
  rope: gummy(0xd6c096, { roughness: 0.85, clearcoat: 0.05 }),
  ropeDark: gummy(0xa89066, { roughness: 0.85, clearcoat: 0.05 }),
  oilskin: gummy(0xf2c24c, { roughness: 0.4, clearcoat: 0.7 }),
  oilskinDark: gummy(0xd49a2a, { roughness: 0.4, clearcoat: 0.6 }),
  red: gummy(0xd8404a, { roughness: 0.4, clearcoat: 0.6 }),
  buoy: gummy(0xffffff, { map: buoyTex, roughness: 0.5, clearcoat: 0.6 }),
  glass: gummy(0xcfe6f2, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.22 }),
  glassWarm: gummy(0xffe2a8, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.35, emissive: 0xffa24a, emissiveIntensity: 0.1 }),
  mug: gummy(0xe9e2d2, { roughness: 0.4, clearcoat: 0.7 }),
  mugBlue: gummy(0x3a6a9c, { roughness: 0.4, clearcoat: 0.7 }),
  boot: gummy(0x2e3a4a, { roughness: 0.4, clearcoat: 0.6 }),
  sole: gummy(0xc9a35a, { roughness: 0.6, clearcoat: 0.2 }),
  /** Le chat du phare : un roux tigré, ventre crème. */
  catFur: gummy(0xd69a5c, { roughness: 0.6, clearcoat: 0.2 }),
  catLight: gummy(0xf6e2c0, { roughness: 0.62, clearcoat: 0.2 }),
  catDark: gummy(0xa25f34, { roughness: 0.6, clearcoat: 0.2 }),
  /** Voyant orange du poêle (braises) : brille de lui-même, plus fort quand le feu brûle (voir Stove). */
  ember: gummy(0x2a1a16, { roughness: 0.8, emissive: 0xff5a1e, emissiveIntensity: 0 }),
  /** Vitre du hublot : traînées de pluie (voir SeaView). */
  streaks: new MeshBasicMaterial({ map: streakTex, transparent: true, depthWrite: false, opacity: 0.55 }),
}
