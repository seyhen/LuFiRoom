import { useFrame } from '@react-three/fiber'
import { Color, Matrix4, PlaneGeometry } from 'three'
import { smooth } from '../../math'
import { mood } from '../anim'
import { noRay } from '../parts'
import { B } from './materials'
import { rainGlassTex } from './textures'

// La fenêtre projetée sur le sol et le tapis, un peu de biais : chaude le jour, bleutée la nuit, plus pâle sous la pluie.
const geo = new PlaneGeometry(2.5, 1.9)
geo.applyMatrix4(new Matrix4().makeShear(0.35, 0, 0, 0, 0, 0))
const DAY = new Color(0xffe4a8), NIGHT = new Color(0x9db4ff)
rainGlassTex.repeat.set(2, 3)

/** Tache de lumière de la fenêtre au sol ; fait aussi apparaître les gouttes sur la vitre quand il pleut (voir Window). */
export function WindowLight() {
  useFrame(({ clock }) => {
    const n = smooth(mood.night), r = smooth(mood.rain)
    B.lightPatch.color.copy(DAY).lerp(NIGHT, n)
    B.lightPatch.opacity = (0.3 - 0.08 * n) * (1 - 0.75 * r) * (1 + 0.05 * Math.sin(clock.elapsedTime * 0.6))
    B.rainGlass.opacity = r * 0.8
  })
  return <mesh geometry={geo} material={B.lightPatch} position={[1.5, 0.09, -0.85]} rotation-x={-Math.PI / 2} raycast={noRay} renderOrder={1} />
}
