import { BufferGeometry, Color, Euler, ExtrudeGeometry, Float32BufferAttribute, Matrix4, Quaternion, Shape, SphereGeometry, Vector3 } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { TAU } from '../../../math'
import { blob, cone, ell, pair } from '../../blob'
import { leafGeo } from '../../nature/shapes'
import { cyl, rbox, type V3 } from '../../parts'

// Ce qu'il y a dans les grosses bulles : six petites scènes, chacune en UNE géométrie à couleurs de sommets (un tracé par objet). Tout est à
// l'échelle de la bulle (un mètre de large environ) ; les géométries partagées (`cyl`, `rbox`, feuilles) sont clonées avant d'être déplacées.

const SPH_UNIT = new SphereGeometry(1, 14, 10)

const m4 = new Matrix4(), qa = new Quaternion(), ea = new Euler()
/** Une copie de `g` (non indexée), posée en `p`, tournée de `r`, mise à l'échelle `s`, avec `color` sur tous ses sommets (sauf si elle en a déjà). */
function bake(g: BufferGeometry, color: number, p: V3 = [0, 0, 0], r: V3 = [0, 0, 0], s: V3 | number = 1): BufferGeometry {
  const c = (g.index ? g.toNonIndexed() : g.clone()) as BufferGeometry
  for (const name of Object.keys(c.attributes)) if (name !== 'position' && name !== 'normal' && name !== 'uv' && name !== 'color') c.deleteAttribute(name)
  const sv = typeof s === 'number' ? new Vector3(s, s, s) : new Vector3(...s)
  c.applyMatrix4(m4.compose(new Vector3(...p), qa.setFromEuler(ea.set(...r)), sv))
  if (!c.attributes.color) {
    const n = c.attributes.position.count, tint = new Color(color), a = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) a.set([tint.r, tint.g, tint.b], i * 3)
    c.setAttribute('color', new Float32BufferAttribute(a, 3))
  }
  if (!c.attributes.uv) c.setAttribute('uv', new Float32BufferAttribute(new Float32Array(c.attributes.position.count * 2), 2))
  return c
}
const sph = (p: V3, s: V3 | number, color: number) => bake(SPH_UNIT, color, p, [0, 0, 0], s)
const join = (parts: BufferGeometry[]) => {
  const g = mergeGeometries(parts, false)!
  parts.forEach((x) => x.dispose())
  return g
}

/** Le canard de bain jaune, tourné vers +x, sur trois flocons de mousse. */
export function duck() {
  const body = blob(
    [
      ell([0, 0.07, 0], [0.095, 0.07, 0.078], { color: 0xf8d24c }),
      cone([-0.07, 0.09, 0], [-0.14, 0.158, 0], 0.038, 0.017, { color: 0xf8d24c }),
      ell([0.068, 0.172, 0], [0.056, 0.053, 0.05], { color: 0xf8d24c }),
      ell([0.122, 0.162, 0], [0.036, 0.017, 0.032], { color: 0xf49a3c, k: 0.012 }),
      ...pair(ell([-0.005, 0.085, 0.068], [0.052, 0.038, 0.03], { rot: [0, 0, -0.2], color: 0xf1c23c, k: 0.02 })),
      ...pair(ell([0.078, 0.162, 0.045], [0.014, 0.012, 0.008], { color: 0xf6a89a, k: 0.01 })),
    ],
    { h: 0.0075, k: 0.03, pad: 0.03 },
  )
  const eyes = [-1, 1].map((s) => sph([0.096, 0.19, s * 0.036], 0.0115, 0x2b2233))
  const foam = [[-0.02, -0.01, 0.03, 0.065, 0xfff4ee], [0.07, -0.015, -0.04, 0.055, 0xf7bdcb], [0.0, -0.012, -0.06, 0.05, 0xffffff]].map(([x, y, z, r, c]) => sph([x, y + 0.004, z], r, c))
  const skin = bake(body, 0xf8d24c)
  body.dispose()
  return join([skin, ...eyes, ...foam])
}

/** Un monstera en pot rose : pot, terre, sept tiges arquées, de grandes feuilles fendues et de jeunes feuilles en cœur. */
export function monstera() {
  const parts: BufferGeometry[] = [
    bake(cyl(0.15, 0.11, 0.2, 20), 0xf2bcc6, [0, 0.1, 0]),
    bake(cyl(0.166, 0.166, 0.026, 20), 0xf7ccd3, [0, 0.19, 0]),
    bake(cyl(0.145, 0.145, 0.012, 18), 0x5a4639, [0, 0.206, 0]),
  ]
  const greens = [0x6fbf7e, 0x58a96e, 0x84cf8f, 0x4f9d68]
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU, lean = 0.3 + (i % 3) * 0.12, hh = 0.4 + (i % 4) * 0.1, y0 = 0.215
    const sa = Math.sin(a), ca = Math.cos(a)
    const mid: V3 = [Math.sin(lean) * hh * 0.5 * ca, y0 + (hh * Math.cos(lean)) / 2, -Math.sin(lean) * hh * 0.5 * sa]
    parts.push(bake(cyl(0.008, 0.013, hh, 6), 0x3f8a5a, mid, [0, a, -lean]))
    const tip: V3 = [Math.sin(lean) * hh * ca, y0 + hh * Math.cos(lean), -Math.sin(lean) * hh * sa]
    parts.push(bake(leafGeo(i % 3 === 2 ? 'heart' : 'split'), greens[i % 4], tip, [-0.3 - (i % 2) * 0.12, a + Math.PI / 2 + 0.12 * (i % 3), 0], [0.25, 0.3, 0.4]))
  }
  return join(parts)
}

