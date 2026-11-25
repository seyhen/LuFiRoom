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

const SWEATER = 0xe8b64a, SWEATER2 = 0xf2c866, PANTS = 0x4a5678, SKIN = 0xefc3a0, HAIR = 0x3a2a2c, LILAC = 0xb4a4dc, LILAC2 = 0xc9bced, SOCK = 0xf08a78, BLUSH = 0xf0a090

// Le repère est celui du siège (x vers l'avant). Le dossier bascule autour de (-0,24 ; 0,46) de 0,13 + 0,2 (voir `Seat`) :
// `bk(s, d, z)` donne le point à la distance `s` le long du dossier et à `d` devant sa face de tissu (qui est à d = 0,03).
const TILT = 0.33, PIV = [-0.24, 0.46]
const U = [-Math.sin(TILT), Math.cos(TILT)], N = [Math.cos(TILT), Math.sin(TILT)]
const bk = (s: number, d: number, z = 0): V3 => [PIV[0] + N[0] * d + U[0] * s, PIV[1] + N[1] * d + U[1] * s, z]

// Le corps : un voyageur assis, le dos au dossier incliné, en sweat pêche et pantalon bleu nuit, chaussettes corail. Les bras reposent
// sur les cuisses, les mains l'une contre l'autre sur le plaid. Épaules de 0,42 m, tête de 0,23 m : des proportions humaines, un peu gummy.
const BODY = blob(
  [
    // le torse : le ventre, la poitrine plus large, les épaules, le cou
    ell(bk(0.28, 0.125), [0.095, 0.2, 0.17], { rot: [0, 0, TILT], color: SWEATER }),
    ell(bk(0.5, 0.12), [0.092, 0.19, 0.2], { rot: [0, 0, TILT], color: SWEATER }),
    pair(ell(bk(0.66, 0.1, 0.2), 0.08, { color: SWEATER })),
    cone(bk(0.66, 0.1), bk(0.84, 0.1), 0.062, 0.054, { color: SKIN, k: 0.02 }),
    // le bassin et les cuisses
    ell([-0.08, 0.585, 0], [0.16, 0.1, 0.2], { color: PANTS }),
    pair(cone([-0.06, 0.585, 0.105], [0.33, 0.6, 0.115], 0.09, 0.07, { color: PANTS })),
    // les jambes : du genou à la cheville, le revers du pantalon, la chaussette, le pied
    pair(cone([0.33, 0.6, 0.115], [0.395, 0.21, 0.115], 0.07, 0.054, { color: PANTS })),
    pair(cone([0.395, 0.22, 0.115], [0.4, 0.1, 0.115], 0.052, 0.046, { color: SOCK })),
    pair(ell([0.45, 0.055, 0.115], [0.115, 0.042, 0.055], { color: SOCK })),
    // les bras : le haut du bras, le coude, l'avant-bras, la main (et le pouce) posée sur le plaid
    pair(cone(bk(0.66, 0.1, 0.22), [-0.2, 0.8, 0.255], 0.062, 0.055, { color: SWEATER })),
    pair(cone([-0.2, 0.8, 0.255], [0.0, 0.752, 0.13], 0.055, 0.046, { color: SWEATER })),
    pair(cone([-0.02, 0.752, 0.14], [0.02, 0.746, 0.12], 0.05, 0.047, { color: SWEATER2 })),
    pair(ell([0.075, 0.738, 0.1], [0.06, 0.028, 0.042], { color: SKIN, rot: [0.2, 0, 0] })),
    pair(ell([0.1, 0.75, 0.06], [0.03, 0.018, 0.02], { color: SKIN })),
  ],
  { h: 0.022, k: 0.035, pad: 0.05 },
)

// Le plaid lilas sur les cuisses et les genoux : un dessus, un pan qui pend de chaque côté, un pan devant les genoux, un pli ; des rayures plus claires.
const PLAID = blob(
  [
    ell([0.14, 0.646, 0], [0.29, 0.055, 0.235], { color: LILAC }),
    pair(ell([0.14, 0.585, 0.232], [0.26, 0.09, 0.03], { color: LILAC })),
    ell([0.43, 0.49, 0], [0.1, 0.21, 0.225], { color: LILAC }),
    // un pan entre le dessus et le devant : sans lui les genoux (le pantalon) passaient entre les deux et tachaient le plaid
    ell([0.32, 0.62, 0], [0.13, 0.085, 0.225], { color: LILAC }),
    ell([0.2, 0.672, 0], [0.04, 0.03, 0.18], { color: LILAC2, k: 0.03 }),
    ell([-0.1, 0.69, 0], [0.04, 0.04, 0.18], { color: LILAC2, k: 0.03 }),
  ],
  {
    h: 0.02, k: 0.04, pad: 0.04,
    paint: (p, base) => (Math.floor((p.x + p.y * 0.6 + 1) / 0.07) % 3 === 0 ? base.lerp(base.clone().set(0xe3d9fa), 0.55) : base),
  },
)

