import { TAU } from '../../math'
import { canvasTex, rr, seeded } from '../paint'
import { makeCanvas } from '../textures'
import { CanvasTexture } from 'three'

// Les textures de la cabine, dessinées une fois : le flanc et ses panneaux, la moquette, l'étoffe des sièges (des constellations
// tissées), les panneaux des coffres, les écriteaux qui s'allument, la carte du vol, le plateau du repas, le masque de sommeil.

/** Le flanc de la cabine : un panneau de 2,4 de large (un par hublot), de y = 0 à 4,35. Soubassement bleu nuit, panneaux ivoire, bandeau de lumière indirecte. */
export const wallTex = canvasTex(512, 1024, (x) => {
  const r = seeded(3), W = 512, H = 1024, yy = (y: number) => H - (y / 4.35) * H
  x.fillStyle = '#e4dfd4'; x.fillRect(0, 0, W, H)
  // le soubassement, jusqu'à 0,62 : un tissu bleu nuit à fines côtes, sous une baguette d'aluminium
  x.fillStyle = '#2d3a63'; x.fillRect(0, yy(0.62), W, H)
  for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(255,255,255,${0.03 + r() * 0.03})`; x.fillRect(i * 5.7, yy(0.62), 1.4, H) }
  x.fillStyle = '#c8cdd6'; x.fillRect(0, yy(0.66), W, 7)
  x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(0, yy(0.66), W, 2)
  // les panneaux : un joint vertical aux bords de la tuile, un joint à mi-hauteur, des rivets de plastique
  x.fillStyle = 'rgba(80,72,60,.25)'
  x.fillRect(0, yy(3.0), 3, yy(0.66) - yy(3.0)); x.fillRect(W - 3, yy(3.0), 3, yy(0.66) - yy(3.0))
  x.fillRect(0, yy(2.9), W, 2)
  // un grain de plastique : de fines mouchetures
  for (let i = 0; i < 2400; i++) { x.fillStyle = `rgba(110,100,86,${r() * 0.045})`; x.fillRect(r() * W, r() * yy(0.7), 2, 2) }
  // une trace de doigt près de l'accoudoir, des frottements du sac à dos
  for (let i = 0; i < 5; i++) { x.fillStyle = 'rgba(120,108,90,.07)'; x.beginPath(); x.ellipse(60 + r() * 380, yy(1.05 + r() * 0.3), 10 + r() * 14, 4, 0, 0, TAU); x.fill() }
  // le bandeau du haut : une gorge sombre où la lumière indirecte se cache
  x.fillStyle = '#b9b4a8'; x.fillRect(0, yy(3.12), W, yy(3.0) - yy(3.12))
  x.fillStyle = 'rgba(70,64,54,.3)'; x.fillRect(0, yy(3.0), W, 2)
  x.fillStyle = '#d6d1c5'; x.fillRect(0, 0, W, yy(4.1))
})

/** La moquette de la cabine : bleu nuit moucheté, une grille de petits losanges plus clairs. Tuile de 0,6. */
export const carpetTex = canvasTex(128, 128, (x) => {
  const r = seeded(9)
  x.fillStyle = '#2e3763'; x.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '10,12,40'},${r() * 0.07})`; x.fillRect(r() * 128, r() * 128, 2, 2) }
  x.fillStyle = 'rgba(120,138,210,.32)'
  for (const [px, py] of [[32, 32], [96, 96], [96, 32], [32, 96]]) { x.beginPath(); x.moveTo(px, py - 7); x.lineTo(px + 5, py); x.lineTo(px, py + 7); x.lineTo(px - 5, py); x.closePath(); x.fill() }
  x.fillStyle = 'rgba(120,138,210,.16)'
  for (const [px, py] of [[64, 64], [0, 0], [128, 0], [0, 128], [128, 128]]) { x.beginPath(); x.arc(px, py, 4, 0, TAU); x.fill() }
}, [1, 1])

