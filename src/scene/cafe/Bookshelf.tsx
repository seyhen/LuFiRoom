import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D, type Group, type InstancedMesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { rand } from '../../math'
import { gummy } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'
import { useParticles, useSquash } from '../anim'
import { pageTex } from './textures'
import { Static } from '../Static'
import { K } from './materials'
import { Vines } from '../nature/Vines'

// Les bibliothèques encadrent la cheminée, contre le mur de gauche (face intérieure à x = -3).
// Six planches, cinq rangées de livres tirées une fois pour toutes (graine fixe : la même étagère à chaque visite).
const LEVELS = [0.06, 0.7, 1.34, 1.98, 2.62, 3.26], X = -2.78
const PALETTE = [0x8e2f3a, 0x2c5a4c, 0x25365e, 0xd9a441, 0xe8a0b4, 0xd8cdb4, 0x37a3b5, 0x8a5a44, 0x6e5a9a, 0xc96a3e, 0x3d6b45]

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

/** Un livre : centre (y, z), taille (épaisseur w le long du mur, hauteur h, profondeur d), inclinaison, couleur. Couché si `flat`. */
interface Book {
  y: number
  z: number
  w: number
  h: number
  d: number
  lean: number
  col: number
  flat?: boolean
}

function fill(z0: number, z1: number, seed: number) {
  const r = seeded(seed), out: Book[] = []
  for (let row = 0; row < LEVELS.length - 1; row++) {
    const floor = LEVELS[row] + 0.03
    let z = z0 + 0.04
    while (z < z1 - 0.08) {
      const roll = r()
      if (roll < 0.07 && z < z1 - 0.4) {
        // une pile de livres couchés
        let y = floor
        const n = 2 + ((r() * 3) | 0)
        for (let i = 0; i < n; i++) {
          const h = 0.04 + r() * 0.03, w = 0.26 + r() * 0.08
          out.push({ y: y + h / 2, z: z + 0.17 + (r() - 0.5) * 0.03, w, h, d: 0.24 + r() * 0.06, lean: 0, col: PALETTE[(r() * PALETTE.length) | 0], flat: true })
          y += h
        }
        z += 0.38
        continue
      }
      if (roll < 0.14) z += 0.08 + r() * 0.18 // un vide
      const w = 0.045 + r() * 0.08, h = 0.34 + r() * 0.2, lean = r() < 0.05 ? (r() < 0.5 ? -1 : 1) * (0.14 + r() * 0.1) : 0
      out.push({ y: floor + h / 2, z: z + w / 2, w, h, d: 0.3 + r() * 0.08, lean, col: PALETTE[(r() * PALETTE.length) | 0] })
      z += w + 0.004 + Math.abs(lean) * 0.2
    }
  }
  return out
}

const spine = gummy(0xffffff, { roughness: 0.6, clearcoat: 0.3 })
const bookGeo = rbox(1, 1, 1, 0.22, 2)
const dummy = new Object3D()

/** Une travée de bibliothèque : fond, planches, montants, corniche, livres (un seul appel de dessin pour tous les livres). */
function Shelf({ z0, z1, seed }: { z0: number; z1: number; seed: number }) {
  const mesh = useRef<InstancedMesh>(null!), books = useMemo(() => fill(z0, z1, seed), [z0, z1, seed])
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
  }, [books])
  const mid = (z0 + z1) / 2, len = z1 - z0 + 0.1
  return (
    <>
      <Part geo={rbox(0.06, 3.7, len, 0.02)} m={K.walnut} p={[-2.96, 1.85, mid]} />
      {LEVELS.map((y) => (
        <Part key={y} geo={rbox(0.5, 0.06, len, 0.02)} m={K.walnut} p={[-2.74, y, mid]} />
      ))}
      {[z0 - 0.05, z1 + 0.05].map((z) => (
        <Part key={z} geo={rbox(0.5, 3.76, 0.07, 0.02)} m={K.walnut} p={[-2.74, 1.88, z]} />
      ))}
      <Part geo={rbox(0.56, 0.1, len + 0.08, 0.03)} m={K.oak} p={[-2.73, 3.74, mid]} />
      <Part geo={rbox(0.5, 0.14, len, 0.03)} m={K.walnut} p={[-2.74, 0.07, mid]} />
      <instancedMesh ref={mesh} args={[bookGeo, spine, books.length]} castShadow receiveShadow />
    </>
  )
}

