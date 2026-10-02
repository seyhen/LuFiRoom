import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D, type Group, type InstancedMesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { rand } from '../../math'
import { gummy } from '../materials'
import { Part, cyl, rbox } from '../parts'
import { useParticles, useSquash } from '../anim'
import { pageTex } from './textures'
import { K } from './materials'

// Le mur de livres : six planches, cinq rangées de dos colorés, tirés une fois pour toutes (graine fixe : la même étagère à chaque visite).
const LEVELS = [0.06, 0.7, 1.34, 1.98, 2.62, 3.26], Z0 = -2.1, Z1 = 2.5, X = -2.78
const PALETTE = [0xa9453d, 0x2f5d50, 0x25365e, 0xe0b84a, 0xf3afc6, 0xd8cdb4, 0x37a3b5, 0x8a5a44, 0x6e5a9a, 0xe07a4a]

function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Book {
  y: number
  z: number
  w: number
  h: number
  d: number
  lean: number
  col: number
}
const books: Book[] = (() => {
  const r = seeded(7), out: Book[] = []
  for (let row = 0; row < LEVELS.length - 1; row++) {
    const floor = LEVELS[row] + 0.03
    let z = Z0 + 0.04
    while (z < Z1 - 0.08) {
      if (r() < 0.1) z += 0.1 + r() * 0.25 // un vide
      const w = 0.045 + r() * 0.08, h = 0.34 + r() * 0.2, lean = r() < 0.05 ? (r() < 0.5 ? -1 : 1) * (0.14 + r() * 0.1) : 0
      out.push({ y: floor + h / 2, z: z + w / 2, w, h, d: 0.3 + r() * 0.08, lean, col: PALETTE[(r() * PALETTE.length) | 0] })
      z += w + 0.004 + Math.abs(lean) * 0.2
    }
  }
  return out
})()

const spine = gummy(0xffffff, { roughness: 0.6, clearcoat: 0.3 })
const dummy = new Object3D()

/** Mur de livres sur toute la longueur de la pièce, avec son échelle à roulettes : les pages se tournent quand on le touche. */
export function Bookshelf() {
  const g = useRef<Group>(null!), mesh = useRef<InstancedMesh>(null!)
  const pages = useParticles(), since = useRef(0)
  useSquash('books', g)
  useLayoutEffect(() => {
    const c = new Color()
    books.forEach((b, i) => {
      dummy.position.set(X, b.y, b.z)
      dummy.rotation.set(b.lean, 0, 0)
      dummy.scale.set(b.d, b.h, b.w)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
      mesh.current.setColorAt(i, c.set(b.col))
    })
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  }, [])
  useFrame((_, delta) => {
    since.current += Math.min(delta, 0.05)
    if (isActive(useStore.getState(), 'books') && since.current > 1.2) {
      since.current = 0
      pages.emit(pageTex, X + 0.55, rand(1.0, 2.8), rand(Z0 + 0.3, Z1 - 0.3), { size: 0.22, life: 2.6, vy: 0.3, sway: 0.15, peak: 0.95 })
    }
  })
  const mid = (Z0 + Z1) / 2, len = Z1 - Z0 + 0.1
  return (
    <>
      <group ref={g} userData={{ id: 'books' }} position={[0, 0, 0]}>
        {/* le meuble : fond, planches, montants */}
        <Part geo={rbox(0.06, 3.7, len, 0.02)} m={K.walnut} p={[-2.96, 1.85, mid]} />
        {LEVELS.map((y) => (
          <Part key={y} geo={rbox(0.5, 0.06, len, 0.02)} m={K.walnut} p={[-2.74, y, mid]} />
        ))}
        {[Z0 - 0.05, (Z0 + Z1) / 2, Z1 + 0.05].map((z) => (
          <Part key={z} geo={rbox(0.5, 3.76, 0.07, 0.02)} m={K.walnut} p={[-2.74, 1.88, z]} />
        ))}
        <Part geo={rbox(0.54, 0.08, len + 0.04, 0.03)} m={K.oak} p={[-2.74, 3.72, mid]} />
        <instancedMesh ref={mesh} args={[undefined, undefined, books.length]} castShadow receiveShadow>
          <primitive object={rbox(1, 1, 1, 0.22, 2)} attach="geometry" />
          <primitive object={spine} attach="material" />
        </instancedMesh>
        {/* l'échelle, appuyée contre les étagères, et sa barre de laiton */}
        <group position={[-2.02, 0, 0.9]} rotation-z={0.14}>
          {[-0.26, 0.26].map((z) => (
            <Part key={z} geo={cyl(0.027, 0.027, 3.3, 10)} m={K.oak} p={[0, 1.65, z]} />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <Part key={i} geo={cyl(0.018, 0.018, 0.5, 8)} m={K.oak} p={[0, 0.35 + i * 0.36, 0]} rotation-x={Math.PI / 2} />
          ))}
        </group>
        <Part geo={cyl(0.02, 0.02, len, 10)} m={K.brass} p={[-2.42, 3.55, mid]} rotation-x={Math.PI / 2} />
      </group>
      <group ref={pages.group} />
    </>
  )
}
