import { useEffect, useMemo } from 'react'
import { CircleGeometry } from 'three'
import { seeded } from '../../../math'
import { Leaf } from '../../nature/Leaf'
import { Foliage } from '../../nature/Foliage'
import { Rock } from '../../nature/Rock'
import { crownFronds, mergeFronds, trunkGeo } from '../palm'
import { LAKE, groundY } from './ground'
import { O } from './materials'

// Les trois troncs (hauteur, penchant du sommet) et les deux couronnes (neuf palmes) du bosquet : on les fabrique une fois et on les pose
// partout avec une rotation et une échelle (un palmier est une paire de maillages ; <Static> fusionne tous ceux du bosquet).
const TRUNKS: { h: number; lean: [number, number] }[] = [{ h: 3.6, lean: [0.5, 0.2] }, { h: 4.2, lean: [-0.55, 0.35] }, { h: 4.8, lean: [0.3, -0.5] }]

interface PalmAt { x: number; z: number; t: 0 | 1 | 2; c: 0 | 1; ry: number; s: number }
const PALMS: PalmAt[] = [
  // le bosquet de la cuvette, à gauche de la pièce
  { x: -6.6, z: -0.4, t: 0, c: 0, ry: 0.4, s: 1.0 }, { x: -9.6, z: -0.8, t: 1, c: 1, ry: 2.1, s: 1.0 }, { x: -6.2, z: -4.2, t: 2, c: 1, ry: 3.6, s: 0.95 },
  { x: -10.2, z: -4.0, t: 0, c: 0, ry: 1.0, s: 0.95 }, { x: -8.2, z: -5.6, t: 1, c: 0, ry: 5.0, s: 0.9 }, { x: -7.8, z: 1.6, t: 2, c: 1, ry: 4.4, s: 0.85 },
  // quelques palmiers isolés plus loin, au fond, pour ne pas laisser le haut vide
  { x: -3.0, z: -7.8, t: 2, c: 1, ry: 0.9, s: 0.8 }, { x: 1.8, z: -8.6, t: 0, c: 0, ry: 2.8, s: 0.85 },
  // à droite, sur la dune : deux palmiers qui se découpent sur le ciel
  { x: 7.4, z: -4.6, t: 1, c: 1, ry: 3.3, s: 0.9 }, { x: 8.8, z: -1.8, t: 0, c: 0, ry: 0.2, s: 0.85 },
]

const SHRUBS: [number, number, number][] = [[-5.2, -2.6, 0.55], [-9.0, -1.8, 0.6], [-10.6, -2.4, 0.5], [-6.9, -6.0, 0.6], [-5.4, -5.2, 0.45], [-9.6, -6.0, 0.55], [-7.4, 0.6, 0.45], [-5.0, -0.8, 0.5]]
const REEDS: [number, number, number][] = [[-6.5, -3.0, 0], [-10.0, -3.4, 1], [-7.2, -4.4, 2], [-10.0, -2.2, 3]]

/** Le bosquet : des palmiers dattiers (un tronc et une couronne chacun, deux formes de couronne), des tamaris, de l'herbe rase aux bords d'une petite mare, des roseaux, des pierres. */
export function Grove() {
  const geo = useMemo(() => {
    const trunks = TRUNKS.map(({ h, lean }) => trunkGeo(h, lean, 0.26, 0.15))
    const crowns = [3, 8].map((seed) => mergeFronds(crownFronds(seed, 9, 1.15).map((f) => f.m)))
    return { trunks, crowns, lake: new CircleGeometry(1, 40) }
  }, [])
  useEffect(() => () => { geo.trunks.forEach((g) => g.dispose()); geo.crowns.forEach((g) => g.dispose()); geo.lake.dispose() }, [geo])
  const rocks = useMemo(() => {
    const r = seeded(12)
    return Array.from({ length: 9 }, () => {
      const a = r() * Math.PI * 2, d = 1.2 + r() * 1.4
      return [LAKE.c[0] + Math.cos(a) * LAKE.rx * d, LAKE.c[1] + Math.sin(a) * LAKE.rz * d, 0.2 + r() * 0.3, r() * 6] as [number, number, number, number]
    })
  }, [])
  return (
    <>
      {PALMS.map(({ x, z, t, c, ry, s }, i) => {
        const { h, lean } = TRUNKS[t], y = groundY(x, z) - 0.05
        return (
          <group key={i} position={[x, y, z]} rotation-y={ry} scale={s}>
            <mesh geometry={geo.trunks[t]} material={O.bark} />
            <mesh geometry={geo.crowns[c]} material={i % 2 ? O.frond2 : O.frond} position={[lean[0], h, lean[1]]} rotation-y={ry * 2} />
          </group>
        )
      })}
      {SHRUBS.map(([x, z, k], i) => <Foliage key={i} v={i} p={[x, groundY(x, z) - 0.05, z]} s={[k * 1.1, k * 0.7, k]} ry={i} m={i % 2 ? O.shrub : O.shrubDark} style="clipped" shadow={false} />)}
      {rocks.map(([x, z, k, ry], i) => <Rock key={i} v={i} p={[x, groundY(x, z) - 0.06, z]} s={[k, k * 0.6, k * 0.8]} ry={ry} m={O.stone} shadow={false} />)}
      {REEDS.map(([x, z, seed]) => (
        <group key={seed} position={[x, groundY(x, z) - 0.05, z]}>
          {Array.from({ length: 7 }, (_, i) => (
            <group key={i} rotation-y={i * 0.9 + seed}>
              <Leaf kind="lance" w={0.05} l={0.9 + (i % 3) * 0.2} m={O.grass} p={[0, 0, 0.04]} r={[-1.15 - (i % 3) * 0.1, 0, 0]} />
            </group>
          ))}
        </group>
      ))}
      <mesh geometry={geo.lake} material={O.water} position={[LAKE.c[0], LAKE.y, LAKE.c[1]]} rotation-x={-Math.PI / 2} scale={[LAKE.rx, LAKE.rz, 1]} />
    </>
  )
}
