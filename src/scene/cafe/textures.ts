import { CanvasTexture, RepeatWrapping } from 'three'
import { TAU } from '../../math'
import { makeCanvas } from '../textures'

// Textures du café, dessinées en canvas : mur (pierre blonde et lambris), parquet à bâtons rompus, tartan, ardoise,
// carreaux victoriens de la cheminée, tableau du Château, vitre embuée, bulle de conversation, page.

/** Tirage pseudo-aléatoire à graine : le même décor à chaque visite. */
function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function rr(x: CanvasRenderingContext2D, X: number, Y: number, W: number, H: number, R: number) {
  x.beginPath(); x.moveTo(X + R, Y)
  x.arcTo(X + W, Y, X + W, Y + H, R); x.arcTo(X + W, Y + H, X, Y + H, R)
  x.arcTo(X, Y + H, X, Y, R); x.arcTo(X, Y, X + W, Y, R); x.closePath()
}

/**
 * Mur du fond : pierre de taille blonde (le grès d'Édimbourg) en haut, lambris vert bouteille en bas.
 * La texture couvre 1 unité de large et 4.4 de haut (de y = -0.05 à 4.35) : elle se répète en largeur.
 */
function wallTexture() {
  const W = 256, H = 1024, px = H / 4.4, y = (u: number) => H - (u + 0.05) * px // hauteur du mur -> pixel
  const [c, x] = makeCanvas(W, H), r = seeded(3)
  const stone = ['#dcc39a', '#d6bb8f', '#e1caa4', '#cfb486', '#d9bf94', '#e4cfab']
  const top = y(4.35), rail = y(1.55), course = 0.34 * px
  for (let row = 0, yy = rail; yy > top - course; row++, yy -= course) {
    let xx = (row % 2) * -70 - r() * 24
    while (xx < W) {
      const w = 96 + r() * 90
      x.fillStyle = stone[(r() * stone.length) | 0]
      x.fillRect(xx, yy - course, w, course)
      // un peu de matière : taches plus claires et plus sombres
      for (let k = 0; k < 5; k++) {
        x.fillStyle = r() < 0.5 ? 'rgba(255,245,225,.10)' : 'rgba(120,90,55,.08)'
        x.beginPath(); x.ellipse(xx + r() * w, yy - r() * course, 8 + r() * 18, 4 + r() * 8, 0, 0, TAU); x.fill()
      }
      // joints creux (mortier plus clair, ombre dessous)
      x.fillStyle = 'rgba(236,224,200,.9)'; x.fillRect(xx, yy - course, 3, course); x.fillRect(xx, yy - 3, w, 3)
      x.fillStyle = 'rgba(90,65,40,.22)'; x.fillRect(xx + 3, yy - course, 2, course); x.fillRect(xx, yy - 6, w, 2)
      xx += w
    }
  }
  // lambris : vert bouteille, deux panneaux en creux par unité
  x.fillStyle = '#2c5a4c'
  x.fillRect(0, y(1.45), W, H - y(1.45))
  for (const [x0, w] of [[16, 102], [138, 102]]) {
    const y0 = y(1.3), h = y(0.24) - y0
    x.fillStyle = '#244d41'; rr(x, x0, y0, w, h, 5); x.fill()
    x.strokeStyle = 'rgba(255,240,210,.16)'; x.lineWidth = 3; rr(x, x0 + 4, y0 + 4, w - 8, h - 8, 4); x.stroke()
    x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 2; rr(x, x0 + 1, y0 + 1, w - 2, h - 2, 5); x.stroke()
  }
  x.fillStyle = '#1d3f35'; x.fillRect(0, y(0.18), W, H - y(0.18)) // plinthe
  // lisse en laiton patiné au-dessus du lambris
  x.fillStyle = '#b8864f'; x.fillRect(0, y(1.55), W, y(1.45) - y(1.55))
  x.fillStyle = 'rgba(255,236,200,.45)'; x.fillRect(0, y(1.55), W, 3)
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.anisotropy = 4
  return t
}

/**
 * Parquet de chêne à bâtons rompus. On dessine dans un repère tourné de 45° : les lames y sont horizontales et verticales,
 * en escalier (lame horizontale à (k, k), lame verticale juste au-dessus, à sa gauche), et ces escaliers se répètent tous les 2L.
 */
