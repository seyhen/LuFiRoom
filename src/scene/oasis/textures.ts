import { TAU } from '../../math'
import { canvasTex, seeded } from '../paint'
import { makeCanvas } from '../textures'
import { CanvasTexture, RepeatWrapping } from 'three'

// Les textures de l'oasis, dessinées une fois : le sable ridé, le pisé des murs, la toile rayée de l'auvent, les tapis et les kilims,
// les coussins, le laiton ajouré de la lanterne, l'écorce du palmier, l'eau de la mare, la rosace de l'oud, le plateau de cuivre,
// la poterie, les strates du grès, le ksar du fond. Les motifs qui se répètent s'enroulent (`wrap`) : aucune couture.

/** Dessine `fn` aux neuf positions voisines : ce qui dépasse d'un bord revient de l'autre (une texture qui se répète sans couture). */
const wrap = (x: CanvasRenderingContext2D, W: number, H: number, fn: () => void) => {
  for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) { x.save(); x.translate(dx, dy); fn(); x.restore() }
}
const blob = (x: CanvasRenderingContext2D, px: number, py: number, rad: number, rgb: string, a: number) => {
  const g = x.createRadialGradient(px, py, 0, px, py, rad)
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`)
  x.fillStyle = g; x.beginPath(); x.arc(px, py, rad, 0, TAU); x.fill()
}
const tiled = (t: CanvasTexture) => { t.wrapS = t.wrapT = RepeatWrapping; return t }

/** Le sable du sol : des rides en diagonale, des grains, des plaques plus claires. Tuile 1 × 1 (se pose avec `worldUV`). */
export const sandTex = tiled(canvasTex(512, 512, (x) => {
  const r = seeded(3)
  x.fillStyle = '#d9b673'; x.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 26; i++) wrap(x, 512, 512, () => blob(x, ((i * 197) % 512), ((i * 331) % 512), 50 + (i % 5) * 18, i % 2 ? '238,208,140' : '190,150,84', 0.2))
  // les rides : des bandes douces, ondulées, à 30° : ombre d'un côté, éclat de l'autre
  for (let k = 0; k < 16; k++) {
    const y0 = (k / 16) * 512, ph = k * 1.7
    wrap(x, 512, 512, () => {
      x.strokeStyle = 'rgba(150,108,52,.2)'; x.lineWidth = 3.2
      x.beginPath()
      for (let u = 0; u <= 512; u += 8) { const v = y0 + u * 0.32 + Math.sin(u * 0.045 + ph) * 5; u ? x.lineTo(u, v) : x.moveTo(u, v) }
      x.stroke()
      x.strokeStyle = 'rgba(255,238,184,.26)'; x.lineWidth = 2.4
      x.beginPath()
      for (let u = 0; u <= 512; u += 8) { const v = y0 + 5 + u * 0.32 + Math.sin(u * 0.045 + ph) * 5; u ? x.lineTo(u, v) : x.moveTo(u, v) }
      x.stroke()
    })
  }
  for (let i = 0; i < 3200; i++) { x.fillStyle = r() < 0.5 ? `rgba(255,236,180,${r() * 0.2})` : `rgba(120,86,40,${r() * 0.16})`; x.fillRect(r() * 512, r() * 512, 1 + r() * 1.6, 1 + r() * 1.2) }
}, [1, 1]))

/** Le pisé des murs : un enduit ocre rosé, des reprises à la taloche, des fissures fines, la poussière du bas. Tuile 1 × 1 (UV en mètres / 2,2). */
export const adobeTex = tiled(canvasTex(512, 512, (x) => {
  const r = seeded(11)
  x.fillStyle = '#cf9a68'; x.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 70; i++) wrap(x, 512, 512, () => blob(x, r() * 512, r() * 512, 30 + r() * 80, r() < 0.5 ? '232,190,140' : '150,100,62', 0.12 + r() * 0.12))
  // les passes de taloche : de longs arcs clairs
  for (let i = 0; i < 40; i++) {
    const px = r() * 512, py = r() * 512, L = 40 + r() * 90, a = (r() - 0.5) * 0.5
    wrap(x, 512, 512, () => {
      x.strokeStyle = `rgba(250,214,166,${0.1 + r() * 0.1})`; x.lineWidth = 5 + r() * 9; x.lineCap = 'round'
      x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + L / 2, py + L * a, px + L, py + L * a * 0.3); x.stroke()
    })
  }
  // les fissures : des traits brisés, fins
  x.strokeStyle = 'rgba(88,54,30,.38)'; x.lineWidth = 1.4
  for (let i = 0; i < 9; i++) {
    let px = r() * 512, py = r() * 512
    x.beginPath(); x.moveTo(px, py)
    for (let k = 0; k < 6; k++) { px += (r() - 0.5) * 22; py += 8 + r() * 18; x.lineTo(px, py) }
    x.stroke()
  }
  for (let i = 0; i < 3000; i++) { x.fillStyle = r() < 0.5 ? `rgba(255,230,190,${r() * 0.14})` : `rgba(80,48,26,${r() * 0.14})`; x.fillRect(r() * 512, r() * 512, 1 + r() * 2, 1 + r() * 2) }
}, [0.45, 0.45]))

/** Les strates du grès : des bandes ocre, rosées et crème, ondulées, qui se répètent en hauteur. Tuile 1 × 1. */
export const strataTex = tiled(canvasTex(256, 256, (x) => {
  const r = seeded(19)
  x.fillStyle = '#c99660'; x.fillRect(0, 0, 256, 256)
  const cols = ['#d9ab74', '#b98150', '#e0bd8a', '#c28a58', '#a96f46', '#d6a470']
  let y = 0
  for (let i = 0; i < 18; i++) {
    const h = 6 + r() * 18
    x.fillStyle = cols[i % cols.length]
    x.beginPath(); x.moveTo(0, y)
    for (let u = 0; u <= 256; u += 16) x.lineTo(u, y + Math.sin(u * 0.05 + i) * 2.4)
    x.lineTo(256, y + h + 3); x.lineTo(0, y + h + 3); x.closePath(); x.fill()
    y += h
  }
  for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(70,40,20,${r() * 0.12})`; x.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1) }
}, [1, 1]))

