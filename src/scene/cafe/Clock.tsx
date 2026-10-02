import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { TAU } from '../../math'
import { M } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'
import { K } from './materials'

/** Horloge ronde au mur : ses aiguilles donnent l'heure de l'appareil. */
export function Clock() {
  const hour = useRef<Group>(null!), minute = useRef<Group>(null!)
  useFrame(() => {
    const d = new Date(), m = d.getMinutes() + d.getSeconds() / 60
    minute.current.rotation.z = -(m / 60) * TAU
    hour.current.rotation.z = -(((d.getHours() % 12) + m / 60) / 12) * TAU
  })
  return (
    <group position={[-1.4, 3.95, -2.95]}>
      <Part geo={cyl(0.3, 0.3, 0.06, 32)} m={K.walnut} rotation-x={Math.PI / 2} />
      <Part geo={cyl(0.25, 0.25, 0.02, 32)} m={M.cream} p={[0, 0, 0.035]} rotation-x={Math.PI / 2} />
      {Array.from({ length: 12 }, (_, i) => (
        <Part key={i} geo={rbox(0.015, i % 3 ? 0.03 : 0.055, 0.01, 0.005)} m={M.plum} p={[Math.sin((i / 12) * TAU) * 0.2, Math.cos((i / 12) * TAU) * 0.2, 0.05]} rotation-z={-(i / 12) * TAU} />
      ))}
      <group ref={hour} position={[0, 0, 0.06]}>
        <Part geo={rbox(0.022, 0.12, 0.01, 0.008)} m={M.plum} p={[0, 0.05, 0]} />
      </group>
      <group ref={minute} position={[0, 0, 0.07]}>
        <Part geo={rbox(0.016, 0.18, 0.01, 0.006)} m={M.plum} p={[0, 0.08, 0]} />
      </group>
      <Part geo={SPH} m={K.brass} scale={0.02} p={[0, 0, 0.08]} />
    </group>
  )
}
