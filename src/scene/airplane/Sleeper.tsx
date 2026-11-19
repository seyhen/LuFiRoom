import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { blob, cone, ell, pair } from '../blob'
import { reduceMotion, useParticles } from '../anim'
import { useEvery } from '../life'
import { Part, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { zTex } from './textures'
import { A } from './materials'
import { ROW_X, SEAT_Z } from './layout'
import { Seat } from './Seats'

const HOODIE = 0xe6996a, PANTS = 0x4a5678, SKIN = 0xefc3a0, HAIR = 0x3a2a2c, LILAC = 0xb4a4dc, SOCK = 0xf08a78, LILAC2 = 0xc2b3e6

// Un dormeur du hublot, assis au dossier incliné, enroulé dans un polaire lilas. Le corps et la couverture sont d'une seule peau
// (seuls les pieds en chaussettes corail dépassent), la tête est à part pour pencher vers le hublot. Repère : celui du siège (x vers l'avant).
const BODY = blob(
  [
    ell([-0.4, 0.93, 0], [0.17, 0.36, 0.27], { rot: [0, 0, 0.33], color: HOODIE }),
    ell([-0.16, 0.63, 0], [0.24, 0.13, 0.27], { color: PANTS }),
    pair(cone([-0.1, 0.62, 0.12], [0.3, 0.62, 0.12], 0.11, 0.095, { color: PANTS })),
    pair(cone([0.32, 0.6, 0.12], [0.37, 0.1, 0.12], 0.085, 0.07, { color: PANTS })),
    pair(ell([0.43, 0.05, 0.12], [0.12, 0.045, 0.07], { color: SOCK })),
    pair(cone([-0.36, 1.22, 0.3], [-0.2, 0.88, 0.33], 0.07, 0.062, { color: HOODIE })),
    cone([-0.4, 1.2, 0], [-0.43, 1.34, 0], 0.075, 0.07, { color: SKIN }),
    // le polaire : le haut de la poitrine, le ventre, les genoux, un pan qui retombe devant, deux sur les côtés, des plis
    ell([-0.2, 0.95, 0], [0.2, 0.2, 0.33], { color: LILAC, k: 0.06 }),
    ell([0.0, 0.8, 0], [0.32, 0.15, 0.4], { color: LILAC, k: 0.06 }),
    ell([0.2, 0.76, 0], [0.2, 0.14, 0.41], { color: LILAC2, k: 0.06 }),
    ell([0.37, 0.54, 0], [0.07, 0.3, 0.4], { color: LILAC, k: 0.05 }),
    pair(ell([0.1, 0.57, 0.4], [0.28, 0.26, 0.06], { color: LILAC2, k: 0.05 })),
    pair(ell([0.04, 0.92, 0.18], [0.14, 0.08, 0.1], { color: LILAC2, k: 0.05 })),
    ell([-0.12, 1.1, 0.0], [0.1, 0.07, 0.22], { color: LILAC2, k: 0.05 }),
  ],
  { h: 0.026, k: 0.06, pad: 0.05 },
)
const HEAD = blob(
  [
    ell([0, 0.19, 0], [0.15, 0.18, 0.15], { color: SKIN }),
    ell([0.07, 0.07, 0], [0.09, 0.07, 0.1], { color: SKIN }),
    ell([-0.04, 0.245, 0], [0.165, 0.16, 0.165], { color: HAIR, k: 0.03 }),
    pair(ell([-0.01, 0.18, 0.155], [0.032, 0.05, 0.022], { color: SKIN })),
    ell([0.145, 0.15, 0], [0.032, 0.036, 0.03], { color: SKIN }),
  ],
  { h: 0.014, k: 0.03, pad: 0.03 },
)

const NECK: V3 = [-0.43, 1.32, 0]

/**
 * Le dormeur du siège hublot de la rangée 1 : un voyageur en sweat pêche, enroulé dans un polaire lilas, la tête sur un oreiller de
 * voyage menthe, un masque de sommeil rose aux yeux fermés dessinés. Sa poitrine monte et descend à peine ; de loin en loin un « Z » s'envole.
 * Le siège a son dossier incliné.
 */
export function Sleeper() {
  const p: V3 = [ROW_X[0], 0, SEAT_Z.A]
  const body = useRef<Group>(null!)
  const zs = useParticles()
  useFrame(({ clock }) => {
    body.current.scale.y = reduceMotion ? 1 : 1 + Math.sin(clock.elapsedTime * 0.9) * 0.006
  })
  useEvery(5, 9, () => zs.emit(zTex, p[0] - 0.2, 1.95, p[2] - 0.1, { size: 0.2, life: 3.4, vy: 0.2, sway: 0.1, grow: 0.5, peak: 0.8 }), () => true, 2)
  return (
    <group position={p}>
      <Static>
        <Seat position={[0, 0, 0]} recline={0.2} leftArm belt={false} />
      </Static>
      <group ref={body} userData={LIVE}>
        <mesh geometry={BODY} material={A.person} castShadow receiveShadow />
        {/* l'oreiller de voyage : un U menthe qui entoure la nuque, ouvert devant */}
        <group position={[NECK[0] + 0.02, 1.2, 0]} rotation-x={-Math.PI / 2}>
          <Part m={A.pillow} rotation-z={0.84}>
            <torusGeometry args={[0.125, 0.055, 12, 22, 4.6]} />
          </Part>
        </group>
        {/* la tête, penchée vers le hublot et contre l'appuie-tête */}
        <group position={NECK} rotation-x={-0.16} rotation-z={0.18}>
          <mesh geometry={HEAD} material={A.person} castShadow receiveShadow />
          {/* le masque : un bandeau de satin autour de la tête et le patin brodé de deux yeux fermés */}
          <Part m={A.maskBand} p={[0, 0.2, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.158, 0.012, 6, 28]} />
          </Part>
          <mesh material={A.mask} position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.095, 20, 1, true, Math.PI / 2 - 0.62, 1.24]} />
          </mesh>
          {/* un sourire à peine */}
          <Part m={A.hoodie} p={[0.156, 0.075, 0]} rotation-y={Math.PI / 2} rotation-z={Math.PI} castShadow={false}>
            <torusGeometry args={[0.022, 0.004, 5, 10, Math.PI]} />
          </Part>
        </group>
      </group>
      <group ref={zs.group} />
    </group>
  )
}
