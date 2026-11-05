import { TAU } from '../../math'
import { canvasTex, rr, seeded } from '../paint'
import { brookPts, groundUV } from './layout'

// Textures de la cabane perchée : planches blondes du plancher, écorce du chêne, bardeaux terracotta moussus, la toile rayée du
// hamac, le tapis tressé, le sol de la forêt en contrebas et son ruisseau, la page du carnet, les étiquettes.

/** Les planches du plancher, posées le long de x : bois blond et miel, nœuds, clous, un peu de mousse dans les joints. Tuile 1 × 1. */
export const deckTex = canvasTex(512, 512, (x) => {
  const r = seeded(21), rows = 5, h = 512 / rows
  for (let i = 0; i < rows; i++) {
    let px = -r() * 300
    while (px < 512) {
      const w = 300 + r() * 280, t = r()
      const R = 226 - t * 26, G = 190 - t * 28, B = 132 - t * 30
      const g = x.createLinearGradient(0, i * h, 0, i * h + h)
      g.addColorStop(0, `rgb(${R + 6},${G + 6},${B + 4})`); g.addColorStop(1, `rgb(${R - 10},${G - 12},${B - 12})`)
      x.fillStyle = g
      x.fillRect(px, i * h, w, h)
      x.strokeStyle = 'rgba(140,96,52,.16)'; x.lineWidth = 1.3
      for (let k = 0; k < 6; k++) {
        const y = i * h + 6 + r() * (h - 12)
        x.beginPath(); x.moveTo(px, y)
        for (let s = 0; s <= w; s += 32) x.lineTo(px + s, y + Math.sin(s * 0.025 + k * 1.3) * 2.5)
        x.stroke()
      }
      if (r() < 0.5) {
        const kx = px + 40 + r() * (w - 80), ky = i * h + h * (0.3 + r() * 0.4)
        x.fillStyle = 'rgba(120,78,40,.32)'; x.beginPath(); x.ellipse(kx, ky, 7, 4, 0, 0, TAU); x.fill()
        x.strokeStyle = 'rgba(120,78,40,.18)'; x.beginPath(); x.ellipse(kx, ky, 13, 7, 0, 0, TAU); x.stroke()
      }
      // les clous, deux à chaque bout de planche
      x.fillStyle = 'rgba(70,58,50,.55)'
      for (const ex of [px + 10, px + w - 10]) for (const ey of [i * h + 16, i * h + h - 16]) { x.beginPath(); x.arc(ex, ey, 2.6, 0, TAU); x.fill() }
      x.fillStyle = 'rgba(96,66,38,.45)'; x.fillRect(px, i * h, 3, h)
      px += w
    }
    x.fillStyle = 'rgba(90,62,36,.5)'; x.fillRect(0, i * h, 512, 3.5)
    // la mousse qui prend dans les joints
    for (let k = 0; k < 40; k++) { x.fillStyle = `rgba(110,140,70,${0.15 + r() * 0.25})`; x.beginPath(); x.ellipse(r() * 512, i * h + (r() - 0.5) * 5, 3 + r() * 6, 1.5 + r() * 2, 0, 0, TAU); x.fill() }
  }
  for (let k = 0; k < 700; k++) { x.fillStyle = `rgba(255,240,200,${0.05 + r() * 0.12})`; x.fillRect(r() * 512, r() * 512, 1.5, 1.5) }
}, [1, 1])

/**
 * L'écorce du chêne : des sillons profonds le long de la branche (le long de u), gris brun, des plaques claires, un peu de lichen
 * vert pâle. u le long de la branche, v autour (voir `limb` dans Oak.tsx, qui met les UV à l'échelle).
 */
