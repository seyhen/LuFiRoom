import { CanvasTexture, RepeatWrapping } from 'three'
import { makeCanvas } from '../textures'

// Textures de la cabane, dessinées en canvas : lames de bois des murs et du sol, braise.

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

/** Braise qui s'envole : un point orange à cœur clair. */
function emberTexture() {
  const [c, x] = makeCanvas(32, 32)
  const g = x.createRadialGradient(16, 16, 0, 16, 16, 15)
  g.addColorStop(0, 'rgba(255,240,190,1)'); g.addColorStop(0.35, 'rgba(255,160,70,.9)'); g.addColorStop(1, 'rgba(255,110,40,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 32, 32)
  return new CanvasTexture(c)
}

export const wallTex = wallTexture()
export const floorTex = floorTexture()
export const emberTex = emberTexture()
