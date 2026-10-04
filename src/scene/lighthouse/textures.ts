import { TAU } from '../../math'
import { canvasTex, seeded } from '../paint'

// Textures du phare, dessinées une fois : enduit à la chaux, lambris bleu marine, plancher, tapis de cordage, carte marine,
// cadran du baromètre, couverture, bouée, gouttes sur la vitre.

/** Enduit à la chaux, blanc cassé, un peu nuageux. Tuile 1 × 1 unité. */
export const plasterTex = canvasTex(256, 256, (x) => {
  const r = seeded(21)
  x.fillStyle = '#f4e8cc'
  x.fillRect(0, 0, 256, 256)
  // à peine quelques nuages de chaux, très doux : un enduit crème, pas du marbre
  for (let i = 0; i < 160; i++) {
    x.fillStyle = `rgba(${(190 + r() * 30) | 0},${(160 + r() * 30) | 0},${(110 + r() * 30) | 0},${0.01 + r() * 0.02})`
    const s = 14 + r() * 40
    x.beginPath(); x.ellipse(r() * 256, r() * 256, s, s * 0.7, r() * 3, 0, TAU); x.fill()
  }
  for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(255,255,255,${0.05 + r() * 0.07})`; x.fillRect(r() * 256, r() * 256, 2 + r() * 4, 1) }
}, [1, 1])

/** Lambris de bois peint en bleu marine : cinq lames par unité, joints sombres, un reflet sur chaque arête. Tuile 1 × 1. */
export const boardsTex = canvasTex(256, 256, (x) => {
  const r = seeded(5)
  for (let i = 0; i < 5; i++) {
    const t = r() * 10
    x.fillStyle = `rgb(${(40 + t) | 0},${(76 + t) | 0},${(112 + t) | 0})`
    x.fillRect(i * 51.2, 0, 51.2, 256)
    x.fillStyle = 'rgba(255,255,255,.1)'; x.fillRect(i * 51.2 + 4, 0, 5, 256)
    x.fillStyle = 'rgba(8,22,44,.55)'; x.fillRect(i * 51.2, 0, 3, 256)
    for (let k = 0; k < 6; k++) { x.fillStyle = 'rgba(10,30,60,.1)'; x.fillRect(i * 51.2 + 8 + r() * 36, r() * 256, 1, 30 + r() * 90) }
  }
}, [1, 1])

/** Plancher : larges lames de chêne grisé par le sel et les bottes, nœuds, joints. Tuile 1 × 1. */
export const floorTex = canvasTex(512, 512, (x) => {
  const r = seeded(8), rows = 4, h = 512 / rows
  for (let i = 0; i < rows; i++) {
    let px = -r() * 300
    while (px < 512) {
      const w = 280 + r() * 260, t = r() * 22
      x.fillStyle = `rgb(${(168 + t) | 0},${(126 + t) | 0},${(86 + t) | 0})`
      x.fillRect(px, i * h, w, h)
      x.strokeStyle = 'rgba(70,50,38,.16)'; x.lineWidth = 1.2
      for (let k = 0; k < 6; k++) {
        const y = i * h + 6 + r() * (h - 12)
        x.beginPath(); x.moveTo(px, y)
        for (let s = 0; s <= w; s += 40) x.lineTo(px + s, y + Math.sin(s * 0.03 + k) * 2)
        x.stroke()
      }
      if (r() < 0.3) { x.fillStyle = 'rgba(60,42,32,.28)'; x.beginPath(); x.ellipse(px + r() * w, i * h + h / 2, 7, 4, 0, 0, TAU); x.fill() }
      x.fillStyle = 'rgba(40,28,22,.45)'; x.fillRect(px, i * h, 2.5, h)
      px += w
    }
    x.fillStyle = 'rgba(40,28,22,.5)'; x.fillRect(0, i * h, 512, 3)
  }
  for (let k = 0; k < 800; k++) { x.fillStyle = `rgba(230,225,215,${r() * 0.12})`; x.fillRect(r() * 512, r() * 512, 2, 2) }
}, [1, 1])

/** Tapis rond en cordage tressé : anneaux marine, crème et rouge, avec les tours de corde en relief. Sur un disque. */
export const rugTex = canvasTex(512, 512, (x) => {
  const r = seeded(33)
  x.fillStyle = '#efe5cf'; x.fillRect(0, 0, 512, 512)
  const bands: [number, string][] = [[250, '#2b4a6f'], [226, '#efe5cf'], [212, '#c9444b'], [186, '#efe5cf'], [150, '#2b4a6f'], [124, '#efe5cf'], [96, '#c9444b'], [66, '#efe5cf'], [36, '#2b4a6f']]
  for (const [rad, col] of bands) { x.fillStyle = col; x.beginPath(); x.arc(256, 256, rad, 0, TAU); x.fill() }
  // les tours de corde : de fins traits obliques qui suivent chaque anneau
  for (let rad = 14; rad < 250; rad += 7) {
    x.strokeStyle = 'rgba(60,40,20,.2)'; x.lineWidth = 1
    for (let a = 0; a < TAU; a += 0.22 / (rad / 90 + 0.5)) { x.beginPath(); x.arc(256, 256, rad, a, a + 0.05); x.stroke() }
    x.strokeStyle = 'rgba(255,255,255,.14)'; x.beginPath(); x.arc(256, 256, rad + 3, 0, TAU); x.stroke()
  }
  for (let k = 0; k < 500; k++) { x.fillStyle = `rgba(90,70,40,${r() * 0.12})`; x.fillRect(r() * 512, r() * 512, 2, 2) }
})

/** Une carte marine sur parchemin : côte hachurée, îlots, sondes, route pointillée et rose des vents. */
export const chartTex = canvasTex(256, 192, (x) => {
  const r = seeded(14)
  x.fillStyle = '#ecdcb4'; x.fillRect(0, 0, 256, 192)
  for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(150,110,60,${0.02 + r() * 0.05})`; x.beginPath(); x.ellipse(r() * 256, r() * 192, 6 + r() * 20, 4 + r() * 12, r() * 3, 0, TAU); x.fill() }
  // quadrillage
  x.strokeStyle = 'rgba(120,80,40,.22)'; x.lineWidth = 0.7
  for (let i = 0; i <= 256; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 192); x.stroke() }
  for (let j = 0; j <= 192; j += 32) { x.beginPath(); x.moveTo(0, j); x.lineTo(256, j); x.stroke() }
  // la côte
  x.fillStyle = '#d6c08a'; x.strokeStyle = '#6a4a2a'; x.lineWidth = 1.6
  x.beginPath(); x.moveTo(0, 0); x.lineTo(150, 0); x.bezierCurveTo(130, 30, 110, 48, 120, 70); x.bezierCurveTo(128, 88, 90, 96, 70, 118); x.bezierCurveTo(52, 138, 30, 132, 0, 150); x.closePath(); x.fill(); x.stroke()
  x.lineWidth = 0.8; x.strokeStyle = 'rgba(106,74,42,.5)'
  for (let i = 0; i < 26; i++) { const a = r() * 120, b = r() * 140; x.beginPath(); x.moveTo(a, b); x.lineTo(a + 8, b + 5); x.stroke() }
  // îlots
  for (const [px, py, s] of [[188, 60, 9], [210, 118, 6], [168, 150, 7]] as const) { x.fillStyle = '#d6c08a'; x.strokeStyle = '#6a4a2a'; x.lineWidth = 1.2; x.beginPath(); x.ellipse(px, py, s, s * 0.7, 0.4, 0, TAU); x.fill(); x.stroke() }
  // sondes
  x.fillStyle = 'rgba(40,70,100,.7)'; x.font = '8px Georgia, serif'
  for (let i = 0; i < 24; i++) x.fillText(String(3 + ((r() * 40) | 0)), 130 + r() * 118, 8 + r() * 178)
  // la route, en pointillé, et son arrivée
  x.setLineDash([4, 4]); x.strokeStyle = '#a8323a'; x.lineWidth = 1.6
  x.beginPath(); x.moveTo(30, 175); x.bezierCurveTo(80, 150, 120, 180, 168, 134); x.bezierCurveTo(190, 112, 200, 90, 188, 62); x.stroke(); x.setLineDash([])
  x.strokeStyle = '#a8323a'; x.lineWidth = 2; x.beginPath(); x.moveTo(182, 56); x.lineTo(194, 68); x.moveTo(194, 56); x.lineTo(182, 68); x.stroke()
  // rose des vents
  x.save(); x.translate(226, 30)
  x.strokeStyle = '#6a4a2a'; x.fillStyle = '#6a4a2a'; x.lineWidth = 1
  x.beginPath(); x.arc(0, 0, 14, 0, TAU); x.stroke()
  for (let i = 0; i < 4; i++) { x.rotate(Math.PI / 2); x.beginPath(); x.moveTo(0, -17); x.lineTo(3.4, -3.4); x.lineTo(0, 0); x.lineTo(-3.4, -3.4); x.closePath(); x.fill() }
  x.restore()
  x.fillStyle = '#6a4a2a'; x.font = 'bold 9px Georgia, serif'; x.fillText('N', 222.5, 9)
  x.strokeStyle = '#6a4a2a'; x.lineWidth = 2.2; x.strokeRect(2, 2, 252, 188)
})

