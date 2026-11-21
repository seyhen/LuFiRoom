import { BoxGeometry, ConeGeometry, ExtrudeGeometry, Shape, type BufferGeometry } from 'three'
import { seeded } from '../../../math'
import { far } from '../../materials'
import { canvasTex } from '../../paint'
import { skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'
import { Batch, Part, SPH, SPH_LO, cyl, rbox, worldUV, type Item, type V3 } from '../../parts'

// Le dehors de la salle de bain : Lisbonne, un matin de pluie fine. La salle de bain est l'appartement du dernier étage d'une maison de
// colline (Alfama, Graça) : par la fenêtre on regarde de haut les toits de tuiles canal de la rangée d'en dessous, et derrière la pièce
// le quartier monte en gradins le long de la colline : maisons étroites aux façades pastel (rose, pêche, beurre, menthe, bleu poudré, comme
// le papier peint et les carreaux de la pièce), façades d'azulejos, volets, balcons de fer forgé, linge aux fenêtres, terrasses de toit
// avec leurs pots, cheminées, et l'église blanche à coupole et clocher à tuiles vertes.
// À l'échelle de la pièce : un mètre est un mètre (la fenêtre de la pièce fait 1,8 m, les fenêtres du dehors 0,8 m, un étage 2,6 m). Les
// bâtiments les plus proches sont plus bas que le sol de la pièce ; seuls ceux du fond montent au-dessus du mur, sur la colline.
// Les fenêtres, volets, balcons, pots et linge sont des séries instanciées de boîtes simples (12 triangles) et de sphères légères.

/** Le fond des rues : très en dessous de la pièce, qui est au dernier étage. */
export const GROUND = -8
/** Hauteur d'un étage. */
const FL = 2.6
const F = { c: [0, 0] as [number, number], r0: 9, r1: 16.5 }

/** La colline : la hauteur des corniches selon la place (montée de 0,5 par mètre derrière et à gauche de la pièce, plate devant et à droite). */
export function hill(x: number, z: number) {
  const u = Math.max(-z - 5.5, -x - 5.5, 0)
  return -5.0 + 0.5 * u
}

/** Le crépi : un grain de taches claires et sombres, des coulures sous les fenêtres. Gris moyen : la couleur du mur le teinte. */
const plasterTex = canvasTex(128, 128, (x) => {
  const r = seeded(9)
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, 128, 128)
  for (let k = 0; k < 160; k++) { x.fillStyle = `rgba(150,130,120,${r() * 0.055})`; x.fillRect(r() * 128, r() * 128, 2 + r() * 9, 2 + r() * 5) }
  for (let k = 0; k < 8; k++) { const s = x.createLinearGradient(0, 0, 0, 128); s.addColorStop(0, 'rgba(120,100,90,0)'); s.addColorStop(1, 'rgba(120,100,90,.06)'); x.fillStyle = s; x.fillRect(r() * 128, 0, 3 + r() * 4, 128) }
}, [1, 1])

/** Les azulejos bleus : un damier de carreaux à fleur de lys, comme les façades de Lisbonne. Tuile 1 × 1 (4 × 4 carreaux). */
const azulejoTex = canvasTex(128, 128, (x) => {
  x.fillStyle = '#eef0f0'; x.fillRect(0, 0, 128, 128)
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
    const px = i * 32, py = j * 32
    x.strokeStyle = 'rgba(90,120,170,.35)'; x.lineWidth = 1; x.strokeRect(px + 0.5, py + 0.5, 31, 31)
    x.fillStyle = '#4f78b4'
    x.beginPath(); x.arc(px + 16, py + 16, 6.5, 0, Math.PI * 2); x.fill()
    x.fillStyle = '#eef0f0'; x.beginPath(); x.arc(px + 16, py + 16, 3, 0, Math.PI * 2); x.fill()
    x.fillStyle = '#4f78b4'
    for (const [dx, dy] of [[0, 0], [32, 0], [0, 32], [32, 32]]) { x.beginPath(); x.moveTo(px + dx, py + dy - 8); x.lineTo(px + dx + 8, py + dy); x.lineTo(px + dx, py + dy + 8); x.lineTo(px + dx - 8, py + dy); x.fill() }
  }
}, [1, 1])

