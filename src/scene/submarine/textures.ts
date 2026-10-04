import { TAU } from '../../math'
import { canvasTex, poly, seeded } from '../paint'

// Textures du sous-marin, dessinées une fois : tôle patinée et rivetée, plancher, tapis, écran de sonar, cadrans, et ce qu'on
// voit par le hublot (méduses, poissons, baleine, varech, rayons de lumière).

function rivet(x: CanvasRenderingContext2D, cx: number, cy: number, r = 3.2) {
  x.fillStyle = 'rgba(20,50,45,.55)'; x.beginPath(); x.arc(cx + 0.8, cy + 1, r, 0, TAU); x.fill()
  x.fillStyle = '#c99a5a'; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill()
  x.fillStyle = 'rgba(255,240,200,.65)'; x.beginPath(); x.arc(cx - r * 0.3, cy - r * 0.3, r * 0.4, 0, TAU); x.fill()
}

/** Tôle de cuivre patiné en vert-de-gris : quatre plaques par unité, rivets de laiton sur les bords, coulures et rouille. Tuile 1 × 1. */
export const platesTex = canvasTex(256, 256, (x) => {
  const r = seeded(9)
  x.fillStyle = '#5f9d8e'; x.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const px = i * 128, py = j * 128, t = r() * 14
    x.fillStyle = `rgb(${(88 + t) | 0},${(154 + t) | 0},${(138 + t) | 0})`
    x.fillRect(px + 3, py + 3, 122, 122)
    for (let k = 0; k < 7; k++) { x.fillStyle = `rgba(190,230,214,${0.08 + r() * 0.12})`; x.fillRect(px + 8 + r() * 108, py + 4, 2 + r() * 5, 30 + r() * 90) }
    for (let k = 0; k < 40; k++) { x.fillStyle = `rgba(140,80,40,${r() * 0.1})`; x.fillRect(px + 4 + r() * 118, py + 70 + r() * 54, 2, 2) }
    x.strokeStyle = 'rgba(14,52,46,.6)'; x.lineWidth = 3; x.strokeRect(px + 1.5, py + 1.5, 125, 125)
    for (const [dx, dy] of [[12, 12], [64, 8], [116, 12], [12, 116], [64, 120], [116, 116], [8, 64], [120, 64]]) rivet(x, px + dx, py + dy)
  }
}, [1, 1])

/** Plancher en tôle larmée sombre, avec ses plaques vissées. Tuile 1 × 1. */
export const deckTex = canvasTex(256, 256, (x) => {
  const r = seeded(13)
  x.fillStyle = '#3c5a62'; x.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) {
    const px = i * 16 + 8, py = j * 16 + 8 + (i % 2 ? 8 : 0)
    x.fillStyle = 'rgba(120,170,180,.34)'
    poly(x, [[px, py - 5], [px + 4, py], [px, py + 5], [px - 4, py]], 'rgba(120,170,180,.34)')
    x.fillStyle = 'rgba(10,30,36,.28)'; x.fillRect(px - 0.5, py + 1, 2, 3)
  }
  x.strokeStyle = 'rgba(8,24,30,.75)'; x.lineWidth = 3
  x.strokeRect(1.5, 1.5, 253, 253); x.beginPath(); x.moveTo(128, 0); x.lineTo(128, 256); x.moveTo(0, 128); x.lineTo(256, 128); x.stroke()
  for (const [px, py] of [[10, 10], [118, 10], [246, 10], [10, 118], [118, 118], [246, 118], [10, 246], [118, 246], [246, 246], [138, 10], [138, 138], [10, 138], [138, 246], [246, 138]]) rivet(x, px, py, 3)
  for (let k = 0; k < 200; k++) { x.fillStyle = `rgba(210,230,230,${r() * 0.1})`; x.fillRect(r() * 256, r() * 256, 2, 1) }
}, [1, 1])

