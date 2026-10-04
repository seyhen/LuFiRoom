import { CircleGeometry, CylinderGeometry, DoubleSide } from 'three'
import { Part, cyl, rbox } from '../parts'
import { B } from './materials'

// Le dossier en éventail : un disque de rotin dont le bas est coupé à hauteur d'assise, et sa bordure roulée.
const R = 0.6, CUT = 0.28
const fan = new CircleGeometry(R, 40, -CUT, Math.PI + CUT * 2)
// Les accoudoirs : un bandeau de rotin qui enveloppe l'arrière de l'assise.
const arms = new CylinderGeometry(0.44, 0.44, 0.2, 28, 1, true, Math.PI / 2, Math.PI)
const wicker = B.rattan.clone()
wicker.side = DoubleSide

/** Fauteuil « paon » en rotin dans le coin : pied en sablier, assise de lin, grand dossier en éventail et un coussin corail. */
export function PeacockChair() {
  return (
    <group position={[-2.2, 0, -2.2]} rotation-y={Math.PI / 4}>
      {/* le pied en sablier */}
      <Part geo={cyl(0.16, 0.36, 0.36, 24)} m={B.rattan} p={[0, 0.18, 0]} />
      <Part geo={cyl(0.38, 0.17, 0.2, 24)} m={B.rattan} p={[0, 0.46, 0]} />
      <Part geo={cyl(0.4, 0.4, 0.06, 28)} m={B.cane} p={[0, 0.58, 0]} />
      <Part geo={cyl(0.36, 0.36, 0.1, 28)} m={B.linen} p={[0, 0.65, 0.02]} />
      {/* les accoudoirs, derrière et sur les côtés de l'assise */}
      <mesh geometry={arms} material={wicker} position={[0, 0.7, 0]} castShadow receiveShadow />
      <Part m={B.cane} p={[0, 0.8, 0]} rotation-x={-Math.PI / 2}>
        <torusGeometry args={[0.44, 0.03, 8, 28, Math.PI]} />
      </Part>
      {/* le dossier, juste derrière les accoudoirs */}
      <group position={[0, 0.78, -0.45]} rotation-x={-0.12}>
        <mesh geometry={fan} material={wicker} castShadow receiveShadow />
        <Part m={B.cane} rotation-z={-CUT}>
          <torusGeometry args={[R, 0.035, 8, 40, Math.PI + CUT * 2]} />
        </Part>
      </group>
      {/* le coussin, posé sur l'assise et incliné vers le dossier */}
      <Part geo={rbox(0.36, 0.3, 0.12, 0.06)} m={B.stripeCoral} p={[0.04, 0.85, -0.2]} rotation={[-0.32, 0, 0.08]} />
    </group>
  )
}
