import { CanvasTexture, RepeatWrapping } from 'three'
import { TAU, seeded } from '../../math'
import { makeCanvas } from '../textures'

// Textures de la chambre, dessinées en canvas : murs (papier peint, boiseries, fresque), parquet, couette, tapis, écran du portable,
// cadres, polaroïds, guirlande de lunes, lumière de la fenêtre, gouttes sur la vitre. Tout est tiré au sort avec une graine : le décor est le même à chaque visite.

const WALL_W = 6.54, WALL_H = 4.35
const CW = 1024, CH = 680 // un mur entier : 1024 × 680 pour 6.54 × 4.35 unités
const PX = CW / WALL_W
/** Hauteur des boiseries, en unités. */
const RAIL = 1.05

const MINT = '#bfe7da', CREAM = '#fff8f0'

function tiled(c: HTMLCanvasElement, rx = 1, ry = 1) {
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(rx, ry)
  t.anisotropy = 4
  return t
}

/** Étoile à `n` branches, `R` au bout, `r` au creux. */
function starPath(x: CanvasRenderingContext2D, cx: number, cy: number, R: number, r: number, n = 5) {
  x.beginPath()
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n, d = i % 2 ? r : R
    x.lineTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d)
  }
  x.closePath()
}

/** Boiseries menthe (rainures, lisse crème) et plinthe, au bas d'un mur de 1024 × 680. */
function wainscot(x: CanvasRenderingContext2D) {
  const top = CH - RAIL * PX
  x.fillStyle = MINT
  x.fillRect(0, top, CW, CH - top)
  for (let X = 10; X < CW; X += PX * 0.2) {
    x.fillStyle = 'rgba(70,150,125,.30)'
    x.fillRect(X, top + 14, 2.5, CH - top)
    x.fillStyle = 'rgba(255,255,255,.42)'
    x.fillRect(X + 2.5, top + 14, 1.5, CH - top)
  }
  x.fillStyle = 'rgba(110,80,140,.22)'
  x.fillRect(0, top + 14, CW, 6)
  x.fillStyle = CREAM
  x.fillRect(0, top - 5, CW, 19)
  x.fillStyle = 'rgba(255,255,255,.95)'
  x.fillRect(0, top - 5, CW, 4)
  const bh = 0.17 * PX
  x.fillStyle = CREAM
  x.fillRect(0, CH - bh, CW, bh)
  x.fillStyle = 'rgba(110,80,140,.28)'
  x.fillRect(0, CH - bh, CW, 3)
}

/** Mur du fond (la texture couvre le mur entier, voir `backWall`) : lilas semé d'étoiles, boiseries menthe. */
function wallBackTexture() {
  const [c, x] = makeCanvas(CW, CH)
  const rnd = seeded(5)
  const g = x.createLinearGradient(0, 0, 0, CH)
  g.addColorStop(0, '#dccfee'); g.addColorStop(1, '#eae0f5')
  x.fillStyle = g
  x.fillRect(0, 0, CW, CH)
  for (let i = 0; i < 130; i++) {
    const X = rnd() * CW, Y = rnd() * (CH - RAIL * PX - 24), r = 1.6 + rnd() * 2.6
    x.fillStyle = i % 4 ? 'rgba(255,255,255,.6)' : 'rgba(190,164,226,.6)'
    if (i % 3 === 0) {
      starPath(x, X, Y, r * 1.9, r * 0.8)
      x.fill()
    } else {
      x.beginPath(); x.arc(X, Y, r * 0.7, 0, TAU); x.fill()
    }
  }
  wainscot(x)
  const t = new CanvasTexture(c)
  t.repeat.set(1 / WALL_W, 1 / WALL_H)
  t.offset.set(3.34 / WALL_W, 0.05 / WALL_H)
  t.anisotropy = 4
  return t
}

