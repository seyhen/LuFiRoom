import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach, lerp } from '../../math'
import { gummy } from '../materials'
import { Part, SPH, cyl } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { O } from './materials'

/** La table de pierre du matcha, dans la cour de devant : son pied au sol (la table, le bol et le fouet). */
export const MATCHA = { x: -0.55, z: 1.95, top: 0.44 }
const tea = gummy(0x6f9a3c, { roughness: 0.4, clearcoat: 0.9 })
const froth = gummy(0xb4d878, { roughness: 0.9, clearcoat: 0.05 })

/**
 * La table de pierre où l'on bat le thé : un bol de céladon, du matcha, et le chasen de bambou. Quand le son joue, le fouet décrit de
 * petits cercles dans le bol, la tête penchée, et la mousse verte monte peu à peu ; à l'arrêt la mousse retombe et le fouet se couche
 * à côté du bol. Elle se tient dans la cour de devant, entre le seau et le panier de linge, loin du bassin.
 */
export function MatchaTable() {
  const g = useRef<Group>(null!), whisk = useRef<Group>(null!), foam = useRef<Mesh>(null!), st = useRef({ k: 0, a: 0, foam: 0.15 })
  useSquash('whisk', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'whisk')
    s.k = approach(s.k, on ? 1 : 0, dt * 1.6)
    s.foam = approach(s.foam, on ? 1 : 0.15, dt * (on ? 0.12 : 0.25))
    if (on && !reduceMotion) s.a += dt * 9 // phase image après image (le fouet bat plus vite quand on s'y met)
    const r = 0.045 * s.k
    whisk.current.position.set(lerp(0.22, Math.cos(s.a) * r, s.k), lerp(0.03, 0.2, s.k), lerp(-0.15, Math.sin(s.a) * r, s.k))
    whisk.current.rotation.set(lerp(1.5, 0, s.k) + 0.3 * s.k * Math.cos(s.a - 0.6), 0, 0.3 * s.k * Math.sin(s.a - 0.6))
    foam.current.scale.set(0.1 * (0.55 + 0.45 * s.foam), 0.005 + 0.04 * s.foam, 0.1 * (0.55 + 0.45 * s.foam))
    foam.current.visible = s.foam > 0.2
  })
  return (
    <group ref={g} userData={{ id: 'whisk' }} position={[MATCHA.x, 0, MATCHA.z]}>
      <Static>
        {/* la table : un fût de pierre et un plateau rond */}
        <Part geo={cyl(0.2, 0.25, 0.06, 20)} m={O.stone[1]} p={[0, 0.03, 0]} />
        <Part geo={cyl(0.13, 0.17, 0.34, 20)} m={O.stone[1]} p={[0, 0.23, 0]} />
        <Part geo={cyl(0.36, 0.33, 0.07, 28)} m={O.stone[0]} p={[0, MATCHA.top - 0.035, 0]} />
        {/* le bol : un pied, une panse évasée, un bord, le thé */}
        <group position={[0, MATCHA.top, 0]} scale={1.4}>
          <Part geo={cyl(0.06, 0.06, 0.02, 16)} m={O.ceramic} p={[0, 0.01, 0]} castShadow={false} />
          <Part geo={cyl(0.13, 0.075, 0.1, 26)} m={O.celadon} p={[0, 0.07, 0]} />
          <Part m={O.celadon} p={[0, 0.12, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.128, 0.012, 8, 28]} />
          </Part>
          <Part geo={cyl(0.116, 0.116, 0.008, 26)} m={tea} p={[0, 0.126, 0]} castShadow={false} />
        </group>
      </Static>
      <group position={[0, MATCHA.top, 0]} scale={1.4}>
        {/* la mousse, qui monte */}
        <mesh ref={foam} geometry={SPH} material={froth} position={[0, 0.134, 0]} scale={[0.06, 0.01, 0.06]} />
        {/* le chasen : manche de bambou, tête de fines baguettes, sa pointe à l'origine du groupe */}
        <group ref={whisk} position={[0.22, 0.03, -0.15]} rotation-x={1.5}>
          <Part geo={cyl(0.017, 0.02, 0.1, 10)} m={O.bambooDry} p={[0, 0.17, 0]} castShadow={false} />
          <Part geo={cyl(0.021, 0.021, 0.012, 10)} m={O.rope} p={[0, 0.115, 0]} castShadow={false} />
          <Part geo={SPH} m={O.bambooDry} scale={[0.05, 0.075, 0.05]} p={[0, 0.06, 0]} castShadow={false} />
          {Array.from({ length: 6 }, (_, i) => (
            <Part key={i} geo={cyl(0.003, 0.003, 0.1, 4)} m={O.bambooDry} p={[Math.cos((i / 6) * TAU) * 0.036, 0.045, Math.sin((i / 6) * TAU) * 0.036]} rotation={[Math.sin((i / 6) * TAU) * 0.25, 0, -Math.cos((i / 6) * TAU) * 0.25]} castShadow={false} />
          ))}
        </group>
      </group>
    </group>
  )
}
