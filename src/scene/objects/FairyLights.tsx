import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'
import { smooth } from '../../math'
import { M, fairyMats } from '../materials'
import { SPH } from '../parts'
import { mood } from '../anim'

// Le long du mur gauche, en deux arcs qui pendent.
const fy = (f: number) => 4.1 - 0.3 * Math.sin(Math.PI * ((f * 2) % 1))
const wire = new TubeGeometry(
  new CatmullRomCurve3(Array.from({ length: 61 }, (_, i) => new Vector3(-2.93, fy(i / 60), 2.95 - (i / 60) * 5.85))),
  120, 0.01, 5, false,
)
const bulbs = Array.from({ length: 20 }, (_, i) => (i + 0.5) / 20)

/** Guirlande lumineuse : s'allume la nuit et clignote doucement. */
export function FairyLights() {
  useFrame(({ clock }) => {
    const e = smooth(mood.night), t = clock.elapsedTime
    fairyMats.forEach((m, i) => {
      m.emissiveIntensity = 0.15 + e * (1.15 + 0.3 * Math.sin(t * 2 + i * 2))
    })
  })
  return (
    <>
      <mesh geometry={wire} material={M.plum} />
      {bulbs.map((f, i) => (
        <mesh key={i} geometry={SPH} material={fairyMats[i % 3]} scale={[0.05, 0.065, 0.05]} position={[-2.9, fy(f) - 0.06, 2.95 - f * 5.85]} />
      ))}
    </>
  )
}