/** Mur de gauche : arches et arc-en-ciel pastel, lune peinte, étoiles, boiseries. */
function muralTexture() {
  const [c, x] = makeCanvas(CW, CH)
  const rnd = seeded(8)
  x.fillStyle = '#f6e9e3'
  x.fillRect(0, 0, CW, CH)
  const wash = x.createRadialGradient(610, 430, 20, 610, 430, 460)
  wash.addColorStop(0, 'rgba(255,250,243,.85)'); wash.addColorStop(1, 'rgba(255,250,243,0)')
  x.fillStyle = wash
  x.fillRect(0, 0, CW, CH)
  const arch = (X: number, Y: number, W: number, H: number, col: string) => {
    x.fillStyle = col
    x.beginPath(); x.roundRect(X, Y, W, H, [W / 2, W / 2, 0, 0]); x.fill()
  }
  arch(70, 120, 118, 620, '#cfe8e4')
  arch(206, 220, 84, 520, '#f7ccd7')
  arch(308, 330, 56, 410, '#fbe9b8')
  const cx = 610, cy = 505
  for (const [r, col] of [[300, '#3aa6b6'], [246, '#f3a6bd'], [192, '#f6cf6a'], [138, '#f6e9e3']] as const) {
    x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, Math.PI, 0); x.closePath(); x.fill()
  }
  // lune peinte : un croissant crème
  x.fillStyle = '#fbefc4'; x.beginPath(); x.arc(890, 170, 48, 0, TAU); x.fill()
  x.fillStyle = '#f6e9e3'; x.beginPath(); x.arc(912, 158, 42, 0, TAU); x.fill()
  // quelques étoiles peintes autour
  for (const [X, Y, R, col] of [[800, 110, 14, '#f3a6bd'], [960, 262, 11, '#3aa6b6'], [770, 240, 9, '#f6cf6a'], [410, 90, 12, '#f6cf6a'], [330, 205, 8, '#f3a6bd'], [500, 150, 9, '#3aa6b6']] as const) {
    x.fillStyle = col
    starPath(x, X, Y, R, R * 0.45)
    x.fill()
  }
  for (let i = 0; i < 6; i++) {
    x.fillStyle = 'rgba(75,58,90,.3)'
    x.beginPath(); x.arc(560 + i * 22, 80 + rnd() * 10, 4, 0, TAU); x.fill()
  }
  wainscot(x)
  return new CanvasTexture(c)
}

/** Étoiles qui brillent dans le noir sur le mur de gauche (texture d'émission : noir ailleurs). */
function starGlowTexture() {
  const [c, x] = makeCanvas(CW, CH)
  x.fillStyle = '#000'
  x.fillRect(0, 0, CW, CH)
  const stars = [[150, 70, 11], [245, 135, 7], [330, 48, 8], [452, 120, 6], [560, 55, 9], [690, 82, 6], [815, 150, 10], [930, 70, 8], [965, 330, 7], [880, 395, 5], [86, 330, 7], [455, 300, 5], [690, 200, 6]]
  for (const [X, Y, r] of stars) {
    const g = x.createRadialGradient(X, Y, 0, X, Y, r * 3.2)
    g.addColorStop(0, 'rgba(255,248,170,.55)'); g.addColorStop(1, 'rgba(255,248,170,0)')
    x.fillStyle = g
    x.fillRect(X - r * 3.2, Y - r * 3.2, r * 6.4, r * 6.4)
    x.fillStyle = '#fffbd8'
    starPath(x, X, Y, r * 1.5, r * 0.42, 4)
    x.fill()
  }
  return new CanvasTexture(c)
}