/** Les azulejos verts et crème : un treillis de losanges et des points, de la famille des carreaux menthe de la pièce. */
const azulejoGreenTex = canvasTex(128, 128, (x) => {
  x.fillStyle = '#f3ecdc'; x.fillRect(0, 0, 128, 128)
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
    const px = i * 32, py = j * 32
    x.strokeStyle = 'rgba(80,140,130,.3)'; x.lineWidth = 1; x.strokeRect(px + 0.5, py + 0.5, 31, 31)
    x.fillStyle = '#6aa89c'
    x.beginPath(); x.moveTo(px + 16, py + 3); x.lineTo(px + 29, py + 16); x.lineTo(px + 16, py + 29); x.lineTo(px + 3, py + 16); x.closePath(); x.fill()
    x.fillStyle = '#f3ecdc'
    x.beginPath(); x.moveTo(px + 16, py + 10); x.lineTo(px + 22, py + 16); x.lineTo(px + 16, py + 22); x.lineTo(px + 10, py + 16); x.closePath(); x.fill()
    x.fillStyle = '#e8a6b4'; x.beginPath(); x.arc(px + 16, py + 16, 2.4, 0, Math.PI * 2); x.fill()
    x.fillStyle = '#6aa89c'
    for (const [dx, dy] of [[0, 0], [32, 0], [0, 32], [32, 32]]) { x.beginPath(); x.arc(px + dx, py + dy, 4, 0, Math.PI * 2); x.fill() }
  }
}, [1, 1])

/** Les tuiles canal : des bandes de tuiles creuses (un sillon sombre, une crête claire) et de fines coupures de rangs. Gris : la couleur du toit la teinte. */
const tileTex = canvasTex(64, 64, (x) => {
  const r = seeded(21)
  x.fillStyle = '#e4e4e4'; x.fillRect(0, 0, 64, 64)
  for (let i = 0; i < 4; i++) {
    const g = x.createLinearGradient(i * 16, 0, i * 16 + 16, 0)
    g.addColorStop(0, '#b8b8b8'); g.addColorStop(0.35, '#f4f4f4'); g.addColorStop(0.65, '#e6e6e6'); g.addColorStop(1, '#b0b0b0')
    x.fillStyle = g; x.fillRect(i * 16, 0, 16, 64)
  }
  for (let j = 0; j < 8; j++) { x.fillStyle = 'rgba(90,70,60,.16)'; x.fillRect(0, j * 8 + (j % 2), 64, 1.2) }
  for (let k = 0; k < 40; k++) { x.fillStyle = `rgba(80,70,60,${r() * 0.12})`; x.fillRect(r() * 64, r() * 64, 2 + r() * 5, 2 + r() * 3) }
}, [1, 1])

/** Les murs, un par teinte (le crépi les nuance) ; les toits de tuiles rose-terre cuite ; les menuiseries. */
const WALLS = [0xf2c3a2, 0xf2da98, 0xb6dcc8, 0xb2cde4, 0xf0b6c2, 0xf5e9d6, 0xe8bf7c].map((c) => skyFade(far(c, { map: plasterTex, roughness: 0.88 }), F))
const TILE = [0xe3a690, 0xd89a86, 0xeab49e].map((c) => skyFade(snowTop(far(c, { map: tileTex, roughness: 0.7 }), 1, 0.45, 0.8), F))
export const T = {
  azulejo: skyFade(far(0xffffff, { map: azulejoTex, roughness: 0.4 }), F),
  azulejoGreen: skyFade(far(0xffffff, { map: azulejoGreenTex, roughness: 0.4 }), F),
  green: skyFade(snowTop(far(0x6aa8a0, { roughness: 0.55 }), 0.9, 0.4, 0.8), F),
  white: skyFade(far(0xeee4d4, { roughness: 0.7 }), F),
  gold: skyFade(far(0xdcae58, { roughness: 0.35 }), F),
  frame: skyFade(far(0xf8f1e2, { roughness: 0.6 }), F),
  glass: skyFade(far(0x8ea6bc, { roughness: 0.25, emissive: 0xffc070, emissiveIntensity: 0 }), F),
  dark: skyFade(far(0x7d93ab, { roughness: 0.25 }), F),
  shutter: skyFade(far(0xffffff, { roughness: 0.6 }), F),
  iron: skyFade(far(0x5b5660, { roughness: 0.5 }), F),
  pot: skyFade(far(0xffffff, { roughness: 0.7 }), F),
  line: skyFade(far(0x8a8088, { roughness: 0.8 }), F),
  cloth: skyFade(far(0xffffff, { roughness: 0.9 }), F),
  ground: skyFade(snowTop(far(0xe3d2cc, { roughness: 0.9 }), 1, 0.4, 0.7), F),
  stone: skyFade(snowTop(far(0xe4d8c2, { roughness: 0.8 }), 0.8, 0.45, 0.8), F),
  door: skyFade(far(0xb5806a, { roughness: 0.6 }), F),
}

