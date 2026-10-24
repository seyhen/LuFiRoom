import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D, type Group, type InstancedMesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, clamp, smooth } from '../../math'
import { gummy } from '../materials'
import { Batch, Part, SPH, cyl, noRay, rbox, type Item } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { K } from './materials'

/** L'étal de fruits du marchand, devant la carriole : son pied au sol. */
export const STALL = { x: 1.1, z: 2.0, top: 0.66 }
const fruit = gummy(0xffffff, { roughness: 0.35, clearcoat: 0.8 })
const bead = gummy(0xffffff, { roughness: 0.4, clearcoat: 0.7 })
const RODS = 5, BEADS = 5
const ROD_Y = (r: number) => (r - 2) * 0.042
const LEFT = -0.135, RIGHT = 0.135, STEP = 0.024 // les butées de la tige et l'écart entre deux perles

// les fruits : mandarines, pommes rouges, poires, dans deux cagettes
const CRATES = [0.06, 0.3]
const FRUITS: Item[] = CRATES.flatMap((x0, crate) =>
  Array.from({ length: 8 }, (_, i) => ({
    p: [x0 + ((i % 2) - 0.5) * 0.09, STALL.top + 0.105 + (i % 3) * 0.004, -0.105 + (i >> 1) * 0.07] as [number, number, number],
    s: 0.036,
    c: [0xf2902f, 0xd6334f, 0xf2902f, 0xa7c850][(i + crate * 2) % 4],
  })),
)

/**
 * L'étal de fruits : un petit comptoir de bois, deux cagettes de mandarines, de pommes et de poires, et le boulier du marchand,
 * appuyé contre un tasseau. Quand le son joue, les perles glissent d'un côté à l'autre des tiges, l'une après l'autre, comme
 * pour un compte qu'on refait ; au repos, elles restent là où elles sont.
 */
export function FruitStall() {
  const g = useRef<Group>(null!), beads = useRef<InstancedMesh>(null!), st = useRef({ k: 0, ph: 0 })
  useSquash('abacus', g)
  useLayoutEffect(() => {
    const c = new Color()
    for (let r = 0; r < RODS; r++) for (let i = 0; i < BEADS; i++) beads.current.setColorAt(r * BEADS + i, c.setHex((r + i) % 2 ? 0xd6334f : 0xf0d9a0))
    if (beads.current.instanceColor) beads.current.instanceColor.needsUpdate = true
  }, [])
  const dummy = useRef(new Object3D())
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'abacus')
    s.k = approach(s.k, on ? 1 : 0, dt * 2)
    if (!reduceMotion) s.ph += dt * 0.9 * s.k // la phase s'ajoute image après image
    const d = dummy.current
    for (let r = 0; r < RODS; r++) {
      // combien de perles sont passées à droite : un va-et-vient lent, décalé d'une tige à l'autre
      const a = (Math.sin(s.ph * 0.9 + r * 1.35) * 0.5 + 0.5) * (BEADS + 0.4)
      for (let i = 0; i < BEADS; i++) {
        const u = smooth(clamp(a - i, 0, 1))
        const xl = LEFT + i * STEP, xr = RIGHT - (BEADS - 1 - i) * STEP
        d.position.set(xl + (xr - xl) * u, ROD_Y(r), 0)
        d.scale.set(0.011, 0.0185, 0.0185)
        d.updateMatrix()
        beads.current.setMatrixAt(r * BEADS + i, d.matrix)
      }
    }
    beads.current.instanceMatrix.needsUpdate = true
  })
  return (
    <group ref={g} userData={{ id: 'abacus' }} position={[STALL.x, 0, STALL.z]} rotation-y={0.25}>
      <Static>
        {/* le comptoir : un plateau de bois, quatre pieds, une étagère basse */}
        <Part geo={rbox(0.95, 0.05, 0.5, 0.02)} m={K.wood} p={[0, STALL.top - 0.025, 0]} />
        {[[-0.4, -0.2], [0.4, -0.2], [-0.4, 0.2], [0.4, 0.2]].map(([x, z]) => (
          <Part key={`${x}${z}`} geo={rbox(0.05, STALL.top - 0.05, 0.05, 0.015)} m={K.woodDark} p={[x, (STALL.top - 0.05) / 2, z]} />
        ))}
        <Part geo={rbox(0.85, 0.03, 0.42, 0.012)} m={K.woodDark} p={[0, 0.2, 0]} castShadow={false} />
        {/* deux cagettes de bois clair, sur la moitié droite */}
        {CRATES.map((x, i) => (
          <group key={i} position={[x, STALL.top, 0.0]}>
            <Part geo={rbox(0.22, 0.09, 0.3, 0.01)} m={K.woodPale} p={[0, 0.045, 0]} />
            <Part geo={rbox(0.2, 0.012, 0.28, 0.005)} m={K.woodDark} p={[0, 0.088, 0]} castShadow={false} />
          </group>
        ))}
        {/* le boulier : un cadre de bois sombre, appuyé contre un tasseau, des tiges de laiton */}
        <group position={[-0.27, STALL.top + 0.015, 0.0]} scale={1.2}>
          <Part geo={rbox(0.34, 0.06, 0.07, 0.015)} m={K.woodDark} p={[0, 0.03, -0.1]} />
          <group position={[0, 0.14, -0.04]} rotation-x={-0.22}>
            {[-1, 1].map((s) => (
              <Part key={s} geo={rbox(0.03, 0.27, 0.035, 0.012)} m={K.wood} p={[s * 0.19, 0, 0]} castShadow={false} />
            ))}
            {[-1, 1].map((s) => (
              <Part key={s} geo={rbox(0.4, 0.03, 0.035, 0.012)} m={K.wood} p={[0, s * 0.135, 0]} castShadow={false} />
            ))}
            {Array.from({ length: RODS }, (_, r) => (
              <Part key={r} geo={cyl(0.0035, 0.0035, 0.36, 6)} m={K.brass} p={[0, ROD_Y(r), 0]} rotation-z={Math.PI / 2} castShadow={false} />
            ))}
          </group>
        </group>
      </Static>
      {/* les fruits des cagettes, en un seul tracé */}
      <Batch geo={SPH} m={fruit} items={FRUITS} />
      {/* les perles du boulier : un seul tracé, repositionnées à chaque image */}
      <group position={[-0.27, STALL.top + 0.015, 0]} scale={1.2}>
        <group position={[0, 0.14, -0.04]} rotation-x={-0.22}>
          <instancedMesh ref={beads} args={[SPH, bead, RODS * BEADS]} raycast={noRay} castShadow />
        </group>
      </group>
    </group>
  )
}
