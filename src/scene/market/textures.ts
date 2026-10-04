import { TAU } from '../../math'
import { canvasTex, poly, rr, seeded } from '../paint'

// Les textures du marché de nuit, dessinées une fois : pavés mouillés, briques fumées, rideau de fer, enseigne au néon, noren,
// menu, distributeur, tram et passants sous leurs parapluies (ce qu'on voit par la baie), anneaux de pluie dans les flaques.

const JP = '"Yu Gothic","Hiragino Sans","Meiryo","Noto Sans JP","Noto Sans CJK JP",sans-serif'

/** Pavés sombres et luisants de pluie, joints noirs, reflets pâles sur le dessus de chacun. Tuile 1 × 1. */
export const pavingTex = canvasTex(256, 256, (x) => {
  const r = seeded(3)
  x.fillStyle = '#17122a'; x.fillRect(0, 0, 256, 256)
  const cols = 6, rows = 6, w = 256 / cols, h = 256 / rows
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const px = i * w + (j % 2 ? w / 2 : 0) + 2, py = j * h + 2, v = r() * 22, hi = r() * 0.12
    const col = `rgb(${(88 + v) | 0},${(78 + v) | 0},${(116 + v) | 0})`
    for (const ox of j % 2 && i === cols - 1 ? [0, -256] : [0]) {
      x.fillStyle = col
      rr(x, px + ox, py, w - 4, h - 4, 7); x.fill()
      x.fillStyle = `rgba(190,180,230,${0.1 + hi})`
      rr(x, px + ox + 4, py + 3, (w - 12) * 0.6, 5, 3); x.fill()
    }
  }
}, [1, 1])

/** Briques de façade fumées, en appareil à joints décalés, avec des coulures de suie et de pluie. Tuile 1 × 1. */
export const brickTex = canvasTex(256, 256, (x) => {
  const r = seeded(8)
  x.fillStyle = '#2a1d2c'; x.fillRect(0, 0, 256, 256)
  const rows = 12, bw = 64, bh = 256 / rows
  for (let j = 0; j < rows; j++) for (let i = -1; i < 4; i++) {
    const px = i * bw + (j % 2 ? bw / 2 : 0), py = j * bh, v = r() * 26
    x.fillStyle = `rgb(${(116 + v) | 0},${(66 + v * 0.5) | 0},${(72 + v * 0.6) | 0})`
    rr(x, px + 1.5, py + 1.5, bw - 3, bh - 3, 3); x.fill()
    x.fillStyle = `rgba(255,200,190,${r() * 0.1})`; x.fillRect(px + 4, py + 3, bw - 10, 3)
  }
  for (let k = 0; k < 14; k++) {
    const px = r() * 256, g = x.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, 'rgba(18,10,24,.34)'); g.addColorStop(1, 'rgba(18,10,24,0)')
    x.fillStyle = g; x.fillRect(px, 0, 2 + r() * 6, 80 + r() * 176)
  }
}, [1, 1])

/** Rideau de fer ondulé, bleu-gris, taché de rouille vers le bas. Tuile 1 × 1 (seize ondes). */
export const shutterTex = canvasTex(256, 256, (x) => {
  const r = seeded(14)
  for (let i = 0; i < 16; i++) {
    const g = x.createLinearGradient(i * 16, 0, i * 16 + 16, 0)
    g.addColorStop(0, '#506278'); g.addColorStop(0.45, '#8ea0b8'); g.addColorStop(1, '#4a5a70')
    x.fillStyle = g; x.fillRect(i * 16, 0, 16, 256)
  }
  for (let k = 0; k < 18; k++) {
    const px = r() * 256, g = x.createLinearGradient(0, 120, 0, 256)
    g.addColorStop(0, 'rgba(140,70,40,0)'); g.addColorStop(1, `rgba(140,70,40,${0.2 + r() * 0.3})`)
    x.fillStyle = g; x.fillRect(px, 120, 3 + r() * 10, 136)
  }
  x.fillStyle = 'rgba(14,12,22,.5)'
  for (let i = 0; i < 4; i++) x.fillRect(0, 60 + i * 56, 256, 3)
}, [1, 1])

