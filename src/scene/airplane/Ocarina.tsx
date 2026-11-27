import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { approach, rand } from '../../math'
import { isActive, useStore } from '../../state/store'
import { reduceMotion, useParticles, useSquash } from '../anim'
import { gummy } from '../materials'
import { Part, SPH, SPH_MID, cyl, rbox, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { noteTexA, noteTexB } from '../textures'

// L'ocarina en oiseau, de terre cuite émaillée : le corps en œuf, la tête ronde, le bec qui est l'embouchure, la queue relevée,
// les ailes peintes en bleu, les trous de jeu sur le dos ; un cordon tressé et son gland. Agrandi pour se lire de loin (40 cm).
const CLAY = gummy(0xd08a5c, { roughness: 0.4, clearcoat: 0.7, emissive: 0xd08a5c, emissiveIntensity: 0.06 })
const GLAZE = gummy(0x4f7fc8, { roughness: 0.3, clearcoat: 0.85, emissive: 0x4f7fc8, emissiveIntensity: 0.08 })
const CREAM = gummy(0xf6ead2, { roughness: 0.4, clearcoat: 0.6 })
const HOLE = gummy(0x3a2418, { roughness: 0.8, clearcoat: 0 })
const CORD = gummy(0xe8604a, { roughness: 0.85, clearcoat: 0 })
const SCARF = gummy(0xf2c9a0, { roughness: 0.95, clearcoat: 0 })
const SCARF_B = gummy(0xd88a6a, { roughness: 0.95, clearcoat: 0 })

/**
 * L'ocarina d'un passager, posé sur le siège du couloir de la rangée 2, sur une écharpe pliée : un oiseau d'argile cuite, ailes d'émail
 * bleu, trous de jeu, cordon rouge noué. Objet `ocarina`, son `ocarina` : à chaque note qu'on entend (le compteur `pulses.ocarina`),
 * l'oiseau se soulève et penche le bec, comme s'il chantait, et une note s'envole. `position` : le dessus de l'assise.
 */
export function Ocarina({ position, ry = 0 }: { position: V3; ry?: number }) {
  const root = useRef<Group>(null!), bird = useRef<Group>(null!)
  const notes = useParticles()
  const s = useRef({ last: -1, kick: 0, amp: 0, flip: false })
  useSquash('ocarina', root)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), S = s.current, st = useStore.getState(), on = isActive(st, 'ocarina')
    const n = st.pulses.ocarina ?? 0
    if (S.last < 0) S.last = n
    if (n !== S.last) {
      S.last = n
      if (on && !reduceMotion) {
        S.kick = 1
        S.flip = !S.flip
        notes.emit(S.flip ? noteTexA : noteTexB, position[0] + 0.1 + rand(-0.05, 0.08), position[1] + 0.42, position[2] + rand(-0.05, 0.1), { size: 0.2, life: 2.4, vy: 0.32, sway: 0.08 })
      }
    }
    S.kick = approach(S.kick, 0, dt * 2.2)
    S.amp = approach(S.amp, on && !reduceMotion ? 1 : 0, dt)
    bird.current.position.y = 0.03 + S.kick * 0.035
    bird.current.rotation.z = -S.kick * 0.12 - S.amp * 0.04
  })
  return (
    <>
      <group ref={root} position={position} rotation-y={ry} userData={{ id: 'ocarina' }}>
        <Static>
          {/* l'écharpe pliée en quatre sur l'assise, une rayure, un bout de frange */}
          <Part geo={rbox(0.5, 0.04, 0.42, 0.02)} m={SCARF} p={[0, 0.02, 0]} />
          <Part geo={rbox(0.5, 0.043, 0.07, 0.02)} m={SCARF_B} p={[0, 0.021, 0.11]} castShadow={false} />
          {[-0.16, -0.08, 0, 0.08, 0.16].map((x) => <Part key={x} geo={cyl(0.007, 0.007, 0.07, 4)} m={SCARF_B} p={[x, 0.01, 0.245]} rotation-x={Math.PI / 2} castShadow={false} />)}
        </Static>
        <group ref={bird} position={[0, 0.03, 0]} scale={1.4} userData={LIVE}>
          <Static>
            {/* le corps en œuf, la tête, le bec-embouchure vers +x, la queue relevée vers -x */}
            <Part geo={SPH_MID} m={CLAY} scale={[0.15, 0.09, 0.1]} p={[0, 0.09, 0]} />
            <Part geo={SPH_MID} m={CLAY} scale={0.065} p={[0.13, 0.15, 0]} />
            <Part geo={rbox(0.08, 0.035, 0.045, 0.015)} m={CREAM} p={[0.2, 0.14, 0]} rotation-z={-0.15} />
            <Part m={CLAY} p={[-0.16, 0.13, 0]} rotation-z={0.9}><coneGeometry args={[0.05, 0.12, 10]} /></Part>
            {/* les yeux, les ailes d'émail bleu sur les flancs, un liseré crème */}
            {[-1, 1].map((z) => (
              <group key={z}>
                <Part geo={SPH} m={HOLE} scale={0.012} p={[0.155, 0.17, z * 0.05]} castShadow={false} />
                <Part geo={SPH_MID} m={GLAZE} scale={[0.1, 0.05, 0.02]} p={[-0.02, 0.1, z * 0.088]} rotation-z={0.25} castShadow={false} />
                <Part geo={SPH} m={CREAM} scale={[0.03, 0.012, 0.012]} p={[0.05, 0.08, z * 0.096]} castShadow={false} />
              </group>
            ))}
            {/* les trous de jeu sur le dos (deux rangées de trois et deux pour les pouces) */}
            {[[-0.06, -0.035], [0, -0.04], [0.06, -0.035], [-0.06, 0.035], [0, 0.04], [0.06, 0.035]].map(([x, z], i) => (
              <Part key={i} geo={cyl(0.012, 0.012, 0.01, 10)} m={HOLE} p={[x, 0.09 + 0.09 * Math.sqrt(1 - (x / 0.15) ** 2 - (z / 0.1) ** 2) - 0.001, z]} castShadow={false} />
            ))}
            {/* le cordon noué à la queue, qui retombe sur l'écharpe, et son gland */}
            <Part m={CORD} p={[-0.17, 0.12, 0]} rotation-y={Math.PI / 2} castShadow={false}><torusGeometry args={[0.03, 0.006, 6, 14]} /></Part>
            <Part geo={cyl(0.006, 0.006, 0.12, 5)} m={CORD} p={[-0.2, 0.06, 0.03]} rotation-z={0.6} castShadow={false} />
            <Part m={CORD} p={[-0.24, 0.02, 0.05]} castShadow={false}><coneGeometry args={[0.018, 0.05, 8]} /></Part>
          </Static>
        </group>
      </group>
      <group ref={notes.group} />
    </>
  )
}
