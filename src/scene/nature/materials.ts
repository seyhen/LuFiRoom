import type { MeshPhysicalMaterialParameters } from 'three'
import { far, gummy } from '../materials'
import { foliageTex, leafTex, mossTex, stoneTex } from './textures'

// Fabriques de matériaux pour la nature : chaque pièce les appelle avec ses propres couleurs (dans son materials.ts).

/** Pierre mate, à peine lustrée : de la pierre, pas du bonbon. */
export const stone = (color: number, o: MeshPhysicalMaterialParameters = {}) =>
  gummy(color, { map: stoneTex, roughness: 0.78, clearcoat: 0.14, clearcoatRoughness: 0.55, ...o })

/** Mousse veloutée. */
export const moss = (color: number) => gummy(color, { map: mossTex, roughness: 0.95, clearcoat: 0.04 })

/**
 * Une masse de feuillage (avec `foliageGeo`) : la texture peint l'ombre et le soleil, la couleur fait l'essence. Une couleur
 * franche et assez claire : la texture l'assombrit dans les creux.
 */
export const foliage = (color: number, o: MeshPhysicalMaterialParameters = {}) =>
  gummy(color, { map: foliageTex, roughness: 0.72, clearcoat: 0.18, clearcoatRoughness: 0.6, ...o })

/** Une feuille (avec `leafGeo`) : nervures claires, un peu de brillant comme une vraie feuille de plante d'intérieur. */
export const leafy = (color: number, o: MeshPhysicalMaterialParameters = {}) =>
  gummy(color, { map: leafTex, roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.25, ...o })

// Les mêmes pour le dehors et le lointain : même teinte, même texture, sans vernis (`far`, voir scene/materials.ts).
export const farStone = (color: number, o: MeshPhysicalMaterialParameters = {}) => far(color, { map: stoneTex, roughness: 0.78, ...o })
export const farMoss = (color: number) => far(color, { map: mossTex, roughness: 0.95 })
export const farFoliage = (color: number, o: MeshPhysicalMaterialParameters = {}) => far(color, { map: foliageTex, roughness: 0.72, ...o })
export const farLeafy = (color: number, o: MeshPhysicalMaterialParameters = {}) => far(color, { map: leafTex, roughness: 0.42, ...o })
