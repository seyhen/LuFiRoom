import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type InstancedMesh } from 'three'
import { Batch, Part, SPH, cyl, type Item } from '../parts'
import { C } from './materials'
import { Candles, type Candle } from '../objects/Candles'
import { treeTop, twinkle } from './ChristmasTree'
import { spray } from './spray'

// Dans le repère de la cheminée. Le dessus du manteau est à 1.9, son bord avant à 0.51 ; le conduit occupe x ±0.78, z < 0.23.
const TOP = 1.9
const hash = (i: number) => {
  const v = Math.sin(i * 78.233) * 43758.5453
  return v - Math.floor(v)
}
/** La guirlande pend en deux festons devant le manteau. */
const along = (f: number): [number, number, number] => {
  const sag = Math.sin(Math.PI * ((f * 2) % 1))
  return [-1.12 + 2.24 * f, TOP + 0.03 - 0.17 * sag, 0.48 + 0.06 * sag]
}

const GREENS = [0x3f9474, 0x58a886, 0x2f7d63]
// De vrais rameaux couchés le long du feston (et non des boules) : chacun suit la pente de la guirlande, avec un peu de désordre.
const sprays: Item[] = Array.from({ length: 56 }, (_, i): Item => {
  const f = i / 55, [x, y, z] = along(f), [x2, y2] = along(Math.min(1, f + 0.01)), [x1, y1] = along(Math.max(0, f - 0.01))
  const slope = Math.atan2(y2 - y1, x2 - x1 || 0.01)
  return { p: [x + (hash(i) - 0.5) * 0.04, y + (hash(i + 9) - 0.5) * 0.04, z + (hash(i + 4) - 0.5) * 0.04], s: 0.2 + hash(i + 3) * 0.08, r: [hash(i + 6) * 6, (hash(i + 1) - 0.5) * 0.9, slope + (hash(i + 8) - 0.5) * 0.5 + (i % 2 ? Math.PI : 0)], c: GREENS[i % 3] }
})
const berries: Item[] = Array.from({ length: 11 }, (_, i): Item => {
  const [x, y, z] = along((i + 0.3 + hash(i + 40) * 0.4) / 11)
  return { p: [x, y - 0.03, z + 0.07], s: 0.032, c: 0xd9506a }
})
const BULB = [0xffd36b, 0xfff0c8, 0xff9fb0]
const bulbs: Item[] = Array.from({ length: 14 }, (_, i) => {
  const [x, y, z] = along((i + 0.5) / 14)
  return { p: [x, y + 0.02, z + 0.075], s: 0.026, c: BULB[i % 3] }
})
const bulbBase = bulbs.map((b) => new Color(b.c))

const CANDLES: Candle[] = [
  { p: [0.98, TOP, 0.12], h: 0.3 },
  { p: [0.84, TOP, 0.33], h: 0.2 },
  { p: [0.63, TOP, 0.35], h: 0.13, r: 0.05 },
]

/** Sur la cheminée : guirlande de sapin à baies et petites lumières, deux sapins miniatures, trois bougies. */
export function MantelDecor() {
  const lights = useRef<InstancedMesh>(null!)
  useFrame(({ clock }) => twinkle(lights.current, bulbBase, clock.elapsedTime + 3))
  return (
    <>
      <Batch geo={spray} m={C.needle} items={sprays} />
      <Batch geo={SPH} m={C.tint} items={berries} />
      <Batch ref={lights} geo={SPH} m={C.bulb} items={bulbs} />
      {[
        { x: -0.98, z: 0.12, s: 0.44, m: C.pineLight },
        { x: -0.66, z: 0.34, s: 0.3, m: C.pine },
      ].map(({ x, z, s, m }) => (
        <group key={x} position={[x, TOP, z]}>
          <Part geo={cyl(0.035, 0.045, 0.06, 10)} m={C.log} p={[0, 0.03, 0]} castShadow={false} />
          <Part geo={treeTop} m={m} p={[0, 0.05, 0]} scale={s} castShadow={false} />
        </group>
      ))}
      <Candles items={CANDLES} />
    </>
  )
}
