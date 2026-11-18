import { BoxGeometry, ConeGeometry, ExtrudeGeometry, Shape, type BufferGeometry } from 'three'
import { seeded } from '../../../math'
import { far } from '../../materials'
import { canvasTex } from '../../paint'
import { skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'
import { Batch, Part, SPH, cyl, rbox, type Item, type V3 } from '../../parts'

// Le dehors de la salle de bain : une ville de colline, douce et pastel, vue du dessus d'un toit. Façades roses, pêche, beurre, menthe et
// bleu poudré, toits de tuiles canal, volets verts et bleus, balcons de fer, pots de fleurs, linge aux fenêtres, une façade d'azulejos,
// une église blanche à coupole et son clocher couvert de tuiles vertes. Peu de matériaux partagés, des séries instanciées pour les fenêtres :
// une vingtaine de tracés pour toute la ville.

export const GROUND = -0.5
const F = { c: [0, 0] as [number, number], r0: 9, r1: 16.5 }

/** Le crépi : un grain de taches claires et sombres, des coulures sous les fenêtres. Gris moyen : la couleur du mur le teinte. */
const plasterTex = canvasTex(128, 128, (x) => {
  const r = seeded(9)
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, 128, 128)
  for (let k = 0; k < 160; k++) { x.fillStyle = `rgba(150,130,120,${r() * 0.1})`; x.fillRect(r() * 128, r() * 128, 2 + r() * 9, 2 + r() * 5) }
  for (let k = 0; k < 8; k++) { const s = x.createLinearGradient(0, 0, 0, 128); s.addColorStop(0, 'rgba(120,100,90,0)'); s.addColorStop(1, 'rgba(120,100,90,.12)'); x.fillStyle = s; x.fillRect(r() * 128, 0, 3 + r() * 4, 128) }
}, [1, 1])

/** Les azulejos : un damier de carreaux bleus et blancs à fleur de lys, comme les façades de Lisbonne. Tuile 1 × 1. */
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

/** Les murs, un par teinte (le crépi les nuance) ; les toits ; les menuiseries. */
const WALLS = [0xf2c3a2, 0xf2da98, 0xb6dcc8, 0xb2cde4, 0xf0b6c2, 0xf5e9d6, 0xe8bf7c].map((c) => skyFade(far(c, { map: plasterTex, roughness: 0.88 }), F))
const TILE = [0xcf7d5a, 0xbd7052, 0xd98e68].map((c) => skyFade(snowTop(far(c, { roughness: 0.7 }), 1, 0.45, 0.8), F))
export const T = {
  azulejo: skyFade(far(0xffffff, { map: azulejoTex, roughness: 0.4 }), F),
  green: skyFade(snowTop(far(0x6aa8a0, { roughness: 0.55 }), 0.9, 0.4, 0.8), F),
  white: skyFade(far(0xf6f0e4, { roughness: 0.7 }), F),
  gold: skyFade(far(0xdcae58, { roughness: 0.35 }), F),
  frame: skyFade(far(0xf8f1e2, { roughness: 0.6 }), F),
  glass: skyFade(far(0x3b4b62, { roughness: 0.25, emissive: 0xffc070, emissiveIntensity: 0 }), F),
  dark: skyFade(far(0x3b4b62, { roughness: 0.25 }), F),
  shutter: skyFade(far(0xffffff, { roughness: 0.6 }), F),
  iron: skyFade(far(0x30383a, { roughness: 0.5 }), F),
  pot: skyFade(far(0xffffff, { roughness: 0.7 }), F),
  door: skyFade(far(0x7a4a3a, { roughness: 0.6 }), F),
  line: skyFade(far(0x6a6a70, { roughness: 0.8 }), F),
  cloth: skyFade(far(0xffffff, { roughness: 0.9 }), F),
  ground: skyFade(snowTop(far(0xe3d2cc, { roughness: 0.9 }), 1, 0.4, 0.7), F),
  stone: skyFade(snowTop(far(0xe4d8c2, { roughness: 0.8 }), 0.8, 0.45, 0.8), F),
  lantern: skyFade(far(0xfff0c8, { roughness: 0.4, emissive: 0xffc870, emissiveIntensity: 0.1 }), F),
}

