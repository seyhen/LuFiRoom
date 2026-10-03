import { CanvasTexture, RepeatWrapping } from 'three'
import { makeCanvas } from '../textures'

// Textures de la cabane, dessinées en canvas : lames de bois des murs et du sol.

/** Une lame verticale : ton, joint sombre à gauche, quelques veines. */
function plank(x: CanvasRenderingContext2D, X: number, W: number, H: number, tone: string) {
  x.fillStyle = tone
  x.fillRect(X, 0, W, H)
  x.fillStyle = 'rgba(95,55,38,.28)'
  x.fillRect(X, 0, 3, H)
  for (let k = 0; k < 5; k++) {
    x.fillStyle = 'rgba(255,238,215,.10)'
    x.fillRect(X + 12 + Math.random() * (W - 26), 0, 1.5, H)
  }
  x.fillStyle = 'rgba(110,64,44,.10)'
  for (let k = 0; k < 2; k++) x.fillRect(X + 10 + Math.random() * (W - 24), Math.random() * H, 2, 30 + Math.random() * 90)
}

/** Murs : trois lames de bois clair, qui couvrent 1.35 unité (la texture se répète). */
function wallTexture() {
  const [c, x] = makeCanvas(540, 540)
  for (const [i, tone] of ['#e0b48c', '#d7a67c', '#e4ba94'].entries()) plank(x, i * 180, 180, 540, tone)
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(1 / 1.35, 1 / 1.35)
  t.anisotropy = 4
  return t
}

/** Sol : huit larges lames dans le sens de la pièce, un peu plus sombres que les murs. */
function floorTexture() {
  const [c, x] = makeCanvas(512, 512)
  const tones = ['#b98558', '#c08e62', '#b17c50', '#c6956a']
  const rows = 8, h = 512 / rows
  for (let r = 0; r < rows; r++) {
    let px = -Math.random() * 200
    while (px < 512) {
      const w = 200 + Math.random() * 160
      x.fillStyle = tones[(Math.random() * tones.length) | 0]
      x.fillRect(px, r * h, w, h)
      x.fillStyle = 'rgba(70,38,26,.22)'
      x.fillRect(px, r * h, 2, h)
      for (let k = 0; k < 3; k++) {
        x.fillStyle = 'rgba(255,230,205,.10)'
        x.fillRect(px + 8, r * h + 8 + Math.random() * (h - 16), w - 16, 1.5)
      }
      px += w
    }
    x.fillStyle = 'rgba(70,38,26,.2)'
    x.fillRect(0, r * h, 512, 2)
  }
  const t = new CanvasTexture(c)
  t.anisotropy = 4
  return t
}

export const wallTex = wallTexture()
export const floorTex = floorTexture()

// ── Le chalet de rondins (2e version) ──────────────────────────────────────────────────────────────────────────────────

/**
 * Rondins horizontaux : chaque rang est arrondi (clair au milieu, sombre en haut et en bas), séparé du suivant par un
 * joint de calfeutrage clair. Tuile : 1 unité de large, 4.4 de haut (15 rangs).
 */
export const logWallTex = (() => {
  const [c, x] = makeCanvas(256, 1126)
  const rows = 15, h = 1126 / rows
  for (let i = 0; i < rows; i++) {
    const y = i * h, t = Math.random()
    const g = x.createLinearGradient(0, y, 0, y + h)
    g.addColorStop(0, '#6e4630'); g.addColorStop(0.18, `rgb(${178 + t * 18},${120 + t * 12},${80 + t * 8})`)
    g.addColorStop(0.55, `rgb(${196 + t * 16},${140 + t * 12},${96 + t * 8})`); g.addColorStop(0.9, '#7a4e34'); g.addColorStop(1, '#5a3824')
    x.fillStyle = g; x.fillRect(0, y, 256, h)
    x.strokeStyle = 'rgba(90,55,35,.22)'; x.lineWidth = 1.2
    for (let k = 0; k < 4; k++) { const yy = y + h * (0.3 + Math.random() * 0.45); x.beginPath(); x.moveTo(0, yy); x.bezierCurveTo(90, yy + 2, 170, yy - 2, 256, yy); x.stroke() }
    if (Math.random() < 0.5) { x.fillStyle = 'rgba(80,45,28,.35)'; x.beginPath(); x.ellipse(Math.random() * 256, y + h / 2, 7, 4, 0, 0, Math.PI * 2); x.fill() }
    x.fillStyle = '#e9dcc4'; x.fillRect(0, y + h - 5, 256, 5)
  }
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.anisotropy = 4
  return t
})()

/** Pierres de rivière rondes, jointes au mortier : la cheminée. Tuile 1 × 1 unité. */
export const riverStoneTex = (() => {
  const [c, x] = makeCanvas(256, 256)
  x.fillStyle = '#d8ccb6'; x.fillRect(0, 0, 256, 256)
  const tones = ['#9a8a78', '#b09c84', '#857868', '#c0ad92', '#a08e78', '#7a6c60']
  for (let j = 0; j < 6; j++) for (let i = 0; i < 5; i++) {
    const cx = i * 52 + (j % 2) * 26 + (Math.random() - 0.5) * 8, cy = j * 44 + 22 + (Math.random() - 0.5) * 6
    const rx = 20 + Math.random() * 6, ry = 16 + Math.random() * 5
    for (const dx of [0, -256, 256]) {
      x.fillStyle = tones[(Math.random() * tones.length) | 0]
      x.beginPath(); x.ellipse(cx + dx, cy, rx, ry, (Math.random() - 0.5) * 0.4, 0, Math.PI * 2); x.fill()
      x.fillStyle = 'rgba(255,255,255,.14)'; x.beginPath(); x.ellipse(cx + dx - 5, cy - 5, rx * 0.5, ry * 0.4, 0, 0, Math.PI * 2); x.fill()
    }
  }
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  return t
})()

/** Carreaux « buffalo » rouge et noir du tapis et du plaid. */
export const buffaloTex = (() => {
  const [c, x] = makeCanvas(128, 128)
  x.fillStyle = '#b8322e'; x.fillRect(0, 0, 128, 128)
  x.fillStyle = 'rgba(30,18,20,.55)'; x.fillRect(0, 0, 64, 128); x.fillRect(0, 0, 128, 64)
  x.fillStyle = 'rgba(30,18,20,.35)'; x.fillRect(0, 0, 64, 64)
  for (let i = 0; i < 128; i += 3) { x.fillStyle = 'rgba(0,0,0,.06)'; x.fillRect(i, 0, 1, 128) }
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  return t
})()
