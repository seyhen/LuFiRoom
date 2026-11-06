import { CanvasTexture, ClampToEdgeWrapping } from 'three'
import { TAU } from '../../math'
import { canvasTex, seeded } from '../paint'
import { makeCanvas } from '../textures'

// Les textures du décor autour du bungalow : le grain du sable et ses rides de vent, le fondu des bords de l'île, l'écume qui défile,
// les paillettes de l'eau, les ronds de la pluie. Tout est dessiné une fois, au premier rendu de la pièce.

/**
 * Le sable : un grain fin, des rides de vent (lignes ondulées, un liseré clair sous un liseré sombre), quelques points plus
 * sombres. Presque blanc : la couleur du sable vient des sommets du sol. Une tuile se répète tous les 6 m.
 */
export const sandTex = canvasTex(512, 512, (x) => {
  const r = seeded(31), W = 512
  x.fillStyle = '#fbf7ef'; x.fillRect(0, 0, W, W)
  // les rides : des lignes qui reviennent sur elles-mêmes (fréquences entières), deux rangées décalées
  for (let i = 0; i < 26; i++) {
    const y0 = (i / 26) * W + (r() - 0.5) * 8, k = 1 + ((r() * 3) | 0), ph = r() * TAU, a = 3 + r() * 5
    for (const [dy, col, w] of [[0, 'rgba(176,138,92,.16)', 2.6], [3.4, 'rgba(255,255,250,.55)', 1.8]] as const) {
      x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'
      x.beginPath()
      for (let px = 0; px <= W; px += 8) {
        const py = y0 + dy + Math.sin((px / W) * TAU * k + ph) * a + Math.sin((px / W) * TAU * (k + 2) + ph * 2) * 1.2
        px ? x.lineTo(px, py) : x.moveTo(px, py)
      }
      x.stroke()
    }
  }
  for (let i = 0; i < 2600; i++) {
    const v = r()
    x.fillStyle = v < 0.5 ? `rgba(150,112,70,${0.06 + r() * 0.1})` : `rgba(255,255,255,${0.25 + r() * 0.3})`
    x.fillRect(r() * W, r() * W, 1 + r() * 1.5, 1 + r() * 1.5)
  }
  // quelques brindilles et petits galets blancs dans le sable
  for (let i = 0; i < 26; i++) {
    x.fillStyle = `rgba(120,98,76,${0.2 + r() * 0.2})`
    x.beginPath(); x.ellipse(r() * W, r() * W, 2 + r() * 3, 1.2 + r() * 1.5, r() * 3, 0, TAU); x.fill()
  }
}, [4, 4])

/** Le fondu des bords : opaque au centre, transparent aux bords du carré (l'île se dissout dans le ciel). */
export const isleFade = (() => {
  const [c, x] = makeCanvas(256, 256)
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, '#fff'); g.addColorStop(0.78, '#fff'); g.addColorStop(0.92, '#666'); g.addColorStop(1, '#000')
  x.fillStyle = g; x.fillRect(0, 0, 256, 256)
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = ClampToEdgeWrapping
  return t
})()

/**
 * Les vagues vues du dessus : des lignes d'écume ondulées, mordues, de plus en plus serrées. u le long de la côte (se répète),
 * v en travers (la texture défile vers la plage). Blanc sur transparent ; l'enveloppe (qui s'éteint au large et sur le sable)
 * est dans les couleurs de sommets de la bande.
 */
