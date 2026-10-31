import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshBasicMaterial, type Group, type Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, rand, smooth } from '../../math'
import { gummy } from '../materials'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { Garment } from '../objects/Garment'
import { K } from './materials'

/**
 * Le duffle-coat accroché au portemanteau (voir Umbrellas : le fût est en (2.9, 0.98)), son ourlet, et la flaque sur le parquet
 * juste en dessous (le paillasson est plus loin, devant : la flaque ne le chevauche plus). Le manteau rentre de la pluie : il
 * goutte, une goutte à la fois. Le manteau fait partie de l'objet : c'est lui qu'on touche, il rebondit.
 */
export const DRIP = { x: 3.0, z: 1.14, hemY: 0.99 }
// la goutte naît sur le devant de l'ourlet (le manteau pend du crochet, tourné de 0,75 : son devant est à 5 cm du plan du crochet)
const BX = -0.006, BZ = -0.044
const FLOOR = 0.012 // juste au-dessus de la flaque posée sur le parquet
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
    bead.current.position.set(BX, y, BZ)
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
      {/* le duffle-coat camel, accroché au portemanteau (crochet en (2.96, 1.9, 1.06)) : capuche dans le dos, brandebourgs, poches plaquées */}
      <Static>
        <Garment p={[-0.04, 1.9, -0.08]} r={[0.04, 0.75, 0]} m={K.tweed}>
          <Part geo={SPH} m={K.tweed} scale={[0.12, 0.13, 0.06]} p={[0, -0.13, -0.06]} castShadow={false} />
          {[-0.24, -0.38, -0.52].map((y) => (
            <group key={y}>
              <Part geo={rbox(0.07, 0.014, 0.014, 0.006)} m={K.wool} p={[0.02, y, 0.055]} castShadow={false} />
              <Part geo={cyl(0.009, 0.009, 0.045, 6)} m={K.walnut} p={[-0.025, y, 0.06]} rotation-z={Math.PI / 2} castShadow={false} />
            </group>
          ))}
          {[-1, 1].map((sd) => (
            <Part key={sd} geo={rbox(0.11, 0.1, 0.012, 0.01)} m={K.tweed} p={[sd * 0.1, -0.68, 0.055]} castShadow={false} />
          ))}
        </Garment>
      </Static>
      {/* la flaque sous l'ourlet, sur le parquet (sous les pieds du portemanteau, plus bas qu'eux) */}
      <mesh geometry={cyl(0.2, 0.2, 0.006, 24)} material={water} position={[0, 0.004, 0]} scale={[1.15, 1, 0.9]} receiveShadow />
      {/* la goutte sous l'ourlet, puis en chute */}
      <mesh ref={bead} geometry={SPH} material={drop} visible={false} raycast={noRay} />
      {/* le rond qui s'élargit sur la flaque */}
      <mesh ref={ring} material={ringMat} position={[BX, FLOOR, BZ]} rotation-x={-Math.PI / 2} visible={false} raycast={noRay}>
        <ringGeometry args={[0.88, 1, 36]} />
      </mesh>
    </group>
  )
}
