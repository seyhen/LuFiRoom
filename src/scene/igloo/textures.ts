import { CanvasTexture, RepeatWrapping } from 'three'
import { TAU } from '../../math'
import { canvasTex, rr, seeded } from '../paint'

// Textures de l'igloo : blocs de neige taillés, sol de neige tassée, fourrures, duvet matelassé, aurore, grille de la radio.

/**
 * Les blocs de neige du dôme, posés en rangs décalés : chaque bloc un peu plus clair au milieu et bleuté sur le bas (la neige
 * tassée), des joints fins d'un bleu gris. La tuile fait le tour d'un demi-dôme en largeur (u) et monte du sommet à la base (v).
 */
export const blockTex = canvasTex(1024, 512, (x) => {
  const r = seeded(4), W = 1024, H = 512, ROWS = 7
  x.fillStyle = '#c9d8e8'
  x.fillRect(0, 0, W, H)
  for (let j = 0; j < ROWS; j++) {
    // près du sommet, les rangs ont moins de blocs (le dôme se resserre) ; à la base, une douzaine sur le demi-tour
    const y0 = (j / ROWS) * H, y1 = ((j + 1) / ROWS) * H, n = Math.max(3, Math.round(3 + j * 1.6)), bw = W / n, off = (j % 2) * bw * 0.5
    for (let i = -1; i <= n; i++) {
      const x0 = i * bw + off + 3, bx = bw - 6, by = y1 - y0 - 6, t = r()
      const g = x.createLinearGradient(0, y0, 0, y1)
      const l = 238 + t * 12
      g.addColorStop(0, `rgb(${l},${l + 3},${Math.min(255, l + 8)})`)
      g.addColorStop(0.7, `rgb(${l - 8},${l - 3},${Math.min(255, l + 4)})`)
      g.addColorStop(1, `rgb(${l - 26},${l - 16},${l - 4})`)
      x.fillStyle = g
      rr(x, x0, y0 + 3, bx, by, 10)
      x.fill()
      // le grain de la neige taillée : quelques traces de scie, très pâles
      x.strokeStyle = 'rgba(160, 186, 214, .18)'
      x.lineWidth = 1.5
      for (let k = 0; k < 3; k++) {
        const yy = y0 + 8 + r() * (by - 10)
        x.beginPath(); x.moveTo(x0 + 8, yy); x.lineTo(x0 + bx - 8, yy + (r() - 0.5) * 4); x.stroke()
      }
    }
  }
}, [1, 1])
blockTex.wrapT = RepeatWrapping

/** Le sol de neige tassée : blanc bleuté, des traces de pas adoucies et des ombres pâles. Tuile 2 × 2 unités. */
export const floorTex = canvasTex(256, 256, (x) => {
  const r = seeded(11)
  x.fillStyle = '#e8eff6'
  x.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 26; i++) {
    const cx = r() * 256, cy = r() * 256, rad = 14 + r() * 30
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad)
    g.addColorStop(0, 'rgba(176, 200, 226, .32)')
    g.addColorStop(1, 'rgba(176, 200, 226, 0)')
    x.fillStyle = g
    x.fillRect(cx - rad, cy - rad, rad * 2, rad * 2)
  }
  for (let i = 0; i < 900; i++) {
    x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.7)' : 'rgba(170,196,224,.35)'
    x.fillRect(r() * 256, r() * 256, 1.5, 1.5)
  }
}, [2, 2])