export const barkTex = canvasTex(512, 256, (x) => {
  const r = seeded(5), W = 512, H = 256
  x.fillStyle = '#8c7766'; x.fillRect(0, 0, W, H)
  for (let i = 0; i < 160; i++) {
    const px = r() * W, py = r() * H, w = 18 + r() * 40, h = 6 + r() * 10
    x.fillStyle = `rgba(${170 + r() * 30},${150 + r() * 25},${130 + r() * 20},${0.25 + r() * 0.25})`
    rr(x, px, py, w, h, 3); x.fill()
  }
  for (let i = 0; i < 22; i++) {
    const cy = (i / 22) * H + r() * 6
    x.strokeStyle = `rgba(60,46,38,${0.4 + r() * 0.3})`; x.lineWidth = 3 + r() * 4
    x.beginPath(); x.moveTo(0, cy)
    for (let px = 0; px <= W; px += 32) x.lineTo(px, cy + Math.sin(px * 0.02 + i) * 5 + (r() - 0.5) * 4)
    x.stroke()
  }
  for (let i = 0; i < 70; i++) {
    x.fillStyle = `rgba(${150 + r() * 40},${180 + r() * 30},${120 + r() * 20},${0.25 + r() * 0.3})`
    x.beginPath(); x.ellipse(r() * W, r() * H, 3 + r() * 8, 2 + r() * 5, r() * 3, 0, TAU); x.fill()
  }
}, [1, 1])

/** Les bardeaux du toit, en rangs décalés : terracotta passé, chaque bardeau plus sombre au pied, de la mousse dans quelques rangs. */
export const shingleTex = canvasTex(512, 512, (x) => {
  const r = seeded(13), rows = 8, h = 512 / rows
  x.fillStyle = '#7a4a34'; x.fillRect(0, 0, 512, 512)
  for (let j = 0; j < rows; j++) {
    const y0 = j * h, off = (j % 2) * 26
    for (let px = -off; px < 512; ) {
      const w = 42 + r() * 22, t = r()
      const g = x.createLinearGradient(0, y0, 0, y0 + h)
      const R = 214 - t * 30, G = 122 - t * 24, B = 84 - t * 20
      g.addColorStop(0, `rgb(${R},${G},${B})`); g.addColorStop(0.8, `rgb(${R - 22},${G - 18},${B - 14})`); g.addColorStop(1, `rgb(${R - 60},${G - 46},${B - 34})`)
      x.fillStyle = g
      rr(x, px + 2, y0 + 1, w - 4, h - 2, 8); x.fill()
      x.strokeStyle = 'rgba(90,50,30,.18)'; x.lineWidth = 1
      for (let k = 0; k < 3; k++) { const lx = px + 8 + r() * (w - 16); x.beginPath(); x.moveTo(lx, y0 + 4); x.lineTo(lx + (r() - 0.5) * 3, y0 + h - 6); x.stroke() }
      if (r() < 0.18) {
        x.fillStyle = `rgba(120,150,70,${0.45 + r() * 0.3})`
        x.beginPath(); x.ellipse(px + w / 2, y0 + h - 8, w * 0.4, 6 + r() * 6, 0, 0, TAU); x.fill()
      }
      px += w
    }
  }
}, [1, 1])

/** Le dessous du toit et les planches des garde-corps : bois blond plus clair, lames le long de u. */
export const boardTex = canvasTex(256, 256, (x) => {
  const r = seeded(31), n = 4, h = 256 / n
  for (let i = 0; i < n; i++) {
    const t = r(), R = 222 - t * 22, G = 188 - t * 22, B = 136 - t * 24
    x.fillStyle = `rgb(${R},${G},${B})`; x.fillRect(0, i * h, 256, h)
    x.strokeStyle = 'rgba(140,96,52,.14)'; x.lineWidth = 1.2
    for (let k = 0; k < 5; k++) { const y = i * h + 5 + r() * (h - 10); x.beginPath(); x.moveTo(0, y); for (let s = 0; s <= 256; s += 32) x.lineTo(s, y + Math.sin(s * 0.03 + k) * 2); x.stroke() }
    x.fillStyle = 'rgba(96,66,38,.4)'; x.fillRect(0, i * h, 256, 2.5)
  }
}, [1, 1])

