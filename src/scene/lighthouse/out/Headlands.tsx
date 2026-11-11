import { useMemo } from 'react'
import { Shape, ShapeGeometry } from 'three'
import { Static } from '../../Static'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../../parts'
import { Rock } from '../../nature/Rock'
import { S } from './materials'
import { SEA, ringGeo } from './Sea'

// Le fond du phare : des falaises qui sortent de la mer derrière la pièce (le haut gauche de l'écran était un aplat de mer et de
// ciel), un voilier au large. Les falaises se posent à 8 à 10 du centre, sinon `skyFade` les efface.

/** Une falaise : une base large, un second étage plus étroit et décalé, un dessus d'herbe rase, un éboulis dans l'eau. */
/** L'écume au pied d'une falaise : sans elle la roche se fond dans la brume et semble flotter au-dessus de l'eau. */
function CliffFoam({ p, w, i }: { p: [number, number]; w: number; i: number }) {
  const g = useMemo(() => ringGeo(w * 0.8, 0.3 + w * 0.12, i * 2.3 + 1), [w, i])
  return <mesh geometry={g} position={[p[0], SEA + 0.02, p[1]]} material={S.foam} renderOrder={3} raycast={noRay} />
}

function Cliff({ p, w, h, ry = 0, v = 0, far = false }: { p: [number, number]; w: number; h: number; ry?: number; v?: number; far?: boolean }) {
  const [x, z] = p
  const rock = far ? S.rockFar : S.rock, grass = far ? S.grassFar : S.grass, weed = far ? S.weedFar : S.weed
  return (
    <group position={[x, SEA, z]} rotation-y={ry}>
      <Rock v={v} p={[0, -0.6, 0]} s={[w, h * 0.62, w * 0.9]} m={rock[v % 3]} shadow={false} />
      <Rock v={v + 3} p={[-w * 0.18, h * 0.3, w * 0.05]} s={[w * 0.66, h * 0.55, w * 0.58]} ry={0.7} m={rock[(v + 1) % 3]} moss={grass} shadow={false} />
      <Rock v={v + 5} p={[w * 0.5, -0.4, w * 0.55]} s={[w * 0.32, h * 0.2, w * 0.3]} ry={1.9} m={rock[(v + 2) % 3]} moss={weed} shadow={false} />
      <Rock v={v + 1} p={[-w * 0.62, -0.5, w * 0.5]} s={[w * 0.22, h * 0.14, w * 0.22]} ry={0.4} m={rock[v % 3]} shadow={false} />
    </group>
  )
}

/** [x, z, largeur, hauteur, rotation, forme] */
const CLIFFS: [number, number, number, number, number, number][] = [
  [-9.8, -1.4, 1.2, 2.8, 0.4, 1],
  [-7.2, -7.2, 1.3, 3.0, 1.2, 4],
  [-10.8, 3.4, 0.9, 1.6, 0.9, 2],
]

/** Le grand fond (grand écran) : des falaises plus hautes à 12 à 16 du centre, de la gauche au fond puis à droite. */
const FAR_CLIFFS: [number, number, number, number, number, number][] = [
  [-14.2, -1.5, 2.0, 3.8, 0.6, 3],
  [-12.4, -8.0, 2.2, 4.2, 1.5, 5],
  [-6.0, -12.8, 2.0, 3.6, 2.4, 0],
  [0.4, -14.4, 2.2, 3.8, 0.2, 7],
  [12.6, -10.2, 2.0, 3.4, 2.8, 4],
]

/** La voile triangulaire, dans le plan (x, y) : bord d'attaque vertical, bord de fuite en biais. */
const sailGeo = (() => {
  const s = new Shape()
  s.moveTo(0, 0); s.lineTo(0, 1); s.quadraticCurveTo(0.48, 0.5, 0.52, 0.04); s.lineTo(0, 0)
  return new ShapeGeometry(s, 8)
})()

/** Un voilier au large : coque, cabine, mât, grand-voile et foc. */
function Sailboat({ p, ry }: { p: V3; ry: number }) {
  return (
    <group position={p} rotation-y={ry}>
      <Part geo={SPH} m={S.hull} p={[0, 0.1, 0]} scale={[0.62, 0.2, 0.22]} castShadow={false} />
      <Part geo={rbox(0.3, 0.1, 0.16, 0.04)} m={S.white} p={[-0.04, 0.33, 0]} castShadow={false} />
      <Part geo={cyl(0.014, 0.014, 1.5, 6)} m={S.iron} p={[0.06, 0.88, 0]} castShadow={false} />
      <mesh geometry={sailGeo} material={S.sail} position={[0.0, 0.3, 0]} scale={[1.0, 1.35, 1]} />
      <mesh geometry={sailGeo} material={S.sailRed} position={[0.12, 0.33, 0]} scale={[0.7, 0.9, 1]} rotation-y={Math.PI} />
    </group>
  )
}

export function Headlands() {
  return (
    <>
      <Static>
        {CLIFFS.map(([x, z, w, h, ry, v], i) => <Cliff key={i} p={[x, z]} w={w} h={h} ry={ry} v={v} />)}
        {FAR_CLIFFS.map(([x, z, w, h, ry, v], i) => <Cliff key={`f${i}`} p={[x, z]} w={w} h={h} ry={ry} v={v} far />)}
        <Sailboat p={[-7.6, SEA + 0.02, 1.4]} ry={0.5} />
      </Static>
      {[...CLIFFS, ...FAR_CLIFFS].map(([x, z, w], i) => <CliffFoam key={i} p={[x, z]} w={w} i={i} />)}
    </>
  )
}