/** Une fourrure : un fond et des milliers de poils courts, couchés dans le même sens, plus clairs au bout. */
function furTex(base: string, tip: string, dark: string, seed: number) {
  return canvasTex(256, 256, (x) => {
    const r = seeded(seed)
    x.fillStyle = base
    x.fillRect(0, 0, 256, 256)
    x.lineCap = 'round'
    for (let i = 0; i < 2600; i++) {
      const px = r() * 256, py = r() * 256, a = 1.2 + (r() - 0.5) * 0.7, len = 5 + r() * 7
      x.strokeStyle = r() < 0.18 ? dark : tip
      x.globalAlpha = 0.35 + r() * 0.4
      x.lineWidth = 1 + r() * 1.2
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * len, py + Math.sin(a) * len); x.stroke()
    }
    x.globalAlpha = 1
  }, [1, 1])
}
/** Peau de renne : brun chaud, poil clair. */
export const reindeerTex = furTex('#8a6448', '#c9a27e', '#5a3e2c', 3)
/** Peau de mouton : crème. */
export const fleeceTex = furTex('#e8dccb', '#fbf4e8', '#bfae98', 5)
/** Fourrure grise (le bord des moufles, la capuche) */
export const greyFurTex = furTex('#9a9690', '#d8d2c8', '#6a6662', 8)

/** Le duvet rouille, matelassé : des boudins séparés par des coutures plus sombres. */
export const quiltTex = canvasTex(128, 128, (x) => {
  const g = x.createLinearGradient(0, 0, 0, 32)
  g.addColorStop(0, '#c4552e'); g.addColorStop(0.5, '#d86a3e'); g.addColorStop(1, '#a8452a')
  for (let i = 0; i < 4; i++) {
    x.save(); x.translate(0, i * 32); x.fillStyle = g; x.fillRect(0, 0, 128, 32); x.restore()
  }
  x.strokeStyle = 'rgba(80, 24, 12, .5)'; x.lineWidth = 2
  for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(0, i * 32); x.lineTo(128, i * 32); x.stroke() }
}, [1, 3])

/**
 * L'aurore : un rideau de lumière, vert en bas, turquoise puis rose pâle en haut, strié de plis verticaux, qui s'efface vers le
 * haut et vers le bas. La texture défile en x (le rideau ondule) : elle se raccorde d'un bord à l'autre.
 */
export const auroraTex = (() => {
  const t = canvasTex(512, 256, (x) => {
    const r = seeded(21)
    const g = x.createLinearGradient(0, 256, 0, 0)
    g.addColorStop(0, 'rgba(90, 255, 170, 0)')
    g.addColorStop(0.12, 'rgba(110, 255, 180, .95)')
    g.addColorStop(0.45, 'rgba(90, 230, 210, .6)')
    g.addColorStop(0.8, 'rgba(230, 140, 220, .3)')
    g.addColorStop(1, 'rgba(230, 140, 220, 0)')
    x.fillStyle = g
    x.fillRect(0, 0, 512, 256)
    // les plis : des bandes verticales plus claires et plus sombres, raccordées en x
    x.globalCompositeOperation = 'destination-out'
    for (let i = 0; i < 40; i++) {
      const cx = r() * 512, w = 6 + r() * 26, a = 0.25 + r() * 0.5
      for (const dx of [-512, 0, 512]) {
        const h = x.createLinearGradient(cx + dx - w, 0, cx + dx + w, 0)
        h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(0.5, `rgba(0,0,0,${a})`); h.addColorStop(1, 'rgba(0,0,0,0)')
        x.fillStyle = h
        x.fillRect(cx + dx - w, 0, w * 2, 256)
      }
    }
    x.globalCompositeOperation = 'source-over'
  })
  t.wrapS = RepeatWrapping
  return t
})()

/**
 * Le masque d'un rideau d'aurore (en niveaux de gris) : plein au milieu, effacé doucement vers les deux bouts, vers le haut et
 * vers le bas, et un bord inférieur qui ondule. Il ne défile pas : seule la lumière du rideau (`auroraTex`) glisse dessous.
 */
