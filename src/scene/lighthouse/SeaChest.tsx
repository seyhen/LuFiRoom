import { LatheGeometry, Vector2 } from 'three'
import { TAU } from '../../math'
import { Part, cyl, rbox } from '../parts'
import { L } from './materials'

/** Le coffre de marin : son centre au sol. Le concertina est posé sur son couvercle (voir LighthouseScene). */
export const CHEST = { x: 2.45, z: 0.25, lid: 0.82 }

// Un tonneau : ventre rond, fond et couvercle plus étroits.
const barrel = new LatheGeometry(
  [[0, 0], [0.24, 0], [0.28, 0.1], [0.31, 0.3], [0.32, 0.45], [0.31, 0.6], [0.28, 0.8], [0.25, 0.9], [0, 0.9]].map(([r, y]) => new Vector2(r, y)),
  28,
)

/** Le coffre de marin, son cordage, un tonneau avec une lanterne de tempête, un rouleau de cordage. */
export function SeaChest() {
  return (
    <>
      <group position={[CHEST.x, 0, CHEST.z]} rotation-y={Math.PI / 2}>
        <Part geo={rbox(1.1, 0.5, 0.62, 0.06)} m={L.oakDark} p={[0, 0.27, 0]} />
        <Part geo={cyl(0.31, 0.31, 1.1, 28)} m={L.oakDark} p={[0, 0.52, 0]} rotation-z={Math.PI / 2} />
        {/* les bandes de fer, sur le corps et par-dessus le couvercle */}
        {[-0.4, 0, 0.4].map((x) => (
          <group key={x}>
            <Part geo={rbox(0.07, 0.5, 0.64, 0.02)} m={L.iron} p={[x, 0.27, 0]} castShadow={false} />
            <Part m={L.iron} p={[x, 0.52, 0]} rotation-y={Math.PI / 2} castShadow={false}>
              <torusGeometry args={[0.325, 0.032, 6, 22, Math.PI]} />
            </Part>
          </group>
        ))}
        <Part geo={rbox(0.14, 0.16, 0.04, 0.02)} m={L.brass} p={[0, 0.46, 0.33]} castShadow={false} />
        {/* les poignées de corde, aux deux bouts */}
        {[-1, 1].map((s) => (
          <Part key={s} m={L.rope} p={[s * 0.56, 0.33, 0]} rotation-y={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.09, 0.016, 6, 14]} />
          </Part>
        ))}
      </group>
      {/* le tonneau, dans l'angle du fond, et la lanterne de tempête dessus */}
      <group position={[2.55, 0, -2.35]}>
        <mesh geometry={barrel} material={L.oak} castShadow receiveShadow />
        {[0.12, 0.3, 0.6, 0.78].map((y) => (
          <Part key={y} geo={cyl(0.32 - Math.abs(y - 0.45) * 0.1, 0.32 - Math.abs(y - 0.45) * 0.1, 0.04, 28)} m={L.iron} p={[0, y, 0]} castShadow={false} />
        ))}
        <group position={[0, 0.9, 0]}>
          <Part geo={cyl(0.1, 0.11, 0.03, 14)} m={L.iron} p={[0, 0.015, 0]} />
          <Part geo={cyl(0.075, 0.075, 0.22, 14)} m={L.glassWarm} p={[0, 0.14, 0]} castShadow={false} />
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * TAU + 0.4
            return <Part key={i} geo={cyl(0.007, 0.007, 0.24, 4)} m={L.iron} p={[Math.cos(a) * 0.08, 0.14, Math.sin(a) * 0.08]} castShadow={false} />
          })}
          <Part geo={cyl(0.09, 0.1, 0.03, 14)} m={L.iron} p={[0, 0.27, 0]} castShadow={false} />
          <Part m={L.iron} p={[0, 0.3, 0]} castShadow={false}>
            <torusGeometry args={[0.07, 0.01, 6, 14, Math.PI]} />
          </Part>
        </group>
      </group>
      {/* un rouleau de cordage de manille */}
      <group position={[1.75, 0, -2.45]} rotation-y={0.5}>
        {[0, 1, 2].map((i) => (
          <Part key={i} m={L.rope} p={[0, 0.045 + i * 0.065, 0]} rotation-x={Math.PI / 2} castShadow={i === 0}>
            <torusGeometry args={[0.2 - i * 0.025, 0.04, 8, 28]} />
          </Part>
        ))}
        <Part geo={cyl(0.012, 0.012, 0.3, 6)} m={L.rope} p={[0.2, 0.04, 0.3]} rotation-z={Math.PI / 2} rotation-y={0.9} castShadow={false} />
      </group>
    </>
  )
}
