import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, MeshBasicMaterial, Object3D, SphereGeometry, type InstancedMesh } from 'three'
import { TAU, rand, smooth } from '../../math'
import { mood, reduceMotion } from '../anim'
import { whiteout } from '../paint'
import { noRay } from '../parts'
import { LIVE } from '../Static'

const dot = new SphereGeometry(1, 6, 4)
const dummy = new Object3D()
const DAY = new Color(0xffffff), NIGHT = new Color(0xc2cbe6)

interface Props {
  /** La boîte où tombent les flocons, en coordonnées du monde : entre la vue peinte et la vitre, jamais dans la pièce. */
  x: [number, number]
  y: [number, number]
  z: [number, number]
  /** Combien, au plus fort de la tempête de neige (la neige en montre un peu moins de la moitié). */
  n?: number
  /** Taille d'un flocon (rayon). */
  size?: number
  /** Vitesse de côté, en unités par seconde, qui s'ajoute au vent (le paysage du train qui défile : les flocons filent). */
  fly?: number
}

/**
 * La neige qui tombe dehors, derrière une vitre : quelques flocons qui descendent en se balançant, poussés de côté par la
 * tempête de neige. Un seul tracé, et aucun quand il ne neige pas. Avec `prefers-reduced-motion`, ils restent immobiles.
 */
export function ViewFlakes({ x, y, z, n = 70, size = 0.016, fly = 0 }: Props) {
  const ref = useRef<InstancedMesh>(null!)
  const mat = useMemo(() => new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false }), [])
  const flakes = useMemo(() => Array.from({ length: n }, () => ({ x: rand(x[0], x[1]), y: rand(y[0], y[1]), z: rand(z[0], z[1]), v: rand(0.22, 0.45), s: rand(0.6, 1.3), ph: rand(0, TAU) })), [n, x[0], x[1], y[0], y[1], z[0], z[1]])
  const t = useRef(0)
  useFrame((_, delta) => {
    const m = ref.current, s = smooth(mood.snow)
    m.visible = s > 0.01
    if (!m.visible) return
    const dt = reduceMotion ? 0 : Math.min(delta, 0.05), wo = whiteout({ n: 0, r: 0, s, st: 0 })
    t.current += dt
    mat.color.copy(DAY).lerp(NIGHT, smooth(mood.night))
    mat.opacity = 0.9 * Math.min(1, s * 1.5)
    // La neige : un peu moins de la moitié des flocons, qui tombent droit ; la tempête : tous, vite, poussés de côté.
    m.count = Math.round(n * (0.42 + 0.58 * wo))
    const wide = x[1] - x[0], high = y[1] - y[0]
    for (let i = 0; i < m.count; i++) {
      const f = flakes[i]
      f.y -= f.v * (1 + wo * 1.4) * dt
      f.x += (Math.sin(t.current * 0.8 + f.ph) * 0.1 * (1 - wo) - wo * (0.9 + f.v * 1.6) - fly) * dt
      if (f.y < y[0]) f.y += high
      if (f.x < x[0]) f.x += wide
      if (f.x > x[1]) f.x -= wide
      dummy.position.set(f.x, f.y, f.z)
      // La tempête étire un peu les flocons dans le sens du vent.
      dummy.scale.set(size * f.s * (1 + wo * 0.8 + Math.min(2, Math.abs(fly) * 0.4)), size * f.s, size * f.s)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={ref} args={[dot, mat, n]} userData={LIVE} frustumCulled={false} raycast={noRay} visible={false} />
}