/** Le chemin de l'allée : plus clair, des chevrons qui montrent le sens de la marche (vers +x). Tuile de 0,6. */
export const runnerTex = canvasTex(128, 128, (x) => {
  const r = seeded(11)
  x.fillStyle = '#4a5788'; x.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 600; i++) { x.fillStyle = `rgba(255,255,255,${r() * 0.07})`; x.fillRect(r() * 128, r() * 128, 2, 2) }
  x.strokeStyle = 'rgba(190,205,255,.34)'; x.lineWidth = 6; x.lineCap = 'round'; x.lineJoin = 'round'
  for (const py of [34, 94]) { x.beginPath(); x.moveTo(44, py - 22); x.lineTo(84, py); x.lineTo(44, py + 22); x.stroke() }
}, [1, 1])

/** L'étoffe des sièges : bleu nuit, des constellations tissées en fil plus clair, un point d'étoile aux nœuds. Tuile de 1. */
export const seatTex = canvasTex(256, 256, (x) => {
  const r = seeded(21)
  x.fillStyle = '#27366b'; x.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 1500; i++) { x.fillStyle = `rgba(255,255,255,${r() * 0.04})`; x.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1) }
  x.strokeStyle = 'rgba(160,178,238,.38)'; x.lineWidth = 1.4; x.fillStyle = 'rgba(205,216,255,.75)'
  for (const pts of [
    [[30, 50], [62, 34], [90, 58], [118, 44]],
    [[150, 160], [182, 140], [214, 168], [236, 150], [226, 196]],
    [[40, 190], [70, 214], [102, 198]],
    [[170, 36], [200, 62], [188, 96]],
  ]) {
    x.beginPath(); pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); x.stroke()
    pts.forEach(([px, py], i) => { x.beginPath(); x.arc(px, py, i % 2 ? 2.6 : 3.6, 0, TAU); x.fill() })
  }
  // un tissage : un fin quadrillage
  x.fillStyle = 'rgba(0,0,10,.07)'
  for (let i = 0; i < 256; i += 4) { x.fillRect(i, 0, 1, 256); x.fillRect(0, i, 256, 1) }
}, [1, 1])

/** La housse blanche des appuie-têtes : coton ivoire, une couture, le logo brodé en bleu nuit (u : de gauche à droite de la housse). */
export const coverTex = canvasTex(256, 128, (x) => {
  const r = seeded(5)
  x.fillStyle = '#f0ecdf'; x.fillRect(0, 0, 256, 128)
  for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(150,140,120,${r() * 0.06})`; x.fillRect(r() * 256, r() * 128, 2, 1) }
  x.fillStyle = 'rgba(150,140,120,.2)'; x.fillRect(0, 118, 256, 2)
  // le logo : un croissant et deux étoiles, LUFI AIR en capitales
  x.fillStyle = '#31407c'
  x.beginPath(); x.arc(110, 52, 16, 0, TAU); x.fill()
  x.fillStyle = '#f0ecdf'; x.beginPath(); x.arc(118, 48, 14, 0, TAU); x.fill()
  x.fillStyle = '#31407c'
  for (const [px, py, s] of [[140, 40, 4], [150, 58, 3]]) { x.beginPath(); x.arc(px, py, s, 0, TAU); x.fill() }
  x.font = 'bold 15px "Nunito", Arial, sans-serif'; x.textAlign = 'center'; x.fillText('LUFI AIR', 128, 90)
})

/** La face des coffres à bagages : plastique ivoire, des portes de 1,2, la poignée creuse, le numéro de rangée. Tuile 2,4 × 1. */
export const binTex = canvasTex(512, 256, (x) => {
  const r = seeded(13)
  x.fillStyle = '#e6e1d6'; x.fillRect(0, 0, 512, 256)
  for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(110,100,86,${r() * 0.04})`; x.fillRect(r() * 512, r() * 256, 2, 2) }
  for (const k of [0, 1]) {
    const px = k * 256
    x.fillStyle = 'rgba(80,72,60,.34)'; x.fillRect(px, 0, 3, 256)
    // la poignée : une fente creuse, avec son ombre
    x.fillStyle = '#b9b3a6'; rr(x, px + 76, 196, 104, 22, 11); x.fill()
    x.fillStyle = '#7a7466'; rr(x, px + 82, 202, 92, 12, 6); x.fill()
    // la plaque de rangée
    x.fillStyle = '#31407c'; rr(x, px + 108, 34, 40, 30, 7); x.fill()
    x.fillStyle = '#f0ecdf'; x.font = 'bold 20px "DM Mono", monospace'; x.textAlign = 'center'; x.fillText(String(11 + k * 2), px + 128, 56)
  }
})

