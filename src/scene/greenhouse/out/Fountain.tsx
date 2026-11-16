import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshBasicMaterial, Object3D, TorusGeometry, type Group, type InstancedMesh, type Mesh } from 'three'
import { approach, TAU } from '../../../math'
import { isActive, useStore } from '../../../state/store'
import { mood, reduceMotion, useSquash } from '../../anim'
import { LIVE } from '../../Static'
import { Part, SPH, cyl, noRay } from '../../parts'
import { far } from '../../materials'
import { skyFade } from '../../outdoor'

// La fontaine du parc, à gauche de la serre : un bassin rond de pierre, un pied, une vasque, un jet qui retombe en gouttes.
// Interactive (`fountain`) : touchée, le jet jaillit et l'eau murmure (le son `fountain`). Éteinte, le bassin reste plein et calme.
const F = { c: [0, 0] as [number, number], r0: 9, r1: 16.5 }
const STONE = skyFade(far(0xd8cfba, { roughness: 0.75, emissive: 0x9aa8c0, emissiveIntensity: 0 }), F)
const MOSS = skyFade(far(0x7fa070, { roughness: 0.9 }), F)
const WATER = skyFade(far(0x86bfcc, { roughness: 0.2, clearcoat: 0.6, emissive: 0x5aa8c0, emissiveIntensity: 0 }), F)
const SPRAY = new MeshBasicMaterial({ color: 0xe6f7ff, transparent: true, opacity: 0.6, depthWrite: false })
const RIM = new TorusGeometry(0.82, 0.13, 10, 28)
const BOWL_RIM = new TorusGeometry(0.4, 0.06, 8, 20)

const DROPS = 18, TOP = 1.45, POOL = 0.36
const dummy = new Object3D()

/** `at` : le pied du bassin sur le gazon (x, y, z). */
export function Fountain({ at }: { at: [number, number, number] }) {
  const root = useRef<Group>(null!), jet = useRef<Mesh>(null!), drops = useRef<InstancedMesh>(null!)
  const s = useRef({ amp: 0, phase: Array.from({ length: DROPS }, (_, i) => i / DROPS) })
  useSquash('fountain', root)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), S = s.current
    STONE.emissiveIntensity = mood.night * 0.22 // de nuit la pierre et l'eau gardent un peu de clarté (la fontaine ne se ternit pas)
    WATER.emissiveIntensity = mood.night * 0.35
    S.amp = approach(S.amp, isActive(useStore.getState(), 'fountain') && !reduceMotion ? 1 : 0, dt * 1.2)
    const a = S.amp
    // le jet : une colonne qui monte ; les gouttes retombent en arcs autour (la phase s'additionne image après image)
    jet.current.visible = a > 0.02
    jet.current.scale.set(1, Math.max(0.01, a), 1)
    jet.current.position.y = 1.1 + (TOP * a) / 2
    for (let i = 0; i < DROPS; i++) {
      S.phase[i] = (S.phase[i] + dt * (0.55 + 0.06 * (i % 3))) % 1
      const k = S.phase[i], ang = (i / DROPS) * TAU * 3.1 + i, r = 0.1 + 0.55 * k * (0.7 + 0.3 * (((i * 7) % 5) / 4))
      dummy.position.set(Math.cos(ang) * r, Math.max(POOL + 0.12, 1.1 + TOP * a * (1 - (2 * k - 1) ** 2) * 0.9 - 0.9 * k * k), Math.sin(ang) * r)
      dummy.scale.setScalar(a > 0.02 ? 0.034 * (0.7 + 0.3 * Math.sin(k * Math.PI)) : 0.0001)
      dummy.updateMatrix()
      drops.current.setMatrixAt(i, dummy.matrix)
    }
    drops.current.instanceMatrix.needsUpdate = true
  })
  return (
    <group ref={root} position={at} userData={{ id: 'fountain' }}>
      {/* la dalle, le bassin (un gros bourrelet de pierre, l'eau en retrait) */}
      <Part geo={cyl(1.1, 1.15, 0.1, 28)} m={STONE} p={[0, 0.05, 0]} castShadow={false} />
      <Part geo={cyl(0.95, 0.98, 0.34, 28)} m={STONE} p={[0, 0.27, 0]} castShadow={false} />
      <Part geo={RIM} m={STONE} p={[0, 0.44, 0]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.8, 0.8, 0.02, 28)} m={WATER} p={[0, 0.455, 0]} castShadow={false} />
      {/* la mousse sur le bourrelet, côté ombre */}
      <Part geo={cyl(0.18, 0.2, 0.04, 8)} m={MOSS} p={[-0.6, 0.575, -0.55]} castShadow={false} />
      {/* le pied, la vasque, son rebord, le bouton du haut */}
      <Part geo={cyl(0.12, 0.2, 0.54, 12)} m={STONE} p={[0, 0.65, 0]} castShadow={false} />
      <Part geo={cyl(0.4, 0.12, 0.14, 20)} m={STONE} p={[0, 0.95, 0]} castShadow={false} />
      <Part geo={BOWL_RIM} m={STONE} p={[0, 1.02, 0]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.33, 0.33, 0.02, 20)} m={WATER} p={[0, 1.04, 0]} castShadow={false} />
      <Part geo={SPH} m={STONE} scale={[0.09, 0.11, 0.09]} p={[0, 1.09, 0]} castShadow={false} />
      <group userData={LIVE}>
        {/* le jet jaillit de la vasque ; ses gouttes retombent dans le bassin */}
        <mesh ref={jet} position={[0, 1.2, 0]} material={SPRAY} raycast={noRay} visible={false}>
          <cylinderGeometry args={[0.028, 0.05, 1, 8]} />
        </mesh>
        <instancedMesh ref={drops} args={[undefined, SPRAY, DROPS]} frustumCulled={false} raycast={noRay}>
          <sphereGeometry args={[1, 6, 5]} />
        </instancedMesh>
      </group>
    </group>
  )
}
