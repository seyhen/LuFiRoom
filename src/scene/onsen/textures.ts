import { TAU } from '../../math'
import { canvasTex, rr, seeded } from '../paint'

// Textures de l'onsen : dallage de pierre et sa mousse, papier des shōji, yukata indigo, feuille d'érable, ronds dans l'eau.

/**
 * Dallage de pierres plates posées à la main (pavage de Voronoï qui se raccorde d'une tuile à l'autre) : des dalles de tailles
 * et de teintes différentes, bombées (claires au milieu, plus sombres vers le bord), et de la mousse dans les joints. Tuile 1 × 1 unité.
 */
export const flagTex = canvasTex(256, 256, (x) => {
  const r = seeded(6), N = 4, S = 256, cell = S / N
  const pts: { x: number; y: number; c: [number, number, number] }[] = []
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const t = r(), warm = r() < 0.4
    pts.push({ x: (i + 0.15 + r() * 0.7) * cell, y: (j + 0.15 + r() * 0.7) * cell, c: [150 + t * 34 + (warm ? 10 : 0), 146 + t * 32 + (warm ? 4 : 0), 138 + t * 30 - (warm ? 4 : 0)] })
  }
  const img = x.createImageData(S, S), d = img.data, noise = seeded(9)
  for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
    let d1 = 1e9, d2 = 1e9, best = 0
    const ci = Math.floor(px / cell), cj = Math.floor(py / cell)
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const ii = (ci + di + N) % N, jj = (cj + dj + N) % N, q = pts[jj * N + ii]
      const qx = q.x + Math.floor((ci + di) / N) * S, qy = q.y + Math.floor((cj + dj) / N) * S
      const dd = Math.hypot(px - qx, py - qy)
      if (dd < d1) { d2 = d1; d1 = dd; best = jj * N + ii } else if (dd < d2) d2 = dd
    }
    const gap = (d2 - d1) / 2, o = (py * S + px) * 4, n = noise()
    if (gap < 3.2) {
      // le joint de mousse, plus sombre au fond
      const k = 0.75 + gap / 12 + n * 0.12
      d[o] = 88 * k; d[o + 1] = 112 * k; d[o + 2] = 62 * k
    } else {
      const c = pts[best].c, bevel = Math.min(1, (gap - 3.2) / 9), dome = 0.84 + bevel * 0.12 - Math.min(0.05, d1 / 900) + (n - 0.5) * 0.07
      d[o] = c[0] * dome; d[o + 1] = c[1] * dome; d[o + 2] = c[2] * dome
    }
    d[o + 3] = 255
  }
  x.putImageData(img, 0, 0)
  // un peu de lichen et de mousse qui déborde sur les dalles
  for (let i = 0; i < 70; i++) {
    x.fillStyle = r() < 0.6 ? 'rgba(96,124,64,.35)' : 'rgba(210,214,170,.3)'
    x.beginPath(); x.arc(r() * S, r() * S, 1 + r() * 3, 0, TAU); x.fill()
  }
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

/** L'eau du bassin vue d'en haut : laiteuse au milieu, plus profonde et plus sombre sous les rochers du bord. */
export const poolTex = canvasTex(256, 256, (x) => {
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, '#c4f0e6'); g.addColorStop(0.55, '#a6e2d8'); g.addColorStop(0.82, '#78c4c0'); g.addColorStop(0.94, '#4f9a9c'); g.addColorStop(1, '#3a7a80')
  x.fillStyle = g; x.fillRect(0, 0, 256, 256)
})