export const waveTex = canvasTex(512, 256, (x) => {
  const r = seeded(77), W = 512, H = 256
  x.lineCap = 'round'
  // quatre crêtes par tuile : une ligne épaisse et douce, une fine et nette, des bulles derrière
  for (let k = 0; k < 4; k++) {
    const y0 = (k + 0.5) * (H / 4), ph = r() * TAU, f = 2 + ((r() * 3) | 0)
    let on = true, px = 0
    while (px < W) {
      const seg = on ? 30 + r() * 80 : 22 + r() * 60
      if (on) {
        for (const [w, a, dy] of [[6, 0.2, 0], [2.8, 0.7, 1], [1.4, 0.9, -1.8]] as const) {
          x.strokeStyle = `rgba(255,255,255,${a})`; x.lineWidth = w
          x.beginPath()
          for (let s = 0; s <= seg; s += 6) {
            const xx = px + s, yy = y0 + dy + Math.sin((xx / W) * TAU * f + ph) * 7 + Math.sin((xx / W) * TAU * (f * 3) + ph) * 1.6
            s ? x.lineTo(xx, yy) : x.moveTo(xx, yy)
          }
          x.stroke()
        }
      }
      px += seg; on = !on
    }
    // les bulles qui restent derrière la crête
    for (let i = 0; i < 26; i++) {
      x.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.4})`
      x.beginPath(); x.arc(r() * W, y0 + 8 + r() * 26, 1 + r() * 2.2, 0, TAU); x.fill()
    }
  }
}, [1, 1])

/**
 * Le liseré d'écume qui lèche la plage : une dentelle claire, très découpée (des arcs qui se recoupent), figée ; on la fait respirer
 * avec son opacité. u le long de la côte, v de la mer (0) au sable (1).
 */
export const lace = canvasTex(512, 128, (x) => {
  const r = seeded(9), W = 512, H = 128
  x.lineCap = 'round'
  const g = x.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.55, 'rgba(255,255,255,.22)'); g.addColorStop(0.8, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, W, H)
  for (let i = 0; i < 90; i++) {
    const cx = r() * W, cy = 48 + r() * 56, rad = 6 + r() * 18
    x.strokeStyle = `rgba(255,255,255,${0.55 + r() * 0.4})`; x.lineWidth = 1.5 + r() * 2.2
    x.beginPath(); x.arc(cx, cy, rad, Math.PI * (0.1 + r() * 0.3), Math.PI * (0.7 + r() * 0.3)); x.stroke()
    if (cx < rad) { x.beginPath(); x.arc(cx + W, cy, rad, Math.PI * 0.2, Math.PI * 0.9); x.stroke() }
  }
  for (let i = 0; i < 120; i++) {
    x.fillStyle = `rgba(255,255,255,${0.35 + r() * 0.5})`
    x.beginPath(); x.arc(r() * W, 30 + r() * 80, 0.8 + r() * 2, 0, TAU); x.fill()
  }
}, [1, 1])

/** Les paillettes de l'eau : de petits traits clairs, couchés, à peine plus longs que larges, semés sans motif. */
export const glintTex = canvasTex(512, 512, (x) => {
  const r = seeded(5), W = 512
  for (let i = 0; i < 520; i++) {
    const w = 6 + r() * 22, px = r() * W, py = r() * W
    x.fillStyle = `rgba(255,255,255,${0.25 + r() * 0.7})`
    x.beginPath(); x.ellipse(px, py, w, 1.1 + r() * 1.5, 0, 0, TAU); x.fill()
    if (px < w) { x.beginPath(); x.ellipse(px + W, py, w, 1.4, 0, 0, TAU); x.fill() }
    if (px > W - w) { x.beginPath(); x.ellipse(px - W, py, w, 1.4, 0, 0, TAU); x.fill() }
  }
}, [3, 3])

/** Des ronds dans l'eau : sous la pluie. */
export const rippleTex = canvasTex(512, 512, (x) => {
  const r = seeded(15), W = 512
  for (let i = 0; i < 70; i++) {
    const cx = r() * W, cy = r() * W, rad = 5 + r() * 15
    for (const [dx, dy] of [[0, 0], [W, 0], [-W, 0], [0, W], [0, -W]]) {
      x.strokeStyle = `rgba(255,255,255,${0.35 + r() * 0.4})`; x.lineWidth = 1.5
      x.beginPath(); x.ellipse(cx + dx, cy + dy, rad, rad * 0.62, 0, 0, TAU); x.stroke()
      x.strokeStyle = 'rgba(255,255,255,.3)'; x.lineWidth = 1
      x.beginPath(); x.ellipse(cx + dx, cy + dy, rad * 0.55, rad * 0.34, 0, 0, TAU); x.stroke()
    }
  }
}, [3, 3])

/**
 * L'écorce d'un palmier : des anneaux (les cicatrices des palmes tombées) tous les 64 px, un liseré sombre sous chacun, des fibres
 * qui montent, du gris argenté et du miel. u autour, v en haut (une tuile = 0,5 m de tronc).
 */
export const palmBark = canvasTex(128, 256, (x) => {
  const r = seeded(63), W = 128, H = 256
  const g = x.createLinearGradient(0, 0, W, 0)
  g.addColorStop(0, '#9a7b5c'); g.addColorStop(0.5, '#c9a67a'); g.addColorStop(1, '#9a7b5c')
  x.fillStyle = g; x.fillRect(0, 0, W, H)
  for (let k = 0; k < 4; k++) {
    const y = k * 64
    const rg = x.createLinearGradient(0, y, 0, y + 64)
    rg.addColorStop(0, 'rgba(70,48,32,.55)'); rg.addColorStop(0.18, 'rgba(70,48,32,0)'); rg.addColorStop(0.7, 'rgba(255,236,196,.14)'); rg.addColorStop(1, 'rgba(255,236,196,0)')
    x.fillStyle = rg; x.fillRect(0, y, W, 64)
  }
  for (let i = 0; i < 70; i++) {
    const px = r() * W, py = r() * H, l = 10 + r() * 30
    x.strokeStyle = `rgba(80,58,40,${0.12 + r() * 0.2})`; x.lineWidth = 1 + r()
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 3, py + l); x.stroke()
  }
  for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(170,176,160,${0.1 + r() * 0.15})`; x.beginPath(); x.ellipse(r() * W, r() * H, 3 + r() * 5, 2 + r() * 3, 0, 0, TAU); x.fill() }
}, [1, 1])

