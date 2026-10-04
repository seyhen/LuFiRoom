import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, MeshBasicMaterial, Object3D, SphereGeometry, type InstancedMesh } from 'three'
import { isActive, useStore } from '../state/store'
import { TAU, rand, smooth } from '../math'
import { mood, reduceMotion } from './anim'
import { noRay } from './parts'

const dot = new SphereGeometry(1, 6, 4)
const dummy = new Object3D()

interface Flake {
  x: number
  y: number
  z: number
  v: number
  s: number
  ph: number
}

// Le volume de la pièce (socle compris) : la neige n'y entre pas, elle se pose sur le toit invisible.
const INSIDE = { x: [-3.5, 3.4], z: [-3.5, 3.4], top: 4.5 }
const SNOW = { n: 150, x: [-7.5, 7.5], z: [-7.5, 7.5], y: [-1.7, 8.2] }
const snowMat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false })

/** La neige qui tombe autour de la cabane, comme dans une boule à neige. Le vent (la fenêtre ouverte) la pousse de côté. */
export function Snowfall() {
  const ref = useRef<InstancedMesh>(null!), gust = useRef(0)
  const flakes = useMemo(() => Array.from({ length: SNOW.n }, (): Flake => ({ x: rand(SNOW.x[0], SNOW.x[1]), y: rand(SNOW.y[0], SNOW.y[1]), z: rand(SNOW.z[0], SNOW.z[1]), v: rand(0.28, 0.6), s: rand(0.03, 0.06), ph: rand(0, TAU) })), [])
  useFrame(({ clock }, delta) => {
    const dt = reduceMotion ? 0 : Math.min(delta, 0.05), t = clock.elapsedTime
    gust.current += ((isActive(useStore.getState(), 'window') ? 1 : 0) - gust.current) * Math.min(1, dt * 1.2)
    const wind = gust.current * (0.9 + Math.sin(t * 0.8) * 0.4)
    flakes.forEach((f, i) => {
      f.y -= f.v * dt
      f.x += (Math.sin(t * 0.6 + f.ph) * 0.14 - wind) * dt
      f.z += Math.cos(t * 0.5 + f.ph) * 0.08 * dt
      if (f.y < SNOW.y[0]) { f.y = SNOW.y[1]; f.x = rand(SNOW.x[0], SNOW.x[1]); f.z = rand(SNOW.z[0], SNOW.z[1]) }
      if (f.x < SNOW.x[0]) f.x = SNOW.x[1]
      const inside = f.x > INSIDE.x[0] && f.x < INSIDE.x[1] && f.z > INSIDE.z[0] && f.z < INSIDE.z[1]
      let k = inside ? Math.min(1, Math.max(0, (f.y - INSIDE.top) / 0.35)) : 1
      // Un flocon entre la caméra et la pièce passerait « dans » la cabane : il s'efface en entrant dans sa silhouette (un hexagone à l'écran).
      if (k > 0 && (f.x + 0.8 * f.y + f.z) / 1.6248 > 1) {
        const sx = Math.abs((f.x - f.z) * 0.7071), sy = 0.8704 * f.y - 0.348 * (f.x + f.z)
        const m = Math.min(4.8 - sx, (6.2 - 0.494 * sx - sy) / 1.115, (sy + 2.98 - 0.494 * sx) / 1.115)
        k *= 1 - Math.min(1, Math.max(0, m / 0.6))
      }
      dummy.position.set(f.x, f.y, f.z)
      dummy.scale.setScalar(f.s * k)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={ref} args={[dot, snowMat, SNOW.n]} frustumCulled={false} raycast={noRay} />
}

const MOTES = { n: 34, x: [-2.5, 2.9], y: [0.5, 3.3], z: [-2.5, 2.5] }

interface MotesProps {
  /** Couleur de jour, de nuit (poussière claire le jour, lucioles bleutées la nuit par défaut). */
  colors?: [number, number]
  /** Opacité de jour, de nuit. */
  opacity?: [number, number]
  n?: number
}

/**
 * Poussières qui flottent dans la pièce : elles brillent dans la lumière du jour, et deviennent de petites lucioles bleutées
 * la nuit. Chaque pièce peut les teinter à sa façon (sable doré à la plage, poussière chaude dans l'atelier).
 */
export function Motes({ colors = [0xfffaf0, 0xc9dcff], opacity = [0.3, 0.65], n: count = MOTES.n }: MotesProps = {}) {
  const ref = useRef<InstancedMesh>(null!)
  const { mat, day, night } = useMemo(
    () => ({ mat: new MeshBasicMaterial({ color: colors[0], transparent: true, opacity: opacity[0], depthWrite: false }), day: new Color(colors[0]), night: new Color(colors[1]) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colors[0], colors[1]],
  )
  const motes = useMemo(
    () => Array.from({ length: count }, () => ({ x: rand(MOTES.x[0], MOTES.x[1]), y: rand(MOTES.y[0], MOTES.y[1]), z: rand(MOTES.z[0], MOTES.z[1]), s: rand(0.018, 0.04), ph: rand(0, TAU), sp: rand(0.4, 1.2) })),
    [count],
  )
  useFrame(({ clock }, delta) => {
    const dt = reduceMotion ? 0 : Math.min(delta, 0.05), t = clock.elapsedTime, k = smooth(mood.night)
    mat.color.copy(day).lerp(night, k)
    mat.opacity = opacity[0] + (opacity[1] - opacity[0]) * k
    motes.forEach((m, i) => {
      m.x += Math.sin(t * 0.3 * m.sp + m.ph) * 0.06 * dt
      m.y += (0.025 + Math.sin(t * 0.4 * m.sp + m.ph * 2) * 0.03) * dt
      m.z += Math.cos(t * 0.25 * m.sp + m.ph) * 0.06 * dt
      if (m.y > MOTES.y[1]) m.y = MOTES.y[0]
      const tw = 0.55 + 0.45 * Math.sin(t * 1.4 * m.sp + m.ph)
      dummy.position.set(m.x, m.y, m.z)
      dummy.scale.setScalar(m.s * (0.8 + k * 0.7) * (0.6 + tw * 0.6))
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={ref} args={[dot, mat, count]} frustumCulled={false} raycast={noRay} />
}
