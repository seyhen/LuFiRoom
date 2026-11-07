import { TAU } from '../../../math'
import { Part, SPH, cyl, rbox, type V3 } from '../../parts'
import { O } from './materials'

/**
 * Ce qui fait un toit de New York : les châteaux d'eau de bois sur pieds d'acier qui coiffent presque chaque immeuble, et la
 * cheminée de vapeur rayée orange et blanc du réseau de chauffage urbain, qui fume jour et nuit.
 */

/** Un château d'eau de bois : douves à cerceaux de fer, toit conique, quatre pieds croisés, échelle. `p` est le sol du toit. */
export function WoodTank({ p, s = 1 }: { p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      {[0, 1, 2, 3].map((i) => {
        const a = Math.PI / 4 + (i / 4) * TAU
        return <Part key={i} geo={cyl(0.03, 0.035, 0.9, 8)} m={O.steel} p={[Math.cos(a) * 0.46, 0.45, Math.sin(a) * 0.46]} castShadow={false} />
      })}
      <Part geo={rbox(1.1, 0.06, 1.1, 0.02)} m={O.steel} p={[0, 0.93, 0]} castShadow={false} />
      <Part geo={cyl(0.58, 0.6, 1.2, 24)} m={O.wood} p={[0, 1.56, 0]} castShadow={false} />
      {[0.1, 0.4, 0.8, 1.1].map((y) => <Part key={y} geo={cyl(0.605, 0.605, 0.035, 24)} m={O.steel} p={[0, 0.96 + y, 0]} castShadow={false} />)}
      <Part m={O.wood} p={[0, 2.4, 0]} castShadow={false}>
        <coneGeometry args={[0.68, 0.42, 24]} />
      </Part>
      <Part geo={cyl(0.03, 0.03, 0.14, 6)} m={O.steel} p={[0, 2.68, 0]} castShadow={false} />
      <Part geo={rbox(0.04, 0.8, 0.04, 0.01)} m={O.steel} p={[0.6, 1.3, 0.2]} castShadow={false} />
      <Part geo={rbox(0.04, 0.8, 0.04, 0.01)} m={O.steel} p={[0.6, 1.3, 0.38]} castShadow={false} />
    </group>
  )
}

/** La cheminée de vapeur du chauffage urbain : fût rayé orange et blanc, évasé en haut, deux haubans. `p` est le sol du toit. */
export function SteamStack({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Part geo={cyl(0.28, 0.3, 0.2, 14)} m={O.metalDark} p={[0, 0.1, 0]} castShadow={false} />
      {[0, 1, 2, 3, 4, 5].map((i) => <Part key={i} geo={cyl(0.19, 0.2, 0.3, 14)} m={i % 2 ? O.coping : O.rust} p={[0, 0.35 + i * 0.3, 0]} castShadow={false} />)}
      <Part geo={cyl(0.27, 0.19, 0.2, 14)} m={O.coping} p={[0, 2.25, 0]} castShadow={false} />
      <Part geo={cyl(0.28, 0.28, 0.04, 14)} m={O.metalDark} p={[0, 2.37, 0]} castShadow={false} />
      <Part geo={SPH} m={O.metalDark} scale={[0.22, 0.04, 0.22]} p={[0, 2.38, 0]} castShadow={false} />
    </group>
  )
}