/** L'enseigne au néon : « ラーメン » à la verticale en tubes roses, avec leur halo, et un cadre ; fond transparent. */
export const neonTex = canvasTex(256, 512, (x) => {
  x.textAlign = 'center'; x.textBaseline = 'middle'
  const draw = (blur: number, col: string, w: number) => {
    x.shadowColor = '#ff2fa0'; x.shadowBlur = blur; x.strokeStyle = col; x.lineWidth = w; x.lineJoin = 'round'
    rr(x, 28, 24, 200, 464, 36); x.stroke()
    x.font = `bold 108px ${JP}`
    ;['ラ', 'ー', 'メ', 'ン'].forEach((c, i) => { x.strokeText(c, 128, 96 + i * 110) })
  }
  draw(28, 'rgba(255,60,170,.9)', 11)
  draw(14, 'rgba(255,110,200,1)', 7)
  draw(0, 'rgba(255,235,248,1)', 2.6)
})

/** Le même, éteint : les tubes de verre sont gris. */
export const neonOffTex = canvasTex(256, 512, (x) => {
  x.textAlign = 'center'; x.textBaseline = 'middle'
  x.strokeStyle = 'rgba(150,120,150,.55)'; x.lineWidth = 6; x.lineJoin = 'round'
  rr(x, 28, 24, 200, 464, 36); x.stroke()
  x.font = `bold 108px ${JP}`
  ;['ラ', 'ー', 'メ', 'ン'].forEach((c, i) => { x.strokeText(c, 128, 96 + i * 110) })
})

/** Le noren : trois pans d'indigo fendus par le milieu, un caractère blanc au centre de chacun. Fond transparent. */
export const norenTex = canvasTex(384, 192, (x) => {
  const chars = ['ラ', '麺', 'ン']
  chars.forEach((c, i) => {
    const px = i * 128 + 6, g = x.createLinearGradient(0, 0, 0, 192)
    g.addColorStop(0, '#26337a'); g.addColorStop(1, '#1a2358')
    x.fillStyle = g; x.fillRect(px, 0, 116, 186)
    x.fillStyle = 'rgba(255,255,255,.06)'
    for (let s = 0; s < 8; s++) x.fillRect(px + s * 15, 0, 3, 186)
    x.fillStyle = '#f6efe0'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `bold 92px ${JP}`
    x.fillText(c, px + 58, 94)
    x.fillRect(px, 0, 116, 8)
    x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(px, 178, 116, 8)
  })
})