/** Parquet clair, lames de 0.3 sur 1 à 2 unités (une tuile : 2.4 unités, voir `worldUV`). */
function floorTexture() {
  const [c, x] = makeCanvas(512, 512)
  const rnd = seeded(21)
  const tones = ['#f4d6bd', '#f0ccb1', '#f8ddc8', '#edc6aa', '#f2d1b5']
  const rows = 8, h = 512 / rows
  for (let r = 0; r < rows; r++) {
    let px = -rnd() * 240
    while (px < 512) {
      const w = 190 + rnd() * 190
      const tone = tones[(rnd() * tones.length) | 0]
      for (const X of [px, px - 512]) {
        x.fillStyle = tone
        x.fillRect(X, r * h, w, h)
        const g = x.createLinearGradient(0, r * h, 0, (r + 1) * h)
        g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(150,90,70,.10)')
        x.fillStyle = g
        x.fillRect(X, r * h, w, h)
        x.fillStyle = 'rgba(150,100,85,.30)'
        x.fillRect(X, r * h, 2.5, h)
        for (let k = 0; k < 4; k++) {
          x.fillStyle = k % 2 ? 'rgba(255,255,255,.22)' : 'rgba(170,110,90,.12)'
          x.fillRect(X + 6 + rnd() * 20, r * h + 6 + rnd() * (h - 12), w * (0.3 + rnd() * 0.6), 1.6)
        }
      }
      px += w
    }
    x.fillStyle = 'rgba(150,100,85,.28)'
    x.fillRect(0, r * h, 512, 2.5)
  }
  return tiled(c)
}

/** Couette matelassée menthe : losanges piqués, chaque losange légèrement gonflé, une étoile crème par deux (tuile de 1.8). */
function quiltTexture() {
  const [c, x] = makeCanvas(512, 512)
  x.fillStyle = '#a9e1d1'
  x.fillRect(0, 0, 512, 512)
  for (let n = -2; n <= 17; n++) {
    for (let m = -2; m <= 17; m++) {
      if ((m + n) % 2 === 0) continue
      const X = m * 32, Y = n * 32
      const g = x.createRadialGradient(X, Y, 2, X, Y, 34)
      g.addColorStop(0, 'rgba(255,255,255,.42)'); g.addColorStop(0.6, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(60,140,120,.20)')
      x.fillStyle = g
      x.beginPath(); x.moveTo(X - 32, Y); x.lineTo(X, Y - 32); x.lineTo(X + 32, Y); x.lineTo(X, Y + 32); x.closePath(); x.fill()
      if ((m + 2 * n) % 4 === 1) {
        x.fillStyle = 'rgba(255,248,235,.9)'
        starPath(x, X, Y, 7, 3)
        x.fill()
      }
    }
  }
  x.strokeStyle = '#effcf7'; x.lineWidth = 2.4; x.setLineDash([9, 6])
  for (let k = -8; k <= 16; k++) {
    x.beginPath(); x.moveTo(k * 64, 0); x.lineTo(k * 64 + 512, 512); x.stroke()
    x.beginPath(); x.moveTo(k * 64, 0); x.lineTo(k * 64 - 512, 512); x.stroke()
  }
  return tiled(c)
}

// Le tapis nuage : un galet aux bords ondulés, `a` sur x et `b` sur z. Le contour sert aussi à la texture.
export const RUG = { a: 1.95, b: 1.45 }
export const rugR = (t: number) => 1 + 0.07 * Math.sin(3 * t + 0.6) + 0.045 * Math.sin(5 * t + 2.1) + 0.03 * Math.sin(2 * t + 1.3)
/** Zone que couvre la texture du tapis (centrée sur lui), en unités. */
export const RUG_BOX = { w: RUG.a * 2 * 1.16, h: RUG.b * 2 * 1.16 }

function rugTexture() {
  const W = 1024, H = Math.round(W * (RUG_BOX.h / RUG_BOX.w)), s = W / RUG_BOX.w
  const [c, x] = makeCanvas(W, H)
  const rnd = seeded(33)
  const blob = (k: number) => {
    x.beginPath()
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * TAU, r = rugR(t) * k
      const X = W / 2 + Math.cos(t) * RUG.a * r * s, Y = H / 2 - Math.sin(t) * RUG.b * r * s
      i ? x.lineTo(X, Y) : x.moveTo(X, Y)
    }
    x.closePath()
  }
  x.fillStyle = '#c8b6ee'; blob(1.01); x.fill()
  x.fillStyle = '#fff3e9'; blob(0.955); x.fill()
  x.strokeStyle = '#a9ddd0'; x.lineWidth = 0.09 * s
  blob(0.88); x.stroke()
  x.strokeStyle = '#f3b9cb'; x.lineWidth = 0.025 * s; x.setLineDash([0.07 * s, 0.07 * s])
  blob(0.79); x.stroke(); x.setLineDash([])
  // gouttes de pluie semées au milieu
  const drop = (X: number, Y: number, r: number, col: string) => {
    x.fillStyle = col
    x.beginPath(); x.arc(X, Y + r * 0.4, r, 0, TAU); x.fill()
    x.beginPath(); x.moveTo(X - r * 0.92, Y + r * 0.1); x.lineTo(X, Y - r * 1.7); x.lineTo(X + r * 0.92, Y + r * 0.1); x.closePath(); x.fill()
  }
  const cols = ['#b9c4f4', '#f6b9cc', '#a9ddd0', '#fbe2a0']
  for (let i = 0; i < 70; i++) {
    const a = rnd() * TAU, d = Math.sqrt(rnd()) * 0.7
    const X = W / 2 + Math.cos(a) * d * RUG.a * rugR(a) * s, Y = H / 2 - Math.sin(a) * d * RUG.b * rugR(a) * s
    drop(X, Y, (0.034 + rnd() * 0.02) * s, cols[i % 4])
  }
  const t = new CanvasTexture(c)
  t.repeat.set(1 / RUG_BOX.w, 1 / RUG_BOX.h)
  t.offset.set(0.5, 0.5)
  t.anisotropy = 4
  return t
}

