import { TAU } from '../../math'
import { canvasTex, rr, seeded } from '../paint'
import { LEN, V_WALL } from './shape'

// Les textures de la tente, dessinées une fois : la toile (laies cousues, bande de tempête, jupe de boue, taches), la toile de sol,
// le kilim, la couette matelassée, le plaid à carreaux, le bois des caisses, la pochette de rangement, l'étiquette de la caisse.

export const GORES = 14

/**
 * La toile de la demi-tente, étirée sur son profil (u : 0 → 1 sur l'arc, v : 0 → 1 de l'ourlet au sommet). Des laies verticales
 * cousues (elles convergent au sommet, comme une vraie tente-cloche), une bande de tempête à la rencontre du mur et du toit, la
 * jupe de boue plus sombre en bas, des taches de moisissure, des coulées d'eau sous les coutures, une pièce recousue.
 */
export const toileTex = canvasTex(1024, 1024, (x) => {
  const r = seeded(7), W = 1024, H = 1024
  const vy = (v: number) => H * (1 - v)
  x.fillStyle = '#e1d0a8'; x.fillRect(0, 0, W, H)
  // le tissage : fines trames horizontales et verticales
  for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(110,85,40,${0.025 + r() * 0.045})`; x.fillRect(r() * W, r() * H, 6 + r() * 26, 1) }
  for (let i = 0; i < 1800; i++) { x.fillStyle = `rgba(255,248,225,${0.03 + r() * 0.05})`; x.fillRect(r() * W, r() * H, 1, 6 + r() * 22) }
  // une laie sur deux un peu plus sombre
  for (let k = 0; k < GORES; k++) {
    x.fillStyle = k % 2 ? 'rgba(120,90,40,.05)' : 'rgba(255,245,215,.06)'
    x.fillRect((k / GORES) * W, 0, W / GORES, H)
  }
  // coulées d'eau : de longues traînées sombres sous les coutures
  for (let k = 0; k < GORES; k++) {
    const u = ((k + 0.5) / GORES) * W
    for (let n = 0; n < 3; n++) {
      const px = u + (r() - 0.5) * 22, top = H * (0.05 + r() * 0.5), len = 160 + r() * 360
      const g = x.createLinearGradient(0, top, 0, top + len)
      g.addColorStop(0, 'rgba(96,76,40,0)'); g.addColorStop(0.3, `rgba(96,76,40,${0.1 + r() * 0.1})`); g.addColorStop(1, 'rgba(96,76,40,0)')
      x.fillStyle = g; x.fillRect(px - 2 - r() * 4, top, 4 + r() * 6, len)
    }
  }
  // la bande de tempête (le mur droit rejoint le toit) et la jupe de boue
  const wy = vy(V_WALL), skirt = vy(0.3 / LEN)
  x.fillStyle = 'rgba(70,58,30,.16)'; x.fillRect(0, wy - 5, W, 10)
  x.fillStyle = '#6b6a48'; x.fillRect(0, skirt, W, H - skirt)
  const sg = x.createLinearGradient(0, skirt, 0, H)
  sg.addColorStop(0, 'rgba(255,255,255,.08)'); sg.addColorStop(1, 'rgba(30,24,10,.36)')
  x.fillStyle = sg; x.fillRect(0, skirt, W, H - skirt)
  x.strokeStyle = 'rgba(48,40,22,.65)'; x.lineWidth = 2
  x.setLineDash([9, 6]); x.beginPath(); x.moveTo(0, skirt - 6); x.lineTo(W, skirt - 6); x.moveTo(0, skirt + 6); x.lineTo(W, skirt + 6); x.stroke(); x.setLineDash([])
  // les coutures verticales : un double point, à chaque laie
  for (let k = 0; k <= GORES; k++) {
    const u = (k / GORES) * W
    x.strokeStyle = 'rgba(70,55,28,.7)'; x.lineWidth = 2.2
    x.setLineDash([10, 5]); x.beginPath(); x.moveTo(u - 4, 0); x.lineTo(u - 4, wy + 200); x.moveTo(u + 4, 0); x.lineTo(u + 4, wy + 200); x.stroke(); x.setLineDash([])
    x.fillStyle = 'rgba(60,45,22,.22)'; x.fillRect(u - 7, 0, 14, H)
  }
  // la moisissure, au pied de la toile, et deux taches claires de soleil (le ciel est bas, mais la toile garde ses étés)
  for (let i = 0; i < 70; i++) {
    const px = r() * W, py = skirt - 10 - Math.pow(r(), 2) * 190, rad = 8 + r() * 28
    const g = x.createRadialGradient(px, py, 0, px, py, rad)
    g.addColorStop(0, `rgba(86,100,60,${0.18 + r() * 0.16})`); g.addColorStop(1, 'rgba(86,100,60,0)')
    x.fillStyle = g; x.beginPath(); x.arc(px, py, rad, 0, TAU); x.fill()
  }
  for (let i = 0; i < 14; i++) {
    const px = r() * W, py = r() * H * 0.6, rad = 30 + r() * 60
    const g = x.createRadialGradient(px, py, 0, px, py, rad)
    g.addColorStop(0, 'rgba(255,240,200,.12)'); g.addColorStop(1, 'rgba(255,240,200,0)')
    x.fillStyle = g; x.beginPath(); x.arc(px, py, rad, 0, TAU); x.fill()
  }
  // la pièce recousue : un carré de toile verte, quatre côtés piqués
  const px = W * 0.62, py = H * 0.34
  x.fillStyle = '#7d8a5c'; rr(x, px, py, 86, 74, 4); x.fill()
  x.strokeStyle = 'rgba(40,34,16,.85)'; x.lineWidth = 2; x.setLineDash([7, 5]); rr(x, px + 6, py + 6, 74, 62, 3); x.stroke(); x.setLineDash([])
})

/** La toile de sol, sur un disque (le haut de l'image est -z, la droite +x) : kaki, nervures, taches de boue et traces de bottes devant. */
export const floorTex = canvasTex(512, 512, (x) => {
  const r = seeded(21)
  x.fillStyle = '#8b8a5e'; x.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(60,58,30,${0.04 + r() * 0.06})`; x.fillRect(0, i * 3.2, 512, 1) }
  for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(230,225,170,${r() * 0.07})`; x.fillRect(r() * 512, r() * 512, 3 + r() * 14, 1) }
  // la boue entrée avec les bottes, devant (le coin +x +z : en bas à droite)
  for (let i = 0; i < 26; i++) {
    const px = 330 + r() * 160, py = 330 + r() * 160, rad = 10 + r() * 38
    const g = x.createRadialGradient(px, py, 0, px, py, rad)
    g.addColorStop(0, `rgba(66,48,28,${0.3 + r() * 0.2})`); g.addColorStop(1, 'rgba(66,48,28,0)')
    x.fillStyle = g; x.beginPath(); x.arc(px, py, rad, 0, TAU); x.fill()
  }
  // deux traces de bottes
  x.fillStyle = 'rgba(52,38,22,.5)'
  for (const [bx, by, a] of [[400, 372, -0.7], [436, 420, -0.5], [350, 430, -0.9]]) {
    x.save(); x.translate(bx, by); x.rotate(a)
    rr(x, -9, -20, 18, 40, 7); x.fill()
    x.fillStyle = 'rgba(139,138,94,.4)'
    for (let k = -3; k <= 3; k++) x.fillRect(-8, k * 5.5, 16, 1.6)
    x.fillStyle = 'rgba(52,38,22,.5)'
    x.restore()
  }
  // l'ombre de la jupe : un anneau sombre au bord
  const g = x.createRadialGradient(256, 256, 190, 256, 256, 256)
  g.addColorStop(0, 'rgba(30,26,12,0)'); g.addColorStop(1, 'rgba(30,26,12,.45)')
  x.fillStyle = g; x.fillRect(0, 0, 512, 512)
})

/** Le kilim rond de la tente : bandes concentriques ocre, rouille et vert mousse, losanges, franges. */
export const kilimTex = canvasTex(512, 512, (x) => {
  x.fillStyle = '#e8d6ae'; x.fillRect(0, 0, 512, 512)
  const ring = (rad: number, col: string) => { x.fillStyle = col; x.beginPath(); x.arc(256, 256, rad, 0, TAU); x.fill() }
  ring(250, '#b3562e'); ring(236, '#e8d6ae'); ring(222, '#355c46'); ring(206, '#e8d6ae'); ring(192, '#c88a3a')
  ring(150, '#e8d6ae'); ring(138, '#b3562e')
  // les losanges du bandeau ocre
  x.fillStyle = '#355c46'
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * TAU, cx = 256 + Math.cos(a) * 170, cy = 256 + Math.sin(a) * 170
    x.save(); x.translate(cx, cy); x.rotate(a + Math.PI / 4); x.fillRect(-8, -8, 16, 16); x.restore()
  }
  // l'étoile du centre
  x.fillStyle = '#e8d6ae'
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * TAU
    x.beginPath(); x.moveTo(256 + Math.cos(a) * 118, 256 + Math.sin(a) * 118); x.lineTo(256 + Math.cos(a + 0.2) * 40, 256 + Math.sin(a + 0.2) * 40); x.lineTo(256 + Math.cos(a - 0.2) * 40, 256 + Math.sin(a - 0.2) * 40); x.closePath(); x.fill()
  }
  ring(26, '#355c46')
  const r = seeded(5)
  for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(60,40,20,${r() * 0.08})`; x.fillRect(r() * 512, r() * 512, 2 + r() * 10, 1) }
})

