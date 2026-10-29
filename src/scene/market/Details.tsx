import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, Quaternion, Vector3, type BufferGeometry, type Group, type Mesh, type MeshBasicMaterial, type Sprite } from 'three'
import { smooth } from '../../math'
import { gummy, skin } from '../materials'
import { blob, cone, ell, pair } from '../blob'
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

const whiskerMat = gummy(0xd8cdf2, { roughness: 0.5 })
const eyeGlow = gummy(0xffe14a, { roughness: 0.3, emissive: 0xffd02a, emissiveIntensity: 0.8 }), pupil = gummy(0x1c1830, { roughness: 0.3 })
const roofSkin = skin({ roughness: 0.58 })

/**
 * Le chat noir d'une seule peau : le buste assis (immobile), la tête (qui tourne), la queue (qui balance), chacun un `blob`,
 * calculés une fois. Le visage regarde vers +z, le sol est à y = 0 ; la tête a son origine au centre du crâne, la queue à sa racine.
 */
const roofCat = (() => {
  let built: { body: BufferGeometry; head: BufferGeometry; tail: BufferGeometry; whiskers: { p: V3; q: Quaternion }[] } | null = null
  return () => {
    if (built) return built
    const BLACK = 0x3a3360, BIB = 0x6a5f96, EAR = 0x9a6a90
    const body = blob([
      ell([0, 0.11, -0.03], [0.16, 0.11, 0.17], { color: BLACK, k: 0.05 }),
      pair(ell([0.1, 0.1, 0.0], [0.075, 0.1, 0.14], { color: BLACK }), 'x'),
      ell([0, 0.25, 0], [0.12, 0.18, 0.11], { color: BLACK, rot: [-0.1, 0, 0] }),
      ell([0, 0.34, 0.015], [0.135, 0.1, 0.1], { color: BLACK, k: 0.05 }),
      ell([0, 0.25, 0.085], [0.07, 0.14, 0.045], { color: BIB, k: 0.03 }),
      pair(cone([0.05, 0.3, 0.06], [0.05, 0.035, 0.115], 0.04, 0.034, { color: BLACK }), 'x'),
      pair(ell([0.05, 0.022, 0.14], [0.04, 0.022, 0.05], { color: BLACK }), 'x'),
      pair(ell([0.115, 0.025, 0.06], [0.045, 0.025, 0.07], { color: BLACK }), 'x'),
    ], { h: 0.013, k: 0.04 })
    const hollow = [1, -1].map((s) => ell([s * 0.083, 0.112, 0.03], [0.026, 0.04, 0.028], { op: 'sub', k: 0.03 }))
    const pink = new Color(EAR)
    const head = blob([
      ell([0, 0, 0], [0.125, 0.1, 0.105], { color: BLACK, k: 0.04 }),
      pair(ell([0.075, -0.035, 0.045], [0.055, 0.045, 0.05], { color: BLACK }), 'x'),
      ell([0, -0.04, 0.088], [0.045, 0.033, 0.04], { color: BIB, k: 0.03 }),
      ell([0, -0.075, 0.06], [0.04, 0.03, 0.04], { color: BIB, k: 0.03 }),
      ell([0, -0.017, 0.123], [0.018, 0.013, 0.014], { color: EAR, k: 0.01 }),
      cone([0, -0.06, -0.02], [0, -0.17, -0.03], 0.075, 0.085, { color: BLACK }),
      ...[1, -1].map((s) => cone([s * 0.075, 0.065, -0.005], [s * 0.092, 0.165, -0.005], 0.054, 0.027, { color: BLACK, k: 0.03 })),
      ...hollow,
    ], {
      h: 0.011, k: 0.035,
      paint: (p, c) => {
        for (const s of [1, -1]) {
          const e = Math.hypot((p.x - s * 0.083) / 0.036, (p.y - 0.112) / 0.052, (p.z - 0.03) / 0.04)
          if (e < 1.05) { const t = Math.min(1, Math.max(0, (1.05 - e) / 0.35)); c.lerp(pink, t * t * (3 - 2 * t)) }
        }
        return c
      },
    })
    const T: V3[] = [[0, 0.04, -0.14], [0, 0.035, -0.24], [0, 0.08, -0.32], [0, 0.18, -0.35], [0, 0.29, -0.33], [0, 0.36, -0.28]]
    const tail = blob(T.slice(1).map((b, i) => cone(T[i], b, 0.04 - i * 0.002, 0.038 - i * 0.002, { color: BLACK, k: 0.03 })), { h: 0.012, k: 0.03 })
    tail.translate(-T[0][0], -T[0][1], -T[0][2])
    const up = new Vector3(0, 1, 0), whiskers: { p: V3; q: Quaternion }[] = []
    for (const s of [1, -1]) {
      for (const e of [0.18, -0.02, -0.2]) {
        const d = new Vector3(s, e, 0.35).normalize(), c = new Vector3(s * 0.05, -0.042 + e * 0.03, 0.1).addScaledVector(d, 0.04)
        whiskers.push({ p: [c.x, c.y, c.z], q: new Quaternion().setFromUnitVectors(up, d) })
      }
    }
    return (built = { body, head, tail, whiskers })
  }
})()
const ROOF_TAIL: V3 = [0, 0.04, -0.14]
const WHISKER = cyl(0.002, 0.0035, 0.08, 5)

/** Un chat noir assis sur l'arête du mur de gauche : il regarde la ruelle, bat de la queue, tourne la tête, cligne de ses yeux jaunes. */
function RoofCat({ position }: { position: V3 }) {
  const tail = useRef<Group>(null!), head = useRef<Group>(null!), eyes = useRef<Group>(null!)
  const cat = useMemo(roofCat, [])
  useFrame(({ clock }) => {
    const t = reduceMotion ? 0 : clock.elapsedTime
    tail.current.rotation.set(0, Math.sin(t * 1.6) * 0.26, Math.sin(t * 1.6 - 0.6) * 0.07)
    head.current.rotation.y = Math.sin(t * 0.3) * 0.5
    head.current.rotation.z = Math.sin(t * 0.2 + 1) * 0.05
    eyes.current.scale.y = reduceMotion ? 1 : Math.max(0.1, 1 - Math.max(0, Math.sin(t * 1.3 + 2) - 0.985) * 70)
  })
  return (
    <group position={position} rotation-y={0.9} userData={LIVE}>
      <Static>
        <mesh geometry={cat.body} material={roofSkin} castShadow receiveShadow />
      </Static>
      <group ref={head} userData={LIVE} position={[0, 0.47, 0.045]}>
        <mesh geometry={cat.head} material={roofSkin} />
        {cat.whiskers.map((w, i) => (
          <mesh key={i} geometry={WHISKER} material={whiskerMat} position={w.p} quaternion={w.q} />
        ))}
        <group ref={eyes} userData={LIVE}>
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.05, 0.014, 0.092]}>
              <Part geo={SPH} m={eyeGlow} scale={[0.026, 0.031, 0.014]} castShadow={false} />
              <Part geo={SPH} m={pupil} scale={[0.006, 0.026, 0.015]} p={[0, 0, 0.006]} castShadow={false} />
            </group>
          ))}
        </group>
      </group>
      <group ref={tail} userData={LIVE} position={ROOF_TAIL}>
        <mesh geometry={cat.tail} material={roofSkin} castShadow />
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
