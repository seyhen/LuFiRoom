import { TAU } from '../../math'
import { Batch, Part, SPH, rbox, type Item } from '../parts'
import { C } from './materials'
import { spray } from './spray'

// Sur le mur du fond, entre le conduit de la cheminée et la fenêtre.
const POS = [-0.47, 2.8, -2.97] as const
const R = 0.33
const hash = (i: number) => {
  const v = Math.sin(i * 39.346) * 43758.5453
  return v - Math.floor(v)
}
const GREENS = [0x3f9474, 0x58a886, 0x2f7d63]
const RED = 0xd25c72

// Les rameaux : couchés le long de l'anneau, dans les deux sens, sur deux rangs (et non des boules).
const sprays: Item[] = Array.from({ length: 44 }, (_, i): Item => {
  const a = (i / 44) * TAU, r = R + (i % 2 ? 0.045 : -0.045) + (hash(i) - 0.5) * 0.03
  return { p: [Math.cos(a) * r, Math.sin(a) * r, 0.06 + hash(i + 7) * 0.04], s: 0.2 + hash(i + 3) * 0.06, r: [hash(i + 5) * 6, (hash(i + 2) - 0.5) * 0.7, a + Math.PI / 2 + (i % 4 < 2 ? 0 : Math.PI) + (hash(i + 9) - 0.5) * 0.4], c: GREENS[i % 3] }
})

const items: Item[] = [
  // grappes de baies, sauf en bas où est le nœud
  ...[0.5, 1.35, 2.3, 3.1, 3.9, 5.6].flatMap((a, k) =>
    [0, 1, 2].map((j): Item => ({ p: [Math.cos(a + j * 0.09) * (R + 0.05 - j * 0.03), Math.sin(a + j * 0.09) * (R + 0.05 - j * 0.03), 0.12], s: 0.032, c: k % 3 === 2 ? 0xfff4e6 : RED })),
  ),
  // nœud : deux boucles et le centre
  { p: [-0.1, -R + 0.02, 0.12], s: [0.12, 0.075, 0.045], r: [0, 0, -0.45], c: RED },
  { p: [0.1, -R + 0.02, 0.12], s: [0.12, 0.075, 0.045], r: [0, 0, 0.45], c: RED },
  { p: [0, -R + 0.01, 0.14], s: 0.05, c: RED },
]

/** Couronne de Noël : sapin, baies, nœud rouge, pendue à un ruban. */
export function Wreath() {
  return (
    <group position={POS as unknown as [number, number, number]}>
      <Part geo={rbox(0.05, 0.42, 0.02, 0.01)} m={C.cranberry} p={[0, R + 0.21, 0.01]} castShadow={false} />
      <Part geo={SPH} m={C.gold} scale={0.03} p={[0, R + 0.43, 0.02]} castShadow={false} />
      <Part m={C.pine} p={[0, 0, 0.02]}>
        <torusGeometry args={[R, 0.055, 12, 40]} />
      </Part>
      <Batch geo={spray} m={C.needle} items={sprays} />
      <Batch geo={SPH} m={C.tint} items={items} />
      {[-1, 1].map((s) => (
        <Part key={s} geo={rbox(0.07, 0.24, 0.025, 0.012)} m={C.cranberry} p={[s * 0.06, -R - 0.13, 0.11]} rotation-z={s * 0.25} castShadow={false} />
      ))}
    </group>
  )
}
