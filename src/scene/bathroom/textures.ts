import { CanvasTexture, ClampToEdgeWrapping } from 'three'
import { TAU } from '../../math'
import { canvasTex, rr, seeded } from '../paint'
import { makeCanvas } from '../textures'

// Les textures de la salle de bain, dessinées une fois : carrelage pastel du sol, carreaux « métro » menthe, zellige rose de la douche,
// papier peint de feuillages, buée de la fenêtre (avec un cœur dessiné au doigt), serviettes, tapis de bain, miroir, gravures, filet d'eau.

/** Carreaux de sol : un damier doux de menthe et de crème, un petit losange rose à chaque croisement de joints. Tuile 1 × 1 (4 carreaux). */
export const floorTex = canvasTex(256, 256, (x) => {
  const r = seeded(7)
  x.fillStyle = '#c1d2c8'; x.fillRect(0, 0, 256, 256) // le joint
  for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
    const mint = (i + j) % 2 === 0
    const g = x.createLinearGradient(i * 128, j * 128, i * 128 + 128, j * 128 + 128)
    g.addColorStop(0, mint ? '#d4e8de' : '#f6eee0'); g.addColorStop(1, mint ? '#c3dccf' : '#ece2d0')
    x.fillStyle = g
    rr(x, i * 128 + 3, j * 128 + 3, 122, 122, 7); x.fill()
    // un liseré fin et quelques éclats d'usure
    x.strokeStyle = mint ? 'rgba(255,255,255,.35)' : 'rgba(190,150,140,.22)'; x.lineWidth = 2
    rr(x, i * 128 + 11, j * 128 + 11, 106, 106, 4); x.stroke()
    for (let k = 0; k < 6; k++) { x.fillStyle = `rgba(255,255,255,${0.06 + r() * 0.1})`; x.fillRect(i * 128 + 8 + r() * 100, j * 128 + 8 + r() * 100, 4 + r() * 16, 2 + r() * 6) }
  }
  x.fillStyle = '#e8aebb'
  for (const [cx, cy] of [[0, 0], [128, 0], [0, 128], [128, 128], [256, 0], [256, 128], [0, 256], [128, 256], [256, 256]]) {
    x.beginPath(); x.moveTo(cx, cy - 9); x.lineTo(cx + 9, cy); x.lineTo(cx, cy + 9); x.lineTo(cx - 9, cy); x.closePath(); x.fill()
  }
}, [1, 1])

/** Carreaux métro menthe, brillants, posés à joints décalés, bords biseautés plus clairs. Tuile 1 × 1 (2 colonnes, 4 rangées : 0,5 × 0,25 m). */
export const subwayTex = canvasTex(256, 256, (x) => {
  const r = seeded(19)
  x.fillStyle = '#e9f0e6'; x.fillRect(0, 0, 256, 256) // le joint
  for (let j = 0; j < 4; j++) for (let i = -1; i < 3; i++) {
    const px = i * 128 + (j % 2 ? 64 : 0), py = j * 64, v = r() * 16
    const g = x.createLinearGradient(px, py, px + 124, py + 60)
    g.addColorStop(0, `rgb(${(188 + v) | 0},${(226 + v) | 0},${(212 + v) | 0})`); g.addColorStop(1, `rgb(${(160 + v) | 0},${(206 + v) | 0},${(190 + v) | 0})`)
    x.fillStyle = g
    rr(x, px + 3, py + 3, 122, 58, 6); x.fill()
    // le biseau clair en haut et à gauche, le reflet
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 2.5
    x.beginPath(); x.moveTo(px + 8, py + 56); x.lineTo(px + 8, py + 8); x.lineTo(px + 118, py + 8); x.stroke()
    x.fillStyle = 'rgba(255,255,255,.2)'; x.fillRect(px + 14, py + 14, 40 + r() * 30, 5)
  }
}, [1, 1])

/** Zellige rose de la douche : petits carreaux carrés irréguliers, chacun d'un rose un peu différent. Tuile 1 × 1 (8 × 8 carreaux de 0,125 m). */
export const zelligeTex = canvasTex(256, 256, (x) => {
  const r = seeded(5)
  x.fillStyle = '#f2e4dc'; x.fillRect(0, 0, 256, 256)
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
    const v = r() * 26
    const g = x.createLinearGradient(i * 32, j * 32, i * 32 + 32, j * 32 + 32)
    g.addColorStop(0, `rgb(${(238 + v * 0.3) | 0},${(176 + v) | 0},${(186 + v) | 0})`); g.addColorStop(1, `rgb(${(222 + v * 0.3) | 0},${(150 + v) | 0},${(166 + v) | 0})`)
    x.fillStyle = g
    rr(x, i * 32 + 2 + r() * 1.2, j * 32 + 2 + r() * 1.2, 28, 28, 5); x.fill()
    x.fillStyle = 'rgba(255,255,255,.28)'; x.fillRect(i * 32 + 6, j * 32 + 6, 9 + r() * 6, 3)
  }
}, [1, 1])

