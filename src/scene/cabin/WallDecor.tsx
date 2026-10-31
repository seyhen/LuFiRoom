import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'
import { Batch, Part, rbox, type Item } from '../parts'
import { C } from './materials'
import { starGeo } from './ChristmasTree'

// Guirlande d'étoiles en papier sur le mur de gauche, au-dessus du sapin : un fil qui pend, neuf étoiles crème, or et rose pâle.
const SAG = (t: number) => 3.42 - 0.34 * Math.sin(Math.PI * t)
const at = (t: number) => new Vector3(-2.94, SAG(t), 3.05 - t * 1.65)
const string = new TubeGeometry(new CatmullRomCurve3(Array.from({ length: 24 }, (_, i) => at(i / 23))), 40, 0.008, 5, false)
const star = starGeo(0.1, 0.05, 0.018)
const COLORS = [0xfff1d6, 0xf4c75a, 0xfbd3dc]
// Chaque étoile pend à son fil par un bout de ficelle (3 à 6 cm) et une pince à linge en bois serrée sur le fil.
const DROP = (i: number) => 0.03 + (i % 3) * 0.015
const STARS: Item[] = Array.from({ length: 9 }, (_, i) => {
  const t = (i + 0.5) / 9, p = at(t)
  return { p: [p.x + 0.02, p.y - DROP(i) - 0.088, p.z], s: 1, r: [0, Math.PI / 2, 0], c: COLORS[i % 3] }
})
const TIES: Item[] = Array.from({ length: 9 }, (_, i) => {
  const p = at((i + 0.5) / 9)
  return { p: [p.x + 0.02, p.y - DROP(i) / 2, p.z], s: [0.005, DROP(i) / 2 + 0.01, 0.005] }
})
const PEGS: Item[] = Array.from({ length: 9 }, (_, i) => {
  const p = at((i + 0.5) / 9)
  return { p: [p.x + 0.02, p.y + 0.005, p.z], s: [0.018, 0.05, 0.03] }
})

/** Sur le mur de gauche : une guirlande d'étoiles en papier et une estampe de la forêt sous la neige. */
export function WallDecor() {
  return (
    <>
      <mesh geometry={string} material={C.wool} />
      <Batch geo={star} m={C.tint} items={STARS} />
      <Batch geo={rbox(2, 2, 2, 0.6)} m={C.wool} items={TIES} />
      <Batch geo={rbox(1, 1, 1, 0.3)} m={C.cut} items={PEGS} />
      <Part geo={rbox(0.06, 0.82, 0.66, 0.035)} m={C.beam} p={[-2.96, 2.75, 0.8]} />
      <mesh position={[-2.925, 2.75, 0.8]} rotation-y={Math.PI / 2} material={C.snowPrint} receiveShadow>
        <planeGeometry args={[0.56, 0.72]} />
      </mesh>
    </>
  )
}
