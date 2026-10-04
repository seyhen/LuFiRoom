import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { PointLight } from 'three'
import { TAU, smooth } from '../../math'
import { mood } from '../anim'
import { Part, SPH, cyl, rbox } from '../parts'
import { Candle } from '../objects/Candle'
import { A } from './materials'
import { Leaf } from '../nature/Leaf'
import { Vines } from '../nature/Vines'

// Dos de livres d'art, d'une étagère à l'autre : [largeur, hauteur, couleur].
const BOOKS: [number, number, keyof typeof A][] = [[0.06, 0.32, 'prussian'], [0.05, 0.28, 'terracotta'], [0.08, 0.34, 'cream'], [0.05, 0.3, 'sage'], [0.07, 0.26, 'ochre'], [0.05, 0.33, 'blush'], [0.09, 0.3, 'white']]

/** La bibliothèque basse à gauche de la verrière : livres d'art, bocaux, une plante qui retombe, une bougie. */
export function Bookcase() {
  return (
    <group position={[-2.2, 0, -2.75]}>
      {/* le meuble : un fond, deux côtés, le dessus */}
      <Part geo={rbox(1.45, 2.4, 0.04, 0.015)} m={A.white} p={[0, 1.2, -0.17]} />
      {[-0.71, 0.71].map((x) => (
        <Part key={x} geo={rbox(0.04, 2.4, 0.38, 0.015)} m={A.white} p={[x, 1.2, 0]} />
      ))}
      <Part geo={rbox(1.49, 0.05, 0.4, 0.02)} m={A.white} p={[0, 2.42, 0]} />
      {[0.04, 0.62, 1.2, 1.78, 2.36].map((y) => (
        <Part key={y} geo={rbox(1.37, 0.04, 0.34, 0.01)} m={A.oak} p={[0, y, 0.03]} castShadow={false} />
      ))}
      {[0.06, 0.64, 1.22].map((y, row) => {
        let z = -0.62
        return BOOKS.concat(BOOKS.slice(0, 3 + row)).map(([w, h, c], i) => {
          const x = z + w / 2
          z += w + 0.01
          return x < 0.62 ? <Part key={`${row}${i}`} geo={rbox(w, h, 0.26, 0.01)} m={A[c] as typeof A.cream} p={[x, y + h / 2, 0.05]} castShadow={false} /> : null
        })
      })}
      {/* l'étagère du haut : bocaux de pigments et une bougie */}
      {[[-0.45, A.ochre], [-0.25, A.terracotta], [-0.05, A.prussian]].map(([x, m], i) => (
        <group key={i} position={[x as number, 1.8, 0.05]}>
          <Part geo={cyl(0.06, 0.06, 0.16, 14)} m={A.glass} p={[0, 0.08, 0]} castShadow={false} />
          <Part geo={cyl(0.055, 0.055, 0.08, 14)} m={m as typeof A.cream} p={[0, 0.04, 0]} castShadow={false} />
        </group>
      ))}
      <Candle position={[0.3, 1.8, 0.05]} holder="jar" height={0.1} radius={0.035} />
      {/* une plante qui retombe du haut du meuble */}
      <Part geo={cyl(0.12, 0.09, 0.16, 16)} m={A.pot} p={[0.35, 2.48, 0.02]} />
      <Vines p={[0.35, 2.55, 0.02]} strands={[[0.04, 0.13, 0.7], [-0.09, 0.11, 0.5], [0.11, 0.08, 0.9]]} m={A.leafV} m2={A.leafVDark} size={0.075} seed={5} />
    </group>
  )
}

/** Le chevalet et son aquarelle des toits, à moitié finie ; la boîte de couleurs et un pinceau dans un pot. */
export function Easel() {
  return (
    <group position={[2.35, 0, -0.85]} rotation-y={-0.45}>
      <Part geo={cyl(0.02, 0.025, 1.9, 8)} m={A.oakDark} p={[-0.32, 0.92, 0]} rotation-z={-0.12} />
      <Part geo={cyl(0.02, 0.025, 1.9, 8)} m={A.oakDark} p={[0.32, 0.92, 0]} rotation-z={0.12} />
      <Part geo={cyl(0.02, 0.025, 1.7, 8)} m={A.oakDark} p={[0, 0.82, -0.32]} rotation-x={0.35} />
      <Part geo={rbox(0.78, 0.04, 0.08, 0.015)} m={A.oakDark} p={[0, 0.7, 0.04]} />
      <group position={[0, 1.15, 0.06]} rotation-x={-0.08}>
        <Part geo={rbox(0.62, 0.8, 0.03, 0.01)} m={A.white} />
        <mesh material={A.painting} position={[0, 0, 0.017]}>
          <planeGeometry args={[0.58, 0.76]} />
        </mesh>
      </group>
      <group position={[0.18, 0.74, 0.08]}>
        <Part geo={rbox(0.24, 0.03, 0.12, 0.01)} m={A.white} />
        {[A.prussian, A.terracotta, A.ochre, A.sage].map((m, i) => (
          <Part key={i} geo={cyl(0.015, 0.015, 0.01, 10)} m={m} p={[-0.08 + i * 0.05, 0.02, 0]} castShadow={false} />
        ))}
      </group>
    </group>
  )
}