/** Les écriteaux lumineux : une pastille sombre, un pictogramme clair. `kind` : 0 sortie, 1 ceinture, 2 toilettes libres, 3 ne pas fumer. Tuile carrée. */
export function signTex(kind: number) {
  return canvasTex(128, 128, (x) => {
    x.fillStyle = '#16231e'; rr(x, 0, 0, 128, 128, 18); x.fill()
    x.lineCap = 'round'; x.lineJoin = 'round'
    const light = kind === 0 ? '#7df0a8' : kind === 1 ? '#ffd48a' : kind === 2 ? '#8ff0b8' : '#ff9c92'
    x.strokeStyle = light; x.fillStyle = light; x.lineWidth = 9
    if (kind === 0) {
      // le bonhomme qui court vers la porte
      x.beginPath(); x.arc(52, 30, 9, 0, TAU); x.fill()
      x.beginPath(); x.moveTo(50, 44); x.lineTo(60, 66); x.lineTo(42, 84); x.moveTo(60, 66); x.lineTo(78, 78); x.moveTo(50, 50); x.lineTo(76, 46); x.stroke()
      x.strokeRect(88, 24, 22, 78)
      x.font = 'bold 18px Arial'; x.textAlign = 'center'; x.fillText('EXIT', 64, 118)
    } else if (kind === 1) {
      // une ceinture bouclée sur un siège
      x.beginPath(); x.arc(64, 36, 11, 0, TAU); x.fill()
      x.beginPath(); x.moveTo(64, 52); x.lineTo(64, 84); x.lineTo(92, 96); x.moveTo(40, 66); x.lineTo(88, 66); x.stroke()
      x.fillStyle = '#16231e'; x.fillRect(58, 62, 14, 8)
    } else if (kind === 2) {
      x.font = 'bold 54px Arial'; x.textAlign = 'center'; x.fillText('WC', 64, 82)
      x.font = 'bold 15px Arial'; x.fillText('LIBRE', 64, 112)
    } else {
      x.beginPath(); x.arc(64, 64, 38, 0, TAU); x.stroke()
      x.beginPath(); x.moveTo(36, 92); x.lineTo(92, 36); x.stroke()
      x.fillRect(46, 60, 30, 8)
    }
  })
}

/** La carte du vol sur la tablette : un fond sombre de nuit, deux continents en aplats, l'arc de l'itinéraire et l'avion qui avance (dessiné à part). 4 : 3. */
export const mapTex = canvasTex(512, 384, (x) => {
  const r = seeded(77)
  const g = x.createLinearGradient(0, 0, 0, 384)
  g.addColorStop(0, '#172457'); g.addColorStop(1, '#0c1538')
  x.fillStyle = g; x.fillRect(0, 0, 512, 384)
  // les continents : de grandes taches douces
  x.fillStyle = '#2b3d7c'
  for (const [px, py, rx, ry] of [[110, 150, 100, 60], [88, 230, 50, 70], [410, 130, 90, 54], [430, 250, 56, 50]]) { x.beginPath(); x.ellipse(px, py, rx, ry, 0.3, 0, TAU); x.fill() }
  x.fillStyle = '#34498f'
  for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(60 + r() * 160, 110 + r() * 150, 6 + r() * 10, 0, TAU); x.fill() }
  for (let i = 0; i < 36; i++) { x.beginPath(); x.arc(340 + r() * 150, 90 + r() * 180, 6 + r() * 10, 0, TAU); x.fill() }
  // la grille
  x.strokeStyle = 'rgba(150,175,255,.16)'; x.lineWidth = 1
  for (let i = 1; i < 8; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, 384); x.stroke() }
  for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(0, i * 64); x.lineTo(512, i * 64); x.stroke() }
  // l'itinéraire : un arc en pointillés, les deux villes
  x.strokeStyle = '#ffd48a'; x.lineWidth = 3; x.setLineDash([9, 8])
  x.beginPath(); x.moveTo(110, 200); x.quadraticCurveTo(256, 20, 410, 160); x.stroke(); x.setLineDash([])
  x.fillStyle = '#ffd48a'; for (const [px, py] of [[110, 200], [410, 160]]) { x.beginPath(); x.arc(px, py, 7, 0, TAU); x.fill() }
  x.fillStyle = 'rgba(255,255,255,.8)'; x.font = 'bold 18px "DM Mono", monospace'; x.textAlign = 'center'
  x.fillText('PAR', 110, 232); x.fillText('TYO', 410, 192)
  // la ligne du bas : le temps restant
  x.fillStyle = 'rgba(8,12,34,.8)'; x.fillRect(0, 328, 512, 56)
  x.fillStyle = '#cfe0ff'; x.textAlign = 'left'; x.font = 'bold 20px "DM Mono", monospace'; x.fillText('LA 482', 18, 364)
  x.textAlign = 'right'; x.fillText('05:42 restantes', 494, 364)
})

