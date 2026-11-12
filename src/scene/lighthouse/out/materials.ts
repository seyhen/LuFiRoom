import { AdditiveBlending, BackSide, DoubleSide, LinearFilter, MeshBasicMaterial, MeshStandardMaterial, RepeatWrapping, SpriteMaterial } from 'three'
import { far } from '../../materials'
import { canvasTex, seeded } from '../../paint'
import { skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'
import { farMoss, farStone } from '../../nature/materials'
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
  for (let i = 0; i < 170; i++) { x.beginPath(); x.arc(r() * 256, 8 + r() * 56, 2 + r() * 7, 0, 6.3); x.fill() }
}, [1, 1])
foamTex.wrapS = RepeatWrapping

/** Le faisceau, vu dans sa longueur : vif à la lanterne, éteint au large (v = 0 à la lanterne, 1 au bout du cône). */
const beamTex = canvasTex(4, 128, (x) => {
  const g = x.createLinearGradient(0, 0, 0, 128) // le haut du canvas est le bout du cône
  // éteint sur le premier sixième (le bord du cône) et en douceur : un bord à alpha non nul laissait une fine ligne d'ellipse au bout large
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.16, 'rgba(255,255,255,0)'); g.addColorStop(0.3, 'rgba(255,255,255,.1)'); g.addColorStop(0.5, 'rgba(255,255,255,.4)'); g.addColorStop(0.8, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,1)')
  x.fillStyle = g; x.fillRect(0, 0, 4, 128)
}, [1, 1])
beamTex.generateMipmaps = false // le niveau le plus flou du filtre moyenne tout le dégradé : son bord n'était plus à zéro
beamTex.minFilter = LinearFilter

/**
 * La roche des falaises, en strates : bandes horizontales de gris-bleu et de brun, fissures verticales, lichen jaune-vert et
 * fientes de goélands. Claire (elle multiplie la teinte du matériau) et sans contraste dur : elle ne scintille pas, et se lit
 * encore sous le voile du lointain. Les UV de `Rock` sont projetées à l'écran : v monte avec la hauteur.
 */
const strataTex = canvasTex(256, 256, (x) => {
  const r = seeded(21)
  const cols = [[206, 214, 228], [190, 198, 214], [226, 208, 184], [214, 200, 182], [198, 206, 222], [178, 170, 168]]
  let y = 0
  while (y < 256) {
    const h = 9 + r() * 20, c = cols[Math.floor(r() * cols.length)]
    x.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`; x.fillRect(0, y, 256, h + 1)
    // le joint plus sombre sous la strate, et le grain de la couche
    x.fillStyle = 'rgba(70,74,92,.34)'; x.fillRect(0, y + h - 2.5, 256, 2.5)
    x.fillStyle = 'rgba(255,255,255,.1)'; x.fillRect(0, y, 256, 2)
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '80,84,100'},${0.05 + r() * 0.07})`; x.fillRect(r() * 256, y + r() * h, 4 + r() * 14, 1.5) }
    y += h
  }
  // fissures verticales : traits sombres qui coupent quelques strates, et se bifurquent un peu
  x.lineCap = 'round'
  for (let k = 0; k < 11; k++) {
    let px = r() * 256, py = r() * 200
    const len = 40 + r() * 90
    x.strokeStyle = 'rgba(52,56,74,.55)'; x.lineWidth = 2 + r() * 1.5
    x.beginPath(); x.moveTo(px, py)
    for (let s = 0; s < len; s += 10) { px += (r() - 0.5) * 5; py += 10; x.lineTo(px, py) }
    x.stroke()
  }
  // lichen (taches jaune-vert) et fientes de goélands (blanc crayeux, coulures)
  for (let k = 0; k < 16; k++) {
    const px = r() * 256, py = r() * 256
    x.fillStyle = `rgba(${150 + r() * 40},${170 + r() * 30},${90 + r() * 30},.55)`
    for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(px + (r() - 0.5) * 16, py + (r() - 0.5) * 8, 2.5 + r() * 4, 0, 6.3); x.fill() }
  }
  for (let k = 0; k < 9; k++) {
    const px = r() * 256, py = r() * 240
    x.fillStyle = 'rgba(250,248,240,.8)'
    x.beginPath(); x.ellipse(px, py, 4 + r() * 5, 3 + r() * 2, 0, 0, 6.3); x.fill()
    x.fillRect(px - 1, py, 2, 6 + r() * 10)
  }
}, [1, 1])

