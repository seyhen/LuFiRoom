import { useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import { smooth } from '../../math'
import { Part, noRay, rbox, type V3 } from '../parts'
import { mood } from '../anim'
import { glowTex } from '../textures'
import { B } from './materials'

/** Portable ouvert face à la chaise : l'écran (une radio lofi, soleil couchant) s'éclaire plus fort la nuit et teinte le bureau de bleu. */
export function Laptop({ position }: { position: V3 }) {
  useFrame(() => {
    B.screen.emissiveIntensity = 0.45 + smooth(mood.night) * 0.7
  })
  return (
    <group position={position}>
      <Part geo={rbox(0.8, 0.04, 0.56, 0.02)} m={B.laptop} p={[0, 0.02, 0]} />
      <mesh position={[0, 0.0415, 0.02]} rotation-x={-Math.PI / 2} material={B.keys} receiveShadow>
        <planeGeometry args={[0.7, 0.44]} />
      </mesh>
      <group position={[0, 0.04, -0.26]} rotation-x={-0.3}>
        <Part geo={rbox(0.8, 0.54, 0.035, 0.02)} m={B.laptop} p={[0, 0.27, 0]} />
        <mesh position={[0, 0.27, 0.019]} material={B.screen}>
          <planeGeometry args={[0.72, 0.45]} />
        </mesh>
      </group>
      <sprite scale={1.7} position={[0, 0.42, 0.18]} raycast={noRay}>
        <spriteMaterial map={glowTex} color={0x9ab8ff} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.2} />
      </sprite>
    </group>
  )
}
