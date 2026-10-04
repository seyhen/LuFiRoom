import { M } from '../materials'
import { Part, cyl, rbox } from '../parts'
import { Candles } from '../objects/Candles'
import { Vines } from '../nature/Vines'
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
      {/* le pothos : le pot au bord de la planche (le bord avant est à z = -2,66), les tiges pendent dans le vide, devant */}
      <Part geo={cyl(0.09, 0.075, 0.15, 18)} m={M.terracotta} p={[-0.75, 2.415, -2.73]} />
      <Vines p={[-0.75, 2.48, -2.73]} strands={[[-0.07, 0.12, 0.75], [0.0, 0.13, 0.5], [0.07, 0.12, 0.9]]} m={M.leaf} m2={B.leafDeep} size={0.085} crown={7} seed={4} />
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
