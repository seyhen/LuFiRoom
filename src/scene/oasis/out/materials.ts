import { AdditiveBlending, DoubleSide, MeshBasicMaterial, MeshStandardMaterial, SpriteMaterial } from 'three'
import { snowTop } from '../../snowTop'
import { far } from '../../materials'
import { skyFade } from '../../outdoor'
import { farFoliage, farLeafy, farStone } from '../../nature/materials'
import { glowTex } from '../../textures'
import { barkTex, ksarColor, ksarGlow, strataTex, waterTex } from '../textures'

// Les matériaux du dehors de l'oasis : des dunes d'or qui se fondent dans le ciel bleu du jour (indigo la nuit), un bosquet, un village
// de terre. Peu de matériaux, partagés ; le sol porte aussi les étoiles de la nuit (`stars` de skyFade : il couvre le haut de l'écran).
const near = <T extends Parameters<typeof skyFade>[0]>(m: T) => skyFade(m, { c: [0, 0], r0: 9, r1: 16.5 })
/** Le dehors lointain des grands écrans (les coins du haut sont à 13 à 18 du centre) : fondu large. */
const wide = <T extends Parameters<typeof skyFade>[0]>(m: T) => skyFade(m, { c: [0, 0], r0: 9.5, r1: 17.5 })

export const O = {
  ground: skyFade(snowTop(far(0xffffff, { vertexColors: true, roughness: 0.96 }), 0.95), { c: [0, 0], r0: 8.5, r1: 16.5, stars: 1 }),
  bark: near(far(0xffffff, { map: barkTex, roughness: 0.95 })),
  barkFar: wide(far(0xffffff, { map: barkTex, roughness: 0.95 })),
  frond: near(snowTop(farLeafy(0x6a8a38), 0.6)),
  frond2: near(snowTop(farLeafy(0x86a246), 0.6)),
  frondFar: wide(snowTop(farLeafy(0x7a9a46), 0.6)),
  dry: near(far(0x9a8446, { roughness: 0.9 })),
  shrub: near(snowTop(farFoliage(0x7c8a4e), 0.6)),
  shrubDark: near(snowTop(farFoliage(0x5e7a40), 0.6)),
  grass: near(snowTop(farLeafy(0x7a9a3a), 0.6)),
  stone: near(snowTop(farStone(0xc0a078), 0.8)),
  stoneRed: wide(snowTop(farStone(0xc08a58), 0.8)),
  strata: wide(snowTop(far(0xffffff, { map: strataTex, roughness: 0.92 }), 0.7)),
  strataNear: near(snowTop(far(0xffffff, { map: strataTex, roughness: 0.92 }), 0.7)),
  ksar: wide(new MeshStandardMaterial({ color: 0xffffff, map: ksarColor, emissive: 0xffffff, emissiveMap: ksarGlow, emissiveIntensity: 0.0, roughness: 0.94 })),
  ksarCap: wide(far(0xb98258, { roughness: 0.95 })),
  ksarDark: wide(far(0x6a4630, { roughness: 0.95 })),
  water: near(far(0x2d9a9a, { map: waterTex, roughness: 0.1 })),
  camel: near(far(0xc9a070, { roughness: 0.9 })),
  camelDark: near(far(0x8a6a44, { roughness: 0.9 })),
  camelFar: wide(far(0x9a7a52, { roughness: 0.9 })),
  blanket: near(far(0xb5532c, { roughness: 0.92 })),
  cloth: near(far(0xffffff, { vertexColors: true, roughness: 0.92, side: DoubleSide })),
  blanketIndigo: near(far(0x2a417d, { roughness: 0.92 })),
  saddle: near(far(0x6a3e22, { roughness: 0.8 })),
  rope: near(far(0xd8c69a, { roughness: 0.9 })),
  glow: new SpriteMaterial({ map: glowTex, color: 0xffc070, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
  ember: new MeshBasicMaterial({ color: 0xff7a2a }),
}
