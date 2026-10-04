import { AdditiveBlending, MeshBasicMaterial } from 'three'
import { gummy, M } from '../materials'
import { deckTex, gaugeTex, platesTex, rugTex, sonarTex, sweepTex, telegraphTex } from './textures'

/** Matériaux propres au sous-marin : cuivre patiné riveté, acajou, laiton, cuivre rouge, cuir lie-de-vin, verre teinté. */
export const S = {
  plates: gummy(0xffffff, { map: platesTex, roughness: 0.55, clearcoat: 0.35 }),
  deck: gummy(0xffffff, { map: deckTex, roughness: 0.5, clearcoat: 0.4 }),
  hull: gummy(0x37505a, { roughness: 0.5, clearcoat: 0.45 }),
  hullDark: gummy(0x233640, { roughness: 0.55, clearcoat: 0.4 }),
  band: gummy(0xc99a5a, { roughness: 0.35, clearcoat: 0.8 }),
  wood: gummy(0x6d3a2a, { roughness: 0.5, clearcoat: 0.5 }),
  woodDark: gummy(0x47261d, { roughness: 0.5, clearcoat: 0.45 }),
  woodLight: gummy(0x93573a, { roughness: 0.5, clearcoat: 0.45 }),
  brass: M.brass,
  brassDull: gummy(0xb98c3e, { roughness: 0.4, clearcoat: 0.5 }),
  copper: gummy(0xc97c4c, { roughness: 0.32, clearcoat: 0.85 }),
  copperDark: gummy(0x9a5a34, { roughness: 0.4, clearcoat: 0.6 }),
  verdigris: gummy(0x76b6a4, { roughness: 0.45, clearcoat: 0.5 }),
  steel: gummy(0x6b8794, { roughness: 0.35, clearcoat: 0.7 }),
  iron: gummy(0x2d3a44, { roughness: 0.45, clearcoat: 0.4 }),
  leather: gummy(0x8a3038, { roughness: 0.55, clearcoat: 0.45 }),
  leatherDark: gummy(0x5e1f27, { roughness: 0.55, clearcoat: 0.4 }),
  teal: gummy(0x1f6a70, { roughness: 0.8, clearcoat: 0.1 }),
  cream: gummy(0xf0e6c8, { roughness: 0.6, clearcoat: 0.25 }),
  paper: gummy(0xf2e8cc, { roughness: 0.8, clearcoat: 0.05 }),
  red: gummy(0xd8404a, { roughness: 0.4, clearcoat: 0.7 }),
  rug: gummy(0xffffff, { map: rugTex, roughness: 0.9, clearcoat: 0.03 }),
  rugEdge: gummy(0x2a0f16, { roughness: 0.9, clearcoat: 0.03 }),
  glass: gummy(0xcdeff0, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.2 }),
  water: gummy(0x4fd0dc, { roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.62 }),
  gauge: gummy(0xffffff, { map: gaugeTex, roughness: 0.4, clearcoat: 0.7 }),
  telegraph: gummy(0xffffff, { map: telegraphTex, roughness: 0.4, clearcoat: 0.7 }),
  gold: gummy(0xf0c24e, { roughness: 0.3, clearcoat: 0.9 }),
  fish: gummy(0xf08a3c, { roughness: 0.35, clearcoat: 0.8 }),
  /** L'écran du sonar : il brille de lui-même. */
  crt: new MeshBasicMaterial({ map: sonarTex, color: 0x6a8a74 }),
  sweep: new MeshBasicMaterial({ map: sweepTex, color: 0x6a8a74, blending: AdditiveBlending, transparent: true, depthWrite: false }),
  /** L'arche de l'orgue et ses tuyaux, qui rougeoient de la musique. */
  pipeGlow: gummy(0xe8c070, { roughness: 0.3, clearcoat: 0.9, emissive: 0xffa24a, emissiveIntensity: 0 }),
  /** Le verre de la lampe de bureau, vert bouteille. */
  lampGlass: gummy(0x3f9a6e, { roughness: 0.2, clearcoat: 0.9, emissive: 0x5ee0a0, emissiveIntensity: 0.1, transparent: true, opacity: 0.9 }),
}