/** Écran du portable : une page « radio lofi » (soleil couchant sur les collines, une barre de lecture). */
function screenTexture() {
  const [c, x] = makeCanvas(256, 170)
  x.fillStyle = '#2f2a55'
  x.fillRect(0, 0, 256, 170)
  x.fillStyle = '#e9e2f7'
  x.fillRect(0, 0, 256, 16)
  for (const [i, col] of ['#f3a6bd', '#f6cf6a', '#8fd8c6'].entries()) {
    x.fillStyle = col; x.beginPath(); x.arc(11 + i * 12, 8, 3.4, 0, TAU); x.fill()
  }
  const g = x.createLinearGradient(0, 16, 0, 140)
  g.addColorStop(0, '#6a5bb8'); g.addColorStop(0.55, '#e58fb3'); g.addColorStop(1, '#fbd48b')
  x.fillStyle = g
  x.fillRect(0, 16, 256, 124)
  x.fillStyle = '#fff1c9'
  x.beginPath(); x.arc(170, 98, 26, 0, TAU); x.fill()
  x.fillStyle = '#5b4a99'
  x.beginPath(); x.ellipse(60, 150, 120, 36, 0, 0, TAU); x.fill()
  x.fillStyle = '#44377d'
  x.beginPath(); x.ellipse(200, 156, 110, 34, 0, 0, TAU); x.fill()
  x.fillStyle = '#f7f2ff'
  x.fillRect(0, 140, 256, 30)
  x.fillStyle = '#d6cdee'
  x.beginPath(); x.roundRect(14, 152, 228, 6, 3); x.fill()
  x.fillStyle = '#e46f9b'
  x.beginPath(); x.roundRect(14, 152, 84, 6, 3); x.fill()
  x.beginPath(); x.arc(98, 155, 6, 0, TAU); x.fill()
  return new CanvasTexture(c)
}

