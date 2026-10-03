import { CircleGeometry, DoubleSide } from 'three'
import { Part, SPH, cyl, rbox } from '../parts'
import { B } from './materials'

// Le dossier en éventail : un demi-disque de rotin, et sa bordure roulée.
const fan = new CircleGeometry(0.72, 32, 0, Math.PI)
const fanMat = B.rattan.clone()
fanMat.side = DoubleSide

/** Fauteuil « paon » en rotin dans le coin, son grand dossier en éventail, un coussin de lin et un coussin corail. */
export function PeacockChair() {
  return (
    <group position={[-2.3, 0, -2.3]} rotation-y={Math.PI / 4}>
      {/* le pied en sablier */}
      <Part geo={cyl(0.16, 0.36, 0.36, 24)} m={B.rattan} p={[0, 0.18, 0]} />
      <Part geo={cyl(0.38, 0.17, 0.2, 24)} m={B.rattan} p={[0, 0.46, 0]} />
      <Part geo={cyl(0.4, 0.4, 0.06, 28)} m={B.cane} p={[0, 0.58, 0]} />
      <Part geo={cyl(0.36, 0.36, 0.1, 28)} m={B.linen} p={[0, 0.65, 0.02]} />
      {/* le dossier */}
      <group position={[0, 0.66, -0.3]} rotation-x={-0.18}>
        <mesh geometry={fan} material={fanMat} castShadow receiveShadow />
        <Part m={B.cane}>
          <torusGeometry args={[0.72, 0.035, 8, 32, Math.PI]} />
        </Part>
      </group>
      {/* les bras qui enveloppent l'assise */}
      {[-1, 1].map((s) => (
        <Part key={s} m={B.cane} p={[s * 0.33, 0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.04, 8, 16, Math.PI]} />
        </Part>
      ))}
      <Part geo={rbox(0.36, 0.32, 0.12, 0.08)} m={B.stripeCoral} p={[0.05, 0.86, -0.2]} rotation={[-0.25, 0, 0.12]} />
      <Part geo={SPH} m={B.butter} scale={[0.1, 0.1, 0.06]} p={[-0.16, 0.83, -0.15]} />
    </group>
  )
}
