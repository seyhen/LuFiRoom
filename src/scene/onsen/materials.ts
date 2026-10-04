import { DoubleSide, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { M, gummy } from '../materials'
import { flagTex, poolTex, rippleTex, shojiTex, tileTex, yukataTex } from './textures'
import { stoneTex } from '../nature/textures'
import { foliage, leafy, moss, stone } from '../nature/materials'

const flags = flagTex.clone()
flags.repeat.set(4, 4)

/**
 * L'onsen en automne : cèdre sombre et hinoki blond, pierre grise et mousse, papier des shōji, eau laiteuse et turquoise,
 * et le rouge des érables. Le soir, la lanterne de pierre et les shōji s'allument.
 */
export const O = {
  base: gummy(0x6a6458, { roughness: 0.85, clearcoat: 0.05 }),
  earth: gummy(0x5a5040, { roughness: 0.9 }),
  flags: gummy(0xece4d8, { map: flags, roughness: 0.6, clearcoat: 0.35, clearcoatRoughness: 0.3 }),
  cedar: gummy(0x4a3428, { roughness: 0.5 }),
  hinoki: gummy(0xd9b88a, { roughness: 0.5, clearcoat: 0.3 }),
  deck: gummy(0x8a5e3e, { roughness: 0.45, clearcoat: 0.4 }),
  shoji: new MeshStandardMaterial({ map: shojiTex, emissiveMap: shojiTex, emissive: 0xffc77a, emissiveIntensity: 0, roughness: 0.9 }),
  tiles: gummy(0xffffff, { map: tileTex, roughness: 0.5, clearcoat: 0.4 }),
  // Les pierres : gris chaud, gris bleuté, brun de rivière, basalte sombre. Mates, à peine lustrées : de la pierre, pas du bonbon.
  stone: [0x9c968c, 0x868b92, 0x9a8676, 0x6a6662].map((c) => stone(c)),
  moss: moss(0x7d9a4e),
  mossDark: moss(0x5e7e3e),
  // Les galets : blancs, chacun teinté par son instance.
  pebble: gummy(0xffffff, { map: stoneTex, roughness: 0.6, clearcoat: 0.3 }),
  water: gummy(0xffffff, { map: poolTex, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.9 }),
  ripples: new MeshBasicMaterial({ map: rippleTex, transparent: true, opacity: 0.5, depthWrite: false }),
  stream: gummy(0xd8f4f0, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.55 }),
  bamboo: gummy(0x9fb45e, { roughness: 0.4, clearcoat: 0.6 }),
  bambooDry: gummy(0xcdb27a, { roughness: 0.5, clearcoat: 0.3 }),
  rope: gummy(0x2a2420, { roughness: 0.8 }),
  maple: [gummy(0xd9442e, { roughness: 0.7 }), gummy(0xe8763a, { roughness: 0.7 }), gummy(0xc23628, { roughness: 0.7 }), gummy(0xeaa040, { roughness: 0.7 })],
  // Le jardin : feuillages (masses peintes d'ombre et de soleil) et feuilles. Couleurs franches, la texture les assombrit.
  mapleF: [0xff5a3c, 0xff8c48, 0xe8402e, 0xffb84e].map((c) => foliage(c)),
  pineF: foliage(0x5f9466),
  pineDeep: foliage(0x4a7c58),
  azaleaF: foliage(0x6aa058),
  azaleaRust: foliage(0x8a9a4e),
  azaleaDeep: foliage(0x4f8a50),
  nantenLeaf: leafy(0xd8503a, { roughness: 0.5 }),
  nantenGreen: leafy(0x7a8a48, { roughness: 0.5 }),
  mossF: foliage(0x92b064, { roughness: 0.95, clearcoat: 0.04 }),
  fern: leafy(0x6fa85a),
  fernLight: leafy(0x9cc874),
  grass: leafy(0xc4cc66, { roughness: 0.6, clearcoat: 0.3 }),
  berry: gummy(0xe0281e, { roughness: 0.25, clearcoat: 0.9 }),
  bark: gummy(0x4a3a30, { roughness: 0.8 }),
  pine: gummy(0x3f6a4a, { roughness: 0.8 }),
  azalea: gummy(0x5a8a4a),
  lanternGlow: gummy(0xfff0d0, { emissive: 0xffb45e, emissiveIntensity: 0, roughness: 0.9 }),
  yukata: gummy(0xffffff, { map: yukataTex, roughness: 0.85, clearcoat: 0.02 }),
  towel: gummy(0xfbf8f2, { roughness: 0.9, clearcoat: 0.02 }),
  indigo: gummy(0x2f3f6e, { roughness: 0.8 }),
  iron: gummy(0x2a2826, { roughness: 0.5, clearcoat: 0.3 }),
  ceramic: gummy(0xeae4d8, { roughness: 0.3, clearcoat: 0.8 }),
  celadon: gummy(0xa8c8b0, { roughness: 0.3, clearcoat: 0.8 }),
  furin: gummy(0xd8eef0, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.6, side: DoubleSide }),
  tanzaku: gummy(0xf06a6a, { roughness: 0.9, side: DoubleSide }),
  paper: gummy(0xf7f0df, { roughness: 0.9 }),
  red: gummy(0xc23a3a),
  chochin: gummy(0xd8402e, { roughness: 0.8, emissive: 0xff7a3a, emissiveIntensity: 0.1 }),
  ink: M.ink,
  // Les montagnes au loin, dans la brume : trois plans, du plus proche au plus lointain.
  mountains: [gummy(0x6f7f8a, { roughness: 0.9 }), gummy(0x8f9a8a, { roughness: 0.9, clearcoat: 0.05 }), gummy(0xaab0c8, { roughness: 0.9, clearcoat: 0.05 })],
  // la forêt d'automne sur les collines, derrière la palissade
  forest: [0xd8703e, 0xe8a84e, 0xc85a3a, 0xa8a050, 0xf0bc5a].map((c) => foliage(c, { roughness: 0.85, clearcoat: 0.05 })),
  forestPine: foliage(0x4a6e50, { roughness: 0.85, clearcoat: 0.05 }),
  moon: new MeshBasicMaterial({ color: 0xfaf4e0, transparent: true, opacity: 0 }),
}
