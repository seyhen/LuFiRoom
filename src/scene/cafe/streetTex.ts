import { CanvasTexture, RepeatWrapping } from 'three'
import { TAU } from '../../math'
import { canvasTex, rr, seeded } from '../paint'

// Les textures de la rue autour du café : pavés mouillés, dalles du trottoir, grès d'Édimbourg, brique, ardoise, enseignes.
// Toutes se répètent sans couture (les motifs qui débordent sont redessinés de l'autre côté).

const wrapped = <T extends CanvasTexture>(t: T) => ((t.wrapS = t.wrapT = RepeatWrapping), t)

/** Les pavés de granit de la chaussée : rangs décalés, teintes grises et bleutées, joints sombres. Une tuile = 2,5 unités. */
export const cobbleTex = canvasTex(512, 512, (x) => {
  const r = seeded(11), W = 512, rows = 12, cols = 8, h = W / rows, w = W / cols
  x.fillStyle = '#34383f'; x.fillRect(0, 0, W, W)
  const tones = ['#79808a', '#6f757e', '#8a8f96', '#676d77', '#7f7a77', '#747b86', '#8c8883']
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const ox = (j % 2) * (w / 2) + (r() - 0.5) * 3, ww = w - 4 - r() * 3, hh = h - 4
      const X = i * w + ox + 2, Y = j * h + 2
      for (const dx of [-W, 0, W]) {
        const g = x.createLinearGradient(X + dx, Y, X + dx + ww * 0.3, Y + hh)
        const base = tones[(r() * tones.length) | 0]
        g.addColorStop(0, base); g.addColorStop(1, '#5d636c')
        x.fillStyle = g
        rr(x, X + dx, Y, ww, hh, 9); x.fill()
        // arête claire en haut à gauche : le pavé est bombé
        x.strokeStyle = 'rgba(255,255,255,.14)'; x.lineWidth = 2
        x.beginPath(); x.moveTo(X + dx + 6, Y + 3); x.lineTo(X + dx + ww - 8, Y + 3); x.stroke()
        // une petite tache de mica
        for (let k = 0; k < 3; k++) { x.fillStyle = 'rgba(255,255,255,.07)'; x.beginPath(); x.ellipse(X + dx + r() * ww, Y + r() * hh, 3 + r() * 5, 2 + r() * 3, r() * 3, 0, TAU); x.fill() }
      }
    }
  }
  // des mousses dans les joints, ici et là
  for (let i = 0; i < 26; i++) { x.fillStyle = 'rgba(88,120,78,.28)'; x.beginPath(); x.ellipse(r() * W, r() * W, 4 + r() * 8, 2 + r() * 3, r() * 3, 0, TAU); x.fill() }
}, [1, 1])

/** Les dalles du trottoir : grès gris, joints, taches de chewing-gum, une fissure. Une tuile = 2,4 unités. */
export const flagTex = canvasTex(512, 512, (x) => {
  const r = seeded(23), W = 512, cols = 3, rows = 4, w = W / cols, h = W / rows
  x.fillStyle = '#5b5f66'; x.fillRect(0, 0, W, W)
  const tones = ['#a4a6a6', '#9a9c9d', '#aeaeab', '#94979a', '#a09d98']
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const ox = (j % 2) * (w / 2), X = i * w + ox + 3, Y = j * h + 3
      for (const dx of [-W, 0, W]) {
        x.fillStyle = tones[(r() * tones.length) | 0]
        rr(x, X + dx, Y, w - 6, h - 6, 10); x.fill()
        const g = x.createLinearGradient(X + dx, Y, X + dx, Y + h)
        g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(60,60,70,.12)')
        x.fillStyle = g; rr(x, X + dx, Y, w - 6, h - 6, 10); x.fill()
      }
    }
  }
  // grain, taches d'usure, chewing-gum
  for (let i = 0; i < 360; i++) { x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(40,40,50,.07)'; x.beginPath(); x.ellipse(r() * W, r() * W, 2 + r() * 9, 1 + r() * 4, r() * 3, 0, TAU); x.fill() }
  for (let i = 0; i < 14; i++) { x.fillStyle = 'rgba(70,66,66,.55)'; x.beginPath(); x.ellipse(r() * W, r() * W, 2.5 + r() * 1.5, 2 + r(), 0, 0, TAU); x.fill() }
  x.strokeStyle = 'rgba(50,52,58,.7)'; x.lineWidth = 1.6; x.lineJoin = 'round'
  x.beginPath(); x.moveTo(70, 40); x.lineTo(96, 70); x.lineTo(90, 104); x.lineTo(118, 140); x.stroke()
  for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(88,120,78,.3)'; x.beginPath(); x.ellipse(r() * W, ((r() * rows) | 0) * h + 3, 8 + r() * 12, 2, 0, 0, TAU); x.fill() }
}, [1, 1])

