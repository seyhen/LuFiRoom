import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshBasicMaterial, type Group, type Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, rand, smooth } from '../../math'
import { gummy } from '../materials'
import { SPH, cyl, noRay } from '../parts'
import { reduceMotion, useSquash } from '../anim'

/**
 * L'ourlet du duffle-coat accroché au portemanteau (voir Umbrellas : le fût est en (2.9, 0.98), le manteau y pend à ~1,2 de haut), et la
 * flaque sur le paillasson juste en dessous. Le manteau rentre de la pluie : il goutte, une goutte à la fois.
 */
export const DRIP = { x: 3.0, z: 1.14, hemY: 1.2 }
const MAT = 0.0225 // le dessus du paillasson, sur lequel tombe la goutte
const FLOOR = MAT + 0.012 // juste au-dessus de la flaque posée dessus
const drop = gummy(0xe4f3ff, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.95, depthWrite: false })
// l'eau de la flaque : plus claire que le parquet, pour qu'on la voie sur le paillasson
const water = gummy(0x9fcdf0, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.7 })
const ringMat = new MeshBasicMaterial({ color: 0xdbe8f4, transparent: true, opacity: 0, depthWrite: false })

/**
 * Quand le son joue, une goutte se forme sous l'ourlet du manteau, grossit, se détache, tombe de plus en plus vite dans la flaque du
 * paillasson et y dessine un rond qui s'élargit ; puis une autre se forme. Tout reste à l'intérieur : rien ne tombe du plafond.
 */
export function DripCoat() {
  const g = useRef<Group>(null!), bead = useRef<Mesh>(null!), ring = useRef<Mesh>(null!), st = useRef({ t: 0, len: 3, ring: 9 })
  useSquash('drip', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'drip')
    if (on && !reduceMotion) {
      s.t += dt
      if (s.t > s.len) {
        s.t = 0
        s.len = rand(2.4, 4)
      }
    } else if (!on) s.t = approach(s.t, 0, dt * 2)
    const u = s.t / s.len, form = 0.62, fall = 0.2
    let r = 0.004, y = DRIP.hemY, stretch = 1, vis = on
    if (u < form) {
      r = 0.006 + 0.026 * smooth(u / form) // elle grossit en pendant sous l'ourlet
      y = DRIP.hemY - r * 1.3
      stretch = 1 + 0.3 * smooth(u / form)
    } else if (u < form + fall) {
      const k = (u - form) / fall // la chute : de plus en plus vite
      r = 0.026
      y = DRIP.hemY - 0.05 - (DRIP.hemY - 0.05 - FLOOR - 0.03) * k * k
      stretch = 1.7
    } else vis = false
    if (reduceMotion) {
      r = 0.024
      y = DRIP.hemY - 0.03
      vis = on
    }
    bead.current.visible = vis
    bead.current.position.set(0, y, 0)
    bead.current.scale.set(r, r * stretch, r)
    // le rond dans la flaque : il naît à l'impact, s'élargit et s'efface
    if (on && !reduceMotion && u >= form + fall) s.ring = (u - form - fall) * s.len
    else if (!on || u < form) s.ring = 9
    const k = Math.min(1, s.ring / 1.1)
    ring.current.visible = s.ring < 1.1
    ring.current.scale.setScalar(0.03 + 0.18 * smooth(k))
    ringMat.opacity = 0.8 * (1 - k)
  })
  return (
    <group ref={g} userData={{ id: 'drip' }} position={[DRIP.x, 0, DRIP.z]}>
      {/* la flaque sous l'ourlet, sur le paillasson : c'est elle qu'on touche */}
      <mesh geometry={cyl(0.2, 0.2, 0.01, 24)} material={water} position={[0, MAT + 0.007, 0]} scale={[1.15, 1, 0.9]} receiveShadow />
      {/* la goutte sous l'ourlet, puis en chute */}
      <mesh ref={bead} geometry={SPH} material={drop} visible={false} raycast={noRay} />
      {/* le rond qui s'élargit sur la flaque */}
      <mesh ref={ring} material={ringMat} position={[0, FLOOR, 0]} rotation-x={-Math.PI / 2} visible={false} raycast={noRay}>
        <ringGeometry args={[0.88, 1, 36]} />
      </mesh>
    </group>
  )
}
