import { TAU } from '../../math'
import { Part, SPH, cyl, rbox } from '../parts'
import { Candle } from '../objects/Candle'
import { A } from './materials'

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
      {Array.from({ length: 16 }, (_, i) => (
        <Part key={i} geo={SPH} m={i % 3 ? A.leaf : A.leafDark} scale={[0.04, 0.012, 0.035]} p={[0.35 + Math.cos(i * 2.2) * 0.12, 2.55 - (i % 6) * 0.13, 0.1 + Math.sin(i * 2.2) * 0.06 + (i % 6) * 0.02]} rotation={[0.6, i, 0.3]} castShadow={false} />
      ))}
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
          {Array.from({ length: 14 }, (_, k) => (
            <Part key={k} geo={SPH} m={k % 3 ? A.leaf : A.leafDark} scale={[0.04, 0.012, 0.035]} p={[Math.cos(k * 2.3) * 0.12, -drop + 0.02 - (k % 5) * 0.08, Math.sin(k * 2.3) * 0.12]} rotation={[0.5, k, 0.2]} castShadow={false} />
          ))}
        </group>
      ))}
    </>
  )
}

/** Le coin de droite : un grand figuier dans un panier, des toiles retournées contre un carton à dessin. */
export function CanvasCorner() {
  return (
    <>
      <group position={[2.7, 0, 2.55]}>
        <Part geo={cyl(0.3, 0.25, 0.42, 22)} m={A.basket} p={[0, 0.21, 0]} />
        <Part geo={cyl(0.03, 0.045, 1.25, 8)} m={A.oakDark} p={[0, 0.95, 0]} rotation-z={0.06} />
        {Array.from({ length: 15 }, (_, i) => {
          const a = i * 2.4, h = 0.85 + (i % 5) * 0.17, r = 0.12 + (i % 3) * 0.06
          return <Part key={i} geo={SPH} m={i % 2 ? A.leaf : A.leafDark} scale={[0.11, 0.03, 0.15]} p={[Math.cos(a) * r, h, Math.sin(a) * r]} rotation={[0.5, a, 0.2]} />
        })}
      </group>
      <group position={[2.55, 0, 1.3]} rotation-y={-0.3}>
        {[[0, 0.75, 0.6, A.white], [0.06, 0.6, 0.5, A.oak], [0.12, 0.9, 0.7, A.white]].map(([dz, h, w, m], i) => (
          <Part key={i} geo={rbox(0.03, h as number, w as number, 0.01)} m={m as typeof A.white} p={[0.12 - i * 0.05, (h as number) / 2, dz as number]} rotation-z={0.18 + i * 0.02} />
        ))}
        <Part geo={rbox(0.04, 0.7, 0.95, 0.02)} m={A.prussian} p={[-0.12, 0.35, 0.05]} rotation-z={0.12} />
      </group>
    </>
  )
}