/** Clavier : rangées de touches arrondies sur un fond lilas. */
function keysTexture() {
  const [c, x] = makeCanvas(256, 160)
  x.fillStyle = '#b9aedd'
  x.fillRect(0, 0, 256, 160)
  x.fillStyle = '#eee8fb'
  for (let r = 0; r < 5; r++) {
    for (let k = 0; k < 14; k++) {
      x.beginPath(); x.roundRect(10 + k * 16.6, 10 + r * 19, 14, 15, 3); x.fill()
    }
  }
  x.fillStyle = '#d3caee'
  x.beginPath(); x.roundRect(70, 108, 116, 16, 3); x.fill()
  x.fillStyle = '#c7bde8'
  x.beginPath(); x.roundRect(86, 128, 84, 24, 6); x.fill()
  return new CanvasTexture(c)
}

/** Cahier ouvert : lignes bleues, une marge rose, un titre et un cœur. */
function notebookTexture() {
  const [c, x] = makeCanvas(256, 192)
  x.fillStyle = '#fffaf1'
  x.fillRect(0, 0, 256, 192)
  x.strokeStyle = '#b9d2ee'; x.lineWidth = 1.5
  for (let y = 40; y < 190; y += 17) { x.beginPath(); x.moveTo(8, y); x.lineTo(120, y); x.moveTo(136, y); x.lineTo(248, y); x.stroke() }
  x.strokeStyle = '#f3a6bd'; x.lineWidth = 2
  x.beginPath(); x.moveTo(22, 0); x.lineTo(22, 192); x.moveTo(150, 0); x.lineTo(150, 192); x.stroke()
  x.fillStyle = '#8b7fc7'
  x.beginPath(); x.roundRect(30, 14, 70, 7, 3); x.fill()
  x.fillStyle = '#c9c2e6'
  for (const [X, Y, W] of [[30, 56, 80], [30, 73, 62], [30, 90, 74], [158, 56, 72], [158, 73, 84]]) { x.beginPath(); x.roundRect(X, Y, W, 4, 2); x.fill() }
  x.fillStyle = '#f2779f'
  x.beginPath(); x.moveTo(190, 150); x.bezierCurveTo(168, 136, 166, 118, 180, 114); x.bezierCurveTo(186, 112, 190, 117, 190, 122)
  x.bezierCurveTo(190, 117, 194, 112, 200, 114); x.bezierCurveTo(214, 118, 212, 136, 190, 150); x.fill()
  x.fillStyle = 'rgba(120,100,170,.18)'
  x.fillRect(124, 0, 8, 192)
  return new CanvasTexture(c)
}