/** Le coin lecture : un fauteuil de velours ocre, un plaid, un guéridon et sa pile de livres, un lampadaire en arc. */
export function ReadingCorner() {
  return (
    <>
      <group position={[-1.15, 0, 2.15]} rotation-y={1.05}>
        {[[-0.3, -0.28], [0.3, -0.28], [-0.3, 0.28], [0.3, 0.28]].map(([x, z]) => (
          <Part key={`${x}${z}`} geo={cyl(0.03, 0.02, 0.16, 8)} m={A.oakDark} p={[x, 0.08, z]} rotation={[z * 0.4, 0, -x * 0.4]} />
        ))}
        <Part geo={rbox(0.82, 0.24, 0.76, 0.12)} m={A.ochre} p={[0, 0.3, 0]} />
        <Part geo={rbox(0.62, 0.12, 0.6, 0.06)} m={A.ochre} p={[0, 0.46, 0.06]} />
        <Part geo={SPH} m={A.ochre} scale={[0.44, 0.42, 0.14]} p={[0, 0.72, -0.3]} rotation-x={-0.12} />
        {[-1, 1].map((s) => (
          <Part key={s} geo={rbox(0.14, 0.3, 0.7, 0.07)} m={A.ochre} p={[s * 0.36, 0.5, 0.02]} />
        ))}
        <Part geo={rbox(0.36, 0.3, 0.12, 0.08)} m={A.prussian} p={[0.08, 0.66, -0.18]} rotation={[-0.2, 0, 0.15]} />
        <Part geo={rbox(0.5, 0.03, 0.42, 0.015)} m={A.cream} p={[-0.05, 0.54, 0.15]} rotation={[0.06, 0.3, -0.05]} />
      </group>
      <group position={[-2.2, 0, 2.55]}>
        <Part geo={cyl(0.22, 0.22, 0.03, 22)} m={A.oak} p={[0, 0.6, 0]} />
        <Part geo={cyl(0.025, 0.035, 0.6, 8)} m={A.oakDark} p={[0, 0.3, 0]} />
        <Part geo={cyl(0.15, 0.17, 0.02, 18)} m={A.oakDark} p={[0, 0.01, 0]} castShadow={false} />
        {[[0.28, 0.04, A.terracotta], [0.24, 0.035, A.cream], [0.22, 0.04, A.prussian]].map(([w, h, m], i) => (
          <Part key={i} geo={rbox(w as number, h as number, 0.18, 0.01)} m={m as typeof A.cream} p={[0, 0.635 + i * 0.04, 0]} rotation-y={i * 0.25} castShadow={false} />
        ))}
        <Part geo={cyl(0.045, 0.04, 0.08, 14)} m={A.blush} p={[0.12, 0.77, 0.08]} castShadow={false} />
      </group>
      {/* le lampadaire à abat-jour de lin, derrière le fauteuil */}
      <group position={[-1.75, 0, 2.95]}>
        <Part geo={cyl(0.15, 0.17, 0.04, 20)} m={A.steel} p={[0, 0.02, 0]} />
        <Part geo={cyl(0.014, 0.014, 1.5, 6)} m={A.brass} p={[0, 0.77, 0]} />
        <Part geo={cyl(0.2, 0.24, 0.3, 22)} m={A.lampShade} p={[0, 1.58, 0]} />
        <FloorLampLight />
      </group>
    </>
  )
}

/** Tapis berbère au milieu, et une échelle de bois contre le mur où sèchent deux plaids. */
export function RugAndLadder() {
  return (
    <>
      <mesh material={A.rug} position={[0.35, 0.008, 0.55]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[3.0, 2.25]} />
      </mesh>
      {[-1, 1].map((s) =>
        Array.from({ length: 12 }, (_, i) => (
          <Part key={`${s}${i}`} geo={cyl(0.01, 0.01, 0.1, 4)} m={A.cream} p={[0.35 + s * 1.53, 0.01, 0.55 - 1.0 + i * 0.18]} rotation-z={Math.PI / 2} castShadow={false} />
        )),
      )}
      <group position={[-2.75, 0, 2.95]} rotation-z={-0.18}>
        {[-0.2, 0.2].map((z) => (
          <Part key={z} geo={cyl(0.025, 0.025, 1.9, 8)} m={A.oak} p={[0, 0.95, z]} />
        ))}
        {[0.4, 0.85, 1.3, 1.7].map((y) => (
          <Part key={y} geo={cyl(0.018, 0.018, 0.42, 6)} m={A.oak} p={[0, y, 0]} rotation-x={Math.PI / 2} castShadow={false} />
        ))}
        <Part geo={rbox(0.08, 0.6, 0.42, 0.03)} m={A.terracotta} p={[0.02, 1.15, 0]} castShadow={false} />
        <Part geo={rbox(0.07, 0.5, 0.42, 0.03)} m={A.cream} p={[0.03, 0.62, 0]} castShadow={false} />
      </group>
    </>
  )
}