function floorTexture() {
  const S = 1024, [c, x] = makeCanvas(S, S), r = seeded(11)
  const tones = ['#c8945f', '#bf8a55', '#d19f6a', '#b98250', '#cc9963', '#c28d5a']
  x.fillStyle = '#a87648'; x.fillRect(0, 0, S, S)
  const W = 24, L = 3 * W
  const plank = (px: number, py: number, w: number, h: number) => {
    x.fillStyle = tones[(r() * tones.length) | 0]
    x.fillRect(px, py, w, h)
    x.fillStyle = 'rgba(255,238,210,.10)' // fil du bois
    const along = w > h
    for (let k = 0; k < 2; k++) {
      if (along) x.fillRect(px + 4, py + 4 + r() * (h - 8), w - 8, 1.2)
      else x.fillRect(px + 4 + r() * (w - 8), py + 4, 1.2, h - 8)
    }
    x.strokeStyle = 'rgba(80,45,22,.35)'; x.lineWidth = 1.5; x.strokeRect(px, py, w, h)
  }
  x.save()
  x.translate(S / 2, S / 2)
  x.rotate(Math.PI / 4)
  const n = Math.ceil((S * 0.75) / W)
  for (let b = -8; b <= 8; b++) {
    for (let k = -n; k <= n; k++) {
      const ox = b * 2 * L + k * W, oy = k * W
      plank(ox, oy, L, W)
      plank(ox, oy + W, W, L)
    }
  }
  x.restore()
  // un léger voile chaud, plus soutenu au centre (la lumière des lampes)
  const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.7)
  g.addColorStop(0, 'rgba(255,214,150,.10)'); g.addColorStop(1, 'rgba(60,30,15,.12)')
  x.fillStyle = g; x.fillRect(0, 0, S, S)
  const t = new CanvasTexture(c)
  t.anisotropy = 8
  return t
}

/** Tartan : vert, bleu marine, rouge et fils jaunes ; trame et chaîne se croisent, avec un fin sergé. */
function tartanCanvas() {
  const [c, x] = makeCanvas(256, 256)
  x.fillStyle = '#2b5d4a'; x.fillRect(0, 0, 256, 256)
  const bands: [string, number][] = [['#1d2d52', 44], ['#2b5d4a', 22], ['#b0303e', 8], ['#2b5d4a', 22], ['#1d2d52', 12], ['#2b5d4a', 28], ['#e0b84a', 4], ['#2b5d4a', 28]]
  const total = bands.reduce((s, b) => s + b[1], 0), k = 256 / total
  x.globalAlpha = 0.62
  let p = 0
  for (const [col, w] of bands) { x.fillStyle = col; x.fillRect(p * k, 0, w * k, 256); p += w }
  p = 0
  for (const [col, w] of bands) { x.fillStyle = col; x.fillRect(0, p * k, 256, w * k); p += w }
  x.globalAlpha = 1
  x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = 1
  for (let i = -256; i < 512; i += 4) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 256, 256); x.stroke() }
  return c
}

/** Le même tartan en rouge (Royal Stewart, plus chaud) pour le fauteuil et les coussins. */
function stewartCanvas() {
  const [c, x] = makeCanvas(256, 256)
  x.fillStyle = '#b3283a'; x.fillRect(0, 0, 256, 256)
  const bands: [string, number][] = [['#b3283a', 30], ['#1d2d52', 16], ['#b3283a', 6], ['#16331f', 22], ['#b3283a', 6], ['#f2e6c8', 3], ['#b3283a', 20], ['#e0b84a', 3], ['#b3283a', 20]]
  const total = bands.reduce((s, b) => s + b[1], 0), k = 256 / total
  x.globalAlpha = 0.6
  let p = 0
  for (const [col, w] of bands) { x.fillStyle = col; x.fillRect(p * k, 0, w * k, 256); p += w }
  p = 0
  for (const [col, w] of bands) { x.fillStyle = col; x.fillRect(0, p * k, 256, w * k); p += w }
  x.globalAlpha = 1
  x.strokeStyle = 'rgba(255,255,255,.06)'; x.lineWidth = 1
  for (let i = -256; i < 512; i += 4) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 256, 256); x.stroke() }
  return c
}

function repeated(canvas: HTMLCanvasElement, rx: number, ry: number) {
  const t = new CanvasTexture(canvas)
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(rx, ry)
  t.anisotropy = 4
  return t
}

