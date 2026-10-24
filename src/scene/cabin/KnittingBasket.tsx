import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { Part, SPH, cyl } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { C } from './materials'

/** Le panier à tricot, à côté du pouf : son pied au sol. */
export const KNIT = { x: -0.2, z: 1.6 }

/**
 * À côté du pouf, le panier à tricot : une pelote canneberge qui se dévide, deux autres pelotes, l'écharpe commencée qui pend par
 * le bord, et deux longues aiguilles de bois. Quand le son joue, les aiguilles s'entrecroisent lentement, maille après maille, et la
 * pelote roule un peu sur elle-même ; à l'arrêt elles se posent en croix, la pelote immobile.
 */
export function KnittingBasket() {
  const g = useRef<Group>(null!), a = useRef<Group>(null!), b = useRef<Group>(null!), ball = useRef<Group>(null!), st = useRef({ k: 0, ph: 0 })
  useSquash('knit', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'knit')
    s.k = approach(s.k, on ? 1 : 0, dt * 1.2)
    if (!reduceMotion) s.ph += dt * 2.6 * s.k // la phase s'ajoute image après image
    const w = Math.sin(s.ph) * 0.2 * s.k, v = Math.sin(s.ph * 0.5 + 1) * 0.07 * s.k
    // chaque aiguille bascule en sens inverse de l'autre autour de son point d'appui : elles se croisent puis se séparent
    a.current.rotation.set(-0.35 + v, 0, -0.5 + w)
    b.current.rotation.set(0.2 - v, 0, 0.55 + w)
    ball.current.rotation.set(0, s.ph * 0.35, Math.sin(s.ph * 0.5) * 0.12 * s.k)
  })
  return (
    <group ref={g} userData={{ id: 'knit' }} position={[KNIT.x, 0, KNIT.z]} rotation-y={0.5}>
      <group scale={1.5}>
      <Static>
        <Part geo={cyl(0.2, 0.16, 0.22, 20)} m={C.wicker} p={[0, 0.11, 0]} />
        <Part m={C.log} p={[0, 0.22, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.2, 0.015, 6, 24]} />
        </Part>
        {([[0.1, -0.09, C.wool], [-0.1, -0.1, C.pineLight]] as const).map(([x, z, m], i) => (
          <Part key={i} geo={SPH} m={m} scale={0.08} p={[x, 0.24, z]} />
        ))}
        {/* l'écharpe commencée, qui pend par-dessus le bord */}
        <Part geo={cyl(0.09, 0.09, 0.03, 4)} m={C.knit} p={[0.19, 0.16, 0.04]} rotation={[0, 0.3, 1.45]} scale={[1, 1, 0.35]} castShadow={false} />
      </Static>
      {/* la pelote qui se dévide : deux bandes de fil la font lire quand elle tourne */}
      <group ref={ball} position={[0.0, 0.26, 0.14]}>
        <Part geo={SPH} m={C.cranberry} scale={0.09} />
        {[0, 1].map((i) => (
          <Part key={i} m={C.cranberryLight} rotation={[Math.PI / 2 - 0.5 + i * 1.0, 0, i * 0.7]} castShadow={false}>
            <torusGeometry args={[0.09, 0.008, 6, 24]} />
          </Part>
        ))}
      </group>
      {/* les deux aiguilles, plantées dans le panier : ils se croisent au-dessus du bord */}
      <group ref={a} position={[-0.08, 0.2, 0.02]}>
        <Part geo={cyl(0.014, 0.01, 0.46, 8)} m={C.cut} p={[0, 0.23, 0]} castShadow={false} />
        <Part geo={SPH} m={C.gold} scale={0.017} p={[0, 0.47, 0]} castShadow={false} />
      </group>
      <group ref={b} position={[0.08, 0.2, 0.02]}>
        <Part geo={cyl(0.014, 0.01, 0.46, 8)} m={C.cut} p={[0, 0.23, 0]} castShadow={false} />
        <Part geo={SPH} m={C.gold} scale={0.017} p={[0, 0.47, 0]} castShadow={false} />
      </group>
      </group>
    </group>
  )
}