/** La couette du sac de couchage : un matelassage en losanges cousus, ocre et vert profond. Tuile 1 × 1. */
export const quiltTex = canvasTex(256, 256, (x) => {
  x.fillStyle = '#c47a34'; x.fillRect(0, 0, 256, 256)
  x.fillStyle = '#2f5a45'; x.fillRect(0, 96, 256, 64)
  x.strokeStyle = 'rgba(60,34,12,.6)'; x.lineWidth = 2
  for (let i = -4; i <= 8; i++) {
    x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32 + 256, 256); x.stroke()
    x.beginPath(); x.moveTo(i * 32 + 256, 0); x.lineTo(i * 32, 256); x.stroke()
  }
  const r = seeded(17)
  for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(255,235,200,${r() * 0.05})`; x.fillRect(r() * 256, r() * 256, 8, 1) }
}, [1, 1])

/** Le plaid à gros carreaux rouge et noir. Tuile 1 × 1. */
export const plaidTex = canvasTex(128, 128, (x) => {
  x.fillStyle = '#b0322c'; x.fillRect(0, 0, 128, 128)
  x.fillStyle = 'rgba(24,18,18,.85)'
  for (let i = 0; i < 2; i++) { x.fillRect(i * 64, 0, 32, 128); x.fillRect(0, i * 64, 128, 32) }
  x.fillStyle = 'rgba(255,255,255,.04)'
  for (let i = 0; i < 128; i += 3) x.fillRect(0, i, 128, 1)
}, [1, 1])

/** Planches de caisse, peintes et usées : fil du bois. Tuile 1 × 1. */
export const woodTex = canvasTex(256, 128, (x) => {
  const r = seeded(33)
  x.fillStyle = '#b98e58'; x.fillRect(0, 0, 256, 128)
  for (let j = 0; j < 4; j++) {
    x.fillStyle = j % 2 ? 'rgba(110,70,30,.12)' : 'rgba(255,230,180,.1)'; x.fillRect(0, j * 32, 256, 32)
    x.fillStyle = 'rgba(60,36,14,.55)'; x.fillRect(0, j * 32, 256, 2)
    for (let k = 0; k < 16; k++) { x.fillStyle = `rgba(80,52,24,${0.1 + r() * 0.16})`; x.fillRect(r() * 256, j * 32 + 4 + r() * 24, 30 + r() * 90, 1) }
  }
}, [1, 1])

/** Le pochoir de la caisse d'expédition : « CAMP · N° 4 ». */
export const crateTex = canvasTex(256, 128, (x) => {
  x.fillStyle = 'rgba(0,0,0,0)'; x.clearRect(0, 0, 256, 128)
  x.fillStyle = 'rgba(240,228,198,.92)'; x.font = '700 44px "Nunito", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'
  x.fillText('CAMP', 128, 44)
  x.font = '700 30px "Nunito", sans-serif'
  x.fillText('N° 4', 128, 92)
  x.strokeStyle = 'rgba(240,228,198,.85)'; x.lineWidth = 4; x.strokeRect(10, 10, 236, 108)
})

/** La pochette de rangement cousue sur la toile : quatre poches. */
export const pocketTex = canvasTex(256, 192, (x) => {
  x.fillStyle = '#5f6e48'; x.fillRect(0, 0, 256, 192)
  x.strokeStyle = 'rgba(230,220,180,.7)'; x.lineWidth = 2; x.setLineDash([8, 5])
  x.strokeRect(6, 6, 244, 180)
  for (const px of [64, 128, 192]) { x.beginPath(); x.moveTo(px, 60); x.lineTo(px, 186); x.stroke() }
  x.beginPath(); x.moveTo(6, 60); x.lineTo(250, 60); x.stroke(); x.setLineDash([])
  x.fillStyle = 'rgba(0,0,0,.14)'
  for (let k = 0; k < 4; k++) x.fillRect(k * 64 + 8, 62, 52, 14)
  const r = seeded(11)
  for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(255,255,230,${r() * 0.06})`; x.fillRect(r() * 256, r() * 192, 6, 1) }
})

