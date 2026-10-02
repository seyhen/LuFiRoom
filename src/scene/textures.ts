import { CanvasTexture } from 'three'
import { TAU } from '../math'

// Textures dessinées en canvas : parquet, fresque, poster et petits sprites.

export function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!] as const
}

function rr2d(x: CanvasRenderingContext2D, X: number, Y: number, W: number, H: number, R: number) {
  x.beginPath(); x.moveTo(X + R, Y)
  x.arcTo(X + W, Y, X + W, Y + H, R); x.arcTo(X + W, Y + H, X, Y + H, R)
  x.arcTo(X, Y + H, X, Y, R); x.arcTo(X, Y, X + W, Y, R); x.closePath()
}

// Parquet en bâtons (tiré au hasard à chaque chargement, comme le prototype).
function woodTexture() {
  const [c, x] = makeCanvas(512, 512)
  const tones = ['#ebb68d', '#e4aa82', '#efc09a', '#e7b088', '#f0c5a1']
  const rows = 11, h = 512 / rows
  for (let r = 0; r < rows; r++) {
    let px = -Math.random() * 220
    while (px < 512) {
      const w = 150 + Math.random() * 130
      x.fillStyle = tones[(Math.random() * tones.length) | 0]
      x.fillRect(px, r * h, w, h)
      x.fillStyle = 'rgba(130,70,50,.16)'
      x.fillRect(px, r * h, 2, h)
      for (let k = 0; k < 3; k++) {
        x.fillStyle = 'rgba(255,240,225,.10)'
        x.fillRect(px + 8, r * h + 6 + Math.random() * (h - 12), w - 16, 1.5)
      }
      px += w
    }
    x.fillStyle = 'rgba(130,70,50,.14)'
    x.fillRect(0, r * h, 512, 2)
  }
  const t = new CanvasTexture(c)
  t.anisotropy = 4
  return t
}

// Fresque murale : arches et arc-en-ciel pastel.
function muralTexture() {
  const [c, x] = makeCanvas(1024, 680)
  x.fillStyle = '#f4e9e2'; x.fillRect(0, 0, 1024, 680)
  x.fillStyle = '#cfe8e4'; rr2d(x, 70, 120, 118, 620, 59); x.fill()
  x.fillStyle = '#f7ccd7'; rr2d(x, 206, 220, 84, 520, 42); x.fill()
  const cx = 610, cy = 505
  for (const [r, col] of [[300, '#3aa6b6'], [246, '#f3a6bd'], [192, '#f6cf6a'], [138, '#f4e9e2']] as const) {
    x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, Math.PI, 0); x.closePath(); x.fill()
  }
  x.fillStyle = '#4b3a5a'; x.beginPath(); x.arc(890, 175, 46, 0, TAU); x.fill()
  x.fillStyle = 'rgba(75,58,90,.35)'
  for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(380 + i * 22, 100, 4, 0, TAU); x.fill() }
  return new CanvasTexture(c)
}

// Poster : soleil couchant sur la mer.
function posterTexture() {
  const [c, x] = makeCanvas(256, 320)
  x.fillStyle = '#fff6ee'; x.fillRect(0, 0, 256, 320)
  x.save(); rr2d(x, 22, 22, 212, 276, 18); x.clip()
  const g = x.createLinearGradient(0, 22, 0, 298)
  g.addColorStop(0, '#f5a9c2'); g.addColorStop(1, '#f9dc95')
  x.fillStyle = g; x.fillRect(0, 0, 256, 320)
  x.fillStyle = '#fff3d4'; x.beginPath(); x.arc(128, 168, 44, 0, TAU); x.fill()
  for (const [col, y, a] of [['#86d1d0', 206, 12], ['#43a9b7', 232, 11], ['#2f8b9a', 258, 9]] as const) {
    x.fillStyle = col; x.beginPath(); x.moveTo(0, y)
    for (let px = 0; px <= 256; px += 8) x.lineTo(px, y + Math.sin(px / 26) * a)
    x.lineTo(256, 320); x.lineTo(0, 320); x.closePath(); x.fill()
  }
  x.restore()
  return new CanvasTexture(c)
}

function spriteTex(size: number, draw: (x: CanvasRenderingContext2D) => void) {
  const [c, x] = makeCanvas(size, size)
  draw(x)
  return new CanvasTexture(c)
}

// Note de musique cerclée de blanc.
function drawNote(col: string) {
  return (x: CanvasRenderingContext2D) => {
    x.lineCap = 'round'; x.lineJoin = 'round'
    for (const pass of [0, 1]) {
      x.strokeStyle = pass ? col : '#ffffff'; x.fillStyle = pass ? col : '#ffffff'
      x.lineWidth = pass ? 5 : 11
      x.beginPath(); x.ellipse(24, 46, pass ? 10 : 13, pass ? 7.5 : 10.5, -0.4, 0, TAU); x.fill()
      x.beginPath(); x.moveTo(33, 44); x.lineTo(33, 12); x.quadraticCurveTo(44, 17, 50, 29); x.stroke()
    }
  }
}

export const woodTex = woodTexture()
export const muralTex = muralTexture()
export const posterTex = posterTexture()
export const noteTexA = spriteTex(64, drawNote('#178f99'))
export const noteTexB = spriteTex(64, drawNote('#e46f9b'))
export const heartTex = spriteTex(64, (x) => {
  const heart = () => {
    x.beginPath(); x.moveTo(32, 52)
    x.bezierCurveTo(10, 38, 8, 20, 22, 16); x.bezierCurveTo(28, 14, 32, 19, 32, 24)
    x.bezierCurveTo(32, 19, 36, 14, 42, 16); x.bezierCurveTo(56, 20, 54, 38, 32, 52); x.closePath()
  }
  x.lineWidth = 7; x.strokeStyle = '#fff'; heart(); x.stroke()
  x.fillStyle = '#f2779f'; heart(); x.fill()
})
export const puffTex = spriteTex(64, (x) => {
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 30)
  g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, 64, 64)
})
export const glowTex = spriteTex(128, (x) => {
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 62)
  g.addColorStop(0, 'rgba(255,205,140,.9)'); g.addColorStop(0.35, 'rgba(255,180,110,.35)'); g.addColorStop(1, 'rgba(255,170,100,0)')
  x.fillStyle = g; x.fillRect(0, 0, 128, 128)
})
export const shadowTex = spriteTex(256, (x) => {
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 126)
  g.addColorStop(0, 'rgba(70,45,110,.5)'); g.addColorStop(0.55, 'rgba(70,45,110,.22)'); g.addColorStop(1, 'rgba(70,45,110,0)')
  x.fillStyle = g; x.fillRect(0, 0, 256, 256)
})