/** Le grès blond d'Édimbourg, noirci par les cheminées : assises régulières, joints fins, coulures de pluie. Une tuile = 2 unités. */
export const sandTex = canvasTex(256, 256, (x) => {
  const r = seeded(31), W = 256, rows = 6, h = W / rows
  x.fillStyle = '#9e8a68'; x.fillRect(0, 0, W, W)
  const tones = ['#d6bf94', '#cfb588', '#dcc7a0', '#c9ae82', '#d3ba8e', '#c5b08a']
  for (let j = 0; j < rows; j++) {
    let X = -r() * 50
    while (X < W) {
      const w = 50 + r() * 50
      x.fillStyle = tones[(r() * tones.length) | 0]
      x.fillRect(X + 1.5, j * h + 1.5, w - 3, h - 3)
      for (let k = 0; k < 4; k++) { x.fillStyle = r() < 0.5 ? 'rgba(255,245,225,.10)' : 'rgba(110,80,50,.09)'; x.beginPath(); x.ellipse(X + r() * w, j * h + r() * h, 5 + r() * 12, 3 + r() * 6, 0, 0, TAU); x.fill() }
      X += w
    }
  }
  // les coulures sombres de l'eau de pluie, sous les joints
  for (let i = 0; i < 20; i++) {
    const cx = r() * W, y0 = r() * W * 0.6, len = 40 + r() * 100
    const g = x.createLinearGradient(0, y0, 0, y0 + len)
    g.addColorStop(0, 'rgba(70,50,35,.17)'); g.addColorStop(1, 'rgba(70,50,35,0)')
    x.fillStyle = g; x.fillRect(cx, y0, 3 + r() * 5, len)
  }
}, [1, 1])

/** La brique rouge brun des murs mitoyens : appareil en panneresses, mortier clair. Une tuile = 2 unités. */
export const brickTex = canvasTex(256, 256, (x) => {
  const r = seeded(41), W = 256, rows = 26, cols = 9, h = W / rows, w = W / cols
  x.fillStyle = '#b8aa90'; x.fillRect(0, 0, W, W)
  const tones = ['#93503b', '#8a4636', '#9c5a42', '#7f3f33', '#a2634a', '#8d4a3a']
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols + 1; i++) {
      const X = i * w + (j % 2) * (w / 2) - w / 2
      x.fillStyle = tones[(r() * tones.length) | 0]
      for (const dx of [-W, 0, W]) x.fillRect(X + dx + 1, j * h + 1, w - 2, h - 2)
    }
  }
  for (let i = 0; i < 120; i++) { x.fillStyle = r() < 0.5 ? 'rgba(255,230,200,.07)' : 'rgba(40,20,15,.1)'; x.beginPath(); x.ellipse(r() * W, r() * W, 3 + r() * 10, 2 + r() * 4, 0, 0, TAU); x.fill() }
  for (let i = 0; i < 12; i++) {
    const cx = r() * W, y0 = r() * W * 0.7, len = 30 + r() * 80
    const g = x.createLinearGradient(0, y0, 0, y0 + len)
    g.addColorStop(0, 'rgba(30,20,20,.2)'); g.addColorStop(1, 'rgba(30,20,20,0)')
    x.fillStyle = g; x.fillRect(cx, y0, 4, len)
  }
}, [1, 1])

/** Les ardoises du toit : rangs qui se recouvrent, bas arrondi, bleu gris. Une tuile = 1,6 unité. */
export const slateTex = canvasTex(256, 256, (x) => {
  const r = seeded(51), W = 256, rows = 8, cols = 6, h = W / rows, w = W / cols
  x.fillStyle = '#2d3340'; x.fillRect(0, 0, W, W)
  const tones = ['#586074', '#4f576a', '#626b7f', '#4a5164', '#5a6376']
  for (let j = rows; j >= 0; j--) {
    for (let i = -1; i < cols + 1; i++) {
      const X = i * w + (j % 2) * (w / 2), Y = j * h
      x.fillStyle = tones[(r() * tones.length) | 0]
      for (const dx of [-W, 0, W]) {
        rr(x, X + dx + 1.5, Y - h * 1.35, w - 3, h * 1.35 + h * 0.2, 6); x.fill()
        const g = x.createLinearGradient(0, Y - h * 0.3, 0, Y + h * 0.2)
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(15,18,30,.34)')
        x.fillStyle = g; rr(x, X + dx + 1.5, Y - h * 1.35, w - 3, h * 1.35 + h * 0.2, 6); x.fill()
        x.fillStyle = tones[(r() * tones.length) | 0]
      }
    }
  }
}, [1, 1])

