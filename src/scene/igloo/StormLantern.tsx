import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type Mesh, type PointLight, type Sprite } from 'three'
import { smooth } from '../../math'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { mood, reduceMotion, useSquash } from '../anim'
import { glowTex } from '../textures'
import { I } from './materials'

/**
 * La lampe tempête, posée sur la caisse du fond : son réservoir, son verre bombé dans sa cage, son chapeau et son anse. C'est
 * l'objet du jour / nuit. Le soir, sa flamme grandit et elle fait la lumière chaude de l'igloo (la seule lumière de la pièce) ;
 * le jour, une petite flamme veille.
 */
export function StormLantern({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), light = useRef<PointLight>(null!), glow = useRef<Sprite>(null!), flame = useRef<Mesh>(null!)
  useSquash('lamp', g)
  useFrame(({ clock }) => {
    const e = smooth(mood.night), t = clock.elapsedTime
    const f = reduceMotion ? 0 : Math.sin(t * 7.3) * 0.05 + Math.sin(t * 12.1) * 0.03
    light.current.intensity = (0.25 + e * 1.55 + f) * Math.PI // × π : voir materials.ts
    glow.current.material.opacity = 0.15 + e * 0.6
    I.lampGlass.emissiveIntensity = 0.12 + e * 0.9 + f
    flame.current.scale.set(0.022, (0.04 + e * 0.03) * (1 + f * 2), 0.022)
  })
  return (
    <group ref={g} userData={{ id: 'lamp' }} position={position}>
      <group scale={1.2}>
        {/* le réservoir, sa bague */}
        <Part geo={cyl(0.1, 0.11, 0.08, 24)} m={I.rust} p={[0, 0.04, 0]} />
        <Part geo={cyl(0.075, 0.1, 0.03, 24)} m={I.darkSteel} p={[0, 0.095, 0]} castShadow={false} />
        {/* le verre et sa flamme */}
        <Part geo={SPH} m={I.lampGlass} scale={[0.07, 0.1, 0.07]} p={[0, 0.2, 0]} castShadow={false} />
        <mesh ref={flame} geometry={SPH} material={I.flame} position={[0, 0.19, 0]} scale={[0.022, 0.05, 0.022]} raycast={noRay} />
        {/* la cage de fil autour du verre */}
        {[0, 1, 2, 3].map((i) => (
          <Part key={i} geo={cyl(0.006, 0.006, 0.22, 6)} m={I.darkSteel} p={[Math.cos((i * Math.PI) / 2) * 0.078, 0.2, Math.sin((i * Math.PI) / 2) * 0.078]} castShadow={false} />
        ))}
        {/* le chapeau, sa cheminée percée, l'anse */}
        <Part geo={cyl(0.04, 0.095, 0.05, 24)} m={I.rust} p={[0, 0.325, 0]} />
        <Part geo={cyl(0.03, 0.03, 0.04, 12)} m={I.darkSteel} p={[0, 0.37, 0]} castShadow={false} />
        <Part m={I.darkSteel} p={[0, 0.36, 0]} castShadow={false}>
          <torusGeometry args={[0.1, 0.007, 6, 24, Math.PI]} />
        </Part>
        {/* le bouton de la mèche */}
        <Part geo={rbox(0.03, 0.03, 0.03, 0.008)} m={I.brass} p={[0.1, 0.1, 0]} castShadow={false} />
      </group>
      <pointLight ref={light} color={0xffb466} intensity={0} distance={7} decay={1.4} position={[0, 0.45, 0.25]} />
      <sprite ref={glow} scale={1.1} position={[0, 0.25, 0.05]} raycast={noRay}>
        <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}
