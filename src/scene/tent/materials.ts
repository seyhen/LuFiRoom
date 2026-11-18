import { DoubleSide, MeshBasicMaterial } from 'three'
import { M, gummy } from '../materials'
import { crateTex, floorTex, kilimTex, mapTex, plaidTex, pocketTex, quiltTex, toileTex, wetTex, woodTex } from './textures'

const quilt = quiltTex.clone()
quilt.repeat.set(1.6, 1.6)
const plaid = plaidTex.clone()
plaid.repeat.set(1.4, 1.4)
const wood = woodTex.clone()

/**
 * La tente un soir de pluie : toile ecru qui s'éclaire d'ambre la nuit, bois miel des caisses, kaki de la toile de sol, ocre, rouille
 * et vert mousse des étoffes, émail crème et bleu, fer-blanc, laiton et verre de la lampe.
 */
export const T = {
  // la toile, vue de l'intérieur : la lampe la fait luire (émission suivie dans Tent.tsx), la pluie la fonce
  canvas: gummy(0xffffff, { map: toileTex, emissive: 0xffa24a, emissiveMap: toileTex, emissiveIntensity: 0, roughness: 0.94, clearcoat: 0, side: DoubleSide }),
  // les taches d'impact : une couche juste en dedans de la toile, qui scintille quand le son de la pluie sur la toile joue
  wet: new MeshBasicMaterial({ map: wetTex, transparent: true, opacity: 0, depthWrite: false, side: DoubleSide }),
  canvasDark: gummy(0x6b6a48, { roughness: 0.95, clearcoat: 0, side: DoubleSide }),
  binding: gummy(0xc9b58a, { roughness: 0.85, clearcoat: 0.05 }),
  rope: gummy(0xd8c9a0, { roughness: 0.9, clearcoat: 0 }),
  floor: gummy(0xffffff, { map: floorTex, roughness: 0.9, clearcoat: 0.04 }),
  earth: gummy(0x4a3b2b, { roughness: 0.95, clearcoat: 0 }),
  moss: gummy(0x5f7a42, { roughness: 0.95, clearcoat: 0 }),
  // le mât, ses ferrures
  pole: gummy(0xc0955c, { roughness: 0.6, clearcoat: 0.2 }),
  poleDark: gummy(0x8a6238, { roughness: 0.6, clearcoat: 0.15 }),
  iron: gummy(0x3b3a3a, { roughness: 0.45, metalness: 0.35, clearcoat: 0.4 }),
  brass: M.brass,
  steel: gummy(0xc3c7cc, { roughness: 0.3, metalness: 0.4, clearcoat: 0.7 }),
  tin: gummy(0xaeb2b4, { roughness: 0.38, metalness: 0.3, clearcoat: 0.6 }),
  // le bois, les caisses
  wood: gummy(0xffffff, { map: wood, roughness: 0.7, clearcoat: 0.12 }),
  woodDark: gummy(0x7c5634, { roughness: 0.7, clearcoat: 0.12 }),
  bark: gummy(0x7c5e42, { roughness: 0.95, clearcoat: 0 }),
  logCut: gummy(0xd6b27c, { roughness: 0.8, clearcoat: 0.05 }),
  stencil: new MeshBasicMaterial({ map: crateTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
  // les étoffes
  quilt: gummy(0xffffff, { map: quilt, roughness: 0.88, clearcoat: 0.03 }),
  bagGreen: gummy(0x2f5a45, { roughness: 0.88, clearcoat: 0.03 }),
  mat: gummy(0x7fa08a, { roughness: 0.8, clearcoat: 0.1 }),
  matDark: gummy(0x5e806b, { roughness: 0.8, clearcoat: 0.1 }),
  pillow: gummy(0xf1e7d2, { roughness: 0.9, clearcoat: 0.03 }),
  plaid: gummy(0xffffff, { map: plaid, roughness: 0.92, clearcoat: 0.02 }),
  kilim: gummy(0xffffff, { map: kilimTex, roughness: 0.95, clearcoat: 0 }),
  wool: gummy(0xc8553d, { roughness: 0.95, clearcoat: 0 }),
  woolCream: gummy(0xf0e6cf, { roughness: 0.95, clearcoat: 0 }),
  pocket: gummy(0xffffff, { map: pocketTex, roughness: 0.92, clearcoat: 0 }),
  pack: gummy(0x4f6a45, { roughness: 0.88, clearcoat: 0.05 }),
  packDark: gummy(0x2f4430, { roughness: 0.88, clearcoat: 0.05 }),
  strap: gummy(0xb0603a, { roughness: 0.7, clearcoat: 0.1 }),
  leather: gummy(0x7a4a2a, { roughness: 0.55, clearcoat: 0.3 }),
  leatherDark: gummy(0x4a2c18, { roughness: 0.6, clearcoat: 0.2 }),
  sole: gummy(0x2b2622, { roughness: 0.8, clearcoat: 0.05 }),
  lace: gummy(0xe8dcc0, { roughness: 0.8, clearcoat: 0 }),
  jacket: gummy(0xf2c230, { roughness: 0.5, clearcoat: 0.35 }),
  jacketDark: gummy(0xc89a18, { roughness: 0.5, clearcoat: 0.3 }),
  // l'émail, la vaisselle
  enamel: gummy(0xf7f0e0, { roughness: 0.3, clearcoat: 0.8 }),
  enamelIn: gummy(0xf0e8d4, { roughness: 0.4, clearcoat: 0.4, side: DoubleSide }),
  enamelBlue: gummy(0x2f5f86, { roughness: 0.3, clearcoat: 0.8 }),
  coffee: gummy(0x3a2416, { roughness: 0.1, clearcoat: 1 }),
  canister: gummy(0xc8423a, { roughness: 0.35, clearcoat: 0.7 }),
  canisterTop: gummy(0xd6d0c4, { roughness: 0.3, metalness: 0.3, clearcoat: 0.5 }),
  flame: new MeshBasicMaterial({ color: 0x7fb8ff, transparent: true, opacity: 0, depthWrite: false }),
  flameCore: new MeshBasicMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0, depthWrite: false }),
  knob: gummy(0xdff2ec, { roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.55, depthWrite: false, emissive: 0xffc27a, emissiveIntensity: 0 }),
  // l'ukulélé
  uke: gummy(0xd49a52, { roughness: 0.4, clearcoat: 0.7 }),
  ukeDark: gummy(0x4a2c1c, { roughness: 0.4, clearcoat: 0.6 }),
  fret: gummy(0x2e1c12, { roughness: 0.78, clearcoat: 0.05 }),
  ukeLight: gummy(0xecd2a0, { roughness: 0.45, clearcoat: 0.5 }),
  string: gummy(0xf4efe0, { roughness: 0.3, clearcoat: 0.3 }),
  // la lampe à pétrole
  lampRed: gummy(0xb53a30, { roughness: 0.35, clearcoat: 0.7 }),
  lampGlass: gummy(0xfff0cf, { roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.32, depthWrite: false, side: DoubleSide, emissive: 0xffb45e, emissiveIntensity: 0.1 }),
  lampFlame: new MeshBasicMaterial({ color: 0xffd36b }),
  lampFlameOut: new MeshBasicMaterial({ color: 0xff9a3d, transparent: true, opacity: 0.9 }),
  // le bocal de lucioles
  jar: gummy(0xdff2ec, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.3, depthWrite: false, side: DoubleSide }),
  lid: gummy(0x9ea5ad, { roughness: 0.35, metalness: 0.4, clearcoat: 0.6 }),
  firefly: new MeshBasicMaterial({ color: 0x8aa83e }),
  fireflyLit: new MeshBasicMaterial({ color: 0xeaff6e }),
  bug: gummy(0x2b2a22, { roughness: 0.4, clearcoat: 0.6 }),
  grass: gummy(0x6f9a4e, { roughness: 0.8, clearcoat: 0.1 }),
  paper: gummy(0xf1e8cf, { roughness: 0.9, clearcoat: 0, emissive: 0xf1e8cf, emissiveIntensity: 0.22 }),
  map: gummy(0xffffff, { map: mapTex, roughness: 0.9, clearcoat: 0 }),
  pencil: gummy(0xe0a030, { roughness: 0.5, clearcoat: 0.3 }),
  ink: M.ink,
  match: gummy(0xc8423a, { roughness: 0.6, clearcoat: 0.1 }),
  cream: M.cream,
  // la flaque calme sous le ciré, l'eau posée sur la toile de sol
  puddle: gummy(0x3c4a58, { roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.05 }),
}
