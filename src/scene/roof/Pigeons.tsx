import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { Part, SPH, cyl } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { R } from './materials'

// Trois pigeons sur le parapet du fond : [x, orientation, déphasage].
const BIRDS = [[0.6, -0.4, 0], [1.1, 0.5, 1.3], [1.6, -1.0, 2.6]] as const

function Pigeon({ x, rot, ph, coo }: { x: number; rot: number; ph: number; coo: { current: boolean } }) {
  const body = useRef<Group>(null!), head = useRef<Group>(null!)
  useFrame(({ clock }) => {
    if (reduceMotion) return
    const t = clock.elapsedTime + ph, on = coo.current
    // le roucoulement : la gorge gonfle, la tête plonge et remonte ; sinon, de petits coups de tête
    const c = on ? Math.max(0, Math.sin(t * 2.4)) : 0
    body.current.scale.set(1, 1 + c * 0.12, 1 + c * 0.1)
    head.current.position.x = 0.11 + (on ? -c * 0.03 : Math.sin(t * 5) * 0.01 * (Math.sin(t * 0.7) > 0.6 ? 1 : 0))
    head.current.rotation.z = on ? -c * 0.5 : 0
    head.current.rotation.y = Math.sin(t * 0.6) * 0.5
  })
  return (
    <group position={[x, 1.02, -3.18]} rotation-y={rot} scale={1.45}>
      {[-0.025, 0.025].map((z) => (
        <Part key={z} geo={cyl(0.006, 0.006, 0.05, 4)} m={R.feet} p={[0, 0.025, z]} castShadow={false} />
      ))}
      <group ref={body}>
        <Part geo={SPH} m={R.pigeon} scale={[0.12, 0.08, 0.075]} p={[0, 0.1, 0]} rotation-z={0.15} />
        <Part geo={SPH} m={R.pigeonNeck} scale={[0.06, 0.06, 0.055]} p={[0.07, 0.15, 0]} castShadow={false} />
        {[-1, 1].map((s) => (
          <Part key={s} geo={SPH} m={R.pigeonDark} scale={[0.1, 0.035, 0.03]} p={[-0.02, 0.12, s * 0.05]} rotation-z={0.25} castShadow={false} />
        ))}
        <Part geo={SPH} m={R.pigeonDark} scale={[0.07, 0.015, 0.04]} p={[-0.13, 0.1, 0]} rotation-z={0.2} castShadow={false} />
      </group>
      <group ref={head} position={[0.11, 0.2, 0]}>
        <Part geo={SPH} m={R.pigeon} scale={0.045} />
        {[-1, 1].map((s) => (
          <Part key={s} geo={SPH} m={R.rust} scale={0.009} p={[0.018, 0.012, s * 0.035]} castShadow={false} />
        ))}
        <Part m={R.beak} p={[0.05, -0.005, 0]} rotation-z={-Math.PI / 2} castShadow={false}>
          <coneGeometry args={[0.01, 0.035, 6]} />
        </Part>
      </group>
    </group>
  )
}

/** Les pigeons du toit : quand on les écoute, ils roucoulent en gonflant la gorge. */
export function Pigeons() {
  const g = useRef<Group>(null!), coo = useRef(false)
  useSquash('pigeons', g)
  useFrame(() => void (coo.current = isActive(useStore.getState(), 'pigeons')))
  return (
    <group ref={g} userData={{ id: 'pigeons' }}>
      {BIRDS.map(([x, rot, ph]) => (
        <Pigeon key={x} x={x} rot={rot} ph={ph} coo={coo} />
      ))}
    </group>
  )
}
