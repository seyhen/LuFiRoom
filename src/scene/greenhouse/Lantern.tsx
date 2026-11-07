import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type PointLight, type Sprite } from 'three'
import { glowTex } from '../textures'
import { smooth } from '../../math'
import { mood, useSquash } from '../anim'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { G } from './materials'

/**
 * La lanterne de jardin : un pied de fonte à trois griffes, une colonne cannelée, une cage de laiton et de verre où brûle une
 * bougie, un toit en chapeau chinois et son anneau. Objet « jour / nuit » : le soir, la flamme s'allume, un halo doré et une lumière
 * chaude éclairent le fauteuil et la table de lecture. `position` est le sol.
 */
export function Lantern({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), light = useRef<PointLight>(null!), glow = useRef<Sprite>(null!)
  useSquash('lamp', g)
  useFrame(() => {
    const e = smooth(mood.night)
    light.current.intensity = (0.25 + e * 1.8) * Math.PI
    G.lanternGlass.emissiveIntensity = 0.1 + e * 1.1
    glow.current.material.opacity = 0.2 + e * 0.65
  })
  return (
    <group ref={g} userData={{ id: 'lamp' }} position={position}>
      <Static>
        {[0, 1, 2].map((i) => (
          <group key={i} rotation-y={(i / 3) * Math.PI * 2}>
            <Part geo={rbox(0.2, 0.035, 0.05, 0.015)} m={G.ironDark} p={[0.1, 0.04, 0]} rotation-z={0.25} castShadow={false} />
          </group>
        ))}
        <Part geo={cyl(0.055, 0.075, 0.1, 12)} m={G.ironDark} p={[0, 0.1, 0]} />
        <Part geo={cyl(0.026, 0.034, 1.0, 12)} m={G.iron} p={[0, 0.65, 0]} />
        <Part geo={cyl(0.045, 0.045, 0.03, 12)} m={G.brass} p={[0, 0.5, 0]} castShadow={false} />
        <Part geo={cyl(0.05, 0.05, 0.03, 12)} m={G.brass} p={[0, 1.12, 0]} castShadow={false} />
        {/* la cage : un plateau de laiton, quatre montants, le toit */}
        <Part geo={rbox(0.26, 0.03, 0.26, 0.012)} m={G.brass} p={[0, 1.16, 0]} />
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => <Part key={`${sx}${sz}`} geo={cyl(0.01, 0.01, 0.34, 6)} m={G.brass} p={[sx * 0.11, 1.34, sz * 0.11]} castShadow={false} />)}
        <Part geo={rbox(0.3, 0.03, 0.3, 0.012)} m={G.brass} p={[0, 1.52, 0]} castShadow={false} />
        <Part m={G.ironDark} p={[0, 1.62, 0]}>
          <coneGeometry args={[0.24, 0.16, 4]} />
        </Part>
        <Part geo={SPH} m={G.brass} scale={0.03} p={[0, 1.72, 0]} castShadow={false} />
        <Part m={G.brass} p={[0, 1.76, 0]} castShadow={false}>
          <torusGeometry args={[0.03, 0.007, 6, 12]} />
        </Part>
        {/* la bougie dans la cage, sur une soucoupe */}
        <Part geo={cyl(0.04, 0.04, 0.012, 14)} m={G.cream} p={[0, 1.19, 0]} castShadow={false} />
        <Part geo={cyl(0.022, 0.022, 0.12, 12)} m={G.cream} p={[0, 1.255, 0]} castShadow={false} />
      </Static>
      {/* les vitres de la cage : un verre doré qui s'allume le soir */}
      <mesh material={G.lanternGlass} position={[0, 1.34, 0]} raycast={noRay}>
        <boxGeometry args={[0.22, 0.34, 0.22]} />
      </mesh>
      <sprite ref={glow} position={[0, 1.34, 0]} scale={1.8} raycast={noRay}>
        <spriteMaterial map={glowTex} transparent depthWrite={false} blending={AdditiveBlending} opacity={0.2} />
      </sprite>
      <pointLight ref={light} color={0xffc070} intensity={0} distance={7.5} decay={1.4} position={[0, 1.34, 0]} />
    </group>
  )
}