/** La travée du fond, entre le comptoir et la cheminée. Une plante retombe de la corniche. */
export function BackShelf() {
  return (
    <>
      <Shelf z0={-2.12} z1={-1.04} seed={11} />
      <Pothos at={[-2.55, 3.79, -1.55]} />
    </>
  )
}

const Z0 = 1.04, Z1 = 2.72

/** La travée de devant, avec son échelle et sa barre de laiton : on la touche, les pages se tournent. */
export function Bookshelf() {
  const g = useRef<Group>(null!)
  const pages = useParticles(), since = useRef(0)
  useSquash('books', g)
  useFrame((_, delta) => {
    since.current += Math.min(delta, 0.05)
    if (isActive(useStore.getState(), 'books') && since.current > 1.2) {
      since.current = 0
      pages.emit(pageTex, X + 0.55, rand(1.0, 2.8), rand(Z0 + 0.25, Z1 - 0.25), { size: 0.22, life: 2.6, vy: 0.3, sway: 0.15, peak: 0.95 })
    }
  })
  return (
    <>
      {/* le rebond agrandit le groupe autour de son origine : au pied de la travée, pas à l'origine du monde */}
      <group ref={g} userData={{ id: 'books' }} position={[X, 0, (Z0 + Z1) / 2]}>
        <group position={[-X, 0, -(Z0 + Z1) / 2]}>
        <Static>
          <Shelf z0={Z0} z1={Z1} seed={7} />
          {/* l'échelle, appuyée contre les étagères, et sa barre de laiton */}
          <group position={[-2.05, 0, 2.05]} rotation-z={0.15}>
            {[-0.24, 0.24].map((z) => (
              <Part key={z} geo={cyl(0.027, 0.027, 3.45, 10)} m={K.oak} p={[0, 1.72, z]} />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <Part key={i} geo={cyl(0.018, 0.018, 0.48, 8)} m={K.oak} p={[0, 0.35 + i * 0.37, 0]} rotation-x={Math.PI / 2} />
            ))}
            {[-0.24, 0.24].map((z) => (
              <Part key={z} geo={SPH} m={K.brass} scale={0.04} p={[0, 0.03, z]} castShadow={false} />
            ))}
          </group>
          <Part geo={cyl(0.02, 0.02, Z1 - Z0 + 0.1, 10)} m={K.brass} p={[-2.42, 3.55, (Z0 + Z1) / 2]} rotation-x={Math.PI / 2} />
          <Globe at={[-2.74, 3.79, 2.35]} />
        </Static>
        </group>
      </group>
      <group ref={pages.group} />
    </>
  )
}

/** Un globe terrestre sur son pied de laiton, posé sur la corniche. */
function Globe({ at }: { at: [number, number, number] }) {
  const [x, y, z] = at
  return (
    <group position={[x, y, z]}>
      <Part geo={cyl(0.09, 0.11, 0.04, 18)} m={K.walnut} p={[0, 0.02, 0]} />
      <Part geo={cyl(0.012, 0.016, 0.1, 8)} m={K.brass} p={[0, 0.09, 0]} castShadow={false} />
      <group position={[0, 0.27, 0]} rotation-x={0.4}>
        <Part geo={SPH} m={K.teal} scale={0.15} />
        <Part geo={SPH} m={K.mustard} scale={[0.07, 0.09, 0.06]} p={[0.06, 0.04, 0.1]} castShadow={false} />
        <Part geo={SPH} m={K.mustard} scale={[0.06, 0.05, 0.05]} p={[-0.09, -0.05, 0.09]} castShadow={false} />
        <Part m={K.brass} castShadow={false} rotation-y={Math.PI / 2}>
          <torusGeometry args={[0.175, 0.01, 6, 28, Math.PI * 1.2]} />
        </Part>
      </group>
    </group>
  )
}

/** Un pothos en pot dont les tiges retombent le long de la corniche. */
export function Pothos({ at, drop = 0.9 }: { at: [number, number, number]; drop?: number }) {
  const [x, y, z] = at
  return (
    <group position={[x, y, z]}>
      <Part geo={cyl(0.12, 0.09, 0.18, 16)} m={K.pot} p={[0, 0.09, 0]} />
      {/* les tiges tombent dans le vide, devant la corniche (dont le bord est à x = -2,45) : le pot est au bord, elles ne traversent pas la planche */}
      <Vines p={[0, 0.17, 0]} strands={[[0.17, -0.12, drop], [0.18, 0.04, drop * 0.65], [0.16, 0.13, drop * 1.2]]} m={K.leafV} m2={K.leafVDark} size={0.085} crown={7} seed={Math.round((x + z) * 10)} />
    </group>
  )
}
