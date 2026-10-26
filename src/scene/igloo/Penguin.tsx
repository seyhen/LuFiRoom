import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { rand } from '../../math'
import { gummy } from '../materials'
import { Part, SPH, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { reduceMotion } from '../anim'
import { I } from './materials'

/** Les deux pelages : rose bonbon, et bleu glacier. Le ventre crème, le bec et les pattes orange, pour tous les deux. */
// Une petite lueur de leur propre couleur : la nuit, la lumière bleue ferait virer le rose au violet.
const COATS = {
  pink: gummy(0xf29ac0, { roughness: 0.4, clearcoat: 0.7, emissive: 0xf29ac0, emissiveIntensity: 0.14 }),
  blue: gummy(0x6fa8e6, { roughness: 0.4, clearcoat: 0.7, emissive: 0x6fa8e6, emissiveIntensity: 0.1 }),
}
const belly = gummy(0xfff6ea, { roughness: 0.45, clearcoat: 0.6 })
const beak = gummy(0xf7a23a, { roughness: 0.35, clearcoat: 0.8 })
const cheek = gummy(0xff8fb0, { roughness: 0.5, clearcoat: 0.4 })

/**
 * Un manchot tout rond, pour le plaisir des yeux (pas de son) : un corps en œuf, un ventre crème, un gros bec orange arrondi, des
 * yeux brillants et deux joues roses, des ailerons et des pattes palmées. Il se dandine d'un pied sur l'autre, hoche la tête vers ce
 * qu'il regarde, et bat des ailerons de loin en loin.
 */
export function Penguin({ position, coat, ry = 0, s = 1 }: { position: V3; coat: keyof typeof COATS; ry?: number; s?: number }) {
  const body = useRef<Group>(null!), head = useRef<Group>(null!), wings = useRef<Group[]>([])
  const st = useRef({ ph: rand(0, 6), flap: 0, next: rand(4, 10) })
  const m = COATS[coat]
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), k = st.current
    if (reduceMotion) return
    k.ph += dt * 2.2
    k.next -= dt
    if (k.next <= 0) {
      k.flap = 1
      k.next = rand(6, 14)
    }
    k.flap = Math.max(0, k.flap - dt * 0.9)
    body.current.rotation.z = Math.sin(k.ph) * 0.06
    body.current.position.y = Math.abs(Math.sin(k.ph)) * 0.008
    head.current.rotation.x = 0.12 + Math.sin(k.ph * 0.5) * 0.08
    const f = Math.sin(k.flap * Math.PI * 6) * k.flap * 0.6
    wings.current.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * (0.18 + Math.max(0, f))))
  })
  return (
    <group position={position} rotation-y={ry} scale={s} userData={LIVE}>
      {/* les pattes palmées, posées sur la neige (elles ne bougent pas) */}
      <Static>
        {[-0.07, 0.07].map((x) => (
          <Part key={x} geo={SPH} m={beak} scale={[0.055, 0.018, 0.07]} p={[x, 0.016, 0.06]} castShadow={false} />
        ))}
      </Static>
      <group ref={body}>
        <Static>
          {/* le corps en œuf et son ventre crème */}
          <Part geo={SPH} m={m} scale={[0.19, 0.25, 0.17]} p={[0, 0.25, 0]} />
          <Part geo={SPH} m={belly} scale={[0.15, 0.2, 0.12]} p={[0, 0.23, 0.065]} />
          {/* la petite queue */}
          <Part geo={SPH} m={m} scale={[0.07, 0.03, 0.06]} p={[0, 0.06, -0.15]} rotation-x={0.5} castShadow={false} />
        </Static>
        {/* les ailerons, attachés à l'épaule */}
        {[-1, 1].map((sd, i) => (
          <group key={sd} ref={(el) => void (el && (wings.current[i] = el))} position={[sd * 0.17, 0.33, 0]}>
            <Part geo={SPH} m={m} scale={[0.03, 0.13, 0.07]} p={[sd * 0.02, -0.11, 0]} castShadow={false} />
          </group>
        ))}
        {/* la tête : ronde, fondue dans le corps. Le visage crème couvre tout le devant (sinon la calotte de couleur fait un casque),
            les yeux et les joues posés dessus, le bec */}
        <group ref={head} position={[0, 0.48, 0.01]}>
         <Static>
          <Part geo={SPH} m={m} scale={0.14} />
          <Part geo={SPH} m={belly} scale={[0.122, 0.118, 0.1]} p={[0, -0.012, 0.05]} castShadow={false} />
          {[-1, 1].map((sd) => (
            <group key={sd}>
              <Part geo={SPH} m={I.nose} scale={[0.019, 0.025, 0.012]} p={[sd * 0.048, 0.022, 0.142]} castShadow={false} />
              <Part geo={SPH} m={belly} scale={0.0065} p={[sd * 0.048 + 0.007, 0.032, 0.152]} castShadow={false} />
              <Part geo={SPH} m={cheek} scale={[0.02, 0.012, 0.009]} p={[sd * 0.074, -0.02, 0.13]} castShadow={false} />
            </group>
          ))}
          <Part geo={SPH} m={beak} scale={[0.034, 0.024, 0.048]} p={[0, -0.018, 0.165]} castShadow={false} />
         </Static>
        </group>
      </group>
    </group>
  )
}
