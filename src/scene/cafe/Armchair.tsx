import { Part, SPH, cyl, rbox } from '../parts'
import { K } from './materials'

/**
 * Fauteuil à oreilles en tartan Royal Stewart, au coin du feu, tourné à moitié vers la cheminée et à moitié vers nous.
 * Un plaid moutarde sur l'accoudoir, un coussin de velours, un livre ouvert retourné sur l'accoudoir.
 */
export function Armchair() {
  return (
    <group position={[-1.78, 0, -1.25]} rotation-y={-0.42}>
      {/* pieds tournés */}
      {[[-0.36, -0.3], [0.36, -0.3], [-0.36, 0.3], [0.36, 0.3]].map(([x, z]) => (
        <Part key={`${x}${z}`} geo={cyl(0.045, 0.03, 0.16, 10)} m={K.walnut} p={[x, 0.08, z]} />
      ))}
      {/* assise, coussin, dossier haut légèrement incliné */}
      <Part geo={rbox(0.94, 0.3, 0.84, 0.11)} m={K.stewart} p={[0, 0.31, 0]} />
      <Part geo={rbox(0.7, 0.15, 0.7, 0.07)} m={K.stewart} p={[0, 0.52, 0.06]} />
      <group position={[0, 0.5, -0.33]} rotation-x={-0.1}>
        <Part geo={rbox(0.92, 1.05, 0.2, 0.1)} m={K.stewart} p={[0, 0.52, 0]} />
        <Part geo={SPH} m={K.stewart} scale={[0.46, 0.12, 0.11]} p={[0, 1.04, 0]} />
        {/* les oreilles */}
        {[-1, 1].map((s) => (
          <Part key={s} geo={rbox(0.13, 0.5, 0.42, 0.065)} m={K.stewart} p={[s * 0.42, 0.66, 0.17]} rotation-y={s * 0.22} />
        ))}
      </group>
      {/* accoudoirs roulés */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Part geo={rbox(0.15, 0.3, 0.74, 0.07)} m={K.stewart} p={[s * 0.42, 0.6, 0.03]} />
          <Part geo={cyl(0.095, 0.095, 0.76, 18)} m={K.stewart} p={[s * 0.45, 0.76, 0.03]} rotation-x={Math.PI / 2} />
          <Part geo={cyl(0.1, 0.1, 0.02, 18)} m={K.burgundy} p={[s * 0.45, 0.76, 0.41]} rotation-x={Math.PI / 2} castShadow={false} />
        </group>
      ))}
      {/* coussin de velours vert, plaid moutarde jeté sur l'accoudoir gauche */}
      <Part geo={rbox(0.38, 0.34, 0.13, 0.08)} m={K.velvet} p={[0.14, 0.78, -0.18]} rotation={[-0.15, 0.1, 0.18]} />
      <group position={[0.46, 0.86, 0.1]}>
        <Part geo={rbox(0.26, 0.035, 0.36, 0.015)} m={K.mustard} rotation-z={0.05} />
        <Part geo={rbox(0.035, 0.3, 0.36, 0.015)} m={K.mustard} p={[0.14, -0.14, 0]} rotation-z={-0.08} castShadow={false} />
        {[-0.13, -0.04, 0.05, 0.14].map((z) => (
          <Part key={z} geo={cyl(0.008, 0.008, 0.05, 5)} m={K.mustard} p={[0.155, -0.31, z]} castShadow={false} />
        ))}
      </group>
      {/* un livre ouvert, retourné sur l'accoudoir droit */}
      <group position={[-0.45, 0.87, 0.12]} rotation-y={0.3}>
        {[-1, 1].map((s) => (
          <Part key={s} geo={rbox(0.12, 0.025, 0.17, 0.01)} m={K.navy} p={[s * 0.055, 0, 0]} rotation-z={-s * 0.32} castShadow={false} />
        ))}
      </group>
    </group>
  )
}
