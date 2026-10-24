import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshBasicMaterial, type Group, type Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, rand, smooth } from '../../math'
import { gummy, M } from '../materials'
import { Part, SPH, cyl, noRay } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { K } from './materials'

/**
 * Le pied du portemanteau (près de la porte), le bras de laiton qui en part vers le devant, et la pointe du parapluie qui y pend :
 * la goutte tombe sur une petite flaque posée sur le paillasson (voir Umbrellas), à `arm` du fût, vers le devant.
 */
export const DRIP = { x: 2.9, z: 0.98, arm: 0.3, hookY: 1.12, tipY: 0.52, ux: 0.03 }
const MAT = 0.0225 // le dessus du paillasson (voir Umbrellas), sur lequel tombe la goutte
const FLOOR = MAT + 0.0125 // juste au-dessus de la flaque posée dessus
const drop = gummy(0xd8ecff, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.88, depthWrite: false })
const ringMat = new MeshBasicMaterial({ color: 0xdbe8f4, transparent: true, opacity: 0, depthWrite: false })

/**
 * Un parapluie compact et trempé, pendu par sa poignée à un bras de laiton du portemanteau, au-dessus de la flaque. Quand le son
 * joue, une goutte se forme au bout de sa pointe, grossit, se détache, tombe dans la flaque et y dessine un rond qui s'élargit ;
 * puis une autre se forme. À l'intérieur : la flaque est au sol, rien ne tombe du plafond.
 */
export function DripUmbrella() {
  const g = useRef<Group>(null!), bead = useRef<Mesh>(null!), ring = useRef<Mesh>(null!), st = useRef({ t: 0, len: 2.8, ring: 9 })
  useSquash('drip', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'drip')
    if (on && !reduceMotion) {
      s.t += dt
      if (s.t > s.len) {
        s.t = 0
        s.len = rand(2.3, 3.8)
      }
    } else if (!on) s.t = approach(s.t, 0, dt * 2)
    const u = s.t / s.len, form = 0.7, fall = 0.17
    let r = 0.004, y = DRIP.tipY, stretch = 1, vis = on
    if (u < form) {
      r = 0.004 + 0.017 * smooth(u / form) // elle grossit en pendant
      y = DRIP.tipY - r * 1.3
      stretch = 1 + 0.3 * smooth(u / form)
    } else if (u < form + fall) {
      const k = (u - form) / fall // la chute : de plus en plus vite
      r = 0.016
      y = DRIP.tipY - 0.03 - (DRIP.tipY - 0.03 - FLOOR - 0.02) * k * k
      stretch = 1.6
    } else vis = false
    if (reduceMotion) {
      r = 0.014
      y = DRIP.tipY - 0.018
      vis = on
    }
    bead.current.visible = vis
    bead.current.position.set(DRIP.ux, y, -DRIP.arm)
    bead.current.scale.set(r, r * stretch, r)
    // le rond dans la flaque : il naît à l'impact, s'élargit et s'efface
    if (on && !reduceMotion && u >= form + fall) s.ring = (u - form - fall) * s.len
    else if (!on || u < form) s.ring = 9
    const k = Math.min(1, s.ring / 1.1)
    ring.current.visible = s.ring < 1.1
    ring.current.scale.setScalar(0.02 + 0.14 * smooth(k))
    ringMat.opacity = 0.55 * (1 - k)
  })
  const { arm, hookY, tipY, ux } = DRIP
  return (
    <group ref={g} userData={{ id: 'drip' }} position={[DRIP.x, 0, DRIP.z]}>
      {/* le bras part vers le devant et la gauche : le parapluie pend en pleine vue, devant le caban, au-dessus du paillasson */}
      <group rotation-y={2.62}>
      <Static>
        {/* le bras de laiton, vissé au fût du portemanteau, et sa pomme au bout */}
        <Part geo={cyl(0.012, 0.012, arm, 8)} m={K.brass} p={[0, hookY, -arm / 2]} rotation-x={Math.PI / 2} castShadow={false} />
        <Part geo={SPH} m={K.brass} scale={0.02} p={[0, hookY, -arm]} castShadow={false} />
        {/* le parapluie : poignée en crochet par-dessus le bras, fût, toile roulée serrée, pointe de laiton */}
        <Part m={K.walnut} p={[ux / 2, hookY + 0.018, -arm]} castShadow={false}>
          <torusGeometry args={[ux / 2 + 0.012, 0.012, 8, 14, Math.PI]} />
        </Part>
        <Part geo={cyl(0.01, 0.01, hookY - tipY, 8)} m={M.plum} p={[ux, (hookY + tipY) / 2, -arm]} castShadow={false} />
        <Part m={K.teal} p={[ux, 0.82, -arm]} rotation-x={Math.PI}>
          <coneGeometry args={[0.058, 0.4, 10]} />
        </Part>
        <Part geo={cyl(0.06, 0.06, 0.025, 10)} m={K.brass} p={[ux, 0.97, -arm]} castShadow={false} />
        <Part geo={SPH} m={K.brass} scale={[0.012, 0.03, 0.012]} p={[ux, tipY + 0.03, -arm]} castShadow={false} />
      </Static>
      {/* la petite flaque sous la pointe */}
      <mesh geometry={cyl(0.17, 0.17, 0.008, 24)} material={K.puddle} position={[ux, MAT + 0.007, -arm]} scale={[1.1, 1, 0.85]} receiveShadow raycast={noRay} />
      {/* la goutte au bout de la pointe, puis en chute */}
      <mesh ref={bead} geometry={SPH} material={drop} visible={false} raycast={noRay} />
      {/* le rond qui s'élargit sur la flaque */}
      <mesh ref={ring} material={ringMat} position={[ux, FLOOR, -arm]} rotation-x={-Math.PI / 2} visible={false} raycast={noRay}>
        <ringGeometry args={[0.88, 1, 36]} />
      </mesh>
      </group>
    </group>
  )
}