/** Tapis rond : un champ vert-bleu à médaillon crème, une bordure lie-de-vin et un filet d'or. Sur un disque. */
export const rugTex = canvasTex(512, 512, (x) => {
  x.fillStyle = '#2a0f16'; x.fillRect(0, 0, 512, 512)
  const rings: [number, string][] = [[250, '#8a2f3a'], [232, '#d6b062'], [226, '#8a2f3a'], [200, '#e5d6ae'], [194, '#1f5a62']]
  for (const [rad, col] of rings) { x.fillStyle = col; x.beginPath(); x.arc(256, 256, rad, 0, TAU); x.fill() }
  // une frise de losanges entre deux filets
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * TAU
    poly(x, [[256 + Math.cos(a) * 214 - 7, 256 + Math.sin(a) * 214], [256 + Math.cos(a) * 214, 256 + Math.sin(a) * 214 - 7], [256 + Math.cos(a) * 214 + 7, 256 + Math.sin(a) * 214], [256 + Math.cos(a) * 214, 256 + Math.sin(a) * 214 + 7]], '#d6b062')
  }
  // le médaillon : une étoile à huit pointes
  x.fillStyle = '#e5d6ae'; x.beginPath()
  for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU - Math.PI / 2, rad = i % 2 ? 62 : 132; x.lineTo(256 + Math.cos(a) * rad, 256 + Math.sin(a) * rad) }
  x.closePath(); x.fill()
  x.fillStyle = '#8a2f3a'; x.beginPath(); x.arc(256, 256, 54, 0, TAU); x.fill()
  x.fillStyle = '#d6b062'; x.beginPath(); x.arc(256, 256, 26, 0, TAU); x.fill()
  x.fillStyle = '#1f5a62'; x.beginPath(); x.arc(256, 256, 12, 0, TAU); x.fill()
  const r = seeded(4)
  for (let k = 0; k < 600; k++) { x.fillStyle = `rgba(0,0,0,${r() * 0.1})`; x.fillRect(r() * 512, r() * 512, 2, 2) }
})

/** L'écran rond du sonar : un fond vert sombre, des cercles de portée, un réticule et ses graduations. */
export const sonarTex = canvasTex(256, 256, (x) => {
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, '#0d3a28'); g.addColorStop(1, '#03160f')
  x.fillStyle = g; x.beginPath(); x.arc(128, 128, 128, 0, TAU); x.fill()
  x.strokeStyle = 'rgba(110,255,170,.5)'; x.lineWidth = 1.4
  for (const rad of [30, 60, 90, 120]) { x.beginPath(); x.arc(128, 128, rad, 0, TAU); x.stroke() }
  x.beginPath(); x.moveTo(128, 6); x.lineTo(128, 250); x.moveTo(6, 128); x.lineTo(250, 128); x.stroke()
  x.lineWidth = 1
  for (let i = 0; i < 72; i++) { const a = (i / 72) * TAU, big = i % 6 === 0; x.beginPath(); x.moveTo(128 + Math.cos(a) * (big ? 112 : 119), 128 + Math.sin(a) * (big ? 112 : 119)); x.lineTo(128 + Math.cos(a) * 126, 128 + Math.sin(a) * 126); x.stroke() }
  x.fillStyle = 'rgba(110,255,170,.7)'; x.font = 'bold 9px monospace'; x.textAlign = 'center'
  x.fillText('N', 128, 20); x.fillText('S', 128, 242); x.fillText('E', 240, 131); x.fillText('O', 16, 131)
})

/** Le balayage du sonar : un secteur qui s'éteint derrière un trait vif (on le fait tourner). */
export const sweepTex = canvasTex(256, 256, (x) => {
  for (let i = 0; i < 48; i++) {
    const a1 = -Math.PI / 2 - (i / 48) * 1.3, a0 = -Math.PI / 2 - ((i + 1) / 48) * 1.3
    x.fillStyle = `rgba(130,255,190,${Math.pow(1 - i / 48, 2.2) * 0.75})`
    x.beginPath(); x.moveTo(128, 128); x.arc(128, 128, 126, a0, a1); x.closePath(); x.fill()
  }
  x.strokeStyle = 'rgba(210,255,230,.95)'; x.lineWidth = 2; x.beginPath(); x.moveTo(128, 128); x.lineTo(128, 2); x.stroke()
})

