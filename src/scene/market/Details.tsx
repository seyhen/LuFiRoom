import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type Mesh, type MeshBasicMaterial, type Sprite } from 'three'
import { smooth } from '../../math'
import { gummy } from '../materials'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { mood, reduceMotion, useParticles } from '../anim'
import { glowTex, mistTex } from '../textures'
import { LIVE, Static } from '../Static'
import { K } from './materials'
import { smallNeon } from './textures'

const rand = (a: number, b: number) => a + Math.random() * (b - a)

/** La plaque d'égout, au milieu de l'allée, et la vapeur épaisse qui s'en échappe par moments (brume rose sous les enseignes). */
function Manhole({ position }: { position: V3 }) {
  const mist = useParticles(), since = useRef(0)
  useFrame((_, delta) => {
    if (reduceMotion) return
    since.current += Math.min(delta, 0.05)
    if (since.current > 1.0) {
      since.current = 0
      mist.emit(mistTex, position[0] + rand(-0.06, 0.06), 0.06, position[2] + rand(-0.06, 0.06), { size: 0.7, life: 4.5, vy: 0.26, sway: 0.16, grow: 2.0, peak: 0.7, color: 0xe6d4ff, soft: true })
    }
  })
  return (
    <>
      <group position={position}>
        <mesh material={K.manhole} position={[0, 0.014, 0]} rotation-x={-Math.PI / 2} receiveShadow>
          <circleGeometry args={[0.36, 32]} />
        </mesh>
        <Part geo={cyl(0.385, 0.385, 0.012, 32)} m={K.steelDark} p={[0, 0.006, 0]} castShadow={false} />
      </group>
      <group ref={mist.group} />
    </>
  )
}

/** Un petit néon en drapeau, perpendiculaire au mur : caisson sombre, tubes de couleur qui vacillent chacun à son rythme. */
function Blade({ position, lines, color, glow, ph, w = 0.34, h = 0.68 }: { position: V3; lines: string[]; color: string; glow: string; ph: number; w?: number; h?: number }) {
  const tex = useMemo(() => smallNeon(lines, color, glow), [lines, color, glow])
  const lit = useRef<Mesh>(null!), halo = useRef<Sprite>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, n = smooth(mood.night)
    const dip = reduceMotion ? 0 : Math.max(0, Math.sin(t * 2.3 + ph) - 0.93) * 10 + Math.max(0, Math.sin(t * 9.1 + ph * 3) - 0.98) * 18
    const p = Math.max(0.2, 1 - Math.min(1, dip) * 0.8) * (0.55 + 0.45 * n)
    ;(lit.current.material as MeshBasicMaterial).opacity = p
    halo.current.material.opacity = p * (0.2 + 0.5 * n)
  })
  return (
    <group position={position}>
      <Part geo={rbox(0.04, 0.04, 0.3, 0.012)} m={K.iron} p={[0, h / 2 + 0.06, -0.15]} rotation-y={Math.PI / 2} castShadow={false} />
      <group userData={LIVE}>
        <Part geo={rbox(w + 0.06, h + 0.06, 0.06, 0.025)} m={K.iron} />
        <mesh ref={lit} position={[0, 0, 0.036]} raycast={noRay}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} transparent depthWrite={false} blending={AdditiveBlending} opacity={0.5} />
        </mesh>
        <sprite ref={halo} scale={[w * 3.2, h * 2.4, 1]} position={[0, 0, 0.1]} raycast={noRay}>
          <spriteMaterial map={glowTex} color={glow} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.2} />
        </sprite>
      </group>
    </group>
  )
}

const furBlack = gummy(0x3a3360, { roughness: 0.6, clearcoat: 0.3 }), furBib = gummy(0x4a4266, { roughness: 0.6, clearcoat: 0.2 }), furEar = gummy(0x7a4a70, { roughness: 0.6, clearcoat: 0.2 })
const eyeGlow = gummy(0xffe14a, { roughness: 0.3, emissive: 0xffd02a, emissiveIntensity: 0.8 })

