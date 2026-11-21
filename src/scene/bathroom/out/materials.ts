import { seeded } from '../../../math'
import { far } from '../../materials'
import { farFoliage } from '../../nature/materials'
import { canvasTex } from '../../paint'
import { skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'

// Les matériaux du dehors de la salle de bain : le cottage et son jardin sous la pluie. Peu de matériaux, partagés : chaque matériau
// est un tracé, et le dehors vit dans <Static> (une série instanciée par matériau de feuillage ou de fleur).

/** Le fondu dans le ciel : large (le cottage est à 8 à 15 de la pièce, la colline et le village à 15 à 20 : voilés, jamais effacés). */
export const F = { c: [0, 0] as [number, number], r0: 10.5, r1: 21 }
/** Le village : plus loin et plus pâle encore (fondu large, comme les falaises du phare). */
const FV = { c: [0, 0] as [number, number], r0: 9.5, r1: 19.5 }

/** La pierre du cottage : des moellons crème et miel, de tailles inégales, joints clairs. Neutre : la couleur du matériau la teinte. */
const stoneWall = canvasTex(256, 256, (x) => {
  const r = seeded(17)
  x.fillStyle = '#e9ddc6'; x.fillRect(0, 0, 256, 256)
  let y = 0
  while (y < 256) {
    const h = Math.min(256 - y, 26 + Math.floor(r() * 14)), row = h
    let px = -r() * 40
    while (px < 256) {
      const w = 34 + r() * 46, l = 84 + r() * 9, hue = 36 + r() * 8, sat = 32 + r() * 22
      x.fillStyle = `hsl(${hue},${sat}%,${l}%)`
      x.beginPath(); x.roundRect(px + 1.5, y + 1.5, w - 3, row - 3, 6); x.fill()
      // l'ombre sous chaque moellon, et un reflet au-dessus
      x.fillStyle = 'rgba(110,86,60,.12)'; x.fillRect(px + 3, y + row - 5, w - 6, 3)
      x.fillStyle = 'rgba(255,250,236,.3)'; x.fillRect(px + 4, y + 3, w - 8, 2)
      px += w
    }
    y += row
  }
  // la patine de pluie : des coulures sombres
  for (let k = 0; k < 14; k++) {
    const g = x.createLinearGradient(0, 0, 0, 256), cx = r() * 256
    g.addColorStop(0, 'rgba(90,80,70,0)'); g.addColorStop(0.5, 'rgba(90,80,70,.07)'); g.addColorStop(1, 'rgba(90,80,70,.02)')
    x.fillStyle = g; x.fillRect(cx, 0, 2 + r() * 5, 256)
  }
}, [1, 1])

/** L'ardoise écaille : des rangs d'ardoises arrondies, gris mauve, mouillées. */
const slate = canvasTex(128, 128, (x) => {
  const r = seeded(23)
  x.fillStyle = '#7d7b8e'; x.fillRect(0, 0, 128, 128)
  const rows = 8, h = 128 / rows, w = 16
  for (let j = rows - 1; j >= 0; j--) {
    for (let i = -1; i < 9; i++) {
      const cx = i * w + (j % 2 ? w / 2 : 0), l = 40 + r() * 12
      x.fillStyle = `hsl(${248 + r() * 14},${7 + r() * 6}%,${l + 8}%)`
      x.beginPath(); x.moveTo(cx - w / 2, j * h); x.lineTo(cx + w / 2, j * h); x.lineTo(cx + w / 2, j * h + h * 0.62); x.quadraticCurveTo(cx + w / 2, j * h + h * 1.15, cx, j * h + h * 1.15); x.quadraticCurveTo(cx - w / 2, j * h + h * 1.15, cx - w / 2, j * h + h * 0.62); x.closePath(); x.fill()
      x.strokeStyle = 'rgba(30,28,50,.35)'; x.lineWidth = 1; x.stroke()
      x.fillStyle = 'rgba(255,255,255,.1)'; x.fillRect(cx - w / 2 + 2, j * h + 2, w - 4, 2)
    }
  }
}, [1, 1])

/** Les dalles du chemin : grain de pierre et mousse, très peu contrasté. */
const flagTex = canvasTex(128, 128, (x) => {
  const r = seeded(29)
  x.fillStyle = '#d8d2c4'; x.fillRect(0, 0, 128, 128)
  for (let k = 0; k < 260; k++) { x.fillStyle = `rgba(${r() < 0.5 ? '90,84,74' : '255,252,240'},${0.04 + r() * 0.07})`; x.fillRect(r() * 128, r() * 128, 2 + r() * 8, 2 + r() * 5) }
  for (let k = 0; k < 8; k++) { x.fillStyle = 'rgba(110,140,90,.1)'; x.beginPath(); x.arc(r() * 128, r() * 128, 6 + r() * 12, 0, 6.3); x.fill() }
}, [1, 1])

export const O = {
  grass: skyFade(snowTop(far(0xffffff, { vertexColors: true, roughness: 0.95 }), 1, 0.4, 0.8), F),
  wall: skyFade(far(0xffffff, { map: stoneWall, roughness: 0.86 }), F),
  roof: skyFade(snowTop(far(0xffffff, { map: slate, roughness: 0.5 }), 1, 0.3, 0.7), F),
  trim: skyFade(far(0xf6f0e6, { roughness: 0.55 }), F),
  mint: skyFade(far(0x8fd0b8, { roughness: 0.55 }), F),
  wood: skyFade(snowTop(far(0xb88c64, { roughness: 0.8 }), 0.8, 0.4, 0.8), F),
  trunk: skyFade(far(0x6e5646, { roughness: 0.9 }), F),
  stone: skyFade(snowTop(far(0xffffff, { map: flagTex, roughness: 0.8 }), 0.9, 0.4, 0.8), F),
  glass: skyFade(far(0x8fa4bb, { roughness: 0.2, emissive: 0xffbe70, emissiveIntensity: 0 }), F),
  water: skyFade(far(0x6f9aa4, { roughness: 0.12 }), F),
  pad: skyFade(far(0x58975c, { roughness: 0.5 }), F),
  zinc: skyFade(far(0xa9b9c4, { roughness: 0.4 }), F),
  clay: skyFade(far(0xdc9a7c, { roughness: 0.7 }), F),
  soil: skyFade(far(0x5a4639, { roughness: 0.95 }), F),
  iron: skyFade(far(0x4d4b58, { roughness: 0.5 }), F),
  lantern: skyFade(far(0xfff0c8, { roughness: 0.4, emissive: 0xffc870, emissiveIntensity: 0.1 }), F),
  /** Le village de loin : des murs pâles et des toits sans détail (les teintes viennent de chaque copie). */
  vwall: skyFade(far(0xffffff, { roughness: 0.9 }), FV),
  vroof: skyFade(snowTop(far(0xffffff, { roughness: 0.8 }), 1, 0.3, 0.7), FV),
  /** Feuilles et fleurs en séries instanciées : blanc, la teinte vient de chaque copie. */
  leaf: skyFade(snowTop(farFoliage(0xffffff, { roughness: 0.8 }), 0.9, 0.5, 0.85), F),
  bloom: skyFade(farFoliage(0xffffff, { roughness: 0.7 }), F),
}