const prisms = new Map<string, BufferGeometry>()
/** Un toit à deux pans : section triangulaire (largeur d, hauteur h) étirée sur `len` le long de x, faîtage en haut ; UV en tuiles (bandes dans le sens de la pente). */
function prism(d: number, h: number, len: number) {
  const key = `${d.toFixed(2)}|${h.toFixed(2)}|${len.toFixed(2)}`
  let g = prisms.get(key)
  if (!g) {
    const s = new Shape()
    s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, h); s.closePath()
    g = new ExtrudeGeometry(s, { depth: len, bevelEnabled: false })
    g.translate(0, 0, -len / 2)
    g.rotateY(Math.PI / 2)
    g = worldUV(g, 1.4)
    prisms.set(key, g)
  }
  return g
}
/** Une pyramide à quatre pans, base carrée de côté 1 (à étirer), aux UV de tuiles : des bandes qui descendent de la pointe. */
export const HIP = (() => {
  const g = new ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4)
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv
  for (let i = 0; i < p.count; i++) uv.setXY(i, (Math.abs(n.getX(i)) > Math.abs(n.getZ(i)) ? p.getZ(i) : p.getX(i)) * 4.6, p.getY(i))
  return g
})()

/** L'église : au milieu de la deuxième rangée, à droite de la colline, l'échelle 1,5 de son dessin. */
const CHURCH = { x: -2.4, z: -12.5, base: -5.6, k: 1.3 }
/** Son socle : de la rue jusqu'à la corniche de sa nef (x min, x max, z min, z max). */
const CHURCH_PLINTH = { x0: -7.3, x1: 1.1, z0: -14.5, z1: -10.5 }

interface House {
  x: number
  z: number
  w: number
  d: number
  /** Hauteur de la corniche. */
  e: number
  /** Étages visibles sous la corniche (le reste est un mur de soutènement de pierre). */
  nf: number
  wall: number
  roof: 'gx' | 'gz' | 'hip' | 'flat'
  tile: number
  azu: 0 | 1 | 2
}

/** Les maisons : trois rangées derrière la pièce en gradins (la première se voit par la fenêtre, d'en haut), une colonne à gauche, une à droite, un petit rang devant. */
function makeHouses(): House[] {
  const r = seeded(77), out: House[] = []
  const add = (x: number, z: number, w: number, d: number, e: number, roof: House['roof']) => {
    const nf = Math.max(1, Math.min(3, Math.floor((e - GROUND - 0.1) / FL)))
    out.push({ x, z, w, d, e, nf, wall: Math.floor(r() * WALLS.length), roof, tile: Math.floor(r() * TILE.length), azu: r() < 0.22 ? (r() < 0.62 ? 1 : 2) : 0 })
  }
  const jit = () => (r() - 0.5) * 0.9
  // les rangées du fond (façades vers +z) : les maisons tombant sur l'église sont sautées
  const row = (zFront: number, d: number, x0: number, x1: number) => {
    const roofs = ['gx', 'hip', 'gx', 'flat', 'hip'] as const
    let x = x0
    while (x < x1) {
      // la rangée s'arrête avant la colonne de droite (x ≥ 8,9) : une maison ne la traverse pas
      const w = Math.min(3.6 + r() * 1.6, 8.6 - x), cx = x + w / 2, cz = zFront - d / 2
      if (w < 3.2) break
      if (cx + w / 2 > CHURCH_PLINTH.x0 - 0.3 && cx - w / 2 < CHURCH_PLINTH.x1 + 0.3 && cz + d / 2 > CHURCH_PLINTH.z0 && cz - d / 2 < CHURCH_PLINTH.z1) { x += 0.9; continue }
      add(cx, cz, w, d, hill(cx, cz) + jit(), roofs[Math.floor(r() * roofs.length)])
      x += w + 0.08
    }
  }
  row(-6.2, 3.6, -7.0, 8.6)
  row(-10.6, 4.2, -7.0, 8.6)
  row(-15.4, 4.4, -7.0, 8.6)
  // la colonne de gauche, le long de la pièce, qui monte en allant vers le fond (façades vers +x)
  const left = ['gz', 'hip', 'gz', 'flat'] as const
  for (let i = 0, z = 9; z > -20; i++) {
    const d = 3.6 + r() * 1.2, w = 4.0 + r() * 0.5, zc = z - d / 2
    add(-10.6 - r() * 0.2, zc, w, d, hill(-10.6, zc) + jit(), left[i % 4])
    z -= d + 0.08
  }
  // la colonne de droite : plus basse, elle ne passe pas devant la pièce
  const right = ['gz', 'hip', 'flat', 'gz'] as const
  for (let i = 0, z = 6; z > -20; i++) {
    const d = 3.6 + r() * 1.2, w = 4.0 + r() * 0.5, zc = z - d / 2
    add(11.2 + r() * 0.2, zc, w, d, hill(11.2, zc) + jit(), right[i % 4])
    z -= d + 0.08
  }
  // un petit rang tout devant : des toits bas, vus d'en haut, qui disent que la pièce est au dernier étage
  for (let x = -6.2; x < 7; ) {
    const w = 4.0 + r() * 1.4
    add(x + w / 2, 9.0, w, 3.6, -4.8 + jit() * 0.5, (['gx', 'hip', 'flat'] as const)[Math.floor(r() * 3)])
    x += w + 0.08
  }
  return out
}
const HOUSES = makeHouses()

