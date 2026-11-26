import { BufferGeometry, Color, Euler, ExtrudeGeometry, Float32BufferAttribute, Matrix4, Quaternion, Shape, Vector2, Vector3 } from 'three'
import { mergeGeometries, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js'
import { cyl, rbox, SPH, type V3 } from '../../parts'

// La petite voiture de la rue de la laverie (celle qui attend le long du trottoir, et celles qui passent) : une 4L de quartier, à la
// carrosserie ronde et haute sur roues, faite pour être lue de loin. Tout le corps (coque, vitres, roues, pare-chocs, galerie, panier de
// linge) est fondu en UN maillage aux couleurs de sommets : une voiture = un tracé de carrosserie, plus un pour les phares et un pour les feux.
// Repère : l'avant est vers +z, la largeur sur x, le pied (la route) à y = 0. Une voiture mesure 2,3 de long, 1,06 de large, 1,1 de haut.

interface Piece { g: BufferGeometry; c: number; at?: V3; rot?: V3; s?: V3 }
const M4 = new Matrix4(), Q = new Quaternion(), E = new Euler()

/** Fond des pièces en un seul maillage : chacune est passée en non indexé, déplacée, puis colorée par sommet. */
function build(pieces: Piece[]): BufferGeometry {
  const gs = pieces.map(({ g, c, at = [0, 0, 0], rot = [0, 0, 0], s = [1, 1, 1] }) => {
    const n = g.index ? g.toNonIndexed() : g.clone()
    for (const k of Object.keys(n.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') n.deleteAttribute(k)
    if (!n.attributes.uv) n.setAttribute('uv', new Float32BufferAttribute(new Float32Array(n.attributes.position.count * 2), 2))
    n.applyMatrix4(M4.compose(new Vector3(...at), Q.setFromEuler(E.set(...rot)), new Vector3(...s)))
    const col = new Color(c), a = new Float32Array(n.attributes.position.count * 3)
    for (let i = 0; i < a.length; i += 3) { a[i] = col.r; a[i + 1] = col.g; a[i + 2] = col.b }
    n.setAttribute('color', new Float32BufferAttribute(a, 3))
    return n
  })
  return mergeGeometries(gs, false)
}

/** Le profil d'une carrosserie (z, y) étiré sur la largeur `width`, les arêtes arrondies par un biseau ; les normales gardent les plats plats. */
function profile(pts: [number, number][], width: number, bevel: number): BufferGeometry {
  const depth = width - 2 * bevel
  const g = new ExtrudeGeometry(new Shape(pts.map(([z, y]) => new Vector2(z, y))), {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 1,
  })
  g.translate(0, 0, -depth / 2)
  g.rotateY(-Math.PI / 2) // le x du profil devient le z de la voiture, l'extrusion devient sa largeur
  return toCreasedNormals(g, 1.0)
}

const GLASS = 0x26364b, TYRE = 0x1b2024, CHROME = 0xd2dae0, DARK = 0x11151a, MUD = 0x39404a
const R = 0.22 // le rayon des roues
/** Les quatre roues : [x, z]. */
const WHEELS: [number, number][] = [[-0.5, 0.68], [0.5, 0.68], [-0.5, -0.68], [0.5, -0.68]]
const HALF = Math.PI / 2

/** Une arche de roue : un demi-cercle (rayon 0,33 avant le biseau, qui le ramène à 0,27) taillé de bout en bout dans le bas de caisse, de l'arrière vers l'avant. */
const arch = (zc: number): [number, number][] => {
  const a0 = Math.asin(0.04 / 0.33)
  return Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI - a0 - (i / 8) * (Math.PI - 2 * a0)
    return [zc + Math.cos(a) * 0.33, 0.22 + Math.sin(a) * 0.33] as [number, number]
  })
}
/** Le contour (z, y) de la coque : le bas de caisse et ses arches, l'avant, le capot qui plonge, le toit plat, le hayon. */
const OUTLINE: [number, number][] = [
  [-1.06, 0.26], ...arch(-0.68), ...arch(0.68), [1.06, 0.26],
  [1.1, 0.36], [1.1, 0.54], [0.98, 0.64], [0.55, 0.68], [-0.9, 0.68], [-1.1, 0.6], [-1.1, 0.36],
]

/** La coque d'une voiture d'une couleur de carrosserie donnée. */
export function carBody(paint: number, basket = false): BufferGeometry {
  const body: Piece[] = [
    // la coque : un profil de hayon, le capot qui plonge devant, le toit plat
    { g: profile(OUTLINE, 1.06, 0.06), c: paint },
    // la cabine : un bloc de vitres sombres (pare-brise incliné, lunette quasi droite), le pavillon par-dessus, un montant au milieu
    { g: profile([[-0.86, 0.7], [0.62, 0.7], [0.3, 1.02], [-0.74, 1.02]], 0.96, 0.03), c: GLASS },
    { g: rbox(1.0, 0.07, 1.14, 0.03), c: paint, at: [0, 1.085, -0.22] },
    { g: rbox(1.0, 0.33, 0.07, 0.02), c: paint, at: [0, 0.88, -0.2] },
    // sous la caisse, dans les arches : le fond sombre (on ne voit pas à travers)
    ...[-0.68, 0.68].map((z): Piece => ({ g: rbox(0.78, 0.36, 0.6, 0.05), c: DARK, at: [0, 0.34, z] })),
    // le bas de caisse éclaboussé : la boue de la route mouillée
    ...[-1, 1].map((k): Piece => ({ g: rbox(0.014, 0.08, 0.92, 0.005, 1), c: MUD, at: [k * 0.534, 0.31, 0] })),
    // l'avant : calandre sombre et ses lamelles, plaque, pare-chocs chromés, les deux optiques et leurs collerettes
    { g: rbox(0.36, 0.1, 0.03, 0.012), c: DARK, at: [0, 0.47, 1.166] },
    ...[0.44, 0.5].map((y): Piece => ({ g: rbox(0.3, 0.012, 0.02, 0.005, 1), c: CHROME, at: [0, y, 1.186] })),
    { g: rbox(0.3, 0.075, 0.02, 0.01), c: 0xf0e8cc, at: [0, 0.37, 1.17] },
    { g: rbox(1.16, 0.07, 0.09, 0.03), c: CHROME, at: [0, 0.29, 1.19] },
    { g: rbox(1.16, 0.07, 0.09, 0.03), c: CHROME, at: [0, 0.29, -1.19] },
    ...[-1, 1].map((k): Piece => ({ g: SPH, c: CHROME, at: [k * 0.36, 0.51, 1.148], s: [0.118, 0.118, 0.034] })),
    // les rétroviseurs, les poignées, les joints de portes
    ...[-1, 1].flatMap((k): Piece[] => [
      { g: rbox(0.12, 0.075, 0.05, 0.025), c: paint, at: [k * 0.6, 0.84, 0.46] },
      { g: rbox(0.016, 0.03, 0.13, 0.008, 1), c: CHROME, at: [k * 0.54, 0.62, -0.06] },
      { g: rbox(0.014, 0.4, 0.014, 0.005, 1), c: DARK, at: [k * 0.536, 0.47, 0.3] },
      { g: rbox(0.014, 0.4, 0.014, 0.005, 1), c: DARK, at: [k * 0.536, 0.47, -0.5] },
    ]),
    // la galerie : deux rails, deux barres, et sur celle de la voiture qui attend un panier de linge bleu avec un drap qui dépasse (un client de la laverie)
    ...[-1, 1].map((k): Piece => ({ g: cyl(0.014, 0.014, 0.96, 8), c: CHROME, at: [k * 0.4, 1.16, -0.22], rot: [HALF, 0, 0] })),
    ...[-0.6, 0.16].map((z): Piece => ({ g: cyl(0.014, 0.014, 0.82, 8), c: CHROME, at: [0, 1.165, z], rot: [0, 0, HALF] })),
    ...(basket ? [
      { g: rbox(0.62, 0.22, 0.5, 0.05), c: 0x8cc8ee, at: [0, 1.29, -0.22] },
      { g: rbox(0.54, 0.03, 0.42, 0.012), c: 0x5aa0d0, at: [0, 1.39, -0.22] },
      { g: SPH, c: 0xf6f8fa, at: [0.04, 1.43, -0.2], s: [0.3, 0.1, 0.22] },
      { g: SPH, c: 0xf6d77a, at: [-0.14, 1.45, -0.12], s: [0.1, 0.06, 0.09] },
    ] as Piece[] : []),
    // les roues : pneu, enjoliveur chromé, et à son centre un écrou sombre
    ...WHEELS.flatMap(([x, z]): Piece[] => [
      { g: cyl(R, R, 0.18, 20), c: TYRE, at: [x, R, z], rot: [0, 0, HALF] },
      { g: cyl(0.125, 0.125, 0.2, 14), c: CHROME, at: [x, R, z], rot: [0, 0, HALF] },
      { g: cyl(0.04, 0.04, 0.215, 8), c: DARK, at: [x, R, z], rot: [0, 0, HALF] },
    ]),
  ]
  return build(body)
}

/** Les optiques : deux phares blanc chaud à l'avant, deux feux rouges à l'arrière, en un seul maillage ; le matériau lumineux ne règle que leur éclat. */
export const carLamps = (): BufferGeometry => build([
  ...[-1, 1].map((k): Piece => ({ g: SPH, c: 0xfff0c8, at: [k * 0.36, 0.51, 1.158], s: [0.09, 0.09, 0.034] })),
  ...[-1, 1].map((k): Piece => ({ g: rbox(0.11, 0.17, 0.04, 0.018), c: 0xff3a30, at: [k * 0.44, 0.5, -1.175] })),
])
