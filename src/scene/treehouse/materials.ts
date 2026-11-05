import { AdditiveBlending, BackSide, DoubleSide, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { M, gummy, skin } from '../materials'
import { foliage, leafy, moss, stone } from '../nature/materials'
import { snowTop } from '../snowTop'
import { banjoHeadTex, barkTex, boardTex, deckTex, forestFloorTex, groundFade, hammockTex, notebookTex, rugTex, shingleTex, stickerTex, waterTex } from './textures'

const deckPlanks = deckTex.clone()
deckPlanks.repeat.set(3.1, 3.1)
const roofShingles = shingleTex.clone()
roofShingles.repeat.set(2.4, 1.1)

/**
 * La cabane perchée, un soir d'été : bois blond et miel des planches, écorce gris brun du chêne, bardeaux terracotta moussus,
 * coton écru rayé du hamac, et tout autour le vert du feuillage (mousse, sauge, vert tendre au soleil). Le soir, la lueur miel
 * des bocaux et le vert jaune des lucioles.
 */
export const T = {
  // le plancher et sa charpente
  deck: gummy(0xffffff, { map: deckPlanks, roughness: 0.62, clearcoat: 0.22 }),
  plank: gummy(0xe2bf8a, { roughness: 0.6, clearcoat: 0.2 }),
  plankDark: gummy(0xb98d5a, { roughness: 0.62, clearcoat: 0.18 }),
  beam: gummy(0xa87c4e, { roughness: 0.6, clearcoat: 0.15 }),
  boards: gummy(0xffffff, { map: boardTex, roughness: 0.65, clearcoat: 0.15 }),
  shingles: snowTop(gummy(0xffffff, { map: roofShingles, roughness: 0.7, clearcoat: 0.12 }), 0.9),
  ridge: gummy(0xb4603e, { roughness: 0.6, clearcoat: 0.2 }),
  // l'arbre
  bark: gummy(0xffffff, { map: barkTex, roughness: 0.85, clearcoat: 0.06 }),
  barkDark: gummy(0x6e5a4c, { roughness: 0.85, clearcoat: 0.05 }),
  // le bois à vif d'une branche coupée : un cœur clair et ses cernes
  cut: gummy(0xe8cf9c, { roughness: 0.6, clearcoat: 0.2 }),
  moss: moss(0x7f9e4e),
  // les galets et les gros rochers du ruisseau, moussus
  stone: stone(0x9d9a8e),
  mossRock: moss(0x6f9448),
  oak: snowTop(foliage(0x7fa24a), 0.7),
  oakLight: snowTop(foliage(0xa3bd5a), 0.7),
  oakDeep: snowTop(foliage(0x5d8442), 0.7),
  // les cimes de la forêt en contrebas, plus bleutées et plus sombres au loin
  far: snowTop(foliage(0x6c9257, { roughness: 0.85, clearcoat: 0.05 }), 0.8),
  farDeep: snowTop(foliage(0x4f7550, { roughness: 0.85, clearcoat: 0.05 }), 0.8),
  farLight: snowTop(foliage(0x93ae66, { roughness: 0.85, clearcoat: 0.05 }), 0.8),
  pine: snowTop(foliage(0x4f7a5a, { roughness: 0.85, clearcoat: 0.05 }), 1),
  // le sol s'efface sur ses bords dans le ciel (alphaMap)
  ground: snowTop(gummy(0xffffff, { map: forestFloorTex, alphaMap: groundFade, transparent: true, roughness: 0.95, clearcoat: 0 }), 0.7, 0.5, 0.8),
  water: new MeshBasicMaterial({ map: waterTex, transparent: true, opacity: 0.95, depthWrite: false }),
  sparkle: new MeshBasicMaterial({ color: 0xfffbe8, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
  leaf: leafy(0x6f9a46),
  leafLight: leafy(0x9cbf5a),
  fern: leafy(0x5f8f48),
  // les textiles
  hammock: gummy(0xffffff, { map: hammockTex, roughness: 0.85, clearcoat: 0.05, side: DoubleSide }),
  rope: gummy(0xd8c08e, { roughness: 0.85, clearcoat: 0.05 }),
  twine: gummy(0xb89a68, { roughness: 0.85, clearcoat: 0.05 }),
  rug: gummy(0xffffff, { map: rugTex, roughness: 0.92, clearcoat: 0.02 }),
  cushion: gummy(0xd8794e, { roughness: 0.82, clearcoat: 0.08 }),
  cushion2: gummy(0x8fae5e, { roughness: 0.82, clearcoat: 0.08 }),
  cushion3: gummy(0xeec36a, { roughness: 0.82, clearcoat: 0.08 }),
  linen: gummy(0xf4ead4, { roughness: 0.85, clearcoat: 0.05 }),
  blanket: gummy(0xc9643f, { roughness: 0.88, clearcoat: 0.04 }),
  // la malle, le banjo
  chest: gummy(0x7e5a3a, { roughness: 0.55, clearcoat: 0.35 }),
  chestLight: gummy(0x9c7048, { roughness: 0.55, clearcoat: 0.35 }),
  leather: gummy(0x8a4a2a, { roughness: 0.55, clearcoat: 0.3 }),
  brass: M.brass,
  iron: gummy(0x4a4440, { roughness: 0.45, clearcoat: 0.4 }),
  maple: gummy(0xd8a050, { roughness: 0.4, clearcoat: 0.7 }),
  walnut: gummy(0x5a3622, { roughness: 0.4, clearcoat: 0.7 }),
  head: gummy(0xffffff, { map: banjoHeadTex, roughness: 0.6, clearcoat: 0.2 }),
  chrome: gummy(0xd6d8d4, { roughness: 0.2, clearcoat: 1 }),
  string: gummy(0xf0ead8, { roughness: 0.3, clearcoat: 0.6, emissive: 0xfff0c8, emissiveIntensity: 0 }),
  sticker: gummy(0xffffff, { map: stickerTex, roughness: 0.6, transparent: true, alphaTest: 0.5 }),
  // le carnet, les jumelles
  page: gummy(0xffffff, { map: notebookTex, roughness: 0.8, clearcoat: 0.05 }),
  cover: gummy(0x4f6e3a, { roughness: 0.6, clearcoat: 0.2 }),
  paper: gummy(0xfbf3df, { roughness: 0.85, clearcoat: 0.05 }),
  binocular: gummy(0x3d4a3a, { roughness: 0.55, clearcoat: 0.3 }),
  lens: gummy(0x8fb6c8, { roughness: 0.05, clearcoat: 1, emissive: 0x6a9ab0, emissiveIntensity: 0.15 }),
  pencil: gummy(0xe2b34a, { roughness: 0.5 }),
  // les bocaux : verre (sans écrire la profondeur, pour voir dedans), la cire, la flamme, le couvercle
  jar: new MeshStandardMaterial({ color: 0xe6f2e4, transparent: true, opacity: 0.32, roughness: 0.05, depthWrite: false, side: DoubleSide }),
  lid: gummy(0xc89a52, { roughness: 0.35, clearcoat: 0.8 }),
  wax: gummy(0xfff1d8, { roughness: 0.5, emissive: 0xffa95e, emissiveIntensity: 0.1 }),
  flame: new MeshBasicMaterial({ color: 0xffc766 }),
  glowJar: new MeshBasicMaterial({ color: 0xffb860, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
  // la citronnade : le pichet de verre, la boisson, les glaçons, le citron, la menthe
  pitcher: new MeshStandardMaterial({ color: 0xf0f8f0, transparent: true, opacity: 0.28, roughness: 0.04, depthWrite: false, side: DoubleSide }),
  // trouble mais translucide : on voit les bulles et les rondelles dedans (elle n'écrit pas la profondeur)
  lemonade: gummy(0xf6dc6a, { roughness: 0.15, clearcoat: 1, transparent: true, opacity: 0.8, depthWrite: false, emissive: 0xe8b830, emissiveIntensity: 0.12 }),
  ice: gummy(0xf4fbff, { roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.6 }),
  lemon: gummy(0xf2d23a, { roughness: 0.4, clearcoat: 0.6 }),
  lemonFlesh: gummy(0xfaf0a8, { roughness: 0.4, clearcoat: 0.6 }),
  bubble: new MeshBasicMaterial({ color: 0xfffbe0, transparent: true, opacity: 0.7, depthWrite: false }),
  cloth: gummy(0xf2e2c4, { roughness: 0.85, clearcoat: 0.04 }),
  clothCheck: gummy(0xd88a64, { roughness: 0.85, clearcoat: 0.04 }),
  terracotta: gummy(0xd0714e, { roughness: 0.6, clearcoat: 0.2 }),
  terracottaIn: gummy(0xa45838, { roughness: 0.7, clearcoat: 0.1, side: BackSide }),
  soil: gummy(0x5a4030, { roughness: 0.95, clearcoat: 0 }),
  // les plantes séchées : lavande, tilleul, achillée
  lavender: gummy(0x9a86c4, { roughness: 0.8, clearcoat: 0.05, emissive: 0x9a86c4, emissiveIntensity: 0.1 }),
  dried: gummy(0xb7a466, { roughness: 0.85, clearcoat: 0.05 }),
  yarrow: gummy(0xf0e4c0, { roughness: 0.85, clearcoat: 0.05 }),
  stem: gummy(0x8a9a5a, { roughness: 0.8, clearcoat: 0.05 }),
  // les bêtes : une peau peinte (blob.ts)
  skin: skin(),
  eye: gummy(0x1c1612, { roughness: 0.15, clearcoat: 1 }),
  glint: new MeshBasicMaterial({ color: 0xffffff }),
  acorn: gummy(0xc99a52, { roughness: 0.45, clearcoat: 0.5 }),
  acornCap: gummy(0x7a5a3a, { roughness: 0.8, clearcoat: 0.1 }),
  // les lucioles et le halo des bocaux
  glow: new MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
}