/** L'affiche de la route, au mur de l'office : papier crème, un planisphère simple, le tracé du vol. 3 : 4 (portrait). */
export const posterTex = canvasTex(384, 512, (x) => {
  const r = seeded(31)
  x.fillStyle = '#eee7d6'; x.fillRect(0, 0, 384, 512)
  x.fillStyle = '#2c3b77'; rr(x, 22, 22, 340, 380, 10); x.fill()
  x.fillStyle = '#4a5ea4'
  for (const [px, py, rx, ry] of [[110, 150, 66, 40], [92, 230, 30, 52], [270, 130, 70, 40], [290, 250, 40, 44]]) { x.beginPath(); x.ellipse(px, py, rx, ry, 0.3, 0, TAU); x.fill() }
  for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(70 + r() * 70, 120 + r() * 100, 5 + r() * 8, 0, TAU); x.fill() }
  x.strokeStyle = '#ffd48a'; x.lineWidth = 3; x.setLineDash([8, 7])
  x.beginPath(); x.moveTo(120, 200); x.quadraticCurveTo(190, 60, 290, 160); x.stroke(); x.setLineDash([])
  x.fillStyle = '#ffd48a'; for (const [px, py] of [[120, 200], [290, 160]]) { x.beginPath(); x.arc(px, py, 6, 0, TAU); x.fill() }
  x.fillStyle = '#31407c'; x.font = 'bold 34px "Gluten", "Nunito", sans-serif'; x.textAlign = 'center'; x.fillText('Bon vol', 192, 452)
  x.font = '18px "Nunito", sans-serif'; x.fillStyle = '#6a6f8c'; x.fillText('Paris  ·  Tokyo', 192, 484)
})

