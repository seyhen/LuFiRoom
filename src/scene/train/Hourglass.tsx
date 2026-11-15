import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { smooth } from '../../math'
import { gummy } from '../materials'
import { Part, SPH, cyl } from '../parts'
import { LIVE } from '../Static'
import { reduceMotion, useSquash } from '../anim'
import { T } from './materials'

const SAND = gummy(0xe8cf98, { roughness: 0.95, clearcoat: 0 })
const FALL = 70 // secondes qu'il faut au sable pour passer d'un bulbe à l'autre
const FLIP = 1.1 // secondes que dure le retournement
const STREAM = cyl(0.003, 0.003, 0.075, 6)

/**
 * Le sablier de laiton sur la tablette, plus grand que nature : deux disques de laiton, trois colonnettes, deux bulbes de verre
 * et le sable fin. Quand le son joue, le sable coule d'un bulbe à l'autre en un filet (le tas du haut baisse, celui du bas
 * monte) ; quand le haut est vide, le sablier se retourne et recommence. À l'arrêt, il garde son sable tel quel.
 * Phase cumulée image après image : rien ne saute quand on l'arrête et le relance.
 */
export function Hourglass({ position }: { position: [number, number, number] }) {
  const g = useRef<Group>(null!), turn = useRef<Group>(null!), up = useRef<Mesh>(null!), down = useRef<Mesh>(null!), stream = useRef<Mesh>(null!)
  // u : la part de sable dans le bulbe du haut du repère du sablier ; n : le nombre de retournements ; flip : le temps du retournement en cours
  const st = useRef({ u: 0.8, n: 0, flip: -1 })
  useSquash('hourglass', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'hourglass') && !reduceMotion
    let falling = false
    if (s.flip >= 0) {
      s.flip += dt
      if (s.flip >= FLIP) s.flip = -1
    } else if (on) {
      falling = true
      // retournements pairs : le bulbe du haut du repère se vide ; impairs : il se remplit (il est alors en bas)
      s.u += (s.n % 2 === 0 ? -1 : 1) * (dt / FALL)
      if (s.u <= 0 || s.u >= 1) {
        s.u = Math.min(1, Math.max(0, s.u))
        s.n += 1
        s.flip = 0
        falling = false
      }
    }
    const k = s.flip >= 0 ? smooth(s.flip / FLIP) : 1
    turn.current.rotation.x = (s.n - 1 + k) * Math.PI
    const u = s.u, v = 1 - s.u
    up.current.scale.set(0.034 + 0.016 * u, 0.004 + 0.034 * u, 0.034 + 0.016 * u)
    up.current.position.y = 0.16 + 0.02 * u
    down.current.scale.set(0.034 + 0.016 * v, 0.004 + 0.034 * v, 0.034 + 0.016 * v)
    down.current.position.y = 0.025 + 0.021 * v
    stream.current.visible = falling && u > 0.02 && v > 0.02
  })
  return (
    <group ref={g} userData={{ id: 'hourglass' }} position={position}>
      <group ref={turn} position={[0, 0.15, 0]}>
        <group position={[0, -0.15, 0]}>
          {/* les deux disques de laiton, leur liseré doré, et trois colonnettes */}
          <Part geo={cyl(0.075, 0.08, 0.018, 24)} m={T.brass} p={[0, 0.009, 0]} />
          <Part geo={cyl(0.075, 0.075, 0.018, 24)} m={T.brass} p={[0, 0.291, 0]} />
          <Part geo={cyl(0.06, 0.06, 0.012, 24)} m={T.gold} p={[0, 0.024, 0]} castShadow={false} />
          <Part geo={cyl(0.06, 0.06, 0.012, 24)} m={T.gold} p={[0, 0.276, 0]} castShadow={false} />
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2 + 0.5
            return <Part key={i} geo={cyl(0.007, 0.007, 0.27, 8)} m={T.brass} p={[Math.cos(a) * 0.062, 0.15, Math.sin(a) * 0.062]} castShadow={false} />
          })}
          {/* le sable : le tas du bulbe du haut et celui du bas */}
          <mesh ref={up} geometry={SPH} material={SAND} userData={LIVE} />
          <mesh ref={down} geometry={SPH} material={SAND} userData={LIVE} />
          {/* les deux bulbes de verre, resserrés au col */}
          <Part geo={SPH} m={T.glass} scale={[0.056, 0.066, 0.056]} p={[0, 0.2, 0]} castShadow={false} />
          <Part geo={SPH} m={T.glass} scale={[0.056, 0.066, 0.056]} p={[0, 0.1, 0]} castShadow={false} />
          <Part geo={cyl(0.01, 0.01, 0.02, 8)} m={T.glass} p={[0, 0.15, 0]} castShadow={false} />
        </group>
      </group>
      {/* le filet de sable, du col au tas du bas : hors du groupe qui se retourne, il tombe toujours vers le bas */}
      <mesh ref={stream} geometry={STREAM} material={SAND} position={[0, 0.11, 0]} userData={LIVE} visible={false} />
    </group>
  )
}
