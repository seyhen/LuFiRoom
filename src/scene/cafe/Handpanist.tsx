import { far } from '../materials'
import { skyFade } from '../outdoor'
import { Busker, buskerMats } from '../objects/Busker'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { SW } from './streetKit'

// Le joueur de handpan du trottoir de devant, sous la pluie d'Édimbourg : bonnet de laine, veste verte, son handpan sur un pied
// de fer, son étui ouvert à côté. Interactif (`handpan`) : touché, il joue (le son `handpan`) et se balance doucement.

const FADE = { c: [0, 0] as [number, number], r0: 7.5, r1: 12.5 }
const f = (color: number, o = {}) => skyFade(far(color, { roughness: 0.5, ...o }), FADE)
const MATS = buskerMats(FADE, { shirt: 0x4a6a58, pants: 0x3a3f58, hair: 0x6a4a34 })
const STEEL = f(0x9aa0aa, { roughness: 0.3, clearcoat: 0.7, metalness: 0.3 })
const DIMPLE = f(0x5c626c, { roughness: 0.4, clearcoat: 0.5, metalness: 0.3 })
const IRON = f(0x2a2a30, { roughness: 0.5 })
const WOOL = f(0x8e3a46, { roughness: 0.9 })
const WOOL_LIGHT = f(0xe8ddc8, { roughness: 0.9 })
const CASE = f(0x3a2c30, { roughness: 0.7 })
const LINING = f(0x9a3a4a, { roughness: 0.9 })
const COIN = f(0xd8b45a, { roughness: 0.3, metalness: 0.4 })

const PAN_Y = 0.78, PAN_Z = 0.44

/** Le handpan : la coque en lentille, le « ding » creusé au milieu, sept champs de notes en couronne ; son pied de fer à trois branches. */
function Handpan() {
  return (
    <group position={[0, PAN_Y, PAN_Z]}>
      {/* la coque un peu plus grande et penchée vers le joueur, pour qu'on lise un handpan et non un tabouret */}
      <group rotation-x={0.3} scale={1.15}>
      <Part geo={SPH} m={STEEL} scale={[0.29, 0.095, 0.29]} castShadow={false} />
      <Part geo={SPH} m={DIMPLE} p={[0, 0.082, 0]} scale={[0.075, 0.018, 0.075]} castShadow={false} />
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 + 0.3
        return <Part key={i} geo={SPH} m={DIMPLE} p={[Math.cos(a) * 0.16, 0.063, Math.sin(a) * 0.16]} scale={[0.05, 0.014, 0.04]} rotation-y={-a} castShadow={false} />
      })}
      </group>
      <Part geo={cyl(0.02, 0.02, PAN_Y - 0.08, 8)} m={IRON} p={[0, -0.09 - (PAN_Y - 0.08) / 2 + 0.01, 0]} castShadow={false} />
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.5
        return <Part key={i} geo={rbox(0.3, 0.035, 0.04, 0.012)} m={IRON} p={[Math.cos(a) * 0.14, -PAN_Y + 0.02, Math.sin(a) * 0.14]} rotation-y={-a} castShadow={false} />
      })}
    </group>
  )
}

/** L'étui ouvert posé sur le trottoir, avec quelques pièces. `p` : le centre au sol, dans le repère du joueur. */
function OpenCase({ p }: { p: V3 }) {
  return (
    <group position={p} rotation-y={-0.3}>
      <Part geo={rbox(0.62, 0.1, 0.42, 0.03)} m={CASE} p={[0, 0.05, 0]} castShadow={false} />
      <Part geo={rbox(0.54, 0.02, 0.34, 0.01)} m={LINING} p={[0, 0.105, 0]} castShadow={false} />
      <group position={[0, 0.1, -0.21]} rotation-x={-1.05}>
        <Part geo={rbox(0.62, 0.3, 0.05, 0.02)} m={CASE} p={[0, 0.15, 0]} castShadow={false} />
      </group>
      {[[-0.14, 0.03], [0.04, -0.06], [0.16, 0.07]].map(([x, z]) => <Part key={x} geo={cyl(0.03, 0.03, 0.012, 10)} m={COIN} p={[x, 0.122, z]} castShadow={false} />)}
    </group>
  )
}

/** `at` : les pieds sur le trottoir (x, z) ; `ry` : l'orientation (π/4 : de face à la caméra). */
export function Handpanist({ at, ry }: { at: [number, number]; ry: number }) {
  return (
    <Busker
      id="handpan"
      at={[at[0], SW, at[1]]}
      ry={ry}
      mats={MATS}
      hands={[[0.13, 0.92, PAN_Z], [-0.13, 0.92, PAN_Z + 0.02]]}
      head={(
        <>
          <Part geo={SPH} m={WOOL} p={[0, 1.74, -0.02]} scale={[0.245, 0.15, 0.245]} castShadow={false} />
          <Part geo={cyl(0.235, 0.235, 0.05, 16)} m={WOOL_LIGHT} p={[0, 1.66, -0.02]} castShadow={false} />
          <Part geo={SPH} m={WOOL_LIGHT} p={[0, 1.9, -0.02]} scale={0.055} castShadow={false} />
        </>
      )}
    >
      <Handpan />
      <OpenCase p={[0.75, 0, 0.55]} />
    </Busker>
  )
}
