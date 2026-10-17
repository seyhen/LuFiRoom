import type { Material } from 'three'
import { TAU } from '../../math'
import { Part, SPH, cyl, orient, rbox, type V3 } from '../parts'
import { K } from './materials'

/** Un tube entre deux points (du cadre, de la fourche, du porte-bagages). */
function Tube({ a, b, r = 0.016, m = K.teal }: { a: V3; b: V3; r?: number; m?: Material }) {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], len = Math.hypot(...d)
  return <Part geo={cyl(r, r, len, 8)} m={m} p={[a[0] + d[0] / 2, a[1] + d[1] / 2, a[2] + d[2] / 2]} rotation={orient(d)} castShadow={false} />
}

/** Une roue de vélo : pneu, jante, seize rayons croisés, moyeu, garde-boue au-dessus. Plan (y, z), l'axe suit x. */
function Wheel({ z }: { z: number }) {
  return (
    <group position={[0, 0.38, z]}>
      <Part m={K.tire} rotation-y={Math.PI / 2}>
        <torusGeometry args={[0.37, 0.026, 8, 32]} />
      </Part>
      <Part m={K.steel} rotation-y={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.34, 0.008, 6, 32]} />
      </Part>
      {Array.from({ length: 8 }, (_, i) => (
        <Part key={i} geo={cyl(0.0035, 0.0035, 0.68, 4)} m={K.steel} rotation-x={(i / 8) * Math.PI} castShadow={false} />
      ))}
      <Part geo={cyl(0.03, 0.03, 0.07, 10)} m={K.steel} rotation-z={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.012, 0.012, 0.12, 6)} m={K.steelDark} rotation-z={Math.PI / 2} castShadow={false} />
      {/* le garde-boue : un arc de gouttière au-dessus de la roue */}
      <Part m={K.teal} p={[0, 0, 0]} rotation-y={Math.PI / 2} rotation-z={Math.PI / 2 - 0.9} castShadow={false}>
        <torusGeometry args={[0.415, 0.02, 4, 22, 1.8]} />
      </Part>
    </group>
  )
}

/**
 * Un vélo de ville qui dort contre le mur de l'izakaya : cadre en losange vert sarcelle, deux roues à rayons et garde-boue, selle de
 * cuir, pédalier, dynamo-lampe et sonnette de laiton, porte-bagages, et à l'avant un panier de fil de fer d'où dépassent un sac kraft,
 * une baguette et deux poireaux. Un parapluie rouge, plié, pend au guidon.
 */
