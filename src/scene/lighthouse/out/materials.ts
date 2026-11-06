import { AdditiveBlending, BackSide, DoubleSide, MeshBasicMaterial, MeshPhysicalMaterial, RepeatWrapping, SpriteMaterial } from 'three'
import { gummy } from '../../materials'
import { canvasTex, seeded } from '../../paint'
import { skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'
import { moss, stone } from '../../nature/materials'
import { glowTex } from '../../textures'

// La mer autour de l'aiguille de roche, le phare sur son îlot, le ponton du gardien. Tout se fond dans le ciel au large.

/** La houle vue de haut : des crêtes d'écume ondulées, sur transparent (la couleur de la mer est dessous). */
const swellTex = canvasTex(256, 256, (x) => {
  const r = seeded(5)
  x.clearRect(0, 0, 256, 256)
  x.lineCap = 'round'
  for (let k = 0; k < 9; k++) {
    const y0 = (k + 0.5) * (256 / 9), ph = r() * 6.3
    let px = r() * 30
    while (px < 256) {
      const seg = 20 + r() * 50
      x.strokeStyle = `rgba(255,255,255,${0.25 + r() * 0.35})`; x.lineWidth = 1.5 + r() * 2.5
      x.beginPath()
      for (let s = 0; s <= seg; s += 4) { const X = px + s, Y = y0 + Math.sin(X * 0.05 + ph) * 5; s ? x.lineTo(X, Y) : x.moveTo(X, Y) }
      x.stroke(); px += seg + 18 + r() * 40
    }
  }
}, [1, 1])
swellTex.wrapS = swellTex.wrapT = RepeatWrapping
swellTex.repeat.set(7, 7)

/** L'écume au pied des rochers : un anneau blanc, plein dedans, effiloché dehors (u le long de l'anneau, v vers le large). */
const foamTex = canvasTex(256, 64, (x) => {
  const r = seeded(9), g = x.createLinearGradient(0, 0, 0, 64)
  g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.45, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, 256, 64)
  x.globalCompositeOperation = 'destination-out'
  for (let i = 0; i < 90; i++) { x.beginPath(); x.arc(r() * 256, 20 + r() * 44, 2 + r() * 6, 0, 6.3); x.fill() }
}, [1, 1])
foamTex.wrapS = RepeatWrapping

const F = { c: [0, 0] as [number, number], r0: 7.5, r1: 12.5 }
const out = <T extends MeshPhysicalMaterial>(m: T, snow: [number, number?, number?] = [0.9, 0.4, 0.8]) => skyFade(snowTop(m, ...snow), F)

export const swell = swellTex
export const foam = foamTex

export const S = {
  sea: skyFade(gummy(0x3e7f96, { roughness: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.2 }), F),
  swell: skyFade(new MeshBasicMaterial({ map: swellTex, transparent: true, opacity: 0.7, depthWrite: false }), F),
  foam: skyFade(new MeshBasicMaterial({ map: foamTex, transparent: true, opacity: 0.9, depthWrite: false, side: DoubleSide }), F),
  rock: [out(stone(0x6f7a8a)), out(stone(0x5c6676)), out(stone(0x7b8494))],
  weed: out(moss(0x4f7a5c)),
  wet: out(gummy(0x3f4856, { roughness: 0.4, clearcoat: 0.6 })),
  // le phare : blanc, bandes rouges, lanterne de verre, coupole rouge
  white: out(gummy(0xf4f0e8, { roughness: 0.5, clearcoat: 0.3 }), [0.6, 0.55, 0.9]),
  red: out(gummy(0xd8404a, { roughness: 0.4, clearcoat: 0.6 }), [0.9, 0.45, 0.85]),
  iron: out(gummy(0x2a2e36, { roughness: 0.45, clearcoat: 0.4 }), [0.6, 0.55, 0.9]),
  brass: out(gummy(0xe0b050, { roughness: 0.3, clearcoat: 0.9 })),
  lamp: out(gummy(0xfff4d8, { roughness: 0.1, clearcoat: 1, emissive: 0xffd27a, emissiveIntensity: 0.2 })),
  window: out(gummy(0x2b4a6f, { roughness: 0.2, clearcoat: 0.9, emissive: 0xffc070, emissiveIntensity: 0 })),
  // le ponton, la barque, la bouée
  wood: out(gummy(0x9c8468, { roughness: 0.8, clearcoat: 0.06 }), [0.9, 0.45, 0.85]),
  woodDark: out(gummy(0x6e5a48, { roughness: 0.85 })),
  hull: out(gummy(0x2b6f8a, { roughness: 0.4, clearcoat: 0.6, side: DoubleSide })),
  hullIn: out(gummy(0xe8dcc6, { roughness: 0.7, side: BackSide })),
  rope: out(gummy(0xe2cfa4, { roughness: 0.9 })),
  buoyRed: out(gummy(0xe2564a, { roughness: 0.4, clearcoat: 0.6 })),
  buoyWhite: out(gummy(0xfbf6ee, { roughness: 0.4, clearcoat: 0.6 })),
  /** Le faisceau du phare : deux cônes de lumière additifs, visibles la nuit et par temps sombre. */
  beam: new MeshBasicMaterial({ color: 0xfff0b8, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, side: DoubleSide }),
  glow: new SpriteMaterial({ map: glowTex, color: 0xffe2a0, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
}
