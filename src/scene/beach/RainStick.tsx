import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, smooth } from '../../math'
import { Part, SPH, cyl } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { B } from './materials'

/** Le bâton de pluie, accroché au mur du fond (face à la caméra), à gauche de la baie : le crochet est en (x, y), contre le mur z = -3. */
export const STICK = { x: -1.8, y: 2.35, wall: -2.93 }
const SWING = 0.62 // rad : environ 35 degrés de chaque côté de l'horizontale
const REST = Math.PI / 2 - 0.2 // au repos, il pend presque à plat, un peu penché

/**
 * Le bâton de pluie : un long tube de bambou à bagues corail, rapporté d'un voyage et suspendu par son milieu à un crochet du mur,
 * au bout d'une cordelette. Quand le son joue, il bascule lentement d'un bout à l'autre, comme on le retourne pour entendre les graines
 * dévaler ; il marque une pause à chaque extrémité. Éteint, il reste où il est, un peu penché.
 */
export function RainStick() {
  const g = useRef<Group>(null!), tube = useRef<Group>(null!), st = useRef({ ph: 0, angle: 0 })
  useSquash('rainstick', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'rainstick')
    if (on && !reduceMotion) {
      s.ph += dt * 0.42 // une bascule d'un bout à l'autre en 7 s environ
      // l'angle suit un sinus aplati aux extrémités : le bâton marque une pause avant de repartir
      const w = Math.sin(s.ph)
      s.angle = SWING * Math.sign(w) * smooth(Math.min(1, Math.abs(w) * 1.6))
    } else s.angle = approach(s.angle, 0, dt * 0.3)
    tube.current.rotation.z = REST + s.angle
  })
  return (
    <group ref={g} userData={{ id: 'rainstick' }} position={[STICK.x, STICK.y, STICK.wall]}>
      <Static>
        {/* la platine ronde de bois blanchi vissée au mur, le crochet, et la cordelette qui porte le bâton */}
        <Part geo={cyl(0.06, 0.06, 0.02, 18)} m={B.driftwood} p={[0, 0, 0.01]} rotation-x={Math.PI / 2} castShadow={false} />
        <Part geo={SPH} m={B.wood} scale={0.022} p={[0, 0, 0.03]} castShadow={false} />
        <Part geo={cyl(0.007, 0.007, 0.09, 6)} m={B.rope} p={[0, 0, 0.075]} rotation-x={Math.PI / 2} castShadow={false} />
      </Static>
      <group ref={tube} position={[0, 0, 0.12]} rotation-z={REST}>
        <Part geo={cyl(0.07, 0.07, 1.1, 20)} m={B.cane} />
        {[-0.42, -0.14, 0.14, 0.42].map((y) => (
          <Part key={y} m={y === -0.42 || y === 0.42 ? B.coral : B.wood} p={[0, y, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.073, 0.014, 8, 22]} />
          </Part>
        ))}
        {[-1, 1].map((sd) => (
          <Part key={sd} geo={SPH} m={B.wood} scale={[0.07, 0.04, 0.07]} p={[0, sd * 0.55, 0]} castShadow={false} />
        ))}
        {/* le cordon noué autour du milieu du bâton */}
        <Part m={B.rope} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.075, 0.01, 6, 18]} />
        </Part>
      </group>
    </group>
  )
}