export function Bicycle({ position }: { position: V3 }) {
  const R: V3 = [0, 0.38, -0.55], F: V3 = [0, 0.38, 0.55], BB: V3 = [0, 0.32, -0.08], S: V3 = [0, 0.93, -0.3], H: V3 = [0, 0.98, 0.42], Hb: V3 = [0, 0.78, 0.46]
  return (
    <group position={position} rotation-z={-0.1}>
      <Wheel z={-0.55} />
      <Wheel z={0.55} />
      {/* le cadre en losange, la fourche, la tige de selle */}
      <Tube a={BB} b={R} />
      <Tube a={BB} b={S} />
      <Tube a={S} b={R} r={0.012} />
      <Tube a={BB} b={Hb} r={0.02} />
      <Tube a={S} b={H} />
      <Tube a={Hb} b={H} r={0.02} />
      <Tube a={Hb} b={F} r={0.013} m={K.steel} />
      <Tube a={[0, 0.93, -0.3]} b={[0, 1.04, -0.32]} r={0.012} m={K.steel} />
      {/* la selle de cuir et le pédalier */}
      <Part geo={SPH} m={K.woodDark} scale={[0.065, 0.028, 0.095]} p={[0, 1.07, -0.34]} />
      <Part geo={SPH} m={K.woodDark} scale={[0.035, 0.022, 0.05]} p={[0, 1.066, -0.24]} castShadow={false} />
      <Part geo={cyl(0.07, 0.07, 0.015, 14)} m={K.steel} p={[-0.045, 0.32, -0.08]} rotation-z={Math.PI / 2} castShadow={false} />
      <Tube a={[-0.05, 0.32, -0.08]} b={[-0.05, 0.22, -0.02]} r={0.01} m={K.steelDark} />
      <Part geo={rbox(0.1, 0.02, 0.05, 0.008)} m={K.iron} p={[-0.1, 0.22, -0.02]} castShadow={false} />
      <Part geo={cyl(0.008, 0.008, 0.28, 5)} m={K.steelDark} p={[0.05, 0.2, -0.3]} rotation-x={0.35} castShadow={false} />
      {/* le guidon : potence, barre, poignées, levier, sonnette, lampe */}
      <Tube a={H} b={[0, 1.07, 0.44]} r={0.012} m={K.steel} />
      <Part geo={cyl(0.011, 0.011, 0.5, 8)} m={K.steel} p={[0, 1.07, 0.46]} rotation-z={Math.PI / 2} castShadow={false} />
      {[-1, 1].map((s) => (
        <Part key={s} geo={cyl(0.017, 0.017, 0.1, 8)} m={K.iron} p={[s * 0.24, 1.07, 0.46]} rotation-z={Math.PI / 2} castShadow={false} />
      ))}
      <Part geo={SPH} m={K.brass} scale={[0.03, 0.022, 0.03]} p={[0.08, 1.1, 0.46]} castShadow={false} />
      <Part geo={cyl(0.04, 0.05, 0.08, 14)} m={K.brass} p={[0, 0.86, 0.6]} rotation-x={Math.PI / 2} />
      <Part geo={cyl(0.034, 0.034, 0.01, 14)} m={K.yellow} p={[0, 0.86, 0.645]} rotation-x={Math.PI / 2} castShadow={false} />
      {/* le porte-bagages arrière et sa sangle */}
      <Part geo={rbox(0.16, 0.015, 0.3, 0.006)} m={K.steelDark} p={[0, 0.84, -0.6]} castShadow={false} />
      <Tube a={[0.06, 0.84, -0.6]} b={[0.06, 0.4, -0.55]} r={0.006} m={K.steelDark} />
      <Part geo={rbox(0.14, 0.04, 0.32, 0.01)} m={K.red} p={[0, 0.865, -0.6]} castShadow={false} />
      {/* le panier de fil : fond, vingt fils, deux cerclages */}
      <group position={[0, 0.92, 0.7]} rotation-x={-0.08}>
        <Part geo={cyl(0.15, 0.13, 0.012, 16)} m={K.steelDark} p={[0, -0.1, 0]} castShadow={false} />
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * TAU
          return <Part key={i} geo={cyl(0.004, 0.004, 0.22, 4)} m={K.steelDark} p={[Math.cos(a) * 0.145, 0.0, Math.sin(a) * 0.145]} castShadow={false} />
        })}
        {[0.1, -0.02].map((y) => (
          <Part key={y} m={K.steelDark} p={[0, y, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.15 - (y < 0 ? 0.004 : 0), 0.006, 5, 20]} />
          </Part>
        ))}
        {/* le sac kraft aux anses de papier, une baguette, deux poireaux */}
        <Part geo={rbox(0.2, 0.2, 0.15, 0.03)} m={K.kraft} p={[0, 0.02, 0.0]} />
        <Part geo={rbox(0.2, 0.03, 0.04, 0.012)} m={K.kraft} p={[0, 0.13, 0.04]} rotation-x={0.4} castShadow={false} />
        <Part m={K.steelDark} p={[0, 0.08, 0.08]} castShadow={false}>
          <torusGeometry args={[0.04, 0.005, 5, 12, Math.PI]} />
        </Part>
        <Part geo={cyl(0.026, 0.026, 0.46, 10)} m={K.baguette} p={[0.07, 0.2, -0.02]} rotation={[0.1, 0, -0.2]} />
        {[0, 1, 2, 3].map((i) => (
          <Part key={i} geo={SPH} m={K.kraft} scale={[0.012, 0.03, 0.012]} p={[0.045 + i * 0.016, 0.28 + i * 0.002, -0.025]} rotation-z={-0.2} castShadow={false} />
        ))}
        {[-1, 1].map((s) => (
          <group key={s} position={[-0.06 + s * 0.04, 0.12, 0.0]} rotation={[0.05, 0, s * 0.12]}>
            <Part geo={cyl(0.022, 0.024, 0.2, 8)} m={K.leekWhite} p={[0, 0.1, 0]} castShadow={false} />
            <Part geo={cyl(0.03, 0.022, 0.22, 8)} m={K.scallion} p={[0, 0.29, 0]} castShadow={false} />
            <Part geo={SPH} m={K.scallion} scale={[0.034, 0.05, 0.016]} p={[0, 0.43, 0]} castShadow={false} />
          </group>
        ))}
      </group>
      {/* le parapluie rouge, plié, accroché au guidon par sa poignée en canne */}
      <group position={[0.18, 1.07, 0.46]}>
        <Part m={K.woodDark} p={[0, 0, 0]} rotation-y={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.032, 0.008, 5, 12, Math.PI]} />
        </Part>
        <Part geo={cyl(0.008, 0.008, 0.52, 6)} m={K.steelDark} p={[0.032, -0.26, 0]} castShadow={false} />
        <Part geo={cyl(0.058, 0.014, 0.34, 10)} m={K.red} p={[0.032, -0.4, 0]} />
        <Part geo={cyl(0.016, 0.016, 0.1, 8)} m={K.steelDark} p={[0.032, -0.62, 0]} castShadow={false} />
        <Part m={K.cream} p={[0.032, -0.3, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.05, 0.007, 5, 14]} />
        </Part>
      </group>
      {/* la béquille */}
      <Tube a={[0, 0.32, -0.3]} b={[0.1, 0.0, -0.22]} r={0.007} m={K.steelDark} />
    </group>
  )
}