/** Ardoise du menu, à la craie. */
function chalkTexture() {
  const [c, x] = makeCanvas(512, 320), r = seeded(5)
  x.fillStyle = '#26352f'; x.fillRect(0, 0, 512, 320)
  x.fillStyle = 'rgba(255,255,255,.045)'
  for (let i = 0; i < 70; i++) x.fillRect(r() * 512, r() * 320, 30 + r() * 90, 2)
  x.fillStyle = '#f4efe2'; x.textAlign = 'center'
  x.font = 'bold 60px Georgia, "Times New Roman", serif'
  x.fillText('Café', 256, 74)
  x.font = 'italic 28px Georgia, "Times New Roman", serif'
  x.fillStyle = '#f3c6d4'; x.fillText('Flat white ........ 3.2', 256, 132)
  x.fillStyle = '#c9e6d9'; x.fillText('Tea & scones ...... 5', 256, 178)
  x.fillStyle = '#f6d98a'; x.fillText('Hot chocolate ..... 3.5', 256, 224)
  x.fillStyle = '#f4efe2'; x.font = 'italic 24px Georgia, serif'; x.fillText('~ it\'s dreich out, stay a while ~', 256, 286)
  x.strokeStyle = '#f4efe2'; x.lineWidth = 3; x.lineCap = 'round'
  x.beginPath(); x.arc(72, 62, 15, 0, Math.PI); x.moveTo(57, 48); x.lineTo(87, 48); x.stroke()
  x.beginPath(); x.moveTo(66, 36); x.quadraticCurveTo(60, 28, 68, 20); x.moveTo(78, 36); x.quadraticCurveTo(72, 28, 80, 20); x.stroke()
  // un chardon, l'emblème de l'Écosse
  x.strokeStyle = '#c9e6d9'; x.beginPath(); x.moveTo(440, 80); x.lineTo(440, 40); x.stroke()
  x.fillStyle = '#c9a3e6'; x.beginPath(); x.arc(440, 34, 9, 0, TAU); x.fill()
  x.strokeStyle = '#c9a3e6'; for (let i = -2; i <= 2; i++) { x.beginPath(); x.moveTo(440 + i * 3, 27); x.lineTo(440 + i * 6, 16); x.stroke() }
  return new CanvasTexture(c)
}

/** Carreaux victoriens des joues de la cheminée : une fleur stylisée par carreau, quatre carreaux en hauteur. */
function tilesTexture() {
  const [c, x] = makeCanvas(64, 256)
  for (let i = 0; i < 4; i++) {
    const y0 = i * 64
    x.fillStyle = '#eee3cb'; x.fillRect(0, y0, 64, 64)
    x.strokeStyle = '#2f6b66'; x.lineWidth = 4; x.strokeRect(2, y0 + 2, 60, 60)
    x.fillStyle = '#4f8a6e' // feuilles
    for (const [dx, dy] of [[-12, 10], [12, 10]]) { x.beginPath(); x.ellipse(32 + dx, y0 + 34 + dy, 9, 4, dx > 0 ? -0.6 : 0.6, 0, TAU); x.fill() }
    x.fillStyle = i % 2 ? '#c8606a' : '#4d6fa8' // pétales
    for (let p = 0; p < 6; p++) { const a = (p / 6) * TAU; x.beginPath(); x.ellipse(32 + Math.cos(a) * 9, y0 + 28 + Math.sin(a) * 9, 7, 4.5, a, 0, TAU); x.fill() }
    x.fillStyle = '#e0b84a'; x.beginPath(); x.arc(32, y0 + 28, 5, 0, TAU); x.fill()
  }
  return new CanvasTexture(c)
}

/** Tableau au-dessus de la cheminée : le Château sur son rocher, dans un couchant chaud (une peinture, pas la vue). */
function paintingTexture() {
  const [c, x] = makeCanvas(320, 224), r = seeded(9)
  const g = x.createLinearGradient(0, 0, 0, 224)
  g.addColorStop(0, '#7d6aa6'); g.addColorStop(0.45, '#e98f7a'); g.addColorStop(0.75, '#f6c27e'); g.addColorStop(1, '#f9d99a')
  x.fillStyle = g; x.fillRect(0, 0, 320, 224)
  const sg = x.createRadialGradient(230, 132, 4, 230, 132, 70)
  sg.addColorStop(0, 'rgba(255,240,200,.95)'); sg.addColorStop(1, 'rgba(255,220,160,0)')
  x.fillStyle = sg; x.fillRect(140, 50, 180, 170)
  // touches de pinceau dans le ciel
  for (let i = 0; i < 140; i++) {
    x.fillStyle = `rgba(${r() < 0.5 ? '255,230,200' : '120,90,150'},${(0.05 + r() * 0.1).toFixed(2)})`
    x.fillRect(r() * 320, r() * 150, 14 + r() * 26, 3)
  }
  // le rocher et le Château, en violet sombre
  x.fillStyle = '#4a3550'
  x.beginPath(); x.moveTo(0, 224); x.lineTo(0, 150); x.lineTo(40, 140); x.lineTo(70, 118); x.lineTo(170, 114); x.lineTo(196, 128); x.lineTo(240, 170); x.lineTo(320, 196); x.lineTo(320, 224); x.closePath(); x.fill()
  x.fillRect(70, 86, 100, 30); x.fillRect(82, 66, 22, 22); x.fillRect(132, 58, 26, 30)
  for (let cx = 70; cx < 170; cx += 9) x.fillRect(cx, 82, 5, 5)
  x.beginPath(); x.moveTo(136, 58); x.lineTo(145, 40); x.lineTo(154, 58); x.closePath(); x.fill()
  // la ville au pied, quelques lumières
  x.fillStyle = '#3a2a42'; x.fillRect(0, 196, 320, 28)
  x.fillStyle = 'rgba(255,214,140,.9)'
  for (let i = 0; i < 26; i++) x.fillRect(r() * 320, 200 + r() * 18, 2.5, 3)
  return new CanvasTexture(c)
}