export const curtainMask = canvasTex(256, 128, (x) => {
  const img = x.createImageData(256, 128), d = img.data
  for (let j = 0; j < 128; j++) for (let i = 0; i < 256; i++) {
    const u = i / 255, v = 1 - j / 127
    const ends = Math.sin(Math.PI * u) ** 1.6
    const floor = 0.16 + 0.07 * Math.sin(u * TAU * 2.3) + 0.04 * Math.sin(u * TAU * 5.1)
    const bottom = Math.min(1, Math.max(0, (v - floor) / 0.12)), top = Math.min(1, Math.max(0, (1 - v) / 0.45))
    const a = Math.round(255 * ends * bottom * top), o = (j * 256 + i) * 4
    d[o] = d[o + 1] = d[o + 2] = a
    d[o + 3] = 255
  }
  x.putImageData(img, 0, 0)
})

/** La grille du haut-parleur de la radio : des trous ronds en quinconce sur fond sombre. */
export const grilleTex = canvasTex(128, 128, (x) => {
  x.fillStyle = '#3a3634'
  x.fillRect(0, 0, 128, 128)
  x.fillStyle = '#141212'
  for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) {
    x.beginPath(); x.arc(8 + i * 14 + (j % 2) * 7, 8 + j * 14, 4, 0, TAU); x.fill()
  }
})

/** Les ronds dans l'eau du trou de pêche : un anneau clair qui s'efface vers le dehors. */
export const ringTex = (() => {
  const t = canvasTex(128, 128, (x) => {
    const g = x.createRadialGradient(64, 64, 40, 64, 64, 62)
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.55, 'rgba(220,240,255,.9)'); g.addColorStop(1, 'rgba(220,240,255,0)')
    x.fillStyle = g
    x.fillRect(0, 0, 128, 128)
  })
  return t as CanvasTexture
})()

/** Le cadran de la radio : fond crème, graduations, deux bandes (FM / AM) et leurs chiffres, l'aiguille rouge. */
export const dialTex = canvasTex(256, 96, (x) => {
  x.fillStyle = '#fff1cc'
  x.fillRect(0, 0, 256, 96)
  x.strokeStyle = '#5a4a3a'
  x.fillStyle = '#5a4a3a'
  x.font = 'bold 15px sans-serif'
  x.textAlign = 'center'
  for (const [y, nums, tag] of [[30, ['88', '92', '96', '100', '104', '108'], 'FM'], [72, ['53', '60', '80', '100', '130', '160'], 'AM']] as const) {
    x.fillText(tag, 18, y + 5)
    for (let i = 0; i <= 30; i++) {
      const px = 40 + i * 6.8, h = i % 6 === 0 ? 10 : 5
      x.lineWidth = i % 6 === 0 ? 2 : 1
      x.beginPath(); x.moveTo(px, y + 8); x.lineTo(px, y + 8 - h); x.stroke()
    }
    nums.forEach((n, i) => x.fillText(n, 40 + i * 40.8, y - 6))
  }
  x.fillStyle = '#d8402e'
  x.fillRect(150, 6, 4, 84)
})

/** Le pochoir des caisses de l'expédition : « VIVRES », un numéro, une flèche « haut », sur bois clair. */
export const stencilTex = canvasTex(256, 128, (x) => {
  x.fillStyle = 'rgba(0,0,0,0)'
  x.fillRect(0, 0, 256, 128)
  x.fillStyle = 'rgba(40, 28, 20, .82)'
  x.font = 'bold 44px monospace'
  x.textAlign = 'center'
  x.fillText('VIVRES', 128, 62)
  x.font = 'bold 22px monospace'
  x.fillText('EXP. N° 7  ↑', 128, 100)
})