/** La toile d'un auvent : rayures bordeaux et crème. */
export const awningTex = wrapped(
  canvasTex(256, 64, (x) => {
    for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#f1e6cf' : '#8e2f3a'; x.fillRect(i * 32, 0, 32, 64) }
    const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, 'rgba(0,0,0,.14)'); g.addColorStop(0.35, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.12)')
    x.fillStyle = g; x.fillRect(0, 0, 256, 64)
  }),
)

/** L'enseigne du relieur, lettres d'or sur bordeaux. */
export const bookbinderTex = canvasTex(512, 96, (x) => {
  const g = x.createLinearGradient(0, 0, 0, 96); g.addColorStop(0, '#7c2634'); g.addColorStop(1, '#5a1824')
  x.fillStyle = g; x.fillRect(0, 0, 512, 96)
  x.strokeStyle = '#d7b25a'; x.lineWidth = 4; rr(x, 8, 8, 496, 80, 10); x.stroke()
  x.lineWidth = 1.5; rr(x, 14, 14, 484, 68, 7); x.stroke()
  x.fillStyle = '#e2c168'; x.textAlign = 'center'; x.textBaseline = 'middle'
  x.font = 'bold 44px Georgia, "Times New Roman", serif'
  x.fillText('MACRAE & SON', 256, 40)
  x.font = 'italic 22px Georgia, serif'; x.fillStyle = '#e8cf8a'
  x.fillText('Bookbinders · est. 1887', 256, 72)
})

/** Le fantôme d'une réclame peinte sur la brique du mur mitoyen, effacée par cent ans de pluie. Fond transparent. */
export const ghostTex = canvasTex(512, 640, (x) => {
  x.clearRect(0, 0, 512, 640)
  const r = seeded(7)
  x.fillStyle = 'rgba(236,224,196,.5)'; rr(x, 30, 30, 452, 580, 18); x.fill()
  x.fillStyle = 'rgba(120,70,56,.55)'; rr(x, 52, 52, 408, 536, 10); x.fill()
  x.fillStyle = 'rgba(244,236,214,.78)'; x.textAlign = 'center'; x.textBaseline = 'middle'
  x.font = 'bold 74px Georgia, serif'; x.fillText('CRANSTON’S', 256, 130)
  x.font = 'italic 40px Georgia, serif'; x.fillText('Finest Blended', 256, 206)
  x.font = 'bold 96px Georgia, serif'; x.fillText('TEAS', 256, 300)
  // une tasse fumante au milieu
  x.fillStyle = 'rgba(244,236,214,.78)'
  x.beginPath(); x.moveTo(176, 372); x.lineTo(336, 372); x.quadraticCurveTo(330, 470, 256, 478); x.quadraticCurveTo(182, 470, 176, 372); x.fill()
  x.strokeStyle = 'rgba(244,236,214,.78)'; x.lineWidth = 12; x.beginPath(); x.arc(342, 408, 28, -1.2, 1.5); x.stroke()
  x.fillRect(150, 486, 212, 10)
  x.lineWidth = 6; for (const dx of [-30, 0, 30]) { x.beginPath(); x.moveTo(256 + dx, 350); x.bezierCurveTo(240 + dx, 330, 275 + dx, 314, 256 + dx, 292); x.stroke() }
  x.font = 'bold 30px Georgia, serif'; x.fillText('& COFFEES · EDINBURGH', 256, 548)
  // l'usure : des plaques arrachées
  x.globalCompositeOperation = 'destination-out'
  for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(0,0,0,${0.25 + r() * 0.5})`; x.beginPath(); x.ellipse(r() * 512, r() * 640, 8 + r() * 36, 6 + r() * 20, r() * 3, 0, TAU); x.fill() }
  x.globalCompositeOperation = 'source-over'
})

/** La plaque d'un pub : « The Wee Dram », un verre et un chardon. Fond vert bouteille. */
export const pubSignTex = canvasTex(256, 192, (x) => {
  x.fillStyle = '#23463a'; x.fillRect(0, 0, 256, 192)
  x.strokeStyle = '#d7b25a'; x.lineWidth = 6; rr(x, 8, 8, 240, 176, 18); x.stroke()
  x.fillStyle = '#e8cf8a'; x.textAlign = 'center'; x.textBaseline = 'middle'
  x.font = 'bold 36px Georgia, serif'; x.fillText('The Wee Dram', 128, 36)
  // le verre
  x.fillStyle = '#f0c25a'; x.beginPath(); x.moveTo(98, 76); x.lineTo(158, 76); x.lineTo(148, 150); x.lineTo(108, 150); x.closePath(); x.fill()
  x.fillStyle = 'rgba(255,255,255,.45)'; x.fillRect(104, 82, 8, 62)
  x.strokeStyle = '#e8cf8a'; x.lineWidth = 4; x.beginPath(); x.moveTo(96, 74); x.lineTo(160, 74); x.stroke()
  // le chardon
  x.fillStyle = '#9a6cc8'; x.beginPath(); x.ellipse(200, 100, 14, 13, 0, 0, TAU); x.fill()
  x.strokeStyle = '#6fae7a'; x.lineWidth = 5; x.beginPath(); x.moveTo(200, 112); x.lineTo(200, 160); x.stroke()
  x.fillStyle = '#6fae7a'; x.beginPath(); x.ellipse(188, 126, 10, 4, -0.6, 0, TAU); x.fill(); x.beginPath(); x.ellipse(212, 134, 10, 4, 0.6, 0, TAU); x.fill()
  x.fillStyle = '#e8cf8a'; x.font = 'italic 20px Georgia, serif'; x.fillText('Ales & Whisky', 128, 172)
})

/** Un filet de pluie : clair en bas, qui s'efface vers le haut. */
export const streakTex = (() => {
  const t = canvasTex(8, 64, (x) => {
    const g = x.createLinearGradient(0, 0, 0, 64)
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.7, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,.95)')
    x.fillStyle = g; x.fillRect(2, 0, 4, 64)
  })
  return t
})()

/** Un rond dans l'eau : un anneau fin qui s'élargit. */
export const ringTex = canvasTex(128, 128, (x) => {
  const g = x.createRadialGradient(64, 64, 20, 64, 64, 62)
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.6, 'rgba(255,255,255,0)'); g.addColorStop(0.82, 'rgba(255,255,255,.95)'); g.addColorStop(0.92, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, 128, 128)
})

/** Le caniveau : une eau grise qui court, des filets plus clairs dans le sens du courant (v). */
export const gutterTex = wrapped(
  canvasTex(64, 256, (x) => {
    const r = seeded(5)
    const g = x.createLinearGradient(0, 0, 64, 0)
    g.addColorStop(0, '#6c7f92'); g.addColorStop(0.5, '#8fa3b6'); g.addColorStop(1, '#6c7f92')
    x.fillStyle = g; x.fillRect(0, 0, 64, 256)
    for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(235,245,255,${0.3 + r() * 0.5})`; x.beginPath(); x.ellipse(12 + r() * 40, r() * 256, 1.6 + r() * 3, 8 + r() * 16, 0, 0, TAU); x.fill() }
    // les bords de l'eau, plus sombres (le pavé mouillé)
    x.fillStyle = 'rgba(30,40,55,.4)'; x.fillRect(0, 0, 6, 256); x.fillRect(58, 0, 6, 256)
  }),
)

