import { CanvasTexture, RepeatWrapping } from 'three'
import { TAU } from '../../math'
import { makeCanvas } from '../textures'

// Textures du café, dessinées en canvas : mur (pierre et lambris), carrelage, tartan, ardoise, bulle de conversation, page.

function rr(x: CanvasRenderingContext2D, X: number, Y: number, W: number, H: number, R: number) {
  x.beginPath(); x.moveTo(X + R, Y)
  x.arcTo(X + W, Y, X + W, Y + H, R); x.arcTo(X + W, Y + H, X, Y + H, R)
  x.arcTo(X, Y + H, X, Y, R); x.arcTo(X, Y, X + W, Y, R); x.closePath()
}

/**
 * Mur du fond : pierre de taille en haut, lambris vert sombre en bas. La texture couvre 1 unité de large et 4.4 de haut
 * (de y = -0.05 à 4.35) : elle se répète en largeur.
 */
function wallTexture() {
  const W = 256, H = 1024, px = H / 4.4, y = (u: number) => H - (u + 0.05) * px // hauteur du mur -> pixel
  const [c, x] = makeCanvas(W, H)
  // pierre : assises de 0.36, joints décalés, tons de grès
  const stone = ['#d3c4a8', '#cdbd9f', '#d8cab0', '#c8b898', '#d0c0a3']
  const top = y(4.35), rail = y(1.55)
  for (let r = 0, yy = rail; yy > top - 1; r++, yy -= 0.36 * px) {
    let xx = (r % 2) * -64 - Math.random() * 20
    while (xx < W) {
      const w = 110 + Math.random() * 90
      x.fillStyle = stone[(Math.random() * stone.length) | 0]
      x.fillRect(xx, yy - 0.36 * px, w, 0.36 * px)
      x.fillStyle = 'rgba(90,70,50,.35)'
      x.fillRect(xx, yy - 0.36 * px, 3, 0.36 * px)
      x.fillRect(xx, yy - 3, w, 3)
      xx += w
    }
  }
  // lambris : vert sombre, deux cadres en creux par unité
  x.fillStyle = '#2f5d50'
  x.fillRect(0, y(1.45), W, H - y(1.45))
  for (const [x0, w] of [[18, 100], [138, 100]]) {
    const y0 = y(1.28), h = y(0.2) - y0
    x.fillStyle = '#254c41'; rr(x, x0, y0, w, h, 6); x.fill()
    x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 3; rr(x, x0 + 3, y0 + 3, w - 6, h - 6, 5); x.stroke()
  }
  // plinthe et lisse (moulure à hauteur d'appui)
  x.fillStyle = '#1f3f36'; x.fillRect(0, y(0.18), W, H - y(0.18))
  x.fillStyle = '#c79a6b'; x.fillRect(0, y(1.55), W, y(1.45) - y(1.55))
  x.fillStyle = 'rgba(255,240,215,.4)'; x.fillRect(0, y(1.55), W, 3)
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(1, 1)
  t.anisotropy = 4
  return t
}

/** Carrelage en damier vert sombre et crème, huit carreaux par côté. */
function floorTexture() {
  const [c, x] = makeCanvas(512, 512)
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      x.fillStyle = (i + j) % 2 ? '#4d8873' : '#f1e7d1'
      x.fillRect(i * 64, j * 64, 64, 64)
      x.fillStyle = 'rgba(0,0,0,.07)'
      x.fillRect(i * 64, j * 64, 64, 2); x.fillRect(i * 64, j * 64, 2, 64)
    }
  }
  const t = new CanvasTexture(c)
  t.anisotropy = 4
  return t
}

