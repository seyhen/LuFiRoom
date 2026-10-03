import { TAU } from '../../math'
import { canvasTex, rr, seeded } from '../paint'

// Textures de l'atelier : enduit à la chaux, parquet de chêne, tapis berbère, croquis, tableau de liège, écran.

/** Enduit à la chaux, crème, un peu nuagé. Tuile 1 × 1 unité. */
export const plasterTex = canvasTex(256, 256, (x) => {
  const r = seeded(2)
  x.fillStyle = '#f7efe3'; x.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 90; i++) {
    const px = r() * 256, py = r() * 256, rad = 10 + r() * 40
    const g = x.createRadialGradient(px, py, 0, px, py, rad)
    g.addColorStop(0, r() < 0.5 ? 'rgba(232,218,198,.16)' : 'rgba(255,252,244,.25)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2)
  }
}, [1, 1])

/** Vieux parquet de chêne à l'anglaise, lames longues et blondes. Tuile 1 × 1 unité. */
export const parquetTex = canvasTex(256, 256, (x) => {
  const r = seeded(8), rows = 6, h = 256 / rows
  for (let j = 0; j < rows; j++) {
    let px = -r() * 200
    while (px < 256) {
      const w = 140 + r() * 180, t = r()
      x.fillStyle = `rgb(${196 + t * 22},${156 + t * 18},${110 + t * 14})`
      x.fillRect(px, j * h, w, h)
      x.strokeStyle = 'rgba(120,80,45,.14)'; x.lineWidth = 1
      for (let k = 0; k < 3; k++) { const y = j * h + 6 + r() * (h - 12); x.beginPath(); x.moveTo(px, y); x.bezierCurveTo(px + w / 3, y + 2, px + (2 * w) / 3, y - 2, px + w, y); x.stroke() }
      x.fillStyle = 'rgba(90,60,35,.4)'; x.fillRect(px, j * h, 1.5, h)
      px += w
    }
    x.fillStyle = 'rgba(90,60,35,.45)'; x.fillRect(0, j * h, 256, 1.5)
  }
}, [1, 1])

/** Tapis berbère : laine écrue, losanges bruns et terre cuite, franges. */
export const berberTex = canvasTex(512, 384, (x) => {
  x.fillStyle = '#f2e9da'; x.fillRect(0, 0, 512, 384)
  x.strokeStyle = '#5a4436'; x.lineWidth = 6
  for (let i = -1; i < 6; i++) {
    const cx = i * 110 + 40
    x.beginPath(); x.moveTo(cx, 192 - 150); x.lineTo(cx + 55, 192); x.lineTo(cx, 192 + 150); x.lineTo(cx - 55, 192); x.closePath(); x.stroke()
    x.fillStyle = '#c7703e'; x.beginPath(); x.moveTo(cx, 170); x.lineTo(cx + 12, 192); x.lineTo(cx, 214); x.lineTo(cx - 12, 192); x.fill()
  }
  x.fillStyle = 'rgba(120,90,60,.08)'; for (let i = 0; i < 512; i += 3) x.fillRect(i, 0, 1, 384)
})

/** Le croquis sur la table à dessin : une perspective d'immeuble au crayon, des cotes, un coin de toit. */
export const sketchTex = canvasTex(384, 272, (x) => {
  x.fillStyle = '#fbf8f0'; x.fillRect(0, 0, 384, 272)
  x.strokeStyle = 'rgba(60,60,70,.75)'; x.lineWidth = 1.4
  const line = (a: number[], b: number[]) => { x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke() }
  // une façade haussmannienne en perspective
  const P = [[90, 230], [230, 250], [230, 80], [90, 60], [90, 230]]
  for (let i = 0; i < 4; i++) line(P[i], P[i + 1])
  line([230, 250], [300, 220]); line([300, 220], [300, 70]); line([230, 80], [300, 70])
  line([90, 60], [130, 30]); line([230, 80], [250, 40]); line([130, 30], [250, 40]); line([250, 40], [300, 70])
  for (let f = 0; f < 5; f++) for (let k = 0; k < 4; k++) {
    const x0 = 102 + k * 32, y0 = 80 + f * 30 + k * 4
    x.strokeRect(x0, y0, 16, 20)
  }
  x.strokeStyle = 'rgba(60,60,70,.35)'
  for (let i = 0; i < 30; i++) line([235 + i * 2, 90 + i], [295, 80 + i * 4])
  x.strokeStyle = 'rgba(180,70,60,.6)'; line([90, 255], [230, 270]); x.fillStyle = 'rgba(180,70,60,.7)'; x.font = '12px Georgia'; x.fillText('12,40', 145, 268)
  x.fillStyle = 'rgba(60,60,70,.7)'; x.font = 'italic 14px Georgia'; x.fillText('rue des Martyrs — n° 18', 20, 24)
})

