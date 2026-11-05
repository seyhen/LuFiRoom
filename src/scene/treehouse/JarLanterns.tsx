import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type Mesh, type PointLight, type Sprite } from 'three'
import { smooth } from '../../math'
import { SPH_MID as SPH } from '../igloo/spheres'
import { Part, cyl, noRay, type V3 } from '../parts'
import { Static } from '../Static'
import { mood, reduceMotion, useSquash } from '../anim'
import { glowTex } from '../textures'
import { T } from './materials'
import { roofY } from './layout'

/** La panne avant du toit, d'où pendent les bocaux : son dessous. */
const BEAM_Z = -1.42
const BEAM_Y = roofY(BEAM_Z) - 0.155
// les bocaux : [x, longueur de ficelle, taille]
const JARS: [number, number, number][] = [[-0.32, 0.36, 1], [0.02, 0.5, 1.15], [0.3, 0.26, 0.9]]
const JR = 0.068, JH = 0.17
/** Les bocaux sont un peu plus grands que nature, pour se lire de loin. */
const JAR_S = 1.5

/** Un bocal : le verre ouvert (on voit la bougie), son fond, sa bague vissée, l'anse de fil de fer, la ficelle, la bougie. */
function Jar({ x, drop, s }: { x: number; drop: number; s: number }) {
  const y = -drop - JH * s
  return (
    <group position={[x, 0, 0]}>
      <Part geo={cyl(0.009, 0.009, drop - 0.03, 4)} m={T.twine} p={[0, -(drop - 0.03) / 2, 0]} castShadow={false} />
      <group position={[0, y, 0]} scale={s}>
        <mesh material={T.jar} position={[0, JH / 2, 0]} raycast={noRay}>
          <cylinderGeometry args={[JR, JR, JH, 20, 1, true]} />
        </mesh>
        {/* l'épaule du bocal, sa bague de laiton, l'anse */}
        <mesh material={T.jar} position={[0, JH + 0.01, 0]} raycast={noRay}>
          <cylinderGeometry args={[JR * 0.82, JR, 0.03, 20, 1, true]} />
        </mesh>
        <Part geo={cyl(JR * 0.84, JR * 0.84, 0.03, 20)} m={T.lid} p={[0, JH + 0.035, 0]} castShadow={false} />
        <Part geo={cyl(JR * 0.6, JR * 0.6, 0.032, 20)} m={T.iron} p={[0, JH + 0.036, 0]} castShadow={false} />
        <Part m={T.iron} p={[0, JH + 0.04, 0]} castShadow={false}>
          <torusGeometry args={[JR * 0.85, 0.009, 5, 16, Math.PI]} />
        </Part>
        {/* le fond épais, la bougie et sa coulure */}
        <Part geo={cyl(JR, JR, 0.016, 20)} m={T.lid} p={[0, 0.008, 0]} castShadow={false} />
        <Part geo={cyl(0.032, 0.034, 0.07, 14)} m={T.wax} p={[0, 0.051, 0]} castShadow={false} />
        <Part geo={cyl(0.012, 0.01, 0.03, 8)} m={T.wax} p={[0.026, 0.07, 0]} castShadow={false} />
      </group>
    </group>
  )
}

/**
 * Les lanternes en bocal, pendues à la panne avant du toit par des ficelles de longueurs différentes : trois bocaux de verre et leur
 * bougie. C'est l'objet du jour / nuit. Le soir, les flammes grandissent, les bocaux luisent miel et font la lumière chaude de la cabane
 * (la seule lumière ponctuelle) ; le jour, les bougies sont éteintes et le verre prend le soleil.
 */
export function JarLanterns({ x = 0.75 }: { x?: number }) {
  const g = useRef<Group>(null!), light = useRef<PointLight>(null!)
  const flames = useRef<Mesh[]>([]), glows = useRef<Sprite[]>([])
  useSquash('lamp', g)
  useFrame(({ clock }) => {
    const e = smooth(mood.night), t = clock.elapsedTime
    const f = reduceMotion ? 0 : Math.sin(t * 6.7) * 0.05 + Math.sin(t * 11.3) * 0.03
    light.current.intensity = e * (1.5 + f) * Math.PI // × π : voir scene/materials.ts
    T.wax.emissiveIntensity = 0.05 + e * 0.45
    flames.current.forEach((m, i) => {
      m.visible = e > 0.05
      const k = 1 + (reduceMotion ? 0 : Math.sin(t * (7 + i) + i * 2) * 0.12)
      m.scale.set(0.014, (0.02 + e * 0.022) * k, 0.014)
    })
    glows.current.forEach((sp) => (sp.material.opacity = e * 0.75))
  })
  return (
    <group ref={g} userData={{ id: 'lamp' }} position={[x, BEAM_Y, BEAM_Z]}>
     <group scale={JAR_S}>
      <Static>
        {JARS.map(([jx, drop, s]) => <Jar key={jx} x={jx} drop={drop} s={s} />)}
        {/* les nœuds de ficelle autour de la panne */}
        {JARS.map(([jx]) => (
          <Part key={jx} m={T.twine} p={[jx, 0.07, 0]} rotation-y={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.08, 0.012, 5, 14]} />
          </Part>
        ))}
      </Static>
      {/* les flammes et leurs halos */}
      {JARS.map(([jx, drop, s], i) => {
        const y = -drop - JH * s + (0.09 + 0.022) * s
        return (
          <group key={jx}>
            <mesh ref={(m) => m && (flames.current[i] = m)} geometry={SPH} material={T.flame} position={[jx, y + 0.012, 0]} raycast={noRay} />
            <sprite ref={(m) => m && (glows.current[i] = m)} scale={0.62 * s} position={[jx, y, 0.03]} raycast={noRay}>
              <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
            </sprite>
          </group>
        )
      })}
     </group>
      <pointLight ref={light} color={0xffb466} intensity={0} distance={8} decay={1.3} position={[0, -1.1, 0.5]} />
    </group>
  )
}

/** Où pend le bouton des lanternes : sur le bocal du milieu. */
export const lanternAnchor = (x: number): V3 => [x, BEAM_Y - (JARS[1][1] + JH * JARS[1][2] * 0.5) * JAR_S, BEAM_Z]