/** Papier peint : un fond rose très pâle, des brins de feuilles sauge et de petits points. Tuile 1 × 1 (1,1 m). */
export const paperTex = canvasTex(256, 256, (x) => {
  const r = seeded(23)
  x.fillStyle = '#f6e6df'; x.fillRect(0, 0, 256, 256)
  x.fillStyle = 'rgba(232,170,180,.35)'
  for (let k = 0; k < 14; k++) { x.beginPath(); x.arc(r() * 256, r() * 256, 2.2, 0, TAU); x.fill() }
  const sprig = (cx: number, cy: number, a: number, s: number) => {
    x.save(); x.translate(cx, cy); x.rotate(a); x.scale(s, s)
    x.strokeStyle = '#8fb293'; x.lineWidth = 2.4; x.lineCap = 'round'
    x.beginPath(); x.moveTo(0, 26); x.quadraticCurveTo(4, 0, 0, -28); x.stroke()
    for (let k = 0; k < 5; k++) {
      const y = 18 - k * 10, side = k % 2 ? 1 : -1
      x.fillStyle = k % 2 ? '#a5c7a4' : '#8fb293'
      x.beginPath(); x.ellipse(side * 8, y, 9, 4, side * -0.6, 0, TAU); x.fill()
    }
    x.fillStyle = '#a5c7a4'; x.beginPath(); x.ellipse(0, -31, 4, 8, 0, 0, TAU); x.fill()
    x.restore()
  }
  // on répète le motif aux quatre bords pour qu'il se raccorde
  for (const [cx, cy, a, s] of [[64, 70, -0.5, 1], [192, 176, 0.6, 1.1], [200, 44, 1.9, 0.8], [52, 196, -2.3, 0.85]]) {
    for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) sprig(cx + ox, cy + oy, a, s)
  }
}, [1, 1])

/** La buée de la vitre : un voile laiteux plus dense en bas, des coulures claires, des gouttes, et un cœur dessiné au doigt. Une seule texture sur l'arche. */
export const fogTex = canvasTex(512, 512, (x) => {
  const r = seeded(31)
  x.clearRect(0, 0, 512, 512)
  const g = x.createLinearGradient(0, 0, 0, 512)
  g.addColorStop(0, 'rgba(236,244,244,.42)'); g.addColorStop(0.6, 'rgba(238,246,244,.62)'); g.addColorStop(1, 'rgba(240,247,244,.78)')
  x.fillStyle = g; x.fillRect(0, 0, 512, 512)
  for (let k = 0; k < 150; k++) { x.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.12})`; x.beginPath(); x.arc(r() * 512, r() * 512, 3 + r() * 14, 0, TAU); x.fill() }
  // des coulures : la buée qui se rassemble et descend
  for (let k = 0; k < 40; k++) {
    const px = r() * 512, py = 60 + r() * 330, len = 40 + r() * 160
    const s = x.createLinearGradient(0, py, 0, py + len)
    s.addColorStop(0, 'rgba(255,255,255,0)'); s.addColorStop(0.1, 'rgba(255,255,255,.4)'); s.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = s; x.fillRect(px, py, 2.5 + r() * 2.5, len)
  }
  // le cœur, tracé au doigt : on efface la buée (le ciel de bulles se voit à travers), un tour clair autour
  x.save(); x.translate(300, 300); x.lineCap = 'round'; x.lineJoin = 'round'
  const heart = () => { x.beginPath(); x.moveTo(0, 40); x.bezierCurveTo(-64, -4, -38, -52, 0, -22); x.bezierCurveTo(38, -52, 64, -4, 0, 40) }
  x.globalCompositeOperation = 'destination-out'; x.lineWidth = 15; x.strokeStyle = 'rgba(0,0,0,.95)'; heart(); x.stroke()
  x.globalCompositeOperation = 'source-over'; x.lineWidth = 3; x.strokeStyle = 'rgba(255,255,255,.55)'
  x.save(); x.scale(1.14, 1.14); heart(); x.stroke(); x.restore()
  x.restore()
  // un petit sourire plus bas
  x.save(); x.lineCap = 'round'
  x.globalCompositeOperation = 'destination-out'; x.lineWidth = 11; x.strokeStyle = 'rgba(0,0,0,.95)'
  x.beginPath(); x.arc(150, 360, 30, 0.2 * Math.PI, 0.8 * Math.PI); x.stroke()
  x.beginPath(); x.arc(126, 330, 2, 0, TAU); x.stroke(); x.beginPath(); x.arc(176, 330, 2, 0, TAU); x.stroke()
  x.restore()
  // les gouttes qui perlent
  for (let k = 0; k < 90; k++) { x.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.4})`; x.beginPath(); x.arc(r() * 512, r() * 512, 1 + r() * 3.2, 0, TAU); x.fill() }
})

