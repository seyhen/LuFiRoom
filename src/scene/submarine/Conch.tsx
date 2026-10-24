import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type Sprite } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { Part, SPH, cyl } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { noRay } from '../parts'
import { Static } from '../Static'
import { glowTex } from '../textures'
import { S } from './materials'

/** La conque sur son piédestal, à l'avant gauche : son pied au sol. */
export const CONCH = { x: -1.2, z: 2.1, top: 0.77 }

/**
 * La grande conque : un piédestal de cuivre vert-de-gris, et dessus un coquillage à la nacre rose, la bouche tournée vers la pièce.
 * Quand le son joue (la mer qu'on entend dans un coquillage), une lueur nacrée respire dans son ouverture et sur sa lèvre, et un halo
 * doux l'accompagne. Au repos, elle ne fait que luire à peine.
 */
export function Conch() {
  const g = useRef<Group>(null!), halo = useRef<Sprite>(null!), st = useRef({ k: 0, ph: 0 })
  useSquash('shell', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'shell')
    s.k = approach(s.k, on ? 1 : 0, dt * 0.8)
    if (!reduceMotion) s.ph += dt * (0.5 + s.k * 0.7) // la respiration ralentit au repos : phase ajoutée image après image
    const breath = reduceMotion ? 0.6 : 0.5 + 0.5 * Math.sin(s.ph * 2.1)
    S.pearlGlow.emissiveIntensity = 0.12 + s.k * (0.35 + 0.9 * breath)
    halo.current.material.opacity = s.k * (0.25 + 0.55 * breath)
    halo.current.scale.setScalar(0.55 + 0.25 * breath * s.k)
  })
  return (
    <group ref={g} userData={{ id: 'shell' }} position={[CONCH.x, 0, CONCH.z]}>
      <Static>
        {/* le piédestal : une base large, un fût qui s'évase, une coupe de laiton */}
        <Part geo={cyl(0.3, 0.33, 0.08, 28)} m={S.hullDark} p={[0, 0.04, 0]} />
        <Part geo={cyl(0.15, 0.2, 0.62, 24)} m={S.verdigris} p={[0, 0.39, 0]} />
        <Part geo={cyl(0.19, 0.17, 0.035, 24)} m={S.band} p={[0, 0.2, 0]} castShadow={false} />
        <Part geo={cyl(0.25, 0.18, 0.07, 28)} m={S.band} p={[0, CONCH.top - 0.035, 0]} />
        {/* la conque, couchée : le tour de spire à gauche, la bouche vers +z puis +x */}
        <group position={[0, CONCH.top, 0]} rotation-y={0.6} scale={1.3}>
          <Part geo={SPH} m={S.pearl} scale={[0.2, 0.13, 0.14]} p={[0, 0.13, 0]} />
          <Part geo={SPH} m={S.pearl} scale={[0.12, 0.11, 0.11]} p={[-0.17, 0.15, 0]} />
          <Part geo={SPH} m={S.pearl} scale={0.08} p={[-0.27, 0.17, 0]} />
          <Part geo={SPH} m={S.pearl} scale={0.055} p={[-0.33, 0.19, 0]} castShadow={false} />
          <Part geo={SPH} m={S.pearlLip} scale={0.032} p={[-0.37, 0.205, 0]} castShadow={false} />
          {/* la couronne de bosses sur l'épaule */}
          {[-0.2, -0.14, -0.07, -0.01].map((x, i) => (
            <Part key={i} geo={SPH} m={S.pearlLip} scale={[0.032, 0.04, 0.032]} p={[x, 0.255 - i * 0.004, 0.02]} castShadow={false} />
          ))}
          {/* la lèvre corail, qui encadre la bouche */}
          <Part m={S.pearlLip} p={[0.07, 0.135, 0.1]} scale={[1.15, 0.7, 1]} castShadow={false}>
            <torusGeometry args={[0.1, 0.026, 10, 28]} />
          </Part>
        </group>
      </Static>
      {/* l'intérieur de la bouche : il rougeoit */}
      <group position={[0, CONCH.top, 0]} rotation-y={0.6} scale={1.3}>
        <Part geo={SPH} m={S.pearlGlow} scale={[0.105, 0.065, 0.04]} p={[0.07, 0.135, 0.105]} castShadow={false} />
        <sprite ref={halo} position={[0.1, 0.17, 0.2]} scale={0.55} raycast={noRay}>
          <spriteMaterial map={glowTex} color={0xffb8d0} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
        </sprite>
      </group>
    </group>
  )
}
