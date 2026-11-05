import type { Material } from 'three'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { L } from './materials'

/**
 * Un bidon de lessive liquide : le corps aux angles ronds, l'épaule, le goulot et son bouchon, la poignée moulée à l'arrière, et
 * l'étiquette sur ses deux faces visibles (+x et +z). `w`, `h`, `d` : largeur (x), hauteur, profondeur (z).
 */
export function Jug({ p, ry = 0, body, cap, label, w = 0.12, h = 0.2, d = 0.15 }: { p: V3; ry?: number; body: Material; cap: Material; label: Material; w?: number; h?: number; d?: number }) {
  return (
    <group position={p} rotation-y={ry}>
      <Part geo={rbox(w, h, d, 0.035)} m={body} p={[0, h / 2, 0]} />
      <Part geo={SPH} m={body} scale={[w / 2, 0.035, d / 2]} p={[0, h, 0]} castShadow={false} />
      <Part geo={cyl(0.024, 0.028, 0.04, 14)} m={cap} p={[w * 0.15, h + 0.04, d * 0.2]} castShadow={false} />
      <Part m={cap} p={[-w * 0.1, h - 0.01, -d * 0.3]} rotation-y={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.03, 0.011, 8, 14, Math.PI]} />
      </Part>
      <mesh material={label} position={[w / 2 + 0.002, h * 0.48, 0]} rotation-y={Math.PI / 2} raycast={noRay}>
        <planeGeometry args={[d * 0.8, h * 0.5]} />
      </mesh>
      <mesh material={label} position={[0, h * 0.48, d / 2 + 0.002]} raycast={noRay}>
        <planeGeometry args={[w * 0.8, h * 0.5]} />
      </mesh>
    </group>
  )
}
export const JUG_BLUE = { body: L.bottleBlue, cap: L.capBlue, label: L.labelBlue }
export const JUG_PINK = { body: L.bottlePink, cap: L.capPink, label: L.labelPink }
