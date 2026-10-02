import { M } from '../materials'
import { Batch, Part, SPH, cyl, type Item, type V3 } from '../parts'
import { B } from './materials'

// Des lames dressées en couronne, plus hautes au centre ; une teinte sur deux plus claire.
const BLADES: Item[] = Array.from({ length: 11 }, (_, i) => {
  const a = i * 2.4, r = i === 0 ? 0 : 0.05 + (i % 4) * 0.025, h = 0.9 - (i % 5) * 0.11
  return {
    p: [Math.cos(a) * r, 0.32 + h / 2, Math.sin(a) * r],
    s: [0.07 + (i % 3) * 0.01, h / 2, 0.026],
    r: [Math.sin(a) * 0.1, -a, -Math.cos(a) * 0.1],
    c: i % 2 ? 0x3f9f78 : 0x6fbf8a,
  }
})

/** Sansevière dans un pot menthe, au bout du bureau. */
export function SnakePlant({ position = [3.0, 0, -1.7] }: { position?: V3 }) {
  return (
    <group position={position}>
      <Part geo={cyl(0.19, 0.15, 0.32, 22)} m={M.mint} p={[0, 0.16, 0]} />
      <Part m={B.trim} p={[0, 0.31, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.19, 0.016, 8, 24]} />
      </Part>
      <Part geo={cyl(0.17, 0.17, 0.03, 20)} m={B.soil} p={[0, 0.325, 0]} />
      <Batch geo={SPH} m={B.trim} items={BLADES} shadow />
    </group>
  )
}

