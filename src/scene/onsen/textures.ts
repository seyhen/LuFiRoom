import { TAU } from '../../math'
import { canvasTex, rr, seeded } from '../paint'

// Textures de l'onsen : dallage de pierre et sa mousse, papier des shōji, yukata indigo, feuille d'érable, ronds dans l'eau.

/** Dallage de pierres plates, joints de mousse. Tuile 1 × 1 unité. */
export const flagTex = canvasTex(256, 256, (x) => {
  const r = seeded(6)
  x.fillStyle = '#5e7046'; x.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 9; i++) {
    const cx = (i % 3) * 85 + 42 + (r() - 0.5) * 16, cy = ((i / 3) | 0) * 85 + 42 + (r() - 0.5) * 16, rad = 34 + r() * 8
    const t = r()
    x.fillStyle = `rgb(${120 + t * 30},${118 + t * 28},${112 + t * 26})`
    x.beginPath()
    for (let k = 0; k < 9; k++) { const a = (k / 9) * TAU, rk = rad * (0.82 + r() * 0.25); x.lineTo(cx + Math.cos(a) * rk, cy + Math.sin(a) * rk) }
    x.closePath(); x.fill()
    x.fillStyle = 'rgba(255,255,255,.08)'; x.beginPath(); x.ellipse(cx - 8, cy - 8, rad * 0.5, rad * 0.35, 0, 0, TAU); x.fill()
  }
  for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '40,50,30' : '200,200,190'},.12)`; x.fillRect(r() * 256, r() * 256, 2, 2) }
}, [1, 1])

/** Shōji : papier washi tendu sur une grille de bois clair. Tuile : un panneau. */
export const shojiTex = canvasTex(128, 256, (x) => {
  x.fillStyle = '#f7f0df'; x.fillRect(0, 0, 128, 256)
  for (let i = 0; i < 300; i++) { x.fillStyle = 'rgba(200,180,150,.08)'; x.fillRect(Math.random() * 128, Math.random() * 256, 1, 6) }
  x.fillStyle = '#b08a5e'
  for (let i = 0; i <= 3; i++) x.fillRect(i * 41 + (i === 3 ? -6 : 0), 0, 6, 256)
  for (let j = 0; j <= 6; j++) x.fillRect(0, j * 41.6 + (j === 6 ? -6 : 0), 128, 6)
  x.fillStyle = '#8a6a44'; x.fillRect(0, 214, 128, 42)
})

/** Yukata de coton indigo, motif de vagues et de points blancs. */
export const yukataTex = canvasTex(128, 128, (x) => {
  x.fillStyle = '#2f3f6e'; x.fillRect(0, 0, 128, 128)
  x.strokeStyle = 'rgba(240,240,250,.75)'; x.lineWidth = 2.5
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
    const cx = i * 32 + (j % 2) * 16, cy = j * 32 + 20
    for (const rad of [12, 7]) { x.beginPath(); x.arc(cx, cy, rad, Math.PI, 0); x.stroke() }
  }
}, [1.5, 1.5])

/** Une feuille d'érable rouge, pour celles qui tombent. */
export const leafTex = canvasTex(64, 64, (x) => {
  x.translate(32, 34)
  x.fillStyle = '#e04a2a'
  x.beginPath()
  for (let k = 0; k <= 10; k++) {
    const a = -Math.PI / 2 + (k / 10) * TAU, rad = k % 2 ? 11 : 26
    x.lineTo(Math.cos(a) * rad, Math.sin(a) * rad)
  }
  x.closePath(); x.fill()
  x.strokeStyle = '#a82e1a'; x.lineWidth = 1.5
  for (const a of [-Math.PI / 2, -0.2, -2.9, 0.6, -3.7]) { x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * 20, Math.sin(a) * 20); x.stroke() }
  x.fillStyle = '#7a3a1a'; x.fillRect(-1, 2, 2, 12)
})

/** Des ronds dans l'eau, qui se répètent : on les fait glisser lentement sur le bassin. */
export const rippleTex = canvasTex(256, 256, (x) => {
  const r = seeded(12)
  for (let i = 0; i < 14; i++) {
    const cx = r() * 256, cy = r() * 256
    for (let k = 1; k <= 3; k++) {
      x.strokeStyle = `rgba(255,255,255,${0.32 / k})`; x.lineWidth = 2
      x.beginPath(); x.ellipse(cx, cy, 8 * k + r() * 4, 6 * k + r() * 3, 0, 0, TAU); x.stroke()
    }
  }
  for (let i = 0; i < 50; i++) { x.fillStyle = 'rgba(255,255,255,.18)'; rr(x, r() * 256, r() * 256, 10 + r() * 20, 2, 1); x.fill() }
}, [2.5, 2.5])

/** Tuiles grises du petit toit, en rangs. */
export const tileTex = canvasTex(128, 128, (x) => {
  x.fillStyle = '#3c3c46'; x.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#4a4a56' : '#34343e'; x.fillRect(i * 16, 0, 12, 128); x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(i * 16 + 2, 0, 2, 128) }
}, [6, 1])
