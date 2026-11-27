import { useEffect, useMemo } from 'react'
import { BufferAttribute, CatmullRomCurve3, PlaneGeometry, TubeGeometry, Vector3 } from 'three'
import { blob, cone, ell, pair, type Blob } from '../../blob'
import { skin } from '../../materials'
import { Part, SPH_LO, cyl, rbox, type V3 } from '../../parts'
import { Static } from '../../Static'
import { O } from './materials'
import { groundY } from './ground'

const TAN = 0xc9a070, TAN_D = 0xb08a58, BELLY = 0xdcbc8e, LIP = 0xb87a6a, EYE = 0x22150c, CALLUS = 0x8a6a46

// Le dromadaire accroupi : la forme d'une seule peau (un corps couché, une bosse, un long cou en S, une tête fine au museau tombant, les pattes
// repliées sous le ventre). Repère : x vers l'avant (la tête), y en haut, z sur le côté.
const BODY: Blob[] = [
  ell([0, 0.52, 0], [0.92, 0.4, 0.42], { color: TAN, k: 0.1 }),
  ell([-0.78, 0.52, 0], [0.34, 0.38, 0.37], { color: TAN, k: 0.1 }),
  ell([0.0, 0.3, 0], [0.85, 0.26, 0.4], { color: BELLY, k: 0.1 }),
  ell([-0.04, 0.98, 0], [0.38, 0.3, 0.28], { color: TAN_D, k: 0.1 }),
  ell([0.76, 0.66, 0], [0.34, 0.44, 0.34], { color: TAN, k: 0.1 }),
  // le cou : trois cônes qui montent en S, et la tête
  cone([0.86, 0.78, 0], [1.12, 1.18, 0], 0.23, 0.16, { color: TAN, k: 0.1 }),
  // le cou se penche en avant (un S souple, la tête reposée plus bas) : plus de périscope
  cone([1.12, 1.18, 0], [1.28, 1.5, 0], 0.16, 0.125, { color: TAN, k: 0.08 }),
  cone([1.28, 1.5, 0], [1.48, 1.66, 0], 0.125, 0.115, { color: TAN, k: 0.06 }),
  ell([1.62, 1.68, 0], [0.2, 0.125, 0.105], { rot: [0, 0, -0.32], color: TAN, k: 0.05 }),
  ell([1.8, 1.6, 0], [0.13, 0.09, 0.085], { rot: [0, 0, -0.4], color: TAN, k: 0.04 }),
  ell([1.86, 1.52, 0], [0.095, 0.04, 0.07], { color: LIP, k: 0.03 }),
  ...pair(ell([1.64, 1.74, 0.1], [0.032, 0.03, 0.02], { color: EYE, k: 0.01 }), 'z'),
  ...pair(cone([1.5, 1.76, 0.07], [1.44, 1.87, 0.09], 0.036, 0.022, { color: TAN_D, k: 0.03 }), 'z'),
  // les pattes repliées : l'avant-bras couché sous la poitrine, le jarret couché sous la croupe, les callosités
  ...pair(cone([0.55, 0.14, 0.3], [1.12, 0.13, 0.28], 0.11, 0.085, { color: TAN_D, k: 0.06 }), 'z'),
  ...pair(cone([-0.6, 0.17, 0.3], [-0.05, 0.14, 0.3], 0.15, 0.1, { color: TAN_D, k: 0.06 }), 'z'),
  ell([0.85, 0.1, 0], [0.18, 0.07, 0.24], { color: CALLUS, k: 0.04 }),
  cone([-1.08, 0.7, 0], [-1.22, 0.18, 0], 0.05, 0.03, { color: TAN_D, k: 0.03 }),
]


