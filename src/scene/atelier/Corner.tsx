import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { PointLight } from 'three'
import { TAU, smooth } from '../../math'
import { mood } from '../anim'
import { Part, SPH, cyl, rbox } from '../parts'
import { Candle } from '../objects/Candle'
import { A } from './materials'
import { Cup } from './Kitchenette'
import { Leaf } from '../nature/Leaf'
import { Vines } from '../nature/Vines'

// Les dos de livres, rangée par rangée : chaque étagère a sa propre suite (tirée d'un hasard fixe), avec des livres penchés
// contre leur voisin, des trous, une pile couchée, et sur la tranche une bande de titre plus claire.
type Book = { x: number; w: number; h: number; d: number; m: keyof typeof A; tilt: number; lie?: boolean; lvl?: number; band: boolean }
const SPINES: (keyof typeof A)[] = ['prussian', 'terracotta', 'cream', 'sage', 'ochre', 'blush', 'white', 'prussian', 'sage', 'oakDark']
function shelfBooks(seed: number): Book[] {
  let r = seed * 9301 + 49297
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280)
  const out: Book[] = []
  let x = -0.64
  const stackAt = 0.05 + Math.floor(rnd() * 3) * 0.25
  while (x < 0.6) {
    // une pile de deux ou trois livres couchés, une fois par étagère
    if (out.length > 2 && x > -0.64 + stackAt && !out.some((b) => b.lie)) {
      const n = 2 + Math.floor(rnd() * 2)
      for (let k = 0; k < n; k++) out.push({ x: x + 0.13, w: 0.22 - k * 0.025, h: 0.035, d: 0.2 - k * 0.015, m: SPINES[Math.floor(rnd() * SPINES.length)], tilt: (rnd() - 0.5) * 0.3, lie: true, lvl: k, band: false })
      x += 0.28
      continue
    }
    const w = 0.035 + rnd() * 0.05, h = 0.22 + rnd() * 0.14
    if (x + w > 0.62) break
    out.push({ x: x + w / 2, w, h, d: 0.2 + rnd() * 0.07, m: SPINES[Math.floor(rnd() * SPINES.length)], tilt: 0, band: rnd() > 0.4 })
    x += w + 0.004
    // parfois un trou, et le livre suivant penche contre le précédent
    if (rnd() > 0.82 && x < 0.45) {
      const lw = 0.04 + rnd() * 0.03, lh = 0.24 + rnd() * 0.08, a = 0.32
      out.push({ x: x + 0.07, w: lw, h: lh, d: 0.22, m: SPINES[Math.floor(rnd() * SPINES.length)], tilt: a, band: true })
      x += 0.15
    }
  }
  return out
}
const SHELVES = [0.06, 0.64, 1.22].map((y, i) => ({ y, books: shelfBooks(i * 7 + 3) }))

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
      {SHELVES.map(({ y, books }, row) =>
        books.map((b, i) => {
          const k = `${row}-${i}`
          if (b.lie) {
            const lvl = b.lvl ?? 0
            return <Part key={k} geo={rbox(b.w, b.h, b.d, 0.01)} m={A[b.m] as typeof A.cream} p={[b.x, y + b.h / 2 + lvl * (b.h + 0.002), 0.06]} rotation-y={b.tilt} castShadow={false} />
          }
          // un livre penché pivote sur son coin bas : on remonte son centre pour que le coin reste sur la planche
          const cy = y + (b.h / 2) * Math.cos(b.tilt) + (b.w / 2) * Math.sin(b.tilt)
          return (
            <group key={k} position={[b.x, cy, 0.05]} rotation-z={-b.tilt}>
              <Part geo={rbox(b.w, b.h, b.d, 0.01)} m={A[b.m] as typeof A.cream} castShadow={false} />
              {b.band && <Part geo={rbox(b.w * 0.8, 0.03, 0.004, 0.002)} m={b.m === 'cream' || b.m === 'white' ? A.prussian : A.cream} p={[0, b.h * 0.22, b.d / 2 + 0.006]} castShadow={false} />}
            </group>
          )
        }),
      )}
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

// Le plaid du fauteuil, en pans successifs [x, y, largeur, hauteur, inclinaison z] (repère du fauteuil) : posé sur l'assise,
// il remonte contre l'accoudoir de gauche, passe dessus et retombe dehors jusqu'à mi-hauteur, frangé.
const THROW: [number, number, number, number, number][] = [[-0.09, 0.54, 0.34, 0.036, 0], [-0.272, 0.6, 0.036, 0.15, 0.3], [-0.36, 0.672, 0.17, 0.036, 0], [-0.452, 0.53, 0.036, 0.3, 0]]
function Throw() {
  return (
    <group position={[0, 0, 0.12]}>
      {THROW.map(([x, y, w, h, rz], i) => (
        <group key={i} position={[x, y, 0]} rotation-z={rz}>
          <Part geo={rbox(w, h, 0.42, 0.016)} m={A.cream} castShadow={i !== 1} />
          {/* deux bandes terre cuite qui font le tour du pan, un peu plus épaisses que lui */}
          {[-0.12, 0.12].map((z) => (
            <Part key={z} geo={rbox(w + (w < 0.05 ? 0.012 : -0.01), h + (h < 0.05 ? 0.012 : -0.01), 0.035, 0.012)} m={A.terracotta} p={[0, 0, z]} castShadow={false} />
          ))}
        </group>
      ))}
      {/* la frange, sous le pan qui pend */}
      {Array.from({ length: 9 }, (_, i) => (
        <Part key={i} geo={cyl(0.006, 0.004, 0.05, 4)} m={A.cream} p={[-0.452, 0.355, -0.18 + i * 0.045]} castShadow={false} />
      ))}
    </group>
  )
}