/** Éponge de serviette : bouclettes, deux liserés de couleur près des bords (les extrémités). Tuile unique, étirée sur la serviette. */
export const towelTex = (a: string, b: string) => canvasTex(128, 64, (x) => {
  const r = seeded(3)
  x.fillStyle = a; x.fillRect(0, 0, 128, 64)
  for (let k = 0; k < 340; k++) { x.fillStyle = `rgba(255,255,255,${r() * 0.14})`; x.fillRect(r() * 128, r() * 64, 2, 2) }
  x.fillStyle = b
  for (const px of [6, 12, 110, 116]) x.fillRect(px, 0, 3.5, 64)
})

/** Tapis de bain : des rayures roses et crème, des franges de coton sur les petits côtés. */
export const matTex = canvasTex(128, 128, (x) => {
  x.fillStyle = '#f4e9dc'; x.fillRect(0, 0, 128, 128)
  for (let k = 0; k < 8; k++) { x.fillStyle = k % 2 ? '#eab2bd' : '#f4e9dc'; x.fillRect(0, k * 16, 128, 16) }
  x.fillStyle = '#9cc4ae'; x.fillRect(0, 56, 128, 4); x.fillRect(0, 68, 128, 4)
  const r = seeded(11)
  for (let k = 0; k < 500; k++) { x.fillStyle = `rgba(255,255,255,${r() * 0.16})`; x.fillRect(r() * 128, r() * 128, 2, 2) }
})

/** Le miroir : un verre un peu verdâtre et deux reflets en biais. */
export const mirrorTex = canvasTex(128, 128, (x) => {
  const g = x.createLinearGradient(0, 0, 128, 128)
  g.addColorStop(0, '#e4f0ee'); g.addColorStop(1, '#bcd2d0')
  x.fillStyle = g; x.fillRect(0, 0, 128, 128)
  x.fillStyle = 'rgba(255,255,255,.5)'
  x.beginPath(); x.moveTo(20, 128); x.lineTo(48, 0); x.lineTo(62, 0); x.lineTo(34, 128); x.fill()
  x.fillStyle = 'rgba(255,255,255,.3)'
  x.beginPath(); x.moveTo(66, 128); x.lineTo(84, 0); x.lineTo(90, 0); x.lineTo(72, 128); x.fill()
})

/** Une gravure botanique encadrée : un brin de feuilles sur du papier crème, deux variantes. */
export const printTex = (kind: 0 | 1) => canvasTex(96, 128, (x) => {
  x.fillStyle = '#f7efe0'; x.fillRect(0, 0, 96, 128)
  x.strokeStyle = '#7fa488'; x.fillStyle = '#9bbd9e'; x.lineWidth = 2; x.lineCap = 'round'
  if (kind === 0) {
    x.beginPath(); x.moveTo(48, 112); x.quadraticCurveTo(52, 60, 44, 18); x.stroke()
    for (let k = 0; k < 6; k++) { const y = 98 - k * 14, s = k % 2 ? 1 : -1; x.beginPath(); x.ellipse(48 + s * 13, y, 16, 6, s * -0.55, 0, TAU); x.fill() }
    x.fillStyle = '#e6a5b4'; x.beginPath(); x.arc(44, 16, 7, 0, TAU); x.fill()
  } else {
    for (let k = 0; k < 5; k++) { const a = -2.2 + k * 0.55; x.beginPath(); x.moveTo(48, 112); x.quadraticCurveTo(48 + Math.cos(a) * 20, 112 + Math.sin(a) * 40, 48 + Math.cos(a) * 36, 112 + Math.sin(a) * 86); x.stroke(); x.beginPath(); x.ellipse(48 + Math.cos(a) * 36, 112 + Math.sin(a) * 86, 8, 17, a + Math.PI / 2, 0, TAU); x.fill() }
  }
})