/** La toile du hamac : coton écru rayé de terracotta, de moutarde et de vert mousse, en long. u le long, v en travers. */
export const hammockTex = canvasTex(256, 256, (x) => {
  const r = seeded(8)
  x.fillStyle = '#f4e9d2'; x.fillRect(0, 0, 256, 256)
  const bands: [number, number, string][] = [[0.08, 0.05, '#c9643f'], [0.16, 0.025, '#e2a93e'], [0.3, 0.06, '#6f8f4a'], [0.46, 0.03, '#c9643f'], [0.54, 0.03, '#c9643f'], [0.64, 0.06, '#6f8f4a'], [0.78, 0.025, '#e2a93e'], [0.86, 0.05, '#c9643f']]
  for (const [v, w, c] of bands) { x.fillStyle = c; x.fillRect(0, v * 256, 256, w * 256) }
  // le grain de la toile : une trame fine
  for (let i = 0; i < 256; i += 3) { x.fillStyle = 'rgba(120,90,60,.05)'; x.fillRect(i, 0, 1, 256); x.fillRect(0, i, 256, 1) }
  for (let k = 0; k < 400; k++) { x.fillStyle = `rgba(255,255,255,${r() * 0.12})`; x.fillRect(r() * 256, r() * 256, 2, 1) }
}, [3, 1])

/** Le tapis tressé rond : des anneaux de jute, de vert mousse et de terracotta, sur un plan rond (UV d'un cercle). */
export const rugTex = canvasTex(512, 512, (x) => {
  const r = seeded(17), C = 256
  x.fillStyle = '#d9b77e'; x.fillRect(0, 0, 512, 512)
  const ring = ['#d9b77e', '#7f9a55', '#d9b77e', '#c46c48', '#e2c48c', '#6f8f4a', '#d9b77e', '#e3a64a', '#d9b77e', '#c46c48']
  for (let i = ring.length - 1; i >= 0; i--) {
    const rad = ((i + 1) / ring.length) * 256
    x.fillStyle = ring[i]; x.beginPath(); x.arc(C, C, rad, 0, TAU); x.fill()
    // la tresse : des petits chevrons tout le long de l'anneau
    x.strokeStyle = 'rgba(80,50,30,.18)'; x.lineWidth = 2
    const n = Math.round(rad * 0.5)
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU, ri = rad - 22
      x.beginPath(); x.moveTo(C + Math.cos(a) * ri, C + Math.sin(a) * ri); x.lineTo(C + Math.cos(a + 0.04) * (rad - 4), C + Math.sin(a + 0.04) * (rad - 4)); x.stroke()
    }
  }
  for (let k = 0; k < 800; k++) { x.fillStyle = `rgba(255,250,230,${r() * 0.15})`; x.fillRect(r() * 512, r() * 512, 1.5, 1.5) }
})

/**
 * Le sol de la forêt en contrebas, vu de haut : sous-bois vert profond, taches de fougères et de lumière, et la berge du ruisseau
 * (un creux sombre bordé de galets clairs ; l'eau elle-même est un ruban à part, qui scintille). Couvre le plan `GROUND` ; le bord
 * s'efface dans le ciel (alphaMap).
 */