/**
 * La vitre côté salle : de la buée en bas et dans les coins, des gouttes et des coulures qui dégagent la buée,
 * et le nom du café peint à la feuille d'or à l'extérieur (donc lu à l'envers d'ici).
 */
function glassTexture() {
  const Wd = 512, Ht = 384, [c, x] = makeCanvas(Wd, Ht), r = seeded(21)
  // buée
  const fog = x.createLinearGradient(0, Ht, 0, Ht * 0.35)
  fog.addColorStop(0, 'rgba(232,238,244,.55)'); fog.addColorStop(1, 'rgba(232,238,244,0)')
  x.fillStyle = fog; x.fillRect(0, 0, Wd, Ht)
  for (const [cx, cy] of [[0, 0], [Wd, 0]]) {
    const v = x.createRadialGradient(cx, cy, 0, cx, cy, 170)
    v.addColorStop(0, 'rgba(232,238,244,.32)'); v.addColorStop(1, 'rgba(232,238,244,0)')
    x.fillStyle = v; x.fillRect(0, 0, Wd, Ht)
  }
  // coulures : elles effacent la buée sur leur passage
  x.save()
  x.globalCompositeOperation = 'destination-out'
  x.strokeStyle = 'rgba(0,0,0,.9)'; x.lineCap = 'round'
  for (let i = 0; i < 14; i++) {
    let px = 20 + r() * (Wd - 40), py = Ht * (0.25 + r() * 0.35)
    x.lineWidth = 2 + r() * 2.5
    x.beginPath(); x.moveTo(px, py)
    while (py < Ht) { px += (r() - 0.5) * 6; py += 10 + r() * 14; x.lineTo(px, py) }
    x.stroke()
  }
  x.restore()
  // gouttes : un disque pâle, un reflet, un bord plus sombre
  for (let i = 0; i < 190; i++) {
    const px = r() * Wd, py = r() * Ht, rad = 1.2 + Math.pow(r(), 2.2) * 5.5
    x.fillStyle = 'rgba(214,228,242,.34)'; x.beginPath(); x.arc(px, py, rad, 0, TAU); x.fill()
    x.strokeStyle = 'rgba(50,70,95,.28)'; x.lineWidth = 1; x.beginPath(); x.arc(px, py + rad * 0.15, rad, 0.1 * Math.PI, 0.9 * Math.PI); x.stroke()
    x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.arc(px - rad * 0.35, py - rad * 0.35, Math.max(0.6, rad * 0.28), 0, TAU); x.fill()
  }
  // L'enseigne dorée est peinte dehors : vue d'ici, elle est à l'envers. Un mot par battant, en arc dans l'imposte
  // (le haut de chaque battant), pour que la traverse du milieu ne coupe pas les lettres.
  x.save()
  x.translate(Wd, 0); x.scale(-1, 1)
  x.textAlign = 'center'; x.textBaseline = 'middle'
  const gold = x.createLinearGradient(0, 30, 0, 70)
  gold.addColorStop(0, '#f7dc8f'); gold.addColorStop(0.5, '#d4a443'); gold.addColorStop(1, '#a87a2c')
  for (const [text, sub, cx] of [['BOOKS', 'Old Town', Wd * 0.25], ['COFFEE', 'est. 1887', Wd * 0.75]] as const) {
    const R = 150, span = 0.62, cy = 52 + R
    x.font = 'bold 27px Georgia, "Times New Roman", serif'
    ;[...text].forEach((ch, i) => {
      const a = -Math.PI / 2 - span / 2 + (span * i) / (text.length - 1)
      x.save()
      x.translate(cx + Math.cos(a) * R, cy + Math.sin(a) * R)
      x.rotate(a + Math.PI / 2)
      x.lineWidth = 4; x.strokeStyle = 'rgba(40,24,10,.75)'; x.strokeText(ch, 0, 0)
      x.fillStyle = gold; x.fillText(ch, 0, 0)
      x.restore()
    })
    x.font = 'italic 15px Georgia, serif'; x.fillStyle = '#d4a443'; x.fillText(sub, cx, 84)
  }
  x.restore()
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

/** Petit halo chaud et serré, pour une ampoule ou une bougie. */
const bulbGlow = sprite(64, (x) => {
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 31)
  g.addColorStop(0, 'rgba(255,226,160,.95)'); g.addColorStop(0.25, 'rgba(255,190,110,.45)'); g.addColorStop(1, 'rgba(255,170,90,0)')
  x.fillStyle = g; x.fillRect(0, 0, 64, 64)
})