const prisms = new Map<string, BufferGeometry>()
/** Un toit à deux pans : section triangulaire (largeur d, hauteur h) étirée sur `len` le long de x, faîtage en haut. */
function prism(d: number, h: number, len: number) {
  const key = `${d.toFixed(2)}|${h.toFixed(2)}|${len.toFixed(2)}`
  let g = prisms.get(key)
  if (!g) {
    const s = new Shape()
    s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, h); s.closePath()
    g = new ExtrudeGeometry(s, { depth: len, bevelEnabled: false })
    g.translate(0, 0, -len / 2)
    g.rotateY(Math.PI / 2)
    prisms.set(key, g)
  }
  return g
}
/** Une pyramide à quatre pans, base carrée de côté 1 (à étirer). */
const HIP = new ConeGeometry(Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4)

/** L'église : au milieu de la deuxième rangée, à gauche de la fenêtre vue de la caméra. */
const CHURCH: [number, number] = [-5.2, -12.0]

interface House {
  x: number
  z: number
  w: number
  d: number
  floors: number
  wall: number
  roof: 'gx' | 'gz' | 'hip' | 'flat'
  tile: number
  azulejo?: boolean
}

/** Les maisons : deux rangées derrière la pièce (la première se voit par la fenêtre), une colonne à gauche et une à droite, tirées à graine. */
function makeHouses(): House[] {
  const r = seeded(77), out: House[] = []
  const row = (z: number, x0: number, x1: number, fl: [number, number], d: number) => {
    let x = x0
    while (x < x1) {
      // la place de l'église : on saute les maisons qui tomberaient dessus
      if (Math.abs(x + 1 - CHURCH[0]) < 3.6 && Math.abs(z - CHURCH[1]) < 3.4) { x += 0.9; continue }
      const w = 1.7 + r() * 0.9, floors = fl[0] + Math.floor(r() * (fl[1] - fl[0] + 1)), roof = (['gx', 'gz', 'hip', 'gx', 'flat'] as const)[Math.floor(r() * 5)]
      out.push({ x: x + w / 2, z: z - r() * 0.5, w, d: d + r() * 0.5, floors, wall: Math.floor(r() * WALLS.length), roof, tile: Math.floor(r() * TILE.length), azulejo: r() < 0.09 })
      x += w + 0.05
    }
  }
  row(-8.4, -9.5, 11, [2, 2], 2.1)
  row(-12.0, -13, 13, [3, 3], 2.4)
  row(-15.6, -15, 15, [3, 4], 2.5)
  // la colonne de gauche : le long du mur de gauche, de plus en plus loin
  for (let i = 0, z = -6.2; z < 7.8; i++) {
    const d = 1.8 + r() * 0.9, floors = 2 + Math.floor(r() * 2), roof = (['gz', 'hip', 'gx', 'gz'] as const)[i % 4]
    out.push({ x: -7.4 - r() * 0.4, z: z + d / 2, w: 2.0 + r() * 0.6, d, floors, wall: Math.floor(r() * WALLS.length), roof, tile: Math.floor(r() * TILE.length), azulejo: r() < 0.08 })
    z += d + 0.05
  }
  for (let i = 0, z = -4.2; z > -7; i++) {
    const d = 1.8 + r() * 0.8
    out.push({ x: 8.6 + r() * 0.4, z: z - d / 2, w: 2.2 + r() * 0.5, d, floors: 2, wall: Math.floor(r() * WALLS.length), roof: (['gx', 'hip', 'gz'] as const)[i % 3], tile: Math.floor(r() * TILE.length) })
    z -= d + 0.05
  }
  return out
}
const HOUSES = makeHouses()

const FLOOR = 1.05

