import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { rand } from '../../math'
import { M } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'
import { useParticles, useSquash } from '../anim'
import { noteTexA, noteTexB } from '../textures'
import type { V3 } from '../parts'

/** Radio (sur le bureau par défaut) : cadran éclairé, antenne qui bouge, une note qui s'envole et une pulsation à chaque kick. */
export function Radio({ position = [1.9, 1.35, -2.55] }: { position?: V3 }) {
  const [px, py, pz] = position
  const g = useRef<Group>(null!), needle = useRef<Mesh>(null!), antenna = useRef<Group>(null!)
  const notes = useParticles()
  const beat = useRef({ seen: useStore.getState().kicks, at: -10, flip: false })
  useFrame(({ clock }) => {
    const s = useStore.getState(), on = isActive(s, 'radio'), t = clock.elapsedTime, b = beat.current
    if (s.kicks !== b.seen) {
      b.seen = s.kicks
      b.at = t
      if (on) {
        b.flip = !b.flip
        notes.emit(b.flip ? noteTexA : noteTexB, px + rand(-0.3, 0.3), py + 0.7, pz + 0.15, { size: 0.26, life: 2.6, vy: 0.55, sway: 0.12 })
      }
    }
    M.dial.emissiveIntensity = on ? 0.9 : 0.08
    needle.current.position.x = 0.1 + (on ? 0.1 + Math.sin(t * 0.3) * 0.02 : 0)
    antenna.current.rotation.z = 0.35 + (on ? Math.sin(t * 3.1) * 0.05 : 0)
  })
  useSquash('radio', g, (t) => (isActive(useStore.getState(), 'radio') ? Math.exp(-(t - beat.current.at) * 9) * 0.05 : 0))
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position}>
        <Part geo={rbox(0.84, 0.5, 0.36, 0.12)} m={M.mint} p={[0, 0.25, 0]} />
        {/* haut-parleur */}
        <Part m={M.mintDark} p={[-0.18, 0.24, 0.17]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.15, 0.15, 0.04, 28]} />
        </Part>
        <Part m={M.cream} p={[-0.18, 0.24, 0.19]}>
          <torusGeometry args={[0.15, 0.022, 10, 28]} />
        </Part>
        {/* cadran et aiguille */}
        <Part geo={rbox(0.3, 0.12, 0.04, 0.02)} m={M.dial} p={[0.18, 0.32, 0.18]} />
        <mesh ref={needle} geometry={rbox(0.014, 0.09, 0.02, 0.006)} material={M.red} position={[0.1, 0.32, 0.205]} castShadow receiveShadow />
        {[0.1, 0.27].map((x) => (
          <Part key={x} m={M.plum} p={[x, 0.15, 0.19]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.045, 0.045, 0.05, 18]} />
          </Part>
        ))}
        {/* poignée */}
        <Part m={M.plum} p={[0, 0.47, 0]}>
          <torusGeometry args={[0.22, 0.03, 10, 24, Math.PI]} />
        </Part>
        <group ref={antenna} position={[-0.3, 0.48, -0.08]} rotation-z={0.35}>
          <Part geo={cyl(0.012, 0.012, 0.62, 8)} m={M.plum} p={[0, 0.31, 0]} />
          <Part geo={SPH} m={M.pink} scale={0.035} p={[0, 0.63, 0]} />
        </group>
      </group>
      <group ref={notes.group} />
    </>
  )
}