/** Cadran du baromètre : un anneau gradué et ses cinq temps, de TEMPÊTE à BEAU. */
export const baroTex = canvasTex(256, 256, (x) => {
  x.fillStyle = '#f7f0dc'; x.beginPath(); x.arc(128, 128, 124, 0, TAU); x.fill()
  x.strokeStyle = '#3a2a22'; x.lineWidth = 3; x.beginPath(); x.arc(128, 128, 104, 0, TAU); x.stroke()
  x.lineWidth = 1.4
  for (let i = 0; i <= 40; i++) {
    const a = Math.PI * 0.75 + (i / 40) * Math.PI * 1.5, big = i % 5 === 0, r0 = big ? 88 : 95
    x.beginPath(); x.moveTo(128 + Math.cos(a) * r0, 128 + Math.sin(a) * r0); x.lineTo(128 + Math.cos(a) * 104, 128 + Math.sin(a) * 104); x.stroke()
  }
  x.fillStyle = '#3a2a22'; x.font = 'bold 15px Georgia, serif'; x.textAlign = 'center'
  const words: [string, number][] = [['TEMPÊTE', 0.08], ['PLUIE', 0.3], ['VARIABLE', 0.5], ['BEAU', 0.72], ['SEC', 0.92]]
  for (const [w, k] of words) {
    const a = Math.PI * 0.75 + k * Math.PI * 1.5
    x.save(); x.translate(128 + Math.cos(a) * 66, 128 + Math.sin(a) * 66); x.rotate(a + Math.PI / 2); x.font = `bold ${w.length > 6 ? 11 : 14}px Georgia, serif`; x.fillText(w, 0, 4); x.restore()
  }
  x.fillStyle = '#a8323a'; x.beginPath(); x.arc(128, 128, 7, 0, TAU); x.fill()
})