export const forestFloorTex = canvasTex(1024, 1024, (x) => {
  const r = seeded(44), W = 1024
  x.fillStyle = '#4a6636'; x.fillRect(0, 0, W, W)
  for (let i = 0; i < 1400; i++) {
    const cx = r() * W, cy = r() * W, rad = 8 + r() * 30
    const c = r() < 0.5 ? `rgba(${86 + r() * 30},${118 + r() * 30},${58 + r() * 20},.5)` : `rgba(${50 + r() * 20},${74 + r() * 20},${42 + r() * 12},.5)`
    x.fillStyle = c; x.beginPath(); x.ellipse(cx, cy, rad, rad * 0.7, r() * 3, 0, TAU); x.fill()
  }
  for (let i = 0; i < 80; i++) {
    const cx = r() * W, cy = r() * W, rad = 14 + r() * 30
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad)
    g.addColorStop(0, 'rgba(240,220,140,.35)'); g.addColorStop(1, 'rgba(240,220,140,0)')
    x.fillStyle = g; x.fillRect(cx - rad, cy - rad, rad * 2, rad * 2)
  }
  x.lineCap = 'round'; x.lineJoin = 'round'
  const pts = brookPts(60).map(([wx, wz]) => groundUV(wx, wz).map((v) => v * W))
  const path = (w: number, col: string) => {
    x.strokeStyle = col; x.lineWidth = w
    x.beginPath(); pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); x.stroke()
  }
  path(64, 'rgba(40,54,32,.9)')
  path(46, 'rgba(160,148,116,.9)')
  for (let i = 0; i < 300; i++) {
    const [px, py] = pts[(r() * pts.length) | 0], a = r() * TAU, d = 18 + r() * 12
    x.fillStyle = `rgba(${190 + r() * 40},${182 + r() * 40},${160 + r() * 30},.85)`
    x.beginPath(); x.ellipse(px + Math.cos(a) * d, py + Math.sin(a) * d, 3 + r() * 5, 2 + r() * 3, a, 0, TAU); x.fill()
  }
})

/** Le bord du sol de la forêt, qui s'efface dans le ciel : opaque au centre, transparent sur le pourtour. */
export const groundFade = canvasTex(256, 256, (x) => {
  const g = x.createRadialGradient(128, 128, 60, 128, 128, 128)
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#ffffff'); g.addColorStop(1, '#000000')
  x.fillStyle = g; x.fillRect(0, 0, 256, 256)
})

/** L'eau du ruisseau : bleu vert, des reflets clairs étirés le long du courant (la texture défile le long du ruban). */
export const waterTex = canvasTex(128, 256, (x) => {
  const r = seeded(3)
  const g = x.createLinearGradient(0, 0, 128, 0)
  g.addColorStop(0, '#5f9a8c'); g.addColorStop(0.5, '#8fcac0'); g.addColorStop(1, '#5f9a8c')
  x.fillStyle = g; x.fillRect(0, 0, 128, 256)
  for (let i = 0; i < 46; i++) {
    x.fillStyle = `rgba(235,255,245,${0.35 + r() * 0.5})`
    x.beginPath(); x.ellipse(20 + r() * 88, r() * 256, 2 + r() * 5, 8 + r() * 14, 0, 0, TAU); x.fill()
  }
}, [1, 6])