// Les ellipsoïdes du dos (centre, rayons) : la croupe, le corps, la bosse. La couverture les épouse à 8 cm (la peau du blob gonfle un peu au sommet de la bosse).
const BACK_E: [number, number, number, number, number, number][] = [[0, 0.52, 0.92, 0.4, 0.42, 0], [-0.78, 0.52, 0.34, 0.38, 0.37, 0], [-0.04, 0.98, 0.38, 0.3, 0.28, 0]]
const COVER = 0.08
/** La hauteur du dos en (x, z) : le plus haut des trois volumes, ou -1 hors du dos. */
const backY = (x: number, z: number) => BACK_E.reduce((m, [cx, cy, rx, ry, rz]) => {
  const q = 1 - ((x - cx) / rx) ** 2 - (z / rz) ** 2
  return q > 0 ? Math.max(m, cy + ry * Math.sqrt(q)) : m
}, -1)
/** Le demi-écart du dos à la hauteur y (en z). */
const backZ = (x: number, y: number) => BACK_E.reduce((m, [cx, cy, rx, ry, rz]) => {
  const q = 1 - ((x - cx) / rx) ** 2 - ((y - cy) / ry) ** 2
  return q > 0 ? Math.max(m, rz * Math.sqrt(q)) : m
}, 0)
const BANDS = [0x2a417d, 0xe8d6a8, 0xb5532c, 0xb5532c, 0xb5532c, 0xe8d6a8, 0x2a417d, 0xe8d6a8, 0xb5532c, 0xb5532c, 0xb5532c, 0xe8d6a8]

/**
 * Une couverture drapée sur le bât : une étoffe qui suit la bosse et le dos (elle les épouse à 8 cm), retombe de chaque côté jusqu'à un
 * ourlet à 0,6, et dont les rayures (terre cuite, crème, indigo) courent en travers. Un plan déformé, pas des boîtes : le bloc orange
 * du premier jet se lisait comme un cube posé sur la bosse. Repère du dromadaire (x devant, y haut) ; 2 600 triangles.
 */
function drape() {
  const NX = 36, NV = 36, X0 = -0.6, X1 = 0.42, HEM = 0.6
  const g = new PlaneGeometry(1, 1, NX, NV), p = g.attributes.position, col = new Float32Array(p.count * 3)
  for (let ix = 0; ix <= NX; ix++) {
    const u = ix / NX, x = X0 + (X1 - X0) * u
    // les bords : plus bas aux deux bouts (l'étoffe tombe sur la croupe et le garrot)
    let ze = 0
    while (ze < 0.6 && backY(x, ze + 0.005) + COVER >= 0.78) ze += 0.005
    const ye = backY(x, ze) + COVER
    const hem = Math.min(HEM + 0.26 * Math.pow(Math.abs(u - 0.5) * 2, 2), ye - 0.06)
    for (let iy = 0; iy <= NV; iy++) {
      const v = iy / NV, side = v < 0.5 ? -1 : 1, t = Math.abs(v - 0.5) * 2 // 0 au sommet, 1 à l'ourlet
      let y: number, z: number
      if (t < 0.7) { z = side * ze * (t / 0.7); y = backY(x, z) + COVER; if (y < 0) y = ye }
      else {
        const k = (t - 0.7) / 0.3
        y = ye + (hem - ye) * k
        z = side * Math.max(ze, backZ(x, y) + COVER + 0.01) + side * 0.012 * Math.sin(u * 40 + k * 3)
      }
      const i = iy * (NX + 1) + ix
      p.setXYZ(i, x, y, z)
      const c = BANDS[Math.min(BANDS.length - 1, Math.floor(u * BANDS.length))]
      const trim = t > 0.93 ? 0x2a417d : c
      col[i * 3] = ((trim >> 16) & 255) / 255; col[i * 3 + 1] = ((trim >> 8) & 255) / 255; col[i * 3 + 2] = (trim & 255) / 255
    }
  }
  g.setAttribute('color', new BufferAttribute(col, 3))
  g.computeVertexNormals()
  return g
}

/**
 * Le dromadaire accroupi au bord du campement, le bât (une couverture rayée, deux sacoches) sur sa bosse : une seule peau de blob, le
 * museau, l'œil, les oreilles, les callosités. `at` est le sol (x, z), `ry` le cap de la tête.
 */
