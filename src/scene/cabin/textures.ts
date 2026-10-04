import { CanvasTexture, RepeatWrapping } from 'three'
import { TAU } from '../../math'
import { makeCanvas } from '../textures'

// Textures de la cabane, dessinées en canvas : rondins des murs, lames du sol, pierre, tapis tressé, tartan, tricot, osier, braise.

// Tirage fixe : le décor est le même à chaque visite.
let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

function tiled(c: HTMLCanvasElement, rx = 1, ry = 1) {
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(rx, ry)
  t.anisotropy = 4
  return t
}

/** Murs : rondins couleur miel, posés à l'horizontale, joints crème. Quatre rondins par tuile de 1.35 unité. */
function wallTexture() {
  const S = 512, h = S / 4
  const [c, x] = makeCanvas(S, S)
  const tones = [['#f0c99c', '#dcaa7a', '#bd885d'], ['#ecc496', '#d7a374', '#b98359'], ['#f2cda2', '#e0b082', '#c38e63'], ['#e9bf91', '#d4a06f', '#b67f56']]
  // trait qui se prolonge de l'autre côté de la tuile
  const streak = (X: number, Y: number, W: number, H: number) => {
    x.fillRect(X, Y, W, H)
    if (X + W > S) x.fillRect(X - S, Y, W, H)
  }
  x.fillStyle = '#f4e3c9'
  x.fillRect(0, 0, S, S)
  tones.forEach(([top, mid, low], i) => {
    const y0 = i * h + 8, y1 = (i + 1) * h - 6
    const g = x.createLinearGradient(0, y0, 0, y1)
    g.addColorStop(0, top); g.addColorStop(0.5, mid); g.addColorStop(1, low)
    x.fillStyle = g
    x.fillRect(0, y0, S, y1 - y0)
    for (let k = 0; k < 9; k++) {
      x.fillStyle = k % 2 ? 'rgba(255,240,214,.18)' : 'rgba(120,68,40,.13)'
      streak(rnd() * S, y0 + 10 + rnd() * (y1 - y0 - 22), 90 + rnd() * 240, 2)
    }
    // un nœud dans le bois
    const kx = 40 + rnd() * (S - 80), ky = (y0 + y1) / 2 + (rnd() - 0.5) * 30
    x.strokeStyle = 'rgba(120,68,40,.3)'; x.lineWidth = 2.5
    x.beginPath(); x.ellipse(kx, ky, 11, 6, 0, 0, TAU); x.stroke()
    x.fillStyle = 'rgba(120,68,40,.22)'
    x.beginPath(); x.ellipse(kx, ky, 4, 2.5, 0, 0, TAU); x.fill()
    // ombre sous le rondin
    x.fillStyle = 'rgba(110,62,38,.32)'
    x.fillRect(0, y1, S, 2)
  })
  return tiled(c, 1 / 1.35, 1 / 1.35)
}

/** Sol : huit larges lames de chêne miel, de deux unités de long, aux joints bien marqués (se répète : voir `worldUV`). */
function floorTexture() {
  const [c, x] = makeCanvas(512, 512)
  const tones = ['#c08a5c', '#c9955f', '#b9814f', '#cf9d68', '#c28b58']
  const rows = 8, h = 512 / rows
  for (let r = 0; r < rows; r++) {
    let px = -rnd() * 220
    while (px < 512) {
      const w = 190 + rnd() * 170
      const tone = tones[(rnd() * tones.length) | 0]
      for (const X of [px, px - 512]) {
        const g = x.createLinearGradient(0, r * h, 0, (r + 1) * h)
        g.addColorStop(0, tone); g.addColorStop(1, 'rgba(120,70,40,.18)')
        x.fillStyle = tone
        x.fillRect(X, r * h, w, h)
        x.fillStyle = g
        x.fillRect(X, r * h, w, h)
        x.fillStyle = 'rgba(70,38,26,.34)'
        x.fillRect(X, r * h, 2.5, h)
        for (let k = 0; k < 4; k++) {
          x.fillStyle = k % 2 ? 'rgba(255,230,205,.13)' : 'rgba(110,60,35,.10)'
          x.fillRect(X + 6 + rnd() * 20, r * h + 6 + rnd() * (h - 12), w * (0.3 + rnd() * 0.6), 1.6)
        }
      }
      px += w
    }
    x.fillStyle = 'rgba(70,38,26,.32)'
    x.fillRect(0, r * h, 512, 2.5)
  }
  return tiled(c)
}