// La tête : un crâne, une mâchoire, des joues, un nez, deux oreilles, des cheveux sur le dessus et l'arrière (le visage reste dégagé).
// L'origine est la base du cou, le visage regarde +x.
const HEAD = blob(
  [
    ell([0, 0.135, 0], [0.108, 0.13, 0.098], { color: SKIN }),
    ell([0.03, 0.06, 0], [0.082, 0.07, 0.082], { color: SKIN }),
    pair(ell([0.075, 0.07, 0.06], [0.03, 0.03, 0.026], { color: BLUSH, k: 0.02 })),
    ell([0.108, 0.105, 0], [0.022, 0.026, 0.02], { color: SKIN, k: 0.02 }),
    pair(ell([-0.005, 0.125, 0.1], [0.02, 0.036, 0.012], { color: SKIN, k: 0.02 })),
    ell([-0.04, 0.17, 0], [0.108, 0.115, 0.104], { color: HAIR, k: 0.02 }),
    ell([0.0, 0.215, 0], [0.105, 0.06, 0.1], { color: HAIR, k: 0.02 }),
    ell([0.062, 0.225, 0], [0.04, 0.026, 0.075], { color: HAIR, k: 0.02 }),
  ],
  { h: 0.012, k: 0.03, pad: 0.03 },
)

/**
 * Le dormeur du siège hublot de la rangée 1 : un voyageur en sweat pêche, un plaid lilas sur les genoux, les mains posées dessus, la tête
 * contre l'appuie-tête dans un oreiller de voyage menthe, les yeux fermés, un sourire à peine. Sa poitrine monte et descend à peine ;
 * de loin en loin un « Z » s'envole. Le siège a son dossier incliné.
 */
export function Sleeper() {
  const p: V3 = [ROW_X[0], 0, SEAT_Z.A]
  const body = useRef<Group>(null!)
  const zs = useParticles()
  useFrame(({ clock }) => {
    body.current.scale.y = reduceMotion ? 1 : 1 + Math.sin(clock.elapsedTime * 0.9) * 0.006
  })
  const neck = bk(0.8, 0.095)
  useEvery(5, 9, () => zs.emit(zTex, p[0] + neck[0] - 0.05, 1.9, p[2] - 0.05, { size: 0.2, life: 3.4, vy: 0.2, sway: 0.1, grow: 0.5, peak: 0.8 }), () => true, 2)
  return (
    <group position={p}>
      <Static>
        <Seat position={[0, 0, 0]} recline={0.2} leftArm belt={false} />
      </Static>
      <group ref={body} userData={LIVE}>
        <mesh geometry={BODY} material={A.person} castShadow receiveShadow />
        <mesh geometry={PLAID} material={A.plaid} castShadow receiveShadow />
        {/* l'oreiller de voyage : un U menthe autour de la nuque, ouvert devant */}
        <group position={bk(0.72, 0.085)} rotation-z={TILT}>
          <group rotation-x={-Math.PI / 2}>
            <Part m={A.pillow} rotation-z={0.84}>
              <torusGeometry args={[0.1, 0.05, 12, 22, 4.6]} />
            </Part>
          </group>
        </group>
        {/* la tête, appuyée au repose-tête, un peu penchée vers le hublot, le visage tourné vers la pièce */}
        <group position={neck} rotation-z={0.2} rotation-x={-0.12} rotation-y={-0.25} scale={1.12}>
          <mesh geometry={HEAD} material={A.person} castShadow receiveShadow />
          {/* les yeux fermés : deux petits arcs de cils, et un sourire à peine */}
          {[-1, 1].map((s) => (
            <Part key={s} m={A.lash} p={[0.1, 0.122, s * 0.042]} rotation-y={Math.PI / 2} rotation-z={Math.PI} castShadow={false}>
              <torusGeometry args={[0.02, 0.0045, 5, 10, Math.PI]} />
            </Part>
          ))}
          <Part m={A.lash} p={[0.1, 0.062, 0]} rotation-y={Math.PI / 2} rotation-z={Math.PI} castShadow={false}>
            <torusGeometry args={[0.02, 0.004, 5, 10, Math.PI]} />
          </Part>
        </group>
      </group>
      <group ref={zs.group} />
    </group>
  )
}