interface Dressing {
  frames: Item[]
  lit: Item[]
  dark: Item[]
  color: Item[]
  rails: Item[]
  pots: Item[]
  cloth: Item[]
  lines: Item[]
}

/** Les fenêtres, volets, balcons, pots, linge et toits de chaque maison, en listes (une série instanciée par sorte). */
function dress(): Dressing {
  const r = seeded(5), d: Dressing = { frames: [], lit: [], dark: [], color: [], rails: [], pots: [], cloth: [], lines: [] }
  const SH = [0x7fb394, 0x79a3c8, 0x8cc4b8, 0xa9c8e0, 0xe9a3b3, 0x9cc08a]
  const FLW = [0xf08aa2, 0xe85a6c, 0xfafafa, 0xf5b84a]
  const LA = [0xf3b6c4, 0xfff4e2, 0x9cc6e4, 0xf2d27a, 0xa9d8b8]
  const TERRA = 0xd4906f
  for (const h of HOUSES) {
    // la façade qui regarde +z, et le flanc qui regarde +x
    for (const side of ['z', 'x'] as const) {
      const span = side === 'z' ? h.w : h.d, n = Math.max(1, Math.floor(span / 1.9)), face = side === 'z' ? h.z + h.d / 2 : h.x + h.w / 2
      const shuttered = r() < 0.6, shCol = SH[Math.floor(r() * SH.length)], balcony = r() < 0.4
      const sz = (a: number, b: number, c: number): V3 => (side === 'z' ? [a, b, c] : [c, b, a])
      for (let f = 0; f < h.nf; f++) for (let i = 0; i < n; i++) {
        const u = (side === 'z' ? h.x - h.w / 2 : h.z - h.d / 2) + ((i + 0.5) * span) / n, yc = h.e - FL * (f + 0.5)
        const at = (off: number, up = 0, out = 0): V3 => (side === 'z' ? [u + off, yc + up, face + out] : [face + out, yc + up, u + off])
        d.frames.push({ p: at(0, 0, 0.012), s: sz(0.95, 1.5, 0.05) })
        ;(r() < 0.72 ? d.lit : d.dark).push({ p: at(0, 0, 0.034), s: sz(0.78, 1.3, 0.03) })
        d.frames.push({ p: at(0, -0.79, 0.1), s: sz(1.15, 0.08, 0.2) }) // l'appui de pierre
        if (shuttered) for (const s of [-1, 1]) d.color.push({ p: at(s * 0.69, 0, 0.026), s: sz(0.36, 1.32, 0.03), c: shCol })
        if (balcony && f > 0) {
          d.rails.push({ p: at(0, -0.88, 0.22), s: sz(1.45, 0.09, 0.44) })
          d.rails.push({ p: at(0, -0.34, 0.42), s: sz(1.45, 0.05, 0.05) })
          for (let k = 0; k < 6; k++) d.rails.push({ p: at(-0.66 + k * 0.264, -0.6, 0.42), s: sz(0.03, 0.5, 0.03) })
        } else if (r() < 0.5) {
          // une jardinière à l'appui : une caisse de terre cuite et trois touffes de fleurs
          d.color.push({ p: at(0, -0.64, 0.15), s: sz(0.9, 0.2, 0.2), c: TERRA })
          for (const k of [-1, 0, 1]) d.pots.push({ p: at(k * 0.28, -0.46, 0.15), s: 0.15, c: FLW[Math.floor(r() * FLW.length)] })
        }
        // du linge qui sèche : un fil et quelques pièces, sous certaines fenêtres
        if (f > 0 && r() < 0.18) {
          d.lines.push({ p: at(0, -0.62, 0.36), s: sz(1.6, 0.025, 0.025) })
          for (let k = -2; k <= 2; k++) d.cloth.push({ p: at(k * 0.3, -0.84, 0.36), s: sz(0.22, 0.42 + (k & 1) * 0.1, 0.018), c: LA[Math.floor(r() * LA.length)] })
        }
      }
    }
    // une cheminée de briques crépies avec son chapeau, sur les toits en pente
    if (h.roof !== 'hip' && h.roof !== 'flat' && r() < 0.6) {
      const cx = h.x + (r() - 0.5) * h.w * 0.5, cz = h.z - h.d * 0.18
      d.color.push({ p: [cx, h.e + 1.0, cz], s: [0.46, 1.0, 0.46], c: 0xf0e0cc })
      d.color.push({ p: [cx, h.e + 1.55, cz], s: [0.62, 0.1, 0.62], c: 0xd4906f })
    }
    // un toit plat est une terrasse : parapet (en pièces), abri d'escalier, pots de fleurs, fil à linge et ses pièces
    if (h.roof === 'flat') {
      const top = h.e + 0.06
      d.color.push({ p: [h.x + h.w * 0.26, top + 0.55, h.z - h.d * 0.22], s: [1.2, 1.1, 1.0], c: 0xf2e4d2 })
      d.color.push({ p: [h.x + h.w * 0.26, top + 1.13, h.z - h.d * 0.22], s: [1.34, 0.08, 1.14], c: 0xd4906f })
      for (const k of [-1, 0, 1]) {
        const px = h.x - h.w * 0.32 + k * 0.55, pz = h.z + h.d * 0.22
        d.color.push({ p: [px, top + 0.17, pz], s: [0.42, 0.34, 0.42], c: TERRA })
        d.pots.push({ p: [px, top + 0.5, pz], s: [0.27, 0.22, 0.27], c: 0x7fb394 })
        d.pots.push({ p: [px + 0.08, top + 0.66, pz + 0.05], s: 0.1, c: FLW[(k + 2 + HOUSES.indexOf(h)) % FLW.length] })
        d.pots.push({ p: [px - 0.1, top + 0.62, pz - 0.04], s: 0.085, c: FLW[(k + 3 + HOUSES.indexOf(h)) % FLW.length] })
      }
      if (r() < 0.8) {
        const zz = h.z + h.d * 0.02, y = top + 1.35
        for (const sx of [-1, 1]) d.lines.push({ p: [h.x + sx * (h.w / 2 - 0.5), top + 0.7, zz], s: [0.06, 1.4, 0.06] })
        d.lines.push({ p: [h.x, y, zz], s: [h.w - 0.9, 0.025, 0.025] })
        for (let k = 0; k < 5; k++) d.cloth.push({ p: [h.x - (h.w - 1.6) / 2 + (k * (h.w - 1.6)) / 4, y - 0.3, zz], s: [0.34, 0.5 + (k % 2) * 0.12, 0.02], c: LA[(k + HOUSES.indexOf(h)) % LA.length] })
      }
    }
  }
  return d
}
const D = dress()
// des boîtes simples (12 triangles) : il y en a des milliers, et elles sont minuscules à l'écran
const BOX = new BoxGeometry(1, 1, 1)