/** Pierres rondes couleur sable, joints crème. Se répète sans couture (à poser avec `worldUV`). */
function stoneTexture() {
  const S = 256
  const [c, x] = makeCanvas(S, S)
  const tones = ['#dccab7', '#d3bea9', '#e6d6c4', '#cbb4a0', '#d9c2ac', '#e2cbb4']
  x.fillStyle = '#f1e6d8'
  x.fillRect(0, 0, S, S)
  let y = 0
  for (const h of [60, 46, 56, 44, 50]) {
    // largeurs qui font exactement le tour de la tuile
    const ws: number[] = []
    let left = S
    while (left > 0) {
      const w = left < 110 ? left : 52 + rnd() * 48
      ws.push(w)
      left -= w
    }
    let px = rnd() * 50
    for (const w of ws) {
      const tone = tones[(rnd() * tones.length) | 0]
      for (const X of [px, px - S]) {
        x.fillStyle = tone
        x.beginPath(); x.roundRect(X + 3, y + 3, w - 6, h - 6, 16); x.fill()
        const g = x.createLinearGradient(0, y, 0, y + h)
        g.addColorStop(0, 'rgba(255,250,240,.32)'); g.addColorStop(0.5, 'rgba(255,250,240,0)'); g.addColorStop(1, 'rgba(120,80,55,.16)')
        x.fillStyle = g
        x.beginPath(); x.roundRect(X + 3, y + 3, w - 6, h - 6, 16); x.fill()
      }
      px += w
    }
    y += h
  }
  return tiled(c)
}

/** Tapis rond tressé : anneaux canneberge, sauge et rose séparés par de la laine crème, mailles en chevrons. Pour le dessus d'un cylindre. */
function braidTexture() {
  const S = 512, o = S / 2, W = 22
  const [c, x] = makeCanvas(S, S)
  const cols = ['#c95a6e', '#f4e4cf', '#86b294', '#f4e4cf', '#dc8593', '#f4e4cf']
  x.fillStyle = '#b84f63'
  x.fillRect(0, 0, S, S)
  for (let i = 0, r = o - 2; r > 4; i++, r -= W) {
    x.fillStyle = i === 0 ? '#b84f63' : cols[i % cols.length]
    x.beginPath(); x.arc(o, o, r, 0, TAU); x.fill()
    const mid = r - W / 2, n = Math.max(6, Math.round((TAU * mid) / 13)), tilt = i % 2 ? 0.7 : -0.7
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU
      x.save()
      x.translate(o + Math.cos(a) * mid, o + Math.sin(a) * mid)
      x.rotate(a + Math.PI / 2 + tilt)
      x.fillStyle = 'rgba(255,255,255,.17)'
      x.beginPath(); x.ellipse(0, -1.5, 6.5, 3.2, 0, 0, TAU); x.fill()
      x.fillStyle = 'rgba(90,40,40,.14)'
      x.beginPath(); x.ellipse(0, 3, 6.5, 1.6, 0, 0, TAU); x.fill()
      x.restore()
    }
    x.strokeStyle = 'rgba(90,40,40,.16)'; x.lineWidth = 2
    x.beginPath(); x.arc(o, o, r, 0, TAU); x.stroke()
  }
  return new CanvasTexture(c)
}

/** Tartan rouge et vert, filets crème et beurre (plaid du fauteuil). Une tuile par demi-unité, avec `worldUV`. */
function tartanTexture() {
  const S = 128
  const [c, x] = makeCanvas(S, S)
  x.fillStyle = '#cf5b6f'
  x.fillRect(0, 0, S, S)
  const band = (at: number, w: number, col: string) => {
    x.fillStyle = col
    x.fillRect(at, 0, w, S)
    x.fillRect(0, at, S, w)
  }
  band(10, 34, 'rgba(46,100,80,.5)')
  band(72, 12, 'rgba(46,100,80,.42)')
  band(56, 4, 'rgba(255,242,220,.75)')
  band(102, 3, 'rgba(246,208,113,.8)')
  band(118, 6, 'rgba(90,30,45,.3)')
  return tiled(c)
}

