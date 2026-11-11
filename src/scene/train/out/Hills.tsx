import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Float32BufferAttribute, type Group } from 'three'
import { TAU, seeded } from '../../../math'
import { reduceMotion } from '../../anim'
import { LIVE } from '../../Static'
import { noRay } from '../../parts'
import { Firs, type Fir } from '../../nature/firs'
import { noise } from '../../outdoor'
import { R } from './materials'
import { GROUND, SPEED } from './Line'

/** Le motif des collines (périodique), et leur vitesse : plus loin, elles défilent moins vite que la voie. */
const P = 30
const Z0 = -5.5, Z1 = -15

/** La hauteur des collines : rien au pied (le pré), des croupes douces qui montent vers le fond, périodiques sur P. */
function hillY(x: number, z: number) {
  const t = Math.min(1, Math.max(0, (Z0 - z) / (Z0 - Z1)))
  const w = Math.sin((x / P) * TAU) * 0.8 + Math.sin((x / P) * TAU * 2 + 1.3) * 0.5 + Math.sin((x / P) * TAU * 3 + 0.4) * 0.25
  return GROUND + t * t * (2.6 + w * 1.1) + noise(((x % P) + P) % P, z) * 0.12 * t
}

function hillGeo() {
  const NX = 120, NZ = 14, pos: number[] = [], uv: number[] = [], idx: number[] = []
  for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) {
    const x = -P + (i / NX) * 3 * P, z = Z0 - (j / NZ) * (Z0 - Z1)
    pos.push(x, hillY(x, z), z); uv.push(x / 3, z / 3)
  }
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
    const a = j * (NX + 1) + i, b = a + NX + 1
    idx.push(a, b, a + 1, a + 1, b, b + 1)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

function forest(): Fir[] {
  const r = seeded(13), out: Fir[] = []
  for (let i = 0; i < 16; i++) {
    const x = r() * P, z = -7 - r() * 5.5, h = 1.8 + r() * 2.2
    for (const k of [-1, 0, 1]) out.push({ p: [x + k * P, hillY(x, z) - 0.1, z], h, tiers: 4, snow: 0 })
  }
  return out
}

/** Les collines boisées derrière la voie : elles défilent à 40 % de la vitesse du train (elles sont plus loin). */
export function Hills() {
  const g = useRef<Group>(null!), s = useRef(0)
  const geo = useMemo(hillGeo, [])
  const firs = useMemo(forest, [])
  useFrame((_, delta) => {
    if (!reduceMotion) s.current = (s.current + Math.min(delta, 0.05) * SPEED * 0.4) % P
    g.current.position.x = -s.current
  })
  return (
    <group ref={g} userData={LIVE}>
      <mesh geometry={geo} material={R.hill} receiveShadow raycast={noRay} />
      <Firs list={firs} m={R.fir} snowM={R.snowCap} trunkM={R.trunk} seed={2} />
    </group>
  )
}