/** Trois tirages encadrés : coucher de soleil, lune, feuille. Une affiche de 256 × 320. */
function printTexture(kind: 'moon' | 'leaf' | 'sunset') {
  const [c, x] = makeCanvas(256, 320)
  x.fillStyle = '#fff6ee'
  x.fillRect(0, 0, 256, 320)
  x.save()
  x.beginPath(); x.roundRect(22, 22, 212, 276, 18); x.clip()
  if (kind === 'sunset') {
    const g = x.createLinearGradient(0, 22, 0, 298)
    g.addColorStop(0, '#f5a9c2'); g.addColorStop(1, '#f9dc95')
    x.fillStyle = g; x.fillRect(0, 0, 256, 320)
    x.fillStyle = '#fff3d4'; x.beginPath(); x.arc(128, 168, 44, 0, TAU); x.fill()
    for (const [col, y, a] of [['#86d1d0', 206, 12], ['#43a9b7', 232, 11], ['#2f8b9a', 258, 9]] as const) {
      x.fillStyle = col; x.beginPath(); x.moveTo(0, y)
      for (let px = 0; px <= 256; px += 8) x.lineTo(px, y + Math.sin(px / 26) * a)
      x.lineTo(256, 320); x.lineTo(0, 320); x.closePath(); x.fill()
    }
  } else if (kind === 'moon') {
    const g = x.createLinearGradient(0, 22, 0, 298)
    g.addColorStop(0, '#2d2a63'); g.addColorStop(1, '#5a4a9a')
    x.fillStyle = g; x.fillRect(0, 0, 256, 320)
    x.fillStyle = '#fbefc4'; x.beginPath(); x.arc(128, 150, 54, 0, TAU); x.fill()
    x.fillStyle = '#3d3680'; x.beginPath(); x.arc(150, 136, 48, 0, TAU); x.fill()
    x.fillStyle = '#fff6d8'
    for (const [X, Y, R] of [[60, 70, 9], [200, 90, 7], [76, 240, 6], [186, 250, 8], [210, 190, 5]]) { starPath(x, X, Y, R, R * 0.4); x.fill() }
  } else {
    x.fillStyle = '#d7efe4'; x.fillRect(0, 0, 256, 320)
    x.fillStyle = '#5fb596'
    x.beginPath(); x.moveTo(128, 270); x.bezierCurveTo(40, 240, 40, 110, 128, 60); x.bezierCurveTo(216, 110, 216, 240, 128, 270); x.fill()
    x.strokeStyle = '#d7efe4'; x.lineWidth = 5; x.lineCap = 'round'
    x.beginPath(); x.moveTo(128, 266); x.lineTo(128, 90)
    for (let i = 0; i < 4; i++) { x.moveTo(128, 210 - i * 34); x.lineTo(84 + i * 6, 180 - i * 34); x.moveTo(128, 210 - i * 34); x.lineTo(172 - i * 6, 180 - i * 34) }
    x.stroke()
  }
  x.restore()
  return new CanvasTexture(c)
}

