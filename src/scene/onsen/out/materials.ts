import { AdditiveBlending, DoubleSide, MeshBasicMaterial, MeshPhysicalMaterial, RepeatWrapping, SpriteMaterial } from 'three'
import { gummy } from '../../materials'
import { canvasTex, seeded } from '../../paint'
import { skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'
import { foliage, leafy, moss, stone } from '../../nature/materials'
import { glowTex } from '../../textures'

// Les matériaux du versant : mousse, pierre, vermillon du torii et du pont, bois de cèdre, bambou, érables, pins, cèdres du Japon,
// l'eau du ruisseau. Tout reçoit la neige (`snowTop`) et se fond dans le ciel sur les bords.

/** L'eau du ruisseau : des rides claires qui filent (la texture défile le long du lit). */
const streamTex = canvasTex(128, 256, (x) => {
  const r = seeded(4)
  x.fillStyle = '#7fbcc0'; x.fillRect(0, 0, 128, 256)
  x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineCap = 'round'
  for (let i = 0; i < 40; i++) {
    const X = r() * 128, Y = r() * 256, w = 10 + r() * 26
    x.lineWidth = 1.5 + r() * 2
    x.beginPath(); x.moveTo(X - w / 2, Y); x.quadraticCurveTo(X, Y - 4, X + w / 2, Y); x.stroke()
  }
}, [1, 1])
streamTex.wrapS = streamTex.wrapT = RepeatWrapping

const out = <T extends MeshPhysicalMaterial>(m: T, snow: [number, number?, number?] = [0.9, 0.4, 0.8]) => skyFade(snowTop(m, ...snow), { c: [0, 0], r0: 7.5, r1: 12.5 })

export const stream = streamTex

export const N = {
  ground: out(gummy(0xffffff, { vertexColors: true, roughness: 0.9, clearcoat: 0 }), [1, 0.4, 0.8]),
  water: skyFade(gummy(0xffffff, { map: streamTex, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.85, depthWrite: false }), { c: [0, 0], r0: 7.5, r1: 12.5 }),
  rock: out(stone(0x9a968c)),
  rockDark: out(stone(0x6e6a64)),
  moss: out(moss(0x6a8a4a), [0.9, 0.4, 0.8]),
  vermilion: out(gummy(0xd8452e, { roughness: 0.45, clearcoat: 0.5 }), [0.9, 0.5, 0.85]),
  black: out(gummy(0x2a2624, { roughness: 0.5, clearcoat: 0.3 }), [0.9, 0.5, 0.85]),
  brass: out(gummy(0xd9a84a, { roughness: 0.3, clearcoat: 0.9 })),
  cedar: out(gummy(0x8a5e3e, { roughness: 0.6, clearcoat: 0.2 }), [0.8, 0.5, 0.85]),
  lantern: out(gummy(0xb4ada2, { roughness: 0.8 }), [1, 0.45, 0.8]),
  paper: out(gummy(0xfff0d0, { roughness: 0.9, emissive: 0xffb45e, emissiveIntensity: 0 })),
  bamboo: out(gummy(0x8fb05a, { roughness: 0.4, clearcoat: 0.6 }), [0.6, 0.5, 0.85]),
  bambooNode: out(gummy(0x6f9044, { roughness: 0.4, clearcoat: 0.5 })),
  bambooLeaf: out(leafy(0x7aa856, { side: DoubleSide }), [0.7, 0.4, 0.8]),
  bark: out(gummy(0x4a3a30, { roughness: 0.8 })),
  maple: [0xff5a3c, 0xff8c48, 0xe8402e].map((c) => out(foliage(c), [0.8, 0.4, 0.8])),
  pine: out(foliage(0x3f6a4a, { roughness: 0.8 }), [1, 0.35, 0.75]),
  sugi: out(gummy(0x2f5a44, { roughness: 0.7, clearcoat: 0.1 }), [0.85, 0.4, 0.8]),
  shrub: out(foliage(0x5a8a4a), [0.9, 0.4, 0.8]),
  snowCap: out(gummy(0xf3f7ff, { roughness: 0.5, clearcoat: 0.3 })),
  glow: new SpriteMaterial({ map: glowTex, color: 0xffc070, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
  foam: new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false }),
}