interface Dressing {
  frames: Item[]
  lit: Item[]
  dark: Item[]
  shutters: Item[]
  rails: Item[]
  pots: Item[]
  doors: Item[]
  chimneys: Item[]
  laundry: Item[]
}

/** Les fenêtres, volets, balcons, pots de fleurs, portes, cheminées, linge de chaque maison, en listes (une série instanciée par sorte). */
function dress(): Dressing {
  const r = seeded(5), d: Dressing = { frames: [], lit: [], dark: [], shutters: [], rails: [], pots: [], doors: [], chimneys: [], laundry: [] }
  const SH = [0x5f9a72, 0x4f7fae, 0x5aa59c, 0x8fb9d6, 0x6f9e5a]
  const FL = [0xf08aa2, 0xe85a6c, 0xfafafa, 0xf5b84a]
  const LA = [0xf3b6c4, 0xfff4e2, 0x9cc6e4, 0xf2d27a, 0xa9d8b8]
  for (const h of HOUSES) {
    const H = h.floors * FLOOR + 0.3
    // la façade qui regarde +z, et le flanc qui regarde +x
    for (const side of ['z', 'x'] as const) {
      const span = side === 'z' ? h.w : h.d, n = Math.max(1, Math.floor(span / 0.72)), face = side === 'z' ? h.z + h.d / 2 : h.x + h.w / 2
      const shuttered = r() < 0.6, shCol = SH[Math.floor(r() * SH.length)], balcony = r() < 0.4
      for (let f = 0; f < h.floors; f++) for (let i = 0; i < n; i++) {
        const u = (side === 'z' ? h.x - h.w / 2 : h.z - h.d / 2) + ((i + 0.5) * span) / n, y = GROUND + 0.28 + 0.55 + f * FLOOR
        if (f === 0 && side === 'z' && i === Math.floor(n / 2) && n > 1) { d.doors.push({ p: [u, GROUND + 0.55, face + 0.02], s: [0.42, 0.9, 0.05] }); continue }
        const at = (off: number, up = 0, out = 0): V3 => (side === 'z' ? [u + off, y + up, face + out] : [face + out, y + up, u + off])
        const big = side === 'z' ? ([0.46, 0.66, 0.05] as V3) : ([0.05, 0.66, 0.46] as V3)
        d.frames.push({ p: at(0, 0, 0.012), s: big })
        const gl = { p: at(0, 0, 0.034), s: side === 'z' ? ([0.34, 0.54, 0.03] as V3) : ([0.03, 0.54, 0.34] as V3) }
        ;(r() < 0.72 ? d.lit : d.dark).push(gl)
        if (shuttered) for (const s of [-1, 1]) d.shutters.push({ p: at(s * 0.31, 0, 0.026), s: side === 'z' ? ([0.15, 0.64, 0.03] as V3) : ([0.03, 0.64, 0.15] as V3), c: shCol })
        if (balcony && f > 0) {
          d.rails.push({ p: at(0, -0.3, 0.1), s: side === 'z' ? ([0.62, 0.05, 0.16] as V3) : ([0.16, 0.05, 0.62] as V3) })
          d.rails.push({ p: at(0, -0.2, 0.17), s: side === 'z' ? ([0.62, 0.03, 0.02] as V3) : ([0.02, 0.03, 0.62] as V3) })
        } else if (r() < 0.45) d.pots.push({ p: at(r() < 0.5 ? -0.12 : 0.12, -0.34, 0.08), s: 0.07, c: FL[Math.floor(r() * FL.length)] })
        // du linge qui sèche : trois pièces sur un fil, sous certaines fenêtres
        if (f > 0 && r() < 0.16) for (let k = -1; k <= 1; k++) d.laundry.push({ p: at(k * 0.17, -0.48, 0.2), s: side === 'z' ? ([0.12, 0.2, 0.012] as V3) : ([0.012, 0.2, 0.12] as V3), c: LA[Math.floor(r() * LA.length)] })
      }
    }
    if (h.roof !== 'hip' && r() < 0.5) d.chimneys.push({ p: [h.x + (r() - 0.5) * h.w * 0.5, GROUND + H + 0.45, h.z - 0.1], s: [0.3, 0.7, 0.3] })
  }
  return d
}
const D = dress()
// des boîtes simples (12 triangles) : il y en a des milliers, et elles sont minuscules à l'écran
const RAIL_GEO = new BoxGeometry(1, 1, 1), BOX = RAIL_GEO