/** Un pot de bougie bleu givré à étiquette crème, de la cire, une mèche (le petit bougeoir d'à côté sortait de la bulle : retiré). */
export function candle() {
  return join([
    bake(cyl(0.3, 0.28, 0.5, 24), 0x9ccbe0, [0, 0.25, 0]),
    bake(cyl(0.312, 0.312, 0.04, 24), 0xb3d9ea, [0, 0.5, 0]),
    bake(cyl(0.304, 0.29, 0.22, 24), 0xfff1de, [0, 0.22, 0]),
    bake(cyl(0.255, 0.255, 0.012, 22), 0xfff6e8, [0, 0.49, 0]),
    bake(cyl(0.012, 0.012, 0.09, 6), 0x3b2c2c, [0, 0.54, 0]),
    sph([0.06, 0.505, 0.05], [0.05, 0.016, 0.04], 0xfff6e8),
  ])
}

/** Un ruban en spirale d'Archimède dans le plan xy (le bout d'une serviette roulée), à la profondeur `z`. */
function spiral(rIn: number, rOut: number, turns: number, w: number, z: number, color: number) {
  const n = Math.round(turns * 40), pos: number[] = [], idx: number[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n, th = t * turns * TAU, r = rIn + (rOut - rIn) * t, dx = Math.cos(th), dy = Math.sin(th)
    pos.push(dx * (r - w / 2), dy * (r - w / 2), z, dx * (r + w / 2), dy * (r + w / 2), z)
    if (i < n) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new Float32BufferAttribute(Array.from({ length: pos.length / 3 }, () => [0, 0, 1]).flat(), 3))
  g.setIndex(idx)
  const out = bake(g, color)
  g.dispose()
  return out
}

/** Trois serviettes roulées en pyramide (rose, crème, sauge), leurs spirales sur les bouts et un liseré. */
export function towels() {
  const R = 0.27, L = 0.86, parts: BufferGeometry[] = []
  const roll = (x: number, y: number, color: number, edge: number, band: number) => {
    parts.push(bake(cyl(R, R, L, 22), color, [x, y, 0], [Math.PI / 2, 0, 0]))
    parts.push(bake(cyl(R + 0.012, R + 0.012, 0.13, 22), band, [x, y, 0.06], [Math.PI / 2, 0, 0]))
    parts.push(bake(cyl(R + 0.012, R + 0.012, 0.03, 22), band, [x, y, -0.2], [Math.PI / 2, 0, 0]))
    parts.push(...[1, -1].map((s) => spiral(0.03, R - 0.03, 2.3, 0.032, s * (L / 2 + 0.006), edge)).map((g, i) => bake(g, 0, [x, y, 0], [0, i ? Math.PI : 0, 0])))
  }
  roll(-0.3, -0.2, 0xf2b6c2, 0xe49aab, 0xfff0e0)
  roll(0.3, -0.2, 0xfff0e0, 0xe3d2bd, 0xf2b6c2)
  roll(0, 0.27, 0xbcd9c0, 0x9cc2a2, 0xfff0e0)
  return join(parts)
}

/** Un savon rose gravé d'un ovale, sur une coupelle turquoise, sous une grosse bulle de mousse. */
export function soap() {
  return join([
    bake(rbox(1.08, 0.07, 0.72, 0.03), 0x9edbe0, [0, 0.035, 0]),
    bake(rbox(1.0, 0.05, 0.64, 0.02), 0xc4ecee, [0, 0.07, 0]),
    bake(rbox(0.8, 0.27, 0.5, 0.1), 0xf4b3c6, [0, 0.2, 0]),
    sph([0, 0.335, 0], [0.27, 0.02, 0.15], 0xf9cfdb),
    sph([-0.1, 0.4, 0.04], 0.19, 0xffffff),
    sph([0.08, 0.5, -0.02], 0.15, 0xfff4ee),
    sph([0.17, 0.4, 0.07], 0.11, 0xf7bdcb),
    sph([-0.2, 0.52, -0.04], 0.1, 0xfff4ee),
    sph([-0.02, 0.62, 0.03], 0.075, 0xffffff),
    sph([0.3, 0.52, 0.12], 0.06, 0xffffff),
  ])
}

/** Une étoile de mer corail à gros bras ronds, des rangées de pustules claires, un petit cœur. Elle regarde vers +z. */
export function starfish() {
  const s = new Shape(), N = 90
  for (let i = 0; i <= N; i++) {
    const th = (i / N) * TAU, r = 0.52 * (0.4 + 0.6 * Math.abs(Math.cos(2.5 * th)) ** 1.2) + 0.04
    i ? s.lineTo(Math.cos(th) * r, Math.sin(th) * r) : s.moveTo(Math.cos(th) * r, Math.sin(th) * r)
  }
  const body = new ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.06, bevelSegments: 4, curveSegments: 8 })
  const parts: BufferGeometry[] = [bake(body, 0xf08a6a, [0, 0, -0.05])]
  body.dispose()
  // cinq bras, tous les 72 degrés (là où |cos 2,5 θ| vaut 1) ; les pustules courent le long de chacun
  for (let k = 0; k < 5; k++) {
    const th = k * 0.4 * Math.PI
    for (let j = 0; j < 5; j++) {
      const d = 0.14 + j * 0.085, w = 0.036 - j * 0.0035
      parts.push(sph([Math.cos(th) * d, Math.sin(th) * d, 0.12], [w, w, w * 0.8], j % 2 ? 0xffcfb0 : 0xffb897))
    }
  }
  parts.push(sph([0, 0, 0.14], [0.07, 0.07, 0.05], 0xffe0c8))
  return join(parts)
}