/** Tartan : vert, bleu marine, rouge et fils jaunes ; trame et chaîne se croisent. */
function tartanTexture() {
  const [c, x] = makeCanvas(256, 256)
  x.fillStyle = '#2b5d4a'; x.fillRect(0, 0, 256, 256)
  // séquence de bandes : [couleur, largeur]
  const bands: [string, number][] = [['#1d2d52', 44], ['#2b5d4a', 22], ['#a62c3a', 8], ['#2b5d4a', 22], ['#1d2d52', 12], ['#2b5d4a', 28], ['#e0b84a', 4], ['#2b5d4a', 28]]
  const total = bands.reduce((s, b) => s + b[1], 0), k = 256 / total
  x.globalAlpha = 0.62
  let p = 0
  for (const [col, w] of bands) { x.fillStyle = col; x.fillRect(p * k, 0, w * k, 256); p += w }
  p = 0
  for (const [col, w] of bands) { x.fillStyle = col; x.fillRect(0, p * k, 256, w * k); p += w }
  x.globalAlpha = 1
  // sergé : fines diagonales
  x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = 1
  for (let i = -256; i < 512; i += 4) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 256, 256); x.stroke() }
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(3, 2.6)
  t.anisotropy = 4
  return t
}

/** Ardoise du menu, à la craie. */
function chalkTexture() {
  const [c, x] = makeCanvas(512, 320)
  x.fillStyle = '#26352f'; x.fillRect(0, 0, 512, 320)
  x.fillStyle = 'rgba(255,255,255,.04)'
  for (let i = 0; i < 60; i++) x.fillRect(Math.random() * 512, Math.random() * 320, 30 + Math.random() * 90, 2)
  x.fillStyle = '#f4efe2'; x.textAlign = 'center'
  x.font = 'bold 62px "Trebuchet MS", "Comic Sans MS", cursive, sans-serif'
  x.fillText('Café', 256, 78)
  x.font = '30px "Trebuchet MS", "Comic Sans MS", cursive, sans-serif'
  x.fillStyle = '#f3c6d4'; x.fillText('Flat white ........ 3.2', 256, 140)
  x.fillStyle = '#c9e6d9'; x.fillText('Tea & scones ...... 5', 256, 188)
  x.fillStyle = '#f6d98a'; x.fillText('Hot chocolate ..... 3.5', 256, 236)
  x.fillStyle = '#f4efe2'; x.font = '26px "Trebuchet MS", cursive, sans-serif'; x.fillText('~ it\'s raining, stay a while ~', 256, 292)
  // une petite tasse qui fume
  x.strokeStyle = '#f4efe2'; x.lineWidth = 3; x.lineCap = 'round'
  x.beginPath(); x.arc(70, 66, 15, 0, Math.PI); x.moveTo(55, 52); x.lineTo(85, 52); x.stroke()
  x.beginPath(); x.moveTo(64, 40); x.quadraticCurveTo(58, 32, 66, 24); x.moveTo(76, 40); x.quadraticCurveTo(70, 32, 78, 24); x.stroke()
  return new CanvasTexture(c)
}

function sprite(size: number, draw: (x: CanvasRenderingContext2D) => void) {
  const [c, x] = makeCanvas(size, size)
  draw(x)
  return new CanvasTexture(c)
}

/** Bulle de conversation, avec trois points. */
const bubble = sprite(64, (x) => {
  x.lineWidth = 6; x.strokeStyle = '#fff'; x.fillStyle = '#fffaf2'
  rr(x, 8, 10, 48, 32, 14); x.stroke(); x.fill()
  x.beginPath(); x.moveTo(20, 40); x.lineTo(16, 54); x.lineTo(32, 42); x.closePath(); x.stroke(); x.fill()
  x.fillStyle = '#8b7aa0'
  for (const dx of [-11, 0, 11]) { x.beginPath(); x.arc(32 + dx, 26, 3.3, 0, TAU); x.fill() }
})

/** Une page qui s'envole : un petit rectangle crème, aux lignes de texte. */
const page = sprite(64, (x) => {
  x.save(); x.translate(32, 32); x.rotate(-0.25)
  x.fillStyle = '#fffaf0'; x.strokeStyle = '#fff'; x.lineWidth = 5; rr(x, -16, -22, 32, 44, 4); x.stroke(); x.fill()
  x.fillStyle = '#b9a98f'
  for (let i = 0; i < 5; i++) x.fillRect(-10, -14 + i * 7, i % 2 ? 16 : 20, 2.2)
  x.restore()
})

export const cafeWallTex = wallTexture()
export const cafeFloorTex = floorTexture()
export const tartanTex = tartanTexture()
export const chalkTex = chalkTexture()
export const bubbleTex = bubble
export const pageTex = page