/** Une maison : le corps (crépi ou azulejos), le toit, le socle. Ses fenêtres sont dans les séries communes. */
function HouseBody({ h }: { h: House }) {
  const H = h.floors * FLOOR + 0.3, cx = h.x, cz = h.z, wall = WALLS[h.wall], tile = TILE[h.tile]
  return (
    <group>
      <Part geo={rbox(h.w, H, h.d, 0.04)} m={h.azulejo ? T.azulejo : wall} p={[cx, GROUND + H / 2, cz]} castShadow={false} />
      <Part geo={rbox(h.w + 0.06, 0.28, h.d + 0.06, 0.03)} m={T.stone} p={[cx, GROUND + 0.14, cz]} castShadow={false} />
      <Part geo={rbox(h.w + 0.12, 0.08, h.d + 0.12, 0.03)} m={T.white} p={[cx, GROUND + H + 0.01, cz]} castShadow={false} />
      {h.roof === 'gx' && <Part geo={prism(h.d + 0.34, 0.9, h.w + 0.2)} m={tile} p={[cx, GROUND + H + 0.05, cz]} castShadow={false} />}
      {h.roof === 'gz' && <Part geo={prism(h.w + 0.34, 0.9, h.d + 0.2)} m={tile} p={[cx, GROUND + H + 0.05, cz]} rotation-y={Math.PI / 2} castShadow={false} />}
      {h.roof === 'hip' && <Part geo={HIP} m={tile} p={[cx, GROUND + H + 0.05 + 0.5, cz]} scale={[h.w + 0.3, 1, h.d + 0.3]} castShadow={false} />}
      {h.roof === 'flat' && (
        <>
          <Part geo={rbox(h.w + 0.1, 0.22, h.d + 0.1, 0.04)} m={wall} p={[cx, GROUND + H + 0.15, cz]} castShadow={false} />
          <Part geo={rbox(h.w - 0.2, 0.05, h.d - 0.2, 0.02)} m={tile} p={[cx, GROUND + H + 0.28, cz]} castShadow={false} />
        </>
      )}
    </group>
  )
}

