import { useFrame } from '@react-three/fiber'
import { smooth } from '../../math'
import { M } from '../materials'
import { Part, WIN, backWall, rbox, worldUV } from '../parts'
import { mood } from '../anim'
import { B } from './materials'

/**
 * Socle, parquet clair, murs (papier peint étoilé et boiseries menthe ; fresque et étoiles qui brillent dans le noir à gauche),
 * lisses et plinthes en relief, appui de la fenêtre.
 */
export function BedroomShell() {
  useFrame(() => {
    B.mural.emissiveIntensity = smooth(mood.night) * 0.95
  })
  return (
    <>
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={M.base} p={[-0.07, -0.44, -0.07]} />
      <Part geo={worldUV(rbox(6.54, 0.24, 6.54, 0.08), 2.4, 'z')} m={B.floor} p={[-0.07, -0.12, -0.07]} />
      <Part geo={backWall} m={[B.wallBack, B.wallEdge]} p={[0, 0, -3.26]} />
      <Part geo={rbox(0.34, 4.35, 6.54, 0.08)} m={M.wallLeft} p={[-3.17, 2.125, -0.07]} />
      <mesh rotation-y={Math.PI / 2} position={[-2.995, 2.125, -0.07]} material={B.mural} receiveShadow>
        <planeGeometry args={[6.54, 4.35]} />
      </mesh>
      <Part geo={rbox(6.2, 0.11, 0.06, 0.025)} m={B.trim} p={[0.1, 1.045, -2.97]} castShadow={false} />
      <Part geo={rbox(0.06, 0.11, 6.2, 0.025)} m={B.trim} p={[-2.97, 1.045, 0.1]} castShadow={false} />
      <Part geo={rbox(6.2, 0.17, 0.05, 0.02)} m={B.trim} p={[0.1, 0.085, -2.975]} castShadow={false} />
      <Part geo={rbox(0.05, 0.17, 6.2, 0.02)} m={B.trim} p={[-2.975, 0.085, 0.1]} castShadow={false} />
      <Part geo={rbox(2.62, 0.1, 0.3, 0.04)} m={M.cream} p={[(WIN.x0 + WIN.x1) / 2, WIN.y0 - 0.03, -2.9]} />
    </>
  )
}