/** Une maison : le corps (crépi ou azulejos), le soubassement de pierre, la corniche, le toit. Ses fenêtres sont dans les séries communes. */
function HouseBody({ h, i }: { h: House; i: number }) {
  const H = h.nf * FL, yb = h.e - H, cx = h.x, cz = h.z, wall = h.azu === 1 ? T.azulejo : h.azu === 2 ? T.azulejoGreen : WALLS[h.wall], tile = TILE[h.tile]
  const rh = Math.min(1.7, 0.3 * (Math.min(h.w, h.d) + 0.24) + 0.3)
  // deux maisons voisines de même hauteur : leurs corniches (un peu plus larges que le mur) se recouvrent ; chacune a sa hauteur, 0,012 d'écart
  const lift = (i % 3) * 0.012
  const bodyGeo = worldUV(rbox(h.w, H, h.d, 0.04), h.azu ? 1.6 : 4)
  const base = yb - GROUND
  return (
    <group>
      <Part geo={bodyGeo} m={wall} p={[cx, yb + H / 2, cz]} castShadow={false} />
      {base > 0.05 && <Part geo={rbox(h.w + 0.1, base, h.d + 0.1, 0.04)} m={T.stone} p={[cx, GROUND + base / 2, cz]} castShadow={false} />}
      <Part geo={rbox(h.w + 0.12, 0.14, h.d + 0.12, 0.03)} m={T.white} p={[cx, h.e + lift, cz]} castShadow={false} />
      {h.roof === 'gx' && <Part geo={prism(h.d + 0.24, rh, h.w + 0.16)} m={tile} p={[cx, h.e + 0.07 + lift, cz]} castShadow={false} />}
      {h.roof === 'gz' && <Part geo={prism(h.w + 0.24, rh, h.d + 0.16)} m={tile} p={[cx, h.e + 0.07 + lift, cz]} rotation-y={Math.PI / 2} castShadow={false} />}
      {h.roof === 'hip' && <Part geo={HIP} m={tile} p={[cx, h.e + 0.07 + lift + rh / 2, cz]} scale={[h.w + 0.3, rh, h.d + 0.3]} castShadow={false} />}
      {h.roof === 'flat' && (
        <>
          <Part geo={rbox(h.w, 0.06, h.d, 0.02)} m={T.stone} p={[cx, h.e + 0.07 + lift, cz]} castShadow={false} />
          <Part geo={rbox(h.w + 0.06, 0.45, 0.16, 0.03)} m={wall} p={[cx, h.e + 0.3 + lift, cz + h.d / 2 - 0.04]} castShadow={false} />
          <Part geo={rbox(h.w + 0.06, 0.45, 0.16, 0.03)} m={wall} p={[cx, h.e + 0.3 + lift, cz - h.d / 2 + 0.04]} castShadow={false} />
          <Part geo={rbox(0.16, 0.45, h.d - 0.1, 0.03)} m={wall} p={[cx - h.w / 2 + 0.04, h.e + 0.3 + lift, cz]} castShadow={false} />
          <Part geo={rbox(0.16, 0.45, h.d - 0.1, 0.03)} m={wall} p={[cx + h.w / 2 - 0.04, h.e + 0.3 + lift, cz]} castShadow={false} />
        </>
      )}
    </group>
  )
}

