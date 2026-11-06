import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, CircleGeometry, Color, DoubleSide, MeshBasicMaterial, Object3D, PlaneGeometry, type InstancedMesh } from 'three'
import { TAU, rand, smooth } from '../../math'
import { mood, reduceMotion } from '../anim'
import { noRay } from '../parts'
import { seeded } from '../paint'
import { LAMP_A, LAMP_B, RD, SW } from './streetKit'
import { tickStreetMaterials } from './streetMaterials'
import { gutterTex, poolTex, ringTex, streakTex } from './streetTex'

// Le temps qu'il fait dans la rue, dehors seulement (le café est un lieu couvert : rien ne tombe dedans) : la pierre qui fonce,
// le caniveau qui coule, les flaques et les ronds qu'y font les gouttes, les filets de pluie autour du diorama, les flaques de
// lumière du soir sur le pavé mouillé.

/** Le caniveau : l'eau court toujours un peu ; la pluie la fait grossir et courir plus vite. */
export const gutter = new MeshBasicMaterial({ map: gutterTex, transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
const puddleMat = new MeshBasicMaterial({ color: 0xb9c6d4, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 })
const ringMat = new MeshBasicMaterial({ map: ringTex, color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, blending: AdditiveBlending })
const rainMat = new MeshBasicMaterial({ map: streakTex, color: 0xdce6f2, transparent: true, opacity: 0, depthWrite: false, side: DoubleSide })
const poolMat = new MeshBasicMaterial({ map: poolTex, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending })

/** [x, z, demi-longueur, demi-largeur, angle, sur le trottoir ?] : les flaques. */
const PUDDLES: [number, number, number, number, number, boolean][] = [
  [-1.3, 4.3, 0.62, 0.24, 0.05, true],
  [-7.7, 4.15, 0.7, 0.22, -0.04, true],
  [4.35, 1.4, 0.24, 0.55, 0.1, true],
  [-1.5, 6.0, 1.0, 0.38, 0.06, false],
  [2.9, 6.45, 0.74, 0.3, -0.2, false],
  [-6.5, 5.95, 1.25, 0.42, 0.03, false],
  [-10.0, 6.5, 0.85, 0.3, 0, false],
  [6.5, 1.2, 0.36, 0.95, 0.08, false],
  [6.95, -1.9, 0.4, 1.0, 0, false],
  [6.1, 3.9, 0.3, 0.6, 0.35, false],
]

const dummy = new Object3D()
const disc = new CircleGeometry(1, 28)
const quad = new PlaneGeometry(1, 1)
const pool = new PlaneGeometry(1, 1)

/** La silhouette du café à l'écran (un hexagone) : ce qui est devant s'efface en y entrant, pour que rien ne « tombe dans la pièce ». */
function fadeInHex(x: number, y: number, z: number) {
  if ((x + 0.8 * y + z) / 1.6248 <= 1) return 1
  const sx = Math.abs((x - z) * 0.7071), sy = 0.8704 * y - 0.348 * (x + z)
  const m = Math.min(4.8 - sx, (6.2 - 0.494 * sx - sy) / 1.115, (sy + 2.98 - 0.494 * sx) / 1.115)
  return 1 - Math.min(1, Math.max(0, m / 0.6))
}

const RAIN = { n: 170, x: [-13, 10], z: [-7, 10], y: [RD, 9.5] }
const INSIDE = { x: [-3.8, 3.7], z: [-3.8, 3.7] }

export function StreetWeather() {
  const puddles = useRef<InstancedMesh>(null!), rings = useRef<InstancedMesh>(null!), rain = useRef<InstancedMesh>(null!), pools = useRef<InstancedMesh>(null!)
  const flow = useRef(0)

  // les flaques, posées une fois
  useLayoutEffect(() => {
    PUDDLES.forEach(([x, z, rx, rz, a, slab], i) => {
      dummy.position.set(x, (slab ? SW : RD) + 0.008, z)
      dummy.rotation.set(-Math.PI / 2, 0, a)
      dummy.scale.set(rx, rz, 1)
      dummy.updateMatrix()
      puddles.current.setMatrixAt(i, dummy.matrix)
    })
    puddles.current.instanceMatrix.needsUpdate = true
    puddles.current.computeBoundingSphere()
  }, [])
  // les flaques de lumière : deux sous les lampadaires, deux devant le café (sa chaleur déborde sur le trottoir)
  useLayoutEffect(() => {
    const c = new Color()
    const list: [number, number, number, number, number, number, number][] = [
      [LAMP_A[0], LAMP_A[1] - 0.2, 3.4, 3.4, 0.8, 0.9, 1],
      [LAMP_B[0], LAMP_B[1] + 0.2, 3.4, 3.4, 0.8, 0.9, 1],
      [0.0, 4.15, 7.4, 2.2, 1, 0.62, 0.3],
      [4.15, 0.2, 2.2, 7.4, 1, 0.62, 0.3],
    ]
    list.forEach(([x, z, w, d, r, g, b], i) => {
      dummy.position.set(x, SW + 0.012, z)
      dummy.rotation.set(-Math.PI / 2, 0, 0)
      dummy.scale.set(w, d, 1)
      dummy.updateMatrix()
      pools.current.setMatrixAt(i, dummy.matrix)
      // le lampadaire est froid, la devanture chaude
      pools.current.setColorAt(i, c.setRGB(i < 2 ? 0.6 : r, i < 2 ? 0.74 : g, i < 2 ? 1 : b))
    })
    pools.current.instanceMatrix.needsUpdate = true
    if (pools.current.instanceColor) pools.current.instanceColor.needsUpdate = true
    pools.current.computeBoundingSphere()
  }, [])

  const ripples = useMemo(() => {
    const r = seeded(77), out: { x: number; y: number; z: number; ph: number; per: number; max: number }[] = []
    PUDDLES.forEach(([x, z, rx, rz, , slab], i) => {
      const n = Math.max(2, Math.round(rx * rz * 7))
      for (let k = 0; k < n; k++) {
        const a = r() * TAU, d = Math.sqrt(r()) * 0.7
        out.push({ x: x + Math.cos(a) * rx * d, y: (slab ? SW : RD) + 0.012, z: z + Math.sin(a) * rz * d, ph: r() * 3, per: 0.9 + r() * 0.8, max: 0.12 + r() * 0.1 + i * 0 })
      }
    })
    return out
  }, [])
  const drops = useMemo(
    () => Array.from({ length: RAIN.n }, () => {
      let x = 0, z = 0
      do { x = rand(RAIN.x[0], RAIN.x[1]); z = rand(RAIN.z[0], RAIN.z[1]) } while (x > INSIDE.x[0] && x < INSIDE.x[1] && z > INSIDE.z[0] && z < INSIDE.z[1])
      return { x, y: rand(RAIN.y[0], RAIN.y[1]), z, v: rand(8, 11), len: rand(0.5, 0.9) }
    }),
    [],
  )
  const col = useMemo(() => new Color(), [])
  const A = useMemo(() => new Color(), []), Bc = useMemo(() => new Color(), [])
  useFrame(({ clock }, delta) => {
    const dt = reduceMotion ? 0 : Math.min(delta, 0.05), w = smooth(mood.rain), n = smooth(mood.night), t = clock.elapsedTime
    tickStreetMaterials()
    // le caniveau
    flow.current += dt * (0.18 + w * 0.7)
    gutterTex.offset.y = -flow.current
    gutter.opacity = 0.34 + w * 0.6
    gutter.color.setScalar(1 - n * 0.72)
    // les flaques : elles naissent avec la pluie ; leur teinte est celle du ciel (clair le jour, bleu la nuit)
    puddleMat.color.copy(A.set(0xb9c6d4)).lerp(Bc.set(0x2f3a66), n)
    puddleMat.opacity = w * (0.62 - n * 0.05) * (1 - mood.snow * 0.9)
    puddles.current.visible = puddleMat.opacity > 0.01
    // les flaques de lumière
    poolMat.opacity = n * 0.5 * (0.7 + w * 0.5) + w * 0.06
    pools.current.visible = poolMat.opacity > 0.01
    // les ronds dans l'eau
    const rainOn = !reduceMotion && w > 0.02
    rings.current.visible = rainOn && puddles.current.visible
    rain.current.visible = rainOn
    if (!rainOn) return
    ringMat.opacity = 0.28 + n * 0.5
    ripples.forEach((p, i) => {
      const k = ((t / p.per + p.ph) % 1 + 1) % 1
      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.set(-Math.PI / 2, 0, 0)
      dummy.scale.setScalar(0.02 + p.max * k)
      dummy.updateMatrix()
      rings.current.setMatrixAt(i, dummy.matrix)
      const f = (1 - k) * (1 - k) * Math.min(1, k * 8) * w
      rings.current.setColorAt(i, col.setScalar(f))
    })
    rings.current.instanceMatrix.needsUpdate = true
    if (rings.current.instanceColor) rings.current.instanceColor.needsUpdate = true
    // la pluie autour du diorama : des filets qui tombent, effacés dès qu'ils passent devant la salle
    rainMat.opacity = Math.min(1, w * 1.1) * (0.45 - n * 0.12) * (1 - mood.snow)
    const speed = 1 + mood.storm * 0.5
    drops.forEach((d, i) => {
      d.y -= d.v * speed * dt
      if (d.y < RD) d.y += RAIN.y[1] - RD
      const k = fadeInHex(d.x, d.y, d.z) * Math.min(1, (d.y - RD) / 0.5)
      dummy.position.set(d.x, d.y, d.z)
      dummy.rotation.set(0, Math.PI / 4, 0)
      dummy.scale.set(0.034, d.len * k, 1)
      dummy.updateMatrix()
      rain.current.setMatrixAt(i, dummy.matrix)
    })
    rain.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <instancedMesh ref={puddles} args={[disc, puddleMat, PUDDLES.length]} raycast={noRay} renderOrder={2} />
      <instancedMesh ref={pools} args={[pool, poolMat, 4]} raycast={noRay} renderOrder={3} />
      <instancedMesh ref={rings} args={[quad, ringMat, ripples.length]} frustumCulled={false} raycast={noRay} renderOrder={4} />
      <instancedMesh ref={rain} args={[quad, rainMat, RAIN.n]} frustumCulled={false} raycast={noRay} renderOrder={5} />
    </>
  )
}