/** Une flaque de lumière qui s'étale (réverbère, devanture) : blanc au centre, rien au bord. */
export const poolTex = canvasTex(128, 128, (x) => {
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, 128, 128)
})

/** Le fondu du sol sur ses bords (alphaMap, jamais répétée). */
export const streetFade = canvasTex(256, 256, (x) => {
  const g = x.createRadialGradient(128, 128, 70, 128, 128, 128)
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, '#ffffff'); g.addColorStop(1, '#000000')
  x.fillStyle = g; x.fillRect(0, 0, 256, 256)
})

/** L'ardoise du trottoir devant le café : la soupe du jour, à la craie. */
export const aboardTex = canvasTex(256, 320, (x) => {
  x.fillStyle = '#2c3a35'; x.fillRect(0, 0, 256, 320)
  x.strokeStyle = '#e9e2cf'; x.lineWidth = 3; x.setLineDash([10, 6]); rr(x, 12, 12, 232, 296, 12); x.stroke(); x.setLineDash([])
  x.fillStyle = '#f2ecda'; x.textAlign = 'center'; x.textBaseline = 'middle'
  x.font = 'bold 40px "Comic Sans MS", cursive'; x.fillText('Soup of', 128, 62)
  x.fillText('the day', 128, 104)
  x.font = 'italic 30px Georgia, serif'; x.fillStyle = '#f2c46b'; x.fillText('Cullen skink', 128, 164)
  x.strokeStyle = '#f2ecda'; x.lineWidth = 4; x.beginPath(); x.moveTo(60, 196); x.lineTo(196, 196); x.stroke()
  x.fillStyle = '#f2ecda'; x.font = '24px Georgia, serif'
  x.fillText('+ tablet & tea', 128, 232)
  // une tasse fumante
  x.strokeStyle = '#f2ecda'; x.lineWidth = 4
  x.beginPath(); x.moveTo(98, 262); x.lineTo(150, 262); x.quadraticCurveTo(148, 292, 124, 294); x.quadraticCurveTo(100, 292, 98, 262); x.stroke()
  x.beginPath(); x.arc(154, 272, 9, -1.3, 1.4); x.stroke()
})