/** Une carte dépliée : papier, courbes de niveau, un lac, un sentier pointillé rouge. */
export const mapTex = canvasTex(128, 96, (x) => {
  x.fillStyle = '#ecdfb8'; x.fillRect(0, 0, 128, 96)
  x.strokeStyle = 'rgba(150,100,60,.5)'; x.lineWidth = 1
  for (let k = 1; k < 5; k++) { x.beginPath(); x.ellipse(40, 50, 8 + k * 10, 5 + k * 7, 0.3, 0, TAU); x.stroke() }
  x.fillStyle = 'rgba(110,160,190,.8)'; x.beginPath(); x.ellipse(98, 28, 16, 9, 0.4, 0, TAU); x.fill()
  x.strokeStyle = '#b0322c'; x.lineWidth = 2; x.setLineDash([4, 3]); x.beginPath(); x.moveTo(10, 80); x.quadraticCurveTo(50, 30, 112, 66); x.stroke(); x.setLineDash([])
  x.strokeStyle = 'rgba(80,60,40,.5)'; x.lineWidth = 1
  for (const px of [32, 64, 96]) { x.beginPath(); x.moveTo(px, 0); x.lineTo(px, 96); x.stroke() }
  x.beginPath(); x.moveTo(0, 48); x.lineTo(128, 48); x.stroke()
})

/** Les taches d'impact de la pluie sur la toile, vues de l'intérieur : de petits ronds sombres et mouillés à cœur clair. Tuile 1 × 1 (u : arc, v : profil). */
export const wetTex = canvasTex(1024, 512, (x) => {
  const r = seeded(91)
  x.clearRect(0, 0, 1024, 512)
  for (let i = 0; i < 520; i++) {
    const px = r() * 1024, py = r() * 512, rad = 2.5 + Math.pow(r(), 2) * 8
    const g = x.createRadialGradient(px, py, 0, px, py, rad)
    g.addColorStop(0, 'rgba(255,238,200,.55)'); g.addColorStop(0.45, 'rgba(70,56,32,.4)'); g.addColorStop(1, 'rgba(70,56,32,0)')
    x.fillStyle = g; x.beginPath(); x.arc(px, py, rad, 0, TAU); x.fill()
  }
}, [1, 1])