/** Osier tressé (panier à bûches). */
function wickerTexture() {
  const [c, x] = makeCanvas(128, 64)
  x.fillStyle = '#9b6a3f'
  x.fillRect(0, 0, 128, 64)
  for (let row = 0; row < 8; row++) {
    for (let col = -1; col < 8; col++) {
      x.fillStyle = (row + col) % 2 ? '#dcae74' : '#cf9f66'
      x.beginPath(); x.roundRect(col * 16 + (row % 2) * 8 + 1, row * 8 + 1, 14, 6, 3); x.fill()
    }
  }
  return tiled(c, 7, 2)
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

/** Disque noir : sillons fins, quelques pistes plus sombres, deux éventails de reflet (qui tournent avec lui). */
function vinylTexture() {
  const S = 256, o = S / 2
  const [c, x] = makeCanvas(S, S)
  x.fillStyle = '#1a1620'
  x.fillRect(0, 0, S, S)
  for (let r = 20; r < 126; r += 2.2) {
    x.strokeStyle = Math.round(r / 2.2) % 3 ? 'rgba(255,255,255,.055)' : 'rgba(0,0,0,.4)'
    x.lineWidth = 1
    x.beginPath(); x.arc(o, o, r, 0, TAU); x.stroke()
  }
  x.strokeStyle = 'rgba(0,0,0,.75)'; x.lineWidth = 2.6
  for (const r of [52, 77, 98, 117]) { x.beginPath(); x.arc(o, o, r, 0, TAU); x.stroke() }
  for (const a of [0.45, 0.45 + Math.PI]) {
    x.fillStyle = 'rgba(255,240,230,.17)'
    x.beginPath(); x.moveTo(o, o); x.arc(o, o, 126, a, a + 0.42); x.closePath(); x.fill()
    x.fillStyle = 'rgba(255,240,230,.07)'
    x.beginPath(); x.moveTo(o, o); x.arc(o, o, 126, a + 0.42, a + 0.8); x.closePath(); x.fill()
  }
  return new CanvasTexture(c)
}

/** Étiquette du disque : canneberge, filet doré, une étoile. */
function labelTexture() {
  const S = 128, o = S / 2
  const [c, x] = makeCanvas(S, S)
  x.fillStyle = '#d25c72'
  x.fillRect(0, 0, S, S)
  x.strokeStyle = '#f4c75a'; x.lineWidth = 3
  x.beginPath(); x.arc(o, o, 50, 0, TAU); x.stroke()
  x.lineWidth = 1.5
  x.beginPath(); x.arc(o, o, 41, 0, TAU); x.stroke()
  x.fillStyle = '#fff3dc'
  x.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, d = i % 2 ? 9 : 22
    x.lineTo(o + Math.cos(a) * d, o - 14 + Math.sin(a) * d)
  }
  x.closePath(); x.fill()
  x.fillStyle = '#fff3dc'
  x.font = 'italic 700 13px Georgia, serif'
  x.textAlign = 'center'
  x.fillText('NOËL', o, o + 36)
  x.fillStyle = '#3d2c30'
  x.beginPath(); x.arc(o, o, 4, 0, TAU); x.fill()
  return new CanvasTexture(c)
}

/** Intérieur du couvercle : toile crème, haut-parleur à petits trous cerclé d'or, médaillon. */
function lidTexture() {
  const W = 512, H = 340
  const [c, x] = makeCanvas(W, H)
  x.fillStyle = '#efe0c8'
  x.fillRect(0, 0, W, H)
  // trame de la toile
  for (let i = 0; i < W; i += 4) { x.fillStyle = 'rgba(120,80,50,.07)'; x.fillRect(i, 0, 1, H) }
  for (let j = 0; j < H; j += 4) { x.fillStyle = 'rgba(120,80,50,.06)'; x.fillRect(0, j, W, 1) }
  const cx = W / 2, cy = H * 0.5
  x.fillStyle = '#c9b08c'
  x.beginPath(); x.arc(cx, cy, 128, 0, TAU); x.fill()
  x.fillStyle = '#4b3a3f'
  for (let r = 14; r <= 118; r += 13) {
    const n = Math.max(1, Math.round((TAU * r) / 13))
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU + r
      x.beginPath(); x.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 3.2, 0, TAU); x.fill()
    }
  }
  x.beginPath(); x.arc(cx, cy, 4, 0, TAU); x.fill()
  x.strokeStyle = '#d9a93d'; x.lineWidth = 7
  x.beginPath(); x.arc(cx, cy, 130, 0, TAU); x.stroke()
  x.strokeStyle = '#f4d98a'; x.lineWidth = 2
  x.beginPath(); x.arc(cx, cy, 124, 0, TAU); x.stroke()
  // médaillon en bas à droite
  x.fillStyle = '#d9a93d'
  x.beginPath(); x.roundRect(W - 168, H - 66, 124, 38, 19); x.fill()
  x.fillStyle = '#4b2f20'
  x.font = 'italic 700 19px Georgia, serif'
  x.textAlign = 'center'
  x.fillText('Hi-Fi · Noël', W - 106, H - 40)
  return new CanvasTexture(c)
}

