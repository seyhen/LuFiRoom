import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Object3D, type InstancedMesh, type Sprite } from 'three'
import { smooth } from '../../math'
import { Batch, SPH, cyl, noRay, type Item, type V3 } from '../parts'
import { mood, reduceMotion } from '../anim'
import { glowTex } from '../textures'
import { M } from '../materials'

/** Une bougie : position de sa base, hauteur, rayon. */
export interface Candle {
  p: V3
  h: number
  r?: number
}

const dummy = new Object3D()
const flameAt = ({ p, h }: Candle): V3 => [p[0], p[1] + h + 0.05, p[2]]

/** Bougies allumées : flamme qui vacille, halo qui grandit la nuit. Deux tracés pour tout le groupe, plus un halo chacune. */
export function Candles({ items }: { items: Candle[] }) {
  const flames = useRef<InstancedMesh>(null!), halos = useRef<Sprite[]>([])
  const wax = useMemo<Item[]>(() => items.map(({ p, h, r = 0.055 }) => ({ p: [p[0], p[1] + h / 2, p[2]], s: [r, h, r] })), [items])
  const fire = useMemo<Item[]>(() => items.map((c) => ({ p: flameAt(c), s: [0.028, 0.055, 0.028] })), [items])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, n = smooth(mood.night)
    M.wax.emissiveIntensity = n * 0.35
    items.forEach((c, i) => {
      const f = reduceMotion ? 0 : Math.sin(t * 11 + i * 2.1) * 0.5 + Math.sin(t * 17.3 + i) * 0.5
      dummy.position.set(...flameAt(c))
      dummy.scale.set(0.028 * (1 - f * 0.08), 0.055 * (1 + f * 0.16), 0.028)
      dummy.updateMatrix()
      flames.current.setMatrixAt(i, dummy.matrix)
      halos.current[i].material.opacity = (0.1 + n * 0.55) * (1 + f * 0.1)
    })
    flames.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <Batch geo={cyl(1, 1, 1, 16)} m={M.wax} items={wax} />
      <Batch ref={flames} geo={SPH} m={M.candleFlame} items={fire} />
      {items.map((c, i) => (
        <sprite key={i} ref={(s) => void (s && (halos.current[i] = s))} scale={0.5} position={flameAt(c)} raycast={noRay}>
          <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </>
  )
}