/** Cadran d'un manomètre de laiton : graduations de 0 à 10 sur trois quarts de tour, zone rouge, « PRESSION ». */
export const gaugeTex = canvasTex(256, 256, (x) => {
  x.fillStyle = '#f4efdf'; x.beginPath(); x.arc(128, 128, 124, 0, TAU); x.fill()
  x.strokeStyle = '#d8404a'; x.lineWidth = 12; x.beginPath(); x.arc(128, 128, 96, Math.PI * 0.75 + 1.5 * Math.PI * 0.78, Math.PI * 0.75 + 1.5 * Math.PI); x.stroke()
  x.strokeStyle = '#2a2530'; x.lineWidth = 2
  for (let i = 0; i <= 50; i++) {
    const a = Math.PI * 0.75 + (i / 50) * Math.PI * 1.5, big = i % 5 === 0
    x.beginPath(); x.moveTo(128 + Math.cos(a) * (big ? 80 : 88), 128 + Math.sin(a) * (big ? 80 : 88)); x.lineTo(128 + Math.cos(a) * 104, 128 + Math.sin(a) * 104); x.stroke()
  }
  x.fillStyle = '#2a2530'; x.font = 'bold 18px Georgia, serif'; x.textAlign = 'center'
  for (let i = 0; i <= 10; i++) { const a = Math.PI * 0.75 + (i / 10) * Math.PI * 1.5; x.fillText(String(i), 128 + Math.cos(a) * 62, 134 + Math.sin(a) * 62) }
  x.font = 'bold 13px Georgia, serif'; x.fillText('PRESSION', 128, 186); x.font = '11px Georgia, serif'; x.fillText('bars', 128, 202)
})

/** Cadran d'un télégraphe de machines : STOP en haut, AVANT à droite, ARRIÈRE à gauche, chacun en trois vitesses. */
export const telegraphTex = canvasTex(256, 256, (x) => {
  x.fillStyle = '#f4efdf'; x.beginPath(); x.arc(128, 128, 124, 0, TAU); x.fill()
  x.fillStyle = '#16202a'; x.beginPath(); x.arc(128, 128, 96, 0, TAU); x.fill()
  x.strokeStyle = '#d6b062'; x.lineWidth = 2; x.beginPath(); x.arc(128, 128, 96, 0, TAU); x.stroke()
  x.fillStyle = '#f4efdf'; x.textAlign = 'center'; x.font = 'bold 15px Georgia, serif'
  x.fillText('STOP', 128, 50)
  const ahead = ['DOUCE', 'DEMI', 'TOUTE'], astern = ['DOUCE', 'DEMI', 'TOUTE']
  x.font = 'bold 11px Georgia, serif'
  ahead.forEach((w, i) => { const a = -Math.PI / 2 + (i + 1) * 0.5; x.save(); x.translate(128 + Math.cos(a) * 66, 128 + Math.sin(a) * 66); x.rotate(a + Math.PI / 2); x.fillText(w, 0, 4); x.restore() })
  astern.forEach((w, i) => { const a = -Math.PI / 2 - (i + 1) * 0.5; x.save(); x.translate(128 + Math.cos(a) * 66, 128 + Math.sin(a) * 66); x.rotate(a + Math.PI / 2); x.fillText(w, 0, 4); x.restore() })
  x.fillStyle = '#d8404a'; x.font = 'bold 10px Georgia, serif'; x.fillText('AVANT', 202, 140); x.fillText('ARRIÈRE', 54, 140)
  x.strokeStyle = '#f4efdf'; x.lineWidth = 1.4
  for (let i = -3; i <= 3; i++) { const a = -Math.PI / 2 + i * 0.5; x.beginPath(); x.moveTo(128 + Math.cos(a) * 84, 128 + Math.sin(a) * 84); x.lineTo(128 + Math.cos(a) * 94, 128 + Math.sin(a) * 94); x.stroke() }
})

/** Une méduse : une ombrelle lumineuse aux bords frangés et des tentacules qui flottent. Blanche : on la teinte. */
export const jellyTex = canvasTex(128, 160, (x) => {
  const g = x.createRadialGradient(64, 38, 4, 64, 44, 44)
  g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.6, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g
  x.beginPath(); x.moveTo(18, 46); x.bezierCurveTo(18, 2, 110, 2, 110, 46); x.bezierCurveTo(98, 54, 84, 48, 74, 54); x.bezierCurveTo(64, 48, 54, 54, 44, 54); x.bezierCurveTo(34, 48, 28, 54, 18, 46); x.closePath(); x.fill()
  x.strokeStyle = 'rgba(255,255,255,.5)'; x.lineWidth = 1.2
  for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(64, 8); x.quadraticCurveTo(64 + (i - 1.5) * 24, 28, 64 + (i - 1.5) * 34, 46); x.stroke() }
  x.lineCap = 'round'
  for (let i = 0; i < 7; i++) {
    const px = 28 + i * 12, len = 70 + (i % 3) * 22
    x.strokeStyle = `rgba(255,255,255,${0.55 - (i % 3) * 0.12})`; x.lineWidth = 2.2 - (i % 2) * 0.8
    x.beginPath(); x.moveTo(px, 52)
    for (let s = 1; s <= 7; s++) x.lineTo(px + Math.sin(s * 1.1 + i) * 5, 52 + (s / 7) * len)
    x.stroke()
  }
})