/** Rayures de sucre d'orge (autour d'un tube : le sens des rayures suit l'enroulement). */
function candyTexture() {
  const [c, x] = makeCanvas(64, 32)
  x.fillStyle = '#fff6ee'
  x.fillRect(0, 0, 64, 32)
  x.fillStyle = '#d9394f'
  for (let i = -1; i < 3; i++) {
    x.beginPath()
    x.moveTo(i * 32 + 4, 0); x.lineTo(i * 32 + 20, 0); x.lineTo(i * 32 + 4, 32); x.lineTo(i * 32 - 12, 32)
    x.closePath(); x.fill()
  }
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(7, 1)
  return t
}

/** Une estampe de la forêt sous la neige : ciel de nuit, sapins blancs, une étoile. */
function snowPrintTexture() {
  const [c, x] = makeCanvas(256, 320)
  x.fillStyle = '#fff6ee'
  x.fillRect(0, 0, 256, 320)
  x.save()
  x.beginPath(); x.roundRect(22, 22, 212, 276, 14); x.clip()
  const g = x.createLinearGradient(0, 22, 0, 298)
  g.addColorStop(0, '#26335f'); g.addColorStop(1, '#6a86c0')
  x.fillStyle = g; x.fillRect(0, 0, 256, 320)
  x.fillStyle = '#fff3c8'
  x.beginPath()
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, d = i % 2 ? 6 : 15; x.lineTo(176 + Math.cos(a) * d, 84 + Math.sin(a) * d) }
  x.closePath(); x.fill()
  for (let i = 0; i < 26; i++) { x.fillStyle = 'rgba(255,255,255,.8)'; x.beginPath(); x.arc(30 + ((i * 53) % 190), 40 + ((i * 37) % 150), 1.3 + (i % 3) * 0.5, 0, TAU); x.fill() }
  x.fillStyle = '#f4f8ff'
  x.beginPath(); x.ellipse(70, 310, 150, 54, 0, 0, TAU); x.fill()
  x.beginPath(); x.ellipse(210, 316, 130, 50, 0, 0, TAU); x.fill()
  for (const [px, base, h, col] of [[88, 262, 110, '#2f6b63'], [150, 270, 150, '#255a54'], [196, 258, 96, '#2f6b63']] as const) {
    x.fillStyle = col
    for (let i = 0; i < 3; i++) {
      const w = h * (0.3 - i * 0.07), y0 = base - h * (0.18 + i * 0.28), y1 = y0 - h * 0.44
      x.beginPath(); x.moveTo(px - w, y0); x.lineTo(px, y1); x.lineTo(px + w, y0); x.closePath(); x.fill()
      x.fillStyle = '#f4f8ff'
      x.beginPath(); x.moveTo(px - w * 0.55, y0 - h * 0.12); x.lineTo(px, y1); x.lineTo(px + w * 0.55, y0 - h * 0.12); x.closePath(); x.fill()
      x.fillStyle = col
    }
  }
  x.restore()
  return new CanvasTexture(c)
}

export const snowPrintTex = snowPrintTexture()
export const vinylTex = vinylTexture()
export const labelTex = labelTexture()
export const lidTex = lidTexture()
export const candyTex = candyTexture()
export const wallTex = wallTexture()
export const floorTex = floorTexture()
export const stoneTex = stoneTexture()
export const braidTex = braidTexture()
export const tartanTex = tartanTexture()
export const wickerTex = wickerTexture()
export const emberTex = emberTexture()

/** Rameaux de sapin : rangées de petits chevrons d'aiguilles, pointes plus claires, creux plus sombres. Clair, teinté par le matériau. */
function firTexture() {
  const S = 256, [c, x] = makeCanvas(S, S)
  let seed = 3
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  x.fillStyle = '#c6d8cc'; x.fillRect(0, 0, S, S)
  x.lineCap = 'round'
  for (let row = 0; row < 18; row++) {
    const y = row * 15 + 4
    for (let k = 0; k < 15; k++) {
      const cx = k * 18 + (row % 2) * 9 + (r() - 0.5) * 4, w = 7 + r() * 3
      for (const dx of [-S, 0, S]) {
        x.strokeStyle = 'rgba(20,52,36,.38)'; x.lineWidth = 2.6
        x.beginPath(); x.moveTo(cx + dx - w, y); x.lineTo(cx + dx, y + 9); x.lineTo(cx + dx + w, y); x.stroke()
        x.strokeStyle = 'rgba(255,255,240,.42)'; x.lineWidth = 1.3
        x.beginPath(); x.moveTo(cx + dx - w * 0.6, y + 3); x.lineTo(cx + dx, y + 10); x.lineTo(cx + dx + w * 0.6, y + 3); x.stroke()
      }
    }
  }
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(3, 1.1)
  return t
}
export const firTex = firTexture()
