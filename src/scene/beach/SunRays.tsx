import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, DoubleSide, type MeshBasicMaterial } from 'three'
import { smooth } from '../../math'
import { canvasTex } from '../paint'
import { noRay } from '../parts'
import { mood, reduceMotion } from '../anim'
import { LIVE } from '../Static'

/** Un rai de lumière : un dégradé doré qui s'efface vers le bas et sur les bords. */
const rayTex = canvasTex(64, 256, (x) => {
  const v = x.createLinearGradient(0, 0, 0, 256)
  v.addColorStop(0, 'rgba(255,214,150,.0)'); v.addColorStop(0.15, 'rgba(255,214,150,.9)'); v.addColorStop(1, 'rgba(255,200,140,0)')
  x.fillStyle = v; x.fillRect(0, 0, 64, 256)
  const h = x.createLinearGradient(0, 0, 64, 0)
  h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(0.3, 'rgba(0,0,0,0)'); h.addColorStop(0.7, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)')
  x.globalCompositeOperation = 'destination-out'; x.fillStyle = h; x.fillRect(0, 0, 64, 256)
})

// Les rais : [x, largeur, inclinaison, opacité].
const RAYS = [[0.1, 0.5, 0.0, 0.5], [0.75, 0.7, 0.05, 0.7], [1.5, 0.45, 0.08, 0.45], [2.2, 0.6, 0.12, 0.55]] as const

/** Les rais du soleil couchant qui entrent par la grande porte et s'allongent sur le plancher. Ils s'éteignent le soir. */
export function SunRays() {
  const mats = useRef<MeshBasicMaterial[]>([])
  useFrame(({ clock }) => {
    const k = 1 - smooth(mood.night), t = clock.elapsedTime
    mats.current.forEach((m, i) => (m.opacity = k * RAYS[i][3] * (reduceMotion ? 1 : 0.85 + Math.sin(t * 0.6 + i * 1.7) * 0.15)))
  })
  return (
    <group userData={LIVE}>
      {RAYS.map(([x, w, tilt], i) => (
        <mesh key={i} position={[x, 1.6, -2.1]} rotation={[-0.62, 0, tilt]} raycast={noRay}>
          <planeGeometry args={[w, 3.4]} />
          <meshBasicMaterial ref={(m) => void (m && (mats.current[i] = m))} map={rayTex} transparent blending={AdditiveBlending} depthWrite={false} side={DoubleSide} opacity={0} />
        </mesh>
      ))}
    </group>
  )
}
