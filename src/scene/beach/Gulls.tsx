import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D, type InstancedMesh } from 'three'
import { blob, cone, ell, pair } from '../blob'
import { reduceMotion } from '../anim'
import { LIVE } from '../Static'
import { noRay } from '../parts'
import { Part } from './deco'
import { B } from './materials'

// Des mouettes de loin, d'une seule peau (scene/blob.ts), à peine détaillées : on ne les voit qu'à quelques pixels. Calculées une fois,
// au premier rendu de la pièce (quelques dizaines de millisecondes en tout).
const W = 0xfffdf8, G = 0x8fa2c0, INK = 0x2c2b3d, BILL = 0xf6c544, LEG = 0xf2a45e

/** Posée : le bec vers +x, les pieds en y = 0, les ailes repliées sur le dos. */
const SIT = blob([
  ell([0, 0.14, 0], [0.13, 0.095, 0.09], { color: W, rot: [0, 0, 0.28] }),
  ell([0.07, 0.2, 0], [0.07, 0.09, 0.07], { color: W, rot: [0, 0, -0.25], k: 0.06 }),
  ell([-0.07, 0.2, 0], [0.12, 0.04, 0.075], { color: G, rot: [0, 0, 0.3], k: 0.03 }),
  ell([-0.2, 0.14, 0], [0.07, 0.025, 0.04], { color: INK, rot: [0, 0, 0.25], k: 0.02 }),
  ell([0.1, 0.3, 0], [0.065, 0.06, 0.06], { color: W, k: 0.05 }),
  cone([0.14, 0.3, 0], [0.22, 0.29, 0], 0.02, 0.012, { color: BILL, k: 0.01 }),
  pair(cone([0, 0.1, 0.04], [0.01, 0.01, 0.04], 0.012, 0.01, { color: LEG, k: 0.01 })),
], { h: 0.022, k: 0.04 })

/** En vol plané : un corps en goutte, deux longues ailes arquées au bout sombre (le bec vers +x, l'aile vers ±z). */
const FLY = blob([
  ell([0, 0, 0], [0.13, 0.05, 0.05], { color: W }),
  ell([0.15, 0.012, 0], 0.04, { color: W, k: 0.04 }),
  cone([0.18, 0.012, 0], [0.23, 0.005, 0], 0.014, 0.01, { color: BILL, k: 0.01 }),
  ell([-0.14, 0, 0], [0.07, 0.015, 0.035], { color: W, k: 0.03 }),
  pair(ell([0, 0.01, 0.2], [0.075, 0.014, 0.19], { color: G, rot: [0.05, 0, 0], k: 0.04 })),
  pair(ell([-0.02, 0.03, 0.43], [0.05, 0.012, 0.11], { color: INK, rot: [0.1, 0, 0], k: 0.03 })),
], { h: 0.03, k: 0.05 })

/** Une mouette posée (la peau `gullSkin` : couleurs de sommets). */
export function SittingGull({ p, ry = 0, scale = 1, look = 0 }: { p: [number, number, number]; ry?: number; scale?: number; look?: number }) {
  void look
  return <Part geo={SIT} m={B.gullSkin} p={p} rotation-y={ry} scale={scale} />
}

const dummy = new Object3D()
/** Des mouettes qui planent en cercle au large, en vol : un seul tracé pour toutes. Elles tournent lentement, montent et descendent. */
export function Soarers({ list }: { list: { c: [number, number]; r: number; y: number; sp: number; ph: number }[] }) {
  const mesh = useRef<InstancedMesh>(null!)
  const t = useRef(list.map((l) => l.ph))
  useMemo(() => list, [list])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    list.forEach((l, i) => {
      if (!reduceMotion) t.current[i] += dt * l.sp
      const a = t.current[i]
      dummy.position.set(l.c[0] + Math.cos(a) * l.r, l.y + Math.sin(a * 2.3) * 0.25, l.c[1] + Math.sin(a) * l.r)
      // le virage : le bec suit la tangente, l'aile du dedans penchée
      dummy.rotation.set(0.28, -a - Math.PI, 0, 'YXZ')
      dummy.scale.setScalar(1.5)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={mesh} args={[FLY, B.gullSkin, list.length]} frustumCulled={false} raycast={noRay} userData={LIVE} />
}
