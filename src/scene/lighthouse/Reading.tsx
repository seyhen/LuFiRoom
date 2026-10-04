import { TAU } from '../../math'
import { Part, SPH, cyl, rbox } from '../parts'
import { Steam } from '../objects/Steam'
import { L } from './materials'

/** Le tapis rond de cordage, au milieu de la pièce. */
export const RUG = { x: 0.35, z: 0.25, r: 1.5 }

/**
 * Le coin lecture : un tapis rond de cordage, un fauteuil club de cuir cognac tourné vers le poêle, une couverture rayée jetée
 * sur l'accoudoir, un guéridon avec un livre, un mug et les lunettes du gardien.
 */
export function Reading() {
  return (
    <>
      <mesh geometry={cyl(RUG.r, RUG.r, 0.035, 72)} material={[L.rugEdge, L.rug, L.rugEdge]} position={[RUG.x, 0.0185, RUG.z]} receiveShadow />
      {/* le fauteuil, tourné vers la pièce (et le poêle, en diagonale) : on le voit de face, pas de dos */}
      <group position={[0.55, 0, 0.65]} rotation-y={0.55} scale={1.12}>
        {[[-0.38, -0.36], [0.38, -0.36], [-0.38, 0.36], [0.38, 0.36]].map(([x, z]) => (
          <Part key={`${x}${z}`} geo={cyl(0.045, 0.035, 0.16, 10)} m={L.oakDark} p={[x, 0.08, z]} />
        ))}
        <Part geo={rbox(1.0, 0.32, 0.92, 0.12)} m={L.leather} p={[0, 0.32, 0]} />
        <Part geo={rbox(0.84, 0.15, 0.74, 0.07)} m={L.leather} p={[0, 0.57, 0.03]} />
        <Part geo={rbox(1.0, 0.82, 0.26, 0.12)} m={L.leather} p={[0, 0.78, -0.37]} rotation-x={-0.1} />
        {[-1, 1].map((s) => (
          <Part key={s} geo={rbox(0.2, 0.5, 0.92, 0.09)} m={L.leatherDark} p={[s * 0.42, 0.58, 0]} />
        ))}
        {/* les clous de tapissier, en rang le long des accoudoirs et du dossier */}
        {Array.from({ length: 7 }, (_, i) => (
          <group key={i}>
            {[-1, 1].map((s) => (
              <Part key={s} geo={SPH} m={L.brass} scale={0.016} p={[s * 0.42, 0.42, -0.4 + i * 0.133]} castShadow={false} />
            ))}
            <Part geo={SPH} m={L.brass} scale={0.016} p={[-0.42 + i * 0.14, 0.56, -0.26]} castShadow={false} />
          </group>
        ))}
        {/* la couverture : posée sur l'assise, elle retombe sur l'accoudoir droit */}
        <Part geo={rbox(0.5, 0.035, 0.52, 0.015)} m={L.blanket} p={[0.1, 0.66, 0.12]} rotation-y={0.2} castShadow={false} />
        <Part geo={rbox(0.045, 0.34, 0.46, 0.015)} m={L.blanket} p={[0.54, 0.62, 0.08]} castShadow={false} />
        <Part geo={rbox(0.3, 0.035, 0.46, 0.015)} m={L.blanket} p={[0.45, 0.8, 0.08]} rotation-z={-0.08} castShadow={false} />
        {/* un coussin marine contre le dossier */}
        <Part geo={rbox(0.36, 0.34, 0.12, 0.06)} m={L.navy} p={[-0.2, 0.82, -0.22]} rotation={[-0.25, 0.1, 0.1]} />
      </group>
      {/* le guéridon : un plateau de laiton, un livre, un mug, des lunettes rondes */}
      <group position={[1.75, 0, 1.55]}>
        <Part geo={cyl(0.27, 0.27, 0.04, 28)} m={L.brassDull} p={[0, 0.54, 0]} />
        <Part geo={cyl(0.035, 0.05, 0.5, 10)} m={L.oakDark} p={[0, 0.27, 0]} />
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * TAU + 0.5
          return <Part key={i} geo={cyl(0.02, 0.02, 0.3, 6)} m={L.oakDark} p={[Math.cos(a) * 0.14, 0.06, Math.sin(a) * 0.14]} rotation={[-Math.sin(a) * 0.7, 0, Math.cos(a) * 0.7]} castShadow={false} />
        })}
        <Part geo={rbox(0.26, 0.05, 0.19, 0.015)} m={L.navy} p={[-0.06, 0.595, -0.02]} rotation-y={0.3} />
        <Part geo={rbox(0.23, 0.035, 0.16, 0.01)} m={L.paper} p={[-0.06, 0.607, -0.02]} rotation-y={0.3} castShadow={false} />
        <Part geo={cyl(0.04, 0.036, 0.09, 14)} m={L.mug} p={[0.12, 0.62, 0.07]} />
        <Steam at={[0.12, 0.7, 0.07]} every={0.8} />
        {[-1, 1].map((s) => (
          <Part key={s} m={L.brassDull} p={[-0.08 + s * 0.045, 0.64, 0.12]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.025, 0.004, 6, 14]} />
          </Part>
        ))}
      </group>
    </>
  )
}