/** La toile de l'auvent : bandes indigo, crème et terre cuite le long de la pente, l'ourlet du bord libre festonné (le reste est transparent, `alphaTest`). */
export const awningTex = canvasTex(512, 512, (x) => {
  const r = seeded(23), W = 512, H = 512, bands = 8, bh = H / bands, cols = ['#2a417d', '#efe3c4', '#b5532c', '#efe3c4']
  for (let b = 0; b < bands; b++) {
    const y = b * bh, rad = bh / 2
    x.fillStyle = cols[b % 4]
    x.fillRect(0, y, W - rad, bh)
    x.beginPath(); x.arc(W - rad, y + rad, rad, -Math.PI / 2, Math.PI / 2); x.fill()
  }
  // l'ourlet : une couture double tout le long du bord libre, qui suit les festons
  x.strokeStyle = 'rgba(60,40,24,.5)'; x.lineWidth = 2; x.setLineDash([8, 5])
  for (let b = 0; b < bands; b++) { const y = b * bh, rad = bh / 2; x.beginPath(); x.arc(W - rad, y + rad, rad - 8, -Math.PI / 2, Math.PI / 2); x.stroke() }
  x.setLineDash([])
  // le tissage et les plis de rangement
  for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(60,44,30,${0.03 + r() * 0.05})`; x.fillRect(r() * W, r() * H, 5 + r() * 18, 1) }
  for (let i = 0; i < 1600; i++) { x.fillStyle = `rgba(255,250,236,${0.04 + r() * 0.05})`; x.fillRect(r() * W, r() * H, 1, 5 + r() * 14) }
  x.fillStyle = 'rgba(60,40,24,.12)'
  for (let k = 1; k < 4; k++) x.fillRect(0, (H / 4) * k - 1, W, 2)
})

type Pal = { bg: string; a: string; b: string; c: string; d: string }
/** Un tapis berbère entier (texture non répétée), avec une frange transparente aux deux bouts. Rouille, indigo, crème, safran. */
export function rugTexture(W: number, H: number, p: Pal, seed: number, medallion = true) {
  const [c, x] = makeCanvas(W, H)
  const r = seeded(seed), F = Math.round(H * 0.045)
  x.clearRect(0, 0, W, H)
  x.save(); x.beginPath(); x.rect(0, F, W, H - F * 2); x.clip()
  x.fillStyle = p.bg; x.fillRect(0, 0, W, H)
  const bx = 26, by = F + 26, iw = W - bx * 2, ih = H - by * 2
  const n = Math.max(4, Math.round(iw / 56)), cw = iw / n, m = Math.max(3, Math.round(ih / 56)), ch = ih / m
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
    const cx = bx + (i + 0.5) * cw, cy = by + (j + 0.5) * ch, k = (i + j) % 2
    x.fillStyle = k ? p.a : p.b
    x.beginPath(); x.moveTo(cx, cy - ch * 0.44); x.lineTo(cx + cw * 0.44, cy); x.lineTo(cx, cy + ch * 0.44); x.lineTo(cx - cw * 0.44, cy); x.closePath(); x.fill()
    x.fillStyle = k ? p.c : p.d
    x.beginPath(); x.moveTo(cx, cy - ch * 0.2); x.lineTo(cx + cw * 0.2, cy); x.lineTo(cx, cy + ch * 0.2); x.lineTo(cx - cw * 0.2, cy); x.closePath(); x.fill()
  }
  if (medallion) {
    const cx = W / 2, cy = H / 2, R = Math.min(iw, ih) * 0.36
    for (const [k, col] of [[1.15, p.bg], [1, p.a], [0.8, p.c], [0.6, p.b], [0.42, p.d], [0.22, p.a]] as const) {
      x.fillStyle = col; x.beginPath(); x.moveTo(cx, cy - R * k); x.lineTo(cx + R * 1.45 * k, cy); x.lineTo(cx, cy + R * k); x.lineTo(cx - R * 1.45 * k, cy); x.closePath(); x.fill()
    }
  }
  x.strokeStyle = p.a; x.lineWidth = 10; x.strokeRect(bx - 12, by - 12, iw + 24, ih + 24)
  x.strokeStyle = p.c; x.lineWidth = 3; x.strokeRect(bx - 22, by - 22, iw + 44, ih + 44)
  x.fillStyle = p.b
  for (let u = bx; u < W - bx; u += 22) { x.fillRect(u, F + 6, 11, 8); x.fillRect(u, H - F - 14, 11, 8) }
  for (let i = 0; i < 2600; i++) { x.fillStyle = r() < 0.5 ? `rgba(255,240,210,${r() * 0.1})` : `rgba(40,24,14,${r() * 0.12})`; x.fillRect(r() * W, F + r() * (H - F * 2), 1 + r() * 4, 1) }
  x.restore()
  // les franges : des fils crème, un peu inégaux, aux deux bouts
  x.strokeStyle = '#efe0bc'; x.lineWidth = 3; x.lineCap = 'round'
  for (let u = 6; u < W - 4; u += 9) {
    const j = r() * 4
    x.beginPath(); x.moveTo(u, F + 2); x.lineTo(u + (r() - 0.5) * 3, j); x.stroke()
    x.beginPath(); x.moveTo(u, H - F - 2); x.lineTo(u + (r() - 0.5) * 3, H - j); x.stroke()
  }
  return new CanvasTexture(c)
}

export const rugBig = rugTexture(1024, 768, { bg: '#7a2f22', a: '#2a3f78', b: '#c6482c', c: '#e9d9b0', d: '#d79a2c' }, 5)
export const rugSmall = rugTexture(512, 768, { bg: '#2c4f66', a: '#a8452a', b: '#e0c88c', c: '#efe0bc', d: '#274a3f' }, 9, false)

/** Le kilim accroché au mur : grandes bandes à motifs de losanges et de zigzags (bords francs, pas de frange). */
export const kilimHang = canvasTex(512, 512, (x) => {
  const r = seeded(31)
  x.fillStyle = '#e4d2a6'; x.fillRect(0, 0, 512, 512)
  const rows = [['#a8452a', '#e4d2a6'], ['#2a417d', '#d9a63a'], ['#4d7a5a', '#e4d2a6'], ['#a8452a', '#2a417d']]
  rows.forEach(([a, b], i) => {
    const y0 = 40 + i * 108
    x.fillStyle = a; x.fillRect(0, y0, 512, 84)
    for (let u = 0; u < 512; u += 64) {
      x.fillStyle = b; x.beginPath(); x.moveTo(u + 32, y0 + 8); x.lineTo(u + 56, y0 + 42); x.lineTo(u + 32, y0 + 76); x.lineTo(u + 8, y0 + 42); x.closePath(); x.fill()
      x.fillStyle = a; x.fillRect(u + 28, y0 + 38, 8, 8)
    }
    x.strokeStyle = '#e4d2a6'; x.lineWidth = 5; x.beginPath()
    for (let u = 0; u <= 512; u += 32) { const yy = y0 - 12 + (u / 32) % 2 * 10; u ? x.lineTo(u, yy) : x.moveTo(u, yy) }
    x.stroke()
  })
  for (let i = 0; i < 2400; i++) { x.fillStyle = `rgba(40,26,14,${r() * 0.12})`; x.fillRect(r() * 512, r() * 512, 1 + r() * 4, 1) }
})

/** Un coussin de sol : bandes d'ikat dégradées, une frise de losanges. Tuile 1 × 1 (carrée). */
export const cushionA = canvasTex(256, 256, (x) => {
  const r = seeded(41)
  x.fillStyle = '#efe0bc'; x.fillRect(0, 0, 256, 256)
  const bands = [['#b5532c', 0], ['#2a417d', 70], ['#d79a2c', 150]] as const
  for (const [c, y] of bands) { x.fillStyle = c; x.fillRect(0, y, 256, 44) }
  x.fillStyle = '#efe0bc'
  for (const y of [22, 92, 172]) for (let u = 0; u < 256; u += 32) { x.beginPath(); x.moveTo(u + 16, y - 10); x.lineTo(u + 26, y); x.lineTo(u + 16, y + 10); x.lineTo(u + 6, y); x.closePath(); x.fill() }
  // l'ikat : les bords des bandes sont flous
  for (let i = 0; i < 80; i++) { x.fillStyle = `rgba(239,224,188,${0.1 + r() * 0.15})`; x.fillRect(r() * 256, [0, 70, 114, 150, 194, 44, 244][i % 7] + (r() - 0.5) * 8, 4 + r() * 14, 2) }
  for (let i = 0; i < 1500; i++) { x.fillStyle = `rgba(40,26,14,${r() * 0.1})`; x.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1) }
}, [1, 1])

/** Un coussin turquoise à la broderie de feuilles : un fond uni, un semis de petites fleurs. Tuile 1 × 1. */
export const cushionB = canvasTex(256, 256, (x) => {
  const r = seeded(43)
  x.fillStyle = '#2f8a86'; x.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const cx = 32 + i * 64 + (j % 2) * 16, cy = 32 + j * 64
    x.fillStyle = '#efe0bc'
    for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; x.beginPath(); x.ellipse(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9, 6, 3, a, 0, TAU); x.fill() }
    x.fillStyle = '#d79a2c'; x.beginPath(); x.arc(cx, cy, 4, 0, TAU); x.fill()
  }
  for (let i = 0; i < 1500; i++) { x.fillStyle = `rgba(10,30,28,${r() * 0.12})`; x.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1) }
}, [1, 1])

/** Les huit pans de la lanterne : la couleur du laiton (couvert de petits trous), sombre ; la glow est la lumière qui passe. Enroulée autour (8 pans par tour). */
function lanternPanels(glow: boolean) {
  const W = 512, H = 256, P = W / 8
  return canvasTex(W, H, (x) => {
    x.fillStyle = glow ? '#000' : '#8a6320'; x.fillRect(0, 0, W, H)
    for (let k = 0; k < 8; k++) {
      const x0 = k * P
      // le cadre du pan : une fenêtre en arc outrepassé, ajourée
      const hole = (cx: number, cy: number, rad: number) => { x.beginPath(); x.arc(cx, cy, rad, 0, TAU); x.fill() }
      x.fillStyle = glow ? '#ffd58a' : '#2a1c08'
      x.beginPath(); x.moveTo(x0 + 10, 232); x.lineTo(x0 + 10, 98); x.arc(x0 + P / 2, 98, P / 2 - 10, Math.PI, 0); x.lineTo(x0 + P - 10, 232); x.closePath()
      if (glow) { x.save(); x.globalAlpha = 0.18; x.fill(); x.restore() } else { x.save(); x.globalAlpha = 0.55; x.fill(); x.restore() }
      x.fillStyle = glow ? '#fff0c4' : '#1b1204'
      // un croissant, des étoiles, un semis de points
      x.beginPath(); x.arc(x0 + P / 2, 70, 14, 0, TAU); x.fill()
      x.fillStyle = glow ? '#000' : '#8a6320'; x.beginPath(); x.arc(x0 + P / 2 + 7, 66, 12, 0, TAU); x.fill()
      x.fillStyle = glow ? '#fff0c4' : '#1b1204'
      for (const [dx, dy, rad] of [[-17, 100, 3.4], [17, 100, 3.4], [0, 118, 3.8], [-22, 142, 3], [22, 142, 3], [0, 154, 3.4], [-11, 172, 3], [11, 172, 3], [0, 192, 3.4], [-22, 206, 2.6], [22, 206, 2.6], [0, 218, 3], [-12, 124, 2.6], [12, 124, 2.6]]) hole(x0 + P / 2 + dx, dy, rad)
    }
    if (!glow) {
      // le laiton : un dégradé vertical et l'éclat des arêtes
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,224,150,.22)'); g.addColorStop(1, 'rgba(40,20,0,.28)')
      x.fillStyle = g; x.fillRect(0, 0, W, H)
    }
  })
}
export const lanternColor = lanternPanels(false)
export const lanternGlow = lanternPanels(true)

/** Les étoiles de lumière que la lanterne pose sur le sol, la nuit (additif) : un semis de losanges et de points, flou, en rond. */
export const lanternCast = canvasTex(256, 256, (x) => {
  x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256)
  const g = x.createRadialGradient(128, 128, 8, 128, 128, 126); g.addColorStop(0, 'rgba(255,200,120,.38)'); g.addColorStop(1, 'rgba(255,200,120,0)')
  x.fillStyle = g; x.fillRect(0, 0, 256, 256)
  const r = seeded(77)
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * TAU, d = 78
    x.save(); x.translate(128 + Math.cos(a) * d, 128 + Math.sin(a) * d); x.rotate(a + Math.PI / 4)
    x.fillStyle = 'rgba(255,224,160,.65)'; x.fillRect(-10, -10, 20, 20); x.restore()
    for (let j = 0; j < 4; j++) { x.fillStyle = 'rgba(255,224,160,.55)'; const dd = 40 + j * 22 + r() * 10; x.beginPath(); x.arc(128 + Math.cos(a + 0.2) * dd, 128 + Math.sin(a + 0.2) * dd, 3.4, 0, TAU); x.fill() }
  }
})

/** L'écorce du palmier dattier : des écailles en losanges (les bases des palmes coupées), qui se répètent le long du tronc. Tuile 1 × 1. */
export const barkTex = tiled(canvasTex(256, 256, (x) => {
  const r = seeded(51)
  x.fillStyle = '#8a6a48'; x.fillRect(0, 0, 256, 256)
  for (let j = -1; j < 6; j++) for (let i = 0; i < 4; i++) {
    const cx = i * 64 + (j % 2 ? 32 : 0) + 32, cy = j * 52 + 26
    x.fillStyle = r() < 0.5 ? '#a58360' : '#7a5c3c'
    x.beginPath(); x.moveTo(cx, cy - 26); x.lineTo(cx + 30, cy); x.lineTo(cx, cy + 26); x.lineTo(cx - 30, cy); x.closePath(); x.fill()
    x.strokeStyle = 'rgba(40,24,10,.6)'; x.lineWidth = 3.4; x.stroke()
    x.strokeStyle = 'rgba(210,180,140,.22)'; x.lineWidth = 1.6
    x.beginPath(); x.moveTo(cx - 14, cy - 3); x.lineTo(cx + 12, cy - 12); x.stroke()
  }
  for (let i = 0; i < 1600; i++) { x.fillStyle = r() < 0.5 ? `rgba(240,210,170,${r() * 0.14})` : `rgba(30,18,8,${r() * 0.2})`; x.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 3) }
}, [1, 1]))

/** L'eau de la mare, sur un disque : les bords clairs (le sable au fond, turquoise), le centre profond ; quelques anneaux de lumière. */
export const waterTex = canvasTex(512, 512, (x) => {
  const g = x.createRadialGradient(256, 256, 20, 256, 256, 256)
  g.addColorStop(0, '#12707f'); g.addColorStop(0.45, '#2a9a98'); g.addColorStop(0.8, '#6fcdb6'); g.addColorStop(1, '#c4e6b0')
  x.fillStyle = g; x.fillRect(0, 0, 512, 512)
  const r = seeded(61)
  for (let i = 0; i < 90; i++) { x.strokeStyle = `rgba(255,255,255,${0.04 + r() * 0.08})`; x.lineWidth = 1.2 + r() * 1.6; x.beginPath(); x.ellipse(120 + r() * 280, 120 + r() * 280, 8 + r() * 30, 3 + r() * 10, r() * 3, 0, TAU * (0.4 + r() * 0.5)); x.stroke() }
  const v = x.createRadialGradient(256, 256, 200, 256, 256, 256); v.addColorStop(0, 'rgba(120,96,50,0)'); v.addColorStop(1, 'rgba(120,96,50,.35)')
  x.fillStyle = v; x.fillRect(0, 0, 512, 512)
})

/** Le sable mouillé autour de la mare : un disque sombre qui s'éteint vers le bord (transparent). */
export const wetTex = canvasTex(256, 256, (x) => {
  const g = x.createRadialGradient(128, 128, 60, 128, 128, 128)
  g.addColorStop(0, 'rgba(110,78,40,.7)'); g.addColorStop(0.7, 'rgba(120,86,46,.38)'); g.addColorStop(1, 'rgba(130,94,52,0)')
  x.fillStyle = g; x.fillRect(0, 0, 256, 256)
  const r = seeded(63)
  for (let i = 0; i < 120; i++) { x.fillStyle = `rgba(60,40,20,${r() * 0.08})`; x.fillRect(r() * 256, r() * 256, 2, 2) }
})

/** Un anneau dans l'eau : un cercle fin, flou, blanc (additif léger). */
export const ringTex = canvasTex(128, 128, (x) => {
  x.clearRect(0, 0, 128, 128)
  const g = x.createRadialGradient(64, 64, 40, 64, 64, 62)
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.55, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, 128, 128)
})

/** Le filet d'eau de la source : des traînées claires qui descendent. Tuile 1 × 1 (défile avec `offset.y`). */
export const streamTex = tiled(canvasTex(64, 256, (x) => {
  const r = seeded(67)
  x.fillStyle = 'rgba(150,215,225,.78)'; x.fillRect(0, 0, 64, 256)
  for (let i = 0; i < 26; i++) { x.fillStyle = r() < 0.5 ? 'rgba(240,252,255,.7)' : 'rgba(70,150,170,.5)'; x.fillRect(r() * 60, r() * 256, 2 + r() * 4, 20 + r() * 60) }
}, [1, 1]))

/** La rosace de l'oud : un cercle sombre (le trou), un filigrane de bois clair en étoile à douze pointes (transparent hors du cercle). */
export const rosetteTex = canvasTex(256, 256, (x) => {
  x.clearRect(0, 0, 256, 256)
  x.fillStyle = '#2a190c'; x.beginPath(); x.arc(128, 128, 120, 0, TAU); x.fill()
  x.fillStyle = '#17100a'; x.beginPath(); x.arc(128, 128, 62, 0, TAU); x.fill()
  x.strokeStyle = '#e8c88e'; x.lineWidth = 6
  for (const rad of [118, 92, 66]) { x.beginPath(); x.arc(128, 128, rad, 0, TAU); x.stroke() }
  x.lineWidth = 5
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * TAU, b = a + Math.PI / 12
    x.beginPath(); x.moveTo(128 + Math.cos(a) * 68, 128 + Math.sin(a) * 68); x.lineTo(128 + Math.cos(b) * 90, 128 + Math.sin(b) * 90); x.lineTo(128 + Math.cos(a + Math.PI / 6) * 68, 128 + Math.sin(a + Math.PI / 6) * 68); x.stroke()
    x.beginPath(); x.arc(128 + Math.cos(b) * 104, 128 + Math.sin(b) * 104, 5, 0, TAU); x.fillStyle = '#e8c88e'; x.fill()
  }
})

/** Le plateau de cuivre gravé, sur un disque : un médaillon, des rinceaux, un liseré, des points (le centre de l'image est le centre du plateau). */
export const trayTex = canvasTex(512, 512, (x) => {
  const g = x.createRadialGradient(256, 256, 20, 256, 256, 256)
  g.addColorStop(0, '#d9904c'); g.addColorStop(1, '#a8582a')
  x.fillStyle = g; x.fillRect(0, 0, 512, 512)
  x.strokeStyle = 'rgba(70,30,10,.65)'; x.lineWidth = 4
  for (const rad of [236, 214, 120, 86]) { x.beginPath(); x.arc(256, 256, rad, 0, TAU); x.stroke() }
  x.lineWidth = 3
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * TAU
    x.beginPath(); x.moveTo(256 + Math.cos(a) * 125, 256 + Math.sin(a) * 125); x.quadraticCurveTo(256 + Math.cos(a + 0.2) * 170, 256 + Math.sin(a + 0.2) * 170, 256 + Math.cos(a) * 208, 256 + Math.sin(a) * 208); x.stroke()
    x.fillStyle = 'rgba(70,30,10,.65)'; x.beginPath(); x.arc(256 + Math.cos(a + Math.PI / 16) * 226, 256 + Math.sin(a + Math.PI / 16) * 226, 4, 0, TAU); x.fill()
  }
  for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; x.save(); x.translate(256 + Math.cos(a) * 62, 256 + Math.sin(a) * 62); x.rotate(a); x.beginPath(); x.ellipse(0, 0, 18, 8, 0, 0, TAU); x.stroke(); x.restore() }
  const r = seeded(71)
  for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(255,220,170,${r() * 0.09})`; x.fillRect(r() * 512, r() * 512, 2, 2) }
})