/** La glace claire de la fenêtre : un bleu très pâle, des bulles prises dedans, quelques fêlures et le givre aux bords. */
export const iceTex = canvasTex(256, 192, (x) => {
  const r = seeded(17)
  const g = x.createRadialGradient(128, 96, 20, 128, 96, 150)
  g.addColorStop(0, 'rgba(225, 245, 255, .15)'); g.addColorStop(0.75, 'rgba(210, 236, 250, .35)'); g.addColorStop(1, 'rgba(255, 255, 255, .9)')
  x.fillStyle = g
  x.fillRect(0, 0, 256, 192)
  for (let i = 0; i < 60; i++) {
    const cx = r() * 256, cy = r() * 192, rad = 1 + r() * 4
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 1
    x.beginPath(); x.arc(cx, cy, rad, 0, TAU); x.stroke()
  }
  x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 1.5
  for (let i = 0; i < 5; i++) {
    let px = r() * 256, py = r() * 192
    x.beginPath(); x.moveTo(px, py)
    for (let k = 0; k < 4; k++) { px += (r() - 0.5) * 60; py += (r() - 0.5) * 50; x.lineTo(px, py) }
    x.stroke()
  }
  // le givre, qui pousse depuis les coins en fougères blanches sur un voile laiteux
  for (const [cx, cy] of [[0, 0], [256, 0], [0, 192], [256, 192]]) {
    const v = x.createRadialGradient(cx, cy, 0, cx, cy, 70)
    v.addColorStop(0, 'rgba(255,255,255,.85)'); v.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = v
    x.fillRect(0, 0, 256, 192)
    x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 1.4
    const base = Math.atan2(96 - cy, 128 - cx)
    for (let i = 0; i < 5; i++) {
      const a = base + (i - 2) * 0.28, len = 34 + r() * 26
      const ex = cx + Math.cos(a) * len, ey = cy + Math.sin(a) * len
      x.beginPath(); x.moveTo(cx, cy); x.lineTo(ex, ey); x.stroke()
      // les barbes de la fougère, de chaque côté de la tige
      for (let k = 1; k < 5; k++) {
        const f = k / 5, bx = cx + (ex - cx) * f, by = cy + (ey - cy) * f, bl = (1 - f) * 10 + 3
        for (const sd of [-1, 1]) {
          x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + Math.cos(a + sd * 0.7) * bl, by + Math.sin(a + sd * 0.7) * bl); x.stroke()
        }
      }
    }
  }
})

/** L'eau du trou : bleu nuit au fond, plus clair vers le bord de glace, et un reflet pâle. */
export const holeTex = canvasTex(128, 128, (x) => {
  const g = x.createRadialGradient(64, 64, 4, 64, 64, 64)
  g.addColorStop(0, '#08182a'); g.addColorStop(0.7, '#14385a'); g.addColorStop(1, '#3f7aa0')
  x.fillStyle = g
  x.fillRect(0, 0, 128, 128)
  x.fillStyle = 'rgba(220, 240, 255, .25)'
  x.beginPath(); x.ellipse(46, 40, 26, 9, -0.5, 0, TAU); x.fill()
})

/** L'étiquette d'une boîte de cacao : crème et brun, une tasse fumante dessinée, « CACAO ». */
export const cocoaTinTex = canvasTex(256, 96, (x) => {
  x.fillStyle = '#7a3e24'
  x.fillRect(0, 0, 256, 96)
  x.fillStyle = '#f4e4c8'
  x.fillRect(0, 22, 256, 52)
  x.fillStyle = '#7a3e24'
  x.font = 'bold 34px serif'
  x.textAlign = 'center'
  x.fillText('CACAO', 128, 60)
}, [1, 1])

/**
 * La glace du lac, dégagée à la pelle autour du trou : un bleu clair qui fonce vers le milieu, de longues fêlures blanches qui
 * rayonnent depuis le trou, des bulles prises dans la glace et un voile de neige poudreuse vers le bord. Tuile 2 × 2 unités.
 */