/** Fil de polaroïds : un fil qui s'affaisse, sept photos de travers tenues par des pinces en bois (fond transparent). */
function polaroidsTexture() {
  const [c, x] = makeCanvas(1024, 256)
  const rnd = seeded(77)
  const wireY = (t: number) => 22 + Math.sin(Math.PI * t) * 34
  x.strokeStyle = '#6b5a82'; x.lineWidth = 3
  x.beginPath()
  for (let i = 0; i <= 60; i++) { const t = i / 60; i ? x.lineTo(8 + t * 1008, wireY(t)) : x.moveTo(8, wireY(0)) }
  x.stroke()
  const photos: ((px: number, py: number, w: number, h: number) => void)[] = [
    (px, py, w, h) => { const g = x.createLinearGradient(0, py, 0, py + h); g.addColorStop(0, '#f5a9c2'); g.addColorStop(1, '#f9dc95'); x.fillStyle = g; x.fillRect(px, py, w, h); x.fillStyle = '#fff3d4'; x.beginPath(); x.arc(px + w / 2, py + h * 0.62, w * 0.2, 0, TAU); x.fill() },
    (px, py, w, h) => { x.fillStyle = '#bfe3f2'; x.fillRect(px, py, w, h); x.fillStyle = '#7fc4a6'; x.beginPath(); x.moveTo(px, py + h); x.lineTo(px + w * 0.35, py + h * 0.35); x.lineTo(px + w * 0.65, py + h); x.fill(); x.fillStyle = '#5fb596'; x.beginPath(); x.moveTo(px + w * 0.4, py + h); x.lineTo(px + w * 0.75, py + h * 0.5); x.lineTo(px + w, py + h); x.fill() },
    (px, py, w, h) => { x.fillStyle = '#f7d7e3'; x.fillRect(px, py, w, h); x.fillStyle = '#9a8ac9'; x.beginPath(); x.ellipse(px + w / 2, py + h * 0.6, w * 0.3, h * 0.26, 0, 0, TAU); x.fill(); x.beginPath(); x.moveTo(px + w * 0.28, py + h * 0.45); x.lineTo(px + w * 0.34, py + h * 0.2); x.lineTo(px + w * 0.48, py + h * 0.38); x.fill(); x.beginPath(); x.moveTo(px + w * 0.72, py + h * 0.45); x.lineTo(px + w * 0.66, py + h * 0.2); x.lineTo(px + w * 0.52, py + h * 0.38); x.fill() },
    (px, py, w, h) => { x.fillStyle = '#2d2a63'; x.fillRect(px, py, w, h); x.fillStyle = '#fbefc4'; x.beginPath(); x.arc(px + w * 0.55, py + h * 0.45, w * 0.22, 0, TAU); x.fill(); x.fillStyle = '#2d2a63'; x.beginPath(); x.arc(px + w * 0.66, py + h * 0.4, w * 0.2, 0, TAU); x.fill() },
    (px, py, w, h) => { x.fillStyle = '#d7efe4'; x.fillRect(px, py, w, h); for (const [i, col] of ['#f3a6bd', '#f6cf6a', '#fff'].entries()) { x.fillStyle = col; x.beginPath(); x.arc(px + w * (0.28 + i * 0.22), py + h * (0.4 + (i % 2) * 0.18), w * 0.12, 0, TAU); x.fill() } x.fillStyle = '#5fb596'; x.fillRect(px + w * 0.46, py + h * 0.6, 3, h * 0.4) },
    (px, py, w, h) => { x.fillStyle = '#fbe9b8'; x.fillRect(px, py, w, h); x.fillStyle = '#c77f5e'; x.beginPath(); x.roundRect(px + w * 0.28, py + h * 0.4, w * 0.44, h * 0.42, 6); x.fill(); x.fillStyle = '#fff7ef'; x.beginPath(); x.arc(px + w * 0.5, py + h * 0.38, w * 0.15, 0, TAU); x.fill() },
    (px, py, w, h) => { const g = x.createLinearGradient(0, py, 0, py + h); g.addColorStop(0, '#6a5bb8'); g.addColorStop(1, '#e58fb3'); x.fillStyle = g; x.fillRect(px, py, w, h); x.fillStyle = '#2f2a55'; for (const [i, hh] of [0.4, 0.62, 0.5, 0.75].entries()) x.fillRect(px + 6 + i * 20, py + h - h * hh, 15, h * hh) },
  ]
  photos.forEach((paint, i) => {
    const t = (i + 0.5) / photos.length, X = 8 + t * 1008, Y = wireY(t) + 6
    const w = 112, h = 134, tilt = (rnd() - 0.5) * 0.28
    x.save()
    x.translate(X, Y); x.rotate(tilt)
    x.shadowColor = 'rgba(70,45,110,.35)'; x.shadowBlur = 10; x.shadowOffsetY = 4
    x.fillStyle = '#fffdf8'
    x.beginPath(); x.roundRect(-w / 2, 0, w, h, 5); x.fill()
    x.shadowColor = 'transparent'
    paint(-w / 2 + 9, 11, w - 18, w - 18)
    x.fillStyle = '#c9a77d'
    x.beginPath(); x.roundRect(-8, -9, 16, 26, 4); x.fill()
    x.fillStyle = '#8c6a47'
    x.fillRect(-8, 3, 16, 3)
    x.restore()
  })
  return new CanvasTexture(c)
}

/** Guirlande de lunes : cinq phases, du croissant à la pleine lune, sur un fil vertical (fond transparent). */
function moonsTexture() {
  const [c, x] = makeCanvas(128, 512)
  x.strokeStyle = '#6b5a82'; x.lineWidth = 3
  x.beginPath(); x.moveTo(64, 0); x.lineTo(64, 512); x.stroke()
  const moon = (cy: number, p: number) => {
    const r = 34, cx = 64
    x.fillStyle = '#6a5a9d'
    x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill()
    x.fillStyle = '#fbefc4'
    x.beginPath()
    x.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false)
    const k = Math.abs(r * Math.cos(Math.PI * p))
    if (p < 0.5) x.ellipse(cx, cy, k, r, 0, Math.PI / 2, -Math.PI / 2, true)
    else x.ellipse(cx, cy, k, r, 0, Math.PI / 2, -Math.PI / 2, false)
    x.fill()
    x.strokeStyle = '#fff6d8'; x.lineWidth = 2.5
    x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.stroke()
  }
  ;[0.12, 0.32, 0.5, 0.7, 1].forEach((p, i) => moon(60 + i * 96, p))
  return new CanvasTexture(c)
}

