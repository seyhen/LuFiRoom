import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, CylinderGeometry, DoubleSide, type Group, type PointLight, type Sprite } from 'three'
import { TAU, smooth } from '../../math'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { mood, reduceMotion, useSquash } from '../anim'
import { glowTex } from '../textures'
import { LIVE } from '../Static'
import { S } from './materials'

/** La table ronde : son centre au sol et la hauteur du plateau. */
export const TABLE = { x: 0.8, z: -0.5, top: 0.8 }
// L'abat-jour : une demi-gouttière de verre vert, ouverte vers le bas et vers l'avant.
const shade = new CylinderGeometry(0.1, 0.1, 0.36, 20, 1, true, -Math.PI * 0.1, Math.PI * 1.2).rotateZ(Math.PI / 2)
const shadeMat = S.lampGlass.clone()
shadeMat.side = DoubleSide

/** La lampe de banquier : pied de laiton, tige, abat-jour vert bouteille, chaînette. Elle fait basculer jour / nuit et éclaire la table. */
function BankerLamp() {
  const g = useRef<Group>(null!), light = useRef<PointLight>(null!), glow = useRef<Sprite>(null!)
  useSquash('lamp', g)
  useFrame(({ clock }) => {
    const e = smooth(mood.night), f = 1 + (reduceMotion ? 0 : Math.sin(clock.elapsedTime * 5.3) * 0.012)
    light.current.intensity = e * 1.7 * f * Math.PI
    shadeMat.emissiveIntensity = 0.05 + e * 0.95
    glow.current.material.opacity = e * 0.7
  })
  return (
    <group ref={g} userData={{ id: 'lamp' }} position={[TABLE.x - 0.2, TABLE.top, TABLE.z - 0.05]} rotation-y={0.55}>
      <Part geo={cyl(0.13, 0.15, 0.04, 22)} m={S.brass} p={[0, 0.02, 0]} />
      <Part geo={cyl(0.1, 0.12, 0.05, 22)} m={S.brassDull} p={[0, 0.065, 0]} castShadow={false} />
      <Part geo={cyl(0.017, 0.022, 0.3, 10)} m={S.brass} p={[0, 0.22, 0]} />
      <Part geo={SPH} m={S.brass} scale={0.04} p={[0, 0.38, 0]} castShadow={false} />
      {/* le bras et l'abat-jour, couché le long de x, qui penche vers l'avant */}
      <group position={[0, 0.42, 0]} rotation-z={0.04}>
        <Part geo={cyl(0.012, 0.012, 0.1, 6)} m={S.brass} p={[0, -0.02, 0]} castShadow={false} />
        <mesh geometry={shade} material={shadeMat} position={[0, 0.06, 0]} castShadow />
        <Part geo={cyl(0.1, 0.1, 0.015, 20)} m={S.brass} p={[-0.18, 0.06, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.1, 0.1, 0.015, 20)} m={S.brass} p={[0.18, 0.06, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={rbox(0.26, 0.01, 0.02, 0.004)} m={S.brassDull} p={[0, -0.02, 0.06]} castShadow={false} />
      </group>
      {/* la chaînette d'interrupteur */}
      <Part geo={cyl(0.004, 0.004, 0.12, 4)} m={S.brassDull} p={[0.1, 0.33, 0.08]} castShadow={false} />
      <Part geo={SPH} m={S.brass} scale={0.014} p={[0.1, 0.27, 0.08]} castShadow={false} />
      <pointLight ref={light} color={0xffd9a0} intensity={0} distance={6} decay={1.5} position={[0, 0.45, 0.14]} />
      <sprite ref={glow} scale={1.5} position={[0, 0.45, 0.1]} raycast={noRay}>
        <spriteMaterial map={glowTex} color={0xbfffd0} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}

/** Deux poissons rouges qui tournent dans le bocal, en sens contraire ; l'eau est dans `Part`s, eux seuls bougent. */
function Goldfish() {
  const fish = useRef<Group[]>([])
  useFrame(({ clock }) => {
    const t = reduceMotion ? 0 : clock.elapsedTime
    fish.current.forEach((f, i) => {
      const a = t * (0.55 + i * 0.12) * (i ? -1 : 1) + i * 2.4, r = 0.085 + i * 0.015
      f.position.set(Math.cos(a) * r, 0.19 + Math.sin(t * 0.8 + i * 3) * 0.025 + i * 0.03, Math.sin(a) * r)
      f.rotation.y = -a + (i ? -Math.PI / 2 : Math.PI / 2)
      f.children[1].rotation.y = Math.sin(t * 8 + i) * 0.4
    })
  })
  return (
    <group userData={LIVE}>
      {[0, 1].map((i) => (
        <group key={i} ref={(el) => void (el && (fish.current[i] = el))}>
          <Part geo={SPH} m={S.fish} scale={[0.04, 0.024, 0.02]} castShadow={false} />
          <group position={[-0.036, 0, 0]}>
            <Part geo={SPH} m={S.fish} scale={[0.03, 0.026, 0.006]} p={[-0.02, 0, 0]} castShadow={false} />
          </group>
        </group>
      ))}
    </group>
  )
}

/**
 * La table ronde du carré, sur son pied de laiton : la lampe de banquier, un bocal à poissons rouges (sable, rocaille, algue), un
 * livre de bord ouvert et une tasse. Le plateau est d'acajou ; on le contourne en tournant sur le tapis.
 */
export function Table() {
  const { x, z, top } = TABLE
  return (
    <>
      <Part geo={cyl(0.62, 0.62, 0.06, 40)} m={S.wood} p={[x, top - 0.03, z]} />
      <Part geo={cyl(0.64, 0.64, 0.03, 40)} m={S.brass} p={[x, top - 0.075, z]} castShadow={false} />
      <Part geo={cyl(0.075, 0.1, top - 0.1, 16)} m={S.brass} p={[x, (top - 0.1) / 2, z]} />
      <Part geo={cyl(0.12, 0.12, 0.05, 20)} m={S.brassDull} p={[x, 0.32, z]} castShadow={false} />
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * TAU + 0.4
        return (
          <group key={i} position={[x, 0, z]} rotation-y={-a}>
            <Part geo={rbox(0.5, 0.05, 0.07, 0.02)} m={S.brass} p={[0.22, 0.05, 0]} rotation-z={-0.04} />
            <Part geo={SPH} m={S.brass} scale={[0.06, 0.05, 0.06]} p={[0.46, 0.05, 0]} castShadow={false} />
          </group>
        )
      })}
      <BankerLamp />
      {/* le bocal : sable, rocaille, algue ; eau et verre transparents ; deux poissons rouges */}
      <group position={[x + 0.24, top, z + 0.12]}>
        <Part geo={cyl(0.1, 0.12, 0.03, 20)} m={S.woodDark} p={[0, 0.015, 0]} castShadow={false} />
        <Part geo={SPH} m={S.water} scale={[0.155, 0.135, 0.155]} p={[0, 0.17, 0]} castShadow={false} />
        <Part geo={SPH} m={S.glass} scale={[0.17, 0.15, 0.17]} p={[0, 0.17, 0]} castShadow={false} />
        <Part geo={cyl(0.11, 0.11, 0.026, 20)} m={S.cream} p={[0, 0.045, 0]} castShadow={false} />
        <Part geo={SPH} m={S.steel} scale={[0.035, 0.025, 0.03]} p={[0.04, 0.06, 0.03]} castShadow={false} />
        <Part geo={cyl(0.003, 0.004, 0.12, 4)} m={S.verdigris} p={[-0.05, 0.11, -0.03]} rotation-z={0.15} castShadow={false} />
        <Part geo={cyl(0.003, 0.004, 0.09, 4)} m={S.verdigris} p={[-0.03, 0.1, -0.05]} rotation-z={-0.2} castShadow={false} />
        <Part geo={cyl(0.075, 0.07, 0.014, 18)} m={S.glass} p={[0, 0.3, 0]} castShadow={false} />
        <Goldfish />
      </group>
      {/* un livre de bord ouvert et une tasse */}
      <group position={[x - 0.05, top, z + 0.3]} rotation-y={-0.3}>
        <Part geo={rbox(0.3, 0.025, 0.22, 0.01)} m={S.leatherDark} p={[0, 0.0125, 0]} castShadow={false} />
        <Part geo={rbox(0.14, 0.018, 0.2, 0.006)} m={S.paper} p={[-0.075, 0.034, 0]} rotation-z={0.06} castShadow={false} />
        <Part geo={rbox(0.14, 0.018, 0.2, 0.006)} m={S.paper} p={[0.075, 0.034, 0]} rotation-z={-0.06} castShadow={false} />
      </group>
      <group position={[x + 0.35, top, z - 0.28]}>
        <Part geo={cyl(0.07, 0.07, 0.012, 20)} m={S.cream} p={[0, 0.006, 0]} castShadow={false} />
        <Part geo={cyl(0.04, 0.034, 0.07, 16)} m={S.cream} p={[0, 0.047, 0]} />
        <Part m={S.cream} p={[0.045, 0.05, 0]} castShadow={false}>
          <torusGeometry args={[0.02, 0.006, 6, 12, Math.PI * 1.2]} />
        </Part>
      </group>
    </>
  )
}