/** L'église : une nef blanche à toit de tuiles, un transept à coupole sur tambour, un clocher carré couvert de tuiles vertes avec son horloge. */
function Church({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, GROUND, z]}>
      <Part geo={rbox(4.4, 3.2, 2.6, 0.05)} m={T.white} p={[0, 1.6, 0]} castShadow={false} />
      <Part geo={prism(2.9, 1.2, 4.6)} m={TILE[0]} p={[0, 3.2, 0]} castShadow={false} />
      {/* le tambour et la coupole, au-dessus du transept */}
      <Part geo={cyl(1.15, 1.2, 1.1, 20)} m={T.white} p={[1.0, 3.75, 0]} castShadow={false} />
      <Part geo={SPH} m={T.green} p={[1.0, 4.3, 0]} scale={[1.2, 1.05, 1.2]} castShadow={false} />
      <Part geo={cyl(0.18, 0.2, 0.5, 10)} m={T.white} p={[1.0, 5.4, 0]} castShadow={false} />
      <Part geo={SPH} m={T.gold} p={[1.0, 5.75, 0]} scale={0.14} castShadow={false} />
      {/* le clocher */}
      <Part geo={rbox(1.15, 5.0, 1.15, 0.05)} m={T.white} p={[-2.6, 2.5, 0.2]} castShadow={false} />
      <Part geo={rbox(1.3, 0.14, 1.3, 0.04)} m={T.stone} p={[-2.6, 4.2, 0.2]} castShadow={false} />
      <Part geo={rbox(0.5, 0.8, 1.2, 0.04)} m={T.dark} p={[-2.6, 4.75, 0.2]} castShadow={false} />
      <Part geo={HIP} m={T.green} p={[-2.6, 5.0 + 0.9, 0.2]} scale={[1.5, 1.8, 1.5]} castShadow={false} />
      <Part geo={cyl(0.012, 0.012, 0.5, 5)} m={T.gold} p={[-2.6, 6.95, 0.2]} castShadow={false} />
      {/* le cadran, côté +z et côté +x : un disque crème et deux aiguilles */}
      {[0, 1].map((k) => (
        <group key={k} position={k ? [-2.6 + 0.585, 3.5, 0.2] : [-2.6, 3.5, 0.2 + 0.585]} rotation-y={k ? Math.PI / 2 : 0}>
          <Part geo={cyl(0.34, 0.34, 0.03, 22)} m={T.frame} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={rbox(0.025, 0.24, 0.02, 0.008)} m={T.iron} p={[0, 0.1, 0.02]} castShadow={false} />
          <Part geo={rbox(0.18, 0.025, 0.02, 0.008)} m={T.iron} p={[0.07, 0, 0.022]} castShadow={false} />
        </group>
      ))}
      {/* la porte et le grand arc de la façade */}
      <Part geo={rbox(1.0, 1.7, 0.1, 0.05)} m={T.stone} p={[0.2, 0.85, 1.3]} castShadow={false} />
      <Part geo={rbox(0.7, 1.4, 0.12, 0.2)} m={T.door} p={[0.2, 0.75, 1.32]} castShadow={false} />
      {[-1.4, 1.5].map((px) => <Part key={px} geo={rbox(0.5, 1.0, 0.1, 0.22)} m={T.dark} p={[px, 2.0, 1.3]} castShadow={false} />)}
    </group>
  )
}

/** Quelques fils de linge tendus entre deux murs, avec leurs pièces de couleur (statique). */
function Lines() {
  return (
    <>
      {([[-1.5, 2.6, -9.0, 3.2], [4.2, 2.9, -9.2, 3.6], [-6.4, 2.4, -8.2, 3.0]] as const).map(([x, y, z, len], i) => (
        <group key={i} position={[x + len / 2, y, z]}>
          <Part geo={cyl(0.008, 0.008, len, 4)} m={T.line} rotation-z={Math.PI / 2} castShadow={false} />
          {Array.from({ length: 5 }, (_, k) => (
            <Part key={k} geo={rbox(0.18, 0.3 + (k % 2) * 0.1, 0.012, 0.01)} m={T.cloth} p={[-len / 2 + 0.4 + k * ((len - 0.8) / 4), -0.17, 0]} castShadow={false} />
          ))}
        </group>
      ))}
    </>
  )
}

/** Toute la ville : les maisons, l'église, le linge, les séries de fenêtres, de volets, de balcons, de pots, de portes et de cheminées. */
export function Town() {
  return (
    <>
      {HOUSES.map((h, i) => <HouseBody key={i} h={h} />)}
      <Church x={CHURCH[0]} z={CHURCH[1]} />
      <Lines />
      <Batch geo={BOX} m={T.frame} items={D.frames} />
      <Batch geo={BOX} m={T.glass} items={D.lit} />
      <Batch geo={BOX} m={T.dark} items={D.dark} />
      <Batch geo={BOX} m={T.shutter} items={D.shutters} />
      <Batch geo={RAIL_GEO} m={T.iron} items={D.rails} />
      <Batch geo={SPH} m={T.pot} items={D.pots} />
      <Batch geo={BOX} m={T.door} items={D.doors} />
      <Batch geo={BOX} m={T.cloth} items={D.laundry} />
      <Batch geo={BOX} m={WALLS[3]} items={D.chimneys} />
    </>
  )
}
