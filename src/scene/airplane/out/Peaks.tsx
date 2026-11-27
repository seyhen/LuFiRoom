import { useEffect, useMemo } from 'react'
import { BufferAttribute, Color, DoubleSide, LatheGeometry, Vector2, type BufferGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { far } from '../../materials'
import { skyFade } from '../../outdoor'
import { LOOK, S, SEA } from './layout'

const ROCK = new Color(0xaab3d4), ROCK_D = new Color(0x97a1c6), SNOW = new Color(0xedf1f8)
const MAT = skyFade(far(0xffffff, { vertexColors: true, roughness: 0.8, side: DoubleSide, emissive: 0xb4bedc, emissiveIntensity: 0.1 }), { r0: 9, r1: 22, stars: 1 })

/**
 * Une montagne : un profil de révolution concave (large au pied, raide en haut), un sommet arrondi ou un cratère, des arêtes qui creusent
 * les flancs, une calotte de neige dont la limite descend en langues dans les ravines. Les couleurs sont dans les sommets.
 */
function peak(h: number, R: number, crater: number, seed: number): BufferGeometry {
  const pts: Vector2[] = []
  const N = 14
  // un cratère creuse le haut ; sinon le haut est un dôme arrondi (rien de pointu)
  if (crater > 0) pts.push(new Vector2(0, h - 0.12), new Vector2(crater * 0.7, h - 0.06))
  else pts.push(new Vector2(0, h + 0.08), new Vector2(0.14, h + 0.05))
  for (let k = 0; k <= N; k++) {
    const t = k / N
    pts.push(new Vector2((crater || 0.22) + (R - (crater || 0.22)) * t ** 1.7, h * (1 - t)))
  }
  pts.push(new Vector2(R * 1.05, -0.6))
  const g = new LatheGeometry(pts, 56)
  const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new Color()
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), t = 1 - Math.max(0, y) / h
    // les arêtes et les ravines : un rayon qui ondule avec l'angle, plus marqué à mi-pente
    const ridge = Math.sin(a * 7 + seed) * 0.6 + Math.sin(a * 13 + seed * 2) * 0.4
    const k = 1 + ridge * 0.07 * Math.sin(Math.min(1, t * 1.6) * Math.PI)
    p.setX(i, x * k)
    p.setZ(i, z * k)
    const snow = h * (0.72 + 0.08 * Math.sin(a * 9 + seed) + 0.05 * ridge)
    c.copy(y > snow ? SNOW : ridge > 0.2 ? ROCK : ROCK_D)
    col.set([c.r, c.g, c.b], i * 3)
  }
  g.setAttribute('color', new BufferAttribute(col, 3))
  g.computeVertexNormals()
  return g
}

/** Le pied d'une montagne posé un peu au-dessus du fond de la mer de nuages (ses flancs de roche sortent : enfoui plus bas, on ne voyait qu'un cône blanc), à la place d'écran `sx` et à la profondeur `dz` (voir `S`). */
function at(sx: number, dz: number) {
  const y = SEA + 0.2, sy = (y - LOOK[1] - 0.492 * dz) / 0.861
  const p = S(sx, sy, dz)
  return [p[0], y, p[2]] as const
}

/**
 * Les sommets qui percent la mer de nuages au fond : un grand volcan enneigé au cratère tronqué (on approche de Tokyo : l'étiquette de la
 * valise dit « TYO »), trois pics plus bas dans les coins du haut. Pâles et loin, fondus dans le ciel (`skyFade` large) ; la nuit, la lune
 * les éclaire et les étoiles les voilent. Un seul maillage, un seul tracé.
 */
export function Peaks() {
  const geo = useMemo(() => {
    const parts = ([
      [1.6, -13, 2.7, 4.6, 0.25, 1],
      [-6.6, -11, 1.9, 3.2, 0, 3],
      [-8.8, -10, 1.3, 2.4, 0, 5],
      [7.6, -10, 1.8, 3.0, 0, 7],
    ] as const).map(([sx, dz, h, R, cr, seed]) => {
      const g = peak(h, R, cr, seed), [x, y, z] = at(sx, dz)
      g.translate(x, y, z)
      return g
    })
    const m = mergeGeometries(parts)
    parts.forEach((g) => g.dispose())
    return m
  }, [])
  useEffect(() => () => geo.dispose(), [geo])
  return <mesh geometry={geo} material={MAT} />
}