/** La poterie peinte : des bandes ocre et brunes, une frise en zigzag, des points. Tuile 1 × 1 (v le long du profil). */
export const potTex = tiled(canvasTex(256, 256, (x) => {
  const r = seeded(81)
  x.fillStyle = '#c4703a'; x.fillRect(0, 0, 256, 256)
  x.fillStyle = '#efe0bc'; x.fillRect(0, 70, 256, 54)
  x.fillStyle = '#4a2a18'; x.fillRect(0, 62, 256, 7); x.fillRect(0, 124, 256, 7); x.fillRect(0, 196, 256, 10)
  x.strokeStyle = '#4a2a18'; x.lineWidth = 5; x.beginPath()
  for (let u = 0; u <= 256; u += 16) { const y = 78 + (u / 16) % 2 * 38; u ? x.lineTo(u, y) : x.moveTo(u, y) }
  x.stroke()
  x.fillStyle = '#efe0bc'
  for (let u = 8; u < 256; u += 24) { x.beginPath(); x.arc(u, 160, 4, 0, TAU); x.fill() }
  for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(60,30,12,${r() * 0.12})`; x.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1) }
}, [1, 1]))

/** Le pisé du ksar : un enduit ocre, trois rangées de fenêtres en arc (sombres le jour, quelques-unes chaudes la nuit en `emissive`), une frise de losanges. Tuile 1 × 1 (carrée, 3,2 m). */
function ksar(glow: boolean) {
  return canvasTex(256, 256, (x) => {
    const r = seeded(91), r2 = seeded(93)
    x.fillStyle = glow ? '#000' : '#c8956a'; x.fillRect(0, 0, 256, 256)
    if (!glow) {
      for (let i = 0; i < 26; i++) blob(x, r() * 256, r() * 256, 22 + r() * 40, r() < 0.5 ? '236,196,150' : '150,100,64', 0.14)
      x.fillStyle = 'rgba(120,76,46,.6)'
      for (let u = 4; u < 256; u += 20) { x.beginPath(); x.moveTo(u + 8, 8); x.lineTo(u + 14, 16); x.lineTo(u + 8, 24); x.lineTo(u + 2, 16); x.closePath(); x.fill() }
    }
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
      const wx = 24 + i * 80 + (j % 2) * 14, wy = 40 + j * 70, lit = r2() < 0.45
      const arch = (w: number, h: number) => { x.beginPath(); x.moveTo(wx, wy + h); x.lineTo(wx, wy + w / 2); x.arc(wx + w / 2, wy + w / 2, w / 2, Math.PI, 0); x.lineTo(wx + w, wy + h); x.closePath(); x.fill() }
      if (glow) { if (lit) { x.fillStyle = '#ffc070'; arch(30, 50) } }
      else { x.fillStyle = '#4a2c1c'; arch(36, 56); x.fillStyle = '#2a170d'; x.translate(3, 3); arch(30, 50); x.translate(-3, -3) }
    }
  })
}
export const ksarColor = ksar(false)
export const ksarGlow = ksar(true)