/** Le plancher du ponton : des planches en travers, bois flotté gris argenté, clous, joints noirs, quelques planches plus claires. u en travers, v le long. */
export const deckBoards = canvasTex(256, 256, (x) => {
  const r = seeded(21), W = 256, rows = 8, h = W / rows
  for (let i = 0; i < rows; i++) {
    const t = r(), R = 184 - t * 26, G = 164 - t * 26, B = 140 - t * 24
    const g = x.createLinearGradient(0, i * h, 0, i * h + h)
    g.addColorStop(0, `rgb(${R + 8},${G + 8},${B + 6})`); g.addColorStop(1, `rgb(${R - 10},${G - 10},${B - 10})`)
    x.fillStyle = g; x.fillRect(0, i * h, W, h)
    x.strokeStyle = 'rgba(96,78,60,.22)'; x.lineWidth = 1
    for (let k = 0; k < 4; k++) { const y = i * h + 4 + r() * (h - 8); x.beginPath(); x.moveTo(0, y); for (let s = 0; s <= W; s += 32) x.lineTo(s, y + Math.sin(s * 0.03 + k) * 1.4); x.stroke() }
    x.fillStyle = 'rgba(60,46,36,.55)'; x.fillRect(0, i * h, W, 2.5)
    x.fillStyle = 'rgba(70,60,52,.6)'
    for (const ex of [12, W - 12]) { x.beginPath(); x.arc(ex, i * h + h / 2, 2.2, 0, TAU); x.fill() }
    if (r() < 0.4) { x.fillStyle = 'rgba(100,130,90,.18)'; x.fillRect(r() * W, i * h + 2, 20 + r() * 40, h - 4) }
  }
}, [1, 1])
