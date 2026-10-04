import { M } from '../materials'
import { Batch, Part, SPH, cyl, rbox, type Item } from '../parts'
import { C } from './materials'
import { Candles, type Candle } from '../objects/Candles'

// Par terre, devant à droite, loin du meuble du tourne-disque : deux livres, la lanterne posée dessus.
const [X, Z] = [2.5, 1.7]
const TOP = 0.195

// Couverture, puis les pages en retrait (elles dépassent un peu sur la tranche).
const book = (y: number, w: number, h: number, d: number, r: number, cover: number): Item[] => [
  { p: [X, y, Z], s: [w, h, d], r: [0, r, 0], c: cover },
  { p: [X, y, Z], s: [w - 0.04, h - 0.025, d + 0.006], r: [0, r, 0], c: 0xfff3dc },
]
const BOOKS: Item[] = [...book(0.05, 0.62, 0.1, 0.46, 0.2, 0xd25c72), ...book(0.15, 0.5, 0.09, 0.38, -0.15, 0x6db492)]
const CANDLE: Candle[] = [{ p: [X, TOP + 0.04, Z], h: 0.14, r: 0.045 }]

/** Lanterne blanche à bougie, posée sur une pile de livres. Elle luit surtout la nuit. */
export function Lantern() {
  return (
    <>
      <Batch geo={rbox(1, 1, 1, 0.1)} m={C.paper} items={BOOKS} shadow />
      <group position={[X, TOP, Z]}>
        <Part geo={cyl(0.15, 0.16, 0.04, 24)} m={M.cream} p={[0, 0.02, 0]} />
        <mesh geometry={cyl(0.12, 0.12, 0.32, 24)} material={M.glass} position={[0, 0.2, 0]} />
        <Part geo={cyl(0.14, 0.15, 0.04, 24)} m={M.cream} p={[0, 0.38, 0]} />
        <Part geo={SPH} m={M.cream} scale={[0.12, 0.07, 0.12]} p={[0, 0.4, 0]} />
        <Part geo={SPH} m={M.cream} scale={0.03} p={[0, 0.48, 0]} castShadow={false} />
        <Part m={M.plum} p={[0, 0.46, 0]} rotation-y={Math.PI / 4} castShadow={false}>
          <torusGeometry args={[0.07, 0.012, 8, 20, Math.PI]} />
        </Part>
      </group>
      <Candles items={CANDLE} />
    </>
  )
}
