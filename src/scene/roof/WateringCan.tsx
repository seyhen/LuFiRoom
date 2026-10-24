import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { gummy } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { R } from './materials'

/** L'arrosoir sur sa caisse, devant la jardinière de lavande : son pied au sol. */
export const CAN = { x: -0.5, z: -2.11, crate: 0.4, face: 0.9 }
const POT = { soil: 0.49 } // la terre de la jardinière de lavande (voir Planters)
const water = gummy(0xcfeaff, { roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.8, depthWrite: false })
const DROPS = 7
const TILT = 0.38 // rad : de combien il s'incline pour verser

/**
 * L'arrosoir de zinc, posé sur une caisse devant la jardinière de lavande : un corps cerclé, une anse, un long bec qui finit en pomme. Quand le
 * son joue, il s'incline vers la jardinière, et un filet d'eau tombe de la pomme dans la terre ; il se redresse en s'arrêtant. Il
 * remplace l'ancien arrosoir posé sur la caisse de plantes du devant (voir FrontCorner).
 */
export function WateringCan() {
  const g = useRef<Group>(null!), tilt = useRef<Group>(null!), drops = useRef<(Mesh | null)[]>([]), st = useRef({ k: 0, t: 0 })
  useSquash('watering', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'watering')
    s.k = approach(s.k, on ? 1 : 0, dt * 0.9)
    tilt.current.rotation.z = -TILT * s.k
    if (!reduceMotion) s.t += dt * (0.9 + s.k * 0.4)
    // le bout de la pomme (0.6, 0.4) tourné autour du centre du corps (0, 0.13) : dans le repère du bec (+x), relatif au dessus de la caisse
    const c = Math.cos(TILT * s.k), sn = Math.sin(TILT * s.k), rx = 0.6, ry = 0.27
    const lx = rx * c + ry * sn, ly = 0.13 - rx * sn + ry * c
    const fall = Math.max(0.05, CAN.crate + ly - POT.soil)
    drops.current.forEach((d, i) => {
      if (!d) return
      const f = (s.t * 1.7 + i / DROPS) % 1
      d.visible = s.k > 0.55
      d.position.set(lx, ly - f * fall, 0)
      d.scale.set(0.02, 0.06 * (0.5 + f), 0.02)
    })
  })
  return (
    <group ref={g} userData={{ id: 'watering' }} position={[CAN.x, 0, CAN.z]} rotation-y={0.4}>
      <Static>
        <Part geo={rbox(0.42, CAN.crate, 0.42, 0.02)} m={R.teak} p={[0, CAN.crate / 2, 0]} />
        {[0.12, 0.34].map((y) => (
          <Part key={y} geo={rbox(0.44, 0.03, 0.44, 0.012)} m={R.log} p={[0, y, 0]} castShadow={false} />
        ))}
      </Static>
      {/* le groupe qui se tourne vers le pot (le bec vers +x), puis s'incline autour du centre du corps */}
      <group position={[0, CAN.crate, 0]} rotation-y={CAN.face - 0.4}>
        <group ref={tilt} position={[0, 0.13, 0]}>
          <group position={[0, -0.13, 0]}>
            <Part geo={cyl(0.12, 0.13, 0.26, 20)} m={R.zinc} p={[0, 0.13, 0]} />
            {[0.05, 0.2].map((y) => (
              <Part key={y} geo={cyl(0.133, 0.133, 0.014, 20)} m={R.steel} p={[0, y, 0]} castShadow={false} />
            ))}
            <Part geo={cyl(0.11, 0.11, 0.012, 20)} m={R.steel} p={[0, 0.262, 0]} castShadow={false} />
            {/* l'anse : un arc au-dessus, du bord au dos */}
            <Part m={R.zinc} p={[-0.02, 0.28, 0]} castShadow={false}>
              <torusGeometry args={[0.11, 0.012, 6, 16, Math.PI]} />
            </Part>
            {/* le bec : un tube qui monte vers l'avant, et la pomme tournée vers le bas */}
            <Part geo={cyl(0.016, 0.03, 0.555, 10)} m={R.zinc} p={[0.35, 0.225, 0]} rotation-z={-0.977} castShadow={false} />
            <Part geo={cyl(0.055, 0.035, 0.04, 14)} m={R.steel} p={[0.595, 0.385, 0]} rotation-z={-0.4} castShadow={false} />
          </group>
        </group>
        {/* le filet d'eau : de petites gouttes étirées qui tombent de la pomme dans la terre de la jardinière */}
        {Array.from({ length: DROPS }, (_, i) => (
          <mesh key={i} ref={(m) => { drops.current[i] = m }} geometry={SPH} material={water} visible={false} />
        ))}
      </group>
    </group>
  )
}