/** Papier peint du manteau de cheminée : damas vert sombre, fleurons un peu plus clairs et pointe dorée. Tuile qui se répète. */
function wallpaperTexture() {
  const S = 128, [c, x] = makeCanvas(S, S)
  x.fillStyle = '#25483e'; x.fillRect(0, 0, S, S)
  const fleuron = (cx: number, cy: number, k: number) => {
    x.fillStyle = '#30594c'
    for (let i = 0; i < 4; i++) {
      x.save(); x.translate(cx, cy); x.rotate((i * Math.PI) / 2)
      x.beginPath(); x.ellipse(0, -14 * k, 7 * k, 14 * k, 0, 0, TAU); x.fill()
      x.restore()
    }
    x.fillStyle = 'rgba(205,165,85,.55)'; x.beginPath(); x.arc(cx, cy, 4 * k, 0, TAU); x.fill()
  }
  for (const [cx, cy] of [[64, 64], [0, 0], [S, 0], [0, S], [S, S]]) fleuron(cx, cy, 1)
  for (const [cx, cy] of [[64, 0], [64, S], [0, 64], [S, 64]]) {
    x.fillStyle = 'rgba(205,165,85,.35)'; x.beginPath(); x.arc(cx, cy, 2.5, 0, TAU); x.fill()
  }
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(3, 6.8)
  return t
}

/** Halo froid du réverbère, dehors : blanc bleuté, plus large et plus doux que celui des ampoules. */
const coldGlow = sprite(128, (x) => {
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 63)
  g.addColorStop(0, 'rgba(240,246,255,.9)'); g.addColorStop(0.18, 'rgba(200,220,255,.4)'); g.addColorStop(1, 'rgba(170,195,240,0)')
  x.fillStyle = g; x.fillRect(0, 0, 128, 128)
})

/** Paillasson de coco à l'entrée : « Fàilte », bienvenue en gaélique écossais. */
function matTexture() {
  const [c, x] = makeCanvas(256, 160), r = seeded(5)
  x.fillStyle = '#b98a55'; x.fillRect(0, 0, 256, 160)
  for (let i = 0; i < 2600; i++) {
    x.fillStyle = r() < 0.5 ? 'rgba(120,80,40,.35)' : 'rgba(230,190,130,.3)'
    x.fillRect(r() * 256, r() * 160, 1 + r() * 2, 3 + r() * 4)
  }
  x.strokeStyle = '#5a3a22'; x.lineWidth = 6; rr(x, 14, 14, 228, 132, 14); x.stroke()
  x.fillStyle = '#4a2e1a'; x.font = 'bold 44px Georgia, "Times New Roman", serif'; x.textAlign = 'center'; x.textBaseline = 'middle'
  x.fillText('FÀILTE', 128, 84)
  return new CanvasTexture(c)
}

export const cafeWallTex = wallTexture()
export const cafeFloorTex = floorTexture()
export const tartanRugTex = repeated(tartanCanvas(), 1.6, 2.4)
export const tartanChairTex = repeated(stewartCanvas(), 1.3, 1.3)
export const tartanSmallTex = repeated(stewartCanvas(), 0.7, 0.7)
export const chalkTex = chalkTexture()
export const tilesTex = tilesTexture()
export const paintingTex = paintingTexture()
export const glassTex = glassTexture()
export const bubbleTex = bubble
export const pageTex = page
export const bulbGlowTex = bulbGlow
export const coldGlowTex = coldGlow
export const matTex = matTexture()
export const wallpaperTex = wallpaperTexture()
