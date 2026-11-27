import { ExtrudeGeometry, Shape } from 'three'
import { Part, SPH, cyl, rbox, worldUV, type V3 } from '../parts'
import { Static } from '../Static'
import { D } from './materials'

/** Le grand tapis (3,2 × 2,4) et le petit tapis de prière (0,95 × 1,4), à plat sur le sable : la frange est découpée par la transparence. */
export function Rugs() {
  return (
    <>
      <mesh material={D.rugBig} position={[-1.0, 0.012, 0.5]} rotation-x={-Math.PI / 2} receiveShadow raycast={() => {}}>
        <planeGeometry args={[3.2, 2.4]} />
      </mesh>
      <mesh material={D.rugSmall} position={[1.25, 0.012, 2.2]} rotation={[-Math.PI / 2, 0, -0.3]} receiveShadow raycast={() => {}}>
        <planeGeometry args={[0.95, 1.42]} />
      </mesh>
    </>
  )
}

/** Un coussin de sol carré : le corps rembourré, une couture au milieu des quatre côtés (le biais), quatre glands aux coins. */
export function Cushion({ position, ry = 0, s = 0.62, m = D.cushionA, tilt = 0 }: { position: V3; ry?: number; s?: number; m?: typeof D.cushionA; tilt?: number }) {
  return (
    <group position={position} rotation={[tilt, ry, 0]}>
      <Part geo={worldUV(rbox(s, 0.13, s, 0.06), 0.7)} m={m} p={[0, 0.065, 0]} />
      <Part geo={SPH} m={m} scale={[s * 0.36, 0.05, s * 0.36]} p={[0, 0.125, 0]} castShadow={false} />
      {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
        <group key={`${x}${z}`} position={[x * s * 0.5, 0.045, z * s * 0.5]}>
          <Part geo={SPH} m={D.tassel} scale={0.028} castShadow={false} />
          <Part m={D.tassel} p={[x * 0.012, -0.04, z * 0.012]} rotation-x={Math.PI} castShadow={false}><coneGeometry args={[0.026, 0.06, 8]} /></Part>
        </group>
      )))}
    </group>
  )
}

/** Un traversin : un long cylindre d'étoffe, deux fonds de couleur, deux ligatures, couché sur le sol. */
export function Bolster({ position, ry = 0 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <Part geo={cyl(0.1, 0.1, 0.62, 18)} m={D.cushionB} p={[0, 0.1, 0]} rotation-z={Math.PI / 2} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Part geo={cyl(0.1, 0.1, 0.012, 18)} m={D.cushionPlain} p={[s * 0.315, 0.1, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          <Part geo={cyl(0.103, 0.103, 0.03, 18)} m={D.tassel} p={[s * 0.27, 0.1, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        </group>
      ))}
    </group>
  )
}

/** Le pouf de cuir : un cylindre rond au dessus bombé, deux coutures en anneau, un bandeau crème piqué, un liseré au pied. */
export function Pouf({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Static>
        <Part geo={cyl(0.27, 0.285, 0.1, 28)} m={D.leatherDark} p={[0, 0.05, 0]} />
        <Part geo={cyl(0.27, 0.27, 0.15, 28)} m={D.leather} p={[0, 0.17, 0]} />
        <Part geo={cyl(0.274, 0.274, 0.035, 28)} m={D.leatherCream} p={[0, 0.17, 0]} castShadow={false} />
        <Part geo={SPH} m={D.leather} scale={[0.27, 0.08, 0.27]} p={[0, 0.245, 0]} />
        {[0.12, 0.2].map((r) => <Part key={r} m={D.leatherDark} p={[0, 0.318 - (r - 0.12) * 0.7, 0]} rotation-x={Math.PI / 2} castShadow={false}><torusGeometry args={[r, 0.005, 6, 28]} /></Part>)}
        <Part geo={SPH} m={D.leatherDark} scale={0.022} p={[0, 0.327, 0]} castShadow={false} />
      </Static>
    </group>
  )
}

// La silhouette d'une babouche vue de dessus : talon rond, flanc cambré, bout pointu qui se relève (x : de l'arrière à la pointe, y : en travers).
const SLIPPER = (() => {
  const s = new Shape()
  s.moveTo(-0.15, 0)
  s.bezierCurveTo(-0.15, 0.06, -0.08, 0.075, 0, 0.07)
  s.bezierCurveTo(0.08, 0.065, 0.14, 0.05, 0.22, 0.012)
  s.lineTo(0.235, 0)
  s.lineTo(0.22, -0.012)
  s.bezierCurveTo(0.14, -0.05, 0.08, -0.065, 0, -0.07)
  s.bezierCurveTo(-0.08, -0.075, -0.15, -0.06, -0.15, 0)
  const g = new ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 10 })
  g.rotateX(-Math.PI / 2)
  return g
})()

/** Une paire de babouches de cuir orange à la pointe relevée, posées sur le bord du tapis : la semelle sombre, l'empeigne, la semelle intérieure, le talon écrasé. */
export function Slippers({ position, ry = 0 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <Static>
        {[-0.095, 0.095].map((z, i) => (
          <group key={z} position={[0, 0, z]} rotation-y={i ? -0.12 : 0.1}>
            <mesh geometry={SLIPPER} material={D.leatherDark} position={[0, 0, 0]} castShadow receiveShadow />
            {/* la semelle intérieure crème qu'on voit par l'ouverture, l'empeigne qui couvre l'avant, le talon écrasé à plat (une boule
                d'empeigne, une boule de talon et un point crème dessus se lisaient comme des petits pains) */}
            <Part geo={SPH} m={D.leatherCream} scale={[0.12, 0.008, 0.055]} p={[-0.04, 0.066, 0]} castShadow={false} />
            <Part geo={SPH} m={D.leather} scale={[0.12, 0.045, 0.068]} p={[0.09, 0.064, 0]} castShadow={false} />
            <Part geo={SPH} m={D.leather} scale={[0.05, 0.014, 0.062]} p={[-0.125, 0.072, 0]} castShadow={false} />
            <Part m={D.leather} p={[0.22, 0.06, 0]} castShadow={false}><coneGeometry args={[0.02, 0.06, 7]} /></Part>
          </group>
        ))}
      </Static>
    </group>
  )
}
