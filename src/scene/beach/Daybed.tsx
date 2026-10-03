import { Part, cyl, rbox } from '../parts'
import { B } from './materials'

/**
 * Lit de jour en rotin contre le mur : un matelas de lin, de gros coussins (lin, rayé corail, turquoise), un plaid de
 * verre de mer jeté au pied. Le chat y fait la sieste.
 */
export function Daybed() {
  return (
    <group position={[-2.5, 0, -0.3]}>
      {/* cadre : pieds, ceinture, dossier bas et accotoirs en rotin */}
      {[[-0.38, -1.0], [0.38, -1.0], [-0.38, 1.0], [0.38, 1.0]].map(([x, z]) => (
        <Part key={`${x}${z}`} geo={cyl(0.045, 0.035, 0.18, 10)} m={B.wood} p={[x, 0.09, z]} />
      ))}
      <Part geo={rbox(0.92, 0.2, 2.16, 0.07)} m={B.rattan} p={[0, 0.27, 0]} />
      <Part geo={rbox(0.14, 0.5, 2.16, 0.06)} m={B.rattan} p={[-0.44, 0.58, 0]} />
      {[-1.06, 1.06].map((z) => (
        <Part key={z} geo={rbox(0.92, 0.42, 0.12, 0.06)} m={B.rattan} p={[0, 0.54, z]} />
      ))}
      {/* le matelas et les coussins */}
      <Part geo={rbox(0.8, 0.16, 2.0, 0.07)} m={B.linen} p={[0.04, 0.45, 0]} />
      <Part geo={rbox(0.24, 0.5, 0.62, 0.12)} m={B.linen} p={[-0.27, 0.74, -0.62]} rotation-z={-0.18} />
      <Part geo={rbox(0.24, 0.48, 0.6, 0.12)} m={B.stripeCoral} p={[-0.27, 0.73, 0.02]} rotation-z={-0.2} />
      <Part geo={rbox(0.24, 0.46, 0.58, 0.12)} m={B.turquoise} p={[-0.27, 0.72, 0.64]} rotation-z={-0.18} />
      <Part geo={rbox(0.14, 0.3, 0.34, 0.08)} m={B.butter} p={[-0.1, 0.66, 0.38]} rotation={[0.2, 0.3, -0.25]} />
      {/* le plaid au pied, qui retombe sur le côté */}
      <group position={[0.06, 0.54, 0.72]}>
        <Part geo={rbox(0.82, 0.04, 0.46, 0.02)} m={B.seaglass} />
        <Part geo={rbox(0.04, 0.34, 0.46, 0.02)} m={B.seaglass} p={[0.42, -0.15, 0]} rotation-z={0.06} castShadow={false} />
        {[-0.18, -0.06, 0.06, 0.18].map((z) => (
          <Part key={z} geo={cyl(0.008, 0.008, 0.06, 5)} m={B.linen} p={[0.43, -0.34, z]} castShadow={false} />
        ))}
      </group>
      {/* un livre ouvert retourné sur le matelas */}
      <group position={[0.18, 0.55, -0.15]} rotation-y={0.4}>
        {[-1, 1].map((s) => (
          <Part key={s} geo={rbox(0.12, 0.022, 0.17, 0.01)} m={B.coral} p={[s * 0.055, 0, 0]} rotation-z={-s * 0.3} castShadow={false} />
        ))}
      </group>
    </group>
  )
}