/** Le menu cloué sur une planche : quatre lignes à la craie sur du bois noir. */
export const menuTex = canvasTex(256, 192, (x) => {
  x.fillStyle = '#22181a'; x.fillRect(0, 0, 256, 192)
  const r = seeded(6)
  for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,255,255,${r() * 0.04})`; x.fillRect(0, r() * 192, 256, 1) }
  x.fillStyle = '#f2ead6'; x.textBaseline = 'middle'
  x.textAlign = 'center'; x.font = `bold 26px ${JP}`; x.fillText('お品書き', 128, 28)
  x.font = `bold 21px ${JP}`
  ;[['醤油らーめん', '800'], ['味噌らーめん', '900'], ['餃子', '400'], ['ビール', '500']].forEach(([n, p], i) => {
    x.textAlign = 'left'; x.fillText(n, 22, 72 + i * 30)
    x.textAlign = 'right'; x.fillText(`¥${p}`, 236, 72 + i * 30)
  })
  x.strokeStyle = 'rgba(242,234,214,.5)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(18, 46); x.lineTo(238, 46); x.stroke()
})

/** La face du distributeur : un bandeau lumineux, quatre rangées de canettes colorées, la fente, le bac. Éclairé de l'intérieur. */
export const vendingTex = canvasTex(128, 256, (x) => {
  x.fillStyle = '#e8e4f0'; x.fillRect(0, 0, 128, 256)
  x.fillStyle = '#ff5fa8'; x.fillRect(0, 0, 128, 26)
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `bold 15px ${JP}`; x.fillText('つめたい', 64, 14)
  const cols = ['#ff6b6b', '#ffd45e', '#5ed6c8', '#7aa8ff', '#c58bff', '#ff9f5e', '#7fe08a']
  for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) {
    const px = 10 + i * 18.5, py = 36 + j * 38
    x.fillStyle = cols[(i * 3 + j * 5 + i * j) % cols.length]
    rr(x, px, py, 13, 26, 4); x.fill()
    x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(px + 2, py + 3, 3, 14)
    x.fillStyle = '#333'; x.fillRect(px + 2, py + 29, 9, 4)
  }
  x.fillStyle = '#2a2638'; rr(x, 12, 196, 104, 34, 6); x.fill()
  x.fillStyle = '#cdd2e0'; x.fillRect(96, 232, 18, 10); x.fillStyle = '#1b1828'; x.fillRect(100, 236, 10, 3)
})

/** Une affiche de cinéma délavée, à décliner : dégradé, un grand disque, des collines, des lettres. */
export const posterTex = (hue: string, hue2: string, seed: number) =>
  canvasTex(128, 192, (x) => {
    const r = seeded(seed), g = x.createLinearGradient(0, 0, 0, 192)
    g.addColorStop(0, hue); g.addColorStop(1, hue2)
    x.fillStyle = g; x.fillRect(0, 0, 128, 192)
    x.fillStyle = 'rgba(255,245,225,.85)'; x.beginPath(); x.arc(64, 74, 34, 0, TAU); x.fill()
    poly(x, [[0, 120], [34, 96], [60, 112], [92, 90], [128, 116], [128, 192], [0, 192]], 'rgba(30,20,50,.8)')
    x.fillStyle = 'rgba(255,245,225,.9)'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `bold 20px ${JP}`
    x.fillText('夜の映画', 64, 156)
    x.fillRect(20, 172, 88, 3)
    for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(255,255,255,${r() * 0.06})`; x.fillRect(r() * 128, r() * 192, 1 + r() * 8, 1) }
    x.strokeStyle = 'rgba(0,0,0,.2)'; x.lineWidth = 3; x.strokeRect(0, 0, 128, 192)
  })

/** La lanterne de papier : rouge, côtelée, deux liserés noirs, un caractère sur la panse (deux fois : elle tourne). */
export const lanternTex = canvasTex(256, 128, (x) => {
  const g = x.createLinearGradient(0, 0, 0, 128)
  g.addColorStop(0, '#ff6a50'); g.addColorStop(0.5, '#ff8a68'); g.addColorStop(1, '#ff6a50')
  x.fillStyle = g; x.fillRect(0, 0, 256, 128)
  x.strokeStyle = 'rgba(120,20,20,.45)'; x.lineWidth = 2
  for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(0, 14 + i * 12); x.lineTo(256, 14 + i * 12); x.stroke() }
  x.fillStyle = '#1a0f12'; x.fillRect(0, 0, 256, 12); x.fillRect(0, 116, 256, 12)
  x.fillStyle = '#2a1014'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `bold 68px ${JP}`
  x.fillText('麺', 64, 66); x.fillText('麺', 192, 66)
})

/** Le tram vu de côté : caisse crème et rouge, fenêtres allumées, perche sur le toit. */
export const tramTex = canvasTex(640, 120, (x) => {
  x.fillStyle = '#1a1226'; rr(x, 8, 18, 624, 86, 10); x.fill()
  x.fillStyle = '#e9d9bc'; rr(x, 8, 18, 624, 70, 10); x.fill()
  x.fillStyle = '#c4323f'; x.fillRect(8, 70, 624, 16)
  x.fillStyle = '#2a2236'; x.fillRect(8, 87, 624, 12)
  for (let i = 0; i < 9; i++) {
    const px = 28 + i * 67
    const g = x.createLinearGradient(0, 26, 0, 62)
    g.addColorStop(0, '#ffe9a8'); g.addColorStop(1, '#ffc46a')
    x.fillStyle = g; rr(x, px, 26, 50, 36, 6); x.fill()
    x.fillStyle = 'rgba(40,20,20,.5)'; x.beginPath(); x.arc(px + 15 + (i % 3) * 8, 46, 6, 0, TAU); x.fill()
    x.fillRect(px + 12 + (i % 3) * 8, 48, 6, 14)
  }
  x.fillStyle = '#ffe9a8'; x.beginPath(); x.arc(624, 78, 6, 0, TAU); x.fill()
  x.strokeStyle = '#2a2236'; x.lineWidth = 3; x.beginPath(); x.moveTo(300, 18); x.lineTo(330, 4); x.lineTo(360, 18); x.stroke()
  x.fillStyle = '#2a2236'; x.beginPath()
  for (const wx of [70, 190, 450, 570]) { x.moveTo(wx + 9, 102); x.arc(wx, 102, 9, 0, TAU) }
  x.fill()
})