/** Deux plantes suspendues devant la verrière, à des crochets du linteau. */
export function HangingPlants() {
  return (
    <>
      {[[-0.75, 0.7], [2.45, 0.55]].map(([x, drop], i) => (
        <group key={i} position={[x, 3.98, -2.8]}>
          {[0, 1, 2].map((k) => {
            const a = (k / 3) * TAU
            return <Part key={k} geo={cyl(0.004, 0.004, drop, 4)} m={A.paper} p={[Math.cos(a) * 0.06, -drop / 2, Math.sin(a) * 0.06]} castShadow={false} />
          })}
          <Part geo={SPH} m={i ? A.terracotta : A.cream} scale={[0.13, 0.1, 0.13]} p={[0, -drop - 0.05, 0]} />
          <Vines p={[0, -drop + 0.03, 0]} strands={i ? [[0.1, 0.05, 0.45], [-0.08, 0.07, 0.3], [0.02, -0.1, 0.55]] : [[0.09, 0.06, 0.35], [-0.1, -0.02, 0.5], [0.0, 0.11, 0.25], [0.05, -0.09, 0.4]]} m={A.leafV} m2={A.leafVDark} size={0.065} crown={7} seed={i + 8} />
        </group>
      ))}
    </>
  )
}

/** Le coin de droite : un grand figuier dans un panier, des toiles rangées dans leur casier. */
export function CanvasCorner() {
  return (
    <>
      <group position={[2.7, 0, 2.55]}>
        <Part geo={cyl(0.3, 0.25, 0.42, 22)} m={A.basket} p={[0, 0.21, 0]} />
        <Part geo={cyl(0.03, 0.045, 1.25, 8)} m={A.oakDark} p={[0, 0.95, 0]} rotation-z={0.06} />
        {/* un caoutchouc (ficus elastica) : grandes feuilles vernies, les jeunes plus claires en haut */}
        {Array.from({ length: 16 }, (_, i) => {
          const a = i * 2.4, h = 0.62 + i * 0.062
          return (
            <group key={i} position={[0, h, 0]} rotation-y={a}>
              <Part geo={cyl(0.007, 0.009, 0.08, 5)} m={A.oakDark} p={[0, 0.0, 0.035]} rotation-x={1.1} castShadow={false} />
              <Leaf kind="ovate" p={[0, 0.02, 0.07]} r={[-0.25 - (i % 3) * 0.12, 0, (i % 2 ? 1 : -1) * 0.1]} w={0.075} l={0.24 - (i > 12 ? 0.06 : 0)} m={i > 11 ? A.rubberLight : A.rubber} shadow={i % 2 === 0} />
            </group>
          )
        })}
      </group>
      {/* le casier à toiles : un socle, deux montants, des séparations ; les toiles y sont rangées debout, de face ou retournées */}
      <group position={[2.45, 0, 1.4]} rotation-y={-0.2}>
        <Part geo={rbox(0.5, 0.06, 1.0, 0.02)} m={A.oakDark} p={[0, 0.03, 0]} />
        {[-0.48, 0.48].map((z) => (
          <Part key={z} geo={rbox(0.5, 0.55, 0.04, 0.015)} m={A.oakDark} p={[0, 0.3, z]} />
        ))}
        {[-0.24, 0, 0.24].map((z) => (
          <Part key={z} geo={rbox(0.04, 0.4, 0.02, 0.008)} m={A.oak} p={[0.22, 0.25, z]} castShadow={false} />
        ))}
        {([[-0.36, 0.75, 0.62, A.white], [-0.12, 0.6, 0.5, A.oak], [0.12, 0.9, 0.72, A.prussian], [0.36, 0.7, 0.55, A.white]] as const).map(([z, h, w, m], i) => (
          <Part key={i} geo={rbox(w, h, 0.03, 0.01)} m={m} p={[-0.02, h / 2 + 0.06, z]} rotation={[0, Math.PI / 2, (i % 2 ? 1 : -1) * 0.06]} />
        ))}
      </group>
    </>
  )
}

/** La lumière chaude du lampadaire, le soir : elle fait un cocon autour du fauteuil. */
function FloorLampLight() {
  const l = useRef<PointLight>(null!)
  useFrame(() => void (l.current.intensity = smooth(mood.night) * 1.5 * Math.PI)) // × π : voir materials.ts
  return <pointLight ref={l} color={0xffbf78} intensity={0} distance={7} decay={1.4} position={[0.3, 1.35, -0.3]} />
}
