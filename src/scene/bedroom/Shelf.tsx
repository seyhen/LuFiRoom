import { M } from '../materials'
import { Batch, Part, SPH, cyl, rbox, type Item } from '../parts'
import { Candles } from '../objects/Candles'
import { B } from './materials'

// Livres serrés de gauche à droite ; le dernier penche.
const BOOKS = (() => {
  const mats = [M.pink, M.mint, M.butter, M.peri, M.teal, M.terracotta]
  let x = -2.1
  return mats.map((m, i) => {
    const w = 0.09 + (i % 3) * 0.02, h = 0.36 + ((i * 7) % 5) * 0.03, last = i === mats.length - 1
    const book = { m, w, h, x: x + w / 2 + (last ? 0.08 : 0), y: 2.34 + h / 2 - (last ? 0.03 : 0), tilt: last ? -0.32 : 0 }
    x += w + 0.012
    return book
  })
})()

// La plante qui retombe du bord de l'étagère : des feuilles le long d'une courbe qui descend.
const VINE: Item[] = Array.from({ length: 13 }, (_, i) => {
  const t = i / 12, side = i % 2 ? 1 : -1
  return {
    p: [-0.8 + side * 0.07 + Math.sin(t * 4) * 0.03, 2.46 - t * 0.8, -2.74],
    s: [0.09 - t * 0.02, 0.02, 0.06 - t * 0.012],
    r: [0.3, side * 0.5, side * (0.9 - t * 0.2)],
    c: i % 3 === 0 ? 0x8ed59b : i % 3 === 1 ? 0x67bb7c : 0x4aa885,
  }
})
const CANDLE = [{ p: [-1.12, 2.34, -2.8] as [number, number, number], h: 0.15, r: 0.065 }]

/** Étagère sur équerres : livres, cadre photo, bougie, pot d'où retombe une plante. Trois cadres au mur au-dessus. */
export function Shelf() {
  return (
    <>
      <Part geo={rbox(1.7, 0.08, 0.34, 0.03)} m={M.woodLight} p={[-1.35, 2.3, -2.83]} />
      {[-2.0, -0.7].map((x) => (
        <Part key={x} geo={rbox(0.05, 0.2, 0.26, 0.02)} m={B.trim} p={[x, 2.17, -2.86]} castShadow={false} />
      ))}
      {BOOKS.map((b, i) => (
        <Part key={i} geo={rbox(b.w, b.h, 0.26, 0.025)} m={b.m} p={[b.x, b.y, -2.83]} rotation-z={b.tilt} />
      ))}
      {/* petit cadre photo debout */}
      <Part geo={rbox(0.24, 0.3, 0.03, 0.015)} m={M.plum} p={[-1.4, 2.5, -2.85]} rotation-y={0.2} />
      <mesh position={[-1.4, 2.5, -2.832]} rotation-y={0.2} material={B.moonPrint}>
        <planeGeometry args={[0.19, 0.24]} />
      </mesh>
      <Part geo={cyl(0.09, 0.075, 0.15, 18)} m={M.terracotta} p={[-0.75, 2.415, -2.83]} />
      <Part geo={SPH} m={M.leaf} scale={[0.07, 0.07, 0.07]} p={[-0.75, 2.52, -2.83]} />
      <Batch geo={SPH} m={B.trim} items={VINE} />
      <Candles items={CANDLE} />
      {/* au mur : trois cadres, le grand au milieu */}
      <Part geo={rbox(0.9, 1.1, 0.06, 0.04)} m={M.plum} p={[-1.3, 3.42, -2.97]} />
      <mesh position={[-1.3, 3.42, -2.935]} material={B.sunset} receiveShadow>
        <planeGeometry args={[0.78, 0.98]} />
      </mesh>
      <Part geo={rbox(0.5, 0.64, 0.05, 0.035)} m={B.trim} p={[-2.4, 3.3, -2.975]} />
      <mesh position={[-2.4, 3.3, -2.945]} material={B.moonPrint} receiveShadow>
        <planeGeometry args={[0.4, 0.52]} />
      </mesh>
      <Part geo={rbox(0.44, 0.56, 0.05, 0.035)} m={B.trim} p={[-2.62, 2.5, -2.975]} />
      <mesh position={[-2.62, 2.5, -2.945]} material={B.leafPrint} receiveShadow>
        <planeGeometry args={[0.35, 0.45]} />
      </mesh>
    </>
  )
}