export function KneelingCamel({ at, ry }: { at: [number, number]; ry: number }) {
  const geo = useMemo(() => blob(BODY, { h: 0.04, k: 0.08 }), [])
  const skinMat = useMemo(() => skin({ roughness: 0.9, clearcoat: 0 }), [])
  const cover = useMemo(() => drape(), [])
  useEffect(() => () => cover.dispose(), [cover])
  // la longe : du licol, elle tombe en courbe jusqu'au sable et y traîne (droite et arrêtée en l'air sur un nœud, elle faisait sucette)
  const lead = useMemo(() => new TubeGeometry(new CatmullRomCurve3([
    new Vector3(1.9, 1.55, 0.03), new Vector3(1.97, 0.9, 0.07), new Vector3(2.02, 0.2, 0.16), new Vector3(1.95, 0.025, 0.36), new Vector3(1.7, 0.025, 0.5),
  ]), 24, 0.013, 5, false), [])
  useEffect(() => () => lead.dispose(), [lead])
  const [x, z] = at, y = groundY(x, z)
  const p: V3 = [x, y - 0.02, z]
  return (
    <group position={p} rotation-y={ry} scale={0.8}>
      <Static>
        <mesh geometry={geo} material={skinMat} castShadow receiveShadow />
        {/* la couverture rayée drapée sur la bosse et le dos, et deux sacoches de cuir qui pendent de chaque côté */}
        <mesh geometry={cover} material={O.cloth} castShadow />
        {[-1, 1].map((s) => (
          <group key={s} position={[-0.1, 0.5, s * 0.5]} rotation-x={s * 0.1}>
            <Part geo={rbox(0.34, 0.3, 0.1, 0.045)} m={O.saddle} castShadow={false} />
            <Part geo={rbox(0.3, 0.07, 0.108, 0.025)} m={O.blanketIndigo} p={[0, 0.1, 0]} castShadow={false} />
            <Part geo={rbox(0.05, 0.05, 0.012, 0.01)} m={O.rope} p={[0, 0.04, s * 0.056]} castShadow={false} />
          </group>
        ))}
        <Part geo={cyl(0.31, 0.31, 0.06, 14)} m={O.rope} p={[0.4, 0.82, 0]} rotation-z={-0.1} castShadow={false} />
        {/* la longe qui pend du licol, posée sur le sable */}
        <mesh geometry={lead} material={O.rope} />
        <Part geo={SPH_LO} m={O.rope} scale={0.03} p={[1.7, 0.03, 0.5]} castShadow={false} />
      </Static>
    </group>
  )
}

/** Un dromadaire de loin (une caravane sur une crête) : un corps, la bosse, le cou et la tête, quatre pattes droites. Trois volumes de base, rien de plus. */
export function FarCamel({ p, ry = 0, s = 1 }: { p: V3; ry?: number; s?: number }) {
  return (
    <group position={p} rotation-y={ry} scale={s}>
      <Part geo={SPH_LO} m={O.camelFar} scale={[0.85, 0.36, 0.34]} p={[0, 1.35, 0]} castShadow={false} />
      <Part geo={SPH_LO} m={O.camelFar} scale={[0.26, 0.32, 0.24]} p={[-0.1, 1.72, 0]} castShadow={false} />
      <Part geo={cyl(0.1, 0.17, 0.85, 7)} m={O.camelFar} p={[0.95, 1.8, 0]} rotation-z={-0.35} castShadow={false} />
      <Part geo={SPH_LO} m={O.camelFar} scale={[0.22, 0.11, 0.1]} p={[1.28, 2.2, 0]} rotation-z={-0.25} castShadow={false} />
      {[[0.6, 0.2], [0.6, -0.2], [-0.6, 0.2], [-0.6, -0.2]].map(([x, z], i) => <Part key={i} geo={cyl(0.07, 0.05, 1.1, 6)} m={O.camelFar} p={[x, 0.55, z]} castShadow={false} />)}
    </group>
  )
}
