import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BackSide, MeshBasicMaterial, type Group, type Mesh } from 'three'
import { approach } from '../../math'
import { isActive, useStore } from '../../state/store'
import { gummy } from '../materials'
import { Part, SPH, cyl } from '../parts'
import { LIVE } from '../Static'
import { Vessel } from '../igloo/Vessel'
import { reduceMotion, useSquash } from '../anim'
import { A } from './materials'

const INNER = gummy(0xa87a2c, { roughness: 0.35, clearcoat: 0.6, side: BackSide })
const TOP = 0.2 // le dessus du coussin
const H = 0.1 // la hauteur du bol
const RINGS = [0, 1, 2].map(() => new MeshBasicMaterial({ color: 0xffd27a, transparent: true, depthWrite: false, opacity: 0, blending: AdditiveBlending }))
const PERIOD = 3.2 // secondes qu'un rond met à s'élargir et s'éteindre

/**
 * Le bol chantant sur son zafu (coussin rond) au milieu du tapis : un bol de laiton, un maillet de bois à tête de feutre posé à côté,
 * deux galets. Quand le son joue, le bol vibre à peine et des ronds de lumière s'élargissent autour de son bord, l'un après
 * l'autre. Phase cumulée image après image : rien ne saute à l'arrêt.
 */
export function SingingBowl({ position }: { position: [number, number, number] }) {
  const g = useRef<Group>(null!), bowl = useRef<Group>(null!), rings = useRef<(Mesh | null)[]>([])
  const st = useRef({ phase: 0, amp: 0 })
  useSquash('bowl', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current
    s.amp = approach(s.amp, isActive(useStore.getState(), 'bowl') && !reduceMotion ? 1 : 0, dt * 1.5)
    s.phase += dt * s.amp
    bowl.current.scale.setScalar(1 + 0.012 * s.amp * Math.sin(s.phase * 11))
    RINGS.forEach((m, i) => {
      const k = (s.phase / PERIOD + i / RINGS.length) % 1
      const r = rings.current[i]
      if (r) r.scale.setScalar(1 + 0.9 * k)
      m.opacity = 0.9 * s.amp * (1 - k) ** 1.5 * Math.min(1, k * 8)
    })
  })
  return (
    <group ref={g} userData={{ id: 'bowl' }} position={position}>
      {/* le zafu : un coussin rond et bombé, sa couture et son bouton */}
      <Part geo={cyl(0.27, 0.27, 0.04, 28)} m={A.prussian} p={[0, 0.02, 0]} />
      <Part geo={SPH} m={A.prussian} scale={[0.28, 0.1, 0.28]} p={[0, 0.1, 0]} />
      <Part m={A.cream} p={[0, 0.1, 0]} rotation-x={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.278, 0.006, 6, 32]} />
      </Part>
      <Part geo={SPH} m={A.cream} scale={[0.025, 0.012, 0.025]} p={[0, TOP - 0.004, 0]} castShadow={false} />
      {/* le bol : paroi de laiton, bande dorée, fond, ronds de vibration */}
      <group ref={bowl} position={[0, TOP + 0.01, 0]}>
        <Vessel p={[0, 0, 0]} rt={0.155} rb={0.085} h={H} m={A.brass} inner={INNER} />
        <Part m={A.ochreDeep} p={[0, 0.06, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.131, 0.005, 6, 32]} />
        </Part>
        <Part geo={cyl(0.07, 0.085, 0.02, 24)} m={A.brass} p={[0, 0.01, 0]} />
        {RINGS.map((m, i) => (
          <mesh key={i} ref={(r) => { rings.current[i] = r }} material={m} position={[0, H + 0.005, 0]} rotation-x={Math.PI / 2} userData={LIVE} renderOrder={2}>
            <torusGeometry args={[0.16, 0.007, 6, 40]} />
          </mesh>
        ))}
      </group>
      {/* le maillet posé sur le tapis : manche de chêne, tête de feutre */}
      <group position={[0.4, 0.03, 0.12]} rotation-y={-0.5}>
        <Part geo={cyl(0.011, 0.014, 0.2, 10)} m={A.oak} p={[0, 0, 0]} rotation-z={Math.PI / 2} />
        <Part geo={SPH} m={A.terracotta} scale={[0.035, 0.03, 0.03]} p={[-0.11, 0, 0]} />
      </group>
      {/* deux galets plats, le long du tapis */}
      <Part geo={SPH} m={A.stone} scale={[0.05, 0.02, 0.04]} p={[-0.38, 0.02, 0.22]} rotation-y={0.5} />
      <Part geo={SPH} m={A.stone} scale={[0.035, 0.015, 0.03]} p={[-0.3, 0.015, 0.33]} rotation-y={-0.3} />
    </group>
  )
}