export const lakeIceTex = canvasTex(256, 256, (x) => {
  const r = seeded(23)
  const g = x.createRadialGradient(128, 128, 20, 128, 128, 140)
  g.addColorStop(0, '#5f9ec4'); g.addColorStop(0.45, '#8cc4e0'); g.addColorStop(1, '#d6ecf6')
  x.fillStyle = g
  x.fillRect(0, 0, 256, 256)
  // les fêlures, du trou vers le bord
  x.lineCap = 'round'
  for (let i = 0; i < 9; i++) {
    let a = (i / 9) * TAU + r() * 0.4, d = 40
    let px = 128 + Math.cos(a) * d, py = 128 + Math.sin(a) * d
    x.strokeStyle = `rgba(255,255,255,${0.35 + r() * 0.35})`
    x.lineWidth = 1 + r() * 1.5
    x.beginPath(); x.moveTo(px, py)
    for (let k = 0; k < 5; k++) {
      a += (r() - 0.5) * 0.6; d += 12 + r() * 14
      px = 128 + Math.cos(a) * d; py = 128 + Math.sin(a) * d
      x.lineTo(px, py)
    }
    x.stroke()
  }
  // les bulles prises dans la glace
  for (let i = 0; i < 70; i++) {
    const cx = r() * 256, cy = r() * 256, rad = 1 + r() * 3.5
    x.strokeStyle = 'rgba(240,250,255,.6)'; x.lineWidth = 1
    x.beginPath(); x.arc(cx, cy, rad, 0, TAU); x.stroke()
  }
  // la neige poudreuse que la pelle a laissée, vers le bord
  for (let i = 0; i < 40; i++) {
    const a = r() * TAU, d = 95 + r() * 30, cx = 128 + Math.cos(a) * d, cy = 128 + Math.sin(a) * d, rad = 8 + r() * 18
    const h = x.createRadialGradient(cx, cy, 0, cx, cy, rad)
    h.addColorStop(0, 'rgba(255,255,255,.55)'); h.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = h
    x.fillRect(cx - rad, cy - rad, rad * 2, rad * 2)
  }
})

/** Des poils courts couchés le long de u (le sens du pelage sur un boudin `puff`), de la couleur `c`, sur la zone qu'on peint. */
function strokes(x: CanvasRenderingContext2D, r: () => number, W: number, H: number, n: number, color: (v: number) => string) {
  x.lineCap = 'round'
  for (let i = 0; i < n; i++) {
    const px = r() * W, py = r() * H, len = 4 + r() * 8, a = (r() - 0.5) * 0.5
    x.strokeStyle = color(1 - py / H)
    x.globalAlpha = 0.12 + r() * 0.2
    x.lineWidth = 1 + r()
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * len, py + Math.sin(a) * len); x.stroke()
  }
  x.globalAlpha = 1
}

/**
 * Le pelage du husky, peint sur son corps roulé (un `puff` : u des hanches au poitrail, v autour). v = 0,25 est le ventre (le dedans
 * de la boucle), v = 0,75 le dos : la selle gris foncé sur le dos, les flancs gris, le ventre et le dessous blancs, avec un passage
 * doux de l'un à l'autre, et des poils couchés vers la tête.
 */
export const huskyTex = canvasTex(512, 256, (x) => {
  const r = seeded(41), W = 512, H = 256
  // du bas de la texture (v = 0) vers le haut (v = 1) : une bande verticale par couleur, en dégradé
  const g = x.createLinearGradient(0, H, 0, 0)
  g.addColorStop(0, '#f0f2f4'); g.addColorStop(0.36, '#f0f2f4'); g.addColorStop(0.46, '#8a939e'); g.addColorStop(0.56, '#5a636e')
  g.addColorStop(0.66, '#3e4650'); g.addColorStop(0.8, '#4a535e'); g.addColorStop(0.9, '#8a939e'); g.addColorStop(0.97, '#f0f2f4'); g.addColorStop(1, '#f0f2f4')
  x.fillStyle = g
  x.fillRect(0, 0, W, H)
  strokes(x, r, W, H, 3200, (v) => (v > 0.42 && v < 0.92 ? (r() < 0.5 ? '#9aa3ad' : '#4a525c') : r() < 0.5 ? '#ffffff' : '#dde2e8'))
}, [1, 1])

