import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Shape, ShapeGeometry, TubeGeometry, Vector3 } from 'three'

// La baignoire sur pieds de lion : un stade (un rectangle aux deux bouts ronds) dont la taille change avec la hauteur. La coque est
// « loftée » anneau par anneau (flanc dehors, flanc dedans, fond), sans tracé de plus ; le bord roulé est un tube le long du stade.

/** La baignoire : demi-longueur, demi-largeur du bord, hauteur du bord, niveau de l'eau. */
export const TUB = { ax: 1.05, az: 0.475, rim: 0.72, water: 0.5 }

/** [hauteur, retrait] du flanc extérieur (le ventre est à 0, le fond se resserre), puis du flanc intérieur (épaisseur de l'émail comprise). */
const OUT: [number, number][] = [[0.2, 0.17], [0.23, 0.11], [0.3, 0.05], [0.42, 0.012], [0.58, 0], [0.7, 0.01], [0.72, 0.03]]
const INN: [number, number][] = [[0.27, 0.22], [0.31, 0.16], [0.38, 0.11], [0.5, 0.082], [0.62, 0.072], [0.7, 0.07]]

/** Le retrait d'un profil à la hauteur `y`. */
function inset(profile: [number, number][], y: number) {
  if (y <= profile[0][0]) return profile[0][1]
  for (let i = 1; i < profile.length; i++) {
    const [y0, d0] = profile[i - 1], [y1, d1] = profile[i]
    if (y <= y1) return d0 + ((d1 - d0) * (y - y0)) / (y1 - y0)
  }
  return profile[profile.length - 1][1]
}

/** Les points d'un stade de demi-longueur `ax` et demi-largeur `az`, dans le plan (x, z) : même nombre de points quelle que soit la taille. */
export function stadium(ax: number, az: number): [number, number][] {
  const s = Math.max(0, ax - az), m = 14, c = 5, pts: [number, number][] = []
  for (let k = 0; k <= m; k++) { const a = -Math.PI / 2 + (Math.PI * k) / m; pts.push([s + az * Math.cos(a), az * Math.sin(a)]) }
  for (let j = 1; j < c; j++) pts.push([s - (2 * s * j) / c, az])
  for (let k = 0; k <= m; k++) { const a = Math.PI / 2 + (Math.PI * k) / m; pts.push([-s + az * Math.cos(a), az * Math.sin(a)]) }
  for (let j = 1; j < c; j++) pts.push([-s + (2 * s * j) / c, -az])
  return pts
}

/** Un flanc : les anneaux du profil, du bas vers le haut ; `cap` ferme le bas par un éventail (le fond de la baignoire). */
function loft(profile: [number, number][], base: [number, number], cap: boolean, outward: boolean) {
  const rings = profile.map(([y, d]) => ({ y, pts: stadium(base[0] - d, base[1] - d) }))
  const n = rings[0].pts.length, pos: number[] = [], uv: number[] = [], idx: number[] = []
  rings.forEach(({ y, pts }, r) => pts.forEach(([x, z], i) => { pos.push(x, y, z); uv.push(i / n, r / (rings.length - 1)) }))
  for (let r = 0; r < rings.length - 1; r++) for (let i = 0; i < n; i++) {
    const a = r * n + i, b = r * n + ((i + 1) % n), c = (r + 1) * n + i, d = (r + 1) * n + ((i + 1) % n)
    idx.push(a, b, c, b, d, c)
  }
  if (cap) {
    const ctr = rings.length * n
    pos.push(0, rings[0].y, 0); uv.push(0.5, 0)
    for (let i = 0; i < n; i++) idx.push(ctr, (i + 1) % n, i)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  // Les normales doivent regarder vers l'extérieur du flanc (`outward`) ou vers l'axe : on retourne les triangles si elles regardent du mauvais côté
  // (la baignoire était d'un bleu sombre : ses normales pointaient dedans).
  const nor = g.attributes.normal, p = g.attributes.position
  let dot = 0
  for (let i = 0; i < rings.length * n; i++) dot += nor.getX(i) * p.getX(i) + nor.getZ(i) * p.getZ(i)
  if (dot < 0 === outward) {
    for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t }
    g.setIndex(idx)
    g.computeVertexNormals()
  }
  return g
}

/** Le flanc extérieur, bleu givré. */
export const tubOuterGeo = loft(OUT, [TUB.ax, TUB.az], true, true)
/** Le flanc intérieur et le fond, émail blanc (matériau double face : l'orientation des triangles n'a pas à être juste). */
export const tubInnerGeo = loft(INN, [TUB.ax, TUB.az], true, false)

/** Le bord roulé : un tube de 4 cm de rayon qui suit le stade, à la hauteur du bord. */
export const tubRimGeo = (() => {
  const pts = stadium(TUB.ax - 0.03, TUB.az - 0.03).map(([x, z]) => new Vector3(x, TUB.rim, z))
  return new TubeGeometry(new CatmullRomCurve3(pts, true, 'centripetal'), 120, 0.04, 10, true)
})()

/** Un liseré de laiton autour du ventre, à la hauteur `y`. */
export const tubBandGeo = (y: number) => {
  const d = inset(OUT, y) - 0.006, pts = stadium(TUB.ax - d, TUB.az - d).map(([x, z]) => new Vector3(x, y, z))
  return new TubeGeometry(new CatmullRomCurve3(pts, true, 'centripetal'), 120, 0.011, 6, true)
}

/** La surface de l'eau : le stade de l'émail à la hauteur de l'eau, un tout petit peu en retrait. */
export const tubWaterGeo = (() => {
  const d = inset(INN, TUB.water) + 0.003, pts = stadium(TUB.ax - d, TUB.az - d)
  const s = new Shape()
  pts.forEach(([x, z], i) => (i ? s.lineTo(x, -z) : s.moveTo(x, -z)))
  s.closePath()
  const g = new ShapeGeometry(s, 6)
  g.rotateX(-Math.PI / 2)
  return g
})()

/** Le demi-axe de l'eau à la hauteur de l'eau (pour poser la mousse sans qu'elle sorte de la baignoire). */
export const WATER_EDGE = { ax: TUB.ax - inset(INN, TUB.water), az: TUB.az - inset(INN, TUB.water) }
