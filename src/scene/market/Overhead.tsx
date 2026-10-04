import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, CatmullRomCurve3, TubeGeometry, Vector3, type Group, type Sprite } from 'three'
import { smooth } from '../../math'
import { Part, SPH, cyl, noRay, type V3 } from '../parts'
import { mood, reduceMotion } from '../anim'
import { glowTex } from '../textures'
import { LIVE } from '../Static'
import { K } from './materials'
import { YATAI } from './Yatai'

const catenary = (a: V3, b: V3, sag: number, n: number): V3[] =>
  Array.from({ length: n }, (_, i) => {
    const u = i / (n - 1)
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - 4 * sag * u * (1 - u), a[2] + (b[2] - a[2]) * u]
  })

const POLE_L = YATAI.x - 1.12, POLE_R = YATAI.x + 1.12, BEAM = 2.55
const STRINGS: [V3, V3, number, number][] = [
  [[-2.93, 3.75, -1.7], [POLE_L, BEAM, YATAI.z - 0.52], 0.4, 7],
  [[-2.93, 3.85, 1.9], [POLE_L, BEAM, YATAI.z - 0.52], 0.5, 9],
  [[POLE_R, BEAM, YATAI.z - 0.52], [2.93, 3.6, -2.9], 0.3, 5],
]

/** Des guirlandes de lanternes en papier, rouges et blanches tour à tour, tendues entre les murs et les poteaux de la carriole. */
function Lanterns() {
  const halos = useRef<Sprite[]>([])
  const wires = useMemo(() => STRINGS.map(([a, b, sag]) => new TubeGeometry(new CatmullRomCurve3(catenary(a, b, sag, 14).map((p) => new Vector3(...p))), 28, 0.009, 4)), [])
  const all = useMemo(() => STRINGS.flatMap(([a, b, sag, n], s) => catenary(a, b, sag, n).slice(1, -1).map((p, i) => ({ p, white: (i + s) % 2 === 1, i: s * 10 + i }))), [])
  useFrame(({ clock }) => {
    const e = smooth(mood.night), t = clock.elapsedTime
    K.lanternWhite.emissiveIntensity = 0.15 + e * 1.0
    halos.current.forEach((h, i) => (h.material.opacity = (0.1 + e * 0.5) * (0.92 + (reduceMotion ? 0 : Math.sin(t * 1.7 + i) * 0.08))))
  })
  return (
    <>
      {wires.map((g, i) => (
        <Part key={i} geo={g} m={K.iron} castShadow={false} />
      ))}
      <group userData={LIVE}>
        {all.map(({ p, white }, i) => (
          <group key={i} position={p}>
            <Part geo={cyl(0.004, 0.004, 0.06, 4)} m={K.iron} p={[0, -0.03, 0]} castShadow={false} />
            <Part geo={SPH} m={white ? K.lanternWhite : K.lantern} scale={[0.085, 0.115, 0.085]} p={[0, -0.18, 0]} rotation-y={i} castShadow={false} />
            <Part geo={cyl(0.04, 0.04, 0.014, 10)} m={K.lanternCap} p={[0, -0.07, 0]} castShadow={false} />
            <Part geo={cyl(0.04, 0.04, 0.014, 10)} m={K.lanternCap} p={[0, -0.29, 0]} castShadow={false} />
            <sprite ref={(el) => void (el && (halos.current[i] = el))} scale={0.55} position={[0, -0.18, 0.03]} raycast={noRay}>
              <spriteMaterial map={glowTex} color={white ? 0xffe0a0 : 0xff6a4a} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.1} />
            </sprite>
          </group>
        ))}
      </group>
    </>
  )
}

/** Un nobori : une perche de bambou lestée d'une pierre, une traverse et une bannière rouge « ラーメン » qui ondule au vent. */
function Nobori({ position, ph }: { position: V3; ph: number }) {
  const flag = useRef<Group>(null!)
  useFrame(({ clock }) => {
    const t = reduceMotion ? 0 : clock.elapsedTime
    flag.current.rotation.y = Math.sin(t * 1.4 + ph) * 0.18 + Math.sin(t * 3.3 + ph * 2) * 0.05
    flag.current.rotation.z = Math.sin(t * 1.1 + ph) * 0.03
  })
  return (
    <group position={position}>
      <Part geo={cyl(0.13, 0.15, 0.1, 14)} m={K.steelDark} p={[0, 0.05, 0]} />
      <Part geo={cyl(0.016, 0.02, 2.3, 8)} m={K.woodPale} p={[0, 1.2, 0]} />
      <Part geo={cyl(0.012, 0.012, 0.36, 6)} m={K.woodPale} p={[0.16, 2.28, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      <group ref={flag} userData={LIVE} position={[0.16, 2.27, 0]}>
        <mesh material={K.nobori} position={[0, -0.62, 0]} castShadow>
          <planeGeometry args={[0.3, 1.2]} />
        </mesh>
      </group>
      <Part geo={SPH} m={K.woodPale} scale={0.025} p={[0, 2.36, 0]} castShadow={false} />
    </group>
  )
}

/**
 * Ce qui pend et flotte au-dessus des têtes : trois guirlandes de lanternes de papier entre les murs et la carriole, et deux nobori
 * rouges plantés au bout de la carriole.
 */
export function Overhead() {
  return (
    <>
      <Lanterns />
      <Nobori position={[2.85, 0, 0.55]} ph={0} />
      <Nobori position={[2.85, 0, 0.05]} ph={2.2} />
    </>
  )
}