/** La queue en panache : grise dessus avec une ligne plus sombre, blanche dessous et blanche au bout (u > 0,8). */
export const tailTex = canvasTex(256, 64, (x) => {
  const r = seeded(43), W = 256, H = 64
  const g = x.createLinearGradient(0, H, 0, 0)
  g.addColorStop(0, '#f0f2f4'); g.addColorStop(0.3, '#e4e8ec'); g.addColorStop(0.4, '#7a8490'); g.addColorStop(0.5, '#454d58')
  g.addColorStop(0.6, '#7a8490'); g.addColorStop(0.7, '#e4e8ec'); g.addColorStop(1, '#f0f2f4')
  x.fillStyle = g
  x.fillRect(0, 0, W, H)
  const t = x.createLinearGradient(0, 0, W, 0)
  t.addColorStop(0.72, 'rgba(240,242,244,0)'); t.addColorStop(0.84, 'rgba(240,242,244,1)')
  x.fillStyle = t
  x.fillRect(0, 0, W, H)
  strokes(x, r, W, H, 900, (v) => (v > 0.38 && v < 0.62 ? '#5a636e' : '#ffffff'))
}, [1, 1])

/**
 * Le sac de couchage momie, rouille : les coutures entre les boudins (le relief vient de la forme, la couture assombrit le creux),
 * la fermeture éclair qui court le long du flanc côté caméra (v ≈ 0,31) et sa tirette, un liseré plus clair en bas.
 */
export const bagTex = canvasTex(512, 128, (x) => {
  const W = 512, H = 128
  x.fillStyle = '#c4552e'
  x.fillRect(0, 0, W, H)
  // un léger dégradé de nylon : plus clair sur le dessus
  const g = x.createLinearGradient(0, H, 0, 0)
  g.addColorStop(0, 'rgba(90,30,14,.25)'); g.addColorStop(0.5, 'rgba(255,170,120,.18)'); g.addColorStop(1, 'rgba(90,30,14,.25)')
  x.fillStyle = g
  x.fillRect(0, 0, W, H)
  for (let k = 1; k < 9; k++) {
    const px = (k / 9) * W
    x.fillStyle = 'rgba(70, 20, 8, .45)'
    x.fillRect(px - 2, 0, 4, H)
  }
  // la fermeture éclair : un ruban sombre et fin, ses dents à peine plus claires
  const zy = H * (1 - 0.31)
  x.fillStyle = '#5a2414'
  x.fillRect(W * 0.04, zy - 2, W * 0.88, 4)
  x.fillStyle = 'rgba(200, 160, 140, .35)'
  for (let px = W * 0.04; px < W * 0.92; px += 4) x.fillRect(px, zy - 1, 2, 2)
}, [1, 1])

/** La couverture de laine jetée sur les pieds : rouge, deux larges bandes crème en travers, une trame de laine. */
export const drapeTex = canvasTex(256, 128, (x) => {
  const r = seeded(47), W = 256, H = 128
  x.fillStyle = '#b83a32'
  x.fillRect(0, 0, W, H)
  for (const [a, b] of [[0.16, 0.24], [0.66, 0.74]]) {
    x.fillStyle = '#eee4d0'
    x.fillRect(a * W, 0, (b - a) * W, H)
    x.fillStyle = '#2f5a6a'
    x.fillRect(a * W + (b - a) * W * 0.4, 0, (b - a) * W * 0.2, H)
  }
  for (let i = 0; i < 1400; i++) {
    x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'
    x.fillRect(r() * W, r() * H, 2, 1)
  }
}, [1, 1])

/** La flanelle à carreaux qui double la capuche du sac. */
export const plaidTex = canvasTex(64, 64, (x) => {
  x.fillStyle = '#efe2c8'
  x.fillRect(0, 0, 64, 64)
  x.fillStyle = 'rgba(184, 58, 50, .55)'
  for (const p of [8, 40]) { x.fillRect(p, 0, 12, 64); x.fillRect(0, p, 64, 12) }
  x.fillStyle = 'rgba(47, 90, 106, .5)'
  for (const p of [26, 58]) { x.fillRect(p, 0, 3, 64); x.fillRect(0, p, 64, 3) }
}, [3, 3])