/** La façade de la porte du chariot : aluminium brossé, une poignée creuse, des évents, le loquet. 2 : 1. */
export const cartTex = canvasTex(512, 256, (x) => {
  const r = seeded(19)
  x.fillStyle = '#c9ced6'; x.fillRect(0, 0, 512, 256)
  for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '90,100,120'},${0.04 + r() * 0.05})`; x.fillRect(0, r() * 256, 512, 1) }
  x.fillStyle = '#a7aeb9'; rr(x, 22, 22, 468, 212, 14); x.fill()
  x.fillStyle = '#d4d9e0'; rr(x, 30, 30, 452, 196, 10); x.fill()
  // les évents : trois fentes en haut, la poignée au milieu, le loquet rouge
  x.fillStyle = '#7e8693'; for (let i = 0; i < 3; i++) rr(x, 60, 56 + i * 16, 110, 8, 4), x.fill()
  x.fillStyle = '#8a92a0'; rr(x, 196, 108, 120, 34, 17); x.fill()
  x.fillStyle = '#5a6270'; rr(x, 204, 116, 104, 18, 9); x.fill()
  x.fillStyle = '#d65a52'; rr(x, 400, 120, 40, 18, 8); x.fill()
  x.fillStyle = '#31407c'; x.font = 'bold 22px "Nunito", sans-serif'; x.textAlign = 'center'; x.fillText('LUFI AIR · SERVICE', 256, 206)
})

/** La porte de secours (1,1 × 2,9) : peinture ivoire, la plaque rouge de la poignée à y = 1,1, le bandeau jaune et noir, la mention du bas. */
export const doorTex = canvasTex(256, 676, (x) => {
  const r = seeded(37), Y = (y: number) => 676 * (1 - y / 2.9)
  x.fillStyle = '#e4dfd4'; x.fillRect(0, 0, 256, 676)
  for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(110,100,86,${r() * 0.04})`; x.fillRect(r() * 256, r() * 676, 2, 2) }
  // le bandeau d'avertissement, en bas
  x.save(); x.beginPath(); x.rect(20, Y(0.62), 216, 30); x.clip()
  for (let i = -6; i < 16; i++) { x.fillStyle = i % 2 ? '#2a2a30' : '#f2c648'; x.beginPath(); x.moveTo(i * 22, Y(0.62) + 30); x.lineTo(i * 22 + 14, Y(0.62)); x.lineTo(i * 22 + 36, Y(0.62)); x.lineTo(i * 22 + 22, Y(0.62) + 30); x.closePath(); x.fill() }
  x.restore()
  // la plaque de la poignée : rouge, une flèche d'ouverture
  x.fillStyle = '#d65a52'; rr(x, 64, Y(1.3), 128, 74, 12); x.fill()
  x.fillStyle = '#f4efe6'; x.font = 'bold 20px Arial'; x.textAlign = 'center'; x.fillText('PULL', 128, Y(1.3) + 30)
  x.strokeStyle = '#f4efe6'; x.lineWidth = 5; x.lineCap = 'round'; x.beginPath(); x.moveTo(90, Y(1.3) + 52); x.lineTo(166, Y(1.3) + 52); x.lineTo(154, Y(1.3) + 42); x.moveTo(166, Y(1.3) + 52); x.lineTo(154, Y(1.3) + 62); x.stroke()
  x.fillStyle = '#6a6f8c'; x.font = '14px "DM Mono", monospace'; x.fillText('DOOR 2L · ARMED', 128, Y(0.3))
  // un cadre de joint tout autour
  x.strokeStyle = 'rgba(80,72,60,.3)'; x.lineWidth = 4; rr(x, 8, 8, 240, 660, 12); x.stroke()
})

/** Le panneau de la porte des toilettes : gris perle, un pictogramme, le verrou « libre ». 2 : 3 (portrait). */
export const lavTex = canvasTex(256, 384, (x) => {
  const r = seeded(41)
  x.fillStyle = '#dcd9d0'; x.fillRect(0, 0, 256, 384)
  for (let i = 0; i < 500; i++) { x.fillStyle = `rgba(110,100,86,${r() * 0.04})`; x.fillRect(r() * 256, r() * 384, 2, 2) }
  x.fillStyle = '#31407c'; x.lineWidth = 5; x.lineCap = 'round'
  x.beginPath(); x.arc(94, 96, 12, 0, TAU); x.fill()
  x.beginPath(); x.moveTo(94, 114); x.lineTo(94, 160); x.moveTo(82, 124); x.lineTo(106, 124); x.moveTo(94, 160); x.lineTo(84, 196); x.moveTo(94, 160); x.lineTo(104, 196); x.strokeStyle = '#31407c'; x.stroke()
  x.beginPath(); x.arc(160, 96, 12, 0, TAU); x.fill()
  x.beginPath(); x.moveTo(160, 114); x.lineTo(144, 160); x.lineTo(176, 160); x.closePath(); x.fill()
  x.fillRect(150, 160, 6, 36); x.fillRect(164, 160, 6, 36)
  // la poignée creuse et le verrou
  x.fillStyle = '#b6b1a4'; rr(x, 46, 250, 70, 26, 13); x.fill()
  x.fillStyle = '#8a8576'; rr(x, 52, 256, 58, 14, 7); x.fill()
  x.fillStyle = '#2a2a30'; rr(x, 164, 250, 48, 26, 5); x.fill()
  x.fillStyle = '#7df0a8'; x.font = 'bold 12px Arial'; x.textAlign = 'center'; x.fillText('LIBRE', 188, 268)
})