/** La fenêtre projetée au sol : quatre colonnes de trois carreaux clairs, qui s'estompent au loin (additif). */
function windowLightTexture() {
  const [c, x] = makeCanvas(512, 384)
  x.fillStyle = '#000'
  x.fillRect(0, 0, 512, 384)
  const cw = 512 / 4, ch = 384 / 3
  x.shadowColor = '#fff'
  x.shadowBlur = 16
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 4; i++) {
      const fade = 1 - (j / 3) * 0.55
      const g = x.createLinearGradient(0, j * ch, 0, (j + 1) * ch)
      g.addColorStop(0, `rgba(255,255,255,${fade})`); g.addColorStop(1, `rgba(255,255,255,${fade * 0.8})`)
      x.fillStyle = g
      x.beginPath(); x.roundRect(i * cw + 16, j * ch + 16, cw - 32, ch - 32, 16); x.fill()
    }
  }
  const t = new CanvasTexture(c)
  t.anisotropy = 2
  return t
}

/** Gouttes de pluie sur la vitre : perles claires et quelques traînées qui coulent (fond transparent, se répète). */
function rainGlassTexture() {
  const [c, x] = makeCanvas(256, 256)
  const rnd = seeded(91)
  const bead = (X: number, Y: number, r: number) => {
    for (const dx of [0, -256, 256]) for (const dy of [0, -256, 256]) {
      const px = X + dx, py = Y + dy
      if (px < -r * 2 || px > 256 + r * 2 || py < -r * 3 || py > 256 + r * 3) continue
      const g = x.createRadialGradient(px - r * 0.3, py - r * 0.3, r * 0.1, px, py, r)
      g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(0.55, 'rgba(210,230,255,.28)'); g.addColorStop(1, 'rgba(160,190,235,.45)')
      x.fillStyle = g
      x.beginPath(); x.ellipse(px, py, r, r * 1.2, 0, 0, TAU); x.fill()
    }
  }
  for (let i = 0; i < 5; i++) {
    const X = rnd() * 256, Y = rnd() * 256, len = 50 + rnd() * 70
    for (const dy of [0, -256]) {
      const g = x.createLinearGradient(0, Y + dy, 0, Y + dy + len)
      g.addColorStop(0, 'rgba(200,222,250,0)'); g.addColorStop(1, 'rgba(200,222,250,.5)')
      x.strokeStyle = g; x.lineWidth = 3; x.lineCap = 'round'
      x.beginPath(); x.moveTo(X, Y + dy); x.lineTo(X + (rnd() - 0.5) * 6, Y + dy + len); x.stroke()
    }
    bead(X, (Y + len) % 256, 5.5)
  }
  for (let i = 0; i < 38; i++) bead(rnd() * 256, rnd() * 256, 2.2 + rnd() * 2.8)
  return tiled(c)
}

export const wallBackTex = wallBackTexture()
export const muralTex = muralTexture()
export const starGlowTex = starGlowTexture()
export const floorTex = floorTexture()
export const quiltTex = quiltTexture()
export const rugTex = rugTexture()
export const screenTex = screenTexture()
export const keysTex = keysTexture()
export const notebookTex = notebookTexture()
export const sunsetPrintTex = printTexture('sunset')
export const moonPrintTex = printTexture('moon')
export const leafPrintTex = printTexture('leaf')
export const polaroidsTex = polaroidsTexture()
export const moonsTex = moonsTexture()
export const windowLightTex = windowLightTexture()
export const rainGlassTex = rainGlassTexture()
