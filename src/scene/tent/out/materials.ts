import { AdditiveBlending, MeshBasicMaterial, SpriteMaterial } from 'three'
import { snowTop } from '../../snowTop'
import { far } from '../../materials'
import { skyFade } from '../../outdoor'
import { farFoliage, farLeafy, farMoss, farStone } from '../../nature/materials'
import { glowTex } from '../../textures'

// Les matériaux du dehors de la tente : une pinède sous la pluie. Peu de matériaux, partagés ; tout ce qui est loin se fond dans le ciel.
const near = <T extends Parameters<typeof skyFade>[0]>(m: T) => skyFade(m, { c: [0, 0], r0: 9, r1: 16.5 })
/** Le dehors lointain des grands écrans (les coins du haut sont à 13 à 18 du centre) : fondu large. */
const wide = <T extends Parameters<typeof skyFade>[0]>(m: T) => skyFade(m, { c: [0, 0], r0: 9.5, r1: 17.5 })

export const O = {
  ground: wide(snowTop(far(0xffffff, { vertexColors: true, roughness: 0.95 }), 0.95)),
  fir: near(snowTop(far(0xffffff, { roughness: 0.8 }), 0.7)),
  farFir: wide(snowTop(far(0xffffff, { roughness: 0.85 }), 0.7)),
  trunk: near(far(0x4a3828, { roughness: 0.9 })),
  farTrunk: wide(far(0x3e3a30, { roughness: 0.9 })),
  snowOff: near(far(0xffffff)),
  birchBark: near(far(0xe0dccf, { roughness: 0.8 })),
  birchMark: near(far(0x2e2a26, { roughness: 0.9 })),
  leaf: [near(snowTop(farFoliage(0x9bb84a), 0.6)), near(snowTop(farFoliage(0x7da23e), 0.6)), near(snowTop(farFoliage(0xb8c85a), 0.6))],
  fernM: near(snowTop(farLeafy(0x3f7a4a), 0.7)),
  fernM2: near(snowTop(farLeafy(0x5d9a52), 0.7)),
  stone: near(snowTop(farStone(0x77746a), 0.8)),
  moss: near(snowTop(farMoss(0x5b7a3e), 0.8)),
  log: near(snowTop(far(0x5c4430, { roughness: 0.9 }), 0.7)),
  logCut: near(far(0xcfae78, { roughness: 0.85 })),
  charcoal: near(far(0x24201c, { roughness: 0.95 })),
  ash: near(far(0x6c6a66, { roughness: 0.95 })),
  tarp: near(far(0x3d6c86, { roughness: 0.55 })),
  tarpEdge: near(far(0x2a4a5c, { roughness: 0.6 })),
  rope: near(far(0xd8c9a0, { roughness: 0.9 })),
  peg: near(far(0xb08a4a, { roughness: 0.7 })),
  iron: near(far(0x34322f, { roughness: 0.5, metalness: 0.3 })),
  lantern: near(far(0xffe4a8, { roughness: 0.4, emissive: 0xffb45e, emissiveIntensity: 0.1 })),
  mushroom: near(far(0xc8423a, { roughness: 0.5 })),
  mushroomStem: near(far(0xeadfc4, { roughness: 0.7 })),
  dot: near(far(0xf4eede, { roughness: 0.7 })),
  puddle: near(far(0x4a5c6a, { roughness: 0.05, metalness: 0.1 })),
  glow: new SpriteMaterial({ map: glowTex, color: 0xffc070, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
  ember: new MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0.0, depthWrite: false }),
}
