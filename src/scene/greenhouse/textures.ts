import { TAU } from '../../math'
import { canvasTex, rr, seeded } from '../paint'

// Les textures de la serre, dessinées une fois : carrelage ancien à motifs, brique blanchie du soubassement, buée et gouttes sur le verre,
// jonc tressé de l'osier, planches de la paillasse, tapis, étiquettes de semis.

/** Carreaux de ciment anciens : un damier de terre cuite et de crème, une rosace verte et ocre à chaque croisement. Tuile 1 × 1. */
export const tileTex = canvasTex(256, 256, (x) => {
  x.fillStyle = '#e6dcc4'; x.fillRect(0, 0, 256, 256)
  const r = seeded(4)
  for (const [i, j] of [[0, 0], [1, 1]]) { x.fillStyle = '#c4856a'; x.fillRect(i * 128, j * 128, 128, 128) }
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const cx = i * 128 + 64, cy = j * 128 + 64, dark = (i + j) % 2 === 0
    x.fillStyle = dark ? '#e6dcc4' : '#c4856a'
    x.beginPath(); x.arc(cx, cy, 34, 0, TAU); x.fill()
    x.fillStyle = dark ? '#6f9a84' : '#d8b878'
    for (let k = 0; k < 4; k++) { x.beginPath(); x.ellipse(cx + Math.cos(k * TAU / 4) * 14, cy + Math.sin(k * TAU / 4) * 14, 11, 6, k * TAU / 4, 0, TAU); x.fill() }
    x.fillStyle = dark ? '#c4856a' : '#e6dcc4'
    x.beginPath(); x.arc(cx, cy, 6, 0, TAU); x.fill()
  }
  // l'usure : des taches claires et des fêlures
  for (let k = 0; k < 40; k++) { x.fillStyle = `rgba(255,255,240,${r() * 0.1})`; x.fillRect(r() * 256, r() * 256, 6 + r() * 20, 3 + r() * 8) }
  x.strokeStyle = 'rgba(60,40,30,.35)'; x.lineWidth = 2
  x.strokeRect(0, 0, 256, 256); x.beginPath(); x.moveTo(128, 0); x.lineTo(128, 256); x.moveTo(0, 128); x.lineTo(256, 128); x.stroke()
}, [1, 1])

/** Brique blanchie à la chaux du soubassement, mousse en bas. Tuile 1 × 1. */
export const brickTex = canvasTex(256, 256, (x) => {
  const r = seeded(12)
  x.fillStyle = '#9aa896'; x.fillRect(0, 0, 256, 256)
  const rows = 10, bw = 64, bh = 256 / rows
  for (let j = 0; j < rows; j++) for (let i = -1; i < 5; i++) {
    const px = i * bw + (j % 2 ? bw / 2 : 0), py = j * bh, v = r() * 22
    x.fillStyle = `rgb(${(214 + v) | 0},${(214 + v) | 0},${(200 + v) | 0})`
    rr(x, px + 2, py + 2, bw - 4, bh - 4, 3); x.fill()
  }
  const g = x.createLinearGradient(0, 160, 0, 256)
  g.addColorStop(0, 'rgba(70,110,70,0)'); g.addColorStop(1, 'rgba(70,110,70,.5)')
  x.fillStyle = g; x.fillRect(0, 160, 256, 96)
}, [1, 1])

/** La buée du verre : un voile laiteux plus dense en bas, des coulures et des gouttes. Une seule texture étirée sur chaque paroi. */
export const fogTex = canvasTex(512, 512, (x) => {
  const r = seeded(21)
  x.clearRect(0, 0, 512, 512)
  const g = x.createLinearGradient(0, 0, 0, 512)
  g.addColorStop(0, 'rgba(220,240,230,.10)'); g.addColorStop(1, 'rgba(225,242,232,.34)')
  x.fillStyle = g; x.fillRect(0, 0, 512, 512)
  for (let k = 0; k < 60; k++) {
    const px = r() * 512, py = r() * 380, len = 30 + r() * 120
    const s = x.createLinearGradient(0, py, 0, py + len)
    s.addColorStop(0, 'rgba(255,255,255,0)'); s.addColorStop(0.15, 'rgba(255,255,255,.32)'); s.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = s; x.fillRect(px, py, 2 + r() * 2.5, len)
  }
  for (let k = 0; k < 220; k++) {
    x.fillStyle = `rgba(255,255,255,${0.1 + r() * 0.3})`
    x.beginPath(); x.arc(r() * 512, r() * 512, 1 + r() * 3, 0, TAU); x.fill()
  }
})

/** Osier tressé : brins obliques entrecroisés. Tuile 1 × 1. */
export const wickerTex = canvasTex(128, 128, (x) => {
  x.fillStyle = '#b98f58'; x.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      const on = (i + j) % 2 === 0
      x.fillStyle = on ? '#d7b078' : '#a47a46'
      x.fillRect(i * 8 + 0.5, j * 8 + 0.5, 7, 7)
    }
  }
  x.strokeStyle = 'rgba(70,40,10,.25)'; x.lineWidth = 1
  for (let i = 0; i <= 128; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 128); x.moveTo(0, i); x.lineTo(128, i); x.stroke() }
}, [1, 1])

/** Planches de bois usées de la paillasse et des caisses : fil du bois, nœuds. Tuile 1 × 1. */
export const boardTex = canvasTex(256, 128, (x) => {
  const r = seeded(33)
  x.fillStyle = '#c4985f'; x.fillRect(0, 0, 256, 128)
  for (let j = 0; j < 4; j++) {
    x.fillStyle = j % 2 ? 'rgba(120,80,40,.1)' : 'rgba(255,230,180,.1)'; x.fillRect(0, j * 32, 256, 32)
    x.fillStyle = 'rgba(70,40,15,.55)'; x.fillRect(0, j * 32, 256, 2)
    for (let k = 0; k < 14; k++) { x.fillStyle = `rgba(90,60,30,${0.1 + r() * 0.16})`; x.fillRect(r() * 256, j * 32 + 4 + r() * 24, 30 + r() * 90, 1) }
  }
}, [1, 1])

/** Le tapis de la lecture : un tissage crème et vert, une bordure rouille. */
export const rugTex = canvasTex(256, 256, (x) => {
  x.fillStyle = '#e9e0c8'; x.fillRect(0, 0, 256, 256)
  x.strokeStyle = '#a8553a'; x.lineWidth = 10; x.strokeRect(10, 10, 236, 236)
  x.strokeStyle = '#3f7a5e'; x.lineWidth = 4; x.strokeRect(28, 28, 200, 200)
  x.fillStyle = '#3f7a5e'
  for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(128, 70 + i * 24); x.lineTo(168, 90 + i * 24); x.lineTo(128, 110 + i * 24); x.lineTo(88, 90 + i * 24); x.closePath(); x.globalAlpha = 0.25 + i * 0.1; x.fill() }
  x.globalAlpha = 1
})

/** Une étiquette de semis : crème, un trait de crayon. */
export const labelTex = canvasTex(64, 32, (x) => {
  x.fillStyle = '#f2ead4'; x.fillRect(0, 0, 64, 32)
  x.strokeStyle = '#3a3a3a'; x.lineWidth = 2
  x.beginPath(); x.moveTo(8, 12); x.lineTo(56, 12); x.moveTo(8, 22); x.lineTo(40, 22); x.stroke()
})
