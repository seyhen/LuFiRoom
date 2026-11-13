import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Color, Float32BufferAttribute } from 'three'
import { TAU, smooth } from '../../../math'
import { mood, reduceMotion } from '../../anim'
import { noRay } from '../../parts'
import { S, foam, swell } from './materials'

/** Le niveau de la mer : l'aiguille de roche y plonge. */
export const SEA = -2.35

/** Un anneau d'écume autour d'un rocher : rayon intérieur et largeur, un peu bosselé. */
export function ringGeo(r: number, w: number, seed: number) {
  const M = 48, pos: number[] = [], uv: number[] = [], idx: number[] = []
  for (let m = 0; m <= M; m++) {
    const a = (m / M) * TAU, k = 1 + 0.08 * Math.sin(a * 3 + seed) + 0.05 * Math.sin(a * 5 + seed * 2)
    for (const [d, v] of [[r * k - 0.05, 0], [r * k + w, 1]] as const) { pos.push(Math.cos(a) * d, 0, Math.sin(a) * d); uv.push((m / M) * Math.round(r * 3), v) }
  }
  for (let m = 0; m < M; m++) { const a = m * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  return g
}

const DAY = new Color(0x3e7f96), NIGHT = new Color(0x1a2e4c), STORM = new Color(0x5a6a72), SNOW = new Color(0x6a7e8a)

/** Les rochers qui sortent de l'eau, et leur anneau d'écume : [x, z, rayon à la ligne d'eau]. */
export const FOAMS: [number, number, number][] = [[0, 0, 2.55], [6.6, -5.4, 1.9], [-6.2, -2.4, 1.0], [-4.6, 5.6, 0.75], [5.6, 4.4, 0.6], [8.2, 1.2, 0.5]]

/**
 * La mer : une grande nappe bleu-vert, la houle qui défile en crêtes d'écume (plus vite et plus blanche dans la tempête), un anneau
 * d'écume qui respire au pied de chaque rocher. Grise sous l'orage, plus froide sous la neige, d'encre la nuit.
 */
export function Sea() {
  const rings = useMemo(() => FOAMS.map(([, , r], i) => ringGeo(r, 0.5 + r * 0.12, i * 1.7)), [])
  const c = useMemo(() => new Color(), [])
  useFrame(({ clock }, delta) => {
    const dt = reduceMotion ? 0 : Math.min(delta, 0.05), st = smooth(mood.storm), n = smooth(mood.night)
    swell.offset.x += dt * (0.012 + st * 0.03)
    swell.offset.y += dt * (0.02 + st * 0.05)
    foam.offset.x -= dt * 0.01
    c.copy(DAY).lerp(STORM, Math.max(st, mood.rain * 0.4)).lerp(SNOW, smooth(mood.snow) * 0.6).lerp(NIGHT, n * 0.85)
    S.sea.color.copy(c)
    S.swell.opacity = 0.45 + st * 0.45 - n * 0.15
    S.foam.opacity = (reduceMotion ? 0.55 : 0.48 + 0.14 * Math.sin(clock.elapsedTime * 1.1)) * (1 - n * 0.3) + st * 0.1
    S.foamFar.opacity = S.foam.opacity
  })
  return (
    <>
      <mesh position={[0, SEA, 0]} rotation-x={-Math.PI / 2} material={S.sea} receiveShadow raycast={noRay}>
        <planeGeometry args={[34, 34]} />
      </mesh>
      <mesh position={[0, SEA + 0.01, 0]} rotation-x={-Math.PI / 2} material={S.swell} renderOrder={2} raycast={noRay}>
        <planeGeometry args={[34, 34]} />
      </mesh>
      {FOAMS.map(([x, z], i) => <mesh key={i} geometry={rings[i]} position={[x, SEA + 0.02, z]} material={S.foam} renderOrder={3} raycast={noRay} />)}
    </>
  )
}
