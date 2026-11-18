import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, BufferGeometry, Float32BufferAttribute, type Group, type Mesh, type PointsMaterial } from 'three'
import { TAU, rand, seeded } from '../../math'
import { isActive, useStore } from '../../state/store'
import { reduceMotion, useSquash, useWorldPointSize } from '../anim'
import { blob, cone, ell, pair } from '../blob'
import { Batch, SPH, noRay, type Item, type V3 } from '../parts'
import { LIVE } from '../Static'
import { B } from './materials'
import { TUB } from './tubGeo'
import { TUB_AT } from './Tub'
import { bubbleTex } from './textures'

/** Le pied de la mousse : le milieu du tas, à la surface de l'eau, dans la moitié du bain qui est loin du robinet. */
const FOOT: V3 = [TUB_AT[0] + 0.52, TUB.water, TUB_AT[2]]

/** Les monticules de la mousse : [x, y, z, rx, ry, rz, couleur] depuis le pied (y depuis l'eau). Un tas qui dépasse le bord de 16 cm. */
const MOUNDS: [number, number, number, number, number, number, number][] = [
  [0, 0.05, 0, 0.4, 0.12, 0.36, 0xfff6f6],
  [-0.2, 0.17, -0.08, 0.2, 0.17, 0.17, 0xfff1f4],
  [0.12, 0.2, 0.1, 0.22, 0.22, 0.2, 0xffffff],
  [0.27, 0.13, -0.08, 0.15, 0.15, 0.15, 0xfff1f4],
  [-0.05, 0.28, 0.0, 0.17, 0.17, 0.16, 0xfff7fa],
  [0.0, 0.16, -0.24, 0.15, 0.13, 0.12, 0xf9f1ff],
  [-0.3, 0.1, 0.14, 0.15, 0.11, 0.13, 0xffeef2],
  [0.2, 0.3, 0.02, 0.12, 0.12, 0.12, 0xfffafa],
  [-0.18, 0.12, 0.26, 0.13, 0.1, 0.1, 0xf9f1ff],
]
const FOAM = blob(MOUNDS.map(([x, y, z, rx, ry, rz, color]) => ell([x, y, z], [rx, ry, rz], { color })), { h: 0.018, k: 0.07, pad: 0.04 })

/** La hauteur du tas à (x, z) : le haut du monticule le plus haut (0 hors du tas). */
function top(x: number, z: number) {
  let y = 0
  for (const [cx, cy, cz, rx, ry, rz] of MOUNDS) {
    const k = 1 - ((x - cx) / rx) ** 2 - ((z - cz) / rz) ** 2
    if (k > 0) y = Math.max(y, cy + ry * Math.sqrt(k))
  }
  return y
}

/** Les bulles qui ornent le tas : de petites sphères enfoncées à moitié dans la mousse, de tailles différentes. */
const BUBBLES: Item[] = (() => {
  const r = seeded(17), items: Item[] = []
  while (items.length < 70) {
    const x = (r() - 0.5) * 0.9, z = (r() - 0.5) * 0.74, y = top(x, z)
    if (y < 0.08) continue
    const s = 0.016 + r() ** 2 * 0.04
    items.push({ p: [x, y - s * 0.3, z], s, c: [0xffffff, 0xfff0f4, 0xf2f0ff, 0xf0fbff][items.length % 4] })
  }
  return items
})()

/** Le canard de bain : un seul volume jaune (corps, queue, tête, aile de chaque côté, bec orange), tourné vers +x. */
const DUCK = blob(
  [
    ell([0, 0.07, 0], [0.095, 0.07, 0.075], { color: 0xf8d24c }),
    cone([-0.07, 0.09, 0], [-0.135, 0.15, 0], 0.036, 0.017, { color: 0xf8d24c }),
    ell([0.068, 0.17, 0], [0.052, 0.05, 0.048], { color: 0xf8d24c }),
    ell([0.12, 0.16, 0], [0.034, 0.016, 0.03], { color: 0xf49a3c, k: 0.012 }),
    ...pair(ell([-0.005, 0.085, 0.066], [0.05, 0.036, 0.028], { rot: [0, 0, -0.2], color: 0xf1c23c, k: 0.02 })),
  ],
  { h: 0.008, k: 0.03, pad: 0.03 },
)

const N_BIG = 16, N_SMALL = 26

