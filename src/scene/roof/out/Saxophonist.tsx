import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'
import { far } from '../../materials'
import { skyFade } from '../../outdoor'
import { Busker, buskerMats } from '../../objects/Busker'
import { Part, SPH, SPH_LO, cyl, orient, rbox, type V3 } from '../../parts'

// Le saxophoniste du toit d'en face : un air doux qui monte dans le soir, de l'autre côté de la rue. Interactif (`sax`) : touché,
// il joue (le son `sax`) et se balance. Sa casquette, son saxophone alto de laiton (col, corps, courbe du bas, pavillon, clés)
// et son étui ouvert posé près de lui.

const FADE = { c: [0, 0] as [number, number], r0: 7.5, r1: 12.5, below: -4.2 }
const f = (color: number, o = {}) => skyFade(far(color, { roughness: 0.5, ...o }), FADE)
const MATS = buskerMats(FADE, { shirt: 0x5b8fb0, pants: 0x3c4466, hair: 0x3a2a28 })
const BRASS = f(0xe6b84a, { roughness: 0.28, clearcoat: 0.7 })
const CAP = f(0x6b5a4c, { roughness: 0.85 })
const CASE = f(0x3a2c30, { roughness: 0.7 })
const LINING = f(0x9a3a4a, { roughness: 0.9 })
const STRAP = f(0x2e2428, { roughness: 0.8 })

/** Le col (fin) et le corps du saxophone : un tube qui descend, fait le coude du bas et remonte vers le pavillon. */
const NECK = new TubeGeometry(new CatmullRomCurve3([[0, 1.5, 0.2], [0, 1.47, 0.32], [0, 1.38, 0.375]].map(([x, y, z]) => new Vector3(x, y, z))), 8, 0.022, 8)
const BODY = new TubeGeometry(
  new CatmullRomCurve3([[0, 1.38, 0.375], [0, 1.1, 0.385], [0, 0.82, 0.385], [0, 0.64, 0.41], [0, 0.58, 0.5], [0, 0.64, 0.6], [0, 0.78, 0.635]].map(([x, y, z]) => new Vector3(x, y, z))),
  28, 0.052, 12,
)
const KEYS: [number, number][] = [[1.27, 0.03], [1.19, 0.03], [1.04, 0.03], [0.94, 0.03], [0.86, 0.03]]

/** Le saxophone, dans le repère du pied du musicien. */
function Sax() {
  const strap = [0, 1.42, -0.02] as V3, hook: V3 = [0, 1.3, 0.37], d: V3 = [hook[0] - strap[0], hook[1] - strap[1], hook[2] - strap[2]]
  return (
    <group>
      <Part geo={NECK} m={BRASS} castShadow={false} />
      <Part geo={BODY} m={BRASS} castShadow={false} />
      {/* l'embouchure, noire, et le pavillon qui s'évase vers le haut */}
      <Part geo={cyl(0.026, 0.02, 0.1, 8)} m={STRAP} p={[0, 1.52, 0.17]} rotation-x={-1.15} castShadow={false} />
      <Part geo={cyl(0.135, 0.06, 0.18, 16)} m={BRASS} p={[0, 0.86, 0.64]} rotation-x={-0.12} castShadow={false} />
      {KEYS.map(([y, dx]) => <Part key={y} geo={SPH_LO} m={BRASS} p={[dx + 0.035, y, 0.385]} scale={0.026} castShadow={false} />)}
      {/* la bretelle, du cou au crochet */}
      <Part geo={cyl(0.012, 0.012, Math.hypot(...d), 6)} m={STRAP} p={[hook[0] / 2, (strap[1] + hook[1]) / 2, (strap[2] + hook[2]) / 2]} rotation={orient(d)} castShadow={false} />
    </group>
  )
}

/** L'étui ouvert, posé sur le bitume : le fond doublé de rouge, le couvercle redressé derrière. `p` : le centre au sol. */
function SaxCase({ p, ry }: { p: V3; ry: number }) {
  return (
    <group position={p} rotation-y={ry}>
      <Part geo={rbox(0.95, 0.1, 0.36, 0.03)} m={CASE} p={[0, 0.05, 0]} castShadow={false} />
      <Part geo={rbox(0.85, 0.02, 0.28, 0.01)} m={LINING} p={[0, 0.105, 0]} castShadow={false} />
      <group position={[0, 0.1, -0.18]} rotation-x={-1.05}>
        <Part geo={rbox(0.95, 0.36, 0.05, 0.02)} m={CASE} p={[0, 0.18, 0]} castShadow={false} />
        <Part geo={rbox(0.85, 0.28, 0.02, 0.01)} m={LINING} p={[0, 0.18, 0.033]} castShadow={false} />
      </group>
      {/* trois pièces dans l'étui */}
      {[[-0.2, 0.05], [0.05, -0.04], [0.28, 0.06]].map(([x, z]) => <Part key={x} geo={cyl(0.035, 0.035, 0.012, 10)} m={BRASS} p={[x, 0.122, z]} castShadow={false} />)}
    </group>
  )
}

/** `at` : les pieds sur le toit (x, y, z). */
export function Saxophonist({ at, ry }: { at: V3; ry: number }) {
  return (
    <>
      <Busker
        id="sax"
        at={at}
        ry={ry}
        mats={MATS}
        hands={[[0.055, 1.14, 0.385], [-0.055, 0.93, 0.385]]}
        head={(
          <>
            <Part geo={SPH} m={CAP} p={[0, 1.77, -0.01]} scale={[0.245, 0.13, 0.245]} castShadow={false} />
            <Part geo={rbox(0.2, 0.025, 0.14, 0.012)} m={CAP} p={[0, 1.68, 0.22]} rotation-x={0.18} castShadow={false} />
          </>
        )}
      >
        <Sax />
      </Busker>
      <SaxCase p={[at[0] + Math.cos(ry) * 0.9 + Math.sin(ry) * 0.5, at[1], at[2] - Math.sin(ry) * 0.9 + Math.cos(ry) * 0.5]} ry={ry + 0.3} />
    </>
  )
}