/** La page du carnet de naturaliste : une feuille de chêne dessinée, aquarellée, une plume, des notes au crayon, une date. */
export const notebookTex = canvasTex(512, 256, (x) => {
  x.fillStyle = '#fbf3df'; x.fillRect(0, 0, 512, 256)
  x.fillStyle = 'rgba(160,120,70,.25)'; x.fillRect(254, 0, 4, 256)
  // page de gauche : la feuille de chêne, ses lobes, sa nervure, un lavis vert
  x.save(); x.translate(130, 128); x.rotate(-0.4)
  x.fillStyle = 'rgba(120,160,80,.55)'; x.strokeStyle = '#4c5a34'; x.lineWidth = 2.5
  x.beginPath()
  for (let i = 0; i <= 60; i++) {
    const t = i / 60, a = t * TAU, lobes = 1 + 0.22 * Math.cos(t * TAU * 6)
    x.lineTo(Math.cos(a) * 40 * lobes, Math.sin(a) * 88 * (0.9 + 0.1 * Math.cos(a)))
  }
  x.closePath(); x.fill(); x.stroke()
  x.beginPath(); x.moveTo(0, 100); x.lineTo(0, -86); x.stroke()
  for (let k = -3; k <= 3; k++) { x.beginPath(); x.moveTo(0, k * 24); x.lineTo(30, k * 24 - 16); x.moveTo(0, k * 24); x.lineTo(-30, k * 24 - 16); x.stroke() }
  x.restore()
  // un gland, dans le coin
  x.fillStyle = '#c99a52'; x.beginPath(); x.ellipse(214, 208, 12, 16, 0, 0, TAU); x.fill()
  x.fillStyle = '#7a5a3a'; x.beginPath(); x.ellipse(214, 194, 15, 8, 0, 0, TAU); x.fill()
  // page de droite : une plume de geai, et des lignes d'écriture
  x.save(); x.translate(330, 90); x.rotate(0.5)
  for (let i = 0; i < 9; i++) { x.fillStyle = i % 2 ? '#3d6fb0' : '#9cc6ea'; x.fillRect(-14, -40 + i * 8, 28, 6) }
  x.fillStyle = '#2a2a2a'; x.fillRect(-14, 32, 28, 4)
  x.restore()
  x.strokeStyle = 'rgba(70,60,50,.55)'; x.lineWidth = 2
  for (let i = 0; i < 7; i++) {
    const y = 150 + i * 14, len = 120 + ((i * 37) % 60)
    x.beginPath(); x.moveTo(290, y)
    for (let s = 0; s < len; s += 6) x.lineTo(290 + s, y + Math.sin(s * 0.6 + i) * 1.8)
    x.stroke()
  }
  x.fillStyle = 'rgba(70,60,50,.7)'; x.font = 'italic 18px Georgia, serif'; x.fillText('Quercus robur', 380, 64)
})

/** L'étiquette d'un bocal de plantes séchées (« tilleul », « menthe »…) : papier kraft, lettres à la main. */
export function labelTex(text: string, bg = '#e8d2a4') {
  return canvasTex(128, 64, (x) => {
    x.fillStyle = bg; rr(x, 2, 2, 124, 60, 10); x.fill()
    x.strokeStyle = 'rgba(110,70,40,.6)'; x.lineWidth = 2; rr(x, 7, 7, 114, 50, 7); x.stroke()
    x.fillStyle = '#5a3a22'; x.font = 'italic 24px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'
    x.fillText(text, 64, 33)
  })
}

/** La peau d'une bête : le dessus d'un tambour de banjo, blanc cassé, un peu taché au centre par les doigts. */
export const banjoHeadTex = canvasTex(128, 128, (x) => {
  const g = x.createRadialGradient(64, 64, 4, 64, 64, 64)
  g.addColorStop(0, '#ece2cc'); g.addColorStop(0.6, '#f6efdf'); g.addColorStop(1, '#e6dac0')
  x.fillStyle = g; x.fillRect(0, 0, 128, 128)
  x.fillStyle = 'rgba(150,120,80,.18)'; x.beginPath(); x.ellipse(78, 70, 18, 12, 0.4, 0, TAU); x.fill()
})

/** Les autocollants de voyage de la malle : un rond « Forêt de Brocéliande », un ovale vert. */
export const stickerTex = canvasTex(256, 128, (x) => {
  x.fillStyle = '#e3a64a'; x.beginPath(); x.arc(64, 64, 56, 0, TAU); x.fill()
  x.strokeStyle = '#7a4a2a'; x.lineWidth = 4; x.beginPath(); x.arc(64, 64, 48, 0, TAU); x.stroke()
  x.fillStyle = '#4f6e3a'
  x.beginPath(); x.moveTo(64, 26); x.lineTo(88, 86); x.lineTo(40, 86); x.closePath(); x.fill()
  x.fillRect(60, 84, 8, 14)
  x.fillStyle = '#6f8f4a'; x.beginPath(); x.ellipse(186, 64, 62, 40, 0, 0, TAU); x.fill()
  x.fillStyle = '#fbf3df'; x.font = 'bold 22px Georgia, serif'; x.textAlign = 'center'; x.fillText('FORÊT', 186, 60); x.font = '16px Georgia, serif'; x.fillText('1987', 186, 84)
})
