import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, LatheGeometry, Vector2, type Group, type Mesh, type MeshBasicMaterial } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { L } from './materials'

/** La corne de brume : le pied de la corne sur le mur de gauche (x, y, z). */
export const HORN = { x: -2.9, y: 3.05, z: -1.95 }

// Le pavillon de laiton : une trompe qui s'évase de plus en plus vite, de 5 cm à 33 cm de rayon sur 1 m.
const bell = new LatheGeometry(Array.from({ length: 26 }, (_, i) => new Vector2(0.05 + 0.28 * Math.pow(i / 25, 2.3), (i / 25) * 1.0)), 32)
const bellMat = L.brass.clone()
bellMat.side = DoubleSide
const RINGS = 3

/**
 * La corne de brume, boulonnée au mur : une cuve d'air comprimé, un grand pavillon de laiton qui s'évase vers la pièce, et un levier
 * dont la corde pend jusqu'à portée de main. Quand elle sonne, le pavillon vibre et des ondes s'en échappent.
 */
export function Foghorn() {
  const g = useRef<Group>(null!), horn = useRef<Group>(null!), rope = useRef<Group>(null!), rings = useRef<Mesh[]>([]), on = useRef(0)
  useSquash('foghorn', g)
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime, dt = Math.min(delta, 0.05)
    on.current = approach(on.current, isActive(useStore.getState(), 'foghorn') ? 1 : 0, dt * 1.6)
    const k = reduceMotion ? 0 : on.current
    horn.current.rotation.x = Math.sin(t * 61) * 0.004 * k
    horn.current.rotation.y = Math.sin(t * 53) * 0.004 * k
    rope.current.rotation.z = Math.sin(t * 1.4) * 0.03 * (0.4 + k)
    rings.current.forEach((r, i) => {
      const p = ((t * 0.55 + i / RINGS) % 1), m = r.material as MeshBasicMaterial
      r.scale.setScalar(0.45 + p * 1.7)
      r.position.x = 0.95 + p * 0.5
      m.opacity = k * (1 - p) * 0.5
      r.visible = k > 0.02
    })
  })
  return (
    <group ref={g} userData={{ id: 'foghorn' }} position={[HORN.x, HORN.y, HORN.z]}>
      {/* la platine murale, la cuve d'air et son manomètre */}
      <Part geo={cyl(0.26, 0.26, 0.05, 28)} m={L.iron} p={[-0.02, 0, 0]} rotation-z={Math.PI / 2} />
      <Part geo={cyl(0.16, 0.16, 0.55, 20)} m={L.navy} p={[0.14, -0.38, 0]} />
      <Part geo={SPH} m={L.navy} scale={[0.16, 0.12, 0.16]} p={[0.14, -0.1, 0]} castShadow={false} />
      <Part geo={cyl(0.17, 0.17, 0.04, 20)} m={L.brassDull} p={[0.14, -0.55, 0]} castShadow={false} />
      <Part geo={cyl(0.17, 0.17, 0.04, 20)} m={L.brassDull} p={[0.14, -0.22, 0]} castShadow={false} />
      <group ref={horn} position={[0.05, 0, 0]} rotation-z={-0.1}>
        <group rotation-z={-Math.PI / 2}>
          <mesh geometry={bell} material={bellMat} castShadow receiveShadow />
          {[0.18, 0.5, 0.82].map((y) => (
            <Part key={y} geo={cyl(0.07 + 0.28 * Math.pow(y, 2.3) + 0.012, 0.07 + 0.28 * Math.pow(y, 2.3) + 0.012, 0.035, 28)} m={L.brassDull} p={[0, y, 0]} castShadow={false} />
          ))}
        </group>
        {/* les ondes qui s'échappent du pavillon */}
        {Array.from({ length: RINGS }, (_, i) => (
          <mesh key={i} ref={(el) => void (el && (rings.current[i] = el))} rotation-y={Math.PI / 2} raycast={noRay} visible={false}>
            <torusGeometry args={[0.34, 0.012, 6, 36]} />
            <meshBasicMaterial color={0xfff0cc} transparent depthWrite={false} opacity={0} />
          </mesh>
        ))}
      </group>
      {/* le levier de manœuvre et sa corde, qui pend jusqu'à hauteur de main */}
      <Part geo={rbox(0.05, 0.28, 0.04, 0.015)} m={L.iron} p={[0.14, 0.05, 0.2]} rotation-z={0.3} castShadow={false} />
      <group ref={rope} position={[0.22, -0.08, 0.2]}>
        <Part geo={cyl(0.012, 0.012, 1.1, 6)} m={L.rope} p={[0, -0.55, 0]} castShadow={false} />
        <Part geo={SPH} m={L.ropeDark} scale={[0.035, 0.07, 0.035]} p={[0, -1.15, 0]} castShadow={false} />
        {[-1, 0, 1].map((s) => (
          <Part key={s} geo={cyl(0.006, 0.006, 0.12, 4)} m={L.rope} p={[s * 0.015, -1.25, 0]} castShadow={false} />
        ))}
      </group>
    </group>
  )
}
