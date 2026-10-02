import { M } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'
import { posterTex } from '../textures'

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

/** Étagère avec livres et petite plante, poster encadré au-dessus. */
export function Shelf() {
  return (
    <>
      <Part geo={rbox(1.7, 0.08, 0.34, 0.03)} m={M.woodLight} p={[-1.35, 2.3, -2.83]} />
      {BOOKS.map((b, i) => (
        <Part key={i} geo={rbox(b.w, b.h, 0.26, 0.025)} m={b.m} p={[b.x, b.y, -2.83]} rotation-z={b.tilt} />
      ))}
      <Part geo={cyl(0.09, 0.075, 0.15, 18)} m={M.terracotta} p={[-0.75, 2.415, -2.83]} />
      <Part geo={SPH} m={M.leaf} scale={[0.07, 0.13, 0.07]} p={[-0.75, 2.56, -2.83]} />
      <Part geo={rbox(0.9, 1.1, 0.06, 0.04)} m={M.plum} p={[-1.3, 3.42, -2.97]} />
      <mesh position={[-1.3, 3.42, -2.935]} receiveShadow>
        <planeGeometry args={[0.78, 0.98]} />
        <meshStandardMaterial map={posterTex} roughness={0.8} />
      </mesh>
    </>
  )
}
