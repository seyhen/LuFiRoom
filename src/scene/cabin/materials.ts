import { MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { gummy } from '../materials'
import { knitTex } from '../textures'
import { braidTex, candyTex, floorTex, labelTex, lidTex, snowPrintTex, stoneTex, tartanTex, vinylTex, wallTex, wickerTex, firTex } from './textures'

const knitPouf = knitTex.clone()
knitPouf.repeat.set(3, 2)

/** Matériaux propres à la cabane (les pastels communs sont dans ../materials). */
export const C = {
  wall: gummy(0xffffff, { map: wallTex, roughness: 0.8, clearcoat: 0.12 }),
  floor: gummy(0xffffff, { map: floorTex, roughness: 0.55, clearcoat: 0.4 }),
  // La neige garde une pointe de bleu sous la lumière chaude : il fait froid dehors.
  /** Le socle sous la neige. */
  base: gummy(0xd3e1f6, { roughness: 0.6 }),
  /** Neige posée sur les murs et au bord de la fenêtre. */
  snowCap: gummy(0xf1f6ff, { roughness: 0.5, clearcoat: 0.35 }),
  beam: gummy(0xb9794f),
  log: gummy(0x9a6244, { roughness: 0.7, clearcoat: 0.2 }),
  /** Bois coupé : le bout des bûches. */
  cut: gummy(0xf0c897, { roughness: 0.6, clearcoat: 0.2 }),
  /** La bûche du dessus rougeoie quand le feu brûle (voir Fireplace). */
  charred: gummy(0x4a3a3f, { roughness: 0.8, clearcoat: 0.1, emissive: 0xff5a1f, emissiveIntensity: 0 }),
  soot: gummy(0x3d2c30, { roughness: 0.85, clearcoat: 0.05 }),
  stone: gummy(0xffffff, { map: stoneTex, roughness: 0.62 }),
  stoneDark: gummy(0xb99d87, { roughness: 0.62 }),
  wool: gummy(0xfffaf3, { roughness: 0.85, clearcoat: 0.05 }),
  pine: gummy(0x3f9474),
  pineLight: gummy(0x6db492),
  /** Rameaux de sapin (guirlandes, couronne, branches du sapin), teintés un à un. */
  needle: gummy(0xffffff, { roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.3 }),
  /** Le cœur du sapin, sombre, sous les branches. */
  firCore: gummy(0x2b6e55, { roughness: 0.7, clearcoat: 0.1 }),
  // le sapin : ses rameaux d'aiguilles, en chevrons
  fir: gummy(0x52a884, { map: firTex, roughness: 0.55, clearcoat: 0.4 }),
  cranberry: gummy(0xd25c72),
  cranberryLight: gummy(0xe98c9b),
  gold: gummy(0xf4c75a, { emissive: 0xffb43d, emissiveIntensity: 0.2, roughness: 0.3, clearcoat: 0.9 }),
  tartan: gummy(0xffffff, { map: tartanTex, roughness: 0.75, clearcoat: 0.1 }),
  knit: gummy(0xffffff, { map: knitTex, roughness: 0.85, clearcoat: 0.05 }),
  knitPouf: gummy(0xffffff, { map: knitPouf, roughness: 0.85, clearcoat: 0.05 }),
  braid: gummy(0xffffff, { map: braidTex, roughness: 0.85, clearcoat: 0.05 }),
  wicker: gummy(0xffffff, { map: wickerTex, roughness: 0.7, clearcoat: 0.15 }),
  cocoa: gummy(0x7a4a3a, { roughness: 0.3 }),
  candy: gummy(0xffffff, { map: candyTex, roughness: 0.3, clearcoat: 0.9 }),
  snowPrint: new MeshStandardMaterial({ map: snowPrintTex, roughness: 0.8 }),
  // Le tourne-disque : valise vert sapin, plateau crème, laiton, disque noir à étiquette canneberge.
  deck: gummy(0x2f7d6d, { roughness: 0.5 }),
  deckPlate: gummy(0xfff1dc, { roughness: 0.45 }),
  steel: gummy(0xd9d3df, { roughness: 0.3, clearcoat: 0.9 }),
  brass: gummy(0xe9b948, { roughness: 0.28, clearcoat: 0.9 }),
  felt: gummy(0xb8475d, { roughness: 0.95, clearcoat: 0 }),
  vinylEdge: gummy(0x1a1620, { roughness: 0.3, clearcoat: 0.9 }),
  vinyl: gummy(0xffffff, { map: vinylTex, roughness: 0.3, clearcoat: 0.9 }),
  label: gummy(0xffffff, { map: labelTex, roughness: 0.5 }),
  lid: gummy(0xffffff, { map: lidTex, roughness: 0.85, clearcoat: 0.05 }),
  /** Voyant du tourne-disque : ambre quand il joue, brun éteint sinon (voir Turntable). */
  led: new MeshBasicMaterial({ color: 0x5a3a2a }),
  /** Blanc brillant, teint objet par objet (boules du sapin, paquets, feuillage) : un seul tracé pour toute une série. */
  tint: gummy(0xffffff, { roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.15 }),
  paper: gummy(0xffffff, { roughness: 0.5, clearcoat: 0.5 }),
  // Ce qui brille de soi-même : pas de lumière à calculer.
  flame: new MeshBasicMaterial({ color: 0xff8a3d, transparent: true, opacity: 0.92 }),
  flameCore: new MeshBasicMaterial({ color: 0xffd36b, transparent: true, opacity: 0.95 }),
  /** Ampoules (sapin, guirlande du manteau), teintes une à une. */
  bulb: new MeshBasicMaterial({ color: 0xffffff }),
  snow: new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }),
}

/** Guirlande du mur, en tons chauds : or, ambre, rose. */
export const warmFairy = [0xffd36b, 0xffa95e, 0xff9fb0].map(
  (c) => new MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.2, roughness: 0.4 }),
)
