import { AdditiveBlending, DoubleSide, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { gummy } from '../materials'
import { leafy } from '../nature/materials'
import {
  bottleTex, cassetteTex, haloTex, changerTex, clockTex, corkTex, counterSignTex, dispenserHeadTex, drumTex, dropsTex, floorTex, hoursTex, letteringTex,
  pavingTex, plasterTex, priceTex, puddleTex, rulesTex, towelTex, tunerTex, wallTileTex, wetSignTex,
} from './textures'

/**
 * La laverie de nuit : le carrelage menthe, l'inox brossé des machines, l'émail blanc, le néon blanc-bleu, les serviettes de
 * couleur qui tournent derrière les hublots ; une touche chaude : la lampe du comptoir et la vitrine du distributeur de lessive.
 */
export const L = {
  // le socle du diorama : du béton gris-vert, un liseré menthe
  base: gummy(0x51666a, { roughness: 0.7, clearcoat: 0.15 }),
  baseTrim: gummy(0x8fd6bd, { roughness: 0.5, clearcoat: 0.4 }),
  // le carrelage du sol, vernis : il prend les reflets du néon, du distributeur et de la lampe
  floor: gummy(0xffffff, { map: floorTex, roughness: 0.2, clearcoat: 0.9, clearcoatRoughness: 0.12 }),
  wall: gummy(0xd8e6ee, { map: plasterTex, roughness: 0.8, clearcoat: 0.1 }),
  wallEdge: gummy(0xdfe8e3, { roughness: 0.75, clearcoat: 0.1 }),
  tile: gummy(0xffffff, { map: wallTileTex, roughness: 0.22, clearcoat: 0.85, clearcoatRoughness: 0.15 }),
  tileTrim: gummy(0x6fc2a6, { roughness: 0.3, clearcoat: 0.8 }),
  // les machines
  enamel: gummy(0xf3f6f4, { roughness: 0.3, clearcoat: 0.85 }),
  steel: gummy(0xc3ced4, { roughness: 0.28, metalness: 0.3, clearcoat: 0.8 }),
  steelDark: gummy(0x6f7d85, { roughness: 0.35, metalness: 0.25, clearcoat: 0.6 }),
  chrome: gummy(0xeef3f6, { roughness: 0.12, metalness: 0.45, clearcoat: 1 }),
  rubber: gummy(0x2b3237, { roughness: 0.7, clearcoat: 0.15 }),
  plastic: gummy(0xd9e0e3, { roughness: 0.4, clearcoat: 0.5 }),
  drum: gummy(0xffffff, { map: drumTex, roughness: 0.3, clearcoat: 0.6 }),
  // le fond du tambour du sèche-linge, qui rougeoie quand il chauffe
  dryerDrum: gummy(0xffffff, { map: drumTex, roughness: 0.3, clearcoat: 0.6, emissive: 0xffa04a, emissiveMap: drumTex, emissiveIntensity: 0 }),
  // le verre bombé des hublots : il laisse voir le linge (pas d'écriture de profondeur)
  porthole: gummy(0xd8eef8, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.32, depthWrite: false }),
  water: gummy(0x8fd0f0, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.5, depthWrite: false }),
  foam: gummy(0xf6fbff, { roughness: 0.6, clearcoat: 0.2 }),
  // les serviettes, draps et chaussettes qui tournent (des couleurs qui ne virent pas la nuit : une lueur de leur couleur)
  coral: gummy(0xf28a78, { roughness: 0.85, clearcoat: 0.05, emissive: 0xf28a78, emissiveIntensity: 0.1 }),
  butter: gummy(0xf6d77a, { roughness: 0.85, clearcoat: 0.05, emissive: 0xf6d77a, emissiveIntensity: 0.1 }),
  sky: gummy(0x8cc6ee, { roughness: 0.85, clearcoat: 0.05, emissive: 0x8cc6ee, emissiveIntensity: 0.1 }),
  lilac: gummy(0xc4a8ea, { roughness: 0.85, clearcoat: 0.05, emissive: 0xc4a8ea, emissiveIntensity: 0.1 }),
  mintCloth: gummy(0x9fe0c4, { roughness: 0.85, clearcoat: 0.05, emissive: 0x9fe0c4, emissiveIntensity: 0.1 }),
  pinkCloth: gummy(0xf4a6c6, { roughness: 0.85, clearcoat: 0.05, emissive: 0xf4a6c6, emissiveIntensity: 0.1 }),
  white: gummy(0xf7f7f2, { roughness: 0.85, clearcoat: 0.05 }),
  towelCoral: gummy(0xffffff, { map: towelTex('#f28a78', '#fff2e8', 4), roughness: 0.9, clearcoat: 0.04, emissive: 0xf28a78, emissiveIntensity: 0.08, side: DoubleSide }),
  towelSky: gummy(0xffffff, { map: towelTex('#8cc6ee', '#ffffff', 5), roughness: 0.9, clearcoat: 0.04, emissive: 0x8cc6ee, emissiveIntensity: 0.08, side: DoubleSide }),
  towelButter: gummy(0xffffff, { map: towelTex('#f6d77a', '#e88a5a', 6), roughness: 0.9, clearcoat: 0.04, emissive: 0xf6d77a, emissiveIntensity: 0.08 }),
  towelMint: gummy(0xffffff, { map: towelTex('#9fe0c4', '#ffffff', 7), roughness: 0.9, clearcoat: 0.04, emissive: 0x9fe0c4, emissiveIntensity: 0.08 }),
  towelLilac: gummy(0xffffff, { map: towelTex('#c4a8ea', '#fff6d0', 8), roughness: 0.9, clearcoat: 0.04, emissive: 0xc4a8ea, emissiveIntensity: 0.08 }),
  // le néon : le tube qui luit, son boîtier, et le halo sur le mur
  tube: new MeshBasicMaterial({ color: 0xeef8ff }),
  tubeHalo: new MeshBasicMaterial({ map: haloTex, color: 0x9fd8ff, transparent: true, opacity: 0.12, blending: AdditiveBlending, depthWrite: false }),
  // les inscriptions : tarifs, consignes, horaires, lettrage de la vitrine
  price: new MeshStandardMaterial({ map: priceTex, roughness: 0.4, emissive: 0xffffff, emissiveMap: priceTex, emissiveIntensity: 0.02 }),
  rules: new MeshStandardMaterial({ map: rulesTex, roughness: 0.85 }),
  hours: new MeshBasicMaterial({ map: hoursTex, transparent: true, depthWrite: false }),
  lettering: new MeshBasicMaterial({ map: letteringTex, transparent: true, depthWrite: false, opacity: 0.92 }),
  cork: new MeshStandardMaterial({ map: corkTex, roughness: 0.9 }),
  clock: new MeshStandardMaterial({ map: clockTex, roughness: 0.4 }),
  hand: gummy(0x2b3a44, { roughness: 0.4 }),
  // la vitrine : le verre, les gouttes côté rue, les montants d'alu laqué blanc
  glass: new MeshStandardMaterial({ color: 0xcfe6f2, roughness: 0.05, transparent: true, opacity: 0.16, depthWrite: false }),
  drops: new MeshBasicMaterial({ map: dropsTex, transparent: true, opacity: 0, depthWrite: false }),
  frame: gummy(0xf2f5f3, { roughness: 0.35, clearcoat: 0.7 }),
  frameDark: gummy(0x3d4a52, { roughness: 0.4, clearcoat: 0.6 }),
  // le distributeur : sa vitrine chaude, son bandeau, son monnayeur, les pièces
  dispenserBody: gummy(0x2a63b8, { roughness: 0.35, clearcoat: 0.7 }),
  dispenserHead: new MeshStandardMaterial({ map: dispenserHeadTex, emissive: 0xffffff, emissiveMap: dispenserHeadTex, emissiveIntensity: 0.5, roughness: 0.3 }),
  dispenserGlow: gummy(0xfff0d0, { roughness: 0.6, clearcoat: 0.2, emissive: 0xffc070, emissiveIntensity: 0.7 }),
  changer: new MeshStandardMaterial({ map: changerTex, roughness: 0.35, emissive: 0xffffff, emissiveMap: changerTex, emissiveIntensity: 0.1 }),
  gold: gummy(0xf2c24a, { roughness: 0.2, metalness: 0.4, clearcoat: 1 }),
  silver: gummy(0xdfe4e8, { roughness: 0.2, metalness: 0.4, clearcoat: 1 }),
  // le banc de plastique moulé, le comptoir, le bois
  benchSeat: gummy(0xe9b54a, { roughness: 0.3, clearcoat: 0.8, emissive: 0xe9b54a, emissiveIntensity: 0.06 }),
  laminate: gummy(0xf4efe4, { roughness: 0.35, clearcoat: 0.6 }),
  wood: gummy(0xc9935e, { roughness: 0.5, clearcoat: 0.4 }),
  woodDark: gummy(0x8a5a36, { roughness: 0.55, clearcoat: 0.3 }),
  mintPaint: gummy(0x8fd6bd, { roughness: 0.45, clearcoat: 0.5 }),
  counterSign: new MeshStandardMaterial({ map: counterSignTex, roughness: 0.5 }),
  // le radiocassette
  boombox: gummy(0xf4cf6a, { roughness: 0.35, clearcoat: 0.75, emissive: 0xf4cf6a, emissiveIntensity: 0.16 }),
  boomboxDark: gummy(0x34393e, { roughness: 0.45, clearcoat: 0.5 }),
  grille: gummy(0x4a5056, { roughness: 0.5, clearcoat: 0.3 }),
  cassette: new MeshStandardMaterial({ map: cassetteTex, roughness: 0.3 }),
  tuner: new MeshStandardMaterial({ map: tunerTex, emissive: 0xffc46a, emissiveMap: tunerTex, emissiveIntensity: 0.15, roughness: 0.3 }),
  reel: gummy(0xf6f2e6, { roughness: 0.4, clearcoat: 0.5 }),
  led: gummy(0x3a1a12, { emissive: 0xff5a3a, emissiveIntensity: 0, roughness: 0.3 }),
  // la lampe du comptoir : l'abat-jour plissé qui luit, le pied de céramique
  shade: gummy(0xfff1d6, { roughness: 0.75, clearcoat: 0.1, emissive: 0xffb25a, emissiveIntensity: 0.15, side: DoubleSide }),
  lampBase: gummy(0x4fa88a, { roughness: 0.25, clearcoat: 0.9 }),
  bulb: new MeshBasicMaterial({ color: 0xfff0c8 }),
  brass: gummy(0xd8aa4a, { roughness: 0.25, metalness: 0.35, clearcoat: 0.9 }),
  // le panneau jaune, le seau, l'eau grise du seau, la flaque calme
  wetSign: new MeshStandardMaterial({ map: wetSignTex, roughness: 0.35 }),
  yellow: gummy(0xf5c935, { roughness: 0.35, clearcoat: 0.7 }),
  mopWater: gummy(0x8fa8ad, { roughness: 0.05, clearcoat: 1 }),
  mopHead: gummy(0xeae4d4, { roughness: 0.95, clearcoat: 0.02 }),
  puddle: gummy(0xcfe6ee, { map: puddleTex, alphaMap: puddleTex, roughness: 0.02, clearcoat: 1, transparent: true, opacity: 0.55, depthWrite: false }),
  // dehors : le trottoir mouillé, la bordure, la chaussée, le réverbère
  paving: gummy(0xffffff, { map: pavingTex, roughness: 0.25, clearcoat: 0.9, clearcoatRoughness: 0.15 }),
  curb: gummy(0xa7adb0, { roughness: 0.6, clearcoat: 0.3 }),
  asphalt: gummy(0x2f363c, { roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.1 }),
  iron: gummy(0x2e3a40, { roughness: 0.45, clearcoat: 0.5 }),
  lampGlass: new MeshBasicMaterial({ color: 0xffe2a8 }),
  // la plante, son pot
  leaf: leafy(0x3f8a5a),
  leafEdge: leafy(0x9cbf5a),
  pot: gummy(0xf6f3ea, { roughness: 0.3, clearcoat: 0.8 }),
  potIn: gummy(0xd8d2c4, { roughness: 0.6, side: DoubleSide }),
  soil: gummy(0x5a4030, { roughness: 0.95, clearcoat: 0 }),
  // le panier à linge en plastique, le chariot, sa toile
  basket: gummy(0x7fc6e8, { roughness: 0.35, clearcoat: 0.7, side: DoubleSide }),
  canvas: gummy(0x4f78b0, { roughness: 0.85, clearcoat: 0.05, side: DoubleSide }),
  // les bidons de lessive
  bottleBlue: gummy(0x3f8ad8, { roughness: 0.3, clearcoat: 0.8 }),
  bottlePink: gummy(0xf08aa8, { roughness: 0.3, clearcoat: 0.8 }),
  // les étiquettes des bidons, sur un plan (jamais sur la boîte arrondie)
  labelBlue: new MeshStandardMaterial({ map: bottleTex('#3f8ad8', '#2a63b8', 'BLEU'), roughness: 0.4 }),
  labelPink: new MeshStandardMaterial({ map: bottleTex('#f08aa8', '#b8466a', 'DOUX'), roughness: 0.4 }),
  capBlue: gummy(0x2a63b8, { roughness: 0.3, clearcoat: 0.8 }),
  capPink: gummy(0xb8466a, { roughness: 0.3, clearcoat: 0.8 }),
  bottleGreen: gummy(0x6fcf9f, { roughness: 0.3, clearcoat: 0.8 }),
  paper: gummy(0xf7f4ea, { roughness: 0.9 }),
  ink: gummy(0x2b3a44, { roughness: 0.5 }),
  // les sprites : halos du néon, de la lampe, du réverbère
  glowCool: new MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.25, blending: AdditiveBlending, depthWrite: false }),
}