/** Des passants à la file sous leurs parapluies : silhouettes blanches (on les teinte), dômes, manches. Se répète. */
export const umbrellasTex = canvasTex(512, 96, (x) => {
  const r = seeded(33)
  x.fillStyle = '#fff'
  for (let i = 0; i < 8; i++) {
    const px = 24 + i * 62 + r() * 12, s = 0.9 + r() * 0.3
    x.beginPath(); x.ellipse(px, 46 - 6 * s, 24 * s, 11 * s, 0, Math.PI, 0); x.fill()
    x.fillRect(px - 1.2, 40 - 6 * s, 2.4, 22 * s)
    x.beginPath(); x.ellipse(px + 5, 66 * s, 7 * s, 9 * s, 0, 0, TAU); x.fill()
    x.fillRect(px - 1, 70 * s, 13, 24)
  }
}, [1, 1])

/** Un anneau qui s'élargit, pour les ondes des gouttes dans les flaques. Blanc, fond transparent. */
export const ringTex = canvasTex(128, 128, (x) => {
  x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineWidth = 4
  x.beginPath(); x.arc(64, 64, 52, 0, TAU); x.stroke()
  x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 3
  x.beginPath(); x.arc(64, 64, 38, 0, TAU); x.stroke()
})

/** La toile du store : des rayures indigo et crème. Tuile 1 × 1 (huit rayures). */
export const stripeTex = canvasTex(128, 128, (x) => {
  for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#f0e6d0' : '#27358c'; x.fillRect(i * 16, 0, 16, 128) }
  const g = x.createLinearGradient(0, 0, 0, 128)
  g.addColorStop(0, 'rgba(0,0,0,.18)'); g.addColorStop(0.3, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.22)')
  x.fillStyle = g; x.fillRect(0, 0, 128, 128)
}, [1, 1])

/** Planches de cèdre brûlé (yakisugi), verticales : noir-brun, veinées, avec des joints. Tuile 1 × 1 (huit planches). */
export const yakisugiTex = canvasTex(256, 256, (x) => {
  const r = seeded(41)
  for (let i = 0; i < 8; i++) {
    const v = 20 + r() * 18
    const g = x.createLinearGradient(i * 32, 0, i * 32 + 32, 0)
    g.addColorStop(0, `rgb(${(v + 8) | 0},${(v + 2) | 0},${(v + 4) | 0})`); g.addColorStop(0.5, `rgb(${(v + 22) | 0},${(v + 14) | 0},${(v + 14) | 0})`); g.addColorStop(1, `rgb(${v | 0},${(v - 4) | 0},${(v - 2) | 0})`)
    x.fillStyle = g; x.fillRect(i * 32, 0, 32, 256)
    x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = 2; x.beginPath(); x.moveTo(i * 32 + 1, 0); x.lineTo(i * 32 + 1, 256); x.stroke()
    for (let k = 0; k < 9; k++) { x.strokeStyle = `rgba(255,220,190,${0.04 + r() * 0.06})`; x.lineWidth = 1; const px = i * 32 + 4 + r() * 24; x.beginPath(); x.moveTo(px, 0); x.lineTo(px + (r() - 0.5) * 4, 256); x.stroke() }
  }
  x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, 126, 256, 3); x.fillRect(0, 250, 256, 4)
}, [1, 1])