/** Le rideau de l'office : une étoffe bleu ardoise à fines rayures, plus sombre dans les plis. Tuile de 1 (en u : les plis courent verticalement). */
export const curtainTex = canvasTex(256, 256, (x) => {
  const r = seeded(43)
  x.fillStyle = '#5c6a9a'; x.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? 'rgba(255,255,255,.07)' : 'rgba(10,14,40,.1)'; x.fillRect(i * 16, 0, 16, 256) }
  for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(255,255,255,${r() * 0.05})`; x.fillRect(r() * 256, r() * 256, 1, 3 + r() * 10) }
  x.fillStyle = 'rgba(20,28,60,.35)'; x.fillRect(0, 240, 256, 16)
}, [1, 1])

/** Le plateau du repas : plastique crème, des alvéoles dessinées par une ombre légère, le logo de la compagnie. 3 : 4 (portrait, u le long de z). */
export const trayTex = canvasTex(384, 512, (x) => {
  x.fillStyle = '#e9e1cf'; x.fillRect(0, 0, 384, 512)
  x.fillStyle = 'rgba(120,104,76,.14)'
  for (const [px, py, w, h] of [[20, 20, 200, 260], [230, 20, 134, 120], [230, 150, 134, 130], [20, 292, 150, 200], [180, 292, 184, 200]]) { rr(x, px, py, w, h, 16); x.fill() }
  x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 3; rr(x, 8, 8, 368, 496, 22); x.stroke()
  x.fillStyle = 'rgba(49,64,124,.45)'; x.font = 'bold 22px "Nunito", sans-serif'; x.textAlign = 'center'; x.fillText('LUFI AIR', 262, 486)
})

/** La table d'harmonie du violoncelle : épicéa roux vernis, f dessinés, filet de contour. u : de gauche à droite de la caisse, v : de bas en haut. */
export const celloPlate = canvasTex(256, 512, (x) => {
  const r = seeded(61)
  const g = x.createLinearGradient(0, 0, 256, 0)
  g.addColorStop(0, '#9a4a22'); g.addColorStop(0.5, '#c06a34'); g.addColorStop(1, '#9a4a22')
  x.fillStyle = g; x.fillRect(0, 0, 256, 512)
  // les veines du bois : de longues fibres verticales, plus serrées au centre
  for (let i = 0; i < 180; i++) { const px = 128 + (r() - 0.5) * 220; x.fillStyle = `rgba(${r() < 0.5 ? '255,210,150' : '70,26,8'},${0.05 + r() * 0.08})`; x.fillRect(px, 0, 1 + r() * 1.4, 512) }
  // les ouïes en f, de chaque côté du chevalet
  x.fillStyle = '#2a140a'; x.lineCap = 'round'
  for (const s of [-1, 1]) {
    x.save(); x.translate(128 + s * 44, 300); x.scale(s, 1)
    x.beginPath(); x.moveTo(-3, -44); x.bezierCurveTo(8, -34, -2, -22, 4, -8); x.bezierCurveTo(10, 8, 0, 20, -6, 44); x.lineTo(-1, 44); x.bezierCurveTo(8, 20, 14, 8, 8, -8); x.bezierCurveTo(2, -22, 10, -34, 2, -44); x.closePath(); x.fill()
    x.beginPath(); x.arc(-3, -46, 5, 0, TAU); x.fill(); x.beginPath(); x.arc(-5, 46, 5, 0, TAU); x.fill()
    x.restore()
  }
})

/** Un papier d'étiquette de bagage : bandeau bleu nuit, texte « TYO ». */
export const tagTex = canvasTex(128, 64, (x) => {
  x.fillStyle = '#f2e7c9'; x.fillRect(0, 0, 128, 64)
  x.fillStyle = '#31407c'; x.fillRect(0, 0, 128, 16)
  x.fillStyle = '#31407c'; x.font = 'bold 30px "DM Mono", monospace'; x.textAlign = 'center'; x.fillText('TYO', 64, 52)
})

/** Un dégradé vertical sur plan : plein en haut, nul en bas (faisceaux, lueurs de bandeau). `up` : plein en bas. */
export function fadeTex(up = false) {
  const [c, x] = makeCanvas(4, 64)
  const g = x.createLinearGradient(0, 0, 0, 64)
  g.addColorStop(0, up ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,1)'); g.addColorStop(1, up ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, 4, 64)
  return new CanvasTexture(c)
}

