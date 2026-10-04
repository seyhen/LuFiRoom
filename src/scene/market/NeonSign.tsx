import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type Mesh, type MeshBasicMaterial, type PointLight, type Sprite } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, smooth } from '../../math'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { mood, reduceMotion, useSquash } from '../anim'
import { glowTex } from '../textures'
import { K } from './materials'
import { neonOffTex, neonTex } from './textures'

/** L'enseigne en drapeau : où elle pend (au bout d'un bras scellé dans la façade, tournée vers la caméra). */
export const NEON = { x: -1.45, y: 2.5, z: -2.55 }

/**
 * L'enseigne « ラーメン » au néon, en drapeau sur la façade : un caisson noir, des tubes de verre roses. Éteinte elle est grise et
 * veille à peine ; allumée, elle bourdonne : le néon vacille, des coupures brèves l'éteignent un instant, et sa lumière rose
 * se pose sur le mur, les briques et l'appui de la baie.
 */
export function NeonSign() {
  const g = useRef<Group>(null!), lit = useRef<Mesh>(null!), glow = useRef<Sprite>(null!), light = useRef<PointLight>(null!), k = useRef(0)
  useSquash('neon', g)
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime, n = smooth(mood.night), on = isActive(useStore.getState(), 'neon')
    k.current = approach(k.current, on ? 1 : 0, Math.min(delta, 0.05) * 3)
    // le vacillement : un tremblement permanent, plus des coupures brèves (≈ toutes les 4 secondes)
    const dip = reduceMotion ? 0 : Math.max(0, Math.sin(t * 3.9) - 0.9) * 8 + Math.max(0, Math.sin(t * 11.3 + 1) - 0.97) * 14
    const flick = on ? Math.max(0.15, 1 - Math.min(1, dip) * 0.85 - (reduceMotion ? 0 : (Math.sin(t * 43) * 0.04 + 0.04))) : 1
    const base = 0.16 + 0.84 * k.current // veilleuse quand éteint
    const power = base * flick
    ;(lit.current.material as MeshBasicMaterial).opacity = power
    glow.current.material.opacity = power * (0.35 + 0.55 * n)
    light.current.intensity = power * (0.5 + 1.3 * n) * 1.6 * Math.PI
  })
  return (
    <>
      {/* le bras scellé dans la façade, et la platine */}
      <Part geo={rbox(0.05, 0.05, 0.5, 0.015)} m={K.iron} p={[NEON.x, NEON.y + 0.72, NEON.z - 0.22]} castShadow={false} />
      <Part geo={rbox(0.14, 0.2, 0.04, 0.015)} m={K.steelDark} p={[NEON.x, NEON.y + 0.72, -2.96]} castShadow={false} />
      <group position={[NEON.x, NEON.y, NEON.z]} rotation-y={Math.PI / 4}>
        <Part geo={cyl(0.008, 0.008, 0.1, 6)} m={K.iron} p={[0.22, 0.7, 0]} castShadow={false} />
        <Part geo={cyl(0.008, 0.008, 0.1, 6)} m={K.iron} p={[-0.22, 0.7, 0]} castShadow={false} />
      <group ref={g} userData={{ id: 'neon' }}>
        <Part geo={rbox(0.7, 1.34, 0.1, 0.04)} m={K.iron} />
        <mesh position={[0, 0, 0.056]} raycast={noRay}>
          <planeGeometry args={[0.62, 1.24]} />
          <meshBasicMaterial map={neonOffTex} transparent depthWrite={false} />
        </mesh>
        <mesh ref={lit} position={[0, 0, 0.062]} raycast={noRay}>
          <planeGeometry args={[0.62, 1.24]} />
          <meshBasicMaterial map={neonTex} transparent depthWrite={false} blending={AdditiveBlending} opacity={0.16} />
        </mesh>
        <Part geo={SPH} m={K.steelDark} scale={0.025} p={[0.3, 0.64, 0.05]} castShadow={false} />
        <Part geo={SPH} m={K.steelDark} scale={0.025} p={[-0.3, 0.64, 0.05]} castShadow={false} />
        <sprite ref={glow} scale={[1.7, 2.4, 1]} position={[0, 0, 0.12]} raycast={noRay}>
          <spriteMaterial map={glowTex} color={0xff3fa6} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
        </sprite>
        <pointLight ref={light} color={0xff3fa6} intensity={0} distance={5.5} decay={1.6} position={[0.1, -0.1, 0.8]} />
      </group>
      </group>
    </>
  )
}