/** Un chat noir assis sur l'arête du mur de gauche : il regarde la ruelle, bat de la queue, tourne la tête, cligne de ses yeux jaunes. */
function RoofCat({ position }: { position: V3 }) {
  const tail = useRef<Group[]>([]), head = useRef<Group>(null!), eyes = useRef<Group>(null!)
  useFrame(({ clock }) => {
    const t = reduceMotion ? 0 : clock.elapsedTime
    tail.current.forEach((s, i) => s.position.set(Math.sin(t * 1.6 - i * 0.55) * 0.03 * i, 0.02 + i * 0.024 + Math.sin(t * 1.6 - i * 0.5) * 0.006 * i, -0.024 * (i + 1)))
    head.current.rotation.y = Math.sin(t * 0.3) * 0.5
    head.current.rotation.z = Math.sin(t * 0.2 + 1) * 0.05
    eyes.current.scale.y = reduceMotion ? 1 : Math.max(0.1, 1 - Math.max(0, Math.sin(t * 1.3 + 2) - 0.985) * 70)
  })
  return (
    <group position={position} rotation-y={0.9} userData={LIVE}>
      <Static>
        {/* assis, vu de trois quarts : cuisses repliées, buste, plastron plus clair, deux pattes avant bien droites, pattes arrière */}
        <Part geo={SPH} m={furBlack} scale={[0.14, 0.11, 0.17]} p={[0, 0.11, -0.02]} />
        <Part geo={SPH} m={furBlack} scale={[0.1, 0.17, 0.1]} p={[0, 0.26, 0.02]} />
        <Part geo={SPH} m={furBib} scale={[0.055, 0.1, 0.03]} p={[0, 0.26, 0.108]} castShadow={false} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <Part geo={cyl(0.03, 0.036, 0.2, 10)} m={furBlack} p={[s * 0.052, 0.1, 0.1]} castShadow={false} />
            <Part geo={SPH} m={furBlack} scale={[0.04, 0.024, 0.055]} p={[s * 0.052, 0.014, 0.125]} castShadow={false} />
            <Part geo={SPH} m={furBlack} scale={[0.045, 0.025, 0.06]} p={[s * 0.11, 0.02, 0.05]} castShadow={false} />
          </group>
        ))}
      </Static>
      <group ref={head} userData={LIVE} position={[0, 0.5, 0.04]}>
        <Static>
          <Part geo={SPH} m={furBlack} scale={[0.115, 0.1, 0.1]} />
          {[-1, 1].map((s) => (
            <group key={s}>
              <Part geo={SPH} m={furBlack} scale={[0.04, 0.032, 0.04]} p={[s * 0.085, -0.035, 0.04]} castShadow={false} />
              <Part geo={cyl(0.002, 0.052, 0.11, 4)} m={furBlack} p={[s * 0.07, 0.11, -0.005]} rotation-z={s * -0.18} castShadow={false} />
              <Part geo={cyl(0.002, 0.03, 0.075, 4)} m={furEar} p={[s * 0.069, 0.1, 0.015]} rotation-z={s * -0.18} castShadow={false} />
            </group>
          ))}
          <Part geo={SPH} m={furBib} scale={[0.04, 0.027, 0.025]} p={[0, -0.04, 0.092]} castShadow={false} />
          <Part geo={SPH} m={furEar} scale={0.01} p={[0, -0.025, 0.115]} castShadow={false} />
        </Static>
        <group ref={eyes} userData={LIVE}>
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.048, 0.012, 0.088]}>
              <Part geo={SPH} m={eyeGlow} scale={[0.021, 0.026, 0.012]} castShadow={false} />
              <Part geo={SPH} m={furBlack} scale={[0.005, 0.022, 0.013]} p={[0, 0, 0.005]} castShadow={false} />
            </group>
          ))}
        </group>
      </group>
      <group position={[0, 0.05, -0.17]}>
        {Array.from({ length: 10 }, (_, i) => (
          <group key={i} ref={(el) => void (el && (tail.current[i] = el))}>
            <Part geo={SPH} m={furBlack} scale={0.05 - i * 0.002} castShadow={false} />
          </group>
        ))}
      </group>
    </group>
  )
}

/**
 * Les détails qui font vivre l'allée : la plaque d'égout qui fume, un petit néon « BAR » au-dessus du distributeur, un autre
 * « 営業中 » (ouvert) près de la baie, et le chat noir du quartier perché sur l'arête du mur.
 */
export function Details() {
  return (
    <>
      <Manhole position={[-0.55, 0, 0.55]} />
      <Blade position={[-2.72, 3.1, -1.55]} lines={['B', 'A', 'R']} color="#a8f6ff" glow="#22d3ee" ph={1} />
      <Blade position={[-0.3, 2.75, -2.72]} lines={['営', '業', '中']} color="#ffe9a8" glow="#ffb020" ph={4} w={0.3} h={0.62} />
      <RoofCat position={[-2.93, 4.31, 0.2]} />
    </>
  )
}
