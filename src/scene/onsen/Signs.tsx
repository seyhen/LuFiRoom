import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, PlaneGeometry, type Group, type Points, type PointsMaterial } from 'three'
import { TAU, smooth } from '../../math'
import { canvasTex, seeded } from '../paint'
import { Part, SPH, cyl, noRay } from '../parts'
import { mood, reduceMotion, useWorldPointSize } from '../anim'
import { bulbGlowTex } from '../textures'
import { LIVE } from '../Static'
import { O } from './materials'

/** Le noren : rideau indigo fendu en deux, une bande rouge en haut, et le signe ゆ (« bain chaud ») en blanc, au pinceau. */
const norenTex = canvasTex(256, 256, (x) => {
  x.fillStyle = '#26365e'; x.fillRect(0, 0, 256, 256)
  x.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 256; i += 4) x.fillRect(i, 0, 1, 256)
  x.strokeStyle = '#f4efe6'; x.lineWidth = 15; x.lineCap = 'round'; x.lineJoin = 'round'
  // ゆ : un trait à gauche qui descend, une grande boucle, un trait central qui tombe en crochet
  x.beginPath(); x.moveTo(78, 86); x.bezierCurveTo(70, 130, 70, 170, 84, 182); x.stroke()
  x.beginPath(); x.moveTo(80, 112); x.bezierCurveTo(120, 70, 190, 78, 184, 128); x.bezierCurveTo(180, 170, 130, 168, 112, 150); x.stroke()
  x.beginPath(); x.moveTo(140, 70); x.bezierCurveTo(146, 120, 146, 170, 126, 206); x.stroke()
  x.fillStyle = '#c23a3a'; x.fillRect(0, 0, 256, 18)
})
const norenMat = O.yukata.clone()
norenMat.map = norenTex
// Chaque moitié montre sa moitié de l'image : le ゆ est coupé au milieu, comme sur un vrai noren.
const halfGeo = [0, 1].map((i) => {
  const g = new PlaneGeometry(0.5, 0.9, 1, 4), uv = g.attributes.uv
  for (let k = 0; k < uv.count; k++) uv.setX(k, uv.getX(k) * 0.5 + i * 0.5)
  return g
})

/** Le noren pendu sous l'avant-toit, à l'entrée de l'aile du ryokan : il ondule un peu. */
export function Noren() {
  const halves = useRef<Group[]>([])
  useFrame(({ clock }) => {
    if (reduceMotion) return
    const t = clock.elapsedTime
    halves.current.forEach((h, i) => (h.rotation.x = Math.sin(t * 1.3 + i * 1.7) * 0.06))
  })
  return (
    <group position={[-2.47, 2.92, 3.0]}>
      <Part geo={cyl(0.02, 0.02, 1.15, 8)} m={O.bambooDry} rotation-z={Math.PI / 2} castShadow={false} />
      {[-0.255, 0.255].map((x, i) => (
        <group key={x} ref={(el) => void (el && (halves.current[i] = el))} userData={LIVE} position={[x, 0, 0.01]}>
          <mesh geometry={halfGeo[i]} material={norenMat} position={[0, -0.45, 0]} castShadow />
        </group>
      ))}
    </group>
  )
}

/** Deux lanternes de papier rouge (chōchin) au bord de l'avant-toit, qui s'allument le soir et se balancent. */
export function Chochin() {
  const g = useRef<Group[]>([])
  useFrame(({ clock }) => {
    const e = smooth(mood.night), t = clock.elapsedTime
    O.chochin.emissiveIntensity = 0.1 + e * 0.9
    if (!reduceMotion) g.current.forEach((l, i) => (l.rotation.z = Math.sin(t * 1.1 + i * 2) * 0.05))
  })
  return (
    <>
      {[-0.9, 1.55].map((z, i) => (
        <group key={z} ref={(el) => void (el && (g.current[i] = el))} userData={LIVE} position={[-1.62, 3.08, z]}>
          <Part geo={cyl(0.004, 0.004, 0.18, 4)} m={O.ink} p={[0, -0.09, 0]} castShadow={false} />
          <Part geo={cyl(0.07, 0.07, 0.04, 14)} m={O.ink} p={[0, -0.2, 0]} castShadow={false} />
          <Part geo={SPH} m={O.chochin} scale={[0.15, 0.22, 0.15]} p={[0, -0.42, 0]} castShadow={false} />
          {[-0.3, -0.42, -0.54].map((y) => (
            <Part key={y} m={O.ink} p={[0, y, 0]} rotation-x={Math.PI / 2} castShadow={false}>
              <torusGeometry args={[0.145 * Math.cos(((y + 0.42) / 0.22) * 1.2), 0.004, 4, 20]} />
            </Part>
          ))}
          <Part geo={cyl(0.07, 0.07, 0.04, 14)} m={O.ink} p={[0, -0.64, 0]} castShadow={false} />
        </group>
      ))}
    </>
  )
}

const N = 22
/** Des lucioles, la nuit, qui flottent au-dessus du jardin et du bassin. */
export function Fireflies() {
  const pts = useRef<Points>(null!), mat = useRef<PointsMaterial>(null!)
  useWorldPointSize(mat, 0.26)
  const seeds = useMemo(() => {
    const r = seeded(9)
    return Array.from({ length: N }, () => [r() * 4.5 - 1.6, 0.5 + r() * 1.8, r() * 4.5 - 2.9, r() * TAU, 0.3 + r() * 0.5] as const)
  }, [])
  const geo = useMemo(() => new BufferGeometry().setAttribute('position', new Float32BufferAttribute(new Float32Array(N * 3), 3)), [])
  useFrame(({ clock }) => {
    const n = smooth(mood.night), t = clock.elapsedTime, p = geo.attributes.position
    mat.current.opacity = n * (0.6 + Math.sin(t * 3) * 0.2)
    pts.current.visible = n > 0.05
    seeds.forEach(([x, y, z, ph, sp], i) => {
      const k = reduceMotion ? 0 : t * sp + ph
      p.setXYZ(i, x + Math.sin(k) * 0.35, y + Math.sin(k * 1.7) * 0.18, z + Math.cos(k * 0.8) * 0.35)
    })
    p.needsUpdate = true
  })
  return (
    <points ref={pts} geometry={geo} userData={LIVE} raycast={noRay} frustumCulled={false}>
      <pointsMaterial ref={mat} map={bulbGlowTex} color={0xd8ff7a} sizeAttenuation={false} blending={AdditiveBlending} transparent depthWrite={false} />
    </points>
  )
}