/** Le tableau de liège au-dessus du bureau : croquis, cartes postales, un ticket de métro, des punaises. */
export const corkTex = canvasTex(384, 256, (x) => {
  const r = seeded(15)
  x.fillStyle = '#c99a64'; x.fillRect(0, 0, 384, 256)
  for (let i = 0; i < 1800; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '120,80,40' : '230,190,140'},.35)`; x.fillRect(r() * 384, r() * 256, 2, 2) }
  const cards: [number, number, number, number, number, string][] = [[20, 20, 90, 120, -0.06, '#fbf8f0'], [125, 28, 110, 76, 0.05, '#f3c9b8'], [250, 18, 100, 130, 0.04, '#fbf8f0'], [130, 120, 80, 100, -0.08, '#b9d8e8'], [230, 160, 120, 70, 0.06, '#f6e3a6'], [30, 160, 70, 50, 0.1, '#e9eef0']]
  for (const [px, py, w, h, a, c] of cards) {
    x.save(); x.translate(px + w / 2, py + h / 2); x.rotate(a)
    x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(-w / 2 + 3, -h / 2 + 3, w, h)
    x.fillStyle = c; x.fillRect(-w / 2, -h / 2, w, h)
    x.strokeStyle = 'rgba(60,60,70,.6)'; x.lineWidth = 1.2
    for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(-w / 2 + 10, -h / 2 + 18 + k * (h / 6)); x.lineTo(w / 2 - 10 - r() * 20, -h / 2 + 18 + k * (h / 6)); x.stroke() }
    x.fillStyle = ['#e0586e', '#37a3b5', '#d9a441'][(px / 10) % 3 | 0]; x.beginPath(); x.arc(0, -h / 2 + 6, 4, 0, TAU); x.fill()
    x.restore()
  }
  // un ticket de métro
  x.fillStyle = '#f2d16b'; x.fillRect(40, 222, 60, 22); x.fillStyle = '#7a5a2a'; x.fillRect(40, 232, 60, 3)
})

/** L'écran de l'ordinateur : une illustration en cours, sa palette de couleurs. */
export const screenTex = canvasTex(320, 200, (x) => {
  x.fillStyle = '#2c2a36'; x.fillRect(0, 0, 320, 200)
  x.fillStyle = '#3a3846'; x.fillRect(0, 0, 320, 18); x.fillRect(0, 18, 34, 182)
  const g = x.createLinearGradient(50, 30, 50, 190)
  g.addColorStop(0, '#f6c8a8'); g.addColorStop(1, '#a8c8e8')
  x.fillStyle = g; rr(x, 50, 30, 220, 160, 4); x.fill()
  x.fillStyle = '#6a7ab8'; x.beginPath(); x.moveTo(50, 190); x.lineTo(50, 130); x.lineTo(110, 110); x.lineTo(170, 140); x.lineTo(230, 100); x.lineTo(270, 120); x.lineTo(270, 190); x.fill()
  x.fillStyle = '#fff5e0'; x.beginPath(); x.arc(210, 70, 18, 0, TAU); x.fill()
  ;['#e0586e', '#f6d071', '#8fd8c6', '#37a3b5', '#4a3a5a'].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(17, 40 + i * 22, 7, 0, TAU); x.fill() })
  for (let i = 0; i < 4; i++) { x.fillStyle = '#5a586a'; x.fillRect(285, 34 + i * 20, 26, 12) }
})

/** Une aquarelle des toits sur le chevalet, à moitié finie. */
export const watercolorTex = canvasTex(256, 320, (x) => {
  x.fillStyle = '#fbf8f0'; x.fillRect(0, 0, 256, 320)
  const wash = (cx: number, cy: number, rx: number, ry: number, c: string) => {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry))
    g.addColorStop(0, c); g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.fill()
  }
  wash(128, 70, 150, 70, 'rgba(160,190,225,.7)')
  wash(90, 60, 50, 25, 'rgba(250,210,180,.6)')
  x.fillStyle = 'rgba(110,125,150,.75)'
  x.beginPath(); x.moveTo(0, 210); x.lineTo(40, 170); x.lineTo(90, 175); x.lineTo(120, 150); x.lineTo(180, 160); x.lineTo(256, 140); x.lineTo(256, 230); x.lineTo(0, 240); x.fill()
  x.fillStyle = 'rgba(200,110,80,.75)'; for (const px of [50, 70, 140, 200]) x.fillRect(px, 140 + (px % 30), 8, 22)
  x.strokeStyle = 'rgba(70,70,80,.6)'; x.lineWidth = 1.5
  x.beginPath(); x.moveTo(190, 60); x.lineTo(200, 140); x.moveTo(190, 60); x.lineTo(180, 140); x.moveTo(184, 110); x.lineTo(196, 110); x.stroke()
  x.strokeStyle = 'rgba(70,70,80,.3)'; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(20, 250 + i * 10); x.lineTo(236, 248 + i * 10); x.stroke() }
})