/** Des bulles de savon qui s'élèvent du tas, se balancent, s'effacent : un nuage de points additifs (un tracé), un par taille. */
function Floaters({ n, size, rise, mat }: { n: number; size: number; rise: number; mat: RefObject<PointsMaterial> }) {
  const st = useMemo(() => Array.from({ length: n }, (_, i) => ({ x: rand(-0.4, 0.4), z: rand(-0.3, 0.3), age: (i / n) * 6, life: rand(4.5, 8), ph: rand(0, TAU), sp: rand(0.8, 1.2) })), [n])
  const geo = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(new Float32Array(n * 3), 3))
    g.setAttribute('color', new Float32BufferAttribute(new Float32Array(n * 3), 3))
    return g
  }, [n])
  useWorldPointSize(mat, size)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), on = isActive(useStore.getState(), 'foam')
    const pos = geo.attributes.position as BufferAttribute, col = geo.attributes.color as BufferAttribute
    st.forEach((b, i) => {
      if (!reduceMotion) b.age += dt * (on ? 1 : 0.4) * b.sp
      if (b.age > b.life) { b.age = 0; b.x = rand(-0.4, 0.4); b.z = rand(-0.3, 0.3); b.life = rand(4.5, 8) }
      const k = b.age / b.life, y0 = top(b.x, b.z)
      pos.setXYZ(i, b.x + Math.sin(b.ph + b.age * 1.3) * 0.05 * k, Math.max(0.1, y0) + 0.02 + k * rise, b.z + Math.cos(b.ph + b.age * 1.1) * 0.04 * k)
      const f = Math.sin(Math.PI * Math.min(1, k * 1.15)) * (on ? 1 : 0.28)
      col.setXYZ(i, f, f, f)
    })
    pos.needsUpdate = true
    col.needsUpdate = true
  })
  return <points geometry={geo} frustumCulled={false} renderOrder={4} raycast={noRay}>
    <pointsMaterial ref={mat} map={bubbleTex} size={10} sizeAttenuation={false} transparent depthWrite={false} blending={AdditiveBlending} vertexColors />
  </points>
}

/**
 * La mousse du bain, objet « mousse » : un grand tas de mousse rose et blanche (un seul volume lissé, surmonté de bulles de toutes
 * tailles) qui déborde du bord de la baignoire, et un canard de bain jaune posé dessus. Quand le son joue, le tas respire, le canard
 * se balance et des bulles de savon irisées s'en élèvent en tournoyant ; sinon seules quelques-unes flottent, très lentement.
 */
export function Suds() {
  const g = useRef<Group>(null!), mound = useRef<Mesh>(null!), duck = useRef<Group>(null!), big = useRef<PointsMaterial>(null!), small = useRef<PointsMaterial>(null!), t = useRef(0)
  useSquash('foam', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), on = isActive(useStore.getState(), 'foam')
    if (!reduceMotion) t.current += dt * (on ? 1 : 0.35)
    mound.current.scale.y = 1 + Math.sin(t.current * 1.7) * (on ? 0.018 : 0.006)
    duck.current.position.y = DUCK_AT[1] + Math.sin(t.current * 1.4) * 0.008
    duck.current.rotation.z = Math.sin(t.current * 1.1) * 0.05
    duck.current.rotation.x = Math.sin(t.current * 0.9 + 1) * 0.04
  })
  return (
    <group ref={g} userData={{ id: 'foam' }} position={FOOT}>
      <mesh ref={mound} geometry={FOAM} material={B.foam} castShadow receiveShadow />
      <Batch geo={SPH} m={B.foamBubble} items={BUBBLES} />
      <group ref={duck} position={DUCK_AT} rotation-y={-0.7} userData={LIVE}>
        <mesh geometry={DUCK} material={B.duckSkin} castShadow receiveShadow />
        {[-1, 1].map((s) => <mesh key={s} geometry={SPH} material={B.eye} scale={0.011} position={[0.093, 0.19, s * 0.034]} raycast={noRay} />)}
      </group>
      <Floaters n={N_BIG} size={0.1} rise={0.6} mat={big} />
      <Floaters n={N_SMALL} size={0.05} rise={0.45} mat={small} />
    </group>
  )
}

/** Où se pose le canard sur le tas : sur le monticule le plus haut à droite, un peu enfoncé. */
const DUCK_AT: V3 = [0.16, top(0.16, 0.06) - 0.012, 0.06]
