import { SphereGeometry, DoubleSide } from 'three'
import { Part, SPH, cyl, rbox } from '../parts'
import { B } from './materials'

// La coque : une sphère ouverte sur le devant (on retire un quartier, tourné vers +z).
const shell = new SphereGeometry(0.55, 32, 20, Math.PI * 0.32, Math.PI * 1.36, 0, Math.PI * 0.82)
const shellMat = B.rattan.clone()
shellMat.side = DoubleSide

/** Fauteuil-œuf en rotin suspendu à son pied courbe, un gros coussin et un plaid : on s'y love face à la mer. */
export function EggChair() {
  return (
    <group position={[2.35, 0, 2.3]} rotation-y={0.6}>
      {/* le pied : un socle rond et un arc qui monte et revient au-dessus */}
      <Part geo={cyl(0.42, 0.46, 0.06, 28)} m={B.wood} p={[0, 0.03, -0.1]} />
      <Part geo={cyl(0.035, 0.04, 1.95, 10)} m={B.wood} p={[0, 1.0, -0.62]} rotation-x={0.12} />
      <Part m={B.wood} p={[0, 1.95, -0.32]} rotation-y={Math.PI / 2}>
        <torusGeometry args={[0.3, 0.035, 8, 16, Math.PI / 1.5]} />
      </Part>
      <Part geo={cyl(0.006, 0.006, 0.3, 4)} m={B.ink} p={[0, 1.88, -0.02]} castShadow={false} />
      {/* la coque, son coussin, le plaid */}
      <group position={[0, 1.05, 0]}>
        <mesh geometry={shell} material={shellMat} scale={[1, 1.25, 1]} rotation-y={Math.PI / 2} castShadow receiveShadow />
        <Part geo={SPH} m={B.linen} scale={[0.42, 0.14, 0.4]} p={[0, -0.42, 0]} />
        <Part geo={rbox(0.5, 0.45, 0.16, 0.1)} m={B.stripeNavy} p={[0, -0.12, -0.3]} rotation-x={-0.2} />
        <Part geo={SPH} m={B.butter} scale={[0.14, 0.13, 0.08]} p={[0.2, -0.24, -0.12]} />
        <Part geo={rbox(0.36, 0.04, 0.5, 0.02)} m={B.seaglass} p={[-0.12, -0.33, 0.12]} rotation={[0.1, 0.4, -0.15]} />
      </group>
    </group>
  )
}