/** Ce qu'on devine par la porte de l'izakaya : un mur de bois chaud, trois étagères de bouteilles, des lanternes, un comptoir. */
export const izakayaTex = canvasTex(384, 666, (x) => {
  const r = seeded(52)
  const wall = x.createLinearGradient(0, 0, 0, 666)
  wall.addColorStop(0, '#6a3322'); wall.addColorStop(0.6, '#a85a34'); wall.addColorStop(1, '#4a2418')
  x.fillStyle = wall; x.fillRect(0, 0, 384, 666)
  for (let i = 0; i < 10; i++) { x.fillStyle = `rgba(0,0,0,${0.08 + r() * 0.08})`; x.fillRect(0, i * 66 + 6, 384, 3) }
  // trois étagères de bouteilles, éclairées par en dessous
  for (let s = 0; s < 3; s++) {
    const y = 250 + s * 130
    x.fillStyle = '#2a140e'; x.fillRect(20, y, 344, 9)
    const glow = x.createLinearGradient(0, y - 90, 0, y)
    glow.addColorStop(0, 'rgba(255,200,120,0)'); glow.addColorStop(1, 'rgba(255,200,120,.35)')
    x.fillStyle = glow; x.fillRect(20, y - 90, 344, 90)
    for (let i = 0; i < 12; i++) {
      const px = 30 + i * 28 + r() * 6, h = 40 + r() * 36, hue = [30, 140, 190, 20, 350, 50][(i + s) % 6]
      x.fillStyle = `hsl(${hue},55%,${35 + r() * 20}%)`
      rr(x, px, y - h, 14, h, 4); x.fill()
      x.fillRect(px + 4, y - h - 14, 6, 16)
      x.fillStyle = 'rgba(255,255,255,.4)'; x.fillRect(px + 3, y - h + 4, 2, h * 0.5)
      x.fillStyle = '#f2ead6'; x.fillRect(px + 1, y - h * 0.55, 12, 10)
    }
  }
  // lanternes de papier au plafond
  for (const [px, py, rad] of [[70, 140, 28], [190, 112, 34], [310, 150, 26]]) {
    const g = x.createRadialGradient(px, py, 2, px, py, rad * 2.2)
    g.addColorStop(0, 'rgba(255,190,100,.7)'); g.addColorStop(1, 'rgba(255,190,100,0)')
    x.fillStyle = g; x.fillRect(px - 100, py - 100, 200, 200)
    x.fillStyle = '#ff9a52'; x.beginPath(); x.ellipse(px, py, rad * 0.8, rad, 0, 0, TAU); x.fill()
    x.fillStyle = '#2a140e'; x.fillRect(px - rad * 0.5, py - rad - 4, rad, 6)
  }
  // le comptoir et les tabourets, au premier plan
  x.fillStyle = '#34190f'; x.fillRect(0, 560, 384, 106)
  x.fillStyle = '#7a4326'; x.fillRect(0, 548, 384, 18)
  for (const px of [70, 190, 310]) { x.fillStyle = '#1a0b08'; x.beginPath(); x.ellipse(px, 612, 38, 12, 0, 0, TAU); x.fill() }
  const vg = x.createRadialGradient(192, 333, 120, 192, 333, 420)
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,2,0,.6)')
  x.fillStyle = vg; x.fillRect(0, 0, 384, 666)
})

/** Un nobori : une longue bannière rouge à bord blanc, « ラーメン » en colonne. */
export const noboriTex = canvasTex(96, 384, (x) => {
  x.fillStyle = '#d62f3a'; x.fillRect(0, 0, 96, 384)
  x.fillStyle = '#f6efe0'; x.fillRect(0, 0, 6, 384); x.fillRect(90, 0, 6, 384); x.fillRect(0, 0, 96, 8)
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `bold 62px ${JP}`
  ;['ラ', 'ー', 'メ', 'ン'].forEach((c, i) => x.fillText(c, 48, 62 + i * 76))
  x.fillStyle = 'rgba(0,0,0,.14)'; for (let i = 0; i < 6; i++) x.fillRect(0, 40 + i * 60, 96, 2)
})

/** Planche de bois de l'enseigne de l'izakaya : « 酒処 » en blanc sur bois noir, bord clair. */
export const sakeSignTex = canvasTex(128, 256, (x) => {
  x.fillStyle = '#1c1210'; rr(x, 0, 0, 128, 256, 10); x.fill()
  x.strokeStyle = '#d8b878'; x.lineWidth = 5; rr(x, 8, 8, 112, 240, 8); x.stroke()
  x.fillStyle = '#f6efe0'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `bold 84px ${JP}`
  x.fillText('酒', 64, 90); x.fillText('処', 64, 182)
})