/** Le coin lecture : un fauteuil de velours ocre, un plaid, un guéridon et sa pile de livres, un lampadaire en arc. */
export function ReadingCorner() {
  return (
    <>
      <group position={[-1.15, 0, 2.15]} rotation-y={1.05}>
        {[[-0.3, -0.28], [0.3, -0.28], [-0.3, 0.28], [0.3, 0.28]].map(([x, z]) => (
          <Part key={`${x}${z}`} geo={cyl(0.03, 0.02, 0.16, 8)} m={A.oakDark} p={[x, 0.08, z]} rotation={[-z * 0.4, 0, x * 0.4]} />
        ))}
        <Part geo={rbox(0.82, 0.24, 0.76, 0.12)} m={A.ochre} p={[0, 0.3, 0]} />
        <Part geo={rbox(0.62, 0.12, 0.6, 0.06)} m={A.ochre} p={[0, 0.46, 0.06]} />
        <Part geo={SPH} m={A.ochre} scale={[0.44, 0.42, 0.14]} p={[0, 0.72, -0.3]} rotation-x={-0.12} />
        {[-1, 1].map((s) => (
          <Part key={s} geo={rbox(0.14, 0.3, 0.7, 0.07)} m={A.ochre} p={[s * 0.36, 0.5, 0.02]} />
        ))}
        <Part geo={rbox(0.36, 0.3, 0.12, 0.08)} m={A.prussian} p={[0.08, 0.66, -0.18]} rotation={[-0.2, 0, 0.15]} />
        <Throw />
      </group>
      <group position={[-2.2, 0, 2.55]}>
        <Part geo={cyl(0.22, 0.22, 0.03, 22)} m={A.oak} p={[0, 0.6, 0]} />
        <Part geo={cyl(0.025, 0.035, 0.6, 8)} m={A.oakDark} p={[0, 0.3, 0]} />
        <Part geo={cyl(0.15, 0.17, 0.02, 18)} m={A.oakDark} p={[0, 0.01, 0]} castShadow={false} />
        {[[0.28, 0.04, A.terracotta], [0.24, 0.035, A.cream], [0.22, 0.04, A.prussian]].map(([w, h, m], i) => (
          <Part key={i} geo={rbox(w as number, h as number, 0.18, 0.01)} m={m as typeof A.cream} p={[0, 0.635 + i * 0.04, 0]} rotation-y={i * 0.25} castShadow={false} />
        ))}
        <Cup p={[0.12, 0.742, 0.06]} m={A.blush} ry={-0.6} />
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
      {/* appuyée au mur de gauche (x = -3) : le pied à -2,62, le sommet contre le mur */}
      <group position={[-2.62, 0, 2.95]} rotation-z={0.18}>
        {[-0.2, 0.2].map((z) => (
          <Part key={z} geo={cyl(0.025, 0.025, 1.9, 8)} m={A.oak} p={[0, 0.95, z]} />
        ))}
        {[0.4, 0.85, 1.3, 1.7].map((y) => (
          <Part key={y} geo={cyl(0.018, 0.018, 0.42, 6)} m={A.oak} p={[0, y, 0]} rotation-x={Math.PI / 2} castShadow={false} />
        ))}
        {/* deux plaids jetés sur un barreau : un pan devant, un pan derrière, étroits pour ne pas toucher les montants */}
        {([[1.3, 0.44, A.terracotta], [0.85, 0.3, A.cream]] as const).map(([y, drop, m]) => (
          // l'échelle est penchée de +0,18 : on contre-tourne autour du barreau pour que le tissu pende à la verticale
          <group key={y} position={[0, y, 0]} rotation-z={-0.18}>
            <Part geo={rbox(0.12, 0.028, 0.34, 0.012)} m={m} p={[0, 0.03, 0]} castShadow={false} />
            <Part geo={rbox(0.022, drop, 0.34, 0.01)} m={m} p={[0.052, 0.03 - drop / 2, 0]} castShadow={false} />
            <Part geo={rbox(0.022, drop * 0.78, 0.34, 0.01)} m={m} p={[-0.052, 0.03 - (drop * 0.78) / 2, 0]} castShadow={false} />
          </group>
        ))}
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
            return <Part key={k} geo={cyl(0.008, 0.008, drop, 5)} m={A.paper} p={[Math.cos(a) * 0.06, -drop / 2, Math.sin(a) * 0.06]} castShadow={false} />
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
        {/* deux montants bas aux bouts ; entre eux les toiles se tiennent debout, serrées comme des disques dans un bac */}
        {[-0.48, 0.48].map((z) => (
          <Part key={z} geo={rbox(0.5, 0.36, 0.04, 0.015)} m={A.oakDark} p={[0, 0.21, z]} />
        ))}
        {([[A.white, 0.62], [A.prussian, 0.8], [A.oak, 0.56], [A.terracotta, 0.74], [A.white, 0.66], [A.cream, 0.84], [A.prussian, 0.6]] as const).map(([m, h], i) => (
          <Part key={i} geo={rbox(0.44, h, 0.035, 0.012)} m={m} p={[0, h / 2 + 0.07, -0.4 + i * 0.133]} rotation={[(i % 2 ? 1 : -1) * 0.05, 0, 0]} />
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
