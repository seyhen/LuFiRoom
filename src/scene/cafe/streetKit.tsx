import { BoxGeometry, SphereGeometry, type Material } from 'three'
import type { ThreeElements } from '@react-three/fiber'
import { Part, cyl, noRay, orient, rbox, worldUV, type V3 } from '../parts'

// Les cotes de la rue autour du café, et la brique de base de tous ses volumes.

/** Le dessus du trottoir, le dessus de la chaussée (le caniveau y court) : le socle du café plonge dans le trottoir. */
export const SW = -0.6
export const RD = -0.74
/** Le trottoir de devant (x de -11,2 à 4,1, z de 3,3 à 5) et celui de droite (x de 3,3 à 5, z de -3,8 à 3,3) ; leur angle est arrondi (rayon 0,9). */
export const CURB = { front: 5.0, right: 5.0, cx: 4.1, cz: 4.1, r: 0.9, x0: -11.2, zBack: -3.8 }

type MeshProps = Omit<ThreeElements['mesh'], 'position' | 'rotation' | 'material' | 'geometry'>

interface BProps extends MeshProps {
  /** Largeur, hauteur, profondeur. */
  s: V3
  /** Le centre. */
  p: V3
  m: Material
  /** Rayon des arêtes (gummy : arrondi partout). */
  r?: number
  seg?: number
  /** Texture à l'échelle de la scène : `uv` unités par motif (grès, brique, ardoise). */
  uv?: number
  /** Sens des rangs d'une texture à l'échelle : `z` pour des ardoises ou des briques dont les rangs courent le long de z. */
  along?: 'x' | 'z'
  ry?: number
  rx?: number
  rz?: number
}

/**
 * Une boîte aux arêtes arrondies du décor du dehors : sans ombre (le dehors ne s'en soucie pas), sans toucher (les taps la
 * traversent), 108 triangles en une seule passe d'arrondi (`seg` 1) : on en met des centaines.
 */
export function B({ s, p, m, r = 0.03, seg = 1, uv, along, ry = 0, rx = 0, rz = 0, ...rest }: BProps) {
  const g = rbox(s[0], s[1], s[2], r, seg)
  return <Part geo={uv ? worldUV(g, uv, along) : g} m={m} p={p} rotation={[rx, ry, rz]} castShadow={false} raycast={noRay} {...rest} />
}

/** Les deux lampadaires du trottoir : devant à gauche (le vélo y est attaché), au fond à droite (près de l'impasse). Hors de la silhouette du café à l'écran. */
export const LAMP_A: [number, number] = [-3.05, 4.7]
export const LAMP_B: [number, number] = [4.6, -3.4]

/** Un tube rond d'un point à un autre (cadre de vélo, fer forgé). */
export function Link({ a, b, r = 0.018, m, seg = 8 }: { a: V3; b: V3; r?: number; m: Material; seg?: number }) {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const len = Math.hypot(...d)
  return <Part geo={cyl(r, r, len, seg)} m={m} p={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} rotation={orient(d)} castShadow={false} raycast={noRay} />
}

const UNIT = new BoxGeometry(1, 1, 1)
/** Une boîte à arêtes vives, 12 triangles, pour ce qui est petit ou plat (croisillons, jambages) : mise à l'échelle de `s`. */
export function Box({ s, p, m, ry = 0, rx = 0, rz = 0 }: { s: V3; p: V3; m: Material; ry?: number; rx?: number; rz?: number }) {
  return <Part geo={UNIT} m={m} p={p} scale={s} rotation={[rx, ry, rz]} castShadow={false} raycast={noRay} />
}

/** Une sphère légère (10 × 7) pour les boutons, boules et fleurons du dehors : la sphère partagée coûte 1 400 triangles. */
export const LOW = new SphereGeometry(1, 10, 7)