/**
 * L'église (échelle 1,5) : une nef blanche à toit de tuiles, un transept à coupole sur tambour, un clocher carré à horloge couvert de tuiles
 * vertes, sur un socle qui descend jusqu'à la rue.
 */
function Church() {
  const { x, z, base, k } = CHURCH, P = CHURCH_PLINTH
  return (
    <>
      <Part geo={rbox(P.x1 - P.x0, base - GROUND, P.z1 - P.z0, 0.05)} m={T.stone} p={[(P.x0 + P.x1) / 2, (GROUND + base) / 2, (P.z0 + P.z1) / 2]} castShadow={false} />
      <group position={[x, base, z]} scale={k}>
        <Part geo={rbox(4.4, 3.2, 2.6, 0.05)} m={T.white} p={[0, 1.6, 0]} castShadow={false} />
        <Part geo={prism(2.9, 1.2, 4.6)} m={TILE[0]} p={[0, 3.2, 0]} castShadow={false} />
        {/* le tambour et la coupole, au-dessus du transept */}
        <Part geo={cyl(1.25, 1.3, 1.1, 20)} m={T.white} p={[1.0, 3.75, 0]} castShadow={false} />
        <Part geo={SPH} m={T.green} p={[1.0, 4.3, 0]} scale={[1.2, 1.05, 1.2]} castShadow={false} />
        <Part geo={cyl(0.18, 0.2, 0.5, 10)} m={T.white} p={[1.0, 5.4, 0]} castShadow={false} />
        <Part geo={SPH} m={T.gold} p={[1.0, 5.75, 0]} scale={0.14} castShadow={false} />
        {/* le clocher */}
        <Part geo={rbox(1.15, 5.0, 1.15, 0.05)} m={T.white} p={[-2.6, 2.5, 0.2]} castShadow={false} />
        <Part geo={rbox(1.3, 0.14, 1.3, 0.04)} m={T.stone} p={[-2.6, 4.2, 0.2]} castShadow={false} />
        <Part geo={rbox(0.5, 0.8, 1.2, 0.04)} m={T.dark} p={[-2.6, 4.75, 0.2]} castShadow={false} />
        <Part geo={HIP} m={T.green} p={[-2.6, 5.0 + 0.65, 0.2]} scale={[1.5, 1.3, 1.5]} castShadow={false} />
        <Part geo={cyl(0.012, 0.012, 0.5, 5)} m={T.gold} p={[-2.6, 6.5, 0.2]} castShadow={false} />
        {/* le cadran, côté +z et côté +x : un disque crème et deux aiguilles */}
        {[0, 1].map((q) => (
          <group key={q} position={q ? [-2.6 + 0.585, 3.5, 0.2] : [-2.6, 3.5, 0.2 + 0.585]} rotation-y={q ? Math.PI / 2 : 0}>
            <Part geo={cyl(0.34, 0.34, 0.03, 22)} m={T.frame} rotation-x={Math.PI / 2} castShadow={false} />
            <Part geo={rbox(0.025, 0.24, 0.02, 0.008)} m={T.iron} p={[0, 0.1, 0.02]} castShadow={false} />
            <Part geo={rbox(0.18, 0.025, 0.02, 0.008)} m={T.iron} p={[0.07, 0, 0.022]} castShadow={false} />
          </group>
        ))}
        {/* le pignon qui regarde +x : deux hautes fenêtres en arc et une rosace, pour que le grand mur blanc ne soit pas nu */}
        {[-0.65, 0.65].map((pz) => <Part key={pz} geo={rbox(0.1, 1.0, 0.5, 0.22)} m={T.dark} p={[2.2, 1.9, pz]} castShadow={false} />)}
        <Part geo={cyl(0.28, 0.28, 0.1, 18)} m={T.frame} rotation-z={Math.PI / 2} p={[2.2, 2.75, 0]} castShadow={false} />
        <Part geo={cyl(0.19, 0.19, 0.12, 18)} m={T.dark} rotation-z={Math.PI / 2} p={[2.22, 2.75, 0]} castShadow={false} />
        {/* la porte et le grand arc de la façade */}
        <Part geo={rbox(1.0, 1.7, 0.1, 0.05)} m={T.stone} p={[0.2, 0.85, 1.3]} castShadow={false} />
        <Part geo={rbox(0.7, 1.4, 0.12, 0.2)} m={T.door} p={[0.2, 0.75, 1.32]} castShadow={false} />
        {[-1.4, 1.5].map((px) => <Part key={px} geo={rbox(0.5, 1.0, 0.1, 0.22)} m={T.dark} p={[px, 2.0, 1.3]} castShadow={false} />)}
      </group>
    </>
  )
}

/** Toute la ville : les maisons, l'église, les séries de fenêtres, de volets, de balcons, de pots, de linge. */
export function Town() {
  return (
    <>
      {HOUSES.map((h, i) => <HouseBody key={i} h={h} i={i} />)}
      <Church />
      <Batch geo={BOX} m={T.frame} items={D.frames} />
      <Batch geo={BOX} m={T.glass} items={D.lit} />
      <Batch geo={BOX} m={T.dark} items={D.dark} />
      <Batch geo={BOX} m={T.shutter} items={D.color} />
      <Batch geo={BOX} m={T.iron} items={D.rails} />
      <Batch geo={SPH_LO} m={T.pot} items={D.pots} />
      <Batch geo={BOX} m={T.cloth} items={D.cloth} />
      <Batch geo={BOX} m={T.line} items={D.lines} />
    </>
  )
}