/** Un petit néon vertical (« BAR » ou autre) : tubes de couleur, halo, fond transparent. `lines` : une lettre par ligne. */
export const smallNeon = (lines: string[], color: string, glow: string) =>
  canvasTex(128, 256, (x) => {
    x.textAlign = 'center'; x.textBaseline = 'middle'
    const draw = (blur: number, col: string, w: number) => {
      x.shadowColor = glow; x.shadowBlur = blur; x.strokeStyle = col; x.lineWidth = w; x.lineJoin = 'round'
      rr(x, 14, 12, 100, 232, 22); x.stroke()
      x.font = `bold ${lines.length > 3 ? 56 : 70}px ${JP}`
      lines.forEach((c, i) => x.strokeText(c, 64, 128 + (i - (lines.length - 1) / 2) * (lines.length > 3 ? 54 : 70)))
    }
    draw(18, glow, 8); draw(9, color, 5); draw(0, '#ffffff', 1.8)
  })

/** La fenêtre à treillis de l'izakaya, allumée de l'intérieur : lattes de bois sombres sur un papier chaud. */
export const latticeTex = canvasTex(256, 192, (x) => {
  const g = x.createRadialGradient(128, 96, 10, 128, 96, 150)
  g.addColorStop(0, '#ffd89a'); g.addColorStop(1, '#e8924a')
  x.fillStyle = g; x.fillRect(0, 0, 256, 192)
  x.fillStyle = '#2a140e'
  for (let i = 0; i <= 8; i++) x.fillRect(i * 32 - 2, 0, 5, 192)
  for (let j = 0; j <= 6; j++) x.fillRect(0, j * 32 - 2, 256, 5)
  x.fillStyle = 'rgba(60,20,10,.35)'
  x.beginPath(); x.ellipse(70, 110, 24, 40, 0, 0, TAU); x.ellipse(190, 120, 20, 34, 0, 0, TAU); x.fill()
})

/** Lanterne blanche de l'izakaya : papier crème, « 酒 » en noir. */
export const whiteLanternTex = canvasTex(256, 128, (x) => {
  const g = x.createLinearGradient(0, 0, 0, 128)
  g.addColorStop(0, '#fff4dc'); g.addColorStop(0.5, '#fffaf0'); g.addColorStop(1, '#fff4dc')
  x.fillStyle = g; x.fillRect(0, 0, 256, 128)
  x.strokeStyle = 'rgba(150,110,60,.4)'; x.lineWidth = 2
  for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(0, 14 + i * 12); x.lineTo(256, 14 + i * 12); x.stroke() }
  x.fillStyle = '#1a0f12'; x.fillRect(0, 0, 256, 12); x.fillRect(0, 116, 256, 12)
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `bold 78px ${JP}`
  x.fillText('酒', 64, 66); x.fillText('酒', 192, 66)
})

/** Une plaque d'égout : disque de fonte quadrillé, anneau, inscription. */
export const manholeTex = canvasTex(128, 128, (x) => {
  x.fillStyle = '#2c2638'; x.beginPath(); x.arc(64, 64, 62, 0, TAU); x.fill()
  x.strokeStyle = '#4a4258'; x.lineWidth = 5; x.beginPath(); x.arc(64, 64, 56, 0, TAU); x.stroke()
  x.strokeStyle = '#4e4660'; x.lineWidth = 3
  for (let i = -3; i <= 3; i++) { x.beginPath(); x.moveTo(64 + i * 14 - 40, 20); x.lineTo(64 + i * 14 + 40, 108); x.stroke(); x.beginPath(); x.moveTo(64 + i * 14 + 40, 20); x.lineTo(64 + i * 14 - 40, 108); x.stroke() }
  x.fillStyle = '#6a6278'; x.beginPath(); x.arc(64, 64, 22, 0, TAU); x.fill()
  x.fillStyle = '#2c2638'; x.font = `bold 18px ${JP}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('下水', 64, 64)
})
