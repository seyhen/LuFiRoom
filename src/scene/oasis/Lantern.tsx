import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type Mesh, type PointLight, type Sprite } from 'three'
import { approach, smooth } from '../../math'
import { isActive, useStore } from '../../state/store'
import { glowTex } from '../textures'
import { mood, reduceMotion, useSquash } from '../anim'
import { Part, SPH, cyl, noRay, type V3 } from '../parts'
import { Static } from '../Static'
import { BEAM } from './Awning'
import { D } from './materials'

/** Le crochet de la lanterne, sur la poutre de l'auvent (un peu devant la toile). */
export const HOOK: V3 = [BEAM[0] + 0.1, BEAM[1] - 0.08, -1.7]
// le corps de la lanterne pend de 0,55 sous le crochet : son centre, pour le bouton et la lueur
const BODY_Y = -0.62

/**
 * La lanterne (objet « jour / nuit ») : un fanous de laiton ajouré, huit pans percés d'arcs, de croissants et d'étoiles, un toit
 * d'octogone et son bouton, une bague et une goutte en bas, une chaîne qui pend de la poutre de l'auvent. Le jour, le laiton
 * brille doucement ; la nuit la lumière passe par tous les trous (émission de la texture), un halo l'entoure, une lumière ambrée
 * éclaire le campement (et une seconde, douce, vient de l'avant : sans elle, tout ce qui regarde la caméra reste dans le noir) et des
 * étoiles de lumière se posent sur le sable dessous. Elle se balance à peine, davantage quand le vent des dunes souffle.
 */
export function Lantern() {
  const g = useRef<Group>(null!), sway = useRef<Group>(null!), light = useRef<PointLight>(null!), bounce = useRef<PointLight>(null!)
  const glow = useRef<Sprite>(null!), cast = useRef<Mesh>(null!), st = useRef({ ph: 0, ph2: 0, wind: 0 })
  useSquash('lamp', g)
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, e = smooth(mood.night)
    s.wind = approach(s.wind, isActive(useStore.getState(), 'awning') ? 1 : 0, dt * 0.5)
    s.ph += dt * (0.85 + s.wind * 0.5)
    s.ph2 += dt * (1.3 + s.wind * 0.6)
    const a = reduceMotion ? 0 : 0.016 + 0.03 * s.wind
    sway.current.rotation.set(Math.sin(s.ph2) * a * 0.8, 0, Math.sin(s.ph) * a)
    const f = 1 + (reduceMotion ? 0 : Math.sin(clock.elapsedTime * 6.1) * 0.04 + Math.sin(clock.elapsedTime * 9.7) * 0.025)
    light.current.intensity = e * 1.8 * Math.PI * f
    bounce.current.intensity = (0.05 + e * 0.95) * Math.PI
    D.lantern.emissiveIntensity = 0.04 + e * 1.5 * f
    glow.current.material.opacity = 0.06 + e * 0.6
    // les étoiles de lumière sur le sable : elles tournent doucement avec la balançoire de la lanterne
    D.lanternCast.opacity = e * 0.45 * (1 - mood.rain * 0.2)
    cast.current.visible = e > 0.02
    cast.current.rotation.z = Math.sin(s.ph) * a * 6
  })
  return (
    <>
      <group ref={g} userData={{ id: 'lamp' }} position={HOOK}>
        <group ref={sway}>
          <Static>
            {/* le crochet de fer et la chaîne : des maillons (anneaux) entre la poutre et la bague */}
            <Part m={D.iron} p={[0, 0.0, 0]} rotation-x={Math.PI / 2} castShadow={false}><torusGeometry args={[0.04, 0.009, 6, 14]} /></Part>
            {[0, 1, 2, 3].map((i) => (
              <Part key={i} m={D.iron} p={[0, -0.07 - i * 0.075, 0]} rotation-y={i % 2 ? Math.PI / 2 : 0} castShadow={false}><torusGeometry args={[0.026, 0.007, 6, 10]} /></Part>
            ))}
            {/* le toit : un octogone de laiton qui s'effile jusqu'au bouton où s'accroche la chaîne, et sa bague */}
            <Part m={D.brass} p={[0, -0.36, 0]} rotation-y={Math.PI / 8}><coneGeometry args={[0.15, 0.13, 8]} /></Part>
            <Part geo={cyl(0.12, 0.125, 0.025, 8)} m={D.brassDull} p={[0, -0.4375, 0]} castShadow={false} />
            <Part geo={SPH} m={D.brass} scale={[0.03, 0.036, 0.03]} p={[0, -0.3, 0]} castShadow={false} />
            {/* les huit arêtes du corps (huit fines baguettes) */}
            {Array.from({ length: 8 }, (_, k) => {
              const a = (k / 8) * Math.PI * 2, r = 0.117
              return <Part key={k} geo={cyl(0.008, 0.008, 0.36, 5)} m={D.brass} p={[Math.sin(a) * r, BODY_Y, Math.cos(a) * r]} castShadow={false} />
            })}
            {/* le socle : une corolle de laiton, une goutte renversée et un petit bouton */}
            <Part geo={cyl(0.1, 0.115, 0.03, 8)} m={D.brassDull} p={[0, -0.815, 0]} castShadow={false} />
            <Part m={D.brass} p={[0, -0.885, 0]} rotation-x={Math.PI}><coneGeometry args={[0.07, 0.11, 8]} /></Part>
            <Part geo={SPH} m={D.brass} scale={0.024} p={[0, -0.95, 0]} castShadow={false} />
          </Static>
          {/* le corps : huit pans percés, que la nuit éclaire de l'intérieur */}
          <Part geo={cyl(0.1, 0.112, 0.34, 8)} m={D.lantern} p={[0, BODY_Y, 0]} rotation-y={0} />
          <sprite ref={glow} position={[0, BODY_Y, 0]} scale={1.6} raycast={noRay} renderOrder={4}>
            <spriteMaterial map={glowTex} color={0xffbf70} transparent depthWrite={false} blending={AdditiveBlending} opacity={0.1} />
          </sprite>
          <pointLight ref={light} color={0xffb066} intensity={0} distance={10} decay={1.3} position={[0, BODY_Y, 0]} />
          {/* le reflet de l'avant : une seconde lumière douce côté caméra, qui sort du noir ce qui nous regarde */}
          <pointLight ref={bounce} color={0xffc890} intensity={0} distance={11} decay={1.3} position={[2.6, BODY_Y + 0.5, 2.9]} />
        </group>
      </group>
      {/* les étoiles de lumière au sol (additives, juste au-dessus du sable) */}
      <mesh ref={cast} material={D.lanternCast} position={[HOOK[0], 0.016, HOOK[2]]} rotation-x={-Math.PI / 2} raycast={noRay} renderOrder={2}>
        <planeGeometry args={[2.3, 2.3]} />
      </mesh>
    </>
  )
}
