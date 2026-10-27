import { AdditiveBlending, BackSide, DoubleSide, FrontSide, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { M, gummy } from '../materials'
import { cocoaTinTex, dialTex, holeTex, iceTex, lakeIceTex, stencilTex } from './textures'
import { auroraTex, curtainMask, blockTex, fleeceTex, floorTex, greyFurTex, grilleTex, quiltTex, reindeerTex, ringTex } from './textures'

/**
 * Le bivouac polaire : la neige bleu glacier du dôme, la glace claire, et dedans la chaleur d'un campement (laine rouille, peaux
 * de renne, bois de caisse, laiton de la lampe, émail blanc et vert de l'équipement). L'aurore met du vert menthe dehors.
 */
export const I = {
  base: gummy(0xe2ecf5, { roughness: 0.75, clearcoat: 0.15, emissive: 0x9fb4cc, emissiveIntensity: 0.18 }),
  floor: gummy(0xffffff, { map: floorTex, roughness: 0.8, clearcoat: 0.12 }),
  // le dôme : dehors (FrontSide) et dedans (BackSide), la même neige en blocs ; la tranche est plus lisse
  domeOut: gummy(0xffffff, { map: blockTex, roughness: 0.7, clearcoat: 0.18, side: FrontSide, emissive: 0xa8bcd4, emissiveMap: blockTex, emissiveIntensity: 0.22 }),
  domeIn: gummy(0xf4f8ff, { map: blockTex, roughness: 0.72, clearcoat: 0.15, side: BackSide, emissive: 0x8aa0bc, emissiveMap: blockTex, emissiveIntensity: 0.12 }),
  cut: gummy(0xeef4fb, { roughness: 0.6, clearcoat: 0.3, side: DoubleSide, emissive: 0xa8bcd4, emissiveIntensity: 0.2 }),
  snow: gummy(0xf2f7fc, { roughness: 0.7, clearcoat: 0.2 }),
  snowShade: gummy(0xd2e0ee, { roughness: 0.75, clearcoat: 0.15 }),
  // les boules de la lanterne de neige : la bougie les éclaire du dedans le soir (voir SnowLantern)
  snowLit: gummy(0xf6f8fc, { roughness: 0.7, clearcoat: 0.2, emissive: 0xffa458, emissiveIntensity: 0 }),
  // le creux d'une niche : une ombre bleue, tiédie par la bougie
  niche: gummy(0x9cb4d0, { roughness: 0.8, clearcoat: 0.05, emissive: 0xffb070, emissiveIntensity: 0.12 }),
  ice: gummy(0xcfeaf6, { roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.55, depthWrite: false }),
  iceRim: gummy(0xb8dcef, { roughness: 0.12, clearcoat: 1 }),
  // la fenêtre de glace : elle laisse passer la lumière du dehors (le ciel, puis l'aurore quand elle chante)
  pane: new MeshStandardMaterial({ color: 0xbfe2f2, emissive: 0x6ad8c0, emissiveIntensity: 0, roughness: 0.1, transparent: true, opacity: 0.85 }),
  // l'aurore : la texture défile (map), le masque reste (alphaMap) et efface les bords du rideau
  aurora: new MeshBasicMaterial({ map: auroraTex, alphaMap: curtainMask, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, side: DoubleSide }),
  auroraPane: new MeshBasicMaterial({ map: auroraTex, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false }),
  doorway: new MeshBasicMaterial({ color: 0x1a2a40 }),
  water: gummy(0x14304a, { roughness: 0.05, clearcoat: 1 }),
  ring: new MeshBasicMaterial({ map: ringTex, transparent: true, opacity: 0, depthWrite: false }),
  reindeer: gummy(0xffffff, { map: reindeerTex, roughness: 0.92, clearcoat: 0.03 }),
  fleece: gummy(0xffffff, { map: fleeceTex, roughness: 0.95, clearcoat: 0.02 }),
  greyFur: gummy(0xffffff, { map: greyFurTex, roughness: 0.95, clearcoat: 0.02 }),
  quilt: gummy(0xffffff, { map: quiltTex, roughness: 0.6, clearcoat: 0.35 }),
  rust: gummy(0xc4552e, { roughness: 0.55 }),
  wool: gummy(0xe9e2d2, { roughness: 0.9, clearcoat: 0.04 }),
  woolRed: gummy(0xb83a32, { roughness: 0.9, clearcoat: 0.04 }),
  crate: gummy(0xc89a62, { roughness: 0.6, clearcoat: 0.25 }),
  crateDark: gummy(0x9a6e44, { roughness: 0.65 }),
  wood: gummy(0x8a5a3a, { roughness: 0.5, clearcoat: 0.35 }),
  leather: gummy(0x9a6038, { roughness: 0.55, clearcoat: 0.3 }),
  leatherDark: gummy(0x6e4228, { roughness: 0.55, clearcoat: 0.3 }),
  canvas: gummy(0x6f7a52, { roughness: 0.8 }),
  orange: gummy(0xf07a2a, { roughness: 0.45, clearcoat: 0.6 }),
  grille: gummy(0xffffff, { map: grilleTex, roughness: 0.6 }),
  steel: gummy(0x9aa6b0, { roughness: 0.3, clearcoat: 0.8 }),
  darkSteel: gummy(0x3e464e, { roughness: 0.4, clearcoat: 0.6 }),
  thermos: gummy(0x3f7a5a, { roughness: 0.35, clearcoat: 0.7 }),
  enamel: gummy(0xf6f4ee, { roughness: 0.25, clearcoat: 0.9 }),
  enamelRim: gummy(0x2f5f9a, { roughness: 0.25, clearcoat: 0.9 }),
  cocoa: gummy(0x6a3a22, { roughness: 0.2, clearcoat: 0.9 }),
  brass: M.brass,
  lampGlass: gummy(0xfff4dc, { emissive: 0xffb45e, emissiveIntensity: 0.1, roughness: 0.1, transparent: true, opacity: 0.6, depthWrite: false }),
  flame: new MeshBasicMaterial({ color: 0xffc766 }),
  husky: gummy(0x707a86, { roughness: 0.85, clearcoat: 0.05 }),
  huskyLight: gummy(0xf0f2f4, { roughness: 0.85, clearcoat: 0.05 }),
  huskyDark: gummy(0x3e4650, { roughness: 0.8, clearcoat: 0.05 }),
  nose: gummy(0x202428, { roughness: 0.2, clearcoat: 1 }),
  rope: gummy(0xd8b878, { roughness: 0.85 }),
  thread: gummy(0xf4ead6, { roughness: 0.6 }),
  needle: gummy(0xd8dde2, { roughness: 0.15, clearcoat: 1 }),
  // dehors : les sapins, leur écorce ; la truite du seau
  pine: gummy(0x3f6e56, { roughness: 0.75, clearcoat: 0.15 }),
  pineDeep: gummy(0x2f5a48, { roughness: 0.75, clearcoat: 0.15 }),
  bark: gummy(0x5a3e2e, { roughness: 0.8 }),
  fish: gummy(0x8a9aa6, { roughness: 0.2, clearcoat: 1 }),
  fishBelly: gummy(0xf0d8cc, { roughness: 0.3, clearcoat: 0.8 }),
  // les détails de la deuxième passe
  dialFace: new MeshStandardMaterial({ map: dialTex, emissiveMap: dialTex, emissive: 0xffc46a, emissiveIntensity: 0.15, roughness: 0.3 }),
  rubber: gummy(0x2a2a2e, { roughness: 0.75, clearcoat: 0.1 }),
  solar: gummy(0x1e2e52, { roughness: 0.15, clearcoat: 1 }),
  led: gummy(0x4a1a1a, { emissive: 0xff3a2a, emissiveIntensity: 0, roughness: 0.3 }),
  stencil: new MeshStandardMaterial({ map: stencilTex, transparent: true, roughness: 0.8, depthWrite: false }),
  iceFace: new MeshStandardMaterial({ map: iceTex, transparent: true, roughness: 0.1, depthWrite: false }),
  holeWater: gummy(0xffffff, { map: holeTex, roughness: 0.05, clearcoat: 1 }),
  tin: gummy(0xffffff, { map: cocoaTinTex, roughness: 0.35, clearcoat: 0.7 }),
  cork: gummy(0xc89a6a, { roughness: 0.85 }),
  marsh: gummy(0xfff4f6, { roughness: 0.8, clearcoat: 0.1 }),
  earPink: gummy(0xe8a6a8, { roughness: 0.7 }),
  collar: gummy(0xc23a32, { roughness: 0.4, clearcoat: 0.6 }),
  book: gummy(0x2f5a6a, { roughness: 0.6, clearcoat: 0.3 }),
  paper: gummy(0xf6efe0, { roughness: 0.9 }),
  gas: gummy(0x2f6fb0, { roughness: 0.3, clearcoat: 0.8 }),
  hat: gummy(0x3f6e8a, { roughness: 0.9, clearcoat: 0.04 }),
  // l'ombre du poisson sous l'eau du trou (au-dessus du fond, sous la surface : la surface claire reste devant)
  // la glace du lac autour du trou : lisse, vernie, ses fêlures et ses bulles ; la paroi du trou, plus sombre
  lakeIce: gummy(0xffffff, { map: lakeIceTex, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.05 }),
  holeWall: gummy(0x6aa6c8, { roughness: 0.1, clearcoat: 1, side: DoubleSide }),
  flag: gummy(0xff7a2a, { roughness: 0.5, clearcoat: 0.4, side: DoubleSide }),
  bait: gummy(0xd8603a, { roughness: 0.4, clearcoat: 0.6 }),
  fishShadow: new MeshBasicMaterial({ color: 0x04101c, transparent: true, opacity: 0.55, depthWrite: false }),
  ink: M.ink,
}