/** Couverture de laine : larges rayures rouge et crème, fines lignes marine. Tuile 1 × 1. */
export const blanketTex = canvasTex(128, 128, (x) => {
  x.fillStyle = '#efe5cf'; x.fillRect(0, 0, 128, 128)
  x.fillStyle = '#c9444b'; x.fillRect(0, 14, 128, 34); x.fillRect(0, 78, 128, 34)
  x.fillStyle = '#2b4a6f'; x.fillRect(0, 6, 128, 4); x.fillRect(0, 52, 128, 4); x.fillRect(0, 70, 128, 4); x.fillRect(0, 116, 128, 4)
  for (let i = 0; i < 128; i += 3) { x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(i, 0, 1, 128) }
}, [2, 2])

/** Bandes rouges et blanches de la bouée de sauvetage (le long de l'anneau). */
export const buoyTex = canvasTex(256, 16, (x) => {
  for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#f6f1e6' : '#d8404a'; x.fillRect(i * 32, 0, 32, 16) }
})

/** Traînées de pluie sur la vitre du hublot : de courts traits en biais, transparents entre eux. */
export const streakTex = canvasTex(128, 256, (x) => {
  const r = seeded(77)
  x.lineCap = 'round'
  for (let i = 0; i < 46; i++) {
    const px = r() * 128, py = r() * 256, len = 14 + r() * 44
    x.strokeStyle = `rgba(235,245,255,${0.14 + r() * 0.3})`; x.lineWidth = 0.8 + r() * 1.4
    x.beginPath(); x.moveTo(px, py); x.lineTo(px - len * 0.22, py + len); x.stroke()
    if (r() < 0.5) { x.fillStyle = 'rgba(235,245,255,.5)'; x.beginPath(); x.arc(px - len * 0.22, py + len, 1.2 + r(), 0, TAU); x.fill() }
  }
}, [1, 1])