const F = { c: [0, 0] as [number, number], r0: 7.5, r1: 12.5 }
const out = <T extends MeshStandardMaterial>(m: T, snow: [number, number?, number?] = [0.9, 0.4, 0.8]) => skyFade(snowTop(m, ...snow), F)
// Le fond lointain (falaises à 12 à 16 du centre, les coins du haut d'un grand écran) : un fondu plus large, sinon `skyFade` les efface.
const F2 = { c: [0, 0] as [number, number], r0: 9.5, r1: 17.5 }
const outFar = <T extends MeshStandardMaterial>(m: T, snow: [number, number?, number?] = [0.9, 0.4, 0.8]) => skyFade(snowTop(m, ...snow), F2)

const cliff = (c: number) => farStone(c, { map: strataTex })

export const swell = swellTex
export const foam = foamTex

export const S = {
  sea: skyFade(far(0x3e7f96, { roughness: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.2 }), F),
  swell: skyFade(new MeshBasicMaterial({ map: swellTex, transparent: true, opacity: 0.7, depthWrite: false }), F),
  foam: skyFade(new MeshBasicMaterial({ map: foamTex, transparent: true, opacity: 0.9, depthWrite: false, side: DoubleSide }), F),
  rock: [out(cliff(0x6f7a8a)), out(cliff(0x5c6676)), out(cliff(0x7b8494))],
  weed: out(farMoss(0x4f7a5c)),
  wet: out(far(0x3f4856, { roughness: 0.4, clearcoat: 0.6 })),
  // le phare : blanc, bandes rouges, lanterne de verre, coupole rouge
  white: out(far(0xf4f0e8, { roughness: 0.5, clearcoat: 0.3 }), [0.6, 0.55, 0.9]),
  red: out(far(0xd8404a, { roughness: 0.4, clearcoat: 0.6 }), [0.9, 0.45, 0.85]),
  iron: out(far(0x2a2e36, { roughness: 0.45, clearcoat: 0.4 }), [0.6, 0.55, 0.9]),
  brass: out(far(0xe0b050, { roughness: 0.3, clearcoat: 0.9 })),
  lamp: out(far(0xfff4d8, { roughness: 0.1, clearcoat: 1, emissive: 0xffd27a, emissiveIntensity: 0.2 })),
  window: out(far(0x2b4a6f, { roughness: 0.2, clearcoat: 0.9, emissive: 0xffc070, emissiveIntensity: 0 })),
  // le ponton, la barque, la bouée
  wood: out(far(0x9c8468, { roughness: 0.8, clearcoat: 0.06 }), [0.9, 0.45, 0.85]),
  woodDark: out(far(0x6e5a48, { roughness: 0.85 })),
  hull: out(far(0x2b6f8a, { roughness: 0.4, clearcoat: 0.6, side: DoubleSide })),
  hullIn: out(far(0xe8dcc6, { roughness: 0.7, side: BackSide })),
  rope: out(far(0xe2cfa4, { roughness: 0.9 })),
  buoyRed: out(far(0xe2564a, { roughness: 0.4, clearcoat: 0.6 })),
  buoyWhite: out(far(0xfbf6ee, { roughness: 0.4, clearcoat: 0.6 })),
  /** Le faisceau du phare : deux cônes de lumière additifs, visibles la nuit et par temps sombre. */
  beam: new MeshBasicMaterial({ map: beamTex, color: 0xfff0b8, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, side: DoubleSide, vertexColors: true }),
  // les falaises du fond : l'herbe rase du dessus, la voile blanche du voilier
  grass: out(farMoss(0x6da15c)),
  rockFar: [outFar(cliff(0x8794a6)), outFar(cliff(0x7886a0)), outFar(cliff(0x94a0b2))],
  grassFar: outFar(farMoss(0x6da15c)),
  weedFar: outFar(farMoss(0x4f7a5c)),
  sail: out(far(0xfbf6ee, { roughness: 0.8, side: DoubleSide })),
  sailRed: out(far(0xe2564a, { roughness: 0.8, side: DoubleSide })),
  /** La lanterne du ponton : elle s'allume le soir pour qu'on voie encore le ponton et la barque dans l'ombre du socle. */
  dockLamp: out(far(0xfff0cc, { roughness: 0.1, clearcoat: 1, emissive: 0xffc46a, emissiveIntensity: 0 })),
  dockPool: new MeshBasicMaterial({ map: glowTex, color: 0xffc77a, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
  dockGlow: new SpriteMaterial({ map: glowTex, color: 0xffcf86, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
  glow: new SpriteMaterial({ map: glowTex, color: 0xffe2a0, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
}