/** Un banc de petits poissons, en blanc : une bande qui défile. */
export const fishTex = canvasTex(512, 96, (x) => {
  const r = seeded(51)
  x.fillStyle = '#fff'
  for (let i = 0; i < 16; i++) {
    const px = 10 + i * 31 + r() * 14, py = 14 + r() * 66, s = 0.8 + r() * 0.8
    x.beginPath(); x.ellipse(px, py, 11 * s, 4.4 * s, 0, 0, TAU); x.fill()
    poly(x, [[px - 9 * s, py], [px - 18 * s, py - 6 * s], [px - 18 * s, py + 6 * s]], '#fff')
  }
}, [1, 1])

/** Une baleine à bosse vue de profil, nageant vers la gauche : dos sombre, ventre rayé, longue nageoire. En blanc : on la teinte. */
export const whaleTex = canvasTex(512, 200, (x) => {
  x.fillStyle = '#fff'
  x.beginPath(); x.moveTo(500, 96); x.bezierCurveTo(490, 60, 420, 40, 340, 50); x.bezierCurveTo(260, 56, 200, 70, 150, 92); x.bezierCurveTo(110, 108, 70, 120, 40, 108)
  x.bezierCurveTo(20, 100, 12, 78, 4, 52); x.bezierCurveTo(26, 62, 40, 70, 60, 74); x.bezierCurveTo(54, 56, 48, 36, 50, 20); x.bezierCurveTo(70, 40, 86, 60, 110, 76)
  x.bezierCurveTo(200, 120, 300, 150, 380, 148); x.bezierCurveTo(450, 146, 496, 126, 500, 96); x.closePath(); x.fill()
  // la longue nageoire
  x.beginPath(); x.moveTo(330, 130); x.bezierCurveTo(300, 160, 270, 184, 236, 192); x.bezierCurveTo(262, 168, 290, 144, 318, 126); x.closePath(); x.fill()
  // les sillons de la gorge, plus sombres
  x.strokeStyle = 'rgba(0,0,0,.28)'; x.lineWidth = 1.6
  for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(330 + i * 16, 132 + i); x.quadraticCurveTo(360 + i * 14, 120 + i * 2, 420 + i * 8, 124); x.stroke() }
  x.fillStyle = 'rgba(0,0,0,.55)'; x.beginPath(); x.arc(452, 98, 3.6, 0, TAU); x.fill()
})

/** Le fond marin : varech, coraux branchus et algues, en blanc (on les teinte), le long d'une bande qui défile très lentement. */
export const reefTex = canvasTex(512, 256, (x) => {
  const r = seeded(77)
  x.fillStyle = '#fff'
  x.lineCap = 'round'
  for (let i = 0; i < 14; i++) {
    const px = 12 + i * 36 + r() * 16, h = 90 + r() * 150
    x.strokeStyle = '#fff'; x.lineWidth = 5 + r() * 5
    x.beginPath(); x.moveTo(px, 256)
    for (let s = 1; s <= 10; s++) x.lineTo(px + Math.sin(s * 0.8 + i) * 16, 256 - (s / 10) * h)
    x.stroke()
  }
  for (let i = 0; i < 9; i++) {
    const px = 20 + i * 56 + r() * 20, bh = 40 + r() * 56
    x.lineWidth = 7; x.strokeStyle = '#fff'
    for (const dir of [-1, 0, 1]) { x.beginPath(); x.moveTo(px, 256); x.lineTo(px + dir * 24, 256 - bh); x.stroke(); x.beginPath(); x.arc(px + dir * 24, 256 - bh, 6, 0, TAU); x.fill() }
  }
  x.fillRect(0, 246, 512, 10)
}, [1, 1])

/** Des rayons de lumière qui tombent de la surface en biais : de longues bandes qui s'éteignent vers le bas. */
export const raysTex = canvasTex(256, 256, (x) => {
  for (let i = 0; i < 6; i++) {
    const px = -20 + i * 54, w = 14 + (i % 3) * 14
    const g = x.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g
    poly(x, [[px, 0], [px + w, 0], [px + w + 70, 256], [px + 30, 256]], g)
  }
})