/** Une peinture à l'huile : un trois-mâts sous voiles, au couchant, sur une mer houleuse. */
export const shipPainting = canvasTex(192, 128, (x) => {
  const r = seeded(61)
  const sky = x.createLinearGradient(0, 0, 0, 80)
  sky.addColorStop(0, '#5d6f93'); sky.addColorStop(0.55, '#e0a07a'); sky.addColorStop(1, '#f7d598')
  x.fillStyle = sky; x.fillRect(0, 0, 192, 80)
  x.fillStyle = '#fbeab8'; x.beginPath(); x.arc(138, 66, 12, 0, TAU); x.fill()
  for (let i = 0; i < 6; i++) { x.fillStyle = `rgba(84,72,100,${0.35 + r() * 0.3})`; x.beginPath(); x.ellipse(r() * 192, 10 + r() * 40, 24 + r() * 30, 3 + r() * 3, 0, 0, TAU); x.fill() }
  const sea = x.createLinearGradient(0, 80, 0, 128)
  sea.addColorStop(0, '#2d5f78'); sea.addColorStop(1, '#10304a')
  x.fillStyle = sea; x.fillRect(0, 80, 192, 48)
  x.fillStyle = 'rgba(255,214,150,.55)'; for (let i = 0; i < 12; i++) x.fillRect(128 + r() * 22, 82 + i * 3.5, 6 + r() * 14, 1.6)
  x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 1.2
  for (let i = 0; i < 14; i++) { const px = r() * 192, py = 86 + r() * 38; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 7, py - 3, px + 14, py); x.stroke() }
  // le navire
  x.fillStyle = '#2a2230'; x.beginPath(); x.moveTo(40, 92); x.lineTo(112, 92); x.lineTo(104, 102); x.lineTo(48, 102); x.closePath(); x.fill()
  x.fillRect(50, 36, 2, 56); x.fillRect(74, 28, 2, 64); x.fillRect(98, 40, 2, 52)
  x.fillStyle = '#f6ead0'
  for (const [mx, top, w] of [[51, 38, 18], [75, 30, 22], [99, 42, 16]] as const) {
    x.beginPath(); x.moveTo(mx - w / 2, top); x.quadraticCurveTo(mx - w / 2 - 3, top + 18, mx - w / 2, top + 36); x.lineTo(mx + w / 2, top + 36); x.quadraticCurveTo(mx + w / 2 + 3, top + 18, mx + w / 2, top); x.closePath(); x.fill()
  }
  x.strokeStyle = '#6a4a2a'; x.lineWidth = 3; x.strokeRect(1.5, 1.5, 189, 125)
})

/** Une petite affiche : le phare vu en coupe, au trait blanc sur bleu de plan. */
export const planTex = canvasTex(128, 192, (x) => {
  x.fillStyle = '#2a5f96'; x.fillRect(0, 0, 128, 192)
  x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 0.6
  for (let i = 0; i < 128; i += 12) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 192); x.stroke() }
  for (let j = 0; j < 192; j += 12) { x.beginPath(); x.moveTo(0, j); x.lineTo(128, j); x.stroke() }
  x.strokeStyle = '#f2f6fb'; x.lineWidth = 1.8; x.lineJoin = 'round'
  x.beginPath(); x.moveTo(46, 176); x.lineTo(54, 56); x.lineTo(74, 56); x.lineTo(82, 176); x.closePath(); x.stroke()
  x.strokeRect(50, 40, 28, 16); x.beginPath(); x.moveTo(48, 40); x.lineTo(64, 24); x.lineTo(80, 40); x.stroke()
  for (const y of [78, 100, 122, 144]) { x.beginPath(); x.moveTo(52 + (y - 56) * 0.04, y); x.lineTo(76 - (y - 56) * 0.04, y); x.stroke() }
  x.beginPath(); x.moveTo(20, 176); x.lineTo(108, 176); x.stroke()
  x.fillStyle = '#f2f6fb'; x.font = 'bold 9px Georgia, serif'; x.textAlign = 'center'; x.fillText('FEU À ÉCLATS', 64, 14); x.fillText('1893', 64, 188)
})