/** Le filet d'eau : des traînées claires verticales sur un fond transparent ; la texture défile vers le bas. */
export const streamTex = canvasTex(64, 128, (x) => {
  const r = seeded(41)
  x.clearRect(0, 0, 64, 128)
  for (let k = 0; k < 16; k++) {
    const px = r() * 64, len = 30 + r() * 70, py = r() * 128, w = 1.5 + r() * 3
    for (const oy of [-128, 0, 128]) {
      const s = x.createLinearGradient(0, py + oy, 0, py + oy + len)
      s.addColorStop(0, 'rgba(255,255,255,0)'); s.addColorStop(0.3, `rgba(255,255,255,${0.5 + r() * 0.4})`); s.addColorStop(1, 'rgba(255,255,255,0)')
      x.fillStyle = s; x.fillRect(px, py + oy, w, len)
    }
  }
}, [1, 1])

/**
 * Le filet du robinet : une colonne d'eau, pas une pluie. Un fond clair et translucide (le volume d'eau), des traînées plus vives et
 * quelques filets bleutés plus sombres qui lui donnent son relief ; sans le fond, des traînées de 5 % de la largeur disparaissaient
 * à l'échelle de la pièce (le filet était invisible, remarque de l'audit du 2026-11-25). La texture défile vers le bas.
 */
export const jetTex = canvasTex(64, 128, (x) => {
  const r = seeded(43)
  x.clearRect(0, 0, 64, 128)
  x.fillStyle = 'rgba(214,240,252,.46)'; x.fillRect(0, 0, 64, 128)
  for (let k = 0; k < 9; k++) {
    const px = r() * 64, len = 40 + r() * 80, py = r() * 128, w = 3 + r() * 6
    for (const oy of [-128, 0, 128]) {
      const s = x.createLinearGradient(0, py + oy, 0, py + oy + len)
      const c = k % 3 === 2 ? '120,190,225' : '255,255,255'
      s.addColorStop(0, `rgba(${c},0)`); s.addColorStop(0.3, `rgba(${c},${0.55 + r() * 0.35})`); s.addColorStop(1, `rgba(${c},0)`)
      x.fillStyle = s; x.fillRect(px, py + oy, w, len)
    }
  }
}, [1, 1])

/** Une bulle de savon : un anneau presque transparent, deux reflets, un liseré rose et bleu. Sprite 64 px. */
export const bubbleTex = (() => {
  const [c, x] = makeCanvas(64, 64)
  const g = x.createRadialGradient(32, 32, 16, 32, 32, 30)
  g.addColorStop(0, 'rgba(255,255,255,.02)'); g.addColorStop(0.8, 'rgba(210,230,255,.2)'); g.addColorStop(1, 'rgba(255,255,255,.7)')
  x.fillStyle = g; x.beginPath(); x.arc(32, 32, 30, 0, TAU); x.fill()
  x.lineWidth = 2.5; x.strokeStyle = 'rgba(255,170,200,.5)'; x.beginPath(); x.arc(32, 32, 27, 2.2, 3.9); x.stroke()
  x.strokeStyle = 'rgba(150,210,255,.55)'; x.beginPath(); x.arc(32, 32, 27, 5.2, 6.8); x.stroke()
  x.fillStyle = 'rgba(255,255,255,.95)'; x.beginPath(); x.ellipse(21, 19, 6, 3.4, -0.7, 0, TAU); x.fill()
  x.fillStyle = 'rgba(255,255,255,.6)'; x.beginPath(); x.arc(42, 44, 2, 0, TAU); x.fill()
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = ClampToEdgeWrapping
  return t
})()

/** Une étiquette de flacon : une bande crème, un trait de couleur, deux lignes. */
export const bottleTex = (col: string) => canvasTex(64, 96, (x) => {
  x.fillStyle = '#f7efe2'; x.fillRect(0, 0, 64, 96)
  x.fillStyle = col; x.fillRect(0, 0, 64, 22)
  x.fillStyle = 'rgba(70,50,50,.7)'; x.fillRect(10, 40, 44, 4); x.fillRect(16, 52, 32, 3); x.fillRect(20, 62, 24, 3)
  x.beginPath(); x.arc(32, 80, 6, 0, TAU); x.fillStyle = col; x.fill()
})
